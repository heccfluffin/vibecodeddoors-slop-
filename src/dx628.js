/* =====================================================================================================
   HANGAR 1 REWORK (design spec docs/design/hangar-1.md, models docs/design/models/hangar-1.js).
   r640: The X-13 Wraith hangar at Fort Blackout gets a proper inside to go with its r616 cladding (fbHangarSkin):
   - batch 1, hgShell: one painted floor (lane, the Wraith's bay box with its name, the tank bay's hazard border, a zebra
     walkway, the KEEP CLEAR hatch by the door), a wall lining, two steel pockets the blast door slabs slide into,
     steel columns, roof trusses and 21 high-bay lights. hgDoorSlab repaints the two blast door slabs (half of the big
     HANGAR 1 board each from outside, panels and chevrons inside) and gives them ribs, a seal and rollers.
   - batch 2, hgCrane + hgWorkshop: an overhead crane over a proper tank bay (the tank's turret hangs from its hook),
     benches with pegboards, tool chests, an engine stand, a scissor lift, road wheels, a compressor and the fuel bowser.
   - batch 3, hgSouth: a glass control room (the technician now sits in it, facing the Wraith), two spares racks, a drum
     cage, the crew corner with lockers and a coffee counter, and a fire point.
   - batch 4, hgRefit: the refit station (dx556) restyled, with the same moving parts so the refit job works as before.
   What it replaces: the old floor, yellow dashes, lamp grid, gantry crane, benches, tool carts, spares rack, drums,
   diagnostics desk, lockers, hazard stripes, cable snake, fuel bowser, scissor lift, compressor and tyres of the base
   (build.py block "hangar-1.md"), and the pad, gantry, arms and holo in rfsBuild (dx556, edited there).
   Globals added: hgShell, hgDoorSlab, hgCrane, hgWorkshop, hgSouth, hgRefit (the model file, unchanged) and hgSub.
   The model functions mark everything in the group they get as noSeam, so the hangar's new pieces go into one group of
   their own (hgSub), not straight into the desert group (that would have switched the seam smoothing off everywhere).
   ===================================================================================================== */
/* =====================================================================================================
   Hangar 1 (the X-13 Wraith hangar) inside. Needs fbKit (fort-kit.js). See hangar-1.md.
   Inside faces of the base's walls: x 325.5 / 424.5, z -717.5 / -670.5. Ceiling (underside of the roof slab) y 9.
   Blast door opening on the east wall, z -704..-684, 7 m high; its two slabs slide 10 m north and south.
   ===================================================================================================== */

/* ---- batch 1: the building. Painted floor, wall lining, door pockets, steel columns, roof trusses, high-bay lights ---- */
function hgShell(g){const k=fbKit(),{B,C,rod,L}=k.H(g),M=k.M;const X0=325.5,X1=424.5,Z0=-717.5,Z1=-670.5,CEIL=9;const obs=[];
 /* the painted floor: one texture, so no line can flicker. 2048 x 1024 over 99 x 47 m */
 const FW=2048,FH=1024,sx=FW/(X1-X0),sz=FH/(Z1-Z0),fx=x=>(x-X0)*sx,fz=z=>(z-Z0)*sz;
 const ft=k.tex(FW,FH,(c)=>{c.fillStyle='#5a5e62';c.fillRect(0,0,FW,FH);
  /* concrete mottling, seeded */let sd=4242;const r=()=>((sd=Math.imul(sd^sd>>>15,sd|1)+0x6d2b79f5|0)>>>0)/4294967296;
  for(let i=0;i<9000;i++){const a=.012+r()*.025;c.fillStyle=r()<.5?'rgba(255,255,255,'+a+')':'rgba(0,0,0,'+a+')';const w=2+r()*12;c.beginPath();c.ellipse(r()*FW,r()*FH,w,w*(.4+r()*.6),r()*3,0,7);c.fill()}
  /* oil stains under the tank bay and by the bowser */for(const[x,z,s]of[[384,-710,2.2],[389,-711,1.4],[408,-714,1.6],[377,-694,1.8]]){const gr=c.createRadialGradient(fx(x),fz(z),0,fx(x),fz(z),s*sx);gr.addColorStop(0,'rgba(20,18,16,.35)');gr.addColorStop(1,'rgba(20,18,16,0)');c.fillStyle=gr;c.fillRect(fx(x-s),fz(z-s),2*s*sx,2*s*sz)}
  /* saw-cut joints every 6 m */c.strokeStyle='rgba(30,32,34,.55)';c.lineWidth=1.2;for(let x=X0+5.5;x<X1;x+=6){c.beginPath();c.moveTo(fx(x),0);c.lineTo(fx(x),FH);c.stroke()}for(let z=Z0+5.5;z<Z1;z+=6){c.beginPath();c.moveTo(0,fz(z));c.lineTo(FW,fz(z));c.stroke()}
  const rect=(x0,x1,z0,z1,col)=>{c.fillStyle=col;c.fillRect(fx(x0),fz(z0),fx(x1)-fx(x0),fz(z1)-fz(z0))};
  const haz=(x0,x1,z0,z1,w)=>{c.save();c.beginPath();c.rect(fx(x0),fz(z0),fx(x1)-fx(x0),fz(z1)-fz(z0));c.rect(fx(x0+w),fz(z0+w),fx(x1-w)-fx(x0+w),fz(z1-w)-fz(z0+w));c.clip('evenodd');c.fillStyle='#d8b020';c.fillRect(0,0,FW,FH);c.fillStyle='#1c1c1c';c.lineWidth=0;for(let i=-FH;i<FW;i+=16){c.beginPath();c.moveTo(i,FH);c.lineTo(i+8,FH);c.lineTo(i+8+FH,0);c.lineTo(i+FH,0);c.fill()}c.restore()};
  /* the drive lane: two solid yellow edge lines from the refit pad to the door *//* (they stop at the Wraith bay box, x 370..386) */for(const[a,b]of[[346.9,369.6],[386.4,422]]/* (starts under the pad's slanted rim, so no gap shows) */){rect(a,b,-698.12,-697.88,'#d8b020');rect(a,b,-690.12,-689.88,'#d8b020')}
  /* the Wraith bay box, white, with its name painted at the door end */const wl=(x0,x1,z0,z1)=>rect(x0,x1,z0,z1,'#e8e4d8');wl(370,386,-700.1,-699.9);wl(370,386,-688.1,-687.9);wl(369.9,370.1,-700.1,-687.9);wl(385.9,386.1,-700.1,-687.9);
  c.save();c.translate(fx(384.4),fz(-694));c.rotate(-Math.PI/2);c.fillStyle='rgba(232,228,216,.92)';c.textAlign='center';c.textBaseline='middle';c.font='bold '+Math.round(1.1*sx)+'px '+k.FONT;c.fillText('BAY 1 · X-13 WRAITH',0,0);c.restore();
  /* the tank bay: a hazard border */haz(379,393,-714,-706,.4);
  /* a walkway across the lane by the door, zebra */for(let i=0;i<8;i++)rect(408,411,-698+i+.15,-698+i+.65,'#e8e4d8');
  /* the door track zone: yellow hatch, KEEP CLEAR */haz(422,424.5,-704,-684,1.25);c.save();c.translate(fx(423.25),fz(-694));c.rotate(-Math.PI/2);c.fillStyle='#d8b020';c.fillRect(-3*sz,-.5*sx,6*sz,1*sx);c.fillStyle='#1c1c1c';c.textAlign='center';c.textBaseline='middle';c.font='bold '+Math.round(.75*sx)+'px '+k.FONT;c.fillText('KEEP CLEAR',0,1);c.restore()});
 ft.wrapS=ft.wrapT=THREE.ClampToEdgeWrapping;ft.anisotropy=8;
 const fl=new THREE.Mesh(new THREE.PlaneGeometry(X1-X0,Z1-Z0),M(0xffffff,{map:ft,roughness:.55,metalness:.08}));fl.rotation.x=-Math.PI/2;fl.position.set((X0+X1)/2,.08,(Z0+Z1)/2);fl.userData.noSeam=true;g.add(fl);
 /* the wall lining: a dark green dado to 1.2 m, light panels above with seams, a cable tray at 6 m */
 const pan=k.tex(256,256,(c,w,h)=>{c.fillStyle='#b4b6ae';c.fillRect(0,0,w,h);c.fillStyle='rgba(0,0,0,.18)';c.fillRect(0,0,3,h);c.fillRect(0,0,w,2);c.fillStyle='rgba(255,255,255,.08)';c.fillRect(3,2,2,h)});
 const PAN=M(0xffffff,{map:pan,roughness:.7});PAN.userData.s=1/3;const DADO=M(0x46524a,{roughness:.75}),TRAY=M(0x6a6e72,{metalness:.5,roughness:.45});
 const line=(ax,c0,a0,a1,inw,y0,y1)=>{/* ax 'x': a wall along x at z = c0, facing inw (+1 = +z) */const len=a1-a0,m=(a0+a1)/2,y=y1==null?CEIL:y1,lo=y0||0;
  if(ax=='x'){if(lo<1.2)B(len,1.2-lo,.04,m,(lo+1.2)/2,c0+inw*.05,DADO);B(len,y-Math.max(1.2,lo),.04,m,(Math.max(1.2,lo)+y)/2,c0+inw*.05,PAN);if(lo<6)B(len,.08,.3,m,6,c0+inw*.22,TRAY)}
  else{if(lo<1.2)B(.04,1.2-lo,len,c0+inw*.05,(lo+1.2)/2,m,DADO);B(.04,y-Math.max(1.2,lo),len,c0+inw*.05,(Math.max(1.2,lo)+y)/2,m,PAN);if(lo<6)B(.3,.08,len,c0+inw*.22,6,m,TRAY)}};
 line('x',Z0,X0,X1,1);line('x',Z1,X0,X1,-1);line('z',X0,Z0+.07,Z1-.07,1);
 /* the east wall: lining only where the door slabs don't slide; the slabs slide into two steel pockets */
 line('z',X1,Z0+.07,-714.6,-1);line('z',X1,-673.4,Z1-.07,-1);B(.04,CEIL-7.45,40.8,X1-.05,7.45+(CEIL-7.45)/2,-694,PAN);
 {const PK=M(0x5e656c,{roughness:.5,metalness:.4}),RIB=M(0x454b52,{roughness:.5,metalness:.45});
  for(const[za,zb]of[[-714.6,-704.25],[-683.75,-673.4]]){const zc=(za+zb)/2,ln=zb-za;B(.5,7.45,ln,X1-.33,7.45/2,zc,PK);obs.push({x0:X1-.6,x1:X1,z0:za,z1:zb});
   for(let y=1;y<7;y+=1.5)B(.06,.12,ln-.1,X1-.6,y,zc,RIB);B(.06,.3,ln,X1-.6,7.3,zc,k.HAZ||RIB);
   const lb=L('BLAST DOOR · STAND CLEAR',ln*.7,.45,'#d8b020','#1a1a1a',60,X1-.64,6.4,zc,-Math.PI/2)}
  /* the portal round the opening, inside face: two jambs and a header */for(const z of[-704.1,-683.9])B(.5,7.45,.3,X1-.33,7.45/2,z,RIB);B(.5,.5,20.6,X1-.33,7.2,-694,RIB)}
 /* steel columns against the north and south walls (none at x 343: the refit gantry is there) */
 const STL=M(0x50565c,{roughness:.5,metalness:.55}),STB=M(0x3e444a,{roughness:.55,metalness:.5}),CX=[331,355,367,379,391,403,415],TB=8.15,TT=8.9;
 const col=(x,z,sgn)=>{/* an I-section: two flanges .3 wide and a web; z is the wall face, sgn into the room */const zc=z+sgn*(.09+.2);B(.3,TB,.03,x,TB/2,zc-sgn*.18,STL);B(.3,TB,.03,x,TB/2,zc+sgn*.18,STL);B(.03,TB,.33,x,TB/2,zc,STL);B(.5,.03,.5,x,.095,zc,STB);for(const dx of[-.18,.18])for(const dz of[-.18,.18])C(.025,.025,.06,x+dx,.13,zc+dz,STB);
  /* a knee brace up to the truss */rod([x,6.6,zc],[x,TB,zc+sgn*1.2],.05,STL);obs.push({x0:x-.25,x1:x+.25,z0:Math.min(zc-.25,zc+.25),z1:Math.max(zc-.25,zc+.25)})};
 for(const x of CX){col(x,Z0,1);col(x,Z1,-1)}
 /* roof trusses across the hangar on each pair of columns: chords, verticals and diagonals every 2.35 m */
 const span=Z1-Z0,n=20,dz=span/n;for(const x of CX){B(.14,.14,span,x,TT,(Z0+Z1)/2,STL);B(.14,.14,span-.8,x,TB,(Z0+Z1)/2,STL);
  for(let i=0;i<=n;i++){const z=Z0+i*dz;if(i>0&&i<n)B(.08,TT-TB,.08,x,(TB+TT)/2,z,STB);if(i<n){const up=i<n/2;rod([x,up?TB:TT,z],[x,up?TT:TB,z+dz],.035,STB)}}}
 /* purlins along the hangar between the trusses */for(const z of[-714,-706,-694,-682,-674]){B(X1-X0-.2,.12,.1,(X0+X1)/2,TT+.08,z,STB)}
 /* high-bay lights hanging from the trusses, three rows (the old flat lamp grid goes) */
 const LITM=M(0xfff4dc,{emissive:0xfff0d0,emissiveIntensity:1.2,roughness:.4}),SH=M(0x2c3034,{roughness:.45,metalness:.5,side:THREE.DoubleSide});
 for(const x of CX)for(const z of[-708,-694,-680]){rod([x,TB,z],[x,7.75,z],.015,STB);C(.08,.1,.18,x,7.7,z,STB);C(.22,.5,.36,x,7.45,z,SH,null,null,18,true);const d=new THREE.Mesh(new THREE.CircleGeometry(.44,18),LITM);d.rotation.x=Math.PI/2;d.position.set(x,7.3,z);g.add(d)}
 g.traverse(o=>{if(o.isMesh)o.userData.noSeam=true});
 return{obs}}

/* ---- the blast door slabs. The game makes each slab a BoxGeometry(.6, 7, 10) at x 424.75 and slides its z; call
   hgDoorSlab(dA, -1) and hgDoorSlab(dB, 1) right after (side: -1 the north slab, +1 the south one). It repaints the
   slab (outside: half of the big HANGAR 1 board each, inside: panels and chevrons), drops the old yellow stripe
   children and adds the inside ribs, the seal on the meeting edge and the rollers. Nothing sticks out of the outside
   face, so the slab still slides behind the wall cladding cleanly. ---- */
function hgDoorSlab(m,side){const k=fbKit();while(m.children.length)m.remove(m.children[0]);const P=k.H(m),M=k.M;
 const out=k.tex(1024,768,(c,w,h)=>{c.fillStyle='#454c52';c.fillRect(0,0,w,h);
  /* panel seams and rivets */c.fillStyle='rgba(0,0,0,.28)';for(let x=0;x<w;x+=w/4)c.fillRect(x,0,3,h);for(let y=0;y<h;y+=h/5)c.fillRect(0,y,w,3);c.fillStyle='rgba(255,255,255,.18)';for(let x=12;x<w;x+=w/16)for(let y=10;y<h;y+=h/10){c.beginPath();c.arc(x,y,2.2,0,7);c.fill()}
  /* hazard bands top and bottom */const hz=(y0,hh)=>{c.save();c.beginPath();c.rect(0,y0,w,hh);c.clip();c.fillStyle='#d8b020';c.fillRect(0,y0,w,hh);c.fillStyle='#1a1a1a';for(let i=-hh*2;i<w+hh;i+=56){c.beginPath();c.moveTo(i,y0+hh);c.lineTo(i+28,y0+hh);c.lineTo(i+28+hh,y0);c.lineTo(i+hh,y0);c.fill()}c.restore()};hz(h-60,60);hz(0,34);
  /* the big name, split over the two slabs: the south slab has the left half as you look at it from outside */
  c.save();c.fillStyle='#e8e0c8';c.font='bold 300px "Barlow Semi Condensed",DoorsSans,Arial,sans-serif';c.textBaseline='middle';c.textAlign='center';c.fillText('HANGAR 1',side>0?w:0,h*.46);c.font='bold 64px "Barlow Semi Condensed",DoorsSans,Arial,sans-serif';c.fillStyle='#40c0ff';c.fillText('X-13 WRAITH PROGRAMME',side>0?w:0,h*.72);c.restore()});
 const ins=k.tex(1024,768,(c,w,h)=>{c.fillStyle='#5a6268';c.fillRect(0,0,w,h);c.fillStyle='rgba(0,0,0,.25)';for(let x=0;x<w;x+=w/4)c.fillRect(x,0,3,h);
  c.save();c.beginPath();c.rect(0,h-70,w,70);c.clip();c.fillStyle='#d8b020';c.fillRect(0,h-70,w,70);c.fillStyle='#1a1a1a';for(let i=-140;i<w+70;i+=56){c.beginPath();c.moveTo(i,h);c.lineTo(i+28,h);c.lineTo(i+98,h-70);c.lineTo(i+70,h-70);c.fill()}c.restore();
  c.fillStyle='#d8b020';c.font='bold 54px "Barlow Semi Condensed",DoorsSans,Arial,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('DANGER · DOOR MOVES WITHOUT WARNING',w/2,h*.16)});
  const OUT=M(0xffffff,{map:out,roughness:.5,metalness:.45}),INS=M(0xffffff,{map:ins,roughness:.5,metalness:.45}),EDG=M(0x3a4046,{roughness:.5,metalness:.5});
 m.material=[OUT,INS,EDG,EDG,EDG,EDG];
 /* the inside face (x -0.3): a frame and ribs, 6 cm proud */const RB=M(0x4a5258,{roughness:.45,metalness:.55});const fx=-.33;
 for(const y of[-3.42,3.42])P.B(.06,.16,10,fx,y,0,RB);for(const z of[-4.92,4.92])P.B(.06,7,.16,fx,0,z,RB);for(const y of[-1.8,0,1.8])P.B(.06,.12,9.7,fx,y,0,RB);for(const z of[-2.5,0,2.5])P.B(.06,6.7,.1,fx,0,z,RB);
 /* the seal on the meeting edge (z = -side*5) and the rollers on the track */P.B(.5,6.9,.08,0,0,-side*5.03,M(0x1a1a1a,{roughness:.9}));
 for(const z of[-3.8,3.8]){P.B(.3,.3,.8,fx-.02,-3.32,z,RB);P.C(.12,.12,.36,-.1,-3.42,z,M(0x2a2a2a,{metalness:.6}),'x',null,14)}
 m.traverse(o=>{if(o.isMesh)o.userData.noSeam=true})}

/* ---- batch 2: the workshop on the north side ---- */
/* the overhead crane over the tank bay: runways on brackets at z -716.6 and on two posts at z -703.8, a box-girder bridge,
   a hoist trolley, a chain and a hook block. Returns {br, tr, ch, hk, tick(t), obs}. Hang the tank's turret on hk. */
function hgCrane(g){const k=fbKit(),{B,C,rod,L}=k.H(g),M=k.M;const YL=M(0xe0b020,{roughness:.5,metalness:.35}),STL=M(0x50565c,{roughness:.5,metalness:.55}),DK=M(0x26292c,{roughness:.6,metalness:.4});const obs=[];
 const ZN=-716.55,ZS=-703.8,RY=6.85,X0=376.5,X1=395.5;
 /* runways: I-beams with a rail on top */for(const z of[ZN,ZS]){B(X1-X0,.36,.14,(X0+X1)/2,RY,z,STL);B(X1-X0,.03,.3,(X0+X1)/2,RY-.18,z,STL);B(X1-X0,.03,.3,(X0+X1)/2,RY+.18,z,STL);B(X1-X0,.06,.06,(X0+X1)/2,RY+.22,z,DK);for(const x of[X0+.1,X1-.1])B(.2,.3,.36,x,RY+.3,z,YL)}
 /* north brackets off the wall columns, south posts */for(const x of[379,391]){B(.3,.4,.6,x,RY-.38,ZN-.1,STL);rod([x,RY-.6,ZN-.4],[x,RY-1.6,ZN-.4+0],.05,STL);
  B(.3,RY-.2,.03,x,(RY-.2)/2,ZS-.16,STL);B(.3,RY-.2,.03,x,(RY-.2)/2,ZS+.16,STL);B(.03,RY-.2,.3,x,(RY-.2)/2,ZS,STL);B(.5,.03,.5,x,.095,ZS,DK);B(.32,.4,.4,x,RY-.4,ZS,STL);B(.34,1.2,.36,x,.68,ZS,YL);obs.push({x0:x-.3,x1:x+.3,z0:ZS-.3,z1:ZS+.3})}
 /* the bridge */const br=new THREE.Group();br.position.set(386,RY+.22,(ZN+ZS)/2);br.userData.dpKeep=1;g.add(br);const P=k.H(br),span=ZS-ZN+.5;
 P.B(.5,.6,span,0,.55,0,YL);P.B(.7,.04,span,0,.87,0,YL);P.B(.7,.04,span,0,.23,0,YL);for(const z of[-span/2+.2,span/2-.2]){P.B(2.2,.36,.5,0,.35,z,YL);for(const dx of[-.8,.8])P.C(.14,.14,.12,dx,.12,z,DK,'z',null,12)}
 {const lb=k.lab('SWL 20 t',2.4,.4,'#e0b020','#1a1a1a',60);lb.position.set(-.26,.55,0);lb.rotation.y=-Math.PI/2;br.add(lb);const l2=lb.clone();l2.position.x=.26;l2.rotation.y=Math.PI/2;br.add(l2)}
 /* the trolley and hoist */const tr=new THREE.Group();br.add(tr);const T=k.H(tr);T.B(1.1,.3,.9,0,.99,0,DK);T.B(.9,.6,.6,0,.02,0,M(0x3a6a9a,{roughness:.5,metalness:.4}));T.C(.28,.28,.8,0,.05,0,DK,'x',null,16);
 const ch=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,1,6),M(0x8a8e92,{metalness:.8,roughness:.3}));ch.position.y=-.8;tr.add(ch);
 const hk=new THREE.Group();tr.add(hk);const H=k.H(hk);H.B(.36,.42,.26,0,0,0,YL);H.C(.08,.08,.3,0,-.3,0,DK);const hook=new THREE.Mesh(new THREE.TorusGeometry(.14,.045,8,14,Math.PI*1.4),DK);hook.position.set(0,-.55,0);hook.rotation.z=-.4;hk.add(hook);
 /* drop: how far the hook hangs below the bridge */const setDrop=d=>{hk.position.y=-.3-d;ch.scale.y=d;ch.position.y=-.3-d/2};setDrop(2.6);
 const tick=t=>{br.position.x=386+Math.sin(t*.12)*3.2;tr.position.z=Math.sin(t*.2)*1.8;setDrop(2.6+Math.sin(t*.07)*.4)};
 g.traverse(o=>{if(o.isMesh)o.userData.noSeam=true});return{br,tr,ch,hk,tick,setDrop,obs}}

/* the rest of the workshop: benches with pegboards, tool chests, an engine stand and parts table, the tank's stands,
   a scissor lift, a tyre stack, a compressor and the fuel bowser. Returns {obs}. */
function hgWorkshop(g){const k=fbKit(),{B,C,rod,L}=k.H(g),M=k.M;const obs=[],ob=(x0,x1,z0,z1)=>obs.push({x0,x1,z0,z1});
 const STL=M(0x50565c,{roughness:.5,metalness:.55}),DK=M(0x26292c,{roughness:.6,metalness:.4}),RD=M(0xb02828,{roughness:.45,metalness:.3}),YL=M(0xe0b020,{roughness:.5,metalness:.3}),WD=M(0x8a6a44,{roughness:.8}),BL=M(0x2a5a8a,{roughness:.5,metalness:.4}),RUB=M(0x1a1a1a,{roughness:.95}),CHR=M(0xb8bcc0,{metalness:.85,roughness:.25});
 const peg=k.tex(512,256,(c,w,h)=>{c.fillStyle='#c8b896';c.fillRect(0,0,w,h);c.fillStyle='rgba(60,40,20,.5)';for(let x=8;x<w;x+=16)for(let y=8;y<h;y+=16)c.fillRect(x,y,3,3);
  /* tool outlines and tools */const tl=(x,y,ww,hh,col)=>{c.fillStyle='rgba(30,30,30,.35)';c.fillRect(x-2,y-2,ww+4,hh+4);c.fillStyle=col;c.fillRect(x,y,ww,hh)};
  for(let i=0;i<7;i++)tl(20+i*22,30,8,90+i*6,'#9aa0a6');for(let i=0;i<5;i++){tl(200+i*30,26,10,70,'#c03030');tl(200+i*30,96,10,22,'#9aa0a6')}tl(360,30,110,20,'#8a8e92');tl(360,70,24,80,'#c03030');tl(400,70,60,14,'#9aa0a6');tl(400,100,60,14,'#9aa0a6');for(let i=0;i<6;i++){c.fillStyle='#2a2a2a';c.beginPath();c.arc(40+i*28,200,10,0,7);c.fill()}c.fillStyle='#e0b020';c.fillRect(260,170,180,50);c.fillStyle='#1a1a1a';c.font='bold 22px "Barlow Semi Condensed",DoorsSans,Arial,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('X-13 TOOLS · SIGN OUT',350,195,164)});
 const PEG=M(0xffffff,{map:peg,roughness:.8});
 /* four benches against the north wall, as the game had them (x 334, 342, 350, 358) */
 for(const x of[334,342,350,358]){const z=-716.6;B(4,.06,1.15,x,.93,z,WD);B(4.04,.04,1.18,x,.88,z,STL);for(const dx of[-1.9,1.9])for(const dz of[-.5,.5])B(.06,.86,.06,x+dx,.45,z+dz,STL);B(3.9,.04,1.05,x,.25,z,STL);
  B(1.0,.7,1.0,x+1.3,.5,z,RD);for(let d=0;d<4;d++)B(.9,.02,.01,x+1.3,.25+d*.16,z+.505,CHR);
  const pb=new THREE.Mesh(new THREE.PlaneGeometry(4,1.6),PEG);pb.position.set(x,1.95,-717.38);g.add(pb);B(4.1,.05,.3,x,2.82,-717.27,STL);
  /* a vice, a lamp, bits on the top */C(.06,.06,.2,x-1.5,1.04,z+.45,DK);B(.3,.14,.18,x-1.5,1.06,z+.4,BL);rod([x+.4,.96,z-.4],[x+.3,1.5,z-.1],.02,DK);C(.06,.12,.14,x+.3,1.5,z,DK);B(.4,.12,.3,x-.5,1.02,z-.1,RD);C(.1,.1,.16,x+.9,1.04,z+.2,M(0x5a7a3a));ob(x-2,x+2,-717.2,-716)}
 /* tool chests on castors */const chest=(x,z,ry)=>{const gg=new THREE.Group();gg.position.set(x,0,z);gg.rotation.y=ry||0;g.add(gg);const P=k.H(gg);P.B(1.3,.95,.65,0,.6,0,RD);P.B(1.2,.5,.55,0,1.35,-.04,RD);P.B(1.34,.03,.68,0,1.1,0,STL);for(let d=0;d<5;d++)P.B(1.1,.02,.01,0,.25+d*.17,.33,CHR);for(const dx of[-.55,.55])for(const dz of[-.25,.25])P.C(.05,.05,.04,dx,.07,dz,RUB,'x');ob(x-.7,x+.7,z-.4,z+.4)};
 chest(338,-713.2,0);chest(362.5,-713.2,0);
 /* engine stand and a parts table between the benches and the tank bay */{const ex=353,ez=-711;B(.1,.9,.1,ex,.5,ez,STL);B(1.6,.08,.08,ex,.1,ez,STL);B(.08,.08,1.2,ex-.7,.1,ez,STL);B(1.4,.8,.9,ex+.35,1.1,ez,M(0x3a3e42,{metalness:.5}));for(let i=0;i<4;i++)C(.12,.12,.25,ex+.0+i*.32,1.6,ez,DK);C(.3,.3,.15,ex-.42,1.1,ez,CHR,'x',null,16);ob(ex-.8,ex+1.1,ez-.6,ez+.6);
  const tx=357.5;B(2,.06,1,tx,.88,ez,STL);for(const dx of[-.9,.9])for(const dz of[-.42,.42])B(.05,.86,.05,tx+dx,.44,ez+dz,STL);for(let i=0;i<5;i++)B(.3,.12+i%2*.1,.25,tx-.7+i*.35,.97+i%2*.05,ez+(i%2?.2:-.15),i%2?BL:DK);ob(tx-1,tx+1,ez-.5,ez+.5)}
 /* the tank's stands (the tank hull sits on them at y .45, x 386, z -710) */for(const dx of[-2,2])for(const dz of[-1.2,1.2]){const x=386+dx,z=-710+dz;B(.5,.06,.5,x,.11,z,YL);C(.12,.16,.3,x,.29,z,YL);B(.4,.04,.4,x,.45,z,DK)}
 /* a red tool cart by the tank */{const x=381.6,z=-706.9;B(1.0,.04,.6,x,.85,z,STL);B(1.0,.04,.6,x,.45,z,STL);for(const dx of[-.48,.48])for(const dz of[-.28,.28]){B(.03,.8,.03,x+dx,.48,z+dz,RD);C(.05,.05,.03,x+dx,.06,z+dz,RUB,'x')}B(.4,.1,.2,x-.2,.92,z,RD);C(.04,.04,.4,x+.25,.89,z,CHR,'x');ob(x-.55,x+.55,z-.35,z+.35)}
 /* the scissor lift, raised a little */{const x=375.5,z=-711.5,ph=1.55;B(2.4,.35,1.1,x,.3,z,YL);B(2.5,.04,1.2,x,.12,z,DK);for(const dx of[-.95,.95])C(.12,.12,.14,x+dx,.12,z-.5,RUB,'z',null,12),C(.12,.12,.14,x+dx,.12,z+.5,RUB,'z',null,12);
  for(const dz of[-.45,.45]){const lv=[.48,ph-.1];rod([x-1,lv[0],z+dz],[x+1,lv[1],z+dz],.04,DK);rod([x+1,lv[0],z+dz],[x-1,lv[1],z+dz],.04,DK)}B(2.4,.1,1.1,x,ph,z,YL);for(const dz of[-.52,.52])B(2.4,.04,.04,x,ph+1.05,z+dz,YL);for(const dx of[-1.18,1.18])B(.04,.04,1.08,x+dx,ph+1.05,z,YL);for(const dx of[-1.18,0,1.18])for(const dz of[-.52,.52])B(.04,1.0,.04,x+dx,ph+.55,z+dz,YL);B(.3,.4,.15,x+.9,ph+.75,z+.5,DK);ob(x-1.25,x+1.25,z-.6,z+.6)}
 /* tank road wheels, stacked */for(let i=0;i<4;i++){const w=C(.42,.42,.2,396.5+(i>1?1:0),.12+(i%2)*.22+.08,-715,DK,null,null,18);C(.2,.2,.21,396.5+(i>1?1:0),.12+(i%2)*.22+.08,-715,STL,null,null,14)}ob(395.9,397.9,-715.5,-714.5);
 /* the compressor: a horizontal tank on feet, a motor and a belt guard, a hose reel on the wall */{const x=400.5,z=-715.3;C(.42,.42,1.6,x,.6,z,BL,'x',null,18);for(const dx of[-.5,.5])B(.12,.2,.6,x+dx,.12,z,DK);B(.5,.4,.4,x-.2,1.22,z,DK);B(.3,.36,.06,x+.25,1.2,z+.22,YL);C(.15,.15,.08,x-.2,1.22,z-.24,CHR,'z');rod([x+.8,.6,z],[x+1.1,1.6,-717.3],.025,RUB);C(.3,.3,.15,x+1.1,1.7,-717.2,M(0xc03030),'z',null,16);B(.12,.5,.12,x+1.1,1.7,-717.37,DK);C(.05,.05,.3,x+1.1,1.7,-717.3,CHR,'z');ob(x-.9,x+.9,z-.5,z+.5)}
 /* the fuel bowser: a small tanker trailer with a hose reel and a sign */{const x=408,z=-715,TK=M(0x6a6a30,{roughness:.55,metalness:.4});C(.8,.8,3.2,x,1.35,z,TK,'x',null,20);for(const s of[-1,1]){const cp=new THREE.Mesh(new THREE.SphereGeometry(.8,18,10,0,Math.PI*2,0,Math.PI/2),TK);cp.scale.y=.3;cp.rotation.z=-s*Math.PI/2;cp.position.set(x+s*1.6,1.35,z);g.add(cp)}
  B(3.4,.14,1.0,x,.55,z,DK);for(const dz of[-.62,.62]){C(.38,.38,.22,x-.4,.38,z+dz,RUB,'z',null,16);C(.18,.18,.24,x-.4,.38,z+dz,STL,'z',null,12)}rod([x+1.7,.5,z],[x+2.6,.35,z],.05,DK);B(.3,.1,.3,x+2.6,.3,z,DK);B(.1,.4,.1,x+2.6,.1,z,DK);
  C(.25,.25,.3,x+.9,2.25,z,DK);C(.35,.35,.2,x-.6,1.3,z+.85,M(0xc03030),'z',null,16);for(const dz of[-.9,.9])B(2.8,.04,.04,x,2.2,z+dz*.5,STL);
  const sg=k.lab('FUEL · 3,000 L · NO SPARKS',1.8,.32,'#e0b020','#1a1a1a',60);sg.position.set(x,1.35,z+.81);g.add(sg);ob(x-1.9,x+2.7,z-.9,z+.9)}
 g.traverse(o=>{if(o.isMesh)o.userData.noSeam=true});return{obs}}

/* ---- batch 3: the south side. Glass control room, spares racks, the drum cage, the crew corner, a fire point ---- */
function hgSouth(g){const k=fbKit(),{B,C,rod,L}=k.H(g),M=k.M;const obs=[],ob=(x0,x1,z0,z1)=>obs.push({x0,x1,z0,z1});
 const STL=M(0x50565c,{roughness:.5,metalness:.55}),DK=M(0x26292c,{roughness:.6,metalness:.4}),RD=M(0xb02828,{roughness:.45,metalness:.3}),YL=M(0xe0b020,{roughness:.5,metalness:.3}),BL=M(0x2a5a8a,{roughness:.5,metalness:.4}),OL=M(0x4a5a30,{roughness:.7}),WD=M(0x8a6a44,{roughness:.8}),CHR=M(0xb8bcc0,{metalness:.85,roughness:.25}),PNL=M(0xc8ccc4,{roughness:.6}),GRN=M(0x46524a,{roughness:.75});
 const GL=new THREE.MeshStandardMaterial({color:0x9ab8cc,transparent:true,opacity:.22,roughness:.05,metalness:.4,side:THREE.DoubleSide,depthWrite:false});
 /* the control room: x 388..404, z -676..-671.1 (the wall columns stay behind it). Low wall, glazing, a flat roof, door on the west end */
 {const x0=388,x1=404,z0=-676,z1=-671.1,H=3.2,cx=(x0+x1)/2,cz=(z0+z1)/2;
  B(x1-x0,.06,z1-z0,cx,.11,cz,M(0x3a3e42,{roughness:.8}));B(x1-x0+.2,.2,z1-z0+.2,cx,H+.1,cz,PNL);B(x1-x0+.24,.06,z1-z0+.24,cx,H+.23,cz,STL);
  /* front (north) and east: a 1 m wall with glass above, mullions every 2 m */B(x1-x0,1.0,.15,cx,.5,z0,GRN);B(x1-x0,.06,.25,cx,1.03,z0,STL);for(let x=x0;x<=x1+.01;x+=2)B(.1,H-1.06,.1,x,(1.06+H)/2,z0,STL);
  {const p=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0,H-1.06),GL);p.position.set(cx,(1.06+H)/2,z0);g.add(p)}ob(x0,x1,z0-.1,z0+.1);
  B(.15,1.0,z1-z0,x1,.5,cz,GRN);B(.25,.06,z1-z0,x1,1.03,cz,STL);{const p=new THREE.Mesh(new THREE.PlaneGeometry(z1-z0,H-1.06),GL);p.rotation.y=Math.PI/2;p.position.set(x1,(1.06+H)/2,cz);g.add(p)}for(const z of[z0,z1])B(.1,H,.1,x1,H/2,z,STL);ob(x1-.1,x1+.1,z0,z1);
  /* west end: solid with a door (gap z -674.4..-673.2) */B(.15,H,1.6,x0,H/2,z0+.8,GRN);B(.15,H,z1-(-673.2),x0,H/2,(-673.2+z1)/2,GRN);B(.15,H-2.2,1.2,x0,2.2+(H-2.2)/2,-673.8,GRN);
  /* the door: a steel frame round the opening, and a leaf with a vision panel hung on the north jamb, standing open outwards *//* (the frame sits inside the opening, so none of its faces lie in the wall's faces) */for(const z of[-674.355,-673.245])B(.22,2.12,.09,x0,1.06,z,STL);B(.22,.08,1.2,x0,2.16,-673.8,STL);/* (the leaf is held open flat against the outside of the west wall, north of the opening) */{const hg=new THREE.Group();hg.position.set(x0-.13,0,-674.44);g.add(hg);const D=k.H(hg),DM=M(0x5a6a58,{roughness:.5,metalness:.35}),zc=-.6;D.B(.05,2.12,1.16,0,1.14,zc,DM);{const gp=new THREE.Mesh(new THREE.PlaneGeometry(.36,.7),GL);gp.rotation.y=Math.PI/2;gp.position.set(-.03,1.5,zc);hg.add(gp)}D.B(.012,.78,.04,-.03,1.5,zc-.2,STL);D.B(.012,.78,.04,-.03,1.5,zc+.2,STL);D.B(.012,.04,.44,-.03,1.87,zc,STL);D.B(.012,.04,.44,-.03,1.13,zc,STL);D.B(.012,.22,1.1,-.03,.17,zc,STL);D.B(.04,.03,.16,-.05,1.05,zc-.45,CHR);D.B(.03,.06,.03,-.04,1.05,zc-.38,CHR);for(const y of[.3,1.0,1.9])D.C(.02,.02,.1,.02,y,0,STL);D.B(.06,.06,.1,.0,.07,-1.12,M(0x1a1a1a,{roughness:.9}))}ob(x0-.1,x0+.1,z0,-674.4);ob(x0-.1,x0+.1,-673.2,z1);
  L('CONTROL',2.2,.4,'#20262c','#40c0ff',60,x0-.09,2.75,-673.8,-Math.PI/2);L('X-13 CONTROL · AUTHORISED STAFF ONLY',6,.5,'#20262c','#40c0ff',60,cx,H+.45,z0-.12,Math.PI);
  /* the desk along the window, three screens facing in, a chair and the technician's spot at (396, -674) */
  B(9,.06,1.0,cx,.88,-675.3,M(0x3a3e42));B(9,.84,.08,cx,.45,-675.8,DK);for(const dx of[-4.4,4.4])B(.08,.84,.9,cx+dx,.45,-675.3,DK);
  const scr=(t1,t2,col)=>k.tex(256,160,(c,w,h)=>{c.fillStyle='#08121a';c.fillRect(0,0,w,h);c.strokeStyle=col;c.lineWidth=2;c.strokeRect(4,4,w-8,h-8);c.fillStyle=col;c.font='bold 20px "Barlow Semi Condensed",DoorsSans,Arial,sans-serif';c.fillText(t1,12,30);c.font='16px "Barlow Semi Condensed",DoorsSans,Arial,sans-serif';t2.forEach((s,i)=>c.fillText(s,12,58+i*22));c.beginPath();for(let x=0;x<230;x+=6)c.lineTo(12+x,h-20-Math.abs(Math.sin(x*.07))*20);c.stroke()});
  const S=[scr('X-13 DIAGNOSTICS',['ARMOUR 100%','ROCKETS 8/8','REACTOR: DO NOT ASK'],'#40ff80'),scr('HANGAR SECURITY',['LASER GRID: ARMED','TURRETS: 4/4','BLAST DOOR: SHUT'],'#ff5050'),scr('REFIT STATION',['CRANE: READY','ARMS: READY','PARTS: IN STOCK'],'#40c0ff')];
  S.forEach((t,i)=>{const x=cx-2+i*2;B(.9,.56,.05,x,1.32,-675.62,DK);const p=new THREE.Mesh(new THREE.PlaneGeometry(.84,.5),new THREE.MeshBasicMaterial({map:t}));p.position.set(x,1.32,-675.59);g.add(p);B(.08,.3,.08,x,1.05,-675.65,DK);B(.3,.02,.2,x,.92,-675.6,DK)});
  B(.5,.03,.18,cx-.6,.92,-675.15,DK);B(.1,.03,.14,cx-.15,.92,-675.15,DK);C(.05,.04,.1,cx+3.4,.96,-675.1,M(0xe8e4d8));
  /* chair */B(.5,.08,.5,cx,.5,-674.2,DK);B(.5,.55,.08,cx,.85,-673.95,DK);C(.04,.04,.4,cx,.28,-674.2,CHR);for(let i=0;i<5;i++)rod([cx,.1,-674.2],[cx+Math.cos(i*1.257)*.3,.05,-674.2+Math.sin(i*1.257)*.3],.02,CHR);
  /* a wall of CCTV screens on the back wall, a filing cabinet, a water cooler */for(let i=0;i<4;i++)for(let r=0;r<2;r++){B(.9,.55,.06,cx-1.5+i*1.0,1.8+r*.62,z1-.04,DK);const p=new THREE.Mesh(new THREE.PlaneGeometry(.82,.47),new THREE.MeshStandardMaterial({color:0x1a2a3a,emissive:0x2a4a6a,emissiveIntensity:.6}));p.position.set(cx-1.5+i*1.0,1.8+r*.62,z1-.075);p.rotation.y=Math.PI;g.add(p)}
  B(.5,1.3,.6,x0+.6,.75,z1-.35,STL);C(.17,.17,.45,x1-.6,1.3,z1-.4,M(0x8ab0d0,{transparent:true,opacity:.6}));B(.36,.95,.36,x1-.6,.58,z1-.4,M(0xd8d8e0))}
 /* spares racks against the south wall: two pallet racks between the wall columns (x 344..354 and 356..366) */
 const rack=(xa,xb)=>{const z=-671.8,d=1.1,cx=(xa+xb)/2,OR=M(0xd86a20,{roughness:.5,metalness:.4}),BLU=M(0x2a5aa0,{roughness:.5,metalness:.4});for(const x of[xa,cx,xb])for(const dz of[-d/2,d/2]){B(.08,3.4,.08,x,1.7,z+dz,BLU);}for(const x of[xa,cx,xb])for(let y=.6;y<3.4;y+=.9)rod([x,y,z-d/2],[x,y+.8,z+d/2],.015,BLU);
  for(const y of[.15,1.25,2.35])for(const dz of[-d/2,d/2])B(xb-xa,.12,.06,cx,y,z+dz,OR);for(const y of[.21,1.31,2.41])B(xb-xa,.03,d,cx,y,z,M(0x8a8e92,{metalness:.5}));ob(xa-.1,xb+.1,z-d/2-.1,z+d/2+.1);return{z,cx}};
 {const r=rack(344,354);/* rocket pods and Wraith wheels (the game's spares, re-homed) */for(let i=0;i<4;i++){const x=345+i*2.3;B(.56,.56,1.0,x,.52,r.z,M(0x15181c,{metalness:.5}));for(let q=0;q<4;q++)C(.09,.09,.04,x+(q%2?.15:-.15),.52+(q<2?.15:-.15),r.z-.52,M(0xa02020),'z',null,10)}
  for(let i=0;i<4;i++){const x=345.2+i*2.3;C(.5,.5,.5,x,1.83,r.z,DK,'x',null,16);C(.2,.2,.52,x,1.83,r.z,M(0x40c0ff,{emissive:0x2090e0}),'x',null,12)}for(let i=0;i<3;i++)B(1.4,.6,.9,346+i*3,2.73,r.z,OL);L('X-13 SPARES · ROCKET PODS · WHEELS · DO NOT DROP',4,.36,'#101418','#40c0ff',44,349,3.3,r.z-.62,Math.PI)}
 {const r=rack(356,366);/* armour plates on edge, crates */for(let i=0;i<6;i++){const p=B(.12,.9,1.0,357+i*.5,.73,r.z,M(0x2c3a5a,{metalness:.5}));p.rotation.z=.08}for(let i=0;i<3;i++)B(1.3,.8,.9,362.5+i*1.3-1.3,.62,r.z,WD);for(let i=0;i<4;i++)B(1.6,.7,.9,357.6+i*2.2,1.67,r.z,i%2?WD:OL);for(let i=0;i<3;i++)B(2.0,.5,.9,358+i*3,2.67,r.z,M(0x2c3a5a,{metalness:.5}));L('ARMOUR PLATES · REFIT PARTS',4,.36,'#101418','#40c0ff',44,361,3.3,r.z-.62,Math.PI)}
 /* the drum cage: mesh walls, a gate, four drums inside (the game's drums move here) */
 {const x0=370,x1=374,z0=-675,z1=-671.2,H=2.2,MESH=k.tex(128,128,(c,w,h)=>{c.clearRect(0,0,w,h);c.strokeStyle='#9aa0a6';c.lineWidth=3;for(let i=-w;i<w*2;i+=16){c.beginPath();c.moveTo(i,0);c.lineTo(i+h,h);c.stroke();c.beginPath();c.moveTo(i,h);c.lineTo(i+h,0);c.stroke()}});MESH.repeat.set(4,2);
  const MM=new THREE.MeshStandardMaterial({map:MESH,transparent:true,alphaTest:.3,side:THREE.DoubleSide,metalness:.5,roughness:.5});
  const wall=(a,b,c,ax)=>{const L2=b-a,p=new THREE.Mesh(new THREE.PlaneGeometry(L2,H),MM);if(ax=='x'){p.position.set((a+b)/2,H/2+.05,c)}else{p.rotation.y=Math.PI/2;p.position.set(c,H/2+.05,(a+b)/2)}g.add(p)};wall(x0,x1-1.2,z0,'x');wall(z0,z1,x0,'z');wall(z0,z1,x1,'z');
  for(const[x,z]of[[x0,z0],[x1,z0],[x0,z1],[x1,z1],[x1-1.2,z0]])B(.06,H+.1,.06,x,(H+.1)/2,z,YL);for(const z of[z0,z1])B(x1-x0,.05,.05,(x0+x1)/2,H+.1,z,YL);for(const x of[x0,x1])B(.05,.05,z1-z0,x,H+.1,(z0+z1)/2,YL);
  /* the gate: a framed mesh leaf hung on the corner post (x 374), standing open outwards, with a hasp and a padlock */{const hg=new THREE.Group();hg.position.set(x1,0,z0);hg.rotation.y=-.75;g.add(hg);const G=k.H(hg),W=1.16,GH=H-.1;const gp=new THREE.Mesh(new THREE.PlaneGeometry(W-.08,GH-.08),MM);gp.position.set(-W/2-.02,.12+GH/2,0);hg.add(gp);for(const y of[.12,.12+GH])G.B(W,.05,.05,-W/2-.02,y,0,YL);for(const x of[-.04,-W])G.B(.05,GH,.05,x,.12+GH/2,0,YL);G.B(W,.04,.04,-W/2-.02,.12+GH/2,0,YL);for(const y of[.5,GH-.2])G.C(.035,.035,.14,-.01,y,0,DK);G.B(.04,.14,.1,-W+.02,1.1,.03,STL);G.B(.08,.1,.04,-W+.02,1.0,.06,M(0xc8a030,{metalness:.7,roughness:.3}));G.B(.05,.05,.02,-W+.02,1.08,.06,CHR)}B(.04,.14,.1,x1-1.2,1.1,z0-.03,STL);
  B(x1-x0,.06,z1-z0,(x0+x1)/2,.12,(z0+z1)/2,M(0x2a6a3a,{roughness:.8}));[0x5a6a3a,0xe8c020,0x5a6a3a,0x8a2020].forEach((c,i)=>{const x=371+(i%2)*1.0,z=-672.4-(i>>1)*1.0;C(.3,.3,.88,x,.59,z,M(c,{roughness:.5,metalness:.3}),null,null,16);C(.31,.31,.04,x,.4,z,DK,null,null,16);C(.31,.31,.04,x,.8,z,DK,null,null,16)});
  L('FLAMMABLE · KEEP LOCKED',1.6,.3,'#e0b020','#1a1a1a',60,(x0+x1)/2-.6,1.7,z0-.02,Math.PI);ob(x0-.05,x1+.05,z0-.05,z1)}
 /* the crew corner: six lockers (x 405.6..409.2), a bench, a coffee counter, a notice board, the no-smoking sign */
 {for(let i=0;i<6;i++){const x=405.9+i*.6;B(.58,1.9,.5,x,1.0,-671.0,M(0x5a6a58,{roughness:.55,metalness:.35}));B(.3,.12,.01,x,1.6,-671.255,DK);B(.04,.14,.02,x+.2,1.1,-671.26,CHR);for(let v=0;v<3;v++)B(.3,.015,.01,x,1.75+v*.04-.05,-671.255,DK)}ob(405.5,409.4,-671.3,-670.6);
  B(3,.06,.4,411.5,.46,-672.2,WD);for(const dx of[-1.3,1.3])B(.06,.42,.36,411.5+dx,.22,-672.2,STL);
  B(2.6,.9,.6,417.6,.5,-670.9,M(0x8a8e92,{metalness:.5}));B(2.7,.05,.66,417.6,.97,-670.9,WD);B(.4,.5,.38,416.9,1.25,-670.9,DK);B(.3,.2,.01,416.9,1.32,-671.095,M(0x101010,{emissive:0x10a040}));C(.05,.04,.1,417.3,1.05,-671.0,M(0xe8e4d8));C(.05,.04,.1,417.6,1.05,-670.95,RD);ob(416.2,419,-671.3,-670.6);
  const nb=k.tex(256,192,(c,w,h)=>{c.fillStyle='#8a6a44';c.fillRect(0,0,w,h);c.fillStyle='#c8a878';c.fillRect(8,8,w-16,h-16);const P=[['#f0ece0',20,20,70,90],['#e0d060',100,24,60,60],['#f0ece0',170,18,66,80],['#a0d0f0',40,120,80,50],['#f0ece0',140,110,90,60]];for(const[col,x,y,ww,hh]of P){c.fillStyle=col;c.fillRect(x,y,ww,hh);c.fillStyle='#c02020';c.beginPath();c.arc(x+ww/2,y+5,4,0,7);c.fill();c.fillStyle='rgba(0,0,0,.4)';for(let l=0;l<4;l++)c.fillRect(x+6,y+16+l*10,ww-12,2)}});
  {const p=new THREE.Mesh(new THREE.PlaneGeometry(1.6,1.2),new THREE.MeshStandardMaterial({map:nb,roughness:.8}));p.position.set(411.5,1.75,-670.5-.1);p.rotation.y=Math.PI;g.add(p)}
  L('NO SMOKING · NO NAKED FLAMES · NO LEANING ON THE PROTOTYPE',3,.35,'#5a2020','#ffe0a0',44,411.5,2.75,-670.6,Math.PI)}
 /* fire point on the wall by the door: a red board, two extinguishers, a first-aid box */
 {const x=421.5,z=-670.6;const p=k.lab('FIRE POINT',1.6,.3,'#c02020','#ffffff',60);p.position.set(x,2.3,z);p.rotation.y=Math.PI;g.add(p);B(1.6,1.4,.04,x,1.4,z-.03,M(0xc02020));for(const dx of[-.4,.1]){C(.1,.1,.55,x+dx,.95,z-.2,RD,null,null,12);C(.03,.03,.12,x+dx,1.28,z-.2,DK);B(.18,.05,.05,x+dx,.6,z-.12,STL)}B(.36,.3,.12,x+.55,1.6,z-.11,M(0x20a040));B(.06,.18,.01,x+.55,1.6,z-.175,M(0xffffff));B(.18,.06,.01,x+.55,1.6,z-.175,M(0xffffff));ob(x-.8,x+.8,z-.35,z)}
 g.traverse(o=>{if(o.isMesh)o.userData.noSeam=true});return{obs}}

/* ---- batch 4: the refit station (dx556), restyled. hgRefit(g, X, Z) builds everything rfsBuild built from the pad down to
   the holo, with the same moving parts, so rfsTick works unchanged:
     ring (spins on its z, emissiveIntensity pulses), br (Group, x moves; y 7.9), cab (cable, height 1, scaled on y),
     hook (Group under br, y moves), part (Group under hook) and pe (its wireframe, colour flashes),
     arms [{b, yw, s1, s2, tip, gl, sd}] (same joint heights: yw at .5, s1 at .55, s2 at 1.8, tip at 1.5),
     holo {cv, tx, holo} (a 512 x 256 canvas on a 4 x 2 plane at X - 4.2, y 4.4, facing +x).
   Also returns obs (gantry legs, the parts rack, the arm bases), the same boxes as before. ---- */
function hgRefit(g,X,Z){const k=fbKit(),{B,C,rod,L}=k.H(g),M=k.M;const obs=[],ob=(x0,x1,z0,z1)=>obs.push({x0,x1,z0,z1});
 const WH=M(0xe4e6e8,{roughness:.4,metalness:.3}),OR=M(0xf07020,{roughness:.45,metalness:.3}),DK=M(0x22262a,{roughness:.5,metalness:.5}),ST=M(0x3a4048,{roughness:.45,metalness:.6}),YL=M(0xe8c020,{roughness:.5,metalness:.3}),CYN=M(0x40e0ff,{emissive:0x20b0ff,emissiveIntensity:1.4});
 const glow=(c,o,s)=>{if(typeof glowSp=='function')return glowSp(c,o,s);const gt=k.tex(64,64,(x)=>{const gr=x.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,64,64)});const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:gt,color:c,transparent:true,opacity:o,blending:THREE.AdditiveBlending,depthWrite:false}));sp.scale.setScalar(s);return sp};
 /* the pad: a hex deck flush with the floor, panel lines and a bay number, a steel edge, light strips, a ring that turns */
 const pt=k.tex(512,512,(c,w,h)=>{c.fillStyle='#1c2024';c.fillRect(0,0,w,h);c.strokeStyle='rgba(120,140,160,.35)';c.lineWidth=2;for(let r=60;r<240;r+=48){c.beginPath();for(let i=0;i<=6;i++){const a=i*Math.PI/3+Math.PI/6;c.lineTo(256+Math.cos(a)*r,256+Math.sin(a)*r)}c.stroke()}for(let i=0;i<6;i++){const a=i*Math.PI/3+Math.PI/6;c.beginPath();c.moveTo(256+Math.cos(a)*60,256+Math.sin(a)*60);c.lineTo(256+Math.cos(a)*250,256+Math.sin(a)*250);c.stroke()}
  c.fillStyle='rgba(64,224,255,.55)';c.font='bold 30px "Barlow Semi Condensed",DoorsSans,Arial,sans-serif';c.textAlign='center';/* on the door side (+x), upright for someone driving in */c.save();c.translate(256,96);c.rotate(Math.PI);c.textBaseline='middle';c.fillText('REFIT · X-13',0,0);c.restore()});
 {const pad=new THREE.Mesh(new THREE.CylinderGeometry(5.4,5.4,.05,6),[M(0x30353a,{metalness:.6,roughness:.4}),M(0xffffff,{map:pt,roughness:.35,metalness:.4}),M(0x30353a)]);/* no turn: the cylinder's corners already sit where the rims' do */pad.position.set(X,.105,Z);g.add(pad);
  const edge=new THREE.Mesh(new THREE.TorusGeometry(5.42,.06,4,6),ST);edge.rotation.x=Math.PI/2;edge.rotation.z=Math.PI/6;edge.position.set(X,.13,Z);g.add(edge);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(5.1,.045,6,6),CYN);rim.rotation.x=Math.PI/2;rim.rotation.z=Math.PI/6;rim.position.set(X,.14,Z);g.add(rim)}
 const ring=new THREE.Mesh(new THREE.TorusGeometry(2.2,.05,6,40),M(0x40e0ff,{emissive:0x20b0ff,emissiveIntensity:1.4}));ring.rotation.x=Math.PI/2;ring.position.set(X,.15,Z);g.add(ring);
 for(let i=0;i<12;i++){const a=i/12*Math.PI*2;B(.08,.02,.3,X+Math.cos(a)*2.55,.14,Z+Math.sin(a)*2.55,CYN).rotation.y=-a}
 /* the gantry: four box legs on plinths, end frames with braces, two top beams with a rail and cable chain */
 for(const sx of[-3.2,3.2])for(const sz of[-5.8,5.8]){const x=X+sx,z=Z+sz;B(.9,.3,.9,x,.15,z,DK);B(.5,7.3,.5,x,3.95,z,WH);B(.52,.6,.52,x,.6,z,YL);for(let i=0;i<3;i++)B(.53,.1,.53,x,.42+i*.2,z,DK);B(.56,.3,.56,x,7.45,z,ST);ob(x-.3,x+.3,z-.3,z+.3)}
 for(const sz of[-5.8,5.8]){const z=Z+sz;B(7.2,.55,.6,X,7.6,z,WH);B(7.2,.06,.3,X,7.91,z,DK);for(let i=0;i<6;i++)B(.5,.08,.62,X-2.9+i*1.16,7.6,z,i%2?YL:DK);rod([X-3.2,5.6,z],[X-1.6,7.3,z],.06,ST);rod([X+3.2,5.6,z],[X+1.6,7.3,z],.06,ST);B(7,.12,.25,X,7.25,z+(sz<0?.4:-.4),ST)}
 /* (the ends across the lane stay open: the Wraith drives in under them) */for(const sx of[-3.2,3.2]){B(.3,.4,11.6,X+sx,7.0,Z,ST);for(const sz of[-5.8,5.8])rod([X+sx,6.0,Z+sz],[X+sx,6.85,Z+sz*.75],.05,ST)}
 /* the bridge: a yellow box girder on two end trucks, the hoist, the cable, the hook block, and the part */
 const br=new THREE.Group();br.position.set(X-2.6,7.9,Z);br.userData.dpKeep=1;g.add(br);const P=k.H(br);
 P.B(.6,.5,12.2,0,.05,0,M(0xd8a020,{roughness:.45,metalness:.4}));P.B(.7,.04,12.2,0,.32,0,M(0xd8a020));for(const z of[-5.8,5.8]){P.B(1.1,.4,.7,0,.12,z,DK);for(const dx of[-.4,.4])P.C(.12,.12,.1,dx,-.08,z,ST,'z',null,12)}P.B(.95,.55,1.0,0,-.35,0,DK);P.C(.25,.25,.8,0,-.35,0,ST,'x',null,16);
 {const lb=k.lab('REFIT CRANE · 8 t',2.6,.36,'#d8a020','#1a1a1a',60);lb.position.set(.31,.05,-3);lb.rotation.y=Math.PI/2;br.add(lb)}
 const cab=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,1,6),M(0x8a8e92,{metalness:.8,roughness:.3}));cab.position.y=-.5;br.add(cab);
 const hook=new THREE.Group();br.add(hook);{const H=k.H(hook);H.B(.55,.3,.4,0,-.05,0,YL);H.B(.6,.06,.45,0,-.22,0,DK);for(const sx of[-.6,.6])for(const sz of[-.4,.4])rod([0,-.25,0],[sx,-.6,sz],.012,DK,hook)}
 const part=new THREE.Group();part.position.y=-.9;hook.add(part);{const Pp=k.H(part);Pp.B(1.7,.45,1.2,0,0,0,M(0x2c3a5a,{metalness:.55,roughness:.35}));Pp.B(1.5,.12,1.0,0,.28,0,M(0x22304a,{metalness:.55}));for(const sx of[-.86,.86])Pp.B(.02,.06,1.1,sx,0,0,CYN);for(const sz of[-.61,.61])Pp.B(1.6,.06,.02,0,0,sz,CYN);Pp.B(.3,.2,.3,.5,.4,.3,DK)}
 const pe=new THREE.Mesh(new THREE.BoxGeometry(1.75,.6,1.25),new THREE.MeshBasicMaterial({color:0x60e0ff,wireframe:true}));part.add(pe);
 /* the parts rack behind the station, where the crane picks up */{const rx=X-6.3;B(1.6,.1,9,rx,.15,Z,DK);for(const dz of[-4.4,-1.5,1.5,4.4])for(const dx of[-.7,.7])B(.08,2.4,.08,rx+dx,1.25,Z+dz,ST);for(const y of[.9,1.75,2.4])B(1.6,.06,9,rx,y,Z,ST);
  for(let i=0;i<4;i++){const z=Z-3.4+i*2.25;B(1.1,.45,1.5,rx,2.66,z,i%2?M(0x2c3a5a,{metalness:.55}):M(0x3a3a3a,{metalness:.4}));B(1.12,.04,1.52,rx,2.9,z,CYN)}for(let i=0;i<4;i++)B(1.0,.5,1.4,rx,1.2,Z-3.4+i*2.25,M(0x2c3a5a,{metalness:.5}));ob(rx-.8,rx+.8,Z-4.5,Z+4.5);
  L('MODULES · CRANE PICK-UP',3,.32,'#101418','#40c0ff',44,rx+.82,2.0,Z,Math.PI/2)}
 /* two welding robots: a drum base with a cable, a turning waist, two arm links with joint caps, a torch */
 const arms=[];for(const sd of[-1,1]){const b=new THREE.Group();b.position.set(X+.8,0,Z+sd*4.3);g.add(b);const Bb=k.H(b);Bb.B(1.2,.1,1.2,0,.13,0,DK);Bb.C(.5,.6,.38,0,.37,0,WH,null,null,20);Bb.C(.61,.61,.06,0,.2,0,YL,null,null,20);/* its power cable drops to the floor and runs out to a junction box */rod([0,.32,sd*.52],[0,.14,sd*.78],.045,DK,b);rod([0,.14,sd*.76],[0,.14,sd*1.45],.045,DK,b);Bb.B(.36,.22,.26,0,.2,sd*1.55,M(0x5a6066,{metalness:.5}));Bb.B(.2,.12,.02,0,.22,sd*1.69,YL);ob(X+.2,X+1.4,Z+sd*4.3-.6,Z+sd*4.3+.6);
  const yw=new THREE.Group();yw.position.y=.5;b.add(yw);const Y=k.H(yw);Y.C(.36,.4,.5,0,.25,0,OR,null,null,18);Y.B(.5,.3,.5,0,.5,0,OR);
  const s1=new THREE.Group();s1.position.y=.55;yw.add(s1);const S1=k.H(s1);S1.C(.24,.24,.62,0,0,0,DK,'x',null,18);S1.C(.26,.26,.1,.32,0,0,WH,'x',null,18);S1.C(.26,.26,.1,-.32,0,0,WH,'x',null,18);S1.B(.34,1.5,.36,0,.9,0,OR);S1.B(.36,.08,.38,0,.3,0,DK);rod([.2,.2,.1],[.2,1.6,.1],.03,DK,s1);
  const s2=new THREE.Group();s2.position.y=1.8;s1.add(s2);const S2=k.H(s2);S2.C(.2,.2,.5,0,0,0,DK,'x',null,16);S2.C(.22,.22,.08,.26,0,0,WH,'x',null,16);S2.C(.22,.22,.08,-.26,0,0,WH,'x',null,16);S2.B(.26,1.3,.28,0,.72,0,OR);S2.C(.13,.13,.24,0,1.42,0,WH,null,null,14);
  const tip=new THREE.Group();tip.position.y=1.5;s2.add(tip);const Tp=k.H(tip);Tp.C(.05,.1,.32,0,.12,0,DK,null,null,10);Tp.C(.02,.04,.1,0,.32,0,M(0xb87333,{metalness:.8}),null,null,8);const gl=glow(0xa0e0ff,.9,.5);gl.position.y=.38;tip.add(gl);gl.visible=false;
  arms.push({b,yw,s1,s2,tip,gl,sd})}
 /* the holo display on a projector post */const cv=document.createElement('canvas');cv.width=512;cv.height=256;const tx=new THREE.CanvasTexture(cv);const holo=new THREE.Mesh(new THREE.PlaneGeometry(4,2),new THREE.MeshBasicMaterial({map:tx,transparent:true,opacity:.85,side:THREE.DoubleSide,depthWrite:false}));holo.position.set(X-4.2,4.4,Z);holo.rotation.y=Math.PI/2;g.add(holo);
 B(.9,.12,.9,X-4.2,.14,Z,DK);C(.14,.18,2.6,X-4.2,1.5,Z,WH,null,null,14);C(.32,.26,.3,X-4.2,2.95,Z,DK,null,null,18);{const em=new THREE.Mesh(new THREE.TorusGeometry(.26,.03,6,24),CYN);em.rotation.x=Math.PI/2;em.position.set(X-4.2,3.11,Z);g.add(em)}
 {const hb=new THREE.Mesh(new THREE.CylinderGeometry(2.0,.25,.3,24,1,true),new THREE.MeshBasicMaterial({color:0x40c0ff,transparent:true,opacity:.07,depthWrite:false,side:THREE.DoubleSide}));hb.scale.set(1,1,.35);hb.position.set(X-4.2,3.25,Z);hb.rotation.y=Math.PI/2;g.add(hb)}
 g.traverse(o=>{if(o.isMesh&&!o.material.wireframe)o.userData.noSeam=true});
 return{ring,br,cab,hook,part,pe,arms,holo:{cv,tx,holo},obs}}

/* ---- wiring ---- */
/* the hangar's own group inside the desert (one per desert). Everything the hangar models build goes in here. */
function hgSub(q,g){if(q.hg1&&q.hg1.parent===g)return q.hg1;const s=new THREE.Group();s.name='Hangar 1';g.add(s);q.hg1=s;return s}
