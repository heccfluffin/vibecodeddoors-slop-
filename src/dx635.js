/* =====================================================================================================
   r651: DESERT PERFORMANCE: THE FORT'S SENTRY AND AA TURRETS ARE BATCHED, EACH MOVING PART RELATIVE TO ITSELF.
   Every sentry gun is built from separate moving parts (dx627 wpSentry): the base, the head that turns, the gun that
   tilts and recoils, the spinning barrel cluster, the muzzle flash and the red eye. Each part is flagged dpKeep so the
   scenery batching leaves it alone, so all ~45 pieces of every turret were drawn one by one.
   Now each part's own still pieces are batched relative to that part (the existing batcher, DP._mergeRoot), and the
   batch hangs on the part: when the head turns, the gun tilts or recoils, or the barrels spin, the batch moves with it.
   This is the same thing vehicle parts have had since r635 (dx624).
     - Left exactly as they are: the red eye (its glow blinks with the alarm), the flash sprites, and anything already
       in another batch (kept out explicitly, so nothing is drawn twice).
     - The batches keep the pieces' own kind of material (no switch to the cheaper "Lambert" look).
     - Their own watchdog (turbWatch, a few parts a frame) brings each part fully up to date and then checks its pieces:
       a piece that ever moves, hides or changes relative to its part is taken out and drawn by itself again, as before.
       (The vehicles' watchdog is not used: it runs before the frame's positions are worked out, which is fine for
       vehicles, kept fully up to date, but made a turret that had just turned or come back into view look changed.)
     - The sentry guns and the AA guns on the flak towers (the AA gun's search radar turns as its own part too). The
       turret code (milTurretsTick) and the radar's animation only ever move whole parts.
   ?noskb in the address turns it off.
   ===================================================================================================== */
const TURB={on:!/[?&]noskb\b/.test(location.search),q:null,i:0,parts:[],wi:0,BUDGET:.25,stats:{turrets:0,parts:0,batches:0,pieces:0,ms:0,unmerged:0}};
/* the parts of one turret: its own group and every moving part under it that is a group */
function turbGroups(u){const L=[];u.g.traverse(o=>{if(o===u.g||(!o.isMesh&&!o.isSprite&&o.userData&&o.userData.dpKeep))L.push(o)});return L}
function turbOne(q,u){if(!u||!u.g||u.g.userData.turb)return;u.g.userData.turb=1;const t0=performance.now();let did=0;
 /* pieces already in some batch are kept out of these ones (bad() in the batcher skips dpKeep), and so are the other parts while one is done */
 const held=[];u.g.traverse(o=>{if(o.isMesh&&o.layers.mask===4&&!o.userData.dpKeep){o.userData.dpKeep=1;held.push(o)}});
 try{for(const G of turbGroups(u)){if(G.userData.dpRecs)continue;let n=0;for(const c of G.children)if(c.isMesh&&!c.userData.dpKeep&&!c.userData.dpMerged)n++;if(n<2)continue;
   try{G.updateMatrixWorld(true);const r=DP._mergeRoot(q,G,false,false);if(G.userData.dpRecs&&G.userData.dpRecs.length){TURB.parts.push(G);TURB.stats.parts++;TURB.stats.batches+=r[0];TURB.stats.pieces+=r[1];did++}}
   catch(e){conLog('error','turret batching: '+e.message)}}}
 finally{for(const o of held)delete o.userData.dpKeep}
 TURB.stats.ms+=performance.now()-t0;if(did)TURB.stats.turrets++}
/* the watchdog for these parts: a few parts a frame (about 0.25 ms), round and round. Each part and everything above it is
   brought fully up to date first, so a part that the turret code has just turned (or that has just come back into view)
   is compared with its pieces like for like; a piece that really moved, hid or changed is taken out and drawn by itself */
function turbWatch(q){const L=TURB.parts;if(!L.length)return;const t0=performance.now();let k=0;
 while(k<L.length&&performance.now()-t0<TURB.BUDGET){TURB.wi=(TURB.wi+1)%L.length;const G=L[TURB.wi];k++;const recs=G.userData.dpRecs;if(!recs||!recs.length)continue;
  let shown=true;for(let p=G;p!==q.g;p=p.parent)if(!p||!p.visible){shown=false;break}if(!shown)continue;
  G.updateWorldMatrix(true,true);TURB.stats.unmerged+=DP._check(recs,1)}}
/* one turret per frame once the desert's own batching is done */
function turbTick(q){if(!TURB.on||!q||!q.dp||!q.dp.merged||q.ld||!q.mil||!q.mil.tur)return;if(TURB.q!==q){TURB.q=q;TURB.i=0;TURB.parts=[];TURB.wi=0}
 const L=q.mil.tur;if(TURB.i<L.length){turbOne(q,L[TURB.i]);TURB.i++}turbWatch(q)}
{const ru=busRoamUpd;busRoamUpd=function(q,dt){const r=ru.apply(this,arguments);try{turbTick(q)}catch(e){conLog('error','turret batching: '+e.message);TURB.on=false}return r}}
