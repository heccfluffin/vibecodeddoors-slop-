/* =====================================================================================================
   r604: YOUR WRAITH STAYS IN YOUR BAY.
   Your bay is picked by your place among the players in the desert. The Wraith you left parked was put back only
   once, a moment after the desert loaded, often before your friend had shown up. When they did, your bay number
   could change, and the Wraith was left in the old bay (or in the hangar). Now, while your Wraith is parked, it
   always moves to whatever your bay is right now (only while nobody is in it and it is standing still), you take
   charge of it so your friends see it there too, and the sign with your name moves with it.
   ===================================================================================================== */
function bayRemoteIn(q,v){try{const R=q.vnet&&q.vnet.rem;for(const id in R){const r=R[id];if(Date.now()-(r.t||0)<8000&&(r.v===v.id||r.ib===v.id))return true}}catch(e){}return false}
function bayPutBack(q,i){const pv=q.mil&&q.mil.proto;if(!pv)return;pv.x=bayX(i);pv.z=(WBAY.z0+WBAY.z1)/2-1;pv.h=0;pv.v=0;pv.bayLock=1;pv.owner=SV.pid;pv.netSnap=1;pv.idleN=0}
/* the sign with your name on your bay door */
function bayName(q,i){const B=q.wbay;if(!B)return;if(B.nameI===i)return;
 /* the first sign (put up once, 2 s after the bays are built) is found by where it sits, just in front of the BAY n label */
 if(B.nameI==null){for(const d of B.doors){if(d.lab.visible)continue;for(const c of B.g.children)if(c!==d.lab&&Math.abs(c.position.x-d.lab.position.x)<.01&&Math.abs(c.position.z-d.lab.position.z-.02)<.01&&Math.abs(c.position.y-d.lab.position.y)<.01)B.nameM=c}}
 if(B.nameM){B.g.remove(B.nameM);B.nameM=null}for(const d of B.doors)d.lab.visible=true;B.nameI=i;if(i<0)return;
 const d=B.doors[i];if(!d)return;const nl=pdTxt('BAY '+(i+1)+' · '+String(SV.nm||'YOU').toUpperCase().slice(0,12),3.2,.32,'#40c0ff','#0a1420');nl.position.copy(d.lab.position);nl.position.z+=.02;B.g.add(nl);d.lab.visible=false;B.nameM=nl}
{const bt6=bayTick;bayTick=function(q,dt){const r=bt6.apply(this,arguments);try{const B=q.wbay;if(!B||!B.ready)return r;const mine=bayMine(q);
  /* wait 2.5 s (real time, not game time) after the first sign went up, then keep the sign on the right bay */const now=performance.now();if(!B.n0)B.n0=now;if(now-B.n0>2500)bayName(q,mine);
  const S=milSV(),pv=q.mil&&q.mil.proto;if(!S.bayPark||mine<0||!pv||pv.wreck||pv.gone)return r;
  const inMine=Math.abs(pv.x-bayX(mine))<4.2&&pv.z>WBAY.z0&&pv.z<WBAY.z1;
  const busy=(q.seat&&q.seat.v===pv)||bayRemoteIn(q,pv)||Math.abs(pv.v)>.3||pv.air||(pv.netT!=null&&Date.now()-pv.netT<3000&&pv.owner!==SV.pid);
  if(inMine||busy){B.mv0=0;return r}
  /* parked, empty and still for a moment, but not in your bay: move it there */if(!B.mv0)B.mv0=now;if(now-B.mv0<1500)return r;B.mv0=0;bayPutBack(q,mine)}catch(e){conLog('error','wraith bay: '+e.message)}return r}}
