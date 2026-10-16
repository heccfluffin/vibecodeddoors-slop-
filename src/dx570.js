/* =====================================================================================================
   r570: SITE SECURITY squads (e.g. guarding the water tower) set up a real sentry gun.
   On site: two soldiers carry crates from the jeep to a spot by the site, then the crew kneels round it and the gun goes
   together piece by piece (tripod, body, shield, barrel, ammo box). Once it is up, insurgents come running at the
   site from the desert and the gun turns, fires and drops them. Then the crew packs it all up, carries the crates
   back to the jeep and drives home.
   ===================================================================================================== */
const SG={T:{unload:12,build:24,guard:56,pack:66}};
function sgModel(){const g=new THREE.Group(),M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.7,metalness:.3},o||{})),B=(w,h,d)=>new THREE.BoxGeometry(w,h,d),C=(a,b,h,n)=>new THREE.CylinderGeometry(a,b,h,n||10);
 const OD=M(0x4a5236),DK=M(0x22261c),ST=M(0x6a6e72,{metalness:.7});const P={};
 /* tripod */const tri=new THREE.Group();g.add(tri);for(let i=0;i<3;i++){const a=i/3*6.283,l=new THREE.Mesh(C(.05,.05,1.25,6),ST);l.position.set(Math.cos(a)*.42,.55,Math.sin(a)*.42);l.rotation.z=Math.cos(a)*.38;l.rotation.x=-Math.sin(a)*.38;tri.add(l)}const hub=new THREE.Mesh(C(.16,.18,.2,10),DK);hub.position.y=1.12;tri.add(hub);P.tri=tri;
 /* the turning head: body, shield, barrel, ammo box */const head=new THREE.Group();head.position.y=1.24;g.add(head);P.head=head;
 const body=new THREE.Mesh(B(.42,.34,.9),OD);body.position.set(0,.14,-.05);head.add(body);P.body=body;
 const sh=new THREE.Mesh(B(1.1,.7,.06),OD);sh.position.set(0,.28,-.5);head.add(sh);const slit=new THREE.Mesh(B(.22,.1,.07),DK);slit.position.set(0,.22,-.5);head.add(slit);P.sh=[sh,slit];
 const bar=new THREE.Mesh(C(.045,.06,1.2,8),ST);bar.rotation.x=Math.PI/2;bar.position.set(0,.16,-.95);head.add(bar);const mz=new THREE.Mesh(C(.08,.08,.18,8),DK);mz.rotation.x=Math.PI/2;mz.position.set(0,.16,-1.55);head.add(mz);P.bar=[bar,mz];
 const am=new THREE.Mesh(B(.3,.24,.3),M(0x5a5a2a));am.position.set(.36,.1,.05);head.add(am);const belt=new THREE.Mesh(B(.06,.04,.3),M(0xc8a040,{metalness:.8}));belt.position.set(.2,.18,-.05);head.add(belt);P.am=[am,belt];
 const fl=glowSp(0xffc060,0,2.2);fl.position.set(0,.16,-1.75);head.add(fl);P.fl=fl;
 const order=[tri,body,P.sh[0],P.sh[1],P.bar[0],P.bar[1],P.am[0],P.am[1]];for(const o of order)o.visible=false;g.userData={P,order};return g}
function sgInsurgent(){const m=mkSoldier(0);m.traverse(o=>{if(o.isMesh&&o.material&&o.material.color){o.material=o.material.clone();const c=o.material.color;const l=(c.r+c.g+c.b)/3;o.material.color.setRGB(.18+l*.25,.16+l*.2,.13+l*.18)}});
 const band=new THREE.Mesh(new THREE.BoxGeometry(.42,.09,.42),new THREE.MeshStandardMaterial({color:0x8a1a14}));band.position.y=1.55;m.add(band);return m}
function sgShot(q,a,b){try{const geo=new THREE.BufferGeometry().setFromPoints([a,b]);const ln=new THREE.Line(geo,new THREE.LineBasicMaterial({color:0xffd060,transparent:true,opacity:.9}));q.g.add(ln);setTimeout(()=>{if(ln.parent)ln.parent.remove(ln);geo.dispose()},70)}catch(e){}}
function sgStart(q,s){const L=s.v[0].v,lx=s.loc.x,lz=s.loc.z;const dx=lx-L.x,dz=lz-L.z,d=Math.hypot(dx,dz)||1;const k=Math.min(10,d*.5);
 const G={x:L.x+dx/d*k,z:L.z+dz/d*k,face:Math.atan2(-dx/d,-dz/d),crates:[],ins:[],shotT:0,spawnT:3,kills:0,gun:sgModel()};G.gun.position.set(G.x,0,G.z);G.gun.rotation.y=G.face;q.g.add(G.gun);
 for(let i=0;i<4;i++){try{const c=supCrate();c.visible=false;q.g.add(c);G.crates.push(c)}catch(e){}}s.sg=G;
 /* the crew: four soldiers by the jeep */s.sol=[];s.props=[];for(let i=0;i<4;i++){const m=mkSoldier(0);const a=i/4*6.283;m.position.set(L.x+Math.cos(a)*3,.9,L.z+Math.sin(a)*3);q.g.add(m);m.userData.a=a;s.sol.push(m)}}
function sgWalk(m,tx,tz,dt,sp){const dx=tx-m.position.x,dz=tz-m.position.z,d=Math.hypot(dx,dz);if(d>.25){const st=Math.min(d,(sp||3.2)*dt);m.position.x+=dx/d*st;m.position.z+=dz/d*st;m.rotation.y=Math.atan2(dx,dz);try{seekRunOn(m,dt)}catch(e){}return false}return true}
function sgTick(q,s,dt){const G=s.sg;if(!G)return;const t=s.wt,T=SG.T,L=s.v[0].v,jx=L.x+Math.sin(L.h)*2.8,jz=L.z+Math.cos(L.h)*2.8,P=G.gun.userData.P,order=G.gun.userData.order;
 const pile=i=>[G.x+1.6+(i%2)*.8,G.z+1.2+(i>>1)*.8];
 if(t<T.unload){/* two carriers shuttle crates from the jeep to the gun spot */s.sol.forEach((m,i)=>{if(i<2){const ph=(t/T.unload*2+i*.5)%1,go=ph<.5,f=go?ph*2:2-ph*2;const tg=pile(Math.min(3,Math.floor(t/T.unload*4)));m.position.x=jx+(tg[0]-jx)*f;m.position.z=jz+(tg[1]-jz)*f;m.rotation.y=go?Math.atan2(tg[0]-jx,tg[1]-jz):Math.atan2(jx-tg[0],jz-tg[1]);try{seekRunOn(m,dt)}catch(e){}const c=G.crates[i];if(c){c.visible=go;c.position.set(m.position.x,1.25,m.position.z)}}else sgWalk(m,G.x+(i==2?-2:2),G.z-1.5,dt)});
  const n=Math.min(4,Math.floor(t/T.unload*4+.01));for(let i=2;i<4;i++){}G.crates.forEach((c,i)=>{if(i>=2&&i<2+Math.min(2,n)){c.visible=true;const p=pile(i);c.position.set(p[0],.3,p[1])}});return}
 if(t<T.build){/* everyone round the gun, kneeling; parts appear one by one with sparks */G.crates.forEach((c,i)=>{const p=pile(i);c.visible=true;c.position.set(p[0],.3,p[1])});
  s.sol.forEach((m,i)=>{const a=i/4*6.283+.4;if(sgWalk(m,G.x+Math.cos(a)*1.3,G.z+Math.sin(a)*1.3,dt)){m.rotation.y=Math.atan2(G.x-m.position.x,G.z-m.position.z);m.position.y=.9-.25*Math.abs(Math.sin(t*3+i))}});
  const k=Math.floor((t-T.unload)/(T.build-T.unload)*order.length);for(let i=0;i<order.length;i++){const was=order[i].visible;order[i].visible=i<=k;if(!was&&i<=k){try{snd(300+i*60,.06);vfx('spark',G.x,1.2,G.z+q.OZ,{n:10,c:0xffd060})}catch(e){}}}
  if(t+dt>=T.build){hint('📻 SQUAD '+s.nm+': "Sentry gun is up. We are holding '+s.loc.nm+'."')}return}
 if(t<T.guard){for(const o of order)o.visible=true;s.sol.forEach((m,i)=>{m.position.y=.9;const a=G.face+(i-1.5)*.6;if(sgWalk(m,G.x+Math.sin(a)*2.4,G.z+Math.cos(a)*2.4,dt))m.rotation.y=G.face+Math.PI+(i-1.5)*.3});
  /* insurgents come in from the desert */G.spawnT-=dt;if(G.spawnT<=0&&G.ins.filter(x=>!x.dead).length<3&&t<T.guard-6){G.spawnT=3.5+Math.random()*3.5;const a=G.face+Math.PI+(Math.random()-.5)*2.2,r=55+Math.random()*20;const m=sgInsurgent();m.position.set(G.x-Math.sin(a+Math.PI)*r,.9,G.z-Math.cos(a+Math.PI)*r);q.g.add(m);G.ins.push({m,hp:1+Math.floor(Math.random()*3),dead:0,dt:0,fireT:1+Math.random()*2})}
  let tg=null,best=1e9;for(const e of G.ins){if(e.dead)continue;const d=Math.hypot(e.m.position.x-G.x,e.m.position.z-G.z);if(d<best){best=d;tg=e}}
  for(const e of G.ins){if(e.dead){e.dt+=dt;if(e.dt>4){if(e.m.parent)e.m.parent.remove(e.m);e.gone=1}continue}const d=Math.hypot(e.m.position.x-G.x,e.m.position.z-G.z);if(d>16)sgWalk(e.m,G.x,G.z,dt,3.6);else{e.m.rotation.y=Math.atan2(G.x-e.m.position.x,G.z-e.m.position.z);e.fireT-=dt;if(e.fireT<=0){e.fireT=1.2+Math.random();sgShot(q,new THREE.Vector3(e.m.position.x,1.4,e.m.position.z),new THREE.Vector3(G.x+(Math.random()-.5)*2,1.4,G.z+(Math.random()-.5)*2));try{snd(500,.03)}catch(x){}}}}
  G.ins=G.ins.filter(e=>!e.gone);
  if(tg){const want=Math.atan2(-(tg.m.position.x-G.x),-(tg.m.position.z-G.z))-G.face;let cur=P.head.rotation.y,dd=want-cur;while(dd>Math.PI)dd-=6.283;while(dd<-Math.PI)dd+=6.283;P.head.rotation.y=cur+Math.max(-dt*2.5,Math.min(dt*2.5,dd));
   G.shotT-=dt;if(Math.abs(dd)<.12&&best<70&&G.shotT<=0){G.shotT=.12;G.burst=(G.burst||0)+1;const mz=new THREE.Vector3();P.bar[1].getWorldPosition(mz);q.g.worldToLocal(mz);sgShot(q,mz,new THREE.Vector3(tg.m.position.x,1.2+Math.random()*.4,tg.m.position.z));P.fl.material.opacity=1;setTimeout(()=>{try{P.fl.material.opacity=0}catch(e){}},50);try{snd(140+Math.random()*30,.05)}catch(e){}
    if(G.burst>=5){G.burst=0;G.shotT=.6;tg.hp--;if(tg.hp<=0){tg.dead=1;tg.m.rotation.x=-Math.PI/2;tg.m.position.y=.25;G.kills++;try{vfx('puff',tg.m.position.x,.6,tg.m.position.z+q.OZ,{n:6,c:0x8a7a5a})}catch(e){}}}}}
  else P.head.rotation.y*=Math.max(0,1-dt);return}
 if(t<T.pack){/* pack up: parts go in reverse, crates carried back to the jeep */for(const e of G.ins)if(e.m.parent)e.m.parent.remove(e.m);G.ins=[];const k=Math.floor((t-T.guard)/(T.pack-T.guard)*order.length*1.6);for(let i=0;i<order.length;i++)order[i].visible=i<order.length-k;
  s.sol.forEach((m,i)=>{m.position.y=.9;const ph=((t-T.guard)/(T.pack-T.guard)*2+i*.25)%1,back=ph<.5,f=back?ph*2:2-ph*2;const p=pile(i);m.position.x=p[0]+(jx-p[0])*f;m.position.z=p[1]+(jz-p[1])*f;m.rotation.y=back?Math.atan2(jx-p[0],jz-p[1]):Math.atan2(p[0]-jx,p[1]-jz);try{seekRunOn(m,dt)}catch(e){}const c=G.crates[i];if(c){const gone=(t-T.guard)/(T.pack-T.guard)>(.5+i*.12);c.visible=!gone;if(back)c.position.set(m.position.x,1.25,m.position.z)}});return}
 for(const o of order)o.visible=false;for(const c of G.crates)c.visible=false;s.sol.forEach(m=>sgWalk(m,jx,jz,dt))}
function sgEnd(q,s){const G=s.sg;if(!G)return;for(const e of G.ins)if(e.m.parent)e.m.parent.remove(e.m);for(const c of G.crates)if(c.parent)c.parent.remove(c);if(G.gun.parent)G.gun.parent.remove(G.gun);if(G.kills)try{hint('📻 SQUAD '+s.nm+': "'+s.loc.nm+' is secure. '+G.kills+' hostile'+(G.kills>1?'s':'')+' down. Packing up."')}catch(e){}s.sg=null}
{const ws0=cwWorkStart;cwWorkStart=function(q,s){if(s.T&&s.T.k=='guard'){try{sgStart(q,s);return}catch(e){conLog('error','sentry: '+e.message)}}return ws0.apply(this,arguments)}}
{const wt0=cwWorkTick;cwWorkTick=function(q,s,dt){if(s.sg){try{sgTick(q,s,dt)}catch(e){conLog('error','sentry tick: '+e.message);sgEnd(q,s)}return}return wt0.apply(this,arguments)}}
{const we0=cwWorkEnd;cwWorkEnd=function(q,s){try{sgEnd(q,s)}catch(e){}return we0.apply(this,arguments)}}
