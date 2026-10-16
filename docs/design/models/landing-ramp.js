/* =====================================================================================================
   mkLandingRamp(): where the QUARRY SKIP booster jump comes down, on the far (south) side of Lookout Mesa.
   A wide steel down-ramp: you land on the steep top part and roll off the gentle bottom part.

   SIZE      10.4 m wide (x), 13 m long (z), 4.4 m high at the back.
   ORIGIN    Centre of the footprint, on the ground.
   FRONT     -z = the way you are going when you land (the same way the booster ramp launches).
   PROFILE   (local z, deck height y): (+6.5, 4.4) → (+1.5, 1.0) → (-6.5, 0).
             In q.ramps (local), two ramps along z, dir -1, going DOWN (H negative):
               {z0:+6.5, len:5, H:-3.4, y0:4.4, land:1}     and     {z0:+1.5, len:8, H:-1.0, y0:1.0, land:1}
             x0/x1 = ±5.0. (vehGround already takes the lower of a ramp and the ground when H < 0.)
   PARTS     none. Static.
   COLLISION The back is a 4.4 m wall: x -5.2 … 5.2, z +6.4 … +6.7 (you hit it if you fall short, which is the point
             of the spec's landing rule). Side rails: x ±5.0 … ±5.12 along the steep part (z +1.5 … +6.5).
   ===================================================================================================== */
function mkLandingRamp(){
 const g=new THREE.Group();
 const steelD=new THREE.MeshStandardMaterial({color:0x3a3d42,metalness:.55,roughness:.55});
 const yel=new THREE.MeshStandardMaterial({color:0xe0b020,metalness:.2,roughness:.6});
 const red=new THREE.MeshStandardMaterial({color:0xc02a1e,metalness:.3,roughness:.5});
 const BX=(w,h,d,m,x,y,z)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);g.add(o);return o};
 const W=10.4,P=[[6.5,4.4],[1.5,1.0],[-6.5,0]],T=.15;
 const plate=(w,l)=>{const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle='#4a4e54';x.fillRect(0,0,256,256);x.fillStyle='rgba(255,255,255,.06)';for(let i=0;i<256;i+=16)for(let j=(i/16%2)*8;j<256;j+=16)x.fillRect(j,i,6,2);
  /* a yellow target band every 2 m */x.fillStyle='#e0b020';x.fillRect(0,120,256,16);
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(w/2,l/2);return new THREE.MeshStandardMaterial({map:t,metalness:.5,roughness:.5})};
 const deckY=z=>z>=P[1][0]?P[1][1]+(P[0][1]-P[1][1])*(z-P[1][0])/(P[0][0]-P[1][0]):P[2][1]+(P[1][1]-P[2][1])*(z-P[2][0])/(P[1][0]-P[2][0]);
 for(let i=0;i<2;i++){const[z0,y0]=P[i],[z1,y1]=P[i+1],L=Math.hypot(z1-z0,y1-y0),a=Math.atan2(y1-y0,z0-z1);/* negative: going down towards -z */
  const nz=Math.sin(a),ny=Math.cos(a);
  const d=new THREE.Mesh(new THREE.BoxGeometry(W,T,L),[steelD,steelD,plate(W,L),steelD,steelD,steelD]);d.position.set(0,(y0+y1)/2-ny*T/2,(z0+z1)/2-nz*T/2);d.rotation.x=a;g.add(d);
  if(i==0)for(const sx of[-1,1]){const r=new THREE.Mesh(new THREE.BoxGeometry(.12,.35,L),red);r.position.set(sx*5.06,(y0+y1)/2+ny*.175,(z0+z1)/2+nz*.175);r.rotation.x=a;g.add(r)}}
 {const k=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,W,12),steelD);k.rotation.z=Math.PI/2;k.position.set(0,P[1][1]-.1,P[1][0]);g.add(k)}
 /* the top edge and the back wall (solid steel panel with yellow and black stripes) */
 BX(W,.18,.22,yel,0,P[0][1]-.09,P[0][0]+.11);
 {const c=document.createElement('canvas');c.width=512;c.height=216;const x=c.getContext('2d');x.fillStyle='#1a1a1a';x.fillRect(0,0,512,216);x.fillStyle='#e0b020';for(let i=-216;i<512;i+=48){x.beginPath();x.moveTo(i,216);x.lineTo(i+24,216);x.lineTo(i+24+216,0);x.lineTo(i+216,0);x.fill()}
  const m=new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(c),roughness:.7});/* 512 × 216 = 10.4 m × 4.4 m */
  BX(W,P[0][1]-.18,.2,[steelD,steelD,steelD,steelD,m,steelD],0,(P[0][1]-.18)/2,P[0][0]+.12)}
 /* legs under the steep part, and the sides closed with grilles */
 for(const z of[5,3])for(const x of[-4.8,-1.6,1.6,4.8]){const h=deckY(z)-T/Math.cos(Math.atan2(3.4,5))-.02;BX(.18,h,.18,steelD,x,h/2,z);BX(.4,.04,.4,steelD,x,.02,z)}
 {const c=document.createElement('canvas');c.width=512;c.height=512;const x=c.getContext('2d');x.strokeStyle='#2a2d32';x.lineWidth=6;for(let i=-512;i<512;i+=34){x.beginPath();x.moveTo(i,0);x.lineTo(i+512,512);x.stroke();x.beginPath();x.moveTo(i+512,0);x.lineTo(i,512);x.stroke()}
  const t=new THREE.CanvasTexture(c);const gm=new THREE.MeshStandardMaterial({map:t,transparent:true,alphaTest:.5,side:THREE.DoubleSide,metalness:.5,roughness:.6});
  /* a triangle-ish side panel under the steep part: a shape following the deck */
  const sh=new THREE.Shape();sh.moveTo(P[1][0],0);sh.lineTo(P[0][0],0);sh.lineTo(P[0][0],P[0][1]-.2);sh.lineTo(P[1][0],P[1][1]-.2);sh.lineTo(P[1][0],0);
  const geo=new THREE.ShapeGeometry(sh);/* map UVs to metres / 4 so the grille is not stretched */const uv=geo.attributes.uv,pos=geo.attributes.position;for(let i=0;i<uv.count;i++)uv.setXY(i,pos.getX(i)/4,pos.getY(i)/4);t.wrapS=t.wrapT=THREE.RepeatWrapping;
  for(const sx of[-1,1]){const m=new THREE.Mesh(geo,gm);m.rotation.y=-Math.PI/2;m.position.x=sx*5.1;g.add(m)}}
 return g}
