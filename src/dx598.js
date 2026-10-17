/* =====================================================================================================
   r600: SQUADS, PROPERLY.
   - A SQUAD MOTOR POOL: a shed north of the command wing with a roller door for each squad's row. The vehicles wait
     inside; when you send a squad, its soldiers come out of your office, jog over, climb in, the doors roll up and
     they drive out. Coming home they drive back in, climb out and walk back to the command wing.
   - You can see the soldiers sitting in their jeeps and pickups.
   - Lead vehicles that keep circling a waypoint (inside the base, say) give up on it after a few seconds and go on to
     the next one, instead of going round and round.
   - The desert map shows where each squad is heading: a dashed line from the lead vehicle and a flag with its name.
   ===================================================================================================== */
/* r616 (Fort Blackout rework): the shed moved to x 495..525, z -925..-896, north of North Street. Its four roller doors are
   in the SOUTH wall now (one column of vehicles behind each), the crews come in by a door in the west wall, and the
   building itself is the design chat's fbMotorPool (dx614). */
const MPOOL={x0:495,x1:525,z0:-925,z1:-896,crewZ:-905,doors:[499,506.5,514,521.5]};
function cwShed(q){const C=q.cw;if(!C||C.shed)return;const g=new THREE.Group();q.g.add(g);const S={g,doors:[]};C.shed=S;const P2=MPOOL;
 const R=fbMotorPool(g,{x0:P2.x0,x1:P2.x1,z0:P2.z0,z1:P2.z1,doors:P2.doors,crewZ:P2.crewZ});for(const o of R.obs)q.obs.push(o);
 /* the doors move, so the batching leaves them alone; each has an obstacle while it is shut */
 for(const d of R.doors){d.m.userData.dpKeep=1;d.lt.userData.dpKeep=1;const ob={x0:d.x-3,x1:d.x+3,z0:P2.z1-.2,z1:P2.z1+.2};q.obs.push(ob);S.doors.push({x:d.x,m:d.m,lt:d.lt,ob,on:1,u:0})}
 q.obsDirty=1;q.mapR&&q.mapR.push({x0:P2.x0,x1:P2.x1,z0:P2.z0,z1:P2.z1,c:'#4a5a4a'});q.mapBg=null}
/* the crews' walk from an office door to the shed's crew door: out along the front of the command wing, up Parade Lane,
   across North Street and up the airside lane */
function cwCrewPath(oc){return[[oc,CWB.z0-3],[475,CWB.z0-3],[475,-885],[491.5,-889],[491.5,MPOOL.crewZ],[MPOOL.x0+1.5,MPOOL.crewZ]]}
{const cb8=cwBuild;cwBuild=function(q){const r=cb8.apply(this,arguments);try{cwShed(q)}catch(e){conLog('error','motor pool: '+e.message)}return r}}
/* ---------- sending a squad: the crews come out of the office and climb in first ---------- */
{const cs8=cwSend;cwSend=function(q,o){const C=q.cw,n0=C?C.sq.length:0;const r=cs8.apply(this,arguments);try{const s=C.sq[C.sq.length-1];if(!s||C.sq.length===n0)return r;s.ph='board';s.bt=0;s.st='crews boarding';s.walk=[];const oc=CWB.x0+cwSlot(q)*10+5;let k=0;
  for(const u of s.v){u.crewN=0;const v=u.v;const n=v.K.tank?2:Math.min(4,Math.max(1,(v.K.seats||[]).length));u.need=n;for(let i=0;i<n;i++){const m=mkSoldier(0);m.position.set(oc+(Math.random()-.5)*1.2,.9,CWB.z0-.8);m.visible=false;q.g.add(m);s.walk.push({m,u,dl:k*.45,path:cwCrewPath(oc),pi:0,board:1});k++}}
  hint('🪖 SQUAD '+s.nm+': the crews are on their way out to the MOTOR POOL.')}catch(e){conLog('error','squad boarding: '+e.message)}return r}}
function cwSide(v){const c=Math.cos(v.h),sn=Math.sin(v.h),ox=-(v.K.w/2+.7);return[v.x+ox*c+(-.4)*sn,v.z-ox*sn+(-.4)*c]}
function cwWalkTick(q,s,dt){let left=0;for(const w of s.walk){if(w.done)continue;left++;if(w.dl>0){w.dl-=dt;continue}w.m.visible=true;const tg=w.pi<w.path.length?w.path[w.pi]:null,T=tg||(w.board?cwSide(w.u.v):null);
  const fin=()=>{w.done=1;if(w.m.parent)w.m.parent.remove(w.m);if(w.board){w.u.crewN=(w.u.crewN|0)+1;try{snd(260,.04)}catch(e){}}};if(!T){fin();continue}
  const dx=T[0]-w.m.position.x,dz=T[1]-w.m.position.z,d=Math.hypot(dx,dz);if(d<.4){if(tg)w.pi++;else fin();continue}
  const sp=Math.min(d,4.2*dt);w.m.position.x+=dx/d*sp;w.m.position.z+=dz/d*sp;w.m.rotation.y=Math.atan2(-dx,-dz);try{seekRunOn(w.m,dt)}catch(e){}}return left}
/* ---------- every frame ---------- */
{const ct8=cwTick;cwTick=function(q,dt){const C=q.cw;try{if(C)for(const s of C.sq){if(s.done&&!s.walkHome)continue;
   if(s.ph=='board'){s.bt+=dt;for(const u of s.v){u.v.v=0}const left=cwWalkTick(q,s,dt);if(left===0||s.bt>40){if(!s.go){s.go=s.bt}if(s.bt-s.go>1.2){for(const u of s.v)u.crewN=u.need;s.ph='out';s.st='rolling out';try{snd(140,.3)}catch(e){}}}}
   /* a waypoint that keeps being circled is passed */if((s.ph=='out'||s.ph=='back')&&s.v[0]){const L=s.v[0].v,w=s.wp[s.wi];if(w&&s.wi<s.wp.length-1){const d=Math.hypot(w[0]-L.x,w[1]-L.z);if(d<26){s.nearT=(s.nearT||0)+dt;if(s.nearT>6){s.wi++;s.nearT=0}}else s.nearT=0}
    /* or that is already behind the lead vehicle, on the way to the next one */if(w&&s.wi<s.wp.length-1){const nx=s.wp[s.wi+1],ax=w[0]-L.x,az=w[1]-L.z,bx=nx[0]-w[0],bz=nx[1]-w[1];if(ax*bx+az*bz<0&&Math.hypot(ax,az)<14){s.wi++;s.nearT=0}}}}}catch(e){}
  const r=ct8.apply(this,arguments);
  try{if(C){/* the motor pool doors */const S=C.shed;if(S)for(const d of S.doors){let want=0;for(const s of C.sq){if(s.done&&!s.walkHome)continue;if(s.ph=='board'&&s.go)want=1;for(const u of s.v){if(Math.abs(u.v.x-d.x)<4&&u.v.z>MPOOL.z1-12&&u.v.z<MPOOL.z1+14&&(s.ph=='out'||s.ph=='back'||s.go))want=1}}
     const pu=d.u;d.u+=(want-d.u)*Math.min(1,dt*(want?1.6:2.4));{const hh=4*Math.max(.06,1-d.u*.94);d.m.scale.y=hh/4;d.m.position.y=4-hh/2}if((pu<.05)!==(d.u<.05))try{snd(d.u>pu?520:360,.08)}catch(e){}
     const open=d.u>.85;if(open===!!d.on){d.on=!open;if(open){const k=q.obs.indexOf(d.ob);if(k>=0)q.obs.splice(k,1)}else q.obs.push(d.ob);q.obsDirty=1}d.lt.material.emissive.setHex(d.u>.5?0x20c040:0xc00000)}
    for(const s of C.sq){/* home: the crews climb out and walk back to the command wing */if(s.done&&s.st=='home'&&!s.walkHome&&!s.walked){s.walked=1;s.walkHome=1;s.walk=[];const oc=CWB.x0+cwSlot(q)*10+5;for(const u of s.v){const[x,z]=cwSide(u.v);for(let i=0;i<(u.need||2);i++){const m=mkSoldier(0);m.position.set(x,.9,z);q.g.add(m);s.walk.push({m,u,dl:i*.5,path:cwCrewPath(oc).reverse().concat([[oc,CWB.z0-.6]]),pi:0})}u.crewN=0}}
     if(s.walkHome){if(cwWalkTick(q,s,dt)===0)s.walkHome=0}
     /* the crews you can see in the open vehicles */for(const u of s.v){const v=u.v,open=!v.K.tank&&v.k!='apc'&&(v.K.seats||[]).length>0;u.crew=u.crew||[];const want=open&&!s.done&&s.ph!='work'&&!v.wreck?Math.min(u.crewN||0,v.K.seats.length):0;
      while(u.crew.length<want){const m=mkSoldier(0);q.g.add(m);u.crew.push(m)}while(u.crew.length>want){const m=u.crew.pop();if(m.parent)m.parent.remove(m)}
      u.crew.forEach((m,i)=>{const w=vehWorldSeat(v,i);m.position.set(w.x,(v.y||0)+w.dy+.55,w.z);m.rotation.y=v.h})}}}}catch(e){conLog('error','squads: '+e.message)}
  return r}}
/* ---------- where the squads are heading, on the map ---------- */
{const dd8=dmapDraw;dmapDraw=function(q,cv,cx,cz,sc,full){const r=dd8.apply(this,arguments);try{const C=q.cw;if(!C)return r;const x=cv.getContext('2d'),W=cv.width,H=cv.height,X=wx=>W/2+(wx-cx)*sc,Y=wz=>H/2+(wz-cz)*sc;
  for(const s of C.sq){if(s.done||!s.v[0])continue;const L=s.v[0].v,T=s.ph=='back'?{x:(MPOOL.x0+MPOOL.x1)/2,z:MPOOL.z1+4}:s.dst;if(!T)continue;x.save();x.strokeStyle='rgba(60,170,255,.9)';x.lineWidth=full?3:2;x.setLineDash([8,6]);x.beginPath();x.moveTo(X(L.x),Y(L.z));
   for(let i=s.ph=='work'?s.wp.length:s.wi;i<s.wp.length;i++)x.lineTo(X(s.wp[i][0]),Y(s.wp[i][1]));if(s.ph=='work')x.lineTo(X(T.x),Y(T.z));x.stroke();x.setLineDash([]);
   const fx=X(T.x),fy=Y(T.z);x.fillStyle='#2a8aff';x.strokeStyle='#fff';x.lineWidth=2;x.beginPath();x.arc(fx,fy,full?9:6,0,7);x.fill();x.stroke();x.font=(full?18:13)+'px serif';x.textAlign='center';x.textBaseline='middle';x.fillText('🚩',fx,fy-(full?16:12));
   if(full){x.font='bold 12px Georgia';x.fillStyle='#e8f2ff';x.strokeStyle='#000';x.lineWidth=3;const t2='SQUAD '+s.nm+(s.ph=='back'?' (home)':'');x.strokeText(t2,fx,fy+18);x.fillText(t2,fx,fy+18)}x.restore()}}catch(e){}return r}}
/* ---------- SAVE & EXIT in co-op and public rooms: free the mouse (Esc) and a button appears ---------- */
const MPSX=document.createElement('button');MPSX.textContent='💾 Save & exit';MPSX.style.cssText='position:fixed;left:50%;bottom:calc(205px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:36;display:none;font:bold 15px Georgia,serif;color:#ffe9a8;background:#2a1c10;border:2px solid #d4a850;border-radius:8px;padding:8px 18px;cursor:pointer';
for(const ev of['mousedown','mouseup','touchstart'])MPSX.addEventListener(ev,e=>e.stopPropagation());MPSX.onclick=e=>{e.stopPropagation();mpSaveExit()};document.body.appendChild(MPSX);
setInterval(()=>{try{const show=MP.on&&!HUB.on&&mpul.style.display=='block'&&(state=='play'||state=='keypad'||state=='spec');MPSX.style.display=show?'block':'none'}catch(e){}},300);
function mpSaveExit(){let saved=false;try{if(!(DAILY&&DAILY.on)&&!(typeof GON=='function'&&GON())&&state!='spec'&&hp>0&&n>=1&&n<EXN){if(mpSeed)soloSeed=mpSeed>>>0;state='play';runSave();saved=!!runLoad()}}catch(e){}
 try{mpLeave(true)}catch(e){}try{clearAll()}catch(e){}state='menu';MPSX.style.display='none';try{mpul.style.display='none'}catch(e){}try{document.exitPointerLock()}catch(e){}
 menu('DOORS',saved?'💾 Saved at door '+n+'. Pick it up again from the menu with Continue (on your own), or with Continue our co-op run when you make a room with friends.':'You left the game.')}
