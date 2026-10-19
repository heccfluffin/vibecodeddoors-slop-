/* =====================================================================================================
   r635: DESERT PERFORMANCE, VEHICLE BATCHING. Every vehicle's still parts were already drawn as a few batches (r500/r603),
   but each MOVING part (a wheel, the steering wheel, a turret, a gun barrel, a rotor, a missile on its rail, the
   Wraith's radar...) was left out together with everything on it, so a tank still drew about 200 separate pieces.
   Now the pieces of each moving part are batched relative to that part: the batch hangs on the part, so it turns,
   spins, steers, lifts and hides with it exactly as before. A moving part inside another (the barrel in the turret,
   the tyre in the steering pivot) gets its own batch. The batch watchdog checks these every few frames like the
   vehicles' other batches: any piece that moves on its own is taken back out and drawn by itself, as before.
   Left alone on purpose: the jet's landing gear (its legs fold separately inside it), and parts with a single piece
   (nothing to batch). Nothing is removed: the original pieces stay in place, only hidden behind their batch.
   One vehicle is done per frame. ?novb in the address turns it off to compare.
   ===================================================================================================== */
const VB={on:!/[?&]novb/.test(location.search),i:0,q:null,skipKeys:new Set(['gear']),stats:{vehicles:0,parts:0,batches:0,pieces:0,ms:0}};
/* the moving parts a vehicle's code reaches through its userData (the same list the batcher leaves out) */
function vbParts(o){const ud=o.userData||{},m=new Map();const add=(x,k)=>{if(x&&x.isObject3D&&!m.has(x))m.set(x,k)};
 for(const k in ud){const v=ud[k];if(!v)continue;if(v.isObject3D)add(v,k);else if(Array.isArray(v))for(const y of v){if(!y)continue;if(y.isObject3D)add(y,k);else if(typeof y==='object')for(const kk of['t','p','m'])add(y[kk],k)}}return m}
function vbVehicle(q,v){const o=v&&v.m;if(!o||v.gone||v.wreck||!o.parent||typeof DP=='undefined'||!DP._mergeRoot||!q.dp)return;
 const parts=vbParts(o);if(!parts.size)return;
 /* while one part is batched, every other moving part (and what is on it) stays out of its batch */
 const flagged=[];for(const[x]of parts)if(!x.userData.dpKeep){x.userData.dpKeep=1;flagged.push(x)}
 const t0=performance.now();let did=0;
 try{for(const[x,k]of parts){if(VB.skipKeys.has(k)||x.userData.vbTried||x.userData.dpRecs)continue;x.userData.vbTried=1;
   let n=0;x.traverse(m=>{if(m.isMesh)n++});if(n<2)continue;
   try{x.updateMatrixWorld(true);const r=DP._mergeRoot(q,x,DP.cfg().lam,false);if(x.userData.dpRecs&&x.userData.dpRecs.length){(q.dp.movers||(q.dp.movers=[])).push(x);VB.stats.parts++;VB.stats.batches+=r[0];VB.stats.pieces+=r[1];did++}}catch(e){conLog('error','vehicle batching ('+k+'): '+e.message)}}}
 finally{for(const x of flagged)delete x.userData.dpKeep}
 VB.stats.ms+=performance.now()-t0;if(did)VB.stats.vehicles++}
/* one vehicle per frame, round and round (new vehicles and swapped models are picked up as they come) */
{const ru=busRoamUpd;busRoamUpd=function(q,dt){const r=ru.apply(this,arguments);try{if(VB.on&&q&&q.vehs&&q.vehs.length&&!q.ld&&q.dp&&q.dp.merged){if(VB.q!==q){VB.q=q;VB.i=0}VB.i=(VB.i+1)%q.vehs.length;vbVehicle(q,q.vehs[VB.i])}}catch(e){conLog('error','vehicle batching: '+e.message);VB.on=false}return r}}
