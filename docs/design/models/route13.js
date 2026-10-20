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
