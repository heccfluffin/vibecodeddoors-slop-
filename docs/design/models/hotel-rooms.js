/* Hotel remodel, new room types (hotel-rooms.md). Uses the helpers in hotel.js (hflRng, hflB, hflCy, hflMat, hflPlane,
   hflCan, hflSconce), so load hotel.js first.
   Room-local coordinates, as in mkRoomRaw: the entry wall at z = 1, the exit wall at ez = -L-1, x from -HX to HX,
   floor top y = 0, wall inner faces at x = +-(HX - .05).
   Every builder: hrmXxx(g, o) with o = {L, HX, HY, seed, mat(key, a, b) (the room's wall/wains/floor material)} and
   returns {obs:[{x0,x1,z0,z1}], occ:[{s,z,h}] (wall stretches it uses), ward:[{x,z,ry}] (wardrobe spots for the game's
   wardrobe), dres:[{x,z,s}] (dresser spots), trimGaps:[{s,z0,z1}] (where the game's wainscot/rail/baseboard must stop),
   lamps:[{x,y,z,c,i}] (only when the room lights itself), anims:[fn(dt,t)], ...}.
   All random choices use hflRng(seed), never Math.random.                                                           */

const HRM={};const hrmM=(k,o)=>HRM[k]||(HRM[k]=new THREE.MeshStandardMaterial(Object.assign({roughness:.7},o)));
const hrmWood=()=>hrmM('wood',{color:0x4a2a16,roughness:.6}),hrmDark=()=>hrmM('woodD',{color:0x2a160c,roughness:.6}),hrmBrass=()=>hrmM('brass',{color:0xb08a40,roughness:.35,metalness:.5}),hrmCream=()=>hrmM('cream',{color:0xd8ccb0,roughness:.7});
/* a box from two corners (x0..x1, y0..y1, z0..z1) */
function hrmBx(g,x0,x1,y0,y1,z0,z1,m){return hflB(g,x1-x0,y1-y0,z1-z0,m,(x0+x1)/2,(y0+y1)/2,(z0+z1)/2)}
/* an instanced run of identical boxes: list of [x,y,z,ry] */
function hrmInst(g,w,h,d,m,list){const im=new THREE.InstancedMesh(new THREE.BoxGeometry(w,h,d),m,list.length),o=new THREE.Object3D();list.forEach((p,i)=>{o.position.set(p[0],p[1],p[2]);o.rotation.set(0,p[3]||0,0);o.updateMatrix();im.setMatrixAt(i,o.matrix)});g.add(im);return im}
/* a chair facing direction ry (seat .45, back on the far side) */
function hrmChair(g,x,z,ry,m,cm){const c=new THREE.Group();c.position.set(x,0,z);c.rotation.y=ry;g.add(c);m=m||hrmWood();
 for(const[a,b]of[[-.19,-.19],[.19,-.19],[-.19,.19],[.19,.19]])hflB(c,.04,.43,.04,m,a,.215,b);hflB(c,.44,.05,.44,cm||m,0,.455,0);
 hflB(c,.44,.5,.04,m,0,.73,.2);return c}
/* an armchair facing -z in its own frame (back at +z), turned by ry */
function hrmArmchair(g,x,z,ry,col){const c=new THREE.Group();c.position.set(x,0,z);c.rotation.y=ry;g.add(c);const m=hrmM('arm'+col,{color:col,roughness:.85}),cu=hrmM('cush'+col,{color:col,roughness:.95});
 hflB(c,.84,.3,.8,m,0,.21,0);hflB(c,.56,.1,.6,cu,0,.41,-.06);hflB(c,.84,.5,.18,m,0,.61,.31);for(const sx of[-1,1])hflB(c,.16,.24,.62,m,sx*.34,.48,-.09);
 for(const[a,b]of[[-.36,-.34],[.36,-.34],[-.36,.34],[.36,.34]])hflCy(c,.025,.02,.06,hrmDark(),a,.03,b,6);return c}
/* a rod between two points */
function hrmRod(g,p,q,r,m){const d=new THREE.Vector3(q[0]-p[0],q[1]-p[1],q[2]-p[2]),o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),6),m);o.position.set((p[0]+q[0])/2,(p[1]+q[1])/2,(p[2]+q[2])/2);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());g.add(o);return o}

/* ===================== 1. guest corridor ===================== */
/* a guest-room door on a wall: frame, leaf, number plate, peephole, lever. s = the wall's side (-1 left, +1 right),
   the door faces the corridor. open: the leaf swings 100 degrees into the bedroom behind an opening (the game cuts
   the wing). Returns the trim gap. */
function hrmGuestDoor(g,o,s,z,num,open,R){const xw=s*(o.HX-.05),d=new THREE.Group();d.position.set(xw,0,z);d.rotation.y=s>0?-Math.PI/2:Math.PI/2;g.add(d);
 /* in the door group: +z points into the corridor, x along the wall */
 const fr=hrmCream(),lw=hrmM('gdoor',{map:hrmDoorT(),roughness:.6});
 hflB(d,.1,2.32,.1,fr,-.6,1.16,.035);hflB(d,.1,2.32,.1,fr,.6,1.16,.035);hflB(d,1.3,.14,.12,fr,0,2.27,.04);
 if(!open){hflB(d,1.1,2.2,.05,lw,0,1.1,.02);hrmDoorBits(d,num,.045,R)}
 else{hflB(d,1.1,.012,.1,fr,0,.006,-.05);const hn=new THREE.Group();hn.position.set(-.55,0,-.05);hn.rotation.y=Math.PI*.55;d.add(hn);hflB(hn,1.1,2.2,.05,lw,.55,1.1,0);const b=new THREE.Group();b.position.set(.55,0,0);hn.add(b);hrmDoorBits(b,num,.025,R)}
 return{s,z0:z-.65,z1:z+.65}}
function hrmDoorT(){return HRM.doorT||(HRM.doorT=hflCan(128,256,601,(x,R)=>{x.fillStyle='#5a3018';x.fillRect(0,0,128,256);for(let i=0;i<40;i++){x.strokeStyle='rgba(20,8,2,.25)';x.beginPath();const xx=R()*128;x.moveTo(xx,0);x.lineTo(xx+R()*4-2,256);x.stroke()}
  for(const[y,h]of[[18,100],[136,100]]){x.fillStyle='#4a2612';x.fillRect(16,y,96,h);x.strokeStyle='rgba(0,0,0,.5)';x.lineWidth=3;x.strokeRect(16,y,96,h);x.strokeStyle='rgba(220,160,90,.25)';x.lineWidth=1;x.strokeRect(22,y+6,84,h-12)}},300))}
/* plate, peephole, lever; z = the leaf's front face. The plate is centred on the leaf (local x 0) */
function hrmDoorBits(d,num,zf,R){const br=hrmBrass();const pl=hflPlane(d,.2,.09,96,44,(x,w,h)=>{x.fillStyle='#b08a40';x.fillRect(0,0,w,h);x.fillStyle='#2a1a08';x.font='bold 30px DoorsSans,Arial,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(String(num),w/2,h/2+1)});pl.position.set(0,1.62,zf+.03);
 hflB(d,.22,.11,.02,br,0,1.62,zf+.01);const pp=hflCy(d,.012,.012,.02,br,0,1.48,zf+.01,10);pp.rotation.x=Math.PI/2;
 const lv=hflCy(d,.012,.012,.07,br,-.42,1.0,zf+.035,8);lv.rotation.x=Math.PI/2;const lh=hflB(d,.12,.018,.018,br,-.37,1.0,zf+.07);
 hflB(d,.05,.16,.012,br,-.42,.98,zf+.006);
 if(R&&R()<.2){/* a DO NOT DISTURB hanger on the lever */const hg=hflPlane(d,.09,.2,40,90,(x,w,h)=>{x.fillStyle='#8a1a1a';x.fillRect(0,0,w,h);x.fillStyle='#f0e0c0';x.font='bold 10px DoorsSans,Arial,sans-serif';x.textAlign='center';['DO','NOT','DIS-','TURB'].forEach((t,i)=>x.fillText(t,w/2,30+i*13));x.fillStyle='#000';x.beginPath();x.arc(w/2,12,6,0,7);x.fill()});hg.position.set(-.37,.88,zf+.086)}}
/* the small bedroom behind an open door: the wing is d deep (x from the wall outwards) and 2*hz long (z).
   s = which side. u = distance in from the corridor wall line (x = s*(HX+u)). Returns the wardrobe spot. */
function hrmGuestRoom(g,o,s,z,d,hz,R){const X=u=>s*(o.HX+u),xr=(u0,u1)=>[Math.min(X(u0),X(u1)),Math.max(X(u0),X(u1))],B=(u0,u1,y0,y1,z0,z1,m)=>{const[a,b]=xr(u0,u1);return hrmBx(g,a,b,y0,y1,z0,z1,m)};
 const out={ward:[],dres:[],obs:[]},red=hrmM('bedR'+(o.seed%3),{color:[0x7a2a2a,0x2a4a6a,0x4a5a3a][o.seed%3],roughness:.9}),wh=hrmM('sheet',{color:0xe8e2d4,roughness:.95}),ub=d-.05;
 /* the bed: headboard on the far wall, the foot towards the corridor */
 const bz=z-hz+1.05;B(ub-2.15,ub-.04,0,.32,bz-.8,bz+.8,hrmDark());B(ub-2.13,ub-.02,.32,.55,bz-.78,bz+.78,wh);B(ub-1.45,ub-.6,.55,.6,bz-.8,bz+.8,red);
 for(const pz of[-.4,.4])B(ub-.55,ub-.12,.55,.68,bz+pz-.3,bz+pz+.3,wh);B(ub-.08,ub,0,1.25,bz-.85,bz+.85,hrmWood());
 /* nightstand and lamp */
 const nz=bz+1.15;B(ub-.45,ub,0,.55,nz-.22,nz+.22,hrmWood());hflCy(g,.06,.08,.3,hrmBrass(),X(ub-.25),.7,nz,10);
 const sh=new THREE.Mesh(new THREE.CylinderGeometry(.1,.16,.2,14,1,true),hrmM('lshade',{color:0xf0e0c0,emissive:0xb08040,side:THREE.DoubleSide}));sh.position.set(X(ub-.25),.92,nz);g.add(sh);
 /* a picture over the bed, a rug by the door */
 B(ub-.027,ub+.003,1.45,2.05,bz-.45,bz+.45,hrmM('picF',{color:0x8a6a2a}));B(ub-.038,ub-.026,1.5,2.0,bz-.4,bz+.4,hrmM('picC'+(o.seed%3),{color:[0x3a5a6a,0x6a4a2a,0x4a6a4a][o.seed%3]}));
 B(.6,1.6,0,.012,z-.6,z+1.2,hrmM('rugG',{color:0x6a3a2a,roughness:1}));
 /* the wardrobe goes on the side wall away from the door leaf, near the corridor */
 out.ward.push({x:X(1.3),z:z+hz-.36,ry:Math.PI});
 const[a,b]=xr(ub-2.15,ub);out.obs.push({x0:a,x1:b,z0:bz-.85,z1:bz+.85});const[c,e]=xr(ub-.45,ub);out.obs.push({x0:c,x1:e,z0:nz-.25,z1:nz+.25});
 out.light={x:X(d/2),y:2.4,z,c:0xffd8a0,i:.45};return out}
function hrmGuestCorr(g,o){const R=hflRng(o.seed*31+1),out={obs:[],occ:[],ward:[],dres:[],trimGaps:[],open:[],anims:[]};const base=(o.floorNo||2)*100+((o.seed*7)%40|0)+1;let n=base;
 /* a runner carpet down the middle */
 hrmBx(g,-.7,.7,0,.012,-o.L-.6,.6,hrmM('runner',{map:hrmRunnerT(),roughness:1}));HRM.runner.map.repeat.set(1,o.L/2);
 const slots=[];for(const s of[-1,1])for(let z=s<0?-3:-4.75;z>-o.L+1.5;z-=3.5)slots.push({s,z});
 /* one open bedroom on each side (not the first or last slot of a side) */
 const openSet=new Set();for(const s of[-1,1]){const sl=slots.filter(q=>q.s==s);if(sl.length>2){const k=1+(R()*(sl.length-2)|0);openSet.add(sl[k])}}
 for(const q of slots){const op=openSet.has(q);out.trimGaps.push(hrmGuestDoor(g,o,q.s,q.z,n++,op,R));out.occ.push({s:q.s,z:q.z,h:.75});
  if(op){out.open.push({s:q.s,z:q.z,hz:1.8,g:.55,d:3.6,hh:2.2});const r=hrmGuestRoom(g,o,q.s,q.z,3.6,1.8,R);out.ward.push(...r.ward);out.obs.push(...r.obs);(out.lamps=out.lamps||[]).push(r.light)}}
 /* sconces between the doors, both sides */
 for(const s of[-1,1])for(let z=(s<0?-3:-4.75)-1.75;z>-o.L+1.5;z-=3.5){const sc=hflSconce();sc.g.position.set(s*(o.HX-.05),2.0,z);sc.g.rotation.y=s>0?-Math.PI/2:Math.PI/2;g.add(sc.g)}
 return out}
function hrmRunnerT(){return HRM.runT||(HRM.runT=hflCan(128,256,602,(x,R)=>{x.fillStyle='#6a1a1e';x.fillRect(0,0,128,256);x.fillStyle='#c8a050';x.fillRect(8,0,4,256);x.fillRect(116,0,4,256);x.fillStyle='rgba(200,160,80,.35)';
  for(let y=16;y<256;y+=32){x.beginPath();x.moveTo(64,y-10);x.lineTo(80,y);x.lineTo(64,y+10);x.lineTo(48,y);x.closePath();x.fill()}},500))}

/* ===================== 2. lounge bar ===================== */
function hrmLounge(g,o){const R=hflRng(o.seed*31+2),HX=o.HX,out={obs:[],occ:[],ward:[],dres:[],trimGaps:[],anims:[],lamps:[]};const s=R()<.5?-1:1,xw=s*(HX-.05);
 /* the bar along one wall, z -5 .. -14: back-bar shelves and a mirror on the wall, the counter 1.6 m out */
 const z0=-5,z1=-14,xo=(v)=>s*(HX-v);const bm=hrmDark(),top=hrmM('barTop',{color:0x2a1408,roughness:.3});
 hrmBx(g,Math.min(xo(.05),xo(.45)),Math.max(xo(.05),xo(.45)),0,.95,z1,z0,bm);
 const mir=hflB(g,.02,1.0,8.4,hrmM('mirror',{color:0x8a9aa0,roughness:.08,metalness:.5}),xo(.06),1.75,(z0+z1)/2);
 for(const y of[1.3,1.75,2.2]){hrmBx(g,Math.min(xo(.05),xo(.32)),Math.max(xo(.05),xo(.32)),y-.02,y+.02,z1,z0,bm)}
 /* bottles on the shelves: instanced, a few colours */
 const cols=[0x2a5a2a,0x6a3a10,0xc8c8b8,0x3a2a5a];const bl=[[],[],[],[]];for(const y of[1.32,1.77])for(let z=z0-.25;z>z1+.2;z-=.16){bl[(R()*4)|0].push([xo(.18),y,z])}
 bl.forEach((L,i)=>{if(!L.length)return;const im=new THREE.InstancedMesh(new THREE.CylinderGeometry(.035,.035,.28,8),hrmM('bot'+i,{color:cols[i],roughness:.2,transparent:true,opacity:.85}),L.length),ob=new THREE.Object3D();L.forEach((p,j)=>{ob.position.set(p[0],p[1]+.14,p[2]);ob.updateMatrix();im.setMatrixAt(j,ob.matrix)});g.add(im)});
 /* the counter */
 const cx0=xo(1.55),cx1=xo(2.15);hrmBx(g,Math.min(cx0,cx1),Math.max(cx0,cx1),0,1.05,z1,z0,hrmM('barFront',{map:hrmPanelT(),roughness:.6}));
 hrmBx(g,Math.min(cx0,cx1)-.06,Math.max(cx0,cx1)+.06,1.05,1.11,z1-.06,z0+.06,top);
 const rail=hflCy(g,.025,.025,z0-z1,hrmBrass(),xo(2.2),.22,(z0+z1)/2,8);rail.rotation.x=Math.PI/2;
 for(let z=z0-.6;z>z1+.3;z-=1.1){const b=hflCy(g,.012,.012,.06,hrmBrass(),xo(2.17),.22,z,6);b.rotation.z=Math.PI/2}
 /* the bar ends close the bartender's side */
 for(const z of[z0,z1])hrmBx(g,Math.min(xo(.45),xo(1.55)),Math.max(xo(.45),xo(1.55)),0,1.05,Math.min(z,z+(z==z0?-.06:.06)),Math.max(z,z+(z==z0?-.06:.06)),bm);
 /* stools */
 for(let z=z0-.6;z>z1+.3;z-=.95){const st=new THREE.Group();st.position.set(xo(2.75),0,z);g.add(st);hflCy(st,.2,.22,.03,hrmBrass(),0,.015,0,14);hflCy(st,.03,.03,.66,hrmBrass(),0,.36,0,8);hflCy(st,.2,.2,.08,hrmM('stoolS',{color:0x5a1a1a,roughness:.8}),0,.73,0,14);
  const rg=new THREE.Mesh(new THREE.TorusGeometry(.15,.012,6,20),hrmBrass());rg.rotation.x=Math.PI/2;rg.position.y=.3;st.add(rg);out.obs.push({x0:xo(2.75)-.22,x1:xo(2.75)+.22,z0:z-.22,z1:z+.22})}
 /* three pendants over the counter */
 for(const z of[z0-1.5,(z0+z1)/2,z1+1.5]){const p=new THREE.Group();p.position.set(xo(1.85),o.HY-.04,z);g.add(p);hflCy(p,.006,.006,1.2,hrmDark(),0,-.6,0,6);const sh=new THREE.Mesh(new THREE.SphereGeometry(.14,14,8,0,Math.PI*2,0,Math.PI/2),hrmM('pend',{color:0xc89a40,emissive:0x805a20,side:THREE.DoubleSide,roughness:.4}));sh.position.y=-1.3;p.add(sh);
  out.lamps.push({x:xo(1.85),y:o.HY-1.45,z,c:0xffc880,i:.5})}
 out.obs.push({x0:Math.min(xo(0),cx1)-.06,x1:Math.max(xo(0),cx1)+.06,z0:z1-.06,z1:z0+.06});out.occ.push({s,z:(z0+z1)/2,h:5});
 /* seating: three groups of four armchairs round a low table, on rugs */
 const grp=[[-s*3,-5.5],[-s*3,-12],[-s*3,-18.5]];const ac=[0x5a2a1a,0x2a3a2a,0x6a4a2a];
 grp.forEach(([x,z],i)=>{hrmBx(g,x-1.6,x+1.6,0,.012,z-1.6,z+1.6,hrmM('rugL',{map:hrmRugT(),roughness:1}));const t=hflCy(g,.45,.45,.04,hrmDark(),x,.42,z,20);hflCy(g,.06,.12,.4,hrmDark(),x,.2,z,10);
  const col=ac[i%3];for(let k=0;k<4;k++){const a=k*Math.PI/2+Math.PI/4;hrmArmchair(g,x+Math.sin(a)*1.05,z+Math.cos(a)*1.05,a,col)}
  const gl=hflCy(g,.035,.03,.1,hrmM('glass',{color:0xd8e8f0,roughness:.1,transparent:true,opacity:.5}),x+.15,.49,z-.1,10);out.obs.push({x0:x-1.5,x1:x+1.5,z0:z-1.5,z1:z+1.5})});
 /* the grand piano near the far end, on the bar side */
 const pn=hrmPiano();pn.position.set(xo(2.6),0,-19.2);pn.rotation.y=s>0?Math.PI*.15:-Math.PI*.15;g.add(pn);out.obs.push({x0:xo(2.6)-1.3,x1:xo(2.6)+1.3,z0:-20.8,z1:-17.6});
 return out}
function hrmPanelT(){return HRM.panT||(HRM.panT=hflCan(256,128,603,(x,R)=>{x.fillStyle='#3a1e0e';x.fillRect(0,0,256,128);for(let i=0;i<4;i++){x.fillStyle='#4a2814';x.fillRect(8+i*62,14,52,100);x.strokeStyle='rgba(0,0,0,.5)';x.lineWidth=3;x.strokeRect(8+i*62,14,52,100);x.strokeStyle='rgba(220,160,90,.2)';x.lineWidth=1;x.strokeRect(13+i*62,19,42,90)}},200))}
function hrmRugT(){return HRM.rugT||(HRM.rugT=hflCan(256,256,604,(x,R)=>{x.fillStyle='#6a2a20';x.fillRect(0,0,256,256);x.strokeStyle='#c8a050';x.lineWidth=6;x.strokeRect(14,14,228,228);x.strokeStyle='#2a1a30';x.lineWidth=10;x.strokeRect(32,32,192,192);
  x.fillStyle='rgba(200,160,80,.5)';x.beginPath();x.moveTo(128,60);x.lineTo(196,128);x.lineTo(128,196);x.lineTo(60,128);x.closePath();x.fill();x.fillStyle='#2a1a30';x.beginPath();x.arc(128,128,22,0,7);x.fill()},800))}
/* a grand piano, the keyboard at local -z, the lid propped up on its right */
function hrmPiano(){const p=new THREE.Group(),bk=hrmM('piano',{color:0x0c0c0e,roughness:.25,metalness:.2}),bks=hrmM('pianoS',{color:0x0c0c0e,roughness:.25,metalness:.2,side:THREE.DoubleSide});
 const sh=new THREE.Shape();sh.moveTo(-.75,.8);sh.lineTo(.75,.8);sh.lineTo(.75,-.2);sh.quadraticCurveTo(.7,-1.0,.1,-1.1);sh.quadraticCurveTo(-.4,-1.15,-.5,-.6);sh.quadraticCurveTo(-.75,-.4,-.75,.0);sh.lineTo(-.75,.8);
 /* the shape's y becomes -z, so its straight edge (y .8) is the keyboard side at z -.8 */
 const body=new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:.32,bevelEnabled:false}),bk);body.rotation.x=-Math.PI/2;body.position.y=.62;p.add(body);
 for(const[a,b]of[[-.65,-.65],[.65,-.65],[.1,.95]])hflCy(p,.05,.04,.62,bk,a,.31,b,10);
 const lg=new THREE.Group();lg.position.set(-.75,.955,0);lg.rotation.z=.5;p.add(lg);const lid=new THREE.Mesh(new THREE.ShapeGeometry(sh),bks);lid.rotation.x=-Math.PI/2;lid.position.x=.75;lg.add(lid);
 hflCy(p,.01,.01,.54,bk,.35,1.22,.1,6);
 hflB(p,1.4,.05,.18,hrmM('keysW',{color:0xf0ece0,roughness:.4}),0,.74,-.88);for(let i=0;i<20;i++){if(![0,1,3,4,5].includes(i%7))continue;hflB(p,.03,.03,.1,bk,-.66+(i+.5)*.07,.78,-.86)}
 hflB(p,1.0,.06,.4,bk,0,.5,-1.45);for(const a of[-.42,.42])for(const b of[-1.3,-1.6])hflB(p,.04,.47,.04,bk,a,.235,b);
 return p}

/* ===================== 3. grand staircase (UP 4.5: the exit is on the balcony) ===================== */
/* L 28, HX 7, HY 9. Central flight |x|<1.6, z -8..-14.75 (0 -> 2.25); landing full width z -14.75..-17.25 (2.25);
   inner platform |x|<5, z -17.25..-24 (2.25); side flights 5<|x|<7, z -17.25..-24 (2.25 -> 4.5); balcony z -24..ez (4.5). */
const HRMG={z0:-8,z1:-14.75,z2:-17.25,z3:-24,up:4.5,mid:2.25,cw:1.6,iw:5,tr:.45,ri:.15};
function hrmGrandRF(x,z){const G=HRMG,ax=Math.abs(x),st=(a,b,y0)=>{const k=Math.min(15,Math.max(0,Math.floor((a-z)/G.tr)+1));return y0+k*G.ri};
 if(z>G.z0)return 0;if(z>G.z1)return ax<G.cw?st(G.z0,G.z1,0):0;if(z>G.z2)return G.mid;if(z>G.z3)return ax<G.iw?G.mid:st(G.z2,G.z3,G.mid);return G.up}
function hrmGrand(g,o){const G=HRMG,HX=o.HX,L=o.L,ez=-L-1,out={obs:[],occ:[],ward:[],dres:[],trimGaps:[],anims:[],lamps:[],rf:hrmGrandRF,up:G.up};
 const marble=hrmM('gMarble',{map:hflMarbleT(),roughness:.35}),pan=hrmM('gPan',{map:hrmPanelT(),roughness:.6}),run=hrmM('gRun',{color:0x7a1a20,roughness:1}),nose=hrmM('gNose',{color:0xd8d0c0,roughness:.4});
 /* steps: solid boxes from the floor, a marble tread with a nosing, a red runner up the middle */
 const steps=(xa,xb,za,y0,runW)=>{for(let k=0;k<15;k++){const zt=za-k*G.tr,y=y0+(k+1)*G.ri;hrmBx(g,xa,xb,0,y,zt-G.tr,zt,hrmM('gStep',{color:0xcfc6b2,roughness:.5}));hrmBx(g,xa-.01,xb+.01,y-.03,y+.01,zt-.03,zt+.025,nose);
   if(runW){const xc=(xa+xb)/2;hrmBx(g,xc-runW/2,xc+runW/2,y+.01,y+.022,zt-G.tr+.01,zt-.03,run)}}};
 steps(-G.cw,G.cw,G.z0,0,1.8);for(const s of[-1,1])steps(s>0?G.iw:-HX+.05,s>0?HX-.05:-G.iw,G.z2,G.mid,1.0);
 /* landing + inner platform, the balcony: solid, panelled where they face the room */
 hrmBx(g,-HX+.05,HX-.05,0,G.mid,G.z2,G.z1,pan);hrmBx(g,-G.iw,G.iw,0,G.mid,G.z3,G.z2,pan);hrmBx(g,-HX+.05,HX-.05,0,G.up,ez+.05,G.z3,pan);
 for(const[za,zb,xa,xb,y]of[[G.z1,G.z2,-HX+.05,HX-.05,G.mid],[G.z2,G.z3,-G.iw,G.iw,G.mid],[G.z3,ez+.05,-HX+.05,HX-.05,G.up]]){const t=hflMarbleT().clone();t.needsUpdate=true;t.repeat.set((xb-xa)/2,(za-zb)/2);hrmBx(g,xa,xb,y,y+.012,zb,za,new THREE.MeshStandardMaterial({map:t,roughness:.35}))}
 hrmBx(g,-HX+.05,HX-.05,G.mid-.04,G.mid+.02,G.z1-.03,G.z1+.03,nose);hrmBx(g,-G.iw,G.iw,G.up-.04,G.up+.02,G.z3-.03,G.z3+.03,nose);
 /* the wall under the balcony, between the side flights: a big clock */
 const clk=hflPlane(g,1.3,1.3,128,128,(x,w,h)=>{x.fillStyle='#e8dcb8';x.beginPath();x.arc(64,64,60,0,7);x.fill();x.strokeStyle='#5a4420';x.lineWidth=5;x.stroke();x.fillStyle='#2a2010';for(let i=0;i<12;i++){const a=i/12*Math.PI*2;x.fillRect(64+Math.sin(a)*50-2,64-Math.cos(a)*50-4,4,8)}x.lineWidth=4;x.beginPath();x.moveTo(64,64);x.lineTo(64,24);x.moveTo(64,64);x.lineTo(92,70);x.stroke()});
 clk.position.set(0,G.mid+1.15,G.z3+.012);const cr=new THREE.Mesh(new THREE.TorusGeometry(.66,.03,8,32),hrmBrass());cr.position.set(0,G.mid+1.15,G.z3+.02);g.add(cr);
 /* balustrades: newel posts, a handrail and balusters (instanced) */
 const bal=[],post=[];const rail=(xa,za,ya,xb,zb,yb)=>{const dx=xb-xa,dz=zb-za,dy=yb-ya,len=Math.hypot(dx,dz),n=Math.max(1,Math.round(len/.28));for(let i=0;i<=n;i++){const t=i/n;bal.push([xa+dx*t,ya+dy*t+.45,za+dz*t])}
  const r=new THREE.Mesh(new THREE.BoxGeometry(.09,.07,Math.hypot(len,dy)),hrmDark());r.position.set((xa+xb)/2,(ya+yb)/2+.93,(za+zb)/2);r.rotation.order='YXZ';r.rotation.y=Math.atan2(dx,dz);r.rotation.x=-Math.atan2(dy,len);g.add(r);post.push([xa,ya,za],[xb,yb,zb])};
 const ci=G.cw-.06,ii=G.iw+.06,z1i=G.z1-.06,z3i=G.z3-.06;
 for(const s of[-1,1]){rail(s*ci,G.z0,0,s*ci,z1i,G.mid);rail(s*ci,z1i,G.mid,s*(HX-.25),z1i,G.mid);rail(s*ii,G.z2,G.mid,s*ii,z3i,G.up);
  out.obs.push({x0:s*G.cw-.06,x1:s*G.cw+.06,z0:G.z1,z1:G.z0},{x0:Math.min(s*G.cw,s*(HX-.05)),x1:Math.max(s*G.cw,s*(HX-.05)),z0:G.z1-.06,z1:G.z1+.06},{x0:s*G.iw-.06,x1:s*G.iw+.06,z0:G.z3,z1:G.z2})}
 rail(-ii,z3i,G.up,ii,z3i,G.up);out.obs.push({x0:-G.iw,x1:G.iw,z0:G.z3-.06,z1:G.z3+.06});
 hrmInst(g,.05,.9,.05,hrmM('baluster',{color:0xe0d8c8,roughness:.5}),bal);
 const pl=[],seen=new Set();post.forEach(p=>{const k=p.map(v=>v.toFixed(2)).join();if(seen.has(k))return;seen.add(k);pl.push([p[0],p[1]+.55,p[2]])});const pm=new THREE.InstancedMesh(new THREE.BoxGeometry(.16,1.1,.16),hrmDark(),pl.length),ob=new THREE.Object3D();pl.forEach((p,i)=>{ob.position.set(...p);ob.updateMatrix();pm.setMatrixAt(i,ob.matrix)});g.add(pm);
 const bm=new THREE.InstancedMesh(new THREE.SphereGeometry(.09,12,8),hrmBrass(),pl.length);pl.forEach((p,i)=>{ob.position.set(p[0],p[1]+.62,p[2]);ob.updateMatrix();bm.setMatrixAt(i,ob.matrix)});g.add(bm);
 /* the chandelier over the hall: a chain, two brass rings, candle bulbs */
 const ch=new THREE.Group();ch.position.set(0,o.HY-.05,-5.5);g.add(ch);hflCy(ch,.012,.012,2.2,hrmBrass(),0,-1.1,0,6);
 for(const[r,y,n]of[[1.0,-2.6,12],[.6,-2.25,8]]){const rg=new THREE.Mesh(new THREE.TorusGeometry(r,.035,8,40),hrmBrass());rg.rotation.x=Math.PI/2;rg.position.y=y;ch.add(rg);
  for(let i=0;i<n;i++){const a=i/n*Math.PI*2;hflCy(ch,.02,.02,.16,hrmCream(),Math.cos(a)*r,y+.1,Math.sin(a)*r,6);const b=new THREE.Mesh(new THREE.SphereGeometry(.04,8,6),hrmM('cbulb',{color:0xfff0d0,emissive:0xffd890}));b.position.set(Math.cos(a)*r,y+.22,Math.sin(a)*r);b.scale.y=1.5;ch.add(b)}
  for(let i=0;i<4;i++){const a=i/4*Math.PI*2+.4;hrmRod(ch,[0,-2.2,0],[Math.cos(a)*r,y,Math.sin(a)*r],.01,hrmBrass())}}
 const dr=new THREE.Mesh(new THREE.SphereGeometry(.18,14,10),hrmBrass());dr.position.y=-2.75;ch.add(dr);
 out.lamps.push({x:0,y:o.HY-2.6,z:-5.5,c:0xffd8a0,i:1.1},{x:0,y:G.up+2.6,z:(G.z3+ez)/2,c:0xffd8a0,i:.6});
 /* sconces on the side walls at both levels */
 for(const s of[-1,1]){for(const z of[-3,-10]){const sc=hflSconce();sc.g.position.set(s*(HX-.05),2.4,z);sc.g.rotation.y=s>0?-Math.PI/2:Math.PI/2;g.add(sc.g);out.lamps.push({x:s*(HX-.5),y:2.5,z,c:0xffd8a0,i:.4,d:7})}{const zc=(G.z3+ez)/2;const sc=hflSconce();sc.g.position.set(s*(HX-.05),G.up+2.2,zc);sc.g.rotation.y=s>0?-Math.PI/2:Math.PI/2;g.add(sc.g);out.lamps.push({x:s*(HX-.5),y:G.up+2.3,z:zc,c:0xffd8a0,i:.4,d:7})}}
 out.lamps.push({x:0,y:G.mid+3,z:(G.z1+G.z3)/2,c:0xffd8a0,i:.6,d:12});
 /* two big portraits on the side walls of the hall */
 for(const s of[-1,1]){hflB(g,.05,2.2,1.6,hrmM('picF',{color:0x8a6a2a}),s*(HX-.072),3.6,-6.5);const pp=hflPlane(g,1.3,1.8,128,192,(x,w,h)=>{x.drawImage(hrmPortraitT(s>0?1:0).image,0,0,w,h)});pp.position.set(s*(HX-.108),3.6,-6.5);pp.rotation.y=s>0?-Math.PI/2:Math.PI/2}
 out.occ.push({s:-1,z:-6.5,h:1},{s:1,z:-6.5,h:1});
 return out}
/* a painted portrait: a dark background, a figure in a dark coat, a pale face; the eyes are painted */
function hrmPortraitT(i){const k='portT'+i;return HRM[k]||(HRM[k]=hflCan(128,192,610+i,(x,R)=>{const bg=x.createLinearGradient(0,0,0,192);bg.addColorStop(0,i?'#2a3a2a':'#3a2a1a');bg.addColorStop(1,'#100a06');x.fillStyle=bg;x.fillRect(0,0,128,192);
  x.fillStyle='#1a1410';x.beginPath();x.moveTo(20,192);x.quadraticCurveTo(28,110,64,104);x.quadraticCurveTo(100,110,108,192);x.fill();x.fillStyle='#d8b898';x.beginPath();x.ellipse(64,72,22,28,0,0,7);x.fill();
  x.fillStyle=i?'#2a1a10':'#c8c0b0';x.beginPath();x.ellipse(64,50,24,14,0,Math.PI,0);x.fill();x.fillStyle='#1a0a04';x.fillRect(53,68,7,4);x.fillRect(68,68,7,4);x.fillStyle='#e8e0d0';x.fillRect(48,112,32,8);
  x.strokeStyle='#8a6a2a';x.lineWidth=6;x.strokeRect(3,3,122,186)},200))}

/* ===================== 4. restaurant ===================== */
function hrmRestaurant(g,o){const R=hflRng(o.seed*31+4),HX=o.HX,out={obs:[],occ:[],ward:[],dres:[],trimGaps:[],anims:[],lamps:[]};
 const cloth=hrmM('cloth',{color:0xf0ece0,roughness:.95}),ch=hrmM('chairR',{color:0x3a2010,roughness:.6}),seat=hrmM('seatR',{color:0x6a1a1e,roughness:.9});
 /* round tables in two rows, an aisle down the middle */
 for(const xs of[-1,1])for(let z=-5;z>-o.L+3.5;z-=4.4){const x=xs*3.3;hflCy(g,.66,.66,.32,cloth,x,.6,z,24);hflCy(g,.66,.66,.02,cloth,x,.77,z,24);hflCy(g,.05,.05,.44,hrmDark(),x,.22,z,8);hflCy(g,.3,.3,.02,hrmDark(),x,.01,z,16);
  for(let k=0;k<4;k++){const a=k*Math.PI/2+(R()<.2?.3:0);hrmChair(g,x+Math.sin(a)*.95,z+Math.cos(a)*.95,a,ch,seat)}
  /* a candle and two place settings */
  hflCy(g,.025,.025,.14,hrmCream(),x,.85,z,8);const fl=new THREE.Mesh(new THREE.SphereGeometry(.018,6,6),hrmM('flame',{color:0xffd890,emissive:0xffb040}));fl.scale.y=1.8;fl.position.set(x,.95,z);g.add(fl);
  for(const a of[0,Math.PI]){const p=hflCy(g,.12,.12,.012,hrmM('plate',{color:0xf8f8f0,roughness:.3}),x+Math.sin(a)*.4,.786,z+Math.cos(a)*.4,16)}
  out.obs.push({x0:x-1.2,x1:x+1.2,z0:z-1.2,z1:z+1.2})}
 /* the host stand by the door */
 const hs=new THREE.Group();hs.position.set(2.2,0,-1.6);g.add(hs);hflB(hs,.7,1.1,.45,hrmM('hostS',{map:hrmPanelT()}),0,.55,0);hflB(hs,.8,.05,.55,hrmDark(),0,1.12,0);hflB(hs,.36,.012,.26,hrmCream(),-.1,1.151,0);
 const lp=hflCy(hs,.01,.01,.3,hrmBrass(),.28,1.3,-.1,6);const ls=new THREE.Mesh(new THREE.SphereGeometry(.07,12,8,0,Math.PI*2,0,Math.PI/2),hrmM('hostL',{color:0x2a6a3a,emissive:0x1a3a20,side:THREE.DoubleSide}));ls.position.set(.28,1.45,-.1);hs.add(ls);
 out.obs.push({x0:1.75,x1:2.65,z0:-1.9,z1:-1.3});
 /* the kitchen doors (fake): a pair of swing doors with round windows, on a side wall */
 const ks=R()<.5?-1:1,kz=-Math.round(o.L*.55);const kd=new THREE.Group();kd.position.set(ks*(HX-.05),0,kz);kd.rotation.y=ks>0?-Math.PI/2:Math.PI/2;g.add(kd);
 hflB(kd,1.9,2.5,.08,hrmM('kFrame',{color:0x6a6a66,roughness:.5,metalness:.3}),0,1.25,.03);for(const sx of[-1,1]){hflB(kd,.82,2.2,.05,hrmM('kDoor',{color:0xb8b8b0,roughness:.4,metalness:.4}),sx*.42,1.12,.08);
  const w=hflCy(kd,.16,.16,.02,hrmM('kWin',{color:0x1a2a2a,roughness:.1,emissive:0x0a1a10}),sx*.42,1.6,.106,20);w.rotation.x=Math.PI/2;const rw=new THREE.Mesh(new THREE.TorusGeometry(.17,.02,6,20),hrmM('kRim',{color:0x8a8a84,metalness:.5,roughness:.4}));rw.position.set(sx*.42,1.6,.11);kd.add(rw);hflB(kd,.7,.2,.012,hrmM('kKick',{color:0x8a8a84,metalness:.5,roughness:.4}),sx*.42,.2,.112)}
 const sg=hflPlane(kd,.9,.18,180,36,(x,w,h)=>{x.fillStyle='#1a1a1a';x.fillRect(0,0,w,h);x.fillStyle='#e8e0c8';x.font='bold 22px DoorsSans,Arial,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('KITCHEN · STAFF',w/2,h/2+1)});sg.position.set(0,2.66,.032);hflB(kd,.96,.22,.02,hrmM('kSignB',{color:0x2a2a2a}),0,2.66,.01);
 out.trimGaps.push({s:ks,z0:kz-1,z1:kz+1});out.occ.push({s:ks,z:kz,h:1.3});
 /* a dessert trolley by the kitchen and a waiter's station on the other wall */
 const tr=new THREE.Group();tr.position.set(ks*(HX-.6),0,kz-1.6);g.add(tr);for(const y of[.25,.85])hflB(tr,.5,.03,.9,hrmBrass(),0,y,0);for(const[a,b]of[[-.22,-.42],[.22,-.42],[-.22,.42],[.22,.42]])hflCy(tr,.012,.012,.85,hrmBrass(),a,.425,b,6);
 const cake=hflCy(tr,.13,.13,.12,hrmM('cake',{color:0xe8c8b0,roughness:.9}),0,.93,.15,16);hflCy(tr,.1,.1,.1,hrmM('cake2',{color:0x5a2a1a,roughness:.9}),0,.92,-.2,16);out.obs.push({x0:ks*(HX-.6)-.3,x1:ks*(HX-.6)+.3,z0:kz-2.1,z1:kz-1.1});
 const ws=new THREE.Group(),wz=-o.L+3;ws.position.set(-ks*(HX-.05),0,wz);ws.rotation.y=-ks>0?-Math.PI/2:Math.PI/2;g.add(ws);hflB(ws,1.6,.9,.5,hrmM('wsB',{map:hrmPanelT()}),0,.45,.27);hflB(ws,1.66,.04,.55,hrmDark(),0,.92,.27);
 for(let i=0;i<4;i++)hflCy(ws,.12,.12,.012,hrmM('plate'),-.5,.95+i*.014,.3,16);for(let i=0;i<5;i++)hflCy(ws,.03,.03,.12,hrmM('glass'),.2+i*.09,1.0,.25,8);
 {const w0=-ks>0?HX-.6:-HX+.05,w1=-ks>0?HX-.05:-HX+.6;out.obs.push({x0:w0,x1:w1,z0:wz-.85,z1:wz+.85})}out.occ.push({s:-ks,z:wz,h:1});
 return out}

/* ===================== 5. games room ===================== */
function hrmGames(g,o){const R=hflRng(o.seed*31+5),HX=o.HX,out={obs:[],occ:[],ward:[],dres:[],trimGaps:[],anims:[],lamps:[]};
 const felt=hrmM('felt',{color:0x1e5a2e,roughness:1}),cush=hrmM('feltC',{color:0x1a4a26,roughness:1}),rim=hrmM('bilRim',{color:0x3a1a0c,roughness:.45});
 const bt=[[-6.5],[-13.5]].map(([z])=>z);
 for(const z of bt){const t=new THREE.Group();t.position.set(0,0,z);g.add(t);
  hflB(t,1.5,.16,2.7,hrmDark(),0,.62,0);hflB(t,1.25,.03,2.5,felt,0,.715,0);for(const s of[-1,1]){hflB(t,.12,.08,2.66,rim,s*.69,.74,0);hflB(t,1.52,.08,.12,rim,0,.745,s*1.33);for(const[za,zb]of[[.08,1.13],[-1.13,-.08]])hflB(t,.04,.04,zb-za,cush,s*.61,.726,(za+zb)/2);hflB(t,1.06,.04,.04,cush,0,.726,s*1.245)}
  for(const[a,b]of[[-.62,-1.2],[.62,-1.2],[-.62,1.2],[.62,1.2],[-.62,0],[.62,0]]){const pk=hflCy(t,.05,.05,.012,hrmM('pocket',{color:0x0a0a0a}),a,.736,b,12)}
  for(const[a,b]of[[-.62,-1.2],[.62,-1.2],[-.62,1.2],[.62,1.2]])hflCy(t,.09,.07,.54,hrmDark(),a,.27,b,10);
  /* balls: a racked triangle at one end and the cue ball */
  const bc=[0xe8c020,0x2040a0,0xc02020,0x5020a0,0xe07020,0x208040,0x801818,0x101010,0xe8c020,0x2040a0];let k=0;for(let r=0;r<4;r++)for(let i=0;i<=r;i++){const b=new THREE.Mesh(new THREE.SphereGeometry(.028,10,8),hrmM('ball'+(k%10),{color:bc[k%10],roughness:.25}));b.position.set((i-r/2)*.058,.758,-.6-r*.05);t.add(b);k++}
  const cb=new THREE.Mesh(new THREE.SphereGeometry(.028,10,8),hrmM('ballW',{color:0xf4f0e8,roughness:.25}));cb.position.set(.1,.758,.65);t.add(cb);
  /* the billiard lamp: a long bar with three green shades */
  const lb=new THREE.Group();lb.position.set(0,o.HY-.04,z);g.add(lb);for(const s of[-1,1])hflCy(lb,.006,.006,1.1,hrmBrass(),0,-.55,s*.8,6);const bar=hflB(lb,.06,.05,1.9,hrmBrass(),0,-1.12,0);
  for(const dz of[-.75,0,.75]){const sh=new THREE.Mesh(new THREE.CylinderGeometry(.08,.22,.18,16,1,true),hrmM('bilShade',{color:0x1e5a2e,emissive:0x0a2a10,side:THREE.DoubleSide,roughness:.5}));sh.position.set(0,-1.24,dz);lb.add(sh);
   const bu=new THREE.Mesh(new THREE.SphereGeometry(.04,8,6),hrmM('cbulb'));bu.position.set(0,-1.28,dz);lb.add(bu)}
  out.lamps.push({x:0,y:o.HY-1.4,z,c:0xfff0d0,i:.7});out.obs.push({x0:-.8,x1:.8,z0:z-1.4,z1:z+1.4})}
 /* a cue rack and a bead scoreboard on one wall */
 const s=R()<.5?-1:1,xw=s*(HX-.05),rz=-10;const rk=new THREE.Group();rk.position.set(xw,0,rz);rk.rotation.y=s>0?-Math.PI/2:Math.PI/2;g.add(rk);
 hflB(rk,1.1,.08,.12,hrmDark(),0,.3,.06);hflB(rk,1.1,.08,.1,hrmDark(),0,1.45,.05);for(let i=0;i<6;i++){const c=hflCy(rk,.008,.016,1.4,hrmM('cue',{color:0xc8a070,roughness:.5}),-.45+i*.18,1.0,.07,8)}
 hflB(rk,1.0,.5,.04,hrmDark(),0,2.05,.02);for(const r of[0,1]){hflCy(rk,.005,.005,.9,hrmBrass(),0,1.95+r*.2,.05,6).rotation.z=Math.PI/2;for(let i=0;i<8;i++){const b=new THREE.Mesh(new THREE.SphereGeometry(.025,8,6),hrmM('bead'+r,{color:r?0xc02020:0xe8e0c8}));b.position.set(-.4+i*.06+(i>4?.2:0),1.95+r*.2,.05);rk.add(b)}}
 out.occ.push({s,z:rz,h:.8});
 /* a dartboard on the other wall, with the throw line on the floor */
 const dz=-o.L+4.5,ds=-s,dx=ds*(HX-.05);const db=new THREE.Group();db.position.set(dx,1.73,dz);db.rotation.y=ds>0?-Math.PI/2:Math.PI/2;g.add(db);
 hflB(db,.7,.7,.04,hrmDark(),0,0,.015);const face=hflPlane(db,.46,.46,128,128,(x,w,h)=>{x.fillStyle='#101010';x.beginPath();x.arc(64,64,63,0,7);x.fill();for(let i=0;i<20;i++){const a0=i/20*Math.PI*2,a1=(i+1)/20*Math.PI*2;for(const[r0,r1,c1,c2]of[[50,56,'#c02020','#208040'],[10,48,'#e8dcc0','#101010'],[28,32,'#c02020','#208040']]){x.fillStyle=i%2?c1:c2;x.beginPath();x.arc(64,64,r1,a0,a1);x.arc(64,64,r0,a1,a0,true);x.fill()}}x.fillStyle='#208040';x.beginPath();x.arc(64,64,8,0,7);x.fill();x.fillStyle='#c02020';x.beginPath();x.arc(64,64,4,0,7);x.fill()});face.position.z=.046;
 for(let i=0;i<3;i++){const d=hflCy(db,.006,.003,.14,hrmM('dart',{color:0xc8c8c8,metalness:.5,roughness:.3}),-.06+i*.07,.03-i*.05,.1,6);d.rotation.x=Math.PI/2}
 hrmBx(g,Math.min(dx-ds*2.37,dx-ds*2.33),Math.max(dx-ds*2.37,dx-ds*2.33),0,.012,dz-.5,dz+.5,hrmBrass());out.occ.push({s:ds,z:dz,h:.8});
 /* a card table with chips and cards, four chairs */
 const cx=-s*2.6,cz=-18.5;hflCy(g,.7,.7,.04,hrmM('cardF',{color:0x1e5a2e,roughness:1}),cx,.76,cz,24);hflCy(g,.72,.72,.05,hrmDark(),cx,.73,cz,24);hflCy(g,.06,.12,.7,hrmDark(),cx,.35,cz,10);
 for(let k=0;k<4;k++){const a=k*Math.PI/2+Math.PI/4;hrmChair(g,cx+Math.sin(a)*1.0,cz+Math.cos(a)*1.0,a)}
 for(let i=0;i<9;i++){const c=hflB(g,.06,.003,.09,hrmM('card',{color:0xf4f0e8}),cx+(R()-.5)*.8,.7815+i*.0005,cz+(R()-.5)*.8);c.rotation.y=R()*3}
 for(let i=0;i<4;i++)for(let j=0;j<3+i;j++)hflCy(g,.02,.02,.008,hrmM('chip'+i,{color:[0xc02020,0x2040a0,0x101010,0xe8e0c8][i]}),cx-.3+i*.2,.786+j*.009,cz+.3,10);
 out.obs.push({x0:cx-1.3,x1:cx+1.3,z0:cz-1.3,z1:cz+1.3});
 /* the jukebox near the door */
 const jb=hrmJukebox();jb.g.position.set(s*(HX-.05),0,-3);jb.g.rotation.y=s>0?-Math.PI/2:Math.PI/2;g.add(jb.g);out.obs.push({x0:s*(HX-.05)-(s>0?.65:0),x1:s*(HX-.05)+(s<0?.65:0),z0:-3.5,z1:-2.5});out.occ.push({s,z:-3,h:.6});out.anims.push(jb.anim);
 return out}
function hrmJukebox(){const g=new THREE.Group(),wd=hrmM('jbW',{color:0x5a2a14,roughness:.5});hflB(g,.9,1.1,.6,wd,0,.55,.3);
 const arch=new THREE.Mesh(new THREE.CylinderGeometry(.45,.45,.58,24),wd);arch.rotation.x=Math.PI/2;arch.position.set(0,1.1,.3);g.add(arch);
 const glow=new THREE.Mesh(new THREE.TorusGeometry(.38,.035,8,24,Math.PI),hrmM('jbG',{color:0xffa040,emissive:0xff7020}));glow.position.set(0,1.1,.62);g.add(glow);
 const win=hflPlane(g,.6,.3,128,64,(x,w,h)=>{x.fillStyle='#2a1a10';x.fillRect(0,0,w,h);for(let i=0;i<6;i++){x.fillStyle='#e8c060';x.fillRect(10+i*19,10,14,44);x.fillStyle='#2a1a10';x.fillRect(14+i*19,20,6,6)}},.4);win.position.set(0,1.1,.615);
 for(const sx of[-.3,.3]){const t=hflCy(g,.04,.04,1.0,hrmM('jbT',{color:0xff5030,emissive:0xa02010,transparent:true,opacity:.85}),sx,.55,.62,10)}
 const gr=hflPlane(g,.5,.35,64,48,(x,w,h)=>{x.fillStyle='#3a2010';x.fillRect(0,0,w,h);x.strokeStyle='#c8a050';x.lineWidth=2;for(let i=0;i<8;i++){x.beginPath();x.moveTo(4,4+i*5.5);x.lineTo(60,4+i*5.5);x.stroke()}});gr.position.set(0,.4,.612);
 return{g,anim:(dt,t)=>{glow.material.emissiveIntensity=.7+.3*Math.sin(t*3)}}}

/* ===================== 6. the jog room: the hall steps sideways half-way ===================== */
/* The whole shell: floor, ceiling, walls with the hotel trim. J = the sideways step (+ right, - left), HX 4, HY 4.
   Part A z 1..zA at x -4..4, an angled part zA..zB, part B zB..ez at x J-4..J+4. The exit door is at DX = J.
   Returns: path (for Rush/Ambush), lamps (down the middle line), inside(x,z) (the walkable outline), DX. */
function hrmJog(g,o){const L=o.L,HX=4,HY=o.HY,J=o.J,ez=-L-1,zA=-Math.round(L*.4),zB=zA-3,out={obs:[],occ:[],ward:[],dres:[],trimGaps:[],anims:[],lamps:[],DX:J};
 const mat=o.mat,c0=o.col||(c=>c);
 /* the outline, as two wall polylines (left and right) */
 const Lw=[[-HX,1],[-HX,zA],[J-HX,zB],[J-HX,ez]],Rw=[[HX,1],[HX,zA],[J+HX,zB],[J+HX,ez]];
 const poly=[...Lw,...Rw.slice().reverse()];
 for(const[y,k,up]of[[0,'floor',1],[HY,'ceil',0]]){const sh=new THREE.Shape();poly.forEach((p,i)=>{const v=up?-p[1]:p[1];i?sh.lineTo(p[0],v):sh.moveTo(p[0],v)});const gm=new THREE.ShapeGeometry(sh);gm.rotateX(up?-Math.PI/2:Math.PI/2);
  const P=gm.attributes.position,U=gm.attributes.uv;for(let i=0;i<P.count;i++)U.setXY(i,P.getX(i)/2,P.getZ(i)/2);const ms=new THREE.Mesh(gm,mat(k,1,1));ms.position.y=y;g.add(ms)}
 /* a wall piece from p to q with the trim on the room side (sgn: the room is at local x = sgn). e0/e1 lengthen it at
    each end (the jog joints) so the trim closes at the outer corner; a = 1 lifts the angled pieces' trim 2-4 mm so it
    never shares a face with the straight pieces where they overlap */
 const piece=(p,q,sgn,e0,e1,a)=>{const dx=q[0]-p[0],dz=q[1]-p[1],len=Math.hypot(dx,dz),ux=dx/len,uz=dz/len,L2=len+e0+e1,cx=(p[0]+q[0])/2+ux*(e1-e0)/2,cz=(p[1]+q[1])/2+uz*(e1-e0)/2;
  const grp=new THREE.Group();grp.position.set(cx,0,cz);grp.rotation.y=Math.atan2(dx,dz);g.add(grp);const lift=a?.004:0;
  hflB(grp,.1,HY,L2,mat('wall',L2/4,HY/2),0,HY/2,0);hflB(grp,.06,1,L2,mat('wains',L2/1.2,1),sgn*.05,.5+lift/2,0);hflB(grp,.07,.07,L2,hrmM('t'+c0(0x6e4326),{color:c0(0x6e4326)}),sgn*.07,1.03+lift,0);
  hflB(grp,.08,.14,L2,hrmM('t'+c0(0x2a1608),{color:c0(0x2a1608)}),sgn*.07,.07+lift/2,0);hflB(grp,.08,.14,L2,hrmM('t'+c0(0xd8c8a8),{color:c0(0xd8c8a8)}),sgn*.06,HY-.07-lift,0)};
 const th=Math.atan2(Math.abs(J),zA-zB),e=.12*Math.tan(th/2);
 for(const[W,sg]of[[Lw,-1],[Rw,1]]){piece(W[0],W[1],sg,0,e,0);piece(W[1],W[2],sg,e,e,1);piece(W[2],W[3],sg,e,0,0)}
 /* the exit wall at ez: a 1.6 x 3 m hole at x J, the trim on its room face */
 for(const[x0,x1]of[[J-HX,J-.8],[J+.8,J+HX]]){const w=x1-x0,xc=(x0+x1)/2;hflB(g,w,HY,.1,mat('wall',w/4,HY/2),xc,HY/2,ez);const t0=x0<J?x0+.11:x0,t1=x0<J?x1:x1-.11,tw=t1-t0,tc=(t0+t1)/2;
  hflB(g,tw,1,.06,mat('wains',tw/1.2,1),tc,.5,ez+.08);hflB(g,tw,.07,.07,hrmM('t'+c0(0x6e4326),{color:c0(0x6e4326)}),tc,1.03,ez+.1);hflB(g,tw,.14,.08,hrmM('t'+c0(0x2a1608),{color:c0(0x2a1608)}),tc,.07,ez+.09)}
 hflB(g,1.6,HY-3,.1,mat('wall',.4,(HY-3)/2),J,(3+HY)/2,ez);hflB(g,2*HX-.22,.14,.08,hrmM('t'+c0(0xd8c8a8),{color:c0(0xd8c8a8)}),J,HY-.07,ez+.09);
 out.path=[[0,1],[0,zA],[J,zB],[J,ez]];out.lamps=[{x:0,y:HY-.5,z:-3},{x:J/2,y:HY-.5,z:(zA+zB)/2},{x:J,y:HY-.5,z:zB-4},{x:J,y:HY-.5,z:ez+3}];
 const inside=(x,z)=>{if(z>zA)return Math.abs(x)<HX-.35;if(z<zB)return Math.abs(x-J)<HX-.35;const t=(zA-z)/(zA-zB),c=J*t;return Math.abs(x-c)<HX-.35};out.inside=inside;out.zA=zA;out.zB=zB;
 return out}
