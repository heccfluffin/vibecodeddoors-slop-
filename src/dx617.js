/* =====================================================================================================
   r623: THE AIRFIELD AND DARK ZONE 51 (docs/design/airfield-zone51.md). The design chat's airfield.js (batches 1-4)
   and zone51.js (batches 1-4) are copied below, then the wiring:
   - xpAirfield is redefined: the new runway, lights, taxiway and apron, the arched hangar, T-hangars with the crop
     duster, the fuel tank, the terminal and car park, the road crossing with flashing lights, the control tower and
     the windsock. build.py moves the plane to its stand at (345, -1257).
   - xpDarkZone is redefined: the new fence (the Screech hole stays), gate and boom barrier, tank traps on the road in,
     guard towers, Hangar 18 and the saucer, barracks and mess hall (with a visitor), Building 13, the radar and
     radome, the helipad, motor pool, floodlights and fuel dump, and roads inside.
   - The abduction is new (zfAbdTick): the hatch opens, you are drawn up into the saucer, white-out, then a second
     saucer flies you out and drops you. build.py swaps the old q.abd block for a call to it.
   - Zone 51 batch 5: the crash site, the Artifact, the bunker (keypad says no), the waste pit, the listening array,
     the decon tent, and outside the fence a crop circle, cameras on poles and a sign.
   ===================================================================================================== */
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
  /* shoulders: a strip of rougher, lighter tarmac each side */const st=afCanvas(512,64,(x,w,h)=>{afTarmac(x,w,h,'#6a6862',5)});st.wrapS=THREE.RepeatWrapping;st.repeat.set(12,1);/* the shoulders stop where the road crosses (x 296.5..303.5) and, on the apron side, where the taxiway joins (x 318..326), so nothing overlaps */for(const s of[-1,1])for(const[a,b]of s<0?[[RX0,296.5],[303.5,318],[326,RX1]]:[[RX0,296.5],[303.5,RX1]]){const sp=afPlane(g,a,b,s<0?RZ-RW/2-1.5:RZ+RW/2,s<0?RZ-RW/2:RZ+RW/2+1.5,.045,st.clone(),-1);sp.material.map.needsUpdate=true;sp.material.map.repeat.set((b-a)/22.5,1)}
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
  /* the door header beam and the track it hangs from, on outriggers past both sides */B(40,.35,.8,hx,DH+.205,z1+.25,STL);/* right against the front wall (face z1 - .15) *//* the track beam runs over all three door tracks; the leaves hang right up to it */for(const s of[-1,1]){C(.12,.12,DH+.35,hx+s*19.8,(DH+.35)/2,z1+.25,STL,null,null,10);B(.5,.06,.5,hx+s*19.8,.03,z1+.25,CON);obs.push({x0:hx+s*19.8-.25,x1:hx+s*19.8+.25,z0:z1-.15,z1:z1+.35})}
  /* the sliding doors: three leaves a side, stacked open on their tracks past the walls */for(const s of[-1,1])for(let i=0;i<3;i++){const x=hx+s*(16+i*.35),z=z1-.06+i*.2;const lf=B(4,DH,.12,x,DH/2+.03,z,SKF);B(4.04,.12,.16,x,.1,z,STL);B(4.04,.12,.16,x,DH-.03,z,STL);for(const e of[-1,1])B(.12,DH,.16,x+e*1.96,DH/2+.03,z,STL);B(.08,.6,.06,x-s*1.7,1.2,z+.1,STL)}
  obs.push({x0:hx-18.1,x1:hx-13.9,z0:z1-.15,z1:z1+.5},{x0:hx+13.9,x1:hx+18.1,z0:z1-.15,z1:z1+.5});
  /* the sign on the front over the door *//* 12 x 1.5, its top corners under the arch (the roof is 8.4 high at x ±6) and its bottom clear of the track beam */B(12,1.5,.12,hx,7.45,z1-.1,M(0x2a4a8a,{roughness:.6}));L('DOORS BUT DESERT AIRFIELD',11.2,.85,null,'#ffffff',90,hx,7.7,z1-.035,0);L('FLIGHTS: WHENEVER',11.2,.45,null,'#ffd860',70,hx,7.0,z1-.035,0)}
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

/* ---- batch 3: the road across the runway, the terminal and the car park ---- */

/* the road crossing (x 296.5..303.5): packed dirt from the end of the game's road (z -1210) to the runway (z -1220),
   and from the runway (z -1240) to the apron (z -1244); stop lines and STOP painted on both; a post each side with
   two red lights that flash in turn and a STOP · LOOK FOR PLANES sign. Returns {obs, flash:[matA, matB]}. */
function afCrossing(g){const k=afKit(),{B,C,rod,L}=k.H(g),M=k.M,obs=[],x0=296.5,x1=303.5,xc=300;
 const dirt=(z0,z1,stopAt)=>{const PX=24,w=(x1-x0)*PX,h=(z1-z0)*PX;const t=afCanvas(w,h,(x)=>{let sd=77;const r=()=>((sd=Math.imul(sd^sd>>>15,sd|1)+0x6d2b79f5|0)>>>0)/4294967296;x.fillStyle='#a8916c';x.fillRect(0,0,w,h);for(let i=0;i<w*h/12;i++){const v=110+r()*90|0;x.fillStyle='rgba('+v+','+(v-12)+','+(v-34)+',.35)';x.fillRect(r()*w,r()*h,1+r()*2,1+r()*2)}x.fillStyle='rgba(60,45,30,.18)';for(const tx of[.25,.75]){x.fillRect(w*tx-PX*.4,0,PX*.8,h)}
   const Z=m=>(m-z0)*PX;x.fillStyle='#ecebe4';x.fillRect(PX*.3,Z(stopAt)-PX*.2,w-PX*.6,PX*.4);x.save();x.translate(w/2,Z(stopAt)+(stopAt<(z0+z1)/2?PX*1.6:-PX*1.6));if(stopAt>(z0+z1)/2)x.rotate(Math.PI);x.font='bold '+PX*1.6+'px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText('STOP',0,0);x.restore()});
  afPlane(g,x0,x1,z0,z1,.045,t,-1)};
 dirt(-1220,-1210,-1221.5+2.5);dirt(-1244,-1240,-1240.8);
 const flash=[M(0xff2010,{emissive:0xff1000,emissiveIntensity:1}),M(0xff2010,{emissive:0xff1000,emissiveIntensity:.1})],DK=M(0x1a1a1a,{roughness:.6}),WH=M(0xf0f0ea,{roughness:.6});
 for(const[x,z,f]of[[x0-1.2,-1213.5,Math.PI],[x1+1.2,-1242.6,0]])/* each faces the drivers coming towards the runway */{C(.07,.08,3.2,x,1.6,z,WH,null,null,10);B(.6,.06,.6,x,.03,z,M(0x9a948a));obs.push({x0:x-.2,x1:x+.2,z0:z-.2,z1:z+.2});
  const hg=new THREE.Group();hg.position.set(x,2.55,z);hg.rotation.y=f;g.add(hg);B(1.4,.12,.12,0,0,0,DK,hg);for(const s of[-1,1]){C(.2,.2,.14,s*.55,0,-.1,DK,'z',hg,16);C(.15,.15,.04,s*.55,0,-.18,flash[s<0?0:1],'z',hg,16);const hd=new THREE.Mesh(new THREE.CylinderGeometry(.21,.21,.2,16,1,true,-Math.PI/2,Math.PI),DK);hd.rotation.x=Math.PI/2;hd.position.set(s*.55,0,-.26);hg.add(hd)}
  const sg=new THREE.Group();sg.position.set(x,1.55,z);sg.rotation.y=f;g.add(sg);B(1.3,.9,.05,0,0,-.07,WH,sg);const l=k.lab('STOP\nLOOK FOR PLANES',1.2,.8,'#ffffff','#c01818',70);l.position.z=-.1;l.rotation.y=Math.PI;sg.add(l);const oc=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,.04,8),M(0xc01818));oc.rotation.x=Math.PI/2;oc.position.set(0,.85,-.1);sg.add(oc);{const sl=k.lab('STOP',.45,.2,null,'#ffffff',90);sl.position.set(0,.85,-.125);sl.rotation.y=Math.PI;sg.add(sl)}B(.04,.6,.04,0,.6,-.07,WH,sg)}
 g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{obs,flash}}

/* the terminal (x 306..334, z -1212..-1198): stucco walls, a flat roof with a deep shade canopy on the runway side,
   big windows to the runway, glass doors out to it, the entrance from the road on the west end.
   Inside: rows of seats, the ticket desk with a FLIGHTS: WHENEVER board, a café counter, a vending machine, a baggage
   scale, cactus pots. The car park (x 275..294, z -1214..-1196) is in afCarPark. */
function afTerminal(g){const k=afKit(),{B,C,rod,L}=k.H(g),M=k.M,obs=[],X0=306,X1=334,Z0=-1212,Z1=-1198,H=3.6,xc=(X0+X1)/2,zc=(Z0+Z1)/2,T=.25;
 const ST=M(0xffffff,{roughness:.95});ST.map=afCanvas(128,128,(x,w,h)=>{let sd=3;const r=()=>((sd=Math.imul(sd^sd>>>15,sd|1)+0x6d2b79f5|0)>>>0)/4294967296;x.fillStyle='#e6d6b8';x.fillRect(0,0,w,h);for(let i=0;i<2500;i++){x.fillStyle=r()<.5?'rgba(120,90,60,.07)':'rgba(255,255,255,.08)';x.fillRect(r()*w,r()*h,2,2)}});ST.map.wrapS=ST.map.wrapT=THREE.RepeatWrapping;ST.userData.s=.35;
 const TR=M(0x2a6a7a,{roughness:.6}),GL=M(0x9ac0d0,{transparent:true,opacity:.35,roughness:.05,metalness:.2,depthWrite:false}),FR=M(0x3a3e42,{metalness:.4,roughness:.4}),WD=M(0x8a5a32,{roughness:.6}),CHR=M(0xd8dce0,{metalness:.45,roughness:.25});
 /* walls with holes: along x at z (holes [x0,x1,y0,y1]) and along z at x */
 const wallX=(z,holes)=>{let x=X0;holes=holes.slice().sort((a,b)=>a[0]-b[0]);for(const h of holes){if(h[0]>x)B(h[0]-x,H,T,(x+h[0])/2,H/2,z,ST);if(h[2]>0)B(h[1]-h[0],h[2],T,(h[0]+h[1])/2,h[2]/2,z,ST);B(h[1]-h[0],H-h[3],T,(h[0]+h[1])/2,(H+h[3])/2,z,ST);x=h[1]}if(X1>x)B(X1-x,H,T,(x+X1)/2,H/2,z,ST)};
 const wallZ=(x,holes)=>{let z=Z0;holes=holes.slice().sort((a,b)=>a[0]-b[0]);for(const h of holes){if(h[0]>z)B(T,H,h[0]-z,x,H/2,(z+h[0])/2,ST);if(h[2]>0)B(T,h[2],h[1]-h[0],x,h[2]/2,(h[0]+h[1])/2,ST);B(T,H-h[3],h[1]-h[0],x,(H+h[3])/2,(h[0]+h[1])/2,ST);z=h[1]}if(Z1>z)B(T,H,Z1-z,x,H/2,(z+Z1)/2,ST)};
 const runWin=[[307.5,311.5,.9,2.7],[312.5,316.5,.9,2.7],[317.5,321.5,.9,2.7],[322.5,324.5,0,2.5],[325.5,329.5,.9,2.7],[330.5,333,.9,2.7]];
 wallX(Z0+T/2,runWin);wallX(Z1-T/2,[[310,312,1.2,2.4],[320,322,1.2,2.4],[328,330,1.2,2.4]]);wallZ(X0+T/2,[[-1206,-1204,0,2.5]]);wallZ(X1-T/2,[]);/* no window at the east end: the flights board hangs there */
 /* glass and frames in the openings */for(const[a,b,y0,y1]of runWin){const zz=Z0+T/2;if(y0>0){B(b-a,y1-y0,.04,(a+b)/2,(y0+y1)/2,zz,GL);B(b-a+.1,.08,T+.04,(a+b)/2,y0,zz,FR);B(b-a+.1,.08,T+.04,(a+b)/2,y1,zz,FR);for(let m=a;m<=b+.01;m+=(b-a)/2)B(.07,y1-y0,T+.02,m,(y0+y1)/2,zz,FR)}else{/* the glass doors out to the runway, standing open */for(const s of[-1,1]){const lf=new THREE.Group();lf.position.set(s<0?a:b,0,zz);lf.rotation.y=s*1.2;g.add(lf);B(.95,2.45,.04,-s*.5,1.25,0,GL,lf);B(1.0,.08,.06,-s*.5,2.47,0,FR,lf);B(1.0,.08,.06,-s*.5,.04,0,FR,lf);B(.06,2.45,.06,-s*.97,1.25,0,FR,lf);B(.5,.05,.04,-s*.5,1.1,.04,CHR,lf)}B(b-a+.2,.1,T+.06,(a+b)/2,2.5,zz,FR)}}
 for(const[a,b]of[[310,312],[320,322],[328,330]]){B(b-a,1.2,.04,(a+b)/2,1.8,Z1-T/2,GL);B(b-a+.1,.08,T+.04,(a+b)/2,1.2,Z1-T/2,FR);B(b-a+.1,.08,T+.04,(a+b)/2,2.4,Z1-T/2,FR)}
 obs.push({x0:X0,x1:322.5,z0:Z0,z1:Z0+T},{x0:324.5,x1:X1,z0:Z0,z1:Z0+T},{x0:X0,x1:X1,z0:Z1-T,z1:Z1},{x0:X0,x1:X0+T,z0:Z0,z1:-1206},{x0:X0,x1:X0+T,z0:-1204,z1:Z1},{x0:X1-T,x1:X1,z0:Z0,z1:Z1});
 /* the roof, a band of teal trim, the shade canopy on posts over the runway side, the name in big letters on the roof edge */
 B(X1-X0+.6,.3,Z1-Z0+.6,xc,H+.15,zc,M(0xd8ccb4,{roughness:.9}));B(X1-X0+.64,.18,Z1-Z0+.64,xc,H+.39,zc,TR);B(X1-X0+.4,.06,Z1-Z0+.4,xc,H+.33,zc,M(0x8a8a84));
 B(X1-X0+.6,.16,3.2,xc,H-.05,Z0-1.6,M(0xd8ccb4,{roughness:.9}));B(X1-X0+.64,.14,.1,xc,H-.05,Z0-3.2,TR);for(let x=X0+.6;x<=X1;x+=6.8){C(.08,.08,H-.13,x,(H-.13)/2,Z0-3.0,FR,null,null,10);B(.4,.04,.4,x,.02,Z0-3.0,M(0x9a948a));obs.push({x0:x-.15,x1:x+.15,z0:Z0-3.15,z1:Z0-2.85})}
 L('DOORS BUT DESERT AIRFIELD',14,.7,null,'#2a6a7a',90,xc,H+.95,Z0-.33,Math.PI);B(14.2,.9,.06,xc,H+.95,Z0-.26,M(0xe6d6b8));for(const dx of[-6.5,6.5])B(.06,.5,.06,xc+dx,H+.6,Z0-.25,FR);
 L('TERMINAL',3,.5,'#2a6a7a','#ffffff',80,X0-.14,2.95,-1205,-Math.PI/2);B(.06,.6,3.2,X0-.1,2.95,-1205,TR);
 /* inside: a terrazzo floor */{const t=afCanvas(256,256,(x,w,h)=>{let sd=5;const r=()=>((sd=Math.imul(sd^sd>>>15,sd|1)+0x6d2b79f5|0)>>>0)/4294967296;x.fillStyle='#d8d0c4';x.fillRect(0,0,w,h);const cl=['#8a7a6a','#5a6a72','#c8a878','#f0ece4'];for(let i=0;i<3000;i++){x.fillStyle=cl[i%4];x.fillRect(r()*w,r()*h,1.5,1.5)}x.strokeStyle='rgba(120,100,80,.5)';x.lineWidth=2;for(let i=0;i<=w;i+=64){x.beginPath();x.moveTo(i,0);x.lineTo(i,h);x.stroke();x.beginPath();x.moveTo(0,i);x.lineTo(w,i);x.stroke()}});t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(7,3.5);afPlane(g,X0+T,X1-T,Z0+T,Z1-T,.06,t,-3)}
 B(X1-X0-.6,.04,Z1-Z0-.6,xc,H-.02,zc,M(0xf0ece4));for(const x of[312,320,328])for(const z of[-1208,-1202]){B(1.2,.04,.6,x,H-.06,z,M(0xfffff0,{emissive:0xfff4d8,emissiveIntensity:.8}))}
 /* seating: three rows of joined chairs facing the runway windows */const seats=(x,z,n)=>{B(n*.62,.06,.5,x,.45,z,M(0x2a6a7a,{roughness:.5}));B(n*.62,.5,.06,x,.75,z+.25,M(0x2a6a7a,{roughness:.5}));B(n*.62,.05,.05,x,.25,z,CHR);for(const e of[-1,1]){B(.05,.45,.45,x+e*n*.31,.22,z,CHR)}for(let i=1;i<n;i++)B(.04,.18,.4,x-n*.31+i*.62,.58,z,CHR);obs.push({x0:x-n*.31,x1:x+n*.31,z0:z-.3,z1:z+.3})};
 for(const z of[-1209,-1206.6])for(const x of[312.5,319.5])seats(x,z,7);
 /* the ticket desk at the east end, the departures board over it */{const x=331,z=-1205;B(1.0,1.05,4,x,.525,z,WD);B(1.15,.06,4.2,x-.05,1.08,z,M(0xd8d0c4));B(.02,.7,3.6,x-.51,.5,z,TR);L('TICKETS',1.6,.3,'#2a6a7a','#ffffff',70,x-.52,.75,z,-Math.PI/2);B(.3,.25,.25,x+.1,1.24,z-1.2,M(0x2a2a2c));B(.3,.03,.22,x-.1,1.12,z-.6,M(0x1a1a1a));obs.push({x0:x-.55,x1:x+.55,z0:z-2.05,z1:z+2.05});
  B(.1,1.3,3.6,X1-T-.06,2.6,z,M(0x1a1a1c));{const bd=k.lab('FLIGHTS             GATE   STATUS\nANYWHERE · · · · · ·   1    WHENEVER\nNOWHERE  · · · · · ·   1    DELAYED\nTHE BUS  · · · · · ·   -    ALSO FINE\nBACK HERE · · · · ·   1    ON TIME',3.4,1.15,'#141418','#ffc830',40);bd.position.set(X1-T-.115,2.6,z);bd.rotation.y=-Math.PI/2;g.add(bd)}}
 /* the café counter at the west end, by the entrance: counter, coffee machine, cake dome, menu board, stools */{const x=309,z=-1209.8;B(4,1.0,.8,x+.6,.5,z,WD);B(4.2,.05,.9,x+.6,1.025,z,M(0xd8d0c4));obs.push({x0:x-1.5,x1:x+2.7,z0:z-.45,z1:z+.45});B(.6,.55,.45,x-.6,1.33,z-.1,CHR);B(.5,.12,.3,x-.6,1.2,z+.1,M(0x1a1a1a));C(.22,.25,.03,x+1.6,1.06,z,M(0xf0ece4),null,null,16);{const dm=new THREE.Mesh(new THREE.SphereGeometry(.22,16,8,0,Math.PI*2,0,Math.PI/2),GL);dm.position.set(x+1.6,1.08,z);g.add(dm)}C(.17,.15,.1,x+1.6,1.13,z,M(0xc89050),null,null,14);
  B(2.6,1.1,.05,x+.6,2.55,Z0+T+.03,M(0x1a1a1c));L('CAFÉ\nCOFFEE ...... 3\nPIE ......... 5\nMORE PIE .... 5',2.4,1.0,'#1a1a1c','#f0e0a0',40,x+.6,2.55,Z0+T+.06,0);for(let i=0;i<3;i++){const sx=x-.6+i*1.1,sz=z+.9;C(.2,.2,.06,sx,.75,sz,M(0xc02a20),null,null,14);C(.03,.03,.72,sx,.37,sz,CHR,null,null,8);C(.18,.18,.03,sx,.015,sz,CHR,null,null,12)}}
 /* a vending machine, a baggage scale, cactus pots */{B(.9,1.9,.8,X0+T+.5,.95,Z1-T-1.4,M(0xc02a20));B(.6,1.1,.04,X0+T+.5+.0,1.2,Z1-T-1.0+.02,GL);for(let i=0;i<4;i++)for(let j=0;j<4;j++)B(.1,.18,.02,X0+T+.3+i*.13,.8+j*.27,Z1-T-1.03,M([0x3ac060,0xe0b020,0x2a4aa0,0xf0f0f0][(i+j)%4]));obs.push({x0:X0+T,x1:X0+T+1,z0:Z1-T-1.8,z1:Z1-T-1})}
 {const x=327,z=-1205;B(.9,.12,.6,x,.06,z,CHR);B(.12,1.0,.12,x+.4,.56,z,CHR);B(.3,.25,.05,x+.4,1.15,z-.05,M(0x1a1a1a));L('0.0 KG',.26,.1,null,'#60ff80',40,x+.4,1.15,z-.08,Math.PI);obs.push({x0:x-.45,x1:x+.5,z0:z-.3,z1:z+.3})}
 for(const[x,z]of[[323.5,-1199],[316,-1199],[307,-1199]]){C(.3,.24,.5,x,.25,z,M(0xb85a3a,{roughness:.8}),null,null,14);const cb=C(.13,.15,.9,x,.95,z,M(0x4a7a3a,{roughness:.8}),null,null,10);for(const s of[-1,1]){rod([x,.85,z],[x+s*.28,.95,z],.08,M(0x4a7a3a));rod([x+s*.28,.95,z],[x+s*.28,1.3,z],.07,M(0x4a7a3a))}obs.push({x0:x-.3,x1:x+.3,z0:z-.3,z1:z+.3})}
 g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{obs}}

/* the car park (x 275..294, z -1214..-1196): gravel, two rows of bays with railway-sleeper wheel stops, a lamp, a sign */
function afCarPark(g){const k=afKit(),{B,C,rod,L}=k.H(g),M=k.M,obs=[],X0=275,X1=294,Z0=-1214,Z1=-1196,PX=16;
 {const w=(X1-X0)*PX,h=(Z1-Z0)*PX;const t=afCanvas(w,h,(x)=>{let sd=8;const r=()=>((sd=Math.imul(sd^sd>>>15,sd|1)+0x6d2b79f5|0)>>>0)/4294967296;x.fillStyle='#b4a080';x.fillRect(0,0,w,h);for(let i=0;i<w*h/6;i++){const v=150+r()*50|0;x.fillStyle='rgb('+v+','+(v-8)+','+(v-26)+')';x.fillRect(r()*w,r()*h,1+r()*1.6,1+r()*1.6)}x.fillStyle='rgba(240,236,224,.85)';for(const row of[0,1]){const zz=row?h-PX*5.5:0;for(let i=0;i<=6;i++)x.fillRect(PX*(.5+i*3),zz,PX*.14,PX*5.5)}});afPlane(g,X0,X1,Z0,Z1,.035,t,-1)}
 for(const row of[0,1])for(let i=0;i<6;i++){const x=X0+2+i*3,z=row?Z1-.6:Z0+.6;B(1.8,.14,.22,x,.07,z,M(0x5a4030,{roughness:.9}))}
 {const x=X0+1,z=(Z0+Z1)/2;C(.08,.1,6,x,3,z,M(0x3a3e42,{metalness:.4}),null,null,10);rod([x,5.9,z],[x+1.2,6.0,z],.04,M(0x3a3e42));B(.6,.12,.3,x+1.3,5.95,z,M(0x3a3e42));B(.5,.03,.24,x+1.3,5.88,z,M(0xfff4d0,{emissive:0xffe8b0,emissiveIntensity:.8}));obs.push({x0:x-.2,x1:x+.2,z0:z-.2,z1:z+.2})}
 {/* the sign faces the road (+x) */const x=X1-.4,z=(Z0+Z1)/2;for(const dz of[-.6,.6])C(.04,.04,1.8,x,.9,z+dz,M(0x3a3e42),null,null,6);B(.05,.8,1.6,x,1.6,z,M(0x2a4a8a));L('PARKING\n5 MIN · OR FOREVER',1.5,.7,'#2a4a8a','#ffffff',44,x+.03,1.6,z,Math.PI/2);obs.push({x0:x-.1,x1:x+.1,z0:z-.8,z1:z+.8})}
 g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{obs}}

/* ---- batch 4: the control tower and the windsock ---- */

/* the control tower at (430, -1200): a concrete shaft, a steel stair up its east side, a walkway round the cab, the cab
   with sloping glass and consoles inside, a roof with aerials, a rotating airport beacon (green and white) and a red
   light on the mast. The intercom prop stays at (tx, tz + 3.4); the door is on that side.
   Returns {obs, beacon (Group: spin rotation.y), red (material: blink it)}. */
function afTower(g,tx,tz){const k=afKit(),{B,C,rod,L}=k.H(g),M=k.M,obs=[],CON=M(0xd8ccb4,{roughness:.95}),STL=M(0x5a5e64,{metalness:.5,roughness:.4}),YL=M(0xe8c020,{roughness:.6}),GLs=M(0x7aa8c0,{transparent:true,opacity:.4,roughness:.05,metalness:.3,side:THREE.DoubleSide,depthWrite:false}),DK=M(0x26282b,{roughness:.6});
 const S=4,FL=12,CH=3.0,CW=7;
 /* the shaft: banded concrete, a door and a sign on the prop side, slit windows up the stair */
 B(S,FL,S,tx,FL/2,tz,CON);for(let y=3;y<FL;y+=3)B(S+.06,.1,S+.06,tx,y,tz,M(0xb8ac94));B(S+.6,.3,S+.6,tx,.15,tz,M(0x9a948a));
 B(1.1,2.2,.06,tx-.6,1.1,tz+S/2+.03,M(0x2a4a6a));C(.035,.035,.06,tx-.25,1.1,tz+S/2+.07,STL,'z',null,8);B(1.3,.12,.15,tx-.6,2.28,tz+S/2+.05,DK);L('TOWER',2.4,.55,'#d8ccb4','#2a4a8a',80,tx+.6,6.5,tz+S/2+.035,0);
 B(.6,.25,.04,tx+1.2,1.6,tz+S/2+.02,M(0x1a1a1a));C(.08,.08,.04,tx+1.2,1.6,tz+S/2+.05,M(0x40c060,{emissive:0x104010}),'z',null,10);/* the intercom box by the door */
 for(let y=4;y<FL;y+=3)B(.04,.9,.25,tx+S/2+.02,y,tz-1.2,M(0x334a5c,{metalness:.3,roughness:.1}));
 obs.push({x0:tx-S/2-.3,x1:tx+S/2+.3,z0:tz-S/2-.3,z1:tz+S/2+.3});
 /* the stair: a switchback stair tower beside the walkway. Two flight lanes side by side (the outer lane for flights
    1 and 3 going north, the inner lane for 2 and 4 going south); a landing across both lanes at each end joins them,
    so you walk up a flight, turn round on the landing and take the next one up beside it. The top flight lands
    against the walkway's edge, where its railing has a gap. Each flight: two stringers, open treads, a handrail on
    its open side; a rail runs between the lanes. Four corner columns, X-braces on the outer face. */
 {const SW=1.0,xin=tx+(CW+2.2)/2+.02,xa=xin+SW/2,xb=xin+SW*1.5+.04,xo=xin+2*SW+.04,xm=(xin+xo)/2,n=4,fh=(FL+.3)/n,R0=1.6,R1=2.7,run=2*R0,len=Math.hypot(run,fh),ang=Math.atan2(fh,run),nt=Math.round(fh/.19),GY=M(0x7a7e84,{metalness:.4,roughness:.5});
  for(const x of[xin-.07,xo+.07])for(const b of[-1,1])B(.14,FL+.3,.14,x,(FL+.3)/2,tz+b*R1,STL);
  for(let i=0;i<n;i++){const dir=i%2?-1:1,x=i%2?xa:xb,y0=i*fh,y1=y0+fh,za=tz-dir*R0,zb=tz+dir*R0;
   for(const a of[-1,1]){const sg=B(.06,.28,len,x+a*(SW/2-.03),(y0+y1)/2,tz,STL);sg.rotation.x=-dir*ang}
   for(let j=1;j<=nt;j++){const u=(j-.5)/nt,y=y0+fh*j/nt-.02,z=za+(zb-za)*u;B(SW-.12,.04,run/nt+.03,x,y,z,GY)}
   /* handrails: the outer lane's on its outside, the inner lane's on the walkway side; one between the lanes */
   const ox=i%2?xin+.03:xo-.03;rod([ox,y0+.95,za],[ox,y1+.95,zb],.022,YL);rod([xm,y0+.95,za],[xm,y1+.95,zb],.022,YL);
   /* the landing it arrives at: across both lanes, rails round its open end and its outer side */
   {const lz=tz+dir*(R0+R1)/2;B(xo-xin,.08,R1-R0,xm,y1-.04,lz,GY);B(xo-xin,.14,.1,xm,y1-.15,tz+dir*R1,STL);B(xo-xin,.14,.1,xm,y1-.15,tz+dir*R0,STL);
    rod([xin,y1+.95,tz+dir*R1],[xo,y1+.95,tz+dir*R1],.022,YL);rod([xo-.03,y1+.95,tz+dir*R0],[xo-.03,y1+.95,tz+dir*R1],.022,YL);if(i<n-1)rod([xin+.03,y1+.95,tz+dir*R0],[xin+.03,y1+.95,tz+dir*R1],.022,YL);
    for(const px of[xin+.03,xm,xo-.03])C(.02,.02,.95,px,y1+.475,tz+dir*R1,YL,null,null,6)}}
  /* the X-braces on the outer face and the ends */for(let i=0;i<n;i++){const y0=i*fh+.3,y1=(i+1)*fh-.3,x=xo+.07;rod([x,y0,tz-R1],[x,y1,tz+R1],.025,STL);rod([x,y0,tz+R1],[x,y1,tz-R1],.025,STL)}
  /* the bottom step-off pad, in front of the first flight */B(SW+.4,.06,1.2,xb,.03,tz-R0-.6,M(0x9a948a));
  obs.push({x0:xin-.15,x1:xo+.15,z0:tz-R1-.1,z1:tz+R1+.1})}
 /* the walkway round the cab: a slab, a railing */B(CW+2.2,.3,CW+2.2,tx,FL+.15,tz,M(0x9a948a));for(let i=0;i<4;i++){const a=i*Math.PI/2,ca=Math.cos(a),sa=Math.sin(a),h=(CW+2.0)/2;const gap=i==0?[-2.75,-1.55]:null;/* the east side opens where the stair lands */for(let t=-h;t<=h+.01;t+=1.3){if(gap&&t>gap[0]&&t<gap[1])continue;const x=tx+ca*h-sa*t,z=tz+sa*h+ca*t;C(.03,.03,1.0,x,FL+.8,z,YL,null,null,6)}
  if(gap){for(const[a2,b2]of[[-h,gap[0]],[gap[1],h]]){C(.03,.03,1.0,tx+h,FL+.8,tz+(a2==-h?b2:a2),YL,null,null,6);B(.06,.06,b2-a2,tx+h,FL+1.3,tz+(a2+b2)/2,YL)}}else{const r=B(CW+2.0,.06,.06,tx+ca*h,FL+1.3,tz+sa*h,YL);if(i%2==0)r.rotation.y=Math.PI/2/* the west rail runs along z */}}
 /* the cab: a dark base band, sloping glass (an upside-down frustum), mullions, a roof slab */{/* the cab's low base wall: a ring, so the cab floor inside is the walkway level */const BW=M(0x3a4a5a,{roughness:.5});for(const s2 of[-1,1]){B(CW,.6,.2,tx,FL+.6,tz+s2*(CW/2-.1),BW);B(.2,.6,CW-.4,tx+s2*(CW/2-.1),FL+.6,tz,BW)}B(CW-.4,.02,CW-.4,tx,FL+.31,tz,M(0x5a5048,{roughness:.8}))}{const gl=new THREE.Mesh(new THREE.CylinderGeometry((CW+.8)/Math.SQRT2,(CW)/Math.SQRT2,CH-.6,4,1,true),GLs);gl.rotation.y=Math.PI/4;gl.position.set(tx,FL+.9+(CH-.6)/2,tz);g.add(gl);
  for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])rod([tx+a*CW/2,FL+.9,tz+b*CW/2],[tx+a*(CW+.8)/2,FL+CH+.3,tz+b*(CW+.8)/2],.06,DK);for(let i=0;i<4;i++){const a=i*Math.PI/2;for(const t of[-1.2,1.2]){const ca=Math.cos(a),sa=Math.sin(a);rod([tx+ca*CW/2-sa*t,FL+.9,tz+sa*CW/2+ca*t],[tx+ca*(CW+.8)/2-sa*t*1.11,FL+CH+.3,tz+sa*(CW+.8)/2+ca*t*1.11],.03,DK)}}}
 B(CW+1.4,.35,CW+1.4,tx,FL+CH+.47,tz,M(0x3a4a5a,{roughness:.5}));B(CW+1.5,.08,CW+1.5,tx,FL+CH+.32,tz,DK);
 /* inside the cab: consoles round the glass, two chairs, binoculars, a radio */for(let i=0;i<4;i++){const a=i*Math.PI/2,ca=Math.cos(a),sa=Math.sin(a);const cs=B(CW-1.4,.9,.6,tx+ca*(CW/2-.6),FL+.75,tz+sa*(CW/2-.6),M(0x6a6e74,{roughness:.5}));if(i%2==0)cs.rotation.y=Math.PI/2;const tp=B(CW-1.4,.04,.62,tx+ca*(CW/2-.6),FL+1.22,tz+sa*(CW/2-.6),M(0x2a2a2c));if(i%2==0)tp.rotation.y=Math.PI/2}
 for(const[x,z]of[[tx+1,tz+1.2],[tx-1.2,tz-1]]){C(.25,.25,.08,x,FL+.75,z,M(0x2a2a2c),null,null,12);C(.03,.03,.45,x,FL+.5,z,STL,null,null,6);B(.45,.4,.06,x,FL+1.0,z-.24,M(0x2a2a2c))}
 B(.5,.3,.3,tx+2.6,FL+1.39,tz-.5,M(0x3a3a3a));C(.01,.01,.4,tx+2.75,FL+1.7,tz-.55,DK,null,null,4);
 /* the roof: aerials, a mast with the red light, the rotating beacon on a short stand */const ry=FL+CH+.65;C(.05,.05,4,tx-2.5,ry+2,tz-2.5,STL,null,null,6);C(.03,.03,2.5,tx+2.6,ry+1.25,tz-2.4,STL,null,null,6);for(let i=0;i<4;i++)rod([tx+2.6,ry+2.2-i*.4,tz-2.4],[tx+2.6+.5,ry+2.2-i*.4,tz-2.4],.012,STL);
 const red=M(0xff2010,{emissive:0xff0000,emissiveIntensity:1});{const b=new THREE.Mesh(new THREE.SphereGeometry(.16,10,8),red);b.position.set(tx-2.5,ry+4.1,tz-2.5);g.add(b)}
 B(.6,.8,.6,tx,ry+.4,tz,STL);const beacon=new THREE.Group();beacon.position.set(tx,ry+1.05,tz);g.add(beacon);{const hs=new THREE.Mesh(new THREE.CylinderGeometry(.35,.4,.5,14),DK);beacon.add(hs);for(const[s,col]of[[1,0x40ff70],[-1,0xffffff]]){const lens=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,.06,14),M(col,{emissive:col,emissiveIntensity:1}));lens.rotation.z=Math.PI/2;lens.position.set(s*.38,0,0);beacon.add(lens);}const cap=new THREE.Mesh(new THREE.ConeGeometry(.4,.2,14),DK);cap.position.y=.35;beacon.add(cap)}beacon.userData.dpKeep=1;beacon.traverse(m=>m.userData.dpKeep=1);
 g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{obs,beacon,red}}

/* the windsock at (380, -1248): a hinged pole on a base, a striped sock on a swivel ring, a white marker circle of
   painted segments round it. sk turns on y, so droops on z (see the spec for the anim). */
function afWindsock(g,wx,wz){const k=afKit(),{B,C,rod}=k.H(g),M=k.M,obs=[],STL=M(0xd8dce0,{metalness:.4,roughness:.35}),WH=M(0xf0ece0,{roughness:.8});
 for(let i=0;i<12;i++){if(i%3==2)continue;const a=i/12*Math.PI*2;const seg=B(1.5,.05,.4,wx+Math.cos(a)*4,.025,wz+Math.sin(a)*4,WH);seg.rotation.y=-a+Math.PI/2}
 B(1,.2,1,wx,.1,wz,M(0x9a948a));C(.07,.09,5.6,wx,3,wz,STL,null,null,10);B(.25,.5,.2,wx,1.2,wz+.1,STL);C(.04,.04,.3,wx,1.2,wz+.25,STL,'x',null,8);C(.12,.12,.12,wx,5.8,wz,STL,null,null,10);
 const sk=new THREE.Group();sk.position.set(wx,5.8,wz);g.add(sk);const ring=new THREE.Mesh(new THREE.TorusGeometry(.45,.035,6,20),STL);ring.rotation.y=Math.PI/2;ring.position.x=.5;sk.add(ring);const arm=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.5,6),STL);arm.rotation.z=Math.PI/2;arm.position.x=.25;sk.add(arm);
 const so=new THREE.Group();so.position.x=.5;so.rotation.z=Math.PI/2;sk.add(so);for(let i=0;i<5;i++){const r0=.45-i*.065,r1=.45-(i+1)*.065;const sg=new THREE.Mesh(new THREE.CylinderGeometry(r0,r1,.5,16,1,true),M(i%2?0xffffff:0xff5a10,{side:THREE.DoubleSide,roughness:.9}));sg.position.y=-.25-i*.5;so.add(sg)}
 obs.push({x0:wx-.5,x1:wx+.5,z0:wz-.5,z1:wz+.5});[sk].forEach(o=>o.traverse(m=>m.userData.dpKeep=1));g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{obs,sk,so}}

/* Dark Zone 51 (airfield-zone51.md). Needs fort-kit.js (fbKit) and airfield.js (afKit, afPlane, afCanvas, afTarmac).
   Desert-local coordinates (DZ51 x -630..-470, z -1960..-1780). Everything is noSeam; moving parts are dpKeep.

   Batch 1:
   zfFence(g)         the perimeter: concrete posts, chain-link, outward-leaning arms with barbed wire and razor coil,
                      warning signs. Gaps: the gate (x -470, z -1873.5..-1866.5) and the Screech hole (x -630,
                      z -1801.2..-1800, the wire peeled back). Returns {obs} (the same runs the game uses today).
   zfGate(g)          the gate: two heavy posts with lamps, a sliding gate in a Group `gate` placed at (-470, 0, -1870)
                      (the ramming code knocks it off: give its obstacle m: gate, kd: 'gate'); a boom barrier outside
                      with its arm in `arm` (pivot at its post; rotation.z lifts it); a guard post inside.
                      Returns {gate, arm, obs}.
   zfTraps(g)         steel tank traps in a zig-zag on the approach road (x -465..-440), leaving a weaving lane.
                      Returns {obs}.
   zfTower(g, x, z)   a guard tower: braced steel legs, a cab with windows, a ladder, a searchlight that sweeps.
                      Returns {pv, obs}: pv is the searchlight's pivot (same as the game's: rotation.y sweeps,
                      rotation.x tilts), its beam cone hangs from it.
*/
function zfKit(){if(zfKit.k)return zfKit.k;const f=fbKit(),k=Object.create(f);k.M=f.M;zfKit.k=k;return k}
const DZB={x0:-630,x1:-470,z0:-1960,z1:-1780,gz0:-1873.5,gz1:-1866.5,hz0:-1801.2,hz1:-1800};

function zfFence(g){const k=zfKit(),{B,C,rod,L}=k.H(g),M=k.M,obs=[],{x0,x1,z0,z1}=DZB,CON=M(0xa8a49c,{roughness:.95}),STL=M(0x6a6e74,{metalness:.5,roughness:.4}),H=3.2;
 const link=afCanvas(64,64,(x,w,h)=>{x.clearRect(0,0,w,h);x.strokeStyle='rgba(205,210,215,.95)';x.lineWidth=1.6;for(let i=-64;i<128;i+=8){x.beginPath();x.moveTo(i,0);x.lineTo(i+64,64);x.stroke();x.beginPath();x.moveTo(i+64,0);x.lineTo(i,64);x.stroke()}});link.wrapS=link.wrapT=THREE.RepeatWrapping;
 const posts=[],arms=[],wire=M(0x9a9ea4,{metalness:.6,roughness:.35});
 /* one straight run from a to b (along x or z), its outward side is `out` (+1/-1 on the other axis) */
 const panel=(ax,az,bx,bz,y0,y1)=>{const L2=Math.hypot(bx-ax,bz-az),alongX=Math.abs(bx-ax)>.01;const t=link.clone();t.needsUpdate=true;t.repeat.set(L2/2,(y1-y0)/2);const m=new THREE.Mesh(new THREE.PlaneGeometry(L2,y1-y0),new THREE.MeshBasicMaterial({map:t,transparent:true,side:THREE.DoubleSide,depthWrite:false,alphaTest:.2}));m.position.set((ax+bx)/2,(y0+y1)/2,(az+bz)/2);m.rotation.y=alongX?0:Math.PI/2;g.add(m)};
 const run=(ax,az,bx,bz,out,hole)=>{const L2=Math.hypot(bx-ax,bz-az),alongX=Math.abs(bx-ax)>.01;
  if(!hole)panel(ax,az,bx,bz,.08,H-.07);else{/* along z only: mesh either side of the hole, and over it */panel(ax,az,ax,hole[0]-.5,.08,H-.07);panel(ax,hole[1]+.5,bx,bz,.08,H-.07)/* the 2.2 m across the hole is drawn by the hole itself */}
  const n=Math.max(1,Math.round(L2/3));for(let i=0;i<=n;i++){const px=ax+(bx-ax)*i/n,pz=az+(bz-az)*i/n;B(.18,H,.18,px,H/2,pz,CON);
   /* the outward-leaning arm on top */const ox=alongX?0:out*.55,oz=alongX?out*.55:0;rod([px,H-.05,pz],[px+ox,H+.5,pz+oz],.03,STL)}
  /* top rail, bottom tension wire, three barbed strands on the arms, the razor coil along them */
  rod([ax,H-.1,az],[bx,H-.1,bz],.035,STL);if(!hole)rod([ax,.12,az],[bx,.12,bz],.012,wire);else{rod([ax,.12,az],[ax,.12,hole[0]],.012,wire);rod([ax,.12,hole[1]],[bx,.12,bz],.012,wire)}
  for(const f of[.35,.7,1]){const ox=alongX?0:out*.55*f,oz=alongX?out*.55*f:0;rod([ax+ox,H-.05+.55*f,az+oz],[bx+ox,H-.05+.55*f,bz+oz],.008,wire)}
  {const ox=alongX?0:out*.3,oz=alongX?out*.3:0,cx=(ax+bx)/2+ox,cz=(az+bz)/2+oz,turns=Math.round(L2/.35),pts=[];for(let i=0;i<=turns*8;i++){const u=i/(turns*8),a=u*turns*Math.PI*2,r=.26;const along=-L2/2+u*L2;const lx=alongX?along:Math.sin(a)*r,lz=alongX?Math.sin(a)*r:along;pts.push(new THREE.Vector3(cx+lx,H+.35+Math.cos(a)*r,cz+lz))}const tb=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),turns*8,.01,3),wire);g.add(tb)}
  if(!hole)obs.push({x0:Math.min(ax,bx)-.15,x1:Math.max(ax,bx)+.15,z0:Math.min(az,bz)-.15,z1:Math.max(az,bz)+.15});else obs.push({x0:ax-.15,x1:ax+.15,z0:az,z1:hole[0]},{x0:ax-.15,x1:ax+.15,z0:hole[1],z1:bz})};
 run(x0,z0,x1,z0,-1);run(x0,z1,x1,z1,1);run(x0,z0,x0,z1,-1,[DZB.hz0,DZB.hz1,1.45]);/* the west side runs unbroken; only the mesh has the hole */run(x1,z0,x1,DZB.gz0-.6,1);run(x1,DZB.gz1+.6,x1,z1,1);
  /* the Screech hole: one 2.2 m piece of mesh across the hole, with a ragged, roughly round hole torn out of its
    bottom (about 1.2 wide and 1.4 high); no flap */
 {const x=x0,za=DZB.hz0-.5,zb=DZB.hz1+.5,zc=(DZB.hz0+DZB.hz1)/2,PW=zb-za,PH=H-.15,HW=1.25,HH=1.45;let sd=13;const r=()=>((sd=Math.imul(sd^sd>>>15,sd|1)+0x6d2b79f5|0)>>>0)/4294967296;
  const outline=[];for(let i=0;i<=24;i++){const a=Math.PI*i/24,w=HW/2*(1+(r()-.5)*.18),h=HH*(1+(r()-.5)*.12);outline.push([Math.cos(a)*w,i==0||i==24?0:Math.sin(a)*h*(.85+.15*Math.sin(a))])}
  const pix=128,cw=Math.round(PW*pix/2),ch=Math.round(PH*pix/2);const cv=document.createElement('canvas');cv.width=cw;cv.height=ch;const c=cv.getContext('2d');c.strokeStyle='rgba(205,210,215,.95)';c.lineWidth=1.6*pix/64;for(let i=-ch;i<cw+ch;i+=8*pix/64){c.beginPath();c.moveTo(i,0);c.lineTo(i+ch,ch);c.stroke();c.beginPath();c.moveTo(i+ch,0);c.lineTo(i,ch);c.stroke()}
  const U=zz=>(zz-za)/PW*cw,V=y=>ch-(y-.08)/PH*ch;c.globalCompositeOperation='destination-out';c.beginPath();outline.forEach(([dz,y],i)=>{const px=U(zc+dz),py=V(y);i?c.lineTo(px,py):c.moveTo(px,py)});c.closePath();c.fill();
  /* bent cut ends round the edge: short grey strokes poking out of the hole's rim */c.globalCompositeOperation='source-over';c.strokeStyle='rgba(185,190,195,.95)';c.lineWidth=1.4*pix/64;outline.forEach(([dz,y],i)=>{if(i%2)return;const px=U(zc+dz),py=V(y),nx=dz,ny=-(y-0);const l=Math.hypot(nx,ny)||1;c.beginPath();c.moveTo(px,py);c.lineTo(px-nx/l*6,py-ny/l*6*-1);c.stroke()});
  const tx=new THREE.CanvasTexture(cv);tx.anisotropy=4;const hm=new THREE.Mesh(new THREE.PlaneGeometry(PW,PH),new THREE.MeshBasicMaterial({map:tx,transparent:true,side:THREE.DoubleSide,depthWrite:false,alphaTest:.2}));hm.rotation.y=Math.PI/2;hm.position.set(x,.08+PH/2,(za+zb)/2);g.add(hm);
  B(.03,.5,1,x-.06,1.9,-1798.7,M(0x1a1a1a));for(const dz of[-.4,.4])rod([x-.04,2.17,-1798.7+dz],[x,2.3,-1798.7+dz],.006,wire);const n=k.lab('psst. this way.\n– S',1,.5,'#1a1a1a','#f0f0f0',50);n.position.set(x-.08,1.9,-1798.7);n.rotation.y=-Math.PI/2;g.add(n)}
 /* warning signs every 30 m, on the outside face */const SG=['RESTRICTED AREA\nDARK ZONE 51','NO TRESPASSING\nTRESPASSERS WILL BE SEEKED','USE OF DARK FORCE\nAUTHORISED','TURN AROUND\n(THIS MEANS YOU, HALT)','PHOTOGRAPHY\nPROHIBITED','KEEP OUT\nNOTHING TO SEE HERE'];let si=0;
 const sign=(x,z,ry)=>{const sg=new THREE.Group();sg.position.set(x,1.7,z);sg.rotation.y=ry;g.add(sg);const bd=new THREE.Mesh(new THREE.BoxGeometry(1.4,.9,.03),M(0xf0ece4));sg.add(bd);const l=k.lab(SG[si++%SG.length],1.3,.8,'#ffffff','#c01818',40);l.position.z=.02;sg.add(l);const bar=new THREE.Mesh(new THREE.BoxGeometry(1.4,.16,.035),M(0xc01818));bar.position.y=.37;sg.add(bar)};
 for(let x=x0+15;x<x1;x+=30){sign(x,z0-.1,Math.PI);sign(x,z1+.1,0)}for(let z=z0+15;z<z1;z+=30){if(Math.abs(z-(-1800.6))>4)sign(x0-.1,z,-Math.PI/2);if(z<DZB.gz0-3||z>DZB.gz1+3)sign(x1+.1,z,Math.PI/2)}
 g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{obs}}

function zfGate(g){const k=zfKit(),{B,C,rod,L}=k.H(g),M=k.M,obs=[],x=DZB.x1,zc=(DZB.gz0+DZB.gz1)/2,STL=M(0x6a6e74,{metalness:.5,roughness:.4}),YB=M(0xe8c020,{roughness:.5}),RD=M(0xc01818,{roughness:.5}),CON=M(0xa8a49c,{roughness:.95});
 /* the two gate posts: square steel with a lamp each, in the gaps the fence leaves (z gz0-.6..gz0 and gz1..gz1+.6) */
 for(const z of[DZB.gz0-.3,DZB.gz1+.3]){B(.45,4,.45,x,2,z,STL);B(.55,.12,.55,x,4.06,z,STL);C(.12,.15,.3,x+.3,3.8,z,M(0x26282b),'x',null,10);C(.1,.1,.03,x+.46,3.8,z,M(0xfff4d0,{emissive:0xffe0a0,emissiveIntensity:.9}),'x',null,10);B(.8,.3,.8,x,.15,z,CON);obs.push({x0:x-.3,x1:x+.3,z0:z-.3,z1:z+.3})}
 /* the gate: two leaves of steel frame with mesh and diagonal bracing, on its own Group (the ramming code throws it) */
 const gate=new THREE.Group();gate.position.set(x,0,zc);g.add(gate);const{B:GB,rod:GR}=k.H(gate);const link=afCanvas(64,64,(c,w,h)=>{c.strokeStyle='rgba(205,210,215,.95)';c.lineWidth=1.6;for(let i=-64;i<128;i+=8){c.beginPath();c.moveTo(i,0);c.lineTo(i+64,64);c.stroke();c.beginPath();c.moveTo(i+64,0);c.lineTo(i,64);c.stroke()}});link.wrapS=link.wrapT=THREE.RepeatWrapping;link.repeat.set(1.6,1.4);
 for(const s of[-1,1]){const zz=s*1.72,W=3.4,Hh=2.9;GB(.1,.1,W,0,.2,zz,STL);GB(.1,.1,W,0,Hh,zz,STL);for(const e of[-1,1])GB(.1,Hh-.1,.1,0,(Hh+.2)/2,zz+e*(W/2-.05),STL);GR([0,.25,zz-s*(W/2-.1)],[0,Hh-.05,zz+s*(W/2-.1)],.03,STL);
  const mm=new THREE.Mesh(new THREE.PlaneGeometry(W-.1,Hh-.2),new THREE.MeshBasicMaterial({map:link,transparent:true,side:THREE.DoubleSide,depthWrite:false,alphaTest:.2}));mm.rotation.y=Math.PI/2;mm.position.set(0,(Hh+.2)/2,zz);gate.add(mm);
  for(let i=0;i<2;i++){const w=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.06,12),M(0x26282b));w.rotation.x=Math.PI/2;w.position.set(0,.09,zz+s*(i?-1.2:1.2));gate.add(w)}
  const sg=k.lab('AUTHORISED DARK\nPERSONNEL ONLY',1.6,.6,'#c01818','#ffffff',44);sg.position.set(.06,1.7,zz);sg.rotation.y=Math.PI/2;gate.add(sg);const sb=sg.clone();sb.position.x=-.06;sb.rotation.y=-Math.PI/2;gate.add(sb)}
 {const lk=new THREE.Mesh(new THREE.BoxGeometry(.2,.3,.25),M(0xd8b020,{metalness:.5,roughness:.3}));lk.position.set(.12,1.4,0);gate.add(lk);const sh=new THREE.Mesh(new THREE.TorusGeometry(.08,.02,6,12,Math.PI),M(0xc0c4c8,{metalness:.5}));sh.position.set(.12,1.57,0);sh.rotation.y=Math.PI/2;gate.add(sh)}
 gate.traverse(m=>{m.userData.dpKeep=1});
 /* the boom barrier outside the gate (x -466), its post on the south side of the road; the arm across the road */
 const bx=x+4,bz=DZB.gz0-.8;B(.5,1.1,.5,bx,.55,bz,RD);B(.6,.12,.6,bx,1.16,bz,M(0x26282b));C(.1,.1,.7,bx,1.0,bz,STL,'z',null,10);obs.push({x0:bx-.3,x1:bx+.3,z0:bz-.3,z1:bz+.3});
 const arm=new THREE.Group();arm.position.set(bx,1.0,bz+.35);g.add(arm);{const n=8,len=7.6;for(let i=0;i<n;i++){const sgm=new THREE.Mesh(new THREE.BoxGeometry(.14,.14,len/n),i%2?RD:M(0xf4f0e6));sgm.position.z=(i+.5)*len/n;arm.add(sgm)}const cw=new THREE.Mesh(new THREE.BoxGeometry(.3,.3,.6),M(0x3a3a3c));cw.position.z=-.5;arm.add(cw);const tip=new THREE.Mesh(new THREE.SphereGeometry(.08,8,6),M(0xff2010,{emissive:0xff1000,emissiveIntensity:.9}));tip.position.z=len;arm.add(tip);
  const rest=new THREE.Mesh(new THREE.BoxGeometry(.12,.9,.12),YB);rest.position.set(bx,.45,DZB.gz1+.9);g.add(rest)}arm.rotation.x=0;arm.traverse(m=>m.userData.dpKeep=1);
 /* the guard post inside (x -484..-476, z -1884..-1876): a block hut with a wrap-round window to the gate, a door, a flat roof with a floodlight */
 {const x0=-484,x1=-476,za=-1884,zb=-1876,xc=(x0+x1)/2,zc2=(za+zb)/2,H=2.8,W2=M(0xc8c4b8,{roughness:.9}),GL=M(0x5a7a8a,{metalness:.3,roughness:.1,transparent:true,opacity:.6});
  B(x1-x0,1.0,zb-za,xc,.5,zc2,W2);for(const[a,b]of[[x0,za],[x1,za],[x0,zb],[x1,zb]])B(.25,H,.25,a+(a<xc?.125:-.125),H/2,b+(b<zc2?.125:-.125),W2);B(x1-x0,.6,zb-za,xc,H-.3,zc2,W2);
  B(x1-x0-.5,1.2,.06,xc,1.6,zb-.12,GL);B(.06,1.2,zb-za-.5,x1-.12,1.6,zc2,GL);B(.06,1.2,zb-za-.5,x0+.12,1.6,zc2,GL);B(x1-x0-.5,1.2,.06,xc,1.6,za+.12,W2);
  B(.9,2.1,.06,x0+1.4,1.05,za+.1,M(0x2a3a4a));B(x1-x0+.6,.2,zb-za+.6,xc,H+.1,zc2,M(0x5a5e64));C(.06,.06,1,x1-.6,H+.7,zb-.6,STL,null,null,8);B(.6,.3,.25,x1-.6,H+1.2,zb-.5,M(0x26282b)).rotation.x=-.4;
  B(.5,.9,.4,x1-.6,.45,zb-.6,M(0x3a3a3c));L('GATE',1.2,.3,'#26282b','#ffd040',60,xc,H-.3,zb+.01,0);obs.push({x0,x1,z0:za,z1:zb})}
 g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{gate,arm,obs}}

function zfTraps(g){const k=zfKit(),M=k.M,obs=[],ST=M(0x4a4c50,{metalness:.5,roughness:.55}),RU=M(0x7a4a2a,{roughness:.8});
 /* a hedgehog: three steel angles crossing at the middle, standing on three of their ends */
 const hog=(x,z,ry)=>{/* three angles along x, y and z, then the group turned so one corner of that cube points up: it stands on three ends */const hg=new THREE.Group(),inner=new THREE.Group();hg.add(inner);for(let i=0;i<3;i++){const a=new THREE.Group();const b1=new THREE.Mesh(new THREE.BoxGeometry(1.8,.16,.03),i==1?RU:ST),b2=new THREE.Mesh(new THREE.BoxGeometry(1.8,.03,.16),ST);b2.position.set(0,.065,.065);a.add(b1,b2);if(i==1)a.rotation.z=Math.PI/2;if(i==2)a.rotation.y=Math.PI/2;inner.add(a)}
  inner.quaternion.setFromUnitVectors(new THREE.Vector3(1,1,1).normalize(),new THREE.Vector3(0,1,0));hg.position.set(x,.9/Math.sqrt(3)+.02,z);hg.rotation.y=ry;g.add(hg);obs.push({x0:x-.75,x1:x+.75,z0:z-.75,z1:z+.75})};
 /* rows across the road, alternating sides, leaving a 3.4 m lane that weaves north and south */
 for(const[x,side]of[[-463,1],[-456,-1],[-449,1],[-442,-1]]){const lane=side>0?[-1874,-1870.6]:[-1869.4,-1866];for(let z=-1880;z<=-1860;z+=2.2){if(z>lane[0]-.8&&z<lane[1]+.8)continue;hog(x,z,(x*7+z)%3)}}
 /* reflective posts marking the lane */for(const[x,side]of[[-463,1],[-456,-1],[-449,1],[-442,-1]]){const lz=side>0?-1872.3:-1867.7;for(const e of[-1.9,1.9]){const p=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,1,8),M(0xf0ece4));p.position.set(x,.5,lz+e);g.add(p);const r=new THREE.Mesh(new THREE.BoxGeometry(.06,.1,.11),M(0xff6010,{emissive:0x803000}));r.position.set(x,.85,lz+e);g.add(r)}}
 g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{obs}}

function zfTower(g,tx,tz){const k=zfKit(),{B,C,rod,L}=k.H(g),M=k.M,obs=[],STL=M(0x5a5e64,{metalness:.5,roughness:.45}),CON=M(0xa8a49c,{roughness:.95}),CAB=M(0x6a6e64,{roughness:.6}),GL=M(0x4a6070,{metalness:.3,roughness:.1,transparent:true,opacity:.6});
 const FY=9,R0=1.9,R1=1.4;for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]]){rod([tx+a*R0,0,tz+b*R0],[tx+a*R1,FY,tz+b*R1],.1,STL,null,8);B(.6,.2,.6,tx+a*R0,.1,tz+b*R0,CON)}
 const at=(a,b,y)=>{const r=R0+(R1-R0)*y/FY;return[tx+a*r,y,tz+b*r]};const C4=[[-1,-1],[1,-1],[1,1],[-1,1]];
 for(let i=0;i<4;i++){const[a,b]=C4[i],[c,d]=C4[(i+1)%4];for(const y of[3,6])rod(at(a,b,y),at(c,d,y),.05,STL);for(const[y0,y1]of[[.3,3],[3,6],[6,FY-.2]]){rod(at(a,b,y0),at(c,d,y1),.03,STL);rod(at(c,d,y0),at(a,b,y1),.03,STL)}}
 /* the cab: a floor, half-height walls, a band of windows, corner posts, a roof with an overhang */
 B(4.2,.25,4.2,tx,FY+.12,tz,STL);for(const s of[-1,1]){B(4,1.0,.12,tx,FY+.75,tz+s*1.94,CAB);B(.12,1.0,4,tx+s*1.94,FY+.75,tz,CAB)}
 for(const s of[-1,1]){B(3.7,.9,.04,tx,FY+1.7,tz+s*1.94,GL);B(.04,.9,3.7,tx+s*1.94,FY+1.7,tz,GL)}for(const[a,b]of C4)B(.14,1.9,.14,tx+a*1.95,FY+1.2,tz+b*1.95,STL);
 B(4.8,.2,4.8,tx,FY+2.3,tz,M(0x3a3e42));B(4.9,.08,4.9,tx,FY+2.18,tz,STL);
 /* the ladder up one leg face, a hatch in the floor */{const lz=tz+R0+.15;for(const s of[-1,1])rod([tx+s*.25,0,lz],[tx+s*.25,FY+.2,tz+R1+.15],.03,STL);for(let y=.35;y<FY;y+=.33){const r=R0+(R1-R0)*y/FY;C(.018,.018,.5,tx,y,tz+r+.15,STL,'x',null,6)}}
 /* the searchlight: a pivot on the roof edge, the lamp drum, the beam cone (as the game's) */
 const sx=tx,sy=FY+2.6,sz=tz;C(.15,.2,.3,sx,FY+2.55,sz,STL,null,null,10);const pv=new THREE.Group();pv.position.set(sx,sy+.2,sz);g.add(pv);
 {const yk=new THREE.Mesh(new THREE.TorusGeometry(.42,.04,6,16,Math.PI),STL);yk.rotation.y=Math.PI/2;pv.add(yk);const dr=new THREE.Mesh(new THREE.CylinderGeometry(.38,.42,.6,16),M(0x3a3a3e,{metalness:.5}));dr.position.y=-.1;pv.add(dr);const ln=new THREE.Mesh(new THREE.CylinderGeometry(.34,.34,.03,16),M(0xfff4d0,{emissive:0xfff0c0,emissiveIntensity:1}));ln.position.y=-.41;pv.add(ln);
  const bm=new THREE.Mesh(new THREE.ConeGeometry(4,40,12,1,true),new THREE.MeshBasicMaterial({color:0xfff0c0,transparent:true,opacity:.14,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}));bm.position.y=-20.4;pv.add(bm)}
 pv.rotation.x=Math.PI/2-.35;pv.traverse(m=>m.userData.dpKeep=1);
 obs.push({x0:tx-2.1,x1:tx+2.1,z0:tz-2.1,z1:tz+2.1});g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{pv,obs}}

/* ---- batch 2: Hangar 18 and the saucer ----
   zfHangar18(g)  at x -605..-555, z -1933..-1897 (centre (-580, -1915)), the door facing the apron (+z). An arched
                  steel hangar 50 wide, 36 deep, 16 high; a 20 x 12 door opening with two huge sliding leaves half open;
                  the apron in front (x -605..-555, z -1897..-1880). Inside: a sealed floor with a hatched landing
                  circle under the saucer, high-bay lights, a catwalk along the back wall with stairs, a bank of
                  consoles facing the saucer, lab benches, the SPECIMEN 13 tank, crates, cables, a gantry crane.
                  Returns {obs, saucer, beam, rim}: saucer is the Group the game hovers and turns (put it at
                  (-580, 6, -1915) as now), beam the light cone under it, rim the ring-light materials to pulse.
   zfSaucer()     the saucer on its own (built round its centre): a panelled lens hull, a rim band with lights,
                  a glowing dome, an underside ring and hatch. About 14 across. Returns {g, rim, dome}. */
function zfSaucer(){const k=zfKit(),M=k.M,g=new THREE.Group();
 /* a smooth, sleek lens: polished silver-grey with fine panel lines, a thin bright rim, a low tinted dome */
 /* not very metallic (the desert has no reflections, so high metalness reads as dark), one even silver, panel seams
    that run out from the middle and two rings, so it reads as a smooth plated hull */
 const hull=new THREE.MeshStandardMaterial({roughness:.5,metalness:.25,color:0xb4b8c0});hull.map=afCanvas(1024,256,(x,w,h)=>{x.fillStyle='#9ca2ac';x.fillRect(0,0,w,h);x.strokeStyle='rgba(50,56,70,.5)';x.lineWidth=1.5;for(let i=0;i<=32;i++){x.beginPath();x.moveTo(i*w/32,0);x.lineTo(i*w/32,h);x.stroke()}for(const y of[h*.35,h*.7]){x.beginPath();x.moveTo(0,y);x.lineTo(w,y);x.stroke()}x.fillStyle='rgba(255,255,255,.12)';for(let i=0;i<32;i+=2)x.fillRect(i*w/32+2,0,w/32-4,h)});
 /* the lathe faces outward only when its profile runs from the bottom up, so each list is reversed here */const prof=(pts)=>new THREE.LatheGeometry(pts.slice().reverse().map(p=>new THREE.Vector2(p[0],p[1])),64);
 g.add(new THREE.Mesh(prof([[0,1.25],[1.6,1.2],[3.2,1.0],[4.7,.7],[5.9,.38],[6.7,.12],[7,0]]),hull));
 {/* the underside a darker grey, so the beam light below doesn't wash it out */const und=hull.clone();und.color=new THREE.Color(0x8a909a);g.add(new THREE.Mesh(prof([[7,0],[6.7,-.12],[5.8,-.42],[4.4,-.72],[2.8,-.9],[1.22,-.95]]),und))}/* the underside stops at the hatch's rim, so the hatch opens onto the lit well */
 /* the rim: a thin dark groove with small lights set into it */const groove=new THREE.Mesh(new THREE.TorusGeometry(6.98,.06,8,96),M(0x1a1c24,{metalness:.5,roughness:.3}));groove.rotation.x=Math.PI/2;g.add(groove);
 const rim=[0x60ffb0,0x70b0ff,0xffffff].map(c=>M(c,{emissive:c,emissiveIntensity:1}));for(let i=0;i<36;i++){const a=i/36*Math.PI*2,l=new THREE.Mesh(new THREE.SphereGeometry(.07,8,6),rim[i%3]);l.position.set(Math.cos(a)*7.0,0,Math.sin(a)*7.0);g.add(l)}
 /* the dome: a low, tinted canopy on a slim collar */const col=new THREE.Mesh(new THREE.CylinderGeometry(2.05,2.15,.14,48),M(0x30343e,{metalness:.6,roughness:.25}));col.position.y=1.27;g.add(col);
 const dome=new THREE.MeshStandardMaterial({color:0x6ad8b0,emissive:0x1a6a50,emissiveIntensity:.6,transparent:true,opacity:.6,roughness:.05,metalness:.2,depthWrite:false});const dm=new THREE.Mesh(new THREE.SphereGeometry(2,48,16,0,Math.PI*2,0,Math.PI/2),dome);dm.scale.y=.55;dm.position.y=1.32;g.add(dm);
 /* underneath: a soft glowing ring, and the hatch: two half-discs that slide apart (hatch(u), u 0 shut .. 1 open);
    above them a glowing well, so when it opens you see light inside */
 const ur=new THREE.Mesh(new THREE.TorusGeometry(2.9,.07,8,64),M(0x80ffc0,{emissive:0x40ff90,emissiveIntensity:.8}));ur.rotation.x=Math.PI/2;ur.position.y=-.86;g.add(ur);
 const hr=new THREE.Mesh(new THREE.TorusGeometry(1.2,.05,6,32),M(0x1a1c24));hr.rotation.x=Math.PI/2;hr.position.y=-.95;g.add(hr);
 const well=new THREE.Mesh(new THREE.CylinderGeometry(1.18,1.18,.7,32,1,true),new THREE.MeshBasicMaterial({color:0xc8ffe8,side:THREE.BackSide}));well.position.y=-.6;g.add(well);const wtop=new THREE.Mesh(new THREE.CircleGeometry(1.18,32),new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide}));wtop.rotation.x=Math.PI/2;wtop.position.y=-.26;g.add(wtop);
 /* an iris: six blades that turn and shrink into the rim */const HM=M(0x3a3e48,{metalness:.25,roughness:.4,side:THREE.DoubleSide}),blades=[];for(let i=0;i<6;i++){const piv=new THREE.Group();piv.position.y=-.955;piv.rotation.y=i*Math.PI/3;g.add(piv);const b=new THREE.Mesh(new THREE.CircleGeometry(1.19,8,0,Math.PI/3+.02),HM);b.rotation.x=Math.PI/2;piv.add(b);blades.push([piv,b])}
 const hatch=u=>{u=Math.min(1,Math.max(0,u));for(const[piv,b]of blades){b.scale.setScalar(Math.max(.001,1-u));piv.rotation.y=piv.userData.a0+u*.8}};blades.forEach(([piv],i)=>piv.userData.a0=i*Math.PI/3);
 g.traverse(m=>{if(m.isMesh){m.userData.noSeam=true;m.userData.dpKeep=1}});return{g,rim,dome,hatch}}

function zfHangar18(g){const k=zfKit(),{B,C,rod,L}=k.H(g),M=k.M,obs=[],hx=-580,hz=-1915,W=50,D=36,HW=8,RISE=8,z0=hz-D/2,z1=hz+D/2,DW=10,DH=12;
 const SK=afCorr(k,'#8a8e90',[1,10]),SKF=afCorr(k,'#9a9ea0',[12,1]),STL=M(0x4a4e54,{metalness:.5,roughness:.4}),YL=M(0xe8c020,{roughness:.6}),DK=M(0x26282b,{roughness:.6}),CON=M(0x9a948a,{roughness:.95});
 /* the shell, ribs, end walls (as the airfield hangar, bigger) */
 {const o=afArch(W,HW,RISE,32),i=afArch(W-.5,HW,RISE-.2,32);const sh=new THREE.Shape();sh.moveTo(-W/2,0);for(const p of o)sh.lineTo(p[0],p[1]);sh.lineTo(W/2,0);sh.lineTo(W/2-.25,0);for(const p of i.slice().reverse())sh.lineTo(p[0],p[1]);sh.lineTo(-W/2+.25,0);sh.lineTo(-W/2,0);
  const ge=new THREE.ExtrudeGeometry(sh,{depth:D,bevelEnabled:false});ge.translate(0,0,-D/2);{const uv=ge.attributes.uv;for(let j=0;j<uv.count;j++)uv.setXY(j,uv.getX(j)*.1,uv.getY(j)*.1)}const m=new THREE.Mesh(ge,SK);m.position.set(hx,0,hz);g.add(m);
  for(let z=z0;z<=z1+.01;z+=6){const rg=new THREE.Shape();rg.moveTo(-W/2-.15,0);for(const p of afArch(W+.3,HW,RISE+.15,32))rg.lineTo(p[0],p[1]);rg.lineTo(W/2+.15,0);rg.lineTo(W/2,0);for(const p of o.slice().reverse())rg.lineTo(p[0],p[1]);rg.lineTo(-W/2-.15,0);const re=new THREE.ExtrudeGeometry(rg,{depth:.25,bevelEnabled:false});re.translate(0,0,-.125);const rm=new THREE.Mesh(re,STL);rm.position.set(hx,0,Math.min(Math.max(z,z0+.13),z1-.13));g.add(rm)}}
 const prof=afArch(W-.5,HW,RISE-.2,32);
 {const sh=new THREE.Shape();sh.moveTo(-W/2+.25,0);for(const p of prof)sh.lineTo(p[0],p[1]);sh.lineTo(W/2-.25,0);sh.lineTo(-W/2+.25,0);const ge=new THREE.ShapeGeometry(sh);{const uv=ge.attributes.uv;for(let j=0;j<uv.count;j++)uv.setXY(j,uv.getX(j)*.1,uv.getY(j)*.1)}const m=new THREE.Mesh(ge,SKF);m.position.set(hx,0,z0+.2);g.add(m)}
 {const sh=new THREE.Shape();sh.moveTo(-W/2+.25,0);sh.lineTo(-DW,0);sh.lineTo(-DW,DH);sh.lineTo(DW,DH);sh.lineTo(DW,0);sh.lineTo(W/2-.25,0);for(const p of prof.slice().reverse())sh.lineTo(p[0],p[1]);sh.lineTo(-W/2+.25,0);const ge=new THREE.ExtrudeGeometry(sh,{depth:.2,bevelEnabled:false});{const uv=ge.attributes.uv;for(let j=0;j<uv.count;j++)uv.setXY(j,uv.getX(j)*.1,uv.getY(j)*.1)}const m=new THREE.Mesh(ge,SKF);m.position.set(hx,0,z1-.4);g.add(m)}
 /* the door: a header beam on outriggers, two great leaves on their track, half open (each covers half its side of the opening) */
 B(46,.6,.75,hx,DH+.3,z1+.175,STL);for(const s of[-1,1]){C(.2,.2,DH+.6,hx+s*22.8,(DH+.6)/2,z1+.25,STL,null,null,10);B(.8,.1,.8,hx+s*22.8,.05,z1+.25,CON);obs.push({x0:hx+s*22.8-.35,x1:hx+s*22.8+.35,z0:z1-.1,z1:z1+.6})}/* the track beam and the leaves sit right against the front wall (its face is z1 - .2) */
 for(const s of[-1,1]){const x=hx+s*(DW+.5),z=z1-.05+(s<0?0:.3);B(10.9,DH-.06,.2,x,DH/2+.03,z,SKF);/* inside its frame, so no face lines up with the stiles' or rails' */for(const y of[.15,DH/2,DH-.1])B(11.04,.2,.28,x,y,z,STL);for(const e of[-1,0,1])B(.2,DH,.28,x+e*5.4,DH/2+.03,z,STL);B(.12,1.2,.1,x-s*5.2,1.4,z+.2,YL);obs.push({x0:x-5.5,x1:x+5.5,z0:z-.2,z1:z+.2})}
 /* the name above the door *//* 14 x 2.2, its top corners under the arch (15.5 high at x ±7) */B(14,2.2,.15,hx,DH+2.0,z1-.15,M(0x2a2a3a));L('HANGAR 18',12.5,1.1,null,'#ffffff',90,hx,DH+2.4,z1-.07,0);L('DARK PROJECTS DIVISION',12.5,.5,null,'#ffd040',70,hx,DH+1.4,z1-.07,0);
 obs.push({x0:hx-W/2-.1,x1:hx-W/2+.4,z0,z1},{x0:hx+W/2-.4,x1:hx+W/2+.1,z0,z1},{x0:hx-W/2,x1:hx+W/2,z0:z0-.1,z1:z0+.4},{x0:hx-W/2,x1:hx-DW,z0:z1-.5,z1:z1},{x0:hx+DW,x1:hx+W/2,z0:z1-.5,z1:z1});
 /* the apron and the floor inside: a hatched landing circle under the saucer, a yellow walkway line */
 {const t=afCanvas(512,256,(x,w,h)=>{afTarmac(x,w,h,'#7a7a78',61);x.strokeStyle='rgba(0,0,0,.25)';x.lineWidth=2;for(let i=0;i<=w;i+=w/10){x.beginPath();x.moveTo(i,0);x.lineTo(i,h);x.stroke()}for(let i=0;i<=h;i+=h/3.4){x.beginPath();x.moveTo(0,i);x.lineTo(w,i);x.stroke()}x.fillStyle='#e8c030';for(let i=0;i<10;i++){x.fillRect(w/2-60+i*13,h-20,6,20)}});afPlane(g,hx-W/2,hx+W/2,z1,z1+17,.04,t,-1)}
 {const PX=12,w=(W-.5)*PX,h=(D-.6)*PX;const t=afCanvas(w,h,(x)=>{afTarmac(x,w,h,'#5a5c60',71);x.strokeStyle='rgba(0,0,0,.3)';x.lineWidth=2;for(let i=0;i<=w;i+=6*PX){x.beginPath();x.moveTo(i,0);x.lineTo(i,h);x.stroke()}for(let i=0;i<=h;i+=6*PX){x.beginPath();x.moveTo(0,i);x.lineTo(w,i);x.stroke()}
   const cx=w/2,cy=h/2;x.strokeStyle='#e8c030';x.lineWidth=PX*.5;x.beginPath();x.arc(cx,cy,9*PX,0,7);x.stroke();x.lineWidth=PX*.2;x.beginPath();x.arc(cx,cy,8*PX,0,7);x.stroke();x.save();x.beginPath();x.arc(cx,cy,8*PX,0,7);x.clip();x.strokeStyle='rgba(232,192,48,.35)';x.lineWidth=PX*.4;for(let i=-20*PX;i<20*PX;i+=PX*1.5){x.beginPath();x.moveTo(cx+i,cy-20*PX);x.lineTo(cx+i+20*PX,cy+20*PX);x.stroke()}x.restore();
   x.fillStyle='#e8c030';x.font='bold '+PX*1.6+'px Arial';x.textAlign='center';x.fillText('KEEP CLEAR · DO NOT STAND IN THE LIGHT',cx,cy+10.6*PX);x.fillRect(cx-.15*PX,cy+11.5*PX,.3*PX,h-(cy+11.5*PX))});afPlane(g,hx-W/2+.25,hx+W/2-.25,z0+.2,z1-.4,.06,t,-3)}
 /* lights: rows of high-bay lamps under the arch */{const R=(W*W/4+RISE*RISE)/(2*RISE),cy=HW+RISE-R,archY=d=>cy+Math.sqrt(R*R-d*d);/* lamps hang 1.6 under the roof wherever they are */for(let i=0;i<4;i++)for(const z of[hz-8,hz+8]){const x=hx-18+i*12,yy=archY(Math.abs(x-hx))-1.6;C(.01,.01,1.4,x,yy+.7,z,DK,null,null,4);const sh=new THREE.Mesh(new THREE.ConeGeometry(.6,.45,16,1,true),M(0x3a3e44,{side:THREE.DoubleSide,metalness:.4}));sh.position.set(x,yy,z);g.add(sh);const bl=new THREE.Mesh(new THREE.SphereGeometry(.2,10,6),M(0xd8e8ff,{emissive:0xc0d8ff}));bl.position.set(x,yy-.2,z);g.add(bl)}}
 /* the gantry crane rail along both side walls at 10 m, the bridge parked at the back with its hook *//* rails at 7.5 on brackets off the walls (the arch is 8.9 high there) */for(const s2 of[-1,1]){B(.4,.5,D-1,hx+s2*(W/2-1.6),7.5,hz,STL);for(let z=z0+2;z<z1;z+=6)B(1.2,.2,.2,hx+s2*(W/2-.9),7.3,z,STL)}{const bz=z0+3;B(W-3.2,.6,.6,hx,7.9,bz,YL);B(1.2,.8,1,hx+6,7.3,bz,DK);rod([hx+6,6.9,bz],[hx+6,4.5,bz],.02,DK);const hk=new THREE.Mesh(new THREE.TorusGeometry(.25,.07,6,12,Math.PI*1.4),STL);hk.position.set(hx+6,4.3,bz);g.add(hk)}
 /* the catwalk along the back wall at 6 m, rails, a stair down at the west end */{const cz=z0+1.4,y=6;B(30,.12,2,hx,y,cz,M(0x6a6e74,{metalness:.4}));rod([hx-15,y+1,cz+1],[hx+15,y+1,cz+1],.03,YL);for(let x=hx-15;x<=hx+15;x+=2.5){C(.025,.025,1,x,y+.5,cz+1,YL,null,null,6);rod([x,y-.06,cz+.9],[x,y-.06-1.2,z0+.25],.04,STL)}
  {const sx=hx-16.2,len=Math.hypot(6,7.5),st=B(1.2,.1,len,sx,y/2,cz+3.75-.75,M(0x6a6e74,{metalness:.4}));st.rotation.x=Math.atan2(y,7.5);/* low end at +z, up to the catwalk */for(let j=1;j<=30;j++){const u=(j-.5)/30;B(1.1,.05,.24,sx,u*y+.09,cz+6.75-u*7.5,M(0x8a8e94,{metalness:.3}))}/* treads */for(const e of[-.55,.55]){rod([sx+e,1,cz+6.75],[sx+e,y+1,cz-.75],.025,YL);for(let j=0;j<=6;j++){const u=j/6;const zz=cz+6.75-u*7.5,yb=u*y+.06;C(.018,.018,1-.03,sx+e,yb+.5,zz,YL,null,null,6)}}/* handrails on posts standing on the stair's edge */obs.push({x0:sx-.7,x1:sx+.7,z0:cz-1,z1:cz+7})}}
 /* the console bank on a raised dais, facing the saucer: desks with screens, chairs */{const dz=hz+11,x0=hx-8,x1=hx+8;B(x1-x0+2,.3,4,hx,.15,dz,M(0x3a3c42));obs.push({x0:x0-1,x1:x1+1,z0:dz-.8,z1:dz+.6});for(let i=0;i<5;i++){const x=x0+1.6+i*3.2;B(2.6,.9,.8,x,.75,dz-.4,M(0x2a2c32));const sc=B(.8,.5,.06,x-.6,1.55,dz-.68,M(0x60ffb0,{emissive:0x208050,emissiveIntensity:.8}));const sc2=B(.8,.5,.06,x+.4,1.55,dz-.68,M(0x60a0ff,{emissive:0x204080,emissiveIntensity:.8}));for(const s2 of[sc,sc2])s2.rotation.x=-.2;B(2.4,.03,.4,x,1.21,dz-.25,M(0x1a1a1e));
   const ch=new THREE.Group();ch.position.set(x,.3,dz+.5);g.add(ch);const{B:CB,C:CC}=k.H(ch);CC(.28,.28,.08,0,.5,0,M(0x1a1a1e),null,null,12);CC(.03,.03,.45,0,.25,0,STL,null,null,6);CB(.5,.55,.08,0,.85,.25,M(0x1a1a1e))}
  L('MISSION CONTROL · DO NOT PRESS ANYTHING',8,.4,'#1a1a1e','#ffd040',60,hx,1.45,dz-.82,Math.PI)}
 /* lab benches along the east wall: microscopes, jars, a laptop; a whiteboard with a drawing of the saucer */{const bx=hx+W/2-2.6;for(let i=0;i<3;i++){const z=hz-10+i*5;B(1.4,.9,3.6,bx,.45,z,M(0xd8dcde,{roughness:.5}));B(1.5,.05,3.7,bx,.92,z,M(0x2a2c32));obs.push({x0:bx-.75,x1:bx+.75,z0:z-1.85,z1:z+1.85});
   for(let j=0;j<4;j++){const jz=z-1.2+j*.8;C(.12,.12,.3,bx-.2,1.1,jz,M([0x60ffb0,0xd0a040,0x8a60c0,0x60a0ff][j],{emissive:[0x206040,0x403010,0x302050,0x203050][j],transparent:true,opacity:.75}),null,null,12);C(.13,.13,.05,bx-.2,1.27,jz,M(0x8a8e94,{metalness:.5}),null,null,12)}
   B(.3,.05,.3,bx+.3,.97,z+1.2,DK);C(.03,.03,.35,bx+.35,1.15,z+1.2,DK,null,null,6);C(.06,.06,.15,bx+.3,1.3,z+1.15,DK,null,null,8)}
  B(.08,1.6,3.2,hx+W/2-1.2,2.1,hz+9,M(0xf4f4f0));const wb=k.lab('',3,1.5,'#f4f4f0','#000',10);wb.material=new THREE.MeshBasicMaterial({map:afCanvas(256,128,(x,w,h)=>{x.fillStyle='#f4f4f0';x.fillRect(0,0,w,h);x.strokeStyle='#2a4aa0';x.lineWidth=2;x.beginPath();x.ellipse(100,70,60,14,0,0,7);x.stroke();x.beginPath();x.ellipse(100,60,22,16,0,Math.PI,0);x.stroke();x.fillStyle='#c02020';x.font='bold 16px Arial';x.fillText('?!',180,40);x.fillStyle='#2a4aa0';x.font='12px Arial';x.fillText('fuel: ???',170,80);x.fillText('engine: ???',170,96);x.fillText('pilot: SEE B13',170,112)})});wb.position.set(hx+W/2-1.25,2.1,hz+9);wb.rotation.y=-Math.PI/2;g.add(wb)}
 /* SPECIMEN 13: a tall glass tank of glowing green fluid on a steel base, with pipes; inside floats a small dark shape with two glowing eyes */
 {const tx=hx-12,tz=z0+5;C(1.4,1.5,.6,tx,.3,tz,STL,null,null,24);C(1.4,1.4,.3,tx,4.35,tz,STL,null,null,24);C(1.25,1.25,3.5,tx,2.35,tz,M(0x60ffb0,{emissive:0x208050,emissiveIntensity:.6,transparent:true,opacity:.45,depthWrite:false}),null,null,24);C(1.3,1.3,3.6,tx,2.35,tz,M(0xd8f0f0,{transparent:true,opacity:.15,roughness:.05,depthWrite:false}),null,null,24,true);
  {const sp=new THREE.Group();sp.position.set(tx,2.4,tz);g.add(sp);const bd=new THREE.Mesh(new THREE.SphereGeometry(.45,14,10),M(0x1a2a24,{roughness:.6}));bd.scale.y=1.3;sp.add(bd);for(const e of[-.15,.15]){const ey=new THREE.Mesh(new THREE.SphereGeometry(.07,8,6),M(0xffe060,{emissive:0xffd040}));ey.position.set(e,.15,.4);sp.add(ey)}for(let i=0;i<5;i++){const a=i/5*Math.PI*2;const tt=new THREE.Mesh(new THREE.CylinderGeometry(.06,.02,.9,6),M(0x1a2a24));tt.position.set(Math.cos(a)*.25,-.75,Math.sin(a)*.25);tt.rotation.set(Math.sin(a)*.3,0,Math.cos(a)*.3);sp.add(tt)}sp.userData.dpKeep=1;sp.traverse(m=>m.userData.dpKeep=1)}
  for(const a of[0,2.1,4.2])rod([tx+Math.cos(a)*1.4,4.2,tz+Math.sin(a)*1.4],[tx+Math.cos(a)*3,8,tz+Math.sin(a)*.5-.5],.08,STL);obs.push({x0:tx-1.5,x1:tx+1.5,z0:tz-1.5,z1:tz+1.5});
  B(3,.8,.06,tx,1.6,tz+1.6,M(0x2a2a3a));L('SPECIMEN 13\nDO NOT TOUCH · DO NOT FEED · DO NOT ASK',2.9,.7,'#2a2a3a','#ffd040',44,tx,1.6,tz+1.64,0);B(.06,.6,.06,tx,.9,tz+1.6,STL)}
 /* crates and a sign on the back wall */for(let i=0;i<6;i++){const x=hx+6+(i%3)*2.4,z=z0+2+((i/3)|0)*2.2;B(2,1.6,2,x,.8+((i*5)%3==0&&i>2?1.6:0),z,M(0x5a6a4a,{roughness:.8}));L('DO NOT OPEN',1.6,.3,null,'#f0f0e0',60,x,1.2,z+1.01,0)}obs.push({x0:hx+4.8,x1:hx+12.4,z0:z0+.8,z1:z0+5.4});
 {const s=k.lab('THE DARK PROJECTS DIVISION\nDOES NOT EXIST',4,.8,'#2a2a3a','#ffffff',50);s.position.set(hx+14,3,z0+.32);g.add(s);B(4.1,.9,.04,hx+14,3,z0+.29,M(0x2a2a3a))}
 /* the saucer, its beam */const SC=zfSaucer();SC.g.position.set(hx,6,hz);g.add(SC.g);const beam=new THREE.Mesh(new THREE.ConeGeometry(3,6,24,1,true),new THREE.MeshBasicMaterial({color:0x80ffc0,transparent:true,opacity:.18,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}));beam.position.set(hx,3.1,hz);beam.userData.dpKeep=1;g.add(beam);
 obs.push({x0:hx-2,x1:hx+2,z0:hz-2,z1:hz+2});
 g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{obs,saucer:SC.g,beam,rim:SC.rim,dome:SC.dome,hatch:SC.hatch}}

/* ---- batch 3: the barracks, the mess hall (with the grey visitor), Building 13 and the radar ----
   zfHut(g, x0, x1, z0, z1, name)  a curved-roof (Quonset) hut, door in the middle of its south side (+z, facing
                  the inside road), windows along that side, steps, a vent pipe, a name board. Returns {obs, door}.
   zfBarracks(g)  Barracks D (x -581..-559) with bunks, lockers and a flag inside; the mess hall (x -555..-544)
                  with a counter, tables and the visitor. z -1806.5..-1797.5. Returns {obs, visitor} (visitor: the
                  Group of the small grey guest at his table, for a talk prop).
   zfVisitor()    our own small grey visitor: a big smooth head, large dark eyes, a little body in a jumpsuit, sitting.
   zfB13(g)       Building 13 (x -528..-500, z -1814..-1796): a low windowless concrete lab, blast door to the road
                  (+z side), radiation and biohazard signs, roof vents and a chimney. The roof is open to the
                  preview camera only; inside: specimen jars on shelves, a covered table, glowing vats, a wall of
                  monitors. Returns {obs, vats} (vats: glow materials to pulse).
   zfRadar(g)     the radar dish on a turning mount at (-603, -1808) (returns `dish`, spin rotation.y), and the white
                  radome on its tower at (-612, -1822). Returns {obs, dish}. */
function zfHut(g,x0,x1,z0,z1,name,col){const k=zfKit(),{B,C,rod,L}=k.H(g),M=k.M,obs=[],W=z1-z0,R=W/2,xc=(x0+x1)/2,zc=(z0+z1)/2,LEN=x1-x0;
 const SK=afCorr(k,col||'#7a7e6a',[LEN/.6,1]);const STL=M(0x4a4e54,{metalness:.4,roughness:.5}),CON=M(0x9a948a,{roughness:.95});
 /* the shell: a half cylinder along x on a low concrete footing */
 {const ge=new THREE.CylinderGeometry(R,R,LEN,32,1,true,0,Math.PI);ge.rotateZ(Math.PI/2);/* the upper half, arching over */const m=new THREE.Mesh(ge,SK);m.position.set(xc,.3,zc);g.add(m)}
 B(LEN+.2,.3,W+.2,xc,.15,zc,CON);
 /* the end walls: flat half-discs with a window */for(const ex of[x0,x1]){const d=new THREE.Mesh(new THREE.CircleGeometry(R,32,0,Math.PI),M(0xc8c4b4,{roughness:.8,side:THREE.DoubleSide}));d.rotation.y=Math.PI/2;d.position.set(ex,.3,zc);g.add(d);for(const o of[-1,1]){/* a framed window on both faces, standing off the wall */B(.03,.9,1.3,ex+o*.025,2.2,zc,STL);B(.01,.76,1.16,ex+o*.045,2.2,zc,M(0x334a5c,{metalness:.3,roughness:.1}))}}
 /* the door porch on the south side: a little gabled entry box, a door, steps, a lamp */{const pz=z1,px=xc;B(2.2,2.6,1.4,px,1.6,pz-.4,M(0xc8c4b4,{roughness:.8}));{const sh2=new THREE.Shape();sh2.moveTo(-1.3,0);sh2.lineTo(1.3,0);sh2.lineTo(0,.7);sh2.lineTo(-1.3,0);const rg=new THREE.ExtrudeGeometry(sh2,{depth:1.6,bevelEnabled:false});const r=new THREE.Mesh(rg,afCorr(k,'#5a5e60',[4,1]));r.position.set(px,2.9,pz-1.2);g.add(r)}
  B(1.0,2.0,.06,px,1.3,pz+.31,M(0x3a4a3a));C(.035,.035,.06,px+.35,1.3,pz+.35,STL,'z',null,8);for(let i=0;i<2;i++)B(1.6,.15,.35,px,.075+i*.15,pz+.5+.35*(1-i),CON);C(.08,.06,.12,px-.8,2.1,pz+.4,M(0xfff4d0,{emissive:0xffe0a0,emissiveIntensity:.9}),null,null,10);B(.08,.08,.12,px-.8,2.1,pz+.34,M(0x3a3e34));
  B(2.1,.32,.04,px,2.58,pz+.32,M(0x3a3e34));L(name,2.0,.26,null,'#f0e8c0',60,px,2.58,pz+.345,0)}/* the name board over the door, under the porch roof */
 /* windows along the south side, set into the curve at 1.6 m */for(let x=x0+2;x<x1-1;x+=3.6){if(Math.abs(x-xc)<2)continue;const a=Math.acos(Math.min(1,(1.6-.3)/R)),wz=zc+Math.sin(a)*R;const w=B(1.1,.7,.06,x,1.6+.3*0,wz,M(0x334a5c,{metalness:.3,roughness:.1}));w.position.z=wz+.02;w.rotation.x=-(Math.PI/2-a)}
 C(.1,.1,1,x0+2,R+.6,zc-1,STL,null,null,8);C(.18,.14,.15,x0+2,R+1.15,zc-1,STL,null,null,8);
 obs.push({x0,x1,z0,z1},{x0:xc-1.1,x1:xc+1.1,z0:z1,z1:z1+.3});g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{obs}}

function zfVisitor(){const k=zfKit(),M=k.M,g=new THREE.Group();const SKIN=M(0x9aa4a8,{roughness:.55}),SUIT=M(0x5a6a7a,{roughness:.6}),EYE=M(0x101418,{roughness:.1,metalness:.3});
 /* sitting: hips at y .45; a slim torso, a long neck, a big smooth head wider at the top, almond eyes */
 const t=new THREE.Mesh(new THREE.CylinderGeometry(.13,.17,.5,12),SUIT);t.position.y=.72;g.add(t);for(const s of[-1,1]){const th=new THREE.Mesh(new THREE.CylinderGeometry(.055,.05,.42,8),SUIT);th.rotation.x=Math.PI/2;th.position.set(s*.08,.47,.2);g.add(th);const sh=new THREE.Mesh(new THREE.CylinderGeometry(.045,.04,.42,8),SUIT);sh.position.set(s*.08,.25,.42);g.add(sh);const ft=new THREE.Mesh(new THREE.SphereGeometry(.06,8,6),SKIN);ft.scale.set(1,.5,1.6);ft.position.set(s*.08,.04,.46);g.add(ft)}
 for(const s of[-1,1]){const ua=new THREE.Mesh(new THREE.CylinderGeometry(.035,.03,.3,8),SUIT);ua.position.set(s*.17,.82,.04);ua.rotation.z=s*.15;g.add(ua);const fa=new THREE.Mesh(new THREE.CylinderGeometry(.03,.025,.3,8),SKIN);fa.rotation.x=Math.PI/2.4;fa.position.set(s*.16,.68,.2);g.add(fa);for(let f=0;f<3;f++){const fi=new THREE.Mesh(new THREE.CylinderGeometry(.008,.006,.09,5),SKIN);fi.rotation.x=Math.PI/2;fi.position.set(s*.16+(f-1)*.018,.64,.36);g.add(fi)}}
 const nk=new THREE.Mesh(new THREE.CylinderGeometry(.035,.045,.16,8),SKIN);nk.position.y=1.03;g.add(nk);
 const hd=new THREE.Mesh(new THREE.SphereGeometry(.2,20,16),SKIN);hd.scale.set(1.05,1.25,1.05);hd.position.y=1.28;g.add(hd);const ch=new THREE.Mesh(new THREE.ConeGeometry(.13,.2,16),SKIN);ch.rotation.x=Math.PI;ch.position.set(0,1.1,.03);g.add(ch);
 for(const s of[-1,1]){const e=new THREE.Mesh(new THREE.SphereGeometry(.07,14,10),EYE);e.scale.set(1.3,.7,.5);e.position.set(s*.085,1.27,.185);e.rotation.z=s*-.45;g.add(e);const gl=new THREE.Mesh(new THREE.SphereGeometry(.012,6,4),M(0xffffff,{emissive:0xffffff}));gl.position.set(s*.085+.02,1.29,.215);g.add(gl)}
 {const m=new THREE.Mesh(new THREE.TorusGeometry(.025,.004,4,10,Math.PI),EYE);m.rotation.z=Math.PI;m.position.set(0,1.15,.18);g.add(m)}
 /* a little badge on the suit */const bd=k.lab('VISITOR',.12,.04,'#f0e8c0','#1a1a1a',60);bd.position.set(.07,.82,.135);g.add(bd);
 g.traverse(m=>{if(m.isMesh){m.userData.noSeam=true;m.userData.dpKeep=1}});return g}

function zfBarracks(g){const k=zfKit(),{B,C,rod,L}=k.H(g),M=k.M,obs=[],z0=-1806.5,z1=-1797.5,zc=(z0+z1)/2,STL=M(0x5a6a4a,{metalness:.3,roughness:.5}),WD=M(0x8a6a48,{roughness:.8}),BL=M(0x4a5a3a,{roughness:1});/* the kit has no board material here, so plain wood */
 const A=zfHut(g,-581,-559,z0,z1,'BARRACKS D','#6a7258'),Bm=zfHut(g,-555,-544,z0,z1,'MESS HALL (DARK MEALS)','#727a62');obs.push(...A.obs,...Bm.obs);
 /* inside the barracks: bunks along the back, a locker row, a flag; floor */{const t=afCanvas(128,128,(x,w,h)=>{afTarmac(x,w,h,'#8a8478',81)});t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(4,2);afPlane(g,-581,-559,z0+.1,z1-.1,.31,t,-2)}
 for(let i=0;i<5;i++){const x=-578+i*4.2,z=z0+1.4;for(const y of[.6,1.6]){B(2,.12,.9,x,y,z,BL);B(2,.08,.9,x,y+.1,z,M(0xd8d0b8,{roughness:1}));B(.4,.1,.6,x-.75,y+.18,z,M(0xf0ece4))}for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])B(.05,1.9,.05,x+a*.98,.95+.3,z+b*.42,STL)}
 for(let i=0;i<8;i++)B(.5,1.8,.5,-579.5+i*.55,1.2,z1-1.2,STL);obs.push({x0:-580,x1:-575.4,z0:z1-1.5,z1:z1-.9});
 /* inside the mess hall: a serving counter, two long tables with benches, the visitor at the far end of one */{const t=afCanvas(128,128,(x,w,h)=>{x.fillStyle='#d8d0c0';x.fillRect(0,0,w,h);x.fillStyle='#b8a888';for(let i=0;i<8;i++)for(let j=0;j<8;j++)if((i+j)%2)x.fillRect(i*16,j*16,16,16)});t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(3,2);afPlane(g,-555,-544,z0+.1,z1-.1,.31,t,-2)}
 B(4,1.0,.7,-549.5,.8,z0+1.0,M(0xb8bcc0,{metalness:.3}));B(4.1,.05,.8,-549.5,1.32,z0+1.0,M(0x9a9ea4,{metalness:.4}));for(let i=0;i<4;i++){B(.6,.12,.4,-551+i*1,1.4,z0+1.0,M(0x8a8e94,{metalness:.4}))}
 let visitor;for(const tz of[zc-.2,zc+1.8]){const tx=-551;B(4,.06,.9,tx,1.05,tz,WD);for(const e of[-1.8,1.8])B(.08,.72,.8,tx+e,.66,tz,M(0x3a3e42));for(const s of[-1,1]){B(4,.06,.3,tx,.72,tz+s*.7,WD);for(const e of[-1.8,1.8])B(.06,.42,.06,tx+e,.51,tz+s*.7,M(0x3a3e42))}obs.push({x0:tx-2,x1:tx+2,z0:tz-.9,z1:tz+.9})}
 {visitor=zfVisitor();visitor.position.set(-549.6,.35,zc+1.8+.72);/* his thighs rest on the bench top (.75) */visitor.rotation.y=Math.PI;g.add(visitor);/* his tray: a jelly in a bowl, a cup */B(.4,.03,.3,-549.6,1.1,zc+1.8+.1,M(0x7a8a9a));C(.08,.06,.06,-549.5,1.14,zc+1.8+.1,M(0x60ffb0,{emissive:0x208050,transparent:true,opacity:.85}),null,null,12);C(.05,.04,.1,-549.75,1.16,zc+1.8+.05,M(0xf0ece4),null,null,10)}
 L('TODAY: MYSTERY MEAT\n(WE GENUINELY DO NOT KNOW)',2.6,.6,'#1a1a1e','#f0e0a0',44,-549.5,2.6,z0+.6,0);
 g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{obs,visitor}}

function zfB13(g){const k=zfKit(),{B,C,rod,L}=k.H(g),M=k.M,obs=[],X0=-528,X1=-500,Z0=-1814,Z1=-1796,H=4,xc=(X0+X1)/2,zc=(Z0+Z1)/2,T=.4;
 const CN=M(0xffffff,{roughness:.95});CN.map=afCanvas(256,256,(x,w,h)=>{afTarmac(x,w,h,'#a8a49a',91);x.strokeStyle='rgba(0,0,0,.18)';x.lineWidth=2;for(let i=0;i<=h;i+=h/4){x.beginPath();x.moveTo(0,i);x.lineTo(w,i);x.stroke()}for(let i=0;i<=w;i+=w/3){x.beginPath();x.moveTo(i,0);x.lineTo(i,h);x.stroke()}});CN.userData.s=.25;
 const STL=M(0x4a4e54,{metalness:.4,roughness:.5}),YB=M(0xe8c020,{roughness:.6});
 /* the walls (a gap for the blast door at x xc±1.6 on the +z side), a thick roof slab with a parapet */
 B(X1-X0,H,T,xc,H/2,Z0+T/2,CN);B(T,H,Z1-Z0,X0+T/2,H/2,zc,CN);B(T,H,Z1-Z0,X1-T/2,H/2,zc,CN);B(xc-1.6-X0,H,T,(X0+xc-1.6)/2,H/2,Z1-T/2,CN);B(X1-(xc+1.6),H,T,(xc+1.6+X1)/2,H/2,Z1-T/2,CN);B(3.2,H-2.8,T,xc,(H+2.8)/2,Z1-T/2,CN);
 const roof=B(X1-X0+.4,.4,Z1-Z0+.4,xc,H+.2,zc,CN);roof.userData.b13roof=1;for(const[w,d,x,z]of[[X1-X0+.4,.25,xc,Z0-.075],[X1-X0+.4,.25,xc,Z1+.075],[.25,Z1-Z0+.4,X0-.075,zc],[.25,Z1-Z0+.4,X1+.075,zc]]){const p=B(w,.5,d,x,H+.65,z,CN);p.userData.b13roof=1}
 /* the blast door: a thick steel slab in a deep frame, hazard stripes, a wheel, a keypad, a lamp */
 {const z=Z1;B(3.4,3,.6,xc,1.5,z+.1,STL).scale.set(1,1,1);B(3.0,2.7,.25,xc,1.35,z+.42,M(0x6a6e74,{metalness:.4,roughness:.4}));/* the door leaf stands proud of the frame's face (.4) so its edges show */const hz=afCanvas(128,32,(x,w,h)=>{for(let i=-32;i<w+32;i+=16){x.fillStyle='#e8c020';x.beginPath();x.moveTo(i,0);x.lineTo(i+8,0);x.lineTo(i+8+h,h);x.lineTo(i+h,h);x.fill();x.fillStyle='#1a1a1a';x.beginPath();x.moveTo(i+8,0);x.lineTo(i+16,0);x.lineTo(i+16+h,h);x.lineTo(i+8+h,h);x.fill()}});const hm=new THREE.Mesh(new THREE.PlaneGeometry(3,.3),new THREE.MeshBasicMaterial({map:hz}));hm.position.set(xc,.2,z+.55);g.add(hm);
  const wh=new THREE.Mesh(new THREE.TorusGeometry(.35,.05,8,20),M(0xc0c4c8,{metalness:.5}));wh.position.set(xc,1.4,z+.6);g.add(wh);for(let i=0;i<3;i++){const sp=B(.06,.7,.06,xc,1.4,z+.6,M(0xc0c4c8,{metalness:.5}));sp.rotation.z=i*Math.PI/3}
  B(.3,.45,.08,xc+2.1,1.4,z+.04,M(0x1a1a1e));for(let i=0;i<3;i++)for(let j=0;j<4;j++)B(.05,.05,.02,xc+2.02+i*.08,1.3+j*.07,z+.09,M(0x8a8e94));B(.18,.06,.02,xc+2.1,1.55,z+.09,M(0xff3030,{emissive:0xff1010}));
  /* the lamp sits on top of the door frame; the name board is fixed flat to the wall above it */C(.14,.16,.08,xc,3.04,z+.1,STL,null,null,12);{const lm=new THREE.Mesh(new THREE.SphereGeometry(.13,12,8,0,Math.PI*2,0,Math.PI/2),M(0xff3020,{emissive:0xff1000,emissiveIntensity:.8}));lm.position.set(xc,3.08,z+.1);g.add(lm)}B(3.1,.6,.04,xc,3.62,z+.02,M(0x1a1a1e));L('BUILDING 13',3,.5,null,'#ffd040',70,xc,3.62,z+.045,0);obs.push({x0:xc-1.7,x1:xc+1.7,z0:z-.2,z1:z+.6})}
 /* signs */const sgn=(x,t,c)=>{const s=k.lab(t,1.2,1.2,'#f4f0e4',c,40);s.position.set(x,2.2,Z1+.02);g.add(s)};sgn(xc-5,'☢\nRADIATION\nAREA','#1a1a1a');sgn(xc+5,'☣\nBIOHAZARD\nKEEP OUT','#c01818');sgn(xc-10,'NO\nPHOTOS\nNO\nQUESTIONS','#1a1a1a');
 /* roof: three mushroom vents and a short stack */for(const x of[xc-8,xc,xc+8]){C(.25,.25,.6,x,H+.7,zc-3,STL,null,null,12);C(.45,.3,.25,x,H+1.1,zc-3,STL,null,null,12)}C(.4,.45,2.5,X0+3,H+1.45,Z0+3,CN,null,null,14);C(.48,.48,.15,X0+3,H+2.7,Z0+3,STL,null,null,14);
 /* inside: a sealed floor, shelves of specimen jars, a covered table, glowing vats, a wall of monitors */
 {const t=afCanvas(256,128,(x,w,h)=>{afTarmac(x,w,h,'#c8ccc8',95);x.strokeStyle='rgba(0,0,0,.2)';for(let i=0;i<=w;i+=w/7){x.beginPath();x.moveTo(i,0);x.lineTo(i,h);x.stroke()}});afPlane(g,X0+T,X1-T,Z0+T,Z1-T,.06,t,-3)}
 for(let i=0;i<4;i++){const x=X0+2+i*2.6;for(const y of[.6,1.3,2.0,2.7])B(2.4,.05,.6,x,y,Z0+T+.32,STL);for(let j=0;j<12;j++){const jx=x-1+(j%4)*.65,y=[.6,1.3,2.0][(j/4)|0];C(.11,.11,.32,jx,y+.19,Z0+T+.32,M([0x60ffb0,0xd0c060,0xb080e0,0x80c0ff][(i+j)%4],{transparent:true,opacity:.7,emissive:[0x103020,0x302810,0x201030,0x102030][(i+j)%4]}),null,null,10);C(.12,.12,.04,jx,y+.37,Z0+T+.32,STL,null,null,10)}}
 obs.push({x0:X0+.6,x1:X0+11.4,z0:Z0+.4,z1:Z0+1.1});
 {const x=xc,z=zc;B(2.2,.08,1,x,.95,z,M(0xc8ccd0,{metalness:.4}));for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])C(.04,.04,.9,x+a*1,.45,z+b*.42,STL,null,null,8);const sh=new THREE.Mesh(new THREE.SphereGeometry(.5,16,8,0,Math.PI*2,0,Math.PI/2),M(0xe8ece8,{roughness:1}));sh.scale.set(2,.5,.8);sh.position.set(x,1,z);g.add(sh);B(2.4,.5,1.1,x,.73,z,M(0xe8ece8,{roughness:1,transparent:true,opacity:.95})).scale.set(1,1,1);obs.push({x0:x-1.2,x1:x+1.2,z0:z-.6,z1:z+.6});
  const tg=k.lab('TOE TAG:\nDO NOT LIFT\nTHE SHEET',.3,.2,'#f4f0e4','#1a1a1a',40);tg.position.set(x+1.21,.9,z);tg.rotation.y=Math.PI/2;g.add(tg)}
 const vats=[];for(let i=0;i<3;i++){const x=X1-3,z=Z0+3+i*4;C(1,1.1,.4,x,.2,z,STL,null,null,20);const vm=M(0x60ffb0,{emissive:0x30c080,emissiveIntensity:.7,transparent:true,opacity:.6,depthWrite:false});vats.push(vm);C(.9,.9,2.4,x,1.6,z,vm,null,null,20);C(.95,.95,2.5,x,1.6,z,M(0xd8f0f0,{transparent:true,opacity:.12,depthWrite:false}),null,null,20,true);C(1,1,.3,x,2.95,z,STL,null,null,20);rod([x,3.1,z],[x,H-.1,z],.08,STL);obs.push({x0:x-1.1,x1:x+1.1,z0:z-1.1,z1:z+1.1})}
 {const x=X0+T+.06,z=zc+3;B(.1,2.4,5,x,2.0,z,M(0x1a1a1e));for(let i=0;i<3;i++)for(let j=0;j<2;j++){const s=B(.04,.95,1.5,x+.07,1.4+j*1.05,z-1.65+i*1.65,M([0x60ffb0,0x60a0ff,0xff6080][(i+j)%3],{emissive:[0x208050,0x204080,0x802030][(i+j)%3],emissiveIntensity:.8}))}B(1,.9,4.6,X0+T+1.2,.45,z,M(0x3a3c42));obs.push({x0:X0,x1:X0+T+1.7,z0:z-2.5,z1:z+2.5})}
 obs.push({x0:X0,x1:X1,z0:Z0,z1:Z0+T},{x0:X0,x1:X0+T,z0:Z0,z1:Z1},{x0:X1-T,x1:X1,z0:Z0,z1:Z1},{x0:X0,x1:xc-1.6,z0:Z1-T,z1:Z1},{x0:xc+1.6,x1:X1,z0:Z1-T,z1:Z1});
 g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{obs,vats}}

function zfRadar(g){const k=zfKit(),{B,C,rod,L}=k.H(g),M=k.M,obs=[],STL=M(0x6a6e74,{metalness:.35,roughness:.45}),CON=M(0x9a948a,{roughness:.95}),WH=M(0xe8ecec,{roughness:.6,metalness:.1});
 /* the dish: a concrete plinth, a turning base (dish group), a yoke, a parabolic dish of panels with a feed on struts */
 const rx=-603,rz=-1808;C(2,2.2,1.2,rx,.6,rz,CON,null,null,20);obs.push({x0:rx-2.1,x1:rx+2.1,z0:rz-2.1,z1:rz+2.1});
 const dish=new THREE.Group();dish.position.set(rx,1.2,rz);g.add(dish);const{B:DB,C:DC,rod:DR}=k.H(dish);DC(1.2,1.4,.8,0,.4,0,STL,null,null,16);for(const s of[-1,1])DB(.3,2.4,.5,s*1.1,1.9,0,STL);
 {const tilt=new THREE.Group();tilt.position.set(0,2.9,0);tilt.rotation.x=-.6;dish.add(tilt);const pts=[];for(let i=0;i<=10;i++){const r=i/10*4.5;pts.push(new THREE.Vector2(r,r*r/9))}const dg=new THREE.LatheGeometry(pts,40);const dm=new THREE.Mesh(dg,M(0xe0e4e4,{roughness:.5,metalness:.15,side:THREE.DoubleSide}));tilt.add(dm);/* ribs on the back of the dish, following its curve */for(let i=0;i<12;i++){const a=i/12*Math.PI*2,pts2=[];for(let j=0;j<=8;j++){const r=j/8*4.5;pts2.push(new THREE.Vector3(Math.cos(a)*r,r*r/9-.08,Math.sin(a)*r))}const rib=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts2),8,.05,4),STL);tilt.add(rib)}
  const rim=new THREE.Mesh(new THREE.TorusGeometry(4.5,.06,6,40),STL);rim.rotation.x=Math.PI/2;rim.position.y=2.25;tilt.add(rim);for(let i=0;i<3;i++){const a=i/3*Math.PI*2;const r=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,4.2,6),STL);const p0=new THREE.Vector3(Math.cos(a)*4.4,2.25,Math.sin(a)*4.4),p1=new THREE.Vector3(0,3.4,0);r.position.copy(p0).add(p1).multiplyScalar(.5);r.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),p1.clone().sub(p0).normalize());tilt.add(r)}const fd=new THREE.Mesh(new THREE.CylinderGeometry(.2,.3,.6,12),STL);fd.position.y=3.5;tilt.add(fd);const ax=new THREE.Mesh(new THREE.CylinderGeometry(.15,.15,2.5,10),STL);ax.rotation.z=Math.PI/2;ax.position.y=-.3;tilt.add(ax);/* the tilt axle sits behind the dish, not through its face */}
 dish.traverse(m=>{m.userData.dpKeep=1});
 /* the radome: a lattice tower with a white ball on top */{const x=-612,z=-1822,H=6;for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])rod([x+a*1.8,0,z+b*1.8],[x+a*1.3,H,z+b*1.3],.12,STL);for(const y of[2,4]){const r=1.8-.5*y/H;for(let i=0;i<4;i++){const c=[[-1,-1],[1,-1],[1,1],[-1,1]],[a,b]=c[i],[cc,d]=c[(i+1)%4];rod([x+a*r,y,z+b*r],[x+cc*r,y,z+d*r],.06,STL)}}B(3.2,.3,3.2,x,H,z,STL);
  const ball=new THREE.Mesh(new THREE.SphereGeometry(2.6,32,24),M(0xffffff,{roughness:.7}));ball.material.map=afCanvas(256,128,(c,w,h)=>{c.fillStyle='#f0f2f0';c.fillRect(0,0,w,h);c.strokeStyle='rgba(120,130,130,.4)';c.lineWidth=1;for(let i=0;i<=w;i+=w/16){c.beginPath();c.moveTo(i,0);c.lineTo(i,h);c.stroke()}for(let i=0;i<=h;i+=h/8){c.beginPath();c.moveTo(0,i);c.lineTo(w,i);c.stroke()}});ball.position.set(x,H+2.5,z);g.add(ball);
  C(.06,.06,1.2,x,H+5.6,z,STL,null,null,6);{const b=new THREE.Mesh(new THREE.SphereGeometry(.1,8,6),M(0xff2010,{emissive:0xff0000}));b.position.set(x,H+6.25,z);g.add(b)}for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])B(.6,.3,.6,x+a*1.8,.15,z+b*1.8,CON);obs.push({x0:x-2.1,x1:x+2.1,z0:z-2.1,z1:z+2.1})}
 g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{obs,dish}}

/* ---- batch 4: the helipad, the motor pool, the floodlights, the fuel dump ----
   zfHelipad(g)   at (-505, -1932), radius 8: a raised concrete disc, the H in a circle, edge lights, a windsock.
                  Returns {obs, sock} (sock: the sock Group, swing rotation.y like the airfield's).
   zfMotorPool(g) x -525..-505, z -1852..-1840: a carport canopy on posts, two white unmarked pickups (models only,
                  built here), a fuel can rack, oil stains. Returns {obs}.
   zfFloods(g)    five floodlight masts along the south fence (as the game's), lamp heads angled into the base.
   zfFuel(g)      x -618..-604, z -1946..-1938: two horizontal tanks in a bund, a pump, drums. Returns {obs}. */
function zfHelipad(g){const k=zfKit(),{B,C,rod,L}=k.H(g),M=k.M,obs=[],x=-505,z=-1932,R=8,CON=M(0xa8a49c,{roughness:.95});
 C(R,R+.2,.3,x,.15,z,CON,null,null,48);const t=afCanvas(512,512,(c,w,h)=>{afTarmac(c,w,h,'#7a7a7c',111);c.strokeStyle='#f0ece0';c.lineWidth=12;c.beginPath();c.arc(w/2,h/2,w*.4,0,7);c.stroke();c.fillStyle='#f0ece0';c.font='bold 300px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText('H',w/2,h/2+10);c.strokeStyle='#e8c030';c.lineWidth=6;c.beginPath();c.arc(w/2,h/2,w*.48,0,7);c.stroke()});
 const top=new THREE.Mesh(new THREE.CircleGeometry(R-.05,48),new THREE.MeshStandardMaterial({map:t,roughness:1,polygonOffset:true,polygonOffsetUnits:-2}));top.rotation.x=-Math.PI/2;top.position.set(x,.305,z);g.add(top);
 for(let i=0;i<16;i++){const a=i/16*Math.PI*2;C(.1,.12,.12,x+Math.cos(a)*(R-.3),.36,z+Math.sin(a)*(R-.3),M(0x40ff70,{emissive:0x20ff60,emissiveIntensity:.9}),null,null,10)}
  /* a ramp up the .3 step on the road side */{const rp=B(2.4,.06,3,x,.15,z+R+1.2,CON);rp.rotation.x=.1}
 /* the windsock */const wx=x+R+3,wz=z-4;C(.05,.06,4,wx,2,wz,M(0xd8dce0,{metalness:.3}),null,null,8);B(.6,.15,.6,wx,.075,wz,CON);const sock=new THREE.Group();sock.position.set(wx,3.9,wz);g.add(sock);{const so=new THREE.Group();so.position.x=.3;so.rotation.z=Math.PI/2-.25;sock.add(so);for(let i=0;i<4;i++){const sg=new THREE.Mesh(new THREE.CylinderGeometry(.28-i*.05,.28-(i+1)*.05,.4,12,1,true),M(i%2?0xffffff:0xff5a10,{side:THREE.DoubleSide}));sg.position.y=-.2-i*.4;so.add(sg)}const rg=new THREE.Mesh(new THREE.TorusGeometry(.28,.025,6,14),M(0xd8dce0));rg.rotation.z=Math.PI/2;rg.position.x=.3;sock.add(rg)}sock.traverse(m=>m.userData.dpKeep=1);
 obs.push({x0:wx-.2,x1:wx+.2,z0:wz-.2,z1:wz+.2});g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{obs,sock}}

/* a white unmarked pickup, built facing +z, wheels on y 0 (about 5.2 long) */
function zfPickup(){const k=zfKit(),M=k.M,g=new THREE.Group(),{B,C}=k.H(g),W=M(0xeef0f0,{roughness:.4,metalness:.2}),DK=M(0x1a1a1c,{roughness:.6}),GL=M(0x1a2a34,{metalness:.3,roughness:.1}),TR=M(0x3a3c40,{roughness:.6});
 B(1.9,.55,5.2,0,.75,0,W);
 /* the cab: a side profile (rear wall, roof, sloped windscreen down to the bonnet) pushed across the width */
 {const GLD=GL.clone();GLD.side=THREE.DoubleSide;const sh=new THREE.Shape();sh.moveTo(-.55,1.02);sh.lineTo(1.55,1.02);sh.lineTo(1.0,1.9);sh.lineTo(-.55,1.9);sh.lineTo(-.55,1.02);const ge=new THREE.ExtrudeGeometry(sh,{depth:1.86,bevelEnabled:false});ge.translate(0,0,-.93);const cb=new THREE.Mesh(ge,W);cb.rotation.y=-Math.PI/2;g.add(cb);
  /* glass laid on its faces: the windscreen on the slope, the back window, a side window each side */const sl=Math.hypot(.55,.88),ang=Math.atan2(.55,.88);const ws=new THREE.Mesh(new THREE.PlaneGeometry(1.66,sl-.16),GL);ws.position.set(0,1.46,1.275+.012*Math.cos(ang));ws.rotation.x=-ang;ws.position.y+=.012*Math.sin(ang);g.add(ws);
  const bw=new THREE.Mesh(new THREE.PlaneGeometry(1.5,.5),GL);bw.position.set(0,1.55,-.562);bw.rotation.y=Math.PI;g.add(bw);
  for(const s of[-1,1]){const sw=new THREE.Shape();sw.moveTo(-.4,1.2);sw.lineTo(1.2,1.2);sw.lineTo(.92,1.78);sw.lineTo(-.4,1.78);sw.lineTo(-.4,1.2);const swm=new THREE.Mesh(new THREE.ShapeGeometry(sw),GLD);swm.rotation.y=-Math.PI/2;/* the shape's x runs to +z (the front), like the cab's */swm.position.x=s*.942;g.add(swm)}}
 B(1.9,.06,2.6,0,1.05,-1.25,DK);for(const s of[-1,1])B(.06,.4,2.6,s*.9,1.235,-1.25,W);/* bed sides inside the body's line, so their faces don't share it */B(1.9,.4,.06,0,1.22,-2.57,W);
 B(1.95,.25,.15,0,.55,2.62,TR);B(1.95,.25,.15,0,.55,-2.62,TR);for(const s of[-1,1]){B(.4,.15,.04,s*.65,.95,2.61,M(0xfff4d0,{emissive:0x806a40}));B(.15,.3,.04,s*.85,1.05,-2.61,M(0xc01010,{emissive:0x400000}))}
 for(const[a,b]of[[-1,1.6],[1,1.6],[-1,-1.6],[1,-1.6]]){C(.42,.42,.3,a*.88,.42,b,DK,'x',null,16);C(.22,.22,.32,a*.88,.42,b,M(0x8a8e94,{metalness:.5}),'x',null,12)}
 B(.6,.06,.4,0,1.93,.4,DK);/* a roof light bar, unlit */
 g.traverse(m=>{if(m.isMesh){m.userData.noSeam=true}});return g}

function zfMotorPool(g){const k=zfKit(),{B,C,rod,L}=k.H(g),M=k.M,obs=[],X0=-525,X1=-505,Z0=-1852,Z1=-1840,STL=M(0x5a5e64,{metalness:.4,roughness:.45});
 {const t=afCanvas(256,160,(c,w,h)=>{afTarmac(c,w,h,'#6a6a6c',121);c.fillStyle='rgba(20,18,16,.35)';for(const[x,y]of[[70,90],[180,85]]){c.beginPath();c.ellipse(x,y,30,18,0,0,7);c.fill()}c.fillStyle='#e8e8e0';for(let i=0;i<=3;i++)c.fillRect(8+i*80,10,4,h-20)});afPlane(g,X0,X1,Z0,Z1,.04,t,-1)}
 const H=3.6;for(const x of[X0+.5,X0+10,X1-.5])for(const z of[Z0+.5,Z1-.5]){B(.2,H,.2,x,H/2,z,STL);obs.push({x0:x-.15,x1:x+.15,z0:z-.15,z1:z+.15})}for(const z of[Z0+.5,Z1-.5])B(X1-X0,.3,.25,(X0+X1)/2,H-.1,z,STL);
 /* rafters across the two beams, then a flat sheet roof resting on them, with a fascia board round its edge */for(let x=X0+.5;x<=X1-.4;x+=2.5)B(.12,.18,Z1-Z0,x,H+.14,(Z0+Z1)/2,STL);B(X1-X0+.6,.06,Z1-Z0+.6,(X0+X1)/2,H+.26,(Z0+Z1)/2,afCorr(k,'#8a8e90',[1,14]));for(const z of[Z0-.3,Z1+.3])B(X1-X0+.64,.22,.04,(X0+X1)/2,H+.2,z,M(0xd8dcd8,{roughness:.6}));for(const x of[X0-.3,X1+.3])B(.04,.22,Z1-Z0+.64,x,H+.2,(Z0+Z1)/2,M(0xd8dcd8,{roughness:.6}));
 for(const x of[X0+5,X0+15]){const p=zfPickup();p.position.set(x,0,(Z0+Z1)/2+.3);p.rotation.y=Math.PI;g.add(p);obs.push({x0:x-1,x1:x+1,z0:(Z0+Z1)/2-2.3,z1:(Z0+Z1)/2+2.9})}
 /* a steel rack of jerrycans: two shelves, three cans each */
 {const rx=X1-1.6,rz=Z0+1,RED=M(0xb01c18,{roughness:.45,metalness:.15}),DKR=M(0x7a1210,{roughness:.5});for(const e of[-.8,.8])for(const d of[-.22,.22])B(.05,1.3,.05,rx+e,.65,rz+d,STL);for(const y of[.08,.68])B(1.7,.04,.5,rx,y,rz,STL);B(1.7,.04,.04,rx,1.28,rz-.22,STL);
  const can=(x,y)=>{const cg=new THREE.Group();cg.position.set(x,y,rz);g.add(cg);const{B:CB,rod:CR}=k.H(cg);CB(.17,.46,.34,0,.23,0,RED);/* the pressed X on each side */for(const s of[-1,1])for(const a of[-1,1]){const xb=CB(.01,.5,.04,s*.086,.23,0,DKR);xb.rotation.x=a*.62}CB(.18,.04,.35,0,.02,0,DKR);
   /* three-bar handle on top, a spout with a cap at the front corner */for(const dz of[-.1,0,.1])CB(.03,.08,.025,0,.5,dz,DKR);CB(.03,.025,.26,0,.545,0,DKR);const sp=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.08,10),M(0x2a2a2a));sp.position.set(0,.5,.13);sp.rotation.x=.5;cg.add(sp);cg.traverse(m=>{if(m.isMesh)m.userData.noSeam=true})};
  for(const y of[.1,.7])for(let i=0;i<3;i++)can(rx-.55+i*.55,y);
  obs.push({x0:rx-.9,x1:rx+.9,z0:rz-.3,z1:rz+.3})}
 L('MOTOR POOL · SIGN EVERYTHING OUT · ESPECIALLY THE TRUCKS',6,.35,'#26282b','#ffd040',60,(X0+X1)/2,H-.1,Z1-.5+.13,0);
 g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{obs}}

function zfFloods(g){const k=zfKit(),{B,C,rod}=k.H(g),M=k.M,obs=[],STL=M(0x5a5e64,{metalness:.4,roughness:.45});
 for(let i=0;i<5;i++){const fx=-620+i*35,fz=-1952;C(.14,.2,12,fx,6,fz,STL,null,null,10);B(.8,.4,.8,fx,.2,fz,M(0xa8a49c));B(2.4,.12,.12,fx,11.6,fz,STL);for(const s of[-1,1]){const hd=new THREE.Group();hd.position.set(fx+s*.8,11.4,fz+.15);hd.rotation.x=.5;g.add(hd);const b=new THREE.Mesh(new THREE.BoxGeometry(.7,.5,.25),M(0x2a2c30));hd.add(b);const ln=new THREE.Mesh(new THREE.PlaneGeometry(.6,.4),M(0xfff4e0,{emissive:0xfff0d0,emissiveIntensity:1}));ln.position.z=.13;hd.add(ln)}
  for(let j=0;j<10;j++)C(.02,.02,.5,fx+.18,1+j*1,fz,STL,'x',null,4);obs.push({x0:fx-.4,x1:fx+.4,z0:fz-.4,z1:fz+.4})}
 g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{obs}}

function zfFuel(g){const k=zfKit(),{B,C,rod,L}=k.H(g),M=k.M,obs=[],X0=-618,X1=-604,Z0=-1946,Z1=-1938,xc=(X0+X1)/2,zc=(Z0+Z1)/2,CON=M(0xa8a49c,{roughness:.95}),TK=M(0x4a5a3a,{roughness:.5,metalness:.2}),STL=M(0x5a5e64,{metalness:.4,roughness:.45});
 B(X1-X0,.06,Z1-Z0,xc,.03,zc,CON);for(const[w,d,x,z]of[[X1-X0,.25,xc,Z0+.125],[X1-X0,.25,xc,Z1-.125],[.25,Z1-Z0-.5,X0+.125,zc],[.25,Z1-Z0-.5,X1-.125,zc]])B(w,.7,d,x,.35,z,CON);
 for(const z of[zc-1.8,zc+1.8]){for(const x of[xc-3,xc+3])B(.6,.6,1.6,x,.3,z,CON);C(1.4,1.4,9,xc,1.7,z,TK,'x',null,24);for(const s of[-1,1]){const e=new THREE.Mesh(new THREE.SphereGeometry(1.4,24,10,0,Math.PI*2,0,Math.PI/2),TK);e.scale.y=.3;e.rotation.z=-s*Math.PI/2;e.position.set(xc+s*4.5,1.7,z);g.add(e)}L('JP-DARK',2.4,.5,null,'#f0e8c0',80,xc,1.7,z+1.405,0);C(.12,.12,.4,xc+2,3.2,z,STL,null,null,10)}
 rod([xc-4,2.3,zc-1.8],[xc-4,2.3,zc+1.8],.06,STL);B(.7,1.3,.5,X1+1,.65,zc,M(0xe0e0d8));L('PUMP',.6,.2,'#c02020','#ffffff',60,X1+1.26,1.1,zc,Math.PI/2);/* the pipe: out of the near tank's end, over the bund wall, round to the pump's side */rod([xc+4.75,1.2,zc-1.8],[X1+.5,1.2,zc-1.8],.06,STL);rod([X1+.5,1.2,zc-1.8],[X1+.5,1.2,zc],.06,STL);rod([X1+.5,1.2,zc],[X1+.68,1.2,zc],.06,STL);{const el=new THREE.Mesh(new THREE.SphereGeometry(.07,10,8),STL);el.position.set(X1+.5,1.2,zc-1.8);g.add(el);const e2=el.clone();e2.position.z=zc;g.add(e2)}
 for(let i=0;i<5;i++)C(.3,.3,.9,X0-1.2,.45,Z0+1+i*.7,M([0x4a5a3a,0x8a2a1a,0x2a4a7a][i%3],{metalness:.3}),null,null,14);
 L('NO SMOKING · NO OPEN FLAMES · NO SAUCERS',3.2,.35,'#c02020','#ffffff',50,xc,.45,Z1+.01,0);
 obs.push({x0:X0,x1:X1,z0:Z0,z1:Z1},{x0:X1+.6,x1:X1+1.4,z0:zc-.3,z1:zc+.3},{x0:X0-1.6,x1:X0-.8,z0:Z0+.6,z1:Z0+4.4});g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{obs}}

/* ---- batch 5: the alien and secret things ----
   zfCrash(g)     crash site x -552..-520, z -1957..-1925: a scorched crater with a raised rim, a second saucer buried
                  nose-down in it, a tarp half over it, caution tape on posts round it, a science tent, a floodlight.
   zfArtifact(g)  x -598..-576, z -1858..-1838: a concrete pad, a scaffold cage, a crystal floating and turning in it
                  (returns `crystal` to spin and bob, `glow` material to pulse), instruments and cables round it.
   zfBunker(g)    x -628..-612, z -1858..-1828: an earth-covered bunker against the west fence: a sand berm, a concrete
                  portal, a huge blast door marked LEVEL -13, a keypad (the ACCESS DENIED prop goes here), lamps.
   zfWaste(g)     at (-585, -1948): a round concrete tank sunk to its rim, glowing green goo, leaking drums round it.
                  Returns {obs, goo} (goo: material to pulse).
   zfArray(g)     x -497..-478, z -1830..-1805: four dishes on posts pointed at the sky, a cable trench, a hut.
   zfDecon(g)     x -500..-488, z -1865..-1857: an inflatable decontamination tent with spray arches.
   zfOutside(g)   outside the fence: the crop circle at (-450, -1925), cameras on poles along the road in.
   Each returns {obs} plus the extras named above. */
function zfCrash(g){const k=zfKit(),{B,C,rod,L}=k.H(g),M=k.M,obs=[],cx=-536,cz=-1941;
 /* the scorch and crater: a dark ground decal, a raised ragged rim of sand, scattered rocks and debris */
 {const t=afCanvas(512,512,(c,w,h)=>{const gr=c.createRadialGradient(w/2,h/2,10,w/2,h/2,w/2);gr.addColorStop(0,'rgba(20,16,12,.95)');gr.addColorStop(.45,'rgba(40,30,22,.85)');gr.addColorStop(.75,'rgba(90,70,50,.4)');gr.addColorStop(1,'rgba(180,150,110,0)');c.fillStyle=gr;c.fillRect(0,0,w,h);c.strokeStyle='rgba(10,8,6,.5)';c.lineWidth=3;for(let i=0;i<24;i++){const a=i/24*Math.PI*2+Math.sin(i)*.2;c.beginPath();c.moveTo(w/2+Math.cos(a)*60,h/2+Math.sin(a)*60);c.lineTo(w/2+Math.cos(a)*(200+(i%3)*30),h/2+Math.sin(a)*(200+(i%3)*30));c.stroke()}});
  const p=new THREE.Mesh(new THREE.PlaneGeometry(30,30),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetUnits:-2}));p.rotation.x=-Math.PI/2;p.position.set(cx,.03,cz);g.add(p)}
 {const pts=[];for(let i=0;i<=8;i++){const u=i/8;pts.push(new THREE.Vector2(5.5+u*3.5,Math.sin(u*Math.PI)*.9*(1-u*.3)))}const rim=new THREE.Mesh(new THREE.LatheGeometry(pts,40),M(0x9a7a56,{roughness:1}));rim.position.set(cx,0,cz);g.add(rim)}
 for(let i=0;i<14;i++){const a=i*2.3,r=4+((i*7)%5);const rk=new THREE.Mesh(new THREE.DodecahedronGeometry(.25+(i%3)*.12,0),M(i%4?0x6a5a48:0x3a3c44,{roughness:1}));rk.position.set(cx+Math.cos(a)*r,.15,cz+Math.sin(a)*r);rk.rotation.set(a,a*1.7,0);g.add(rk)}
 /* the saucer, nose-down and half buried: a copy, tilted, sunk so only part shows above the sand */
 {const SC=zfSaucer();SC.g.position.set(cx+.5,1.6,cz-.5);SC.g.rotation.set(.6,.9,.25);SC.g.scale.setScalar(.85);g.add(SC.g);SC.rim.forEach(m=>m.emissiveIntensity=.15);/* the dome is cracked and dead: solid smoked glass with a crack pattern, no see-through */{const ct=afCanvas(512,256,(c,w,h)=>{c.fillStyle='#2c4a42';c.fillRect(0,0,w,h);c.strokeStyle='rgba(200,240,225,.55)';c.lineWidth=2;let r=7;const R=()=>{r=(r*16807)%2147483647;return r/2147483647};for(let i=0;i<5;i++){const x0=60+i*95,y0=40+R()*60;for(let j=0;j<4;j++){c.beginPath();c.moveTo(x0,y0);let x=x0,y=y0;for(let n=0;n<5;n++){x+=(R()-.5)*60;y+=R()*30;c.lineTo(x,y)}c.stroke()}}});const dm2=new THREE.MeshStandardMaterial({map:ct,roughness:.15,metalness:.1});SC.g.traverse(m=>{if(m.isMesh&&m.material===SC.dome)m.material=dm2})}SC.dome.opacity=.35;SC.dome.emissiveIntensity=.1;SC.g.traverse(m=>m.userData.dpKeep=0);
  /* a crack in the dome, smoke-blackened panels: a dark patch on the hull */const st=afCanvas(128,128,(c,w,h)=>{const gr=c.createRadialGradient(64,64,4,64,64,62);gr.addColorStop(0,'rgba(16,14,12,.85)');gr.addColorStop(.6,'rgba(30,26,22,.45)');gr.addColorStop(1,'rgba(30,26,22,0)');c.fillStyle=gr;c.fillRect(0,0,w,h)});const sc=new THREE.Mesh(new THREE.CircleGeometry(1.3,24),new THREE.MeshBasicMaterial({map:st,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetUnits:-4}));/* lies on the sloping hull at r 4 (hull height .84 there, slope about 11 degrees) */const a=.4,n=new THREE.Vector3(Math.cos(a)*.196,.98,Math.sin(a)*.196).normalize();sc.position.set(Math.cos(a)*4,.845,Math.sin(a)*4).addScaledVector(n,.02);sc.lookAt(sc.position.clone().add(n));SC.g.add(sc)}
 /* the tarp: a draped sheet over one side, pegged down */{const tg=new THREE.PlaneGeometry(7,5,10,8);const p=tg.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);p.setZ(i,Math.max(0,1.8-Math.abs(x)*.25-Math.abs(y)*.35)*1.6+Math.sin(x*1.3)*.15)}tg.computeVertexNormals();const tp=new THREE.Mesh(tg,M(0x3a5a7a,{roughness:.9,side:THREE.DoubleSide}));tp.rotation.x=-Math.PI/2;tp.position.set(cx-3,.05,cz+2.5);g.add(tp);for(const[a,b]of[[-3.4,-2.4],[3.4,-2.4],[-3.4,2.4],[3.4,2.4]])rod([cx-3+a,0,cz+2.5-b],[cx-3+a*1.1,.3,cz+2.5-b*1.1],.02,M(0xc8c8c0))}
 /* caution tape on posts round it (a 13 m ring) */{const R=13,n=14,TP=M(0xe8c020,{side:THREE.DoubleSide,roughness:.6});for(let i=0;i<n;i++){const a=i/n*Math.PI*2,b=(i+1)/n*Math.PI*2,x=cx+Math.cos(a)*R,z=cz+Math.sin(a)*R,x2=cx+Math.cos(b)*R,z2=cz+Math.sin(b)*R;C(.04,.04,1.1,x,.55,z,M(0xd86020),null,null,6);const len=Math.hypot(x2-x,z2-z);const t=new THREE.Mesh(new THREE.PlaneGeometry(len,.08),TP);t.position.set((x+x2)/2,.95,(z+z2)/2);t.rotation.y=-Math.atan2(z2-z,x2-x);g.add(t);if(i%3==0){const l=k.lab('DO NOT CROSS',.6,.08,'#e8c020','#1a1a1a',60);l.position.set((x+x2)/2,.95,(z+z2)/2);l.rotation.y=-Math.atan2(z2-z,x2-x);l.position.x+=Math.cos(a+.2)*.01;g.add(l)}}obs.push({x0:cx-9,x1:cx+9,z0:cz-9,z1:cz+9})}
 /* the science tent outside the tape, a folding table with a laptop and a Geiger counter, a floodlight */
 {const tx=cx+14,tz=cz-12,TW=M(0xf0ece4,{roughness:.9,side:THREE.DoubleSide});const sh=new THREE.Shape();sh.moveTo(-2,0);sh.lineTo(2,0);sh.lineTo(2,1.8);sh.lineTo(0,2.8);sh.lineTo(-2,1.8);sh.lineTo(-2,0);const hole=new THREE.Path();hole.moveTo(-.8,0);hole.lineTo(.8,0);hole.lineTo(.8,1.9);hole.lineTo(-.8,1.9);hole.lineTo(-.8,0);const fs=sh.clone();fs.holes.push(hole);
  for(const[z,s2]of[[tz-2,fs],[tz+2,sh]]){const m=new THREE.Mesh(new THREE.ShapeGeometry(s2),TW);m.position.set(tx,0,z);g.add(m)}for(const s of[-1,1]){const w=new THREE.Mesh(new THREE.PlaneGeometry(4,1.8),TW);w.rotation.y=Math.PI/2;w.position.set(tx+s*2,.9,tz);g.add(w);/* the roof side: one quad from the eave (a little overhang) up to the ridge, front to back */const rg=new THREE.BufferGeometry(),ex=s*2.15,ey=1.725,zz=2.1;rg.setAttribute('position',new THREE.Float32BufferAttribute([ex,ey,-zz,0,2.8,-zz,0,2.8,zz,ex,ey,-zz,0,2.8,zz,ex,ey,zz],3));rg.computeVertexNormals();const rm=new THREE.Mesh(rg,TW);rm.position.set(tx,0,tz);g.add(rm)}
  L('FIELD LAB 2',1.4,.3,'#c01818','#ffffff',60,tx,2.1,tz-2.01,Math.PI);B(1.4,.04,.7,tx,.75,tz,M(0xb8bcc0));for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])C(.02,.02,.73,tx+a*.65,.37,tz+b*.3,M(0x5a5e64),null,null,6);B(.4,.02,.3,tx-.3,.78,tz,M(0x2a2a2c));{const sc=B(.4,.26,.02,tx-.3,.92,tz+.14,M(0x60a0ff,{emissive:0x204080}));sc.rotation.x=-.3}B(.18,.08,.12,tx+.3,.81,tz,M(0xe8c020));obs.push({x0:tx-2,x1:tx+2,z0:tz-2,z1:tz+2})}
 {const fx=cx-12,fz=cz-10;for(let i=0;i<3;i++){const a=i*2.1;rod([fx,2.6,fz],[fx+Math.cos(a)*.8,0,fz+Math.sin(a)*.8],.03,M(0xe8c020))}const hd=B(.7,.5,.3,fx,2.9,fz,M(0x2a2c30));hd.lookAt(cx,0,cz);const ln=new THREE.Mesh(new THREE.PlaneGeometry(.6,.4),M(0xfff4e0,{emissive:0xfff0d0}));ln.position.set(fx,2.9,fz);ln.lookAt(cx,0,cz);ln.translateZ(.16);g.add(ln)}
 g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{obs}}

function zfArtifact(g){const k=zfKit(),{B,C,rod,L}=k.H(g),M=k.M,obs=[],cx=-587,cz=-1848,STL=M(0x5a5e64,{metalness:.4,roughness:.45}),YL=M(0xe8c020,{roughness:.6});
 B(14,.25,12,cx,.125,cz,M(0xa8a49c,{roughness:.95}));{const t=afCanvas(256,256,(c,w,h)=>{c.strokeStyle='#e8c030';c.lineWidth=8;c.strokeRect(20,20,w-40,h-40);c.setLineDash([16,12]);c.lineWidth=4;c.beginPath();c.arc(w/2,h/2,90,0,7);c.stroke()});const p=new THREE.Mesh(new THREE.PlaneGeometry(8,8),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetUnits:-2}));p.rotation.x=-Math.PI/2;p.position.set(cx,.255,cz);g.add(p)}
 /* the scaffold cage: tube uprights, ledgers at three levels, cross braces, couplers */const S2=2.6,HH=5.2,F=.25;for(const a of[-1,1])for(const b of[-1,1]){C(.05,.05,HH,cx+a*S2,F+HH/2,cz+b*S2,STL,null,null,8);B(.25,.04,.25,cx+a*S2,F+.02,cz+b*S2,STL)}
 for(const y of[1.6,3.4,HH])for(const[a,b,c2,d]of[[-1,-1,1,-1],[-1,1,1,1],[-1,-1,-1,1],[1,-1,1,1]])rod([cx+a*S2,F+y,cz+b*S2],[cx+c2*S2,F+y,cz+d*S2],.045,STL);
 for(const[a,b,c2,d]of[[-1,-1,1,-1],[-1,1,1,1]])rod([cx+a*S2,F+.2,cz+b*S2],[cx+c2*S2,F+3.4,cz+d*S2],.035,STL);for(const[a,b,c2,d]of[[-1,-1,-1,1],[1,-1,1,1]])rod([cx+a*S2,F+3.4,cz+b*S2],[cx+c2*S2,F+.2,cz+d*S2],.035,STL);
 /* the crystal: a long faceted gem, glowing, with a softer halo, on a dpKeep group */const crystal=new THREE.Group();crystal.position.set(cx,F+2.7,cz);g.add(crystal);const glow=M(0x80ffe0,{emissive:0x40e0b0,emissiveIntensity:1,roughness:.1,metalness:.1,transparent:true,opacity:.9});
 {const ge=new THREE.OctahedronGeometry(.8,0);ge.scale(.7,1.6,.7);const cr=new THREE.Mesh(ge,glow);crystal.add(cr);const h2=new THREE.Mesh(new THREE.OctahedronGeometry(1.1,1),new THREE.MeshBasicMaterial({color:0x80ffe0,transparent:true,opacity:.12,depthWrite:false,blending:THREE.AdditiveBlending}));h2.scale.set(.8,1.5,.8);crystal.add(h2);for(let i=0;i<3;i++){const sh=new THREE.Mesh(new THREE.OctahedronGeometry(.18,0),glow);const a=i*2.1;sh.position.set(Math.cos(a)*1.3,Math.sin(a*2)*.4,Math.sin(a)*1.3);crystal.add(sh)}}crystal.traverse(m=>m.userData.dpKeep=1);
 /* instruments round it: four tripods with sensor heads pointing in, cables to a rack, a rack of blinking units */
 for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4,x=cx+Math.cos(a)*4.2,z=cz+Math.sin(a)*4.2;for(let j=0;j<3;j++){const b=j*2.1;rod([x,F+1.4,z],[x+Math.cos(b)*.4,F,z+Math.sin(b)*.4],.02,STL)}const hd=new THREE.Mesh(new THREE.CylinderGeometry(.12,.18,.45,10),M(0x2a2c30));hd.position.set(x,F+1.6,z);hd.lookAt(cx,F+2.7,cz);hd.rotateX(Math.PI/2);g.add(hd);const pts=[new THREE.Vector3(x,F+1.3,z),new THREE.Vector3(x,F+.03,z),new THREE.Vector3((x+cx+5.5)/2,F+.03,(z+cz+4)/2),new THREE.Vector3(cx+5.5,F+.03,cz+4)];const cb=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),12,.025,5),M(0x1a1a1a));g.add(cb)}
 {const rx=cx+5.5,rz=cz+4;B(.8,1.8,.6,rx,F+.9,rz,M(0x2a2c30));for(let i=0;i<6;i++){B(.7,.2,.02,rx,F+.3+i*.27,rz-.31,M(0x3a3c42));C(.025,.025,.02,rx-.25,F+.3+i*.27,rz-.33,M([0x40ff70,0xff4040,0xffd040][i%3],{emissive:[0x20a040,0xa02020,0xa08020][i%3]}),'z',null,6)}obs.push({x0:rx-.45,x1:rx+.45,z0:rz-.35,z1:rz+.35})}
 L('DO NOT LOOK DIRECTLY AT THE ARTIFACT\n(YOU ARE LOOKING AT IT NOW)',3.2,.6,'#1a1a1e','#ffd040',44,cx,1.1,cz+5.99,0);B(3.3,.7,.05,cx,1.1,cz+5.97,M(0x1a1a1e));for(const dx of[-1.4,1.4])B(.06,.8,.06,cx+dx,.65,cz+5.97,STL);
 obs.push({x0:cx-S2-.15,x1:cx+S2+.15,z0:cz-S2-.15,z1:cz+S2+.15});g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{obs,crystal,glow}}

function zfBunker(g){const k=zfKit(),{B,C,rod,L}=k.H(g),M=k.M,obs=[],x0=-628,x1=-612,z0=-1858,z1=-1828,zc=(z0+z1)/2,CN=M(0xa8a49c,{roughness:.95}),STL=M(0x5a5e64,{metalness:.4,roughness:.45}),SAND=M(0xb89a6a,{roughness:1});
 /* the berm: a long sand mound over the bunker, its face cut back where the portal is */{const sh=new THREE.Shape();sh.moveTo(-7,0);sh.quadraticCurveTo(-4,5,0,5);sh.quadraticCurveTo(4,5,7,0);sh.lineTo(-7,0);const ge=new THREE.ExtrudeGeometry(sh,{depth:z1-z0-2,bevelEnabled:false});ge.translate(0,0,-(z1-z0-2)/2);const m=new THREE.Mesh(ge,SAND);m.position.set(-622,0,zc);g.add(m);for(const z of[z0+1,z1-1]){const cap=new THREE.Mesh(new THREE.SphereGeometry(5,20,10,0,Math.PI*2,0,Math.PI/2),SAND);cap.scale.set(1.4,1,.5);cap.position.set(-622,0,z);g.add(cap)}}
 /* the portal on the berm's east face (x -615): a concrete headwall with wing walls, the blast door, hazard stripes */
 const px=-614.6;B(1.2,5,8,px,2.5,zc,CN);for(const s of[-1,1]){const w=B(.6,3.4,4.3,px+1.75,1.7,zc+s*5.2,CN);w.rotation.y=s*.907}
 B(.3,3.6,4.6,px+.75,1.8,zc,STL);B(.2,3.2,4.2,px+.85,1.6,zc,M(0x6a6e74,{metalness:.35,roughness:.4}));for(let i=0;i<5;i++)B(.04,3.1,.06,px+.96,1.6,zc-1.7+i*.85,M(0x4a4e54));for(const y of[.6,2.6]){C(.12,.12,4,px+.98,y,zc,M(0xc0c4c8,{metalness:.4}),'z',null,10)}
 {const hz=afCanvas(256,32,(x,w,h)=>{for(let i=-32;i<w+32;i+=16){x.fillStyle='#e8c020';x.beginPath();x.moveTo(i,0);x.lineTo(i+8,0);x.lineTo(i+8+h,h);x.lineTo(i+h,h);x.fill();x.fillStyle='#1a1a1a';x.beginPath();x.moveTo(i+8,0);x.lineTo(i+16,0);x.lineTo(i+16+h,h);x.lineTo(i+8+h,h);x.fill()}});const hm=new THREE.Mesh(new THREE.PlaneGeometry(4.6,.35),new THREE.MeshBasicMaterial({map:hz}));hm.rotation.y=Math.PI/2;hm.position.set(px+.91,3.75,zc);g.add(hm)}
 L('LEVEL -13',3,.8,null,'#f0e8c0',90,px+.96,2.0,zc,Math.PI/2);L('AUTHORISED LIFEFORMS ONLY',3,.3,null,'#ffd040',60,px+.96,1.2,zc,Math.PI/2);
 /* the keypad, two caged lamps, a road up to it */B(.1,.5,.35,px+.65,1.4,zc+3.1,M(0x1a1a1e));B(.02,.08,.25,px+.71,1.55,zc+3.1,M(0xff3030,{emissive:0xff1010}));for(let i=0;i<3;i++)for(let j=0;j<3;j++)B(.02,.05,.05,px+.71,1.3+j*.07,zc+3.02+i*.08,M(0x8a8e94));
 for(const s of[-1,1]){C(.12,.12,.25,px+.75,4.3,zc+s*2.6,M(0xfff4d0,{emissive:0xffe0a0,emissiveIntensity:.9}),'x',null,10);for(let i=0;i<4;i++)B(.3,.02,.26,px+.85,4.2+i*.07,zc+s*2.6,STL)}
 {const t=afCanvas(128,256,(x,w,h)=>{afTarmac(x,w,h,'#7a7a78',131);x.fillStyle='#e8c030';for(let i=0;i<8;i++)x.fillRect(w/2-3,i*32+6,6,18)});afPlane(g,px+.6,px+12,zc-2.4,zc+2.4,.04,t,-1)}
 obs.push({x0:x0,x1:px+1.1,z0:z0,z1:z1});g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{obs,keypad:{x:px+1.6,z:zc+3.1}}}

function zfWaste(g){const k=zfKit(),{B,C,rod,L}=k.H(g),M=k.M,obs=[],cx=-585,cz=-1948,R=4.2,CN=M(0xa8a49c,{roughness:.95});
 const ring=new THREE.Mesh(new THREE.TorusGeometry(R,.3,8,40),CN);ring.rotation.x=Math.PI/2;ring.position.set(cx,.3,cz);g.add(ring);C(R+.3,R+.3,.3,cx,.15,cz,CN,null,null,40,true);
 const goo=M(0x70ff60,{emissive:0x30c020,emissiveIntensity:.8,roughness:.2});const gs=new THREE.Mesh(new THREE.CircleGeometry(R-.1,40),goo);gs.rotation.x=-Math.PI/2;gs.position.set(cx,.4,cz);g.add(gs);for(let i=0;i<7;i++){const b=new THREE.Mesh(new THREE.SphereGeometry(.12+(i%3)*.06,10,6,0,Math.PI*2,0,Math.PI/2),goo);b.position.set(cx+Math.cos(i*2.4)*(i*.45),.4,cz+Math.sin(i*2.4)*(i*.45));g.add(b)}
 const DRM=[0xd8b020,0x3a5a3a,0x6a6a6e];for(let i=0;i<8;i++){const a=i/8*Math.PI*2+.3,r=R+1.4+(i%2)*.6,x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r;const tipped=i%3==1;const d=C(.3,.3,.9,x,tipped?.3:.45,z,M(DRM[i%3],{roughness:.6,metalness:.2}),tipped?'x':null,null,14);if(tipped){d.rotation.y=a;const sp=new THREE.Mesh(new THREE.CircleGeometry(.7,16),goo);sp.rotation.x=-Math.PI/2;sp.position.set(x+Math.cos(a)*-.2,.03,z+Math.sin(a)*-.2);sp.scale.set(1.4,1,1);g.add(sp)}else{const l=k.lab('☢',.35,.35,null,'#1a1a1a',90);l.position.set(x+Math.cos(a)*.305,.5,z+Math.sin(a)*.305);l.rotation.y=Math.PI/2-a;g.add(l)}obs.push({x0:x-.35,x1:x+.35,z0:z-.35,z1:z+.35})}
 B(1.6,.9,.05,cx,1.0,cz-R-1.2,M(0xf4f0e4));L('DO NOT SWIM\nDO NOT DRINK\nDO NOT ASK',1.5,.8,'#f4f0e4','#c01818',44,cx,1.0,cz-R-1.17,0);for(const dx of[-.6,.6])B(.05,.6,.05,cx+dx,.3,cz-R-1.2,M(0x5a5e64));
 obs.push({x0:cx-R-.3,x1:cx+R+.3,z0:cz-R-.3,z1:cz+R+.3});g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{obs,goo}}

function zfArray(g){const k=zfKit(),{B,C,rod,L}=k.H(g),M=k.M,obs=[],STL=M(0x6a6e74,{metalness:.35,roughness:.45}),WH=M(0xe8ecec,{roughness:.5,side:THREE.DoubleSide});
 for(const[x,z,ry]of[[-493,-1826,.4],[-482,-1826,1.6],[-493,-1810,2.8],[-482,-1810,4.0]]){C(.18,.24,3,x,1.5,z,STL,null,null,10);B(1,.2,1,x,.1,z,M(0xa8a49c));const d=new THREE.Group();d.position.set(x,3.2,z);d.rotation.set(-.9,ry,0,'YXZ');g.add(d);const pts=[];for(let i=0;i<=8;i++){const r=i/8*2;pts.push(new THREE.Vector2(r,r*r/5))}const dm=new THREE.Mesh(new THREE.LatheGeometry(pts,28),WH);d.add(dm);const rm=new THREE.Mesh(new THREE.TorusGeometry(2,.04,6,28),STL);rm.rotation.x=Math.PI/2;rm.position.y=.8;d.add(rm);for(let i=0;i<3;i++){const a=i*2.1;const r=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,1.9,5),STL);const p0=new THREE.Vector3(Math.cos(a)*1.95,.8,Math.sin(a)*1.95),p1=new THREE.Vector3(0,1.6,0);r.position.copy(p0).add(p1).multiplyScalar(.5);r.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),p1.clone().sub(p0).normalize());d.add(r)}const fd=new THREE.Mesh(new THREE.CylinderGeometry(.1,.15,.3,10),STL);fd.position.y=1.7;d.add(fd);obs.push({x0:x-.5,x1:x+.5,z0:z-.5,z1:z+.5})}
 {const hx=-487.5,hz=-1818;B(3,2.4,2.4,hx,1.2,hz,M(0xc8c4b8,{roughness:.9}));B(3.2,.15,2.6,hx,2.47,hz,M(0x5a5e64));B(.9,2,.05,hx,1,hz+1.23,M(0x3a4a3a));L('SETI-ISH',1.6,.35,'#26282b','#40ff70',60,hx,2.1,hz+1.235,0);obs.push({x0:hx-1.5,x1:hx+1.5,z0:hz-1.2,z1:hz+1.2})}
 for(const[x,z]of[[-493,-1826],[-482,-1826],[-493,-1810],[-482,-1810]])rod([x,.05,z],[-487.5,.05,-1818],.05,M(0x1a1a1a));
 g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{obs}}

function zfDecon(g){const k=zfKit(),{B,C,rod,L}=k.H(g),M=k.M,obs=[],x0=-500,x1=-488,z0=-1865,z1=-1857,xc=(x0+x1)/2,zc=(z0+z1)/2,W=z1-z0,YL=M(0xe8c020,{roughness:.7,side:THREE.DoubleSide}),WT=M(0xf0ece4,{roughness:.8,side:THREE.DoubleSide});
 /* an inflatable tunnel: fat tubes (arches) along it with white skin between, open at both ends */for(let i=0;i<=4;i++){const x=x0+i*(x1-x0)/4;const a=new THREE.Mesh(new THREE.TorusGeometry(W/2-.2,.28,8,24,Math.PI),YL);a.rotation.y=Math.PI/2;a.position.set(x,0,zc);g.add(a)}
 {const ge=new THREE.CylinderGeometry(W/2-.25,W/2-.25,x1-x0,24,1,true,0,Math.PI);ge.rotateZ(Math.PI/2);const m=new THREE.Mesh(ge,WT);m.position.set(xc,0,zc);g.add(m)}
 /* spray arches inside and a drain grate; the name on the side */for(const x of[xc-2,xc+2]){const sa=new THREE.Mesh(new THREE.TorusGeometry(2.4,.05,6,20,Math.PI),M(0x8a8e94,{metalness:.4}));sa.rotation.y=Math.PI/2;sa.position.set(x,0,zc);g.add(sa);for(let i=1;i<8;i++){const a=i/8*Math.PI;C(.04,.03,.1,x,Math.sin(a)*2.35,zc+Math.cos(a)*2.35,M(0x5a5e64),null,null,6)}}
 B(x1-x0-1,.02,1.2,xc,.02,zc,M(0x3a3c42));/* the lettering lies on the tunnel skin (radius 3.75), tilted to match it 40 degrees up the side */{const f=40*Math.PI/180,r=3.78;/* one line per bay, between the tubes */for(const[dx,tx]of[[-1.5,'DECONTAMINATION'],[1.5,'WALK THROUGH · DO NOT STOP']]){const t=k.lab(tx,2.2,.4,null,'#c01818',56);t.position.set(xc+dx,r*Math.sin(f),zc+r*Math.cos(f));t.rotation.x=-f;g.add(t)}}
 for(const s of[-1,1])obs.push({x0,x1,z0:s<0?z0:z1-.4,z1:s<0?z0+.4:z1});g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{obs}}

function zfOutside(g){const k=zfKit(),{B,C,rod,L}=k.H(g),M=k.M,obs=[];
 /* the crop circle: rings and a pattern raked into the sand (a decal), at (-450, -1925), 28 across */
 {const t=afCanvas(1024,1024,(c,w,h)=>{c.clearRect(0,0,w,h);c.strokeStyle='rgba(120,90,55,.55)';c.fillStyle='rgba(120,90,55,.45)';const cx=w/2,cy=h/2;c.lineWidth=18;c.beginPath();c.arc(cx,cy,480,0,7);c.stroke();c.lineWidth=10;c.beginPath();c.arc(cx,cy,360,0,7);c.stroke();c.beginPath();c.arc(cx,cy,150,0,7);c.fill();for(let i=0;i<6;i++){const a=i/6*Math.PI*2;c.beginPath();c.arc(cx+Math.cos(a)*260,cy+Math.sin(a)*260,55,0,7);c.fill();c.lineWidth=8;c.beginPath();c.moveTo(cx+Math.cos(a)*150,cy+Math.sin(a)*150);c.lineTo(cx+Math.cos(a)*205,cy+Math.sin(a)*205);c.stroke();c.beginPath();c.arc(cx+Math.cos(a+.52)*420,cy+Math.sin(a+.52)*420,25,0,7);c.fill()}});
  const p=new THREE.Mesh(new THREE.PlaneGeometry(28,28),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetUnits:-2}));p.rotation.x=-Math.PI/2;p.position.set(-450,.03,-1925);g.add(p)}
 /* cameras on poles along the road in, each turned to watch the road */for(const[x,z]of[[-462,-1876.5],[-448,-1863.5],[-434,-1876.5],[-420,-1863.5]]){C(.06,.08,4,x,2,z,M(0x5a5e64,{metalness:.4}),null,null,8);B(.4,.1,.4,x,.05,z,M(0xa8a49c));const cg=new THREE.Group();cg.position.set(x,3.9,z);cg.lookAt(-475,2,-1870);g.add(cg);const body=new THREE.Mesh(new THREE.BoxGeometry(.22,.2,.55),M(0xe8ecec,{roughness:.5}));body.position.z=.2;cg.add(body);const hood=new THREE.Mesh(new THREE.BoxGeometry(.28,.04,.5),M(0xe8ecec));hood.position.set(0,.12,.25);cg.add(hood);const lens=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,.04,12),M(0x101418,{roughness:.1}));lens.rotation.x=Math.PI/2;lens.position.z=.48;cg.add(lens);const led=new THREE.Mesh(new THREE.SphereGeometry(.02,6,4),M(0xff2020,{emissive:0xff0000}));led.position.set(.08,-.06,.48);cg.add(led);obs.push({x0:x-.2,x1:x+.2,z0:z-.2,z1:z+.2})}
 {const s=k.lab('SMILE.\nYOU ARE BEING\nWATCHED. ALSO\nBY US.',1.1,1,'#f4f0e4','#1a1a1a',44);s.position.set(-430,1.4,-1876.45);g.add(s);B(1.2,1.1,.04,-430,1.4,-1876.5,M(0xf4f0e4));for(const dx of[-.5,.5])B(.05,.9,.05,-430+dx,.45,-1876.5,M(0x5a5e64))}
 g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{obs}}


/* ---------- r623 wiring: the airfield ---------- */
function xpAirfield(X){const{q,g,ob,prop,loc,rect,sign,anim,light,zone}=X,rz=-1230,rx0=270,rx1=540;zone(rx0-5,rx1+5,-1335,-1195);
 const obs=o=>{for(const b of o||[])ob(b.x0,b.x1,b.z0,b.z1)},T=(n,f)=>{try{f()}catch(e){conLog('error','airfield ('+n+'): '+e.message)}};
 rect(rx0,rx1,rz-10,rz+10,'#4a4a48');rect(275,365,rz-40,rz-10,'#5a5a58');
 /* the runway, its lights, the taxiway and the apron */T('field',()=>{const F=afField(g);obs(F.obs);AFX.lights=F.lights});
 /* the hangar (its light as before), the fuel tank, the T-hangars with the crop duster */T('hangars',()=>{obs(afHangar(g).obs);obs(afFuel(g).obs);obs(afTHangars(g).obs);light(0xfff0d0,1.2,20,300,8,-1275)});
 /* the road across the runway, with lights that flash; the terminal and the car park */T('crossing',()=>{const c=afCrossing(g);obs(c.obs);anim(300,-1230,250,()=>{const k=(q.rt/.6|0)%2;c.flash[0].emissiveIntensity=k?1:.1;c.flash[1].emissiveIntensity=k?.1:1});
  obs(afTerminal(g).obs);obs(afCarPark(g).obs);rect(306,334,-1212,-1198,'#e6d6b8');rect(275,294,-1214,-1196,'#b4a080')});
 /* the control tower: beacon, red light, the intercom */T('tower',()=>{const tx=430,tz=-1200,t=afTower(g,tx,tz);obs(t.obs);anim(tx,tz,300,dt=>{t.beacon.rotation.y+=dt*1.6;t.red.emissiveIntensity=(q.rt*2|0)%2==0?1:.1});
  prop(tx,tz+3.4,2,'[E] Call the tower on the intercom',()=>{snd(500,.05);hint(['📻 "Tower here. Runway is clear. Runway is always clear. Nobody flies."','📻 "You are cleared for takeoff. You are cleared for anything, honestly."','📻 "Please do not land on the Desert Bus again."','📻 "Weather: sand. Wind: some. Visibility: dark."'][(q.twn=(q.twn|0)+1)%4])});light(0xffd090,1,16,tx,13,tz)});
 /* the windsock */T('windsock',()=>{const w=afWindsock(g,380,-1248);obs(w.obs);anim(380,-1248,200,()=>{w.sk.rotation.y=Math.PI*.75+Math.sin(q.rt*.6)*.5;w.so.rotation.z=Math.PI/2-.2+Math.sin(q.rt*2.5)*.1})});
 sign('AIRFIELD\nPLANE: FLY IT (W/S CLIMB & DIVE)','#2a4a8a',296,-1214,.4);loc('Airfield',400,rz,'✈️')}
const AFX={lights:null};

/* ---------- r623 wiring: Dark Zone 51 ---------- */
function xpDarkZone(X){const{q,g,ob,prop,loc,anim,light,zone,road}=X,{x0,x1,z0,z1}=DZ51,cx=(x0+x1)/2,cz=(z0+z1)/2;zone(x0-3,x1+3,z0-3,z1+3);
 const obs=o=>{for(const b of o||[])ob(b.x0,b.x1,b.z0,b.z1)},T=(n,f)=>{try{f()}catch(e){conLog('error','Dark Zone 51 ('+n+'): '+e.message)}};
 /* the fence (the Screech hole stays), the gate you can ram, the boom barrier, the tank traps on the road in */
 T('fence',()=>{obs(zfFence(g).obs);const G=zfGate(g);obs(G.obs);const go=ob(x1-.3,x1+.3,-1873.5,-1866.5,{m:G.gate,kd:'gate'});q.dzGate=go;
  prop(x1+1.5,-1870,2,()=>go.dead?'The gate is off its hinges. Someone drove through it.':'[E] Try the gate',()=>{if(go.dead)return;snd(200,.1);hint('🔒 Locked. A sign: "AUTHORISED DARK PERSONNEL ONLY. Trespassers will be SEEKED." (A fast enough car might not care.)')});
  obs(zfTraps(g).obs)});
 /* the roads inside: gate to Hangar 18's apron, and a branch up to the barracks */T('roads',()=>{road(x1,-1870,-555,-1870);road(-540,-1866.5,-540,-1810)});
 /* guard towers with searchlights that sweep the sand */T('towers',()=>{for(const[tx,tz]of[[x1-5,z1-5],[x1-5,z0+5],[x0+5,cz]]){const t=zfTower(g,tx,tz);obs(t.obs);light(0xfff0c0,1.2,30,tx,10,tz);anim(tx,tz,200,dt=>{t.pv.rotation.y=q.rt*.35+tx;t.pv.rotation.x=Math.PI/2-.35+Math.sin(q.rt*.5)*.15})}});
 /* the radar and radome, barracks and mess hall (with a visitor), Building 13 */
 T('radar',()=>{const r=zfRadar(g);obs(r.obs);anim(-603,-1808,220,()=>{r.dish.rotation.y=q.rt*.4})});
 T('barracks',()=>{const b=zfBarracks(g);obs(b.obs);const L=['He nods politely. He does not look up from his jelly.','"The food here is... an experience."','"Do not tell them I can leave whenever I like."','He offers you some jelly. It glows. You decline.'];
  prop(-549.6,-1797.5,1.5,'[E] Talk to the visitor',()=>{snd(700,.05);hint('👽 '+L[(q.zfv=(q.zfv|0)+1)%L.length])})});
 T('building 13',()=>{const b=zfB13(g);obs(b.obs);const V=b.vats||[];anim(-514,-1805,120,()=>{for(let i=0;i<V.length;i++){const m=V[i].material||V[i];if(m&&'emissiveIntensity'in m)m.emissiveIntensity=.5+.3*Math.sin(q.rt*2+i)}})});
 /* the helipad, the motor pool, floodlights (their lights as before), the fuel dump */
 T('helipad',()=>{const h=zfHelipad(g);obs(h.obs);if(h.sock)anim(-505,-1932,200,()=>{h.sock.rotation.y=Math.PI*.75+Math.sin(q.rt*.6)*.5})});
 T('motor pool',()=>obs(zfMotorPool(g).obs));T('floods',()=>{obs(zfFloods(g).obs);for(let i=0;i<5;i++)light(0xfff4e0,1.4,26,x0+10+i*35,11.4,z0+9)});T('fuel',()=>obs(zfFuel(g).obs));
 /* HANGAR 18 and the saucer */T('hangar 18',()=>{const hx=-580,hz=-1915,H=zfHangar18(g);obs(H.obs);ZFA.H=H;ZFA.hx=hx;ZFA.hz=hz;for(let i=0;i<4;i++)light(0xc0d0ff,1.1,22,hx-18+i*12,14,hz);const ul=light(0x80ffc0,2,22,hx,4,hz);
  const u=H.saucer;u.userData.mv=1;H.beam.userData.mv=1;try{H.hatch&&H.hatch(0)}catch(e){}
  anim(hx,hz,160,dt=>{u.rotation.y+=dt*.4;u.position.y=6+Math.sin(q.rt*.9)*.4;ul.intensity=1.6+Math.sin(q.rt*3)*.5;if(!q.abd){H.beam.scale.y=1+Math.sin(q.rt*2)*.1;H.beam.material.opacity=.12+Math.abs(Math.sin(q.rt*1.5))*.1}
   if(Array.isArray(H.rim))H.rim.forEach((m,i)=>{if(m&&'emissiveIntensity'in m)m.emissiveIntensity=.7+.3*Math.sin(q.rt*4+i*2.1)})});
  prop(hx,hz+3,3,()=>q.abd?'👽 ...':'[E] Step into the light under the saucer',()=>{if(q.abd||q.seat||q.inBus)return;q.abd={t:0,x:hx,z:hz,sx:P.x,sz:P.z-q.OZ,y0:P.dy,p0:P.pitch};snd(80,1.2);hint('👽 The light takes you. Up. UP.')});
  loc('Hangar 18',hx,hz,'🛸')});
 /* batch 5: the secret stuff */T('crash site',()=>obs(zfCrash(g).obs));T('array',()=>obs(zfArray(g).obs));T('decon',()=>obs(zfDecon(g).obs));T('outside',()=>obs(zfOutside(g).obs));
 T('artifact',()=>{const A=zfArtifact(g);obs(A.obs);const cr=A.crystal,y0=cr.position.y;cr.userData.dpKeep=1;cr.userData.mv=1;let hum=0;anim(-587,-1848,120,dt=>{cr.rotation.y+=dt*.6;cr.position.y=y0+Math.sin(q.rt*1.2)*.15;if(A.glow)A.glow.emissiveIntensity=.7+.3*Math.sin(q.rt*3);
   if((hum-=dt)<=0){hum=1.6;if(Math.hypot(P.x+587,P.z-q.OZ+1848)<15)snd(70,.05)}})});
 T('bunker',()=>{const B=zfBunker(g);obs(B.obs);const k=B.keypad;prop(k.x,k.z,1.6,'[E] Use the keypad',()=>{snd(140,.25);setTimeout(()=>snd(110,.25),180);hint('🔴 ACCESS DENIED. LEVEL -13 IS FOR AUTHORISED LIFEFORMS ONLY.')})});
 T('waste pit',()=>{const W=zfWaste(g);obs(W.obs);if(W.goo)anim(-585,-1948,120,()=>{W.goo.emissiveIntensity=.6+.25*Math.sin(q.rt*1.7)})});
 loc('Dark Zone 51',cx,cz,'👽')}

/* ---------- the abduction: up through the hatch, a white-out, then a second saucer flies you out and drops you ---------- */
const ZFA={H:null,hx:-580,hz:-1915,R:null,out:null};
const zfE=u=>u<=0?0:u>=1?1:u*u*(3-2*u),zfC=(t,a,b)=>Math.max(0,Math.min(1,(t-a)/(b-a)));
function zfAbdTick(q,dt){const a=q.abd,H=ZFA.H;a.t+=dt;const t=a.t;if(!H){a.t=99}
 const sy=H?H.saucer.position.y:6;
 if(t<5.6){/* in the hangar */const hu=t<.6?t/.6:t<3.6?1:t<4?1-(t-3.6)/.4:0;try{H.hatch(Math.max(0,Math.min(1,hu)))}catch(e){}
  H.beam.material.opacity=Math.min(.45,.18+t*.4);H.beam.visible=t<1.4;
  const k=zfE(zfC(t,.6,1.4));P.x=a.sx+(a.x-a.sx)*k;P.z=q.OZ+a.sz+(a.z-a.sz)*k;
  const r=zfE(zfC(t,1.4,3.6)),top=sy-1.65-1.6;P.dy=a.y0+(top-a.y0)*r;if(t>1.4&&t<3.6){P.yaw+=dt*.6;P.pitch=a.p0+(1.25-a.p0)*r;if(Math.random()<dt*8)snd(300+(t-1.4)*400,.05)}
  if(t>=3.1&&!a.wh){a.wh=1;try{bsF.style.transition='opacity .5s';bsF.style.background='#f4fff8';bsF.style.opacity=1}catch(e){}}
  if(t>=3.6&&!a.cl){a.cl=1;snd(120,.15)}if(t>=4&&!a.dots){a.dots=1;hint('👽 ...')}return}
 if(!a.D){/* pick where you get dropped, as the old code did */const L=(q.locs||[]).filter(l=>!/Dark Zone|Hangar|Gorge|Stunt|Railroad/.test(l.nm));const l=L[Math.random()*L.length|0]||{x:4,z:-1040,nm:'the bus stop'};a.l=l;a.D={x:l.x+4,z:l.z+4};
  try{H.hatch(0)}catch(e){}H.beam.visible=true;
  if(!ZFA.R){ZFA.R=zfSaucer();ZFA.R.g.traverse(m=>m.userData.dpKeep=1);ZFA.R.g.userData.mv=1;q.g.add(ZFA.R.g)}const R=ZFA.R;if(R.g.parent!==q.g)q.g.add(R.g);R.g.visible=true;try{R.hatch(1)}catch(e){}
  const dx=a.D.x-ZFA.hx,dz=a.D.z-ZFA.hz,d=Math.hypot(dx,dz)||1,s=Math.min(200,d);a.S={x:a.D.x-dx/d*s,z:a.D.z-dz/d*s};a.h=Math.atan2(-dx,-dz);R.g.position.set(a.S.x,28,a.S.z);
  try{bsF.style.transition='opacity .5s';bsF.style.opacity=0;setTimeout(()=>{try{bsF.style.background='#000'}catch(e){}},600)}catch(e){}}
 const R=ZFA.R,k=zfE(zfC(t,5.6,7.8)),x=a.S.x+(a.D.x-a.S.x)*k,z=a.S.z+(a.D.z-a.S.z)*k;R.g.position.set(x,28,z);R.g.rotation.y+=dt*1.2;R.g.rotation.z=Math.sin(Math.PI*k)*.12;
 if(t<8.2){/* riding under its hatch, looking ahead and down */P.x=x;P.z=q.OZ+z;P.dy=28-3.6-1.6;P.yaw+=((a.h-P.yaw+Math.PI*3)%(Math.PI*2)-Math.PI)*Math.min(1,dt*4);P.pitch=-.55;return}
 /* let go: the fall, the saucer leaves, the hint and the badge */P.x=a.D.x;P.z=q.OZ+a.D.z;P.pitch=.8;q.fling={vx:0,vz:0,vy:0,y:24,t:0,soft:1};q.safe={x:a.D.x,z:a.D.z};const l=a.l;q.abd=null;ZFA.out={t:8.2,x:a.D.x,z:a.D.z,h:a.h};
 snd(1500,.3);hint('👽 ...and then they let go. Over '+l.nm+'. From quite high up.');try{badge('ufo')}catch(e){}}
/* the saucer that dropped you hangs there a second, then shoots up and away */
{const f0=busRoamUpd;busRoamUpd=function(q,dt){const r=f0.apply(this,arguments);try{const o=ZFA.out,R=ZFA.R;if(o&&R){o.t+=dt;R.g.rotation.y+=dt*1.2;if(o.t>9.2){const u=o.t-9.2;R.g.position.y=28+u*u*14;R.g.position.x=o.x-Math.sin(o.h)*u*u*20;R.g.position.z=o.z-Math.cos(o.h)*u*u*20}if(o.t>11.6){R.g.visible=false;ZFA.out=null}}}catch(e){}return r}}
