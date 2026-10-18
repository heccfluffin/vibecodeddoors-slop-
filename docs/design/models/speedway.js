/* The Speedway (speedway-farms.md). Needs fort-kit.js (fbKit) and airfield.js (afCanvas). Desert-local coordinates,
   y up from the sand. +z is north. Everything is noSeam.

   The oval itself does not move: centre (300, -1830), straights from x 228 to 372, bends of radius 38 round
   (228, -1830) and (372, -1830), 14 m wide. The main straight is the north one (z -1792), driven east.

   spTrack(g)  batch 1: the track surface, kerbs, the tyre walls, the concrete wall and catch fence along the main
               straight, the pit wall, the chequered line and the start gantry.
               Returns {obs, board, lights}:
                 board   the BEST LAP board (a label mesh, 4 x 0.9, 512 x 115 canvas): give it to q.race.bd as now,
                         xpRaceBoard swaps its map.
                 lights(reds, green)  the start lights: reds 0..5 lit, green true/false.
*/
function spKit(){if(spKit.k)return spKit.k;const f=fbKit(),k=Object.create(f);k.M=f.M;spKit.k=k;return k}
const SPW={cx:300,cz:-1830,RX:110,RZ:38,TW:14};
/* a point on the oval: u = metres along the centre line, from the west end of the main straight, driving east;
   r = distance from the line through the two bend centres (38 is the centre line, 31 and 45 the edges) */
function spPt(u,r){const{cx,cz,RX,RZ}=SPW,S=2*(RX-RZ),P=2*S+2*Math.PI*RZ;u=((u%P)+P)%P;
 if(u<S)return[cx-S/2+u,cz+r];u-=S;
 if(u<Math.PI*RZ){const a=u/RZ;return[cx+S/2+r*Math.sin(a),cz+r*Math.cos(a)]}u-=Math.PI*RZ;
 if(u<S)return[cx+S/2-u,cz-r];u-=S;{const a=u/RZ;return[cx-S/2-r*Math.sin(a),cz-r*Math.cos(a)]}}
const spLen=()=>{const{RX,RZ}=SPW;return 4*(RX-RZ)+2*Math.PI*RZ};
/* the u values to sample from u0 to u1: the straights' ends, and every ~1.5 degrees round the bends */
function spSteps(u0,u1){const{RX,RZ}=SPW,S=2*(RX-RZ),B=Math.PI*RZ,marks=[0,S,S+B,2*S+B,2*S+2*B],out=[u0];const inBend=u=>{const v=((u%(2*S+2*B))+(2*S+2*B))%(2*S+2*B);return(v>S&&v<S+B)||v>2*S+B};
 let u=u0;while(u<u1-1e-6){const nx=marks.map(m=>{let v=m;while(v<=u+1e-6)v+=2*S+2*B;return v}).reduce((a,b)=>Math.min(a,b));const st=inBend(u+.01)?RZ*.026:1e9;u=Math.min(u1,nx,u+st);out.push(u)}return out}
/* a flat (or upright) ribbon along the oval between radii r0 and r1, from u0 to u1.
   Flat: y is the height (or [y at r0, y at r1] for a slope). Upright (up=[y0,y1]): a wall at radius r0. UVs: x across (0..1), y = metres along / vlen. */
function spRibbon(u0,u1,r0,r1,y,vlen,up){const us=spSteps(u0,u1),pos=[],uv=[],idx=[];
 us.forEach((u,i)=>{const a=spPt(u,r0),b=up?a:spPt(u,r1),v=(u-u0)/vlen;if(up){pos.push(a[0],up[0],a[1],b[0],up[1],b[1])}else{const ya=Array.isArray(y)?y[0]:y,yb=Array.isArray(y)?y[1]:y;pos.push(a[0],ya,a[1],b[0],yb,b[1])};uv.push(0,v,1,v)});
 for(let i=0;i<us.length-1;i++){const a=i*2,b=a+1,c=a+2,d=a+3;if(up){idx.push(a,c,b,b,c,d);continue}
  const ax=pos[a*3],az=pos[a*3+2],bx=pos[b*3],bz=pos[b*3+2],cx=pos[c*3],cz=pos[c*3+2],cy=(bz-az)*(cx-ax)-(bx-ax)*(cz-az);
  if(cy>0)idx.push(a,b,c,b,d,c);else idx.push(a,c,b,b,c,d)}
 const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));ge.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));ge.setIndex(idx);ge.computeVertexNormals();return ge}
const spRep=t=>{t.wrapS=t.wrapT=THREE.RepeatWrapping;return t};

function spTrack(g){const k=spKit(),{B,C,rod,slab,L}=k.H(g),M=k.M,obs=[],{cx,cz,RX,RZ}=SPW,S=2*(RX-RZ),P=spLen(),NZ=cz+RZ+8/* the outer wall line on the main straight, z -1784 */;
 /* ---- the track: one dirt texture all the way round (14 m across, 28 m per tile), two dark grooves on the racing
    line, white edge lines half a metre in ---- */
 {let sd=11;const r=()=>((sd=Math.imul(sd^sd>>>15,sd|1)+0x6d2b79f5|0)>>>0)/4294967296;
  const t=spRep(afCanvas(256,512,(x,w,h)=>{x.fillStyle='#9a7448';x.fillRect(0,0,w,h);for(let i=0;i<9000;i++){const v=r();x.fillStyle=v<.5?'rgba(60,36,16,.12)':'rgba(255,230,190,.08)';x.fillRect(r()*w,r()*h,1+r()*2,1+r()*2)}
   for(let i=0;i<40;i++){x.fillStyle='rgba(70,44,20,'+(.04+r()*.06)+')';x.beginPath();x.ellipse(r()*w,r()*h,8+r()*30,20+r()*70,0,0,7);x.fill()}
   /* tyre grooves: soft dark bands along the racing line, with fine streaks */for(const gx of[.36,.5,.64]){const c=gx*w,gr=x.createLinearGradient(c-22,0,c+22,0);gr.addColorStop(0,'rgba(50,30,14,0)');gr.addColorStop(.5,'rgba(50,30,14,.22)');gr.addColorStop(1,'rgba(50,30,14,0)');x.fillStyle=gr;x.fillRect(c-22,0,44,h);for(let j=0;j<14;j++){x.fillStyle='rgba(40,24,10,.18)';x.fillRect(c-18+r()*36,0,1,h)}}
   /* white edge lines (worn) */x.fillStyle='#ece6d8';for(const ex of[9,w-14]){x.fillRect(ex,0,5,h)}for(let i=0;i<220;i++){x.fillStyle='rgba(154,116,72,.8)';x.fillRect(r()<.5?9+r()*5:w-14+r()*5,r()*h,2,2+r()*4)}}));
  const m=new THREE.Mesh(spRibbon(0,P,RZ-7,RZ+7,.05,28),new THREE.MeshStandardMaterial({map:t,roughness:1,polygonOffset:true,polygonOffsetUnits:-1}));g.add(m)}
 /* ---- kerbs: red and white, on the inside of both bends, a hand's height proud of the dirt with a sloped edge ---- */
 {const t=spRep(afCanvas(16,128,(x,w,h)=>{for(let i=0;i<4;i++){x.fillStyle=i%2?'#f2efe8':'#c8282a';x.fillRect(0,i*32,w,32)}x.fillStyle='rgba(0,0,0,.12)';x.fillRect(0,0,w,2)}));
  const KM=new THREE.MeshStandardMaterial({map:t,roughness:.7,polygonOffset:true,polygonOffsetUnits:-2});
  for(const[u0,u1]of[[S,S+Math.PI*RZ],[2*S+Math.PI*RZ,P]]){g.add(new THREE.Mesh(spRibbon(u0,u1,RZ-7,RZ-6.1,.1,6),KM));/* the sloped track-side edge */const e=new THREE.Mesh(spRibbon(u0,u1,RZ-6.1,RZ-5.75,[.1,.052],6),KM);g.add(e);
   /* the little upright face on the infield side */g.add(new THREE.Mesh(spRibbon(u0,u1,RZ-7,0,0,6,[.04,.1]),new THREE.MeshStandardMaterial({map:t,roughness:.7,side:THREE.DoubleSide})))}}
 /* ---- tyre walls: stacks of three tyres every metre, bolted, with a red-and-white belt on the track side.
    Inner wall all the way round (radius 30); outer wall (radius 46) round both bends and the back straight. The main
    straight has the concrete wall instead, and the pit lane opens between x 323 and the start of the east bend. ---- */
 {const side=spRep(afCanvas(64,64,(x,w,h)=>{x.fillStyle='#1c1c1e';x.fillRect(0,0,w,h);for(let i=0;i<3;i++){const y0=i*h/3;x.fillStyle='#2a2a2e';x.fillRect(0,y0+3,w,h/3-6);x.fillStyle='#121214';x.fillRect(0,y0,w,2);x.fillRect(0,y0+h/3-2,w,2);for(let j=0;j<8;j++){x.fillStyle='rgba(255,255,255,.05)';x.fillRect(j*8,y0+6,4,h/3-12)}}}));
  const top=afCanvas(64,64,(x,w,h)=>{x.fillStyle='#1c1c1e';x.fillRect(0,0,w,h);x.fillStyle='#08080a';x.beginPath();x.arc(32,32,19,0,7);x.fill();x.strokeStyle='#2c2c30';x.lineWidth=3;x.beginPath();x.arc(32,32,26,0,7);x.stroke()});
  const TM=[new THREE.MeshStandardMaterial({map:side,roughness:.95}),new THREE.MeshStandardMaterial({map:top,roughness:.95}),new THREE.MeshStandardMaterial({color:0x101012})];
  const ge=new THREE.CylinderGeometry(.47,.47,.84,12,1);const pts=[];
  const walk=(r,u0,u1)=>{let prev=null,acc=1;for(let u=u0;u<=u1;u+=.05){const p=spPt(u,r);if(prev)acc+=Math.hypot(p[0]-prev[0],p[1]-prev[1]);prev=p;if(acc>=.98){acc=0;pts.push(p)}}};
  const a0=Math.asin(6/(RZ+8));/* the pit exit: the outer wall starts where the bend is 6 m past x 372 */
  walk(RZ-8,0,P-.5);walk(RZ+8,S+a0*RZ,P-.05);
  const im=new THREE.InstancedMesh(ge,TM,pts.length),mm=new THREE.Matrix4();pts.forEach((p,i)=>{mm.makeTranslation(p[0],.42,p[1]);im.setMatrixAt(i,mm)});im.instanceMatrix.needsUpdate=true;im.frustumCulled=false;g.add(im);
  /* obstacles: one box per three stacks */for(let i=0;i<pts.length;i+=3){const grp=pts.slice(i,i+3),xs=grp.map(p=>p[0]),zs=grp.map(p=>p[1]);obs.push({x0:Math.min(...xs)-.47,x1:Math.max(...xs)+.47,z0:Math.min(...zs)-.47,z1:Math.max(...zs)+.47})}
  /* the belt: a strap round the track side of each wall, red and white in 3 m blocks, bolted at the top */
  const bt=spRep(afCanvas(32,256,(x,w,h)=>{for(let i=0;i<2;i++){x.fillStyle=i?'#f0ece4':'#c42424';x.fillRect(0,i*h/2,w,h/2)}x.fillStyle='rgba(0,0,0,.25)';x.fillRect(0,0,w,2);x.fillRect(0,h-2,w,2);x.fillStyle='rgba(0,0,0,.35)';for(let i=0;i<8;i++){x.fillRect(4,i*32+14,3,3);x.fillRect(w-7,i*32+14,3,3)}}));
  const BM=new THREE.MeshStandardMaterial({map:bt,roughness:.8,side:THREE.DoubleSide});
  const belt=(r,u0,u1)=>g.add(new THREE.Mesh(spRibbon(u0,u1,r,0,0,6,[.04,.86]),BM));
  belt(RZ-8+.49,0,P);belt(RZ+8-.49,S+a0*RZ,P)}
 /* ---- the concrete wall along the main straight (x 228..323): a jersey barrier, white, with sponsor boards on the
    track side and a catch fence leaning over the track ---- */
 {const CW=M(0xdcd8d0,{roughness:.9}),wx0=cx-S/2,wx1=323,wl=wx1-wx0;
  slab([[-.3,0],[.3,0],[.3,.08],[.11,.32],[.11,1.05],[-.11,1.05],[-.11,.32],[-.3,.08]],wl,CW,(wx0+wx1)/2,0,NZ,Math.PI/2);
  obs.push({x0:wx0,x1:wx1,z0:NZ-.3,z1:NZ+.3});
  /* sponsor boards on the upright part, facing the track (south) */
  const ads=[['GWEEN SODA','#2a9a3a','#ffffff'],['EL GOBLINO GAS · BREAD · NO GAS','#f0d020','#1a1a1a'],['DOORS BUT DESERT','#1a1a2a','#ffe040'],['FIRST DARK BANK','#2a3a6a','#f4ecdc'],['MOTEL 13 · VACANCY','#a02020','#ffffff'],['DUSTY GULCH SPEEDWAY','#f4f0e8','#c02020']];
  const n=10,bw=wl/n;for(let i=0;i<n;i++){const[a,bg,fg]=ads[i%ads.length];const t=k.lab(a,bw-.2,.56,bg,fg,40);t.position.set(wx0+bw*(i+.5),.69,NZ-.122);t.rotation.y=Math.PI;g.add(t)}
  /* the catch fence: posts every 4 m on the wall top, leaning 0.6 m over the track, chain-link and three cables */
  const FM=M(0x6a6e74,{metalness:.35,roughness:.5});const lean=.6,fy0=1.05,fy1=4.3;
  for(let x=wx0+.3;x<=wx1-.2;x+=4){rod([x,fy0-.05,NZ],[x,fy1,NZ-lean],.05,FM,null,8)}
  const ch=afCanvas(128,128,(x,w,h)=>{x.clearRect(0,0,w,h);x.strokeStyle='rgba(150,155,160,.95)';x.lineWidth=3;for(let i=-w;i<w*2;i+=16){x.beginPath();x.moveTo(i,0);x.lineTo(i+h,h);x.stroke();x.beginPath();x.moveTo(i,h);x.lineTo(i+h,0);x.stroke()}});spRep(ch);const fl=Math.hypot(fy1-fy0,lean);ch.repeat.set(wl/1.2,fl/1.2);
  const fm=new THREE.Mesh(new THREE.PlaneGeometry(wl,fl),new THREE.MeshStandardMaterial({map:ch,transparent:true,alphaTest:.35,side:THREE.DoubleSide,roughness:.6,metalness:.3}));fm.position.set((wx0+wx1)/2,(fy0+fy1)/2,NZ-lean/2);fm.rotation.x=-Math.atan2(lean,fy1-fy0);g.add(fm);
  for(const f of[.02,.5,.98]){const y=fy0+(fy1-fy0)*f,z=NZ-lean*f;C(.02,.02,wl,(wx0+wx1)/2,y,z-.03,FM,'x',null,6)}
  /* the wall's open end at the pit entry: yellow and black chevrons */{const t=afCanvas(64,64,(x,w,h)=>{x.fillStyle='#f0c020';x.fillRect(0,0,w,h);x.fillStyle='#1a1a1a';for(let i=-2;i<4;i++){x.beginPath();x.moveTo(0,i*22);x.lineTo(w/2,i*22+16);x.lineTo(w,i*22);x.lineTo(w,i*22+10);x.lineTo(w/2,i*22+26);x.lineTo(0,i*22+10);x.fill()}});const e=new THREE.Mesh(new THREE.PlaneGeometry(.22,.72),new THREE.MeshStandardMaterial({map:t,roughness:.7}));e.rotation.y=Math.PI/2;e.position.set(wx1+.006,.68,NZ);g.add(e)}}
 /* ---- the pit wall (x 330..372): a lower, straight concrete wall with a red and white top, chevrons on its nose ---- */
 {const px0=330,px1=cx+S/2,CW=M(0xd4d0c8,{roughness:.9});B(px1-px0,.95,.4,(px0+px1)/2,.475,NZ,CW);B(px1-px0,.06,.42,(px0+px1)/2,.98,NZ,M(0xc42424,{roughness:.7}));for(let x=px0+1;x<px1;x+=2)B(1,.061,.425,x,.98,NZ,M(0xf0ece4,{roughness:.7}));
  {const t=afCanvas(64,64,(x,w,h)=>{x.fillStyle='#f0c020';x.fillRect(0,0,w,h);x.fillStyle='#1a1a1a';for(let i=-2;i<4;i++){x.beginPath();x.moveTo(0,i*22);x.lineTo(w/2,i*22+16);x.lineTo(w,i*22);x.lineTo(w,i*22+10);x.lineTo(w/2,i*22+26);x.lineTo(0,i*22+10);x.fill()}});const e=new THREE.Mesh(new THREE.PlaneGeometry(.4,.9),new THREE.MeshStandardMaterial({map:t,roughness:.7}));e.rotation.y=-Math.PI/2;e.position.set(px0-.006,.47,NZ);g.add(e)}
  obs.push({x0:px0,x1:px1,z0:NZ-.2,z1:NZ+.2})}
 /* ---- the chequered line across the track at x 300 ---- */
 {const t=afCanvas(64,448,(x,w,h)=>{for(let i=0;i<14;i++)for(let j=0;j<2;j++){x.fillStyle=(i+j)%2?'#f4f2ec':'#161616';x.fillRect(j*32,i*32,32,32)}});const m=new THREE.Mesh(new THREE.PlaneGeometry(2,14),new THREE.MeshStandardMaterial({map:t,roughness:.9,polygonOffset:true,polygonOffsetUnits:-3}));m.rotation.x=-Math.PI/2;m.position.set(cx,.052,cz+RZ);g.add(m)}
 /* ---- the start gantry: two lattice towers and a box truss over the track, the name board facing the cars coming
    up the straight (west), the BEST LAP board on the other side, and the start lights under the truss ---- */
 const lamps=[];let board;
 {const gx=cx,za=cz+RZ-9.2/* inner tower, past the inner tyres */,zb=NZ+1.2/* outer tower, behind the wall */,ST=M(0xdcdcdc,{metalness:.3,roughness:.45}),DK=M(0x2a2c30,{metalness:.3,roughness:.5});
  const tower=(z)=>{const h=7.9,w=.32;for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])rod([gx+a*w,0,z+b*w],[gx+a*w,h,z+b*w],.045,ST,null,8);for(let y=.6;y<h;y+=.9){for(const[a0,b0,a1,b1]of[[-1,-1,1,-1],[1,-1,1,1],[1,1,-1,1],[-1,1,-1,-1]]){rod([gx+a0*w,y,z+b0*w],[gx+a1*w,y+.9,z+b1*w],.02,ST,null,5);rod([gx+a0*w,y,z+b0*w],[gx+a1*w,y,z+b1*w],.02,ST,null,5)}}B(1,.12,1,gx,.06,z,M(0xa8a49c,{roughness:.95}));obs.push({x0:gx-.5,x1:gx+.5,z0:z-.5,z1:z+.5})};tower(za);tower(zb);
  /* the truss: four chords at y 6.9 and 7.9, x +-.4, with zigzags on every face */const y0=6.9,y1=7.9,w=.4,zs=za-.35,ze=zb+.35,n=Math.round((ze-zs)/1);
  for(const[a,y]of[[-1,y0],[1,y0],[-1,y1],[1,y1]])rod([gx+a*w,y,zs],[gx+a*w,y,ze],.05,ST,null,8);
  for(let i=0;i<n;i++){const z0=zs+(ze-zs)*i/n,z1=zs+(ze-zs)*(i+1)/n;for(const a of[-1,1]){rod([gx+a*w,i%2?y0:y1,z0],[gx+a*w,i%2?y1:y0,z1],.022,ST,null,5);rod([gx+a*w,y0,z0],[gx+a*w,y1,z0],.022,ST,null,5)}for(const y of[y0,y1]){rod([gx-w,y,z0],[gx+w,y,i%2?z0:z1],.022,ST,null,5)}}
  /* boards on both faces of the truss */const bd=L('SPEEDWAY · START/FINISH',4,.9,'#1a1a1a','#ffe040',60,gx-w-.06,(y0+y1)/2,cz+RZ,-Math.PI/2);
  board=L('BEST LAP: --:--',4,.9,'#1a1a1a','#40ff80',60,gx+w+.06,(y0+y1)/2,cz+RZ,Math.PI/2);for(const s of[-1,1])B(.05,.98,4.08,gx+s*(w+.03),(y0+y1)/2,cz+RZ,DK);
  /* the start lights: a black bar hanging under the truss, five columns of a red and a green lamp facing west */
  const ly=6.1;for(const dz of[-1.3,1.3])rod([gx,y0,cz+RZ+dz],[gx,ly+.4,cz+RZ+dz],.03,DK,null,6);B(.36,.92,3.3,gx,ly,cz+RZ,DK);
  for(let i=0;i<5;i++){const z=cz+RZ-1.28+i*.64;B(.06,.82,.5,gx-.21,ly,z,M(0x101012));for(const[yy,c]of[[ly+.2,0xff2020],[ly-.2,0x20ff40]]){const mt=new THREE.MeshStandardMaterial({color:0x2a1414,emissive:c,emissiveIntensity:0,roughness:.3});const l=C(.15,.15,.05,gx-.25,yy,z,mt,'x',null,16);/* a little hood above each lamp */B(.12,.02,.34,gx-.3,yy+.18,z,M(0x101012));lamps.push({mt,c,red:c==0xff2020,i})}}}
 const lights=(reds,green)=>{for(const l of lamps){const on=l.red?l.i<reds:!!green;l.mt.emissiveIntensity=on?2.2:0;l.mt.color.setHex(on?l.c:0x2a1414)}};lights(0,false);
 g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{obs,board,lights}}
