/* =====================================================================================================
   r646: DESERT PERFORMANCE: PLACES WITH MOVING PARTS ARE BATCHED TOO.
   Places built after the desert loads (the Desert PD HQ, some of the Fort, the far places...) are batched by the late
   batcher (r603, dx599) only once NOTHING in them has moved for six seconds. A place with one walking officer, a
   turning fan or a blinking light never got there, so every piece of it was drawn on its own: the Desert PD HQ
   alone is about 1,550 separate pieces (draw calls) whenever you look at it.
   Now a place the late batcher has not batched after four seconds is also looked at piece by piece:
     - every piece is watched for ten seconds (where it is, whether it is shown, its colour, glow, see-through and picture,
       the same things the batch watchdog checks);
     - pieces that changed at any point (walking people, doors, fans, blinking or flashing lights...), and pieces that
       animate themselves while they are drawn, are left alone
       and drawn by themselves exactly as before (flagged dpDyn, the batcher's own "this one moves" flag);
     - everything else is batched like the rest of the desert (DP._mergeRoot, the same batches and hidden pieces).
   Pieces are compared with the place itself, so a place that moves as a whole (a police car the game drives around,
   a walking officer) is batched relative to itself, the way the vehicles are: the batch moves with it and the batcher's
   own watchdog checks it every frame. A place is skipped while pieces are still being added or removed.
   A piece that only starts moving later (an officer who stood still for ten seconds, a door you open) is caught
   by a watchdog that goes through these places' batches every frame (about 0.4 ms a frame, round and round): the
   piece is taken out of the batch and drawn by itself again, as before. ?nomxb in the address turns it all off.
   ===================================================================================================== */
var MXB={on:!/[?&]nomxb/.test(location.search),obs:new Map(),first:new Map(),roots:[],q:null,lt:0,wi:0,ri:0,WAIT:10000,BUDGET:.4,
 stats:{roots:0,batches:0,pieces:0,dyn:0,unmerged:0,ms:0}};
/* where a piece is and how it looks, as one number (a change in any of these keeps it out of the batch); pieces that can
   never be batched safely get NaN, which never equals itself, so they always count as changed */
const _mxM=new THREE.Matrix4(),_mxI=new THREE.Matrix4(),_mxK=[3,5,7,11,13,17,19,23,29,31,37,41];const _mxE=[0,1,2,4,5,6,8,9,10,12,13,14];
function mxbSig(o,vis){const m=o.material;if(!m||Array.isArray(m)||o.onBeforeRender!==THREE.Object3D.prototype.onBeforeRender)return NaN;/* (a piece that animates itself while drawn would stop once batched) */
 const e=_mxM.multiplyMatrices(_mxI,o.matrixWorld).elements;let h=0;for(let k=0;k<12;k++)h+=Math.round(e[_mxE[k]]*500)*_mxK[k];
 const t=m.map,pa=o.geometry.attributes.position;
 h+=(vis?0:104729)+(m.visible?0:7919)+(m.color?m.color.getHex():0)*1.37+(m.emissive?m.emissive.getHex():0)*2.11+(m.emissiveIntensity||0)*977.3+(m.opacity||0)*1931.7+o.geometry.id*.913+(pa?pa.version:0)*61.1;
 if(t)h+=t.id*.537+t.version*71.3+t.offset.x*829.1+t.offset.y*653.9+t.repeat.x*431.3+t.repeat.y*367.7+t.rotation*283.1;return h}
/* one look at a place: which pieces changed since the last look */
function mxbLook(o,now){o.updateMatrixWorld(true);_mxI.copy(o.matrixWorld).invert();const cur=new Map(),st=[[o,true]];
 while(st.length){const[x,v]=st.pop();for(const c of x.children){const cv=v&&c.visible;if(c.isMesh)cur.set(c,mxbSig(c,cv));if(c.children.length)st.push([c,cv])}}
 const rm=o.matrixWorld.elements.join(',');let ob=MXB.obs.get(o);
 if(!ob||ob.n!==cur.size){MXB.obs.set(o,{t:now,n:cur.size,rm,last:cur,dyn:new Set(),k:0,moved:0});return null}if(ob.rm!==rm){ob.moved=1;ob.rm=rm}
 for(const[x,s]of cur)if(ob.last.get(x)!==s)ob.dyn.add(x);ob.last=cur;ob.k++;return ob}
function mxbBatch(q,o,ob){const t0=performance.now();let still=0;for(const x of ob.last.keys())if(!ob.dyn.has(x))still++;
 if(still<8){ob.t=performance.now()+50000;return}/* hardly anything stands still here: look again in a minute */
 for(const x of ob.dyn)x.userData.dpDyn=1;MXB.stats.dyn+=ob.dyn.size;o.userData.dpLate=1;MXB.obs.delete(o);
 try{o.updateMatrixWorld(true);const k=DP._mergeRoot(q,o,DP.cfg().lam,false);if(o.userData.dpRecs&&o.userData.dpRecs.length){
  /* a place that moves as a whole (a car the game drives, a walking officer) is checked every frame by the batcher's own watchdog, like the vehicles */
  if(ob.moved){o.userData.dpMoving=1;(q.dp.movers||(q.dp.movers=[])).push(o);MXB.stats.movers=(MXB.stats.movers|0)+1}else MXB.roots.push(o);MXB.stats.roots++;MXB.stats.batches+=k[0];MXB.stats.pieces+=k[1]}}
 catch(e){conLog('error','batching a place with moving parts: '+e.message)}MXB.stats.ms+=performance.now()-t0}
/* every 1.5 s: look at the places the late batcher has not managed to batch; batch one that has been watched long enough */
function mxbTick(q){const D=q.dp;if(!D||!D.merged||!D.roots||typeof DP=='undefined'||!DP._mergeRoot||!DP._check)return;const now=performance.now();
 const known=new Set(D.roots.concat(D.movers||[])),veh=new Set((q.vehs||[]).map(v=>v.m)),seen=new Set();let done=false;
 for(const o of q.g.children){if(known.has(o)||veh.has(o)||o.userData.dpLate||o.userData.chunk||o.userData.dpKeep||o.userData.noChunk||o.userData.mv)continue;
  if(!(o.isGroup||o.type==='Group'||o.type==='Object3D')||!o.visible)continue;try{if(typeof MN!='undefined'&&o===MN.g)continue}catch(e){}
  /* the late batcher goes first (it batches places that are completely still after six seconds): start watching after four, batch after fourteen */
  let f=MXB.first.get(o);if(f==null)MXB.first.set(o,f=now);if(now-f<4000)continue;seen.add(o);
  const ob=mxbLook(o,now);if(ob&&!done&&ob.k>=4&&now-ob.t>=MXB.WAIT){mxbBatch(q,o,ob);done=true}}
 for(const o of MXB.obs.keys())if(!seen.has(o))MXB.obs.delete(o)}
function mxbShown(r,g){for(let p=r;p&&p!==g;p=p.parent)if(!p.visible||!p.parent)return false;return true}
/* the watchdog for these places: a few batches every frame, so a piece that starts moving is let go almost at once */
function mxbWatch(q){const L=MXB.roots;if(!L.length)return;const t0=performance.now();let guard=0;
 while(L.length&&guard++<400&&performance.now()-t0<MXB.BUDGET){if(MXB.wi>=L.length){MXB.wi=0;MXB.ri=0}const r=L[MXB.wi],recs=r.userData.dpRecs;
  if(!r.parent||!recs||!recs.length){L.splice(MXB.wi,1);MXB.ri=0;continue}
  if(MXB.ri>=recs.length||!mxbShown(r,q.g)){MXB.wi++;MXB.ri=0;continue}
  MXB.stats.unmerged+=DP._check([recs[MXB.ri]],0);MXB.ri++}}
{const ru=busRoamUpd;busRoamUpd=function(q,dt){const r=ru.apply(this,arguments);try{if(MXB.on&&q&&q.g&&!q.ld&&typeof PERF!='undefined'&&PERF.on){if(MXB.q!==q){MXB.q=q;MXB.obs=new Map();MXB.first=new Map();MXB.roots=[];MXB.wi=0;MXB.ri=0;MXB.lt=0}
  const now=performance.now();if(now-MXB.lt>1500){MXB.lt=now;mxbTick(q);const d=performance.now()-now;MXB.stats.tick=+d.toFixed(2);if(d>(MXB.stats.tickMax||0))MXB.stats.tickMax=+d.toFixed(2)}mxbWatch(q)}}catch(e){conLog('error','batching places with moving parts: '+e.message);MXB.on=false}return r}}
