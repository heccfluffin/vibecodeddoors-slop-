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
                             0.35 (up, leaning out: shut) → 2.6 (down, leaning out: open).
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
 const handle=new THREE.Group();handle.position.set(0,1.25,.26);handle.rotation.x=.35;G.add(handle);const hb=new THREE.Mesh(new THREE.CylinderGeometry(.022,.022,.5,8),M(0x8a8a8a,{metalness:.7,roughness:.35}));hb.position.y=.25;handle.add(hb);const kn=new THREE.Mesh(new THREE.SphereGeometry(.05,10,8),M(0xc02020,{roughness:.5}));kn.position.y=.5;handle.add(kn);
 const lbl=dmSign(G,.3,.1,['GRATE'],'#e8e0c8','#1a1a1a',0,.92,.105);
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

/* ---------- Part 1, batch 2: things in the rooms (spec part 1, A and C) ----------
   Room space: the game's mine room, walls at x = ±HX, floor y 0, roof y 4.
     dmVein(g, x, y, z, ry, ore, seed)  an ore vein on a wall: a dark rock boss with lumps of ore in it. Built facing +z at
                                        ry 0 (so on the left wall ry = PI/2, right wall -PI/2), its back flush with the wall.
                                        ore: 'cu' copper, 'fe' iron, 'ag' silver, 'au' gold, 'cr' crystal, 'dm' diamond.
                                        setMined(k) (0…1, hits done / hits needed) knocks the lumps out; at 1 it is a dull
                                        broken pocket with pick marks. tick(t) twinkles silver, gold, crystal and diamond.
     dmOreCart(g, x, z, ry)             the ore cart you bank at: a steel tub on a short length of track with a buffer, a
                                        lamp post and an ORE CART board. setLoad(k) (0…1) fills it as ore is tipped in.
     dmAlcove(g, x, z, side)            a niche in the wall (side -1 left, 1 right): two rock buttresses either side of a
                                        1.4 m gap with a timber head beam, a few stones inside. obs: the buttresses.
     dmOil()                            a lamp oil tin (the pickup).
     dmGas(g, x, z, HX, L)              a gas pocket: a hissing fissure by the wall with yellow crust, a GAS chalk board,
                                        and a low green haze; setFill(k) spreads it through the room (0 → 1 over 20 s),
                                        tick(t) makes it drift.
     dmRockfall(g, x, z)                a loose patch in the roof: cracked slabs and hanging stones. warn(on) starts the
                                        dust; fall(k) (0 → 1 over 0.6 s) drops the stones; at 1 a small heap stays.
   ===================================================================================================== */
const DMORE={cu:{n:'copper',c:0xc8703a,e:0,m:.7,r:.35,v:'nug'},fe:{n:'iron',c:0x8a4a32,e:0,m:.3,r:.8,v:'nug'},ag:{n:'silver',c:0xd8dce0,e:0,m:.95,r:.18,v:'nug',tw:1},au:{n:'gold',c:0xf0c040,e:0x3a2800,m:1,r:.2,v:'nug',tw:1},
 cr:{n:'crystal',c:0x60c8ff,e:0x2080d0,m:.1,r:.1,v:'xtal',tw:1,op:.85},dm:{n:'diamond',c:0xf4fbff,e:0x6080a0,m:.2,r:.02,v:'gem',tw:1,op:.9}};
function dmTwinkle(){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');const gr=x.createRadialGradient(32,32,1,32,32,30);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.25,'rgba(255,250,220,.6)');gr.addColorStop(1,'rgba(255,240,200,0)');x.fillStyle=gr;x.fillRect(0,0,64,64);x.fillStyle='rgba(255,255,255,.9)';x.fillRect(31,2,2,60);x.fillRect(2,31,60,2);return new THREE.CanvasTexture(c)}
function dmVein(g,x,y,z,ry,ore,seed){const o=dmKit(),M=o.M,O=DMORE[ore]||DMORE.cu;let sd=(seed|0)*7919+13;const r=()=>((sd=Math.imul(sd^sd>>>15,sd|1)+0x6d2b79f5|0)>>>0)/4294967296;
 const G=new THREE.Group();G.position.set(x,y,z);G.rotation.y=ry||0;g.add(G);
 /* the rock boss: a squashed lump standing out from the wall, darker than the wall */const W=.9+r()*.4,Hh=.7+r()*.3,Dp=.22;const bg=new THREE.SphereGeometry(1,18,12,0,Math.PI*2,0,Math.PI/2),P=bg.attributes.position;for(let i=0;i<P.count;i++){const px=P.getX(i),py=P.getY(i),pz=P.getZ(i),j=1+.12*Math.sin(px*5+pz*3+sd)+.08*Math.sin(pz*7-px*4);P.setXYZ(i,px*W*j,-pz*Hh*j,py*Dp*j)}bg.computeVertexNormals();{const U=bg.attributes.uv;for(let i=0;i<P.count;i++)U.setXY(i,P.getX(i)/W*.5+.5,P.getY(i)/Hh*.5+.5)}/* flat on the face, so the texture isn't swirled */
 const hex='#'+O.c.toString(16).padStart(6,'0'),vt=rtKit().tex(256,256,(c,w,h)=>{c.fillStyle={cu:'#5a3a2a',fe:'#4a2c24',ag:'#4a4644',au:'#cfc6b2',cr:'#2e2a32',dm:'#3a444c'}[ore]||'#4e3c30';c.fillRect(0,0,w,h);for(let i=0;i<2600;i++){c.fillStyle=r()<.5?'rgba(40,28,20,.25)':'rgba(200,170,140,.12)';c.fillRect(r()*w,r()*h,1+r()*2,1+r()*2)}
  c.strokeStyle='rgba(25,15,10,.6)';c.lineWidth=1.5;for(let i=0;i<7;i++){c.beginPath();let px=r()*w,py=r()*h;c.moveTo(px,py);for(let j=0;j<4;j++){px+=(r()-.5)*40;py+=(r()-.5)*40;c.lineTo(px,py)}c.stroke()}
  /* flecks of the ore in the rock, thicker along a slanted band */c.globalAlpha=.8;for(let i=0;i<520;i++){const t=r(),x0=t*w,y0=h*.5+(t-.5)*h*.5+(r()-.5)*h*(r()<.6?.25:.9);c.fillStyle=hex;c.beginPath();c.arc(x0,y0,.8+r()*1.8,0,7);c.fill()}c.globalAlpha=1});
 const mt=rtKit().tex(128,128,(c,w,h)=>{c.fillStyle='#4a3a2e';c.fillRect(0,0,w,h);for(let i=0;i<700;i++){c.fillStyle=r()<.5?'rgba(20,12,8,.3)':'rgba(170,140,110,.12)';c.fillRect(r()*w,r()*h,1+r()*2,1+r()*2)}
  /* pick scars: short bright gouges, all at a slant */for(let i=0;i<26;i++){const px=r()*w,py=r()*h,a=-.7+(r()-.5)*.6,l=8+r()*14;c.strokeStyle='rgba(190,165,135,.75)';c.lineWidth=2;c.beginPath();c.moveTo(px,py);c.lineTo(px+Math.cos(a)*l,py+Math.sin(a)*l);c.stroke();c.strokeStyle='rgba(15,10,6,.7)';c.lineWidth=1.5;c.beginPath();c.moveTo(px+1.5,py+1.5);c.lineTo(px+1.5+Math.cos(a)*l,py+1.5+Math.sin(a)*l);c.stroke()}});
 const boss=new THREE.Mesh(bg,M(0xffffff,{roughness:.95,map:vt}));G.add(boss);

 /* the ore, set into the boss. Each ore its own way:
    copper: rounded native-copper nuggets, some gone green (malachite); iron: dark metallic haematite knobs with rust;
    silver: bright wiry nuggets, some tarnished; gold: smooth yellow nuggets in white quartz;
    crystal: clusters of six-sided crystals with points, glowing; diamond: a few clear octahedral stones in blue-grey rock. */
 const lumps=[],std=(c,op)=>M(c,Object.assign({roughness:O.r,metalness:O.m*.75},op||{}));
 const nug=(rad,sm)=>{const ge=new THREE.SphereGeometry(rad,sm?9:6,sm?7:5),P=ge.attributes.position,s2=r()*9;for(let j=0;j<P.count;j++){const px=P.getX(j),py=P.getY(j),pz=P.getZ(j),q=1+.28*Math.sin(px*31+py*17+s2)+.18*Math.sin(pz*41-px*23+s2*2);P.setXYZ(j,px*q*1.15,py*q*.85,pz*q*.7)}ge.computeVertexNormals();return ge};
 const onBoss=(d0)=>{const a=r()*6.28,d=Math.sqrt(r())*(d0||.78);return[Math.cos(a)*d*W,Math.sin(a)*d*Hh,Dp*Math.sqrt(Math.max(0,1-d*d))*.92]};
 if(O.v=='nug'){const mats=ore=='cu'?[std(0xc8703a,{emissive:0x401808,emissiveIntensity:.25}),std(0x3aa070,{metalness:.1,roughness:.6})]:ore=='fe'?[std(0x4a4650,{metalness:.65,roughness:.35}),std(0x9a4a2a,{metalness:.1,roughness:.9})]:ore=='ag'?[std(0xe8ecf0,{metalness:.45,roughness:.22,emissive:0x5a5e64,emissiveIntensity:.55}),std(0x9a9ca0,{metalness:.4,roughness:.4,emissive:0x2a2c30,emissiveIntensity:.4})]:[std(0xffd040,{metalness:.45,roughness:.2,emissive:0x8a5a00,emissiveIntensity:.6}),std(0xf0b030,{metalness:.45,roughness:.3,emissive:0x6a4000,emissiveIntensity:.45})];
  const N=ore=='au'?9:ore=='ag'?12:14;for(let i=0;i<N;i++){const[lx,ly,lz]=onBoss();const big=r()<.3,m=new THREE.Mesh(nug(big?.1+r()*.05:.05+r()*.04,ore=='au'||ore=='ag'),mats[r()<(ore=='cu'?.3:ore=='fe'?.35:.25)?1:0]);m.position.set(lx,ly,lz-.015);m.rotation.set(r()*.5,r()*.5,r()*6);G.add(m);lumps.push(m)}}
 else if(O.v=='xtal'){const cm=M(0x7ad8ff,{roughness:.08,metalness:.05,emissive:0x2a90e0,emissiveIntensity:.75,transparent:true,opacity:.88}),cm2=M(0xb8ecff,{roughness:.05,metalness:.05,emissive:0x60b0f0,emissiveIntensity:.9,transparent:true,opacity:.92});
  for(let c=0;c<3;c++){const[cx,cy,cz]=onBoss(.55),cl=new THREE.Group();cl.position.set(cx,cy,cz-.04);G.add(cl);const n=4+Math.floor(r()*4);for(let i=0;i<n;i++){const L=.14+r()*.26,rr=.028+r()*.025,cg=new THREE.Group();const body=new THREE.Mesh(new THREE.CylinderGeometry(rr,rr*1.1,L,6),i%3?cm:cm2);body.position.y=L/2;cg.add(body);const tip=new THREE.Mesh(new THREE.ConeGeometry(rr,rr*2.4,6),i%3?cm:cm2);tip.position.y=L+rr*1.2;cg.add(tip);
   cg.rotation.order='ZXY';cg.rotation.set(Math.PI/2-.55+r()*1.1,0,(r()-.5)*1.2);cl.add(cg)}lumps.push(cl)}}
 else{const gm=M(0xf6fbff,{roughness:.02,metalness:.1,emissive:0x8aa8c8,emissiveIntensity:.35,transparent:true,opacity:.88});for(let i=0;i<5;i++){const[lx,ly,lz]=onBoss(.7);const ge=new THREE.OctahedronGeometry(.07+r()*.035,0);ge.scale(1,1.25,1);const m=new THREE.Mesh(ge,gm);m.position.set(lx,ly,lz+.01);m.rotation.set(r()*3,r()*3,r()*3);G.add(m);lumps.push(m)}}
 /* the dull pocket left when it's mined: pick marks and chips (hidden until then) */const dull=new THREE.Group();dull.visible=false;G.add(dull);{const CH=[];for(let i=0;i<7;i++)o.rock(CH,.04+r()*.05,(r()-.5)*W*1.4,-y+.02,Dp+.2+r()*.4,i+sd%97,[.5,.42,.35]);const ch=mgMerge(CH,o.STONEV);dull.add(ch)}
 /* twinkles on the precious ones */const tw=[];if(O.tw){const t=dmTwinkle();for(let i=0;i<3;i++){const sm=new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,color:O.c});sm.userData.gd=1;const s=new THREE.Sprite(sm);const L=lumps[i%lumps.length];s.position.copy(L.position);s.position.z+=.06;s.scale.setScalar(.22);G.add(s);tw.push(s)}}
 let mined=0;const setMined=k=>{mined=k;const n=Math.round(lumps.length*Math.min(1,k));lumps.forEach((l,i)=>l.visible=i>=n);dull.visible=k>=1;boss.material.map=k>=1?mt:vt;boss.material.needsUpdate=true;boss.scale.z=k>=1?.5:1;tw.forEach(s=>s.visible=k<1)};
 const tick=t=>{tw.forEach((s,i)=>{const p=Math.max(0,Math.sin(t*2.3+i*2.1+sd%10));s.material.opacity=Math.pow(p,6);s.scale.setScalar(.12+.18*Math.pow(p,3))})};
 return{parts:{lumps,boss},setMined,tick,ore:O.n}}

function dmOreCart(g,x,z,ry){const k=rtKit(),o=dmKit(),M=o.M,G=new THREE.Group();G.position.set(x,0,z);G.rotation.y=ry||0;g.add(G);const S=[];
 /* track: two rails on sleepers, 4 m, with a buffer stop at the far end */for(let s=-1.8;s<=1.8;s+=.6){const sl=new THREE.BoxGeometry(1.5,.1,.22);sl.translate(0,.05,s);mgPut(S,sl,0,0,0,0,o.c.tim2)}
 for(const sx of[-.5,.5]){const rl=new THREE.BoxGeometry(.07,.09,4.0);rl.translate(sx,.145,0);mgPut(S,rl,0,0,0,0,[.5,.46,.42])}
 for(const sx of[-.55,.55])mgBeam(S,[sx,.1,-2.1],[sx,.75,-2.1],.18,.18,o.c.tim);mgBeam(S,[-.75,.7,-2.1],[.75,.7,-2.1],.24,.24,o.c.tim2);G.add(mgMerge(S,o.TIMBV));
 /* the cart: a tapered steel tub with ribs, on four wheels */const C=new THREE.Group();C.position.set(0,0,-.6);G.add(C);const tub=new THREE.CylinderGeometry(1,1,1,4,1,true);tub.rotateY(Math.PI/4);tub.scale(.95,.62,1.2);tub.translate(0,1.0,0);
 {const P=tub.attributes.position;for(let i=0;i<P.count;i++){const y=P.getY(i);if(y<1)P.setXYZ(i,P.getX(i)*.8,y,P.getZ(i)*.85)}tub.computeVertexNormals()}const TM=M(0x5a6a5a,{roughness:.6,metalness:.5,map:o.RUSTT,side:THREE.DoubleSide});TM.color.setHex(0xffffff);TM.metalness=.3;TM.roughness=.6;TM.map=k.tex(256,128,(c,w,h)=>{c.fillStyle='#6a7a66';c.fillRect(0,0,w,h);for(let i=0;i<500;i++){c.fillStyle='rgba(40,50,40,'+(o.r()*.2)+')';c.fillRect(o.r()*w,o.r()*h,2+o.r()*6,1+o.r()*3)}
  for(let i=0;i<22;i++){const x=o.r()*w,y=o.r()*h*.4,l=20+o.r()*70;const gr=c.createLinearGradient(0,y,0,y+l);gr.addColorStop(0,'rgba(140,70,30,.55)');gr.addColorStop(1,'rgba(140,70,30,0)');c.fillStyle=gr;c.fillRect(x,y,2+o.r()*5,l)}
  for(let x=8;x<w;x+=16)for(const y of[6,h-6]){c.fillStyle='rgba(30,35,30,.8)';c.beginPath();c.arc(x,y,2.6,0,7);c.fill();c.fillStyle='rgba(200,210,190,.5)';c.beginPath();c.arc(x-.7,y-.7,1,0,7);c.fill()}
});const tm=new THREE.Mesh(tub,TM);C.add(tm);
 const fl=new THREE.Mesh(new THREE.BoxGeometry(1.08,.05,1.38),TM);fl.position.y=.7;C.add(fl);for(const zz of[-.55,0,.55]){const rb=new THREE.Mesh(new THREE.BoxGeometry(1.4,.06,.05),M(0x3a3a36,{metalness:.6,roughness:.5}));rb.position.set(0,1.2,zz*1.25);C.add(rb)}
 {const RM=M(0x3a3a36,{metalness:.6,roughness:.5});for(const sx of[-1,1]){const a=new THREE.Mesh(new THREE.BoxGeometry(.07,.07,1.78),RM);a.position.set(sx*.672,1.31,0);C.add(a);const b=new THREE.Mesh(new THREE.BoxGeometry(1.32,.08,.07),RM);b.position.set(0,1.305,sx*.849);C.add(b)}}
 for(const sx of[-.5,.5])for(const zz of[-.45,.45]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,.08,16),M(0x2a2a28,{metalness:.6,roughness:.5}));w.rotation.z=Math.PI/2;w.position.set(sx,.39,zz);C.add(w)}
 const ax=new THREE.Mesh(new THREE.BoxGeometry(1.0,.12,1.0),M(0x3a3a36,{metalness:.6}));ax.position.y=.52;C.add(ax);
 /* a push bar at the back, couplings at both ends, axle boxes on the wheels */{const IM=M(0x3a3a36,{metalness:.6,roughness:.45});for(const sx of[-.45,.45]){const b=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.42,8),IM);b.rotation.x=Math.PI/2.6;b.position.set(sx,1.25,1.02);C.add(b)}const pb=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,1.0,8),IM);pb.rotation.z=Math.PI/2;pb.position.set(0,1.33,1.2);C.add(pb);
  for(const sz of[-1,1]){const cp=new THREE.Mesh(new THREE.BoxGeometry(.1,.1,.3),IM);cp.position.set(0,.55,sz*.7);C.add(cp);const lk=new THREE.Mesh(new THREE.TorusGeometry(.06,.015,6,12),IM);lk.position.set(0,.55,sz*.88);C.add(lk)}
  for(const sx of[-.56,.56])for(const zz of[-.45,.45]){const hb=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,.06,10),IM);hb.rotation.z=Math.PI/2;hb.position.set(sx,.39,zz);C.add(hb)}}
 /* the ore inside: a heap that rises as you tip ore in */const L=[];for(let i=0;i<40;i++){const a=o.r()*6.28,d=Math.sqrt(o.r());o.rock(L,.08+o.r()*.07,Math.cos(a)*d*.5,0,Math.sin(a)*d*.62,i*3.1,[[.78,.45,.25],[.55,.32,.24],[.86,.86,.88],[.95,.78,.3],[.4,.75,.95]][i%5])}const load=mgMerge(L,o.STONEV);C.add(load);
 const setLoad=k=>{load.visible=k>.02;load.position.y=.72+.52*Math.min(1,k);load.scale.set(.8+.2*k,.5+.5*k,.8+.2*k)};setLoad(.15);
 /* the lamp post and the board */const lp=[];mgBeam(lp,[1.15,0,.6],[1.15,2.3,.6],.14,.14,o.c.tim);mgBeam(lp,[1.15,2.25,.6],[.85,2.25,.6],.08,.08,o.c.tim2);G.add(mgMerge(lp,o.TIMBV));
 const lm=new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,.22,8),M(0xffd890,{emissive:0xffa040,emissiveIntensity:1}));lm.position.set(.85,2.05,.6);G.add(lm);const lc=new THREE.Mesh(new THREE.ConeGeometry(.13,.1,8),M(0x2a2a28,{metalness:.5}));lc.position.set(.85,2.2,.6);G.add(lc);
 /* the board on its own two posts beside the track, readable from both ways */{const sg=dmSign(G,1.0,.58,['ORE CART','BANK YOUR ORE · E'],'#2a3a2a','#e8e0c0',1.25,1.45,-1.0);sg.material[5]=sg.material[4];const bp=[];for(const px of[.82,1.68])mgBeam(bp,[px,0,-1.04],[px,1.2,-1.04],.07,.07,o.c.tim);G.add(mgMerge(bp,o.TIMBV))}
 G.updateMatrixWorld(true);const lw=G.localToWorld(new THREE.Vector3(.85,2.05,.6));return{parts:{cart:C,load},setLoad,lights:[[lw.x,lw.y,lw.z]],obs:[dmObs(G,-.95,1.3,-2.25,.75)]}}
/* a box given in a group's own space, as a world-space obstacle (for groups turned by a multiple of 90°) */
function dmObs(G,x0,x1,z0,z1){G.updateMatrixWorld(true);const a=G.localToWorld(new THREE.Vector3(x0,0,z0)),b=G.localToWorld(new THREE.Vector3(x1,0,z1));return{x0:Math.min(a.x,b.x),x1:Math.max(a.x,b.x),z0:Math.min(a.z,b.z),z1:Math.max(a.z,b.z)}}

function dmAlcove(g,x,z,side){const o=dmKit(),r=o.r,R=[],T=[];const dir=-side;/* the niche opens towards the room */
 for(const sz of[-1,1]){const bz=z+sz*1.15,ge=new THREE.CylinderGeometry(.42,.5,4.0,10,10),P=ge.attributes.position,sd=bz*3.1;/* a buttress: a rough pillar of rock standing 0.9 m out from the wall, floor to roof */
  for(let i=0;i<P.count;i++){const px=P.getX(i),py=P.getY(i),pz=P.getZ(i),a=Math.atan2(pz,px),j=1+.22*Math.sin(a*3+py*2.3+sd)+.16*Math.sin(a*2-py*1.3+sd*2)+.1*Math.sin(py*4.1+a*5)+.08*Math.sin(py*9.3+a*3),q=py<-1.6?1+.35*(-1.6-py):1;P.setXYZ(i,px*j*q*1.15,py,pz*j*q*.8)}ge.translate(x+dir*.45,2.0,bz);ge.computeVertexNormals();mgPut(R,ge,0,0,0,0,o.c.rock2)}
 mgBeam(T,[x+dir*.05,2.35,z-1.45],[x+dir*.05,2.35,z+1.45],.2,.25,o.c.tim2);mgBeam(T,[x+dir*.85,2.35,z-1.45],[x+dir*.85,2.35,z+1.45],.2,.25,o.c.tim);for(const zz of[z-.9,z,z+.9])mgBeam(T,[x,2.5,zz],[x+dir*.9,2.5,zz],.12,.08,o.c.tim2);
 g.add(mgMerge(T,o.TIMBV));for(let i=0;i<4;i++)o.rock(R,.08+r()*.08,x+dir*(.15+r()*.5),-.02,z+(r()-.5)*1.0,i*9.3+z,o.c.rock2);g.add(mgMerge(R,o.STONEV));
 return{obs:[{x0:Math.min(x,x+dir*.95),x1:Math.max(x,x+dir*.95),z0:z-1.6,z1:z-.75},{x0:Math.min(x,x+dir*.95),x1:Math.max(x,x+dir*.95),z0:z+.75,z1:z+1.6}],spot:[x+dir*.45,z]}}

function dmOil(){const o=dmKit(),M=o.M,G=new THREE.Group();const body=new THREE.Mesh(new THREE.BoxGeometry(.2,.26,.12),M(0x2a6a3a,{roughness:.5,metalness:.4}));body.position.y=.13;G.add(body);
 const lb=new THREE.Mesh(new THREE.PlaneGeometry(.17,.13),M(0xffffff,{map:rtKit().tex(128,96,(c,w,h)=>{c.fillStyle='#e8d8a0';c.fillRect(0,0,w,h);c.fillStyle='#8a2010';c.fillRect(0,0,w,18);c.fillStyle='#fff';c.font='700 14px '+dmF();c.textAlign='center';c.fillText('LAMP OIL',w/2,14);c.fillStyle='#2a1a0a';c.font='600 40px '+dmF();c.fillText('🛢',w/2,70)}),roughness:.7}));lb.position.set(0,.13,.064);G.add(lb);
 const sp=new THREE.Mesh(new THREE.CylinderGeometry(.018,.025,.1,8),M(0x8a8a80,{metalness:.7}));sp.position.set(.05,.3,0);sp.rotation.z=-.4;G.add(sp);const cp=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.03,10),M(0x8a2010,{roughness:.5}));cp.position.set(-.05,.275,0);G.add(cp);
 const hd=new THREE.Mesh(new THREE.TorusGeometry(.05,.009,5,12,Math.PI),M(0x4a4a44,{metalness:.6}));hd.position.set(0,.26,0);G.add(hd);return G}

function dmGas(g,x,z,HX,L){const k=rtKit(),o=dmKit(),M=o.M,r=o.r;const side=x<0?-1:1,fx=side*(HX-.5);
 /* the fissure: a dark crack in the floor by the wall, a crust of yellow sulphur round it */{const cr=new THREE.Mesh(new THREE.PlaneGeometry(.35,1.6),M(0x0a0806,{roughness:1,polygonOffset:true,polygonOffsetUnits:-3}));cr.rotation.x=-Math.PI/2;cr.rotation.z=.3;cr.position.set(fx,.012,z);g.add(cr);
  const CR=[];for(let i=0;i<22;i++){const a=r()*6.28,d=.25+r()*.6;o.rock(CR,.04+r()*.06,fx+Math.cos(a)*d*.6,-.02,z+Math.sin(a)*d*1.1,i*2.9,r()<.6?[.88,.8,.3]:[.7,.66,.3],.5)}g.add(mgMerge(CR,o.STONEV))}
 /* the board: GAS! in chalk, on a stake */const bd=dmSign(g,.7,.5,['GAS!','DON\'T STOP'],'#2a2a26','#e8e8d8',fx-side*.35,1.3,z+1.5,side<0?Math.PI/2:-Math.PI/2);{const st=[];mgBeam(st,[fx-side*.35,0,z+1.5],[fx-side*.35,1.05,z+1.5],.08,.08,o.c.tim);g.add(mgMerge(st,o.TIMBV))}
 /* the haze: soft green puffs low down, spreading from the fissure through the room */const c=document.createElement('canvas');c.width=c.height=128;{const x2=c.getContext('2d'),gr=x2.createRadialGradient(64,64,4,64,64,62);gr.addColorStop(0,'rgba(170,200,90,.55)');gr.addColorStop(.6,'rgba(150,180,80,.22)');gr.addColorStop(1,'rgba(140,170,70,0)');x2.fillStyle=gr;x2.fillRect(0,0,128,128)}const T=new THREE.CanvasTexture(c);
 const puffs=[];for(let i=0;i<36;i++){const sm=new THREE.SpriteMaterial({map:T,transparent:true,depthWrite:false,opacity:0});sm.userData.gd=1;const s=new THREE.Sprite(sm);const px=(r()*2-1)*(HX-.6),pz=z+(r()*2-1)*Math.min(L/2,7),d=Math.hypot(px-fx,pz-z);s.userData={px,pz,d,y:.4+r()*1.1,ph:r()*6.28,sz:1.6+r()*1.6};s.position.set(px,s.userData.y,pz);g.add(s);puffs.push(s)}
 let fill=0;const setFill=k=>{fill=k};const tick=t=>{const reach=1+fill*10;puffs.forEach(s=>{const u=s.userData,a=Math.max(0,Math.min(1,(reach-u.d)/2));s.material.opacity=.55*a;s.position.set(u.px+.25*Math.sin(t*.3+u.ph),u.y+.12*Math.sin(t*.5+u.ph*2),u.pz+.25*Math.cos(t*.27+u.ph));s.scale.setScalar(u.sz*(.8+.2*Math.sin(t*.4+u.ph)))})};tick(0);
 return{parts:{puffs},setFill,tick,vent:[fx,z]}}

function dmRockfall(g,x,z){const o=dmKit(),M=o.M,r=o.r,HY=4;
 /* the loose roof: cracks drawn on a patch, a few slabs hanging a little low, stones about to drop */const cp=new THREE.Mesh(new THREE.CircleGeometry(1.3,18),M(0xffffff,{map:rtKit().tex(128,128,(c,w,h)=>{c.clearRect(0,0,w,h);c.strokeStyle='rgba(20,12,6,.85)';c.lineWidth=3;for(let i=0;i<9;i++){c.beginPath();let px=64,py=64;c.moveTo(px,py);const a=i*.7+r();for(let j=0;j<5;j++){px+=Math.cos(a+(r()-.5))*12;py+=Math.sin(a+(r()-.5))*12;c.lineTo(px,py)}c.stroke()}}),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetUnits:-3}));cp.rotation.x=Math.PI/2;cp.position.set(x,HY-.01,z);g.add(cp);
 const stones=[];for(let i=0;i<9;i++){const L=[];const rad=.14+r()*.16;o.rock(L,rad,0,0,0,i*4.7+x,[o.c.rock,o.c.rock2,o.c.rock3][i%3],.8);const m=mgMerge(L,o.STONEV);const a=r()*6.28,d=Math.sqrt(r())*.9;m.userData={sx:x+Math.cos(a)*d,sz:z+Math.sin(a)*d,sy:HY-rad*.7,rad,ex:x+Math.cos(a)*d*1.5,ez:z+Math.sin(a)*d*1.5,spin:(r()-.5)*6};m.position.set(m.userData.sx,m.userData.sy,m.userData.sz);m.rotation.x=Math.PI;g.add(m);stones.push(m)}
 const SL=[];for(let i=0;i<4;i++){const s=new THREE.DodecahedronGeometry(.45+r()*.2,0);s.scale(1,.22,.8);s.rotateZ((r()-.5)*.2);s.rotateY(r()*3);s.translate(x+(r()-.5)*1.4,HY-.07,z+(r()-.5)*1.4);mgPut(SL,s,0,0,0,0,o.c.rock2)}g.add(mgMerge(SL,o.STONEV));
 /* the dust: a trickle from the crack (falling particles) */const c=document.createElement('canvas');c.width=c.height=32;{const x2=c.getContext('2d'),gr=x2.createRadialGradient(16,16,1,16,16,15);gr.addColorStop(0,'rgba(200,170,130,.8)');gr.addColorStop(1,'rgba(200,170,130,0)');x2.fillStyle=gr;x2.fillRect(0,0,32,32)}const DT=new THREE.CanvasTexture(c);const dust=[];for(let i=0;i<24;i++){const sm=new THREE.SpriteMaterial({map:DT,transparent:true,depthWrite:false,opacity:0});sm.userData.gd=1;const s=new THREE.Sprite(sm);s.userData={ph:r(),ox:(r()-.5)*.6,oz:(r()-.5)*.6};s.scale.setScalar(.25);g.add(s);dust.push(s)}
 /* the heap left behind */const HP=[];dmPile({x0:-1.2,x1:1.2,z0:-1.2,z1:1.2,n:240,keep:26,zb:1,top:(px,pz)=>.7*Math.max(0,1-Math.hypot(px,pz)/1.2)+.05,rad:()=>.12+r()*.16,put:(rad,px,py,pz,i)=>o.rock(HP,rad,x+px,py,z+pz,i*3.3+z,[o.c.rock,o.c.rock2,o.c.rock3][i%3])});const heap=mgMerge(HP,o.STONEV);heap.visible=false;g.add(heap);
 let dOn=false,t0=0;const warn=on=>{dOn=on};const fall=k=>{stones.forEach((s,i)=>{const u=s.userData,f=Math.min(1,Math.max(0,k*1.3-i*.03));const y=u.sy-(u.sy)*f*f;s.position.set(u.sx+(u.ex-u.sx)*f,Math.max(u.rad*.3,y),u.sz+(u.ez-u.sz)*f);s.rotation.z=u.spin*f;s.visible=k<1});heap.visible=k>=1};
 const tick=t=>{dust.forEach(s=>{const u=s.userData,p=(t*.8+u.ph)%1;s.position.set(x+u.ox,HY-.1-p*3.6,z+u.oz);s.material.opacity=dOn?.5*(1-p):0})};
 return{warn,fall,tick,parts:{stones,heap},obs:[{x0:x-.8,x1:x+.8,z0:z-.8,z1:z+.8}]}}
