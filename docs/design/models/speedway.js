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
/* the pit exit: past the end of the pit wall (x 372) the pit lane carries on round the outside of the east bend as an
   8 m band and narrows to nothing by SPX.a1 (0.6 rad, about 26 m round), so even the dragster can merge. The outer
   tyre wall follows the band's outside edge: radius 53.5 at the start of the bend, back to 46 at a1. */
const SPX={a1:.6,rOut:a=>46+7.5*Math.max(0,1-a/.6)};
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
   Flat: y is the height (or [y at r0, y at r1] for a slope). r0 / r1 can be functions of u. Upright (up=[y0,y1]): a wall at radius r0. UVs: x across (0..1), y = metres along / vlen. */
function spRibbon(u0,u1,r0,r1,y,vlen,up){const us=spSteps(u0,u1),pos=[],uv=[],idx=[];
 us.forEach((u,i)=>{const a=spPt(u,typeof r0=='function'?r0(u):r0),b=up?a:spPt(u,typeof r1=='function'?r1(u):r1),v=(u-u0)/vlen;if(up){pos.push(a[0],up[0],a[1],b[0],up[1],b[1])}else{const ya=Array.isArray(y)?y[0]:y,yb=Array.isArray(y)?y[1]:y;pos.push(a[0],ya,a[1],b[0],yb,b[1])};uv.push(0,v,1,v)});
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
  /* the outer wall round the pit exit: radius SPX.rOut, starting just past the garages' corner */
  const walkV=(u0,u1)=>{let prev=null,acc=1;for(let u=u0;u<=u1;u+=.05){const p=spPt(u,SPX.rOut((u-S)/RZ));if(prev)acc+=Math.hypot(p[0]-prev[0],p[1]-prev[1]);prev=p;if(acc>=.98){acc=0;pts.push(p)}}};
  const a0=.06;walk(RZ-8,0,P-.5);walkV(S+a0*RZ,S+SPX.a1*RZ);walk(RZ+8,S+SPX.a1*RZ+.98,P-.05);
  const im=new THREE.InstancedMesh(ge,TM,pts.length),mm=new THREE.Matrix4();pts.forEach((p,i)=>{mm.makeTranslation(p[0],.42,p[1]);im.setMatrixAt(i,mm)});im.instanceMatrix.needsUpdate=true;im.frustumCulled=false;g.add(im);
  /* obstacles: one box per three stacks */for(let i=0;i<pts.length;i+=3){const grp=pts.slice(i,i+3),xs=grp.map(p=>p[0]),zs=grp.map(p=>p[1]);obs.push({x0:Math.min(...xs)-.47,x1:Math.max(...xs)+.47,z0:Math.min(...zs)-.47,z1:Math.max(...zs)+.47})}
  /* the belt: a strap round the track side of each wall, red and white in 3 m blocks, bolted at the top */
  const bt=spRep(afCanvas(32,256,(x,w,h)=>{for(let i=0;i<2;i++){x.fillStyle=i?'#f0ece4':'#c42424';x.fillRect(0,i*h/2,w,h/2)}x.fillStyle='rgba(0,0,0,.25)';x.fillRect(0,0,w,2);x.fillRect(0,h-2,w,2);x.fillStyle='rgba(0,0,0,.35)';for(let i=0;i<8;i++){x.fillRect(4,i*32+14,3,3);x.fillRect(w-7,i*32+14,3,3)}}));
  const BM=new THREE.MeshStandardMaterial({map:bt,roughness:.8,side:THREE.DoubleSide});
  const belt=(r,u0,u1)=>g.add(new THREE.Mesh(spRibbon(u0,u1,r,0,0,6,[.04,.86]),BM));
  belt(RZ-8+.49,0,P);g.add(new THREE.Mesh(spRibbon(S+a0*RZ,S+SPX.a1*RZ,u=>SPX.rOut((u-S)/RZ)-.49,0,0,6,[.04,.86]),BM));belt(RZ+8-.49,S+SPX.a1*RZ,P)}
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
 {const px0=330,px1=cx+S/2,CW=M(0xd4d0c8,{roughness:.9});B(px1-px0,.95,.4,(px0+px1)/2,.475,NZ,CW);/* the red and white top: one painted cap, 1 m blocks */{const t=spRep(afCanvas(64,8,(x,w,h)=>{x.fillStyle='#c42424';x.fillRect(0,0,w/2,h);x.fillStyle='#f0ece4';x.fillRect(w/2,0,w/2,h)}));t.repeat.set((px1-px0)/2,1);const cm=new THREE.MeshStandardMaterial({map:t,roughness:.7});const cap=new THREE.Mesh(new THREE.BoxGeometry(px1-px0,.06,.42),[cm,cm,cm,cm,cm,cm]);cap.position.set((px0+px1)/2,.98,NZ);g.add(cap)}
  {const t=afCanvas(64,64,(x,w,h)=>{x.fillStyle='#f0c020';x.fillRect(0,0,w,h);x.fillStyle='#1a1a1a';for(let i=-2;i<4;i++){x.beginPath();x.moveTo(0,i*22);x.lineTo(w/2,i*22+16);x.lineTo(w,i*22);x.lineTo(w,i*22+10);x.lineTo(w/2,i*22+26);x.lineTo(0,i*22+10);x.fill()}});const e=new THREE.Mesh(new THREE.PlaneGeometry(.4,.9),new THREE.MeshStandardMaterial({map:t,roughness:.7}));e.rotation.y=-Math.PI/2;e.position.set(px0-.006,.47,NZ);g.add(e)}
  obs.push({x0:px0,x1:px1,z0:NZ-.2,z1:NZ+.2})}
 /* ---- the chequered line across the track at x 300 ---- */
 {const t=afCanvas(64,448,(x,w,h)=>{for(let i=0;i<14;i++)for(let j=0;j<2;j++){x.fillStyle=(i+j)%2?'#f4f2ec':'#161616';x.fillRect(j*32,i*32,32,32)}});const m=new THREE.Mesh(new THREE.PlaneGeometry(2,14),new THREE.MeshStandardMaterial({map:t,roughness:.9,polygonOffset:true,polygonOffsetUnits:-3}));m.rotation.x=-Math.PI/2;m.position.set(cx,.052,cz+RZ);g.add(m)}
 /* ---- the start gantry: two lattice towers and a box truss over the track, the name board facing the cars coming
    up the straight (west), the BEST LAP board on the other side, and the start lights under the truss ---- */
 const lamps=[];let board;
 {const gx=cx,za=cz+RZ-9.2/* inner tower, past the inner tyres */,zb=NZ+1.2/* outer tower, behind the wall */,ST=M(0xdcdcdc,{metalness:.3,roughness:.45}),DK=M(0x2a2c30,{metalness:.3,roughness:.5});
  const tower=(z)=>{const h=7.9,w=.32;for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])rod([gx+a*w,0,z+b*w],[gx+a*w,h,z+b*w],.045,ST,null,8);/* bracing bays from .6 up to the truss: none pokes above the top */for(let y=.6;y+.9<=h-.05;y+=.9){for(const[a0,b0,a1,b1]of[[-1,-1,1,-1],[1,-1,1,1],[1,1,-1,1],[-1,1,-1,-1]]){rod([gx+a0*w,y,z+b0*w],[gx+a1*w,y+.9,z+b1*w],.02,ST,null,5);rod([gx+a0*w,y,z+b0*w],[gx+a1*w,y,z+b1*w],.02,ST,null,5)}}B(1,.12,1,gx,.06,z,M(0xa8a49c,{roughness:.95}));B(.74,.06,.74,gx,h+.03,z,ST);obs.push({x0:gx-.5,x1:gx+.5,z0:z-.5,z1:z+.5})};tower(za);tower(zb);
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

/* ===================================================================================================== batch 2
   spStand(g)    the grandstand behind the main straight (x 250..310, z -1781..-1768.3): eight rows of coloured
                 seats on concrete steps, three aisles with half steps, a front wall with a rail, end walls, a
                 back wall, a cantilever roof on six posts, flags along the roof edge, and a press box at the top.
                 Returns {obs, flags}: flags = [Mesh] (each turns a little about its pole: rotation.y = sin(t*1.7+i)*.25).
   spControl(g)  race control (x 314..322, z -1781..-1773): two concrete floors and a glass cab facing the track,
                 a roof rail, an aerial and an amber beacon. Returns {obs, beacon} (beacon: a material, blink it
                 while a lap is running if you like).
   spPits(g)     the pit lane (x 323..377.5, from the track edge to z -1777), its markings and four pit boxes,
                 PIT IN / PIT OUT signs, and four garages (x 328..372, z -1777..-1766) with workbenches, tool chests,
                 tyre racks and lights, the GWEEN SODA fascia, and the race board on garage 1's west wall.
                 Returns {obs, boxes, crewHome, boardAt}:
                   boxes     [{x, z, n}] the centre of each pit box (stop here: |dx| < 3, |dz| < 2)
                   crewHome  [{x, z}] where the four crew stand when they're waiting (in front of garage 2)
                   boardAt   {x, z} the race board's press-E spot
   mkPitCrew(col) a pit crew member (our own design): overalls in col (default GWEEN green) with white stripes,
                 a white helmet with a dark visor, gloves and boots. ORIGIN between the feet. FRONT -z.
                 1.82 m tall. Parts like mkCaretaker: hips, chest, legL, legR, kneeL, kneeR, armL, armR, elbowL,
                 elbowR, head, grip (right hand).
                 g.userData.pose(name, t): 'idle' | 'run' | 'gun' (kneeling, wheel gun buzzing) | 'jack' (pulling
                 the jack lever down) | 'wipe' (wiping the windscreen) | 'go' (arm out, waving the car away).
   mkWheelGun()  a wheel gun with its air hose stub (put it in grip for 'gun').
   mkPitJack()   a long-handled trolley jack. g.userData.lift(u): u 0..1 raises the pad 0.15 m and lowers the handle.
   ===================================================================================================== */
function spStand(g){const k=spKit(),{B,C,rod,slab,L}=k.H(g),M=k.M,obs=[],X0=250,X1=310,ZF=-1781,RD=1.3,RR=.5,Y0=.8,NR=8,AIS=[262,280,298];
 const CN=M(0xc8c4bc,{roughness:.92}),CN2=M(0xb4b0a8,{roughness:.92}),STL=M(0x6a6e74,{metalness:.35,roughness:.5}),WH=M(0xf0ece4,{roughness:.7});
 const dZ=d=>ZF+d,rowY=i=>Y0+RR*i,DEP=RD*NR+2/* rows plus the top concourse */,ZB=dZ(DEP);
 /* the stepped concrete: one profile pushed along x (shape x = -(metres back from the front), y up) */
 {const pts=[[0,0],[0,Y0]];for(let i=0;i<NR;i++){pts.push([-RD*(i+1),rowY(i)]);if(i<NR-1)pts.push([-RD*(i+1),rowY(i+1)])}pts.push([-DEP,rowY(NR-1)],[-DEP,0]);slab(pts,X1-X0,CN,(X0+X1)/2,0,ZF,Math.PI/2)}
 /* steps up from the walkway to the front row, and half steps up each aisle */
 for(const ax of AIS){for(let s=0;s<3;s++)B(1.4,(s+1)*Y0/3,.62,ax,(s+1)*Y0/6,ZF-1.86+s*.62,CN2);for(let i=0;i<NR-1;i++)B(1.4,RR/2,RD/2,ax,rowY(i)+RR/4,dZ(RD*i+RD*.75),CN2);
  /* hand rails up the aisle */for(const s of[-1,1])rod([ax+s*.72,Y0+.95,ZF],[ax+s*.72,rowY(NR-1)+.95,dZ(RD*(NR-1))],.025,STL,null,6)}
 /* the front wall top rail (gaps at the aisles) */{let x=X0+.2;const seg=(a,b)=>{rod([a,Y0+1.0,ZF+.08],[b,Y0+1.0,ZF+.08],.03,STL,null,6);for(let p=a;p<=b+.01;p+=2)rod([p,Y0,ZF+.08],[p,Y0+1.0,ZF+.08],.025,STL,null,6)};const cuts=[X0+.2,...AIS.flatMap(a=>[a-.75,a+.75]),X1-.2];for(let i=0;i<cuts.length;i+=2)seg(cuts[i],cuts[i+1])}
 /* seats: one instanced mesh each for pedestal, pan and back, coloured by block (red, yellow, red, yellow) */
 {const SP=[];for(let i=0;i<NR;i++)for(let x=X0+.45;x<X1-.3;x+=.52){if(AIS.some(a=>Math.abs(x-a)<.98))continue;SP.push([x,i])}
  const parts=[[new THREE.BoxGeometry(.12,.36,.26),.21,.42,false],[new THREE.BoxGeometry(.46,.07,.42),.42,.44,true],[new THREE.BoxGeometry(.46,.44,.06),.66,.7,true]];
  const cols=[0xc42828,0xe8c020,0xc42828,0xe8c020],col=new THREE.Color(),mm=new THREE.Matrix4();let sd=5;const rr=()=>((sd=Math.imul(sd^sd>>>15,sd|1)+0x6d2b79f5|0)>>>0)/4294967296;const tint=SP.map(([x])=>{const b=x<AIS[0]?0:x<AIS[1]?1:x<AIS[2]?2:3;const c=new THREE.Color(cols[b]);if(rr()<.06)c.lerp(new THREE.Color(0xf0ece4),.55);return c});
  for(const[ge,y,dz,paint]of parts){const im=new THREE.InstancedMesh(ge,paint?new THREE.MeshStandardMaterial({color:0xffffff,roughness:.55}):STL,SP.length);SP.forEach(([x,i],n)=>{mm.makeTranslation(x,rowY(i)+y,dZ(RD*i+dz));im.setMatrixAt(n,mm);if(paint)im.setColorAt(n,tint[n])});im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.frustumCulled=false;g.add(im)}}
 /* end walls: a sloped concrete screen on each side, its top 1 m above the steps */
 for(const ex of[X0-.15,X1+.15]){slab([[0,0],[0,Y0+1],[-RD*NR,rowY(NR-1)+1],[-DEP,rowY(NR-1)+1],[-DEP,0]],.3,CN,ex,0,ZF,Math.PI/2)}
 /* the back wall, up to the roof, and the gates in it */const RY0=9.3,RY1=9.9,ZR=ZF-1;B(X1-X0+.6,RY0,.3,(X0+X1)/2,RY0/2,ZB+.15,CN);
 for(const[gx,t]of[[265,'GATE A'],[295,'GATE B']]){B(2.4,2.6,.04,gx,1.3,ZB+.33,M(0x3a3e44,{metalness:.3}));L(t,2.4,.5,'#c42828','#ffffff',50,gx,3,ZB+.31,0)}
 /* the press box on the top concourse */{const px0=272,px1=288,pz0=dZ(RD*NR),pz1=ZB,py=rowY(NR-1),ph=2.5;B(px1-px0,.2,pz1-pz0,(px0+px1)/2,py+ph,(pz0+pz1)/2,WH);for(const x of[px0,px1])B(.15,ph,pz1-pz0,x,py+ph/2,(pz0+pz1)/2,WH);B(px1-px0,.9,.15,(px0+px1)/2,py+.45,pz0+.075,WH);
  const gl=new THREE.Mesh(new THREE.PlaneGeometry(px1-px0-.3,ph-1.1),M(0x2a3a44,{roughness:.1,metalness:.3,transparent:true,opacity:.55}));gl.position.set((px0+px1)/2,py+.9+(ph-1.1)/2,pz0+.06);gl.rotation.y=Math.PI;g.add(gl);for(let x=px0+2;x<px1;x+=2)B(.06,ph-1.1,.08,x,py+.9+(ph-1.1)/2,pz0+.06,WH);
  L('PRESS',2.4,.45,'#1a1a1a','#ffffff',50,(px0+px1)/2,py+ph+.4,pz0+.02,Math.PI)}
 /* the roof: six posts on the back wall line, cantilever beams forward, a corrugated sheet, a fascia with the name */
 {const RM=afCorr(k,'#c8ccd0',[30,8]);for(let x=X0;x<=X1+.01;x+=12){C(.18,.2,RY0,x,RY0/2,ZB+.5,STL,null,null,10);rod([x,RY0,ZB+.5],[x,RY1,ZR],.12,STL,null,8);/* the strut starts above the press box roof (7.0) so it never passes through the glass */rod([x,7.4,ZB+.5],[x,RY0+(RY1-RY0)*.45,ZB+.5+(ZR-ZB-.5)*.45],.08,STL,null,8)}
  const rl=Math.hypot(ZB+.5-ZR,RY1-RY0),rp=new THREE.Mesh(new THREE.PlaneGeometry(X1-X0+1,rl),RM);rp.position.set((X0+X1)/2,(RY0+RY1)/2+.14,(ZB+.5+ZR)/2);rp.rotation.x=-Math.PI/2+Math.atan2(RY1-RY0,ZB+.5-ZR);g.add(rp);
  B(X1-X0+1.2,.7,.12,(X0+X1)/2,RY1+.1,ZR-.06,WH);L('DUSTY GULCH SPEEDWAY',14,.6,null,'#c42828',70,(X0+X1)/2,RY1+.1,ZR-.125,Math.PI)}
 /* flags on short poles along the roof's front edge */const flags=[];{const fc=[['#c42828','#ffffff'],['#e8c020','#1a1a1a'],['chk']];for(let i=0;i<6;i++){const x=X0+5+i*10,z=ZR+.05;C(.03,.03,2.2,x,RY1+1.55,z,STL,null,null,6);const t=afCanvas(64,40,(c,w,h)=>{const f=fc[i%3];if(f[0]=='chk'){for(let a=0;a<8;a++)for(let b=0;b<5;b++){c.fillStyle=(a+b)%2?'#f4f2ec':'#161616';c.fillRect(a*8,b*8,8,8)}}else{c.fillStyle=f[0];c.fillRect(0,0,w,h);c.fillStyle=f[1];c.fillRect(0,h*.4,w,h*.2)}});
  const fg=new THREE.Group();fg.position.set(x,RY1+2.3,z);g.add(fg);const fl=new THREE.Mesh(new THREE.PlaneGeometry(1.1,.68),new THREE.MeshStandardMaterial({map:t,side:THREE.DoubleSide,roughness:.8}));fl.position.x=.58;fg.add(fl);fg.userData.dpKeep=1;fl.userData.dpKeep=1;flags.push(fg)}}
 obs.push({x0:X0-.3,x1:X1+.3,z0:ZF,z1:ZB+.3});
 g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{obs,flags}}

function spControl(g){const k=spKit(),{B,C,rod,slab,L}=k.H(g),M=k.M,obs=[],x0=314,x1=322,z0=-1781,z1=-1773,xc=(x0+x1)/2,zc=(z0+z1)/2;
 const WH=M(0xece8e0,{roughness:.8}),DK=M(0x2a2c30,{metalness:.3,roughness:.5}),GL=M(0x2a3a44,{roughness:.08,metalness:.3,transparent:true,opacity:.5});
 /* two concrete floors with a window band each, a door at the back */B(x1-x0,6.2,z1-z0,xc,3.1,zc,WH);for(const y of[1.9,5])B(x1-x0-1.2,1.1,.04,xc,y,z0-.02,M(0x34404a,{roughness:.1,metalness:.3}));B(x1-x0+.1,.15,z1-z0+.1,xc,3.2,zc,M(0xc42828));
 B(1.1,2.2,.04,xc,1.1,z1+.02,M(0x3a3e44,{metalness:.3}));L('RACE CONTROL',5,.7,'#1a1a1a','#ffe040',60,xc,3.9,z0-.03,Math.PI);
 /* the glass cab: a floor slab that overhangs the front by 0.8, posts, glass on all four sides, a flat roof */const cy0=6.2,cy1=9.0,ov=.8;B(x1-x0+.4,.25,z1-z0+ov,xc,cy0+.125,zc-ov/2,WH);
 const cz0=z0-ov+.1;for(const[a,b]of[[x0+.1,cz0],[x1-.1,cz0],[x0+.1,z1-.1],[x1-.1,z1-.1]])B(.16,cy1-cy0,.16,a,(cy0+cy1)/2+.12,b,DK);
 B(x1-x0-.2,.9,.12,xc,cy0+.7,cz0,WH);const gw=(w,x,z,ry)=>{const p=new THREE.Mesh(new THREE.PlaneGeometry(w,cy1-cy0-1.25),GL);p.position.set(x,cy0+1.15+(cy1-cy0-1.25)/2+.12,z);p.rotation.y=ry;g.add(p)};gw(x1-x0-.36,xc,cz0,Math.PI);gw(x1-x0-.36,xc,z1-.1,0);gw(z1-cz0-.36,x0+.1,(cz0+z1)/2,-Math.PI/2);gw(z1-cz0-.36,x1-.1,(cz0+z1)/2,Math.PI/2);
 for(let x=x0+2.1;x<x1-.5;x+=2)B(.06,cy1-cy0-1.25,.08,x,cy0+1.15+(cy1-cy0-1.25)/2+.12,cz0,DK);
 /* inside: a desk along the glass with screens */B(x1-x0-.8,.08,.7,xc,cy0+.95,cz0+.6,M(0x5a4a3a));B(x1-x0-.3,.02,z1-cz0-.3,xc,cy0+.26,(cz0+z1)/2,M(0x4a4e56,{roughness:.9}));for(let i=0;i<3;i++){B(.08,.06,.16,x0+1.6+i*2.4,cy0+1.02,cz0+.85,DK);const s=B(.7,.45,.04,x0+1.6+i*2.4,cy0+1.27,cz0+.85,DK);B(.64,.38,.01,x0+1.6+i*2.4,cy0+1.27,cz0+.875,M(0x60c0ff,{emissive:0x2060a0,emissiveIntensity:.6}))}
 B(x1-x0+.4,.3,z1-cz0+.4,xc,cy1+.27,(cz0+z1)/2,WH);
 /* roof rail, aerial and the amber beacon */for(const[a,b,c,d]of[[x0,cz0-.1,x1,cz0-.1],[x0,z1+.1,x1,z1+.1],[x0,cz0-.1,x0,z1+.1],[x1,cz0-.1,x1,z1+.1]])rod([a,cy1+1.4,b],[c,cy1+1.4,d],.03,DK,null,6);for(const[a,b]of[[x0,cz0-.1],[x1,cz0-.1],[x0,z1+.1],[x1,z1+.1]])rod([a,cy1+.42,b],[a,cy1+1.4,b],.03,DK,null,6);
 rod([x1-1,cy1+.42,z1-1],[x1-1,cy1+5,z1-1],.04,DK,null,6);for(const y of[cy1+2,cy1+3.2,cy1+4.3])rod([x1-1.5,y,z1-1],[x1-.5,y,z1-1],.015,DK,null,5);
 const beacon=M(0xffa020,{emissive:0xff8000,emissiveIntensity:.3,roughness:.3});C(.18,.2,.3,x0+1,cy1+.57,z1-1,beacon,null,null,12);C(.22,.22,.06,x0+1,cy1+.45,z1-1,DK,null,null,12);
 obs.push({x0,x1,z0,z1});g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{obs,beacon}}

function spPits(g){const k=spKit(),{B,C,rod,slab,L}=k.H(g),M=k.M,obs=[],{cx,cz,RX,RZ}=SPW,S=2*(RX-RZ),PX0=323,PX1=cx+S/2+(RZ+7)*Math.sin(SPX.a1)+1,ZE=cz+(RZ+7)*Math.cos(SPX.a1)-1,PZ1=-1777,GZ0=-1777,GZ1=-1766,GX0=328,GW=11;
 const WH=M(0xf0ece4,{roughness:.8}),DK=M(0x2a2c30,{metalness:.3,roughness:.5}),STL=M(0x6a6e74,{metalness:.35,roughness:.5}),GRN=M(0x2a9a3a,{roughness:.6});
 /* ---- the pit lane: one flat shape from the track's outer edge (radius 45) back to z -1777, painted concrete ---- */
 {/* along the track's outer edge to the merge point, then back along the band's outside edge (the tyre wall's inside) */const pts=[[PX0,PZ1],[PX0,cz+RZ+7]];for(let i=0;i<=24;i++){const a=SPX.a1*i/24;pts.push([cx+S/2+(RZ+7)*Math.sin(a),cz+(RZ+7)*Math.cos(a)])}for(let i=24;i>=0;i--){const a=SPX.a1*i/24,rr=Math.max(RZ+7,SPX.rOut(a)-.5);pts.push([cx+S/2+rr*Math.sin(a),cz+rr*Math.cos(a)])}
  const sh=new THREE.Shape();pts.forEach(([x,z],i)=>i?sh.lineTo(x,-z):sh.moveTo(x,-z));const ge=new THREE.ShapeGeometry(sh);const uv=ge.attributes.uv,ps=ge.attributes.position;for(let i=0;i<ps.count;i++)uv.setXY(i,(ps.getX(i)-PX0)/(PX1-PX0),1-(-ps.getY(i)-ZE)/(PZ1-ZE));
  const W=1024,H=Math.round(1024*(PZ1-ZE)/(PX1-PX0)),pxm=W/(PX1-PX0),X=x=>(x-PX0)*pxm,Z=z=>H-(z-ZE)*pxm;
  const t=afCanvas(W,H,(c)=>{afTarmac(c,W,H,'#9a9894',21);c.fillStyle='#f2efe6';/* the lane's back line */c.fillRect(0,Z(PZ1+.45),W,4);
   /* pit boxes: yellow frames with a number, a stop bar at the front */for(let i=0;i<4;i++){const bx=336+i*10;c.strokeStyle='#f0c020';c.lineWidth=5;c.strokeRect(X(bx-4),Z(-1778.1),8*pxm,5*pxm);c.fillStyle='#f0c020';c.fillRect(X(bx+3.6),Z(-1778.1),.3*pxm,5*pxm);c.font='bold '+Math.round(2.2*pxm)+'px Arial';c.textAlign='center';c.textBaseline='middle';c.save();c.translate(X(bx-1.6),Z(-1780.6));c.rotate(Math.PI/2);c.fillText(String(i+1),0,0);c.restore();c.fillStyle='rgba(30,30,30,.25)';c.fillRect(X(bx-2.5),Z(-1779.4),5*pxm,1.4*pxm)}
   /* PIT and the 60 limit at the entry */c.fillStyle='#f2efe6';c.font='bold '+Math.round(2.4*pxm)+'px Arial';c.textAlign='center';c.textBaseline='middle';/* painted to be read by a driver heading east: the tops of the letters point east */c.save();c.translate(X(327.6),Z(-1780.4));c.rotate(Math.PI/2);c.fillText('PIT',0,0);c.restore();c.strokeStyle='#d82828';c.lineWidth=4;c.beginPath();c.arc(X(326.5),Z(-1778.3),1*pxm,0,7);c.stroke();c.fillStyle='#f2efe6';c.font='bold '+Math.round(1.1*pxm)+'px Arial';c.save();c.translate(X(326.5),Z(-1778.3));c.rotate(Math.PI/2);c.fillText('60',0,0);c.restore();
   /* chevrons along the exit band, pointing the way round */c.fillStyle='#f2efe6';for(let i=0;i<3;i++){const a=.05+i*.08,rr=RZ+7+3.2*(1-i*.2),px=cx+S/2+rr*Math.sin(a),pz=cz+rr*Math.cos(a);c.save();c.translate(X(px),Z(pz));c.rotate(a);const s=pxm;c.rotate(a);c.beginPath();c.moveTo(-.35*s,-1.4*s);c.lineTo(.45*s,0);c.lineTo(-.35*s,1.4*s);c.lineTo(.05*s,1.4*s);c.lineTo(.85*s,0);c.lineTo(.05*s,-1.4*s);c.closePath();c.fill();c.restore()}});
  const m=new THREE.Mesh(ge,new THREE.MeshStandardMaterial({map:t,roughness:.95,polygonOffset:true,polygonOffsetUnits:-1}));m.rotation.x=-Math.PI/2;m.position.y=.05;g.add(m)}
 /* PIT IN and PIT OUT signs */for(const[x,z,t,ry]of[[324.2,-1776.2,'PIT IN · 60',-Math.PI/2],[372+55*Math.sin(.12),cz+55*Math.cos(.12),'PIT OUT',Math.PI/2]]){C(.05,.05,2.6,x,1.3,z,STL,null,null,8);L(t,1.6,.5,'#1a1a1a','#ffffff',50,x,2.4,z-.06,Math.PI);obs.push({x0:x-.15,x1:x+.15,z0:z-.15,z1:z+.15})}
 /* ---- four garages ---- */
 const tyreM=M(0x1c1c1e,{roughness:.95});
 for(let i=0;i<4;i++){const gx0=GX0+i*GW,gx1=gx0+GW,gxc=(gx0+gx1)/2,H=4.6;
  /* walls (shared), back wall, roof */B(.25,H,GZ1-GZ0,gx0+.125,H/2,(GZ0+GZ1)/2,WH);if(i==3)B(.25,H,GZ1-GZ0,gx1-.125,H/2,(GZ0+GZ1)/2,WH);B(GW,H,.25,gxc,H/2,GZ1-.125,WH);B(GW+.02,.25,GZ1-GZ0,gxc,H+.125,(GZ0+GZ1)/2,M(0xb8b4ac));
  /* floor and the rolled-up door drum */B(GW-.25,.02,GZ1-GZ0-.25,gxc+.125*(i<3?1:0)-(i==3?.0:0),.01,(GZ0+GZ1)/2+.12,M(0x8a8e94,{roughness:.6}));C(.28,.28,GW-.3,gxc,H-.3,GZ0+.3,M(0x9a9ea4,{metalness:.4,roughness:.4}),'x',null,14);B(GW-.3,.04,.6,gxc,H-.02,GZ0+.3,M(0x9a9ea4,{metalness:.4}));
  /* lights: two tubes on the ceiling */for(const dx of[-2.5,2.5]){B(.12,.06,4,gxc+dx,H-.03,(GZ0+GZ1)/2+1,M(0x3a3a3c));B(.06,.03,3.8,gxc+dx,H-.075,(GZ0+GZ1)/2+1,M(0xffffff,{emissive:0xf0f4ff,emissiveIntensity:.8}))}
  /* workbench and pegboard on the back wall */B(4,.08,.8,gxc-2,.95,GZ1-.65,M(0x6a5038));for(const dx of[-3.8,-.2])B(.08,.9,.7,gxc+dx,.47,GZ1-.65,DK);B(4,1.4,.03,gxc-2,1.9,GZ1-.26,M(0xb08a58));for(let a=0;a<8;a++)B(.05,.3,.04,gxc-3.7+a*.5,1.9+(a%2)*.25,GZ1-.29,DK);
  /* red tool chest */B(1.1,1.1,.6,gxc+1.2,.6,GZ1-.6,M(0xc42828,{roughness:.45,metalness:.2}));for(let d=0;d<5;d++)B(1,.02,.02,gxc+1.2,.25+d*.2,GZ1-.91,STL);for(const dx of[-.45,.45])C(.05,.05,.04,gxc+1.2+dx,.05,GZ1-.85,DK,null,null,8);
  /* tyre rack on the side wall: two shelves of four */{const rx=(i%2?gx1-.7:gx0+.7);for(const y of[.2,1.25]){B(.9,.05,4.4,rx,y,(GZ0+GZ1)/2+1,STL);for(let n=0;n<4;n++){const ty=C(.33,.33,.26,rx,y+.36,(GZ0+GZ1)/2-.6+n*1.05,tyreM,'z',null,14);ty.rotation.set(0,0,Math.PI/2)}}for(const dz of[-1.2,3.2])B(.05,2,.05,rx,1,(GZ0+GZ1)/2+dz,STL)}
  /* air hose reel by the door */C(.25,.25,.12,gx0+.6,1.6,GZ0+.6,M(0xe8c020),'x',null,14);
  /* the garage number on the fascia */obs.push({x0:gx0,x1:gx0+.25,z0:GZ0,z1:GZ1});obs.push({x0:gx0,x1:gx1,z0:GZ1-.9,z1:GZ1})}
 obs.push({x0:GX0+4*GW-.25,x1:GX0+4*GW,z0:GZ0,z1:GZ1});
 /* the fascia across all four: green with the sign, numbers over each door */{const fx0=GX0,fx1=GX0+4*GW;B(fx1-fx0+.2,.9,.2,(fx0+fx1)/2,5.05,GZ0-.05,GRN);L('PITS · TYRES · GWEEN SODA',18,.7,'#2a9a3a','#ffffff',80,(fx0+fx1)/2,5.05,GZ0-.16,Math.PI);}
 /* the race board on garage 1's west wall, facing west */{const bx=GX0-.02,bz=-1771;B(.06,1.6,2.6,bx-.03,1.7,bz,M(0x4a3a2a));L('RACE BOARD\nBEST LAP · BEST PIT STOP\nLAP UNDER 25 s = BADGE',2.4,1.4,'#f4f0e4','#1a1a1a',44,bx-.065,1.7,bz,-Math.PI/2)}
 const boxes=[0,1,2,3].map(i=>({x:336+i*10,z:-1780.6,n:i+1})),crewHome=[0,1,2,3].map(i=>({x:342.5+i*1.6,z:-1777.6}));
 g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{obs,boxes,crewHome,boardAt:{x:GX0-1.2,z:-1771}}}

function mkWheelGun(){const g=new THREE.Group(),M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.5,metalness:.3},o||{}));
 const b=new THREE.Mesh(new THREE.CylinderGeometry(.06,.07,.26,12),M(0x2a2c30));b.rotation.x=Math.PI/2;b.position.z=-.1;g.add(b);
 const s=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.1,10),M(0xb0b4b8,{metalness:.7}));s.rotation.x=Math.PI/2;s.position.z=-.27;g.add(s);
 const h=new THREE.Mesh(new THREE.BoxGeometry(.05,.16,.06),M(0xe8c020,{roughness:.6}));h.position.set(0,-.1,.0);g.add(h);
 const hose=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.4,6),M(0x1a1a1a));hose.position.set(0,-.3,.05);hose.rotation.x=.3;g.add(hose);
 g.traverse(m=>{if(m.isMesh){m.userData.noSeam=true;m.userData.dpKeep=1}});return g}

function mkPitJack(){const g=new THREE.Group(),M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.5,metalness:.3},o||{}));const RD=M(0xc42828),DK=M(0x2a2c30);
 const base=new THREE.Mesh(new THREE.BoxGeometry(.36,.12,.9),RD);base.position.y=.14;g.add(base);for(const[x,z]of[[-.15,-.35],[.15,-.35],[-.15,.35],[.15,.35]]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,.05,10),DK);w.rotation.z=Math.PI/2;w.position.set(x*1.25,.07,z);g.add(w)}
 const arm=new THREE.Group();arm.position.set(0,.2,.25);g.add(arm);const am=new THREE.Mesh(new THREE.BoxGeometry(.16,.08,.62),RD);am.position.z=-.31;arm.add(am);const pad=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,.05,12),DK);pad.position.set(0,.06,-.6);arm.add(pad);
 const hd=new THREE.Group();hd.position.set(0,.2,.42);g.add(hd);const hm=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,1.3,8),M(0xb0b4b8,{metalness:.7}));hm.position.y=.62;hd.add(hm);const gr=new THREE.Mesh(new THREE.BoxGeometry(.4,.05,.05),DK);gr.position.y=1.27;hd.add(gr);
 g.userData.lift=u=>{u=Math.max(0,Math.min(1,u));arm.rotation.x=u*.26;hd.rotation.x=.55+u*.6};g.userData.lift(0);
 g.traverse(m=>{if(m.isMesh){m.userData.noSeam=true;m.userData.dpKeep=1}});return g}

function mkPitCrew(col){const g=new THREE.Group(),M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.75,metalness:0},o||{}));
 const suit=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.fillStyle='#'+new THREE.Color(col||0x2a9a3a).getHexString();x.fillRect(0,0,64,64);x.fillStyle='rgba(255,255,255,.9)';x.fillRect(26,0,12,64);x.fillStyle='rgba(0,0,0,.06)';for(let i=0;i<64;i+=3)x.fillRect(0,i,64,1);const t=new THREE.CanvasTexture(c);return M(0xffffff,{map:t})})(),plain=M(col||0x2a9a3a),
  white=M(0xf2f2f0,{roughness:.35}),visor=M(0x101418,{roughness:.1,metalness:.4}),glove=M(0x1c1c1e,{roughness:.6}),boot=M(0x1c1c1e,{roughness:.55}),belt=M(0x2a2a2c);
 const add=(geo,m,x,y,z,p)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);p.add(o);return o},box=(w,h,d)=>new THREE.BoxGeometry(w,h,d),cyl=(a,b,h,s)=>new THREE.CylinderGeometry(a,b,h,s||12);
 const P={};const HY=.94;const hips=new THREE.Group();hips.position.y=HY;g.add(hips);P.hips=hips;add(box(.34,.2,.22),plain,0,0,0,hips);add(box(.35,.06,.23),belt,0,.09,0,hips);
 for(const sx of[-1,1]){const leg=new THREE.Group();leg.position.set(sx*.1,-.04,0);hips.add(leg);add(box(.15,.46,.17),suit,0,-.22,0,leg);const kn=new THREE.Group();kn.position.y=-.45;leg.add(kn);add(box(.14,.44,.16),suit,0,-.21,0,kn);add(box(.15,.1,.28),boot,0,-.45,-.05,kn);P[sx<0?'legL':'legR']=leg;P[sx<0?'kneeL':'kneeR']=kn}
 const ch=new THREE.Group();ch.position.y=.1;hips.add(ch);P.chest=ch;add(box(.4,.5,.24),plain,0,.25,0,ch);add(box(.06,.5,.245),white,0,.25,0,ch);/* a GWEEN patch */add(box(.1,.07,.01),white,.1,.38,-.125,ch);
 const hd=new THREE.Group();hd.position.y=.56;ch.add(hd);P.head=hd;add(cyl(.06,.07,.08),plain,0,.03,0,hd);const hl=add(new THREE.SphereGeometry(.15,18,12),white,0,.2,0,hd);hl.scale.set(1,1.05,1.08);const vs=add(new THREE.SphereGeometry(.152,18,8,Math.PI*.62,Math.PI*.76,Math.PI*.36,Math.PI*.26),visor,0,.2,0,hd);vs.scale.set(1.01,1.06,1.09);add(box(.3,.02,.03),M(0x2a9a3a),0,.33,-.08,hd).rotation.x=-.5;
 for(const sx of[-1,1]){const a=new THREE.Group();a.position.set(sx*.25,.46,0);ch.add(a);add(box(.12,.3,.13),suit,0,-.15,0,a);const el=new THREE.Group();el.position.y=-.3;a.add(el);add(box(.11,.26,.12),suit,0,-.13,0,el);add(box(.1,.11,.11),glove,0,-.31,0,el);P[sx<0?'armL':'armR']=a;P[sx<0?'elbowL':'elbowR']=el;if(sx>0){const gp=new THREE.Group();gp.position.set(0,-.33,-.04);el.add(gp);P.grip=gp}}
 const R=(o,x,y,z)=>{o.rotation.set(x||0,y||0,z||0)};
 g.userData.parts=P;
 g.userData.pose=(n,t)=>{t=t||0;hips.position.set(0,HY,0);for(const k of['legL','legR','kneeL','kneeR','armL','armR','elbowL','elbowR','chest','head','hips'])R(P[k]);
  if(n=='run'){const s=Math.sin(t*11);R(P.legL,s*.8);R(P.legR,-s*.8);R(P.kneeL,-Math.max(0,-s)*1.1-.2);R(P.kneeR,-Math.max(0,s)*1.1-.2);R(P.armL,-s*.9);R(P.armR,s*.9);R(P.elbowL,.9);R(P.elbowR,.9);R(P.chest,.18);hips.position.y=HY-.04+Math.abs(Math.cos(t*11))*.05}
  else if(n=='gun'){/* down on the left knee, the right foot planted, both hands on the gun at wheel height; it buzzes */hips.position.y=.5;R(P.legR,1.45);R(P.kneeR,-1.45);R(P.legL,-.05);R(P.kneeL,-1.55);R(P.chest,.35);R(P.armR,1.15,0,.1);R(P.elbowR,.35);R(P.armL,1.1,0,-.35);R(P.elbowL,.6,.3);const b=Math.sin(t*90)*.02;P.armR.rotation.x+=b;P.armL.rotation.x+=b}
  else if(n=='jack'){/* leaning back, both hands low on the handle, pulling down in a stroke */const s=(Math.sin(t*6)+1)/2;R(P.chest,-.15+s*.25);R(P.armR,.9-s*.5);R(P.armL,.9-s*.5);R(P.elbowR,.3);R(P.elbowL,.3);R(P.legL,.25);R(P.kneeL,-.25);R(P.legR,-.3)}
  else if(n=='wipe'){const s=Math.sin(t*7);R(P.chest,.35);R(P.armR,1.6,0,.25+s*.5);R(P.elbowR,.2);R(P.armL,.4);R(P.elbowL,.5)}
  else if(n=='go'){R(P.armR,0,0,1.4+Math.sin(t*5)*.25);R(P.elbowR,0);R(P.armL,.1);R(P.head,0,.15)}
  else{/* idle */const s=Math.sin(t*1.6);R(P.chest,.02*s);R(P.armL,.05,0,-.08);R(P.armR,.05,0,.08);R(P.head,0,Math.sin(t*.4)*.3)}};
 g.userData.pose('idle',0);g.traverse(m=>{if(m.isMesh){m.userData.noSeam=true;m.userData.dpKeep=1}});return g}
