/* The Durable Object behind the DOORS server. One instance ("main") holds every connection.
   It uses the WebSocket hibernation API, so when nobody is sending anything it sleeps and costs nothing; everything
   it must remember about a socket is kept in that socket's attachment, and retained notes live in storage. */

const REG_T = 'doorsfan-q7k2/v1/reg/';
const OWNER_PUBS = [
  { x: '_DkyzzJmgfU94Rcvk1UARiy79z3w9q2eNZT-8eugMlQ', y: 'tjdXcqU9lzBxUpVHzI1zBRahubvsDr26T5yc0EBd-08' },
  { x: '_X70TqXfnMzsNF4Y1xBnMDI0ny4UlQMkymGOHdR5Vl8', y: 'dUoZI1fcEW1q1qor62QMc1_tk9AoFT9WWsOGUc7uUxM' }
];
const UIDRE = /^U-[A-Z2-9]{4}-[A-Z2-9]{4}$/;
const B32 = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const KICK_MS = 10 * 60 * 1000;
const MAX_MSG = 64 * 1024, MAX_TOPIC = 200, MAX_SUBS = 64, RATE = 80; /* messages per second per socket */

/* ---------- the same canonical JSON, ID fingerprint and signature checks the game uses ---------- */
const TE = s => new TextEncoder().encode(s);
const canon = o => o === null || typeof o != 'object' ? JSON.stringify(o) : Array.isArray(o) ? '[' + o.map(canon).join(',') + ']' : '{' + Object.keys(o).sort().map(k => JSON.stringify(k) + ':' + canon(o[k])).join(',') + '}';
function ub64(s) { s = String(s || '').replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; const b = atob(s), a = new Uint8Array(b.length); for (let i = 0; i < b.length; i++)a[i] = b.charCodeAt(i); return a }
async function uidOf(x, y) { const h = new Uint8Array(await crypto.subtle.digest('SHA-256', TE('doorsid:' + x + '.' + y))); let o = '', v = 0, bits = 0; for (const b of h) { v = ((v << 8) | b) & 0xffff; bits += 8; while (bits >= 5 && o.length < 8) { o += B32[(v >> (bits - 5)) & 31]; bits -= 5 } if (o.length >= 8) break } return 'U-' + o.slice(0, 4) + '-' + o.slice(4, 8) }
const VK = new Map();
async function verify(x, y, s, sig) {
  if (typeof x != 'string' || typeof y != 'string' || typeof sig != 'string' || x.length > 60 || y.length > 60 || sig.length > 120) return false;
  try { let k = VK.get(x + y); if (!k) { k = await crypto.subtle.importKey('jwk', { kty: 'EC', crv: 'P-256', x, y, ext: true }, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']); VK.set(x + y, k) } return await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, k, ub64(sig), TE(s)) } catch (e) { return false }
}
const regBody = r => 'doorsreg|' + canon({ v: r.v, own: r.own, adm: r.adm, exa: r.exa || {}, ban: r.ban, unb: r.unb, earn: r.earn ? 1 : 0 });
const admBody = a => 'doorsadm|' + canon({ t: a.t, u: a.u, by: a.by, at: a.at, why: a.why || '', n: a.n || '' });
const kickBody = k => 'doorskick|' + canon({ u: k.u, by: k.by, at: k.at, why: k.why || '' });
function regClean(r) {
  if (!r || typeof r != 'object') return null; const o = { v: +r.v || 0, own: Array.isArray(r.own) ? r.own.filter(u => UIDRE.test(u)).slice(0, 20) : [], adm: {}, exa: {}, ban: {}, unb: {}, earn: r.earn ? 1 : 0, sig: String(r.sig || '').slice(0, 120) };
  const nm = x => String(x || '').slice(0, 24), wy = x => String(x || '').slice(0, 80);
  for (const u in (r.adm || {})) if (UIDRE.test(u) && Object.keys(o.adm).length < 300) o.adm[u] = { n: nm(r.adm[u].n), at: +r.adm[u].at || 0 };
  for (const u in (r.ban || {})) if (UIDRE.test(u) && Object.keys(o.ban).length < 3000) o.ban[u] = { n: nm(r.ban[u].n), at: +r.ban[u].at || 0, why: wy(r.ban[u].why) };
  for (const u in (r.unb || {})) if (UIDRE.test(u) && Object.keys(o.unb).length < 3000) o.unb[u] = +r.unb[u] || 0;
  for (const u in (r.exa || {})) if (UIDRE.test(u) && Object.keys(o.exa).length < 300) o.exa[u] = +r.exa[u] || 0;
  return o
}
/* MQTT-style topic matching: + is one level, # is the rest */
function match(filter, topic) {
  if (filter === topic) return true; const f = filter.split('/'), t = topic.split('/');
  for (let i = 0; i < f.length; i++) { if (f[i] === '#') return true; if (i >= t.length) return false; if (f[i] !== '+' && f[i] !== t[i]) return false }
  return f.length === t.length
}

export class Hub {
  constructor(ctx, env) {
    this.ctx = ctx; this.env = env; this.loaded = null;
    this.ret = new Map();        /* retained notes: topic -> text */
    this.reg = { v: 0, own: [], adm: {}, exa: {}, ban: {}, unb: {} }; this.adm = {};
    this.ips = {};               /* uid -> [ip, ...] (last 8 seen) */
    this.blk = {};               /* temporary kick blocks: 'u:<uid>' or 'i:<ip>' -> until (ms) */
    this.peers = new Map();      /* peerjs id -> websocket (rebuilt from attachments after a sleep) */
    try { this.ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair('{"o":"ping"}', '{"o":"pong"}')) } catch (e) { }
  }
  /* ---------- storage ---------- */
  load() {
    if (!this.loaded) this.loaded = (async () => {
      const st = this.ctx.storage;
      const r = await st.list({ prefix: 'r:' }); for (const [k, v] of r) this.ret.set(k.slice(2), v);
      this.reg = (await st.get('reg')) || this.reg; this.adm = (await st.get('adm')) || {}; this.ips = (await st.get('ips')) || {}; this.blk = (await st.get('blk')) || {};
      for (const ws of this.ctx.getWebSockets()) { const a = this.att(ws); if (a && a.k == 'pj' && a.pid) this.peers.set(a.pid, ws) }
    })();
    return this.loaded
  }
  att(ws) { try { return ws.deserializeAttachment() || {} } catch (e) { return {} } }
  setAtt(ws, a) { try { ws.serializeAttachment(a) } catch (e) { } }
  save(k, v) { this.ctx.storage.put(k, v).catch(() => { }) }

  /* ---------- who is banned ---------- */
  isStaff(u) { return (this.reg.own || []).includes(u) || !!(this.reg.adm && this.reg.adm[u]) }
  banOf(u) {
    if (!u || (this.reg.own || []).includes(u)) return null;
    const ob = this.reg.ban && this.reg.ban[u], ou = (this.reg.unb && this.reg.unb[u]) || 0;
    if (ob && ob.at > ou) return { why: ob.why || '', by: 'the owner' };
    const a = this.adm[u]; if (a && a.t == 'ban' && a.at > ou && this.admValid(a)) return { why: a.why || '', by: 'an admin' };
    return null
  }
  admValid(a) { const R = this.reg; return !!(R.adm && (R.adm[a.by] || (R.exa && R.exa[a.by] && a.at < R.exa[a.by])) && !(R.own || []).includes(a.u) && !R.adm[a.u]) }
  ipBanned(ip) {
    if (!ip) return null; const now = Date.now();
    if ((this.blk['i:' + ip] || 0) > now) return { why: 'kicked', kick: 1 };
    for (const u in this.ips) if (this.ips[u].includes(ip)) { const b = this.banOf(u); if (b) return Object.assign({ u }, b) }
    return null
  }
  /* why this socket may not stay (null if it may) */
  refusal(a) {
    if (a.u && this.isStaff(a.u)) return null;
    if (a.u) { const b = this.banOf(a.u); if (b) return { ban: 1, why: b.why, by: b.by }; if ((this.blk['u:' + a.u] || 0) > Date.now()) return { kick: 1, why: 'You were kicked by staff. You can come back in a few minutes.' } }
    const ib = this.ipBanned(a.ip); if (ib) return ib.kick ? { kick: 1, why: 'You were kicked by staff. You can come back in a few minutes.' } : { ban: 1, why: ib.why, by: ib.by, conn: 1 };
    return null
  }
  remember(u, ip) { if (!u || !ip) return; const l = this.ips[u] || (this.ips[u] = []); if (l[0] === ip) return; const i = l.indexOf(ip); if (i >= 0) l.splice(i, 1); l.unshift(ip); if (l.length > 8) l.length = 8; this.save('ips', this.ips) }
  /* after the registry changes: anybody connected who is now banned goes */
  sweep() {
    for (const ws of this.ctx.getWebSockets()) { const a = this.att(ws); if (!a.k) continue; if (a.k == 'b' && !a.hi) continue; const r = this.refusal(a); if (r) this.refuse(ws, a, r) }
  }
  refuse(ws, a, r) {
    try { if (a.k == 'b') ws.send(JSON.stringify(r.ban ? { o: 'ban', why: r.why || '', by: r.by || '', conn: r.conn ? 1 : 0 } : { o: 'kick', why: r.why || '' })); else ws.send(JSON.stringify({ type: 'ERROR', payload: { msg: r.ban ? 'banned' : 'kicked' } })) } catch (e) { }
    try { ws.close(4003, r.ban ? 'banned' : 'kicked') } catch (e) { }
    if (a.k == 'b' && a.will) this.publish(a.will.t, a.will.m, !!a.will.r, null);
    if (a.k == 'pj' && a.pid) this.peers.delete(a.pid)
  }

  /* ---------- the registry, read off the board ---------- */
  async regIn(text) {
    let r; try { r = JSON.parse(text) } catch (e) { return false }
    const c = regClean(r); if (!c || c.v <= (this.reg.v || 0)) return false;
    let ok = false; for (const o of OWNER_PUBS.concat(globalThis.__DOORS_TEST_OWNER ? [globalThis.__DOORS_TEST_OWNER] : [])) if (await verify(o.x, o.y, regBody(c), c.sig)) { ok = true; break }
    if (!ok) return false; this.reg = c; this.save('reg', c); return true
  }
  async admIn(text) {
    let a; try { a = JSON.parse(text) } catch (e) { return false }
    if (!a || typeof a != 'object' || !UIDRE.test(String(a.u || '')) || !UIDRE.test(String(a.by || '')) || (a.t != 'ban' && a.t != 'unban')) return false;
    const o = { t: a.t, u: a.u, by: a.by, at: +a.at || 0, why: String(a.why || '').slice(0, 80), n: String(a.n || '').slice(0, 24), x: String(a.x || ''), y: String(a.y || ''), sig: String(a.sig || '') };
    const cur = this.adm[o.u]; if (cur && cur.at >= o.at) return false;
    if (await uidOf(o.x, o.y) !== o.by) return false; if (!await verify(o.x, o.y, admBody(o), o.sig)) return false;
    this.adm[o.u] = o; this.save('adm', this.adm); return true
  }

  /* ---------- the board ---------- */
  publish(t, m, retain, from) {
    if (retain) { if (m === '' || m == null) { this.ret.delete(t); this.ctx.storage.delete('r:' + t).catch(() => { }) } else { this.ret.set(t, m); this.save('r:' + t, m) } }
    if (m === '' && !retain) return;
    const out = JSON.stringify({ o: 'msg', t, m: m == null ? '' : m });
    for (const ws of this.ctx.getWebSockets()) { const a = this.att(ws); if (a.k != 'b' || !a.hi || !a.subs) continue; if (a.subs.some(f => match(f, t))) try { ws.send(out) } catch (e) { } }
  }
  async boardMsg(ws, a, d) {
    if (d.type == 'HEARTBEAT') return;
    if (d.o == 'hi') {
      if (a.hi) return; let u = '';
      if (d.x && d.y && d.s && a.n) { const uu = await uidOf(String(d.x), String(d.y)); if (await verify(String(d.x), String(d.y), 'doorssrv|' + a.n, String(d.s))) u = uu }
      a.u = u; a.hi = 1; a.pid = String(d.p || '').slice(0, 40); a.nm = String(d.nm || '').slice(0, 24); this.remember(u, a.ip);
      const r = this.refusal(a); if (r) { this.setAtt(ws, a); this.refuse(ws, a, r); return }
      if (d.will && typeof d.will.t == 'string' && d.will.t.length <= MAX_TOPIC) a.will = { t: d.will.t, m: String(d.will.m || '').slice(0, MAX_MSG), r: d.will.r ? 1 : 0 };
      this.setAtt(ws, a); ws.send(JSON.stringify({ o: 'ok', u, staff: u && this.isStaff(u) ? 1 : 0 })); return
    }
    if (!a.hi) return;
    if (d.o == 'sub') {
      const ts = (Array.isArray(d.t) ? d.t : [d.t]).filter(t => typeof t == 'string' && t.length <= MAX_TOPIC); a.subs = a.subs || [];
      for (const t of ts) if (!a.subs.includes(t) && a.subs.length < MAX_SUBS) a.subs.push(t); this.setAtt(ws, a);
      /* send the retained notes that match */for (const [rt, m] of this.ret) if (ts.some(f => match(f, rt))) try { ws.send(JSON.stringify({ o: 'msg', t: rt, m, r: 1 })) } catch (e) { }
      return
    }
    if (d.o == 'uns') { const ts = Array.isArray(d.t) ? d.t : [d.t]; a.subs = (a.subs || []).filter(t => !ts.includes(t)); this.setAtt(ws, a); return }
    if (d.o == 'pub') {
      const t = d.t, m = d.m == null ? '' : String(d.m); if (typeof t != 'string' || !t || t.length > MAX_TOPIC || t.includes('+') || t.includes('#') || m.length > MAX_MSG) return;
      if (t.startsWith(REG_T)) {
        /* the ban registry: only signed copies get stored or passed on */
        let changed = false; if (t === REG_T + 'core') changed = await this.regIn(m); else if (t.startsWith(REG_T + 'a/')) changed = await this.admIn(m);
        if (!changed) { if (d.id) ws.send(JSON.stringify({ o: 'puback', id: d.id })); return }
        this.publish(t, m, true, ws); this.sweep();
      } else this.publish(t, m, !!d.r, ws);
      if (d.id) try { ws.send(JSON.stringify({ o: 'puback', id: d.id })) } catch (e) { }
      return
    }
    if (d.o == 'bye') { a.will = null; this.setAtt(ws, a); return }
    if (d.o == 'kick') { await this.kick(ws, a, d); return }
    if (d.o == 'who') {/* staff: who is online (names, IDs) */if (!a.u || !this.isStaff(a.u)) return; const L = []; for (const w of this.ctx.getWebSockets()) { const b = this.att(w); if (b.k == 'b' && b.hi) L.push({ u: b.u || '', p: b.pid || '', nm: b.nm || '' }) } ws.send(JSON.stringify({ o: 'who', l: L.slice(0, 300) })); return }
  }
  async kick(ws, a, d) {
    const k = { u: String(d.u || ''), by: String(d.by || ''), at: +d.at || 0, why: String(d.why || '').slice(0, 80) };
    const no = m => { try { ws.send(JSON.stringify({ o: 'kickr', ok: 0, m })) } catch (e) { } };
    if (!UIDRE.test(k.u) || !UIDRE.test(k.by)) return no('That is not a user ID.');
    if (Math.abs(Date.now() - k.at) > 5 * 60 * 1000) return no('That kick is out of date.');
    if (await uidOf(String(d.x), String(d.y)) !== k.by || !await verify(String(d.x), String(d.y), kickBody(k), String(d.s))) return no('Could not check who sent the kick.');
    const own = (this.reg.own || []).includes(k.by), adm = !!(this.reg.adm && this.reg.adm[k.by]);
    if (!own && !adm) return no('Only the owner and admins can kick.');
    if ((this.reg.own || []).includes(k.u) || (!own && this.reg.adm[k.u])) return no('You cannot kick that player.');
    /* a kick is for the device only (a ban is device AND connection): so family/school wifi is not caught by a kick */const until = Date.now() + KICK_MS; this.blk['u:' + k.u] = until;
    for (const key in this.blk) if (this.blk[key] < Date.now()) delete this.blk[key]; this.save('blk', this.blk);
    let n = 0; const why = 'You were kicked by staff' + (k.why ? ': ' + k.why : '') + '. You can come back in 10 minutes.';
    for (const w of this.ctx.getWebSockets()) { const b = this.att(w); if (b.k == 'b' && b.u === k.u) { n++; this.refuse(w, b, { kick: 1, why }) } }
    /* everyone else's game drops them from co-op and the lobby */
    const note = JSON.stringify({ o: 'kicked', u: k.u });
    for (const w of this.ctx.getWebSockets()) { const b = this.att(w); if (b.k == 'b' && b.hi && b.u !== k.u) try { w.send(note) } catch (e) { } }
    try { ws.send(JSON.stringify({ o: 'kickr', ok: 1, n })) } catch (e) { }
  }

  /* ---------- PeerJS signalling (the PeerServer protocol) ---------- */
  pjMsg(ws, a, d) {
    if (!d || typeof d != 'object') return; const type = d.type;
    if (type == 'HEARTBEAT') return;
    if (['OFFER', 'ANSWER', 'CANDIDATE', 'LEAVE', 'EXPIRE'].includes(type) && typeof d.dst == 'string') {
      const to = this.peers.get(d.dst);
      if (to && to.readyState === 1) { try { to.send(JSON.stringify({ type, src: a.pid, dst: d.dst, payload: d.payload })) } catch (e) { } }
      else if (type != 'LEAVE' && type != 'EXPIRE') { try { ws.send(JSON.stringify({ type: 'EXPIRE', src: d.dst, dst: a.pid })) } catch (e) { } }
    }
  }

  /* ---------- the plumbing ---------- */
  async fetch(req) {
    await this.load(); const url = new URL(req.url); const ip = req.headers.get('x-doors-ip') || '';
    if (url.pathname == '/peerjs/id') return new Response(Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2), { headers: { 'Access-Control-Allow-Origin': '*' } });
    if (url.pathname.startsWith('/peerjs/') && url.pathname != '/peerjs/peerjs') return new Response('[]', { headers: { 'Access-Control-Allow-Origin': '*', 'content-type': 'application/json' } });
    if (req.headers.get('Upgrade') !== 'websocket') return new Response('Expected a WebSocket', { status: 426 });
    const pair = new WebSocketPair(); const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server);
    if (url.pathname == '/ws') {
      const n = crypto.randomUUID(); const a = { k: 'b', ip, n, hi: 0, subs: [], t0: Date.now() }; this.setAtt(server, a);
      server.send(JSON.stringify({ o: 'nonce', n }));
    } else {
      const pid = String(url.searchParams.get('id') || '').slice(0, 64), a = { k: 'pj', ip, pid };
      const r = this.refusal(a);
      if (r) { this.setAtt(server, a); server.send(JSON.stringify({ type: 'ERROR', payload: { msg: r.ban ? 'You are banned.' : 'You were kicked. Try again in a few minutes.' } })); server.close(4003, 'refused') }
      else if (!pid) { server.send(JSON.stringify({ type: 'ERROR', payload: { msg: 'No id' } })); server.close(4000, 'no id') }
      else if (this.peers.has(pid) && this.peers.get(pid).readyState === 1) { server.send(JSON.stringify({ type: 'ID-TAKEN', payload: { msg: 'ID is taken' } })); server.close(4000, 'taken') }
      else { this.setAtt(server, a); this.peers.set(pid, server); server.send(JSON.stringify({ type: 'OPEN' })) }
    }
    return new Response(null, { status: 101, webSocket: client })
  }
  async webSocketMessage(ws, msg) {
    await this.load(); const a = this.att(ws); if (!a.k) return;
    if (typeof msg != 'string' || msg.length > MAX_MSG + 512) return;
    /* a simple rate limit */const now = Date.now(); if ((a.rt || 0) > now - 1000) { a.rn = (a.rn || 0) + 1; if (a.rn > RATE) { if (a.rn == RATE + 1) this.setAtt(ws, a); return } } else { a.rt = now; a.rn = 1 }
    let d; try { d = JSON.parse(msg) } catch (e) { return }
    if (a.k == 'b') await this.boardMsg(ws, a, d); else this.pjMsg(ws, a, d);
  }
  async webSocketClose(ws, code, reason) { await this.load(); this.gone(ws); try { ws.close(1000, 'bye') } catch (e) { } }
  async webSocketError(ws) { await this.load(); this.gone(ws) }
  gone(ws) {
    const a = this.att(ws); if (a.gone) return; a.gone = 1; this.setAtt(ws, a);
    if (a.k == 'b' && a.hi && a.will) this.publish(a.will.t, a.will.m, !!a.will.r, null);
    if (a.k == 'pj' && a.pid && this.peers.get(a.pid) === ws) this.peers.delete(a.pid);
  }
}
