/* =====================================================================================================
   Dusty Gulch rework. Needs fort-kit.js (fbKit). See dusty-gulch.md.
   Main Street runs along z at x 450 (the old 7 m road x 446.5..453.5). Buildings: west fronts at x 440 (doors face +x),
   east fronts at x 460 (bank) and 462 (chapel) (doors face -x). The town runs from the arch (z -1430) to z -1515.
   ===================================================================================================== */
function guKit(){if(guKit.k)return guKit.k;const f=fbKit(),k=Object.create(f),M=f.M;let sd=5150;const r=()=>((sd=Math.imul(sd^sd>>>15,sd|1)+0x6d2b79f5|0)>>>0)/4294967296;
 /* weathered boards: horizontal planks with gaps, knots and grain */
 const boards=(base,vert)=>{const m=M(0xffffff,{roughness:.9});m.map=f.tex(256,256,(c,w,h)=>{c.fillStyle=base;c.fillRect(0,0,w,h);for(let y=0;y<h;y+=32){const v=(r()-.5)*30;c.fillStyle='rgba('+(v>0?255:0)+','+(v>0?240:0)+','+(v>0?220:0)+','+Math.abs(v)/150+')';c.fillRect(0,y,w,32);c.fillStyle='rgba(0,0,0,.45)';c.fillRect(0,y,w,2.5);c.fillStyle='rgba(0,0,0,.08)';for(let i=0;i<10;i++){c.fillRect(0,y+4+r()*24,w,1)}for(let i=0;i<2;i++){c.beginPath();c.ellipse(r()*w,y+8+r()*16,3,2,0,0,7);c.fillStyle='rgba(40,20,10,.5)';c.fill()}}if(vert){const t=c.getImageData(0,0,w,h);c.save();c.translate(w/2,h/2);c.rotate(Math.PI/2);c.translate(-w/2,-h/2);c.putImageData(t,0,0);c.restore()}});m.userData.s=.4;return m};
 k.BOARD=boards('#8a6a48');k.BOARDG=boards('#9a8a78');k.BOARDR=boards('#8a3a2a');k.BOARDB=boards('#4a5a6a');k.BOARDW=boards('#d8ccb0');k.BOARDD=boards('#5a3e28');
 k.DECK=M(0xffffff,{roughness:.9});k.DECK.map=f.tex(256,256,(c,w,h)=>{c.fillStyle='#7a5a3a';c.fillRect(0,0,w,h);for(let x=0;x<w;x+=21){const v=(r()-.5)*40;c.fillStyle='rgba('+(v>0?255:0)+','+(v>0?235:0)+','+(v>0?210:0)+','+Math.abs(v)/160+')';c.fillRect(x,0,21,h);c.fillStyle='rgba(0,0,0,.5)';c.fillRect(x,0,2,h);for(let y=20+r()*40;y<h;y+=90)c.fillRect(x+4,y,1.5,1.5),c.fillRect(x+15,y,1.5,1.5)}});k.DECK.userData.s=.5;
 k.POST=M(0x5a3e28,{roughness:.9});k.TRIM=M(0x3a2414,{roughness:.85});k.TIN=M(0x7a7e80,{metalness:.55,roughness:.5});k.IRON=M(0x2a2a2a,{metalness:.6,roughness:.5});
 return guKit.k=k}

/* ---- batch 1: Main Street. The dirt street, the boardwalks both sides (covered), steps, the welcome arch, lamps,
   hitching rails and troughs, the town pump, the broken wagon. Returns {obs, plates}. ---- */
function guStreet(g){const k=guKit(),{B,C,rod,L}=k.H(g),M=k.M;const obs=[],plates=[],ob=(x0,x1,z0,z1)=>obs.push({x0,x1,z0,z1});
 /* the street: packed dirt 15 m wide from the arch to the south end of town, ruts, hoof prints, fading into the desert at the ends */
 const SZ0=-1560,SZ1=-1423,SX0=442.5,SX1=457.5,TW=512,TH=4096;const st=k.tex(TW,TH,(c,w,h)=>{c.fillStyle='#a8916c';c.fillRect(0,0,w,h);let sd=31;const r=()=>((sd=Math.imul(sd^sd>>>15,sd|1)+0x6d2b79f5|0)>>>0)/4294967296;
  for(let i=0;i<26000;i++){const v=r();c.fillStyle=v<.5?'rgba(70,55,38,'+(.05+r()*.1)+')':'rgba(220,200,165,'+(.05+r()*.1)+')';const s=1+r()*3.5;c.fillRect(r()*w,r()*h,s,s)}
  /* two pairs of ruts, wavering */for(const x0 of[.3,.42,.58,.7]){c.strokeStyle='rgba(80,62,42,.38)';c.lineWidth=w*.035;c.beginPath();for(let y=0;y<=h;y+=64)c.lineTo(w*x0+Math.sin(y*.004+x0*9)*w*.015,y);c.stroke()}
  for(let i=0;i<500;i++){c.fillStyle='rgba(70,52,34,.25)';const x=w*(.45+r()*.1),y=r()*h;c.beginPath();c.arc(x,y,3,0,Math.PI);c.fill()}
  /* soft edges */const gl=c.createLinearGradient(0,0,w,0);gl.addColorStop(0,'rgba(196,168,120,.9)');gl.addColorStop(.08,'rgba(196,168,120,0)');gl.addColorStop(.92,'rgba(196,168,120,0)');gl.addColorStop(1,'rgba(196,168,120,.9)');c.fillStyle=gl;c.fillRect(0,0,w,h)});
 st.wrapS=st.wrapT=THREE.ClampToEdgeWrapping;st.anisotropy=8;{const p=new THREE.Mesh(new THREE.PlaneGeometry(SX1-SX0,SZ1-SZ0),M(0xffffff,{map:st,roughness:1}));p.rotation.x=-Math.PI/2;p.position.set(450,.03,(SZ0+SZ1)/2);g.add(p)}
 /* a boardwalk: deck on joists and piers, a front edge beam, posts carrying a tin awning, steps down at the ends and opposite each door.
    side -1 = west (x 440..443), +1 = east (x 457..460) */
 const walk=(side,z0,z1,doors,xIn)=>{const xi=xIn,xo=side<0?443:457,xc=(xi+xo)/2,wd=Math.abs(xo-xi),zc=(z0+z1)/2,Ln=z1-z0,y=.42;
  B(wd,.08,Ln,xc,y,zc,k.DECK);plates.push({x0:Math.min(xi,xo),x1:Math.max(xi,xo),z0,z1,y:y+.04});
  B(.18,.3,Ln,xo-side*.09,y-.19,zc,k.TRIM);for(let z=z0+.4;z<z1;z+=2.4){B(.22,y-.08,.22,xo-side*.25,(y-.08)/2,z,k.POST);B(.22,y-.08,.22,xi+side*.3,(y-.08)/2,z,k.POST)}
  /* posts at the edge every 3.6 m (with a gap at each door), a beam on top, a sloping tin roof back to the fronts */const pz=[];for(let z=z0+.3;z<=z1-.2;z+=3.6)if(!doors.some(d=>Math.abs(z-d)<1.6))pz.push(z);pz.push(z1-.2);
  for(const z of pz){C(.09,.1,2.75,xo-side*.15,y+1.4,z,k.POST,null,null,8);B(.4,.04,.4,xo-side*.15,y+.02,z,k.TRIM);ob(xo-side*.15-.12,xo-side*.15+.12,z-.12,z+.12)}
  /* the roof sits on the edge beam and on a ledger on the building fronts, sloping down to the street */const bx=xo-side*.15,bt=y+2.96,sl=.12,xe=xo-side*.4,xb=xi,ux=d=>bt+(d-bx)*side*sl;/* the street is at -side; the roof overhangs the edge beam by .55 and rises towards the fronts */B(.14,.22,Ln,bx,y+2.85,zc,k.POST);{const yb=ux(xb),ye=ux(xe),len=Math.hypot(xb-xe,yb-ye),cxr=(xb+xe)/2,cyr=(yb+ye)/2+.025;const rf=B(len,.05,Ln+.2,cxr,cyr,zc,k.TIN);rf.rotation.z=Math.atan2(yb-ye,xb-xe);B(.14,.2,Ln,xb+side*.07,yb-.1,zc,k.POST)}
  /* knee braces from each post up to the edge beam, along the beam */for(const z of pz)for(const dz of[-.6,.6])if(z+dz>z0&&z+dz<z1)rod([xo-side*.15,y+2.25,z],[xo-side*.15,y+2.78,z+dz],.04,k.POST);
  /* steps down to the street at both ends and opposite each door */const step=(z)=>{for(let i=0;i<2;i++)B(.4,.14,1.6,xo+side*(.2+i*.4),y-.14-i*.14,z,k.DECK);plates.push({x0:Math.min(xo,xo+side*.8),x1:Math.max(xo,xo+side*.8),z0:z-.8,z1:z+.8,y:.15})};for(const d of doors)step(d)};
 /* west: z -1515..-1437, the fronts at x 440; east: z -1515..-1437 at x 460 (in front of the chapel, x 462, it reaches back to 462) */
 walk(-1,-1515,-1437,[-1449,-1474,-1501],440);walk(1,-1515,-1437,[-1451,-1485],460);
 /* in front of the chapel (x 460..462, z -1500..-1470) the east walk is 2 m deeper */B(2,.08,30,461,.42,-1485,k.DECK);plates.push({x0:460,x1:462,z0:-1500,z1:-1470,y:.46});/* and the awning carries on up to the chapel front: same slope, its own ledger at x 462 */{const y0=.42+2.96+(460-457.15)*.12,y1=y0+2*.12,rf=B(Math.hypot(2,y1-y0),.05,30,461,(y0+y1)/2+.025,-1485,k.TIN);rf.rotation.z=Math.atan2(y1-y0,2);B(.14,.2,30,461.93,y1-.1,-1485,k.POST)}
 /* the welcome arch across the north end: two log posts, a crossbeam with a painted board, a cow skull */
 {const az=-1430;for(const sx of[441.5,458.5]){C(.32,.38,6.2,sx,3.1,az,k.POST,null,null,10);for(let i=0;i<3;i++)B(.9,.4,.9,sx,.2+i*.01,az,M(0x8a8070,{roughness:1}));ob(sx-.4,sx+.4,az-.4,az+.4)}C(.25,.25,18.2,450,5.9,az,k.POST,'x',null,10);/* corner braces from each post up to the crossbeam */for(const sx of[-1,1])rod([450+sx*8.45,4.4,az],[450+sx*6.9,5.82,az],.12,k.POST);
  B(10,1.3,.12,450,5.1,az,k.BOARD);L('WELCOME TO DUSTY GULCH',9.6,.9,null,'#f0e0b0',60,450,5.15,az-.07,Math.PI);L('WELCOME TO DUSTY GULCH',9.6,.9,null,'#f0e0b0',60,450,5.15,az+.07,0);L('POP. 13 · DRIVE DARKLY',4,.4,'#5a3a22','#f0e0b0',60,450,4.2,az-.07,Math.PI);
  for(const sx of[-4.9,4.9])rod([450+sx,5.85,az],[450+sx,5.75,az],.02,k.IRON);const sk=new THREE.Group();sk.position.set(450,6.35,az-.2);g.add(sk);{const S=k.H(sk);S.B(.35,.4,.3,0,0,0,M(0xe8e0c8));for(const s of[-1,1]){const h=S.C(.06,.02,.7,s*.4,.15,0,M(0xd8d0b0),null,null,8);h.rotation.z=s*1.1}}}
 /* lamps: iron posts on the boardwalk edge and along the street, with a glass lantern */const lamp=(x,z)=>{C(.06,.08,3.4,x,1.7,z,k.IRON,null,null,8);B(.25,.04,.25,x,3.42,z,k.IRON);const gl=new THREE.Mesh(new THREE.BoxGeometry(.22,.32,.22),M(0xfff0c0,{emissive:0xffd890,emissiveIntensity:.9,transparent:true,opacity:.9}));gl.position.set(x,3.62,z);g.add(gl);B(.3,.06,.3,x,3.81,z,k.IRON);C(.02,.06,.12,x,3.88,z,k.IRON,null,null,6);ob(x-.12,x+.12,z-.12,z+.12)};
 /* outside town: standing lamp posts by the street */for(let z=-1430;z>=-1560;z-=26)for(const sd of[-1,1])if(z>-1437||z<-1515)lamp(450+sd*7.8,sd>0&&Math.abs(z+1533)<3?z-4.5:z);/* the east one at -1534 moves off the Boot Hill gate */
 /* in town: lanterns hung from the boardwalk edge beams on iron brackets, every 7.2 m */const hang=(x,z,sd)=>{rod([x,3.2,z],[x+sd*.45,3.2,z],.025,k.IRON);rod([x+sd*.45,3.2,z],[x+sd*.45,3.05,z],.012,k.IRON);const gl=new THREE.Mesh(new THREE.BoxGeometry(.2,.28,.2),M(0xfff0c0,{emissive:0xffd890,emissiveIntensity:.9,transparent:true,opacity:.9}));gl.position.set(x+sd*.45,2.88,z);g.add(gl);B(.26,.05,.26,x+sd*.45,3.04,z,k.IRON);B(.24,.04,.24,x+sd*.45,2.72,z,k.IRON)};
 for(let z=-1440;z>=-1512;z-=7.2){hang(442.85,z,1);hang(457.15,z,-1)}
 /* hitching rails with a water trough: in front of the diner, Bob's and the saloon (west), the bank and the chapel (east) */
 const rail=(x,z)=>{for(const dz of[-1.6,1.6])C(.09,.1,1.15,x,.58,z+dz,k.POST,null,null,8);C(.06,.06,3.4,x,1.08,z,k.POST,'z',null,8);const tx=x+(x<450?.9:-.9);B(.7,.5,2.2,tx,.25,z,k.BOARDD);B(.56,.04,2.06,tx,.46,z,M(0x4a6a7a,{roughness:.1,metalness:.3,transparent:true,opacity:.85}));for(const dz of[-1.1,1.1])B(.74,.06,.06,tx,.5,z+dz,k.IRON);ob(Math.min(x,tx)-.4,Math.max(x,tx)+.4,z-1.7,z+1.7)};
 rail(444,-1453);rail(444,-1478);rail(444,-1506);rail(456,-1455);rail(456,-1478);
 /* the town pump and trough in the alley between the diner and Bob's */{const x=432,z=-1462;B(1.6,.12,1.6,x,.06,z,M(0x8a8070,{roughness:1}));B(.3,1.3,.3,x,.75,z,k.IRON);const hd=C(.12,.12,.4,x,1.5,z,k.IRON,null,null,10);rod([x,1.55,z],[x+.5,1.8,z],.03,k.IRON);rod([x,1.3,z],[x-.4,1.15,z],.05,k.IRON);B(1.8,.55,.7,x-1.3,.28,z,k.BOARDD);B(1.66,.04,.56,x-1.3,.5,z,M(0x4a6a7a,{roughness:.1,metalness:.3,transparent:true,opacity:.85}));ob(x-2.3,x+.3,z-.5,z+.5)}
 /* a broken wagon between Bob's and the saloon: a bed on its side wheels, one wheel off and leaning on it, a shaft on the ground */
 {const w=new THREE.Group();w.position.set(426,0,-1486);w.rotation.y=.25;g.add(w);const W=k.H(w);W.B(3.4,.12,1.5,0,.95,0,k.BOARD);for(const s of[-1,1])W.B(3.4,.4,.08,0,1.2,s*.72,k.BOARD);W.B(.08,.4,1.5,1.7,1.2,0,k.BOARD);W.B(.15,.15,1.7,-1.2,.85,0,k.TRIM);W.B(.15,.15,1.7,1.2,.85,0,k.TRIM);
  const wheel=(x,y,z,rx,ry,rz)=>{const wg=new THREE.Group();wg.position.set(x,y,z);wg.rotation.set(rx,ry,rz||0,'YXZ');w.add(wg);const rim=new THREE.Mesh(new THREE.TorusGeometry(.55,.05,6,20),k.TRIM);wg.add(rim);for(let i=0;i<8;i++){const sp=new THREE.Mesh(new THREE.BoxGeometry(.04,1.08,.04),k.POST);sp.rotation.z=i*Math.PI/8;wg.add(sp)}const hb=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,.14,10),k.IRON);hb.rotation.x=Math.PI/2;wg.add(hb)};
  wheel(-1.2,.55,.85,0,0);wheel(-1.2,.55,-.85,0,0);wheel(1.2,.55,-.85,0,0);/* the front-right wheel is off, leaning against the bed's side; a stack of stones holds that corner up */wheel(1.1,.52,1.18,.42,0,0);for(let i=0;i<3;i++){const st=W.B(.45-i*.05,.28,.42,1.2,.14+i*.28,.62,M(0x8a8070,{roughness:1}));st.rotation.y=i*.4}
  rod([-1.7,.9,.3],[-3.6,.05,.5],.05,k.POST);rod([-1.7,.9,-.3],[-3.6,.05,-.6],.05,k.POST);ob(424,428.2,-1487.5,-1484.5)}
 g.traverse(o=>{if(o.isMesh)o.userData.noSeam=true});return{obs,plates}}

/* ---- batch 2/3: the western fronts. guFront(g, o) puts a false front over a shell's street wall:
   o = {x: the wall's face (shell fx), dir: +1 (door faces +x) / -1, z0, z1, H: the shell's height, top: the false front's height,
        shape: 'arch' | 'step' | 'flat', board: material, trim: material, name, sub, signBg, signFg, wins: [[za, zb], ...] (the shell's
        front windows, y 1.2 .. 2.6), door: [za, zb] (y 0 .. 2.5)}
   The front stands .42 out from the wall (in front of the shell's roof edge and window frames), with the openings cut through it,
   linings back to the wall, casings, corner boards and a cornice. Returns {face}: the x of the new front face. ---- */
function guFront(g,o){const k=guKit(),{B,C,rod,L}=k.H(g),M=k.M;const dir=o.dir,cz=(o.z0+o.z1)/2,hw=(o.z1-o.z0)/2+.15,T=o.top,H=o.H,fx=o.x+dir*.42,d=.1;
 const sh=new THREE.Shape();sh.moveTo(-hw,0);sh.lineTo(hw,0);
 if(o.shape=='arch'){sh.lineTo(hw,T-1.2);sh.lineTo(hw*.7,T-1.2);for(let i=0;i<=16;i++){const a=i/16*Math.PI;sh.lineTo(Math.cos(a)*hw*.7,T-1.2+Math.sin(a)*1.2)}sh.lineTo(-hw,T-1.2)}
 else if(o.shape=='step'){const s=[[1,T-1.2],[.72,T-1.2],[.72,T-.6],[.42,T-.6],[.42,T]];for(const[a,b]of s)sh.lineTo(hw*a,b);for(const[a,b]of s.slice().reverse())sh.lineTo(-hw*a,b)}
 else{sh.lineTo(hw,T);sh.lineTo(-hw,T)}sh.lineTo(-hw,0);
 const hole=(a,b,y0,y1)=>{const p=new THREE.Path();p.moveTo(a,y0);p.lineTo(a,y1);p.lineTo(b,y1);p.lineTo(b,y0);p.lineTo(a,y0);sh.holes.push(p)};const lz=z=>(z-cz)*dir;
 const ops=[];if(o.door){const a=lz(o.door[0]),b=lz(o.door[1]);ops.push([Math.min(a,b),Math.max(a,b),0,2.5])}for(const w of o.wins||[]){const a=lz(w[0]),b=lz(w[1]);ops.push([Math.min(a,b),Math.max(a,b),1.2,2.6])}
 for(const p of ops)hole(p[0],p[1],p[2]+(p[2]>0?0:-.01),p[3]);
 const geo=new THREE.ExtrudeGeometry(sh,{depth:d,bevelEnabled:false,curveSegments:16});{const uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*.4,uv.getY(i)*.4)}
 const fm=new THREE.Mesh(geo,[o.board,o.trim]);fm.rotation.y=dir>0?-Math.PI/2:Math.PI/2;fm.position.set(fx+dir*0,0,cz);g.add(fm);/* (the front cap faces the street) */
 const X=fx+dir*.02,Xt=fx+dir*.07;
 /* linings through the openings back to the wall, casings round them, a sill under each window */
 for(const p of ops){const za=cz+p[0]*dir,zb=cz+p[1]*dir,z0=Math.min(za,zb),z1=Math.max(za,zb),y0=p[2],y1=p[3],dx=Math.abs(fx-o.x)+d;const xm=(o.x+fx)/2-dir*d/2;
  B(dx,.05,z1-z0,xm,y1-.025,(z0+z1)/2,o.trim);for(const z of[z0,z1])B(dx,y1-y0,.05,xm,(y0+y1)/2,z,o.trim);if(y0>0)B(dx,.05,z1-z0,xm,y0+.025,(z0+z1)/2,o.trim);
  B(.06,.14,z1-z0+.32,Xt,y1+.07,(z0+z1)/2,o.trim);for(const z of[z0-.09,z1+.09])B(.06,y1-y0+.14,.12,Xt,(y0+y1)/2+.07,z,o.trim);if(y0>0){B(.12,.06,z1-z0+.36,fx+dir*.06,y0-.03,(z0+z1)/2,o.trim);for(const z of[z0,z1])B(.06,.1,.1,fx+dir*.04,y0-.11,z,o.trim)}}
 /* corner boards, a base board, a cornice along the top (and round the arch: a capping strip) */for(const s of[-1,1])B(.06,T-1.15,.2,Xt,(T-1.15)/2,cz+s*(hw-.1),o.trim);B(.06,.25,hw*2,Xt,.13,cz,o.trim);
 if(o.shape=='flat'){B(.3,.18,hw*2+.3,fx+dir*.12,T-.05,cz,o.trim);B(.2,.1,hw*2+.2,fx+dir*.08,T-.22,cz,o.trim);for(let i=0;i<Math.floor(hw*2/.6);i++)B(.12,.16,.12,fx+dir*.08,T-.36,cz-hw+.3+i*.6,o.trim)}
 else if(o.shape=='step'){const s=[[1,T-1.2],[.72,T-.6],[.42,T]];for(const[a,y]of s)for(const sg of(a==.42?[0]:[-1,1])){const zc=a==.42?cz:cz+sg*hw*(a+(a==1?.72:.42))/2;const w=a==.42?hw*.84:hw*(a-(a==1?.72:.42));B(.24,.14,w+.12,fx+dir*.1,y+.05,zc,o.trim)}}
 else{for(let i=0;i<16;i++){const a0=i/16*Math.PI,a1=(i+1)/16*Math.PI,p0=[Math.cos(a0)*hw*.7,T-1.2+Math.sin(a0)*1.2],p1=[Math.cos(a1)*hw*.7,T-1.2+Math.sin(a1)*1.2];const sg=B(.22,.12,Math.hypot(p1[0]-p0[0],p1[1]-p0[1])+.02,fx+dir*.09,(p0[1]+p1[1])/2+.04,cz+(p0[0]+p1[0])/2,o.trim);sg.rotation.x=-Math.atan2(p1[1]-p0[1],p1[0]-p0[0])}for(const s of[-1,1])B(.22,.12,hw*.3+.1,fx+dir*.09,T-1.15,cz+s*hw*.85,o.trim)}
 /* the painted name board above the awning, and its subtitle */const sy=H+.95;B(.06,1.35,Math.min(hw*1.6,9.4),Xt,sy,cz,o.trim);L(o.name,Math.min(hw*1.6,9.4)-.2,1.15,o.signBg,o.signFg,60,fx+dir*.105,sy,cz,dir>0?Math.PI/2:-Math.PI/2);
 if(o.sub)L(o.sub,Math.min(hw*1.2,6),.42,null,o.signFg,60,fx+dir*.08,o.shape=='arch'?T-.75:T-1.0,cz,dir>0?Math.PI/2:-Math.PI/2);
 g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{face:fx}}

/* the three west-side fronts. Each returns {face}. Pass `noPorch: 1` to their shells and drop the shells' name sign (lab + backing board). */
function guWest(g){const k=guKit(),{B,C,rod,L}=k.H(g),M=k.M;
 /* Rushy's Diner: cream boards, red trim, an arched top; a neon EAT blade sign */
 guFront(g,{x:440,dir:1,z0:-1458,z1:-1440,H:4,top:7.2,shape:'arch',board:k.BOARDW,trim:M(0xb02020,{roughness:.6}),name:"RUSHY'S DINER",sub:'PIE · COFFEE · MORE PIE',signBg:'#b02020',signFg:'#fff0d0',wins:[[-1449-5.4-.8,-1449-5.4+.8],[-1449+5.4-.8,-1449+5.4+.8]],door:[-1450.3,-1447.7]});
 {const bz=-1455.6,bx=440.6;B(.9,.1,.1,bx+.45,4.6,bz,k.IRON);B(.9,.1,.1,bx+.45,3.6,bz,k.IRON);const bd=B(.12,1.3,.9,bx+.9,4.1,bz,M(0x1a1a1a));L('EAT',.75,1.1,'#1a1a1a','#ff3060',60,bx+.97,4.1,bz,Math.PI/2);L('EAT',.75,1.1,'#1a1a1a','#ff3060',60,bx+.83,4.1,bz,-Math.PI/2);const gl=new THREE.Mesh(new THREE.BoxGeometry(.02,1.0,.6),M(0xff3060,{emissive:0xff2050,emissiveIntensity:.8,transparent:true,opacity:.35}));gl.position.set(bx+.99,4.1,bz);g.add(gl)}
 /* Bob's Bargains: blue-grey boards, cream trim, a stepped top; a hanging shingle and crates out front */
 guFront(g,{x:440,dir:1,z0:-1482,z1:-1466,H:4,top:7.0,shape:'step',board:k.BOARDB,trim:M(0xe8dcc0,{roughness:.7}),name:"BOB'S BARGAINS",sub:'GENERAL STORE · EST. WHO KNOWS',signBg:'#2a3a5a',signFg:'#ffe0a0',wins:[[-1474-4.8-.8,-1474-4.8+.8],[-1474+4.8-.8,-1474+4.8+.8]],door:[-1475.3,-1472.7]});
 {const bz=-1479,bx=440.5;rod([bx,3.3,bz],[bx+1.0,3.3,bz],.03,k.IRON);for(const dz of[-.3,.3])rod([bx+.95,3.3,bz+dz],[bx+.95,3.05,bz+dz],.01,k.IRON);B(.06,.6,.9,bx+.95,2.75,bz,M(0xe8dcc0));L('BOB',.8,.45,'#e8dcc0','#2a3a5a',60,bx+.99,2.78,bz,Math.PI/2);L('BOB',.8,.45,'#e8dcc0','#2a3a5a',60,bx+.91,2.78,bz,-Math.PI/2);
  for(const[dz,h]of[[-1.2,0],[-1.2,.5],[1.5,0]])B(.6,.5,.6,441.2,.71+h,-1474+dz*2.4,k.BOARD)}
 /* The Rusty Door saloon: dark weathered boards, a tall flat front with a bracketed cornice and two shuttered upper windows (painted, the building is single-storey) */
 const sTrim=M(0xc8a060,{roughness:.6});guFront(g,{x:440,dir:1,z0:-1512,z1:-1490,H:4.5,top:8.6,shape:'flat',board:k.BOARDD,trim:sTrim,name:'THE RUSTY DOOR',sub:'· SALOON ·',signBg:'#3a1a0a',signFg:'#ffd080',wins:[[-1501-6.6-.8,-1501-6.6+.8],[-1501+6.6-.8,-1501+6.6+.8]],door:[-1502.3,-1499.7]});
 for(const dz of[-4.2,4.2]){const z=-1501+dz,x=440.55;B(.04,1.4,1.0,x,7.05,z,M(0x1a2228,{metalness:.3,roughness:.2}));for(const s of[-1,1])B(.06,1.5,.5,x+.02,7.05,z+s*.78,M(0x6a2a1a));B(.08,.08,1.1,x+.02,7.05,z,sTrim);B(.08,1.5,.08,x+.02,7.05,z,sTrim);B(.14,.08,1.2,x+.05,6.3,z,sTrim)}
 g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true})}

/* ---- batch 3: the east side. The bank's stone front, the chapel's white gabled front with the belfry built on top
   (the game's bell hangs inside it), the undertaker's (a small closed shop between the chapel and the cemetery), and
   the cemetery's street side: a white picket fence with an arched gate. ---- */
function guEast(g){const k=guKit(),{B,C,rod,L}=k.H(g),M=k.M;const obs=[];
 /* the bank: dressed stone blocks, a heavy flat cornice, two pilasters by the door, a gilded name */
 if(!k.STONEB){const m=M(0xffffff,{roughness:.85});m.map=k.tex(256,256,(c,w,h)=>{c.fillStyle='#8a8a86';c.fillRect(0,0,w,h);let sd=88;const r=()=>((sd=Math.imul(sd^sd>>>15,sd|1)+0x6d2b79f5|0)>>>0)/4294967296;for(let y=0;y<8;y++)for(let x=-1;x<5;x++){const v=150+r()*35|0;c.fillStyle='rgb('+v+','+(v-3)+','+(v-10)+')';c.fillRect(x*64+(y%2)*32+2,y*32+2,60,28)}});m.userData.s=.5;k.STONEB=m}
 const bT=M(0x6a6a70,{roughness:.6});guFront(g,{x:460,dir:-1,z0:-1462,z1:-1440,H:4.5,top:7.6,shape:'flat',board:k.STONEB,trim:bT,name:'FIRST DARK BANK',sub:'EST. 1886 · YOUR GOLD IS SAFE (MOSTLY)',signBg:'#1a1a3a',signFg:'#ffd040',wins:[[-1451-6.6-.8,-1451-6.6+.8],[-1451+6.6-.8,-1451+6.6+.8]],door:[-1452.3,-1449.7]});
 for(const dz of[-1.9,1.9]){const z=-1451+dz;B(.3,3.2,.5,459.4,1.6,z,bT);B(.4,.2,.6,459.38,3.3,z,bT);B(.4,.2,.6,459.38,.1,z,bT)}B(.36,.3,4.4,459.4,3.55,-1451,bT);
 /* the chapel: white boards, a gabled front, a round window, the belfry on top with louvres and the spire */
 const W=k.BOARDW,PT=M(0x5a2a6a,{roughness:.6}),cz=-1485,fx=462-.42;guFront(g,{x:462,dir:-1,z0:-1500,z1:-1470,H:5,top:6.8,shape:'flat',board:W,trim:PT,name:'CHAPEL OF THE CLOSED DOOR',sub:null,signBg:'#5a2a6a',signFg:'#fff0d0',wins:[[cz-9-.8,cz-9+.8],[cz+9-.8,cz+9+.8]],door:[cz-1.3,cz+1.3]});
 {/* the gable over the middle: a triangle of boards with trim, a round window */const sh=new THREE.Shape();sh.moveTo(-6,0);sh.lineTo(6,0);sh.lineTo(0,3);sh.lineTo(-6,0);const ge=new THREE.ExtrudeGeometry(sh,{depth:.1,bevelEnabled:false});{const uv=ge.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*.4,uv.getY(i)*.4)}const gm=new THREE.Mesh(ge,W);gm.rotation.y=Math.PI/2;gm.position.set(fx,6.8,cz);g.add(gm);
  for(const s of[-1,1]){const tr=B(.22,.14,6.75,fx-.1,8.3,cz+s*3,PT);tr.rotation.x=s*Math.atan2(3,6)}const rw=new THREE.Mesh(new THREE.CircleGeometry(.7,24),M(0xffffff,{map:null,color:0xc04060,emissive:0x502040,emissiveIntensity:.6}));rw.rotation.y=-Math.PI/2;rw.position.set(fx-.11,7.8,cz);g.add(rw);const rr=new THREE.Mesh(new THREE.TorusGeometry(.72,.06,6,24),PT);rr.rotation.y=Math.PI/2;rr.position.set(fx-.12,7.8,cz);g.add(rr);for(const a of[0,Math.PI/2])B(.04,1.4,.05,fx-.13,7.8,cz,PT).rotation.x=a}
 /* the belfry: four corner posts on the roof ridge behind the gable, louvred sides, a cap and a spire; the game's bell (y 11.5) hangs in it */
 {const bx=462,by=9.8,BW=2.6;for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])B(.22,3.2,.22,bx+a*BW/2,by+1.6-.4,cz+b*BW/2,W);B(BW+.2,.8,BW+.2,bx,by-.2,cz,W);
  for(const s of[-1,1]){for(let i=0;i<5;i++){const lv=B(.04,.14,BW-.2,bx+s*(BW/2),by+.6+i*.38,cz,W);lv.rotation.z=s*.6;const lw=B(BW-.2,.14,.04,bx,by+.6+i*.38,cz+s*(BW/2),W);lw.rotation.x=-s*.6}}
  B(BW+.4,.2,BW+.4,bx,by+2.9,cz,PT);const sp=new THREE.Mesh(new THREE.ConeGeometry(1.95,3.2,4),PT);sp.rotation.y=Math.PI/4;sp.position.set(bx,by+4.6,cz);g.add(sp);C(.05,.05,.8,bx,by+6.5,cz,M(0xd8b020,{metalness:.7}),null,null,6);B(.05,.05,.4,bx,by+6.6,cz,M(0xd8b020,{metalness:.7}));
  /* a bell rope down the front, to the ring-the-bell spot */C(.015,.015,6.5,fx-.18,5.6,cz-2.2,M(0xc8b08a),null,null,4)}
 /* the undertaker's: a small closed shop (x 460..466, z -1505.6..-1500.6) on the boardwalk, coffins leaning by the door */
 {const ux0=460.4,ux1=466,uz0=-1505.6,uz1=-1500.6,uz=(uz0+uz1)/2;B(ux1-ux0,3.6,uz1-uz0,(ux0+ux1)/2,1.8,uz,k.BOARDD);B(ux1-ux0+.3,.2,uz1-uz0+.3,(ux0+ux1)/2,3.7,uz,k.TRIM);obs.push({x0:ux0,x1:ux1,z0:uz0,z1:uz1});
  guFront(g,{x:ux0,dir:-1,z0:uz0,z1:uz1,H:3.4,top:5.6,shape:'step',board:k.BOARDD,trim:M(0x1a1a1a),name:'UNDERTAKER',sub:'COFFINS BUILT TO ORDER',signBg:'#1a1a1a',signFg:'#e0e0d8',wins:[],door:[uz-.6,uz+.6]});
  B(.06,2.4,1.1,ux0-.47,1.2,uz,M(0x2a1a10));/* the door, shut */B(.08,.08,.08,ux0-.51,1.2,uz+.4,M(0xc0a040,{metalness:.8}));L('CLOSED · BACK SOON (WE ALWAYS ARE)',1.0,.3,'#e8e0c8','#1a1a1a',60,ux0-.51,1.7,uz,-Math.PI/2);
  const coffin=(z,ry)=>{const cg=new THREE.Group();cg.position.set(ux0-.75,1.05,z);cg.rotation.set(0,0,-.12);g.add(cg);const sh=new THREE.Shape();sh.moveTo(-.22,-1);sh.lineTo(.22,-1);sh.lineTo(.32,.45);sh.lineTo(.18,1);sh.lineTo(-.18,1);sh.lineTo(-.32,.45);sh.lineTo(-.22,-1);const ge=new THREE.ExtrudeGeometry(sh,{depth:.3,bevelEnabled:false});const cm=new THREE.Mesh(ge,k.BOARDD);cm.rotation.y=Math.PI/2;cm.position.x=.15;cg.add(cm);const cr=new THREE.Mesh(new THREE.BoxGeometry(.02,.5,.08),M(0xc0a040,{metalness:.7}));cr.position.set(-.16,.3,0);cg.add(cr);const cb=cr.clone();cb.scale.set(1,.3,3);cb.position.y=.4;cg.add(cb)};coffin(uz-1.6);coffin(uz+1.6)}
 /* the cemetery's street side (x 460, z -1560..-1506): a white picket fence with an arched gate at z -1533 ("BOOT HILL") */
 {const PK=M(0xe8e4d8,{roughness:.8}),gz0=-1534.6,gz1=-1531.4;for(let z=-1559.8;z<=-1506.2;z+=.32){if(z>gz0&&z<gz1)continue;const p=B(.04,1.0,.09,459.9,.5,z,PK);const t=new THREE.Mesh(new THREE.ConeGeometry(.065,.14,4),PK);t.position.set(459.9,1.07,z);t.rotation.y=Math.PI/4;g.add(t)}for(const y of[.3,.8])for(const[a,b]of[[-1560,gz0],[gz1,-1506]])B(.06,.08,b-a,459.95,y,(a+b)/2,PK);for(const[a,b]of[[-1560,gz0],[gz1,-1506]])obs.push({x0:459.8,x1:460.1,z0:a,z1:b});
  for(const z of[gz0-.1,gz1+.1]){B(.16,2.8,.16,459.9,1.4,z,k.POST)}const ar=new THREE.Mesh(new THREE.TorusGeometry(1.7,.06,6,20,Math.PI),k.IRON);ar.rotation.y=Math.PI/2;ar.position.set(459.9,2.3,-1533);g.add(ar);B(.06,.5,2.4,459.9,3.05,-1533,k.BOARDD);L('BOOT HILL',2.2,.4,null,'#e8e0c8',60,459.85,3.05,-1533,-Math.PI/2);for(const dz of[-1,1])C(.012,.012,.42,459.9,3.49,-1533+dz,k.IRON,null,null,4);/* two short chains hang the board from the arch */
  /* the gate leaves, standing open */for(const s of[-1,1]){const lf=new THREE.Group();lf.position.set(459.9,0,s<0?gz0:gz1);lf.rotation.y=s*1.2;g.add(lf);for(let i=0;i<5;i++){const p=new THREE.Mesh(new THREE.BoxGeometry(.04,1.0,.09),PK);p.position.set(0,.5,-s*(.15+i*.3));lf.add(p)}for(const y of[.3,.8]){const r=new THREE.Mesh(new THREE.BoxGeometry(.05,.08,1.5),PK);r.position.set(0,y,-s*.75);lf.add(r)}}}
 g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{obs}}
