/* =====================================================================================================
   FORT BLACKOUT KIT (batch 1 of the base remodel). Everything builds into a group g at desert-local x/z, ground y 0.
   The look: sand-coloured concrete block, a darker plinth, olive steel, black-and-yellow hazard paint, white stencils.

     fbDress(g, b, style)   dresses a box building made by milBuild's BLD(x0,x1,z0,z1,h,sd,da,db): new block skin on
                            the outside faces, plinth, windows, door frame, canopy and lamp, drainpipes, and a roof by
                            style: 'hut' (pitched corrugated roof, gable stencils), 'flat' (parapet, roof units),
                            'bunker' (earth berm on three sides, blast-door frame). Outside only: rooms are untouched.
                            b = {x0,x1,z0,z1,h,sd,da,db,name,num}
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
 /* painted lines and decals: lifted 1 cm and drawn with a depth offset so they never flicker on the slab */
 const PO={polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4};k.LINE=M(0xf0ece0,Object.assign({roughness:.8},PO));k.LINEY=M(0xe8c020,Object.assign({roughness:.7},PO));k.PO=PO;
 k.LINK=new THREE.MeshStandardMaterial({map:tex(64,64,(x)=>{x.clearRect(0,0,64,64);x.strokeStyle='#c8ccd0';x.lineWidth=2.5;x.beginPath();x.moveTo(0,32);x.lineTo(32,0);x.lineTo(64,32);x.lineTo(32,64);x.closePath();x.stroke();x.beginPath();x.moveTo(0,0);x.lineTo(0,0);x.stroke()}),transparent:false,alphaTest:.4,side:THREE.DoubleSide,metalness:.6,roughness:.4});k.LINK.userData.s=1/.12;
 k.lab=(s,w,h,bg,fg,fs,font)=>{const c=document.createElement('canvas');c.width=512;c.height=Math.max(32,Math.round(512*h/w));const x=c.getContext('2d');if(bg){x.fillStyle=bg;x.fillRect(0,0,c.width,c.height)}x.fillStyle=fg;const lines=String(s).split('\n');let f=fs||60;const F=()=>'bold '+f+'px '+(font||FONT);x.font=F();while((Math.max(...lines.map(l=>x.measureText(l).width))>480||f*lines.length*1.15>c.height*.92)&&f>10){f-=2;x.font=F()}x.textAlign='center';x.textBaseline='middle';lines.forEach((l,i)=>x.fillText(l,256,c.height/2+(i-(lines.length-1)/2)*f*1.15+2));const t=new THREE.CanvasTexture(c);t.anisotropy=4;return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t,transparent:!bg,alphaTest:bg?0:.3,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2}))};
 k.wuv=(ge,s,ox,oy,oz)=>{const p=ge.attributes.position,n=ge.attributes.normal,uv=ge.attributes.uv;if(!uv)return ge;if(ge.type!=='BoxGeometry'){for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*s,uv.getY(i)*s)}else for(let i=0;i<p.count;i++){const ax=Math.abs(n.getX(i)),ay=Math.abs(n.getY(i)),az=Math.abs(n.getZ(i)),X=p.getX(i)+(ox||0),Y=p.getY(i)+(oy||0),Z=p.getZ(i)+(oz||0);let u,v;if(ax>=ay&&ax>=az){u=Z;v=Y}else if(ay>=az){u=X;v=Z}else{u=X;v=Y}uv.setXY(i,u*s,v*s)}uv.needsUpdate=true;return ge};
 k.H=g=>{const add=(o,p)=>{(p||g).add(o);return o},S=m=>m&&m.userData&&m.userData.s;
  const B=(w,h,d,x,y,z,m,p)=>{const ge=new THREE.BoxGeometry(w,h,d);if(S(m))k.wuv(ge,S(m),x,y,z);const o=new THREE.Mesh(ge,m);o.position.set(x,y,z);return add(o,p)};
  const C=(r1,r2,h,x,y,z,m,ax,p,seg,open)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,seg||12,1,!!open),m);o.position.set(x,y,z);if(ax=='x')o.rotation.z=Math.PI/2;else if(ax=='z')o.rotation.x=Math.PI/2;return add(o,p)};
  const rod=(a,b,r,m,p,seg)=>{const A=new THREE.Vector3(...a),Bv=new THREE.Vector3(...b),d=Bv.clone().sub(A);const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),seg||6),m);o.position.copy(A).add(Bv).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return add(o,p)};
  const poly=pts=>{const s=new THREE.Shape();s.moveTo(pts[0][0],pts[0][1]);for(const q of pts.slice(1))s.lineTo(q[0],q[1]);s.lineTo(pts[0][0],pts[0][1]);return s};
  /* a flat shape in the x-y plane of a group, pushed d along z; placed at (x,y,z) and turned ry */
  const slab=(pts,d,m,x,y,z,ry,p)=>{const ge=new THREE.ExtrudeGeometry(poly(pts),{depth:d,bevelEnabled:false});ge.translate(0,0,-d/2);if(S(m))k.wuv(ge,S(m));const o=new THREE.Mesh(ge,m);o.position.set(x,y,z);o.rotation.y=ry||0;return add(o,p)};
  const L=(s,w,h,bg,fg,fs,x,y,z,ry,p,font)=>{const o=k.lab(s,w,h,bg,fg,fs,font);o.position.set(x,y,z);o.rotation.y=ry||0;(p||g).add(o);return o};
  return{add,B,C,rod,slab,L,poly}};
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
 for(const s of['n','s','w','e']){const S=sides[s];const lo=S.lo,hi=S.hi;
  const runs=s==sd?[[lo,da],[db,hi]]:[[lo,hi]];
  for(const[a,bb]of runs){face(s,a,bb,0,PL,O,T+.05,k.PLINTH);face(s,a,bb,PL,h,O,T,k.BLOCK)}
  if(s==sd){face(s,da,db,2.5,h,O,T,k.BLOCK);/* door frame: steel jambs and head, painted hazard on bunkers */const fm=bunker?k.HAZ:k.OD2;for(const u of[da,db]){const[px,pz]=at(s,u,-.15+.0);S.along=='x'?B(.14,2.5,.42,u+(u==da?.07:-.07),1.25,S.fixed+S.out*.06,fm):B(.42,2.5,.14,S.fixed+S.out*.06,1.25,u+(u==da?.07:-.07),fm)}
   S.along=='x'?B(db-da,.14,.42,(da+db)/2,2.43,S.fixed+S.out*.06,fm):B(.42,.14,db-da,S.fixed+S.out*.06,2.43,(da+db)/2,fm);
   /* canopy, brackets, a lamp under it, a flush concrete pad */const cw=db-da+1.2,cd=bunker?.6:1.3,cy=2.78;const[cx,cz]=at(s,(da+db)/2,cd/2+O+T);S.along=='x'?B(cw,.16,cd,cx,cy,cz,k.CAP):B(cd,.16,cw,cx,cy,cz,k.CAP);
   for(const u of[da-.4,db+.4]){const[a1,b1]=at(s,u,O+T),[a2,b2]=at(s,u,cd-.05);rod([a1,cy-.6,b1],[a2,cy-.08,b2],.03,k.STL)}
   {const[lx,lz]=at(s,(da+db)/2,.35);B(.5,.06,.18,lx,cy-.11,lz,k.LIT).rotation.y=S.along=='x'?0:Math.PI/2}
   {const[px,pz]=at(s,(da+db)/2,.9);const pw=db-da+1.6;S.along=='x'?B(pw,.02,1.8,px,.06,pz,k.PLINTH):B(1.8,.02,pw,px,.06,pz,k.PLINTH)}
   /* the name on a board along the canopy's front edge */if(b.name){const nw=Math.min(cw,7),[bx2,bz2]=at(s,(da+db)/2,cd+O+T+.025);S.along=='x'?B(nw+.1,.46,.05,bx2,cy,bz2,k.OD2):B(.05,.46,nw+.1,bx2,cy,bz2,k.OD2);const[nx,nz]=at(s,(da+db)/2,cd+O+T+.057);L(b.name,nw,.38,bunker?'#e8c020':'#20261c',bunker?'#1a1a1a':'#e8f0d0',60,nx,cy,nz,ry[s])}}
  /* windows: 1.4 x 1.0 every 4 m, not near the door, not on bunkers */
  if(!bunker&&h>=3){const len=S.hi-S.lo,n=Math.floor((len-2)/4);for(let i=0;i<n;i++){const u=S.lo+(len-(n-1)*4)/2+i*4;if(s==sd&&u>da-1.6&&u<db+1.6)continue;if(st=='hut'&&s!=sd&&(s=='w'||s=='e'))continue;
    const wy=Math.min(1.75,h-1.0),ww=1.4,wh=1.0,off=O+T;const P=(a,y,w2,h2,m,o2,dd)=>{const[x,z]=at(s,a,off+o2);return S.along=='x'?B(w2,h2,dd,x,y,z,m):B(dd,h2,w2,x,y,z,m)};
    P(u,wy,ww,wh,k.WIN,.006,.012);P(u,wy+wh/2+.04,ww+.16,.08,k.OD2,.03,.06);P(u,wy-wh/2-.05,ww+.24,.08,k.CAP,.06,.12);for(const sx of[-1,1])P(u+sx*(ww/2+.04),wy,.08,wh+.16,k.OD2,.03,.06);P(u,wy,.04,wh,k.OD2,.02,.03);
    if(st=='hut'&&s!=sd&&i%2==0){P(u+1.6,.95,.9,.6,k.STL2,.3,.6);P(u+1.6,.95,.7,.45,k.DK,.605,.01)}/* a wall air conditioner under every other back window */}}
  /* drainpipes at the corners of the long sides */if(!bunker&&(st!='hut'||S.along=='x'))for(const u of[S.lo+.25,S.hi-.25]){if(s==sd&&u>da-1&&u<db+1)continue;const[x,z]=at(s,u,O+T+.07);C(.055,.055,h+.1,x,(h+.1)/2,z,k.OD2,null,null,8)}}
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
