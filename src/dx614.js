/* =====================================================================================================
   r616: FORT BLACKOUT, REWORKED (docs/design/fort-blackout.md).
   The base had "stuff just shoved into it". Now:
   - Proper roads: Gate Avenue, North Street, Parade Road and Lane, South Street, West Road, an airside lane through the
     north wall, the taxiway and a service road, with kerbs, pavements and lamp posts.
   - The base grows west to x 215: a power plant, water treatment, a solar array, Heliport West (hangar and three pads),
     a fuel point, the PX and gym, a basketball court and the armoury.
   - The runway is part of the base now: a fenced airfield annex with an outer checkpoint, the dragon's teeth as a
     chicane outside it, guard towers, Air Ops, a fuel farm, approach lights and new aircraft shelters and tower.
   - The squad motor pool moves north of North Street (doors in its south wall), the old vehicle canopy moves east,
     the parade ground shrinks to the square between Parade Lane and Gate Avenue, and the command plaza sits between
     HQ and the command wing.
   - Every building has a new outside (the design chat's kit: block skins, roofs, canopies, name boards), plus a new
     wall, gate, flak towers, boot camp, tank park, range, LZ Bravo, hangar cladding, Silo 1 with a round hatch, and
     the radar dome.
   The models below are the design chat's files (docs/design/models/fort-kit.js, fort-north.js, fort-west.js,
   fort-air.js, fort-mid.js), copied in unchanged except where marked "r616". The wiring is at the end; the changes
   to the game's own base code are R patches in build.py ("r616") and small edits in dx549, dx557, dx572, dx598,
   dx602 and dx606.
   ===================================================================================================== */

/* =====================================================================================================
   FORT BLACKOUT KIT (batch 1 of the base remodel). Everything builds into a group g at desert-local x/z, ground y 0.
   The look: sand-coloured concrete block, a darker plinth, olive steel, black-and-yellow hazard paint, white stencils.

     fbDress(g, b, style)   dresses a box building made by milBuild's BLD(x0,x1,z0,z1,h,sd,da,db): new block skin on
                            the outside faces, plinth, windows, door frame, canopy and lamp, drainpipes, and a roof by
                            style: 'hut' (pitched corrugated roof, gable stencils), 'flat' (parapet, roof units),
                            'bunker' (earth berm on three sides, blast-door frame). Outside only: rooms are untouched.
                            b = {x0,x1,z0,z1,h,sd,da,db,name,num} and optionally gaps:[[da,db],..] (several doors on
                            side sd), dh (door height, 2.5), noCanopy, skip:['s',..] (sides left bare), noWin:[..], nameY
     fbWall(g, ax, c, a0, a1, h)   a perimeter wall run: precast panels between pilasters, plinth, coping, razor wire
                            on Y-posts, floodlights. ax 'x' = runs along x at z c; 'z' = along z at x c. Thickness 0.8.
     fbGate(g, x, z)        the main gate on the north wall (gap x-8..x+8): two pylons, the sign beam, two gatehouses,
                            the boom barrier. Returns {arm}: the barrier Group, turned on z by the game (as ML.arm).
     fbCheckpoint(g, x, z)  the airfield's outer checkpoint: a booth and a barrier. Returns {arm}.
     fbFlak(g, x, z)        a flak tower: braced concrete legs, a 6 m platform (top y 12.4, the game puts the gun there),
                            parapet with sandbags, a caged ladder, the warning beacon (returns {beacon}).
     fbGuardTower(g, x, z)  a steel guard tower with a lookout cab and a searchlight.
     fbFence(g, x0, z0, x1, z1, h)   chain-link on posts with razor wire (h >= 2.5) or a low cable barrier (h < 1.5).
     fbRoad(g, x0, z0, x1, z1, w, o)  an axis-aligned road: concrete slabs, lines, kerbs, optional pavement.
                            o = {gaps:[[a,b],..] kerb gaps along the road, pave:'l'|'r'|'both', lamps:true,
                            trim:[t0,t1] where it ends at another road: that road's kerb + pavement depth (0.3, or 1.8 with pavement)}
     fbLamp(g, x, z, ry), fbSignpost(g, x, z, ry, lines), fbBollard(g, x, z)
   ===================================================================================================== */
function fbKit(){if(fbKit.k)return fbKit.k;const k={};
 const FONT='"Barlow Semi Condensed",DoorsSans,Arial,sans-serif';k.FONT=FONT;
 let sd=97531;const rnd=()=>((sd=Math.imul(sd^sd>>>15,sd|1)+0x6d2b79f5|0)>>>0)/4294967296;
 const tex=(w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t};k.tex=tex;
 const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.8,metalness:.05},o||{}));k.M=M;
 const TM=(t,s,o)=>{const m=M(0xffffff,o);m.map=t;m.userData.s=s;return m};
 /* concrete block, 40 x 20 cm, 2 m per tile */
 k.BLOCK=TM(tex(256,256,(x)=>{x.fillStyle='#8f8676';x.fillRect(0,0,256,256);for(let r=0;r<10;r++)for(let c=-1;c<6;c++){const o=r%2?25.6:0,bx=c*51.2+o,by=r*25.6;const v=180+rnd()*22|0;x.fillStyle='rgb('+v+','+(v-8)+','+(v-26)+')';x.fillRect(bx+1.5,by+1.5,48.2,22.6)}
  for(let i=0;i<500;i++){x.fillStyle='rgba(90,80,60,'+(rnd()*.12)+')';x.fillRect(rnd()*256,rnd()*256,1+rnd()*2,1+rnd()*2)}
  for(let i=0;i<6;i++){const gx=rnd()*256;const gr=x.createLinearGradient(0,0,0,256);gr.addColorStop(0,'rgba(80,70,50,.0)');gr.addColorStop(1,'rgba(80,70,50,.12)');x.fillStyle=gr;x.fillRect(gx,0,10+rnd()*20,256)}}),.5,{roughness:.92});
 k.PLINTH=TM(tex(128,128,(x)=>{x.fillStyle='#6e675b';x.fillRect(0,0,128,128);for(let i=0;i<900;i++){x.fillStyle=rnd()<.5?'rgba(40,36,30,.15)':'rgba(200,190,170,.08)';x.fillRect(rnd()*128,rnd()*128,1,1)}}),1,{roughness:.95});
 /* precast wall panels: smooth concrete with form-tie holes */
 k.PRE=TM(tex(256,256,(x)=>{x.fillStyle='#b0a58c';x.fillRect(0,0,256,256);for(let i=0;i<1600;i++){x.fillStyle=rnd()<.5?'rgba(110,100,80,.12)':'rgba(240,230,210,.08)';x.fillRect(rnd()*256,rnd()*256,1+rnd(),1+rnd())}
  x.fillStyle='rgba(70,64,52,.55)';for(let i=0;i<4;i++)for(let j=0;j<4;j++){x.beginPath();x.arc(32+i*64,32+j*64,2.2,0,7);x.fill()}
  for(let i=0;i<5;i++){const gx=rnd()*256;const gr=x.createLinearGradient(0,0,0,256);gr.addColorStop(0,'rgba(90,80,60,.18)');gr.addColorStop(.4,'rgba(90,80,60,0)');x.fillStyle=gr;x.fillRect(gx,0,6+rnd()*16,256)}}),1/3,{roughness:.9});
 k.CAP=M(0xc8bea6,{roughness:.85});
 k.OD=M(0x4e5634,{roughness:.75});k.OD2=M(0x3c4228,{roughness:.8});k.STL=M(0x6a7078,{metalness:.6,roughness:.4});k.STL2=M(0xa8acb2,{metalness:.7,roughness:.3});
 k.DK=M(0x26282b,{roughness:.8});k.WIN=M(0x334a5c,{metalness:.55,roughness:.1});k.WH=M(0xf0ece0,{roughness:.8});k.YL=M(0xe8c020,{roughness:.6});k.RD=M(0xc02020,{roughness:.5});
 k.LIT=M(0xfff4d0,{emissive:0xffe0a0,emissiveIntensity:1});
 k.CORR=TM(tex(64,64,(x)=>{for(let i=0;i<64;i++){const v=Math.sin(i/64*Math.PI*8);const c=Math.round(88+v*18);x.fillStyle='rgb('+(c-6)+','+(c+8)+','+(c-22)+')';x.fillRect(i,0,1,64)}for(let i=0;i<60;i++){x.fillStyle='rgba(120,80,40,'+(rnd()*.2)+')';x.fillRect(rnd()*64,rnd()*64,2,3)}}),2,{roughness:.6,metalness:.35});
 k.HAZ=TM(tex(64,64,(x)=>{for(let i=-64;i<128;i+=32){x.fillStyle='#e8c020';x.beginPath();x.moveTo(i,0);x.lineTo(i+16,0);x.lineTo(i+80,64);x.lineTo(i+64,64);x.fill();x.fillStyle='#1a1a1a';x.beginPath();x.moveTo(i+16,0);x.lineTo(i+32,0);x.lineTo(i+96,64);x.lineTo(i+80,64);x.fill()}}),2.5,{roughness:.6});
 k.SAND=TM(tex(128,128,(x)=>{x.fillStyle='#b39a6e';x.fillRect(0,0,128,128);for(let i=0;i<1400;i++){x.fillStyle=rnd()<.5?'rgba(120,96,60,.2)':'rgba(220,200,160,.15)';x.fillRect(rnd()*128,rnd()*128,1,1)}}),.5,{roughness:1});
 k.EARTH=new THREE.MeshStandardMaterial({color:0xd8ccb8,map:tex(256,256,(x)=>{x.fillStyle='#a88a5c';x.fillRect(0,0,256,256);for(let i=0;i<5000;i++){x.fillStyle=rnd()<.5?'rgba(110,84,50,.22)':'rgba(214,190,150,.16)';x.fillRect(rnd()*256,rnd()*256,1+rnd()*2,1)}for(let i=0;i<40;i++){x.fillStyle='rgba(120,130,80,.25)';x.beginPath();x.arc(rnd()*256,rnd()*256,2+rnd()*4,0,7);x.fill()}for(let i=0;i<25;i++){x.fillStyle='rgba(140,130,115,.6)';x.beginPath();x.ellipse(rnd()*256,rnd()*256,2+rnd()*3,1.5+rnd()*2,rnd()*3,0,7);x.fill()}}),roughness:1});
 k.BAG=TM(tex(64,32,(x)=>{x.fillStyle='#a8946a';x.fillRect(0,0,64,32);x.strokeStyle='rgba(60,50,30,.5)';x.lineWidth=1.5;for(let i=0;i<64;i+=4){x.beginPath();x.moveTo(i,0);x.lineTo(i,32);x.stroke()}}),3,{roughness:1});
 k.ROAD=TM(tex(256,256,(x)=>{x.fillStyle='#8e897e';x.fillRect(0,0,256,256);for(let i=0;i<3000;i++){x.fillStyle=rnd()<.5?'rgba(60,56,48,.14)':'rgba(220,210,190,.08)';x.fillRect(rnd()*256,rnd()*256,1,1)}x.fillStyle='rgba(50,46,40,.6)';x.fillRect(0,0,256,2);x.fillRect(0,0,2,256);
  for(let i=0;i<3;i++){x.strokeStyle='rgba(40,36,30,.35)';x.lineWidth=1;x.beginPath();let px=rnd()*256,py=rnd()*256;x.moveTo(px,py);for(let j=0;j<6;j++){px+=(rnd()-.5)*40;py+=(rnd()-.5)*40;x.lineTo(px,py)}x.stroke()}
  for(let i=0;i<4;i++){x.fillStyle='rgba(30,28,24,.1)';x.beginPath();x.ellipse(rnd()*256,rnd()*256,10+rnd()*20,6+rnd()*10,rnd()*3,0,7);x.fill()}}),1/3.5,{roughness:.95});
 k.PAVE=TM(tex(128,128,(x)=>{x.fillStyle='#b4ab98';x.fillRect(0,0,128,128);x.fillStyle='rgba(80,72,60,.5)';x.fillRect(0,0,128,1.5);x.fillRect(0,0,1.5,128);x.fillRect(0,64,128,1.5);x.fillRect(64,0,1.5,128);for(let i=0;i<600;i++){x.fillStyle='rgba(90,80,64,.12)';x.fillRect(rnd()*128,rnd()*128,1,1)}}),1/1.2,{roughness:.9});
 k.KERB=M(0xc6bfad,{roughness:.85});
 /* the skin on a building sits a few cm in front of the game's own wall; from far away that's too close for the depth
    buffer, so skins get a depth nudge, and the things fixed onto skins (windows, frames, boards, signs) a bigger one */
 const PO2={polygonOffset:true,polygonOffsetFactor:0,polygonOffsetUnits:-8};k.PO2=PO2;const nud=(m,o)=>{const c=m.clone();Object.assign(c,o);c.userData=Object.assign({},m.userData);return c};
 k.SKIN=nud(k.BLOCK,{polygonOffset:true,polygonOffsetFactor:0,polygonOffsetUnits:-4});k.SKINP=nud(k.PLINTH,{polygonOffset:true,polygonOffsetFactor:0,polygonOffsetUnits:-4});
 k.WIN2=nud(k.WIN,PO2);k.OD2b=nud(k.OD2,PO2);k.CAPb=nud(k.CAP,PO2);k.STL2b=nud(k.STL2,PO2);k.DKb=nud(k.DK,PO2);
 k.VENT=TM(tex(64,64,(x)=>{x.fillStyle='#b8bcc0';x.fillRect(0,0,64,64);x.fillStyle='#4a4e54';for(let i=4;i<64;i+=8)x.fillRect(3,i,58,3.5);x.fillStyle='rgba(255,255,255,.25)';for(let i=7;i<64;i+=8)x.fillRect(3,i,58,1)}),2,{metalness:.4,roughness:.45});
 /* painted lines and decals: lifted 1 cm and drawn with a depth offset so they never flicker on the slab */
 /* r616: every depth nudge here is a constant one (polygonOffsetUnits only). A slope factor (polygonOffsetFactor) pulls a big flat
    slab in front of everything standing on it when you look across it at a low angle: the parade ground hid its own podium. */
 /* ground layers are stacked a few cm apart, which is too close for the depth buffer from far away, so each layer
    gets its own depth nudge: slabs on the ground (roads, pads, floors) a little, painted lines more, decals most */
 const PO={polygonOffset:true,polygonOffsetFactor:0,polygonOffsetUnits:-12},POL={polygonOffset:true,polygonOffsetFactor:0,polygonOffsetUnits:-8};k.LINE=M(0xf0ece0,Object.assign({roughness:.8},POL));k.LINEY=M(0xe8c020,Object.assign({roughness:.7},POL));k.PO=PO;k.POL=POL;
 const tierC=new Map();k.tier=(m,t)=>{if(!m||m.polygonOffset)return m;const key=m.uuid+t;if(!tierC.has(key)){const c=m.clone();c.userData=Object.assign({},m.userData);Object.assign(c,t==2?POL:{polygonOffset:true,polygonOffsetFactor:0,polygonOffsetUnits:-4});tierC.set(key,c)}return tierC.get(key)};
 k.LINK=new THREE.MeshStandardMaterial({map:tex(64,64,(x)=>{x.clearRect(0,0,64,64);x.strokeStyle='#c8ccd0';x.lineWidth=2.5;x.beginPath();x.moveTo(0,32);x.lineTo(32,0);x.lineTo(64,32);x.lineTo(32,64);x.closePath();x.stroke();x.beginPath();x.moveTo(0,0);x.lineTo(0,0);x.stroke()}),transparent:false,alphaTest:.4,side:THREE.DoubleSide,metalness:.6,roughness:.4});k.LINK.userData.s=1/.12;
 k.lab=(s,w,h,bg,fg,fs,font)=>{const c=document.createElement('canvas');c.width=512;c.height=Math.max(32,Math.round(512*h/w));const x=c.getContext('2d');if(bg){x.fillStyle=bg;x.fillRect(0,0,c.width,c.height)}x.fillStyle=fg;const lines=String(s).split('\n');let f=fs||60;const F=()=>'bold '+f+'px '+(font||FONT);x.font=F();while((Math.max(...lines.map(l=>x.measureText(l).width))>480||f*lines.length*1.15>c.height*.92)&&f>10){f-=2;x.font=F()}x.textAlign='center';x.textBaseline='middle';lines.forEach((l,i)=>x.fillText(l,256,c.height/2+(i-(lines.length-1)/2)*f*1.15+2));const t=new THREE.CanvasTexture(c);t.anisotropy=4;return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t,transparent:!bg,alphaTest:bg?0:.3,polygonOffset:true,polygonOffsetFactor:0,polygonOffsetUnits:-8}))};
 k.wuv=(ge,s,ox,oy,oz)=>{const p=ge.attributes.position,n=ge.attributes.normal,uv=ge.attributes.uv;if(!uv)return ge;if(ge.type!=='BoxGeometry'){for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*s,uv.getY(i)*s)}else for(let i=0;i<p.count;i++){const ax=Math.abs(n.getX(i)),ay=Math.abs(n.getY(i)),az=Math.abs(n.getZ(i)),X=p.getX(i)+(ox||0),Y=p.getY(i)+(oy||0),Z=p.getZ(i)+(oz||0);let u,v;if(ax>=ay&&ax>=az){u=Z;v=Y}else if(ay>=az){u=X;v=Z}else{u=X;v=Y}uv.setXY(i,u*s,v*s)}uv.needsUpdate=true;return ge};
 k.H=g=>{const add=(o,p)=>{(p||g).add(o);return o},S=m=>m&&m.userData&&m.userData.s;
  const B=(w,h,d,x,y,z,m,p)=>{if(h<=.061&&y-h/2<.25&&w>.3&&d>.3)m=k.tier(m,h<=.012?2:1);const ge=new THREE.BoxGeometry(w,h,d);if(S(m))k.wuv(ge,S(m),x,y,z);const o=new THREE.Mesh(ge,m);o.position.set(x,y,z);return add(o,p)};
  const C=(r1,r2,h,x,y,z,m,ax,p,seg,open)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,seg||12,1,!!open),m);o.position.set(x,y,z);if(ax=='x')o.rotation.z=Math.PI/2;else if(ax=='z')o.rotation.x=Math.PI/2;return add(o,p)};
  const rod=(a,b,r,m,p,seg)=>{const A=new THREE.Vector3(...a),Bv=new THREE.Vector3(...b),d=Bv.clone().sub(A);const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),seg||6),m);o.position.copy(A).add(Bv).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return add(o,p)};
  const poly=pts=>{const s=new THREE.Shape();s.moveTo(pts[0][0],pts[0][1]);for(const q of pts.slice(1))s.lineTo(q[0],q[1]);s.lineTo(pts[0][0],pts[0][1]);return s};
  /* a flat shape in the x-y plane of a group, pushed d along z; placed at (x,y,z) and turned ry */
  const slab=(pts,d,m,x,y,z,ry,p)=>{const ge=new THREE.ExtrudeGeometry(poly(pts),{depth:d,bevelEnabled:false});ge.translate(0,0,-d/2);if(S(m))k.wuv(ge,S(m));const o=new THREE.Mesh(ge,m);o.position.set(x,y,z);o.rotation.y=ry||0;return add(o,p)};
  const tube=(pts,r,m,p,seg)=>add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(q=>new THREE.Vector3(...q))),seg||24,r,6,false),m),p);
  const L=(s,w,h,bg,fg,fs,x,y,z,ry,p,font)=>{const o=k.lab(s,w,h,bg,fg,fs,font);o.position.set(x,y,z);o.rotation.y=ry||0;(p||g).add(o);return o};
  return{add,B,C,rod,slab,L,poly,tube}};
 return fbKit.k=k}

/* ---- dressing a BLD box building ---- */
function fbDress(g,b,style){const k=fbKit(),{B,C,rod,slab,L}=k.H(g),{x0,x1,z0,z1,h,sd,da,db}=b,st=style||'flat';
 const T=.03,O=.005,PL=.6;/* skin thickness, gap off the wall, plinth height */
 const sides={n:{fixed:z0,out:-1,lo:x0,hi:x1,along:'x'},s:{fixed:z1,out:1,lo:x0,hi:x1,along:'x'},w:{fixed:x0,out:-1,lo:z0,hi:z1,along:'z'},e:{fixed:x1,out:1,lo:z0,hi:z1,along:'z'}};
 /* a box on the outside of a side: from a to b along it, y0..y1, standing out from the wall by off..off+th */
 const face=(s,a,bb,y0,y1,off,th,m)=>{const S=sides[s];if(S.along=='x'){if(Math.abs(a-S.lo)<1e-6)a-=off+th;if(Math.abs(bb-S.hi)<1e-6)bb+=off+th}const c=S.fixed+S.out*(off+th/2),len=bb-a,mid=(a+bb)/2;if(len<=.01||y1-y0<=.01)return null;return S.along=='x'?B(len,y1-y0,th,mid,(y0+y1)/2,c,m):B(th,y1-y0,len,c,(y0+y1)/2,mid,m)};
 const ry={n:Math.PI,s:0,w:-Math.PI/2,e:Math.PI/2};/* turns a +z-facing plane to face out of that side */
 const at=(s,u,off)=>{const S=sides[s];return S.along=='x'?[u,S.fixed+S.out*off]:[S.fixed+S.out*off,u]};
 const bunker=st=='bunker';
 const gaps=b.gaps||(sd?[[da,db]]:[]),dh=b.dh||2.5,skip=b.skip||[],near=(s,u,m)=>s==sd&&gaps.some(([a2,b2])=>u>a2-m&&u<b2+m);
 for(const s of['n','s','w','e']){const S=sides[s];const lo=S.lo,hi=S.hi;if(skip.includes(s))continue;
  const runs=[];if(s==sd){let a=lo;for(const[g0,g1]of gaps.slice().sort((p,q)=>p[0]-q[0])){runs.push([a,g0]);a=g1}runs.push([a,hi])}else runs.push([lo,hi]);
  for(const[a,bb]of runs){face(s,a,bb,0,PL,O,T+.05,k.SKINP);face(s,a,bb,PL,h,O,T,k.SKIN)}
  if(s==sd)for(const[da,db]of gaps){face(s,da,db,dh,h,O,T,k.SKIN);/* door frame: steel jambs and head, painted hazard on bunkers */const fm=bunker?k.HAZ:k.OD2;for(const u of[da,db]){S.along=='x'?B(.14,dh,.42,u+(u==da?.07:-.07),dh/2,S.fixed+S.out*.06,fm):B(.42,dh,.14,S.fixed+S.out*.06,dh/2,u+(u==da?.07:-.07),fm)}
   S.along=='x'?B(db-da,.14,.42,(da+db)/2,dh-.07,S.fixed+S.out*.06,fm):B(.42,.14,db-da,S.fixed+S.out*.06,dh-.07,(da+db)/2,fm);
   if(b.noCanopy)continue;
   /* canopy, brackets, a lamp under it, a flush concrete pad */const cw=db-da+1.2,cd=bunker?.6:1.3,cy=dh+.28;const[cx,cz]=at(s,(da+db)/2,cd/2+O+T);S.along=='x'?B(cw,.16,cd,cx,cy,cz,k.CAP):B(cd,.16,cw,cx,cy,cz,k.CAP);
   for(const u of[da-.4,db+.4]){const[a1,b1]=at(s,u,O+T),[a2,b2]=at(s,u,cd-.05);rod([a1,cy-.6,b1],[a2,cy-.08,b2],.03,k.STL)}
   {const[lx,lz]=at(s,(da+db)/2,.35);B(.5,.06,.18,lx,cy-.11,lz,k.LIT).rotation.y=S.along=='x'?0:Math.PI/2}
   {const[px,pz]=at(s,(da+db)/2,.9);const pw=db-da+1.6;S.along=='x'?B(pw,.02,1.8,px,.06,pz,k.PLINTH):B(1.8,.02,pw,px,.06,pz,k.PLINTH)}
   /* the name on a board along the canopy's front edge (one door only) */if(b.name&&gaps.length==1){const nw=Math.min(cw,7),[bx2,bz2]=at(s,(da+db)/2,cd+O+T+.025);S.along=='x'?B(nw+.1,.46,.05,bx2,cy,bz2,k.OD2):B(.05,.46,nw+.1,bx2,cy,bz2,k.OD2);const[nx,nz]=at(s,(da+db)/2,cd+O+T+.057);L(b.name,nw,.38,bunker?'#e8c020':'#20261c',bunker?'#1a1a1a':'#e8f0d0',60,nx,cy,nz,ry[s])}}
  /* several doors: the name on a board high up in the middle of the front */if(s==sd&&b.name&&gaps.length!=1){const nw=Math.min(S.hi-S.lo-2,9),u=(S.lo+S.hi)/2,y=b.nameY||h-.55,[bx2,bz2]=at(s,u,O+T+.025),[nx,nz]=at(s,u,O+T+.057);S.along=='x'?B(nw+.1,.62,.05,bx2,y,bz2,k.OD2b):B(.05,.62,nw+.1,bx2,y,bz2,k.OD2b);L(b.name,nw,.52,'#20261c','#e8d890',70,nx,y,nz,ry[s])}
  /* windows: 1.4 x 1.0 every 4 m, not near the door, not on bunkers */
  if(!bunker&&h>=3&&!(b.noWin||[]).includes(s)&&!skip.includes(s)){const len=S.hi-S.lo,n=Math.floor((len-2)/4);for(let i=0;i<n;i++){const u=S.lo+(len-(n-1)*4)/2+i*4;if(near(s,u,1.6))continue;if(st=='hut'&&s!=sd&&(s=='w'||s=='e'))continue;
    const wy=Math.min(1.75,h-1.0),ww=1.4,wh=1.0,off=O+T;const P=(a,y,w2,h2,m,o2,dd)=>{const[x,z]=at(s,a,off+o2);return S.along=='x'?B(w2,h2,dd,x,y,z,m):B(dd,h2,w2,x,y,z,m)};
    P(u,wy,ww,wh,k.WIN2,.006,.012);P(u,wy+wh/2+.04,ww+.16,.08,k.OD2b,.03,.06);P(u,wy-wh/2-.05,ww+.24,.08,k.CAPb,.06,.12);for(const sx of[-1,1])P(u+sx*(ww/2+.04),wy,.08,wh+.16,k.OD2b,.03,.06);P(u,wy,.04,wh,k.OD2b,.02,.03);
    if(st=='hut'&&s!=sd&&i%2==0){P(u+1.6,.95,.9,.6,k.STL2,.3,.6);P(u+1.6,.95,.7,.45,k.DKb,.605,.01)}/* a wall air conditioner under every other back window */}}
  /* drainpipes at the corners of the long sides */if(!bunker&&!skip.includes(s)&&(st!='hut'||S.along=='x'))for(const u of[S.lo+.25,S.hi-.25]){if(near(s,u,1))continue;const[x,z]=at(s,u,O+T+.07);C(.055,.055,h+.1,x,(h+.1)/2,z,k.OD2,null,null,8)}}
 /* roofs */
 const rx0=x0-.2,rx1=x1+.2,rz0=z0-.2,rz1=z1+.2,top=h+.3;
 if(st=='flat'){const PH=.7,PT=.2;for(const[w,d,x,z]of[[rx1-rx0,PT,(rx0+rx1)/2,rz0+PT/2],[rx1-rx0,PT,(rx0+rx1)/2,rz1-PT/2],[PT,rz1-rz0-2*PT,rx0+PT/2,(rz0+rz1)/2],[PT,rz1-rz0-2*PT,rx1-PT/2,(rz0+rz1)/2]]){B(w,PH,d,x,top+PH/2,z,k.BLOCK);B(w+(d<w?.12:.12),.07,d+.12,x,top+PH+.035,z,k.CAP)}
  /* roof units: an air handler, vents, a ladder hatch */const cx=(x0+x1)/2,cz=(z0+z1)/2;B(2.2,1.1,1.4,cx-(x1-x0)*.2,top+.55,cz,k.STL2);B(1.8,.04,1.0,cx-(x1-x0)*.2,top+1.12,cz,k.DK);for(let i=0;i<3;i++)C(.18,.18,.6,cx+(x1-x0)*.15+i*1.2,top+.3,cz-(z1-z0)*.2,k.STL2,null,null,10);B(1,.25,1,cx+(x1-x0)*.25,top+.12,cz+(z1-z0)*.2,k.OD2)}
 if(st=='hut'){const alongX=x1-x0>=z1-z0,L1=alongX?rx1-rx0+.4:rz1-rz0+.4,half=(alongX?rz1-rz0:rx1-rx0)/2+.3,rise=1.4,ang=Math.atan2(rise,half),sl=Math.hypot(half,rise),cx=(x0+x1)/2,cz=(z0+z1)/2;
  for(const sgn of[-1,1]){const r=B(alongX?L1:.06,.06,alongX?sl:L1,0,0,0,k.CORR);if(alongX){r.geometry.dispose();r.geometry=k.wuv(new THREE.BoxGeometry(L1,.06,sl),2,0,0,0);r.geometry.attributes.uv.needsUpdate=true;r.position.set(cx,top+rise/2+.03,cz+sgn*half/2);r.rotation.x=sgn*ang}else{r.geometry.dispose();r.geometry=k.wuv(new THREE.BoxGeometry(sl,.06,L1),2,0,0,0);r.position.set(cx+sgn*half/2,top+rise/2+.03,cz);r.rotation.z=-sgn*ang}}
  /* ridge cap and gable ends (block triangles) with the hut number stencilled */if(alongX){C(.09,.09,L1,cx,top+rise+.05,cz,k.STL,'x',null,8);for(const ex of[x0,x1]){const tri=slab([[-half+.3,0],[half-.3,0],[0,rise-.05]],.3,k.BLOCK,ex+(ex==x0?.15:-.15),top,cz,Math.PI/2);if(b.num){L(String(b.num),1.4,1.0,null,'#f0ece0',140,ex+(ex==x0?-.006:.006)+(ex==x0?0:0),top+.55,cz,ex==x0?-Math.PI/2:Math.PI/2)}}}
  else{C(.09,.09,L1,cx,top+rise+.05,cz,k.STL,'z',null,8);for(const ez of[z0,z1])slab([[-half+.3,0],[half-.3,0],[0,rise-.05]],.3,k.BLOCK,cx,top,ez+(ez==z0?.15:-.15),0)}
  /* a stencilled number big on the front too */if(b.num){const S=sides[sd];if(S){const u=(S.lo+S.hi)/2+(S.hi-S.lo)*.3,[x,z]=at(sd,u,O+T+.006);L(String(b.num),1.4,1.6,null,'#f0ece0',220,x,1.9,z,ry[sd])}}}
 if(bunker){/* earth berm: one sloped mound round the three sides without the door. Its hips meet at the back corners;
   at the door side it ends in a concrete wing wall in line with the front */const BH=h*.8,BW=h*1.1,G0=O+T+.005;
  const ix0=x0-G0,ix1=x1+G0,iz0=z0-G0,iz1=z1+G0;const ex={n:sd=='n'?0:BW,s:sd=='s'?0:BW,w:sd=='w'?0:BW,e:sd=='e'?0:BW};
  const ox0=ix0-ex.w,ox1=ix1+ex.e,oz0=iz0-ex.n,oz1=iz1+ex.s;
  const top=[[ix0,BH,iz0],[ix1,BH,iz0],[ix1,BH,iz1],[ix0,BH,iz1]],bot=[[ox0,0,oz0],[ox1,0,oz0],[ox1,0,oz1],[ox0,0,oz1]],sideOf=['n','e','s','w'];
  const pos=[],uv=[],pushT=(A,B2,C2)=>{for(const v of[A,B2,C2]){pos.push(...v);uv.push(v[0]*.5+v[1]*.3,v[2]*.5+v[1]*.3)}};
  for(let i=0;i<4;i++){const j=(i+1)%4,s2=sideOf[i];if(s2==sd){/* end caps in the door plane */continue}pushT(top[i],top[j],bot[j]);pushT(top[i],bot[j],bot[i])}
  const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));ge.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));ge.computeVertexNormals();
  const berm=new THREE.Mesh(ge,k.EARTH);g.add(berm);
  /* concrete wing walls closing the two ends on the door side */const S=sides[sd];for(const end of[0,1]){const u=end?S.hi:S.lo,dir=end?1:-1,len=BW+G0;const tri=[[0,0],[len,0],[0,BH+.1]];
   if(S.along=='x'){const w=slab(tri,.3,k.PRE,u+dir*G0,0,S.fixed+S.out*.15,dir>0?0:Math.PI);w.position.x=u+dir*(G0-.0)}else{const w=slab(tri,.3,k.PRE,S.fixed+S.out*.15,0,u+dir*G0,dir>0?-Math.PI/2:Math.PI/2)}}
  /* a row of sandbags along the top of the mound, and along its foot */for(const s2 of['n','s','w','e']){if(s2==sd)continue;const S2=sides[s2];const len=S2.hi-S2.lo,n=Math.floor(len/.9);for(let i=0;i<n;i++){const u=S2.lo+.45+i*.9,[x,z]=at(s2,u,G0+.28),[fx,fz]=at(s2,u,G0+BW+.2);S2.along=='x'?B(.85,.22,.5,x,BH+.06,z,k.BAG):B(.5,.22,.85,x,BH+.06,z,k.BAG);if(i%2==0)S2.along=='x'?B(.85,.25,.5,fx,.125,fz,k.BAG):B(.5,.25,.85,fx,.125,fz,k.BAG)}}
  /* roof: vents and a periscope on the slab, a hazard band round the door side */const cx=(x0+x1)/2,cz=(z0+z1)/2;for(const dx of[-4,4])C(.25,.25,1.2,cx+dx,top+.6,cz,k.STL,null,null,10);C(.06,.06,1.6,cx,top+.8,cz+2,k.STL);B(.3,.2,.2,cx,top+1.6,cz+2,k.DK)}
 return g}

/* ---- the perimeter wall ---- */
function fbWall(g,ax,c,a0,a1,h){const k=fbKit(),{B,C,rod}=k.H(g);h=h||6;const t=.8,len=a1-a0,X=ax=='x';
 const P=(along,y,w,hh,d,m,off)=>{const u=along,o=off||0;return X?B(w,hh,d,u,y,c+o,m):B(d,hh,w,c+o,y,u,m)};
 P((a0+a1)/2,.3,len,.6,t+.2,k.PLINTH);P((a0+a1)/2,.6+(h-.8)/2,len,h-.8,t,k.PRE);P((a0+a1)/2,h-.1,len,.2,t+.15,k.CAP);
 /* pilasters every 6 m, a floodlight on every third */const n=Math.max(1,Math.round(len/6));for(let i=0;i<=n;i++){const u=a0+i*len/n;P(u,(h-.1)/2,.5,h-.1,t+.24,k.PRE);P(u,h+.05,.6,.1,t+.3,k.CAP);
  if(i%3==1){for(const sd of[-1,1]){const o=sd*(t/2+.12+.25);const[x,z]=X?[u,c+sd*(t/2+.12)]:[c+sd*(t/2+.12),u];rod([x,h-.9,z],X?[u,h-.6,c+o]:[c+o,h-.6,u],.03,k.STL);P(u,h-.66,.36,.18,.24,k.DK,o);P(u,h-.76,.3,.03,.18,k.LIT,o)}}}
 /* razor wire: Y-posts and concertina coils */for(let u=a0+1.5;u<a1;u+=3){for(const sd of[-1,1]){const[x,z]=X?[u,c]:[c,u];rod([x,h,z],X?[u,h+.7,c+sd*.35]:[c+sd*.35,h+.7,u],.025,k.STL)}}
 const RZ=k.STL2;for(let u=a0+.6;u<a1;u+=1.2){const r=new THREE.Mesh(new THREE.TorusGeometry(.32,.025,4,12),RZ);const[x,z]=X?[u,c]:[c,u];r.position.set(x,h+.45,z);r.rotation.y=X?Math.PI/2:0;r.rotation.z=(Math.round(u/1.2)%2?.25:-.25);g.add(r)}
 for(const sd of[-1,1]){const[x0,z0]=X?[a0,c+sd*.35]:[c+sd*.35,a0],[x1,z1]=X?[a1,c+sd*.35]:[c+sd*.35,a1];rod([x0,h+.62,z0],[x1,h+.62,z1],.008,k.STL2,null,4)}
 return g}

/* ---- the main gate ---- */
function fbGate(g,x,z){const k=fbKit(),{B,C,rod,L}=k.H(g);
 /* two pylons, the beam with the sign both ways */for(const sd of[-1,1]){const px=x+sd*9.5;B(3,.6,3.4,px,.3,z,k.PLINTH);B(2.6,8,3,px,4.3,z,k.PRE);B(3,.25,3.4,px,8.4,z,k.CAP);for(const zz of[-1.52,1.52])B(.6,6.5,.04,px,3.9,z+zz,k.OD2);
  B(.3,.3,.3,px,8.7,z-1.2,k.DK);B(.25,.05,.25,px,8.86,z-1.2,M_red())}
 B(22,1.6,1.6,x,7.6,z,k.PRE);B(22.4,.2,1.8,x,8.5,z,k.CAP);for(const zz of[-.81,.81]){B(16.2,1.1,.04,x,7.6,z+zz,k.OD2);L(zz<0?'FORT BLACKOUT':'FORT BLACKOUT · 13TH ARMOURED',15.6,.9,'#20261c','#e8d8a0',90,x,7.6,z+zz+Math.sign(zz)*.027,zz<0?Math.PI:0)}
 L('“WE DO NOT ASK TWICE”',8,.5,'#20261c','#e8d8a0',70,x,6.55,z-.837,Math.PI);B(8.2,.62,.04,x,6.55,z-.81,k.OD2);
 /* gatehouses either side, just inside: windows all round, a deep roof, a door to the lane */for(const sd of[-1,1]){const gx=x+sd*12,gz=z+3;B(4,.4,4,gx,.2,gz,k.PLINTH);
  for(const[w,d,ox,oz]of[[4,.25,0,-1.875],[4,.25,0,1.875],[.25,3.5,-1.875,0],[.25,3.5,1.875,0]]){B(w,.7,d,gx+ox,.75,gz+oz,k.BLOCK);B(w,.6,d,gx+ox,3.1,gz+oz,k.BLOCK)}
  for(const[ox,oz,w,d]of[[0,-1.88,3.5,.04],[0,1.88,3.5,.04],[-1.88,0,.04,3.5],[1.88,0,.04,3.5]])B(w,1.7,d,gx+ox,1.95,gz+oz,k.WIN);for(const[ox,oz]of[[-1.875,-1.875],[1.875,-1.875],[-1.875,1.875],[1.875,1.875]])B(.3,2.6,.3,gx+ox,1.7,gz+oz,k.OD2);
  B(4.8,.25,4.8,gx,3.52,gz,k.CAP);B(4.9,.06,4.9,gx,3.66,gz,k.DK);C(.05,.05,1.6,gx+1.5,4.5,gz+1.5,k.STL);B(.7,.5,.5,gx-1,3.9,gz,k.STL2)}
 /* the barrier: a post with a counterweight, the striped arm (the game lifts arm.rotation.z) */const bx=x-7.5,bz=z+8;B(.6,.1,.6,bx,.05,bz,k.DK);B(.4,1.1,.4,bx,.6,bz,k.YL);B(.42,.1,.42,bx,1.18,bz,k.DK);
 const arm=new THREE.Group();arm.position.set(bx,1.25,bz);g.add(arm);const ah=k.H(arm);ah.B(.5,.4,.3,-.4,0,0,k.DK);ah.B(.12,.2,.3,.05,0,0,k.STL);for(let i=0;i<8;i++)ah.B(1.85,.16,.14,1.1+i*1.85,0,0,i%2?k.RD:k.WH);ah.B(.3,.5,.05,14.6,-.2,0,k.STL);
 B(.4,1.08,.4,x+7.8,.54,bz,k.YL);B(.6,.08,.5,x+7.8,1.12,bz,k.DK);/* the rest the arm drops onto */
 return{arm}}
function M_red(){return fbKit().M(0x400000,{emissive:0xff2020,emissiveIntensity:.8})}

/* ---- the airfield's outer checkpoint ---- */
function fbCheckpoint(g,x,z){const k=fbKit(),{B,C,L}=k.H(g);const bx=x+6.5,bz=z;
 B(3,.3,3,bx,.15,bz,k.PLINTH);for(const[w,d,ox,oz]of[[3,.2,0,-1.4],[3,.2,0,1.4],[.2,2.6,-1.4,0],[.2,2.6,1.4,0]])B(w,.9,d,bx+ox,.75,bz+oz,k.BLOCK);for(const[ox,oz,w,d]of[[0,-1.42,2.6,.04],[0,1.42,2.6,.04],[-1.42,0,.04,2.6],[1.42,0,.04,2.6]])B(w,1.3,d,bx+ox,1.85,bz+oz,k.WIN);
 for(const[ox,oz]of[[-1.4,-1.4],[1.4,-1.4],[-1.4,1.4],[1.4,1.4]])B(.2,2.2,.2,bx+ox,1.6,bz+oz,k.OD2);B(3.8,.2,3.8,bx,2.8,bz,k.CAP);B(3.9,.05,3.9,bx,2.93,bz,k.DK);L('CHECKPOINT · STOP',3.2,.4,'#e8c020','#1a1a1a',60,bx,2.8,bz-1.912,Math.PI);
 const ax0=x-7;B(.5,.1,.5,ax0,.05,bz-3,k.DK);B(.36,1.1,.36,ax0,.6,bz-3,k.YL);const arm=new THREE.Group();arm.position.set(ax0,1.25,bz-3);g.add(arm);const ah=k.H(arm);ah.B(.45,.36,.26,-.35,0,0,k.DK);for(let i=0;i<7;i++)ah.B(1.9,.15,.12,1.0+i*1.9,0,0,i%2?k.RD:k.WH);B(.36,.95,.36,x+6.6-1.8,.48,bz-3,k.YL);
 return{arm}}

/* ---- flak tower ---- */
function fbFlak(g,x,z){const k=fbKit(),{B,C,rod}=k.H(g);
 for(const[a,b]of[[-2,-2],[2,-2],[-2,2],[2,2]]){B(.9,.5,.9,x+a,.25,z+b,k.PLINTH);C(.26,.34,11.8,x+a,6.1,z+b,k.PRE,null,null,10)}
 for(const y of[3.5,7.5,11.2]){for(const[a0,b0,a1,b1]of[[-2,-2,2,-2],[-2,2,2,2],[-2,-2,-2,2],[2,-2,2,2]])rod([x+a0,y,z+b0],[x+a1,y,z+b1],.09,k.STL)}
 for(const[y0,y1]of[[3.5,7.5],[7.5,11.2]])for(const[a0,b0,a1,b1]of[[-2,-2,2,-2],[-2,2,2,2],[-2,-2,-2,2],[2,-2,2,2]]){rod([x+a0,y0,z+b0],[x+a1,y1,z+b1],.06,k.STL);rod([x+a1,y0,z+b1],[x+a0,y1,z+b0],.06,k.STL)}
 B(6,.4,6,x,12.2,z,k.PRE);B(6.2,.08,6.2,x,12.0,z,k.CAP);
 for(const sd of[-1,1]){B(6,.8,.25,x,12.8,z+sd*2.88,k.PRE);B(.25,.8,5.5,x+sd*2.88,12.8,z,k.PRE)}
 for(let i=0;i<6;i++)for(const sd of[-1,1]){B(.9,.22,.45,x-2.5+i*1.0,13.31,z+sd*2.88,k.BAG);B(.45,.22,.9,x+sd*2.88,13.31,z-2.5+i*1.0,k.BAG)}
 /* a ladder up the east side, outside the platform, with grab rails over the parapet */const lx=x+3.2,lz=z+1.6;for(const s of[-.22,.22]){rod([lx,.05,lz+s],[lx,13.4,lz+s],.03,k.STL);rod([lx,13.4,lz+s],[x+2.9,13.4,lz+s],.03,k.STL)}for(let y=.4;y<13.2;y+=.35)rod([lx,y,lz-.22],[lx,y,lz+.22],.016,k.STL);for(let y=4;y<12;y+=4)rod([lx,y,lz],[x+2.3,y,lz],.03,k.STL)
 const beacon=new THREE.Mesh(new THREE.SphereGeometry(.2,10,8),M_red());beacon.position.set(x+2.6,13.95,z-2.6);g.add(beacon);C(.04,.04,.6,x+2.6,13.6,z-2.6,k.STL);
 return{beacon}}

/* ---- guard tower ---- */
function fbGuardTower(g,x,z){const k=fbKit(),{B,C,rod,L}=k.H(g);const H=7;
 for(const[a,b]of[[-1.4,-1.4],[1.4,-1.4],[-1.4,1.4],[1.4,1.4]]){B(.6,.3,.6,x+a,.15,z+b,k.PLINTH);rod([x+a,.3,z+b],[x+a*.75,H,z+b*.75],.1,k.OD2,null,8)}
 for(const y of[2.4,4.8])for(const[a0,b0,a1,b1]of[[-1,-1,1,-1],[-1,1,1,1],[-1,-1,-1,1],[1,-1,1,1]]){const f=1.4-(y/H)*.35;rod([x+a0*f,y,z+b0*f],[x+a1*f,y,z+b1*f],.05,k.STL)}
 B(3.4,.2,3.4,x,H+.1,z,k.OD2);for(const[w,d,ox,oz]of[[3.4,.12,0,-1.64],[3.4,.12,0,1.64],[.12,3.2,-1.64,0],[.12,3.2,1.64,0]]){B(w,1.0,d,x+ox,H+.7,z+oz,k.OD)}
 for(const[ox,oz]of[[-1.64,-1.64],[1.64,-1.64],[-1.64,1.64],[1.64,1.64]])B(.14,2.2,.14,x+ox,H+1.3,z+oz,k.OD2);for(const[ox,oz,w,d]of[[0,-1.65,3.2,.03],[0,1.65,3.2,.03],[-1.65,0,.03,3.2],[1.65,0,.03,3.2]])B(w,.9,d,x+ox,H+1.65,z+oz,k.WIN);
 const rf=k.H(g);rf.B(4,.15,4,x,H+2.45,z,k.CORR);B(4.1,.05,4.1,x,H+2.36,z,k.OD2);
 /* searchlight on the roof */C(.05,.05,.4,x+1.2,H+2.7,z-1.2,k.STL);const sl=C(.22,.26,.4,x+1.2,H+3.0,z-1.2,k.DK,'z',null,12);const lens=new THREE.Mesh(new THREE.CircleGeometry(.2,14),k.LIT);lens.position.set(x+1.2,H+3.0,z-1.405);lens.rotation.y=Math.PI;g.add(lens);
 /* ladder */const lx=x,lz=z+1.75;for(const s of[-.22,.22])rod([lx+s,0,lz+.35],[lx+s,H+.2,lz],.03,k.STL);for(let y=.35;y<H;y+=.35){const t=y/H;rod([lx-.22,y,lz+.35*(1-t)],[lx+.22,y,lz+.35*(1-t)],.018,k.STL)}
 return g}

/* ---- fences ---- */
function fbFence(g,x0,z0,x1,z1,h){const k=fbKit(),{B,C,rod}=k.H(g);const len=Math.hypot(x1-x0,z1-z0),dx=(x1-x0)/len,dz=(z1-z0)/len,ang=Math.atan2(-dz,dx);
 const n=Math.max(1,Math.ceil(len/3));for(let i=0;i<=n;i++){const t=i/n,x=x0+(x1-x0)*t,z=z0+(z1-z0)*t;C(.045,.045,h+.05,x,(h+.05)/2,z,k.STL,null,null,6);C(.09,.09,.1,x,.05,z,k.PLINTH,null,null,8);if(h>=2.5){rod([x,h,z],[x-dz*.35,h+.45,z+dx*.35],.02,k.STL)}}
 const mx=(x0+x1)/2,mz=(z0+z1)/2;
 if(h>=1.5){const pl=new THREE.Mesh(new THREE.PlaneGeometry(len,h-.1),k.LINK);{const uv=pl.geometry.attributes.uv,sc=k.LINK.userData.s;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*len*sc,uv.getY(i)*(h-.1)*sc)}pl.position.set(mx,(h-.1)/2+.05,mz);pl.rotation.y=ang;g.add(pl);rod([x0,h-.02,z0],[x1,h-.02,z1],.03,k.STL);rod([x0,.15,z0],[x1,.15,z1],.012,k.STL2,null,4);
  if(h>=2.5){for(const o of[.2,.45])rod([x0-dz*o,h+.15+o*.6,z0+dx*o],[x1-dz*o,h+.15+o*.6,z1+dx*o],.008,k.STL2,null,4);const nc=Math.floor(len/1.2);for(let i=0;i<nc;i++){const t=(i+.5)/nc,x=x0+(x1-x0)*t,z=z0+(z1-z0)*t;const r=new THREE.Mesh(new THREE.TorusGeometry(.22,.018,4,10),k.STL2);r.position.set(x-dz*.3,h+.35,z+dx*.3);r.rotation.y=ang+Math.PI/2;r.rotation.z=i%2?.3:-.3;g.add(r)}}}
 else{for(const y of[h*.45,h*.9])rod([x0,y,z0],[x1,y,z1],.012,k.STL2,null,4);for(let i=0;i<Math.floor(len/6);i++){const t=(i+.5)/Math.floor(len/6),x=x0+(x1-x0)*t,z=z0+(z1-z0)*t;const s=k.lab('⚠ LOW FLYING AIRCRAFT',.9,.25,'#e8c020','#1a1a1a',60);s.position.set(x,h*.68,z);s.rotation.y=ang;g.add(s)}}
 return g}

/* ---- roads ---- */
function fbRoad(g,x0,z0,x1,z1,w,o){const k=fbKit(),{B}=k.H(g);o=o||{};const X=Math.abs(x1-x0)>=Math.abs(z1-z0),a0=X?Math.min(x0,x1):Math.min(z0,z1),a1=X?Math.max(x0,x1):Math.max(z0,z1),c=X?z0:x0,len=a1-a0,mid=(a0+a1)/2;
 const P=(u,y,L,hh,W,m,off)=>X?B(L,hh,W,u,y,c+(off||0),m):B(W,hh,L,c+(off||0),y,u,m);
 P(mid,.065,len,.03,w,k.ROAD);
 if(o.taxi){/* a taxiway or service road: a solid yellow centre line, no kerbs */P(mid,.085,len,.01,.2,k.LINEY,0);return g}
 /* lines: white edge lines, a dashed centre line */ /* kerbs and pavement, with gaps where other roads join */const gaps=o.gaps||[];const runs=[];let a=a0;for(const[g0,g1]of gaps.slice().sort((p,q)=>p[0]-q[0])){if(g0>a)runs.push([a,g0]);a=Math.max(a,g1)}if(a<a1)runs.push([a,a1]);/* where this road ends at another one, stop the kerbs and pavement short of that road's kerb and pavement */const tr=o.trim||[0,0];const runsK=runs.map(([r0,r1])=>[Math.max(r0,a0+tr[0]),Math.min(r1,a1-tr[1])]).filter(([r0,r1])=>r1-r0>.05);
 for(const sd of[-1,1])for(const[r0,r1]of runs)P((r0+r1)/2,.085,r1-r0,.01,.12,k.LINE,sd*(w/2-.3));for(let u=a0+1.5;u<a1-1;u+=6){if(gaps.some(([g0,g1])=>u+3>g0&&u<g1))continue;P(u+1.5,.085,3,.01,.12,k.LINE,0)}
 for(const sd of[-1,1]){const pave=o.pave=='both'||(o.pave=='l'&&sd<0)||(o.pave=='r'&&sd>0);for(const[r0,r1]of runsK){P((r0+r1)/2,.09,r1-r0,.08,.3,k.KERB,sd*(w/2+.15));if(pave)P((r0+r1)/2,.07,r1-r0,.04,1.5,k.PAVE,sd*(w/2+.3+.75))}}
 if(o.lamps){for(let u=a0+8;u<a1-4;u+=25){if(gaps.some(([g0,g1])=>u>g0-3&&u<g1+3))continue;const sd=o.lampSide||1,off=sd*(w/2+.6);fbLamp(g,X?u:c+off,X?c+off:u,X?(sd>0?0:Math.PI):(sd>0?-Math.PI/2:Math.PI/2))}}
 return g}
/* a lamp post; ry turns its arm (0 = the arm reaches towards -z) */
function fbLamp(g,x,z,ry){const k=fbKit(),gr=new THREE.Group();gr.position.set(x,0,z);gr.rotation.y=ry||0;gr.userData.fix=1;g.add(gr);const{B,C}=k.H(gr);
 C(.22,.26,.4,0,.2,0,k.PLINTH,null,null,10);C(.08,.11,7,0,3.9,0,k.STL,null,null,10);C(.04,.04,1.6,0,7.25,-.75,k.STL,'z',null,8);B(.36,.14,.7,0,7.2,-1.55,k.DK);B(.3,.02,.6,0,7.12,-1.55,k.LIT);return gr}
function fbSignpost(g,x,z,ry,lines){const k=fbKit(),gr=new THREE.Group();gr.position.set(x,0,z);gr.rotation.y=ry||0;g.add(gr);const{B,C,L}=k.H(gr);
 C(.06,.06,3.2,0,1.6,0,k.STL,null,null,8);C(.14,.14,.12,0,.06,0,k.PLINTH,null,null,8);
 (lines||[]).forEach((t,i)=>{const y=2.85-i*.42,right=t.trim().endsWith('→'),off=right?.85:-.85;B(1.7,.34,.05,off,y,0,k.OD2);L(t,1.6,.28,'#3c4228','#f0ece0',64,off,y,.031,0,gr);L(t,1.6,.28,'#3c4228','#f0ece0',64,off,y,-.031,Math.PI,gr)});return gr}
function fbBollard(g,x,z){const k=fbKit(),{C}=k.H(g);C(.12,.12,1.0,x,.5,z,k.YL,null,null,10);for(const y of[.3,.7])C(.125,.125,.1,x,y,z,k.DK,null,null,10);C(.13,.13,.06,x,1.02,z,k.DK,null,null,10);return g}

/* =====================================================================================================
   FORT BLACKOUT batch 2: the motor pool and the parade ground. Needs fort-kit.js (fbKit). Desert-local x/z, ground y 0.

     fbMotorPool(g, P)     the squad motor pool shed. P = {x0,x1,z0,z1, doors:[x centres], crewZ}. Steel frame on a
                           concrete plinth, corrugated cladding, a low ridge roof with skylights, four 6 m roller doors
                           in the SOUTH wall, a crew door in the WEST wall. Returns {doors:[{x,m,lt}], obs:[{x0,x1,z0,z1}]}:
                           m is the roller door (4 m tall, 0..4, scaled on y from its top exactly like today's doors),
                           lt is its red/green lamp mesh (own material), obs are the wall boxes to push to q.obs.
     fbCanopy(g, x0,x1,z0,z1)   the open vehicle canopy and workshop: portal frames, a mono-pitch roof, a half-clad
                           back wall, workbenches, a tool wall, tyres, drums. Returns {obs}.
     fbParade(g, x0,x1,z0,z1)   the parade square: concrete slabs, a painted marching grid, the 13th Armoured badge.
     fbFlagpole(g, x, z)   pole, base and halyard. Returns {flag, wave(t)}: flag is the Group the game raises
                           (ML.flag, its y = the flag's top, 2 .. 11.2), wave(t) ripples the cloth.
     fbPodium(g, x, z, ry) the reviewing stand: a stage with steps, a lectern, a canopy, bunting. ry 0 = faces +z.
                           Returns {obs}.
     fbBleachers(g, x0,x1,z0,z1, face)  three-row aluminium bleachers; face 'e' or 'w' (the side the seats look at).
     fbFloodMast(g, x, z, ry)  a 12 m floodlight mast with four lamps aimed along ry.
   ===================================================================================================== */
function fbMotorPool(g,P){const k=fbKit(),{B,C,rod,slab,L}=k.H(g),M=k.M;const{x0,x1,z0,z1}=P,H=5.2,DH=4,t=.3,cx=(x0+x1)/2,cz=(z0+z1)/2,obs=[],OB=(a,b,c,d)=>obs.push({x0:Math.min(a,b),x1:Math.max(a,b),z0:Math.min(c,d),z1:Math.max(c,d)});
 const CL=k.CORR,FR=k.OD2,PL=k.PLINTH;
 /* floor: sealed concrete with painted bays, one per door */B(x1-x0-.2,.04,z1-z0-.2,cx,.07,cz,M(0x6e6c64,{roughness:.6}));
 for(const dx of P.doors){for(const sx of[-3.1,3.1])B(.12,.01,z1-z0-1.4,dx+sx,.095,cz,k.LINEY);B(6.2,.01,.12,dx,.095,z0+1.2,k.LINEY)}
 /* walls: a 1 m concrete plinth, corrugated sheet above, steel columns every 7.5 m */
 const wall=(ax,c,a0,a1,out)=>{if(a1-a0<.05)return;const len=a1-a0,m=(a0+a1)/2;if(ax=='x'){B(len,1,t,m,.5,c,PL);B(len,H-1,.08,m,1+(H-1)/2,c+out*.11,CL);B(len,H-1,.08,m,1+(H-1)/2,c-out*.11,M(0x8e9284,{roughness:.7}));OB(a0,a1,c-t/2,c+t/2)}else{B(t,1,len,c,.5,m,PL);B(.08,H-1,len,c+out*.11,1+(H-1)/2,m,CL);B(.08,H-1,len,c-out*.11,1+(H-1)/2,m,M(0x8e9284,{roughness:.7}));OB(c-t/2,c+t/2,a0,a1)}};
 wall('x',z0,x0,x1,-1);wall('z',x1,z0,z1,1);
 /* west wall with the crew door (1.4 m) */{const a=P.crewZ-.7,b=P.crewZ+.7;wall('z',x0,z0,a,-1);wall('z',x0,b,z1,-1);B(.08,H-2.4,1.4,x0-.11,2.4+(H-2.4)/2,P.crewZ,CL);B(.08,H-2.4,1.4,x0+.11,2.4+(H-2.4)/2,P.crewZ,M(0x8e9284,{roughness:.7}));/* the same two skins as the wall, over the door */for(const u of[a,b])B(.36,2.4,.12,x0,1.2,u,FR);B(.36,.12,1.6,x0,2.42,P.crewZ,FR);
  B(.06,.36,1.3,x0-.2,2.75,P.crewZ,k.OD2);L('CREWS',1.2,.3,'#d8b040','#20261c',60,x0-.236,2.75,P.crewZ,-Math.PI/2);B(.5,.06,.25,x0-.3,2.6,P.crewZ,k.LIT)}
 /* south wall: piers between the four doors, a lintel, the roller doors */const doors=[];{let a=x0;const DW=6;for(const dx of P.doors){const da=dx-DW/2,db=dx+DW/2;wall('x',z1,a,da,1);a=db}wall('x',z1,a,x1,1);
  B(x1-x0,H-DH,.23,cx,DH+(H-DH)/2,z1+.015,PL);B(x1-x0,.4,.48,cx,DH+.18,z1+.11,FR);/* kept inside the wall's sheet faces so nothing lines up with them */
  P.doors.forEach((dx,i)=>{/* the door: a group of slats 4 m tall, centred at y 2 (the game scales it from the top) */const m=new THREE.Group();m.position.set(dx,2,z1+.02);g.add(m);for(let s=0;s<16;s++){const sl=new THREE.Mesh(new THREE.BoxGeometry(5.96,.24,.06),M(s%2?0x9aa0a6:0x8e949a,{metalness:.5,roughness:.4}));sl.position.y=-1.88+s*.25;m.add(sl)}const st=new THREE.Mesh(new THREE.BoxGeometry(5.96,.2,.12),k.YL);st.position.y=-1.9;m.add(st);const hd=new THREE.Mesh(new THREE.BoxGeometry(.4,.06,.06),k.DK);hd.position.set(0,-1.6,.06);m.add(hd);
   B(6.3,.55,.6,dx,DH+.3,z1+.32,k.STL);for(const sx of[-1,1])B(.12,DH,.14,dx+sx*3.06,DH/2,z1+.1,k.DK);/* drum box and guides */
   const lt=new THREE.Mesh(new THREE.BoxGeometry(.3,.3,.18),M(0x200000,{emissive:0xc00000}));lt.position.set(dx+3.4,DH+.2,z1+.3);g.add(lt);B(.36,.36,.1,dx+3.4,DH+.2,z1+.2,k.DK);
   L(String(i+1),.9,.9,null,'#f0ece0',220,dx-2.2,DH+.95,z1+.17,0);doors.push({x:dx,m,lt})})}
 /* the name across the front, the lamps over the doors */B(14,.9,.06,cx,H+.55,z1+.12,k.OD2);L('SQUAD MOTOR POOL',13.6,.8,'#20261c','#e8d890',90,cx,H+.55,z1+.157,0);for(const sx of[-5,5])B(.12,.6,.12,cx+sx,H+.2,z1+.05,k.STL);for(const dx of P.doors){rod([dx,H-.3,z1+.15],[dx,H-.2,z1+.9],.03,k.STL);B(.5,.12,.3,dx,H-.25,z1+.95,k.DK);B(.42,.02,.24,dx,H-.32,z1+.95,k.LIT)}
 /* roof: a shallow ridge along x, skylight strips, gutters and downpipes */const half=(z1-z0)/2+.4,rise=1.1,ang=Math.atan2(rise,half),sl=Math.hypot(half,rise),RL=x1-x0+.6;
 for(const sg of[-1,1]){const r=new THREE.Mesh(k.wuv(new THREE.BoxGeometry(RL,.06,sl),2,0,0,0),CL);r.position.set(cx,H+.6+.03+rise/2-.55,cz+sg*half/2);r.rotation.x=sg*ang;g.add(r);r.position.y=H+rise/2+.03;
  for(let x=x0+3;x<x1-2;x+=6){const s2=new THREE.Mesh(new THREE.BoxGeometry(1.4,.03,sl*.6),M(0xd8e8e0,{roughness:.3,metalness:.1,emissive:0x1a2420}));s2.position.set(x,0,0);s2.position.copy(r.position);s2.position.x=x;s2.position.y+=.045;s2.rotation.x=r.rotation.x;g.add(s2)}
  B(RL,.14,.18,cx,H+.02,cz+sg*(half+.05),k.STL)}
 for(const ex of[x0,x1]){/* gable ends in sheet */slab([[-half,0],[half,0],[0,rise]],.08,CL,ex+(ex==x0?-.11:.11),H,cz,Math.PI/2)}
 for(const[x,z]of[[x0+.3,z0-.15],[x1-.3,z0-.15],[x0+.3,z1+.6]])C(.06,.06,H,x,H/2,z,k.STL,null,null,8);
 C(.09,.09,RL,cx,H+rise+.05,cz,k.STL,'x',null,8);
 /* inside: strip lights on the frame, a fire point */for(const dx of P.doors){B(.3,.08,z1-z0-4,dx,H-.3,cz,k.LIT)}for(let x=x0+7.5;x<x1;x+=7.5){B(.3,H,.3,x,H/2,z0+.3,k.OD2);/* rafters under the roof slope */for(const sg of[-1,1])rod([x,H-.25,cz+sg*((z1-z0)/2-.2)],[x,H+rise-.3,cz],.1,k.OD2,null,4);B(.2,.2,z1-z0-.4,x,H-.25,cz,k.OD2)}
 B(.06,.4,.6,x1-.2,1.4,z0+3,k.RD);L('FIRE POINT',.5,.14,'#c02020','#fff',60,x1-.24,1.75,z0+3,-Math.PI/2);
 return{doors,obs}}

function fbCanopy(g,x0,x1,z0,z1){const k=fbKit(),{B,C,rod,L}=k.H(g),M=k.M;const obs=[],OB=(a,b,c,d)=>obs.push({x0:a,x1:b,z0:c,z1:d});const HF=4.6,HB=5.6,cx=(x0+x1)/2,cz=(z0+z1)/2;
 /* slab and bay lines */B(x1-x0,.04,z1-z0,cx,.07,cz,M(0x7a776e,{roughness:.7}));for(let x=x0+8.3;x<x1-1;x+=8.3)B(.12,.01,z1-z0-2,x,.095,cz,k.LINE);
 /* portal frames: front columns (z1), back columns (z0), a raking rafter */const fx=[x0+.3,cx,x1-.3];for(const x of fx){B(.35,HF,.35,x,HF/2,z1-.3,k.OD2);B(.35,HB,.35,x,HB/2,z0+.3,k.OD2);B(.6,.3,.6,x,.15,z1-.3,k.PLINTH);B(.6,.3,.6,x,.15,z0+.3,k.PLINTH);const r=rod([x,HF+.05,z1-.3],[x,HB+.05,z0+.3],.15,k.OD2,null,4);OB(x-.2,x+.2,z1-.5,z1-.1);OB(x-.2,x+.2,z0+.1,z0+.5)}
 for(const z of[z1-.3,z0+.3])B(x1-x0,.3,.25,cx,(z==z0+.3?HB:HF)-.05,z,k.OD2);
 const rl=Math.hypot(z1-z0,HB-HF),ra=Math.atan2(HB-HF,z1-z0);const roof=new THREE.Mesh(k.wuv(new THREE.BoxGeometry(x1-x0+.8,.06,rl+.8),2,0,0,0),k.CORR);roof.position.set(cx,(HF+HB)/2+.14,cz);roof.rotation.x=ra;g.add(roof);
 /* back wall clad to half height, a tool wall, two workbenches either side of the middle column */B(x1-x0,2.2,.08,cx,1.1,z0+.08,k.CORR);B(x1-x0,.5,.25,cx,.25,z0+.15,k.PLINTH);OB(x0,x1,z0,z0+.3);
 const tb=k.tex(256,128,(x)=>{x.fillStyle='#d8d0b8';x.fillRect(0,0,256,128);x.strokeStyle='#2a2a2a';x.lineWidth=2;for(let i=0;i<14;i++){const tx=12+(i%7)*35,ty=20+(i/7|0)*60;x.strokeRect(tx,ty,24,40);x.fillStyle=['#c02020','#2a2a2a','#e8c020','#4a6a8a'][i%4];x.fillRect(tx+8,ty+4,8,32)}});
 for(const[a,b]of[[x0+1,cx-.6],[cx+.6,x1-1]]){const m=(a+b)/2,w=b-a;B(w,.08,.8,m,.95,z0+.75,M(0x6a5a3a,{roughness:.7}));for(const ex of[a+.2,b-.2])B(.08,.9,.7,ex,.45,z0+.75,k.STL);B(w-.4,.04,.6,m,.3,z0+.75,k.STL);OB(a,b,z0+.3,z0+1.2);
  const tp=new THREE.Mesh(new THREE.PlaneGeometry(Math.min(w-.6,4),1.2),new THREE.MeshStandardMaterial({map:tb,roughness:.8}));tp.position.set(m,2.0,z0+.13);g.add(tp);B(.2,.15,.25,m-w/3,1.07,z0+.7,k.STL);B(.3,.08,.18,m+w/4,1.03,z0+.7,k.RD)}
 /* tyres, oil drums, a jack */for(let i=0;i<4;i++){const r=new THREE.Mesh(new THREE.TorusGeometry(.38,.14,8,16),k.DK);r.rotation.x=Math.PI/2;r.position.set(x1-1.1,.14+i*.28,z0+2.2);g.add(r)}OB(x1-1.6,x1-.6,z0+1.7,z0+2.7);
 for(const[x,z,c]of[[x0+1,z0+2,0x2a5a8a],[x0+1.7,z0+2.1,0xc02020],[x0+1.3,z0+2.8,0x3a4a2a]]){C(.3,.3,.9,x,.45,z,M(c,{metalness:.3,roughness:.5}),null,null,14);C(.31,.31,.04,x,.3,z,k.DK,null,null,14);C(.31,.31,.04,x,.7,z,k.DK,null,null,14)}OB(x0+.6,x0+2.1,z0+1.6,z0+3.2);
 /* the sign on the front fascia, lamps under the beam */B(10.4,.9,.06,cx,HF+.55,z1-.1,k.OD2);L('MOTOR POOL · CORPORALS AND UP · SIGN THE BOOK',10,.8,'#20261c','#e8f0d0',60,cx,HF+.55,z1-.065,0);
 for(let x=x0+4;x<x1-2;x+=8.3)B(.6,.06,.3,x,HF-.25,z1-.6,k.LIT);
 return{obs}}

function fbParade(g,x0,x1,z0,z1){const k=fbKit(),{B}=k.H(g),M=k.M;const cx=(x0+x1)/2,cz=(z0+z1)/2;const sq=k.M(0xffffff,{roughness:.9});sq.map=k.ROAD.map;sq.userData.s=k.ROAD.userData.s;
 B(x1-x0,.03,z1-z0,cx,.065,cz,sq);
 /* the marching grid: dots every 2 m in ranks, a border line, a yellow saluting base line at the north end */for(const[w,d,x,z]of[[x1-x0-1,.15,cx,z0+.5],[x1-x0-1,.15,cx,z1-.5],[.15,z1-z0-1,x0+.5,cz],[.15,z1-z0-1,x1-.5,cz]])B(w,.01,d,x,.085,z,k.LINE);
 B(x1-x0-12,.01,.25,cx,.085,z0+7,k.LINEY);{const DT=k.M(0xd8d4c8,Object.assign({roughness:.9},k.PO));for(let x=x0+8;x<x1-6;x+=4)for(let z=z0+12;z<z1-4;z+=4){if(Math.hypot(x-cx,z-cz-4)<8)continue;B(.3,.01,.3,x,.085,z,DT)}}
 /* the badge: 13TH ARMOURED in a ring with a tank and lightning */const bt=k.tex(512,512,(x)=>{x.clearRect(0,0,512,512);x.fillStyle='rgba(32,38,28,.9)';x.beginPath();x.arc(256,256,250,0,7);x.fill();x.strokeStyle='#e8d890';x.lineWidth=14;x.beginPath();x.arc(256,256,226,0,7);x.stroke();x.lineWidth=5;x.beginPath();x.arc(256,256,160,0,7);x.stroke();
  x.fillStyle='#e8d890';x.font='bold 46px '+k.FONT;x.textAlign='center';const ring=(s,r,a0,dir)=>{const n=s.length;for(let i=0;i<n;i++){const a=a0+dir*(i-(n-1)/2)*.15;x.save();x.translate(256+Math.cos(a)*r,256+Math.sin(a)*r);x.rotate(a+(dir>0?Math.PI/2:-Math.PI/2))/* r616: upright letters both ways round (they read backwards) */;x.fillText(s[i],0,16);x.restore()}};ring('13TH ARMOURED',193,-Math.PI/2,1);ring('FORT BLACKOUT',193,Math.PI/2,-1);
  x.fillRect(176,250,160,46);x.fillRect(206,222,90,30);x.fillRect(296,232,90,10);x.beginPath();x.moveTo(170,300);x.lineTo(342,300);x.lineTo(330,320);x.lineTo(182,320);x.fill();x.fillStyle='#e8c020';x.beginPath();x.moveTo(250,120);x.lineTo(222,200);x.lineTo(252,196);x.lineTo(236,250);x.lineTo(290,170);x.lineTo(260,174);x.lineTo(280,120);x.fill()});
 const bd=new THREE.Mesh(new THREE.PlaneGeometry(14,14),new THREE.MeshStandardMaterial(Object.assign({map:bt,transparent:false,alphaTest:.3,roughness:.9},k.PO)));bd.rotation.x=-Math.PI/2;bd.position.set(cx,.092,cz+4);g.add(bd);
 return g}

function fbFlagpole(g,x,z){const k=fbKit(),{B,C,rod}=k.H(g),M=k.M;
 C(.9,1.0,.3,x,.15,z,k.PLINTH,null,null,16);C(.6,.7,.3,x,.45,z,k.CAP,null,null,16);C(.06,.1,12,x,6.5,z,k.STL2,null,null,12);const ball=new THREE.Mesh(new THREE.SphereGeometry(.13,12,8),k.M(0xd8b060,{metalness:.8,roughness:.3}));ball.position.set(x,12.58,z);g.add(ball);
 rod([x+.08,.9,z],[x+.08,12.4,z],.006,k.WH,null,4);B(.04,.2,.06,x+.1,1.3,z,k.STL);/* halyard and its cleat */
 const flag=new THREE.Group();flag.position.set(x,11.2,z);g.add(flag);const tx=k.tex(256,160,(c)=>{c.fillStyle='#2f6a2a';c.fillRect(0,0,256,160);c.fillStyle='#24521f';c.fillRect(0,0,256,12);c.fillRect(0,148,256,12);
  /* the eye: an almond of white with a dark outline, a green iris, a black pupil and a glint */c.save();c.translate(128,80);c.beginPath();c.moveTo(-70,0);c.quadraticCurveTo(0,-62,70,0);c.quadraticCurveTo(0,62,-70,0);c.closePath();c.fillStyle='#f4f0e2';c.fill();c.lineWidth=7;c.strokeStyle='#12240f';c.stroke();
  c.save();c.clip();c.fillStyle='#8ac040';c.beginPath();c.arc(0,0,27,0,7);c.fill();c.fillStyle='#4a8a2a';c.beginPath();c.arc(0,0,20,0,7);c.fill();c.fillStyle='#0c140a';c.beginPath();c.arc(0,0,12,0,7);c.fill();c.fillStyle='#ffffff';c.beginPath();c.arc(-8,-8,5,0,7);c.fill();c.restore();
  c.strokeStyle='#12240f';c.lineWidth=4;for(const a of[-.9,-.45,0,.45,.9]){c.beginPath();c.moveTo(Math.sin(a)*58,-Math.cos(a)*36);c.lineTo(Math.sin(a)*70,-Math.cos(a)*52);c.stroke()}c.restore()});
 const geo=new THREE.PlaneGeometry(2.4,1.5,12,4);geo.translate(1.2+.08,-.75,0);const base=geo.attributes.position.array.slice();const cloth=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({map:tx,side:THREE.DoubleSide,roughness:.9}));flag.add(cloth);
 const wave=t=>{const p=geo.attributes.position;for(let i=0;i<p.count;i++){const bx=base[i*3],u=Math.max(0,bx-.08)/2.4;p.setZ(i,Math.sin(t*3-u*5)*.18*u);p.setX(i,bx-u*u*.08)}p.needsUpdate=true;geo.computeVertexNormals()};wave(0);
 return{flag,wave}}

function fbPodium(g,x,z,ry){const k=fbKit(),gr=new THREE.Group();gr.position.set(x,0,z);gr.rotation.y=ry||0;gr.userData.fix=1;g.add(gr);const{B,C,rod,L}=k.H(gr),M=k.M;
 /* stage 6 x 3, 1 m high, steps at the back, rails */B(6,1,3,0,.5,0,k.BLOCK);B(6.2,.08,3.2,0,1.04,0,M(0x6a5a3a,{roughness:.7}));for(let i=0;i<3;i++)B(1.6,.33*(i+1),.35,2,.165*(i+1),-1.5-.175-(2-i)*.35,k.CAP);
 for(const sx of[-1,1]){rod([sx*2.95,1.08,-1.45],[sx*2.95,2.0,-1.45],.03,k.STL);rod([sx*2.95,1.08,1.45],[sx*2.95,2.0,1.45],.03,k.STL);rod([sx*2.95,2.0,-1.45],[sx*2.95,2.0,1.45],.03,k.STL)}rod([-2.95,2.0,-1.45],[1.1,2.0,-1.45],.03,k.STL);
 /* bunting on the front: a fascia in the army colours */B(6.1,.7,.04,0,.6,1.52,M(0x20261c));for(let i=0;i<10;i++){const s=new THREE.Mesh(new THREE.CircleGeometry(.22,3),M([0xe8c020,0xc02020,0xf0ece0][i%3],{side:THREE.DoubleSide}));s.position.set(-2.7+i*.6,.78,1.545);s.rotation.z=Math.PI/2*3;gr.add(s)}
 L('13TH ARMOURED · REVIEWING STAND',4.4,.3,null,'#e8d890',60,0,.45,1.545,0,gr);
 /* lectern with a microphone */B(.7,1.1,.5,0,1.63,.9,M(0x4a3a28,{roughness:.6}));B(.8,.05,.6,0,2.2,.88,M(0x6a5a3a)).rotation.x=.25;rod([0,2.22,.75],[0,2.5,.95],.012,k.DK);B(.05,.08,.12,0,2.52,.98,k.DK);
 /* a canopy on four posts */for(const[a,b]of[[-2.9,-1.4],[2.9,-1.4],[-2.9,1.4],[2.9,1.4]])C(.06,.06,2.4,a,2.24,b,k.STL,null,null,8);B(6.3,.1,3.3,0,3.48,0,M(0x3c4228,{roughness:.9}));B(6.4,.3,.05,0,3.33,1.65,M(0x3c4228));
 /* two short flagpoles with furled flags */for(const sx of[-3.6,3.6]){C(.05,.05,4,sx,2,.8,k.STL2,null,null,8);C(.12,.12,1.4,sx,3.0,.8,M(0x2f6a2a),null,null,8);C(.2,.25,.2,sx,.1,.8,k.PLINTH,null,null,10)}
 return{obs:[{x0:-3.1,x1:3.1,z0:-1.6,z1:1.6,local:1}]}}

function fbBleachers(g,x0,x1,z0,z1,face){const k=fbKit(),{B,C,rod}=k.H(g),M=k.M;const AL=M(0xb8bcc2,{metalness:.6,roughness:.35}),d=x1-x0,len=z1-z0,cz=(z0+z1)/2,f=face=='w'?-1:1;
 const xr=r=>face=='w'?x0+.6+r*1.15:x1-.6-r*1.15;/* row r: 0 = front (lowest) */
 for(let r=0;r<3;r++){const x=xr(r),y=.45+r*.45;B(.55,.06,len,x,y,cz,AL);B(.35,.04,len,x+f*.42,y-.22,cz,AL);/* seat and footboard */for(let z=z0+.4;z<z1;z+=2.5){rod([x,0,z],[x,y,z],.035,k.STL);C(.08,.08,.04,x,.02,z,k.DK,null,null,8)}}
 /* back rail */const xb=xr(2)-f*.35;for(let z=z0+.4;z<z1;z+=2.5)rod([xb,1.35,z],[xb,2.3,z],.03,k.STL);rod([xb,2.3,z0+.4],[xb,2.3,z1-.4],.03,k.STL);for(const sz of[z0+.1,z1-.1])for(let r=0;r<3;r++)rod([xr(r),.45+r*.45,sz],[xr(r),.45+r*.45+.5,sz],.025,k.STL);
 return g}

function fbFloodMast(g,x,z,ry){const k=fbKit(),gr=new THREE.Group();gr.position.set(x,0,z);gr.rotation.y=ry||0;gr.userData.fix=1;g.add(gr);const{B,C,rod}=k.H(gr);
 C(.5,.6,.5,0,.25,0,k.PLINTH,null,null,10);C(.14,.2,12,0,6.4,0,k.STL,null,null,10);B(2.6,.15,.15,0,12.2,-.3,k.STL);
 for(const sx of[-1.1,-.37,.37,1.1]){B(.5,.4,.3,sx,12.0,-.5,k.DK);const l=B(.42,.32,.02,sx,11.95,-.66,k.LIT);l.rotation.x=-.35}
 rod([-.12,.6,-.18],[-.12,11.8,-.18],.015,k.STL);rod([.12,.6,-.18],[.12,11.8,-.18],.015,k.STL);for(let y=.8;y<11.6;y+=.4)rod([-.12,y,-.18],[.12,y,-.18],.012,k.STL);
 return gr}

/* =====================================================================================================
   FORT BLACKOUT batch 3: the new west strip (x 215..300). Needs fort-kit.js. Desert-local x/z, ground y 0.
   These buildings have no rooms inside: each is a solid shell with closed doors, dressed by fbDress.

     fbShell(g, b, style)  a closed building: a solid core, roof slab, then fbDress(g, b, style) with a closed door.
                           b as for fbDress plus h. Returns {obs:[footprint]}.
     fbPowerPlant(g)       generator hall (x 225..265, z -924..-898), exhaust stacks, roof radiators, louvres,
                           a fuel day tank behind it, a transformer by the door.
     fbWaterWorks(g)       pump house and two water tanks with pipes (x 270..290, z -924..-898).
     fbSolar(g)            three rows of tilted panels (x 225..290, z -879..-869).
     fbHeliHangar(g)       Heliport West hangar (x 222..250, z -858..-834), arched roof, open east end.
     fbHelipad(g, x, z, name)   a 9 m pad with markings and edge lights. fbWindsock(g, x, z).
     fbFuelPoint(g)        fuel bowser, hose reel and the crew hut (x 228..246, z -826..-818).
     fbPX(g)               PX store and gym (x 222..260, z -772..-746), shop front, awning.
     fbCourt(g)            basketball court (x 266..290, z -770..-748) with two hoops and a low fence.
     fbArmoury(g)          armoury bunker (x 228..268, z -712..-680, earth mound, blast doors) and the open-topped
                           weapons test cell (x 276..290, z -712..-690).
   Each returns {obs:[...]}: boxes to push to q.obs.
   ===================================================================================================== */
function fbShell(g,b,style){const k=fbKit(),{B}=k.H(g);const{x0,x1,z0,z1,h}=b;
 B(x1-x0-.5,h,z1-z0-.5,(x0+x1)/2,h/2,(z0+z1)/2,k.PLINTH);/* the core sits 25 cm inside the skin */B(x1-x0+.4,.3,z1-z0+.4,(x0+x1)/2,h+.15,(z0+z1)/2,k.CAP);
 fbDress(g,b,style);
 /* a closed steel door set in the gap, 5 cm proud of the core */const sd=b.sd,da=b.da,db=b.db,w=db-da,c=(da+db)/2,dm=style=='bunker'?k.STL:k.OD;
 const out={n:[0,-1],s:[0,1],w:[-1,0],e:[1,0]}[sd],face=sd=='n'?z0:sd=='s'?z1:sd=='w'?x0:x1,along=sd=='n'||sd=='s';
 const D=(ww,hh,y,u,off,m)=>along?B(ww,hh,.06,u,y,face+(out[1])*(off),m):B(.06,hh,ww,face+(out[0])*(off),y,u,m);
 if(w<=1.6)D(w-.04,2.4,1.2,c,-.1,dm);else{D(w/2-.03,2.4,1.2,c-w/4,-.1,dm);D(w/2-.03,2.4,1.2,c+w/4,-.1,dm)}/* set back in the frame */
 for(const s2 of(w<=1.6?[0]:[-1,1])){const u=c+s2*w/4+(s2?s2*-.25*w/2:0)*.6;D(.05,.4,1.1,w<=1.6?c+w/2-.2:c+s2*.25,-.04,k.STL2)}
 return{obs:[{x0,x1,z0,z1}]}}

function fbPowerPlant(g){const k=fbKit(),{B,C,rod,L}=k.H(g),M=k.M;const b={x0:225,x1:265,z0:-924,z1:-898,h:7,sd:'s',da:243,db:247,name:'POWER PLANT · DANGER: HIGH VOLTAGE'};const r=fbShell(g,b,'flat');const top=b.h+.3;
 /* exhaust stacks with bands, radiator fan units on the roof */for(const x of[232,245,258]){C(.55,.6,4.2,x,top+2.1,-916,k.STL,null,null,14);for(const y of[1,2.6])C(.62,.62,.12,x,top+y,-916,k.DK,null,null,14);C(.62,.55,.3,x,top+4.3,-916,k.DK,null,null,14);B(1.6,.4,1.6,x,top+.2,-916,k.PLINTH)}
 for(const x of[233,243,253]){B(6,1.2,3,x,top+.6,-905,k.STL2);for(const dx of[-1.5,1.5]){const f=new THREE.Mesh(new THREE.CircleGeometry(1.1,20),k.M(0x2a2c30,Object.assign({roughness:.6},k.PO)));f.rotation.x=-Math.PI/2;f.position.set(x+dx,top+1.21,-905);g.add(f);C(.15,.15,.08,x+dx,top+1.24,-905,k.STL,null,null,8)}}
 /* louvred vents on the long walls */for(const z of[-924,-898])for(const x of[230,240,250,260]){if(z==-898&&x>242&&x<248)continue;const o=z<-910?-1:1;B(2.4,1.6,.06,x,4.6,z+o*.07,k.VENT)}
 /* the fuel day tank on saddles behind the hall, its pipe through the wall */const tz=-927.2;C(1.3,1.3,10,240,1.55,tz,k.M(0xc8c4b4,{metalness:.3,roughness:.5}),'x',null,18);for(const x of[236,244]){B(.5,1.0,2,x,.5,tz,k.PLINTH)}for(const e of[235,245])C(1.3,1.3,.05,e,1.55,tz,k.DK,'x',null,18);
 rod([245.5,1.2,tz],[247,1.2,tz],.08,k.STL);rod([247,1.2,tz],[247,1.2,-924.1],.08,k.STL);L('DIESEL · 20 000 L',4,.5,'#c8c4b4','#2a2a2a',60,240,1.55,tz+1.31,0);B(10.4,.06,.06,240,2.86,tz,k.YL);
 /* a transformer by the door, behind a mesh fence */B(2.4,2,1.6,251.5,1,-895.6,k.M(0x6a7458,{roughness:.6}));for(let i=0;i<6;i++)B(.06,1.6,1.62,250.6+i*.36,1,-895.6,k.OD2);for(const dx of[-.6,0,.6])C(.08,.08,.6,251.5+dx,2.3,-895.6,k.WH,null,null,8);
 fbFence(g,249.8,-894.2,253.2,-894.2,1.8);L('⚡ DANGER',.9,.3,'#e8c020','#1a1a1a',60,251.5,1.2,-894.18,0);
 r.obs.push({x0:234.7,x1:245.3,z0:-928.6,z1:-925.8},{x0:250.2,x1:252.8,z0:-896.4,z1:-894.1});return r}

function fbWaterWorks(g){const k=fbKit(),{B,C,rod,L}=k.H(g),M=k.M;const r=fbShell(g,{x0:272,x1:288,z0:-906,z1:-898,h:3.6,sd:'s',da:279,db:281,name:'WATER TREATMENT'},'flat');
 const TK=M(0xb8c0c4,{metalness:.4,roughness:.45});for(const x of[276,285]){const z=-917;C(4,4,5,x,2.5,z,TK,null,null,28);C(4.1,4.1,.15,x,5.05,z,k.DK,null,null,28);for(const y of[1.2,2.5,3.8])C(4.03,4.03,.08,x,y,z,k.STL,null,null,28);
  C(4.2,4.2,.2,x,.1,z,k.PLINTH,null,null,28);/* railing on top */for(let i=0;i<12;i++){const a=i/12*Math.PI*2;C(.03,.03,1,x+Math.cos(a)*3.9,5.6,z+Math.sin(a)*3.9,k.STL,null,null,4)}const rr=new THREE.Mesh(new THREE.TorusGeometry(3.9,.03,4,40),k.STL);rr.rotation.x=Math.PI/2;rr.position.set(x,6.1,z);g.add(rr);
  /* ladder up the side facing the pump house */for(const s of[-.22,.22])rod([x+s,0,z+4.05],[x+s,6.1,z+4.05],.025,k.STL);for(let y=.3;y<6;y+=.3)rod([x-.22,y,z+4.05],[x+.22,y,z+4.05],.015,k.STL);r.obs.push({x0:x-4.2,x1:x+4.2,z0:z-4.2,z1:z+4.2})}
 /* names painted round the tanks (curved, so nothing stands off the wall) */for(const[x,t,bg]of[[276,'POTABLE WATER','#2a6a8a'],[285,'RAW WATER','#6a5a3a']]){const lm=k.lab(t,4,.6,bg,'#ffffff',60);const cg=new THREE.CylinderGeometry(4.02,4.02,.6,24,1,true,-.5,1.0);const cm=new THREE.Mesh(cg,lm.material);cm.position.set(x,3.2,-917);g.add(cm)}
 /* pipes from the tanks into the pump house, a valve wheel on each */for(const x of[276,285]){rod([x,.6,-913],[x,.6,-906.1],.18,k.M(0x3a6a8a,{metalness:.4}));const vw=new THREE.Mesh(new THREE.TorusGeometry(.3,.04,6,16),k.RD);vw.position.set(x,1.1,-909.5);vw.rotation.x=Math.PI/2;g.add(vw);rod([x,.6,-909.5],[x,1.1,-909.5],.03,k.STL)}
 return r}

function fbSolar(g){const k=fbKit(),{B,C,rod}=k.H(g),M=k.M;const st=k.tex(128,64,(x)=>{x.fillStyle='#1a2a48';x.fillRect(0,0,128,64);x.strokeStyle='#c0c8d8';x.lineWidth=1;for(let i=0;i<=128;i+=16){x.beginPath();x.moveTo(i,0);x.lineTo(i,64);x.stroke()}for(let j=0;j<=64;j+=16){x.beginPath();x.moveTo(0,j);x.lineTo(128,j);x.stroke()}x.fillStyle='rgba(120,160,220,.15)';x.fillRect(0,0,128,10)});
 const PM=M(0xffffff,{map:st,metalness:.5,roughness:.25});PM.map.repeat.set(1,1);
 for(const z of[-877.5,-873.5,-869.8]){const len=63,cx=257.5,ang=.45,pw=2;const p=new THREE.Mesh(new THREE.BoxGeometry(len,.06,pw),PM);const uv=p.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*len/4,uv.getY(i));p.position.set(cx,1.2,z);p.rotation.x=ang;g.add(p);/* tilted to face south (+z) */
  B(len,.08,.08,cx,1.2-Math.sin(ang)*.95,z+Math.cos(ang)*.95,k.STL2);for(let x=cx-len/2+1;x<cx+len/2;x+=4){rod([x,0,z+.8],[x,1.2-Math.sin(ang)*.85+.02,z+.8],.04,k.STL);rod([x,0,z-.8],[x,1.2+Math.sin(ang)*.85-.02,z-.8],.04,k.STL);C(.12,.12,.1,x,.05,z+.8,k.PLINTH,null,null,8);C(.12,.12,.1,x,.05,z-.8,k.PLINTH,null,null,8)}}
 B(1.2,1.6,.8,223.5,.8,-872,k.STL2);/* inverter cabinet */
 return{obs:[{x0:225,x1:290,z0:-879,z1:-869},{x0:222.9,x1:224.1,z0:-872.4,z1:-871.6}]}}

function fbHeliHangar(g){const k=fbKit(),{B,C,rod,L,slab}=k.H(g),M=k.M;const x0=222,x1=250,z0=-858,z1=-834,cz=(z0+z1)/2,R=(z1-z0)/2,WH2=3,sy=.45;
 /* floor and lines */B(x1-x0-.6,.04,z1-z0-.6,(x0+x1)/2+.15,.07,cz,k.M(0x7a786e,{roughness:.6}));/* inside the walls, so its edges don't line up with them */B(x1-x0-2,.01,.15,(x0+x1)/2,.095,cz,k.LINEY);
 /* side walls */for(const z of[z0,z1]){B(x1-x0,WH2,.3,(x0+x1)/2,WH2/2,z+(z==z0?.15:-.15),k.BLOCK)}
 /* the arched roof: a half cylinder, flattened, along x */const roof=new THREE.Mesh(new THREE.CylinderGeometry(R+.15,R+.15,x1-x0+.6,32,1,true,0,Math.PI),k.CORR);roof.geometry.rotateZ(Math.PI/2);{const uv=roof.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*Math.PI*R*.5,uv.getY(i)*(x1-x0)*.08)}roof.scale.set(1,sy,1);roof.position.set((x0+x1)/2,WH2,cz);g.add(roof);
 const inner=new THREE.Mesh(new THREE.CylinderGeometry(R,R,x1-x0+.6,32,1,true,0,Math.PI),k.M(0x6a6e64,{side:THREE.BackSide,roughness:.8}));inner.geometry.rotateZ(Math.PI/2);inner.scale.set(1,sy,1);inner.position.copy(roof.position);g.add(inner);
 /* back (west) wall: a half-ellipse of block on a straight wall */const ell=[];for(let i=0;i<=24;i++){const a=Math.PI*i/24;ell.push([Math.cos(a)*R,WH2+Math.sin(a)*R*sy])}const back=[[R,0],...ell,[-R,0]];slab(back,.3,k.BLOCK,x0+.15,0,cz,Math.PI/2);
 /* east end: an arched header, the two sliding doors pushed aside */const hdr=[];for(let i=0;i<=24;i++){const a=Math.PI*i/24;hdr.push([Math.cos(a)*R,WH2+Math.sin(a)*R*sy])}const hdr2=hdr.slice().reverse().map(([u,v])=>[u*.8,WH2+1.6+(v-WH2)*.72]);slab(hdr.concat(hdr2),.3,k.BLOCK,x1-.15,0,cz,Math.PI/2);
 for(const s of[-1,1]){B(.2,WH2+1.5,4,x1+.25,(WH2+1.5)/2,cz+s*(R-2.4),k.OD);for(let i=0;i<4;i++)B(.06,.08,3.8,x1+.38,.6+i*1.1,cz+s*(R-2.4),k.OD2)}/* ribs on the outside face only */C(.08,.08,z1-z0,x1+.45,WH2+1.6,cz,k.STL,'z',null,8);
 L('HELIPORT WEST',8,.9,'#20261c','#e8f0d0',90,x1+.02,WH2+3.3,cz,Math.PI/2);B(.04,1.0,8.2,x1-.0,WH2+3.3,cz,k.OD2);
 /* inside: a tool rack and parts crates */for(let i=0;i<3;i++)B(1.2,1.0,1.2,x0+2,.5,z0+3+i*1.6,k.M(0x6a5a3a,{roughness:.8}));B(.6,2.4,4,x0+.75,1.2,z1-4,k.STL);
 return{obs:[{x0,x1,z0,z1:z0+.3},{x0,x1,z0:z1-.3,z1},{x0,x1:x0+.3,z0,z1},{x0:x1,x1:x1+.5,z0,z1:z0+4.8},{x0:x1,x1:x1+.5,z0:z1-4.8,z1}]}}

function fbHelipad(g,x,z,name){const k=fbKit(),{B,C,L}=k.H(g),M=k.M;const R=9;
 C(R,R,.06,x,.08,z,k.M(0x8a877e,{roughness:.9}),null,null,48);
 const ring=new THREE.Mesh(new THREE.RingGeometry(R-1.2,R-.6,48),M(0xe8c020,Object.assign({roughness:.7,side:THREE.DoubleSide},k.PO)));ring.rotation.x=-Math.PI/2;ring.position.set(x,.115,z);g.add(ring);
 const h=k.tex(256,256,(c)=>{c.clearRect(0,0,256,256);c.fillStyle='#f0ece0';c.fillRect(64,40,36,176);c.fillRect(156,40,36,176);c.fillRect(64,110,128,36)});const hp=new THREE.Mesh(new THREE.PlaneGeometry(9,9),new THREE.MeshStandardMaterial(Object.assign({map:h,alphaTest:.3,roughness:.8},k.PO)));hp.rotation.x=-Math.PI/2;hp.position.set(x,.116,z);g.add(hp);
 if(name){const n=k.lab(name,3,1.4,null,'#f0ece0',140);n.rotation.x=-Math.PI/2;n.position.set(x,.117,z+R-2.7);n.material.polygonOffset=true;g.add(n)}
 const LM=M(0x40a0ff,{emissive:0x2060ff,emissiveIntensity:.9});for(let i=0;i<16;i++){const a=i/16*Math.PI*2;C(.12,.14,.2,x+Math.cos(a)*(R-.25),.21,z+Math.sin(a)*(R-.25),LM,null,null,8)}
 return{obs:[]}}
function fbWindsock(g,x,z){const k=fbKit(),{C,rod}=k.H(g),M=k.M;C(.3,.35,.3,x,.15,z,k.PLINTH,null,null,10);C(.05,.06,6,x,3.15,z,k.STL,null,null,8);rod([x,6,z],[x+.5,6,z],.03,k.STL);const rim=new THREE.Mesh(new THREE.TorusGeometry(.32,.03,6,16),k.STL);rim.position.set(x+.6,6,z);rim.rotation.y=Math.PI/2;g.add(rim);
 {const st=k.tex(16,64,(c)=>{for(let i=0;i<5;i++){c.fillStyle=i%2?'#f0ece0':'#e86a20';c.fillRect(0,i*12.8,16,12.8)}});const sg=new THREE.CylinderGeometry(.32,.1,2.4,14,1,true);sg.translate(0,-1.2,0);const sock=new THREE.Mesh(sg,new THREE.MeshStandardMaterial({map:st,side:THREE.DoubleSide,roughness:.8}));sock.position.set(x+.6,6,z);sock.rotation.z=Math.PI/2+.22;g.add(sock)}
 return{obs:[{x0:x-.4,x1:x+.4,z0:z-.4,z1:z+.4}]}}

function fbFuelPoint(g){const k=fbKit(),{B,C,rod,L}=k.H(g),M=k.M;const r=fbShell(g,{x0:238,x1:246,z0:-826,z1:-820,h:3,sd:'e',da:-824,db:-822.8,name:'FLIGHT CREW'},'flat');
 /* the bowser: a tank on a two-axle trailer, a hose reel, a drawbar */const bx=232,bz=-821.5;C(1.1,1.1,5,bx,1.75,bz,M(0xd8d2c0,{metalness:.15,roughness:.5}),'x',null,18);for(const e of[229.5,234.5])C(1.12,1.12,.08,e,1.75,bz,k.DK,'x',null,18);B(5.4,.2,1.6,bx,.75,bz,k.DK);
 for(const wx of[230.3,233.7])for(const sz of[-.85,.85]){const w=C(.42,.42,.3,wx,.42,bz+sz,k.DK,'z',null,14);C(.22,.22,.32,wx,.42,bz+sz,k.STL2,'z',null,10)}rod([234.7,.7,bz],[236.4,.5,bz],.06,k.DK);
 const reel=C(.45,.45,.5,231,2.9,bz,k.RD,'z',null,16);C(.12,.12,.6,231,2.9,bz,k.STL,'z',null,8);L('JP-13 · NO FLAMES',3,.6,'#e8c020','#1a1a1a',60,232.6,1.75,bz+1.105,0);
 r.obs.push({x0:229.3,x1:236.5,z0:bz-1.2,z1:bz+1.2});return r}

function fbPX(g){const k=fbKit(),{B,C,rod,L}=k.H(g),M=k.M;const b={x0:222,x1:260,z0:-772,z1:-746,h:4,sd:'e',da:-761,db:-757,name:'PX · BASE EXCHANGE',noWin:['e']};const r=fbShell(g,b,'flat');
 /* the shop front: a band of tall windows with blinds either side of the doors, an awning over it */const bl=k.tex(64,64,(c)=>{c.fillStyle='#c8bc9c';c.fillRect(0,0,64,64);c.fillStyle='#a89c7c';for(let i=0;i<64;i+=5)c.fillRect(0,i,64,1.5)});
 for(const[z0,z1]of[[-770,-762.5],[-755.5,-748]]){B(.05,2.4,z1-z0,260.06,1.65,(z0+z1)/2,M(0xffffff,{map:bl,roughness:.8}));B(.08,2.6,.1,260.08,1.65,z0,k.OD2);B(.08,2.6,.1,260.08,1.65,z1,k.OD2);B(.14,.1,z1-z0+.1,260.1,.4,(z0+z1)/2,k.OD2);for(let z=z0+1.9;z<z1-.5;z+=1.9)B(.07,2.4,.06,260.08,1.65,z,k.OD2)}
 B(2.2,.12,24,261.1,3.05,-759,k.M(0x2f6a2a,{roughness:.8}));for(let z=-770;z<=-748;z+=2.75)B(2.3,.3,.02,261.2,2.85,z,k.M(0xf0ece0));for(const z of[-770.5,-747.5])rod([260.05,3.5,z],[262.1,3.08,z],.04,k.STL);
 L('GYM →',2,.36,'#20261c','#e8f0d0',60,252,3.3,-745.905,0);B(2.1,.46,.05,252,3.3,-745.94,k.OD2);
 /* outside: two vending machines, a bench, a bin */for(const z of[-768.6,-767.4]){B(.8,1.9,1,260.6,.95,z,M(z<-768?0xc02020:0x2a6ad8,{roughness:.5}));B(.02,1.2,.7,261.01,1.15,z,M(0x9ad0e8,{emissive:0x204050}))}
 B(.45,.08,2.2,262,.45,-752,M(0x6a5a3a));for(const z of[-752.9,-751.1])B(.4,.45,.08,262,.22,z,k.STL);B(.5,.1,2.2,262.22,.8,-752,M(0x6a5a3a));C(.3,.28,.9,262,.45,-749.5,k.OD2,null,null,12);
 r.obs.push({x0:260,x1:261.2,z0:-769.2,z1:-766.8});return r}

function fbCourt(g){const k=fbKit(),{B,C,rod,L}=k.H(g),M=k.M;const x0=266,x1=290,z0=-770,z1=-748,cx=(x0+x1)/2,cz=(z0+z1)/2;
 B(x1-x0,.04,z1-z0,cx,.07,cz,M(0x3a6a8a,{roughness:.7}));B(x1-x0-3,.01,z1-z0-3,cx,.095,cz,k.M(0xa0583a,Object.assign({roughness:.7},k.PO)));
 const LN=(w,d,x,z)=>B(w,.01,d,x,.1,z,k.LINE);LN(x1-x0-3,.08,cx,z0+1.5);LN(x1-x0-3,.08,cx,z1-1.5);LN(.08,z1-z0-3,x0+1.5,cz);LN(.08,z1-z0-3,x1-1.5,cz);LN(.08,z1-z0-3,cx,cz);
 const cr=new THREE.Mesh(new THREE.RingGeometry(1.75,1.83,40),k.LINE);cr.rotation.x=-Math.PI/2;cr.position.set(cx,.106,cz);g.add(cr);
 for(const s of[-1,1]){const kx=s<0?x0+1.5:x1-1.5;const key=new THREE.Mesh(new THREE.RingGeometry(5.7,5.78,40,1,s<0?-Math.PI/2:Math.PI/2,Math.PI),k.LINE);key.rotation.x=-Math.PI/2;key.position.set(kx,.106,cz);g.add(key);
  /* hoop: a pole, an arm, the board, the ring and net */const px=s<0?x0+.4:x1-.4;C(.08,.1,3.6,px,1.8,cz,k.STL,null,null,10);C(.25,.3,.15,px,.08,cz,k.PLINTH,null,null,10);rod([px,3.2,cz],[px-s*.9,3.2,cz],.05,k.STL);B(.06,1.05,1.8,px-s*1.0,3.4,cz,k.WH);B(.065,.45,.6,px-s*1.0,3.2,cz,k.M(0xc02020));
  const rim=new THREE.Mesh(new THREE.TorusGeometry(.23,.015,6,20),k.M(0xff6a10,{metalness:.5}));rim.rotation.x=Math.PI/2;rim.position.set(px-s*1.3,3.05,cz);g.add(rim);const net=new THREE.Mesh(new THREE.LatheGeometry([new THREE.Vector2(.23,0),new THREE.Vector2(.15,-.4)],12),k.LINK);net.position.copy(rim.position);g.add(net)}
 fbFence(g,x0,z0,x1,z0,1.6);fbFence(g,x0,z1,x1,z1,1.6);fbFence(g,x1,z0,x1,z1,1.6);fbFence(g,x0,z0,x0,z0+2,1.6);fbFence(g,x0,z0+4.5,x0,z1,1.6);/* a gate at the south-west corner, clear of the hoop */
 return{obs:[{x0,x1,z0:z0-.1,z1:z0+.1},{x0,x1,z0:z1-.1,z1:z1+.1},{x0:x1-.1,x1:x1+.1,z0,z1},{x0:x0-.1,x1:x0+.1,z0,z1:z0+2},{x0:x0-.1,x1:x0+.1,z0:z0+4.5,z1},{x0:x0+.2,x1:x0+.6,z0:cz-.2,z1:cz+.2},{x0:x1-.6,x1:x1-.2,z0:cz-.2,z1:cz+.2}]}}

function fbArmoury(g){const k=fbKit(),{B,C,rod,L}=k.H(g),M=k.M;const b={x0:228,x1:268,z0:-712,z1:-680,h:4.5,sd:'n',da:244,db:252,name:'ARMOURY · TWO-MAN RULE'};const r=fbShell(g,b,'bunker');
 /* blast doors: thick leaves with ribs, over the plain closed door */for(const s of[-1,1]){const x=248+s*2;B(3.96,2.9,.3,x,1.45,-712.2,k.M(0x5a6068,{metalness:.6,roughness:.4}));for(const y of[.4,1.45,2.5])B(3.8,.14,.08,x,y,-712.37,k.STL);for(const dx of[-1.4,0,1.4])B(.14,2.7,.08,x+dx,1.45,-712.37,k.STL)}B(.1,2.9,.36,248,1.45,-712.2,k.HAZ);
 C(.25,.25,.06,251,1.45,-712.42,k.YL,'z',null,12);/* the wheel */L('AUTHORISED PERSONNEL ONLY · DEADLY FORCE',7,.4,'#c02020','#ffffff',60,248,3.65,-712.345,Math.PI);B(7.1,.5,.05,248,3.65,-712.31,k.OD2);
 /* the test cell: open-topped blast walls round a steel table, a bunker slit to watch from, a red lamp */const tx0=276,tx1=290,tz0=-712,tz1=-690,BW=.6,BH=3.2;
 for(const[w,d,x,z]of[[tx1-tx0,BW,(tx0+tx1)/2,tz1-BW/2],[BW,tz1-tz0,tx0+BW/2,(tz0+tz1)/2],[BW,tz1-tz0,tx1-BW/2,(tz0+tz1)/2]]){B(w,BH,d,x,BH/2,z,k.PRE);B(w+.1,.12,d+.1,x,BH+.06,z,k.CAP)}
 B(3,.12,1.6,283,.95,-700,k.STL);for(const[a,c]of[[-1.3,-.6],[1.3,-.6],[-1.3,.6],[1.3,.6]])B(.1,.9,.1,283+a,.45,-700+c,k.STL);B(.4,.4,.4,283,1.21,-700,k.DK);
 for(let i=0;i<6;i++)B(.85,.25,.5,278+i*.9,.125,-693,k.BAG);for(let i=0;i<5;i++)B(.85,.25,.5,278.4+i*.9,.375,-693,k.BAG);
 C(.06,.06,1,tx0+.3,BH+.5,tz0+.3,k.STL);const lamp=new THREE.Mesh(new THREE.SphereGeometry(.18,10,8),M_red());lamp.position.set(tx0+.3,BH+1.05,tz0+.3);g.add(lamp);
 L('TEST CELL · STAY BEHIND THE LINE WHEN THE LAMP IS RED',6,.5,'#e8c020','#1a1a1a',56,(tx0+tx1)/2,1.8,tz1+.007,0);B(6.1,.6,.04,(tx0+tx1)/2,1.8,tz1-.0,k.OD2);
 B(tx1-tx0,.01,.2,(tx0+tx1)/2,.1,tz0-3,k.LINEY);
 r.obs.push({x0:tx0,x1:tx1,z0:tz1-BW,z1:tz1},{x0:tx0,x1:tx0+BW,z0:tz0,z1:tz1},{x0:tx1-BW,x1:tx1,z0:tz0,z1:tz1},{x0:281.5,x1:284.5,z0:-700.8,z1:-699.2});
 /* the mound: 1.1 h out from the S, W and E walls */const m=b.h*1.1;r.obs.push({x0:b.x0-m,x1:b.x0,z0:b.z0,z1:b.z1},{x0:b.x1,x1:b.x1+m,z0:b.z0,z1:b.z1},{x0:b.x0-m,x1:b.x1+m,z0:b.z1,z1:b.z1+m});
 return{obs:r.obs,lamp}}

/* =====================================================================================================
   FORT BLACKOUT batch 4: the airfield annex. Needs fort-kit.js. Desert-local x/z, ground y 0.

     fbShelter(g, x, n)    a hardened aircraft shelter centred on x, open to the north (the runway), back wall at
                           z -935, front at z -957: a thick concrete arch, an earth-covered crown, blast doors
                           folded open, an exhaust port in the back wall, a stencilled number n. Returns {obs}.
     fbTower(g, x, z)      the control tower (4 x 4 m footprint): a concrete shaft with a stair, a cab with sloped
                           glass, a catwalk, antennas. Returns {obs, beacon:[x,y,z]} (where the game's red glow goes).
     fbAirOps(g)           Air Ops (x 305..345, z -962..-936): crew room and briefing, door SOUTH (the north side is
                           3 m from the runway edge), radio mast with dishes, a weather mast. Returns {obs}.
     fbFuelFarm(g)         three vertical fuel tanks in a bund wall, a fill stand with a canopy (x 350..396,
                           z -960..-940). Returns {obs}.
     fbApproachLights(g)   light bars in front of the runway's west end (x 214..234). No obstacles.
   The taxiway and the service road use fbRoad(..., {taxi:true}) from the kit: no kerbs, a yellow centre line.
   ===================================================================================================== */
function fbShelter(g,x,n){const k=fbKit(),{B,C,rod,L,slab}=k.H(g),M=k.M;const zF=-957,zB=-935,D=zB-zF,cz=(zF+zB)/2,R=9,RO=9.8,sy=.62;
 /* the arch: outer and inner skins of a half cylinder along z, flattened */const arch=(r,m,side)=>{const ge=new THREE.CylinderGeometry(r,r,D,28,1,true,-Math.PI/2,Math.PI);ge.rotateX(-Math.PI/2);const uv=ge.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*Math.PI*r/3,uv.getY(i)*D/3);const o=new THREE.Mesh(ge,m);o.scale.set(1,sy,1);o.position.set(x,0,cz);g.add(o);return o};
 const CO=k.PRE.clone();CO.side=THREE.FrontSide;arch(RO,CO);const IN=k.M(0x8a8778,{roughness:.9,side:THREE.BackSide});arch(R,IN);
 /* the front: a deep concrete headwall with the arched mouth cut out of it (sits in front of the arch, so no faces meet),
    and a lip ring at the back that stands proud of the arch inside and out */const W=RO+1.4,HH=RO*sy+1.6,FD=.8,zf=zF-FD/2;
 const mouth=[[-W,0],[-W,HH],[W,HH],[W,0],[R,0]];for(let i=1;i<28;i++){const a=Math.PI*i/28;mouth.push([Math.cos(a)*R,Math.sin(a)*R*sy])}mouth.push([-R,0]);slab(mouth,FD,k.PRE,x,0,zf,0);B(2*W+.2,.2,FD+.2,x,HH+.1,zf,k.CAP);
 const lip=[];for(let i=0;i<=28;i++){const a=Math.PI*i/28;lip.push([Math.cos(a)*(RO+.15),Math.sin(a)*(RO+.15)*sy])}for(let i=28;i>=0;i--){const a=Math.PI*i/28;lip.push([Math.cos(a)*(R-.25),Math.sin(a)*(R-.25)*sy])}slab(lip,.4,k.PRE,x,0,zB-.2,0);
 /* back wall with an exhaust port, a plinth along both sides */const bw=[];for(let i=0;i<=28;i++){const a=Math.PI*i/28;bw.push([Math.cos(a)*R,Math.sin(a)*R*sy])}slab(bw,.6,k.PRE,x,0,zB-.3,0);B(4,2.4,.62,x,3.0,zB-.3,k.DK);for(let i=0;i<5;i++)B(3.8,.08,.66,x,2.0+i*.48,zB-.3,k.STL);
 for(const s of[-1,1])B(.9,.5,D,x+s*(RO-.1),.25,cz,k.PLINTH);
 /* an earth crown on top, the lip of it in sandbags */const crown=new THREE.Mesh(new THREE.CylinderGeometry(RO+.05,RO+.05,D-1,28,1,true,-Math.PI/2*.6,Math.PI*.6),k.EARTH);crown.geometry.rotateX(-Math.PI/2);crown.scale.set(1,sy+.02,1);crown.position.set(x,0,cz);g.add(crown);
 /* door pockets: two buttresses either side of the mouth, where the sliding doors hide, with the number on each and over the mouth */const PW=W-R-.6,PD=2.4,pz=zF-FD-PD/2;for(const sg of[-1,1]){const px=x+sg*(R+.4+PW/2);B(PW,HH-.6,PD+.1,px,(HH-.6)/2,pz+.05,k.PRE);/* 20 cm in from the headwall's ends and sunk 10 cm into it, so no faces line up */B(PW+.15,.15,PD+.15,px,HH-.52,pz,k.CAP);
  L(String(n),1.3,1.3,null,'#f0ece0',200,px,2.4,zF-FD-PD-.007,Math.PI)}
 L('SHELTER '+n,4,.6,'#20261c','#e8f0d0',60,x,HH-.55,zF-FD-.007,Math.PI);B(4.1,.7,.04,x,HH-.55,zF-FD+.005,k.OD2);
 B(2*R+.4,.02,.16,x,.09,zF-FD-.4,k.STL);for(const sg of[-1,1])C(.15,.18,.5,x+sg*(R-.3),.25,zF-FD-1.4,k.YL,null,null,10);
 B(.4,.01,D+10,x,.085,cz-5,k.LINEY);for(const zz of[cz-5,cz+5])B(.4,.08,4,x,R*sy-.3,zz,k.LIT);
 return{obs:[{x0:x-RO-.5,x1:x-R+.4,z0:zF,z1:zB},{x0:x+R-.4,x1:x+RO+.5,z0:zF,z1:zB},{x0:x-RO,x1:x+RO,z0:zB-.6,z1:zB},{x0:x-W,x1:x-R,z0:zF-FD-PD,z1:zF},{x0:x+R,x1:x+W,z0:zF-FD-PD,z1:zF}]}}

function fbTower(g,x,z){const k=fbKit(),{B,C,rod,L}=k.H(g),M=k.M;const H=10;
 B(4.4,.4,4.4,x,.2,z,k.PLINTH);B(4,H,4,x,H/2+.2,z,k.PRE);for(const y of[3.4,6.8])B(4.1,.12,4.1,x,y,z,k.CAP);
 /* a caged ladder up the east face to the catwalk */const lx=x+2.25;for(const s of[-.25,.25])rod([lx,.4,z+s],[lx,H+1.4,z+s],.03,k.STL);for(let y=.7;y<H+.3;y+=.33)rod([lx,y,z-.25],[lx,y,z+.25],.016,k.STL);for(let y=2.6;y<H;y+=1.5){const hp=new THREE.Mesh(new THREE.TorusGeometry(.42,.02,4,12,Math.PI),k.STL);hp.position.set(lx,y,z);hp.rotation.set(Math.PI/2,0,-Math.PI/2);g.add(hp)}
 /* the catwalk and the cab: sloped panes all round, a deep roof */B(6.4,.25,6.4,x,H+.3,z,k.CAP);for(const s of[-1,1]){rod([x-3.1,H+1.4,z+s*3.1],[x+3.1,H+1.4,z+s*3.1],.03,k.STL);rod([x+s*3.1,H+1.4,z-3.1],[x+s*3.1,H+1.4,z+3.1],.03,k.STL)}for(const[a,b]of[[-3.1,-3.1],[3.1,-3.1],[-3.1,3.1],[3.1,3.1]])rod([x+a,H+.4,z+b],[x+a,H+1.4,z+b],.03,k.STL);
 B(5,.8,5,x,H+.85,z,k.PRE);const GLASS=M(0x2a4050,{metalness:.6,roughness:.08,emissive:0x0a1820});
 for(let i=0;i<4;i++){const a=i*Math.PI/2,p=new THREE.Mesh(new THREE.BoxGeometry(5.2,1.8,.08),GLASS);const ox=Math.sin(a)*2.75,oz=Math.cos(a)*2.75;p.position.set(x+ox,H+2.15,z+oz);p.rotation.order='YXZ';p.rotation.y=a;p.rotation.x=-.18;g.add(p);for(const s of[-1,1]){const mul=new THREE.Mesh(new THREE.BoxGeometry(.1,1.85,.12),k.DK);mul.position.set(x+ox+Math.cos(a)*s*.9,H+2.15,z+oz-Math.sin(a)*s*.9);mul.rotation.order='YXZ';mul.rotation.y=a;mul.rotation.x=-.18;g.add(mul)}}
 for(const[a,b]of[[-2.6,-2.6],[2.6,-2.6],[-2.6,2.6],[2.6,2.6]])B(.18,1.9,.18,x+a,H+2.15,z+b,k.DK);B(6,.3,6,x,H+3.2,z,k.CAP);B(6.1,.06,6.1,x,H+3.04,z,k.DK);
 /* antennas, a dish, the beacon mast */C(.05,.05,3,x+2,H+4.85,z,k.STL,null,null,6);rod([x-2,H+3.35,z-1.5],[x-2,H+5.4,z-1.5],.03,k.STL);const d=new THREE.Mesh(new THREE.SphereGeometry(.6,14,8,0,Math.PI*2,0,Math.PI/3),k.M(0xd8dcd8,{side:THREE.DoubleSide,metalness:.3}));d.position.set(x-1.2,H+3.8,z+1.6);d.rotation.x=-1.0;g.add(d);
 /* name over the door */B(.8,2.2,.1,x,1.3,z-2.05,k.OD);L('BLACKOUT TOWER',3.6,.5,'#20261c','#e8f0d0',70,x,2.9,z-2.03,Math.PI);
 return{obs:[{x0:x-2.2,x1:x+3.3,z0:z-2.2,z1:z+2.2}],beacon:[x+2,H+6.5,z]}}

function fbAirOps(g){const k=fbKit(),{B,C,rod,L}=k.H(g),M=k.M;const b={x0:305,x1:345,z0:-962,z1:-936,h:4,sd:'s',da:323,db:327,name:'AIR OPS · BRIEFING · CREW ROOM'};const r=fbShell(g,b,'flat');const top=b.h+.3;
 /* radio mast with dishes on the roof, a weather mast by the door */C(.12,.16,9,312,top+4.5,-955,k.STL,null,null,8);for(const[y,a]of[[top+5,0],[top+6.5,2.1],[top+8,4.2]]){const d=new THREE.Mesh(new THREE.SphereGeometry(.7,14,8,0,Math.PI*2,0,Math.PI/3),k.M(0xe0e0d8,{side:THREE.DoubleSide,metalness:.3}));d.position.set(312+Math.sin(a)*.6,y,-955+Math.cos(a)*.6);d.lookAt(312+Math.sin(a)*3,y,-955+Math.cos(a)*3);d.rotateX(Math.PI/2);g.add(d);rod([312,y,-955],[312+Math.sin(a)*.55,y,-955+Math.cos(a)*.55],.04,k.STL);C(.08,.08,.12,312+Math.sin(a)*.6,y,-955+Math.cos(a)*.6,k.DK,null,null,8)}/* each dish on a short arm */for(const a of[0,2.1,4.2])rod([312,top+.5,-955],[312+Math.sin(a)*3,top,-955+Math.cos(a)*3],.015,k.STL2);
 C(.04,.04,4,331,2,-934,k.STL,null,null,6);C(.15,.15,.12,331,4.05,-934,k.STL2,null,null,10);for(let i=0;i<3;i++){const a=i/3*Math.PI*2;rod([331,4.1,-934],[331+Math.cos(a)*.35,4.1,-934+Math.sin(a)*.35],.012,k.STL);const cup=new THREE.Mesh(new THREE.SphereGeometry(.07,8,6,0,Math.PI*2,0,Math.PI/2),k.STL2);cup.position.set(331+Math.cos(a)*.35,4.1,-934+Math.sin(a)*.35);cup.rotation.z=Math.PI/2;g.add(cup)}
 /* a board by the door with today's flying */B(1.6,1.1,.06,330,1.6,-935.92,k.OD2);L('FLYING TODAY\nRWY 09 · WIND 270/12\nMAJORS AND UP',1.5,1.0,'#1a2016','#d8e8c0',40,330,1.6,-935.885,0);rod([329.3,0,-935.9],[329.3,1.05,-935.9],.03,k.STL);rod([330.7,0,-935.9],[330.7,1.05,-935.9],.03,k.STL);
 r.obs.push({x0:330.8,x1:331.2,z0:-934.2,z1:-933.8});return r}

function fbFuelFarm(g){const k=fbKit(),{B,C,rod,L,tube}=k.H(g),M=k.M;
 /* a pipe run: straight lengths, a ball at each bend, a flange at each free end, a tee sleeve where it meets another pipe
    (ends:[start,end], each 'f' flange, 't' tee along x, or '' none), concrete pedestals with U-clamps under ground runs */
 const pipe=(pts,ends)=>{ends=ends||['f','f'];const dir=(a,b)=>{const d=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]);return d.normalize()};
  for(let i=0;i<pts.length-1;i++){const[a,b]=[pts[i],pts[i+1]];rod(a,b,.12,k.YL,null,12);if(a[1]<.6&&b[1]<.6){const alongX=Math.abs(b[0]-a[0])>.1,len=Math.hypot(b[0]-a[0],b[2]-a[2]);for(let t=1.2;t<len-.6;t+=2.5){const f=t/len,x=a[0]+(b[0]-a[0])*f,z=a[2]+(b[2]-a[2])*f;
    B(alongX?.25:.36,.3,alongX?.36:.25,x,.15,z,k.PLINTH);B(alongX?.3:.42,.03,alongX?.42:.3,x,.315,z,k.STL);const cl=new THREE.Mesh(new THREE.TorusGeometry(.14,.025,6,12,Math.PI),k.STL);cl.position.set(x,.5,z);cl.rotation.y=alongX?Math.PI/2:0;g.add(cl);for(const s of[-1,1]){const pz=alongX?[x,.41,z+s*.14]:[x+s*.14,.41,z];rod([pz[0],.33,pz[2]],[pz[0],.5,pz[2]],.025,k.STL)}}}}
  for(let i=1;i<pts.length-1;i++){const s2=new THREE.Mesh(new THREE.SphereGeometry(.125,12,8),k.YL);s2.position.set(...pts[i]);g.add(s2)}
  [[pts[0],pts[1],ends[0]],[pts[pts.length-1],pts[pts.length-2],ends[1]]].forEach(([e,nb,kind])=>{if(kind=='f'){const d=dir(nb,e);const fl=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,.07,14),k.STL);fl.position.set(e[0],e[1],e[2]);fl.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d);g.add(fl)}else if(kind=='t'){C(.16,.16,.42,e[0],e[1],e[2],k.YL,'x',null,14);for(const s of[-1,1])C(.19,.19,.05,e[0]+s*.2,e[1],e[2],k.STL,'x',null,14)}})};
 const x0=350,x1=396,z0=-960,z1=-940,TK=M(0xd8d4c4,{metalness:.25,roughness:.5});const obs=[];
 /* bund wall, 0.9 m, with a step over it */for(const[w,d,x,z]of[[x1-x0,.3,(x0+x1)/2,z0+.15],[x1-x0,.3,(x0+x1)/2,z1-.15],[.3,z1-z0,x0+.15,(z0+z1)/2],[.3,z1-z0,x1-.15,(z0+z1)/2]]){B(w,.9,d,x,.45,z,k.PRE);B(w+.06,.06,d+.06,x,.93,z,k.CAP)}obs.push({x0,x1,z0,z1:z0+.3},{x0,x1,z0:z1-.3,z1},{x0,x1:x0+.3,z0,z1},{x0:x1-.3,x1,z0,z1});
 B(x1-x0-.6,.03,z1-z0-.6,(x0+x1)/2,.07,(z0+z1)/2,k.PLINTH);
 /* three tanks with ladders, top rails and labels painted round them */[[359,'JP-13'],[373,'JP-13'],[387,'AVGAS']].forEach(([x,t],i)=>{const z=-951;C(3.6,3.6,6.4,x,3.3,z,TK,null,null,28);C(3.65,3.65,.14,x,6.55,z,k.STL2,null,null,28);const RS=3.6/Math.sin(.6),dome=new THREE.Mesh(new THREE.SphereGeometry(RS,24,6,0,Math.PI*2,0,.6),TK);dome.position.set(x,6.5-RS*Math.cos(.6),z);g.add(dome);
  C(3.8,3.8,.2,x,.1,z,k.PLINTH,null,null,28);for(const y of[2,4.2])C(3.62,3.62,.06,x,y,z,k.STL,null,null,28);
  const lm=k.lab(t,4,.8,'#d8d4c4','#c02020',90);const cm=new THREE.Mesh(new THREE.CylinderGeometry(3.62,3.62,.8,24,1,true,-.55,1.1),lm.material);cm.position.set(x,3.6,z);g.add(cm);
  for(const s of[-.22,.22])rod([x+3.65,0,z+s],[x+3.65,6.6,z+s],.025,k.STL);for(let y=.3;y<6.5;y+=.3)rod([x+3.65,y,z-.22],[x+3.65,y,z+.22],.015,k.STL);
  pipe([[x,.5,z+3.55],[x,.5,-942]],['f','t']);{const vw=new THREE.Mesh(new THREE.TorusGeometry(.28,.04,6,16),k.RD);vw.position.set(x,.95,z+4.3);vw.rotation.x=Math.PI/2;g.add(vw);rod([x,.5,z+4.3],[x,.95,z+4.3],.03,k.STL);C(.17,.17,.12,x,.5,z+4.3,k.STL,'z',null,12)}obs.push({x0:x-3.8,x1:x+3.8,z0:z-3.8,z1:z+3.8})});
 /* the manifold along the front, up and over the bund wall, down to the fill stand */pipe([[357,.5,-942],[394.5,.5,-942],[394.5,1.35,-942],[397.6,1.35,-942],[397.6,.5,-942],[399.8,.5,-942],[399.8,.5,-945.85]]);
 const fx=401;B(4,.12,8,fx,4.2,-948,k.CAP);for(const[a,b]of[[-1.8,-3.8],[1.8,-3.8],[-1.8,3.8],[1.8,3.8]])C(.08,.08,4.1,fx+a,2.1,-948+b,k.STL,null,null,8);
 /* the dispenser: a cabinet with a readout, a hose reel on its side, a hose down to the nozzle in its holster */const dx=399.8,dz=-946.2;B(.9,1.6,.7,dx,.8,dz,k.STL2);B(.95,.08,.75,dx,1.64,dz,k.DK);B(.6,.35,.02,dx,1.25,dz-.36,k.M(0x101418,Object.assign({emissive:0x2a6a2a,emissiveIntensity:.4},k.PO2)));B(.95,.12,.75,dx,.06,dz,k.DK);
 C(.32,.32,.25,dx+.6,1.0,dz,k.RD,'x',null,16);C(.1,.1,.32,dx+.6,1.0,dz,k.STL,'x',null,8);B(.04,.3,.06,dx+.47,1.15,dz-.18,k.STL);
 tube([[dx+.73,.75,dz],[dx+.9,.45,dz-.25],[dx+.7,.3,dz-.5],[dx+.3,.55,dz-.42],[dx+.05,.95,dz-.38]],.035,k.DK);B(.12,.22,.1,dx,.95,dz-.38,k.DK);C(.025,.02,.25,dx-.08,.98,dz-.5,k.STL,'z',null,6);
 obs.push({x0:dx-.5,x1:dx+.9,z0:dz-.4,z1:dz+.4});
 L('AVIATION FUEL · NO SMOKING · NO PHONES · EARTH THE AIRCRAFT',8,.5,'#e8c020','#1a1a1a',60,(x0+x1)/2,1.25,z1+.03,0);B(8.1,.6,.04,(x0+x1)/2,1.25,z1-.0,k.OD2);
 return{obs}}

function fbApproachLights(g){const k=fbKit(),{B,C}=k.H(g);const LM=k.M(0xfff4d0,{emissive:0xffe0a0,emissiveIntensity:1});
 for(let i=0;i<5;i++){const x=232-i*4.5,w=6+i*1.2,y=.4+i*.12;B(.12,.12,w,x,y,-980,k.STL);for(let j=0;j<5;j++)C(.12,.14,.18,x,y+.15,-980-w/2+.4+j*(w-.8)/4,LM,null,null,8);C(.06,.06,y,x,y/2,-980,k.STL,null,null,6)}
 return{obs:[]}}

/* =====================================================================================================
   FORT BLACKOUT batch 5: the middle of the base and the restricted zone. Needs fort-kit.js and fort-west.js
   (fbHelipad). Desert-local x/z, ground y 0. Everything here dresses or replaces the LOOKS of things the game already
   builds; positions, obstacles, plates, props and moving parts stay the game's own unless a note says otherwise.

     fbHQ(g)            HQ (BLD 320..400, -880..-840, h 4.2, door east -862..-858): dressed, plus a portico with
                        columns, steps, two flagpoles and a brass plate.
     fbCmdBlock(g)      the command wing (CWB) and the Wraith bays (WBAY) from outside: block skin, the office doors,
                        a name board, the bay fronts round the roller doors. The 1 m gap between them (airlocks) is
                        left bare.
     fbBootCamp(g)      the obstacle course visuals at the same spots: dirt lane with timber edging, the wire crawl,
                        tyres, the climbing wall with its platform and steps, the log beam over a mud pit, start and
                        finish posts.
     fbFuelDepot(g)     the three fuel tanks by the ammo bunker (x 372/383/394, z -782, r 4, h 5) on a bund.
     fbTent(g, x, z)    a 6 x 4.4 m canvas tent (replaces mkTent's look).
     fbTankPark(g)      shade canopies with camouflage netting over both rows, bay lines, wheel stops, a sign.
     fbRange(g)         the target berm (x 592..598, z -800..-730) as an earth bank with a sandbag face, and the
                        firing-line posts.
     fbLZ(g)            LZ Bravo's pad (r 10) and the three mortar pits (x 572/582/592, z -822).
     fbHangarSkin(g)    Hangar 1 from outside: clad walls, a barrel roof over the flat one, the door frame and rails.
     fbSilo(g)          Silo 1, rebuilt: a round raised collar, the launch tube's mouth, and a round armoured hatch on a
                        hinge with two rams that swings open (returns {hatch}: the game moves it as before).
     fbRadome(g)        Radar Station 13: a drum and a panelled radome (replaces the plain sphere and drum).
   ===================================================================================================== */
function fbHQ(g){const k=fbKit(),{B,C,rod,L}=k.H(g),M=k.M;fbDress(g,{x0:320,x1:400,z0:-880,z1:-840,h:4.2,sd:'e',da:-862,db:-858,noCanopy:true},'flat');
 /* the portico: a raised step, four columns, a deep flat canopy with the name, two flagpoles */const px=400.035,pz=-860;B(3.2,.15,9,px+1.6,.075,pz,k.PLINTH);B(1.4,.15,7,px+.7,.225,pz,k.CAP);
 for(const dz of[-3.6,-1.6,1.6,3.6]){C(.25,.28,4.2,px+2.9,2.25,pz+dz,k.CAP,null,null,14);B(.65,.15,.65,px+2.9,.22,pz+dz,k.PLINTH);B(.65,.15,.65,px+2.9,4.35,pz+dz,k.PLINTH)}
 B(3.4,.4,9.4,px+1.7,4.6,pz,k.PRE);B(3.5,.08,9.5,px+1.7,4.83,pz,k.CAP);B(.05,.6,8.6,px+3.43,4.6,pz,k.OD2);L('HEADQUARTERS · 13TH ARMOURED',8.4,.5,'#20261c','#e8d890',70,px+3.47,4.6,pz,Math.PI/2);
 for(const dz of[-2,0,2])B(.5,.06,.2,px+1.7,4.38,pz+dz,k.LIT);
 for(const dz of[-5.6,5.6]){C(.06,.08,8,px+3.4,4,pz+dz,k.STL2,null,null,10);C(.3,.35,.25,px+3.4,.12,pz+dz,k.PLINTH,null,null,12);const fl=new THREE.Mesh(new THREE.PlaneGeometry(1.6,1,6,1),M(dz<0?0x2f6a2a:0x20261c,{side:THREE.DoubleSide,roughness:.9}));fl.position.set(px+3.4,7.3,pz+dz+(dz<0?-.84:.84));fl.rotation.y=Math.PI/2;g.add(fl)}
 B(.06,.5,.7,px+.03,1.6,pz-2.6,k.M(0xd8b060,{metalness:.8,roughness:.3}));
 return{obs:[{x0:400,x1:403.3,z0:pz-3.9,z1:pz-3.3},{x0:400,x1:403.3,z0:pz+3.3,z1:pz+3.9},{x0:403,x1:403.8,z0:pz-5.9,z1:pz-5.3},{x0:403,x1:403.8,z0:pz+5.3,z1:pz+5.9}]}}

function fbCmdBlock(g){const k=fbKit(),{B,C,rod,L}=k.H(g);
 const doors=[0,1,2,3].map(i=>[430+i*10+5-.7,430+i*10+5+.7]);
 fbDress(g,{x0:430,x1:470,z0:-860,z1:-846,h:3.4,sd:'n',gaps:doors,dh:2.4,skip:['s'],name:'COMMAND WING · GENERAL OFFICERS',nameY:3.08},'flat');
 doors.forEach(([a,b],i)=>L('OFFICE '+(i+1),1.3,.26,'#d8b040','#20261c',60,(a+b)/2+1.45,2.0,-860-.096,Math.PI));
 const bays=[0,1,2,3].map(i=>[430+i*10+5-3.8,430+i*10+5+3.8]);
 fbDress(g,{x0:430,x1:470,z0:-845,z1:-826,h:5.2,sd:'s',gaps:bays,dh:4.5,noCanopy:true,skip:['n'],name:'WRAITH BAYS · X-13 OWNERS ONLY',nameY:4.85,noWin:['s']},'flat');
 /* bay numbers on the piers and a hazard strip at each door's foot */bays.forEach(([a,b],i)=>{L(String(i+1),1.3,1.3,null,'#f0ece0',380,a-.6,2.6,-826+.06,0);B(b-a,.01,.4,(a+b)/2,.085,-825.6,k.LINEY)});
 return{obs:[]}}

function fbBootCamp(g){const k=fbKit(),{B,C,rod,L,tube}=k.H(g),M=k.M,z=-812;const WD=k.M(0x7a5a34,{roughness:.85}),WD2=k.M(0x5a3e22,{roughness:.85}),MUD=k.M(0x4a3a26,{roughness:.6,metalness:.05}),DIRT=k.M(0x8a7458,{roughness:1}),BW=k.STL2;
 /* the lane: packed dirt, a timber edge all round */B(94,.03,26,364,.075,z,DIRT);for(const zz of[z-13,z+13])B(94,.2,.2,364,.1,zz,WD2);for(const xx of[317,411])B(.2,.2,26,xx,.1,z,WD2);
 /* 1. the wire crawl x 332..346: posts, rails, barbed wire at 1.08 m, coils along the top rails */const zL=z-4,zR=z+4;for(let x=332;x<=346;x+=2){for(const zz of[zL,zR]){B(.18,1.5,.18,x,.75,zz,WD);B(.24,.06,.24,x,1.52,zz,WD2)}B(.12,.12,8.2,x,1.2,z,WD)}
 for(const zz of[zL,zR]){B(14.2,.14,.12,339,1.2,zz,WD);B(14.2,.12,.1,339,.5,zz,WD)}for(let i=0;i<9;i++)rod([332,1.08,zL+.5+i*.875],[346,1.08,zL+.5+i*.875],.012,BW,null,4);for(let x=333;x<346;x+=2)rod([x,1.08,zL],[x,1.08,zR],.012,BW,null,4);
 for(let x=332.5;x<346;x+=1.2)for(const zz of[zL,zR]){const c=new THREE.Mesh(new THREE.TorusGeometry(.22,.02,4,10),BW);c.position.set(x,1.5,zz);c.rotation.y=Math.PI/2;c.rotation.x=(x*7%2)-.5;g.add(c)}B(14,.02,8,339,.11,z,k.tier(MUD,2));
 for(const zz of[zL-.6,zR+.6])B(.14,2.6,.14,330.8,1.3,zz,WD);B(.14,.55,9.4,330.8,2.55,z,WD2);L('CRAWL UNDER THE WIRE · C TO CROUCH',8.2,.4,'#5a2020','#ffe0a0',60,330.72,2.55,z,-Math.PI/2);
 /* 2. tyres x 350..364: proper tyres with a tread texture, each at its plate height */const tt=k.tex(64,16,(c)=>{c.fillStyle='#1a1a1a';c.fillRect(0,0,64,16);c.fillStyle='#0c0c0c';for(let i=0;i<64;i+=6)c.fillRect(i,0,3,16)});const TM=k.M(0xffffff,{map:tt,roughness:.95});
 for(let i=0;i<8;i++)for(let j=0;j<3;j++){const x=350.8+i*1.8,zz=z-1.9+j*1.9,y=(i+j)%2?.3:.12;const t=new THREE.Mesh(new THREE.TorusGeometry(.5,.19,10,18),TM);t.rotation.x=Math.PI/2;t.position.set(x,y,zz);g.add(t)}
 /* 3. the wall at x 371.4: planked timber, rungs on the front, the platform on top, steps down the back to the plates' heights */
 const pt=k.tex(64,128,(c)=>{c.fillStyle='#8a6a3e';c.fillRect(0,0,64,128);for(let y=0;y<128;y+=16){c.fillStyle='#5a3e22';c.fillRect(0,y,64,2);c.fillStyle='rgba(60,40,20,.25)';c.fillRect(0,y+5,64,1)}for(let i=0;i<10;i++){c.fillStyle='#3a2a18';c.beginPath();c.arc((i*23)%60+2,(i*37)%126+1,1.3,0,7);c.fill()}});const PLK=k.M(0xffffff,{map:pt,roughness:.85});PLK.userData.s=.5;
 B(1.2,2.9,12,371.4,1.45,z,PLK);for(let i=0;i<5;i++)B(.07,.07,11.5,370.76,.5+i*.52,z,k.STL2);for(const zz of[z-5.9,z+5.9])B(1.3,3.2,.2,371.4,1.6,zz,WD2);
 B(2,.2,12,373,2.65,z,PLK);for(const zz of[z-5.9,z+5.9]){rod([372.1,2.75,zz],[372.1,3.8,zz],.04,k.STL);rod([373.9,2.75,zz],[373.9,3.8,zz],.04,k.STL);rod([372.1,3.8,zz],[373.9,3.8,zz],.04,k.STL)}
 for(const[a,b,y]of[[374,375.2,2.2],[375.2,376.4,1.65],[376.4,377.6,1.1],[377.6,378.8,.55]]){B(b-a,y,12,(a+b)/2,y/2,z,PLK)}
 for(const[a,b,y]of[[368,369.2,.55],[369.2,370.4,1.1],[370.4,370.8,1.65]])B(b-a,y,3,(a+b)/2,y/2,z,PLK);/* the run-up steps, solid to the ground */
 L('THE WALL',2,.45,'#5a2020','#ffe0a0',60,371.4,3.35,z-6.62,Math.PI);B(2.1,.55,.04,371.4,3.35,z-6.6,WD2);for(const xx of[370.45,372.35])rod([xx,0,z-6.6],[xx,3.1,z-6.6],.04,WD2);
 /* 4. the beam: a log on trestles over a mud pit with a wet sheen, step blocks at each end */B(22,.02,8,389,.11,z,k.tier(MUD,2));const sheen=new THREE.Mesh(new THREE.PlaneGeometry(16,5),k.M(0x6a5a40,Object.assign({roughness:.15,metalness:.2},k.PO)));sheen.rotation.x=-Math.PI/2;sheen.position.set(389,.135,z+.3);g.add(sheen);
 const lg=new THREE.Mesh(new THREE.CylinderGeometry(.26,.28,18.4,12),k.M(0x7a5634,{roughness:.8}));lg.rotation.z=Math.PI/2;lg.position.set(389,.74,z);g.add(lg);for(let x=381;x<398;x+=4){for(const s of[-1,1])rod([x,0,z+s*.5],[x,.5,z],.06,WD2);B(.1,.1,.5,x,.48,z,WD2)}
 for(const x of[379.4,399])B(1.2,.5,3,x,.25,z,PLK);for(const zz of[z-4,z+4])B(22,.25,.25,389,.12,zz,WD2);L('THE BEAM · DO NOT FALL IN',2.8,.4,'#5a2020','#ffe0a0',60,389,1.6,z-4.13,Math.PI);B(2.9,.5,.04,389,1.6,z-4.11,WD2);rod([387.6,0,z-4.1],[387.6,1.35,z-4.1],.04,WD2);rod([390.4,0,z-4.1],[390.4,1.35,z-4.1],.04,WD2);
 /* start and finish */C(.08,.1,3,322,1.5,-806,k.STL2,null,null,8);B(1.3,.55,.05,322.7,2.6,-806,k.YL);L('START',1.2,.45,null,'#1a1a1a',80,322.7,2.6,-806+.03,0);
 C(.06,.08,3,406,1.5,z-2,k.STL2,null,null,8);const ff=new THREE.Mesh(new THREE.PlaneGeometry(1.2,.8,4,1),k.M(0xc02020,{side:THREE.DoubleSide}));ff.position.set(406.62,2.6,z-2);g.add(ff);B(2,.03,1.2,406,.1,z,k.M(0x3a4a2a,{roughness:1}));L('FINISH · 10 PUSH-UPS',2,.38,'#e8c020','#1a1a1a',60,406,3.2,z-2.03,Math.PI);
 return{obs:[]}}

function fbFuelDepot(g){const k=fbKit(),{B,C,rod,L}=k.H(g),M=k.M;const TK=M(0xa8a89a,{metalness:.3,roughness:.5});
 for(const[w,d,x,z]of[[37,.3,383,-787],[37,.3,383,-777],[.3,10,364.6,-782],[.3,10,401.4,-782]]){B(w,.6,d,x,.3,z,k.PRE);B(w+.05,.05,d+.05,x,.62,z,k.CAP)}B(36.4,.03,9.4,383,.07,-782,k.PLINTH);
 for(const x of[372,383,394]){C(4,4,5,x,2.5,-782,TK,null,null,28);for(const y of[1.6,3.3])C(4.03,4.03,.06,x,y,-782,k.STL,null,null,28);const RS=4/Math.sin(.5),d=new THREE.Mesh(new THREE.SphereGeometry(RS,24,6,0,Math.PI*2,0,.5),TK);d.position.set(x,5-RS*Math.cos(.5),-782);g.add(d);C(.3,.3,.3,x,5.6,-782,k.DK,null,null,10);
  const lm=k.lab('DIESEL',3,.6,'#a8a89a','#5a2020',80);const cm=new THREE.Mesh(new THREE.CylinderGeometry(4.03,4.03,.6,20,1,true,-.45,.9),lm.material);cm.position.set(x,3.0,-782);g.add(cm);
  for(const s of[-.22,.22])rod([x+s,0,-777.95],[x+s,5.2,-777.95],.025,k.STL);for(let y=.3;y<5;y+=.3)rod([x-.22,y,-777.95],[x+.22,y,-777.95],.015,k.STL)}
 return{obs:[{x0:364.4,x1:401.6,z0:-787.2,z1:-786.8},{x0:364.4,x1:368,z0:-777.2,z1:-776.8},{x0:376.5,x1:401.6,z0:-777.2,z1:-776.8},{x0:364.4,x1:364.8,z0:-787,z1:-777},{x0:401.2,x1:401.6,z0:-787,z1:-777}]}}

function fbTent(g,x,z){const k=fbKit(),gr=new THREE.Group();gr.position.set(x,0,z);gr.userData.fix=1;g.add(gr);const{B,C,rod,slab}=k.H(gr),M=k.M;const W=6,D=4.4,WH=1.5,RH=3.0;
 const CV=M(0x6a7448,{roughness:1,side:THREE.DoubleSide}),CV2=M(0x5a6438,{roughness:1,side:THREE.DoubleSide});
 /* walls, roof slopes, gable ends with a door flap rolled up on the +z end */for(const s of[-1,1]){B(W,WH,.04,0,WH/2,s*D/2,CV);const half=D/2,sl=Math.hypot(half,RH-WH),r=new THREE.Mesh(new THREE.PlaneGeometry(W+.3,sl),CV2);r.position.set(0,(WH+RH)/2,s*half/2);r.rotation.x=-s*Math.atan2(half,RH-WH);gr.add(r)}
 const gab=[[-D/2,0],[D/2,0],[D/2,WH],[0,RH],[-D/2,WH]];slab(gab,.04,CV,-W/2,0,0,Math.PI/2);const door=[[-D/2,0],[-.6,0],[-.6,2.2],[.6,2.2],[.6,0],[D/2,0],[D/2,WH],[0,RH],[-D/2,WH]];slab(door,.04,CV,W/2,0,0,Math.PI/2);C(.12,.12,1.2,W/2+.05,2.3,0,CV2,'z',null,8);
 /* poles, ridge, guy ropes and pegs */for(const xx of[-W/2,0,W/2])C(.04,.04,RH,xx,RH/2,0,k.M(0x5a4a30),null,null,6);for(const s of[-1,1])for(let i=0;i<4;i++){const xx=-W/2+.3+i*(W-.6)/3;rod([xx,WH,s*D/2],[xx,0,s*(D/2+1.2)],.008,k.M(0xd8d0b8),null,4);B(.05,.15,.05,xx,.07,s*(D/2+1.2),k.M(0x5a4a30))}
 return gr}

function fbTankPark(g){const k=fbKit(),{B,C,rod,L}=k.H(g),M=k.M;const NET=k.tex(128,128,(c)=>{c.fillStyle='#4a5232';c.fillRect(0,0,128,128);let s=7;const r=()=>((s=s*16807%2147483647)/2147483647);for(let i=0;i<70;i++){c.fillStyle=['#5e6a3e','#3a4228','#6e6a4a','#2e3420'][i%4];c.beginPath();c.ellipse(r()*128,r()*128,6+r()*10,4+r()*7,r()*3,0,7);c.fill()}c.strokeStyle='rgba(20,20,10,.5)';c.lineWidth=1;for(let i=0;i<128;i+=6){c.beginPath();c.moveTo(i,0);c.lineTo(i+20,128);c.stroke()}});
 const NM=M(0xffffff,{map:NET,roughness:1,side:THREE.DoubleSide});
 for(const rz of[-790,-770]){const z0=rz-4.6,z1=rz+4.6,x0=430,x1=510,H=4.6;for(let x=x0;x<=x1;x+=10)for(const zz of[z0,z1]){C(.1,.12,H,x,H/2,zz,k.OD2,null,null,8);C(.25,.3,.15,x,.075,zz,k.PLINTH,null,null,10)}
  for(const zz of[z0,z1])B(x1-x0,.16,.16,(x0+x1)/2,H,zz,k.OD2);for(let x=x0;x<=x1;x+=10)B(.14,.14,z1-z0,x,H+.4,rz,k.OD2);for(let x=x0;x<=x1;x+=10)for(const zz of[z0,z1])rod([x,H,zz],[x,H+.4,rz+(zz<rz?-2:2)],.05,k.OD2);
  const net=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0+1,z1-z0+1,16,4),NM);net.rotation.x=-Math.PI/2;net.position.set((x0+x1)/2,H+.52,rz);const p=net.geometry.attributes.position;for(let i=0;i<p.count;i++){const u=p.getX(i),v=p.getY(i);p.setZ(i,-.25*Math.abs(Math.sin(u*.31))*(1-Math.abs(v)/5))}net.geometry.computeVertexNormals();{const uv=net.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*8,uv.getY(i)*1)}g.add(net);
  for(let i=0;i<5;i++){const x=430+i*20;B(.12,.01,9,x,.095,rz,k.LINE)}for(let i=0;i<4;i++)B(2.6,.15,.3,440+i*20,.075,rz+(rz<-780?4:-4),k.YL)}
 B(8.2,1,.06,470,3.2,-800.05,k.OD2);L('TANK PARK · 13TH ARMOURED · SERGEANTS AND UP',8,.9,'#20261c','#e8f0d0',80,470,3.2,-800.017,Math.PI);rod([466.2,0,-800.05],[466.2,2.7,-800.05],.06,k.STL);rod([473.8,0,-800.05],[473.8,2.7,-800.05],.06,k.STL);
 const obs=[];for(const rz of[-790,-770])for(let x=430;x<=510;x+=10)for(const zz of[rz-4.6,rz+4.6])obs.push({x0:x-.15,x1:x+.15,z0:zz-.15,z1:zz+.15});return{obs}}

function fbRange(g){const k=fbKit(),{B,C,rod,L,slab}=k.H(g);
 /* the berm: earth, 4 m high, a sloped back, a vertical sandbag face towards the firing line */slab([[0,0],[6,0],[6,1.2],[1.2,4],[0,4]],70,k.EARTH,592,0,-765,0);
 const bt=k.tex(128,64,(c)=>{c.fillStyle='#8a7a54';c.fillRect(0,0,128,64);for(let r=0;r<4;r++)for(let i=-1;i<4;i++){const x=i*36+(r%2?18:0),y=r*16;c.fillStyle=['#b39e70','#a8936a','#bca878'][(r+i+3)%3];c.beginPath();c.ellipse(x+17,y+8,16.5,7.2,0,0,7);c.fill();c.fillStyle='rgba(60,50,30,.35)';c.fillRect(x+4,y+11,26,1.5)}});bt.repeat.set(1,1);const BG=k.M(0xffffff,{map:bt,roughness:1});BG.userData.s=1/1.1;
 B(.4,4,70,591.8,2,-765,BG);B(.5,.1,70,591.8,4.03,-765,k.EARTH);
 /* firing line posts with red/white bands, numbered lanes */for(let i=0;i<8;i++){const z=-798+i*9.5;C(.07,.07,1.3,520,.65,z,k.WH,null,null,8);C(.075,.075,.3,520,1.0,z,k.RD,null,null,8);L(String(i+1),.4,.4,'#f0ece0','#1a1a1a',120,520,1.45,z,Math.PI/2)}
 return{obs:[{x0:591.5,x1:598,z0:-800,z1:-730}]}}

function fbLZ(g){const k=fbKit(),{B,C,rod,L}=k.H(g);fbHelipad(g,582,-848,'LZ B');
 for(let i=0;i<3;i++){const mx=572+i*10,mz=-822;/* a round pit: a concrete lip, two neat courses of sandbags round it, a gravel floor, ammo boxes */C(2.3,2.3,.06,mx,.08,mz,k.M(0x8a8478,{roughness:1}),null,null,24);const ring=new THREE.Mesh(new THREE.TorusGeometry(2.55,.08,6,32),k.PRE);ring.rotation.x=Math.PI/2;ring.position.set(mx,.1,mz);g.add(ring);
  for(let c=0;c<2;c++)for(let j=0;j<14;j++){const a=(j+(c?.5:0))/14*Math.PI*2,r=2.75;const b=B(1.15,.32,.55,mx+Math.cos(a)*r,.16+c*.32,mz+Math.sin(a)*r,k.BAG);b.rotation.y=-a+Math.PI/2}}
 return{obs:[]}}

function fbHangarSkin(g){const k=fbKit(),{B,C,rod,L,slab}=k.H(g),M=k.M;const HX0=325,HX1=425,HZ0=-718,HZ1=-670,HH=9,O=.02;const CL=k.M(0x7c8070,{roughness:.6,metalness:.3});CL.map=k.CORR.map;CL.userData.s=.5;Object.assign(CL,{polygonOffset:true,polygonOffsetFactor:0,polygonOffsetUnits:-4});
 /* cladding on the three closed walls and round the door; a 1.2 m concrete plinth */const wall=(ax,c,a0,a1,out,y0)=>{const len=a1-a0,m=(a0+a1)/2,y=y0||0;if(ax=='x'){B(len,1.2-y,.08,m,(1.2+y)/2,c+out*(O+.04),k.SKINP);B(len,HH-1.2,.06,m,1.2+(HH-1.2)/2,c+out*(O+.03),CL)}else{B(.08,1.2,len,c+out*(O+.04),.6,m,k.SKINP);B(.06,HH-1.2,len,c+out*(O+.03),1.2+(HH-1.2)/2,m,CL)}};
 wall('x',HZ0,HX0-.1,HX1+.1,-1);wall('x',HZ1,HX0-.1,HX1+.1,1);wall('z',HX0,HZ0,HZ1,-1);wall('z',HX1,HZ0,-704,1);wall('z',HX1,-684,HZ1,1);B(.06,HH-7,20,HX1+O+.03,7+(HH-7)/2,-694,CL);
 /* the door frame: a heavy steel portal and a track on the ground for the slabs */for(const z of[-704,-684]){B(.6,7.2,.5,HX1+.3,3.6,z+(z<-694?-.25:.25),k.OD2)}B(.6,.6,21,HX1+.3,7.3,-694,k.OD2);B(.6,.04,40,HX1+.05,.1,-694,k.STL);
 /* the barrel roof over the flat roof: an arch along x, gable ends filled in, a ridge vent */const R=(HZ1-HZ0)/2+.3,rise=4,sy=rise/R,cz=(HZ0+HZ1)/2,len=HX1-HX0+.6;const rf=new THREE.Mesh(new THREE.CylinderGeometry(R,R,len,40,1,true,0,Math.PI),CL);rf.geometry.rotateZ(Math.PI/2);{const uv=rf.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*Math.PI*R*.5,uv.getY(i)*len*.1)}rf.scale.set(1,sy,1);rf.position.set((HX0+HX1)/2,HH+.5,cz);g.add(rf);
 const gab=[[-R,0],[R,0]];for(let i=40;i>=0;i--){const a=Math.PI*i/40;gab.push([Math.cos(a)*R*.995,Math.sin(a)*R*sy*.995])}for(const ex of[HX0-.3+.15,HX1+.3-.15])slab(gab,.3,k.PRE,ex,HH+.5,cz,Math.PI/2);
 B(len-4,.5,1.2,(HX0+HX1)/2,HH+.5+rise+.2,cz,k.STL2);
 L('HANGAR 1',10,2,null,'#e8e0c8',200,HX1+.3-.15+.16,HH+2,cz,Math.PI/2);
 return{obs:[]}}

function fbSilo(g){const k=fbKit(),{B,C,rod,L}=k.H(g),M=k.M;const SX=578,SZ=-700,AH=1.2,TR=4.6,CR=7.2;
 /* the collar: a round raised concrete ring with the launch tube's mouth, steps up the west side */
 const sh=new THREE.Shape();sh.absarc(0,0,CR,0,Math.PI*2,false);const hole=new THREE.Path();hole.absarc(0,0,TR+.1,0,Math.PI*2,true);sh.holes.push(hole);
 const ag=new THREE.ExtrudeGeometry(sh,{depth:AH,bevelEnabled:true,bevelThickness:.08,bevelSize:.08,bevelSegments:1,curveSegments:48});ag.rotateX(-Math.PI/2);ag.translate(SX,0,SZ);k.wuv(ag,.5);g.add(new THREE.Mesh(ag,k.PRE));
 for(let i=0;i<4;i++)B(.4,.3*(i+1),3,SX-CR-.2-(3-i)*.4,.15*(i+1),SZ,k.CAP);
 /* the shaft: the desert floor is at y 0, so the visible part is the lining shaded to black over a black disc (the missile rises through it) */
 const tt=k.tex(16,128,(c)=>{const gr=c.createLinearGradient(0,0,0,128);gr.addColorStop(0,'#55585c');gr.addColorStop(.6,'#1a1b1d');gr.addColorStop(1,'#000');c.fillStyle=gr;c.fillRect(0,0,16,128);c.fillStyle='rgba(0,0,0,.4)';for(let y=10;y<128;y+=24)c.fillRect(0,y,16,3)});
 const tube=new THREE.Mesh(new THREE.CylinderGeometry(TR+.1,TR+.1,AH+.02,40,1,true),new THREE.MeshBasicMaterial({map:tt,side:THREE.BackSide}));tube.position.set(SX,AH/2+.04,SZ);g.add(tube);
 const pit=new THREE.Mesh(new THREE.CircleGeometry(TR+.12,40),new THREE.MeshBasicMaterial({color:0x000000}));pit.rotation.x=-Math.PI/2;pit.position.set(SX,.06,SZ);g.add(pit);
 const lip=new THREE.Mesh(new THREE.TorusGeometry(TR+.12,.1,8,48),k.STL);lip.rotation.x=Math.PI/2;lip.position.set(SX,AH+.06,SZ);g.add(lip);
 const hz=new THREE.Mesh(new THREE.RingGeometry(TR+.35,TR+.95,48),M(0xffffff,Object.assign({map:k.HAZ.map,roughness:.6},k.PO)));hz.rotation.x=-Math.PI/2;hz.position.set(SX,AH+.085,SZ);g.add(hz);
 /* the hinge on the east side: a concrete plinth with two heavy knuckles and a pin */const HX=SX+5.3,HY=AH+.55;B(1.6,.5,5.4,HX+.3,AH+.25,SZ,k.PLINTH);for(const dz of[-1.9,1.9])B(.9,.9,.8,HX,HY,SZ+dz,k.STL);C(.22,.22,5.2,HX,HY,SZ,k.STL2,'z',null,14);
 /* the lid: a round armoured hatch on a hinge arm. The game still moves a hidden stand-in (hatch.position.x goes SX -> SX+9);
    the lid turns to match, 0 = shut, 9 = fully open (110 degrees), and the two rams follow it */
 const hatch=new THREE.Object3D();hatch.position.set(SX,0,SZ);g.add(hatch);
 const piv=new THREE.Group();/* r616: the lid turns, so the batching must leave it alone */piv.userData.dpKeep=1;piv.position.set(HX,HY,SZ);g.add(piv);const P=k.H(piv);const LR=4.95,lc=-(HX-SX);/* lid centre, relative to the hinge */
 P.C(LR,LR,.6,lc,-.1,0,M(0x5e6266,{roughness:.6,metalness:.4}),null,null,48);P.C(LR+.06,LR+.06,.12,lc,-.36,0,k.DK,null,null,48);
 {const RS=LR/Math.sin(.32),cap=new THREE.Mesh(new THREE.SphereGeometry(RS,40,6,0,Math.PI*2,0,.32),M(0x6a6e72,{roughness:.6,metalness:.35}));cap.position.set(lc,.2-RS*Math.cos(.32),0);piv.add(cap)}
 const rim=new THREE.Mesh(new THREE.RingGeometry(LR-.7,LR-.05,48),M(0xffffff,Object.assign({map:k.HAZ.map,roughness:.6},k.PO)));rim.rotation.x=-Math.PI/2;rim.position.set(lc,.205,0);piv.add(rim);
 for(let i=0;i<8;i++){const a=i/8*Math.PI*2,r0=1.6,r1=LR-.8;const rb=P.B(r1-r0,.12,.18,lc+Math.cos(a)*(r0+r1)/2,.25,Math.sin(a)*(r0+r1)/2,k.STL);rb.rotation.y=-a}
 P.C(1.2,1.2,.16,lc,.28,0,k.STL,null,null,24);{const st=k.lab('SILO 1',2.6,.8,null,'#e8e0c8',200);st.rotation.set(-Math.PI/2,0,Math.PI/2);st.position.set(lc+3.0,.24,0);piv.add(st)}
 for(const dz of[-1.9,1.9])P.B(2.2,.5,.7,-1.0,-.05,dz,k.STL);/* hinge arms joining the lid to the knuckles */
 /* rams: from the collar beside the hinge up to the lid's underside */const RM=M(0x2a2c30,{metalness:.5,roughness:.4}),RC=k.STL2,rams=[];for(const dz of[-3.3,3.3]){const base=new THREE.Vector3(HX+1.1,AH+.1,SZ+dz);B(.6,.3,.6,base.x,AH+.15,base.z,k.DK);const body=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,1,10),RM),rodm=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,1,8),RC);body.userData.dpKeep=rodm.userData.dpKeep=1;g.add(body);g.add(rodm);rams.push({base,body,rodm,att:new THREE.Vector3(-2.2,-.3,dz)})}
 const up=new THREE.Vector3(0,1,0),tmp=new THREE.Vector3(),A=new THREE.Vector3();
 const pose=()=>{const u=Math.max(0,Math.min(1,(hatch.position.x-SX)/9));piv.rotation.z=-u*1.92;piv.updateMatrixWorld(true);
  for(const r of rams){A.copy(r.att);piv.localToWorld(A);if(g.parent){g.updateMatrixWorld(true);g.worldToLocal(A)}const d=tmp.copy(A).sub(r.base),L2=d.length(),n=d.clone().normalize();const bl=Math.min(2.2,L2*.6);r.body.scale.set(1,bl,1);r.body.position.copy(r.base).addScaledVector(n,bl/2);r.body.quaternion.setFromUnitVectors(up,n);r.rodm.scale.set(1,L2-bl+.2,1);r.rodm.position.copy(r.base).addScaledVector(n,bl+(L2-bl)/2-.1);r.rodm.quaternion.setFromUnitVectors(up,n)}};
 pose();const lidMesh=piv.children[0];let last=-1;lidMesh.onBeforeRender=()=>{if(hatch.position.x!==last){last=hatch.position.x;pose()}};
 /* lamps round the collar */for(let i=0;i<4;i++){const a=i/4*Math.PI*2+Math.PI/4,x=SX+Math.cos(a)*(CR-.5),z=SZ+Math.sin(a)*(CR-.5);C(.18,.22,.2,x,AH+.1,z,k.PLINTH,null,null,10);C(.06,.08,2.4,x,AH+1.3,z,k.STL,null,null,8);C(.22,.22,.1,x,AH+2.5,z,k.DK,null,null,12);const l=new THREE.Mesh(new THREE.SphereGeometry(.2,12,8),M_red());l.position.set(x,AH+2.7,z);g.add(l)}
 return{hatch,obs:[{x0:SX-CR,x1:SX+CR,z0:SZ-CR,z1:SZ+CR}],top:AH}}

function fbRadome(g){const k=fbKit(),{B,C,L}=k.H(g),M=k.M;const rx=442,rz=-700;
 /* the base: a plinth, a panelled drum with ribs every 30 degrees, a band of louvres, a cornice, cable conduits, a vent unit,
    a ladder to the ring walk round the dome, an entrance porch with a lit canopy, a step and a name plaque */
 C(4.75,4.85,.4,rx,.2,rz,k.PLINTH,null,null,40);C(4.35,4.35,2.8,rx,1.8,rz,k.PRE,null,null,40);
 for(let i=0;i<12;i++){const a=i/12*Math.PI*2+Math.PI/12,x=rx+Math.cos(a)*4.38,z=rz+Math.sin(a)*4.38;if(Math.sin(a)>.92)continue;const rb=B(.35,2.8,.22,x,1.8,z,k.CAP);rb.rotation.y=-a+Math.PI/2}
 {const lv=new THREE.Mesh(new THREE.CylinderGeometry(4.37,4.37,.5,40,1,true,Math.PI*.9,Math.PI*1.2),k.M(0xffffff,{map:k.VENT.map,metalness:.4,roughness:.45}));{const uv=lv.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*12,uv.getY(i))}lv.position.set(rx,2.6,rz);g.add(lv)}
 C(4.6,4.6,.25,rx,3.08,rz,k.CAP,null,null,40);C(4.62,4.62,.06,rx,2.93,rz,k.DK,null,null,40);
 /* ring walk with a rail */{const rw=new THREE.Mesh(new THREE.RingGeometry(4.6,5.3,40),k.M(0x6a7078,{metalness:.6,roughness:.4,side:THREE.DoubleSide}));rw.rotation.x=-Math.PI/2;rw.position.set(rx,3.22,rz);g.add(rw);const rr=new THREE.Mesh(new THREE.TorusGeometry(5.25,.03,4,48),k.STL);rr.rotation.x=Math.PI/2;rr.position.set(rx,4.2,rz);g.add(rr);for(let i=0;i<16;i++){const a=i/16*Math.PI*2;C(.025,.025,1,rx+Math.cos(a)*5.25,3.7,rz+Math.sin(a)*5.25,k.STL,null,null,4)}}
 /* ladder on the west side up to the walk */{const lx=rx-4.62;for(const dz of[-.25,.25])C(.03,.03,3.3,lx-.1,1.65,rz+dz,k.STL,null,null,6);for(let y=.3;y<3.2;y+=.3)C(.016,.016,.5,lx-.1,y,rz,k.STL,'z',null,4)}
 /* conduits up the wall into the cornice, a vent unit on a frame */for(const a of[2.4,2.55]){const x=rx+Math.cos(a)*4.43,z=rz+Math.sin(a)*4.43;C(.07,.07,2.6,x,1.7,z,k.OD2,null,null,8)}
 {const a=-2.2,x=rx+Math.cos(a)*5.0,z=rz+Math.sin(a)*5.0,b=B(1.4,1.1,.9,x,.75,z,k.STL2);b.rotation.y=-a+Math.PI/2;const f=B(1.1,.04,.6,x,1.32,z,k.DKb);f.rotation.y=b.rotation.y}
 /* the porch, kept under the ring walk */B(2.4,2.75,1.5,rx,1.375,rz+4.55,k.PRE);B(2.8,.22,2.1,rx,2.86,rz+4.8,k.CAP);B(.5,.06,.2,rx,2.72,rz+5.6,k.LIT);B(2.8,.15,1.2,rx,.075,rz+5.85,k.PLINTH);
 B(1.3,2.3,.08,rx,1.15,rz+5.32,k.OD);for(const dx of[-.7,.7])B(.12,2.4,.12,rx+dx,1.2,rz+5.32,k.STL);B(1.52,.12,.12,rx,2.4,rz+5.32,k.STL);B(.08,.25,.08,rx+.4,1.1,rz+5.4,k.STL2);
 L('RADAR STATION 13',2.4,.2,'#20261c','#e8f0d0',60,rx,2.86,rz+5.857,0);
 const pt=k.tex(256,128,(c)=>{c.fillStyle='#ecebe4';c.fillRect(0,0,256,128);c.strokeStyle='#c8c6bc';c.lineWidth=2;for(let j=0;j<8;j++){const y=j*16;c.beginPath();c.moveTo(0,y);c.lineTo(256,y);c.stroke();for(let i=0;i<16;i++){const x=i*16+(j%2?8:0);c.beginPath();c.moveTo(x,y);c.lineTo(x+8,y+16);c.lineTo(x-8,y+16);c.closePath();c.stroke()}}});
 const dome=new THREE.Mesh(new THREE.SphereGeometry(4.4,32,20,0,Math.PI*2,0,Math.PI*.62),M(0xffffff,{map:pt,roughness:.8}));dome.position.set(rx,3.15+4.4*Math.cos(Math.PI*.62)*-1,rz);g.add(dome);
 C(.05,.05,1.6,rx+1.6,9.6,rz,k.STL,null,null,6);const bc=new THREE.Mesh(new THREE.SphereGeometry(.15,10,8),M_red());bc.position.set(rx+1.6,10.45,rz);g.add(bc);
 return{obs:[]}}


/* =====================================================================================================
   r616: THE WIRING
   ===================================================================================================== */
/* the game's seam smoothing (r406) pushes every pair of touching flat faces apart with a depth nudge that grows each time.
   The kit's roads, kerbs, lines and slabs touch everywhere and already carry their own nudges, so the smoothing piled
   dozens on top and the parade ground was drawn over the podium, the bleachers and the formation. Everything the kit
   builds is marked to be left alone. */
for(const nm of ["fbDress", "fbWall", "fbGate", "fbCheckpoint", "fbFlak", "fbGuardTower", "fbFence", "fbRoad", "fbLamp", "fbSignpost", "fbBollard", "fbMotorPool", "fbCanopy", "fbParade", "fbFlagpole", "fbPodium", "fbBleachers", "fbFloodMast", "fbShell", "fbPowerPlant", "fbWaterWorks", "fbSolar", "fbHeliHangar", "fbHelipad", "fbWindsock", "fbFuelPoint", "fbPX", "fbCourt", "fbArmoury", "fbShelter", "fbTower", "fbAirOps", "fbFuelFarm", "fbApproachLights", "fbHQ", "fbCmdBlock", "fbBootCamp", "fbFuelDepot", "fbTent", "fbTankPark", "fbRange", "fbLZ", "fbHangarSkin", "fbSilo", "fbRadome"]){const f=window[nm];if(typeof f!='function')continue;window[nm]=function(g){const n0=g&&g.children?g.children.length:0;const r=f.apply(this,arguments);try{if(g&&g.children)for(let i=n0;i<g.children.length;i++)g.children[i].traverse(o=>{if(o.isMesh)o.userData.noSeam=true})}catch(e){}return r}}
/* the base grows west to x 215, and the airfield annex (x 215..600, z -1004..-930) counts as the base */
MILB.x0=215;MILRZ.x0=215;MILAA.x0=200;MILAA.z0=-1010;
const FBANX={x0:215,x1:600,z0:-1004,z1:-930};
milArea=function(x,z,m){m=m||0;return x>MILB.x0+m&&x<MILB.x1-m&&z>FBANX.z0+m&&z<MILB.z1-m};
/* the turrets leave the visitors on the gate road alone from the outer checkpoint in, as they did from the gate */
MILSAFE[0][2]=-1010;
/* the supply run's pallet sits in the new canopy */
SUPPAL[0]=551;SUPPAL[1]=-911;
/* a model's obstacle boxes into the game's list */
function fbObs(q,L){for(const o of L||[]){if(o.local)continue;const b={x0:Math.min(o.x0,o.x1),x1:Math.max(o.x0,o.x1),z0:Math.min(o.z0,o.z1),z1:Math.max(o.z0,o.z1)};if(o.top!=null)b.top=o.top;q.obs.push(b)}q.obsDirty=1}

/* ---------- the roads ----------
   Each road is laid twice: the game's road() (it marks the cells the route grid prefers and paints the map; its own
   mesh is taken away again) and the kit's fbRoad (the looks). A road that ends at another stops at that road's edge,
   and the road it joins leaves a gap in its kerbs and pavement there. */
const FBROADS=[
 /* Gate Avenue */{a:[560,-1004,560,-738.5],w:7,o:{pave:'r',lamps:true,lampSide:1,gaps:[[-956.3,-947.7],[-889,-881],[-809,-801]]}},
 /* North Street */{a:[222,-885,556.5,-885],w:7,o:{pave:'l',lamps:true,lampSide:-1,gaps:[[292.2,299.8],[471.2,478.8],[488.1,525]]}},
 /* Parade Road */{a:[415,-805,556.5,-805],w:7,o:{pave:'l',lamps:true,lampSide:-1,gaps:[[471.2,478.8]]}},
 /* Parade Lane */{a:[475,-881.5,475,-808.5],w:7,o:{}},
 /* South Street */{a:[222,-735,563.5,-735],w:7,o:{lamps:true,lampSide:1,gaps:[[292.2,299.8],[556.2,563.8]]}},
 /* West Road */{a:[296,-881.5,296,-738.5],w:7,o:{lamps:true,lampSide:-1}},
 /* the airside lane, through the gap in the north wall (5.6 m: the motor pool's west wall is right beside it) */{a:[491.5,-940,491.5,-888.5],w:5.6,o:{}},
 /* the taxiway, from the jet apron to Gate Avenue */{a:[513,-952,556.5,-952],w:8,o:{taxi:true}},
 /* the service road along the north wall */{a:[300,-933.2,403,-933.2],w:5,o:{taxi:true}}];
milRoads=function(X){const g=X.g,{road}=X;
 /* outside the outer checkpoint the road in keeps its old look */road(560,-1033.5,560,-1004);
 const n0=g.children.length;for(const r of FBROADS)road(...r.a);
 for(let i=g.children.length-1;i>=n0;i--){const m=g.children[i];if(m.isMesh&&m.geometry&&m.geometry.type=='BoxGeometry')g.remove(m)}
 const rg=new THREE.Group();rg.name='fbRoads';g.add(rg);for(const r of FBROADS){const[x0,z0,x1,z1]=r.a;fbRoad(rg,x0,z0,x1,z1,r.w,r.o)}
 /* the motor pool's apron in front of its doors */{const k=fbKit(),{B}=k.H(rg);B(30,.03,7.5,510,.065,-892.25,k.ROAD);for(const x of[499,506.5,514,521.5])B(.15,.01,7.3,x,.085,-892.25,k.LINEY)}}

/* ---------- the new parts of the base, built straight after the game's own ---------- */
{const mb16=milBuild;milBuild=function(X,q,g){const had=!!q.mil;const r=mb16.apply(this,arguments);if(had||!q.mil)return r;
  const T=(nm,f)=>{try{f()}catch(e){conLog('error','Fort Blackout r616 ('+nm+'): '+e.message)}};const k=fbKit();
  T('annex',()=>fbAnnex(X,q,g));T('west strip',()=>fbWestStrip(X,q,g));T('plaza',()=>fbPlaza(X,q,g));
  T('map',()=>{q.mapR.push({x0:FBANX.x0,x1:FBANX.x1,z0:FBANX.z0,z1:FBANX.z1,c:'#c9bc9c'});for(const b of FBMAP)q.mapR.push({x0:b[0],x1:b[1],z0:b[2],z1:b[3],c:b[4]});q.mapBg=null});
  return r}}
/* buildings on the map (the base map draws the walls it finds, but these are solid blocks) */
const FBMAP=[[225,265,-924,-898,'#5a5e64'],[272,288,-906,-898,'#6a6a52'],[225,290,-879,-869,'#3a4a5a'],[222,250,-858,-834,'#5a5e64'],[266,284,-857,-839,'#5a5c58'],[266,284,-831,-813,'#5a5c58'],[266,284,-805,-787,'#5a5c58'],[228,246,-826,-818,'#6a6a52'],[222,260,-772,-746,'#6a6a52'],[266,290,-770,-748,'#7a5a4a'],[228,268,-712,-680,'#5a5e64'],
 [305,345,-962,-936,'#6a6a52'],[350,396,-960,-940,'#8a8c84'],[495,525,-925,-896,'#4a5a4a'],[528,553,-925,-893,'#5a5e64'],[401,429,-880,-827,'#a8a294'],[480,553,-878,-812,'#bfb39b']];

/* the airfield annex: the fence, the outer checkpoint and its chicane, guard towers, Air Ops, the fuel farm, the lights */
function fbAnnex(X,q,g){const k=fbKit(),{B,C}=k.H(g),A=FBANX;
 /* the fence: 3 m chain-link, and a 1 m barrier where it crosses the runway's line so landing planes clear it */
 const F=(x0,z0,x1,z1,h)=>{fbFence(g,x0,z0,x1,z1,h);const o={x0:Math.min(x0,x1)-.1,x1:Math.max(x0,x1)+.1,z0:Math.min(z0,z1)-.1,z1:Math.max(z0,z1)+.1};if(h<2)o.top=h;q.obs.push(o)};
 F(A.x0,A.z1,A.x0,-962,3);F(A.x0,-962,A.x0,-998,1);F(A.x0,-998,A.x0,A.z0,3);F(A.x0,A.z0,552,A.z0,3);F(568,A.z0,A.x1,A.z0,3);F(A.x1,A.z0,A.x1,A.z1,3);
 /* the outer checkpoint: booth, barrier and a guard; the barrier lifts on the same rules as the main gate's */
 const ck=fbCheckpoint(g,560,A.z0);ck.arm.userData.dpKeep=1;q.obs.push({x0:565,x1:568,z0:A.z0-1.5,z1:A.z0+1.5});{const s=mkSoldier(0);s.position.set(563.6,.9,A.z0+1.8);s.rotation.y=Math.PI/2;g.add(s)}
 X.anim(560,A.z0-3,80,dt=>{const want=(milRank()>=1&&!milHostile(q)&&Math.hypot(P.x-560,P.z-q.OZ-(A.z0-3))<22)||(q.seat&&q.seat.v.K.proto)?Math.PI/2-.2:0;ck.arm.rotation.z+=(want-ck.arm.rotation.z)*Math.min(1,dt*2)});
 /* the dragon's teeth: a zig-zag chicane outside the checkpoint (a car can weave through; nothing goes straight) */
 const tooth=(x,z)=>{const t=new THREE.Mesh(new THREE.ConeGeometry(.75,1.1,4),k.PRE);t.position.set(x,.55,z);t.rotation.y=Math.PI/4;g.add(t)};
 /* r616 note: rows 11 m apart (the spec had 6), and a 3.5 m overlap, so the AI route grid (it pads every obstacle by 2.2 m on a 3 m grid) still finds the one free column through the fence gap */for(const[x0,x1,z]of[[544,560,-1020],[563.5,576,-1009]]){for(let x=x0+.8;x<x1;x+=1.6)tooth(x,z);B(x1-x0,.15,1.4,(x0+x1)/2,.075,z,k.PLINTH);q.obs.push({x0,x1,z0:z-.75,z1:z+.75})}
 for(const sd of[-1,1])for(let i=0;i<10;i++){tooth(560+sd*(18+i*1.6),-1016);tooth(560+sd*(18.8+i*1.6),-1013.4)}
 /* guard towers at the far corners */for(const[x,z]of[[230,-1000],[598,-1000]]){fbGuardTower(g,x,z);q.obs.push({x0:x-1.7,x1:x+1.7,z0:z-1.7,z1:z+1.7})}
 fbObs(q,fbAirOps(g).obs);fbObs(q,fbFuelFarm(g).obs);fbApproachLights(g);
 q.obsDirty=1}

/* the west strip */
function fbWestStrip(X,q,g){for(const f of[fbPowerPlant,fbWaterWorks,fbSolar,fbHeliHangar,fbFuelPoint,fbPX,fbCourt])fbObs(q,f(g).obs);
 for(const[x,z,n]of[[275,-848,'W1'],[275,-822,'W2'],[275,-796,'W3']])fbObs(q,fbHelipad(g,x,z,n).obs);fbObs(q,fbWindsock(g,288,-860).obs);
 const ar=fbArmoury(g);fbObs(q,ar.obs);if(ar.lamp){ar.lamp.userData.dpKeep=1;X.anim(282,-700,200,()=>{ar.lamp.visible=(q.rt*1.5|0)%2==0})}
 q.locs.push({nm:'Heliport West',x:250,z:-846,ic:'🚁'})}

/* the command plaza between HQ and the command wing: paving, planters (solid), benches, a walkway with bollards */
function fbPlaza(X,q,g){const k=fbKit(),{B,C}=k.H(g),M=k.M;const x0=401,x1=429,z0=-880,z1=-827;
 B(x1-x0,.04,z1-z0,(x0+x1)/2,.06,(z0+z1)/2,k.PAVE);B(6,.012,z1-z0,415,.087,(z0+z1)/2,k.tier(k.PLINTH,2));for(const xx of[412,418])B(.15,.012,z1-z0,xx,.088,(z0+z1)/2,k.LINE);
 const GR=M(0x5a7a3a,{roughness:1}),BU=M(0x4a6a32,{roughness:1});
 for(const[x,z]of[[405.5,-874],[424.5,-874],[405.5,-858],[424.5,-858],[405.5,-842],[424.5,-842],[405.5,-832],[424.5,-832]]){B(3,.6,3,x,.3,z,k.PRE);B(3.1,.06,3.1,x,.63,z,k.CAP);B(2.6,.05,2.6,x,.62,z,M(0x5a4a34));for(let i=0;i<3;i++){const s=new THREE.Mesh(new THREE.SphereGeometry(.45+i*.08,8,6),i%2?BU:GR);s.position.set(x-.6+i*.6,.95+(i%2)*.1,z+(i-1)*.4);g.add(s)}q.obs.push({x0:x-1.5,x1:x+1.5,z0:z-1.5,z1:z+1.5})}
 for(const[x,z]of[[409.6,-866],[420.4,-866],[409.6,-850],[420.4,-850]]){B(.5,.08,2,x,.48,z,M(0x7a5a3a,{roughness:.8}));for(const dz of[-.8,.8])B(.45,.44,.12,x,.22,z+dz,k.STL);B(.08,.4,2,x+(x<415?-.22:.22),.75,z,M(0x7a5a3a,{roughness:.8}))}
 for(const z of[z0+.6,z1-.6])for(let i=0;i<5;i++)fbBollard(g,412.6+i*1.2,z);
 q.obsDirty=1}

/* ---------- the command wing and the Wraith bays from outside, once they are built ---------- */
{const cb16=cwBuild;cwBuild=function(q){const r=cb16.apply(this,arguments);try{if(q.cw&&q.wbay&&!q.cw.fb16){q.cw.fb16=1;const g=new THREE.Group();q.cw.g.add(g);fbObs(q,fbCmdBlock(g).obs)}}catch(e){conLog('error','command wing r616: '+e.message)}return r}}
