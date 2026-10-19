/* =====================================================================================================
   pen.js: the Dark Penitentiary rework (remodel list #23, spec docs/design/penitentiary.md). Plain three.js r128.
   Everything is built in the desert's own x/z straight into the group you pass. PENV mirrors the game's PENF/PENI/PENB.

   Batch 1: the fences, the watchtowers, the front gate, everything outside the fence.
   penKit()                    materials, canvas textures, helpers
   penFenceMesh(g,x0,z0,x1,z1) the chain link of one fence section (what the game hides when it is cut); null where
                               the gate or the gatehouse is
   penFenceTop(g)              posts (every 5 m, concrete feet), arms leaning inwards, three barbed strands, the razor
                               coil along the top of both rings; static (cutting a hole leaves the coil overhead)
   penTower(g,x,z)             a watchtower at a corner (legs, braces, stair, cab, walkway, roof). Returns {head, aim}: aim(x,y,z)
                               turns the searchlight at a spot (the yoke turns, the drum tips; head = the drum)
   penFrontGate(g)             the gate: rails, pillars, gantry, outer posts, gatehouse, barrier, road. Returns the four
                               sliding leaves {main:[2], outer:[2]} for the game's leaf groups
   penGateControl(g)           the gate control room (dx529). Returns {leaf (door), btnG}
   penVisitation(g)            the visitation block (dx528)
   penOutside(g)               bus, car park and cars, barriers, spike strip, flagpole, stop sign, kennels, water tower,
                               generator, bunker and jeep, lamp posts, sign posts. Returns {dogs, flagPole}
   ===================================================================================================== */
const PENV={F:{x0:-540,x1:-340,z0:-860,z1:-660},I:{x0:-500,x1:-380,z0:-830,z1:-700},B:{x0:-470,x1:-410,z0:-800,z1:-740}};
function penKit(){if(penKit.K)return penKit.K;const C={};const M=(c,o)=>{const k=c+JSON.stringify(o||{});return C[k]||(C[k]=new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.85,metalness:0},o||{})))};
 const can=(w,h,f,rep)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.anisotropy=4;if(rep)t.wrapS=t.wrapT=THREE.RepeatWrapping;return t};
 const noise=(x,w,h,base,n,a)=>{x.fillStyle=base;x.fillRect(0,0,w,h);for(let i=0;i<n;i++){x.fillStyle=Math.random()<.5?'rgba(30,30,30,'+a*Math.random()+')':'rgba(255,255,255,'+a*Math.random()+')';x.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*3,1+Math.random()*3)}};
 /* concrete: 256 px = 2 m, form-work panel lines and tie holes */
 const T={con:can(256,256,(x,w,h)=>{noise(x,w,h,'#a8a6a0',4000,.1);x.strokeStyle='rgba(60,60,60,.25)';x.lineWidth=2;for(let i=0;i<=2;i++){x.beginPath();x.moveTo(0,i*128);x.lineTo(w,i*128);x.stroke();x.beginPath();x.moveTo(i*128,0);x.lineTo(i*128,h);x.stroke()}x.fillStyle='rgba(50,50,50,.35)';for(let i=0;i<2;i++)for(let j=0;j<2;j++){for(const[a,b]of[[32,32],[96,32],[32,96],[96,96]]){x.beginPath();x.arc(i*128+a,j*128+b,3,0,7);x.fill()}}
   const g2=x.createLinearGradient(0,0,0,h);g2.addColorStop(0,'rgba(0,0,0,0)');g2.addColorStop(1,'rgba(90,70,40,.12)');x.fillStyle=g2;x.fillRect(0,0,w,h)},1),
  link:can(64,64,(x,w,h)=>{x.clearRect(0,0,w,h);x.strokeStyle='rgba(205,210,215,1)';x.lineWidth=4;for(const o of[-64,0,64]){x.beginPath();x.moveTo(o,0);x.lineTo(o+64,64);x.stroke();x.beginPath();x.moveTo(o+64,0);x.lineTo(o,64);x.stroke()}},1),
  coil:can(256,64,(x,w,h)=>{x.clearRect(0,0,w,h);x.strokeStyle='rgba(215,220,225,1)';x.lineWidth=3;for(let i=-1;i<9;i++){x.beginPath();x.ellipse(i*32+16,h/2,22,28,0,0,7);x.stroke()}for(let i=0;i<40;i++){x.beginPath();const u=Math.random()*w,v=Math.random()*h;x.moveTo(u,v);x.lineTo(u+5,v-5);x.stroke()}},1),
  asph:can(256,256,(x,w,h)=>noise(x,w,h,'#4a4846',5000,.12),1),grav:can(256,256,(x,w,h)=>{noise(x,w,h,'#9a8e78',7000,.18)},1)};
 const MT={con:new THREE.MeshStandardMaterial({map:T.con,roughness:.95}),con2:new THREE.MeshStandardMaterial({map:T.con,color:0xc8c6c0,roughness:.95}),steel:M(0x6a7078,{metalness:.6,roughness:.4}),galv:M(0x9aa0a6,{metalness:.65,roughness:.4}),dark:M(0x2a2c30,{roughness:.7}),
  link:new THREE.MeshStandardMaterial({map:T.link,color:0xdfe4e8,metalness:.15,roughness:.6,alphaTest:.3,side:THREE.DoubleSide}),coil:new THREE.MeshStandardMaterial({map:T.coil,color:0xd0d4d8,metalness:.7,roughness:.35,alphaTest:.35,side:THREE.DoubleSide}),
  glass:M(0x2a4050,{metalness:.3,roughness:.1,emissive:0x0a1418}),yellow:M(0xe0b020,{roughness:.6}),red:M(0xb02020,{roughness:.6}),white:M(0xe8e8e4,{roughness:.6}),black:M(0x1a1a1a,{roughness:.6}),asph:new THREE.MeshStandardMaterial({map:T.asph,roughness:.95}),grav:new THREE.MeshStandardMaterial({map:T.grav,roughness:1})};
 /* boxes with world-anchored texture coordinates (s = metres per texture) so patterns line up across pieces */
 const boxGeo=(w,h,d,s,o)=>{const g=new THREE.BoxGeometry(w,h,d);if(s){const uv=g.attributes.uv,P=g.attributes.position;const ox=o?o[0]:0,oy=o?o[1]:0,oz=o?o[2]:0;for(let f=0;f<6;f++)for(let v=0;v<4;v++){const i=f*4+v;const x=P.getX(i)+ox,y=P.getY(i)+oy,z=P.getZ(i)+oz;let u,w2;if(f<2){u=f==0?-z:z;w2=y}else if(f<4){u=x;w2=f==2?-z:z}else{u=f==4?x:-x;w2=y}uv.setXY(i,u/s,w2/s)}}return g};
 const H=par=>{const A=(geo,m,x,y,z,p)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);(p||par).add(o);return o};
  const B=(w,h,d,m,x,y,z,p,s)=>A(boxGeo(w,h,d,s,s&&!p?[x,y,z]:null),m,x,y,z,p);
  const Cy=(r0,r1,h,m,x,y,z,ax,p,seg,open)=>{const o=A(new THREE.CylinderGeometry(r0,r1,h,seg||12,1,!!open),m,x,y,z,p);if(ax=='x')o.rotation.z=-Math.PI/2;else if(ax=='z')o.rotation.x=Math.PI/2;return o};
  const V=new THREE.Vector3(),U=new THREE.Vector3(0,1,0);
  const rod=(a,b,r,m,p,seg)=>{V.set(b[0]-a[0],b[1]-a[1],b[2]-a[2]);const L=V.length();const o=A(new THREE.CylinderGeometry(r,r,L,seg||6),m,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,p);o.quaternion.setFromUnitVectors(U,V.normalize());return o};
  const lab=(txt,w,h,bg,fg,x,y,z,ry,p)=>{const t=can(512,Math.max(16,Math.round(512*h/w)),(c,W2,H2)=>{if(bg){c.fillStyle=bg;c.fillRect(0,0,W2,H2)}c.fillStyle=fg;c.textAlign='center';c.textBaseline='middle';const L=String(txt).split('\n');let f=Math.min(H2/(L.length+.5),90);c.font='bold '+f+'px DoorsSans,Arial,sans-serif';const mw=Math.max(...L.map(l=>c.measureText(l).width));if(mw>W2*.9){f*=W2*.9/mw;c.font='bold '+f+'px DoorsSans,Arial,sans-serif'}L.forEach((l,i)=>c.fillText(l,W2/2,H2/2+(i-(L.length-1)/2)*f*1.1))});
   const m=A(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:t,transparent:!bg,roughness:.7}),x,y,z,p);m.rotation.y=ry||0;return m};
  return{A,B,Cy,rod,lab}};
 penKit.K={M,MT,T,can,boxGeo,H};return penKit.K}
const penNoSeam=g=>g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});

/* ---------------------------------------- the fences ---------------------------------------- */
/* the gaps: the gate (x -445..-435) in both rings, the gatehouse (x -450..-446) in the outer ring */
const PENGAP=[{z:-860,x0:-445,x1:-435},{z:-863,x0:-447,x1:-433}];/* the main gate and the outer (sally) gate openings *//* the gatehouse's back wall is on the inner line too */
function penFenceMesh(g,x0,z0,x1,z1){const k=penKit(),{MT}=k;const H=5.4;
 /* cut the gaps out of a section along x (the only sides with gaps) */let a=Math.min(x0,x1),b=Math.max(x0,x1);if(z0==z1){for(const G of PENGAP)if(Math.abs(G.z-z0)<.01){if(G.x0<=a&&G.x1>=b)return null;if(G.x0>a&&G.x0<b)b=G.x0;else if(G.x1>a&&G.x1<b)a=G.x1}}
 const L=z0==z1?b-a:Math.abs(z1-z0),geo=new THREE.PlaneGeometry(L,H),uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*L/.35,uv.getY(i)*H/.35);/* 35 cm diamonds */
 const m=new THREE.Mesh(geo,MT.link);if(z0==z1){m.position.set((a+b)/2,H/2+.05,z0)}else{m.position.set(x0,H/2+.05,(z0+z1)/2);m.rotation.y=Math.PI/2}m.userData.noSeam=true;m.userData.dpKeep=1;g.add(m);return m}
function penFenceTop(g){const k=penKit(),{MT,M}=k,{A,B,Cy,rod}=k.H(g),F=PENV.F;const posts=[],arms=[];
 for(const[o,inw]of[[0,1],[3,1]]){const R={x0:F.x0-o,x1:F.x1+o,z0:F.z0-o,z1:F.z1+o};const side=(ax,c,a0,a1,nx,nz)=>{/* nx,nz: the inward direction */
   for(let u=a0;u<=a1+.01;u+=5){if(ax=='z'&&(u<a0+.01||u>a1-.01))continue;/* the corners are done by the x sides */const x=ax=='x'?u:c,z=ax=='x'?c:u;let gap=false;for(const G of PENGAP)if(ax=='x'&&Math.abs(G.z-c)<.01&&u>G.x0+.01&&u<G.x1-.01)gap=true;if(gap)continue;
    Cy(.07,.07,5.9,MT.galv,x,2.95,z,null,null,8);Cy(.2,.24,.3,MT.con2,x,.12,z,null,null,10);/* the post and its concrete foot */
    rod([x,5.85,z],[x+nx*.75,6.6,z+nz*.75],.035,MT.galv)}
   /* three barbed strands from arm to arm along the side, and the razor coil on top of the fence; both stop at the gaps */let pcs=[[a0,a1]];if(ax=='x')for(const G of PENGAP)if(Math.abs(G.z-c)<.01)pcs=pcs.flatMap(([p0,p1])=>G.x1<=p0||G.x0>=p1?[[p0,p1]]:[[p0,G.x0],[G.x1,p1]].filter(([q0,q1])=>q1-q0>.1));
   for(const[p0,p1]of pcs){const L=p1-p0,mid=(p0+p1)/2;for(let i=1;i<=3;i++){const t=i/3.4,px=nx*.75*t,py=5.85+.75*t,pz=nz*.75*t;Cy(.008,.008,L,MT.galv,ax=='x'?mid:c+px,py,ax=='x'?c+pz:mid,ax=='x'?'x':'z',null,4)}
    const coil=Cy(.34,.34,L,MT.coil,ax=='x'?mid:c+nx*.3,6.1,ax=='x'?c+nz*.3:mid,ax=='x'?'x':'z',null,10,true);const uv=coil.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setY(i,uv.getY(i)*L/1.6)}
   const tx=MT.coil.map;};
  side('x',R.z0,R.x0,R.x1,0,1);side('x',R.z1,R.x0,R.x1,0,-1);side('z',R.x0,R.z0,R.z1,1,0);side('z',R.x1,R.z0,R.z1,-1,0)}
 penNoSeam(g)}

/* ---------------------------------------- a watchtower ---------------------------------------- */
/* centred on the game's tower spot (its 4 x 4 base obstacle); the cab from 13 to 16 m, the searchlight on the roof */
function penTower(g,x,z){const k=penKit(),{MT,M}=k,t=new THREE.Group();t.position.set(x,0,z);g.add(t);const{A,B,Cy,rod}=k.H(t);
 B(4.4,.3,4.4,MT.con2,0,.15,0);/* the plinth */for(const[a,b]of[[-1.6,-1.6],[1.6,-1.6],[-1.6,1.6],[1.6,1.6]]){B(.45,12.7,.45,MT.con,a,.3+6.35,b)}
 /* cross bracing on all four sides, every 4 m */for(let y=1.5;y<12;y+=4)for(const s of[-1,1]){const o=0,o2=s*.1;/* the two rods of each X 10 cm apart, both ends inside the legs */rod([-1.6,y,o+s*1.6-s*.0],[1.6,y+3.6,o+s*1.6],.04,MT.steel);rod([1.6,y,s*1.6+o2],[-1.6,y+3.6,s*1.6+o2],.04,MT.steel);rod([s*1.6+o,y,-1.6],[s*1.6+o,y+3.6,1.6],.04,MT.steel);rod([s*1.6+o2,y,1.6],[s*1.6+o2,y+3.6,-1.6],.04,MT.steel)}
 /* a ladder in a safety cage up the middle, through a hatch */for(const s of[-1,1])rod([s*.25,.3,-.2],[s*.25,13,-.2],.025,MT.galv);for(let y=.6;y<13;y+=.35)rod([-.25,y,-.2],[.25,y,-.2],.015,MT.galv);for(let y=2.5;y<13;y+=1.2){const r=A(new THREE.TorusGeometry(.42,.015,4,14,Math.PI),MT.galv,0,y,-.2,t);r.rotation.x=Math.PI/2;r.rotation.z=Math.PI}
 /* the cab: floor, low concrete wall, glass all round, corner posts, the roof */B(6.2,.3,6.2,MT.con2,0,13.15,0);B(4.4,1.0,4.4,MT.con,0,13.8,0);
 for(const s of[-1,1]){B(4.0,1.3,.04,MT.glass,0,14.95,s*2.12);B(.04,1.3,4.0,MT.glass,s*2.12,14.95,0)}for(const[a,b]of[[-2.1,-2.1],[2.1,-2.1],[-2.1,2.1],[2.1,2.1]])B(.2,1.4,.2,MT.dark,a,14.95,b);B(4.6,.12,4.6,MT.dark,0,15.66,0);B(5.2,.3,5.2,MT.con2,0,15.87,0);
 /* the walkway railing round the cab: two rails on each side, posts every 2 m */for(const s of[-1,1]){for(const y of[13.85,14.35]){Cy(.03,.03,6.0,MT.yellow,s*3.0,y,0,'z',t,6);Cy(.03,.03,6.0,MT.yellow,0,y,s*3.0,'x',t,6)}for(const a of[-2,0,2]){Cy(.035,.035,1.1,MT.yellow,s*3.0,13.85,a,null,t,6);Cy(.035,.035,1.1,MT.yellow,a,13.85,s*3.0,null,t,6)}Cy(.035,.035,1.1,MT.yellow,s*3.0,13.85,3.0,null,t,6);Cy(.035,.035,1.1,MT.yellow,s*3.0,13.85,-3.0,null,t,6)}
 /* the searchlight on the roof: a fixed turntable; the yoke turns round y only, the drum tips round x only between the
    yoke arms (pivot 65 cm up so the drum never touches the base). aim(x,y,z) points it at a world spot. */Cy(.4,.45,.2,MT.dark,0,16.12,0,null,t,14);
 const yaw=new THREE.Group();yaw.position.set(0,16.22,0);t.add(yaw);const Y=k.H(yaw);Y.Cy(.44,.44,.04,MT.steel,0,.02,0,null,yaw,16);for(const s of[-1,1])Y.B(.06,.72,.16,MT.steel,s*.47,.38,0);Y.Cy(.035,.035,1.06,MT.steel,0,.65,0,'x',yaw,8);/* pokes 3 cm out of each arm */
 const pit=new THREE.Group();pit.position.set(0,.65,0);yaw.add(pit);const P2=k.H(pit);P2.Cy(.36,.4,.8,MT.dark,0,0,0,'z',pit,16);P2.Cy(.37,.37,.02,M(0xfff4c8,{emissive:0xfff0c0}),0,0,.41,'z',pit,16);P2.Cy(.3,.34,.06,MT.steel,0,0,-.42,'z',pit,16);
 const head=pit,V=new THREE.Vector3();const aim=(x,y,z)=>{yaw.getWorldPosition(V);const dx=x-V.x,dz=z-V.z;yaw.rotation.y=Math.atan2(dx,dz);pit.rotation.x=Math.atan2((V.y+.65)-y,Math.hypot(dx,dz))};
 yaw.userData.dpKeep=1;pit.userData.dpKeep=1;penNoSeam(t);return{head,aim}}

/* ---------------------------------------- the front gate ---------------------------------------- */
/* a sliding gate panel w x h (the game's gate slab is 10 x 7 x .4 at (-440, 3.5, PENF.z0-.1)): frame, bars, a brace */
function penGatePanel(w,h,sign){const k=penKit(),{MT,M}=k,g=new THREE.Group(),{B,A}=k.H(g);const SH=M(0x3a4048,{metalness:.35,roughness:.55}),FR=M(0x2a2e34,{metalness:.4,roughness:.5});
 /* a heavy sliding gate: a box-section frame, solid steel sheet up to 4.4 m with stiffening ribs, then bars with spiked tips */const hs=4.4,y0=-h/2;
 for(const s of[-1,1])B(.2,h,.2,FR,s*(w/2-.1),0,0);B(w-.4,.2,.18,FR,0,y0+.1,0);B(w-.4,.16,.18,FR,0,y0+hs,0);B(w-.4,.16,.18,FR,0,h/2-.08,0);
 B(w-.42,hs-.2,.06,SH,0,y0+.2+(hs-.2)/2-.1,0);for(let x=-w/2+1.4;x<w/2-1;x+=1.8)B(.12,hs-.25,.12,FR,x,y0+hs/2,0);/* the sheet and its ribs */
 for(let x=-w/2+.35;x<w/2-.25;x+=.3){B(.05,h-hs-.24,.05,MT.galv,x,y0+hs+(h-hs)/2-.04,0);A(new THREE.ConeGeometry(.045,.16,4),MT.galv,x,h/2+.08,0)}/* the bars and their spikes */
 /* a hazard stripe along the bottom on both faces, the sign on one face only (the road side, -z) */const hz=k.can(512,32,(x,w2,h2)=>{for(let i=-2;i<40;i++){x.fillStyle=i%2?'#1a1a1a':'#e0b020';x.beginPath();x.moveTo(i*16,0);x.lineTo(i*16+16,0);x.lineTo(i*16,h2);x.lineTo(i*16-16,h2);x.fill()}});hz.wrapS=THREE.RepeatWrapping;hz.repeat.set((w-.4)/3,1);
 for(const s of[-1,1]){const p=A(new THREE.PlaneGeometry(w-.4,.3),new THREE.MeshStandardMaterial({map:hz,roughness:.6}),0,y0+.45,s*.04);if(s<0)p.rotation.y=Math.PI}
 if(sign){const t=k.can(512,128,(x,w2,h2)=>{x.fillStyle='#e0b020';x.fillRect(0,0,w2,h2);x.strokeStyle='#1a1a1a';x.lineWidth=8;x.strokeRect(6,6,w2-12,h2-12);x.fillStyle='#1a1a1a';let f=54;x.font='bold '+f+'px DoorsSans,Arial';const mw=x.measureText(sign).width;if(mw>w2-50){f*=(w2-50)/mw;x.font='bold '+f+'px DoorsSans,Arial'}x.textAlign='center';x.textBaseline='middle';x.fillText(sign,w2/2,h2/2+2)});/* shrinks to fit */
  const p=A(new THREE.PlaneGeometry(2.4,.6),new THREE.MeshStandardMaterial({map:t,roughness:.6}),0,y0+2.4,-.04);p.rotation.y=Math.PI}
 g.userData.dpKeep=1;penNoSeam(g);return g}
/* The front gate, as the game runs it (gate528 + dx529): the MAIN gate is two 5 m leaves meeting at x -440 on the inner
   fence line (z -860) that slide 5 m outwards; the OUTER (sally) gate is two 7 m leaves on the outer line (z -863) that
   slide 7 m outwards. Both run on a ground rail with nothing in the way: the main leaves just inside the fence
   (z -859.55, under the fence's top arms), the outer leaves just outside the outer fence (z -863.45). The pillars, the
   gantry and the gatehouse all stand clear of both tracks. */
function penGateLeaf(sign){const k=penKit(),g=new THREE.Group(),p=penGatePanel(5,5.6,sign);p.position.y=2.8+.04;g.add(p);/* bottom 4 cm over the rail */
 const{Cy}=k.H(g);for(const s of[-1,1])Cy(.09,.09,.08,k.MT.dark,s*1.9,.09,0,'x',g,12);/* two rollers on the rail */g.userData.dpKeep=1;penNoSeam(g);return g}
function penOuterLeaf(sign){const k=penKit(),{MT,M}=k,g=new THREE.Group(),{B,A,Cy}=k.H(g);const w=7,h=5.8;/* a chain-link leaf in a galvanised frame, origin at its bottom middle */
 for(const s of[-1,1])B(.1,h-.06,.1,MT.galv,s*(w/2-.05),(h-.06)/2+.13,0);for(const y of[.15,h+.05])B(w-.02,.08,.08,MT.galv,0,y,0);B(w-.2,.07,.06,MT.galv,0,h/2+.1,0);B(.08,h-.1,.07,MT.galv,0,(h-.1)/2+.15,0);/* the stiles stand in the bottom rail, which runs the full width *//* the middle rail and stile a little thinner where they cross */
 for(const s of[-1,1]){const L=w/2-.14,geo=new THREE.PlaneGeometry(L,h-.25),uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*L/.35,uv.getY(i)*(h-.25)/.35);A(geo,MT.link,s*w/4,h/2+.1,0)}
 for(const s of[-1,1])Cy(.09,.09,.08,MT.dark,s*3,.09,0,'x',g,12);
 if(sign){const t=k.can(512,128,(x,w2,h2)=>{x.fillStyle='#e0b020';x.fillRect(0,0,w2,h2);x.strokeStyle='#1a1a1a';x.lineWidth=8;x.strokeRect(6,6,w2-12,h2-12);x.fillStyle='#1a1a1a';let f=54;x.font='bold '+f+'px DoorsSans,Arial';const mw=x.measureText(sign).width;if(mw>w2-50){f*=(w2-50)/mw;x.font='bold '+f+'px DoorsSans,Arial'}x.textAlign='center';x.textBaseline='middle';x.fillText(sign,w2/2,h2/2+2)});
  const p=A(new THREE.PlaneGeometry(2.0,.5),new THREE.MeshStandardMaterial({map:t,roughness:.6}),0,1.8,-.075);p.rotation.y=Math.PI;B(2.04,.54,.02,MT.galv,0,1.8,-.055)}
 g.userData.dpKeep=1;penNoSeam(g);return g}
function penFrontGate(g){const k=penKit(),{MT,M}=k,{A,B,Cy,rod,lab}=k.H(g),gx=-440,z0=PENV.F.z0,oz=z0-3;
 /* the rails: the main track from x -450.6 to -429.4 at z -859.55, the outer one from -454.6 to -425.4 at z -863.45, buffer posts at the ends */
 B(21.2,.06,.14,MT.steel,gx,.03,z0+.45);B(29.2,.06,.14,MT.steel,gx,.03,oz-.45);for(const[x,z]of[[-450.75,z0+.45],[-429.25,z0+.45],[-454.75,oz-.45],[-425.25,oz-.45]]){B(.3,.6,.3,MT.yellow,x,.3,z)}
 /* the main gate's pillars (just outside the track: z -861..-859.8) and the gantry carrying the game's big sign (the sign hangs at y 8.3, z -860.35) */
 for(const x of[-445.65,-434.35]){B(1.5,9.4,1.2,MT.con,x,4.7,z0-.4,null,2);B(1.7,.3,1.4,MT.con2,x,9.55,z0-.4)}B(12.4,2.0,.44,MT.con2,gx,8.3,z0-.03,null,2);/* its front at z -860.25, its back 1 cm in front of the pillars' */
 for(const s of[-1,1]){A(new THREE.CylinderGeometry(.2,.25,.25,10),M(0xfff4c8,{emissive:0xfff0c0}),gx+s*5.2,7.1,z0-.45);A(new THREE.SphereGeometry(.16,10,8),M(0xff2020,{emissive:0xc01010}),gx+s*5.65,9.85,z0-.4)}
 /* the outer gate's posts (on the outer fence line) and a cross beam with the sally port sign (the game's dLabel at y 6.6, z oz-.12 hangs on it) */for(const x of[-447,-433]){Cy(.17,.17,7.0,MT.galv,x,3.5,oz,null,null,12);Cy(.32,.36,.3,MT.con2,x,.15,oz,null,null,12)}B(13.66,.5,.16,MT.galv,gx,6.6,oz);
 /* between the gates: the stop line */B(10,.012,.25,MT.yellow,gx,.056,oz+1.6);
 /* the gatehouse, moved clear of the outer track to x -452..-448, z -868.4..-864.4 (see the spec): concrete, the window and a service hatch towards the road (+x), the door on its far side */
 {const hx=-450,hz=-866.4;B(4,3.6,4,MT.con2,hx,1.8,hz,null,2);B(4.6,.3,4.6,MT.dark,hx,3.75,hz);B(.06,1.1,2.6,MT.glass,hx+2.02,1.75,hz-.2);B(.1,.1,2.8,MT.dark,hx+2.03,1.15,hz-.2);B(.1,.1,2.8,MT.dark,hx+2.03,2.35,hz-.2);B(.35,.06,1.0,MT.steel,hx+2.17,1.08,hz+.3);
  B(1.0,2.1,.06,M(0x3a4a5a,{metalness:.4}),hx-.6,1.05,hz-2.02);B(1.1,.7,.8,MT.galv,hx-.8,4.25,hz+.8);lab('GATEHOUSE',2.4,.4,'#14181e','#ffd040',hx+2.012,2.95,hz-.2,Math.PI/2)}
 /* the barrier arm across the road, raised */{const px=-446.5,pz=z0-8.5;B(.4,1.0,.4,MT.yellow,px,.5,pz);const arm=new THREE.Group();arm.position.set(px,.95,pz);arm.rotation.z=1.25;g.add(arm);const a=k.H(arm);
  const t=k.can(512,16,(x,w,h)=>{for(let i=0;i<16;i++){x.fillStyle=i%2?'#e8e8e4':'#c02020';x.fillRect(i*32,0,32,h)}});a.B(10,.12,.08,new THREE.MeshStandardMaterial({map:t,roughness:.6}),5,0,0)}
 /* the road in: asphalt, a centre line, a stop line */B(9.96,.04,24,MT.asph,gx,.03,z0-12,null,4);for(let z=z0-23;z<z0-6;z+=4)B(.2,.012,2,MT.yellow,gx,.056,z);B(4.6,.012,.4,MT.white,gx-2.5,.056,z0-9.6);
 penNoSeam(g);
 /* the leaves: put these in the game's leaf groups (main: at x0 = -440 -/+ 2.5, z -859.55; outer: x0 = -440 -/+ 3.5, z -863.45) */
 return{main:[penGateLeaf('NO ENTRY'),penGateLeaf(null)],outer:[penOuterLeaf('STOP · WAIT FOR THE GUARD'),penOuterLeaf(null)]}}
/* the gate control room (dx529: x -429..-423, z -858.5..-853.5, the door at x -426 in the north wall, swinging on the
   game's dg group): concrete walls with a door frame, a flat roof, the console. Returns {leaf, btnG} for the game. */
function penGateControl(g){const k=penKit(),{MT,M}=k,{A,B,Cy,lab}=k.H(g),x0=-429,x1=-423,z0=-858.5,z1=-853.5,H=3;
 B(x1-x0,.06,z1-z0,M(0x5a5c58),(x0+x1)/2,.03,(z0+z1)/2);B(6.5,.3,5.5,MT.dark,(x0+x1)/2,H+.15,(z0+z1)/2);
 B(x1-x0+.3,H,.3,MT.con2,(x0+x1)/2,H/2,z0,null,2);for(const x of[x0,x1])B(.3,H,z1-z0-.3,MT.con2,x,H/2,(z0+z1)/2,null,2);
 B(-426.65-x0+.15,H,.3,MT.con2,(x0-.15-426.65)/2,H/2,z1,null,2);B(x1+.15+425.35,H,.3,MT.con2,(x1+.15-425.35)/2,H/2,z1,null,2);B(1.3,H-2.2,.3,MT.con2,-426,2.2+(H-2.2)/2,z1,null,2);
 for(const s of[-1,1])B(.12,2.26,.4,MT.steel,-426+s*.69,1.13,z1);B(1.52,.12,.44,MT.steel,-426,2.22,z1);/* the lintel's underside at 2.16, 5 mm over the door leaf's top *//* the door frame, round the opening */
 B(.3,.3,.06,M(0x2a2e34),-424.9,1.4,z1+.18);B(.2,.2,.02,M(0x60ff80,{emissive:0x208030}),-424.9,1.4,z1+.215);/* a keypad by the door */
 const leaf=new THREE.Group(),L=k.H(leaf);L.B(1.22,2.15,.08,M(0x4a5058,{metalness:.6,roughness:.4}),.61,1.08,0);L.B(.3,.4,.02,MT.glass,.61,1.6,.05);L.Cy(.025,.025,.14,MT.galv,1.05,1.05,.07,'z',leaf,8);
 /* inside: the console against the south wall, its sloping panel, the two buttons, the lamps, a slit window onto the gate */B(1.8,1.0,.6,M(0x3a4048,{metalness:.5}),-426,.5,z0+.5);const pnl=B(1.7,.5,.08,M(0x1a1e22),-426,1.2,z0+.25);pnl.rotation.x=-.4;
 const btnG=Cy(.09,.09,.06,M(0x20c040,{emissive:0x106020}),-426.4,1.08,z0+.75,null,null,14);Cy(.09,.09,.06,M(0xd02020,{emissive:0x601010}),-425.6,1.08,z0+.75,null,null,14);for(let i=0;i<5;i++)B(.06,.04,.04,M(0xffd040,{emissive:0x806000}),-426.6+i*.3,1.33,z0+.32);
 B(2.4,.8,.04,MT.glass,-426,1.9,z0);/* through the wall */B(.4,.4,.5,M(0x1a1a1a),-428.4,.2,z1-.6);penNoSeam(g);return{leaf,btnG}}
/* the visitation block outside the front gate (dx528: x -424..-414, z -876..-868, the visitors' door in the west wall at
   z -875..-873, the glass along z -872 with four booths, stools and phones at the game's spots) */
function penVisitation(g){const k=penKit(),{MT,M}=k,{A,B,Cy,rod,lab}=k.H(g),x0=-424,x1=-414,z0=-876,z1=-868,zc=-872,H=3.2;
 B(x1-x0,.06,z1-z0,M(0x6a6c68),(x0+x1)/2,.03,(z0+z1)/2);B(x1-x0+.5,.3,z1-z0+.5,MT.dark,(x0+x1)/2,H+.15,(z0+z1)/2);
 B(x1-x0+.3,H,.3,MT.con2,(x0+x1)/2,H/2,z0,null,2);B(x1-x0+.3,H,.3,MT.con2,(x0+x1)/2,H/2,z1,null,2);B(.3,H,z1-z0-.3,MT.con2,x1,H/2,(z0+z1)/2,null,2);
 B(.3,H,.85,MT.con2,x0,H/2,z0+.575,null,2);B(.3,H,3.85,MT.con2,x0,H/2,z1-2.075,null,2);B(.3,.8,3.0,MT.con2,x0,H-.4,-873.5,null,2);/* the west wall round the door: the game's gap is z -875..-872, its wall over it was 1 m short */
 for(const s of[-1,1])B(.4,2.36,.12,MT.steel,x0,1.18,-873.5+s*1.58);B(.44,.12,3.26,MT.steel,x0,2.43,-873.5);/* the door frame */
 /* an entrance canopy over the door on two posts */B(1.6,.12,3.6,MT.dark,x0-.95,2.9,-873.5);for(const s of[-1,1])Cy(.05,.05,2.85,MT.galv,x0-1.6,1.42,-873.5+s*1.6,null,null,8);
 /* the big sign (the game's at y 4.1 on the west face, 3.4 x .9) stands on two posts on the roof */for(const s of[-1,1])B(.08,.95,.08,MT.galv,x0+.1,3.45+.45,-874+s*1.4);B(.06,1.0,3.5,MT.dark,x0-.12,4.1,-874);
 /* slit windows along the long walls, through them */for(const z of[z0,z1])for(const x of[-421.5,-416.5])B(1.6,.3,.34,MT.glass,x,2.5,z);
 /* inside: the counter along the glass, the glass in a steel frame, booth dividers, stools and phones */B(9.64,.9,.5,M(0x6a6a66),-418.85,.45,zc);B(9.66,.06,.6,MT.steel,-418.85,.93,zc);
 B(9.66,2.2,.04,M(0xa8c8e0,{transparent:true,opacity:.28,metalness:.3,roughness:.05}),-418.85,2.06,zc);B(9.7,.08,.1,MT.steel,-418.85,3.18,zc);
 for(let i=0;i<4;i++){const x=x0+1.6+i*2.2;B(.06,2.16,.62,MT.steel,x+1.1,2.06,zc);for(const sd of[-1,1]){Cy(.22,.22,.08,M(0x2a3a5a),x,.55,zc+sd*1.0,null,null,14);Cy(.04,.04,.5,MT.dark,x,.26,zc+sd*1.0,null,null,6);Cy(.18,.2,.04,MT.dark,x,.02,zc+sd*1.0,null,null,12);
  B(.12,.25,.08,M(0x1a1a1a),x+.5,1.5,zc+sd*.3);rod([x+.5,1.37,zc+sd*.3],[x+.5,.96,zc+sd*.27],.008,M(0x1a1a1a))}}
 penNoSeam(g);return{}}

/* ---------------------------------------- outside the fence ---------------------------------------- */
function penBus(){const k=penKit(),{MT,M}=k,g=new THREE.Group(),{A,B,Cy}=k.H(g);/* 11 x 2.6, along x, the front to +x */
 B(11,2.3,2.5,MT.white,0,1.65,0);B(11.02,.32,2.52,M(0xe86a20),0,1.0,0);B(10.4,.75,2.54,MT.glass,-.2,2.15,0);for(let i=0;i<12;i++)B(.04,.71,2.56,MT.galv,-5.1+i*.85,2.15,0);/* barred windows */
 B(.06,1.2,2.2,MT.glass,5.52,2.05,0);B(.1,.4,2.4,MT.dark,5.53,.75,0);B(11,.12,2.5,M(0xd0d0d0),0,2.86,0);for(const[x,z]of[[-3.6,1.2],[3.6,1.2],[-3.6,-1.2],[3.6,-1.2]]){const w=Cy(.5,.5,.32,MT.black,x,.49,z,'z',null,16);Cy(.28,.28,.34,MT.galv,x,.49,z,'z',null,10)/* a 16-sided wheel's flat sits 1 cm in from its radius */}
 for(const s of[-1,1])Cy(.15,.15,.06,M(0xfff0c0,{emissive:0xffe0a0}),5.52,1.0,s*.9,'x',null,10);penNoSeam(g);return g}
function penCar(col){const k=penKit(),{MT,M}=k,g=new THREE.Group(),{B,Cy}=k.H(g),P=M(col,{metalness:.5,roughness:.35});/* a sedan, 1.8 x 4.2, along z */
 B(1.8,.62,4.2,P,0,.62,0);const cab=B(1.6,.55,2.1,P,0,1.2,-.2);B(1.62,.42,1.4,MT.glass,0,1.2,-.2);B(1.55,.36,.04,MT.glass,0,1.18,.87);for(const[x,z]of[[-.86,1.3],[.86,1.3],[-.86,-1.3],[.86,-1.3]]){Cy(.34,.34,.22,MT.black,x,.332,z,'x',null,14);Cy(.2,.2,.24,MT.galv,x,.332,z,'x',null,10)}
 for(const s of[-1,1]){B(.32,.12,.04,M(0xfff0c0,{emissive:0xffe0a0}),s*.62,.72,2.11);B(.32,.12,.04,M(0xc02020,{emissive:0x400000}),s*.62,.72,-2.11)}penNoSeam(g);return g}
/* a concrete road barrier 3 x .9 x .6 (the game's, with the orange stripe) */
function penJersey(){const k=penKit(),{MT,M}=k,g=new THREE.Group();const sh=new THREE.Shape();sh.moveTo(-.3,0);sh.lineTo(.3,0);sh.lineTo(.24,.08);sh.lineTo(.1,.32);sh.lineTo(.09,.9);sh.lineTo(-.09,.9);sh.lineTo(-.1,.32);sh.lineTo(-.24,.08);sh.lineTo(-.3,0);
 const geo=new THREE.ExtrudeGeometry(sh,{depth:3,bevelEnabled:false});geo.translate(0,0,-1.5);geo.rotateY(Math.PI/2);const m=new THREE.Mesh(geo,MT.con2);g.add(m);const s=new THREE.Mesh(new THREE.BoxGeometry(2.96,.1,.2),M(0xe86a20));s.position.y=.8;g.add(s);penNoSeam(g);return g}
function penSpikes(){const k=penKit(),{MT}=k,g=new THREE.Group(),{B,A}=k.H(g);B(3.2,.04,.4,MT.dark,0,.02,0);for(let i=0;i<14;i++){const c=A(new THREE.ConeGeometry(.04,.12,4),MT.galv,-1.5+i*.23,.1,(i%2?.1:-.1));}penNoSeam(g);return g}
function penFlagpole(){const k=penKit(),{MT}=k,g=new THREE.Group(),{B,Cy,A}=k.H(g);B(1.2,.3,1.2,MT.con2,0,.15,0);Cy(.08,.11,10,MT.galv,0,5.15,0,null,null,10);A(new THREE.SphereGeometry(.13,10,8),MT.yellow,0,10.2,0);penNoSeam(g);return g}
function penSignPost(g,x,z,ry,w){const k=penKit(),{MT}=k,{B}=k.H(g);w=w||.9;const nx=Math.sin(ry),nz=Math.cos(ry);/* two posts 4 cm behind a sign plane at (x, 1.7, z) facing ry */for(const s of[-1,1]){const px=x-nx*.04+Math.cos(ry)*s*w*.4,pz=z-nz*.04-Math.sin(ry)*s*w*.4;B(.06,2.0,.06,MT.galv,px,1.0,pz)}B(w*1.04,.05,.05,MT.galv,x-nx*.04,1.95,z-nz*.04).rotation.y=ry}
function penLampPost(g,x,z,ry){const k=penKit(),{MT,M}=k,{B,Cy,A}=k.H(g);Cy(.08,.11,5,MT.galv,x,2.5,z,null,null,8);Cy(.2,.24,.25,MT.con2,x,.12,z,null,null,10);const nx=Math.sin(ry),nz=Math.cos(ry);/* the arm reaches towards ry */
 const arm=B(.06,.06,.8,MT.galv,x+nx*.4,4.95,z+nz*.4);arm.rotation.y=ry;const hd=B(.3,.12,.5,MT.dark,x+nx*.85,4.9,z+nz*.85);hd.rotation.y=ry;B(.24,.02,.4,M(0xfff4c8,{emissive:0xfff0c0}),x+nx*.85,4.83,z+nz*.85).rotation.y=ry;return[x+nx*.85,4.75,z+nz*.85]}
function penKennels(g,kx,kz){const k=penKit(),{MT,M}=k,{B,A,Cy}=k.H(g);/* the game's run is kx-4..kx+4, kz-6..kz+6 (its obstacles stay); chain link, two dog houses, bowls */
 for(const[x0,z0,x1,z1]of[[kx-4,kz-6,kx+4,kz-6],[kx-4,kz+6,kx+4,kz+6],[kx-4,kz-6,kx-4,kz+6],[kx+4,kz-6,kx+4,kz+6]]){const L=Math.hypot(x1-x0,z1-z0),geo=new THREE.PlaneGeometry(L,1.8),uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*L/.6,uv.getY(i)*1.8/.6);const m=A(geo,MT.link,(x0+x1)/2,.95,(z0+z1)/2);if(x0==x1)m.rotation.y=Math.PI/2}
 for(const[x,z]of[[kx-4,kz-6],[kx+4,kz-6],[kx-4,kz+6],[kx+4,kz+6],[kx-4,kz],[kx+4,kz]])Cy(.05,.05,2.0,MT.galv,x,1.0,z,null,null,8);B(8.2,.05,12.2,MT.con2,kx,.025,kz,null,2);
 for(const dz of[-3,2.5]){const h=new THREE.Group();h.position.set(kx-2.6,0,kz+dz);h.rotation.y=Math.PI/2;g.add(h);const q=k.H(h);q.B(1.5,1.0,1.5,MT.con2,0,.55,0);q.B(1.6,.1,1.6,MT.dark,0,.05,0);
  const rf=new THREE.Shape();rf.moveTo(-.9,0);rf.lineTo(.9,0);rf.lineTo(0,.6);rf.lineTo(-.9,0);const rg=new THREE.ExtrudeGeometry(rf,{depth:1.7,bevelEnabled:false});rg.translate(0,0,-.85);q.A(rg,M(0x5a3a22),0,1.05,0);
  q.A(new THREE.PlaneGeometry(.55,.65),MT.black,0,.45,.762);q.A(new THREE.CylinderGeometry(.15,.12,.08,12),MT.galv,.5,.04,1.0)}
 penNoSeam(g)}
/* a guard dog (group faces +z; the game turns it to watch you and bobs it) */
function penDog(){const k=penKit(),{M}=k,g=new THREE.Group(),{A,Cy,B}=k.H(g),D=M(0x3a2a1a,{roughness:.8}),T=M(0x8a6a3a,{roughness:.8});
 const bd=A(new THREE.SphereGeometry(.24,12,10),D,0,.55,0);bd.scale.set(.85,.85,1.9);const ch=A(new THREE.SphereGeometry(.2,10,8),T,0,.55,.3);ch.scale.set(.9,1,.9);
 for(const[x,z]of[[-.11,.3],[.11,.3],[-.11,-.3],[.11,-.3]])Cy(.045,.04,.45,D,x,.23,z,null,null,8);const hd=A(new THREE.SphereGeometry(.14,12,10),D,0,.82,.48);const sn=A(new THREE.CylinderGeometry(.06,.08,.2,10),T,0,.78,.62);sn.rotation.x=Math.PI/2;A(new THREE.SphereGeometry(.03,6,6),M(0x101010),0,.79,.72);
 for(const s of[-1,1]){const e=A(new THREE.ConeGeometry(.05,.14,4),D,s*.08,.97,.45);e.rotation.z=-s*.2;A(new THREE.SphereGeometry(.018,6,6),M(0x101010),s*.06,.86,.58)}const tl=Cy(.025,.02,.35,D,0,.7,-.48,null,null,6);tl.rotation.x=-.8;B(.24,.04,.14,M(0xc02020),0,.7,.38).rotation.x=.3;/* a collar */
 g.userData.dpKeep=1;penNoSeam(g);return g}
function penWaterTower(){const k=penKit(),{MT,M}=k,g=new THREE.Group(),{A,Cy,rod}=k.H(g);for(const[a,b]of[[-1.5,-1.5],[1.5,-1.5],[-1.5,1.5],[1.5,1.5]]){Cy(.12,.14,11,MT.galv,a,5.5,b,null,null,8);Cy(.3,.35,.3,MT.con2,a,.15,b,null,null,10)}
 for(let y=2;y<10;y+=4)for(const s of[-1,1]){rod([-1.5,y,s*1.5],[1.5,y+3.5,s*1.5],.03,MT.galv);rod([s*1.5,y,-1.5],[s*1.5,y+3.5,1.5],.03,MT.galv)}
 const tk=Cy(2.6,2.6,4,M(0xb8bcc0,{metalness:.4,roughness:.5}),0,13,0,null,null,24);A(new THREE.ConeGeometry(2.8,1.4,24),M(0x8a8e94,{metalness:.4}),0,15.7,0);Cy(2.62,2.62,.1,MT.dark,0,11.07,0,null,null,24);Cy(.12,.12,11,MT.galv,0,5.5,0,null,null,8);/* the down pipe */
 for(let i=0;i<12;i++){const a=i/12*Math.PI*2;rod([Math.cos(a)*2.9,11.1,Math.sin(a)*2.9],[Math.cos(a)*2.9,11.9,Math.sin(a)*2.9],.02,MT.galv)}const rl=A(new THREE.TorusGeometry(2.9,.025,4,32),MT.galv,0,11.9,0);rl.rotation.x=Math.PI/2;A(new THREE.CylinderGeometry(2.9,2.9,.06,24),MT.galv,0,10.99,0);/* the walkway under the tank, below the ring */
 penNoSeam(g);return g}
function penGenerator(){const k=penKit(),{MT,M}=k,g=new THREE.Group(),{B,Cy}=k.H(g);B(5.2,.25,4.2,MT.con2,0,.125,0);B(5,2.6,3.6,M(0x8a8e78,{metalness:.3,roughness:.6}),0,1.55,0);for(let i=0;i<10;i++)B(.04,1.6,.06,MT.dark,-2.2+i*.35,1.6,1.82);/* louvres */
 B(5.2,.12,3.8,M(0x5a5e48),0,2.92,0);Cy(.16,.16,1.6,MT.dark,1.6,3.7,.8,null,null,10);Cy(.2,.16,.12,MT.dark,1.6,4.55,.8,null,null,10);B(.5,.6,.3,MT.dark,-2.2,1.2,1.95);penNoSeam(g);return g}
/* the sandbag bunker (the game's ring at (-440, -646)): rows of bags on a curve, a timber roof on posts, the jeep beside */
function penBunker(g,bx,bz){const k=penKit(),{MT,M}=k,{A,B,Cy}=k.H(g);const SB=M(0xc8b080,{roughness:1});
 for(let row=0;row<4;row++)for(let i=0;i<14;i++){const a=Math.PI+(i+(row%2)*.5)/13.5*Math.PI;const s=A(new THREE.SphereGeometry(1,12,8),SB,bx+Math.cos(a)*3,.17+row*.3,bz+Math.sin(a)*2);s.scale.set(.46,.18,.26);s.rotation.y=-a+Math.PI/2}/* a sandbag: a squashed sphere */
 for(const s of[-1,1])B(.2,1.4,.2,M(0x6a4a2a),bx+s*1.8,.7,bz+1.4);B(4.2,.18,2.6,M(0x6a4a2a),bx,1.45,bz+.4);B(4.0,.3,2.4,SB,bx,1.69,bz+.4);penNoSeam(g)}
function penJeep(){const k=penKit(),{MT,M}=k,g=new THREE.Group(),{B,Cy,rod}=k.H(g),O=M(0x4a5a3a,{roughness:.7});/* 2 x 3.6, along z, front +z */
 B(1.9,.7,3.6,O,0,.85,0);/* the body, open on top behind the windscreen */
 /* the windscreen: an upright frame tilted back a little, glass inside it */{const w=new THREE.Group();w.position.set(0,1.2,.55);w.rotation.x=-.22;g.add(w);const q=k.H(w);for(const s of[-1,1])q.B(.06,.55,.06,O,s*.86,.275,0);q.B(1.66,.06,.05,O,0,.52,0);q.B(1.66,.06,.07,O,0,.03,0);q.B(1.6,.43,.02,MT.glass,0,.275,0)/* bars between the posts */}
 /* two seats and a roll bar behind them */for(const s of[-1,1]){B(.6,.12,.55,MT.dark,s*.45,1.26,-.35);B(.56,.55,.12,MT.dark,s*.45,1.5,-.6)}for(const s of[-1,1])rod([s*.85,1.2,-.9],[s*.85,1.95,-.9],.035,MT.dark);rod([-.85,1.95,-.9],[.85,1.95,-.9],.035,MT.dark);
 for(const[x,z]of[[-1,1.2],[1,1.2],[-1,-1.2],[1,-1.2]]){Cy(.42,.42,.3,MT.black,x,.41,z,'x',null,14);Cy(.24,.24,.32,O,x,.41,z,'x',null,10)}B(.5,.5,.2,MT.black,0,1.0,-1.88);Cy(.3,.3,.15,MT.black,0,1.05,-1.95,'z',null,12);
 for(const s of[-1,1])Cy(.1,.1,.04,M(0xfff0c0,{emissive:0xffe0a0}),s*.6,.95,1.81,'z',null,10);penNoSeam(g);return g}
function penOutside(g){const k=penKit(),{MT,M}=k,{A,B,Cy,lab}=k.H(g),F=PENV.F;const r={dogs:[]};
 /* the transport bus at (-472, -871), the car park (moved to x -411..-381, z -878..-866) with three cars */{const b=penBus();b.position.set(-472,0,-871);g.add(b)}
 /* (moved east, x -411..-381: the game's spot is under the visitation block) */B(30,.03,12,MT.asph,-396,.035,-872,null,4);for(let i=0;i<9;i++)B(.12,.012,4.5,MT.white,-409+i*3.2,.056,-869.5);[[-407.4,0x2a3a6a],[-401,0xa02020],[-388.2,0x5a5a5a]].forEach(([x,c])=>{const car=penCar(c);car.position.set(x,0,-869.5);car.rotation.y=Math.PI;g.add(car)});
 /* the barriers (the game's three at z -877, -874, -871), the spike strip (-440, -866), the flagpole (-453, -871), the stop sign */for(const[x,z]of[[-443.5,-877],[-436.5,-874],[-443.5,-871]]){const j=penJersey();j.position.set(x,0,z);g.add(j)}{const s=penSpikes();s.position.set(-440,0,-866);g.add(s)}{const f=penFlagpole();f.position.set(-453,0,-871);g.add(f)}
 {const sx=-447,sz=-878;Cy(.04,.04,2.2,MT.galv,sx,1.1,sz,null,null,6);}
 /* the kennels (-556, -760) and two dogs at the game's spots */penKennels(g,-556,-760);for(const[dx,dz]of[[1,-2],[1.6,2]]){const d=penDog();d.position.set(-556+dx,0,-760+dz);g.add(d);r.dogs.push(d)}
 {const w=penWaterTower();w.position.set(-326,0,-720);g.add(w)}{const gn=penGenerator();gn.position.set(-326,0,-790);g.add(gn)/* 5 along x like the game's, its label on the west face */}penBunker(g,-440,-646);{const j=penJeep();j.position.set(-432,0,-646);g.add(j)}
 /* the lamp posts round the fence (the game's spots every 33 m on the gate side and the far side, 5 m outside), arms reaching to the fence */r.lamps=[];for(let x=F.x0-4;x<=F.x1+4;x+=33)for(const z of[F.z0-5,F.z1+5]){if(Math.abs(x+440)<8&&z<F.z0)continue;r.lamps.push(penLampPost(g,x,z,z<F.z0?0:Math.PI))}
 penNoSeam(g);return r}

/* =====================================================================================================
   Batch 2: the yard and the courtyard (the approved layout), the inner wall and its gate, the workshop, Cell Block D
   from outside. All spots are the spec's table; the game's own things keep their places and obstacles.
   ===================================================================================================== */
function penYardMats(){const k=penKit();if(k.ym)return k.ym;const g=k.can(256,256,(x,w,h)=>{x.fillStyle='#a49880';x.fillRect(0,0,w,h);for(let i=0;i<9000;i++){const v=Math.random();x.fillStyle=v<.33?'rgba(70,60,45,.35)':v<.66?'rgba(200,190,170,.35)':'rgba(130,120,100,.4)';x.beginPath();x.arc(Math.random()*w,Math.random()*h,.6+Math.random()*1.8,0,7);x.fill()}},1);
 const c=k.can(256,256,(x,w,h)=>{x.fillStyle='#a6a29a';x.fillRect(0,0,w,h);for(let i=0;i<5000;i++){x.fillStyle=Math.random()<.5?'rgba(60,60,60,'+Math.random()*.08+')':'rgba(255,255,255,'+Math.random()*.08+')';x.fillRect(Math.random()*w,Math.random()*h,2,2)}x.strokeStyle='rgba(60,60,60,.35)';x.lineWidth=2;x.strokeRect(1,1,w-2,h-2);for(let i=0;i<4;i++){x.strokeStyle='rgba(60,60,60,.15)';x.beginPath();let px=Math.random()*w,py=Math.random()*h;x.moveTo(px,py);for(let s=0;s<5;s++){px+=(Math.random()-.5)*50;py+=(Math.random()-.5)*50;x.lineTo(px,py)}x.stroke()}},1);
 return k.ym={gravel:new THREE.MeshStandardMaterial({map:g,roughness:1}),concrete:new THREE.MeshStandardMaterial({map:c,roughness:.95})}}
/* the ground: the courtyard's concrete as four strips round the block (the game's one plane ran through the block's
   floor), and a concrete path from the main gate to the inner gate (8 m wide, 2.5 cm over the gravel) */
function penGround(g){const k=penKit(),{A}=k.H(g),Y=penYardMats(),I=PENV.I,B=PENV.B;const pl=(x0,x1,z0,z1,y,m,rep)=>{const geo=new THREE.PlaneGeometry(x1-x0,z1-z0),uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*(x1-x0)/rep,uv.getY(i)*(z1-z0)/rep);const m2=A(geo,m,(x0+x1)/2,y,(z0+z1)/2);m2.rotation.x=-Math.PI/2;m2.userData.noSeam=true;return m2};
 for(const[x0,x1,z0,z1]of[[I.x0,I.x1,I.z0,B.z0],[I.x0,I.x1,B.z1,I.z1],[I.x0,B.x0,B.z0,B.z1],[B.x1,I.x1,B.z0,B.z1]])pl(x0,x1,z0,z1,.07,Y.concrete,4);
 pl(-444,-436,-859.4,-830.6,.075,Y.concrete,4)}
/* --- small things used below --- */
/* chain link on the four sides of a w x h x d box centred at (x, y0..y0+h, z), 1 cm inside its edges, texture not stretched */
function penLinkBox(g,x,y0,z,w,h,d){const k=penKit(),{A}=k.H(g);const pan=(L,ax,cx,cz)=>{const geo=new THREE.PlaneGeometry(L,h),uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*L/.3,uv.getY(i)*h/.3);const m=A(geo,k.MT.link,cx,y0+h/2,cz);if(ax=='z')m.rotation.y=Math.PI/2;m.userData.noSeam=true};
 for(const s of[-1,1]){pan(w-.02,'x',x,z+s*(d/2-.01));pan(d-.02,'z',x+s*(w/2-.01),z)}}
function penBench(g,x,z,ry,L){const k=penKit(),{MT}=k,t=new THREE.Group();t.position.set(x,0,z);t.rotation.y=ry||0;g.add(t);const{B}=k.H(t);L=L||2.4;B(L,.1,.45,MT.con2,0,.45,0);for(const s of[-1,1])B(.12,.4,.4,MT.con2,s*(L/2-.3),.2,0);penNoSeam(t);return t}
function penPicnic(g,x,z,ry){const k=penKit(),{MT}=k,t=new THREE.Group();t.position.set(x,0,z);t.rotation.y=ry||0;g.add(t);const{B}=k.H(t);B(2,.08,.8,MT.con2,0,.76,0);B(.3,.72,.5,MT.con2,0,.36,0);for(const s of[-1,1]){B(2,.08,.32,MT.con2,0,.45,s*.72);for(const e of[-.7,.7])B(.12,.41,.25,MT.con2,e,.205,s*.72)}penNoSeam(t);return t}
function penPallets(g,x,z,n,ry){const k=penKit(),{M}=k,t=new THREE.Group();t.position.set(x,0,z);t.rotation.y=ry||0;g.add(t);const{B}=k.H(t);const W=M(0xa07a4a,{roughness:.9});for(let i=0;i<n;i++){const y=i*.14;/* each pallet sits on the one below */for(const s of[-1,0,1])B(1.2,.08,.1,W,0,y+.04,s*.45);for(const s of[-1,0,1])B(.1,.06,1.0,W,s*.55,y+.11,0);}penNoSeam(t);return t}
function penTyreStack(g,x,z,n){const k=penKit(),{MT}=k,{A}=k.H(g);for(let i=0;i<n;i++){const t=A(new THREE.TorusGeometry(.32,.13,8,16),MT.black,x+(i%2)*.04,.13+i*.25,z);t.rotation.x=Math.PI/2}}
/* --- recreation (the far side, one row at z -695..-683) --- */
function penRecreation(g){const k=penKit(),{MT,M}=k,{A,B,Cy,rod,lab}=k.H(g);
 /* picnic tables under a shade sail (x -530..-512) */{const P=[[-529.5,-694.5,3.6],[-512.5,-694.5,3.0],[-512.5,-683.5,3.6],[-529.5,-683.5,3.0]];for(const[x,z,h]of P){Cy(.07,.08,h,MT.galv,x,h/2,z,null,null,8);Cy(.22,.26,.25,MT.con2,x,.12,z,null,null,10)}
  const geo=new THREE.BufferGeometry(),v=P.map(([x,z,h])=>[x,h-.12,z]);for(const[x,z,h]of P){Cy(.11,.11,.04,MT.galv,x,h-.14,z,null,null,10);Cy(.09,.07,.06,MT.galv,x,h+.03,z,null,null,8)}/* the sail's corners are on the posts, held by a ring; each post has a cap */geo.setAttribute('position',new THREE.Float32BufferAttribute([...v[0],...v[1],...v[2],...v[0],...v[2],...v[3]],3));geo.computeVertexNormals();A(geo,M(0xe8dcc8,{side:THREE.DoubleSide,roughness:.9}),0,0,0);
  for(const x of[-526,-521,-516])penPicnic(g,x,-689,0)}
 /* pull-up bars and weights on a rubber mat (x -500..-482) */{const m=A(new THREE.PlaneGeometry(17,11),M(0x2a2a2c,{roughness:1}),-491,.065,-689);m.rotation.x=-Math.PI/2;
  for(let i=0;i<4;i++){const x=-498+i*2.4;Cy(.06,.06,2.6,MT.steel,x,1.3,-693,null,null,8)}for(let i=0;i<3;i++){const x=-496.8+i*2.4;Cy(.025,.025,2.4,MT.galv,x,2.4-i*.25,-693,'x',null,8)}
  /* a bench press with a loaded bar, a dumbbell rack */B(.35,.45,1.3,M(0x1a2a4a),-486,.23,-688);for(const s of[-1,1])B(.08,1.1,.08,MT.steel,-486+s*.5,.55,-688.8);const bar=Cy(.02,.02,2.0,MT.galv,-486,1.1,-688.85,'x',null,8);for(const s of[-1,1])for(const o of[.7,.78])Cy(.22,.22,.05,MT.black,-486+s*o,1.1,-688.85,'x',null,16);
  B(1.82,.06,.5,MT.steel,-484,.75,-692.5);for(const s of[-1,1])B(.06,.75,.46,MT.steel,-484+s*.87,.375,-692.5);for(let i=0;i<5;i++){const x=-484.7+i*.35;Cy(.06,.06,.08,MT.black,x,.84,-692.65,'z',null,10);Cy(.06,.06,.08,MT.black,x,.84,-692.35,'z',null,10);Cy(.015,.015,.3,MT.galv,x,.84,-692.5,'z',null,6)}}
 /* covered team benches either side of the pitch (x -465..-460, -420..-415), facing it */for(const[x0,f]of[[-465,1],[-420,-1]]){const t=new THREE.Group();t.position.set(x0+2.5,0,-687);t.rotation.y=f>0?Math.PI/2:-Math.PI/2;g.add(t);const q=k.H(t);q.B(14,2.4,.25,MT.con2,0,1.2,-2.2);for(const s of[-1,1])q.B(.25,2.4,2,MT.con2,s*6.9,1.2,-1.2);q.B(14.4,.15,2.8,MT.galv,0,2.5,-.9);q.B(13.4,.08,.45,M(0x2a4a8a),0,.46,-1.6);for(let i=-6;i<=6;i+=2)q.B(.1,.42,.35,MT.steel,i,.21,-1.6)}
 /* the football pitch (x -456..-424, z -697..-677): packed dirt, painted lines, two goals with nets */{const t=k.can(512,320,(x,w,h)=>{x.fillStyle='#8a7a5a';x.fillRect(0,0,w,h);for(let i=0;i<6000;i++){x.fillStyle=Math.random()<.5?'rgba(60,50,30,.15)':'rgba(200,180,140,.15)';x.fillRect(Math.random()*w,Math.random()*h,2,2)}
   x.strokeStyle='#ece8dc';x.lineWidth=4;const m=10;x.strokeRect(m,m,w-2*m,h-2*m);x.beginPath();x.moveTo(w/2,m);x.lineTo(w/2,h-m);x.stroke();x.beginPath();x.arc(w/2,h/2,40,0,7);x.stroke();for(const s of[0,1]){const x0=s?w-m-60:m;x.strokeRect(x0,h/2-70,60,140)}});
  const p=A(new THREE.PlaneGeometry(32,20),new THREE.MeshStandardMaterial({map:t,roughness:1}),-440,.062,-687);p.rotation.x=-Math.PI/2;
  for(const[gx,s]of[[-455.2,1],[-424.8,-1]]){for(const dz of[-2.5,2.5])Cy(.06,.06,2.2,M(0xf0f0f0),gx,1.1,-687+dz,null,null,8);Cy(.06,.06,5.12,M(0xf0f0f0),gx,2.2,-687,'z',null,8);
   /* the back frame the net hangs on: two posts, a ground bar, two top returns (thin white rods) */const WR=M(0xf0f0f0),D=.9;for(const dz of[-2.5,2.5]){Cy(.03,.03,2.2,WR,gx-s*D,1.1,-687+dz,null,null,6);Cy(.03,.03,D,WR,gx-s*D/2,2.18,-687+dz,'x',null,6);Cy(.03,.03,D,WR,gx-s*D/2,.03,-687+dz,'x',null,6)}Cy(.03,.03,5,WR,gx-s*D,.03,-687,'z',null,6);
   /* the net: a fine white mesh (10 cm squares), not stretched, 2 cm inside the frame */if(!k.netMat){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.strokeStyle='#f4f4f0';x.lineWidth=5;x.strokeRect(0,0,64,64);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;k.netMat=new THREE.MeshStandardMaterial({map:t,alphaTest:.4,transparent:true,side:THREE.DoubleSide,roughness:.9})}
   const net=(w,h,x,y,z,ry,rx)=>{const geo=new THREE.PlaneGeometry(w,h),uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w/.1,uv.getY(i)*h/.1);const m=A(geo,k.netMat,x,y,z);if(ry)m.rotation.y=ry;if(rx)m.rotation.x=rx;return m};
   net(4.96,2.16,gx-s*(D-.02),1.1,-687,Math.PI/2);for(const dz of[-2.48,2.48])net(D-.02,2.16,gx-s*D/2,1.1,-687+dz);net(D-.02,4.96,gx-s*D/2,2.17,-687,0,Math.PI/2)}}
 /* the handball wall (x -404..-386): a free-standing wall, a painted target, court lines in front */{B(16,4,.4,MT.con2,-395,2,-691.5,null,2);B(16.2,.15,.5,MT.dark,-395,4.075,-691.5);const t=k.can(256,128,(x,w,h)=>{x.clearRect(0,0,w,h);x.strokeStyle='#d03020';x.lineWidth=6;x.strokeRect(20,20,w-40,h-40);x.beginPath();x.moveTo(0,h-12);x.lineTo(w,h-12);x.stroke()});
  A(new THREE.PlaneGeometry(10,5),new THREE.MeshStandardMaterial({map:t,transparent:true,roughness:.8}),-395,2.0,-691.29);const c=A(new THREE.PlaneGeometry(14,4.4),new THREE.MeshStandardMaterial({map:k.can(256,128,(x,w,h)=>{x.clearRect(0,0,w,h);x.strokeStyle='#e8e4d8';x.lineWidth=4;x.strokeRect(2,2,w-4,h-4);x.beginPath();x.moveTo(0,h/2);x.lineTo(w,h/2);x.stroke()}),transparent:true}),-395,.063,-688.9);c.rotation.x=-Math.PI/2}
 /* three concrete table tennis tables (x -376..-358) */for(const x of[-372,-367,-362]){B(2.74,.08,1.52,M(0x2a5a3a),x,.76,-689);B(2.6,.6,.3,MT.con2,x,.36,-689);B(.04,.15,1.6,MT.steel,x,.875,-689);B(2.7,.002,.03,MT.white,x,.808,-689)}
 penNoSeam(g)}
/* --- gardens (the left side, one column at x -526..-514) --- */
function penGardens(g){const k=penKit(),{MT,M}=k,{A,B,Cy,rod}=k.H(g);const GL=M(0xc8e0e8,{transparent:true,opacity:.35,roughness:.1,metalness:.1,side:THREE.DoubleSide});
 /* a greenhouse (x -525..-515, z -816..-808): a frame of white posts, glass walls, a pitched glass roof, benches of pots */{const x0=-525,x1=-515,z0=-816,z1=-808,H=2.4,R=3.6;B(10.2,.12,8.2,MT.con2,-520,.06,-812);
  for(let x=x0;x<=x1+.01;x+=2.5)for(const z of[z0,z1]){B(.08,H,.08,MT.white,x,.12+H/2,z)}for(let z=z0+2;z<z1;z+=2)for(const x of[x0,x1])B(.08,H,.08,MT.white,x,.12+H/2,z);
  for(const z of[z0,z1]){const w=A(new THREE.PlaneGeometry(10,H),GL,-520,.12+H/2,z);}for(const x of[x0,x1]){const w=A(new THREE.PlaneGeometry(8,H),GL,x,.12+H/2,-812);w.rotation.y=Math.PI/2}
  const ra=Math.atan2(R-H,4);for(const s of[-1,1]){const rf=A(new THREE.PlaneGeometry(10,Math.hypot(4,R-H)),GL,-520,.12+(H+R)/2,-812+s*2);rf.rotation.x=s>0?ra-Math.PI/2:Math.PI/2-ra}/* the two roof slopes, eave to ridge */
  for(let x=x0;x<=x1+.01;x+=2.5){rod([x,.12+H,z0],[x,.12+R,-812],.04,MT.white);rod([x,.12+H,z1],[x,.12+R,-812],.04,MT.white)}rod([x0,.12+R,-812],[x1,.12+R,-812],.05,MT.white);
  for(const z of[-814.6,-809.4]){B(8,.06,.8,M(0x7a5a3a),-520,.9,z);for(const s of[-3.5,3.5])B(.06,.84,.7,MT.galv,-520+s,.48,z);for(let i=0;i<9;i++){Cy(.12,.09,.18,M(0xb8603a),-523.6+i*.9,1.02,z,null,null,8);A(new THREE.SphereGeometry(.15,8,6),M(0x3a7a3a),-523.6+i*.9,1.2,z)}}}
 /* raised garden beds (x -526..-514, z -795..-783): four timber beds with rows of plants, a water butt, a hose reel */for(let i=0;i<4;i++){const x=-524+i*3;B(1.4,.45,12,M(0x7a5232),x,.225,-789);B(1.24,.02,11.84,M(0x4a3a24),x,.451,-789);for(let j=0;j<10;j++){const z=-794.4+j*1.2;A(new THREE.SphereGeometry(.2,8,6),M(j%3?0x3a7a3a:0x5a8a2a),x+(j%2?.25:-.25),.55,z).scale.y=.7}}
 Cy(.4,.35,1.0,M(0x2a4a7a),-525.2,.5,-782.2,null,null,14);Cy(.25,.25,.1,M(0x2a6a3a),-523,.55,-782.25,'z',null,14);B(.1,.8,.1,MT.galv,-523,.4,-782.28);/* the hose reel on its post */
 /* a water tank on a stand (x -523..-517, z -747..-741) */{for(const[a,b]of[[-1.6,-1.6],[1.6,-1.6],[-1.6,1.6],[1.6,1.6]]){B(.2,3,.2,MT.galv,-520+a,1.5,-744+b);B(.4,.15,.4,MT.con2,-520+a,.075,-744+b)}B(3.8,.2,3.8,MT.galv,-520,3.1,-744);Cy(1.6,1.6,2.4,M(0x5a7a8a,{metalness:.3,roughness:.5}),-520,4.4,-744,null,null,20);Cy(1.62,1.62,.08,MT.dark,-520,5.64,-744,null,null,20);
  for(let y=.4;y<3;y+=.35)B(.4,.03,.03,MT.galv,-520,y,-741.9);for(const s of[-1,1])B(.04,3,.04,MT.galv,-520+s*.2,1.5,-741.9);Cy(.08,.08,3.0,MT.galv,-518.2,1.6,-742.4,null,null,8)}
 penNoSeam(g)}
/* --- services (the right side, one column on the workshop, x -368..-356) --- */
function penVan(){const k=penKit(),{MT,M}=k,g=new THREE.Group(),{B,Cy}=k.H(g),W=M(0xe8e8e4,{metalness:.3,roughness:.4});/* a prison van, 2.2 x 5.6, along z, its front +z */
 B(2.1,1.8,3.8,W,0,1.4,-.8);B(2.08,1.0,1.8,W,0,.95,1.9);/* the cab: bonnet height, then the glasshouse with its roof */B(2.0,.62,1.4,W,0,1.76,1.75);B(1.8,.46,.02,MT.glass,0,1.76,2.455);for(const s of[-1,1]){B(.02,.44,1.1,MT.glass,s*1.005,1.76,1.8);for(let i=0;i<4;i++)B(.04,.5,.04,MT.galv,s*1.07,1.85,-2.2+i*.3)}B(1.7,.3,5.0,MT.dark,0,.5,.05);/* the chassis under the body */B(2.12,.3,5.52,M(0x1a3a6a),0,.75,.05);
 B(1.4,1.2,.04,M(0x3a3a3a),0,1.4,-2.72);for(const[x,z]of[[-1,1.9],[1,1.9],[-1,-1.9],[1,-1.9]]){Cy(.4,.4,.26,MT.black,x,.394,z,'x',null,16);Cy(.22,.22,.28,MT.galv,x,.394,z,'x',null,10)}Cy(.06,.06,2.2,MT.dark,0,.394,1.9,'x',null,8);Cy(.06,.06,2.2,MT.dark,0,.394,-1.9,'x',null,8);/* axles */
 for(const s of[-1,1])B(.25,.15,.04,M(0xfff0c0,{emissive:0xffe0a0}),s*.75,.95,2.81);penNoSeam(g);return g}
function penServices(g){const k=penKit(),{MT,M}=k,{A,B,Cy,lab}=k.H(g);
 {const v=penVan();v.position.set(-364.5,0,-730);g.add(v);B(1.2,.15,3,MT.con2,-359,.075,-730);B(.7,1.7,.45,M(0xc02020),-359,1.0,-730);B(.5,.4,.04,MT.black,-359,1.3,-729.76);B(.8,.1,.55,MT.dark,-359,1.9,-730);B(.12,.28,.14,MT.black,-358.59,1.15,-729.95);/* the nozzle in its holster */{const c=new THREE.CatmullRomCurve3([[-358.6,1.0,-729.95],[-358.5,.55,-729.9],[-358.45,.3,-729.75],[-358.55,.45,-729.45],[-358.66,.7,-729.4]].map(a=>new THREE.Vector3(...a)));A(new THREE.TubeGeometry(c,20,.025,6),MT.black,0,0,0)}/* the hose hangs in a loop from the nozzle back into the pump's side */}
 /* bins and compost (z -788..-782) */for(let i=0;i<4;i++){const x=-367.2+i*1.0;B(.7,1.05,.75,M([0x2a5a3a,0x2a2a2a,0x2a4a8a,0x2a5a3a][i]),x,.58,-786);B(.74,.06,.8,M(0x1a1a1a),x,1.13,-786);for(const s of[-1,1])Cy(.07,.07,.06,MT.black,x+s*.28,.07,-786.32,'x',null,8)}
 for(let i=0;i<3;i++){const x=-362+i*1.8;for(const s of[-1,1])B(.08,1.0,1.6,M(0x7a5a3a),x+s*.8,.5,-785);B(1.52,1.0,.08,M(0x7a5a3a),x,.5,-785.76);const h=A(new THREE.SphereGeometry(.7,10,6,0,Math.PI*2,0,Math.PI/2),M(0x4a3a24,{roughness:1}),x,0,-785);h.scale.y=.6}
 /* tyre stacks and scrap (z -822..-814) */for(const[x,z,n]of[[-367,-821,5],[-365.8,-821,4],[-367,-819.8,3],[-365.6,-819.6,6]])penTyreStack(g,x,z,n);
 for(const[x,z,w,h,d,r]of[[-361,-817,1.4,.6,.9,.3],[-359.3,-818,1.0,.5,1.2,-.4],[-360.2,-816.6,.8,.4,.8,.8]]){B(w,h,d,M(0x6a5a4a,{metalness:.4,roughness:.7}),x,h/2,z).rotation.y=r}B(.9,.8,.7,M(0x3a3a3a,{metalness:.5}),-357.5,.4,-820);Cy(.1,.1,1.2,MT.galv,-358.6,.1,-815.5,'x',null,8);
 penNoSeam(g)}
/* --- deliveries (the gate side, one row at z -840..-834) --- */
function penContainer(){const k=penKit(),{M}=k,g=new THREE.Group(),{B}=k.H(g);const t=k.can(256,128,(x,w,h)=>{x.fillStyle='#8a3a2a';x.fillRect(0,0,w,h);for(let i=0;i<w;i+=8){x.fillStyle='rgba(0,0,0,.25)';x.fillRect(i,0,3,h)}},1);t.repeat.set(4,1);
 B(10,2.6,2.44,new THREE.MeshStandardMaterial({map:t,roughness:.7,metalness:.3}),0,1.3,0);for(const s of[-1,1])B(.12,2.62,2.46,M(0x5a2a1a),s*4.95,1.3,0);for(const s of[-1,1])B(.04,2.2,.06,M(0x3a3a3a),5.02,1.3,s*.4);penNoSeam(g);return g}
function penDeliveries(g){const k=penKit(),{MT,M}=k,{A,B,Cy,lab}=k.H(g);
 {const c=penContainer();c.position.set(-521,0,-837);g.add(c);penPallets(g,-515.2,-836.2,4,0);penPallets(g,-515.2,-838.4,2,.2)}
 /* line-up boxes painted on the ground (x -504..-490), a sign on a post */{const t=k.can(512,256,(x,w,h)=>{x.clearRect(0,0,w,h);x.strokeStyle='#e0b020';x.lineWidth=5;for(let i=0;i<7;i++)for(let j=0;j<3;j++)x.strokeRect(10+i*70,10+j*80,60,70);x.fillStyle='#e0b020';x.font='bold 22px DoorsSans,Arial';for(let i=0;i<7;i++)x.fillText(String(i+1),32+i*70,62)});
  const p=A(new THREE.PlaneGeometry(14,6),new THREE.MeshStandardMaterial({map:t,transparent:true,roughness:.9}),-497,.064,-837);p.rotation.x=-Math.PI/2;Cy(.04,.04,2.0,MT.galv,-489.6,1.0,-834.4,null,null,6);lab('LINE UP\nFOR COUNT',.8,.5,'#e0b020','#1a1a1a',-489.6,1.7,-834.43,Math.PI)}
 /* benches and a weights pile by the basketball court (x -460..-452) */penBench(g,-458,-839,0,2.4);penBench(g,-458,-835,0,2.4);for(let i=0;i<4;i++)Cy(.25,.25,.06,MT.black,-454,.03+i*.06+.0,-837,null,null,16);B(1.6,.6,.5,MT.steel,-453,.3,-835.2);Cy(.02,.02,1.8,MT.galv,-453,.65,-835.2,'x',null,8);
 /* the kitchen delivery dock (x -400..-388): a raised platform with steps, a bumper, roll cages, a sign */{B(10,1.1,3,MT.con2,-394,.55,-837.5,null,2);B(10,.15,.25,MT.black,-394,.9,-839.1);for(let i=0;i<4;i++)B(.35,.27*(4-i),1.2,MT.con2,-388.835+.35*i,.135*(4-i),-837.5);/* steps up to the platform's east end */
  for(const x of[-397,-395.6,-394.2]){const cg=new THREE.Group();cg.position.set(x,1.1,-837.3);g.add(cg);const q=k.H(cg);q.B(1.0,.05,.8,MT.galv,0,.06,0);penLinkBox(cg,0,.1,0,1.0,1.5,.8);for(const[a,b]of[[-.49,-.39],[.49,-.39],[-.49,.39],[.49,.39]])q.B(.03,1.5,.03,MT.galv,a,.85,b);q.B(.8,.5,.6,M(0xc8a878),0,.35,0)}
  Cy(.04,.04,1.6,MT.galv,-399.4,1.1+.8,-836.1,null,null,6);lab('KITCHEN DELIVERIES',1.6,.3,'#20242a','#e8e0c8',-399.4,2.5,-836.13,Math.PI)}
 penNoSeam(g)}
/* --- the courtyard inside the inner wall. Redone 2026-10-19: the game's later yard code (penYard, penSecure, penMess,
   penActBuild) already fills a lot of it; those things are remodelled in place (penYardGame below), and the new things
   only go where nothing of the game's is: the stores row by the inner gate, the washing lines on the east side, the
   yard guard booth, the chess tables, the rest shelter beside the planters --- */
function penForklift(){const k=penKit(),{MT,M}=k,g=new THREE.Group(),{B,Cy,rod}=k.H(g),Y=M(0xe0b020,{roughness:.5});/* along z, the forks to +z */
 B(1.2,.9,2.0,Y,0,.75,-.3);B(1.1,.5,.6,MT.dark,0,.5,-1.25);for(const s of[-1,1]){rod([s*.5,1.2,.4],[s*.5,2.2,.4],.04,MT.dark);rod([s*.5,1.2,-.9],[s*.5,2.2,-.9],.04,MT.dark)}B(1.1,.06,1.4,MT.dark,0,2.22,-.25);
 for(const s of[-1,1])B(.1,2.4,.12,MT.steel,s*.35,1.2,.8);B(.9,.1,.1,MT.steel,0,.4,.85);for(const s of[-1,1])B(.12,.05,1.1,MT.steel,s*.3,.12,1.4);B(.5,.6,.5,MT.dark,0,1.35,-.4);
 for(const[x,z,r]of[[-.6,.5,.33],[.6,.5,.33],[-.6,-1.0,.26],[.6,-1.0,.26]])Cy(r,r,.24,MT.black,x,r*.985,z,'x',null,14);penNoSeam(g);return g}
function penCourtyard(g){const k=penKit(),{MT,M}=k,{A,B,Cy,rod,lab}=k.H(g);
 /* the stores row by the inner gate (z -822..-816): supply cages on a pad, the forklift and its pallets, the power box */
 {B(10,.12,6,MT.con2,-421,.06,-819,null,2);for(const x of[-424,-418]){const cg=new THREE.Group();cg.position.set(x,.12,-819);g.add(cg);const q=k.H(cg);for(const[a,b]of[[-1.4,-1.4],[1.4,-1.4],[-1.4,1.4],[1.4,1.4]])q.B(.06,2.2,.06,MT.galv,a,1.1,b);q.B(2.86,.05,2.86,MT.galv,0,2.2,0);penLinkBox(cg,0,.05,0,2.8,2.1,2.8);
  for(const[a,b,h]of[[-.6,-.6,.9],[.6,-.5,.7],[-.5,.6,.6],[.5,.6,1.0]])q.B(.9,h,.9,M(0xc8a878),a,h/2+.0,b)}}
 {const f=penForklift();f.position.set(-410,0,-819);f.rotation.y=Math.PI/2;g.add(f);penPallets(g,-406,-817.8,3,0);penPallets(g,-406,-820.2,5,.1)}
 /* the power box (x -400..-396): a green cabinet in a small fenced pen, its gate side facing the yard (+z) */{const cx=-398,cz=-819;B(1.6,1.5,.9,M(0x2a5a3a,{metalness:.3}),cx,.75,cz);B(1.7,.08,1.0,M(0x1a3a24),cx,1.54,cz);lab('⚡ DANGER',.6,.3,'#e8c020','#1a1a1a',cx,1.1,cz+.46,0);
  for(const[x0,z0,x1,z1]of[[-1.9,-1.9,1.9,-1.9],[-1.9,1.9,-.4,1.9],[.4,1.9,1.9,1.9],[-1.9,-1.9,-1.9,1.9],[1.9,-1.9,1.9,1.9]]){const L=Math.hypot(x1-x0,z1-z0),geo=new THREE.PlaneGeometry(L,1.6),uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*L/.35,uv.getY(i)*1.6/.35);const m=A(geo,MT.link,cx+(x0+x1)/2,.85,cz+(z0+z1)/2);if(x0==x1)m.rotation.y=Math.PI/2}
  for(const[x,z]of[[-1.9,-1.9],[1.9,-1.9],[-1.9,1.9],[1.9,1.9],[-.4,1.9],[.4,1.9]])Cy(.04,.04,1.7,MT.galv,cx+x,.85,cz+z,null,null,6)}
 /* outdoor washing lines (x -400..-388, z -790..-770) on the laundry's side: T posts, two lines each, washing pegged on */{for(let i=0;i<5;i++){const z=-788+i*4.5;for(const x of[-399.5,-388.5]){Cy(.05,.05,2.2,MT.galv,x,1.1,z,null,null,8);Cy(.03,.03,1.2,MT.galv,x,2.15,z,'z',null,6)}
   for(const dz of[-.5,.5])Cy(.006,.006,11,MT.white,-394,2.12,z+dz,'x',null,4);for(let j=0;j<5;j++){const c=A(new THREE.PlaneGeometry(.6,.8),M((j+i)%3?0xe86a20:0xe8e8e4,{side:THREE.DoubleSide,roughness:1}),-397.9+j*1.95,1.7,z+(j%2?.5:-.5));c.userData.cloth=1}}}
 /* the yard guard booth (x -390.3..-387.7, z -719.3..-716.7), its door facing the yard */penGuardBooth(g,-389,-718,2.6,-1,'YARD POST');A(new THREE.ConeGeometry(.2,.6,12),M(0xe86a20),-391.2,.3,-716.2);
 /* chess tables (x -435..-409, z -714..-711): a concrete table with a board on top and four stools, in a row */for(const x of[-434,-426,-418,-410]){const z=-712.5;Cy(.12,.16,.7,MT.con2,x,.35,z,null,null,12);Cy(.45,.45,.06,MT.con2,x,.73,z,null,null,20);
   {const t=k.can(128,128,(c,w,h)=>{for(let i=0;i<8;i++)for(let j=0;j<8;j++){c.fillStyle=(i+j)%2?'#3a3430':'#d8d0c0';c.fillRect(i*16,j*16,16,16)}});const p=A(new THREE.PlaneGeometry(.5,.5),new THREE.MeshStandardMaterial({map:t,roughness:.8}),x,.77,z);p.rotation.x=-Math.PI/2}
   for(const[a,b]of[[.8,0],[-.8,0],[0,.8],[0,-.8]]){Cy(.06,.08,.42,MT.con2,x+a,.21,z+b,null,null,8);Cy(.18,.18,.06,MT.con2,x+a,.45,z+b,null,null,14)}}
 /* the rest shelter beside the planters (x -484..-468, z -815..-811): a steel roof on six posts, two benches and a bin */{for(const x of[-483.5,-476,-468.5])for(const z of[-814.6,-811.4])B(.12,2.6,.12,MT.steel,x,1.3,z);B(16.4,.08,4.4,MT.galv,-476,2.64,-813);for(const s of[-1,1])B(16.44,.2,.04,MT.dark,-476,2.6,-813+s*2.22);
   penBench(g,-480,-813,0,2.4);penBench(g,-472,-813,0,2.4);Cy(.25,.22,.8,M(0x2a5a3a),-476,.4,-813,null,null,12)}
 penNoSeam(g)}

/* ---------------- the game's later courtyard things (penYard, penSecure), remodelled in place ---------------- */
/* a guard booth, w x w, a concrete base to 1 m, glass all round, a steel door on one x side (dx = +1 or -1), a sign over it */
function penGuardBooth(g,x,z,w,dx,txt){const k=penKit(),{MT,M}=k,{B,Cy,lab}=k.H(g),h=w/2;
 B(w,1,w,MT.con2,x,.5,z,null,2);for(const s of[-1,1]){B(w-.2,1.22,.04,MT.glass,x,1.6,z+s*(h-.03));B(.04,1.22,w-.2,MT.glass,x+s*(h-.03),1.6,z)}
 for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])B(.14,1.24,.14,MT.dark,x+a*(h-.07),1.6,z+b*(h-.07));B(w+.3,.2,w+.3,MT.dark,x,2.31,z);
 /* the door on the x side: steel, a small window, a handle */const dxp=x+dx*(h+.025);B(.05,2.06,.9,MT.steel,dxp,1.03,z);B(.02,.4,.5,MT.glass,dxp+dx*.03,1.6,z);B(.04,.04,.14,MT.dark,dxp+dx*.045,1.0,z+.3);
 lab(txt,w*.7,.17,'#20242a','#e8e0c8',x+dx*(h+.16),2.31,z,dx>0?Math.PI/2:-Math.PI/2);
 /* inside on the counter: a monitor and a radio; a lamp on the roof */B(.4,.3,.05,MT.dark,x,1.15,z-h+.35);B(.15,.22,.08,MT.black,x+.5,1.11,z-h+.3);Cy(.1,.12,.15,M(0xfff0c0,{emissive:0xffd080}),x,2.485,z,null,null,10);penNoSeam(g)}
function penPlanter(g,x,z){const k=penKit(),{MT,M}=k,{A,B}=k.H(g);B(2,.6,1,MT.con2,x,.3,z,null,2);B(1.86,.02,.86,M(0x4a3626,{roughness:1}),x,.605,z);
 for(let i=0;i<3;i++){const sx=x-.6+i*.6;for(const[a,b,r,c]of[[0,0,.3,0x5e7040],[.15,.12,.22,0x6e8248],[-.14,-.1,.2,0x52643a]]){const m=A(new THREE.IcosahedronGeometry(r,0),M(c,{roughness:1,flatShading:true}),sx+a*(i%2?-1:1),.62+r*.75,z+b);m.scale.y=.85;m.rotation.y=i+a*7}}penNoSeam(g)}
/* an air-con unit on a plinth; returns the fan (spin it about y) */
function penACUnit(g,x,z){const k=penKit(),{MT,M}=k,{B,Cy}=k.H(g),C=M(0xb8bcc0,{metalness:.4,roughness:.45});B(2.1,.1,2.1,MT.con2,x,.05,z);B(2,1.3,2,C,x,.75,z);
 for(const s of[-1,1])for(let i=0;i<8;i++)B(.04,.06,1.7,MT.dark,x+s*1.0,.3+i*.13,z);Cy(.74,.74,.08,MT.dark,x,1.44,z,null,null,24,true);for(const r of[0,Math.PI/2])B(1.46,.02,.03,MT.dark,x,1.49+r*.004,z).rotation.y=r;
 const f=new THREE.Group();f.position.set(x,1.43,z);g.add(f);for(const r of[0,Math.PI/2]){const b=new THREE.Mesh(new THREE.BoxGeometry(1.3,.02,.18),M(0x5a5a60));b.rotation.y=r+.3;b.position.y=r*.004;f.add(b)}penNoSeam(g);return f}
function penTank(g,x,z){const k=penKit(),{MT,M}=k,{A,B,Cy,rod}=k.H(g);Cy(1.4,1.4,.1,MT.con2,x,.05,z,null,null,24);Cy(1.2,1.2,2.9,M(0x7a8a6a,{metalness:.3,roughness:.6}),x,1.55,z,null,null,28);
 for(const y of[.8,1.8,2.6]){const t=A(new THREE.TorusGeometry(1.21,.03,6,40),MT.dark,x,y,z);t.rotation.x=Math.PI/2}Cy(.15,1.25,.35,MT.dark,x,3.175,z,null,null,28);
 /* a ladder on the yard side (-x), on two stand-offs */for(const s of[-1,1])Cy(.025,.025,2.9,MT.galv,x-1.3,1.55,z+s*.2,null,null,6);for(let y=.4;y<3;y+=.3)Cy(.015,.015,.4,MT.galv,x-1.3,y,z,'z',null,6);for(const y of[.7,2.5])for(const s of[-1,1])B(.16,.04,.04,MT.galv,x-1.25,y,z+s*.2);
 /* the outlet pipe into the ground */rod([x+1.15,.5,z],[x+1.6,.5,z],.07,MT.galv);rod([x+1.6,.57,z],[x+1.6,-.05,z],.07,MT.galv);penNoSeam(g)}
/* a 6 m security light; returns the spot for the game's glow */
function penLightPole(g,x,z){const k=penKit(),{MT,M}=k,{B,Cy}=k.H(g);Cy(.25,.3,.25,MT.con2,x,.125,z,null,null,12);Cy(.08,.12,6,MT.galv,x,3.1,z,null,null,10);B(.8,.3,.4,MT.dark,x,6.0,z);B(.7,.02,.3,M(0xfff4c8,{emissive:0xfff0c0}),x,5.84,z);penNoSeam(g);return[x,5.75,z]}
/* the exercise cage (the game's x -498..-482, z -792..-768, its gate in the east side at z -781.2..-778.8): posts, chain
   link, top rails, razor coil on three sides, a rubber floor, two weight benches, a dumbbell rack, a pull-up bar, a
   punching bag on a stand. Returns {bag}: a group pivoting at the top of the chain (swing it with rotation.z). */
function penGymCage(g){const k=penKit(),{MT,M}=k,{A,B,Cy,rod,lab}=k.H(g);const x0=-498,x1=-482,z0=-792,z1=-768,H=3.2,D0=-781.2,D1=-778.8;
 {const m=A(new THREE.PlaneGeometry(x1-x0-.3,z1-z0-.3),M(0x3a4a3e,{roughness:1}),(x0+x1)/2,.085,(z0+z1)/2);m.rotation.x=-Math.PI/2}
 const post=(x,z,h)=>{Cy(.05,.05,h||3.4,MT.galv,x,(h||3.4)/2,z,null,null,8);Cy(.1,.12,.1,MT.con2,x,.05,z,null,null,10)};
 for(let x=x0;x<=x1+.01;x+=4)for(const z of[z0,z1])post(x,z,(x==x1&&z==z1)?4.3:3.4);for(let z=z0+4;z<z1-.01;z+=4){post(x0,z,z==-780?3.9:3.4);if(z<D0-.1||z>D1+.1)post(x1,z)}
 const pan=(ax,c,a0,a1)=>{const L=a1-a0,geo=new THREE.PlaneGeometry(L,H-.1),uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*L/.35,uv.getY(i)*(H-.1)/.35);const m=A(geo,MT.link,ax=='x'?(a0+a1)/2:c,.05+(H-.1)/2,ax=='x'?c:(a0+a1)/2);if(ax=='z')m.rotation.y=Math.PI/2};
 pan('x',z0,x0,x1);pan('x',z1,x0,x1);pan('z',x0,z0,z1);pan('z',x1,z0,D0);pan('z',x1,D1,z1);
 for(const[ax,c,a0,a1]of[['x',z0,x0,x1],['x',z1,x0,x1],['z',x0,z0,z1],['z',x1,z0,z1]])Cy(.035,.035,a1-a0,MT.galv,ax=='x'?(a0+a1)/2:c,H-.02,ax=='x'?c:(a0+a1)/2,ax=='x'?'x':'z',null,6);
 for(const[ax,c,a0,a1]of[['x',z0,x0,x1],['x',z1,x0,x1],['z',x0,z0,z1]]){const L=a1-a0,coil=Cy(.22,.22,L,MT.coil,ax=='x'?(a0+a1)/2:c,H+.23,ax=='x'?c:(a0+a1)/2,ax=='x'?'x':'z',null,10,true);const uv=coil.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setY(i,uv.getY(i)*L/1.6)}
 /* the gate's frame: square posts and a header over the gap */for(const z of[D0-.05,D1+.05])B(.1,H,.1,MT.steel,x1,H/2,z);B(.12,.1,D1-D0+.18,MT.steel,x1,H-.15,(D0+D1)/2);
 /* two weight benches (the game's at x -494, z -788 and -783) */for(const z of[-788,-783]){const x=-494;B(.08,.42,1.0,MT.steel,x,.21,z+.1);B(.32,.08,1.2,M(0xa02020),x,.46,z+.1);for(const e of[-.35,.55])B(.5,.05,.08,MT.steel,x,.025,z+e);
  for(const s of[-.5,.5]){B(.06,1.15,.06,MT.steel,x+s,.575,z-.55);B(.12,.04,.4,MT.steel,x+s,.02,z-.55);B(.08,.06,.12,MT.steel,x+s,1.06,z-.48)}Cy(.02,.02,1.7,MT.steel,x,1.1,z-.5,'x',null,8);for(const s of[-1,1]){Cy(.22,.22,.06,MT.dark,x+s*.72,1.1,z-.5,'x',null,16);Cy(.035,.035,.04,MT.steel,x+s*.66,1.1,z-.5,'x',null,8)}}
 /* the dumbbell rack (the game's at x -497.3, z -776): two shelves, eight dumbbells */{const x=-497.3,z=-776;for(const[a,b]of[[-.22,-1.17],[.22,-1.17],[-.22,1.17],[.22,1.17]])B(.05,.9,.05,MT.steel,x+a,.45,z+b);for(const y of[.45,.85]){B(.5,.04,2.4,MT.steel,x,y,z);for(let i=0;i<4;i++){const dz=-.85+i*.57,dy=y+.02+.07;Cy(.016,.016,.3,MT.steel,x,dy,z+dz,'x',null,6);for(const s of[-1,1])Cy(.07,.07,.08,MT.dark,x+s*.12,dy,z+dz,'x',null,10)}}}
 /* the pull-up bar (the game's posts at x -490.5, z -772 and -770) */{const x=-490.5;for(const z of[-772,-770]){B(.1,2.7,.1,MT.steel,x,1.35,z);B(.3,.02,.3,MT.steel,x,.01,z)}Cy(.03,.03,2.06,MT.galv,x,2.55,-771,'z',null,8)}
 /* the punching bag (the game's at x -486, z -788) on an A-frame stand */{const y=3.0;for(const xe of[-487.4,-484.6]){rod([xe,0,-788.8],[xe,y+.05,-788],.04,MT.steel);rod([xe,0,-787.2],[xe,y+.05,-788],.04,MT.steel)}B(3.0,.1,.1,MT.steel,-486,y+.05,-788);
  var bag=new THREE.Group();bag.position.set(-486,y,-788);g.add(bag);const ch=new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,.42,6),MT.galv);ch.position.y=-.2;bag.add(ch);const bg=new THREE.Mesh(new THREE.CylinderGeometry(.28,.28,1.1,16),M(0x8a2a1a,{roughness:.7}));bg.position.y=-.95;bag.add(bg);const cap=new THREE.Mesh(new THREE.CylinderGeometry(.29,.29,.08,16),MT.dark);cap.position.y=-.43;bag.add(cap)}
 /* the sign on the east fence, clamped to the chain link */B(.04,.9,2.8,MT.dark,-481.9,2.6,-786);for(const a of[-1.2,1.2])for(const b of[-.3,.3])B(.1,.06,.06,MT.steel,-481.95,2.6+b,-786+a);lab('EXERCISE YARD\n1 HOUR PER DAY',2.6,.8,'#20242a','#e8e0c8',-481.87,2.6,-786,Math.PI/2);
 /* the arm for the PA speaker on the west fence (x -498, z -780) and the arm for the CCTV dome on the north-east corner post */B(.36,.06,.06,MT.steel,-497.8,3.6,-780);B(.06,.06,.5,MT.steel,-482,4.1,-768.2);Cy(.025,.025,.17,MT.steel,-482,4.03,-768.4,null,null,6);
 penNoSeam(g);return{bag}}
/* the half basketball court (the game's 16 x 12 at x -452, z -716, the hoop at the +z end): lines and a hoop that faces the court */
function penHalfCourt(g){const k=penKit(),{MT,M}=k,{A,B,Cy}=k.H(g),cx=-452,cz=-716;
 const t=k.can(512,384,(x,w,h)=>{x.fillStyle='#7a4a3a';x.fillRect(0,0,w,h);for(let i=0;i<3000;i++){x.fillStyle='rgba(0,0,0,'+Math.random()*.08+')';x.fillRect(Math.random()*w,Math.random()*h,2,2)}const s=32;/* px per metre; the hoop end (+z) is the canvas bottom */
  x.strokeStyle='#ece8dc';x.lineWidth=4;x.strokeRect(4,4,w-8,h-8);x.fillStyle='#8a3a2a';x.fillRect(w/2-2.45*s,h-4-5.8*s,4.9*s,5.8*s);x.strokeRect(w/2-2.45*s,h-4-5.8*s,4.9*s,5.8*s);
  x.beginPath();x.arc(w/2,h-4-5.8*s,1.8*s,0,Math.PI*2);x.stroke();x.beginPath();x.arc(w/2,h-4-1.575*s,6.75*s,Math.PI+.21,-.21);x.stroke();x.beginPath();x.moveTo(w/2-6.6*s,h-4);x.lineTo(w/2-6.6*s,h-4-2.99*s);x.moveTo(w/2+6.6*s,h-4);x.lineTo(w/2+6.6*s,h-4-2.99*s);x.stroke();x.beginPath();x.arc(w/2,4,1.8*s,0,Math.PI);x.stroke()});
 const p=A(new THREE.PlaneGeometry(16,12),new THREE.MeshStandardMaterial({map:t,roughness:.9}),cx,.085,cz);p.rotation.x=-Math.PI/2;
 const zp=cz+6.6;Cy(.1,.12,3.5,MT.steel,cx,1.75,zp,null,null,10);Cy(.25,.28,.1,MT.steel,cx,.05,zp,null,null,12);B(.12,.12,.3,MT.steel,cx,3.3,cz+6.45);B(1.8,1.05,.06,M(0xf0f0f0),cx,3.4,cz+6.3);B(.59,.45,.03,M(0xd04020),cx,3.17,cz+6.255);B(.12,.03,.1,MT.steel,cx,3.03,cz+6.21);
 const r=A(new THREE.TorusGeometry(.24,.02,6,20),M(0xe06020,{metalness:.5}),cx,3.05,cz+5.95);r.rotation.x=Math.PI/2;A(new THREE.CylinderGeometry(.24,.16,.4,12,1,true),M(0xf0f0f0,{transparent:true,opacity:.6,side:THREE.DoubleSide,wireframe:true}),cx,2.84,cz+5.95);penNoSeam(g)}
/* the guard catwalk along the north inner wall (the game's deck x -492..-388 at z -701.6, 4.6 up): a grated deck that runs
   into the wall, brackets, the game's eight posts, a railing on the yard side, a stair down at the east end */
function penCatwalk(g){const k=penKit(),{MT,M}=k,{A,B,Cy,rod}=k.H(g),x0=-492,x1=-388,zw=-700.4,zf=-702.4,top=4.675;
 if(!k.grate)k.grate=new THREE.MeshStandardMaterial({map:k.can(64,64,(x,w,h)=>{x.fillStyle='#4a5058';x.fillRect(0,0,w,h);x.fillStyle='#22262a';for(let i=0;i<8;i++)for(let j=0;j<8;j++)x.fillRect(i*8+2,j*8+2,5,5)},1),metalness:.4,roughness:.6});
 B(x1-x0,.1,zw+.02-zf,k.grate,(x0+x1)/2,top-.05,(zw+.02+zf)/2,null,.25);B(x1-x0-.02,.16,.08,MT.steel,(x0+x1)/2,top-.13,zf-.02);
 for(let x=x0+2;x<x1;x+=4){rod([x,top-1.0,zw+.02],[x,top-.1,zf+.3],.04,MT.steel);B(.2,.3,.04,MT.steel,x,top-1.0,zw-.0+.0-.02+.04)}
 for(let x=x0+2;x<x1;x+=8){B(.16,top-.1,.16,MT.steel,x,(top-.1)/2,-702.3);B(.32,.02,.32,MT.steel,x,.08,-702.3)}
 for(let x=x0+.03;x<=x1-.02;x+=2)B(.05,1.05,.05,MT.steel,Math.min(x,x1-.03),top+.525,zf+.04);for(const y of[top+1.05,top+.55])Cy(.025,.025,x1-x0,MT.steel,(x0+x1)/2,y,zf+.04,'x',null,6);B(x1-x0,.12,.012,MT.yellow,(x0+x1)/2,top+.06,zf+.01);
 for(const y of[top+1.05,top+.55])Cy(.025,.025,zw-zf+.02,MT.steel,x0+.03,y,(zw+zf)/2,'z',null,6);
 /* the stair: 21 treads down along +x against the wall, stringers, a handrail on the yard side */{const zs0=-702.4,zs1=-701.4,n=21,rs=top/(n+1),gs=.3;for(let i=1;i<=n;i++){B(gs+.02,.04,.96,k.grate,x1+(i-.5)*gs,top-i*rs-.02,(zs0+zs1)/2)}
  const xe=x1+(n+.3)*gs;for(const z of[zs0+.03,zs1-.03])rod([x1,top,z],[xe,0,z],.05,MT.steel,null,4);rod([x1,top+1.0,zs0+.03],[xe,1.0,zs0+.03],.025,MT.steel);for(const u of[.35,.7])rod([x1+(xe-x1)*u,top*(1-u),zs0+.03],[x1+(xe-x1)*u,top*(1-u)+1.0,zs0+.03],.022,MT.steel)}
 /* a drop rod for the game's CCTV dome under the deck (x -440, z -701.2), an arm for the PA horn on the wall (x -440, z -700.8) */Cy(.025,.025,top-.1-3.945,MT.steel,-440,(top-.1+3.945)/2,-701.2,null,null,6);B(.08,.08,.36,MT.steel,-440,3.6,-700.55);
 penNoSeam(g)}
/* the sally port at the block exit (the game's metal detector arch at x -415, z -738.6, the glass cage out to z -735.2):
   the arch, a glass and steel porch from the wall to the cage's end, a roof, a floor mat. Returns {light} (the bar over the
   arch: the game turns it green or red) */
function penSallyPort(g){const k=penKit(),{MT,M}=k,{A,B,Cy,lab}=k.H(g),x=-415,z=-738.6,zw=-739.84,ze=-735.2,C=M(0xd8d8d0,{roughness:.6});const GL=M(0x9ab8c8,{transparent:true,opacity:.32,metalness:.2,roughness:.1,depthWrite:false});
 for(const s of[-1,1]){B(.3,2.4,.42,C,x+s*.85,1.2,z);B(.02,1.6,.1,M(0x103018,{emissive:0x10a030}),x+s*.695,1.3,z)}B(2.04,.32,.42,C,x,2.56,z);const light=B(.6,.08,.04,M(0x203020,{emissive:0x20c040}),x,2.45,z+.23);
 /* the porch: corner and middle posts, glass between, rails, the roof with a fascia */for(const s of[-1,1]){for(const pz of[zw+.04,(zw+ze)/2,ze-.04])B(.08,2.7,.08,MT.steel,x+s*1.6,1.35,pz);for(const[a,b]of[[zw+.08,(zw+ze)/2-.04],[(zw+ze)/2+.04,ze-.08]])B(.03,2.55,b-a,GL,x+s*1.6,1.355,(a+b)/2);for(const y of[.05,2.66])B(.06,.06,ze-zw-.16,MT.steel,x+s*1.6,y,(zw+ze)/2)}
 B(3.4,.08,ze-zw+.12,MT.dark,x,2.74,(zw+ze)/2+.06);B(3.44,.3,.04,MT.dark,x,2.6,ze+.14);lab('SALLY PORT · ONE AT A TIME · ARMS OUT',2.6,.24,'#2a2a2e','#e8c020',x,2.6,ze+.17,0);
 {const t=k.can(256,384,(c,w,h)=>{c.fillStyle='#2e3034';c.fillRect(0,0,w,h);c.fillStyle='#e8c020';for(const s of[-1,1]){c.beginPath();c.ellipse(w/2+s*22,h*.62,12,26,0,0,7);c.fill()}c.fillRect(10,h*.42,w-20,6)});const m=A(new THREE.PlaneGeometry(3.1,ze-zw-.1),new THREE.MeshStandardMaterial({map:t,roughness:.95}),x,.085,(zw+ze)/2);m.rotation.x=-Math.PI/2}
 penNoSeam(g);return{light}}
/* an arm from a wall to one of the game's CCTV domes (dome at x, y, z; the wall at wx or wz) */
function penDomeArm(g,x,y,z,wx,wz){const k=penKit(),{MT}=k,{B,Cy}=k.H(g);if(wx!=null)B(Math.abs(x-wx)+.03,.06,.06,MT.steel,(x+wx)/2,y+.2,z);else B(.06,.06,Math.abs(z-wz)+.03,MT.steel,x,y+.2,(z+wz)/2);Cy(.025,.025,.17,MT.steel,x,y+.12,z,null,null,6);penNoSeam(g)}
/* all of the above at the game's spots. Returns the handles: {bag, fans:[3], glows:[4 light poles], sally:{light}} */
function penYardGame(g){const r={};r.bag=penGymCage(g).bag;penHalfCourt(g);for(let x=-494;x<=-458;x+=6)penPlanter(g,x,-818);penGuardBooth(g,-454,-823,2.4,1,'GATE CONTROL');
 r.fans=[-790,-782,-774].map(z=>penACUnit(g,-384.5,z));for(const z of[-760,-752])penTank(g,-384.5,z);r.glows=[[-486,-805],[-394,-805],[-486,-735],[-394,-735]].map(([x,z])=>penLightPole(g,x,z));
 for(const x of[-468,-436])penBench(g,x,-704,0,2.4);for(const[x,z]of[[-490,-722],[-480,-722],[-490,-713],[-480,-713]])penPicnic(g,x,z,0);penCatwalk(g);r.sally=penSallyPort(g);
 penDomeArm(g,-470.4,3.9,-770,-470.12,null);penDomeArm(g,-470.4,3.9,-790,-470.12,null);penDomeArm(g,-409.6,3.9,-748,-409.88,null);penDomeArm(g,-409.6,3.9,-790,-409.88,null);return r}

/* --- the game's own yard things, remodelled in place --- */
/* the basketball court (the game's 14 x 9 at (-470, -845)) with lines, and its two hoops (the game's posts at x -/+ 6.5) */
function penCourt(g){const k=penKit(),{MT,M}=k,{A,B,Cy}=k.H(g);const t=k.can(512,330,(x,w,h)=>{x.fillStyle='#7a4a3a';x.fillRect(0,0,w,h);for(let i=0;i<3000;i++){x.fillStyle='rgba(0,0,0,'+Math.random()*.08+')';x.fillRect(Math.random()*w,Math.random()*h,2,2)}x.strokeStyle='#ece8dc';x.lineWidth=4;x.strokeRect(8,8,w-16,h-16);x.beginPath();x.moveTo(w/2,8);x.lineTo(w/2,h-8);x.stroke();x.beginPath();x.arc(w/2,h/2,40,0,7);x.stroke();for(const s of[0,1]){x.beginPath();x.arc(s?w-8:8,h/2,120,s?Math.PI/2:-Math.PI/2,s?Math.PI*1.5:Math.PI/2,false);x.stroke();x.strokeRect(s?w-8-90:8,h/2-40,90,80)}});
 const p=A(new THREE.PlaneGeometry(14,9),new THREE.MeshStandardMaterial({map:t,roughness:.9}),-470,.062,-845);p.rotation.x=-Math.PI/2;
 for(const s of[-1,1]){const x=-470+s*6.5;/* the post stays at the game's spot; the arm reaches in, the board faces the court, the rim hangs off its front */Cy(.08,.1,3.4,MT.steel,x,1.7,-845,null,null,10);Cy(.18,.2,.12,MT.steel,x,.06,-845,null,null,10);B(.92,.12,.12,MT.steel,x-s*.46,3.2,-845);B(.04,1.05,1.8,M(0xf0f0f0),x-s*.92,3.35,-845);B(.03,.45,.59,M(0xd04020),x-s*.95,3.12,-845);B(.08,.03,.12,MT.steel,x-s*.98,3.03,-845);
  const r=A(new THREE.TorusGeometry(.23,.015,6,20),M(0xe06020,{metalness:.5}),x-s*1.24,3.05,-845);r.rotation.x=Math.PI/2;const n=A(new THREE.CylinderGeometry(.23,.15,.4,12,1,true),M(0xf0f0f0,{transparent:true,opacity:.6,side:THREE.DoubleSide,wireframe:true}),x-s*1.24,2.84,-845)}
 penNoSeam(g)}
/* a floodlight mast (the game's poles at (-520 + 32 i, -848), 9 m): tapered, a ladder, two lamps facing the yard (+z) */
function penFloodMast(g,x,z){const k=penKit(),{MT,M}=k,{B,Cy,rod}=k.H(g);Cy(.12,.2,9,MT.galv,x,4.5,z,null,null,10);Cy(.4,.45,.25,MT.con2,x,.12,z,null,null,12);B(1.8,.12,.12,MT.galv,x,9.0,z+.15);
 for(const s of[-1,1]){B(.6,.5,.25,MT.dark,x+s*.6,9.25,z+.35);B(.5,.4,.02,M(0xfff4c8,{emissive:0xfff0c0}),x+s*.6,9.25,z+.48)}for(let y=1;y<8.5;y+=.4)B(.3,.025,.025,MT.galv,x,y,z-.24);for(const s of[-1,1])Cy(.015,.015,7.6,MT.galv,x+s*.15,4.7,z-.24,null,null,4);
 penNoSeam(g)}
/* the workshop (the game's shed x -366..-358, z -765..-755, open on its west side; obstacles stay): concrete walls, a
   proper west front (corner piers, a header with a rolled-up door), a pitched tin roof, the workbench and the toolbox at
   the game's spots, tools on the wall, shelves. The two corner piers need obstacles (see the spec). */
function penWorkshop(g){const k=penKit(),{MT,M}=k,{A,B,Cy,rod,lab}=k.H(g),x0=-366,x1=-358,z0=-765,z1=-755,H=3;
 B(7.66,.06,9.38,M(0x6a6a66),-362.14,.03,-760);/* between the walls */B(8.3,H,.3,MT.con2,-362.15,H/2,z0+.15,null,2);B(8.3,H,.3,MT.con2,-362.15,H/2,z1-.15,null,2);B(.3,H,9.4,MT.con2,x1-.15,H/2,-760,null,2);
 for(const z of[z0+.75,z1-.75])B(.35,H+.02,1.2,MT.con2,x0-.025,(H+.02)/2,z,null,2);B(.35,.5,7.6,MT.con2,x0-.025,H-.25,-760,null,2);/* corner piers and the header over the opening (z -763.8..-756.2) */
 const roll=Cy(.17,.17,7.6,MT.galv,x0+.3,H-.67,-760,'z',null,12);/* the rolled-up door's drum, tucked under the header */
 /* a pitched tin roof (ridge along x) */{const t=k.can(128,128,(x,w,h)=>{x.fillStyle='#8a8e92';x.fillRect(0,0,w,h);for(let i=0;i<w;i+=16){x.fillStyle='rgba(0,0,0,.25)';x.fillRect(i,0,4,h)}},1);t.repeat.set(4,1);const RM=new THREE.MeshStandardMaterial({map:t,metalness:.5,roughness:.5,side:THREE.DoubleSide});
  for(const s of[-1,1]){const L=Math.hypot(5.4,.8),p=A(new THREE.PlaneGeometry(8.8,L),RM,-362,H+.4,-760+s*2.7);p.rotation.x=s>0?Math.atan2(.8,5.4)-Math.PI/2:Math.PI/2-Math.atan2(.8,5.4)}B(8.9,.1,.1,MT.galv,-362,H+.83,-760)}
 /* the workbench at the game's table spot (-359.6, -760) and the toolbox on it (-359.5, .9): red, a lid, a handle, a combination lock */
 B(1.4,.08,.8,M(0x6a4a2a),-359.6,.86,-760);for(const a of[-.6,.6])for(const b of[-.32,.32])B(.07,.82,.07,MT.steel,-359.6+a,.41,-760+b);B(1.3,.04,.7,M(0x6a4a2a),-359.6,.25,-760);
 const tb=new THREE.Group();tb.position.set(-359.5,.9,-760);g.add(tb);{const q=k.H(tb);q.B(1,.5,.5,M(0xc02020,{metalness:.4,roughness:.4}),0,.25,0);q.B(1.02,.08,.52,M(0x9a1818,{metalness:.4}),0,.52,0);q.B(.5,.04,.04,MT.dark,0,.6,0);for(const s of[-1,1])q.B(.04,.08,.03,MT.dark,s*.25,.56,0);q.B(.18,.12,.04,MT.galv,-.3,.3,-.27);for(let i=0;i<3;i++)q.Cy(.025,.025,.03,MT.black,-.36+i*.06,.27,-.29,'z',tb,8)}
 /* a pegboard of tools on the east wall, shelves on the north wall, a vice, an oil drum */{const t=k.can(256,128,(x,w,h)=>{x.fillStyle='#c8a878';x.fillRect(0,0,w,h);x.fillStyle='rgba(60,40,20,.5)';for(let i=6;i<w;i+=12)for(let j=6;j<h;j+=12){x.beginPath();x.arc(i,j,1.6,0,7);x.fill()}x.strokeStyle='#3a3a3a';x.lineWidth=5;
  [[30,20,30,100],[60,30,90,60],[120,20,120,110],[160,30,190,30],[160,30,160,90],[210,20,240,100]].forEach(([a,b,c,d])=>{x.beginPath();x.moveTo(a,b);x.lineTo(c,d);x.stroke()})});const pb=A(new THREE.PlaneGeometry(2.4,1.2),new THREE.MeshStandardMaterial({map:t,roughness:.8}),x1-.31,1.8,-760);pb.rotation.y=-Math.PI/2}
 for(const y of[.6,1.3,2.0]){B(3,.05,.5,M(0x7a5a3a),-362,y,z0+.56);for(let i=0;i<4;i++)B(.4,.3,.35,M([0x3a5a8a,0xc8a050,0x5a5a5a,0xa04020][(i+y*10|0)%4]),-363.2+i*.8,y+.175,z0+.56)}for(const s of[-1,1])B(.05,2.1,.5,MT.steel,-362+s*1.52,1.05,z0+.56);
 Cy(.3,.3,.9,M(0x2a4a8a,{metalness:.4}),-358.9,.45,z1-.75,null,null,14);B(.2,.2,.3,MT.steel,-360.4,.98,-760.25);
 penNoSeam(g)}
/* the hiding spots' furniture (the game builds them in penPolish2's hide(); same footprints, same obstacles) */
function penDumpster(along){const k=penKit(),{MT,M}=k,g=new THREE.Group(),{B,Cy}=k.H(g);const w=2.4,d=1.4,G=M(0x2a5a3a,{metalness:.4,roughness:.6});/* along x; turned by the caller for 'z' */
 B(w,1.15,d,G,0,.73,0);B(w+.04,.1,d+.04,M(0x1a3a24),0,1.35,0);for(const s of[-1,1]){const l=B(w/2-.04,.05,d+.02,M(0x1a2a1a),s*w/4,1.42,0);l.rotation.z=s*.06}for(const s of[-1,1])B(.06,.25,.2,MT.dark,s*(w/2+.03),1.0,0);
 for(const[x,z]of[[-.95,-.55],[.95,-.55],[-.95,.55],[.95,.55]]){Cy(.08,.08,.05,MT.black,x,.08,z,'z',null,10);B(.06,.08,.06,MT.dark,x,.17,z)}penNoSeam(g);return g}
function penCrateStack(){const k=penKit(),{M}=k,g=new THREE.Group(),{B}=k.H(g);const t=k.can(128,128,(x,w,h)=>{x.fillStyle='#9a7448';x.fillRect(0,0,w,h);x.strokeStyle='rgba(60,40,20,.6)';x.lineWidth=3;for(let i=0;i<4;i++){x.beginPath();x.moveTo(0,i*32+1);x.lineTo(w,i*32+1);x.stroke()}x.lineWidth=8;x.strokeRect(4,4,w-8,h-8);x.beginPath();x.moveTo(4,4);x.lineTo(w-4,h-4);x.stroke()});const CM=new THREE.MeshStandardMaterial({map:t,roughness:.9});
 /* the game's three: 1.2 at x-.6, 1.1 at x+.65, 1.0 on top (the game had it floating 10 cm over the second), on a pallet */B(2.5,.12,1.35,M(0xa07a4a),0,.06,.03);B(1.2,1.2,1.2,CM,-.6,.72,0);B(1.1,1.1,1.1,CM,.65,.67,.1);B(1.0,1.0,1.0,CM,-.45,1.82,0);penNoSeam(g);return g}
/* --- the inner wall (7 m) and its gate --- */
/* the gate the game slides into the wall (DOOR 'igate': 12 x 6.76 x .12, centre y 3.4, slides 12 m along x into the
   wall's thickness): a heavy steel leaf with ribs, hazard stripes, its own face 1 cm inside the slab's size */
function penInnerGate(){const k=penKit(),{MT,M}=k,g=new THREE.Group(),{B,A}=k.H(g),w=12,h=6.76;const SH=M(0x3a4048,{metalness:.35,roughness:.55}),FR=M(0x2a2e34,{metalness:.4,roughness:.5});
 B(w-.04,h-.04,.08,SH,0,0,0);for(const s of[-1,1]){B(.2,h,.12,FR,s*(w/2-.1),0,0);B(w-.4,.2,.12,FR,0,s*(h/2-.1),0)}for(let x=-w/2+1.5;x<w/2-1;x+=1.5)B(.12,h-.4,.1,FR,x,0,0);B(w-.4,.14,.11,FR,0,0,0);
 const hz=k.can(512,32,(x,w2,h2)=>{for(let i=-2;i<40;i++){x.fillStyle=i%2?'#1a1a1a':'#e0b020';x.beginPath();x.moveTo(i*16,0);x.lineTo(i*16+16,0);x.lineTo(i*16,h2);x.lineTo(i*16-16,h2);x.fill()}});hz.wrapS=THREE.RepeatWrapping;hz.repeat.set(4,1);
 for(const s of[-1,1]){const p=A(new THREE.PlaneGeometry(w-.4,.35),new THREE.MeshStandardMaterial({map:hz,roughness:.6}),0,-h/2+.55,s*.07);if(s<0)p.rotation.y=Math.PI}g.userData.dpKeep=1;penNoSeam(g);return g}
/* the wall: 4 sides of PENI, .8 thick, 7 high, the gate gap x -446..-434 on z -830. Buttresses every 12 m (none at the
   gate), a coping on top, the razor coil, the yellow band, lamps on the outside face (the game's lantern spots). Returns
   {lampMat}: the gate's red/green lamp material (both faces share it; the game sets its emissive). */
function penInnerWall(g){const k=penKit(),{MT,M}=k,{A,B,Cy}=k.H(g),I=PENV.I,H=7,T=.8;
 const seg=(ax,c,a0,a1)=>{const L=a1-a0,m=(a0+a1)/2;if(L<.05)return;if(ax=='x')B(L,H,T,MT.con,m,H/2,c,null,2);else B(T,H,L,MT.con,c,H/2,m,null,2)};
 const sides=[['x',I.z0,I.x0,I.x1,-1],['x',I.z1,I.x0,I.x1,1],['z',I.x0,I.z0,I.z1,-1],['z',I.x1,I.z0,I.z1,1]];/* last: the outward side */
 for(const[ax,c,a0,a1,o]of sides){const gap=ax=='x'&&c==I.z0;const pcs=gap?[[a0-T/2,-446],[-434,a1+T/2]]:ax=='x'?[[a0-T/2,a1+T/2]]:[[a0+T/2,a1-T/2]];for(const[p0,p1]of pcs){seg(ax,c,p0,p1);const L=p1-p0,mid=(p0+p1)/2;
   /* the coping (2 cm proud each side, on top), the dark band under it, the yellow band at 1 m, both faces */if(ax=='x'){B(L+.03,.2,T+.04,MT.con2,mid,H+.1,c);B(L+.02,.5,T+.02,M(0x3a3c40),mid,6.6,c);B(L+.02,.25,T+.02,MT.yellow,mid,1.0,c)}else{B(T+.04,.2,L-.02,MT.con2,c,H+.1,mid);B(T+.02,.5,L-.02,M(0x3a3c40),c,6.6,mid);B(T+.02,.25,L-.02,MT.yellow,c,1.0,mid)}/* the long sides' bands wrap the corners by 1 cm */
   const coil=Cy(.34,.34,L,MT.coil,ax=='x'?mid:c,H+.5,ax=='x'?c:mid,ax=='x'?'x':'z',null,10,true);const uv=coil.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setY(i,uv.getY(i)*L/1.6)}
  for(let u=a0+6;u<a1;u+=12){if(gap&&u>-448&&u<-432)continue;const x=ax=='x'?u:c,z=ax=='x'?c:u;if(ax=='x')B(1.1,H-.2,T+.6,MT.con2,x,(H-.2)/2,z,null,2);else B(T+.6,H-.2,1.1,MT.con2,x,(H-.2)/2,z,null,2);
   /* a lamp on the outside face of the buttress */const lx=ax=='x'?x:x+o*(T/2+.3+.12),lz=ax=='x'?z+o*(T/2+.3+.12):z;B(.3,.2,.24,MT.dark,lx,5.4,lz);B(.24,.04,.18,M(0xfff4c8,{emissive:0xfff0c0}),lx,5.29,lz)}}
 /* the gate's frame: steel jambs on both faces of the gap, a head beam over it at 6.9..7.0, the red/green lamps */for(const x of[-446.1,-433.9])B(.24,H+.1,T+.08,MT.steel,x,(H+.1)/2,I.z0);B(11.96,.02,.2,MT.steel,-440,.01,I.z0);/* the gate's ground track: the leaf rides 2 cm up, so it sits on this instead of hovering */
 const lampMat=M(0x200000,{emissive:0xc00000});for(const s of[-1,1]){B(.2,.2,.08,MT.dark,-432.9,4,I.z0+s*(T/2+.04));B(.14,.14,.02,lampMat,-432.9,4,I.z0+s*(T/2+.09))}
 penNoSeam(g);return{lampMat}}
/* --- Cell Block D from outside --- */
/* the game's walls (CON2, 4.6 high, .3 thick, round PENB; the exit at x -416..-414 on z -740) stay as they are; this
   adds a facade 1 cm outside them: panels, a plinth band, narrow barred windows high up, downpipes, and on the roof a
   parapet, air-handling units and ducts. The exit gets a frame, a canopy, a keypad and a lamp. */
function penBlockOutside(g){const k=penKit(),{MT,M}=k,{A,B,Cy}=k.H(g),Bk=PENV.B,H=4.6,o=.15+.01;
 const t=k.can(512,256,(x,w,h)=>{x.fillStyle='#8e8c86';x.fillRect(0,0,w,h);for(let i=0;i<6000;i++){x.fillStyle=Math.random()<.5?'rgba(40,40,40,'+Math.random()*.08+')':'rgba(255,255,255,'+Math.random()*.06+')';x.fillRect(Math.random()*w,Math.random()*h,2,2)}x.strokeStyle='rgba(40,40,40,.35)';x.lineWidth=2;for(let i=0;i<=4;i++){x.beginPath();x.moveTo(i*128,0);x.lineTo(i*128,h);x.stroke()}x.beginPath();x.moveTo(0,h*.5);x.lineTo(w,h*.5);x.stroke();
  x.fillStyle='#4a4c50';x.fillRect(0,h-28,w,28);for(const u of[64,192,320,448]){x.fillStyle='#14181c';x.fillRect(u-8,30,16,70);x.fillStyle='#6a6e74';for(let i=0;i<3;i++)x.fillRect(u-8+i*7,30,2,70);x.fillRect(u-12,26,24,4);x.fillRect(u-12,100,24,4)}},1);
 const FM=new THREE.MeshStandardMaterial({map:t,roughness:.9});
 const face=(ax,c,a0,a1,ry)=>{const L=a1-a0,geo=new THREE.PlaneGeometry(L,H),uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setX(i,uv.getX(i)*L/8);const m=A(geo,FM,ax=='x'?(a0+a1)/2:c,H/2,ax=='x'?c:(a0+a1)/2);m.rotation.y=ry};
 face('x',Bk.z0-o,Bk.x0-.15,Bk.x1+.15,Math.PI);face('z',Bk.x0-o,Bk.z0-.15,-766.15,-Math.PI/2);face('z',Bk.x0-o,-741.85,Bk.z1+.15,-Math.PI/2);/* the west side stops at the mess hall (z -766.15..-741.85), which has its own doorway into the block */face('z',Bk.x1+o,Bk.z0-.15,Bk.z1+.15,Math.PI/2);
 face('x',Bk.z1+o,Bk.x0-.15,-416.4,0);face('x',Bk.z1+o,-413.6,Bk.x1+.15,0);/* the exit side, round its frame */
 /* the exit: frame, canopy on brackets, keypad, lamp; the game's door slides into the wall's thickness */for(const x of[-416.25,-413.75])B(.3,2.75,.36,MT.steel,x,1.375,Bk.z1);B(2.84,.3,.4,MT.steel,-415,2.72,Bk.z1);/* the lintel 3 cm over the door's top, a little deeper than the jambs *//* (no canopy: the sally port's porch roofs the door) */
 B(.2,.28,.05,M(0x2a2e34),-412.9,1.4,Bk.z1+.19);B(.14,.14,.02,M(0x60ff80,{emissive:0x208030}),-412.9,1.42,Bk.z1+.22);
 /* downpipes at the corners */for(const[x,z]of[[Bk.x0-.3,Bk.z0-.3],[Bk.x1+.3,Bk.z0-.3],[Bk.x0-.3,Bk.z1+.3],[Bk.x1+.3,Bk.z1+.3]])Cy(.07,.07,H+.2,MT.galv,x,(H+.2)/2,z,null,null,8);
 /* the roof: the game's slab stays (4.6..4.9, 60.6 square); a parapet round it, units and ducts on top */for(const[ax,c]of[['x',Bk.z0-.15],['x',Bk.z1+.15],['z',Bk.x0-.15],['z',Bk.x1+.15]]){if(ax=='x')B(60.6,.5,.3,MT.con2,-440,5.15,c);else B(.3,.5,60,MT.con2,c,5.15,-770)}
 for(const[x,z]of[[-455,-790],[-440,-770],[-425,-750]]){B(4,1.6,2.6,MT.galv,x,4.9+.8,z);B(4.04,.1,2.64,MT.dark,x,6.55,z);for(const s of[-1,1])Cy(.6,.6,.1,MT.dark,x+s*1,6.62,z,null,null,16)}
 B(.8,.8,24,MT.galv,-448,5.3,-776);B(18,.8,.8,MT.galv,-440,5.3,-764);for(const[x,z]of[[-462,-752],[-418,-792]]){Cy(.3,.3,1.2,MT.galv,x,5.5,z,null,null,12);Cy(.45,.45,.15,MT.dark,x,6.15,z,null,null,12)}
 penNoSeam(g)}
/* the mess hall from outside (the game's PMESS: x -498..-470, z -766..-742, 4.6 high, roof slab 4.6..4.9): a plain
   facade skin 1 cm off its three outer walls, a parapet round its roof, frames and bars round the four slit windows
   (z -762, -756, -750, -744, 3.4 up), an arm for the PA horn on the west wall (z -754) */
function penMessOutside(g){const k=penKit(),{MT,M}=k,{A,B,Cy}=k.H(g),H=4.6,X0=-498,Z0=-766,Z1=-742,o=.16;
 if(!k.facP)k.facP=new THREE.MeshStandardMaterial({map:k.can(512,256,(x,w,h)=>{x.fillStyle='#8e8c86';x.fillRect(0,0,w,h);for(let i=0;i<6000;i++){x.fillStyle=Math.random()<.5?'rgba(40,40,40,'+Math.random()*.08+')':'rgba(255,255,255,'+Math.random()*.06+')';x.fillRect(Math.random()*w,Math.random()*h,2,2)}x.strokeStyle='rgba(40,40,40,.35)';x.lineWidth=2;for(let i=0;i<=4;i++){x.beginPath();x.moveTo(i*128,0);x.lineTo(i*128,h);x.stroke()}x.beginPath();x.moveTo(0,h*.5);x.lineTo(w,h*.5);x.stroke();x.fillStyle='#4a4c50';x.fillRect(0,h-28,w,28)},1),roughness:.9});
 const face=(ax,c,a0,a1,ry)=>{const L=a1-a0,geo=new THREE.PlaneGeometry(L,H),uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setX(i,uv.getX(i)*L/8);const m=A(geo,k.facP,ax=='x'?(a0+a1)/2:c,H/2,ax=='x'?c:(a0+a1)/2);m.rotation.y=ry};
 face('x',Z0-.15-.01,X0-.16,-470.16,Math.PI);face('x',Z1+.15+.01,X0-.16,-470.16,0);face('z',X0-o,Z0-.16,Z1+.16,-Math.PI/2);
 B(27.85,.5,.3,MT.con2,-484.225,5.15,Z0);B(27.85,.5,.3,MT.con2,-484.225,5.15,Z1);B(.3,.5,Z1-Z0-.3,MT.con2,X0,5.15,(Z0+Z1)/2);
 for(const z of[-762,-756,-750,-744]){const x=X0-o;B(.02,1.1,1.54,M(0x2a3a44,{emissive:0x304050,roughness:.2}),x-.01,3.4,z);for(const y of[2.81,3.99])B(.06,.08,1.7,MT.steel,x-.03,y,z);for(const s of[-1,1])B(.06,1.1,.08,MT.steel,x-.03,3.4,z+s*.81);for(let i=0;i<4;i++)Cy(.02,.02,1.1,MT.dark,x-.05,3.4,z-.45+i*.3,null,null,6);B(.12,.04,1.8,MT.con2,x-.06,2.75,z)}
 B(.1,.08,.08,MT.steel,-498.19,3.6,-754);penNoSeam(g)}
