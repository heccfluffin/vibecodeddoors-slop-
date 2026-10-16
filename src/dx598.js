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
const MPOOL={x0:455,x1:485,z0:-901,z1:-872,pd:466};
function cwShed(q){const C=q.cw;if(!C||C.shed)return;const g=new THREE.Group();q.g.add(g);const S={g,doors:[]};C.shed=S;const H=4.6,t=.3,P2=MPOOL;
 const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.8,metalness:.15},o||{})),A=(w,h,d,m,x,y,z)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);g.add(o);return o},ob=(x0,x1,z0,z1)=>{const o={x0:Math.min(x0,x1),x1:Math.max(x0,x1),z0:Math.min(z0,z1),z1:Math.max(z0,z1)};q.obs.push(o);return o};
 const CON=M(0x7a7c70),RF=M(0x5a5c52),FL=M(0x55574f,{polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}),DR=M(0x8a8e92,{metalness:.5}),YL=M(0xd8b020);
 const W=P2.x1-P2.x0,D=P2.z1-P2.z0,cx=(P2.x0+P2.x1)/2,cz=(P2.z0+P2.z1)/2;A(W-.1,.12,D-.1,FL,cx,.09,cz);A(W+.6,.3,D+.6,RF,cx,H+.15,cz);
 A(t,H,D,CON,P2.x0,H/2,cz);ob(P2.x0-t/2,P2.x0+t/2,P2.z0,P2.z1);A(W,H,t,CON,cx,H/2,P2.z0);ob(P2.x0,P2.x1,P2.z0-t/2,P2.z0+t/2);
 /* the south wall, with a door for the crews */{const a=P2.pd-.7,b=P2.pd+.7;A(a-P2.x0,H,t,CON,(P2.x0+a)/2,H/2,P2.z1);ob(P2.x0,a,P2.z1-t/2,P2.z1+t/2);A(P2.x1-b,H,t,CON,(b+P2.x1)/2,H/2,P2.z1);ob(b,P2.x1,P2.z1-t/2,P2.z1+t/2);A(1.4,H-2.4,t,CON,P2.pd,2.4+(H-2.4)/2,P2.z1);
  const dl=pdTxt('CREWS',1.1,.24,'#d8b040','#20261c');dl.position.set(P2.pd,2.65,P2.z1+.17);g.add(dl)}
 /* the east wall: a roller door for each squad row */const rows=[0,1,2,3].map(s=>-876-s*7);let z=P2.z0;for(const rz of rows.slice().reverse()){const a=rz-3,b=rz+3;if(a-z>.05){A(t,H,a-z,CON,P2.x1,H/2,(z+a)/2);ob(P2.x1-t/2,P2.x1+t/2,z,a)}A(t,H-4,6,CON,P2.x1,4+(H-4)/2,rz);
  const dm=A(.12,4,6,DR,P2.x1+.05,2,rz);for(let k=0;k<8;k++){const r=new THREE.Mesh(new THREE.BoxGeometry(.16,.05,6),M(0x6a6e72,{metalness:.6}));r.position.y=-1.8+k*.5;dm.add(r)}const st=new THREE.Mesh(new THREE.BoxGeometry(.18,.22,6),YL);st.position.y=-1.9;dm.add(st);
  const lt=A(.3,.3,.3,M(0x200000,{emissive:0xc00000}),P2.x1+.25,4.25,rz+3.4);S.doors.push({rz,m:dm,lt,ob:ob(P2.x1-.2,P2.x1+.2,a,b),on:1,u:0});z=b}
 if(P2.z1-z>.05){A(t,H,P2.z1-z,CON,P2.x1,H/2,(z+P2.z1)/2);ob(P2.x1-t/2,P2.x1+t/2,z,P2.z1)}
 {const sg=pdTxt('SQUAD MOTOR POOL',6,.7,'#20261c','#e8d890');sg.position.set(P2.x1+.2,H+.7,cz);sg.rotation.y=Math.PI/2;g.add(sg);A(.15,.85,6.3,M(0x20261c),P2.x1+.05,H+.7,cz)}
 for(const rz of rows){for(let k=0;k<8;k++)A(.6,.03,.12,M(0xd8d0b0),P2.x0+2+k*3.2,.17,rz+3.5)}
 const lmp=[[462,-880],[476,-880],[462,-894],[476,-894]];for(const[x,z2]of lmp){A(.8,.06,.4,M(0xfff0c0,{emissive:0xfff0c0}),x,H-.05,z2)}
 q.obsDirty=1;q.mapR&&q.mapR.push({x0:P2.x0,x1:P2.x1,z0:P2.z0,z1:P2.z1,c:'#4a5a4a'});q.mapBg=null}
{const cb8=cwBuild;cwBuild=function(q){const r=cb8.apply(this,arguments);try{cwShed(q)}catch(e){conLog('error','motor pool: '+e.message)}return r}}
/* ---------- sending a squad: the crews come out of the office and climb in first ---------- */
{const cs8=cwSend;cwSend=function(q,o){const C=q.cw,n0=C?C.sq.length:0;const r=cs8.apply(this,arguments);try{const s=C.sq[C.sq.length-1];if(!s||C.sq.length===n0)return r;s.ph='board';s.bt=0;s.st='crews boarding';s.walk=[];const oc=CWB.x0+cwSlot(q)*10+5;let k=0;
  for(const u of s.v){u.crewN=0;const v=u.v;const n=v.K.tank?2:Math.min(4,Math.max(1,(v.K.seats||[]).length));u.need=n;for(let i=0;i<n;i++){const m=mkSoldier(0);m.position.set(oc+(Math.random()-.5)*1.2,.9,CWB.z0-.8);m.visible=false;q.g.add(m);s.walk.push({m,u,dl:k*.45,path:[[oc,CWB.z0-3],[MPOOL.pd,MPOOL.z1+1.5],[MPOOL.pd,MPOOL.z1-1.5]],pi:0,board:1});k++}}
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
  try{if(C){/* the motor pool doors */const S=C.shed;if(S)for(const d of S.doors){let want=0;for(const s of C.sq){if(s.done&&!s.walkHome)continue;if(s.ph=='board'&&s.go)want=1;for(const u of s.v){if(Math.abs(u.v.z-d.rz)<4&&u.v.x>MPOOL.x1-12&&u.v.x<MPOOL.x1+14&&(s.ph=='out'||s.ph=='back'||s.go))want=1}}
     const pu=d.u;d.u+=(want-d.u)*Math.min(1,dt*(want?1.6:2.4));{const hh=4*Math.max(.06,1-d.u*.94);d.m.scale.y=hh/4;d.m.position.y=4-hh/2}if((pu<.05)!==(d.u<.05))try{snd(d.u>pu?520:360,.08)}catch(e){}
     const open=d.u>.85;if(open===!!d.on){d.on=!open;if(open){const k=q.obs.indexOf(d.ob);if(k>=0)q.obs.splice(k,1)}else q.obs.push(d.ob);q.obsDirty=1}d.lt.material.emissive.setHex(d.u>.5?0x20c040:0xc00000)}
    for(const s of C.sq){/* home: the crews climb out and walk back to the command wing */if(s.done&&s.st=='home'&&!s.walkHome&&!s.walked){s.walked=1;s.walkHome=1;s.walk=[];const oc=CWB.x0+cwSlot(q)*10+5;for(const u of s.v){const[x,z]=cwSide(u.v);for(let i=0;i<(u.need||2);i++){const m=mkSoldier(0);m.position.set(x,.9,z);q.g.add(m);s.walk.push({m,u,dl:i*.5,path:[[MPOOL.pd,MPOOL.z1-1.5],[MPOOL.pd,MPOOL.z1+1.5],[oc,CWB.z0-3],[oc,CWB.z0-.6]],pi:0})}u.crewN=0}}
     if(s.walkHome){if(cwWalkTick(q,s,dt)===0)s.walkHome=0}
     /* the crews you can see in the open vehicles */for(const u of s.v){const v=u.v,open=!v.K.tank&&v.k!='apc'&&(v.K.seats||[]).length>0;u.crew=u.crew||[];const want=open&&!s.done&&s.ph!='work'&&!v.wreck?Math.min(u.crewN||0,v.K.seats.length):0;
      while(u.crew.length<want){const m=mkSoldier(0);q.g.add(m);u.crew.push(m)}while(u.crew.length>want){const m=u.crew.pop();if(m.parent)m.parent.remove(m)}
      u.crew.forEach((m,i)=>{const w=vehWorldSeat(v,i);m.position.set(w.x,(v.y||0)+w.dy+.55,w.z);m.rotation.y=v.h})}}}}catch(e){conLog('error','squads: '+e.message)}
  return r}}
/* ---------- where the squads are heading, on the map ---------- */
{const dd8=dmapDraw;dmapDraw=function(q,cv,cx,cz,sc,full){const r=dd8.apply(this,arguments);try{const C=q.cw;if(!C)return r;const x=cv.getContext('2d'),W=cv.width,H=cv.height,X=wx=>W/2+(wx-cx)*sc,Y=wz=>H/2+(wz-cz)*sc;
  for(const s of C.sq){if(s.done||!s.v[0])continue;const L=s.v[0].v,T=s.ph=='back'?{x:MPOOL.x0+10,z:-880}:s.dst;if(!T)continue;x.save();x.strokeStyle='rgba(60,170,255,.9)';x.lineWidth=full?3:2;x.setLineDash([8,6]);x.beginPath();x.moveTo(X(L.x),Y(L.z));
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
