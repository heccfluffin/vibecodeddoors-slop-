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
  x.fillStyle='#e8d890';x.font='bold 46px '+k.FONT;x.textAlign='center';const ring=(s,r,a0,dir)=>{const n=s.length;for(let i=0;i<n;i++){const a=a0+dir*(i-(n-1)/2)*.15;x.save();x.translate(256+Math.cos(a)*r,256+Math.sin(a)*r);x.rotate(a+(dir>0?-Math.PI/2:Math.PI/2));x.fillText(s[i],0,16);x.restore()}};ring('13TH ARMOURED',193,-Math.PI/2,1);ring('FORT BLACKOUT',193,Math.PI/2,-1);
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
