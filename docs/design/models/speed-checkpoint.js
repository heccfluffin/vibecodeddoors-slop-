/* =====================================================================================================
   mkSpeedCheckpoint(): a Highway Patrol speed checkpoint. A radar speed trailer with a big LED "YOUR SPEED" board,
   a taper of traffic cones, and a "SPEED CHECK AHEAD / LIMIT 70 km/h" warning sign (a separate group, placed up the road).

   SIZE      Trailer 1.4 m wide, 3.0 m long with its tongue, board top at 2.75 m. Cones over 18 m.
   ORIGIN    The trailer's centre, on the ground, standing on the road's shoulder.
   FRONT     -z = towards the traffic it measures (the board faces -z). Lay it out with the road running along z:
             the cones are on the -x side (the lane edge), from z -16 to -2.8, tapering in towards the trailer.
             The police car parks at g.userData.CAR (just past the trailer, nose out, ready to chase).
   PARTS     g.userData.parts:
             board     Mesh with the LED canvas (use setSpeed, not the mesh).
             strobes   [left, right] Meshes. update() flashes them while a car is over the limit.
             cones     Array of the 7 cone Meshes (knock-over-able: tip one with rotation.x = 1.5 if a car hits it).
   USE       g.userData.setSpeed(kmh, limit)   shows the number. Under the limit: green. Over: amber, and "SLOW DOWN"
                                               blinks. 40+ over: red, and "STOP" blinks. kmh = 0 / null: blank.
             g.userData.update(dt)             call while a player is within ~150 m (strobes, blinking).
             g.userData.warn                   Group: the warning sign. NOT added to g. Add it to the scene yourself,
                                               about 70 m before the trailer on the same side, facing the traffic.
             g.userData.CAR                    {x, z, ry}: where the patrol car parks (local, with ry = its heading).
             g.userData.LIMIT                  70 (km/h). km/h = m/s × 3.6.
   COLLISION Trailer box x -0.75 … 0.75, z -1.0 … 2.0. Cones: none (cars knock them over; see the spec).
             Warning sign post: 0.1 × 0.1.
   ===================================================================================================== */
function mkSpeedCheckpoint(){
 const g=new THREE.Group();
 const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.55,metalness:.3},o||{}));
 const yel=M(0xe8b818,{roughness:.5}),dark=M(0x1c1e20,{roughness:.5}),steel=M(0x8a9096,{metalness:.7,roughness:.35}),tyre=M(0x161616,{roughness:.9,metalness:0});
 const BX=(w,h,d,m,x,y,z,p)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);(p||g).add(o);return o};
 const CYL=(r1,r2,h,m,x,y,z,p,s)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,s||14),m);o.position.set(x,y,z);(p||g).add(o);return o};
 const beam=(a,b,t,m,p)=>{const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A);const o=new THREE.Mesh(new THREE.BoxGeometry(t,d.length(),t),m);o.position.copy(A).add(B).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());(p||g).add(o);return o};
 const FONT='"Barlow Semi Condensed",DoorsSans,Arial,sans-serif';
 const LIMIT=70,parts={cones:[]};
 /* ---------- the trailer ---------- */
 BX(1.3,.55,1.9,yel,0,.68,.5);/* body: z -0.45 … 1.45 */
 BX(1.32,.06,1.92,dark,0,.98,.5);/* lid trim */
 for(const sx of[-1,1]){/* wheels and mudguards */const w=CYL(.3,.3,.2,tyre,sx*.76,.3,.5,null,18);w.rotation.z=Math.PI/2;const hb=CYL(.14,.14,.21,steel,sx*.76,.3,.5);hb.rotation.z=Math.PI/2;
  const mg=new THREE.Mesh(new THREE.CylinderGeometry(.36,.36,.24,18,1,true,0,Math.PI),dark);mg.rotation.z=Math.PI/2;mg.rotation.y=sx<0?Math.PI:0;mg.position.set(sx*.76,.3,.5);mg.material=new THREE.MeshStandardMaterial({color:0x1c1e20,roughness:.5,side:THREE.DoubleSide});g.add(mg)}
 BX(1.36,.08,.08,steel,0,.36,.5);/* axle */
 /* the tongue (A-frame) to the back, with a jack stand */
 beam([-.55,.5,1.45],[0,.5,2.4],.07,steel);beam([.55,.5,1.45],[0,.5,2.4],.07,steel);CYL(.05,.05,.12,dark,0,.5,2.45);
 CYL(.035,.035,.5,steel,0,.25,2.25);CYL(.07,.07,.04,dark,0,.02,2.25);/* jack and its foot */
 /* the front stands (so it sits level) */for(const sx of[-1,1]){CYL(.03,.03,.38,steel,sx*.5,.21,-.35);BX(.12,.03,.12,dark,sx*.5,.015,-.35)}
 /* solar panel on top, tilted up */{const sp=new THREE.Group();sp.position.set(0,1.05,.9);sp.rotation.x=-.35;g.add(sp);
  const c=document.createElement('canvas');c.width=128;c.height=128;const x=c.getContext('2d');x.fillStyle='#1a2a4a';x.fillRect(0,0,128,128);x.strokeStyle='#8a98b0';x.lineWidth=2;for(let i=0;i<=128;i+=32){x.beginPath();x.moveTo(i,0);x.lineTo(i,128);x.stroke();x.beginPath();x.moveTo(0,i);x.lineTo(128,i);x.stroke()}
  BX(1.1,.04,.9,[steel,steel,M(0xffffff,{map:new THREE.CanvasTexture(c),metalness:.4,roughness:.25}),steel,steel,steel],0,.02,0,sp);for(const sx of[-1,1])BX(.04,.12,.04,steel,sx*.45,-.06,-.3,sp)}
 /* ---------- the mast and the LED board, facing -z ---------- */
 for(const sx of[-1,1])BX(.08,1.85,.08,steel,sx*.5,.98+.92,-.2);
 BX(1.42,1.37,.14,dark,0,2.08,-.25);/* board case: y 1.395 … 2.765, front face at z -0.32 */
 const cv=document.createElement('canvas');cv.width=272;cv.height=256;const bx=cv.getContext('2d');const btex=new THREE.CanvasTexture(cv);
 const board=new THREE.Mesh(new THREE.PlaneGeometry(1.3,1.25),new THREE.MeshBasicMaterial({map:btex}));board.rotation.y=Math.PI;board.position.set(0,2.08,-.322);g.add(board);parts.board=board;
 /* radar head under the board, and strobes on the top corners */
 BX(.22,.14,.16,dark,0,1.32,-.28);{const lens=new THREE.Mesh(new THREE.CircleGeometry(.05,16),M(0x30343a,{metalness:.8,roughness:.2}));lens.rotation.y=Math.PI;lens.position.set(0,1.32,-.361);g.add(lens)}
 parts.strobes=[-1,1].map(sx=>{const m=new THREE.MeshStandardMaterial({color:sx<0?0xff3020:0x3060ff,emissive:sx<0?0xff2010:0x2050ff,emissiveIntensity:.1,transparent:true,opacity:.9,roughness:.2});CYL(.05,.06,.03,dark,sx*.6,2.78,-.25);const s=CYL(.045,.045,.09,m,sx*.6,2.84,-.25);s.material=m;return s});
 /* a reflective chevron strip on the trailer's back and front */
 {const c=document.createElement('canvas');c.width=256;c.height=32;const x=c.getContext('2d');x.fillStyle='#e83020';x.fillRect(0,0,256,32);x.fillStyle='#f0f0f0';for(let i=-32;i<256;i+=32){x.beginPath();x.moveTo(i,32);x.lineTo(i+16,32);x.lineTo(i+32,0);x.lineTo(i+16,0);x.fill()}
  const m=M(0xffffff,{map:new THREE.CanvasTexture(c),roughness:.4});for(const z of[-.451,1.451]){const p=new THREE.Mesh(new THREE.PlaneGeometry(1.2,.15),m);p.position.set(0,.55,z);if(z<0)p.rotation.y=Math.PI;g.add(p)}}
 /* the HIGHWAY PATROL word on both sides, painted */
 {const c=document.createElement('canvas');c.width=512;c.height=96;const x=c.getContext('2d');x.clearRect(0,0,512,96);x.fillStyle='#1c1e20';x.font='bold 56px '+FONT;x.textAlign='center';x.textBaseline='middle';x.fillText('HIGHWAY PATROL',256,50,490);
  const m=new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(c),transparent:true,alphaTest:.3,roughness:.5});for(const sx of[-1,1]){const p=new THREE.Mesh(new THREE.PlaneGeometry(1.6,.3),m);p.rotation.y=sx*Math.PI/2;p.position.set(sx*.651,.72,.5);g.add(p)}}
 /* ---------- cones ---------- */
 const coneTex=(()=>{const c=document.createElement('canvas');c.width=32;c.height=128;const x=c.getContext('2d');x.fillStyle='#f05a14';x.fillRect(0,0,32,128);x.fillStyle='#f4f4ec';x.fillRect(0,22,32,18);x.fillRect(0,56,32,14);return new THREE.CanvasTexture(c)})();
 const coneM=M(0xffffff,{map:coneTex,roughness:.6,metalness:0}),baseM=M(0x2a2a2a,{roughness:.8,metalness:0});
 const mkCone=(x,z)=>{const c=new THREE.Group();c.position.set(x,0,z);g.add(c);BX(.38,.03,.38,baseM,0,.015,0,c);const k=new THREE.Mesh(new THREE.CylinderGeometry(.025,.15,.68,16,1,true),coneM);k.position.y=.37;c.add(k);
  const tip=new THREE.Mesh(new THREE.CircleGeometry(.025,12),coneM);tip.rotation.x=-Math.PI/2;tip.position.y=.71;c.add(tip);parts.cones.push(c);return c};
 for(let i=0;i<7;i++){const z=-16+i*2.2,x=-2.8+Math.min(1,i/6)*1.0;mkCone(x,z)}/* the taper ends 1.8 m before the trailer, 0.9 m clear of its side */
 /* ---------- the warning sign (separate group) ---------- */
 const warn=new THREE.Group();
 {const post=new THREE.Mesh(new THREE.BoxGeometry(.08,2.6,.08),steel);post.position.y=1.3;warn.add(post);
  const sgn=(w,h,draw,y)=>{const c=document.createElement('canvas');c.width=256;c.height=Math.round(256*h/w);const x=c.getContext('2d');draw(x,c.width,c.height);const m=M(0xffffff,{map:new THREE.CanvasTexture(c),roughness:.6,metalness:.1});
   const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,.03),[steel,steel,steel,steel,steel,m]);b.position.set(0,y,-.06);warn.add(b)};
  sgn(.75,.95,(x,w,h)=>{x.fillStyle='#f4f4f0';x.fillRect(0,0,w,h);x.strokeStyle='#111';x.lineWidth=8;x.strokeRect(10,10,w-20,h-20);x.fillStyle='#111';x.textAlign='center';x.textBaseline='middle';x.font='bold 50px '+FONT;x.fillText('SPEED',w/2,h*.2,w-40);x.fillText('LIMIT',w/2,h*.37,w-40);x.font='bold 110px '+FONT;x.fillText(String(LIMIT),w/2,h*.63,w-40);x.font='bold 40px '+FONT;x.fillText('km/h',w/2,h*.86,w-40)},2.05);
  sgn(.75,.3,(x,w,h)=>{x.fillStyle='#e8b818';x.fillRect(0,0,w,h);x.strokeStyle='#111';x.lineWidth=6;x.strokeRect(6,6,w-12,h-12);x.fillStyle='#111';x.textAlign='center';x.textBaseline='middle';x.font='bold 40px '+FONT;x.fillText('SPEED CHECK AHEAD',w/2,h/2+2,w-28)},1.38)}
 /* ---------- the LED board ---------- */
 let cur=null,lim=LIMIT,T=0;
 function drawBoard(){const x=bx,w=272,h=256;x.fillStyle='#0a0b0c';x.fillRect(0,0,w,h);
  x.fillStyle='#e8b818';x.fillRect(0,0,w,46);x.fillStyle='#111';x.font='bold 34px '+FONT;x.textAlign='center';x.textBaseline='middle';x.fillText('YOUR SPEED',w/2,25,w-16);
  const over=cur!=null&&cur>lim,way=cur!=null&&cur>=lim+40,col=cur==null?'#202020':way?'#ff3020':over?'#ffb020':'#40ff60';
  /* big LED digits: drawn as a dot grid clipped to the number */
  if(cur!=null){const t=String(Math.round(cur));const c2=document.createElement('canvas');c2.width=w;c2.height=140;const y2=c2.getContext('2d');y2.fillStyle='#fff';y2.font='bold 132px '+FONT;y2.textAlign='center';y2.textBaseline='middle';y2.fillText(t,w/2,74,w-20);
   const d=y2.getImageData(0,0,w,140).data;x.fillStyle=col;for(let yy=4;yy<140;yy+=7)for(let xx=4;xx<w;xx+=7){if(d[(yy*w+xx)*4+3]>100){x.beginPath();x.arc(xx,52+yy,2.8,0,7);x.fill()}}}
  else{x.fillStyle='#1a1c1e';for(let yy=56;yy<192;yy+=7)for(let xx=4;xx<w;xx+=7){x.beginPath();x.arc(xx,yy,2.2,0,7);x.fill()}}
  const blink=Math.floor(T*3)%2==0;x.fillStyle='#16181a';x.fillRect(0,200,w,56);
  x.font='bold 30px '+FONT;if(way&&blink){x.fillStyle='#ff3020';x.fillText('STOP · POLICE',w/2,228,w-16)}else if(over&&blink){x.fillStyle='#ffb020';x.fillText('SLOW DOWN',w/2,228,w-16)}else{x.fillStyle='#d8d8d0';x.fillText('LIMIT '+lim+' KM/H',w/2,228,w-16)}
  btex.needsUpdate=true}
 g.userData.parts=parts;g.userData.warn=warn;g.userData.LIMIT=LIMIT;g.userData.CAR={x:1.0,z:6.5,ry:0};
 g.userData.setSpeed=function(mph,limit){cur=mph?mph:null;if(limit)lim=limit;drawBoard()};
 let acc=0;g.userData.update=function(dt){T+=dt;acc+=dt;const over=cur!=null&&cur>lim;
  parts.strobes[0].material.emissiveIntensity=over&&Math.floor(T*8)%2==0?3:.1;parts.strobes[1].material.emissiveIntensity=over&&Math.floor(T*8)%2==1?3:.1;
  if(acc>.15){acc=0;drawBoard()}};
 drawBoard();
 return g}
