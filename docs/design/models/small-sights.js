/* =====================================================================================================
   The small sights (docs/design/small-sights.md). Needs fort-kit.js and route13.js (rtKit, rtBox).
   Desert-local coordinates, +z is north. New globals start with ss.
   ===================================================================================================== */
function ssKit(){const k=rtKit();if(k._ss)return k._ss;const M=k.M,o={};let sd=4242;const r=()=>((sd=Math.imul(sd^sd>>>15,sd|1)+0x6d2b79f5|0)>>>0)/4294967296;o.r=r;
 o.BARK=M(0xffffff,{roughness:.95,map:k.tex(64,128,(c,w,h)=>{c.fillStyle='#8a6a48';c.fillRect(0,0,w,h);for(let y=0;y<h;y+=10){c.fillStyle='rgba(50,34,20,.55)';c.fillRect(0,y,w,3);c.fillStyle='rgba(200,170,130,.25)';c.fillRect(0,y+4,w,2)}for(let i=0;i<160;i++){c.fillStyle='rgba(60,40,20,'+(.1+r()*.2)+')';c.fillRect(r()*w,r()*h,1,3+r()*6)}})});
 /* a palm frond: a central rib and leaflets either side, drawn on a transparent canvas (u = along, v = across) */
 o.FROND=M(0xffffff,{roughness:.85,side:THREE.DoubleSide,transparent:true,alphaTest:.45,map:k.tex(256,64,(c,w,h)=>{c.clearRect(0,0,w,h);for(let i=0;i<46;i++){const x=6+i*5.4,ln=(h/2-3)*Math.sin(Math.PI*(i+3)/52);for(const s of[-1,1]){c.strokeStyle=['#3f7a2c','#4a8a32','#356a26'][i%3];c.lineWidth=3.2;c.beginPath();c.moveTo(x,h/2);c.lineTo(x+9,h/2+s*ln);c.stroke()}}c.strokeStyle='#6a7a3a';c.lineWidth=3;c.beginPath();c.moveTo(0,h/2);c.lineTo(w,h/2);c.stroke()})});
 o.FROND.map.wrapS=o.FROND.map.wrapT=THREE.ClampToEdgeWrapping;
 o.NUT=M(0x5a3a1c,{roughness:.8});o.STONE=M(0x9a8e7e,{roughness:.95});o.STONE2=M(0x7a6e62,{roughness:.95});
 o.WOOD=M(0x8a6440,{roughness:.85});o.WOODD=M(0x5a3e26,{roughness:.9});o.ROPE=M(0xc8b088,{roughness:1});o.CANVAS=M(0xc8b488,{roughness:.95,side:THREE.DoubleSide});
 return k._ss=o}
/* a tapered segment from a to b (radius r1 at a, r2 at b) */
function ssSeg(g,a,b,r1,r2,m,seg){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A);const o=new THREE.Mesh(new THREE.CylinderGeometry(r2,r1,d.length(),seg||8),m);o.position.copy(A).add(B).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());o.userData.noSeam=true;g.add(o);return o}
/* a ribbon along a list of points with a width at each point, flat-ish, tilted by the frond's roll (used for fronds and the hammock) */
function ssRibbon(g,pts,wid,side,m){const pos=[],uv=[],idx=[];for(let i=0;i<pts.length;i++){const p=pts[i],w=wid[i],s=side[i];pos.push(p[0]-s[0]*w,p[1]-s[1]*w,p[2]-s[2]*w,p[0]+s[0]*w,p[1]+s[1]*w,p[2]+s[2]*w);const u=i/(pts.length-1);uv.push(u,0,u,1);if(i){const b=(i-1)*2;idx.push(b,b+1,b+2,b+1,b+3,b+2)}}
 const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));ge.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));ge.setIndex(idx);ge.computeVertexNormals();const o=new THREE.Mesh(ge,m);o.userData.noSeam=true;g.add(o);return o}
/* a date palm: a curved, tapering ringed trunk leaning `lean` (0..1) towards angle `dir`, a crown of drooping fronds,
   dead fronds hanging under them, and a cluster of coconuts. Returns the trunk's point at height y (for ropes) */
function ssPalm(g,x,z,h,lean,dir,seed){const o=ssKit(),dx=Math.cos(dir),dz=Math.sin(dir),N=9,P=[];for(let i=0;i<=N;i++){const t=i/N;P.push([x+dx*lean*h*Math.pow(t,1.7),h*t,z+dz*lean*h*Math.pow(t,1.7)])}
 for(let i=0;i<N;i++)ssSeg(g,P[i],[P[i+1][0],P[i+1][1]+.04,P[i+1][2]],.3-.14*i/N,.3-.14*(i+1)/N,o.BARK,9);
 const top=P[N],cr=new THREE.Mesh(new THREE.SphereGeometry(.24,10,8),o.BARK);cr.position.set(top[0],top[1]+.05,top[2]);g.add(cr);
 const fr=(ang,up,L,droop,w)=>{const c=Math.cos(ang),s=Math.sin(ang),pts=[],wid=[],side=[];const n=12;for(let i=0;i<=n;i++){const t=i/n,hz=L*t,y=top[1]+.1+L*(up*t-droop*t*t);pts.push([top[0]+c*hz,y,top[2]+s*hz]);wid.push(w*Math.sin(Math.PI*Math.min(1,t*1.1+.05))+.02);
  const tilt=.35;side.push([-s*Math.cos(tilt),Math.sin(tilt)*(i%2?1:1),c*Math.cos(tilt)])}return ssRibbon(g,pts,wid,side,o.FROND)};
 let a0=seed*1.7;for(let i=0;i<11;i++){const a=a0+i/11*Math.PI*2+(Math.sin(seed*7+i)*.2);fr(a,.55+.15*Math.sin(i*2.3+seed),2.6+.5*Math.sin(i*1.7+seed),1.05+.2*Math.cos(i*3.1),.42)}
 /* dead fronds: a skirt hanging down round the top of the trunk, pinned under the crown, flaring out a little at the bottom */{const yT=h-.55,t=yT/h,cx=x+dx*lean*h*Math.pow(t,1.7),cz=z+dz*lean*h*Math.pow(t,1.7),th=.22;
  for(let i=0;i<7;i++){const a=a0+.3+i/7*Math.PI*2,c=Math.cos(a),s=Math.sin(a);const dead=new THREE.Mesh(new THREE.ConeGeometry(.09,1.2,5),ssKit().WOODD);dead.position.set(cx+c*(.2+.6*Math.sin(th)),yT,cz+s*(.2+.6*Math.sin(th)));dead.rotation.set(-s*th,0,c*th);g.add(dead)}}
 for(let i=0;i<5;i++){const a=a0+i*1.3,nut=new THREE.Mesh(new THREE.SphereGeometry(.13,10,8),o.NUT);nut.position.set(top[0]+Math.cos(a)*.24,top[1]-.18-(i%2)*.12,top[2]+Math.sin(a)*.24);g.add(nut)}
 return y=>{const t=Math.min(1,y/h);return[x+dx*lean*h*Math.pow(t,1.7),y,z+dz*lean*h*Math.pow(t,1.7)]}}

/* ---- batch 1a: JEFF'S OASIS (-38, -1030). An irregular pond with a shallow sandy edge you can wade in and a dark
   middle, wet sand round it fading into the desert, reeds and flat rocks at the edge, six palms of different heights
   and leans, a hammock between two of them, Jeff's tip stand and a wooden sign.
   Returns {obs, spots:{dip, tip, hammock}, mapR}; obs covers the water, the bank round it is walkable ---- */
const SSO={x:-38,z:-1030,r:a=>6+.7*Math.sin(2*a+3.6)+.5*Math.sin(3*a+4.0)+.3*Math.sin(5*a+1),wl:-.2,cut:10,sand:null};
function ssOasis(g){const k=rtKit(),o=ssKit(),{B,C,rod,L,tube}=k.H(g),M=k.M,r=o.r,obs=[];const{x:ox,z:oz}=SSO,R=SSO.r,S=22,PX=24;
 /* ---- a real basin. The desert floor gets a square hole here (SSO.cut, see the spec) and this patch fills it: flat at
    the edges (y 0), a sandy bank that shelves down to the waterline (y SSO.wl), then the bed falls away to 1.5 m in the
    middle. Vertex colours darken the sand towards the water and tint the bed under it. The water is a see-through
    sheet at the waterline: pale in the shallows where you see the sand, dark where it is deep. ---- */
 /* the water's outline on a canvas over the 22 m square round the oasis; canvas (0,0) = (ox-11, oz-11) (top = south) */
 const poly=(c,sc,off)=>{c.beginPath();for(let i=0;i<=90;i++){const a=i/90*Math.PI*2,rr=R(a)*sc+(off||0);const px=(S/2+Math.cos(a)*rr)*PX,pz=(S/2+Math.sin(a)*rr)*PX;i?c.lineTo(px,pz):c.moveTo(px,pz)}c.closePath()};
 const H=(x,z)=>{const d=Math.hypot(x,z),s2=d-R(Math.atan2(z,x));if(s2>=.9)return 0;if(s2>=0){const t=1-s2/.9;return SSO.wl*t*t}const u=Math.min(1,-s2/2.8);return SSO.wl-1.3*u*u*(3-2*u)};
 {const N=96,ge=new THREE.PlaneGeometry(SSO.cut*2,SSO.cut*2,N,N),P2=ge.attributes.position,col=new Float32Array(P2.count*3);
  for(let i=0;i<P2.count;i++){const x=P2.getX(i),z=-P2.getY(i),y=H(x,z),d=Math.hypot(x,z),s2=d-R(Math.atan2(z,x));P2.setZ(i,y);
   let c=[1,1,1];if(s2<0){const u=Math.min(1,-s2/2.8);c=[.62-.22*u,.6-.16*u,.42-.12*u]}else if(s2<2.6){const t=1-s2/2.6;c=[1-.32*t,1-.34*t,1-.36*t]}
   col[i*3]=c[0];col[i*3+1]=c[1];col[i*3+2]=c[2]}
  /* the edges of the patch stay exactly at y 0 so it meets the desert floor without a step */
  ge.setAttribute('color',new THREE.BufferAttribute(col,3));ge.computeVertexNormals();const sm=SSO.sand?SSO.sand():M(0xffffff,{roughness:1,map:k.tex(128,128,(c,w,h)=>{c.fillStyle='#d8b07a';c.fillRect(0,0,w,h);for(let i=0;i<1600;i++){const v=150+r()*80|0;c.fillStyle='rgba('+v+','+(v*.78|0)+','+(v*.5|0)+',.35)';c.fillRect(r()*w,r()*h,1+r()*2,1)}})});
  sm.vertexColors=true;if(sm.map){sm.map=sm.map.clone();sm.map.needsUpdate=true;sm.map.wrapS=sm.map.wrapT=THREE.RepeatWrapping;sm.map.repeat.set(SSO.cut*2/10,SSO.cut*2/10)}
  const pm=new THREE.Mesh(ge,sm);pm.rotation.x=-Math.PI/2;pm.position.set(ox,0,oz);pm.userData.noSeam=true;g.add(pm)}
 /* the water sheet */{const c=document.createElement('canvas');c.width=c.height=S*PX;const x=c.getContext('2d');x.clearRect(0,0,S*PX,S*PX);
  const cols=[[150,214,196,.38],[96,186,192,.5],[58,150,178,.66],[34,112,150,.8],[22,80,118,.9],[16,60,96,.94]],N=48;for(let i=0;i<N;i++){const f=i/(N-1)*(cols.length-1),j=Math.min(cols.length-2,Math.floor(f)),u=f-j,q=cols[j].map((v,n)=>v+(cols[j+1][n]-v)*u);poly(x,1-f*.13,0);x.fillStyle='rgba('+(q[0]|0)+','+(q[1]|0)+','+(q[2]|0)+','+q[3].toFixed(3)+')';
   x.globalCompositeOperation='copy';x.save();x.clip();x.fillRect(0,0,S*PX,S*PX);x.restore();x.globalCompositeOperation='source-over'}
  x.save();poly(x,1,0);x.clip();x.strokeStyle='rgba(255,255,255,.2)';x.lineWidth=2;for(let i=0;i<120;i++){const px=r()*S*PX,py=r()*S*PX;x.beginPath();x.moveTo(px,py);x.bezierCurveTo(px+10,py-7,px+22,py+7,px+32,py);x.stroke()}x.restore();poly(x,1,0);x.strokeStyle='rgba(240,236,220,.75)';x.lineWidth=3;x.stroke();
  const t=new THREE.CanvasTexture(c);t.anisotropy=8;const wm=new THREE.Mesh(new THREE.PlaneGeometry(S,S),new THREE.MeshStandardMaterial({map:t,transparent:true,depthWrite:false,roughness:.1,metalness:.15}));wm.rotation.x=-Math.PI/2;wm.position.set(ox,SSO.wl,oz);wm.userData.noSeam=true;wm.renderOrder=2;g.add(wm)}
 /* the water is the wall (half-metre cells inside the waterline); you stand on the bank and dip your feet from there */
 {const inW=(x,z)=>Math.hypot(x,z)<R(Math.atan2(z,x));for(let zi=-20;zi<20;zi++){let run=null;for(let xi=-20;xi<=20;xi++){const ok=xi<20&&inW((xi+.5)*.5,(zi+.5)*.5);if(ok&&run==null)run=xi;if(!ok&&run!=null){obs.push({x0:ox+run*.5,x1:ox+xi*.5,z0:oz+zi*.5,z1:oz+(zi+1)*.5});run=null}}}}
 /* reeds in clumps at the edge (some cattails), flat rocks, a few lily pads */
 const RD=M(0x6a8a3a,{roughness:.9}),RD2=M(0x8a9a4a,{roughness:.9}),CT=M(0x5a3a1c,{roughness:.9});
 for(const a of[.5,1.25,2.6,3.3,4.4,5.5]){const rr=R(a);for(let j=0;j<9;j++){const aa=a+(r()-.5)*.25,d=R(aa)+(r()-.6)*.9,x=ox+Math.cos(aa)*d,z=oz+Math.sin(aa)*d,h=.7+r()*.8;const gy=H(x-ox,z-oz),rd=new THREE.Mesh(new THREE.ConeGeometry(.025,h,4),j%3?RD:RD2);rd.position.set(x,gy+h/2,z);rd.rotation.set((r()-.5)*.25,0,(r()-.5)*.25);g.add(rd);if(j%4==0){C(.035,.035,.18,x+Math.sin(rd.rotation.z)*-h*.4,gy+h*.85,z+Math.sin(rd.rotation.x)*h*.4,CT,null,null,6)}}}
 for(const[a,s]of[[.95,1],[2.2,.8],[3.9,1.2],[5.0,.9]]){const d=R(a)+.25,x=ox+Math.cos(a)*d,z=oz+Math.sin(a)*d;const rk=new THREE.Mesh(new THREE.DodecahedronGeometry(.6*s,0),o.STONE);rk.scale.set(1,.3,.75);rk.position.set(x,H(x-ox,z-oz)+.06,z);rk.rotation.y=a;g.add(rk)}
 {const LP=M(0x3a7a2a,{roughness:.6});for(const[a,f]of[[1.9,.55],[2.05,.62],[4.2,.5]]){const d=R(a)*f,p=new THREE.Mesh(new THREE.CircleGeometry(.28,12,.3,Math.PI*2-.6),LP);p.rotation.x=-Math.PI/2;p.position.set(ox+Math.cos(a)*d,SSO.wl+.006,oz+Math.sin(a)*d);g.add(p)}}
 /* six palms: [angle, extra distance past the edge, height, lean, lean direction] */
 const PALMS=[[1.05,2.4,8.2,.12,1.4],[2.27,2.2,6.4,.2,2.6],[3.05,2.4,7.4,.1,3.4],[3.75,2.3,6.8,.16,3.4],[4.71,2.5,8.6,.08,4.2],[5.58,2.2,5.8,.22,5.9]];
 const at=[];PALMS.forEach(([a,dd,h,ln,dir],i)=>{const d=R(a)+dd,x=ox+Math.cos(a)*d,z=oz+Math.sin(a)*d;at.push(ssPalm(g,x,z,h,ln,dir,i+1));obs.push({x0:x-.35,x1:x+.35,z0:z-.35,z1:z+.35})});
 /* the hammock between palms 3 and 4 (west side): striped cloth sagging on ropes tied round both trunks */
 let hm;{const p1=at[2](1.45),p2=at[3](1.45),dx=p2[0]-p1[0],dz=p2[2]-p1[2],len=Math.hypot(dx,dz),ux=dx/len,uz=dz/len;
  const HM=M(0xffffff,{roughness:.95,side:THREE.DoubleSide,map:k.tex(128,32,(c,w,h)=>{for(let i=0;i<8;i++){c.fillStyle=['#d8503a','#f0e0b0','#3a8ac8','#f0e0b0'][i%4];c.fillRect(0,i*4,w,4)}})});
  const e0=.7,e1=len-.7,pts=[],wid=[],side=[];for(let i=0;i<=14;i++){const t=i/14,s=e0+(e1-e0)*t;pts.push([p1[0]+ux*s,1.25-.55*Math.sin(Math.PI*t),p1[2]+uz*s]);wid.push(.42*(.55+.45*Math.sin(Math.PI*t)));side.push([-uz,0,ux])}ssRibbon(g,pts,wid,side,HM);
  for(const[pa,s0,sgn]of[[p1,e0,1],[p2,e1,-1]]){const ex=p1[0]+ux*s0,ez=p1[2]+uz*s0;for(const sd of[-1,1])rod([pa[0]-sgn*ux*.18,pa[1],pa[2]-sgn*uz*.18],[ex-uz*sd*.25,1.25,ez+ux*sd*.25],.012,o.ROPE);C(.21,.21,.08,pa[0],pa[1],pa[2],o.ROPE,null,null,12);rod([ex-uz*.3,1.25,ez+ux*.3],[ex+uz*.3,1.25,ez-ux*.3],.025,o.WOOD)}
  hm=[p1[0]+ux*len/2,p1[2]+uz*len/2]}
 /* Jeff's tip stand where the tip crate was (-29.5, -1026): a little counter, the jar with a few coins, a board on two posts */
 {const tx=ox+8.5,tz=oz+4;B(.9,.9,.55,tx,.45,tz,o.WOOD);B(1.0,.05,.62,tx,.925,tz,o.WOODD);for(let i=0;i<3;i++)B(.88,.02,.015,tx,.2+i*.25,tz-.28,o.WOODD);
  C(.17,.15,.34,tx,1.12,tz,M(0xcfe8f0,{transparent:true,opacity:.35,roughness:.05}),null,null,16);C(.18,.18,.03,tx,1.3,tz,M(0x8a8a8a,{metalness:.6}),null,null,16);for(let i=0;i<5;i++)C(.05,.05,.012,tx+(r()-.5)*.14,.968+i*.012,tz+(r()-.5)*.14,M(0xd8b030,{metalness:.8,roughness:.3}),null,null,10);
  for(const sd of[-1,1])B(.07,1.7,.07,tx+sd*.55,.85,tz+.42,o.WOODD);L('PLEASE TIP\n· JEFF ·',1.0,.5,'#e8d8b0','#4a2a12',60,tx,1.45,tz+.385,Math.PI);B(1.06,.56,.04,tx,1.45,tz+.42,o.WOOD);
  obs.push({x0:tx-.6,x1:tx+.6,z0:tz-.35,z1:tz+.5})}
 /* the oasis sign by the path in from the road, two posts, a carved board */
 {const sx=ox+10,sz=oz+7.5,G2=new THREE.Group();G2.position.set(sx,0,sz);G2.rotation.y=-1.0;g.add(G2);const h=k.H(G2);for(const s of[-1,1])h.B(.12,2.2,.12,s*.9,1.1,0,o.WOODD);h.B(2.1,.8,.06,0,1.75,0,o.WOOD);
  h.L("JEFF'S OASIS\nPLEASE TIP",1.9,.66,'#c8a070','#3a2010',64,0,1.75,.036,0);h.L("JEFF'S OASIS\nPLEASE TIP",1.9,.66,'#c8a070','#3a2010',64,0,1.75,-.036,Math.PI);obs.push({x0:sx-.8,x1:sx+.8,z0:sz-.8,z1:sz+.8})}
 return{obs,spots:{dip:[ox+R(0)+.5,oz],tip:[ox+8.5,oz+4],hammock:hm},mapR:[[ox,oz,6.2,'#3a90b8']]}}

/* ---- batch 1b: the WISHING WELL (-22, -1095). A round stone well with a capstone rim, dark water with coins glinting,
   two timber posts carrying a shingled gable roof, a windlass with a crank and a rope, and a bucket on the rope.
   parts:{bucket, rope, drum, crank}: call ssWellTick(W, k) with k 0 (bucket up at the rim) .. 1 (down in the water) ---- */
const SSW={x:-22,z:-1095};
function ssWell(g){const k=rtKit(),o=ssKit(),{B,C,rod,L,tube,slab}=k.H(g),M=k.M,r=o.r,obs=[];const{x:wx,z:wz}=SSW;
 const ST=M(0xffffff,{roughness:.95,map:k.tex(256,64,(c,w,h)=>{c.fillStyle='#6e655a';c.fillRect(0,0,w,h);for(let y=0;y<h;y+=16)for(let x=((y/16)%2)*14;x<w+28;x+=28){c.fillStyle=['#a89a86','#9a8c78','#b4a690','#8e8070'][(x*7+y)%4];c.fillRect(x+1,y+1,26,14)}})});ST.map.repeat.set(3,1);
 /* the drum (open cylinder, outside and inside), a stone cap ring, a dark shaft with the water low down */
 const out=new THREE.Mesh(new THREE.CylinderGeometry(1.15,1.2,.9,24,1,true),ST);out.position.set(wx,.45,wz);g.add(out);const inn=new THREE.Mesh(new THREE.CylinderGeometry(.85,.85,.93,24,1,true),M(0x3a342e,{roughness:1,side:THREE.BackSide}));inn.position.set(wx,.465,wz);g.add(inn);
 const cap=new THREE.Mesh(new THREE.RingGeometry(.82,1.24,24),M(0xb0a490,{roughness:.9}));cap.rotation.x=-Math.PI/2;cap.position.set(wx,.93,wz);g.add(cap);const cp2=new THREE.Mesh(new THREE.CylinderGeometry(1.24,1.24,.06,24,1,true),M(0xb0a490,{roughness:.9}));cp2.position.set(wx,.9,wz);g.add(cp2);
 const wc=document.createElement('canvas');wc.width=wc.height=128;const x=wc.getContext('2d'),gr=x.createRadialGradient(64,64,4,64,64,64);gr.addColorStop(0,'#0e2a30');gr.addColorStop(1,'#050c10');x.fillStyle=gr;x.fillRect(0,0,128,128);for(let i=0;i<14;i++){x.fillStyle='rgba(230,190,60,'+(.5+r()*.5)+')';x.beginPath();x.arc(30+r()*68,30+r()*68,2+r()*2,0,7);x.fill()}
 const wt=new THREE.Mesh(new THREE.CircleGeometry(.85,24),M(0xffffff,{map:new THREE.CanvasTexture(wc),roughness:.05,metalness:.3}));wt.rotation.x=-Math.PI/2;wt.position.set(wx,.18,wz);g.add(wt);
 obs.push({x0:wx-1.2,x1:wx+1.2,z0:wz-1.2,z1:wz+1.2});
 /* two posts on stone footings either side (x ±1.32), a cross tie at the top, the roof: two shingled slopes on a ridge */
 for(const s of[-1,1]){B(.18,2.55,.18,wx+s*1.32,1.275,wz,o.WOODD);B(.36,.25,.36,wx+s*1.32,.125,wz,o.STONE2);obs.push({x0:wx+s*1.32-.15,x1:wx+s*1.32+.15,z0:wz-.15,z1:wz+.15})}
 B(2.9,.14,.16,wx,2.47,wz,o.WOODD);B(3.2,.12,.12,wx,3.12,wz,o.WOODD);for(const s of[-1,1])rod([wx+s*1.32,2.55,wz],[wx+s*1.32,3.06,wz],.06,o.WOODD);
 const SH=M(0xffffff,{roughness:.9,side:THREE.DoubleSide,map:k.tex(128,128,(c,w,h)=>{c.fillStyle='#6a4a30';c.fillRect(0,0,w,h);for(let y=0;y<h;y+=16)for(let xx=((y/16)%2)*10;xx<w;xx+=20){c.fillStyle=['#8a5a38','#7a5032','#946240'][(xx+y)%3];c.fillRect(xx+1,y+1,18,14);c.fillStyle='rgba(0,0,0,.3)';c.fillRect(xx+1,y+13,18,2)}})});SH.map.repeat.set(2,1);
 for(const s of[-1,1]){const pl=new THREE.Mesh(new THREE.BoxGeometry(3.4,.05,1.25),SH);pl.position.set(wx,3.12-.32,wz+s*.52);pl.rotation.x=s*.62;g.add(pl)}
 for(const s of[-1,1]){const gp=slab([[-.95,0],[.95,0],[0,.68]],.04,o.WOOD,wx+s*1.6,2.48,wz,Math.PI/2)}
 /* the windlass: an axle through both posts, a drum with the rope wound on it, a crank on the east end */
 const drum=new THREE.Group();drum.position.set(wx,2.0,wz);g.add(drum);{const h=k.H(drum);h.C(.035,.035,2.98,0,0,0,k.STL,'x',null,8);h.C(.13,.13,1.1,0,0,0,o.WOODD,'x',null,12);h.C(.15,.15,.7,0,0,0,o.ROPE,'x',null,14)}
 const crank=new THREE.Group();crank.position.set(wx+1.48,2.0,wz);g.add(crank);{const h=k.H(crank);h.B(.04,.42,.06,0,-.19,0,k.STL);h.C(.03,.03,.22,.11,-.38,0,o.WOODD,'x',null,8)}
 /* the rope hangs from the front of the drum (z -.15) to the bucket's bail; rope length set by ssWellTick */
 const rope=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,1,6),o.ROPE);rope.geometry.translate(0,-.5,0);rope.position.set(wx,2.0,wz-.15);g.add(rope);
 const bucket=new THREE.Group();g.add(bucket);{const h=k.H(bucket);const BK=M(0x7a5a36,{roughness:.8,side:THREE.DoubleSide});const bw=new THREE.Mesh(new THREE.CylinderGeometry(.2,.16,.32,14,1,true),BK);bw.position.y=-.36;bucket.add(bw);h.C(.16,.16,.02,0,-.51,0,BK,null,null,14);
  for(const y of[-.24,-.47])h.C(.205-(y+.24)*.17,.205-(y+.24)*.17,.025,0,y,0,k.STL,null,null,14,true);const bail=new THREE.Mesh(new THREE.TorusGeometry(.2,.01,5,12,Math.PI),k.STL);bail.position.y=-.2;bucket.add(bail)}
 const W={parts:{bucket,rope,drum,crank}};ssWellTick(W,0);
 /* a little sign on a stake */{const sg=new THREE.Group();sg.position.set(wx+1.0,0,wz-1.7);sg.rotation.y=Math.PI+.3;g.add(sg);const h=k.H(sg);h.B(.07,1.0,.07,0,.5,0,o.WOODD);h.B(.7,.36,.04,0,1.0,.04,o.WOOD);h.L('WISHES 1 🪙\nREFUNDS: NEVER',.64,.3,'#e8d8b0','#3a2010',44,0,1.0,.066,0)}
 return{obs,parts:W.parts,W,spots:{toss:[wx,wz],bucket:[wx,wz-2]},mapR:[[wx,wz,1.3,'#8a7a6a']]}}
/* k = 0: bucket up, hanging just above the rim; 1: down at the water (inside the well) */
function ssWellTick(W,k){const p=W.parts,top=2.0,len=.5+k*1.1;p.rope.scale.y=len;p.bucket.position.set(p.rope.position.x,top-len,p.rope.position.z);p.drum.rotation.x=-k*14;p.crank.rotation.x=-k*14}

/* ---- batch 1c: the CAMPFIRE (18, -1105). A fire ring of rough stones round an ash bed, charred logs in a teepee and
   glowing embers (the base's flame sprite and light stay), a ridge tent with guy ropes and pegs where the old tent
   was, two log benches on stumps (both solid), the guitar leaning on the first bench, a cooler, a kettle on a flat
   stone, string lights between two poles. parts:{embers} (flicker their emissiveIntensity) ---- */
const SSC={x:18,z:-1105};
function ssCampfire(g){const k=rtKit(),o=ssKit(),{B,C,rod,L,tube}=k.H(g),M=k.M,r=o.r,obs=[],lights=[];const{x:fx,z:fz}=SSC;
 /* ash bed, the ring of stones, charred logs, embers */
 {const ash=new THREE.Mesh(new THREE.CircleGeometry(.75,20),M(0x3a3632,{roughness:1,polygonOffset:true,polygonOffsetUnits:-2}));ash.rotation.x=-Math.PI/2;ash.position.set(fx,.012,fz);ash.userData.noSeam=true;g.add(ash)}
 for(let i=0;i<11;i++){const a=i/11*Math.PI*2+r()*.15,d=.92+r()*.08,st=new THREE.Mesh(new THREE.DodecahedronGeometry(.2+r()*.06,0),i%2?o.STONE:o.STONE2);st.scale.set(1,.7+r()*.2,1);st.position.set(fx+Math.cos(a)*d,.11,fz+Math.sin(a)*d);st.rotation.set(r()*3,r()*3,0);g.add(st)}
 const CH=M(0x2a1e16,{roughness:.9});for(let i=0;i<5;i++){const a=i/5*Math.PI*2+.4;ssSeg(g,[fx+Math.cos(a)*.62,.04,fz+Math.sin(a)*.62],[fx+Math.cos(a)*.08,.62,fz+Math.sin(a)*.08],.07,.05,CH,7)}
 const EM=M(0x2a0a00,{emissive:0xff5010,emissiveIntensity:1.2,roughness:.8});const embers=[];for(let i=0;i<14;i++){const a=r()*Math.PI*2,d=r()*.45;const e=new THREE.Mesh(new THREE.DodecahedronGeometry(.05+r()*.04,0),EM);e.position.set(fx+Math.cos(a)*d,.04,fz+Math.sin(a)*d);g.add(e);embers.push(e)}
 obs.push({x0:fx-1,x1:fx+1,z0:fz-1,z1:fz+1});
 /* the ridge tent (same spot and turn as before: (fx+4, fz-2), turned -0.6), door at the front (+z), flap tied back */
 {const t=new THREE.Group();t.position.set(fx+4,0,fz-2);t.rotation.y=-.6;g.add(t);const h=k.H(t),W=1.25,Hh=1.5,Ln=3.0;
  const TC=M(0xffffff,{roughness:.95,side:THREE.DoubleSide,map:k.tex(64,64,(c,w,hh)=>{c.fillStyle='#c4a874';c.fillRect(0,0,w,hh);for(let i=0;i<300;i++){c.fillStyle='rgba(120,90,50,.12)';c.fillRect(r()*w,r()*hh,2,1)}c.fillStyle='rgba(90,60,30,.25)';c.fillRect(0,0,w,2)})});
  /* the two slopes: flat sheets laid in a group tilted to the roof pitch */const sl=Math.hypot(W,Hh),ang=Math.atan2(Hh,W);for(const s of[-1,1]){const q2=new THREE.Group();q2.position.set(s*W/2,Hh/2,0);q2.rotation.z=-s*ang;t.add(q2);const p=new THREE.Mesh(new THREE.PlaneGeometry(sl,Ln),TC);p.rotation.x=-Math.PI/2;q2.add(p)}
  const tri=(z,col)=>{const sh=new THREE.Shape([new THREE.Vector2(-W,0),new THREE.Vector2(W,0),new THREE.Vector2(0,Hh)]);const m=new THREE.Mesh(new THREE.ShapeGeometry(sh),col);m.position.set(0,0,z);t.add(m);return m};tri(-Ln/2,TC);
  {const sh=new THREE.Shape([new THREE.Vector2(-W,0),new THREE.Vector2(-.12,0),new THREE.Vector2(-.12,Hh*.9),new THREE.Vector2(0,Hh)]);const m=new THREE.Mesh(new THREE.ShapeGeometry(sh),TC);m.position.set(0,0,Ln/2);t.add(m);
   const fl=new THREE.Shape([new THREE.Vector2(0,0),new THREE.Vector2(.55,0),new THREE.Vector2(0,Hh*.92)]);const f=new THREE.Mesh(new THREE.ShapeGeometry(fl),TC);f.position.set(.15,0,Ln/2+.02);f.rotation.y=-.9;t.add(f)}
  const inside=new THREE.Mesh(new THREE.PlaneGeometry(2.4,Ln),M(0x5a4a3a,{roughness:1,polygonOffset:true,polygonOffsetUnits:-2}));inside.rotation.x=-Math.PI/2;inside.position.set(0,.012,0);inside.userData.noSeam=true;t.add(inside);
  for(const z of[-Ln/2-.02,Ln/2+.02])h.C(.025,.025,Hh+.12,0,(Hh+.12)/2,z,o.WOODD,null,null,6);h.C(.02,.02,Ln+.1,0,Hh+.005,0,o.WOODD,'z',null,6);
  for(const z of[-Ln/2,Ln/2]){rod([0,Hh+.1,z+(z>0?.02:-.02)],[0,.02,z+(z>0?1.0:-1.0)],.008,o.ROPE);h.C(.015,.012,.18,0,.07,z+(z>0?1.0:-1.0),k.STL,null,null,5)}
  for(const s of[-1,1])for(const z of[-1,0,1]){rod([s*W*.62,Hh*.38,z*1.2],[s*(W+.55),.02,z*1.2],.006,o.ROPE);h.C(.015,.012,.16,s*(W+.55),.06,z*1.2,k.STL,null,null,5)}}
 /* two log benches on stumps, at the old bench spots and turns; both are obstacles now */
 const LG=M(0xffffff,{roughness:.9,map:k.tex(128,32,(c,w,h)=>{c.fillStyle='#6a4a2c';c.fillRect(0,0,w,h);for(let i=0;i<70;i++){c.fillStyle='rgba(40,24,12,'+(.15+r()*.25)+')';c.fillRect(r()*w,r()*h,4+r()*20,1)}})}),END=M(0xc8a070,{roughness:.9});
 const bench=(bx,bz,ry,ln)=>{const b=new THREE.Group();b.position.set(bx,0,bz);b.rotation.y=ry;g.add(b);const h=k.H(b);h.C(.2,.2,ln,0,.46,0,LG,'x',null,12);for(const s of[-1,1]){const e=h.C(.198,.198,.01,s*(ln/2+.004),.46,0,END,'x',null,12);h.C(.18,.22,.3,s*(ln/2-.35),.15,0,LG,null,null,10)}
  const c=Math.abs(Math.cos(ry))*ln/2+.25,s2=Math.abs(Math.sin(ry))*ln/2+.25;obs.push({x0:bx-c,x1:bx+c,z0:bz-s2,z1:bz+s2})};
 bench(fx-2.2,fz+1.2,.4,2.4);bench(fx+2.8,fz+2.4,-1.1,2.2);
 /* the guitar, leaning against the first bench (rest of the old guitar's prop stays) */
 {const gt=new THREE.Group();gt.position.set(fx-2.6,0,fz+1.62);gt.rotation.y=.4;g.add(gt);const h=k.H(gt),GW=M(0xb07030,{roughness:.6}),GD=M(0x3a2a1a);const body=new THREE.Group();body.rotation.x=-.32;gt.add(body);const bh=k.H(body);
  for(const[y,rr]of[[.22,.21],[.5,.17]]){const c=new THREE.Mesh(new THREE.CylinderGeometry(rr,rr,rr>.2?.1:.08,18),GW);c.rotation.x=Math.PI/2;c.position.set(0,y,0);body.add(c)}const hole=new THREE.Mesh(new THREE.CircleGeometry(.06,14),M(0x1a1a1a));hole.position.set(0,.41,.06);body.add(hole);
  bh.B(.07,.62,.04,0,.92,.0,GD);bh.B(.1,.18,.03,0,1.3,0,GD);for(let i=0;i<4;i++)bh.B(.004,.95,.004,-.024+i*.016,.86,.064,M(0xe0e0e0,{metalness:.8}))}
 /* a cooler, a kettle on a flat stone at the ring, a stack of firewood */
 {B(.62,.42,.4,fx-1.7,.21,fz-1.9,M(0x2a6ac8,{roughness:.5}));B(.64,.06,.42,fx-1.7,.45,fz-1.9,M(0xf0f0f0,{roughness:.5}));B(.3,.03,.03,fx-1.7,.5,fz-1.9,M(0xf0f0f0));obs.push({x0:fx-2.05,x1:fx-1.35,z0:fz-2.15,z1:fz-1.65})}
 {const ks=new THREE.Mesh(new THREE.DodecahedronGeometry(.26,0),o.STONE);ks.scale.set(1,.35,1);ks.position.set(fx+1.25,.07,fz-.5);g.add(ks);C(.12,.15,.18,fx+1.25,.25,fz-.5,M(0x3a3a3a,{metalness:.5,roughness:.4}),null,null,14);C(.04,.06,.06,fx+1.25,.37,fz-.5,M(0x3a3a3a,{metalness:.5}),null,null,10);ssSeg(g,[fx+1.36,.24,fz-.5],[fx+1.48,.34,fz-.5],.025,.015,M(0x3a3a3a,{metalness:.5}),6);const hd=new THREE.Mesh(new THREE.TorusGeometry(.1,.008,4,10,Math.PI),k.STL);hd.position.set(fx+1.25,.4,fz-.5);g.add(hd)}
 for(let i=0;i<6;i++){const y=.08+(i>2?.15:0),zz=fz+3.2+(i%3)*.17-(i>2?-.08:0);C(.08,.08,.7,fx-.6,y,zz,LG,'x',null,8)}
 /* string lights: two poles and a sagging string with glowing bulbs (lights: one soft point for the game) */
 {const a=[fx-3.4,fz-2.6],b=[fx+1.4,fz-4.2];for(const p of[a,b]){C(.04,.05,2.6,p[0],1.3,p[1],o.WOODD,null,null,8);C(.09,.09,.08,p[0],.04,p[1],o.STONE2,null,null,8)}
  const pts=[];for(let i=0;i<=16;i++){const t=i/16;pts.push([a[0]+(b[0]-a[0])*t,2.5-.45*Math.sin(Math.PI*t),a[1]+(b[1]-a[1])*t])}tube(pts,.008,M(0x202020),null,24);
  for(let i=1;i<16;i+=1.5){const t=i/16,p=[a[0]+(b[0]-a[0])*t,2.5-.45*Math.sin(Math.PI*t)-.07,a[1]+(b[1]-a[1])*t];const bu=new THREE.Mesh(new THREE.SphereGeometry(.045,8,6),M(0xfff0c0,{emissive:['#ffd890','#ff9a70','#a0e0ff'][(i*2|0)%3],emissiveIntensity:1.1}));bu.position.set(...p);g.add(bu);C(.006,.006,.06,p[0],p[1]+.045,p[2],M(0x202020),null,null,4)}
  lights.push([(a[0]+b[0])/2,2.0,(a[1]+b[1])/2]);for(const p of[a,b])obs.push({x0:p[0]-.1,x1:p[0]+.1,z0:p[1]-.1,z1:p[1]+.1})}
 return{obs,lights,parts:{embers},spots:{warm:[fx,fz],marsh:[fx-1.2,fz+.9],guitar:[fx-2.6,fz+2.2]},mapR:[[fx,fz,1.2,'#5a4a3a']]}}
