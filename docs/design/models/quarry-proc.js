/* =====================================================================================================
   Old Quarry, batch 3: the eight processing machines (dx591's qtBuild2). Needs fort-kit.js and quarry-yard.js (qmKit).
   qmMachine(id, g, x, z, F, l, face) builds one machine on its own concrete plinth, with its name sign, inside g (the
   machine's section group from qtSec, so the build animation still works). face: -1 = its front looks -z (row 1,
   z -1459), +1 = +z (row 2, z -1466); the fronts face the walkway between the rows.
   Returns the hooks qtTick2 already uses, with any positions in the same space as g's parent (q.g):
     wash  {wash: [drum groups, spin on x], washP: [x, z]}       sortr {sortD: drum mesh, spins on its y}
     mill  {mill: [mill groups, spin on x]}                       heat  {heatF: firebox mesh (emissiveIntensity), out: [x, y, z]}
     pol   {pol: [wheel meshes, spin on their y]}                 gen   {gen: [[x, y, z] exhaust tips]}
     silo  {}                                                     lab   {labD: dish group (spins on y), labL: lamp mesh (color)}
   plus obs (the plinth, 3 x 3 as before) and ins/outs: belt ends [x, y, z] on the machine's west and east sides (-x / +x).
   ===================================================================================================== */
function qmMachine(id,g,x,z,F,l,face){const k=qmKit(),M=k.M;const lg=new THREE.Group();lg.position.set(x,F,z);lg.scale.z=face<0?-1:1;g.add(lg);/* mirrored (not turned) for row 1, so ore still comes in on the west side and leaves on the east */const P=k.H(lg);
 const W=(px,py,pz)=>[x+px,F+py,z+pz*(face<0?-1:1)];/* local -> q.g space */
 const ST=M(0x8a8e94,{metalness:.75,roughness:.3}),DK=M(0x2a2c30,{metalness:.5,roughness:.5}),YL=M(0xe0a820,{metalness:.25,roughness:.5}),BL=M(0x2a5a8a,{metalness:.45,roughness:.45}),RD=M(0xb02a1a,{metalness:.3,roughness:.5}),GN=M(0x3a6a3a,{metalness:.3,roughness:.5}),WH=M(0xe4e4dc,{roughness:.7}),RB=M(0x1a1a1a,{roughness:.9});
 /* the plinth: 3.8 x 3.8 x .16 concrete with a chamfered kerb, a yellow edge line, anchor bolts; the name sign on two posts at the front */
 P.B(3.8,.16,3.8,0,.08,0,k.PRE);P.B(3.9,.04,3.9,0,.02,0,k.PRE);for(const[a,b]of[[3.8,.08],[.08,3.8]])for(const s of[-1,1])P.B(a==3.8?3.66:.08,.012,a==3.8?.08:3.66,a==3.8?0:s*1.79,.166,a==3.8?s*1.79:0,YL);
 for(const sx of[-1.5,1.5])for(const sz of[-1.5,1.5])P.C(.04,.04,.05,sx,.185,sz,ST,null,null,6);
 const nm=typeof QTD!='undefined'&&QTD[id]?QTD[id].lv[l].toUpperCase():id.toUpperCase();for(const sx of[-.8,.8])P.B(.05,.7,.05,sx,.5,2.02,DK);{/* the sign goes straight into g, so the mirror doesn't flip its text */const fs=face<0?-1:1;const lb=k.lab(nm,1.8,.3,'#1a1a1a','#e8c020',60);lb.position.set(x,F+.72,z+2.05*fs);lb.rotation.y=fs<0?Math.PI:0;g.add(lb);const bk=k.lab(nm,1.8,.3,'#1a1a1a','#e8c020',60);bk.position.set(x,F+.72,z+1.995*fs);bk.rotation.y=fs<0?0:Math.PI;g.add(bk)}
 const leg=(lx,lz,h,m)=>P.B(.14,h,.14,lx,.16+h/2,lz,m||DK),foot=(lx,lz)=>P.B(.26,.03,.26,lx,.175,lz,ST);
 const H={obs:[{x0:x-1.5,x1:x+1.5,z0:z-1.5,z1:z+1.5}],ins:W(-1.6,1.05,0),outs:W(1.6,1.05,0)};
 const B2=(id=='wash')?()=>{/* trommels: perforated drums on trunnion rollers over a settling tank, a spray bar, a chain drive and motor, a discharge chute */
   const pt=k.tex(256,128,(c,w,h)=>{c.fillStyle='#6a7078';c.fillRect(0,0,w,h);c.fillStyle='#1a1c1e';for(let y=6;y<h;y+=12)for(let x2=(y/12%2)*6+3;x2<w;x2+=12){c.beginPath();c.arc(x2,y,3.2,0,7);c.fill()}});pt.repeat.set(3,1);
   const PM=M(0xffffff,{map:pt,metalness:.6,roughness:.4,side:THREE.DoubleSide});const zs=l>1?[-.8,.8]:[0];const wash=[];
   P.B(3.1,.5,zs.length>1?3.1:1.8,0,.41,0,M(0x3a4a52,{metalness:.5}));{const wt=new THREE.Mesh(new THREE.PlaneGeometry(2.9,zs.length>1?2.9:1.6),M(0x2a6a8a,{metalness:.2,roughness:.08,transparent:true,opacity:.85}));wt.rotation.x=-Math.PI/2;wt.position.y=.62;lg.add(wt)}
   for(const dz of zs){const tr=new THREE.Group();tr.position.set(0,1.32,dz);lg.add(tr);const d=new THREE.Mesh(new THREE.CylinderGeometry(.52,.52,2.4,22,1,true),PM);d.rotation.z=Math.PI/2;tr.add(d);
    for(const e of[-1.15,1.15]){const rg=new THREE.Mesh(new THREE.TorusGeometry(.56,.07,8,24),ST);rg.rotation.y=Math.PI/2;rg.position.x=e*.85;tr.add(rg)}{const gr=new THREE.Mesh(new THREE.TorusGeometry(.58,.05,6,28),YL);gr.rotation.y=Math.PI/2;gr.position.x=-.2;tr.add(gr)}
    for(const e of[-1.2,1.2]){const lip=new THREE.Mesh(new THREE.TorusGeometry(.5,.035,6,22),DK);lip.rotation.y=Math.PI/2;lip.position.x=e;tr.add(lip)}wash.push(tr);
    /* trunnion rollers on two cross frames */for(const ex of[-.98,.98]){P.B(.16,.5,1.3,ex,.86,dz,DK);for(const sz of[-.42,.42])P.C(.1,.1,.18,ex,.72+.38,dz+sz,ST,'x',null,12)}
    /* spray bar along the top with nozzles, fed from the water main at the west end */P.C(.04,.04,2.5,0,2.0,dz,BL,'x',null,8);for(let n=-2;n<=2;n++)P.C(.03,.05,.08,n*.5,1.93,dz,ST,null,null,6);P.C(.04,.04,.4,-1.25,1.8,dz,BL)}
   P.B(.5,.5,.4,1.25,.95,zs.length>1?1.3:.75,BL);P.B(.06,.42,.36,.9,1.0,zs.length>1?1.3:.75,YL);/* motor and chain guard */
   /* outlet chute from each drum mouth down onto the outgoing belt, propped on the tank; a feed box at each drum's inlet over the incoming belt */for(const dz of zs){const ch=P.B(.5,.05,.6,1.42,1.16,dz,ST);ch.rotation.z=-.3;for(const s of[-1,1])P.B(.5,.16,.04,1.42,1.22,dz+s*.3,ST).rotation.z=-.3;P.rod([1.42,1.1,dz],[1.42,.66,dz],.03,DK);P.B(.42,.36,.6,-1.42,1.08,dz,M(0x6a7078,{metalness:.5}));P.B(.46,.04,.64,-1.42,1.27,dz,DK)}
   H.wash=wash;H.washP=[x,z]}
 :(id=='sortr')?()=>{/* a feed hopper onto a short belt, a big red magnet drum at the head pulley, a splitter and three bins for the sorted ore */
   /* its own belt starts right under the end of the incoming one (x -1.6) */P.B(2.9,.14,1.1,-.25,.86,0,DK);for(const sx of[-1.5,1.0])for(const sz of[-.45,.45]){leg(sx,sz,.64);foot(sx,sz)}P.B(2.4,.06,.84,-.4,.96,0,RB);for(const sx of[-1.62,.82])P.C(.12,.12,.9,sx,.94,0,ST,'z',null,12);
   /* skirt boards where the ore lands on it */for(const sz of[-.36,.36])P.B(.8,.22,.04,-1.25,1.1,sz,M(0x6a7078,{metalness:.5}));P.B(.04,.22,.76,-1.65,1.1,0,M(0x6a7078,{metalness:.5}));
   const dr=P.C(.44,.44,1.0,.95,1.42,0,M(0xc02020,{metalness:.5,roughness:.35}),'z',null,22);for(const sz of[-.55,.55]){P.B(.2,.95,.1,.95,1.03,sz,DK);P.C(.14,.14,.08,.95,1.42,sz*1.04,ST,'z',null,14)}
   P.B(.45,.35,.35,.95,1.2,-.85,BL);P.B(.06,.3,.3,.95,1.2,-.66,ST);
   {const sp=P.B(.06,.5,.9,1.45,.9,0,ST);sp.rotation.z=.4}for(const[px,c]of[[.2,0xd07a40],[1.0,0x8a8a90],[1.8,0xe0e4ea]]){const bx=px-.6;P.B(.72,.5,.7,bx,.43,1.05,M(0x4a4e54,{metalness:.5}));P.B(.76,.04,.74,bx,.69,1.05,DK);for(let i=0;i<3;i++){const r=new THREE.Mesh(new THREE.DodecahedronGeometry(.11+i*.03,0),M(c,{metalness:.6,roughness:.4}));r.position.set(bx+(i-1)*.18,.72+i%2*.05,1.0+(i%2)*.1);lg.add(r)}}
   if(l>1){P.B(.6,1.1,.45,-1.35,.71,-1.2,BL);P.B(.5,.7,.02,-1.35,.8,-.97,M(0x1a2a3a));const lt=new THREE.Mesh(new THREE.SphereGeometry(.06,8,6),new THREE.MeshBasicMaterial({color:0x60c0ff}));lt.position.set(-1.35,1.32,-1.2);lg.add(lt)}
   H.sortD=dr}
 :(id=='mill')?()=>{/* ball mills: a bolted shell with a yellow girth gear, end heads and trunnions on bearing pedestals, a pinion and motor, a feed chute and a discharge screen */
   const zs=l>1?[-.85,.85]:[0];const mill=[];for(const dz of zs){const m=new THREE.Group();m.position.set(0,1.3,dz);lg.add(m);const Mm=k.H(m);
    Mm.C(.62,.62,2,0,0,0,M(0x5a6a7a,{metalness:.6,roughness:.35}),'x',null,24);for(const e of[-1,1])Mm.C(.62,.3,.18,e*1.09,0,0,M(0x4a5a6a,{metalness:.6}),'x',null,24).rotation.z=e>0?-Math.PI/2:Math.PI/2;
    {const gr=new THREE.Mesh(new THREE.TorusGeometry(.67,.08,6,32),YL);gr.rotation.y=Math.PI/2;gr.position.x=.45;m.add(gr)}for(const bx of[-.6,0])for(let b2=0;b2<10;b2++){const a=b2/10*Math.PI*2;Mm.B(.06,.05,.05,bx,Math.cos(a)*.625,Math.sin(a)*.625,ST)}
    /* the discharge screen turns with the mill, on its outlet trunnion */Mm.C(.28,.28,.36,1.66,0,0,M(0x6a7078,{metalness:.6}),'x',null,16);Mm.C(.3,.3,.04,1.84,0,0,DK,'x',null,16);Mm.C(.14,.14,.2,1.42,0,0,ST,'x',null,12);mill.push(m);for(const sx of[-1.32,1.32]){P.B(.42,.8,.56,sx,.56,dz,DK);P.C(.24,.24,.36,sx,1.02,dz,ST,'x',null,14);foot(sx,dz)}
    const pz=dz+(l>1?Math.sign(dz)*.62:.8);P.B(.55,.42,.44,.45,.37,pz,BL);P.C(.16,.16,.2,.45,.68,pz,YL,'z',null,12);P.B(.62,.08,.5,.45,.2,pz,DK)}
   /* the feed: the belt drops ore into a hopper; a screw feeder tube lifts it into each mill's feed trunnion */for(const dz of zs){const hz=dz;P.B(.5,.42,.58,-1.78,.82,hz,M(0x6a7078,{metalness:.5}));P.B(.56,.04,.64,-1.78,1.04,hz,DK);for(const sx of[-.2,.2])for(const sz of[-.24,.24])P.B(.06,.5,.06,-1.78+sx,.4,hz+sz,DK);P.rod([-1.62,.9,hz],[-1.22,1.3,hz],.11,M(0x5a6a7a,{metalness:.5}),null,12);P.C(.13,.13,.08,-1.24,1.29,hz,DK,'x',null,12);P.B(.22,.2,.2,-1.95,.95,hz+.38,BL)}
   H.mill=mill}
 :(id=='heat')?()=>{/* a riveted preheater drum on a frame, a coal firebox with a glowing door and grate, a stack, a gauge, a coal bunker; the hot-ore pipe leaves from the top (out) */
   for(const[sx,sz]of[[-.95,-.6],[.15,-.6],[-.95,.6],[.15,.6]]){leg(sx,sz,.62);foot(sx,sz)}P.B(1.3,.1,1.4,-.4,.82,0,DK);
   P.C(.85,.85,2.2,-.4,1.97,0,M(0x3a3a3a,{metalness:.6}),null,null,24);for(const y of[1.15,1.95,2.75])P.C(.87,.87,.06,-.4,y,0,DK,null,null,24);P.C(.25,.86,.55,-.4,3.33,0,M(0x3a3a3a,{metalness:.6}),null,null,24);P.C(.12,.12,.3,-.4,3.7,0,DK,null,null,12);
   /* the feed chute on the drum's west side, right under the end of the incoming belt */P.B(.4,.34,.6,-1.42,1.02,0,M(0x6a7078,{metalness:.5}));P.B(.44,.04,.64,-1.42,1.2,0,DK);P.rod([-1.42,.85,0],[-1.42,.16,0],.04,DK);P.B(.2,.03,.2,-1.42,.175,0,ST);const fire=new THREE.MeshStandardMaterial({color:0x200800,emissive:0xff5010,emissiveIntensity:1});const fb=P.B(.6,.42,.04,-.4,1.3,.87,fire);P.B(.74,.56,.03,-.4,1.3,.855,DK);for(let i=0;i<5;i++)P.B(.02,.42,.02,-.62+i*.11,1.3,.895,DK);
   P.C(.13,.15,3.4,.95,1.86,-.3,DK,null,null,12);P.C(.2,.2,.1,.95,3.6,-.3,DK,null,null,12);P.C(.26,.26,.04,.95,3.7,-.3,DK,null,null,12);
   {const gg=new THREE.Mesh(new THREE.CircleGeometry(.11,16),new THREE.MeshBasicMaterial({color:0xf0f0e8}));gg.position.set(-.4,2.2,.875);lg.add(gg);P.C(.13,.13,.04,-.4,2.2,.86,DK,'z',null,16);P.B(.01,.08,.005,-.4,2.22,.882,RD)}
   P.B(1.0,.6,.8,.9,.46,.95,M(0x4a3a2a,{roughness:.9}));for(let i=0;i<7;i++){const r=new THREE.Mesh(new THREE.DodecahedronGeometry(.13,0),M(0x111111,{roughness:1}));r.position.set(.55+(i%4)*.22,.8+(i>3?.08:0),.8+(i%3)*.15);lg.add(r)}
   H.heatF=fb;H.out=W(-.4,3.85,0)}
 :(id=='pol')?()=>{/* a steel bench with guarded polishing wheels on one shaft, a motor at the end, a dust hood and duct, a tray of shining bars */
   P.B(2.5,.1,1.1,0,.9,0,M(0x4a4e54,{metalness:.5}));for(const sx of[-1.15,1.15])for(const sz of[-.45,.45]){leg(sx,sz,.72);foot(sx,sz)}P.B(2.3,.04,.9,0,.4,0,DK);
   P.C(.04,.04,2.3,0,1.3,-.1,ST,'x',null,8);for(const sx of[-1,0,1])P.B(.08,.4,.1,sx*.95,1.1,-.1,DK);const pol=[];for(let i=0;i<l+1;i++){const px=-.7+i*.7;const w=P.C(.3,.3,.1,px,1.3,-.1,M(0xe8e8f0,{metalness:.9,roughness:.1}),'x',null,22);pol.push(w);const gd=new THREE.Mesh(new THREE.CylinderGeometry(.36,.36,.18,22,1,true,0,Math.PI),M(0x3a6a2a,{metalness:.4,side:THREE.DoubleSide}));gd.rotation.z=Math.PI/2;gd.rotation.x=Math.PI;gd.position.set(px,1.3,-.1);lg.add(gd)}
   P.C(.2,.2,.45,1.3,1.3,-.1,BL,'x',null,14);P.B(.3,.06,.3,1.3,1.0,-.1,DK);
   P.B(2.0,.3,.5,0,1.95,-.3,M(0x7a7e84,{metalness:.5}));P.C(.12,.12,.9,0,2.55,-.4,M(0x7a7e84,{metalness:.5}),null,null,10);for(const s of[-1,1])P.B(.04,.6,.04,s*.9,1.6,-.5,DK);
   P.B(.9,.06,.42,-.2,.96,.33,M(0x6a4a2a));for(let i=0;i<4;i++)P.B(.18,.08,.34,-.5+i*.21,1.03,.33,M(0xf0d050,{metalness:.95,roughness:.08}));
   H.pol=pol}
 :(id=='gen')?()=>{/* diesel gensets on skids: louvred housing, exhaust with a rain cap, a day tank, a control panel with lamps, a cable gland box */
   const zs=l>1?[-.85,.85]:[0];const ex=[];for(const dz of zs){P.B(2.8,.14,1.04,0,.23,dz,DK);P.B(2.55,1.1,.92,0,.85,dz,GN);P.B(2.62,.06,.98,0,1.43,dz,DK);
    for(const s of[-1,1])for(let kk=0;kk<8;kk++){const lv=P.B(.05,.5,.02,-1.0+kk*.12,.88,dz+s*.47,DK);lv.rotation.y=.5}P.B(.04,.62,.66,1.29,.88,dz,WH);for(const[ly,c]of[[1.05,0x30ff60],[.95,0xffb020]]){const lp=new THREE.Mesh(new THREE.SphereGeometry(.035,8,6),new THREE.MeshBasicMaterial({color:c}));lp.position.set(1.32,ly,dz+.18);lg.add(lp)}
    P.C(.08,.08,.7,.8,1.8,dz-.2,DK,null,null,10);P.C(.13,.13,.05,.8,2.17,dz-.2,DK,null,null,10);{const cap=P.B(.24,.02,.24,.8,2.22,dz-.2,ST);cap.rotation.z=.4}ex.push(W(.8,2.25,dz-.2))}
   P.C(.36,.36,1.2,-.4,.55,zs.length>1?0:-1.1,RD,'x',null,16);P.B(.5,.4,.3,-1.5,.5,zs.length>1?0:1.2,DK);H.gen=ex}
 :(id=='silo')?()=>{/* an ore silo on a braced stand, a discharge gate and spout, a caged ladder, a roof railing, a level gauge */
   for(const[sx,sz]of[[-.85,-.85],[.85,-.85],[-.85,.85],[.85,.85]]){P.B(.18,2.2,.18,sx,1.26,sz,DK);foot(sx,sz)}for(const[a,b,c,d]of[[-.85,-.85,.85,-.85],[-.85,.85,.85,.85],[-.85,-.85,-.85,.85],[.85,-.85,.85,.85]]){P.rod([a,.4,b],[c,1.95,d],.035,DK);P.rod([c,.4,d],[a,1.95,b],.035,DK)}
   const SL=M(0xc4c8cc,{metalness:.35,roughness:.45});P.C(1.15,.2,1.05,0,1.88,0,SL,null,null,24);P.B(.42,.32,.42,0,1.25,0,DK);P.B(.5,.06,.08,0,1.25,.26,YL);P.C(.12,.16,.4,0,.9,0,DK,null,null,10);
   P.C(1.2,1.2,3,0,3.9,0,SL,null,null,28);P.C(.2,1.2,.8,0,5.8,0,SL,null,null,28);for(const y of[2.45,3.9,5.35])P.C(1.22,1.22,.06,0,y,0,DK,null,null,28);
   for(const sd of[-.2,.2])P.B(.05,5.4,.05,1.3,2.9,sd,YL);for(let y=.5;y<5.5;y+=.32)P.B(.04,.04,.4,1.3,y,0,YL);for(let y=2.2;y<5.6;y+=.6){const rg=new THREE.Mesh(new THREE.TorusGeometry(.32,.018,4,12,Math.PI),YL);rg.rotation.set(Math.PI/2,0,-Math.PI/2);rg.position.set(1.3,y,0);rg.position.x+=.0;lg.add(rg)}
   {const rr=new THREE.Mesh(new THREE.TorusGeometry(.75,.03,6,24),YL);rr.rotation.x=Math.PI/2;rr.position.y=6.45;lg.add(rr);for(let kk=0;kk<6;kk++){const a=kk/6*6.283;P.B(.03,.42,.03,Math.cos(a)*.75,6.25,Math.sin(a)*.75,YL)}}
   P.B(.08,2.4,.03,-.9,3.9,.9,WH).rotation.y=-.78;P.B(.07,1.3,.035,-.9,3.4,.9,M(0x7a5a3a)).rotation.y=-.78}
 :(id=='lab')?()=>{/* a site lab cabin: a window with a sill, the door beside it with steps, an air conditioner, a dish and an aerial with a lamp */
   P.B(3,2.3,2.6,0,1.33,0,WH);P.B(3.2,.12,2.8,0,2.54,0,M(0x3a6a8a));P.B(3.04,.1,2.64,0,.25,0,DK);
   P.B(1.2,.75,.04,-.6,1.6,1.31,M(0x335070,{metalness:.4,roughness:.2,emissive:0x102030}));P.B(1.32,.06,.12,-.6,1.2,1.34,M(0x8a8a8a));for(const s of[-1,1])P.B(.06,.82,.06,-.6+s*.63,1.6,1.32,M(0x8a8a8a));P.B(1.32,.06,.06,-.6,2.0,1.32,M(0x8a8a8a));
   P.B(.8,1.95,.04,.85,1.16,1.31,M(0x6a8aa0));P.C(.035,.035,.08,.6,1.16,1.36,ST,'z',null,8);for(let i=0;i<2;i++)P.B(.9,.12,.32-i*.0,.85,.22+i*.0,1.48+i*.0,k.PRE);
   P.B(.7,.5,.4,-1.1,.6,-1.5,M(0xd0d0c8));for(let kk=0;kk<4;kk++)P.B(.6,.03,.02,-1.1,.45+kk*.1,-1.71,DK);
   /* a satellite dish: a shallow bowl with a rim, tilted up, on a yoke; a feed arm with the receiver at its focus */const dsh=new THREE.Group();dsh.position.set(-.9,2.6,-.6);lg.add(dsh);{const D=k.H(dsh);D.B(.3,.03,.3,0,.015,0,DK);D.C(.04,.05,.38,0,.2,0,DK,null,null,10);const tilt=new THREE.Group();tilt.position.y=.42;tilt.rotation.x=-.75;dsh.add(tilt);const T=k.H(tilt);const prof=[];for(let i=0;i<=10;i++){const r=.45*i/10;prof.push(new THREE.Vector2(r,r*r*.9))}const bowl=new THREE.Mesh(new THREE.LatheGeometry(prof,28),M(0xe8e8e4,{roughness:.55,metalness:.15,side:THREE.DoubleSide}));bowl.position.y=.06;tilt.add(bowl);{const rim=new THREE.Mesh(new THREE.TorusGeometry(.45,.015,6,28),M(0xd0d0cc,{roughness:.5}));rim.rotation.x=Math.PI/2;rim.position.y=.06+.18;tilt.add(rim)}T.C(.07,.09,.08,0,.02,0,DK,null,null,12);T.rod([0,.08,-.42],[0,.42,-.02],.012,DK);T.rod([0,.08,.42],[0,.42,.02],.012,DK);T.C(.03,.035,.1,0,.47,0,DK,null,null,10);T.C(.045,.045,.03,0,.41,0,M(0x3a3a3a),null,null,10);for(const s2 of[-1,1])D.B(.03,.14,.06,s2*.09,.42,0,DK)}
   P.C(.015,.015,1.2,1.2,3.2,-1,DK,null,null,5);const bk=new THREE.Mesh(new THREE.SphereGeometry(.07,8,6),new THREE.MeshBasicMaterial({color:0x30ff60}));bk.position.set(1.2,3.82,-1);lg.add(bk);H.labD=dsh;H.labL=bk}:null;
 if(B2)B2();lg.traverse(o=>{if(o.isMesh)o.userData.noSeam=true});return H}
