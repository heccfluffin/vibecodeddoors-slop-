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
   and a cluster of coconuts. Returns the trunk's point at height y (for ropes) */
function ssPalm(g,x,z,h,lean,dir,seed){const o=ssKit(),dx=Math.cos(dir),dz=Math.sin(dir),N=9,P=[];for(let i=0;i<=N;i++){const t=i/N;P.push([x+dx*lean*h*Math.pow(t,1.7),h*t,z+dz*lean*h*Math.pow(t,1.7)])}
 for(let i=0;i<N;i++)ssSeg(g,P[i],[P[i+1][0],P[i+1][1]+.04,P[i+1][2]],.3-.14*i/N,.3-.14*(i+1)/N,o.BARK,9);
 const top=P[N],cr=new THREE.Mesh(new THREE.SphereGeometry(.24,10,8),o.BARK);cr.position.set(top[0],top[1]+.05,top[2]);g.add(cr);
 const fr=(ang,up,L,droop,w)=>{const c=Math.cos(ang),s=Math.sin(ang),pts=[],wid=[],side=[];const n=12;for(let i=0;i<=n;i++){const t=i/n,hz=L*t,y=top[1]+.1+L*(up*t-droop*t*t);pts.push([top[0]+c*hz,y,top[2]+s*hz]);wid.push(w*Math.sin(Math.PI*Math.min(1,t*1.1+.05))+.02);
  const tilt=.35;side.push([-s*Math.cos(tilt),Math.sin(tilt)*(i%2?1:1),c*Math.cos(tilt)])}return ssRibbon(g,pts,wid,side,o.FROND)};
 let a0=seed*1.7;for(let i=0;i<11;i++){const a=a0+i/11*Math.PI*2+(Math.sin(seed*7+i)*.2);fr(a,.55+.15*Math.sin(i*2.3+seed),2.6+.5*Math.sin(i*1.7+seed),1.05+.2*Math.cos(i*3.1),.42)}

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
  /* the front: two side panels and a triangular doorway in the middle; both door flaps are rolled up and tied back along the doorway's edges */for(const sd of[-1,1]){const sh=new THREE.Shape([new THREE.Vector2(sd*W,0),new THREE.Vector2(sd*.5,0),new THREE.Vector2(0,Hh)]);const m=new THREE.Mesh(new THREE.ShapeGeometry(sh),TC);m.position.set(0,0,Ln/2);t.add(m);
   const fa=[sd*.5,.04,Ln/2+.045],fb=[sd*.06,Hh-.12,Ln/2+.045];ssSeg(t,fa,fb,.055,.035,TC,8);for(const u of[.3,.65]){const p=[fa[0]+(fb[0]-fa[0])*u,fa[1]+(fb[1]-fa[1])*u,fa[2]];h.C(.062-.02*u,.062-.02*u,.03,p[0],p[1],p[2],o.ROPE,null,null,8).rotation.z=Math.atan2(fb[0]-fa[0],fb[1]-fa[1])*-1}}
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

/* ---- batch 2a: the WIND PUMP (-55, -1000). A classic farm windmill: a four-leg steel tower on concrete feet (feet at
   2.0 m from the centre on the diagonals, 0.32 m at the 9 m top, as before) with girts and X braces, a ladder up the
   east face to a railed platform under the wheel, the gearbox head on a turntable, an 18-blade wheel facing south (out in front of the platform rail, on a longer shaft), a
   tail vane painted OLD TOWN, the pump rod down the middle to the pump head, a pipe and spout to a round galvanised
   stock tank, and the hand crank on a stand OUTSIDE the tower (west side).
   parts:{wheel (spin about its z), crank (spin about x), water (raise it a little while pumping)}, spots:{crank, spout} ---- */
const SSP={x:-55,z:-1000,top:9};
function ssWindPump(g){const k=rtKit(),o=ssKit(),{B,C,rod,L,tube}=k.H(g),M=k.M,r=o.r,obs=[];const{x:px,z:pz,top}=SSP;
 const ST=M(0x8a9094,{metalness:.55,roughness:.45}),STD=M(0x5a6064,{metalness:.5,roughness:.5}),GAL=M(0xb8bec2,{metalness:.6,roughness:.35});
 const rad=y=>2.0+(.32-2.0)*y/top,LG=[[1,1],[-1,1],[-1,-1],[1,-1]].map(([a,b])=>[a/Math.SQRT2,b/Math.SQRT2]),at=(i,y)=>[px+LG[i][0]*rad(y),y,pz+LG[i][1]*rad(y)];
 for(let i=0;i<4;i++){ssSeg(g,at(i,.3),at(i,top),.06,.045,ST,8);const f=at(i,0);B(.5,.3,.5,f[0],.15,f[2],o.STONE2);obs.push({x0:f[0]-.3,x1:f[0]+.3,z0:f[2]-.3,z1:f[2]+.3})}
 for(let i=0;i<4;i++){const j=(i+1)%4;for(const y of[2.6,5.6,8.2])rod(at(i,y),at(j,y),.03,ST,null,6);for(const[y0,y1]of[[.3,2.6],[2.6,5.6],[5.6,8.2]]){rod(at(i,y0),at(j,y1),.012,STD,null,4);rod(at(j,y0),at(i,y1),.012,STD,null,4)}}
 /* ladder up the east face (leaning with it), to the platform */{const lx0=px+rad(0)/Math.SQRT2+.14,lx1=px+rad(8.2)/Math.SQRT2+.14;for(const sz of[-.2,.2])rod([lx0,0,pz+sz],[lx1,8.2+.9,pz+sz],.02,ST,null,6);
  for(let y=.3;y<8.2;y+=.3){const x=lx0+(lx1-lx0)*y/8.2;rod([x,y,pz-.2],[x,y,pz+.2],.012,ST,null,4)}for(const y of[2.6,5.6]){const x=lx0+(lx1-lx0)*y/8.2;for(const sz of[-.2,.2])rod([x,y,pz+sz],[px+rad(y)/Math.SQRT2,y,pz+sz],.012,ST,null,4)}}
 /* the platform under the wheel: grating on a square frame (a gap on the east side for the ladder), posts and a rail */
 {const GR=M(0x6a7074,{metalness:.5,roughness:.6}),Y=8.2,h=.95;for(const[w,d,x,z]of[[1.9,.5,px,pz-.7],[1.9,.5,px,pz+.7],[.5,.9,px-.7,pz],[.25,.9,px+.82,pz]])B(w,.04,d,x,Y,z,GR);
  for(const[a,b]of[[-1,-1],[1,-1],[1,1],[-1,1]])B(.05,h,.05,px+a*.93,Y+h/2,pz+b*.93,ST);for(const[w,d,x,z]of[[1.86,.03,px,pz-.93],[1.86,.03,px,pz+.93],[.03,1.8,px-.93,pz],[.03,.46,px+.93,pz-.68],[.03,.46,px+.93,pz+.68]]){B(w,.03,d,x,Y+h-.02,z,ST);B(w,.025,d,x,Y+h/2,z,ST)}}
 /* head: turntable, gearbox casing, the shaft out to the wheel (south) and the tail boom (north) */
 C(.36,.36,.08,px,top+.04,pz,STD,null,null,16);B(.46,.42,.8,px,top+.29,pz,M(0x6a7076,{metalness:.5,roughness:.45}));C(.23,.23,.82,px,top+.5,pz,M(0x6a7076,{metalness:.5,roughness:.45}),'z',null,14);C(.05,.05,1.0,px,top+.3,pz-.88,ST,'z',null,8);
 const wheel=new THREE.Group();wheel.position.set(px,top+.3,pz-1.4);g.add(wheel);{const h=k.H(wheel);h.C(.16,.16,.22,0,0,0,STD,'z',null,12);for(const rr of[.55,1.75]){const t=new THREE.Mesh(new THREE.TorusGeometry(rr,.025,5,40),ST);wheel.add(t)}
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2;h.rod([Math.cos(a)*.15,Math.sin(a)*.15,0],[Math.cos(a)*1.75,Math.sin(a)*1.75,0],.02,ST,null,4)}
  for(let i=0;i<18;i++){const bg=new THREE.Group();bg.rotation.z=i/18*Math.PI*2;wheel.add(bg);const bl=new THREE.Mesh(new THREE.BoxGeometry(.3,1.2,.012),GAL);bl.position.set(0,1.15,0);bl.rotation.y=.45;bl.scale.x=1;bg.add(bl)}}
 rod([px,top+.4,pz+.4],[px,top+.45,pz+2.4],.035,ST,null,6);rod([px,top+.15,pz+.3],[px,top+.4,pz+1.6],.02,ST,null,4);rod([px,top+.62,pz+.3],[px,top+.48,pz+1.6],.02,ST,null,4);
 B(.03,1.0,1.5,px,top+.45,pz+2.9,M(0xc8302a,{roughness:.6}));L('OLD TOWN',1.4,.5,null,'#f4ead2',90,px+.017,top+.45,pz+2.9,Math.PI/2);L('OLD TOWN',1.4,.5,null,'#f4ead2',90,px-.017,top+.45,pz+2.9,-Math.PI/2);
 /* pump rod down the middle, the pump head (standpipe) at the bottom, the pipe to the tank and its spout */
 C(.02,.02,top-1.2,px,(top+1.2)/2+.05,pz,ST,null,null,6);C(.09,.11,1.25,px,.625,pz,STD,null,null,12);C(.14,.14,.12,px,1.3,pz,STD,null,null,12);B(.3,.3,.3,px,.15,pz,o.STONE2);
 /* the pipe runs out over the tank's rim and turns down: an elbow, a short spout with a flared mouth; a post holds it up outside the tank */C(.045,.045,2.9,px+1.45,.9,pz+.5,GAL,'x',null,8);rod([px,.9,pz],[px,.9,pz+.5],.045,GAL,null,8);const elb=new THREE.Mesh(new THREE.SphereGeometry(.055,10,8),GAL);elb.position.set(px+2.92,.9,pz+.5);g.add(elb);C(.045,.045,.2,px+2.92,.8,pz+.5,GAL,null,null,8);C(.065,.045,.07,px+2.92,.675,pz+.5,GAL,null,null,10,true);
 C(.06,.06,.08,px+1.0,.9,pz+.5,GAL,'x',null,8);B(.08,.86,.08,px+2.25,.43,pz+.5,STD);B(.14,.04,.14,px+2.25,.02,pz+.5,STD);
 obs.push({x0:px-.25,x1:px+.25,z0:pz-.25,z1:pz+.25});
 /* the stock tank: a round corrugated steel ring, a rolled rim, the water inside */
 const tx=px+3.7,tz=pz+.5,TR=1.2;{const CR=M(0xffffff,{metalness:.55,roughness:.4,side:THREE.DoubleSide,map:k.tex(128,16,(c,w,h)=>{for(let x=0;x<w;x++){const v=180+Math.sin(x/w*Math.PI*16)*40|0;c.fillStyle='rgb('+v+','+(v+4)+','+(v+8)+')';c.fillRect(x,0,1,h)}})});CR.map.repeat.set(4,1);
  const ring=new THREE.Mesh(new THREE.CylinderGeometry(TR,TR,.62,40,1,true),CR);ring.position.set(tx,.31,tz);g.add(ring);const rim=new THREE.Mesh(new THREE.TorusGeometry(TR,.03,6,40),GAL);rim.rotation.x=Math.PI/2;rim.position.set(tx,.62,tz);g.add(rim);
  const bot=new THREE.Mesh(new THREE.CircleGeometry(TR-.01,32),M(0x5a6a6a,{roughness:.8}));bot.rotation.x=-Math.PI/2;bot.position.set(tx,.04,tz);g.add(bot)}
 const water=new THREE.Mesh(new THREE.CircleGeometry(TR-.02,32),M(0x3a90b8,{roughness:.08,metalness:.2,transparent:true,opacity:.85}));water.rotation.x=-Math.PI/2;water.position.set(tx,.42,tz);g.add(water);
 obs.push({x0:tx-TR,x1:tx+TR,z0:tz-TR,z1:tz+TR});
 /* the hand crank, outside on the west: a post, a gearbox, the crank wheel with a handle; a shaft runs in to the pump head */
 const cx=px-2.7,cz=pz;B(.14,.75,.14,cx,.375,cz,STD);B(.42,.4,.36,cx,.9,cz,M(0x4a5054,{metalness:.5,roughness:.5}));rod([cx+.21,.9,cz],[px-.1,.9,cz],.025,ST,null,6);rod([px-.1,.9,cz],[px-.1,1.0,cz],.02,ST,null,4);
 const crank=new THREE.Group();crank.position.set(cx-.3,.9,cz);g.add(crank);{const h=k.H(crank);const wh=new THREE.Mesh(new THREE.TorusGeometry(.3,.025,6,20),M(0x8a2a20,{metalness:.4,roughness:.5}));wh.rotation.y=Math.PI/2;crank.add(wh);for(const a of[0,Math.PI/3,2*Math.PI/3])h.rod([0,Math.cos(a)*.29,Math.sin(a)*.29],[0,-Math.cos(a)*.29,-Math.sin(a)*.29],.012,M(0x8a2a20,{metalness:.4}),null,6);h.C(.05,.05,.12,.03,0,0,STD,'x',null,10);h.C(.025,.025,.16,-.08,.28,0,M(0x3a2a1a),'x',null,8)}
 rod([cx-.05,.9,cz],[cx-.24,.9,cz],.03,ST,null,6);obs.push({x0:cx-.3,x1:cx+.25,z0:cz-.25,z1:cz+.25});
 return{obs,parts:{wheel,crank,water},spots:{crank:[cx-.9,cz],spout:[px+2.92,.55,pz+.5],tank:[tx,tz]},mapR:[[px,pz,2.2,'#8a8a8a'],[tx,tz,TR,'#3a90b8']]}}

/* ---- batch 2b: the RADIO MAST (-62, -905) and its hut. A 28 m triangular lattice mast (legs 1.4 m from the centre at
   the ground, 0.25 at the top, as before) with girts and zigzag braces, a caged ladder up the east face (towards the hut) to a
   railed platform at 16 m (where the climb perch is), whip aerials, panel antennas and a dish near the top, the
   blinking beacon (parts.beacon, parts.glow: the base's blink code), guy wires from two heights on each leg to three
   concrete anchors. The hut (x -59..-55, z -905.7..-902.3) gets new walls and a gable roof, its door on the EAST side
   (towards the drive-in and the road; the south wall has the radio desk against it), windows north and south, the
   KDRT sign over the door, a generator and a fuel drum on the west side. The hut's furniture and props stay. ---- */
const SSR={x:-62,z:-905,H:28,plat:16};
function ssRadioMast(g){const k=rtKit(),o=ssKit(),{B,C,rod,L,tube,slab}=k.H(g),M=k.M,r=o.r,obs=[],lights=[];const{x:rx,z:rz,H,plat:PY}=SSR;
 const ST=M(0xc84a2a,{metalness:.4,roughness:.5}),SW=M(0xe8e4dc,{metalness:.4,roughness:.5}),STD=M(0x6a7074,{metalness:.5,roughness:.5});
 const rad=y=>1.4+(.25-1.4)*y/H,ang=i=>i*Math.PI*2/3+Math.PI/3,at=(i,y)=>[rx+Math.cos(ang(i))*rad(y),y,rz+Math.sin(ang(i))*rad(y)];
 /* legs in red and white bands (aviation paint), footings */for(let i=0;i<3;i++){for(let s=0;s<7;s++){const y0=Math.max(.35,s*4),y1=Math.min(H,(s+1)*4);ssSeg(g,at(i,y0),at(i,y1),.08-.04*y0/H,.08-.04*y1/H,s%2?SW:ST,8)}const f=at(i,0);B(.7,.35,.7,f[0],.175,f[2],o.STONE2)}
 for(let i=0;i<3;i++){const j=(i+1)%3;for(let y=2;y<H;y+=3){rod(at(i,y),at(j,y),.025,STD,null,4);if(y+3<=H){rod(at(i,y),at(j,y+3),.016,STD,null,4)}}}
 obs.push({x0:rx-1.6,x1:rx+1.6,z0:rz-1.6,z1:rz+1.6});
 /* the caged ladder on the east face (legs turned 60° from before so the guy wires clear the hut), vertical, held off the face by brackets */
 const FA=0,fx=Math.cos(FA),fz=Math.sin(FA),tx=-fz,tz=fx,LD=.86,lx=rx+fx*LD,lz=rz+fz*LD,LT=PY+1.0;
 {for(const s of[-1,1])rod([lx+tx*.22*s,0,lz+tz*.22*s],[lx+tx*.22*s,LT,lz+tz*.22*s],.02,STD,null,6);for(let y=.3;y<PY;y+=.3)rod([lx-tx*.22,y,lz-tz*.22],[lx+tx*.22,y,lz+tz*.22],.012,STD,null,4);
  for(let y=1.5;y<PY;y+=3){const ap=rad(y)/2;for(const s of[-1,1])rod([lx+tx*.22*s,y,lz+tz*.22*s],[rx+fx*ap+tx*.22*s,y,rz+fz*ap+tz*.22*s],.012,STD,null,4)}
  for(let y=2.6;y<=PY+.9;y+=.85){const hp=[];for(let i=0;i<=10;i++){const t=i/10*Math.PI,u=Math.cos(t)*.22,v=Math.sin(t)*.42;hp.push([lx+tx*u+fx*v,y,lz+tz*u+fz*v])}tube(hp,.012,STD,null,12)}
  for(const i of[1,5,9]){const t=i/10*Math.PI,u=Math.cos(t)*.22,v=Math.sin(t)*.42;rod([lx+tx*u+fx*v,2.6,lz+tz*u+fz*v],[lx+tx*u+fx*v,2.6+Math.floor((PY+.9-2.6)/.85)*.85,lz+tz*u+fz*v],.01,STD,null,4)}}
 /* the platform at 16 m: a grating square round the mast with a hatch where the ladder comes up, posts and two rails */
 {const GR=M(0x6a7074,{metalness:.5,roughness:.6}),S=1.25,hx0=fx*LD-.42,hx1=fx*LD+.42,hz0=fz*LD-.42,hz1=fz*LD+.42;
  for(const[a0,a1,b0,b1]of[[-S,S,-S,hz0],[-S,S,hz1,S],[-S,hx0,hz0,hz1],[hx1,S,hz0,hz1]])B(a1-a0,.05,b1-b0,rx+(a0+a1)/2,PY,rz+(b0+b1)/2,GR);
  for(const[a,b]of[[-1,-1],[1,-1],[1,1],[-1,1],[0,-1],[0,1],[-1,0],[1,0]])B(.05,1.0,.05,rx+a*S,PY+.5,rz+b*S,STD);for(const[y,dy]of[[PY+.5,0],[PY+.98,0]])for(const[w,d,x,z,o2]of[[2*S,.03,rx,rz-S,0],[2*S,.03,rx,rz+S,0],[.03,2*S-.06,rx-S,rz,.004],[.03,2*S-.06,rx+S,rz,.004]])B(w,.03,d,x,y-o2,z,STD);
  for(let i=0;i<3;i++){const p=at(i,PY-.4);rod([p[0],PY-.4,p[2]],[rx+Math.cos(ang(i))*S,PY-.03,rz+Math.sin(ang(i))*S],.025,STD,null,4)}
  const lp=new THREE.Mesh(new THREE.SphereGeometry(.07,8,6),M(0xfff0d0,{emissive:0xffd890,emissiveIntensity:.9}));lp.position.set(rx-S+.06,PY+1.1,rz-S+.06);g.add(lp)}
 /* the top: a cap plate, three whip aerials, three panel antennas, a dish turned to the town, the beacon */
 B(.6,.06,.6,rx,H+.03,rz,STD);for(let i=0;i<3;i++){const a=ang(i)+.5;rod([rx+Math.cos(a)*.18,H,rz+Math.sin(a)*.18],[rx+Math.cos(a)*.2,H+4+i*.6,rz+Math.sin(a)*.2],.012,STD,null,4)}
 for(let i=0;i<3;i++){const p=at(i,H-2.5),a=ang(i);const pn=B(.12,1.4,.35,p[0]+Math.cos(a)*.14,H-2.5,p[2]+Math.sin(a)*.14,M(0xe8e8e2,{roughness:.5}));pn.rotation.y=-a}
 {const dg=new THREE.Group();const p=at(2,22);dg.position.set(p[0]+.25,22,p[2]-.1);dg.rotation.y=Math.PI*.75;g.add(dg);const pp=[];for(let i=0;i<=10;i++){const u=i/10*.85;pp.push(new THREE.Vector2(u,u*u*.42))}const d=new THREE.Mesh(new THREE.LatheGeometry(pp,28),M(0xe8e8e2,{roughness:.5,side:THREE.DoubleSide}));d.rotation.x=Math.PI/2;d.position.z=.45;dg.add(d);const rm=new THREE.Mesh(new THREE.TorusGeometry(.85,.02,6,28),M(0xe8e8e2,{roughness:.5}));rm.position.z=.45+.3;dg.add(rm);const h=k.H(dg);h.C(.06,.06,.5,0,0,.25,STD,'z',null,8);h.rod([0,0,-.2],[0,0,.4],.03,STD);for(const a of[0,2.1,4.2])h.rod([Math.cos(a)*.42,Math.sin(a)*.42,.08],[0,0,.65],.01,STD,null,4);h.C(.05,.04,.12,0,0,-.05,STD,'z',null,8)}
 const beacon=new THREE.Mesh(new THREE.SphereGeometry(.25,12,8),M(0x401010,{emissive:0xff2020}));beacon.position.set(rx,H+.3,rz);g.add(beacon);C(.12,.16,.1,rx,H+.08,rz,STD,null,null,10);
 const mid=new THREE.Mesh(new THREE.SphereGeometry(.12,10,6),M(0x401010,{emissive:0xff2020}));mid.position.copy(new THREE.Vector3(...at(1,14)));g.add(mid);
 /* guy wires: from each leg at 12 m and 24 m to its anchor 9.5 m out (north-east, west, south-east: clear of the hut and the drive-in); concrete anchor blocks with turnbuckles */
 for(let i=0;i<3;i++){const a=ang(i),ax=rx+Math.cos(a)*9.5,az=rz+Math.sin(a)*9.5;B(1.0,.4,1.0,ax,.2,az,o.STONE2);B(.1,.25,.04,ax,.5,az,STD);obs.push({x0:ax-.5,x1:ax+.5,z0:az-.5,z1:az+.5});
  for(const y of[12,24]){const p=at(i,y),e=[ax-Math.cos(a)*.0,.6,az];rod(p,e,.01,M(0x3a3a3a,{metalness:.6}),null,4);const u=.04;rod([e[0]+(p[0]-e[0])*u,e[1]+(p[1]-e[1])*u,e[2]+(p[2]-e[2])*u],[e[0]+(p[0]-e[0])*u*2.5,e[1]+(p[1]-e[1])*u*2.5,e[2]+(p[2]-e[2])*u*2.5],.025,STD,null,6)}}
 /* ---- the hut (x0..x1, z0..z1 as before): walls on those lines, a corrugated gable roof (ridge along x) ---- */
 const x0=rx+3,x1=rx+7,z0=rz-.7,z1=rz+2.7,WH=2.6,T=.2,HW=M(0xb8b4a8,{roughness:.9,map:k.tex(64,64,(c,w,h)=>{c.fillStyle='#b8b4a8';c.fillRect(0,0,w,h);c.fillStyle='rgba(80,76,70,.35)';for(let y=0;y<h;y+=16){c.fillRect(0,y,w,1);for(let x=((y/16)%2)*16;x<w;x+=32)c.fillRect(x,y,1,16)}})}),IN=M(0x8a8478,{roughness:.95});HW.map.repeat.set(3,2);
 const bx=(w,h,d,x,y,z,m)=>rtBox(g,w,h,d,x,y,z,m);
 const wallX=(z,ops,outN)=>{let a=x0-T/2;const ms=outN?[HW,HW,HW,HW,HW,IN]:[HW,HW,HW,HW,IN,HW];for(const[o0,o1,b,t]of ops){bx(o0-a,WH,T,(a+o0)/2,WH/2,z,ms);if(b>0)bx(o1-o0,b,T,(o0+o1)/2,b/2,z,ms);bx(o1-o0,WH-t,T,(o0+o1)/2,(WH+t)/2,z,ms);a=o1}bx(x1+T/2-a,WH,T,(a+x1+T/2)/2,WH/2,z,ms)};
 const wallZ=(x,ops,outE)=>{let a=z0+T/2;const ms=outE?[HW,IN,HW,HW,HW,HW]:[IN,HW,HW,HW,HW,HW];for(const[o0,o1,b,t]of ops){bx(T,WH,o0-a,x,WH/2,(a+o0)/2,ms);if(b>0)bx(T,b,o1-o0,x,b/2,(o0+o1)/2,ms);bx(T,WH-t,o1-o0,x,(WH+t)/2,(o0+o1)/2,ms);a=o1}bx(T,WH,z1-T/2-a,x,WH/2,(a+z1-T/2)/2,ms)};
 const DZ0=z0+1.55,DZ1=z0+2.45;wallX(z0,[[rx+4.4,rx+6.0,1.25,2.0]],false);wallX(z1,[[rx+5.5,rx+6.6,1.1,1.9]],true);wallZ(x0,[],false);wallZ(x1,[[DZ0,DZ1,0,2.1]],true);
 for(const[a,b,c2,d]of[[x0-T/2,x1+T/2,z0-T/2,z0+T/2],[x0-T/2,x1+T/2,z1-T/2,z1+T/2],[x0-T/2,x0+T/2,z0,z1],[x1-T/2,x1+T/2,z0,DZ0],[x1-T/2,x1+T/2,DZ1,z1]])obs.push({x0:a,x1:b,z0:c2,z1:d});
 bx(x1-x0-T,.03,z1-z0-T,(x0+x1)/2,.015,(z0+z1)/2,M(0x7a6a5a,{roughness:.9}));
 /* windows: frames and glass */for(const[z,a,b,lo,hi]of[[z0,rx+4.4,rx+6.0,1.25,2.0],[z1,rx+5.5,rx+6.6,1.1,1.9]]){const m=(a+b)/2,w=b-a;bx(w,.05,.12,m,lo+.025,z,o.WOODD);bx(w,.05,.12,m,hi-.025,z,o.WOODD);bx(.05,hi-lo-.1,.12,a+.025,(lo+hi)/2,z,o.WOODD);bx(.05,hi-lo-.1,.12,b-.025,(lo+hi)/2,z,o.WOODD);bx(.04,hi-lo-.1,.12,m,(lo+hi)/2,z,o.WOODD);bx(w-.1,hi-lo-.12,.01,m,(lo+hi)/2,z,rtMotelKit().GLASS)}
 /* the door, standing open against the outside of the east wall; a lamp over it */{const hgx=x1+T/2;bx(.92,.05,.12,hgx-.0,2.12,(DZ0+DZ1)/2,o.WOODD);const dd=bx(.05,2.05,.88,hgx+.45,1.03,DZ1+.04,M(0x4a5a6a,{roughness:.6}));dd.rotation.y=Math.PI/2;dd.position.set(hgx+.47,1.04,DZ1+.03);
  C(.08,.08,.18,hgx+.09,2.35,(DZ0+DZ1)/2,M(0xfff0d0,{emissive:0xffd890,emissiveIntensity:.9}),'x',null,10);lights.push([hgx+.6,2.3,(DZ0+DZ1)/2])}
 /* gable roof: two corrugated slopes, gable infills, a ridge cap */{const CR=M(0xffffff,{metalness:.5,roughness:.45,side:THREE.DoubleSide,map:k.tex(64,16,(c,w,h)=>{for(let x=0;x<w;x++){const v=150+Math.sin(x/w*Math.PI*8)*30|0;c.fillStyle='rgb('+v+','+(v-6)+','+(v-14)+')';c.fillRect(x,0,1,h)}})});CR.map.repeat.set(1,6);
  const rise=.9,half=(z1-z0)/2+.35,sl=Math.hypot(half,rise),an=Math.atan2(rise,half),zc=(z0+z1)/2;for(const s of[-1,1]){const p=new THREE.Mesh(new THREE.BoxGeometry(x1-x0+.7,.04,sl),CR);p.position.set((x0+x1)/2,WH+rise/2,zc+s*half/2);p.rotation.x=s*an;g.add(p)}
  B(x1-x0+.72,.08,.22,(x0+x1)/2,WH+rise+.02,zc,STD);for(const x of[x0,x1])slab([[-(z1-z0)/2-T/2,0],[(z1-z0)/2+T/2,0],[0,rise*(((z1-z0)/2+T/2)/half)]],T,HW,x,WH,zc,Math.PI/2)}
 /* the KDRT sign on the east gable, over the door */L('KDRT · 13 AM\nDESERT RADIO',1.5,.5,'#2a3a5a','#f0e8d0',50,x1+T/2+.006,WH+.32,(z0+z1)/2,Math.PI/2);
 /* generator and fuel drum, north of the hut, a cable up into the wall */{const gx=rx+4.2,gz=z1+1.0;B(1.0,.12,.6,gx,.06,gz,STD);B(.8,.55,.5,gx,.395,gz,M(0xc8a020,{roughness:.5}));C(.06,.06,.4,gx+.2,.85,gz,STD,null,null,8);B(.3,.2,.02,gx-.2,.45,gz+.26,M(0x202020));obs.push({x0:gx-.55,x1:gx+.55,z0:gz-.35,z1:gz+.35});
  C(.29,.29,.88,gx+1.3,.44,gz,M(0x2a6a3a,{metalness:.4,roughness:.5}),null,null,14);obs.push({x0:gx+1,x1:gx+1.6,z0:gz-.3,z1:gz+.3});tube([[gx,.4,gz-.26],[gx,.2,gz-.6],[gx,.3,z1+T/2+.02],[gx,1.6,z1+T/2+.02]],.015,M(0x202020),null,10)}
 return{obs,lights,parts:{beacon,mid},spots:{climb:[rx+fx*1.7,rz+fz*1.7+.9],perch:[rx,PY+.1,rz-.9],map:[rx+3.7,1.5,z1-T/2-.01]},mapR:[[rx,rz,1.6,'#8a4a3a']]}}

/* ---- batch 3a: SKULL ROCK (76, -960), facing north. One sculpted sandstone skull: a weathered dome with wind-worn
   bands, a heavy brow, deep eye sockets, a nose hole, cheekbones, upper teeth with the middle two long gone, the two
   halves of the lower jaw half sunk in the sand either side, a sand drift over the chin. The mouth is a real hollow
   2.5-3 m deep you can walk into through the gap in the teeth. Rock steps on the west side climb to a ledge under the
   right eye socket (as you face it), so reaching in looks possible.
   Returns {obs, plates (the steps and ledge), spots:{shout, eye, bats}} ---- */
const SSK={x:76,z:-960,O:[0,3.0,.8],
 /* the skull's main masses, as egg shapes [centre, radii] blended together, measured out from the point O inside */
 parts:[[[0,4.6,-1.4],[4.8,4.8,5.8]],   /* the cranium: long to the back, its back sunk into the sand */
  [[0,3.9,2.0],[3.4,3.4,2.9]],          /* the face: forehead to upper teeth, narrower than the dome */
  [[0,1.2,1.4],[3.6,2.6,3.4]]]};        /* the lower jaw, half sunk in the sand */
function ssSkullRock(g){const k=rtKit(),o=ssKit(),{C}=k.H(g),M=k.M,r=o.r,obs=[],plates=[];const{x:sx,z:sz}=SSK,[ox,oy,oz]=SSK.O;
 const sm=(a,b,v)=>{const t=Math.min(1,Math.max(0,(v-a)/(b-a)));return t*t*(3-2*t)},smax=(a,b,kk)=>{const h=Math.min(1,Math.max(0,.5+.5*(b-a)/kk));return a*(1-h)+b*h+kk*h*(1-h)};
 const hit=(d,c,a)=>{const px=(ox-c[0])/a[0],py=(oy-c[1])/a[1],pz=(oz-c[2])/a[2],vx=d[0]/a[0],vy=d[1]/a[1],vz=d[2]/a[2],A2=vx*vx+vy*vy+vz*vz,B2=px*vx+py*vy+pz*vz,C2=px*px+py*py+pz*pz-1,D=B2*B2-A2*C2;return D<0?0:(-B2+Math.sqrt(D))/A2};
 /* the surface point in direction d from O, [x,y,z,how deep in a hollow]; nm = leave the mouth closed (for placing things) */
 const shape=(d,nm)=>{let rr=0;SSK.parts.forEach((pp,n)=>{const t=hit(d,pp[0],pp[1]);rr=n?smax(rr,t,.8):t});
  let x=ox+d[0]*rr,y=oy+d[1]*rr,z=oz+d[2]*rr,dd=0,deep=0;const ax=Math.abs(x);
  /* gentle weathering only (no bands) */dd+=.025*Math.sin(1.3*x+1.1*y+.7*z)+.02*Math.sin(2.1*z-1.7*x+.9*y)+.012*Math.sin(5.3*x+4.1*y-3.3*z);
  /* the temples: hollows on the sides of the dome above the cheekbones */{const q=Math.hypot((y-6.2)/1.5,(z-1.1)/2.2);if(q<1)dd-=.8*Math.pow(1-q*q,1.5)*sm(2.6,3.8,ax)}
  /* the cheekbone arches, running back from under the eyes to the ears */dd+=(.35+.04*z)*Math.exp(-Math.pow((y-4.3-.06*z)/(.36+.03*z),2))*sm(-1,-.2,z)*(1-sm(3.4,4.3,z))*sm(2.3,3.1,ax);
  /* the hollow under each arch */{const q=Math.hypot((y-2.6)/1.05,(z-1.2)/1.7);if(q<1)dd-=.65*Math.pow(1-q*q,1.5)*sm(2,2.9,ax)}
  /* the jawbone: the upright back part under the ear, and the lower edge running forward to the mouth */
  {const zr=-.15-.12*(y-2),q=(z-zr)/.7;if(Math.abs(q)<1)dd+=.5*Math.pow(1-q*q,1.2)*sm(.1,.6,y)*(1-sm(3.2,3.9,y))*sm(2.2,3,ax)}
  {const q=(y-.6)/.6;if(Math.abs(q)<1)dd+=.35*Math.pow(1-q*q,1.2)*sm(-.6,.2,z)*(1-sm(4,4.8,z))*sm(1.9,2.6,ax)}
  /* the bump behind each ear */{const q=Math.hypot(ax-4,y-3,z+1.7)/.9;if(q<1)dd+=.3*(1-q*q)}
  /* a fuller, upright forehead */dd+=.55*Math.exp(-Math.pow((y-8.0)/1.3,2))*sm(-.5,2,z)*(1-sm(2.5,4.2,ax));
  /* the cheekbones under the outer corners of the eyes */{const q=Math.hypot(ax-2.9,(y-4.1)*1.2,z-3.3)/1.2;if(q<1)dd+=.35*(1-q*q)}
  /* the brow ridge over the eyes */dd+=.35*Math.exp(-Math.pow((y-7.55)/.42,2))*sm(2.4,3.4,z)*(1-sm(3.3,4.3,ax));
  const rl=rr+dd;x=ox+d[0]*rl;y=oy+d[1]*rl;z=oz+d[2]*rl;const fr=sm(.3,.6,d[2]);
  /* eye sockets, nose hole and mouth are dug straight back into the face */
  for(const e of[-1,1]){const q=Math.hypot((x-e*2.1)/1.6,(y-5.85)/1.7);if(q<1){const h=2.0*Math.pow(1-q*q,.55)*fr;z-=h;deep=Math.max(deep,h)}}
  {const t=(y-2.95)/1.85;if(t>0&&t<1){const w=.8*Math.sin(Math.PI*Math.min(1,t*1.2))*(.7+.3*t),q=Math.abs(x)/Math.max(.01,w);if(q<1){const h=1.4*Math.pow(1-q*q,.6)*Math.sin(Math.PI*t)*fr;z-=h;deep=Math.max(deep,h)}}}
  if(!nm){const mw=1.7,mh=2.4-.35*Math.pow(x/mw,2),h=3.0*(1-sm(mw-.3,mw+.05,Math.abs(x)))*(1-sm(mh-.3,mh+.1,y))*sm(.25,.5,d[2]);z-=h;deep=Math.max(deep,h)}
  /* sand drifted against the foot all round (not across the mouth) */if(y<.9&&!(Math.abs(x)<2.1&&z>1)){const a=.6*Math.pow(1-Math.max(0,y)/.9,2),hl=Math.hypot(x,z+.5)||1;x+=x/hl*a;z+=(z+.5)/hl*a}
  return[x,Math.max(y,-.3),z,deep]};
 const ge=new THREE.SphereGeometry(1,180,130),P=ge.attributes.position,N=P.count,col=new Float32Array(N*3);
 for(let i=0;i<N;i++){const[x,y,z,deep]=shape([P.getX(i),P.getY(i),P.getZ(i)]);P.setXYZ(i,x,y,z);
  /* colour: bone-pale sandstone, near black deep in the hollows, sand at the foot, a few dark cracks */
  let c=[.88,.79,.64];const band=1+.025*Math.sin(y*2.3+x*.4)+.02*Math.sin(z*1.7-y*.9);c=c.map(v=>v*band);
  const dk=1-.85*Math.min(1,deep/1.6);c=c.map(v=>v*dk);if(y<1.2&&deep<.4){const t=Math.min(1,1-y/1.2);c=[c[0]+(.92-c[0])*t*.75,c[1]+(.8-c[1])*t*.75,c[2]+(.6-c[2])*t*.75]}
  const ck=Math.abs(Math.sin(x*1.9+Math.sin(y*1.3)*2)*Math.sin(z*.8+y*.4));if(ck<.025&&y>1.2)c=c.map(v=>v*.8);col[i*3]=c[0];col[i*3+1]=c[1];col[i*3+2]=c[2]}
 ge.setAttribute('color',new THREE.BufferAttribute(col,3));ge.computeVertexNormals();const SK=M(0xffffff,{vertexColors:true,roughness:.95,map:k.tex(128,128,(c,w,h)=>{c.fillStyle='#e8e0d0';c.fillRect(0,0,w,h);for(let i=0;i<2400;i++){c.fillStyle=r()<.5?'rgba(120,96,70,.18)':'rgba(255,250,240,.2)';c.fillRect(r()*w,r()*h,1+r()*2,1+r()*2)}})});SK.map.repeat.set(10,8);
 const skull=new THREE.Mesh(ge,SK);skull.position.set(sx,0,sz);skull.userData.noSeam=true;g.add(skull);
 /* finding the surface (mouth closed): is a point inside, how far forward is the face, how wide is the foot */
 const inside=p=>{const v=[p[0]-ox,p[1]-oy,p[2]-oz],l=Math.hypot(...v)||1e-6,s=shape(v.map(a=>a/l),1);return l<Math.hypot(s[0]-ox,s[1]-oy,s[2]-oz)};
 const bis=(f,a,b)=>{for(let n=0;n<28;n++){const m=(a+b)/2;if(f(m))a=m;else b=m}return a};
 const frontZ=(x,y)=>bis(z=>inside([x,y,z]),0,9),sideX=(y,z)=>inside([0,y,z])?bis(x=>inside([x,y,z]),0,9):0;
 /* the upper teeth: worn, rounded, hanging over the mouth; the middle two are gone (the way in) */
 const TH=M(0xe8dcc0,{roughness:.8}),tooth=new THREE.LatheGeometry([[0,-.56],[.1,-.54],[.18,-.44],[.22,-.2],[.24,.2],[.25,.6]].map(([a,b])=>new THREE.Vector2(a,b)),10);
 for(const tx of[-1.35,-.82,.82,1.35]){const mh=2.4-.35*Math.pow(tx/1.7,2),t=new THREE.Mesh(tooth,TH);t.scale.set(1,1,.8);t.position.set(sx+tx,mh-.32,sz+frontZ(tx,mh+.2)-.28);t.rotation.y=r()*.3;g.add(t)}
 /* the last few lower teeth, poking out of the sand either side of the mouth */
 for(const s of[-1,1])for(const[tx,th]of[[1.95,.5],[2.4,.38]]){const t=new THREE.Mesh(tooth,TH);t.scale.set(.75,th/1.1,.6);t.rotation.x=Math.PI;t.position.set(sx+s*tx,th/2-.04,sz+frontZ(s*tx,.4)+.05);g.add(t)}
 const fz0=frontZ(0,.4);{const dr=new THREE.Mesh(new THREE.SphereGeometry(1,24,10,0,Math.PI*2,0,Math.PI/2),M(0xd8b88a,{roughness:1}));dr.scale.set(1.9,.18,1.2);dr.position.set(sx,-.01,sz+fz0+1.0);g.add(dr)}
 /* a few small bones on the mouth floor */{const BN=M(0xe8dcc8,{roughness:.8});for(const[x,z,a]of[[-.6,fz0-1.6,.4],[.5,fz0-2.0,-.9],[.1,fz0-1.1,1.6]]){const b=C(.04,.04,.6,sx+x,.05,sz+z,BN,'x',null,6);b.rotation.y=a}}
 /* rock steps up the west side to a ledge under the right eye: one outcrop of layered, rounded blocks, flat on top;
    plates so you walk up them; rails of rock stop you stepping off the front */
 const zf=frontZ(-2.3,3.4),z0=zf-.45,z1=zf+1.15,RK=M(0xc8ae88,{roughness:1});
 const blk=(x0,x1,b0,b1,y,seed)=>{const hx=(x1-x0)/2,hz=(b1-b0)/2,hy=(y+.3)/2,rr=.22,ge2=new THREE.BoxGeometry(2,2,2,6,4,6),Q=ge2.attributes.position;
  for(let n=0;n<Q.count;n++){const u=[Q.getX(n)*hx,Q.getY(n)*hy,Q.getZ(n)*hz],I=[hx-rr,hy-rr,hz-rr],q=u.map((v,j)=>Math.max(-I[j],Math.min(I[j],v))),nn=u.map((v,j)=>v-q[j]),nl=Math.hypot(...nn)||1;
   let px=q[0]+nn[0]/nl*rr,py=q[1]+nn[1]/nl*rr,pz=q[2]+nn[2]/nl*rr;const lo=1-sm(hy*.6,hy,py);px+=.07*Math.sin(py*3.1+pz*2+seed)*lo;pz+=.06*Math.sin(px*2.3+py*2.2+seed*1.7)*lo+.04*Math.sin(px*5+seed);Q.setXYZ(n,px,py,pz)}
  ge2.computeVertexNormals();const m=new THREE.Mesh(ge2,RK);m.position.set(sx+(x0+x1)/2,y-hy,sz+(b0+b1)/2);g.add(m)};
 const XS=-7.4,SW=.75;for(let i=0;i<6;i++){const a=XS+i*SW,y=.5+i*.5,ins=.05*i;blk(a,a+SW+.3,z0+.15+ins,z1-ins,y,i*1.7);plates.push({x0:sx+a,x1:sx+a+SW,z0:sz+z0+.3,z1:sz+z1-.25,y})}
 blk(-2.9-.3,-1.85,z0-.1,z1-.3,3.4,9);plates.push({x0:sx-2.9,x1:sx-1.95,z0:sz+z0,z1:sz+z1-.45,y:3.4});
 obs.push({x0:sx+XS,x1:sx-1.85,z0:sz+z1,z1:sz+z1+.2},{x0:sx-1.95,x1:sx-1.75,z0:sz+z0,z1:sz+z1+.2});
 /* the skull's own obstacles, slice by slice from its foot (not the mouth, x ±1.65 back to its far end) */
 const mz=fz0-3.0;for(let z=-7;z<6;z+=1){const w=Math.max(sideX(.4,z),sideX(.4,z+1))-.1;if(w<.3)continue;const zl=Math.min(z+1,z0);
  if(z+1>mz){if(w>1.65){obs.push({x0:sx+1.65,x1:sx+w,z0:sz+z,z1:sz+z+1});if(zl>z)obs.push({x0:sx-w,x1:sx-1.65,z0:sz+z,z1:sz+zl})}if(z<mz)obs.push({x0:sx-1.65,x1:sx+1.65,z0:sz+z,z1:sz+mz})}
  else obs.push({x0:sx-w,x1:sx+w,z0:sz+z,z1:sz+z+1})}
 return{obs,plates,spots:{shout:[sx,sz+fz0-1.4],eye:[sx-2.4,sz+zf+.35],bats:[sx,2.0,sz+mz+.6]},mapR:[[sx,sz,6,'#b8a080']]}}

/* ---- batch 3b: the METEOR CRATER (140, -970). A real crater: the floor gets a square hole (SSM.cut, like the oasis),
   and this patch fills it: a broken raised rim, a bowl down 1.5 m with a scorched glassy floor, ejecta rocks thrown
   out round it, the meteorite half buried in the middle, cracked, with green crystal glowing out of the cracks.
   ssCraterH(x, lz) is the ground height (0 outside): add it to vehGround so players and cars go down into the bowl.
   ssFragment(g, x, y, z) is one of the five fragments: a small burnt stone with a glowing green shard. ---- */
const SSM={x:140,z:-970,cut:10.5};
function ssCraterH(x,lz){const dx=x-SSM.x,dz=lz-SSM.z,d=Math.hypot(dx,dz);if(d>=10)return 0;const a=Math.atan2(dz,dx);
 const crest=.75+.32*Math.sin(3*a+1)+.18*Math.sin(7*a+.4)-.45*((t=>t*t*(3-2*t))(Math.min(1,Math.max(0,(Math.cos(a-2.2)-.85)/.12)))),R0=6.6+.4*Math.sin(2*a+.5);
 const sm=(e0,e1,v)=>{const t=Math.min(1,Math.max(0,(v-e0)/(e1-e0)));return t*t*(3-2*t)};
 if(d<R0){const floor=-1.5+.25*sm(0,4.2,d);return floor+(crest-floor+.0)*sm(3.6,R0,d)*sm(3.6,R0,d)}return crest*(1-sm(R0,10,d))}
function ssFragment(g,x,y,z){const k=rtKit(),M=k.M,f=new THREE.Group();f.position.set(x,y,z);g.add(f);const st=new THREE.Mesh(new THREE.DodecahedronGeometry(.22,0),M(0x2a2420,{roughness:.9}));st.scale.set(1,.7,.9);st.position.y=.12;f.add(st);
 const cr=M(0x1a5a2a,{emissive:0x30ff60,emissiveIntensity:.9,roughness:.2,metalness:.1});for(const[a,t,h]of[[.3,.5,.34],[2.4,.3,.24],[4.2,.65,.2]]){const s=new THREE.Mesh(new THREE.OctahedronGeometry(.06,0),cr);s.scale.set(1,h/.06/1.4,1);s.position.set(Math.cos(a)*.08,.2,Math.sin(a)*.08);s.rotation.set(Math.sin(a)*t,0,Math.cos(a)*t);f.add(s)}return f}
function ssCrater(g){const k=rtKit(),o=ssKit(),{B,C,rod,L}=k.H(g),M=k.M,r=o.r,obs=[];const{x:kx,z:kz,cut}=SSM;
 /* the patch: heights from ssCraterH, sand outside, darker scorched rock inside, glassy black-green floor */
 {const N=110,ge=new THREE.PlaneGeometry(cut*2,cut*2,N,N),P2=ge.attributes.position,col=new Float32Array(P2.count*3);
  for(let i=0;i<P2.count;i++){const x=P2.getX(i),z=-P2.getY(i),y=ssCraterH(kx+x,kz+z),d=Math.hypot(x,z);P2.setZ(i,y);
   const sc=1-Math.min(1,Math.max(0,(8-d)/5));let c=[1-.55*(1-sc),1-.6*(1-sc),1-.62*(1-sc)];if(y>.45)c=c.map(v=>v*.95);col[i*3]=c[0];col[i*3+1]=c[1];col[i*3+2]=c[2]}
  ge.setAttribute('color',new THREE.BufferAttribute(col,3));ge.computeVertexNormals();const sm=SSO.sand?SSO.sand():M(0xc4a878,{roughness:1});sm.vertexColors=true;if(sm.map){sm.map=sm.map.clone();sm.map.needsUpdate=true;sm.map.wrapS=sm.map.wrapT=THREE.RepeatWrapping;sm.map.repeat.set(cut*2/10,cut*2/10)}
  const pm=new THREE.Mesh(ge,sm);pm.rotation.x=-Math.PI/2;pm.position.set(kx,0,kz);pm.userData.noSeam=true;g.add(pm)}
 /* the glassy floor: a disc that follows the bowl, dark and shiny, with burnt streaks */
 {const segR=14,segA=40,pos=[],idx=[],uv=[];for(let i=0;i<=segR;i++){const rr=3.6*i/segR;for(let j=0;j<=segA;j++){const a=j/segA*Math.PI*2,x=Math.cos(a)*rr,z=Math.sin(a)*rr;pos.push(x,ssCraterH(kx+x,kz+z)+.035,z);uv.push(.5+x/7.2,.5+z/7.2)}}
  for(let i=0;i<segR;i++)for(let j=0;j<segA;j++){const a=i*(segA+1)+j,b=a+segA+1;idx.push(a,a+1,b,a+1,b+1,b)}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();
  const gt=k.tex(256,256,(c,w,h)=>{const gr=c.createRadialGradient(w/2,h/2,10,w/2,h/2,w/2);gr.addColorStop(0,'rgba(30,48,34,1)');gr.addColorStop(.7,'rgba(36,32,28,.95)');gr.addColorStop(1,'rgba(60,48,36,0)');c.fillStyle=gr;c.fillRect(0,0,w,h);c.strokeStyle='rgba(90,255,120,.12)';c.lineWidth=2;for(let i=0;i<26;i++){const a=r()*7;c.beginPath();c.moveTo(w/2+Math.cos(a)*20,h/2+Math.sin(a)*20);c.lineTo(w/2+Math.cos(a+r()*.3)*(60+r()*60),h/2+Math.sin(a+r()*.3)*(60+r()*60));c.stroke()}});
  const gm=new THREE.Mesh(geo,M(0xffffff,{map:gt,transparent:true,roughness:.15,metalness:.35,polygonOffset:true,polygonOffsetUnits:-3}));gm.position.set(kx,0,kz);gm.userData.noSeam=true;g.add(gm)}
 /* the meteorite: a lumpy charred boulder half sunk in the floor, cracked, green crystal in the cracks */
 const crystals=[];{const ge=new THREE.IcosahedronGeometry(1,2),P2=ge.attributes.position;for(let i=0;i<P2.count;i++){const x=P2.getX(i),y=P2.getY(i),z=P2.getZ(i),s=1+.18*Math.sin(3.1*x+1.7*y)+.12*Math.sin(4.3*z-2.1*x)+.08*Math.sin(7*y+5*z);P2.setXYZ(i,x*s,y*s*.8,z*s)}ge.computeVertexNormals();
  const my=ssCraterH(kx,kz),m=new THREE.Mesh(ge,M(0x2a2622,{roughness:.85,metalness:.15}));m.scale.setScalar(1.05);m.position.set(kx,my+.25,kz);m.rotation.set(.3,.8,.15);g.add(m);
  const CR=M(0x1a6a2a,{emissive:0x30ff60,emissiveIntensity:.9,roughness:.15,metalness:.1});for(let i=0;i<9;i++){const a=i/9*Math.PI*2+r()*.4,el=.25+r()*.7,h=.35+r()*.45;const s=new THREE.Mesh(new THREE.OctahedronGeometry(.11,0),CR);s.scale.set(1,h/.11/1.4,1);
   s.position.set(kx+Math.cos(a)*.85*Math.cos(el),my+.25+Math.sin(el)*.75,kz+Math.sin(a)*.85*Math.cos(el));s.lookAt(kx+Math.cos(a)*3,my+.25+Math.sin(el)*2.6,kz+Math.sin(a)*3);s.rotateX(Math.PI/2);g.add(s);crystals.push(s)}
  for(let i=0;i<5;i++){const a=r()*7;const cl=new THREE.Mesh(new THREE.BoxGeometry(.04,.02,.5+r()*.4),M(0x30ff60,{emissive:0x30ff60,emissiveIntensity:1}));cl.position.set(kx+Math.cos(a)*.6,my+.6+r()*.3,kz+Math.sin(a)*.6);cl.rotation.set(r(),a,r());g.add(cl)}
  obs.push({x0:kx-1.1,x1:kx+1.1,z0:kz-1.1,z1:kz+1.1})}
 /* ejecta: rocks thrown out over the rim and onto the sand round it, sitting on the ground (none on the fragment spots) */
 {const RK=M(0x8a7458,{roughness:1}),RK2=M(0x5a4a3a,{roughness:1});const frag=[[9,4],[-11,-6],[14,-12],[-6,13],[22,9]];for(let i=0;i<34;i++){const a=r()*Math.PI*2,d=6.5+r()*7.5,x=kx+Math.cos(a)*d,z=kz+Math.sin(a)*d;if(frag.some(([fx,fz])=>Math.hypot(x-kx-fx,z-kz-fz)<1.8))continue;
  const s=.18+r()*.45*(1-(d-6.5)/9),rk=new THREE.Mesh(new THREE.DodecahedronGeometry(s,0),i%3?RK:RK2);rk.scale.set(1,.6+r()*.3,.8+r()*.4);rk.position.set(x,ssCraterH(x,z)+s*.25,z);rk.rotation.set(r()*3,r()*3,r()*3);g.add(rk)}}
 return{obs,parts:{crystals},spots:{touch:[kx+1.6,kz]},mapR:[[kx,kz,7,'#7a6048']]}}
