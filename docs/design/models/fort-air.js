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
