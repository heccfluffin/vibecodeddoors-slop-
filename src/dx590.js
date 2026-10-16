/* =====================================================================================================
   r589: THE HOTEL TURNS CORNERS.
   - Some rooms now have their exit door in a SIDE wall, near the far end, and the next room runs off at 90° from
     there. Every room still lines up with the next, and a room never turns so far that it could come back round
     into one that is still standing (the run only ever heads forward, left or right, never back).
   - Under the hood the world is re-centred on the room you are in at every door, turning as well as sliding.
   - Rush and Ambush follow a PATH through the rooms: down the middle of each hall, round the corner, through the
     real exit door. Ambush has a sound of its own now, a far-off hollow drone and a close-up shriek.
   ===================================================================================================== */

/* room-local <-> world (world = the frame the current room sits in, unrotated at the origin) */
function rWorld(r,lx,lz){const g=r.G,a=g.rotation.y||0,c=Math.cos(a),s=Math.sin(a);return[g.position.x+lx*c+lz*s,g.position.z-lx*s+lz*c]}
function rLocal(r,wx,wz){const g=r.G,a=g.rotation.y||0,c=Math.cos(a),s=Math.sin(a),dx=wx-g.position.x,dz=wz-g.position.z;return[dx*c-dz*s,dx*s+dz*c]}
/* ---------- deciding a turn (called from inside the room builder, with the room's own seeded random) ---------- */
function turnOK(nn,prev,o){if(o.first||!prev||HUB.on||nn<3||nn>=94||(MP.on&&!mpSeed))return 0;if(typeof DAILY!='undefined'&&DAILY.on)return 0;
 /* rooms whose exit IS the puzzle (vents, steam lock, pump, drawbridge, archive code, stairs up to the door, junctions and fake-door galleries) keep their door at the end */
 if(o.f||o.hh||o.sk||o.CI>=0||o.arcI||o.stI||o.xcr||o.itx||o.gal||o.lob||o.ex||o.mlt||o.cm||o.boss||o.ofcI==4||o.ofcI==5)return 0;
 if(['cat','vent','flood','press','libS','T','X','int'].includes(o.wt0))return 0;if(o.MINE&&nn%6==3)return 0;if(o.mk&&['cartpz','chasm','junction'].includes(o.mk))return 0;if(o.HX>7||o.L<14)return 0;
 const nx=nn+1;if(nx==50||nx==100||nx>=EXN||nx>=95||chIdx(nx)>=0||chIdx(nn)>=0)return 0;if(prev.dd&&prev.dd.side)return 0;/* never two corners in a row */
 const hd=prev.hd|0;if(Math.random()>.55)return 0;/* the run only heads forward, left or right: from a sideways stretch you can only turn back to forward */
 const pref=o.wt0=='lib'?1:0;if(hd==0)return pref||(Math.random()<.5?-1:1);return -hd}
/* where along the side wall the way on is: right at the end, a little before it (the hall carries on past it into a dead-end bay), or two thirds of the way down */

/* ---------- placing a room after the previous one ---------- */
function rmPlace(r,prev){if(!prev||!r||!r.G)return;const pg=prev.G,dd=prev.dd||{};let lx,lz,da;
 if(dd.side){lx=dd.side*((dd.sx||prev.hx||4)+1.12);lz=dd.cz;da=-dd.side*Math.PI/2}else{lx=0;lz=-prev.L-2;da=0}
 const[wx,wz]=rWorld(prev,lx,lz);r.G.position.x=wx;r.G.position.z=wz;r.G.rotation.y=(pg.rotation.y||0)+da;r.off=wz;r.hd=(prev.hd|0)+(dd.side?(da>0?-1:1):0)}
{const mk0=mkRoom;mkRoom=function(nn,first,off,prev){const r=mk0.apply(this,arguments);try{if(prev&&!first)rmPlace(r,prev);else r.hd=0}catch(e){conLog('error','room placement: '+e.message)}return r}}
/* ---------- the side exit: built after the room (the end wall gets closed up, the door moves to the side wall) ---------- */
/* ---------- corner legs ---------- */
function legMats(room,s,HY){const G=room.G,HX=room.hx;const tx=(m,rx,ry)=>{if(!m)return null;const c=m.clone();if(m.map){c.map=m.map.clone();c.map.needsUpdate=true;c.map.repeat.set(rx,ry)}return c};let wm=null,fm=null,cm=null,wn=null,rl=null,bs=null,cr=null;
 for(const c of G.children){if(!c.isMesh)continue;const sc=c.scale,p=c.position;if(!wn&&Math.abs(Math.abs(p.x)-(HX-.05))<.03&&Math.abs(p.y-.5)<.02&&Math.abs(sc.y-1)<.02&&sc.z>1&&c.material&&c.material.map)wn=c.material;if(!wm&&Math.abs(Math.abs(p.x)-HX)<.08&&Math.abs(sc.y-HY)<.05&&sc.z>2)wm=c.material;if(!fm&&p.y<0&&p.y>-.1&&sc.x>=HX*2-.1&&sc.z>4)fm=c.material;if(!cm&&Math.abs(p.y-HY)<.06&&sc.x>=HX*2-.1&&sc.z>4)cm=c.material;if(Math.abs(Math.abs(p.x)-HX)<.2&&Math.abs(p.x)<HX&&sc.z>1.5&&sc.y<.3){if(!rl&&Math.abs(p.y-1.03)<.08)rl=c.material;else if(!bs&&p.y<.2&&p.y>.02)bs=c.material;else if(!cr&&Math.abs(p.y-(HY-.07))<.1)cr=c.material}}
 wm=wm||new THREE.MeshStandardMaterial({color:0x8a7a5a});const B=(x,y,z,w,h,d,m)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);G.add(o);return o};
 return{B,RL:rl,BS:bs,CR:cr,WN:wn?(w=>tx(wn,w/1.2,1)):null,W:(w,h)=>tx(wm,w/4,h/2)||wm,F:(w,d)=>tx(fm,w/2,d/2)||new THREE.MeshStandardMaterial({color:0x6a3a2a}),C:(w,d)=>tx(cm,w/2,d/2)||new THREE.MeshStandardMaterial({color:0xe8e0d0})}}
/* if something this room built ended up across a corner opening, wall it back up; returns true when it did */
function legBlocked(room,s,cz,HY,K){const HX=room.hx,x0=s>0?HX-1.7:-HX,x1=s>0?HX:-HX+1.7,bad=(room.obs||[]).some(o=>!o.g&&o.x1>x0&&o.x0<x1&&o.z1>cz-1.1&&o.z0<cz+1.1)||(room.rf&&Math.abs(room.rf(cz)||0)>.25);
 if(!bad)return false;K.B(s*HX,HY/2,cz,.1,HY,HX*2+.02,K.W(HX*2,HY));room.wg=room.wg.filter(w=>!(w.tx&&w.s==s));return true}
/* the leg itself: floor, ceiling, its two long walls, trim, lamps, and the walkable area */
/* wainscot, chair rail, baseboard and crown along a wall: along 'x' (a long leg wall) or 'z' (an end wall) */
function legTrim(K,x,z,len,ax,HY,dir){if(len<.05)return;const B=K.B,W=(w,h,d)=>ax=='x'?[w,h,d]:[d,h,w],m=c=>new THREE.MeshStandardMaterial({color:c});if(K.WN){const g=W(len,1,.06);B(x,.5,z,g[0],g[1],g[2],K.WN(len))}if(K.BS){const g=W(len,.14,.06);B(x,.07,z,g[0],g[1],g[2],K.BS)}if(K.RL){const g=W(len+.02,.07,.07);B(x,1.03,z,g[0],g[1],g[2],K.RL)}if(K.CR){const g=W(len,.14,.06);B(x,HY-.07,z,g[0],g[1],g[2],K.CR)}}
function legEndTrim(room,K,s,SX,cz,HY,gap){if(room.mine)return;const ez=-room.L-1,z0=ez,z1=ez+room.hx*2;for(const[a,b]of[[z0+.1,cz-gap],[cz+gap,z1-.1]])legTrim(K,s*(SX-.13),(a+b)/2,b-a,'z',HY)}
function legBuild(room,s,cz,HY,LEG,K){const HX=room.hx,ez=-room.L-1,SX=HX+LEG,xm=s*(HX+LEG/2),z0=ez,z1=ez+HX*2,B=K.B;
 B(xm,-.05,(z0+z1)/2,LEG+.02,.1,HX*2,K.F(LEG,HX*2));B(xm,HY,(z0+z1)/2,LEG+.02,.1,HX*2,K.C(LEG,HX*2));B(xm,HY/2,z0,LEG,HY,.2,K.W(LEG,HY));B(xm,HY/2,z1,LEG,HY,.2,K.W(LEG,HY));
 if(!room.mine){for(const zz of[z0+.13,z1-.13])legTrim(K,xm,zz,LEG,'x',HY)}
 for(const u of LEG>6?[.5,LEG-1.5]:[LEG/2]){const l=mkLight(room.mine?0xffc070:0xffd9a0,.7,10);l.position.set(s*(HX+u),HY-.5,cz);room.RL.push(l);B(s*(HX+u),HY-.08,cz,.5,.1,1.1,new THREE.MeshStandardMaterial({color:0xfff0c0,emissive:0xffd890}))}
 room.mz.push({x0:s>0?HX-.8:-(SX-.6),x1:s>0?SX-.6:-HX+.8,z0:z0+.6,z1:z1-.6});return SX}
function sideExit(room,s,cz,HY,UP,LEG){const G=room.G,dd=room.dd,HX=room.hx,ez=-room.L-1;if(!dd||!dd.g)return;const pv=dd.g,DX=dd.cx||0;LEG=LEG||8;const K=legMats(room,s,HY),B=K.B,W=K.W;
 if(legBlocked(room,s,cz,HY,K)){/* the way on goes back to the end wall: cut the doorway back into it */for(const c of G.children.slice()){const p=c.position;if(c.isMesh&&Math.abs(p.z-ez)<.2&&Math.abs(p.x)<.02&&c.scale.x>=HX*2-.4)G.remove(c)}
  B((-HX+DX-.8)/2,HY/2,ez,HX+DX-.8,HY,.2,W(HX+DX-.8,HY));B((HX+DX+.8)/2,HY/2,ez,HX-DX-.8,HY,.2,W(HX-DX-.8,HY));B(DX,(UP+3+HY)/2,ez,1.6,HY-UP-3,.2,W(1.6,HY-3));/* the full-width end-wall trim would now run across the doorway: cut it back to either side */for(const c of G.children.slice()){const p=c.position;if(c.isMesh&&p.z>ez+.05&&p.z<ez+.26&&p.y<1.25&&c.scale.x>2.4&&Math.abs(p.x)<.3)G.remove(c)}if(!room.mine)for(const[a,b]of[[-HX+.09,DX-.93],[DX+.93,HX-.09]])if(b-a>.1)legTrim(K,(a+b)/2,ez+.13,b-a,'x',HY);return}
 const SX=legBuild(room,s,cz,HY,LEG,K),z0=ez,z1=ez+HX*2;
 for(const[a,b]of[[z0,cz-.8],[cz+.8,z1]])B(s*SX,HY/2,(a+b)/2,.2,HY,b-a,W(b-a,HY));B(s*SX,(3+UP+HY)/2,cz,.2,HY-3-UP,1.6,W(1.6,HY-3));legEndTrim(room,K,s,SX,cz,HY,.95);
 /* the door, its frame and its number plaque move from the end wall to the end of the leg */
 const hd=new THREE.Group();hd.position.set(s*SX,0,cz-s*.8);hd.rotation.y=-s*Math.PI/2;G.add(hd);
 const mv=[];for(const c of G.children){if(c===hd)continue;const p=c.position;if(Math.abs(p.z-(ez+.13))<.03&&Math.abs(p.x-DX)<1&&p.y>UP+.5)mv.push(c)}
 G.remove(pv);hd.add(pv);pv.position.set(0,UP,0);for(const c of mv){const p=c.position.clone();G.remove(c);hd.add(c);c.position.set(p.x-(DX-.8),p.y,p.z-ez)}
 const tw=room.wg.find(w=>w.tx&&w.s==s);if(tw)tw.d=LEG;dd.side=s;dd.cz=cz;dd.sx=SX;dd.cx=0;room.ez0=ez;room.leg=LEG}
/* a leg that is NOT the way on: it ends in a FAKE DOOR, or in a door to a little side room */
function legEnd(room,s,cz,HY,UP,LEG,end){const HX=room.hx,K=legMats(room,s,HY),B=K.B,W=K.W;if(legBlocked(room,s,cz,HY,K))return;const SX=legBuild(room,s,cz,HY,LEG,K),ez=-room.L-1,z0=ez,z1=ez+HX*2;
 if(end=='fake'){B(s*SX,HY/2,(z0+z1)/2,.2,HY,z1-z0,W(z1-z0,HY));legEndTrim(room,K,s,SX,cz,HY,.95);try{mkFakeDoor('x',cz,s*(SX-.1),s,room.n,room.fds)}catch(e){conLog('error','fake door: '+e.message)}return}
 /* the side room beyond the end of the leg */const RD=4.6,hz=2.5;for(const[a,b]of[[z0,cz-.8],[cz+.8,z1]])B(s*SX,HY/2,(a+b)/2,.2,HY,b-a,W(b-a,HY));B(s*SX,(3+HY)/2,cz,.2,HY-3,1.6,W(1.6,HY-3));legEndTrim(room,K,s,SX,cz,HY,.95);
 const xm=s*(SX+RD/2);B(xm,-.05,cz,RD,.1,hz*2,K.F(RD,hz*2));B(xm,4,cz,RD,.1,hz*2,K.C(RD,hz*2));B(s*(SX+RD),2,cz,.1,4,hz*2,W(hz*2,4));B(xm,2,cz-hz,RD,4,.1,W(RD,4));B(xm,2,cz+hz,RD,4,.1,W(RD,4));
 room.mz.push({x0:s>0?SX-.8:-(SX+.6),x1:s>0?SX+.6:-SX+.8,z0:cz-.5,z1:cz+.5},{x0:s>0?SX+.2:-(SX+RD-.45),x1:s>0?SX+RD-.45:-(SX+.2),z0:cz-hz+.45,z1:cz+hz-.45});
 if(!room.mine){legTrim(K,s*(SX+RD-.08),cz,hz*2-.1,'z',4);for(const sd of[-1,1])legTrim(K,xm,cz+sd*(hz-.08),RD-.1,'x',4);for(const sd of[-1,1])legTrim(K,s*(SX+.14),cz+sd*(hz+.9)/2,hz-.9,'z',4)}
 const w={s,z:cz,hz,d:RD,g:.8,rm:1,sr:1,bx:SX,mine:room.mine};try{mkSideRoom(w,room.obs,!!room.mine)}catch(e){conLog('error','leg room: '+e.message)}const tw=room.wg.find(q=>q.tx&&q.s==s);if(tw)tw.d=LEG+RD}
/* L-corner, a T with the way on to one side, or a T with the way on straight ahead and the side legs leading to a fake door or a side room */
function turnPlan(nn,prev,o){const s=turnOK(nn,prev,o);if(!s)return{ex:0,legs:[]};const hd=prev.hd|0,lg=()=>6+(Math.random()*7|0),sl=()=>4+(Math.random()*5|0),end=()=>o.MINE?'room':(Math.random()<.5?'fake':'room');const r=Math.random();
 if(hd!=0||r<.45)return{ex:s,legs:[{s,leg:lg(),end:'exit'}]};if(r<.75)return{ex:s,legs:[{s,leg:lg(),end:'exit'},{s:-s,leg:sl(),end:end()}]};return{ex:0,legs:[{s:1,leg:sl(),end:end()},{s:-1,leg:sl(),end:end()}]}}
/* ---------- walking through a side door ---------- */
{const wk0=walkOK;walkOK=function(x,z){const d=dor;if(d&&d.side&&d.open&&!HUB.on){const sx=d.sx||CW;if(Math.abs(z-d.cz)<.5&&x*d.side>sx-1&&x*d.side<sx+1.4)return true}return wk0.apply(this,arguments)}}
function sideDoorTick(){try{srTick()}catch(e){}const d=dor;if(!d||!d.side||HUB.on||BSM||ORG)return;const s=d.side,sx=d.sx||CW;if(!d.open&&P.x*s>sx-.9&&Math.abs(P.z-d.cz)<1.3)touch();if(d.open&&P.x*s>sx-.6)P.z=Math.max(d.cz-.5,Math.min(d.cz+.5,P.z));if(d.open&&P.x*s>sx+.5&&RMS[ci+1])enter()}
/* ---------- re-centring the world on a room (sliding and turning) ---------- */
function worldTo(o){const a=o.G.rotation.y||0,ox=o.G.position.x,oz=o.G.position.z;if(Math.abs(a)<1e-6&&Math.abs(ox)<1e-6)return{dz:-oz,rot:0};
 const c=Math.cos(-a),s=Math.sin(-a);const X=(x,z)=>{const dx=x-ox,dz=z-oz;return[dx*c+dz*s,-dx*s+dz*c]};const mvP=p=>{const[x,z]=X(p.x,p.z);p.x=x;p.z=z};const mvO=m=>{if(!m)return;mvP(m.position);m.rotation.y-=a};
 const RS=new Set(RMS);for(const e of EV)for(const r of e.rooms||[])RS.add(r);for(const r of RS){mvO(r.G);r.off=r.G.position.z}for(const e of EV){mvO(e.m)}for(const q of VFX)if(q.s)mvP(q.s.position);
 try{if(typeof CRK!='undefined'&&CRK){for(const p of CRK.pts){if(p.x!=null)mvP(p);else p.z-=oz}if(CRK.m)mvO(CRK.m);if(CRK.lz!=null)CRK.lz-=oz}}catch(e){}
 try{for(const id in MP.remotes){const r=MP.remotes[id];if(r.g)mvO(r.g);if(r.gh)for(const k in r.gh)mvO(r.gh[k].g)}}catch(e){}
 if(REVA)mvO(REVA.g);if(HC)mvO(HC.m);{const pz=P.z;const[x,z]=X(P.x,pz);P.x=x;P.z=z;P.yaw-=a}return{dz:0,rot:a}}
/* ---------- Rush and Ambush: paths ---------- */
function evPath(e){const L=[],RR=e.rooms;for(let i=0;i<RR.length;i++){const r=RR[i];if(!r)continue;const d=r.dd||{};if(i==0)L.push([r,0,9]);L.push([r,0,.5]);
  if(d.side){if(r.l2p)for(const q of r.l2p)L.push([r,q[0],q[1]]);else L.push([r,0,d.cz]);L.push([r,d.side*((d.sx||r.hx)+.6),d.cz])}else{const cx=d.cx||0;if(Math.abs(cx)>.3){L.push([r,0,-r.L+2.5]);L.push([r,cx,-r.L+2.5])}L.push([r,cx,-r.L-1])}
  if(i==RR.length-1){if(d.side)L.push([r,d.side*((d.sx||r.hx)+9),d.cz]);else L.push([r,d.cx||0,-r.L-9])}}
 const W=L.map(([r,x,z])=>{const[a,b]=rWorld(r,x,z);return[a,b,r]});const S=[0];for(let i=1;i<W.length;i++)S.push(S[i-1]+Math.hypot(W[i][0]-W[i-1][0],W[i][1]-W[i-1][1]));return{W,S,T:S[S.length-1]}}
function pthAt(pth,s){const{W,S}=pth;s=Math.max(0,Math.min(pth.T,s));let i=1;while(i<S.length-1&&S[i]<s)i++;const k=(s-S[i-1])/Math.max(1e-6,S[i]-S[i-1]);return{x:W[i-1][0]+(W[i][0]-W[i-1][0])*k,z:W[i-1][1]+(W[i][1]-W[i-1][1])*k,dx:W[i][0]-W[i-1][0],dz:W[i][1]-W[i-1][1],r:W[i][2]}}
/* the doors along the path: how far along the path each one is */
function evDoorS(pth){const out=[];const{W,S}=pth;for(let i=0;i<W.length;i++){const r=W[i][2];if(!r||out.some(o=>o.r===r))continue;const d=r.dd||{};const[x,z]=d.side?rWorld(r,d.side*(d.sx||r.hx),d.cz):rWorld(r,d.cx||0,-r.L-1);let best=0,bd=1e9;for(let j=0;j<W.length;j++){const q=Math.hypot(W[j][0]-x,W[j][1]-z);if(q<bd){bd=q;best=S[j]}}out.push({r,s:best})}return out}
/* ---------- Ambush's own sound: a hollow, wavering drone far off, a rising shriek up close ---------- */
function ambAu(e,d,dt){try{AC=AC||new AudioContext();if(AC.state=='suspended')AC.resume();
 if(!e.au){const mk=(ty,f)=>{const o=AC.createOscillator();o.type=ty;o.frequency.value=f;o.start();return o},lp=AC.createBiquadFilter(),bp=AC.createBiquadFilter(),gR=AC.createGain(),gS=AC.createGain(),mg=AC.createGain(),lg=AC.createGain(),tg=AC.createGain(),lf=mk('sine',5.5),tr=mk('sine',2.2);
  lp.type='lowpass';lp.frequency.value=320;bp.type='bandpass';bp.frequency.value=1100;bp.Q.value=2.2;lg.gain.value=38;tg.gain.value=.35;
  const r1=mk('triangle',82),r2=mk('sawtooth',123),s1=mk('sine',640),s2=mk('sawtooth',960),s3=mk('triangle',1290);
  r1.connect(lp);r2.connect(lp);lp.connect(gR);lf.connect(lg);lg.connect(s1.frequency);lg.connect(s2.frequency);lg.connect(s3.frequency);s1.connect(bp);s2.connect(bp);s3.connect(bp);bp.connect(gS);tr.connect(tg);tg.connect(gR.gain);gR.connect(mg);gS.connect(mg);mg.gain.value=0;mg.connect(AC.destination);
  e.au={gR,gS,mg,s1,s2,s3,r1,r2,lf:tr,l2:lf,pd:d}}
 const a=e.au,C=AC.currentTime,v=(a.pd-d)/Math.max(dt,.001);a.pd=d;const vol=Math.pow(Math.max(0,1-d/220),1.3),sc=Math.max(0,Math.min(1,(70-d)/45)),dp=1+Math.max(-.18,Math.min(.18,v/300));
 a.mg.gain.setTargetAtTime(.5*vol,C,.06);a.gR.gain.setTargetAtTime(.8*(1-sc*.7),C,.06);a.gS.gain.setTargetAtTime(.5*sc,C,.06);a.r1.frequency.setTargetAtTime(82*dp,C,.06);a.r2.frequency.setTargetAtTime(123*dp,C,.06);
 a.s1.frequency.setTargetAtTime(640*dp*(1+.5*sc),C,.06);a.s2.frequency.setTargetAtTime(960*dp*(1+.5*sc),C,.06);a.s3.frequency.setTargetAtTime(1290*dp*(1+.4*sc),C,.06)}catch(x){}}
{const rs0=rushStop;rushStop=function(e){const a=e&&e.au;if(a&&a.l2){e.au=null;try{a.mg.gain.setTargetAtTime(0,AC.currentTime,.08)}catch(x){}setTimeout(()=>[a.r1,a.r2,a.s1,a.s2,a.s3,a.lf,a.l2].forEach(o=>{try{o.stop()}catch(x){}}),700);return}return rs0.apply(this,arguments)}}
/* ---------- one step of Rush / Ambush along its path; returns the old and new position ---------- */
function evStep(e,sp){if(!e.rooms)return null;e.pth=evPath(e);e.ds=evDoorS(e.pth);const p0=pthAt(e.pth,e.s);e.s+=e.d*sp;const p1=pthAt(e.pth,e.s);e.m.position.x=p1.x;e.m.position.z=p1.z;if(p1.dx||p1.dz)e.m.rotation.y=Math.atan2(-p1.dx*e.d,-p1.dz*e.d);
 /* doors ahead get kicked open */if(e.d>0)for(const q of e.ds){const r=q.r;if(r.dd.open||r.locked||r.mb>0||(r.cave&&!r.cave.done)||r.el||(r.pz&&!r.pz.open)||(r.dgt&&r.dgt.p<1)||r.n>=100)continue;const ah=q.s-e.s;if(ah>0&&ah<7){r.dd.open=1;r.dd.fast=1;snd(90,.35)}}
 return{p0,p1}}
function evHitTest(e,st,sp){/* in the current frame, which is the current room's: along the way it is going, and across it */const ux=st.p1.dx,uz=st.p1.dz,L=Math.hypot(ux,uz)||1,fx=ux/L*e.d,fz=uz/L*e.d,dx=P.x-st.p0.x,dz=P.z-st.p0.z,al=dx*fx+dz*fz,ac=Math.abs(dx*fz-dz*fx);
 if(e.k=='rush')return al>=-1&&al<=sp+1&&ac<3.7;return Math.abs(al)<2.5&&ac<Math.max(3.7,CW)}
function evDist(e){return Math.hypot(e.m.position.x-P.x,e.m.position.z-P.z)}

/* Rush breaks the lights of the rooms it tears through; both of them vanish at Honcho's office / the elevator; Ohien drags them under */
rushBreaks=function(e){if(e.k!='rush'||!e.pth)return;const r=pthAt(e.pth,e.s).r;if(!r)return;const i=RMS.indexOf(r);if(i<0||i>ci)return;if(!e.brk)e.brk=new Set();if(e.brk.has(r))return;e.brk.add(r);if(breakLights(r)&&!e.lbm){e.lbm=1;hint('💥 The lights shatter as Rush tears past! The dark is coming...')}};
evBossSkip=function(e,m){if(!e.pth)return;const r=pthAt(e.pth,e.s).r;if(!r||!(r.boss||r.el))return;e.gone=1;if(RMS[ci]===r||RMS[ci]&&Math.abs(RMS[ci].n-r.n)<=1){if(!e.bk){e.bk=1;hint('🕴️ '+(e.k=='rush'?'Rush':'Ambush')+' stops dead at the door of '+(r.boss?'Honcho\'s office':'the elevator')+' and fades away.')}}};
ohBanishCheck=function(e,m){if(e.dem||e.cx>0||!e.pth)return false;const r=pthAt(e.pth,e.s).r;if(r&&r.oh){const[lx,lz]=rLocal(r,m.position.x,m.position.z);if(lz<-1.2&&lz>-r.L+.6){conLog('event',(e.k=='rush'?'Rush':'Ambush')+' #'+e.id+' was dragged under by Ohien (door '+r.n+')');startDem(e,m,r);return true}}return false};

/* =====================================================================================================
   SIDE ROOMS WITH DOORS. The little rooms off the hotel halls are real rooms now: a door you walk into (it swings
   open), and inside a BEDROOM, a BATHROOM, a STUDY or a LINEN CLOSET, furnished, with drawers to search and a
   wardrobe to hide in. In the mines the side rooms are a BUNK ROOM, a TOOL SHED or a POWDER STORE behind a plank door.
   ===================================================================================================== */
const SRQ=[];
function srDrawer(x,z,len,fs,cols,y0){const L2=len||1.4,H=y0||1;box(x,H/2,z,.9,H,L2,cols[0]);const dg=new THREE.Group();G.add(dg);dg.add(box(x,H-.38,z,.8,.14,L2-.3,cols[1]));dg.add(box(x+fs*.48,H-.32,z,.06,.4,L2-.2,cols[2]));dg.add(box(x+fs*.53,H-.32,z,.06,.06,.2,cols[3]));
 const r2=Math.random(),lt=r2<.5?['g',5+(Math.random()*30|0)]:r2<.62?['v',1]:r2<.7?['l',1]:r2<.74?['f',1]:r2<.77?['b',1]:null,it=lt&&loot(lt[0],lt[1]);if(it){it.position.set(x+fs*.22,H-.31,z);dg.add(it)}drs.push({x,z,o:0,fr:dg,lt,it,s:fs});return dg}
function mkSideRoom(w,obs0,MINE){const{s,z,hz,d}=w,B0=w.bx||4,X=u=>s*(B0+u),R=Math.random,ob=(u0,u1,z0,z1)=>{const a=X(u0),b=X(u1);obs0.push({x0:Math.min(a,b),x1:Math.max(a,b),z0,z1})},B=(u,y,zz,lu,h,lz,c,e)=>box(X(u),y,zz,lu,h,lz,c,e),fs=-s;
 const kinds=MINE?['bunk','tool','powder']:['bed','bed','bath','study','linen'],k=w.srk||(w.srk=kinds[R()*kinds.length|0]);
 /* a light */{const l=mkLight(MINE?0xffc070:0xffe2b8,.7,8);l.position.set(X(d/2),3.4,z);RL.push(l);if(MINE){B(d/2,3.7,z,.05,.6,.05,0x2a2a2a);B(d/2,3.3,z,.2,.28,.2,0xfff0b0,0xffb040)}else B(d/2,3.93,z,.6,.06,.6,0xf4ead0,0xffe8b0)}
 /* the door: a leaf hinged in the opening, solid until it swings open */const hg=new THREE.Group();hg.position.set(s*B0,0,z-.8);G.add(hg);for(const dz of[-.86,.86])for(const sd of[-1,1]){const fr=new THREE.Mesh(new THREE.BoxGeometry(.06,3.1,.12),new THREE.MeshStandardMaterial({color:MINE?0x3a2410:0x24160a}));fr.position.set(s*B0+sd*.08,1.55,z+dz);G.add(fr);fr.userData.keep=1}{const fr=new THREE.Mesh(new THREE.BoxGeometry(.22,.12,1.84),new THREE.MeshStandardMaterial({color:MINE?0x3a2410:0x24160a}));fr.position.set(s*B0,3.06,z);G.add(fr);fr.userData.keep=1}const lf=new THREE.Mesh(new THREE.BoxGeometry(.08,2.98,1.58),MINE?new THREE.MeshStandardMaterial({color:0x6a4a2a,roughness:.95}):new THREE.MeshStandardMaterial({map:T('door',1,1)}));lf.position.set(0,1.49,.8);hg.add(lf);lf.userData.keep=1;
 if(MINE){for(const y of[.5,1.3,2.1]){const pl=new THREE.Mesh(new THREE.BoxGeometry(.1,.12,1.5),new THREE.MeshStandardMaterial({color:0x4a3018}));pl.position.set(-s*.05,y,.76);hg.add(pl);pl.userData.keep=1}}
 const kn=new THREE.Mesh(new THREE.SphereGeometry(.05,8,6),new THREE.MeshStandardMaterial({color:0xd8a830,metalness:.8}));kn.position.set(-s*.07,1.05,1.4);hg.add(kn);kn.userData.keep=1;if(!MINE){const pl=new THREE.Mesh(new THREE.BoxGeometry(.02,.14,.3),new THREE.MeshStandardMaterial({color:0xc8a040,metalness:.7}));pl.position.set(-s*.05,1.9,.76);hg.add(pl)}
 const dr={g:hg,p:0,open:0,x:s*B0,z,s};obs0.push({x0:s*B0-.12,x1:s*B0+.12,z0:z-.8,z1:z+.8,g:dr});SRQ.push(dr);
 const H=MINE?[0x5a3a1e,0x3a2410,0x7a5028,0xc0a060]:[0x5c3a1e,0x24160a,0x7a5028,0xd4a850];
 if(k=='bed'){/* a bed against the far side wall, head to the back; a nightstand; a wardrobe to hide in; a rug and a picture */
  const bz=z+hz-.62;B(2.2,.25,bz,2.1,.3,1.15,0x5a3a22);B(2.2,.48,bz,2,.16,1.08,0xf0ece0);B(2.55,.6,bz,1.3,.08,1.1,[0x8a2a2a,0x2a4a7a,0x3a6a3a][R()*3|0]);B(1.45,.62,bz,.35,.12,.75,0xffffff);B(3.33,.75,bz,.08,1.2,1.2,0x4a2a14);ob(1.15,3.4,bz-.6,bz+.6);
  srDrawer(X(3.0),z+hz-1.6,.7,fs,H,.62);B(3.0,.75,z+hz-1.6,.12,.12,.12,0xffe8a0,0xffd080);ob(2.55,3.45,z+hz-1.95,z+hz-1.25);
  const lx=X(d-.78);wards.push({x:lx,z:z-hz+.75});locker(lx,z-hz+.75,fs);
  B(1.5,.012,z,1.8,.02,1.4,0x7a3a3a);if(R()<.8)B(d-.05,2.1,z,.04,.6,.8,[0x5a7a9a,0x9a6a3a,0x6a8a5a][R()*3|0])}
 else if(k=='bath'){/* tiled floor; a tub along one side wall with a shower curtain rail; a vanity with a drawer and a mirror on the back wall; a toilet against the other side wall */
  B(d/2,.003,z,d-.1,.01,hz*2-.1,0xe8e8f0);for(let u=.5;u<d;u+=.5)B(u,.008,z,.01,.004,hz*2-.1,0x9aa0b0);for(let zz=z-hz+.5;zz<z+hz;zz+=.5)B(d/2,.008,zz,d-.1,.004,.01,0x9aa0b0);
  const tz=z-hz+.48;B(d-1.4,.3,tz,1.9,.6,.85,0xf4f4f8);B(d-1.4,.58,tz,1.7,.04,.68,0x90b8d8);B(d-.55,.75,tz,.06,.3,.06,0xb0b0b8);ob(d-2.4,d,z-hz,z-hz+.95);B(d-1.4,2.3,tz+.42,1.95,.03,.03,0xb0b0b8);B(d-1.4,1.6,tz+.44,1.9,1.4,.02,0xd8e8f0);
  srDrawer(X(d-.5),z+.2,1.0,fs,[0xe8e4dc,0xd0ccc4,0xf4f0e8,0xb0b0b8],.85);B(d-.5,.95,z+.2,.95,.06,1.1,0xf4f4f8);B(d-.5,1.0,z+.2,.45,.06,.5,0xd8e0e8);B(d-.03,1.75,z+.2,.03,.8,.9,0xb8d8e8);B(d-.06,2.2,z+.2,.06,.06,.6,0xfff0c0,0xffe0a0);ob(d-1,d,z-.4,z+.8);
  const tw=z+hz-.38;B(1.6,.22,tw-.05,.42,.44,.52,0xf4f4f8);B(1.6,.46,tw-.05,.44,.05,.55,0xf0f0f0);B(1.6,.66,tw+.17,.46,.42,.18,0xf4f4f8);ob(1.35,1.85,tw-.35,z+hz);B(.7,1.2,z+hz-.06,.4,.04,.04,0xb0b0b8);B(.7,1.05,z+hz-.08,.3,.3,.02,0xf0e8d8)}
 else if(k=='study'){/* a desk with a drawer, a chair, a bookcase, a wardrobe */
  srDrawer(X(d-.55),z-.6,1.2,fs,H,.78);B(d-.55,.8,z-.6,.95,.05,1.5,0x6a4426);B(d-.55,1.05,z-.95,.25,.35,.3,0x2a2a2a);B(d-1.35,.45,z-.5,.45,.06,.45,0x3a2414);B(d-1.6,.75,z-.5,.06,.6,.45,0x3a2414);ob(d-1.1,d,z-1.3,z+.1);
  B(1.6,1.1,z+hz-.25,1.6,2.2,.4,0x4a2a14);for(let r2=0;r2<4;r2++)B(1.6,.35+r2*.5,z+hz-.42,1.4,.38,.05,[0x7a2a2a,0x2a5a3a,0x2a3a6a,0x8a6a2a][r2]);ob(.75,2.45,z+hz-.5,z+hz);
  const lx=X(d-.78);wards.push({x:lx,z:z+hz-1.35});locker(lx,z+hz-1.35,fs)}
 else if(k=='linen'){/* shelves of folded sheets, a laundry cart, a chest of drawers */
  for(const zz of[z-hz+.3,z+hz-.3])for(let y=.4;y<2.4;y+=.6){B(d/2+.4,y,zz,d-1.2,.05,.5,0x7a5a3a);for(let u=1.2;u<d-.4;u+=.55)B(u,y+.13,zz,.45,.2,.4,[0xf0f0f0,0xe0e8f0,0xf0e8d8][R()*3|0])}ob(.8,d,z-hz,z-hz+.6);ob(.8,d,z+hz-.6,z+hz);
  srDrawer(X(d-.5),z,1.2,fs,H,1)}
 else if(k=='bunk'){/* a timber bunk bed, a footlocker, a lantern on a crate */
  const bz=z+hz-.55;for(const y of[.4,1.6]){B(2.1,y,bz,2,.12,.95,0x5a3a1e);B(2.1,y+.1,bz,1.9,.1,.85,0x8a7a5a)}for(const u of[1.1,3.1])for(const dz of[-.45,.45])B(u,1,bz+dz,.08,2,.08,0x4a3018);ob(1.05,3.15,bz-.5,bz+.5);
  srDrawer(X(d-.55),z-.9,.9,fs,H,.6);const lx=X(d-.78);wards.push({x:lx,z:z-hz+.65});locker(lx,z-hz+.65,fs)}
 else if(k=='tool'){/* a workbench with a tool chest, a rack of shovels and picks, crates */
  srDrawer(X(d-.5),z,1.4,fs,H,.95);B(d-.5,1.0,z,1,.08,1.9,0x6a4a2a);B(d-.06,1.7,z,.05,.9,1.8,0x5a4a3a);for(let i=0;i<5;i++)B(d-.12,1.6,z-.7+i*.35,.05,.6,.05,0x8a8e94);ob(d-1,d,z-1,z+1);
  for(const zz of[z-hz+.5,z+hz-.5]){B(1.2,.35,zz,.7,.7,.7,0x7a5a32);ob(.85,1.55,zz-.35,zz+.35)}}
 else if(k=='powder'){/* barrels, a crate stamped DANGER, shelves; a cabinet */
  for(const[u,zz]of[[1.2,z-hz+.45],[1.9,z-hz+.45],[1.2,z+hz-.45]]){const m=new THREE.Mesh(new THREE.CylinderGeometry(.32,.32,.9,12),new THREE.MeshStandardMaterial({color:0x6a3a1a}));m.position.set(X(u),.45,zz);G.add(m);ob(u-.35,u+.35,zz-.35,zz+.35)}
  B(2.6,.4,z+hz-.5,.8,.8,.7,0x9a7a3a);B(2.6,.4,z+hz-.14,.5,.25,.02,0xc02020);ob(2.2,3,z+hz-.85,z+hz);srDrawer(X(d-.5),z-.5,1.1,fs,H,1)}}
/* the doors swing open when you walk up to them (and stay open) */
function srTick(){const r=RMS[ci];if(!r||!r.srd)return;const now=performance.now(),dt=Math.min(.1,(now-(srTick.t||now))/1000);srTick.t=now;for(const d of r.srd){if(!d.open&&Math.hypot(P.x-d.x,P.z-d.z)<1.7){d.open=1;try{doorSnd()}catch(e){snd(200,.1)}}if(d.open&&d.p<1){d.p=Math.min(1,d.p+dt*2.2);d.g.rotation.y=d.s*1.5*(1-Math.pow(1-d.p,3))}}}
{const mk1=mkRoom;mkRoom=function(){SRQ.length=0;const r=mk1.apply(this,arguments);try{r.srd=SRQ.splice(0)}catch(e){}return r}}
