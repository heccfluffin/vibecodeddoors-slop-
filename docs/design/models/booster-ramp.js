/* =====================================================================================================
   mkBoosterRamp(): the new QUARRY SKIP stunt jump. A steel kicker ramp with a glowing booster strip in front of it.
   Drive over the strip and up the ramp: the booster fires you up and over Lookout Mesa.

   SIZE      6.2 m wide (x). 22 m long (z): booster strip z +5 … +17, ramp z -5 … +5. Lip 5.0 m high.
   ORIGIN    Centre of the ramp's footprint (not counting the strip), on the ground.
   FRONT     -z = the way you launch. Cars drive in from +z, over the strip, up, and off the lip at z = -5.
   PROFILE   (local z, deck height y): (+5, 0) → (-1, 1.6) → (-5, 5.0).
             Gentle 15° run-in, then a 40° kicker. In q.ramps (local, before placing), two ramps along z, dir -1:
               {z0:+5, len:6, H:1.6, y0:0}     and     {z0:-1, len:4, H:3.4, y0:1.6, sj:1, boost:1}
             x0/x1 = ±2.9 (the deck between the side rails).
   BOOST     The strip is z +5 … +17, x ±2.5 (only lights; it is flat, height 0.04). See the spec for the launch.
   PARTS     g.userData.parts:
             strip   Mesh. Its material map scrolls: strip.material[2].map.offset.y -= dt * 1.5 (chevrons run forward, towards -z).
             lights  Array of 8 Meshes (the lamps along the sides). Material is shared: lights[0].material.
                     Pulse with  m.emissiveIntensity = 0.6 + 0.6 * Math.max(0, Math.sin(t*8)).
             When a car fires off it: set the shared lamp material to full (2.0) for 0.5 s.
   COLLISION The ramp itself is driven on (q.ramps, above), so no box on the deck. Boxes for the sides and the
             open front (so you can't drive under the high end):
               side rails   x ±3.0 … ±3.12, z -5 … +5 (only where the deck is above 0.4 m: z -5 … +3.5)
               underneath   x -3.1 … +3.1, z -5.3 … -1   (the space under the kicker: solid)
               sign post    0.2 × 0.2 at (+4.2, +9)
   ===================================================================================================== */
function mkBoosterRamp(){
 const g=new THREE.Group();
 const steel=new THREE.MeshStandardMaterial({color:0x6a6e74,metalness:.6,roughness:.45});
 const steelD=new THREE.MeshStandardMaterial({color:0x3a3d42,metalness:.55,roughness:.55});
 const red=new THREE.MeshStandardMaterial({color:0xc02a1e,metalness:.3,roughness:.5});
 const yel=new THREE.MeshStandardMaterial({color:0xe0b020,metalness:.2,roughness:.6});
 const lampM=new THREE.MeshStandardMaterial({color:0x60e0ff,emissive:0x30c8ff,emissiveIntensity:1});
 const BX=(w,h,d,m,x,y,z,p)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);(p||g).add(o);return o};
 /* deck height along the ramp (the top of the deck plates) */
 const P=[[5,0],[-1,1.6],[-5,5.0]];
 const deckY=z=>{if(z>=P[1][0])return P[0][1]+(P[1][1]-P[0][1])*(P[0][0]-z)/(P[0][0]-P[1][0]);return P[1][1]+(P[2][1]-P[1][1])*(P[1][0]-z)/(P[1][0]-P[2][0])};
 /* chevrons pointing -z: a 256 px tile = 2 m × 2 m */
 const chev=(w,l,glow)=>{const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle=glow?'#0a1a22':'#4a4e54';x.fillRect(0,0,256,256);
  if(!glow){x.fillStyle='rgba(255,255,255,.06)';for(let i=0;i<256;i+=16)for(let j=(i/16%2)*8;j<256;j+=16)x.fillRect(j,i,6,2)}/* tread plate */
  x.strokeStyle=glow?'#60e8ff':'#e0b020';x.lineWidth=22;x.lineCap='square';for(const y0 of[60,188]){x.beginPath();x.moveTo(40,y0+40);x.lineTo(128,y0-30);x.lineTo(216,y0+40);x.stroke()}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(w/2,l/2);
  return new THREE.MeshStandardMaterial(glow?{map:t,emissiveMap:t,emissive:0xffffff,emissiveIntensity:.9,roughness:.6}:{map:t,metalness:.5,roughness:.5})};
 const parts={lights:[]};
 /* ---------- the deck: two plates, each with its top face on the profile line ---------- */
 const T=.15;
 for(let i=0;i<2;i++){const[z0,y0]=P[i],[z1,y1]=P[i+1],L=Math.hypot(z1-z0,y1-y0),a=Math.atan2(y1-y0,z0-z1);/* angle up towards -z */
  const nz=Math.sin(a),ny=Math.cos(a);/* deck normal (points up and towards +z) */
  const mats=[steelD,steelD,chev(6.2,L,false),steelD,steelD,steelD];
  const d=new THREE.Mesh(new THREE.BoxGeometry(6.2,T,L),mats);d.position.set(0,(y0+y1)/2-ny*T/2,(z0+z1)/2-nz*T/2);d.rotation.x=a;g.add(d);
  /* side rails on the deck edges: red, 0.5 m tall */
  for(const sx of[-1,1]){const r=new THREE.Mesh(new THREE.BoxGeometry(.12,.5,L),red);r.position.set(sx*3.06,(y0+y1)/2+ny*.25,(z0+z1)/2+nz*.25);r.rotation.x=a;g.add(r)}}
 /* the kink between the two plates: a round pipe hides the seam */
 {const k=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,6.2,12),steel);k.rotation.z=Math.PI/2;k.position.set(0,P[1][1]-.1,P[1][0]);g.add(k)}
 /* the lip: a yellow steel edge at the top */
 BX(6.2,.18,.22,yel,0,P[2][1]-.09,P[2][0]-.11);
 /* ---------- the frame underneath ---------- */
 const post=(x,z)=>{const top=deckY(z)-T/Math.cos(z>=P[1][0]?Math.atan2(1.6,6):Math.atan2(3.4,4))-.02;if(top<.15)return;BX(.18,top,.18,steelD,x,top/2,z);BX(.4,.04,.4,steelD,x,.02,z)};
 for(const z of[2,-1,-3,-4.9])for(const x of[-2.8,-1,1,2.8])post(x,z);
 /* cross braces under the kicker, and the open front closed with a mesh grille so nothing drives under it */
 for(const z of[-3,-4.9]){const h=deckY(z)-.6;BX(5.8,.12,.12,steelD,0,h,z);BX(5.8,.12,.12,steelD,0,h/2,z)}
 for(const sx of[-1,1]){/* side bracing of the kicker */const zz=[-1,-3,-4.9];for(let i=0;i<2;i++){const a=new THREE.Vector3(sx*2.9,.2,zz[i]),b=new THREE.Vector3(sx*2.9,deckY(zz[i+1])-.5,zz[i+1]),d=b.clone().sub(a);const m=new THREE.Mesh(new THREE.BoxGeometry(.1,d.length(),.1),steelD);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());g.add(m)}}
 {const c=document.createElement('canvas');c.width=512;c.height=416;const x=c.getContext('2d');x.clearRect(0,0,512,416);x.strokeStyle='#2a2d32';x.lineWidth=6;for(let i=-416;i<512;i+=34){x.beginPath();x.moveTo(i,0);x.lineTo(i+416,416);x.stroke();x.beginPath();x.moveTo(i+416,0);x.lineTo(i,416);x.stroke()}
  const t=new THREE.CanvasTexture(c);const gm=new THREE.MeshStandardMaterial({map:t,transparent:true,alphaTest:.5,side:THREE.DoubleSide,metalness:.5,roughness:.6});
  const gr=new THREE.Mesh(new THREE.PlaneGeometry(6.0,4.85),gm);gr.position.set(0,4.85/2,-5.26);g.add(gr)}
 /* ---------- lamps along the sides of the deck ---------- */
 for(const sx of[-1,1])for(const z of[4,1.5,-1.5,-3.8]){const y=deckY(z)+.55;const l=new THREE.Mesh(new THREE.SphereGeometry(.09,10,8),lampM);l.position.set(sx*3.06,y+(z<-1?.12:0),z);g.add(l);parts.lights.push(l)}
 /* ---------- the booster strip in front ---------- */
 {const m=chev(5,12,true);const s=new THREE.Mesh(new THREE.BoxGeometry(5,.04,12),[steelD,steelD,m,steelD,steelD,steelD]);s.position.set(0,.02,11);g.add(s);parts.strip=s;
  for(const sx of[-1,1])BX(.25,.06,12,yel,sx*2.625,.03,11)}
 /* ---------- the sign ---------- */
 {BX(.2,3.2,.2,steelD,4.2,1.6,9);const c=document.createElement('canvas');c.width=512;c.height=256;const x=c.getContext('2d');x.fillStyle='#c02a1e';x.fillRect(0,0,512,256);x.strokeStyle='#fff';x.lineWidth=10;x.strokeRect(10,10,492,236);x.fillStyle='#fff';x.textAlign='center';x.textBaseline='middle';
  x.font='bold 74px "Barlow Semi Condensed",DoorsSans,Arial,sans-serif';x.fillText('QUARRY SKIP',256,84,470);x.font='600 40px "Barlow Semi Condensed",DoorsSans,Arial,sans-serif';x.fillText('BOOSTER · OVER THE MESA',256,160,470);x.fillText('FULL SEND ▶',256,208,470);
  const sm=new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(c),roughness:.7});BX(2.0,1.0,.06,[steelD,steelD,steelD,steelD,sm,steelD],4.2,2.9,9.13)}
 g.userData.parts=parts;
 return g}
