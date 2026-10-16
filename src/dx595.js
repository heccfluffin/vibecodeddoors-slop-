/* r596: the L-WING WITH ROOMS, rebuilt. A doorway in the hall wall leads down a short passage into a corridor that runs alongside the hall,
   with side rooms (real doors, furniture, drawers, lockers) on BOTH sides of it. Sometimes the way on is in the wing: the hall's own end wall
   is blank and the exit door is on the far wall of the wing corridor. Some slots have a fake door instead of a room. */
var L2W=null;
const L2G={C:5.6,CW:3,H:6.6,g:1.3};
{const tp1=turnPlan;turnPlan=function(nn,prev,o){if(o&&o.wt0=='L2'&&L2W&&!o.MINE){const w=L2W;w.door=0;
  const nx=nn+1,ok=!o.first&&prev&&!HUB.on&&nn>=3&&nn<94&&!(MP.on&&!mpSeed)&&!(typeof DAILY!='undefined'&&DAILY.on)&&!(prev.dd&&prev.dd.side)&&!o.locked&&!(nx==50||nx==100||nx>=EXN||nx>=95||chIdx(nx)>=0||chIdx(nn)>=0);
  const hd=prev?(prev.hd|0):0;if(ok&&(hd==0||w.s==-hd)&&Math.random()<.4){w.door=1;return{ex:w.s,legs:[]}}return{ex:0,legs:[]}}
 return tp1.apply(this,arguments)}}
{const lo0=l2OK;l2OK=function(w){if(w&&w.v2)return false;return lo0.apply(this,arguments)}}
{const ml0=mkL2;mkL2=function(w,hot,trim4,wOff,Wr,obs0,nn,fds){if(!w.v2||!obs0)return ml0.apply(this,arguments);try{l2Build(w,hot,obs0,nn,w.fdq=[])}catch(e){conLog('error','L-wing: '+e.message)}}}
function l2Build(w,hot,obs0,nn,fds){const s=w.s,zc=w.z,{C,CW,H,g}=L2G,A0=4+C,A1=A0+CW,X=a=>s*a,R=Math.random,Wt=(a,b)=>T('wall',a,b),
  bw=(a0,a1,v0,v1)=>{const lo=Math.min(v0,v1),hi=Math.max(v0,v1),la=Math.abs(a1-a0);box(X((a0+a1)/2),2,zc+(lo+hi)/2,la,4,hi-lo,Wt(Math.max(la,hi-lo)/4,2))},
  K={B:(x,y,z,a,b,c,m)=>box(x,y,z,a,b,c,m),WN:hot?(l=>T('wains',l/1.2,1)):null,BS:hot?0x2a1608:null,RL:hot?0x6e4326:null,CR:hot?0xd8c8a8:null},
  mz=w.mzr=[],rect=(a0,a1,v0,v1)=>{const p=X(a0),q=X(a1);mz.push({x0:Math.min(p,q),x1:Math.max(p,q),z0:zc+Math.min(v0,v1),z1:zc+Math.max(v0,v1)})};
 /* what goes in each of the four slots: two on the outer wall of the corridor, two on the inner wall */
 const SL=[{t:1,a:A1,v:-3.3,hz:2.7,d:5},{t:1,a:A1,v:3.3,hz:2.7,d:5},{t:-1,a:A0,v:-3.8,hz:2.4,d:A0-4.3},{t:-1,a:A0,v:3.8,hz:2.4,d:A0-4.3}];
 if(w.door){const k=R()<.5?0:1;SL[k].k='exit';SL[1-k].k=R()<.6?'fake':'wall';w.exz=SL[k].v;w.exa=A1;for(const q of SL.slice(2))q.k='room'}
 else{let fk=0;for(const q of SL){if(!fk&&R()<.18){q.k='fake';fk=1}else q.k='room'}}
 /* the opening in the hall wall and the passage */
 box(s*4,3.5,zc,.1,1,g*2,Wt(g*2/4,.5));if(hot){box(s*3.92,3.0,zc,.1,.12,g*2+.24,0x5a3418);for(const o of[-1,1])box(s*3.92,1.5,zc+o*(g+.06),.1,3,.12,0x5a3418)}
 box(X(4+C/2),-.05,zc,C,.1,g*2,T('floor',C/2,g));box(X(4+C/2),4,zc,C,.1,g*2,T('ceil',C/2,g));for(const o of[-1,1])bw(4,A0,o*g-.05,o*g+.05);
 if(hot)for(const o of[-1,1])legTrim(K,X(4+C/2),zc+o*(g-.13),C-.1,'x',4);
 /* the corridor */
 box(X(A0+CW/2),-.05,zc,CW,.1,H*2,T('floor',CW/2,H));box(X(A0+CW/2),4,zc,CW,.1,H*2,T('ceil',CW/2,H));for(const o of[-1,1])bw(A0,A1,o*H-.05,o*H+.05);
 if(hot)for(const o of[-1,1])legTrim(K,X(A0+CW/2),zc+o*(H-.13),CW-.1,'x',4);
 for(const v of[-H/2,H/2]){const l=mkLight(0xffd9a0,.75,10);l.position.set(X(A0+CW/2),3.5,zc+v);RL.push(l);box(X(A0+CW/2),3.93,zc+v,.6,.06,.9,0xfff0c0,0xffd890)}
 /* the two long walls, with their doorways */
 const longWall=(a,gaps,tz)=>{gaps.sort((p,q)=>p[0]-q[0]);let v=-H;const tr=[];for(const[v0,v1,lin]of gaps){if(v0-v>.02){bw(a-.05,a+.05,v,v0);tr.push([v,v0])}if(lin)box(X(a),3.5,zc+(v0+v1)/2,.1,1,v1-v0,Wt((v1-v0)/4,.5));v=v1}if(H-v>.02){bw(a-.05,a+.05,v,H);tr.push([v,H])}
   if(hot)for(const[p,q]of tr){const p2=Math.max(p,-H+.1),q2=Math.min(q,H-.1);if(q2-p2>.1)legTrim(K,X(a+tz*.13),zc+(p2+q2)/2,q2-p2,'z',4)}};
 const gapsFor=t=>{const G2=[];for(const q of SL){if(q.t!=t)continue;if(q.k=='room'||q.k=='exit')G2.push([q.v-.8,q.v+.8,1]);else if(q.k=='fake')G2.push([q.v-.95,q.v+.95,0,1])}return G2};
 /* fake-door slots keep a solid wall behind the fake door, so only the trim is cut */
 const og=gapsFor(1),ig=gapsFor(-1);ig.push([-g,g,0]);
 const solid=(gl,a)=>gl.filter(q=>q[3]).forEach(q=>bw(a-.05,a+.05,q[0],q[1]));
 longWall(A1,og,-1);solid(og,A1);longWall(A0,ig,1);solid(ig,A0);
 rect(3.4,A0+.4,-g+.35,g-.35);rect(A0+.35,A1-.35,-H+.35,H-.35);
 /* the slots */
 for(const q of SL){const zs=zc+q.v,t=q.t,a=q.a,far=a+t*q.d;
  if(q.k=='fake'){try{mkFakeDoor('x',zs,X(a-t*.05),t>0?s:-s,nn,fds)}catch(e){conLog('error','L-wing fake door: '+e.message)}continue}
  if(q.k=='wall'){if(hot)legTrim(K,X(a-t*.13),zs,1.9,'z',4);continue}
  if(q.k=='exit')continue;
  box(X((a+far)/2),-.05,zs,q.d,.1,q.hz*2,T('floor',q.d/2,q.hz));box(X((a+far)/2),4,zs,q.d,.1,q.hz*2,T('ceil',q.d/2,q.hz));
  bw(far-.05,far+.05,q.v-q.hz,q.v+q.hz);for(const o of[-1,1])bw(Math.min(a,far),Math.max(a,far),q.v+o*q.hz-.05,q.v+o*q.hz+.05);
  rect(a-.6,a+.6,q.v-.5,q.v+.5);rect(a+t*.35,far-t*.4,q.v-q.hz+.4,q.v+q.hz-.4);
  const w2={s:t>0?s:-s,z:zs,hz:q.hz,d:q.d,g:.8,rm:1,sr:1,bx:t>0?a:-a};try{mkSideRoom(w2,obs0,false)}catch(e){conLog('error','L-wing room: '+e.message)}}}
/* after the room is built: the walkable areas, and the exit door moved into the wing */
function l2Finish(room,w,UP){try{if(!w||!w.v2)return;for(const q of w.mzr||[])room.mz.push(q);if(w.fdq&&room.fds)for(const f of w.fdq)room.fds.push(f);if(!w.door)return;const G=room.G,dd=room.dd,ez=-room.L-1,s=w.s;if(!dd||!dd.g)return;
  const pv=dd.g,DX=dd.cx||0,SX=w.exa,cz=w.z+w.exz;const hd=new THREE.Group();hd.position.set(s*SX,0,cz-s*.8);hd.rotation.y=-s*Math.PI/2;G.add(hd);
  const mv=[];for(const c of G.children){if(c===hd)continue;const p=c.position;if(Math.abs(p.z-(ez+.13))<.03&&Math.abs(p.x-DX)<1&&p.y>(UP||0)+.5)mv.push(c)}
  G.remove(pv);hd.add(pv);pv.position.set(0,0,0);for(const c of mv){const p=c.position.clone();G.remove(c);hd.add(c);c.position.set(p.x-(DX-.8),p.y-(UP||0),p.z-ez)}
  dd.side=s;dd.cz=cz;dd.sx=SX;dd.cx=0;room.ez0=ez;const xm=s*(4+L2G.C+L2G.CW/2);room.l2p=[[0,w.z],[xm,w.z],[xm,cz]]}catch(e){conLog('error','L-wing exit: '+e.message)}}
