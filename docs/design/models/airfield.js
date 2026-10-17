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
  /* shoulders: a strip of rougher, lighter tarmac each side */const st=afCanvas(512,64,(x,w,h)=>{afTarmac(x,w,h,'#6a6862',5)});st.wrapS=THREE.RepeatWrapping;st.repeat.set(12,1);for(const s of[-1,1])afPlane(g,RX0-3,RX1+3,s<0?RZ-RW/2-1.5:RZ+RW/2,s<0?RZ-RW/2:RZ+RW/2+1.5,.045,st,-1);
  /* blast pads past each end: chevrons */for(const e of[0,1]){const ct=afCanvas(256,256,(x,w,h)=>{afTarmac(x,w,h,'#5a5852',9);x.fillStyle='#e0c040';for(let i=0;i<3;i++){x.beginPath();const y=40+i*70;x.moveTo(0,y);x.lineTo(w/2,y+40);x.lineTo(w,y);x.lineTo(w,y+18);x.lineTo(w/2,y+58);x.lineTo(0,y+18);x.fill()}});const pl=afPlane(g,e?RX1:RX0-12,e?RX1+12:RX0,RZ-RW/2,RZ+RW/2,.045,ct,-1);pl.rotation.z=e?-Math.PI/2:Math.PI/2}}
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
