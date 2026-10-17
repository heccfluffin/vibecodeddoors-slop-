/* =====================================================================================================
   mkPoliceHeli(): the Desert PD patrol helicopter, remodelled. Replaces the first mkHeli() in bak519 (the police one,
   ~line 2834; the military mkHeli(K) further down is a different thing and is not touched). Needs heliKit (helis.js).
   A light patrol helicopter: one smooth egg-shaped cabin (a single mesh, its paint, windows and lettering all on one
   texture, so nothing floats or flickers), a glass nose, door and rear windows you can see the crew through, an
   engine fairing with a light bar, a slim tail boom with stabiliser, fin and tail rotor, skids with steps, and a
   searchlight on a yoke under the nose. Navy over white, a yellow checker band, DARK POLICE on both doors.
   ORIGIN  centre on the ground (skids touch y 0). FRONT -z. Same size and hook spots as the old one:
   HOOKS   userData = {mr, tr, spG, cone, cm, pool, pm, bea, sk}, exactly as heliTick (bak519:2881) uses them:
     mr   main rotor Group at (0, 3.15, 0), spins on y        tr   tail rotor Group at (.14, 2.4, 5.6), spins on x
     spG  searchlight beam Group at (0, .8, -1.2) with cone/cm, and pool/pm (the light pool, added to the world by the game)
     bea  [red, blue] light bar meshes: the game sets material.emissive    sk   the pilot (mkCopSeek(.42) at (0, 1.05, -.6))
   ===================================================================================================== */
function mkPoliceHeli(){const g=new THREE.Group(),K=heliKit(g),{M,BX,CYL,rod,ext,plan,decal,lite}=K;
 const NVc='#16224c',WHc='#ecebe6',YLc='#e8c020';
 const NV=M(0x16224c,{roughness:.35,metalness:.35}),WH=M(0xecebe6,{roughness:.35,metalness:.2}),DK=M(0x1a1c20,{roughness:.6}),MT=M(0x5a5e64,{metalness:.75,roughness:.35}),SEAT=M(0x2a2c30,{roughness:.8});
 const GL=new THREE.MeshStandardMaterial({color:0x9ab8cc,transparent:true,opacity:.28,roughness:.05,metalness:.5,side:THREE.DoubleSide,depthWrite:false});
 const TN=new THREE.MeshStandardMaterial({color:0x1c2836,transparent:true,opacity:.62,roughness:.08,metalness:.5,side:THREE.DoubleSide,depthWrite:false});
 /* ---- the cabin shell: superellipse sections on a smooth spline through key stations. The mesh grid is laid so
    every window edge falls on a grid line, so the glass edges are clean curves, not steps ---- */
 const KS=[[-2.08,.02,.02,1.37],[-1.95,.7,.72,1.43],[-1.65,1.22,1.22,1.52],[-1.15,1.56,1.5,1.6],[-.45,1.72,1.62,1.66],[.5,1.72,1.6,1.68],[1.2,1.54,1.38,1.77],[1.75,1.02,.9,1.91],[2.25,.5,.46,2.02]];
 const E=2/2.4,Z0=KS[0][0],Z1=KS[KS.length-1][0];
 /* Catmull-Rom through the stations (z is the parameter) */
 const stAt=z=>{let k=0;while(k<KS.length-2&&z>KS[k+1][0])k++;const A=KS[k],B=KS[k+1],f=(z-A[0])/(B[0]-A[0]),P0=KS[Math.max(0,k-1)],P3=KS[Math.min(KS.length-1,k+2)];
  const r=[z];for(let c=1;c<4;c++){const m0=(B[c]-P0[c])/(B[0]-P0[0])*(B[0]-A[0]),m1=(P3[c]-A[c])/(P3[0]-A[0])*(B[0]-A[0]);const f2=f*f,f3=f2*f;r.push((2*f3-3*f2+1)*A[c]+(f3-2*f2+f)*m0+(-2*f3+3*f2)*B[c]+(f3-f2)*m1)}return r};
 const pt=(s,a)=>{const c=Math.cos(a),si=Math.sin(a);return[s[1]/2*Math.sign(c)*Math.pow(Math.abs(c),E),s[3]+s[2]/2*Math.sign(si)*Math.pow(Math.abs(si),E),s[0]]};
 /* the openings, in angle (0 = right side, pi/2 = top) and z */
 const NZ=-.72,NA0=-.36,WZ=[[-.5,.42],[.62,1.1]],WA=[.08,.68],TAU=Math.PI*2;
 const nrm=a=>((a%TAU)+TAU)%TAU;
 const glassAt=(a,z)=>{a=nrm(a);if(z<NZ&&(a<Math.PI-NA0||a>TAU+NA0))return 1;for(const w of WZ)if(z>w[0]&&z<w[1]){if(a>WA[0]&&a<WA[1])return 2;if(a>Math.PI-WA[1]&&a<Math.PI-WA[0])return 2}return 0};
 /* the grid: even steps plus every edge */
 const uniq=v=>[...new Set(v.map(x=>Math.round(x*1e5)/1e5))].sort((a,b)=>a-b);
 const ZS=uniq([...Array.from({length:61},(_,i)=>Z0+(Z1-Z0)*Math.pow(i/60,1)),NZ,...WZ.flat()]);
 const AS=uniq([...Array.from({length:97},(_,i)=>i/96*TAU),...WA,Math.PI-WA[0],Math.PI-WA[1],Math.PI-NA0,TAU+NA0]);
 /* the paint, worked out per texel from (angle, z): u = angle / 2pi, v = z along the body */
 const S0=ZS.map(stAt);
 const lett=(sd)=>{const c=document.createElement('canvas');c.width=920;c.height=400;const k=c.getContext('2d');k.textAlign='center';k.textBaseline='middle';
  const P=(z,y)=>[sd>0?(2.3-z)*200:(z+2.3)*200,(2.6-y)*200];
  k.fillStyle=NVc;k.font='bold 44px "Barlow Semi Condensed",DoorsSans,Arial,sans-serif';let p=P(-.04,1.2);k.fillText('DARK POLICE',p[0],p[1]);
  k.fillStyle=WHc;k.font='bold 34px "Barlow Semi Condensed",DoorsSans,Arial,sans-serif';p=P(1.48,1.95);k.fillText('DP-1',p[0],p[1]);
  p=P(-1.25,1.1);k.fillStyle=YLc;k.beginPath();k.moveTo(p[0],p[1]-22);k.lineTo(p[0]+18,p[1]-14);k.lineTo(p[0]+16,p[1]+8);k.lineTo(p[0],p[1]+22);k.lineTo(p[0]-16,p[1]+8);k.lineTo(p[0]-18,p[1]-14);k.closePath();k.fill();k.fillStyle=NVc;k.beginPath();k.arc(p[0],p[1],7,0,7);k.fill();
  return{d:k.getImageData(0,0,920,400).data,P}};
 const LT=[lett(1),lett(-1)];
 const TW=1536,TH=768,cv=document.createElement('canvas');cv.width=TW;cv.height=TH;const cx=cv.getContext('2d'),img=cx.createImageData(TW,TH),D=img.data;
 const hex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];const cN=hex(NVc),cW=hex(WHc),cY=hex(YLc),cD=[26,28,32];
 const rowS=[];for(let py=0;py<TH;py++)rowS.push(stAt(Z0+(Z1-Z0)*py/(TH-1)));
 const FA=.035,FZ=.03;/* frame widths: angle (rad) and z (m) */
 for(let py=0;py<TH;py++){const s=rowS[py],z=s[0];for(let px=0;px<TW;px++){const a=px/(TW-1)*TAU;const[x,y]=pt(s,a);let c=y>1.56?cN:cW;const side=Math.abs(x)>.42;
  if(side&&y>1.4&&y<1.56&&z>-1.5&&z<1.55)c=((Math.floor((z+3)/.075)+(y>1.48?1:0))%2)?cY:cN;
  if(side&&(Math.abs(z+.6)<.01||Math.abs(z-.52)<.01)&&y>.98&&y<2.3)c=cD;
  if(side&&Math.abs(z-.4)<.035&&Math.abs(y-1.66)<.012)c=cD;
  if(side){const L=LT[x>0?0:1],p=L.P(z,y),ix=p[0]|0,iy=p[1]|0;if(ix>=0&&ix<920&&iy>=0&&iy<400){const o=(iy*920+ix)*4,al=L.d[o+3]/255;if(al>0)c=c.map((v,j)=>v+(L.d[o+j]-v)*al)}}
  /* frames round the openings (painted on the body just outside each edge) */
  if(!glassAt(a,z)){if(glassAt(a+FA,z)||glassAt(a-FA,z)||glassAt(a,z+FZ)||glassAt(a,z-FZ))c=cD}
  const o=(py*TW+px)*4;D[o]=c[0];D[o+1]=c[1];D[o+2]=c[2];D[o+3]=255}}
 cx.putImageData(img,0,0);const btx=new THREE.CanvasTexture(cv);btx.anisotropy=8;
 const BODY=new THREE.MeshStandardMaterial({map:btx,roughness:.35,metalness:.3}),LIN=new THREE.MeshStandardMaterial({color:0x3a3c40,roughness:.9,side:THREE.BackSide}),NONE=new THREE.MeshBasicMaterial({visible:false});
 {const pos=[],uv=[],ix=[[],[],[]],NA=AS.length;S0.forEach(s=>{for(const a of AS){pos.push(...pt(s,a));uv.push(a/TAU,1-(s[0]-Z0)/(Z1-Z0))}});
  for(let i=0;i<ZS.length-1;i++)for(let j=0;j<NA-1;j++){const a=i*NA+j,b=a+NA;ix[glassAt((AS[j]+AS[j+1])/2,(ZS[i]+ZS[i+1])/2)].push(a,a+1,b,b,a+1,b+1)}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  geo.setIndex([...ix[0],...ix[1],...ix[2]]);geo.addGroup(0,ix[0].length,0);geo.addGroup(ix[0].length,ix[1].length,1);geo.addGroup(ix[0].length+ix[1].length,ix[2].length,2);geo.computeVertexNormals();
  g.add(new THREE.Mesh(geo,[BODY,GL,TN]));g.add(new THREE.Mesh(geo,[LIN,NONE,NONE]))/* the inside is a plain grey lining */}
 /* ---- inside: floor, the instrument panel, seats (the pilot sits in the front one) ---- */
 BX(.9,.04,2.3,DK,0,1.02,-.2);
 {const pn=BX(.9,.08,.36,DK,0,1.5,-1.32);pn.rotation.x=-.5;BX(.74,.02,.22,K.mfd,0,1.548,-1.3).rotation.x=-.5;CYL(.04,.05,.5,DK,0,1.22,-1.3)}
 for(const sx of[-.4,.4]){BX(.48,.1,.5,SEAT,sx,1.22,-.55);BX(.48,.62,.1,SEAT,sx,1.55,-.28)}
 BX(1.3,.1,.5,SEAT,0,1.22,.75);BX(1.3,.62,.1,SEAT,0,1.55,1.02);
 /* ---- engine fairing on the roof: intakes, twin exhausts, the light bar, the mast ---- */
 {const ef=[[-.75,.04,.03,2.38],[-.55,.5,.32,2.45],[-.1,.9,.56,2.55],[.9,.86,.54,2.55],[1.55,.5,.36,2.46],[1.85,.04,.03,2.38]];
  const pos=[],idx=[],n=24;ef.forEach(s=>{for(let j=0;j<=n;j++){const a=j/n*Math.PI*2,c=Math.cos(a),si=Math.sin(a),e=2/3.2;pos.push(s[1]/2*Math.sign(c)*Math.pow(Math.abs(c),e),s[3]+s[2]/2*Math.sign(si)*Math.pow(Math.abs(si),e),s[0])}});
  for(let i=0;i<ef.length-1;i++)for(let j=0;j<n;j++){const a=i*(n+1)+j,b=a+n+1;idx.push(a,b,a+1,b,b+1,a+1)}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();g.add(new THREE.Mesh(geo,NV));
  for(const sd of[-1,1]){const gr=BX(.03,.18,.36,DK,sd*.455,2.55,-.1);CYL(.09,.11,.26,MT,sd*.26,2.55,1.72,'z',null,12);CYL(.075,.075,.02,DK,sd*.26,2.55,1.86,'z',null,12)}
  BX(1.0,.07,.26,DK,0,2.85,.45);for(const sd of[-1,1])BX(.04,.06,.2,MT,sd*.3,2.8,.45);
  const bea=[BX(.42,.11,.2,M(0x200000,{emissive:0x400000,roughness:.2}),-.25,2.94,.45),BX(.42,.11,.2,M(0x000020,{emissive:0x000040,roughness:.2}),.25,2.94,.45)];g.userData.bea=bea;BX(.06,.12,.21,DK,0,2.94,.45)}
 CYL(.1,.13,.3,MT,0,2.95,0,null,null,14);CYL(.2,.2,.05,MT,0,3.0,0,null,null,16);
 const mr=new THREE.Group();mr.position.set(0,3.15,0);g.add(mr);K.rotorHead(mr,4,4.8,Math.PI/4);
 /* ---- tail: tapered boom, stabiliser with end plates, swept fin, tail skid, tail rotor ---- */
 rod([0,2.0,1.95],[0,2.2,5.5],.25,NV,null,.12,16);CYL(.13,.13,.3,NV,0,2.21,5.5,'z',null,14).scale.set(1,1,1);
 plan([[-.95,4.5],[.95,4.5],[.85,4.85],[-.85,4.85]],.06,NV,2.16);for(const sd of[-1,1])BX(.04,.36,.4,NV,sd*.95,2.2,4.68);
 ext([[5.05,2.15],[5.62,2.18],[6.0,3.2],[5.7,3.24],[5.35,2.5]],.08,NV,0,null,.015);ext([[5.25,2.12],[5.6,2.12],[5.62,1.78],[5.42,1.8]],.06,NV,0,null,.01);rod([0,1.8,5.52],[0,1.72,5.2],.02,MT);
 {const nb=decal(.36,.13,K.text('DP-1','#ecebe6'));nb.position.set(-.052,2.75,5.62);nb.rotation.y=-Math.PI/2;nb.rotation.z=-.0}
 const tr=new THREE.Group();tr.position.set(.14,2.4,5.6);g.add(tr);CYL(.07,.07,.14,MT,0,0,0,'x',tr,10);for(const a of[0,Math.PI/2]){const bl=BX(.03,1.2,.12,M(0x2a2a2a),0,0,0,tr);bl.rotation.x=a;const tp=BX(.032,.14,.122,M(0xe8c020),0,.53,0,bl);tp.position.y=.53;const tq=tp.clone();tq.position.y=-.53;bl.add(tq)}
 lite(0xff2020,0,3.27,5.95);lite(0xffffff,0,2.12,5.66,null,.7);for(const sd of[-1,1])lite(sd<0?0xff2020:0x20ff40,sd*.97,2.42,4.68,null,.8);
 /* ---- skids: tubes turned up at the front, cross tubes into the belly, a boarding step each side ---- */
 for(const sd of[-1,1]){const x=sd*.95;rod([x,.06,-1.25],[x,.06,1.55],.045,MT,null,null,10);rod([x,.06,-1.25],[x,.26,-1.62],.045,MT,null,null,10);rod([x,.06,1.55],[x,.12,1.7],.045,MT,null,null,10);
  BX(.34,.035,.2,MT,x-sd*.08,.42,-.2);rod([x,.06,-.2],[x-sd*.08,.4,-.2],.02,MT)}
 for(const z of[-.85,.9]){for(const sd of[-1,1])rod([sd*.95,.06,z],[sd*.5,1.02,z],.045,MT,null,null,10);rod([-.5,1.02,z],[.5,1.02,z],.045,MT,null,null,10)}
 /* ---- searchlight on a yoke under the nose (the beam group sits at its lens) and a camera ball ---- */
 {const yk=new THREE.Group();yk.position.set(0,.95,-1.2);g.add(yk);CYL(.05,.06,.12,MT,0,0,0,null,yk,10);BX(.4,.04,.06,MT,0,-.07,0,yk);for(const sd of[-1,1])BX(.03,.18,.06,MT,sd*.19,-.15,0,yk);
  const lamp=CYL(.13,.16,.26,DK,0,-.17,0,null,yk,16);const lens=new THREE.Mesh(new THREE.CircleGeometry(.12,16),new THREE.MeshBasicMaterial({color:0xfff2b0}));lens.rotation.x=Math.PI/2;lens.position.set(0,-.305,0);yk.add(lens);
  for(const sd of[-1,1])CYL(.03,.03,.04,MT,sd*.165,-.17,0,'x',yk,8)}
 {const cb=new THREE.Mesh(new THREE.SphereGeometry(.13,14,10),DK);cb.position.set(.42,.86,-.95);g.add(cb);CYL(.035,.035,.12,MT,.42,1.0,-.95,null,null,8);const ln=new THREE.Mesh(new THREE.CircleGeometry(.06,12),new THREE.MeshStandardMaterial({color:0x101820,roughness:.05,metalness:.8}));ln.position.set(.42,.86,-1.081);ln.rotation.y=Math.PI;g.add(ln)}
 CYL(.012,.012,.5,DK,0,.68,.9);CYL(.008,.008,.4,DK,0,2.72,1.4).rotation.x=.4;
 /* ---- the pilot ---- */let sk=null;try{sk=mkCopSeek(.42);sk.position.set(0,1.05,-.6);g.add(sk)}catch(e){}
 /* ---- the beam, as the game had it ---- */
 const spG=new THREE.Group();spG.position.set(0,.8,-1.2);g.add(spG);const cm=new THREE.MeshBasicMaterial({color:0xfff2b0,transparent:true,opacity:.13,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,fog:false});const cone=new THREE.Mesh(new THREE.ConeGeometry(1,1,24,1,true),cm);spG.add(cone);
 const pm=new THREE.MeshBasicMaterial({color:0xfff2b0,transparent:true,opacity:.35,depthWrite:false,blending:THREE.AdditiveBlending,fog:false});const pool=new THREE.Mesh(new THREE.CircleGeometry(6,28),pm);pool.rotation.x=-Math.PI/2;pool.visible=false;spG.visible=false;
 Object.assign(g.userData,{mr,tr,spG,cone,cm,pool,pm,sk});return g}
