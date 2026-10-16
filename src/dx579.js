/* =====================================================================================================
   r579: THE MISSILE, PROPERLY.
   - A new missile on Silo 1: two stages, an interstage ring, a black re-entry shroud, swept fins, a nozzle bell, roll
     markings. On launch: a white-hot flame, a smoke column from the silo, and a long smoke trail that hangs in the sky.
   - Impact: a real MUSHROOM CLOUD you can see from anywhere on the map. A fireball, a rising stem, a rolling cap that
     cools from orange to grey, a condensation ring, and a dust surge racing out over the ground. The flash is
     softer the further away you are, and the bang arrives late (sound travels at 343 m/s).
   - SILO 1 FREIGHT ELEVATOR at the east end of the launch control corridor: ride it down to the silo, walk the
     tunnel to the catwalk and stand right next to the missile. (Nobody is allowed down there during a launch.)
   ===================================================================================================== */
const NKC={list:[],trail:[],tex:null};
function nkPuffTex(){if(NKC.tex)return NKC.tex;const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');
 for(let i=0;i<26;i++){const a=Math.random()*6.28,r=Math.random()*30,px=64+Math.cos(a)*r,py=64+Math.sin(a)*r,R=18+Math.random()*22;const g=x.createRadialGradient(px,py,0,px,py,R);const v=200+Math.random()*55|0;g.addColorStop(0,'rgba('+v+','+v+','+v+',.55)');g.addColorStop(.6,'rgba('+(v-30)+','+(v-30)+','+(v-30)+',.25)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.beginPath();x.arc(px,py,R,0,7);x.fill()}
 const t=new THREE.CanvasTexture(c);NKC.tex=t;return t}
function nkSprite(col,op,add){const m=new THREE.SpriteMaterial({map:nkPuffTex(),color:col,transparent:true,opacity:op,depthWrite:false,fog:false,blending:add?THREE.AdditiveBlending:THREE.NormalBlending});return new THREE.Sprite(m)}
/* ---------- the missile ---------- */
function nkMissile(ms){for(let i=ms.children.length-1;i>=0;i--){const c=ms.children[i];if(c.isMesh)ms.remove(c)}
 const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.45,metalness:.35},o||{})),A=(geo,m,y,par)=>{const o=new THREE.Mesh(geo,m);o.position.y=y;(par||ms).add(o);return o};
 const WH=M(0xeeeee8),BK=M(0x1a1a1c),GR=M(0x6a6e74,{metalness:.7,roughness:.3}),RD=M(0xb01818);
 A(new THREE.CylinderGeometry(.55,.95,1.3,20,1,true),M(0x3a3a3c,{metalness:.8,roughness:.35,side:THREE.DoubleSide}),-.25);/* nozzle bell */
 A(new THREE.CylinderGeometry(1.3,1.3,6.4,24),WH,3.6);for(const y of[1.2,6.2])A(new THREE.CylinderGeometry(1.31,1.31,.35,24),BK,y);
 for(let k=0;k<4;k++){const q=new THREE.Mesh(new THREE.CylinderGeometry(1.315,1.315,1.2,24,1,true,k*Math.PI/2,Math.PI/4),BK);q.position.y=4.6;ms.add(q)}/* roll pattern */
 A(new THREE.CylinderGeometry(1.2,1.3,.8,24),GR,7.2);A(new THREE.CylinderGeometry(1.18,1.2,4.6,24),WH,9.9);A(new THREE.CylinderGeometry(1.19,1.19,.25,24),RD,12.0);
 A(new THREE.CylinderGeometry(.35,1.18,4.0,24),BK,14.2);A(new THREE.SphereGeometry(.36,12,8,0,Math.PI*2,0,Math.PI/2),BK,16.2);
 for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4,f=new THREE.Mesh(new THREE.BoxGeometry(.12,2.6,1.6),GR);f.position.set(Math.cos(a)*1.85,1.2,Math.sin(a)*1.85);f.rotation.y=-a;f.rotation.z=0;const sw=new THREE.Mesh(new THREE.BoxGeometry(.12,1.2,1.2),GR);sw.position.set(0,1.5,.2);sw.rotation.x=.6;f.add(sw);ms.add(f)}
 for(let i=0;i<3;i++){const p=new THREE.Mesh(new THREE.BoxGeometry(.4,1.6,.1),GR);const a=i*2.1;p.position.set(Math.cos(a)*1.32,3.4+i*2.5,Math.sin(a)*1.32);p.rotation.y=-a+Math.PI/2;ms.add(p)}
 const c=document.createElement('canvas');c.width=64;c.height=512;const k=c.getContext('2d');k.fillStyle='#eeeee8';k.fillRect(0,0,64,512);k.fillStyle='#1a1a1c';k.font='bold 44px Arial';k.textAlign='center';k.save();k.translate(32,256);k.rotate(-Math.PI/2);k.fillText('DARK ARMY',0,15);k.restore();
 for(const sd of[-1,1]){const pl=new THREE.Mesh(new THREE.PlaneGeometry(.55,4.2),new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(c),roughness:.5}));pl.position.set(sd*1.32,3.6,0);pl.rotation.y=sd*Math.PI/2;ms.add(pl)}
 /* the flame: an outer orange cone and a white-hot core, both pointing down out of the nozzle */
 const fl=new THREE.Group();fl.position.y=-.9;ms.add(fl);const o1=new THREE.Mesh(new THREE.ConeGeometry(1.1,9,18,1,true),new THREE.MeshBasicMaterial({color:0xff8a30,transparent:true,opacity:.75,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.DoubleSide}));o1.rotation.x=Math.PI;o1.position.y=-4.5;fl.add(o1);
 const o2=new THREE.Mesh(new THREE.ConeGeometry(.55,5,14,1,true),new THREE.MeshBasicMaterial({color:0xfff6d0,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.DoubleSide}));o2.rotation.x=Math.PI;o2.position.y=-2.5;fl.add(o2);fl.visible=false;ms.userData.flame=fl;return ms}
/* ---------- smoke trail ---------- */
function nkTrail(q,x,y,z,big){const s=nkSprite(big?0xd8d4cc:0xe8e4dc,big?.75:.6);s.position.set(x,y,z);s.scale.setScalar(big?7:3);q.g.add(s);NKC.trail.push({s,t:0,life:big?28:34,g0:big?7:3,g1:big?30:16,vx:(Math.random()-.5)*1.2,vy:big?2.5:.4,vz:(Math.random()-.5)*1.2});if(NKC.trail.length>420){const o=NKC.trail.shift();if(o.s.parent)o.s.parent.remove(o.s);o.s.material.dispose()}}
/* ---------- the mushroom cloud ---------- */
function nkCloud(q,x,z){const g=new THREE.Group();g.position.set(x,0,z);q.g.add(g);const C={g,t:0,x,z,ps:[]};
 const add=(kind,col,op,addB,o)=>{const s=nkSprite(col,op,addB);g.add(s);const p=Object.assign({s,kind,op0:op},o);C.ps.push(p);return p};
 C.fb=add('fb',0xfff0c0,1,true,{});C.fb2=add('fb',0xff7020,.9,true,{});
 for(let i=0;i<34;i++)add('stem',0xc89070,.85,false,{u:i/33,a:Math.random()*6.28,r:Math.random()});
 for(let i=0;i<56;i++)add('cap',0xd09a70,.9,false,{a:i/56*6.283+Math.random()*.1,b:Math.random()*6.283,k:Math.random()});
 for(let i=0;i<22;i++)add('dome',0xc8a080,.85,false,{a:Math.random()*6.28,r:Math.random(),h:Math.random()});
 for(let i=0;i<40;i++)add('base',0xc8a878,.7,false,{a:i/40*6.283,k:Math.random()});
 const ring=new THREE.Mesh(new THREE.TorusGeometry(1,.06,8,48),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,depthWrite:false,fog:false}));ring.rotation.x=Math.PI/2;g.add(ring);C.ring=ring;
 const shock=new THREE.Mesh(new THREE.RingGeometry(.92,1,64),new THREE.MeshBasicMaterial({color:0xf0e0c0,transparent:true,opacity:.6,depthWrite:false,fog:false,side:THREE.DoubleSide}));shock.rotation.x=-Math.PI/2;shock.position.y=.6;g.add(shock);C.shock=shock;
 NKC.list.push(C);return C}
const nkE=u=>1-Math.pow(1-Math.min(1,Math.max(0,u)),3);
function nkCloudTick(C,dt){C.t+=dt;const t=C.t,H=24+210*nkE(t/26),R=12+78*nkE(t/30),fade=t>70?Math.max(0,1-(t-70)/30):1,heat=Math.max(0,1-t/14);
 const col=(p,base,hot)=>{const m=p.s.material;m.color.setHex(base);if(hot>0)m.color.lerp(NKCOL.set(0xff9a40),hot)};
 for(const p of C.ps){const s=p.s,m=s.material;
  if(p.kind=='fb'){const k=p===C.fb?1:1.4;s.position.set(0,Math.min(H*.9,6+t*9),0);s.scale.setScalar((20+t*28)*k*(t<4?1:Math.max(.2,1-(t-4)/8)));m.opacity=p.op0*Math.max(0,1-t/(p===C.fb?6:10))}
  else if(p.kind=='stem'){const y=p.u*H*.92,w=(5+p.u*6+Math.min(8,t*.4))*(1+p.r*.4);s.position.set(Math.cos(p.a+t*.15)*w*.25,y,Math.sin(p.a+t*.15)*w*.25);s.scale.setScalar(w*2.2);m.opacity=p.op0*fade*Math.min(1,t/1.5);col(p,0x8a7a6c,heat*(1-p.u*.5))}
  else if(p.kind=='cap'){const roll=p.b+t*.6,rr=R*.35;const rx=R+Math.cos(roll)*rr,ry=H+Math.sin(roll)*rr*.8;s.position.set(Math.cos(p.a)*rx,ry,Math.sin(p.a)*rx);s.scale.setScalar(R*.9*(.8+p.k*.5));m.opacity=p.op0*fade*Math.min(1,t/2);col(p,Math.sin(roll)<0?0x6e625a:0x9a8c80,heat*(Math.sin(roll)<0?1:.6))}
  else if(p.kind=='dome'){const rr=R*(.2+p.r*.7);s.position.set(Math.cos(p.a)*rr,H+R*.25+p.h*R*.35,Math.sin(p.a)*rr);s.scale.setScalar(R*1.1);m.opacity=p.op0*fade*Math.min(1,t/2.5);col(p,0xa09488,heat*.7)}
  else if(p.kind=='base'){const rr=Math.min(150,8+t*22)*(.85+p.k*.3);s.position.set(Math.cos(p.a)*rr,4+p.k*5,Math.sin(p.a)*rr);s.scale.setScalar(16+t*1.5);m.opacity=p.op0*Math.max(0,1-t/30)*fade;col(p,0xb89c78,0)}}
 const rg=C.ring;if(t>3&&t<16){const u=(t-3)/13;rg.position.y=H*.62;rg.scale.setScalar(R*.9+u*60);rg.material.opacity=.7*Math.sin(u*Math.PI)}else rg.material.opacity=0;
 const sh=C.shock;if(t<9){const r=8+t*95;sh.scale.setScalar(r);sh.material.opacity=.55*(1-t/9)}else sh.visible=false;
 return t<100}
const NKCOL=new THREE.Color();
/* the impact: a cloud per warhead, a flash that depends on how far away you are, the bang arriving late */
function nkImpact(q,t){try{nkCloud(q,t.x,t.z)}catch(e){conLog('error','mushroom: '+e.message)}
 const lz=P.z-q.OZ,d=Math.hypot(P.x-t.x,lz-t.z);try{bsF.style.transition='none';bsF.style.background='#fff8e8';bsF.style.opacity=d<300?.95:d<700?.6:.35;setTimeout(()=>{bsF.style.transition='opacity 3s';bsF.style.opacity=0},d<300?400:180);setTimeout(()=>{bsF.style.background='#000'},3600)}catch(e){}
 const lag=Math.min(6,d/343);setTimeout(()=>{try{snd(28,2.6);snd(42,2);snd(65,1.2);camShake(Math.min(1,220/Math.max(60,d)),2.2)}catch(e){}},lag*1000)}
{const ni1=ngImpact;ngImpact=function(q,t){const r=ni1.apply(this,arguments);try{nkImpact(q,t);const N=q.mil.nuke,ps=N.mirv||[];ps.slice(1).forEach((p,i)=>setTimeout(()=>{try{if(BUS.ride===q)nkCloud(q,p.x,p.z)}catch(e){}},900*(i+1)))}catch(e){}return r}}
{const nb0=milNukeBoom;milNukeBoom=function(q){const r=nb0.apply(this,arguments);try{bsF.style.opacity=0}catch(e){}return r}}
/* the per-frame bits: the flame, the trail, the old placeholder cloud hidden, the new clouds */
{const nt2=milNukeTick;milNukeTick=function(q,dt){const N=q.mil&&q.mil.nuke;const r=nt2.apply(this,arguments);try{if(!N)return r;const m=N.missile;if(m&&!m.userData.nkNew){nkMissile(m);m.userData.nkNew=1}
  if(N.cloud){N.cloud.cap.visible=false;N.cloud.stem.visible=false}
  const fl=m&&m.userData.flame,fly=(N.st=='launch'||N.st=='flight')&&m&&m.visible;if(fl){fl.visible=!!fly;if(fly){const f=1+Math.sin(performance.now()*.05)*.12;fl.scale.set(f,1+Math.random()*.25,f)}}
  if(fly){N.trT=(N.trT||0)-dt;if(N.trT<=0){N.trT=.05;const v=new THREE.Vector3(0,-2.5,0);m.localToWorld(v);nkTrail(q,v.x,v.y,v.z,false)}const u=N.t-2.5;if(u<5&&Math.random()<dt*20)nkTrail(q,N.sx+(Math.random()-.5)*6,2+Math.random()*3,N.sz+(Math.random()-.5)*6,true)}}catch(e){}return r}}
{let last=performance.now(),rq=null;const tk=()=>{requestAnimationFrame(tk);const now=performance.now(),dt=Math.min(.05,(now-last)/1000);last=now;try{const q=BUS.ride;if(q!==rq){rq=q;NKC.list.length=0;NKC.trail.length=0}if(!q)return;
  for(let i=NKC.list.length-1;i>=0;i--){const C=NKC.list[i];if(!nkCloudTick(C,dt)){if(C.g.parent)C.g.parent.remove(C.g);C.ps.forEach(p=>p.s.material.dispose());NKC.list.splice(i,1)}}
  for(let i=NKC.trail.length-1;i>=0;i--){const o=NKC.trail[i];o.t+=dt;const u=o.t/o.life;if(u>=1){if(o.s.parent)o.s.parent.remove(o.s);o.s.material.dispose();NKC.trail.splice(i,1);continue}o.s.position.x+=o.vx*dt;o.s.position.y+=o.vy*dt;o.s.position.z+=o.vz*dt;o.s.scale.setScalar(o.g0+(o.g1-o.g0)*nkE(u*1.4));o.s.material.opacity=.65*(1-u)*(1-u)}}catch(e){}};requestAnimationFrame(tk)}
/* ---------- SILO 1: the freight elevator and the catwalk round the missile ---------- */
const SILO={x:578,z:-700,el:{x0:553.6,x1:559.6,z0:-694.6,z1:-687.6},Y:-14,ta:{x0:559.6,x1:580,z0:-693.4,z1:-688.8},tb:{x0:575.4,x1:580,z0:-694.9,z1:-693.2}};
const silIn=(r,x,z,m)=>x>r.x0+m&&x<r.x1-m&&z>r.z0+m&&z<r.z1-m;
function siloOK(x,z){const m=.35;if(silIn(SILO.el,x,z,m)||silIn(SILO.ta,x,z,m)||silIn(SILO.tb,x,z,m))return true;const d=Math.hypot(x-SILO.x,z-SILO.z);return d>2.45&&d<5.5}
{const dk0=deepOK;deepOK=function(q,x,lz){if(q.deep===4)return siloOK(x,lz);return dk0.apply(this,arguments)}}
function siloBuild(q){const ML=q.mil;if(!ML||!ML.nuke||q.siloB)return;q.siloB=1;const g=new THREE.Group();q.g.add(g);q.silo={g};
 const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.7,metalness:.25},o||{})),B=(w,h,d,x,y,z,m)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);g.add(o);return o};
 const CON=M(0x7a7c78,{emissive:0x101210}),DK=M(0x2a2c30),ST=M(0x8a9098,{metalness:.7,roughness:.35}),YL=M(0xe8c020,{emissive:0x302400}),LIT=M(0xfff4d0,{emissive:0xffe8b0}),RL=M(0x300000,{emissive:0xff3020});const Y=SILO.Y,E=SILO.el;
 /* top: the cage at the end of the corridor */const ex=(E.x0+E.x1)/2,ez=(E.z0+E.z1)/2;for(const[x,z]of[[E.x0,E.z0],[E.x0,E.z1],[E.x1,E.z0],[E.x1,E.z1]])B(.18,4,.18,x,2,z,YL);
 for(const z of[E.z0,E.z1]){for(let i=0;i<10;i++)B(.04,3.8,.04,E.x0+.3+i*.6,1.9,z,ST);B(E.x1-E.x0,.1,.1,ex,3.9,z,YL)}for(let i=0;i<11;i++)B(.04,3.8,.04,E.x1,1.9,E.z0+.3+i*.63,ST);
 const plat=new THREE.Group();g.add(plat);const pl=new THREE.Mesh(new THREE.BoxGeometry(E.x1-E.x0-.2,.2,E.z1-E.z0-.2),M(0x4a4e54,{metalness:.6}));pl.position.set(ex,.02,ez);plat.add(pl);for(const sd of[-1,1]){const s=new THREE.Mesh(new THREE.BoxGeometry(E.x1-E.x0-.3,.02,.25),YL);s.position.set(ex,.13,ez+sd*(E.z1-E.z0)/2.6);plat.add(s)}
 q.silo.plat=plat;
 const cv=document.createElement('canvas');cv.width=512;cv.height=96;const k=cv.getContext('2d');k.fillStyle='#e8c020';k.fillRect(0,0,512,96);k.fillStyle='#1a1a1a';k.font='bold 34px Arial';k.textAlign='center';k.fillText('SILO 1 · FREIGHT ELEVATOR',256,44);k.font='24px Arial';k.fillText('CATWALK LEVEL −14 m',256,80);
 const sg=new THREE.Mesh(new THREE.PlaneGeometry(3.4,.64),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv)}));sg.position.set(E.x0-.02,3.2,ez);sg.rotation.y=-Math.PI/2;g.add(sg);
 /* the shaft below the cage, the room at the bottom (drawn first, with a hole cut in the floor above it) */const UND=[];const BU=(...a)=>{const o=B(...a);UND.push(o);return o};const th=3.4;
 for(const z of[E.z0-.1,E.z1+.1])BU(E.x1-E.x0+.4,-Y+.1,.2,ex,Y/2,z,CON);BU(.2,-Y+.1,E.z1-E.z0,E.x0-.1,Y/2,ez,CON);BU(E.x1-E.x0,.2,E.z1-E.z0,ex,Y-.1,ez,M(0x4a4c50));
 BU(.2,-Y-th+.1,E.z1-E.z0+.4,E.x1+.1,(Y+th)/2,ez,CON);BU(.2,th,1.2,E.x1+.1,Y+th/2,E.z0+.6,CON);BU(.2,th,1.2,E.x1+.1,Y+th/2,E.z1-.6,CON);
 for(let y=Y+1;y<-.5;y+=3)for(const z of[E.z0+.02,E.z1-.02])BU(E.x1-E.x0,.12,.04,ex,y,z,YL);
 const hole=new THREE.Mesh(new THREE.PlaneGeometry(E.x1-E.x0,E.z1-E.z0),new THREE.MeshBasicMaterial({colorWrite:false}));hole.rotation.x=-Math.PI/2;hole.position.set(ex,.13,ez);hole.renderOrder=-1;g.add(hole);
 for(const o of UND)o.renderOrder=-2;plat.traverse(o=>{if(o.isMesh)o.renderOrder=-2});
 /* the tunnel east to the shaft, and the short connector into it */const TA=SILO.ta,TB=SILO.tb,FLm=M(0x4a4c50,{roughness:.9});
 {const w=TA.x1-TA.x0,d=TA.z1-TA.z0,cx=(TA.x0+TA.x1)/2,cz=(TA.z0+TA.z1)/2;B(w,.2,d,cx,Y-.1,cz,FLm);B(w,.2,d,cx,Y+th,cz,CON);B(w,th,.2,cx,Y+th/2,TA.z1+.1,CON);B(TB.x0-TA.x0,th,.2,(TA.x0+TB.x0)/2,Y+th/2,TA.z0-.1,CON);B(.2,th,d+.2,TA.x1+.1,Y+th/2,cz,CON)}
 {const w=TB.x1-TB.x0,d=TA.z0-TB.z0,cx=(TB.x0+TB.x1)/2,cz=(TB.z0+TA.z0)/2;B(w,.2,d,cx,Y-.1,cz,FLm);B(w,.2,d,cx,Y+th,cz,CON);B(.2,th,d,TB.x0-.1,Y+th/2,cz,CON);B(.2,th,d,TB.x1+.1,Y+th/2,cz,CON)}
 for(const[c,dy]of[[0xb01818,0],[0x8a8a8a,.18],[0xe8c020,.36]]){const p=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,TA.x1-TA.x0-.4,8),M(c,{metalness:.5}));p.rotation.z=Math.PI/2;p.position.set((TA.x0+TA.x1)/2,Y+th-.5-dy,TA.z1-.15);g.add(p)}
 for(let x=TA.x0+2;x<TA.x1-1;x+=4)B(1,.06,.25,x,Y+th-.13,(TA.z0+TA.z1)/2,LIT);B(.25,.06,1,(TB.x0+TB.x1)/2,Y+th-.13,(TB.z0+TA.z0)/2,LIT);
 const ar=document.createElement('canvas');ar.width=512;ar.height=96;const a2=ar.getContext('2d');a2.fillStyle='#1a1a1a';a2.fillRect(0,0,512,96);a2.fillStyle='#e8c020';a2.font='bold 40px Arial';a2.textAlign='center';a2.fillText('SILO 1  ➜',256,62);const as=new THREE.Mesh(new THREE.PlaneGeometry(1.8,.34),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(ar)}));as.position.set(E.x1+3,Y+2.3,TA.z1-.02);as.rotation.y=Math.PI;g.add(as);
 /* the silo shaft: a concrete tube with a doorway where the tunnel comes in, rings of pipe, warning lights, the catwalk */
 const SM=new THREE.MeshStandardMaterial({color:0x8a8c88,roughness:.95,side:THREE.BackSide,emissive:0x141614}),t0=Math.atan2((TB.x0+TB.x1)/2-SILO.x,TB.z0-SILO.z+6),gap=.46;
 {const lo=new THREE.Mesh(new THREE.CylinderGeometry(6,6,Y+th+20.5,40,1,true,t0+gap,Math.PI*2-2*gap),SM);lo.position.set(SILO.x,(Y+th-20.5)/2,SILO.z);g.add(lo);const hi=new THREE.Mesh(new THREE.CylinderGeometry(6,6,1.5-(Y+th),40,1,true),SM);hi.position.set(SILO.x,(1.5+Y+th)/2,SILO.z);g.add(hi)}
 const bot=new THREE.Mesh(new THREE.CircleGeometry(6,40),M(0x2a1a10,{emissive:0x401808}));bot.rotation.x=-Math.PI/2;bot.position.set(SILO.x,-20.4,SILO.z);g.add(bot);
 for(const y of[-19,-17,-8,-5,-2]){const r=new THREE.Mesh(new THREE.TorusGeometry(5.88,.1,6,48),ST);r.rotation.x=Math.PI/2;r.position.set(SILO.x,y,SILO.z);g.add(r)}
 for(let i=0;i<8;i++){const a=t0+gap+.25+i/8*(Math.PI*2-2*gap-.5);const s=new THREE.Mesh(new THREE.SphereGeometry(.13,10,8),i%2?RL:LIT);s.position.set(SILO.x+Math.sin(a)*5.86,Y+(i%2?2.6:3.1),SILO.z+Math.cos(a)*5.86);g.add(s)}
 const cw=new THREE.Mesh(new THREE.RingGeometry(2.2,5.98,48,1),new THREE.MeshStandardMaterial({color:0x5a5e64,metalness:.6,roughness:.5,side:THREE.DoubleSide}));cw.rotation.x=-Math.PI/2;cw.position.set(SILO.x,Y+.025,SILO.z);g.add(cw);
 const rl=new THREE.Mesh(new THREE.TorusGeometry(2.25,.04,6,48),YL);rl.rotation.x=Math.PI/2;rl.position.set(SILO.x,Y+1.05,SILO.z);g.add(rl);for(let i=0;i<16;i++){const a=i/16*6.283;B(.05,1.05,.05,SILO.x+Math.cos(a)*2.25,Y+.52,SILO.z+Math.sin(a)*2.25,YL)}
 /* the maintenance tag, hung on the railing facing the tunnel */{const c=document.createElement('canvas');c.width=256;c.height=160;const k=c.getContext('2d');k.fillStyle='#f0e8c0';k.fillRect(0,0,256,160);k.strokeStyle='#b01818';k.lineWidth=8;k.strokeRect(4,4,248,152);k.fillStyle='#1a1a1a';k.font='bold 26px Arial';k.textAlign='center';k.fillText('SILO 1',128,44);k.font='bold 20px Arial';k.fillText('MAINTENANCE TAG',128,80);k.font='16px Arial';k.fillText('READ ME (E)',128,120);
  const tg=new THREE.Mesh(new THREE.PlaneGeometry(.5,.32),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c)}));tg.position.set(SILO.x,Y+.8,SILO.z+2.3);g.add(tg)}
 /* props */q.props.push({x:ex-1,z:ez,r:2,deep:0,txt:()=>q.seat||q.deep?'':siloWhy(q)||'[E] ⬇️ Take the freight elevator down to SILO 1',act:()=>siloRide(q,-1)});
 q.props.push({x:ex,z:ez,r:2.2,deep:1,txt:()=>q.deep===4&&!q.xr?'[E] ⬆️ Ride the elevator up to launch control':'',act:()=>{if(q.deep===4)siloRide(q,1)}});
 q.props.push({x:SILO.x,z:SILO.z+3.1,r:1.3,deep:1,txt:()=>q.deep===4?'[E] 📋 Read the maintenance tag on the missile':'',act:()=>{if(q.deep!==4)return;const N=ML.nuke;snd(300,.05);hint(N.cool>0||N.st!='idle'?'📋 "SILO 1 · RELOADING · DO NOT ENTER BELOW THE CATWALK". The cradle is empty.':'📋 "SILO 1 · DARK ARMY · STAGE 1 & 2 FUELLED · LAST INSPECTED: YESTERDAY · INSPECTOR: SEEK". Somebody has drawn a little eye on it.')}});
 q.anims.push(dt=>{try{siloTick(q,dt)}catch(e){}})}
function siloWhy(q){const N=q.mil&&q.mil.nuke;if(milRank()<7&&!(q.mil&&q.mil.auth))return'🔒 Silo access: Lieutenant Colonel and up.';if(N&&(N.st=='count'||N.st=='launch'||N.st=='flight'))return'⛔ SILO SEALED: launch in progress.';return''}
function siloRide(q,dir){if(q.xr||q.seat)return;if(dir<0){const w=siloWhy(q);if(w){hint(w);snd(180,.1);return}}const E=SILO.el,ex=(E.x0+E.x1)/2,ez=(E.z0+E.z1)/2;for(const k in keys)keys[k]=0;P.x=ex;P.z=ez+q.OZ;
 q.xr={k:'silo',txt:()=>'',act:null};q.deep=4;q.deepY=dir<0?0:SILO.Y;q.silo.ride={dir,t:0};snd(140,.3);hint(dir<0?'⬇️ The freight elevator drops into the rock. Fourteen metres of it.':'⬆️ Back up to launch control.')}
function siloTick(q,dt){const S=q.silo;if(!S)return;const L=S.ride,N=q.mil.nuke;
 if(L){L.t+=dt;const T=6,u=Math.min(1,L.t/T),e=u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2,y=L.dir<0?SILO.Y*e:SILO.Y*(1-e);S.plat.position.y=y;q.deepY=y;const E=SILO.el;P.x=(E.x0+E.x1)/2;P.z=(E.z0+E.z1)/2+q.OZ;P.dy=y;if(Math.random()<dt*3)snd(110+Math.random()*40,.04);
  if(u>=1){S.ride=null;q.xr=null;snd(220,.2);if(L.dir<0){q.deep=4;q.deepY=SILO.Y;P.x=E.x1+1.2;hint('🚀 SILO 1, catwalk level. The tunnel leads east to the shaft.')}else{q.deep=0;q.deepY=0;S.plat.position.y=0;P.x=E.x0-1;P.dy=0;hint('🏢 Launch control.')}}}
 else if(q.deep!==4&&S.plat.position.y!==0)S.plat.position.y=0;
 /* the missile sits in its cradle when you are down here */const m=N&&N.missile;if(m&&N.st=='idle'){const show=q.deep===4&&!(N.cool>0);if(m.visible!==show){m.visible=show;m.position.set(N.sx,-18,N.sz);m.quaternion.set(0,0,0,1);m.rotation.set(0,0,0)}}
 /* nobody stays down there for a launch */if(q.deep===4&&!S.ride&&N&&(N.st=='count'||N.st=='launch')){q.deep=0;q.deepY=0;q.xr=null;const E=SILO.el;P.x=E.x0-1.5;P.z=(E.z0+E.z1)/2+q.OZ;P.dy=0;try{xmFade(()=>{},10)}catch(e){}hint('🚨 The silo crew haul you up the ladder: NOBODY stays in the silo for a launch.')}
 /* it is dark down here */if(q.deep===4)q.ugK=(q.ugK==null?1:q.ugK)+(.28-(q.ugK==null?1:q.ugK))*Math.min(1,dt*3)}
setInterval(()=>{try{const q=BUS.ride;if(q&&q.roam&&q.mil&&q.mil.nuke)siloBuild(q)}catch(e){conLog('error','silo: '+e.message)}},1000);
/* ---------- Generals: set your desert spawn in your office (your Wraith waits in its bay) ---------- */
function ofSpawnPt(q){const i=cwSlot(q);return{x:CWB.x0+i*10+5,z:CWB.z0+5,i}}
function ofSpawnProps(q){if(q.ofSpP||!q.cw)return;q.ofSpP=1;for(let i=0;i<4;i++){const x=CWB.x0+i*10+7.6,z=CWB.z0+3.2;q.props.push({x,z,r:1.5,txt:()=>{if(q.seat||cwSlot(q)!==i||milRank()<9)return'';return milSV().spawn=='office'?'[E] 🛏️ Desert spawn: YOUR OFFICE (press to go back to the bus stop)':'[E] 🛏️ Set your desert spawn here: start every desert trip in your office'},act:()=>{if(cwSlot(q)!==i||milRank()<9)return;const S=milSV();S.spawn=S.spawn=='office'?'':'office';milSave();snd(600,.08);hint(S.spawn?'🛏️ Desert spawn set: from now on you arrive in your office at Fort Blackout'+(garOwned('proto')?', with your Wraith waiting in its bay.':'.'):'🛏️ Desert spawn reset: you arrive at the bus stop again.')}})}}
{const ru2=busRoamUpd;busRoamUpd=function(q,dt){try{ofSpawnProps(q);if(q.roam&&!q.spDone){q.spDone=1;const S=milSV();if(S.spawn=='office'&&milRank()>=9&&!MP.on){const p=ofSpawnPt(q);P.x=p.x;P.z=p.z+q.OZ;P.dy=0;P.yaw=0;q.safe={x:p.x,z:p.z};setTimeout(()=>hint('🛏️ Good morning, General. Your office at Fort Blackout.'+(garOwned('proto')?' Your Wraith is in its bay out back.':'')),800)}}}catch(e){}return ru2.apply(this,arguments)}}

/* ---------- the desert's sandy haze no longer follows you back to the hotel ---------- */
const DSKF={f:null};
{const bb1=busBoard;busBoard=function(){try{if(!BUS.ride&&S.fog)DSKF.f=[S.fog.color.getHex(),S.fog.near,S.fog.far,S.background&&S.background.isColor?S.background.getHex():null]}catch(e){}return bb1.apply(this,arguments)}}
{let had=0;setInterval(()=>{try{if(BUS.ride){had=1;return}if(had&&DSKF.f&&S.fog){had=0;const f=DSKF.f;S.fog.color.setHex(f[0]);S.fog.near=f[1];S.fog.far=f[2];if(f[3]!=null&&S.background&&S.background.isColor)S.background.setHex(f[3]);try{setFog()}catch(e){}}}catch(e){}},250)}
