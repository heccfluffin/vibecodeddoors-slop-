/* =====================================================================================================
   mkRunabout(kind, colour): the small vehicles. Replaces the 'bike', 'golf', 'quad' and 'buggy' branches of
   mkVehModel (bak519).
     'bike'   the blue motorbike: tube frame, tank, saddle, finned engine, exhaust to a silencer, swingarm and shock,
              chain, raked fork with mudguard, headlight, mirrors, spoked wheels with a front disc
     'golf'   the white golf cart: cowl and body with wheel arches, bench seat, canopy on four posts, windscreen,
              dash, two golf bags with clubs, white hubcaps
     'quad'   the red quad bike: front and rear mudguards, saddle, racks, A-arms, solid rear axle, exhaust,
              footrests, knobbly balloon tyres, handlebars with a light pod
     'buggy'  the yellow dune buggy: fibreglass nose, floor pan, roll cage with a light bar, bucket seats with
              harnesses, rear engine with air filter and twin exhausts, coilovers, a spare wheel on the back
   ORIGIN    Centre on the ground.   FRONT  -z.
   SIZE / WHEELS / SEATS  as VEHK now (bike .8 × 2.2, golf 1.3 × 2.4, quad 1.2 × 2.0, buggy 1.8 × 3.2);
             wheels where the old models had them; seats at the old seat heights.
   HOOKS     userData.wheels [{p, t, front}] (t rolls; hubs, spokes and rims are inside t; t.userData.r set)
             userData.sw, userData.swAx: bike 'y' (the whole front end: fork, mudguard, headlight, bars; raked, so it
             turns about the steering head), quad 'y' (handlebars), golf and buggy 'z' (steering wheel).
   NOTE      Bike: the game turns the front wheel by str·0.45 and the bars by str·0.5. Please make the bike's front
             wheel use 0.5 too (or both 0.45) so the tyre stays in the fork when steering hard.
   ALSO      Skip vehMore() for these four.
   ===================================================================================================== */
function mkRunabout(kind,colour){const g=new THREE.Group();
 const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.5,metalness:.3},o||{}));
 const paintC=colour!=null?colour:{bike:0x2a3a9a,golf:0xf4f4f0,quad:0xc02020,buggy:0xe8d030}[kind];
 const paint=M(paintC,{roughness:.35,metalness:.25}),dk=M(0x18191a,{roughness:.85,metalness:.1}),steel=M(0x5a5e62,{metalness:.65,roughness:.35}),chrome=M(0xc8ccd0,{metalness:.55,roughness:.22}),
  seatM=M(0x1e1e20,{roughness:.9,metalness:0}),hl=M(0xfff4d0,{emissive:0xffe0a0,emissiveIntensity:.6,roughness:.1}),tl=M(0x701010,{emissive:0xc01010,emissiveIntensity:.5}),
  glass=new THREE.MeshStandardMaterial({color:0x9ac8e0,transparent:true,opacity:.3,roughness:.05,metalness:.3,side:THREE.DoubleSide,depthWrite:false});
 const BX=(w,h,d,m,x,y,z,p)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);(p||g).add(o);return o};
 const CYL=(r1,r2,len,m,x,y,z,ax,p,seg)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,len,seg||14),m);o.position.set(x,y,z);if(ax=='x')o.rotation.z=Math.PI/2;else if(ax=='z')o.rotation.x=Math.PI/2;(p||g).add(o);return o};
 const rod=(a,b,r,m,p)=>{const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A);const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),8),m);o.position.copy(A).add(B).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());(p||g).add(o);
  const j=new THREE.Mesh(new THREE.SphereGeometry(r,8,6),m);j.position.copy(B);(p||g).add(j);return o};/* a ball at the far end hides the joint */
 const B_T=.02;
 /* a side profile [z, y] extruded across x, centred on x; arches: [[z, y, r]] cut out of the bottom edge */
 const ext=(pts,w,m,x,p,bev,arches)=>{const bt=bev==null?B_T:bev;const s=new THREE.Shape();s.moveTo(pts[0][0],pts[0][1]);
  if(arches){const bot=pts[0][1],zEnd=pts[1][0];for(const[az,ay,ar]of arches){s.lineTo(az-ar,bot);s.lineTo(az-ar,ay);s.absarc(az,ay,ar,Math.PI,0,true);s.lineTo(az+ar,bot)}s.lineTo(zEnd,bot);for(const q of pts.slice(2))s.lineTo(q[0],q[1])}
  else for(const q of pts.slice(1))s.lineTo(q[0],q[1]);s.lineTo(pts[0][0],pts[0][1]);
  const geo=new THREE.ExtrudeGeometry(s,{depth:w-2*bt,bevelEnabled:bt>0,bevelThickness:bt,bevelSize:bt,bevelSegments:2,curveSegments:12});const o=new THREE.Mesh(geo,m);o.rotation.y=-Math.PI/2;o.position.x=(x||0)+(w-2*bt)/2;(p||g).add(o);return o};
 /* a mudguard: a curved strip round a wheel at (y, z), radius r, from angle a0 to a1 (0 = straight forward, π/2 = top) */
 const guard=(x,y,z,r,w,a0,a1,m,p)=>{const geo=new THREE.CylinderGeometry(r,r,w,20,1,true,a0,a1-a0);const o=new THREE.Mesh(geo,m);o.material=o.material.clone();o.material.side=THREE.DoubleSide;o.rotation.z=Math.PI/2;o.position.set(x,y,z);(p||g).add(o);return o};
 const tex=(w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);return new THREE.CanvasTexture(c)};
 const plate=(txt,x,y,z,ry,s,p)=>{const o=new THREE.Mesh(new THREE.PlaneGeometry(.36*(s||1),.18*(s||1)),M(0xffffff,{map:tex(256,128,(k)=>{k.fillStyle='#f0e8d0';k.fillRect(0,0,256,128);k.strokeStyle='#2a2a2a';k.lineWidth=6;k.strokeRect(4,4,248,120);
  k.fillStyle='#b03020';k.font='bold 22px "Barlow Semi Condensed",DoorsSans,Arial,sans-serif';k.textAlign='center';k.fillText('DESERT STATE',128,30);k.fillStyle='#1a1a1a';k.font='bold 64px "Barlow Semi Condensed",DoorsSans,Arial,sans-serif';k.fillText(txt,128,100,230)}),metalness:.2}));o.position.set(x,y,z);o.rotation.y=ry;(p||g).add(o);return o};
 /* wheels: the tyre t rolls; everything on the hub is inside t */
 const wheels=[];const wheel=(x,z,r,w,style)=>{const p=new THREE.Group();p.position.set(x,r,z);g.add(p);
  const knob=style=='knobby',tr=tex(64,64,(k)=>{k.fillStyle='#1c1c1c';k.fillRect(0,0,64,64);k.fillStyle='#0c0c0c';if(knob){for(let i=0;i<64;i+=16)for(let j=0;j<64;j+=16)k.fillRect(j+(i%32?8:0),i,6,8)}else{for(let i=0;i<64;i+=8)k.fillRect(0,i,64,2)}});tr.wrapS=tr.wrapT=THREE.RepeatWrapping;tr.repeat.set(1,Math.round(r*14));
  let t;if(style=='spoke'){t=new THREE.Group();const ty=new THREE.Mesh(new THREE.TorusGeometry(r-w*.45,w*.45,10,32),M(0xffffff,{map:tr,roughness:.95,metalness:0}));ty.rotation.x=Math.PI/2;t.add(ty)}/* an open tyre, so the spokes show */
  else{t=new THREE.Mesh(new THREE.CylinderGeometry(r,r,w,26),[M(0xffffff,{map:tr,roughness:.95,metalness:0}),dk,dk]);for(const s of[-1,1]){const sw2=new THREE.Mesh(new THREE.TorusGeometry(r-w*.22,w*.22,6,24),dk);sw2.rotation.x=Math.PI/2;sw2.position.y=s*(w/2-w*.22);t.add(sw2)}}/* rounded sidewalls */
  t.rotation.z=Math.PI/2;t.userData.r=r;p.add(t);
  if(style=='spoke'){const rim=new THREE.Mesh(new THREE.TorusGeometry(r*.78,.015,6,28),chrome);rim.rotation.x=Math.PI/2;t.add(rim);t.add(new THREE.Mesh(new THREE.CylinderGeometry(r*.76,r*.76,w*.55,24,1,true),M(0x2a2a2c,{metalness:.6,side:THREE.DoubleSide})));
   for(let i=0;i<16;i++){const a=i/16*6.283,s=(i%2?1:-1)*w*.18;const sp=new THREE.Mesh(new THREE.CylinderGeometry(.004,.004,r*.68,4),chrome);sp.position.set(Math.cos(a)*r*.4,s,Math.sin(a)*r*.4);sp.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(Math.cos(a),-s*2,Math.sin(a)).normalize());t.add(sp)}
   t.add(new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,w+.06,10),steel))}
  else if(style=='golf'){t.add(new THREE.Mesh(new THREE.CylinderGeometry(r*.62,r*.62,w+.01,18),M(0xe8e8e4,{metalness:.3,roughness:.3})));t.add(new THREE.Mesh(new THREE.CylinderGeometry(r*.18,r*.18,w+.03,10),chrome))}
  else{const rr=r*.58;t.add(new THREE.Mesh(new THREE.CylinderGeometry(rr,rr,w+.01,16),M(0x3a3c3e,{metalness:.6,roughness:.35})));for(let i=0;i<5;i++){const a=i/5*6.283,b=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,w+.03,6),chrome);b.position.set(Math.cos(a)*rr*.5,0,Math.sin(a)*rr*.5);t.add(b)}t.add(new THREE.Mesh(new THREE.CylinderGeometry(rr*.3,rr*.3,w+.04,10),steel))}
  wheels.push({p,t,front:z<0});return p};
 let sw=null,swAx='z';
 const wheelSteer=(x,y,z,tilt,r)=>{const s=new THREE.Group();s.position.set(x,y,z);s.rotation.x=tilt;g.add(s);s.add(new THREE.Mesh(new THREE.TorusGeometry(r,.022,8,22),dk));
  for(const a of[0,2.1,4.2]){const b=new THREE.Mesh(new THREE.BoxGeometry(r*.9,.025,.02),steel);b.position.set(Math.cos(a)*r*.45,Math.sin(a)*r*.45,0);b.rotation.z=a;s.add(b)}
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.05,10),dk);hub.rotation.x=Math.PI/2;s.add(hub);const col=new THREE.Mesh(new THREE.CylinderGeometry(.025,.03,.5,8),dk);col.rotation.x=Math.PI/2;col.position.z=-.25;s.add(col);sw=s;swAx='z';return s};

 /* =================================================================== BIKE */
 if(kind=='bike'){const fr=M(0x2a2a2e,{metalness:.6,roughness:.4}),eng=M(0x6a6a70,{metalness:.7,roughness:.35});
  /* frame: from the steering head over the engine to the swingarm pivot, a subframe to the tail */
  const H=[0,1.0,-.55];rod(H,[0,.86,.05],.035,fr);rod(H,[0,.42,-.28],.035,fr);rod([0,.42,-.28],[0,.38,.18],.035,fr);rod([0,.38,.18],[0,.86,.05],.035,fr);rod([0,.86,.05],[0,.82,.95],.025,fr);rod([0,.4,.2],[0,.82,.62],.022,fr);
  ext([[-.5,.8],[.05,.8],[.08,.92],[-.05,1.02],[-.42,1.04],[-.56,.94]],.38,paint);/* tank */
  {const st=tex(256,64,(k,w,h)=>{k.clearRect(0,0,w,h);k.fillStyle='#e8e4d8';k.font='italic bold 40px "Barlow Semi Condensed",DoorsSans,Arial,sans-serif';k.textAlign='center';k.textBaseline='middle';k.fillText('DESERT 650',w/2,h/2)});
   for(const sd of[-1,1]){const p=new THREE.Mesh(new THREE.PlaneGeometry(.38,.09),new THREE.MeshStandardMaterial({map:st,transparent:true,alphaTest:.3}));p.position.set(sd*.196,.92,-.27);p.rotation.y=sd*Math.PI/2;g.add(p)}}
  ext([[.03,.8],[.78,.78],[.9,.85],[.8,.9],[.1,.9],[.02,.86]],.3,seatM,0,null,.03);/* saddle (top 0.9, as the old seat) */
  ext([[.75,.72],[1.05,.72],[1.08,.8],[.8,.82]],.2,paint);BX(.1,.06,.04,tl,0,.76,1.07);plate('BRRM',0,.6,1.06,Math.PI,.6);BX(.04,.14,.04,fr,0,.69,1.03);/* tail, light, plate on a bracket */
  /* engine: crankcase, finned cylinder, side covers; exhaust header to a silencer */
  BX(.3,.3,.42,eng,0,.48,-.06);const cy=CYL(.11,.12,.32,eng,0,.72,-.24,null,null,14);cy.rotation.x=-.35;for(let i=0;i<5;i++){const f=CYL(.16,.16,.02,eng,0,.62+i*.055,-.2-i*.02,null,null,14);f.rotation.x=-.35}
  for(const sd of[-1,1])CYL(.13,.13,.04,chrome,sd*.16,.46,-.04,'x');
  rod([.08,.62,-.36],[.14,.3,-.2],.035,chrome);rod([.14,.3,-.2],[.17,.32,.35],.035,chrome);rod([.17,.32,.35],[.19,.48,.72],.04,chrome);{const m=CYL(.075,.065,.45,steel,.19,.52,.8,'z');m.rotation.x=Math.PI/2-.35}
  /* swingarm, shock, chain, footpegs */
  for(const sd of[-1,1])rod([sd*.1,.4,.2],[sd*.1,.36,.75],.025,fr);rod([0,.82,.5],[0,.42,.48],.028,M(0xd8b020,{metalness:.4}));CYL(.055,.055,.03,steel,-.13,.38,.18,'x');rod([-.13,.435,.18],[-.13,.46,.75],.012,dk);rod([-.13,.325,.18],[-.13,.26,.75],.012,dk);/* front sprocket and the chain's two runs to the rear sprocket */
  for(const sd of[-1,1]){BX(.14,.03,.04,steel,sd*.22,.38,.12);BX(.05,.12,.04,fr,sd*.15,.4,.12)}
  /* the front end turns about the raked steering head */
  const s=new THREE.Group();s.position.set(...H);s.rotation.x=.26;g.add(s);
  for(const sd of[-1,1]){CYL(.03,.03,.64,chrome,sd*.09,-.34,0,null,s,8);CYL(.04,.04,.2,dk,sd*.09,-.12,0,null,s,8)}BX(.26,.05,.08,steel,0,.02,0,s);BX(.26,.05,.08,steel,0,-.2,0,s);/* fork legs, triple clamps */
  CYL(.03,.03,.24,steel,0,-.66,0,'x',s,8);/* front axle */
  guard(0,-.66,0,.42,.14,1.25,2.75,paint,s);/* front mudguard: from just behind the top round to the front */
  {const hlg=new THREE.Group();hlg.position.set(0,-.08,-.14);s.add(hlg);CYL(.11,.1,.12,dk,0,0,0,'z',hlg,16);CYL(.09,.09,.02,hl,0,0,-.07,'z',hlg,16)}
  {const bar=new THREE.Group();bar.position.set(0,.1,.06);s.add(bar);CYL(.018,.018,.72,chrome,0,0,0,'x',bar,8);for(const sd of[-1,1]){CYL(.03,.03,.14,dk,sd*.32,0,0,'x',bar,8);rod([sd*.24,0,0],[sd*.28,.2,.04],.01,dk,bar);BX(.08,.05,.01,chrome,sd*.3,.23,.05,bar)}BX(.14,.08,.08,dk,0,.04,-.02,bar)}
  sw=s;swAx='y';
  wheel(0,-.72,.36,.14,'spoke');wheel(0,.75,.36,.18,'spoke');guard(0,.36,.75,.42,.18,.35,1.75,paint);/* rear mudguard: from the top round to the back */
  {const d=new THREE.Mesh(new THREE.CylinderGeometry(.15,.15,.012,20),steel);d.position.set(0,-.06,0);wheels[0].t.add(d)}{const sp=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,.02,20),steel);sp.position.set(0,.13,0);wheels[1].t.add(sp);for(let i=0;i<16;i++){const a=i/16*6.283,tt=new THREE.Mesh(new THREE.BoxGeometry(.025,.02,.025),steel);tt.position.set(Math.cos(a)*.105,.13,Math.sin(a)*.105);wheels[1].t.add(tt)}for(const sd of[-1,1]){const n=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.03,6),steel);n.position.y=sd*.14;wheels[1].t.add(n)}}/* rear sprocket (rolls with the wheel) and axle nuts where the swingarm meets it *//* front brake disc, on the hub */}

 /* =================================================================== GOLF */
 else if(kind=='golf'){
  ext([[-1.15,.2],[1.15,.2],[1.2,.56],[.45,.6],[.43,.42],[-.55,.42],[-.6,.9],[-.95,.92],[-1.2,.62]],1.24,paint,0,null,.03,[[-.85,.26,.3],[.9,.26,.3]]);
  BX(1.1,.02,.95,M(0x3a3a3a,{roughness:1}),0,.432,-.06);/* floor mat */
  /* bench seat with arm rests */BX(1.1,.14,.5,M(0xeae4d4,{roughness:.8}),0,.7,.15);{const bk=BX(1.1,.5,.1,M(0xeae4d4,{roughness:.8}),0,1.05,.44);bk.rotation.x=-.12}for(const sd of[-1,1])BX(.05,.2,.4,steel,sd*.58,.84,.2);BX(1.12,.04,.5,steel,0,.62,.15);
  /* dash pod with a key, a cup holder; the steering wheel */BX(1.08,.1,.22,M(0x2a2a2a,{roughness:.8}),0,.92,-.56);CYL(.04,.04,.06,dk,-.2,.98,-.5,null,null,10);BX(.04,.03,.06,chrome,.1,.97,-.47);
  wheelSteer(.32,1.12,-.32,-.9,.15);/* above and behind the dash pod; its column runs down into the dash */
  /* canopy on four posts, windscreen, two headlights */
  for(const[x,z,y0]of[[-.56,-.62,.9],[.56,-.62,.9],[-.56,.95,.56],[.56,.95,.56]])rod([x,y0,z],[x,1.94,z],.025,chrome);
  ext([[-1.0,1.92],[1.1,1.92],[1.14,1.98],[1.05,2.02],[-.95,2.02],[-1.05,1.98]],1.3,M(0x2a7a3a,{roughness:.7}),0,null,.02);BX(1.24,.01,2.0,M(0xf0f0f0),0,1.915,.05);
  {const ws=new THREE.Mesh(new THREE.PlaneGeometry(1.08,.88),glass);ws.position.set(0,1.42,-.63);ws.rotation.x=.05;g.add(ws);rod([-.54,.98,-.63],[.54,.98,-.63],.015,steel);rod([-.54,1.86,-.6],[.54,1.86,-.6],.015,steel)}
  for(const sd of[-1,1]){CYL(.06,.06,.04,hl,sd*.32,.62,-1.2,'z');CYL(.07,.07,.02,chrome,sd*.32,.62,-1.185,'z')}BX(1.0,.1,.1,M(0x2a2a2a),0,.3,-1.2);BX(1.1,.1,.1,M(0x2a2a2a),0,.3,1.2);
  for(const sd of[-1,1])BX(.12,.06,.03,tl,sd*.45,.45,1.2);
  /* the bag rack and two bags with clubs */BX(.9,.04,.36,steel,0,.6,1.02);rod([-.45,.6,1.18],[-.45,1.15,1.18],.015,steel);rod([.45,.6,1.18],[.45,1.15,1.18],.015,steel);rod([-.45,1.15,1.18],[.45,1.15,1.18],.015,steel);
  for(let i=0;i<2;i++){const bg=new THREE.Group();bg.position.set(-.24+i*.48,.62,1.02);bg.rotation.x=-.18;g.add(bg);CYL(.14,.13,.85,M(i?0x3a3a8a:0xc02020,{roughness:.8}),0,.43,0,null,bg,16);CYL(.15,.15,.06,M(0xf0f0f0),0,.86,0,null,bg,16);BX(.06,.6,.04,M(0xf0f0f0),0,.45,-.14,bg);
   for(let j=0;j<3;j++){CYL(.012,.012,.3,chrome,-.06+j*.06,1.0,0,null,bg,6);BX(.06,.05,.1,j==1?dk:chrome,-.06+j*.06,1.15,-.03,bg)}}
  plate('GOLF 1',0,.48,1.205,0,.7);
  for(const[x,z]of[[-.56,-.85],[.56,-.85],[-.56,.9],[.56,.9]])wheel(x,z,.26,.18,'golf')}

 /* =================================================================== QUAD */
 else if(kind=='quad'){
  /* frame, engine, bash plate, footrests */for(const sd of[-1,1]){rod([sd*.25,.42,-.9],[sd*.25,.42,.85],.03,steel);rod([sd*.25,.42,-.6],[sd*.22,.82,-.45],.025,steel);rod([sd*.25,.42,.45],[sd*.22,.82,.5],.025,steel)}
  BX(.4,.32,.55,M(0x5a5e62,{metalness:.6}),0,.58,0);BX(.56,.04,1.2,steel,0,.38,0);for(const sd of[-1,1]){BX(.28,.04,.46,steel,sd*.42,.46,.02);for(let i=0;i<4;i++)BX(.28,.02,.02,dk,sd*.42,.485,-.16+i*.12)}
  /* body: tank cover and the saddle */ext([[-.45,.74],[.2,.74],[.22,.92],[-.1,.96],[-.45,.9]],.5,paint);ext([[-.2,.92],[.62,.92],[.7,1.0],[.6,1.07],[-.1,1.07],[-.25,1.0]],.42,seatM,0,null,.03);
  /* mudguards over each pair of wheels (full width, so the tyres are covered from above) */
  ext([[-1.02,.62],[-.95,.82],[-.25,.86],[-.2,.66],[-.25,.66],[-.3,.8],[-.9,.77],[-.97,.62]],1.52,paint,0,null,.015);
  ext([[1.02,.62],[.95,.82],[.25,.86],[.2,.66],[.25,.66],[.3,.8],[.9,.77],[.97,.62]],1.52,paint,0,null,.015);
  /* racks */for(const[z0,z1]of[[-.95,-.42],[.4,.95]]){for(const sd of[-1,1]){rod([sd*.5,.94,z0],[sd*.5,.94,z1],.018,dk);rod([sd*.5,.86,z0],[sd*.5,.94,z0],.018,dk);rod([sd*.5,.86,z1],[sd*.5,.94,z1],.018,dk)}rod([-.5,.94,z0],[.5,.94,z0],.018,dk);rod([-.5,.94,z1],[.5,.94,z1],.018,dk);for(let i=1;i<4;i++){const z=z0+(z1-z0)*i/4;rod([-.5,.94,z],[.5,.94,z],.012,dk)}}
  /* headlights in the front guard, tail light */for(const sd of[-1,1]){BX(.18,.09,.04,hl,sd*.28,.76,-.99);}BX(.16,.06,.04,tl,0,.74,.99);plate('QUAD',0,.62,1.0,0,.6);
  /* front A-arms to the hubs, solid rear axle, exhaust */for(const sd of[-1,1]){rod([sd*.25,.44,-.75],[sd*.46,.36,-.65],.02,steel);rod([sd*.25,.44,-.55],[sd*.46,.36,-.65],.02,steel);rod([sd*.22,.72,-.62],[sd*.44,.42,-.65],.03,M(0xd8b020,{metalness:.4}))}
  CYL(.04,.04,1.0,steel,0,.34,.65,'x');rod([.2,.5,.1],[.3,.62,.7],.035,chrome);{const m=CYL(.06,.06,.3,steel,.32,.66,.85,'z');m.rotation.x=Math.PI/2-.2}
  /* handlebars: the group turns on y about the steering column */
  const s=new THREE.Group();s.position.set(0,1.18,-.5);g.add(s);CYL(.022,.022,.8,chrome,0,0,0,'x',s,8);for(const sd of[-1,1])CYL(.035,.035,.14,dk,sd*.36,0,0,'x',s,8);CYL(.035,.035,.42,steel,0,-.21,0,null,s,8);
  {const pod=new THREE.Group();pod.position.set(0,.02,-.08);s.add(pod);BX(.24,.1,.12,paint,0,0,0,pod);CYL(.04,.04,.02,hl,0,0,-.065,'z',pod,10)}
  sw=s;swAx='y';
  for(const[x,z]of[[-.6,-.65],[.6,-.65],[-.6,.65],[.6,.65]])wheel(x,z,.34,.32,'knobby')}

 /* =================================================================== BUGGY */
 else if(kind=='buggy'){const cage=M(0x2a2c2e,{metalness:.55,roughness:.4}),red=M(0xc02020,{roughness:.8,metalness:0});
  BX(1.3,.06,2.2,M(0x3a3c3e,{metalness:.5}),0,.42,.05);/* floor pan */
  ext([[-1.75,.55],[-1.6,.42],[-.5,.42],[-.5,.85],[-.75,.9],[-1.7,.72]],1.3,paint,0,null,.04);/* the fibreglass nose */
  for(const sd of[-1,1]){BX(.14,.3,1.5,paint,sd*.65,.6,.05);BX(.3,.12,.06,hl,sd*.42,.66,-1.77)}/* side pods, headlights */
  {const st=tex(256,64,(k,w,h)=>{k.clearRect(0,0,w,h);k.fillStyle='#1a1a1a';k.font='bold 44px "Barlow Semi Condensed",DoorsSans,Arial,sans-serif';k.textAlign='center';k.textBaseline='middle';k.fillText('DUNE  RAT',w/2,h/2)});
   for(const sd of[-1,1]){const p=new THREE.Mesh(new THREE.PlaneGeometry(1.0,.25),new THREE.MeshStandardMaterial({map:st,transparent:true,alphaTest:.3}));p.position.set(sd*.723,.6,.05);p.rotation.y=sd*Math.PI/2;g.add(p)}}
  /* the roll cage */
  for(const sd of[-1,1]){rod([sd*.66,.75,.45],[sd*.6,1.75,.4],.035,cage);rod([sd*.66,.85,-.55],[sd*.56,1.75,-.25],.035,cage);rod([sd*.56,1.75,-.25],[sd*.6,1.75,.4],.035,cage);rod([sd*.6,1.75,.4],[sd*.6,.72,1.45],.035,cage);rod([sd*.66,.75,.45],[sd*.6,.72,1.45],.03,cage)}
  rod([-.6,1.75,.4],[.6,1.75,.4],.035,cage);rod([-.56,1.75,-.25],[.56,1.75,-.25],.035,cage);rod([-.62,1.3,.43],[.62,1.3,.43],.03,cage);rod([-.6,.72,1.45],[.6,.72,1.45],.03,cage);
  /* light bar */BX(1.0,.12,.1,dk,0,1.82,-.25);for(let i=0;i<4;i++)CYL(.045,.045,.03,hl,-.36+i*.24,1.82,-.31,'z');
  /* bucket seats with harnesses */for(const sd of[-1,1]){const x=sd*.4;BX(.5,.1,.5,seatM,x,.6,-.05);const bk=BX(.5,.72,.1,seatM,x,.98,.24);bk.rotation.x=-.15;for(const s2 of[-1,1])BX(.06,.5,.4,seatM,x+s2*.25,.82,.08);
   for(const s2 of[-1,1])BX(.05,.66,.01,red,s2*.12,0,-.056,bk);/* shoulder straps lying on the seat back (children of it) */BX(.42,.01,.06,red,x,.656,-.12);BX(.07,.012,.07,M(0xc8ccd0,{metalness:.6}),x,.658,-.12)}/* lap belt and buckle on the cushion */
  /* the steering wheel and a little dash */wheelSteer(.4,1.05,-.6,-1.1,.16);BX(1.1,.12,.15,dk,0,.88,-.55);
  /* rear engine, air filter, twin exhausts, spare wheel */
  BX(.62,.45,.6,M(0x5a5e62,{metalness:.65}),0,.72,1.12);for(const sd of[-1,1]){const c=CYL(.1,.1,.3,M(0x5a5e62,{metalness:.65}),sd*.32,.88,1.1,'x');}CYL(.13,.13,.12,chrome,0,1.0,1.1,null,null,16);
  for(const sd of[-1,1]){rod([sd*.15,.75,1.42],[sd*.18,1.0,1.6],.04,chrome);CYL(.05,.05,.04,dk,sd*.18,1.02,1.62,'z')}
  {const sp=new THREE.Group();sp.position.set(0,1.18,1.52);g.add(sp);const t2=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,.26,20),dk);t2.rotation.x=Math.PI/2;sp.add(t2);const h2=new THREE.Mesh(new THREE.CylinderGeometry(.24,.24,.27,14),M(0x3a3c3e,{metalness:.6}));h2.rotation.x=Math.PI/2;sp.add(h2);rod([0,0,-.08],[0,0,-.1],.06,cage,sp)}
  BX(.4,.06,.08,cage,0,1.18,1.42);/* spare wheel bracket on the rear cross bar */
  /* suspension: front A-arms and coilovers, rear trailing arms */
  for(const sd of[-1,1]){rod([sd*.4,.45,-1.2],[sd*.7,.42,-1.1],.025,steel);rod([sd*.4,.45,-.95],[sd*.7,.42,-1.1],.025,steel);rod([sd*.42,.82,-.95],[sd*.66,.5,-1.08],.04,M(0xd8b020,{metalness:.4}));
   rod([sd*.45,.48,.7],[sd*.75,.52,1.05],.03,steel);rod([sd*.5,.9,.85],[sd*.72,.6,1.02],.04,M(0xd8b020,{metalness:.4}))}
  plate('DUNE',0,.5,1.43,0,.7);for(const sd of[-1,1])BX(.12,.08,.03,tl,sd*.25,.52,1.43);BX(.66,.36,.02,M(0x2a2a2a),0,.6,1.42);/* rear panel the plate and lights sit on */
  wheel(-.85,-1.1,.42,.3,'knobby');wheel(.85,-1.1,.42,.3,'knobby');wheel(-.88,1.05,.52,.42,'knobby');wheel(.88,1.05,.52,.42,'knobby')}
 g.userData.wheels=wheels;g.userData.sw=sw;g.userData.swAx=swAx;return g}
