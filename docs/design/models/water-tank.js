/* =====================================================================================================
   mkWaterTank(): a corrugated steel rainwater tank for the WATER DELIVERY squad job. It stands at every delivery spot
   that has no tank of its own (Mining shack, Campfire). The caretaker pours the jerrycans into its fill funnel,
   and the float in the sight tube shows the level going up.

   SIZE      2.3 m across (tank 2.2 m on a 2.5 m concrete plinth), 2.3 m tall with the roof inlet.
   ORIGIN    Centre of the plinth, on the ground.
   FRONT     -z = the fill funnel (top at 1.08 m, where you pour) and the tap. Put the front where the truck parks.
   PARTS     g.userData.parts:
             float   Mesh, the red float in the sight tube. Use setLevel() rather than moving it yourself.
             valve   Mesh, the tap handle. rotation.z: 0 shut, 1.4 open.
             drip    Mesh, a water drip under the tap. visible = true while the tap is open.
             surface Mesh, the water you see through the open roof hatch (moves with the level).
   USE       g.userData.setLevel(f)   f = 0 (empty) … 1 (full). Moves the float and the water surface.
             g.userData.FUNNEL        {x, y, z}: the top of the funnel (local), where a pour should aim.
             g.userData.STAND         {x, z}: where the caretaker stands to pour (local), facing +z.
   ANIMATION Each jerrycan poured: setLevel(level + 0.12) over 2 s. Start each job at 0.2.
   COLLISION One box: x -1.2 … 1.2, z -1.2 … 1.2 (plus the funnel: x -0.2 … 0.2, z -1.45 … -1.2).
   ===================================================================================================== */
function mkWaterTank(){
 const g=new THREE.Group();
 const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.5,metalness:.55},o||{}));
 const cv=(w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);return new THREE.CanvasTexture(c)};
 const FONT='"Barlow Semi Condensed",DoorsSans,Arial,sans-serif';
 const R=1.1,H=1.8,B=.12;/* tank radius, wall height, plinth height */
 const parts={};
 /* plinth */
 {const t=cv(128,128,(x,w,h)=>{x.fillStyle='#8c8a82';x.fillRect(0,0,w,h);for(let i=0;i<500;i++){const v=110+Math.random()*50|0;x.fillStyle='rgba('+v+','+v+','+(v-5)+',.4)';x.fillRect(Math.random()*w,Math.random()*h,2,2)}});
  const m=new THREE.Mesh(new THREE.CylinderGeometry(1.25,1.28,B,32),[M(0x8c8a82,{roughness:1,metalness:0}),M(0xffffff,{map:t,roughness:1,metalness:0}),M(0x8c8a82,{roughness:1,metalness:0})]);m.position.y=B/2;g.add(m)}
 /* the wall: horizontal corrugations, 8 ridges per 0.6 m (a 256 px tile), so the texture repeats 3 times up the wall */
 const corr=cv(64,256,(x,w,h)=>{for(let i=0;i<8;i++){const y=i*32;const gr=x.createLinearGradient(0,y,0,y+32);gr.addColorStop(0,'#c8ccce');gr.addColorStop(.35,'#eef0f0');gr.addColorStop(.6,'#9aa0a4');gr.addColorStop(1,'#c0c4c6');x.fillStyle=gr;x.fillRect(0,y,w,32)}});
 corr.wrapS=corr.wrapT=THREE.RepeatWrapping;corr.repeat.set(12,3);
 const wallM=M(0xffffff,{map:corr,metalness:.6,roughness:.42});
 {const w=new THREE.Mesh(new THREE.CylinderGeometry(R,R,H,48,1,true),wallM);w.position.y=B+H/2;g.add(w);
  /* the inside, dark (seen through the hatch) */const inn=new THREE.Mesh(new THREE.CylinderGeometry(R-.02,R-.02,H,48,1,true),M(0x2a3034,{side:THREE.BackSide,roughness:.8}));inn.position.y=B+H/2;g.add(inn);
  for(const y of[B+.03,B+H-.03]){const r=new THREE.Mesh(new THREE.TorusGeometry(R+.01,.03,6,48),M(0x9aa0a4));r.rotation.x=Math.PI/2;r.position.y=y;g.add(r)}}
 /* the roof: a shallow cone, with a round hatch and a strainer */
 const RY=B+H;
 {const roof=new THREE.Mesh(new THREE.CylinderGeometry(.32,R+.04,.32,48,1,true),M(0xb8bcbe,{metalness:.6,roughness:.45,side:THREE.DoubleSide}));roof.position.y=RY+.16;g.add(roof);
  const top=new THREE.Mesh(new THREE.CircleGeometry(.32,32),M(0x3a4246,{roughness:.6}));top.rotation.x=-Math.PI/2;top.position.y=RY+.32;g.add(top);
  /* strainer: a mesh grille ring over the hole */const gt=cv(128,128,(x,w,h)=>{x.clearRect(0,0,w,h);x.strokeStyle='#9aa0a4';x.lineWidth=3;for(let i=0;i<w;i+=10){x.beginPath();x.moveTo(i,0);x.lineTo(i,h);x.stroke();x.beginPath();x.moveTo(0,i);x.lineTo(w,i);x.stroke()}});
  const gr=new THREE.Mesh(new THREE.CircleGeometry(.3,32),M(0xffffff,{map:gt,transparent:true,alphaTest:.5,side:THREE.DoubleSide}));gr.rotation.x=-Math.PI/2;gr.position.y=RY+.335;g.add(gr);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(.32,.025,6,32),M(0x9aa0a4));rim.rotation.x=Math.PI/2;rim.position.y=RY+.33;g.add(rim)}
 /* the water you see through the strainer */
 const surf=new THREE.Mesh(new THREE.CircleGeometry(R-.03,40),new THREE.MeshStandardMaterial({color:0x2a6a8a,roughness:.15,metalness:.2,transparent:true,opacity:.9}));surf.rotation.x=-Math.PI/2;g.add(surf);parts.surface=surf;
 /* fill funnel on the front: a pipe out of the wall at 0.75 m, an elbow, and a funnel at waist height */
 const pipeM=M(0x5a6a72,{metalness:.6,roughness:.4});
 {const p=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.3,12),pipeM);p.rotation.x=Math.PI/2;p.position.set(0,.75,-R-.12);g.add(p);
  const el=new THREE.Mesh(new THREE.SphereGeometry(.055,12,8),pipeM);el.position.set(0,.75,-R-.27);g.add(el);
  const up=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.12,12),pipeM);up.position.set(0,.84,-R-.27);g.add(up);
  const fn=new THREE.Mesh(new THREE.CylinderGeometry(.17,.05,.2,20,1,true),M(0x7a8890,{side:THREE.DoubleSide,metalness:.6,roughness:.4}));fn.position.set(0,.98,-R-.27);g.add(fn);
  const fr=new THREE.Mesh(new THREE.TorusGeometry(.17,.012,6,24),pipeM);fr.rotation.x=Math.PI/2;fr.position.set(0,1.08,-R-.27);g.add(fr)}
 g.userData.FUNNEL={x:0,y:1.08,z:-R-.27};g.userData.STAND={x:0,z:-R-.64};
 /* tap at the bottom front-left, with a drip */
 {const p=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.22,10),pipeM);p.rotation.x=Math.PI/2;const a=-Math.PI/2-.5;/* around the wall, front-left */
  const px=Math.cos(a)*(R+.1),pz=Math.sin(a)*(R+.1);p.position.set(px,.32,pz);p.rotation.y=-a-Math.PI/2;g.add(p);
  const body=new THREE.Mesh(new THREE.BoxGeometry(.07,.09,.07),M(0xb08a3a,{metalness:.8,roughness:.3}));const ox=Math.cos(a)*(R+.22),oz=Math.sin(a)*(R+.22);body.position.set(ox,.32,oz);g.add(body);
  const sp=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.08,8),body.material);sp.position.set(ox,.25,oz);g.add(sp);
  const v=new THREE.Mesh(new THREE.BoxGeometry(.12,.02,.02),M(0xc02a1e,{metalness:.3}));v.position.set(ox,.38,oz);v.rotation.y=-a;g.add(v);parts.valve=v;
  const d=new THREE.Mesh(new THREE.CylinderGeometry(.006,.006,.2,6),new THREE.MeshStandardMaterial({color:0x6ab0d8,transparent:true,opacity:.7}));d.position.set(ox,.11,oz);d.visible=false;g.add(d);parts.drip=d}
 /* sight tube with a float, and a level board behind it, front-right */
 const ga=-Math.PI/2+.45,gx=Math.cos(ga)*(R+.08),gz=Math.sin(ga)*(R+.08);
 {const bd=cv(64,512,(x,w,h)=>{x.fillStyle='#f0ead8';x.fillRect(0,0,w,h);x.fillStyle='#1a1a1a';x.font='bold 22px '+FONT;x.textAlign='center';
   [['FULL',.04],['¾',.27],['½',.5],['¼',.73],['E',.96]].forEach(([s,f])=>{const y=12+f*(h-24);x.fillRect(4,y-1,16,3);x.fillText(s,40,y+8)})});
  const b=new THREE.Mesh(new THREE.PlaneGeometry(.12,1.5),M(0xffffff,{map:bd,metalness:0,roughness:.8}));b.position.set(Math.cos(ga)*(R+.02),B+.15+.75,Math.sin(ga)*(R+.02));b.lookAt(b.position.x*2,b.position.y,b.position.z*2);g.add(b);
  b.position.x+=Math.cos(ga+Math.PI/2)*.08;b.position.z+=Math.sin(ga+Math.PI/2)*.08;
  const tube=new THREE.Mesh(new THREE.CylinderGeometry(.022,.022,1.56,10),new THREE.MeshStandardMaterial({color:0xcfe8f0,transparent:true,opacity:.35,roughness:.05,depthWrite:false}));tube.position.set(gx,B+.15+.75,gz);g.add(tube);
  for(const y of[B+.12,B+.15+1.53]){const c=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.04,10),pipeM);c.position.set(gx,y,gz);g.add(c);const br=new THREE.Mesh(new THREE.BoxGeometry(.02,.02,.1),pipeM);br.position.set((gx+Math.cos(ga)*R)/2,y,(gz+Math.sin(ga)*R)/2);br.rotation.y=-ga+Math.PI/2;g.add(br)}
  const fl=new THREE.Mesh(new THREE.SphereGeometry(.018,10,8),M(0xd02a1e,{metalness:.1,roughness:.4}));fl.position.set(gx,0,gz);g.add(fl);parts.float=fl}
 /* stencilled name, on a curved patch just off the wall */
 {const t=cv(512,128,(x,w,h)=>{x.clearRect(0,0,w,h);x.fillStyle='rgba(30,50,60,.85)';x.font='bold 64px '+FONT;x.textAlign='center';x.textBaseline='middle';x.fillText('DRINKING WATER',w/2,h/2,w-20)});
  const len=1.8/(R+.012);/* 1.8 m of wall */const pt=new THREE.Mesh(new THREE.CylinderGeometry(R+.012,R+.012,.45,24,1,true,Math.PI-len/2+.9,len),new THREE.MeshStandardMaterial({map:t,transparent:true,alphaTest:.3,roughness:.6}));pt.position.y=B+1.45;g.add(pt)}
 g.userData.parts=parts;
 g.userData.setLevel=function(f){f=Math.max(0,Math.min(1,f));parts.float.position.y=B+.15+.02+f*1.46;surf.position.y=B+.05+f*(H-.12);surf.visible=f>.01};
 g.userData.setLevel(.2);
 return g}
