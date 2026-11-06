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
 const n=lines.length;lines.forEach((s,i)=>{t.font=(i?'600 ':'800 ')+(i?150/n*.7:150/n)+'px '+dmF();t.fillText(s,c.width/2,256*(i+.72)/n,c.width-90)});const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,.03),[o.TIMB,o.TIMB,o.TIMB,o.TIMB,o.M(0xffffff,{map:new THREE.CanvasTexture(c),roughness:.8}),o.TIMB]);m.position.set(x,y,z);m.rotation.y=ry||0;g.add(m);return m}

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

/* ---------- Part 1, batch 3: the mine creatures (spec part 1, D) ----------
     dmRunCart(n)       the Runaway Cart (n 1) or the Runaway Train (n 3): ore carts heaped with glowing red ore, the front
                        one with a big headlamp (a light cone) and two little red lamps, iron chains between them.
                        Faces -z (its front). tick(t, speed) spins the wheels, throws sparks and rattles it.
                        light: [x,y,z] in its own space for the headlamp's point light. length: from front to back.
     dmBats(n)          a swarm of n bats (a group at the swarm's centre). tick(t, spread, k): k 0 roosting in a tight knot,
                        1 out and swirling over the spread (m).
     dmBurrower()       the Burrower: the dam's dark glossy worm, bigger: 14 ringed segments, a round mouth with three rows
                        of teeth and a red glow inside. tick(dt, head, dir, open) moves the head to a point and the body
                        follows (each segment trails the one before it). hole(g, x, y, z, ry): the broken hole it leaves in a wall.
     dmSandGlass()      the curse's sand timer: a carved wooden frame, two glass bulbs, the sand running. setK(k) (0 full
                        top → 1 run out); tick(t) turns it slowly and streams the sand.
     dmMummyHand()      a bandaged hand and forearm coming up out of a patch of loose sand. setRise(k) (0 hidden → 1 up to the
                        elbow), setGrab(k) (0 open → 1 closed).
   ===================================================================================================== */
function dmSprite(col,soft){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),gr=x.createRadialGradient(32,32,1,32,32,31);gr.addColorStop(0,col);gr.addColorStop(soft||.35,col.replace(/[\d.]+\)$/,'.35)'));gr.addColorStop(1,col.replace(/[\d.]+\)$/,'0)'));x.fillStyle=gr;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c)}
function dmRunCart(n){const k=rtKit(),o=dmKit(),M=o.M,G=new THREE.Group();n=n||1;const wheels=[],sparks=[],carts=[];const SP=dmSprite('rgba(255,210,120,1)',.2);
 const steel=M(0x5a6a58,{roughness:.6,metalness:.35}),dark=M(0x2a2a28,{metalness:.6,roughness:.45}),ore=M(0x6a2018,{roughness:.6,emissive:0xc02810,emissiveIntensity:.8});
 for(let c=0;c<n;c++){const C=new THREE.Group();C.position.z=c*1.95;G.add(C);carts.push(C);
  const tub=new THREE.CylinderGeometry(1,1,1,4,1,true);tub.rotateY(Math.PI/4);tub.scale(.95,.62,1.2);tub.translate(0,1.0,0);{const P=tub.attributes.position;for(let i=0;i<P.count;i++){const y=P.getY(i);if(y<1)P.setXYZ(i,P.getX(i)*.8,y,P.getZ(i)*.85)}tub.computeVertexNormals()}const tm=new THREE.Mesh(tub,M(0x5a6a58,{roughness:.6,metalness:.35,side:THREE.DoubleSide}));C.add(tm);
  for(const sx of[-1,1]){const a=new THREE.Mesh(new THREE.BoxGeometry(.07,.08,1.78),dark);a.position.set(sx*.672,1.31,0);C.add(a);const b=new THREE.Mesh(new THREE.BoxGeometry(1.32,.08,.07),dark);b.position.set(0,1.305,sx*.849);C.add(b)}
  const fl=new THREE.Mesh(new THREE.BoxGeometry(1.08,.05,1.38),steel);fl.position.y=.7;C.add(fl);const ax=new THREE.Mesh(new THREE.BoxGeometry(1.0,.12,1.0),dark);ax.position.y=.52;C.add(ax);
  /* the load: heaped high with ore that glows red in the cracks */const L=[];for(let i=0;i<30;i++){const a=o.r()*6.28,d=Math.sqrt(o.r());o.rock(L,.12+o.r()*.1,Math.cos(a)*d*.5,(1-d)*.35,Math.sin(a)*d*.62,i*3.9+c,[.35,.3,.28])}const ld=mgMerge(L,o.STONEV);ld.position.y=1.15;C.add(ld);
  const glow=new THREE.Mesh(new THREE.SphereGeometry(.55,14,8,0,Math.PI*2,0,Math.PI/2),ore);glow.scale.set(1,.45,1.2);glow.position.y=1.12;C.add(glow);
  for(const sx of[-.5,.5])for(const zz of[-.45,.45]){const w=new THREE.Group();w.position.set(sx,.39,zz);C.add(w);const wm=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,.08,14),dark);wm.rotation.z=Math.PI/2;w.add(wm);for(let s=0;s<3;s++){const sp=new THREE.Mesh(new THREE.BoxGeometry(.03,.36,.04),M(0x4a4a46,{metalness:.6}));sp.rotation.x=s*Math.PI/3;w.add(sp)}wheels.push(w);
   const sk=new THREE.Sprite(new THREE.SpriteMaterial({map:SP,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));sk.material.userData.gd=1;sk.position.set(sx,.2,zz);sk.scale.setScalar(.4);C.add(sk);sparks.push(sk)}
  if(c>0){/* the chain to the cart in front */for(let l=0;l<4;l++){const lk=new THREE.Mesh(new THREE.TorusGeometry(.06,.015,5,10),dark);lk.position.set(0,.55,-.85-l*.07);lk.rotation.y=l%2?Math.PI/2:0;C.add(lk)}}}
 /* the front: a big headlamp and two little red lamps */const F=carts[0];{const hl=new THREE.Mesh(new THREE.CylinderGeometry(.2,.24,.28,14),dark);hl.rotation.x=Math.PI/2;hl.position.set(0,1.42,-.95);F.add(hl);const ln=new THREE.Mesh(new THREE.CircleGeometry(.19,16),M(0xfff4c0,{emissive:0xffe090,emissiveIntensity:2}));ln.position.set(0,1.42,-1.1);ln.rotation.y=Math.PI;F.add(ln);
  const cone=new THREE.Mesh(new THREE.ConeGeometry(1.6,6,20,1,true),M(0xffe8a0,{transparent:true,opacity:.16,depthWrite:false,side:THREE.DoubleSide,emissive:0xffe8a0,emissiveIntensity:1,alphaMap:k.tex(8,64,(c,w,h)=>{const gr=c.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#fff');gr.addColorStop(.55,'#555');gr.addColorStop(1,'#000');c.fillStyle=gr;c.fillRect(0,0,w,h)})}));/* bright at the lamp, fading out ahead */cone.rotation.x=Math.PI/2;/* narrow at the lamp, wide ahead */cone.position.set(0,1.3,-4.1);F.add(cone);
  for(const sx of[-.42,.42]){const rl=new THREE.Mesh(new THREE.SphereGeometry(.06,10,8),M(0xff2010,{emissive:0xff1000,emissiveIntensity:2}));rl.position.set(sx,1.2,-.9);F.add(rl)}}
 const tick=(t,sp)=>{sp=sp==null?1:sp;wheels.forEach(w=>w.rotation.x-=sp*.35);sparks.forEach((s,i)=>{s.material.opacity=sp>.2&&Math.sin(t*37+i*2.3)>.3?.9:0;s.scale.setScalar(.25+.3*Math.abs(Math.sin(t*23+i)))});carts.forEach((C,i)=>{C.rotation.z=sp*.03*Math.sin(t*19+i);C.position.y=sp*.02*Math.abs(Math.sin(t*27+i*1.7))})};
 return{group:G,tick,light:[0,1.42,-1.3],length:(n-1)*1.95+1.8}}

function dmBats(n){const o=dmKit(),M=o.M,G=new THREE.Group(),B=[];const BM=M(0x1e1a1c,{roughness:.8,side:THREE.DoubleSide});
 const wing=s=>{const sh=new THREE.Shape();sh.moveTo(0,0);sh.lineTo(.09,.06);sh.lineTo(.2,.04);sh.lineTo(.17,-.01);sh.lineTo(.13,.01);sh.lineTo(.1,-.03);sh.lineTo(.06,0);sh.lineTo(.03,-.03);sh.lineTo(0,0);const ge=new THREE.ShapeGeometry(sh);ge.rotateX(-Math.PI/2);if(s<0)ge.scale(-1,1,1);return ge};const WL=wing(-1),WR=wing(1);
 for(let i=0;i<n;i++){const b=new THREE.Group();const bd=new THREE.Mesh(new THREE.SphereGeometry(.035,8,6),BM);bd.scale.set(1,.9,1.6);b.add(bd);for(const sx of[-1,1]){const e=new THREE.Mesh(new THREE.ConeGeometry(.012,.03,4),BM);e.position.set(sx*.015,.03,-.04);b.add(e)}
  const l=new THREE.Mesh(WL,BM),r=new THREE.Mesh(WR,BM);l.position.x=-.02;r.position.x=.02;b.add(l,r);const ey=new THREE.Mesh(new THREE.SphereGeometry(.007,6,4),M(0xff3020,{emissive:0xff2000,emissiveIntensity:1.5}));ey.position.set(0,.012,-.055);b.add(ey);
  b.userData={l,r,ph:o.r()*6.28,rad:.4+o.r(),h:(o.r()-.5),sp:1.5+o.r()*1.5,dir:o.r()<.5?1:-1};G.add(b);B.push(b)}
 const tick=(t,spread,k)=>{spread=spread||3;k=k==null?1:k;B.forEach(b=>{const u=b.userData,a=u.ph+t*u.sp*u.dir;const R=(.15+u.rad*spread*.5)*k+.08*(1-k);const x=Math.cos(a)*R,z=Math.sin(a)*R,y=u.h*spread*.35*k+Math.sin(t*3+u.ph)*.25*k;b.position.set(x,y,z);
  b.rotation.set(0,-a*u.dir+(u.dir>0?0:Math.PI),Math.sin(t*5+u.ph)*.3*k);const f=k>.05?Math.sin(t*28+u.ph*5)*.9:1.3;u.l.rotation.z=f;u.r.rotation.z=-f})};tick(0,3,1);return{group:G,tick}}

function dmBurrower(){const o=dmKit(),M=o.M,G=new THREE.Group(),N=14,SEG=.62;const skin=M(0x3a2a26,{roughness:.35,metalness:.3,emissive:0x2a0000,emissiveIntensity:.35,map:o.STONET}),ring=M(0x24161a,{roughness:.45,metalness:.3}),tooth=M(0xf0e6cc,{roughness:.35,emissive:0x302010,emissiveIntensity:.3}),maw=M(0x200000,{emissive:0xff2010,emissiveIntensity:1.2,side:THREE.BackSide});
 const segs=[];for(let i=0;i<N;i++){const r=(i==0?1.0:.85)*(1-Math.pow(i/N,1.4)*.6),s=new THREE.Group();let b;if(i==0){/* the head: a bulb that is open at the front, round the mouth */const pr=[[.66,-.95],[.86,-.62],[.98,-.15],[.96,.3],[.78,.75],[.42,1.05],[0,1.15]].map(([x2,y2])=>new THREE.Vector2(x2*r,y2*r));const lg=new THREE.LatheGeometry(pr,20);lg.rotateX(Math.PI/2);const hs=skin.clone();hs.side=THREE.DoubleSide;hs.userData.gd=1;b=new THREE.Mesh(lg,hs)}else{b=new THREE.Mesh(new THREE.SphereGeometry(r,16,12),skin);b.scale.set(1,1,1.25)}s.add(b);const rg=new THREE.Mesh(new THREE.TorusGeometry(r*.96,r*.07,8,22),ring);rg.position.z=r*.35;s.add(rg);
  if(i>1)for(let sp=0;sp<5;sp++){const a=sp/5*6.28+i;const k2=new THREE.Mesh(new THREE.ConeGeometry(.05,.18,6),ring);k2.position.set(Math.cos(a)*r*.95,Math.sin(a)*r*.95,0);k2.rotation.z=a-Math.PI/2;s.add(k2)}G.add(s);segs.push(s)}
 /* the head: a round mouth with three rings of teeth and the red glow inside */const H=segs[0];{const lip=new THREE.Mesh(new THREE.TorusGeometry(.66,.09,10,28),skin);lip.position.z=-.92;H.add(lip);const thr=new THREE.Mesh(new THREE.CylinderGeometry(.62,.25,1.1,20,1,true),maw);thr.rotation.x=Math.PI/2;thr.position.z=-.45;H.add(thr);
  const teeth=[];for(let rw=0;rw<3;rw++){const n2=16-rw*4,rr=.6-rw*.13;for(let i=0;i<n2;i++){const a=i/n2*6.28+rw*.3,t2=new THREE.Mesh(new THREE.ConeGeometry(.07-rw*.012,.34-rw*.06,5),tooth);t2.position.set(Math.cos(a)*rr,Math.sin(a)*rr,-.88+rw*.2);t2.rotation.order='ZXY';t2.rotation.z=a+Math.PI/2;t2.rotation.x=-.35;H.add(t2);teeth.push(t2)}}H.userData.teeth=teeth}
 const gl=new THREE.PointLight(0xff3010,1.2,4,2);gl.position.z=-.3;H.add(gl);
 let init=false;const tick=(dt,head,dir,open)=>{const d=new THREE.Vector3(...dir).normalize();if(!init){segs.forEach((s,i)=>s.position.set(head[0]-d.x*i*SEG,head[1]-d.y*i*SEG,head[2]-d.z*i*SEG));init=true}
  H.position.set(...head);H.lookAt(head[0]-d.x,head[1]-d.y,head[2]-d.z);for(let i=1;i<N;i++){const a=segs[i-1].position,b=segs[i].position,v=b.clone().sub(a);const l=v.length()||1;b.copy(a).add(v.multiplyScalar(SEG/l));segs[i].lookAt(a.x*2-b.x,a.y*2-b.y,a.z*2-b.z);segs[i].lookAt(a)}
  const op=open==null?1:open;H.userData.teeth.forEach((t2,i)=>t2.rotation.x=-.2-.45*op)};
 const reset=()=>{init=false};return{group:G,tick,reset,segs}}
/* the Burrower's hole: 2.6 m across (radius 1.3 with its rim), centred on a wall. Keep it BETWEEN timber sets: the
   middle of a bay, so nothing stands within 1.4 m of its centre along the wall (sets 3.2 m apart leave just room),
   and no lamp, pipe or sign on the wall within 1.4 m either.
   x,y,z: the centre on the wall face; ry turns it so its front (+z) faces into the tunnel. */
function dmBurrowHole(g,x,y,z,ry){const k=rtKit(),o=dmKit(),G=new THREE.Group();G.position.set(x,y,z);G.rotation.y=ry||0;g.add(G);
 /* the dark mouth: black in the middle fading to dark earth at the edge, so it reads as deep */
 const dt=k.tex(128,128,(c,w,h)=>{const gr=c.createRadialGradient(w/2,h/2,4,w/2,h/2,w/2);gr.addColorStop(0,'#000');gr.addColorStop(.55,'#070403');gr.addColorStop(.85,'#1e130b');gr.addColorStop(1,'#3a2716');c.fillStyle=gr;c.fillRect(0,0,w,h)});
 const dk=new THREE.Mesh(new THREE.CircleGeometry(.95,28),o.M(0xffffff,{roughness:1,map:dt,polygonOffset:true,polygonOffsetUnits:-4}));dk.position.z=.012;G.add(dk);
 /* the broken lip: a jagged ring of torn earth bulging out of the wall */
 const N=36,pos=[],col=[],idx=[];for(let i=0;i<=N;i++){const a=i/N*6.283,ri=.93,ro=1.12+.14*Math.sin(a*5+1.3)*Math.sin(a*3)+.06*Math.sin(a*11),zo=.1+.05*Math.sin(a*7);
  pos.push(Math.cos(a)*ri,Math.sin(a)*ri,.02, Math.cos(a)*(ri+ro)/2,Math.sin(a)*(ri+ro)/2,zo, Math.cos(a)*ro,Math.sin(a)*ro,0);col.push(.32,.22,.14,.55,.42,.3,.62,.5,.36)}
 for(let i=0;i<N;i++){const a=i*3,b=(i+1)*3;for(let r=0;r<2;r++)idx.push(a+r,a+r+1,b+r,a+r+1,b+r+1,b+r)}
 const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));lg.setAttribute('color',new THREE.Float32BufferAttribute(col,3));lg.setIndex(idx);lg.computeVertexNormals();
 const lip=new THREE.Mesh(lg,o.M(0xffffff,{roughness:1,vertexColors:true,map:o.DIRTT}));G.add(lip);
 /* chunks of rock torn loose, half sunk into the wall round the lip (round, not flat) */
 const R=[];for(let i=0;i<13;i++){const a=i/13*6.283+o.r()*.25,rr=1.02+o.r()*.14;o.rock(R,.1+o.r()*.09,Math.cos(a)*rr,Math.sin(a)*rr,.02,i*7.3+x,[o.c.rock2,o.c.rock3][i%2])}G.add(mgMerge(R,o.STONEV));
 /* rubble spilled on the floor in front of it */
 const F=[];for(let i=0;i<12;i++)o.rock(F,.08+o.r()*.12,(o.r()-.5)*2.2,-y-.02+.04,.3+o.r()*1.2,i*4.1+z,o.c.rock2);G.add(mgMerge(F,o.STONEV));
 G.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return G}

function dmSandGlass(){const k=rtKit(),o=dmKit(),M=o.M,G=new THREE.Group();const W=M(0x6a4a2a,{roughness:.7,map:o.PLANKT}),Gl=M(0xd8e8f0,{roughness:.05,metalness:.1,transparent:true,opacity:.28,depthWrite:false}),Sd=M(0xe0c070,{roughness:.9,emissive:0x5a3a10,emissiveIntensity:.4});
 for(const y of[-.62,.62]){const p=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,.1,6),W);p.position.y=y;G.add(p);const c2=new THREE.Mesh(new THREE.TorusGeometry(.36,.035,6,6),M(0xc8a040,{metalness:.8,roughness:.3}));c2.rotation.x=Math.PI/2;c2.position.y=y*.92;G.add(c2)}
 for(let i=0;i<3;i++){const a=i/3*6.28,p=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,1.24,8),W);p.position.set(Math.cos(a)*.34,0,Math.sin(a)*.34);G.add(p);for(const y of[-.3,0,.3]){const b=new THREE.Mesh(new THREE.SphereGeometry(.05,8,6),W);b.position.set(Math.cos(a)*.34,y,Math.sin(a)*.34);G.add(b)}}
 const prof=[];for(let i=0;i<=20;i++){const t=i/20,y=-.57+t*1.14,rr=.04+.24*Math.pow(Math.abs(Math.sin(Math.PI*t)),.7);prof.push(new THREE.Vector2(rr,y))}const glass=new THREE.Mesh(new THREE.LatheGeometry(prof,20),Gl);G.add(glass);
 const top=new THREE.Mesh(new THREE.ConeGeometry(.22,.4,18),Sd);top.rotation.x=Math.PI;G.add(top);const bot=new THREE.Mesh(new THREE.ConeGeometry(.24,.3,18),Sd);G.add(bot);const st=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,.55,6),Sd);G.add(st);
 const gw=new THREE.Sprite(new THREE.SpriteMaterial({map:dmSprite('rgba(255,210,120,.6)',.3),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));gw.material.userData.gd=1;gw.scale.setScalar(2.2);G.add(gw);
 const setK=kk=>{const a=1-kk;top.scale.set(Math.max(.05,Math.sqrt(a)),Math.max(.02,a),Math.max(.05,Math.sqrt(a)));top.position.y=.06+.2*a;bot.scale.set(Math.max(.05,Math.sqrt(kk)),Math.max(.02,kk),Math.max(.05,Math.sqrt(kk)));bot.position.y=-.56+.15*kk;st.visible=kk<.99&&kk>.0;st.position.y=-.25+.1*a};setK(.3);
 const tick=t=>{G.rotation.y=t*.4;st.scale.x=1+.3*Math.sin(t*30)};return{group:G,setK,tick}}

function dmMummyHand(){const k=rtKit(),o=dmKit(),M=o.M,G=new THREE.Group();const BT=M(0xffffff,{roughness:.95,map:k.tex(64,128,(c,w,h)=>{c.fillStyle='#c8b894';c.fillRect(0,0,w,h);for(let y=0;y<h;y+=7){c.fillStyle='rgba(90,70,40,'+(.25+o.r()*.2)+')';c.save();c.translate(0,y);c.rotate(-.18);c.fillRect(-10,0,w+20,1.5);c.restore()}for(let i=0;i<120;i++){c.fillStyle='rgba(70,50,30,.25)';c.fillRect(o.r()*w,o.r()*h,2,2)}})});
 const arm=new THREE.Group();G.add(arm);const fa=new THREE.Mesh(new THREE.CylinderGeometry(.075,.065,.62,10),BT);fa.position.y=.31;arm.add(fa);const wr=new THREE.Mesh(new THREE.SphereGeometry(.068,10,8),BT);wr.position.y=.62;arm.add(wr);const palm=new THREE.Mesh(new THREE.BoxGeometry(.15,.17,.07),BT);palm.position.y=.7;arm.add(palm);
 const fingers=[];for(let i=0;i<4;i++){const f=new THREE.Group();f.position.set(-.055+i*.037,.78,0);arm.add(f);const p1=new THREE.Mesh(new THREE.CylinderGeometry(.019,.021,.1,6),BT);p1.position.y=.045;f.add(p1);const j=new THREE.Group();j.position.y=.09;f.add(j);const p2=new THREE.Mesh(new THREE.CylinderGeometry(.015,.019,.09,6),BT);p2.position.y=.04;j.add(p2);f.userData.j=j;fingers.push(f)}
 const th=new THREE.Group();th.position.set(.08,.67,0);th.rotation.z=-.7;arm.add(th);const tp=new THREE.Mesh(new THREE.CylinderGeometry(.018,.02,.1,6),BT);tp.position.y=.05;th.add(tp);
 /* a trailing loose bandage, and the patch of churned sand it comes out of */const lb=new THREE.Mesh(new THREE.PlaneGeometry(.05,.35),M(0xc8b894,{roughness:.95,side:THREE.DoubleSide}));lb.position.set(.07,.2,.03);lb.rotation.z=.4;arm.add(lb);
 const sp=new THREE.Mesh(new THREE.CircleGeometry(.45,16),M(0xb89a6a,{roughness:1,map:o.DIRTT,polygonOffset:true,polygonOffsetUnits:-3}));sp.rotation.x=-Math.PI/2;sp.position.y=.012;G.add(sp);const S2=[];for(let i=0;i<8;i++){const a=i/8*6.28;o.rock(S2,.05+o.r()*.04,Math.cos(a)*.22,-.02,Math.sin(a)*.22,i*2.2,[.72,.6,.42],.6)}G.add(mgMerge(S2,o.STONEV));
 arm.scale.setScalar(1.3);const setRise=kk=>{arm.position.y=-1.25+1.25*kk;arm.visible=kk>.01};const setGrab=kk=>{fingers.forEach((f,i)=>{f.rotation.x=kk*.9;f.userData.j.rotation.x=kk*1.2});th.rotation.x=kk*.8};setRise(1);setGrab(0);
 return{group:G,setRise,setGrab}}

/* =====================================================================================================
   Part 2, batch 1: the five levels' looks and the cage stations (spec part 2).
   Room space here is the game's room box: x across (±HX), the floor at y 0, the entry wall at z = 0 and the exit wall
   at z = -Z (Z = the box's full length, the game's L + 2; put the group at the room's entry wall). Doors are 1.6 m wide
   and 3 m high, centred at x = dIn (entry) and dOut (exit).
     DMLV[lv]                   the five levels: name, depth, rock and floor colours, how rough/wet, light.
     dmRockTex(lv), dmFloorTex(lv), dmFloorMat(lv)   each level's rock and floor pictures; the floor material goes on
                                the game's floor box .
     dmShell(g, o)              the rough rock shell over a room box: lumpy walls, a vaulted roof (the top corners of the
                                box are rounded off above HY - 0.6) and both end walls with their door holes (dIn/dOut 'solid' = no door, null = open end). It only
                                goes outwards from the box, so the box stays the collision. o: {HX, HY, Z, lv, dIn, dOut,
                                seed, holes:[{x0,x1,z0,z1}] (gaps in the roof)}. Returns {mesh, at(z, s) (a point on the
                                rock: s 0 = left foot, 0.5 = top of the roof, 1 = right foot), prof}.
     dmDress(g, sh, o)          the level's dressing for one room: 1 plank lagging over the timber sets and behind the
                                posts (o.sets: the z of the game's sets); 2 crystal clusters, glowing; 3 puddles, a pipe
                                along the wall, ankle-deep water when o.wet; 4 glowing cracks placed per room (from
                                the floor up the walls, two over the roof), magma seeps, basalt columns, steam vents; 5 glowing fungus, bones and fallen carved stones (o.noProps leaves out the barrel, tools,
                                basalt columns, steam vents, bones and carved block, for the working rooms). Returns {tick(t), glow (spots
                                for pool lights), obs}.
     dmStation(g, o)            a station hall's things: the level board, bell, signal board, bench, lamps. The hall is
                                a room box (HX 5, HY 5, Z 16) with dmShell over it.
     dmCage(g, o)               the cage at the far end of the hall, a through car like the hotel's lift: put the group
                                at (dOut, 0, -Z). It builds the front wall at z +2.75 (the opening 1.5 x 2.7 m), the
                                landing gate, the car (x ±1.1, z 0.2..2.4), the back gate in the exit door hole, and
                                the shaft walls that slide past while riding. parts: gate('f'|'b', k) (0 shut → 1
                                open), signal('stop'|'go'), tick(dt, speed) (speed 0..1: slides the rock and the shaft
                                lamps past, shakes the car), short(on) (the 'CABLE SHORT' board at station 80).
     dmManway(g, x, z)          a manway: a timber collar round a 1.2 m hole in the floor, a hand rail, a ladder down a
                                lined shaft 10 m deep (station 80; the game cuts the floor there).
     dmManwayFoot(g,x,z,HY,lv,HX) the bottom of that ladder: a lined raise going up through the roof (pass its hole to
                                dmShell's holes) and the ladder down to the floor (room 81's entrance).
   ===================================================================================================== */
const DMLV={
 1:{name:'OLD WORKINGS',m:48,rock:0xb89a78,floor:0x9a7a58,rough:1,metal:0,vault:1.15,amp:.3,fog:0x120c08},
 2:{name:'CRYSTAL CAVES',m:120,rock:0x8a96a6,floor:0x8a8a88,rough:.85,metal:.05,vault:1.7,amp:.42,fog:0x080a12},
 3:{name:'THE FLOODED LEVEL',m:180,rock:0x6a6660,floor:0x4a4238,rough:.38,metal:.12,vault:1.2,amp:.3,fog:0x070a0a},
 4:{name:'THE HOT ROCKS',m:240,rock:0x5a5654,floor:0x3a3634,rough:.8,metal:.05,vault:1.4,amp:.36,fog:0x120604},
 5:{name:'THE DEEP',m:300,rock:0x6a625a,floor:0x4a4440,rough:.95,metal:0,vault:2.2,amp:.5,fog:0x030303}};
function dmHash(i,j,k){let h=Math.imul(i,374761393)^Math.imul(j,668265263)^Math.imul(k,1274126177);h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296}
function dmVN(x,y,z){const i=Math.floor(x),j=Math.floor(y),k=Math.floor(z),fx=x-i,fy=y-j,fz=z-k,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy),w=fz*fz*(3-2*fz),H=dmHash,L=(a,b,t)=>a+(b-a)*t;
 return L(L(L(H(i,j,k),H(i+1,j,k),u),L(H(i,j+1,k),H(i+1,j+1,k),u),v),L(L(H(i,j,k+1),H(i+1,j,k+1),u),L(H(i,j+1,k+1),H(i+1,j+1,k+1),u),v),w)}
function dmNoise(x,y,z){return .62*dmVN(x*.75,y*.75,z*.75)+.38*dmVN(x*2.2+17.3,y*2.2+5.1,z*2.2+9.7)}
function dmRockTex(lv){const K=dmKit();if(K['rt'+lv])return K['rt'+lv];let sd=lv*977+3;const r=()=>((sd=Math.imul(sd^sd>>>15,sd|1)+0x6d2b79f5|0)>>>0)/4294967296;const k=rtKit();
 const C={1:['#7a5c40',[150,118,84]],2:['#525c68',[120,132,150]],3:['#36322e',[80,76,70]],4:['#1e1c1c',[60,56,56]],5:['#38332d',[86,78,68]]}[lv];
 /* every shape is drawn nine times, shifted by the picture's size, so the picture tiles without seams */
 const draw=(x,w,h,emi)=>{const W9=f=>{for(const ox of[-w,0,w])for(const oy of[-h,0,h]){x.save();x.translate(ox,oy);f();x.restore()}};x.fillStyle=emi?'#000':C[0];x.fillRect(0,0,w,h);
  if(!emi){for(let i=0;i<120;i++){const rr=6+r()*30,v=.7+r()*.6,c=C[1];x.fillStyle='rgba('+(c[0]*v|0)+','+(c[1]*v|0)+','+(c[2]*v|0)+','+(.35+r()*.4)+')';const ex=r()*w,ey=r()*h,eb=rr*(.4+r()*.5),er=r()*3;W9(()=>{x.beginPath();x.ellipse(ex,ey,rr,eb,er,0,7);x.fill()})}
   for(let i=0;i<22;i++){x.strokeStyle='rgba(10,8,6,'+(.18+r()*.2)+')';x.lineWidth=1+r()*1.5;x.lineJoin='round';let px=r()*w,py=r()*h,a=r()*6.28;const pts=[[px,py]];for(let j=0;j<4;j++){a+=(r()-.5)*1.2;px+=Math.cos(a)*14;py+=Math.sin(a)*14;pts.push([px,py])}W9(()=>{x.beginPath();x.moveTo(pts[0][0],pts[0][1]);for(let j=1;j<pts.length;j++)x.lineTo(pts[j][0],pts[j][1]);x.stroke()})}}
  if(lv==2&&!emi)for(let i=0;i<220;i++){x.fillStyle=r()<.5?'rgba(190,230,255,.7)':'rgba(220,190,255,.6)';x.fillRect(r()*w,r()*h,1+r()*1.5,1+r()*1.5)}
  if(lv==3&&!emi){for(let i=0;i<70;i++){const px=r()*w,l=30+r()*120,gr=x.createLinearGradient(0,0,0,l);gr.addColorStop(0,'rgba(170,180,175,.0)');gr.addColorStop(.3,'rgba(170,180,175,.22)');gr.addColorStop(1,'rgba(170,180,175,0)');const py=r()*h,dw=2+r()*4;W9(()=>{x.save();x.translate(px,py);x.fillStyle=gr;x.fillRect(0,0,dw,l);x.restore()})}
   for(let i=0;i<14;i++){x.fillStyle='rgba(60,90,50,'+(.2+r()*.2)+')';const a=[r()*w,r()*h,10+r()*30,6+r()*14,r()*3];W9(()=>{x.beginPath();x.ellipse(a[0],a[1],a[2],a[3],a[4],0,7);x.fill()})}}
  if(lv==4&&!emi){/* basalt: faint column joints, no glow (the glowing cracks are placed per room, dmDress) */for(let i=0;i<14;i++){x.strokeStyle='rgba(0,0,0,'+(.25+r()*.2)+')';x.lineWidth=1.5;let px=r()*w,py=r()*h;const pts=[[px,py]];for(let j=0;j<3;j++){const a=Math.PI/3*(r()*6|0);px+=Math.cos(a)*24;py+=Math.sin(a)*24;pts.push([px,py])}W9(()=>{x.beginPath();x.moveTo(pts[0][0],pts[0][1]);for(let j=1;j<pts.length;j++)x.lineTo(pts[j][0],pts[j][1]);x.stroke()})}}
  if(lv==5&&!emi)for(let i=0;i<40;i++){x.fillStyle='rgba(120,110,95,'+(.1+r()*.12)+')';const a=[r()*w,r()*h,8+r()*24,4+r()*10,r()*3];W9(()=>{x.beginPath();x.ellipse(a[0],a[1],a[2],a[3],a[4],0,7);x.fill()})}};
 const t=k.tex(256,256,(x,w,h)=>draw(x,w,h,false));K['rt'+lv]=t;return t}
function dmFloorTex(lv){const K=dmKit();if(K['ft'+lv])return K['ft'+lv];let sd=lv*331+9;const r=()=>((sd=Math.imul(sd^sd>>>15,sd|1)+0x6d2b79f5|0)>>>0)/4294967296;const k=rtKit();
 const B={1:['#8a6a48',[160,124,88]],2:['#7a7a7a',[150,150,155]],3:['#3a3028',[70,60,50]],4:['#262222',[70,64,60]],5:['#3a3430',[90,82,74]]}[lv];
 const draw=(x,w,h,emi)=>{const W9=f=>{for(const ox of[-w,0,w])for(const oy of[-h,0,h]){x.save();x.translate(ox,oy);f();x.restore()}};x.fillStyle=emi?'#000':B[0];x.fillRect(0,0,w,h);if(!emi)for(let i=0;i<2600;i++){const v=.6+r()*.8,c=B[1];x.fillStyle='rgba('+(c[0]*v|0)+','+(c[1]*v|0)+','+(c[2]*v|0)+','+(.3+r()*.5)+')';x.fillRect(r()*w,r()*h,1+r()*3,1+r()*2)}
  if(lv==2&&!emi)for(let i=0;i<300;i++){x.fillStyle='rgba(200,225,255,.6)';x.fillRect(r()*w,r()*h,1,1)}
  if(lv==3&&!emi)for(let i=0;i<16;i++){x.fillStyle='rgba(20,26,28,.5)';const a=[r()*w,r()*h,8+r()*24,5+r()*12,r()*3];W9(()=>{x.beginPath();x.ellipse(a[0],a[1],a[2],a[3],a[4],0,7);x.fill()})}
  if(lv==4&&!emi)for(let i=0;i<20;i++){x.fillStyle='rgba(0,0,0,'+(.15+r()*.2)+')';const a=[r()*w,r()*h,6+r()*18,3+r()*8,r()*3];W9(()=>{x.beginPath();x.ellipse(a[0],a[1],a[2],a[3],a[4],0,7);x.fill()})}
  if(lv==5&&!emi)for(let i=0;i<50;i++){x.fillStyle='rgba(215,205,180,'+(.3+r()*.3)+')';x.save();x.translate(r()*w,r()*h);x.rotate(r()*3);x.fillRect(0,0,3+r()*6,1.5);x.restore()}};
 const t=k.tex(256,256,(x,w,h)=>draw(x,w,h,false));K['ft'+lv]=t;return t}
function dmFloorMat(lv){const K=dmKit(),L=DMLV[lv],t=dmFloorTex(lv),o={map:t,roughness:lv==3?.3:1,metalness:lv==3?.15:0};const m=K.M(0xffffff,o);m.userData.s=2.5;return m}
function dmShellMat(lv){const K=dmKit();if(K['sm'+lv])return K['sm'+lv];const L=DMLV[lv],o={vertexColors:true,map:dmRockTex(lv),roughness:L.rough,metalness:L.metal};
 const m=K.M(0xffffff,o);K['sm'+lv]=m;return m}
/* the room's cross-section: up the left wall (bulging out up to 0.3 m), over a vaulted roof, down the right wall */
function dmProf(HX,HY,lv){const L=DMLV[lv||1],W=HY-.6,RH=L.vault,P=[],NW=9,NR=20;
 for(let i=0;i<=NW;i++){const y=W*i/NW;P.push([-(HX+.3*Math.pow(Math.max(0,Math.sin(Math.PI*y/W)),.8)),y])}
 for(let i=1;i<NR;i++){const t=Math.PI*(1-i/NR);P.push([HX*Math.cos(t),W+RH*Math.sin(t)])}
 for(let i=NW;i>=0;i--){const y=W*i/NW;P.push([HX+.3*Math.pow(Math.max(0,Math.sin(Math.PI*y/W)),.8),y])}
 const N=P.map((p,i)=>{const a=P[Math.max(0,i-1)],b=P[Math.min(P.length-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy);return[-dy/l,dx/l]});
 const S=[0];for(let i=1;i<P.length;i++)S.push(S[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));return{P,N,S,W,len:S[S.length-1]}}
function dmShell(g,o){const K=dmKit(),HX=o.HX||4,HY=o.HY||4,Z=o.Z||20,lv=o.lv||1,L=DMLV[lv],pf=dmProf(HX,HY,lv),P=pf.P,N=pf.N,sd=((o.seed|0)%997)*3.17,G=new THREE.Group();g.add(G);
 const sm=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t)};
 const disp=(x,y,z,ny)=>{const n=dmNoise(x*.9+sd,y*.9,z*.9);return L.amp*(ny>.5?1.25:1)*n*sm(0,.7,y)*sm(0,.9,Math.min(-z,Z+z))};
 const nz=Math.max(2,Math.ceil(Z/.42)),pos=[],col=[],uv=[],idx=[],np=P.length;
 for(let a=0;a<=nz;a++){const z=-Z*a/nz;for(let j=0;j<np;j++){const[x,y]=P[j],[nx,ny]=N[j],d=disp(x,y,z,ny);pos.push(x+nx*d,y+ny*d,z);uv.push(pf.S[j]/2.5,-z/2.5);
  const v=(.8+.32*dmNoise(x*1.7+40,y*1.7,z*1.7))*(y<.7?.78+.22*y/.7:1)*(lv==5?1-.25*sm(HY,HY+L.vault,y):1);if(lv==4){/* the heat: the rock warms to red towards the floor */const ht=Math.max(0,1-y/1.4)*.55;col.push(v+ht*.9,v+ht*.22,v)}else col.push(v,v,v)}}
 const hole=(x,y,z)=>(o.holes||[]).some(h=>(h.y0===undefined?y>pf.W:y>h.y0&&y<h.y1)&&x>h.x0&&x<h.x1&&z>h.z0&&z<h.z1);
 for(let a=0;a<nz;a++)for(let j=0;j<np-1;j++){const i0=a*np+j,i1=i0+1,i2=i0+np,i3=i2+1;const cx=(P[j][0]+P[j+1][0])/2,cy=(P[j][1]+P[j+1][1])/2,cz=-Z*(a+.5)/nz;if(hole(cx,cy,cz))continue;idx.push(i0,i2,i1,i1,i2,i3)}
 const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));ge.setAttribute('color',new THREE.Float32BufferAttribute(col,3));ge.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));ge.setIndex(idx);ge.computeVertexNormals();
 const mat=dmShellMat(lv),mesh=new THREE.Mesh(ge,mat);G.add(mesh);
 /* the end walls: the cross-section with a notch for the door (entry at z 0 faces -z, exit at -Z faces +z) */
 const cap=(dx,z,flip)=>{const sh=new THREE.Shape(),F=flip?-1:1,pts=P.map(p=>[p[0]*F,p[1]]);if(flip)pts.reverse();sh.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)sh.lineTo(pts[i][0],pts[i][1]);
   if(dx==='solid')sh.lineTo(pts[0][0],0);else{const d=dx*F,a=Math.min(d-.8,d+.8),b=Math.max(d-.8,d+.8);/* round the foot: last point is (+HX,0) */sh.lineTo(b,0);sh.lineTo(b,3);sh.lineTo(a,3);sh.lineTo(a,0);sh.lineTo(pts[0][0],0)}
   const cg=new THREE.ShapeGeometry(sh);const U=cg.attributes.uv,Pp=cg.attributes.position,c=[];for(let i=0;i<Pp.count;i++){U.setXY(i,Pp.getX(i)/2.5,Pp.getY(i)/2.5);const v=.82+.25*dmNoise(Pp.getX(i)*1.3+7,Pp.getY(i)*1.3,z);c.push(v,v,v)}cg.setAttribute('color',new THREE.Float32BufferAttribute(c,3));
   const m=new THREE.Mesh(cg,mat);m.position.z=z;if(flip)m.rotation.y=Math.PI;G.add(m);return m};
 if(o.dIn!==null)cap(o.dIn||0,0,true);if(o.dOut!==null)cap(o.dOut||0,-Z,false);
 const at=(z,s)=>{const t=Math.min(.999,Math.max(0,s))*pf.len;let j=0;while(j<P.length-2&&pf.S[j+1]<t)j++;const f=(t-pf.S[j])/(pf.S[j+1]-pf.S[j]),x=P[j][0]+(P[j+1][0]-P[j][0])*f,y=P[j][1]+(P[j+1][1]-P[j][1])*f,nx=N[j][0]+(N[j+1][0]-N[j][0])*f,ny=N[j][1]+(N[j+1][1]-N[j][1])*f,nl=Math.hypot(nx,ny),d=disp(x,y,z,ny/nl);return{p:[x+nx/nl*d,y+ny/nl*d,z],n:[nx/nl,ny/nl]}};
 G.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{g:G,mesh,at,prof:pf,HX,HY,Z,lv}}
/* something lying on the rock: turn +y to the rock's inward normal, sink it a little */
function dmOnRock(ge,sh,z,s,sink,spin){const a=sh.at(z,s),n=new THREE.Vector3(-a.n[0],-a.n[1],0);const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),n);ge.rotateY(spin||0);ge.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(q));ge.translate(a.p[0]-n.x*(sink||0),a.p[1]-n.y*(sink||0),a.p[2]);return ge}
function dmCrystal(list,sz,seed,col){let sd=seed*31+7;const r=()=>((sd=Math.imul(sd^sd>>>15,sd|1)+0x6d2b79f5|0)>>>0)/4294967296;const n=6+(r()*5|0),G=[];
 /* a cluster: one big crystal standing nearly upright, smaller ones fanning out from the same base. Each crystal is a
    six-sided column (sunk into the rock below y 0) with a faceted point that matches it exactly, both moved together. */
 for(let i=0;i<n;i++){const main=i==0,stub=i>n-3,h=sz*(main?1:stub?.12+r()*.1:.3+r()*.5),w=main?h*.2:stub?sz*(.05+r()*.03):h*(.16+r()*.06),a=main?r()*.15:stub?.6+r()*.5:.3+r()*.55,dir=main?r()*6.28:(i/n)*6.28+r()*.8,off=main?0:sz*(stub?.14+r()*.06:.06+r()*.1),ox=-Math.cos(dir)*off,oz=Math.sin(dir)*off,sp=r()*1.05;
  const pr=new THREE.CylinderGeometry(w*.9,w,h+w,6,1);pr.translate(0,(h-w)/2,0);const tip=new THREE.ConeGeometry(w*.9,w*1.9,6);tip.translate(0,h+w*.95,0);
  for(const ge of[pr,tip]){ge.rotateY(sp);ge.rotateZ(a);ge.rotateY(dir);ge.translate(ox,0,oz);G.push(ge)}}
 return G}
function dmBone(kind,sz,seed){let sd=seed*17+3;const r=()=>((sd=Math.imul(sd^sd>>>15,sd|1)+0x6d2b79f5|0)>>>0)/4294967296;const G=[];
 if(kind=='long'){const s=new THREE.CylinderGeometry(.035*sz,.035*sz,.7*sz,8);s.rotateZ(Math.PI/2);G.push(s);for(const e of[-1,1]){const k=new THREE.SphereGeometry(.07*sz,8,6);k.scale(1,.8,1.2);k.translate(e*.35*sz,0,0);G.push(k)}}
 else if(kind=='rib'){const t=new THREE.TorusGeometry(.4*sz,.03*sz,6,14,Math.PI*.9);G.push(t)}
 else{/* a long animal skull (no particular animal): a tapering snout box, a round cranium, two horn stubs */const c=new THREE.SphereGeometry(.16*sz,10,8);c.scale(1,.85,1.1);G.push(c);const sn=new THREE.CylinderGeometry(.06*sz,.12*sz,.36*sz,8);sn.rotateX(Math.PI/2);sn.translate(0,-.04*sz,.26*sz);G.push(sn);
  for(const e of[-1,1]){const hn=new THREE.ConeGeometry(.04*sz,.22*sz,6);hn.rotateZ(-e*1.1);hn.translate(e*.17*sz,.1*sz,-.02*sz);G.push(hn);const ey=new THREE.SphereGeometry(.035*sz,6,5);ey.translate(e*.08*sz,.02*sz,.13*sz);G.push(ey)}}
 return G}
function dmDress(g,sh,o){const K=dmKit(),M=K.M,lv=sh.lv,HX=sh.HX,HY=sh.HY,Z=sh.Z,G=new THREE.Group();g.add(G);let sd=((o.seed|0)+lv*101)*7+1;const r=()=>((sd=Math.imul(sd^sd>>>15,sd|1)+0x6d2b79f5|0)>>>0)/4294967296;
 const out={tick:()=>{},glow:[],obs:[],g:G};const ticks=[];const zr=(m)=>-(m+r()*(Z-2*m));/* a z inside the room, m from each end */
 if(lv==1){/* lagging: planks laid along the caps of the timber sets (most bays), and boards behind the posts */const T=[],sets=(o.sets||[]).slice().sort((a,b)=>b-a);
  for(let i=0;i<sets.length-1;i++){const za=sets[i],zb=sets[i+1];if(za-zb>3.6||r()<.3)continue;/* only between neighbouring sets */for(let x=-2.7;x<=2.71;x+=.3){if(r()<.12)continue;const cy=(o.capTop==null?HY-.02:o.capTop)+.0175;mgBeam(T,[x+(r()-.5)*.04,cy,za],[x+(r()-.5)*.04,cy,zb],.24,.035,[.62+r()*.12,.46+r()*.08,.3])}
   for(const s of[-1,1]){if(r()<.35)continue;for(let y=.45;y<2.6;y+=.28){if(r()<.15)continue;mgBeam(T,[s*HX,y,za-.1],[s*HX,y,zb+.1],.03,.24,[.58+r()*.12,.43+r()*.08,.28])}}}
  if(T.length)G.add(mgMerge(T,K.TIMBV));
  /* old tools leaning on the wall, a water barrel */const S=[];const tz=zr(3);for(const[dx,ry]of[[0,.15],[.35,-.1]]){mgBeam(S,[HX-.12,0,tz+dx],[HX-.45,1.25,tz+dx+ry],.04,.04,[.55,.4,.26])}
  if(!o.noProps){G.add(mgMerge(S,K.TIMBV));const bz=zr(3),br=new THREE.Mesh(new THREE.CylinderGeometry(.3,.27,.8,14),M(0xffffff,{map:K.PLANKT,roughness:.9}));br.position.set(-HX+.42,.4,bz);G.add(br);out.obs.push({x0:-HX,x1:-HX+.75,z0:bz-.35,z1:bz+.35})}}
 if(lv==2){/* crystal clusters on the walls and roof, and a few small ones at the foot of the walls */const A=[],B=[];let k=0;const n=Math.round(Z/2.2);
  for(let i=0;i<n;i++){const z=zr(1.2),s=r()<.6?(r()<.5?.12+r()*.15:.73+r()*.15):.35+r()*.3,big=s>.3&&s<.7;const list=(k++%3)?A:B;const spin=r()*6.28;dmCrystal(list,big?.9+r()*.6:.6+r()*.5,i+5).forEach(ge=>{dmOnRock(ge,sh,z,s,.05,spin);mgPut(list,ge,0,0,0,0,[1,1,1])});const a=sh.at(z,s);if(i%3==0)out.glow.push([a.p[0]*.8,a.p[1]-.4,z])}
  for(let i=0;i<Math.round(Z/4);i++){const z=zr(1.5),sx=r()<.5?-1:1;const list=i%2?A:B;dmCrystal(list,.35+r()*.25,i+70).forEach(ge=>{ge.translate(sx*(HX-.12),-.02,z);mgPut(list,ge,0,0,0,0,[1,1,1])})}
  const CA=M(0xbfe6ff,{emissive:0x3a9cff,emissiveIntensity:.75,roughness:.12,metalness:.1,flatShading:true}),CB=M(0xe4ccff,{emissive:0x9050f0,emissiveIntensity:.7,roughness:.12,metalness:.1,flatShading:true});
  if(A.length)G.add(mgMerge(A,CA));if(B.length)G.add(mgMerge(B,CB))}
 if(lv==3){/* puddles, a pipe along one wall on brackets, ankle-deep water */const PM=M(0x1a2226,{roughness:.12,metalness:.3,polygonOffset:true,polygonOffsetUnits:-2});
  for(let i=0;i<4+(r()*3|0);i++){const p=new THREE.Mesh(new THREE.CircleGeometry(1,20),PM);p.rotation.x=-Math.PI/2;p.scale.set(.5+r()*.9,.4+r()*.6,1);const pz=zr(1);p.position.set((r()-.5)*(2*HX-2),.004+i*.002,pz);/* each a little higher than the last, so overlapping ones don't flicker; none over a cut in the floor */if(!(o.floorCut||[]).some(c=>pz>c.z0-1.6&&pz<c.z1+1.6))G.add(p)}
  const ps=r()<.5?-1:1,px=ps*(HX+.08),py=2.5,IR=M(0xffffff,{map:K.RUSTT,roughness:.6,metalness:.5});const pp=new THREE.Mesh(new THREE.CylinderGeometry(.11,.11,Z,12),IR);pp.rotation.x=Math.PI/2;pp.position.set(px,py,-Z/2);G.add(pp);
  const BR=[];for(let z=-1.5;z>-Z+1;z-=3){const fl=new THREE.CylinderGeometry(.15,.15,.06,12);fl.rotateX(Math.PI/2);mgPut(BR,fl,px,py,z,0,[.5,.45,.42]);const a=sh.at(z,ps<0?.16:.84);mgBeam(BR,[px+ps*.1,py,z-.2],[a.p[0]+ps*.04,py,z-.2],.05,.05,[.4,.38,.36]);mgBeam(BR,[px,py-.13,z-.2],[px+ps*.14,py-.13,z-.2],.04,.04,[.4,.38,.36])}
  G.add(mgMerge(BR,K.IRONV));
  if(o.wet){const wt=rtKit().tex(128,128,(x,w,h)=>{x.fillStyle='#203030';x.fillRect(0,0,w,h);for(let i=0;i<60;i++){x.strokeStyle='rgba(180,210,210,.18)';x.lineWidth=1;x.beginPath();x.ellipse(Math.random()*w,Math.random()*h,4+Math.random()*12,2+Math.random()*4,0,0,7);x.stroke()}});wt.repeat.set(HX/1.5,Z/3);
   const wm=M(0xffffff,{map:wt,transparent:true,opacity:.55,roughness:.05,metalness:.5,depthWrite:false});const w=new THREE.Mesh(new THREE.PlaneGeometry(2*HX,Z),wm);w.rotation.x=-Math.PI/2;w.position.set(0,.09,-Z/2);w.renderOrder=2;G.add(w);out.water=w;ticks.push(t=>{wt.offset.set(t*.02,t*.035)})}}
 if(lv==4){/* glowing cracks, placed per room (no repeating pattern): each starts on the floor a little way out from the
    wall, runs to the foot of the wall and climbs it, sometimes with a branch; a couple wander over the roof. A bright
    core and a soft glow either side. */
  const gT=(()=>{const c=document.createElement('canvas');c.width=4;c.height=64;const x=c.getContext('2d'),gr=x.createLinearGradient(0,0,0,64);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.5,'rgba(255,255,255,1)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,4,64);return new THREE.CanvasTexture(c)})();
  const CORE={p:[],u:[],c:[]},HALO={p:[],u:[],c:[]};const V=THREE.Vector3;
  const rib=(P,Nn,w0,B,off,col)=>{const n=P.length;if(n<2)return;const L=[],Rr=[];for(let i=0;i<n;i++){const a=P[Math.max(0,i-1)],b=P[Math.min(n-1,i+1)],t=new V().subVectors(b,a).normalize(),sd2=new V().crossVectors(t,Nn[i]).normalize(),k=i/(n-1),w=w0*(.25+.75*Math.pow(Math.sin(Math.PI*Math.min(1,k*1.15)),.5)),c=P[i].clone().addScaledVector(Nn[i],off);L.push(c.clone().addScaledVector(sd2,w/2));Rr.push(c.clone().addScaledVector(sd2,-w/2))}
   for(let i=0;i<n-1;i++){const q=[L[i],Rr[i],L[i+1],L[i+1],Rr[i],Rr[i+1]],uu=[0,1,0,0,1,1];q.forEach((v,j)=>{B.p.push(v.x,v.y,v.z);B.u.push(.5,uu[j]);const f=col*(.75+.25*Math.sin(i*1.7));B.c.push(f,f,f)})}};
  const crack=(side,z0,big)=>{const P=[],Nn=[],up=new V(0,1,0),fx=HX-(.35+r()*.9)*(big?1.3:1);let z=z0,dz=(r()-.5)*.3;
   for(let d=HX-fx;d>0.001;d-=.15){P.push(new V(side*(HX-d),.012,z));Nn.push(up);z+=dz*.5;dz+=(r()-.5)*.12}
   const H=big?2.2+r()*1.4:1+r()*1.2,len=sh.prof.len;let h=0;const brAt=r()<.6?.4+r()*.4:9,br=[];
   while(h<H){const s2=side<0?h/len:1-h/len,a=sh.at(z,s2);P.push(new V(...a.p));Nn.push(new V(-a.n[0],-a.n[1],0));if(Math.abs(h-brAt*H)<.1)br.push([z,h]);h+=.16;z+=dz*.5;dz+=(r()-.5)*.14;dz=Math.max(-.35,Math.min(.35,dz))}
   const w=big?.17:.1;rib(P,Nn,w,CORE,.035,1);rib(P,Nn,w*5,HALO,.04,big?1:.7);
   for(const[bz,bh]of br){const Q=[],Nq=[];let z2=bz,h2=bh,d2=(r()<.5?-1:1)*.25;for(let i=0;i<8;i++){const s2=side<0?h2/len:1-h2/len,a=sh.at(z2,s2);Q.push(new V(...a.p));Nq.push(new V(-a.n[0],-a.n[1],0));h2+=.12;z2+=d2;d2+=(r()-.5)*.1}rib(Q,Nq,w*.6,CORE,.035,.9);rib(Q,Nq,w*4,HALO,.04,.5)}
   out.glow.push([side*(HX-.6),.6,z0])};
  const nC=Math.max(4,Math.round(Z/3.2)),seeps=[];for(let i=0;i<nC;i++){const z0=-(1.5+(Z-3)*(i+.3+r()*.4)/nC),side=i%2?1:-1,big=i%3==0;crack(side,z0,big);if(big&&seeps.length<2)seeps.push([side,z0])}
  /* a magma seep where the biggest cracks meet the floor: a glowing pool with a dark crust */
  const sT=rtKit().tex(128,128,(x,w,h)=>{const gr=x.createRadialGradient(64,64,4,64,64,64);gr.addColorStop(0,'#fff0a0');gr.addColorStop(.45,'#ff8a20');gr.addColorStop(.8,'#c03008');gr.addColorStop(1,'rgba(60,10,4,0)');x.fillStyle=gr;x.fillRect(0,0,w,h);
   for(let i=0;i<26;i++){const a=r()*6.28,d=18+r()*40;x.fillStyle='rgba(30,14,10,'+(.55+r()*.4)+')';x.beginPath();x.ellipse(64+Math.cos(a)*d,64+Math.sin(a)*d,5+r()*11,4+r()*8,r()*3,0,7);x.fill()}});
  for(const[side,z0]of seeps){const sp=new THREE.Mesh(new THREE.CircleGeometry(1,24),new THREE.MeshBasicMaterial({map:sT,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetUnits:-4}));sp.rotation.x=-Math.PI/2;sp.scale.set(.7+r()*.3,.45+r()*.2,1);sp.position.set(side*(HX-.55),.014,z0);G.add(sp);out.glow.unshift([side*(HX-.8),.5,z0])}
  for(let i=0;i<2;i++){/* across the roof */const P=[],Nn=[];let z=zr(3),s2=.36+r()*.1,dz=(r()-.5)*.4;for(let j=0;j<22;j++){const a=sh.at(z,s2);P.push(new V(...a.p));Nn.push(new V(-a.n[0],-a.n[1],0));s2+=.013;z+=dz*.3;dz+=(r()-.5)*.2}rib(P,Nn,.05,CORE,.035,.8);rib(P,Nn,.3,HALO,.04,.45)}
  const mk=(B,m)=>{const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(B.p,3));ge.setAttribute('uv',new THREE.Float32BufferAttribute(B.u,2));ge.setAttribute('color',new THREE.Float32BufferAttribute(B.c,3));const me=new THREE.Mesh(ge,m);G.add(me);return me};
  mk(CORE,new THREE.MeshBasicMaterial({color:0xffb050,vertexColors:true,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetUnits:-3}));
  const hm=mk(HALO,new THREE.MeshBasicMaterial({color:0xff4a10,map:gT,vertexColors:true,transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetUnits:-3}));hm.renderOrder=3;
  ticks.push(t=>{hm.material.opacity=.45+.12*Math.sin(t*1.3)+.05*Math.sin(t*3.7)});
  /* basalt columns at the foot of the walls, steam vents in the floor */const B=[],BM=M(0xffffff,{vertexColors:true,map:dmRockTex(4),roughness:.7,metalness:.05});
  if(!o.noProps)for(let i=0;i<Math.round(Z/1.6);i++){const s=r()<.5?-1:1,z=zr(.8),h=.6+r()*1.8,w=.22+r()*.16,c=new THREE.CylinderGeometry(w,w,h,6);c.translate(0,h/2,0);const v=.5+r()*.25;mgPut(B,c,s*(HX+w-.05),-.02,z,r(),[v,v,v])}G.add(mgMerge(B,BM));
  const SP=dmSprite('rgba(200,190,185,.5)',true),VM=M(0x200804,{emissive:0xff5010,emissiveIntensity:1.2,roughness:.9,polygonOffset:true,polygonOffsetUnits:-2});
  for(let i=0;i<(o.noProps?0:2);i++){const x=(r()<.5?-1:1)*(HX-.9-r()*.6),z=-Z*(.3+.4*i)-r()*1.5;const v=new THREE.Mesh(new THREE.CircleGeometry(.32,10),VM);v.rotation.x=-Math.PI/2;v.scale.set(1,.45,1);v.position.set(x,.005,z);G.add(v);
   const puffs=[];for(let j=0;j<6;j++){const s2=new THREE.Sprite(new THREE.SpriteMaterial({map:SP,transparent:true,depthWrite:false,opacity:.5}));G.add(s2);puffs.push(s2)}ticks.push(t=>puffs.forEach((p,j)=>{const k=(t*.35+j/6)%1;p.position.set(x+Math.sin(j*2+t)*.15*k,.1+k*3.2,z);p.scale.setScalar(.25+k*.8);p.material.opacity=.22*Math.sin(Math.PI*k)}));out.glow.push([x,.5,z])}}
 if(lv==5){/* glowing fungus at the foot of the walls, bones, fallen carved stones */const F=[],FS=[];
  for(let i=0;i<Math.round(Z/1.3);i++){const s=r()<.5?.06+r()*.08:.86+r()*.08,z=zr(.8);for(let j=0;j<3+(r()*4|0);j++){const h=.05+r()*.12,st=new THREE.CylinderGeometry(.012,.016,h,5,1,true);st.translate(0,h/2,0);const cp=new THREE.SphereGeometry(.035+r()*.04,8,5,0,Math.PI*2,0,1.6);cp.scale(1,.55,1);cp.translate(0,h,0);
   const ang=j*2.4+r(),rad=.04+.08*j,ox=Math.cos(ang)*rad*.8,oz=Math.sin(ang)*rad;/* caps spiral out from the middle so they don't overlap */for(const[ge,l]of[[st,FS],[cp,F]]){ge.translate(ox,0,oz);dmOnRock(ge,sh,z,s,.02,0);mgPut(l,ge,0,0,0,0,[1,1,1])}}if(i%4==0){const a=sh.at(z,s);out.glow.push([a.p[0]*.85,.4,z])}}
  G.add(mgMerge(F,M(0x9affe0,{emissive:0x30e0b0,emissiveIntensity:1.1,roughness:.6})));G.add(mgMerge(FS,M(0x6a7a70,{roughness:.8})));
  const BN=[];if(!o.noProps)for(let i=0;i<5;i++){const kind=['long','rib','long','skull','rib'][i],sz=.8+r()*.6,x=(r()<.5?-1:1)*(HX-.6-r()*1.2),z=zr(1.5);dmBone(kind,sz,i+9).forEach(ge=>{if(kind=='rib'){ge.rotateX(-Math.PI/2+.25);ge.translate(0,.03,0)}else ge.translate(0,kind=='skull'?.14*sz:.05*sz,0);mgPut(BN,ge,x,0,z,r()*6,[.86,.82,.72])})}
  G.add(mgMerge(BN,M(0xffffff,{vertexColors:true,roughness:.8})));
  /* a fallen carved block from the older dig: marks cut in rows */const gt=rtKit().tex(256,128,(x,w,h)=>{x.fillStyle='#8a7a62';x.fillRect(0,0,w,h);for(let i=0;i<500;i++){x.fillStyle='rgba(50,40,30,'+Math.random()*.2+')';x.fillRect(Math.random()*w,Math.random()*h,2,2)}x.strokeStyle='rgba(40,30,20,.75)';x.lineWidth=3;
   for(let row=0;row<3;row++)for(let c=0;c<7;c++){const cx=20+c*34,cy=24+row*40,t=(row*7+c)*7%5;x.beginPath();if(t==0){x.arc(cx,cy,9,0,7)}else if(t==1){x.moveTo(cx-9,cy+9);x.lineTo(cx,cy-9);x.lineTo(cx+9,cy+9);x.closePath()}else if(t==2){x.moveTo(cx-10,cy);x.lineTo(cx+10,cy);x.moveTo(cx,cy-10);x.lineTo(cx,cy+10)}else if(t==3){x.moveTo(cx-9,cy-6);x.quadraticCurveTo(cx,cy+12,cx+9,cy-6)}else{x.rect(cx-7,cy-9,14,18)}x.stroke()}});
  if(!o.noProps){const bz=zr(3),bx=(r()<.5?-1:1)*(HX-1.1),bl=new THREE.Mesh(new THREE.BoxGeometry(1.4,.8,.9),[M(0x8a7a62,{roughness:.9}),M(0x8a7a62,{roughness:.9}),M(0x8a7a62,{roughness:.9}),M(0x8a7a62,{roughness:.9}),M(0xffffff,{map:gt,roughness:.9}),M(0x8a7a62,{roughness:.9})]);bl.position.set(bx,.38,bz);bl.rotation.set(0,.4,.06);G.add(bl);out.obs.push({x0:bx-.85,x1:bx+.85,z0:bz-.75,z1:bz+.75})}}
 out.tick=t=>ticks.forEach(f=>f(t));G.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return out}
/* ---------- the stations ---------- */
function dmLevelBoard(g,lv,x,y,z,ry,next){const L=DMLV[lv];return dmSign(g,2.4,1.1,next?['NEXT: LEVEL '+lv,L.name,L.m+' m BELOW THE SURFACE']:['LEVEL '+lv,L.name,L.m+' m'],'#1e2a22','#f0e2b0',x,y,z,ry)}
function dmStation(g,o){const K=dmKit(),M=K.M,lv=o.lv||1,HX=o.HX||5,Z=o.Z||16,G=new THREE.Group();g.add(G);const out={obs:[],lamps:[],g:G};
 /* a concrete apron in front of the cage, with a yellow line */const ap=new THREE.Mesh(new THREE.BoxGeometry(2*HX-.2,.06,4),M(0x8a8780,{roughness:.9}));ap.position.set(0,.03,-Z+2.75+2);G.add(ap);
 const yl=new THREE.Mesh(new THREE.BoxGeometry(2*HX-.4,.004,.12),M(0xe0b020,{roughness:.7}));yl.position.set(0,.062,-Z+2.75+1.0);G.add(yl);
 /* the level board on the left wall, the next level's board on the right, a bench, two lamp posts */
 /* the boards stand on two posts each, just off the walls */const bl=dmLevelBoard(G,lv,-HX+.3,2.0,-Z/2+1,Math.PI/2);const bn=dmLevelBoard(G,Math.min(5,lv+1),HX-.3,2.0,-Z/2-2.5,-Math.PI/2,true);
 {const S=[];for(const[bx,bz]of[[-HX+.33,-Z/2+1],[HX-.33,-Z/2-2.5]])for(const dz of[-1,1])mgBeam(S,[bx+(bx<0?-.08:.08),0,bz+dz],[bx+(bx<0?-.08:.08),2.4,bz+dz],.1,.1,K.c.tim);G.add(mgMerge(S,K.TIMBV));out.obs.push({x0:-HX,x1:-HX+.45,z0:-Z/2-.1,z1:-Z/2+2.1},{x0:HX-.45,x1:HX,z0:-Z/2-3.6,z1:-Z/2-1.4})}
 {const S=[],bx=-HX+.45,bz=-Z/2-2.5;mgBeam(S,[bx,.45,bz-1],[bx,.45,bz+1],.42,.06,K.c.tim);mgBeam(S,[bx-.2,.75,bz-1],[bx-.2,.75,bz+1],.06,.4,K.c.tim2);for(const dz of[-.85,.85]){mgBeam(S,[bx+.15,0,bz+dz],[bx+.15,.42,bz+dz],.05,.05,K.c.tim2);mgBeam(S,[bx-.2,0,bz+dz],[bx-.2,.9,bz+dz],.05,.05,K.c.tim2)}G.add(mgMerge(S,K.TIMBV));out.obs.push({x0:-HX,x1:bx+.25,z0:bz-1,z1:bz+1})}
 for(const lz of[-3,-Z+6]){const S=[];mgBeam(S,[HX-.5,0,lz],[HX-.5,3.2,lz],.16,.16,K.c.tim);mgBeam(S,[HX-.5,3.1,lz],[HX-1.2,3.1,lz],.1,.1,K.c.tim2);G.add(mgMerge(S,K.TIMBV));
  const lm=new THREE.Mesh(new THREE.CylinderGeometry(.11,.14,.26,10),M(0xfff0c0,{emissive:0xffc070,emissiveIntensity:1.2}));lm.position.set(HX-1.15,2.88,lz);G.add(lm);const hd=new THREE.Mesh(new THREE.ConeGeometry(.24,.14,10),M(0x2a2a28,{metalness:.5}));hd.position.set(HX-1.15,3.05,lz);G.add(hd);out.lamps.push([HX-1.15,2.85,lz]);out.obs.push({x0:HX-.6,x1:HX-.4,z0:lz-.1,z1:lz+.1})}
 G.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return out}
function dmCage(g,o){const K=dmKit(),M=K.M,lv=o.lv||1,HX=o.HX||5,HY=o.HY||5,ox=o.x||0,G=new THREE.Group();G.position.set(ox,0,-(o.Z||16));g.add(G);const pf=dmProf(HX,HY,lv),FZ=2.75,OW=1.5,OH=2.7;
 const ST=M(0x4a4e52,{metalness:.6,roughness:.45}),ST2=M(0x2e3134,{metalness:.6,roughness:.5}),YEL=M(0xd8a820,{roughness:.6,metalness:.2}),out={};
 /* the front wall: concrete, the room's cross-section (made 0.6 m bigger so it meets the rough rock), the opening with a steel frame */
 {const sh=new THREE.Shape(),P=pf.P.map(p=>[p[0]*(1+.6/HX)-ox,p[1]*(1+.6/Math.max(4,HY))]);sh.moveTo(P[0][0],0);P.forEach(p=>sh.lineTo(p[0],p[1]));sh.lineTo(OW/2,0);sh.lineTo(OW/2,OH);sh.lineTo(-OW/2,OH);sh.lineTo(-OW/2,0);sh.lineTo(P[0][0],0);
  const cg=new THREE.ShapeGeometry(sh),U=cg.attributes.uv;for(let i=0;i<U.count;i++)U.setXY(i,U.getX(i)/2,U.getY(i)/2);const CM=M(0xffffff,{map:rtKit().BLOCK?rtKit().BLOCK.map:null,color:0xb8b0a0,roughness:.95});const w=new THREE.Mesh(cg,CM);w.position.z=FZ;G.add(w);
  /* the reveal of the opening (0.15 m deep) */for(const[w2,h,x,y]of[[.15,OH,-OW/2,OH/2],[.15,OH,OW/2,OH/2],[OW,.15,0,OH]]){const m=new THREE.Mesh(new THREE.BoxGeometry(w2==.15?.01:OW,w2==.15?OH:.01,.14),CM);m.position.set(x,y,FZ-.08);G.add(m)}
  /* steel frame: two posts and a header, yellow-and-black edge */for(const s of[-1,1]){const p=new THREE.Mesh(new THREE.BoxGeometry(.18,OH,.12),ST);p.position.set(s*(OW/2+.09),OH/2,FZ+.06);G.add(p)}const hd=new THREE.Mesh(new THREE.BoxGeometry(OW+.36,.22,.12),ST);hd.position.set(0,OH+.11,FZ+.06);G.add(hd);
  const ht=rtKit().tex(128,16,(x,w,h)=>{for(let i=-2;i<12;i++){x.fillStyle=i%2?'#1a1a1a':'#e8b820';x.beginPath();x.moveTo(i*14,0);x.lineTo(i*14+14,0);x.lineTo(i*14+4,h);x.lineTo(i*14-10,h);x.fill()}});const hz=new THREE.Mesh(new THREE.PlaneGeometry(OW+.3,.14),M(0xffffff,{map:ht,roughness:.6}));hz.position.set(0,OH+.11,FZ+.124);G.add(hz)}
 /* the landing gate in the opening (lifts up behind the wall) and the back gate in the exit door hole (lifts up behind the end wall) */
 const meshT=rtKit().tex(64,64,(x,w,h)=>{x.clearRect(0,0,w,h);x.strokeStyle='#9aa0a4';x.lineWidth=3;for(let i=-64;i<128;i+=16){x.beginPath();x.moveTo(i,0);x.lineTo(i+64,64);x.stroke();x.beginPath();x.moveTo(i+64,0);x.lineTo(i,64);x.stroke()}});meshT.repeat.set(3,5);
 const MESH=M(0xffffff,{map:meshT,alphaTest:.4,side:THREE.DoubleSide,metalness:.5,roughness:.5});
 const gate=(w,h,z)=>{const gg=new THREE.Group();gg.position.z=z;G.add(gg);const m=new THREE.Mesh(new THREE.PlaneGeometry(w-.08,h-.08),MESH);m.position.y=h/2;gg.add(m);for(const[a,b,c,x,y]of[[w,.05,.04,0,h-.025],[w,.05,.04,0,.025],[w-.1,.05,.04,0,h/2],[.05,h-.1,.04,-w/2+.025,h/2],[.05,h-.1,.04,w/2-.025,h/2]]){const f=new THREE.Mesh(new THREE.BoxGeometry(a,b,c),ST2);f.position.set(x,y,0);gg.add(f)}return gg};
 const gF=gate(OW-.04,OH-.04,FZ-.2),gB=gate(1.56,2.96,.08);
 out.gate=(s,k)=>{const gg=s=='f'?gF:gB;gg.position.y=k*(s=='f'?OH:2.98);if(s=='b'&&typeof place=='function'){gb=k;place()}};
 /* the car: checker-plate floor, corner posts, mesh sides, a roof with the hoist bow and two ropes, a lamp, a bell cord */
 const car=new THREE.Group();G.add(car);const CW=2.2,C0=.2,C1=2.4,CH=2.6,cz=(C0+C1)/2;
 {const ckT=rtKit().tex(64,64,(x,w,h)=>{x.fillStyle='#6a6e70';x.fillRect(0,0,w,h);x.fillStyle='#8a8e90';for(let i=0;i<4;i++)for(let j=0;j<4;j++){x.save();x.translate(8+i*16,8+j*16);x.rotate((i+j)%2?.8:-.8);x.fillRect(-5,-1.5,10,3);x.restore()}});ckT.repeat.set(4,4);
  const fl=new THREE.Mesh(new THREE.BoxGeometry(CW,.05,C1-C0),M(0xffffff,{map:ckT,metalness:.6,roughness:.4}));fl.position.set(0,.025,cz);car.add(fl);
  for(const sx of[-1,1])for(const sz of[C0,C1]){const p=new THREE.Mesh(new THREE.BoxGeometry(.07,CH,.07),ST);p.position.set(sx*(CW/2-.035),CH/2,sz+(sz==C0?.035:-.035));car.add(p)}
  for(const sx of[-1,1]){const sd=new THREE.Mesh(new THREE.PlaneGeometry(C1-C0-.1,CH-.25),MESH);sd.rotation.y=Math.PI/2;sd.position.set(sx*(CW/2-.035),(CH-.25)/2+.1,cz);car.add(sd);for(const y of[.1,1.1,CH-.12]){const rl=new THREE.Mesh(new THREE.BoxGeometry(.05,.05,C1-C0-.1),ST2);rl.position.set(sx*(CW/2-.035),y,cz);car.add(rl)}}
  for(const sz of[C0,C1]){const tb=new THREE.Mesh(new THREE.BoxGeometry(CW-.14,.12,.06),ST);tb.position.set(0,CH-.06,sz+(sz==C0?.035:-.035));car.add(tb)}
  const rf=new THREE.Mesh(new THREE.BoxGeometry(CW,.06,C1-C0),ST);rf.position.set(0,CH+.03,cz);car.add(rf);
  const bow=[];for(const sx of[-.5,.5])bow.push([sx,CH+.06,cz]);for(const sx of[-.55,.55]){const p=new THREE.Mesh(new THREE.BoxGeometry(.1,.7,.1),YEL);p.position.set(sx,CH+.41,cz);car.add(p)}const bt=new THREE.Mesh(new THREE.BoxGeometry(1.3,.14,.14),YEL);bt.position.set(0,CH+.8,cz);car.add(bt);
  for(const sx of[-.18,.18]){const rp=new THREE.Mesh(new THREE.CylinderGeometry(.022,.022,6,6),M(0x2a2a2a,{metalness:.6,roughness:.4}));rp.position.set(sx,CH+.87+3,cz);car.add(rp)}
  const lm=new THREE.Mesh(new THREE.CylinderGeometry(.09,.12,.14,10),M(0xfff0c8,{emissive:0xffd890,emissiveIntensity:1.2}));lm.position.set(0,CH-.08,cz);car.add(lm);out.lamp=[0,CH-.25,cz];
  const cord=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,1.1,4),M(0x8a6a40));cord.position.set(.9,CH-.55,C1-.25);car.add(cord);const hn=new THREE.Mesh(new THREE.SphereGeometry(.035,8,6),M(0x6a4a2a));hn.position.set(.9,CH-1.12,C1-.25);car.add(hn)}
 /* the shaft walls beside the car (seen through the mesh) that slide past while riding, with lamps going by */
 const shT=dmRockTex(lv).clone();shT.needsUpdate=true;shT.repeat.set(1,1.6);const SW=M(0xffffff,{map:shT,roughness:1,color:new THREE.Color(DMLV[lv].rock).multiplyScalar(.8)});
 const lampsS=[];for(const sx of[-1,1]){const w=new THREE.Mesh(new THREE.PlaneGeometry(2.6,4.2),SW);w.rotation.y=-sx*Math.PI/2;w.position.set(sx*1.36,1.6,1.3);G.add(w);for(let i=0;i<2;i++){const l=new THREE.Mesh(new THREE.BoxGeometry(.06,.14,.2),M(0xfff0c0,{emissive:0xffc070,emissiveIntensity:1.4}));l.position.set(sx*1.32,0,.6+i*1.2);G.add(l);lampsS.push({m:l,ph:i*.5+(sx>0?.25:0)})}}
 /* what you see through the mesh while riding: a rock plate that rises behind the front gate as the car leaves the
    station, the shaft rock behind the back gate, and the next level's landing door that comes up into place as the car
    arrives (it lifts with the back gate) */
 /* the shaft's own wall round the opening, seen from inside the car (it slides with the side walls) */
 {const sh=new THREE.Shape();sh.moveTo(-1.36,-.5);sh.lineTo(1.36,-.5);sh.lineTo(1.36,3.7);sh.lineTo(-1.36,3.7);sh.lineTo(-1.36,-.5);const hp=new THREE.Path();hp.moveTo(-OW/2,0);hp.lineTo(-OW/2,OH);hp.lineTo(OW/2,OH);hp.lineTo(OW/2,0);hp.lineTo(-OW/2,0);sh.holes.push(hp);
  const ge=new THREE.ShapeGeometry(sh),U=ge.attributes.uv;for(let i=0;i<U.count;i++)U.setXY(i,U.getX(i)/2.6,(U.getY(i)+.5)/4.2*1.6);const fw=new THREE.Mesh(ge,SW);fw.rotation.y=Math.PI;fw.position.z=2.58;G.add(fw)}
 const SWs=M(0xffffff,{map:dmRockTex(lv),roughness:1,color:new THREE.Color(DMLV[lv].rock).multiplyScalar(.8)});
 const fp=new THREE.Mesh(new THREE.PlaneGeometry(OW,OH+.1),SWs);fp.rotation.y=Math.PI;fp.position.set(0,0,2.47);G.add(fp);
 const bp=new THREE.Mesh(new THREE.PlaneGeometry(1.7,3.1),SW);bp.position.set(0,1.55,.02);G.add(bp);
 const ld=new THREE.Group();ld.position.z=.045;G.add(ld);{const dt2=rtKit().tex(128,256,(x,w,h)=>{x.fillStyle='#5a5e58';x.fillRect(0,0,w,h);for(let i=0;i<w;i+=16){x.fillStyle='rgba(255,255,255,.08)';x.fillRect(i,0,6,h);x.fillStyle='rgba(0,0,0,.18)';x.fillRect(i+10,0,4,h)}for(let i=0;i<300;i++){x.fillStyle='rgba(130,70,30,'+Math.random()*.25+')';x.fillRect(Math.random()*w,Math.random()*h,2+Math.random()*4,1+Math.random()*6)}x.fillStyle='#e8dcb0';x.font='bold 40px '+dmF();x.textAlign='center';x.fillText('LEVEL',64,110);x.font='bold 70px '+dmF();x.fillText(String(Math.min(5,lv+1)),64,180)});
  const d=new THREE.Mesh(new THREE.PlaneGeometry(1.6,3),M(0xffffff,{map:dt2,metalness:.4,roughness:.6}));d.position.y=1.5;ld.add(d)}
 let dist=0,total=30,gb=0;const place=()=>{fp.position.y=Math.min(0,dist-OH-.1)+(OH+.1)/2;fp.visible=dist>0;const a=Math.max(-3.05,Math.min(0,dist-total));ld.position.y=a+(a>=0?gb*2.98:0);ld.visible=dist>total-3.05;bp.visible=dist<total||gb<.01};
 out.ride=(t)=>{dist=0;total=t||30;place()};out.dist=()=>dist;
 out.tick=(dt,sp)=>{dist+=dt*sp*3;shT.offset.y=dist/2.6;for(const l of lampsS){const k=((dist*.12+l.ph)%1);l.m.position.y=-1+k*5;l.m.visible=sp>0}car.position.set(sp?(Math.random()-.5)*.008*sp:0,sp?(Math.random()-.5)*.006*sp:0,0);place()};
 out.arrived=()=>{dist=total;place()};out.reset=()=>{dist=0;gb=0;place()};
 /* the signal lamps, the bell, the code board, the 'cable short' board */
 const sig=new THREE.Group();sig.position.set(OW/2+.55,2.2,FZ+.02);G.add(sig);{const bx=new THREE.Mesh(new THREE.BoxGeometry(.32,.62,.14),ST2);bx.position.z=.07;sig.add(bx)}const RL=M(0x3a0806,{emissive:0xff2010,emissiveIntensity:0}),GL=M(0x063a10,{emissive:0x20ff40,emissiveIntensity:0});
 for(const[y,m]of[[.14,RL],[-.14,GL]]){const ln=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.04,14),m);ln.rotation.x=Math.PI/2;ln.position.set(0,y,.16);sig.add(ln)}
 out.signal=s=>{RL.emissiveIntensity=s=='stop'?1.6:0;GL.emissiveIntensity=s=='go'?1.6:0};out.signal('stop');
 {const bell=new THREE.Group();bell.position.set(-OW/2-.6,2.55,FZ);G.add(bell);const br=new THREE.Mesh(new THREE.BoxGeometry(.06,.06,.3),ST2);br.position.set(0,.12,.15);bell.add(br);const b=new THREE.Mesh(new THREE.SphereGeometry(.16,14,10,0,Math.PI*2,0,1.75),M(0xc8a040,{metalness:.85,roughness:.25,side:THREE.DoubleSide}));b.position.set(0,0,.28);bell.add(b);
  const cd=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,1.2,4),M(0x8a6a40));cd.position.set(0,-.6,.28);bell.add(cd);const hd2=new THREE.Mesh(new THREE.SphereGeometry(.035,8,6),M(0x6a4a2a));hd2.position.set(0,-1.2,.28);bell.add(hd2)}
 dmSign(G,1.1,.9,['SIGNALS','1 · STOP','2 · RAISE','3 · LOWER','4 · MEN ON'],'#e8dcc0','#2a1a0a',-OW/2-.75,1.35,FZ+.02);
 const sb=dmSign(G,1.3,.5,['CABLE SHORT','USE THE MANWAY'],'#a82018','#f4ead0',0,OH+.55,FZ+.02);sb.visible=false;out.short=on=>{sb.visible=!!on};
 out.gate('f',0);out.gate('b',0);place();G.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});
 out.car=car;out.g=G;out.obs=[];return out}
function dmManway(g,x,z){const K=dmKit(),M=K.M,G=new THREE.Group();G.position.set(x,0,z);g.add(G);const HW=.6,D=10,T=[];
 /* the collar: four squared timbers round the hole */for(const[a,b]of[[[-HW-.15,.1,-HW-.15],[HW+.15,.1,-HW-.15]],[[-HW-.15,.1,HW+.15],[HW+.15,.1,HW+.15]],[[-HW-.15,.1,-HW],[-HW-.15,.1,HW]],[[HW+.15,.1,-HW],[HW+.15,.1,HW]]])mgBeam(T,a,b,.3,.2,K.c.tim);
 /* a hand rail on three sides (the ladder side open) */for(const[px,pz]of[[-HW-.15,-HW-.15],[HW+.15,-HW-.15],[-HW-.15,HW+.15],[HW+.15,HW+.15]])mgBeam(T,[px,.2,pz],[px,1.1,pz],.08,.08,K.c.tim2);
 mgBeam(T,[-HW-.15,1.05,-HW-.15],[HW+.15,1.05,-HW-.15],.07,.07,K.c.tim2);for(const s of[-1,1])mgBeam(T,[s*(HW+.15),1.05,-HW-.15],[s*(HW+.15),1.05,HW+.15],.07,.07,K.c.tim2);
 /* the lining: planks down the shaft, and the ladder from 1 m above the floor to the bottom */
 for(let y=0;y>-D;y-=.3)for(const[a,b]of[[[-HW,y-.14,-HW+.02],[HW,y-.14,-HW+.02]],[[-HW,y-.14,HW-.02],[HW,y-.14,HW-.02]],[[-HW+.02,y-.14,-HW+.04],[-HW+.02,y-.14,HW-.04]],[[HW-.02,y-.14,-HW+.04],[HW-.02,y-.14,HW-.04]]])mgBeam(T,a,b,.04,.28,[.5+K.r()*.1,.37,.24]);
 for(const sx of[-.22,.22])mgBeam(T,[sx,-D,HW-.12],[sx,1.0,HW-.12],.06,.08,K.c.tim);for(let y=-D+.3;y<.95;y+=.3)mgBeam(T,[-.22,y,HW-.12],[.22,y,HW-.12],.04,.04,K.c.tim2);
 G.add(mgMerge(T,K.TIMBV));const bt=new THREE.Mesh(new THREE.PlaneGeometry(2*HW,2*HW),M(0x050505));bt.rotation.x=-Math.PI/2;bt.position.y=-D;G.add(bt);
 dmSign(G,1.0,.42,['MANWAY','TO THE DEEP · 10 m'],'#e8dcc0','#2a1a0a',0,1.3,-HW-.15+.05);
 G.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{g:G,hole:{x0:x-HW,x1:x+HW,z0:z-HW,z1:z+HW},obs:[{x0:x-HW-.3,x1:x+HW+.3,z0:z-HW-.3,z1:z-HW},{x0:x-HW-.3,x1:x-HW,z0:z-HW-.3,z1:z+HW+.3},{x0:x+HW,x1:x+HW+.3,z0:z-HW-.3,z1:z+HW+.3}],top:[x,1.0,z+HW-.3]}}
function dmManwayFoot(g,x,z,HY,lv,HX){const K=dmKit(),M=K.M,G=new THREE.Group();G.position.set(x,0,z);g.add(G);HX=HX||4;const L=DMLV[lv||1],HW=.6,xe=Math.min(HX-.05,Math.abs(x)+HW+.2),Y0=HY-.6+L.vault*Math.sqrt(Math.max(0,1-(xe/HX)**2))-.05,Y1=Y0+4.5,T=[];
 for(let y=Y0;y<Y1;y+=.3)for(const[a,b]of[[[-HW,y+.14,-HW+.02],[HW,y+.14,-HW+.02]],[[-HW,y+.14,HW-.02],[HW,y+.14,HW-.02]],[[-HW+.02,y+.14,-HW+.04],[-HW+.02,y+.14,HW-.04]],[[HW-.02,y+.14,-HW+.04],[HW-.02,y+.14,HW-.04]]])mgBeam(T,a,b,.04,.28,[.5+K.r()*.1,.37,.24]);
 /* a collar frame under the roof hides the rock's ragged edge */for(const[a,b]of[[[-HW-.2,Y0-.08,-HW-.2],[HW+.2,Y0-.08,-HW-.2]],[[-HW-.2,Y0-.08,HW+.2],[HW+.2,Y0-.08,HW+.2]],[[-HW-.2,Y0-.08,-HW],[-HW-.2,Y0-.08,HW]],[[HW+.2,Y0-.08,-HW],[HW+.2,Y0-.08,HW]]])mgBeam(T,a,b,.4,.16,K.c.tim);
 for(const sx of[-.22,.22])mgBeam(T,[sx,0,HW-.12],[sx,Y1,HW-.12],.06,.08,K.c.tim);for(let y=.3;y<Y1;y+=.3)mgBeam(T,[-.22,y,HW-.12],[.22,y,HW-.12],.04,.04,K.c.tim2);
 G.add(mgMerge(T,K.TIMBV));const cp=new THREE.Mesh(new THREE.PlaneGeometry(2*HW,2*HW),M(0x050505));cp.rotation.x=Math.PI/2;cp.position.y=Y1;G.add(cp);
 G.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{g:G,hole:{x0:x-HW-.25,x1:x+HW+.25,z0:z-HW-.25,z1:z+HW+.25},obs:[{x0:x-.3,x1:x+.3,z0:z+HW-.2,z1:z+HW}]}}

/* =====================================================================================================
   Part 2, batch 2: the working rooms (spec part 2, rooms 5-10). Each builds its things inside an ordinary mine room
   (the shell, floor, sets and lanterns are the room's own) in room space (x ±HX, the entry wall at z 0, the exit at
   z -Z). o: {side (-1 left wall, 1 right wall), z (the middle of the thing along the room), HX, lv, seed}.
   Each returns {g, props:[{x, z, r, what}] (press-E spots in room space), obs:[{x0,x1,z0,z1}] (room space), lights
   (spots for pool lights), parts, tick(t, dt)}.
     dmMagazine(g, o)   the powder magazine: a red iron cupboard against the wall behind a DANGER sign, two doors
                        (parts.doors(k) 0 shut → 1 open), dynamite crates and a tray of sticks inside (parts.sticks:
                        hide one per player who takes one), a fire bucket and a NO NAKED LIGHTS sign. what 'magazine'.
     dmLampRoom(g, o)   racks of miners' lamps, the lamp tally board (brass tags on hooks, parts.tags), an oil drum
                        on a cradle with a tap, a workbench with a funnel and a lit lantern. what 'oil' (the drum).
     dmCanteen(g, o)    a table and two benches with lunch tins and mugs, a kettle on a little stove, a dresser with
                        drawers (parts.drawers: the game's drawer spots), a notice board. what 'kettle'.
     dmOffice(g, o)     a desk with drawers, a chair, an oil lamp, a filing cabinet, a shelf of ledgers, and the level
                        map on a board: parts.map(rooms) draws the next rooms, rooms = [{gas: true/false}, ...] (five).
                        what 'map' and 'desk'.
     dmChuteHole(HX, side, z)  where the chute's box hole cuts the rock: give it to the room's dmShell (holes).
     dmChute(g, sh, o)  an ore chute: a timber trough coming out of a timbered box hole high in the wall, down to a
                        gate over a little tub on a spur of track; a lever on the leg. parts.gate(k), parts.pour(k)
                        (0 → 1: the ore rattles down and the tub fills). Needs the room's shell (dmShell). what 'chute'.
     dmPump(g, o)       an old beam pump: a brick plinth with the steam cylinder, a 1.8 m flywheel, the rocking beam on
                        an A-frame, the pump rod down into a timber sump box of dark water, a riser pipe up the wall, a
                        valve wheel, a pressure gauge, steam from the exhaust. parts.run(k) (0 still → 1 full speed,
                        the game eases it), tick(t, dt) turns it. what 'pump' (the valve).
   ===================================================================================================== */
/* a point and a box given in a wall group's own space, in the room's space (the group stands on the wall, its +z
   pointing into the room) */
function dmWallG(g,side,z,HX,inset){const G=new THREE.Group();G.position.set(side*(HX-(inset||0)),0,z);G.rotation.y=-side*Math.PI/2;g.add(G);return G}
function dmL2R(G,lx,lz){const c=Math.cos(G.rotation.y),s=Math.sin(G.rotation.y);return[G.position.x+lx*c+lz*s,G.position.z-lx*s+lz*c]}
function dmObsR(G,x0,x1,z0,z1){const a=dmL2R(G,x0,z0),b=dmL2R(G,x1,z1);return{x0:Math.min(a[0],b[0]),x1:Math.max(a[0],b[0]),z0:Math.min(a[1],b[1]),z1:Math.max(a[1],b[1])}}
function dmProp(G,lx,lz,r,what){const p=dmL2R(G,lx,lz);return{x:p[0],z:p[1],r,what}}
function dmLabelTex(w,h,draw){return rtKit().tex(w,h,draw)}
function dmMagazine(g,o){const K=dmKit(),M=K.M,HX=o.HX||4,G=dmWallG(g,o.side,o.z,HX,.05),out={g:G,props:[],obs:[],lights:[],parts:{},tick:()=>{}};
 const RED=M(0x7a2418,{roughness:.55,metalness:.45}),RED2=M(0x5a1a12,{roughness:.6,metalness:.4}),IN=M(0x3a3632,{roughness:.8,metalness:.3});const W=1.4,H=1.9,D=.55;
 const B=(w,h,d,x,y,z,m,par)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);b.position.set(x,y,z);(par||G).add(b);return b};
 /* the body: back, sides, top, floor and two shelves, on little feet */B(W-.06,H-.03,.03,0,(H-.03)/2+.06,.015,RED);for(const s of[-1,1])B(.03,H-.03,D,s*(W/2-.015),(H-.03)/2+.06,D/2,RED);B(W,.03,D,0,H+.06-.015,D/2,RED);B(W-.06,.03,D-.03,0,.075,D/2+.015,IN);
 for(const y of[.62,1.18])B(W-.06,.025,D-.05,0,y,D/2+.01,IN);for(const s of[-1,1])for(const zz of[.08,D-.08])B(.06,.06,.06,s*(W/2-.06),.03,zz,RED2);
 /* the doors, hinged at the outer edges; a warning triangle on each */const tri=dmLabelTex(128,128,(x,w,h)=>{x.fillStyle='#7a2418';x.fillRect(0,0,w,h);x.fillStyle='#f0c020';x.beginPath();x.moveTo(64,14);x.lineTo(118,108);x.lineTo(10,108);x.closePath();x.fill();x.strokeStyle='#111';x.lineWidth=7;x.stroke();x.fillStyle='#111';x.font='bold 64px '+dmF();x.textAlign='center';x.fillText('!',64,98)});
 const doors=[];for(const s of[-1,1]){const hg=new THREE.Group();hg.position.set(s*(W/2-.015),.075,D);G.add(hg);const lf=B(W/2-.02,H-.04,.03,-s*(W/4-.01),(H-.04)/2+.005,.015,RED,hg);
  const tp=new THREE.Mesh(new THREE.PlaneGeometry(.42,.42),M(0xffffff,{map:tri,roughness:.6,polygonOffset:true,polygonOffsetUnits:-2}));tp.position.set(-s*(W/4-.01),1.0,.036);hg.add(tp);
  const hd=B(.03,.22,.04,-s*(W/2-.1),.95,.05,M(0x2a2a28,{metalness:.7,roughness:.4}),hg);doors.push({hg,s})}
 out.parts.doors=k=>doors.forEach(d=>d.hg.rotation.y=d.s*k*1.9);
 /* inside: two crates of EXPLOSIVES on the floor, a tray of sticks on the middle shelf */const ct=dmLabelTex(128,64,(x,w,h)=>{x.fillStyle='#a07a4a';x.fillRect(0,0,w,h);for(let i=0;i<h;i+=16){x.fillStyle='rgba(60,36,16,.4)';x.fillRect(0,i,w,1)}x.fillStyle='#8a1a10';x.font='bold 15px '+dmF();x.textAlign='center';x.fillText('EXPLOSIVES',64,30);x.font='bold 10px '+dmF();x.fillText('HANDLE WITH CARE',64,46)});
 for(const cx of[-.33,.33]){const c=new THREE.Mesh(new THREE.BoxGeometry(.55,.4,.4),[K.TIMB,K.TIMB,K.TIMB,K.TIMB,M(0xffffff,{map:ct,roughness:.9}),K.TIMB]);c.position.set(cx,.09+.2,D/2+.02);G.add(c)}
 B(.9,.04,.3,0,1.21,D/2,K.TIMB);const sticks=[];const SM=M(0xb02018,{roughness:.6}),FM=M(0x2a2a20,{roughness:.9});for(let i=0;i<4;i++){const st=new THREE.Group();st.position.set(-.13+(i%2)*.27,1.23+.035+(i>1?.07:0),D/2-.06+(i>1?.035:0)+(i%2?0:.07));G.add(st);const c=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.24,10),SM);c.rotation.z=Math.PI/2;st.add(c);const f=new THREE.Mesh(new THREE.CylinderGeometry(.005,.005,.09,4),FM);f.rotation.z=Math.PI/2-.5;f.position.set(.155,.02,0);st.add(f);sticks.push(st)}out.parts.sticks=sticks;
 /* the plate over the doors, a fire bucket on the side, a sign on a post */dmSign(G,1.0,.26,['DANGER · EXPLOSIVES'],'#c01810','#fff4e0',0,H+.06+.17,.1);{const pz=[];mgBeam(pz,[-.36,H+.06,.1],[-.36,H+.06+.06,.1],.05,.05,[.4,.38,.36]);mgBeam(pz,[.36,H+.06,.1],[.36,H+.06+.06,.1],.05,.05,[.4,.38,.36]);G.add(mgMerge(pz,K.IRONV))}
 {const bk=new THREE.Mesh(new THREE.CylinderGeometry(.15,.11,.28,14,1,true),M(0xc02818,{roughness:.5,metalness:.3,side:THREE.DoubleSide}));bk.position.set(W/2+.17,1.05,.3);G.add(bk);const bb=new THREE.Mesh(new THREE.CircleGeometry(.11,14),M(0xa02010));bb.rotation.x=-Math.PI/2;bb.position.set(W/2+.17,.911,.3);G.add(bb);
  const hk=B(.17,.03,.03,W/2+.075,1.2,.3,M(0x2a2a28,{metalness:.7}));const sand=new THREE.Mesh(new THREE.CircleGeometry(.14,14),M(0xc8b088,{roughness:1}));sand.rotation.x=-Math.PI/2;sand.position.set(W/2+.17,1.12,.3);G.add(sand);
  const hd=new THREE.Mesh(new THREE.TorusGeometry(.15,.008,4,16,Math.PI),M(0x3a3a38,{metalness:.7}));hd.position.set(W/2+.17,1.19,.3);G.add(hd)}
 {const P=[];mgBeam(P,[-W/2-.55,0,.35],[-W/2-.55,1.5,.35],.08,.08,K.c.tim);G.add(mgMerge(P,K.TIMBV));dmSign(G,.6,.42,['NO NAKED','LIGHTS'],'#f0e8d0','#8a1a10',-W/2-.55,1.25,.41)}
 out.parts.doors(0);out.obs.push(dmObsR(G,-W/2-.65,W/2+.35,0,D+.05));out.props.push(dmProp(G,0,D+.7,1.3,'magazine'));G.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return out}
function dmLantern(par,x,y,z,lit){const K=dmKit(),M=K.M,L=new THREE.Group();L.position.set(x,y,z);par.add(L);const BR=M(0xb08a40,{metalness:.8,roughness:.3});
 const base=new THREE.Mesh(new THREE.CylinderGeometry(.06,.07,.05,10),BR);base.position.y=.025;L.add(base);const gl=new THREE.Mesh(new THREE.CylinderGeometry(.05,.055,.12,10),lit?M(0xfff0c0,{emissive:0xffb040,emissiveIntensity:1.1}):M(0xd8e0e0,{roughness:.1,metalness:.2,transparent:true,opacity:.55}));gl.position.y=.11;L.add(gl);
 const cp=new THREE.Mesh(new THREE.ConeGeometry(.065,.07,10),BR);cp.position.y=.205;L.add(cp);const hd=new THREE.Mesh(new THREE.TorusGeometry(.04,.006,4,12,Math.PI),BR);hd.position.y=.24;L.add(hd);return L}
function dmLampRoom(g,o){const K=dmKit(),M=K.M,HX=o.HX||4,G=dmWallG(g,o.side,o.z,HX,.05),out={g:G,props:[],obs:[],lights:[],parts:{},tick:()=>{}};
 /* the lamp racks: a timber frame with three shelves, lamps standing in rows (a few gaps) */const T=[];const RW=2.4,RD=.35;for(const x of[-RW/2,0,RW/2])for(const zz of[.04,RD-.04])mgBeam(T,[x,0,zz],[x,1.75,zz],.07,.07,K.c.tim);
 for(const y of[.5,1.0,1.5])mgBeam(T,[-RW/2-.03,y,RD/2],[RW/2+.03,y,RD/2],RD-.02,.04,K.c.tim2);mgBeam(T,[-RW/2-.05,1.76,.04],[RW/2+.05,1.76,.04],.08,.08,K.c.tim2);G.add(mgMerge(T,K.TIMBV));
 let n=0;for(const y of[.52,1.02,1.52])for(let i=0;i<10;i++){if((i*7+y*13|0)%5==0)continue;const x=-RW/2+.12+i*.244;dmLantern(G,x,y,RD/2,false);n++}
 /* the tally board: a board on two legs, rows of brass tags on hooks */const tb=new THREE.Group();tb.position.set(RW/2+.9,0,.1);G.add(tb);{const P=[];for(const x of[-.5,.5])mgBeam(P,[x,0,0],[x,1.95,0],.07,.07,K.c.tim);tb.add(mgMerge(P,K.TIMBV));
  const bd=new THREE.Mesh(new THREE.BoxGeometry(1.1,.8,.04),M(0x2a3a2a,{roughness:.8}));bd.position.set(0,1.45,.055);tb.add(bd);dmSign(tb,.9,.16,['LAMP CHECKS'],'#e8dcc0','#1a1a1a',0,1.94,.06);
  const tags=[],TB=M(0xc8a040,{metalness:.85,roughness:.3});for(let r=0;r<4;r++)for(let c=0;c<6;c++){const hx=-.4+c*.16,hy=1.75-r*.17;const pin=new THREE.Mesh(new THREE.CylinderGeometry(.006,.006,.03,4),TB);pin.rotation.x=Math.PI/2;pin.position.set(hx,hy,.09);tb.add(pin);if((r*6+c)%7==3)continue;const tg=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,.006,12),TB);tg.rotation.x=Math.PI/2;tg.position.set(hx,hy-.045,.082);tb.add(tg);tags.push(tg)}out.parts.tags=tags}
 /* the oil drum on a cradle, with its tap and drip tray */const dz=RW/2+2.1;{const P=[];for(const x of[-.35,.35]){mgBeam(P,[dz+x,0,.2],[dz+x,.34,.2],.09,.09,K.c.tim);mgBeam(P,[dz+x,0,.75],[dz+x,.34,.75],.09,.09,K.c.tim);mgBeam(P,[dz+x,.36,.15],[dz+x,.36,.8],.1,.06,K.c.tim2)}G.add(mgMerge(P,K.TIMBV));
  const dr=new THREE.Mesh(new THREE.CylinderGeometry(.29,.29,.88,18),M(0x2a4a6a,{metalness:.5,roughness:.45}));dr.rotation.z=Math.PI/2;dr.position.set(dz,.39+.29,.475);G.add(dr);for(const x of[-.22,.22]){const rb=new THREE.Mesh(new THREE.TorusGeometry(.292,.012,4,24),M(0x1a2a3a,{metalness:.6}));rb.rotation.y=Math.PI/2;rb.position.set(dz+x,.68,.475);G.add(rb)}
  const tp=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.1,8),M(0xb08a40,{metalness:.8,roughness:.3}));tp.rotation.z=Math.PI/2;tp.position.set(dz+.49,.6,.475);G.add(tp);const tp2=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,.08,8),M(0xb08a40,{metalness:.8}));tp2.position.set(dz+.53,.55,.475);G.add(tp2);
  const tr=new THREE.Mesh(new THREE.BoxGeometry(.3,.04,.3),M(0x3a3a38,{metalness:.5,roughness:.5}));tr.position.set(dz+.6,.02,.475);G.add(tr);dmSign(G,.5,.22,['LAMP OIL'],'#e8dcc0','#2a1a0a',dz,.68,.775)}
 /* the bench: a top on four legs, a funnel and a lit lantern */const bx=-RW/2-1.0;{const P=[];mgBeam(P,[bx-.6,.88,.35],[bx+.6,.88,.35],.55,.06,K.c.tim2);for(const x of[-.55,.55])for(const zz of[.12,.58])mgBeam(P,[bx+x,0,zz],[bx+x,.85,zz],.07,.07,K.c.tim);G.add(mgMerge(P,K.TIMBV));
  const fn=new THREE.Mesh(new THREE.CylinderGeometry(.1,.015,.16,12,1,true),M(0x8a8a88,{metalness:.7,roughness:.35,side:THREE.DoubleSide}));fn.position.set(bx+.25,.91+.13,.35);G.add(fn);const fs=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.07,6),M(0x8a8a88,{metalness:.7}));fs.position.set(bx+.25,.945,.35);G.add(fs);
  dmLantern(G,bx-.3,.91,.35,true);const lp=dmL2R(G,bx-.3,.6);out.lights.push([lp[0],1.2,lp[1]])}
 out.obs.push(dmObsR(G,bx-.65,dz+.7,0,.85));out.props.push(dmProp(G,dz+.55,1.2,1.1,'oil'));G.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return out}
function dmCanteen(g,o){const K=dmKit(),M=K.M,HX=o.HX||4,G=dmWallG(g,o.side,o.z,HX,0),out={g:G,props:[],obs:[],lights:[],parts:{},tick:()=>{}};const T=[];
 /* the table (along the wall, 1.3 m out) and two benches */const tz=1.3;mgBeam(T,[-1.1,.76,tz],[1.1,.76,tz],.8,.05,K.c.tim2);for(const x of[-1.0,1.0])for(const dz of[-.3,.3])mgBeam(T,[x,0,tz+dz],[x,.735,tz+dz],.07,.07,K.c.tim);mgBeam(T,[-1.0,.2,tz],[1.0,.2,tz],.05,.05,K.c.tim);
 for(const bz of[.55,2.05]){mgBeam(T,[-1.0,.45,bz],[1.0,.45,bz],.3,.05,K.c.tim2);for(const x of[-.85,.85])mgBeam(T,[x,0,bz],[x,.425,bz],.25,.06,K.c.tim)}
 /* the dresser further along: drawers below, plates on the rack above */const dx=2.2;mgBeam(T,[dx-.6,.9,.3],[dx+.6,.9,.3],.5,.04,K.c.tim2);for(const x of[-.58,.58])mgBeam(T,[dx+x,0,.3],[dx+x,.88,.3],.5,.04,K.c.tim);mgBeam(T,[dx-.55,.45,.08],[dx+.55,.45,.08],.03,.86,K.c.tim2);mgBeam(T,[dx-.55,.025,.3],[dx+.55,.025,.3],.46,.04,K.c.tim2);
 for(const x of[-.58,.58])mgBeam(T,[dx+x,.92,.1],[dx+x,1.75,.1],.12,.05,K.c.tim);for(const y of[1.25,1.72])mgBeam(T,[dx-.6,y,.1],[dx+.6,y,.1],.14,.03,K.c.tim2);mgBeam(T,[dx-.55,1.33,.045],[dx+.55,1.33,.045],.02,.8,K.c.tim2);
 G.add(mgMerge(T,K.TIMBV));const drawers=[];for(let i=0;i<2;i++)for(let j=0;j<2;j++){const d=new THREE.Mesh(new THREE.BoxGeometry(.52,.36,.04),M(0xffffff,{map:K.PLANKT,roughness:.85}));d.position.set(dx-.28+i*.56,.25+j*.42,.56);G.add(d);const kb=new THREE.Mesh(new THREE.SphereGeometry(.025,8,6),M(0x2a2a28,{metalness:.6}));kb.position.set(dx-.28+i*.56,.25+j*.42,.59);G.add(kb);drawers.push(dmProp(G,dx-.28+i*.56,.9,.6,'drawer'))}out.parts.drawers=drawers;
 for(let i=0;i<4;i++){const pl=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,.015,16),M(0xe8e4dc,{roughness:.4}));pl.rotation.x=Math.PI/2-.2;pl.position.set(dx-.4+i*.26,1.367,.11);G.add(pl)}
 {const rl=[];mgBeam(rl,[dx-.555,1.32,.165],[dx+.555,1.32,.165],.02,.03,K.c.tim2);G.add(mgMerge(rl,K.TIMBV))}/* the plate rail that holds them */
 /* lunch tins and mugs on the table */const TIN=M(0x6a6e66,{metalness:.6,roughness:.4}),MUG=M(0xe0dcd0,{roughness:.4});for(const[x,zz,ry]of[[-.75,1.05,.2],[.1,1.55,-.3],[.7,1.08,.1]]){const t=new THREE.Mesh(new THREE.BoxGeometry(.24,.1,.16),TIN);t.position.set(x,.785+.05,tz+zz-1.3);t.rotation.y=ry;G.add(t);const h=new THREE.Mesh(new THREE.TorusGeometry(.04,.006,4,10,Math.PI),TIN);h.position.set(x,.885,tz+zz-1.3);h.rotation.y=ry;G.add(h)}
 for(const[x,zz]of[[-.4,1.5],[.45,1.1],[.95,1.5]]){const m=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,.09,10),MUG);m.position.set(x,.83,zz);G.add(m);const hd=new THREE.Mesh(new THREE.TorusGeometry(.025,.006,4,8),MUG);hd.position.set(x+.045,.83,zz);G.add(hd)}
 /* the stove: an iron box on legs with a chimney into the dark, and the kettle */const sx=-2.0;{const IR=M(0x2a2826,{metalness:.5,roughness:.6});const st=new THREE.Mesh(new THREE.BoxGeometry(.5,.45,.45),IR);st.position.set(sx,.2+.225,.4);G.add(st);for(const x of[-.2,.2])for(const zz of[.22,.58]){const l=new THREE.Mesh(new THREE.BoxGeometry(.04,.2,.04),IR);l.position.set(sx+x,.1,zz);G.add(l)}
  const fd=new THREE.Mesh(new THREE.PlaneGeometry(.22,.16),M(0x3a1a08,{emissive:0xff6020,emissiveIntensity:.8}));fd.position.set(sx,.4,.632);G.add(fd);const ch=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,3.3,10),IR);ch.position.set(sx-.12,.65+1.65,.3);G.add(ch);
  const kt=new THREE.Mesh(new THREE.SphereGeometry(.12,14,10),M(0x8a8e90,{metalness:.8,roughness:.25}));kt.scale.set(1,.8,1);kt.position.set(sx+.06,.65+.09,.45);G.add(kt);const sp=new THREE.Mesh(new THREE.CylinderGeometry(.012,.02,.14,6),M(0x8a8e90,{metalness:.8}));sp.rotation.z=-1;sp.position.set(sx+.19,.65+.13,.45);G.add(sp);
  const hd=new THREE.Mesh(new THREE.TorusGeometry(.08,.008,4,12,Math.PI),M(0x2a2a28,{metalness:.6}));hd.position.set(sx+.06,.65+.17,.45);G.add(hd);const lp=dmL2R(G,sx,.9);out.lights.push([lp[0],.6,lp[1]])}
 /* the notice board on two legs */{const P=[];for(const x of[-.45,.45])mgBeam(P,[-3.4+x,0,.12],[-3.4+x,1.9,.12],.06,.06,K.c.tim);G.add(mgMerge(P,K.TIMBV));const nb=dmLabelTex(256,200,(x,w,h)=>{x.fillStyle='#7a5a3a';x.fillRect(0,0,w,h);const notes=[['NO SNAP ON','THE TRACKS'],['WASH YOUR','HANDS'],['LAMPS BACK','BY 6']];notes.forEach((n,i)=>{const nx=12+i*80,ny=20+(i%2)*60;x.fillStyle='#f0ead8';x.save();x.translate(nx+35,ny+40);x.rotate((i-1)*.06);x.fillRect(-35,-40,70,80);x.fillStyle='#2a2a2a';x.font='bold 11px '+dmF();x.textAlign='center';x.fillText(n[0],0,-8);x.fillText(n[1],0,8);x.fillStyle='#b02018';x.beginPath();x.arc(0,-34,3,0,7);x.fill();x.restore()})});
  const b=new THREE.Mesh(new THREE.BoxGeometry(1.1,.86,.03),[K.TIMB,K.TIMB,K.TIMB,K.TIMB,M(0xffffff,{map:nb,roughness:.9}),K.TIMB]);b.position.set(-3.4,1.4,.165);G.add(b)}
 out.obs.push(dmObsR(G,-1.15,1.15,.38,2.22),dmObsR(G,dx-.65,dx+.65,0,.6),dmObsR(G,sx-.3,sx+.3,.15,.65),dmObsR(G,-3.95,-2.85,0,.25));out.props.push(dmProp(G,sx,1.1,.9,'kettle'));G.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return out}
function dmOffice(g,o){const K=dmKit(),M=K.M,HX=o.HX||4,G=dmWallG(g,o.side,o.z,HX,0),out={g:G,props:[],obs:[],lights:[],parts:{},tick:()=>{}};const T=[];
 /* the desk: a top on two pedestals of drawers, facing out into the room; the chair behind it */const dz=1.2;mgBeam(T,[-.8,.78,dz],[.8,.78,dz],.8,.05,K.c.tim2);for(const x of[-.6,.6]){mgBeam(T,[x,0,dz],[x,.755,dz],.7,.36,K.c.tim);}mgBeam(T,[-.4,.4,dz-.36],[.4,.4,dz-.36],.04,.7,K.c.tim);
 const CH=[];mgBeam(CH,[-.22,.46,dz+.75],[.22,.46,dz+.75],.42,.05,K.c.tim2);for(const x of[-.19,.19])for(const zz of[.56,.94])mgBeam(CH,[x,0,dz+zz],[x,.435,dz+zz],.04,.04,K.c.tim);for(const x of[-.19,.19])mgBeam(CH,[x,.485,dz+.94],[x,1.0,dz+.96],.04,.04,K.c.tim);mgBeam(CH,[-.23,.92,dz+.99],[.23,.92,dz+.99],.03,.14,K.c.tim2);
 G.add(mgMerge(T.concat(CH),K.TIMBV));for(let j=0;j<3;j++)for(const x of[-.6,.6]){const d=new THREE.Mesh(new THREE.BoxGeometry(.3,.2,.02),M(0xffffff,{map:K.PLANKT,roughness:.85}));d.position.set(x,.14+j*.22,dz+.36);G.add(d);const kb=new THREE.Mesh(new THREE.SphereGeometry(.018,8,6),M(0xb08a40,{metalness:.8}));kb.position.set(x,.14+j*.22,dz+.38);G.add(kb)}
 /* on the desk: papers, an inkwell, an oil lamp (lit) */const PP=M(0xf0ead8,{roughness:.9,polygonOffset:true,polygonOffsetUnits:-2});[[-.3,dz+.1,.2],[-.15,dz-.1,-.15],[.2,dz+.05,.4]].forEach(([x,zz,r],i)=>{const p=new THREE.Mesh(new THREE.PlaneGeometry(.21,.29),PP);p.rotation.set(-Math.PI/2,0,r);p.position.set(x,.809+i*.003,zz);G.add(p)})
 {const ink=new THREE.Mesh(new THREE.CylinderGeometry(.03,.035,.05,10),M(0x1a1a2a,{roughness:.2,metalness:.3}));ink.position.set(.05,.83,dz-.15);G.add(ink);dmLantern(G,.55,.805,dz-.2,true);const lp=dmL2R(G,.55,dz);out.lights.push([lp[0],1.3,lp[1]])}
 /* the filing cabinet and the ledger shelf against the wall */{const FC=M(0x5a6658,{metalness:.5,roughness:.5});const fc=new THREE.Mesh(new THREE.BoxGeometry(.5,1.3,.6),FC);fc.position.set(1.5,.65,.32);G.add(fc);for(let j=0;j<3;j++){const h=new THREE.Mesh(new THREE.BoxGeometry(.14,.03,.03),M(0xb08a40,{metalness:.8}));h.position.set(1.5,.3+j*.42,.635);G.add(h);const lb=new THREE.Mesh(new THREE.PlaneGeometry(.1,.05),M(0xf0ead8,{polygonOffset:true,polygonOffsetUnits:-2}));lb.position.set(1.5,.36+j*.42,.625);G.add(lb)}
  const S=[];for(const x of[-1.75,-.95])mgBeam(S,[x,0,.15],[x,1.95,.15],.06,.06,K.c.tim);for(const y of[1.3,1.9])mgBeam(S,[-1.8,y,.17],[-.9,y,.17],.3,.04,K.c.tim2);G.add(mgMerge(S,K.TIMBV));
  const LC=[0x5a2018,0x1a3a2a,0x2a2a4a,0x6a4a1a];for(let i=0;i<9;i++){const b=new THREE.Mesh(new THREE.BoxGeometry(.06,.26+(i%3)*.02,.2),M(LC[i%4],{roughness:.7}));b.position.set(-1.7+i*.075,1.32+.13+(i%3)*.01,.17);b.rotation.z=i==8?.25:0;G.add(b)}}
 /* the level map on a board: parts.map(rooms) */const mc=document.createElement('canvas');mc.width=512;mc.height=320;const mt=new THREE.CanvasTexture(mc);mt.anisotropy=4;
 const drawMap=rooms=>{const x=mc.getContext('2d');x.fillStyle='#e8dcbc';x.fillRect(0,0,512,320);for(let i=0;i<500;i++){x.fillStyle='rgba(120,90,50,'+Math.random()*.08+')';x.fillRect(Math.random()*512,Math.random()*320,3,3)}
  x.fillStyle='#3a2a18';x.font='bold 30px '+dmF();x.textAlign='center';x.fillText('LEVEL PLAN · THE NEXT FIVE',256,40);x.strokeStyle='#3a2a18';x.lineWidth=4;
  const n=rooms.length,bw=78,gap=18,x0=(512-(n*bw+(n-1)*gap))/2;rooms.forEach((rm,i)=>{const rx=x0+i*(bw+gap);x.strokeRect(rx,110,bw,90);x.fillStyle='#3a2a18';x.font='bold 22px '+dmF();x.fillText(String(i+1),rx+bw/2,230);if(i<n-1){x.beginPath();x.moveTo(rx+bw,155);x.lineTo(rx+bw+gap,155);x.stroke()}
   if(rm.gas){x.fillStyle='rgba(90,150,60,.55)';for(let k=0;k<6;k++){x.beginPath();x.arc(rx+16+k*10,180-Math.sin(k*1.7)*10,12,0,7);x.fill()}x.fillStyle='#b02018';x.font='bold 26px '+dmF();x.fillText('GAS',rx+bw/2,160);x.strokeStyle='#b02018';x.lineWidth=3;x.strokeRect(rx-6,104,bw+12,102);x.strokeStyle='#3a2a18';x.lineWidth=4}});
  x.fillStyle='#5a3a1a';x.font='italic 18px '+dmF();x.fillText('Keep your lamp lit and your head down. · The Foreman',256,290);mt.needsUpdate=true};drawMap([{},{gas:1},{},{},{gas:1}]);out.parts.map=drawMap;
 {const P=[];for(const x of[-.75,.75])mgBeam(P,[2.6+x,0,.1],[2.6+x,2.2,.1],.07,.07,K.c.tim);G.add(mgMerge(P,K.TIMBV));const b=new THREE.Mesh(new THREE.BoxGeometry(1.7,1.06,.04),[K.TIMB,K.TIMB,K.TIMB,K.TIMB,M(0xffffff,{map:mt,roughness:.85}),K.TIMB]);b.position.set(2.6,1.55,.155);G.add(b)}
 out.obs.push(dmObsR(G,-.85,.85,dz-.42,dz+.42),dmObsR(G,-.25,.25,dz+.5,dz+1.0),dmObsR(G,1.2,1.8,0,.65),dmObsR(G,-1.85,-.85,0,.32),dmObsR(G,1.8,3.4,0,.2));out.props.push(dmProp(G,2.6,.9,1,'map'),dmProp(G,0,dz+1.4,.8,'desk'));G.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return out}
/* where the ore chute's box hole cuts the rock: pass it in the room's dmShell holes */
function dmChuteHole(HX,side,z){const yb=2.35,yt=3.4;return{x0:side<0?-HX-2:HX-.6,x1:side<0?-HX+.6:HX+2,z0:z-.62,z1:z+.62,y0:yb-.05,y1:yt+.05,yb,yt}}
function dmChute(g,sh,o){const K=dmKit(),M=K.M,HX=sh.HX,side=o.side,z=o.z,G=new THREE.Group();g.add(G);const out={g:G,props:[],obs:[],lights:[],parts:{},tick:()=>{}};const V=THREE.Vector3;
 /* the box hole is cut into the rock: the room's shell leaves a hole there (dmChuteHole, pass it to dmShell's
    holes), the timber set stands just behind the rock's farthest point so the rough rock edge laps over it, and a
    plank backing behind everything closes the cut; the lining runs back to it and the opening is dark. */
 const CH=dmChuteHole(HX,side,z),yb=CH.yb,yt=CH.yt,xm=side*(HX-1.65),y1=1.55,T=[];let far=0;for(let k=0;k<=10;k++)for(let m=0;m<=8;m++){const yy=yb-.4+(yt-yb+.8)*m/8,zz=z-.95+1.9*k/10;let lo=0,hi=.5;for(let it=0;it<18;it++){const mid=(lo+hi)/2,a=sh.at(zz,side<0?mid*.5:1-mid*.5);(a.p[1]<yy?lo=mid:hi=mid)}const a=sh.at(zz,side<0?lo*.5:1-lo*.5);far=Math.max(far,Math.abs(a.p[0]))}
 const xf=far+.02,xb=far+.26,xw=side*(xf+.08);
 for(const dz of[-.55,.55])mgBeam(T,[xw,yb,z+dz],[xw,yt,z+dz],.16,.16,K.c.tim);for(const y of[yb,yt])mgBeam(T,[xw,y,z-.71],[xw,y,z+.71],.2,.16,K.c.tim2);
 for(const dz of[-.45,.45])mgBeam(T,[side*(xf+.1),(yb+yt)/2,z+dz],[side*(xb-.005),(yb+yt)/2,z+dz],.04,yt-yb-.12,K.c.tim2);for(const y of[yb+.09,yt-.09])mgBeam(T,[side*(xf+.1),y,z],[side*(xb-.005),y,z],.86,.04,K.c.tim2);
 for(let dz=-.9;dz<.91;dz+=.3)mgBeam(T,[side*(xb+.035),yb-.5,z+dz],[side*(xb+.035),yt+.5,z+dz],.28,.04,[.5+K.r()*.1,.37,.24]);/* the backing planks */
 const hole=new THREE.Mesh(new THREE.PlaneGeometry(.86,yt-yb-.16),M(0x050403));hole.rotation.y=-side*Math.PI/2;hole.position.set(side*(xb-.01),(yb+yt)/2,z);G.add(hole);
 const y0=yb+.17;
 /* the trough: a floor and two sides of planks, sloping down from inside the hole to the mouth */const A=new V(side*(xb-.04),y0+.03,z),Bm=new V(xm,y1,z),d=new V().subVectors(Bm,A),L=d.length(),ang=Math.atan2(-d.y,Math.abs(d.x));
 const tr=new THREE.Group();tr.position.copy(A);tr.rotation.y=side>0?Math.PI:0;G.add(tr);const tr2=new THREE.Group();tr2.rotation.z=-ang;tr.add(tr2);const TT=[];
 mgBeam(TT,[0,0,0],[L,0,0],.7,.05,K.c.tim2);for(const s of[-1,1])mgBeam(TT,[0,.2,s*.375],[L,.2,s*.375],.05,.38,K.c.tim);for(let x=.6;x<L-.3;x+=1.1)mgBeam(TT,[x,-.06,-.42],[x,-.06,.42],.08,.06,K.c.tim2);/* battens under the floor */
 tr2.add(mgMerge(TT,K.TIMBV));
 /* two legs under the mouth, a cross brace, the gate (a plank door sliding up) and its lever */
 for(const s of[-1,1])mgBeam(T,[xm+side*.12,0,z+s*.42],[xm+side*.12,y1-.05,z+s*.42],.12,.12,K.c.tim);mgBeam(T,[xm+side*.12,.6,z-.42],[xm+side*.12,y1-.3,z+.42],.08,.08,K.c.tim2);
 for(const s of[-1,1])mgBeam(T,[xm,y1-.02,z+s*.42],[xm,y1+.95,z+s*.42],.08,.08,K.c.tim);mgBeam(T,[xm,y1+.95,z-.48],[xm,y1+.95,z+.48],.1,.1,K.c.tim2);G.add(mgMerge(T,K.TIMBV));
 const gate=new THREE.Mesh(new THREE.BoxGeometry(.05,.62,.74),M(0xffffff,{map:K.PLANKT,roughness:.9}));gate.position.set(xm-side*.06,y1+.3,z);G.add(gate);out.parts.gate=k=>{gate.position.y=y1+.3+k*.55};
 const lv=new THREE.Group();lv.position.set(xm+side*.12,1.1,z+.5);G.add(lv);{const h=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.7,6),M(0x3a3a38,{metalness:.6}));h.position.y=.32;lv.add(h);const kn=new THREE.Mesh(new THREE.SphereGeometry(.045,8,6),M(0x1a1a1a));kn.position.y=.68;lv.add(kn)}
 /* the tub on a short spur of track under the mouth */const S=[];for(let s=-1.5;s<=1.5;s+=.5){mgPut(S,new THREE.BoxGeometry(1.0,.06,.16),xm-side*.55,.03,z+s,0,K.c.tim2)}for(const dx of[-.3,.3]){const rl=new THREE.BoxGeometry(.05,.07,3.4);mgPut(S,rl,xm-side*.55+dx,.095,z,0,[.5,.47,.44])}G.add(mgMerge(S,K.TIMBV));
 const tub=new THREE.Group();tub.position.set(xm-side*.55,0,z);G.add(tub);{const TM=M(0x5a6258,{metalness:.5,roughness:.55,map:K.RUSTT});const sh2=new THREE.CylinderGeometry(.62,.5,.55,4,1,true);sh2.rotateY(Math.PI/4);const tb=new THREE.Mesh(sh2,TM);tb.material.side=THREE.DoubleSide;tb.scale.set(1,1,1.3);tb.position.y=.62;tub.add(tb);
  const bt=new THREE.Mesh(new THREE.BoxGeometry(.7,.04,.92),TM);bt.position.y=.36;tub.add(bt);for(const dx of[-.3,.3])for(const dz of[-.32,.32]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,.06,12),M(0x2a2a28,{metalness:.6}));w.rotation.z=Math.PI/2;w.position.set(dx,.2,dz);tub.add(w)}const ax=new THREE.Mesh(new THREE.BoxGeometry(.56,.08,.7),M(0x2a2a28,{metalness:.6}));ax.position.y=.26;tub.add(ax)}
 /* the ore: a heap in the tub that grows, and lumps that rattle down the trough */const L2=[];for(let i=0;i<26;i++){const a=K.r()*6.28,dd=Math.sqrt(K.r());K.rock(L2,.07+K.r()*.05,Math.cos(a)*dd*.4,0,Math.sin(a)*dd*.5,i*2.3,[[.62,.5,.4],[.55,.42,.34],[.78,.45,.25]][i%3])}const heap=mgMerge(L2,K.STONEV);tub.add(heap);
 const lumps=[];for(let i=0;i<8;i++){const L3=[];K.rock(L3,.08+K.r()*.04,0,0,0,i*5.1,[.6,.48,.38]);const m=mgMerge(L3,K.STONEV);G.add(m);m.visible=false;lumps.push(m)}
 out.parts.pour=k=>{heap.visible=k>.05;heap.position.y=.4+.3*Math.min(1,k);heap.scale.set(.7+.3*k,.4+.6*k,.7+.3*k);lumps.forEach((m,i)=>{const t=k*3-i*.18;const f=t-Math.floor(t);const on=k>0&&k<.98;m.visible=on;if(!on)return;const p=new V().lerpVectors(A,Bm,Math.min(1,f*1.25));p.y+=.12;if(f>.8){const u=(f-.8)/.2;p.x=xm-side*.4*u;p.y=y1-u*.8}m.position.copy(p).add(new V(0,0,(i%3-1)*.15));m.rotation.set(f*9,i,f*5)})};out.parts.pour(0);
 out.obs.push({x0:Math.min(xm-side*1.25,xm+side*.3),x1:Math.max(xm-side*1.25,xm+side*.3),z0:z-1.7,z1:z+1.7});const lp=[xm,0,z+.5];out.props.push({x:xm-side*.3,z:z+.9,r:1,what:'chute'});
 G.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return out}
function dmPump(g,o){const K=dmKit(),M=K.M,HX=o.HX||4,G=dmWallG(g,o.side,o.z,HX,0),out={g:G,props:[],obs:[],lights:[],parts:{},tick:()=>{}};const V=THREE.Vector3;
 const IR=M(0x3a3e3a,{metalness:.55,roughness:.5}),IR2=M(0x2a2c2a,{metalness:.6,roughness:.45}),BRS=M(0xb08a40,{metalness:.85,roughness:.3});
 const brick=rtKit().tex(128,128,(x,w,h)=>{x.fillStyle='#5a2a1a';x.fillRect(0,0,w,h);for(let r=0;r<8;r++)for(let c=-1;c<5;c++){const ox=r%2?16:0,v=.8+Math.random()*.3;x.fillStyle='rgb('+(150*v|0)+','+(70*v|0)+','+(45*v|0)+')';x.fillRect(c*32+ox+1,r*16+1,30,14)}});
 /* the plinth along the wall: brick, 3.4 m long, 0.9 high; the steam cylinder lying on it */const PL=new THREE.Mesh(new THREE.BoxGeometry(2.4,.9,1.1),M(0xffffff,{map:brick,roughness:.9}));PL.position.set(-1.1,.45,.7);G.add(PL);
 const cy=new THREE.Mesh(new THREE.CylinderGeometry(.34,.34,1.4,20),IR);cy.rotation.z=Math.PI/2;cy.position.set(-1.4,.9+.34+.02,.7);G.add(cy);for(const x of[-.72,.72]){const f=new THREE.Mesh(new THREE.CylinderGeometry(.4,.4,.06,20),IR2);f.rotation.z=Math.PI/2;f.position.set(-1.4+x,1.26,.7);G.add(f)}
 for(const x of[-.5,.5]){const b=new THREE.Mesh(new THREE.BoxGeometry(.1,.12,.5),IR2);b.position.set(-1.4+x,.96,.7);G.add(b)}
 /* the flywheel at the right end of the plinth (axle into the wall), crank and rod */const FX=.95,FY=1.55,FR=.9;/* the flywheel stands on the floor beyond the plinth's end */const fw=new THREE.Group();fw.position.set(FX,FY,.95);G.add(fw);
 {const rim=new THREE.Mesh(new THREE.TorusGeometry(FR,.07,8,36),IR);fw.add(rim);for(let i=0;i<12;i++){const ge=new THREE.BoxGeometry(.06,FR-.14,.05);ge.translate(0,(FR+.1)/2,0);const sp=new THREE.Mesh(ge,IR);sp.rotation.z=i*Math.PI/6;fw.add(sp)}const hb=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,.14,14),IR2);hb.rotation.x=Math.PI/2;fw.add(hb)}
 for(const zz of[.55,1.25]){const st=[];mgBeam(st,[FX-.45,0,zz],[FX-.06,FY-.2,zz],.12,.12,[.36,.38,.36]);mgBeam(st,[FX+.45,0,zz],[FX+.06,FY-.2,zz],.12,.12,[.36,.38,.36]);mgPut(st,new THREE.BoxGeometry(.3,.3,.16),FX,FY-.1,zz,0,[.3,.32,.3]);G.add(mgMerge(st,K.IRONV))}
 const ax=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.95,10),BRS);ax.rotation.x=Math.PI/2;ax.position.set(FX,FY,.85);G.add(ax);
 const crankP=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,.14,8),BRS);crankP.rotation.x=Math.PI/2;G.add(crankP);const rod=new THREE.Mesh(new THREE.BoxGeometry(1,.07,.07),IR2);G.add(rod);
 /* the A-frame and the rocking beam over the sump; the pump rod down into the water */const AX=2.75,AY=3.1;{const P=[];for(const zz of[.35,1.05]){mgBeam(P,[AX-.55,0,zz],[AX,AY,zz],.18,.18,K.c.tim);mgBeam(P,[AX+.55,0,zz],[AX,AY,zz],.18,.18,K.c.tim)}mgBeam(P,[AX,AY,.25],[AX,AY,1.15],.16,.16,K.c.tim2);mgBeam(P,[AX-.38,1.0,.35],[AX+.38,1.0,.35],.1,.1,K.c.tim2);mgBeam(P,[AX-.38,1.0,1.05],[AX+.38,1.0,1.05],.1,.1,K.c.tim2);G.add(mgMerge(P,K.TIMBV))}
 const bm=new THREE.Group();bm.position.set(AX,AY+.14,.7);G.add(bm);{const b=new THREE.Mesh(new THREE.BoxGeometry(2.6,.16,.14),IR);bm.add(b);for(const x of[-1.3,1.3]){const e=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.18,12),IR2);e.rotation.x=Math.PI/2;e.position.x=x;bm.add(e)}}
 const prod=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,2.6,8),IR2);G.add(prod);const crod=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,1,8),IR2);G.add(crod);
 /* the sump box (timber, 0.6 m high) with dark water, beside the plinth's far end */const SX=AX+1.3;{const P=[];for(const[a,b]of[[[SX-.7,.3,.0],[SX+.7,.3,.0]],[[SX-.7,.3,1.4],[SX+.7,.3,1.4]]])mgBeam(P,a,b,.1,.6,K.c.tim);for(const x of[-.65,.65])mgBeam(P,[SX+x,.3,.05],[SX+x,.3,1.35],.1,.6,K.c.tim);G.add(mgMerge(P,K.TIMBV));
  const w=new THREE.Mesh(new THREE.PlaneGeometry(1.2,1.3),M(0x0e1416,{roughness:.05,metalness:.6}));w.rotation.x=-Math.PI/2;w.position.set(SX,.45,.7);G.add(w);out.water=w}
 /* the riser pipe from the sump up the wall into the roof, the exhaust pipe, the valve wheel, the gauge */const PM=M(0xffffff,{map:K.RUSTT,metalness:.5,roughness:.6});{const p=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,3.6,12),PM);p.position.set(SX+.45,.3+1.8,.15);G.add(p);const p2=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.6,12),PM);p2.rotation.x=Math.PI/2;p2.position.set(SX+.45,.45,.45);G.add(p2);const el=new THREE.Mesh(new THREE.SphereGeometry(.1,10,8),PM);el.position.set(SX+.45,.45,.15);G.add(el)}
 const ex=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,1.6,10),IR2);ex.position.set(-1.9,1.26+.8,.7);G.add(ex);
 const vw=new THREE.Group();vw.position.set(-.9,1.35,1.12);G.add(vw);{const r=new THREE.Mesh(new THREE.TorusGeometry(.16,.018,6,18),M(0xa02018,{metalness:.4,roughness:.5}));vw.add(r);for(let i=0;i<6;i++){const ge=new THREE.BoxGeometry(.13,.02,.02);ge.translate(.095,0,0);const s=new THREE.Mesh(ge,M(0xa02018,{metalness:.4}));s.rotation.z=i*Math.PI/3;vw.add(s)}{const hb=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.034,10),M(0x6a1810,{metalness:.4}));hb.rotation.x=Math.PI/2;vw.add(hb)}const st=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.14,8),IR2);st.rotation.x=Math.PI/2;st.position.z=-.07;vw.add(st)}
 const gauge=new THREE.Group();gauge.position.set(-1.4,1.82,.7);G.add(gauge);{const st=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,.2,6),BRS);st.position.y=-.12;gauge.add(st);const bd=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,.05,18),BRS);bd.rotation.x=Math.PI/2;gauge.add(bd);
  const ft=dmLabelTex(64,64,(x,w,h)=>{x.fillStyle='#f0ead8';x.beginPath();x.arc(32,32,30,0,7);x.fill();x.strokeStyle='#2a2a2a';x.lineWidth=2;for(let i=0;i<9;i++){const a=Math.PI*.75+i*Math.PI*1.5/8;x.beginPath();x.moveTo(32+Math.cos(a)*22,32+Math.sin(a)*22);x.lineTo(32+Math.cos(a)*28,32+Math.sin(a)*28);x.stroke()}x.strokeStyle='#b02018';x.beginPath();x.arc(32,32,25,Math.PI*.25-.4,Math.PI*.25);x.stroke()});
  const fc=new THREE.Mesh(new THREE.CircleGeometry(.105,18),M(0xffffff,{map:ft,roughness:.5}));fc.position.z=.032;gauge.add(fc);const nd=new THREE.Mesh(new THREE.BoxGeometry(.012,.08,.004),M(0xb02018));nd.geometry.translate(0,.035,0);nd.position.z=.037;gauge.add(nd);out.parts.needle=nd}
 const SP=dmSprite('rgba(220,215,210,.5)',true),puffs=[];for(let i=0;i<5;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:SP,transparent:true,depthWrite:false,opacity:0}));G.add(s);puffs.push(s)}
 let run=0,ang=0,tt=0;const pose=()=>{fw.rotation.z=-ang;const cr=.45,cx=FX+Math.cos(-ang)*cr,cyy=FY+Math.sin(-ang)*cr;crankP.position.set(cx,cyy,1.05);
  const ba=Math.asin(Math.max(-1,Math.min(1,(cyy-FY)/1.3)))*.5;bm.rotation.z=-ba;const le=new V(-1.3,0,0).applyAxisAngle(new V(0,0,1),-ba).add(bm.position),re=new V(1.3,0,0).applyAxisAngle(new V(0,0,1),-ba).add(bm.position);
  const a=new V(cx,cyy,1.05),b=new V(le.x,le.y,1.05);crod.position.copy(a).add(b).multiplyScalar(.5);crod.scale.y=a.distanceTo(b);crod.quaternion.setFromUnitVectors(new V(0,1,0),b.clone().sub(a).normalize());
  prod.position.set(re.x,(re.y+.3)/2,.7);prod.scale.y=(re.y-.3)/2.6;rod.visible=false;out.parts.needle.rotation.z=1.6-run*2.2};
 out.parts.run=k=>{run=k};out.tick=(t,dt)=>{tt=t;ang+=(dt||0)*run*2.4;pose();puffs.forEach((p,i)=>{const k=((t*.5+i/5)%1);p.position.set(-1.9+Math.sin(i+t)*.1*k,2.9+k*1.4,.7);p.scale.setScalar(.2+k*.7);p.material.opacity=run*.3*Math.sin(Math.PI*k)});if(out.water)out.water.position.y=.45+Math.sin(ang*2)*.01*run};pose();
 out.obs.push(dmObsR(G,-2.3,1.5,.15,1.25),dmObsR(G,AX-.65,AX+.65,.25,1.15),dmObsR(G,SX-.75,SX+.75,0,1.45));out.props.push(dmProp(G,-.9,1.75,.9,'pump'));out.lights.push(dmL2R(G,0,1.6).concat([2.6]).map((v,i,a)=>i==1?2.6:i==2?a[1]:v));
 G.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return out}

/* =====================================================================================================
   Part 2, batch 3: the cave rooms (spec part 2, rooms 1-4, 11-13). Each works on an ordinary mine room built with
   dmShell (room space: x ±HX, entry wall z 0, exit wall z -Z, floor 0) and returns
   {g, obs, props, ladders:[{x,z,y0,y1,ry}] (climbed with W/S; ry = the way you face while climbing),
    ledges:[{x0,x1,z0,z1,y}] (walkable tops), floorCut:[{z0,z1}] (the game leaves its floor box out there),
    ground:[{z0,z1,y0,y1}] (walking height along z, straight between ends), glow, tick, wallGap}.
     dmFork(g, sh, o)        a rock pillar splits the room into two passages that meet again. o: {z0, z1, find (-1/1)}.
     dmDrift(g, sh, o)       a short dead-end tunnel (6 m) off one wall, through a timber portal set into a cut in the
                             rock. o: {side, z}. Build the room's shell with holes: [dmDriftHole(HX, side, z)].
     dmGallery(g, sh, o)     the wide gallery (build the room with HX 7): two rows of rock pillars, two tracks.
     dmStope(g, sh, o)       a tall worked-out room (build it with HY 8): timber stulls wall to wall, a plank ledge
                             at 3.4 m on one side with a ladder, a rich vein above it, scree against the other wall.
     dmGeode(g, o)           the geode room: the whole room is the inside of a giant geode (no dmShell, dressing,
                             sets, lanterns or rails). Crystal lining, its own end walls with the doors, a banded
                             rim round them, a silver vein. o: {Z, lv, dIn, dOut, vein (-1/1), veinZ}. Lay the
                             room's floor box as usual, 2 x out.HX (8.8 m) wide.
     dmDip(g, sh, o)         timber steps down 1.2 m into a flooded hollow (water 0.75 m deep) and up again. o: {z}.
     dmRaise(g, sh, o)       a rock wall across the room, 3 m high, with a plank deck on top and a ladder on each
                             face (build the room with HY 5). o: {z, x (the ladders' x)}.
   ===================================================================================================== */
/* a lumpy rock column from y0 to y1 (into the roof), elliptic, coloured for the level's rock material */
function dmRockCol(list,x,z,rx,rz,y0,y1,seed,col){const ge=new THREE.CylinderGeometry(1,1.12,y1-y0,24,10,false);const P=ge.attributes.position;
 /* a squarish-round section (so a long pillar has round ends, not a blade), then lumps */
 for(let i=0;i<P.count;i++){const px=P.getX(i),py=P.getY(i),pz=P.getZ(i),r=Math.hypot(px,pz);if(r<.01)continue;const n=dmNoise(px*2+seed,py*.9,pz*2),k=1+(n-.5)*.42,sx=Math.sign(px)*Math.pow(Math.abs(px/r),.7)*r,sz=Math.sign(pz)*Math.pow(Math.abs(pz/r),.7)*r;P.setXYZ(i,sx*k,py,sz*k)}
 ge.scale(rx,1,rz);ge.computeVertexNormals();/* share the normals across the seam (its vertices are doubled), else a crease shows */{const Nn=ge.attributes.normal,m={};for(let i=0;i<P.count;i++){const k=Math.round(P.getX(i)*1e4)+','+Math.round(P.getY(i)*1e4)+','+Math.round(P.getZ(i)*1e4);(m[k]=m[k]||[]).push(i)}for(const k in m){const l=m[k];if(l.length<2)continue;let x=0,y=0,z=0;for(const i of l){x+=Nn.getX(i);y+=Nn.getY(i);z+=Nn.getZ(i)}const n=Math.hypot(x,y,z)||1;for(const i of l)Nn.setXYZ(i,x/n,y/n,z/n)}}/* u runs once round (the cylinder's own u, so no jump at its seam), a whole number of tiles round */const U=ge.attributes.uv,girth=Math.PI*(rx+rz);for(let i=0;i<P.count;i++)U.setXY(i,U.getX(i)*Math.max(1,Math.round(girth/2.5)),(P.getY(i)+(y1-y0)/2)/2.5)
 mgPut(list,ge,x,(y0+y1)/2,z,0,col||[.85,.82,.8]);return ge}
/* the rock's distance from the room's middle (|x|) at height y, z on one side (sampling the shell) */
function dmRockX(sh,side,z,y){let lo=0,hi=.5;for(let it=0;it<18;it++){const mid=(lo+hi)/2,a=sh.at(z,side<0?mid*.5:1-mid*.5);(a.p[1]<y?lo=mid:hi=mid)}return Math.abs(sh.at(z,side<0?lo*.5:1-lo*.5).p[0])}
function dmVaultY(sh,x){const L=DMLV[sh.lv],W=sh.HY-.6;return W+L.vault*Math.sqrt(Math.max(0,1-(x/sh.HX)**2))}
function dmLadder(par,a,b,K){/* two stiles and rungs every 0.3 m from a=[x,y,z] (the foot) to b (the top) */const T=[],dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],L=Math.hypot(dx,dy,dz),n=Math.floor(L/.3),ux=dx/L,uy=dy/L,uz=dz/L;
 const alongZ=Math.abs(dz)>=Math.abs(dx),SX=alongZ?.22:0,SZ=alongZ?0:.22;for(const s of[-1,1])mgBeam(T,[a[0]+s*SX,a[1],a[2]+s*SZ],[b[0]+s*SX,b[1],b[2]+s*SZ],.06,.08,K.c.tim);
 for(let i=1;i<n;i++){const t=i*.3;mgBeam(T,[a[0]+ux*t-SX,a[1]+uy*t,a[2]+uz*t-SZ],[a[0]+ux*t+SX,a[1]+uy*t,a[2]+uz*t+SZ],.04,.04,K.c.tim2)}par.add(mgMerge(T,K.TIMBV))}
function dmFork(g,sh,o){const K=dmKit(),HX=sh.HX,Z=sh.Z,lv=sh.lv,G=new THREE.Group();g.add(G);const out={g:G,obs:[],props:[],ladders:[],ledges:[],floorCut:[],ground:[],glow:[],tick:()=>{}};
 const z0=o.z0==null?-Z*.25:o.z0,z1=o.z1==null?-Z*.75:o.z1,zc=(z0+z1)/2,len=Math.abs(z0-z1),pw=Math.min(1.6,HX-2.4),top=dmVaultY(sh,pw)+1.2,L=[];
 dmRockCol(L,0,zc,pw,len/2,-.3,top,(o.seed||1)*3.1,[.9,.87,.84]);G.add(mgMerge(L,dmShellMat(lv)));
 const f=o.find||1;out.props.push({x:f*(pw+(HX-pw)/2),z:zc,r:1.2,what:'find'},{x:-f*(pw+(HX-pw)/2),z:zc,r:1.2,what:'danger'});
 for(let k=0;k<4;k++){const za=z0-len*k/4,zb=z0-len*(k+1)/4,zm=(za+zb)/2,w=pw*Math.pow(Math.max(0,1-Math.pow(Math.abs((zm-zc)/(len/2)),2.857)),.35)*.92;if(w>.2)out.obs.push({x0:-w,x1:w,z0:Math.min(za,zb),z1:Math.max(za,zb)})}
 G.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return out}
/* where the side drift's portal cuts the rock (give it to the room's dmShell holes) */
function dmDriftHole(HX,side,z){return{x0:side<0?-HX-2:HX-.6,x1:side<0?-HX+.6:HX+2,z0:z-1.45,z1:z+1.45,y0:-1,y1:3.45}}
function dmDrift(g,sh,o){const K=dmKit(),M=K.M,HX=sh.HX,lv=sh.lv,side=o.side,z=o.z,G=new THREE.Group();g.add(G);const out={g:G,obs:[],props:[],ladders:[],ledges:[],floorCut:[],ground:[],glow:[],tick:()=>{}},T=[];
 let far=0;for(let k=0;k<=10;k++)for(let m=0;m<=8;m++)far=Math.max(far,dmRockX(sh,side,z-1.9+3.8*k/10,.05+3.9*m/8));
 const xf=far+.02,xb=far+.2,LEN=6,DW=1.2;
 /* the portal set: two posts and a cap, just behind the rock face; plank backing round the opening */
 for(const s of[-1,1])mgBeam(T,[side*(xf+.09),0,z+s*(DW+.12)],[side*(xf+.09),3.25,z+s*(DW+.12)],.2,.2,K.c.tim);mgBeam(T,[side*(xf+.09),3.37,z-DW-.4],[side*(xf+.09),3.37,z+DW+.4],.24,.24,K.c.tim2);
 for(let dz=-2.0;dz<2.01;dz+=.3){const inO=Math.abs(dz)<DW+.05;mgBeam(T,[side*(xb+.035),inO?3.2:0,z+dz],[side*(xb+.035),4.1,z+dz],.28,.04,[.5+K.r()*.1,.37,.24])}
 /* the drift: its own small rock shell running out from the backing, closed at the far end */
 const D=new THREE.Group();D.position.set(side*(xb+.05),0,z);D.rotation.y=-side*Math.PI/2;G.add(D);const sh2=dmShell(D,{HX:DW,HY:2.6,Z:LEN,lv,dIn:null,dOut:'solid',seed:(o.seed||3)+77});
 const fm=dmFloorMat(lv);const fl=new THREE.Mesh(new THREE.BoxGeometry(LEN,.1,2*DW+.6),fm);fl.position.set(side*(xb+.05+LEN/2),-.05,z);G.add(fl);
 const fp=new THREE.Mesh(new THREE.BoxGeometry(xb+.05-HX,.1,3.6),fm);fp.position.set(side*((HX+xb+.05)/2),-.05,z);G.add(fp);/* the floor through the portal */
 dmDress(D,sh2,{seed:(o.seed||3)+5,noProps:true,sets:[]});G.add(mgMerge(T,K.TIMBV));
 out.props.push({x:side*(xb+LEN-.6),z,r:1.2,what:'find'});out.wallGap={side,z0:z-DW,z1:z+DW};
 out.obs.push({x0:Math.min(side*HX,side*(xb+LEN+.3)),x1:Math.max(side*HX,side*(xb+LEN+.3)),z0:z+DW,z1:z+DW+.3},{x0:Math.min(side*HX,side*(xb+LEN+.3)),x1:Math.max(side*HX,side*(xb+LEN+.3)),z0:z-DW-.3,z1:z-DW},{x0:Math.min(side*(xb+LEN),side*(xb+LEN+.3)),x1:Math.max(side*(xb+LEN),side*(xb+LEN+.3)),z0:z-DW,z1:z+DW});
 G.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return out}
function dmGallery(g,sh,o){const K=dmKit(),HX=sh.HX,Z=sh.Z,lv=sh.lv,G=new THREE.Group();g.add(G);const out={g:G,obs:[],props:[],ladders:[],ledges:[],floorCut:[],ground:[],glow:[],tick:()=>{},tracks:[-.9,.9]},L=[];
 const PX=Math.min(2.8,HX*.4);let i=0;for(let z=-3;z>-Z+2.5;z-=5)for(const s of[-1,1]){const r=.7+K.r()*.2,x=s*PX+(K.r()-.5)*.2;dmRockCol(L,x,z,r,r*(.9+K.r()*.3),-.3,dmVaultY(sh,Math.abs(x)+r)+1.1,(o.seed||1)*7+i++,[.9,.87,.84]);out.obs.push({x0:x-r*.85,x1:x+r*.85,z0:z-r*.85,z1:z+r*.85})}
 G.add(mgMerge(L,dmShellMat(lv)));G.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return out}
function dmStope(g,sh,o){const K=dmKit(),M=K.M,HX=sh.HX,Z=sh.Z,lv=sh.lv,side=o.side||1,G=new THREE.Group();g.add(G);const out={g:G,obs:[],props:[],ladders:[],ledges:[],floorCut:[],ground:[],glow:[],tick:()=>{}},T=[];
 /* stulls: round timbers wall to wall, their ends in the rock */const stull=(z,y)=>{const a=dmRockX(sh,-1,z,y)+.15,b=dmRockX(sh,1,z,y)+.15;const c=new THREE.CylinderGeometry(.13,.13,a+b,10);c.rotateZ(Math.PI/2);mgPut(T,c,(b-a)/2,y,z,0,K.c.tim)};
 const zl0=-Z/2+2.2,zl1=-Z/2-2.2,LY=3.4,LD=1.7;for(const z of[zl0,zl1])stull(z,LY-.13);for(let z=-2.5;z>-Z+2;z-=4.2){stull(z,5.6);if(z<-4&&z>-Z+4)stull(z-1.2,7.0)}
 /* the ledge: planks along z resting on the two stulls, from the edge back to the rock's farthest point (they run into the rock where it bulges), a toe board along the edge */const ex=side*(HX-LD);let rfar=0;for(let k=0;k<=12;k++)rfar=Math.max(rfar,dmRockX(sh,side,zl0+.2-(zl0-zl1+.4)*k/12,LY+.03));
 for(let x=HX-LD+.13;x<rfar+.1;x+=.26)mgBeam(T,[side*x,LY+.02,zl0+.15],[side*x,LY+.02,zl1-.15],.24,.04,[.62+K.r()*.1,.46,.3]);
 mgBeam(T,[ex,LY+.12,zl0],[ex,LY+.12,zl1],.04,.16,K.c.tim2);
 dmLadder(G,[side*(HX-LD-.9),0,-Z/2],[side*(HX-LD-.12),LY+1.0,-Z/2],K);
 G.add(mgMerge(T,K.TIMBV));
 /* scree heap along the other wall */const S=[];for(let i=0;i<60;i++){const z=-2-K.r()*(Z-4),h=K.r(),x=-side*(HX-.2-h*1.4);K.rock(S,.15+K.r()*.25,x,(1-h)*.6*K.r(),z,i*3.3,[.8,.76,.7])}G.add(mgMerge(S,K.STONEV));
 out.ladders.push({x:side*(HX-LD-.5),z:-Z/2,y0:0,y1:LY,ry:side>0?-Math.PI/2:Math.PI/2});out.ledges.push({x0:Math.min(ex,side*HX),x1:Math.max(ex,side*HX),z0:zl1,z1:zl0,y:LY+.04});
 out.props.push({x:side*(HX-.4),z:-Z/2,y:LY+1.2,r:1,what:'vein'});out.obs.push({x0:-HX,x1:-HX+1.6,z0:-Z+1.5,z1:-1.5});
 G.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return out}
function dmGeode(g,o){o=o||{};const K=dmKit(),M=K.M,Z=o.Z||16,lv=o.lv||2,zc=-Z/2,G=new THREE.Group();g.add(G);
 const RH=4.4,RV=4.0,AY=1.4,LG=Z/2+1.6,TH=.6,NT=Math.ceil(Z/.4),NA=64,out={g:G,obs:[],props:[],ladders:[],ledges:[],floorCut:[],ground:[],glow:[],tick:()=>{},HX:RH};
 const f=t=>Math.sqrt(Math.max(0,1-(t/LG)**2));
 /* a point on the lining: an ellipse round the path's axis (y AY), shrinking towards the ends, made lumpy; e moves it out (+) or in (-) */
 const surf=(t,a,e)=>{const c=Math.cos(a),s=Math.sin(a),bx=c*RH*f(t),by=s*RV*f(t),r=Math.hypot(bx,by),d=(dmNoise(c*2.4+5,s*2.4,t*.8)-.5)*.5+(e||0),k=1+d/r;return[bx*k,AY+by*k,zc+t]};
 const nIn=a=>{const x=-Math.cos(a)/RH,y=-Math.sin(a)/RV,l=Math.hypot(x,y);return[x/l,y/l]};
 /* the lining (faces in) and the rind (faces out); their seam is at the bottom, under the floor */
 const tube=(e,inward,mat,colf,uvs)=>{const pos=[],col=[],uv=[],idx=[];for(let i=0;i<=NT;i++){const t=-Z/2+Z*i/NT;for(let j=0;j<=NA;j++){const a=-Math.PI/2+2*Math.PI*j/NA,p=surf(t,a,e);pos.push(...p);col.push(...colf(p,t,a));uv.push(2*Math.PI*j/NA*((RH+RV)/2+e)/2.5,t/2.5)}}
  for(let i=0;i<NT;i++)for(let j=0;j<NA;j++){const v0=i*(NA+1)+j,v1=v0+1,v2=v0+NA+1,v3=v2+1;inward?idx.push(v0,v2,v1,v1,v2,v3):idx.push(v0,v1,v2,v1,v3,v2)}
  const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));ge.setAttribute('color',new THREE.Float32BufferAttribute(col,3));if(uvs)ge.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));ge.setIndex(idx);ge.computeVertexNormals();const m=new THREE.Mesh(ge,mat);G.add(m);return m};
 tube(0,true,M(0xffffff,{map:dmRockTex(2),vertexColors:true,roughness:.4,metalness:.1}),(p,t,a)=>{const n=dmNoise(p[0]*1.6,p[1]*1.6,p[2]*1.6),b=.5+.5*Math.sin(p[1]*3.1+n*4);return[.42+.16*n+.1*b,.3+.1*n,.62+.2*n+.1*b]},true);
 tube(TH,false,dmShellMat(lv),p=>{const v=.75+.3*dmNoise(p[0]*1.5,p[1]*1.5,p[2]*1.5);return[v,v,v]},true);
 /* the end walls: flat rock with the door, out past the rind; a banded agate rim where the lining meets them */
 const bandT=rtKit().tex(64,256,(x,w,h)=>{const C=['#3a2a4a','#6a5a8a','#c8c0d8','#4a3a5a','#e8e4f0','#5a4870','#8a7aa0','#2a2030'];let y=0,i=0;while(y<h){const t=4+((i*37)%13);x.fillStyle=C[i%C.length];x.fillRect(0,y,w,t);y+=t;i++}});
 const bandM=M(0xffffff,{map:bandT,roughness:.5,vertexColors:true});
 for(const e of[1,-1]){const t=e*Z/2,dx=(e>0?o.dIn:o.dOut)||0,W=RH*f(t)+TH+.6,YT=AY+RV*f(t)+TH+.6,F=e>0?-1:1,d=dx*F;
  const sh=new THREE.Shape();sh.moveTo(-W,0);sh.lineTo(d-.8,0);sh.lineTo(d-.8,3);sh.lineTo(d+.8,3);sh.lineTo(d+.8,0);sh.lineTo(W,0);sh.lineTo(W,YT);sh.lineTo(-W,YT);sh.lineTo(-W,0);
  const cg=new THREE.ShapeGeometry(sh),Pp=cg.attributes.position,U=cg.attributes.uv,c=[];for(let i=0;i<Pp.count;i++){U.setXY(i,Pp.getX(i)/2.5,Pp.getY(i)/2.5);const v=.82+.25*dmNoise(Pp.getX(i)*1.3+7,Pp.getY(i)*1.3,t);c.push(v,v,v)}cg.setAttribute('color',new THREE.Float32BufferAttribute(c,3));
  const pm=new THREE.Mesh(cg,dmShellMat(lv));pm.position.z=zc+t;if(e>0)pm.rotation.y=Math.PI;G.add(pm);
  /* the rim: from 0.4 m inside the lining's edge to just behind it, 1 cm in front of the wall, bands running round */
  const pos=[],uv=[],col=[],idx=[];for(let j=0;j<=NA;j++){const a=-Math.PI/2+2*Math.PI*j/NA;for(const [k,ee] of[[0,-.4],[1,.12]]){const p=surf(t,a,ee);pos.push(p[0],p[1],zc+t-e*.01);uv.push(j/NA*6,k);col.push(1,1,1)}}
  for(let j=0;j<NA;j++){const v0=j*2,v1=v0+1,v2=v0+2,v3=v0+3;e>0?idx.push(v0,v2,v1,v1,v2,v3):idx.push(v0,v1,v2,v1,v3,v2)}
  const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));rg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));rg.setAttribute('color',new THREE.Float32BufferAttribute(col,3));rg.setIndex(idx);rg.computeVertexNormals();G.add(new THREE.Mesh(rg,bandM))}
 /* the crystals: a close carpet of single points over the lining above the floor, each a six-sided column with its point,
    standing out of the lining towards the middle, its foot sunk in */const A=[],B=[],UP=new THREE.Vector3(0,1,0),NG=o.n||2000;
 for(let i=0;i<NG;i++){const t=(K.r()*2-1)*(Z/2-.45),a=-Math.PI/2+K.r()*Math.PI*2,p=surf(t,a,0);if(p[1]<.3)continue;const ni=nIn(a);
  const h=.1+K.r()*K.r()*(p[1]<1.4?.5:.34),w=h*(.2+K.r()*.08),pr=new THREE.CylinderGeometry(w*.9,w,h+.08,6,1);pr.translate(0,(h-.08)/2,0);const tp=new THREE.ConeGeometry(w*.9,w*1.9,6);tp.translate(0,h+w*.95,0);
  const n=new THREE.Vector3(ni[0]+(K.r()-.5)*.5,ni[1]+(K.r()-.5)*.5,(K.r()-.5)*.5).normalize(),m=new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(UP,n)),sp=K.r()*6.28,L=K.r()<.6?A:B;
  for(const ge of[pr,tp]){ge.rotateY(sp);ge.applyMatrix4(m);ge.translate(p[0]-ni[0]*.05,p[1]-ni[1]*.05,p[2]);mgPut(L,ge,0,0,0,0,[1,1,1])}}
 /* big clusters along the foot of the lining on both sides */const xFloor=t=>{const fy=-AY/(RV*f(t));return RH*f(t)*Math.sqrt(Math.max(0,1-fy*fy))};
 for(const s of[-1,1])for(let k=0;k<6;k++){const t=-Z/2+1.6+(Z-3.2)*(k+.2+K.r()*.6)/6,sz=.55+K.r()*.55,L=k%2?A:B;dmCrystal(L,sz,k*7+(s>0?40:0),[1,1,1]).forEach(ge=>{ge.rotateY(K.r()*6.28);ge.translate(s*(xFloor(t)-.25-sz*.35),-.02,zc+t);mgPut(L,ge,0,0,0,0,[1,1,1])})}
 G.add(mgMerge(A,M(0xd8c0ff,{emissive:0x7a40e0,emissiveIntensity:.55,roughness:.12,flatShading:true})));G.add(mgMerge(B,M(0xf0f0ff,{emissive:0x8090c0,emissiveIntensity:.35,roughness:.08,flatShading:true})));
 /* the silver vein: bright lumps in the lining at chest height on one side */const V=[],vs=o.vein||1,vt=o.veinZ==null?1.5:o.veinZ;for(let i=0;i<34;i++){/* lumps along a sloping streak, half sunk in the lining */const u=K.r()-.5,a=(vs>0?0:Math.PI)+u*.55*vs+(K.r()-.5)*.08,t=vt+u*2.6,p=surf(t,a,.02);K.rock(V,.04+K.r()*.08,p[0],p[1],p[2],i*5.1,[.95,.95,.97])}
 G.add(mgMerge(V,M(0xd8dce4,{vertexColors:true,metalness:.45,roughness:.3,emissive:0x2a2a32})));const pv=surf(vt,vs>0?0:Math.PI,-.5);out.props.push({x:pv[0],z:pv[2],y:pv[1],r:1.1,what:'vein',ore:'silver'});
 out.glow.push([0,3.4,zc-Z*.3],[0,3.4,zc],[0,3.4,zc+Z*.3]);
 /* walls: you can walk where the lining is above the floor (measured at 0.35 m, where it's narrowest) */
 const xAt=(t,y)=>{const fy=(y-AY)/(RV*f(t));return RH*f(t)*Math.sqrt(Math.max(0,1-fy*fy))};const XO=RH+TH+1;
 for(let k=0;k<8;k++){const ta=-Z/2+Z*k/8,tb=-Z/2+Z*(k+1)/8,hw=Math.min(xAt(ta,.35),xAt(tb,.35))-.3;for(const s of[-1,1])out.obs.push({x0:s<0?-XO:hw,x1:s<0?-hw:XO,z0:zc+ta,z1:zc+tb})}
 G.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return out}
function dmDip(g,sh,o){const K=dmKit(),M=K.M,HX=sh.HX,Z=sh.Z,lv=sh.lv,zc=o.z==null?-Z/2:o.z,G=new THREE.Group();g.add(G);const out={g:G,obs:[],props:[],ladders:[],ledges:[],floorCut:[],ground:[],glow:[],tick:()=>{}};
 const D=1.2,SR=.4,NS=5,RISE=D/NS,RUN=NS*SR,BOT=3.2,zt=zc+BOT/2+RUN,zb=zc-BOT/2-RUN,WY=-.45,RM=dmShellMat(lv);
 /* the hollow's side walls: rock from its floor up to the room's floor, lumpy outwards (flat where it meets the room) */
 const wall=s=>{const nz=Math.ceil((zt-zb)/.35),ny=5,pos=[],col=[],uv=[],idx=[];for(let a=0;a<=nz;a++){const z=zt-(zt-zb)*a/nz;for(let b=0;b<=ny;b++){const y=-D-.05+(D+.05)*b/ny,d=.32*dmNoise(z*.9,y*.9+3,s*7)*Math.sin(Math.PI*Math.min(1,(y+D+.05)/(D+.05)))*Math.min(1,(zt-z)/.6,(z-zb)/.6);pos.push(s*(HX+d),y,z);uv.push((s<0?y:sh.prof.len-y)/2.5,-z/2.5);/* the shell's own UV layout, so the rock carries on from the wall above */const v=.7+.3*dmNoise(z*2,y*2,s);col.push(v,v,v)}}
  for(let a=0;a<nz;a++)for(let b=0;b<ny;b++){const i0=a*(ny+1)+b,i1=i0+1,i2=i0+ny+1,i3=i2+1;s<0?idx.push(i0,i2,i1,i1,i2,i3):idx.push(i0,i1,i2,i1,i3,i2)}/* faces inwards (towards x 0) */const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));ge.setAttribute('color',new THREE.Float32BufferAttribute(col,3));ge.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));ge.setIndex(idx);ge.computeVertexNormals();G.add(new THREE.Mesh(ge,RM))};
 wall(-1);wall(1);
 /* the bottom (mud) and the timber steps on rock, full width, ends into the walls */const mud=new THREE.Mesh(new THREE.BoxGeometry(2*HX+.7,.1,BOT),M(0x2a241e,{roughness:.6,metalness:.1}));mud.position.set(0,-D-.05,zc);G.add(mud);
 const T=[],RK=[];for(const e of[1,-1])for(let i=0;i<NS;i++){const y=-RISE*(i+1),zf=e>0?zt-SR*(i+1):zb+SR*(i+1),zm=zf+e*SR/2;if(i<NS-1)mgPut(RK,new THREE.BoxGeometry(2*HX+.7,D+y-.04,SR),0,(y-.04-D)/2,zm,0,[.75,.72,.68]);mgBeam(T,[-HX-.3,y-.03,zm],[HX+.3,y-.03,zm],SR-.01,.06,[.6+K.r()*.08,.45,.3])}
 /* the riser boards: in front of each step's edge, from the step below up to the one above (the top one hides the room floor's edge) */const NB=[];for(const e of[1,-1])for(let i=0;i<NS;i++){const y=-RISE*(i+1),edge=e>0?zt-SR*i:zb+SR*i;mgBeam(NB,[-HX-.3,y+RISE/2,edge-e*.02],[HX+.3,y+RISE/2,edge-e*.02],.04,RISE,K.c.tim2)}
 G.add(mgMerge(RK,RM));G.add(mgMerge(T,K.TIMBV));G.add(mgMerge(NB,K.TIMBV));
 /* the water */const wt=rtKit().tex(128,128,(x,w,h)=>{x.fillStyle='#203030';x.fillRect(0,0,w,h);for(let i=0;i<60;i++){x.strokeStyle='rgba(180,210,210,.18)';x.lineWidth=1;x.beginPath();x.ellipse(K.r()*w,K.r()*h,4+K.r()*12,2+K.r()*4,0,0,7);x.stroke()}});const wz0=zt-RUN*(-WY/D),wz1=zb+RUN*(-WY/D);wt.repeat.set(HX/1.5,(wz0-wz1)/3);
 const wm=M(0xffffff,{map:wt,transparent:true,opacity:.62,roughness:.05,metalness:.5,depthWrite:false});const w=new THREE.Mesh(new THREE.PlaneGeometry(2*HX+.6,wz0-wz1),wm);w.rotation.x=-Math.PI/2;w.position.set(0,WY,(wz0+wz1)/2);w.renderOrder=2;G.add(w);out.tick=t=>wt.offset.set(t*.02,t*.03);
 out.floorCut.push({z0:zb,z1:zt});out.ground.push({z0:zt,z1:zt-RUN,y0:0,y1:-D},{z0:zt-RUN,z1:zb+RUN,y0:-D,y1:-D},{z0:zb+RUN,z1:zb,y0:-D,y1:0});out.water={y:WY,z0:wz1,z1:wz0,slow:.5};
 G.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return out}
function dmRaise(g,sh,o){const K=dmKit(),M=K.M,HX=sh.HX,Z=sh.Z,lv=sh.lv,zc=o.z==null?-Z/2:o.z,lx=o.x==null?1.4:o.x,G=new THREE.Group();g.add(G);const out={g:G,obs:[],props:[],ladders:[],ledges:[],floorCut:[],ground:[],glow:[],tick:()=>{}};
 const H=3,HD=1.2,W=HX+.9;/* the rock wall: a block with lumpy faces, flat on top, its ends deep in the room's walls */
 const ge=new THREE.BoxGeometry(2*W,H+.3,2*HD,24,8,6);const P=ge.attributes.position;for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i),z=P.getZ(i);if(Math.abs(Math.abs(z)-HD)<.01){const yy=y+(H+.3)/2,f=Math.min(1,(H-.02-yy+.3)/.6);P.setZ(i,z+Math.sign(z)*(dmNoise(x*.8+3,yy*.8,z)-.3)*.4*Math.max(0,Math.min(1,f)))}}
 ge.computeVertexNormals();const c=[];for(let i=0;i<P.count;i++){const v=.75+.3*dmNoise(P.getX(i)*1.5,P.getY(i)*1.5,P.getZ(i));c.push(v,v,v)}ge.setAttribute('color',new THREE.Float32BufferAttribute(c,3));const U=ge.attributes.uv;for(let i=0;i<U.count;i++)U.setXY(i,(P.getX(i)+P.getZ(i))/2.5,P.getY(i)/2.5);
 const blk=new THREE.Mesh(ge,dmShellMat(lv));blk.position.set(0,(H+.3)/2-.3,zc);G.add(blk);
 /* the deck on top: planks along z, and two sleepers under the ends */const T=[];for(let x=-HX+.15;x<HX-.1;x+=.3)mgBeam(T,[x,H+.02,zc+HD+.08],[x,H+.02,zc-HD-.08],.28,.04,[.62+K.r()*.1,.46,.3]);
 G.add(mgMerge(T,K.TIMBV));for(const e of[1,-1]){dmLadder(G,[lx,0,zc+e*(HD+.75)],[lx,H+.9,zc+e*(HD+.1)],K);out.ladders.push({x:lx,z:zc+e*(HD+.4),y0:0,y1:H,ry:e>0?0:Math.PI})}
 out.ledges.push({x0:-HX,x1:HX,z0:zc-HD,z1:zc+HD,y:H+.04});out.obs.push({x0:-HX,x1:HX,z0:zc-HD,z1:zc+HD,top:H+.04});
 G.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return out}
