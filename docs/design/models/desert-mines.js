/* =====================================================================================================
   THE DESERT MINES (spec: docs/design/desert-mines.md). Needs fort-kit.js, route13.js and mesa-gorge.js (for its
   rock, merge and beam helpers). New globals start with dm.

   Door space: every blocker is built round a doorway at the origin: the door's plane is z = 0 (the end wall), the
   room is on the +z side, x across (the doorway is x ±0.8, 3 m high, as the game's mine doors). In the game, put
   the group at the door's centre (DX, UP, ez) of the room it blocks. Every material has userData.gd = 1 so the
   mines' sandy tint (gildWalk) leaves it alone, and meshes are userData.noSeam.

   Part 1, batch 1: the door blockers (spec part 1, B).
     dmRubble(g)             a rock fall burying the doorway. parts.layers: 6 meshes, top first; setDig(k) (0…1) clears
                             them from the top down, leaving a few stones at 1. obs: the heap until k = 1.
     dmGrate(g)              an iron grate bolted across the doorway. parts.leaf (hinged on the left, open: rotation.y
                             0 → -1.75), parts.bolts (3; turn and pop out with setBolt(i, k)). obs while shut.
     dmWrench()              the big wrench you find in the room (a group, 0.5 m long, lying flat).
     dmLever(g, x, z, ry)    a lever box on a timber post with a cable up to the roof. parts.handle: rotation.x
                             -0.8 (up, shut) → 0.8 (down, open).
     dmCrawl(g)              a rock fall over the doorway with a timbered crawl hole (1.2 wide, 1.05 high) through to the
                             door. obs: the rocks, and the hole as a crouch-only box (cr: 1).
     dmFlood(g, HX)          the last 5.5 m of the room ramps down 2.2 m into a flooded sump with the door at the
                             bottom (the room's exit height is -2.2: see the spec); a hand pump, its valve wheel and a
                             level gauge. parts.water (setLevel(k): 0 full → 1 dry), parts.wheel, parts.needle.
                             heightAt(z): the floor height for the room's rfn.
     dmChasm(g, HX, za, zb)  a real chasm across the room from z za to zb: rock lips, walls going down 12 m into
                             darkness, two rope bridges (x -1.8 and +1.8). opt.rotten: which one is rotten (-1 or 1).
                             parts.snap(k) (0 → 1) drops the rotten bridge. bridges: the two walkable strips.
   ===================================================================================================== */
function dmKit(){const k=rtKit();if(k._dm)return k._dm;const o={},M=(c,op)=>{const m=k.M(c,op);m.userData.gd=1;return m};o.M=M;let sd=6060;const r=()=>((sd=Math.imul(sd^sd>>>15,sd|1)+0x6d2b79f5|0)>>>0)/4294967296;o.r=r;
 /* the game's own mine textures (mineTex in the base: rock, dirt, plank, rails), redrawn here for the preview */
 o.tex=(kind)=>k.tex(128,128,(x,w,h)=>{const R=r;if(kind=='rock'){x.fillStyle='#7a5c40';x.fillRect(0,0,128,128);for(let i=0;i<70;i++){const rr=4+R()*16,v=70+R()*70|0;x.fillStyle='rgb('+(v+30)+','+(v+5)+','+(v*.6|0)+')';x.beginPath();x.ellipse(R()*128,R()*128,rr,rr*(.5+R()*.5),R()*3,0,7);x.fill()}for(let i=0;i<40;i++){x.strokeStyle='rgba(30,18,8,.55)';x.lineWidth=1+R()*2;x.beginPath();let px=R()*128,py=R()*128;x.moveTo(px,py);for(let j=0;j<4;j++){px+=(R()-.5)*30;py+=(R()-.5)*30;x.lineTo(px,py)}x.stroke()}}
  else if(kind=='dirt'){x.fillStyle='#8a6a48';x.fillRect(0,0,128,128);for(let i=0;i<900;i++){const v=90+R()*90|0;x.fillStyle='rgba('+v+','+(v*.78|0)+','+(v*.55|0)+','+(.4+R()*.5)+')';x.fillRect(R()*128,R()*128,1+R()*3,1+R()*2)}}
  else if(kind=='plank'){for(let i=0;i<8;i++){const v=110+R()*40|0;x.fillStyle='rgb('+v+','+(v*.68|0)+','+(v*.42|0)+')';x.fillRect(0,i*16,128,16);x.fillStyle='rgba(40,22,10,.6)';x.fillRect(0,i*16+15,128,1);for(let j=0;j<6;j++){x.strokeStyle='rgba(60,34,14,.35)';x.beginPath();x.moveTo(0,i*16+3+j*2);x.bezierCurveTo(40,i*16+R()*14,80,i*16+R()*14,128,i*16+3+j*2);x.stroke()}x.fillStyle='#2a1a0a';x.fillRect(4+R()*8,i*16+6,2,2);x.fillRect(114+R()*8,i*16+6,2,2)}}
  else if(kind=='rust'){x.fillStyle='#5a4a40';x.fillRect(0,0,128,128);for(let i=0;i<700;i++){const v=r();x.fillStyle=v<.4?'rgba(150,70,30,'+(.2+r()*.4)+')':v<.7?'rgba(60,50,45,.4)':'rgba(190,110,60,.3)';x.fillRect(r()*128,r()*128,1+r()*4,1+r()*3)}}});
 o.ROCKT=o.tex('rock');o.STONET=k.tex(128,128,(x,w,h)=>{x.fillStyle='#b09070';x.fillRect(0,0,w,h);for(let i=0;i<1400;i++){x.fillStyle=r()<.5?'rgba(70,50,35,.18)':'rgba(240,225,200,.16)';x.fillRect(r()*w,r()*h,1+r()*2,1+r()*2)}for(let i=0;i<14;i++){x.fillStyle='rgba(60,40,28,.12)';x.beginPath();x.arc(r()*w,r()*h,5+r()*14,0,7);x.fill()}});o.STONEV=M(0xffffff,{vertexColors:true,roughness:1,map:o.STONET});o.DIRTT=o.tex('dirt');o.PLANKT=o.tex('plank');o.RUSTT=o.tex('rust');
 o.ROCK=M(0x9a7a5a,{roughness:1,map:o.ROCKT});o.ROCKV=M(0xffffff,{vertexColors:true,roughness:1,map:o.ROCKT});o.TIMB=M(0x9a7048,{roughness:.95,map:o.PLANKT});o.TIMBV=M(0xffffff,{vertexColors:true,roughness:.95,map:o.PLANKT});
 o.IRON=M(0x8a7a70,{roughness:.6,metalness:.55,map:o.RUSTT});o.IRONV=M(0xffffff,{vertexColors:true,roughness:.6,metalness:.5,map:o.RUSTT});o.DARK=M(0x2a2622,{roughness:.8,metalness:.4});
 o.c={rock:[.66,.52,.4],rock2:[.56,.43,.32],rock3:[.74,.6,.46],tim:[.72,.54,.38],tim2:[.6,.44,.3],iron:[.62,.56,.52],iron2:[.5,.45,.42]};
 /* a mine-coloured rock for merging (lumpy, smooth-shaded) */o.rock=(list,rad,x,y,z,seed,col,sq)=>{mgPut(list,mgRockGeo(rad,seed,sq||1.0,1+.3*Math.abs(Math.sin(seed))),x,y,z,seed*1.7,col,Math.sin(seed*2.3)*.22,Math.cos(seed*1.1)*.18)};
 k._dm=o;return o}
const dmF=()=>(rtKit().FONT||'"Barlow Semi Condensed",DoorsSans,Arial,sans-serif');
function dmSign(g,w,h,lines,bg,fg,x,y,z,ry){const k=rtKit(),o=dmKit(),c=document.createElement('canvas');c.width=Math.round(256*w/h);c.height=256;const t=c.getContext('2d');t.fillStyle=bg;t.fillRect(0,0,c.width,256);t.strokeStyle=fg;t.lineWidth=10;t.strokeRect(10,10,c.width-20,236);t.fillStyle=fg;t.textAlign='center';
 const n=lines.length;lines.forEach((s,i)=>{t.font=(i?'600 ':'800 ')+(i?150/n*.7:150/n)+'px '+dmF();t.fillText(s,c.width/2,256*(i+.72)/n,c.width-40)});const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,.03),[o.TIMB,o.TIMB,o.TIMB,o.TIMB,o.M(0xffffff,{map:new THREE.CanvasTexture(c),roughness:.8}),o.TIMB]);m.position.set(x,y,z);m.rotation.y=ry||0;g.add(m);return m}

/* drop rocks one at a time onto a height map, so each rests on the ground or on the rocks under it. top(x,z): the heap's
   outline (a rock is kept only if it fits under it); init(x,z): a starting height (something to rest on); block(x,z):
   ground to keep clear. put(rad, x, y, z, i) places a rock with its foot at y. */
function dmPile(o2){const r=dmKit().r,CS=.08,NX=Math.ceil((o2.x1-o2.x0)/CS),NZ=Math.ceil((o2.z1-o2.z0)/CS),H=new Float32Array(NX*NZ);
 for(let i=0;i<NX;i++)for(let j=0;j<NZ;j++)H[i*NZ+j]=o2.init?o2.init(o2.x0+(i+.5)*CS,o2.z0+(j+.5)*CS):0;let kept=0;
 for(let n=0;n<o2.n&&kept<o2.keep;n++){const x=o2.x0+.2+r()*(o2.x1-o2.x0-.4),z=o2.z0+.1+Math.pow(r(),o2.zb||1)*(o2.z1-o2.z0-.2);let rad=o2.rad(0);const fr=rad*.75;let base=0,bad=false;
  for(let i=Math.max(0,Math.floor((x-fr-o2.x0)/CS));i<=Math.min(NX-1,Math.floor((x+fr-o2.x0)/CS));i++)for(let j=Math.max(0,Math.floor((z-fr-o2.z0)/CS));j<=Math.min(NZ-1,Math.floor((z+fr-o2.z0)/CS));j++){const cx=o2.x0+(i+.5)*CS,cz=o2.z0+(j+.5)*CS;if(Math.hypot(cx-x,cz-z)>fr)continue;base=Math.max(base,H[i*NZ+j]);if(o2.block&&o2.block(cx,cz))bad=true}
  const ht=rad*.95;if(bad||base+ht>o2.top(x,z)+.25)continue;o2.put(rad,x,base-.04,z,n);kept++;
  const fr2=rad*1.0;for(let i=Math.max(0,Math.floor((x-fr2-o2.x0)/CS));i<=Math.min(NX-1,Math.floor((x+fr2-o2.x0)/CS));i++)for(let j=Math.max(0,Math.floor((z-fr2-o2.z0)/CS));j<=Math.min(NZ-1,Math.floor((z+fr2-o2.z0)/CS));j++){const cx=o2.x0+(i+.5)*CS,cz=o2.z0+(j+.5)*CS,d=Math.hypot(cx-x,cz-z)/fr2;if(d<1){const k=i*NZ+j;H[k]=Math.max(H[k],base+ht*Math.sqrt(1-d*d)*.92)}}}}
/* ---------- the rubble heap: rocks in six layers, cleared from the top ---------- */
function dmRubble(g){const o=dmKit(),r=o.r,L=[[],[],[],[],[],[]];const peak=2.95;
 /* rocks dropped one by one onto the heap (each rests on what's under it, so nothing floats), up to the heap's outline */
 const core=(x,z)=>2.0*Math.sqrt(Math.max(0,1-Math.pow(x/1.75,2)-Math.pow(z/1.5,2)));
 dmPile({x0:-2.5,x1:2.5,z0:.02,z1:2.9,n:1400,keep:300,zb:1.5,init:core,top:(x,z)=>peak*Math.max(0,1-Math.pow(Math.abs(x)/2.35,1.6))*Math.max(0,1-z/2.8)+.15,rad:(y)=>.2+r()*.34*(1-y/3.4),put:(rad,x,y,z,i)=>o.rock(L[Math.max(0,Math.min(5,Math.floor(y/peak*6)))],rad,x,y,z,i*2.3,[o.c.rock,o.c.rock2,o.c.rock3][i%3])});
 /* a broken timber and a cracked lintel poking out */const T=[];mgBeam(T,[-1.4,.3,1.7],[.6,2.2,.3],.18,.18,o.c.tim2);mgBeam(T,[.9,.2,1.4],[1.9,1.4,.6],.16,.16,o.c.tim);L[2].push(...T);
 const layers=L.map(l=>{const m=mgMerge(l,o.STONEV);m.userData.noSeam=true;g.add(m);return m});
 /* the stones left over when it's cleared */const S=[];for(let i=0;i<9;i++)o.rock(S,.12+r()*.16,(r()*2-1)*2.4,-.03,.4+r()*2.4,i*5.1+90,o.c.rock2);g.add(mgMerge(S,o.STONEV));
 /* the dirt and gravel under the rocks (what shows between them) */const cm=new THREE.Mesh(new THREE.SphereGeometry(1,20,12,0,Math.PI*2,0,Math.PI/2),o.M(0x7a5a3e,{roughness:1,map:o.DIRTT}));cm.scale.set(1.75,2.0,1.5);g.add(cm);
 const setDig=k=>{layers.forEach((m,i)=>m.visible=k<(6-i)/6*.999+.0001);cm.visible=k<.67;cm.scale.y=2.0*Math.max(.05,1-k*1.2)};return{parts:{layers},setDig,obs:[{x0:-2.3,x1:2.3,z0:0,z1:2.2}]}}

/* ---------- the iron grate ---------- */
function dmGrate(g){const o=dmKit(),M=o.M,F=[];const fx=.9,TOP=3.12;
 /* the frame bolted into the rock round the doorway */mgBeam(F,[-fx,0,.3],[-fx,TOP,.3],.16,.16,o.c.iron2);mgBeam(F,[fx,0,.3],[fx,TOP,.3],.16,.16,o.c.iron2);mgBeam(F,[-fx-.13,TOP,.3],[fx+.13,TOP,.3],.18,.18,o.c.iron2);
 for(const y of[.3,1.5,2.7])for(const sx of[-1,1]){const p=new THREE.BoxGeometry(.3,.12,.03);p.translate(sx*(fx+.13),y,.395);mgPut(F,p,0,0,0,0,o.c.iron)}g.add(mgMerge(F,o.IRONV));
 /* the leaf, hinged on the left: bars, three flat rails, a brace */const leaf=new THREE.Group();leaf.position.set(-fx+.08,0,.3);g.add(leaf);const LF=[],W=2*fx-.16;
 for(let x=.06;x<W-.03;x+=.12){const b=new THREE.CylinderGeometry(.022,.022,2.98,6);b.translate(x,1.52,0);mgPut(LF,b,0,0,0,0,o.c.iron)}
 for(const y of[.15,1.5,2.9]){const b=new THREE.BoxGeometry(W,.09,.05);b.translate(W/2,y,0);mgPut(LF,b,0,0,0,0,o.c.iron2)}mgBeam(LF,[.08,.2,.035],[W-.08,2.85,.035],.07,.045,o.c.iron2);
 for(const y of[.4,2.6]){const h=new THREE.CylinderGeometry(.05,.05,.25,10);h.translate(0,y,0);mgPut(LF,h,0,0,0,0,o.c.iron2)}leaf.add(mgMerge(LF,o.IRONV));
 const sg=dmSign(leaf,.6,.36,['DANGER','NO ENTRY'],'#c8a020','#1a1a1a',W/2,1.85,.06);
 /* three latch bolts on the right side: big hex heads on threaded rods */const bolts=[];for(const y of[.6,1.5,2.4]){const b=new THREE.Group();b.position.set(fx-.02,y,.47);g.add(b);const hd=new THREE.Mesh(new THREE.CylinderGeometry(.065,.065,.07,6),M(0x6a625c,{metalness:.7,roughness:.4}));hd.rotation.x=Math.PI/2;b.add(hd);
  const rod=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.28,8),M(0x8a8278,{metalness:.7,roughness:.35}));rod.rotation.x=Math.PI/2;rod.position.z=-.12;b.add(rod);const wsh=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.015,12),M(0x5a524c,{metalness:.6}));wsh.rotation.x=Math.PI/2;wsh.position.z=-.04;b.add(wsh);bolts.push(b)}
 const setBolt=(i,k)=>{const b=bolts[i];b.rotation.z=-k*Math.PI*4;b.position.z=.47+k*.22;b.visible=k<1};
 return{parts:{leaf,bolts},setBolt,obs:[{x0:-1,x1:1,z0:.2,z1:.42}]}}
function dmWrench(){const o=dmKit(),G=new THREE.Group(),S=[];const st=new THREE.BoxGeometry(.42,.035,.06);st.translate(0,.02,0);mgPut(S,st,0,0,0,0,[.62,.6,.58]);
 for(const sx of[-1,1]){const jaw=new THREE.TorusGeometry(.06,.022,6,12,Math.PI*1.4);jaw.rotateX(Math.PI/2);jaw.rotateY(sx>0?-.7:Math.PI-.7);jaw.translate(sx*.25,.02,0);mgPut(S,jaw,0,0,0,0,[.66,.64,.6])}G.add(mgMerge(S,o.IRONV));return G}
function dmLever(g,x,z,ry){const o=dmKit(),M=o.M,G=new THREE.Group();G.position.set(x,0,z);G.rotation.y=ry||0;g.add(G);const T=[];mgBeam(T,[0,0,0],[0,1.6,0],.18,.18,o.c.tim);G.add(mgMerge(T,o.TIMBV));
 const box=new THREE.Mesh(new THREE.BoxGeometry(.32,.46,.16),M(0x4a5a4a,{metalness:.5,roughness:.5}));box.position.set(0,1.25,.17);G.add(box);const slot=new THREE.Mesh(new THREE.BoxGeometry(.06,.36,.02),o.DARK);slot.position.set(0,1.25,.255);G.add(slot);
 const handle=new THREE.Group();handle.position.set(0,1.25,.26);handle.rotation.x=-.8;G.add(handle);const hb=new THREE.Mesh(new THREE.CylinderGeometry(.022,.022,.5,8),M(0x8a8a8a,{metalness:.7,roughness:.35}));hb.position.y=.25;handle.add(hb);const kn=new THREE.Mesh(new THREE.SphereGeometry(.05,10,8),M(0xc02020,{roughness:.5}));kn.position.y=.5;handle.add(kn);
 const lbl=dmSign(G,.3,.1,['GRATE'],'#e8e0c8','#1a1a1a',0,1.55,.255);
 /* the cable up the post to the roof */const cb=new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,2.6,6),M(0x2a2a2a,{roughness:.6}));cb.position.set(.06,2.75,.11);G.add(cb);return{parts:{handle},obs:[{x0:x-.15,x1:x+.15,z0:z-.15,z1:z+.15}]}}

/* ---------- the crawlspace: a rock fall with a timbered crawl hole through it ---------- */
function dmCrawl(g){const o=dmKit(),r=o.r,R=[],T=[];const HW=.6,HH=1.05,LEN=1.9;
 /* the crawl tunnel: timber sets every 0.6 m, lagging boards on the roof and sides */for(let z=.15;z<=LEN;z+=.58){mgBeam(T,[-HW-.08,0,z],[-HW-.08,HH+.08,z],.14,.14,o.c.tim);mgBeam(T,[HW+.08,0,z],[HW+.08,HH+.08,z],.14,.14,o.c.tim);mgBeam(T,[-HW-.16,HH+.15,z],[HW+.16,HH+.15,z],.14,.16,o.c.tim2)}
 for(let i=0;i<6;i++){const x=-HW+i*(2*HW)/5;mgBeam(T,[x,HH+.26,.05],[x,HH+.26,LEN+.1],.2,.05,o.c.tim2)}for(const sx of[-1,1])for(let j=0;j<4;j++){const y=.15+j*.27;mgBeam(T,[sx*(HW+.17),y,.05],[sx*(HW+.17),y,LEN+.1],.05,.22,o.c.tim2)}
 g.add(mgMerge(T,o.TIMBV));
 /* the rocks: a heap over and round it, up to the roof of the doorway, spreading into the room; the hole runs through it */
 dmPile({x0:-2.6,x1:2.6,z0:.02,z1:2.9,n:800,keep:210,top:(x,z)=>3.15*Math.max(0,1-Math.pow(Math.abs(x)/2.55,2.2))*Math.max(0,1-Math.max(0,z-1.6)/1.25)+.1,
  init:(x,z)=>Math.abs(x)<HW+.24&&z<LEN+.12?HH+.33:0,/* the crawl hole's lagging roof is what the rocks above it rest on */
  block:(x,z)=>Math.abs(x)<HW+.3&&z>=LEN+.12&&z<LEN+1.6,/* keep the way into the hole clear */
  rad:()=>.18+r()*.3,put:(rad,x,y,z,i)=>o.rock(R,rad,x,y,z,i*3.7,[o.c.rock,o.c.rock2,o.c.rock3][i%3])});
 g.add(mgMerge(R,o.STONEV));
 /* inside: dark */const dk=new THREE.Mesh(new THREE.PlaneGeometry(2*HW,HH),o.M(0x0a0806,{roughness:1}));dk.position.set(0,HH/2,.08);g.add(dk);
 return{obs:[{x0:-2.4,x1:-HW-.05,z0:0,z1:2.4},{x0:HW+.05,x1:2.4,z0:0,z1:2.4},{x0:-HW,x1:HW,z0:0,z1:LEN,cr:1}]}}

/* ---------- the flooded sump: the floor ramps down to a door under water; a hand pump drains it ---------- */
function dmFlood(g,HX){const k=rtKit(),o=dmKit(),M=o.M,r=o.r,D=2.2,RL=5.5;HX=HX||4;
 const heightAt=z=>z>=RL?0:z<=.6?-D:-D*(1-(z-.6)/(RL-.6));
 /* the ramp and sump floor (wet dirt), the sump's rock sides down from the room floor */{const ge=new THREE.PlaneGeometry(2*HX,RL+.2,4,24),P=ge.attributes.position;for(let i=0;i<P.count;i++){const x=P.getX(i),v=P.getY(i)+(RL+.2)/2;P.setXYZ(i,x,heightAt(v)+.01+.03*Math.sin(x*3.1+v*2.3),v)}ge.computeVertexNormals();
  const fm=M(0x6a5444,{roughness:.9,map:o.DIRTT.clone()});fm.map.needsUpdate=true;fm.map.repeat.set(4,3);const f=new THREE.Mesh(ge,fm);g.add(f);
  /* the floor faces the right way up: PlaneGeometry in xy, remapped (x → x, y → z): its normal now points down, so flip it */const idx=ge.index.array;for(let i=0;i<idx.length;i+=3){const t=idx[i+1];idx[i+1]=idx[i+2];idx[i+2]=t}ge.computeVertexNormals()}
 for(const sx of[-1,1]){const sh=new THREE.Shape();sh.moveTo(0,0);sh.lineTo(RL,0);sh.lineTo(.6,-D);sh.lineTo(0,-D);sh.lineTo(0,0);const ge=new THREE.ShapeGeometry(sh),m=new THREE.Mesh(ge,M(0x7a5c42,{roughness:1,map:o.ROCKT,side:THREE.DoubleSide}));m.rotation.y=-Math.PI/2;m.position.set(sx*HX-sx*.005,0,0);g.add(m)}
 /* the end wall carried down below the room floor, either side of the doorway */for(const sx of[-1,1]){const w=new THREE.Mesh(new THREE.PlaneGeometry(HX-.8,D),M(0x7a5c42,{roughness:1,map:o.ROCKT}));w.position.set(sx*(HX+.8)/2,-D/2,.004);g.add(w)}
 /* the water: a sheet across the sump, from the room floor down to dry */const wm=M(0x2a4a4a,{roughness:.1,metalness:.2,transparent:true,opacity:.86,emissive:0x061818,emissiveIntensity:.5,map:k.tex(128,128,(c,w,h)=>{c.fillStyle='#3a5a5a';c.fillRect(0,0,w,h);for(let i=0;i<90;i++){c.strokeStyle='rgba(200,230,230,'+(.08+r()*.18)+')';c.lineWidth=1;c.beginPath();const x=r()*w,y=r()*h;c.moveTo(x,y);c.quadraticCurveTo(x+8,y+(r()-.5)*3,x+16+r()*20,y);c.stroke()}})});wm.map.repeat.set(2,2);
 const water=new THREE.Mesh(new THREE.PlaneGeometry(1,1),wm);water.rotation.x=-Math.PI/2;g.add(water);
 const setLevel=t=>{const y=-.06-(D-.12)*t;const z1=y>=-D?Math.min(RL,.6+(RL-.6)*(1-(-y)/D)):.6;water.scale.set(2*HX-.02,Math.max(.01,z1-.0),1);water.position.set(0,y,z1/2);water.visible=t<.99};setLevel(0);
 /* drips and a wet streak on the door (the passage beyond is full) */
 /* the hand pump on the right wall: a pipe from the sump up over the edge, a pump body, the valve wheel, a gauge */const px=HX-.45,pz=RL+1.2;const P=[];mgBeam(P,[px,-D+.3,1.2],[px,.2,1.2],.16,.16,o.c.iron2);mgBeam(P,[px,.2,1.2],[px,.2,pz],.16,.16,o.c.iron2);mgBeam(P,[px,.2,pz],[px,.9,pz],.2,.2,o.c.iron);
 {const body=new THREE.CylinderGeometry(.28,.3,.9,14);body.translate(px,1.35,pz);mgPut(P,body,0,0,0,0,o.c.iron2);const cap=new THREE.CylinderGeometry(.33,.33,.08,14);cap.translate(px,1.84,pz);mgPut(P,cap,0,0,0,0,o.c.iron)}
 mgBeam(P,[px,1.0,pz+.3],[px,1.0,pz+3.2],.12,.12,o.c.iron2);/* outflow pipe along the wall to a drain */g.add(mgMerge(P,o.IRONV));
 const wheel=new THREE.Group();wheel.position.set(px-.36,1.35,pz);wheel.rotation.z=Math.PI/2;g.add(wheel);{const t=new THREE.Mesh(new THREE.TorusGeometry(.26,.03,8,24),M(0xc02020,{metalness:.4,roughness:.5}));t.rotation.x=Math.PI/2;wheel.add(t);for(let i=0;i<6;i++){const a=i*Math.PI/3,s=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.19,6),M(0xa01818,{metalness:.4}));s.rotation.z=Math.PI/2;s.rotation.y=a;s.position.set(Math.cos(a)*.165,0,-Math.sin(a)*.165);wheel.add(s)}const hub=new THREE.Mesh(new THREE.CylinderGeometry(.085,.085,.1,12),M(0x3a3a3a,{metalness:.6}));wheel.add(hub)}
 const gauge=new THREE.Group();gauge.position.set(px-.29,1.62,pz+.32);gauge.rotation.y=-Math.PI/2;g.add(gauge);{const face=new THREE.Mesh(new THREE.CircleGeometry(.12,24),M(0xffffff,{map:k.tex(128,128,(c,w,h)=>{c.fillStyle='#f0ead8';c.beginPath();c.arc(64,64,62,0,7);c.fill();c.lineWidth=6;for(const[a0,a1,col]of[[-2.4,-.8,'#c03020'],[-.8,.8,'#d0a020'],[.8,2.4,'#30a040']]){c.strokeStyle=col;c.beginPath();c.arc(64,64,48,a0-Math.PI/2,a1-Math.PI/2);c.stroke()}c.fillStyle='#222';c.font='700 20px '+dmF();c.textAlign='center';c.fillText('WATER',64,96)}),roughness:.5}));gauge.add(face);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(.125,.015,6,24),M(0x8a8278,{metalness:.7}));gauge.add(rim)}
 const needle=new THREE.Mesh(new THREE.BoxGeometry(.012,.1,.006),M(0x1a1a1a));needle.geometry.translate(0,.05,0);needle.position.set(px-.302,1.62,pz+.32);needle.rotation.order='YXZ';needle.rotation.y=-Math.PI/2;g.add(needle);
 dmSign(g,1.2,.5,['FLOODED','PUMP IT FIRST'],'#e8e0c8','#1a3a6a',HX-.03,1.8,RL+.4,-Math.PI/2);
 const set=t=>{setLevel(t);needle.rotation.z=-2.4+(1-t)*0;needle.rotation.z=2.4-4.8*t};set(0);
 return{parts:{water,wheel,needle},setLevel:set,heightAt,obs:[{x0:px-.35,x1:px+.35,z0:pz-.35,z1:pz+.35}]}}

/* ---------- a chasm across the room, two rope bridges ---------- */
function dmChasm(g,HX,za,zb,opt){const k=rtKit(),o=dmKit(),M=o.M,r=o.r;opt=opt||{};HX=HX||4;const rot=opt.rotten||1,DP=12,BW=1.1,bx=[-1.8,1.8];
 /* the walls going down, getting darker, and black at the bottom */for(const[z,ry]of[[za,0],[zb,Math.PI]]){const ge=new THREE.PlaneGeometry(2*HX,DP,8,12),P=ge.attributes.position,C=new Float32Array(P.count*3);for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i)-DP/2;P.setXYZ(i,x,y,.25*Math.sin(x*2.1+y*.9)+.15*Math.sin(y*1.7));const d=Math.max(0,1+y/DP);const v=Math.pow(d,1.6);C[i*3]=.66*v;C[i*3+1]=.52*v;C[i*3+2]=.4*v}
  ge.setAttribute('color',new THREE.BufferAttribute(C,3));ge.computeVertexNormals();const m=new THREE.Mesh(ge,M(0xffffff,{vertexColors:true,roughness:1,map:o.ROCKT}));m.rotation.y=ry;m.position.z=z+(ry?-.0:.0);g.add(m)}
 for(const sx of[-1,1]){const ge=new THREE.PlaneGeometry(zb-za,DP);const m=new THREE.Mesh(ge,M(0x3a2a20,{roughness:1}));m.rotation.y=sx<0?Math.PI/2:-Math.PI/2;m.position.set(sx*HX,-DP/2,(za+zb)/2);g.add(m)}
 {const b=new THREE.Mesh(new THREE.PlaneGeometry(2*HX,zb-za),M(0x020202,{roughness:1}));b.rotation.x=-Math.PI/2;b.position.set(0,-DP,(za+zb)/2);g.add(b)}
 /* a faint mist far down */{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),gr=x.createRadialGradient(32,32,2,32,32,32);gr.addColorStop(0,'rgba(120,110,100,.35)');gr.addColorStop(1,'rgba(120,110,100,0)');x.fillStyle=gr;x.fillRect(0,0,64,64);const mt=new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false});mt.userData.gd=1;for(let i=0;i<5;i++){const s=new THREE.Sprite(mt);s.position.set((r()*2-1)*HX*.7,-7-r()*3,za+(zb-za)*(.2+.6*r()));s.scale.setScalar(5);g.add(s)}}
 /* rock lips along both edges */const LR=[];for(const z of[za,zb]){const n=z==za?1:-1;for(let x=-HX+.3;x<HX;x+=.55+r()*.4){if(bx.some(b=>Math.abs(x-b)<BW/2+.25))continue;o.rock(LR,.22+r()*.22,x,-.05,z+n*(.15+r()*.15),x*7+z,[o.c.rock,o.c.rock2][r()<.5?0:1],.55)}}g.add(mgMerge(LR,o.STONEV));
 /* the bridges: anchor posts, two hand ropes, foot ropes, planks; the rotten one is missing planks and has a frayed rope */
 const span=zb-za,sag=z=>-.35*Math.sin(Math.PI*(z-za)/span),bridges=[];let snapG=null;
 bx.forEach(bxc=>{const rotten=Math.sign(bxc)==rot,G2=new THREE.Group();g.add(G2);const T=[],RP=[];const ropeC=rotten?[.5,.44,.34]:[.72,.62,.46];
  for(const z of[za-.5,zb+.5])for(const sx of[-1,1]){mgBeam(T,[bxc+sx*(BW/2+.08),-.4,z],[bxc+sx*(BW/2+.08),1.15,z],.16,.16,o.c.tim)}
  for(const sx of[-1,1]){const pts=[];for(let i=0;i<=16;i++){const z=za-.5+(span+1)*i/16;const zz=Math.min(zb,Math.max(za,z));pts.push(new THREE.Vector3(bxc+sx*(BW/2+.08),1.0+sag(zz)*.6,z))}mgPut(RP,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),24,.025,5,false),0,0,0,0,ropeC);
   const fp=[];for(let i=0;i<=16;i++){const z=za-.5+(span+1)*i/16;const zz=Math.min(zb,Math.max(za,z));fp.push(new THREE.Vector3(bxc+sx*(BW/2-.05),sag(zz)-.02,z))}mgPut(RP,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(fp),24,.02,5,false),0,0,0,0,ropeC)}
  /* uprights from the hand ropes down to the foot ropes */for(let z=za+.5;z<zb;z+=.8)for(const sx of[-1,1])mgBeam(RP,[bxc+sx*(BW/2+.07),sag(z),z],[bxc+sx*(BW/2+.07),1.0+sag(z)*.6,z],.012,.012,ropeC);
  const PL=[];const missing=rotten?[3,4,9,10,11]:[];let pi=0;for(let z=za+.12;z<zb-.05;z+=.26,pi++){if(missing.includes(pi))continue;const tilt=rotten?(r()-.5)*.25:(r()-.5)*.05;const p=new THREE.BoxGeometry(BW,.05,.2);p.rotateZ(tilt);p.translate(bxc,sag(z)+.01,z);mgPut(PL,p,0,0,0,0,rotten?[.48,.38,.28]:[.7,.53,.36])}
  if(rotten){/* a frayed end hanging off the right hand rope at the middle */const zm=(za+zb)/2;mgBeam(RP,[bxc+BW/2+.08,1.0+sag(zm)*.6,zm],[bxc+BW/2+.2,.3+sag(zm),zm+.3],.012,.012,ropeC)}
  G2.add(mgMerge(T,o.TIMBV));const ropes=mgMerge(RP,M(0xffffff,{vertexColors:true,roughness:1}));const planks=mgMerge(PL,o.TIMBV);
  if(rotten){/* the rotten one hangs from a pivot at each end, so it can snap in the middle and swing down */const h1=new THREE.Group(),h2=new THREE.Group();h1.position.set(bxc,0,za);h2.position.set(bxc,0,zb);G2.add(h1,h2);
   const c1=ropes.clone(),c2=ropes.clone(),p1=planks.clone(),p2=planks.clone();for(const[m,hh,keep]of[[c1,h1,z=>z<(za+zb)/2],[c2,h2,z=>z>=(za+zb)/2],[p1,h1,z=>z<(za+zb)/2],[p2,h2,z=>z>=(za+zb)/2]]){m.position.set(-hh.position.x,0,-hh.position.z);
     /* each half keeps only its own triangles */const P=m.geometry.attributes.position,n=P.count;const ng=m.geometry.clone(),NP=ng.attributes.position;for(let i=0;i<n;i+=3){const cz=(P.getZ(i)+P.getZ(i+1)+P.getZ(i+2))/3;if(!keep(cz))for(let j=0;j<3;j++)NP.setXYZ(i+j,0,-50,0)}m.geometry=ng;hh.add(m)}
   snapG={h1,h2}}else{G2.add(ropes,planks)}
  bridges.push({x0:bxc-BW/2,x1:bxc+BW/2,z0:za,z1:zb,rotten})});
 const snap=t=>{if(!snapG)return;const a=Math.min(1,t)*1.45;snapG.h1.rotation.x=a;snapG.h2.rotation.x=-a};
 return{parts:{snap},bridges,obs:[]}}
