/* =====================================================================================================
   r543: CONTINUE A CO-OP RUN. While you play a co-op run, your game keeps a note of it (door, modifiers, your health
   and items, who you were with). Back in the multiplayer lobby, whoever makes the room can tick "Continue our co-op
   run": everyone who gets in starts together and is taken straight to that door, each with their own health and items
   from that run. Escaping, or the whole team going down, ends the run (and clears the note), same as a solo run.
   ===================================================================================================== */
const CSK='doorsCoop1',CONT={cn:0,host:0,t0:0,done:0,shown:0};
function cLoad(){try{const d=JSON.parse(localStorage.getItem(CSK)||'null');if(!d||!(d.n>=2&&d.n<EXN)||Date.now()-(d.t||0)>7*864e5)return null;return d}catch(e){return null}}
function cClear(){try{localStorage.removeItem(CSK)}catch(e){}}
setInterval(()=>{try{if(!(MP.on&&mpOpen().length&&mpSeed))return;if(!(state=='play'||state=='paused'||state=='keypad'||state=='spec'))return;if(HUB.on||(DAILY&&DAILY.on)||(typeof GON=='function'&&GON())||dbgCheat)return;if(n<2||n>=EXN)return;
 const mates=mpOpen().map(p=>fsName(p.name||'Player')).filter(Boolean).slice(0,3);
 localStorage.setItem(CSK,JSON.stringify({n:Math.min(EXN-1,typeof mpLatest=='function'?mpLatest():n),mods:Object.keys(MODS||{}),hp:Math.ceil(hp),inv,fb,lf,mates,t:Date.now(),b:BUILD}))}catch(e){}},3000);
/* the run ending (you escaped, or the last of you went down) clears it, like the solo save */
{const rc0=runClear;runClear=function(){cClear();return rc0.apply(this,arguments)}}
/* the option in the MAKE A ROOM panel */
function cContHtml(){const c=cLoad();if(!c)return '';return '<label style="display:block;margin:10px 0;cursor:pointer;background:#1a2a1a;border:2px solid #6ad89a;border-radius:8px;padding:8px"><input type="checkbox" id="hcont" style="vertical-align:middle;margin-right:6px">▶ <b>Continue our co-op run</b>: door '+c.n+(c.mates&&c.mates.length?' with '+c.mates.map(esc).join(', '):'')+((c.mods||[]).length?'<div style="font-size:12px;opacity:.75">Modifiers: '+esc(modsTxt(c.mods))+' (the run\'s own modifiers are used)</div>':'')+'</label>'}
{const hc0=hubElCreate;hubElCreate=function(e){const r=hc0.apply(this,arguments);try{if(e.st)e.st.cn=HUB.contN|0;if(HUB.contN)hint('▶ Your room continues your co-op run from door '+HUB.contN+'. Everyone who gets in goes straight there.')}catch(x){}return r}}
/* while you are in a room, remember whether it is a continue room */
setInterval(()=>{try{if(!HUB.on||HUB.myE==null)return;const st=hubElSt(HUBEL[HUB.myE]);if(!st)return;CONT.cn=st.cn|0;CONT.host=st.host===SV.pid?1:0;CONT.done=0;CONT.t0=0;
 if(CONT.cn&&!CONT.shown&&!CONT.host){CONT.shown=1;const c=cLoad();hint('▶ This room continues a co-op run from door '+CONT.cn+'.'+(c&&Math.abs(c.n-CONT.cn)<=3?' You will keep your health and items from it.':''))}}catch(e){}},700);
function cRestore(){const c=cLoad();if(!c)return;try{const iv={};for(const k in (c.inv||{}))iv[k]=svInt(c.inv[k],999);for(const k of['f','n','r'])if(k in iv)iv[k]=Math.min(1,iv[k]);inv=Object.assign(inv||{},iv);hp=Math.max(1,Math.min(100,nz(c.hp,100)));fb=inv.f?Math.max(0,Math.min(100,nz(c.fb,100))):0;lf=inv.n?Math.max(0,Math.min(100,nz(c.lf,100))):0;updHud()}catch(e){}}
/* off we go: once the run has started, the room's owner takes everyone to the saved door */
setInterval(()=>{try{if(!CONT.cn||CONT.done||HUB.on)return;if(state!='play')return;if(n>=CONT.cn){CONT.done=1;return}
 if(!CONT.t0){CONT.t0=Date.now();return}if(Date.now()-CONT.t0<2500)return;
 if(!r8Co()){CONT.done=1;const k=CONT.cn;n=k;build();cRestore();hint('▶ Back to door '+k+'.');return}
 if(!CONT.host)return;CONT.done=1;const k=CONT.cn;mpWarpTo(k);cRestore();mpSend({t:'cw',s:mpS(),n:k,gs:gsPackAll(MP.gs||{})});sysLine('▶ Continuing the co-op run from door '+k+'.')}catch(e){conLog('error','co-op continue: '+e.message)}},500);
{const mm1=mpMsg;mpMsg=function(key,o){if(o&&o.t=='cw'){try{if((o.s|0)!==(mpSeed|0)||MP.host)return;const k=Math.max(0,Math.min(EXN-1,o.n|0));const g=gsClean(o.gs);if(g)for(const kk in g)if(+kk>0)MP.gs[kk]=g[kk];CONT.done=1;if(k>n){mpWarpTo(k);cRestore();hint('▶ Continuing the co-op run from door '+n+'.')}}catch(e){conLog('error','co-op continue: '+e.message)}return}return mm1.apply(this,arguments)}}
