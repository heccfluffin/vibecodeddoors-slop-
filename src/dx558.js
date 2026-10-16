/* =====================================================================================================
   r558: WRAITH AUTOPILOT (L): it drives itself home to Hangar 1, and the blast door opens for it. The hangar door
   closes itself after 20 seconds with nobody inside. The Wraith's name follows its mark (X-13 WRAITH Mk III...).
   Generals and up: the police leave you alone. And the big set pieces (PD HQ, refit station, Command Wing) are built
   one at a time a few seconds after you arrive, with no extra lights, so arriving in the desert does not stall.
   ===================================================================================================== */
{const stag=f=>function(q){if(!q||q[f.k])return;const now=performance.now();if(!q.__r0)q.__r0=now;if(now-q.__r0<5000)return;if(now-(window.__bld||0)<1800)return;window.__bld=now;return f.f.apply(this,arguments)};
 pdHQ=stag({f:pdHQ,k:'pdHQ'});rfsBuild=stag({f:rfsBuild,k:'rfs'});cwBuild=stag({f:cwBuild,k:'cw'})}
/* ---- the police and the top brass ---- */
{const ah0=addHeat;addHeat=function(q,n,why){try{if(milRank()>=9&&!(why=='military')){return}}catch(e){}return ah0.apply(this,arguments)}}
setInterval(()=>{try{const q=BUS.ride;if(!q||!q.roam)return;if(milRank()>=9&&q.heat>0&&!(q.mil&&q.mil.h>0)){q.heat=0;q.crimes={};if(q.cop&&q.cop.st!='wreck'&&q.cop.st!='patrol')try{copDrop(q)}catch(e){}if(!q.genNote){q.genNote=1;hint('🎖️ The Desert PD recognises a General when they see one. They will not bother you.')}}}catch(e){}},1000);
/* ---- the Wraith's name ---- */
setInterval(()=>{try{const wk=Math.max(0,Math.min(6,milSV().wk|0));VEHK.proto.nm='the X-13 WRAITH'+(wk?' Mk '+['','I','II','III','IV','V','VI'][wk]+(wk>=6?' (PERFECTED)':''):'')}catch(e){}},1000);
/* ---- the hangar door closes itself ---- */
function hgInside(q,x,z){return x>325.5&&x<424.6&&z>-717.5&&z<-670.5}
function hgNear(q){const lz=P.z-q.OZ;if(hgInside(q,P.x,lz)||(P.x>420&&P.x<445&&lz>-710&&lz<-678))return true;for(const v of q.vehs||[]){if(v.gone||v.wreck)continue;if((v.occ&&v.occ.some(o=>o))&&(hgInside(q,v.x,v.z)||(v.x>420&&v.x<445&&v.z>-710&&v.z<-678)))return true}try{for(const id in(q.vnet&&q.vnet.rem)||{}){const r=q.vnet.rem[id];if(hgInside(q,r.x,r.z))return true}}catch(e){}return false}
setInterval(()=>{try{const q=BUS.ride;const D=q&&q.roam&&q.mil&&q.mil.door;if(!D)return;if(!D.open){q.hgT=0;return}if(q.wkAP||(q.mil.op&&q.mil.op.id=='trials'&&!q.mil.op.fin&&false)){q.hgT=0;return}if(hgNear(q)){q.hgT=0;return}q.hgT=(q.hgT||0)+1;if(q.hgT>=20){D.open=0;q.hgT=0;snd(400,.15);if(Math.hypot(P.x-425,P.z-q.OZ+694)<120)hint('🛸 Hangar 1: nobody inside. The blast door rumbles shut.')}}catch(e){}},1000);
/* ---- WRAITH AUTOPILOT ---- */
const WKAP=[[561,-975],[561,-918],[520,-860],[470,-745],[470,-722],[432,-722],[432,-694],[378,-694]];
function wkAPStart(q,v){let best=0,bd=1e9;for(let i=0;i<WKAP.length;i++){const d=Math.hypot(WKAP[i][0]-v.x,WKAP[i][1]-v.z);if(d<bd){bd=d;best=i}}/* inside the base, never go back out through the gate */const inBase=v.x>300&&v.x<600&&v.z>-930&&v.z<-660;if(inBase&&best<2)best=2;if(!inBase)best=0;if(hgInside(q,v.x,v.z)){hint('🛸 You are already in the hangar.');return}
 q.wkAP={v,i:best,stuck:0,bT:0,t:0};snd(800,.08);setTimeout(()=>snd(1100,.08),110);hint('🛸 WRAITH AUTOPILOT: heading home to Hangar 1. (L again, or steer, to take over.)')}
function wkAPStop(q,why){if(!q.wkAP)return;q.wkAP=null;if(why)hint(why);snd(500,.08)}
addEventListener('keydown',e=>{if(e.code!='KeyL'||e.repeat||state!='bus')return;const q=BUS.ride;const s=q&&q.roam&&q.seat;if(!s||s.i!=0||!s.v.K.proto)return;if(q.wkAP)wkAPStop(q,'🛸 Autopilot off. You have control.');else wkAPStart(q,s.v)});
function wkAPTick(q,dt){const A=q.wkAP;if(!A)return;const s=q.seat;if(!s||s.v!==A.v||s.i!=0||A.v.wreck){wkAPStop(q);return}const v=A.v;A.t+=dt;
 if(keys.KeyW||keys.KeyS||keys.KeyA||keys.KeyD||keys.ArrowUp||keys.ArrowDown){if(A.t>1){wkAPStop(q,'🛸 Autopilot off: you took the controls.');return}}
 const w=WKAP[A.i],last=A.i==WKAP.length-1;const dx=w[0]-v.x,dz=w[1]-v.z,d=Math.hypot(dx,dz),dh=wrapA(Math.atan2(-dx,-dz)-v.h);
 /* the blast door opens as it comes up the lane */if(A.i>=5&&q.mil&&q.mil.door&&!q.mil.door.open){q.mil.door.open=1;snd(700,.15);hint('🛸 The blast door opens for the Wraith.')}
 const slow=last||A.i>=4;let fx=Math.abs(dh)>1.0?.35:1;if(last&&d<6)fx=Math.abs(v.v)>1?-1:0;
 if(A.bT<0){A.bT+=dt;v.v=Math.min(v.v,0);vehPhys(q,v,dt,-.9,Math.sign(dh)||1,true,false)}else{const K0=v.K;v.K=Object.assign({},K0,{max:slow?9:30});vehPhys(q,v,dt,fx,Math.max(-1,Math.min(1,-dh*2.2)),true,false);v.K=K0;if(fx>.3&&Math.abs(v.v)<.5){A.stuck+=dt;if(A.stuck>1.3){A.stuck=0;A.bT=-1}}else A.stuck=0}
 if(d<(last?4.5:7)){if(last){v.v=0;wkAPStop(q,'🛸 Parked in Hangar 1. Welcome home.');return}A.i++}}
/* the Wraith's own controls are ignored while the autopilot drives: run it after the normal update each frame */
{let last=performance.now();const tick=()=>{requestAnimationFrame(tick);const now=performance.now(),dt=Math.min(.05,(now-last)/1000);last=now;try{const q=BUS.ride;if(state=='bus'&&q&&q.roam&&q.wkAP){AIDRV=1;try{wkAPTick(q,dt)}finally{AIDRV=0}}}catch(e){conLog('error','wraith autopilot: '+e.message)}};requestAnimationFrame(tick)}
setInterval(()=>{try{const q=BUS.ride,s=q&&q.roam&&q.seat;if(s&&s.i==0&&s.v.K&&s.v.K.proto&&!q.wkAPh){q.wkAPh=1;setTimeout(()=>hint('🛸 Tip: press L in the Wraith for AUTOPILOT: it drives itself home to Hangar 1.'),2500)}}catch(e){}},1000);
