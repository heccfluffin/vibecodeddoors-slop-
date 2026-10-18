/* Mirage Lake, the observatory, Dino Dan's and the railway (lake-rail.md). Needs fort-kit.js (fbKit) and airfield.js
   (afCanvas, afPlane, afTarmac). Desert-local coordinates, y up, +z north. Everything is noSeam.

   lkWater(g)  batch 1: the lake (same circle: LAKE 250,-1560, r 58) with turquoise shallows, ripples and sparkles,
               a wet-sand rim and the beach ring. Returns {tick(t)} (call every frame near the lake: drifts the
               ripples and twinkles the sparkles).
   lkShore(g)  palm clumps with reeds and rocks round the shore. Returns {obs, palms} (palms: crown groups; sway
               them with rotation.z = sin(t*.7 + i) * .03 if you like; they're dpKeep).
   lkPalm(h, lean)  one palm tree, h metres tall, leaning lean radians toward +x. Origin at the foot.
   lkPier(g)   the pier, rebuilt in place (x 248.4..251.6, z -1533..-1499, deck top y 0.6): planks, posts with
               bracing, rails, a bench and lamp at the end, a ladder, a tackle box and the fishing rod.
               Returns {obs, plate, rod, lampAt}: plate {x0,x1,z0,z1,y} as the old q.plates entry; rod is a Group,
               rotate rod.rotation.x like the old rod (-0.8 resting, -1.2 cast); lampAt {x,y,z} for the light.
   lkBait(g)   the bait shop at the foot of the pier (x 254..262, z -1500..-1493). Returns {obs, prop}.
*/
function lkKit(){if(lkKit.k)return lkKit.k;const f=fbKit(),k=Object.create(f);k.M=f.M;lkKit.k=k;return k}
const LKW={x:250,z:-1560,r:58};
const lkRand=s=>()=>((s=Math.imul(s^s>>>15,s|1)+0x6d2b79f5|0)>>>0)/4294967296;

function lkWater(g){const{x,z,r}=LKW;
 /* the water: deep blue in the middle, turquoise shallows in the last 9 m, a lighter lip at the edge */
 const wt=afCanvas(1024,1024,(c,w,h)=>{const cx=w/2,R=w/2,gr=c.createRadialGradient(cx,cx,0,cx,cx,R);gr.addColorStop(0,'#1a5a9a');gr.addColorStop(.6,'#1f6eac');gr.addColorStop(.8,'#2a8ac0');gr.addColorStop(.9,'#3ab4c8');gr.addColorStop(.97,'#6ad6d0');gr.addColorStop(1,'#9ae4d8');c.fillStyle=gr;c.fillRect(0,0,w,h);
  /* sandy bottom showing through the shallows */const rr=lkRand(5);for(let i=0;i<900;i++){const a=rr()*Math.PI*2,d=R*(.86+rr()*.14);c.fillStyle='rgba(230,214,170,'+(rr()*.12)+')';c.beginPath();c.arc(cx+Math.cos(a)*d,cx+Math.sin(a)*d,2+rr()*6,0,7);c.fill()}});
 const wm=new THREE.MeshStandardMaterial({map:wt,roughness:.08,metalness:.25,transparent:true,opacity:.92,polygonOffset:true,polygonOffsetUnits:-2});const w=new THREE.Mesh(new THREE.CircleGeometry(r,72),wm);w.rotation.x=-Math.PI/2;w.position.set(x,.04,z);g.add(w);
 /* ripples: a second, mostly clear layer of soft rings and streaks that drifts and turns slowly */
 const rt=afCanvas(512,512,(c,w,h)=>{c.clearRect(0,0,w,h);const rr=lkRand(9);c.strokeStyle='rgba(255,255,255,.18)';for(let i=0;i<70;i++){c.lineWidth=1+rr()*2;c.beginPath();const px=rr()*w,py=rr()*h,l=10+rr()*40;c.moveTo(px,py);c.quadraticCurveTo(px+l/2,py-3,px+l,py);c.stroke()}});rt.wrapS=rt.wrapT=THREE.RepeatWrapping;rt.repeat.set(6,6);
 const rp=new THREE.Mesh(new THREE.CircleGeometry(r-.3,72),new THREE.MeshBasicMaterial({map:rt,transparent:true,opacity:.55,depthWrite:false,polygonOffset:true,polygonOffsetUnits:-4}));rp.rotation.x=-Math.PI/2;rp.position.set(x,.045,z);g.add(rp);
 /* sparkles: little bright flecks that come and go */const sp=afCanvas(256,256,(c,w,h)=>{c.clearRect(0,0,w,h);const rr=lkRand(13);for(let i=0;i<40;i++){c.fillStyle='rgba(255,255,240,.9)';c.fillRect(rr()*w,rr()*h,2+rr()*3,1)}});sp.wrapS=sp.wrapT=THREE.RepeatWrapping;sp.repeat.set(10,10);
 const sk=new THREE.Mesh(new THREE.CircleGeometry(r-2,48),new THREE.MeshBasicMaterial({map:sp,transparent:true,opacity:.5,depthWrite:false,polygonOffset:true,polygonOffsetUnits:-5}));sk.rotation.x=-Math.PI/2;sk.position.set(x,.046,z);g.add(sk);
 /* the shore: one ring from the water's edge to 7 m out: a dark wet rim, then pale beach sand fading to the desert */
 const st=afCanvas(1024,1024,(c,w,h)=>{const cx=w/2,R=w/2,i0=r/(r+7);const gr=c.createRadialGradient(cx,cx,R*i0,cx,cx,R);gr.addColorStop(0,'#9a8a6a');gr.addColorStop(.18,'#b8a47e');gr.addColorStop(.3,'#ecdcb2');gr.addColorStop(.85,'#ead8ae');gr.addColorStop(1,'rgba(214,190,140,0)');c.fillStyle=gr;c.beginPath();c.arc(cx,cx,R,0,7);c.fill();const rr=lkRand(21);for(let i=0;i<4000;i++){const a=rr()*Math.PI*2,d=R*(i0+rr()*(1-i0));c.fillStyle=rr()<.5?'rgba(120,100,70,.12)':'rgba(255,250,230,.15)';c.fillRect(cx+Math.cos(a)*d,cx+Math.sin(a)*d,2,2)}});
 const sh=new THREE.Mesh(new THREE.RingGeometry(r-.2,r+7,72,1),new THREE.MeshStandardMaterial({map:st,roughness:1,transparent:true,polygonOffset:true,polygonOffsetUnits:-1}));sh.rotation.x=-Math.PI/2;sh.position.set(x,.035,z);g.add(sh);
 [w,rp,sk,sh].forEach(m=>m.userData.noSeam=true);rp.userData.dpKeep=1;sk.userData.dpKeep=1;
 return{tick:t=>{rt.offset.set(t*.004,t*.0025);rp.rotation.z=t*.004;sp.offset.set(Math.sin(t*.3)*.02,t*.01);sk.material.opacity=.35+.2*Math.sin(t*2.3)}}}

/* a palm: a curved, ringed trunk and a crown of drooping fronds with coconuts */
function lkPalm(h,lean){const g=new THREE.Group(),M=lkKit().M;const bark=afCanvas(64,128,(c,w,hh)=>{c.fillStyle='#8a6a48';c.fillRect(0,0,w,hh);for(let i=0;i<hh;i+=8){c.fillStyle='rgba(60,40,20,.45)';c.fillRect(0,i,w,2);c.fillStyle='rgba(200,170,120,.25)';c.fillRect(0,i+3,w,1)}});bark.wrapS=bark.wrapT=THREE.RepeatWrapping;bark.repeat.set(1,h/1.2);
 const pts=[];for(let i=0;i<=8;i++){const t=i/8;pts.push(new THREE.Vector3(Math.sin(t*1.3)*h*lean,t*h,0))}const curve=new THREE.CatmullRomCurve3(pts);const trunk=new THREE.Mesh(new THREE.TubeGeometry(curve,16,.22,10,false),new THREE.MeshStandardMaterial({map:bark,roughness:.95}));g.add(trunk);
 const base=new THREE.Mesh(new THREE.CylinderGeometry(.3,.42,.5,10),new THREE.MeshStandardMaterial({map:bark,roughness:.95}));base.position.y=.25;g.add(base);
 const top=curve.getPoint(1);const crown=new THREE.Group();crown.position.copy(top);g.add(crown);
 const leaf=afCanvas(64,256,(c,w,hh)=>{c.clearRect(0,0,w,hh);c.fillStyle='#3a7a2a';c.beginPath();c.moveTo(w/2,0);for(let i=0;i<=20;i++){const y=i/20*hh,ww=Math.sin(i/20*Math.PI)*w*.48;c.lineTo(w/2+ww*(i%2?1:.75),y)}for(let i=20;i>=0;i--){const y=i/20*hh,ww=Math.sin(i/20*Math.PI)*w*.48;c.lineTo(w/2-ww*(i%2?1:.75),y)}c.fill();c.strokeStyle='#6a9a3a';c.lineWidth=2;c.beginPath();c.moveTo(w/2,0);c.lineTo(w/2,hh);c.stroke()});
 const LM=new THREE.MeshStandardMaterial({map:leaf,transparent:true,alphaTest:.4,side:THREE.DoubleSide,roughness:.8});
 for(let i=0;i<9;i++){const a=i/9*Math.PI*2+(i%2)*.2,L=2.6+(i%3)*.4;const ge=new THREE.PlaneGeometry(.9,L,1,8);const p=ge.attributes.position;for(let j=0;j<p.count;j++){const y=p.getY(j)+L/2;p.setZ(j,-(y*y)/(L*1.6));p.setY(j,y)}ge.computeVertexNormals();const f=new THREE.Mesh(ge,LM);const piv=new THREE.Group();piv.rotation.y=a;crown.add(piv);f.rotation.x=-Math.PI/2+.5;piv.add(f)}
 for(let i=0;i<4;i++){const a=i/4*Math.PI*2+.4,cn=new THREE.Mesh(new THREE.SphereGeometry(.13,8,6),M(0x5a3a1e,{roughness:.7}));cn.position.set(Math.cos(a)*.22,-.18,Math.sin(a)*.22);crown.add(cn)}
 g.userData.crown=crown;crown.userData.dpKeep=1;g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return g}

function lkShore(g){const k=lkKit(),M=k.M,obs=[],palms=[],{x:LX,z:LZ}=LKW;
 const clumps=[[200,-1520],[192,-1545],[195,-1600],[215,-1625],[300,-1615],[312,-1590],[308,-1525],[290,-1508]];
 const rock=M(0x9a8a72,{roughness:.95}),reedM=M(0x6a8a3a,{roughness:.8}),reedTop=M(0x5a3a1e,{roughness:.8});
 clumps.forEach(([cx,cz],ci)=>{const rr=lkRand(100+ci);const out=Math.atan2(cz-LZ,cx-LX);/* lean the palms a little away from the water */
  const n=2+(ci%2);for(let i=0;i<n;i++){const a=out+(rr()-.5)*1.6,d=1+rr()*2.4,px=cx+Math.cos(a)*d,pz=cz+Math.sin(a)*d,h=7+rr()*4;const p=lkPalm(h,.06+rr()*.12);p.position.set(px,0,pz);p.rotation.y=-out+Math.PI/2+(rr()-.5)*.8;g.add(p);palms.push(p.userData.crown);obs.push({x0:px-.35,x1:px+.35,z0:pz-.35,z1:pz+.35})}
  /* reeds at the water's edge in front of the clump */for(let i=0;i<14;i++){const a=out+Math.PI+(rr()-.5)*.6,d=3+rr()*3,rx=cx+Math.cos(a)*d,rz=cz+Math.sin(a)*d,h=1+rr()*.8;const rd=new THREE.Mesh(new THREE.CylinderGeometry(.015,.03,h,4),reedM);rd.position.set(rx,h/2,rz);rd.rotation.set((rr()-.5)*.25,0,(rr()-.5)*.25);g.add(rd);if(i%3==0){const tp=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.22,6),reedTop);tp.position.set(rx,h-.05,rz);g.add(tp)}}
  /* a few rocks */for(let i=0;i<3;i++){const a=out+(rr()-.5)*2,d=2.5+rr()*3,s=.4+rr()*.7;const rk=new THREE.Mesh(new THREE.DodecahedronGeometry(s,0),rock);rk.position.set(cx+Math.cos(a)*d,s*.35,cz+Math.sin(a)*d);rk.scale.set(1,.6,1.1);rk.rotation.set(rr(),rr()*3,rr());g.add(rk)}});
 g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{obs,palms}}

function lkPier(g){const k=lkKit(),{B,C,rod,L}=k.H(g),M=k.M,obs=[],px=250,Z0=-1499,PL=34,Z1=Z0-PL,W=3.2,Y=.6;
 const wood=afCanvas(256,256,(c,w,h)=>{c.fillStyle='#8a6a48';c.fillRect(0,0,w,h);const rr=lkRand(3);for(let i=0;i<8;i++){const y=i*32;c.fillStyle='rgba(60,40,24,.55)';c.fillRect(0,y,w,2);for(let j=0;j<30;j++){c.fillStyle='rgba(50,34,20,'+(rr()*.15)+')';c.fillRect(0,y+2+rr()*28,w,1)}c.fillStyle='rgba(30,20,12,.6)';for(const nx of[18,w-22])c.fillRect(nx,y+12,3,3)}});wood.wrapS=wood.wrapT=THREE.RepeatWrapping;wood.repeat.set(1,PL/2.4);
 const WM=M(0x8a6a48,{roughness:.9}),PM=M(0x6a4a30,{roughness:.95});
 /* the deck: planks across (a texture), on two stringers */const dk=new THREE.Mesh(new THREE.BoxGeometry(W,.12,PL),[WM,WM,new THREE.MeshStandardMaterial({map:wood,roughness:.9}),WM,WM,WM]);dk.position.set(px,Y-.06,(Z0+Z1)/2);g.add(dk);/* stringers just under the deck (their tops 1 cm below it) */for(const s of[-1,1])B(.16,.24,PL,px+s*(W/2-.3),Y-.25,(Z0+Z1)/2,PM);
 /* posts every 4 m down into the water and the sand, with cross braces */for(let z=Z0-.3;z>=Z1;z-=4){for(const s of[-1,1])/* posts stop just under the deck, inside its edge */C(.12,.14,Y-.13+.8,px+s*(W/2-.2),(Y-.13-.8)/2,z,PM,null,null,8);rod([px-W/2+.1,Y-.16,z],[px+W/2-.1,-.3,z],.04,PM,null,5)}
 /* rails on both sides */for(const s of[-1,1]){const rx=px+s*(W/2-.06);for(let z=Z0-.3;z>=Z1+.1;z-=2)B(.09,.95,.09,rx,Y+.47,z,WM);B(.11,.07,PL-.2,rx,Y+.975,(Z0+Z1)/2-.1,WM);B(.05,.05,PL-.2,rx,Y+.55,(Z0+Z1)/2-.1,WM);obs.push({x0:rx-.06,x1:rx+.06,z0:Z1,z1:Z0,ped:1})}
 /* across the end: a rail with a gap for the ladder, the ladder down into the water */B(1.0,.07,.11,px-1.05,Y+.975,Z1+.05,WM);B(1.0,.07,.11,px+1.05,Y+.975,Z1+.05,WM);for(const s of[-1,1]){B(.09,.95,.09,px+s*.55,Y+.47,Z1+.05,WM)}for(const s of[-1,1])C(.03,.03,1.6,px+s*.3,Y-.2,Z1-.08,M(0x9a9ea4,{metalness:.6}),null,null,6);for(let y=Y-.85;y<Y;y+=.3)C(.02,.02,.6,px,y,Z1-.08,M(0x9a9ea4,{metalness:.6}),'x',null,6);
 obs.push({x0:px-W/2,x1:px-.5,z0:Z1-.06,z1:Z1+.12,ped:1},{x0:px+.5,x1:px+W/2,z0:Z1-.06,z1:Z1+.12,ped:1});
 /* the bench at the end, facing the water */{const bz=Z1+2.2;B(1.6,.06,.45,px+.6,Y+.45,bz,WM);B(1.6,.4,.05,px+.6,Y+.72,bz+.22,WM);for(const s of[-1,1])B(.06,.45,.42,px+.6+s*.72,Y+.22,bz,PM)}
 /* the lamp, the tackle box, the rod in its holder */const lampAt={x:px+1.25,y:Y+2.75,z:Z1+1};{C(.05,.06,2.6,lampAt.x,Y+1.3,lampAt.z,M(0x3a3a3a),null,null,8);B(.5,.05,.08,lampAt.x-.22,Y+2.62,lampAt.z,M(0x3a3a3a));const sh=C(.18,.24,.22,lampAt.x-.45,Y+2.5,lampAt.z,M(0x2a2a2a),null,null,10);C(.12,.12,.04,lampAt.x-.45,Y+2.38,lampAt.z,M(0xfff4d0,{emissive:0xffd890,emissiveIntensity:1}),null,null,10)}
 B(.6,.32,.36,px-1,Y+.16,Z1+1.5,M(0x8a2a2a,{roughness:.5}));B(.62,.04,.38,px-1,Y+.34,Z1+1.5,M(0x6a1a1a));B(.2,.05,.04,px-1,Y+.38,Z1+1.5,M(0x3a3a3a));
 const rodG=new THREE.Group();rodG.position.set(px-.6,Y+.6,Z1+.8);rodG.rotation.x=-.8;g.add(rodG);{const holder=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.5,8),M(0x3a3a3a));holder.position.set(px-.6,Y+.32,Z1+.8);g.add(holder);const r1=new THREE.Mesh(new THREE.CylinderGeometry(.012,.025,2.6,6),M(0x2a1a10));r1.position.y=1.3;rodG.add(r1);const reel=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.06,10),M(0x9a9ea4,{metalness:.6}));reel.rotation.z=Math.PI/2;reel.position.set(.05,.4,0);rodG.add(reel);const line=new THREE.Mesh(new THREE.CylinderGeometry(.003,.003,2.4,3),M(0xf0f0f0));line.position.set(0,2.3,-.0);line.rotation.x=0;rodG.add(line);rodG.userData.dpKeep=1}
 /* a small sign at the foot */{C(.04,.04,1.2,px+1.9,.6,Z0+.6,WM,null,null,6);L('PIER · FISHING AT THE END\nNO DIVING (IT IS 40 cm DEEP)',1.4,.5,'#f4ecd8','#2a4a6a',44,px+1.9,1.1,Z0+.63,0)}
 g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});rodG.traverse(m=>m.userData.dpKeep=1);return{obs,plate:{x0:px-W/2,x1:px+W/2,z0:Z1,z1:Z0,y:Y},rod:rodG,lampAt}}

function lkBait(g){const k=lkKit(),{B,C,rod,L}=k.H(g),M=k.M,obs=[],x0=254,x1=262,z0=-1500,z1=-1493,xc=(x0+x1)/2,zc=(z0+z1)/2,H=2.8;
 const board=afCanvas(128,128,(c,w,h)=>{c.fillStyle='#5a8a9a';c.fillRect(0,0,w,h);for(let i=0;i<w;i+=16){c.fillStyle='rgba(0,0,0,.18)';c.fillRect(i,0,2,h);c.fillStyle='rgba(255,255,255,.08)';c.fillRect(i+3,0,1,h)}for(let i=0;i<300;i++){c.fillStyle='rgba(240,230,210,.12)';c.fillRect(Math.random()*w,Math.random()*h,2,1)}});board.wrapS=board.wrapT=THREE.RepeatWrapping;
 const BM=M(0xffffff,{map:board,roughness:.9}),TR=M(0xf0ece4,{roughness:.8}),RF=M(0xc84a3a,{roughness:.7});
 /* the shack on short stilts, a counter window facing the road (west), a door at the back */B(.2,.3,z1-z0,xc,.15,zc,M(0x6a4a30));for(const[a,b]of[[x0+.3,z0+.3],[x1-.3,z0+.3],[x0+.3,z1-.3],[x1-.3,z1-.3]])B(.25,.4,.25,a,.2,b,M(0x6a4a30));
 B(x1-x0,H,z1-z0,xc,.4+H/2,zc,BM);/* corner trim */for(const[a,b]of[[x0,z0],[x1,z0],[x0,z1],[x1,z1]])B(.14,H,.14,a,.4+H/2,b,TR);
 /* the roof: a low pitch along x, overhanging the counter */{const rl=Math.hypot((z1-z0)/2+.4,.7);for(const s of[-1,1]){const r=B(x1-x0+1.6,.08,rl,xc-.3,.4+H+.35,zc+s*(((z1-z0)/2+.4)/2),RF);r.rotation.x=s*Math.atan2(.7,(z1-z0)/2+.4)}B(x1-x0+1.6,.1,.12,xc-.3,.4+H+.72,zc,M(0x8a2a2a))}
 /* the counter window, propped-up flap, the counter */B(.06,1,3.6,x0-.03,1.9,zc,M(0x1a2a30));B(.06,.06,3.8,x0-.05,2.43,zc,TR);B(.06,.06,3.8,x0-.05,1.37,zc,TR);/* the flap: hinged along the top of the window, swung out and a little up, held on two props from the sill */{const hx=x0-.06,hy=2.47,A=.3,FL=1.05;const pv=new THREE.Group();pv.position.set(hx,hy,zc);pv.rotation.z=-A;g.add(pv);const fl=new THREE.Mesh(new THREE.BoxGeometry(FL,.05,3.8),BM);fl.position.set(-FL/2,.03,0);pv.add(fl);C(.035,.035,3.8,hx,hy,zc,TR,'z',null,8);
  const ox=hx-FL*Math.cos(A)+.08,oy=hy+FL*Math.sin(A)-.02;for(const dz of[-1.7,1.7])rod([x0-.08,1.42,zc+dz],[ox,oy,zc+dz],.02,TR,null,4)}
 B(.6,.06,3.8,x0-.28,1.34,zc,M(0x6a4a30));for(const dz of[-1.7,1.7])B(.06,.4,.06,x0-.5,1.12,zc+dz,M(0x6a4a30));
 /* on the counter: a bell, a jar of worms; under the window: a LIVE WORMS cooler, a rod rack */C(.06,.08,.06,x0-.35,1.4,zc-1.1,M(0xd8b040,{metalness:.7}),null,null,10);C(.1,.1,.2,x0-.3,1.47,zc+1,M(0x8ac0c0,{transparent:true,opacity:.6}),null,null,10);
 B(.6,.5,.9,x0-.6,.65,zc+2.6,M(0xf0f0f0));L('LIVE\nWORMS',.8,.4,'#f0f0f0','#c42828',44,x0-.91,.7,zc+2.6,-Math.PI/2);
 for(let i=0;i<4;i++)rod([x0-.15,.45,z0+.4+i*.35],[x0-.3,2.5,z0+.4+i*.35],.015,M(0x2a1a10),null,4);B(.1,.06,1.5,x0-.2,.9,z0+.9,M(0x6a4a30));
 /* the sign on the roof ridge and a wooden fish */L('BAIT · TACKLE · BREAD',6,.8,'#2a4a6a','#ffe0a0',64,xc-.3,.4+H+1.3,zc,-Math.PI/2);B(.08,.9,.08,xc-.3,.4+H+.95,zc-2.4,M(0x6a4a30));B(.08,.9,.08,xc-.3,.4+H+.95,zc+2.4,M(0x6a4a30));
 {const f=afCanvas(128,64,(c,w,h)=>{c.clearRect(0,0,w,h);c.fillStyle='#e8a040';c.beginPath();c.ellipse(52,32,44,20,0,0,7);c.fill();c.beginPath();c.moveTo(90,32);c.lineTo(124,10);c.lineTo(124,54);c.fill();c.fillStyle='#1a1a1a';c.beginPath();c.arc(24,28,4,0,7);c.fill()});const fm=new THREE.Mesh(new THREE.PlaneGeometry(1.6,.8),new THREE.MeshStandardMaterial({map:f,transparent:true,alphaTest:.4,side:THREE.DoubleSide}));fm.position.set(x0-.06,3.05,z0+.9);fm.rotation.y=-Math.PI/2;g.add(fm)}
 /* the back door and steps */B(.9,1.9,.05,x1-1.5,1.35,z1+.03,M(0x3a5a6a));B(1.1,.2,.5,x1-1.5,.3,z1+.35,M(0x6a4a30));
 obs.push({x0,x1,z0,z1});g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{obs,prop:{x:x0-1.4,z:zc}}}
