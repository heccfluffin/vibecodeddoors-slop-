/* =====================================================================================================
   Old Quarry, batch 4: the automation and smelter upgrades (dx589's qtBuild). Needs fort-kit.js and quarry-yard.js.
   Each builder takes the section group (from qtSec) and returns the same hooks qtTick already animates.
     qmSkip(g, x, z, F, bx, bz, px, pz)  the crew's skip hoist at (x, z), crew ore bin at (bx, bz), rock pile at (px, pz)
                                         -> {sk, skb, so, shv, cab2, x, z, TOP, bx, bz, bo, px, pz, obs}
     qmOreFeed(g, x, z, F, rx, rz)       vibrating feed hopper at (x, z); a charging chute on the furnace hood at (rx, rz)
                                         -> {hp, fl2, from, to, obs}: run the belt from `from` to `to`
     qmCastRobot(g, rx, rz, F)           -> {tw, a1, a2, a3, fg, bc, rx, rz, obs}   (see the pose note in old-quarry.md)
     qmBlower(g, bx, bz, F, fx, fz)      blower at (bx, bz), duct to the furnace's west wall at (fx, fz) -> {fan, obs}
     qmArc(g, x, z, F)                   electrode gantry over the furnace centred at (x, z) -> {arc: [{el, rod, gl, b}], obs}
     qmPress(g, px, pz, F)               die press over the molds -> {press, obs}
     qmLaunder(g, a, b)                  a tap hole on the furnace wall at a=[x,y,z], a lined trough down to b -> {laun}
     qmRefinery(g, x, z, F, hx, hz)      refinery tank, its pipe over to the furnace hood at (hx, hz) -> {vw, gc, gt, top, obs}
   ===================================================================================================== */
function qmGlow(c,o,s){if(typeof glowSp=='function')return glowSp(c,o,s);const k=fbKit();const t=k.tex(64,64,(x)=>{const gr=x.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,64,64)});const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,color:c,transparent:true,opacity:o,blending:THREE.AdditiveBlending,depthWrite:false}));sp.scale.setScalar(s);return sp}
function qmMat(){const k=qmKit(),M=k.M;return{k,M,ST:M(0x8a8e94,{metalness:.7,roughness:.32}),DK:M(0x2a2c30,{metalness:.5,roughness:.5}),YL:M(0xe0a820,{metalness:.25,roughness:.5}),BL:M(0x2a5a8a,{metalness:.45,roughness:.45}),RD:M(0xb02a1a,{metalness:.3,roughness:.5}),OR:M(0xe86a10,{metalness:.35,roughness:.4}),CU:M(0xb87333,{metalness:.8,roughness:.3}),GM:M(0x6a7078,{metalness:.5,roughness:.45}),ROCK:M(0x8a7458,{roughness:1}),RB:M(0x1a1a1a,{roughness:.9})}}
const qmNS=g=>{g.traverse(o=>{if(o.isMesh)o.userData.noSeam=true});return g};

/* ---- the skip hoist: a lattice tower with guide rails, a head frame with the sheave and a tipping scroll, a hoist house at
   the foot, a chute down to a concrete ore bunker, and the rock pile the miners work at ---- */
function qmSkip(g,x,z,F,bx,bz,px,pz){const{k,M,ST,DK,YL,GM,ROCK,RB}=qmMat(),{B,C,rod,L}=k.H(g);const TOP=11,obs=[];
 /* footing */B(2.0,.3,2.2,x,F+.15,z,k.PLINTH);
 /* four angle legs, braced on every face */for(const sx of[-.5,.5])for(const sz of[-.72,.72]){B(.14,TOP,.03,x+sx,F+TOP/2+.3,z+sz-.055*Math.sign(sz),DK);B(.03,TOP,.14,x+sx-.055*Math.sign(sx),F+TOP/2+.3,z+sz,DK)}
 for(let y=.3;y<TOP-.5;y+=1.8){for(const sz of[-.72,.72]){rod([x-.5,F+y,z+sz],[x+.5,F+y+1.8,z+sz],.025,DK);B(1.0,.06,.06,x,F+y,z+sz,DK)}for(const sx of[-.5,.5]){rod([x+sx,F+y,z-.72],[x+sx,F+y+1.8,z+.72],.025,DK);B(.06,.06,1.44,x+sx,F+y,z,DK)}}
 /* the skip's guide rails, inside the tower */for(const sz of[-.5,.5])B(.06,TOP-.8,.08,x,F+.3+(TOP-.8)/2,z+sz,M(0x5a5e64,{metalness:.7}));
 /* head frame: a deck, the sheave on its shaft, a tipping scroll that turns the skip over the chute */B(1.4,.12,1.8,x,F+TOP+.3,z,DK);for(const sx of[-.6,.6])for(const sz of[-.8,.8])B(.06,.5,.06,x+sx,F+TOP+.61,z+sz,YL);for(const sz of[-.8,.8])B(1.26,.05,.05,x,F+TOP+.85,z+sz,YL);
 for(const sz of[-.3,.3])B(.3,.5,.12,x,F+TOP+.6,z+sz,DK);C(.05,.05,.7,x,F+TOP+.9,z,ST,'z',null,8);
 const shv=new THREE.Group();shv.position.set(x,F+TOP+.9,z);g.add(shv);{const S=k.H(shv);const rim=new THREE.Mesh(new THREE.TorusGeometry(.5,.06,8,24),M(0x3a3a3a,{metalness:.8}));shv.add(rim);S.C(.1,.1,.16,0,0,0,ST,'z',null,10);for(let i=0;i<6;i++){const sp=S.B(.04,.96,.04,0,0,0,ST);sp.rotation.z=i*Math.PI/3}}
 /* the tipping scroll: two curved guides that turn the skip over at the top */for(const sz of[-.45,.45]){rod([x+.3,F+TOP-1.5,z+sz],[x+.62,F+TOP-.9,z+sz],.05,YL);rod([x+.62,F+TOP-.9,z+sz],[x+.62,F+TOP-.2,z+sz],.05,YL)}
 /* the skip: a steel box with a tipping lip, ore inside */const sk=new THREE.Group();sk.position.set(x,F+1,z);g.add(sk);sk.userData.dpKeep=1;const skb=new THREE.Group();sk.add(skb);const K=k.H(skb);
 K.B(.7,.06,.86,0,-.35,0,YL);for(const dz of[-.43,.43])K.B(.7,.7,.05,0,0,dz,YL);K.B(.05,.7,.86,-.35,0,0,YL);{const lip=K.B(.05,.4,.86,.42,-.12,0,YL);lip.rotation.z=-.5}for(const dz of[-.4,.4])K.C(.06,.06,.08,-.2,.2,dz+(dz<0?-.06:.06),DK,'z',null,8);K.B(.08,.1,.5,-.2,.4,0,DK);
 const so=new THREE.Mesh(new THREE.DodecahedronGeometry(.32,0),M(0x8a7a6a,{roughness:1}));so.scale.y=.6;so.position.y=.15;skb.add(so);
 const cab2=C(.015,.015,1,x,F+5,z,M(0x2a2a2a),null,null,4);
 /* the hoist house at the foot, its rope up to the sheave */{const hx=x-.1,hz=z-1.9;B(1.3,1.1,1.1,hx,F+.85,hz,M(0x5a6a58,{roughness:.6}));B(1.4,.08,1.2,hx,F+1.44,hz,DK);C(.25,.25,.9,hx,F+.75,hz+.2,DK,'x',null,14);rod([hx,F+1.48,hz+.4],[x,F+TOP+.4,z-.5],.012,M(0x2a2a2a));obs.push({x0:hx-.7,x1:hx+.7,z0:hz-.6,z1:hz+.6})}
 /* the ore pass: the skip tips into a head bin on the tower, a round downpipe on brackets carries the ore down the tower,   and a short spout drops it into the bunker */{const hx=x+1.0,DM=M(0x6a7078,{metalness:.55,roughness:.4});/* open-topped head bin */for(const s2 of[-1,1]){B(.05,.6,1.0,hx+s2*.4,F+TOP-1.5,z,DM);B(.8,.6,.05,hx,F+TOP-1.5,z+s2*.5,DM)}for(const s2 of[-1,1]){B(.09,.05,1.06,hx+s2*.4,F+TOP-1.18,z,DK);B(.86,.05,.09,hx,F+TOP-1.18,z+s2*.5,DK)}{const ore=new THREE.Mesh(new THREE.DodecahedronGeometry(.35,0),M(0x8a7a6a,{roughness:1}));ore.scale.y=.35;ore.position.set(hx,F+TOP-1.55,z);g.add(ore)}rod([x+.5,F+TOP-1.4,z-.4],[hx-.4,F+TOP-1.4,z-.4],.04,DK);rod([x+.5,F+TOP-1.4,z+.4],[hx-.4,F+TOP-1.4,z+.4],.04,DK);{const hb=new THREE.Mesh(new THREE.CylinderGeometry(.42,.2,.5,4,1,true),M(0x6a7078,{metalness:.55,side:THREE.DoubleSide}));hb.rotation.y=Math.PI/4;hb.position.set(hx,F+TOP-2.05,z);g.add(hb)}const y1=F+TOP-2.3,y0=F+2.6;C(.2,.2,y1-y0,hx,(y0+y1)/2,z,DM,null,null,14);for(let y=y0+.2;y<y1;y+=1.6){C(.26,.26,.06,hx,y,z,DK,null,null,14);B(.5,.06,.06,hx-.25,y+.1,z,DK)}const sp=[bx,F+1.7,bz];rod([hx,y0,z],sp,.2,DM,null,14);C(.26,.26,.06,hx,y0,z,DK,null,null,14);rod([hx+(sp[0]-hx)*.5,(y0+sp[1])*.5,z+(sp[2]-z)*.5],[hx+(sp[0]-hx)*.5,F+.15,z+(sp[2]-z)*.5],.05,DK);B(.4,.06,.4,hx+(sp[0]-hx)*.5,F+.18,z+(sp[2]-z)*.5,DK)}
 /* the bunker: concrete walls, a steel rim, the heap inside (bo) */{B(1.9,1.1,1.9,bx,F+.55,bz,k.PRE);B(2.0,.08,2.0,bx,F+1.12,bz,DK);B(1.6,.04,1.6,bx,F+1.0,bz,M(0x3a3632,{roughness:1}));L('CREW ORE',1.4,.3,'#1a1a1a','#e8c020',60,bx,F+.7,bz+.96,0);obs.push({x0:bx-1,x1:bx+1,z0:bz-1,z1:bz+1})}
 const bo=new THREE.Mesh(new THREE.DodecahedronGeometry(.62,0),M(0x8a7a6a,{roughness:1}));bo.scale.y=.4;bo.position.set(bx,F+1.05,bz);g.add(bo);
 /* the rock pile, a wheelbarrow, a rack of picks */{let sd=777;const r=()=>((sd=Math.imul(sd^sd>>>15,sd|1)+0x6d2b79f5|0)>>>0)/4294967296;for(let i=0;i<11;i++){const s=.3+r()*.6,m=new THREE.Mesh(new THREE.DodecahedronGeometry(s,0),ROCK);m.position.set(px+(r()-.5)*2.4,F+s*.45,pz+(r()-.5)*1.6);m.rotation.set(r()*3,r()*3,r()*3);g.add(m)}
  const wb=new THREE.Group();wb.position.set(px+2.2,F,pz+1.6);wb.rotation.y=.6;g.add(wb);const W=k.H(wb);W.C(.16,.16,.08,0,.16,-.55,RB,'x',null,12);const tray=new THREE.Mesh(new THREE.CylinderGeometry(.42,.3,.32,4,1,true),M(0x2a6a3a,{side:THREE.DoubleSide,metalness:.4}));tray.rotation.y=Math.PI/4;tray.scale.z=1.4;tray.position.set(0,.55,0);wb.add(tray);W.B(.5,.03,.66,0,.4,0,M(0x2a6a3a,{metalness:.4}));for(const s of[-1,1]){W.rod([s*.22,.42,-.5],[s*.28,.62,.75],.025,DK);W.rod([s*.22,.4,.3],[s*.22,0,.35],.02,DK)}
  for(let i=0;i<3;i++){const pk=new THREE.Group();pk.position.set(px-1.9+i*.3,F+.02,pz+1.3);pk.rotation.set(.25,0,(i-1)*.1);g.add(pk);const Q=k.H(pk);Q.C(.025,.03,.85,0,.42,0,M(0x7a5232),null,null,6);const hd=Q.C(.03,.02,.45,0,.85,0,ST,'x',null,6)}}
 obs.push({x0:x-1,x1:x+1,z0:z-1.1,z1:z+1.1});qmNS(g);return{sk,skb,so,shv,cab2,x,z,TOP,bx,bz,bo,px,pz,obs}}

/* ---- the ore feed: a square hopper on a braced stand, a vibrating pan feeder under it (hp shakes), a motor; and a
   charging chute on the furnace hood where the belt ends ---- */
function qmOreFeed(g,x,z,F,rx,rz){const{k,M,ST,DK,YL,BL,GM}=qmMat(),{B,C,rod,L}=k.H(g);
 for(const[a,b]of[[-.7,-.7],[.7,-.7],[-.7,.7],[.7,.7]]){B(.14,2.0,.14,x+a,F+1.0,z+b,DK);B(.3,.04,.3,x+a,F+.02,z+b,ST)}for(const[a,b,c,d]of[[-.7,-.7,.7,-.7],[-.7,.7,.7,.7],[-.7,-.7,-.7,.7],[.7,-.7,.7,.7]]){rod([x+a,F+.3,z+b],[x+c,F+1.5,z+d],.03,DK);B(Math.abs(c-a)+.14,.1,Math.abs(d-b)+.14,x+(a+c)/2,F+2.0,z+(b+d)/2,DK)}
 {const fun=new THREE.Mesh(new THREE.CylinderGeometry(1.15,.35,1.2,4,1,true),M(0x6a7078,{metalness:.55,side:THREE.DoubleSide}));fun.rotation.y=Math.PI/4;fun.position.set(x,F+2.6,z);g.add(fun);const rim=B(1.66,.08,1.66,x,F+3.22,z,DK);rim.material=DK;const fill=new THREE.Mesh(new THREE.BoxGeometry(1.5,.02,1.5),DK);fill.visible=false}
 const hp=new THREE.Group();hp.position.set(x,F+1.75,z);hp.userData.dpKeep=1;g.add(hp);/* the pan's open end faces the furnace (-z), right over the belt's tail */{const H=k.H(hp);H.B(.6,.06,1.0,0,0,-.2,GM);for(const s of[-1,1])H.B(.04,.16,1.0,s*.3,.08,-.2,GM);H.B(.6,.16,.04,0,.08,.3,GM);for(const[a,b]of[[-.25,.2],[.25,.2],[-.25,-.55],[.25,-.55]])H.C(.04,.04,.12,a,-.08,b,M(0x1a1a1a),null,null,8);H.B(.3,.24,.26,.48,.0,.1,BL)}
 const fl2=new THREE.Mesh(new THREE.DodecahedronGeometry(.6,0),M(0x8a7a6a,{roughness:1}));fl2.scale.y=.45;fl2.position.set(0,1.0,0);hp.add(fl2);
 L('ORE FEED',1.2,.28,'#1a1a1a','#e8c020',60,x,F+1.15,z+.79,0);
 /* the charging chute on the hood: an open-topped steel hopper; the belt's head drum hangs just over it */{for(const s2 of[-1,1]){B(.05,.5,.9,rx+s2*.43,F+4.15,rz,GM);B(.9,.5,.05,rx,F+4.15,rz+s2*.43,GM)}for(const s2 of[-1,1]){B(.09,.05,1.0,rx+s2*.45,F+4.42,rz,DK);B(1.0,.05,.09,rx,F+4.42,rz+s2*.45,DK)}B(.9,.08,.9,rx,F+3.94,rz,DK);B(.8,.02,.8,rx,F+4.0,rz,M(0x1a1a1a))}
 qmNS(g);return{hp,fl2,from:[x,F+1.58,z-.6],to:[rx,F+4.98,rz],obs:[{x0:x-.8,x1:x+.8,z0:z-.8,z1:z+.8}]}}

/* ---- the casting robot: a six-axis arm on a pedestal, cable loom along the arm, a gripper; a beacon; a safety rail ---- */
function qmCastRobot(g,rx,rz,F){const{k,M,ST,DK,YL,OR}=qmMat(),{B,C,rod,L}=k.H(g);const WH=M(0xe4e4e0,{roughness:.5,metalness:.2});
 C(.6,.7,.3,rx,F+.15,rz,DK,null,null,20);C(.52,.52,.06,rx,F+.33,rz,YL,null,null,20);
 const tw=new THREE.Group();tw.position.set(rx,F+.36,rz);tw.userData.dpKeep=1;g.add(tw);const T=k.H(tw);T.C(.44,.47,.3,0,.15,0,OR,null,null,18);T.B(.5,.45,.55,0,.5,0,OR);T.C(.22,.22,.66,0,.65,0,DK,'x',null,16);T.C(.24,.24,.06,.34,.65,0,WH,'x',null,16);T.C(.24,.24,.06,-.34,.65,0,WH,'x',null,16);
 const a1=new THREE.Group();a1.position.y=.65;tw.add(a1);const A1=k.H(a1);A1.B(.28,1.15,.32,0,.62,0,OR);A1.B(.3,.12,.34,0,.12,0,DK);A1.rod([.18,.2,.1],[.18,1.1,.1],.025,DK);A1.C(.17,.17,.44,0,1.25,0,DK,'x',null,14);A1.C(.19,.19,.05,.22,1.25,0,WH,'x',null,14);A1.C(.19,.19,.05,-.22,1.25,0,WH,'x',null,14);
 const a2=new THREE.Group();a2.position.y=1.25;a1.add(a2);const A2=k.H(a2);A2.B(.22,.92,.24,0,.5,0,OR);A2.rod([.14,.1,.08],[.14,.9,.08],.02,DK);A2.C(.11,.11,.3,0,1.0,0,DK,'x',null,12);
 const a3=new THREE.Group();a3.position.y=1.0;a2.add(a3);const A3=k.H(a3);A3.C(.09,.1,.2,0,.1,0,WH,null,null,12);A3.B(.24,.06,.14,0,.22,0,DK);const fg=[];for(const sd of[-1,1]){const f=A3.B(.04,.22,.1,sd*.07,.34,0,ST);fg.push(f)}
 const bc=C(.07,.07,.12,rx+.48,F+.42,rz+.25,new THREE.MeshStandardMaterial({color:0x30ff60,emissive:0x20c040,emissiveIntensity:1}),null,null,10);C(.05,.05,.06,rx+.48,F+.33,rz+.25,DK,null,null,10);
 /* a waist-high safety rail round the back half, yellow */for(let i=0;i<=6;i++){const a=Math.PI*(1+i/6);B(.05,.95,.05,rx+Math.cos(a)*1.25,F+.48,rz+Math.sin(a)*1.25,YL)}{const rr=new THREE.Mesh(new THREE.TorusGeometry(1.25,.025,6,24,Math.PI),YL);rr.rotation.x=Math.PI/2;rr.rotation.z=Math.PI;rr.position.set(rx,F+.95,rz);g.add(rr)}
 qmNS(g);return{tw,a1,a2,a3,fg,bc,rx,rz,obs:[{x0:rx-.7,x1:rx+.7,z0:rz-.7,z1:rz+.7}]}}

/* ---- the blower: a centrifugal fan in a scroll housing on a base, a guarded inlet (the fan turns behind it), a motor,
   and the hot-blast duct along the ground to a tuyere in the furnace's west wall ---- */
function qmBlower(g,bx,bz,F,fx,fz){const{k,M,ST,DK,BL,GM}=qmMat(),{B,C,rod,L}=k.H(g);
 B(1.4,.24,1.3,bx,F+.12,bz,DK);C(.72,.72,.55,bx,F+1.0,bz,BL,'z',null,24);B(.6,.72,.55,bx+.3,F+.62,bz,BL);C(.76,.76,.06,bx,F+1.0,bz-.3,DK,'z',null,24);
 const fan=new THREE.Group();fan.position.set(bx,F+1.0,bz-.36);fan.userData.dpKeep=1;g.add(fan);{const Fn=k.H(fan);for(let i=0;i<6;i++){const h=new THREE.Group();h.rotation.z=i*Math.PI/3;fan.add(h);const bl=new THREE.Mesh(new THREE.BoxGeometry(.14,.5,.02),ST);bl.position.y=.28;bl.rotation.y=.45;h.add(bl)}Fn.C(.1,.1,.06,0,0,0,DK,'z',null,12)}
 /* inlet guard: a ring and bars */{const r=new THREE.Mesh(new THREE.TorusGeometry(.64,.025,6,24),DK);r.position.set(bx,F+1.0,bz-.42);g.add(r);for(let i=0;i<4;i++){const b=B(1.26,.03,.03,bx,F+1.0,bz-.42,DK);b.rotation.z=i*Math.PI/4}}
 C(.24,.24,.5,bx+.95,F+.55,bz,BL,'x',null,14);B(.4,.3,.4,bx+.95,F+.35,bz,DK);
 /* the duct: up out of the scroll, along +z, round the corner and into the furnace wall, on stands */const y=F+1.9,DM=M(0x8a8e94,{metalness:.6,roughness:.35});
 rod([bx+.4,F+1.5,bz+.1],[bx+.4,y,bz+.1],.22,DM,null,14);rod([bx+.4,y,bz+.1],[bx+.4,y,fz],.22,DM,null,14);/* rounded elbows, so no pipe end shows at the corners */for(const[ex,ez]of[[bx+.4,bz+.1],[bx+.4,fz]]){const el=new THREE.Mesh(new THREE.SphereGeometry(.22,16,12),DM);el.position.set(ex,y,ez);g.add(el)}{const el=new THREE.Mesh(new THREE.SphereGeometry(.22,16,12),DM);el.position.set(bx+.4,F+1.5,bz+.1);g.add(el)}rod([bx+.4,y,fz],[fx,y,fz],.22,DM,null,14);C(.32,.32,.08,fx-.05,y,fz,DK,'x',null,14);
 for(const t of[.35,.75]){const zz=bz+.1+(fz-bz-.1)*t;B(.08,y-F-.2,.08,bx+.4,F+(y-F-.2)/2,zz,DK);B(.5,.06,.08,bx+.4,y-.22,zz,DK)}for(const zz of[bz+.1+.6,fz-.3])C(.28,.28,.05,bx+.4,y,zz,DK,'z',null,14);
 qmNS(g);return{fan,obs:[{x0:bx-.75,x1:bx+1.25,z0:bz-.7,z1:bz+.7}]}}

/* ---- the arc furnace: a portal gantry over the furnace, three electrode columns through roof ports, copper bus and
   cables; each column's el moves, rod glows, gl is the arc glow at the roof ---- */
function qmArc(g,x,z,F){const{k,M,ST,DK,YL,CU}=qmMat(),{B,C,rod,L}=k.H(g);const GY=F+6.6;
 for(const sx of[-2.45,2.45]){B(.28,GY-F,.4,x+sx,F+(GY-F)/2,z,DK);B(.6,.1,.7,x+sx,F+.05,z,ST)}B(5.2,.36,.5,x,GY,z,DK);B(5.2,.06,.52,x,GY+.21,z,YL);
 const arc=[];for(const dx of[-.8,0,.8]){C(.24,.28,.14,x+dx,F+3.97,z,ST,null,null,14);/* roof port */
  const el=new THREE.Group();el.position.set(x+dx,F+3.2,z);el.userData.dpKeep=1;g.add(el);const E=k.H(el);const rd=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,2.6,12),new THREE.MeshStandardMaterial({color:0x303030,emissive:0x5080ff,emissiveIntensity:.1}));rd.position.y=1.1;el.add(rd);
  E.B(.42,.24,.42,0,2.1,0,CU);E.B(.1,.1,.9,0,2.1,-.45,DK);rod([x+dx,GY-.18,z-.0],[x+dx,F+5.4,z],.04,CU);rod([x+dx,F+5.4,z],[x+dx+.3,GY-.2,z-.25],.03,M(0x1a1a1a));
  const gl=qmGlow(0x80b0ff,0,1.6);gl.position.set(x+dx,F+4.0,z);g.add(gl);arc.push({el,rod:rd,gl,b:dx})}
 L('ARC FURNACE · 3 × 40 kA',3,.32,'#1a1a1a','#80b0ff',60,x,GY,z-.26,Math.PI);
 qmNS(g);return{arc,obs:[{x0:x-2.6,x1:x-2.3,z0:z-.25,z1:z+.25},{x0:x+2.3,x1:x+2.6,z0:z-.25,z1:z+.25}]}}

/* ---- the die press over the mold table: two hydraulic columns, a crown with cylinders, the moving platen (press) ---- */
function qmPress(g,px,pz,F){const{k,M,ST,DK,BL,YL}=qmMat(),{B,C,rod,L}=k.H(g);
 for(const sx of[-1.8,1.8]){B(.5,.2,.6,px+sx,F+.1,pz,DK);C(.13,.13,3.0,px+sx,F+1.7,pz,M(0xc8ccd0,{metalness:.85,roughness:.2}),null,null,14);C(.2,.2,.2,px+sx,F+.3,pz,DK,null,null,14)}
 B(4.1,.5,.8,px,F+3.35,pz,BL);B(4.15,.06,.82,px,F+3.62,pz,YL);for(const sx of[-.9,.9]){C(.2,.2,.75,px+sx,F+2.78,pz,BL,null,null,14);rod([px+sx+.2,F+3.2,pz+.2],[px+sx+.6,F+3.6,pz+.45],.03,M(0x1a1a1a))}
 const press=new THREE.Group();press.position.set(px,F+2.2,pz);press.userData.dpKeep=1;g.add(press);{const P=k.H(press);P.B(3.4,.2,.95,0,0,0,DK);P.B(3.4,.06,.97,0,-.12,0,M(0x9a9ea4,{metalness:.7}));for(const sx of[-1.8,1.8])P.B(.4,.26,.36,sx,0,0,DK);/* rams long enough to stay in their cylinders at full stroke */for(const sx of[-.9,.9])P.C(.08,.08,1.2,sx,.7,0,M(0xc8ccd0,{metalness:.85,roughness:.2}),null,null,10)}
 L('DIE PRESS',1.4,.3,'#1a1a1a','#e8c020',60,px,F+3.35,pz-.41,Math.PI);
 qmNS(g);return{press,obs:[{x0:px-2.05,x1:px-1.55,z0:pz-.3,z1:pz+.3},{x0:px+1.55,x1:px+2.05,z0:pz-.3,z1:pz+.3}]}}
function qmLaunder(g,a,b){const{k,M,DK}=qmMat(),{B,C,rod}=k.H(g);const d=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]),Ln=d.length();const tg=new THREE.Group();tg.position.set((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);tg.rotation.set(-Math.atan2(d.y,Math.hypot(d.x,d.z)),Math.atan2(d.x,d.z),0,'YXZ');/* keeps the trough upright (open side up) */g.add(tg);const T=k.H(tg);
 T.B(.36,.06,Ln,0,0,0,DK);for(const s of[-1,1])T.B(.06,.18,Ln,s*.18,.08,0,DK);T.B(.24,.02,Ln-.1,0,.04,0,M(0x6a4a3a,{roughness:1}));
 const laun=new THREE.Mesh(new THREE.BoxGeometry(.18,.03,Ln-.2),new THREE.MeshBasicMaterial({color:0xff7020}));laun.position.y=.065;laun.visible=false;tg.add(laun);
 /* the tap hole it starts from: a cast block on the furnace wall with a glowing plug */B(.3,.42,.5,a[0]+.08,a[1]+.1,a[2],M(0x2e3034,{metalness:.6,roughness:.45}));{const tp=new THREE.Mesh(new THREE.CircleGeometry(.08,12),new THREE.MeshStandardMaterial({color:0x200800,emissive:0xff5010,emissiveIntensity:.8}));tp.rotation.y=Math.PI/2;tp.position.set(a[0]+.235,a[1]+.14,a[2]);g.add(tp)}for(const t of[.25,.75]){const x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t,z=a[2]+(b[2]-a[2])*t;B(.08,y-(a[1]>b[1]?b[1]-1.3:a[1]-1.3),.08,x,(y+(a[1]>b[1]?b[1]-1.3:a[1]-1.3))/2,z,DK)}
 qmNS(g);return{laun}}

/* ---- the refinery: a tall stainless tank with a dome, bands, a caged ladder, a railing on top, a gauge on the front,
   a valve wheel; its pipe climbs and runs over to the furnace hood ---- */
function qmRefinery(g,x,z,F,hx,hz){const{k,M,ST,DK,YL,RD,CU}=qmMat(),{B,C,rod,L}=k.H(g);const SV=M(0xc8ccd0,{metalness:.65,roughness:.3});
 C(1.5,1.5,.25,x,F+.12,z,k.PLINTH,null,null,28);for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4;B(.2,.6,.2,x+Math.cos(a)*1.15,F+.5,z+Math.sin(a)*1.15,DK)}
 C(1.3,1.3,3.6,x,F+2.6,z,SV,null,null,28);{const d=new THREE.Mesh(new THREE.SphereGeometry(1.3,28,10,0,Math.PI*2,0,Math.PI/2),SV);d.scale.y=.5;d.position.set(x,F+4.4,z);g.add(d)}C(1.3,.9,.4,x,F+.6,z,SV,null,null,28);
 for(const y of[1.3,2.6,3.9])C(1.33,1.33,.08,x,F+y,z,DK,null,null,28);
 /* ladder on the west side with a cage, a railing ring round the top */for(const sd of[-.22,.22])B(.05,4.6,.05,x-1.42,F+2.6,z+sd,YL);for(let y=.6;y<4.9;y+=.35)B(.05,.04,.44,x-1.42,F+y,z,YL);for(let y=2.6;y<5;y+=.6){const h=new THREE.Mesh(new THREE.TorusGeometry(.34,.018,4,12,Math.PI),YL);h.rotation.set(Math.PI/2,0,Math.PI/2);h.position.set(x-1.42,F+y,z);g.add(h)}
 {const rr=new THREE.Mesh(new THREE.TorusGeometry(.75,.03,6,24),YL);rr.rotation.x=Math.PI/2;rr.position.set(x,F+5.4,z);g.add(rr);for(let i=0;i<8;i++){const a=i/8*Math.PI*2;B(.04,.6,.04,x+Math.cos(a)*.75,F+5.1,z+Math.sin(a)*.75,YL)}C(.78,.78,.06,x,F+4.83,z,M(0x6a6e72,{metalness:.5}),null,null,24)}
 C(.12,.12,.5,x-.4,F+5.1,z+.3,SV,null,null,10);/* vent stack (steam puffs from top) */
 /* the gauge on the front (-z, facing the pit) */const gc=document.createElement('canvas');gc.width=gc.height=64;const gt=new THREE.CanvasTexture(gc);{const gg=new THREE.Mesh(new THREE.CircleGeometry(.24,24),new THREE.MeshBasicMaterial({map:gt}));gg.position.set(x,F+2.0,z-1.335);gg.rotation.y=Math.PI;g.add(gg);const rim=new THREE.Mesh(new THREE.TorusGeometry(.25,.035,6,24),DK);rim.position.set(x,F+2.0,z-1.33);g.add(rim)}
 L('REFINERY',2,.4,'#e0e4e8','#1a2a4a',60,x,F+3.25,z-1.335,Math.PI);
 /* the outlet pipe at the front with a valve wheel (vw turns on y: its wheel lies flat on top of the valve body) */rod([x+.6,F+1.0,z-1.15],[x+.6,F+1.0,z-1.9],.09,CU,null,10);C(.14,.14,.24,x+.6,F+1.0,z-1.9,DK,null,null,10);C(.03,.03,.3,x+.6,F+1.25,z-1.9,DK,null,null,8);
 const vw=new THREE.Group();vw.position.set(x+.6,F+1.4,z-1.9);vw.userData.dpKeep=1;g.add(vw);{const w=new THREE.Mesh(new THREE.TorusGeometry(.2,.025,6,16),RD);w.rotation.x=Math.PI/2;vw.add(w);for(let i=0;i<3;i++){const sp=new THREE.Mesh(new THREE.BoxGeometry(.4,.02,.02),RD);sp.rotation.y=i*Math.PI/3;vw.add(sp)}}
 rod([x+.6,F+1.0,z-1.9],[x+.6,F+.25,z-1.9],.09,CU,null,10);B(.3,.2,.3,x+.6,F+.1,z-1.9,DK);
 /* the feed pipe from the furnace: up the tank's east side (clear of the firebox door), across above the arc gantry, down onto the hood */const PY=F+7.1;/* (above the arc furnace's gantry beam) */rod([x+1.4,F+3.0,z],[x+1.4,PY,z],.11,CU,null,10);rod([x+1.4,PY,z],[x+1.4,PY,hz],.11,CU,null,10);rod([x+1.4,PY,hz],[hx,PY,hz],.11,CU,null,10);rod([hx,PY,hz],[hx,F+3.88,hz],.11,CU,null,10);/* lands on the hood (top at 3.9) with a flange */C(.2,.22,.08,hx,F+3.94,hz,DK,null,null,12);
 for(const[px2,pz2]of[[x+1.4,z],[x+1.4,hz],[hx,hz]])C(.15,.15,.24,px2,PY,pz2,DK,null,null,10);C(.18,.18,.06,x+1.32,F+3.0,z,DK,'x',null,10);rod([x+1.4,F+3.0,z],[x+1.25,F+3.0,z],.11,CU,null,10);
 for(const t of[.5]){const zz=z+(hz-z)*t;B(.1,PY-F,.1,x+1.4,F+(PY-F)/2,zz,DK);B(.6,.08,.2,x+1.4,F+.04,zz,DK)}
 qmNS(g);return{vw,gc,gt,top:[x-.4,F+5.4,z+.3],obs:[{x0:x-1.5,x1:x+1.5,z0:z-1.5,z1:z+1.5}]}}
