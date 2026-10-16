/* =====================================================================================================
   r605: BETTER AI DRIVING (squads, the Wraith autopilot, the police, the backup cars, crime getaway cars).
   They all used to drive the same way: wheel at full lock and foot down, so a point close beside them was
   circled for ever; turns were taken at full speed, so they ran wide and missed gaps; when stuck they backed
   up a little (some with the wheel the wrong way) and drove into the same wall again.
   Now one shared driver:
   - SLOWS DOWN for sharp bends and before corners (slow = tight turns, so they fit through gaps),
   - does a THREE-POINT TURN when the point is inside its tightest turning circle (backs up with the wheel
     turned so the nose swings round, then goes),
   - when STUCK backs up steering one way, the next time the other way, and asks for a new route,
   - notices when it is GOING ROUND IN CIRCLES (not getting closer for a while) and plans again,
   - feels ahead for walls and cars on both sides evenly, leaning towards the side the target is on.
   Squads also wait for their route instead of driving straight at the goal while it is being worked out
   (that is how they ended up at the foot of mesas), and the cars behind the leader follow its actual track.
   Police backup cars now plan routes round buildings too.
   ===================================================================================================== */
function aiClamp(x){return Math.max(-1,Math.min(1,x))}
/* feelers: is there a clear run along this heading? (walls, rocks, cars; things that break when hit don't count, barrels do) */
function aiProbe(q,v,s,want,dt,ign,reach){s.pbT=(s.pbT||0)-dt;if(s.pbT>0&&s.pbD!=null)return wrapA(want+s.pbD);s.pbT=.15;
 const Ls=[3,6,10,14].filter(L=>L<=Math.max(3,reach||14)),ig=ign||[];
 const clear=hh=>{for(const L of Ls){const px=v.x-Math.sin(hh)*L,pz=v.z-Math.cos(hh)*L,sv=v.hitO;let ok=false;try{ok=vehOK(q,v,px,pz,hh)&&(v.air||vehGround(q,px,pz)-v.y<.6+L*.3)/* a slope you can drive up is not a wall */}catch(e){ok=true}const hit=v.hitO;v.hitO=sv;if(!ok&&!ig.includes(hit)&&!(hit&&hit.m&&hit.kd&&hit.kd!='barrel'))return false}return true};
 /* smallest change first; on a tie, the side we are already turning towards, then the side we picked last time */
 const pref=Math.sign(wrapA(want-v.h))||Math.sign(s.pbD||0)||1,last=s.pbD||0;const ds=[0,.3,-.3,.6,-.6,.95,-.95,1.35,-1.35,1.8,-1.8];
 ds.sort((a,b)=>(Math.abs(a)+Math.abs(a-last)*.4+(Math.sign(a)===pref?0:.05))-(Math.abs(b)+Math.abs(b-last)*.4+(Math.sign(b)===pref?0:.05)));
 for(const d of ds)if(clear(want+d)){s.pbD=d;return wrapA(want+d)}s.pbD=0;return want}
/* the driver: from the heading we want and how far the point is, work out throttle and steering.
   o: {max: top speed, stop: stop this far from the point (or null), ramp: a jump run (straight and fast),
       turn: how sharp the bend is at the point (radians), orbit: false for targets that move about}.
   Leaves s.replan=1 when a new route would help. s.am==1 while backing up (s.amK==1 means because it got stuck). */
function aiCtl(q,v,s,want,d,dt,o){o=o||{};const K=v.K,tk=!!K.tank,turn=K.turn||1.5,Rm=5/turn*1.1,sp=v.v,dh=wrapA(want-v.h),a=Math.abs(dh),sg=Math.sign(dh)||1,max=o.max||K.max||14,stopping=o.stop!=null;
 if(o.ramp){s.am=0;s.stk=0;return[1,aiClamp(-dh*3)]}
 /* backing up: the wheel turned so the nose swings round towards the point */
 if(s.am==1){s.amT-=dt;s.amE=(s.amE||0)+dt;if(Math.abs(sp)<.3&&s.amE>.5)s.amB=(s.amB||0)+dt;else s.amB=0;
  if(s.amT<=0||s.amB>.45||(a<.5&&s.amE>.5)){s.am=0;s.amK=0;s.stk=0;s.amB=0}else return[-1,s.amS]}
 /* tanks turn on the spot */
 if(tk&&a>.7&&!(stopping&&d<=o.stop)){s.stk=0;return[Math.abs(sp)>2?-1:0,aiClamp(-dh*2.5)]}
 /* how fast: slow for sharp bends (slow means a tight turn), before a corner, and when stopping */
 let vt=max;if(a>1.25)vt=Math.min(vt,4.5);else if(a>.7)vt=Math.min(vt,Math.max(6,max*.35));else if(a>.35)vt=Math.min(vt,Math.max(9,max*.6));
 if(o.turn>.5){const vc=o.turn>1.3?5.5:o.turn>.9?8:12;vt=Math.min(vt,Math.sqrt(vc*vc+2*6*Math.max(0,d-4)))}
 if(stopping)vt=Math.min(vt,Math.sqrt(2*5*Math.max(0,d-o.stop)));
 /* the point is inside the tightest circle we can drive: it cannot be reached going forwards, so a three-point turn */
 const ah=d*Math.cos(dh),lt=Math.abs(d*Math.sin(dh)),inMin=Math.hypot(ah,lt-Rm)<Rm;
 if(!tk&&inMin&&!o.noRev&&d>1.5&&!(stopping&&d<=o.stop+1.5)){s.am=1;s.amK=0;s.amE=0;s.amT=.9+a*.35;s.amS=sg;return[-1,sg]}
 let fx=sp<vt-.4?1:sp>vt+1.5?-1:sp>vt?0:.35;if(stopping&&d<=o.stop)fx=sp>.5?-1:sp<-.5?1:0;const sx=aiClamp(-dh*2.4);
 /* stuck: pushing and going nowhere. Back up steering one way (the other way on the next try), and plan again */
 if(fx>.3&&Math.abs(sp)<.6){s.stk=(s.stk||0)+dt;if(s.stk>.9){s.stk=0;s.nS=(s.nS|0)+1;s.am=1;s.amK=1;s.amE=0;s.amT=1.1+Math.min(.8,a*.4);s.amS=s.nS%2?sg:-sg;if(s.nS%2==0)s.replan=1;return[-1,s.amS]}}else s.stk=Math.max(0,(s.stk||0)-dt*.5);
 /* going round in circles: no closer for a good while */
 if(o.orbit!==false&&!(stopping&&d<=o.stop+2)){if(s.obD==null||d<s.obD-1.5||d>s.obD+25){s.obD=d;s.obT=0}else if(Math.abs(sp)>1)s.obT=(s.obT||0)+dt;if(s.obT>7){s.obT=0;s.obD=d;s.replan=1;if(a>.6&&!tk){s.am=1;s.amK=0;s.amE=0;s.amT=1.2;s.amS=sg;return[-1,sg]}}}else{s.obD=null;s.obT=0}
 return[fx,sx]}
/* a path point we have driven past (it is behind us and the next one is ahead): move on */
function aiPassed(v,w,nx,d){if(!nx||d>15)return false;const fx=-Math.sin(v.h),fz=-Math.cos(v.h);return (w[0]-v.x)*fx+(w[1]-v.z)*fz<0&&(nx[0]-v.x)*fx+(nx[1]-v.z)*fz>0}
/* how sharp the bend is at path point i */
function aiBend(x,z,p,n){if(!p||!n)return 0;return Math.abs(wrapA(Math.atan2(-(n[0]-p[0]),-(n[1]-p[1]))-Math.atan2(-(p[0]-x),-(p[1]-z))))}

/* ---------- squads (and the crime getaway cars and responding police, which use the same driver) ---------- */
function cwDrive2(q,u,gx,gz,dt,max,dist){const v=u.v,real=Math.hypot(gx-v.x,gz-v.z);u.c=u.c||{};const C=u.c;let tx=gx,tz=gz,tag=null,bend=0,mx=Math.min(max,VEHK[v.k].max||14),wait=false;
 if(dist===0&&real>=6){
  if(typeof bgIn=='function'&&bgIn(v.x,v.z)&&bgIn(gx,gz)){/* inside Fort Blackout: the base grid */
   if(!C.bpT||Math.hypot(C.bpT[0]-gx,C.bpT[1]-gz)>3||u.replan){u.replan=0;C.bpT=[gx,gz];C.bp=bgPath(q,v.x,v.z,gx,gz,[])||null;C.bi=0}
   const p=C.bp;if(p&&p.length){while(C.bi<p.length-1){const w=p[C.bi],dd=Math.hypot(w[0]-v.x,w[1]-v.z);if(dd<4||aiPassed(v,w,p[C.bi+1],dd))C.bi++;else break}const w=p[C.bi];tx=w[0];tz=w[1];bend=aiBend(v.x,v.z,w,p[C.bi+1])}}
  else{/* out in the desert: the police route grid (round buildings, up the ramps) */
   if(!C.tg||Math.hypot(C.tg[0]-gx,C.tg[1]-gz)>3||(u.replan&&!(C.jobs&&C.jobs.path))){u.replan=0;C.tg=[gx,gz];C.path=null;C.pi=0;C.pf=0;navReq(q,C,'path',v.x,v.z,gx,gz,1)}navWork(C,2);
   if(C.path&&C.path.length){const pt=navSteer(C,v.x,v.z,10);if(pt){tx=pt[0];tz=pt[1];tag=pt[2]||null;bend=aiBend(v.x,v.z,pt,C.path[(C.pi|0)+1])}}
   else if(C.jobs&&C.jobs.path)wait=true;/* still working out the route: creep, don't charge at the goal */}}
 const d=Math.hypot(tx-v.x,tz-v.z),ramp=tag=='land'||(tag=='ramp'&&d<12);let want=Math.atan2(-(tx-v.x),-(tz-v.z));if(!ramp)want=aiProbe(q,v,u,want,dt,null,Math.min(14,d));
 const r=aiCtl(q,v,u,want,d,dt,{max:wait?4:mx,stop:dist>0?dist:null,ramp,turn:bend});
 v.K=Object.assign({},VEHK[v.k],{max:ramp?Math.max(20,mx):mx});v.hitO=null;vehPhys(q,v,dt,r[0],r[1],true,false);
 /* what the squad code reads: stuck, and backing up */u.stuck=u.am==1&&u.amK==1?1:(u.stk||0);u.bT=u.am==1?-1:0;
 /* the place itself is often inside a building: the end of the planned route, close to it, counts as there */
 if(dist===0&&real<45){const p=C.bp&&bgIn(v.x,v.z)?C.bp:C.path;if(p&&p.length){const e=p[p.length-1];if(Math.hypot(e[0]-v.x,e[1]-v.z)<7)return Math.min(real,5)}}
 return real}
cwDrive=function(q,u,gx,gz,dt,max,dist){AIDRV=1;try{return cwDrive2(q,u,gx,gz,dt,max,dist)}finally{AIDRV=0}};
/* the cars behind the leader follow its track (a crumb every 2 m), not a point beside it */
function cwTrailRec(s){const L=s.v[0]&&s.v[0].v;if(!L)return;const T=s.tr||(s.tr=[]);const e=T[T.length-1];if(!e||Math.hypot(e[0]-L.x,e[1]-L.z)>2){T.push([L.x,L.z]);if(T.length>200)T.shift()}}
function cwTrailPt(s,i){const T=s.tr,L=s.v[0]&&s.v[0].v;if(!T||T.length<3||!L)return null;let need=9*i,x=L.x,z=L.z;for(let k=T.length-1;k>=0;k--){const dd=Math.hypot(T[k][0]-x,T[k][1]-z);if(dd>=need){const f=need/dd;return[x+(T[k][0]-x)*f,z+(T[k][1]-z)*f]}need-=dd;x=T[k][0];z=T[k][1]}return null}

/* ---------- the Wraith autopilot ---------- */
wkAPTick=function(q,dt){const A=q.wkAP;if(!A)return;const s=q.seat;if(!s||s.v!==A.v||s.i!=0||A.v.wreck){wkAPStop(q);return}const v=A.v,T=A.T;A.t+=dt;
 if(keys.KeyW||keys.KeyS||keys.KeyA||keys.KeyD||keys.ArrowUp||keys.ArrowDown){if(A.t>1){wkAPStop(q,'🛸 Autopilot off: you took the controls.');return}}
 const P2=A.pts,n=P2.length,lastI=n-1,inI=n-1-T.line.length;
 if(A.k>=inI-2){if(T.bay!=null){const d=q.wbay&&q.wbay.doors[T.bay];if(d)d.force=3}else if(q.mil&&q.mil.door&&!q.mil.door.open){q.mil.door.open=1;snd(700,.15);hint('🛸 The blast door opens for the Wraith.')}}
 /* wait for the door to be fully open before driving through it */if(A.k>=inI){const open=T.bay!=null?!!(q.wbay&&q.wbay.doors[T.bay].u>.88):!!(q.mil&&q.mil.door&&q.mil.door.obOff);if(!open){v.v*=Math.max(0,1-dt*4);A.stk=0;return}}
 const w=P2[Math.min(A.k,lastI)],d=Math.hypot(w[0]-v.x,w[1]-v.z),final=A.k>=lastI,slow=A.k>=inI;
 if(final&&d<2.5){v.v=0;wkAPStop(q,'🛸 Parked in '+T.nm+'. Welcome home.');return}
 if(!final&&(d<(slow?3:6)||(!slow&&aiPassed(v,w,P2[A.k+1],d)))){A.k++;return}
 const max=slow?7:26;let want=Math.atan2(-(w[0]-v.x),-(w[1]-v.z));if(!slow)want=aiProbe(q,v,A,want,dt,null,Math.min(14,d));
 const r=aiCtl(q,v,A,want,d,dt,{max,stop:final?.5:null,turn:slow?0:aiBend(v.x,v.z,w,P2[A.k+1])});
 if(A.replan){A.replan=0;A.rq++;A.pts=wkPlan(q,v,T);A.k=0}
 const K0=v.K;v.K=Object.assign({},K0,{max});vehPhys(q,v,dt,r[0],r[1],true,false);v.K=K0;
 if(A.rq>6)wkAPStop(q,'🛸 Autopilot: I cannot find a way through from here. Drive it a bit closer and try again (L).')};

/* ---------- the route grid: high ground and low ground, joined by their roads ----------
   The route grid only knew jump ramps that run north-south. The road up Lookout Mesa and the ramps down into the
   Old Quarry run east-west, so the mesa top and the quarry floor were walled off (and a bogus "jump" was made
   beside them). Now each raised or sunken area is its own level: a route can only get on or off it by its road. */
function navXRamp(r,rng,g,links){const e=r.s+r.dir*r.len,zc=(r.z0+r.z1)/2,lo=Math.min(r.s,e),hi=Math.max(r.s,e);rng(lo-.5,hi+.5,r.z0-2.2,r.z1+2.2,k=>g[k]=1);
 const ax=r.s-r.dir*9,bx=e+r.dir*9,a=navCell(ax,zc),b=navCell(bx,zc);if(a<0||b<0||g[a]||g[b])return;
 links[a]={to:b,r,ax,az:zc,bx,bz:zc,up:1};links[b]={to:a,r,ax:bx,az:zc,bx:ax,bz:zc,up:1}}
