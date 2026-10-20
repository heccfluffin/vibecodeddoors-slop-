/* r644: =====================================================================================================
   r640 (pyramid): THE PYRAMID REWORK (docs/design/pyramid.md, layout and batches 1-6; models docs/design/models/pyr.js).

   A new look for the whole Pyramid, outside, on the ground floor and in the undercroft. Every room, trap, puzzle,
   prompt and spot stays where it was: the ground-floor grid F and the undercroft grid FB in pyrBuild/pyrUnder are
   unchanged, and so are all the obstacles and props of the game's own things.

   What it does:
   - Outside: new faces with stone courses and fallen casing, a gold pyramidion, a paved apron and rubble, a temple
     gateway at the door (pylon towers, winged sun, braziers, the same bollard spots), a paved avenue with six
     jackals, two obelisks and the two sphinxes (moved here from pyrUnder), a dig camp south of the base and some
     ruins out on the sand.
   - Ground floor: painted wall faces on the cell lines, starry ceiling tiles, slab floor, bronze wall torches with
     real flames, the entrance hall's door frame and torches, the antechamber's columns, guardians and door frames,
     new steles, scroll table, jars and skeleton; the dart stones, darts, blades and their mounts, the sealed door
     (carved slab, frame, bronze dials), the scribe's corner and scarab statue in the clue rooms, the scarab trapdoor;
     the treasure chamber (gold heaps, sarcophagus, lid, mummy, chest, pedestal, golden mask, a shrine, jars, fans,
     chariot wheels).
   - The undercroft: painted faces, ceiling tiles and beams, the stairs with nosings and a lined opening, the
     landing's skeleton, carved gates, torches, stone clue tablets, the Jackal altar and basalt jackals, the Sun's
     dish, golden disc and mirrors, the gong stands and gongs with drawn signs, the stone priest, throw levers,
     sand textures and ceiling cracks, Khufu-Bob's coffin, the big jackals, canopic jars, the Heart's pedestal and
     heart-shaped gem, fire bowls on brackets.

   What it replaces: the base's pyrBuild and pyrUnder build their meshes inline, so build.py swaps each old mesh for
   the model here (block "The Pyramid rework" before `import base64`). Fixes the spec lists: the Jackal clue tablet
   moves 25 cm, the Sand tablet moves onto the west wall, the Sand levers' angles swap, the trapdoor picture sits
   above the floor, the gold heaps' coins sit on the floor, the Heart's bowls get brackets.

   The model code below is docs/design/models/pyr.js unchanged. The wiring at the end adds these globals:
   pywBurn, pywNS, pywAt, pywFl, pywTorch, pywUTorch, pywUGlow, pywUGroup, pywPass, pywOut, pywIn, pywTreasure.
   The undercroft's meshes go into their own group (pywUGroup), drawn only while you are down there.
   (The models' own globals all start with py / PY; none of them clashed with the game.)

   The models build their canvas textures with Math.random, so they always run on the browser's own random
   (pywNS), and where an old mesh that drew from the desert's seeded random is gone, pywBurn draws the same count:
   the rest of the desert, built from the same sequence after the pyramid, comes out exactly as before.
   ===================================================================================================== */
/* =====================================================================================================
   pyr.js: the Pyramid rework (remodel list #20, spec docs/design/pyramid.md). Plain three.js r128.
   Everything is built in the desert's own x/z straight into the group you pass. PYRV mirrors the game's PYR.

   Batch 1, the outside:
   pyKit()           materials, canvas textures, helpers (boxes get world-anchored texture coordinates).
   pyShell(g)        the four faces (the east one with the notch for the passage), real stone courses, the casing
                     fallen away in patches low down showing the stepped core, the gold pyramidion, a paved apron
                     and rubble at the foot. Returns {obs, map}.
   pyGateway(g)      the temple gateway at the passage mouth: pylon towers, cavetto cornice, the winged sun, carved
                     jambs, braziers, stone bollards (still keep cars out). Returns {obs, flames}.
   pyAvenue(g)       the paved avenue, six jackals, two obelisks, two sphinxes. Returns {obs, map}.
   pyDigCamp(g)      the archaeologists' camp (tents, table, crates, sieve, wheelbarrow, generator, lights, trench).
                     Returns {obs, map, table:[x,z]}.
   pyRuins(g)        fallen columns, a broken statue, fallen casing stones. Returns {obs}.
   pySphinx(), pyJackal({red,scale}), pyObelisk({h, glyphs})  models used above (and by later batches).
   ===================================================================================================== */
const PYRV={X:-175,Z:-1040,B:38,H:56,C:3.2,WH:3.9};
function pyKit(){if(pyKit.K)return pyKit.K;const C={};const M=(c,o)=>{const k=c+JSON.stringify(o||{});return C[k]||(C[k]=new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.85,metalness:0},o||{})))};
 const can=(w,h,f,rep)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.anisotropy=4;if(rep)t.wrapS=t.wrapT=THREE.RepeatWrapping;return t};
 let seed=7331;const R=()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
 const noise=(x,w,h,base,n,a)=>{x.fillStyle=base;x.fillRect(0,0,w,h);for(let i=0;i<n;i++){x.fillStyle=R()<.5?'rgba(60,40,20,'+a*R()+')':'rgba(255,250,235,'+a*R()+')';x.fillRect(R()*w,R()*h,1+R()*3,1+R()*3)}};
 const blocks=(base,line,rows,cols)=>can(256,256,(x,w,h)=>{noise(x,w,h,base,3500,.12);x.strokeStyle=line;x.lineWidth=3;const rh=h/rows,cw=w/cols;for(let r=0;r<rows;r++){x.beginPath();x.moveTo(0,r*rh+1);x.lineTo(w,r*rh+1);x.stroke();for(let c=0;c<cols;c++){const u=(c*cw+(r%2)*cw/2)%w;x.beginPath();x.moveTo(u,r*rh);x.lineTo(u,r*rh+rh);x.stroke()}}},1);
 const T={sand:blocks('#d4b47a','rgba(110,80,40,.45)',4,3)/* 2 m: 0.5 m courses */,lime:blocks('#e4d6b8','rgba(120,100,70,.35)',4,2),dark:blocks('#a88a5c','rgba(70,50,25,.5)',4,3),
  pave:can(256,256,(x,w,h)=>{noise(x,w,h,'#cbb489',3000,.12);x.strokeStyle='rgba(90,70,40,.45)';x.lineWidth=3;for(let r=0;r<4;r++){x.beginPath();x.moveTo(0,r*64);x.lineTo(w,r*64);x.stroke();for(let c=0;c<3;c++){const u=(c*86+(r%2)*43)%w;x.beginPath();x.moveTo(u,r*64);x.lineTo(u,r*64+64);x.stroke()}}},1),
  basalt:can(128,128,(x,w,h)=>noise(x,w,h,'#1e1e26',2500,.15),1),canvas:can(128,128,(x,w,h)=>{noise(x,w,h,'#d8ccb0',1500,.08);x.strokeStyle='rgba(120,100,70,.2)';for(let i=0;i<16;i++){x.beginPath();x.moveTo(0,i*8);x.lineTo(w,i*8);x.stroke()}},1)};
 const MT={sand:new THREE.MeshStandardMaterial({map:T.sand,roughness:.92}),lime:new THREE.MeshStandardMaterial({map:T.lime,roughness:.85}),dark:new THREE.MeshStandardMaterial({map:T.dark,roughness:.95}),pave:new THREE.MeshStandardMaterial({map:T.pave,roughness:.95}),
  basalt:new THREE.MeshStandardMaterial({map:T.basalt,roughness:.35,metalness:.15}),gold:M(0xf0c040,{metalness:.85,roughness:.25,emissive:0x3a2800}),lapis:M(0x1e3a8a,{roughness:.4,metalness:.2}),
  wood:M(0x7a5232,{roughness:.8}),iron:M(0x3a342c,{metalness:.6,roughness:.5}),canvas:new THREE.MeshStandardMaterial({map:T.canvas,roughness:1,side:THREE.DoubleSide}),flame:new THREE.MeshBasicMaterial({color:0xffa040,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false}),flame2:new THREE.MeshBasicMaterial({color:0xfff0a0,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false})};
 const boxGeo=(w,h,d,s,o)=>{const g=new THREE.BoxGeometry(w,h,d);if(s){const uv=g.attributes.uv,P=g.attributes.position;const ox=o?o[0]:0,oy=o?o[1]:0,oz=o?o[2]:0;for(let f=0;f<6;f++)for(let v=0;v<4;v++){const i=f*4+v;const x=P.getX(i)+ox,y=P.getY(i)+oy,z=P.getZ(i)+oz;let u,w2;if(f<2){u=f==0?-z:z;w2=y}else if(f<4){u=x;w2=f==2?-z:z}else{u=f==4?x:-x;w2=y}uv.setXY(i,u/s,w2/s)}}return g};
 const H=par=>{const A=(geo,m,x,y,z,p)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);(p||par).add(o);return o};
  const B=(w,h,d,m,x,y,z,p,s)=>A(boxGeo(w,h,d,s,s&&!p?[x,y,z]:null),m,x,y,z,p);
  const Cy=(r0,r1,h,m,x,y,z,ax,p,seg,open)=>{const o=A(new THREE.CylinderGeometry(r0,r1,h,seg||14,1,!!open),m,x,y,z,p);if(ax=='x')o.rotation.z=-Math.PI/2;else if(ax=='z')o.rotation.x=Math.PI/2;return o};
  const V=new THREE.Vector3(),U=new THREE.Vector3(0,1,0);
  const rod=(a,b,r,m,p,seg)=>{V.set(b[0]-a[0],b[1]-a[1],b[2]-a[2]);const L=V.length();const o=A(new THREE.CylinderGeometry(r,r,L,seg||6),m,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,p);o.quaternion.setFromUnitVectors(U,V.normalize());return o};
  const lab=(txt,w,h,bg,fg,fs,x,y,z,ry,p)=>{const t=can(512,Math.max(16,Math.round(512*h/w)),(c,W2,H2)=>{if(bg){c.fillStyle=bg;c.fillRect(0,0,W2,H2)}c.fillStyle=fg;c.textAlign='center';c.textBaseline='middle';const L=String(txt).split('\n');let f=fs||Math.min(H2/(L.length+.5),90);c.font='bold '+f+'px DoorsSans,Arial,sans-serif';const mw=Math.max(...L.map(l=>c.measureText(l).width));if(mw>W2*.92){f*=W2*.92/mw;c.font='bold '+f+'px DoorsSans,Arial,sans-serif'}L.forEach((l,i)=>c.fillText(l,W2/2,H2/2+(i-(L.length-1)/2)*f*1.1))});
   const m=A(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:t,transparent:!bg,roughness:.8}),x,y,z,p);m.rotation.y=ry||0;return m};
  /* a flame: two additive cones that flicker (call flick(t) each frame) */
  const flame=(x,y,z,s,p)=>{const g=new THREE.Group();g.position.set(x,y,z);(p||par).add(g);const a=new THREE.Mesh(new THREE.ConeGeometry(.16*s,.5*s,8,1,true),MT.flame);a.position.y=.25*s;g.add(a);const b=new THREE.Mesh(new THREE.ConeGeometry(.08*s,.3*s,8,1,true),MT.flame2);b.position.y=.15*s;g.add(b);g.userData.dpKeep=1;g.userData.flick=t=>{const k=1+Math.sin(t*15+x)*.12+Math.sin(t*7.7+z)*.08;g.scale.set(1,k,1)};return g};
  return{A,B,Cy,rod,lab,flame}};
 pyKit.K={M,MT,T,can,boxGeo,H,R};return pyKit.K}
/* draws one carved sign at (cx,cy), size r, with paths (no font needed): 0 ankh, 1 eye, 2 sun, 3 water, 4 bird, 5 scarab, 6 snake */
function pyGlyph(x,t,cx,cy,r){x.save();x.translate(cx,cy);x.lineWidth=Math.max(2,r*.16);x.lineCap='round';x.beginPath();
 if(t==0){x.ellipse(0,-r*.55,r*.3,r*.38,0,0,7);x.moveTo(-r*.6,-r*.1);x.lineTo(r*.6,-r*.1);x.moveTo(0,-r*.17);x.lineTo(0,r)}
 else if(t==1){x.moveTo(-r*.8,0);x.quadraticCurveTo(0,-r*.7,r*.8,0);x.quadraticCurveTo(0,r*.5,-r*.8,0);x.moveTo(r*.15,0);x.arc(0,0,r*.15,0,7);x.moveTo(-r*.8,-r*.45);x.quadraticCurveTo(0,-r*.95,r*.85,-r*.35);x.moveTo(-r*.1,r*.3);x.lineTo(-r*.3,r*.9);x.quadraticCurveTo(-r*.5,r*1.0,-r*.6,r*.8)}
 else if(t==2){x.arc(0,0,r*.6,0,7);x.moveTo(r*.15,0);x.arc(0,0,r*.15,0,7)}
 else if(t==3){for(let j=-1;j<=1;j++){x.moveTo(-r*.8,j*r*.4);for(let i=0;i<4;i++)x.lineTo(-r*.8+(i+.5)*r*.4,j*r*.4+(i%2?r*.15:-r*.15)),x.lineTo(-r*.8+(i+1)*r*.4,j*r*.4)}}
 else if(t==4){x.ellipse(0,0,r*.45,r*.3,-.3,0,7);x.moveTo(r*.3,-r*.25);x.arc(r*.4,-r*.45,r*.18,0,7);x.moveTo(r*.58,-r*.45);x.lineTo(r*.8,-r*.4);x.moveTo(-r*.4,r*.1);x.lineTo(-r*.85,r*.35);x.moveTo(-r*.1,r*.3);x.lineTo(-r*.15,r*.85);x.moveTo(r*.1,r*.3);x.lineTo(r*.15,r*.85)}
 else if(t==6){x.moveTo(-r*.85,r*.5);x.bezierCurveTo(-r*.4,-r*.2,-r*.1,r*.9,r*.3,r*.1);x.quadraticCurveTo(r*.5,-r*.35,r*.35,-r*.6);x.moveTo(r*.55,-r*.62);x.arc(r*.42,-r*.62,r*.13,0,7)}
 else{x.ellipse(0,r*.15,r*.4,r*.5,0,0,7);x.moveTo(r*.25,-r*.45);x.arc(0,-r*.45,r*.25,0,7);x.moveTo(0,-r*.35);x.lineTo(0,r*.65);for(const s of[-1,1]){x.moveTo(s*r*.4,0);x.lineTo(s*r*.8,-r*.3);x.moveTo(s*r*.4,r*.3);x.lineTo(s*r*.8,r*.5)}}
 x.stroke();x.restore()}
const pyNoSeam=g=>g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});

/* ---------------------------------------- the faces ---------------------------------------- */
/* one canvas covers a whole face: the base runs along the bottom, the apex at the top middle.
   Smooth casing with fine courses above, the stepped core showing through in patches low down. */
function pyFaceTex(seedOff){const k=pyKit(),{R}=k;return k.can(2048,2048,(x,w,h)=>{x.fillStyle='#dccaa0';x.fillRect(0,0,w,h);
  for(let i=0;i<60000;i++){x.fillStyle=R()<.5?'rgba(90,60,30,'+R()*.06+')':'rgba(255,248,230,'+R()*.07+')';x.fillRect(R()*w,R()*h,2+R()*4,2+R()*3)}
  /* weathering: darker towards the foot, streaks running down */const gr=x.createLinearGradient(0,0,0,h);gr.addColorStop(0,'rgba(255,250,235,.15)');gr.addColorStop(.6,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(110,80,40,.28)');x.fillStyle=gr;x.fillRect(0,0,w,h);
  for(let i=0;i<70;i++){const u=R()*w,v=R()*h*.7;const g2=x.createLinearGradient(0,v,0,v+200+R()*300);g2.addColorStop(0,'rgba(120,90,50,.12)');g2.addColorStop(1,'rgba(120,90,50,0)');x.fillStyle=g2;x.fillRect(u,v,4+R()*10,500)}
  /* courses: about 1.1 m apart on the slope (the slope is about 68 m) */const N=62,rh=h/N;x.strokeStyle='rgba(120,95,60,.35)';x.lineWidth=2;for(let r=1;r<N;r++){const y=h-r*rh;x.beginPath();x.moveTo(0,y);x.lineTo(w,y);x.stroke();for(let c=0;c<w;c+=80+R()*60){x.beginPath();x.moveTo(c+(r%2)*40,y);x.lineTo(c+(r%2)*40,y+rh);x.stroke()}}
  /* the casing gone in patches near the foot: draw the stepped core (light tops, dark risers) inside each patch */
  const patches=[];for(let i=0;i<7;i++)patches.push({u:200+R()*(w-400),v:h-40-R()*h*.25,rx:50+R()*110,ry:35+R()*70});patches.push({u:20,v:h-60,rx:150,ry:130},{u:w-20,v:h-70,rx:160,ry:140});
  for(const p of patches){x.save();x.beginPath();for(let a=0;a<Math.PI*2;a+=.3){const rr=1+Math.sin(a*3+p.u)*.18+(R()-.5)*.15;x.lineTo(p.u+Math.cos(a)*p.rx*rr,p.v+Math.sin(a)*p.ry*rr)}x.closePath();x.clip();
   x.fillStyle='#a88458';x.fillRect(p.u-p.rx*1.3,p.v-p.ry*1.3,p.rx*2.6,p.ry*2.6);const sh=rh*1.1;for(let y=p.v-p.ry*1.3;y<p.v+p.ry*1.3;y+=sh){x.fillStyle='rgba(60,40,20,.55)';x.fillRect(p.u-p.rx*1.3,y+sh*.55,p.rx*2.6,sh*.45);x.fillStyle='rgba(240,220,180,.35)';x.fillRect(p.u-p.rx*1.3,y,p.rx*2.6,sh*.18);
    for(let c=p.u-p.rx*1.3+((y/sh|0)%2)*30;c<p.u+p.rx*1.3;c+=60){x.fillStyle='rgba(60,40,20,.5)';x.fillRect(c,y,3,sh)}}x.restore();
   x.strokeStyle='rgba(80,55,25,.6)';x.lineWidth=4;x.beginPath();for(let a=0;a<Math.PI*2;a+=.3){const rr=1+Math.sin(a*3+p.u)*.18;x.lineTo(p.u+Math.cos(a)*p.rx*rr,p.v+Math.sin(a)*p.ry*rr)}x.closePath();x.stroke()}})}
function pyFaceGeo(Pm,e1,notch){const{X,Z,B,H}=PYRV,apex=new THREE.Vector3(X,H,Z),d=apex.clone().sub(Pm),L=d.length();d.normalize();let T;
 if(notch){const w=notch[0],v=notch[1]/H*L;T=[[-B,0],[-w,0],[-w,v],[-B,0],[-w,v],[0,L],[-w,v],[w,v],[0,L],[w,v],[w,0],[B,0],[w,v],[B,0],[0,L]]}else T=[[-B,0],[B,0],[0,L]];
 const pos=[],uv=[];for(const[u,v]of T){pos.push(Pm.x+e1.x*u+d.x*v,Pm.y+e1.y*u+d.y*v,Pm.z+e1.z*u+d.z*v);uv.push((u+B)/(2*B),v/L)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g}
function pyShell(g){const k=pyKit(),{M,MT,R}=k,{A,B,Cy}=k.H(g),{X,Z,H}=PYRV,BB=PYRV.B,obs=[],map=[];
 const sides=[[new THREE.Vector3(X+BB,0,Z),new THREE.Vector3(0,0,1),[3.6,5.3]],[new THREE.Vector3(X-BB,0,Z),new THREE.Vector3(0,0,-1)],[new THREE.Vector3(X,0,Z-BB),new THREE.Vector3(1,0,0)],[new THREE.Vector3(X,0,Z+BB),new THREE.Vector3(-1,0,0)]];
 const tex=pyFaceTex();const FM=new THREE.MeshStandardMaterial({map:tex,roughness:.88,side:THREE.DoubleSide});for(const[pm,e1,nt]of sides)A(pyFaceGeo(pm,e1,nt),FM,0,0,0);
 /* the pyramidion: gold, a little proud of the faces, a band at its foot */{const h=3.4,r=BB*h/H*Math.SQRT2*1.04;const c=A(new THREE.ConeGeometry(r,h,4),MT.gold,X,H-h/2+.02,Z);c.rotation.y=Math.PI/4;const band=A(new THREE.CylinderGeometry(r*1.02,r*1.04,.18,4,1,true),M(0xc89a30,{metalness:.8,roughness:.3,side:THREE.DoubleSide}),X,H-h+.09,Z);band.rotation.y=Math.PI/4}
 /* a paved apron round the foot (8 cm), with the passage notch left open on the east */{const W=1.6;for(const[x,z,w,d]of[[X,Z-BB-W/2,2*BB+2*W,W],[X,Z+BB+W/2,2*BB+2*W,W],[X-BB-W/2,Z,W,2*BB],[X+BB+W/2,Z,W,2*BB]])B(w,.08,d,MT.pave,x,.04,z,null,2)}
 /* rubble: casing blocks that have slid down, heaped at the corners and here and there along the foot */
 {const geo=new THREE.BoxGeometry(1,1,1),im=new THREE.InstancedMesh(geo,MT.lime,180),m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),s=new THREE.Vector3(),p=new THREE.Vector3();let n=0;
  const heap=(cx,cz,r,cnt)=>{for(let i=0;i<cnt&&n<180;i++){const a=R()*Math.PI*2,d=R()*r;const sz=.5+R()*.9;p.set(cx+Math.cos(a)*d,sz*.35,cz+Math.sin(a)*d);e.set(R()*.6,R()*3,R()*.6);q.setFromEuler(e);s.set(sz*(1+R()*.6),sz*.7,sz);m4.compose(p,q,s);im.setMatrixAt(n++,m4)}};
  for(const[sx,sz]of[[1,1],[1,-1],[-1,1],[-1,-1]]){heap(X+sx*(BB+1.5),Z+sz*(BB+1.5),3.5,22);obs.push({x0:X+sx*(BB+1.5)-2.5,x1:X+sx*(BB+1.5)+2.5,z0:Z+sz*(BB+1.5)-2.5,z1:Z+sz*(BB+1.5)+2.5})}
  for(const[x,z]of[[X-BB-2.2,Z-14],[X-BB-2.2,Z+20],[X-10,Z-BB-2.2],[X+18,Z+BB+2.2],[X+BB+2.2,Z-22]]){heap(x,z,2,10);obs.push({x0:x-1.8,x1:x+1.8,z0:z-1.8,z1:z+1.8})}im.count=n;g.add(im)}
 map.push([X-BB,X+BB,Z-BB,Z+BB,'#d8c090']);pyNoSeam(g);return{obs,map}}

/* ---------------------------------------- models: sphinx, jackal, obelisk ---------------------------------------- */
/* a lying lion with a human head in a striped headdress, facing +z; about 6.4 long, 4.8 high at scale 1 */
function pySphinx(){const k=pyKit(),{M,MT}=k,g=new THREE.Group(),{A,B,Cy}=k.H(g);const ST=new THREE.MeshStandardMaterial({map:k.T.sand,color:0xf0dcb0,roughness:.9}),ST2=new THREE.MeshStandardMaterial({map:k.T.sand,color:0xd8c090,roughness:.9});
 B(3.4,.8,7.0,MT.dark,0,.4,-.1);/* the plinth */B(3.6,.12,7.2,MT.lime,0,.86,-.1);
 /* the body: a long rounded block, haunches, front paws stretched forward */{const b=A(new THREE.SphereGeometry(1,20,14),ST,0,1.9,-.9);b.scale.set(1.15,1.0,2.4);const hn=A(new THREE.SphereGeometry(1,16,12),ST,0,1.75,-2.6);hn.scale.set(1.35,.95,1.0);
  for(const s of[-1,1]){B(.62,.5,2.6,ST,s*.62,1.17,1.9);A(new THREE.SphereGeometry(.34,12,8),ST,s*.62,1.2,3.15).scale.set(1,.7,1.1);const leg=A(new THREE.SphereGeometry(1,12,10),ST,s*1.05,1.45,-2.4);leg.scale.set(.4,.6,.95);for(let t=0;t<3;t++)B(.1,.06,.12,ST2,s*.62+(t-1)*.18,.95,3.42)}
  /* the tail curled along the right flank */const tl=A(new THREE.TorusGeometry(.9,.1,6,16,Math.PI*1.1),ST,1.15,1.15,-2.4);tl.rotation.set(Math.PI/2,0,.4)}
 /* chest, the head with its striped headdress (nemes), lappets down the chest, a beard */
 {const ch=A(new THREE.SphereGeometry(1,16,12),ST,0,2.5,.65);ch.scale.set(1.0,1.15,.9);const hd=A(new THREE.SphereGeometry(.62,16,12),ST,0,3.75,1.15);hd.scale.set(.9,1.05,.95);
  const stripes=k.can(256,256,(x,w,h)=>{for(let i=0;i<16;i++){x.fillStyle=i%2?'#1e3a8a':'#e8c050';x.fillRect(0,i*16,w,16)}});const NM=new THREE.MeshStandardMaterial({map:stripes,roughness:.6});
  const cap=A(new THREE.SphereGeometry(.7,18,12,0,Math.PI*2,0,Math.PI*.6),NM,0,3.92,.82);cap.scale.set(1,1.05,1.05);
  for(const s of[-1,1]){const lp=B(.42,1.25,.22,NM,s*.62,3.1,1.25);lp.rotation.z=s*.12;const fl=B(.5,.9,.6,NM,s*.7,3.55,.85);fl.rotation.z=s*.25}
  B(.9,.08,.12,MT.gold,0,4.25,1.48);/* the brow band */Cy(.07,.05,.14,MT.gold,0,4.36,1.56,'z',null,8);
  /* the face: nose, eyes (lined), mouth, the false beard */B(.14,.22,.16,ST,0,3.72,1.76);for(const s of[-1,1]){B(.16,.05,.04,M(0x1a1a1a),s*.2,3.88,1.69);B(.18,.02,.03,MT.lapis,s*.2,3.94,1.69)}B(.22,.03,.03,M(0x8a5a3a),0,3.53,1.71);
  const bd=Cy(.09,.07,.55,ST2,0,3.18,1.62,null,null,10);for(let i=0;i<4;i++)Cy(.095,.095,.02,MT.lapis,0,3.0+i*.12,1.62,null,null,10)}
 /* a stela between the paws */B(.9,1.2,.2,ST2,0,1.5,2.5);g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return g}
/* a seated jackal on a plinth, facing +z; red collar for the traitor */
function pyJackal(o){o=o||{};const k=pyKit(),{M,MT}=k,g=new THREE.Group(),{A,B,Cy}=k.H(g),s=o.scale||1;const BS=MT.basalt,PL=new THREE.MeshStandardMaterial({map:k.T.sand,color:0xe8d0a0,roughness:.9});
 const a=(geo,m,x,y,z,sx,sy,sz)=>{const t=A(geo,m,x*s,y*s,z*s);t.scale.set((sx||1)*s,(sy||1)*s,(sz||1)*s);return t};
 if(o.round){a(new THREE.CylinderGeometry(.62,.66,.75,20),PL,0,.375,0);a(new THREE.CylinderGeometry(.7,.7,.1,20),PL,0,.8,0)}else{a(new THREE.BoxGeometry(1.1,.75,1.5),PL,0,.375,0);a(new THREE.BoxGeometry(1.2,.1,1.6),PL,0,.8,0)}/* round plinths for statues that turn */
 /* haunches, back, chest, front legs straight down, tail along the plinth */a(new THREE.SphereGeometry(.42,14,10),BS,0,1.12,-.35,1,.9,1.2);a(new THREE.SphereGeometry(.34,14,10),BS,0,1.55,.0,.95,1.3,.9);
 for(const sx of[-1,1]){a(new THREE.CylinderGeometry(.075,.085,.75,8),BS,sx*.14,1.2,.3);a(new THREE.BoxGeometry(.14,.06,.2),BS,sx*.14,.88,.38);a(new THREE.SphereGeometry(.22,10,8),BS,sx*.24,1.0,-.42,.7,.8,1.1)}
 a(new THREE.BoxGeometry(.12,.1,.6),BS,.2,.9,-.6);
 /* the neck, head, long snout, tall ears, gold eyes, a collar */a(new THREE.CylinderGeometry(.13,.17,.4,10),BS,0,1.98,.12);const hd=a(new THREE.SphereGeometry(.2,12,10),BS,0,2.23,.18,1,.95,1.1);
 const sn=a(new THREE.ConeGeometry(.11,.42,8),BS,0,2.17,.48);sn.rotation.x=Math.PI/2;for(const sx of[-1,1]){const e=a(new THREE.ConeGeometry(.08,.38,4),BS,sx*.1,2.52,.12);e.rotation.z=-sx*.12;a(new THREE.SphereGeometry(.028,6,6),MT.gold,sx*.09,2.28,.33)}
 a(new THREE.TorusGeometry(.17,.035,6,16),o.red?M(0xc01818,{emissive:0x400000}):MT.gold,0,1.86,.14,1,1,1).rotation.x=Math.PI/2+.25;
 g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return g}
/* an obelisk on a stepped base, gold pyramidion, carved glyphs on all four faces */
function pyObelisk(o){o=o||{};const k=pyKit(),{M,MT}=k,g=new THREE.Group(),{A,B}=k.H(g),h=o.h||9;
 const gl=k.can(128,1024,(x,w,hh)=>{x.fillStyle='#d6be90';x.fillRect(0,0,w,hh);for(let i=0;i<3000;i++){x.fillStyle='rgba(80,60,30,'+Math.random()*.08+')';x.fillRect(Math.random()*w,Math.random()*hh,2,2)}x.strokeStyle='rgba(90,60,25,.65)';x.fillStyle='rgba(90,60,25,.65)';x.lineWidth=3;
  for(let y=30;y<hh-20;y+=46){const t=(y*7)%5,cx=w/2;x.beginPath();if(t==0){x.arc(cx,y,14,0,7)}else if(t==1){x.moveTo(cx-16,y+12);x.lineTo(cx,y-14);x.lineTo(cx+16,y+12);x.closePath()}else if(t==2){x.moveTo(cx-18,y);x.bezierCurveTo(cx-6,y-16,cx+6,y+16,cx+18,y)}else if(t==3){x.ellipse(cx,y,16,8,0,0,7);x.moveTo(cx+4,y);x.arc(cx,y,4,0,7)}else{x.moveTo(cx,y-16);x.lineTo(cx,y+16);x.moveTo(cx-12,y-6);x.lineTo(cx+12,y-6)}x.stroke()}x.strokeRect(10,10,w-20,hh-20)});
 const GM=new THREE.MeshStandardMaterial({map:gl,roughness:.85});
 B(2.4,.35,2.4,MT.dark,0,.175,0);B(1.9,.35,1.9,MT.lime,0,.525,0);
 {const geo=new THREE.CylinderGeometry(.36*Math.SQRT2,.6*Math.SQRT2,h,4,1);const sh=A(geo,GM,0,.7+h/2,0);sh.rotation.y=Math.PI/4}
 {const c=A(new THREE.ConeGeometry(.36*Math.SQRT2,.8,4),MT.gold,0,.7+h+.4,0);c.rotation.y=Math.PI/4}
 g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return g}

/* ---------------------------------------- the gateway ---------------------------------------- */
function pyGateway(g){const k=pyKit(),{M,MT}=k,{A,B,Cy,rod,lab,flame}=k.H(g),{X,Z}=PYRV,obs=[],flames=[];const x1=X+41.5,x0=X+33.5,TH=7.4,D=x1-x0;
 const ST=new THREE.MeshStandardMaterial({map:k.T.sand,color:0xf0dcb0,roughness:.9});
 /* two battered pylon towers: wider at the foot, sloping inwards, with a torus edge and a cavetto cornice */
 for(const s of[-1,1]){const zi=Z+s*1.6,zo=Z+s*5.0;{const geo=new THREE.BoxGeometry(D+.04,TH,3.25),P=geo.attributes.position,uv=geo.attributes.uv;for(let i=0;i<P.count;i++){if(P.getY(i)>0&&P.getZ(i)*s>0)P.setZ(i,P.getZ(i)-s*.55)}
   for(let i=0;i<P.count;i++){const f=i/4|0,x=P.getX(i)+(x0+x1)/2+.02,y=P.getY(i)+TH/2,z=P.getZ(i)+Z+s*3.375;uv.setXY(i,(f<2?z:f<4?x:(f==4?x:-x))/2,(f==2||f==3?z:y)/2)}geo.computeVertexNormals();A(geo,ST,(x0+x1)/2+.02,TH/2,Z+s*3.375)}/* front 4 cm past the game's portal walls (they end at x1) *//* inner face 15 cm behind the passage wall (z 1.6), never on its plane */
  /* carved panels on the front face of each tower */const pn=k.can(256,512,(x,w,h)=>{x.fillStyle='#e0c898';x.fillRect(0,0,w,h);x.strokeStyle='#6a4a20';x.lineWidth=6;x.strokeRect(14,14,w-28,h-28);x.strokeStyle='#6a4a20';pyGlyph(x,0,w/2,150,80);pyGlyph(x,1,w/2,300,70);x.fillStyle='#1e3a8a';x.fillRect(30,380,w-60,10);x.fillRect(30,410,w-60,10);x.fillStyle='#a03020';x.fillRect(30,440,w-60,10)});
  const pm=A(new THREE.PlaneGeometry(2.2,4.2),new THREE.MeshStandardMaterial({map:pn,roughness:.85}),x1+.052,3.2,Z+s*3.25);pm.rotation.y=Math.PI/2;pm.rotation.x=0;
  /* the cornice: a box that leans out, and a rounded edge (torus) below it */const cz=Z+s*(1.6+(5.0-1.6-.55)/2);B(D+.9,.22,3.4,MT.lime,(x0+x1)/2+.15,TH+.11,cz);B(D+.65,.5,3.3,MT.lime,(x0+x1)/2+.125,TH-.24,cz);
  Cy(.1,.1,2.75,MT.lime,x1+.1,TH-.62,Z+s*(1.84+2.75/2-.05),'z',null,10);rod([x1+.1,0,zo],[x1+.1,TH-.62,zo-s*.55*(TH-.62)/TH],.1,MT.lime,null,10);
  obs.push({x0:x0,x1:x1+.2,z0:Math.min(zi,zo),z1:Math.max(zi,zo)})}
 /* the gate between the towers: lintel with the winged sun, the passage roof, carved jambs */
 B(D+.07,1.4,3.6,MT.lime,(x0+x1)/2+.035,5.5+.7,Z);/* 3 cm proud of the tower fronts */B(.2,.42,4.6,MT.lime,x1+.1,5.69,Z);/* its underside 2 cm below the lintel's */
 {const ws=k.can(1024,256,(x,w,h)=>{x.clearRect(0,0,w,h);const cx=w/2,cy=h/2;for(let i=0;i<7;i++){for(const s of[-1,1]){x.fillStyle=['#1e3a8a','#2a7a8a','#c84020','#1e3a8a','#e8c050','#2a7a8a','#1e3a8a'][i];x.beginPath();x.moveTo(cx+s*70,cy-50+i*14);x.quadraticCurveTo(cx+s*(240+i*30),cy-70+i*10,cx+s*(460-i*20),cy-30+i*12);x.lineTo(cx+s*(440-i*20),cy-16+i*12);x.quadraticCurveTo(cx+s*(240+i*30),cy-50+i*12,cx+s*70,cy-36+i*14);x.fill()}}
  x.fillStyle='#e8b830';x.beginPath();x.arc(cx,cy,64,0,7);x.fill();x.strokeStyle='#8a5a10';x.lineWidth=6;x.stroke();for(const s of[-1,1]){x.fillStyle='#2a8a3a';x.beginPath();x.ellipse(cx+s*80,cy+30,16,40,0,0,7);x.fill();x.fillStyle='#e8b830';x.beginPath();x.arc(cx+s*80,cy-6,12,0,7);x.fill()}});
  const p=A(new THREE.PlaneGeometry(3.6,.9),new THREE.MeshStandardMaterial({map:ws,transparent:true,roughness:.6}),x1+.085,6.25,Z);p.rotation.y=Math.PI/2}
 /* a carved panel on the game's portal roof block (y 3.9..5.5, front face at x1) between the door posts */{const tp=k.can(512,256,(x,w,h)=>{x.fillStyle='#d8c090';x.fillRect(0,0,w,h);x.strokeStyle='#6a4a20';x.lineWidth=6;x.strokeRect(10,10,w-20,h-20);[0,5,1,5,0].forEach((t,i)=>pyGlyph(x,t,w/2+(i-2)*92,h/2+10,58))});const p=A(new THREE.PlaneGeometry(3.1,1.5),new THREE.MeshStandardMaterial({map:tp,roughness:.85}),x1+.012,4.7,Z);p.rotation.y=Math.PI/2}
 {const jt=k.can(128,512,(x,w,h)=>{x.fillStyle='#dcc494';x.fillRect(0,0,w,h);x.strokeStyle='#6a4a20';[1,0,5,0,4,2].forEach((t,i)=>pyGlyph(x,t,w/2,60+i*78,30));x.lineWidth=4;x.strokeRect(8,8,w-16,h-16)});
  for(const s of[-1,1]){B(.3,5.5,.24,MT.lime,x1+.15,2.75,Z+s*1.72);/* in front of the passage wall's end, not level with it */const jp=A(new THREE.PlaneGeometry(.24,4.6),new THREE.MeshStandardMaterial({map:jt,roughness:.8}),x1+.312,2.5,Z+s*1.72);jp.rotation.y=Math.PI/2}}
 /* two braziers on bronze tripods, and the bollards (low stone posts with gold caps) that keep cars out */
 for(const s of[-1,1]){const bx=x1+1.9,bz=Z+s*3.1;for(let i=0;i<3;i++){const a=i/3*Math.PI*2;rod([bx,1.05,bz],[bx+Math.cos(a)*.42,0,bz+Math.sin(a)*.42],.03,M(0x8a6a30,{metalness:.7,roughness:.35}))}Cy(.4,.22,.32,M(0x8a6a30,{metalness:.7,roughness:.35,side:THREE.DoubleSide}),bx,1.2,bz,null,null,16,true);Cy(.22,.22,.02,M(0x8a6a30,{metalness:.7,roughness:.35}),bx,1.05,bz,null,null,16);Cy(.36,.36,.02,M(0x1a0e06),bx,1.3,bz,null,null,16);/* coals 6 cm below the rim */flames.push(flame(bx,1.31,bz,2.2));obs.push({x0:bx-.45,x1:bx+.45,z0:bz-.45,z1:bz+.45})}
 for(const bz of[-.95,.95]){const x=x1+1.2;Cy(.28,.34,.85,MT.lime,x,.425,Z+bz,null,null,12);A(new THREE.SphereGeometry(.28,12,8,0,Math.PI*2,0,Math.PI/2),MT.gold,x,.85,Z+bz);obs.push({x0:x-.3,x1:x+.3,z0:Z+bz-.3,z1:Z+bz+.3})}
 pyNoSeam(g);return{obs,flames}}

/* ---------------------------------------- the avenue ---------------------------------------- */
function pyAvenue(g){const k=pyKit(),{M,MT}=k,{A,B}=k.H(g),{X,Z}=PYRV,obs=[],map=[];const x0=X+41.51,x1=X+53;/* 1 cm clear of the door posts' backs */
 B(x1-x0,.06,7,MT.pave,(x0+x1)/2,.03,Z,null,2);for(const s of[-1,1])B(x1-x0,.14,.3,MT.lime,(x0+x1)/2,.07,Z+s*3.65,null,2);
 for(const x of[X+45.5,X+48,X+50.5])for(const s of[-1,1]){const j=pyJackal({scale:.8});j.position.set(x,0,Z+s*4.6);j.rotation.y=s>0?Math.PI:0;/* they face the avenue */g.add(j);obs.push({x0:x-.5,x1:x+.5,z0:Z+s*4.6-.65,z1:Z+s*4.6+.65})}
 for(const s of[-1,1]){const o=pyObelisk({h:8});o.position.set(X+53.2,0,Z+s*4.4);g.add(o);obs.push({x0:X+53.2-1.2,x1:X+53.2+1.2,z0:Z+s*4.4-1.2,z1:Z+s*4.4+1.2})}
 for(const s of[-1,1]){const sp=pySphinx();sp.position.set(X+45.9,0,Z+s*8.6);sp.rotation.y=Math.PI/2;/* facing east, down the avenue */g.add(sp);obs.push({x0:X+42.3,x1:X+49.7,z0:Z+s*8.6-1.8,z1:Z+s*8.6+1.8})}
 map.push([x0,x1,Z-3.5,Z+3.5,'#cbb489']);pyNoSeam(g);return{obs,map}}

/* ---------------------------------------- the dig camp ---------------------------------------- */
function pyDigCamp(g){const k=pyKit(),{M,MT,R}=k,{A,B,Cy,rod,lab}=k.H(g),obs=[],map=[];
 /* two ridge tents: canvas over a pole frame, guy ropes, one with its flap open */
 const tent=(x,z,ry,open)=>{const tg=new THREE.Group();tg.position.set(x,0,z);tg.rotation.y=ry;g.add(tg);const t=k.H(tg);const L=4,W=3,Hh=2.2;
  for(const s of[-1,1]){const sl=Math.hypot(W/2,Hh),a=Math.atan2(Hh,W/2);const p=t.A(new THREE.PlaneGeometry(L,sl),MT.canvas,s*W/4,Hh/2,0);p.rotation.set(-Math.PI/2,s*(Math.PI/2-a),Math.PI/2);p.rotation.order='YXZ';p.rotation.set(0,0,0);p.rotation.y=Math.PI/2;p.rotation.x=0;const gq=new THREE.Group();gq.position.set(s*W/4,Hh/2,0);tg.add(gq);gq.add(p);p.position.set(0,0,0);gq.rotation.z=s*(Math.PI/2-a)}
  for(const e of[-1,1]){const sh=new THREE.Shape();sh.moveTo(-W/2,0);sh.lineTo(W/2,0);sh.lineTo(0,Hh);sh.lineTo(-W/2,0);if(open&&e>0){}else{const m=t.A(new THREE.ShapeGeometry(sh),MT.canvas,0,0,e*L/2);}t.rod([0,0,e*L/2],[0,Hh+.15,e*L/2],.03,MT.wood)}
  if(open){for(const s of[-1,1]){const fl=new THREE.Shape();fl.moveTo(0,0);fl.lineTo(W/2,0);fl.lineTo(0,Hh);fl.lineTo(0,0);const m=t.A(new THREE.ShapeGeometry(fl),MT.canvas,0,0,L/2);m.scale.x=s;m.rotation.y=s*1.1}}
  t.rod([0,Hh+.02,-L/2],[0,Hh+.02,L/2],.03,MT.wood);for(const e of[-1,1])for(const s of[-1,1])t.rod([s*W/2*.6,Hh*.4,e*L/2],[s*(W/2+.9),0,e*(L/2+.6)],.008,M(0xc8b890));
  obs.push({x0:x-2.3,x1:x+2.3,z0:z-2.3,z1:z+2.3})};
 tent(-162,-1093,0,true);tent(-156.5,-1094,.15,false);
 /* the work table: trestles, a map held down with stones, brushes, a lamp, a coffee pot; two folding chairs */
 {const x=-158,z=-1087.2;B(2.2,.06,1.0,MT.wood,x,.8,z);for(const s of[-.85,.85]){rod([x+s,.78,z-.45],[x+s,0,z-.2],.03,MT.wood);rod([x+s,.78,z+.45],[x+s,0,z+.2],.03,MT.wood)}
  const mp=k.can(256,180,(c,w,h)=>{c.fillStyle='#e8d8b0';c.fillRect(0,0,w,h);c.strokeStyle='#6a4a20';c.lineWidth=2;c.strokeRect(20,20,120,120);c.strokeRect(40,40,40,40);c.beginPath();c.moveTo(140,80);c.lineTo(240,80);c.stroke();c.fillStyle='#c02020';c.font='bold 26px DoorsSans,Arial';c.fillText('X?',170,140);c.fillStyle='#3a2a1a';c.font='14px DoorsSans,Arial';c.fillText('SITE PLAN',150,30)});
  const m=A(new THREE.PlaneGeometry(.9,.63),new THREE.MeshStandardMaterial({map:mp,roughness:.9}),x-.4,.835,z);m.rotation.x=-Math.PI/2;for(const[a,b]of[[-.8,-.25],[0,.25]])A(new THREE.DodecahedronGeometry(.05,0),M(0x8a7a6a),x+a,.86,z+b);
  for(let i=0;i<3;i++){const b=B(.03,.02,.2,MT.wood,x+.4+i*.08,.84,z+.2);b.rotation.y=.3}Cy(.08,.1,.18,M(0x3a3a3a,{metalness:.5}),x+.75,.92,z-.25,null,null,10);Cy(.07,.09,.2,M(0x5a6a6a,{metalness:.6}),x+.5,.93,z-.3,null,null,10);
  for(const s of[-1,1]){const cg=new THREE.Group();cg.position.set(x+s*.6,0,z+.9);g.add(cg);const c=k.H(cg);c.B(.45,.04,.42,MT.canvas,0,.45,0);c.B(.45,.4,.04,MT.canvas,0,.7,.2);for(const a of[-.2,.2]){c.rod([a,.45,-.2],[a,0,.2],.015,M(0x3a3a3a));c.rod([a+Math.sign(a)*.035,.45,.2],[a+Math.sign(a)*.035,0,-.2],.015,M(0x3a3a3a))}/* the crossed legs side by side */}
  obs.push({x0:x-1.15,x1:x+1.15,z0:z-.55,z1:z+.55})}
 /* crates, a sieve on legs, a wheelbarrow, shovels */for(const[x,z,s,y]of[[-151,-1090.5,1,0],[-150.2,-1091.3,.8,0],[-151,-1092.2,.9,0],[-150.9,-1090.5,.6,.6]]){const c=B(.9*s,.6*s,.6*s,MT.wood,x,y+.3*s,z);lab('FRAGILE',.5*s,.12*s,null,'#3a2a1a',0,x,c.position.y,z+.3*s+.012,0)}obs.push({x0:-151.6,x1:-149.6,z0:-1092.7,z1:-1090});
 {const x=-153.5,z=-1086.5;B(1.2,.05,.8,MT.wood,x,.9,z);const sv=k.can(64,64,(c,w,h)=>{c.clearRect(0,0,w,h);c.strokeStyle='#6a6a6a';c.lineWidth=2;for(let i=0;i<w;i+=6){c.beginPath();c.moveTo(i,0);c.lineTo(i,h);c.stroke();c.beginPath();c.moveTo(0,i);c.lineTo(w,i);c.stroke()}});sv.wrapS=sv.wrapT=THREE.RepeatWrapping;sv.repeat.set(4,3);const p=A(new THREE.PlaneGeometry(1.0,.6),new THREE.MeshStandardMaterial({map:sv,transparent:true,alphaTest:.3,side:THREE.DoubleSide}),x,.93,z);p.rotation.x=-Math.PI/2;
  for(const a of[-.5,.5])for(const b of[-.3,.3])rod([x+a,.9,z+b],[x+a*1.2,0,z+b*1.3],.025,MT.wood);obs.push({x0:x-.7,x1:x+.7,z0:z-.5,z1:z+.5})}
 {const wg=new THREE.Group();wg.position.set(-149.5,0,-1086.2);wg.rotation.y=.6;g.add(wg);const w=k.H(wg);w.B(.7,.35,1.0,M(0x2a6a3a,{metalness:.4}),0,.55,0);w.Cy(.2,.2,.08,M(0x1a1a1a),0,.2,.6,'x',null,12);for(const s of[-1,1]){w.rod([s*.3,.45,-.4],[s*.3,.7,-1.1],.025,MT.wood);w.rod([s*.25,.38,-.3],[s*.25,0,-.4],.02,M(0x3a3a3a))}w.B(.6,.12,.8,M(0xc8a868),0,.73,0);obs.push({x0:-150.3,x1:-148.7,z0:-1087.1,z1:-1085.3})}
 for(let i=0;i<3;i++){const x=-155.4+i*.25;rod([x,0,-1084.4],[x+.05,1.5,-1084.2],.02,MT.wood);B(.22,.28,.03,M(0x5a5a5a,{metalness:.6}),x,.12,-1084.45).rotation.y=.1}
 /* the generator and lights on poles, a cable */{const x=-165.5,z=-1086;B(1.0,.7,.6,M(0xc89020,{metalness:.4,roughness:.5}),x,.45,z);B(1.05,.1,.65,M(0x2a2a2a),x,.06,z);Cy(.04,.04,.4,M(0x2a2a2a,{metalness:.6}),x+.35,1.0,z,null,null,8);obs.push({x0:x-.55,x1:x+.55,z0:z-.35,z1:z+.35});
  for(const[px,pz]of[[-160,-1084.4],[-152,-1096.5]]){rod([px,0,pz],[px,3.2,pz],.04,MT.wood);B(.3,.25,.25,M(0xfff0c8,{emissive:0xffe0a0,emissiveIntensity:.9}),px,3.05,pz+.15);obs.push({x0:px-.1,x1:px+.1,z0:pz-.1,z1:pz+.1})}rod([x,.3,z],[-160,.02,-1084.6],.015,M(0x1a1a1a));rod([-160,3.0,-1084.4],[-152,3.0,-1096.5],.008,M(0x1a1a1a))}
 /* the trench: a dug pit lined with planks, a ladder, a grid of string on pegs, a pot sticking out of the wall */
 {const x=-158,z=-1081.4;/* the trench is a dark recess drawn into the ground with raised spoil heaps; the player can walk round it */const pit=A(new THREE.PlaneGeometry(4,2.2),M(0x6a5030,{roughness:1}),x,.012,z);pit.rotation.x=-Math.PI/2;
  for(const s of[-1,1])B(4.2,.04,.12,MT.wood,x,.03,z+s*1.1);for(const s of[-1,1])B(.12,.04,2.2,MT.wood,x+s*2.05,.03,z);
  for(let i=0;i<=4;i++)for(let j=0;j<=2;j++){Cy(.02,.02,.4,MT.wood,x-2+i,.2,z-1.1+j*1.1,null,null,5)}for(let i=0;i<=4;i++)rod([x-2+i,.35,z-1.1],[x-2+i,.35,z+1.1],.004,M(0xe8e0c8));for(let j=0;j<=2;j++)rod([x-2,.35,z-1.1+j*1.1],[x+2,.35,z-1.1+j*1.1],.004,M(0xe8e0c8));
  const heap=A(new THREE.SphereGeometry(1,14,8,0,Math.PI*2,0,Math.PI/2),M(0xceb486,{roughness:1}),x+3.4,0,z);heap.scale.set(1.2,.42,1.5);Cy(.14,.1,.25,M(0xb86a3a),x-.6,.08,z+.3,null,null,10);
  obs.push({x0:x-2.1,x1:x+2.1,z0:z-1.2,z1:z+1.2},{x0:x+2.2,x1:x+4.6,z0:z-1.5,z1:z+1.5})}
 lab('EXCAVATION\nKEEP OUT\n(UNLESS YOU HAVE A BRUSH)',1.4,.7,'#f4ecd8','#a01010',0,-147.2,1.3,-1083.6,-Math.PI/2);rod([-147.25,0,-1083.6],[-147.25,1.7,-1083.6],.03,MT.wood);obs.push({x0:-147.4,x1:-147.1,z0:-1083.8,z1:-1083.4});
 map.push([-166,-148,-1097,-1083,'#e8e0c8']);pyNoSeam(g);return{obs,map,table:[-158,-1086.4]}}

/* ---------------------------------------- ruins in the sand ---------------------------------------- */
function pyRuins(g){const k=pyKit(),{M,MT,R}=k,{A,B,Cy}=k.H(g),obs=[];
 /* fallen columns: drums lying in a row, a capital, a stump still standing */const col=(x,z,ry,n)=>{const cg=new THREE.Group();cg.position.set(x,0,z);cg.rotation.y=ry;g.add(cg);const c=k.H(cg);for(let i=0;i<n;i++){const d=c.Cy(.55,.55,1.1,MT.lime,i*1.15+(R()-.5)*.1,.52,(R()-.5)*.15,'x',null,16);d.rotation.y=(R()-.5)*.15}c.Cy(.75,.55,.7,MT.lime,-.96,.75,.1,'x',null,16);obs.push({x0:x-3.4,x1:x+3.4,z0:z-3.4,z1:z+3.4})};
 col(-196,-1088,.3,4);Cy(.6,.65,1.3,MT.lime,-191.5,.95,-1086.2,null,null,16);/* stands on its base (top .3) */B(1.6,.3,1.6,MT.dark,-191.5,.15,-1086.2,null,2);
 /* a broken statue: a seated figure's legs and feet on its throne, the top half fallen beside it */{const x=-127,z=-995;B(2,1.2,2.6,MT.lime,x,.6,z,null,2);for(const s of[-1,1]){B(.45,1.1,.5,MT.lime,x+s*.35,1.8,z+.8,null,2);B(.5,.2,.8,MT.lime,x+s*.35,1.3,z+1.0,null,2)}B(1.2,.8,.8,MT.lime,x,1.6,z-.2,null,2);const top=A(new THREE.SphereGeometry(.5,12,10),MT.lime,x+2.2,.45,z+.6);top.scale.set(1,.9,1.1);B(1.0,.7,1.6,MT.lime,x+1.9,.35,z-.6,null,2).rotation.y=.4;obs.push({x0:x-1.1,x1:x+2.8,z0:z-1.5,z1:z+1.5})}
 /* fallen casing stones: smooth white blocks, one still showing its polished face */for(const[x,z,ry,s]of[[-221,-1050,.2,1.3],[-222.8,-1048,.9,1],[-220.6,-1052.6,1.4,.9],[-223.5,-1051.2,.5,.8]]){const b=B(1.6*s,.9*s,1.1*s,MT.lime,x,.4*s,z);b.rotation.set(0,ry,.15)}obs.push({x0:-224.6,x1:-219.4,z0:-1053.6,z1:-1046.8});
 pyNoSeam(g);return{obs}}

/* =====================================================================================================
   Batch 2: the ground floor's walls, ceilings, floor and torches; the entrance hall; the antechamber.
   The floor plan is the game's own grid (PYF below = the F list in pyrBuild, cells 3.2 m, cx(i)=X-25.6+3.2i),
   so collision and every prop stay exactly where they are.

   pyFloorplan(g)     every wall face as a painted panel ON the cell line (the game's wall boxes go), a ceiling
                      tile per floor cell at WH, the floor slab. Faces and ceiling stop at x = X+22 where the game's
                      portal walls and roof block take over. Returns {ceil (group, for cutaway), faces}.
   pyPortal(g)        the game's three portal boxes (same sizes and places) in the new stone, world-anchored texture.
   pyTorch(g,x,z,ry)  a bronze wall torch for the game's torch(x,z,ry) spots; its plate goes into the wall
                      (the old bracket floated 13 cm off it). Returns the group; userData.glow = where the
                      game's glow sprite and light go (local).
   pyDoorFrame(g,ax,at,c,side)  a carved frame on the room side of a doorway.
   pyEntrance(g)      the entrance hall: door frame into the antechamber, two wall torches (no light).
   pyAntechamber(g)   four papyrus columns, two guardian statues, door frames on all four doorways.
                      Returns {obs, torches}.
   pyStele(), pyScrollTable(), pyJar(), pySkeleton(), pyColumn(), pyGuardian()  models used here and later.
   ===================================================================================================== */
const PYF=[[11,16,8,8],[8,11,6,10],[9,9,2,5],[3,9,2,2],[1,2,1,3],[9,9,11,14],[3,9,14,14],[1,2,13,15],[5,7,8,8],[1,4,6,10]];
const pyCx=i=>PYRV.X-25.6+3.2*i,pyCz=j=>PYRV.Z-25.6+3.2*j;
const pyIsF=(()=>{const s=new Set();for(const[a,b,c,d]of PYF)for(let i=a;i<=b;i++)for(let j=c;j<=d;j++)s.add(i+','+j);return(i,j)=>s.has(i+','+j)})();
/* which part of the floor a cell is in (later batches add their own walls on top of this) */
/* the wall faces with a torch on them: [i, j, di, dj] (the game's eight spots and the two in the hall) */
const PYTF=[[8,7,-1,0],[8,9,-1,0],[11,6,1,0],[6,2,0,-1],[7,14,0,1,.8],[1,8,-1,0],[1,14,-1,0],[1,2,-1,0],[12,8,0,-1],[14,8,0,1]];/* 5th: the torch sits that far right of the panel's middle (seen from the room) */
const pyZone=(i,j)=>i>=1&&i<=2&&j>=1&&j<=3?'clueN':i>=1&&i<=2&&j>=13&&j<=15?'clueS':i>=12&&j==8?'hall':i>=8&&i<=11&&j>=6&&j<=10?'ante':i>=1&&i<=4&&j>=6&&j<=10?'treasure':j==2&&i>=3?'darts':j==14&&i>=3?'blades':'other';

/* one painted wall panel, 3.2 m wide by WH high (512 x 624 px, 160 px per metre). kind: plain, glyph, walk, boat, eye, offer */
function pyWallTex(kind,seed,op){op=op||{};const k=pyKit();const key='w'+kind+(seed|0)+JSON.stringify(op);if(k[key])return k[key];let sd=(seed|0)*977+13;const R=()=>{sd=(sd*16807)%2147483647;return sd/2147483647};
 const t=k.can(512,624,(x,w,h)=>{const Y=m=>h-m*160;/* metres up the wall to px */
  x.fillStyle=kind=='plain'?'#d2b98a':'#e2d0a6';x.fillRect(0,0,w,h);for(let i=0;i<9000;i++){x.fillStyle=R()<.5?'rgba(90,60,30,'+R()*.07+')':'rgba(255,248,230,'+R()*.08+')';x.fillRect(R()*w,R()*h,1+R()*3,1+R()*2)}
  /* stone courses (0.65 m) and joints every 0.8 m, staggered; faint under the plaster of the painted walls */
  x.strokeStyle=kind=='plain'?'rgba(100,72,40,.45)':'rgba(120,95,60,.14)';x.lineWidth=2;for(let c=0;c<6;c++){const y=Y(c*.65);x.beginPath();x.moveTo(0,y);x.lineTo(w,y);x.stroke();for(let u=(c%2)*64;u<w+1;u+=128){x.beginPath();x.moveTo(u,y);x.lineTo(u,Y((c+1)*.65));x.stroke()}}
  /* the dado: dark ochre with a yellow and a black line */x.fillStyle='#6a4426';x.fillRect(0,Y(.45),w,.45*160);x.fillStyle='#e0b040';x.fillRect(0,Y(.45)-4,w,4);x.fillStyle='#1a120a';x.fillRect(0,Y(.45)-7,w,3);
  /* the band of coloured blocks, and the kheker frieze along the top */const cols=['#b03020','#1e4a9a','#2a7a4a','#e0b040'];for(let u=0,i=0;u<w;u+=16,i++){x.fillStyle=cols[i%4];x.fillRect(u,Y(3.12),14,.14*160);x.fillStyle='#1a120a';x.fillRect(u+14,Y(3.12),2,.14*160)}
  x.fillStyle='#1a120a';x.fillRect(0,Y(3.14),w,3);x.fillRect(0,Y(2.98)-1,w,3);
  for(let u=0,i=0;u<w;u+=32,i++){x.fillStyle=cols[i%3];const y0=Y(3.86),y1=Y(3.2);x.beginPath();x.moveTo(u+6,y1);x.lineTo(u+6,y0+14);x.quadraticCurveTo(u+16,y0-4,u+26,y0+14);x.lineTo(u+26,y1);x.closePath();x.fill();x.fillStyle='#e8d8b0';x.beginPath();x.arc(u+16,y0+30,4,0,7);x.arc(u+16,y0+52,4,0,7);x.fill();x.fillStyle='#1a120a';x.fillRect(u+15,y0+60,2,y1-y0-64)}
  const top=Y(2.95),bot=Y(.55);
  if(kind=='glyph'){/* columns of signs between ruled lines */for(let c=0;c<7;c++){const u=36+c*68;x.strokeStyle='rgba(40,30,20,.6)';x.lineWidth=2;x.beginPath();x.moveTo(u-34,top);x.lineTo(u-34,bot);x.stroke();x.strokeStyle=c%2?'#1e4a9a':'#7a3a14';for(let r=0;r<6;r++)pyGlyph(x,(c*3+r*5+(seed|0))%6,u,top+34+r*58,22)}x.beginPath();x.moveTo(36+7*68-34,top);x.lineTo(36+7*68-34,bot);x.stroke()}
  if(kind=='walk'){/* two people walking with offerings (simple shapes, nobody in particular), a line of signs above */
   const fig=(cx,s,c,off)=>{const g0=bot,H2=2.0*160*s;x.save();x.translate(cx,g0);x.fillStyle=c;/* legs */x.beginPath();x.moveTo(-6,-H2*.45);x.lineTo(-30,0);x.lineTo(-20,0);x.lineTo(0,-H2*.38);x.lineTo(18,0);x.lineTo(30,0);x.lineTo(8,-H2*.45);x.fill();
    /* kilt */x.fillStyle='#f2ecdc';x.beginPath();x.moveTo(-18,-H2*.6);x.lineTo(20,-H2*.6);x.lineTo(30,-H2*.4);x.lineTo(-16,-H2*.42);x.fill();x.fillStyle=c;/* body */x.beginPath();x.moveTo(-16,-H2*.6);x.lineTo(-22,-H2*.83);x.lineTo(22,-H2*.83);x.lineTo(14,-H2*.6);x.fill();
    /* collar */x.fillStyle='#2a7a8a';x.beginPath();x.ellipse(0,-H2*.82,24,10,0,0,Math.PI);x.fill();/* head, wig */x.fillStyle=c;x.beginPath();x.ellipse(6,-H2*.9,13,16,0,0,7);x.fill();x.fillStyle='#14100c';x.beginPath();x.moveTo(-14,-H2*.98);x.quadraticCurveTo(4,-H2*1.04,18,-H2*.96);x.lineTo(16,-H2*.88);x.lineTo(-12,-H2*.82);x.fill();x.fillStyle='#fff';x.fillRect(12,-H2*.92,4,3);
    /* arms holding the offering out in front */x.strokeStyle=c;x.lineWidth=9;x.lineCap='round';x.beginPath();x.moveTo(18,-H2*.79);x.lineTo(42,-H2*.68);x.lineTo(52,-H2*.78);x.stroke();
    if(off==0){x.fillStyle='#c8a030';x.beginPath();x.moveTo(40,-H2*.8);x.lineTo(66,-H2*.8);x.lineTo(60,-H2*.92);x.lineTo(46,-H2*.92);x.fill();x.fillStyle='#2a7a4a';x.beginPath();x.arc(53,-H2*.97,9,0,7);x.fill()}else{x.fillStyle='#b03020';x.beginPath();x.ellipse(54,-H2*.88,10,16,0,0,7);x.fill();x.fillStyle='#e0b040';x.fillRect(46,-H2*.98,16,5)}x.restore()};
   fig(150,1,'#a0582c',0);fig(380,1,'#a0582c',1);x.strokeStyle='#1e4a9a';[0,1,5,2,4].forEach((g2,i)=>pyGlyph(x,g2,90+i*82,top+30,18))}
  if(kind=='boat'){/* the sun crossing the sky in a boat, water below */x.fillStyle='#7a4a24';x.beginPath();x.moveTo(60,bot-150);x.quadraticCurveTo(256,bot-60,452,bot-150);x.quadraticCurveTo(470,bot-190,486,bot-200);x.lineTo(470,bot-140);x.quadraticCurveTo(256,bot-30,42,bot-140);x.lineTo(26,bot-200);x.quadraticCurveTo(42,bot-190,60,bot-150);x.fill();
   x.fillStyle='#d8a020';x.fillRect(150,bot-150,212,14);x.fillStyle='#e8b830';x.beginPath();x.arc(256,bot-230,62,0,7);x.fill();x.strokeStyle='#8a5a10';x.lineWidth=5;x.stroke();x.strokeStyle='#2a7a4a';x.lineWidth=6;x.beginPath();x.arc(256,bot-230,74,Math.PI*1.1,Math.PI*1.9);x.stroke();
   x.strokeStyle='#1e4a9a';x.lineWidth=3;for(let r=0;r<3;r++){x.beginPath();for(let u=20;u<w-20;u+=24){x.lineTo(u,bot-40+r*14);x.lineTo(u+12,bot-50+r*14)}x.stroke()}x.strokeStyle='#7a3a14';[2,0,1,0,2].forEach((g2,i)=>pyGlyph(x,g2,90+i*82,top+34,18))}
  if(kind=='eye'){x.strokeStyle='#1a120a';x.lineWidth=14;x.lineCap='round';const cy=(top+bot)/2-10;x.beginPath();x.moveTo(110,cy);x.quadraticCurveTo(256,cy-130,400,cy);x.quadraticCurveTo(256,cy+80,110,cy);x.stroke();x.fillStyle='#1e4a9a';x.beginPath();x.arc(256,cy-12,42,0,7);x.fill();x.fillStyle='#1a120a';x.beginPath();x.arc(256,cy-12,20,0,7);x.fill();
   x.beginPath();x.moveTo(100,cy-80);x.quadraticCurveTo(256,cy-170,420,cy-70);x.stroke();x.beginPath();x.moveTo(230,cy+40);x.lineTo(196,cy+150);x.quadraticCurveTo(170,cy+180,150,cy+140);x.stroke();x.beginPath();x.moveTo(300,cy+40);x.lineTo(330,cy+130);x.lineTo(380,cy+140);x.stroke();
   x.strokeStyle='#7a3a14';for(let r=0;r<4;r++){pyGlyph(x,r%6,46,top+40+r*70,18);pyGlyph(x,(r+3)%6,466,top+40+r*70,18)}}
  if(kind=='torch'){/* a wall with a torch on it: carvings at the sides, the middle left clear, soot above the flame */for(const u of[40,110,402,472]){x.strokeStyle=u<256?'#7a3a14':'#1e4a9a';for(let r=0;r<6;r++)pyGlyph(x,(u+r*5)%6,u,top+34+r*58,20)}
   x.strokeStyle='rgba(40,30,20,.6)';x.lineWidth=2;for(const u of[150,362]){x.beginPath();x.moveTo(u,top);x.lineTo(u,bot);x.stroke()}
   const su=256+(op.o||0)*160,sy=Y(2.5),gr=x.createRadialGradient(su,sy-40,4,su,sy-40,110);gr.addColorStop(0,'rgba(20,14,8,.55)');gr.addColorStop(1,'rgba(20,14,8,0)');x.fillStyle=gr;x.beginPath();x.ellipse(su,sy-50,70,130,0,0,7);x.fill()}
  if(kind=='darts'){/* rows of dart holes at 0.8..2.0 m, warning signs above */for(let r=0;r<5;r++)for(let c=0;c<13;c++){const u=16+c*40+(r%2)*20,y=Y(.8+r*.3);x.fillStyle='rgba(60,40,20,.5)';x.beginPath();x.arc(u+1,y+1,9,0,7);x.fill();x.fillStyle='#0c0806';x.beginPath();x.arc(u,y,6,0,7);x.fill()}
   x.strokeStyle='#b03020';[1,0,1,0].forEach((t2,i)=>pyGlyph(x,t2,96+i*106,top+34,20))}
  if(kind=='scribe'){/* a scribe sitting cross-legged with a papyrus on his knees (nobody in particular) */const cx=256,g0=bot-6;x.fillStyle='#a0582c';x.beginPath();x.ellipse(cx,g0-40,90,40,0,Math.PI,0);x.fill();x.fillStyle='#f2ecdc';x.beginPath();x.ellipse(cx,g0-44,84,30,0,Math.PI,0);x.fill();
   x.fillStyle='#a0582c';x.beginPath();x.moveTo(cx-40,g0-60);x.lineTo(cx-46,g0-170);x.lineTo(cx+40,g0-170);x.lineTo(cx+34,g0-60);x.fill();x.beginPath();x.ellipse(cx,g0-200,24,28,0,0,7);x.fill();x.fillStyle='#14100c';x.beginPath();x.ellipse(cx,g0-212,28,22,0,Math.PI,0);x.fill();x.fillRect(cx-28,g0-212,10,30);x.fillRect(cx+18,g0-212,10,30);
   x.fillStyle='#ecdcac';x.fillRect(cx-60,g0-82,120,16);x.strokeStyle='#a0582c';x.lineWidth=10;x.lineCap='round';x.beginPath();x.moveTo(cx-38,g0-150);x.lineTo(cx-56,g0-90);x.moveTo(cx+38,g0-150);x.lineTo(cx+50,g0-92);x.stroke();
   x.strokeStyle='#1e4a9a';for(let r=0;r<5;r++){pyGlyph(x,(r+2)%6,60,top+36+r*62,20);pyGlyph(x,(r+5)%6,452,top+36+r*62,20)}}
  if(kind=='scarab'){/* a big scarab rolling the sun */const cx=256,cy=(top+bot)/2+20;x.fillStyle='#e8b830';x.beginPath();x.arc(cx,cy-120,50,0,7);x.fill();x.strokeStyle='#8a5a10';x.lineWidth=5;x.stroke();
   x.fillStyle='#1e4a9a';x.beginPath();x.ellipse(cx,cy+20,62,80,0,0,7);x.fill();x.fillStyle='#2a6ab0';x.beginPath();x.ellipse(cx,cy-60,40,24,0,0,7);x.fill();x.strokeStyle='#0c1a3a';x.lineWidth=4;x.beginPath();x.moveTo(cx,cy-40);x.lineTo(cx,cy+100);x.stroke();
   x.strokeStyle='#1e4a9a';x.lineWidth=8;for(const s of[-1,1]){x.beginPath();x.moveTo(cx+s*50,cy-50);x.lineTo(cx+s*80,cy-90);x.moveTo(cx+s*60,cy+10);x.lineTo(cx+s*100,cy);x.moveTo(cx+s*55,cy+60);x.lineTo(cx+s*95,cy+100);x.stroke()}
   x.strokeStyle='#7a3a14';for(let r=0;r<5;r++){pyGlyph(x,(r+5)%6,60,top+36+r*62,20);pyGlyph(x,r%6,452,top+36+r*62,20)}}
  if(kind=='blades'){x.lineWidth=2;for(const c of[0,1,5,6]){const u=36+c*68;x.strokeStyle=c%2?'#1e4a9a':'#7a3a14';for(let r=0;r<6;r++)pyGlyph(x,(c*3+r*5)%6,u,top+34+r*58,22)}}
  if(op.slit){/* the slot the swinging blade passes through, at the middle of the panel, 1.0..2.1 m up */x.fillStyle='rgba(30,20,10,.5)';x.fillRect(250,Y(2.15),14,1.2*160);x.fillStyle='#050302';x.fillRect(252,Y(2.1),9,1.1*160);
   x.strokeStyle='#b03020';x.lineWidth=4;x.beginPath();x.moveTo(200,Y(2.4));x.lineTo(312,Y(2.4));x.stroke()}
  if(kind=='jackals'){/* a procession of jackals lying on shrines (our own drawing) */for(let i=0;i<2;i++){const cx=128+i*256,g0=bot-30;x.fillStyle='#e0b040';x.fillRect(cx-70,g0-30,140,30);x.fillStyle='#1e3a6a';x.fillRect(cx-70,g0-34,140,6);
    x.fillStyle='#14100c';x.beginPath();x.ellipse(cx-6,g0-56,52,22,0,0,7);x.fill();x.beginPath();x.ellipse(cx+46,g0-84,15,20,0,0,7);x.fill();x.beginPath();x.moveTo(cx+52,g0-90);x.lineTo(cx+86,g0-80);x.lineTo(cx+56,g0-74);x.fill();
    x.beginPath();x.moveTo(cx+38,g0-96);x.lineTo(cx+36,g0-140);x.lineTo(cx+50,g0-100);x.moveTo(cx+48,g0-98);x.lineTo(cx+54,g0-138);x.lineTo(cx+60,g0-96);x.fill();x.fillRect(cx+20,g0-44,60,10);x.fillRect(cx-70,g0-44,20,8);x.fillStyle='#e0b040';x.fillRect(cx+36,g0-76,22,5)}
   x.strokeStyle='#7a3a14';[0,1,5,0,1,5].forEach((t2,i)=>pyGlyph(x,t2,48+i*84,top+40,20))}
  if(kind=='sunrays'){/* the sun with rays ending in little hands, people raising their arms */const cx=256,cy=top+90;x.fillStyle='#e8b830';x.beginPath();x.arc(cx,cy,46,0,7);x.fill();x.strokeStyle='#c89020';x.lineWidth=4;
   for(let i=0;i<9;i++){const a=Math.PI*(.15+.7*i/8);const ex=cx+Math.cos(a)*190,ey=cy+Math.sin(a)*190;x.beginPath();x.moveTo(cx+Math.cos(a)*50,cy+Math.sin(a)*50);x.lineTo(ex,ey);x.stroke();x.fillStyle='#c89020';x.beginPath();x.arc(ex,ey,6,0,7);x.fill()}
   for(const u of[90,422]){x.fillStyle='#a0582c';x.fillRect(u-10,bot-150,20,90);x.beginPath();x.arc(u,bot-165,14,0,7);x.fill();x.strokeStyle='#a0582c';x.lineWidth=8;x.beginPath();x.moveTo(u-8,bot-140);x.lineTo(u-26,bot-200);x.moveTo(u+8,bot-140);x.lineTo(u+26,bot-200);x.stroke();x.fillStyle='#f2ecdc';x.fillRect(u-14,bot-70,28,40);x.fillStyle='#a0582c';x.fillRect(u-12,bot-30,8,30);x.fillRect(u+4,bot-30,8,30)}}
  if(kind=='music'){/* a harpist and a flute player (nobody in particular) */for(const[u,inst]of[[150,0],[370,1]]){const g0=bot-6;x.fillStyle='#a0582c';x.fillRect(u-14,g0-150,28,80);x.beginPath();x.arc(u,g0-170,16,0,7);x.fill();x.fillStyle='#14100c';x.beginPath();x.ellipse(u,g0-178,18,12,0,Math.PI,0);x.fill();x.fillStyle='#f2ecdc';x.fillRect(u-18,g0-72,36,60);x.fillStyle='#a0582c';x.fillRect(u-12,g0-12,9,12);x.fillRect(u+3,g0-12,9,12);
    x.strokeStyle='#a0582c';x.lineWidth=8;x.lineCap='round';if(inst==0){x.beginPath();x.moveTo(u+10,g0-130);x.lineTo(u+40,g0-110);x.stroke();x.strokeStyle='#7a4a24';x.lineWidth=7;x.beginPath();x.moveTo(u+40,g0-30);x.quadraticCurveTo(u+90,g0-130,u+50,g0-200);x.stroke();x.lineWidth=2;for(let i=0;i<6;i++){x.beginPath();x.moveTo(u+42+i*4,g0-40-i*12);x.lineTo(u+50,g0-190+i*6);x.stroke()}}
    else{x.beginPath();x.moveTo(u+10,g0-135);x.lineTo(u+30,g0-160);x.stroke();x.strokeStyle='#7a4a24';x.lineWidth=5;x.beginPath();x.moveTo(u+10,g0-168);x.lineTo(u+80,g0-120);x.stroke()}}
   x.strokeStyle='#1e4a9a';[6,2,5,0,1].forEach((t2,i)=>pyGlyph(x,t2,90+i*82,top+34,18))}
  if(kind=='dunes'){/* dunes under the sun, an hourglass of sand pouring */x.fillStyle='#e8b830';x.beginPath();x.arc(380,top+80,40,0,7);x.fill();x.fillStyle='#c89a50';x.beginPath();x.moveTo(0,bot);x.quadraticCurveTo(120,bot-140,260,bot-60);x.quadraticCurveTo(380,bot-180,512,bot-70);x.lineTo(512,bot);x.fill();x.fillStyle='#b08040';x.beginPath();x.moveTo(0,bot);x.quadraticCurveTo(200,bot-70,512,bot-20);x.lineTo(512,bot);x.fill();
   const hx=120,hy=top+120;x.strokeStyle='#5a3a14';x.lineWidth=5;x.beginPath();x.moveTo(hx-40,hy-70);x.lineTo(hx+40,hy-70);x.lineTo(hx,hy);x.lineTo(hx+40,hy+70);x.lineTo(hx-40,hy+70);x.lineTo(hx,hy);x.closePath();x.stroke();x.fillStyle='#d8a050';x.beginPath();x.moveTo(hx-30,hy+64);x.lineTo(hx+30,hy+64);x.lineTo(hx,hy+20);x.fill();x.fillRect(hx-2,hy,4,40)}
  if(kind=='busboat'){/* the Pharaoh sailing the sky: a sun boat that is, unmistakably, a bus */const cx=256,cy=top+160;x.fillStyle='#7a4a24';x.beginPath();x.moveTo(40,cy+30);x.quadraticCurveTo(256,cy+110,472,cy+30);x.lineTo(490,cy-20);x.lineTo(456,cy+40);x.quadraticCurveTo(256,cy+80,56,cy+40);x.lineTo(22,cy-20);x.fill();
   x.fillStyle='#e0b040';x.fillRect(150,cy-60,220,80);x.fillStyle='#1e3a8a';for(let i=0;i<5;i++)x.fillRect(160+i*42,cy-50,32,28);x.fillStyle='#14100c';x.beginPath();x.arc(190,cy+22,16,0,7);x.arc(330,cy+22,16,0,7);x.fill();x.fillStyle='#b03020';x.fillRect(150,cy-6,220,8);
   x.fillStyle='#e8b830';x.beginPath();x.arc(cx,cy-110,34,0,7);x.fill();x.strokeStyle='#1e4a9a';x.lineWidth=3;for(let r=0;r<2;r++){x.beginPath();for(let u=20;u<w-20;u+=24){x.lineTo(u,bot-30+r*14);x.lineTo(u+12,bot-40+r*14)}x.stroke()}}
  if(kind=='offer'){/* an offering table piled with bread, jars and lotus flowers */const ty=bot-120;x.fillStyle='#7a4a24';x.fillRect(200,ty,112,12);x.fillRect(250,ty,12,120);x.fillRect(220,bot-8,72,8);
   x.fillStyle='#d8a050';for(let i=0;i<4;i++){x.beginPath();x.ellipse(214+i*28,ty-16,12,16,0,0,7);x.fill()}x.fillStyle='#b03020';x.beginPath();x.ellipse(232,ty-50,14,20,0,0,7);x.fill();x.fillStyle='#2a7a8a';x.beginPath();x.ellipse(282,ty-50,14,20,0,0,7);x.fill();
   for(const s of[-1,1]){x.strokeStyle='#2a7a4a';x.lineWidth=4;x.beginPath();x.moveTo(256+s*20,ty-60);x.quadraticCurveTo(256+s*50,ty-120,256+s*70,ty-150);x.stroke();x.fillStyle='#4a8ab0';x.beginPath();x.moveTo(256+s*70,ty-150);x.lineTo(256+s*56,ty-180);x.lineTo(256+s*70,ty-170);x.lineTo(256+s*84,ty-180);x.fill()}
   for(let r=0;r<5;r++){x.strokeStyle=r%2?'#1e4a9a':'#7a3a14';pyGlyph(x,(r+1)%6,60,top+36+r*62,20);pyGlyph(x,(r+4)%6,452,top+36+r*62,20)}}
 if(op.old){/* the undercroft: older, darker, the paint worn */x.fillStyle='rgba(50,36,20,.32)';x.fillRect(0,0,w,h);for(let i=0;i<40;i++){x.fillStyle='rgba(200,180,140,'+R()*.25+')';x.beginPath();x.ellipse(R()*w,R()*h,10+R()*40,4+R()*20,R()*3,0,7);x.fill()}}
 });t.anisotropy=8;return k[key]=t}
function pyCeilTex(){const k=pyKit();if(k.ceil)return k.ceil;return k.ceil=k.can(256,256,(x,w,h)=>{x.fillStyle='#16244a';x.fillRect(0,0,w,h);for(let i=0;i<2500;i++){x.fillStyle='rgba(255,255,255,'+Math.random()*.03+')';x.fillRect(Math.random()*w,Math.random()*h,2,2)}
 x.fillStyle='#e8c050';for(let i=0;i<4;i++)for(let j=0;j<4;j++){const cx=32+i*64+(j%2)*32,cy=32+j*64;x.beginPath();for(let a=0;a<10;a++){const r=a%2?5:13,an=a*Math.PI/5-Math.PI/2;x.lineTo(cx+Math.cos(an)*r,cy+Math.sin(an)*r)}x.closePath();x.fill()}},1)}
function pyStoneMat(){const k=pyKit();if(k.stone)return k.stone;const t=k.can(256,256,(x,w,h)=>{x.fillStyle='#cdb385';x.fillRect(0,0,w,h);for(let i=0;i<5000;i++){x.fillStyle=Math.random()<.5?'rgba(90,60,30,'+Math.random()*.09+')':'rgba(255,248,230,'+Math.random()*.09+')';x.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*3,2)}
 x.strokeStyle='rgba(100,72,40,.45)';x.lineWidth=2;for(let c=0;c<4;c++){x.beginPath();x.moveTo(0,c*64);x.lineTo(w,c*64);x.stroke();for(let u=(c%2)*51;u<w;u+=102){x.beginPath();x.moveTo(u,c*64);x.lineTo(u,c*64+64);x.stroke()}}},1);
 /* 256 px = 2.6 m: courses 0.65 m like the painted walls */return k.stone=new THREE.MeshStandardMaterial({map:t,roughness:.9})}
function pyFloorMat(){const k=pyKit();if(k.flr)return k.flr;const t=k.can(256,256,(x,w,h)=>{x.fillStyle='#b89c6c';x.fillRect(0,0,w,h);for(let i=0;i<6000;i++){x.fillStyle=Math.random()<.5?'rgba(70,50,25,'+Math.random()*.1+')':'rgba(255,245,220,'+Math.random()*.08+')';x.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*3,1+Math.random()*3)}
 x.strokeStyle='rgba(60,42,20,.55)';x.lineWidth=3;/* 1.6 m slabs, every other row split in two */for(let r=0;r<2;r++){x.beginPath();x.moveTo(0,r*128+1);x.lineTo(w,r*128+1);x.stroke();for(let u=0;u<w;u+=r?64:128){x.beginPath();x.moveTo(u+1,r*128);x.lineTo(u+1,r*128+128);x.stroke()}}
 for(let i=0;i<8;i++){x.strokeStyle='rgba(60,42,20,.25)';x.lineWidth=1;x.beginPath();let px=Math.random()*w,py=Math.random()*h;x.moveTo(px,py);for(let s=0;s<4;s++){px+=(Math.random()-.5)*30;py+=(Math.random()-.5)*30;x.lineTo(px,py)}x.stroke()}},1);
 return k.flr=new THREE.MeshStandardMaterial({map:t,roughness:.95})}

function pyFloorplan(g){const k=pyKit(),{X,Z,WH}=PYRV,C=3.2,XC=X+22,ceil=new THREE.Group(),faces=[];g.add(ceil);const mats={};const WM=(kind,sd,op)=>{const key=kind+sd+JSON.stringify(op||{});return mats[key]||(mats[key]=new THREE.MeshStandardMaterial({map:pyWallTex(kind,sd,op),roughness:.88}))};
 /* the kind of painting on each face: the hall alternates people and signs, the antechamber has a scene on each wall */
 const pick=(i,j,di,dj)=>{const z=pyZone(i,j),sl=z=='blades'&&i>=4&&i<=7&&dj!=0;const tf=PYTF.find(t=>t[0]==i&&t[1]==j&&t[2]==di&&t[3]==dj);if(tf)return['torch',{o:tf[4]||0,slit:sl}];
  if(z=='darts'&&dj!=0&&i>=3&&i<=8)return 'darts';if(sl)return['blades',{slit:1}];if(z=='clueN')return(i+j)%2?'scribe':'glyph';if(z=='clueS')return(i+j)%2?'scarab':'glyph';if(z=='hall')return(i+(dj>0?1:0))%2?'walk':'glyph';
  if(z=='ante'){if(di<0)return j==6||j==10?'eye':'glyph';if(di>0)return 'glyph';return(i==8||i==11)?'offer':'boat'}
  if(z=='treasure')return(i+j)%2?'glyph':'offer';return(i+j)%3?'plain':'glyph'};
 for(let i=0;i<17;i++)for(let j=0;j<17;j++){if(!pyIsF(i,j))continue;const x=pyCx(i),z=pyCz(j);
  for(const[di,dj]of[[1,0],[-1,0],[0,1],[0,-1]]){if(pyIsF(i+di,j+dj))continue;
   /* the face sits on the cell line and looks back into the cell; clipped at x = X+22 (the portal takes over) */let a0=-C/2,a1=C/2;const fx=x+di*C/2,fz=z+dj*C/2;
   if(dj!=0){if(x+a0>=XC)continue;if(x+a1>XC)a1=XC-x}else if(fx>XC)continue;const w=a1-a0;
   const geo=new THREE.PlaneGeometry(w,WH);const uv=geo.attributes.uv;for(let v=0;v<uv.count;v++)uv.setX(v,uv.getX(v)*w/C);
   const pk=pick(i,j,di,dj),m=new THREE.Mesh(geo,Array.isArray(pk)?WM(pk[0],(i*7+j*3)%4,pk[1]):WM(pk,(i*7+j*3)%4));const ry=di>0?-Math.PI/2:di<0?Math.PI/2:dj>0?Math.PI:0;m.rotation.y=ry;
   /* along the face, a0..a1 run left to right as seen from the cell */const mid=(a0+a1)/2;if(dj!=0)m.position.set(x+(dj>0?-mid:mid)*-1*(dj>0?1:-1)*-1,WH/2,fz);else m.position.set(fx,WH/2,z);if(dj!=0)m.position.x=x+mid;
   g.add(m);faces.push({m,i,j,di,dj})}
  /* the ceiling tile: stars in rooms and corridors alike; clipped like the walls */{let a0=-C/2,a1=C/2;if(x+a0>=XC)continue;if(x+a1>XC)a1=XC-x;const w=a1-a0,geo=new THREE.PlaneGeometry(w,C),uv=geo.attributes.uv;for(let v=0;v<uv.count;v++)uv.setX(v,uv.getX(v)*w/C);
   const m=new THREE.Mesh(geo,k.ceilM||(k.ceilM=new THREE.MeshStandardMaterial({map:pyCeilTex(),roughness:.8})));m.rotation.x=Math.PI/2;m.position.set(x+(a0+a1)/2,WH,z);ceil.add(m)}}
 /* the floor: the game's 76 m slab (top at 5 cm), slabs lined up with the cells */{const B2=PYRV.B*2;const geo=k.boxGeo(B2,.06,B2,3.2,[X+.0,.02,Z+.0]);const uv=geo.attributes.uv;for(let v=0;v<uv.count;v++)uv.setXY(v,uv.getX(v)+1.6/3.2*0,uv.getY(v));const m=new THREE.Mesh(geo,pyFloorMat());m.position.set(X,.02,Z);g.add(m)}
 g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{ceil,faces}}
function pyPortal(g){const k=pyKit(),{X,Z,WH}=PYRV,{B}=k.H(g),px0=X+22,px1=X+41.5,ST=pyStoneMat();
 for(const sd of[-1,1])B(px1-px0,5.5,2.2,ST,(px0+px1)/2,2.75,Z+sd*2.7,null,2.6);B(px1-px0,1.6,3.2,ST,(px0+px1)/2,WH+.8,Z,null,2.6);pyNoSeam(g)}

function pyTorch(g,x,z,ry,wo){wo=wo==null?.15:wo;const k=pyKit(),{M}=k,t0=new THREE.Group();t0.position.set(x,0,z);t0.rotation.y=ry;g.add(t0);const t=new THREE.Group();t.position.z=.15-wo;t0.add(t);t0.userData=t.userData;const{B,Cy,rod}=k.H(t);const BR=M(0x8a6a30,{metalness:.75,roughness:.35});
 /* the plate goes through the wall line (the wall is 15 cm behind the old torch spot) */B(.2,.36,.06,BR,0,2.0,-.14);Cy(.03,.03,.02,BR,0,2.12,-.105,'z',null,8);
 rod([0,1.94,-.12],[0,2.2,.16],.025,BR);rod([0,2.06,-.12],[0,2.2,.16],.02,BR);/* the cup: open bronze bowl, coals 4 cm under its rim */Cy(.15,.07,.14,M(0x8a6a30,{metalness:.75,roughness:.35,side:THREE.DoubleSide}),0,2.28,.2,null,null,12,true);Cy(.07,.07,.01,BR,0,2.215,.2,null,null,12);Cy(.13,.13,.012,M(0x1a0e06),0,2.31,.2,null,null,12);
 const f=k.H(t).flame(0,2.31,.2,1.1);t.userData.flame=f;t.userData.glow=[0,2.48,.37-wo];pyNoSeam(t0);return t0}

/* a frame on the room side of a doorway. ax 'x': the doorway is in a wall on the line x = at, the opening is
   centred on z = c and the room is on the side 'side' (+1: x > at). ax 'z': the same, turned. */
function pyDoorFrame(g,ax,at,c,side){const k=pyKit(),{M,MT}=k,{B,A}=k.H(g),{WH}=PYRV;const ST=new THREE.MeshStandardMaterial({map:k.T.lime,color:0xf2e6c8,roughness:.85});
 const P=(a,b,h,w,d,y)=>ax=='x'?B(d,h,w,ST,at+side*a,y,c+b):B(w,h,d,ST,c+b,y,at+side*a);
 /* jambs straddle the wall line (from 5 cm behind it to 10 cm in front) and overlap the corridor walls */for(const s of[-1,1])P(.025,s*1.7,WH-.5,.5,.15,(WH-.5)/2);
 /* the lintel: wider and 2 cm deeper than the jambs, through the ceiling line */P(.03,0,.58,4.0,.19,WH-.27);
 /* the winged sun painted on its front */const t=k.can(512,64,(x,w,h)=>{x.fillStyle='#ecdcb4';x.fillRect(0,0,w,h);const cx=w/2,cy=h/2;for(let i=0;i<3;i++)for(const s of[-1,1]){x.fillStyle=['#1e4a9a','#b03020','#2a7a4a'][i];x.beginPath();x.moveTo(cx+s*30,cy-14+i*9);x.quadraticCurveTo(cx+s*120,cy-20+i*8,cx+s*230,cy-8+i*8);x.lineTo(cx+s*220,cy-2+i*8);x.quadraticCurveTo(cx+s*120,cy-12+i*8,cx+s*30,cy-6+i*9);x.fill()}x.fillStyle='#e8b830';x.beginPath();x.arc(cx,cy,20,0,7);x.fill()});
 const p=A(new THREE.PlaneGeometry(3.6,.45),new THREE.MeshStandardMaterial({map:t,roughness:.7}),0,WH-.28,0);const off=.03+.095+.012;if(ax=='x'){p.position.set(at+side*off,WH-.28,c);p.rotation.y=side>0?Math.PI/2:-Math.PI/2}else{p.position.set(c,WH-.28,at+side*off);p.rotation.y=side>0?0:Math.PI}
 pyNoSeam(g)}

/* a papyrus-bundle column from the floor to the ceiling */
function pyColumn(){const k=pyKit(),{M,MT}=k,g=new THREE.Group(),{A,B,Cy}=k.H(g),{WH}=PYRV;
 const st=k.can(256,512,(x,w,h)=>{x.fillStyle='#e2d0a6';x.fillRect(0,0,w,h);for(let i=0;i<3000;i++){x.fillStyle='rgba(90,60,30,'+Math.random()*.07+')';x.fillRect(Math.random()*w,Math.random()*h,2,2)}
  /* the bundle's ridges */for(let u=0;u<w;u+=32){x.fillStyle='rgba(120,90,50,.25)';x.fillRect(u,0,6,h)}/* a panel of signs on the front, coloured bands */x.fillStyle='#e8d8b0';x.fillRect(96,120,64,300);x.strokeStyle='#1e4a9a';[0,1,5,2].forEach((t2,i)=>pyGlyph(x,t2,128,160+i*70,20));
  const cols=['#1e4a9a','#b03020','#2a7a4a','#e0b040'];for(let b=0;b<4;b++){x.fillStyle=cols[b];x.fillRect(0,40+b*12,w,10);x.fillRect(0,h-30-b*12,w,10)}});
 const SM=new THREE.MeshStandardMaterial({map:st,roughness:.85});
 Cy(.62,.66,.16,MT.lime,0,.08,0,null,null,24);/* base */Cy(.42,.46,WH-.95,SM,0,.1+(WH-.95)/2,0,null,null,24);
 /* the ties under the flower: three rings proud of the shaft */for(let i=0;i<3;i++)Cy(.44,.44,.07,M(0xc89a30,{metalness:.5,roughness:.4}),0,WH-1.0+i*.09,0,null,null,24);
 /* the open papyrus flower, painted with petals */const pt=k.can(256,128,(x,w,h)=>{x.fillStyle='#2a7a4a';x.fillRect(0,0,w,h);for(let u=0;u<w;u+=32){x.fillStyle='#4a9a6a';x.beginPath();x.moveTo(u,h);x.lineTo(u+16,0);x.lineTo(u+32,h);x.fill();x.fillStyle='#1e4a9a';x.fillRect(u+14,h*.5,4,h*.5)}x.fillStyle='#e0b040';x.fillRect(0,0,w,10)});
 Cy(.72,.44,.58,new THREE.MeshStandardMaterial({map:pt,roughness:.8}),0,WH-.78+.29-.0,0,null,null,24);
 /* the abacus: a plain block up through the ceiling line */B(.9,.32,.9,MT.lime,0,WH-.13,0);pyNoSeam(g);return g}

/* a guardian statue: a standing figure in black and gold with a staff, on a plinth, facing +z (our own design) */
function pyGuardian(){const k=pyKit(),{M,MT}=k,g=new THREE.Group(),{A,B,Cy,rod}=k.H(g);const BK=MT.basalt,GD=MT.gold;
 B(.9,.3,1.1,MT.lime,0,.15,0);B(.8,.04,1.0,GD,0,.31,0);
 /* feet, legs striding (left foot forward), the kilt, body, arms, collar */B(.16,.08,.34,BK,-.12,.37,.18);B(.16,.08,.34,BK,.12,.37,-.08);
 Cy(.08,.07,.78,BK,-.12,.8,.12,null,null,10).rotation.x=-.12;Cy(.08,.07,.78,BK,.12,.8,-.05,null,null,10);
 {const kl=A(new THREE.CylinderGeometry(.2,.3,.5,4,1),GD,0,1.38,0);kl.rotation.y=Math.PI/4;kl.scale.z=.7;B(.12,.36,.02,GD,0,1.36,.215)}
 const bd=A(new THREE.CylinderGeometry(.26,.19,.7,12),BK,0,1.95,0);bd.scale.z=.72;A(new THREE.CylinderGeometry(.27,.27,.08,12,1,true),GD,0,2.26,0).scale.z=.75;
 for(const s of[-1,1]){rod([s*.27,2.22,0],[s*.33,1.82,.06],.06,BK);rod([s*.33,1.82,.06],[s*.31,1.5,.22],.05,BK);A(new THREE.SphereGeometry(.06,8,6),BK,s*.31,1.47,.24)}
 /* the staff in the left hand, a mace in the right */rod([-.31,.33,.32],[-.31,2.3,.32],.025,GD);A(new THREE.SphereGeometry(.05,8,6),GD,-.31,2.32,.32);rod([.31,1.25,.34],[.31,1.6,.2],.025,GD);A(new THREE.SphereGeometry(.07,8,6),GD,.31,1.24,.35);
 /* the head in a striped headdress, gold band, eyes */Cy(.08,.09,.16,BK,0,2.36,0,null,null,10);const hd=A(new THREE.SphereGeometry(.15,14,10),BK,0,2.55,.02);hd.scale.set(.9,1.1,1);
 const nm=k.can(128,128,(x,w,h)=>{for(let i=0;i<10;i++){x.fillStyle=i%2?'#14100c':'#e0b040';x.fillRect(0,i*13,w,13)}});const NM=new THREE.MeshStandardMaterial({map:nm,roughness:.5,metalness:.3});
 A(new THREE.SphereGeometry(.18,14,10,0,Math.PI*2,0,Math.PI*.55),NM,0,2.6,-.03);for(const s of[-1,1])B(.1,.3,.06,NM,s*.16,2.38,.06).rotation.z=s*.1;B(.3,.035,.04,GD,0,2.68,.13);for(const s of[-1,1])B(.05,.022,.012,M(0xf0f0f0),s*.05,2.57,.175);
 pyNoSeam(g);return g}

/* an inscribed stele (the game puts its clue picture 18 cm in front of the middle: the face is at 17 cm) */
function pyStele(){const k=pyKit(),{M,MT}=k,g=new THREE.Group(),{A,B,Cy}=k.H(g);const ST=new THREE.MeshStandardMaterial({map:k.T.lime,color:0xeadcbc,roughness:.85});
 B(1.6,.16,.6,MT.dark,0,.08,0);B(1.3,2.15,.34,ST,0,.15+2.15/2-.01,0);{const r=A(new THREE.CylinderGeometry(.65,.65,.34,24,1,false,0,Math.PI),ST,0,2.29,0);r.rotation.set(0,Math.PI/2,Math.PI/2)}/* the half above, its flat ends front and back */
 /* a raised border round the clue picture, clear of it */for(const s of[-1,1])B(.06,1.9,.05,MT.lime,s*.6,1.25,.17);B(1.15,.06,.06,MT.lime,0,.32,.17);B(1.15,.06,.06,MT.lime,0,2.18,.17);/* between the side strips, 5 mm prouder */
 /* the winged sun in the rounded top */const t=k.can(256,128,(x,w,h)=>{x.clearRect(0,0,w,h);x.fillStyle='#e8b830';x.beginPath();x.arc(w/2,h*.55,18,0,7);x.fill();for(const s of[-1,1]){x.fillStyle='#1e4a9a';x.beginPath();x.moveTo(w/2+s*20,h*.5);x.quadraticCurveTo(w/2+s*70,h*.3,w/2+s*110,h*.55);x.lineTo(w/2+s*20,h*.62);x.fill()}});
 const p=A(new THREE.PlaneGeometry(1.1,.55),new THREE.MeshStandardMaterial({map:t,transparent:true,roughness:.7}),0,2.45,.182);pyNoSeam(g);return g}
/* the antechamber's table with the treasure map: top surface at 0.9 like the game's */
function pyScrollTable(){const k=pyKit(),{M,MT}=k,g=new THREE.Group(),{A,B,Cy}=k.H(g);const ST=new THREE.MeshStandardMaterial({map:k.T.lime,color:0xe0d0b0,roughness:.85});
 B(1.0,.2,.5,ST,0,.1,0);B(.7,.6,.36,ST,0,.5,0);B(1.5,.12,.86,ST,0,.84,0);/* the top: 0.78..0.90 */
 /* the scroll: a sheet with rolled ends, lying on the top */const mp=k.can(256,160,(x,w,h)=>{x.fillStyle='#ecdcac';x.fillRect(0,0,w,h);for(let i=0;i<1500;i++){x.fillStyle='rgba(120,90,40,'+Math.random()*.1+')';x.fillRect(Math.random()*w,Math.random()*h,2,2)}
  x.strokeStyle='#7a5a2a';x.lineWidth=3;x.beginPath();x.moveTo(20,120);x.quadraticCurveTo(80,60,140,90);x.quadraticCurveTo(190,110,220,40);x.setLineDash([6,6]);x.stroke();x.setLineDash([]);x.strokeStyle='#c02020';x.lineWidth=6;x.beginPath();x.moveTo(206,28);x.lineTo(234,52);x.moveTo(234,28);x.lineTo(206,52);x.stroke();
  x.fillStyle='#7a5a2a';x.beginPath();x.moveTo(30,140);x.lineTo(44,110);x.lineTo(58,140);x.fill();x.strokeStyle='#5a3a14';pyGlyph(x,2,60,40,14)});
 const sg=new THREE.Group();sg.position.set(0,.9,0);sg.rotation.y=.3;g.add(sg);const s=k.H(sg);s.B(.66,.006,.4,new THREE.MeshStandardMaterial({map:mp,roughness:.9}),0,.003,0);for(const e of[-1,1])s.Cy(.032,.032,.44,M(0xd8c898),e*.35,.032,0,'z',null,10);
 pyNoSeam(g);return g}
/* a painted storage jar with a lid, about 1.15 tall like the game's urn */
function pyJar(lidHead){const k=pyKit(),{M}=k,g=new THREE.Group(),{A}=k.H(g);const pts=[[0,0],[.22,0],[.3,.12],[.36,.4],[.34,.7],[.24,.9],[.2,.96],[.24,1.0],[.0,1.0]].map(p=>new THREE.Vector2(p[0],p[1]));
 const t=k.can(256,128,(x,w,h)=>{x.fillStyle='#a8603a';x.fillRect(0,0,w,h);x.fillStyle='#1a120a';x.fillRect(0,40,w,4);x.fillRect(0,76,w,4);x.fillStyle='#e8d8b0';for(let u=0;u<w;u+=16){x.beginPath();x.moveTo(u,48);x.lineTo(u+8,70);x.lineTo(u+16,48);x.fill()}x.fillStyle='#1e4a9a';x.fillRect(0,20,w,8)});
 A(new THREE.LatheGeometry(pts,20),new THREE.MeshStandardMaterial({map:t,roughness:.75}),0,0,0);
 const lid=A(new THREE.SphereGeometry(.2,14,8,0,Math.PI*2,0,Math.PI/2),M(0xc89a6a,{roughness:.7}),0,.99,0);lid.scale.y=.7;A(new THREE.SphereGeometry(.05,8,6),M(0xc89a6a),0,1.14,0);
 pyNoSeam(g);return g}
/* an old skeleton lying on its back along +x (head at -x), with a scrap of cloth; floor top at 5 cm */
function pySkeleton(){const k=pyKit(),{M}=k,g=new THREE.Group(),{A,B,Cy,rod}=k.H(g),BN=M(0xe0d6bc,{roughness:.7}),y=.05;
 const sk=A(new THREE.SphereGeometry(.12,12,10),BN,-.85,y+.11,0);sk.scale.set(1.1,.9,.95);B(.1,.05,.12,BN,-.95,y+.04,0);for(const s of[-1,1])A(new THREE.SphereGeometry(.03,6,6),M(0x2a2018),-.93,y+.17,s*.045);
 rod([-.72,y+.05,0],[.25,y+.05,0],.022,BN);for(let i=0;i<6;i++){const r=A(new THREE.TorusGeometry(.13-.008*i,.012,5,12,Math.PI),BN,-.58+i*.07,y+.03,0);r.rotation.y=Math.PI/2;r.scale.y=.75}
 {const p=A(new THREE.TorusGeometry(.11,.03,6,12),BN,.3,y+.04,0);p.rotation.x=Math.PI/2;p.scale.set(1.2,1,.6)}
 for(const s of[-1,1]){rod([-.62,y+.03,s*.16],[-.35,y+.03,s*.28],.02,BN);rod([-.35,y+.03,s*.28],[-.05,y+.03,s*.22],.017,BN);rod([.38,y+.03,s*.1],[.82,y+.03,s*.16],.026,BN);rod([.82,y+.03,s*.16],[1.22,y+.03,s*.1+.03*s],.022,BN);B(.12,.03,.08,BN,1.28,y+.012,s*.13)}
 const cl=A(new THREE.PlaneGeometry(.5,.6),M(0x8a7a5a,{roughness:1,side:THREE.DoubleSide}),.15,y+.085,.12);cl.rotation.x=-Math.PI/2;cl.rotation.z=.4;
 /* its torch and a bag dropped beside it */rod([-.3,y+.025,-.5],[.25,y+.025,-.62],.022,M(0x4a3020));A(new THREE.SphereGeometry(.16,10,8),M(0x6a5a3a,{roughness:1}),.6,y+.09,-.45).scale.y=.6;
 pyNoSeam(g);return g}

function pyEntrance(g){const{X,Z}=PYRV,torches=[];pyDoorFrame(g,'x',X+11.2,Z,-1);/* into the antechamber, on its side */
 torches.push(pyTorch(g,X+12.8,Z-1.45,0),pyTorch(g,X+19.2,Z+1.45,Math.PI));return{torches}}
function pyAntechamber(g){const{X,Z}=PYRV,obs=[];
 pyDoorFrame(g,'x',X-1.6,Z,1);pyDoorFrame(g,'z',Z-8,X+3.2,1);pyDoorFrame(g,'z',Z+8,X+3.2,-1);
 for(const[x,z]of[[X+.6,Z-4.2],[X+.6,Z+4.2],[X+7.2,Z-4.2],[X+7.2,Z+4.2]]){const c=pyColumn();c.position.set(x,0,z);g.add(c);obs.push({x0:x-.62,x1:x+.62,z0:z-.62,z1:z+.62})}
 for(const s of[-1,1]){const gd=pyGuardian();gd.position.set(X+10.2,0,Z+s*2.6);gd.rotation.y=-Math.PI/2;g.add(gd);obs.push({x0:X+9.65,x1:X+10.75,z0:Z+s*2.6-.45,z1:Z+s*2.6+.45})}
 /* the game's own props, remodelled, at the game's spots */const st=pyStele();st.position.set(X+3,0,Z-6.2);g.add(st);
 const tb=pyScrollTable();tb.position.set(X+3.5,0,Z+5.4);g.add(tb);for(const[x,z]of[[X-1.4,Z-7.4],[X-1.4,Z+7.4],[X+6.4,Z+7.4]]){const j=pyJar();j.position.set(x,0,z);j.rotation.y=x+z;g.add(j)}
 const sk=pySkeleton();sk.position.set(X+6.4,0,Z-7.0);g.add(sk);
 return{obs}}

/* the portal passage the game uses as its long entrance hall (x X+22..X+41.5, z ±1.6): painted panels 1 cm off its
   walls, a starry ceiling 1 cm under its roof block, the game's four torches (pyrTorch spots: x X+31.5 and X+37.5,
   both sides, on the wall face; the one at X+37.5 on the -z side is lit). Returns {torches, lit}. */
function pyPassage(g){const k=pyKit(),{X,Z,WH}=PYRV,{A}=k.H(g),torches=[];const segs=[[22,23.5,'glyph'],[23.5,26.7,'walk'],[26.7,29.9,'glyph'],[29.9,33.1,'torch'],[33.1,35.9,'walk'],[35.9,39.1,'torch'],[39.1,41.5,'glyph']];
 for(const sd of[-1,1])for(const[a,b,kind]of segs){const w=b-a,geo=new THREE.PlaneGeometry(w,WH),uv=geo.attributes.uv;for(let v=0;v<uv.count;v++)uv.setX(v,uv.getX(v)*w/3.2+(1-w/3.2)/2);
  const m=A(geo,new THREE.MeshStandardMaterial({map:pyWallTex(kind,sd>0?1:2),roughness:.88}),X+(a+b)/2,WH/2,Z+sd*1.59);m.rotation.y=sd>0?Math.PI:0}
 {const geo=new THREE.PlaneGeometry(19.5,3.2),uv=geo.attributes.uv;for(let v=0;v<uv.count;v++)uv.setX(v,uv.getX(v)*19.5/3.2);const t=pyCeilTex().clone();t.needsUpdate=true;t.wrapS=t.wrapT=THREE.RepeatWrapping;const m=A(geo,new THREE.MeshStandardMaterial({map:t,roughness:.8}),X+31.75,WH-.01,Z);m.rotation.x=Math.PI/2}
 for(const sd of[-1,1])for(const x of[X+31.5,X+37.5])torches.push(pyTorch(g,x,Z+sd*1.6,sd>0?Math.PI:0,0));pyNoSeam(g);return{torches,lit:torches[1]}}

/* =====================================================================================================
   Batch 3: the dart and blade corridors, the sealed door and its dials, the two clue rooms, the scarab trapdoor.
   ===================================================================================================== */
/* the dart corridor's floor stones: the game keeps its tiles (RW-.06 x .06 x LW-.06 at y .06) and swaps the two
   materials for these. The cracked one is easy to read once you know, not at a glance. */
function pyDartMats(){const k=pyKit();if(k.dm)return k.dm;const tile=cr=>k.can(128,96,(x,w,h)=>{x.fillStyle='#c8ae7e';x.fillRect(0,0,w,h);for(let i=0;i<1400;i++){x.fillStyle=Math.random()<.5?'rgba(70,50,25,'+Math.random()*.1+')':'rgba(255,245,220,'+Math.random()*.1+')';x.fillRect(Math.random()*w,Math.random()*h,2,2)}
 x.strokeStyle='rgba(60,42,20,.6)';x.lineWidth=4;x.strokeRect(2,2,w-4,h-4);if(cr){x.strokeStyle='#3a2810';x.lineWidth=2.5;x.beginPath();x.moveTo(20,14);x.lineTo(50,40);x.lineTo(42,76);x.moveTo(50,40);x.lineTo(96,52);x.lineTo(112,84);x.moveTo(74,46);x.lineTo(80,20);x.stroke();x.fillStyle='rgba(30,20,10,.35)';x.beginPath();x.arc(50,40,5,0,7);x.fill()}
});return k.dm={safe:new THREE.MeshStandardMaterial({map:tile(0),roughness:.9}),cracked:new THREE.MeshStandardMaterial({map:tile(1),roughness:.95})}}
/* a dart, pointing +z, 0.35 long (the game flies it along z) */
function pyDart(){const k=pyKit(),{M}=k,g=new THREE.Group(),{A,Cy}=k.H(g);Cy(.012,.012,.3,M(0x4a3020),0,0,-.02,'z',null,6);const tp=A(new THREE.ConeGeometry(.02,.07,6),M(0x8a8a8a,{metalness:.8,roughness:.3}),0,0,.165);tp.rotation.x=Math.PI/2;
 for(let i=0;i<3;i++){const f=A(new THREE.PlaneGeometry(.05,.08),M(0xc02020,{side:THREE.DoubleSide}),0,0,-.14);f.rotation.set(0,Math.PI/2,0);f.rotation.order='ZYX';f.rotation.z=i*Math.PI/3;f.position.set(Math.cos(i*Math.PI/3+Math.PI/2)*0,0,-.14)}g.userData.dpKeep=1;return g}
/* the blade corridor: a pendulum's parts in its pivot group (the game's pv at (bx, WH-.05, zc) swings round x):
   bronze rod, crescent axe head (flat in the swing plane, edge down), a hub. Replaces arm, bl and cap. */
function pyBlade(){const k=pyKit(),{M}=k,g=new THREE.Group(),{A,Cy}=k.H(g);const BR=M(0x8a6a30,{metalness:.75,roughness:.35}),ST=M(0xc4c8d0,{metalness:.5,roughness:.35}),ED=M(0xf4f6fa,{metalness:.55,roughness:.2});/* not too metallic: there's nothing to reflect down here */
 Cy(.06,.06,.15,BR,0,0,0,'x',null,12);/* the eye round the axle */Cy(.032,.032,2.82,BR,0,-1.47,0,null,null,8);for(const y of[-.6,-1.4,-2.2])Cy(.05,.05,.06,BR,0,y,0,null,null,10);
 /* the crescent: outer arc r .62 below the hub, inner arc cut out, horns curling up */ {const sh2=new THREE.Shape();const N=24;for(let i=0;i<=N;i++){const a=Math.PI*(1.04+.92*i/N);sh2.lineTo(Math.cos(a)*.62,Math.sin(a)*.62)}for(let i=N;i>=0;i--){const a=Math.PI*(1.12+.76*i/N);sh2.lineTo(Math.cos(a)*.5,Math.sin(a)*.5+.22)}
  const geo=new THREE.ExtrudeGeometry(sh2,{depth:.03,bevelEnabled:true,bevelThickness:.008,bevelSize:.012,bevelSegments:1});geo.translate(0,0,-.015);const b=A(geo,ST,0,-2.92,0);b.rotation.y=Math.PI/2;
  /* the bright edge */const eg=new THREE.TorusGeometry(.62,.012,4,24,Math.PI*.92);const e=A(eg,ED,0,-2.92,0);e.rotation.set(0,Math.PI/2,0);e.rotation.order='YXZ';e.rotation.z=Math.PI*1.04}
 Cy(.09,.09,.12,BR,0,-2.92,0,'x',null,14);Cy(.05,.05,.3,BR,0,-2.72,0,null,null,8);g.userData.dpKeep=1;pyNoSeam(g);return g}
/* the static part above each pendulum: two bronze cheeks through the ceiling, the axle, a dark slot in the ceiling
   along the swing. Replaces the DK box at (bx, WH-.06, zc). */
function pyBladeMount(g,bx,zc){const k=pyKit(),{M}=k,{A,B,Cy}=k.H(g),{WH}=PYRV;const BR=M(0x8a6a30,{metalness:.75,roughness:.35});
 for(const s of[-1,1])B(.03,.24,.24,BR,bx+s*.1,WH-.07,zc);Cy(.025,.025,.26,BR,bx,WH-.05,zc,'x',null,8);B(.36,.05,.36,BR,bx,WH-.0,zc);
 const sl=A(new THREE.PlaneGeometry(.12,2.9),new THREE.MeshBasicMaterial({color:0x050302}),bx,WH-.01,zc);sl.rotation.x=Math.PI/2;pyNoSeam(g)}
/* the sealed door: the slab the game sinks (0.5 x WH x 3.2, centred on (sx+.25, WH/2, Z)) as a group with its
   carvings, and a frame on the corridor side in front of it. The dials stay the game's, on this face at sx+.5. */
function pySealedSlab(){const k=pyKit(),{M,MT}=k,{WH}=PYRV,g=new THREE.Group(),{A,B}=k.H(g);const t=k.can(512,624,(x,w,h)=>{x.fillStyle='#cdb385';x.fillRect(0,0,w,h);for(let i=0;i<6000;i++){x.fillStyle=Math.random()<.5?'rgba(70,50,25,'+Math.random()*.1+')':'rgba(255,245,220,'+Math.random()*.08+')';x.fillRect(Math.random()*w,Math.random()*h,2,2)}
  x.strokeStyle='#5a3a14';x.lineWidth=6;x.strokeRect(16,16,w-32,h-32);x.strokeRect(30,30,w-60,h-60);/* the dial panel, the cartouche above, a big eye */x.fillStyle='rgba(90,60,25,.25)';x.fillRect(60,h-1.95*160,w-120,.95*160);x.strokeRect(60,h-1.95*160,w-120,.95*160);
  x.strokeStyle='#5a3a14';x.lineWidth=5;x.beginPath();x.ellipse(w/2,h-2.85*160,150,52,0,0,7);x.stroke();x.fillStyle='#1e4a9a';x.strokeStyle='#1e4a9a';[1,5,0].forEach((t2,i)=>pyGlyph(x,t2,w/2-80+i*80,h-2.85*160,24));x.strokeStyle='#5a3a14';[0,1,2,3].forEach(i=>pyGlyph(x,(i+3)%6,90+i*110,h-.5*160,24))});
 const FM=new THREE.MeshStandardMaterial({map:t,roughness:.88});const ST=pyStoneMat();const mats=[FM,ST,ST,ST,ST,ST];/* the +x face (box group 0) carries the carvings */
 const m=new THREE.Mesh(new THREE.BoxGeometry(.5,WH,3.2),mats);g.add(m);pyNoSeam(g);return g}
function pySealedFrame(g,sx){const k=pyKit(),{B,A}=k.H(g),{Z,WH}=PYRV;const ST=new THREE.MeshStandardMaterial({map:k.T.lime,color:0xf2e6c8,roughness:.85});
 /* jambs from just inside the slab's face to 15 cm in front, over its edges (opening 2.9 m: the dials sit inside ±1.35) */for(const s of[-1,1])B(.2,WH-.6,.5,ST,sx+.55,(WH-.6)/2,Z+s*1.7);B(.24,.62,4.0,ST,sx+.55,WH-.29,Z);
 const lt=k.can(512,64,(x,w,h)=>{x.fillStyle='#ecdcb4';x.fillRect(0,0,w,h);x.strokeStyle='#5a3a14';[0,5,1,2,1,5,0].forEach((t2,i)=>pyGlyph(x,t2,w/2+(i-3)*64,h/2,18))});const p=A(new THREE.PlaneGeometry(3.6,.5),new THREE.MeshStandardMaterial({map:lt,roughness:.7}),sx+.682,WH-.3,Z);p.rotation.y=Math.PI/2;pyNoSeam(g)}
/* a dial for the sealed door, in the game's dg group: ring + stone disc, front at x .025 (the game's symbol face is at .035) */
function pyDial(){const k=pyKit(),{M}=k,g=new THREE.Group(),{Cy,A}=k.H(g);Cy(.3,.3,.05,M(0x8a6a30,{metalness:.75,roughness:.35}),0,0,0,'x',null,24);/* dials are 0.7 apart: ring + notches stay inside 0.345 */for(let i=0;i<8;i++){const a=i/8*Math.PI*2;const n=A(new THREE.BoxGeometry(.04,.05,.05),M(0x6a4a20,{metalness:.6}),0,Math.cos(a)*.32,Math.sin(a)*.32);n.rotation.x=a}
 A(new THREE.ConeGeometry(.04,.08,4),M(0xf0c040,{metalness:.8}),.04,.36,0).rotation.x=Math.PI;g.userData.dpKeep=1;pyNoSeam(g);return g}
/* the scarab trapdoor (SW room, centre (cx(2), cz(13))): the slab the game slides (2.3 x .12 x 2.3, centre y .07), a
   stone surround with a dark gap, and the opening under it: steps painted going down into the dark (y .056). */
function pyTrapSlab(){const k=pyKit(),g=new THREE.Group();const t=k.can(256,256,(x,w,h)=>{x.fillStyle='#bfa070';x.fillRect(0,0,w,h);for(let i=0;i<2500;i++){x.fillStyle='rgba(70,50,25,'+Math.random()*.1+')';x.fillRect(Math.random()*w,Math.random()*h,2,2)}x.strokeStyle='#5a3a14';x.lineWidth=5;x.strokeRect(10,10,w-20,h-20);
  /* the scarab, its keyhole in the shell */const cx=w/2,cy=h/2;x.fillStyle='#1e4a9a';x.beginPath();x.ellipse(cx,cy+12,40,52,0,0,7);x.fill();x.beginPath();x.ellipse(cx,cy-46,26,16,0,0,7);x.fill();x.strokeStyle='#1e4a9a';x.lineWidth=6;for(const s of[-1,1]){x.beginPath();x.moveTo(cx+s*34,cy-20);x.lineTo(cx+s*60,cy-44);x.moveTo(cx+s*40,cy+16);x.lineTo(cx+s*70,cy+10);x.moveTo(cx+s*34,cy+50);x.lineTo(cx+s*60,cy+76);x.stroke()}
  x.fillStyle='#e8b830';x.beginPath();x.arc(cx,cy-82,16,0,7);x.fill();x.fillStyle='#050302';x.beginPath();x.arc(cx,cy+4,8,0,7);x.fill();x.fillRect(cx-4,cy+4,8,22);x.fillStyle='#5a3a14';x.font='bold 18px DoorsSans,Arial';x.textAlign='center';x.fillText('SEALED',cx,h-26)});
 const T=new THREE.MeshStandardMaterial({map:t,roughness:.9}),ST=pyStoneMat();g.add(new THREE.Mesh(new THREE.BoxGeometry(2.3,.12,2.3),[ST,ST,T,ST,ST,ST]));pyNoSeam(g);return g}
function pyTrapFrame(g,hx,hz){const k=pyKit(),{B,A}=k.H(g);const ST=new THREE.MeshStandardMaterial({map:k.T.dark,roughness:.95});
 /* the surround: 1 cm clear of the slab all round, so a dark line shows */for(const s of[-1,1]){B(2.82,.1,.24,ST,hx,.05,hz+s*1.28);B(.24,.1,2.32,ST,hx+s*1.28,.05,hz)}
 const t=k.can(128,128,(x,w,h)=>{x.fillStyle='#000';x.fillRect(0,0,w,h);for(let i=0;i<5;i++){const y=12+i*24;x.fillStyle='rgba(120,90,50,'+(.5-i*.1)+')';x.fillRect(16,y,w-32,10);x.fillStyle='rgba(60,40,20,'+(.4-i*.08)+')';x.fillRect(16,y+10,w-32,6)}});
 const p=A(new THREE.PlaneGeometry(2.32,2.32),new THREE.MeshBasicMaterial({map:t}),hx,.056,hz);p.rotation.x=-Math.PI/2;pyNoSeam(g)}
/* a scarab statue on a pedestal, facing +z */
function pyScarabStatue(){const k=pyKit(),{M,MT}=k,g=new THREE.Group(),{A,B}=k.H(g);B(.7,.7,.7,MT.lime,0,.35,0);B(.78,.06,.78,MT.gold,0,.73,0);
 const bd=A(new THREE.SphereGeometry(.26,16,12),MT.lapis,0,.92,-.03);bd.scale.set(1,.55,1.3);A(new THREE.SphereGeometry(.13,12,8),MT.lapis,0,.88,.3).scale.set(1,.6,.8);A(new THREE.SphereGeometry(.11,12,10),MT.gold,0,1.13,.32);
 for(const s of[-1,1])for(const z of[-.18,0,.18]){const l=A(new THREE.CylinderGeometry(.018,.018,.28,5),MT.gold,s*.26,.84,z);l.rotation.z=s*1.1}pyNoSeam(g);return g}
/* the scribe's things in the north clue room: a low table with ink and reed pens, a shelf of scrolls, baskets */
function pyScribeCorner(g,x,z,ry){const k=pyKit(),{M,MT}=k,t=new THREE.Group();t.position.set(x,0,z);t.rotation.y=ry;g.add(t);const{A,B,Cy,rod}=k.H(t);const W=MT.wood;
 B(1.2,.06,.6,W,0,.42,0);for(const a of[-.5,.5])for(const b of[-.22,.22])B(.06,.39,.06,W,a,.195,b);Cy(.05,.05,.08,M(0x1a1a1a),.3,.49,-.1,null,null,10);Cy(.05,.05,.08,M(0xb03020),.42,.49,-.1,null,null,10);
 for(let i=0;i<3;i++){const p=rod([-.2+i*.05,.455,.05],[-.05+i*.05,.455,.2],.006,M(0x6a5a2a))}B(.5,.004,.34,M(0xecdcac),-.2,.452,-.05);
 /* the shelf against the wall behind (wall 1.25 m behind the table: the shelf's back goes 2 cm into it) */B(1.54,1.6,.03,W,0,.8,-1.24);for(const a of[-.785,.785])B(.03,1.6,.38,W,a,.8,-1.04);B(1.6,.03,.38,W,0,1.615,-1.04);/* back through the wall line, sides, top */for(let r=0;r<3;r++){B(1.55,.04,.36,M(0x5a3a22),0,.3+r*.5,-1.05);for(let i=0;i<6;i++)Cy(.05,.05,.3,M(0xe8d8a8),-.6+i*.24,.37+r*.5,-1.05,'z',null,8)}
 for(const[a,b,r]of[[.8,.4,.22],[.95,-.2,.17]]){Cy(r,r*.85,r*1.2,M(0xa8844a,{roughness:1}),a,r*.6+.05,b,null,null,12)}pyNoSeam(t);return t}
/* the two clue rooms' own things (their steles are the game's, built with pyStele): the scribe's corner against the
   south wall of the north room, a scarab statue in the south room beside the trapdoor. Returns {obs}. */
function pyClueRooms(g){const obs=[];const x1=pyCx(1),zs=pyCz(3)+1.6;pyScribeCorner(g,x1,zs-1.25,Math.PI);obs.push({x0:x1-.8,x1:x1+.8,z0:zs-1.6,z1:zs})/* table and shelf */;
 const st=pyScarabStatue();st.position.set(x1,0,pyCz(13)-1.0);g.add(st);obs.push({x0:x1-.4,x1:x1+.4,z0:pyCz(13)-1.4,z1:pyCz(13)-.6});return{obs}}

/* =====================================================================================================
   Batch 4: the treasure chamber (cells i1..4, j6..10: x X-24..X-11.2, z Z-8..Z+8). The game's things keep their
   spots, sizes and moving parts; these replace their meshes:
   pyGoldPile(s)       the four heaps gp(x,z,s): coins, bars, a goblet, gems (base on the floor, about 0.6 s high)
   pySarcophagus()     the trough (1.2 x 0.9 x 2.6, open on top, centre on the floor) for `sar`
   pySarcLid()         the lid for `lid` (1.3 x 2.7, bottom at -0.09 like the game's box), a carved figure, head to -z
   pyMummy()           the mummy for `mum` (group at (tx,.6,Z+2.95), userData.tr = the part that sits up)
   pyChest() / pyChestLid()  the chest body (1.1 x .7 x .7, hollow, coins inside) and its lid (1.14 x .18 x .74)
   pyPedestal()        the mask's pedestal (.8 x 1.1 x .8, top at 1.1)
   pyMask()            the golden mask for `mask` (faces +z inside its group, chin at -0.35 like the game's)
   pyTreasureRoom(g)   the dressing: a gilded shrine, jars, feather fans by the sarcophagus, chariot wheels.
   ===================================================================================================== */
function pyGoldMats(){const k=pyKit();if(k.gm)return k.gm;const t=k.can(128,128,(x,w,h)=>{x.fillStyle='#d8a828';x.fillRect(0,0,w,h);for(let i=0;i<220;i++){const cx=Math.random()*w,cy=Math.random()*h,r=5+Math.random()*4;x.fillStyle=['#f0c848','#c89020','#ffe070'][i%3];x.beginPath();x.ellipse(cx,cy,r,r*.6,Math.random()*3,0,7);x.fill();x.strokeStyle='rgba(120,80,10,.6)';x.lineWidth=1;x.stroke()}},1);
 return k.gm={heap:new THREE.MeshStandardMaterial({map:t,color:0xffffff,metalness:.6,roughness:.4,emissive:0x2a1a00}),gold:k.M(0xf0c040,{metalness:.65,roughness:.3,emissive:0x2a1c00})}}
function pyGoldPile(s){s=s||1;const k=pyKit(),{M}=k,g=new THREE.Group(),{A,B}=k.H(g),G=pyGoldMats();let sd=Math.round(s*1000);const R=()=>{sd=(sd*16807)%2147483647;return sd/2147483647};
 /* the heap: a cone 0.7 s wide and 0.65 s high, its foot 5 cm under the floor. The lumps only push OUT, so nothing
    put on the plain cone's surface (sY) can end up floating. */const RB=.7*s,HT=.65*s,sY=r=>HT*(1-r/RB)-.05;
 {const geo=new THREE.ConeGeometry(RB,HT,18,4);const P=geo.attributes.position;for(let i=0;i<P.count;i++){const y=P.getY(i);if(y<HT/2-.01&&y>-HT/2+.01){const f=1+R()*.08;P.setX(i,P.getX(i)*f);P.setZ(i,P.getZ(i)*f)}}geo.computeVertexNormals();A(geo,G.heap,0,HT/2-.05,0)}
 const up=new THREE.Vector3(0,1,0),sl=Math.atan2(HT,RB),onSlope=(a,r,dip)=>{const n=new THREE.Vector3(Math.cos(a)*Math.sin(sl),Math.cos(sl),Math.sin(a)*Math.sin(sl));return{p:new THREE.Vector3(Math.cos(a)*r,sY(r)-dip,Math.sin(a)*r),q:new THREE.Quaternion().setFromUnitVectors(up,n)}};
 /* loose coins: flat on the floor round the foot, and lying along the slope */{const im=new THREE.InstancedMesh(new THREE.CylinderGeometry(.045,.045,.012,10),G.gold,40),m4=new THREE.Matrix4(),q=new THREE.Quaternion(),p=new THREE.Vector3(),sc=new THREE.Vector3(1,1,1);
  for(let i=0;i<40;i++){const a=R()*Math.PI*2;if(i<22){const r=RB*1.1+R()*.5*s;q.setFromAxisAngle(up,R()*3);p.set(Math.cos(a)*r,.056,Math.sin(a)*r)}else{const r=RB*(.1+R()*.8),o=onSlope(a,r,.002);p.copy(o.p);q.copy(o.q)}m4.compose(p,q,sc);im.setMatrixAt(i,m4)}g.add(im)}
 /* bars on the floor round the foot */for(let i=0;i<3;i++){const r=RB*1.15+i*.12*s;const b=B(.24,.06,.1,G.gold,r*Math.cos(i*2),.08,r*Math.sin(i*2));b.rotation.y=i}
 /* a goblet standing in the coins (its foot pushed 2 cm in), two gems half sunk */{const pts=[[0,0],[.06,0],[.06,.01],[.015,.03],[.015,.12],[.07,.16],[.08,.24],[0,.2]].map(p=>new THREE.Vector2(p[0],p[1]));const r=RB*.5,a=.6;A(new THREE.LatheGeometry(pts,14),G.gold,Math.cos(a)*r,sY(r)-.03,Math.sin(a)*r)}
 for(const[a,r,c,e,sz]of[[2.2,RB*.45,0xc01030,0x300008,.06],[-1.3,RB*.55,0x1040c0,0x080830,.05]])A(new THREE.IcosahedronGeometry(sz,0),M(c,{metalness:.2,roughness:.1,emissive:e}),Math.cos(a)*r,sY(r)-sz*.3,Math.sin(a)*r);
 pyNoSeam(g);return g}
function pySarcophagus(){const k=pyKit(),{M}=k,g=new THREE.Group(),{A,B}=k.H(g),G=pyGoldMats();const t=k.can(512,128,(x,w,h)=>{x.fillStyle='#e0b038';x.fillRect(0,0,w,h);const c=['#1e4a9a','#b03020','#2a7a4a'];for(let i=0;i<3;i++){x.fillStyle=c[i];x.fillRect(0,14+i*10,w,6);x.fillRect(0,h-20-i*10,w,6)}
  x.strokeStyle='#5a3a10';for(let i=0;i<8;i++)pyGlyph(x,i%6,32+i*64,h/2,16)});const SM=new THREE.MeshStandardMaterial({map:t,metalness:.45,roughness:.4,emissive:0x1a1000});
 /* open box: floor, sides and ends (walls 8 cm), inside dark */const IN=M(0x2a1e10,{roughness:1});B(1.04,.42,2.44,SM,0,.21,0);/* filled up to 0.42 so the mummy (bottom at .44) lies on it */for(const s of[-1,1]){B(.08,.9,2.6,SM,s*.56,.45,0);B(1.04,.9,.08,SM,0,.45,s*1.26)}B(1.04,.01,2.44,IN,0,.425,0);
 /* a plinth under it */B(1.4,.04,2.8,M(0x3a2a18),0,.02,0);pyNoSeam(g);return g}
function pySarcLid(){const k=pyKit(),{M,MT}=k,g=new THREE.Group(),{A,B,Cy}=k.H(g),G=pyGoldMats();B(1.3,.08,2.7,G.gold,0,-.05,0);/* bottom at -0.09 */
 const body=A(new THREE.SphereGeometry(1,20,12,0,Math.PI*2,0,Math.PI/2),G.gold,0,-.01,.25);body.scale.set(.5,.2,1.15);
 const nm=k.can(128,128,(x,w,h)=>{for(let i=0;i<10;i++){x.fillStyle=i%2?'#1e3a8a':'#e8c050';x.fillRect(0,i*13,w,13)}});const hd=A(new THREE.SphereGeometry(.3,16,10,0,Math.PI*2,0,Math.PI/2),new THREE.MeshStandardMaterial({map:nm,roughness:.5,metalness:.3}),0,-.01,-.95);hd.scale.set(1.1,.7,1.1);
 const face=A(new THREE.SphereGeometry(.17,14,10),G.gold,0,.16,-.98);face.scale.set(1,.55,1.1);for(const s of[-1,1])B(.07,.02,.025,M(0x101010),s*.07,.255,-.95);B(.06,.04,.12,G.gold,0,.2,-.8);
 /* crossed arms with a crook and a flail */for(const s of[-1,1]){const a=B(.5,.06,.1,G.gold,0,.18+s*.008,-.35+s*.06);a.rotation.y=s*.5}/* one arm over the other */const CR=MT.lapis;Cy(.02,.02,.6,CR,-.12,.22,-.45,'z',null,6).rotation.y=.4;Cy(.02,.02,.6,CR,.12,.22,-.45,'z',null,6).rotation.y=-.4;
 /* a band of signs down the legs */const bt=k.can(64,256,(x,w,h)=>{x.fillStyle='#e8c050';x.fillRect(0,0,w,h);x.strokeStyle='#1e3a8a';for(let i=0;i<5;i++)pyGlyph(x,i%6,w/2,26+i*50,14)});const bp=A(new THREE.PlaneGeometry(.22,1.0),new THREE.MeshStandardMaterial({map:bt,roughness:.5}),0,.205,.55);bp.rotation.x=-Math.PI/2-.08;
 g.userData.dpKeep=1;pyNoSeam(g);return g}
function pyMummy(){const k=pyKit(),{M}=k,g=new THREE.Group(),{A,Cy}=k.H(g);const t=k.can(128,128,(x,w,h)=>{x.fillStyle='#ddd2b2';x.fillRect(0,0,w,h);for(let i=0;i<18;i++){x.strokeStyle=i%3?'rgba(120,100,70,.5)':'rgba(70,55,35,.6)';x.lineWidth=2+Math.random()*2;x.beginPath();const y=i*8+Math.random()*4;x.moveTo(0,y);x.lineTo(w,y+(Math.random()-.5)*14);x.stroke()}},1);
 const W=new THREE.MeshStandardMaterial({map:t,roughness:1});const legs=A(new THREE.CylinderGeometry(.16,.12,1.3,10),W,0,0,.7);legs.rotation.x=Math.PI/2;legs.scale.x=1.3;A(new THREE.SphereGeometry(.13,10,8),W,0,0,1.36).scale.set(1.2,.8,.8);
 const tr=new THREE.Group();g.add(tr);const T=k.H(tr);T.A(new THREE.CylinderGeometry(.22,.18,.75,12),W,0,.4,0).scale.z=.75;const hd=T.A(new THREE.SphereGeometry(.17,12,10),W,0,.92,0);hd.scale.set(1,1.15,1.05);
 for(const s of[-1,1]){T.A(new THREE.SphereGeometry(.035,6,6),new THREE.MeshBasicMaterial({color:0xff3020}),s*.065,.95,.155);const a=T.Cy(.06,.05,.6,W,s*.28,.62,.28,'z',null,8);a.rotation.x=Math.PI/2-.1;/* a loose bandage end */const b=T.A(new THREE.PlaneGeometry(.06,.3),new THREE.MeshStandardMaterial({map:t,side:THREE.DoubleSide}),s*.3,.5,.55);b.rotation.x=.4}
 g.userData.tr=tr;g.userData.dpKeep=1;pyNoSeam(g);return g}
function pyChest(){const k=pyKit(),{M,MT}=k,g=new THREE.Group(),{A,B}=k.H(g),G=pyGoldMats();const W=new THREE.MeshStandardMaterial({map:k.T.canvas,color:0x7a4422,roughness:.75});
 B(1.0,.06,.6,W,0,.03,0);/* between the walls */for(const s of[-1,1]){B(.05,.7,.7,W,s*.525,.35,0);B(1.0,.7,.05,W,0,.35,s*.325)}/* the walls; the coins inside at .58 */B(1.0,.02,.6,G.heap,0,.58,0);
 for(const x of[-.35,.35])for(const s of[-1,1])B(.08,.7,.012,G.gold,x,.35,s*.357);/* bands, 7 mm off the walls */B(.16,.16,.02,G.gold,0,.55,.362);
 pyNoSeam(g);return g}
function pyChestLid(){const k=pyKit(),g=new THREE.Group(),{A,B}=k.H(g),G=pyGoldMats();const W=new THREE.MeshStandardMaterial({map:k.T.canvas,color:0x7a4422,roughness:.75});
 B(1.14,.06,.74,W,0,-.06,0);const half=(r,h,open)=>{const geo=new THREE.CylinderGeometry(r,r,h,14,1,open,-Math.PI/2,Math.PI);geo.rotateX(-Math.PI/2);geo.rotateY(Math.PI/2);return geo};/* top half, axis along x */
 {const geo=half(.37,1.14,false);geo.scale(1,.324,1);A(geo,W,0,-.03,0)}for(const x of[-.35,.35]){const geo=half(.375,.08,true);geo.scale(1,.34,1);const b=A(geo,G.gold,x,-.03,0);b.material=G.gold}g.userData.dpKeep=1;pyNoSeam(g);return g}
function pyPedestal(){const k=pyKit(),{MT}=k,g=new THREE.Group(),{B,Cy}=k.H(g),G=pyGoldMats();B(.8,.16,.8,MT.lime,0,.08,0);Cy(.26,.3,.8,MT.lapis,0,.56,0,null,null,16);for(const y of[.2,.94])Cy(.31,.31,.05,G.gold,0,y,0,null,null,16);B(.7,.12,.7,MT.lime,0,1.04,0);pyNoSeam(g);return g}
function pyMask(){const k=pyKit(),{M,MT}=k,g=new THREE.Group(),{A,B,Cy}=k.H(g),G=pyGoldMats();const nm=k.can(128,128,(x,w,h)=>{for(let i=0;i<12;i++){x.fillStyle=i%2?'#1e3a8a':'#f0c040';x.fillRect(0,i*11,w,11)}});const NM=new THREE.MeshStandardMaterial({map:nm,metalness:.4,roughness:.35});
 /* the headdress: a striped hood falling to the shoulders, a wide collar, the gold face */const hd=A(new THREE.SphereGeometry(.26,18,12,0,Math.PI*2,0,Math.PI*.62),NM,0,.08,-.04);hd.scale.set(1.15,1.2,1);for(const s of[-1,1]){const l=B(.1,.36,.08,NM,s*.21,-.12,.04);l.rotation.z=s*.12}
 const col=A(new THREE.CylinderGeometry(.22,.3,.1,18,1,false,-Math.PI/2,Math.PI),NM,0,-.3,0);col.scale.z=.7;
 const f=A(new THREE.SphereGeometry(.2,16,12),G.gold,0,.0,.06);f.scale.set(.85,1.12,.75);for(const s of[-1,1]){B(.08,.022,.02,M(0x14100c),s*.07,.05,.205);B(.1,.012,.012,MT.lapis,s*.07,.08,.2)}B(.04,.07,.04,G.gold,0,-.01,.22);B(.08,.012,.012,M(0x8a3a20),0,-.08,.2);
 Cy(.035,.025,.16,NM,0,-.2,.16,null,null,8);/* the beard */B(.12,.03,.05,G.gold,0,.2,.14);/* the brow band */g.userData.dpKeep=1;pyNoSeam(g);return g}
function pyTreasureRoom(g){const k=pyKit(),{M,MT}=k,{A,B,Cy,rod}=k.H(g),{X,Z}=PYRV,G=pyGoldMats(),obs=[];const tx=X-17.6;
 /* a gilded shrine against the north wall: a box with a curved roof, doors, panels */{const z0=Z-8,sg=new THREE.Group();sg.position.set(tx,0,z0+.66);g.add(sg);const s=k.H(sg);s.B(2.2,.18,1.3,MT.dark,0,.09,0);s.B(1.9,1.8,1.1,G.gold,0,1.08,0);
  {const geo=new THREE.CylinderGeometry(1,1,1.96,16,1,false,-Math.PI/2,Math.PI);geo.rotateX(-Math.PI/2);geo.rotateY(Math.PI/2);geo.scale(1,.35,.58);s.A(geo,G.gold,0,1.98,0)}/* a curved roof, its long axis along x */
  const dt=k.can(256,256,(x,w,h)=>{x.fillStyle='#e8b830';x.fillRect(0,0,w,h);x.strokeStyle='#7a5010';x.lineWidth=5;x.strokeRect(8,8,w/2-12,h-16);x.strokeRect(w/2+4,8,w/2-12,h-16);x.strokeStyle='#1e3a8a';pyGlyph(x,1,w/4,h/3,30);pyGlyph(x,1,w*3/4,h/3,30);pyGlyph(x,0,w/4,h*2/3,26);pyGlyph(x,0,w*3/4,h*2/3,26)});
  const d=s.A(new THREE.PlaneGeometry(1.4,1.5),new THREE.MeshStandardMaterial({map:dt,metalness:.4,roughness:.35}),0,1.05,.562);obs.push({x0:tx-1.15,x1:tx+1.15,z0:z0-.02,z1:z0+1.35})}
 /* jars along the south wall */for(let i=0;i<5;i++){const j=pyJar();const x=X-21+i*1.25;if(Math.abs(x-tx)<.6)continue;j.position.set(x,0,Z+7.45);j.scale.setScalar(.8+((i*37)%5)*.06);g.add(j)}obs.push({x0:X-21.5,x1:X-15.6,z0:Z+7.0,z1:Z+8})
 /* two feather fans on poles at the sarcophagus's head */for(const s of[-1,1]){const x=tx+s*1.0,z=Z+1.25;Cy(.05,.06,.06,G.gold,x,.08,z,null,null,10);rod([x,.1,z],[x,2.3,z],.025,G.gold);
  const fan=A(new THREE.CircleGeometry(.45,16,0,Math.PI),new THREE.MeshStandardMaterial({map:k.can(128,64,(x2,w,h)=>{for(let i=0;i<9;i++){x2.fillStyle=['#e8e0d0','#1e3a8a','#b03020'][i%3];x2.beginPath();x2.moveTo(w/2,h);x2.lineTo(i*w/9,0);x2.lineTo((i+1)*w/9,0);x2.fill()}}),side:THREE.DoubleSide,roughness:.9}),x,2.25,z);fan.rotation.y=Math.PI/2;obs.push({x0:x-.1,x1:x+.1,z0:z-.1,z1:z+.1})}
 /* chariot wheels leaning on the east wall */for(let i=0;i<2;i++){const wg=new THREE.Group();wg.position.set(X-11.2-.12-i*.12,.55,Z+4.0+i*.5);wg.rotation.set(0,Math.PI/2,0);wg.rotation.order='YXZ';wg.rotation.x=-.18;g.add(wg);const w=k.H(wg);w.A(new THREE.TorusGeometry(.5,.04,6,24),MT.wood,0,0,0);for(let s2=0;s2<12;s2++){const a=s2*Math.PI/6;w.rod([Math.cos(a)*.07,Math.sin(a)*.07,0],[Math.cos(a)*.47,Math.sin(a)*.47,0],.015,MT.wood)}/* spokes from the hub out */w.Cy(.08,.08,.12,G.gold,0,0,0,'z',null,10)}obs.push({x0:X-11.6,x1:X-11.2,z0:Z+3.4,z1:Z+5.1});
 pyNoSeam(g);return{obs}}

/* =====================================================================================================
   Batch 5: the undercroft (PYU.Y -8, 4.4 high) on its own grid (bx(i) = X-25.6+3.2(i-2), the game's FB list);
   its walls, ceiling, floor and torches, the stairs and landing, the Trial of the Jackal and the Trial of the Sun.
   ===================================================================================================== */
const PYUV={Y:-8,H:4.4},PYFB=[[2,6,14,17],[7,8,16,16],[9,13,13,17],[11,11,9,12],[8,15,3,8],[16,16,5,5],[17,20,3,9],[18,19,10,17],[14,18,18,20],[10,13,18,18]];
const pyBx=i=>PYRV.X-25.6+3.2*(i-2),pyBz=j=>PYRV.Z-25.6+3.2*(j-2);
const pyIsU=(()=>{const s=new Set();for(const[a,b,c,d]of PYFB)for(let i=a;i<=b;i++)for(let j=c;j<=d;j++)s.add(i+','+j);return(i,j)=>s.has(i+','+j)})();
const pyUZone=(i,j)=>i>=2&&i<=6&&j>=14&&j<=17?'landing':i>=9&&i<=13&&j>=13&&j<=17?'jackal':i>=8&&i<=15&&j>=3&&j<=8?'sun':i>=17&&i<=20&&j>=3&&j<=9?'song':i>=18&&i<=19&&j>=10&&j<=17?'sand':i>=14&&i<=18&&j>=18&&j<=20?'tomb':'pass';
/* the undercroft's torch walls, from the game's T(i,j,side) list (side 0 north, 1 east, 2 south, 3 west) */
const PYUT=[[2,15,3],[6,15,1],[9,14,3],[13,16,1],[9,17,3],[8,5,3],[15,7,1],[12,3,0],[17,4,3],[17,8,3],[18,12,3],[19,15,1],[14,19,3],[18,19,1],[16,18,0]].map(([i,j,sd])=>[i,j,[0,1,0,-1][sd],[-1,0,1,0][sd]]);
function pyUCeilTex(){const k=pyKit();if(k.uceil)return k.uceil;return k.uceil=k.can(256,256,(x,w,h)=>{x.fillStyle='#4a3a28';x.fillRect(0,0,w,h);for(let i=0;i<4000;i++){x.fillStyle=Math.random()<.5?'rgba(20,14,8,'+Math.random()*.15+')':'rgba(200,170,120,'+Math.random()*.06+')';x.fillRect(Math.random()*w,Math.random()*h,2,2)}
 x.strokeStyle='rgba(20,14,8,.5)';x.lineWidth=3;for(let r=0;r<2;r++){x.beginPath();x.moveTo(0,r*128+1);x.lineTo(w,r*128+1);x.stroke()}x.fillStyle='rgba(220,180,80,.35)';for(let i=0;i<5;i++){const cx=30+Math.random()*200,cy=30+Math.random()*200;x.beginPath();for(let a=0;a<10;a++){const r=a%2?3:8,an=a*Math.PI/5;x.lineTo(cx+Math.cos(an)*r,cy+Math.sin(an)*r)}x.fill()}},1)}
/* walls (painted faces on the cell lines, 1 cm proud of nothing: the game's wall boxes go), ceiling tiles with beams on
   odd columns, the floor slab (top at Y). The stairwell cell (4,14) gets no ceiling tile: pyUnderStairs lines its opening. */
function pyUnderplan(g){const k=pyKit(),{Y,H}=PYUV,C=3.2,ceil=new THREE.Group(),mats={};g.add(ceil);const WM=(kind,sd,op)=>{op=Object.assign({old:1},op||{});const key=kind+sd+JSON.stringify(op);return mats[key]||(mats[key]=new THREE.MeshStandardMaterial({map:pyWallTex(kind,sd,op),roughness:.92}))};
 const pick=(i,j,di,dj)=>{if(PYUT.some(t=>t[0]==i&&t[1]==j&&t[2]==di&&t[3]==dj))return['torch'];const z=pyUZone(i,j);if(z=='jackal')return[(i+j)%2?'jackals':'glyph'];if(z=='sun')return[(i+j)%2?'sunrays':'glyph'];if(z=='landing')return[(i+j)%2?'walk':'glyph'];if(z=='pass')return[(i+j)%2?'plain':'glyph'];if(z=='song')return[(i+j)%2?'music':'glyph'];if(z=='sand')return[(i+j)%2?'dunes':'glyph'];if(z=='tomb')return[dj>0?'busboat':(i+j)%2?'offer':'glyph'];return[(i+j)%3?'glyph':'plain']};
 for(let i=1;i<=21;i++)for(let j=1;j<=21;j++){if(!pyIsU(i,j))continue;const x=pyBx(i),z=pyBz(j);
  for(const[di,dj]of[[1,0],[-1,0],[0,1],[0,-1]]){if(pyIsU(i+di,j+dj))continue;const pk=pick(i,j,di,dj),geo=new THREE.PlaneGeometry(C,H);/* the 3.9 m panel stretched to 4.4 */
   const m=new THREE.Mesh(geo,WM(pk[0],(i*5+j*3)%4,pk[1]));m.rotation.y=di>0?-Math.PI/2:di<0?Math.PI/2:dj>0?Math.PI:0;m.position.set(x+di*C/2,Y+H/2,z+dj*C/2);g.add(m)}
  if(!(i==4&&j==14)){const m=new THREE.Mesh(new THREE.PlaneGeometry(C,C),k.uceilM||(k.uceilM=new THREE.MeshStandardMaterial({map:pyUCeilTex(),roughness:.95})));m.rotation.x=Math.PI/2;m.position.set(x,Y+H,z);ceil.add(m)}
  /* a beam across the cell on odd columns (they join up from cell to cell and run 10 cm into the walls) */if(i%2){const n=pyIsU(i,j-1),s2=pyIsU(i,j+1),z0=z-C/2-(n?0:.1),z1=z+C/2+(s2?0:.1);/* into the wall at the ends */const b=new THREE.Mesh(k.boxGeo(.35,.3,z1-z0,1.6),k.M(0x5a4028,{roughness:.9}));b.position.set(x,Y+H-.14,(z0+z1)/2);ceil.add(b)}}
 /* the floor: the game's slab (top at Y), stone slabs */{const x0=pyBx(2)-1.6,x1=pyBx(20)+1.6,z0=pyBz(3)-1.6,z1=pyBz(20)+1.6;const m=new THREE.Mesh(k.boxGeo(x1-x0,.06,z1-z0,3.2,[(x0+x1)/2,Y-.03,(z0+z1)/2]),pyFloorMat());m.position.set((x0+x1)/2,Y-.03,(z0+z1)/2);g.add(m)}
 g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{ceil}}
/* the painted tablets with the trials' clues (the game's art(lines, icons, x, z, ry, w, h) planes): stone, a border of
   signs, the words in big clear letters. Returns a material for the game's plane. */
function pyTablet(lines,w,h){const k=pyKit(),W=512,Hp=Math.round(512*h/w);const t=k.can(W,Hp,(x,cw,ch)=>{x.fillStyle='#d8c094';x.fillRect(0,0,cw,ch);for(let i=0;i<3000;i++){x.fillStyle='rgba(80,55,25,'+Math.random()*.08+')';x.fillRect(Math.random()*cw,Math.random()*ch,2,2)}
 x.strokeStyle='#5a3a14';x.lineWidth=8;x.strokeRect(10,10,cw-20,ch-20);x.lineWidth=3;x.strokeRect(24,24,cw-48,ch-48);x.strokeStyle='#1e3a8a';const n=Math.floor((cw-80)/52);for(let i=0;i<n;i++){pyGlyph(x,i%6,40+i*(cw-80)/(n-1),44,12)}
 x.fillStyle='#3a2208';x.textAlign='center';x.textBaseline='middle';const L=lines.length;let f=Math.min((ch-110)/(L*1.25),64);x.font='bold '+f+'px DoorsSans,Arial,sans-serif';const mw=Math.max(...lines.map(l=>x.measureText(l).width));if(mw>cw-70){f*=(cw-70)/mw;x.font='bold '+f+'px DoorsSans,Arial,sans-serif'}
 lines.forEach((l,i)=>x.fillText(l,cw/2,70+(ch-90)/2+(i-(L-1)/2)*f*1.25))});return new THREE.MeshBasicMaterial({map:t})}
/* the stairs up to the scarab trapdoor: the game's nine steps (cell (4,14..15), rising to the north) wall to wall,
   with nosings; the opening above (4,14) lined with stone going up 1.2 m into the dark. */
function pyUnderStairs(g){const k=pyKit(),{M}=k,{Y,H}=PYUV,{B,A}=k.H(g),x=pyBx(4),zs=pyBz(15)+1.6,ST=pyStoneMat();
 for(let i=0;i<9;i++){const d=6.4/9,h=(i+1)*H/9,z=zs-(i+.5)*d;B(3.18,h,d,ST,x,Y+h/2,z,null,1.6);B(3.14,.04,.06,k.M(0x8a7050),x,Y+h,z+d/2-.02)/* a nosing, 1 cm proud of the step's front */}
 const zc=pyBz(14);for(const s of[-1,1]){B(.3,1.2,3.2,ST,x+s*1.45,Y+H+.6,zc,null,1.6);B(2.6,1.2,.3,ST,x,Y+H+.6,zc+s*1.45,null,1.6)}A(new THREE.PlaneGeometry(2.6,2.6),new THREE.MeshBasicMaterial({color:0x050302}),x,Y+H+1.2,zc).rotation.x=Math.PI/2;pyNoSeam(g)}
/* the undercroft's gates (the slabs the game sinks): carved stone, same size; kind 'jackal' | 'sun' | 'song' | 'tomb' */
function pyGateSlab(w,h,d,kind){const k=pyKit(),{M}=k;const t=k.can(512,512,(x,cw,ch)=>{x.fillStyle='#bfa070';x.fillRect(0,0,cw,ch);for(let i=0;i<4000;i++){x.fillStyle='rgba(60,40,20,'+Math.random()*.1+')';x.fillRect(Math.random()*cw,Math.random()*ch,2,2)}x.strokeStyle='#5a3a14';x.lineWidth=10;x.strokeRect(16,16,cw-32,ch-32);
 const cx=cw/2,cy=ch/2;x.lineWidth=8;if(kind=='jackal'){/* a jackal lying on a shrine, like the wall paintings, twice the size */x.save();x.translate(cx-12,cy+90);x.scale(2,2);const g0=0,c0=0;x.fillStyle='#e0b040';x.fillRect(c0-70,g0-30,140,30);x.fillStyle='#1e3a6a';x.fillRect(c0-70,g0-34,140,6);x.fillStyle='#14100c';x.beginPath();x.ellipse(c0-6,g0-56,52,22,0,0,7);x.fill();x.beginPath();x.ellipse(c0+46,g0-84,15,20,0,0,7);x.fill();x.beginPath();x.moveTo(c0+52,g0-90);x.lineTo(c0+86,g0-80);x.lineTo(c0+56,g0-74);x.fill();x.beginPath();x.moveTo(c0+38,g0-96);x.lineTo(c0+36,g0-140);x.lineTo(c0+50,g0-100);x.moveTo(c0+48,g0-98);x.lineTo(c0+54,g0-138);x.lineTo(c0+60,g0-96);x.fill();x.fillRect(c0+20,g0-44,60,10);x.fillRect(c0-70,g0-44,20,8);x.fillStyle='#e0b040';x.fillRect(c0+36,g0-76,22,5);x.restore()}
 else if(kind=='sun'){x.fillStyle='#e8b830';x.beginPath();x.arc(cx,cy,90,0,7);x.fill();x.strokeStyle='#8a5a10';for(let i=0;i<12;i++){const a=i*Math.PI/6;x.beginPath();x.moveTo(cx+Math.cos(a)*110,cy+Math.sin(a)*110);x.lineTo(cx+Math.cos(a)*170,cy+Math.sin(a)*170);x.stroke()}}
 else if(kind=='song'){x.strokeStyle='#5a3a14';for(let i=0;i<3;i++){x.beginPath();x.arc(cx,cy,60+i*50,-.9,.9);x.stroke();x.beginPath();x.arc(cx,cy,60+i*50,Math.PI-.9,Math.PI+.9);x.stroke()}x.fillStyle='#e8b830';x.beginPath();x.arc(cx,cy,40,0,7);x.fill()}
 else{x.strokeStyle='#1e3a8a';pyGlyph(x,0,cx,cy-40,110)}x.strokeStyle='#5a3a14';for(let i=0;i<5;i++)pyGlyph(x,(i+2)%6,80+i*88,ch-60,18)});
 const F=new THREE.MeshStandardMaterial({map:t,roughness:.9}),S=pyStoneMat();const mats=w<d?[F,F,S,S,S,S]:[S,S,S,S,F,F];/* the carving on both big faces */
 const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mats);m.userData.noSeam=true;return m}

/* the Trial of the Jackal: the altar (the game's 1.8 x 1 x 1.8 box and gold top, top at Y+1.1) with a fire bowl */
function pyAltar(){const k=pyKit(),{M,MT}=k,g=new THREE.Group(),{A,B,Cy}=k.H(g),G=pyGoldMats();B(1.9,.2,1.9,MT.dark,0,.1,0);B(1.6,.8,1.6,MT.lime,0,.6,0);B(1.8,.1,1.8,G.gold,0,1.05,0);
 const t=k.can(256,128,(x,w,h)=>{x.fillStyle='#e2d0a6';x.fillRect(0,0,w,h);x.strokeStyle='#14100c';for(let i=0;i<3;i++)pyGlyph(x,[1,0,1][i],48+i*80,h/2,26);x.strokeStyle='#5a3a14';x.lineWidth=5;x.strokeRect(6,6,w-12,h-12)});const PM=new THREE.MeshStandardMaterial({map:t,roughness:.85});
 for(let i=0;i<4;i++){const p=A(new THREE.PlaneGeometry(1.4,.6),PM,Math.sin(i*Math.PI/2)*.812,.6,Math.cos(i*Math.PI/2)*.812);p.rotation.y=i*Math.PI/2}
 Cy(.4,.24,.24,M(0x8a6a30,{metalness:.7,roughness:.35,side:THREE.DoubleSide}),0,1.22,0,null,null,16,true);Cy(.24,.24,.02,M(0x8a6a30,{metalness:.7}),0,1.11,0,null,null,16);Cy(.37,.37,.02,M(0x1a0e06),0,1.28,0,null,null,16);
 const f=k.H(g).flame(0,1.29,0,1.3);g.userData.flame=f;pyNoSeam(g);return g}
/* the Sun's source on the west wall: the light comes down a shaft through a square hole in the ceiling onto a bronze
   dish on a bracket. Group origin = the game's sx (the wall is 15 cm behind, at -x); y = the beam height by. */
function pySunSource(){const k=pyKit(),{M}=k,g=new THREE.Group(),{A,B,Cy,rod}=k.H(g),G=pyGoldMats(),{H}=PYUV;const BR=M(0x8a6a30,{metalness:.7,roughness:.35});
 B(.08,.9,.9,BR,-.15,0,0);rod([-.12,0,0],[.27,0,0],.05,BR);const d=A(new THREE.SphereGeometry(.55,24,10,0,Math.PI*2,0,.55),M(0xf0c040,{metalness:.65,roughness:.3,emissive:0x2a1c00,side:THREE.DoubleSide}),.8,0,0);d.rotation.z=Math.PI/2;/* a shallow dish, its inside facing +x */
 /* the opening in the ceiling above (the game's shaft is at x +.3, 0.6 square): a stone collar and the bright sky */const hy=H-1.5;for(const s of[-1,1]){B(.12,.3,.84,k.T&&pyStoneMat(),.3+s*.36,hy-.1,0);B(.6,.3,.12,pyStoneMat(),.3,hy-.1,s*.36)}
 const sky=A(new THREE.PlaneGeometry(.6,.6),new THREE.MeshBasicMaterial({color:0xfff4c8}),.3,hy-.03,0);/* inside the collar, under the ceiling */sky.rotation.x=Math.PI/2;pyNoSeam(g);return g}
/* the golden disc on the north wall the beam must reach: a carved backing with painted rays through the wall line and
   the disc (its material's emissive is what the game lights up). Group origin = (tx, by, wall z); the disc faces +z. */
function pySunTarget(){const k=pyKit(),{M}=k,g=new THREE.Group(),{A,B,Cy}=k.H(g);const t=k.can(512,512,(x,w,h)=>{x.fillStyle='#d8c094';x.fillRect(0,0,w,h);x.strokeStyle='#5a3a14';x.lineWidth=10;x.strokeRect(12,12,w-24,h-24);x.strokeStyle='#c89020';x.lineWidth=14;for(let i=0;i<12;i++){const a=i*Math.PI/6;x.beginPath();x.moveTo(w/2+Math.cos(a)*150,h/2+Math.sin(a)*150);x.lineTo(w/2+Math.cos(a)*230,h/2+Math.sin(a)*230);x.stroke()}});
 const back=new THREE.Mesh(new THREE.BoxGeometry(2.6,2.6,.12),[pyStoneMat(),pyStoneMat(),pyStoneMat(),pyStoneMat(),new THREE.MeshStandardMaterial({map:t,roughness:.85}),pyStoneMat()]);back.position.z=.04;g.add(back);/* from 2 cm behind the wall line to 10 cm in front */
 const disc=Cy(.75,.75,.12,M(0xb08a20,{metalness:.8,roughness:.3,emissive:0x000000}),0,0,.16,'z',null,32);Cy(.8,.8,.06,M(0x6a4a10,{metalness:.6}),0,0,.12,'z',null,32);g.userData.disc=disc;pyNoSeam(g);return g}
/* a turning mirror: the stand (fixed) and the head (into the game's piv, which turns round y; frame bottom 5 cm over
   the pedestal) */
function pyMirrorStand(){const k=pyKit(),{MT}=k,g=new THREE.Group(),{Cy,B}=k.H(g),G=pyGoldMats();B(.9,.12,.9,MT.dark,0,.06,0);Cy(.3,.38,.6,MT.lime,0,.42,0,null,null,16);Cy(.36,.3,.08,G.gold,0,.76,0,null,null,16);pyNoSeam(g);return g}
function pyMirrorHead(){const k=pyKit(),{M}=k,g=new THREE.Group(),{A,B,Cy}=k.H(g),G=pyGoldMats();Cy(.12,.12,.12,G.gold,0,-.66,0,null,null,12);/* the swivel, on the pedestal (piv at +.7 over its top) */
 const W=1.3,Hh=1.3,T=.08;for(const s of[-1,1]){B(T,Hh,.12,G.gold,s*(W/2-T/2),0,0);B(W-2*T,T,.12,G.gold,0,s*(Hh/2-T/2),0)}
 const MM=M(0xdce8f8,{metalness:.3,roughness:.12,emissive:0x405060});for(const s of[-1,1]){const p=A(new THREE.PlaneGeometry(W-2*T+.02,Hh-2*T+.02),MM,0,0,s*.01);p.rotation.y=s>0?0:Math.PI}
 const sun=A(new THREE.CircleGeometry(.14,16),G.gold,0,Hh/2+.12,0);B(.06,.12,.06,G.gold,0,Hh/2+.03,0);const sun2=A(new THREE.CircleGeometry(.14,16),G.gold,0,Hh/2+.12,-.001);sun2.rotation.y=Math.PI;
 g.userData.dpKeep=1;pyNoSeam(g);return g}
function pyLandingDressing(g){const{Y}=PYUV,sk=pySkeleton();sk.position.set(pyBx(6)-.4,Y-.05,pyBz(17)+.7);/* its floor is at 5 cm */sk.rotation.y=.4;g.add(sk)}

/* =====================================================================================================
   Batch 6: the Trial of Song (room i17..20, j3..9), the Trial of Sand (i18..19, j10..17), the tomb (i14..18, j18..20).
   ===================================================================================================== */
/* a gong's stand (static) at the game's gong spot (x = bx(20)+1.6-.55, z): posts at z ±.75, a beam at Y+2.45, cords */
function pyGongFrame(g,x,z){const k=pyKit(),{M,MT}=k,{Y}=PYUV,{B,Cy,rod,A}=k.H(g),G=pyGoldMats(),W=MT.wood;for(const s of[-1,1]){B(.5,.08,.3,MT.dark,x,Y+.04,z+s*.75);B(.14,2.55,.14,W,x,Y+1.355,z+s*.75);Cy(.12,.06,.18,G.gold,x,Y+2.72,z+s*.75,null,null,10)}
 B(.16,.16,1.9,W,x,Y+2.47,z);for(const s of[-1,1])rod([x,Y+2.39,z+s*.25],[x,Y+2.12,z+s*.12],.012,k.M(0x3a2a18));pyNoSeam(g)}
/* the gong itself (the game's `d`, which it wobbles and lights): a bronze disc with a boss and rings, axis along x */
function pyGongDisc(){const k=pyKit();const t=k.can(256,256,(x,w,h)=>{x.fillStyle='#c89030';x.fillRect(0,0,w,h);for(let r=20;r<128;r+=12){x.strokeStyle='rgba(90,60,10,'+(.25+(r%24?0:.2))+')';x.lineWidth=3;x.beginPath();x.arc(w/2,h/2,r,0,7);x.stroke()}x.fillStyle='rgba(255,230,150,.35)';x.beginPath();x.arc(w/2,h/2,26,0,7);x.fill()});
 const m=new THREE.MeshStandardMaterial({map:t,color:0xffffff,metalness:.45,roughness:.35,emissive:0x3a2400});const geo=new THREE.CylinderGeometry(.6,.6,.06,32);const d=new THREE.Mesh(geo,m);d.rotation.z=Math.PI/2;
 const boss=new THREE.Mesh(new THREE.SphereGeometry(.14,16,8,0,Math.PI*2,0,Math.PI/2),m);boss.position.y=.025;d.add(boss);const boss2=boss.clone();boss2.rotation.x=Math.PI;boss2.position.y=-.025;d.add(boss2);d.userData.dpKeep=1;d.userData.noSeam=true;return d}
/* the gongs' signs, drawn (the game's labels used a hieroglyph some fonts lack): k 0 sun, 1 eye, 2 snake, 3 scarab, 4 ankh */
function pyGongLabel(k){const K=pyKit();return new THREE.MeshBasicMaterial({map:K.can(128,128,(x,w,h)=>{x.fillStyle='#d8c094';x.fillRect(0,0,w,h);x.strokeStyle='#5a3a14';x.lineWidth=6;x.strokeRect(5,5,w-10,h-10);x.strokeStyle=['#c88a10','#1e4a9a','#2a7a3a','#1e3a9a','#7a3a14'][k];pyGlyph(x,[2,1,6,5,0][k],w/2,h/2,40)})})}
/* the stone priest who sings (the game's group at (bx(18), Y, bz(6)), turned to face the gongs): our own design */
function pyPriest(){const k=pyKit(),{M,MT}=k,g=new THREE.Group(),{A,B,Cy,rod}=k.H(g),G=pyGoldMats();const ST=new THREE.MeshStandardMaterial({map:k.T.lime,color:0xe8dcc0,roughness:.85}),SK=M(0x9a6a40,{roughness:.8});
 B(1.0,.5,1.0,MT.dark,0,.25,0);B(.9,.05,.9,G.gold,0,.525,0);
 const robe=A(new THREE.CylinderGeometry(.22,.42,1.5,16),ST,0,1.3,0);robe.scale.z=.8;/* a long robe */A(new THREE.CylinderGeometry(.24,.22,.5,14),SK,0,2.3,0).scale.z=.75;/* bare chest */
 const pt=k.can(128,64,(x,w,h)=>{x.fillStyle='#d8a050';x.fillRect(0,0,w,h);x.fillStyle='#3a2410';for(let i=0;i<30;i++){x.beginPath();x.arc(Math.random()*w,Math.random()*h,3+Math.random()*3,0,7);x.fill()}});const sash=A(new THREE.CylinderGeometry(.255,.255,.18,14,1,true),new THREE.MeshStandardMaterial({map:pt,side:THREE.DoubleSide}),0,2.15,0);sash.scale.z=.78;sash.rotation.z=.25;/* a spotted sash */
 Cy(.08,.09,.14,SK,0,2.6,0,null,null,10);const hd=A(new THREE.SphereGeometry(.17,14,12),SK,0,2.79,.01);hd.scale.set(.95,1.1,1);/* shaved head */
 for(const s of[-1,1]){B(.06,.025,.02,M(0x14100c),s*.065,2.83,.17);rod([s*.25,2.48,0],[s*.3,2.12,.12],.055,SK);rod([s*.3,2.12,.12],[s*.18,1.95,.3],.05,SK)}B(.08,.03,.02,M(0x3a1a0a),0,2.7,.17);/* the mouth that sings */
 const sis=new THREE.Group();sis.position.set(.18,1.95,.32);g.add(sis);k.H(sis).rod([0,-.15,0],[0,.08,0],.018,G.gold);k.H(sis).A(new THREE.TorusGeometry(.08,.012,6,16,Math.PI),G.gold,0,.08,0);/* a sistrum */
 B(.5,.1,.06,G.gold,0,2.53,.17);pyNoSeam(g);return g}
/* a wall lever for the Trial of Sand, a proper throw lever. sd = which wall (-1 west, +1 east) as in the game's list;
   x = the game's lever spot (bx(i)+sd*1.45), the wall 15 cm behind it. The game's handle group h sits 8 cm in front
   of the plate and turns round z (an axle along the wall): two bronze cheeks hold that axle, the handle sticks out
   from the wall. With the angles swapped in the spec (start -sd*.6, pulled +sd*.6) it starts up at 45 degrees and
   pulls down to 24 degrees below level, always clear of the wall. */
function pyLeverPlate(g,x,y,z,sd){const k=pyKit(),{M}=k,{B,A,Cy}=k.H(g);const BR=M(0x5a4a30,{metalness:.6,roughness:.5}),BZ=M(0x8a6a30,{metalness:.7,roughness:.35});
 B(.2,.7,.5,BR,x+sd*.1,y,z);/* the plate, from the lever spot back through the wall line */
 const t=k.can(128,180,(c,w,h)=>{c.fillStyle='#4a3a24';c.fillRect(0,0,w,h);c.strokeStyle='#c8a050';c.lineWidth=5;c.strokeRect(6,6,w-12,h-12);c.fillStyle='#c8a050';c.beginPath();c.moveTo(w/2-22,h-70);c.lineTo(w/2+22,h-70);c.lineTo(w/2,h-30);c.fill();c.fillRect(w/2-6,h-110,12,42);c.font='bold 22px DoorsSans,Arial';c.textAlign='center';c.fillText('PULL',w/2,34)});
 const p=A(new THREE.PlaneGeometry(.46,.66),new THREE.MeshStandardMaterial({map:t,roughness:.6}),x-sd*.012,y,z+.0);p.rotation.y=sd>0?-Math.PI/2:Math.PI/2;
 /* two cheeks out from the plate to just past the axle (1 cm into the plate), the axle along z through both */for(const s2 of[-1,1]){const c=B(.2,.26,.02,BZ,x-sd*.09,y,z+s2*.07);}Cy(.022,.022,.2,BZ,x-sd*.08,y,z,'z',null,10);pyNoSeam(g)}
function pyLeverHandle(sd){const k=pyKit(),{M}=k,g=new THREE.Group(),{Cy,A,rod}=k.H(g);const a=.185,dx=-sd*Math.cos(a),dy=Math.sin(a),L=.62;
 Cy(.045,.045,.1,M(0x6a5a40,{metalness:.6}),0,0,0,'z',null,12);/* the hub on the axle, between the cheeks */rod([0,0,0],[dx*L,dy*L,0],.03,M(0x6a5a40,{metalness:.5,roughness:.4}));A(new THREE.SphereGeometry(.08,12,8),M(0xc01818,{roughness:.4}),dx*(L+.05),dy*(L+.05),0);
 for(let i=0;i<2;i++){const b=A(new THREE.TorusGeometry(.04,.008,4,10),M(0xc8a050,{metalness:.6}),dx*(.2+i*.18),dy*(.2+i*.18),0);b.rotation.y=Math.PI/2;b.rotation.z=0;b.lookAt(dx*10,dy*10,0)}g.userData.dpKeep=1;pyNoSeam(g);return g}
/* the sand: materials for the game's rising sand box and its four falling streams (scroll their map.offset.y) */
function pySandMats(){const k=pyKit();if(k.sm)return k.sm;const t=k.can(256,256,(x,w,h)=>{x.fillStyle='#d8b070';x.fillRect(0,0,w,h);for(let i=0;i<8000;i++){x.fillStyle=Math.random()<.5?'rgba(150,110,50,'+Math.random()*.2+')':'rgba(255,240,200,'+Math.random()*.2+')';x.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*2,1)}for(let i=0;i<10;i++){x.strokeStyle='rgba(150,110,50,.25)';x.lineWidth=2;x.beginPath();x.moveTo(0,i*26);for(let u=0;u<w;u+=16)x.lineTo(u,i*26+Math.sin(u*.05+i)*6);x.stroke()}},1);
 const f=k.can(64,256,(x,w,h)=>{x.clearRect(0,0,w,h);for(let i=0;i<60;i++){const u=Math.random()*w;x.fillStyle='rgba(220,180,110,'+(.3+Math.random()*.5)+')';x.fillRect(u,Math.random()*h,1+Math.random()*3,20+Math.random()*80)}},1);
 return k.sm={sand:new THREE.MeshStandardMaterial({map:t,color:0xffffff,roughness:1,side:THREE.DoubleSide}),fall:new THREE.MeshBasicMaterial({map:f,transparent:true,opacity:.9,depthWrite:false,side:THREE.DoubleSide})}}
/* the four cracks in the Sand room's ceiling the streams pour from (the game's falls at bx(18+k%2) -/+ .6, bz(11+2k)) */
function pySandCracks(g){const k=pyKit(),{Y,H}=PYUV,{A}=k.H(g);const t=k.can(128,128,(x,w,h)=>{x.clearRect(0,0,w,h);x.fillStyle='#0a0604';x.beginPath();for(let a=0;a<Math.PI*2;a+=.4){const r=30+Math.random()*16;x.lineTo(w/2+Math.cos(a)*r,h/2+Math.sin(a)*r)}x.fill();x.strokeStyle='#1a120a';x.lineWidth=3;for(let i=0;i<6;i++){const a=Math.random()*7;x.beginPath();x.moveTo(w/2+Math.cos(a)*36,h/2+Math.sin(a)*36);x.lineTo(w/2+Math.cos(a)*60,h/2+Math.sin(a)*60);x.stroke()}});
 const m=new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false});for(let i=0;i<4;i++){const p=A(new THREE.PlaneGeometry(1,1),m,pyBx(18+(i%2))+(i%2?-.6:.6),Y+H-.01,pyBz(11+i*2));p.rotation.x=Math.PI/2}}
/* the tomb: Khufu-Bob's coffin on its plinth (the game's base, stripes and gold top: 4.2 x 2.4, top at Y+1.345, head to +x) */
function pyKhufuCoffin(){const k=pyKit(),{MT}=k,g=new THREE.Group(),{B}=k.H(g),G=pyGoldMats();B(4.2,.5,2.4,MT.dark,0,.25,0);B(4.0,.04,2.2,G.gold,0,.52,0);
 /* the sarcophagus design, bigger, lying with its head to +x and the face looking up (rotated so its -z head points +x) */const c=new THREE.Group();c.rotation.y=-Math.PI/2;c.position.y=.54;g.add(c);const tr=pySarcophagus();tr.scale.set(1.3,.85,1.35);c.add(tr);
 const lid=pySarcLid();lid.scale.set(1.3,1,1.35);lid.position.y=.85*.9+.09;c.add(lid);pyNoSeam(g);return g}
/* four canopic jars with animal-head lids (jackal, falcon, baboon, human: simple shapes of our own) */
function pyCanopic(kind){const k=pyKit(),{M,MT}=k,g=new THREE.Group(),{A,B}=k.H(g),G=pyGoldMats();const pts=[[0,0],[.16,0],[.2,.1],[.21,.35],[.17,.55],[.15,.58],[0,.58]].map(p=>new THREE.Vector2(p[0],p[1]));
 const t=k.can(128,64,(x,w,h)=>{x.fillStyle='#e8dcc0';x.fillRect(0,0,w,h);x.strokeStyle='#1e3a8a';for(let i=0;i<3;i++)pyGlyph(x,[0,1,5][i],22+i*42,32,12)});A(new THREE.LatheGeometry(pts,16),new THREE.MeshStandardMaterial({map:t,roughness:.6}),0,0,0);
 const L=kind==1?M(0x3a5a8a,{roughness:.5}):kind==2?M(0x8a7a6a,{roughness:.7}):kind==3?MT.lime:MT.basalt;const hd=A(new THREE.SphereGeometry(.15,12,10),L,0,.7,0);hd.scale.set(1,1.1,1);B(.28,.06,.28,G.gold,0,.6,0);
 if(kind==0){for(const s of[-1,1])A(new THREE.ConeGeometry(.04,.16,4),L,s*.07,.88,0);const sn=A(new THREE.ConeGeometry(.06,.16,8),L,0,.68,.16);sn.rotation.x=Math.PI/2}
 else if(kind==1){const bk=A(new THREE.ConeGeometry(.045,.1,6),G.gold,0,.68,.16);bk.rotation.x=Math.PI/2+.5}else if(kind==2){A(new THREE.SphereGeometry(.08,10,8),L,0,.66,.12)}else{B(.3,.2,.06,M(0x1e3a8a),0,.72,-.06)}
 pyNoSeam(g);return g}
/* the Heart's pedestal (.8 x 1.1 x .8, top Y+1.1) and a heart-shaped gem geometry for the game's ht (it scales y by 1.3) */
function pyHeartPedestal(){const k=pyKit(),{MT}=k,g=new THREE.Group(),{B,Cy}=k.H(g),G=pyGoldMats();B(.8,.14,.8,MT.dark,0,.07,0);Cy(.26,.3,.84,new THREE.MeshStandardMaterial({map:k.T.lime,color:0xc02030,roughness:.6}),0,.56,0,null,null,16);B(.7,.12,.7,G.gold,0,1.04,0);pyNoSeam(g);return g}
function pyHeartGeo(){const s=new THREE.Shape();s.moveTo(0,-.24);s.bezierCurveTo(-.08,-.14,-.26,-.04,-.24,.08);s.bezierCurveTo(-.22,.2,-.06,.22,0,.1);s.bezierCurveTo(.06,.22,.22,.2,.24,.08);s.bezierCurveTo(.26,-.04,.08,-.14,0,-.24);
 const geo=new THREE.ExtrudeGeometry(s,{depth:.08,bevelEnabled:true,bevelThickness:.03,bevelSize:.02,bevelSegments:2,curveSegments:12});geo.center();geo.scale(1,1/1.3*1.15,1);return geo}
/* a fire bowl on a bronze bracket, for the two by the Heart (the game's floating bowls at x ±1.3, Y+1.6, bz(20)+1.45) */
function pyWallBowl(g,x,y,z){const k=pyKit(),{M}=k,{B,Cy,rod}=k.H(g),BR=M(0x6a5030,{metalness:.6,roughness:.4});B(.3,.4,.08,BR,x,y-.15,z+.15);rod([x,y-.25,z+.15],[x,y-.08,z],.025,BR);Cy(.18,.1,.3,M(0x6a5030,{metalness:.6,roughness:.4,side:THREE.DoubleSide}),x,y,z,null,null,12,true);Cy(.1,.1,.01,BR,x,y-.145,z,null,null,12);Cy(.16,.16,.012,M(0x1a0e06),x,y+.08,z,null,null,12);
 const f=k.H(g).flame(x,y+.09,z,1.1);pyNoSeam(g);return f}

/* =====================================================================================================
   THE WIRING (r640). build.py's patches in pyrBuild / pyrUnder call these.
   ===================================================================================================== */
/* draw n numbers from the current (seeded) random: what the old meshes we no longer build used to draw */
function pywBurn(n){for(let i=0;i<n;i++)Math.random()}
/* build a model on the browser's own random, so the desert's seeded sequence is not touched */
function pywNS(f){return typeof noSeed=='function'?noSeed(f):f()}
/* put o at (x,y,z) in g; keep = it moves, so the batching must leave it alone */
function pywAt(g,o,x,y,z,keep){o.position.set(x,y,z);if(keep)o.userData.dpKeep=1;g.add(o);return o}
/* every model flame in and around the pyramid flickers from one callback, only while you are near it */
function pywFl(q,f){if(!f||!f.userData||!f.userData.flick)return f;let L=q.pyFl;if(!L||L.q!==q){L=q.pyFl=[];L.q=q;q.anims.push({x:PYRV.X,z:PYRV.Z,r:75,f:dt=>{const t=q.rt||0;for(const o of L)o.userData.flick(t)}})}L.push(f);return f}
/* a ground-floor torch: the bronze torch on the wall face, the game's glow sprite at its flame, the light where it was */
function pywTorch(q,g,x,z,ry,lit){const t=pywNS(()=>pyTorch(g,x,z,ry));pywFl(q,t.userData.flame);const gp=t.userData.glow,fl=glowSp(0xff9030,.85,1.1);fl.position.set(gp[0],gp[1],gp[2]);t.add(fl);
 q.anims.push(dt=>{fl.scale.setScalar(.9+Math.sin(q.rt*15+x)*.12)});if(lit){const L=new THREE.PointLight(0xff9a40,1.3,16);L.position.set(0,2.6,.6);t.add(L)}return t}
/* the passage and undercroft torches keep pyrTorch's two glow sprites and its light */
function pywUGlow(q,t,x,z,lit){pywFl(q,t.userData.flame);const gp=t.userData.glow,fl=glowSp(0xff9030,.85,1.15),f2=glowSp(0xffe090,.9,.45);fl.position.set(gp[0],gp[1]+.06,gp[2]);f2.position.set(gp[0],gp[1],gp[2]);t.add(fl);t.add(f2);
 q.anims.push(dt=>{const k=1+Math.sin(q.rt*15+x)*.12+Math.sin(q.rt*7.7+z)*.07;fl.scale.setScalar(1.15*k);f2.scale.setScalar(.45*k)});
 if(lit){/* where pyrTorch had it, (0, 2.6, .7) in the torch's frame, but in the desert group itself (see pywUGroup) */const L=new THREE.PointLight(0xff9a40,1.4,15),s=Math.sin(t.rotation.y),c=Math.cos(t.rotation.y);L.position.set(t.position.x+s*.7,t.position.y+2.6,t.position.z+c*.7);(q.pyG0||t.parent).add(L)}return t}
/* the undercroft's own group: shown only while you are down there (q.deep 2). Lights never go in it: hiding a light
   changes the number of lights, and three.js would then rebuild every material's shader */
function pywUGroup(q,g0){const UG=new THREE.Group();UG.name='pyUnder';g0.add(UG);q.pyG0=g0;UG.visible=q.deep===2;q.anims.push(()=>{UG.visible=q.deep===2});return UG}
function pywUTorch(q,g,x,y,z,ry,lit,wo){const t=pywNS(()=>pyTorch(g,x,z,ry,wo));t.position.y=y;return pywUGlow(q,t,x,z,lit)}
/* the long entrance hall in the portal passage: painted panels, starry ceiling, four torches (the -z one at X+37.5 is lit) */
function pywPass(q,g){const R=pywNS(()=>pyPassage(g));for(const t of R.torches)pywUGlow(q,t,t.position.x,t.position.z,t===R.lit)}
/* batch 1, the outside: the obstacles go into the game's q.obs, the map keeps the game's two squares plus the avenue and the dig camp */
function pywOut(q,g,ob,rect){const{X,Z,B,H}=PYRV,R=pywNS(()=>[pyShell(g),pyGateway(g),pyAvenue(g),pyDigCamp(g),pyRuins(g)]);
 for(const r of R)for(const o of r.obs||[])ob(o.x0,o.x1,o.z0,o.z1);for(const f of R[1].flames)pywFl(q,f);
 rect(X-B,X+B,Z-B,Z+B,'#c8a060');rect(X-6,X+6,Z-6,Z+6,'#e0c080');for(const r of[R[2],R[3]])for(const m of r.map||[])rect(m[0],m[1],m[2],m[3],m[4]);
 /* the capstone's glow, as before */const gl=glowSp(0xffd060,.55,9);gl.position.set(X,H-1.2,Z);g.add(gl)}
/* batch 2-3: the entrance hall (two unlit torches with glows), the antechamber, the clue rooms' things */
function pywIn(q,g,ob){const R=pywNS(()=>({e:pyEntrance(g),a:pyAntechamber(g),c:pyClueRooms(g)}));
 for(const t of R.e.torches){pywFl(q,t.userData.flame);const gp=t.userData.glow,fl=glowSp(0xff9030,.85,1.1),x=t.position.x;fl.position.set(gp[0],gp[1],gp[2]);t.add(fl);q.anims.push(dt=>{fl.scale.setScalar(.9+Math.sin(q.rt*15+x)*.12)})}
 for(const r of[R.a,R.c])for(const o of r.obs)ob(o.x0,o.x1,o.z0,o.z1)}
/* batch 4: the treasure chamber's dressing */
function pywTreasure(g,ob){const R=pywNS(()=>pyTreasureRoom(g));for(const o of R.obs)ob(o.x0,o.x1,o.z0,o.z1)}
