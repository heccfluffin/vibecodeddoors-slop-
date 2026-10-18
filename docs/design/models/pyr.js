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
/* draws one carved sign at (cx,cy), size r, with paths (no font needed): 0 ankh, 1 eye, 2 sun, 3 water, 4 bird, 5 scarab */
function pyGlyph(x,t,cx,cy,r){x.save();x.translate(cx,cy);x.lineWidth=Math.max(2,r*.16);x.lineCap='round';x.beginPath();
 if(t==0){x.ellipse(0,-r*.55,r*.3,r*.38,0,0,7);x.moveTo(-r*.6,-r*.1);x.lineTo(r*.6,-r*.1);x.moveTo(0,-r*.17);x.lineTo(0,r)}
 else if(t==1){x.moveTo(-r*.8,0);x.quadraticCurveTo(0,-r*.7,r*.8,0);x.quadraticCurveTo(0,r*.5,-r*.8,0);x.moveTo(r*.15,0);x.arc(0,0,r*.15,0,7);x.moveTo(-r*.8,-r*.45);x.quadraticCurveTo(0,-r*.95,r*.85,-r*.35);x.moveTo(-r*.1,r*.3);x.lineTo(-r*.3,r*.9);x.quadraticCurveTo(-r*.5,r*1.0,-r*.6,r*.8)}
 else if(t==2){x.arc(0,0,r*.6,0,7);x.moveTo(r*.15,0);x.arc(0,0,r*.15,0,7)}
 else if(t==3){for(let j=-1;j<=1;j++){x.moveTo(-r*.8,j*r*.4);for(let i=0;i<4;i++)x.lineTo(-r*.8+(i+.5)*r*.4,j*r*.4+(i%2?r*.15:-r*.15)),x.lineTo(-r*.8+(i+1)*r*.4,j*r*.4)}}
 else if(t==4){x.ellipse(0,0,r*.45,r*.3,-.3,0,7);x.moveTo(r*.3,-r*.25);x.arc(r*.4,-r*.45,r*.18,0,7);x.moveTo(r*.58,-r*.45);x.lineTo(r*.8,-r*.4);x.moveTo(-r*.4,r*.1);x.lineTo(-r*.85,r*.35);x.moveTo(-r*.1,r*.3);x.lineTo(-r*.15,r*.85);x.moveTo(r*.1,r*.3);x.lineTo(r*.15,r*.85)}
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
 a(new THREE.BoxGeometry(1.1,.75,1.5),PL,0,.375,0);a(new THREE.BoxGeometry(1.2,.1,1.6),PL,0,.8,0);
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
