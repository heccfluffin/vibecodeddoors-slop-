/* Hotel floor looks (hotel-loop.md part 2, B: four floors).
   Floor 1 is today's hotel, unchanged. Floors 2-4 swap the hall's textures, trim colours and lamps, and add a little
   dressing (cobwebs and peeling paper, ceiling pipes and staff signs, puddles and drips).

   Everything here is drawn with its OWN random numbers (hflRng), never Math.random, so building a texture or dressing
   a room never eats numbers from the seeded room generator (co-op rooms stay the same on every client).

   HFL[f]           the table for floor f (1-4): names, texture keys, trim colours, lamp, light tint, fog
   hflTex(f)        {wall, wains, floor, ceil, door} CanvasTextures for floor 2-4 (cached), null for floor 1
   hflLamp(f,drop)  the hall lamp for floor 2-4 as a Group (top at y 0, hangs down); drop = extra rod for tall rooms
   hflDress(f,o)    dresses one hall: o = {g, L, HX, HY, zA, zB, occ, open, seed}; returns {anims:[fn(dt,t)]}
   hflFlick(s,t)    floor 4's flicker: 1 = on, small = off for a moment (s = the lamp's number)                     */

function hflRng(s){s=(s>>>0)||1;return()=>{s+=0x6D2B79F5;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}

const HFL=[null,
 {n:'Guest Floors',sub:'Doors 1-24',tx:null,trim:null,lamp:{c:0xffd9a0,i:.7},amb:[0x2a2014,.7],fog:[0x050403,2,16]},
 {n:'The Old Wing',sub:'Doors 26-50',
  tx:{wall:'hfWall2',wains:'hfWains2',floor:'hfFloor2',ceil:'hfCeil2',door:'hfDoor2'},
  trim:{0x6e4326:0x5a5038,0x2a1608:0x26261c,0xd8c8a8:0xa8a48c},
  lamp:{c:0xffd6a0,i:.58},amb:[0x222619,.65],fog:[0x040503,2,14]},
 {n:'Staff & Service',sub:'Doors 51-74',
  tx:{wall:'hfWall3',wains:'hfWains3',floor:'hfFloor3',ceil:'hfCeil3',door:'hfDoor3'},
  trim:{0x6e4326:0x56646c,0x2a1608:0x2c2c2a,0xd8c8a8:0xd4d4ca},
  lamp:{c:0xe8f0ff,i:.75},amb:[0x1a1c20,.7],fog:[0x050506,2,17]},
 {n:'The Deep Hotel',sub:'Doors 76-99',
  tx:{wall:'hfWall4',wains:'hfWains4',floor:'hfFloor4',ceil:'hfCeil4',door:'hfDoor4'},
  trim:{0x6e4326:0x3a1c10,0x2a1608:0x140a06,0xd8c8a8:0x6a5a48},
  lamp:{c:0xffb880,i:.9,dead:.2,flick:1},amb:[0x30161a,.75],fog:[0x060202,2,13]}];

/* a canvas texture that repeats, with the game's speckle on top (from its own random numbers) */
function hflCan(w,h,seed,f,spk){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d'),R=hflRng(seed);f(x,R,w,h);
 const n=spk==null?Math.round(w*h/23):spk;for(let i=0;i<n;i++){x.fillStyle='rgba(0,0,0,'+R()*.22+')';x.fillRect(R()*w,R()*h,2,2)}
 const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t}
/* a torn, wobbly blob */
function hflBlob(x,R,cx,cy,rx,ry,n){x.beginPath();for(let i=0;i<=n;i++){const a=i/n*Math.PI*2,k=.72+R()*.42;x.lineTo(cx+Math.cos(a)*rx*k,cy+Math.sin(a)*ry*k)}x.closePath()}
/* damask drop, as on the game's wallpaper */
function hflDrop(x,cx,cy,s){x.beginPath();x.moveTo(cx,cy-8*s);x.quadraticCurveTo(cx+6*s,cy,cx,cy+8*s);x.quadraticCurveTo(cx-6*s,cy,cx,cy-8*s);x.fill();x.beginPath();x.arc(cx,cy-10*s,2*s,0,7);x.arc(cx,cy+10*s,2*s,0,7);x.fill()}

/* WALL tiles are 4 m x 4 m (256 px, 64 px a metre, top row = the ceiling), so the wiring halves the game's v repeat
   (T(key, a, b/2)). WAINSCOT is 1.2 m x 1 m like the game's. FLOOR and CEILING are 2 m x 2 m like the game's. */
const hflTX={};
function hflTex(f){if(f<2)return null;if(hflTX[f])return hflTX[f];let o;
 if(f==2)o={
  wall:hflCan(256,256,201,(x,R)=>{x.fillStyle='#7a8868';x.fillRect(0,0,256,256);
   for(let i=0;i<256;i+=64){x.fillStyle='#71805f';x.fillRect(i,0,26,256);x.fillStyle='rgba(225,215,165,.3)';x.fillRect(i,0,1,256);x.fillRect(i+26,0,1,256)}
   x.fillStyle='rgba(205,200,150,.3)';for(let i=45;i<256;i+=64)for(let j=16;j<256;j+=64)hflDrop(x,i,j+(i%128>64?32:0),1.4);
   let g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,'rgba(255,250,215,.10)');g.addColorStop(.6,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(50,45,30,.28)');x.fillStyle=g;x.fillRect(0,0,256,256);
   for(let i=0;i<5;i++){x.fillStyle='rgba(120,100,50,.10)';hflBlob(x,R,R()*256,30+R()*150,10+R()*22,14+R()*26,14);x.fill()}
   /* where a picture used to hang: a cleaner patch and a nail hole */
   x.fillStyle='rgba(150,165,125,.45)';x.fillRect(150,78,52,38);x.fillStyle='rgba(30,26,18,.8)';x.fillRect(175,72,2,2);
   /* two patches where the paper has come away: bare plaster with a torn edge */
   for(const[cx,cy,rx,ry]of[[56,120,16,22],[214,52,11,15]]){x.fillStyle='#aaa58a';hflBlob(x,R,cx,cy,rx,ry,18);x.fill();x.strokeStyle='rgba(235,230,195,.7)';x.lineWidth=2;x.stroke();x.strokeStyle='rgba(55,50,35,.55)';x.lineWidth=1;x.stroke();
    for(let i=0;i<30;i++){x.fillStyle='rgba(120,110,85,'+R()*.3+')';x.fillRect(cx-rx*.6+R()*rx*1.2,cy-ry*.6+R()*ry*1.2,2,2)}}}),
  wains:hflCan(256,256,202,(x,R)=>{x.fillStyle='#4c5745';x.fillRect(0,0,256,256);
   for(const px of[12,140]){x.fillStyle='#57634f';x.fillRect(px,28,104,200);x.strokeStyle='rgba(0,0,0,.45)';x.lineWidth=4;x.strokeRect(px,28,104,200);x.strokeStyle='rgba(200,210,170,.18)';x.lineWidth=2;x.strokeRect(px+10,38,84,180)}
   for(let i=0;i<14;i++){x.fillStyle='#6a4a30';hflBlob(x,R,R()*256,R()*256,2+R()*6,1+R()*3,8);x.fill()}
   for(let i=0;i<30;i++){x.strokeStyle='rgba(20,20,12,'+R()*.3+')';x.lineWidth=1+R()*2;const y=190+R()*60,a=R()*256;x.beginPath();x.moveTo(a,y);x.lineTo(a+10+R()*30,y+R()*3-1.5);x.stroke()}
   x.fillStyle='rgba(200,195,165,.18)';x.fillRect(0,0,256,10)}),
  floor:hflCan(256,256,203,(x,R)=>{x.fillStyle='#33443a';x.fillRect(0,0,256,256);for(let i=0;i<4000;i++){x.fillStyle=R()<.5?'rgba(20,30,24,.35)':'rgba(80,95,80,.2)';x.fillRect(R()*256,R()*256,1,2)}
   x.strokeStyle='rgba(150,140,90,.20)';x.lineWidth=2;for(let i=-256;i<256;i+=32){x.beginPath();x.moveTo(i,0);x.lineTo(i+256,256);x.stroke();x.beginPath();x.moveTo(i+256,0);x.lineTo(i,256);x.stroke()}
   x.strokeStyle='rgba(140,128,80,.35)';x.lineWidth=5;x.strokeRect(10,10,236,236);
   for(let i=0;i<5;i++){x.fillStyle='rgba(140,120,90,.22)';hflBlob(x,R,R()*256,R()*256,14+R()*26,10+R()*20,14);x.fill()}}),
  ceil:hflCan(256,256,204,(x,R)=>{x.fillStyle='#a49c83';x.fillRect(0,0,256,256);for(let i=0;i<1500;i++){x.fillStyle='rgba(255,250,225,'+R()*.08+')';x.fillRect(R()*256,R()*256,3,3)}
   x.strokeStyle='rgba(50,45,35,.5)';x.lineWidth=1;for(let k=0;k<5;k++){let px=R()*256,py=R()*256;x.beginPath();x.moveTo(px,py);for(let i=0;i<14;i++){px+=R()*16-8;py+=R()*16-8;x.lineTo(px,py)}x.stroke()}
   x.strokeStyle='rgba(120,95,40,.35)';x.lineWidth=3;x.beginPath();x.ellipse(170,90,34,26,.4,0,7);x.stroke();x.fillStyle='rgba(150,120,50,.12)';x.fill();
   x.strokeStyle='#706650';x.lineWidth=5;x.strokeRect(0,0,256,256)}),
  door:hflDoorTex(205,'#66705a','#363e2e',(x,R)=>{for(let i=0;i<12;i++){x.fillStyle='#7a5434';hflBlob(x,R,R()*256,R()*256,2+R()*5,2+R()*4,8);x.fill()}})};
 else if(f==3)o={
  wall:hflCan(256,256,301,(x,R)=>{for(let r=0;r<16;r++)for(let c=0;c<16;c++){const v=R()*10-5;x.fillStyle=r==10?'rgb('+(63+v)+','+(109+v)+','+(102+v)+')':'rgb('+(221+v)+','+(213+v)+','+(184+v)+')';x.fillRect(c*16,r*16,16,16);
     x.fillStyle='rgba(255,255,255,.14)';x.fillRect(c*16+2,r*16+2,6,2)}
   x.fillStyle='#a8a189';for(let i=0;i<=256;i+=16){x.fillRect(i-1,0,2,256);x.fillRect(0,i-1,256,2)}x.fillStyle='rgba(60,50,30,.18)';for(let i=0;i<500;i++)x.fillRect(R()*256,R()*256,1,1)
   x.strokeStyle='rgba(60,55,45,.6)';x.lineWidth=1;for(const[cx,cy]of[[40,72],[200,140],[120,36]]){x.beginPath();x.moveTo(cx,cy);x.lineTo(cx+5,cy+6);x.lineTo(cx+3,cy+12);x.moveTo(cx+5,cy+6);x.lineTo(cx+11,cy+8);x.stroke()}
   let g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,'rgba(90,80,50,.16)');g.addColorStop(.25,'rgba(0,0,0,0)');g.addColorStop(.85,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(70,60,40,.22)');x.fillStyle=g;x.fillRect(0,0,256,256)},0),
  wains:hflCan(256,256,302,(x,R)=>{const cw=256/6,rh=256/5;for(let r=0;r<5;r++)for(let c=0;c<6;c++){const v=R()*10-5;x.fillStyle='rgb('+(60+v)+','+(104+v)+','+(97+v)+')';x.fillRect(c*cw,r*rh,cw,rh);x.fillStyle='rgba(255,255,255,.12)';x.fillRect(c*cw+4,r*rh+4,14,3)}
   x.fillStyle='#2b4842';for(let c=0;c<=6;c++)x.fillRect(Math.round(c*cw)-1,0,3,256);for(let r=0;r<=5;r++)x.fillRect(0,Math.round(r*rh)-1,256,3);
   x.fillStyle='rgba(20,25,20,.25)';x.fillRect(0,205,256,51)},150),
  floor:hflCan(256,256,303,(x,R)=>{x.fillStyle='#a19c8d';x.fillRect(0,0,256,256);const cs=['#7c786c','#c8c2b0','#5e5a52','#b0a890','#8a8478'];for(let i=0;i<5000;i++){x.fillStyle=cs[R()*5|0];x.fillRect(R()*256,R()*256,1+R()*2,1+R()*2)}
   x.strokeStyle='rgba(40,38,32,.45)';x.lineWidth=2;x.beginPath();x.moveTo(1,0);x.lineTo(1,256);x.stroke();
   for(let i=0;i<9;i++){x.strokeStyle='rgba(30,28,24,'+(.15+R()*.25)+')';x.lineWidth=2+R()*2;x.beginPath();const cx=R()*256,cy=R()*256,r=10+R()*30,a=R()*6;x.arc(cx,cy,r,a,a+.6+R()*.8);x.stroke()}
   let g=x.createRadialGradient(128,128,10,128,128,180);g.addColorStop(0,'rgba(255,250,230,.10)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,256,256)}),
  ceil:hflCan(256,256,304,(x,R)=>{x.fillStyle='#b6b5ab';x.fillRect(0,0,256,256);for(let i=0;i<1500;i++){x.fillStyle='rgba(0,0,0,'+R()*.06+')';x.fillRect(R()*256,R()*256,3,3)}
   x.strokeStyle='rgba(60,60,55,.35)';x.lineWidth=2;x.beginPath();x.moveTo(128,0);x.lineTo(128,256);x.moveTo(0,128);x.lineTo(256,128);x.stroke();x.strokeStyle='#8a8a80';x.lineWidth=4;x.strokeRect(0,0,256,256)}),
  door:hflDoorTex(305,'#7f878c','#4a5257',(x,R)=>{x.fillStyle='#5c6266';x.fillRect(0,206,256,50);x.strokeStyle='rgba(220,225,230,.25)';for(let i=0;i<40;i++){x.beginPath();const y=208+R()*46;x.moveTo(0,y);x.lineTo(256,y);x.stroke()}
   x.fillStyle='#b8bec2';x.fillRect(200,110,30,60);x.strokeStyle='#4a5257';x.lineWidth=2;x.strokeRect(200,110,30,60)})};
 else o={
  wall:hflCan(256,256,401,(x,R)=>{x.fillStyle='#74232a';x.fillRect(0,0,256,256);
   for(let i=0;i<256;i+=64){x.fillStyle='#601a20';x.fillRect(i,0,26,256);x.fillStyle='rgba(150,60,50,.28)';x.fillRect(i,0,1,256);x.fillRect(i+26,0,1,256)}
   x.fillStyle='rgba(140,46,46,.6)';for(let i=45;i<256;i+=64)for(let j=16;j<256;j+=64)hflDrop(x,i,j+(i%128>64?32:0),1.4);
   /* water running down from the ceiling: streaks that fade, each ending in a darker tide line */
   for(const[sx,sw,sl]of[[30,22,150],[98,12,90],[168,30,190],[226,16,120]]){for(let k=0;k<sw;k++){const len=sl*(.55+R()*.45),xx=sx+k;let g=x.createLinearGradient(0,0,0,len);g.addColorStop(0,'rgba(60,32,14,.55)');g.addColorStop(.8,'rgba(60,32,14,.25)');g.addColorStop(1,'rgba(30,12,4,.0)');x.fillStyle=g;x.fillRect(xx,0,1,len);x.fillStyle='rgba(25,10,4,.35)';x.fillRect(xx,len-3,1,2)}}
   for(let i=0;i<600;i++){const cx=R()<.5?R()*256:R()*256,cy=R()<.6?R()*30:226+R()*30;x.fillStyle='rgba(18,24,12,'+(.2+R()*.4)+')';x.fillRect(cx,cy,1+R()*2,1+R()*2)}
   let g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,'rgba(20,6,4,.35)');g.addColorStop(.3,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(10,2,2,.35)');x.fillStyle=g;x.fillRect(0,0,256,256)}),
  wains:hflCan(256,256,402,(x,R)=>{x.fillStyle='#34190f';x.fillRect(0,0,256,256);for(let i=0;i<60;i++){x.strokeStyle='rgba(10,4,2,.35)';x.beginPath();const y=R()*256;x.moveTo(0,y);x.lineTo(256,y+R()*6-3);x.stroke()}
   for(const px of[12,140]){x.fillStyle='#3e2114';x.fillRect(px,28,104,200);x.strokeStyle='rgba(0,0,0,.5)';x.lineWidth=5;x.strokeRect(px,28,104,200);x.strokeStyle='rgba(160,110,70,.12)';x.lineWidth=2;x.strokeRect(px+10,38,84,180)}
   x.fillStyle='rgba(0,0,0,.4)';x.beginPath();x.moveTo(0,256);for(let i=0;i<=256;i+=8)x.lineTo(i,166+Math.sin(i*.07)*6+R()*4);x.lineTo(256,256);x.fill();
   x.strokeStyle='rgba(150,120,80,.28)';x.lineWidth=2;x.beginPath();for(let i=0;i<=256;i+=8)x.lineTo(i,164+Math.sin(i*.07)*6);x.stroke()}),
  floor:hflCan(256,256,403,(x,R)=>{x.fillStyle='#4e1c1e';x.fillRect(0,0,256,256);for(let i=0;i<4000;i++){x.fillStyle=R()<.5?'rgba(15,4,4,.35)':'rgba(90,40,38,.18)';x.fillRect(R()*256,R()*256,1,2)}
   x.strokeStyle='rgba(20,6,6,.7)';x.lineWidth=6;x.strokeRect(12,12,232,232);x.strokeStyle='rgba(120,70,40,.22)';x.lineWidth=3;x.strokeRect(46,46,164,164);
   for(let i=0;i<6;i++){x.fillStyle='rgba(8,0,0,.35)';hflBlob(x,R,R()*256,R()*256,16+R()*30,12+R()*24,16);x.fill()}
   for(let i=0;i<4;i++){x.fillStyle='rgba(90,55,25,.18)';hflBlob(x,R,R()*256,R()*256,8+R()*14,6+R()*12,12);x.fill()}}),
  ceil:hflCan(256,256,404,(x,R)=>{x.fillStyle='#6e6050';x.fillRect(0,0,256,256);for(let i=0;i<1500;i++){x.fillStyle='rgba(0,0,0,'+R()*.12+')';x.fillRect(R()*256,R()*256,3,3)}
   for(const[cx,cy,r]of[[70,80,44],[190,170,56]]){for(let k=0;k<4;k++){x.strokeStyle='rgba(70,40,15,'+(.45-k*.08)+')';x.lineWidth=3;x.beginPath();x.ellipse(cx,cy,r*(1-k*.18),r*.8*(1-k*.18),.3,0,7);x.stroke()}x.fillStyle='rgba(60,35,12,.25)';x.beginPath();x.ellipse(cx,cy,r*.5,r*.4,.3,0,7);x.fill()}
   x.strokeStyle='rgba(20,15,10,.55)';x.lineWidth=1;let px=20,py=200;x.beginPath();x.moveTo(px,py);for(let i=0;i<20;i++){px+=6+R()*6;py+=R()*10-5;x.lineTo(px,py)}x.stroke();
   x.strokeStyle='#3a3026';x.lineWidth=5;x.strokeRect(0,0,256,256)}),
  door:hflDoorTex(405,'#521813','#260a07',(x,R)=>{for(let k=0;k<5;k++){const sx=R()*256;for(let i=0;i<10;i++){let g=x.createLinearGradient(0,0,0,120);g.addColorStop(0,'rgba(20,8,4,.5)');g.addColorStop(1,'rgba(20,8,4,0)');x.fillStyle=g;x.fillRect(sx+i,0,1,60+R()*60)}}})};
 return hflTX[f]=o}
/* a door like the game's dr(): plank lines and two panels, then the floor's own wear */
function hflDoorTex(seed,a,b,wear){return hflCan(256,256,seed,(x,R)=>{x.fillStyle=a;x.fillRect(0,0,256,256);x.strokeStyle=b;x.lineWidth=8;for(let i=0;i<256;i+=64){x.beginPath();x.moveTo(i,0);x.lineTo(i,256);x.stroke()}x.strokeRect(40,28,176,80);x.strokeRect(40,140,176,88);wear(x,R)})}

/* ---------- lamps ---------- */
const hflM={};const hflMat=(k,o)=>hflM[k]||(hflM[k]=new THREE.MeshStandardMaterial(o));
function hflCy(g,r0,r1,h,m,x,y,z,seg){const o=new THREE.Mesh(new THREE.CylinderGeometry(r0,r1,h,seg||12),m);o.position.set(x,y,z);g.add(o);return o}
/* returns {g, glow:[meshes that light up], at: y of the light below the fitting's top} — the top of the fitting is y 0,
   put it 1 cm into the ceiling (y = ceiling underside + .01). drop: extra rod for rooms taller than 4 m. */
function hflLamp(f,drop){drop=drop||0;const g=new THREE.Group(),glow=[];let at=-.4;
 if(drop>0)hflCy(g,.012,.012,drop+.02,hflMat('rod',{color:0x2a2a2a,roughness:.6,metalness:.4}),0,-drop/2,0,8);
 const d=-drop;
 if(f==2){/* an old glass bowl on a short rod, a brass rim, dead flies in the bottom */
  hflCy(g,.12,.12,.04,hflMat('brass2',{color:0x8a7040,roughness:.5,metalness:.5}),0,d-.01,0,20);
  hflCy(g,.012,.012,.26,hflMat('brass2'),0,d-.15,0,8);
  const bw=new THREE.Mesh(new THREE.SphereGeometry(.32,24,10,0,Math.PI*2,Math.PI/2,Math.PI/2),hflMat('bowl2',{color:0xe8d8b0,emissive:0x8a6a30,roughness:.4,side:THREE.DoubleSide,transparent:true,opacity:.92}));
  bw.scale.y=.45;bw.position.y=d-.28;g.add(bw);glow.push(bw);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(.32,.012,6,32),hflMat('brass2'));rim.rotation.x=Math.PI/2;rim.position.y=d-.28;g.add(rim);
  /* the three arms that hold the rim, from the rod's foot */
  for(let i=0;i<3;i++){const a=i*Math.PI*2/3,o=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,.31,6),hflMat('brass2'));o.position.set(Math.cos(a)*.16,d-.275,Math.sin(a)*.16);o.rotation.z=Math.PI/2;o.rotation.y=-a;g.add(o)}
  const fl=new THREE.Mesh(new THREE.CircleGeometry(.09,12),hflMat('flies',{color:0x1a140c,transparent:true,opacity:.5,depthWrite:false}));fl.rotation.x=Math.PI/2;fl.position.y=d-.28-.32*.45+.012;g.add(fl);
  at=d-.45}
 else if(f==3){/* a twin-tube strip light across the hall, like the game's lamp box */
  const hm=hflMat('strip',{color:0xe6e6e0,roughness:.5});const hb=new THREE.Mesh(new THREE.BoxGeometry(1.3,.06,.22),hm);hb.position.y=d-.03;g.add(hb);
  for(const sx of[-.64,.64]){const c=new THREE.Mesh(new THREE.BoxGeometry(.03,.05,.18),hflMat('stripEnd',{color:0xb8b8b2,roughness:.6}));c.position.set(sx,d-.08,0);g.add(c)}
  for(const sz of[-.05,.05]){const t=new THREE.Mesh(new THREE.CylinderGeometry(.017,.017,1.28,10),hflMat('tube',{color:0xf4f8ff,emissive:0xdcecff,roughness:.3}));t.rotation.z=Math.PI/2;t.position.set(0,d-.09,sz);g.add(t);glow.push(t)}
  at=d-.35}
 else if(f==4){/* a bare bulb on a cord */
  hflCy(g,.07,.07,.03,hflMat('rose4',{color:0x3a3228,roughness:.8}),0,d-.005,0,16);
  hflCy(g,.006,.006,.44,hflMat('cord4',{color:0x161210,roughness:.9}),0,d-.24,0,6);
  hflCy(g,.022,.026,.07,hflMat('hold4',{color:0x5a4a2a,roughness:.5,metalness:.5}),0,d-.495,0,12);
  const b=new THREE.Mesh(new THREE.SphereGeometry(.055,16,12),new THREE.MeshStandardMaterial({color:0xfff0d8,emissive:0xffb070,roughness:.3}));b.scale.y=1.25;b.position.y=d-.585;g.add(b);glow.push(b);
  at=d-.6}
 return{g,glow,at}}
/* floor 4's flicker: on most of the time, a short stutter every 4-9 s; each lamp has its own rhythm */
function hflFlick(s,t){const p=4+(((s*9301+49297)%233280)/233280)*5,u=(t+s*1.7)%p;if(u>.45)return 1;const k=Math.floor(u*28);return((k*7+s*3)%5<2)?.06:1}

/* ---------- dressing ---------- */
const hflWebT=()=>hflM.webT||(hflM.webT=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),R=hflRng(77);
 x.strokeStyle='rgba(225,225,215,.55)';x.lineWidth=1;const hx=64,hy=60;
 /* threads from the hub to the top and bottom edges (the ceiling and the wall), then rings */
 const ends=[];for(let i=0;i<7;i++)ends.push([14+i*16+R()*6,0]);for(let i=0;i<6;i++)ends.push([20+i*17+R()*6,128]);
 for(const[ex,ey]of ends){x.beginPath();x.moveTo(hx,hy);x.lineTo(ex,ey);x.stroke()}
 for(let r=.15;r<.95;r+=.12){x.beginPath();for(let i=0;i<=ends.length;i++){const[ex,ey]=ends[i%ends.length];x.lineTo(hx+(ex-hx)*r*(.9+R()*.2),hy+(ey-hy)*r*(.9+R()*.2))}x.stroke()}
 x.strokeStyle='rgba(225,225,215,.3)';for(let i=0;i<4;i++){x.beginPath();x.moveTo(R()*128,0);x.quadraticCurveTo(64,40+R()*50,R()*128,128);x.stroke()}
 const t=new THREE.CanvasTexture(c);return t})());
/* o: g (group), L, HX, HY, zA (z of the start wall's face, e.g. .95), zB (z of the end wall's face, e.g. -L-.95),
      occ (the game's wall slots [{s,z,h}]), open (wall openings [{s,z,g}]), seed (room number) */
function hflDress(f,o){const{g,HX,HY,zA,zB}=o,R=hflRng((o.seed||1)*7919+f*31),anims=[],xw=HX-.05,yc=HY-.05,occ=o.occ||[],open=o.open||[];
 const free=(s,z,h)=>!occ.some(q=>q.s==s&&Math.abs(q.z-z)<q.h+h)&&!open.some(q=>q.s==s&&Math.abs(q.z-z)<q.g+h)&&z<zA-h-.3&&z>zB+h+.3;
 if(f==2){/* cobwebs in the crease between wall and ceiling: a sheet at 45 degrees, its top edge on the ceiling, its bottom edge on the wall */
  const wm=new THREE.MeshBasicMaterial({map:hflWebT(),transparent:true,depthWrite:false,side:THREE.DoubleSide,fog:true});
  for(let z=zA-1.2;z>zB+.8;z-=2.6+R()*3){const s=R()<.5?-1:1,len=.7+R()*.6,a=.45+R()*.25,p=new THREE.Mesh(new THREE.PlaneGeometry(len,a*Math.SQRT2),wm);
   p.position.set(s*(xw-a/2),yc-a/2,z);p.rotation.order='YXZ';p.rotation.y=s*Math.PI/2;p.rotation.x=-Math.PI/4;g.add(p)}
  /* the four corners of the hall get a web each: one triangle across the corner */
  for(const[s,ze,dz]of[[-1,zA,-1],[1,zA,-1],[-1,zB,1],[1,zB,1]]){const a=.5+R()*.3,gm=new THREE.BufferGeometry(),P=[s*xw,yc,ze+dz*a, s*(xw-a),yc,ze, s*xw,yc-a,ze];
   gm.setAttribute('position',new THREE.Float32BufferAttribute(P,3));gm.setAttribute('uv',new THREE.Float32BufferAttribute([0,1,1,1,.5,0],2));gm.computeVertexNormals();g.add(new THREE.Mesh(gm,wm))}
  /* paper peeling off: a strip hinged at its top, curling away from the wall, with bare plaster behind it */
  const pm=hflMat('peel',{map:hflTex(2).wall,side:THREE.DoubleSide,roughness:.95}),plm=hflMat('plaster2',{color:0xc4bb9e,roughness:1});
  let n=0;for(let tries=0;tries<30&&n<4;tries++){const s=R()<.5?-1:1,z=zB+1+R()*(zA-zB-2),w=.3+R()*.25,h=.6+R()*.5,top=2.4+R()*(HY-2.9);if(!free(s,z,w/2+.2))continue;n++;
   const pl=new THREE.Mesh(new THREE.PlaneGeometry(w-.04,h*.82),plm);pl.position.set(s*(xw-.006),top-.08-h*.41,z);pl.rotation.y=-s*Math.PI/2;g.add(pl);
   const tx=pm.map.clone();tx.needsUpdate=true;tx.repeat.set(w/4,h/4);tx.offset.set(R(),R());const sm=new THREE.MeshStandardMaterial({map:tx,side:THREE.DoubleSide,roughness:.95});
   const gm=new THREE.PlaneGeometry(w,h,1,8),P=gm.attributes.position;for(let i=0;i<P.count;i++){const v=(h/2-P.getY(i))/h;P.setZ(i,v*v*.22)}gm.computeVertexNormals();
   const st=new THREE.Mesh(gm,sm);st.position.set(s*(xw-.014),top-h/2,z);st.rotation.y=-s*Math.PI/2;g.add(st)}}
 if(f==3){/* two pipes along one side of the ceiling (copper, and a lagged hot pipe with bands), bending up into the ceiling at each end, on hangers every 2 m */
  const s=R()<.5?-1:1,cu=hflMat('cu',{color:0xa8683e,roughness:.45,metalness:.5}),lag=hflMat('lag',{color:0xcfcfc6,roughness:.9}),band=hflMat('band',{color:0x9aa0a4,roughness:.4,metalness:.5}),rod=hflMat('rod3',{color:0x5a5e60,roughness:.5,metalness:.5});
  const z0=zA-.6,z1=zB+.6,ln=z0-z1,zc=(z0+z1)/2;
  for(const[x,r,m,y]of[[s*(HX-.4),.045,cu,yc-.24],[s*(HX-.72),.075,lag,yc-.28]]){const p=hflCy(g,r,r,ln,m,x,y,zc,14);p.rotation.x=Math.PI/2;
   const rb=.16;for(const[ze,dz]of[[z0,1],[z1,-1]]){const el=new THREE.Mesh(new THREE.TorusGeometry(rb,r,10,12,Math.PI/2),m);el.position.set(x,y+rb,ze);el.rotation.y=-Math.PI/2;el.rotation.z=dz>0?-Math.PI/2:Math.PI;g.add(el);
    hflCy(g,r,r,yc-(y+rb)+.03,m,x,(y+rb+yc+.03)/2,ze+dz*rb,14)}
   for(let z=z0-1;z>z1+.5;z-=2){hflCy(g,.008,.008,yc-(y+r)+.02,rod,x,(yc+.02+y+r)/2,z,6);const cl=new THREE.Mesh(new THREE.TorusGeometry(r+.008,.008,6,16),band);cl.position.set(x,y,z);g.add(cl)}
   if(m==lag)for(let z=z0-2;z>z1+.5;z-=2){const b=hflCy(g,r+.009,r+.009,.05,band,x,y,z,14);b.rotation.x=Math.PI/2}}
  /* staff signs on free bits of wall */
  const T=['STAFF ONLY','SERVICE CORRIDOR','LINEN ROOM →','NO GUESTS\nBEYOND THIS POINT','KEEP THIS\nDOOR CLEAR','WASH YOUR HANDS'];let n=0;
  for(let tries=0;tries<30&&n<3;tries++){const s=R()<.5?-1:1,z=zB+1.5+R()*(zA-zB-3);if(!free(s,z,.6))continue;hflSign(g,s*(xw),2.15,z,-s*Math.PI/2,T[(R()*T.length)|0]);n++}}
 if(f==4){/* puddles, each under a stain on the ceiling with a drip falling into it */
  const wm=hflMat('pud',{color:0x140806,roughness:.04,metalness:.3,transparent:true,opacity:.85}),stm=hflMat('stain4',{color:0x2a1608,transparent:true,opacity:.55,depthWrite:false}),dm=hflMat('drop',{color:0xc8d0d8,roughness:.1,transparent:true,opacity:.7});
  const n=2+(R()*3|0);for(let i=0;i<n;i++){const z=zB+1.5+R()*(zA-zB-3),x=(R()*2-1)*(HX-1.6),rx=.4+R()*.6,rz=.3+R()*.5,sh=new THREE.Shape();
   for(let k=0;k<=24;k++){const a=k/24*Math.PI*2,q=.8+R()*.3,px=Math.cos(a)*rx*q,pz=Math.sin(a)*rz*q;k?sh.lineTo(px,pz):sh.moveTo(px,pz)}
   const pd=new THREE.Mesh(new THREE.ShapeGeometry(sh),wm);pd.rotation.x=-Math.PI/2;pd.position.set(x,.012,z);g.add(pd);
   const st=new THREE.Mesh(new THREE.CircleGeometry(Math.max(rx,rz)*.8,20),stm);st.rotation.x=Math.PI/2;st.position.set(x,yc-.012,z);g.add(st);
   const dp=new THREE.Mesh(new THREE.SphereGeometry(.018,8,6),dm);dp.scale.y=1.6;g.add(dp);
   const rp=new THREE.Mesh(new THREE.RingGeometry(.9,1,24),hflMat('ripple',{color:0x8a7a70,transparent:true,opacity:.5,depthWrite:false}));rp.rotation.x=-Math.PI/2;rp.position.set(x,.021,z);g.add(rp);
   const per=1.4+R()*2,off=R()*per,fall=Math.sqrt(2*(yc-.03)/9.8);
   anims.push((dt,t)=>{const u=(t+off)%per;if(u<fall){dp.visible=true;dp.position.set(x,yc-.03-4.9*u*u,z);rp.visible=false}else{dp.visible=false;const v=(u-fall)/.6;rp.visible=v<1;rp.scale.setScalar(.03+v*.25);rp.material.opacity=.5*(1-v)}})}}
 return{anims}}
/* a staff sign: a plate set 5 mm into the wall, the words 1 cm in front of it */
function hflSign(g,x,y,z,ry,txt){const lines=txt.split('\n'),w=1.0,h=lines.length>1?.42:.26;const sg=new THREE.Group();sg.position.set(x,y,z);sg.rotation.y=ry;g.add(sg);
 const pl=new THREE.Mesh(new THREE.BoxGeometry(w+.04,h+.04,.03),hflMat('signP',{color:0x2a5a3a,roughness:.6}));pl.position.z=.01;sg.add(pl);
 const c=document.createElement('canvas');c.width=256;c.height=Math.round(256*h/w);const x2=c.getContext('2d');x2.fillStyle='#e8e4d4';x2.fillRect(0,0,c.width,c.height);x2.fillStyle='#1e4a2c';x2.fillRect(4,4,c.width-8,c.height-8);
 x2.fillStyle='#f4f0e0';x2.textAlign='center';x2.textBaseline='middle';let fs=34;const fit=()=>{x2.font='bold '+fs+'px DoorsSans,Arial,sans-serif';return lines.every(l=>x2.measureText(l).width<224)};while(!fit()&&fs>12)fs--;lines.forEach((l,i)=>x2.fillText(l,128,c.height/2+(i-(lines.length-1)/2)*fs*1.1));
 const lb=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(c),roughness:.7}));lb.position.z=.035;sg.add(lb);return sg}
