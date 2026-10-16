/* =====================================================================================================
   r569: PRESTIGE. Reach Living Legend and the ops board offers PRESTIGE: you start again at Private with a ✪ next to
   your name (✪1, ✪2 ...). A prestiged soldier outranks everyone: every perk of every rank (restricted zone, X-13,
   launch codes, general office, airstrikes, orbital strike, the police leaving you alone ...). The climb back up
   unlocks ✪ PRESTIGE OPERATIONS: harder jobs that pay more. Climb to Living Legend again for the next prestige.
   ===================================================================================================== */
const milPr=()=>{try{return milSV().pr|0}catch(e){return 0}};
const milMyNm=()=>{const S=milSV(),p=S.pr|0;return(p?'✪'+p+' ':'')+milRankNm(S.r)};
function prLocs(q,n,seed){const L=(q.locs||[]).filter(l=>l&&!/^Stunt/i.test(l.nm||'')&&isFinite(l.x)&&isFinite(l.z)&&!milArea(l.x,l.z,-40)&&Math.hypot(l.x-450,l.z+800)>250);let s=seed||Date.now()%9973;const r=()=>{s=(s*16807)%2147483647;return s/2147483647};
 const A=L.slice();for(let i=A.length-1;i>0;i--){const j=r()*(i+1)|0;[A[i],A[j]]=[A[j],A[i]]}return A.slice(0,n)}
const prBeaconTick=(need,why)=>function(q,o,dt){o.t-=dt;if(o.t<=0)milOpFail(q,o,why||'Out of time.');const b=o.bc&&o.bc[o.n];const v=q.seat&&q.seat.v;if(b&&v&&need(v)&&Math.hypot(v.x-b[0],v.z-b[1])<8){o.n++;snd(800,.08);milBeaconOff(q,o,o.n-1);if(o.n>=o.bc.length)milOpDone(q,o)}};
const prRingTick=function(q,o,dt){o.t-=dt;if(o.t<=0)milOpFail(q,o,'Out of time.');const r=o.rg&&o.rg[o.n];if(r&&q.seat&&q.seat.v.K.plane){const v=q.seat.v;if(Math.hypot(v.x-r[0],v.z-r[1])<14&&Math.abs(v.y-r[2])<9){o.n++;snd(900,.1);r.m.visible=false;if(o.n>=o.rg.length)milOpDone(q,o)}}};
const prWpB=(q,o)=>{const b=o.bc&&o.bc[o.n];return b?[b[0],b[1],'✪ BEACON '+(o.n+1)+'/'+o.bc.length]:null},prWpR=(q,o)=>{const r=o.rg&&o.rg[o.n];return r?[r[0],r[1],'✪ RING '+(o.n+1)+'/'+o.rg.length+' ('+r[2]+' m up)']:null};
MILOPS.push(
 {id:'p_patrol',pr:1,nm:'✪ Desert patrol',ic:'🚙',min:2,xp:250,d:'Any vehicle. Six checkpoint beacons at landmarks all over the desert, in order, inside six minutes.',
  start(q,o){o.n=0;o.t=360;const L=prLocs(q,6);milBeacons(q,o,L.map(l=>[l.x+9,l.z+9]));o.nm=L.map(l=>l.nm)},line(q,o){return'✪ 🚙 Beacon '+(o.n+1)+'/6'+(o.nm&&o.nm[o.n]?' by '+o.nm[o.n]:'')+' · any vehicle · '+Math.ceil(o.t)+'s'},tick:prBeaconTick(v=>true),wp:prWpB,end(q,o){milBeaconsClear(q,o)}},
 {id:'p_range',pr:1,nm:'✪ Marksman',ic:'🎯',min:3,xp:220,d:'Seven targets on the berm from a tank on the firing line, in 75 seconds.',
  start(q,o){o.t=75;o.n=0;milRangeUp(q,o,7);o.ok=1},line(q,o){return'✪ 🎯 Targets down '+o.n+'/7 · FIRING LINE · '+Math.ceil(o.t)+'s'},tick(q,o,dt){o.t-=dt;if(o.t<=0)milOpFail(q,o,'Time.');if(o.n>=7)milOpDone(q,o)},end(q,o){milRangeDown(q)}},
 {id:'p_blitz',pr:1,nm:'✪ Blitz clearance',ic:'🚧',min:5,xp:260,d:'All four barricades on the access road and the east highway, flattened with a tank, in two and a half minutes.',
  start(q,o){o.t=150;o.n=0;o.ok=1;milBarricades(q,o,[[560,-960],[560,-1000],[500,-1010],[430,-1010]])},line(q,o){return'✪ 🚧 Barricades '+o.n+'/4 · '+Math.ceil(o.t)+'s'},tick(q,o,dt){o.t-=dt;if(o.t<=0)milOpFail(q,o,'Too slow.');if(o.n>=4)milOpDone(q,o)},end(q,o){milTargetsClear(q)}},
 {id:'p_recon',pr:1,nm:'✪ Deep recon',ic:'✈️',min:6,xp:320,d:'Any plane. Eight recon rings over landmarks across the whole map, in order, inside seven minutes.',
  start(q,o){o.n=0;o.t=420;const L=prLocs(q,8,(Date.now()/1000|0)%997+7);milRings(q,o,L.map((l,i)=>[Math.round(l.x),Math.round(l.z),55+(i*13)%40]))},line(q,o){const r=o.rg[o.n];return'✪ ✈️ Ring '+(o.n+1)+'/8'+(r?' ('+r[2]+' m up)':'')+' · '+Math.ceil(o.t)+'s'},tick:prRingTick,wp:prWpR},
 {id:'p_iron',pr:1,nm:'✪ Iron patrol',ic:'🪖',min:9,xp:300,d:'In a TANK: the six perimeter checkpoints round the inside of the base wall, in order, inside three minutes.',
  start(q,o){o.n=0;o.t=180;milBeacons(q,o,[[470,-892],[350,-762],[480,-748],[580,-740],[585,-868],[520,-880]])},line(q,o){return'✪ 🪖 Checkpoint '+(o.n+1)+'/6 in a TANK · '+Math.ceil(o.t)+'s'},tick:prBeaconTick(v=>!!v.K.tank),wp:prWpB,end(q,o){milBeaconsClear(q,o)}},
 {id:'p_grand',pr:1,nm:'✪ Grand tour',ic:'🗺️',min:12,xp:420,d:'Any vehicle. Ten landmarks all over the desert, in order, inside nine minutes. The longest drive the army has.',
  start(q,o){o.n=0;o.t=540;const L=prLocs(q,10,(Date.now()/1000|0)%991+3);milBeacons(q,o,L.map(l=>[l.x+9,l.z+9]));o.nm=L.map(l=>l.nm)},line(q,o){return'✪ 🗺️ Landmark '+(o.n+1)+'/10'+(o.nm&&o.nm[o.n]?': '+o.nm[o.n]:'')+' · '+Math.ceil(o.t)+'s'},tick:prBeaconTick(v=>true),wp:prWpB,end(q,o){milBeaconsClear(q,o)}},
 {id:'p_ace',pr:1,nm:'✪ Ace of aces',ic:'🛩️',min:13,xp:500,d:'Any plane. Ten rings, some of them low, all over the map, inside six minutes.',
  start(q,o){o.n=0;o.t=360;const L=prLocs(q,10,(Date.now()/1000|0)%983+11);milRings(q,o,L.map((l,i)=>[Math.round(l.x),Math.round(l.z),i%3==0?28:60+(i*17)%35]))},line(q,o){const r=o.rg[o.n];return'✪ 🛩️ Ring '+(o.n+1)+'/10'+(r?' ('+r[2]+' m up)':'')+' · '+Math.ceil(o.t)+'s'},tick:prRingTick,wp:prWpR});
/* the ops board: prestige jobs first (and every old job, since a prestiged soldier has every perk), plus the PRESTIGE button */
{const ol=milOpsList;milOpsList=function(r){const S=milSV(),p=S.pr|0;let L;try{L=ol.call(this,p?Math.max(r,MILRANK.length-1):r).filter(o=>!o.pr)}catch(e){L=[]}
  if(p){const pj=MILOPS.filter(o=>o.pr&&o.min<=(S.r|0));L=pj.concat(L)}
  if((S.r|0)>=MILRANK.length-1)L.unshift({id:'_prestige',ic:'✪',nm:'PRESTIGE '+(p+1),xp:0,min:MILRANK.length-1,d:'Start again at Private as ✪'+(p+1)+'. You keep EVERY perk of every rank, your X-13, your refits and your badges, and you unlock new ✪ prestige operations as you climb back up.'});return L}}
{const os0=milOpStart;milOpStart=function(q,id){if(id!=='_prestige')return os0.apply(this,arguments);const S=milSV(),p=(S.pr|0)+1;
  milDlg(q,'✪ PRESTIGE '+p,'<p>Start again at <b>Private</b> as <b style="color:#ff9ad8">✪'+p+'</b>?</p><p style="font-size:13px;opacity:.85">You keep every perk of every rank (you outrank everyone), your X-13 and refits, and your badges. Your XP goes back to 0 and new ✪ prestige operations unlock as you climb.</p>',[['yes','✪ PRESTIGE NOW'],['no','Not yet']],b=>{if(b!='yes')return;S.pr=p;S.r=2;S.xp=0;S.bc=1;S.bl=[];S.lost=null;milSave();try{badge('prestige')}catch(e){}snd(660,.15);setTimeout(()=>snd(880,.15),150);setTimeout(()=>snd(1320,.3),320);try{abuseBanner('✪ PRESTIGE '+p,'Private ✪'+p+' · you outrank everyone')}catch(e){}try{sysLine('✪ '+(SV.nm||'A player')+' reached PRESTIGE '+p+' at Fort Blackout!')}catch(e){}try{xmNet(q,'milr',{r:milRank()})}catch(e){}})}}
/* reaching Living Legend tells you about prestige */
{const mx0=milXP;milXP=function(q){const S=milSV(),was=S.r|0;const r=mx0.apply(this,arguments);try{if((S.r|0)>=MILRANK.length-1&&was<MILRANK.length-1)setTimeout(()=>hint('✪ You can now PRESTIGE: open the OPS BOARD. Start again at Private with every perk you have earned, and new ✪ operations.'),2500)}catch(e){}return r}}
/* staff: /rank prestige 2 sets a prestige level */
{const ra0=rkApply;rkApply=function(arg){const m=String(arg||'').trim().match(/^(?:prestige|p|✪)\s*(\d+)$/i);if(!m)return ra0.apply(this,arguments);const S=milSV();S.pr=Math.max(0,Math.min(99,+m[1]|0));milSave();return{ok:1,m:S.pr?'Prestige set to ✪'+S.pr+'.':'Prestige removed.'}}}
{const rf0=rkFind;rkFind=function(a){if(/^(?:prestige|p|✪)\s*\d+$/i.test(String(a||'').trim()))return 0;return rf0.apply(this,arguments)}}
try{BD.push(['prestige','✪','Prestige','Prestige at Fort Blackout: start again from Private with every perk.']);BDIDX.prestige=BD[BD.length-1];BDI.push('prestige')}catch(e){}
