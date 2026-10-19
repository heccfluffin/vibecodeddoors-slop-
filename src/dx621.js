/* =====================================================================================================
   r629: DESERT PERFORMANCE, STEP 1: only work out the positions of things that can be drawn.
   Every frame three.js recalculates the world position (the "matrix") of every object in the scene, hidden or not.
   The desert has about 70,000 objects and only about 5,000 are drawn at a time: most of the rest are in scenery
   chunks that are hidden because they are far away, or are pieces already drawn as part of a batch.
   Now, while the renderer draws the frame, the desert skips:
     - anything hidden (and everything inside it): it is worked out again the moment it is shown, before it is drawn;
     - single pieces that were merged into a batch (layer DP.HID): the batch is what is drawn.
   Vehicles are never skipped (they move and lots of code reads their parts). Nothing else changes: no object is
   removed, hidden or moved, and the hotel, the mine and everything outside the desert work exactly as before.
   Code that reads positions gets them fresh first (mwFresh): the raycasts into the desert (garage roof check,
   speed checkpoint ground height), localToWorld/worldToLocal, Box3.setFromObject, the batching watchdog
   (memDirty, build.py patch), the sprite culler (dpSprites, build.py patch), the distance culler (perfCull, dx599)
   and the late batcher's stillness check (perfRootFP, dx599). Calls like obj.updateMatrixWorld(true) made by the
   game itself always do the full update, as before: only the renderer's own per-frame update skips.
   Turn it off with ?nomwx in the address, or MWX.on=false in the console, to compare.
   ===================================================================================================== */
const MWX={on:!/[?&]nomwx/.test(location.search),used:0,fr:0,inR:0,skipped:0,fresh:0};
const _mwP=THREE.Object3D.prototype.updateMatrixWorld;
/* the same as three.js r128's updateMatrixWorld, but it leaves out what cannot be drawn this frame */
function mwWalk(o,force){if(o.matrixAutoUpdate)o.updateMatrix();
 if(o.matrixWorldNeedsUpdate||force){if(o.parent===null)o.matrixWorld.copy(o.matrix);else o.matrixWorld.multiplyMatrices(o.parent.matrixWorld,o.matrix);o.matrixWorldNeedsUpdate=false;force=true}
 const ch=o.children;for(let i=0,l=ch.length;i<l;i++){const c=ch[i];
  if(c.__mwKeep||c.updateMatrixWorld!==_mwP){c.updateMatrixWorld(force);continue}
  if(!c.visible){c.__mwSk=MWX.fr;MWX.skipped++;continue}
  if(c.layers.mask===4&&c.isMesh&&!c.isSprite&&!c.children.length){MWX.skipped++;continue}
  mwWalk(c,force)}}
function mwDesertUMW(force){if(MWX.on&&MWX.inR){MWX.used=1;MWX.fr++;MWX.skipped=0;mwWalk(this,force)}else _mwP.call(this,force)}
/* the renderer is the only caller of the scene's own update (the game never calls it), so that is when skipping is allowed */
S.updateMatrixWorld=function(force){MWX.inR=1;try{_mwP.call(this,force)}finally{MWX.inR=0}};
/* is o inside the desert (and not inside a vehicle)? */
function mwIn(o){for(let p=o;p;p=p.parent){if(p.__mwx)return true}return false}
/* make o's world matrix up to date if the last render skipped it or one of its parents */
function mwFresh(o){if(!MWX.used||!o||o.__mwKeep||o.__mwx)return;const leaf=o.isMesh&&!o.isSprite&&o.layers.mask===4&&!o.children.length;let chain=!o.visible||o.__mwSk===MWX.fr;
 for(let p=o.parent;p;p=p.parent){if(p.__mwKeep)return;if(p.__mwx){if(chain){o.updateWorldMatrix(true,false);MWX.fresh++}else if(leaf){if(o.matrixAutoUpdate)o.updateMatrix();o.matrixWorld.multiplyMatrices(o.parent.matrixWorld,o.matrix);MWX.fresh++}return}if(!p.visible||p.__mwSk===MWX.fr)chain=true}}
/* readers that use matrixWorld directly */
{const P0=THREE.Object3D.prototype;const l0=P0.localToWorld,w0=P0.worldToLocal;P0.localToWorld=function(v){mwFresh(this);return l0.call(this,v)};P0.worldToLocal=function(v){mwFresh(this);return w0.call(this,v)};
 const b0=THREE.Box3.prototype.setFromObject;THREE.Box3.prototype.setFromObject=function(o){mwFresh(o);return b0.apply(this,arguments)};
 for(const fn of['intersectObject','intersectObjects']){const f0=THREE.Raycaster.prototype[fn];THREE.Raycaster.prototype[fn]=function(o){if(MWX.used){const L=Array.isArray(o)?o:[o];for(const x of L)if(x&&x.isObject3D&&mwIn(x)){x.updateWorldMatrix(true,true);MWX.fresh++}}return f0.apply(this,arguments)}}}
/* hook the desert root in, and keep the vehicles out of the skipping */
{const ru=busRoamUpd;busRoamUpd=function(q,dt){try{if(q&&q.g&&!q.g.__mwx){q.g.__mwx=1;q.g.updateMatrixWorld=mwDesertUMW}if(q&&q.vehs)for(const v of q.vehs)if(v&&v.m)v.m.__mwKeep=1;if(q&&q.heli&&q.heli.m)q.heli.m.__mwKeep=1}catch(e){}return ru.apply(this,arguments)}}
