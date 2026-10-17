/* The airfield (airfield-zone51.md). Needs fort-kit.js (fbKit). Desert-local coordinates, y up from the sand.
   Everything is noSeam. Builders add to a group g and return what the game needs.

   afField(g)  batch 1: the runway (unchanged size), its markings, edge/threshold/end lights, the approach-slope
               lights, the taxiway and the apron with stands and tie-downs. Returns {obs, lights}: lights is the
               glowing material of the runway lights (dim it by day, brighten it at night if you like).
*/
function afKit(){if(afKit.k)return afKit.k;const f=fbKit(),k=Object.create(f);k.M=f.M;afKit.k=k;return k}

/* a ground plane at height y, its own canvas texture, a constant depth nudge (units only) */
function afPlane(g,x0,x1,z0,z1,y,tex,units){const m=new THREE.MeshStandardMaterial({map:tex,roughness:1,polygonOffset:true,polygonOffsetFactor:0,polygonOffsetUnits:units||-1});const p=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0,z1-z0),m);p.rotation.x=-Math.PI/2;p.position.set((x0+x1)/2,y,(z0+z1)/2);p.userData.noSeam=true;g.add(p);return p}
function afCanvas(w,h,fn){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.anisotropy=8;return t}
/* tarmac grain: noise, patches, cracks; then the caller paints markings on top */
function afTarmac(x,w,h,base,seed){let sd=seed||7;const r=()=>((sd=Math.imul(sd^sd>>>15,sd|1)+0x6d2b79f5|0)>>>0)/4294967296;x.fillStyle=base;x.fillRect(0,0,w,h);for(let i=0;i<w*h/40;i++){const v=r();x.fillStyle=v<.5?'rgba(0,0,0,.06)':'rgba(255,255,255,.035)';x.fillRect(r()*w,r()*h,1+r()*.8,1+r()*.8)}for(let i=0;i<w*h/30000;i++){x.fillStyle='rgba(0,0,0,'+(.05+r()*.07)+')';x.beginPath();x.ellipse(r()*w,r()*h,20+r()*80,10+r()*40,r()*3,0,7);x.fill()}x.strokeStyle='rgba(20,20,20,.35)';x.lineWidth=1.2;for(let i=0;i<w*h/60000;i++){let px=r()*w,py=r()*h;x.beginPath();x.moveTo(px,py);for(let j=0;j<6;j++){px+=(r()-.5)*40;py+=(r()-.5)*40;x.lineTo(px,py)}x.stroke()}return r}

function afField(g){const k=afKit(),{B,C,rod,L}=k.H(g),M=k.M,obs=[];const RX0=270,RX1=540,RZ=-1230,RW=20;
 /* the runway: one texture, 15 px per metre along and 16 across, markings painted in */
 {const PX=15,PZ=16,w=(RX1-RX0)*PX,h=RW*PZ;const t=afCanvas(4096,h,(x,cw,ch)=>{const sx=cw/w;x.save();x.scale(sx,1);const r=afTarmac(x,w,h,'#4b4b4d',13);
   const WH='#ecebe4',X=m=>m*PX,Z=m=>m*PZ;x.fillStyle=WH;
   /* edge lines */x.fillRect(0,Z(.6),w,Z(.45));x.fillRect(0,Z(RW-1.05),w,Z(.45));
   /* threshold bars (piano keys) at both ends, 8 a side */for(const e of[0,1]){const x0=e?w-X(9):X(3);for(let i=0;i<8;i++){const zz=Z(1.6+i*2.1);if(i==3||i==4)continue;x.fillRect(x0,zz,X(6),Z(1.4))}}
   /* touchdown zone bars and aiming points */for(const e of[0,1]){const ax=e?w-X(60):X(45);x.fillRect(ax,Z(3),X(15),Z(2.2));x.fillRect(ax,Z(RW-5.2),X(15),Z(2.2));const tx=e?w-X(35):X(30);for(const zz of[3.2,5.2,RW-7.2,RW-5.2])x.fillRect(tx,Z(zz),X(6),Z(1))}
   /* the dashed centre line, clear of the numbers */for(let m=34;m<RX1-RX0-34;m+=12)x.fillRect(X(m),Z(RW/2-.25),X(7),Z(.5));
   /* the numbers, painted to be read by a plane landing on them: 13 at the west end, 31 at the east */
   const num=(t,cx,rot)=>{x.save();x.translate(cx,Z(RW/2));x.rotate(rot);x.scale(PZ/PX*1.0,1);x.font='bold '+Math.round(Z(8))+'px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText(t,0,0);x.restore()};num('13',X(20),Math.PI/2);num('31',w-X(20),-Math.PI/2);
   /* tyre marks in the touchdown zones */x.globalAlpha=.25;x.fillStyle='#1a1a1a';for(const e of[0,1])for(let i=0;i<40;i++){const bx=(e?w-X(80):X(40))+r()*X(40),bz=Z(RW/2+(r()-.5)*4);x.fillRect(bx,bz,X(4+r()*8),Z(.35))}x.globalAlpha=1;x.restore()});
  afPlane(g,RX0,RX1,RZ-RW/2,RZ+RW/2,.05,t,-2);
  /* shoulders: a strip of rougher, lighter tarmac each side */const st=afCanvas(512,64,(x,w,h)=>{afTarmac(x,w,h,'#6a6862',5)});st.wrapS=THREE.RepeatWrapping;st.repeat.set(12,1);/* the apron-side shoulder stops where the taxiway joins (x 318..326), so the two never overlap */for(const s of[-1,1])for(const[a,b]of s<0?[[RX0,318],[326,RX1]]:[[RX0,RX1]]){const sp=afPlane(g,a,b,s<0?RZ-RW/2-1.5:RZ+RW/2,s<0?RZ-RW/2:RZ+RW/2+1.5,.045,st.clone(),-1);sp.material.map.needsUpdate=true;sp.material.map.repeat.set((b-a)/22.5,1)}
  /* blast pads past each end: chevrons */for(const e of[0,1]){const ct=afCanvas(256,256,(x,w,h)=>{afTarmac(x,w,h,'#5a5852',9);x.fillStyle='#e0c040';for(let i=0;i<3;i++){x.beginPath();const y=40+i*70;x.moveTo(0,y);x.lineTo(w/2,y+40);x.lineTo(w,y);x.lineTo(w,y+18);x.lineTo(w/2,y+58);x.lineTo(0,y+18);x.fill()}});const pl=afPlane(g,e?RX1:RX0-12,e?RX1+12:RX0,RZ-RW/2-1.5,RZ+RW/2+1.5,.045,ct,-1);/* as wide as the runway and its shoulders; the shoulders stop at the runway ends, so nothing overlaps */pl.rotation.z=e?-Math.PI/2:Math.PI/2}}
 /* the lights: edge lights on stalks every 10 m (a gap for the road at x 294..306), green across the landing end,
    red across the far end, four approach-slope lights beside the landing end */
 const LW=M(0xfff8e0,{emissive:0xfff0c8,emissiveIntensity:1}),LG=M(0x40ff70,{emissive:0x20ff60,emissiveIntensity:1}),LR=M(0xff3020,{emissive:0xff2010,emissiveIntensity:1}),PO=M(0xd8c020,{roughness:.6}),BS=M(0x3a3a3c,{roughness:.6});
 const lamp=(x,z,m)=>{C(.05,.05,.04,x,.07,z,BS,null,null,8);C(.02,.02,.32,x,.25,z,PO,null,null,6);C(.07,.06,.1,x,.45,z,m,null,null,10);C(.075,.075,.02,x,.51,z,BS,null,null,10)};
 for(let x=RX0;x<=RX1;x+=10){if(x>=294&&x<=306||x>=317&&x<=327)continue;/* gaps for the road crossing and the taxiway */for(const s of[-1,1])lamp(x,RZ+s*(RW/2+.6),LW)}
 for(let i=0;i<9;i++){const z=RZ-RW/2+1+i*2.25;lamp(RX0-.8,z,LG);lamp(RX1+.8,z,LR)}
 {const pz=RZ+RW/2+3.5;for(let i=0;i<4;i++){const x=280+i*2.6;B(1.0,.12,.6,x,.06,pz,BS);const box=B(.8,.4,.45,x,.32,pz,M(0xe8e8e0,{roughness:.6}));C(.1,.1,.05,x-.2,.34,pz-.24,i<2?LW:LR,'z',null,10);C(.1,.1,.05,x+.2,.34,pz-.24,i<2?LW:LR,'z',null,10)}}
 /* the apron x 275..365, z -1274..-1244: stands with lead-in lines, tie-down rings, the plane's stand at (345,-1257) */
 {const AX0=275,AX1=365,AZ0=-1274,AZ1=-1244,PX=16,w=(AX1-AX0)*PX,h=(AZ1-AZ0)*PX;const t=afCanvas(w,h,(x)=>{afTarmac(x,w,h,'#626260',21);const X=m=>(m-AX0)*PX,Z=m=>(m-AZ0)*PX;
   /* concrete slab joints every 5 m */x.strokeStyle='rgba(0,0,0,.22)';x.lineWidth=1.5;for(let m=AX0+5;m<AX1;m+=5){x.beginPath();x.moveTo(X(m),0);x.lineTo(X(m),h);x.stroke()}for(let m=AZ0+5;m<AZ1;m+=5){x.beginPath();x.moveTo(0,Z(m));x.lineTo(w,Z(m));x.stroke()}
   x.strokeStyle='#e8c030';x.lineWidth=PX*.18;x.fillStyle='#e8c030';
   /* the taxi line along the apron front, curving into the taxiway at x 322 */x.beginPath();x.moveTo(X(AX0+3),Z(-1248));x.lineTo(X(316),Z(-1248));x.quadraticCurveTo(X(322),Z(-1248),X(322),Z(-1244));x.stroke();x.beginPath();x.moveTo(X(328),Z(-1244));x.quadraticCurveTo(X(322),Z(-1248),X(316),Z(-1248));x.stroke();x.beginPath();x.moveTo(X(328),Z(-1248));x.lineTo(X(AX1-3),Z(-1248));x.stroke();
   /* stands: lead-in line from the taxi line, a stop bar, a number */const stand=(sx,n,big)=>{x.beginPath();x.moveTo(X(sx),Z(-1248));x.lineTo(X(sx),Z(-1266));x.stroke();x.fillRect(X(sx-2),Z(-1266)-PX*.2,PX*4,PX*.4);x.save();x.font='bold '+PX*2.2+'px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText(n,X(sx+(big?3.5:2.5)),Z(-1262));x.restore()};stand(330,'1');stand(345,'2',1);stand(357,'3');
   /* tie-down rings by each stand */x.fillStyle='#2a2a2a';for(const sx of[330,345,357])for(const d of[-3.2,3.2]){x.beginPath();x.arc(X(sx+d),Z(-1259),PX*.3,0,7);x.fill()}
   /* the hangar's door area: a hatched no-parking box in front of it */x.strokeStyle='#e8c030';x.lineWidth=PX*.12;x.strokeRect(X(286),Z(-1264),PX*28,PX*5);for(let m=286;m<314;m+=1.6){x.beginPath();x.moveTo(X(m),Z(-1264));x.lineTo(X(m+1.2),Z(-1259));x.stroke()}
   /* the road across the apron from the runway to the hangar: dashed white edges */x.strokeStyle='#e8e8e0';x.setLineDash([PX*1.5,PX]);x.lineWidth=PX*.15;for(const ex of[296.5,303.5]){x.beginPath();x.moveTo(X(ex),Z(AZ1));x.lineTo(X(ex),Z(-1259));x.stroke()}x.setLineDash([]);
   /* the apron edge line */x.strokeStyle='#e8c030';x.lineWidth=PX*.1;x.strokeRect(PX*.4,PX*.4,w-PX*.8,h-PX*.8)});
  afPlane(g,AX0,AX1,AZ0,AZ1,.04,t,-1)}
 /* the taxiway x 318..326, z -1244..-1240: yellow centre line, the hold line (two solid, two dashed) and a hold sign */
 {const t=afCanvas(128,64,(x,w,h)=>{afTarmac(x,w,h,'#5a5a5a',31);x.fillStyle='#e8c030';x.fillRect(w/2-2,0,4,h);for(const y of[18,24])x.fillRect(0,y,w,3);for(const y of[32,38])for(let i=0;i<w;i+=14)x.fillRect(i,y,8,3)});afPlane(g,318,326,-1244,-1240,.048,t,-1);/* above the shoulder strip (.045) it crosses */
  /* the sign beside the taxiway, facing the apron (-z) where pilots come from */for(const dx of[-.6,.6])B(.06,.5,.06,316+dx,.25,-1243.5,BS);B(1.7,.6,.12,316,.7,-1243.5,M(0x1a1a1a));L('13 · 31',1.5,.46,'#c01818','#ffffff',80,316,.7,-1243.565,Math.PI);L('13 · 31',1.5,.46,'#c01818','#ffffff',80,316,.7,-1243.435,0)}
 g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{obs,lights:[LW,LG,LR]}}

/* ---- batch 2: the main hangar, the workshop lean-to, the AVGAS tank, two T-hangars and the crop duster ---- */

/* corrugated sheet: ridges that run along the texture's u (repeat it to taste) */
function afCorr(k,col,rep){const t=afCanvas(64,64,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);for(let i=0;i<=4;i++){g.addColorStop(i/4,i%2?'rgba(0,0,0,.28)':'rgba(255,255,255,.18)')}x.fillStyle=col;x.fillRect(0,0,w,h);x.fillStyle=g;x.fillRect(0,0,w,h)});t.wrapS=t.wrapT=THREE.RepeatWrapping;if(rep)t.repeat.set(rep[0],rep[1]);return new THREE.MeshStandardMaterial({map:t,roughness:.55,metalness:.35,side:THREE.DoubleSide})}
/* an arched-roof profile in x-y: straight walls to hw, then an arc rising `rise` over the middle */
function afArch(W,hw,rise,n){const pts=[],R=(W*W/4+rise*rise)/(2*rise),cy=hw+rise-R,a0=Math.asin((W/2)/R);for(let i=0;i<=n;i++){const a=-a0+2*a0*i/n;pts.push([R*Math.sin(a),cy+R*Math.cos(a)])}return pts}

function afHangar(g){const k=afKit(),{B,C,rod,L}=k.H(g),M=k.M,obs=[],hx=300,hz=-1276,W=30,D=24,HW=5,RISE=4,z0=hz-D/2,z1=hz+D/2;
 const SK=afCorr(k,'#b8bcbe',[1,8]),SKF=afCorr(k,'#c8ccce',[8,1]),STL=M(0x5a5e64,{metalness:.5,roughness:.4}),RED=M(0xb02a20,{roughness:.5}),DK=M(0x26282b,{roughness:.7}),CON=M(0x9a948a,{roughness:.95});
 /* the shell: a thin band following the arch profile, run the length of the hangar */
 {const o=afArch(W,HW,RISE,24),i=afArch(W-.4,HW,RISE-.15,24);const sh=new THREE.Shape();sh.moveTo(-W/2,0);for(const p of o)sh.lineTo(p[0],p[1]);sh.lineTo(W/2,0);sh.lineTo(W/2-.2,0);for(const p of i.slice().reverse())sh.lineTo(p[0],p[1]);sh.lineTo(-W/2+.2,0);sh.lineTo(-W/2,0);
  const ge=new THREE.ExtrudeGeometry(sh,{depth:D,bevelEnabled:false});ge.translate(0,0,-D/2);{const uv=ge.attributes.uv;for(let j=0;j<uv.count;j++)uv.setXY(j,uv.getX(j)*.12,uv.getY(j)*.12)}const m=new THREE.Mesh(ge,SK);m.position.set(hx,0,hz);g.add(m);
  /* ribs: steel arches every 6 m, outside */for(let z=z0;z<=z1+.01;z+=6){const rg=new THREE.Shape();rg.moveTo(-W/2-.12,0);for(const p of afArch(W+.24,HW,RISE+.12,24))rg.lineTo(p[0],p[1]);rg.lineTo(W/2+.12,0);rg.lineTo(W/2,0);for(const p of o.slice().reverse())rg.lineTo(p[0],p[1]);rg.lineTo(-W/2-.12,0);const re=new THREE.ExtrudeGeometry(rg,{depth:.2,bevelEnabled:false});re.translate(0,0,-.1);const rm=new THREE.Mesh(re,STL);rm.position.set(hx,0,Math.min(Math.max(z,z0+.1),z1-.1));g.add(rm)}}
 /* the end walls: the back one solid, the front one round the door opening (x ±12, 6.2 high) */
 const prof=afArch(W-.4,HW,RISE-.15,24);
 {const sh=new THREE.Shape();sh.moveTo(-W/2+.2,0);for(const p of prof)sh.lineTo(p[0],p[1]);sh.lineTo(W/2-.2,0);sh.lineTo(-W/2+.2,0);const ge=new THREE.ShapeGeometry(sh);{const uv=ge.attributes.uv;for(let j=0;j<uv.count;j++)uv.setXY(j,uv.getX(j)*.12,uv.getY(j)*.12)}const m=new THREE.Mesh(ge,SKF);m.position.set(hx,0,z0+.15);g.add(m)}
 {const sh=new THREE.Shape(),DW=12,DH=6.2;sh.moveTo(-W/2+.2,0);sh.lineTo(-DW,0);sh.lineTo(-DW,DH);sh.lineTo(DW,DH);sh.lineTo(DW,0);sh.lineTo(W/2-.2,0);for(const p of prof.slice().reverse())sh.lineTo(p[0],p[1]);sh.lineTo(-W/2+.2,0);const ge=new THREE.ExtrudeGeometry(sh,{depth:.15,bevelEnabled:false});{const uv=ge.attributes.uv;for(let j=0;j<uv.count;j++)uv.setXY(j,uv.getX(j)*.12,uv.getY(j)*.12)}const m=new THREE.Mesh(ge,SKF);m.position.set(hx,0,z1-.3);g.add(m);
  /* the door header beam and the track it hangs from, on outriggers past both sides */B(40,.35,1.0,hx,DH+.205,z1+.4,STL);/* the track beam runs over all three door tracks; the leaves hang right up to it */for(const s of[-1,1]){C(.12,.12,DH+.35,hx+s*19.8,(DH+.35)/2,z1+.1,STL,null,null,10);B(.5,.06,.5,hx+s*19.8,.03,z1+.1,CON);obs.push({x0:hx+s*19.8-.25,x1:hx+s*19.8+.25,z0:z1-.15,z1:z1+.35})}
  /* the sliding doors: three leaves a side, stacked open on their tracks past the walls */for(const s of[-1,1])for(let i=0;i<3;i++){const x=hx+s*(16+i*.35),z=z1+.25+i*.22;const lf=B(4,DH,.12,x,DH/2+.03,z,SKF);B(4.04,.12,.16,x,.1,z,STL);B(4.04,.12,.16,x,DH-.03,z,STL);for(const e of[-1,1])B(.12,DH,.16,x+e*1.96,DH/2+.03,z,STL);B(.08,.6,.06,x-s*1.7,1.2,z+.1,STL)}
  obs.push({x0:hx-18.1,x1:hx-13.9,z0:z1+.15,z1:z1+.8},{x0:hx+13.9,x1:hx+18.1,z0:z1+.15,z1:z1+.8});
  /* the sign on the front over the door */B(14,1.9,.12,hx,DH+1.55,z1-.1,M(0x2a4a8a,{roughness:.6}));L('DOORS BUT DESERT AIRFIELD',13,1.0,null,'#ffffff',90,hx,DH+1.85,z1-.035,0);L('FLIGHTS: WHENEVER',13,.55,null,'#ffd860',70,hx,DH+1.05,z1-.035,0)}
 obs.push({x0:hx-W/2-.1,x1:hx-W/2+.3,z0,z1},{x0:hx+W/2-.3,x1:hx+W/2+.1,z0,z1},{x0:hx-W/2,x1:hx+W/2,z0:z0-.1,z1:z0+.3},{x0:hx-W/2,x1:hx-12,z0:z1-.4,z1:z1},{x0:hx+12,x1:hx+W/2,z0:z1-.4,z1:z1});
 /* inside: a sealed concrete floor, high-bay lamps, a workbench and tool chest, an engine on a stand, tyres, a parts rack, drums, a ladder */
 {const t=afCanvas(512,512,(x,w,h)=>{afTarmac(x,w,h,'#8e8a84',41);x.strokeStyle='rgba(0,0,0,.25)';x.lineWidth=2;for(let i=0;i<=w;i+=w/6){x.beginPath();x.moveTo(i,0);x.lineTo(i,h);x.stroke();x.beginPath();x.moveTo(0,i);x.lineTo(w,i);x.stroke()}x.fillStyle='rgba(30,25,20,.25)';for(let i=0;i<6;i++){x.beginPath();x.ellipse(100+Math.random()*300,100+Math.random()*300,30+Math.random()*40,15+Math.random()*25,Math.random()*3,0,7);x.fill()}});afPlane(g,hx-W/2+.2,hx+W/2-.2,z0+.2,z1-.3,.06,t,-3)}
 for(const x of[hx-7,hx+7])for(const z of[hz-6,hz+4]){C(.01,.01,1.4,x,8.0,z,DK,null,null,4);const sh=new THREE.Mesh(new THREE.ConeGeometry(.45,.35,16,1,true),M(0x3a3e44,{side:THREE.DoubleSide,metalness:.4}));sh.position.set(x,7.1,z);g.add(sh);const bl=new THREE.Mesh(new THREE.SphereGeometry(.14,10,6),M(0xfff4d0,{emissive:0xffe8b0}));bl.position.set(x,6.95,z);g.add(bl)}
 {const x=hx-11,z=z0+1.2;B(4,.08,.9,x,.95,z,M(0x6a4a2a,{roughness:.8}));for(const e of[-1.9,1.9])B(.08,.9,.8,x+e,.47,z,STL);B(3.9,.04,.8,x,.3,z,STL);B(4,1.2,.05,x,1.6,z0+.78,M(0x8a8a86));for(let i=0;i<9;i++)B(.04,.25,.03,x-1.6+i*.4,1.7,z0+.81,DK);obs.push({x0:x-2.05,x1:x+2.05,z0:z-.5,z1:z+.5});
  B(.4,.25,.25,x-1,1.1,z,M(0x2a6aa0));C(.04,.04,.6,x+.6,1.0,z,STL,'x',null,8);B(1.0,1.1,.6,x+3.2,.55,z,RED);for(let i=0;i<5;i++)B(.96,.02,.02,x+3.2,.2+i*.2,z+.31,STL);B(1.0,.04,.6,x+3.2,1.12,z,M(0x2a2a2a));obs.push({x0:x+2.7,x1:x+3.7,z0:z-.3,z1:z+.3})}
 {const x=hx+9,z=hz-4;B(1.2,.08,.8,x,.7,z,STL);for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])rod([x+a*.5,.06,z+b*.35],[x+a*.4,.66,z+b*.28],.03,STL);C(.28,.32,.6,x,1.04,z,M(0x4a4a4c,{metalness:.5}),'x',null,9);for(let i=0;i<9;i++){const a=i/9*Math.PI*2;C(.12,.1,.5,x+.05,1.04+Math.cos(a)*.38,z+Math.sin(a)*.38,M(0x5a5a5c,{metalness:.5}),null,null,8).rotation.x=a}C(.12,.12,.2,x-.4,1.04,z,STL,'x',null,8);obs.push({x0:x-.7,x1:x+.7,z0:z-.5,z1:z+.5})}
 for(let i=0;i<4;i++){const t=new THREE.Mesh(new THREE.TorusGeometry(.3,.12,8,16),M(0x1a1a1a,{roughness:.8}));t.rotation.x=Math.PI/2;t.position.set(hx+13.2,.18+i*.24,z0+1.2);g.add(t)}obs.push({x0:hx+12.7,x1:hx+13.7,z0:z0+.7,z1:z0+1.7});
 {const x=hx-13.7,z=hz-2;for(const dz of[-1.4,1.4])for(const dx of[-.3,.3])B(.06,3,.06,x+dx,1.5,z+dz,STL);for(const y of[.4,1.3,2.2,2.95])B(.7,.04,2.9,x,y,z,M(0x8a8a86));for(let i=0;i<6;i++)B(.5,.3,.4,x,.58+((i/2)|0)*.9,z-.9+(i%2)*1.6,M([0x7a5a3a,0x3a5a7a,0x8a3a2a][i%3]));obs.push({x0:x-.4,x1:x+.4,z0:z-1.5,z1:z+1.5})}
 for(let i=0;i<3;i++){C(.3,.3,.9,hx-13.5,.45,hz+3+i*.7,M([0x2a5a3a,0x8a2a1a,0x2a4a8a][i],{metalness:.3}),null,null,14);C(.31,.31,.04,hx-13.5,.66,hz+3+i*.7,DK,null,null,14)}obs.push({x0:hx-13.9,x1:hx-13.1,z0:hz+2.6,z1:hz+5})
 {const x=hx+4,z=z0+.9;for(const s of[-1,1])rod([x+s*.3,0,z+.4],[x+s*.25,3,z],.03,M(0xd8c020));for(let i=1;i<9;i++)rod([x-.29+i*.0,i*.33,z+.4-i*.045],[x+.29,i*.33,z+.4-i*.045],.015,M(0xd8c020))}
 /* the workshop lean-to on the east side (x 315..321, z -1286..-1272): a door and a window to the apron, a sloping roof */
 {const x0=hx+W/2,x1=x0+6,za=-1286,zb=-1272,xc=(x0+x1)/2,zc=(za+zb)/2,H1=4.4,H2=3.1;const WL=afCorr(k,'#a8aca8',[1,4]);B(x1-x0-.1,H2,zb-za,xc+.05,H2/2,zc,WL);{const sh=new THREE.Shape();sh.moveTo(0,H2);sh.lineTo(x1-x0,H2);sh.lineTo(0,H1);sh.lineTo(0,H2);const ge=new THREE.ExtrudeGeometry(sh,{depth:zb-za,bevelEnabled:false});const m=new THREE.Mesh(ge,WL);m.position.set(x0,0,za);g.add(m)}
  {const len=Math.hypot(x1-x0+.6,H1-H2),rf=B(len,.08,zb-za+.6,xc+.3,(H1+H2)/2+.06,zc,afCorr(k,'#8a8e90',[6,1]));rf.rotation.z=-Math.atan2(H1-H2,x1-x0+.6)}
  B(1.0,2.1,.06,xc-1.2,1.05,zb+.03,M(0x2a4a6a));C(.035,.035,.06,xc-.85,1.05,zb+.07,STL,'z',null,8);B(1.2,.8,.04,xc+1.4,1.7,zb+.02,M(0x334a5c,{metalness:.3,roughness:.1}));B(1.3,.08,.08,xc+1.4,1.28,zb+.04,STL);L('WORKSHOP',2.2,.4,'#2a4a6a','#ffffff',70,xc,2.6,zb+.035,0);obs.push({x0,x1,z0:za,z1:zb})}
 g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{obs}}

/* the AVGAS tank on a bund (x 277..283, z -1282..-1274): a horizontal tank on saddles, a pump cabinet and a hose reel
   facing the apron, warning signs. The game's joke label lives on now as a sticker on the pump. */
function afFuel(g){const k=afKit(),{B,C,rod,L}=k.H(g),M=k.M,obs=[],x0=277,x1=283,z0=-1282,z1=-1274,xc=(x0+x1)/2,zc=(z0+z1)/2,CON=M(0x9a948a,{roughness:.95}),RED=M(0xb02a20,{roughness:.4,metalness:.2}),STL=M(0x5a5e64,{metalness:.5,roughness:.4}),DK=M(0x26282b,{roughness:.7});
 B(x1-x0,.06,z1-z0,xc,.03,zc,CON);for(const[w,d,x,z]of[[x1-x0,.25,xc,z0+.125],[x1-x0,.25,xc,z1-.125],[.25,z1-z0-.5,x0+.125,zc],[.25,z1-z0-.5,x1-.125,zc]])B(w,.6,d,x,.3,z,CON);obs.push({x0,x1,z0,z1});
 for(const z of[zc-2,zc+2]){B(1.8,.5,.4,xc,.31,z,CON);}C(1.1,1.1,6,xc,1.6,zc,RED,'z',null,24);for(const s of[-1,1]){const e=new THREE.Mesh(new THREE.SphereGeometry(1.1,24,10,0,Math.PI*2,0,Math.PI/2),RED);e.scale.y=.35;e.rotation.x=s*Math.PI/2;e.position.set(xc,1.6,zc+s*3);g.add(e)}for(const z of[zc-1.5,zc,zc+1.5]){const h=new THREE.Mesh(new THREE.TorusGeometry(1.11,.03,6,28),STL);h.position.set(xc,1.6,z);g.add(h)}
 L('AVGAS 100LL',2.2,.5,null,'#ffffff',80,xc-1.115,1.7,zc,-Math.PI/2);L('AVGAS 100LL',2.2,.5,null,'#ffffff',80,xc+1.115,1.7,zc,Math.PI/2);C(.12,.12,.4,xc,2.85,zc+1.5,STL,null,null,10);C(.04,.04,.6,xc,3.0,zc-1.5,STL,null,null,8);
 /* the pump cabinet and hose reel, just outside the bund on the apron side, and the pipe over the wall to them */
 {const pz=z1+.6;B(.8,1.4,.5,xc-1,.7,pz,M(0xe8e8e0,{roughness:.6}));B(.6,.3,.04,xc-1,1.1,pz+.26,M(0x1a1a1a));L('$ 0.00',.5,.16,null,'#60ff80',50,xc-1,1.12,pz+.285,0);L('ALSO FINE\nIN THE BUS',.6,.3,'#c02020','#ffffff',40,xc-1,.55,pz+.255,0);obs.push({x0:xc-1.4,x1:xc-.6,z0:pz-.25,z1:pz+.25});
  C(.4,.4,.3,xc+1,.75,pz,M(0x2a2a2a),'x',null,16);for(const s of[-1,1])B(.05,.75,.5,xc+1+s*.17,.375,pz,STL);const hr=new THREE.Mesh(new THREE.TorusGeometry(.32,.05,6,16),M(0x1a1a1a));hr.rotation.y=Math.PI/2;hr.position.set(xc+1,.75,pz);g.add(hr);rod([xc+1,.45,pz+.3],[xc+.8,.05,pz+.9],.04,M(0x1a1a1a));obs.push({x0:xc+.75,x1:xc+1.25,z0:pz-.3,z1:pz+.3});
  rod([xc,.8,zc+3.2],[xc,.8,z1+.1],.05,STL);rod([xc,.8,z1+.1],[xc-1,.8,pz-.2],.05,STL)}
 for(const[x,z,ry]of[[x0-.05,zc,-Math.PI/2],[x1+.05,zc,Math.PI/2]]){L('NO SMOKING\nNO NAKED FLAMES',1.2,.5,'#c02020','#ffffff',44,x,.45,z,ry)}
 g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{obs}}

/* an old crop duster (a model, not a vehicle): low wing, a hopper in front of the cockpit, a spray boom, a big round
   engine. Built facing +z, wheels on y 0. About 8.5 long and 12 wide. */
function afCropDuster(){const k=afKit(),M=k.M,g=new THREE.Group(),{B,C,rod,L}=k.H(g);const Y=M(0xe8b818,{roughness:.45}),Y2=M(0xc89810,{roughness:.5}),GR=M(0x2a5a3a,{roughness:.5}),DK=M(0x26282b,{roughness:.6}),STL=M(0x9a9ea4,{metalness:.5,roughness:.35}),GL=M(0x8ab0c8,{transparent:true,opacity:.45,roughness:.05});
 /* the fuselage: a lathed body, round at the nose, tapering to the tail */const pr=[[0,-4.4],[.18,-4.3],[.42,-3.4],[.62,-1.8],[.72,-.4],[.74,.9],[.7,2.0],[.62,2.7],[0,2.75]].map(p=>new THREE.Vector2(p[0],p[1]));const fg=new THREE.LatheGeometry(pr,18);const fu=new THREE.Mesh(fg,Y);fu.rotation.x=Math.PI/2;fu.position.y=1.55;fu.scale.set(1,1,1.05);g.add(fu);fu.scale.x=.85;
 /* the cowl and the engine's cylinders, the spinner and a two-blade prop */C(.78,.74,.8,0,1.6,3.0,DK,'z',null,20);for(let i=0;i<9;i++){const a=i/9*Math.PI*2;C(.1,.1,.3,Math.cos(a)*.6,1.6+Math.sin(a)*.6,3.15,M(0x6a6a6c,{metalness:.5}),'z',null,8)}const sp=new THREE.Mesh(new THREE.ConeGeometry(.22,.45,14),STL);sp.rotation.x=Math.PI/2;sp.position.set(0,1.6,3.65);g.add(sp);const pp=B(.18,2.6,.06,0,1.6,3.5,DK);pp.rotation.z=.3;
 /* the hopper hump in front of the cockpit, the cockpit and its canopy */{const hp=new THREE.Mesh(new THREE.SphereGeometry(.6,16,8,0,Math.PI*2,0,Math.PI/2),Y2);hp.scale.set(.8,.75,1.3);hp.position.set(0,1.95,1.3);g.add(hp)}C(.22,.22,.1,0,2.42,1.3,STL,null,null,14);/* the hopper: a rounded hump with a filler cap */{const cp=new THREE.Mesh(new THREE.SphereGeometry(.55,16,10,0,Math.PI*2,0,Math.PI/2),GL);cp.scale.set(.9,.9,1.6);cp.position.set(0,2.1,-.2);g.add(cp)}for(const z of[-.95,.4])B(1.0,.06,.05,0,2.12+(z>0?0:.0),z,DK);
 /* the low wing with a green stripe, struts to the fuselage, the spray boom along its back edge with nozzles */B(12,.16,1.8,0,1.05,.5,Y);B(12.02,.17,.3,0,1.05,-.25,GR);for(const s of[-1,1])B(.1,.18,1.8,s*6,1.05,.5,Y2);/* wing tips; a low wing needs no struts */C(.03,.03,11,0,.85,-.55,STL,'x',null,6);for(let i=0;i<14;i++){const x=-5.2+i*.8;C(.02,.015,.12,x,.76,-.55,DK,null,null,6)}for(const s of[-1,1])rod([s*3,.97,-.3],[s*3,.85,-.55],.02,STL);
 /* the tail: fin, rudder, tailplane */{const fs=new THREE.Shape();fs.moveTo(0,0);fs.lineTo(1.2,0);fs.lineTo(.95,1.5);fs.lineTo(.35,1.5);fs.lineTo(0,0);const fe=new THREE.ExtrudeGeometry(fs,{depth:.08,bevelEnabled:false});fe.translate(0,0,-.04);const fin=new THREE.Mesh(fe,Y);fin.rotation.y=Math.PI/2;fin.position.set(0,1.75,-3.15);g.add(fin)}B(3.6,.08,.9,0,1.8,-3.85,Y);B(3.6,.09,.2,0,1.8,-3.45,GR);
 /* the gear: two sprung legs to wheels with spats, a tailwheel */for(const s of[-1,1]){rod([s*.4,1.0,1.2],[s*1.25,.36,1.35],.05,STL);C(.36,.36,.16,s*1.3,.36,1.35,DK,'x',null,16);const spt=new THREE.Mesh(new THREE.SphereGeometry(.42,12,8,0,Math.PI*2,0,Math.PI/2),Y2);spt.scale.set(.35,.8,1.2);spt.position.set(s*1.3,.4,1.35);g.add(spt)}C(.12,.12,.08,0,.12,-3.9,DK,'x',null,10);rod([0,1.35,-3.6],[0,.15,-3.9],.03,STL);
 L('DUSTY DUSTER',2.2,.3,null,'#2a5a3a',60,.66,1.65,-1.2,Math.PI/2).visible=true;L('DUSTY DUSTER',2.2,.3,null,'#2a5a3a',60,-.66,1.65,-1.2,-Math.PI/2);
 g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return g}

/* the two T-hangars (x 332..346 and 348..362, z -1290..-1276), doors to the apron (z -1276). The first is open with the
   crop duster inside; the second has its roller door down. */
function afTHangars(g){const k=afKit(),{B,C,rod,L}=k.H(g),M=k.M,obs=[],STL=M(0x5a5e64,{metalness:.5,roughness:.4}),CON=M(0x9a948a,{roughness:.95});
 const one=(x0,open,col,nm)=>{const x1=x0+14,za=-1290,zb=-1276,xc=(x0+x1)/2,zc=(za+zb)/2,H=4.4,R=1.1;const WL=afCorr(k,col,[1,3]);
  B(.15,H,zb-za,x0+.075,H/2,zc,WL);B(.15,H,zb-za,x1-.075,H/2,zc,WL);B(14,H,.15,xc,H/2,za+.075,WL);
  /* a low gable roof, ridge front to back, eaves past the walls */for(const s of[-1,1]){const len=Math.hypot(7.4,R);const rf=B(len,.08,zb-za+.6,xc+s*3.62,H+R/2+.04,zc,afCorr(k,'#8a8e90',[1,10]));rf.rotation.z=-s*Math.atan2(R,7.4)}{const sh=new THREE.Shape();sh.moveTo(-7,0);sh.lineTo(7,0);sh.lineTo(0,R);sh.lineTo(-7,0);for(const z of[za+.15,zb-.15]){const m=new THREE.Mesh(new THREE.ShapeGeometry(sh),WL);m.position.set(xc,H,z);g.add(m)}}
  /* the door frame and the roller door: down, or rolled up into its drum */B(13.8,.4,.25,xc,H-.2,zb,STL);for(const s of[-1,1])B(.25,H,.25,xc+s*6.85,H/2,zb,STL);C(.35,.35,13.4,xc,H-.65,zb+.15,STL,'x',null,14);
  if(!open){B(13.4,H-.85,.06,xc,(H-.85)/2,zb+.05,afCorr(k,'#d8dcd8',[30,1]));B(13.4,.1,.1,xc,.05,zb+.05,STL);L(nm,3,.5,'#2a4a8a','#ffffff',70,xc,2.6,zb+.09,0)}else{L(nm,3,.5,'#2a4a8a','#ffffff',70,xc,H-.2,zb+.13,0)}
  {const t=afCanvas(128,128,(x,w,h)=>afTarmac(x,w,h,'#8e8a84',51));afPlane(g,x0+.15,x1-.15,za+.15,zb,.058,t,-3)}
  obs.push({x0,x1:x0+.2,z0:za,z1:zb},{x0:x1-.2,x1,z0:za,z1:zb},{x0,x1,z0:za,z1:za+.2});if(!open)obs.push({x0,x1,z0:zb-.1,z1:zb+.1});else for(const s of[-1,1])obs.push({x0:xc+s*6.85-.15,x1:xc+s*6.85+.15,z0:zb-.15,z1:zb+.15});
  if(open){const cd=afCropDuster();cd.position.set(xc,0,zc+.4);g.add(cd);obs.push({x0:xc-1.6,x1:xc+1.6,z0:zc-4,z1:zc+4.5});/* a tool trolley and a drum by it */B(.8,.8,.5,x1-1,.4,za+1.2,M(0xb02a20));C(.3,.3,.9,x0+1,.45,za+1,M(0x2a5a3a,{metalness:.3}),null,null,14)}};
 one(332,true,'#c0c4c0','HANGAR 2');one(348,false,'#b8bcb8','HANGAR 3');
 g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{obs}}
