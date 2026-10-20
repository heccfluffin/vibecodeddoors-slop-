/* =====================================================================================================
   Route 13: the old town round the bus stop (docs/design/route-13.md). Needs fort-kit.js (fbKit).
   Route 13 runs along z at x 0 (the old bus road plane, 7 m wide, x -3.5..3.5, top at y .02, dashes at .03).
   +z is north; the barrier is at z -880, cars stop at -894. New globals start with rt.
   ===================================================================================================== */
function rtKit(){if(rtKit.k)return rtKit.k;const f=fbKit(),k=Object.create(f),M=f.M;let sd=1313;const r=()=>((sd=Math.imul(sd^sd>>>15,sd|1)+0x6d2b79f5|0)>>>0)/4294967296;k.r=r;
 /* gravel for the shoulders: small stones over packed dust, darker where the tarmac edge crumbles (u = across) */
 k.GRAVEL=M(0xffffff,{roughness:1,map:f.tex(256,256,(c,w,h)=>{c.fillStyle='#a3937a';c.fillRect(0,0,w,h);for(let i=0;i<5200;i++){const v=r();c.fillStyle=v<.45?'rgba(70,62,52,'+(.12+r()*.2)+')':v<.8?'rgba(214,200,176,'+(.1+r()*.2)+')':'rgba(150,120,90,.25)';const s=1+r()*2.6;c.fillRect(r()*w,r()*h,s,s*(.6+r()*.6))}})});
 k.GRAVEL.map.repeat.set(1,24);
 k.POLE=M(0x6a4a30,{roughness:.95,map:f.tex(32,256,(c,w,h)=>{c.fillStyle='#6a4a30';c.fillRect(0,0,w,h);for(let i=0;i<60;i++){c.fillStyle='rgba(30,20,10,'+(.15+r()*.2)+')';c.fillRect(r()*w,r()*h,1,8+r()*40)}})});
 k.LAMPG=M(0x8a8f92,{metalness:.55,roughness:.45});k.LENS=M(0xfff2cc,{emissive:0xffd890,emissiveIntensity:.9,roughness:.3});
 k.WIRE=M(0x1c1c1c,{roughness:.8});k.INS=M(0x6ab08a,{roughness:.2,metalness:.1,transparent:true,opacity:.9});
 k.GLASS=M(0x9fc4d4,{roughness:.05,metalness:.1,transparent:true,opacity:.32,depthWrite:false});
 k.SHELTER=M(0x2e5a8a,{metalness:.45,roughness:.45});k.ROOF=M(0xc8ccd0,{metalness:.5,roughness:.4});
 return rtKit.k=k}

/* a painted canvas plane lying flat on the road (for markings): w across x, d along z */
function rtPaint(k,w,d,draw,px){const c=document.createElement('canvas');c.width=px||256;c.height=Math.round((px||256)*d/w);draw(c.getContext('2d'),c.width,c.height);const t=new THREE.CanvasTexture(c);t.anisotropy=8;
 const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshStandardMaterial({map:t,transparent:true,roughness:.8,polygonOffset:true,polygonOffsetUnits:-3,depthWrite:false}));m.rotation.x=-Math.PI/2;m.userData.noSeam=true;m.renderOrder=1;return m}

/* ---- batch 1a: the main street. Gravel shoulders both sides (broken where roads and the gas forecourt join), old
   street lamps both sides, timber power poles with three sagging wires down the west side, and the town signs at
   each end. Returns {obs, lights:[[x,y,z]...] (put the game's light() at these), lamps:[...] (lamp heads)} ---- */
const RT={z0:-895,z1:-1115,
 /* where something joins Route 13 (z ranges, per side): no shoulder, no lamp, no pole there */
 gapE:[[-925.5,-918.5],[-1013,-986.5],[-1040.5,-1033.5]],gapW:[[-915.5,-908.5],[-1048.5,-1041.5]],
 /* other things beside the road that a lamp or pole must not stand on: [x, z, r] */
 keep:[[-7.5,-985,4.2],[7.25,-1047.25,3.6],[4.3,-1043.5,1.5],[8.5,-1030,1.6],[2,-1012,2]]};
function rtMain(g){const k=rtKit(),{B,C,rod,L,tube}=k.H(g),M=k.M,obs=[],lights=[],lamps=[];const ob=(x0,x1,z0,z1)=>obs.push({x0,x1,z0,z1});
 const inGap=(gaps,z,m)=>gaps.some(q=>z>q[0]-(m||0)&&z<q[1]+(m||0)),near=(x,z)=>RT.keep.some(q=>Math.hypot(x-q[0],z-q[1])<q[2]);
 /* shoulders: 2 m of gravel each side, laid in pieces between the gaps, 1 cm above the sand (the road is at .02) */
 for(const [sd,gaps] of[[-1,RT.gapW],[1,RT.gapE]]){const cuts=[RT.z1].concat(...gaps.slice().sort((a,b)=>a[0]-b[0])).concat([RT.z0]);
  for(let i=0;i<cuts.length;i+=2){const za=cuts[i],zb=cuts[i+1];if(zb-za<.5)continue;const m=new THREE.Mesh(new THREE.PlaneGeometry(2,zb-za),k.GRAVEL.clone());m.material.map=k.GRAVEL.map.clone();m.material.map.needsUpdate=true;m.material.map.repeat.set(1,(zb-za)/9);
   m.rotation.x=-Math.PI/2;m.position.set(sd*4.5,.012,(za+zb)/2);m.userData.noSeam=true;g.add(m)}}
 /* an old street lamp: a tapered steel pole on a base plate, an arm curving out over the road, a long lamp head
    with a glowing lens underneath. sd = which side (-1 west, +1 east); the arm reaches towards the road */
 const lamp=(x,z,sd)=>{const H=7.2,ax=-sd;B(.36,.06,.36,x,.03,z,k.LAMPG);C(.06,.1,H,x,H/2+.06,z,k.LAMPG,null,null,10);
  const P=[];for(let i=0;i<=10;i++){const t=i/10;P.push([x+ax*(1.9*t),H-.35+Math.sin(t*Math.PI*.5)*.55-t*t*.12,z])}tube(P,.045,k.LAMPG,null,16);
  const hx=x+ax*2.15,hy=H+.06;B(.95,.16,.34,hx,hy,z,k.LAMPG);B(.7,.04,.24,hx,hy-.1,z,k.LENS);C(.05,.05,.1,x,H+.11,z,k.LAMPG);lamps.push([hx,hy-.12,z]);
  ob(x-.18,x+.18,z-.18,z+.18);return[hx,hy-.4,z]};
 let n=0;for(let z=-903;z>=RT.z1+4;z-=24)for(const [sd,dz] of[[-1,0],[1,-12]]){const zz=z+dz,x=sd*6.6;if(zz<RT.z1+3)continue;if(inGap(sd<0?RT.gapW:RT.gapE,zz,2.2)||near(x,zz))continue;const p=lamp(x,zz,sd);if(n++%2==0)lights.push(p)}
 /* timber power poles down the west side (x -9.5): a crossarm with three insulators, a brace, a step bolt ladder,
    and three wires sagging between poles. Poles skip the gaps; a wire can span two gaps' worth */
 const PX=-9.5,PH=8.6,arms=[-.8,0,.8],poles=[];for(let z=-890;z>=-1112;z-=36){let zz=z;if(inGap(RT.gapW,zz,3)||near(PX,zz))zz-=8;if(inGap(RT.gapW,zz,3)||near(PX,zz))continue;poles.push(zz)}
 /* the crossarm runs across the line (along x), the wires along it (along z) */
 for(const z of poles){C(.13,.16,PH,PX,PH/2,z,k.POLE,null,null,9);B(2,.12,.1,PX,PH-.5,z,k.POLE);rod([PX-.55,PH-.56,z],[PX-.1,PH-1.1,z],.03,k.LAMPG);rod([PX+.55,PH-.56,z],[PX+.1,PH-1.1,z],.03,k.LAMPG);
  for(const a of arms){C(.035,.05,.16,PX+a,PH-.36,z,k.INS,null,null,8)}for(let h=2.4;h<PH-1.4;h+=.5)C(.012,.012,.26,PX+(h*10%2<1?.1:-.1),h,z,k.LAMPG,'x',null,5);ob(PX-.2,PX+.2,z-.2,z+.2)}
 for(let i=1;i<poles.length;i++)for(const a of arms){const z0=poles[i-1],z1=poles[i],P=[],sag=.35+Math.abs(z1-z0)*.012;for(let t=0;t<=16;t++){const f=t/16;P.push([PX+a,PH-.28-sag*4*f*(1-f),z0+(z1-z0)*f])}tube(P,.012,k.WIRE,null,24)}
 /* the town signs: OLD TOWN · ROUTE 13 · POP. 13 on a timber frame, painted both sides. North end on the west
    shoulder facing north (the way BUS 13 comes in), south end on the east shoulder facing south */
 const townSign=(x,z,face)=>{const s=new THREE.Group();s.position.set(x,0,z);s.rotation.y=face>0?0:Math.PI;g.add(s);const h=k.H(s);
  /* the board hangs between the two posts (posts at its ends, so they never cover the lettering) */for(const px of[-2.1,2.1]){h.B(.2,3.5,.2,px,1.75,0,k.POLE);h.B(.26,.08,.26,px,3.52,0,k.POLE)}h.B(4,1.9,.12,0,2.35,0,k.POLE);
  h.L('OLD TOWN\nROUTE 13 · POP. 13\nHOME OF BUS 13',3.8,1.7,'#e8dcc0','#3a2414',48,0,2.35,.065);
  const b=h.L('LEAVING OLD TOWN\nDRIVE SAFE\nCOME BACK SOON (YOU WILL)',3.8,1.7,'#e8dcc0','#3a2414',40,0,2.35,-.065);b.rotation.y=Math.PI;
  ob(x-2.25,x+2.25,z-.3,z+.3)};
 townSign(-9.5,-897,1);townSign(9.5,-1113,-1);
 return{obs,lights,lamps}}

/* ---- batch 1b: the bus stop shelter, just south of the pole (x 5..9.5, z -1050..-1044.5, so the round plates don't hide its fascia), open towards the road, a
   painted BUS STOP bay on the east lane, a bin. The pole with the round DESERT MINES plates (4.3, -1043.5) and the
   prop stay; the old bench and skull beside the pole go (the bench is inside the shelter now). Returns {obs} ---- */
function rtBusStop(g){const k=rtKit(),{B,C,rod,L}=k.H(g),M=k.M,obs=[];const ob=(x0,x1,z0,z1)=>obs.push({x0,x1,z0,z1});
 const X0=5,X1=9.5,Z0=-1050,Z1=-1044.5,HF=2.6,HB=2.4,P=.08,ZM=(Z0+Z1)/2,yAt=x=>HF+(HB-HF)*(x-X0)/(X1-X0),SL=Math.atan2(HF-HB,X1-X0),LN=Math.hypot(X1-X0,HF-HB);
 /* a box lying along the roof's slope (x from xa to xb), its top edge th below the roof's underside */
 const slope=(xa,xb,h,d,z,dy,m)=>{const xc=(xa+xb)/2,b=B(Math.hypot(xb-xa,(xb-xa)*Math.tan(SL)),h,d,xc,yAt(xc)-dy,z,m);b.rotation.z=-SL;return b};
 /* frame: a post at each corner and one in the middle of the back, each up to the roof's underside */
 for(const [x,z] of[[X0+P/2,Z0+P/2],[X0+P/2,Z1-P/2],[X1-P/2,Z0+P/2],[X1-P/2,Z1-P/2],[X1-P/2,ZM]]){const h=z==ZM?HB-.14:yAt(x);B(P,h,P,x,h/2,z,k.SHELTER)}   /* the middle post stops under the back beam */
 /* eaves beams under the roof: front and back between the posts, the two ends sloping with the roof */
 B(P*.8,.14,Z1-Z0-2*P,X0+P/2,HF-.07,ZM,k.SHELTER);B(P*.8,.14,Z1-Z0-2*P,X1-P/2,HB-.07,ZM,k.SHELTER);for(const z of[Z0+P/2,Z1-P/2])slope(X0+P,X1-P,.14,P,z,.07,k.SHELTER);
 /* the roof: a sheet resting on the beams, overhanging 25 cm all round, with a deep edge band on every side; the
    front band is the BUS 13 · DESERT MINES sign */
 {const t=.06,ov=.25,rf=B(LN+2*ov,t,Z1-Z0+2*ov,(X0+X1)/2,(HF+HB)/2+t/2/Math.cos(SL),ZM,k.ROOF);rf.rotation.z=-SL}
 {const yf=yAt(X0-.25)+.03,yb=yAt(X1+.25)+.03;B(.05,.32,Z1-Z0+.6,X0-.275,yf,ZM,k.SHELTER);B(.05,.16,Z1-Z0+.6,X1+.275,yb,ZM,k.SHELTER);
  for(const z of[Z0-.275,Z1+.275])slope(X0-.25,X1+.25,.16,.05,z,-.03,k.SHELTER);
  const f=L('BUS 13 · DESERT MINES',Z1-Z0+.3,.26,'#2e5a8a','#f4f0e0',64,X0-.305,yf,ZM);f.rotation.y=-Math.PI/2}
 /* glass in frames: two back panes either side of the middle post, two end panes cut to the roof's slope; a bottom
    rail under each at 13 cm, the beams above. The front stays open */
 const GT=.16;for(const [za,zb] of[[Z0+P,ZM-P/2],[ZM+P/2,Z1-P]]){B(.02,HB-.14-GT,zb-za,X1-P/2,(GT+HB-.14)/2,(za+zb)/2,k.GLASS);B(P*.7,.06,zb-za,X1-P/2,GT-.03,(za+zb)/2,k.SHELTER)}
 for(const z of[Z0+P/2,Z1-P/2]){const{slab}=k.H(g);slab([[X0+P,GT],[X1-P,GT],[X1-P,HB-.14],[X0+P,HF-.14]],.02,k.GLASS,0,0,z);B(X1-X0-2*P,.06,P*.7,(X0+X1)/2,GT-.03,z,k.SHELTER)}
 {const t=k.tex(512,640,(c,w,h)=>{c.fillStyle='#f4f0e2';c.fillRect(0,0,w,h);c.fillStyle='#2e5a8a';c.fillRect(0,0,w,110);c.fillStyle='#f4f0e2';c.font='bold 64px "Barlow Semi Condensed",DoorsSans,Arial';c.textAlign='center';c.fillText('BUS 13',w/2,72);c.font='bold 26px "Barlow Semi Condensed",DoorsSans,Arial';c.fillText('HOTEL  ⇄  DESERT MINES',w/2,101);
   c.fillStyle='#1e2a33';c.font='bold 30px "Barlow Semi Condensed",DoorsSans,Arial';c.textAlign='left';c.fillText('DEPARTS',34,160);c.textAlign='right';c.fillText('ARRIVES',w-34,160);c.fillRect(30,172,w-60,3);
   c.font='600 30px "Barlow Semi Condensed",DoorsSans,Arial';const rows=[['??:??','??:??'],['??:??','??:??'],['ANY MINUTE','NOW'],['??:??','??:??'],['NEVER','ALWAYS']];rows.forEach((q,i)=>{const y=215+i*52;c.textAlign='left';c.fillText(q[0],34,y);c.textAlign='right';c.fillText(q[1],w-34,y);c.fillStyle='rgba(30,42,51,.15)';c.fillRect(30,y+14,w-60,1);c.fillStyle='#1e2a33'});
   c.fillStyle='#c0201a';c.font='bold 28px "Barlow Semi Condensed",DoorsSans,Arial';c.textAlign='center';c.fillText('EVERY RIDE · ALWAYS',w/2,520);c.fillStyle='#5b6b74';c.font='600 22px "Barlow Semi Condensed",DoorsSans,Arial';c.fillText('Do not run for the bus. It waits.',w/2,560);c.fillText('It always waits.',w/2,590)});
  t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;const p=new THREE.Mesh(new THREE.PlaneGeometry(.8,1),new THREE.MeshStandardMaterial({map:t,roughness:.6}));p.position.set(X1-P/2-.03,1.45,Z0+1.1);p.rotation.y=-Math.PI/2;p.userData.noSeam=true;g.add(p)}
 /* the bench: slats on two steel legs, against the back glass */
 for(let i=0;i<4;i++)B(.11,.04,3.2,X1-.55+i*.13-.2,.46,(Z0+Z1)/2+.3,M(0x8a5a32,{roughness:.8}));for(let i=0;i<3;i++)B(.04,.11,3.2,X1-.22,.62+i*.13,(Z0+Z1)/2+.3,M(0x8a5a32,{roughness:.8}));
 for(const z of[(Z0+Z1)/2+.3-1.3,(Z0+Z1)/2+.3+1.3]){B(.5,.05,.06,X1-.43,.42,z,k.SHELTER);B(.05,.395,.05,X1-.62,.1975,z,k.SHELTER);B(.05,.8,.05,X1-.2,.4,z,k.SHELTER)}
 /* a bin outside, at the south end */C(.22,.2,.8,X0+.45,.4,Z0-.55,k.SHELTER,null,null,14);C(.24,.24,.06,X0+.45,.83,Z0-.55,k.LAMPG,null,null,14);
 /* collision: the back and the ends (the front stays open), the bin */ob(X1-.15,X1+.05,Z0,Z1);ob(X0,X1,Z0-.05,Z0+.12);ob(X0,X1,Z1-.12,Z1+.05);ob(X0+.2,X0+.7,Z0-.8,Z0-.3);
 /* the bay on the road's east lane: a yellow dashed box and BUS STOP, south of the Sunset Blvd junction */
 {const W=3,D=12,m=rtPaint(k,W,D,(c,w,h)=>{c.strokeStyle='#e8c020';c.lineWidth=10;c.setLineDash([36,24]);c.strokeRect(8,8,w-16,h-16);c.setLineDash([]);c.fillStyle='rgba(232,192,32,.95)';c.font='bold 92px "Barlow Semi Condensed",DoorsSans,Arial';c.textAlign='center';c.textBaseline='middle';c.save();c.translate(w/2,h/2);c.rotate(Math.PI);c.scale(1,2.4);/* upright for drivers heading north up the east lane: BUS nearest, then STOP */c.fillText('STOP',0,-h*.09);c.fillText('BUS',0,h*.12);c.restore()},256);
  m.position.set(1.85,.036,-1047.5);g.add(m)}
 return{obs}}

/* =====================================================================================================
   Batch 2: El Goblino Gas outside, and the car wash. The shop's inside, El Goblino, the counter, shelves, fridges,
   the sliding doors and every prop stay as they are (busRoamBuild). Shop: x 36..48, z -1011..-999, walls 4.2 high,
   the doorway in the west wall z -1006.3..-1003.7 (2.6 high). Pumps at (28, -1007.2) and (28, -1002.8).
   ===================================================================================================== */
/* El Goblino's logo: his red head with the long ears, yellow eyes and the top hat, on a green disc */
function rtLogoTex(k){if(k._logo)return k._logo;return k._logo=k.tex(256,256,(c,w,h)=>{c.clearRect(0,0,w,h);c.fillStyle='#3a8a2a';c.beginPath();c.arc(128,128,124,0,7);c.fill();c.strokeStyle='#f4f0e0';c.lineWidth=8;c.beginPath();c.arc(128,128,114,0,7);c.stroke();
 c.fillStyle='#c0302a';for(const sd of[-1,1]){c.beginPath();c.moveTo(128+sd*40,140);c.lineTo(128+sd*108,104);c.lineTo(128+sd*48,118);c.closePath();c.fill()}c.beginPath();c.arc(128,146,52,0,7);c.fill();
 c.fillStyle='#ffe040';for(const sd of[-1,1]){c.beginPath();c.arc(128+sd*19,140,8,0,7);c.fill()}c.fillStyle='#1a1008';for(const sd of[-1,1]){c.beginPath();c.arc(128+sd*19,141,3.5,0,7);c.fill()}
 c.strokeStyle='#5a1008';c.lineWidth=5;c.beginPath();c.arc(128,158,22,.2,Math.PI-.2);c.stroke();c.fillStyle='#3a2a1a';c.fillRect(80,92,96,10);c.fillRect(98,44,60,52);c.fillStyle='#c0302a';c.fillRect(98,84,60,6)})}
/* concrete forecourt slabs: 4 m joints, oil stains, tyre marks; repeat 1 per 4 m */
function rtConcrete(k){if(k._conc)return k._conc;const r=k.r,t=k.tex(256,256,(c,w,h)=>{c.fillStyle='#b4afa6';c.fillRect(0,0,w,h);for(let i=0;i<3800;i++){c.fillStyle=r()<.5?'rgba(80,76,70,'+(.05+r()*.08)+')':'rgba(230,226,218,'+(.05+r()*.08)+')';c.fillRect(r()*w,r()*h,1+r()*2,1+r()*2)}
 c.fillStyle='rgba(60,58,54,.55)';c.fillRect(0,0,w,2);c.fillRect(0,0,2,h);for(let i=0;i<3;i++){c.fillStyle='rgba(40,36,30,'+(.06+r()*.1)+')';c.beginPath();c.ellipse(r()*w,r()*h,8+r()*30,6+r()*20,r()*3,0,7);c.fill()}});
 return k._conc=()=>new THREE.MeshStandardMaterial({map:t,roughness:.9,polygonOffset:true,polygonOffsetUnits:-2})}

/* ---- 2a: the forecourt and the canopy over the pumps. Returns {obs, lights, pumps:[group, group]} ----
   The forecourt is one concrete slab x 3.5..72, z -1013..-993.5 at y .025 (the shop and the car wash stand on it),
   joining Route 13 and the PD road. The canopy keeps the old one's four column spots (x 22 / 34, z -1009 / -1001). */
function rtGas(g){const k=rtKit(),{B,C,rod,L,slab}=k.H(g),M=k.M,obs=[],lights=[],pumps=[];const ob=(x0,x1,z0,z1)=>obs.push({x0,x1,z0,z1});
 {const X0=3.5,X1=72,Z0=-1013,Z1=-993.5,m=rtConcrete(k)();m.map=m.map.clone();m.map.needsUpdate=true;m.map.repeat.set((X1-X0)/4,(Z1-Z0)/4);const p=new THREE.Mesh(new THREE.PlaneGeometry(X1-X0,Z1-Z0),m);p.rotation.x=-Math.PI/2;p.position.set((X0+X1)/2,.025,(Z0+Z1)/2);p.userData.noSeam=true;g.add(p);
  /* a low kerb along the south edge, where the forecourt meets the sand (gaps for the taxi stand path) */B(X1-X0-14,.12,.25,(X0+X1)/2+7,.06,Z0-.125,k.KERB);
  /* painted arrows: in from Route 13, round to the car wash, out to the PD road */
  const arrow=(x,z,rot,txt)=>{const m2=rtPaint(k,2.2,4.4,(c,w,h)=>{c.fillStyle='rgba(244,240,226,.92)';c.save();c.translate(w/2,h/2);c.rotate(rot);c.beginPath();c.moveTo(0,-h*.42);c.lineTo(w*.38,-h*.12);c.lineTo(w*.14,-h*.12);c.lineTo(w*.14,h*.42);c.lineTo(-w*.14,h*.42);c.lineTo(-w*.14,-h*.12);c.lineTo(-w*.38,-h*.12);c.closePath();c.fill();c.restore();if(txt){c.font='bold 52px "Barlow Semi Condensed",DoorsSans,Arial';c.textAlign='center';c.fillText(txt,w/2,h*.97)}},128);m2.position.set(x,.04,z);m2.rotation.z=0;g.add(m2);return m2};
  arrow(12,-1004,Math.PI/2);arrow(50,-1005,Math.PI/2);arrow(70,-997.5,Math.PI)}
 /* the canopy: a deep box on four clad columns, green fascia with a white stripe and the name on three sides, a
    white underside with six glowing light panels */
 const CX0=20.6,CX1=35.4,CZ0=-1010.6,CZ1=-999.4,CY=5.0,CD=.9,GRN=M(0x3a8a2a,{roughness:.6}),WHT=M(0xf2f0ea,{roughness:.7}),LITE=M(0xffffff,{emissive:0xfff4dc,emissiveIntensity:1.1});
 B(CX1-CX0,CD,CZ1-CZ0,(CX0+CX1)/2,CY+CD/2,(CZ0+CZ1)/2,GRN);B(CX1-CX0-.02,.04,CZ1-CZ0-.02,(CX0+CX1)/2,CY-.02,(CZ0+CZ1)/2,WHT);
 /* the white stripe and the name: a thin band round the fascia (slightly proud of it), letters on the west, north and south faces */
 B(CX1-CX0+.04,.12,CZ1-CZ0+.04,(CX0+CX1)/2,CY+.2,(CZ0+CZ1)/2,WHT);
 {const t='EL GOBLINO GAS';L(t,9,.52,null,'#f4f0e0',90,(CX0+CX1)/2,CY+.6,CZ1+.006);const s=L(t,9,.52,null,'#f4f0e0',90,(CX0+CX1)/2,CY+.6,CZ0-.006);s.rotation.y=Math.PI;const w=L(t,8,.52,null,'#f4f0e0',90,CX0-.006,CY+.6,(CZ0+CZ1)/2);w.rotation.y=-Math.PI/2;
  for(const [x,z,ry] of[[CX0+1.2,CZ1+.007,0],[CX1-1.2,CZ1+.007,0],[CX0+1.2,CZ0-.007,Math.PI],[CX1-1.2,CZ0-.007,Math.PI]]){const lg=new THREE.Mesh(new THREE.PlaneGeometry(.78,.78),new THREE.MeshBasicMaterial({map:rtLogoTex(k),transparent:true}));lg.position.set(x,CY+.5,z);lg.rotation.y=ry;lg.userData.noSeam=true;g.add(lg)}}
 for(const x of[23.5,28,32.5])for(const z of[-1007.6,-1002.4]){B(1.6,.03,.7,x,CY-.045,z,LITE)}lights.push([23.5,CY-.4,-1005],[32.5,CY-.4,-1005],[28,CY-.4,-1005]);
 /* columns: square, white, a green kick at the foot, a lit band near the top */
 for(const [x,z] of[[22,-1009],[34,-1009],[22,-1001],[34,-1001]]){B(.5,CY-.04,.5,x,(CY-.04)/2,z,WHT);B(.54,.6,.54,x,.3,z,GRN);B(.52,.12,.52,x,CY-.5,z,M(0x3a8a2a,{emissive:0x1a4a14,roughness:.5}));ob(x-.3,x+.3,z-.3,z+.3)}
 /* the pumps: an island with a raised nose at each end and two yellow bollards, a dispenser in the middle with
    a price window and a hose and nozzle on each long side (cars pull up along x either side). One group each,
    so the game can knock it over as now (kd 'pump') */
 for(const pz of[-1007.2,-1002.8]){const pg=new THREE.Group();pg.position.set(28,0,pz);g.add(pg);const h=k.H(pg);
  h.B(2.4,.18,1.2,0,.09,0,k.KERB);for(const sx of[-1,1]){h.B(.3,.2,1.1,sx*1.0,.2,0,M(0xe8c020,{roughness:.6}));h.C(.09,.09,.9,sx*1.0,.65,0,M(0xe8c020,{roughness:.5}),null,null,10)}
  h.B(.9,1.6,.5,0,1.0,0,M(0xe8e6e0,{roughness:.5}));h.B(.94,.36,.54,0,1.7,0,GRN);h.B(.94,.12,.54,0,.24,0,GRN);
  for(const sd of[-1,1]){const pw=h.L('7.13 🪙\nGWEEN UNLEADED',.6,.34,'#10161a','#7dff9a',50,0,1.36,sd*.258);if(sd<0)pw.rotation.y=Math.PI;
   const lg=new THREE.Mesh(new THREE.PlaneGeometry(.28,.28),new THREE.MeshBasicMaterial({map:rtLogoTex(k),transparent:true}));lg.position.set(0,1.7,sd*.272);if(sd<0)lg.rotation.y=Math.PI;lg.userData.noSeam=true;pg.add(lg);
   h.B(.12,.22,.08,.34,1.0,sd*.29,k.DK);h.rod([.34,.9,sd*.33],[.42,.4,sd*.5],.025,k.DK);h.rod([.42,.4,sd*.5],[.3,.62,sd*.27],.025,k.DK)}
  pumps.push(pg);ob(28-1.2,28+1.2,pz-.6,pz+.6)}
 /* the price sign by Route 13: a tall pylon with the logo, the name and a price board with changeable letters */
 {const sx=12,sz=-996.2;B(.5,6.4,.5,sx-1.6,3.2,sz,k.STL);B(.5,6.4,.5,sx+1.6,3.2,sz,k.STL);B(3.9,1.6,.5,sx,7.0,sz,GRN);
  for(const sd of[-1,1]){const lg=new THREE.Mesh(new THREE.PlaneGeometry(1.4,1.4),new THREE.MeshBasicMaterial({map:rtLogoTex(k),transparent:true}));lg.position.set(sx,8.6,sz+sd*.06);if(sd<0)lg.rotation.y=Math.PI;lg.userData.noSeam=true;g.add(lg);
   const n=L('EL GOBLINO GAS',3.7,1.0,'#3a8a2a','#f4f0e0',110,sx,7.1,sz+sd*.256);if(sd<0)n.rotation.y=Math.PI;
   const pb=L('BREAD ··· 12\nCHEESE ··· 15\nGWEEN SODA ··· 20',2.5,2.2,'#f4f0e0','#1a1a1a',90,sx,4.75,sz+sd*.106);if(sd<0)pb.rotation.y=Math.PI}
  /* the price board fits between the posts */B(2.7,2.5,.2,sx,4.75,sz,k.WH);B(2.7,.1,.26,sx,6.05,sz,k.STL);B(2.7,.1,.26,sx,3.45,sz,k.STL);C(.75,.75,.06,sx,8.6,sz,GRN,'z',null,28);ob(sx-1.9,sx+1.9,sz-.3,sz+.3)}
 /* air and water: a little post with two coiled hoses, by the shop's south-west corner */
 {const ax=34.6,az=-1012.4;B(.4,1.3,.3,ax,.65,az,M(0xc02020,{roughness:.5}));B(.42,.24,.32,ax,1.42,az,k.WH);const a=L('AIR · WATER',.4,.2,null,'#c02020',60,ax,1.42,az+.161);for(const sd of[-1,1]){C(.14,.14,.05,ax+sd*.26,.9,az,k.DK,'x',null,16)}ob(ax-.3,ax+.3,az-.2,az+.2)}
 return{obs,lights,pumps}}

/* ---- 2b: the shop front. A new west wall (x 35.85..36.15, z -1011.15..-998.85, 4.2 high) that replaces the
   game's west wall pieces: stucco piers, two shop windows you can see into (z -1010.2..-1007.4 and -1002.6..
   -999.8, sill 0.9, head 2.5), a green tiled base, the doorway kept exactly (z -1006.3..-1003.7, 2.6 high) for the
   sliding doors, and a parapet with the name above the roof line. The game's obstacles for the west wall stay. ---- */
function rtShopFront(g){const k=rtKit(),{B,C,rod,L}=k.H(g),M=k.M,obs=[];const r=k.r;
 const ST=M(0xffffff,{roughness:.95,map:k.tex(128,128,(c,w,h)=>{c.fillStyle='#e2d4b4';c.fillRect(0,0,w,h);for(let i=0;i<1600;i++){c.fillStyle=r()<.5?'rgba(150,130,100,.12)':'rgba(255,250,240,.16)';c.fillRect(r()*w,r()*h,1+r()*2,1+r()*2)}})}),
  TILE=M(0xffffff,{roughness:.4,map:k.tex(64,64,(c,w,h)=>{c.fillStyle='#2f7a2a';c.fillRect(0,0,w,h);c.fillStyle='rgba(20,40,16,.6)';c.fillRect(0,0,w,2);c.fillRect(0,0,2,h);c.fillStyle='rgba(255,255,255,.08)';c.fillRect(4,4,w-10,6)})}),
  AL=M(0xb8bcc0,{metalness:.6,roughness:.35}),GL=M(0x9ac8e0,{transparent:true,opacity:.28,roughness:.05,metalness:.2,depthWrite:false});
 ST.map.repeat.set(2,2);TILE.map.repeat.set(6,2);
 const X=36,T=.3,H=4.2,Z0=-1011.16,Z1=-998.84,DZ0=-1006.3,DZ1=-1003.7,DH=2.6,W=[[-1010.2,-1007.4],[-1002.6,-999.8]],SILL=.9,HEAD=2.5;
 const wall=(z0,z1,y0,y1,m)=>{if(z1-z0<.005||y1-y0<.005)return;B(T,y1-y0,z1-z0,X,(y0+y1)/2,(z0+z1)/2,m||ST)};
 /* piers full height; under the windows a tiled base, over the windows and the door solid wall */
 wall(Z0,W[0][0],0,H);wall(W[0][1],DZ0,0,H);wall(DZ1,W[1][0],0,H);wall(W[1][1],Z1,0,H);
 for(const [a,b] of W){wall(a,b,0,SILL,TILE);wall(a,b,HEAD,H)}wall(DZ0,DZ1,DH,H);
 /* the tiled base runs along the piers too, as a skin 2 cm proud of the stucco */for(const [a,b] of[[Z0,W[0][0]],[W[0][1],DZ0],[DZ1,W[1][0]],[W[1][1],Z1]])B(.02,SILL,b-a,X-T/2-.01,SILL/2,(a+b)/2,TILE);
 /* windows: an aluminium frame in the opening, a mullion, the glass, a sill outside */
 for(const [a,b] of W){const zc=(a+b)/2,w=b-a,hh=HEAD-SILL;B(.08,.06,w,X,SILL+.03,zc,AL);B(.08,.06,w,X,HEAD-.03,zc,AL);B(.08,hh-.12,.06,X,(SILL+HEAD)/2,a+.03,AL);B(.08,hh-.12,.06,X,(SILL+HEAD)/2,b-.03,AL);B(.08,hh-.12,.05,X,(SILL+HEAD)/2,zc,AL);
  B(.02,hh-.14,w-.12,X,(SILL+HEAD)/2,zc,GL);B(.18,.05,w+.1,X-T/2-.06,SILL-.02,zc,k.CAP)}
 /* a stripe of the green tile above the windows, and a small cornice at the top of the wall */
 for(const [a,b] of[[Z0,-1003.55],[-1001.65,Z1]])B(.02,.18,b-a,X-T/2-.01,HEAD+.25,(a+b)/2,TILE);   /* (a gap for the OPEN 24/7 sign) */
 /* the parapet above the roof: a stucco band with a coping, the name and the logo */
 const PX=35.66,PT=.16;B(PT,1.5,Z1-Z0+.3,PX,3.95+.75,(Z0+Z1)/2,ST);B(PT+.12,.08,Z1-Z0+.42,PX,5.44,(Z0+Z1)/2,k.CAP);
 L('EL GOBLINO GAS · SHOP',9,.8,null,'#3a8a2a',110,PX-PT/2-.006,4.75,(Z0+Z1)/2-.6,-Math.PI/2);
 {const lg=new THREE.Mesh(new THREE.PlaneGeometry(1.1,1.1),new THREE.MeshBasicMaterial({map:rtLogoTex(k),transparent:true}));lg.position.set(PX-PT/2-.006,4.72,Z1-.8);lg.rotation.y=-Math.PI/2;lg.userData.noSeam=true;g.add(lg)}
 return{obs}}

/* ---- 2c: the car wash, a drive-through tunnel east of the shop (x 54..68, z -1009..-1001). Cars go in at the
   west end and out at the east end. Returns {obs, bay:{x0,x1,z0,z1}, parts:{brushL, brushR, brushTop, arch,
   dryer, sign:{stop, go}, jets}} for the game to animate: brushes spin about their axes (brushL/R about y and move
   in/out along z, brushTop about x and up/down), the spray arch's jets show while washing, the sign lights. ---- */
function rtCarWash(g){const k=rtKit(),{B,C,rod,L}=k.H(g),M=k.M,obs=[];const ob=(x0,x1,z0,z1)=>obs.push({x0,x1,z0,z1});
 const X0=54,X1=68,Z0=-1009,Z1=-1001,H=4.4,T=.3,GRN=M(0x3a8a2a,{roughness:.6}),WHT=M(0xf2f0ea,{roughness:.8}),BL=M(0x3a7ac8,{roughness:.5}),STL=k.STL;
 const r=k.r,BUB=M(0xffffff,{roughness:.9,map:k.tex(256,128,(c,w,h)=>{c.fillStyle='#f2f0ea';c.fillRect(0,0,w,h);for(let i=0;i<40;i++){const x=r()*w,y=h*.35+r()*h*.65,rr=4+r()*14;c.strokeStyle='rgba(58,122,200,.55)';c.lineWidth=2;c.beginPath();c.arc(x,y,rr,0,7);c.stroke();c.fillStyle='rgba(255,255,255,.7)';c.beginPath();c.arc(x-rr*.35,y-rr*.35,rr*.2,0,7);c.fill()}c.fillStyle='#3a8a2a';c.fillRect(0,h-14,w,14)})});
 BUB.map.repeat.set(3,1);
 /* side walls (white with bubbles, a green foot), the roof slab, a green fascia round the top; open at both ends */
 for(const z of[Z0+T/2,Z1-T/2]){B(X1-X0,H,T,(X0+X1)/2,H/2,z,BUB);ob(X0,X1,z-T/2-.05,z+T/2+.05)}
 B(X1-X0+.4,.3,Z1-Z0+.4,(X0+X1)/2,H+.15,(Z0+Z1)/2,WHT);B(X1-X0+.44,.6,Z1-Z0+.44,(X0+X1)/2,H+.6,(Z0+Z1)/2,GRN);B(X1-X0+.5,.06,Z1-Z0+.5,(X0+X1)/2,H+.93,(Z0+Z1)/2,WHT);
 /* the WASH letters on the roof, both ways, with bubbles */
 for(const [sd,ry] of[[1,0],[-1,Math.PI]]){const s=L('WASH',4.8,1.4,null,'#f2f0ea',200,(X0+X1)/2,H+1.85,(Z0+Z1)/2+sd*.05,ry)}B(5.2,1.6,.08,(X0+X1)/2,H+1.85,(Z0+Z1)/2,BL);B(5.3,.08,.14,(X0+X1)/2,H+2.69,(Z0+Z1)/2,WHT);
 for(const sd of[-1,1])B(.14,.9,.14,(X0+X1)/2+sd*2.3,H+1.0,(Z0+Z1)/2,k.STL);
 /* the floor: a dark wet slab with two tyre guide rails and a drain grate down the middle */
 B(X1-X0,.03,Z1-Z0-2*T,(X0+X1)/2,.04,(Z0+Z1)/2,M(0x4a4e52,{roughness:.25,metalness:.1}));for(const z of[-1006.2,-1003.8])B(X1-X0-1,.08,.08,(X0+X1)/2,.095,z,STL);B(X1-X0-2,.012,.3,(X0+X1)/2,.061,(Z0+Z1)/2,k.DK);
 /* lights in the ceiling */const lights=[];for(const x of[57,61,65]){B(1.6,.04,.4,x,H-.02,(Z0+Z1)/2,M(0xffffff,{emissive:0xe8f4ff,emissiveIntensity:1}));lights.push([x,H-.4,(Z0+Z1)/2])}
 /* the spray arch at the entry: a blue pipe frame with nozzles; jets (soft white cones) shown while washing */
 const arch=new THREE.Group();arch.position.set(X0+1.6,0,(Z0+Z1)/2);g.add(arch);{const h=k.H(arch),hw=(Z1-Z0)/2-T-.25;for(const sd of[-1,1])h.C(.07,.07,3.4,0,1.7,sd*hw,BL,null,null,10);h.C(.07,.07,hw*2,0,3.4,0,BL,'z',null,10);
  const jets=new THREE.Group();arch.add(jets);const JM=new THREE.MeshBasicMaterial({color:0xe8f6ff,transparent:true,opacity:.35,depthWrite:false});for(let i=0;i<7;i++){const z=-hw+.4+i*(hw*2-.8)/6;h.C(.035,.05,.12,0,3.3,z,STL,null,null,8);const j=new THREE.Mesh(new THREE.ConeGeometry(.35,1.6,10,1,true),JM);j.position.set(0,2.45,z);jets.add(j)}
  for(const sd of[-1,1])for(let y=.6;y<3;y+=.6){h.C(.035,.05,.12,0,y,sd*(hw-.08),STL,'z',null,8);const j=new THREE.Mesh(new THREE.ConeGeometry(.3,1.4,10,1,true),JM);j.rotation.x=sd>0?-Math.PI/2:Math.PI/2;j.position.set(0,y,sd*(hw-.8));jets.add(j)}jets.visible=false;arch.userData.jets=jets}
 /* two tall side brushes on a gantry, and an overhead brush: soft strips of blue, green and red foam round a core */
 const brush=(len,rad)=>{const b=new THREE.Group(),core=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,len,8),STL);b.add(core);const cols=[0x3a7ac8,0x3a8a2a,0xc0302a,0xf2f0ea];for(let i=0;i<28;i++){const a=i/28*Math.PI*2,s=new THREE.Mesh(new THREE.BoxGeometry(.025,len-.1,rad-.06),M(cols[i%4],{roughness:1}));s.position.set(Math.cos(a)*rad/2,0,Math.sin(a)*rad/2);s.rotation.y=-a+Math.PI/2;b.add(s)}return b};
 const BX=X0+5.5,gantry=(x)=>{for(const z of[Z0+T+.15,Z1-T-.15])B(.18,H-.3,.18,x,(H-.3)/2,z,STL);B(.18,.2,Z1-Z0-2*T,x,H-.3,(Z0+Z1)/2,STL)};gantry(BX-.8);gantry(BX+.8);
 const brushL=brush(2.6,.9);brushL.position.set(BX,1.5,Z0+T+.85);g.add(brushL);const brushR=brush(2.6,.9);brushR.position.set(BX,1.5,Z1-T-.85);g.add(brushR);
 for(const b of[brushL,brushR]){B(1.6,.1,.1,BX,2.9,b.position.z,STL);C(.1,.1,.18,BX,2.84,b.position.z,STL,null,null,8)}
 const brushTop=brush(Z1-Z0-2*T-.6,.9);brushTop.rotation.x=Math.PI/2;brushTop.position.set(X0+8.5,2.9,(Z0+Z1)/2);g.add(brushTop);for(const z of[Z0+T+.15,Z1-T-.15]){B(.12,1.0,.12,X0+8.5,3.55,z,STL)}rod([X0+8.5,2.9,Z0+T+.15],[X0+8.5,2.9,Z1-T-.15],.05,STL);
 /* the dryer: a big blower hood near the exit, with two side ducts */
 const DXp=X1-2.4;B(.9,.5,Z1-Z0-2*T-.4,DXp,3.3,(Z0+Z1)/2,M(0xc8ccd0,{metalness:.4,roughness:.4}));for(const sd of[-1,1]){B(.6,1.6,.5,DXp,2.2,(Z0+Z1)/2+sd*((Z1-Z0)/2-T-.35),M(0xc8ccd0,{metalness:.4,roughness:.4}))}B(.92,.08,Z1-Z0-2*T-.5,DXp,3.03,(Z0+Z1)/2,k.DK);
 /* the traffic sign at the exit: PULL FORWARD / STOP / GO, three lit panels */
 const sign={},SX=X1-.6,SZ=(Z0+Z1)/2;B(.12,.9,2.2,SX,H-.75,SZ,k.DK);for(const [i,t,col] of[[0,'PULL FORWARD','#e8c020'],[1,'STOP','#e02020'],[2,'GO','#30d050']]){const p=L(t,.66,.26,'#141414',col,70,SX-.065,H-.75,SZ-.72+i*.72,-Math.PI/2);sign[['fwd','stop','go'][i]]=p}
 /* the entry: a price board on a post, a WASH 5 🪙 sign over the entrance */
 {const px=X0-2.2,pz=Z0+.2;B(.12,2.2,.12,px,1.1,pz,STL);B(.08,1.3,1.5,px,2.4,pz,WHT);const pb=L('WASH · 5 🪙\nWAX · FREE\nGOBLIN NOT\nRESPONSIBLE\nFOR GOBLINS',1.4,1.2,'#f2f0ea','#1a1a1a',60,px-.045,2.4,pz,-Math.PI/2);ob(px-.15,px+.15,pz-.75,pz+.75)}
 L('ENTER · 5 🪙 · STAY IN YOUR CAR',(Z1-Z0)-.2,.44,'#3a7ac8','#f2f0ea',70,X0-.25,H+.6,(Z0+Z1)/2,-Math.PI/2);
 return{obs,lights,bay:{x0:X0,x1:X1,z0:Z0+T,z1:Z1-T},parts:{brushL,brushR,brushTop,arch,jets:arch.userData.jets,sign}}}
