/* =====================================================================================================
   r625: THE SPEEDWAY, THE WIND FARM AND THE SOLAR FARM (docs/design/speedway-farms.md). The design chat's
   speedway.js (batches 1-3) and farms.js (batches 4-5) are copied below, then the wiring:
   - xpSpeedway is redefined: the new track, kerbs, tyre walls, main straight wall and catch fence, pit wall, start
     gantry with start lights, grandstand, race control, pit lane and four garages, entrance arch and car park,
     paddock, skid pad, scoreboard and floodlights. The oval and q.race do not move.
   - Pit stops: stop in a pit box and the crew of four repairs your car in about 4 s (spPitTick). Best stop in SV.xpit.
   - xpRaceTick: the pit lane counts as track, the start lights go green when a lap starts.
   - xpWind and xpSolar are redefined from the farm models (turbines in the same spots, panels in the same grid).
   ===================================================================================================== */
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
/* the pit entry: the main straight's concrete wall ends at x 303; the pit lane peels off the track edge there and
   curves in past race control (whose front is z -1781) to its full width (north edge z -1777) by x 326 */
/* the crossing: a gravel road from the entrance crosses the back straight into the infield; both tyre walls have a
   gap there (x 294..306) */
const SPX={cross:[294,306],wallEnd:303,a1:.6,rOut:a=>46+7.5*Math.max(0,1-a/.6)};
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
  /* runs: each unbroken piece of wall, so an obstacle box never bridges a gap or jumps from one wall to the other */const runs=[];let run=null;const brk=()=>{run=null};const put=p=>{if(p[1]<SPW.cz&&p[0]>SPX.cross[0]&&p[0]<SPX.cross[1]){brk();return}if(!run){run=[];runs.push(run)}run.push(p);pts.push(p)};
  const walk=(r,u0,u1)=>{brk();let prev=null,acc=1;for(let u=u0;u<=u1;u+=.05){const p=spPt(u,r);if(prev)acc+=Math.hypot(p[0]-prev[0],p[1]-prev[1]);prev=p;if(acc>=.98){acc=0;put(p)}}};
  /* the outer wall round the pit exit: radius SPX.rOut, starting just past the garages' corner */
  const walkV=(u0,u1)=>{let prev=null,acc=1;for(let u=u0;u<=u1;u+=.05){const p=spPt(u,SPX.rOut((u-S)/RZ));if(prev)acc+=Math.hypot(p[0]-prev[0],p[1]-prev[1]);prev=p;if(acc>=.98){acc=0;put(p)}}};
  const a0=.06;walk(RZ-8,0,P-.5);brk();walkV(S+a0*RZ,S+SPX.a1*RZ);walk(RZ+8,S+SPX.a1*RZ+.98,P-.05);
  const im=new THREE.InstancedMesh(ge,TM,pts.length),mm=new THREE.Matrix4();pts.forEach((p,i)=>{mm.makeTranslation(p[0],.42,p[1]);im.setMatrixAt(i,mm)});im.instanceMatrix.needsUpdate=true;im.frustumCulled=false;g.add(im);
  /* obstacles: one box per three stacks, never across a gap */for(const rn of runs)for(let i=0;i<rn.length;i+=3){const grp=rn.slice(i,i+3),xs=grp.map(p=>p[0]),zs=grp.map(p=>p[1]);obs.push({x0:Math.min(...xs)-.47,x1:Math.max(...xs)+.47,z0:Math.min(...zs)-.47,z1:Math.max(...zs)+.47})}
  /* the belt: a strap round the track side of each wall, red and white in 3 m blocks, bolted at the top */
  const bt=spRep(afCanvas(32,256,(x,w,h)=>{for(let i=0;i<2;i++){x.fillStyle=i?'#f0ece4':'#c42424';x.fillRect(0,i*h/2,w,h/2)}x.fillStyle='rgba(0,0,0,.25)';x.fillRect(0,0,w,2);x.fillRect(0,h-2,w,2);x.fillStyle='rgba(0,0,0,.35)';for(let i=0;i<8;i++){x.fillRect(4,i*32+14,3,3);x.fillRect(w-7,i*32+14,3,3)}}));
  const BM=new THREE.MeshStandardMaterial({map:bt,roughness:.8,side:THREE.DoubleSide});
  const belt=(r,u0,u1)=>g.add(new THREE.Mesh(spRibbon(u0,u1,r,0,0,6,[.04,.86]),BM));
  const ub0=S+Math.PI*RZ+(cx+S/2-SPX.cross[1]),ub1=S+Math.PI*RZ+(cx+S/2-SPX.cross[0]);/* the back straight runs east to west, so the gap's u range is from x 306 down to 294 */
  belt(RZ-8+.49,0,ub0-.3);belt(RZ-8+.49,ub1+.3,P);g.add(new THREE.Mesh(spRibbon(S+a0*RZ,S+SPX.a1*RZ,u=>SPX.rOut((u-S)/RZ)-.49,0,0,6,[.04,.86]),BM));belt(RZ+8-.49,S+SPX.a1*RZ,ub0-.3);belt(RZ+8-.49,ub1+.3,P)}
 /* ---- the concrete wall along the main straight (x 228..323): a jersey barrier, white, with sponsor boards on the
    track side and a catch fence leaning over the track ---- */
 {const CW=M(0xdcd8d0,{roughness:.9}),wx0=cx-S/2,wx1=SPX.wallEnd,wl=wx1-wx0;
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
 const WH=M(0xece8e0,{roughness:.8}),DK=M(0x2a2c30,{metalness:.3,roughness:.5}),GL=M(0x3a4a56,{roughness:.08,metalness:.3,transparent:true,opacity:.62,side:THREE.DoubleSide});
 /* two concrete floors with a window band each, a door at the back */B(x1-x0,6.2,z1-z0,xc,3.1,zc,WH);{const WN=M(0x34404a,{roughness:.1,metalness:.3});for(const y of[1.9,5]){B(x1-x0-1.2,1.1,.04,xc,y,z0-.02,WN);B(x1-x0-1.2,1.1,.04,xc,y+(y<3?.35:0),z1+.02,WN);for(const sx of[x0-.02,x1+.02])B(.04,1.1,z1-z0-1.2,sx,y,zc,WN)}}B(x1-x0+.1,.15,z1-z0+.1,xc,3.2,zc,M(0xc42828));
 B(1.1,2.2,.04,xc,1.1,z1+.04,M(0x3a3e44,{metalness:.3}));B(1.5,.12,.6,xc,2.3,z1+.3,WH);L('RACE CONTROL',5,.7,'#1a1a1a','#ffe040',60,xc,3.9,z0-.03,Math.PI);
 /* the glass cab: a floor slab that overhangs the front by 0.8, posts, glass on all four sides, a flat roof */const cy0=6.2,cy1=9.0,ov=.8;B(x1-x0+.4,.25,z1-z0+ov,xc,cy0+.125,zc-ov/2,WH);
 const cz0=z0-ov+.1;for(const[a,b]of[[x0+.1,cz0],[x1-.1,cz0],[x0+.1,z1-.1],[x1-.1,z1-.1]])B(.16,cy1-cy0,.16,a,(cy0+cy1)/2+.12,b,DK);
 B(x1-x0-.2,.9,.12,xc,cy0+.7,cz0,WH);B(x1-x0-.2,.9,.12,xc,cy0+.7,z1-.1,WH);for(const sx of[x0+.1,x1-.1])B(.12,.9,z1-cz0-.2,sx,cy0+.7,(cz0+z1)/2,WH);const gw=(w,x,z,ry)=>{const p=new THREE.Mesh(new THREE.PlaneGeometry(w,cy1-cy0-1.25),GL);p.position.set(x,cy0+1.15+(cy1-cy0-1.25)/2+.12,z);p.rotation.y=ry;g.add(p)};gw(x1-x0-.36,xc,cz0,Math.PI);gw(x1-x0-.36,xc,z1-.1,0);gw(z1-cz0-.36,x0+.1,(cz0+z1)/2,-Math.PI/2);gw(z1-cz0-.36,x1-.1,(cz0+z1)/2,Math.PI/2);
 for(let x=x0+2.1;x<x1-.5;x+=2)for(const z of[cz0,z1-.1])B(.06,cy1-cy0-1.25,.08,x,cy0+1.15+(cy1-cy0-1.25)/2+.12,z,DK);for(let z=cz0+2.2;z<z1-.5;z+=2.2)for(const x of[x0+.1,x1-.1])B(.08,cy1-cy0-1.25,.06,x,cy0+1.15+(cy1-cy0-1.25)/2+.12,z,DK);
 /* inside: a desk along the glass with screens */B(x1-x0-.8,.08,.7,xc,cy0+.95,cz0+.6,M(0x5a4a3a));B(x1-x0-.3,.02,z1-cz0-.3,xc,cy0+.26,(cz0+z1)/2,M(0x4a4e56,{roughness:.9}));for(let i=0;i<3;i++){B(.08,.06,.16,x0+1.6+i*2.4,cy0+1.02,cz0+.85,DK);const s=B(.7,.45,.04,x0+1.6+i*2.4,cy0+1.27,cz0+.85,DK);B(.64,.38,.01,x0+1.6+i*2.4,cy0+1.27,cz0+.875,M(0x60c0ff,{emissive:0x2060a0,emissiveIntensity:.6}))}
 B(x1-x0+.4,.3,z1-cz0+.4,xc,cy1+.27,(cz0+z1)/2,WH);
 /* roof rail, aerial and the amber beacon */for(const[a,b,c,d]of[[x0,cz0-.1,x1,cz0-.1],[x0,z1+.1,x1,z1+.1],[x0,cz0-.1,x0,z1+.1],[x1,cz0-.1,x1,z1+.1]])rod([a,cy1+1.4,b],[c,cy1+1.4,d],.03,DK,null,6);for(const[a,b]of[[x0,cz0-.1],[x1,cz0-.1],[x0,z1+.1],[x1,z1+.1]])rod([a,cy1+.42,b],[a,cy1+1.4,b],.03,DK,null,6);
 rod([x1-1,cy1+.42,z1-1],[x1-1,cy1+5,z1-1],.04,DK,null,6);for(const y of[cy1+2,cy1+3.2,cy1+4.3])rod([x1-1.5,y,z1-1],[x1-.5,y,z1-1],.015,DK,null,5);
 const beacon=M(0xffa020,{emissive:0xff8000,emissiveIntensity:.3,roughness:.3});C(.18,.2,.3,x0+1,cy1+.57,z1-1,beacon,null,null,12);C(.22,.22,.06,x0+1,cy1+.45,z1-1,DK,null,null,12);
 obs.push({x0,x1,z0,z1});g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{obs,beacon}}

function spPits(g){const k=spKit(),{B,C,rod,slab,L}=k.H(g),M=k.M,obs=[],{cx,cz,RX,RZ}=SPW,S=2*(RX-RZ),PX0=SPX.wallEnd,PX1=cx+S/2+(RZ+7)*Math.sin(SPX.a1)+1,ZE=cz+(RZ+7)*Math.cos(SPX.a1)-1,PZ1=-1777,GZ0=-1777,GZ1=-1766,GX0=328,GW=11;
 const WH=M(0xf0ece4,{roughness:.8}),DK=M(0x2a2c30,{metalness:.3,roughness:.5}),STL=M(0x6a6e74,{metalness:.35,roughness:.5}),GRN=M(0x2a9a3a,{roughness:.6});
 /* ---- the pit lane: one flat shape from the track's outer edge (radius 45) back to z -1777, painted concrete ---- */
 {/* along the track's outer edge to the merge point, then back along the band's outside edge (the tyre wall's inside) */const pts=[];pts.push([PX0,cz+RZ+7]);for(let i=0;i<=24;i++){const a=SPX.a1*i/24;pts.push([cx+S/2+(RZ+7)*Math.sin(a),cz+(RZ+7)*Math.cos(a)])}for(let i=24;i>=0;i--){const a=SPX.a1*i/24,rr=Math.max(RZ+7,SPX.rOut(a)-.5);pts.push([cx+S/2+rr*Math.sin(a),cz+rr*Math.cos(a)])}/* the north edge west to the entry curve, then the curve (a quadratic from (320,-1781.5) to (326,-1777)) and the taper down to the track edge at x 303 */pts.push([326,PZ1]);for(let t=1;t>=0;t-=.1){const u=1-t;pts.push([u*u*320+2*u*t*323.6+t*t*326,u*u*-1781.5+2*u*t*-1781.5+t*t*PZ1])}pts.push([PX0,cz+RZ+7]);
  const sh=new THREE.Shape();pts.forEach(([x,z],i)=>i?sh.lineTo(x,-z):sh.moveTo(x,-z));const ge=new THREE.ShapeGeometry(sh);const uv=ge.attributes.uv,ps=ge.attributes.position;for(let i=0;i<ps.count;i++)uv.setXY(i,(ps.getX(i)-PX0)/(PX1-PX0),1-(-ps.getY(i)-ZE)/(PZ1-ZE));
  const W=2048,H=Math.round(2048*(PZ1-ZE)/(PX1-PX0)),pxm=W/(PX1-PX0),X=x=>(x-PX0)*pxm,Z=z=>(z-ZE)*pxm;/* canvas top = south: seen from above in three.js (x right), +z is down the screen */
  const t=afCanvas(W,H,(c)=>{afTarmac(c,W,H,'#9a9894',21);c.fillStyle='#f2efe6';/* the lane's back line */c.fillRect(0,Z(PZ1-.45)-4,W,4);
   /* pit boxes: yellow frames with a number, a stop bar at the front */for(let i=0;i<4;i++){const bx=336+i*10;c.strokeStyle='#f0c020';c.lineWidth=5;c.strokeRect(X(bx-4),Z(-1783.1),8*pxm,5*pxm);c.fillStyle='#f0c020';c.fillRect(X(bx+3.6),Z(-1783.1),.3*pxm,5*pxm);c.font='bold '+Math.round(2.2*pxm)+'px Arial';c.textAlign='center';c.textBaseline='middle';c.save();c.translate(X(bx-1.6),Z(-1780.6));c.rotate(Math.PI/2);c.fillText(String(i+1),0,0);c.restore();c.fillStyle='rgba(30,30,30,.25)';c.fillRect(X(bx-2.5),Z(-1781.8),5*pxm,1.4*pxm)}
   /* PIT, then the 60 limit in its own red ring, one after the other down the lane, both read by a driver heading east (tops of the letters point east) */c.textAlign='center';c.textBaseline='middle';c.fillStyle='#f2efe6';c.font='bold '+Math.round(2.4*pxm)+'px Arial';c.save();c.translate(X(327.4),Z(-1780.3));c.rotate(Math.PI/2);c.fillText('PIT',0,0);c.restore();c.fillStyle='#f2efe6';c.beginPath();c.arc(X(330.4),Z(-1780.3),1.45*pxm,0,7);c.fill();c.strokeStyle='#d82828';c.lineWidth=.32*pxm;c.beginPath();c.arc(X(330.4),Z(-1780.3),1.3*pxm,0,7);c.stroke();c.fillStyle='#1a1a1a';c.font='bold '+Math.round(1.3*pxm)+'px Arial';c.save();c.translate(X(330.4),Z(-1780.3));c.rotate(Math.PI/2);c.fillText('60',0,.05*pxm);c.restore();
   /* chevrons along the exit band, pointing the way round */c.fillStyle='#f2efe6';for(let i=0;i<3;i++){const a=.05+i*.08,rr=RZ+7+3.2*(1-i*.2),px=cx+S/2+rr*Math.sin(a),pz=cz+rr*Math.cos(a);c.save();c.translate(X(px),Z(pz));c.rotate(a);const s=pxm;c.rotate(-a);c.beginPath();c.moveTo(-.35*s,-1.4*s);c.lineTo(.45*s,0);c.lineTo(-.35*s,1.4*s);c.lineTo(.05*s,1.4*s);c.lineTo(.85*s,0);c.lineTo(.05*s,-1.4*s);c.closePath();c.fill();c.restore()}});
  const m=new THREE.Mesh(ge,new THREE.MeshStandardMaterial({map:t,roughness:.95,polygonOffset:true,polygonOffsetUnits:-1}));m.rotation.x=-Math.PI/2;m.position.y=.05;g.add(m)}
 /* PIT IN and PIT OUT signs */for(const[x,z,t,ry]of[[306,-1782.6,'PIT IN · 60',-Math.PI/2],[372+55*Math.sin(.12),cz+55*Math.cos(.12),'PIT OUT',Math.PI/2]]){C(.05,.05,2.6,x,1.3,z,STL,null,null,8);L(t,1.6,.5,'#1a1a1a','#ffffff',50,x+(ry<0?-.06:0),2.4,z-(ry<0?0:.06),ry<0?ry:Math.PI);obs.push({x0:x-.15,x1:x+.15,z0:z-.15,z1:z+.15})}
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

/* ===================================================================================================== batch 3
   spEntrance(g)  the way in from the Southern Pass: a gravel road (x 296.5..303.5) up to the track and on across the
                  back straight into the infield, an entrance arch over it at z -1888, a ticket booth, a gravel car
                  park (x 240..292, z -1895..-1880) with bays, kerbs, two lamp posts and a sign, and CROSSING signs at
                  the track. Returns {obs}. (Drop the base's sign at (300,-1884).)
   spInfield(g)   the paddock (three team trailers with awnings, tables, tool chests, tyre stacks, x 250..330,
                  z -1852..-1838), the skid pad at (360,-1830), the scoreboard facing the grandstand, four portaloos.
                  Returns {obs, score, scoreDraw}: score is the board's face mesh; scoreDraw(lap, pit) returns a new
                  CanvasTexture for it (lap and pit in seconds or 0): score.material.map = scoreDraw(SV.xlap, SV.xpit).
   spFloods(g)    six floodlight masts round the oval. Returns {obs, lamps} (lamps: the glowing material).
   ===================================================================================================== */
function spEntrance(g){const k=spKit(),{B,C,rod,slab,L}=k.H(g),M=k.M,obs=[],{cx,cz,RZ}=SPW,STL=M(0x6a6e74,{metalness:.35,roughness:.5}),WH=M(0xf0ece4,{roughness:.8}),RD=M(0xc42828,{roughness:.6});
 const gravel=(x0,x1,z0,z1,lines)=>{const W=Math.round(Math.min(1024,(x1-x0)*20)),H=Math.round(Math.min(1024,(z1-z0)*20));const t=afCanvas(W,H,(c,w,h)=>{let sd=31;const r=()=>((sd=Math.imul(sd^sd>>>15,sd|1)+0x6d2b79f5|0)>>>0)/4294967296;c.fillStyle='#a89474';c.fillRect(0,0,w,h);for(let i=0;i<w*h/6;i++){const v=r();c.fillStyle=v<.4?'rgba(70,56,40,.25)':v<.7?'rgba(230,220,200,.25)':'rgba(140,120,96,.3)';c.fillRect(r()*w,r()*h,1+r()*2,1+r()*2)}if(lines)lines(c,w/(x1-x0))});return afPlane(g,x0,x1,z0,z1,.04,t,-1)};
 /* the road: Southern Pass edge to the track, and across the infield side to the paddock */gravel(296.5,303.5,-1896.5,cz-RZ-7);gravel(296.5,303.5,cz-RZ+7,-1852);
 /* the arch: two brick-red pillars, a lattice beam, the name on both sides and chequered flags */{const z=-1888,ph=6.2;for(const x of[294.8,305.2]){B(1.2,ph,1.2,x,ph/2,z,RD);B(1.4,.25,1.4,x,ph+.12,z,WH);B(1.4,.3,1.4,x,.15,z,WH);obs.push({x0:x-.6,x1:x+.6,z0:z-.6,z1:z+.6})}
  B(12.4,1.6,.5,300,ph-.6,z,M(0x1a1a1a));for(const s of[-1,1])L('DUSTY GULCH SPEEDWAY',9,1.1,'#1a1a1a','#ffe040',80,300,ph-.6,z+s*.26,s<0?Math.PI:0);
  for(const x of[294.8,305.2]){C(.03,.03,1.6,x,ph+1.05,z,STL,null,null,6);const t=afCanvas(64,40,(c,w,h)=>{for(let a=0;a<8;a++)for(let b=0;b<5;b++){c.fillStyle=(a+b)%2?'#f4f2ec':'#161616';c.fillRect(a*8,b*8,8,8)}});const f=new THREE.Mesh(new THREE.PlaneGeometry(.9,.56),new THREE.MeshStandardMaterial({map:t,side:THREE.DoubleSide}));f.position.set(x+(x<300?-.47:.47),ph+1.55,z);g.add(f)}}
 /* the ticket booth east of the road */{const bx=308,bz=-1889;B(3,2.6,3,bx,1.3,bz,WH);B(3.3,.2,3.3,bx,2.7,bz,RD);B(.04,.9,1.6,bx-1.52,1.5,bz,M(0x34404a,{roughness:.1}));B(.08,.06,1.7,bx-1.53,1.03,bz,WH);B(.4,.06,1.6,bx-1.7,1.02,bz,WH);
  L('TICKETS\nFREE · WE FORGOT TO CHARGE',2.6,.7,'#c42828','#ffffff',50,bx,2.25,bz-1.52,Math.PI);obs.push({x0:bx-1.5,x1:bx+1.5,z0:bz-1.5,z1:bz+1.5})}
 /* the car park: gravel with white bays, a kerb round it, lamp posts and a sign */{const x0=240,x1=292,z0=-1895,z1=-1880;gravel(x0,x1,z0,z1,(c,pm)=>{c.fillStyle='rgba(240,236,228,.85)';for(let x=x0+2;x<=x1-2;x+=3){c.fillRect((x-x0)*pm,0,3,5*pm);c.fillRect((x-x0)*pm,(z1-z0-5)*pm,3,5*pm)}c.fillRect(2*pm,5*pm,(x1-x0-4)*pm,3);c.fillRect(2*pm,(z1-z0-5)*pm,(x1-x0-4)*pm,3)});
  for(const[a,b,c2,d]of[[x0,x1,z0,z0],[x0,x1,z1,z1],[x0,x0,z0,z1]])B(Math.abs(b-a)+.25,.15,Math.abs(d-c2)+.25,(a+b)/2,.075,(c2+d)/2,M(0xd8d4cc));
  for(const lx of[255,277]){C(.08,.1,6,lx,3,-1887.5,STL,null,null,8);B(.2,.15,1.2,lx,6,-1887.5+.4,STL);B(.16,.04,.6,lx,5.92,-1887.5+.7,M(0xfff4d0,{emissive:0xffe0a0,emissiveIntensity:.8}));obs.push({x0:lx-.15,x1:lx+.15,z0:-1887.65,z1:-1887.35})}
  {const sx=288,sz=-1879;for(const dx of[-1,1])C(.05,.05,2.4,sx+dx,1.2,sz,STL,null,null,8);L('SPEEDWAY PARKING\nPARK NICELY',2.4,.9,'#2a6a3a','#ffffff',50,sx,2.2,sz-.04,Math.PI)}}
 /* CROSSING signs either side of the track, facing the road */for(const[z,ry]of[[cz-RZ-9.5,Math.PI],[cz-RZ+9.5,0]]){const x=304.6;C(.05,.05,2.2,x,1.1,z,STL,null,null,8);L('CROSSING\nLOOK BOTH WAYS',1.4,.7,'#f0c020','#1a1a1a',50,x,2,z+(ry?-.04:.04),ry);obs.push({x0:x-.12,x1:x+.12,z0:z-.12,z1:z+.12})}
 g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{obs}}

function spScoreDraw(lap,pit){const f=v=>v?Math.floor(v/60)+':'+(v%60).toFixed(1).padStart(4,'0'):'--:--';return afCanvas(1024,320,(c,w,h)=>{c.fillStyle='#101012';c.fillRect(0,0,w,h);c.fillStyle='#ffe040';c.font='bold 64px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText('DUSTY GULCH SPEEDWAY',w/2,58);c.fillStyle='#2a2a2e';c.fillRect(30,108,w-60,4);
 c.font='bold 54px Arial';c.textAlign='left';c.fillStyle='#e8e8e8';c.fillText('BEST LAP',60,170);c.fillText('BEST PIT STOP',60,250);c.textAlign='right';c.fillStyle='#40ff80';c.fillText(f(lap),w-60,170);c.fillStyle='#40d0ff';c.fillText(pit?pit.toFixed(1)+' s':'--.-',w-60,250)})}
function spInfield(g){const k=spKit(),{B,C,rod,slab,L}=k.H(g),M=k.M,obs=[],{cx,cz,RZ}=SPW,STL=M(0x6a6e74,{metalness:.35,roughness:.5}),WH=M(0xf0ece4,{roughness:.8}),DK=M(0x2a2c30,{metalness:.3,roughness:.5}),tyreM=M(0x1c1c1e,{roughness:.95});
 /* the paddock: three team trailers side by side, back to the infield road, awnings out the front (north) */
 const teams=[['TEAM GOBLINO','#3a8a2a','#f0d020'],['DOORS RACING','#1a1a2a','#ffe040'],['HALT MOTORSPORT','#a02020','#ffffff']];
 teams.forEach(([nm,bg,fg],i)=>{const tx=262+i*24,tz=-1850.5,TL=13,TW=2.5,TH=2.9,y0=1.1;
  /* the box with the team livery on both sides */B(TL,TH,TW,tx,y0+TH/2,tz,M(bg,{roughness:.55}));for(const s of[-1,1]){const lb=k.lab(nm,TL-1.5,1.2,null,fg,90);lb.position.set(tx,y0+TH*.6,tz+s*(TW/2+.012));lb.rotation.y=s<0?Math.PI:0;g.add(lb)}
  /* a roof cap sitting on top, a little wider all round */B(TL+.06,.08,TW+.06,tx,y0+TH+.04,tz,M(0xd8d8d8));B(TL+.05,.25,TW+.05,tx,y0+.12,tz,DK);
  /* wheels at the back, landing legs at the front */for(const dx of[TL/2-1.6,TL/2-2.8])for(const s of[-1,1]){const w=C(.5,.5,.32,tx+dx,.5,tz+s*(TW/2-.25),tyreM,'z',null,14);C(.28,.28,.34,tx+dx,.5,tz+s*(TW/2-.25),M(0xb0b4b8,{metalness:.6}),'z',null,10)}
  for(const s of[-1,1]){B(.12,y0,.12,tx-TL/2+2,y0/2,tz+s*(TW/2-.3),STL);B(.4,.05,.4,tx-TL/2+2,.025,tz+s*(TW/2-.3),STL)}
  /* the awning: a sloping canvas from the trailer's top edge, out 4 m on two legs */const aw=4,ay0=y0+TH-.15,ay1=2.4,A=Math.hypot(aw,ay0-ay1);const cv=afCanvas(64,64,(c,w,h)=>{c.fillStyle=bg;c.fillRect(0,0,w,h);c.fillStyle='rgba(255,255,255,.18)';for(let j=0;j<w;j+=16)c.fillRect(j,0,8,h)});
  const am=new THREE.Mesh(new THREE.PlaneGeometry(TL-1,A),new THREE.MeshStandardMaterial({map:cv,side:THREE.DoubleSide,roughness:.8}));am.position.set(tx,(ay0+ay1)/2,tz+TW/2+aw/2);am.rotation.x=-Math.PI/2+Math.atan2(ay0-ay1,aw);g.add(am);
  for(const dx of[-(TL-1)/2,(TL-1)/2]){rod([tx+dx,0,tz+TW/2+aw],[tx+dx,ay1,tz+TW/2+aw],.03,STL,null,6);rod([tx+dx,ay1,tz+TW/2+aw],[tx+dx,ay0,tz+TW/2+.02],.02,STL,null,5)}
  /* under it: a table, two chairs, a tool chest, a tyre stack */B(1.6,.05,.8,tx-2,.74,tz+TW/2+2,WH);for(const[a,b]of[[-.7,-.3],[.7,-.3],[-.7,.3],[.7,.3]])C(.02,.02,.72,tx-2+a,.36,tz+TW/2+2+b,STL,null,null,6);for(const dx of[-2.7,-1.3]){B(.42,.04,.42,tx+dx,.45,tz+TW/2+2.75,M(0x2a2c30));B(.42,.42,.04,tx+dx,.66,tz+TW/2+2.96,M(0x2a2c30));for(const[a,b]of[[-.18,-.18],[.18,-.18],[-.18,.18],[.18,.18]])C(.015,.015,.45,tx+dx+a,.22,tz+TW/2+2.75+b,STL,null,null,5)}
  B(1,1,.55,tx+2.5,.5,tz+TW/2+.6,M(0xc42828,{roughness:.45,metalness:.2}));for(let n=0;n<4;n++)C(.33,.33,.26,tx+4.5,.13+n*.26,tz+TW/2+1.2,tyreM,null,null,14);
  obs.push({x0:tx-TL/2,x1:tx+TL/2,z0:tz-TW/2,z1:tz+TW/2})});
 /* the skid pad: a round concrete pad with doughnut marks, cones round it */{const px=360,pz=cz,R=9;const t=afCanvas(512,512,(c,w,h)=>{afTarmac(c,w,h,'#9c9a96',41);c.strokeStyle='rgba(20,20,20,.35)';for(let i=0;i<14;i++){c.lineWidth=6+Math.random()*8;c.beginPath();c.arc(w/2+(Math.random()-.5)*60,h/2+(Math.random()-.5)*60,90+Math.random()*120,0,7);c.stroke()}});
  const m=new THREE.Mesh(new THREE.CircleGeometry(R,48),new THREE.MeshStandardMaterial({map:t,roughness:.9,polygonOffset:true,polygonOffsetUnits:-1}));m.rotation.x=-Math.PI/2;m.position.set(px,.04,pz);g.add(m);
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2,x=px+Math.cos(a)*(R+.6),z=pz+Math.sin(a)*(R+.6);C(.02,.16,.42,x,.21,z,M(0xff6a10,{roughness:.6}),null,null,10);C(.06,.06,.06,x,.3,z,WH,null,null,10);B(.34,.03,.34,x,.015,z,M(0xff6a10))}
  L('SKID PAD\nDOUGHNUTS ONLY',2,.8,'#1a1a1a','#ffffff',50,px,1.6,pz+R+1.6,0);for(const dx of[-.8,.8])C(.04,.04,1.5,px+dx,.75,pz+R+1.62,STL,null,null,6)}
 /* the scoreboard: a big board on two lattice legs, facing the grandstand (north) */let score;{const sx=300,sz=-1810,W=16,H=5,Y=6;for(const dx of[-6,6]){const lx=sx+dx;for(const[a,b]of[[-.3,-.3],[.3,-.3],[-.3,.3],[.3,.3]])rod([lx+a,0,sz+b],[lx+a,Y,sz+b],.04,STL,null,6);for(let y=.4;y+1<=Y;y+=1)for(const[a0,b0,a1,b1]of[[-.3,-.3,.3,-.3],[.3,-.3,.3,.3],[.3,.3,-.3,.3],[-.3,.3,-.3,-.3]])rod([lx+a0,y,sz+b0],[lx+a1,y+1,sz+b1],.015,STL,null,4);B(.9,.12,.9,lx,.06,sz,M(0xa8a49c));obs.push({x0:lx-.45,x1:lx+.45,z0:sz-.45,z1:sz+.45})}
  B(W+.4,H+.4,.5,sx,Y+H/2,sz,DK);score=new THREE.Mesh(new THREE.PlaneGeometry(W,H),new THREE.MeshBasicMaterial({map:spScoreDraw(0,0)}));score.position.set(sx,Y+H/2,sz+.26);g.add(score);score.userData.dpKeep=1}
 /* portaloos */for(let i=0;i<4;i++){const px=226+i*1.6,pz=-1842;B(1.3,2.3,1.3,px,1.15,pz,M(0x2a6ac8,{roughness:.6}));B(1.36,.12,1.36,px,2.36,pz,M(0xe8ecf0));B(.9,1.9,.03,px,1.05,pz+.665,M(0x1a4a98));B(.12,.08,.02,px+.3,1.1,pz+.69,M(0x20c040,{emissive:0x10a030,emissiveIntensity:.5}))}obs.push({x0:225.3,x1:231.5,z0:-1842.65,z1:-1841.35});
 g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{obs,score,scoreDraw:spScoreDraw}}

function spFloods(g){const k=spKit(),{B,C,rod,slab,L}=k.H(g),M=k.M,obs=[],STL=M(0x8a8e94,{metalness:.35,roughness:.5}),DK=M(0x2a2c30,{metalness:.3,roughness:.5});
 const lamps=M(0xfff8e8,{emissive:0xfff0d0,emissiveIntensity:.3,roughness:.3});const{cx,cz}=SPW;
 for(const[x,z]of[[185,-1878],[312,-1879],[415,-1878],[185,-1782],[415,-1782],[230,-1782]]){const H=22;C(.22,.4,H,x,H/2,z,STL,null,null,12);B(1.2,.4,1.2,x,.2,z,M(0xa8a49c));
  /* ladder up one side */for(let y=.6;y<H-1;y+=.4)B(.4,.03,.03,x,y,z+.48,STL);for(const s of[-1,1])rod([x+s*.2,.5,z+.48],[x+s*.2,H-1,z+.48],.015,STL,null,4);
  /* the head: a frame of 2 x 4 lamps, turned to face the track's centre */const hd=new THREE.Group();hd.position.set(x,H+.6,z);hd.lookAt(cx,H+.6-6,cz);g.add(hd);
  const fr=new THREE.Mesh(new THREE.BoxGeometry(3.2,1.5,.12),DK);hd.add(fr);for(let a=0;a<4;a++)for(let b=0;b<2;b++){const lp=new THREE.Group();lp.position.set(-1.2+a*.8,-.38+b*.76,.18);hd.add(lp);const bx=new THREE.Mesh(new THREE.BoxGeometry(.6,.55,.3),DK);lp.add(bx);const gl=new THREE.Mesh(new THREE.PlaneGeometry(.5,.45),lamps);gl.position.z=.152;lp.add(gl)}
  const rail=new THREE.Mesh(new THREE.BoxGeometry(3.4,.05,.6),STL);rail.position.set(0,-.95,-.15);hd.add(rail);
  obs.push({x0:x-.6,x1:x+.6,z0:z-.6,z1:z+.6})}
 g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{obs,lamps}}

/* The wind farm and the solar farm (speedway-farms.md, batches 4 and 5). Needs fort-kit.js (fbKit) and airfield.js
   (afCanvas, afPlane, afTarmac, afCorr). Desert-local coordinates, y up, +z north. Everything is noSeam.

   wfTurbine()  one wind turbine, origin at the foot of the tower. The rotor faces -z (south) at rotation.y = 0.
                Hub height 39.5 m (as now), blades 17.5 m. wfTurbine(ds): ds = 1 puts the door on +z, -1 on -z. Returns a Group with userData:
                  hub     the rotor Group: spin it with hub.rotation.z += dt * speed (as the old xpWind did)
                  beacon  the red aviation light's material (blink it)
                Tower base radius 1.9 m: one obstacle box of 3.8 x 3.8 round the origin.
   wfFarm(g)    batch 4: the eight turbines in their current spots (turbine 6 still turns the wrong way), each on a
                gravel pad with a door facing the service track and a transformer box; the service track and spurs;
                the substation yard (x -505..-482, z -1285..-1270) with a fence and gate, transformer, insulator
                gantry, switchgear and control hut; a power line on poles along the road to Coyote Rd.
                Returns {obs, rotors:[{hub, sp}], beacon, prop:{x,z}} (prop: where the substation sign's [E] goes).
*/
function wfKit(){if(wfKit.k)return wfKit.k;const f=fbKit(),k=Object.create(f);k.M=f.M;wfKit.k=k;return k}
const WFT=[];for(let i=0;i<8;i++)WFT.push({x:-600+(i%4)*38,z:-1215-((i/4)|0)*70-(i%2)*20,sp:(i==5?-1:1)*(.9+(i%3)*.15),ph:i*1.3});

/* a blade: the planform drawn in x (chord) / y (span), pushed .18 thick, with a round root */
function wfBladeGeo(){const s=new THREE.Shape(),L=17.5;s.moveTo(-.38,0);s.lineTo(.38,0);s.lineTo(.42,1.4);s.quadraticCurveTo(1.05,2.6,.95,4.2);s.quadraticCurveTo(.7,11,.2,L);s.lineTo(-.12,L);s.quadraticCurveTo(-.5,10,-.62,3.6);s.quadraticCurveTo(-.6,2.2,-.42,1.4);s.lineTo(-.38,0);
 const ge=new THREE.ExtrudeGeometry(s,{depth:.2,bevelEnabled:true,bevelThickness:.05,bevelSize:.05,bevelSegments:1,curveSegments:8});ge.translate(0,0,-.1);return ge}

function wfTurbine(ds){ds=ds||1;const g=new THREE.Group(),k=wfKit(),{B,C,rod}=k.H(g),M=k.M,WH=M(0xf2f2f0,{roughness:.55}),GR=M(0xd8dadc,{roughness:.5}),DK=M(0x3a3c40,{roughness:.6});
 /* the tower: a tapered tube with three flange rings, a door at the bottom (on +z; turn the group to aim it) */const TH=38.2;C(1.0,1.9,TH,0,TH/2,0,WH,null,null,28);for(const y of[12.5,25])C(1.0+.9*(1-y/TH)+.025,1.0+.9*(1-y/TH)+.025,.12,0,y,0,GR,null,null,28);
 C(2.6,2.8,.5,0,.25,0,M(0xa8a49c,{roughness:.95}),null,null,24);/* the door (on +z, or -z when ds = -1), set into the tower's curve with a little canopy and steps */{const r=1.9-.9*(1.2/TH),dz=r-.02;B(.9,2.1,.12,0,1.55,ds*(dz+.04),M(0xc8ccd0,{metalness:.3,roughness:.45}));B(1.1,.06,.5,0,2.66,ds*(dz+.26),GR);B(1.1,.25,.5,0,.62,ds*(dz+.45),M(0xa8a49c));B(1.1,.25,.5,0,.37,ds*(dz+.7),M(0xa8a49c))}
 /* the nacelle on its yaw ring: a long rounded housing, the rotor at the front (-z) */const top=new THREE.Group();top.position.y=TH;g.add(top);
 {const sh=new THREE.Shape();const w=1.55,h=2.4;sh.moveTo(-w,0);sh.lineTo(w,0);sh.lineTo(w,h-.5);sh.quadraticCurveTo(w,h,w-.5,h);sh.lineTo(-w+.5,h);sh.quadraticCurveTo(-w,h,-w,h-.5);sh.lineTo(-w,0);const ge=new THREE.ExtrudeGeometry(sh,{depth:6,bevelEnabled:true,bevelThickness:.3,bevelSize:.3,bevelSegments:3,curveSegments:6});ge.translate(0,0,-3);const n=new THREE.Mesh(ge,WH);n.position.set(0,.15,.6);top.add(n)}
 {const y=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.1,.3,24),GR);y.position.y=.1;top.add(y)}
 /* on the roof: a little rail, the wind vane and cup anemometer mast at the back, and the red light */{const rm=new THREE.Mesh(new THREE.BoxGeometry(2.2,.04,.04),GR);rm.position.set(0,2.9,3.5);top.add(rm);const ms=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,1.1,6),GR);ms.position.set(.6,3.4,3.2);top.add(ms);const vn=new THREE.Mesh(new THREE.BoxGeometry(.03,.25,.6),GR);vn.position.set(.6,3.95,3.35);top.add(vn);
  for(let i=0;i<3;i++){const a=i/3*Math.PI*2,cu=new THREE.Mesh(new THREE.SphereGeometry(.07,8,6,0,Math.PI*2,0,Math.PI/2),GR);cu.position.set(-.6+Math.cos(a)*.22,3.95,3.2+Math.sin(a)*.22);cu.rotation.z=Math.PI/2;top.add(cu)}const cm=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,1.1,6),GR);cm.position.set(-.6,3.4,3.2);top.add(cm)}
 const beacon=new THREE.MeshStandardMaterial({color:0x5a1010,emissive:0xff1010,emissiveIntensity:1,roughness:.3});{const b=new THREE.Mesh(new THREE.SphereGeometry(.16,10,8),beacon);b.position.set(0,2.95,2.4);top.add(b);const bb=new THREE.Mesh(new THREE.CylinderGeometry(.12,.14,.12,10),DK);bb.position.set(0,2.86,2.4);top.add(bb)}
 /* the rotor: a nose cone and three blades, spinning about z, 3.2 m in front of the tower (as the old hub) */const hub=new THREE.Group();hub.position.set(0,1.5,-3.2);top.add(hub);
 {const pts=[];for(let i=0;i<=10;i++){const t=i/10;pts.push(new THREE.Vector2(Math.max(.001,1.05*Math.sqrt(1-t*t)),t*1.6))}const nc=new THREE.Mesh(new THREE.LatheGeometry(pts,24),WH);nc.rotation.x=-Math.PI/2;hub.add(nc);const hb=new THREE.Mesh(new THREE.CylinderGeometry(1.05,1.15,1.1,24),WH);hb.rotation.x=Math.PI/2;hb.position.z=.5;hub.add(hb)}
 const bg=wfBladeGeo();for(let b=0;b<3;b++){const p=new THREE.Group();p.rotation.z=b*Math.PI*2/3;hub.add(p);const root=new THREE.Mesh(new THREE.CylinderGeometry(.42,.48,1.2,16),WH);root.position.y=1.2;p.add(root);const bl=new THREE.Mesh(bg,WH);bl.position.y=1.6;bl.rotation.y=.18;/* a little pitch so it catches the light like a real blade */p.add(bl);
  /* a red tip band (the planform tip is at y 17.5) */const tip=new THREE.Mesh(new THREE.BoxGeometry(.5,.9,.26),M(0xc42828,{roughness:.5}));tip.position.set(.04,1.6+16.9,0);tip.rotation.y=.18;p.add(tip)}
 g.userData.hub=hub;g.userData.beacon=beacon;
 g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});hub.traverse(m=>{m.userData.dpKeep=1});return g}

function wfFarm(g){const k=wfKit(),{B,C,rod,L}=k.H(g),M=k.M,obs=[],rotors=[],STL=M(0x8a8e94,{metalness:.35,roughness:.5}),CN=M(0xb8b4ac,{roughness:.95}),GN=M(0x4a6a4a,{roughness:.6});let beacon;
 const gravel=(x0,x1,z0,z1,seed)=>{const W=Math.round(Math.min(1024,(x1-x0)*12)),H=Math.round(Math.min(1024,(z1-z0)*12));const t=afCanvas(Math.max(8,W),Math.max(8,H),(c,w,h)=>{let sd=seed||9;const r=()=>((sd=Math.imul(sd^sd>>>15,sd|1)+0x6d2b79f5|0)>>>0)/4294967296;c.fillStyle='#a8977a';c.fillRect(0,0,w,h);for(let i=0;i<w*h/5;i++){const v=r();c.fillStyle=v<.4?'rgba(70,58,42,.22)':v<.7?'rgba(230,222,204,.22)':'rgba(150,130,104,.28)';c.fillRect(r()*w,r()*h,1+r()*2,1+r()*2)}for(let i=0;i<4;i++){c.fillStyle='rgba(90,74,54,.12)';c.fillRect(0,h*(.3+i*.12),w,h*.04)}});return afPlane(g,x0,x1,z0,z1,.04,t,-1)};
 /* the service track along z -1261, from the end of the road west to the last turbine, and a spur to each pad */const TZ0=-1263,TZ1=-1259;gravel(-605,-480,TZ0,TZ1,3);
 WFT.forEach((t,i)=>{const north=t.z>TZ1,P=5;gravel(t.x-P,t.x+P,t.z-P,t.z+P,10+i);if(north)gravel(t.x-2,t.x+2,TZ1,t.z-P,20+i);else gravel(t.x-2,t.x+2,t.z+P,TZ0,20+i);
  /* the rotor faces south as before; the door goes on the side facing the track */const tb=wfTurbine(north?-1:1);tb.position.set(t.x,0,t.z);g.add(tb);
  tb.userData.hub.rotation.z=t.ph;rotors.push({hub:tb.userData.hub,sp:t.sp});beacon=beacon||tb.userData.beacon;tb.traverse(m=>{if(m.isMesh&&m.material===tb.userData.beacon)m.material=beacon});
  /* the transformer box on the pad, beside the door */const bz=t.z+(north?-3.4:3.4);B(1.8,1.5,1.2,t.x+2.4,.75,bz,GN);B(1.9,.08,1.3,t.x+2.4,1.54,bz,M(0x3a5a3a));L('⚡ 690 V',.8,.3,'#f0c020','#1a1a1a',40,t.x+2.4,1.1,bz+(north?-.61:.61),north?Math.PI:0);
  obs.push({x0:t.x-1.9,x1:t.x+1.9,z0:t.z-1.9,z1:t.z+1.9},{x0:t.x+1.5,x1:t.x+3.3,z0:bz-.6,z1:bz+.6})});
 /* ---- the substation yard ---- */{const x0=-505,x1=-482,z0=-1285,z1=-1270;gravel(x0,x1,z0,z1,77);
  /* chain-link fence on posts, a double gate in the north side facing the road end */const ch=afCanvas(128,128,(x,w,h)=>{x.clearRect(0,0,w,h);x.strokeStyle='rgba(150,155,160,.95)';x.lineWidth=3;for(let i=-w;i<w*2;i+=16){x.beginPath();x.moveTo(i,0);x.lineTo(i+h,h);x.stroke();x.beginPath();x.moveTo(i,h);x.lineTo(i+h,0);x.stroke()}});ch.wrapS=ch.wrapT=THREE.RepeatWrapping;
  const fence=(ax,az,bx,bz)=>{const l=Math.hypot(bx-ax,bz-az),t=ch.clone();t.needsUpdate=true;t.repeat.set(l/1.2,2.2/1.2);const m=new THREE.Mesh(new THREE.PlaneGeometry(l,2.2),new THREE.MeshStandardMaterial({map:t,transparent:true,alphaTest:.35,side:THREE.DoubleSide,roughness:.6,metalness:.3}));m.position.set((ax+bx)/2,1.15,(az+bz)/2);m.rotation.y=-Math.atan2(bz-az,bx-ax);g.add(m);for(let i=0;i<=Math.round(l/3);i++){const f=i/Math.round(l/3);C(.05,.05,2.5,ax+(bx-ax)*f,1.25,az+(bz-az)*f,STL,null,null,6)}rod([ax,2.3,az],[bx,2.3,bz],.025,STL,null,5);obs.push({x0:Math.min(ax,bx)-.1,x1:Math.max(ax,bx)+.1,z0:Math.min(az,bz)-.1,z1:Math.max(az,bz)+.1})};
  const GX0=-488,GX1=-484;fence(x0,z0,x1,z0);fence(x0,z0,x0,z1);fence(x1,z0,x1,z1);fence(x0,z1,GX0,z1);fence(GX1,z1,x1,z1);
  /* the gate leaves, swung open inwards */for(const[hx,s]of[[GX0,1],[GX1,-1]]){const gp=new THREE.Group();gp.position.set(hx,0,z1);gp.rotation.y=s*1.2;g.add(gp);const t=ch.clone();t.needsUpdate=true;t.repeat.set(2/1.2,2/1.2);const lf=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.MeshStandardMaterial({map:t,transparent:true,alphaTest:.35,side:THREE.DoubleSide,metalness:.3}));lf.position.set(s,1.15,0);gp.add(lf);for(const y of[.15,2.15]){const r=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,2,6),STL);r.rotation.z=Math.PI/2;r.position.set(s,y,0);gp.add(r)}const r2=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,2,6),STL);r2.position.set(s*2,1.15,0);gp.add(r2)}
  L('DANGER · 11,000 VOLTS\nALSO SNAKES',1.6,.7,'#f0c020','#1a1a1a',44,(GX0+x0)/2+3,1.4,z1+.03,0);
  /* the main transformer: a tank with radiator fins, three bushings on top, on a concrete plinth */{const tx=-495,tz=-1278;B(5,.3,4,tx,.15,tz,CN);B(3.4,2.6,2.4,tx,1.6,tz,GN);for(let i=0;i<9;i++)for(const s of[-1,1])B(.05,2,.5,tx-1.6+i*.4,1.5,tz+s*1.45,M(0x3a5a3a));B(3.5,.1,2.5,tx,2.95,tz,M(0x3a5a3a));
   for(let i=0;i<3;i++){const bx=tx-1+i;for(let j=0;j<6;j++)C(.16,.16,.1,bx,3.1+j*.14,tz,M(0x8a5a3a,{roughness:.4}),null,null,10);C(.04,.04,.9,bx,3.4,tz,STL,null,null,6)}obs.push({x0:tx-2.5,x1:tx+2.5,z0:tz-2,z1:tz+2})}
  /* the insulator gantry: an H frame, three stacks of insulators, wires down to the transformer */{const gx=-489,gz=-1278,H=6;for(const s of[-1,1]){rod([gx,0,gz+s*2.2],[gx,H,gz+s*2.2],.12,STL,null,8);B(.6,.2,.6,gx,.1,gz+s*2.2,CN);obs.push({x0:gx-.3,x1:gx+.3,z0:gz+s*2.2-.3,z1:gz+s*2.2+.3})}rod([gx,H,gz-2.4],[gx,H,gz+2.4],.1,STL,null,8);
   for(let i=-1;i<=1;i++){/* each insulator string hangs from the beam: a steel core from the beam down, the discs threaded on it, a clamp at the bottom where the wire is held */C(.03,.03,.95,gx,H-.5,gz+i*1.5,STL,null,null,6);for(let j=0;j<6;j++)C(.15,.15,.08,gx,H-.16-j*.13,gz+i*1.5,M(0x8a5a3a,{roughness:.4}),null,null,10);C(.06,.06,.1,gx,H-.95,gz+i*1.5,STL,null,null,8);const w=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(gx,H-.97,gz+i*1.5),new THREE.Vector3(gx-2.5,4.6,-1278+i*.6),new THREE.Vector3(-495+i,3.85,-1278)]),12,.02,4),M(0x2a2a2a));g.add(w)}}
  /* switchgear cabinets and the control hut by the gate */for(let i=0;i<3;i++){B(1,2,.8,-501+i*1.2,1,-1283.6,M(0xb8bcc0,{metalness:.3,roughness:.5}));B(.05,.4,.02,-501+i*1.2+.3,1.2,-1283.18,STL)}obs.push({x0:-501.6,x1:-498.4,z0:-1284,z1:-1283.2});
  {const hx=-500,hz=-1273.5;B(6,3,4,hx,1.5,hz,M(0xd8d4cc,{roughness:.9}));B(6.4,.2,4.4,hx,3.1,hz,M(0x6a6e74));B(1,2.1,.05,hx+1.6,1.05,hz+2.01,M(0x3a5a3a));B(1.4,.9,.04,hx-1.2,1.8,hz+2.01,M(0x34404a,{roughness:.1}));L('SUBSTATION 6\nWIND CO-OP',2,.6,'#2a6a3a','#ffffff',44,hx-1.2,2.75,hz+2.02,0);obs.push({x0:hx-3,x1:hx+3,z0:hz-2,z1:hz+2})}}
 /* ---- the power line: poles every 12 m along the south side of the road, from the gantry to Coyote Rd ---- */{const z=-1270.4,P=[];for(let x=-481;x<=-446;x+=11.7)P.push(x);const PM=M(0x6a4a2a,{roughness:.95}),top=9;
  for(const x of P){C(.14,.18,top,x,top/2,z,PM,null,null,8);B(.12,.12,2.6,x,top-.6,z,PM);for(const s of[-1,0,1])C(.08,.08,.3,x,top-.4,z+s*1.1,M(0x8a5a3a),null,null,8);obs.push({x0:x-.2,x1:x+.2,z0:z-.2,z1:z+.2})}
  for(const s of[-1,0,1])for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],y=top-.25,pts=[];for(let j=0;j<=8;j++){const f=j/8;pts.push(new THREE.Vector3(a+(b-a)*f,y-Math.sin(f*Math.PI)*.6,z+s*1.1))}g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),12,.015,4),M(0x2a2a2a)))}
  /* the first span drops into the substation gantry */for(const s of[-1,0,1]){const pts=[new THREE.Vector3(P[0],top-.25,z+s*1.1),new THREE.Vector3(-485,6.6,-1274+s*.7),new THREE.Vector3(-489,5.75,-1278+s*1.5)];g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),10,.015,4),M(0x2a2a2a)))}}
 g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});rotors.forEach(r=>r.hub.traverse(m=>m.userData.dpKeep=1));return{obs,rotors,beacon,prop:{x:-486,z:-1268.6}}}

/* ===================================================================================================== batch 5
   sfFarm(g)  the solar farm. The 10 rows keep their places (z -1270 - 8r) and their obstacle lines; each row is now
              twelve 12.4 m tables of panels (one InstancedMesh of 120 tables, cells and frames painted on), tilted
              0.5 rad to the south like before, on pairs of steel legs with a torque tube. An inverter box at each
              row's east end with a cable tray along the row; a chain-link fence with barbed wire round it all
              (x -198..-38, z -1348..-1263) with a gate where the road comes in; the control hut beside the road
              outside the gate (x -34..-24, z -1296..-1288) with a door, window, aerial and air-con box; HALT's
              cleaning cart parked by it.
              Returns {obs, prop}: prop {x, z} is where the hut's "[E] Read the panel" goes.
   ===================================================================================================== */
function sfFarm(g){const k=wfKit(),{B,C,rod,L}=k.H(g),M=k.M,obs=[],STL=M(0x9a9ea4,{metalness:.4,roughness:.45}),DK=M(0x2a2c30,{roughness:.6});
 const TL=12.4,TD=2.2,TILT=-.5,NR=10,NC=12,cx0=-190,cz0=-1270;
 /* the panel face: 12 x 2 modules, each 4 x 6 cells, thin aluminium frames */const face=afCanvas(1024,192,(c,w,h)=>{c.fillStyle='#c8ccd0';c.fillRect(0,0,w,h);const mw=w/12,mh=h/2;for(let i=0;i<12;i++)for(let j=0;j<2;j++){const x0=i*mw+2,y0=j*mh+2,ww=mw-4,hh=mh-4;c.fillStyle='#16224a';c.fillRect(x0,y0,ww,hh);for(let a=0;a<6;a++)for(let b=0;b<4;b++){const cx=x0+2+a*(ww-4)/6,cy=y0+2+b*(hh-4)/4;const gr=c.createLinearGradient(cx,cy,cx+(ww-4)/6,cy+(hh-4)/4);gr.addColorStop(0,'#1e3270');gr.addColorStop(1,'#14204e');c.fillStyle=gr;c.fillRect(cx+.6,cy+.6,(ww-4)/6-1.2,(hh-4)/4-1.2)}c.fillStyle='rgba(200,210,230,.35)';c.fillRect(x0+ww/2-.5,y0,1,hh)}c.fillStyle='rgba(255,255,255,.07)';c.fillRect(0,0,w,h*.3)});
 const pm=new THREE.MeshStandardMaterial({map:face,roughness:.25,metalness:.35}),side=new THREE.MeshStandardMaterial({color:0xb8bcc0,metalness:.5,roughness:.4}),back=new THREE.MeshStandardMaterial({color:0xd8dadc,roughness:.6});
 /* box faces: +x, -x, +y (the cells), -y (the white back sheet), +z, -z */const tm=new THREE.InstancedMesh(new THREE.BoxGeometry(TL,.06,TD),[side,side,pm,back,side,side],NR*NC);
 const legH=(dz)=>1.4-Math.sin(-TILT)*dz,mm=new THREE.Matrix4(),q=new THREE.Quaternion().setFromEuler(new THREE.Euler(TILT,0,0)),one=new THREE.Vector3(1,1,1),p=new THREE.Vector3();let n=0;
 /* tilt 0.5 rad about x, the high edge to the north: the old panels used the same Euler(-0.5,0,0) */
 const lp=[],tp=[];for(let r=0;r<NR;r++)for(let c=0;c<NC;c++){const x=cx0+c*13,z=cz0-r*8;p.set(x,1.4,z);mm.compose(p,q,one);tm.setMatrixAt(n++,mm);for(const dx of[-TL/2+1.2,0,TL/2-1.2])for(const dz of[-.75,.75])lp.push([x+dx,z+dz]);tp.push([x,z])}
 tm.instanceMatrix.needsUpdate=true;tm.frustumCulled=false;g.add(tm);
 /* legs: one instanced post per support (front and back, three along each table), from the ground to the frame */{const im=new THREE.InstancedMesh(new THREE.CylinderGeometry(.05,.05,1,8),STL,lp.length),s=new THREE.Vector3(),pp=new THREE.Vector3(),qi=new THREE.Quaternion();lp.forEach(([x,z],i)=>{const dz=z-(cz0-Math.round((cz0-z)/8)*8);const top=1.4+Math.sin(-TILT)*dz-.06;/* the frame's height above this point */s.set(1,top,1);pp.set(x,top/2,z);mm.compose(pp,qi,s);im.setMatrixAt(i,mm)});im.instanceMatrix.needsUpdate=true;im.frustumCulled=false;g.add(im);
  /* the torque tube along each table, under the middle */const tt=new THREE.InstancedMesh(new THREE.BoxGeometry(TL-.4,.1,.1),STL,tp.length);tp.forEach(([x,z],i)=>{pp.set(x,1.3,z);mm.compose(pp,qi,one);tt.setMatrixAt(i,mm)});tt.instanceMatrix.needsUpdate=true;tt.frustumCulled=false;g.add(tt)}
 /* the rows' obstacle lines, as before */for(let r=0;r<NR;r++)obs.push({x0:cx0-TL/2-.3,x1:cx0+(NC-1)*13+TL/2+.3,z0:cz0-r*8-1.2,z1:cz0-r*8+1.2});
 /* an inverter behind each row's east end (in the gap before the next row), and a cable tray along the row's back legs to it */for(let r=0;r<NR;r++){const z=cz0-r*8,ix=-44,iz=z+3;B(1.2,1.6,.9,ix,.8,iz,M(0xd8dadc,{roughness:.5}));B(1.26,.06,.96,ix,1.63,iz,M(0x9a9ea4));for(let i=0;i<5;i++)B(.7,.04,.02,ix,.55+i*.16,iz-.46,DK);B(.3,.12,.02,ix+.3,1.35,iz-.46,M(0x20c040,{emissive:0x10a030,emissiveIntensity:.6}));
  const tx0=cx0-TL/2+.5,tx1=ix+.6;B(tx1-tx0,.08,.18,(tx0+tx1)/2,.32,z+.95,DK);B(.18,.08,iz-.45-(z+.95),ix+.5,.32,(z+.95+iz-.45)/2+.0,DK);obs.push({x0:ix-.6,x1:ix+.6,z0:iz-.45,z1:iz+.45})}
 /* the fence with barbed wire, and the gate at the road (x -38, z -1303.5..-1296.5) */{const ch=afCanvas(128,128,(x,w,h)=>{x.clearRect(0,0,w,h);x.strokeStyle='rgba(150,155,160,.95)';x.lineWidth=3;for(let i=-w;i<w*2;i+=16){x.beginPath();x.moveTo(i,0);x.lineTo(i+h,h);x.stroke();x.beginPath();x.moveTo(i,h);x.lineTo(i+h,0);x.stroke()}});ch.wrapS=ch.wrapT=THREE.RepeatWrapping;
  const fence=(ax,az,bx,bz)=>{const l=Math.hypot(bx-ax,bz-az),t=ch.clone();t.needsUpdate=true;t.repeat.set(l/1.2,2/1.2);const m=new THREE.Mesh(new THREE.PlaneGeometry(l,2),new THREE.MeshStandardMaterial({map:t,transparent:true,alphaTest:.35,side:THREE.DoubleSide,roughness:.6,metalness:.3}));m.position.set((ax+bx)/2,1.05,(az+bz)/2);m.rotation.y=-Math.atan2(bz-az,bx-ax);g.add(m);
   const np=Math.max(1,Math.round(l/3));for(let i=0;i<=np;i++){const f=i/np;C(.04,.04,2.5,ax+(bx-ax)*f,1.25,az+(bz-az)*f,STL,null,null,6)}for(const y of[2.1,2.3,2.48])rod([ax,y,az],[bx,y,bz],.012,DK,null,4);rod([ax,2.02,az],[bx,2.02,bz],.022,STL,null,5);obs.push({x0:Math.min(ax,bx)-.1,x1:Math.max(ax,bx)+.1,z0:Math.min(az,bz)-.1,z1:Math.max(az,bz)+.1})};
  const X0=-198,X1=-38,Z0=-1348,Z1=-1263,GZ0=-1303.5,GZ1=-1296.5;fence(X0,Z0,X1,Z0);fence(X0,Z1,X1,Z1);fence(X0,Z0,X0,Z1);fence(X1,Z0,X1,GZ0);fence(X1,GZ1,X1,Z1);
  /* the gate: two leaves swung right open outwards, standing out from the fence along the edges of the road (inside, the panel rows come right up to the fence) */for(const[hz,s]of[[GZ0,1],[GZ1,-1]]){const gp=new THREE.Group();gp.position.set(X1,0,hz);gp.rotation.y=s*Math.PI/2;g.add(gp);const t=ch.clone();t.needsUpdate=true;t.repeat.set(3.5/1.2,1.9/1.2);const lf=new THREE.Mesh(new THREE.PlaneGeometry(3.5,1.9),new THREE.MeshStandardMaterial({map:t,transparent:true,alphaTest:.35,side:THREE.DoubleSide,metalness:.3}));lf.rotation.y=Math.PI/2;lf.position.set(0,1.05,s*1.75);gp.add(lf);for(const y of[.12,2]){const r=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,3.5,6),STL);r.rotation.x=Math.PI/2;r.position.set(0,y,s*1.75);gp.add(r)}const e=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,1.9,6),STL);e.position.set(0,1.05,s*3.5);gp.add(e)}
  for(const z of[GZ0,GZ1])C(.08,.08,2.6,X1,1.3,z,STL,null,null,8)}
 /* the control hut beside the road */const hx=-29,hz=-1292;{const WH=M(0xe8e4dc,{roughness:.85});B(10,3,8,hx,1.5,hz,WH);B(10.4,.2,8.4,hx,3.1,hz,M(0x6a6e74));B(10.5,.25,8.5,hx,.12,hz,M(0xa8a49c,{roughness:.95}));
  /* door and window on the road side (south) */B(1,2.1,.05,hx-2.5,1.3,hz-4.02,M(0x3a5a7a));B(.06,.06,.06,hx-2.1,1.3,hz-4.06,M(0xc0c0c0));B(2,1,.04,hx+1.5,1.8,hz-4.02,M(0x34404a,{roughness:.1}));B(2.1,.08,.12,hx+1.5,1.26,hz-4.06,WH);
  B(1.6,.15,1,hx-2.5,.27,hz-4.6,M(0xa8a49c));L('SOLAR FARM CONTROL\nDO NOT LICK THE PANELS',3,.7,'#d8b020','#1a1a1a',44,hx+1.5,2.65,hz-4.02,Math.PI);
  /* air-con box on the east wall, an aerial and a little solar panel on the roof (of course) */B(.5,.7,1,hx+5.25,1.6,hz+1,M(0xd8dadc));for(let i=0;i<5;i++)B(.02,.5,.85,hx+5.51,1.6,hz+.6+i*.2,DK);rod([hx+4,3.2,hz+3],[hx+4,7,hz+3],.03,STL,null,6);for(const y of[5.2,6.2])rod([hx+3.4,y,hz+3],[hx+4.6,y,hz+3],.012,STL,null,4);
  {const sp=new THREE.Mesh(new THREE.BoxGeometry(2,.05,1.2),[side,side,pm,back,side,side]);sp.position.set(hx-2,3.55,hz+1);sp.rotation.x=TILT;g.add(sp);for(const dz of[-.4,.4])B(.06,.4,.06,hx-2,3.3,hz+1+dz,STL)}
  obs.push({x0:hx-5,x1:hx+5.5,z0:hz-4,z1:hz+4})}
 /* HALT's cleaning cart: a little electric buggy with a water tank and a long brush arm, parked by the hut */{const x=-21.5,z=-1290,cart=new THREE.Group();cart.position.set(x,0,z);cart.rotation.y=-.3;g.add(cart);const add=(geo,m,px,py,pz)=>{const o=new THREE.Mesh(geo,m);o.position.set(px,py,pz);cart.add(o);return o};
  add(new THREE.BoxGeometry(1.3,.4,2.4),M(0xf0f0ec,{roughness:.5}),0,.55,0);for(const[a,b]of[[-.62,-.8],[.62,-.8],[-.62,.8],[.62,.8]]){const w=add(new THREE.CylinderGeometry(.25,.25,.18,12),M(0x1c1c1e)),wr=w;wr.rotation.z=Math.PI/2;wr.position.set(a,.25,b)}
  add(new THREE.BoxGeometry(1.1,.08,.5),M(0x2a2c30),0,.95,-.35);add(new THREE.BoxGeometry(1.1,.5,.08),M(0x2a2c30),0,1.2,-.1);for(const[a,b]of[[-.6,-.95],[.6,-.95],[-.6,.25],[.6,.25]])add(new THREE.CylinderGeometry(.025,.025,1.3,6),STL,a,1.4,b);add(new THREE.BoxGeometry(1.35,.05,1.35),M(0xf0f0ec),0,2.07,-.35);
  const tk=add(new THREE.CylinderGeometry(.42,.42,1,14),M(0x3a8ad0,{roughness:.4,transparent:true,opacity:.85}),0,1.05,.75);tk.rotation.z=Math.PI/2;
  /* the brush arm: bolted to a bracket on the cart's right side, angled up and out, the round brush on its end */{const A=new THREE.Vector3(.7,.95,.8),Bv=new THREE.Vector3(2.3,1.85,.8),d=Bv.clone().sub(A);add(new THREE.BoxGeometry(.14,.3,.3),M(0x3a3c40),.72,.85,.8);const arm=add(new THREE.CylinderGeometry(.04,.04,d.length(),6),M(0xe8c020),0,0,0);arm.position.copy(A).add(Bv).multiplyScalar(.5);arm.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());add(new THREE.BoxGeometry(.1,.12,.36),M(0x3a3c40),Bv.x,Bv.y,Bv.z);const br=add(new THREE.CylinderGeometry(.14,.14,1.2,10),M(0x2a6ac8,{roughness:.9}),Bv.x+.02,Bv.y-.18,Bv.z);br.rotation.x=Math.PI/2}
  const sg=k.lab("HALT'S PANEL CLEANING\nWE TURN THEM ROUND. FREE.",1.2,.4,'#ffffff','#2a6ac8',40);sg.position.set(.66,.62,0);sg.rotation.y=Math.PI/2;cart.add(sg);
  obs.push({x0:x-1,x1:x+1,z0:z-1.4,z1:z+1.4})}
 g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{obs,prop:{x:hx-2.5,z:hz-5.2}}}


/* ---------- r625 wiring: the Speedway ---------- */
const SPG={lights:null,gT:0,flags:null,beacon:null,score:null,scoreDraw:null,boxes:null,crewHome:null,crew:null,jack:null,ps:null,li:-1};
function xpSpeedway(X){const{q,g,ob,loc,anim,prop,zone}=X,cx=300,cz=-1830,RX=110,RZ=38;zone(cx-RX-10,cx+RX+10,cz-RZ-10,cz+RZ+10);
 const obs=o=>{for(const b of o||[])ob(b.x0,b.x1,b.z0,b.z1)},T=(n,f)=>{try{f()}catch(e){conLog('error','speedway ('+n+'): '+e.message)}};
 q.mapR.push({x0:cx-RX,x1:cx+RX,z0:cz-RZ-7,z1:cz+RZ+7,c:'#9a7a50'});q.mapR.push({x0:cx-RX+14,x1:cx+RX-14,z0:cz-RZ+7,z1:cz+RZ-7,c:'#d8b878'});
 let board=null;
 /* batch 1: the track, tyre walls, the wall and catch fence, the pit wall, the start gantry and its lights */T('track',()=>{const t=spTrack(g);obs(t.obs);board=t.board;SPG.lights=t.lights;try{t.lights(0,false)}catch(e){}});
 q.race={cx,cz,RX,RZ,cps:[[cx+RX-RZ+RZ,cz],[cx,cz-RZ],[cx-RX+RZ-RZ,cz],[cx,cz+RZ]],i:-1,t:0,best:SV.xlap||0,bd:board};if(board&&SV.xlap)try{xpRaceBoard(q.race)}catch(e){}
 /* batch 2: the grandstand (flags), race control (beacon), the pits and the pit crew */
 T('stand',()=>{const s=spStand(g);obs(s.obs);SPG.flags=s.flags||[]});T('control',()=>{const c=spControl(g);obs(c.obs);SPG.beacon=c.beacon});
 T('pits',()=>{const p=spPits(g);obs(p.obs);SPG.boxes=p.boxes;SPG.crewHome=p.crewHome;
  SPG.crew=p.crewHome.map((h,i)=>{const c=mkPitCrew();c.position.set(h.x,0,h.z);c.rotation.y=0;c.userData.mv=1;g.add(c);if(i<2){const gun=mkWheelGun();gun.rotation.x=-Math.PI/2;c.userData.parts.grip.add(gun)}return c});
  const j=mkPitJack();j.position.set(p.boxes[1].x+3.2,0,-1778.5);j.rotation.y=Math.PI/2;j.userData.mv=1;g.add(j);SPG.jack=j;
  prop(p.boardAt.x,p.boardAt.z,2.2,'[E] Read the race board',()=>{snd(250,.06);const b=SV.xlap,ps=SV.xpit;hint('🏁 DUSTY GULCH SPEEDWAY. Drive through the start gate to begin a lap; keep to the track. Best lap: '+(b?xpLapFmt(b):'nobody has finished one yet')+'. Under 25 s gets you a badge. Best pit stop: '+(ps?ps.toFixed(1)+' s':'none yet')+' (stop in a pit box and the crew fixes your car).')})});
 /* batch 3: the entrance and car park, the infield (scoreboard), floodlights */
 T('entrance',()=>obs(spEntrance(g).obs));T('infield',()=>{const f=spInfield(g);obs(f.obs);SPG.score=f.score;SPG.scoreDraw=f.scoreDraw;spScoreRefresh()});T('floods',()=>{const f=spFloods(g);obs(f.obs);if(f.lamps)f.lamps.emissiveIntensity=.6});
 anim(cx,cz,260,dt=>{const t=q.rt;if(SPG.flags)SPG.flags.forEach((f,i)=>{f.rotation.y=Math.sin(t*1.7+i)*.25});if(SPG.beacon){const on=q.race&&q.race.i>=0;SPG.beacon.emissiveIntensity=on?((t*2|0)%2?1.4:.2):0}});
 loc('Speedway',cx,cz,'🏁')}
function spScoreRefresh(){try{const s=SPG.score;if(!s||!SPG.scoreDraw)return;const old=s.material.map;s.material.map=SPG.scoreDraw(SV.xlap||0,SV.xpit||0);s.material.needsUpdate=true;if(old&&old.dispose)old.dispose()}catch(e){}}
{const rb0=xpRaceBoard;xpRaceBoard=function(R){const r=rb0.apply(this,arguments);spScoreRefresh();return r}}
/* the lap: the pit lane counts as track; the start lights go green for 1.5 s when a lap starts */
function xpRaceTick(q,dt){const R=q.race;if(!R)return;const s=q.seat;
 if(SPG.lights){if(R.i===0&&SPG.li<0)SPG.gT=1.5;SPG.li=R.i;if(SPG.gT>0){SPG.gT-=dt;try{SPG.lights(0,SPG.gT>0)}catch(e){}}}
 if(!s||s.i!=0||s.v.K.plane||s.v.K.bus){if(R.i>=0){R.i=-1;try{jailHud('')}catch(e){}}return}const v=s.v;
 const inPit=v.x>303&&v.x<400&&v.z>-1786&&v.z<-1776;
 const inT=inPit||(Math.abs(v.x-R.cx)<R.RX+9&&Math.abs(v.z-R.cz)<R.RZ+9&&!(Math.abs(v.x-R.cx)<R.RX-R.RZ&&Math.abs(v.z-R.cz)<R.RZ-8));
 if(R.i<0){if(inT&&!inPit&&Math.abs(v.x-R.cx)<3&&v.z>R.cz+R.RZ-8&&v.x-(R.lx||v.x)>0){R.i=0;R.t=0;snd(900,.1);hint('🏁 LAP STARTED! Clockwise: keep the tyres on your left.')}R.lx=v.x;return}
 R.t+=dt;if(!inT){R.off=(R.off||0)+dt;if(R.off>3){R.i=-1;try{jailHud('')}catch(e){}hint('🏁 Off the track. Lap scrapped.');return}}else R.off=0;
 const cp=R.cps[R.i];if(Math.hypot(v.x-cp[0],v.z-cp[1])<16){R.i++;snd(700+R.i*100,.08);if(R.i>=4){const t=R.t;R.i=-1;try{jailHud('')}catch(e){}const best=!SV.xlap||t<SV.xlap;if(best){SV.xlap=t;try{saveGame()}catch(e){}}hint('🏁 LAP: '+xpLapFmt(t)+(best?' · NEW RECORD!':' · best '+xpLapFmt(SV.xlap)));if(t<25)try{badge('lap')}catch(e){}if(best&&R.bd)xpRaceBoard(R);return}}
 if((R.hT=(R.hT||0)-dt)<=0){R.hT=.1;try{jailHud('🏁 LAP '+xpLapFmt(R.t)+' · checkpoint '+(R.i+1)+'/4')}catch(e){}}}

/* ---------- pit stops: stop in a box and the crew of four repairs the car in about 4 s (local to the driver) ---------- */
{const f0=busRoamUpd;busRoamUpd=function(q,dt){const r=f0.apply(this,arguments);try{spPitTick(q,dt)}catch(e){conLog('error','pit stop: '+e.message);SPG.ps=null}return r}}
const spLerp=(a,b,k)=>a+(b-a)*k,spFace=(dx,dz)=>Math.atan2(-dx,-dz);
function spCrewTo(c,x,z,face,k,t){/* run from where it started (userData.from) towards (x, z); face it when there */const f=c.userData.from||{x:c.position.x,z:c.position.z};const nx=spLerp(f.x,x,k),nz=spLerp(f.z,z,k);if(k<1){c.rotation.y=spFace(x-f.x,z-f.z);c.userData.pose('run',t)}else if(face!=null)c.rotation.y=face;c.position.set(nx,0,nz)}
function spPitTick(q,dt){const C=SPG.crew,B=SPG.boxes;if(!C||!B||!q.roam)return;const t0=q.rt;let S=SPG.ps;const s=q.seat,v=s&&s.i==0?s.v:null;
 if(!S){/* waiting: idle at home; start a stop when the driver halts in a box */C.forEach(c=>c.userData.pose('idle',t0+c.position.x));
  if(v&&!v.K.plane&&!v.K.bus&&!v.K.heli&&!v.K.fly&&!v.wreck&&Math.abs(v.v)<1.4&&!SPG.cool){const b=B.find(b=>Math.abs(v.x-b.x)<3&&Math.abs(v.z-b.z)<2);
   if(b){S=SPG.ps={t:0,v,bx:v.x,bz:v.z,st:'stop'};C.forEach(c=>c.userData.from={x:c.position.x,z:c.position.z});SPG.jack.userData.from={x:SPG.jack.position.x,z:SPG.jack.position.z};snd(600,.08);hint('🔧 PIT STOP! Hold still...')}}
  if(SPG.cool&&(!v||Math.hypot(v.x-SPG.cool.x,v.z-SPG.cool.z)>4))SPG.cool=null;return}
 S.t+=dt;const t=S.t,{bx,bz}=S,J=SPG.jack,car=S.v;
 if(S.st=='stop'){if(!v||v!==car||car.wreck||car.gone){/* the car went away early: everyone goes home */S.st='home';S.t=0;C.forEach(c=>c.userData.from={x:c.position.x,z:c.position.z});J.userData.lift(0);return}
  /* hold the car still until it comes down */if(t<3.8){car.x=bx;car.z=bz;car.v=0}
  const k=Math.min(1,t/.9);spCrewTo(C[0],bx+1.4,bz+1.75,0,k,t);spCrewTo(C[1],bx-1.4,bz+1.75,0,k,t);if(t<3.8)spCrewTo(C[2],bx+4.6,bz,Math.PI/2,k,t);spCrewTo(C[3],bx+.6,bz-1.9,Math.PI,k,t);
  if(t<.9){const jf=J.userData.from;J.position.set(spLerp(jf.x,bx+4.6,k),0,spLerp(jf.z,bz,k))}else if(t<1.1){J.position.set(spLerp(bx+4.6,bx+3.2,(t-.9)/.2),0,bz)}
  let lift=0;if(t>=.9&&t<1.4)lift=(t-.9)/.5;else if(t>=1.4&&t<3.3)lift=1;else if(t>=3.3&&t<3.8)lift=1-(t-3.3)/.5;J.userData.lift(lift);
  if(t>=.9&&t<3.8)C[2].userData.pose('jack',t);if(t>=4.4)C[2].userData.pose('idle',t);
  if(t>=3.8&&t<4.4){J.position.set(bx+3.2,0,spLerp(bz,-1778.5,(t-3.8)/.6));C[2].position.z=J.position.z;C[2].userData.pose('run',t)}
  for(const i of[0,1])if(t>=.9)C[i].userData.pose(t>=1.3&&t<3.3?'gun':'idle',t);if(t>=1.3&&t<3.3&&(S.bz2=(S.bz2||0)-dt)<=0){S.bz2=.18;snd(900+Math.random()*300,.03)}
  if(t>=.9)C[3].userData.pose(t<3.6?'wipe':'go',t);
  if(car&&car.m)car.m.position.y+=lift*.15;
  if(t>=3.8&&!S.done){S.done=1;car.dmg=0;car.adm=0;car.smk=0;const tm=+t.toFixed(1),best=!SV.xpit||tm<SV.xpit;if(best){SV.xpit=tm;try{saveGame()}catch(e){}spScoreRefresh()}snd(1200,.1);hint('🔧 PIT STOP '+tm.toFixed(1)+' s'+(best?' · BEST!':'')+' · GO!')}
  if(S.done&&t>=4.4&&(!v||v!==car||Math.hypot(car.x-bx,car.z-bz)>4)){S.st='home';S.t=0;SPG.cool={x:bx,z:bz};C.forEach(c=>c.userData.from={x:c.position.x,z:c.position.z})}return}
 if(S.st=='home'){const k=Math.min(1,t/.9);C.forEach((c,i)=>{const h=SPG.crewHome[i];spCrewTo(c,h.x,h.z,0,k,t)});if(k>=1){C.forEach(c=>c.userData.from=null);SPG.ps=null}}}

/* ---------- r625 wiring: the wind farm and the solar farm ---------- */
function xpWind(X){const{q,g,ob,loc,sign,anim,zone,prop}=X;zone(-625,-475,-1335,-1195);const obs=o=>{for(const b of o||[])ob(b.x0,b.x1,b.z0,b.z1)};
 try{const F=wfFarm(g);obs(F.obs);const wp=new THREE.Vector3();g.updateMatrixWorld(true);for(const r of F.rotors){r.hub.getWorldPosition(wp);g.worldToLocal(wp);anim(wp.x,wp.z,330,dt=>{r.hub.rotation.z+=dt*r.sp})}
  if(F.beacon)anim(-545,-1250,400,()=>{F.beacon.emissiveIntensity=(q.rt%1.5)<.3?2:.15});
  prop(F.prop.x,F.prop.z,2,'[E] Read the substation sign',()=>{snd(250,.06);hint(['⚡ "DOORS BUT DESERT WIND CO-OP. Powering 13 motel rooms and one jukebox."','⚡ "TURBINE 6 TURNS THE WRONG WAY. WE KNOW. IT IS FINE."','⚡ "DANGER: 11,000 VOLTS. Also snakes."'][(q.wsn=(q.wsn|0)+1)%3])})}catch(e){conLog('error','wind farm: '+e.message)}
 sign('WIND FARM\nMIND THE BLADES','#2a6a3a',-452,-1270,.8);loc('Wind farm',-545,-1260,'🌬️')}
function xpSolar(X){const{q,g,ob,loc,sign,prop,zone}=X;zone(-205,-35,-1345,-1255);const obs=o=>{for(const b of o||[])ob(b.x0,b.x1,b.z0,b.z1)};
 try{const F=sfFarm(g);obs(F.obs);prop(F.prop.x,F.prop.z,2.2,'[E] Read the panel',()=>{snd(250,.06);hint(['☀️ "DOORS BUT DESERT SOLAR. 120 panels. Output: enough for the jukebox."','☀️ "DO NOT LICK THE PANELS." (someone has)','☀️ "PANELS CLEANED WEEKLY BY HALT. He turns them around. We do not know why."'][(q.ssn=(q.ssn|0)+1)%3])})}catch(e){conLog('error','solar farm: '+e.message)}
 q.mapR.push({x0:-195,x1:-40,z0:-1345,z1:-1262,c:'#2a3a6a'});sign('SOLAR FARM\nDO NOT LICK','#d8b020',-44,-1296,-1.2,'#1a1a1a');loc('Solar farm',-120,-1300,'☀️')}
