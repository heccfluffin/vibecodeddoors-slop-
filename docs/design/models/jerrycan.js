/* =====================================================================================================
   mkJerrycan(colour): a 20-litre jerrycan. Replaces the plain green box used for 'can' in the squad jobs (dx571).
   Blue (0x2a5a9a, the default) for water. Pass 0x3a5a2a for the olive army fuel can.

   SIZE      0.35 m wide (x), 0.48 m tall with the handles, 0.17 m deep (z).
   ORIGIN    The middle handle, where a hand holds it. The can hangs below: its bottom is at y = -0.43.
             So when carried: put it at the hand. Standing on the ground: position.y = 0.43.
   FRONT     -z face. The spout is at the top, on the +x side.
   PARTS     g.userData.parts:
             cap     Group, the spout cap (hinged). rotation.z: 0 shut … 2.2 open (flips back).
             stream  Mesh, a pouring water stream from the spout, hidden by default. Its top is at the spout;
                     scale.y = length in metres. It always hangs straight down (it cancels the can's tilt itself
                     in pour()).
   USE       g.userData.pour(f, len)   f = 0 … 1: tilts the can (rotation.z up to 2.0 rad, spout down), opens the cap,
                                        and shows the stream when f > 0.6 (len = how far it falls, default 0.5 m).
                                        pour(0) puts it back upright.
   COLLISION none (it's carried, or a small prop: 0.35 × 0.17 box).
   ===================================================================================================== */
function mkJerrycan(colour){
 const g=new THREE.Group();const col=colour==null?0x2a5a9a:colour;
 const body=new THREE.MeshStandardMaterial({color:col,roughness:.55,metalness:.35});
 const dark=new THREE.MeshStandardMaterial({color:new THREE.Color(col).multiplyScalar(.6),roughness:.6,metalness:.35});
 const steel=new THREE.MeshStandardMaterial({color:0x9aa0a4,roughness:.35,metalness:.8});
 const can=new THREE.Group();can.position.y=-.43;g.add(can);/* everything below is built from the can's bottom */
 const BX=(w,h,d,m,x,y,z,p)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);(p||can).add(o);return o};
 /* the body: a box with its vertical edges rounded (four thin cylinders at the corners) */
 const W=.35,H=.4,D=.17,r=.03;
 BX(W-2*r,H,D,body,0,H/2,0);BX(W,H,D-2*r,body,0,H/2,0);
 for(const sx of[-1,1])for(const sz of[-1,1]){const c=new THREE.Mesh(new THREE.CylinderGeometry(r,r,H,10),body);c.position.set(sx*(W/2-r),H/2,sz*(D/2-r));can.add(c)}
 /* the X pressed into both big faces, and a seam round the middle */
 for(const sz of[-1,1]){for(const a of[1,-1]){const x=BX(.012,Math.hypot(W-.1,H-.1),.008,dark,0,H/2,sz*(D/2+.003));x.rotation.z=a*Math.atan2(W-.1,H-.1)}
  BX(W-.06,.012,.008,dark,0,.02,sz*(D/2+.003));BX(W-.06,.012,.008,dark,0,H-.02,sz*(D/2+.003))}
 BX(W+.004,.012,D+.004,dark,0,H/2,0);/* the welded seam (stands 2 mm proud of every face) */
 /* the shoulder on top, a little lower at the spout side */
 BX(W-.02,.02,D-.02,body,0,H+.01,0);
 /* three handles across the top; the middle one is the origin of the whole group */
 for(const hx of[-.1,0,.1]){for(const sz of[-1,1])BX(.016,.07,.016,steel,hx,H+.055,sz*.045);BX(.02,.02,.11,steel,hx,H+.09,0)}
 /* the spout, on the +x side, with a hinged cap */
 const sp=new THREE.Mesh(new THREE.CylinderGeometry(.028,.032,.06,14),steel);sp.position.set(.135,H+.04,0);sp.rotation.z=-.35;can.add(sp);
 const capG=new THREE.Group();capG.position.set(.165,H+.07,0);can.add(capG);
 {const c=new THREE.Mesh(new THREE.CylinderGeometry(.034,.034,.025,14),dark);c.position.set(-.02,.01,0);c.rotation.z=-.35;capG.add(c);const lv=new THREE.Mesh(new THREE.BoxGeometry(.05,.01,.02),steel);lv.position.set(-.05,.02,0);capG.add(lv)}
 /* the stream: a thin blue column that hangs from the spout tip */
 const sg=new THREE.CylinderGeometry(.018,.012,1,8,1,true);sg.translate(0,-.5,0);
 const stream=new THREE.Mesh(sg,new THREE.MeshStandardMaterial({color:0x8ac8f0,transparent:true,opacity:.75,roughness:.05,side:THREE.DoubleSide,depthWrite:false}));
 stream.position.set(.15,H+.075,0);stream.visible=false;can.add(stream);
 g.userData.parts={cap:capG,stream,can};
 g.userData.pour=function(f,len){f=Math.max(0,Math.min(1,f||0));const a=f*2.0;g.rotation.z=-a;/* spout side goes down */
  capG.rotation.z=Math.min(1,f*3)*2.2;stream.visible=f>.6;stream.scale.y=len||.5;stream.rotation.z=a;/* undo the tilt so it falls straight */};
 return g}
