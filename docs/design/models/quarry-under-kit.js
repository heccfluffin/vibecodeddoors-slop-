/* =====================================================================================================
   The Old Quarry underground: THE KIT and batch 1 (docs/design/quarry-underground.md, part 2).
   Needs quarry-under.js (the plan). Builds a level of the mine from ugGen's plan:
     ugBuildLevel(plan, L) -> {g, lamps, veins, decl, solids, moving, pickups, hot, portal}   (L = 0, 1, 2; one THREE.Group in mine coordinates)
   Mine coordinates: x, z from the shaft (desert-local x = MN.ox + x, z = MN.oz + z), y from level 1's floor
   (desert y = MN.Y + y). Level floors are at y 0, -12, -24 (UGL[i].y - UGL[0].y).
   Everything static in a piece is merged into one mesh per material (ugBatch); veins, lamps' lights and signs stay
   separate objects so the game can hide, light or update them.
   Rock is pushed OUT of the tunnels by a noise of the world position (ugNoise), never in, and faded to nothing at
   every opening, so pieces that meet share the exact same edge (no gaps, no seams).
   ===================================================================================================== */

/* ---------- textures and materials (made once) ---------- */
const UGK={};
function ugCanvas(w,h,f){const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t}
function ugKit(){
 if(UGK.ok)return UGK;UGK.ok=1;
 const rnd=ugRng(9157);
 /* rock: warm strata, blotches and cracks; drawn wrapped so it tiles */
 const wrap=(k,w,h,f)=>{for(const dx of[-w,0,w])for(const dy of[-h,0,h]){k.save();k.translate(dx,dy);f();k.restore()}};
 UGK.rockT=ugCanvas(512,512,(k,w,h)=>{k.fillStyle='#8a755e';k.fillRect(0,0,w,h);
  for(let i=0;i<14;i++){const y=rnd()*h,t=6+rnd()*26,c=rnd()<.5?'rgba(60,44,30,.22)':'rgba(200,170,130,.16)';wrap(k,w,h,()=>{k.fillStyle=c;k.beginPath();k.moveTo(0,y);for(let x=0;x<=w;x+=32)k.lineTo(x,y+Math.sin(x*.02+i)*6);for(let x=w;x>=0;x-=32)k.lineTo(x,y+t+Math.sin(x*.025+i*2)*5);k.fill()})}
  for(let i=0;i<420;i++){const x=rnd()*w,y=rnd()*h,r=4+rnd()*22,c=rnd()<.5?'rgba(40,30,22,.12)':'rgba(230,205,170,.10)';wrap(k,w,h,()=>{k.fillStyle=c;k.beginPath();k.ellipse(x,y,r,r*(.4+rnd()*.5),rnd()*3,0,7);k.fill()})}
  k.lineWidth=1.4;for(let i=0;i<40;i++){let x=rnd()*w,y=rnd()*h;k.strokeStyle='rgba(30,22,16,.45)';wrap(k,w,h,()=>{k.beginPath();k.moveTo(x,y);let a=rnd()*7,px=x,py=y;for(let j=0;j<6;j++){a+=rnd()-.5;px+=Math.cos(a)*12;py+=Math.sin(a)*12;k.lineTo(px,py)}k.stroke()})}});
 UGK.gravT=ugCanvas(256,256,(k,w,h)=>{k.fillStyle='#6e5e4c';k.fillRect(0,0,w,h);for(let i=0;i<2600;i++){const v=rnd();k.fillStyle=v<.5?'rgba(40,32,24,.35)':'rgba(190,170,140,.30)';k.fillRect(rnd()*w,rnd()*h,1+rnd()*3,1+rnd()*2)}});
 UGK.woodT=ugCanvas(128,512,(k,w,h)=>{k.fillStyle='#8a6440';k.fillRect(0,0,w,h);for(let i=0;i<60;i++){const x=rnd()*w;k.strokeStyle='rgba('+(40+rnd()*30|0)+',28,14,'+(.15+rnd()*.25)+')';k.lineWidth=1+rnd()*2;k.beginPath();k.moveTo(x,0);for(let y=0;y<=h;y+=32)k.lineTo(x+Math.sin(y*.03+i)*3,y);k.stroke()}
  for(let i=0;i<5;i++){const x=rnd()*w,y=rnd()*h;k.fillStyle='rgba(50,30,14,.5)';k.beginPath();k.ellipse(x,y,3,7,0,0,7);k.fill()}});
 UGK.brickT=ugCanvas(256,256,(k,w,h)=>{k.fillStyle='#5a4a3e';k.fillRect(0,0,w,h);for(let r=0;r<16;r++)for(let c=0;c<5;c++){const x=c*52+(r%2?26:0),y=r*16;const v=rnd();k.fillStyle='rgb('+(130+v*40|0)+','+(70+v*25|0)+','+(48+v*18|0)+')';k.fillRect(x+2,y+2,48,12);if(x+52>w){k.fillRect(x+2-w,y+2,48,12)}}});
 UGK.plankT=ugCanvas(256,256,(k,w,h)=>{for(let i=0;i<8;i++){const v=rnd();k.fillStyle='rgb('+(118+v*30|0)+','+(84+v*20|0)+','+(52+v*12|0)+')';k.fillRect(i*32,0,32,h);k.fillStyle='rgba(30,18,8,.6)';k.fillRect(i*32,0,2,h);for(let j=0;j<10;j++){k.strokeStyle='rgba(50,30,14,.25)';k.beginPath();const x=i*32+4+rnd()*24;k.moveTo(x,0);k.lineTo(x+Math.sin(j)*3,h);k.stroke()}}});
 /* water ripples: a tiling normal map from a few waves and soft blobs (the game scrolls its offset slowly) */
 UGK.poolN=(()=>{const W=256,H=new Float32Array(W*W),bl=[];for(let i=0;i<70;i++)bl.push([rnd()*W,rnd()*W,6+rnd()*18,rnd()<.5?-1:1]);
  for(let y=0;y<W;y++)for(let x=0;x<W;x++){let h=Math.sin((x*3+y*1)/W*6.283)*.5+Math.sin((x*-2+y*5)/W*6.283)*.35+Math.sin((x*7-y*4)/W*6.283)*.18;
   for(const b of bl){let dx=Math.abs(x-b[0]),dy=Math.abs(y-b[1]);dx=Math.min(dx,W-dx);dy=Math.min(dy,W-dy);const d=(dx*dx+dy*dy)/(b[2]*b[2]);if(d<4)h+=b[3]*.25*Math.exp(-d)}H[y*W+x]=h}
  return ugCanvas(W,W,(k)=>{const im=k.createImageData(W,W);for(let y=0;y<W;y++)for(let x=0;x<W;x++){const hx=H[y*W+(x+1)%W]-H[y*W+(x+W-1)%W],hy=H[((y+1)%W)*W+x]-H[((y+W-1)%W)*W+x];
   let nx=-hx*3,ny=-hy*3,nz=1;const l=Math.hypot(nx,ny,nz);nx/=l;ny/=l;nz/=l;const i=(y*W+x)*4;im.data[i]=(nx*.5+.5)*255;im.data[i+1]=(ny*.5+.5)*255;im.data[i+2]=(nz*.5+.5)*255;im.data[i+3]=255}k.putImageData(im,0,0)})})();
 UGK.poolN.repeat.set(3,3);
 const M=(o)=>{const m=new THREE.MeshStandardMaterial(Object.assign({roughness:.9},o));return m};
 UGK.mat={
  rock:M({map:UGK.rockT,color:0xd0bca4}),rock2:M({map:UGK.rockT,color:0x9aa4b0}),rock3:M({map:UGK.rockT,color:0x6a5a56}),
  floor:M({map:UGK.gravT,color:0xc8b8a0}),
  wood:M({map:UGK.woodT,color:0xd8b890,roughness:.85}),woodD:M({map:UGK.woodT,color:0x8a6a50,roughness:.9}),
  plank:M({map:UGK.plankT,color:0xe0d0b8,roughness:.88}),brick:M({map:UGK.brickT,color:0xffffff,roughness:.92}),
  steel:M({color:0x5e636a,metalness:.55,roughness:.45}),rail:M({color:0x4c4642,metalness:.6,roughness:.5}),
  black:M({color:0x1c1a18,roughness:.8}),paintY:M({color:0xd8a020,roughness:.6}),paintR:M({color:0xa82a20,roughness:.6}),
  glass:new THREE.MeshStandardMaterial({color:0xfff0c8,emissive:0xffc870,emissiveIntensity:1.6,roughness:.3}),
  wire:M({color:0x1a1a1a,roughness:.6}),
  board:M({color:0x3a2c1e,roughness:.85}),paper:M({color:0xe8dcc0,roughness:.9}),green:M({color:0x2f5a3a,roughness:.7}),
  oreRock:M({map:UGK.rockT,color:0x5a4a3c}),fill:M({map:UGK.gravT,color:0xf0e0c0}),
  floor2:M({map:UGK.gravT,color:0xaeb0b4}),floor3:M({map:UGK.gravT,color:0x6a5c56}),
  water:new THREE.MeshStandardMaterial({color:0x183038,roughness:.06,metalness:.3,transparent:true,opacity:.9}),
  waterS:new THREE.MeshStandardMaterial({color:0x4a7a84,roughness:.1,metalness:.2,transparent:true,opacity:.45,depthWrite:false,normalMap:UGK.poolN,normalScale:new THREE.Vector2(.25,.25)}),
  /* deep water: a see-through rippled surface, darker layers under it that only cover where the basin is deeper
     (so the middle looks deeper than the edges), and wet rock for the basin */
  pool:new THREE.MeshStandardMaterial({color:0x1a3236,roughness:.16,metalness:.3,transparent:true,opacity:.62,depthWrite:false,normalMap:UGK.poolN,normalScale:new THREE.Vector2(.22,.22)}),
  poolD:new THREE.MeshBasicMaterial({color:0x07120f,transparent:true,opacity:.2,depthWrite:false}),
  wetRock:M({map:UGK.rockT,color:0x6e5a48,roughness:.35}),
  beam:new THREE.MeshBasicMaterial({color:0xfff0c0,transparent:true,opacity:.16,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}),
  sky:new THREE.MeshBasicMaterial({color:0xfff4dc}),
  white:M({color:0xe8e4dc,roughness:.6}),red:M({color:0xb02a20,roughness:.6}),dark:M({color:0x2a2c30,metalness:.5,roughness:.5}),
  brass:M({color:0xc8a040,metalness:.7,roughness:.35}),cloth:M({color:0x6a7a5a,roughness:1}),
  lampG:new THREE.MeshStandardMaterial({color:0xfff0c8,emissive:0xffd890,emissiveIntensity:1.2,roughness:.4})};
 for(const k in UGK.mat)UGK.mat[k].userData.ug=k;
 UGK.mat.poolD.userData.ro=1;UGK.mat.pool.userData.ro=2;UGK.mat.waterS.userData.ro=2;
 UGK.ore={cu:[0xd07a40,0x5a2410],fe:[0x8a8a90,0x202024],ag:[0xe0e4ea,0x404850],au:[0xffc830,0x806000],cr:[0x60e0ff,0x2080c0],dm:[0xe8f8ff,0x8ab0d0],ur:[0x9cff5a,0x3a8a20]};
 UGK.oreM={};for(const k in UGK.ore)UGK.oreM[k]=new THREE.MeshStandardMaterial({color:UGK.ore[k][0],emissive:UGK.ore[k][1],emissiveIntensity:.9,metalness:k=='cr'||k=='dm'?.1:.45,roughness:.3});
 return UGK;
}

/* ---------- noise of the world position (0..1); the same everywhere, so meeting pieces match ---------- */
function ugHash(i,j,k){let h=Math.imul(i,374761393)^Math.imul(j,668265263)^Math.imul(k,1274126177);h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296}
function ugVN(x,y,z){const i=Math.floor(x),j=Math.floor(y),k=Math.floor(z),fx=x-i,fy=y-j,fz=z-k,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy),w=fz*fz*(3-2*fz);
 const L=(a,b,t)=>a+(b-a)*t,h=ugHash;
 return L(L(L(h(i,j,k),h(i+1,j,k),u),L(h(i,j+1,k),h(i+1,j+1,k),u),v),L(L(h(i,j,k+1),h(i+1,j,k+1),u),L(h(i,j+1,k+1),h(i+1,j+1,k+1),u),v),w)}
function ugNoise(x,y,z){return .62*ugVN(x*.55,y*.55,z*.55)+.38*ugVN(x*1.7+31.7,y*1.7+7.3,z*1.7+11.1)}

/* ---------- merging: everything static in a piece becomes one mesh per material ---------- */
function ugBatch(){const B={};const self={
 add(key,geo,m){const g=geo.index?geo.toNonIndexed():geo.clone();if(m)g.applyMatrix4(m);(B[key]=B[key]||[]).push(g);return self},
 box(key,w,h,d,x,y,z,ry,rx,rz){const m=new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx||0,ry||0,rz||0,'YXZ')),new THREE.Vector3(1,1,1));return self.add(key,new THREE.BoxGeometry(w,h,d),m)},
 cyl(key,r0,r1,h,x,y,z,seg,ry,rx,rz){const m=new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx||0,ry||0,rz||0,'YXZ')),new THREE.Vector3(1,1,1));return self.add(key,new THREE.CylinderGeometry(r0,r1,h,seg||10),m)},
 raw(key,pos,nor,uv){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));(B[key]=B[key]||[]).push(g);return self},
 build(parent,mats){for(const k in B){const L=B[k];let n=0;for(const g of L)n+=g.attributes.position.count;const P=new Float32Array(n*3),N=new Float32Array(n*3),U=new Float32Array(n*2);let o=0;
   for(const g of L){const c=g.attributes.position.count;P.set(g.attributes.position.array,o*3);N.set(g.attributes.normal.array,o*3);if(g.attributes.uv)U.set(g.attributes.uv.array,o*2);o+=c;g.dispose()}
   const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(P,3));G.setAttribute('normal',new THREE.BufferAttribute(N,3));G.setAttribute('uv',new THREE.BufferAttribute(U,2));G.computeBoundingSphere();
   const me=new THREE.Mesh(G,mats[k]);me.userData.noSeam=true;me.userData.ugKey=k;me.renderOrder=mats[k].userData.ro||0;parent.add(me)}}};
 return self}

/* ---------- tunnel profile: vertical walls, then a flattened arch. hw = half width ---------- */
function ugProf(hw){const wy=2.6,top=wy+.45*hw,P=[];
 for(let i=0;i<=3;i++)P.push([-hw,-.1+(wy+.1)*i/3,-1,0]);
 for(let i=1;i<8;i++){const a=Math.PI*(1-i/8),nx=Math.cos(a)/hw,ny=Math.sin(a)/(top-wy),l=Math.hypot(nx,ny);P.push([hw*Math.cos(a),wy+(top-wy)*Math.sin(a),nx/l,ny/l])}
 for(let i=3;i>=0;i--)P.push([hw,-.1+(wy+.1)*i/3,1,0]);
 return{P,hw,wy,top}}

/* round the corners of a polyline [[x,y,z]...] with arcs of radius r (where the turn is more than 3 degrees) */
function ugFillet(pts,r){if(!r||pts.length<3)return pts.slice();const o=[pts[0]];
 for(let i=1;i<pts.length-1;i++){const a=pts[i-1],b=pts[i],c=pts[i+1];const u=[a[0]-b[0],a[2]-b[2]],v=[c[0]-b[0],c[2]-b[2]],lu=Math.hypot(u[0],u[1]),lv=Math.hypot(v[0],v[1]);
  const cos=(u[0]*v[0]+u[1]*v[1])/(lu*lv),th=Math.PI-Math.acos(Math.max(-1,Math.min(1,cos)));if(th<.05){o.push(b);continue}
  const d=Math.min(r*Math.tan(th/2),lu*.48,lv*.48),rr=d/Math.tan(th/2);
  const p0=[b[0]+u[0]/lu*d,b[2]+u[1]/lu*d],p1=[b[0]+v[0]/lv*d,b[2]+v[1]/lv*d];
  // centre: from p0 along the inward normal
  const bis=[u[0]/lu+v[0]/lv,u[1]/lu+v[1]/lv],bl=Math.hypot(bis[0],bis[1]),cd=rr/Math.sin((Math.PI-th)/2)/ 1;
  const cx=b[0]+bis[0]/bl*Math.hypot(d,rr),cz=b[2]+bis[1]/bl*Math.hypot(d,rr);
  let a0=Math.atan2(p0[1]-cz,p0[0]-cx),a1=Math.atan2(p1[1]-cz,p1[0]-cx);let da=a1-a0;while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;
  const n=Math.max(2,Math.ceil(Math.abs(da)*rr/.5));for(let k=0;k<=n;k++){const t=k/n,aa=a0+da*t;o.push([cx+Math.cos(aa)*rr,b[1],cz+Math.sin(aa)*rr])}}
 o.push(pts[pts.length-1]);return o}
function ugResample(pts,step){const o=[pts[0]];for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],L=Math.hypot(b[0]-a[0],b[2]-a[2],b[1]-a[1]),n=Math.max(1,Math.ceil(L/step));for(let k=1;k<=n;k++){const t=k/n;o.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t])}}return o}

/* ---------- the tunnel extruder. pts: polyline in mine coords [[x,y,z]]. o: {hw, amp, fil, rock, sets, rails, lamps,
   holes:[[s0,s1,x0,x1]] (gaps in the floor, s along the tunnel), capA, capB}. Returns {L, at(s)->frame, frames} ---------- */
function ugTube(b,pts,o){
 o=o||{};const pf=ugProf(o.hw||2),amp=o.amp==null?.2:o.amp,rk=o.rock||'rock';
 const P=ugResample(ugFillet(pts,o.fil==null?3:o.fil),.5),n=P.length,S=[0];for(let i=1;i<n;i++)S.push(S[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][2]-P[i-1][2]));const L=S[n-1];
 const T=P.map((p,i)=>{const a=P[Math.max(0,i-1)],c=P[Math.min(n-1,i+1)];let tx=c[0]-a[0],tz=c[2]-a[2];const l=Math.hypot(tx,tz)||1;return[tx/l,tz/l]});
 /* the two ends meet other pieces: square them up exactly to the nearest axis (every opening faces one of the four
    ways), so the end ring lies in the doorway's plane and two tunnels meeting share the same ring (no wedge gaps) */
 for(const i of[0,n-1]){const [tx,tz]=T[i];if(Math.abs(tx)>.97)T[i]=[Math.sign(tx),0];else if(Math.abs(tz)>.97)T[i]=[0,Math.sign(tz)]}
 const fade=s=>Math.min(1,s/1,(L-s)/1);
 /* walls and roof */
 const pos=[],nor=[],uv=[],pr=pf.P,m=pr.length,V=[];const pl=[0];for(let j=1;j<m;j++)pl.push(pl[j-1]+Math.hypot(pr[j][0]-pr[j-1][0],pr[j][1]-pr[j-1][1]));
 for(let i=0;i<n;i++){const [tx,tz]=T[i],rx=-tz,rz=tx,row=[];for(let j=0;j<m;j++){const [sx,y,nx,ny]=pr[j];let x=P[i][0]+rx*sx,yy=P[i][1]+y,z=P[i][2]+rz*sx;
   const hy=Math.max(0,Math.min(1,y/.7)),d=amp*fade(S[i])*hy*ugNoise(x,yy,z);x+=(rx*nx)*d;yy+=ny*d;z+=(rz*nx)*d;row.push([x,yy,z,-(rx*nx),-ny,-(rz*nx),S[i]/3,pl[j]/3])}V.push(row)}
 const push=(q)=>{pos.push(q[0],q[1],q[2]);nor.push(q[3],q[4],q[5]);uv.push(q[6],q[7])};
 for(let i=0;i<n-1;i++)for(let j=0;j<m-1;j++){const a=V[i][j],b2=V[i+1][j],c=V[i+1][j+1],d=V[i][j+1];push(a);push(b2);push(c);push(a);push(c);push(d)}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.computeVertexNormals();b.add(rk,geo);
 /* the floor, with holes cut where asked */
 const fp=[],fn=[],fu=[];const holes=o.holes||[];
 const cols=[-pf.hw];for(const h of holes){cols.push(h[2],h[3])}cols.push(pf.hw);const xs=[...new Set(cols)].sort((a,b)=>a-b);
 /* the floor's edge points, row by row; on the inside of a tight bend an edge would run backwards and the floor fold
    over itself (two layers flickering), so there it waits until the bend has passed */
 const FQ=[];for(let i=0;i<n;i++){const [tx,tz]=T[i],rx=-tz,rz=tx,row=xs.map(x=>[P[i][0]+rx*x,P[i][1],P[i][2]+rz*x]);if(i)row.forEach((v,c)=>{const q=FQ[i-1][c];if((v[0]-q[0])*tx+(v[2]-q[2])*tz<.02)row[c]=[q[0],v[1],q[2]]});FQ.push(row)}
 for(let i=0;i<n-1;i++){const s0=S[i],s1=S[i+1];for(let c=0;c<xs.length-1;c++){const x0=xs[c],x1=xs[c+1],mx=(x0+x1)/2,ms=(s0+s1)/2;if(holes.some(h=>ms>h[0]&&ms<h[1]&&mx>h[2]&&mx<h[3]))continue;
   const A=FQ[i][c],B2=FQ[i][c+1],C=FQ[i+1][c+1],D=FQ[i+1][c];const tris=[[A,B2,C],[A,C,D]].filter(t=>Math.abs((t[1][0]-t[0][0])*(t[2][2]-t[0][2])-(t[1][2]-t[0][2])*(t[2][0]-t[0][0]))>1e-7);
   for(const t of tris)for(const v of t){fp.push(v[0],v[1],v[2]);fn.push(0,1,0);fu.push(v[0]/2.5,v[2]/2.5)}}}
 /* make sure the floor faces up */
 for(let k=0;k<fp.length;k+=9){const ax=fp[k],az=fp[k+2],bx=fp[k+3],bz=fp[k+5],cx=fp[k+6],cz=fp[k+8];if((bx-ax)*(cz-az)-(bz-az)*(cx-ax)>0){for(let q=0;q<3;q++){const t=fp[k+3+q];fp[k+3+q]=fp[k+6+q];fp[k+6+q]=t}const tu0=fu[k/9*6+2],tu1=fu[k/9*6+3];fu[k/9*6+2]=fu[k/9*6+4];fu[k/9*6+3]=fu[k/9*6+5];fu[k/9*6+4]=tu0;fu[k/9*6+5]=tu1}}
 b.raw(o.floorKey||'floor',fp,fn,fu);
 const at=s=>{let i=1;while(i<n-1&&S[i]<s)i++;const t=(s-S[i-1])/((S[i]-S[i-1])||1),p=[P[i-1][0]+(P[i][0]-P[i-1][0])*t,P[i-1][1]+(P[i][1]-P[i-1][1])*t,P[i-1][2]+(P[i][2]-P[i-1][2])*t],tt=T[i];return{p,t:tt,r:[-tt[1],tt[0]],yaw:Math.atan2(-tt[0],-tt[1])}};
 const res={L,at,pf,P,S,T,amp};
 if(o.sets!==false)ugSets(b,res,o);
 if(o.rails)ugRails(b,res,o.ends);
 if(o.lamps!==false&&o.lampsOut)ugLamps(b,res,o.lampsOut,o.lampOff||0);
 return res}

/* a point on a tunnel's wall surface (ring i, profile point j, noise included) with the way it faces, 6 cm into the
   rock: where a vein goes. Veins sit on the real wall this way, never in front of a bulge or behind a hollow */
function ugTubeWall(tr,i,j){const p=tr.P[i],[tx,tz]=tr.T[i],rx=-tz,rz=tx,q=tr.pf.P[j],sx=q[0],yy=q[1],x=p[0]+rx*sx,y=p[1]+yy,z=p[2]+rz*sx;
 const hy=Math.max(0,Math.min(1,yy/.7)),d=tr.amp*Math.min(1,tr.S[i],tr.L-tr.S[i])*hy*ugNoise(x,y,z),sg=Math.sign(sx),ox=rx*sg,oz=rz*sg;return{x:x+ox*(d+.06),y,z:z+oz*(d+.06),dx:-ox,dz:-oz}}
/* the nearest ring to a distance along a tunnel */
const ugTubeRing=(tr,s)=>{let i=0;while(i<tr.S.length-1&&tr.S[i+1]<=s)i++;return i};
/* timber sets every 3 m: two posts, a cap, and lagging boards over the caps (some missing). broken: some sets lean */
function ugSets(b,t,o){const pf=t.pf,hw=pf.hw,px=hw-.28,cw=2*hw-.3,sp=3,R=ugRng((Math.round(t.P[0][0]*7)^Math.round(t.P[0][2]*13))+77);
 let si=0;for(let s=1.5;s<t.L-1;s+=sp,si++){const f=t.at(s),[x,y,z]=f.p,yaw=f.yaw,rx=f.r[0],rz=f.r[1];
  const lean=o.broken&&R()<.4?(R()-.5)*.25:0;
  for(const sd of[-1,1])b.box('wood',.22,2.6,.22,x+rx*sd*px,y+1.3,z+rz*sd*px,yaw,0,sd*lean*.3);
  b.box('wood',cw,.24,.24,x,y+2.72,z,yaw,0,lean*.2);
  if(s+sp<t.L-1&&!lean)for(let k=-3;k<=3;k++){if(R()<.15)continue;const f2=t.at(s+sp/2),xx=f2.p[0]+f2.r[0]*k*.5,zz=f2.p[2]+f2.r[1]*k*.5;b.box('woodD',.2,.04,sp-.1,xx,f2.p[1]+2.855-(si%2)*.012,zz,f2.yaw)   /* every other span 12 mm lower: on a bend the boards of two spans can cross */}}}
/* rails: sleepers every 0.6 m and two continuous rails (0.6 m gauge) following the path ring by ring, so curves
   have no gaps and two pieces' rails meet end to end. ends: a list that collects both ends (for buffer stops) */
function ugRails(b,t,ends){for(let s=.45;s<t.L-.3;s+=.6){const f=t.at(s);b.box('woodD',1.1,.08,.18,f.p[0],f.p[1]+.04,f.p[2],f.yaw)}
 const P=t.P,T=t.T,n=P.length,pos=[],w=.03,y0=.08,y1=.18;
 const quad=(a,b2,c,d,nx,ny,nz)=>{const e1=[b2[0]-a[0],b2[1]-a[1],b2[2]-a[2]],e2=[c[0]-a[0],c[1]-a[1],c[2]-a[2]],cr=[e1[1]*e2[2]-e1[2]*e2[1],e1[2]*e2[0]-e1[0]*e2[2],e1[0]*e2[1]-e1[1]*e2[0]];
  const ok=cr[0]*nx+cr[1]*ny+cr[2]*nz>=0;for(const q of ok?[a,b2,c,a,c,d]:[a,c,b2,a,d,c])pos.push(q[0],q[1],q[2])};
 for(const off of[-.3,.3])for(let i=0;i<n-1;i++){const r0=[-T[i][1],T[i][0]],r1=[-T[i+1][1],T[i+1][0]],A=P[i],B=P[i+1];
  const at=(p,r,o,yy)=>[p[0]+r[0]*o,p[1]+yy,p[2]+r[1]*o];
  quad(at(A,r0,off-w,y1),at(A,r0,off+w,y1),at(B,r1,off+w,y1),at(B,r1,off-w,y1),0,1,0);
  for(const sd of[-1,1]){const o=off+sd*w;quad(at(A,r0,o,y0),at(B,r1,o,y0),at(B,r1,o,y1),at(A,r0,o,y1),r0[0]*sd,0,r0[1]*sd)}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(new Array(pos.length/3*2).fill(0),2));g.computeVertexNormals();b.add('rail',g);
 if(ends){const e0=P[0],e1=P[n-1];ends.push({x:e0[0],y:e0[1],z:e0[2],dx:-T[0][0],dz:-T[0][1]},{x:e1[0],y:e1[1],z:e1[2],dx:T[n-1][0],dz:T[n-1][1]})}}
/* a turn plate: a round steel plate in the floor where rails meet (junctions, the pillar round) */
/* a turntable: a round steel plate set in the floor where lines meet, with one short pair of rails across it and a rim.
   A loaded cart is pushed onto it, the plate is turned by hand, and the cart is pushed off down another line.
   (dx,dz): the way its rails point (it sits turned to one of the lines) */
function ugPlate(b,x,y,z,ctx,dx,dz){dx=dx||0;dz=dz==null?1:dz;const yaw=Math.atan2(-dx,-dz),rx=-dz,rz=dx;
 b.cyl('steel',.9,.9,.05,x,y+.025,z,28);
 const rim=new THREE.TorusGeometry(.875,.03,6,28);rim.rotateX(Math.PI/2);b.add('rail',rim,new THREE.Matrix4().makeTranslation(x,y+.05,z));
 for(const sd of[-.3,.3])b.box('rail',.06,.13,1.62,x+rx*sd,y+.115,z+rz*sd,yaw);
 for(let i=0;i<8;i++){const a=i/8*Math.PI*2+.39;b.cyl('rail',.035,.035,.02,x+Math.cos(a)*.62,y+.06,z+Math.sin(a)*.62,8)}
 if(ctx)ctx.plates.push([x,z])}
/* rails between mine-coord points with fillets, registering their ends */
function ugRailLine(b,pts,y,ctx,fil){const t=ugTube(ugNull,pts.map(q=>[q[0],y,q[1]]),{fil:fil==null?3:fil,sets:false});ugRails(b,t,ctx.ends);return t}
/* lamps hanging from the caps every other set, a wire along the roof between them; lamp spots go in out[] */
function ugLamps(b,t,out,off){let first=null,prev=null;for(let s=1.5+(off||0)*3;s<t.L-1;s+=6){const f=t.at(s),x=f.p[0]+f.r[0]*.35,z=f.p[2]+f.r[1]*.35,y=f.p[1];
  b.cyl('wire',.008,.008,.24,x,y+2.48,z,4);b.cyl('steel',.07,.09,.08,x,y+2.34,z,10);b.add('glass',new THREE.SphereGeometry(.075,10,8),new THREE.Matrix4().makeTranslation(x,y+2.25,z));
  out.push([x,y+2.2,z]);if(prev){const dx=x-prev[0],dz=z-prev[2],l=Math.hypot(dx,dz);b.box('wire',.012,.012,l,(x+prev[0])/2,y+2.58,(z+prev[2])/2,Math.atan2(-dx,-dz))}prev=[x,y,z]}}

/* ---------- a room shell: floor, rock walls (pushed out by noise, flat at doorways), a rough roof.
   pts: the room's corners in mine coords, anticlockwise seen from above, at floor y; h: height.
   doors: [{x,z,hw}] doorway centres on the walls (mine coords); each gets the tunnel's arch shape, a filler panel
   above it and a timber portal. o.wall: 'rock'|'plank'|'brick' lining; o.roof: 'rock'|'beams'; o.holes: floor/roof
   holes [{x0,x1,z0,z1,roof}] (mine coords, axis-aligned). o.inner: true for a block's walls seen from outside. ---------- */
function ugRoom(b,pts,y,h,doors,o){o=o||{};const amp=o.amp==null?.22:o.amp,rk=o.rock||'rock',lin=o.wall||rk;
 const nn=pts.length;
 for(let e=0;e<nn;e++){const A=pts[e],B=pts[(e+1)%nn],dx=B[0]-A[0],dz=B[1]-A[1],len=Math.hypot(dx,dz),ux=dx/len,uz=dz/len;
  const nx=uz,nz=-ux;  /* outward normal (into the rock); the walls face the other way, into the room */
  const ds=doors.map(d=>{const t=(d.x-A[0])*ux+(d.z-A[1])*uz,off=Math.abs((d.x-A[0])*nx+(d.z-A[1])*nz);return off<.3&&t>0&&t<len?{t,hw:d.hw,d}:null}).filter(Boolean);
  const pf=ds.map(d=>ugProf(d.hw));const topD=ds.length?Math.max(...pf.map(p=>p.top))+.15:0;
  /* columns: wall edges and doorway edges; rows: floor, doorway top, roof */
  const cx=[0,len];for(const d of ds){cx.push(d.t-d.hw,d.t+d.hw)}const step=.6;let C=[...new Set(cx.map(v=>+v.toFixed(3)))].sort((a,b)=>a-b),C2=[];for(let i=0;i<C.length-1;i++){const k=Math.max(1,Math.ceil((C[i+1]-C[i])/step));for(let q=0;q<k;q++)C2.push(C[i]+(C[i+1]-C[i])*q/k)}C2.push(len);
  const ry=[-.1];if(topD&&topD<h)ry.push(topD);ry.push(h+.1);let R2=[];for(let i=0;i<ry.length-1;i++){const k=Math.max(1,Math.ceil((ry[i+1]-ry[i])/step));for(let q=0;q<k;q++)R2.push(ry[i]+(ry[i+1]-ry[i])*q/k)}R2.push(h+.1);
  const inDoor=(t,yy)=>ds.some(d=>t>d.t-d.hw+1e-3&&t<d.t+d.hw-1e-3&&yy<topD-1e-3);
  const dist=(t,yy)=>{let m=Math.min(t,len-t,(yy+.1)*2,h+.1-yy);for(const d of ds){const ex=Math.max(d.t-d.hw-t,0,t-d.t-d.hw),ey=Math.max(yy-topD,0);m=Math.min(m,Math.hypot(ex,ey))}return m};
  const vx=(t,yy)=>{let x=A[0]+ux*t,z=A[1]+uz*t;const f=Math.min(1,dist(t,yy)/1)*Math.max(0,Math.min(1,yy/.7)),d=amp*f*ugNoise(x,y+yy,z);return[x+nx*d,y+yy,z+nz*d]};
  const pos=[],uv=[];
  for(let i=0;i<C2.length-1;i++)for(let j=0;j<R2.length-1;j++){const t0=C2[i],t1=C2[i+1],y0=R2[j],y1=R2[j+1];if(inDoor((t0+t1)/2,(y0+y1)/2))continue;
   const a=vx(t0,y0),bq=vx(t1,y0),c=vx(t1,y1),d=vx(t0,y1),U=(t,yy)=>[(A[0]*-uz+A[1]*ux)*0+((e*7.3)+t)/3,yy/3];
   const q=[[a,U(t0,y0)],[bq,U(t1,y0)],[c,U(t1,y1)],[d,U(t0,y1)]];
   for(const k of[0,1,2,0,2,3]){pos.push(...q[k][0]);uv.push(...q[k][1])}}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.computeVertexNormals();b.add(lin,geo);
  /* over each doorway: a flat panel between the arch and the wall row above, then a timber portal */
  ds.forEach((d,k)=>{const p=pf[k],sh=new THREE.Shape();sh.moveTo(-d.hw,p.wy);sh.lineTo(-d.hw,topD);sh.lineTo(d.hw,topD);sh.lineTo(d.hw,p.wy);
   for(let i=p.P.length-5;i>=4;i--){const q=p.P[i];if(q[1]>=p.wy-1e-6)sh.lineTo(q[0],q[1])}
   const g2=new THREE.ShapeGeometry(sh);const pa=g2.attributes.position;const uvs=[];for(let i=0;i<pa.count;i++){uvs.push((d.t+pa.getX(i))/3,pa.getY(i)/3)}g2.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
   /* the panel's x runs along the wall, its face looks into the room */
   const mx=new THREE.Matrix4().compose(new THREE.Vector3(A[0]+ux*d.t,y,A[1]+uz*d.t),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,Math.atan2(-uz,ux),0)),new THREE.Vector3(1,1,1));
   b.add(lin,g2,mx);
   if(o.portal!==false){const px=A[0]+ux*d.t-nx*.12,pz=A[1]+uz*d.t-nz*.12,py=Math.atan2(-ux,-uz)+Math.PI/2;
    for(const sd of[-1,1])b.box('wood',.3,p.wy+.02,.3,px+ux*sd*(d.hw+.02),y+(p.wy-.08)/2+.01,pz+uz*sd*(d.hw+.02),0);
    b.box('wood',2*d.hw+.7,.32,.32,px,y+p.wy+.06,pz,Math.atan2(-uz,ux))}})}
 /* floor and roof (with holes), as grids so the roof can be rough */
 const xs=pts.map(p=>p[0]),zs=pts.map(p=>p[1]),x0=Math.min(...xs),x1=Math.max(...xs),z0=Math.min(...zs),z1=Math.max(...zs);
 const inPoly=(x,z)=>{let c=false;for(let i=0,j=nn-1;i<nn;j=i++){const a=pts[i],bb=pts[j];if((a[1]>z)!=(bb[1]>z)&&x<(bb[0]-a[0])*(z-a[1])/(bb[1]-a[1])+a[0])c=!c}return c};
 const holes=o.holes||[],blocks=o.blocks||[];const inHole=(x,z,roof)=>holes.some(H=>(!!H.roof==roof||H.both)&&x>H.x0&&x<H.x1&&z>H.z0&&z<H.z1)||blocks.some(H=>x>H.x0&&x<H.x1&&z>H.z0&&z<H.z1);
 const gx=[x0];for(const H of holes.concat(blocks))gx.push(H.x0,H.x1);gx.push(x1);const gz=[z0];for(const H of holes.concat(blocks))gz.push(H.z0,H.z1);gz.push(z1);
 const sub=(L,st)=>{L=[...new Set(L.map(v=>+v.toFixed(3)))].sort((a,b)=>a-b);const o2=[];for(let i=0;i<L.length-1;i++){const k=Math.max(1,Math.ceil((L[i+1]-L[i])/st));for(let q=0;q<k;q++)o2.push(L[i]+(L[i+1]-L[i])*q/k)}o2.push(L[L.length-1]);return o2};
 const GX=sub(gx,.8),GZ=sub(gz,.8);const fp=[],fn=[],fu=[],rp=[],ru=[];
 const edgeD=(x,z)=>{let m=1e9;for(let i=0;i<nn;i++){const a=pts[i],c=pts[(i+1)%nn];const vx=c[0]-a[0],vz=c[1]-a[1],l=vx*vx+vz*vz,t=Math.max(0,Math.min(1,((x-a[0])*vx+(z-a[1])*vz)/l));m=Math.min(m,Math.hypot(x-a[0]-vx*t,z-a[1]-vz*t))}for(const H of holes.concat(blocks)){m=Math.min(m,Math.hypot(Math.max(H.x0-x,0,x-H.x1),Math.max(H.z0-z,0,z-H.z1)))}return m};
 const roofY=(x,z)=>y+h+(o.roof=='flat'?0:.5*Math.min(1,edgeD(x,z)/1.2)*ugNoise(x,y+h,z));
 for(let i=0;i<GX.length-1;i++)for(let j=0;j<GZ.length-1;j++){const a=GX[i],c=GX[i+1],e=GZ[j],f=GZ[j+1],mx=(a+c)/2,mz=(e+f)/2;if(!inPoly(mx,mz))continue;
  if(!inHole(mx,mz,true)){for(const v of[[a,e],[c,f],[a,f],[a,e],[c,e],[c,f]]){rp.push(v[0],roofY(v[0],v[1]),v[1]);ru.push(v[0]/3,v[1]/3)}}}
 if(o.noCap)return{x0,x1,z0,z1};
 /* the floor: one flat shape with exact holes (rectangles, pillars, round or oval pits) */
 {const sh=new THREE.Shape();pts.forEach((q,i)=>i?sh.lineTo(q[0],-q[1]):sh.moveTo(q[0],-q[1]));
  for(const H of holes.filter(H=>!H.roof||H.both).concat(blocks)){const hp=new THREE.Path();hp.moveTo(H.x0,-H.z0);hp.lineTo(H.x1,-H.z0);hp.lineTo(H.x1,-H.z1);hp.lineTo(H.x0,-H.z1);hp.lineTo(H.x0,-H.z0);sh.holes.push(hp)}
  for(const E of o.pits||[]){const hp=new THREE.Path();hp.absellipse(E.cx,-E.cz,E.rx,E.rz,0,Math.PI*2,false,0);sh.holes.push(hp)}
  const fg=new THREE.ShapeGeometry(sh,24);fg.rotateX(-Math.PI/2);fg.translate(0,y,0);const pa=fg.attributes.position,uvs=[];for(let i=0;i<pa.count;i++)uvs.push(pa.getX(i)/2.5,pa.getZ(i)/2.5);fg.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));b.add(o.floor||'floor',fg)}
 const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(rp,3));rg.setAttribute('uv',new THREE.Float32BufferAttribute(ru,2));rg.computeVertexNormals();b.add(o.roofMat||rk,rg);
 return{x0,x1,z0,z1}}

/* ---------- a bulkhead: where a narrower tunnel (a room's neck) meets the standard 4 m opening, a flat rock wall with
   the narrow arch cut in it fills the difference, with a timber frame round the doorway. (x,z) the opening's centre,
   (fx,fz) the way it faces (out, towards the 4 m tunnel), hw the narrow half-width ---------- */
function ugBulkhead(b,x,y,z,fx,fz,hw,o){const big=ugProf(2),sm=ugProf(hw),sh=new THREE.Shape(),wall=P=>P.filter(q=>q[1]>=0);
 const ob=wall(big.P),ib=wall(sm.P);sh.moveTo(-2,0);for(const q of ob)sh.lineTo(q[0],q[1]);sh.lineTo(2,0);sh.lineTo(hw,0);for(let i=ib.length-1;i>=0;i--)sh.lineTo(ib[i][0],ib[i][1]);sh.lineTo(-hw,0);sh.lineTo(-2,0);
 const g=new THREE.ShapeGeometry(sh);const pa=g.attributes.position,uv=[];for(let i=0;i<pa.count;i++)uv.push(pa.getX(i)/3,pa.getY(i)/3);g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 /* the shape's x runs to the right as you face it, its face looks along (fx,fz) */
 const yaw=Math.atan2(fx,fz);b.add((o&&o.rock)||'rock',g,new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,yaw,0)),new THREE.Vector3(1,1,1)));
 const rx=fz,rz=-fx,px=x+fx*.12,pz=z+fz*.12;for(const sd of[-1,1])b.box('wood',.24,sm.wy,.24,px+rx*sd*(hw+.04),y+sm.wy/2,pz+rz*sd*(hw+.04),yaw);b.box('wood',2*hw+.5,.26,.26,px,y+sm.wy+.13,pz,yaw)}

/* ---------- a working face: closes a tunnel end with a rough rock dome. (x,z) the end, dir 0..3 the way the tunnel
   was going, y the floor. Returns the spots for its veins ---------- */
function ugFace(b,x,y,z,dir,hw,o){o=o||{};const pf=ugProf(hw||2),v=ugRot(0,-1,dir),r=[-v[1],v[0]],P=pf.P,m=P.length,depth=1.2,rings=5,cy=pf.wy*.55,pos=[],uv=[];
 const pt=(j,k)=>{const q=P[j],t=k/rings,fw=depth*Math.sin(t*Math.PI/2),sx=q[0]*Math.cos(t*Math.PI/2),yy=q[1]<=0?q[1]:q[1]+(cy-q[1])*t;
  let X=x+r[0]*sx+v[0]*fw,Z=z+r[1]*sx+v[1]*fw;const d=(k>0?.3:0)*ugNoise(X,y+yy,Z)*Math.min(1,Math.max(0,yy/.7));return[X+v[0]*d,y+yy,Z+v[1]*d]};
 for(let k=0;k<rings;k++)for(let j=0;j<m-1;j++){const a=pt(j,k),b2=pt(j+1,k),c=pt(j+1,k+1),d=pt(j,k+1);for(const q of[a,b2,c,a,c,d]){pos.push(...q);uv.push((q[0]+q[2])/3,q[1]/3)}}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.computeVertexNormals();
 /* make the dome face back down the tunnel */
 const nA=geo.attributes.normal;let s=0;for(let i=0;i<nA.count;i++)s+=nA.getX(i)*v[0]+nA.getZ(i)*v[1];if(s>0){const pa=geo.attributes.position.array,ua=geo.attributes.uv.array;for(let i=0;i<pa.length;i+=9)for(let q=0;q<3;q++){const t=pa[i+3+q];pa[i+3+q]=pa[i+6+q];pa[i+6+q]=t}for(let i=0;i<ua.length;i+=6)for(let q=0;q<2;q++){const t=ua[i+2+q];ua[i+2+q]=ua[i+4+q];ua[i+4+q]=t}geo.computeVertexNormals()}
 b.add(o.rock||'rock',geo);
 /* the floor under the dome, following its bottom edge */
 const fp=[],fn=[],fu=[],edge=[];for(let k=0;k<=rings;k++)edge.push(pt(0,k));for(let k=rings;k>=0;k--)edge.push(pt(m-1,k));
 for(let i=0;i<edge.length-1;i++){const A=[x,y,z],B=edge[i],C=edge[i+1];const tri=[A,B,C];const cr=(B[0]-A[0])*(C[2]-A[2])-(B[2]-A[2])*(C[0]-A[0]);const T3=cr>0?[A,C,B]:tri;for(const q of T3){fp.push(q[0],y,q[2]);fn.push(0,1,0);fu.push(q[0]/2.5,q[2]/2.5)}}
 b.raw(o.floor||'floor',fp,fn,fu);
 /* spots for veins on the face, facing back down the tunnel */
 return[[2,2],[12,1],[6,3]].map(([j,k])=>{const q=pt(j,k);return[q[0]+v[0]*.06,q[1],q[2]+v[1]*.06,-v[0],-v[1]]})}

/* ---------- an ore vein: a dark rock patch on the wall with metal nuggets. A separate group (it gets broken) ---------- */
function ugVein(type,R){const K=ugKit(),g=new THREE.Group();R=R||Math.random;
 const p=new THREE.Mesh(new THREE.DodecahedronGeometry(.42,0),K.mat.oreRock);p.scale.set(1,.75,.38);g.add(p);
 for(let i=0;i<8;i++){const n=new THREE.Mesh(new THREE.OctahedronGeometry(.08+R()*.08,0),K.oreM[type]||K.oreM.fe);const a=R()*6.28,rr=R()*.3;n.position.set(Math.cos(a)*rr,Math.sin(a)*rr*.75,-.12-R()*.05);n.rotation.set(R()*3,R()*3,0);g.add(n)}
 g.userData.vein=type;return g}

/* ---------- a signpost: a post and a board with an arrow and the distance to the cage ---------- */
/* the canvas has the board's own shape (ar = width / height), and long text shrinks to fit inside the frame */
function ugSignTex(txt,ar){const W=Math.round(72*(ar||3.55));return ugCanvas(W,72,(k,w,h)=>{k.fillStyle='#e8d8b0';k.fillRect(0,0,w,h);k.strokeStyle='#5a3a1a';k.lineWidth=6;k.strokeRect(3,3,w-6,h-6);k.fillStyle='#2a1a0c';let f=34;const F=()=>k.font='700 '+f+'px "Barlow Semi Condensed",DoorsSans,Arial';F();while(f>14&&k.measureText(txt).width>w-28){f--;F()}k.textBaseline='middle';k.textAlign='center';k.fillText(txt,w/2,h/2+2)})}
function ugSign(x,y,z,yaw,txt,back){const K=ugKit(),g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=yaw;
 const post=new THREE.Mesh(new THREE.BoxGeometry(.1,1.75,.1),K.mat.wood);post.position.y=.875;g.add(post);
 const t=ugSignTex(txt),t2=ugSignTex(back||txt),bd=new THREE.Mesh(new THREE.BoxGeometry(.95,.27,.04),[K.mat.woodD,K.mat.woodD,K.mat.woodD,K.mat.woodD,new THREE.MeshStandardMaterial({map:t,roughness:.8}),new THREE.MeshStandardMaterial({map:t2,roughness:.8})]);bd.position.set(0,1.55,.07);g.add(bd);
 g.traverse(o=>{if(o.isMesh)o.userData.noSeam=true});return g}

/* =====================================================================================================
   THE PIECES OF LEVEL 1 (batch 1): stations, tunnels, junctions, pillar rounds, ladderway, spiral decline
   ===================================================================================================== */
const UGLY=L=>UGL[L].y-UGL[0].y;
/* each level's rock and floor materials (level 1 warm brown, level 2 blue-grey, level 3 dark) */
const ugRK=L=>L==0?'rock':'rock'+(L+1),ugFL=L=>L==0?'floor':'floor'+(L+1);
/* yaw for a box whose length runs along local x, to lie along (dx,dz) */
const ugYX=(dx,dz)=>Math.atan2(-dz,dx);
/* a batch that throws everything away (to get a tunnel's frames without building it) */
const ugNull={add(){return this},box(){return this},raw(){return this},cyl(){return this}};
/* local piece coords -> mine coords */
const ugT=p=>(x,z)=>{const w=ugRot(x,z,p.r);return[p.x+w[0],p.z+w[1]]};
const ugYaw=(p,a)=>-p.r*Math.PI/2+(a||0);   /* rotation.y for a piece-local object */
/* the openings of a piece: its entry (0,0) and its exits, in mine coords, with the level they are on */
function ugOpenings(p){const T=ugT(p),o=[{x:p.x,z:p.z,L:p.L,dir:(p.r+2)%4,entry:1}];for(const e of p.d.ex){const w=T(e[0],e[1]);o.push({x:w[0],z:w[1],L:p.L+(e[3]||0),dir:(e[2]+p.r)%4})}return o}

/* a rectangular room in piece-local coords (x0..x1, z0..z1), doors where the piece's openings or neck tubes meet it */
function ugRectRoom(b,p,r,h,y,o){const T=ugT(p);const c=[T(r.x0,r.z1),T(r.x1,r.z1),T(r.x1,r.z0),T(r.x0,r.z0)];
 /* anticlockwise seen from above (x right, z down the screen is +z): check and flip */
 let A=0;for(let i=0;i<4;i++){const a=c[i],d=c[(i+1)%4];A+=a[0]*d[1]-d[0]*a[1]}if(A<0)c.reverse();
 return ugRoom(b,c,y,h,o.doors||[],o)}

/* mine-coord doors for a room: openings and neck-tube ends that lie on its outline */
function ugDoorsFor(p,r,extra){const T=ugT(p),ds=[];const on=(x,z)=>(Math.abs(x-r.x0)<.05||Math.abs(x-r.x1)<.05)&&z>r.z0-.05&&z<r.z1+.05||(Math.abs(z-r.z0)<.05||Math.abs(z-r.z1)<.05)&&x>r.x0-.05&&x<r.x1+.05;
 const cand=[[0,0,2]].concat(p.d.ex.map(e=>[e[0],e[1],2]));for(const s of p.d.shp)if(s.k=='path')for(const q of[s.pts[0],s.pts[s.pts.length-1]])cand.push([q[0],q[1],s.w/2]);
 for(const q of cand.concat(extra||[]))if(on(q[0],q[1])){const w=T(q[0],q[1]);if(!ds.some(d=>Math.hypot(d.x-w[0],d.z-w[1])<.1))ds.push({x:w[0],z:w[1],hw:Math.min(2,q[2])})}
 return ds}

/* ---- the shaft stations: the room, the shaft with its landing gate, guides and a sump, and the version's dressing ---- */
function ugStationBuild(b,p,L,ctx){const y=UGLY(L),h=L==0?4.6:4.2,hs=L==0?8:6,r={x0:-hs,x1:hs,z0:-hs,z1:hs},v=p.d.v||0;
 const wall=L==0?['rock','plank','brick'][v]:'rock'+(L==0?'':L+1);
 const sh=1.6;/* the shaft: 3.2 m square, open through floor and roof */
 ugRectRoom(b,p,r,h,y,{doors:ugDoorsFor(p,r),wall,rock:L==0?'rock':'rock'+(L+1),floor:ugFL(L),holes:[{x0:-sh,x1:sh,z0:-sh,z1:sh,both:1}],roof:L==0&&v==2?'flat':'rock'});
 /* shaft lining: timber boards up 3 m above the roof and 1.5 m down into the sump, on all four sides; the -x side
    (where you step out) is open between the guides and has the landing gate */
 for(const [ax,az,yaw] of[[0,-sh,0],[sh,0,-Math.PI/2],[0,sh,Math.PI],[-sh,0,Math.PI/2]]){
  b.box('plank',3.2,1.6,.08,ax*1.03,y-.82,az*1.03,yaw);b.box('plank',3.2,3.2,.08,ax*1.03,y+h+1.62,az*1.03,yaw);
 }
 /* the sump floor, the corner guides (steel), a collar of timber round the hole at floor level */
 b.box('black',3.2,.1,3.2,0,y-1.6,0,0);
 for(const sx of[-1,1])for(const sz of[-1,1])b.box('steel',.12,h+4.8,.12,sx*1.48,y+(h+4.8)/2-1.6,sz*1.48,0);
 /* (the two along x run the full 3.8 m; the two along z fit between them, so the corners don't overlap) */
 for(const [ax,az,yaw] of[[0,-sh-.15,0],[sh+.15,0,Math.PI/2],[0,sh+.15,0],[-sh-.15,0,Math.PI/2]])b.box('wood',yaw?2*sh:2*sh+.6,.16,.3,ax,y+.08,az,yaw);
 /* the landing gate on the -x side: a steel frame with mesh, a sign LEVEL n over it, a call box with two lights */
 const gx=-sh-.32;b.box('steel',.08,2.3,.08,gx,y+1.15,-1.3,0);b.box('steel',.08,2.3,.08,gx,y+1.15,1.3,0);b.box('steel',.1,.1,2.7,gx,y+2.3,0,0);
 for(let k=-5;k<=5;k++)b.box('steel',.02,2.1,.02,gx,y+1.13,k*.24,0);b.box('steel',.03,.05,2.6,gx,y+.3,0,0);b.box('steel',.03,.05,2.6,gx,y+1.3,0,0);
 b.box('paintY',.06,.32,1.6,gx-.02,y+2.51,0,0);   /* the LEVEL board sits on the gate's top bar */
 /* the other three sides of the shaft are fenced with steel mesh at the landing */
 for(const [ax,az,yaw] of[[0,-sh-.02,0],[sh+.02,0,Math.PI/2],[0,sh+.02,0]]){b.box('steel',2.9,.06,.05,ax,y+2.2,az,yaw);b.box('steel',2.9,.06,.05,ax,y+.25,az,yaw);for(let k=-6;k<=6;k++){const o=k*.22;b.box('steel',.025,1.95,.025,ax+(yaw?0:o),y+1.22,az+(yaw?o:0),0)}}
 /* the call box stands on its own post beside the gate (it used to hang in the air) */b.box('steel',.12,.36,.26,gx-.1,y+1.35,1.75,0);b.box('steel',.06,1.17,.06,gx-.1,y+.585,1.75,0);b.box('steel',.2,.03,.2,gx-.1,y+.015,1.75,0);
 ctx.signs.push({x:gx-.06,y:y+2.51,z:0,yaw:-Math.PI/2,txt:'LEVEL '+(L+1),w:1.5});
 /* rails from each doorway towards the shaft, stopping at a buffer 2.4 m short */
 if(L==0)for(const d of ugDoorsFor(p,r)){const vx=-d.x,vz=-d.z,l=Math.hypot(vx,vz),ex=d.x+vx/l*(l-2.6),ez=d.z+vz/l*(l-2.6);
  const t=ugRailLine(b,[[d.x,d.z],[ex,ez]],y,ctx,0);ugBuffer(b,ex,y,ez,t.T[t.T.length-1][0],t.T[t.T.length-1][1],ctx)}
 /* the version's dressing */
 const T=ugT(p);
 for(const f of p.d.fx){if(f.k=='blk')for(const q of f.pts){const w=T(q[0],q[1]);ugProp(b,f.n,w[0],y,w[1],ugYaw(p,Math.atan2(q[0],q[1])),f.r||.5,ctx)}
  if(f.k=='cribs')for(const q of f.pts){const w=T(q[0],q[1]);ugCrib(b,w[0],y,w[1],h)}}
 /* every station: a bench, the shift clock and the level map board on the walls beside the gate side */
 /* on the -x wall, facing into the room (+x), each on a thick backing board that reaches into the rock */
 if(L==0){const w=T(-hs+.06,-4.6),w2=T(-hs+.06,4.6),yaw=ugYaw(p,Math.PI/2),n=ugRot(-1,0,p.r);
  for(const [q,yy,wd,ht] of[[w,y+2.2,1.3,.44],[w2,y+1.7,1.75,1.2]])b.box('board',wd,ht,.36,q[0]+n[0]*.17,yy,q[1]+n[1]*.17,yaw);
  ctx.signs.push({x:w[0]-n[0]*.02,y:y+2.2,z:w[1]-n[1]*.02,yaw,txt:'SHIFT 6:00',w:1.2,clock:1});ctx.signs.push({x:w2[0]-n[0]*.02,y:y+1.7,z:w2[1]-n[1]*.02,yaw,txt:'LEVEL 1 MAP',w:1.6,h:1.1,map:1})}
 /* big lamps on the roof */
 for(const q of[[-hs/2,-hs/2],[hs/2,hs/2],[hs/2,-hs/2],[-hs/2,hs/2]]){const w=T(q[0],q[1]);b.cyl('wire',.01,.01,.6,w[0],y+h-.3,w[1],4);b.cyl('steel',.16,.22,.12,w[0],y+h-.62,w[1],12);b.add('glass',new THREE.SphereGeometry(.1,10,8),new THREE.Matrix4().makeTranslation(w[0],y+h-.72,w[1]));ctx.lamps.push([w[0],y+h-.8,w[1],1.4])}
}
/* small props by name (stations and later rooms): simple, solid, sitting on the floor */
function ugProp(b,n,x,y,z,yaw,r,ctx){
 if(n=='bench'){b.box('wood',1.6,.08,.4,x,y+.46,z,yaw);for(const s of[-.65,.65])b.box('woodD',.08,.44,.36,x+Math.cos(yaw)*s,y+.22,z-Math.sin(yaw)*s,yaw);return}
 if(n=='tool board'){b.box('board',1.2,1.4,.06,x,y+1.4,z,yaw);for(let i=0;i<4;i++)b.box('steel',.05,.7,.04,x+Math.cos(yaw)*(-.4+i*.27),y+1.4,z-Math.sin(yaw)*(-.4+i*.27),yaw);b.box('woodD',.1,.7,.1,x,y+.35,z,yaw);return}
 if(n=='chute'){b.box('wood',1,2.6,.9,x,y+2.4,z,yaw);b.box('woodD',.9,.08,1.2,x,y+1.0,z,yaw,-.5);return}
 if(n=='tally office'){b.box('plank',1.3,2.3,1.3,x,y+1.15,z,yaw);b.box('black',.7,.5,.02,x,y+1.5,z+.66,yaw);return}
 if(n=='lamp post'){b.box('steel',.1,2.4,.1,x,y+1.2,z,0);b.add('glass',new THREE.SphereGeometry(.12,10,8),new THREE.Matrix4().makeTranslation(x,y+2.5,z));if(ctx)ctx.lamps.push([x,y+2.4,z,.9]);return}
 b.box('woodD',2*r*.8,.9,2*r*.8,x,y+.45,z,yaw)}
/* a timber crib: logs stacked square, floor to roof */
function ugCrib(b,x,y,z,h){for(let i=0;i<Math.floor(h/.32);i++){const yy=y+.16+i*.32;if(i%2){b.box('wood',1.5,.3,.3,x,yy,z-.6,0);b.box('wood',1.5,.3,.3,x,yy,z+.6,0)}else{b.box('wood',.3,.3,1.5,x-.6,yy,z,0);b.box('wood',.3,.3,1.5,x+.6,yy,z,0)}}}

/* ---- a junction (T or crossroads) or any rect-room piece without its own dressing yet ---- */
function ugJunction(b,p,L,ctx){const y=UGLY(L),r={x0:-4,x1:4,z0:-8,z1:0};ugRectRoom(b,p,r,3.9,y,{doors:ugDoorsFor(p,r)});
 const T=ugT(p);/* heavy timber: two posts and a beam across the middle */
 for(const q of[[-3.75,-.3],[3.75,-.3],[-3.75,-7.7],[3.75,-7.7]]){const w=T(q[0],q[1]);b.box('wood',.26,3.0,.26,w[0],y+1.5,w[1],0)}
 for(const zz of[-.3,-7.7]){const a=T(-3.9,zz),c=T(3.9,zz);b.box('wood',Math.hypot(c[0]-a[0],c[1]-a[1])+.01,.3,.3,(a[0]+c[0])/2,y+3.12,(a[1]+c[1])/2,ugYX(c[0]-a[0],c[1]-a[1]))}
 /* a turn plate in the middle; rails from every doorway to its edge */
 const c=T(0,-4),ed=ugRot(0,1,p.r);ugPlate(b,c[0],y,c[1],ctx,ed[0],ed[1]);for(const q of[[0,0]].concat(p.d.ex.map(e=>[e[0],e[1]]))){const w=T(q[0],q[1]),dx=c[0]-w[0],dz=c[1]-w[1],l=Math.hypot(dx,dz);ugRailLine(b,[w,[c[0]-dx/l*.85,c[1]-dz/l*.85]],y,ctx,0)}
 /* a signpost by the far wall, pointing back the way you came (to the cage) */
 const w=T(1.9,-6.6),dx=ugRot(1,0,p.r);ctx.posts.push({x:w[0],y,z:w[1],yaw:Math.atan2(dx[0],dx[1]),dist:ctx.dist(p)})}

/* ---- the pillar round: the drive goes round a solid ore pillar ---- */
function ugRound(b,p,L,ctx){const y=UGLY(L),T=ugT(p),r={x0:-10,x1:10,z0:-26,z1:-2},v=p.d.v||0,h=3.6;
 const pil={x0:-6,x1:6,z0:-22,z1:-6};const pc=[T(pil.x0,pil.z0),T(pil.x1,pil.z1)],pb={x0:Math.min(pc[0][0],pc[1][0]),x1:Math.max(pc[0][0],pc[1][0]),z0:Math.min(pc[0][1],pc[1][1]),z1:Math.max(pc[0][1],pc[1][1])};
 /* the necks in and out, and the doors where they meet the room */
 const tw=(a,c)=>[[T(a[0],a[1])[0],y,T(a[0],a[1])[1]],[T(c[0],c[1])[0],y,T(c[0],c[1])[1]]];
 ugTube(b,tw([0,0],[0,-2]),{fil:0,rails:true,ends:ctx.ends,sets:false});const hasOut=p.d.ex.some(e=>Math.abs(e[1]+28)<.1);if(hasOut)ugTube(b,tw([0,-26],[0,-28]),{fil:0,rails:true,ends:ctx.ends,sets:false});
 const extra=[[0,-2,2]].concat(hasOut?[[0,-26,2]]:[]);
 ugRectRoom(b,p,r,h,y,{doors:ugDoorsFor(p,r,extra),blocks:[pb]});
 /* the pillar's own walls, facing the drive (corners in the order that puts the rock inside the pillar) */
 ugRoom(b,[[pb.x0,pb.z1],[pb.x1,pb.z1],[pb.x1,pb.z0],[pb.x0,pb.z0]],y,h,[],{portal:false,noCap:1});
 /* timber: cribs in the four corners, square sets along the sides */
 for(const q of[[-8,-4],[8,-4],[8,-24],[-8,-24]]){const w=T(q[0],q[1]);ugCrib(b,w[0],y,w[1],h-.1)}
 for(const zz of[-9,-14,-19])for(const sx of[-1,1]){if(sx==1&&zz==-14&&p.d.ex.some(e=>Math.abs(Math.abs(e[0])-10)<.1))continue;const a=T(sx*6.25,zz),e=T(sx*9.75,zz);for(const q of[a,e])b.box('wood',.24,h-.4,.24,q[0],y+(h-.4)/2,q[1],0);b.box('wood',Math.hypot(e[0]-a[0],e[1]-a[1])+.3,.26,.26,(a[0]+e[0])/2,y+h-.27,(a[1]+e[1])/2,ugYX(e[0]-a[0],e[1]-a[1]))}
 /* rails: turn plates where lines meet (by the entry, by the exit, by a side door), lines along the drive between them;
    the rail-loop version runs a second line down the other side */
 const W=q=>T(q[0],q[1]),side=(p.d.ex.find(e=>Math.abs(Math.abs(e[0])-10)<.1)||[0])[0],sx=Math.sign(side);
 for(const [q,lx,lz] of[[[0,-4],0,1],[[0,-24],1,0]].concat(sx?[[[8*sx,-14],0,1]]:[])){const w=W(q),d=ugRot(lx,lz,p.r);ugPlate(b,w[0],y,w[1],ctx,d[0],d[1])}
 ugRailLine(b,[W([0,-2]),W([0,-3.15])],y,ctx,0);if(hasOut)ugRailLine(b,[W([0,-24.85]),W([0,-26])],y,ctx,0);
 for(const s2 of v==1?[1,-1]:[sx||1]){if(sx&&s2==sx){ugRailLine(b,[W([.85*s2,-4]),W([8*s2,-4]),W([8*s2,-13.15])],y,ctx);ugRailLine(b,[W([8*s2,-14.85]),W([8*s2,-24]),W([.85*s2,-24])],y,ctx);ugRailLine(b,[W([10*s2,-14]),W([8.85*s2,-14])],y,ctx,0)}
  else ugRailLine(b,[W([.85*s2,-4]),W([8*s2,-4]),W([8*s2,-24]),W([.85*s2,-24])],y,ctx)}
 /* veins on the pillar, about one per 3 m of face, facing out into the drive */
 const R=ugRng(p.id*31+5);for(const [ax,az,bx,bz,ox,oz] of[[-6,-6,6,-6,0,1],[6,-6,6,-22,1,0],[6,-22,-6,-22,0,-1],[-6,-22,-6,-6,-1,0]])for(let t=.12;t<.92;t+=.2+R()*.1){if(R()<.3)continue;const len=Math.hypot(bx-ax,bz-az),yv=.9+R()*1.1,fx0=ax+(bx-ax)*t,fz0=az+(bz-az)*t,w0=T(fx0,fz0);
   /* the pillar's walls are pushed into the pillar by the noise (ugRoom): follow them */const dd=.22*Math.min(1,t*len,(1-t)*len,h+.1-yv)*ugNoise(w0[0],y+yv,w0[1])+.06;
   const w=T(fx0-ox*dd,fz0-oz*dd),d=ugRot(ox,oz,p.r);ctx.veins.push({x:w[0],y:y+yv,z:w[1],dx:d[0],dz:d[1],t:R()<.2?'ag':R()<.5?'fe':'cu'})}
 /* the version's props */
 for(const f of p.d.fx)if(f.k=='blk')for(const q of f.pts){const w=T(q[0],q[1]);if(f.n=='cart')ugCart(b,w[0],y,w[1],ugYaw(p));else if(f.n=='ore bin')ugBin(b,w[0],y,w[1],ugYaw(p));}
 /* lamps */
 for(const q of[[0,-4],[0,-24],[-8,-14],[8,-14]]){const w=T(q[0],q[1]);b.cyl('steel',.07,.09,.08,w[0],y+h-.5,w[1],10);b.cyl('wire',.008,.008,.4,w[0],y+h-.25,w[1],4);b.add('glass',new THREE.SphereGeometry(.075,10,8),new THREE.Matrix4().makeTranslation(w[0],y+h-.6,w[1]));ctx.lamps.push([w[0],y+h-.65,w[1],1])}}
/* a buffer stop: a red-painted beam on two posts where the rails end */
function ugBuffer(b,x,y,z,dx,dz,ctx){const yaw=Math.atan2(-dx,-dz),bx=x-dx*.15,bz=z-dz*.15;b.box('paintR',.9,.3,.22,bx,y+.42,bz,yaw);for(const sd of[-.3,.3])b.box('woodD',.14,.4,.14,bx+dz*sd,y+.2,bz-dx*sd,yaw);if(ctx)ctx.plates.push([x,z,.3])}
function ugCart(b,x,y,z,yaw){b.box('steel',.9,.6,1.3,x,y+.62,z,yaw);b.box('rail',.94,.06,1.34,x,y+.92,z,yaw);for(const sx of[-.35,.35])for(const sz of[-.4,.4]){const c=Math.cos(yaw),s=Math.sin(yaw);b.cyl('rail',.16,.16,.08,x+c*sx+s*sz,y+.16,z-s*sx+c*sz,12,yaw,0,Math.PI/2)}}
function ugBin(b,x,y,z,yaw){b.box('wood',.9,1.3,.9,x,y+.65,z,yaw);b.box('oreRock',.82,.12,.82,x,y+1.28,z,yaw)}

/* ---- the ladderway: an upper landing with a hatch in the floor, a timbered raise with ladders and landings every
   3 m, a lower landing with the raise coming through its roof ---- */
/* part: 'up' (the upper landing, the raise and the ladder above the lower roof: built with the upper level) or 'down'
   (the lower landing and the ladder inside it: built with the lower level, so each level's group holds everything at
   its own depth); no part = both */
function ugLadder(b,p,ctx,part){const T=ugT(p),y0=UGLY(p.L),y1=UGLY(p.L+1),h=3.9,up=part!='down',dn=part!='up';
 /* the landings are full tunnel width (4 m) so the tunnels that meet them fit their doorways exactly */
 const H={x0:-.75,x1:.75,z0:-5.35,z1:-3.85};const hc=[T(H.x0,H.z0),T(H.x1,H.z1)],hole={x0:Math.min(hc[0][0],hc[1][0]),x1:Math.max(hc[0][0],hc[1][0]),z0:Math.min(hc[0][1],hc[1][1]),z1:Math.max(hc[0][1],hc[1][1])};
 /* upper landing: the doorway from the tunnel, the hatch in the floor */
 if(up)ugRectRoom(b,p,{x0:-2,x1:2,z0:-6.5,z1:0},h,y0,{doors:[{x:p.x,z:p.z,hw:2}],holes:[Object.assign({},hole)],rock:ugRK(p.L),floor:ugFL(p.L)});
 /* lower landing: the raise comes through its roof, a doorway out at the far end */
 const ex=T(0,-8);if(dn)ugRectRoom(b,p,{x0:-2,x1:2,z0:-8,z1:-1.5},h,y1,{doors:[{x:ex[0],z:ex[1],hw:2}],holes:[Object.assign({roof:1},hole)],rock:ugRK(p.L+1),floor:ugFL(p.L+1)});
 /* the raise: four plank walls from the lower roof to the upper floor, a ladder on one side, landings every 3 m */
 const top=y0-.02,bot=y1+h+.02,cx=(hole.x0+hole.x1)/2,cz=(hole.z0+hole.z1)/2,hx=(hole.x1-hole.x0)/2,hz=(hole.z1-hole.z0)/2,hgt=top-bot;
 if(up){b.box('plank',2*hx,hgt,.06,cx,bot+hgt/2,hole.z0-.03,0);b.box('plank',2*hx,hgt,.06,cx,bot+hgt/2,hole.z1+.03,0);b.box('plank',.06,hgt,2*hz,hole.x0-.03,bot+hgt/2,cz,0);b.box('plank',.06,hgt,2*hz,hole.x1+.03,bot+hgt/2,cz,0)}
 /* the ladder runs from the lower landing's floor, up through its roof and the raise, to 1.1 m above the upper floor */
 const lx=hole.x0+.12,lt=top+1.1;for(const sx of[-.22,.22]){if(dn)b.box('wood',.06,bot-y1,.06,lx,(y1+bot)/2,cz+sx,0);if(up)b.box('wood',.06,lt-bot,.06,lx,(bot+lt)/2,cz+sx,0)}for(let yy=y1+.29;yy<top+1;yy+=.3)if(yy<bot?dn:up)b.box('wood',.04,.04,.44,lx,yy,cz,0);   /* rungs end inside the rails */
 if(up)for(let yy=bot+3;yy<top-1;yy+=3)b.box('woodD',2*hx-.7,.06,2*hz,cx+.33,yy,cz,0);
 if(dn){const c=T(0,-5.6);ctx.lamps.push([c[0],y1+2.6,c[1],.7])}
 if(!up)return;
 /* a fence round the hatch upstairs */
 for(const [a,c] of[[[hole.x0,hole.z0],[hole.x1,hole.z0]],[[hole.x1,hole.z0],[hole.x1,hole.z1]],[[hole.x0,hole.z1],[hole.x1,hole.z1]]]){const dx=Math.abs(c[0]-a[0]),dz=Math.abs(c[1]-a[1]);b.box('wood',dx?dx+.06:.06,.06,dz?dz-.06:.06,(a[0]+c[0])/2,y0+1.0,(a[1]+c[1])/2,0);}   /* the side rail fits between the end rails */
 for(const q of[[hole.x0,hole.z0],[hole.x1,hole.z0],[hole.x1,hole.z1],[hole.x0,hole.z1]])b.box('wood',.07,1.04,.07,q[0],y0+.52,q[1],0);
 ctx.lamps.push([cx,y0+2.6,cz,.8])}

/* ---- the spiral decline: a tunnel that spirals a turn and a half down round a rock core, 12 m ---- */
function ugDecline(b,p,ctx){const T=ugT(p),y0=UGLY(p.L),drop=UGLY(p.L)-UGLY(p.L+1);
 const loc=[[0,0],[0,-8]].concat(ugArc(6,-8,6,Math.PI,4*Math.PI,54).slice(1)).concat([[12,0]]);
 const L=[0];for(let i=1;i<loc.length;i++)L.push(L[i-1]+Math.hypot(loc[i][0]-loc[i-1][0],loc[i][1]-loc[i-1][1]));const tot=L[L.length-1];
 const pts=loc.map((q,i)=>{const w=T(q[0],q[1]),u=Math.max(0,Math.min(1,(L[i]-1.5)/(tot-3)));return[w[0],y0-drop*u,w[1]]});
 ugTube(b,pts,{fil:0,rails:false,lampsOut:ctx.lamps,amp:.2,rock:ugRK(p.L),floorKey:ugFL(p.L)});
 const c=T(6,-8);ctx.decl.push({x:c[0],z:c[1],y0,drop})}

/* =====================================================================================================
   BUILD A LEVEL from the plan
   ===================================================================================================== */
function ugBuildLevel(plan,L,opt){opt=opt||{};const K=ugKit(),g=new THREE.Group(),b=ugBatch();
 const ctx={lamps:[],veins:[],signs:[],posts:[],decl:[],ends:[],plates:[],solids:[],moving:[],pickups:[],hot:[],dist:null};
 /* distance to the cage along the parent chain (for signposts) */
 const len=p=>{let s=0;for(const sh of p.d.shp)if(sh.k=='path')for(let i=1;i<sh.pts.length;i++)s+=Math.hypot(sh.pts[i][0]-sh.pts[i-1][0],sh.pts[i][1]-sh.pts[i-1][1]);return s||8};
 const memo={};ctx.dist=p=>{if(p.st)return 0;if(memo[p.id]!=null)return memo[p.id];const par=plan.P[p.par];memo[p.id]=par?ctx.dist(par)+len(par):0;return memo[p.id]};
 const y=UGLY(L);
 for(const p of plan.P){
  const here=p.L==L,above=p.d.both&&p.L+1==L;if(!here&&!(above&&p.type=='ladder'))continue;
  const t=p.type;
  if(p.st){ugStationBuild(b,p,L,ctx);continue}
  if(t=='decline'){ugDecline(b,p,ctx);continue}
  if(t=='ladder'){ugLadder(b,p,ctx,here?(opt.links?null:'up'):'down');continue}
  if(t=='tee'||t=='cross'){ugJunction(b,p,L,ctx);continue}
  if(t=='round'){ugRound(b,p,L,ctx);continue}
  if(typeof ugPieceL2=='function'&&ugPieceL2(b,p,L,ctx))continue;   /* levels 2 and 3 (quarry-under-l2.js, -l3.js) */
  if(t=='old')continue;
  /* tunnels (drive, bend, collapsed, dug joins) and, for now, the rooms of batch 2 as plain shells */
  const W=ugWorld(p);
  for(const s of W.shp){
   if(s.k=='path'&&s.w<3.99){const op=ugOpenings(p);for(const [q,nb] of[[s.pts[0],s.pts[1]],[s.pts[s.pts.length-1],s.pts[s.pts.length-2]]]){if(!op.some(o=>Math.hypot(o.x-q[0],o.z-q[1])<.05))continue;const fx=q[0]-nb[0],fz=q[1]-nb[1],l=Math.hypot(fx,fz);ugBulkhead(b,q[0],y,q[1],fx/l,fz/l,s.w/2)}}
   if(s.k=='path'){const tr=ugTube(b,s.pts.map(q=>[q[0],y,q[1]]),{hw:Math.min(2,s.w/2),fil:t=='join'?3:0,rails:true,ends:ctx.ends,lampsOut:ctx.lamps,lampOff:p.id%2,broken:t=='collapsed'});
    /* a vein every 6 m or so, on alternate walls */
    if(t=='collapsed'&&typeof ugCollapsed=='function')ugCollapsed(b,p,y,ctx,tr);
    const R=ugRng(p.id*977+13);for(let sd=3+R()*3;sd<tr.L-2;sd+=5+R()*4){const side=R()<.5?-1:1,hi=R()<.5;if(R()<.35)continue;const sc=sd-((sd-1.5)%3+3)%3+1.5;const s2=Math.abs(sd-sc)<.6?sc+1.5:sd;/* not behind a timber set */
     const w=ugTubeWall(tr,ugTubeRing(tr,s2),side<0?(hi?2:1):(hi?12:13));ctx.veins.push({x:w.x,y:w.y,z:w.z,dx:w.dx,dz:w.dz,t:R()<.15?'ag':R()<.55?'fe':'cu'})}}
   else if(s.k=='rect'&&typeof ugRoomL1=='function'&&ugRoomL1(b,p,L,ctx)){}   /* the dressed rooms of batch 2 (quarry-under-l1.js) */
   else if(s.k=='rect'){const lr=p.d.shp.find(q=>q.k=='rect');const r={x0:lr.x0,x1:lr.x1,z0:lr.z0,z1:lr.z1};ugRectRoom(b,p,r,t=='stope'?5.5:3.6,y,{doors:ugDoorsFor(p,r)})}}
 }
 /* working faces at the ends where nothing fitted */
 for(const o of plan.open)if(o.cap&&o.L==L){const par=plan.P[o.par];if(!par)continue;const hw=2;const sp=ugFace(b,o.x,y,o.z,o.dir,hw,{rock:ugRK(L),floor:ugFL(L)});const R=ugRng(Math.round(o.x*13+o.z*7));for(const q of sp)if(R()<.8)ctx.veins.push({x:q[0],y:q[1],z:q[2],dx:q[3],dz:q[4],t:R()<.25?'ag':R()<.6?'fe':'cu'})}
 /* rail ends that meet nothing (another rail end, a turn plate, a buffer) get a buffer stop */
 for(const e of ctx.ends){if(ctx.ends.some(f=>f!==e&&Math.hypot(f.x-e.x,f.z-e.z)<.06&&Math.abs(f.y-e.y)<.1))continue;if(ctx.plates.some(q=>Math.hypot(q[0]-e.x,q[1]-e.z)<(q[2]||1.0)))continue;ugBuffer(b,e.x,e.y,e.z,e.dx,e.dz,ctx)}
 b.build(g,K.mat);
 /* moving parts (doors) are their own groups, pivoting where they hinge */
 for(const m of ctx.moving)g.add(m);
 /* things you can pick up (batch 5: lunchbox, tags, fossils, dynamite) are their own groups too */
 for(const m of ctx.pickups)g.add(m);
 /* veins */
 const R=ugRng(4242+L);for(const v of ctx.veins){const m=ugVein(v.t,R);m.position.set(v.x,v.y,v.z);
  m.rotation.y=Math.atan2(-v.dx,-v.dz);   /* the nuggets (local -z) face along (dx,dz), out of the rock */
  g.add(m)}
 /* signposts and wall signs */
 /* a signpost's board faces both side arms; the arrow points back towards the entry, the way to the cage */
 for(const s of ctx.posts){const d=Math.max(5,Math.round(s.dist/5)*5);const sg=ugSign(s.x,s.y,s.z,s.yaw,'⬅ CAGE '+d+' m','CAGE '+d+' m ➡');g.add(sg)}
 for(const s of ctx.signs){const sw=s.w||1.2,sh=s.h||.34,t=s.map&&typeof ugMapTex=='function'?ugMapTex(plan,L,{here:[s.x,s.z],ar:sw/sh}):ugSignTex(s.txt,sw/sh);const m=new THREE.Mesh(new THREE.PlaneGeometry(sw,sh),new THREE.MeshStandardMaterial({map:t,roughness:.8}));m.position.set(s.x,s.y,s.z);m.rotation.y=s.yaw;m.userData.noSeam=true;g.add(m)}
 return{g,lamps:ctx.lamps,veins:ctx.veins,decl:ctx.decl,solids:ctx.solids,moving:ctx.moving,pickups:ctx.pickups,hot:ctx.hot,portal:ctx.portal||null}}
