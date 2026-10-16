/* =====================================================================================================
   mkSquadMonitors(): a wall-mounted bank of four monitors for each General's office, showing live camera feeds
   of your squads, with a small control desk under it (a camera joystick and four CAM buttons).

   SIZE      2.2 m wide (x), from the floor to 2.95 m (y), sticks out 0.42 m from the wall (the desk).
   ORIGIN    On the wall surface, centred, at floor level. Everything is on the -z side of the origin.
   FRONT     -z = into the room (the screens face -z). Put the origin on the wall and turn it to face into the room.
             In the command wing (dx557), use each office's LEFT wall (x = ox0 + 0.15, facing +x:
             rotation.y = -Math.PI / 2), centred at z = -853. The first office's left wall is the outer wall at
             x = CWB.x0 (+0.15); the others are the shared walls. (So no wall gets two banks.)
   PARTS     g.userData.parts:
             screens  Array of 4 Meshes (PlaneGeometry 0.96 × 0.54, 16:9). Order: top-left, top-right, bottom-left,
                      bottom-right as you face them. Each has its own MeshBasicMaterial: set .map to a
                      WebGLRenderTarget's texture to show a camera (see the spec), then setFeed(i, …, true)
                      (it turns the screen's colour white when it has a map, black otherwise).
             stick    Group, the camera joystick. rotation.x / rotation.z ±0.35 to tilt it.
             buttons  Array of 4 Meshes (CAM 1–4). Their material's emissiveIntensity: 0.15 off, 1.2 lit.
   USE       g.userData.setFeed(i, text, live)   draws the label strip on screen i: e.g.
                 setFeed(0, 'SQUAD ALPHA · EN ROUTE TO OLD QUARRY', true)   (a red REC dot blinks, time shows)
                 setFeed(3, '', false)                                      (NO SIGNAL with static)
             g.userData.update(dt)  call while the player is in the office: blinks REC, animates the static on
                                     screens with no signal, moves the time.
   COLLISION The desk: x -0.65 … 0.65, z -0.42 … 0 (local). The screens are above head height.
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
