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
 const boxGeo=(w,h,d,s)=>{const g=new THREE.BoxGeometry(w,h,d);if(s){const uv=g.attributes.uv;const dims=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]];for(let f=0;f<6;f++)for(let v=0;v<4;v++){const i=f*4+v;uv.setXY(i,uv.getX(i)*dims[f][0]/s,uv.getY(i)*dims[f][1]/s)}}return g};
 const H=par=>{const A=(geo,m,x,y,z,p)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);(p||par).add(o);return o};
  const B=(w,h,d,m,x,y,z,p,s)=>A(boxGeo(w,h,d,s),m,x,y,z,p);
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
   for(const[u,v]of ys){if(v-u<1e-3)continue;const g=boxGeo(axis=='x'?q-p:t,v-u,axis=='x'?t:q-p,s);const m=new THREE.Mesh(g,mat);m.position.set(axis=='x'?mid:c,(u+v)/2,axis=='x'?c:mid);par.add(m)}
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
 const BW=[[74.4,75.4],[78.7,79.7],[83.1,84.1],[89,90],[93.6,94.4]];ow('x',S.x0-t/2,S.x1+t/2,S.zb,[...BW.map(([a,b],i)=>[a,b,i==4?2.2:2.4,i==4?2.8:3.0]),]);
 ow('z',S.zb+t/2,S.zf-t/2,S.x0,[[-1022.6,-1019.4,1.0,2.6]]);ow('z',S.zb+t/2,S.zf-t/2,S.x1,[[-1022.6,-1019.4,1.0,2.6]]);
 for(const[a,b]of FW)win(g,'x',a,b,S.zf,1.0,2.6,t,1);for(const[a,b]of BW.slice(0,4))win(g,'x',a,b,S.zb,2.4,3.0,t,-1,{noblind:1,bars:5});win(g,'x',93.6,94.4,S.zb,2.2,2.8,t,-1,{noblind:1});
 win(g,'z',-1022.6,-1019.4,S.x0,1.0,2.6,t,-1);win(g,'z',-1022.6,-1019.4,S.x1,1.0,2.6,t,1);
 /* the floor slab (each room gets its own finish on top in later batches) */B(S.x1-S.x0,.02,S.zf-S.zb,MT.conc,(S.x0+S.x1)/2,.01,(S.zf+S.zb)/2,null,2);
 /* plinth, navy band, cornice, coping: proud of the wall, broken at the doors */
 const band=(y0,y1,pr,mat,skipDoors)=>{const yc=(y0+y1)/2,hh=y1-y0;const seg=(axis,a0,a1,c,out,gaps)=>{let cuts=[[a0,a1]];for(const[u,v]of gaps||[]){const n=[];for(const[p,q]of cuts){if(v<=p||u>=q){n.push([p,q]);continue}if(u>p)n.push([p,u]);if(v<q)n.push([v,q])}cuts=n}for(const[p,q]of cuts)B(...(axis=='x'?[q-p,hh,t+2*pr]:[t+2*pr,hh,q-p]),mat,...(axis=='x'?[(p+q)/2,yc,c]:[c,yc,(p+q)/2]),null,mat===MT.stone?1:2)};
  seg('x',S.x0-t/2-pr,S.x1+t/2+pr,S.zf,1,skipDoors?[[DOOR[0]-.02,DOOR[1]+.02]]:null);seg('x',S.x0-t/2-pr,S.x1+t/2+pr,S.zb,-1,skipDoors?[[93.68,94.72]]:null);seg('z',S.zb+t/2+pr+.001,S.zf-t/2-pr-.001,S.x0,-1);seg('z',S.zb+t/2+pr+.001,S.zf-t/2-pr-.001,S.x1,1)};
 band(0,.6,.04,MT.stone,1);band(3.1,3.32,.03,MT.navy);band(4.15,4.32,.07,MT.trim);band(PH,PH+.08,.06,MT.trim);
 /* pilasters on the front, between the windows */for(const x of[64.55,71,77.8,82.7,87.9,90.4,95.45])B(.5,4.15-.6,.08,MT.stucco,x,.6+(4.15-.6)/2,S.zf+t/2+.04,null,2);
 /* the roof: a membrane between the parapets, with a drip edge */B(S.x1-S.x0-t,.22,S.zf-S.zb-t,MT.roof,(S.x0+S.x1)/2,H+.11,(S.zf+S.zb)/2,null,3);
 /* roof kit: three AC units, vents, a hatch, the radio mast, a dish, the siren */
 for(const[x,z]of[[70,-1028],[80,-1027.8],[92,-1029]]){const o=B(1.6,.9,1.1,M(0xb8b8b0,{metalness:.4,roughness:.5}),x,H+.22+.45,z);Cy(.42,.42,.04,MT.dark,x,H+.22+.92,z,null,null,18);for(let i=0;i<4;i++){const a=i/4*Math.PI;const b=B(.8,.02,.06,MT.dark,x,H+.22+.95,z);b.rotation.y=a}rod([x+.8,H+.5,z],[x+1.6,H+.3,z+.4],.04,MT.steel)}
 for(const[x,z]of[[75,-1022],[86,-1022],[66,-1020]])Cy(.12,.12,.6,MT.steel,x,H+.22+.3,z,null,null,10);
 B(1.0,.25,1.0,M(0x8a8c90,{metalness:.5}),88,H+.35,-1029.5);
 {const mx=66,mz=-1030.2,top=H+.22+7;for(const[a,b]of[[-.3,-.3],[.3,-.3],[0,.3]])rod([mx+a,H+.22,mz+b],[mx+a*.3,top,mz+b*.3],.03,MT.steel);for(let y=H+1;y<top-.5;y+=1){const f=(y-H)/7,s=1-f*.7;rod([mx-.3*s,y,mz-.3*s],[mx+.3*s,y+1,mz-.3*s],.015,MT.steel);rod([mx+.3*s,y,mz-.3*s],[mx,y+1,mz+.3*s],.015,MT.steel);rod([mx,y,mz+.3*s],[mx-.3*s,y+1,mz-.3*s],.015,MT.steel)}
  Cy(.02,.02,1.4,MT.steel,mx,top+.7,mz,null,null,6);const lt=A(new THREE.SphereGeometry(.08,10,8),M(0xff2020,{emissive:0xff2020,emissiveIntensity:1.5}),mx,top+1.45,mz);blink.push(lt);for(const s of[-1,1])B(.05,.6,.05,M(0xe8e8e8),mx+s*.2,top-1,mz-.1)}
 {const dg=new THREE.Group();dg.position.set(94,H+.22,-1026);g.add(dg);const d=k.H(dg);d.Cy(.05,.05,.8,MT.steel,0,.4,0,null,null,8);const dish=d.A(new THREE.SphereGeometry(.5,16,8,0,Math.PI*2,0,.8),M(0xe8e8e4,{side:THREE.DoubleSide}),0,.95,.15);dish.rotation.x=Math.PI/2+.6;d.rod([0,.95,.15],[0,1.2,.55],.015,MT.steel)}
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
 {B(1.0,2.1,.04,M(0x7a2a2a,{metalness:.4,roughness:.5}),94.2,1.06,S.zb-t/2-.02);B(.5,.04,.04,MT.steel,94.2,1.0,S.zb-t/2-.06);lab('FIRE EXIT · KEEP CLEAR',.9,.16,'#2a8a3a','#ffffff',0,94.2,2.3,S.zb-t/2-.013,Math.PI)}
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
 const band=(y0,y1,pr,mat,gaps)=>{const yc=(y0+y1)/2,hh=y1-y0;const run=(axis,a0,a1,c,gp)=>{let cuts=[[a0,a1]];for(const[u,v]of gp||[]){const n=[];for(const[p,q]of cuts){if(v<=p||u>=q){n.push([p,q]);continue}if(u>p)n.push([p,u]);if(v<q)n.push([v,q])}cuts=n}for(const[p,q]of cuts)B(...(axis=='x'?[q-p,hh,t+2*pr]:[t+2*pr,hh,q-p]),mat,...(axis=='x'?[(p+q)/2,yc,c]:[c,yc,(p+q)/2]),null,1)};
  run('x',C.x0-t/2-pr,C.x1+t/2+pr,C.z1,gaps);run('x',C.x0-t/2-pr,C.x1+t/2+pr,C.z0);run('z',C.z0+t/2+pr+.001,C.z1-t/2-pr-.001,C.x0);run('z',C.z0+t/2+pr+.001,C.z1-t/2-pr-.001,C.x1)};
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
 /* lamp posts */for(const x of[44,56.5,62,70,80,93.5,100.5,105])/* skip the door lines */{const z=-1013.75;B(.3,.3,.3,MT.dark,x,.165,z);Cy(.06,.08,4.4,MT.dark,x,2.5,z,null,null,10);rod([x,4.6,z],[x,4.75,z-.6],.04,MT.dark);const hd=B(.32,.18,.4,MT.dark,x,4.72,z-.75);const l=A(new THREE.PlaneGeometry(.26,.32),MT.warm,x,4.62,z-.75);l.rotation.x=Math.PI/2;lamps.push(l);obs.push({x0:x-.18,x1:x+.18,z0:z-.18,z1:z+.18})}
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
