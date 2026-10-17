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

function fbHangarSkin(g){const k=fbKit(),{B,C,rod,L,slab}=k.H(g),M=k.M;const HX0=325,HX1=425,HZ0=-718,HZ1=-670,HH=9,O=.02;const CL=k.M(0x7c8070,{roughness:.6,metalness:.3});CL.map=k.CORR.map;CL.userData.s=.5;Object.assign(CL,{polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-4});
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
 const piv=new THREE.Group();piv.position.set(HX,HY,SZ);g.add(piv);const P=k.H(piv);const LR=4.95,lc=-(HX-SX);/* lid centre, relative to the hinge */
 P.C(LR,LR,.6,lc,-.1,0,M(0x5e6266,{roughness:.6,metalness:.4}),null,null,48);P.C(LR+.06,LR+.06,.12,lc,-.36,0,k.DK,null,null,48);
 {const RS=LR/Math.sin(.32),cap=new THREE.Mesh(new THREE.SphereGeometry(RS,40,6,0,Math.PI*2,0,.32),M(0x6a6e72,{roughness:.6,metalness:.35}));cap.position.set(lc,.2-RS*Math.cos(.32),0);piv.add(cap)}
 const rim=new THREE.Mesh(new THREE.RingGeometry(LR-.7,LR-.05,48),M(0xffffff,Object.assign({map:k.HAZ.map,roughness:.6},k.PO)));rim.rotation.x=-Math.PI/2;rim.position.set(lc,.205,0);piv.add(rim);
 for(let i=0;i<8;i++){const a=i/8*Math.PI*2,r0=1.6,r1=LR-.8;const rb=P.B(r1-r0,.12,.18,lc+Math.cos(a)*(r0+r1)/2,.25,Math.sin(a)*(r0+r1)/2,k.STL);rb.rotation.y=-a}
 P.C(1.2,1.2,.16,lc,.28,0,k.STL,null,null,24);{const st=k.lab('SILO 1',2.6,.8,null,'#e8e0c8',200);st.rotation.set(-Math.PI/2,0,Math.PI/2);st.position.set(lc+3.0,.24,0);piv.add(st)}
 for(const dz of[-1.9,1.9])P.B(2.2,.5,.7,-1.0,-.05,dz,k.STL);/* hinge arms joining the lid to the knuckles */
 /* rams: from the collar beside the hinge up to the lid's underside */const RM=M(0x2a2c30,{metalness:.5,roughness:.4}),RC=k.STL2,rams=[];for(const dz of[-3.3,3.3]){const base=new THREE.Vector3(HX+1.1,AH+.1,SZ+dz);B(.6,.3,.6,base.x,AH+.15,base.z,k.DK);const body=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,1,10),RM),rodm=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,1,8),RC);g.add(body);g.add(rodm);rams.push({base,body,rodm,att:new THREE.Vector3(-2.2,-.3,dz)})}
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
