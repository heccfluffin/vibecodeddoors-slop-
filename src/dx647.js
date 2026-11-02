/* =====================================================================================================
   r665: DESERT PERFORMANCE: BATCHED PIECES ARE LEFT OUT OF THE FRAME'S WALK.
   Most desert scenery is drawn in batches (r500 and later): each piece of a batch stays in the scene, moved to
   layer 2, so the batching watchdog can notice when it changes. But the renderer and the position update still walked
   through every one of those pieces every frame: 26,000 to 34,000 of them in the Benchmark views, never drawn.
   The r664 test switch showed that leaving them out saves 6 to 10 ms a frame on the user's PC.
   Now, while the main view is drawn, each group hands the renderer a list of its children without its batched pieces;
   straight after drawing the real list is put back, so the game code always sees the real children. Nothing is
   moved, hidden or removed. A piece only counts as "batched" when the frame's position update would skip it anyway
   (a leaf on layer 2 with the normal update), so no position is worked out any differently.
   A left-out piece says so when its layer changes (the watchdog putting it back on layer 1, however that is written) or
   when something is added to it; it then goes back into its group's list before drawing, so it is drawn that same frame
   (only that piece is moved, r666; before, the whole group was sorted again). A group whose children were added, removed
   or replaced is sorted again. (Checking every piece
   every frame instead cost about as much as walking them.)
   The lists are found a little at a time (0.5 ms a frame) and found again every 5 s, so newly shown places join in.
   ?nobake in the address turns it off.
   ===================================================================================================== */
const BAKE={on:!/[?&]nobake(?:[&=]|$)/.test(location.search),q:null,L:[],job:null,t:-1e9,n:0,up:0,fr:0,swp:[],nb:0,dirty:new Set(),wired:0};
/* a piece the frame's position update leaves out anyway (dx621/dx633/dx639 use the same test) */
const bakeLeaf=c=>c.isMesh&&!c.isSprite&&c.layers.mask===4&&c.children.length===0&&c.updateMatrixWorld===_mwP&&!c.__mwKeep;
/* a left-out piece's layers tell its group when they change (only left-out pieces get this, and nothing reads them every frame) */
function bakeWire(c){if(c.__bk)return;c.__bk=1;BAKE.wired++;const L=c.layers;let m=L.mask;
 Object.defineProperty(L,'mask',{configurable:true,enumerable:true,get(){return m},set(v){if(v!==m){m=v;BAKE.dirty.add(c)}}})}
function bakeEntry(p){const orig=p.children,keep=[],sk=[];for(const c of orig)(bakeLeaf(c)?sk:keep).push(c);if(!sk.length)return null;for(const c of sk)bakeWire(c);return{p,orig,len:orig.length,keep,sk}}
/* something added to a left-out piece: its group looks again */
{const a0=THREE.Object3D.prototype.add;THREE.Object3D.prototype.add=function(){if(this.__bk)BAKE.dirty.add(this);return a0.apply(this,arguments)}}
/* look through the shown desert a little at a time; vehicles only when their own update skips such pieces (r653) */
function bakeFind(q,ms){const t0=performance.now();let J=BAKE.job;
 if(!J){J=BAKE.job={st:[[q.g,false]],L:[]}}
 const vok=typeof MWV!='undefined'&&MWV.on&&MWC.on;
 while(J.st.length){const[o,inV]=J.st.pop();if(!o.visible||o.children.length===0)continue;
  /* an object with its own position update walks its children itself: left alone */if(o!==q.g&&o.updateMatrixWorld!==_mwP)continue;const iv=inV||!!o.__mwKeep;
  if(!(iv&&!vok)){const e=bakeEntry(o);if(e)J.L.push(e)}
  for(const c of o.children)if(c.children.length)J.st.push([c,iv]);
  if(performance.now()-t0>ms)return false}
 BAKE.L=J.L;BAKE.job=null;BAKE.nb++;return true}
{const r0=R.render;R.render=function(sc,cam){const q=BUS&&BUS.ride;
 if(!BAKE.on||sc!==S||cam!==C||!q||!q.g||!q.g.visible||q.ld||!q.dp||!q.dp.merged||typeof MWX=='undefined'||!MWX.on||!MWX.used||(LAG.open&&(LAG.mwxOff||LAG.hide.nobake))){
  if(BAKE.q&&q!==BAKE.q){BAKE.q=null;BAKE.L=[];BAKE.job=null}return r0.apply(this,arguments)}
 const t0=performance.now();if(BAKE.q!==q){BAKE.q=q;BAKE.L=[];BAKE.job=null;BAKE.t=t0}
 if(BAKE.job||t0-BAKE.t>5000){if(!BAKE.job)BAKE.t=t0;bakeFind(q,.5)}
 if(BAKE.dirty.size)bakeBack(false);const sw=BAKE.swp;sw.length=0;let n=0;
 for(const e of BAKE.L){const p=e.p;const ok=p.children===e.orig&&e.orig.length===e.len;
  if(!ok){const f=bakeEntry(p);if(!f){e.sk=[];e.orig=p.children;e.len=e.orig.length;continue}e.orig=f.orig;e.len=f.len;e.keep=f.keep;e.sk=f.sk}
  p.__bkE=e;if(!e.sk.length||p.__bkO!==undefined)continue;p.__bkO=e.orig;p.children=e.keep;p.__bkN=e.keep.length;sw.push(p);n+=e.sk.length}
 const t1=performance.now();BAKE.inR=1;
 try{return r0.apply(this,arguments)}
 finally{BAKE.inR=0;const t2=performance.now();
  /* the real lists back; anything added while drawing goes into the real list too */
  for(const p of sw){const a=p.children,orig=p.__bkO;if(a!==orig&&a.length!==p.__bkN){for(const c of a)if(!orig.includes(c))orig.push(c)}p.children=orig;p.__bkO=undefined}sw.length=0;
  const d=(t1-t0)+(performance.now()-t2);BAKE.n=n;BAKE.up+=d;BAKE.fr++;
  if(LAG.open){LAG.sys.bake=(LAG.sys.bake||0)+d;LAG.cur.bake=(LAG.cur.bake||0)+d}}}}
/* the lag window: its own time, a switch that turns it off for comparison, and what it left out in each Benchmark view */
LAGSYS.push(['bake','Batched pieces left out of the walk (upkeep)']);
if(BAKE.on){for(let i=LAGHIDE.length-1;i>=0;i--)if(LAGSK.keys[LAGHIDE[i][0]])LAGHIDE.splice(i,1);LAGHIDE.push(['nobake','Nothing, but batched pieces walked again (r665 off, to compare)'])}
{const ls=lagSet;lagSet=function(k){if(k==='nobake')return[];return ls.apply(this,arguments)}}
{const lr=lagRun;lagRun=async function(){BAKE.sn=0;BAKE.sf=0;const A=await lr.apply(this,arguments);if(A)A.bake={n:BAKE.sf?BAKE.sn/BAKE.sf:BAKE.n};return A}}
{const lt=lagTake;lagTake=function(){if(!(LAG.hide&&LAG.hide.nobake)){BAKE.sn=(BAKE.sn||0)+BAKE.n;BAKE.sf=(BAKE.sf||0)+1}return lt.apply(this,arguments)}}
{const ll=lagLimit;lagLimit=function(A){let s=ll.apply(this,arguments);try{if(BAKE.on&&A&&A.bake)s='Batched pieces left out of the walk: '+lagF(A.bake.n,0)+' a frame\n'+s;s=s.replace(/Hide nothing, but batched pieces walked again \(r665 off, to compare\)/g,'Batched pieces walked again (r665 switched off, to compare)')}catch(e){}return s}}
/* a piece put back on layer 1 while this frame's positions are worked out (the people batching does that when a piece
   changes its look): it goes back into its group's list right away, with its position, before anything is drawn */
/* pieces that said they changed: one no longer left out goes back into its group's list (while drawing too, with its
   position worked out the way the frame would). One that became a batched piece again waits for the next look (5 s) */
function bakeBack(mid){for(const c of BAKE.dirty){const p=c.parent,e=p&&p.__bkE;if(!e||bakeLeaf(c))continue;const i=e.sk.indexOf(c);if(i<0)continue;
  e.sk.splice(i,1);e.keep.push(c);if(mid&&p.children===e.keep){p.__bkN++;if(typeof mwSelf=='function'&&MWC.on)mwSelf(c,false);else c.updateWorldMatrix(false,false)}}
 BAKE.dirty.clear()}
{const u0=S.updateMatrixWorld;S.updateMatrixWorld=function(){const r=u0.apply(this,arguments);if(BAKE.inR&&BAKE.dirty.size)try{bakeBack(true)}catch(e){conLog('error','batched pieces: '+e.message)}return r}}
{const st=lagSpikeTxt;lagSpikeTxt=function(){const t=st.apply(this,arguments);return typeof t=='string'?t.replace(/Hide nothing, but batched pieces walked again \(r665 off, to compare\)/g,'Batched pieces walked again (r665 switched off, to compare)'):t}}
