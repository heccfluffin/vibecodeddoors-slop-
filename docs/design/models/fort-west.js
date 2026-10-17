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
