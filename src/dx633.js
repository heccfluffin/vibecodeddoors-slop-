/* =====================================================================================================
   r647: DESERT PERFORMANCE: POSITIONS ARE ONLY WORKED OUT AGAIN FOR THINGS THAT MOVED.
   Every frame, three.js rebuilds the position matrix of every object from its position, rotation and scale, and then
   its place in the world from its parent's. In the desert that was about 6,000 shown objects plus all 54 vehicles
   (about 12,000 objects, shown or not), every frame, although only around 2% of them had moved since the last frame.
   That was most of the "positions" time in the lag window (about 10 ms a frame in both Firefox and Chrome).
   Now each object remembers the position, rotation and scale its matrix was made from. If none of them changed (and
   nothing asked for it to be redone), the matrix is kept; if the parent did not move either, its place in the world
   is kept too. Anything that moved is worked out exactly as before. The numbers are the very same ones three.js
   would make (the same sums from the same inputs), so code that reads positions sees no difference.
   Each object also remembers which parent it was worked out under and when: if it was moved to another parent, or its
   parent moved while it was hidden, batched (skipped since r629) or taken out of the scene, it is redone the next time
   it is visited. Vehicles are still brought fully up to date every frame (hidden ones too); they just skip their parts that did not
   move. This sits on top of r629's skipping of hidden and batched things (dx621). ?nomwc in the address turns it off.
   ===================================================================================================== */
const MWC={on:!/[?&]nomwc/.test(location.search),f:1};
/* make o.matrix again only if its position, rotation or scale changed since it was last made here */
function mwPQS(o){const p=o.position,r=o.quaternion,s=o.scale;let c=o.__mwc;
 if(c&&!o.matrixWorldNeedsUpdate&&c[0]===p.x&&c[1]===p.y&&c[2]===p.z&&c[3]===r._x&&c[4]===r._y&&c[5]===r._z&&c[6]===r._w&&c[7]===s.x&&c[8]===s.y&&c[9]===s.z)return;
 o.updateMatrix();if(!c)c=o.__mwc=new Float64Array(10);c[0]=p.x;c[1]=p.y;c[2]=p.z;c[3]=r._x;c[4]=r._y;c[5]=r._z;c[6]=r._w;c[7]=s.x;c[8]=s.y;c[9]=s.z}
/* o's own matrix and its place in the world; returns whether its children must redo theirs.
   __mwpar: the parent it was worked out under; __mwf: the last update it was up to date in; __mwchg: the last update its place changed in */
function mwSelf(o,force){const p=o.parent;if(o.matrixAutoUpdate)mwPQS(o);
 if(force||o.matrixWorldNeedsUpdate||o.__mwpar!==p||(p!==null&&(p.__mwchg|0)>(o.__mwf|0))){
  if(p===null)o.matrixWorld.copy(o.matrix);else o.matrixWorld.multiplyMatrices(p.matrixWorld,o.matrix);
  o.matrixWorldNeedsUpdate=false;o.__mwpar=p;o.__mwchg=MWC.f;force=true}
 o.__mwf=MWC.f;return force}
/* a vehicle: everything inside it, shown or not, exactly as three.js does it, minus the parts that did not move */
function mwFull(o,force){force=mwSelf(o,force);
 const ch=o.children;for(let i=0,l=ch.length;i<l;i++){const c=ch[i];if(c.updateMatrixWorld!==_mwP)c.updateMatrixWorld(force);else mwFull(c,force)}}
/* r629's desert walk (dx621) with the same check */
{const w0=mwWalk;mwWalk=function(o,force){if(!MWC.on)return w0(o,force);force=mwSelf(o,force);
 const ch=o.children;for(let i=0,l=ch.length;i<l;i++){const c=ch[i];
  if(c.updateMatrixWorld!==_mwP){c.updateMatrixWorld(force);continue}
  if(c.__mwKeep){mwFull(c,force);continue}
  if(!c.visible){c.__mwSk=MWX.fr;MWX.skipped++;continue}
  if(c.layers.mask===4&&c.isMesh&&!c.isSprite&&!c.children.length){MWX.skipped++;continue}
  mwWalk(c,force)}}}
/* the scene itself: without this, the scene's own matrix was made again every frame, which forced every object below it
   to work out its place in the world again, moved or not */
{const su0=S.updateMatrixWorld;S.updateMatrixWorld=function(force){if(!MWC.on)return su0.call(this,force);/* the lag window (F9) times this as "positions" */const lag=typeof LAG!='undefined'&&LAG.open,t0=lag?performance.now():0;MWX.inR=1;MWC.f++;try{
  force=mwSelf(this,force);const ch=this.children;for(let i=0,l=ch.length;i<l;i++)ch[i].updateMatrixWorld(force)}finally{MWX.inR=0;if(lag){const d=performance.now()-t0;LAG.pos+=d;LAG.cur.pos=(LAG.cur.pos||0)+d}}}}
