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
