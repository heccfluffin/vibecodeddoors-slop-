/* =====================================================================================================
   r611: AUTOPILOT MODES. Press L again to go to the next mode, and once more after the last one to switch it off.
   - X-13 WRAITH:   home (your Wraith bay, or Hangar 1)  →  your waypoint  →  off.
   - PLANE and JETS: land at the NEAREST AIRSTRIP (the airfield runway or the Fort Blackout runway)
                     →  fly to your waypoint and land there  →  land straight ahead, here  →  off.
   - HELICOPTERS:   home to the pad  →  fly to your waypoint and come down there  →  straight down, here  →  off.
   "Your waypoint" is the main pin on your map (your current job). With no pin, that mode is skipped.
   ===================================================================================================== */
function apWaypoint(q){try{const L=wpList(q);const m=L.find(w=>w.main)||L[0];if(m&&isFinite(m.x)&&isFinite(m.z))return{x:m.x,z:m.z,t:(m.t||'your waypoint').replace(/^the /,'')}}catch(e){}return null}
/* the two runways: the airfield (runway 13) and Fort Blackout (runway 09). Both run east-west, landing towards the east */
const AWAIR={x0:270,x1:540,z:-1230,w:24};/* the airfield, in the shape the jet autoland reads (AW.RW) */
const ALB={rz:-980,wx:-235,td:265};/* Fort Blackout, in the shape the plane autoland reads (AL) */
function apNearStrip(v){const da=Math.hypot(v.x-(AWAIR.x0+AWAIR.x1)/2,v.z-AWAIR.z),db=Math.hypot(v.x-(AW.RW.x0+AW.RW.x1)/2,v.z-AW.RW.z);return da<db?'air':'base'}
function apModes(q,v){const wp=!!apWaypoint(q);if(v.K.heli)return['home'].concat(wp?['wp']:[],['down']);return['strip'].concat(wp?['wp']:[],['down'])}
/* ---------- L on any aircraft: the next mode ---------- */
{const at4=planeAutoToggle;planeAutoToggle=function(q,v){if(!v||!v.K.plane)return at4.apply(this,arguments);
  /* on the ground: as before (jets taxi back, the plane says take off first) */if(!v.air&&!v.al)return at4.apply(this,arguments);
  const modes=apModes(q,v),cur=v.al?(v.al.mode||(v.K.heli?(v.al.ph=='down'?'down':'home'):'strip')):null;const i=cur?modes.indexOf(cur)+1:0;
  v.al=null;if(cur&&(i<=0||i>=modes.length)){hint('✈️ Autopilot OFF. You have control.');snd(500,.08);return}
  const m=modes[i],wp=apWaypoint(q);snd(800,.08);setTimeout(()=>snd(1000,.08),120);
  if(v.K.heli){if(m=='home'){v.al={t:0,ph:'home',mode:'home'};hint('🚁 AUTOPILOT 1/'+modes.length+': home to the pad, then down. (L: next mode)')}
   else if(m=='wp'){v.al={t:0,ph:'home',mode:'wp',wx:wp.x,wz:wp.z};hint('🚁 AUTOPILOT 2/'+modes.length+': to '+wp.t+', then straight down. (L: next mode)')}
   else{v.al={t:0,ph:'down',mode:'down'};hint('🚁 AUTOPILOT '+modes.length+'/'+modes.length+': straight down, right here. (L: off)')}return}
  if(m=='strip'){const s=apNearStrip(v);if(v.K.jet){v.al={t:0,mode:'strip',rw:s=='air'?AWAIR:null}}else v.al={t:0,ph:'fix',mode:'strip',al:s=='base'?ALB:null};
   hint('🛬 AUTOPILOT 1/'+modes.length+': landing at the nearest airstrip, '+(s=='air'?'the airfield (runway 13)':'Fort Blackout (runway 09)')+'. (L: next mode, steer to take over)');return}
  if(m=='wp'){v.al={t:0,mode:'wp',my:1,ph:'go',tx:wp.x,tz:wp.z};hint('🛬 AUTOPILOT 2/'+modes.length+': flying to '+wp.t+' and landing there. (L: next mode)');return}
  v.al={t:0,mode:'down',my:1,ph:'desc'};hint('🛬 AUTOPILOT '+modes.length+'/'+modes.length+': landing straight ahead. (L: off)')}}
/* the plane autoland, pointed at the other runway when that one is nearer */
{const pa4=planeAuto;planeAuto=function(q,v,dt){const a=v.al&&v.al.al;if(!a)return pa4.apply(this,arguments);const keep={rz:AL.rz,wx:AL.wx,td:AL.td};Object.assign(AL,a);try{return pa4.apply(this,arguments)}finally{Object.assign(AL,keep)}}}
/* the jet autoland, pointed at the airfield; there it stops on the runway (no taxiing back across the desert) */
{const ja4=jetAuto;jetAuto=function(q,v,dt,mine){const A=v.al,rw=A&&A.rw;if(!rw)return ja4.apply(this,arguments);if(A.ph=='taxi'){v.v=0;v.al=null;if(mine)hint('✈️ Landed at the airfield. Stopped on the runway.');return}const keep=AW.RW;AW.RW=rw;const h0=hint;hint=m=>h0(String(m).replace('runway 09','runway 13'));try{return ja4.apply(this,arguments)}finally{AW.RW=keep;hint=h0}}}
/* fly to a point and land on it, or land straight ahead (planes and jets) */
function apFixed(q,v,dt){const A=v.al,K=v.K,mine=q.seat&&q.seat.v===v;A.t+=dt;
 if(mine&&A.t>1.2&&(keys.KeyW||keys.KeyS||keys.KeyA||keys.KeyD||keys.ArrowUp||keys.ArrowDown||keys.ArrowLeft||keys.ArrowRight)){v.al=null;hint('✈️ Autopilot OFF: you took the controls.');return}
 if(A.tx==null){const ah=Math.max(450,(v.y-vehGround(q,v.x,v.z))/.12+120);A.tx=v.x-Math.sin(v.h)*ah;A.tz=v.z-Math.cos(v.h)*ah}
 const g0=vehGround(q,v.x,v.z),cr=Math.min(K.vcr?K.vcr*.8:36,60),dx=A.tx-v.x,dz=A.tz-v.z,dist=Math.hypot(dx,dz),tr0=K.turn||1.1;
 const steer=()=>{const dh=wrapA(Math.atan2(-dx,-dz)-v.h),tr=Math.max(-tr0*.8,Math.min(tr0*.8,dh*1.5));v.h+=tr*dt;v.str=-tr/tr0;return dh};
 const fly=(sp,alt)=>{v.v+=(sp-v.v)*Math.min(1,dt*.6);const vy=Math.max(-12,Math.min(12,(alt-v.y)*.8));v.vy=(v.vy||0)+(vy-(v.vy||0))*Math.min(1,dt*2);v.y+=v.vy*dt;v.x-=Math.sin(v.h)*v.v*dt;v.z-=Math.cos(v.h)*v.v*dt;v.pit=(v.pit||0)+(Math.atan2(v.vy,Math.max(10,v.v))-(v.pit||0))*Math.min(1,dt*3);v.bank=(v.bank||0)+((-v.str)-(v.bank||0))*Math.min(1,dt*3)};
 /* too close to come down from this height: fly on, turn back, and line up (a go-around) */const high=(v.y-g0)>dist*.12+12;
 if(A.ph=='out'){fly(cr,Math.max(g0+50,v.y));if(dist>(v.y-g0)/.12+200)A.ph='go';return}
 if(A.ph=='go'){const dh=steer();fly(cr,g0+60);if(dist<500&&Math.abs(dh)<.3){A.ph=high?'out':'desc'}return}
 if(A.ph=='desc'){/* far out: steer for the point; close in: hold the heading and put it down */if(dist<130)A.near=1;if(!A.near)steer();
  if(A.mode=='wp'&&A.near&&v.y>g0+18){A.ph='out';A.near=0;return}
  fly(dist>150&&!A.near?Math.min(cr,40):28,A.near?g0-3:g0+Math.min(60,dist*.1));if(v.y<=g0+.3){v.y=g0;v.vy=0;v.air=0;v.pit=0;v.bank=0;A.ph='roll';snd(300,.12);if(mine)hint('✈️ Touchdown. Braking.')}return}
 if(A.ph=='roll'){v.y=g0;v.air=0;v.v=Math.max(0,v.v-10*dt);const nx=v.x-Math.sin(v.h)*v.v*dt,nz=v.z-Math.cos(v.h)*v.v*dt;if(vehOK(q,v,nx,nz,v.h)){v.x=nx;v.z=nz}else v.v=0;v.bank*=.9;
  if(v.v<.5){v.v=0;v.al=null;if(mine)hint(A.mode=='wp'?'✈️ Landed at your waypoint. Nice flying (it was not you).':'✈️ Landed and stopped.');snd(660,.1);setTimeout(()=>snd(880,.12),140)}}}
{const pp4=planePhys;planePhys=function(q,v,dt,fx,sx,drv,hb){const A=v.al;if(A&&A.my&&!v.K.heli&&!v.wreck){apFixed(q,v,dt);return}
  /* a helicopter going to the waypoint: its "home" is the waypoint for now */if(A&&v.K.heli&&A.mode=='wp'&&A.wx!=null){const sx0=v.sx,sz0=v.sz;v.sx=A.wx;v.sz=A.wz;try{return pp4.apply(this,arguments)}finally{v.sx=sx0;v.sz=sz0}}
  return pp4.apply(this,arguments)}}

/* ---------- the Wraith: L again goes from home to the waypoint, then off ---------- */
/* a base route to the pin, or (when the pin is inside a building) to the nearest reachable spot round it */
function bgPathNear(q,sx,sz,tx,tz){let r=bgPath(q,sx,sz,tx,tz,[]);if(r)return r;for(const R of[8,14,22,32])for(let a=0;a<8;a++){const x=tx+Math.cos(a*Math.PI/4)*R,z=tz+Math.sin(a*Math.PI/4)*R;if(!bgIn(x,z))continue;r=bgPath(q,sx,sz,x,z,[]);if(r)return r}return null}
function wpPlan(q,v,T){const tx=T.inside[0],tz=T.inside[1];let pts=null;try{const ia=bgIn(v.x,v.z),ib=bgIn(tx,tz),G=WK_GATE,dz=(x,z,x2,z2)=>{const r=navPath(q,x,z,x2,z2,1);return r?r.map(p=>[p[0],p[1]]):[[x2,z2]]};
  /* through the base gate when the trip crosses the fence (the desert route grid stops at the base) */
  if(ia&&ib)pts=bgPathNear(q,v.x,v.z,tx,tz);else if(!ia&&ib)pts=dz(v.x,v.z,G[0][0],G[0][1]).concat(G,bgPathNear(q,G[2][0],G[2][1],tx,tz)||[]);else if(ia&&!ib)pts=(bgPath(q,v.x,v.z,G[2][0],G[2][1],[])||[]).concat(G.slice().reverse(),dz(G[0][0],G[0][1],tx,tz));else pts=dz(v.x,v.z,tx,tz)}catch(e){}/* the pin is often inside a building: stop at the nearest place the route gets to */if(pts&&pts.length){const e=pts[pts.length-1];if(Math.hypot(e[0]-tx,e[1]-tz)>1.5&&Math.hypot(e[0]-tx,e[1]-tz)<40){T.inside=[e[0],e[1]];return pts}}return(pts&&pts.length?pts:[[v.x,v.z]]).concat([[tx,tz]])}
function wkAPWp(q,v){const wp=apWaypoint(q);if(!wp)return false;const T={nm:wp.t,apron:[wp.x,wp.z],line:[],inside:[wp.x,wp.z],wp:1,pin:[wp.x,wp.z]};q.wkAP={v,T,pts:wpPlan(q,v,T),k:0,stuck:0,bT:0,t:0,rq:0};snd(800,.08);setTimeout(()=>snd(1100,.08),110);hint('🛸 WRAITH AUTOPILOT 2/2: driving to '+wp.t+'. (L: off)');return true}
{const ws4=wkAPStop;wkAPStop=function(q,why){/* to the pin: as close as it can get counts as there */const A=q.wkAP;if(A&&A.T.wp&&/cannot find a way/.test(why||'')&&Math.hypot(A.v.x-A.T.pin[0],A.v.z-A.T.pin[1])<30){A.v.v=0;return ws4.call(this,q,'🛸 As close to '+A.T.nm+' as the Wraith can get. Arrived.')}if(why==='🛸 Autopilot off. You have control.'&&q.wkAP&&!q.wkAP.T.wp){const v=q.wkAP.v;q.wkAP=null;if(wkAPWp(q,v))return;hint(why);snd(500,.08);return}return ws4.apply(this,arguments)}}
