/* =====================================================================================================
   pd.js: the Desert PD rework (remodel list #22, spec docs/design/desert-pd.md). Plain three.js r128.
   Everything is built in the desert's own x/z (the numbers the game code uses), straight into the group you pass.

   Batch 1, the outside:
   pdKit()            materials, canvas textures and helpers shared by all the batches. Boxes get world-scaled
                      texture coordinates (pk.box), so stucco, stone and paving never stretch.
   pdStationShell(g)  the station's outer walls (x 64..96, z -1031.5..-1017.5): stucco on a stone plinth, a navy band,
                      the cornice and parapet, framed windows with blinds, barred cell windows at the back, the main
                      door with its glass doors and the portico (two columns, POLICE fascia, blue lamps), the DESERT PD
                      letters and stars on the parapet, the roof (AC units, vents, a hatch, a radio mast with a red
                      light, a dish, a siren), CCTV, wall lamps, a downpipe, the fire door at the back. Returns {obs, map,
                      blink:[meshes that blink], floorY}.
   pdCourtShell(g)    the courthouse outside (x 42..58, z -1030..-1018): ashlar stone, a plinth, tall windows with
                      surrounds, a gable roof, the portico (six fluted columns, the COURT OF DARK LAW frieze, the
                      pediment with the clock), wooden doors standing open, lamps, two flags. Returns {obs, map, flags}.
   pdForecourt(g)     the paving (x 42..106, z -1017.35..-1013.3), the kerb (dropped across the driveway), the alley and
                      the yard, lamp posts, planters with cacti, benches, bins, the bike rack, the notice board and the
                      SURRENDER HERE box. Returns {obs, map, lamps}.
   ===================================================================================================== */
const PDS={x0:64,x1:96,zf:-1017.5,zp:-1024.5,zc:-1027.5,zb:-1031.5,H:4.2,PH:4.85};
const PDC={x0:42,x1:58,z0:-1030,z1:-1018,H:6.4};
function pdKit(){if(pdKit.K)return pdKit.K;const C={};const M=(c,o)=>{const k=c+JSON.stringify(o||{});return C[k]||(C[k]=new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.75,metalness:.05},o||{})))};
 const can=(w,h,f,rep)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.anisotropy=4;if(rep)t.wrapS=t.wrapT=THREE.RepeatWrapping;return t};
 const R=(()=>{let s=4517;return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}})();
 const noise=(x,w,h,base,n,a)=>{x.fillStyle=base;x.fillRect(0,0,w,h);for(let i=0;i<n;i++){x.fillStyle=R()<.5?'rgba(0,0,0,'+a*R()+')':'rgba(255,255,255,'+a*R()+')';x.fillRect(R()*w,R()*h,1+R()*3,1+R()*3)}};
 /* textures (1 repeat = the metres in the name) */
 const T={stucco:can(256,256,(x,w,h)=>noise(x,w,h,'#d9c6a2',5000,.09),1),/* 2 m */
  stone:can(256,256,(x,w,h)=>{noise(x,w,h,'#9a8a74',2500,.12);x.strokeStyle='rgba(50,40,30,.45)';x.lineWidth=3;for(let r=0;r<4;r++){x.beginPath();x.moveTo(0,r*64);x.lineTo(w,r*64);x.stroke();for(let c=0;c<3;c++){const u=(c*86+(r%2)*43)%w;x.beginPath();x.moveTo(u,r*64);x.lineTo(u,r*64+64);x.stroke()}}},1),/* 1 m: 4 courses */
  ashlar:can(512,512,(x,w,h)=>{noise(x,w,h,'#d8d0c0',6000,.08);x.strokeStyle='rgba(90,80,70,.4)';x.lineWidth=3;for(let r=0;r<8;r++){x.beginPath();x.moveTo(0,r*64);x.lineTo(w,r*64);x.stroke();for(let c=0;c<4;c++){const u=(c*128+(r%2)*64)%w;x.beginPath();x.moveTo(u,r*64);x.lineTo(u,r*64+64);x.stroke()}}},1),/* 4 m: 8 courses of 0.5 m */
  pave:can(256,256,(x,w,h)=>{noise(x,w,h,'#c4bcae',3000,.1);x.strokeStyle='rgba(60,55,50,.35)';x.lineWidth=2;for(let i=0;i<=4;i++){x.beginPath();x.moveTo(i*64,0);x.lineTo(i*64,h);x.stroke();x.beginPath();x.moveTo(0,i*64);x.lineTo(w,i*64);x.stroke()}},1),/* 2 m: 0.5 m slabs */
  roof:can(256,256,(x,w,h)=>noise(x,w,h,'#6a6864',7000,.18),1),
  lead:can(256,256,(x,w,h)=>{noise(x,w,h,'#5a6a68',3000,.1);x.strokeStyle='rgba(30,40,40,.5)';x.lineWidth=3;for(let i=0;i<=4;i++){x.beginPath();x.moveTo(i*64,0);x.lineTo(i*64,h);x.stroke()}},1),
  conc:can(256,256,(x,w,h)=>noise(x,w,h,'#a8a49c',4000,.1),1)};
 const MT={stucco:new THREE.MeshStandardMaterial({map:T.stucco,color:0xffffff,roughness:.92}),stone:new THREE.MeshStandardMaterial({map:T.stone,roughness:.9}),ashlar:new THREE.MeshStandardMaterial({map:T.ashlar,roughness:.85}),
  pave:new THREE.MeshStandardMaterial({map:T.pave,roughness:.95}),roof:new THREE.MeshStandardMaterial({map:T.roof,roughness:1}),lead:new THREE.MeshStandardMaterial({map:T.lead,roughness:.6,metalness:.3}),conc:new THREE.MeshStandardMaterial({map:T.conc,roughness:.95}),
  navy:M(0x22305a,{roughness:.6}),trim:M(0xece4d4,{roughness:.7}),frame:M(0x2a2c30,{roughness:.5,metalness:.4}),steel:M(0x7a7e84,{metalness:.7,roughness:.35}),dark:M(0x1c1e22,{roughness:.6}),
  glass:new THREE.MeshStandardMaterial({color:0x34485a,transparent:true,opacity:.5,roughness:.08,metalness:.4,depthWrite:false}),wood:M(0x6a4428,{roughness:.7}),gold:M(0xd8a830,{metalness:.8,roughness:.3}),
  blueL:M(0x2050ff,{emissive:0x2050ff,emissiveIntensity:1.2}),warm:M(0xfff0c8,{emissive:0xffe0a0,emissiveIntensity:1})};
 /* a box whose texture coordinates are in metres / s (so one repeat = s metres on every face) */
 /* with o (the box's position) the pattern is anchored to the world, so neighbouring pieces (round windows and doors) line up */
 const boxGeo=(w,h,d,s,o)=>{const g=new THREE.BoxGeometry(w,h,d);if(s){const uv=g.attributes.uv,P=g.attributes.position;const ox=o?o[0]:0,oy=o?o[1]:0,oz=o?o[2]:0;
  for(let f=0;f<6;f++)for(let v=0;v<4;v++){const i=f*4+v;const x=P.getX(i)+ox,y=P.getY(i)+oy,z=P.getZ(i)+oz;let u,w2;
   if(f<2){u=f==0?-z:z;w2=y}else if(f<4){u=x;w2=f==2?-z:z}else{u=f==4?x:-x;w2=y}uv.setXY(i,u/s,w2/s)}}return g};
 const H=par=>{const A=(geo,m,x,y,z,p)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);(p||par).add(o);return o};
  const B=(w,h,d,m,x,y,z,p,s)=>A(boxGeo(w,h,d,s,s&&!p?[x,y,z]:null),m,x,y,z,p);
  const Cy=(r0,r1,h,m,x,y,z,ax,p,seg,open)=>{const o=A(new THREE.CylinderGeometry(r0,r1,h,seg||14,1,!!open),m,x,y,z,p);if(ax=='x')o.rotation.z=-Math.PI/2;else if(ax=='z')o.rotation.x=Math.PI/2;return o};
  const V=new THREE.Vector3(),U=new THREE.Vector3(0,1,0);
  const rod=(a,b,r,m,p,seg)=>{V.set(b[0]-a[0],b[1]-a[1],b[2]-a[2]);const L=V.length();const o=A(new THREE.CylinderGeometry(r,r,L,seg||6),m,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,p);o.quaternion.setFromUnitVectors(U,V.normalize());return o};
  /* a label: canvas text on a plane facing +z (turn it with ry) */
  const lab=(txt,w,h,bg,fg,fs,x,y,z,ry,p,opt)=>{opt=opt||{};const t=can(512,Math.max(16,Math.round(512*h/w)),(c,W2,H2)=>{if(bg){c.fillStyle=bg;c.fillRect(0,0,W2,H2)}c.fillStyle=fg;c.textAlign='center';c.textBaseline='middle';const L=String(txt).split('\n');let f=fs||Math.min(H2/(L.length+.5),90);c.font=(opt.w||'bold')+' '+f+'px DoorsSans,Arial,sans-serif';const mw=Math.max(...L.map(l=>c.measureText(l).width));if(mw>W2*.92){f*=W2*.92/mw;c.font=(opt.w||'bold')+' '+f+'px DoorsSans,Arial,sans-serif'}if(opt.stroke){c.lineWidth=f*.12;c.strokeStyle=opt.stroke;L.forEach((l,i)=>c.strokeText(l,W2/2,H2/2+(i-(L.length-1)/2)*f*1.1))}L.forEach((l,i)=>c.fillText(l,W2/2,H2/2+(i-(L.length-1)/2)*f*1.1))});
   const m=A(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:t,transparent:!bg,roughness:.7,emissive:opt.glow?0xffffff:0,emissiveMap:opt.glow?t:null,emissiveIntensity:opt.glow||0}),x,y,z,p);m.rotation.y=ry||0;return m};
  return{A,B,Cy,rod,lab}};
 /* a wall along x (axis 'x', at z=c) or along z (axis 'z', at x=c) from a0 to a1, height h, thickness t, with holes
    [a, b, y0, y1]. Returns the obstacle boxes for the parts that reach the floor. */
 const wall=(par,axis,a0,a1,c,h,t,mat,holes,s,y0)=>{const hs=(holes||[]).slice().sort((p,q)=>p[0]-q[0]),cut=[a0,a1];for(const o of hs)cut.push(o[0],o[1]);cut.sort((p,q)=>p-q);const ob=[],yb=y0||0;
  for(let i=0;i<cut.length-1;i++){const p=cut[i],q=cut[i+1];if(q-p<1e-3)continue;const mid=(p+q)/2;const hit=hs.filter(o=>mid>o[0]&&mid<o[1]);let ys=[[yb,h]];for(const o of hit){const n=[];for(const[u,v]of ys){if(o[3]<=u||o[2]>=v){n.push([u,v]);continue}if(o[2]>u)n.push([u,o[2]]);if(o[3]<v)n.push([o[3],v])}ys=n}
   for(const[u,v]of ys){if(v-u<1e-3)continue;const g=boxGeo(axis=='x'?q-p:t,v-u,axis=='x'?t:q-p,s,[axis=='x'?mid:c,(u+v)/2,axis=='x'?c:mid]);const m=new THREE.Mesh(g,mat);m.position.set(axis=='x'?mid:c,(u+v)/2,axis=='x'?c:mid);par.add(m)}
   if(!hit.some(o=>o[2]<=.05))ob.push(axis=='x'?{x0:p,x1:q,z0:c-t/2,z1:c+t/2}:{x0:c-t/2,x1:c+t/2,z0:p,z1:q})}
  /* merge touching obstacle pieces */const mo=[];for(const o of ob){const l=mo[mo.length-1];if(l&&(axis=='x'?Math.abs(l.x1-o.x0)<1e-3:Math.abs(l.z1-o.z0)<1e-3)){if(axis=='x')l.x1=o.x1;else l.z1=o.z1}else mo.push(Object.assign({},o))}return mo};
 /* a framed window in a wall (axis/c as above), from a0..a1, y0..y1, wall thickness t; out = +1 if the outside is +z (or +x) */
 const blindT=can(64,128,(x,w,h)=>{x.clearRect(0,0,w,h);for(let y=0;y<h*.55;y+=8){x.fillStyle='rgba(238,234,224,.95)';x.fillRect(0,y,w,6)}x.fillStyle='rgba(80,80,80,.9)';x.fillRect(w*.48,0,2,h*.55)});
 const win=(par,axis,a0,a1,c,y0,y1,t,out,opt)=>{opt=opt||{};const{A,B}=H(par);const w=a1-a0,h=y1-y0,m=(a0+a1)/2,ym=(y0+y1)/2;const P=(u,v)=>axis=='x'?[u,v]:[v,u];
  {const g=new THREE.PlaneGeometry(w,h);const o=A(g,MT.glass,...(axis=='x'?[m,ym,c]:[c,ym,m]));if(axis=='z')o.rotation.y=Math.PI/2}
  if(!opt.noblind){const bt=blindT.clone();bt.needsUpdate=true;bt.wrapS=THREE.RepeatWrapping;bt.repeat.set(Math.max(1,Math.round(w/1.2)),1);const g=new THREE.PlaneGeometry(w-.04,h-.04);const o=A(g,new THREE.MeshStandardMaterial({map:bt,transparent:true,alphaTest:.3,side:THREE.DoubleSide,roughness:.9}),...(axis=='x'?[m,ym,c-out*.06]:[c-out*.06,ym,m]));if(axis=='z')o.rotation.y=Math.PI/2}
  const ft=t+.04,fw=.07,FR=opt.frame||MT.frame;/* frame: two jambs, head, sill, a mullion */
  for(const u of[a0+fw/2,a1-fw/2])B(...(axis=='x'?[fw,h,ft]:[ft,h,fw]),FR,...(axis=='x'?[u,ym,c]:[c,ym,u]));for(const v of[y0+fw/2,y1-fw/2])B(...(axis=='x'?[w,fw,ft]:[ft,fw,w]),FR,...(axis=='x'?[m,v,c]:[c,v,m]));
  if(w>1.6){const n=Math.round(w/1.4);for(let i=1;i<n;i++){const u=a0+w*i/n;B(...(axis=='x'?[.05,h,.08]:[.08,h,.05]),FR,...(axis=='x'?[u,ym,c]:[c,ym,u]))}}
  if(!opt.nosill){const S=opt.sill||MT.trim;B(...(axis=='x'?[w+.2,.07,.14]:[.14,.07,w+.2]),S,...(axis=='x'?[m,y0-.035,c+out*(t/2+.05)]:[c+out*(t/2+.05),y0-.035,m]))}
  if(opt.bars){for(let i=1;i<=opt.bars;i++){const u=a0+w*i/(opt.bars+1);B(...(axis=='x'?[.03,h,.03]:[.03,h,.03]),MT.steel,...(axis=='x'?[u,ym,c+out*t*.3]:[c+out*t*.3,ym,u]))}}};
 pdKit.K={M,MT,T,can,boxGeo,H,wall,win,R};return pdKit.K}
const pdNoSeam=g=>g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});

/* ---------------------------------------- the station, outside ---------------------------------------- */
function pdStationShell(g){const k=pdKit(),{MT,M,wall,win}=k,{A,B,Cy,rod,lab}=k.H(g),S=PDS,obs=[],map=[],blink=[];const t=.3,H=S.H,PH=S.PH;
 const ow=(axis,a0,a1,c,holes)=>{obs.push(...wall(g,axis,a0,a1,c,PH,t,MT.stucco,holes,2))};
 /* the openings */const FW=[[65.6,69.4],[72.4,76.6],[79,82.4],[88.2,89.6],[91.2,94.8]],DOOR=[85.4,86.6];
 ow('x',S.x0-t/2,S.x1+t/2,S.zf,[...FW.map(([a,b])=>[a,b,1.0,2.6]),[DOOR[0],DOOR[1],0,2.55]]);
 const BW=[[74.4,75.4],[78.7,79.7],[83.1,84.1],[89,90],[92.6,93.4]];ow('x',S.x0-t/2,S.x1+t/2,S.zb,[...BW.map(([a,b],i)=>[a,b,i==4?2.2:2.4,i==4?2.8:3.0]),]);
 ow('z',S.zb+t/2,S.zf-t/2,S.x0,[]);ow('z',S.zb+t/2,S.zf-t/2,S.x1,[[-1022.6,-1019.4,1.0,2.6]]);
 for(const[a,b]of FW)win(g,'x',a,b,S.zf,1.0,2.6,t,1);for(const[a,b]of BW.slice(0,4))win(g,'x',a,b,S.zb,2.4,3.0,t,-1,{noblind:1,bars:5});win(g,'x',92.6,93.4,S.zb,2.2,2.8,t,-1,{noblind:1});
 win(g,'z',-1022.6,-1019.4,S.x1,1.0,2.6,t,1);
 /* the floor slab (each room gets its own finish on top in later batches) */B(S.x1-S.x0,.02,S.zf-S.zb,MT.conc,(S.x0+S.x1)/2,.01,(S.zf+S.zb)/2,null,2);
 /* plinth, navy band, cornice, coping: proud of the wall, broken at the doors */
 const band=(y0,y1,pr,mat,skipDoors)=>{const yc=(y0+y1)/2,hh=y1-y0;const seg=(axis,a0,a1,c,out,gaps)=>{let cuts=[[a0,a1]];for(const[u,v]of gaps||[]){const n=[];for(const[p,q]of cuts){if(v<=p||u>=q){n.push([p,q]);continue}if(u>p)n.push([p,u]);if(v<q)n.push([v,q])}cuts=n}/* outside only: from just inside the outer face to pr beyond it */const d=pr+.01,cc=c+out*(t/2+pr/2-.005);for(const[p,q]of cuts)B(...(axis=='x'?[q-p,hh,d]:[d,hh,q-p]),mat,...(axis=='x'?[(p+q)/2,yc,cc]:[cc,yc,(p+q)/2]),null,mat===MT.stone?1:2)};
  seg('x',S.x0-t/2-pr,S.x1+t/2+pr,S.zf,1,skipDoors?[[DOOR[0]-.02,DOOR[1]+.02]]:null);seg('x',S.x0-t/2-pr,S.x1+t/2+pr,S.zb,-1,[[94.06,95.14]]);seg('z',S.zb-t/2+.001,S.zf+t/2-.001,S.x0,-1);seg('z',S.zb-t/2+.001,S.zf+t/2-.001,S.x1,1)};
 band(0,.6,.04,MT.stone,1);band(3.1,3.32,.03,MT.navy);band(4.15,4.32,.07,MT.trim);band(PH,PH+.08,.06,MT.trim);
 /* pilasters on the front, between the windows */for(const x of[64.55,71,77.8,82.7,87.9,90.4,95.45])B(.5,4.15-.6,.08,MT.stucco,x,.6+(4.15-.6)/2,S.zf+t/2+.04,null,2);
 /* the roof: a membrane between the parapets, with a drip edge */B(S.x1-S.x0-t,.22,S.zf-S.zb-t,MT.roof,(S.x0+S.x1)/2,H+.11,(S.zf+S.zb)/2,null,3);
 /* roof kit: three AC units, vents, a hatch, the radio mast, a dish, the siren */
 for(const[x,z]of[[70,-1028],[80,-1027.8],[92,-1029]]){const o=B(1.6,.9,1.1,M(0xb8b8b0,{metalness:.4,roughness:.5}),x,H+.22+.45,z);Cy(.42,.42,.04,MT.dark,x,H+.22+.92,z,null,null,18);for(let i=0;i<4;i++){const a=i/4*Math.PI;const b=B(.8,.02,.06,MT.dark,x,H+.22+.95,z);b.rotation.y=a}/* the pipe runs from the unit's side down into the roof */rod([x+.79,H+.5,z+.3],[x+1.2,H+.5,z+.3],.035,MT.steel);rod([x+1.2,H+.5,z+.3],[x+1.2,H+.2,z+.3],.035,MT.steel)}
 for(const[x,z]of[[75,-1022],[86,-1022],[66,-1020]])Cy(.12,.12,.6,MT.steel,x,H+.22+.3,z,null,null,10);
 B(1.0,.25,1.0,M(0x8a8c90,{metalness:.5}),88,H+.35,-1029.5);
 {const mx=66,mz=-1030.2,top=H+.22+7;for(const[a,b]of[[-.3,-.3],[.3,-.3],[0,.3]])rod([mx+a,H+.22,mz+b],[mx+a*.3,top,mz+b*.3],.03,MT.steel);for(let y=H+1;y<top-.5;y+=1){const f=(y-H)/7,s=1-f*.7;rod([mx-.3*s,y,mz-.3*s],[mx+.3*s,y+1,mz-.3*s],.015,MT.steel);rod([mx+.3*s,y,mz-.3*s],[mx,y+1,mz+.3*s],.015,MT.steel);rod([mx,y,mz+.3*s],[mx-.3*s,y+1,mz-.3*s],.015,MT.steel)}
  Cy(.02,.02,1.4,MT.steel,mx,top+.7,mz,null,null,6);const lt=A(new THREE.SphereGeometry(.08,10,8),M(0xff2020,{emissive:0xff2020,emissiveIntensity:1.5}),mx,top+1.45,mz);blink.push(lt);for(const s of[-1,1])B(.05,.6,.05,M(0xe8e8e8),mx+s*.2,top-1,mz-.1)}
 {/* the dish: a post, a bracket, the dish with its back on the bracket (facing +z, tilted up 30 degrees), a feed arm to the LNB */const dg=new THREE.Group();dg.position.set(94,H+.22,-1026);g.add(dg);const d=k.H(dg);d.B(.3,.06,.3,MT.steel,0,.03,0);d.Cy(.04,.04,.9,MT.steel,0,.48,0,null,null,8);
  const el=.52,fwd=new THREE.Vector3(0,Math.sin(el),Math.cos(el)),P=new THREE.Vector3(0,.95,.06),r=.5,th=.8;d.B(.12,.12,.12,MT.dark,0,.93,.02);
  const dish=d.A(new THREE.SphereGeometry(r,20,8,0,Math.PI*2,0,th),M(0xe8e8e4,{side:THREE.DoubleSide,roughness:.5}),0,0,0);dish.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),fwd.clone().negate());dish.position.copy(P.clone().addScaledVector(fwd,r));
  const F=P.clone().addScaledVector(fwd,r*.62),rim=P.clone().addScaledVector(fwd,r*(1-Math.cos(th))).add(new THREE.Vector3(0,-Math.cos(el),Math.sin(el)).multiplyScalar(r*Math.sin(th)*.96));d.rod([rim.x,rim.y,rim.z],[F.x,F.y,F.z],.012,MT.steel);
  const lnb=d.Cy(.035,.03,.12,MT.dark,F.x,F.y,F.z,null,null,10);lnb.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),fwd)}
 {const sx=90,sz=-1018.6,y0=H+.22;B(.1,.75,.1,MT.dark,sx,y0+.375,sz);B(.5,.3,.3,M(0x8a8c90,{metalness:.6}),sx,y0+.9,sz);for(const d of[-1,1])Cy(.16,.06,.3,M(0x8a8c90,{metalness:.6}),sx+d*.4,y0+.9,sz,'x',null,10).rotation.z=-d*Math.PI/2}
 /* DESERT PD letters on the parapet, a police star either side */
 /* the raised entrance bay over the middle of the front, with the name on it */{const bx0=81.4,bx1=90.6,bz1=S.zf+t/2,bz0=S.zf-1.4,top=6.25;
  B(bx1-bx0,top-PH,t,MT.stucco,(bx0+bx1)/2,(PH+top)/2,S.zf,null,2);for(const x of[bx0+t/2,bx1-t/2])B(t,top-PH,bz1-bz0-t,MT.stucco,x,(PH+top)/2,(bz0+bz1-t)/2+.0,null,2);B(bx1-bx0,top-PH,t,MT.stucco,(bx0+bx1)/2,(PH+top)/2,bz0+t/2,null,2);
  B(bx1-bx0+.14,.08,bz1-bz0+.14,MT.trim,(bx0+bx1)/2,top+.04,(bz0+bz1)/2);B(bx1-bx0+.1,.14,.08,MT.trim,(bx0+bx1)/2,top-.25,bz1+.04);
  lab('DESERT PD',7.0,.85,null,'#22305a',0,86,5.45,bz1+.012,0);}
 const star=k.can(256,256,(c,w,h)=>{c.fillStyle='#22305a';c.beginPath();c.arc(128,128,124,0,7);c.fill();c.fillStyle='#d8a830';c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?44:104;c.lineTo(128+Math.cos(a)*r,128+Math.sin(a)*r)}c.fill();c.fillStyle='#22305a';c.beginPath();c.arc(128,128,30,0,7);c.fill()});
 for(const x of[82.3,89.7]){const p=A(new THREE.CircleGeometry(.36,28),new THREE.MeshStandardMaterial({map:star,roughness:.5,metalness:.3}),x,5.45,S.zf+t/2+.012)}
 /* the main door: two glass doors standing open inward, a transom, the frame */
 {const z=S.zf;for(const u of[DOOR[0]+.04,DOOR[1]-.04])B(.08,2.55,t+.04,MT.frame,u,1.275,z);B(DOOR[1]-DOOR[0],.08,t+.04,MT.frame,(DOOR[0]+DOOR[1])/2,2.51,z);
  for(const s of[-1,1]){const hx=s<0?DOOR[0]+.08:DOOR[1]-.08;const dg=new THREE.Group();dg.position.set(hx,0,z-t/2);dg.rotation.y=s<0?1.35:-1.35;g.add(dg);const d=k.H(dg);const w=.5;/* frame: two stiles, top and bottom rails, glass between */for(const u of[.03,w-.03])d.B(.06,2.43,.045,MT.frame,-s*u,1.235,0);d.B(w,.06,.045,MT.frame,-s*w/2,2.42,0);d.B(w,.16,.045,MT.frame,-s*w/2,.1,0);d.A(new THREE.PlaneGeometry(w-.12,2.21),MT.glass,-s*w/2,1.29,0);d.B(.03,.3,.04,MT.steel,-s*(w-.09),1.1,.045);d.lab('PUSH',.24,.08,null,'#e8e8e8',0,-s*w/2,1.32,.003,0)}}
 /* the portico: two columns, a canopy, POLICE on the fascia, lights underneath; blue lamps by the door */
 {const z0=S.zf+t/2,z1=-1014.6,x0=84.4,x1=87.6;B(x1-x0,.26,z1-z0,MT.trim,(x0+x1)/2,3.08,(z0+z1)/2);B(x1-x0+.04,.32,.08,MT.navy,(x0+x1)/2,3.08,z1+.03);lab('POLICE',2.4,.26,null,'#ffffff',0,86,3.08,z1+.072,0,null,{glow:.6});
  for(const x of[84.75,87.25]){Cy(.13,.15,2.95,MT.trim,x,1.475,-1015,null,null,16);B(.36,.12,.36,MT.stone,x,.06,-1015);B(.34,.1,.34,MT.trim,x,2.9,-1015);obs.push({x0:x-.2,x1:x+.2,z0:-1015.2,z1:-1014.8})}
  for(const x of[85.3,86.7])A(new THREE.CircleGeometry(.12,14),MT.warm,x,2.94,-1016).rotation.x=Math.PI/2;
  for(const x of[84.95,87.05]){B(.1,.1,.12,MT.dark,x,2.05,z0+.06);const lp=B(.22,.3,.22,MT.blueL,x,2.3,z0+.2);B(.26,.04,.26,MT.dark,x,2.47,z0+.2);B(.26,.04,.26,MT.dark,x,2.13,z0+.2);lab('POLICE',.2,.07,'#2050ff','#ffffff',0,x,2.3,z0+.312,0)}}
 /* CCTV on the front corners, wall lamps on the sides, a downpipe, the fire door at the back */
 for(const[x,z,ry]of[[S.x0+.25,S.zf+.25,.7],[S.x1-.25,S.zf+.25,-.7]]){const cg=new THREE.Group();cg.position.set(x,3.6,z);cg.rotation.y=ry;g.add(cg);const c=k.H(cg);c.B(.06,.06,.2,MT.dark,0,0,-.05);c.B(.14,.12,.3,M(0xe8e8e4),0,-.08,.12).rotation.x=.4;c.Cy(.04,.04,.02,M(0x101010),0,-.15,.27,'z',null,10)}
 for(const z of[-1027,-1021])for(const[x,s]of[[S.x0,-1],[S.x1,1]]){B(.06,.25,.06,MT.dark,x+s*(t/2+.05),2.6,z);B(.24,.18,.24,MT.warm,x+s*(t/2+.2),2.42,z);B(.28,.05,.28,MT.dark,x+s*(t/2+.2),2.53,z)}
 for(const x of[S.x0+.2,S.x1-.2]){Cy(.05,.05,PH,MT.steel,x,PH/2,S.zb-t/2-.06,null,null,8)}
 {/* the fire door: a frame proud of the wall (the plinth stops either side), the door, a push bar, the sign above */const z=S.zb-t/2,x=94.6;for(const u of[x-.54,x+.54])B(.08,2.2,.08,MT.frame,u,1.1,z-.03);B(1.16,.08,.08,MT.frame,x,2.18,z-.03);B(1.0,2.12,.04,M(0x7a2a2a,{metalness:.4,roughness:.5}),x,1.06,z-.025);B(.6,.05,.05,MT.steel,x,1.0,z-.07);lab('FIRE EXIT · KEEP CLEAR',.9,.16,'#2a8a3a','#ffffff',0,x,2.42,z-.012,Math.PI)}
 map.push([S.x0,S.x1,S.zb,S.zf,'#4a5a8a']);pdNoSeam(g);for(const m of blink)m.userData.dpKeep=1;
 return{obs,map,blink,floorY:.02}}

/* ---------------------------------------- the courthouse, outside ---------------------------------------- */
function pdCourtShell(g){const k=pdKit(),{MT,M,wall,win}=k,{A,B,Cy,rod,lab}=k.H(g),C=PDC,obs=[],map=[],flags=[];const t=.4,H=C.H;
 const ow=(axis,a0,a1,c,holes)=>{obs.push(...wall(g,axis,a0,a1,c,H,t,MT.ashlar,holes,4))};
 const FW=[[43.4,45.4],[54.6,56.6]],SW=[[-1028.6,-1027.2],[-1025.2,-1023.8],[-1020.4,-1019]],DOOR=[49.2,50.8];
 ow('x',C.x0-t/2,C.x1+t/2,C.z1,[...FW.map(([a,b])=>[a,b,1.3,4.6]),[DOOR[0],DOOR[1],0,3.2]]);ow('x',C.x0-t/2,C.x1+t/2,C.z0,[]);
 ow('z',C.z0+t/2,C.z1-t/2,C.x0,SW.map(([a,b])=>[a,b,1.3,4.6]));ow('z',C.z0+t/2,C.z1-t/2,C.x1,SW.map(([a,b])=>[a,b,1.3,4.6]));
 const SUR=M(0xece6d8,{roughness:.8});
 for(const[a,b]of FW){win(g,'x',a,b,C.z1,1.3,4.6,t,1,{frame:M(0x3a3028),sill:SUR});B(b-a+.36,.3,.12,SUR,(a+b)/2,4.75,C.z1+t/2+.06);B(.3,.36,.14,SUR,(a+b)/2,4.78,C.z1+t/2+.07)}
 for(const s of[-1,1])for(const[a,b]of SW){win(g,'z',a,b,s<0?C.x0:C.x1,1.3,4.6,t,s,{frame:M(0x3a3028),sill:SUR});B(.12,.3,b-a+.36,SUR,(s<0?C.x0:C.x1)+s*(t/2+.06),4.75,(a+b)/2)}
 B(C.x1-C.x0,.02,C.z1-C.z0,MT.conc,(C.x0+C.x1)/2,.01,(C.z0+C.z1)/2,null,2);
 /* plinth and cornice all round */
 const band=(y0,y1,pr,mat,gaps)=>{const yc=(y0+y1)/2,hh=y1-y0;const run=(axis,a0,a1,c,out,gp)=>{let cuts=[[a0,a1]];for(const[u,v]of gp||[]){const n=[];for(const[p,q]of cuts){if(v<=p||u>=q){n.push([p,q]);continue}if(u>p)n.push([p,u]);if(v<q)n.push([v,q])}cuts=n}const d=pr+.01,cc=c+out*(t/2+pr/2-.005);for(const[p,q]of cuts)B(...(axis=='x'?[q-p,hh,d]:[d,hh,q-p]),mat,...(axis=='x'?[(p+q)/2,yc,cc]:[cc,yc,(p+q)/2]),null,1)};
  run('x',C.x0-t/2-pr,C.x1+t/2+pr,C.z1,1,gaps);run('x',C.x0-t/2-pr,C.x1+t/2+pr,C.z0,-1);run('z',C.z0-t/2+.001,C.z1+t/2-.001,C.x0,-1);run('z',C.z0-t/2+.001,C.z1+t/2-.001,C.x1,1)};
 band(0,.9,.06,MT.stone,[[DOOR[0]-.02,DOOR[1]+.02]]);band(H-.4,H,.12,SUR);band(H,H+.12,.2,SUR);
 /* the gable roof, ridge along z at x 50 */{const rise=1.5,hw=(C.x1-C.x0)/2+.45,L=C.z1-C.z0+.9,ang=Math.atan(rise/hw),sl=Math.hypot(hw,rise);
  for(const s of[-1,1]){const r=B(sl+.05,.12,L,MT.lead,50+s*hw/2,H+.12+rise/2,(C.z0+C.z1)/2,null,2);r.rotation.z=-s*ang}B(.18,.18,L,M(0x4a5a58,{metalness:.4}),50,H+.12+rise+.04,(C.z0+C.z1)/2);
  /* gable ends: stone triangles front and back */for(const z of[C.z1,C.z0]){const sh=new THREE.Shape();sh.moveTo(-(C.x1-C.x0)/2-t/2,0);sh.lineTo((C.x1-C.x0)/2+t/2,0);sh.lineTo(0,rise);sh.lineTo(-(C.x1-C.x0)/2-t/2,0);const geo=new THREE.ExtrudeGeometry(sh,{depth:t,bevelEnabled:false});geo.translate(0,0,-t/2);const uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/4,uv.getY(i)/4);A(geo,MT.ashlar,50,H+.12,z)}}
 /* the portico: floor, six fluted columns, architrave and frieze, the pediment with the clock, its roof (front = +z) */
 const PZ0=C.z1+t/2,PZ1=-1015.5,PX0=46,PX1=54,CH=5.0,FZ=PZ1+.3,D=FZ-PZ0;
 B(PX1-PX0+.4,.04,PZ1+.2-PZ0,MT.stone,50,.02,(PZ0+PZ1+.2)/2,null,1);
 const flute=k.can(256,64,(x,w,h)=>{x.fillStyle='#ece6d8';x.fillRect(0,0,w,h);for(let i=0;i<16;i++){const g2=x.createLinearGradient(i*16,0,i*16+16,0);g2.addColorStop(0,'rgba(0,0,0,.18)');g2.addColorStop(.5,'rgba(255,255,255,.1)');g2.addColorStop(1,'rgba(0,0,0,.18)');x.fillStyle=g2;x.fillRect(i*16,0,16,h)}});const FL=new THREE.MeshStandardMaterial({map:flute,roughness:.8});
 const CX=[46.4,47.84,49.28,50.72,52.16,53.6],CZ=-1015.85;for(const x of CX){B(.5,.16,.5,SUR,x,.12,CZ);Cy(.25,.25,.08,SUR,x,.24,CZ,null,null,20);Cy(.2,.23,CH-.62,FL,x,.28+(CH-.62)/2,CZ,null,null,24);Cy(.28,.21,.16,SUR,x,CH-.26,CZ,null,null,20);B(.58,.12,.58,SUR,x,CH-.12,CZ);obs.push({x0:x-.26,x1:x+.26,z0:CZ-.26,z1:CZ+.26})}
 B(PX1-PX0+.6,.5,D,SUR,50,CH+.25,(PZ0+FZ)/2);lab('COURT OF DARK LAW',7.0,.4,null,'#2a2620',0,50,CH+.25,FZ+.011,0,null,{w:'600'});
 B(PX1-PX0+.8,.14,D+.2,SUR,50,CH+.57,(PZ0+FZ)/2+.1);
 {const W2=(PX1-PX0)/2+.4,rise=1.3,Y=CH+.64;const sh=new THREE.Shape();sh.moveTo(-W2,0);sh.lineTo(W2,0);sh.lineTo(0,rise);sh.lineTo(-W2,0);const geo=new THREE.ExtrudeGeometry(sh,{depth:D,bevelEnabled:false});A(geo,SUR,50,Y,PZ0);
  const ang=Math.atan(rise/W2),sl=Math.hypot(W2,rise);for(const s of[-1,1]){const r=B(sl+.3,.1,D+.3,MT.lead,50+s*W2/2,Y+rise/2+.06,(PZ0+FZ)/2+.15,null,2);r.rotation.z=-s*ang}
  /* the tympanum panel and the clock, on the front face */const ins=new THREE.Shape();ins.moveTo(-W2+.5,.12);ins.lineTo(W2-.5,.12);ins.lineTo(0,rise-.28);ins.lineTo(-W2+.5,.12);A(new THREE.ShapeGeometry(ins),M(0xd8d0c0,{roughness:.9}),50,Y,FZ+.012);
  const ck=k.can(256,256,(x,w,h)=>{x.fillStyle='#f4efe2';x.beginPath();x.arc(128,128,124,0,7);x.fill();x.strokeStyle='#2a2620';x.lineWidth=8;x.stroke();x.fillStyle='#2a2620';x.font='bold 30px DoorsSans,Arial';x.textAlign='center';x.textBaseline='middle';['XII','III','VI','IX'].forEach((n,i)=>{const a=-Math.PI/2+i*Math.PI/2;x.fillText(n,128+Math.cos(a)*92,128+Math.sin(a)*92)});x.lineWidth=7;x.beginPath();x.moveTo(128,128);x.lineTo(128,58);x.stroke();x.lineWidth=5;x.beginPath();x.moveTo(128,128);x.lineTo(186,150);x.stroke()});
  Cy(.42,.42,.06,M(0x8a6a2a,{metalness:.6}),50,Y+.52,FZ+.04,'z',null,24);A(new THREE.CircleGeometry(.37,24),new THREE.MeshStandardMaterial({map:ck,roughness:.6}),50,Y+.52,FZ+.072)}
 /* the doors: big wooden leaves standing open, a stone surround, the scales above, lamps */
 {const z=C.z1;B(DOOR[1]-DOOR[0]+.5,.35,t+.1,SUR,50,3.38,z);for(const u of[DOOR[0]-.12,DOOR[1]+.12])B(.24,3.2,t+.1,SUR,u,1.6,z);
  for(const s of[-1,1]){const hx=s<0?DOOR[0]:DOOR[1];const dg=new THREE.Group();dg.position.set(hx,0,z-t/2);dg.rotation.y=s<0?1.4:-1.4;g.add(dg);const d=k.H(dg);d.B(.8,3.15,.08,MT.wood,-s*.4,1.58,0);for(const y of[.8,2.2])d.B(.6,1.0,.03,M(0x5a3a20),-s*.4,y,.05);d.Cy(.04,.04,.12,MT.gold,-s*.7,1.3,.08,'z',null,8)}
  const sc=k.can(256,256,(x,w,h)=>{x.clearRect(0,0,w,h);x.strokeStyle='#2a2620';x.fillStyle='#2a2620';x.lineWidth=8;x.beginPath();x.moveTo(128,30);x.lineTo(128,220);x.stroke();x.beginPath();x.moveTo(40,70);x.lineTo(216,70);x.stroke();x.fillRect(90,214,76,12);for(const cx of[56,200]){x.beginPath();x.moveTo(cx,70);x.lineTo(cx-30,150);x.moveTo(cx,70);x.lineTo(cx+30,150);x.lineWidth=3;x.stroke();x.beginPath();x.arc(cx,150,34,0,Math.PI);x.fill()}x.lineWidth=8;x.beginPath();x.arc(128,30,10,0,7);x.fill()});
  const scp=A(new THREE.PlaneGeometry(.9,.9),new THREE.MeshStandardMaterial({map:sc,transparent:true,roughness:.8}),50,4.15,z+t/2+.012);
  for(const x of[48.5,51.5]){B(.06,.3,.06,MT.dark,x,2.8,z+t/2+.08);const l=B(.26,.4,.26,MT.warm,x,2.55,z+t/2+.25);B(.3,.05,.3,MT.dark,x,2.78,z+t/2+.25);B(.06,.05,.25,MT.dark,x,2.8,z+t/2+.12)}
  lab('COURT OF DARK LAW · EST. ROOM 1',1.6,.2,'#2a2620','#e8dcb0',0,52.6,1.6,z+t/2+.012,0)}
 /* two flags on poles at the front corners */for(const[x,col]of[[44.6,'#22305a'],[55.4,'#7a2020']]){Cy(.05,.06,7.5,MT.steel,x,3.75,-1015.4,null,null,10);A(new THREE.SphereGeometry(.08,10,8),MT.gold,x,7.55,-1015.4);B(.3,.2,.3,MT.stone,x,.1,-1015.4);obs.push({x0:x-.2,x1:x+.2,z0:-1015.6,z1:-1015.2});
  const ft=k.can(256,160,(c,w,h)=>{c.fillStyle=col;c.fillRect(0,0,w,h);c.fillStyle='#d8a830';c.font='bold 46px DoorsSans,Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(col=='#22305a'?'DOORS':'DARK LAW',w/2,h/2)});
  const geo=new THREE.PlaneGeometry(1.6,1.0,8,1);const f=A(geo,new THREE.MeshStandardMaterial({map:ft,side:THREE.DoubleSide,roughness:.9}),x+.85,6.8,-1015.4);flags.push(f);f.userData.dpKeep=1}
 map.push([C.x0,C.x1,C.z0,C.z1,'#d8d0c0']);map.push([PX0,PX1,PZ0,PZ1,'#d8d0c0']);pdNoSeam(g);
 return{obs,map,flags}}
/* flags wave: call each frame with the time */
function pdFlagWave(flags,t){for(const f of flags){const p=f.geometry.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i)+.8;p.setZ(i,Math.sin(t*3+x*3)*.08*x)}p.needsUpdate=true}}

/* ---------------------------------------- the forecourt ---------------------------------------- */
function pdForecourt(g){const k=pdKit(),{MT,M}=k,{A,B,Cy,rod,lab}=k.H(g),obs=[],map=[],lamps=[];const ZF=PDS.zf+.15,ZK=-1013.3;
 /* paving: the front strip, the alley, the yard (3 cm) */B(106-42,.03,ZK-ZF,MT.pave,74,.015,(ZF+ZK)/2,null,2);B(PDS.x0-.15-(PDC.x1+.2),.03,ZF-PDC.z0,MT.pave,(PDS.x0-.15+PDC.x1+.2)/2,.015,(ZF+PDC.z0)/2,null,2);B(106-(PDS.x1+.15),.03,ZF+1025,MT.pave,(106+PDS.x1+.15)/2,.015,(-1025+ZF)/2,null,2);B(16,.03,.45,MT.pave,50,.015,ZF-.225,null,2);
 /* the kerb along the front, dropped across the driveway mouth */for(const[a,b]of[[42,84.5],[91.5,106]])B(b-a,.12,.2,MT.conc,(a+b)/2,.06,ZK+.1,null,2);for(const x of[84.5,91.5])B(.4,.06,.2,MT.conc,x+(x<88?-.2:.2),.03,ZK+.1,null,2);
 /* lamp posts */for(const x of[44,56.5,62,70,80,93.5,100.5,105])/* skip the door lines */{const z=-1013.75;B(.3,.3,.3,MT.dark,x,.165,z);Cy(.06,.08,4.4,MT.dark,x,2.5,z,null,null,10);/* the arm reaches out over the street, away from the building */rod([x,4.6,z],[x,4.75,z+.6],.04,MT.dark);const hd=B(.32,.18,.4,MT.dark,x,4.72,z+.75);const l=A(new THREE.PlaneGeometry(.26,.32),MT.warm,x,4.62,z+.75);l.rotation.x=Math.PI/2;lamps.push(l);obs.push({x0:x-.18,x1:x+.18,z0:z-.18,z1:z+.18})}
 /* planters with cacti under the station windows */const cactus=(x,z,h)=>{const G=M(0x4a7a3a,{roughness:.85});Cy(.12,.14,h,G,x,.5+h/2,z,null,null,10);A(new THREE.SphereGeometry(.12,10,6,0,Math.PI*2,0,Math.PI/2),G,x,.5+h,z);if(h>.8){Cy(.07,.07,.35,G,x+.2,.5+h*.55,z,null,null,8);rod([x+.1,.5+h*.45,z],[x+.2,.5+h*.45,z],.07,G,null,8);A(new THREE.SphereGeometry(.07,8,5,0,Math.PI*2,0,Math.PI/2),G,x+.2,.5+h*.55+.175,z)}};
 for(const x of[67.5,74.5,81.2,92.9]){B(1.8,.5,.6,MT.conc,x,.25,ZF+.32,null,1);B(1.66,.04,.46,M(0x6a4a2a,{roughness:1}),x,.49,ZF+.32);cactus(x-.45,ZF+.32,.9);cactus(x+.35,ZF+.32,.55);A(new THREE.DodecahedronGeometry(.1,0),M(0x9a8a74),x+.1,.53,ZF+.38);obs.push({x0:x-.9,x1:x+.9,z0:ZF+.02,z1:ZF+.62})}
 /* benches facing the street, bins, the bike rack */const bench=(x,z)=>{B(1.6,.06,.42,MT.wood,x,.45,z);B(1.6,.4,.05,MT.wood,x,.72,z-.2).rotation.x=-.12;for(const s of[-.7,.7]){B(.06,.45,.42,MT.dark,x+s,.22,z);B(.06,.4,.06,MT.dark,x+s,.65,z-.2)}obs.push({x0:x-.8,x1:x+.8,z0:z-.25,z1:z+.22})};
 bench(77,-1014.5);bench(96.8,-1014.5);bench(59.2,-1014.5);for(const x of[78.3,98.1,60.5]){Cy(.22,.2,.8,M(0x2a3a5a,{metalness:.3}),x,.4,-1014.5,null,null,14);Cy(.23,.23,.04,MT.dark,x,.82,-1014.5,null,null,14);obs.push({x0:x-.24,x1:x+.24,z0:-1014.74,z1:-1014.26})}
 {const x0=64.6,z=-1014.1;for(let i=0;i<5;i++){const x=x0+i*.5;const sh=new THREE.TorusGeometry(.4,.025,6,16,Math.PI);const m=A(sh,MT.steel,x,0,z);m.rotation.y=Math.PI/2}obs.push({x0:x0-.1,x1:x0+2.1,z0:z-.35,z1:z+.35})}
 /* the notice board on the wall by the door */{const z=PDS.zf+.15+.025,x=83.8;B(1.2,.9,.05,MT.wood,x,1.7,z);const nb=k.can(512,360,(c,w,h)=>{c.fillStyle='#b8946a';c.fillRect(0,0,w,h);const P=[['WANTED','THE DARK SPEEDSTER','#f0e6c8','#a01010'],['LOST','ONE CACTUS\n(ANSWERS TO STEVE)','#ffffff','#202020'],['BAKE SALE','DONUTS · SAT','#f8e0f0','#8a2a6a'],['NEIGHBOURHOOD\nWATCH','WE ARE\nWATCHING','#e0f0ff','#22305a']];P.forEach(([a,b,bg,fg],i)=>{const px=20+(i%2)*250,py=20+(i/2|0)*170,ww=220,hh=150;c.save();c.translate(px+ww/2,py+hh/2);c.rotate((i%3-1)*.04);c.fillStyle=bg;c.fillRect(-ww/2,-hh/2,ww,hh);c.fillStyle=fg;c.textAlign='center';c.font='bold 30px DoorsSans,Arial';a.split('\n').forEach((l,j)=>c.fillText(l,0,-hh/2+36+j*30));c.font='22px DoorsSans,Arial';b.split('\n').forEach((l,j)=>c.fillText(l,0,hh/2-38+j*24));c.fillStyle='#c02020';c.beginPath();c.arc(0,-hh/2+8,6,0,7);c.fill();c.restore()})});
  A(new THREE.PlaneGeometry(1.1,.8),new THREE.MeshStandardMaterial({map:nb,roughness:.9}),x,1.7,z+.026);lab('NOTICES',.9,.14,null,'#22305a',0,x,2.25,z+.026,0)}
 /* SURRENDER HERE: a painted box on the paving under the portico */{const t=k.can(512,320,(c,w,h)=>{c.clearRect(0,0,w,h);c.strokeStyle='#f0c020';c.lineWidth=18;c.strokeRect(14,14,w-28,h-28);c.fillStyle='#f0c020';c.font='bold 74px DoorsSans,Arial';c.textAlign='center';c.textBaseline='middle';c.fillText('SURRENDER',w/2,h/2-40);c.fillText('HERE',w/2,h/2+46)});
  const p=A(new THREE.PlaneGeometry(1.7,1.06),new THREE.MeshStandardMaterial({map:t,transparent:true,roughness:.9,polygonOffset:true,polygonOffsetUnits:-2}),86,.034,-1015.75);p.rotation.x=-Math.PI/2}
 map.push([42,106,ZF,ZK,'#bdb4a4']);pdNoSeam(g);for(const l of lamps)l.userData.dpKeep=0;
 return{obs,map,lamps}}

/* =====================================================================================================
   Batch 2, the front rooms (z -1024.5..-1017.5): booking, Chief Seek's office, the lobby, the break room.
   pdInterior(k)      shared bits for every room: painted walls with a navy wainscot and a chair rail, linings on the
                      inside of the outer walls, floors, drop ceilings with light panels, door frames and open doors.
   pdFrontRooms(g,o)  the four rooms. o.you = the player's name for the first WANTED poster.
                      Returns {obs, spots, posters, lights}: spots = {bell, donut, mugshot, home, path} (see desert-pd.md).
   ===================================================================================================== */
function pdInterior(){if(pdInterior.I)return pdInterior.I;const k=pdKit(),{M,can,R}=k;
 const tile=can(256,256,(x,w,h)=>{for(let i=0;i<4;i++)for(let j=0;j<4;j++){x.fillStyle=(i+j)%2?'#d8d4cc':'#4a5468';x.fillRect(i*64,j*64,64,64)}for(let n=0;n<2500;n++){x.fillStyle='rgba(0,0,0,'+R()*.05+')';x.fillRect(R()*w,R()*h,2,2)}x.strokeStyle='rgba(40,40,40,.4)';x.lineWidth=1;for(let i=0;i<=4;i++){x.beginPath();x.moveTo(i*64,0);x.lineTo(i*64,h);x.stroke();x.beginPath();x.moveTo(0,i*64);x.lineTo(w,i*64);x.stroke()}},1);/* 2 m */
 const carpet=can(128,128,(x,w,h)=>{x.fillStyle='#4a5266';x.fillRect(0,0,w,h);for(let n=0;n<4000;n++){x.fillStyle=R()<.5?'rgba(255,255,255,.05)':'rgba(0,0,0,.08)';x.fillRect(R()*w,R()*h,1,1)}},1);
 const lino=(c1,c2)=>can(256,256,(x,w,h)=>{x.fillStyle=c1;x.fillRect(0,0,w,h);for(let i=0;i<8;i++)for(let j=0;j<8;j++){if((i*3+j*5)%7==0){x.fillStyle=c2;x.fillRect(i*32+1,j*32+1,30,30)}}x.strokeStyle='rgba(0,0,0,.12)';for(let i=0;i<=8;i++){x.beginPath();x.moveTo(i*32,0);x.lineTo(i*32,h);x.stroke();x.beginPath();x.moveTo(0,i*32);x.lineTo(w,i*32);x.stroke()}for(let n=0;n<1500;n++){x.fillStyle='rgba(0,0,0,'+R()*.05+')';x.fillRect(R()*w,R()*h,2,2)}},1);
 const ceil=can(256,256,(x,w,h)=>{x.fillStyle='#ecebe6';x.fillRect(0,0,w,h);for(let n=0;n<3000;n++){x.fillStyle='rgba(0,0,0,'+R()*.06+')';x.fillRect(R()*w,R()*h,1,1)}x.strokeStyle='#b8b6ae';x.lineWidth=4;for(let i=0;i<=2;i++){x.beginPath();x.moveTo(i*128,0);x.lineTo(i*128,h);x.stroke();x.beginPath();x.moveTo(0,i*128);x.lineTo(w,i*128);x.stroke()}},1);/* 1.2 m: 0.6 m tiles */
 const F={tile:new THREE.MeshStandardMaterial({map:tile,roughness:.35,metalness:.05}),carpet:new THREE.MeshStandardMaterial({map:carpet,roughness:1}),linoG:new THREE.MeshStandardMaterial({map:lino('#b8c4b0','#9aaa94'),roughness:.6}),linoB:new THREE.MeshStandardMaterial({map:lino('#d8d0bc','#c0b49a'),roughness:.6}),
  ceil:new THREE.MeshStandardMaterial({map:ceil,roughness:.95,side:THREE.BackSide}),paint:M(0xe8e2d4,{roughness:.9}),wain:M(0x3a4660,{roughness:.7}),rail:M(0x6a4428,{roughness:.6}),panel:M(0xfff8ec,{emissive:0xfff4e0,emissiveIntensity:.9})};
 const HC=3.3;/* ceiling height */
 /* a partition: painted core to the ceiling, a navy wainscot (1 m) and a chair rail proud both sides, holes for doors */
 const part=(par,axis,a0,a1,c,holes,o)=>{o=o||{};const t=o.t||.16;const ob=k.wall(par,axis,a0,a1,c,HC+.02,t,o.mat||F.paint,holes,2);if(!o.nowain){k.wall(par,axis,a0,a1,c,1.0,t+.03,o.wain||F.wain,(holes||[]).filter(h=>h[2]<1),2);k.wall(par,axis,a0,a1,c,1.04,t+.05,F.rail,(holes||[]).filter(h=>h[2]<1),2,.99)}return ob};
 /* a lining on the inside face of an outer wall: inner face at c, the room on side s (+1/-1) */
 const lining=(par,axis,a0,a1,c,s,holes,o)=>{o=o||{};k.wall(par,axis,a0,a1,c+s*.011,HC+.02,.02,o.mat||F.paint,holes,2);if(!o.nowain){k.wall(par,axis,a0,a1,c+s*.0175,1.0,.035,o.wain||F.wain,(holes||[]).filter(h=>h[2]<1),2);k.wall(par,axis,a0,a1,c+s*.025,1.04,.05,F.rail,(holes||[]).filter(h=>h[2]<1),2,.99)}};
 /* floor finish, ceiling and light panels for a room */
 const room=(par,x0,x1,z0,z1,fm,o)=>{o=o||{};const{A,B}=k.H(par);B(x1-x0,.01,z1-z0,fm,(x0+x1)/2,.025,(z0+z1)/2,null,o.fs||2);
  const cg=new THREE.PlaneGeometry(x1-x0,z1-z0);const uv=cg.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*(x1-x0)/1.2,uv.getY(i)*(z1-z0)/1.2);const c=A(cg,F.ceil,(x0+x1)/2,HC,(z0+z1)/2);c.rotation.x=-Math.PI/2;
  const L=[];const nx=Math.max(1,Math.round((x1-x0)/3.6)),nz=Math.max(1,Math.round((z1-z0)/3.6));for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const p=A(new THREE.PlaneGeometry(1.15,.55),F.panel,x0+(i+.5)*(x1-x0)/nx,HC-.006,z0+(j+.5)*(z1-z0)/nz);p.rotation.x=Math.PI/2;L.push(p)}return L};
 /* a door frame (architrave) round an opening, and optionally an open door leaf hinged at one side */
 const door=(par,axis,a0,a1,c,t,o)=>{o=o||{};const{B}=k.H(par);const h=o.h||2.3,FR=o.fr||F.rail;/* jambs and head overlap the opening by 2 cm, so none of their faces sit on the wall's cut faces */for(const u of[a0-.02,a1+.02])B(...(axis=='x'?[.08,h+.06,t+.06]:[t+.06,h+.06,.08]),FR,...(axis=='x'?[u,(h+.06)/2,c]:[c,(h+.06)/2,u]));B(...(axis=='x'?[a1-a0+.2,.1,t+.06]:[t+.06,.1,a1-a0+.2]),FR,...(axis=='x'?[(a0+a1)/2,h+.03,c]:[c,h+.03,(a0+a1)/2]));
  if(o.leaf){/* hinge at a0 (or a1 if o.right), swung open by o.open radians to the side o.side (+1/-1) */const w=a1-a0-.08;const hx=o.right?a1-.03:a0+.03;const g=new THREE.Group();if(axis=='x')g.position.set(hx,0,c+o.side*(t/2));else g.position.set(c+o.side*(t/2),0,hx);par.add(g);
   const d=new THREE.Group();g.add(d);const dir=o.right?-1:1;const m=k.H(d);const LM=o.lm||M(0x8a6a48,{roughness:.6});if(axis=='x'){m.B(w,h-.04,.045,LM,dir*w/2,(h-.04)/2,o.side*.03);if(o.glass)m.lab(o.glass,w*.6,.3,'#d8e0e4','#22305a',0,dir*w/2,1.6,o.side*.055,o.side<0?Math.PI:0);m.Cy(.025,.025,.12,k.MT.gold,dir*(w-.08),1.0,o.side*.09,'z',null,8)}
   else{m.B(.045,h-.04,w,LM,o.side*.03,(h-.04)/2,dir*w/2);if(o.glass)m.lab(o.glass,w*.6,.3,'#d8e0e4','#22305a',0,o.side*.055,1.6,dir*w/2,o.side>0?Math.PI/2:-Math.PI/2);m.Cy(.025,.025,.12,k.MT.gold,o.side*.09,1.0,dir*(w-.08),'x',null,8)}
   /* always swing towards the side the hinge is on, so the leaf never passes through the wall */const op=o.open||1.4;g.rotation.y=axis=='x'?-o.side*dir*op:o.side*dir*op}};
 pdInterior.I={F,HC,part,lining,room,door};return pdInterior.I}

function pdFrontRooms(g,o){o=o||{};const k=pdKit(),I=pdInterior(),{M,MT,can}=k,{F,HC}=I,{A,B,Cy,rod,lab}=k.H(g),S=PDS,obs=[],posters=[],lights=[];const zf=S.zf-.15,zp=S.zp;
 /* the walls: the partition along the back of the front rooms, three cross walls */
 obs.push(...I.part(g,'x',S.x0+.15,S.x1-.15,zp,[[66.5,67.5,0,2.3],[83.8,84.8,0,2.3],[93.5,94.5,0,2.3]]));
 obs.push(...I.part(g,'z',zp+.08,zf,71,[]));obs.push(...I.part(g,'z',zp+.08,zf,78,[[-1022,-1021,0,2.3]]));obs.push(...I.part(g,'z',zp+.08,zf,90,[[-1022.4,-1021.4,0,2.3]]));
 /* linings inside the outer walls (front, and the two ends) */I.lining(g,'x',S.x0+.15,S.x1-.15,zf,-1,[[65.6,69.4,1.0,2.6],[72.4,76.6,1.0,2.6],[79,82.4,1.0,2.6],[85.4,86.6,0,2.55],[88.2,89.6,1.0,2.6],[91.2,94.8,1.0,2.6]]);
 I.lining(g,'z',zp+.08,zf,S.x0+.15,1,[]);I.lining(g,'z',zp+.08,zf,S.x1-.15,-1,[[-1022.6,-1019.4,1.0,2.6]]);
 /* floors, ceilings, lights */lights.push(...I.room(g,64.15,70.92,zp+.08,zf,F.linoG),...I.room(g,71.08,77.92,zp+.08,zf,F.carpet,{fs:1}),...I.room(g,78.08,89.92,zp+.08,zf,F.tile),...I.room(g,90.08,95.85,zp+.08,zf,F.linoB));
 /* door frames and doors */I.door(g,'x',66.5,67.5,zp,.16,{leaf:1,side:-1,open:1.5,lm:M(0x6a6e74,{metalness:.5,roughness:.4})});I.door(g,'x',83.8,84.8,zp,.16,{fr:MT.frame});I.door(g,'x',93.5,94.5,zp,.16,{leaf:1,side:1,open:1.4,right:1,ccw:1,glass:'RECORDS'});
 I.door(g,'z',-1022,-1021,78,.16,{leaf:1,side:-1,open:1.45,ccw:1,glass:'THE CHIEF'});I.door(g,'z',-1022.4,-1021.4,90,.16,{leaf:1,side:1,open:1.45,right:1,glass:'STAFF'});
 /* -------- the lobby (x 78..90) -------- */
 /* the front desk: a counter with a glass screen, the bell and the donut box on it (spots 84.9 / 85.5, -1020.7) */{const dz=-1021.5;B(4,1.05,.7,MT.navy,86,.525,dz);B(4.1,.06,.8,M(0x2a2a2e,{roughness:.4}),86,1.08,dz);B(4.1,.04,.36,MT.wood,86,1.13,dz+.24);
  for(const x of[84.05,85.35,86.65,87.95])B(.04,.62,.04,MT.frame,x,1.42,dz-.05);B(3.94,.04,.04,MT.frame,86,1.73,dz-.05);A(new THREE.PlaneGeometry(3.9,.6),MT.glass,86,1.42,dz-.05);
  lab('RECEPTION',1.4,.22,'#22305a','#ffffff',0,86,.82,dz+.352,0);lab('DESERT PD',1.2,.2,null,'#d8a830',0,87.6,.82,dz+.352,0);
  /* the bell */Cy(.07,.08,.02,MT.dark,84.9,1.16,dz+.25,null,null,14);A(new THREE.SphereGeometry(.065,14,8,0,Math.PI*2,0,Math.PI/2),MT.gold,84.9,1.17,dz+.25);Cy(.01,.01,.03,MT.gold,84.9,1.25,dz+.25,null,null,6);
  /* the donut box, lid up, four donuts */B(.42,.06,.3,M(0xf0e0c8),85.6,1.18,dz+.24);{const lid=B(.42,.01,.3,M(0xe8d4b8),85.6,1.36,dz+.08);lid.rotation.x=-1.2;lab('DONUTS',.3,.08,null,'#c04080',0,85.6,1.365,dz+.08,0).rotation.x=-1.2-Math.PI/2+Math.PI/2}
  for(let i=0;i<4;i++){const d=A(new THREE.TorusGeometry(.05,.025,8,14),M([0xff80b0,0x8a4a1a,0xffe0a0,0x6a3a20][i]),85.45+(i%2)*.15+(i>1?.0:0),1.23,dz+.19+(i>>1)*.1);d.rotation.x=Math.PI/2}
  /* behind: a monitor, a keyboard, papers, a chair, a mug */B(.5,.32,.04,MT.dark,86.8,1.32,dz-.25);B(.46,.28,.01,M(0x2060c0,{emissive:0x103060}),86.8,1.32,dz-.274);/* the screen faces the receptionist's chair */B(.12,.12,.12,MT.dark,86.8,1.13,dz-.27);B(.42,.02,.14,MT.dark,86.8,1.12,dz-.05);for(let i=0;i<3;i++)B(.22,.005,.3,M(0xf4f0e6),87.4,1.112+i*.006,dz-.15).rotation.y=i*.2;
  Cy(.04,.035,.1,M(0xffffff),87.8,1.16,dz-.1,null,null,10);{const c=new THREE.Group();c.position.set(86.8,0,dz-.85);c.rotation.y=Math.PI;/* facing the desk */g.add(c);const q=k.H(c);q.B(.5,.08,.5,MT.dark,0,.5,0);q.B(.5,.6,.08,MT.dark,0,.85,.25);q.Cy(.03,.03,.45,MT.steel,0,.25,0,null,null,6);for(let i=0;i<5;i++){const a=i/5*Math.PI*2;q.rod([0,.04,0],[Math.cos(a)*.28,.04,Math.sin(a)*.28],.02,MT.steel)}}
  obs.push({x0:84,x1:88,z0:dz-.4,z1:dz+.4})}
 /* the waiting bench along the office wall: five linked seats facing east */{const x=78.55;B(.5,.06,3.0,MT.steel,x+.05,.42,-1019.3);for(let i=0;i<5;i++){const z=-1020.5+i*.6;B(.46,.06,.5,M(0x22305a),x+.08,.47,z);B(.06,.46,.5,M(0x22305a),x-.17,.76,z)}for(const z of[-1020.7,-1017.9]){B(.4,.42,.05,MT.steel,x+.05,.21,z)}obs.push({x0:78.08,x1:78.85,z0:-1020.85,z1:-1017.75})}
 /* WANTED posters on the back wall, framed */const wanted=(nm,why,col,x)=>{const t=can(256,360,(c,w,h)=>{c.fillStyle='#f0e6c8';c.fillRect(0,0,w,h);c.fillStyle=col;c.font='bold 46px DoorsSans,Arial';c.textAlign='center';c.fillText('WANTED',w/2,54);c.fillStyle='#3a2a1a';c.fillRect(w*.2,72,w*.6,w*.55);c.fillStyle='#f0e6c8';c.font='bold 70px DoorsSans,Arial';c.fillText('?',w/2,72+w*.4);c.fillStyle='#2a1a0a';let f=30;c.font='bold '+f+'px DoorsSans,Arial';while(c.measureText(nm).width>w*.9&&f>12){f-=2;c.font='bold '+f+'px DoorsSans,Arial'}c.fillText(nm,w/2,h-62);c.font='20px DoorsSans,Arial';c.fillText(why,w/2,h-30)});
  B(.66,.92,.03,MT.wood,x,1.75,zp+.095);const p=A(new THREE.PlaneGeometry(.58,.82),new THREE.MeshStandardMaterial({map:t,roughness:.9}),x,1.75,zp+.112);posters.push(p);return p};
 wanted(o.you||'YOU','for crimes against sand','#a01010',80.4);wanted('JEFF','tax reasons','#a01010',81.3);wanted('DARK SPEEDSTER','being too fast','#101010',82.2);
 /* over the corridor door: PROCESSING and a clock; the "please wait" sign hanging over the desk */lab('PROCESSING · AUTHORISED PERSONNEL ONLY',1.5,.2,'#22305a','#ffffff',0,84.3,2.55,zp+.096,0);
 {const ck=can(128,128,(c,w,h)=>{c.fillStyle='#f8f8f4';c.beginPath();c.arc(64,64,62,0,7);c.fill();c.strokeStyle='#202020';c.lineWidth=5;c.stroke();for(let i=0;i<12;i++){const a=i/12*Math.PI*2;c.beginPath();c.moveTo(64+Math.cos(a)*50,64+Math.sin(a)*50);c.lineTo(64+Math.cos(a)*58,64+Math.sin(a)*58);c.stroke()}c.lineWidth=5;c.beginPath();c.moveTo(64,64);c.lineTo(64,24);c.stroke();c.lineWidth=4;c.beginPath();c.moveTo(64,64);c.lineTo(94,74);c.stroke()});
  Cy(.18,.18,.04,MT.dark,86.4,2.6,zp+.1,'z',null,20);A(new THREE.CircleGeometry(.16,20),new THREE.MeshStandardMaterial({map:ck,roughness:.6}),86.4,2.6,zp+.121)}
 {for(const x of[85.2,86.8])rod([x,HC,-1021.9],[x,2.75,-1021.9],.008,MT.steel);lab('PLEASE WAIT TO BE\nDARK-PROCESSED',1.8,.5,'#22305a','#ffffff',0,86,2.5,-1021.9,0);lab('PLEASE WAIT TO BE\nDARK-PROCESSED',1.8,.5,'#22305a','#ffffff',0,86,2.5,-1021.91,Math.PI)}
 /* the trophy case: glass cabinet with shelves */{const x=88.6,z=zp+.33;B(1.8,.8,.42,MT.wood,x,.4,z);B(1.8,.06,.42,MT.wood,x,2.2,z);for(const u of[x-.88,x+.88])B(.04,1.4,.42,MT.wood,u,1.5,z);B(1.76,1.4,.02,MT.wood,x,1.5,z-.2);A(new THREE.PlaneGeometry(1.72,1.38),MT.glass,x,1.5,z+.205);for(const y of[1.25,1.75])B(1.72,.02,.38,MT.glass,x,y,z);
  for(const[u,y,c]of[[-.55,.82,0xd8a830],[0,.82,0xb8b8c0],[.5,.82,0xd8a830],[-.3,1.27,0xc08040],[.35,1.27,0xd8a830],[0,1.77,0xd8a830]]){Cy(.07,.09,.06,MT.dark,x+u,y+.03,z,null,null,10);Cy(.02,.02,.14,M(c,{metalness:.8,roughness:.3}),x+u,y+.13,z,null,null,8);A(new THREE.SphereGeometry(.08,12,8,0,Math.PI*2,0,Math.PI/2),M(c,{metalness:.8,roughness:.3}),x+u,y+.2,z).rotation.x=Math.PI}
  lab('BEST DONUT 1999 · LEAST LOST 2003 · DARKEST 2011',1.7,.1,null,'#d8a830',0,x,.7,z+.211,0);obs.push({x0:x-.9,x1:x+.9,z0:zp+.08,z1:z+.22})}
 /* the water cooler, a plant, the flag, the entrance mat */{const x=89.4,z=-1018.2;B(.36,.95,.36,M(0xe8e8e8),x,.475,z);Cy(.16,.16,.42,M(0x9ad0f0,{transparent:true,opacity:.55,roughness:.1}),x,1.16,z,null,null,16);B(.08,.05,.05,M(0x2060ff),x-.1,.85,z+.19);B(.08,.05,.05,M(0xe02020),x+.1,.85,z+.19);obs.push({x0:x-.2,x1:x+.2,z0:z-.2,z1:z+.2})}
 {const x=83.2,z=-1024.0;Cy(.22,.18,.45,M(0x8a5a3a),x,.25,z,null,null,14);for(let i=0;i<7;i++){const a=i/7*Math.PI*2;const l=B(.08,.6,.02,M(0x3a7a3a),x+Math.cos(a)*.1,.75,z+Math.sin(a)*.1);l.rotation.set(Math.sin(a)*.5,a,Math.cos(a)*.5)}obs.push({x0:x-.25,x1:x+.25,z0:z-.25,z1:z+.25})}
 {const x=79.25,z=-1023.9;Cy(.03,.03,2.3,MT.gold,x,1.15,z,null,null,8);const ft=can(256,160,(c,w,h)=>{c.fillStyle='#22305a';c.fillRect(0,0,w,h);c.fillStyle='#d8a830';c.font='bold 44px DoorsSans,Arial';c.textAlign='center';c.textBaseline='middle';c.fillText('DOORS',w/2,h/2)});/* the flag hangs off the pole, out into the room */const fg=new THREE.Group();fg.position.set(x,1.9,z);fg.rotation.y=-.5;g.add(fg);k.H(fg).A(new THREE.PlaneGeometry(.8,.5),new THREE.MeshStandardMaterial({map:ft,side:THREE.DoubleSide}),.43,0,0);Cy(.15,.18,.06,MT.dark,x,.06,z,null,null,12)}
 {const t=can(512,256,(c,w,h)=>{c.fillStyle='#22305a';c.fillRect(0,0,w,h);c.strokeStyle='#d8a830';c.lineWidth=10;c.strokeRect(12,12,w-24,h-24);c.fillStyle='#d8a830';c.font='bold 60px DoorsSans,Arial';c.textAlign='center';c.textBaseline='middle';c.fillText('DESERT PD',w/2,h/2)});const m=A(new THREE.PlaneGeometry(1.6,.9),new THREE.MeshStandardMaterial({map:t,roughness:1,polygonOffset:true,polygonOffsetUnits:-2}),86,.034,-1018.3);m.rotation.x=-Math.PI/2}
 /* -------- Chief Seek's office (x 71..78); Seek's home spot (74.5, -1021) stays clear -------- */
 {const dx=72.4,dz=-1021;B(.9,.76,2.0,MT.wood,dx,.38,dz);B(1.0,.05,2.1,M(0x4a2a14,{roughness:.5}),dx,.785,dz);B(.6,.02,.8,M(0x2a4a2a),dx,.82,dz);
  lab('THE CHIEF',.5,.12,'#2a2a2e','#d8a830',0,dx+.51,.95,dz-.4,Math.PI/2);B(.5,.14,.04,M(0x2a2a2e),dx+.48,.88,dz-.4).rotation.y=Math.PI/2;
  B(.08,.32,.5,MT.dark,dx-.2,1.0,dz+.5);B(.02,.28,.46,M(0x2060c0,{emissive:0x103060}),dx-.245,1.0,dz+.5);/* facing his chair *//* a donut box, a mug, a photo */B(.3,.05,.22,M(0xf0e0c8),dx+.2,.835,dz-.7);Cy(.04,.035,.1,M(0x22305a),dx+.25,.86,dz+.2,null,null,10);B(.03,.18,.14,MT.gold,dx-.3,.9,dz-.3);
  /* the big chair behind the desk, facing east */{const c=new THREE.Group();c.position.set(71.6,0,dz);c.rotation.y=-Math.PI/2;g.add(c);const q=k.H(c);q.B(.6,.12,.6,M(0x3a1a10,{roughness:.5}),0,.5,0);q.B(.62,.9,.12,M(0x3a1a10,{roughness:.5}),0,1.0,.28);q.Cy(.04,.04,.4,MT.steel,0,.25,0,null,null,6);for(let i=0;i<5;i++){const a=i/5*Math.PI*2;q.rod([0,.04,0],[Math.cos(a)*.3,.04,Math.sin(a)*.3],.02,MT.steel)}}
  obs.push({x0:dx-.5,x1:dx+.5,z0:dz-1.05,z1:dz+1.05});/* two visitor chairs */for(const z of[dz-.5,dz+.5]){const c=new THREE.Group();c.position.set(73.6,0,z);c.rotation.y=Math.PI/2;g.add(c);const q=k.H(c);q.B(.46,.06,.46,M(0x22305a),0,.45,0);q.B(.46,.5,.06,M(0x22305a),0,.72,.22);for(const a of[-.2,.2])for(const b of[-.2,.2])q.B(.03,.45,.03,MT.steel,a,.22,b)}}
 /* filing cabinets, a coat stand with the hat, the desert map, employee of the month (always Seek), a sofa */
 for(let i=0;i<3;i++){const x=71.5+i*.52,z=-1024.05;B(.5,1.3,.6,M(0x7a8088,{metalness:.5,roughness:.4}),x,.65,z);for(let j=0;j<4;j++){B(.44,.02,.01,MT.dark,x,.25+j*.3,z+.305);B(.12,.03,.02,MT.steel,x,.32+j*.3,z+.31)}}obs.push({x0:71.25,x1:72.8,z0:-1024.4,z1:-1023.7});
 {const x=77.4,z=-1018.2;Cy(.025,.025,1.8,MT.wood,x,.9,z,null,null,8);for(let i=0;i<4;i++){const a=i/4*Math.PI*2;rod([x,.02,z],[x+Math.cos(a)*.25,.02,z+Math.sin(a)*.25],.02,MT.wood);rod([x,1.7,z],[x+Math.cos(a)*.15,1.78,z+Math.sin(a)*.15],.012,MT.wood)}Cy(.32,.32,.03,M(0x6a4a2a),x,1.82,z,null,null,18);Cy(.15,.18,.16,M(0x6a4a2a),x,1.92,z,null,null,14);Cy(.185,.185,.035,M(0x2a1a0a),x,1.86,z,null,null,14);obs.push({x0:x-.2,x1:x+.2,z0:z-.2,z1:z+.2})}
 {const t=can(512,384,(c,w,h)=>{c.fillStyle='#e8d8b0';c.fillRect(0,0,w,h);c.strokeStyle='#6a4a2a';c.lineWidth=8;c.strokeRect(4,4,w-8,h-8);c.fillStyle='#5a4a3a';c.fillRect(20,180,w-40,8);c.fillRect(250,20,8,h-40);c.fillStyle='#3a8ad8';c.beginPath();c.arc(380,300,30,0,7);c.fill();c.fillStyle='#c02020';for(const[x,y]of[[120,90],[330,120],[200,280],[420,200],[90,320]]){c.beginPath();c.arc(x,y,9,0,7);c.fill()}c.fillStyle='#3a2a1a';c.font='bold 30px DoorsSans,Arial';c.textAlign='center';c.fillText('THE DESERT · OPEN CASES',w/2,48)});B(1.5,1.1,.03,MT.wood,74.5,1.75,zp+.095);A(new THREE.PlaneGeometry(1.42,1.02),new THREE.MeshStandardMaterial({map:t,roughness:.9}),74.5,1.75,zp+.112)}
 {for(let i=0;i<6;i++){const y=1.5+(i>>1)*.5,z=-1023.65+(i%2)*.7;B(.03,.4,.32,MT.gold,77.885,y,z);const t=can(64,96,(c,w,h)=>{c.fillStyle='#f0ead8';c.fillRect(0,0,w,h);c.fillStyle='#3a3a40';c.beginPath();c.arc(32,38,18,0,7);c.fill();c.fillStyle='#202020';c.font='bold 11px DoorsSans,Arial';c.textAlign='center';c.fillText('SEEK',32,78)});const p=A(new THREE.PlaneGeometry(.26,.34),new THREE.MeshStandardMaterial({map:t}),77.865,y,z);p.rotation.y=-Math.PI/2}lab('EMPLOYEE OF THE MONTH',.9,.12,null,'#22305a',0,77.86,2.85,-1023.3,-Math.PI/2)}
 {const x=75.9,z=-1018.15;B(1.8,.42,.75,M(0x6a2a20,{roughness:.8}),x,.21,z);B(1.8,.5,.18,M(0x6a2a20,{roughness:.8}),x,.62,z+.29);for(const s of[-1,1])B(.16,.62,.75,M(0x5a2018),x+s*.86,.31,z);obs.push({x0:x-.95,x1:x+.95,z0:z-.4,z1:z+.4})}
 /* -------- booking (x 64..71): the mugshot wall, the camera, fingerprints, property bags -------- */
 {const t=can(256,512,(c,w,h)=>{c.fillStyle='#e8e8e4';c.fillRect(0,0,w,h);c.strokeStyle='#202020';c.fillStyle='#202020';c.font='bold 18px DoorsSans,Arial';for(let i=0;i<=22;i++){const y=h-i*h/22;c.lineWidth=i%2?1:3;c.beginPath();c.moveTo(0,y);c.lineTo(i%2?w*.25:w,y);c.stroke();if(i%2==0&&i>0)c.fillText((i*10)+' cm',6,y-4)}});
  const p=A(new THREE.PlaneGeometry(1.4,2.2),new THREE.MeshStandardMaterial({map:t,roughness:.8}),64.21,1.1+.02,-1021);p.rotation.y=Math.PI/2;lab('DESERT PD · BOOKING',1.2,.18,'#22305a','#ffffff',0,64.215,2.38,-1021,Math.PI/2);
  /* the camera on its tripod, a light on a stand */const cx=67.6;for(let i=0;i<3;i++){const a=i/3*Math.PI*2;rod([cx,1.25,-1021],[cx+Math.cos(a)*.3,0,-1021+Math.sin(a)*.3],.015,MT.dark)}B(.18,.14,.22,MT.dark,cx,1.33,-1021);Cy(.05,.05,.12,MT.dark,cx-.15,1.34,-1021,'x',null,12);A(new THREE.CircleGeometry(.04,12),M(0x203040,{metalness:.8,roughness:.1}),cx-.211,1.34,-1021).rotation.y=-Math.PI/2;
  {const lx=68.5,lz=-1022.3;rod([lx,0,lz],[lx,1.9,lz],.015,MT.dark);const hd=B(.3,.3,.18,M(0xe8e8e8),lx-.1,1.95,lz+.05);hd.rotation.y=.9}
  /* the fingerprint desk and the counter */B(1.4,.9,.6,M(0x7a8088,{metalness:.4}),69.9,.45,-1023.9);B(1.45,.04,.65,M(0x2a2a2e),69.9,.92,-1023.9);B(.2,.02,.12,MT.dark,69.6,.95,-1023.85);B(.3,.005,.2,M(0xf4f0e6),70.0,.942,-1023.85);lab('FINGERPRINTS',.8,.12,null,'#22305a',0,69.9,1.5,zp+.096,0);obs.push({x0:69.15,x1:70.65,z0:-1024.4,z1:-1023.55});
  /* a bench with a cuff rail under the window, property bags on a shelf */B(2.4,.06,.5,MT.wood,67.5,.45,-1018.15);for(const x of[66.4,68.6])B(.06,.45,.45,MT.dark,x,.22,-1018.15);rod([66.4,.75,-1017.95],[68.6,.75,-1017.95],.02,MT.steel);obs.push({x0:66.25,x1:68.75,z0:-1018.45,z1:-1017.85});
  B(.4,.04,1.8,MT.steel,64.4,1.5,-1023.2);B(.4,.04,1.8,MT.steel,64.4,1.0,-1023.2);for(let i=0;i<5;i++){const b=B(.28,.3,.22,M(0xe8e0c8,{roughness:.9}),64.42,1.17+(i%2)*.5,-1023.9+i*.32);b.rotation.y=(i%3)*.15}lab('PROPERTY',.6,.1,null,'#22305a',0,64.17,1.85,-1023.2,Math.PI/2)}
 /* -------- the break room (x 90..96) -------- */
 {/* counter with a sink, coffee maker, microwave along the back wall */const z=zp+.38;B(2.7,.9,.6,M(0xe8e4dc),91.55,.45,z);B(2.75,.04,.64,M(0x4a4a50,{roughness:.3}),91.55,.92,z);B(.5,.02,.36,MT.steel,91,.945,z);rod([91,.95,z-.22],[91,1.15,z-.22],.015,MT.steel);rod([91,1.15,z-.22],[91,1.15,z-.08],.015,MT.steel);
  B(.5,.3,.36,MT.dark,92.4,1.09,z);B(.4,.22,.01,M(0x101010),92.35,1.09,z+.185);B(.25,.35,.25,MT.dark,91.8,1.115,z);Cy(.07,.07,.14,M(0x3a2a20,{transparent:true,opacity:.8}),91.8,1.02,z+.05,null,null,10);obs.push({x0:90.15,x1:92.95,z0:zp+.08,z1:z+.32});
  /* the fridge, the GWEEN SODA machine (lit) */B(.8,1.8,.7,M(0xe8e8ec,{metalness:.3,roughness:.4}),95.3,.9,zp+.43);B(.03,.5,.03,MT.steel,94.94,1.3,zp+.79);obs.push({x0:94.9,x1:95.85,z0:zp+.08,z1:zp+.8});
  const vm=can(256,512,(c,w,h)=>{c.fillStyle='#2a8a3a';c.fillRect(0,0,w,h);c.fillStyle='#e8f8e0';c.font='bold 40px DoorsSans,Arial';c.textAlign='center';c.fillText('GWEEN',w/2,60);c.fillText('SODA',w/2,104);c.fillStyle='#103010';c.fillRect(20,130,150,330);for(let i=0;i<5;i++)for(let j=0;j<3;j++){c.fillStyle=['#40c040','#c0c040','#c04040'][j];c.fillRect(32+j*46,145+i*62,36,46)}c.fillStyle='#202020';c.fillRect(185,200,50,120);c.fillRect(40,475,120,26)});
  B(.8,1.9,.8,M(0x2a8a3a,{roughness:.5}),95.45,.95,-1023.15);const f=A(new THREE.PlaneGeometry(.76,1.8),new THREE.MeshStandardMaterial({map:vm,emissive:0xffffff,emissiveMap:vm,emissiveIntensity:.5,roughness:.4}),95.04,.95,-1023.15);f.rotation.y=-Math.PI/2;obs.push({x0:95.05,x1:95.85,z0:-1023.55,z1:-1022.75})}
 {/* table and four chairs */const tx=93.4,tz=-1020.2;Cy(.6,.6,.04,M(0xe8e4dc),tx,.75,tz,null,null,24);Cy(.05,.05,.72,MT.steel,tx,.37,tz,null,null,8);Cy(.3,.3,.03,MT.steel,tx,.045,tz,null,null,16);/* sits on the floor finish (top .03) */
  for(let i=0;i<4;i++){const a=i/4*Math.PI*2+.4;const c=new THREE.Group();c.position.set(tx+Math.cos(a)*.85,0,tz+Math.sin(a)*.85);c.rotation.y=Math.PI/2-a;/* the seat faces the table */g.add(c);const q=k.H(c);q.B(.42,.05,.42,M(0xc04020),0,.45,0);q.B(.42,.45,.04,M(0xc04020),0,.72,.2);for(const u of[-.18,.18])for(const v of[-.18,.18])q.B(.025,.45,.025,MT.steel,u,.22,v)}obs.push({x0:tx-.65,x1:tx+.65,z0:tz-.65,z1:tz+.65});
  /* a TV on the west wall showing the news, a notice */const tv=can(320,180,(c,w,h)=>{c.fillStyle='#1a3a6a';c.fillRect(0,0,w,h);c.fillStyle='#c02020';c.fillRect(0,h-50,w,50);c.fillStyle='#ffffff';c.font='bold 22px DoorsSans,Arial';c.fillText('DESERT NEWS',12,30);c.font='bold 20px DoorsSans,Arial';c.fillText('BUS SPOTTED. AGAIN.',12,h-20);c.fillStyle='#e8c060';c.beginPath();c.arc(230,80,34,0,7);c.fill()});
  B(.06,.62,1.04,MT.dark,90.13,2.0,-1019.6);const p=A(new THREE.PlaneGeometry(.98,.56),new THREE.MeshStandardMaterial({map:tv,emissive:0xffffff,emissiveMap:tv,emissiveIntensity:.6}),90.161,2.0,-1019.6);p.rotation.y=Math.PI/2;
  lab('WHO ATE MY DONUT?\n- RATTLER',.5,.34,'#fff8b0','#202020',0,95.82,1.6,-1018.55,-Math.PI/2)}
 pdNoSeam(g);for(const p of posters)p.userData.dpKeep=1;
 return{obs,posters,lights,spots:{bell:[84.9,-1020.7],donut:[85.5,-1020.7],mugshot:[65.2,-1021],home:[74.5,-1021],path:[[74.5,-1021],[78.7,-1021.5],[83.2,-1023.4],[84.3,-1024.1],[84.3,-1026]]}}}

/* =====================================================================================================
   Batch 3, the back of the station (z -1031.5..-1024.5): the corridor, cells C, A, B, D, interrogation and
   observation, records and the janitor's corner.
   pdCellBlock(g)  builds it all and returns {obs, pd, spots}:
     pd     every object the jail code keeps in q.pd, built the same way as before (same pivots, same moves) but at
            the new spots: cA, cB (cell doors {hg, dob, open, a}), brick, mop, keys, keysB, mtr, tile, tile0, bone, lid,
            fuseD, pl (padlock on cell B's door), lasers, maxV, spoon, note, gum, spoonB, hangA, hangB, skLeg, and
            CA / CB {door, box, sp, dx, keys, k0}, zb, zc, zp, zf, cdx (the corridor door's centre x).
            Everything is the old layout moved by (-2.7, -2.0); see desert-pd.md for the list.
     spots  drunk (cell C's sleeper), intChair, intCop, obsWatch (for a future interrogation cutscene).
   ===================================================================================================== */
function pdCellBlock(g){const k=pdKit(),I=pdInterior(),{M,MT,can,R}=k,{F,HC}=I,{A,B,Cy,rod,lab}=k.H(g),S=PDS,obs=[];const zb=S.zb,zc=S.zc,zp=S.zp,DX=-2.7,DZ=-2.0,OX=88+DX/* the old x */;
 const blk=can(256,256,(x,w,h)=>{x.fillStyle='#ffffff';x.fillRect(0,0,w,h);for(let n=0;n<3000;n++){x.fillStyle='rgba(0,0,0,'+R()*.05+')';x.fillRect(R()*w,R()*h,2,2)}x.strokeStyle='rgba(0,0,0,.22)';x.lineWidth=3;for(let r=0;r<10;r++){x.beginPath();x.moveTo(0,r*25.6);x.lineTo(w,r*25.6);x.stroke();for(let c=0;c<5;c++){const u=(c*51.2+(r%2)*25.6)%w;x.beginPath();x.moveTo(u,r*25.6);x.lineTo(u,r*25.6+25.6);x.stroke()}}},1);/* 2 m: 0.4 x 0.2 m blocks */
 const UP=new THREE.MeshStandardMaterial({map:blk,color:0xece4cc,roughness:.85}),LO=new THREE.MeshStandardMaterial({map:blk,color:0x7a8a90,roughness:.8}),ST=M(0x8a2a24,{roughness:.6}),CON=new THREE.MeshStandardMaterial({map:k.T.conc,color:0xb8b8b4,roughness:.5,metalness:.05});
 const BAR=M(0x4a4e54,{metalness:.75,roughness:.35});
 /* a block wall: grey-blue to 1.2 m, cream above, a red stripe between */const bw=(axis,a0,a1,c,t,holes,noOb)=>{const ob=k.wall(g,axis,a0,a1,c,1.2,t,LO,holes,2);k.wall(g,axis,a0,a1,c,HC+.02,t,UP,holes,2,1.2);k.wall(g,axis,a0+.01,a1-.01,c,1.32,t+.02,ST,(holes||[]).filter(h=>h[2]<1.3).map(h=>[h[0]-.0,h[1]+.0,h[2],h[3]]),2,1.2);if(!noOb)obs.push(...ob);return ob};
 /* the same as a lining on the inside of the outer walls (room on side s) */const bl=(axis,a0,a1,c,s,holes)=>{k.wall(g,axis,a0,a1,c+s*.011,1.2,.02,LO,holes,2);k.wall(g,axis,a0,a1,c+s*.011,HC+.02,.02,UP,holes,2,1.2);k.wall(g,axis,a0+.01,a1-.01,c+s*.016,1.32,.03,ST,(holes||[]).filter(h=>h[2]<1.3),2,1.2)};
 const iz=zb+.15,ix0=S.x0+.15,ix1=S.x1-.15;
 bl('x',ix0,ix1,iz,1,[[74.4,75.4,2.4,3.0],[78.7,79.7,2.4,3.0],[83.1,84.1,2.4,3.0],[89,90,2.4,3.0],[92.6,93.4,2.2,2.8]]);bl('z',iz,zp-.08,ix0,1,[]);bl('z',iz,zp-.08,ix1,-1,[]);
 /* the cell front line: solid with two doors for interrogation and observation, bars for the four cells (with a solid header above 2.6 m) */
 bw('x',ix0,72.5,zc,.18,[[65.6,66.6,0,2.3],[70.4,71.4,0,2.3]]);k.wall(g,'x',72.5,92,zc,HC+.02,.18,UP,[],2,2.6);k.wall(g,'x',72.5,92,zc,2.66,.2,ST,[],2,2.6);
 /* dividers */bw('z',iz,zc-.09,69.3,.16,[[-1030.6,-1028.4,1.0,2.2]]);for(const x of[72.5,77.3,82.1,87])bw('z',iz,zc-.09,x,.18,[]);bw('z',iz,zp-.08,92,.18,[]);
 /* floors: polished concrete in the corridor and cells, a yellow line along the corridor, drains */
 B(92-ix0,.01,zp-.08-(zc+.09),CON,(ix0+92)/2,.025,(zc+.09+zp-.08)/2,null,2);B(92-72.59,.01,zc-.09-iz,CON,(72.59+92)/2,.025,(iz+zc-.09)/2,null,2);B(69.22-ix0,.01,zc-.09-iz,F.linoB,(ix0+69.22)/2,.025,(iz+zc-.09)/2,null,2);B(72.41-69.38,.01,zc-.09-iz,F.carpet,(69.38+72.41)/2,.025,(iz+zc-.09)/2,null,1);B(ix1-92.09,.01,zp-.08-iz,F.linoB,(92.09+ix1)/2,.025,(iz+zp-.08)/2,null,2);
 for(const z of[zc+.35,zp-.35])B(92-ix0-.4,.004,.08,M(0xe8c020),(ix0+92)/2,.032,z);
 const drain=can(64,64,(x,w,h)=>{x.fillStyle='#3a3a3a';x.beginPath();x.arc(32,32,30,0,7);x.fill();x.strokeStyle='#8a8a8a';x.lineWidth=3;x.beginPath();x.arc(32,32,29,0,7);x.stroke();x.fillStyle='#151515';for(let i=-3;i<=3;i++)x.fillRect(30+i*8-2,10,4,44)});
 for(const x of[74.9,79.7,84.55,89.5]){const d=A(new THREE.CircleGeometry(.11,16),new THREE.MeshStandardMaterial({map:drain,transparent:true,roughness:.6,polygonOffset:true,polygonOffsetUnits:-2}),x,.032,-1029.4);d.rotation.x=-Math.PI/2}
 /* ceilings and lights: caged bulkheads in the cells and corridor */
 for(const[x0,x1,z0,z1]of[[ix0,92,zc+.09,zp-.08],[72.59,92,iz,zc-.09],[ix0,69.22,iz,zc-.09],[69.38,72.41,iz,zc-.09],[92.09,ix1,iz,zp-.08]]){const cg=new THREE.PlaneGeometry(x1-x0,z1-z0);const uv=cg.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*(x1-x0)/2,uv.getY(i)*(z1-z0)/2);const c=A(cg,new THREE.MeshStandardMaterial({map:k.T.conc,color:0xe8e6e0,roughness:.95,side:THREE.BackSide,emissive:0x2a2a28}),(x0+x1)/2,HC,(z0+z1)/2);c.rotation.x=-Math.PI/2}
 const cage=(x,z)=>{B(.36,.06,.24,MT.dark,x,HC-.03,z);B(.3,.1,.18,MT.warm,x,HC-.11,z);for(let i=-2;i<=2;i++)B(.01,.12,.2,BAR,x+i*.07,HC-.11,z);B(.32,.01,.2,BAR,x,HC-.17,z)};
 for(const x of[66,72,78,84,90])cage(x,(zc+zp)/2);for(const x of[74.9,79.7,84.55,89.5])cage(x,-1029.8);cage(66.8,-1029.5);cage(70.9,-1029.5);cage(94,-1028);
 /* ---- the bars and doors (as before: bars from a0 to a1 with a door d0..d1; the door is a group hinged at d0) ---- */
 const bars=(a0,a1,d0,d1)=>{for(let u=a0+.1;u<a1-.06;u+=.14){if(u>d0-.06&&u<d1+.06)continue;Cy(.022,.022,2.55,BAR,u,1.3,zc,null,null,8)}for(const[y,hh]of[[.08,.06],[1.15,.06],[2.565,.11]])for(const[p,q]of[[a0,d0-.04],[d1+.04,a1]])B(q-p,hh,.05,BAR,(p+q)/2,y,zc);/* the top rail meets the solid header at 2.6 */
  for(const u of[d0-.04,d1+.04])B(.08,2.58,.08,BAR,u,1.29,zc);obs.push({x0:a0,x1:d0-.08,z0:zc-.12,z1:zc+.12},{x0:d1+.08,x1:a1,z0:zc-.12,z1:zc+.12})};
 const cdoor=(d0,d1)=>{const hg=new THREE.Group();hg.position.set(d0,0,zc);g.add(hg);const w=d1-d0;for(let u=.1;u<w-.04;u+=.14){const b=new THREE.Mesh(new THREE.CylinderGeometry(.022,.022,2.4,8),BAR);b.position.set(u,1.27,0);hg.add(b)}for(const y of[.1,1.15,2.45]){const b=new THREE.Mesh(new THREE.BoxGeometry(w,.06,.05),BAR);b.position.set(w/2,y,0);hg.add(b)}for(const u of[.02,w-.02]){const b=new THREE.Mesh(new THREE.BoxGeometry(.04,2.42,.05),BAR);b.position.set(u,1.27,0);hg.add(b)}
  const lk=new THREE.Mesh(new THREE.BoxGeometry(.14,.22,.12),M(0x5a5e64,{metalness:.7,roughness:.35}));lk.position.set(w-.1,1.1,0);hg.add(lk);const kh=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,.13,8),M(0x101010));kh.rotation.x=Math.PI/2;kh.position.set(w-.1,1.08,0);hg.add(kh);hg.userData.dpKeep=1;
  const dob={x0:d0,x1:d1,z0:zc-.12,z1:zc+.12};return{hg,dob,open:0,a:0}};
 const CD={C:74.85,A:79.65,B:84.55,D:89.35};/* a steel post where each divider meets the bars (covers the wall's end) */for(const x of[72.5,77.3,82.1,87,92])B(.22,2.62,.14,BAR,x,1.31,zc-.03);bars(72.59,77.21,CD.C-.45,CD.C+.45);bars(77.39,82.01,CD.A-.45,CD.A+.45);bars(82.19,86.91,CD.B-.45,CD.B+.45);bars(87.09,91.91,CD.D-.45,CD.D+.45);
 const cA=cdoor(CD.A-.45,CD.A+.45),cB=cdoor(CD.B-.45,CD.B+.45),cC=cdoor(CD.C-.45,CD.C+.45),cD=cdoor(CD.D-.45,CD.D+.45);obs.push(cA.dob,cB.dob,cC.dob,cD.dob);/* note: cA.dob and cB.dob are the ones the jail pushes and pulls */
 for(const[n,x]of[['CELL C',CD.C],['CELL A',CD.A],['CELL B',CD.B],['CELL D',CD.D]])lab(n,1.0,.24,'#22305a','#ffffff',0,x,2.95,zc+.105,0);
 lab('DRUNK TANK',.9,.16,'#7a2a24','#ffffff',0,CD.C,2.76,zc+.105,0);lab('HOLDING',.8,.16,'#7a2a24','#ffffff',0,CD.D,2.76,zc+.105,0);
 /* ---- furniture shared by the cells: a bunk bolted to the wall on chains, a steel toilet-sink unit ---- */
 const bunk=(bx,bz)=>{B(1.8,.12,.78,M(0x6a6e74,{metalness:.55,roughness:.4}),bx,.42,bz);B(1.8,.03,.06,BAR,bx,.49,bz+.36);for(const s of[-.8,.8]){rod([bx+s,.47,bz+.36],[bx+s,1.35,iz+.02],.012,BAR);B(.08,.08,.04,BAR,bx+s,1.35,iz+.03)}B(1.78,.1,.04,BAR,bx,.42,iz+.03);obs.push({x0:bx-.95,x1:bx+.95,z0:bz-.45,z1:bz+.45})};
 const steelM=M(0xc8ccd0,{metalness:.5,roughness:.35});/* the steel toilet-sink unit, all one piece against the back wall: a back panel (with a little sink on top, or the
    cistern lid for cell B), the pedestal and the bowl in front of it */const zw=iz+.03;const wc=(x,low)=>{const h=low?.69:1.0;B(.46,h,.28,steelM,x,h/2,zw+.14);B(.34,.36,.4,steelM,x,.18,zw+.4);Cy(.2,.18,.1,steelM,x,.41,zw+.44,null,null,18);Cy(.165,.165,.012,M(0x3a3e44,{metalness:.6}),x,.462,zw+.44,null,null,18);
  if(!low){B(.46,.05,.3,steelM,x,h+.025,zw+.15);B(.3,.012,.18,M(0x3a3e44,{metalness:.6}),x,h+.051,zw+.17);Cy(.015,.015,.1,steelM,x,h+.1,zw+.04,null,null,6);rod([x,h+.15,zw+.04],[x,h+.15,zw+.12],.012,steelM)}
  B(.06,.06,.02,steelM,x+.15,h-.12,zw+.285);obs.push({x0:x-.25,x1:x+.25,z0:zw,z1:zw+.66})};
 /* ================= CELL A (x 77.3..82.1): bunk, mattress (lifts), spoon/note/gum under it, toilet, mop, bucket, the loose brick ================= */
 bunk(OX-6.9,zb+.8);const mtr=new THREE.Group();mtr.position.set(OX-6.05,.48,zb+.8);g.add(mtr);{const m1=new THREE.Mesh(new THREE.BoxGeometry(1.7,.14,.7),M(0x6a7a5a,{roughness:.95}));m1.position.set(-.85,.07,0);mtr.add(m1);const m2=new THREE.Mesh(new THREE.BoxGeometry(.5,.1,.3),M(0xe8e8e0,{roughness:.95}));m2.position.set(-1.45,.18,-.1);mtr.add(m2);const st=new THREE.Mesh(new THREE.BoxGeometry(1.4,.005,.02),M(0x4a5a3a));st.position.set(-.85,.142,.2);mtr.add(st)}mtr.userData.dpKeep=1;
 const spoon=B(.04,.01,.18,M(0xc0c4c8,{metalness:.9}),OX-6.6,.49,zb+.75);const note=B(.16,.004,.12,M(0xf0e8d0),OX-7.3,.49,zb+.9);note.rotation.y=.4;const gum=A(new THREE.SphereGeometry(.025,6,5),M(0xd890a0),OX-7.0,.5,zb+.6);
 wc(OX-3.7);
 const mop=new THREE.Group();mop.position.set(OX-3.7,0,zc-.5);mop.rotation.z=.12;g.add(mop);{const mh=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,1.3,6),M(0x9a6a3a));mh.position.y=.75;mop.add(mh);const mhd=new THREE.Mesh(new THREE.BoxGeometry(.22,.14,.14),M(0xd8d0b0,{roughness:1}));mhd.position.y=.08;mop.add(mhd);for(let i=0;i<6;i++){const s=new THREE.Mesh(new THREE.BoxGeometry(.03,.1,.03),M(0xd8d0b0,{roughness:1}));s.position.set(-.09+i*.036,.02,(i%2?.04:-.04));s.rotation.z=(i-2.5)*.12;mop.add(s)}}mop.userData.dpKeep=1;
 Cy(.16,.13,.3,M(0x8a8a90,{metalness:.5}),OX-3.7,.18,zc-1.1,null,null,14);Cy(.16,.16,.02,M(0x6a8aa0,{transparent:true,opacity:.7}),OX-3.7,.3,zc-1.1,null,null,14);rod([OX-3.85,.33,zc-1.1],[OX-3.7,.5,zc-1.1],.006,BAR);rod([OX-3.7,.5,zc-1.1],[OX-3.55,.33,zc-1.1],.006,BAR);obs.push({x0:OX-3.9,x1:OX-3.5,z0:zc-1.3,z1:zc-.9});
 /* the loose brick (a block sticking out a little, a dark hole behind it) and the hanger hidden behind */const bz=iz+.02+.03;const brick=B(.25,.12,.06,M(0xa8a090,{roughness:.9}),OX-5.4,.42,bz);{const h=A(new THREE.PlaneGeometry(.27,.14),M(0x141210),OX-5.4,.42,iz+.03)}
 const hangA=A(new THREE.TorusGeometry(.09,.012,6,14,Math.PI*1.4),M(0x9a9aa0,{metalness:.8}),OX-5.4,.42,bz+.01);hangA.rotation.z=.4;hangA.visible=false;brick.userData.dpKeep=1;hangA.userData.dpKeep=1;
 /* graffiti: the tally, a doodle */lab('|||| |||| |||| ||',1,.3,null,'#3a3a40',44,OX-7.4,1.6,iz+.03,0);lab('I WAS HERE\nFOR 3 MINUTES',.7,.3,null,'#3a3a40',0,OX-4.4,2.1,iz+.03,0);
 /* ================= CELL B (x 82.1..87): bunk with the skeleton, its leg bone, toilet with the cistern lid, the wobbly tile, the fuse box ================= */
 bunk(OX-.45,zb+.8);B(1.7,.14,.7,M(0x6a7a5a,{roughness:.95}),OX-.45,.55,zb+.8);
 const skg=new THREE.Group();skg.position.set(OX-.45,.62,zb+.8);skg.rotation.z=Math.PI/2;g.add(skg);let skLeg=null;{const bn=M(0xf0ece0,{roughness:.8});const P2=(geo,x,y,z,par)=>{const m=new THREE.Mesh(geo,bn);m.position.set(x,y,z);(par||skg).add(m);return m};
  P2(new THREE.SphereGeometry(.12,12,10),0,.76,0);P2(new THREE.BoxGeometry(.12,.06,.1),0,.66,.05);for(const sx of[-.04,.04])P2(new THREE.SphereGeometry(.025,6,5),sx,.78,.1).material=M(0x1a1a1a);
  P2(new THREE.CylinderGeometry(.02,.02,.4,6),0,.42,-.02);for(let i=0;i<4;i++){const r=P2(new THREE.TorusGeometry(.11-i*.01,.012,5,12,Math.PI),0,.56-i*.06,0);r.rotation.y=Math.PI/2}P2(new THREE.BoxGeometry(.26,.08,.12),0,.2,0);
  for(const sx of[-.08,.08]){const lg=P2(new THREE.CylinderGeometry(.022,.018,.6,6),sx,-.12,0);if(sx>0)skLeg=lg}for(const sx of[-.2,.2]){const ar=P2(new THREE.CylinderGeometry(.018,.015,.45,6),sx,.45,0);ar.rotation.z=sx*1.5}}skLeg.userData.dpKeep=1;
 const bone=B(.06,.06,.55,M(0xf0ece0,{roughness:.8}),OX-1.5,.66,zb+.55);bone.userData.dpKeep=1;
 wc(OX-2.6,true);/* cell B's unit is low: its top is the cistern, with the lid that lifts */const lid=new THREE.Group();lid.position.set(OX-2.6,.71,zb+.3);g.add(lid);{const l2=new THREE.Mesh(new THREE.BoxGeometry(.42,.04,.18),M(0xa8acb0,{metalness:.8}));l2.position.z=.08;lid.add(l2)}lid.userData.dpKeep=1;
 const spoonB=B(.04,.01,.18,M(0xc0c4c8,{metalness:.9}),OX-2.6,.697,zb+.36);spoonB.visible=false;spoonB.userData.dpKeep=1;
 const tile=B(.5,.03,.5,M(0x8a8680,{roughness:.7}),OX-1.4,.045,zb+2.3);tile.userData.dpKeep=1;const hangB=A(new THREE.TorusGeometry(.09,.012,6,14,Math.PI*1.4),M(0x9a9aa0,{metalness:.8}),OX-1.4,.03,zb+2.3);hangB.rotation.x=Math.PI/2;hangB.visible=false;hangB.userData.dpKeep=1;
 B(.08,.42,.32,M(0x5a5a60,{metalness:.6}),OX-3.11,1.2,zb+3.0);const fuseD=new THREE.Group();fuseD.position.set(OX-3.06,1.2,zb+2.84);g.add(fuseD);{const fd2=new THREE.Mesh(new THREE.BoxGeometry(.02,.38,.3),M(0xe0c020));fd2.position.z=.15;fuseD.add(fd2);const fl=k.H(fuseD).lab('LASER\nGRID',.22,.12,null,'#a01010',0,.012,.08,.15,Math.PI/2)}fuseD.userData.dpKeep=1;
 rod([OX-3.11,1.42,zb+3.0],[OX-3.11,HC,zb+3.0],.015,MT.steel);
 const pl=new THREE.Group();pl.position.set(.8,.82,.07);cB.hg.add(pl);{const pb2=new THREE.Mesh(new THREE.BoxGeometry(.12,.12,.05),M(0xd8a830,{metalness:.85,roughness:.25}));pl.add(pb2);const sh2=new THREE.Mesh(new THREE.TorusGeometry(.04,.012,6,12,Math.PI),M(0xc0c0c0,{metalness:.9}));sh2.position.y=.06;pl.add(sh2)}pl.userData.dpKeep=1;
 lab('SEEK WAS HERE\n(ALSO EVERYWHERE)',1.1,.4,null,'#4a4a50',40,OX-.9,1.7,iz+.03,0);
 /* ================= CELL C, the drunk tank (looks only): a long bench, a sleeper's spot, a bucket; CELL D, holding ================= */
 B(4.5,.1,.5,CON,74.9,.45,iz+.3,null,2);B(4.5,.4,.05,CON,74.9,.2,iz+.52,null,2);obs.push({x0:72.65,x1:77.15,z0:iz,z1:iz+.58});Cy(.16,.13,.3,M(0x8a8a90,{metalness:.5}),76.6,.18,-1028.3,null,null,14);obs.push({x0:76.4,x1:76.8,z0:-1028.5,z1:-1028.1});
 lab('THE DESERT\nIS A STATE OF MIND',.9,.4,null,'#4a4a50',0,73.6,1.8,iz+.03,0);
 bunk(89.5,zb+.8);B(1.7,.04,.5,M(0x5a4a7a,{roughness:.95}),89.5,.5,zb+.8);wc(91.2);lab('RESERVED FOR\nTHE DARK SPEEDSTER',1.0,.4,'#f4f0e6','#a01010',0,89.5,1.8,iz+.032,0);
 /* ================= the corridor: keys on hooks (across from cells A and B), the laser grid at the corridor door, the MAXIMUM SECURITY sign ================= */
 const keyRing=kx=>{const kz=zp-.17;B(.36,.44,.03,M(0x6a4424,{roughness:.9}),kx,1.28,zp-.115);B(.04,.04,.08,BAR,kx,1.38,zp-.14);const kk=new THREE.Group();kk.position.set(kx,1.3,kz);g.add(kk);const kr=new THREE.Mesh(new THREE.TorusGeometry(.06,.01,6,12),M(0xc0c0c0,{metalness:.9}));kk.add(kr);for(const kx2 of[-.03,.04]){const k2=new THREE.Mesh(new THREE.BoxGeometry(.02,.12,.005),M(0xd8b040,{metalness:.9}));k2.position.set(kx2,-.1,0);kk.add(k2)}kk.userData.dpKeep=1;return kk};
 const keys=keyRing(CD.A),keysB=keyRing(OX+.85);lab('KEYS · DO NOT FISH',.9,.2,'#ece4cc','#a01010',0,(CD.A+CD.B)/2,1.9,zp-.106,Math.PI);
 const LM=new THREE.MeshBasicMaterial({color:0xff2020,transparent:true,opacity:.8}),lasers=[];const cdx=84.3;
 for(const ex of[-.5,.5]){B(.1,2.1,.1,MT.dark,cdx+ex*1.04,1.05,zp-.17)}/* the emitter housings, on the corridor side of the doorway, always there */
 for(const ly of[.3,.62,.94,1.26,1.58,1.9]){const lb=new THREE.Mesh(new THREE.BoxGeometry(1.0,.02,.02),LM);lb.position.set(cdx,ly,zp-.17);lb.visible=false;g.add(lb);lasers.push(lb);lb.userData.dpKeep=1}
 for(const ex of[-.5,.5]){const lp=B(.04,2.0,.04,M(0xff3030,{emissive:0xff2020,emissiveIntensity:1.2}),cdx+ex*.96,1.0,zp-.17);lp.visible=false;lasers.push(lp);lp.userData.dpKeep=1}
 const maxV=[];{const ms=lab('MAXIMUM SECURITY',1.6,.3,'#300000','#ff3030',44,CD.B,3.18,zc+.106,0);ms.visible=false;maxV.push(ms);const rl=A(new THREE.SphereGeometry(.08,10,8),M(0xff2020,{emissive:0xff2020,emissiveIntensity:1.5,transparent:true}),CD.B+1.2,3.1,zc+.2);rl.visible=false;maxV.push(rl);for(const o of maxV)o.userData.dpKeep=1}
 /* the corridor's own things: a CCTV camera at each end, an extinguisher, the rules */
 for(const[x,ry]of[[64.4,-2.3],[91.6,2.3]]){const cg=new THREE.Group();cg.position.set(x,3.0,zp-.3);cg.rotation.y=ry;g.add(cg);const c=k.H(cg);c.B(.06,.06,.2,MT.dark,0,.1,-.05);c.B(.14,.12,.3,M(0xe8e8e4),0,0,.12).rotation.x=.4;c.Cy(.04,.04,.02,M(0x101010),0,-.06,.28,'z',null,10)}
 {const x=64.3,z=-1026.5;B(.06,.2,.2,MT.dark,x,1.15,z);Cy(.09,.09,.5,M(0xc02020,{metalness:.3}),x+.12,.95,z,null,null,12);B(.06,.1,.06,MT.dark,x+.12,1.25,z)}
 lab('RULES\n1. NO TALKING TO THE PRISONERS\n2. ESPECIALLY JEFF\n3. NO FISHING',1.0,.7,'#f4f0e6','#22305a',0,70,1.75,zp-.106,Math.PI);
 /* ================= interrogation (x 64..69.3) and observation (69.3..72.5), with the one-way mirror between ================= */
 I.door(g,'x',65.6,66.6,zc,.18,{leaf:1,side:-1,open:1.5,lm:M(0x6a6e74,{metalness:.5,roughness:.4}),fr:BAR});I.door(g,'x',70.4,71.4,zc,.18,{leaf:1,side:-1,open:1.5,right:1,ccw:1,lm:M(0x6a6e74,{metalness:.5,roughness:.4}),fr:BAR});
 lab('INTERROGATION',.9,.16,'#22305a','#ffffff',0,66.1,2.55,zc+.096,0);lab('OBSERVATION',.8,.16,'#22305a','#ffffff',0,70.9,2.55,zc+.096,0);
 {/* the mirror: silver from interrogation, dark glass from observation, a frame */const mz=-1029.5;const mt=can(256,128,(x,w,h)=>{const gr=x.createLinearGradient(0,0,w,h);gr.addColorStop(0,'#9aa6b0');gr.addColorStop(.5,'#c8d0d6');gr.addColorStop(1,'#8a96a0');x.fillStyle=gr;x.fillRect(0,0,w,h);x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=6;for(const u of[40,70,170,200]){x.beginPath();x.moveTo(u,0);x.lineTo(u-50,h);x.stroke()}});/* a mirror look without a real reflection: light, with streaks */const mir=A(new THREE.PlaneGeometry(2.2,1.2),new THREE.MeshStandardMaterial({map:mt,roughness:.15,metalness:.1}),69.3-.03,1.6,mz);mir.rotation.y=-Math.PI/2;const gl=A(new THREE.PlaneGeometry(2.2,1.2),new THREE.MeshStandardMaterial({color:0x203040,transparent:true,opacity:.35,roughness:.05,metalness:.3,depthWrite:false}),69.3+.03,1.6,mz);gl.rotation.y=Math.PI/2;
  /* the frame straddles the cut edges of the opening (no face on a cut face) */for(const s of[-1,1]){B(.2,.05,2.28,BAR,69.3,s>0?2.2:1.0,mz);B(.2,1.25,.05,BAR,69.3,1.6,mz+s*1.09)}}
 {/* the table bolted to the floor, two chairs, the lamp, a cuff ring, a file */const tx=66.8,tz=-1029.5;B(.9,.05,1.2,M(0x7a7e84,{metalness:.5,roughness:.4}),tx,.76,tz);for(const s of[-1,1])B(.06,.73,.06,BAR,tx,.37,tz+s*.45);B(.5,.02,.9,BAR,tx,.04,tz);Cy(.04,.04,.02,BAR,tx-.25,.795,tz,null,null,10);{const r=A(new THREE.TorusGeometry(.05,.01,6,12),BAR,tx-.25,.84,tz);r.rotation.x=0}
  B(.24,.02,.32,M(0xd8c8a0),tx+.2,.795,tz+.2).rotation.y=.2;lab('CASE FILE',.18,.06,null,'#a01010',0,tx+.2,.807,tz+.2,0).rotation.x=-Math.PI/2;
  const ch=(x,ry)=>{const c=new THREE.Group();c.position.set(x,0,tz);c.rotation.y=ry;g.add(c);const q=k.H(c);q.B(.44,.05,.44,M(0x5a5e64,{metalness:.5}),0,.46,0);q.B(.44,.5,.04,M(0x5a5e64,{metalness:.5}),0,.73,.21);for(const u of[-.19,.19])for(const v of[-.19,.19])q.B(.03,.45,.03,BAR,u,.22,v)};ch(tx-.9,-Math.PI/2);ch(tx+.9,Math.PI/2);/* both face the table */
  rod([tx,HC,tz],[tx,2.3,tz],.008,MT.dark);Cy(.08,.3,.25,MT.dark,tx,2.2,tz,null,null,16,true);A(new THREE.CircleGeometry(.12,14),MT.warm,tx,2.1,tz).rotation.x=Math.PI/2;obs.push({x0:tx-.45,x1:tx+.45,z0:tz-.6,z1:tz+.6})}
 {/* observation: a desk along the mirror, a recorder, two chairs facing it, coffee */const dx=69.75;B(.7,.76,2.2,MT.wood,dx,.38,-1029.5);B(.75,.04,2.25,M(0x4a2a14),dx,.78,-1029.5);B(.3,.1,.22,MT.dark,dx,.85,-1029.9);for(const s of[-1,1])Cy(.05,.05,.02,M(0x8a8a8a),dx+s*.07,.905,-1029.9,null,null,10);Cy(.04,.035,.1,M(0xf0f0f0),dx,.85,-1029.0,null,null,10);B(.08,.12,.08,MT.dark,dx+.1,.86,-1028.7);
  for(const z of[-1030.1,-1028.9]){const c=new THREE.Group();c.position.set(70.6,0,z);c.rotation.y=Math.PI/2;g.add(c);const q=k.H(c);q.B(.46,.06,.46,M(0x22305a),0,.47,0);q.B(.46,.5,.06,M(0x22305a),0,.75,.22);q.Cy(.03,.03,.43,MT.steel,0,.23,0,null,null,6);for(let i=0;i<5;i++){const a=i/5*Math.PI*2;q.rod([0,.03,0],[Math.cos(a)*.25,.03,Math.sin(a)*.25],.018,MT.steel)}}
  obs.push({x0:69.38,x1:70.12,z0:-1030.62,z1:-1028.38})}
 /* ================= records and the janitor's corner (x 92..96) ================= */
 {const SH=M(0x8a9098,{roughness:.6,metalness:.2});for(let i=0;i<3;i++){const z=-1030.8+i*1.1;for(const s of[-1,1])B(.5,2.1,.04,SH,95.5,1.05,z+s*.48);B(.04,2.1,1.0,SH,95.73,1.05,z);for(let j=0;j<4;j++){B(.48,.02,.94,SH,95.5,.3+j*.55,z);for(let b=0;b<3;b++){const bx=B(.38,.28,.3,M([0xd8c8a0,0xc8b890,0xb8a880][(i+j+b)%3],{roughness:.9}),95.48,.46+j*.55,z-.32+b*.32);bx.rotation.y=(R()-.5)*.08}}}obs.push({x0:95.2,x1:95.85,z0:-1031.35,z1:-1028.15})
  B(.6,.8,.5,M(0xe8e8e4),92.6,.4,-1031.05);B(.5,.04,.4,MT.steel,92.6,.81,-1031.05);rod([92.6,.82,-1031.25],[92.6,1.05,-1031.25],.015,MT.steel);obs.push({x0:92.25,x1:92.95,z0:-1031.35,z1:-1030.75});
  Cy(.2,.17,.35,M(0xe8c020),93.3,.2,-1030.9,null,null,14);rod([93.3,.3,-1030.9],[93.2,1.5,-1030.6],.018,M(0x9a6a3a));B(.18,.12,.12,M(0xd8d0b0),93.3,.42,-1030.9);obs.push({x0:93.05,x1:93.55,z0:-1031.15,z1:-1030.65});
  lab('RECORDS · JANITOR',1.0,.18,'#22305a','#ffffff',0,94,2.55,zp-.106,Math.PI)}
 pdNoSeam(g);
 const box=(x0,x1)=>({x0:x0+.05,x1:x1-.05,z0:zb+.2,z1:zc-.15});
 const pd={zf:S.zf,zb,zc,zp,x:88,cdx,cA,cB,brick,mop,keys,keysB,mtr,tile,tile0:tile.position.y,bone,lid,fuseD,pl,lasers,maxV,spoon,note,gum,spoonB,hangA,hangB,skLeg,
  CA:{door:cA,box:box(77.39,82.01),sp:[OX-5.4,zb+2.4],dx:CD.A,keys,k0:{x:keys.position.x,y:keys.position.y,z:keys.position.z}},CB:{door:cB,box:box(82.19,86.91),sp:[OX-1.2,zb+2.6],dx:CD.B,keys:keysB,k0:{x:keysB.position.x,y:keysB.position.y,z:keysB.position.z}},
  b0:{x:brick.position.x,y:brick.position.y,z:brick.position.z},m0:{y:mop.position.y},k0:{x:keys.position.x,y:keys.position.y,z:keys.position.z}};
 return{obs,pd,spots:{drunk:{x:74.9,z:iz+.3,y:.5,lie:'along x'},intChair:{x:65.9,z:-1029.5,face:'+x'},intCop:{x:67.7,z:-1029.5,face:'-x'},obsWatch:{x:70.6,z:-1029.5,face:'-x'}}}}
