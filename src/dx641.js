/* =====================================================================================================
   r657: ROUTE 13, the old town round the bus stop (docs/design/route-13.md). The design chat's route13.js is copied
   below unchanged (it builds on the Fort kit, fbKit, already in dx614), then the wiring:
   - busRoamBuild (bus stop, El Goblino Gas): build.py patches take out the old canopy, fascia, pumps, pole sign, the
     shop's west wall, the bench and skull by the bus stop pole and the MINING Co. SHACK billboard; rtTownB builds the
     main street, the bus stop shelter and the car wash, rtGasB the forecourt, canopy, pumps and price sign.
   - desertLocs: the old motel block is skipped (its 1400 random numbers are still drawn, so everything after it is
     where it was) and rtMotelB builds the turned motel with every prop; the drive-in, depot and water tower keep their
     moving parts and props, with the old meshes swapped for the models (rtDriveB, rtDepotB, rtTowerB).
   - xpMoreTown: the drive-in huts, the motel back yard (rtMotelBack) and the water tower tag (rtTagUse).
   - xpRoadFix: the dead loop round the shack's old spot is gone; Motel Rd, the drive-in drive and Depot Rd are laid.
   - the car wash: [E] while you sit in a car in the bay (vehPrompt/vehAct wrappers), the car is pulled through
     (rtWashUpd in a busRoamUpd wrapper); co-op: the driver runs it and sends 'rtw' start/progress/end.
   Every model is built into a scratch group, marked noSeam (it handles its own depth), then moved into the desert
   root piece by piece, so the chunking, batching and far-scenery systems treat it like any other scenery.
   ===================================================================================================== */
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

/* a painted arrow on the ground: a real flat shape (not a picture), 3.4 m long, pointing along angle a
   (0 = east, -PI/2 = north), at y .04 */
function rtArrow(x,z,a){const sh=new THREE.Shape([[-1.7,-.25],[.35,-.25],[.35,-.7],[1.7,0],[.35,.7],[.35,.25],[-1.7,.25]].map(q=>new THREE.Vector2(q[0],q[1])));
 const ge=new THREE.ShapeGeometry(sh);ge.rotateX(-Math.PI/2);const m=new THREE.Mesh(ge,new THREE.MeshStandardMaterial({color:0xf2eee0,roughness:.8,polygonOffset:true,polygonOffsetUnits:-3}));m.position.set(x,.04,z);m.rotation.y=a;m.userData.noSeam=true;return m}
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
 {const X0=3.5,X1=84.5,Z0=-1013,Z1=-993.5,m=rtConcrete(k)();m.map=m.map.clone();m.map.needsUpdate=true;m.map.repeat.set((X1-X0)/4,(Z1-Z0)/4);const p=new THREE.Mesh(new THREE.PlaneGeometry(X1-X0,Z1-Z0),m);p.rotation.x=-Math.PI/2;p.position.set((X0+X1)/2,.025,(Z0+Z1)/2);p.userData.noSeam=true;g.add(p);
  /* a low kerb along the south edge, where the forecourt meets the sand (gaps for the taxi stand path) */B(X1-X0-14,.12,.25,(X0+X1)/2+7,.06,Z0-.125,k.KERB);
  /* a dashed WASH box in front of the car wash entrance */
  /* (no arrows: the user found them odd; the dashed box says where the car wash lane is) */
  {const m3=rtPaint(k,6.6,7,(c,w,h)=>{c.strokeStyle='rgba(232,192,32,.95)';c.lineWidth=7;c.setLineDash([26,16]);c.strokeRect(6,6,w-12,h-12)},256);m3.position.set(60.6,.04,-1005);g.add(m3)}}
 /* the canopy: a deep box on four clad columns, green fascia with a white stripe and the name on three sides, a
    white underside with six glowing light panels */
 const CX0=20.6,CX1=35.4,CZ0=-1010.6,CZ1=-999.4,CY=5.0,CD=.9,GRN=M(0x3a8a2a,{roughness:.6}),WHT=M(0xf2f0ea,{roughness:.7}),UND=M(0xf2f0ea,{roughness:.7,emissive:0x6a665e}),LITE=M(0xffffff,{emissive:0xfff4dc,emissiveIntensity:1.1});
 B(CX1-CX0,CD,CZ1-CZ0,(CX0+CX1)/2,CY+CD/2,(CZ0+CZ1)/2,GRN);B(CX1-CX0-.02,.04,CZ1-CZ0-.02,(CX0+CX1)/2,CY-.02,(CZ0+CZ1)/2,UND);   /* the underside is lit by its own lights, so it never looks like a dark lid */
 /* the white stripe and the name: a thin band round the fascia (slightly proud of it), letters on the west, north and south faces */
 B(CX1-CX0+.04,.12,CZ1-CZ0+.04,(CX0+CX1)/2,CY+.2,(CZ0+CZ1)/2,WHT);
 {const t='EL GOBLINO GAS';L(t,9,.52,null,'#f4f0e0',90,(CX0+CX1)/2,CY+.6,CZ1+.006);const s=L(t,9,.52,null,'#f4f0e0',90,(CX0+CX1)/2,CY+.6,CZ0-.006);s.rotation.y=Math.PI;const w=L(t,8,.52,null,'#f4f0e0',90,CX0-.006,CY+.6,(CZ0+CZ1)/2);w.rotation.y=-Math.PI/2;
  for(const [x,z,ry] of[[CX0+1.2,CZ1+.007,0],[CX1-1.2,CZ1+.007,0],[CX0+1.2,CZ0-.007,Math.PI],[CX1-1.2,CZ0-.007,Math.PI]]){const lg=new THREE.Mesh(new THREE.PlaneGeometry(.78,.78),new THREE.MeshBasicMaterial({map:rtLogoTex(k),transparent:true}));lg.position.set(x,CY+.5,z);lg.rotation.y=ry;lg.userData.noSeam=true;g.add(lg)}}
 /* light panels flush in the underside: a glowing face 5 mm under it in a thin steel rim, so nothing hangs */for(const x of[23.5,28,32.5])for(const z of[-1007.6,-1002.4]){const lp=new THREE.Mesh(new THREE.PlaneGeometry(1.5,.6),LITE);lp.rotation.x=Math.PI/2;lp.position.set(x,CY-.045,z);lp.userData.noSeam=true;g.add(lp);for(const [w,d,dx,dz] of[[1.6,.05,0,.325],[1.6,.05,0,-.325],[.05,.6,.775,0],[.05,.6,-.775,0]])B(w,.012,d,x+dx,CY-.046,z+dz,k.STL)}lights.push([23.5,CY-.4,-1005],[32.5,CY-.4,-1005],[28,CY-.4,-1005]);
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

/* ---- 2c: the car wash, a drive-through tunnel east of the shop (x 64..78, z -1009..-1001), with a 16 m apron
   between it and the shop so long cars (the dragster) can swing in straight. Cars go in at the
   west end and out at the east end. Returns {obs, bay:{x0,x1,z0,z1}, parts:{brushL, brushR, brushTop, arch,
   dryer, sign:{stop, go}, jets}} for the game to animate: brushes spin about their axes (brushL/R about y and move
   in/out along z, brushTop about x and up/down), the spray arch's jets show while washing, the sign lights. ---- */
function rtCarWash(g){const k=rtKit(),{B,C,rod,L}=k.H(g),M=k.M,obs=[];const ob=(x0,x1,z0,z1)=>obs.push({x0,x1,z0,z1});
 const X0=64,X1=78,Z0=-1009,Z1=-1001,H=4.4,T=.3,GRN=M(0x3a8a2a,{roughness:.6}),WHT=M(0xf2f0ea,{roughness:.8}),BL=M(0x3a7ac8,{roughness:.5}),STL=k.STL;
 const r=k.r,BUB=M(0xffffff,{roughness:.9,map:k.tex(256,128,(c,w,h)=>{c.fillStyle='#f2f0ea';c.fillRect(0,0,w,h);/* each bubble is drawn whole: kept off the top and the green foot, and drawn again one tile left or right when it
    crosses the side edge, so the tiles join without cut bubbles (the user's note) */for(let i=0;i<40;i++){const rr=4+r()*14,x=r()*w,y=h*.35+rr+r()*(h*.65-2*rr-18);for(const ox of[-w,0,w]){if(x+ox+rr<0||x+ox-rr>w)continue;c.strokeStyle='rgba(58,122,200,.55)';c.lineWidth=2;c.beginPath();c.arc(x+ox,y,rr,0,7);c.stroke();c.fillStyle='rgba(255,255,255,.7)';c.beginPath();c.arc(x+ox-rr*.35,y-rr*.35,rr*.2,0,7);c.fill()}}c.fillStyle='#3a8a2a';c.fillRect(0,h-14,w,14)})});
 BUB.map.repeat.set(3,1);
 /* side walls (white with bubbles, a green foot), the roof slab, a green fascia round the top; open at both ends */
 /* (the bubbles only on the two big faces; the wall ends at the entry and exit are plain white with the green foot) */
 const WEND=M(0xffffff,{roughness:.8,map:k.tex(8,128,(c,w,h)=>{c.fillStyle='#f2f0ea';c.fillRect(0,0,w,h);c.fillStyle='#3a8a2a';c.fillRect(0,h-14,w,14)})});
 for(const z of[Z0+T/2,Z1-T/2]){B(X1-X0,H,T,(X0+X1)/2,H/2,z,[WEND,WEND,WHT,WHT,BUB,BUB]);ob(X0,X1,z-T/2-.05,z+T/2+.05)}
 /* the roof: a green box sitting on the wall tops (its edge is the fascia), a white trim along its top edge, and
    inside a white ceiling slab between the walls, 9 cm deep, whose underside (4.31 m) is the ceiling */
 B(X1-X0+.44,.6,Z1-Z0+.44,(X0+X1)/2,H+.3,(Z0+Z1)/2,GRN);B(X1-X0+.5,.06,Z1-Z0+.5,(X0+X1)/2,H+.63,(Z0+Z1)/2,WHT);B(X1-X0+.44,.1,Z1-Z0-2*T,(X0+X1)/2,H-.04,(Z0+Z1)/2,WHT);const CEIL=H-.09;
 /* the WASH letters on the roof, both ways, with bubbles */
 for(const [sd,ry] of[[1,0],[-1,Math.PI]]){const s=L('WASH',4.8,1.4,null,'#f2f0ea',200,(X0+X1)/2,H+1.85,(Z0+Z1)/2+sd*.05,ry)}B(5.2,1.6,.08,(X0+X1)/2,H+1.85,(Z0+Z1)/2,BL);B(5.3,.08,.14,(X0+X1)/2,H+2.69,(Z0+Z1)/2,WHT);
 for(const sd of[-1,1])B(.14,.96,.14,(X0+X1)/2+sd*2.3,H+1.02,(Z0+Z1)/2,k.STL);
 /* the floor: a dark wet slab with two tyre guide rails and a drain grate down the middle */
 B(X1-X0,.03,Z1-Z0-2*T,(X0+X1)/2,.04,(Z0+Z1)/2,M(0x4a4e52,{roughness:.25,metalness:.1}));for(const z of[-1006.2,-1003.8])B(X1-X0-1,.08,.08,(X0+X1)/2,.095,z,STL);B(X1-X0-2,.012,.3,(X0+X1)/2,.061,(Z0+Z1)/2,k.DK);
 /* lights in the ceiling */const lights=[];for(const x of[X0+3,X0+7,X0+11]){B(1.6,.04,.4,x,CEIL-.01,(Z0+Z1)/2,M(0xffffff,{emissive:0xe8f4ff,emissiveIntensity:1}));lights.push([x,CEIL-.4,(Z0+Z1)/2])}
 /* the spray arch at the entry: a blue pipe frame with nozzles; jets (soft white cones) shown while washing */
 const arch=new THREE.Group();arch.position.set(X0+1.6,0,(Z0+Z1)/2);g.add(arch);{const h=k.H(arch),hw=(Z1-Z0)/2-T-.25;for(const sd of[-1,1])h.C(.07,.07,3.4,0,1.7,sd*hw,BL,null,null,10);h.C(.07,.07,hw*2,0,3.4,0,BL,'z',null,10);
  const jets=new THREE.Group();arch.add(jets);const JM=new THREE.MeshBasicMaterial({color:0xe8f6ff,transparent:true,opacity:.35,depthWrite:false});for(let i=0;i<7;i++){const z=-hw+.4+i*(hw*2-.8)/6;h.C(.035,.05,.12,0,3.3,z,STL,null,null,8);const j=new THREE.Mesh(new THREE.ConeGeometry(.35,1.6,10,1,true),JM);j.position.set(0,2.45,z);jets.add(j)}
  for(const sd of[-1,1])for(let y=.6;y<3;y+=.6){h.C(.035,.05,.12,0,y,sd*(hw-.08),STL,'z',null,8);const j=new THREE.Mesh(new THREE.ConeGeometry(.3,1.4,10,1,true),JM);j.rotation.x=sd>0?-Math.PI/2:Math.PI/2;j.position.set(0,y,sd*(hw-.8));jets.add(j)}jets.visible=false;arch.userData.jets=jets}
 /* two tall side brushes on a gantry, and an overhead brush: soft strips of blue, green and red foam round a core */
 /* a brush: a dense roll of soft foam strips. A solid foam roll (coloured stripes running along it, shaded between
    strips) inside a ragged outer fringe (the strips' loose ends, cut out of a striped texture), so the outline is
    soft and it reads as cloth, not a paddle wheel */
 const brushTex=(fringe)=>{const t=k.tex(512,256,(c,w,h)=>{const cols=['#3a7ac8','#3a8a2a','#c0302a','#f2f0ea'];c.clearRect(0,0,w,h);for(let i=0;i<64;i++){const x=i*w/64,col=cols[(i>>1)%4];c.fillStyle=col;if(fringe){for(let y=0;y<h;y+=8){if(r()<.55)c.fillRect(x+1,y,w/64-2,7)}}else{c.fillRect(x,0,w/64,h);c.fillStyle='rgba(0,0,0,.28)';c.fillRect(x,0,2,h);c.fillStyle='rgba(255,255,255,.12)';c.fillRect(x+3,0,2,h)}}});t.wrapS=THREE.RepeatWrapping;return t};
 const BT=brushTex(0),BF=brushTex(1),BM=M(0xffffff,{map:BT,roughness:1}),FM=M(0xffffff,{map:BF,roughness:1,transparent:true,alphaTest:.4,side:THREE.DoubleSide});
 const brush=(len,rad)=>{const b=new THREE.Group();b.add(new THREE.Mesh(new THREE.CylinderGeometry(rad-.1,rad-.1,len,40,1,true),BM));for(const sd of[-1,1]){const e=new THREE.Mesh(new THREE.CircleGeometry(rad-.1,40),M(0x2a4a7a,{roughness:.9}));e.rotation.x=sd*-Math.PI/2;e.position.y=sd*len/2;b.add(e)}const f=new THREE.Mesh(new THREE.CylinderGeometry(rad,rad,len-.04,40,1,true),FM);b.add(f);
  for(const sd of[-1,1]){const cap=new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,.06,16),STL);cap.position.y=sd*(len/2+.03);b.add(cap)}return b};
 const BX=X0+5.5,gantry=(x)=>{for(const z of[Z0+T+.15,Z1-T-.15])B(.18,H-.3,.18,x,(H-.3)/2,z,STL);B(.18,.2,Z1-Z0-2*T,x,H-.3,(Z0+Z1)/2,STL)};gantry(BX-.8);gantry(BX+.8);
 /* each side brush hangs on a drop rod from a carriage that rolls along the two gantry beams (so it can move in to
    the car); the slider group moves along z, the brush inside it spins */
 const side=(z)=>{const sl=new THREE.Group();sl.position.set(BX,0,z);g.add(sl);const h=k.H(sl);h.B(1.8,.1,.14,0,4.25,0,STL);for(const sx of[-.8,.8])h.C(.07,.07,.1,sx,4.25,0,k.DK,'z',null,10);h.C(.05,.05,1.45,0,3.5,0,STL,null,null,8);h.C(.1,.1,.12,0,2.83,0,STL,null,null,10);
  const b=brush(2.6,.9);b.position.set(0,1.5,0);sl.add(b);return[sl,b]};
 const [sliderL,brushL]=side(Z0+T+.85),[sliderR,brushR]=side(Z1-T-.85);
 /* the top brush lies across the bay on an axle; two arms carry it up and down through sleeves fixed to the wall
    tops (the arms always stay in the sleeves) */
 const TX=X0+8.5,tw=Z1-Z0-2*T-.6,sliderTop=new THREE.Group();sliderTop.position.set(TX,2.9,(Z0+Z1)/2);g.add(sliderTop);{const h=k.H(sliderTop);h.C(.05,.05,tw+.46,0,0,0,STL,'z',null,8);for(const sd of[-1,1])h.B(.1,1.25,.1,0,.6,sd*(tw/2+.2),STL)}
 const brushTop=brush(tw,.9);brushTop.rotation.x=Math.PI/2;sliderTop.add(brushTop);for(const sd of[-1,1])B(.2,.5,.2,TX,3.85,(Z0+Z1)/2+sd*(tw/2+.2),k.DK);
 /* the dryer: a big blower hood near the exit, with two side ducts */
 /* the hood rests on the two side ducts, which stand on the floor, and is tied to the ceiling by four rods */const DXp=X1-2.4,DM=M(0xc8ccd0,{metalness:.4,roughness:.4}),dw=Z1-Z0-2*T-.4;B(.9,.5,dw,DXp,3.3,(Z0+Z1)/2,DM);for(const sd of[-1,1]){B(.6,2.995,.5,DXp,1.5525,(Z0+Z1)/2+sd*((Z1-Z0)/2-T-.35),DM);for(const sx of[-.3,.3])C(.025,.025,CEIL-3.55,DXp+sx,(CEIL+3.55)/2,(Z0+Z1)/2+sd*dw*.3,k.STL,null,null,6)}B(.92,.08,Z1-Z0-2*T-.5,DXp,3.03,(Z0+Z1)/2,k.DK);
 /* the traffic sign at the exit: PULL FORWARD / STOP / GO, three lit panels */
 /* (it hangs from the ceiling on two short rods) */const sign={},SX=X1-.6,SZ=(Z0+Z1)/2,SY=CEIL-.3-.45;B(.12,.9,2.2,SX,SY,SZ,k.DK);for(const sd of[-1,1])C(.02,.02,.3,SX,CEIL-.15,SZ+sd*.9,k.STL,null,null,6);for(const [i,t,col] of[[0,'PULL FORWARD','#e8c020'],[1,'STOP','#e02020'],[2,'GO','#30d050']]){const p=L(t,.66,.26,'#141414',col,70,SX-.065,SY,SZ-.72+i*.72,-Math.PI/2);sign[['fwd','stop','go'][i]]=p}
 /* the entry: a price board on a post, a WASH 5 🪙 sign over the entrance */
 {const px=X0-2.2,pz=Z0+.2;B(.12,2.2,.12,px,1.1,pz,STL);B(.08,1.3,1.5,px,2.4,pz,WHT);const pb=L('WASH · 5 🪙\nWAX · FREE\nGOBLIN NOT\nRESPONSIBLE\nFOR GOBLINS',1.4,1.2,'#f2f0ea','#1a1a1a',60,px-.045,2.4,pz,-Math.PI/2);ob(px-.15,px+.15,pz-.75,pz+.75)}
 L('ENTER · 5 🪙 · STAY IN YOUR CAR',(Z1-Z0)-.2,.44,'#3a7ac8','#f2f0ea',70,X0-.25,H+.3,(Z0+Z1)/2,-Math.PI/2);
 return{obs,lights,bay:{x0:X0,x1:X1,z0:Z0+T,z1:Z1-T},parts:{brushL,brushR,brushTop,sliderL,sliderR,sliderTop,arch,jets:arch.userData.jets,sign}}}

/* ---- the car wash's moving parts, every frame while washing: the brushes spin and close in on the car. car =
   {x, z, hw (half width), hl (half length), top(dx): the car's roof height at dx along its length from its middle}
   (null when the bay is empty: everything goes back to rest). The side brushes squeeze its sides while it is level
   with them, and wrap round its front and back as it arrives and leaves; the top brush rides over its bonnet, roof
   and boot. Foam strips bend a few cm into the paint, so it looks like contact. ---- */
function rtWashTick(W,car,dt){const p=W.parts,R=.87,SQ=.06,e=Math.min(1,dt*6);if(!p.rest){p.rest={l:p.sliderL.position.z,r:p.sliderR.position.z,t:p.sliderTop.position.y}}
 const spin=car?1:0;p.brushL.rotation.y+=dt*7*spin;p.brushR.rotation.y-=dt*7*spin;p.brushTop.rotation.y+=dt*6*spin;
 const side=(b,rest,sd)=>{let want=rest;if(car){const bx=b.position.x,dx=bx-car.x,ax=Math.abs(dx);
   if(ax<=car.hl)want=car.z+sd*(car.hw+R-SQ);                     /* level with the car: on its side */
   else if(ax<car.hl+R){const f=(ax-car.hl)/R;want=car.z+sd*(car.hw+R-SQ)*Math.sqrt(Math.max(0,1-f*f))+sd*.15*(1-f)}/* round the corner onto the nose or tail */
   want=sd<0?Math.max(rest,want):Math.min(rest,want)}b.position.z+=(want-b.position.z)*e};
 side(p.sliderL,p.rest.l,-1);side(p.sliderR,p.rest.r,1);
 {let want=p.rest.t;if(car){const dx=p.sliderTop.position.x-car.x;if(Math.abs(dx)<car.hl+R*.6)want=Math.min(p.rest.t,car.top(Math.max(-car.hl,Math.min(car.hl,dx)))+R-SQ)}p.sliderTop.position.y+=(want-p.sliderTop.position.y)*e}}

/* =====================================================================================================
   batch 3: MOTEL 13, turned round to face the town. The building is the old one mirrored north-south, so the doors
   face south onto a covered walkway and the car park.
   A new OFFICE is added at the west end (x 56..64). Walls are 20 cm thick, centred on their lines.
   Seen from the car park the doors read 10, 11, 12, 14, OFFICE from left to right (room 10 at the east end, x 82..88;
   room 14 at x 64..70, next to the office; the painted door 13 is on room 14's wall shared with room 12).
   Layout (desert-local): office x 56..64, rooms x 64..88 (6 m each), front wall z -905, back wall z -899, walls 3 m,
   flat roof 3.0..3.25 with a 2 m overhang over the walkway (z -906.9..-905.1, top .12), turquoise fascia.
   ===================================================================================================== */
const RTM={x0:56,xo:64,x1:88,zf:-905,zb:-899,H:3,walk:{x0:55.9,x1:88.1,z0:-906.9,z1:-905.1,y:.12},
 lot:{x0:56,x1:90,z0:-925.5,z1:-906.9},pool:{x0:92.5,x1:99.5,z0:-905.5,z1:-901.5},neon:[54,-917],rooms:[14,12,11,10]};
/* a box whose texture keeps its real size: each material may carry userData.t (metres per tile); the UVs are laid in
   world units so neighbouring pieces of a wall join up. m = one material or six (+x,-x,+y,-y,+z,-z) */
function rtBox(g,w,h,d,x,y,z,m){const ge=new THREE.BoxGeometry(w,h,d),ms=Array.isArray(m)?m:[m,m,m,m,m,m],uv=ge.attributes.uv;
 const F=[[-1,z+d/2,d,y-h/2,h],[1,z-d/2,d,y-h/2,h],[1,x-w/2,w,z-d/2,d],[1,x-w/2,w,z-d/2,d],[1,x-w/2,w,y-h/2,h],[-1,x+w/2,w,y-h/2,h]];
 for(let f=0;f<6;f++){const t=ms[f]&&ms[f].userData&&ms[f].userData.t;if(!t)continue;const[sg,u0,du,v0,dv]=F[f];
  for(let v=f*4;v<f*4+4;v++)uv.setXY(v,(sg*u0+uv.getX(v)*du)/t,(v0+uv.getY(v)*dv)/t)}
 const o=new THREE.Mesh(ge,m);o.position.set(x,y,z);o.userData.noSeam=true;g.add(o);return o}
/* a glowing neon word on a dark ground (unlit, so it reads at night); returns the plane */
function rtNeon(t,w,h,col,bg,fs,lines){const c=document.createElement('canvas');c.width=512;c.height=Math.round(512*h/w);const x=c.getContext('2d');if(bg){x.fillStyle=bg;x.fillRect(0,0,c.width,c.height)}else x.clearRect(0,0,c.width,c.height);
 x.textAlign='center';x.textBaseline='middle';const L=String(t).split('\n');for(let pass=0;pass<2;pass++){x.shadowColor=col;x.shadowBlur=pass?6:22;x.fillStyle=pass?'#fff6fb':col;
  L.forEach((s,i)=>{let f=(lines&&lines[i])||fs;x.font='bold '+f+'px Arial';const mw=x.measureText(s).width;if(mw>c.width*.9){f=f*c.width*.9/mw;x.font='bold '+f+'px Arial'}x.fillText(s,c.width/2,c.height*(i+.5)/L.length)})}
 const tx=new THREE.CanvasTexture(c);tx.anisotropy=8;const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tx,transparent:!bg}));m.userData.noSeam=true;return m}
function rtMotelKit(){const k=rtKit();if(k._mot)return k._mot;const M=k.M,r=k.r,T=(m,t)=>{m.userData.t=t;return m};
 const o={};
 o.STU=T(M(0xffffff,{roughness:.95,map:k.tex(256,256,(c,w,h)=>{c.fillStyle='#ead9b8';c.fillRect(0,0,w,h);for(let i=0;i<5200;i++){c.fillStyle=r()<.5?'rgba(150,126,92,.10)':'rgba(255,250,236,.16)';c.fillRect(r()*w,r()*h,1+r()*2.5,1+r()*2.5)}})}),2.5);
 /* the rooms' wallpaper: faded stripes with a small diamond, a darker band near the floor (scuffs) */
 o.PAPER=T(M(0xffffff,{roughness:.95,map:k.tex(128,256,(c,w,h)=>{c.fillStyle='#d6c49a';c.fillRect(0,0,w,h);for(let x=0;x<w;x+=32){c.fillStyle='rgba(150,110,70,.22)';c.fillRect(x,0,10,h);c.fillStyle='rgba(255,250,230,.25)';c.fillRect(x+16,0,3,h)}
  c.fillStyle='rgba(120,70,60,.35)';for(let y=10;y<h;y+=40)for(let x=0;x<w;x+=32){c.beginPath();c.moveTo(x+24,y);c.lineTo(x+28,y+5);c.lineTo(x+24,y+10);c.lineTo(x+20,y+5);c.fill()}for(let i=0;i<400;i++){c.fillStyle='rgba(90,70,40,.08)';c.fillRect(r()*w,r()*h,2,2)}})}),1);
 /* the office: knotty pine panelling */
 o.PANEL=T(M(0xffffff,{roughness:.8,map:k.tex(256,256,(c,w,h)=>{c.fillStyle='#b4844e';c.fillRect(0,0,w,h);for(let x=0;x<w;x+=32){c.fillStyle='rgba(70,40,16,.55)';c.fillRect(x,0,2,h);for(let i=0;i<14;i++){c.fillStyle='rgba(110,64,28,'+(.1+r()*.2)+')';c.fillRect(x+3+r()*26,0,1,h)}
  if(r()<.7){c.fillStyle='rgba(80,40,14,.6)';c.beginPath();c.ellipse(x+8+r()*16,r()*h,3,5,0,0,7);c.fill()}}})}),1.6);
 o.TILE=T(M(0xffffff,{roughness:.3,map:k.tex(64,64,(c,w,h)=>{c.fillStyle='#e9eef0';c.fillRect(0,0,w,h);c.fillStyle='rgba(120,140,150,.5)';c.fillRect(0,0,w,2);c.fillRect(0,0,2,h);c.fillStyle='rgba(255,255,255,.5)';c.fillRect(5,5,20,4)})}),.3);
 o.LINO=T(M(0xffffff,{roughness:.5,map:k.tex(64,64,(c,w,h)=>{for(let i=0;i<2;i++)for(let j=0;j<2;j++){c.fillStyle=(i+j)%2?'#2a5a5c':'#e8e0cc';c.fillRect(i*32,j*32,32,32)}c.fillStyle='rgba(0,0,0,.06)';for(let n=0;n<200;n++)c.fillRect(r()*w,r()*h,1,1)})}),.6);
 o.FAS=M(0x2a9a98,{roughness:.6});o.FASD=M(0x1f7472,{roughness:.6});o.WHT=M(0xf2eee2,{roughness:.7});o.TAR=M(0x5a5650,{roughness:1});o.CEIL=M(0xeee8da,{roughness:.95,emissive:0x3a362e});
 o.DOOR=0x3f8f96;
 /* a door: two tall panels with a raised moulding, painted; (the painted-on door 13 copies this picture) */
 o.doorDraw=(c,w,h,ox,oy,dw,dh)=>{c.fillStyle='#3f8f96';c.fillRect(ox,oy,dw,dh);for(const[px,py,pw,ph]of[[.14,.07,.72,.36],[.14,.5,.72,.43]]){const X=ox+px*dw,Y=oy+py*dh,W=pw*dw,Hh=ph*dh;c.fillStyle='rgba(0,0,0,.22)';c.fillRect(X,Y,W,Hh);c.fillStyle='#4aa2a9';c.fillRect(X+3,Y+3,W-6,Hh-6);c.fillStyle='rgba(255,255,255,.25)';c.fillRect(X+3,Y+3,W-6,2);c.fillRect(X+3,Y+3,2,Hh-6)}
  for(let i=0;i<60;i++){c.fillStyle='rgba(255,255,255,'+(.04+r()*.05)+')';c.fillRect(ox+r()*dw,oy+r()*dh,1+r()*3,1)}};
 o.DTX=M(0xffffff,{roughness:.6,map:k.tex(128,256,(c,w,h)=>o.doorDraw(c,w,h,0,0,w,h))});o.DED=M(0x2f7076,{roughness:.6});
 o.BRASS=M(0xd8a830,{metalness:.8,roughness:.3});o.WOOD=M(0x6a4428,{roughness:.7});o.WOODL=M(0x9a6a40,{roughness:.7});
 o.GLASS=k.GLASS;o.FROST=M(0xdfe8ec,{roughness:.4,transparent:true,opacity:.8});
 o.CONC=(()=>{const m=rtConcrete(k)();m.userData.t=3;return m})();
 return k._mot=o}
/* one door leaf on its hinge. The hinge sits at the door's west edge on the wall's inner half; turning the hinge by -a
   (the base game's own door code: hinge.rotation.y=-st.a) swings it into the room. Returns the hinge group */
function rtMotelDoor(g,k,o,x,z,plate){const h=new THREE.Group();h.position.set(x,.125,z);g.add(h);const H=k.H(h);
 const lf=rtBox(h,1.19,2.17,.05,.595,1.085,0,[o.DED,o.DED,o.DED,o.DED,o.DTX,o.DTX]);
 for(const sd of[-1,1]){const kn=new THREE.Mesh(new THREE.SphereGeometry(.045,10,8),o.BRASS);kn.position.set(1.05,.95,sd*.06);h.add(kn);H.C(.02,.02,.04,1.05,.95,sd*.035,o.BRASS,'z',null,8);H.B(.06,.16,.012,1.05,.95,sd*.031,o.BRASS)}
 if(plate){const p=H.L(plate,.3,.17,'#d8b048','#3a2a12',90,.595,1.72,-.034,Math.PI);p.userData.noSeam=true}
 H.C(.012,.012,.012,.595,1.55,-.031,o.BRASS,'z',null,8);
 return h}
function rtMotel(g){const k=rtKit(),o=rtMotelKit(),{B,C,rod,L,tube}=k.H(g),M=k.M,r=k.r,obs=[],lights=[];const ob=(x0,x1,z0,z1)=>{const b={x0,x1,z0,z1};obs.push(b);return b};
 const X0=56,XO=64,X1=88,ZF=-905,ZB=-899,H=3,WT=.2,box=(w,h,d,x,y,z,m)=>rtBox(g,w,h,d,x,y,z,m);
 const inner=x=>x<XO?o.PANEL:o.PAPER;
 /* ---- walls ---- */
 /* front wall (z -905): outside stucco, inside wallpaper (panelling in the office) */
 const fw=(a,b,y0,y1)=>{if(b-a<.005||y1-y0<.005)return;const x=(a+b)/2;box(b-a,y1-y0,WT,x,(y0+y1)/2,ZF,[o.STU,o.STU,o.STU,o.STU,inner(x),o.STU])};
 const bw=(a,b,y0,y1)=>{if(b-a<.005||y1-y0<.005)return;const x=(a+b)/2;box(b-a,y1-y0,WT,x,(y0+y1)/2,ZB,[o.STU,o.STU,o.STU,o.STU,o.STU,inner(x)])};
 /* openings along the front: [x0, x1, bottom, top] (door: bottom 0, a sill fills 0..12 cm) */
 const FO=[[57.6,60.4,.8,2.3],[61,62.2,0,2.3]];for(let i=0;i<4;i++){const x0=XO+i*6;FO.push([x0+2.4,x0+3.6,0,2.3],[x0+4.25,x0+5.75,1,2.1])}
 let fx=X0-.1;for(const[a,b,y0,y1]of FO){fw(fx,a,0,H);fw(a,b,0,y0);fw(a,b,y1,H);fx=b}fw(fx,X1+.1,0,H);
 /* door sills (concrete, level with the walkway) */for(const[a,b,y0]of FO)if(y0==0)box(b-a,.12,WT,(a+b)/2,.06,ZF,o.CONC);
 /* back wall (z -899): a small frosted bathroom window in each room */
 let bx=X0-.1;for(let i=0;i<4;i++){const x0=XO+i*6;bw(bx,x0+4.5,0,H);bw(x0+4.5,x0+5.2,0,1.95);bw(x0+4.5,x0+5.2,2.55,H);bx=x0+5.2}bw(bx,X1+.1,0,H);
 /* the two ends and the party walls between rooms (the office/room 10 wall is panelled on the office side) */
 const sw=(x,mxp,mxn)=>box(WT,H,ZB-ZF-WT,x,H/2,(ZF+ZB)/2,[mxp,mxn,o.STU,o.STU,o.STU,o.STU]);
 sw(X0,o.PANEL,o.STU);sw(X1,o.STU,o.PAPER);sw(XO,o.PAPER,o.PANEL);for(const x of[70,76,82])sw(x,o.PAPER,o.PAPER);
 ob(X0-.1,X1+.1,ZB-.1,ZB+.1);for(const x of[X0,XO,70,76,82,X1])ob(x-.1,x+.1,ZF,ZB);
 {let a=X0-.1;for(const[d0,d1,y0]of FO){if(y0==0){ob(a,d0,ZF-.1,ZF+.1);a=d1}}ob(a,X1+.1,ZF-.1,ZF+.1)}
 /* ---- roof: slab on the walls, white soffit and ceilings underneath, turquoise fascia with a white cap ---- */
 box(32.6,.25,8.2,72,3.125,-902.9,[o.TAR,o.TAR,o.TAR,o.CEIL,o.TAR,o.TAR]);
 for(const z of[-907.05,-898.75])box(32.8,.6,.1,72,3.15,z,o.FAS);for(const x of[55.65,88.35])box(.1,.6,8.2,x,3.15,-902.9,o.FAS);
 box(32.84,.04,.14,72,3.47,-907.05,o.WHT);box(32.84,.04,.14,72,3.47,-898.75,o.WHT);for(const x of[55.65,88.35])box(.14,.04,7.96,x,3.47,-902.9,o.WHT);
 /* ---- the walkway: a raised concrete strip (12 cm), white steel posts, a lamp by each door ---- */
 box(32.2,.12,1.8,72,.06,-906,o.CONC);
 for(const x of[56.1,60,64,70,76,82,87.9]){box(.12,2.88,.12,x,1.56,-906.7,o.WHT);box(.2,.02,.2,x,.125,-906.7,k.STL);ob(x-.08,x+.08,-906.78,-906.62)}
 /* ---- the rooms ---- */
 const CARPET=[0x6a2a3a,0x2a4a6a,0x3a5a2a,0x5a3a6a],BLK=[0xc84a4a,0x4a7ac8,0x6aa84a,0x9a6ac8],CUR=[0xd8a040,0x6aa0b0,0xc87050,0xa8b060],MSG={12:'THE BUS NEVER STOPS'};
 const doors=[],tvs=[],spots={rooms:[]};const STT=k.tex(64,48,(c,w,h)=>{for(let i=0;i<w*h/3;i++){const v=r()*255|0;c.fillStyle='rgb('+v+','+v+','+v+')';c.fillRect(r()*w,r()*h,2,1)}});
 const casing=(a,b,z,y0,top)=>{for(const x of[a-.05,b+.05])box(.1,top-y0,.03,x,(y0+top)/2,z,o.WHT);box(b-a+.2,.12,.03,(a+b)/2,top+.06,z,o.WHT)};
 for(let i=0;i<4;i++){const x0=XO+i*6,n=RTM.rooms[i],dx=x0+3,sp={n,x0};spots.rooms.push(sp);
  box(5.8,.03,5.8,x0+3,.02,-902,M(CARPET[i],{roughness:1}));
  /* the door */const hg=rtMotelDoor(g,k,o,x0+2.43,ZF+.04,String(n));casing(x0+2.4,x0+3.6,ZF-.115,.12,2.3);casing(x0+2.4,x0+3.6,ZF+.115,.035,2.3);
  doors.push({n,hinge:hg,x:dx,z:ZF,ob:ob(x0+2.4,x0+3.6,ZF-.2,ZF+.2)});sp.door=[dx,ZF];
  /* a brass number above the door too, and a wall lamp beside it */L(String(n),.36,.22,'#d8b048','#3a2a12',90,dx,2.55,ZF-.111,Math.PI);
  box(.14,.28,.04,x0+1.85,2.05,ZF-.12,k.STL);{const gl=C(.07,.07,.2,x0+1.85,2.05,ZF-.21,M(0xfff4d8,{emissive:0xffd890,emissiveIntensity:.9}),null,null,10);C(.08,.08,.02,x0+1.85,2.16,ZF-.21,k.STL,null,null,10);C(.08,.08,.02,x0+1.85,1.94,ZF-.21,k.STL,null,null,10);box(.03,.03,.09,x0+1.85,2.05,ZF-.155,k.STL)}
  if(i%2==1)lights.push([x0-.15,2.4,-906.2]);
  /* the window: white frame, sliding glass, a sill outside; curtains inside on a rod */
  {const a=x0+4.25,b=x0+5.75,y0=1,y1=2.1,xc=(a+b)/2;box(b-a,.06,.08,xc,y0+.03,ZF,o.WHT);box(b-a,.06,.08,xc,y1-.03,ZF,o.WHT);for(const x of[a+.03,b-.03,xc])box(.05,y1-y0-.12,.08,x,(y0+y1)/2,ZF,o.WHT);
   for(const sd of[-1,1])box(.68,y1-y0-.12,.01,xc+sd*.36,(y0+y1)/2,ZF+sd*.02,o.GLASS);box(1.6,.05,.12,xc,.975,ZF-.16,o.WHT);
   C(.015,.015,1.7,xc,2.25,ZF+.2,k.STL,'x',null,8);for(const sd of[-1,1])box(.03,.03,.1,xc+sd*.82,2.25,ZF+.15,k.STL);
   const CU=M(0xffffff,{roughness:1,map:k.tex(64,64,(c,w,h)=>{c.fillStyle='#'+CUR[i].toString(16).padStart(6,'0');c.fillRect(0,0,w,h);for(let x=0;x<w;x+=8){c.fillStyle='rgba(0,0,0,.18)';c.fillRect(x,0,3,h);c.fillStyle='rgba(255,255,255,.12)';c.fillRect(x+5,0,2,h)}})});
   for(const sd of[-1,1])box(.42,1.33,.03,xc+sd*.62,1.57,ZF+.2,CU)}
  /* the air conditioner under the window, inside */box(1.0,.45,.26,x0+5,.26,ZF+.23,M(0xd8d8d0,{roughness:.6}));box(.8,.18,.012,x0+5,.36,ZF+.364,M(0x8a8a84,{roughness:.8}));
  /* bed against the back wall, headboard, pillows, a blanket draped over the foot */
  {const bxc=x0+1.9;box(1.7,.35,2.05,bxc,.21,-900.175,o.WOOD);box(1.6,.2,1.95,bxc,.485,-900.175,M(0xf0ece4,{roughness:.95}));box(1.8,.98,.08,bxc,.545,-899.14,o.WOOD);
   const BLM=M(BLK[i],{roughness:1});box(1.66,.05,1.42,bxc,.61,-900.46,BLM);box(1.66,.24,.03,bxc,.49,-901.185,BLM);for(const sd of[-1,1])box(.03,.24,1.42,bxc+sd*.845,.49,-900.46,BLM);
   for(const sd of[-.4,.4])box(.6,.12,.35,bxc+sd,.645,-899.5,M(0xffffff,{roughness:.9}));ob(x0+1.05,x0+2.75,-901.2,ZB-.1);sp.bed=[x0+3.3,-900.2]}
  /* nightstand and lamp; the painting over the bed */
  box(.5,.55,.45,x0+.45,.31,-899.4,o.WOODL);C(.08,.1,.3,x0+.45,.735,-899.4,M(0xc8b080),null,null,10);C(.13,.2,.26,x0+.45,1.0,-899.4,M(0xfff0c8,{emissive:0x8a7040,roughness:.8}),null,null,12);ob(x0+.15,x0+.75,-899.7,ZB-.1);
  {const pc=document.createElement('canvas');pc.width=256;pc.height=150;const x=pc.getContext('2d'),gr=x.createLinearGradient(0,0,0,150);gr.addColorStop(0,'#f0a060');gr.addColorStop(.6,'#ffd890');gr.addColorStop(.61,'#d8a060');gr.addColorStop(1,'#b07840');x.fillStyle=gr;x.fillRect(0,0,256,150);x.fillStyle='#3a6a2a';x.fillRect(180,52,8,53);x.fillRect(170,68,26,6);x.fillStyle='#6a3a1a';x.fillRect(64,45,31,48);x.strokeStyle='#5a3a10';x.lineWidth=12;x.strokeRect(0,0,256,150);
   const pm=new THREE.Mesh(new THREE.PlaneGeometry(1.2,.7),M(0xffffff,{map:new THREE.CanvasTexture(pc)}));pm.position.set(x0+1.9,1.75,ZB-.105);pm.rotation.y=Math.PI;g.add(pm)}
  /* the bathroom, back right: two tiled walls with a doorway, a tiled floor, the toilet, a sink and the mirror */
  {const TL=o.TILE,PP=o.PAPER;box(.1,H,1.85,x0+3.7,H/2,-899.925,[TL,PP,PP,PP,PP,PP]);box(.8,.9,.1,x0+4.15,2.55,-900.8,[PP,PP,PP,PP,TL,PP]);box(1.35,H,.1,x0+5.225,H/2,-900.8,[PP,PP,PP,PP,TL,PP]);
   ob(x0+3.65,x0+3.75,-900.85,ZB-.1);ob(x0+4.55,x0+5.9,-900.85,-900.75);
   box(2.15,.012,1.6,x0+4.825,.041,-899.95,TL);
   const POR=M(0xf6f6f2,{roughness:.25});box(.4,.388,.6,x0+5.5,.241,-899.55,POR);box(.45,.42,.17,x0+5.5,.64,-899.19,POR);box(.38,.03,.42,x0+5.5,.45,-899.62,POR);ob(x0+5.25,x0+5.8,-899.9,ZB-.1);
   C(.07,.09,.748,x0+4.35,.421,-899.3,POR,null,null,10);box(.5,.14,.38,x0+4.35,.86,-899.3,POR);C(.012,.012,.12,x0+4.35,.98,-899.18,k.STL,null,null,6);
   const mc=document.createElement('canvas');mc.width=128;mc.height=150;const x=mc.getContext('2d');x.fillStyle='#b8c8d0';x.fillRect(0,0,128,150);x.fillStyle='rgba(255,255,255,.35)';x.fillRect(13,0,19,150);x.strokeStyle='#d8d8d8';x.lineWidth=6;x.strokeRect(0,0,128,150);
   if(MSG[n]){x.fillStyle='#d02040';x.font='bold 24px Georgia';x.textAlign='center';x.fillText('THE BUS',64,60);x.fillText('NEVER STOPS',64,100)}
   const mm=new THREE.Mesh(new THREE.PlaneGeometry(.5,.6),M(0xffffff,{map:new THREE.CanvasTexture(mc),roughness:.1,metalness:.2}));mm.position.set(x0+4.35,1.45,ZB-.105);mm.rotation.y=Math.PI;g.add(mm);sp.mirror=[x0+4.35,-899.95];
   /* the frosted window over the sink: frame and glass in the opening */{const a=x0+4.5,b=x0+5.2;box(b-a,.05,.08,(a+b)/2,1.975,ZB,o.WHT);box(b-a,.05,.08,(a+b)/2,2.525,ZB,o.WHT);for(const x of[a+.025,b-.025])box(.05,.5,.08,x,2.25,ZB,o.WHT);box(b-a-.1,.5,.01,(a+b)/2,2.25,ZB,o.FROST);box(.8,.05,.1,(a+b)/2,1.925,ZB+.15,o.WHT)}}
  /* dresser with the TV on it (screen faces west), an armchair facing it, a round rug, a ceiling light */
  {box(.5,.8,1.4,x0+5.65,.435,-903.1,o.WOODL);for(const y of[.25,.5,.72])box(.012,.16,1.2,x0+5.395,y,-903.1,o.WOOD);ob(x0+5.35,x0+5.95,-903.85,-902.35);
   const tg=new THREE.Group();tg.position.set(x0+5.62,1.06,-903.1);g.add(tg);const tH=k.H(tg);tH.B(.45,.45,.6,0,0,0,M(0x1a1a1a,{roughness:.5}));const scr=new THREE.Mesh(new THREE.PlaneGeometry(.5,.36),new THREE.MeshBasicMaterial({map:STT}));scr.position.set(-.235,0,0);scr.rotation.y=-Math.PI/2;tg.add(scr);
   for(const sd of[-1,1])tH.rod([0,.225,0],[.05,.5,sd*.18],.006,k.STL);tvs.push({tg,screen:scr,x:x0+5.38,z:-903.1});sp.tv=[x0+5.0,-903.1];
   const CH=M(0x8a5a3a,{roughness:.9});box(.75,.42,.75,x0+1.1,.245,-903.6,CH);box(.15,.5,.75,x0+.8,.7,-903.6,CH);for(const sd of[-1,1])box(.6,.18,.12,x0+1.17,.545,-903.6+sd*.315,CH);ob(x0+.7,x0+1.5,-904,-903.2);
   C(.9,.9,.012,x0+2.9,.041,-902.4,M(0xc8b090,{roughness:1}),null,null,28);
   C(.2,.24,.06,x0+2.5,2.97,-902.4,M(0xfff4dc,{emissive:0xb89a60,emissiveIntensity:.5}),null,null,14)}
  /* room 14: door 13 painted on its east wall (the wall it shares with room 12), between the dresser and the bathroom */
  if(n==14){const c=document.createElement('canvas');c.width=192;c.height=320;const x=c.getContext('2d');x.fillStyle='#f0ece0';x.fillRect(0,0,192,320);o.doorDraw(x,192,320,12,12,168,300);x.fillStyle='#d8b048';x.fillRect(66,62,60,34);x.fillStyle='#3a2a12';x.font='bold 26px Arial';x.textAlign='center';x.fillText('13',96,88);x.fillStyle='#d8a830';x.beginPath();x.arc(158,178,8,0,7);x.fill();
   const d13=new THREE.Mesh(new THREE.PlaneGeometry(1.32,2.2),M(0xffffff,{map:new THREE.CanvasTexture(c),roughness:.7}));d13.position.set(x0+5.895,1.135,-901.6);d13.rotation.y=-Math.PI/2;g.add(d13);sp.d13=[x0+5.3,-901.6]}}
 /* ---- the office (x 56..64): a big window with a lit VACANCY sign in it, a counter with the bell and the guest book,
    the key board behind it, a ceiling fan, a bench, a postcard rack, a water cooler ---- */
 {box(7.8,.03,5.8,60,.02,-902,o.LINO);
  const od=rtMotelDoor(g,k,o,61.03,ZF+.04,'OFFICE');casing(61,62.2,ZF-.115,.12,2.3);casing(61,62.2,ZF+.115,.035,2.3);doors.push({n:'office',hinge:od,x:61.6,z:ZF,ob:ob(61,62.2,ZF-.2,ZF+.2)});
  {const a=57.6,b=60.4,y0=.8,y1=2.3,xc=59;box(b-a,.06,.08,xc,y0+.03,ZF,o.WHT);box(b-a,.06,.08,xc,y1-.03,ZF,o.WHT);for(const x of[a+.03,b-.03,xc])box(.06,y1-y0-.12,.08,x,(y0+y1)/2,ZF,o.WHT);for(const sd of[-1,1])box(1.31,y1-y0-.12,.01,xc+sd*.685,(y0+y1)/2,ZF,o.GLASS);box(3,.05,.12,xc,.775,ZF-.16,o.WHT);
   const v=rtNeon('VACANCY',1.0,.26,'#ff3060',null,96);v.position.set(58.3,1.75,ZF+.065);v.rotation.y=Math.PI;g.add(v);const vb=rtNeon('VACANCY',1.0,.26,'#ff3060',null,96);vb.position.set(58.3,1.75,ZF+.095);g.add(vb);
   box(1.06,.32,.02,58.3,1.75,ZF+.08,M(0x141010,{roughness:.6}));for(const sd of[-1,1])C(.004,.004,.43,58.3+sd*.45,2.1,ZF+.08,k.STL,null,null,4)}
  /* the counter (customers' side to the south), its top, a lift-up flap gap at the east end */
  box(5,1,.6,58.6,.535,-902.2,[o.PANEL,o.PANEL,o.PANEL,o.PANEL,o.PANEL,o.PANEL]);box(5.08,.04,.68,58.62,1.055,-902.2,M(0xc84a3a,{roughness:.4}));box(5,.06,.04,58.6,.065,-902.52,o.WOOD);ob(56.1,61.1,-902.5,-901.9);
  /* the bell, the guest book, BACK IN 13 MINUTES */{const BL=M(0xd8d8d8,{metalness:.8,roughness:.25});C(.07,.08,.02,60.4,1.085,-902.3,M(0x2a2a2a),null,null,14);const b=new THREE.Mesh(new THREE.SphereGeometry(.065,14,8,0,Math.PI*2,0,Math.PI/2),BL);b.position.set(60.4,1.095,-902.3);g.add(b);C(.008,.008,.02,60.4,1.168,-902.3,BL,null,null,6);
   box(.42,.04,.3,59.3,1.095,-902.25,M(0x7a2a2a,{roughness:.8}));box(.38,.006,.27,59.3,1.118,-902.25,M(0xf2ecd8,{roughness:.9}));C(.006,.006,.16,59.45,1.125,-902.2,k.DK,'z',null,6).rotation.y=.4;
   const sg=new THREE.Group();sg.position.set(57.4,1.075,-902.3);g.add(sg);const sH=k.H(sg);sH.B(.36,.02,.12,0,.01,0,o.WOOD);for(const sd of[-1,1]){const pnl=sH.B(.34,.22,.01,0,.12,sd*.04,M(0xf2ecd8));pnl.rotation.x=-sd*.32}const sl=sH.L('BACK IN\n13 MINUTES',.32,.2,'#f2ecd8','#202020',60,0,.125,-.052,Math.PI);sl.rotation.x=.32}
  /* behind the counter: the key board (hooks 10, 11, 12, 13, 14; the 13 hook has a key), a stool, a clock, a calendar */
  {const kc=document.createElement('canvas');kc.width=320;kc.height=160;const x=kc.getContext('2d');x.fillStyle='#5a3418';x.fillRect(0,0,320,160);x.strokeStyle='#3a2008';x.lineWidth=8;x.strokeRect(0,0,320,160);x.fillStyle='#f0e0b0';x.font='bold 22px Arial';x.textAlign='center';x.fillText('KEYS',160,30);
   ['10','11','12','13','14'].forEach((t,i)=>{const cx=40+i*60;x.fillStyle='#d8b048';x.beginPath();x.arc(cx,58,5,0,7);x.fill();x.fillStyle='#f0e0b0';x.fillText(t,cx,148);x.strokeStyle='#d8b048';x.lineWidth=3;x.beginPath();x.moveTo(cx,62);x.lineTo(cx,86);x.stroke();x.fillStyle=t=='13'?'#c02020':'#e8d070';x.fillRect(cx-12,86,24,34);x.fillStyle='#202020';x.font='bold 14px Arial';x.fillText(t,cx,108);x.font='bold 22px Arial'});
   const kb=new THREE.Mesh(new THREE.PlaneGeometry(1.2,.6),M(0xffffff,{map:new THREE.CanvasTexture(kc),roughness:.8}));kb.position.set(58.4,1.65,ZB-.125);kb.rotation.y=Math.PI;g.add(kb);box(1.24,.64,.02,58.4,1.65,ZB-.11,o.WOOD);
   C(.18,.18,.3,59.4,.48,-900.9,M(0x8a2a2a,{roughness:.7}),null,null,14);C(.03,.03,.43,59.4,.265,-900.9,k.STL,null,null,6);C(.2,.2,.02,59.4,.04,-900.9,k.STL,null,null,14);
   const cc=document.createElement('canvas');cc.width=128;cc.height=128;const y=cc.getContext('2d');y.fillStyle='#f6f2e6';y.beginPath();y.arc(64,64,60,0,7);y.fill();y.strokeStyle='#2a2a2a';y.lineWidth=6;y.stroke();y.fillStyle='#202020';y.font='bold 14px Arial';y.textAlign='center';y.textBaseline='middle';for(let h=1;h<=13;h++){const a=h/13*Math.PI*2-Math.PI/2;y.fillText(String(h),64+Math.cos(a)*46,64+Math.sin(a)*46)}y.lineWidth=4;y.beginPath();y.moveTo(64,64);y.lineTo(64,30);y.moveTo(64,64);y.lineTo(88,72);y.stroke();
   const ck=new THREE.Mesh(new THREE.CircleGeometry(.2,28),M(0xffffff,{map:new THREE.CanvasTexture(cc)}));ck.position.set(61.6,2.35,ZB-.13);ck.rotation.y=Math.PI;g.add(ck);C(.21,.21,.04,61.6,2.35,ZB-.1,M(0x3a3a3a),'z',null,28);
   L('OCTOBER\n13 13 13 13\n13 13 13 13',.4,.5,'#f6f2e6','#c02020',40,62.6,1.6,ZB-.106,Math.PI)}
  /* customers' side: a bench under the window, a postcard rack, a water cooler, a potted cactus, a rack of leaflets */
  {box(2.4,.06,.45,59,.45,-904.6,o.WOODL);for(const sx of[-1.1,1.1])for(const sz of[-.17,.17])box(.05,.42,.05,59+sx,.24,-904.6+sz,o.WOOD);ob(57.8,60.2,-904.85,-904.35);
   C(.02,.02,1.48,56.6,.795,-903.6,k.STL,null,null,6);C(.2,.2,.02,56.6,.045,-903.6,k.STL,null,null,14);const pr=['#e86a3a','#3a8ad8','#e8c020','#5aa84a'];for(let j=0;j<3;j++)for(let a=0;a<4;a++){const ang=a*Math.PI/2,p=L('',.16,.22,pr[(a+j)%4],null,10,56.6+Math.sin(ang)*.07,.95+j*.28,-903.6+Math.cos(ang)*.07,ang)}for(const y of[.83,1.11,1.39])box(.16,.012,.16,56.6,y,-903.6,k.STL);ob(56.4,56.8,-903.8,-903.4);
   C(.17,.17,1.0,63.55,.535,-904.45,M(0xe8e8e2,{roughness:.5}),null,null,14);C(.15,.1,.4,63.55,1.235,-904.45,M(0x7ab8e0,{transparent:true,opacity:.7,roughness:.1}),null,null,14);ob(63.35,63.75,-904.65,-904.25);
   C(.16,.12,.3,63.5,.185,-899.55,M(0xb8582a,{roughness:.8}),null,null,12);C(.09,.11,.7,63.5,.68,-899.55,M(0x4a7a3a,{roughness:.8}),null,null,10);for(const sd of[-1,1]){C(.05,.06,.3,63.5+sd*.15,.85,-899.55,M(0x4a7a3a,{roughness:.8}),null,null,8).rotation.z=-sd*.5}
   box(.06,.7,.5,56.13,1.3,-903.95+.0,o.WOOD);for(let j=0;j<3;j++)L('',.13,.2,['#e8d8b0','#c8e0f0','#f0c8c8'][j],null,10,56.17,1.15,-904.1+j*.15,Math.PI/2);L('VISIT THE\nPYRAMID!',.42,.2,'#e8c020','#5a3a10',40,56.17,1.48,-903.95,Math.PI/2)}
  /* the ceiling fan (turn parts.fan about y) and a light */{const fan=new THREE.Group();fan.position.set(59.6,2.6,-903.4);g.add(fan);C(.015,.015,.4,59.6,2.8,-903.4,k.STL,null,null,6);C(.08,.08,.02,59.6,2.99,-903.4,k.STL,null,null,10);const fH=k.H(fan);fH.C(.1,.12,.12,0,0,0,o.WOOD,null,null,12);for(let j=0;j<4;j++){const bl=fH.B(.5,.012,.13,.33,-.02,0,o.WOODL);const p=new THREE.Group();p.add(bl);p.rotation.y=j*Math.PI/2;fan.add(p)}fH.C(.07,.05,.08,0,-.1,0,M(0xfff4dc,{emissive:0xc0a060}),null,null,10);spots.fan=fan}
  spots.bell=[60.4,-903];spots.keys=[58.4,-900.6];spots.book=[59.3,-903]}
 /* ---- the OFFICE sign on the roof over the office (lit), and its frame ---- */
 {box(3.2,1.0,.22,60,3.75,-906.85,o.FASD);const s=rtNeon('OFFICE',3.0,.75,'#ff4060','#141010',150);s.position.set(60,3.87,-906.965);s.rotation.y=Math.PI;g.add(s);box(3.3,.05,.3,60,4.275,-906.85,o.WHT);for(const sd of[-1,1])rod([60+sd*1.2,3.25,-906.4],[60+sd*1.2,4.1,-906.75],.02,k.STL);lights.push([60,3.8,-907.6])}
 /* ---- the ice machine, out on the walkway by the office door ---- */
 {const ix=56.75,iz=-905.55,IM=M(0xd8e0e8,{metalness:.3,roughness:.4});box(.9,1.6,.8,ix,.92,iz,IM);box(.7,.5,.02,ix,1.35,iz-.41,M(0x2a2a30));L('ICE',.7,.3,'#2a6ad8','#ffffff',60,ix,.75,iz-.405,Math.PI);
  box(.3,.12,.04,ix,1.0,iz-.42,k.STL);const gl=rtNeon('❄ ICE ❄',.66,.2,'#80c8ff','#10202c',70);gl.position.set(ix,1.5,iz-.425);gl.rotation.y=Math.PI;g.add(gl);ob(ix-.45,ix+.45,iz-.4,iz+.4);spots.ice=[ix,iz-1.1]}
 /* ---- the back yard (north side, z -898.9..-894.6): gravel, an air conditioner on a bracket and a frosted window
    per room, drainpipes, the dumpster, the propane cage, the washing line ---- */
 {const gm=new THREE.Mesh(new THREE.PlaneGeometry(32.2,4.3),k.GRAVEL.clone());gm.material.map=k.GRAVEL.map.clone();gm.material.map.needsUpdate=true;gm.material.map.repeat.set(4,1);gm.rotation.x=-Math.PI/2;gm.position.set(72,.012,-896.75);gm.userData.noSeam=true;g.add(gm);
  for(let i=0;i<4;i++){const x0=XO+i*6,ax=x0+1.5;box(.9,.05,.55,ax,1.075,-898.625,k.STL);for(const sd of[-1,1])rod([ax+sd*.38,.7,-898.88],[ax+sd*.38,1.05,-898.4],.015,k.STL);
   box(.8,.6,.5,ax,1.4,-898.625,M(0xb8b8b0,{roughness:.6}));const fan=new THREE.Mesh(new THREE.CircleGeometry(.22,18),M(0x4a4a4a,{roughness:.8}));fan.position.set(ax,1.4,-898.365);g.add(fan);for(let j=-2;j<=2;j++)box(.44,.01,.01,ax,1.4+j*.08,-898.355,k.STL);
   tube([[ax+.3,1.2,-898.86],[ax+.42,1.1,-898.8],[ax+.42,.6,-898.82]],.012,k.DK);spots.rooms[i].ac=[ax,-898]}
  for(const x of[56.2,87.8]){C(.05,.05,2.85,x,1.425,-898.79,o.WHT,null,null,10);for(const y of[.8,2.1])box(.14,.04,.12,x,y,-898.85,k.STL);C(.07,.05,.12,x,.06,-898.79,o.WHT,null,null,10)}
  /* dumpster (label faces the building) */{const dx=76,dz=-896.6,DG=M(0x2a6a3a,{roughness:.8});box(2.2,1.1,1.3,dx,.75,dz,DG);const lid=rtBox(g,2.26,.08,1.36,dx,1.34,dz,M(0x1a4a2a,{roughness:.8}));lid.rotation.x=.08;C(.03,.03,2.3,dx,1.33,dz+.68,k.STL,'x',null,8);
   for(const sx of[-.95,.95])for(const sz of[-.5,.5]){C(.1,.1,.08,dx+sx,.1,dz+sz,k.DK,'x',null,12);box(.06,.05,.12,dx+sx,.21,dz+sz,k.STL)}
   L('DARK WASTE CO.\nNO HOT ASH · NO SEEK',1.6,.5,'#2a6a3a','#f0f0e0',44,dx,.85,dz-.656,Math.PI);ob(dx-1.2,dx+1.2,dz-.75,dz+.75);spots.dumpster=[dx,dz]}
  /* propane cage: a steel frame with mesh sides, three bottles inside, a sign */{const cx=67.1,cz=-897.4,w=2.0,d=1.0,h=1.4;for(const sx of[-1,1])for(const sz of[-1,1])box(.05,h,.05,cx+sx*w/2,h/2,cz+sz*d/2,k.STL);for(const y of[.05,h-.03])for(const sz of[-1,1])box(w,.04,.04,cx,y,cz+sz*d/2,k.STL);for(const y of[.05,h-.03])for(const sx of[-1,1])box(.04,.04,d-.05,cx+sx*w/2,y,cz,k.STL);
   box(w,.03,d,cx,h+.015,cz,k.STL);box(w-.06,.04,d-.06,cx,.03,cz,k.STL);for(const sz of[-1,1])box(w-.05,h-.1,.01,cx,h/2,cz+sz*(d/2-.01),k.LINK);for(const sx of[-1,1])box(.01,h-.1,d-.08,cx+sx*(w/2-.01),h/2,cz,k.LINK);
   for(let j=0;j<3;j++){const x=cx-.55+j*.55;C(.2,.2,.9,x,.5,cz,M(0xd8d8d0,{metalness:.4,roughness:.4}),null,null,14);const top=new THREE.Mesh(new THREE.SphereGeometry(.2,14,8,0,Math.PI*2,0,Math.PI/2),M(0xd8d8d0,{metalness:.4,roughness:.4}));top.position.set(x,.95,cz);g.add(top);C(.04,.04,.12,x,1.19,cz,k.STL,null,null,8)}
   L('PROPANE\nNO SMOKING',.5,.3,'#c02020','#ffffff',50,cx,1.2,cz-d/2-.025,Math.PI);ob(cx-w/2-.05,cx+w/2+.05,cz-d/2-.05,cz+d/2+.05)}
  /* washing line: two T posts, a sagging line, four sheets on pegs (sway parts.sheets about x) */{const z=-895.6,xa=79.5,xb=85.5;for(const x of[xa,xb]){C(.04,.05,2.2,x,1.1,z,k.STL,null,null,8);box(.06,.06,.5,x,2.16,z,k.STL)}
   const sh=[];for(const sd of[-.2,.2]){const pts=[];for(let j=0;j<=8;j++){const t=j/8;pts.push([xa+(xb-xa)*t,2.16-.12*Math.sin(t*Math.PI),z+sd])}tube(pts,.006,M(0xf0f0f0),null,16)}
   [[0xf0e0c0,0],[0x60a0d8,1],[0xf0f0f0,2],[0xd86060,3]].forEach(([c,j])=>{const x=xa+.9+j*1.4,t=(x-xa)/(xb-xa),y=2.16-.12*Math.sin(t*Math.PI);const p=new THREE.Group();p.position.set(x,y,z);g.add(p);
    const s=rtBox(p,.6,.02,.42,0,-.005,0,M(c,{roughness:1}));const f=rtBox(p,.6,.7,.01,0,-.36,-.21,M(c,{roughness:1}));const b2=rtBox(p,.6,.7,.01,0,-.36,.21,M(c,{roughness:1}));for(const px of[-.22,.22])for(const sd of[-.2,.2])rtBox(p,.02,.06,.04,px,0,sd,M(0xe8c020));sh.push(p)});spots.sheets=sh}}
 return{obs,lights,doors,tvs,spots,plates:[Object.assign({},RTM.walk)]}}

/* ---- the car park, the neon sign and the lot lamps. The asphalt is one painted plane (bays, room numbers, OFFICE,
   GUESTS ONLY), with concrete wheel stops you can drive over. Motel Rd itself is the game's own road() ---- */
function rtMotelLot(g){const k=rtKit(),{B,C,rod,L,slab}=k.H(g),M=k.M,r=k.r,obs=[],lights=[],box=(w,h,d,x,y,z,m)=>rtBox(g,w,h,d,x,y,z,m);
 const{x0,x1,z0,z1}=RTM.lot,W=x1-x0,D=z1-z0,PX=30;const c=document.createElement('canvas');c.width=Math.round(W*PX);c.height=Math.round(D*PX);const x=c.getContext('2d'),cw=c.width,ch=c.height;
 /* canvas top = south (z0), so a point (wx, wz) is at ((wx-x0)*PX, (wz-z0)*PX) */const P=(wx,wz)=>[(wx-x0)*PX,(wz-z0)*PX];
 x.fillStyle='#4a4642';x.fillRect(0,0,cw,ch);for(let i=0;i<14000;i++){const v=r();x.fillStyle=v<.5?'rgba(0,0,0,'+(.08+r()*.12)+')':'rgba(255,255,255,'+(.03+r()*.06)+')';x.fillRect(r()*cw,r()*ch,1+r()*2,1+r()*2)}
 for(let i=0;i<10;i++){const[sx,sz]=P(59.5+i*3,-909.2);x.fillStyle='rgba(20,18,16,'+(.18+r()*.2)+')';x.beginPath();x.ellipse(sx+(r()-.5)*20,sz,10+r()*14,14+r()*16,r()*3,0,7);x.fill()}
 /* tyre tracks in from the road */x.strokeStyle='rgba(20,18,16,.12)';x.lineWidth=28;for(const zz of[-923.2,-920.8]){const[a,b]=P(x0,zz);x.beginPath();x.moveTo(a,b);x.quadraticCurveTo(...P(70,zz+.5),...P(80,-915));x.stroke()}
 /* bay lines: 11 lines x 58..88, from the kerb 5.5 m out */x.fillStyle='#ece8dc';for(let i=0;i<=10;i++){const[a,b]=P(58+i*3,-912.4);x.fillRect(a-1.5,b,3,5.5*PX)}
 /* room numbers at the bay ends (read from the aisle, facing north), OFFICE in the first two */
 const word=(t,wx,wz,rot,fs,col)=>{const[a,b]=P(wx,wz);x.save();x.translate(a,b);x.rotate(rot);x.fillStyle=col||'#ece8dc';x.font='bold '+fs+'px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText(t,0,0);x.restore()};
 for(let i=0;i<10;i++){const t=i<2?'OFFICE':String(RTM.rooms[(i-2)>>1]);word(t,59.5+i*3,-911.3,Math.PI,i<2?22:40)}
 word('MOTEL 13 GUESTS ONLY',63,-922,Math.PI/2,40,'#f0c020');
 const tx=new THREE.CanvasTexture(c);tx.anisotropy=8;const lot=new THREE.Mesh(new THREE.PlaneGeometry(W,D),M(0xffffff,{map:tx,roughness:.95,polygonOffset:true,polygonOffsetUnits:-2}));lot.rotation.x=-Math.PI/2;lot.position.set((x0+x1)/2,.03,(z0+z1)/2);lot.userData.noSeam=true;g.add(lot);
 /* wheel stops */const WS=M(0xd8d2c4,{roughness:.9});for(let i=0;i<10;i++){box(1.7,.12,.22,59.5+i*3,.06,-907.6,WS)}
 /* the lot's edge: a concrete strip along the east side and the south side east of the road mouth */box(.3,.05,D,x1+.15,.025,(z0+z1)/2,rtMotelKit().CONC);
 /* two lot lamps on the south edge: a tall pole, an arm reaching into the lot, a shoebox head */
 for(const lx of[68,82]){const lz=-926.2;C(.08,.12,6.2,lx,3.1,lz,k.LAMPG,null,null,10);C(.25,.25,.1,lx,.05,lz,k.LAMPG,null,null,12);box(.08,.08,1.5,lx,6.08,lz+.71,k.LAMPG);box(.4,.18,.7,lx,6.05,lz+1.6,k.LAMPG);box(.34,.02,.6,lx,5.95,lz+1.6,k.LENS);rod([lx,5.4,lz],[lx,6.06,lz+.9],.025,k.LAMPG);
  obs.push({x0:lx-.15,x1:lx+.15,z0:lz-.15,z1:lz+.15});lights.push([lx,5.7,lz+1.6])}
 /* the P sign on the east edge, facing west into the lot */{const sx=90.7,sz=-914;C(.04,.04,2.4,sx,1.2,sz,k.STL,null,null,8);L('P\nMOTEL GUESTS\nONLY',.7,.9,'#1a4aa0','#ffffff',60,sx-.03,2.0,sz,-Math.PI/2);L('',.7,.9,'#8a8f92',null,10,sx+.03,2.0,sz,Math.PI/2);obs.push({x0:sx-.1,x1:sx+.1,z0:sz-.1,z1:sz+.1})}
 /* ---- the neon sign at the lot entrance, by Motel Rd: a concrete foot, a steel pole, a big double-sided MOTEL 13
    board (faces west to Route 13 and east) with a pink tube round it, VACANCY under it, and a gold star on top.
    neon: the meshes to flicker (the base game's anim sets material.opacity), vac: the VACANCY words ---- */
 const[nx,nz]=RTM.neon,neon=[],vac=[];
 box(1.2,.5,1.2,nx,.25,nz,rtMotelKit().CONC);C(.16,.2,7.3,nx,4.15,nz,M(0x8a3a5a,{metalness:.4,roughness:.5}),null,null,14);obs.push({x0:nx-.6,x1:nx+.6,z0:nz-.6,z1:nz+.6});
 box(.44,2.2,4.4,nx,7.0,nz,M(0x1a0c14,{roughness:.6}));box(.5,.08,4.5,nx,8.14,nz,M(0x8a3a5a,{metalness:.4,roughness:.5}));box(.5,.08,4.5,nx,5.86,nz,M(0x8a3a5a,{metalness:.4,roughness:.5}));
 const TUBE=new THREE.MeshBasicMaterial({color:0xff60c0});
 for(const sd of[-1,1]){const n=rtNeon('MOTEL 13',4.1,1.5,'#ff40a0',null,170);n.position.set(nx+sd*.222,7.2,nz);n.rotation.y=sd*Math.PI/2;g.add(n);neon.push(n);
  const n2=rtNeon('· KING BEDS · COLOR TV · ICE ·',4.0,.32,'#60e0ff',null,40);n2.position.set(nx+sd*.222,6.24,nz);n2.rotation.y=sd*Math.PI/2;g.add(n2);
  for(const[w,h,y,z]of[[.03,.03,7.98,0],[.03,.03,6.02,0]])box(.02,.03,4.2,nx+sd*.225,y,nz,TUBE);for(const z of[-2.08,2.08])box(.02,1.96,.03,nx+sd*.225,7.0,nz+z,TUBE)}
 box(.44,.7,2.9,nx,5.2,nz,M(0x1a0c14,{roughness:.6}));for(const sd of[-1,1]){const v=rtNeon('VACANCY',2.7,.55,'#40ff80',null,120);v.position.set(nx+sd*.222,5.2,nz);v.rotation.y=sd*Math.PI/2;g.add(v);vac.push(v)}
 {const pts=[];for(let i=0;i<10;i++){const a=i/10*Math.PI*2+Math.PI/2,rr=i%2?.32:.75;pts.push([Math.cos(a)*rr,Math.sin(a)*rr])}const st=slab(pts,.12,new THREE.MeshBasicMaterial({color:0xffd040}),nx,8.85,nz,Math.PI/2);C(.04,.04,.25,nx,8.305,nz,k.STL,null,null,8)}
 lights.push([nx+1.2,7,nz]);
 return{obs,lights,neon,vac,cars:[[68.5,-909.6,0],[80.5,-909.6,0]],mapR:[[x0,x1,z0,z1,'#4a4642'],[RTM.walk.x0,RTM.walk.x1,RTM.walk.z0,RTM.walk.z1,'#b4afa6'],[55.9,88.1,-898.9,-894.6,'#a3937a']]}}

/* ---- the pool (stays at x 92.5..99.5, z -905.5..-901.5) on a concrete deck: a tiled coping, painted depth marks,
   a ladder, two loungers with towels, an umbrella and the pool rules ---- */
function rtMotelPool(g){const k=rtKit(),o=rtMotelKit(),{B,C,rod,L,tube}=k.H(g),M=k.M,r=k.r,obs=[],box=(w,h,d,x,y,z,m)=>rtBox(g,w,h,d,x,y,z,m);
 const{x0,x1,z0,z1}=RTM.pool,xc=(x0+x1)/2,zc=(z0+z1)/2;
 box(11,.06,8,96,.03,-903.5,o.CONC);
 /* the water: shallow (light) at the west end, deep (dark) at the east, a lane line on the floor, sun ripples */
 const wt=k.tex(512,256,(c,w,h)=>{const gr=c.createLinearGradient(0,0,w,0);gr.addColorStop(0,'#7ad0e8');gr.addColorStop(.55,'#3aa0c8');gr.addColorStop(1,'#1a6a98');c.fillStyle=gr;c.fillRect(0,0,w,h);c.fillStyle='rgba(20,40,80,.35)';c.fillRect(20,h/2-6,w-40,12);c.fillRect(w-40,h/2-30,12,60);
  c.strokeStyle='rgba(255,255,255,.22)';c.lineWidth=2;for(let i=0;i<70;i++){c.beginPath();const x=r()*w,y=r()*h;c.moveTo(x,y);c.bezierCurveTo(x+8,y-6,x+18,y+6,x+26,y);c.stroke()}});
 box(x1-x0,.02,z1-z0,xc,.07,zc,M(0xffffff,{map:wt,roughness:.08,metalness:.1}));
 /* coping: north and south full length, east and west between; tiles on the inside face, a white cap */
 const CAP=M(0xf0ece2,{roughness:.7}),TL=o.TILE;
 box(x1-x0+.7,.1,.35,xc,.11,z0-.175,[CAP,CAP,CAP,CAP,TL,CAP]);box(x1-x0+.7,.1,.35,xc,.11,z1+.175,[CAP,CAP,CAP,CAP,CAP,TL]);box(.35,.1,z1-z0,x0-.175,.11,zc,[TL,CAP,CAP,CAP,CAP,CAP]);box(.35,.1,z1-z0,x1+.175,.11,zc,[CAP,TL,CAP,CAP,CAP,CAP]);
 const mark=(t,x,z,ry)=>{const m=L(t,.5,.22,null,'#1a3a6a',60,x,.161,z,0);m.rotation.set(-Math.PI/2,0,ry)};mark('3 FT',x0+.6,z0-.175,Math.PI);mark('13 FT',x1-.6,z0-.175,Math.PI);mark('3 FT',x0+.6,z1+.175,0);mark('13 FT',x1-.6,z1+.175,0);
 /* the ladder at the deep end, south side */for(const sx of[x1-.95,x1-.45])tube([[sx,.07,z0+.14],[sx,.75,z0+.12],[sx,.92,z0-.02],[sx,.92,z0-.2],[sx,.16,z0-.22]],.025,k.STL,null,20);
 /* loungers on the north deck, facing south (back at the north end), towels */
 for(const[lx,tc]of[[94.2,0x2a8ad8],[97.8,0xe86a3a]]){const lz=-900.25,W=M(0xf0f0f0,{roughness:.5});box(.62,.08,1.2,lx,.36,lz-.25,W);const bk=rtBox(g,.62,.06,.75,lx,.66,lz+.62,W);bk.rotation.x=-.75;for(const sx of[-.27,.27])for(const sz of[-.8,.3])box(.04,.3,.04,lx+sx,.21,lz+sz,k.STL);
  box(.56,.015,1.1,lx,.405,lz-.28,M(tc,{roughness:1}));obs.push({x0:lx-.35,x1:lx+.35,z0:lz-.9,z1:lz+.9})}
 /* umbrella between them: a base, a pole, a striped canopy */{const ux=96,uz=-900.4;C(.25,.28,.1,ux,.11,uz,M(0x8a8a8a),null,null,14);C(.025,.025,2.3,ux,1.31,uz,o.WHT,null,null,8);
  const ut=k.tex(256,64,(c,w,h)=>{for(let i=0;i<8;i++){c.fillStyle=i%2?'#f2eee2':'#2a9a98';c.fillRect(i*w/8,0,w/8,h)}});const can=new THREE.Mesh(new THREE.ConeGeometry(1.3,.45,16,1,true),M(0xffffff,{map:ut,side:THREE.DoubleSide,roughness:.9}));can.position.set(ux,2.38,uz);g.add(can);C(.04,.04,.1,ux,2.65,uz,o.WHT,null,null,8)}
 /* the pool rules on a post at the south-west corner, facing the lot */{const sx=91.2,sz=-907.1;C(.035,.035,1.9,sx,.95,sz,k.STL,null,null,8);L('MOTEL 13 POOL\nNO LIFEGUARD · NO DIVING\nNO RUNNING · NO SEEK\nSWIM AT YOUR OWN RISK',.9,.6,'#f2eee2','#1a3a6a',36,sx,1.6,sz-.03,Math.PI);L('',.9,.6,'#8a8f92',null,10,sx,1.6,sz+.03,0);obs.push({x0:sx-.1,x1:sx+.1,z0:sz-.1,z1:sz+.1})}
 obs.push({x0,x1,z0,z1});
 return{obs,plates:[{x0:90.5,x1:101.5,z0:-907.5,z1:-899.5,y:.06}]}}

/* =====================================================================================================
   batch 4: the DRIVE-IN (centred (-40, -930), west of Route 13). A gravel lot x -52..-20, z -942..-908 reached by
   the drive along z -912 (the game's own road, x -20..-3.5). The screen keeps its size and place (14.5 x 7, centre
   (-40, 6, -938), facing north) and gets a timber tower behind it; speaker posts stand in two rows curved round the
   screen; a ticket booth at the lot entrance, a marquee by Route 13; the snack bar and projector booth remodelled in
   place (same footprints, so their props and obstacles stay).
   ===================================================================================================== */
const RTD={cx:-40,cz:-930,lot:{x0:-52,x1:-20,z0:-942,z1:-908},scr:{x:-40,y:6,z:-938,w:14.5,h:7,d:.3},
 snack:[-28,-920],booth:[-40,-916],ticket:[-17.5,-906.9],marquee:[-13,-919.5],
 /* the speaker rows: arcs round (-40, -938), radius 15 and 22; posts sit between the parking bays (bays 3.5 m wide,
    centred on x -51, -47.5, -44, -40.5, -37, -33.5, -30; the two old cars stay in the -44 and -37 bays) */
 rows:[15,22],postX:[-49.25,-45.75,-42.25,-38.75,-35.25,-31.75]};
function rtDriveKit(){const k=rtKit();if(k._dri)return k._dri;const M=k.M,r=k.r,o={};
 o.TIM=M(0xffffff,{roughness:.9,map:k.tex(64,256,(c,w,h)=>{c.fillStyle='#7a5636';c.fillRect(0,0,w,h);for(let i=0;i<70;i++){c.fillStyle='rgba(40,24,10,'+(.12+r()*.22)+')';c.fillRect(r()*w,r()*h,1,10+r()*60)}c.fillStyle='rgba(255,230,190,.06)';for(let i=0;i<30;i++)c.fillRect(r()*w,r()*h,2,30)})});
 o.TIMD=M(0x5a3e26,{roughness:.9});o.SCR=M(0xf4f2ec,{roughness:.95,map:k.tex(256,128,(c,w,h)=>{c.fillStyle='#f4f2ec';c.fillRect(0,0,w,h);c.fillStyle='rgba(120,120,110,.18)';for(let x=0;x<w;x+=32)c.fillRect(x,0,1,h);for(let i=0;i<300;i++){c.fillStyle='rgba(150,140,120,.06)';c.fillRect(r()*w,r()*h,3,3)}})});
 o.GRN=M(0x2f5a3a,{roughness:.8});o.RED=M(0xc8302a,{roughness:.6});o.CRM=M(0xf4ead2,{roughness:.8});o.BLK=M(0x1c1c1e,{roughness:.6});
 o.STRIPE=M(0xffffff,{roughness:.7,map:k.tex(128,32,(c,w,h)=>{for(let i=0;i<8;i++){c.fillStyle=i%2?'#f4ead2':'#c8302a';c.fillRect(i*w/8,0,w/8,h)}})});
 o.BLOCK=M(0xffffff,{roughness:.95,map:k.tex(128,128,(c,w,h)=>{c.fillStyle='#9a958a';c.fillRect(0,0,w,h);c.fillStyle='rgba(60,56,50,.5)';for(let y=0;y<h;y+=32){c.fillRect(0,y,w,2);for(let x=((y/32)%2)*32;x<w;x+=64)c.fillRect(x,y,2,32)}for(let i=0;i<600;i++){c.fillStyle=r()<.5?'rgba(60,56,50,.12)':'rgba(230,226,216,.12)';c.fillRect(r()*w,r()*h,2,2)}})});
 o.BLOCK.userData.t=1.6;o.STRIPE.userData.t=1;o.TIM.userData.t=2;
 return k._dri=o}
/* the lot, the screen tower, the speaker rows, the ticket booth and the marquee.
   Returns {obs, lights, posts:[[x,z]...], spots:{ticket}, parts:{bulbs}} */
function rtDriveIn(g){const k=rtKit(),o=rtDriveKit(),{B,C,rod,L,tube}=k.H(g),M=k.M,r=k.r,obs=[],lights=[],box=(w,h,d,x,y,z,m)=>rtBox(g,w,h,d,x,y,z,m);const ob=(x0,x1,z0,z1)=>obs.push({x0,x1,z0,z1});
 const{x0,x1,z0,z1}=RTD.lot,S=RTD.scr;
 /* ---- the gravel lot (1.5 cm up), with tyre-worn patches along the rows ---- */
 {const m=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0,z1-z0),k.GRAVEL.clone());m.material.map=k.GRAVEL.map.clone();m.material.map.needsUpdate=true;m.material.map.repeat.set(3,4);m.material.polygonOffset=true;m.material.polygonOffsetUnits=-1;
  m.rotation.x=-Math.PI/2;m.position.set((x0+x1)/2,.015,(z0+z1)/2);m.userData.noSeam=true;g.add(m)}
 /* ---- the screen: the white panel (same size and place as before; the game's picture plane stays 5 cm in front),
    a dark skirt board under it, a cap, and behind it a timber tower: four posts, girts, cross braces in every bay and
    a raking strut to the ground behind each post ---- */
 box(S.w,S.h,S.d,S.x,S.y,S.z,[o.TIMD,o.TIMD,o.TIMD,o.TIMD,o.SCR,o.TIMD]);
 box(S.w+.4,.18,.55,S.x,S.y+S.h/2+.09,S.z-.05,o.TIMD);for(const sd of[-1,1])box(.2,S.h,.42,S.x+sd*(S.w/2+.1),S.y,S.z-.05,o.TIMD);
 {const sk=S.y-S.h/2;box(S.w+.4,sk,.12,S.x,sk/2,S.z+.06,o.GRN);for(let x=-7;x<=7;x+=1)box(.04,sk-.02,.02,S.x+x,sk/2-.01,S.z+.13,o.TIMD);
  L('PLEASE HANG UP YOUR SPEAKER BEFORE YOU DRIVE AWAY',8,.5,null,'#f4ead2',40,S.x,1.5,S.z+.141,0)}
 const PZ=S.z-S.d/2-.15,PXs=[-47,-42.4,-37.6,-33],TOP=S.y+S.h/2+.3;
 for(const x of PXs){box(.3,TOP,.3,x,TOP/2,PZ,o.TIM);rod([x,.0,-942.2],[x,7.2,PZ-.15],.11,o.TIM,null,8);box(.6,.2,.6,x,.1,-942.2,M(0x8a857a));rod([x,4.6,PZ-.15],[x,3.6,-940.325],.07,o.TIM,null,6)}
 const GY=[2.6,5.2,7.8,TOP-.15];for(const y of GY)box(PXs[3]-PXs[0]+.6,.22,.2,S.x,y,PZ-.25,o.TIM);
 for(let i=0;i<3;i++)for(let j=0;j<3;j++){const xa=PXs[i],xb=PXs[i+1],ya=GY[j],yb=GY[j+1];rod([xa,ya,PZ-.37],[xb,yb,PZ-.37],.05,o.TIM,null,6);rod([xb,ya,PZ-.37],[xa,yb,PZ-.37],.05,o.TIM,null,6)}
 /* a ladder up the middle post to a small work platform at the top girt */
 {const lx=-40;for(const sd of[-.22,.22])box(.06,TOP-.4,.06,lx+sd,(TOP-.4)/2,PZ-.55,M(0x8a8f92,{metalness:.5,roughness:.5}));for(let y=.4;y<TOP-.5;y+=.32)box(.44,.03,.03,lx,y,PZ-.55,M(0x8a8f92,{metalness:.5,roughness:.5}));
  for(const sd of[-.22,.22])box(.05,.06,.3,lx+sd,TOP-.42,PZ-.41,M(0x8a8f92,{metalness:.5}));ob(lx-.3,lx+.3,PZ-.65,PZ-.45)}
 ob(S.x-S.w/2-.2,S.x+S.w/2+.2,S.z-.4,S.z+.15);for(const x of PXs)ob(x-.35,x+.35,-942.5,-941.9);
 /* ---- the speaker posts: a short steel pipe in a concrete collar, a junction box with the row and post number,
    two speakers on hooks (one for the car each side) and their coiled cables ---- */
 const posts=[],PM=M(0x8a8f92,{metalness:.5,roughness:.45}),SPK=M(0x3a4a3a,{roughness:.6}),GRL=M(0x202420,{roughness:.8});
 RTD.rows.forEach((R,ri)=>{let n=0;for(const x of RTD.postX){const dx=x-RTD.cx,z=S.z+Math.sqrt(R*R-dx*dx);
   if(Math.abs(x-RTD.booth[0])<3&&Math.abs(z-RTD.booth[1])<3)continue;n++;posts.push([x,z]);
   const p=new THREE.Group();p.position.set(x,0,z);p.rotation.y=Math.atan2(dx,z-S.z);g.add(p);const h=k.H(p);
   h.C(.14,.16,.12,0,.06,0,M(0xa8a398,{roughness:.95}),null,null,12);h.C(.045,.045,1.2,0,.66,0,PM,null,null,8);h.B(.24,.2,.16,0,1.36,0,PM);h.C(.05,.05,.03,0,1.475,0,PM,null,null,8);
   const lab=h.L('ROW '+(ri+1)+' · '+n,.2,.1,'#e8e0c8','#202020',40,0,1.36,.086,0);const lab2=h.L('ROW '+(ri+1)+' · '+n,.2,.1,'#e8e0c8','#202020',40,0,1.36,-.086,Math.PI);
   for(const sd of[-1,1]){h.B(.08,.03,.03,sd*.15,1.25,0,PM);h.B(.1,.24,.3,sd*.24,1.12,0,SPK);const gr=new THREE.Mesh(new THREE.CircleGeometry(.09,16),GRL);gr.position.set(sd*.295,1.13,0);gr.rotation.y=sd*Math.PI/2;p.add(gr);
    h.tube([[sd*.24,1.0,0],[sd*.21,.84,.03],[sd*.12,.8,.035],[sd*.06,1.0,.02],[sd*.05,1.27,0]],.012,k.DK,null,16)}
   obs.push({x0:x-.2,x1:x+.2,z0:z-.2,z1:z+.2})}});
 /* ---- the ticket booth at the lot entrance, north side of the drive: a small white booth, glass all round above a
    panelled base, a red roof overhang, TICKETS on the roof, a hatch window on the drive side ---- */
 {const[tx,tz]=RTD.ticket,W=1.8,D=1.4,H=2.4;box(W+.8,.12,D+.8,tx,.06,tz,rtMotelKit().CONC);
  box(W,1.0,D,tx,.62,tz,o.CRM);for(const sx of[-1,1])for(const sz of[-1,1])box(.08,H-1.12,.08,tx+sx*(W/2-.04),1.12+(H-1.12)/2,tz+sz*(D/2-.04),o.CRM);
  for(const[w,d,x,z]of[[W-.16,.02,tx,tz-D/2+.04],[W-.16,.02,tx,tz+D/2-.04],[.02,D-.16,tx-W/2+.04,tz],[.02,D-.16,tx+W/2-.04,tz]])box(w,H-1.16,d,x,1.12+(H-1.12)/2,z,rtMotelKit().GLASS);
  box(W+.06,.06,D+.06,tx,1.13,tz,o.CRM);box(W+.7,.2,D+.7,tx,H+.2,tz,o.RED);box(W+.1,.1,D+.1,tx,H+.05,tz,o.CRM);
  /* the hatch: a sill outside and a little counter; a stool, the till and a roll of tickets inside */
  box(.9,.04,.3,tx,1.15,tz-D/2-.13,o.CRM);box(1.2,.05,.35,tx,1.15,tz-D/2+.25,o.TIMD);box(.3,.14,.22,tx-.3,1.24,tz-D/2+.22,o.BLK);C(.05,.05,.08,tx+.15,1.22,tz-D/2+.22,o.RED,'x',null,10);
  const sg=new THREE.Group();sg.position.set(tx,H+.3,tz);g.add(sg);const sh=k.H(sg);sh.B(1.6,.7,.12,0,.35,0,o.RED);sh.L('TICKETS',1.5,.42,'#c8302a','#f4ead2',60,0,.44,-.066,Math.PI);sh.L('TICKETS',1.5,.42,'#c8302a','#f4ead2',60,0,.44,.066,0);
  ob(tx-W/2,tx+W/2,tz-D/2,tz+D/2);lights.push([tx,H-.2,tz-D/2-.6])}
 /* ---- the marquee by Route 13 (south of the drive mouth, set back from the shoulder): two steel posts on concrete
    feet, a neon DRIVE-IN header and a letter board TONIGHT: D O O R S ringed with bulbs, both faces (north and south,
    so drivers both ways can read it). parts.bulbs: the bulb material (chase it by swapping its map offset, or leave it) ---- */
 const bulbs=[];{const[mx,mz]=RTD.marquee,BW=5.2,PM2=M(0x2a2a2e,{metalness:.5,roughness:.4});
  for(const sd of[-1,1]){box(.6,.3,.6,mx+sd*2.3,.15,mz,rtMotelKit().CONC);C(.1,.12,6.7,mx+sd*2.3,3.65,mz,PM2,null,null,10);ob(mx+sd*2.3-.3,mx+sd*2.3+.3,mz-.3,mz+.3)}
  box(BW,1.3,.4,mx,6.15,mz,o.BLK);box(BW,1.7,.4,mx,4.6,mz,o.CRM);box(BW+.12,.1,.5,mx,6.85,mz,o.RED);box(BW+.12,.1,.5,mx,3.7,mz,o.RED);box(BW+.12,.06,.46,mx,5.475,mz,o.RED);
  const bc=document.createElement('canvas');bc.width=520;bc.height=170;const x=bc.getContext('2d');x.fillStyle='#f4ead2';x.fillRect(0,0,520,170);x.fillStyle='#1c1c1e';x.textAlign='center';x.font='bold 30px Arial';x.fillText('TONIGHT',260,48);x.font='bold 62px Arial';x.fillText('D O O R S',260,112);x.font='bold 22px Arial';x.fillText('ALSO SHOWING: RUN.',260,150);
  for(let i=0;i<26;i++){for(const y of[10,160]){x.fillStyle='#ffd860';x.beginPath();x.arc(10+i*19.2,y,5,0,7);x.fill()}}for(let j=0;j<8;j++)for(const xx of[10,510]){x.beginPath();x.arc(xx,10+j*21.4,5,0,7);x.fill()}
  const bt=new THREE.CanvasTexture(bc);bt.anisotropy=8;const BM=new THREE.MeshBasicMaterial({map:bt});bulbs.push(BM);
  for(const sd of[-1,1]){const p=new THREE.Mesh(new THREE.PlaneGeometry(BW-.1,1.6),BM);p.position.set(mx,4.6,mz+sd*.205);p.rotation.y=sd>0?0:Math.PI;g.add(p);
   const n=rtNeon('★ DRIVE-IN ★',BW-.2,1.15,'#ff5030','#1c1c1e',120);n.position.set(mx,6.15,mz+sd*.205);n.rotation.y=sd>0?0:Math.PI;g.add(n)}
  lights.push([mx,5,mz-1.2],[mx,5,mz+1.2])}
 return{obs,lights,posts,spots:{ticket:[RTD.ticket[0],RTD.ticket[1]-1.6]},parts:{bulbs},mapR:[[x0,x1,z0,z1,'#a3937a']]}}
/* the snack bar (centre (-28, -920), 4 x 3 m, serving window to the south) and the projector booth (centre
   (-40, -916), 2.4 m block, lens to the south, door to the north), remodelled on their old footprints */
function rtDriveHuts(g){const k=rtKit(),o=rtDriveKit(),{B,C,rod,L,tube}=k.H(g),M=k.M,r=k.r,obs=[],lights=[],box=(w,h,d,x,y,z,m)=>rtBox(g,w,h,d,x,y,z,m);
 /* ---- snack bar: cream walls with a red base band, a serving window with a counter and a striped awning, a
    popcorn machine and a menu board inside, SNACKS over the window, a giant popcorn box on the roof ---- */
 {const[bx,bz]=RTD.snack,W=4,D=3,H=2.6,ZF=bz-D/2,T=.15,G=rtMotelKit().GLASS;
  /* walls: the south wall has the window x bx-1.3..bx+1.3, y 1.0..2.1; the inside is a dim room */
  const IN=M(0x6a5a48,{roughness:.9}),wl=(w,h,d,x,y,z,mi)=>box(w,h,d,x,y,z,mi);
  wl(.7,H,T,bx-1.65,H/2,ZF+T/2,[o.CRM,o.CRM,o.CRM,o.CRM,IN,o.CRM]);wl(.7,H,T,bx+1.65,H/2,ZF+T/2,[o.CRM,o.CRM,o.CRM,o.CRM,IN,o.CRM]);wl(2.6,1.0,T,bx,.5,ZF+T/2,[o.CRM,o.CRM,o.CRM,o.CRM,IN,o.CRM]);wl(2.6,H-2.1,T,bx,(H+2.1)/2,ZF+T/2,[o.CRM,o.CRM,o.CRM,o.CRM,IN,o.CRM]);
  box(W,H,T,bx,H/2,bz+D/2-T/2,[o.CRM,o.CRM,o.CRM,o.CRM,o.CRM,IN]);for(const sd of[-1,1])box(T,H,D-2*T,bx+sd*(W/2-T/2),H/2,bz,sd>0?[o.CRM,IN,o.CRM,o.CRM,o.CRM,o.CRM]:[IN,o.CRM,o.CRM,o.CRM,o.CRM,o.CRM]);
  box(W-2*T,.03,D-2*T,bx,.015,bz,M(0x8a7a66));
  /* red base band all round (a skin 1 cm proud), and the roof slab */
  for(const[w,d,x,z]of[[W+.02,.01,bx,ZF-.005],[W+.02,.01,bx,bz+D/2+.005],[.01,D,bx-W/2-.005,bz],[.01,D,bx+W/2+.005,bz]])box(w,.5,d,x,.25,z,o.RED);
  box(W+.4,.2,D+.4,bx,H+.1,bz,o.RED);box(W+.44,.04,D+.44,bx,H+.22,bz,o.CRM);
  /* window: a frame, a sliding glass half open, the counter outside on brackets */
  for(const x of[bx-1.3,bx+1.3])box(.06,1.04,.1,x+(x<bx?.03:-.03),1.52,ZF+.05,o.CRM);box(2.6,.06,.1,bx,2.07,ZF+.05,o.CRM);box(1.25,1.02,.01,bx+.6,1.56,ZF+.08,G);
  box(2.9,.06,.42,bx,1.03,ZF-.21,o.TIMD);for(const sx of[-1.1,1.1])rod([bx+sx,.72,ZF],[bx+sx,1.0,ZF-.36],.025,k.STL,null,6);
  /* the striped awning, sloping out over the counter, on two arms */
  {const aw=rtBox(g,3.2,.03,1.1,bx,2.15,ZF-.5,o.STRIPE);aw.rotation.x=-.32;box(3.2,.18,.02,bx,1.89,ZF-1.03,o.STRIPE);for(const sx of[-1.5,1.5])rod([bx+sx,1.8,ZF],[bx+sx,1.97,ZF-1.0],.02,k.STL,null,6)}
  /* SNACKS sign on the wall above the awning */{const s=L('SNACKS · POPCORN 3 🪙 · GWEEN SODA',3.4,.26,'#c8302a','#fff4d0',50,bx,2.46,ZF-.005,Math.PI)}
  /* inside: the popcorn machine (glass box, yellow corn), a soda fountain, a menu board on the back wall */
  {const pmx=bx-.9,pmz=bz+.35;box(.6,.8,.5,pmx,.4,pmz,o.RED);box(.56,.6,.46,pmx,1.1,pmz,G);box(.5,.29,.4,pmx,.955,pmz,M(0xffe070,{roughness:1,emissive:0x403000}));box(.62,.08,.52,pmx,1.44,pmz,o.RED);
   box(.7,.9,.45,bx+.8,.45,bz+.9,M(0xc8ccd0,{metalness:.4,roughness:.4}));for(let i=0;i<3;i++)C(.025,.025,.12,bx+.6+i*.2,.93,bz+.9,k.STL,null,null,6);
   const mb=L('MENU\nPOPCORN ....... 3\nGWEEN SODA ... 2\nHOT DOG ........ 4\nMYSTERY BOX .. 13',1.2,.8,'#1c1c1e','#f4ead2',36,bx-.2,1.7,bz+D/2-T-.006,Math.PI)}
  /* a giant popcorn box on the roof: a striped tapered box, corn spilling over the top */
  {const pbx=bx+.8,pbz=bz+.2,H2=1.2,yb=H+.24;const pb=new THREE.Mesh(new THREE.CylinderGeometry(.62,.45,H2,4,1,true),Object.assign(o.STRIPE.clone(),{side:THREE.DoubleSide}));pb.material.map=o.STRIPE.map.clone();pb.material.map.needsUpdate=true;pb.material.map.repeat.set(2,1);pb.rotation.y=Math.PI/4;pb.position.set(pbx,yb+H2/2,pbz);g.add(pb);
   box(.64,.04,.64,pbx,yb+.02,pbz,o.RED);const CO=M(0xffe9a0,{roughness:1});for(let i=0;i<22;i++){const a=r()*Math.PI*2,rr=r()*.4,s=.12+r()*.08;const b=new THREE.Mesh(new THREE.IcosahedronGeometry(s,0),CO);b.position.set(pbx+Math.cos(a)*rr,yb+H2-.04+r()*.18*(1-rr/.45),pbz+Math.sin(a)*rr);b.rotation.set(r()*3,r()*3,0);g.add(b)}
   const lid=new THREE.Mesh(new THREE.CylinderGeometry(.58,.58,.06,4),CO);lid.rotation.y=Math.PI/4;lid.position.set(pbx,yb+H2-.05,pbz);g.add(lid)}
  /* back door (north) */box(.9,2.0,.04,bx+1.1,1.0,bz+D/2+.025,M(0xc8302a,{roughness:.6}));C(.03,.03,.05,bx+.8,1.0,bz+D/2+.05,k.STL,'z',null,8);
  obs.push({x0:bx-W/2-.1,x1:bx+W/2+.1,z0:ZF-.1,z1:bz+D/2+.1})}
 /* ---- projector booth: a block hut with a flat roof and a drip edge, the projector housing poking out of a port in
    the south wall (the lens where the game's beam starts), a second port, a steel door on the north side with
    PROJECTION · KEEP OUT, a roof vent and a film-reel badge on the east wall ---- */
 {const[px,pz]=RTD.booth,S=2.4;box(S,S,S,px,S/2,pz,o.BLOCK);box(S+.3,.16,S+.3,px,S+.08,pz,M(0x5a5650,{roughness:.9}));box(S+.34,.06,S+.34,px,S+.19,pz,o.CRM);
  for(const dx of[0,-.75])box(dx?.34:.62,dx?.26:.5,.04,px+dx,2.0,pz-S/2-.02,o.BLK);
  box(.5,.4,.4,px,2.0,pz-S/2-.15,M(0x2a2a30,{metalness:.4,roughness:.5}));const lens=C(.18,.22,.3,px,2.0,pz-1.65,M(0x1a1a2a,{metalness:.5,roughness:.2}),'z',null,14);C(.14,.14,.01,px,2.0,pz-1.805,M(0x8ab0ff,{emissive:0x2040a0,roughness:.1}),'z',null,14);
  box(.9,1.95,.05,px+.5,.98,pz+S/2+.025,M(0x6a6a70,{metalness:.5,roughness:.5}));C(.03,.03,.06,px+.15,1.0,pz+S/2+.06,k.STL,'z',null,8);L('PROJECTION\nKEEP OUT',.6,.3,'#c02020','#ffffff',50,px+.5,1.55,pz+S/2+.056,0);
  C(.12,.12,.5,px-.6,S+.47,pz+.4,k.STL,null,null,12);C(.18,.18,.06,px-.6,S+.75,pz+.4,k.STL,null,null,12);
  const fr=k.tex(128,128,(c,w,h)=>{c.clearRect(0,0,w,h);c.fillStyle='#2a2a2e';c.beginPath();c.arc(64,64,60,0,7);c.fill();c.fillStyle='#c8c8c8';for(let i=0;i<5;i++){const a=i/5*Math.PI*2;c.beginPath();c.arc(64+Math.cos(a)*32,64+Math.sin(a)*32,13,0,7);c.fill()}c.beginPath();c.arc(64,64,8,0,7);c.fill()});
  const reel=new THREE.Mesh(new THREE.PlaneGeometry(.8,.8),M(0xffffff,{map:fr,transparent:true,alphaTest:.5}));reel.position.set(px+S/2+.006,1.5,pz);reel.rotation.y=Math.PI/2;g.add(reel);
  obs.push({x0:px-1.3,x1:px+1.3,z0:pz-1.3,z1:pz+1.3})}
 return{obs,lights}}

/* =====================================================================================================
   batch 5: the DESERT BUS DEPOT and the WATER TOWER.
   The Desert Bus parks at (-84, -990) facing south (32 m long, 5.4 m wide: x -86.7..-81.3, z -1006..-974), its doors
   on the east side; the trip starts through the arch at z -1022 (x -91..-77). The depot building stands east of the
   bus (x -78..-64, z -1000..-978) with a raised platform and a canopy along the bus's door side; a concrete apron
   under the bus and round the arch, an entrance lane south to Depot Rd (the game's road along z -1045).
   ===================================================================================================== */
const RTB={bus:[-84,-990],az:-1022,bld:{x0:-78,x1:-64,z0:-1000,z1:-978,H:4.2},plat:{x0:-81.1,x1:-78.015,z0:-1005,z1:-976,y:.25},
 apron:[[-94,-62,-1030,-966],[-72,-62,-1049,-1030]],tower:{x:58,z:-1060,top:11.2,F:3.4,T:2.1}};
function rtDepot(g){const k=rtKit(),o=rtMotelKit(),d=rtDriveKit(),{B,C,rod,L,tube,slab}=k.H(g),M=k.M,r=k.r,obs=[],lights=[],box=(w,h,dd,x,y,z,m)=>rtBox(g,w,h,dd,x,y,z,m);const ob=(x0,x1,z0,z1)=>obs.push({x0,x1,z0,z1});
 const OR=M(0xc86a1a,{roughness:.6}),ORD=M(0x9a4a12,{roughness:.6}),AL=M(0xb8bcc0,{metalness:.6,roughness:.35}),G=o.GLASS,CONC=o.CONC,YL=M(0xe8c020,{roughness:.6});
 const{x0,x1,z0,z1,H}=RTB.bld,T=.25;
 /* ---- the apron: concrete slabs (3 m joints) under the bus, round the arch, and a lane down to Depot Rd; a yellow
    BUS ONLY box round the bus's spot ---- */
 for(const[a,b,c,e]of RTB.apron){const m=CONC.clone();m.map=CONC.map.clone();m.map.needsUpdate=true;m.map.repeat.set((b-a)/3,(e-c)/3);const p=new THREE.Mesh(new THREE.PlaneGeometry(b-a,e-c),m);p.rotation.x=-Math.PI/2;p.position.set((a+b)/2,.03,(c+e)/2);p.userData.noSeam=true;g.add(p)}
 {const bay=rtPaint(k,7,34,(c,w,h)=>{c.clearRect(0,0,w,h);c.strokeStyle='#e8c020';c.lineWidth=5;c.setLineDash([22,14]);c.strokeRect(4,4,w-8,h-8);c.setLineDash([]);c.fillStyle='#e8c020';c.font='bold 30px Arial';c.textAlign='center';c.save();c.translate(w/2,60);c.fillText('BUS',0,0);c.fillText('ONLY',0,34);c.restore()},128);bay.position.set(RTB.bus[0],.04,RTB.bus[1]);g.add(bay)}
 /* ---- the depot building: stucco walls with an orange tiled base band, big aluminium windows, a glass entrance on
    the platform side and another on the south side (to the lane), a parapet with an orange coping ---- */
 const STU=o.STU,IN=M(0xe8e2d4,{roughness:.9}),wl=(ax,c,a0,a1,y0,y1,outSign)=>{if(a1-a0<.005||y1-y0<.005)return;const am=(a0+a1)/2,ym=(y0+y1)/2;
   if(ax=='z'){const ms=outSign<0?[IN,STU,STU,STU,STU,STU]:[STU,IN,STU,STU,STU,STU];box(T,y1-y0,a1-a0,c,ym,am,ms)}else{const ms=outSign<0?[STU,STU,STU,STU,IN,STU]:[STU,STU,STU,STU,STU,IN];box(a1-a0,y1-y0,T,am,ym,c,ms)}};
 /* walls run along an axis with openings [a0,a1,bottom,top]; ax 'z' = a wall along z at x=c; out = which side is outside */
 const wall=(ax,c,A0,A1,ops,out)=>{let a=A0;for(const[o0,o1,b,t]of ops){wl(ax,c,a,o0,0,H,out);wl(ax,c,o0,o1,0,b,out);wl(ax,c,o0,o1,t,H,out);a=o1}wl(ax,c,a,A1,0,H,out)};
 const WO=[[-998.6,-993.6,.9,2.6],[-991.2,-988.8,0,2.7],[-986.4,-981.4,.9,2.6]],SO=[[-77,-73.4,.9,2.6],[-72.2,-69.8,0,2.7],[-68.6,-65,.9,2.6]],EO=[[-997,-992,2.0,2.8],[-989,-985,2.0,2.8]];
 wall('z',x0+T/2,z0,z1,WO,-1);wall('z',x1-T/2,z0,z1,EO,1);wall('x',z0+T/2,x0+T,x1-T,SO,-1);wall('x',z1-T/2,x0+T,x1-T,[],1);
 /* the orange base band (a skin 1 cm proud, 0.6 m high), broken at the doors */
 const band=(ax,c,A0,A1,ops,s)=>{let a=A0;const seg=(p,q)=>{if(q-p<.01)return;if(ax=='z')box(.01,.6,q-p,c+s*.005,.3,(p+q)/2,OR);else box(q-p,.6,.01,(p+q)/2,.3,c+s*.005,OR)};for(const[o0,o1,b]of ops){if(b==0){seg(a,o0);a=o1}}seg(a,A1)};
 band('z',x0,z0-.01,z1+.01,WO,-1);band('z',x1,z0-.01,z1+.01,EO,1);band('x',z0,x0,x1,SO,-1);band('x',z1,x0,x1,[],1);
 /* windows and doorways: aluminium frames, glass; the doorways get glass doors standing open and a transom */
 const win=(ax,c,o0,o1,b,t,s)=>{const L2=o1-o0,m=(o0+o1)/2,P=(w,h,dp,u,y,v,mm)=>ax=='z'?box(dp,h,w,c+v,y,u,mm):box(w,h,dp,u,y,c+v,mm);
  if(b>0){P(L2,.06,.1,m,b+.03,0,AL);P(L2,.06,.1,m,t-.03,0,AL);for(const u of[o0+.03,o1-.03])P(.06,t-b-.12,.1,u,(b+t)/2,0,AL);const n=Math.round(L2/1.3);for(let i=1;i<n;i++)P(.05,t-b-.12,.1,o0+i*L2/n,(b+t)/2,0,AL);
   P(L2-.12,t-b-.14,.01,m,(b+t)/2,0,G);P(L2+.1,.05,.16,m,b-.025,s*.2,o.WHT)}
  else{P(L2,.3,.1,m,t-.15,0,AL);P(L2-.1,.18,.01,m,t-.15,0,G);for(const u of[o0+.03,o1-.03])P(.06,t-.3,.1,u,(t-.3)/2,0,AL)}};
 for(const[a,b,lo,hi]of WO)win('z',x0+T/2,a,b,lo,hi,-1);for(const[a,b,lo,hi]of EO)win('z',x1-T/2,a,b,lo,hi,1);for(const[a,b,lo,hi]of SO)win('x',z0+T/2,a,b,lo,hi,-1);
 /* the open glass doors: two leaves swung back against the inside wall at each doorway */
 for(const[ax,c,a,b,s]of[['z',x0+T/2,-991.2,-988.8,1],['x',z0+T/2,-72.2,-69.8,1]])for(const sd of[-1,1]){const e=sd<0?a+.06:b-.06,lw=1.14;if(ax=='z'){box(lw,2.18,.05,c+T/2+lw/2+.02,1.18,e+sd*.04,G);box(lw,.06,.06,c+T/2+lw/2+.02,.06,e+sd*.04,AL);box(lw,.06,.06,c+T/2+lw/2+.02,2.3,e+sd*.04,AL);box(.06,2.24,.06,c+T/2+lw+.02,1.18,e+sd*.04,AL)}
  else{box(.05,2.18,lw,e+sd*.04,1.18,c+T/2+lw/2+.02,G);box(.06,.06,lw,e+sd*.04,.06,c+T/2+lw/2+.02,AL);box(.06,.06,lw,e+sd*.04,2.3,c+T/2+lw/2+.02,AL);box(.06,2.24,.06,e+sd*.04,1.18,c+T/2+lw+.02,AL)}}
 /* roof, parapet and coping */
 box(x1-x0-2*T,.25,z1-z0-2*T,(x0+x1)/2,H-.125,(z0+z1)/2,[IN,IN,o.TAR,M(0xf0ece2,{roughness:.9,emissive:0x2a2822}),IN,IN]);
 for(const[w,dd,x,z]of[[x1-x0,T,(x0+x1)/2,z0+T/2],[x1-x0,T,(x0+x1)/2,z1-T/2],[T,z1-z0-2*T,x0+T/2,(z0+z1)/2],[T,z1-z0-2*T,x1-T/2,(z0+z1)/2]]){box(w,.6,dd,x,H+.3,z,STU);box(w+.1,.06,w>dd?dd+.1:dd-.1,x,H+.63,z,OR)}
 ob(x0,x0+T,z0,-991.2);ob(x0,x0+T,-988.8,z1);ob(x1-T,x1,z0,z1);ob(x0,-72.2,z0,z0+T);ob(-69.8,x1,z0,z0+T);ob(x0,x1,z1-T,z1);
 /* ---- inside: a terrazzo floor, the ticket counter along the north wall with three windows, the departures board
    and a clock over it, three rows of benches, lockers and a vending machine on the east wall, restroom doors,
    the old timetable by the platform door, ceiling lights ---- */
 {const IX0=x0+T,IX1=x1-T,IZ0=z0+T,IZ1=z1-T;const TZ=M(0xffffff,{roughness:.4,map:k.tex(128,128,(c,w,h)=>{c.fillStyle='#d8d0c0';c.fillRect(0,0,w,h);for(let i=0;i<900;i++){c.fillStyle=['#8a7a68','#b84a20','#4a4a48','#f0ece0'][r()*4|0];c.fillRect(r()*w,r()*h,1+r()*2,1+r()*2)}c.fillStyle='rgba(60,50,40,.35)';c.fillRect(0,0,w,2);c.fillRect(0,0,2,h)})});TZ.userData.t=2;
  box(IX1-IX0,.03,IZ1-IZ0,(IX0+IX1)/2,.04,(IZ0+IZ1)/2,TZ);
  /* the counter: x -76.5..-65.5 at z -980.4, staff side behind it to the north; three windows with glass screens */
  const CZ=-980.6;box(11,1.05,.6,-71,.555,CZ,M(0xc86a1a,{roughness:.6}));box(11.1,.05,.7,-71,1.105,CZ,M(0xe8e2d4,{roughness:.4}));
  for(let i=0;i<4;i++)box(.06,1.1,.06,-76.45+i*3.633,1.68,CZ+.05,AL);box(11,.08,.1,-71,2.27,CZ+.05,AL);for(let i=0;i<3;i++){const cx=-74.68+i*3.633;box(3.5,1.0,.01,cx,1.68,CZ+.05,G);box(.5,.06,.02,cx,1.18,CZ+.04,AL);
   L(['TICKETS','INFORMATION','LOST & FOUND'][i],1.6,.24,'#1c1c1e','#e8c020',40,cx,2.43,CZ-.005,Math.PI);}
  for(const x of[-76.6,-65.4])box(.2,1.05,.6,x,.555,CZ,M(0x9a4a12));ob(-76.7,-65.3,CZ-.35,CZ+.3);
  C(.2,.2,.06,-74.7,.73,-979.5,M(0x2a2a30),null,null,12);C(.03,.03,.66,-74.7,.38,-979.5,k.STL,null,null,6);C(.18,.18,.02,-74.7,.04,-979.5,k.STL,null,null,12);
  /* departures board and clock on the north wall, above the counter */
  {const bc=document.createElement('canvas');bc.width=640;bc.height=200;const x=bc.getContext('2d');x.fillStyle='#141416';x.fillRect(0,0,640,200);x.fillStyle='#e8c020';x.font='bold 24px Arial';x.fillText('DEPARTURES',16,30);x.fillText('PLATFORM',380,30);x.fillText('STATUS',500,30);x.fillStyle='#f0e0a0';x.font='bold 22px monospace';
   [['LAS VEGAS','1','NOW'],['LAS VEGAS','1','NOW'],['LAS VEGAS','1','ON TIME'],['TUCSON','1','YOU ARE HERE'],['ANYWHERE ELSE','-','NO']].forEach((rw,i)=>{x.fillText(rw[0],16,64+i*28);x.fillText(rw[1],400,64+i*28);x.fillStyle=rw[2]=='NO'?'#ff5040':'#40e070';x.fillText(rw[2],500,64+i*28);x.fillStyle='#f0e0a0'});
   const bm=new THREE.Mesh(new THREE.PlaneGeometry(4.8,1.5),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(bc)}));bm.position.set(-72.5,3.05,IZ1-.066);bm.rotation.y=Math.PI;g.add(bm);box(5,1.7,.06,-72.5,3.05,IZ1-.03,M(0x2a2a2e,{metalness:.4}))}
  {const cc=document.createElement('canvas');cc.width=cc.height=128;const y=cc.getContext('2d');y.fillStyle='#f6f2e6';y.beginPath();y.arc(64,64,60,0,7);y.fill();y.fillStyle='#202020';y.font='bold 16px Arial';y.textAlign='center';y.textBaseline='middle';for(let h=1;h<=12;h++){const a=h/12*Math.PI*2-Math.PI/2;y.fillText(String(h),64+Math.cos(a)*46,64+Math.sin(a)*46)}y.font='bold 10px Arial';y.fillText('5 MIN',64,90);y.lineWidth=4;y.beginPath();y.moveTo(64,64);y.lineTo(64,24);y.moveTo(64,64);y.lineTo(84,64);y.stroke();
   const ck=new THREE.Mesh(new THREE.CircleGeometry(.4,28),M(0xffffff,{map:new THREE.CanvasTexture(cc)}));ck.position.set(-67.6,3.15,IZ1-.085);ck.rotation.y=Math.PI;g.add(ck);C(.42,.42,.08,-67.6,3.15,IZ1-.04,OR,'z',null,28)}
  /* benches: three rows, back to back, with steel legs and orange seats */
  const SEAT=M(0xd8782a,{roughness:.5});for(const bx of[-74,-71,-68])for(const[za,zb]of[[-996,-991.5],[-989.5,-985]]){const zm=(za+zb)/2,ln=zb-za;for(const sd of[-1,1]){box(.45,.05,ln,bx+sd*.27,.45,zm,SEAT);box(.05,.45,ln,bx+sd*.04,.7,zm,SEAT)}box(.1,.08,ln-.02,bx,.94,zm,AL);for(const z of[za+.3,zb-.3]){box(.9,.05,.06,bx,.4,z,AL);box(.06,.4,.05,bx,.2,z,AL)}ob(bx-.5,bx+.5,za,zb)}
  /* lockers and a vending machine on the east wall; restroom doors */
  {const LX=IX1-.25;for(let i=0;i<6;i++){box(.49,1.9,.48,LX-.005,.985,-997+i*.5,M(0x6a7a6a,{metalness:.4,roughness:.5}));box(.01,.2,.3,LX-.255,1.6,-997+i*.5,M(0x3a443a))}ob(LX-.25,IX1,-997.25,-994.25);
   box(.85,1.9,.9,IX1-.455,.985,-992.6,M(0xc02020,{roughness:.5}));box(.01,1.2,.6,IX1-.88,1.2,-992.7,G);L('GWEEN SODA',.6,.18,'#c02020','#ffffff',40,IX1-.885,1.92,-992.6,-Math.PI/2);ob(IX1-.9,IX1,-993.05,-992.15);
   for(const[z,t]of[[-981.4,'GENTS'],[-983.2,'LADIES']]){box(.05,2.1,.95,IX1-.03,1.05,z,M(0x4a6a8a,{roughness:.6}));L(t,.5,.16,'#f0ece0','#202020',40,IX1-.063,1.7,z,-Math.PI/2)}L('OUT OF ORDER',.6,.18,'#ffffff','#c02020',36,IX1-.067,1.3,-983.2,-Math.PI/2)}
  /* the old timetable, now framed on the wall by the platform door */
  {const tt=L('DESERT BUS\nTUCSON ⇄ LAS VEGAS\n360 MI · ABOUT 5 MINUTES\nNO STOPS. NO PAUSING.',1.6,1.2,'#f0e8d0','#2a2a2a',44,IX0+.036,1.7,-992.4,Math.PI/2);box(.03,1.3,1.7,IX0+.015,1.7,-992.4,M(0x5a3a1a))}
  /* ceiling lights */for(const x of[-74,-70,-66])for(const z of[-995,-987])box(1.2,.04,.3,x,H-.27,z,M(0xffffff,{emissive:0xfff0d0,emissiveIntensity:1}));lights.push([-71,3.4,-991])}
 /* ---- the platform (raised 25 cm) along the bus's door side, a yellow edge line, benches and bins outside, and a
    canopy cantilevered off the wall on steel brackets (two slim columns carry its ends past the building) ---- */
 {const{x0:px0,x1:px1,z0:pz0,z1:pz1,y}=RTB.plat;box(px1-px0,y,pz1-pz0,(px0+px1)/2,y/2,(pz0+pz1)/2,CONC);const yl=rtPaint(k,.12,pz1-pz0-.4,(c,w,h)=>{c.fillStyle='#e8c020';c.fillRect(0,0,w,h)},8);yl.position.set(px0+.25,y+.006,(pz0+pz1)/2);g.add(yl);
  for(const z of[-996,-984]){box(.45,.05,1.8,x0-.35,y+.45,z,o.WOODL);for(const sz of[-.75,.75])box(.4,.425,.06,x0-.35,y+.2125,z+sz,AL);box(.05,.4,1.8,x0-.1,y+.675,z,o.WOODL)}
  for(const z of[-993.5,-986.5])C(.22,.2,.8,x0-.4,y+.4,z,M(0x3a4a3a,{roughness:.6}),null,null,12);
  const CY0=3.3,CY1=3.55,cw=px1-px0;const cs=rtBox(g,cw+.05,.08,pz1-pz0,(px0+px1)/2-.025,(CY0+CY1)/2,(pz0+pz1)/2,M(0xd8dcde,{metalness:.3,roughness:.6,emissive:0x34322e}));cs.rotation.z=Math.atan2(CY1-CY0,cw);
  box(.12,.3,pz1-pz0-.02,px0+.06,CY0-.02,(pz0+pz1)/2,OR);for(let z=pz0+1.5;z<pz1;z+=4){rod([x0,CY1+.9,z],[px0+.3,CY0+.06,z],.03,k.STL);box(.1,.2,.2,x0-.05,CY1+.9,z,k.STL)}
  for(const z of[pz0+.4,pz1-.4]){box(.14,3.25,.14,px1-.35,y+1.625,z,k.STL);box(.3,.03,.3,px1-.35,y+.01,z,k.STL)}
  for(const z of[-997,-982]){const s=new THREE.Group();s.position.set(px0+1.4,CY0-.6,z);g.add(s);const h=k.H(s);h.B(1.6,.4,.06,0,0,0,M(0x1c1c1e));h.L('PLATFORM 1 · LAS VEGAS',1.5,.32,'#1c1c1e','#e8c020',44,0,0,.036,0);h.L('PLATFORM 1 · LAS VEGAS',1.5,.32,'#1c1c1e','#e8c020',44,0,0,-.036,Math.PI);for(const sx of[-.6,.6])h.C(.01,.01,.5,sx,.45,0,k.STL,null,null,4);s.rotation.y=Math.PI/2}
  lights.push([px0+1.2,2.9,-995],[px0+1.2,2.9,-985])}
 /* ---- the DESERT BUS sign on the roof: a steel frame carrying a long board, both faces (west to the platform, east
    to the town), with a little bus painted on it ---- */
 {const sx=(x0+x1)/2,sz=(z0+z1)/2,W2=12,H2=1.7,Y=H+.6+.06+1.2;for(const zz of[-5,0,5]){for(const sd of[-1,1])rod([sx+sd*.6,H,sz+zz],[sx,Y-H2/2,sz+zz],.05,k.STL);box(.12,Y-H2/2-H+.02,.12,sx,(H+Y-H2/2)/2,sz+zz,k.STL)}
  box(.3,H2,W2,sx,Y,sz,OR);const sc=document.createElement('canvas');sc.width=1024;sc.height=146;const x=sc.getContext('2d');x.fillStyle='#c86a1a';x.fillRect(0,0,1024,146);x.fillStyle='#fff6e0';x.font='bold 96px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText('DESERT BUS',560,78);
  x.fillStyle='#fff6e0';x.fillRect(40,40,150,62);x.fillStyle='#c86a1a';for(let i=0;i<4;i++)x.fillRect(52+i*34,50,24,20);x.fillStyle='#202020';for(const wx of[70,160]){x.beginPath();x.arc(wx,104,14,0,7);x.fill()}
  const st=new THREE.CanvasTexture(sc);st.anisotropy=8;for(const sd of[-1,1]){const p=new THREE.Mesh(new THREE.PlaneGeometry(W2-.2,H2-.2),M(0xffffff,{map:st,emissive:0x302010}));p.position.set(sx+sd*.155,Y,sz);p.rotation.y=sd*Math.PI/2;g.add(p)}
  box(.36,.08,W2+.1,sx,Y+H2/2+.04,sz,ORD);box(.36,.08,W2+.1,sx,Y-H2/2-.04,sz,ORD)}
 /* ---- the arch, remodelled in place: orange pillars (inner faces still at x -90.75 / -77.25, where the portal
    meets them) with chevrons and plinths, a deep lit beam with TO LAS VEGAS · 360 MI on both faces and bulbs.
    The portal plane, its glow strips and its animation stay as they are ---- */
 {const ax=RTB.bus[0],az=RTB.az,PW=.9,PI2=6.75;for(const sd of[-1,1]){const px=ax+sd*(PI2+PW/2);box(PW,5.75,.9,px,2.875,az,OR);box(PW+.3,.5,1.2,px,.25,az,CONC);
   for(let i=0;i<4;i++){const ch=rtPaint(k,.9,.9,(c,w,h)=>{c.clearRect(0,0,w,h);c.fillStyle='#fff6e0';c.beginPath();c.moveTo(0,h*.2);c.lineTo(w/2,h*.6);c.lineTo(w,h*.2);c.lineTo(w,h*.45);c.lineTo(w/2,h*.85);c.lineTo(0,h*.45);c.fill()},64);ch.rotation.set(0,0,0);for(const fz of[-1,1]){const cc=ch.clone();cc.rotation.set(0,fz>0?0:Math.PI,0);cc.position.set(px,1.5+i*1.0,az+fz*.456);g.add(cc)}}
   obs.push({x0:px-PW/2,x1:px+PW/2,z0:az-.45,z1:az+.45})}
  const BW=2*(PI2+PW)+.2;box(BW,1.3,1.0,ax,6.4,az,ORD);box(BW+.1,.1,1.1,ax,7.1,az,OR);
  const bc=document.createElement('canvas');bc.width=1024;bc.height=96;const x=bc.getContext('2d');x.fillStyle='#7a3a0e';x.fillRect(0,0,1024,96);x.fillStyle='#ffd860';for(let i=0;i<48;i++)for(const y of[9,87]){x.beginPath();x.arc(11+i*21.1,y,5,0,7);x.fill()}x.fillStyle='#fff6e0';x.font='bold 54px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText('TO LAS VEGAS · 360 MI',512,50);
  const bt=new THREE.CanvasTexture(bc);bt.anisotropy=8;for(const sd of[-1,1]){const p=new THREE.Mesh(new THREE.PlaneGeometry(BW-.3,1.1),new THREE.MeshBasicMaterial({map:bt}));p.position.set(ax,6.4,az+sd*.505);p.rotation.y=sd>0?0:Math.PI;g.add(p)}
  lights.push([ax,5.2,az+1.5])}
 return{obs,lights,plates:[{x0:RTB.plat.x0,x1:RTB.plat.x1,z0:RTB.plat.z0,z1:RTB.plat.z1,y:RTB.plat.y}],
  spots:{timetable:[x0+T+.8,-993],board:[-72.5,-981.6],tickets:[-74.68,-981.4],soda:[x1-T-1.3,-992.6]},
  mapR:RTB.apron.map(a=>a.concat(['#b4afa6'])).concat([[x0,x1,z0,z1,'#e2d4b4'],[RTB.plat.x0,RTB.plat.x1,RTB.plat.z0,RTB.plat.z1,'#c8c2b4']])}}

/* ---- the water tower at (58, -1060), remodelled in place: the same legs (feet at ±3.4, meeting the tank at ±2.1
   at 11.2 m), now steel tubes with gussets on concrete feet, two rings of struts, tension-rod X bracing with
   turnbuckles, a riveted tank (radius 3, 11.6..15.6 m) with OLD TOWN painted on the road side, a conical roof with a
   finial and a vent, the catwalk (radius 3.62) with a railing, the ladder in the same place (x 61.78) with a safety
   cage, a short ladder up the tank to the roof, and the outlet pipe and valve down the middle.
   parts.tag: a curved panel on the east face of the tank for the player's spray tag (give it the tag material) ---- */
function rtWaterTower(g){const k=rtKit(),{B,C,rod,L,tube}=k.H(g),M=k.M,r=k.r,obs=[];const{x:tx,z:tz,top,F,T}=RTB.tower,box=(w,h,d,x,y,z,m)=>rtBox(g,w,h,d,x,y,z,m);
 const ST=M(0x8a9094,{metalness:.55,roughness:.45}),STD=M(0x5a6064,{metalness:.5,roughness:.5});
 const TK=M(0xffffff,{metalness:.35,roughness:.55,map:k.tex(512,128,(c,w,h)=>{c.fillStyle='#b8bcb4';c.fillRect(0,0,w,h);for(let i=0;i<40;i++){c.fillStyle='rgba(120,90,60,'+(.04+r()*.08)+')';c.fillRect(r()*w,r()*h*.6+h*.4,2+r()*6,10+r()*40)}
  c.fillStyle='rgba(60,64,60,.55)';for(const y of[2,h/3,2*h/3,h-3])c.fillRect(0,y-1,w,2);for(let x=0;x<w;x+=64)c.fillRect(x,0,2,h);c.fillStyle='rgba(50,52,50,.6)';for(const y of[6,h/3+4,h/3-4,2*h/3+4,2*h/3-4,h-7])for(let x=2;x<w;x+=8)c.fillRect(x,y,2,2);for(let x=0;x<w;x+=64)for(let y=6;y<h;y+=8){c.fillRect(x-4,y,2,2);c.fillRect(x+4,y,2,2)}})});
 TK.map.repeat.set(3,1);
 const at=y=>F+(T-F)*y/top,LG=[[-1,-1],[1,-1],[1,1],[-1,1]];
 /* legs and feet */for(const[a,b]of LG){rod([tx+a*F,.5,tz+b*F],[tx+a*T,top,tz+b*T],.17,ST,null,12);box(.9,.5,.9,tx+a*F,.25,tz+b*F,M(0xa8a398,{roughness:.95}));box(.5,.04,.5,tx+a*at(.5),.52,tz+b*at(.5),STD);obs.push({x0:tx+a*F-.45,x1:tx+a*F+.45,z0:tz+b*F-.45,z1:tz+b*F+.45})}
 /* struts at 4 m and 8 m, tension-rod Xs between, a turnbuckle in the middle of each rod */
 for(let i=0;i<4;i++){const[a,b]=LG[i],[c,d]=LG[(i+1)%4];for(const y of[4,8])rod([tx+a*at(y),y,tz+b*at(y)],[tx+c*at(y),y,tz+d*at(y)],.07,ST,null,8);
  for(const[y0,y1]of[[.6,4],[4,8],[8,top-.2]]){const p0=[tx+a*at(y0),y0,tz+b*at(y0)],p1=[tx+c*at(y1),y1,tz+d*at(y1)],p2=[tx+c*at(y0),y0,tz+d*at(y0)],p3=[tx+a*at(y1),y1,tz+b*at(y1)];
   for(const[u,v]of[[p0,p1],[p2,p3]]){rod(u,v,.025,STD,null,6);const m=[(u[0]+v[0])/2,(u[1]+v[1])/2,(u[2]+v[2])/2];const tb=rod([m[0]-(v[0]-u[0])*.04,m[1]-(v[1]-u[1])*.04,m[2]-(v[2]-u[2])*.04],[m[0]+(v[0]-u[0])*.04,m[1]+(v[1]-u[1])*.04,m[2]+(v[2]-u[2])*.04],.05,STD,null,6)}}}
 /* the ring girder under the tank, the tank, its roof, finial and vent */
 C(3.15,3.15,.4,tx,top+.2,tz,STD,null,null,28);C(3,3,4,tx,top+2.4,tz,TK,null,null,40);for(const y of[top+.45,top+4.35])C(3.04,3.04,.1,tx,y,tz,STD,null,null,40,true);
 C(.25,3.25,1.5,tx,top+5.15,tz,M(0x8a8f90,{metalness:.4,roughness:.5}),null,null,40);C(.3,.3,.1,tx,top+5.95,tz,STD,null,null,12);C(.03,.03,.7,tx,top+6.3,tz,ST,null,null,6);const bl=new THREE.Mesh(new THREE.SphereGeometry(.09,10,8),M(0x401010,{emissive:0xff2020}));bl.position.set(tx,top+6.7,tz);g.add(bl);
 C(.18,.18,.5,tx+1.4,top+5.25,tz+.8,STD,null,null,10);C(.26,.26,.06,tx+1.4,top+5.53,tz+.8,STD,null,null,10);
 /* OLD TOWN on the road (west) side, painted on a curved band so it lies on the tank; and the curved tag panel east */
 const curved=(w,h,ang,map,col)=>{const th=w/3.02;const ge=new THREE.CylinderGeometry(3.02,3.02,h,24,1,true,ang-th/2,th);const m=new THREE.MeshStandardMaterial({map,transparent:true,roughness:.7,color:col||0xffffff,polygonOffset:true,polygonOffsetUnits:-2});const me=new THREE.Mesh(ge,m);me.position.set(tx,top+2.4,tz);me.userData.noSeam=true;g.add(me);return me};
 const oc=document.createElement('canvas');oc.width=1024;oc.height=300;const x=oc.getContext('2d');x.clearRect(0,0,1024,300);x.fillStyle='#2a3a5a';x.font='bold 170px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText('OLD TOWN',512,120);x.font='bold 54px Arial';x.fillText('DOORS BUT DESERT · POP. 13',512,250);
 const ot=new THREE.CanvasTexture(oc);ot.anisotropy=8;ot.wrapS=THREE.ClampToEdgeWrapping;curved(6.6,1.95,-Math.PI/2,ot);
 /* (cylinder angle 0 faces +z; -PI/2 faces -x, the road; +PI/2 faces +x, where the tag goes) */
 const tagC=document.createElement('canvas');tagC.width=8;tagC.height=8;const tag=curved(3.4,1.06,Math.PI/2,new THREE.CanvasTexture(tagC));tag.material.opacity=0;
 /* catwalk: a grating disc ring (radius 3.62) round the tank on brackets, a railing with a gap for the ladder */
 {const GR=M(0xffffff,{metalness:.4,roughness:.6,transparent:true,alphaTest:.5,side:THREE.DoubleSide,map:k.tex(64,64,(c,w,h)=>{c.clearRect(0,0,w,h);c.fillStyle='#5a6064';for(let i=0;i<w;i+=8){c.fillRect(i,0,3,h);c.fillRect(0,i,w,3)}})});GR.map.repeat.set(12,12);
  const ring=new THREE.Mesh(new THREE.RingGeometry(3.0,3.62,40),GR);ring.rotation.x=-Math.PI/2;ring.position.set(tx,top+.405,tz);g.add(ring);const edge=C(3.64,3.64,.1,tx,top+.35,tz,STD,null,null,40,true);
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2+Math.PI/8;rod([tx+Math.cos(a)*3.15,top+.02,tz+Math.sin(a)*3.15],[tx+Math.cos(a)*3.6,top+.36,tz+Math.sin(a)*3.6],.03,STD,null,6)}
  const gap=.44;for(const y of[top+.9,top+1.4]){const rl=new THREE.Mesh(new THREE.TorusGeometry(3.56,.03,6,48,Math.PI*2-gap),ST);rl.rotation.set(Math.PI/2,0,gap/2);rl.position.set(tx,y,tz);g.add(rl)}
  for(let i=0;i<=16;i++){const a=gap/2+i*(Math.PI*2-gap)/16;box(.05,1.0,.05,tx+Math.cos(a)*3.56,top+.9,tz+Math.sin(a)*3.56,ST)}}
 /* the ladder: two rails from the ground to 1 m above the catwalk, rungs every 32 cm, brackets to the frame, a safety
    cage from 2.5 m up; a short ladder up the tank side to the roof */
 {const LX=tx+F+.38,LT=top+.4,LS=M(0x8a9094,{metalness:.55,roughness:.45});for(const sz of[-.26,.26]){box(.05,LT+1.05,.05,LX,(LT+1.05)/2,tz+sz,LS);box(.33,.05,.05,LX-.16,LT+1.05,tz+sz,LS);for(const by of[3.5,6,8.5,top-.1]){const fx=at(by);box(LX-tx-fx,.05,.05,(LX+tx+fx)/2,by,tz+sz,LS)}}
  for(let y=.32;y<=LT+.01;y+=.32)box(.03,.045,.52,LX,y,tz,LS);
  for(let y=2.6;y<LT+.9;y+=.9){const hp=[];for(let i=0;i<=10;i++){const a=-Math.PI/2+i/10*Math.PI;hp.push([LX+Math.sin(i/10*Math.PI)*.42,y,tz+Math.cos(i/10*Math.PI)*.26])}tube(hp,.015,LS,null,12)}
  for(const i of[2,5,8]){const xx=LX+Math.sin(i/10*Math.PI)*.42,zz=tz+Math.cos(i/10*Math.PI)*.26;box(.03,LT+.9-2.6,.03,xx,(2.6+LT+.9)/2,zz,LS)}
  {const tl=new THREE.Group();tl.position.set(tx,0,tz);tl.rotation.y=-.7;g.add(tl);const h=k.H(tl);for(const sz of[-.2,.2]){h.B(.04,4.3,.04,3.1,top+.4+2.15,sz,LS);for(const y of[top+1,top+4.1])h.B(.12,.04,.03,3.05,y,sz,LS)}for(let y=top+.7;y<top+4.6;y+=.32)h.B(.04,.04,.4,3.1,y,0,LS)}
  obs.push({x0:LX-.1,x1:LX+.5,z0:tz-.35,z1:tz+.35})}
 /* the outlet pipe down the middle, a valve wheel at the bottom, a concrete pad */
 C(.18,.18,top,tx,top/2,tz,STD,null,null,12);box(1.2,.15,1.2,tx,.075,tz,M(0xa8a398,{roughness:.95}));const vw=new THREE.Mesh(new THREE.TorusGeometry(.25,.03,6,16),M(0xc02020,{roughness:.5}));vw.position.set(tx+.3,1.1,tz);vw.rotation.y=Math.PI/2;g.add(vw);C(.03,.03,.14,tx+.25,1.1,tz,STD,'x',null,6);
 obs.push({x0:tx-.6,x1:tx+.6,z0:tz-.6,z1:tz+.6});
 return{obs,parts:{tag}}}

/* =====================================================================================================
   r657 WIRING: Route 13 in the game
   ===================================================================================================== */
/* build a model into a scratch group, mark it noSeam (the models do their own depth offsets), then move its pieces into
   the desert root one by one so the chunker, the batcher and the far-scenery cells see them like any other scenery */
/* a box with a different material on some faces is one draw call per face (six for a box), and the batcher cannot
   merge it; split it into one mesh per material (sharing the same vertex data) so the batcher merges them like the rest */
function rtSplit(root){const L=[];root.traverse(o=>{if(o.isMesh&&Array.isArray(o.material)&&o.geometry&&o.geometry.index&&o.geometry.groups.length)L.push(o)});
 for(const o of L){const ge=o.geometry,ix=ge.index.array,by=new Map();for(const gr of ge.groups){const m=o.material[gr.materialIndex];if(!m)continue;let a=by.get(m);if(!a)by.set(m,a=[]);for(let i=gr.start;i<gr.start+gr.count&&i<ix.length;i++)a.push(ix[i])}
  if(by.size<1)continue;const par=o.parent;for(const[m,a]of by){const g2=new THREE.BufferGeometry();for(const k in ge.attributes)g2.setAttribute(k,ge.attributes[k]);g2.setIndex(a);const n=new THREE.Mesh(g2,m);n.position.copy(o.position);n.quaternion.copy(o.quaternion);n.scale.copy(o.scale);n.renderOrder=o.renderOrder;n.userData=Object.assign({},o.userData);par.add(n)}par.remove(o)}
 return L.length}
/* identical painted labels (the pumps' price windows, the signs painted the same on both faces...) share one texture and
   material while a Route 13 model is being built (the Fort kit's own labels are left alone) */
const RTLC={on:0,m:new Map(),w:0};
function rtLabCache(){if(RTLC.w)return;RTLC.w=1;const k=fbKit(),f0=k.lab;k.lab=function(s,w,h,bg,fg,fs,font){if(!RTLC.on)return f0.apply(this,arguments);const key=[s,w,h,bg,fg,fs,font].join('|'),c=RTLC.m.get(key);if(c)return new THREE.Mesh(c.geometry,c.material);const o=f0.apply(this,arguments);RTLC.m.set(key,o);return o}}
function rtPut(g,f){rtLabCache();const t=new THREE.Group();let r;RTLC.on=1;try{r=f(t)||{}}finally{RTLC.on=0}rtSplit(t);t.traverse(o=>{o.userData.noSeam=true;o.userData.rt=1});while(t.children.length)g.add(t.children[0]);return r}
/* the game's point lights (the light pool shows the nearest few) */
function rtLights(g,L,col,i,d){for(const p of L||[]){const l=new THREE.PointLight(col,i,d);l.position.set(p[0],p[1],p[2]);g.add(l)}}
const rtObs=(arr,L)=>{for(const b of L||[])arr.push(b)};
const rtKeep=o=>{if(o)o.userData.dpKeep=1};
/* a moving group (a door on its hinge, a TV, a brush...) is left out of the scenery batches; its own pieces are batched
   relative to it once the desert is loaded (as the vehicles' moving parts are, dx624), one group per frame */
const RTKG={L:[],i:0,q:null};
function rtKeepG(o){if(!o)return;o.userData.dpKeep=1;RTKG.L.push(o)}
function rtKeepTick(q){if(RTKG.q!==q){RTKG.q=q;RTKG.i=0}if(RTKG.i>=RTKG.L.length||q.ld||!q.dp||!q.dp.merged||typeof DP=='undefined'||!DP._mergeRoot)return;
 const x=RTKG.L[RTKG.i++];if(!x||!x.parent||x.userData.dpRecs)return;let n=0;x.traverse(m=>{if(m.isMesh)n++});if(n<2)return;
 try{x.updateMatrixWorld(true);DP._mergeRoot(q,x,DP.cfg().lam,false);if(x.userData.dpRecs&&x.userData.dpRecs.length)(q.dp.movers||(q.dp.movers=[])).push(x)}catch(e){conLog('error','route 13 batching: '+e.message)}}
/* the town box: no bus-ride cactus, rock or roadside door inside it */
const RTBOX={x0:-100,x1:110,z0:-1125,z1:-880};
function rtScatter(L,g){const inT=(x,z)=>x>RTBOX.x0&&x<RTBOX.x1&&z>RTBOX.z0&&z<RTBOX.z1,out=[];
 try{for(const o of L){const cx=(o.x0+o.x1)/2,cz=(o.z0+o.z1)/2;if(inT(cx,cz)){if(o.m&&o.m.parent)o.m.parent.remove(o.m);continue}out.push(o)}
  /* the bus ride's last roadside door stands at z -910 (it landed on the drive-in's drive) */
  for(const c of g.children.slice())if(c.isGroup&&c.position.y===-.3&&c.position.z===-910&&inT(c.position.x,c.position.z))g.remove(c)}catch(e){conLog('error','route 13 scatter: '+e.message);return L}
 return out}

/* ---- busRoamBuild: the main street, the bus stop shelter and the car wash ---- */
const RTW={W:null,st:null,rem:null,cool:null,net:0};
function rtTownB(q,g,obs,props,anims){RTKG.L=[];RTKG.i=0;RTKG.q=q;
 try{const m=rtPut(g,rtMain);rtObs(obs,m.obs);/* the lamps that are lit */rtLights(g,m.lights,0xffd890,1,14)}catch(e){conLog('error','route 13 main street: '+e.message)}
 try{const b=rtPut(g,rtBusStop);rtObs(obs,b.obs)}catch(e){conLog('error','route 13 bus stop: '+e.message)}
 try{const W=rtPut(g,rtCarWash);rtObs(obs,W.obs);rtLights(g,W.lights,0xe8f4ff,.9,9);const p=W.parts;
  for(const k in p.sign){const m=p.sign[k];m.material=m.material.clone()}for(const o of[p.brushL,p.brushR,p.brushTop,p.jets])rtKeep(o);for(const o of[p.sliderL,p.sliderR,p.sliderTop,p.arch,p.brushL,p.brushR,p.brushTop])rtKeepG(o);for(const k in p.sign)rtKeep(p.sign[k]);
  RTW.W=W;RTW.st=null;RTW.rem=null;RTW.cool=null;rtWashSign('fwd');
  props.push({x:62.2,z:-1009,r:1.4,txt:()=>'[E] Read the price board',act:()=>{snd(300,.06);hint('🫧 WASH · 5 🪙 · WAX · FREE. Drive in, stop, and press E without getting out. GOBLIN NOT RESPONSIBLE FOR GOBLINS.')}})}catch(e){conLog('error','route 13 car wash: '+e.message)}}
/* El Goblino Gas: the forecourt, canopy, pumps, price sign and air post. Returns the model (pumps for the knock-over obstacles) */
function rtGasB(q,g,obs){RTLC.m.clear();try{const G=rtPut(g,rtGas);for(const b of G.obs){if(Math.abs(b.x0-26.8)<.01&&Math.abs(b.x1-29.2)<.01)continue;/* the pumps' boxes are added with the pumps (kd 'pump') */obs.push(b)}
  rtLights(g,G.lights,0xfff4dc,1,12);return G}catch(e){conLog('error','route 13 gas station: '+e.message);return{pumps:[]}}}
function rtShopB(g){try{rtPut(g,rtShopFront)}catch(e){conLog('error','route 13 shop front: '+e.message)}}

/* ---- the car wash: [E] in the bay, the car is pulled through, the brushes close in ---- */
function rtWashSign(on){const S=RTW.W&&RTW.W.parts.sign;if(!S)return;for(const k in S){const m=S[k].material;if(m&&m.color)m.color.setScalar(k===on?1:.18)}}
/* cars that fit between the brushes at rest and under the top brush (about 2 m clear) */
function rtWashFits(v){const K=v&&v.K;if(!K||K.plane||K.heli||K.bus||K.fly||v.wreck||(K.w||2)>2.6||(K.len||4)>7.5)return false;const T=rtCarTop(v);return Math.max.apply(null,T.top)<=2.05}
function rtWashCan(q){const s=q.seat;if(!RTW.W||!s||s.i!==0||RTW.st||RTW.rem)return null;const v=s.v;if(!rtWashFits(v)||RTW.cool===v)return null;
 if(v.x<58||v.x>74||Math.abs(v.z+1005)>2.4||Math.abs(v.v)>1.5||(v.y||0)>.5)return null;return v}
/* the car's roof height along its length (sampled once from its meshes, in the car's own frame; the front is -z) */
function rtCarTop(v){if(v.rtTop)return v.rtTop;const N=24,hl=(v.K.len||4)/2,top=new Array(N).fill(.6);try{const m=v.m;m.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(m.matrixWorld).invert(),M=new THREE.Matrix4(),b=new THREE.Box3();
  m.traverse(o=>{if(!o.isMesh||!o.visible||!o.geometry)return;if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();M.multiplyMatrices(inv,o.matrixWorld);b.copy(o.geometry.boundingBox).applyMatrix4(M);if(b.isEmpty()||b.max.y>4||b.max.x-b.min.x>6)return;
   /* along the length: dx (towards the front) = -z */const a=Math.floor((-b.max.z+hl)/(2*hl)*N),c=Math.floor((-b.min.z+hl)/(2*hl)*N);for(let i=Math.max(0,a);i<=Math.min(N-1,c);i++)top[i]=Math.max(top[i],b.max.y)})}catch(e){}
 return v.rtTop={N,hl,top}}
function rtCarInfo(v){if(!v||!v.m)return null;const T=rtCarTop(v),y=v.y||0;return{x:v.x,z:v.z,hw:(v.K.w||2)/2,hl:(v.K.len||4)/2,top:dx=>{const i=Math.max(0,Math.min(T.N-1,Math.floor((dx+T.hl)/(2*T.hl)*T.N)));return T.top[i]+y}}}
function rtWashStart(q,v){if(!PAY(5,'🫧 "Five gold." The car wash does not do credit. Neither does El Goblino.'))return;
 const hl=(v.K.len||4)/2,xs=v.x,xe=Math.max(xs+4,76.3+hl);RTW.st={v,t:0,T:8,xs,xe,h0:v.h,z0:v.z,bz:0,fx:0,dry:0,net:.5};rtWashSign('stop');
 snd(220,.3);setTimeout(()=>snd(160,.4),250);hint('🫧 STAY IN YOUR CAR. The belt grabs your wheels and pulls you in...');
 try{xmNet(q,'rtw',{v:q.vehs.indexOf(v),on:1,p:0})}catch(e){}}
function rtWashEnd(q){const S=RTW.st;if(!S)return;const v=S.v;RTW.st=null;RTW.cool=v;rtWashSign('go');RTW.goT=4;
 v.dmg=Math.max(0,(v.dmg||0)-10);v.smk=0;try{v.m.traverse(o=>{if(o.isMesh&&o.userData.c0!=null){o.material.color.setHex(o.userData.c0);delete o.userData.c0}})}catch(e){}
 try{vfx('spark',v.x,1.4,v.z+q.OZ,{n:24,c:0xffffff})}catch(e){}snd(1500,.08);setTimeout(()=>snd(2000,.12),120);
 hint('✨ Squeaky clean! Scorch marks gone, and the car feels a little better. (+10% health) GO!');try{xmNet(q,'rtw',{v:q.vehs.indexOf(v),on:0})}catch(e){}}
function rtWashUpd(q,dt){const W=RTW.W;if(!W||!q.roam)return;const lz=P.z-q.OZ;if(Math.abs(P.x-71)>90||Math.abs(lz+1005)>90)return;
 const S=RTW.st;let car=null;
 if(S){const v=S.v;if(v.gone||v.wreck||!q.seat||q.seat.v!==v){/* got out or blew up: stop where it is */RTW.st=null;RTW.cool=v;rtWashSign('fwd');try{xmNet(q,'rtw',{v:q.vehs.indexOf(v),on:0})}catch(e){}}
  else{S.t+=dt;const f=Math.min(1,S.t/S.T),e=f*f*(3-2*f);v.x=S.xs+(S.xe-S.xs)*e;v.z+=(-1005-v.z)*Math.min(1,dt*3);let dh=-Math.PI/2-v.h;dh=Math.atan2(Math.sin(dh),Math.cos(dh));v.h+=dh*Math.min(1,dt*3);v.v=0;
   try{v.m.position.x=v.x;v.m.position.z=v.z;v.m.rotation.y=v.h}catch(x){}car=rtCarInfo(v);
   const jets=W.parts.jets;if(jets)jets.visible=f>.04&&f<.6;
   if((S.bz-=dt)<=0){S.bz=.45;snd(f<.75?80+Math.random()*30:55,.18)}
   if(f<.7&&(S.fx-=dt)<=0){S.fx=.22;try{vfx('puff',v.x+(Math.random()-.5)*2,.6+Math.random()*1.4,v.z+q.OZ+(Math.random()<.5?-1:1)*(1+Math.random()*.6),{n:2,c:0xf4f8ff})}catch(x){}}
   if(f>.75&&!S.dry){S.dry=1;snd(60,.9);snd(90,.9);hint('💨 The dryer ROARS. Your hair has never been this dry.')}
   if((S.net-=dt)<=0){S.net=.5;try{xmNet(q,'rtw',{v:q.vehs.indexOf(v),on:1,p:+f.toFixed(2)})}catch(x){}}
   if(f>=1)rtWashEnd(q)}}
 else if(RTW.rem){const R=RTW.rem,v=R.v;if(!v||v.gone||v.wreck||q.rt-R.t>12){RTW.rem=null;rtWashSign('fwd')}else{car=rtCarInfo(v);const jets=W.parts.jets;if(jets)jets.visible=R.p>.04&&R.p<.6}}
 else{const jets=W.parts.jets;if(jets&&jets.visible)jets.visible=false}
 if(RTW.goT>0&&(RTW.goT-=dt)<=0)rtWashSign('fwd');
 if(RTW.cool&&(RTW.cool.x<56||RTW.cool.x>82||Math.abs(RTW.cool.z+1005)>5))RTW.cool=null;
 rtWashTick(W,car,dt)}
XM.net.rtw=o=>{const q=BUS.ride;if(!q||!RTW.W)return;const v=q.vehs&&q.vehs[o.v|0];if(o.on){if(!RTW.rem)rtWashSign('stop');RTW.rem={v,t:q.rt,p:+o.p||0}}else{if(RTW.rem){RTW.rem=null;rtWashSign('go');RTW.goT=4}}};
{const f0=busRoamUpd;busRoamUpd=function(q,dt){const r=f0.apply(this,arguments);try{rtWashUpd(q,dt)}catch(e){conLog('error','car wash: '+e.message);RTW.st=null}try{rtKeepTick(q)}catch(e){}return r}}
{const f0=vehPrompt;vehPrompt=function(q){try{if(RTW.st&&q.seat&&q.seat.v===RTW.st.v)return['🫧 Washing... stay in the car',0];const v=rtWashCan(q);if(v&&gold>=5)return['[E] Wash the car (5 🪙, you have '+gold+')',1]}catch(e){}return f0.apply(this,arguments)}}
{const f0=vehAct;vehAct=function(q){try{if(RTW.st&&q.seat&&q.seat.v===RTW.st.v)return true;const v=rtWashCan(q);if(v&&gold>=5){rtWashStart(q,v);return true}}catch(e){}return f0.apply(this,arguments)}}

/* ---- desertLocs: Motel 13, turned round to face the town ---- */
function rtMotelB(q,g,STT){try{const M=rtPut(g,rtMotel),L=rtPut(g,rtMotelLot),PL=rtPut(g,rtMotelPool),S=M.spots;q.rtM={spots:S};
  rtObs(q.obs,M.obs);rtObs(q.obs,L.obs);rtObs(q.obs,PL.obs);q.plates=q.plates||[];for(const p of M.plates.concat(PL.plates))q.plates.push(p);
  rtLights(g,M.lights,0xfff0d0,.8,8);rtLights(g,L.lights,0xffe8c0,1,14);
  const an=(x,z,r,f)=>q.anims.push({x,z,r,f});
  /* the doors: they swing into the room, and only block while shut */
  const HN={10:'🛏️ Room 10: a bed, a TV showing static, and a phone book for a town of 6.',11:'🛏️ Room 11: it smells like sand. Everything does.',12:'🛏️ Room 12: someone has written on the bathroom mirror.',14:'🛏️ Room 14. Room 13 should be next door. It is not.',office:'🛎️ The office. Nobody behind the counter. The fan turns. The sign says BACK IN 13 MINUTES.'};
  for(const d of M.doors){const st={o:0,a:0},ob=d.ob,hg=d.hinge;rtKeepG(hg);const nm=d.n=='office'?'the office':'room '+d.n;
   an(d.x,d.z,60,dt=>{st.a+=((st.o?1.6:0)-st.a)*Math.min(1,dt*5);hg.rotation.y=-st.a});
   ob.dopen=()=>{if(st.o)return;st.o=1;const k=q.obs.indexOf(ob);if(k>=0)q.obs.splice(k,1);snd(110,.4);snd(70,.3);try{camShake(.2,.3)}catch(e){}};
   const tog=()=>{if(st.o&&Math.abs(P.x-d.x)<.7&&Math.abs(P.z-q.OZ-(-905))<.5)return;st.o=!st.o;snd(st.o?150:90,.15);const k=q.obs.indexOf(ob);if(st.o&&k>=0)q.obs.splice(k,1);else if(!st.o&&k<0)q.obs.push(ob);if(st.o&&!st.seen){st.seen=1;hint(HN[d.n]||'🚪 Open.')}};
   q.props.push({x:d.x,z:-906.0,r:1.4,txt:()=>'[E] '+(st.o?'Close':'Open')+' '+nm,act:tog},{x:d.x,z:-904.1,r:.9,txt:()=>'[E] '+(st.o?'Close':'Open')+' the door',act:tog})}
  /* the TVs (the noise game) */
  M.tvs.forEach(t=>{try{t.screen.material.map=STT;t.screen.material.needsUpdate=true}catch(e){}rtKeepG(t.tg);const TVO={tg:t.tg,x:t.x,z:t.z,off:0,n:0};(q.tvs=q.tvs||[]).push(TVO);t.o=TVO});
  S.rooms.forEach((sp,i)=>{const TVO=M.tvs[i]&&M.tvs[i].o,n=sp.n;
   if(TVO&&sp.tv)q.props.push({x:sp.tv[0],z:sp.tv[1],r:.9,txt:()=>TVO.off?'📺 The TV is face-down on the floor.':q.noise&&q.noise.tv===TVO?'[E] PUSH THE TV OFF THE DESK!':'[E] Change the channel',act:()=>{if(TVO.off)return;if(q.noise&&q.noise.tv===TVO){noisePush(q,TVO);return}snd(1400+Math.random()*400,.08);TVO.n++;if(!q.noise&&(TVO.n>=3||Math.random()<.3)){noiseOut(q,TVO);return}hint('📺 '+['Static.','Static, but louder.','A weather map. It is all one colour: HOT.','A shopping channel selling sand.','"...the Desert Bus has been running for 40 years. Nobody has ever got off." *static*','A very old cartoon about a door that opens itself.','An eye. Just an eye. It blinks. Static.'][Math.random()*7|0])}});
   if(sp.mirror)q.props.push({x:sp.mirror[0],z:sp.mirror[1],r:.7,txt:()=>'[E] Look in the mirror',act:()=>{snd(300,.1);hint(n==12?'🪞 In lipstick, on the mirror: "THE BUS NEVER STOPS." Underneath, smaller: "it does if you crash it"':'🪞 You look tired. And sandy.')}});
   if(sp.bed)q.props.push({x:sp.bed[0],z:sp.bed[1],r:.8,txt:()=>'[E] Lie down for a bit',act:()=>{try{bsF.style.transition='opacity .6s';bsF.style.background='#000';bsF.style.opacity=1;setTimeout(()=>{bsF.style.transition='opacity 1.2s';bsF.style.opacity=0},1400)}catch(e){}snd(200,.3);setTimeout(()=>hint('🛏️ You doze off... and wake up still in the desert. The bed is full of sand.'),1500)}});
   if(sp.d13)q.props.push({x:sp.d13[0],z:sp.d13[1],r:.9,txt:()=>'[E] Open door 13',act:()=>{snd(120,.2);if(!q.d13){q.d13=1;gold+=13;try{saveGame()}catch(e){}hint('🚪 Your hand hits flat wall. Door 13 is PAINTED ON. Very convincingly. Someone has tucked 13 gold into the paint. (+13)')}else hint('🚪 Still painted on.')}})});
  /* the office */
  if(S.fan){rtKeepG(S.fan);an(S.fan.position.x,S.fan.position.z,40,dt=>{S.fan.rotation.y+=dt*3.2})}
  let bell=0;if(S.bell)q.props.push({x:S.bell[0],z:S.bell[1],r:.8,txt:()=>'[E] Ring the bell',act:()=>{snd(2100,.25);setTimeout(()=>snd(2100,.15),90);hint(['🛎️ DING. Nobody comes. The sign says BACK IN 13 MINUTES.','🛎️ DING. DING. The sign still says BACK IN 13 MINUTES. It said that last time too.','🛎️ DING... somewhere in the back, a TV changes channel by itself.'][Math.min(2,bell++)])}});
  if(S.keys)q.props.push({x:S.keys[0],z:S.keys[1],r:.8,txt:()=>'[E] Look at the keys',act:()=>{snd(1200,.05);hint('🔑 Keys for 10, 11, 12 and 14 on their hooks. And one for 13, on its own hook. It does not fit anything. You checked.')}});
  if(S.book)q.props.push({x:S.book[0],z:S.book[1],r:.8,txt:()=>'[E] Read the guest book',act:()=>{snd(400,.05);hint('📖 Every name in the book is "A. Traveller". Every one checked in. None checked out.')}});
  /* the neon: the base game's 4% flicker; VACANCY stays lit */
  for(const n of L.neon||[]){rtKeep(n);n.material.transparent=true}an(RTM.neon[0],RTM.neon[1],120,dt=>{const on=Math.random()>.04;for(const n of L.neon)n.material.opacity=on?1:.3});
  /* the two guests' cars, nose to the walkway */
  (L.cars||[]).forEach(([x,z,ry],i)=>{const car=mkOldCar([0x9a3a2a,0x3a6a8a][i%2],{seat:0xe8e0d0});car.position.set(x,0,z);car.rotation.y=ry;g.add(car);q.obs.push({x0:x-1,x1:x+1,z0:z-2.4,z1:z+2.4,m:car,kd:'car'})});
  for(const r of L.mapR||[])q.mapR.push({x0:r[0],x1:r[1],z0:r[2],z1:r[3],c:r[4]});q.mapR.push({x0:56,x1:88,z0:-905,z1:-899,c:'#c8a070'},{x0:90.5,x1:101.5,z0:-907.5,z1:-899.5,c:'#b4afa6'},{x0:92.5,x1:99.5,z0:-905.5,z1:-901.5,c:'#3a90b8'});
  q.locs.push({nm:'Motel 13',x:76,z:-902,ic:'🏨'})}catch(e){conLog('error','route 13 motel: '+e.message)}}
/* the motel's back yard and the ice machine (xpMoreTown) */
function rtMotelBack(X){const{q,prop,anim,R}=X,S=q.rtM&&q.rtM.spots;if(!S)return;
 if(S.sheets){S.sheets.forEach(rtKeepG);anim(82.5,-895.6,60,dt=>{S.sheets.forEach((t,i)=>{t.rotation.x=Math.sin(q.rt*2.2+i)*.18})})}
 if(S.ice){const[ix,iz]=S.ice;let ct=0;anim(ix,iz,20,dt=>{if(ct>0)ct-=dt});
  prop(ix,iz,1.2,()=>ct>0?'🧊 The machine is thinking about it...':'[E] Get some ice (free!)',()=>{if(ct>0)return;ct=20;snd(120,.4);setTimeout(()=>{for(let i=0;i<6;i++)setTimeout(()=>snd(2000+R()*900,.03),i*70);HEAL(8);hint(['🧊 CLUNK. A cupful of ice. You press it to your neck. Civilisation. (+8 HP)','🧊 CLUNK. Ice, and a note frozen into it: "ROOM 13 IS BEHIND THE ICE MACHINE." It is not. You checked. (+8 HP)','🧊 CLUNK. The ice is shaped like little doors. (+8 HP)'][R()*3|0])},900)})}}

/* ---- desertLocs: the drive-in (the picture, the projector, the popcorn and the two cars stay) ---- */
function rtDriveB(q,g){try{const D=rtPut(g,rtDriveIn),H=rtPut(g,rtDriveHuts);rtObs(q.obs,D.obs);rtObs(q.obs,H.obs);rtLights(g,D.lights,0xfff0c8,1,12);rtLights(g,H.lights,0xffd090,.8,8);
  for(const r of D.mapR||[])q.mapR.push({x0:r[0],x1:r[1],z0:r[2],z1:r[3],c:r[4]});q.mapR.push({x0:-47.5,x1:-32.5,z0:-938.4,z1:-937.6,c:'#4a4a4a'},{x0:-30,x1:-26,z0:-921.5,z1:-918.5,c:'#e0c8a0'},{x0:-41.3,x1:-38.7,z0:-917.3,z1:-914.7,c:'#8a8a8a'});
  if(D.spots&&D.spots.ticket){const[tx,tz]=D.spots.ticket;q.props.push({x:tx,z:tz,r:1.3,txt:()=>'[E] Buy a ticket',act:()=>{snd(500,.06);hint('🎟️ The booth is empty. A sign says PAY AT THE SNACK BAR. The snack bar says PAY AT THE BOOTH.')}})}
  let sn=0;for(const[x,z]of D.posts||[])q.props.push({x,z,r:1.1,txt:()=>'[E] Hang the speaker on your window',act:()=>{snd(300+Math.random()*200,.15);setTimeout(()=>snd(180,.2),150);hint(['📢 *crackle* ...D O O R S... *crackle*','📢 *static* ...run... *static*','📢 A tinny organ, then: "...please do not open the door..." *crackle*'][sn++%3])}})}catch(e){conLog('error','route 13 drive-in: '+e.message)}}
/* ---- desertLocs: the Desert Bus depot (the bus, the portal and its glow stay) ---- */
function rtDepotB(q,g){try{const D=rtPut(g,rtDepot),S=D.spots||{};rtObs(q.obs,D.obs);q.plates=q.plates||[];for(const p of D.plates||[])q.plates.push(p);rtLights(g,D.lights,0xfff0d8,.9,10);
  for(const r of D.mapR||[])q.mapR.push({x0:r[0],x1:r[1],z0:r[2],z1:r[3],c:r[4]});
  const P2=(s,r,t,a)=>{if(s)q.props.push({x:s[0],z:s[1],r,txt:typeof t=='function'?t:()=>t,act:a})};
  P2(S.timetable,1.1,'[E] Read the timetable',()=>{snd(300,.06);hint('🚌 DESERT BUS · TUCSON ⇄ LAS VEGAS · 360 MI · ABOUT 5 MINUTES · NO STOPS. NO PAUSING.')});
  let dn=0;P2(S.board,1.3,'[E] Look at the departures',()=>{snd(600,.05);hint(['🪧 LAS VEGAS · NOW. LAS VEGAS · NOW. LAS VEGAS · ON TIME.','🪧 TUCSON · YOU ARE HERE.','🪧 ANYWHERE ELSE · NO.'][dn++%3])});
  P2(S.tickets,1.1,'[E] Buy a ticket',()=>{snd(500,.06);hint('🎫 No need. The bus is free. The bus is always free. That is the problem.')});
  let sc=0;P2(S.soda,1.1,()=>sc>0?'🥤 ...the machine is still rattling...':'[E] Buy a GWEEN SODA (2 🪙, you have '+gold+')',()=>{if(sc>0||!PAY(2,'🥤 Two gold. The machine does not do credit.'))return;sc=3;setTimeout(()=>{sc=0},3000);snd(250,.2);setTimeout(()=>snd(900,.06),400);HEAL(6);hint('🥤 KA-CHUNK. A can of GWEEN SODA. It is warm. It is green. (+6 HP)')})}catch(e){conLog('error','route 13 depot: '+e.message)}}
/* ---- desertLocs: the water tower (the ladder, perch and spray tag stay; the tag goes on the curved panel) ---- */
function rtTowerB(q,g){try{const T=rtPut(g,rtWaterTower);rtObs(q.obs,T.obs);q.rtTw=T;if(T.parts&&T.parts.tag)rtKeep(T.parts.tag)}catch(e){conLog('error','route 13 water tower: '+e.message)}q.locs.push({nm:'Water tower',x:58,z:-1060,ic:'🗼'})}
function rtTagUse(q,g,tag,tagT){const p=q.rtTw&&q.rtTw.parts&&q.rtTw.parts.tag;if(!p){tag.position.set(61.03,13.6,-1060);tag.rotation.y=Math.PI/2;g.add(tag);return}p.material.map=tagT;p.material.opacity=1;p.material.needsUpdate=true}
/* ---- the map: the forecourt, the car wash, the bus stop shelter (the shop and canopy rectangles come after these) ---- */
function rtMap(q){q.mapR.push({x0:3.5,x1:84.5,z0:-1013,z1:-993.5,c:'#b4afa6'},{x0:64,x1:78,z0:-1009,z1:-1001,c:'#e8e6e0'},{x0:5,x1:9.5,z0:-1050,z1:-1044.5,c:'#2e5a8a'})}
