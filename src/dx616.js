/* =====================================================================================================
   r620: GOBLINO'S SCRAP REWORK (docs/design/scrap-yard.md). The design chat's four model batches are copied below
   (syYard, syFlatCar, syStacks, syCrane, syCrusher, syBays, syTyres, syMonsterPad), then the wiring:
   - xpScrap and xpCrusher are redefined to build the new yard: a drive lane, sliding gates and a weighbridge, the office
     with El Goblino at the counter, two rows of flattened car stacks, the magnet crane, the crusher with its bay facing
     the lane, three scrap bays (the rummage pile is in the third), the tyre mountain and the monster truck's pad.
   - crushTick: the press reaches the car before it squashes, the cube tips into the melter's guillotine door, the
     ladle is a pot that tips, and an ingot is priced by the car (crushPay).
   - crushOK: spawned cars and the Wraith can't be crushed (El Goblino says so).
   - Driving the yard's monster truck more than 15 m off its pad without owning one makes you wanted (+2 stars).
   build.py moves the monster truck's spawn to the pad and the rummage prop into bay 3.
   ===================================================================================================== */
/* =====================================================================================================
   Goblino's Scrap, rework. Needs fort-kit.js (fbKit). See scrap-yard.md.
   The yard: x 60..180, z -1380..-1300 (desert local), ground y 0. The gate is the gap in the west fence, z -1350..-1338.
   ===================================================================================================== */

/* ---- batch 1: the yard floor, the fence with barbed wire, the sliding gates, the weighbridge, the office, the sign, floodlights ---- */
function syYard(g){const k=fbKit(),{B,C,rod,L}=k.H(g),M=k.M;const X0=60,X1=180,Z0=-1380,Z1=-1300,obs=[];
 /* the floor: one gravel texture with the drive lane, oil stains and tyre tracks painted in (nothing to flicker) */
 const FW=1536,FH=1024,sx=FW/(X1-X0),sz=FH/(Z1-Z0),fx=x=>(x-X0)*sx,fz=z=>(z-Z0)*sz;
 const ft=k.tex(FW,FH,(c)=>{c.fillStyle='#8a7a62';c.fillRect(0,0,FW,FH);let sd=9191;const r=()=>((sd=Math.imul(sd^sd>>>15,sd|1)+0x6d2b79f5|0)>>>0)/4294967296;
  for(let i=0;i<14000;i++){const v=r();c.fillStyle=v<.5?'rgba(60,50,38,'+(.08+r()*.12)+')':'rgba(190,175,150,'+(.06+r()*.1)+')';const s=1+r()*3;c.fillRect(r()*FW,r()*FH,s,s)}
  /* the drive lane, packed darker, with two worn wheel tracks */c.fillStyle='rgba(70,62,52,.45)';c.fillRect(0,fz(-1347),FW,fz(-1341)-fz(-1347));c.fillStyle='rgba(45,40,34,.35)';for(const z of[-1345.6,-1342.4])c.fillRect(0,fz(z-.45),FW,.9*sz);
  /* the turn-in from the lane to the crusher bay (its mouth faces the lane, at z -1326.5) *//* its corners flare into the lane, and its wheel tracks curve round from the gate side, the way cars turn in */c.fillStyle='rgba(70,62,52,.42)';c.beginPath();c.moveTo(fx(86.5),fz(-1326.6));c.lineTo(fx(86.5),fz(-1337));c.quadraticCurveTo(fx(86.5),fz(-1341),fx(82.5),fz(-1341));c.lineTo(fx(97.5),fz(-1341));c.quadraticCurveTo(fx(93.5),fz(-1341),fx(93.5),fz(-1337));c.lineTo(fx(93.5),fz(-1326.6));c.closePath();c.fill();c.strokeStyle='rgba(45,40,34,.32)';c.lineWidth=.9*sx;c.lineCap='round';/* each turn-in track joins its own lane track: the inner one the near track (z -1342.4), the outer one the far track (z -1345.6) */for(const[x,zl,r]of[[88.4,-1342.4,4.3],[91.6,-1345.6,7.5]]){c.beginPath();c.moveTo(fx(x),fz(-1326.8));c.lineTo(fx(x),fz(zl+r));c.quadraticCurveTo(fx(x),fz(zl),fx(x-r),fz(zl));c.stroke()}
  /* aisles between the car stacks */c.fillStyle='rgba(70,62,52,.25)';c.fillRect(fx(84),fz(-1367.5),fx(166)-fx(84),5.5*sz);
  /* oil stains and rust stains */for(let i=0;i<70;i++){const x=r()*FW,y=r()*FH,s=(8+r()*40),gr=c.createRadialGradient(x,y,0,x,y,s);const rust=r()<.35;gr.addColorStop(0,rust?'rgba(120,60,30,.3)':'rgba(25,20,16,.4)');gr.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=gr;c.fillRect(x-s,y-s,2*s,2*s)}});
 ft.wrapS=ft.wrapT=THREE.ClampToEdgeWrapping;ft.anisotropy=8;{const fl=new THREE.Mesh(new THREE.PlaneGeometry(X1-X0,Z1-Z0),M(0xffffff,{map:ft,roughness:1}));fl.rotation.x=-Math.PI/2;fl.position.set((X0+X1)/2,.025,(Z0+Z1)/2);g.add(fl)}
 /* the fence: corrugated sheets in mixed rust and paint, 2.4 m, on posts every 3 m, with three strands of barbed wire on cranked arms */
 const cor=(base)=>{const t=k.tex(128,128,(c,w,h)=>{c.fillStyle=base;c.fillRect(0,0,w,h);for(let x=0;x<w;x+=8){const gr=c.createLinearGradient(x,0,x+8,0);gr.addColorStop(0,'rgba(0,0,0,.25)');gr.addColorStop(.5,'rgba(255,255,255,.12)');gr.addColorStop(1,'rgba(0,0,0,.25)');c.fillStyle=gr;c.fillRect(x,0,8,h)}let sd=base.length*77;const r=()=>((sd=Math.imul(sd^sd>>>15,sd|1)+0x6d2b79f5|0)>>>0)/4294967296;for(let i=0;i<30;i++){c.fillStyle='rgba(120,60,25,'+(.15+r()*.3)+')';c.beginPath();c.ellipse(r()*w,r()*h,3+r()*12,6+r()*24,0,0,7);c.fill()}c.fillStyle='rgba(100,50,20,.4)';c.fillRect(0,h-10,w,10)});t.repeat.set(1,1);return M(0xffffff,{map:t,roughness:.75,metalness:.35,side:THREE.DoubleSide})};
 const SH=[cor('#7a6a5a'),cor('#8a5a3a'),cor('#5a6a70'),cor('#6a6a58')],POST=M(0x4a4440,{metalness:.5,roughness:.6}),WIRE=M(0x6a6a6a,{metalness:.7,roughness:.4});
 const run=(ax,a0,a1,c0,inw)=>{/* a fence line along ax ('x' or 'z') at c0, from a0 to a1; inw = which side is the yard (barbs lean out) */let i=0;for(let a=a0;a<a1-.01;a+=3){const b=Math.min(a1,a+3),m=(a+b)/2,len=b-a;const p=new THREE.Mesh(new THREE.PlaneGeometry(len,2.4),SH[((i++*7+Math.round(a))%4+4)%4]/* (z is negative: keep the index positive, or the panel gets no material and shows plain white) */);if(ax=='x'){p.position.set(m,1.25,c0)}else{p.rotation.y=Math.PI/2;p.position.set(c0,1.25,m)}p.rotation.z=((i*13)%5-2)*.004;g.add(p)}
  for(let a=a0;a<=a1+.01;a+=3){const[x,z]=ax=='x'?[a,c0]:[c0,a];B(.12,2.9,.12,x,1.45,z,POST);const ox=ax=='x'?0:-inw*.4,oz=ax=='x'?-inw*.4:0;rod([x,2.85,z],[x+ox,3.25,z+oz],.025,POST)}
  for(let s=0;s<3;s++){const f=.35+s*.3;const ox=ax=='x'?0:-inw*.4*f,oz=ax=='x'?-inw*.4*f:0,y=2.85+.4*f;const[x0,z0,x1,z1]=ax=='x'?[a0,c0,a1,c0]:[c0,a0,c0,a1];rod([x0+ox,y,z0+oz],[x1+ox,y,z1+oz],.01,WIRE,null,4)}};
 run('x',X0,X1,Z0,1);run('x',X0,X1,Z1,-1);run('z',Z0,Z1,X1,-1);run('z',Z0,-1350,X0,1);run('z',-1338,Z1,X0,1);
 /* the gate: two steel-framed mesh leaves on a ground track, slid open behind the fence (outside, along the west line); a gate post each side with a lamp */
 {const MESH=k.tex(128,128,(c,w,h)=>{c.clearRect(0,0,w,h);c.strokeStyle='#8a8e92';c.lineWidth=3;for(let i=-w;i<w*2;i+=14){c.beginPath();c.moveTo(i,0);c.lineTo(i+h,h);c.stroke();c.beginPath();c.moveTo(i,h);c.lineTo(i+h,0);c.stroke()}});MESH.repeat.set(4,2);
  const MM=new THREE.MeshStandardMaterial({map:MESH,transparent:true,alphaTest:.3,side:THREE.DoubleSide,metalness:.5,roughness:.5}),FR=M(0xd8a020,{metalness:.35,roughness:.5});
  for(const[zc,dir]of[[-1353,-1],[-1335,1]]){const x=X0-.45;const p=new THREE.Mesh(new THREE.PlaneGeometry(6,2.2),MM);p.rotation.y=Math.PI/2;p.position.set(x,1.35,zc);g.add(p);
   for(const y of[.25,2.45])B(.08,.08,6,x,y,zc,FR);for(const dz of[-3,-1,1,3])B(.08,2.3,.08,x,1.35,zc+dz,FR);rod([x,.3,zc-3],[x,2.4,zc+3],.03,FR);for(const dz of[-2.4,2.4])C(.12,.12,.08,x,.12,zc+dz,M(0x2a2a2a),'x',null,10)}
  B(.12,.03,30,X0-.45,.015,-1344,M(0x5a5a5a,{metalness:.6}));/* the track along the outside */
  for(const z of[-1350.2,-1337.8]){B(.3,3.2,.3,X0,1.6,z,FR);C(.12,.16,.25,X0,3.3,z,M(0x2a2a2a),null,null,10);const lp=new THREE.Mesh(new THREE.SphereGeometry(.1,8,6),M(0xffe0a0,{emissive:0xffc060,emissiveIntensity:1}));lp.position.set(X0,3.48,z);g.add(lp);obs.push({x0:X0-.25,x1:X0+.25,z0:z-.25,z1:z+.25})}
  L('OPEN 9-5 · MAYBE',1.6,.32,'#1a1a1a','#e8c020',60,X0-.2,2.6,-1351.6,-Math.PI/2)}
 /* the weighbridge: a steel deck on a concrete pit edge, ramped both ends, a readout on a post facing the lane */
 {const wx0=64,wx1=74,wz0=-1347,wz1=-1341,cx=(wx0+wx1)/2,cz=(wz0+wz1)/2;B(wx1-wx0+.4,.18,wz1-wz0+.4,cx,.09,cz,k.PRE);const DP=M(0x6a6e72,{metalness:.6,roughness:.45});DP.map=k.tex(64,64,(c,w,h)=>{c.fillStyle='#6a6e72';c.fillRect(0,0,w,h);c.fillStyle='rgba(0,0,0,.3)';for(let y=4;y<h;y+=8)for(let x=(y/8%2)*4+2;x<w;x+=8){c.fillRect(x,y,4,1.5)}});DP.map.repeat.set(10,6);
  B(wx1-wx0,.06,wz1-wz0,cx,.21,cz,DP);for(const ex of[wx0-.6,wx1+.6]){const rp=B(1.2,.06,wz1-wz0,ex,.1,cz,DP);rp.rotation.z=ex<cx?-.16:.16}for(const s of[-1,1])B(wx1-wx0,.1,.1,cx,.25,cz+s*(wz1-wz0)/2,M(0xd8a020));
  B(.15,1.6,.15,wx1-1,.8,wz0-.6,M(0x3a3a3a));B(.9,.45,.12,wx1-1,1.75,wz0-.55,M(0x1a1a1a));L('8.20 t',.8,.3,'#0a0a0a','#ff3020',60,wx1-1,1.75,wz0-.485,0)}
 /* the office: a site cabin on blocks with a counter window onto the lane (El Goblino stands inside it), a door, steps, an aircon, a sign on the roof */
 {const ox=68,oz=-1360,W=8,D=7.6,H=2.7,y0=.35;const WL=M(0xd8ccb0,{roughness:.8}),TRIM=M(0x8a5a2a,{roughness:.6}),GLM=new THREE.MeshStandardMaterial({color:0x2a3a4a,metalness:.4,roughness:.15,transparent:true,opacity:.55});
  for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1],[0,-1],[0,1]])B(.4,y0,.4,ox+a*(W/2-.3),y0/2,oz+b*(D/2-.3),k.PRE);
  const zf=oz+D/2;/* walls: back and sides solid, the front (lane side) with the counter window and a window */B(W,.12,D,ox,y0+.06,oz,TRIM);B(W,H,.12,ox,y0+H/2,oz-D/2+.06,WL);for(const s of[-1,1])B(.12,H,D,ox+s*(W/2-.06),y0+H/2,oz,WL);
  /* front wall pieces round the counter hatch (x ox-1.6..ox+.4, y 1.0..2.1 above the floor) and the door (x ox+2..ox+3) */const fy=(a,b)=>[y0+a,b-a];
  const fw=(x0,x1,ya,yb)=>B(x1-x0,yb-ya,.12,(x0+x1)/2,y0+(ya+yb)/2,zf-.06,WL);fw(ox-W/2,ox-1.6,0,H);fw(ox+.4,ox+2,0,H);fw(ox+3,ox+W/2,0,H);fw(ox-1.6,ox+.4,0,1.0);fw(ox-1.6,ox+.4,2.1,H);fw(ox+2,ox+3,2.1,H);
  B(2.2,.08,.5,ox-.6,y0+1.04,zf+.15,TRIM);/* the counter */B(2.3,.06,.7,ox-.6,y0+2.18,zf+.3,M(0xc03020,{metalness:.3}));/* a red awning over it */for(const s of[-1,1])rod([ox-.6+s*1.1,y0+2.1,zf],[ox-.6+s*1.1,y0+2.15,zf+.62],.02,TRIM);
  {const d=B(.95,2.05,.06,ox+2.5,y0+1.03,zf+.02,TRIM);B(.08,.08,.05,ox+2.85,y0+1.0,zf+.07,M(0xc0a040,{metalness:.8}))}for(let i=0;i<2;i++)B(1.2,.12,.35,ox+2.5,.06+i*.15,zf+.55-i*.3,k.PRE);
  {const gw=new THREE.Mesh(new THREE.PlaneGeometry(1.2,.8),GLM);gw.position.set(ox-3,y0+1.6,zf+.005);g.add(gw);B(1.3,.06,.1,ox-3,y0+1.18,zf+.03,TRIM)}
  B(W+.4,.14,D+.4,ox,y0+H+.07,oz,M(0x4a4a4a,{metalness:.4}));B(.8,.55,.5,ox+3.4,y0+H+.42,oz-2.6,M(0xd0d0c8));
  B(5.4,1.0,.1,ox,y0+H+.75,zf-.2,M(0x2a1a10));L("GOBLINO'S SCRAP · OFFICE",5.2,.9,'#8a2a1a','#ffe0a0',60,ox,y0+H+.75,zf-.14,0);for(const s of[-2.2,2.2])B(.08,.6,.08,ox+s,y0+H+.3,zf-.25,TRIM);
  /* inside, behind the counter: a desk, a till, a calendar, a safe */B(2.0,.8,.6,ox-.6,y0+.4,zf-.6,TRIM);B(.4,.25,.3,ox-1.2,y0+.93,zf-.6,M(0x2a2a2a));B(.5,.6,.05,ox+1,y0+1.6,oz-D/2+.13,M(0xf0e8d0));B(.7,.8,.6,ox-3.2,y0+.4,oz-D/2+.5,M(0x3a4a3a,{metalness:.5}));
  obs.push({x0:ox-W/2-.1,x1:ox+W/2+.1,z0:oz-D/2-.1,z1:zf+.1})}
 /* the entrance sign outside: hubcaps nailed to a board on two posts */
 {const sx=54,sz=-1352;for(const dz of[-1.8,1.8])B(.18,4.2,.18,sx,2.1,sz+dz,M(0x5a4030));B(.12,1.5,4.4,sx,3.3,sz,M(0x6a4a2a));L("GOBLINO'S SCRAP\nWE CRUSH · WE SELL · WE CRUSH AGAIN",4.2,1.3,'#8a5a2a','#ffe0a0',60,sx+.065,3.3,sz,Math.PI/2);L("GOBLINO'S SCRAP\nWE CRUSH · WE SELL · WE CRUSH AGAIN",4.2,1.3,'#8a5a2a','#ffe0a0',60,sx-.065,3.3,sz,-Math.PI/2);
  for(const dz of[-2.4,2.4]){const hc=C(.32,.32,.04,sx+.09,3.3,sz+dz,M(0xc8ccd0,{metalness:.85,roughness:.25}),'x',null,16);C(.12,.12,.06,sx+.1,3.3,sz+dz,M(0x8a8e92,{metalness:.8}),'x',null,10)}obs.push({x0:sx-.2,x1:sx+.2,z0:sz-2,z1:sz+2})}
 /* floodlights in the four corners */for(const[x,z]of[[62,-1378],[178,-1378],[62,-1302],[178,-1302]]){B(.6,.3,.6,x,.15,z,k.PRE);C(.1,.14,8,x,4.2,z,M(0x5a5e64,{metalness:.6}),null,null,10);const ax=x<120?1:-1,az=z<-1340?1:-1;B(1.2,.1,.1,x,8.1,z,M(0x5a5e64,{metalness:.6}));for(const s of[-.45,.45]){const hd=B(.36,.24,.3,x+s,8.0,z+az*.15,M(0x3a3a3a));hd.rotation.x=az*.5;const lm=new THREE.Mesh(new THREE.PlaneGeometry(.3,.2),M(0xfff0d0,{emissive:0xfff0d0,emissiveIntensity:1}));lm.position.set(x+s,7.9,z+az*.31);lm.rotation.x=-az*Math.PI/2+az*.5*0-Math.PI*0;lm.rotation.y=az<0?Math.PI:0;g.add(lm)}obs.push({x0:x-.3,x1:x+.3,z0:z-.3,z1:z+.3})}
 g.traverse(o=>{if(o.isMesh)o.userData.noSeam=true});return{obs}}

/* ---- batch 2: the car stacks and the magnet crane ---- */
/* a flattened car: a crumpled slab in the car's paint, the window band, a door seam, a squashed wheel arch, rust; about 4.2 x 1.9 x .55 */
function syFlatCar(col,seed){const k=fbKit(),M=k.M;let sd=seed|0||7;const r=()=>((sd=Math.imul(sd^sd>>>15,sd|1)+0x6d2b79f5|0)>>>0)/4294967296;
 const hex='#'+col.toString(16).padStart(6,'0');const side=k.tex(256,64,(c,w,h)=>{c.fillStyle=hex;c.fillRect(0,0,w,h);c.fillStyle='rgba(20,22,26,.85)';c.beginPath();c.moveTo(w*.22,h*.12);c.lineTo(w*.72,h*.12);c.lineTo(w*.8,h*.45);c.lineTo(w*.16,h*.45);c.closePath();c.fill();
  c.strokeStyle='rgba(0,0,0,.45)';c.lineWidth=2;for(const x of[.47,.7])c.strokeRect(w*x,h*.1,1,h*.8);c.fillStyle='rgba(20,20,20,.9)';for(const x of[.18,.8]){c.beginPath();c.ellipse(w*x,h,w*.08,h*.45,0,Math.PI,0);c.fill()}
  for(let i=0;i<14;i++){c.fillStyle='rgba(120,60,25,'+(.2+r()*.4)+')';c.beginPath();c.ellipse(r()*w,r()*h,4+r()*16,2+r()*8,r()*3,0,7);c.fill()}for(let i=0;i<10;i++){c.strokeStyle='rgba(0,0,0,.3)';c.lineWidth=1;c.beginPath();c.moveTo(r()*w,r()*h);c.lineTo(r()*w,r()*h);c.stroke()}});
 const SM=M(0xffffff,{map:side,roughness:.7,metalness:.35}),TOP=M(col,{roughness:.6,metalness:.35}),UN=M(0x2a2622,{roughness:.9});
 const geo=new THREE.BoxGeometry(4.2,.55,1.9,8,1,4);const p=geo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);p.setY(i,y+(r()-.5)*.12+(y>0?Math.sin(x*1.3+seed)*.06:0));p.setZ(i,z+(r()-.5)*.1);p.setX(i,x+(r()-.5)*.06)}geo.computeVertexNormals();
 return new THREE.Mesh(geo,[SM,SM,TOP,UN,SM,SM])}
function syStacks(g){const k=fbKit(),obs=[];const COLS=[0x8a6a3a,0x3a5a8a,0xa03030,0x6a8a4a,0xd8d8d8,0x2a2a2a,0xc8a020,0x4a7a8a];let n=0;
 for(const z of[-1373,-1361])for(let x=88;x<=148;x+=10){const hgt=2+((x*7+z)%3+3)%3;for(let i=0;i<hgt;i++){const c=syFlatCar(COLS[(n+i*3)%COLS.length],n*13+i*7+1);c.position.set(x+((i*37)%5-2)*.06,.3+i*.56,z+((i*17)%5-2)*.06);c.rotation.y=(i%2?Math.PI/2:0)+((i*29)%7-3)*.03;g.add(c)}n++;obs.push({x0:x-2.4,x1:x+2.4,z0:z-2.4,z1:z+2.4})}
 g.traverse(o=>{if(o.isMesh)o.userData.noSeam=true});return{obs}}

/* the magnet crane: a tracked material handler. arm (slews on y), a box boom with its rams, a cable (cb) to the magnet (mg),
   a flattened car (held) under the magnet. tick(t) runs the same motion the game had; tipY is the cable's top in arm space. */
function syCrane(g,cx,cz){const k=fbKit(),M=k.M;const YL=M(0xe8b818,{roughness:.5,metalness:.3}),DK=M(0x22252a,{roughness:.6,metalness:.4}),ST=M(0x9aa0a8,{metalness:.85,roughness:.25}),GL=new THREE.MeshStandardMaterial({color:0x1a2a38,metalness:.6,roughness:.1,transparent:true,opacity:.7});
 const base=new THREE.Group();base.position.set(cx,0,cz);g.add(base);const Bs=k.H(base);
 /* the undercarriage: two crawler frames, sprocket and idler, rollers, a track band with grousers; the slewing ring */
 for(const sd of[-1,1]){const tz=sd*1.5;Bs.B(4.2,.55,.6,0,.55,tz,DK);for(const ex of[-2.1,2.1])Bs.C(.44,.44,.62,ex,.46,tz,DK,'z',null,16);for(let i=-3;i<=3;i++)Bs.C(.15,.15,.6,i*.55,.18,tz,ST,'z',null,10);Bs.B(4.3,.08,.66,0,.92,tz,DK);Bs.B(4.3,.08,.66,0,.04,tz,DK);for(let i=0;i<20;i++)Bs.B(.08,.06,.68,-2.1+i*.22,.97,tz,DK)}
 Bs.B(2.2,.35,2.6,0,.8,0,DK);Bs.C(1.2,1.3,.35,0,1.12,0,DK,null,null,22);
 const arm=new THREE.Group();arm.position.set(cx,2.6,cz);arm.userData.mv=1;arm.userData.dpKeep=1;g.add(arm);const A=k.H(arm);
 /* upper: deck, engine house with louvres, counterweight with stripes, the cab raised on a riser with a ladder */
 A.B(4.2,.3,3.0,-.4,-1.15,0,DK);A.B(2.0,1.4,2.8,-1.4,-.3,0,YL);for(let i=0;i<6;i++)A.B(1.2,.04,.06,-1.6,-.6+i*.12,1.42,DK);A.B(.8,1.3,3.0,-2.8,-.35,0,DK);for(let i=0;i<4;i++)A.B(.82,.12,.5,-2.8,-.5+i*.3,1.26-i*.0,i%2?YL:DK).position.z=1.26;
 A.C(.08,.09,.8,-1.0,.8,-.9,DK,null,null,8);
 /* the riser: a steel box with panel seams and a hose run */A.B(.5,1.6,.5,.6,-.2,.95,DK);for(const y of[-.6,.2])A.B(.52,.04,.52,.6,y,.95,M(0x3a3e44,{metalness:.5}));A.rod([.36,-.95,.75],[.36,.55,.75],.025,M(0x111111));const cab=new THREE.Group();cab.position.set(.6,1.1,.95);arm.add(cab);const Cb=k.H(cab);Cb.B(1.4,.1,1.2,0,-.5,0,YL);Cb.B(1.4,.1,1.2,0,.85,0,YL);for(const[a,b]of[[-.65,-.55],[.65,-.55],[-.65,.55],[.65,.55]])Cb.B(.08,1.35,.08,a,.18,b,YL);Cb.B(1.3,1.3,1.1,0,.18,0,GL);/* inside: a seat on a pedestal with two joystick consoles on its armrests, a dash under the front window */Cb.B(.22,.22,.22,-.2,-.34,0,DK);Cb.B(.5,.1,.5,-.2,-.18,0,M(0x3a3a40,{roughness:.9}));const bk=Cb.B(.1,.6,.48,-.46,.14,0,M(0x3a3a40,{roughness:.9}));bk.rotation.z=-.12;for(const sz of[-.3,.3]){Cb.B(.36,.12,.1,-.14,-.07,sz,DK);Cb.C(.018,.018,.14,-.02,.06,sz,DK,null,null,6);Cb.C(.035,.035,.04,-.02,.14,sz,M(0xc02020),null,null,8)}Cb.B(.16,.36,.9,.54,-.27,0,DK);{const sc=Cb.B(.02,.14,.22,.45,-.05,0,M(0x103020,{emissive:0x10a040,emissiveIntensity:.6}));sc.rotation.z=.4}/* a door handle on the ladder side */Cb.B(.16,.04,.04,.4,.15,.56,M(0xb8bcc0,{metalness:.8}));Cb.B(.2,.12,.12,.72,.75,0,M(0xfff0c0,{emissive:0xffe0a0,emissiveIntensity:1}));Cb.C(.08,.08,.12,0,.97,0,M(0xff8000,{emissive:0xff6000,emissiveIntensity:.4}),null,null,10);
 /* the ladder up the riser's outer face, from the deck to just under the cab floor, with a grab handle on the cab's outside */for(const lx of[.42,.78])A.B(.05,1.6,.05,lx,-.25,1.24,DK);for(let i=0;i<5;i++)A.B(.36,.04,.04,.6,-.85+i*.28,1.24,DK);A.B(.04,.5,.04,1.33,1.25,1.4,DK);
 /* the boom: a box section from the foot (0.4, -.3) to the tip at (11.5, 4.2), a sheave at the tip, two lift rams */
 const foot=[.6,-.4],tip=[11.5,4.2],bl=Math.hypot(tip[0]-foot[0],tip[1]-foot[1]),ang=Math.atan2(tip[1]-foot[1],tip[0]-foot[0]);const bm=new THREE.Group();bm.position.set(foot[0],foot[1],0);bm.rotation.z=ang;arm.add(bm);const Bm=k.H(bm);
 Bm.B(bl,.55,.5,bl/2,0,0,YL);for(let i=1;i<6;i++)Bm.B(.04,.57,.52,i*bl/6,0,0,DK);Bm.B(bl,.04,.52,bl/2,.29,0,DK);Bm.C(.3,.3,.3,0,0,0,DK,'z',null,14);Bm.C(.32,.32,.2,bl,0,0,DK,'z',null,14);
 A.C(.06,.06,.56,tip[0],tip[1],0,ST,'z',null,8);for(const sz of[-.35,.35]){A.rod([-.2,-.9,sz],[3.2,1.0,sz],.13,DK);A.rod([1.4,.0,sz],[3.2,1.0,sz],.08,ST)}
 /* the cable (unit length, scaled), the magnet (a disc with ribs, a junction box, chains), the car under it */
 const cb=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,1,6),DK);cb.position.set(tip[0],1.7,0);arm.add(cb);
 const mg=new THREE.Group();mg.position.set(tip[0],-.4,0);arm.add(mg);{const G=k.H(mg);G.C(1.0,1.0,.4,0,0,0,M(0x5a5a5a,{metalness:.8,roughness:.35}),null,null,22);G.C(1.04,1.04,.08,0,-.18,0,DK,null,null,22);for(let i=0;i<6;i++){const rb=G.B(1.9,.1,.08,0,.22,0,DK);rb.rotation.y=i*Math.PI/6}G.B(.4,.25,.3,0,.32,0,M(0xc03020));for(const sx of[-.6,.6])G.rod([sx,.2,0],[0,.75,0],.02,DK)}
 const held=syFlatCar(0x3a3a3a,99);held.scale.set(.9,1,.9);held.position.set(tip[0],-1.4,0);arm.add(held);
 const tick=t=>{arm.rotation.y=Math.sin(t*.3)*1.2;mg.position.y=-.4+Math.sin(t*.6)*1.2;held.position.y=mg.position.y-.55;const top=tip[1]-.1,bot=mg.position.y+.75;cb.scale.y=Math.max(.1,top-bot);cb.position.y=(top+bot)/2};tick(0);
 g.traverse(o=>{if(o.isMesh)o.userData.noSeam=true});return{arm,cb,mg,held,tick,tipY:tip[1],obs:[{x0:cx-2.4,x1:cx+2.4,z0:cz-2,z1:cz+2}]}}

/* ---- batch 3: the crusher line (xpCrusher). The bay now opens towards the drive lane (-z). Same positions as the game:
   bay (cx, cz); belt bx0 = cx + 3.3 .. bx1 = cx + 16 at z cz (it now runs on to the melter wall); melter fx = bx1 + 2.6;
   mould (fx, fz + 3.6); ingot pile (fx + 2.1, fz + 3.6). Returns the meshes q.crush animates:
     pr (press platen, y from 4.2 down 2.8), ram (cylinder rod: position.y and scale.y), belt + btx (offset.x scrolls),
     mouth (emissiveIntensity), lp (ladle pivot, rotation.x) + lm (melt in the ladle), stream (unit-height pour),
     fill (the metal in the mould), crL (the two warning lamps), sg (the sign), obs.
   Keep the game's own light (fl) and smoke sprite (smk); put them at the melter mouth and the chimney top as before. ---- */
function syCrusher(g,cx,cz){const k=fbKit(),{B,C,rod,L}=k.H(g),M=k.M;const obs=[],ob=(x0,x1,z0,z1)=>obs.push({x0,x1,z0,z1});
 const ST=M(0x5a5e64,{metalness:.6,roughness:.45}),DK=M(0x1e2024,{roughness:.8}),RD=M(0xc02020,{metalness:.3,roughness:.5}),YL=M(0xe0b020,{roughness:.5,metalness:.25}),CH=M(0xd0d4d8,{metalness:.9,roughness:.18});
 const HZ=M(0xffffff,{map:k.HAZ?k.HAZ.map:null,roughness:.6});
 /* the bay: a concrete pad, a steel bed plate, the hazard strip across the mouth (-z) */B(7,.12,6,cx,.06,cz,k.PRE);
 const BP=M(0x3a3c40,{metalness:.55,roughness:.5});BP.map=k.tex(64,64,(c,w,h)=>{c.fillStyle='#3a3c40';c.fillRect(0,0,w,h);c.fillStyle='rgba(0,0,0,.35)';for(let y=4;y<h;y+=8)for(let x=(y/8%2)*4+2;x<w;x+=8)c.fillRect(x,y,4,1.5)});BP.map.repeat.set(8,6);B(6,.04,5,cx,.14,cz,BP);
 {const hz=k.tex(256,16,(c,w,h)=>{c.fillStyle='#e0b020';c.fillRect(0,0,w,h);c.fillStyle='#1a1a1a';for(let x=-16;x<w;x+=24){c.beginPath();c.moveTo(x,h);c.lineTo(x+12,h);c.lineTo(x+28,0);c.lineTo(x+16,0);c.fill()}});const s=new THREE.Mesh(new THREE.PlaneGeometry(6,.3),M(0xffffff,{map:hz,roughness:.6}));s.rotation.x=-Math.PI/2;s.position.set(cx,.165,cz-2.3);g.add(s)}
 /* four H columns on base plates, a crosshead on top with the cylinder */for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]]){const x=cx+a*2.8,z=cz+b*2.3;B(.4,5.3,.06,x,2.8,z-.17,ST);B(.4,5.3,.06,x,2.8,z+.17,ST);B(.06,5.3,.3,x,2.8,z,ST);B(.6,.06,.6,x,.17,z,DK);ob(x-.25,x+.25,z-.25,z+.25)}
 B(6.4,.6,5.2,cx,5.6,cz,RD);B(6.5,.08,5.3,cx,5.94,cz,DK);for(const sx of[-2,0,2])B(.08,.62,5.22,cx+sx,5.6,cz,M(0x9a1818));C(.55,.55,1.1,cx,6.45,cz,M(0x2a5a8a,{metalness:.45}),null,null,18);C(.6,.6,.08,cx,6.02,cz,DK,null,null,18);rod([cx+.5,6.6,cz],[cx+2.8,5.7,cz-2.3],.04,M(0x111111));
 const ram=new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,1.2,14),CH);ram.position.set(cx,4.8,cz);g.add(ram);
 /* the platen: a red slab with ribs, guides on the columns, chequered underside */const pr=new THREE.Mesh(new THREE.BoxGeometry(5,.7,4.2),RD);pr.position.set(cx,4.2,cz);pr.userData.dpKeep=1;g.add(pr);{const P=k.H(pr);for(const sx of[-1.6,0,1.6])P.B(.12,.5,4.22,sx,.12,0,M(0x9a1818));P.B(5.02,.06,4.22,0,-.36,0,DK);for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])P.B(.5,.5,.3,a*2.5,0,b*2.0,ST)}
 /* walls: the back (+z) full height, the west side, the east side low (the cube goes over it onto the belt) */B(6,1.1,.3,cx,.6,cz+2.6,k.PRE);ob(cx-3,cx+3,cz+2.4,cz+2.8);B(.3,1.1,4.6,cx-3,.6,cz,k.PRE);ob(cx-3.2,cx-2.8,cz-2.3,cz+2.3);B(.3,.75,4.6,cx+3,.43,cz,k.PRE);ob(cx+2.8,cx+3.2,cz-2.3,cz+2.3);
 for(const x of[cx-3,cx+3])B(.34,.06,4.64,x,x<cx?1.17:.83,cz,DK);
 /* the warning lamps on the front columns, the sign on the crosshead facing the lane */const crL=[];for(const sd of[-1,1]){C(.16,.16,.1,cx+sd*2.8,5.12,cz-2.55,DK,null,null,10);const lt=new THREE.Mesh(new THREE.SphereGeometry(.14,10,8),M(0x401010,{emissive:0x300000}));lt.position.set(cx+sd*2.8,5.3,cz-2.55);g.add(lt);crL.push(lt)}
 const sg=k.lab('THE CRUSHER\nDRIVE IN · STOP · GET PAID',3.2,.9,'#c02020','#ffffff',60);sg.position.set(cx,5.6,cz-2.62);sg.rotation.y=Math.PI;g.add(sg);
 /* the conveyor: from the bay wall to the melter wall, a scrolling belt, side frames, rollers, legs and braces, a drive */
 const bx0=cx+3.3,bx1=cx+16,fx=bx1+2.6,fz=cz,e0=cx+3.15,e1=fx-2.1,BL=e1-e0,bc=(e0+e1)/2;
 const bt=document.createElement('canvas');bt.width=64;bt.height=16;{const x=bt.getContext('2d');x.fillStyle='#1c1c1c';x.fillRect(0,0,64,16);x.fillStyle='#3a3a3a';for(let i=0;i<64;i+=8)x.fillRect(i,0,3,16)}const btx=new THREE.CanvasTexture(bt);btx.wrapS=btx.wrapT=THREE.RepeatWrapping;btx.repeat.set(BL/1.2,1);
 const belt=new THREE.Mesh(new THREE.BoxGeometry(BL,.12,1.4),new THREE.MeshStandardMaterial({map:btx,roughness:.9}));belt.position.set(bc,1.0,cz);g.add(belt);
 for(const sd of[-1,1]){B(BL,.32,.1,bc,.98,cz+sd*.78,YL);B(BL,.05,.2,bc,1.15,cz+sd*.74,YL)}for(let x=e0+.4;x<e1;x+=.8)C(.07,.07,1.44,x,.9,cz,ST,'z',null,8);for(const ex of[e0+.1,e1-.1])C(.16,.16,1.48,ex,.96,cz,ST,'z',null,12);
 for(let x=e0+1.2;x<e1-.5;x+=2.4){for(const sd of[-1,1]){B(.12,.84,.12,x,.42,cz+sd*.7,ST);B(.3,.04,.3,x,.02,cz+sd*.7,DK)}rod([x,.25,cz-.7],[x,.25,cz+.7],.03,ST)}
 C(.2,.2,.5,e1-.4,.7,cz-1.05,M(0x2a5a8a,{metalness:.45}),'z',null,12);B(.3,.36,.36,e1-.4,.7,cz-.85,DK);ob(e0,e1,cz-.85,cz+.85);
 /* the melter: a brick furnace with steel corner angles and bands, a charging door (the glowing mouth) where the belt arrives, a hood, a chimney with bands */
 B(4.6,.3,4.6,fx,.15,fz,k.PLINTH||k.PRE);const BR=M(0x6a3a2a,{roughness:.95});BR.map=k.tex(128,128,(c,w,h)=>{c.fillStyle='#3a2018';c.fillRect(0,0,w,h);for(let y=0;y<8;y++)for(let x=-1;x<5;x++){const v=120+((x*31+y*17)%40);c.fillStyle='rgb('+v+','+(v*.55|0)+','+(v*.38|0)+')';c.fillRect(x*32+(y%2)*16+1,y*16+1,30,14)}});BR.map.wrapS=BR.map.wrapT=THREE.RepeatWrapping;BR.map.repeat.set(2,2);
 B(4.2,4.3,4.2,fx,2.45,fz,BR);for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])B(.14,4.5,.14,fx+a*2.12,2.45,fz+b*2.12,DK);for(const y of[1.4,3.3])for(const[w,d,ox,oz]of[[4.3,.08,0,-2.13],[4.3,.08,0,2.13],[.08,4.3,-2.13,0],[.08,4.3,2.13,0]])B(w,.12,d,fx+ox,y,fz+oz,DK);
 B(4.6,.3,4.6,fx,4.75,fz,DK);{const hd=new THREE.Mesh(new THREE.CylinderGeometry(.9,2.2,.9,4),DK);hd.rotation.y=Math.PI/4;hd.position.set(fx+.4,5.35,fz-.4);g.add(hd)}
 /* the chimney rises from the middle of the hood (its foot sunk into it) */C(.6,.75,4.6,fx+.4,7.7,fz-.4,BR,null,null,14);C(.85,.85,.14,fx+.4,5.82,fz-.4,DK,null,null,14);for(const y of[6.9,8.3,9.6])C(.78,.78,.1,fx+.4,y,fz-.4,DK,null,null,14);C(.7,.6,.25,fx+.4,10.1,fz-.4,DK,null,null,14);ob(fx-2.1,fx+2.1,fz-2.1,fz+2.1);
 /* the charging door: a steel frame on the belt side, the glowing opening the cubes ride into, a lifted door above it */B(.16,2.0,2.0,e1-.02,1.5,fz,DK);const mouth=new THREE.Mesh(new THREE.PlaneGeometry(1.5,1.4),M(0x301000,{emissive:0xff6010,emissiveIntensity:.6}));mouth.rotation.y=-Math.PI/2;mouth.position.set(e1-.11,1.55,fz);g.add(mouth);const cd=B(.12,1.5,1.7,e1-.2,2.95,fz,ST);cd.userData.dpKeep=1;{const D=k.H(cd);for(const y of[-.5,0,.5])D.B(.14,.06,1.72,0,y,0,DK);D.B(.15,.12,.3,0,-.7,0,YL)}/* the charging door: a guillotine door, up (y 2.95) or shut (y 1.55) */for(const sd of[-1,1])B(.08,3.2,.1,e1-.2,2.2,fz+sd*.92,ST);B(.1,.12,2.0,e1-.2,3.8,fz,ST);
 /* the tap: a cast block on the north wall with a glowing plug, and a lined spout running out over the ladle's mouth */B(.5,.5,.3,fx+.2,3.35,fz+2.25,DK);{const tp=new THREE.Mesh(new THREE.CircleGeometry(.09,12),M(0x200800,{emissive:0xff5010,emissiveIntensity:.8}));tp.position.set(fx+.2,3.4,fz+2.41);g.add(tp)}{const sp=new THREE.Group();sp.position.set(fx+.2,3.22,fz+2.6);sp.rotation.x=.22;g.add(sp);const S2=k.H(sp);S2.B(.3,.05,.7,0,0,0,DK);for(const s2 of[-1,1])S2.B(.05,.14,.7,s2*.15,.06,0,DK);S2.B(.2,.02,.66,0,.035,0,M(0x6a4a3a,{roughness:1}))}
 /* the ladle gantry */const mx=fx,mz=fz+3.6;
 for(const sd of[-1,1]){B(.16,3.5,.16,mx+1.5,1.75,mz-.6+sd*.5,ST);B(.4,.05,.4,mx+1.5,.03,mz-.6+sd*.5,DK)}B(.16,.16,1.2,mx+1.5,3.5,mz-.6,ST);B(1.5,.18,.18,mx+.8,3.5,mz-.6,ST);rod([mx+1.5,2.8,mz-.6],[mx+.9,3.42,mz-.6],.04,ST);ob(mx+1.35,mx+1.65,mz-1.2,mz);
 /* the ladle: a pot on trunnions (lp, at its middle) inside a bail that hangs from the gantry hook; only the pot tips, spout on +z towards the mould */const LY=2.6;{const bail=new THREE.Mesh(new THREE.TorusGeometry(.55,.035,6,18,Math.PI),DK);bail.position.set(mx+.2,LY,mz-.6);g.add(bail);for(const s2 of[-1,1])C(.07,.07,.1,mx+.2+s2*.55,LY,mz-.6,DK,'x',null,10);B(.24,.3,.2,mx+.2,LY+.78,mz-.6,YL);C(.025,.025,.3,mx+.2,LY+1.06,mz-.6,DK,null,null,6);B(.3,.12,.3,mx+.2,3.32,mz-.6,ST)}const lp=new THREE.Group();lp.position.set(mx+.2,LY,mz-.6);lp.userData.dpKeep=1;g.add(lp);{const Lp=k.H(lp);const PM=M(0x2a2a2a,{metalness:.6,roughness:.45,side:THREE.DoubleSide});const lb=new THREE.Mesh(new THREE.CylinderGeometry(.45,.34,.7,18,1,true),PM);lp.add(lb);Lp.C(.34,.34,.04,0,-.35,0,PM,null,null,18);for(const y of[-.15,.2])Lp.C(.44-(.2-y)*.12,.44-(.2-y)*.12+.01,.05,0,y,0,DK,null,null,18);{const rim=new THREE.Mesh(new THREE.TorusGeometry(.45,.035,6,20),DK);rim.rotation.x=Math.PI/2;rim.position.y=.35;lp.add(rim)}const lip=new THREE.Mesh(new THREE.ConeGeometry(.12,.3,4,1,true),PM);lip.position.set(0,.33,.5);lip.rotation.x=Math.PI/2;lip.scale.x=.6;lp.add(lip);for(const s2 of[-1,1])Lp.C(.06,.06,.12,s2*.5,0,0,DK,'x',null,10)}const lm=new THREE.Mesh(new THREE.CircleGeometry(.42,16),M(0x401000,{emissive:0xff8020}));lm.rotation.x=-Math.PI/2;lm.position.y=.28;lm.visible=false;lp.add(lm);const stream=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,1,6),M(0x401000,{emissive:0xffa030}));stream.position.set(mx+.2,1.6,mz-.1);stream.visible=false;g.add(stream);
 /* the mould: a cast iron ingot mould on a stand, a drip tray; fill is the metal in it */B(2.2,.12,1.4,mx,.06,mz,DK);for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])B(.12,.6,.12,mx+a*.85,.42,mz+b*.45,ST);B(2.0,.1,1.2,mx,.72,mz,ST);B(1.6,.2,.9,mx,.83,mz,M(0x2e3034,{metalness:.6,roughness:.45}));B(1.3,.04,.6,mx,.92,mz,M(0x161616));ob(mx-1,mx+1,mz-.6,mz+.6);
 const fill=new THREE.Mesh(new THREE.BoxGeometry(1.2,.16,.5),M(0x401000,{emissive:0xff8020}));fill.position.set(mx,.86,mz);fill.scale.y=.01;fill.visible=false;g.add(fill);
 /* the ingot pallet beside it, and a sign */const px=mx+2.1,pz=mz;B(1.8,.14,1.4,px,.07,pz,M(0x8a6a44,{roughness:.9}));for(const dz of[-.55,0,.55])B(1.8,.04,.12,px,.16,pz+dz,M(0x6a4a2a));L('INGOTS · PRICED BY THE CAR',1.4,.26,'#1a1a1a','#e0e4e8',60,px,.75,pz+.72,0);B(.06,.7,.06,px-.6,.35,pz+.72,DK);B(.06,.7,.06,px+.6,.35,pz+.72,DK);
 g.traverse(o=>{if(o.isMesh)o.userData.noSeam=true});
 return{pr,ram,belt,btx,bx0,bx1,bz:cz,fx,fz,mouth,cd,e1,mx,mz,fill,lp,lm,stream,px,pz,sg,crL,y0:4.2,flAt:[e1-.9,2,fz],smkAt:[fx+.4,10.4,fz-.4],obs}}

/* ---- batch 4: the scrap bays, the tyre mountain and rack, the monster truck pad ---- */
/* three open-fronted concrete bays on the north side (x 114.5..149.5, z -1316..-1303), mouths facing the yard (-z); each holds its heap.
   Bay 3 is the rummage pile ("DIG IN"); its rummage prop goes at (144, -1318). */
function syBays(g){const k=fbKit(),{B,C,rod,L}=k.H(g),M=k.M;const obs=[];let sd=2468;const r=()=>((sd=Math.imul(sd^sd>>>15,sd|1)+0x6d2b79f5|0)>>>0)/4294967296;
 const Z0=-1316,Z1=-1303,H=2.4,T=.4;B(36,.15,13.4,132,.075,(Z0+Z1)/2,k.PRE);
 /* the back wall and four dividers, made of interlocking concrete blocks (1.6 x .8 x .8) */const BLK=M(0xb8b2a6,{roughness:.95});const blk=(x,y,z,ry)=>{const b=B(1.56,.76,.76,x,y,z,BLK);b.rotation.y=ry||0;return b};
 for(let row=0;row<3;row++){const y=.53+row*.8;for(let x=114.5+.8+(row%2)*.8;x<149.6-.7;x+=1.6)blk(x,y,Z1-.4)}obs.push({x0:114.3,x1:149.7,z0:Z1-.8,z1:Z1});
 for(const dx of[114.5,126.5,138.5,149.5])for(let row=0;row<3;row++){const y=.53+row*.8;for(let z=Z1-.8-.8-(row%2)*.8;z>Z0+.7;z-=1.6)blk(dx,y,z,Math.PI/2)}
 for(const dx of[114.5,126.5,138.5,149.5])obs.push({x0:dx-.4,x1:dx+.4,z0:Z0+.3,z1:Z1-.8});
 /* the heaps: bay 1 steel (beams, plates, a drum, rebar), bay 2 copper and brass (wire coils, pipes, radiators), bay 3 everything */
 const heap=(cx,mats,n,cz)=>{for(let i=0;i<n;i++){const a=r()*Math.PI*2,d=Math.sqrt(r())*4.3,x=cx+Math.cos(a)*d*1.05,z=(cz||-1310.5)+Math.sin(a)*d*.95,h=Math.max(.15,(1-d/4.6))*2.1;const kind=i%5,m=mats[i%mats.length];let o;
   if(kind==0)o=B(1.2+r()*1.6,.12,.15,x,.3+r()*h,z,m);else if(kind==1)o=B(.8+r()*.8,.06,.6+r()*.6,x,.25+r()*h,z,m);else if(kind==2){o=new THREE.Mesh(new THREE.TorusGeometry(.25+r()*.15,.06,6,14),m);o.position.set(x,.3+r()*h,z);g.add(o)}else if(kind==3){o=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,1+r()*1.5,8),m);o.position.set(x,.25+r()*h,z);g.add(o)}else{o=new THREE.Mesh(new THREE.DodecahedronGeometry(.2+r()*.3,0),m);o.position.set(x,.2+r()*h*.8,z);g.add(o)}o.rotation.set(r()*3,r()*3,r()*3)}
  /* a low mound under it so nothing floats */const md=new THREE.Mesh(new THREE.SphereGeometry(4.4,18,8,0,Math.PI*2,0,Math.PI/2),M(0x5a4a3a,{roughness:1}));md.scale.y=.32;md.position.set(cx,.14,cz||-1310.5);g.add(md)};
 const STEEL=[M(0x6a6e72,{metalness:.6,roughness:.5}),M(0x7a4a2a,{metalness:.4,roughness:.8}),M(0x4a4e52,{metalness:.6,roughness:.5})],CU=[M(0xb87333,{metalness:.8,roughness:.3}),M(0xc8a040,{metalness:.8,roughness:.3}),M(0x8a5a2a,{metalness:.7,roughness:.4})],MIX=STEEL.concat(CU,[M(0x3a5a8a,{metalness:.4}),M(0xa03030,{metalness:.4})]);
 heap(120.5,STEEL,60);heap(132.5,CU,60);heap(144,MIX,70);
 {const dr=C(.3,.3,.9,121.5,.6,-1312.5,M(0x2a5a8a,{metalness:.4}),null,null,14);dr.rotation.z=1.4}
 /* boards on the back wall */L('STEEL',2.4,.5,'#2a2e34','#e0e4e8',60,120.5,2.05,Z1-.81,0);L('COPPER & BRASS',3.6,.5,'#5a3a1a','#ffd8a0',60,132.5,2.05,Z1-.81,0);L('SCRAP · DIG IN\n(NO REFUNDS)',3.2,.8,'#8a4a2a','#ffe0a0',60,144,1.95,Z1-.81,0);
 g.traverse(o=>{if(o.isMesh)o.userData.noSeam=true});return{obs,rummage:[144,-1318]}}

/* the tyre mountain (x 64..82, z -1316..-1303): a heaped pile of tyres on a low mound, a few leaning; and a steel rack of stacked tyres beside it */
function syTyres(g){const k=fbKit(),{B,C,rod,L}=k.H(g),M=k.M;let sd=1357;const r=()=>((sd=Math.imul(sd^sd>>>15,sd|1)+0x6d2b79f5|0)>>>0)/4294967296;const RB=M(0x1c1c1c,{roughness:.95}),RIM=M(0x8a8e92,{metalness:.7,roughness:.4});
 const tg=new THREE.TorusGeometry(.42,.17,8,16);const cx=73,cz=-1309.5;const md=new THREE.Mesh(new THREE.SphereGeometry(6,20,8,0,Math.PI*2,0,Math.PI/2),M(0x4a4038,{roughness:1}));md.scale.set(1.45,.42,1.05);md.position.set(cx,0,cz);g.add(md);
 /* tyres lying on the mound's surface, in rings, more on the lower slopes */const surf=(x,z)=>{const dx=(x-cx)/(6*1.45),dz=(z-cz)/(6*1.05),q=1-dx*dx-dz*dz;return q>0?Math.sqrt(q)*6*.42:0};
 for(let i=0;i<150;i++){const a=r()*Math.PI*2,d=Math.sqrt(r())*.95,x=cx+Math.cos(a)*d*8.4,z=cz+Math.sin(a)*d*6.1,y=surf(x,z);const t=new THREE.Mesh(tg,RB);t.position.set(x,y+.1,z);t.rotation.set(Math.PI/2+(r()-.5)*.7,(r()-.5)*.5,r()*3);g.add(t)}
 for(let i=0;i<8;i++){const a=i/8*Math.PI*2+.3,x=cx+Math.cos(a)*8.9,z=cz+Math.sin(a)*6.4;const t=new THREE.Mesh(tg,RB);t.position.set(x,.5,z);t.rotation.set(0,a+Math.PI/2,(r()-.5)*.4);t.rotation.order='YXZ';t.rotation.x=.35;g.add(t)}
 /* the rack (x 84..86): two bays of steel uprights and beams, tyres standing in rows, a few with rims */const RK=M(0xd86a20,{metalness:.4,roughness:.5});for(const z of[-1316,-1310,-1304])for(const x of[84,86])B(.08,2.4,.08,x,1.2,z,RK);for(const y of[.3,1.2,2.1])for(const x of[84,86])B(.08,.12,12,x,y,-1310,RK);for(const y of[.36,1.26,2.16])B(2,.04,12,85,y,-1310,M(0x6a6e72,{metalness:.5}));
 for(const y of[.38,1.28])for(let z=-1315.5;z<-1304.3;z+=.42){const t=new THREE.Mesh(tg,RB);t.position.set(85,y+.6,z);t.rotation.y=Math.PI/2;g.add(t);if(((z*10)|0)%3==0){const rm=C(.26,.26,.22,85,y+.6,z,RIM,'z',null,12)}}
 L('TYRES · 5 🪙 · NO GUARANTEE',2.4,.4,'#1a1a1a','#e8c020',60,84.95,2.6,-1310,-Math.PI/2);
 g.traverse(o=>{if(o.isMesh)o.userData.noSeam=true});return{obs:[{x0:64,x1:82,z0:-1316,z1:-1303},{x0:83.8,x1:86.2,z0:-1316.2,z1:-1303.8}]}}

/* the monster truck pad (x 158..172, z -1318..-1306): a raised concrete plinth with a ramp on the yard side, flag poles, a banner, spotlights */
function syMonsterPad(g){const k=fbKit(),{B,C,rod,L}=k.H(g),M=k.M;const cx=165,cz=-1312;
 B(14,.3,12,cx,.15,cz,k.PRE);B(14.2,.04,12.2,cx,.31,cz,M(0x2a2c30,{roughness:.6}));{const rp=B(4,.06,2.2,cx,.15,cz-7.0,k.PRE);rp.rotation.x=-.14}
 for(const sx of[-1,1])for(const sz of[-1,1])B(.4,.06,.4,cx+sx*6.6,.34,cz+sz*5.6,M(0xe0b020));
 /* a checker stripe border painted round the top */{const t=k.tex(256,16,(c,w,h)=>{for(let i=0;i<32;i++){c.fillStyle=i%2?'#e8e8e8':'#1a1a1a';c.fillRect(i*8,0,8,8);c.fillStyle=i%2?'#1a1a1a':'#e8e8e8';c.fillRect(i*8,8,8,8)}});t.repeat.set(4,1);const m=M(0xffffff,{map:t,roughness:.6});for(const[w,d,x,z]of[[13.6,.3,0,-5.8],[13.6,.3,0,5.8],[.3,11.6,-6.8,0],[.3,11.6,6.8,0]]){const s=new THREE.Mesh(new THREE.PlaneGeometry(w,d),m);s.rotation.x=-Math.PI/2;if(d>w){s.rotation.z=Math.PI/2;s.geometry=new THREE.PlaneGeometry(d,w)}s.position.set(cx+x,.335,cz+z);g.add(s)}}
 /* two flag poles at the back with a banner between them */for(const sx of[-5.5,5.5]){C(.08,.1,6,cx+sx,3.3,cz+5.4,M(0xc8ccd0,{metalness:.8}),null,null,10);C(.14,.14,.12,cx+sx,6.35,cz+5.4,M(0xe0b020),null,null,10)}
 {/* the banner spans the poles: top and bottom bars run pole to pole, the banner is laced to them and to the poles */const bn=k.lab('THE MONSTER TRUCK\nNOT FOR SALE · ¡NO TOCAR!',10.6,2.2,'#1a3a8a','#ffe060',60);bn.position.set(cx,4.6,cz+5.38);bn.rotation.y=Math.PI;g.add(bn);for(const y of[5.72,3.48])B(11,.06,.06,cx,y,cz+5.4,M(0xc8ccd0,{metalness:.8}));for(const sx of[-1,1])for(const y of[3.8,4.6,5.4])B(.18,.03,.03,cx+sx*5.38,y,cz+5.4,M(0x1a1a1a))}
 /* two spotlights on stands at the front corners, aimed at the truck */for(const sx of[-1,1]){const x=cx+sx*6.2,z=cz-5.2;C(.05,.05,1.2,x,.9,z,M(0x2a2a2a),null,null,8);const hd=C(.18,.22,.35,x,1.55,z,M(0x2a2a2a),null,null,12);hd.rotation.x=-.9;hd.rotation.z=-sx*.5;const ln=new THREE.Mesh(new THREE.CircleGeometry(.17,12),M(0xfff0d0,{emissive:0xfff0d0,emissiveIntensity:1}));ln.position.set(x-sx*.14,1.66,z+.2);ln.lookAt(cx,1.5,cz);g.add(ln)}
 g.traverse(o=>{if(o.isMesh)o.userData.noSeam=true});return{obs:[{x0:cx-5.7,x1:cx-5.3,z0:cz+5.2,z1:cz+5.6},{x0:cx+5.3,x1:cx+5.7,z0:cz+5.2,z1:cz+5.6}],spawn:[cx,cz,0],y:.33}}/* facing out over the ramp (-z) */


/* ---------- r620 wiring: the yard ---------- */
function xpScrap(X){const{q,g,M,A,BX,CY,ob,loc,sign,anim,prop,light,zone,R,lab}=X;zone(55,185,-1385,-1295);const x0=60,x1=180,z0=-1380,z1=-1300;
 const obs=o=>{for(const b of o||[])ob(b.x0,b.x1,b.z0,b.z1)};
 /* the yard: floor, fence, gates, weighbridge, office, sign, floodlights (the fence boxes stay on the old lines, with the same gap) */
 obs(syYard(g).obs);
 ob(x0-.2,x0+.2,z0,z0+30);ob(x0-.2,x0+.2,z0+42,z1);ob(x1-.2,x1+.2,z0,z1);ob(x0,x1,z0-.2,z0+.2);ob(x0,x1,z1-.2,z1+.2);
 /* the car stacks, the tyres, the scrap bays */obs(syStacks(g).obs);obs(syTyres(g).obs);const bays=syBays(g);obs(bays.obs);SYR.rummage=bays.rummage;
 /* the magnet crane */{const cr=syCrane(g,160,-1366);obs(cr.obs);anim(160,-1366,160,()=>cr.tick(q.rt))}
 /* the monster truck's pad: a 30 cm plinth with a ramp on the yard side */{const mp=syMonsterPad(g);obs(mp.obs);SYR.pad=mp.spawn;(q.plates=q.plates||[]).push({x0:158,x1:172,z0:-1318,z1:-1306,y:mp.y});q.ramps.push({x0:163,x1:167,z0:-1320.1,len:2.2,H:mp.y,y0:0,dir:1,nolink:1})}
 /* the crusher, the conveyor, the melter and the ingot mould */try{xpCrusher(X,x0+30,z1-24)}catch(e){conLog('error','crusher: '+e.message)}
 /* El Goblino at the office counter, facing the lane */const gb=mkGoblino();gb.scale.setScalar(.82);gb.position.set(67.4,.35,-1356.8);gb.rotation.y=0;g.add(gb);
 prop(68,-1354.6,2,'[E] Talk to El Goblino (scrap division)',()=>{snd(400,.06);const L=['"¡Hola! Is my scrapyard. Everything here is for sale. Everything here is broken."','"The monster truck? Is not for sale. Is for driving. Bring it back with wheels."','"You crash a car, I tow it, I crush it, I sell it back to you as a cube. Is the circle of life."','"Seek crashed his cruiser four times this week. I am rich, amigo."','"Bigger car, bigger ingot, more gold. A quad? Is barely a sandwich."'];const t=L[(q.gsn=(q.gsn|0)+1)%L.length];try{say('El Goblino',t.replace(/^"|"$/g,''))}catch(e){}hint('👺 El Goblino: '+t)});
 light(0xffd090,1,16,68,3.6,-1355);loc("Goblino's Scrap",120,-1340,'🚗')}
const SYR={rummage:[144,-1318],pad:[165,-1312,0],theft:null};

/* ---------- the crusher line: the bay faces the lane (-z), the belt runs to the melter's charging door ---------- */
function xpCrusher(X,cx,cz){const{q,g,ob,prop,light,loc}=X;const H=syCrusher(g,cx,cz);for(const b of H.obs)ob(b.x0,b.x1,b.z0,b.z1);
 const fl=light(0xff7020,1.2,10,H.flAt[0],H.flAt[1],H.flAt[2]);const smk=glowSp(0x3a3a3a,.45,2.4);smk.material.blending=THREE.NormalBlending;smk.position.set(H.smkAt[0],H.smkAt[1],H.smkAt[2]);g.add(smk);
 q.crush={cx,cz,pr:H.pr,ram:H.ram,belt:H.belt,btx:H.btx,bx0:H.bx0,bx1:H.bx1,bz:H.bz,fx:H.fx,fz:H.fz,mouth:H.mouth,cd:H.cd,e1:H.e1,fl,smk,smkY:H.smkAt[1],mx:H.mx,mz:H.mz,fill:H.fill,lp:H.lp,lm:H.lm,stream:H.stream,px:H.px,pz:H.pz,pile:[],ph:null,t:0,v:null,cube:null,ing:null,n:0,y0:H.y0,sg:H.sg};q.crL=H.crL;
 prop(cx,cz-3.6,1.6,()=>q.crush&&q.crush.ph?'🗜️ CRUSHING… ('+q.crush.ph+')':'🗜️ Drive a car into the bay and stop: El Goblino pays by the car',()=>{});
 loc('The Crusher',cx+6,cz,'🗜️')}

/* spawned cars and the Wraith are not scrap */
function crushOK(q,v){return v&&!v.gone&&!v.crush&&!v.wreck&&!CRUSH.no[v.k]&&!v.K.bus&&!v.K.tank&&!v.K.plane&&!v.npc&&!(q.cop&&q.cop.v===v)&&!v.sp&&!v.K.proto&&v.k!='proto'}
/* what an ingot is worth: the car's garage price x 0.15, or its size, 8..60 gold */
function crushPay(v){if(!v)return 15;const gk=(typeof GARK!='undefined')&&GARK.find(a=>a[0]==v.k);const n=gk?Math.round(gk[1]*.15):Math.round((v.K.w||2)*(v.K.len||4)*1.2);return Math.max(8,Math.min(60,n))}
function crushStart(q,v,remote){const C=q.crush;if(!C||C.ph||!crushOK(q,v))return;if(q.seat&&q.seat.v===v){try{vehExit(q,true)}catch(e){}P.x=C.cx+4.2;P.z=C.cz-5.5+q.OZ;P.dy=0;hint('🗜️ El Goblino waves you out of the car. "Out, out! Unless you want to be a cube too."')}
 if(q.seat&&q.seat.v===v)q.seat=null;v.crush=1;v.v=0;v.x=C.cx;v.z=C.cz;v.air=0;v.y=0;C.v=v;C.ph='press';C.t=0;C.mine=!remote&&(v.owner===SV.pid||!v.owner);C.sy=v.m.scale.y;C.val=crushPay(v);C.vn=(v.K&&v.K.nm)||v.k;snd(200,.3);if(!remote)vehNet(q,{k:'crush',v:v.id})}
function crushTick(q,dt){const C=q.crush;if(!C)return;try{icTick(q,dt);icIngotTick(q,dt);icRemoteTick(q,dt)}catch(e){conLog('error','ingot: '+e.message)}const near=Math.hypot(P.x-C.cx-6,P.z-q.OZ-C.cz)<110;
 for(let i=0;i<(q.crL||[]).length;i++)q.crL[i].material.emissive.setHex(C.ph&&((q.rt*4|0)%2==i)?0xff2020:0x300000);
 if(C.smk){C.smk.position.y=C.smkY+Math.sin(q.rt*2)*.4;C.smk.scale.setScalar(2.4+Math.sin(q.rt*1.3)*.5)}C.mouth.material.emissiveIntensity=(C.ph=='melt'||C.ph=='pour'?1.6:.6)+Math.sin(q.rt*7)*.15;C.fl.intensity=(C.ph=='melt'||C.ph=='pour'?2.2:1.0)+Math.sin(q.rt*9)*.2;
 /* someone stopped a car in the bay */if(!C.ph&&!q.icut){for(const v of q.vehs){if(!v||v.gone)continue;const inBay=Math.abs(v.x-C.cx)<1.8&&Math.abs(v.z-C.cz)<1.6&&Math.abs(v.v)<1.2&&!v.air;
   if(!crushOK(q,v)){if(inBay&&(v.sp||v.K.proto||v.k=='proto')&&q.seat&&q.seat.v===v&&!v.crNo){v.crNo=1;hint('🗜️ El Goblino shakes his head. "That one is not scrap, amigo. Bring me a real wreck."')}continue}
   if(inBay&&(v.owner===SV.pid||!v.owner||!MP.on)){v.crT=(v.crT||0)+dt;if(v.crT>.8){v.crT=0;crushStart(q,v,false)}}else v.crT=0}}
 if(!C.ph)return;C.t+=dt;const v=C.v;
 if(C.ph=='press'){/* the platen comes down; the car only folds once it touches it */const u=Math.min(1,C.t/2.2),e=u<.15?0:Math.min(1,(u-.15)/.85);C.pr.position.y=C.y0-e*3.3;C.ram.position.y=4.8-e*1.65;C.ram.scale.y=1+e*2.75;if(v){v.x=C.cx;v.z=C.cz;v.v=0;const Hh=(v.K.ht||1.7);v.m.scale.y=C.sy*Math.max(.2,Math.min(1,(C.pr.position.y-.51)/Hh));v.m.position.y=0}if(near&&e>.1&&Math.random()<dt*10)snd(60+Math.random()*40,.12);if(u>=1){snd(70,.6);snd(140,.3);try{camShake(near?.25:0,.3);vfx('dust',C.cx,.6,C.cz+q.OZ,{n:16,w:2.4})}catch(e){}C.ph='cube';C.t=0;
   if(v){v.m.visible=false;v.gone=1;q.anyGone=1;v.m.scale.y=C.sy}const cb=crushCube((v&&v.K.col)||0x8a8a8a);cb.position.set(C.cx,.55,C.cz);q.g.add(cb);C.cube=cb}}
 else if(C.ph=='cube'){/* the platen goes back up; the cube is pushed onto the belt */const u=Math.min(1,C.t/1.6);C.pr.position.y=C.y0-3.3*(1-u);C.ram.position.y=4.8-1.65*(1-u);C.ram.scale.y=1+2.75*(1-u);if(C.cube){const k=Math.max(0,(C.t-.8)/.8);C.cube.position.x=C.cx+k*(C.bx0+.8-C.cx);C.cube.position.y=.55+Math.min(1,k*1.4)*.62}if(u>=1&&C.t>1.6){C.ph='belt';C.t=0}}
 else if(C.ph=='belt'){C.btx.offset.x-=dt*.9;const u=Math.min(1,C.t/5);if(C.cube){C.cube.position.x=C.bx0+.8+u*(C.bx1-C.bx0-.6);C.cube.position.y=1.17;C.cube.rotation.y=Math.sin(C.t*3)*.03}if(near&&Math.random()<dt*3)snd(180,.03);if(u>=1){C.ph='melt';C.t=0;snd(90,.4)}}
 else if(C.ph=='melt'){/* the cube tips over the end drum into the charging door, and the door drops shut behind it */const u=Math.min(1,C.t/2.4),k=Math.min(1,u/.6);
   if(C.cube){C.cube.position.x=C.bx1+.2+k*2.4;C.cube.position.y=1.17-Math.max(0,k-.35)*.5;C.cube.rotation.z=-Math.min(1,k*1.6)*.35;if(u>=.6&&C.cube.parent){C.cube.parent.remove(C.cube);C.cube=null}}
   C.cd.position.y=u<.6?2.95:2.95-Math.min(1,(u-.6)/.25)*1.4;
   if(near&&Math.random()<dt*6)try{vfx('spark',C.e1-.2,1.6,C.fz+q.OZ,{n:2,c:0xffa030})}catch(e){}
   if(u>=1){C.ph='pour';C.t=0;C.lm.visible=true;snd(260,.3);setTimeout(()=>snd(200,.4),300)}}
 else if(C.ph=='pour'){/* the ladle tips, a stream of glowing metal fills the mould */const u=Math.min(1,C.t/3.2);const tilt=u<.2?u/.2:u>.8?(1-u)/.2:1;C.lp.rotation.x=tilt*1.15;C.stream.visible=u>.18&&u<.82;C.stream.scale.y=1.6;C.stream.position.y=1.62;C.stream.position.x=C.mx+.2;C.fill.visible=true;C.fill.scale.y=Math.max(.01,Math.min(1,(u-.18)/.62));C.fill.position.y=.74+.08*C.fill.scale.y;if(near&&C.stream.visible&&Math.random()<dt*8)try{vfx('spark',C.mx,.95,C.mz+q.OZ,{n:1,c:0xffb040})}catch(e){}if(u>=1){C.ph='cool';C.t=0;C.lm.visible=false;C.lp.rotation.x=0;C.stream.visible=false}}
 else if(C.ph=='cool'){const u=Math.min(1,C.t/2.6);const k=1-u;C.cd.position.y=1.55+Math.min(1,C.t/1.2)*1.4;C.fill.material.emissive.setRGB(1*k,.5*k,.12*k);C.fill.material.color.setRGB(.25+.35*u,.25+.33*u,.27+.33*u);if(u>=1){/* out of the mould and onto the pallet, tinted by what it is worth */C.cd.position.y=2.95;C.fill.visible=false;C.fill.material.emissive.setHex(0xff8020);C.fill.material.color.setHex(0x401000);const val=C.val||15,n=C.pile.length;
   const ing=new THREE.Mesh(new THREE.BoxGeometry(1.0,.2,.42),val<15?VMAT(0x6e6c68,{metalness:.45,roughness:.75}):val<30?VMAT(0x9aa0a8,{metalness:.85,roughness:.3}):VMAT(0xe4e9f0,{metalness:1,roughness:.1}));ing.userData.val=val;const L2=n%9,row=(n/9)|0;ing.position.set(C.px-.55+(L2%3)*.55,.22+row*.21,C.pz-.45+((L2/3)|0)*.45);ing.rotation.y=Math.PI/2;q.g.add(ing);C.pile.push(ing);if(C.pile.length>27){const o=C.pile.shift();if(o.parent)o.parent.remove(o)}snd(800,.06);
   C.n++;if(C.mine){gold+=val;try{saveGame();updHud()}catch(e){}hint('🧱 Ingot #'+C.n+' cast! '+(C.vn?'A '+String(C.vn).replace(/^(El Goblino's |the |a )/i,'')+'\'s worth: ':'')+val+' gold. (The car? El Goblino tows it back to where it was. He likes repeat business.)')}if(v&&v.sp){v.crush=0;v.m.scale.y=C.sy;try{garRemove(q,v)}catch(e){}}else if(v){try{vehRestore(q,v)}catch(e){}v.crush=0;v.m.scale.y=C.sy;v.netSnap=1}C.v=null;C.ph=null;C.t=0}}}

/* ---------- the yard's monster truck: drive it 15 m off its pad without owning one and El Goblino calls the Desert PD ---------- */
CRIMES.mtruck='stealing El Goblino\'s monster truck';
{const f0=busRoamUpd;busRoamUpd=function(q,dt){const r=f0.apply(this,arguments);try{syTheft(q)}catch(e){}return r}}
function syTheft(q){if(!q||!q.vehs)return;let v=SYR.mt;if(!v||q.vehs.indexOf(v)<0){v=SYR.mt=q.vehs.find(w=>w&&w.k=='monster'&&!w.sp&&Math.abs(w.sx-SYR.pad[0])<1&&Math.abs(w.sz-SYR.pad[1])<1)||null;if(!v)return}
 const d=Math.hypot(v.x-v.sx,v.z-v.sz);if(d<6||v.gone){v.syStolen=0;return}
 if(!v.syStolen&&d>15&&q.seat&&q.seat.v===v&&q.seat.i==0&&!(typeof garOwned=='function'&&garOwned('monster'))){v.syStolen=1;addHeat(q,40,'mtruck');hint('🚨 El Goblino: "¡LADRÓN! My monster truck!" The Desert PD are on their way.')}}

/* ---------- r620: the Desert PD patrol helicopter, remodelled (cars.md part 13, police-heli.js). build.py swaps the police pad's mkHeli() for it ---------- */
/* =====================================================================================================
   mkPoliceHeli(): the Desert PD patrol helicopter, remodelled. Replaces the first mkHeli() in bak519 (the police one,
   ~line 2834; the military mkHeli(K) further down is a different thing and is not touched). Needs heliKit (helis.js).
   A light patrol helicopter: one smooth egg-shaped cabin (a single mesh, its paint, windows and lettering all on one
   texture, so nothing floats or flickers), a glass nose, door and rear windows you can see the crew through, an
   engine fairing with a light bar, a slim tail boom with stabiliser, fin and tail rotor, skids with steps, and a
   searchlight on a yoke under the nose. Navy over white, a yellow checker band, DARK POLICE on both doors.
   ORIGIN  centre on the ground (skids touch y 0). FRONT -z. Same size and hook spots as the old one:
   HOOKS   userData = {mr, tr, spG, cone, cm, pool, pm, bea, sk}, exactly as heliTick (bak519:2881) uses them:
     mr   main rotor Group at (0, 3.15, 0), spins on y        tr   tail rotor Group at (.14, 2.4, 5.6), spins on x
     spG  searchlight beam Group at (0, .8, -1.2) with cone/cm, and pool/pm (the light pool, added to the world by the game)
     bea  [red, blue] light bar meshes: the game sets material.emissive    sk   the pilot (mkCopSeek(.42) at (0, 1.05, -.6))
   ===================================================================================================== */
function mkPoliceHeli(){const g=new THREE.Group(),K=heliKit(g),{M,BX,CYL,rod,ext,plan,decal,lite}=K;
 const NVc='#16224c',WHc='#ecebe6',YLc='#e8c020';
 const NV=M(0x16224c,{roughness:.35,metalness:.35}),WH=M(0xecebe6,{roughness:.35,metalness:.2}),DK=M(0x1a1c20,{roughness:.6}),MT=M(0x5a5e64,{metalness:.75,roughness:.35}),SEAT=M(0x2a2c30,{roughness:.8});
 const GL=new THREE.MeshStandardMaterial({color:0x9ab8cc,transparent:true,opacity:.28,roughness:.05,metalness:.5,side:THREE.DoubleSide,depthWrite:false});
 const TN=new THREE.MeshStandardMaterial({color:0x1c2836,transparent:true,opacity:.62,roughness:.08,metalness:.5,side:THREE.DoubleSide,depthWrite:false});
 /* ---- the cabin shell: superellipse sections on a smooth spline through key stations. The mesh grid is laid so
    every window edge falls on a grid line, so the glass edges are clean curves, not steps ---- */
 const KS=[[-2.08,.02,.02,1.37],[-1.95,.7,.72,1.43],[-1.65,1.22,1.22,1.52],[-1.15,1.56,1.5,1.6],[-.45,1.72,1.62,1.66],[.5,1.72,1.6,1.68],[1.2,1.54,1.38,1.77],[1.75,1.02,.9,1.91],[2.25,.5,.46,2.02]];
 const E=2/2.4,Z0=KS[0][0],Z1=KS[KS.length-1][0];
 /* Catmull-Rom through the stations (z is the parameter) */
 const stAt=z=>{let k=0;while(k<KS.length-2&&z>KS[k+1][0])k++;const A=KS[k],B=KS[k+1],f=(z-A[0])/(B[0]-A[0]),P0=KS[Math.max(0,k-1)],P3=KS[Math.min(KS.length-1,k+2)];
  const r=[z];for(let c=1;c<4;c++){const m0=(B[c]-P0[c])/(B[0]-P0[0])*(B[0]-A[0]),m1=(P3[c]-A[c])/(P3[0]-A[0])*(B[0]-A[0]);const f2=f*f,f3=f2*f;r.push((2*f3-3*f2+1)*A[c]+(f3-2*f2+f)*m0+(-2*f3+3*f2)*B[c]+(f3-f2)*m1)}return r};
 const pt=(s,a)=>{const c=Math.cos(a),si=Math.sin(a);return[s[1]/2*Math.sign(c)*Math.pow(Math.abs(c),E),s[3]+s[2]/2*Math.sign(si)*Math.pow(Math.abs(si),E),s[0]]};
 /* the openings, in angle (0 = right side, pi/2 = top) and z */
 const NZ=-.72,NA0=-.36,WZ=[[-.5,.42],[.62,1.1]],WA=[.08,.68],TAU=Math.PI*2;
 const nrm=a=>((a%TAU)+TAU)%TAU;
 const glassAt=(a,z)=>{a=nrm(a);if(z<NZ&&(a<Math.PI-NA0||a>TAU+NA0))return 1;for(const w of WZ)if(z>w[0]&&z<w[1]){if(a>WA[0]&&a<WA[1])return 2;if(a>Math.PI-WA[1]&&a<Math.PI-WA[0])return 2}return 0};
 /* the grid: even steps plus every edge */
 const uniq=v=>[...new Set(v.map(x=>Math.round(x*1e5)/1e5))].sort((a,b)=>a-b);
 const ZS=uniq([...Array.from({length:61},(_,i)=>Z0+(Z1-Z0)*Math.pow(i/60,1)),NZ,...WZ.flat()]);
 const AS=uniq([...Array.from({length:97},(_,i)=>i/96*TAU),...WA,Math.PI-WA[0],Math.PI-WA[1],Math.PI-NA0,TAU+NA0]);
 /* the paint, worked out per texel from (angle, z): u = angle / 2pi, v = z along the body */
 const S0=ZS.map(stAt);
 const lett=(sd)=>{const c=document.createElement('canvas');c.width=920;c.height=400;const k=c.getContext('2d');k.textAlign='center';k.textBaseline='middle';
  const P=(z,y)=>[sd>0?(2.3-z)*200:(z+2.3)*200,(2.6-y)*200];
  k.fillStyle=NVc;k.font='bold 44px "Barlow Semi Condensed",DoorsSans,Arial,sans-serif';let p=P(-.04,1.2);k.fillText('DARK POLICE',p[0],p[1]);
  k.fillStyle=WHc;k.font='bold 34px "Barlow Semi Condensed",DoorsSans,Arial,sans-serif';p=P(1.48,1.95);k.fillText('DP-1',p[0],p[1]);
  p=P(-1.25,1.1);k.fillStyle=YLc;k.beginPath();k.moveTo(p[0],p[1]-22);k.lineTo(p[0]+18,p[1]-14);k.lineTo(p[0]+16,p[1]+8);k.lineTo(p[0],p[1]+22);k.lineTo(p[0]-16,p[1]+8);k.lineTo(p[0]-18,p[1]-14);k.closePath();k.fill();k.fillStyle=NVc;k.beginPath();k.arc(p[0],p[1],7,0,7);k.fill();
  return{d:k.getImageData(0,0,920,400).data,P}};
 const LT=[lett(1),lett(-1)];
 const TW=1536,TH=768,cv=document.createElement('canvas');cv.width=TW;cv.height=TH;const cx=cv.getContext('2d'),img=cx.createImageData(TW,TH),D=img.data;
 const hex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];const cN=hex(NVc),cW=hex(WHc),cY=hex(YLc),cD=[26,28,32];
 const rowS=[];for(let py=0;py<TH;py++)rowS.push(stAt(Z0+(Z1-Z0)*py/(TH-1)));
 const FA=.035,FZ=.03;/* frame widths: angle (rad) and z (m) */
 for(let py=0;py<TH;py++){const s=rowS[py],z=s[0];for(let px=0;px<TW;px++){const a=px/(TW-1)*TAU;const[x,y]=pt(s,a);let c=y>1.56?cN:cW;const side=Math.abs(x)>.42;
  if(side&&y>1.4&&y<1.56&&z>-1.5&&z<1.55)c=((Math.floor((z+3)/.075)+(y>1.48?1:0))%2)?cY:cN;
  if(side&&(Math.abs(z+.6)<.01||Math.abs(z-.52)<.01)&&y>.98&&y<2.3)c=cD;
  if(side&&Math.abs(z-.4)<.035&&Math.abs(y-1.66)<.012)c=cD;
  if(side){const L=LT[x>0?0:1],p=L.P(z,y),ix=p[0]|0,iy=p[1]|0;if(ix>=0&&ix<920&&iy>=0&&iy<400){const o=(iy*920+ix)*4,al=L.d[o+3]/255;if(al>0)c=c.map((v,j)=>v+(L.d[o+j]-v)*al)}}
  /* frames round the openings (painted on the body just outside each edge) */
  if(!glassAt(a,z)){if(glassAt(a+FA,z)||glassAt(a-FA,z)||glassAt(a,z+FZ)||glassAt(a,z-FZ))c=cD}
  const o=(py*TW+px)*4;D[o]=c[0];D[o+1]=c[1];D[o+2]=c[2];D[o+3]=255}}
 cx.putImageData(img,0,0);const btx=new THREE.CanvasTexture(cv);btx.anisotropy=8;
 const BODY=new THREE.MeshStandardMaterial({map:btx,roughness:.35,metalness:.3}),LIN=new THREE.MeshStandardMaterial({color:0x3a3c40,roughness:.9,side:THREE.BackSide}),NONE=new THREE.MeshBasicMaterial({visible:false});
 {const pos=[],uv=[],ix=[[],[],[]],NA=AS.length;S0.forEach(s=>{for(const a of AS){pos.push(...pt(s,a));uv.push(a/TAU,1-(s[0]-Z0)/(Z1-Z0))}});
  for(let i=0;i<ZS.length-1;i++)for(let j=0;j<NA-1;j++){const a=i*NA+j,b=a+NA;ix[glassAt((AS[j]+AS[j+1])/2,(ZS[i]+ZS[i+1])/2)].push(a,a+1,b,b,a+1,b+1)}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  geo.setIndex([...ix[0],...ix[1],...ix[2]]);geo.addGroup(0,ix[0].length,0);geo.addGroup(ix[0].length,ix[1].length,1);geo.addGroup(ix[0].length+ix[1].length,ix[2].length,2);geo.computeVertexNormals();
  g.add(new THREE.Mesh(geo,[BODY,GL,TN]));g.add(new THREE.Mesh(geo,[LIN,NONE,NONE]))/* the inside is a plain grey lining */}
 /* ---- inside: floor, the instrument panel, seats (the pilot sits in the front one) ---- */
 BX(.9,.04,2.3,DK,0,1.02,-.2);
 {const pn=BX(.9,.08,.36,DK,0,1.5,-1.32);pn.rotation.x=-.5;BX(.74,.02,.22,K.mfd,0,1.548,-1.3).rotation.x=-.5;CYL(.04,.05,.5,DK,0,1.22,-1.3)}
 for(const sx of[-.4,.4]){BX(.48,.1,.5,SEAT,sx,1.22,-.55);BX(.48,.62,.1,SEAT,sx,1.55,-.28)}
 BX(1.3,.1,.5,SEAT,0,1.22,.75);BX(1.3,.62,.1,SEAT,0,1.55,1.02);
 /* ---- engine fairing on the roof: intakes, twin exhausts, the light bar, the mast ---- */
 {const ef=[[-.75,.04,.03,2.38],[-.55,.5,.32,2.45],[-.1,.9,.56,2.55],[.9,.86,.54,2.55],[1.55,.5,.36,2.46],[1.85,.04,.03,2.38]];
  const pos=[],idx=[],n=24;ef.forEach(s=>{for(let j=0;j<=n;j++){const a=j/n*Math.PI*2,c=Math.cos(a),si=Math.sin(a),e=2/3.2;pos.push(s[1]/2*Math.sign(c)*Math.pow(Math.abs(c),e),s[3]+s[2]/2*Math.sign(si)*Math.pow(Math.abs(si),e),s[0])}});
  for(let i=0;i<ef.length-1;i++)for(let j=0;j<n;j++){const a=i*(n+1)+j,b=a+n+1;idx.push(a,b,a+1,b,b+1,a+1)}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();g.add(new THREE.Mesh(geo,NV));
  for(const sd of[-1,1]){const gr=BX(.03,.18,.36,DK,sd*.455,2.55,-.1);CYL(.09,.11,.26,MT,sd*.26,2.55,1.72,'z',null,12);CYL(.075,.075,.02,DK,sd*.26,2.55,1.86,'z',null,12)}
  BX(1.0,.07,.26,DK,0,2.85,.45);for(const sd of[-1,1])BX(.04,.06,.2,MT,sd*.3,2.8,.45);
  const bea=[BX(.42,.11,.2,M(0x200000,{emissive:0x400000,roughness:.2}),-.25,2.94,.45),BX(.42,.11,.2,M(0x000020,{emissive:0x000040,roughness:.2}),.25,2.94,.45)];g.userData.bea=bea;BX(.06,.12,.21,DK,0,2.94,.45)}
 CYL(.1,.13,.3,MT,0,2.95,0,null,null,14);CYL(.2,.2,.05,MT,0,3.0,0,null,null,16);
 const mr=new THREE.Group();mr.position.set(0,3.15,0);g.add(mr);K.rotorHead(mr,4,4.8,Math.PI/4);
 /* ---- tail: tapered boom, stabiliser with end plates, swept fin, tail skid, tail rotor ---- */
 rod([0,2.0,1.95],[0,2.2,5.5],.25,NV,null,.12,16);CYL(.13,.13,.3,NV,0,2.21,5.5,'z',null,14).scale.set(1,1,1);
 plan([[-.95,4.5],[.95,4.5],[.85,4.85],[-.85,4.85]],.06,NV,2.16);for(const sd of[-1,1])BX(.04,.36,.4,NV,sd*.95,2.2,4.68);
 ext([[5.05,2.15],[5.62,2.18],[6.0,3.2],[5.7,3.24],[5.35,2.5]],.08,NV,0,null,.015);ext([[5.25,2.12],[5.6,2.12],[5.62,1.78],[5.42,1.8]],.06,NV,0,null,.01);rod([0,1.8,5.52],[0,1.72,5.2],.02,MT);
 {const nb=decal(.36,.13,K.text('DP-1','#ecebe6'));nb.position.set(-.052,2.75,5.62);nb.rotation.y=-Math.PI/2;nb.rotation.z=-.0}
 const tr=new THREE.Group();tr.position.set(.14,2.4,5.6);g.add(tr);CYL(.07,.07,.14,MT,0,0,0,'x',tr,10);for(const a of[0,Math.PI/2]){const bl=BX(.03,1.2,.12,M(0x2a2a2a),0,0,0,tr);bl.rotation.x=a;const tp=BX(.032,.14,.122,M(0xe8c020),0,.53,0,bl);tp.position.y=.53;const tq=tp.clone();tq.position.y=-.53;bl.add(tq)}
 lite(0xff2020,0,3.27,5.95);lite(0xffffff,0,2.12,5.66,null,.7);for(const sd of[-1,1])lite(sd<0?0xff2020:0x20ff40,sd*.97,2.42,4.68,null,.8);
 /* ---- skids: tubes turned up at the front, cross tubes into the belly, a boarding step each side ---- */
 for(const sd of[-1,1]){const x=sd*.95;rod([x,.06,-1.25],[x,.06,1.55],.045,MT,null,null,10);rod([x,.06,-1.25],[x,.26,-1.62],.045,MT,null,null,10);rod([x,.06,1.55],[x,.12,1.7],.045,MT,null,null,10);
  BX(.34,.035,.2,MT,x-sd*.08,.42,-.2);rod([x,.06,-.2],[x-sd*.08,.4,-.2],.02,MT)}
 for(const z of[-.85,.9]){for(const sd of[-1,1])rod([sd*.95,.06,z],[sd*.5,1.02,z],.045,MT,null,null,10);rod([-.5,1.02,z],[.5,1.02,z],.045,MT,null,null,10)}
 /* ---- searchlight on a yoke under the nose (the beam group sits at its lens) and a camera ball ---- */
 {const yk=new THREE.Group();yk.position.set(0,.95,-1.2);g.add(yk);CYL(.05,.06,.12,MT,0,0,0,null,yk,10);BX(.4,.04,.06,MT,0,-.07,0,yk);for(const sd of[-1,1])BX(.03,.18,.06,MT,sd*.19,-.15,0,yk);
  const lamp=CYL(.13,.16,.26,DK,0,-.17,0,null,yk,16);const lens=new THREE.Mesh(new THREE.CircleGeometry(.12,16),new THREE.MeshBasicMaterial({color:0xfff2b0}));lens.rotation.x=Math.PI/2;lens.position.set(0,-.305,0);yk.add(lens);
  for(const sd of[-1,1])CYL(.03,.03,.04,MT,sd*.165,-.17,0,'x',yk,8)}
 {const cb=new THREE.Mesh(new THREE.SphereGeometry(.13,14,10),DK);cb.position.set(.42,.86,-.95);g.add(cb);CYL(.035,.035,.12,MT,.42,1.0,-.95,null,null,8);const ln=new THREE.Mesh(new THREE.CircleGeometry(.06,12),new THREE.MeshStandardMaterial({color:0x101820,roughness:.05,metalness:.8}));ln.position.set(.42,.86,-1.081);ln.rotation.y=Math.PI;g.add(ln)}
 CYL(.012,.012,.5,DK,0,.68,.9);CYL(.008,.008,.4,DK,0,2.72,1.4).rotation.x=.4;
 /* ---- the pilot ---- */let sk=null;try{sk=mkCopSeek(.42);sk.position.set(0,1.05,-.6);g.add(sk)}catch(e){}
 /* ---- the beam, as the game had it ---- */
 const spG=new THREE.Group();spG.position.set(0,.8,-1.2);g.add(spG);const cm=new THREE.MeshBasicMaterial({color:0xfff2b0,transparent:true,opacity:.13,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,fog:false});const cone=new THREE.Mesh(new THREE.ConeGeometry(1,1,24,1,true),cm);spG.add(cone);
 const pm=new THREE.MeshBasicMaterial({color:0xfff2b0,transparent:true,opacity:.35,depthWrite:false,blending:THREE.AdditiveBlending,fog:false});const pool=new THREE.Mesh(new THREE.CircleGeometry(6,28),pm);pool.rotation.x=-Math.PI/2;pool.visible=false;spG.visible=false;
 Object.assign(g.userData,{mr,tr,spG,cone,cm,pool,pm,sk});return g}

