/* =====================================================================================================
   r574: SAVES THAT STICK, MAP WAYPOINTS, REAL FALLING.
   - A lot of progress was written into the save but never read back when the game loaded: the lost DOORS keys,
     Wraith refits, prestige, the parked Wraith, meteorite fragments, postcards, stunt jumps, chests, records ...
     They all load now.
   - The desert map (small and big) shows where your job wants you: the current waypoint as a pin, the next
     checkpoints as numbered dots, and an arrow on the edge of the small map when it is off it. The compass too.
   - Falling: walk off a ledge and you fall, faster and faster, until you land (with a thump if it was a long way).
   ===================================================================================================== */
/* ---------- saves ---------- */
{const SVB=['xk','met','fallsC','gcave','gfell','grave','gtTr','zip','skEye','pcdAll','pyrH','pyrT','xrob','penBall','skipBest'];
 window.svExtras=function(q){if(!q||typeof q!='object')return;
  for(const k of SVB)if(q[k]!=null){const v=Math.max(0,Math.min(1e7,+q[k]|0));if(v)SV[k]=v}
  if(+q.xlap>0&&+q.xlap<1e5)SV.xlap=+q.xlap;
  if(q.pcd&&typeof q.pcd=='object'){SV.pcd={};for(const k in q.pcd)if(/^\d{1,2}$/.test(k)&&q.pcd[k])SV.pcd[k]=1}
  if(q.xst&&typeof q.xst=='object'){SV.xst={};for(const k of Object.keys(q.xst).slice(0,40))if(/^[\w '!.-]{1,30}$/.test(k)&&q.xst[k])SV.xst[k]=1}
  if(Array.isArray(q.mbook))SV.mbook=q.mbook.filter(x=>typeof x=='string').map(x=>x.slice(0,14)).slice(0,6);
  if(q.dsr)SV.dsr=1;if(typeof q.dynD=='string')SV.dynD=q.dynD.slice(0,24);if(typeof q.wtTag=='string')SV.wtTag=q.wtTag.slice(0,12);
  if(q.jl&&typeof q.jl=='object'&&/^(pen|jail)$/.test(q.jl.k))SV.jl={k:q.jl.k,t:Math.max(1,Math.min(36000,q.jl.t|0)),b:Math.max(0,q.jl.b|0)};
  if(q.mine&&typeof q.mine=='object')SV.mine={bars:Math.max(0,Math.min(1e6,q.mine.bars|0)),ore:Math.max(0,Math.min(1e6,q.mine.ore|0)),shifts:Math.max(0,Math.min(1e6,q.mine.shifts|0)),tut:q.mine.tut?1:0,earned:Math.max(0,Math.min(1e9,q.mine.earned|0)),up:{}};if(q.mine&&q.mine.up&&typeof q.mine.up=='object'){for(const k of Object.keys(q.mine.up).slice(0,20))if(/^\w{1,10}$/.test(k))SV.mine.up[k]=Math.max(0,Math.min(5,q.mine.up[k]|0))}
  const m=q.mil;if(m&&typeof m=='object'&&SV.mil){SV.mil.pr=Math.max(0,Math.min(99,m.pr|0));SV.mil.wk=Math.max(0,Math.min(6,m.wk|0));SV.mil.bayPark=m.bayPark?1:0;SV.mil.cwSeen=m.cwSeen?1:0;SV.mil.ngSeen=m.ngSeen?1:0;SV.mil.spawn=m.spawn=='office'?'office':'';if(Array.isArray(m.btr))SV.mil.btr=m.btr.filter(t=>t&&typeof t.id=='string').slice(0,20).map(t=>({id:t.id.slice(0,40),nm:String(t.nm||'Player').slice(0,16)}));if(m.awv&&typeof m.awv=='object'){SV.mil.awv={};for(const k of Object.keys(m.awv).slice(0,20))if(/^\w{1,12}$/.test(k)&&m.awv[k])SV.mil.awv[k]=1}
   if(m.rzv&&typeof m.rzv=='object'){SV.mil.rzv={};for(const k of Object.keys(m.rzv).slice(0,30))if(/^\w{1,12}$/.test(k)&&m.rzv[k])SV.mil.rzv[k]=1}}};
 const sa0=svApply;svApply=function(d){const r=sa0.apply(this,arguments);try{svExtras(d&&d.s)}catch(e){try{conLog('error','save extras: '+e.message)}catch(x){}}return r};
 /* the game already loaded the save before this ran: read the extras back from it now */try{const raw=localStorage.getItem(SAVE_KEY);if(raw)svExtras(JSON.parse(raw).s)}catch(e){}}
/* ---------- waypoints on the map ---------- */
function wpList(q){const L=[];try{const M=q.mil;if(M&&M.wp&&isFinite(M.wp[0]))L.push({x:M.wp[0],z:M.wp[1],t:String(M.wp[2]||''),main:1});const o=M&&M.op;
  if(o&&o.bc)for(let i=(o.n|0)+1;i<o.bc.length&&i<(o.n|0)+12;i++)L.push({x:o.bc[i][0],z:o.bc[i][1],n:i+1});
  if(o&&o.rg)for(let i=(o.n|0)+1;i<o.rg.length&&i<(o.n|0)+12;i++)L.push({x:o.rg[i][0],z:o.rg[i][1],n:i+1,air:1})}catch(e){}
 try{for(const w of(typeof mnWps=='function'?mnWps(q):[]))L.push(w)}catch(e){}return L}
function wpPin(x,px,py,s,lab,full,t){x.save();x.translate(px,py);const pu=1+Math.sin(t*4)*.12;x.strokeStyle='rgba(255,216,64,.85)';x.lineWidth=2;x.beginPath();x.arc(0,0,(full?15:11)*pu,0,7);x.stroke();
 x.fillStyle='#ffd840';x.strokeStyle='#2a1a06';x.lineWidth=2;x.beginPath();x.moveTo(0,0);x.bezierCurveTo(-s*.9,-s*1.1,-s*.7,-s*2.1,0,-s*2.1);x.bezierCurveTo(s*.7,-s*2.1,s*.9,-s*1.1,0,0);x.fill();x.stroke();x.fillStyle='#2a1a06';x.beginPath();x.arc(0,-s*1.45,s*.32,0,7);x.fill();
 if(full&&lab){x.font='bold 13px Georgia';const tw=x.measureText(lab).width+12;x.fillStyle='rgba(36,24,10,.88)';x.beginPath();if(x.roundRect)x.roundRect(-tw/2,-s*2.1-24,tw,18,6);else x.rect(-tw/2,-s*2.1-24,tw,18);x.fill();x.fillStyle='#ffe9a0';x.textAlign='center';x.textBaseline='middle';x.fillText(lab,0,-s*2.1-14.5)}x.restore()}
{const dd0=dmapDraw;dmapDraw=function(q,cv,cx,cz,sc,full){const r=dd0.apply(this,arguments);try{const L=wpList(q);if(!L.length)return r;const x=cv.getContext('2d'),W=cv.width,H=cv.height,X=wx=>W/2+(wx-cx)*sc,Y=wz=>H/2+(wz-cz)*sc,t=q.rt||0;x.save();
  /* the route: dashed line through what is left */const pts=L.filter(w=>w.main||w.n);if(pts.length>1){x.setLineDash([6,5]);x.strokeStyle='rgba(255,216,64,.7)';x.lineWidth=full?2.5:2;x.beginPath();pts.forEach((w,i)=>{i?x.lineTo(X(w.x),Y(w.z)):x.moveTo(X(w.x),Y(w.z))});x.stroke();x.setLineDash([])}
  for(const w of L.slice().reverse()){if(w.main)continue;const px=X(w.x),py=Y(w.z);if(px<-10||py<-10||px>W+10||py>H+10)continue;x.fillStyle=w.air?'#40c0ff':'#40e080';x.strokeStyle='#102010';x.lineWidth=2;x.beginPath();x.arc(px,py,full?8:6,0,7);x.fill();x.stroke();if(w.n!=null){x.fillStyle='#08200c';x.font='bold '+(full?10:8)+'px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText(w.n,px,py+.5)}}
  const m=L.find(w=>w.main)||L[0];let px=X(m.x),py=Y(m.z);const R=W/2-14,dx=px-W/2,dy=py-H/2,dd=Math.hypot(dx,dy);
  if(!full&&dd>R){/* off the small map: an arrow on the rim pointing at it */const a=Math.atan2(dy,dx);x.save();x.translate(W/2+Math.cos(a)*R,H/2+Math.sin(a)*R);x.rotate(a);x.fillStyle='#ffd840';x.strokeStyle='#2a1a06';x.lineWidth=2;x.beginPath();x.moveTo(10,0);x.lineTo(-6,-8);x.lineTo(-2,0);x.lineTo(-6,8);x.closePath();x.fill();x.stroke();x.restore()}
  else{if(full){px=Math.max(14,Math.min(W-14,px));py=Math.max(40,Math.min(H-6,py))}wpPin(x,px,py,full?11:8,m.t?m.t.replace(/^the /,''):'',full,t)}x.restore()}catch(e){}return r}}
/* ---------- falling ---------- */
function grvTick(q,dt){const F=q.fall||(q.fall={y:null,vy:0,x:0,z:0,air:0});
 if(state!='bus'||!q.roam||q.seat||q.inBus||q.fling||q.lift||q.deep||q.abd||q.rsp||q.xr||q.icut||q.jail||q.court||q.bcut){F.y=null;F.vy=0;F.air=0;return}
 const lz=P.z-q.OZ,g=vehGround(q,P.x,lz),off=Math.max(-1.2,Math.min(.4,(P.dy||0)-g));
 if(F.y==null||Math.hypot(P.x-F.x,P.z-F.z)>4||!isFinite(F.y)){F.y=g;F.vy=0;F.air=0}
 else if(g<F.y-.05&&(F.air||g<F.y-.45)){/* in the air: gravity pulls harder every moment, up to a terminal speed */if(!F.air){F.air=1;F.h0=F.y}F.vy=Math.max(-55,F.vy-24*dt);F.y+=F.vy*dt;
  if(F.y<=g){const sp=-F.vy,h=F.h0-g;F.y=g;F.vy=0;F.air=0;if(h>1.2){try{snd(Math.max(55,120-sp*2),Math.min(.4,.1+sp*.012))}catch(e){}try{camShake(Math.min(.7,sp*.022),Math.min(.5,.15+sp*.01))}catch(e){}try{vfx('dust',P.x,g+.1,P.z,{n:Math.min(30,6+sp|0),w:1.2})}catch(e){}if(h>9&&!q.fallTip){q.fallTip=1;hint('💥 Oof. That was a long way down.')}}}}
 else{F.y=g;F.vy=0;F.air=0}
 F.x=P.x;F.z=P.z;P.dy=F.y+(F.air?0:off)}
{const ru0=busRoamUpd;busRoamUpd=function(q,dt){const r=ru0.apply(this,arguments);try{grvTick(q,dt)}catch(e){}return r}}
/* ---------- Generals: Dark Zone 51 clearance (trespass heat does not count for them) ---------- */
{const ah2=addHeat;addHeat=function(q,n,why){try{if(why=='trespass'&&milRank()>=9)return}catch(e){}return ah2.apply(this,arguments)}}
/* ---------- squads: the cars behind keep their distance and match the car in front ---------- */
function cvMax(u,pv){const g=Math.hypot(u.v.x-pv.x,u.v.z-pv.z);return Math.max(1.5,Math.min(19,Math.abs(pv.v||0)+(g-9)*.9))}
/* ---------- the APC: sit up in the hull, not under the floor ---------- */

