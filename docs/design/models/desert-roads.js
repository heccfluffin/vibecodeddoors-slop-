/* =====================================================================================================
   desert-roads.js (desert-roads.md part 2): the one road look. Needs fort-kit.js.
   Desert-local coordinates, flat ground at y 0, +z north, right-hand traffic.
   Note on sides: in three.js a driver facing (dx, dz) has their RIGHT hand towards (-dz, dx) (right = forward x up).
   Kinds (DRK): h = highway 8 m (edge lines, yellow centre dash, 1.2 m gravel shoulders, reflector posts),
                t = town road 7 m (edge lines, dash, 0.8 m shoulders), d = dirt track 5 m (ruts, ragged edges).
   Batch 1: the pieces.
   drArc(cx,cz,r,a0,a1,n)        points on an arc (angles from +x towards +z), for curves in a centre line.
   drPiece(g,pts,kind,o)         a road piece along a centre line [[x,z],...] between two junctions (or a road end).
                                 o.noPosts: no reflector posts; o.noDash: no centre dash. Returns the piece's group.
   drJunction(g,x,z,arms,o)      an asphalt T or crossroads. arms: {E:{k,minor},N:{...},W,S} (absent = no road that way).
                                 Builds the patch with rounded kerb corners (o.r, 9 m), its edge lines, stop lines and
                                 STOP signs on minor arms. Returns {g, ends:{E:dist,...}}: each road piece must start
                                 that far from (x,z) along its arm.
   drMouth(g,x,z,dir,hMain,o)    where a dirt track leaves an asphalt road: a gravel mouth with 4 m rounded corners
                                 from the road's edge (hMain = the asphalt road's half width) out to drMouth.len.
                                 The asphalt road runs straight past (its edge line too); the track piece starts at the
                                 returned distance from the road's centre line.
   Heights: everything at y .06 (asphalt and dirt), shoulders .056, mouths .058; lines on top with polygonOffsetUnits
   only. Every mesh is noSeam. Pieces are cut every ~100 m so the batching can keep them with their scenery cells.
   ===================================================================================================== */
const DRK={h:{w:8,sh:1.2,lines:1,dash:1,posts:1},t:{w:7,sh:.8,lines:1,dash:1,posts:0},d:{w:5,sh:0,lines:0,dash:0,posts:0,dirt:1}};
const DRY=.06;
function drKit(){if(drKit.k)return drKit.k;const f=fbKit(),k=Object.create(f);drKit.k=k;const tex=f.tex;
 let sd=97531;const r=()=>((sd=Math.imul(sd^sd>>>15,sd|1)+0x6d2b79f5|0)>>>0)/4294967296;k.r=r;
 const std=(o)=>{const m=new THREE.MeshStandardMaterial(Object.assign({roughness:.95,metalness:0},o));m.userData.gd=1;return m};
 /* asphalt: dark, speckled, a little worn where the wheels run. Tiles 4 m */
 const asT=tex(256,256,(x,w,h)=>{x.fillStyle='#3e3c3a';x.fillRect(0,0,w,h);for(let i=0;i<9000;i++){const v=40+r()*70|0;x.fillStyle='rgba('+v+','+(v-2)+','+(v-5)+','+(.15+r()*.35)+')';x.fillRect(r()*w,r()*h,1+r()*1.5,1+r()*1.5)}
  for(let i=0;i<14;i++){x.fillStyle='rgba(20,18,16,'+(.05+r()*.08)+')';x.beginPath();x.ellipse(r()*w,r()*h,8+r()*30,4+r()*14,r()*3,0,7);x.fill()}
  for(let i=0;i<5;i++){x.strokeStyle='rgba(24,22,20,.5)';x.lineWidth=1;x.beginPath();let px=r()*w,py=r()*h;x.moveTo(px,py);for(let j=0;j<6;j++){px+=(r()-.5)*30;py+=(r()-.5)*30;x.lineTo(px,py)}x.stroke()}});
 k.ASPH=std({map:asT});k.ASPH.userData.tile=4;
 /* dirt track: packed sand, two darker ruts, ragged edges (cut out). u runs across the track */
 const dtT=tex(256,256,(x,w,h)=>{x.clearRect(0,0,w,h);const g=x.createLinearGradient(0,0,w,0);g.addColorStop(0,'#8a6a46');g.addColorStop(.5,'#9e7c54');g.addColorStop(1,'#8a6a46');x.fillStyle=g;x.fillRect(0,0,w,h);
  for(const c of[.27,.73]){const gr=x.createLinearGradient((c-.09)*w,0,(c+.09)*w,0);gr.addColorStop(0,'rgba(90,66,40,0)');gr.addColorStop(.5,'rgba(70,48,28,.6)');gr.addColorStop(1,'rgba(90,66,40,0)');x.fillStyle=gr;x.fillRect((c-.09)*w,0,.18*w,h)}
  for(let i=0;i<5000;i++){const v=100+r()*90|0;x.fillStyle='rgba('+v+','+(v-24|0)+','+(v-56|0)+','+(r()*.45)+')';x.fillRect(r()*w,r()*h,1+r()*2,1+r()*2)}
  /* ragged edges: bite holes out of both sides */x.globalCompositeOperation='destination-out';for(const side of[0,1])for(let y=0;y<h;y+=3){const d=4+Math.abs(Math.sin(y*.09)*7+Math.sin(y*.23+1)*5)+r()*5;x.fillRect(side?w-d:0,y,d,3)}x.globalCompositeOperation='source-over'});
 k.DIRT=std({map:dtT,alphaTest:.5});k.DIRT.userData.tile=6;
 /* gravel shoulder: grey-beige stones, its outer side ragged (cut out). u = 0 at the road edge */
 const shT=tex(128,256,(x,w,h)=>{x.clearRect(0,0,w,h);x.fillStyle='#9c8a6c';x.fillRect(0,0,w,h);for(let i=0;i<2500;i++){const v=110+r()*100|0;x.fillStyle='rgba('+v+','+(v-8)+','+(v-24)+','+(.3+r()*.5)+')';x.beginPath();x.arc(r()*w,r()*h,.6+r()*1.6,0,7);x.fill()}
  x.globalCompositeOperation='destination-out';for(let y=0;y<h;y+=2){const d=10+Math.abs(Math.sin(y*.07)*16+Math.sin(y*.19+2)*10)+r()*10;x.fillRect(w-d,y,d,2)}x.globalCompositeOperation='source-over'});
 k.SHLD=std({map:shT,alphaTest:.5});k.SHLD.userData.tile=5;
 /* gravel for the dirt track mouths (world-aligned) */
 const gvT=tex(128,128,(x,w,h)=>{x.fillStyle='#8e7f66';x.fillRect(0,0,w,h);for(let i=0;i<1600;i++){const v=90+r()*110|0;x.fillStyle='rgba('+v+','+(v-10)+','+(v-30)+','+(.3+r()*.5)+')';x.beginPath();x.arc(r()*w,r()*h,.6+r()*1.4,0,7);x.fill()}});
 k.GRAV=std({map:gvT,polygonOffset:true,polygonOffsetUnits:-2});k.GRAV.userData.tile=3;
 const PO={polygonOffset:true,polygonOffsetFactor:0,polygonOffsetUnits:-6};
 k.WHITE=std(Object.assign({color:0xe8e4da,roughness:.7},PO));k.YELLOW=std(Object.assign({color:0xe0b420,roughness:.7},PO));
 k.POST=std({color:0xf0eee8,roughness:.6});k.RED=std({color:0xd02010,emissive:0x400804,roughness:.3});k.AMBR=std({color:0xf0a020,emissive:0x402a04,roughness:.3});k.STEEL=std({color:0x8a8e92,metalness:.6,roughness:.4});
 return k}

/* points on an arc around (cx,cz), radius r, from angle a0 to a1 (radians, from +x towards +z) */
function drArc(cx,cz,r,a0,a1,n){n=n||Math.max(4,Math.ceil(Math.abs(a1-a0)*r/3));const p=[];for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;p.push([cx+r*Math.cos(a),cz+r*Math.sin(a)])}return p}

/* the frames along a centre line: position, unit tangent, side normal (n = (-tz, tx): the RIGHT-hand side of the direction of travel in three.js, since right = forward x up) and distance */
function drFrames(pts){const F=[];let s=0;for(let i=0;i<pts.length;i++){if(i)s+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);
  const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)];let tx=b[0]-a[0],tz=b[1]-a[1];const L=Math.hypot(tx,tz)||1;tx/=L;tz/=L;
  /* at a bend, widen the offset so the edges stay parallel */let m=1;if(i>0&&i<pts.length-1){const ux=pts[i][0]-pts[i-1][0],uz=pts[i][1]-pts[i-1][1],ul=Math.hypot(ux,uz)||1;const c=(ux*tx+uz*tz)/ul;m=1/Math.max(.5,c)}
  F.push({x:pts[i][0],z:pts[i][1],tx,tz,nx:-tz*m,nz:tx*m,s})}return F}
/* a strip along a centre line between two side offsets o0..o1 (metres, + = right of the direction the points run), at height y; u runs across (0 at o0), v along */
function drStrip(pts,o0,o1,y,m,tile,F){if(!F){pts=pts.filter((p,i)=>!i||Math.hypot(p[0]-pts[i-1][0],p[1]-pts[i-1][1])>.01);F=drFrames(pts)}const P=[],N=[],U=[],I=[],T=tile||(m.userData&&m.userData.tile)||4;
 F.forEach((f,i)=>{for(const[o,u]of[[o0,0],[o1,1]]){P.push(f.x+f.nx*o,y,f.z+f.nz*o);N.push(0,1,0);U.push(u*(m===drKit().ASPH?Math.abs(o1-o0)/T:1),f.s/T)}if(i){const a=(i-1)*2;I.push(a,a+2,a+1,a+1,a+2,a+3)}});
 const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(P,3));ge.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));ge.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));ge.setIndex(I);
 /* face up whatever the direction */{const p=ge.attributes.position;if(p.count>=3){const ax=p.getX(1)-p.getX(0),az=p.getZ(1)-p.getZ(0),bx=p.getX(2)-p.getX(0),bz=p.getZ(2)-p.getZ(0);if(az*bx-ax*bz>0){for(let i=0;i<I.length;i+=3){const t=I[i+1];I[i+1]=I[i+2];I[i+2]=t}ge.setIndex(I)}}}
 const o=new THREE.Mesh(ge,m);o.userData.noSeam=true;return o}
/* the same frames cut into pieces of about len metres */
function drCut(pts,len){const out=[];let cur=[pts[0]],s=0;for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],d=Math.hypot(b[0]-a[0],b[1]-a[1]);
  if(s+d>len&&i<pts.length-1){cur.push(b);out.push(cur);cur=[b];s=0}else{cur.push(b);s+=d}}if(cur.length>1)out.push(cur);return out}
/* split long straight runs so every piece has points at least every 25 m (the cuts and the dashes need them) */
function drDense(pts,st){st=st||25;const o=[pts[0]];for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],d=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(d/st);for(let j=1;j<=n;j++)o.push([a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n])}return o}

/* ---------------------------------------- a road piece ---------------------------------------- */
function drPiece(g,pts,kind,o){o=o||{};const k=drKit(),K=DRK[kind],h=K.w/2,G=new THREE.Group();G.userData.road=kind;g.add(G);
 /* frames for the whole road first, so pieces share their joins exactly and the dashes keep one rhythm */
 const D=drDense(pts),FA=drFrames(D),parts=[];{let i0=0;for(let i=1;i<D.length;i++)if((FA[i].s-FA[i0].s>=100&&i<D.length-2)||i==D.length-1){parts.push([i0,i]);i0=i}}
 for(const[i0,i1]of parts){const P=D.slice(i0,i1+1),F=FA.slice(i0,i1+1),Gp=new THREE.Group();G.add(Gp);
  Gp.add(drStrip(P,-h,h,DRY,K.dirt?k.DIRT:k.ASPH,null,F));
  if(K.sh){Gp.add(drStrip(P,h-.05,h+K.sh,DRY-.004,k.SHLD,null,F));Gp.add(drStrip(P,-h+.05,-h-K.sh,DRY-.004,k.SHLD,null,F))}
  if(K.lines){for(const sd of[1,-1])Gp.add(drStrip(P,sd*(h-.38),sd*(h-.23),DRY,k.WHITE,1,F))}
  if(K.dash&&!o.noDash){/* yellow dashes, 3 m on and 9 m off, measured along the whole road so pieces line up */const L=[];const S0=F[0].s,S1=F[F.length-1].s,base=o.s0||0;
   for(let s=Math.ceil((S0+base)/12)*12-base;s<S1;s+=12){const a=Math.max(S0,s),b=Math.min(S1,s+3);if(b-a<.5)continue;const sub=drSub(F,a,b);if(sub.length>1)L.push(drStrip(sub,-.07,.07,DRY,k.YELLOW,1))}L.forEach(m=>Gp.add(m))}
  if(K.posts&&!o.noPosts){/* reflector posts every 50 m, both sides, staggered: red on the right of your lane, amber on the left */const S0=F[0].s,S1=F[F.length-1].s,base=o.s0||0;
   for(let s=Math.ceil((S0+base)/25)*25-base;s<S1;s+=25){const f=drAt(F,s),side=(Math.round((s+base)/25)%2)?1:-1,/* red faces traffic on its right-hand side */x=f.x+f.nx/Math.hypot(f.nx,f.nz)*side*(h+K.sh+.6),z=f.z+f.nz/Math.hypot(f.nx,f.nz)*side*(h+K.sh+.6);
    const p=new THREE.Mesh(new THREE.BoxGeometry(.1,1,.1),k.POST);p.position.set(x,.5,z);p.rotation.y=Math.atan2(f.tx,f.tz);Gp.add(p);
    for(const sg of[1,-1]){const rf=new THREE.Mesh(new THREE.BoxGeometry(.06,.14,.012),sg*side>0?k.RED:k.AMBR);rf.position.set(x+f.tx*sg*.056,.85,z+f.tz*sg*.056);rf.rotation.y=Math.atan2(f.tx,f.tz);Gp.add(rf)}}}}
 G.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return G}
/* the point at distance s along frames F, and the sub-line between two distances */
function drAt(F,s){for(let i=1;i<F.length;i++)if(F[i].s>=s||i==F.length-1){const a=F[i-1],b=F[i],t=Math.max(0,Math.min(1,(s-a.s)/((b.s-a.s)||1)));return{x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,tx:b.tx,tz:b.tz,nx:a.nx+(b.nx-a.nx)*t,nz:a.nz+(b.nz-a.nz)*t,s}}return F[0]}
function drSub(F,a,b){const o=[];const A=drAt(F,a);o.push([A.x,A.z]);for(const f of F)if(f.s>a&&f.s<b)o.push([f.x,f.z]);const B=drAt(F,b);o.push([B.x,B.z]);return o}

/* ---------------------------------------- junctions ---------------------------------------- */
const DRDIR={E:[1,0],N:[0,1],W:[-1,0],S:[0,-1]},DRCCW=['E','N','W','S'];
function drJunction(g,x,z,arms,o){o=o||{};const k=drKit(),r=o.r||9,G=new THREE.Group();g.add(G);
 /* arms[d].off: a side road that joins a few metres off the junction's centre (z shift for E/W arms, x shift for N/S),
    for staggered side roads like the drive-in across from Motel Rd */
 const hw=d=>arms[d]?DRK[arms[d].k].w/2:0,bo=d=>!arms[d]||!arms[d].off?0:(d=='E'||d=='S')?arms[d].off:-arms[d].off,Pp=d=>bo(d)+hw(d),Mm=d=>bo(d)-hw(d),
  perp=d=>{const i=DRCCW.indexOf(d);let m=0;for(const q of[DRCCW[(i+1)%4],DRCCW[(i+3)%4]])if(arms[q])m=Math.max(m,Math.abs(bo(q))+hw(q));return m};
 const ends={};for(const d of DRCCW)if(arms[d])ends[d]=perp(d)+r+1.5;
 /* a point in arm d's frame: a out along the arm, b to the right when looking out along it (so traffic coming IN keeps to b < bo(d)) */
 const pt=(d,a,b)=>{const[ux,uz]=DRDIR[d];return[x+ux*a-uz*b,z+uz*a+ux*b]};
 const present=DRCCW.filter(d=>arms[d]),out=[],lines=[],edges=[],corners=[];
 present.forEach((d,i)=>{const e=present[(i+1)%present.length],di=DRCCW.indexOf(d),ei=DRCCW.indexOf(e),turn=(ei-di+4)%4,shw=Math.max(DRK[arms[d].k].sh,DRK[arms[e].k].sh);
  out.push(pt(d,ends[d],Mm(d)),pt(d,ends[d],Pp(d)));
  if(turn==1){/* a rounded kerb corner between d's outer edge and e's */const A=-Mm(e)+r,Bv=Pp(d)+r,cA=pt(d,A,Bv),s0=pt(d,A,Pp(d)),s1=pt(e,Bv,Mm(e)),a0=Math.atan2(s0[1]-cA[1],s0[0]-cA[0]),a1=Math.atan2(s1[1]-cA[1],s1[0]-cA[0]);
   let da=a1-a0;while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;const arc=drArc(cA[0],cA[1],r,a0,a0+da,10);out.push(...arc);corners.push(cA);
   edges.push({p:[pt(d,ends[d],Pp(d)),s0,...arc.slice(1,-1),s1,pt(e,ends[e],Mm(e))],sh:shw});
   lines.push([pt(d,ends[d],Pp(d)-.3),pt(d,A,Pp(d)-.3),...drArc(cA[0],cA[1],r+.3,a0,a0+da,10),pt(e,Bv,Mm(e)+.3),pt(e,ends[e],Mm(e)+.3)])}
  else if(turn==2){/* straight across (the side with no road): the through road's edge line carries on */lines.push([pt(d,ends[d],Pp(d)-.3),pt(e,ends[e],Mm(e)+.3)]);edges.push({p:[pt(d,ends[d],Pp(d)),pt(e,ends[e],Mm(e))],sh:shw})}});
 /* the patch (one shape, world-aligned asphalt) */
 {const sh=new THREE.Shape(out.map(p=>new THREE.Vector2(p[0],-p[1])));const ge=new THREE.ShapeGeometry(sh);ge.rotateX(-Math.PI/2);const uv=ge.attributes.uv,p=ge.attributes.position;for(let i=0;i<uv.count;i++)uv.setXY(i,p.getX(i)/4,-p.getZ(i)/4);
  const m=new THREE.Mesh(ge,k.ASPH);m.position.y=DRY;m.userData.noSeam=true;G.add(m)}
 /* edge lines: drawn as strips centred on each line */for(const L of lines)G.add(drStrip(L,-.075,.075,DRY,k.WHITE,1));
 /* the gravel shoulder round every kerb edge, like along the roads: find which side of each edge is away from the junction */
 for(const E of edges){if(!E.sh)continue;const P=E.p.filter((p,i)=>!i||Math.hypot(p[0]-E.p[i-1][0],p[1]-E.p[i-1][1])>.01),F=drFrames(P),m=F[Math.floor(F.length/2)],nl=Math.hypot(m.nx,m.nz)||1;
  const sg=Math.hypot(m.x+m.nx/nl-x,m.z+m.nz/nl-z)>Math.hypot(m.x-x,m.z-z)?1:-1;G.add(drStrip(P,-sg*.05,sg*E.sh,DRY-.004,k.SHLD,null,F))}
 /* minor arms: a stop line across the lane coming in, and a STOP sign on its right */
 for(const d of present){if(!arms[d].minor)continue;const a=perp(d)+r*.35+1;const L=[pt(d,a,bo(d)-.15),pt(d,a,Mm(d)+.3)];G.add(drStrip(L,-.2,.2,DRY,k.WHITE,1));
  const sp=pt(d,a+1.2,Mm(d)-1.3);G.add(drStopSign(sp[0],sp[1],Math.atan2(DRDIR[d][0],DRDIR[d][1])))}
 /* where a street-name sign can stand: the first kerb corner, 2.6 m back from the asphalt */
 let nameAt=null;if(corners.length){const c=corners[0],dx=x-c[0],dz=z-c[1],L=Math.hypot(dx,dz);nameAt=[c[0]+dx/L*(r-2.6),c[1]+dz/L*(r-2.6)]}
 G.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});
 return{g:G,ends,nameAt,anchor:d=>pt(d,0,bo(d)),start:d=>pt(d,ends[d],bo(d))}}
/* a STOP sign facing along (sin ry, cos ry): post, red octagon with a white rim, the word */
function drStopSign(x,z,ry){const k=drKit(),G=new THREE.Group();G.position.set(x,0,z);G.rotation.y=ry;
 const p=new THREE.Mesh(new THREE.BoxGeometry(.07,2.3,.07),k.STEEL);p.position.y=1.15;G.add(p);
 const c=document.createElement('canvas');c.width=c.height=128;const t=c.getContext('2d'),oct=(R)=>{t.beginPath();for(let i=0;i<8;i++){const a=Math.PI/8+i*Math.PI/4;t.lineTo(64+Math.cos(a)*R,64+Math.sin(a)*R)}t.closePath()};
 oct(62);t.fillStyle='#f4f2ec';t.fill();oct(56);t.fillStyle='#c41a12';t.fill();t.fillStyle='#f4f2ec';t.font='bold 34px '+(k.FONT||'Arial');t.textAlign='center';t.textBaseline='middle';t.fillText('STOP',64,66);
 const tx=new THREE.CanvasTexture(c);tx.anisotropy=4;const face=new THREE.Mesh(new THREE.CircleGeometry(.38,8,Math.PI/8),new THREE.MeshStandardMaterial({map:tx,roughness:.5}));face.position.set(0,2.05,.045);G.add(face);
 const back=new THREE.Mesh(new THREE.CircleGeometry(.38,8,Math.PI/8),k.STEEL);back.rotation.y=Math.PI;back.position.set(0,2.05,.04);G.add(back);
 G.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return G}

/* ---------------------------------------- dirt track mouths ---------------------------------------- */
/* (x,z) = where the track's centre line meets the asphalt road's centre line; dir = which way the track leaves (E,N,W,S) */
function drMouth(g,x,z,dir,hMain,o){o=o||{};const k=drKit(),r=o.r||4,h=DRK.d.w/2,L=hMain+r+2,G=new THREE.Group();g.add(G);
 const[ux,uz]=DRDIR[dir],pt=(a,b)=>[x+ux*a-uz*b,z+uz*a+ux*b];
 /* the outline: along the road edge, round the two corners, out to the track */
 const cR=pt(hMain+r,-h-r),cL=pt(hMain+r,h+r),ang=(c,p)=>Math.atan2(p[1]-c[1],p[0]-c[0]);
 const P=[pt(hMain-.2,-h-r)];{const s=ang(cR,pt(hMain,-h-r)),e=ang(cR,pt(hMain+r,-h));let d=e-s;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;P.push(...drArc(cR[0],cR[1],r,s,s+d,8))}
 P.push(pt(L,-h),pt(L,h));{const s=ang(cL,pt(hMain+r,h)),e=ang(cL,pt(hMain,h+r));let d=e-s;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;P.push(...drArc(cL[0],cL[1],r,s,s+d,8))}P.push(pt(hMain-.2,h+r));
 const sh=new THREE.Shape(P.map(p=>new THREE.Vector2(p[0],-p[1])));const ge=new THREE.ShapeGeometry(sh);ge.rotateX(-Math.PI/2);const uv=ge.attributes.uv,pp=ge.attributes.position;for(let i=0;i<uv.count;i++)uv.setXY(i,pp.getX(i)/3,-pp.getZ(i)/3);
 const m=new THREE.Mesh(ge,k.GRAV);m.position.y=DRY-.002;m.userData.noSeam=true;G.add(m);
 return{g:G,len:L}}

/* =====================================================================================================
   Batch 2: bridge ends, signs, the turning circle, and the whole network (DROADS + drNetwork).
   drBridgeEnd(g,x,zRim,dir)     where a highway meets a gorge bridge. zRim = the gorge rim (-1700 north, -1744 south),
                                 dir = +1 on the north side (the road runs off to +z), -1 on the south side. The road piece
                                 stops 5 m back; an approach slab slopes from the road (y .06) to the rim (y 0), a steel
                                 expansion joint at the rim, W-beam guard rails 18 m along both shoulders that line up with
                                 the bridge rails and turn down into the ground at their far ends, yellow-black end markers.
                                 Returns {obs:[{x0,x1,z0,z1}]} for the guard rails.
   drTurnCircle(g,x,z,R)         a round asphalt turning circle at a road's end (edge line and gravel round it).
   drNameSign(g,x,z,ry,a,b)      a street-name sign: two green blades on a post, road a along ry, road b across it.
   drLimitSign(g,x,z,ry,kmh)     a SPEED LIMIT sign facing along ry (towards the traffic it's for).
   drGuideSign(g,x,z,ry,rows)    a green direction board on two posts: rows [[arrow,'Place','1.2 km'],...].
   DROADS / drNetwork(g)         the approved layout (desert-roads.md part 1) as data, and its builder: junctions first,
                                 then the pieces trimmed to them, the dirt mouths, bridge ends, signs. Returns
                                 {J, obs}. Coordinates are desert-local (x, z).
   ===================================================================================================== */
/* a quad (4 corners: two at one end, two at the other) that always faces up */
function drQuadUp(P,m){const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(P,3));ge.setIndex([0,1,2,1,3,2]);ge.computeVertexNormals();if(ge.attributes.normal.getY(0)<0){ge.setIndex([0,2,1,1,2,3]);ge.computeVertexNormals()}const o=new THREE.Mesh(ge,m);o.userData.noSeam=true;return o}
function drBridgeEnd(g,x,zRim,dir){const k=drKit(),G=new THREE.Group();g.add(G);const W=4.6,L=5,obs=[];
 const CON=new THREE.MeshStandardMaterial({color:0x9a958c,roughness:.9});CON.userData.gd=1;const STL=k.STEEL;
 /* the approach slab: a sloped quad from the road's end down to the rim */
 {const zA=zRim+dir*L;G.add(drQuadUp([-W,DRY,zA, W,DRY,zA, -W,0,zRim, W,0,zRim].map((v,i)=>i%3==0?v+x:v),CON));
  /* its edge lines follow the slope */for(const sx of[-1,1]){const xa=x+sx*(4-.3);G.add(drQuadUp([xa-.075,DRY,zA, xa+.075,DRY,zA, xa-.075,0,zRim, xa+.075,0,zRim],k.WHITE))}}
 /* the expansion joint: a steel strip across the rim */
 {const j=new THREE.Mesh(new THREE.BoxGeometry(2*W,.03,.3),STL);j.position.set(x,.003,zRim+dir*.15);G.add(j);for(let i=-4;i<=4;i++){const t=new THREE.Mesh(new THREE.BoxGeometry(.04,.032,.26),k.POST);t.position.set(x+i*1.05,.004,zRim+dir*.15);G.add(t)}}
 /* guard rails: posts every 2 m, a W-beam on blocks, the far end turned down into the ground */
 for(const sx of[-1,1]){const rx=x+sx*4.45,L2=18,z0=zRim+dir*2,z1=zRim+dir*L2,LL=[],BB=[];
  for(let d=0;d<=L2-2;d+=2){const zz=zRim+dir*(2+d);LL.push([new THREE.BoxGeometry(.1,.78,.1),new THREE.Matrix4().makeTranslation(rx+sx*.16,.39,zz)]);LL.push([new THREE.BoxGeometry(.08,.16,.1),new THREE.Matrix4().makeTranslation(rx+sx*.07,.55,zz)])}
  const beam=new THREE.Mesh(new THREE.BoxGeometry(.05,.32,L2-6),STL);beam.position.set(rx,.55,zRim+dir*(2+(L2-6)/2));G.add(beam);
  const groove=new THREE.Mesh(new THREE.BoxGeometry(.056,.06,L2-6),k.M(0x6a6e72,{metalness:.6,roughness:.45}));groove.position.copy(beam.position);G.add(groove);
  /* the end: the beam sloping down to the ground over the last 4 m, flared out */{const zs=zRim+dir*(L2-4),ze=zRim+dir*(L2+.5),xe=rx+sx*.9,dx=xe-rx,dz=ze-zs,len=Math.hypot(dx,dz,.47),t=new THREE.Mesh(new THREE.BoxGeometry(.05,.32,len),STL);
   t.position.set((rx+xe)/2,(.55+.08)/2,(zs+ze)/2);t.lookAt(xe,.08,ze);G.add(t);const a=new THREE.Mesh(new THREE.BoxGeometry(.3,.12,.5),CON);a.position.set(xe,.04,ze);G.add(a)}
  G.add(k.merge?k.merge(LL,STL):(()=>{const gg=new THREE.Group();LL.forEach(([ge,mx])=>{const m=new THREE.Mesh(ge,STL);m.applyMatrix4(mx);gg.add(m)});return gg})());
  /* the yellow-black end marker at the bridge end of each rail, facing the traffic coming onto the bridge */
  {const mk=drMarker();mk.position.set(rx+sx*.55,0,zRim+dir*1.2);mk.rotation.y=dir>0?0:Math.PI;G.add(mk)}
  obs.push({x0:Math.min(rx-.05,rx+sx*.25),x1:Math.max(rx-.05,rx+sx*.25),z0:Math.min(z0,zRim+dir*(L2-4)),z1:Math.max(z0,zRim+dir*(L2-4))})}
 G.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{g:G,obs}}
/* a yellow board with black diagonal stripes on a post (an object marker) */
function drMarker(){const k=drKit(),G=new THREE.Group();if(!drKit.mk){const c=document.createElement('canvas');c.width=64;c.height=192;const x=c.getContext('2d');x.fillStyle='#f0c020';x.fillRect(0,0,64,192);x.fillStyle='#141414';for(let i=-4;i<10;i++){x.beginPath();x.moveTo(0,i*32);x.lineTo(64,i*32-48);x.lineTo(64,i*32-32);x.lineTo(0,i*32+16);x.closePath();x.fill()}const t=new THREE.CanvasTexture(c);drKit.mk=new THREE.MeshStandardMaterial({map:t,roughness:.5})}
 const p=new THREE.Mesh(new THREE.BoxGeometry(.06,1.1,.06),k.STEEL);p.position.y=.55;G.add(p);const b=new THREE.Mesh(new THREE.BoxGeometry(.3,.9,.025),[k.STEEL,k.STEEL,k.STEEL,k.STEEL,drKit.mk,drKit.mk]);b.position.set(0,1.45,0);G.add(b);return G}
function drTurnCircle(g,x,z,R){const k=drKit(),G=new THREE.Group();g.add(G);
 const d=new THREE.Mesh(new THREE.CircleGeometry(R,48),k.ASPH);d.rotation.x=-Math.PI/2;d.position.set(x,DRY,z);const uv=d.geometry.attributes.uv,p=d.geometry.attributes.position;for(let i=0;i<uv.count;i++)uv.setXY(i,(p.getX(i)+x)/4,(p.getY(i)-z)/4);G.add(d);
 const ring=[];for(let i=0;i<=48;i++){const a=i/48*Math.PI*2;ring.push([x+Math.cos(a)*R,z+Math.sin(a)*R])}
 G.add(drStrip(ring.map(([a,b])=>[x+(a-x)*(R-.3)/R,z+(b-z)*(R-.3)/R]),-.075,.075,DRY,k.WHITE,1));
 {const F=drFrames(ring),m=F[0],sg=Math.hypot(m.x+m.nx-x,m.z+m.nz-z)>R?1:-1;G.add(drStrip(ring,-sg*.05,sg*1.2,DRY-.004,k.SHLD,null,F))}
 G.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return G}

/* ---------------------------------------- signs ---------------------------------------- */
function drTxt(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.anisotropy=4;return t}
function drNameSign(g,x,z,ry,a,b){const k=drKit(),G=new THREE.Group();G.position.set(x,0,z);G.rotation.y=ry;g.add(G);
 const p=new THREE.Mesh(new THREE.BoxGeometry(.07,3.1,.07),k.STEEL);p.position.y=1.55;G.add(p);
 const blade=(name,y,rot)=>{const t=drTxt(256,48,(c,w,h)=>{c.fillStyle='#1d6a3c';c.fillRect(0,0,w,h);c.strokeStyle='#f2f0e8';c.lineWidth=3;c.strokeRect(4,4,w-8,h-8);c.fillStyle='#f2f0e8';c.font='bold 28px '+(k.FONT||'Arial');c.textAlign='center';c.textBaseline='middle';c.fillText(name.toUpperCase(),w/2,h/2+1)});
  const m=new THREE.MeshStandardMaterial({map:t,roughness:.5}),bg=new THREE.Mesh(new THREE.BoxGeometry(1.25,.23,.025),[k.STEEL,k.STEEL,k.STEEL,k.STEEL,m,m]);bg.position.y=y;bg.rotation.y=rot;G.add(bg)};
 blade(a,3.0,0);if(b)blade(b,2.74,Math.PI/2);G.add(new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.04,10),k.STEEL).translateY(3.13));
 G.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return G}
function drLimitSign(g,x,z,ry,kmh){const k=drKit(),G=new THREE.Group();G.position.set(x,0,z);G.rotation.y=ry;g.add(G);
 const p=new THREE.Mesh(new THREE.BoxGeometry(.07,2.2,.07),k.STEEL);p.position.y=1.1;G.add(p);
 const t=drTxt(128,160,(c,w,h)=>{c.fillStyle='#f4f2ec';c.fillRect(0,0,w,h);c.strokeStyle='#141414';c.lineWidth=5;c.strokeRect(7,7,w-14,h-14);c.fillStyle='#141414';c.textAlign='center';c.font='bold 20px '+(k.FONT||'Arial');c.fillText('SPEED',w/2,36);c.fillText('LIMIT',w/2,58);c.font='bold 58px '+(k.FONT||'Arial');c.fillText(String(kmh),w/2,116);c.font='bold 16px '+(k.FONT||'Arial');c.fillText('km/h',w/2,140)});
 const m=new THREE.MeshStandardMaterial({map:t,roughness:.5}),b=new THREE.Mesh(new THREE.BoxGeometry(.6,.75,.025),[k.STEEL,k.STEEL,k.STEEL,k.STEEL,m,k.STEEL]);b.position.set(0,2.1,.05);G.add(b);
 G.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return G}
function drGuideSign(g,x,z,ry,rows){const k=drKit(),G=new THREE.Group();G.position.set(x,0,z);G.rotation.y=ry;g.add(G);const H=.32+rows.length*.42,W=3.2,y0=2.2;
 for(const sx of[-1.1,1.1]){const p=new THREE.Mesh(new THREE.BoxGeometry(.1,y0+H,.1),k.STEEL);p.position.set(sx,(y0+H)/2,-.06);G.add(p)}
 const t=drTxt(512,Math.round(512*H/W),(c,w,h)=>{c.fillStyle='#1d6a3c';c.fillRect(0,0,w,h);c.strokeStyle='#f2f0e8';c.lineWidth=5;c.strokeRect(8,8,w-16,h-16);c.fillStyle='#f2f0e8';c.textBaseline='middle';const rh=(h-24)/rows.length;
  rows.forEach(([ar,name,dist],i)=>{const y=12+rh*(i+.5);c.font='bold 40px '+(k.FONT||'Arial');c.textAlign='left';c.fillText(ar,26,y);c.font='bold 34px '+(k.FONT||'Arial');c.fillText(name,84,y);c.textAlign='right';c.font='30px '+(k.FONT||'Arial');c.fillText(dist||'',w-26,y)})});
 const m=new THREE.MeshStandardMaterial({map:t,roughness:.5}),b=new THREE.Mesh(new THREE.BoxGeometry(W,H,.04),[k.STEEL,k.STEEL,k.STEEL,k.STEEL,m,k.STEEL]);b.position.set(0,y0+H/2,0);G.add(b);
 G.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return G}

/* ---------------------------------------- the network ---------------------------------------- */
const DRH={k:'h'},DRT={k:'t'};
const DROADS={
 /* junctions: [x, z, arms, the two names for the street sign] (minor = gives way; off = side road shifted along the main road) */
 J:{motel:[0,-922,{N:DRH,S:DRH,E:{k:'t',minor:1},W:{k:'t',minor:1,off:10}},['Route 13','Motel Rd']],
  pdrd:[0,-990,{N:DRH,S:DRH,E:{k:'t',minor:1}},['Route 13','Precinct Rd']],
  depot:[0,-1037,{N:DRH,S:DRH,E:{k:'h',minor:1},W:{k:'t',minor:1,off:-8}},['Route 13','Sunset Blvd']],
  fortlk:[205,-1037,{E:DRH,W:DRH,N:{k:'t',minor:1}},['Sunset Blvd','Fort Link']],
  airfd:[300,-1037,{E:DRH,W:DRH,S:{k:'t',minor:1}},['Sunset Blvd','Airfield Rd']],
  dunesun:[560,-1037,{N:DRH,S:DRH,W:{k:'h',minor:1}},['Dune Rd','Sunset Blvd']],
  pyr13:[0,-1120,{N:DRH,S:DRH,W:{k:'h',minor:1}},['Route 13','Pyramid Way']],
  pyrsp:[-175,-1120,{E:DRH,W:DRH,N:{k:'t',minor:1}},['Pyramid Way','Pyramid Spur']],
  coypyr:[-440,-1120,{N:DRH,S:DRH,E:{k:'h',minor:1}},['Coyote Rd','Pyramid Way']],
  coygul:[-440,-1420,{N:DRH,S:DRH,E:{k:'h',minor:1}},['Coyote Rd','Gulch Rd']],
  r13gul:[0,-1420,{N:DRH,S:DRH,E:{k:'h',minor:1},W:{k:'h',minor:1}},['Route 13','Gulch Rd']],
  dungul:[560,-1420,{N:DRH,S:DRH,W:{k:'h',minor:1}},['Dune Rd','Gulch Rd']],
  z51:[-440,-1870,{N:DRH,S:DRH,W:{k:'t',minor:1}},['Coyote Rd','Hangar Rd']],
  barr:[-540,-1870,{E:DRT,W:DRT,N:{k:'t',minor:1}},['Hangar Rd','Barracks Rd']],
  r13sp:[0,-1900,{E:DRH,W:DRH,N:{k:'h',minor:1}},['Southern Pass','Route 13']]},
 /* roads: [name, kind, centre line]. Ends that sit on a junction (or on a side road's shifted start) are trimmed to it */
 P:[['Route 13','h',[[0,200],[0,-922]]],['Route 13','h',[[0,-922],[0,-990]]],['Route 13','h',[[0,-990],[0,-1037]]],['Route 13','h',[[0,-1037],[0,-1120]]],['Route 13','h',[[0,-1120],[0,-1420]]],['Route 13','h',[[0,-1420],[0,-1695]]],['Route 13','h',[[0,-1749],[0,-1900]]],
  ['Motel Rd','t',[[0,-922],[56,-922]]],['Drive-in','t',[[0,-912],[-20,-912]]],['Depot Rd','t',[[0,-1045],[-62,-1045]]],
  ['Precinct Rd','t',[[0,-990],[80,-990],...drArc(80,-998,8,Math.PI/2,0,6).slice(1),[88,-1013.3]]],
  ['Sunset Blvd','h',[[0,-1037],[205,-1037]]],['Sunset Blvd','h',[[205,-1037],[300,-1037]]],['Sunset Blvd','h',[[300,-1037],[560,-1037]]],
  ['Fort Link','t',[[205,-1037],[205,-902],...drArc(222,-902,17,Math.PI,Math.PI/2,10).slice(1)]],
  ['Airfield Rd','t',[[300,-1037],[300,-1192]]],
  ['Dune Rd','h',[[560,-1004],[560,-1037]]],['Dune Rd','h',[[560,-1037],[560,-1420]]],['Dune Rd','h',[[560,-1420],[560,-1695]]],
  ['Southern Pass','h',[[560,-1749],[560,-1855],...drArc(515,-1855,45,0,-Math.PI/2,16).slice(1),[0,-1900]]],
  ['Southern Pass','h',[[0,-1900],[-425,-1900],...drArc(-425,-1885,15,-Math.PI/2,-Math.PI,8).slice(1),[-440,-1870]]],
  ['Coyote Rd','h',[[-440,-860],[-440,-1120]]],['Coyote Rd','h',[[-440,-1120],[-440,-1420]]],['Coyote Rd','h',[[-440,-1420],[-440,-1695]]],['Coyote Rd','h',[[-440,-1749],[-440,-1870]]],
  ['Pyramid Way','h',[[0,-1120],[-175,-1120]]],['Pyramid Way','h',[[-175,-1120],[-440,-1120]]],['Pyramid Spur','t',[[-175,-1120],[-175,-1078]]],
  ['Gulch Rd','h',[[-440,-1420],[0,-1420]]],['Gulch Rd','h',[[0,-1420],[560,-1420]]],
  ['Hangar Rd','t',[[-440,-1870],[-540,-1870]]],['Hangar Rd','t',[[-540,-1870],[-555,-1870]]],['Barracks Rd','t',[[-540,-1870],[-540,-1810]]],
  /* dirt tracks (each leaves its road through a gravel mouth, listed in M) */
  ['Solar Track','d',[[0,-1300],[-42,-1300]]],['Scrap Track','d',[[0,-1340],[62,-1340]]],['Mesa Track','d',[[0,-1550],[-222,-1550]]],['Quarry Station Track','d',[[0,-1622],[-130,-1622]]],
  ['Wind Farm Track','d',[[-440,-1265],[-480,-1265]]],['Mesa Station Track','d',[[-440,-1622],[-360,-1622]]],['Observatory Track','d',[[560,-1480],[592,-1480]]],
  ['Quarry Track','d',[[-138,-1420],[-138,-1452],...drArc(-160,-1452,22,0,-62*Math.PI/180,8).slice(1)]],['Lake Track','d',[[250,-1420],[250,-1498]]],
  ['Lake Station Track','d',[[320,-1420],[320,-1597],...drArc(295,-1597,25,0,-Math.PI/2,10).slice(1)]],['Main St','d',[[450,-1420],[450,-1628]]],['Speedway Track','d',[[300,-1900],[300,-1880]]]],
 /* gravel mouths: [x, z, which way the track leaves, the asphalt road's half width] */
 M:[[0,-1300,'W',4],[0,-1340,'E',4],[0,-1550,'W',4],[0,-1622,'W',4],[-440,-1265,'W',4],[-440,-1622,'E',4],[560,-1480,'E',4],[-138,-1420,'S',4],[250,-1420,'S',4],[320,-1420,'S',4],[450,-1420,'S',4],[300,-1900,'N',4]],
 /* gorge bridges (x) and their rims */
 B:[0,-440,560],RIM:[-1700,-1744],
 /* the airfield road's turning circle */
 TC:[[300,-1206,14]],
 /* speed limits: per kind, km/h */
 LIM:{h:90,t:50,d:40},
 /* direction boards before four big junctions: [x, z, which way the board faces (ry), rows]. A board stands on the
    right of the traffic it's for and faces it; arrows are as that driver sees them (in three.js a driver facing +z has +x on the LEFT) */
 GS:[[7.6,-1080,0,[['◀','Pyramid Way · Penitentiary','0.7 km'],['▲','Gulch Rd · Dusty Gulch','0.8 km']]],[-7.6,-1460,Math.PI,[['◀','Gulch Rd · Dusty Gulch','0.5 km'],['▶','Gulch Rd · Coyote Rd','0.4 km'],['▲','Devil\'s Gorge','0.3 km']]],
  [170,-1029.4,-Math.PI/2,[['▶','Fort Blackout','0.2 km'],['◀','Airfield','0.3 km']]],[552.4,-1080,Math.PI,[['▶','Sunset Blvd · Route 13','0.6 km'],['▲','Fort Blackout','0.1 km']]]]};
function drNetwork(g){const k=drKit(),D=DROADS,J={},obs=[];
 for(const id in D.J){const[x,z,arms,names]=D.J[id];J[id]=drJunction(g,x,z,arms);J[id].names=names;J[id].x=x;J[id].z=z;J[id].arms=arms}
 /* every point a road may start from: junction arms (with shifts) and gravel mouths */
 const anchors=[];for(const id in J)for(const d in J[id].arms)anchors.push({p:J[id].anchor(d),s:J[id].start(d)});
 for(const[x,z,dir,h]of D.M){const m=drMouth(g,x,z,dir,h),[ux,uz]=DRDIR[dir];anchors.push({p:[x,z],s:[x+ux*m.len,z+uz*m.len]})}
 /* several arms share a junction's centre: take the one pointing the way the road leaves */
 const trim=(P)=>{const dx=P[1][0]-P[0][0],dz=P[1][1]-P[0][1];let a=null,best=-1e9;for(const A of anchors){if(Math.hypot(A.p[0]-P[0][0],A.p[1]-P[0][1])>=.5)continue;const v=(A.s[0]-A.p[0])*dx+(A.s[1]-A.p[1])*dz;if(v>best){best=v;a=A}}if(!a)return P;const out=[a.s];const L=Math.hypot(a.s[0]-a.p[0],a.s[1]-a.p[1]);for(let i=1;i<P.length;i++)if(Math.hypot(P[i][0]-a.p[0],P[i][1]-a.p[1])>L+.5)out.push(P[i]);return out};
 const pieces=[];for(const[name,kind,pts]of D.P){let P=trim(pts);P=trim(P.slice().reverse()).reverse();if(P.length<2)continue;drPiece(g,P,kind);pieces.push({name,kind,P})}
 for(const bx of D.B){const a=drBridgeEnd(g,bx,D.RIM[0],1),b=drBridgeEnd(g,bx,D.RIM[1],-1);obs.push(...a.obs,...b.obs)}
 for(const[x,z,R]of D.TC)drTurnCircle(g,x,z,R);
 /* street-name signs at every junction's first corner, turned square to the roads */
 for(const id in J){const j=J[id];if(j.nameAt)drNameSign(g,j.nameAt[0],j.nameAt[1],0,j.names[0],j.names[1])}
 /* speed limits 40 m after each junction on the right, facing the traffic, on pieces longer than 150 m */
 for(const p of pieces){const F=drFrames(p.P),Lt=F[F.length-1].s;if(Lt<150||p.kind=='d')continue;const K=DRK[p.kind],off=K.w/2+K.sh+1.2;
  for(const[s,back]of[[40,0],[Lt-40,1]]){const f=drAt(F,s),nl=Math.hypot(f.nx,f.nz)||1,sd=back?-1:1,x=f.x+f.nx/nl*off*sd,z=f.z+f.nz/nl*off*sd,ux=back?-f.tx:f.tx,uz=back?-f.tz:f.tz;drLimitSign(g,x,z,Math.atan2(-ux,-uz),D.LIM[p.kind])}}
 for(const[x,z,ry,rows]of D.GS)drGuideSign(g,x,z,ry,rows);
 return{J,obs,pieces}}
