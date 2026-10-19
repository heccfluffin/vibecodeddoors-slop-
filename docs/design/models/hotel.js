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
  for(const sx of[-.64,.64]){const c=new THREE.Mesh(new THREE.BoxGeometry(.03,.065,.18),hflMat('stripEnd',{color:0xb8b8b2,roughness:.6}));c.position.set(sx,d-.0875,0);g.add(c)}
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

/* ================= the elevator break (hotel-loop.md B2) =================
   The lift lobby is rooms 25, 51 and 75. It has the look of the floor you are leaving (the floor-look swaps above),
   a marble floor, a vending machine, the next-floor board, a bench, a plant and the guest book (the game saves there).
   The lift is a THROUGH car: you walk in at the front, the front doors close, the ride plays, and the BACK doors open
   onto the next floor's first room. Nothing actually moves: the car shakes and the dials turn.

   hflLift(o)   the lift unit. Local origin = the middle of the room's end-wall plane on the floor (the game's (DX,0,ez)),
                the lobby is towards +z. It builds the front wall across the room at z = HFLD (with the landing doors,
                the call buttons, the dial and two sconces), the shaft, the car, and the back landing doors in the
                room's own end-wall hole (1.6 x 3 m, where the exit door normally goes).
                o = {HX, HY, mat(key,a,b) -> material for 'wall'/'wains', col(c) -> trim colour, from, to}
                returns {g, car, set(t) (0..1 door/ride state helpers below), ...}
   hflVend(), hflBoard(next), hflBook(), hflBench(), hflPlant(dead), hflSconce()   the lobby things (back on z 0, facing +z)
   hflMarbleT()  the lobby floor texture (2 m x 2 m tile)                                                         */
const HFLD=2.6;
function hflB(g,w,h,d,m,x,y,z){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);g.add(o);return o}
function hflMarbleT(){return hflM.marbleT||(hflM.marbleT=hflCan(256,256,501,(x,R)=>{for(let r=0;r<4;r++)for(let c=0;c<4;c++){const dk=(r+c)%2;x.fillStyle=dk?'#243c34':'#bdb59f';x.fillRect(c*64,r*64,64,64);
   x.strokeStyle=dk?'rgba(170,200,180,.35)':'rgba(120,110,95,.35)';x.lineWidth=1;for(let k=0;k<3;k++){x.beginPath();let px=c*64+R()*64,py=r*64;x.moveTo(px,py);for(let i=0;i<8;i++){px+=R()*14-7;py+=8+R()*2;x.lineTo(Math.max(c*64,Math.min(c*64+64,px)),Math.min(r*64+64,py))}x.stroke()}}
  x.fillStyle='#9a8a60';for(let i=0;i<=256;i+=64){x.fillRect(i-1,0,2,256);x.fillRect(0,i-1,256,2)}},300))}
/* car walls inside: dark wood panels under a brass rail line, plain upper panels */
function hflCarT(){return hflM.carT||(hflM.carT=hflCan(256,256,502,(x,R)=>{x.fillStyle='#4a2e1a';x.fillRect(0,0,256,256);for(let i=0;i<50;i++){x.strokeStyle='rgba(20,10,4,.3)';x.beginPath();const y=R()*256;x.moveTo(0,y);x.lineTo(256,y+R()*4-2);x.stroke()}
  for(const px of[10,134]){x.fillStyle='#5a3820';x.fillRect(px,14,112,228);x.strokeStyle='rgba(0,0,0,.45)';x.lineWidth=3;x.strokeRect(px,14,112,228);x.strokeStyle='rgba(220,170,100,.22)';x.lineWidth=1;x.strokeRect(px+7,21,98,214)}},300))}
/* a canvas plane: draw(ctx,w,h) now, and again with redraw() */
function hflPlane(g,w,h,pw,ph,draw,emis){const c=document.createElement('canvas');c.width=pw;c.height=ph;const x=c.getContext('2d'),t=new THREE.CanvasTexture(c);
 const m=new THREE.MeshStandardMaterial({map:t,roughness:.6,transparent:true,alphaTest:.5,emissive:emis?0xffffff:0,emissiveMap:emis?t:null,emissiveIntensity:emis||0});const p=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m);g.add(p);
 p.userData.redraw=(...a)=>{x.clearRect(0,0,pw,ph);draw(x,pw,ph,...a);t.needsUpdate=true};p.userData.redraw();return p}
/* the half-moon floor dial above a landing door: brass, floors 1-4, a needle (rotation.z: 1 = left .. 4 = right) */
function hflDial(g){const d=new THREE.Group();g.add(d);const br=hflMat('brassL',{color:0xb08a40,roughness:.35,metalness:.5});
 const face=hflPlane(d,.84,.42,256,128,(x,w,h)=>{x.fillStyle='#e8dcb8';x.beginPath();x.arc(128,126,120,Math.PI,0);x.fill();x.strokeStyle='#5a4420';x.lineWidth=4;x.stroke();
  x.fillStyle='#2a2010';x.font='bold 26px DoorsSans,Arial,sans-serif';x.textAlign='center';x.textBaseline='middle';for(let i=1;i<=4;i++){const a=Math.PI-(i-1)/3*Math.PI*.8-Math.PI*.1;x.fillText(String(i),128+Math.cos(a)*92,126-Math.sin(a)*92)}
  x.beginPath();x.arc(128,126,14,0,7);x.fill()});face.geometry.translate(0,.21,0);face.position.z=.012;
 const rim=new THREE.Mesh(new THREE.TorusGeometry(.43,.015,6,24,Math.PI),br);rim.position.z=.01;d.add(rim);hflB(d,.9,.03,.05,br,0,0,.02);
 const nd=new THREE.Group();nd.position.z=.022;d.add(nd);const n=hflB(nd,.012,.3,.006,hflMat('needle',{color:0x1a1408,roughness:.5}),0,.15,0);
 d.userData.set=fl=>{nd.rotation.z=Math.PI*.4-(fl-1)/3*Math.PI*.8};d.userData.set(1);return d}
/* one leaf of a sliding door pair: brass-edged steel */
function hflLeaf(g,w,h,t,m){const l=new THREE.Group();g.add(l);hflB(l,w,h,t,m,0,h/2,0);hflB(l,.015,h+.02,t+.02,hflMat('brassL'),w/2-.0115,h/2,0);return l}
function hflLift(o){const{HX,HY}=o,D=HFLD,g=new THREE.Group(),br=hflMat('brassL',{color:0xb08a40,roughness:.35,metalness:.5}),st=hflMat('liftSteel',{color:0x6a6e72,roughness:.55,metalness:.45}),dk=hflMat('shaft',{color:0x1c1c1e,roughness:1});
 const col=o.col||(c=>c),tex=o.mat;
 /* the front wall across the room, with a 1.6 x 3 m hole, the lobby trim on its lobby face */
 const tp=(sx,ins,x0,h,d,m,y,z)=>{const x1=HX-ins,w=x1-x0;hflB(g,w,h,d,m(w),sx*(x0+x1)/2,y,z)};
 for(const sx of[-1,1]){tp(sx,0,.8,HY,.1,w=>tex('wall',w/4,HY/2),HY/2,D);tp(sx,.08,.8,1,.06,w=>tex('wains',w/1.2,1),.5,D+.08);
  tp(sx,.105,.79,.07,.07,()=>hflMat('t'+col(0x6e4326),{color:col(0x6e4326)}),1.03,D+.1);tp(sx,.11,.785,.14,.08,()=>hflMat('t'+col(0x2a1608),{color:col(0x2a1608)}),.07,D+.09)}
 hflB(g,1.6,HY-3,.1,tex('wall',.4,(HY-3)/2),0,(3+HY)/2,D);hflB(g,2*HX-.2,.14,.08,hflMat('t'+col(0xd8c8a8),{color:col(0xd8c8a8)}),0,HY-.07,D+.09);
 /* a portal in a 1.6 x 3 m hole: dark wood around a 1.2 x 2.4 opening, a brass frame, the dial, landing doors behind */
 const portal=(z,s)=>{const P=new THREE.Group();P.position.z=z;P.rotation.y=s>0?0:Math.PI;g.add(P);const wd=hflMat('portalWd',{color:0x3a2414,roughness:.7});
  hflB(P,.2,3,.1,wd,-.7,1.5,0);hflB(P,.2,3,.1,wd,.7,1.5,0);hflB(P,1.2,.6,.1,wd,0,2.7,0);
  for(const sx of[-1,1])hflB(P,.07,2.45,.13,br,sx*.625,1.225,0);hflB(P,1.34,.07,.14,br,0,2.425,0);
  hflB(P,1.3,.012,.18,st,0,.006,-.02);
  const dial=hflDial(P);dial.position.set(0,2.5,.05);
  const lv=[];for(const sx of[-1,1]){const l=hflLeaf(P,.62,2.4,.03,st);l.position.set(sx*.31,.012,-.08);if(sx>0)l.children[1].position.x=-l.children[1].position.x;lv.push(l)}
  return{P,dial,lv}};
 const front=portal(D,1),back=portal(0,-1);
 /* the shaft: side walls and a lid over the car, all dark */
 for(const sx of[-1,1])hflB(g,.05,HY,D-.1,dk,sx*1.32,HY/2,D/2);hflB(g,2.6,.05,D-.1,dk,0,3.05,D/2);
 /* the car */
 const car=new THREE.Group();g.add(car);const cw=hflMat('carW',{map:hflCarT(),roughness:.8}),cf=hflMat('carF',{color:0x3a1418,roughness:1}),cc=hflMat('carC',{color:0xd8d0b8,roughness:.8});
 hflB(car,2.1,.08,D-.24,cf,0,-.02,D/2);for(const[z0,z1]of[[.11,.2],[D-.2,D-.11]])hflB(car,1.3,.05,z1-z0-.01,st,0,.005,(z0+z1)/2);
 for(const sx of[-1,1])hflB(car,.05,2.7,D-.4,cw,sx*1.025,1.37,D/2);hflB(car,2.1,.06,D-.24,cc,0,2.75,D/2);
 const lp=hflB(car,1.4,.04,D-1.2,hflMat('carLamp',{color:0xfff4e0,emissive:0xe8d4b0,roughness:.5}),0,2.71,D/2);
 for(const[zc,s]of[[.18,1],[D-.18,-1]]){for(const sx of[-1,1])hflB(car,.45,2.7,.04,cw,sx*.825,1.37,zc);hflB(car,1.2,.37,.04,cw,0,2.535,zc)}
 /* brass handrails on the side walls, on short brackets */
 for(const sx of[-1,1]){const r=hflCy(car,.02,.02,D-1,br,sx*.93,.95,D/2,10);r.rotation.x=Math.PI/2;for(const z of[.7,D-.7]){const b=hflCy(car,.012,.012,.08,br,sx*.965,.95,z,8);b.rotation.z=Math.PI/2}}
 /* the car doors, front and back */
 const cdoor=z=>{const lv=[];for(const sx of[-1,1]){const l=hflLeaf(car,.62,2.33,.03,st);l.position.set(sx*.31,.03,z);if(sx>0)l.children[1].position.x=-l.children[1].position.x;lv.push(l)}return lv};
 const cdF=cdoor(D-.13),cdB=cdoor(.13);
 /* the button panel inside, right of the front door; and a display over each car door */
 const cop=hflPlane(car,.18,.5,64,176,(x,w,h,at,to)=>{x.fillStyle='#2a2a2c';x.fillRect(0,0,w,h);x.fillStyle='#101010';x.fillRect(8,6,48,24);x.fillStyle='#ff9a30';x.font='bold 20px monospace';x.textAlign='center';x.textBaseline='middle';x.fillText(String(at||1),32,19);
  for(let i=4;i>=1;i--){const y=44+(4-i)*32;x.beginPath();x.arc(32,y,12,0,7);x.fillStyle=i==to?'#ffd070':'#b8b0a0';x.fill();x.fillStyle='#202020';x.font='bold 15px monospace';x.fillText(String(i),32,y+1)}},1);
 cop.position.set(.75,1.3,D-.212);cop.rotation.y=Math.PI;
 hflB(car,.22,.54,.02,br,.75,1.3,D-.195);
 const disp=[];for(const[z,ry]of[[D-.212,Math.PI],[.212,0]]){const p=hflPlane(car,.3,.12,128,52,(x,w,h,at,dir)=>{x.fillStyle='#0c0c0c';x.fillRect(0,0,w,h);x.fillStyle='#ff9a30';x.font='bold 36px monospace';x.textAlign='center';x.textBaseline='middle';x.fillText((dir>0?'▲ ':dir<0?'▼ ':'')+(at||1),64,28)},1);p.position.set(0,2.52,z);p.rotation.y=ry;disp.push(p)}
 /* the call buttons and two sconces on the lobby side */
 const cb=new THREE.Group();cb.position.set(1.1,1.3,D+.05);g.add(cb);hflB(cb,.14,.3,.02,br,0,0,.005);const up=hflCy(cb,.03,.03,.02,hflMat('btn',{color:0xe8e0c8,emissive:0,roughness:.4}),0,.06,.02,16);up.rotation.x=Math.PI/2;const dn=hflCy(cb,.03,.03,.02,hflMat('btn'),0,-.06,.02,16);dn.rotation.x=Math.PI/2;up.material=up.material.clone();
 const sc=[];for(const sx of[-1.6,1.6]){const s=hflSconce();s.g.position.set(sx,2.15,D+.05);g.add(s.g);sc.push(s)}
 return{g,car,lamp:lp,front,back,cdF,cdB,cop,disp,call:up,sconces:sc,
  /* doors: 0 shut .. 1 open, for one side ('f' or 'b'), car and landing together */
  doors(side,k){const L=side=='f'?front.lv:back.lv,Cd=side=='f'?cdF:cdB;L.forEach((l,i)=>{const sx=i?1:-1;l.position.x=sx*(.31+.61*k)});Cd.forEach((l,i)=>{const sx=i?1:-1;l.position.x=sx*(.31+.61*k)})},
  show(at,to,dir){cop.userData.redraw(at,to);disp.forEach(p=>p.userData.redraw(at,dir));front.dial.userData.set(at);back.dial.userData.set(at)}}}
function hflSconce(){const g=new THREE.Group(),br=hflMat('brassL');hflB(g,.12,.2,.02,br,0,0,.005);const a=hflCy(g,.012,.012,.12,br,0,-.02,.07,8);a.rotation.x=Math.PI/2;
 const sh=new THREE.Mesh(new THREE.CylinderGeometry(.06,.1,.16,16,1,true),hflMat('shade',{color:0xf0e0c0,emissive:0xc89040,side:THREE.DoubleSide,roughness:.6}));sh.position.set(0,.06,.13);g.add(sh);
 const cup=hflCy(g,.03,.03,.04,br,0,-.04,.13,10);return{g,glow:sh}}
/* the vending machine (gold): 1 m wide, 1.9 m tall, .8 m deep; back on z 0 */
function hflVend(){const g=new THREE.Group(),body=hflMat('vendB',{color:0x5a1420,roughness:.5,metalness:.3}),gd=hflMat('gold',{color:0xc8a040,roughness:.35,metalness:.5});
 hflB(g,1,1.86,.78,body,0,.95,.39);for(const sx of[-1,1])hflB(g,.06,.04,.7,hflMat('vendFt',{color:0x1a1a1a}),sx*.42,.02,.39);
 const win=hflPlane(g,.62,1.1,160,284,(x,w,h)=>{x.fillStyle='#1c1410';x.fillRect(0,0,w,h);const it=[['#e04030','#f0c040'],['#3070d0','#f0f0f0'],['#40a040','#202020'],['#f0a020','#802010'],['#a040c0','#f0e0ff']];
  for(let r=0;r<5;r++){x.fillStyle='#8a8a8a';x.fillRect(4,r*56+50,w-8,3);for(let c=0;c<4;c++){const[a,b]=it[(r+c)%5],cx=12+c*37;x.fillStyle=a;x.fillRect(cx,r*56+12,26,38);x.fillStyle=b;x.fillRect(cx+4,r*56+20,18,8);x.fillStyle='#f0e0b0';x.font='9px monospace';x.fillText(String.fromCharCode(65+r)+(c+1),cx+6,r*56+55)}}},.55);
 win.position.set(-.13,1.08,.806);hflB(g,.66,1.14,.02,gd,-.13,1.08,.785);
 const pnl=hflPlane(g,.24,.62,64,166,(x,w,h)=>{x.fillStyle='#2a0a10';x.fillRect(0,0,w,h);x.fillStyle='#f0c040';x.font='bold 14px DoorsSans,Arial,sans-serif';x.textAlign='center';x.fillText('GOLD',32,22);x.fillText('ONLY',32,38);
  x.fillStyle='#101010';x.fillRect(22,48,20,30);x.fillStyle='#c8a040';x.fillRect(30,52,4,22);for(let r=0;r<4;r++)for(let c=0;c<3;c++){x.fillStyle='#d8d0c0';x.fillRect(10+c*16,90+r*17,12,12)}});
 pnl.position.set(.33,1.2,.792);
 const top=hflPlane(g,.92,.2,256,56,(x,w,h)=>{x.fillStyle='#c8a040';x.fillRect(0,0,w,h);x.fillStyle='#3a0a12';x.font='bold 34px DoorsSans,Arial,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('SNAX · GOLD',128,30)},.35);top.position.set(0,1.76,.792);
 hflB(g,.6,.2,.02,hflMat('flap',{color:0x161616,roughness:.6}),-.13,.38,.785);hflB(g,.64,.03,.03,gd,-.13,.49,.795);
 return{g,glow:win}}
/* the next-floor board: 2.2 x 1.4 m, a wood frame, cream card */
function hflBoard(next){const g=new THREE.Group(),F=HFL[next]||HFL[2];hflB(g,2.24,1.44,.04,hflMat('boardFr',{color:0x3a2210,roughness:.6}),0,0,.015);
 const LIVE={2:'Rush · Screech · Ambush · Seek · Halt',3:'Seek · Timothy in the drawers · more stairwells',4:'Everything · Eyes · more fake doors'};
 const p=hflPlane(g,2.08,1.28,416,256,(x,w,h)=>{x.fillStyle='#ece2c4';x.fillRect(0,0,w,h);x.strokeStyle='#8a6a30';x.lineWidth=3;x.strokeRect(10,10,w-20,h-20);x.fillStyle='#4a3418';x.textAlign='center';x.textBaseline='middle';
  x.font='bold 22px DoorsSans,Arial,sans-serif';x.fillText('NEXT FLOOR',w/2,40);x.font='bold 44px DoorsSans,Arial,sans-serif';x.fillStyle='#2a1a08';x.fillText(next+' · '+F.n.toUpperCase(),w/2,96);
  x.font='24px DoorsSans,Arial,sans-serif';x.fillStyle='#4a3418';x.fillText(F.sub,w/2,140);x.fillRect(w/2-90,166,180,2);x.font='bold 18px DoorsSans,Arial,sans-serif';x.fillText('WHAT LIVES THERE',w/2,190);x.font='21px DoorsSans,Arial,sans-serif';x.fillText(LIVE[next]||'',w/2,222)});p.position.z=.046;
 return{g}}
/* the guest book on a lectern with a little brass lamp (green once the game has saved) */
function hflBook(){const g=new THREE.Group(),wd=hflMat('lect',{color:0x4a2a14,roughness:.6}),br=hflMat('brassL');
 hflB(g,.5,.04,.4,wd,0,.02,0);hflB(g,.12,1.0,.12,wd,0,.54,0);const top=new THREE.Group();top.position.set(0,1.08,0);top.rotation.x=.3;g.add(top);hflB(top,.6,.04,.44,wd,0,0,0);hflB(top,.58,.04,.04,wd,0,.03,.215);
 const bR=hflRng(55),bk=hflPlane(top,.48,.32,128,86,(x,w,h)=>{x.fillStyle='#f0e8d4';x.fillRect(0,0,w,h);x.fillStyle='#6a4a2a';x.fillRect(62,0,4,h);x.strokeStyle='rgba(40,40,80,.55)';x.lineWidth=1;for(let i=0;i<8;i++){const y=14+i*9;x.beginPath();x.moveTo(8,y);x.lineTo(8+20+bR()*30,y);x.stroke();x.beginPath();x.moveTo(72,y);x.lineTo(80+bR()*36,y);x.stroke()}});
 bk.rotation.x=-Math.PI/2;bk.position.y=.05;hflB(top,.5,.02,.34,hflMat('bookC',{color:0x5a1418}),0,.03,0);
 const ar=hflCy(top,.008,.008,.22,br,.26,.13,-.16,6);const sh=new THREE.Mesh(new THREE.SphereGeometry(.05,12,8,0,Math.PI*2,0,Math.PI/2),new THREE.MeshStandardMaterial({color:0x2a6a3a,emissive:0x0,roughness:.4,side:THREE.DoubleSide}));sh.position.set(.26,.24,-.16);top.add(sh);
 return{g,glow:sh}}
function hflBench(){const g=new THREE.Group(),wd=hflMat('benchW',{color:0x5a3a20,roughness:.6}),ir=hflMat('benchI',{color:0x1e1e1e,roughness:.6,metalness:.4});
 for(let i=0;i<4;i++)hflB(g,1.6,.03,.09,wd,0,.45,.12+i*.11);for(let i=0;i<3;i++)hflB(g,1.6,.09,.03,wd,0,.62+i*.12,.03);
 for(const sx of[-.7,.7]){hflB(g,.04,.44,.04,ir,sx,.22,.5);hflB(g,.04,.88,.04,ir,sx,.44,.02);hflB(g,.03,.04,.52,ir,sx,.41,.27)}return{g}}
function hflPlant(dead){const g=new THREE.Group(),pot=hflCy(g,.22,.17,.45,hflMat('pot',{color:0x8a4a2a,roughness:.8}),0,.225,0,20);hflCy(g,.2,.2,.02,hflMat('soil',{color:0x2a1c10}),0,.43,0,20);
 const lm=hflMat(dead?'leafD':'leaf',{color:dead?0x6a5a30:0x2f6a32,roughness:.8,side:THREE.DoubleSide}),R=hflRng(dead?9:8);
 for(let i=0;i<9;i++){const a=i/9*Math.PI*2+R()*.3,len=.5+R()*.3,lf=new THREE.Mesh(new THREE.PlaneGeometry(.12,len,1,4),lm),P=lf.geometry.attributes.position;
  for(let k=0;k<P.count;k++){const v=(P.getY(k)+len/2)/len;P.setZ(k,-v*v*(dead?.45:.22));P.setX(k,P.getX(k)*(1-v*.7))}lf.geometry.translate(0,len/2,0);lf.geometry.computeVertexNormals();
  const p=new THREE.Group();p.position.set(Math.cos(a)*.06,.43,Math.sin(a)*.06);p.rotation.y=-a+Math.PI/2;g.add(p);lf.rotation.x=dead?-.9:-.45;p.add(lf)}return{g}}
