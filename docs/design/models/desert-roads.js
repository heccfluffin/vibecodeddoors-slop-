/* =====================================================================================================
   desert-roads.js (desert-roads.md part 2): the one road look. Needs fort-kit.js.
   Desert-local coordinates, flat ground at y 0, +z north, right-hand traffic.
   Note on sides: in three.js a driver facing (dx, dz) has their RIGHT hand towards (-dz, dx) (right = forward x up).
   Kinds (DRK): h = highway 8 m (edge lines, yellow centre dash, 1.2 m gravel shoulders, reflector posts),
                t = town road 7 m (edge lines, dash), d = dirt track 5 m (ruts, ragged edges).
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
const DRK={h:{w:8,sh:1.2,lines:1,dash:1,posts:1},t:{w:7,sh:0,lines:1,dash:1,posts:0},d:{w:5,sh:0,lines:0,dash:0,posts:0,dirt:1}};
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
 const hw=d=>arms[d]?DRK[arms[d].k].w/2:0,perp=d=>{const i=DRCCW.indexOf(d);return Math.max(hw(DRCCW[(i+1)%4]),hw(DRCCW[(i+3)%4]))};
 const ends={};for(const d of DRCCW)if(arms[d])ends[d]=perp(d)+r+1.5;
 /* a point in arm d's frame: a out along the arm, b to the right when looking out along it (so traffic coming IN keeps to b < 0) */
 const pt=(d,a,b)=>{const[ux,uz]=DRDIR[d];return[x+ux*a-uz*b,z+uz*a+ux*b]};
 const present=DRCCW.filter(d=>arms[d]),out=[],lines=[];
 present.forEach((d,i)=>{const e=present[(i+1)%present.length],di=DRCCW.indexOf(d),ei=DRCCW.indexOf(e),turn=(ei-di+4)%4;
  out.push(pt(d,ends[d],-hw(d)),pt(d,ends[d],hw(d)));
  if(turn==1){/* a rounded kerb corner between d's left edge and e's right edge */const cA=pt(d,hw(e)+r,hw(d)+r),a0=Math.atan2(pt(d,hw(e)+r,hw(d))[1]-cA[1],pt(d,hw(e)+r,hw(d))[0]-cA[0]),a1=Math.atan2(pt(e,hw(d)+r,-hw(e))[1]-cA[1],pt(e,hw(d)+r,-hw(e))[0]-cA[0]);
   let da=a1-a0;while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;const arc=drArc(cA[0],cA[1],r,a0,a0+da,10);out.push(...arc);
   /* the edge line: along d's stub, round the corner, out along e's stub */const L=[pt(d,ends[d],hw(d)-.3),pt(d,hw(e)+r,hw(d)-.3),...drArc(cA[0],cA[1],r+.3,a0,a0+da,10),pt(e,hw(d)+r,-hw(e)+.3),pt(e,ends[e],-hw(e)+.3)];lines.push(L)}
  else if(turn==2){/* straight across (the side with no road): the through road's edge line carries on */lines.push([pt(d,ends[d],hw(d)-.3),pt(e,ends[e],-hw(e)+.3)])}});
 /* the patch (one shape, world-aligned asphalt) */
 {const sh=new THREE.Shape(out.map(p=>new THREE.Vector2(p[0],-p[1])));const ge=new THREE.ShapeGeometry(sh);ge.rotateX(-Math.PI/2);const uv=ge.attributes.uv,p=ge.attributes.position;for(let i=0;i<uv.count;i++)uv.setXY(i,p.getX(i)/4,-p.getZ(i)/4);
  const m=new THREE.Mesh(ge,k.ASPH);m.position.y=DRY;m.userData.noSeam=true;G.add(m)}
 /* edge lines: drawn as strips centred on each line */for(const L of lines)G.add(drStrip(L,-.075,.075,DRY,k.WHITE,1));
 /* minor arms: a stop line across the lane coming in, and a STOP sign on its right */
 for(const d of present){if(!arms[d].minor)continue;const h=hw(d),a=perp(d)+r*.35+1;const L=[pt(d,a,-.15),pt(d,a,-(h-.3))];G.add(drStrip(L,-.2,.2,DRY,k.WHITE,1));
  const sp=pt(d,a+1.2,-(h+1.3));G.add(drStopSign(sp[0],sp[1],Math.atan2(DRDIR[d][0],DRDIR[d][1])))}
 G.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{g:G,ends}}
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
