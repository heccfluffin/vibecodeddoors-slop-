/* =====================================================================================================
   r653: DESERT PERFORMANCE: HIDDEN VEHICLE PARTS ARE NOT WORKED OUT EVERY FRAME.
   Since r629 the desert skips hidden things and pieces already drawn as part of a batch when it works out where
   everything is each frame, but vehicles were left out: every part of every vehicle was worked out every frame,
   hidden or not. In a normal desert that is about 12,000 vehicle parts, of which only about 2,200 are drawn
   (the rest are hidden: damage looks, lights that are off, spare missiles... or are single pieces of a batch).
   Now vehicles follow the same rule as the rest of the desert: a hidden part is worked out again the moment it is
   shown, before it is drawn, and code that asks where a part is gets a fresh answer first (mwFresh now also looks
   inside vehicles). The one thing that read hidden vehicle parts directly was the batching watchdog, which already
   asks mwFresh first. Crash debris, far-vehicle shapes and the Wraith's guns already work out positions themselves.
   ?nomwv in the address turns it off to compare.
   ===================================================================================================== */
const MWV={on:!/[?&]nomwv/.test(location.search),skipped:0};
/* a vehicle: shown parts only, with the same "did it change" check as the rest of the desert */
{const f0=mwFull;mwFull=function(o,force){if(!MWV.on||!MWC.on)return f0(o,force);force=mwSelf(o,force);
 const ch=o.children;for(let i=0,l=ch.length;i<l;i++){const c=ch[i];
  if(c.updateMatrixWorld!==_mwP){c.updateMatrixWorld(force);continue}
  if(!c.visible){c.__mwSk=MWX.fr;MWV.skipped++;continue}
  if(c.layers.mask===4&&c.isMesh&&!c.isSprite&&!c.children.length){MWV.skipped++;continue}
  mwFull(c,force)}}}
/* the fresh-position helper (r629) used to stop at a vehicle, because vehicles were always up to date. A single batched
   piece (its parent was worked out by the frame) now uses the frame's own "did it change" check (r647) instead of
   working out its matrix again every time: the batching watchdog asks for every vehicle piece every few frames */
{const f0=mwFresh;mwFresh=function(o){if(!MWV.on||!MWC.on)return f0(o);if(!MWX.used||!o||o.__mwKeep||o.__mwx)return;
 const leaf=o.isMesh&&!o.isSprite&&o.layers.mask===4&&!o.children.length;let chain=!o.visible||o.__mwSk===MWX.fr;
 for(let p=o.parent;p;p=p.parent){if(p.__mwx){if(chain){o.updateWorldMatrix(true,false);MWX.fresh++}else if(leaf){mwSelf(o,false);MWX.fresh++}return}if(!p.visible||p.__mwSk===MWX.fr)chain=true}}}
