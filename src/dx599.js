/* =====================================================================================================
   r603: DESERT PERFORMANCE, PART 2 (on top of the r500 batching).
   The r500 pass batches the desert's static scenery once, while it loads. Everything built after that (the quarry
   machines, the military base additions, the command wing, the Wraith bays, the motor pool, destinations that are put
   up as you get near them...) was never batched, and it is where the draw calls pile up.
   1. LATE BATCHING: any new part of the desert that has stood still for a few seconds is batched with the same
      code and the same watchdog as the rest (if something in it moves or changes, that piece goes back to being drawn
      on its own, straight away).
   2. DISTANCE CULLING for the separate objects that are not in a chunk: small things stop being drawn a long way off
      (where they would be a few pixels in the haze), and nothing is drawn past the fog.
   Nothing is paused: timers, police, traffic, squads and physics run exactly as before.
   ?noperf in the address switches this part off.
   ===================================================================================================== */
const PERF={on:!/[?&]noperf\b/.test(location.search),q:null,seen:new Map(),stats:{late:0,lateMeshes:0,culled:0},li:0,leaves:null};
const PL_FAR=6;
/* rays (roof checks, aiming, clicking) still see culled objects */
{for(const fn of['intersectObject','intersectObjects']){const f0=THREE.Raycaster.prototype[fn];THREE.Raycaster.prototype[fn]=function(){try{this.layers.enable(PL_FAR)}catch(e){}return f0.apply(this,arguments)}}}
/* a fingerprint of a whole part of the desert: where its pieces are, and how many there are */
function perfRootFP(r){let h=0,n=0;/* r629: full update first (the per-frame one skips hidden parts) */try{r.updateMatrixWorld(true)}catch(e){}r.traverse(o=>{if(o.isMesh){const e=o.matrixWorld.elements;h+=e[12]*1.3+e[13]*2.1+e[14]*.7+e[0]+e[10];n++}});return Math.round(h*100)+'/'+n}
function perfLate(q){const D=q.dp;if(!D||!D.merged||!D.roots||typeof DP=='undefined'||!DP._mergeRoot)return;const now=performance.now(),known=new Set(D.roots.concat(D.movers||[]));const veh=new Set((q.vehs||[]).map(v=>v.m));
 /* vehicles built after the first pass (the parked aircraft and trucks at the base, for example): batched as movers, checked every frame like the others */
 for(const v of q.vehs||[]){const o=v.m;if(!o||known.has(o)||o.userData.dpLate||o.userData.dpRecs||v.gone||v.wreck||!o.parent)continue;o.userData.dpLate=1;try{o.updateMatrixWorld(true);const k=DP._mergeRoot(q,o,DP.cfg().lam,false);if(o.userData.dpRecs&&o.userData.dpRecs.length){o.userData.dpVeh=1;(D.movers||(D.movers=[])).push(o);PERF.stats.late+=k[0];PERF.stats.lateMeshes+=k[1]}}catch(e){conLog('error','late batching (vehicle): '+e.message)}}
 for(const o of q.g.children){if(known.has(o)||veh.has(o)||o.userData.dpLate||o.userData.chunk||o.userData.dpKeep||o.userData.noChunk||o.userData.mv)continue;if(!(o.isGroup||o.type==='Group'||o.type==='Object3D'))continue;if(!o.visible)continue;
  try{if(typeof MN!='undefined'&&(o===MN.g))continue}catch(e){}
  const fp=perfRootFP(o),c=PERF.seen.get(o);if(!c||c.fp!==fp){PERF.seen.set(o,{fp,t:now});continue}if(now-c.t<6000)continue;
  /* still for six seconds: batch it, and from now on the watchdog checks it like the rest */o.userData.dpLate=1;PERF.seen.delete(o);try{o.updateMatrixWorld(true);const k=DP._mergeRoot(q,o,DP.cfg().lam,false);if(o.userData.dpRecs&&o.userData.dpRecs.length){D.roots.push(o);PERF.stats.late+=k[0];PERF.stats.lateMeshes+=k[1]}}catch(e){conLog('error','late batching: '+e.message)}
  break}}
/* ---------- distance culling of loose objects ---------- */
const PERF_D=[150,320];
function perfCull(q){const cam=C.position,root=q.g;let far=1e9;try{if(S.fog&&S.fog.far)far=S.fog.far+30}catch(e){}
 const L=PERF.leaves||(PERF.leaves=[]);if(!L.length||PERF.li>=L.length){L.length=0;PERF.li=0;const veh=new Set((q.vehs||[]).map(v=>v.m));
  const walk=(o,inChunk)=>{for(const c of o.children){if(veh.has(c))continue;const ch=inChunk||!!(c.userData&&c.userData.chunk);if(c.children.length)walk(c,ch);else if(!ch&&(c.isMesh||c.isSprite)&&!c.isInstancedMesh)L.push(c)}};walk(root,false)}
 const v=new THREE.Vector3();for(let k=0;k<400&&PERF.li<L.length;k++,PERF.li++){const o=L[PERF.li];if(!o.parent)continue;const mask=o.layers.mask,isFar=mask===(1<<PL_FAR);if(!isFar&&mask!==1)continue;
  /* measured from the middle of what is drawn, not from where the object sits (a batch sits at its group's origin, which can be far from the things in it) */
  let r=1;if(typeof mwFresh==='function')mwFresh(o);v.setFromMatrixPosition(o.matrixWorld);try{if(o.isSprite)r=Math.max(o.scale.x,o.scale.y);else{const g=o.geometry;if(!g.boundingSphere)g.computeBoundingSphere();if(g.boundingSphere){r=g.boundingSphere.radius*o.matrixWorld.getMaxScaleOnAxis();v.copy(g.boundingSphere.center).applyMatrix4(o.matrixWorld)}}}catch(e){}
const d=v.distanceTo(cam)-r,lim=Math.min(far,r<1.2?PERF_D[0]:r<4?PERF_D[1]:1e9),want=d>lim;
  if(want&&!isFar){o.layers.set(PL_FAR);PERF.stats.culled++}else if(!want&&isFar){o.layers.set(0);PERF.stats.culled--}}}
/* ---------- run it from the desert's own update ---------- */
{const ru14=busRoamUpd;busRoamUpd=function(q,dt){const r=ru14.apply(this,arguments);try{if(!PERF.on||!q||!q.g)return r;if(PERF.q!==q){PERF.q=q;PERF.seen=new Map();PERF.leaves=null;PERF.li=0;PERF.lt=0}
  const now=performance.now();if(now-(PERF.lt||0)>1500){PERF.lt=now;perfLate(q)}perfCull(q)}catch(e){conLog('error','perf: '+e.message);PERF.on=false}return r}}
/* for testing: batch everything new now, and cull everything in one go */function perfForce(){const q=BUS.ride;if(!q)return;for(let j=0;j<3;j++){for(const c of PERF.seen.values())c.t-=7000;for(let i=0;i<80;i++)perfLate(q)}PERF.leaves=null;PERF.li=0;for(let i=0;i<200;i++)perfCull(q);return PERF.stats}
