/* =====================================================================================================
   r612: SQUAD CAMERAS IN THE GENERALS' OFFICES (docs/design/office-monitors.md, model mkSquadMonitors).
   Each office has a bank of four monitors on its left wall. Every squad of yours that is out gets a screen with a live
   picture from a camera riding behind and above its lead vehicle (circling the site while they work), and a strip
   with the squad's name and what it is doing. A lost squad's picture freezes with SIGNAL LOST, then NO SIGNAL.
   The pictures are only drawn while you stand in your own office (one screen per frame, 320 × 180), so it costs
   nothing anywhere else in the desert.
   ===================================================================================================== */
function mkSquadMonitors(){
 const g=new THREE.Group();
 const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.6,metalness:.4},o||{}));
 const dark=M(0x1a1c1e,{roughness:.45}),mid=M(0x2e3236),olive=M(0x3a4a2a,{roughness:.7}),steel=M(0x8a9096,{metalness:.75,roughness:.35});
 const BX=(w,h,d,m,x,y,z,p)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);(p||g).add(o);return o};
 const FONT='"Barlow Semi Condensed",DoorsSans,Arial,sans-serif';
 const parts={screens:[],buttons:[]};
 /* ---------- the wall frame holding four monitors ---------- */
 const SW=.96,SH=.54,B=.05,GX=.06,GY=.06;/* screen size, bezel, gaps */
 const MW=SW+2*B,MH=SH+2*B;const TW=2*MW+GX,TH=2*MH+GY;const CY=2.2;/* centre height of the bank */
 BX(TW+.12,TH+.12,.04,mid,0,CY,-.02);/* backing plate on the wall */
 for(const sx of[-1,1])BX(.06,TH+.3,.06,steel,sx*(TW/2+.02),CY,-.07);/* two uprights */
 BX(TW+.2,.06,.06,steel,0,CY+TH/2+.12,-.07);BX(TW+.2,.06,.06,steel,0,CY-TH/2-.12,-.07);
 const feeds=[];
 for(let r=0;r<2;r++)for(let c=0;c<2;c++){const x=(c?-1:1)*(MW+GX)/2,y=CY+(r?-1:1)*(MH+GY)/2;/* facing the wall, your left is +x */
  BX(MW,MH,.07,dark,x,y,-.135);/* monitor case, front face at z -0.17 */
  BX(MW-.02,MH-.02,.05,mid,x,y,-.075);/* the back bulge */
  const sm=new THREE.MeshBasicMaterial({color:0x050607});const s=new THREE.Mesh(new THREE.PlaneGeometry(SW,SH),sm);s.rotation.y=Math.PI;s.position.set(x,y,-.172);g.add(s);parts.screens.push(s);
  /* the label strip and NO SIGNAL overlay, drawn on its own canvas, a hair in front of the screen */
  const cv=document.createElement('canvas');cv.width=512;cv.height=288;const tex=new THREE.CanvasTexture(cv);
  const ov=new THREE.Mesh(new THREE.PlaneGeometry(SW,SH),new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false}));ov.rotation.y=Math.PI;ov.position.set(x,y,-.176);g.add(ov);
  /* a small power LED and a brand-less badge on the case */
  const led=new THREE.Mesh(new THREE.SphereGeometry(.008,6,4),new THREE.MeshBasicMaterial({color:0x40ff60}));led.position.set(x-SW/2+.02,y-MH/2+.022,-.172);g.add(led);
  feeds.push({cv,tex,txt:'',live:false,n:r*2+c})}
 /* a cable conduit up to the ceiling */
 BX(.08,3.4-(CY+TH/2+.15),.06,dark,TW/2-.2,(3.4+CY+TH/2+.15)/2,-.05);
 /* ---------- the control desk ---------- */
 BX(1.3,.05,.42,olive,0,1.0,-.21);/* desk top */
 BX(1.3,.12,.03,olive,0,.945,-.405);/* front lip */
 for(const sx of[-1,1]){/* a diagonal bracket from the wall plate up to the underside of the desk */const A=new THREE.Vector3(sx*.55,.73,-.03),Bv=new THREE.Vector3(sx*.55,.975,-.37),d=Bv.clone().sub(A);const br=new THREE.Mesh(new THREE.BoxGeometry(.04,d.length(),.04),steel);br.position.copy(A).add(Bv).multiplyScalar(.5);br.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());g.add(br)}
 BX(1.3,.3,.03,olive,0,.84,-.015);/* wall plate for the brackets */
 BX(.5,.04,.22,dark,-.25,1.045,-.2);/* control panel */
 {const base=new THREE.Mesh(new THREE.CylinderGeometry(.04,.05,.03,14),dark);base.position.set(-.38,1.08,-.2);g.add(base);
  const st=new THREE.Group();st.position.set(-.38,1.09,-.2);g.add(st);parts.stick=st;
  const sh=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.12,8),steel);sh.position.y=.06;st.add(sh);const kn=new THREE.Mesh(new THREE.SphereGeometry(.028,12,8),M(0xb02020,{roughness:.4}));kn.position.y=.13;st.add(kn)}
 for(let i=0;i<4;i++){const m=new THREE.MeshStandardMaterial({color:0x223322,emissive:0x40ff80,emissiveIntensity:.15,roughness:.4});const b=new THREE.Mesh(new THREE.BoxGeometry(.045,.02,.045),m);b.position.set(-.27+(3-i)*.065,1.075,-.22);g.add(b);parts.buttons.push(b)}
 /* button labels */{const c=document.createElement('canvas');c.width=256;c.height=32;const x=c.getContext('2d');x.fillStyle='#1a1c1e';x.fillRect(0,0,256,32);x.fillStyle='#c8d0c0';x.font='bold 18px '+FONT;x.textAlign='center';
  for(let i=0;i<4;i++)x.fillText('CAM '+(i+1),32+i*64,23,60);
  const pg=new THREE.PlaneGeometry(.26,.0325);pg.rotateZ(Math.PI);const p=new THREE.Mesh(pg,new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c)}));p.rotation.x=-Math.PI/2;p.position.set(-.1725,1.0655,-.155);g.add(p)}
 /* a little logbook and a mug, so it looks used */
 BX(.22,.03,.3,M(0x5a3a22,{roughness:.9}),.35,1.04,-.22);
 {const mug=new THREE.Mesh(new THREE.CylinderGeometry(.04,.038,.1,14),M(0xd8d0c0,{roughness:.5,metalness:0}));mug.position.set(.55,1.075,-.25);g.add(mug)}
 /* ---------- labels, REC and static ---------- */
 const clock=()=>{const d=new Date();return[d.getHours(),d.getMinutes(),d.getSeconds()].map(v=>String(v).padStart(2,'0')).join(':')};
 function draw(f,t){const x=f.cv.getContext('2d'),w=512,h=288;x.clearRect(0,0,w,h);
  if(!f.live){/* no signal: static, a grey card */for(let i=0;i<900;i++){const v=Math.random()*255|0;x.fillStyle='rgba('+v+','+v+','+v+',.9)';x.fillRect(Math.random()*w,Math.random()*h,4,3)}
   x.fillStyle='rgba(20,22,24,.85)';x.fillRect(w/2-130,h/2-34,260,68);x.fillStyle='#e8e8e8';x.font='bold 40px '+FONT;x.textAlign='center';x.textBaseline='middle';x.fillText('NO SIGNAL',w/2,h/2+2);
   x.font='600 18px '+FONT;x.fillStyle='#a0a8a0';x.fillText('CAM '+(f.n+1),w/2,h/2+50);f.tex.needsUpdate=true;return}
  x.fillStyle='rgba(0,0,0,.55)';x.fillRect(0,h-34,w,34);x.fillStyle='#e8f0e0';x.font='600 20px '+FONT;x.textAlign='left';x.textBaseline='middle';x.fillText(f.txt,12,h-17,w-140);
  x.textAlign='right';x.fillText(clock(),w-12,h-17);x.textAlign='left';x.font='bold 20px '+FONT;x.fillText('CAM '+(f.n+1),12,20);
  if(Math.floor(t*1.6)%2==0){x.fillStyle='#ff3020';x.beginPath();x.arc(w-60,20,7,0,7);x.fill();}x.fillStyle='#e8f0e0';x.textAlign='right';x.fillText('REC',w-12,21);
  /* corner brackets of a camera view */x.strokeStyle='rgba(232,240,224,.7)';x.lineWidth=3;for(const[a,b,sx,sy]of[[16,40,1,1],[w-16,40,-1,1],[16,h-48,1,-1],[w-16,h-48,-1,-1]]){x.beginPath();x.moveTo(a,b+sy*18);x.lineTo(a,b);x.lineTo(a+sx*28,b);x.stroke()}
  f.tex.needsUpdate=true}
 let T=0,acc=0;
 g.userData.parts=parts;
 g.userData.setFeed=function(i,txt,live){const f=feeds[i];if(!f)return;f.txt=txt||'';f.live=!!live;parts.buttons[i].material.emissiveIntensity=live?1.2:.15;parts.screens[i].material.color.setHex(live&&parts.screens[i].material.map?0xffffff:0x050607);draw(f,T)};
 g.userData.update=function(dt){T+=dt;acc+=dt;if(acc<.1)return;acc=0;for(const f of feeds)draw(f,T)};
 for(let i=0;i<4;i++)g.userData.setFeed(i,'',false);
 return g}

const SQMON={banks:[],feeds:[],rr:0,fps:60,skip:0};
{const cb10=cwBuild;cwBuild=function(q){const r=cb10.apply(this,arguments);try{if(q.cw&&!q.cw.mon){q.cw.mon=1;SQMON.banks=[];SQMON.feeds=[];
  for(let i=0;i<4;i++){const ox0=CWB.x0+i*10,b=mkSquadMonitors();b.position.set(ox0+.15,0,-853);b.rotation.y=-Math.PI/2;b.userData.dpKeep=1;b.userData.noChunk=1;q.g.add(b);SQMON.banks.push(b);
   q.obs.push({x0:ox0+.15,x1:ox0+.57,z0:-853.65,z1:-852.35});for(let k=0;k<4;k++)b.userData.setFeed(k,'',false)}q.obsDirty=1}}catch(e){conLog('error','squad monitors: '+e.message)}return r}}
/* which office you are standing in (-1 if none) */
function smOffice(q){if(q.seat||q.inBus||!q.cw)return -1;const lz=P.z-q.OZ;if(lz<CWB.z0||lz>CWB.z1||P.x<CWB.x0||P.x>CWB.x1)return -1;return Math.min(3,Math.floor((P.x-CWB.x0)/10))}
/* a feed: one squad, one small camera, one render target */
function smFeedFor(s){let f=SQMON.feeds.find(f=>f.s===s);if(!f){const cam=new THREE.PerspectiveCamera(55,16/9,.5,400);cam.layers.enable(PL_FAR);const rt=new THREE.WebGLRenderTarget(320,180);f={s,cam,rt,init:0,lostT:0,a:Math.random()*6};SQMON.feeds.push(f)}return f}
function smAim(q,f,dt){const s=f.s,u=s.v&&s.v[0],v=u&&u.v;let px,py,pz,lx,ly,lz;
 if(s.ph=='work'&&s.loc){f.a+=dt*.12;const cx=s.loc.x,cz=s.loc.z;px=cx+Math.cos(f.a)*12;pz=cz+Math.sin(f.a)*12;py=6;lx=cx;ly=1;lz=cz}
 else if(v){const fx=-Math.sin(v.h),fz=-Math.cos(v.h);px=v.x-fx*14;pz=v.z-fz*14;py=(v.y||0)+7;lx=v.x+fx*6;ly=(v.y||0)+1;lz=v.z+fz*6}else return false;
 const c=f.cam,k=f.init?.1:1;f.init=1;c.position.x+=(px-c.position.x)*k;c.position.y+=(py-c.position.y)*k;c.position.z+=(pz+q.OZ-c.position.z)*k;f.lk=f.lk||new THREE.Vector3(lx,ly,lz+q.OZ);f.lk.x+=(lx-f.lk.x)*k;f.lk.y+=(ly-f.lk.y)*k;f.lk.z+=(lz+q.OZ-f.lk.z)*k;c.lookAt(f.lk);return true}
/* draw one feed: show the scenery and vehicles near ITS camera for a moment (the desert hides what is far from you) */
function smRender(q,f){const c=f.cam,cx=c.position.x,cz=c.position.z-q.OZ,R2=250*250,flip=[];
 for(const ch of q.chunks||[]){const u=ch.userData,dx=u.cx-cx,dz=u.cz-cz;if(dx*dx+dz*dz<R2+(u.ext||0)*(u.ext||0)*2){if(!ch.visible){ch.visible=true;flip.push(ch)}if(u.smg&&!u.smg.visible){u.smg.visible=true;flip.push(u.smg)}}}
 for(const v of q.vehs||[]){if(v.gone||!v.m)continue;const dx=v.x-cx,dz=v.z-cz;if(dx*dx+dz*dz<R2&&!v.m.visible){v.m.visible=true;flip.push(v.m)}}
 const old=R.getRenderTarget();try{R.setRenderTarget(f.rt);R.render(S,c)}finally{R.setRenderTarget(old);for(const o of flip)o.visible=false}}
{const ru10=busRoamUpd;busRoamUpd=function(q,dt){const r=ru10.apply(this,arguments);try{sqmTick(q,dt)}catch(e){conLog('error','squad monitors: '+e.message)}return r}}
function sqmTick(q,dt){const C=q.cw;if(!C||!SQMON.banks.length)return;const oi=smOffice(q);if(oi<0||oi!==cwSlot(q))return;const B=SQMON.banks[oi],up=B.userData;
 SQMON.fps+=(1/Math.max(dt,.001)-SQMON.fps)*.05;up.update(dt);
 /* up to four squads: the ones still out, and the ones just lost (their last picture, for 10 s) */const list=[];for(const s of C.sq){if(!s.done)list.push(s);else if(s.st=='lost'){const f=SQMON.feeds.find(f=>f.s===s);if(f&&(f.lostT=(f.lostT||0)+dt)<10)list.push(s)}}
 const parts=up.parts;for(let i=0;i<4;i++){const s=list[i],scr=parts.screens[i],btn=parts.buttons[i];
  if(!s){if(scr.material.map){scr.material.map=null;scr.material.needsUpdate=true}up.setFeed(i,'',false);if(btn)btn.material.emissiveIntensity=.15;continue}
  const f=smFeedFor(s),lost=s.done;if(scr.material.map!==f.rt.texture){scr.material.map=f.rt.texture;scr.material.needsUpdate=true}
  up.setFeed(i,lost?'SQUAD '+s.nm+' · SIGNAL LOST':'SQUAD '+s.nm+' · '+String(s.st||'').toUpperCase(),!lost);if(btn)btn.material.emissiveIntensity=lost?.15:1.2;if(!lost)smAim(q,f,dt)}
 /* one picture per frame, round robin; half as often when the frame rate is low */const live=list.filter(s=>!s.done);if(!live.length)return;if(SQMON.fps<30&&(SQMON.skip^=1))return;
 SQMON.rr=(SQMON.rr+1)%live.length;const f=smFeedFor(live[SQMON.rr]);if(f.init)smRender(q,f)}
