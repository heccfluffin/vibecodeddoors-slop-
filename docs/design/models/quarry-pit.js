/* =====================================================================================================
   Old Quarry, batch 5: the pit floor and the crucible rail. Needs fort-kit.js, quarry-yard.js and quarry-works.js (qmMat).
     qmCraneRail(g, x0, x1, rz, F, roofY)  the crucible runway from the furnace hood (post on the roof at x0) to an A-frame at x1
     qmCrucible()                           -> {tro, cr, pot, molt}: the trolley (game moves tro.position.x) with a hoist, chain,
                                              hook and the crucible (cr: y -3.0 under the trolley; pot tips on z inside the
                                              bail; lip on +x)
     qmDrillRig(g, bx, bz, by)              -> {hd, rod, mg, obs}: same moving parts as dx581 (hd y 6.8 .. 1.2 in mg, rod spins y)
     qmHaulTruck()                          -> Group with userData {bed, load, wh}: same as dx581's dump truck (front -z,
                                              bed pivots on x at the rear, wheels spin on x, wheel radius .75)
     qmBlast(g, px, pz, fx, fz, F)          -> {hg, ch, rk, obs}: the plunger box (hg drops), the charge (ch, now at fx - 2.5), the rocks (rk)
   ===================================================================================================== */

function qmCraneRail(g,x0,x1,rz,F,roofY){const{k,M,ST,DK,YL}=qmMat(),{B,C,rod,L}=k.H(g);const RY=F+5.2,STL=M(0x5a5e64,{metalness:.6,roughness:.4});
 /* the runway: an I-beam (top flange, web, bottom flange the trolley wheels run on), yellow end stops */
 const Lr=x1-x0,cx=(x0+x1)/2;B(Lr,.04,.26,cx,RY+.1,rz,STL);B(Lr,.2,.04,cx,RY,rz,STL);B(Lr,.04,.32,cx,RY-.1,rz,STL);for(const ex of[x0+.08,x1-.08]){B(.08,.26,.36,ex,RY-.06,rz,YL)}
 /* on the furnace roof: a stub column on a base plate, a knee brace */B(.6,.06,.6,x0+.25,roofY+.03,rz,DK);for(const c of[[.2,.03],[.03,.2]])B(c[0],RY-.12-roofY,c[1],x0+.25,(RY-.12+roofY)/2,rz,STL);rod([x0+.25,roofY+.9,rz],[x0+1.1,RY-.12,rz],.04,STL);
 /* the far end: an A-frame to the ground with a cross tie, base plates */for(const sz of[-.7,.7]){rod([x1-.15,RY-.12,rz],[x1-.15,F+.05,rz+sz],.07,STL);B(.4,.05,.4,x1-.15,F+.025,rz+sz,DK)}B(.08,.08,1.2,x1-.15,F+2.0,rz,STL);rod([x1-.15,F+3.4,rz],[x1-1.3,RY-.12,rz],.05,STL);
 L('CRUCIBLE RAIL · SWL 2 t',2.2,.26,'#e0a820','#1a1a1a',60,cx+1,RY,rz-.025,Math.PI);
 qmNS(g);return{obs:[{x0:x1-.4,x1:x1+.1,z0:rz-.9,z1:rz+.9}]}}

function qmCrucible(){const{k,M,ST,DK,YL}=qmMat();const tro=new THREE.Group();tro.userData.dpKeep=1;const T=k.H(tro);
 /* the trolley: two side plates with wheels on the bottom flange, a hoist motor and drum hanging under it */for(const sz of[-.22,.22]){T.B(.8,.32,.04,0,-.1,sz,YL);for(const sx of[-.25,.25])T.C(.07,.07,.06,sx,-.06,sz*.72,ST,'z',null,10)}T.B(.8,.08,.5,0,-.28,0,YL);
 T.B(.5,.32,.44,0,-.47,0,DK);T.C(.15,.15,.5,.32,-.47,0,M(0x2a5a8a,{metalness:.45}),'x',null,12);T.C(.12,.12,.4,0,-.72,0,ST,'z',null,12);
 T.C(.025,.025,.86,0,-1.2,0,M(0x2a2a2a,{metalness:.8}),null,null,6);/* chain */
 {const blk=new THREE.Group();blk.position.y=-1.79;/* its hook holds the crucible's bail */tro.add(blk);const Bk=k.H(blk);Bk.B(.3,.34,.2,0,0,0,YL);Bk.C(.06,.06,.22,0,-.2,0,DK,null,null,8);const hk=new THREE.Mesh(new THREE.TorusGeometry(.13,.035,6,12,Math.PI*1.4),DK);hk.position.y=-.37;hk.rotation.z=1.73;/* the bail rests in the bottom of the hook, the opening faces up and out */blk.add(hk)}
 /* the crucible: a tapered steel pot with a lip on +x, trunnions, a bail up to the hook; molten metal inside (molt) */
/* cr hangs from the hook; the pot inside it tips on the trunnions while the bail stays hanging */
 const cr=new THREE.Group();cr.position.y=-3.0;tro.add(cr);const pot=new THREE.Group();pot.position.y=.12;cr.add(pot);const Cc=k.H(pot);const PM=M(0x3a3a3a,{metalness:.6,roughness:.45,side:THREE.DoubleSide});
 const pm=new THREE.Mesh(new THREE.CylinderGeometry(.55,.4,.8,18,1,true),PM);pm.position.y=-.12;pot.add(pm);Cc.C(.4,.4,.04,0,-.52,0,PM,null,null,18);
 for(const y of[-.37,.13])Cc.C(.56-(.13-y)*.19,.56-(.13-y)*.19+.01,.06,0,y,0,DK,null,null,18);{const rim=new THREE.Mesh(new THREE.TorusGeometry(.55,.04,6,20),DK);rim.rotation.x=Math.PI/2;rim.position.y=.28;pot.add(rim)}
 {const lip=new THREE.Mesh(new THREE.ConeGeometry(.13,.3,4,1,true),PM);lip.position.set(.6,.24,0);lip.rotation.z=-Math.PI/2;lip.scale.z=.6;pot.add(lip)}
 for(const sz of[-1,1])Cc.C(.07,.07,.14,0,0,sz*.6,DK,'z',null,10);
 const molt=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,.05,18),new THREE.MeshBasicMaterial({color:0xff7020}));molt.position.y=.18;molt.visible=false;pot.add(molt);
 {const bail=new THREE.Mesh(new THREE.TorusGeometry(.62,.035,6,20,Math.PI),M(0x4a4a4a,{metalness:.7}));bail.rotation.y=Math.PI/2;bail.position.y=.12;cr.add(bail)}
 qmNS(tro);return{tro,cr,pot,molt}}

/* ---- the drill rig: a crawler with a deck, engine hood, cab, a boom to a feed mast; the rotary head runs down the mast ---- */
function qmDrillRig(g,bx,bz,by){const{k,M,ST,DK,YL,RB}=qmMat(),{B,C,rod,L}=k.H(g);const Y=M(0xe0a818,{metalness:.25,roughness:.5}),GL=new THREE.MeshStandardMaterial({color:0x1a2a38,metalness:.5,roughness:.15,transparent:true,opacity:.7});
 /* crawler tracks: side frames, sprocket and idler, rollers, a track band with lugs */for(const sd of[-1,1]){const tx=bx+sd*1.2;B(.5,.42,3.0,tx,by+.42,bz+.25,DK);for(const zz of[-1.25,1.75])C(.34,.34,.6,tx,by+.36,bz+zz,RB,'x',null,16);for(let i=0;i<4;i++)C(.12,.12,.56,tx,by+.14,bz-.75+i*.7,ST,'x',null,10);
  B(.62,.06,3.0,tx,by+.72,bz+.25,RB);B(.62,.06,3.0,tx,by+.03,bz+.25,RB);for(let i=0;i<14;i++)B(.64,.04,.08,tx,by+.76,bz-1.25+i*.23,RB)}
 /* deck, engine hood with louvres, radiator, exhaust, a handrail */B(2.3,.2,3.4,bx,by+.86,bz+.3,DK);B(1.8,.95,1.5,bx-.15,by+1.43,bz+1.15,Y);for(let i=0;i<6;i++)B(.02,.5,1.3,bx+.76,by+1.45,bz+.6+i*.0,DK).position.z=bz+.55+i*.22;B(1.6,.6,.04,bx-.15,by+1.45,bz+1.91,DK);C(.06,.07,.8,bx-.7,by+2.25,bz+1.4,DK,null,null,8);C(.09,.09,.06,bx-.7,by+2.66,bz+1.4,DK,null,null,8);
 for(const sz of[-.9,1.85]){B(.04,.6,.04,bx+1.05,by+1.26,bz+sz,YL)}B(.04,.04,2.8,bx+1.05,by+1.56,bz+.5,YL);
 /* the cab: a frame, glass, roof, a door handle, a step */const cx=bx+.45,cz=bz-.4;B(1.05,.1,1.1,cx,by+1.01,cz,Y);B(1.1,.08,1.15,cx,by+2.36,cz,Y);for(const[a,b]of[[-.48,-.5],[.48,-.5],[-.48,.5],[.48,.5]])B(.07,1.3,.07,cx+a,by+1.7,cz+b,Y);B(.98,1.24,1.02,cx,by+1.7,cz,GL);B(.4,.06,.2,cx+.62,by+.7,cz,DK);C(.06,.06,.08,cx,by+2.44,cz,M(0xff8000,{emissive:0xff6000,emissiveIntensity:.3}),null,null,10);
 /* the boom out front to the mast cradle */B(.42,.42,1.2,bx,by+1.25,bz-1.75,Y);rod([bx-.15,by+1.0,bz-1.2],[bx-.15,by+1.45,bz-2.3],.07,DK);B(.8,.6,.32,bx,by+1.3,bz-2.45,DK);
 /* the mast: a lattice of two channels and rungs, a crown with a sheave, the centraliser at the foot */const mg=new THREE.Group();mg.position.set(bx,by,bz-2.75);g.add(mg);const Mg=k.H(mg);
 for(const sd of[-1,1])Mg.B(.08,7.2,.3,sd*.2,3.75,0,Y);for(let y=.5;y<7.3;y+=.6)Mg.B(.4,.05,.05,0,y,.14,Y);for(const sd of[-1,1])Mg.B(.04,7,.05,sd*.15,3.75,-.17,ST);
 Mg.B(.54,.35,.5,0,7.45,-.08,DK);Mg.C(.2,.2,.12,0,7.62,-.1,ST,'x',null,14);Mg.B(.56,.3,.56,0,.45,-.3,DK);Mg.C(.13,.13,.34,0,.45,-.3,ST,null,null,12);for(const sd of[-1,1])Mg.C(.025,.025,6.6,sd*.26,3.9,.06,RB,null,null,6);
 const hd=new THREE.Group();mg.add(hd);hd.userData.dpKeep=1;{const H=k.H(hd);H.B(.6,.72,.48,0,0,-.32,DK);H.B(.64,.1,.52,0,.42,-.32,Y);H.C(.16,.16,.22,0,-.48,-.32,ST,null,null,12);H.C(.1,.1,.3,0,.3,-.05,M(0x2a5a8a,{metalness:.45}),'x',null,10)}
 const rd=new THREE.Mesh(new THREE.CylinderGeometry(.065,.065,7.4,10),ST);rd.position.set(0,-4.3,-.32);hd.add(rd);{const bit=new THREE.Mesh(new THREE.ConeGeometry(.12,.24,8),ST);bit.rotation.x=Math.PI;bit.position.y=-3.75;rd.add(bit)}
 /* the blast hole and its ring of cuttings */{const hole=new THREE.Mesh(new THREE.CircleGeometry(.24,18),RB);hole.rotation.x=-Math.PI/2;hole.position.set(bx,by+.02,bz-3.05);g.add(hole);const ring=new THREE.Mesh(new THREE.RingGeometry(.24,.65,18),M(0x8a7a62,{roughness:1}));ring.rotation.x=-Math.PI/2;ring.position.set(bx,by+.015,bz-3.05);g.add(ring)}
 L('DRILL 2',.8,.26,'#1a1a1a','#e0a818',60,bx-.15,by+1.45,bz+1.93,0);
 qmNS(g);return{hd,rod:rd,mg,obs:[{x0:bx-1.6,x1:bx+1.6,z0:bz-3.1,z1:bz+2.1}]}}

/* ---- the haul truck: a rigid dump truck, front -z. The bed pivots at the rear (bed group at (0, 1.6, 2.8), mesh forward of it). ---- */
function qmHaulTruck(){const{k,M,ST,DK,RB}=qmMat();const tk=new THREE.Group();const T=k.H(tk);const Y=M(0xf0b818,{roughness:.5,metalness:.25}),GL=new THREE.MeshStandardMaterial({color:0x223040,metalness:.5,roughness:.15});
 /* the chassis rails, the front axle housing, the engine bay with a grille, the deck the cab sits on */T.B(1.4,.5,5.8,0,1.05,0,DK);T.B(2.5,.5,.6,0,1.0,-2.0,DK);T.B(2.5,.5,.8,0,1.0,2.0,DK);
 T.B(1.9,1.2,1.6,0,1.7,-2.5,Y);T.B(1.7,.9,.06,0,1.65,-3.31,DK);for(let i=0;i<8;i++)T.B(1.6,.03,.07,0,1.28+i*.1,-3.34,M(0x6a6e72,{metalness:.6}));for(const sd of[-1,1])T.B(.3,.16,.06,sd*.7,2.1,-3.33,M(0xfff0c0,{emissive:0xffe0a0,emissiveIntensity:.8}));
 T.B(2.9,.12,1.9,0,2.36,-2.25,Y);/* the deck, full width, with a rail */for(const sx of[-1.4,1.4])T.B(.04,.5,1.8,sx,2.67,-2.25,DK);
 /* the cab on the left of the deck, glass, a ladder up the front */const cx=-.75;T.B(1.1,1.2,1.3,cx,3.02,-2.3,Y);T.B(1.0,.65,.04,cx,3.25,-2.96,GL);T.B(.04,.65,1.0,cx-.56,3.25,-2.35,GL);T.B(.04,.65,1.0,cx+.56,3.25,-2.35,GL);T.B(1.16,.06,1.36,cx,3.64,-2.3,DK);
 for(let i=0;i<5;i++)T.B(.5,.04,.06,1.0,.55+i*.36,-3.25,DK);for(const sx of[.76,1.24])T.B(.04,1.9,.04,sx,1.3,-3.25,DK);
 T.C(.08,.09,1.0,.75,3.1,-1.6,DK,null,null,8);/* exhaust stack */
 /* wheels: two fronts, dual rears; spinning parts in wh */const wh=[];const wheel=(x,z,w)=>{const gw=new THREE.Group();gw.position.set(x,.75,z);gw.rotation.order='YXZ';gw.rotation.y=Math.PI;/* turned round, so the game's rotation.x += rolls it forward (the old truck's wheels rolled backwards) */tk.add(gw);const W=k.H(gw);W.C(.75,.75,w,0,0,0,RB,'x',null,20);for(let i=0;i<10;i++){const a=i/10*Math.PI*2;W.B(w+.02,.12,.18,0,Math.cos(a)*.72,Math.sin(a)*.72,RB).rotation.x=-a}W.C(.42,.42,w+.04,0,0,0,Y,'x',null,16);W.C(.14,.14,w+.08,0,0,0,DK,'x',null,10);wh.push(gw)};
 for(const sd of[-1,1]){wheel(sd*1.3,-2,.6);wheel(sd*1.12,2,.42);wheel(sd*1.62,2,.42)}
 /* mudguards over the wheels */for(const sd of[-1,1]){T.B(.75,.08,1.8,sd*1.35,1.62,-2,Y);T.B(1.0,.08,1.8,sd*1.37,1.62,2,Y)}
 /* the bed: a body with ribbed sides, a sloped floor, a canopy that reaches over the cab; two hoist rams */const bed=new THREE.Group();bed.position.set(0,1.6,2.8);tk.add(bed);const Bd=k.H(bed);
 Bd.B(2.8,.12,4.4,0,.06,-2.1,Y);for(const sd of[-1,1]){Bd.B(.1,1.3,4.4,sd*1.4,.7,-2.1,Y);for(let i=0;i<5;i++)Bd.B(.08,1.3,.1,sd*1.46,.7,-3.9+i*.9,DK)}Bd.B(2.8,1.4,.12,0,.76,-4.28,Y);Bd.B(3.0,.1,1.6,0,1.55,-4.95,Y);for(let i=0;i<4;i++)Bd.B(2.84,.08,.08,0,.3+i*.32,-4.36,DK);Bd.B(2.86,.1,.12,0,1.38,-.0,DK);
 const load=new THREE.Mesh(new THREE.DodecahedronGeometry(1.3,0),M(0x9a8466,{roughness:1}));load.scale.set(1,.5,1.4);load.position.set(0,1.3,-2.1);bed.add(load);
 for(const sx of[-.5,.5])T.rod([sx,1.15,.6],[sx,1.75,.1],.09,ST,null,10);
 qmNS(tk);tk.userData={bed,load,wh};return tk}

/* ---- the daily blast: a detonator box with a T-handle, a wire reel, the wire to the charge, the charge on a rock pile, a sign ---- */
function qmBlast(g,px,pz,fx,fz,F){const{k,M,ST,DK,RD,RB}=qmMat(),{B,C,rod,L}=k.H(g);const WD=M(0x7a4a22,{roughness:.8});
 /* the box: wood with brass corners and terminals, a stencil */B(.56,.44,.42,px,F+.22,pz,WD);B(.62,.06,.48,px,F+.47,pz,M(0x5a3418));for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])B(.06,.44,.06,px+a*.28,F+.22,pz+b*.21,M(0xc0a040,{metalness:.8}));L('DANGER · TNT',.42,.12,'#7a4a22','#ffe0a0',60,px,F+.26,pz+.215,0);
 const hg=new THREE.Group();hg.position.set(px,F+.5,pz);g.add(hg);hg.userData.dpKeep=1;{const H=k.H(hg);H.C(.025,.025,.5,0,.25,0,ST,null,null,8);H.C(.035,.035,.5,0,.5,0,RB,'x',null,8);for(const sd of[-1,1])H.C(.045,.045,.12,sd*.22,.5,0,RD,'x',null,8)}
 for(const sd of[-1,1])C(.03,.03,.06,px+sd*.16,F+.52,pz-.12,M(0xc0a040,{metalness:.8}),null,null,8);
 /* a wire reel on a stand beside it */{const rx=px-.75;for(const sd of[-1,1])B(.04,.5,.04,rx,F+.25,pz+sd*.2,DK);C(.2,.2,.3,rx,F+.45,pz,M(0xb02a1a),'z',null,14);C(.08,.08,.32,rx,F+.45,pz,RB,'z',null,10)}
 /* the wire: two strands on the floor in a lazy curve to the charge */const WM=M(0x1a1a1a);for(const off of[-.03,.03]){let lx=px,lz=pz-.12+off;for(let i=1;i<=14;i++){const u=i/14,x=px+(fx-2.5-px)*u,z=pz-.12+off+(fz-pz+.12)*u+Math.sin(u*Math.PI)*2.4;rod([lx,F+.03,lz],[x,F+.03,z],.016,WM,null,5);lx=x;lz=z}}
 /* the rock pile on the face, the charge against it: sticks taped in a bundle, a cap, a little flag */let sd=4321;const r=()=>((sd=Math.imul(sd^sd>>>15,sd|1)+0x6d2b79f5|0)>>>0)/4294967296;const rk=[];for(let i=0;i<8;i++){const s=.5+r()*.5,b=new THREE.Mesh(new THREE.DodecahedronGeometry(s,0),M(0x8a6a4a,{roughness:1}));b.position.set(fx-.2-r()*1.5,F+s*.5,fz+(r()-.5)*3);b.rotation.set(r()*3,r()*3,r()*3);g.add(b);rk.push(b)}
 const ch=new THREE.Group();ch.position.set(fx-2.5,F,fz);/* in front of the pile, facing the plunger */g.add(ch);{const Ch=k.H(ch);for(let i=0;i<6;i++)Ch.C(.06,.06,.5,Math.cos(i*1.05)*.12,.25,Math.sin(i*1.05)*.12,M(0xc02020,{roughness:.6}),null,null,8);for(const y of[.12,.38])Ch.C(.19,.19,.06,0,y,0,M(0xc8c8c0),null,null,12);Ch.B(.1,.1,.1,0,.55,0,M(0xc0c0c0,{metalness:.8}));Ch.C(.012,.012,.9,.3,.45,0,DK,null,null,4);Ch.B(.02,.14,.22,.31,.83,.11,M(0xff8020))}
 /* the sign on a post, both sides */C(.04,.04,1.45,px+.55,F+.72,pz,DK,null,null,6);B(1.6,.7,.05,px+.55,F+1.75,pz,M(0x3a2a1a));for(const s2 of[1,-1]){const sg=k.lab('DAILY BLAST · 100 GOLD\nONCE A DAY',1.5,.6,'#c02020','#ffffff',48);sg.position.set(px+.55,F+1.75,pz+s2*.03);if(s2<0)sg.rotation.y=Math.PI;g.add(sg)}
 qmNS(g);return{hg,ch,rk,obs:[{x0:px-.32,x1:px+.32,z0:pz-.25,z1:pz+.25}]}}
