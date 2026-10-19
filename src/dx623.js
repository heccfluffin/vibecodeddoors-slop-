/* =====================================================================================================
   r632: WARM-UP: send the desert to the graphics card a little at a time, before you get there.
   The first time something is drawn, the browser has to upload its shape (and compile its shader if it is the first of
   its kind). When you walked into a new part of the desert that happened for hundreds of things in one frame: the
   freezes of 100-850 ms right after arriving and when reaching new places.
   Now, while the bus drives you in (about 10 ms a frame, around the bus stop where you get off) and then while you play (about 2.5 ms a frame), the game
   uploads the things NEAREST to you first, up to 450 m away, a small batch at a time. Further things follow as you
   move. Nothing is drawn differently: each batch is drawn into a single pixel, which the normal frame then paints over.
   The loading screen is not made any longer. Nothing far away or never shown is uploaded early (to save memory):
   only things that are shown, or hidden only because they are far away (scenery chunks, small details, vehicles).
   Merged pieces (the batch is drawn instead) are left alone. The desert lights the real frame uses are brought along, so
   the shaders made are exactly the ones the game needs. Batches shrink when they are slow (a new shader, big shapes). If anything goes wrong it switches itself off and the
   game uploads things when they are first drawn, as before. ?nowarm in the address turns it off to compare.
   ===================================================================================================== */
/* r633: things added to the desert while you play are warmed straight away (see warmHot below) */
const WARM={on:!/[?&]nowarm/.test(location.search),done:new WeakSet(),list:[],scan:null,scanT:0,sortT:0,q:null,fail:0,
 R:450,BUS:10,PLAY:2.5,bs:16,lights:[],hot:[],hotC:[],HOTR:1200,stats:{objects:0,geos:0,ms:0,batches:0,maxMs:0},cam:null,prox:null};
/* walk the desert a few thousand objects per frame and list what still needs uploading */
function warmScanStep(q,n){const S2=WARM.scan;if(!S2)return true;const veh=S2.veh,PF=typeof PL_FAR!='undefined'?(1<<PL_FAR):64;
 while(n-->0&&S2.st.length){const[o,cx,cz]=S2.st.pop();const ud=o.userData||{};if(o.isLight)S2.lights.push(o);
  if(o!==q.g&&!o.visible){if(!(ud.chunk||ud.sm||veh.has(o)))continue}
  if(o===q.sky||o===q.zsky||o===q.zstar)continue;
  let x=cx,z=cz;if(ud.chunk){x=ud.cx;z=ud.cz+q.OZ}
  if((o.isMesh||o.isSprite||o.isPoints||o.isLine)&&o.geometry&&!o.children.length&&!WARM.done.has(o.geometry)){const m=o.layers.mask;
   if(((m&1)||m===PF)&&o.onBeforeRender===THREE.Object3D.prototype.onBeforeRender){let px=x,pz=z;if(px==null){/* positions of things the last frame skipped (r629) are worked out first */try{mwFresh(o)}catch(e){}const e=o.matrixWorld.elements;px=e[12];pz=e[14];if(ud.dpMerged){const g=o.geometry;if(!g.boundingSphere)g.computeBoundingSphere();const c=g.boundingSphere.center.clone().applyMatrix4(o.matrixWorld);px=c.x;pz=c.z}}S2.out.push({o,x:px,z:pz})}}
  for(let i=o.children.length-1;i>=0;i--)S2.st.push([o.children[i],x,z])}
 if(S2.st.length)return false;WARM.list=S2.out;WARM.lights=S2.lights;WARM.litQ=q;WARM.scan=null;warmSort();return true}
/* where to warm around: you, or while the bus is still driving in, the bus stop where it will let you off */
function warmCtr(q){return q.roam?[P.x,P.z]:[0,-1043+q.OZ]}
function warmSort(){const L=WARM.list,[cx,cz]=warmCtr(WARM.q);for(const it of L)it.d=Math.hypot(it.x-cx,it.z-cz);L.sort((a,b)=>b.d-a.d);WARM.sortT=performance.now()}/* nearest at the end, popped first */
/* draw a batch into one pixel so its shapes, textures and shaders reach the graphics card */
function warmBatch(q,L,r0){if(!WARM.cam){WARM.cam=new THREE.PerspectiveCamera(60,1,.1,10);WARM.cam.layers.mask=1|(1<<(typeof PL_FAR!='undefined'?PL_FAR:6));WARM.prox=new THREE.Group();WARM.prox.matrixAutoUpdate=false}
 const prox=WARM.prox,saved=[],vp=new THREE.Vector4(),sc=new THREE.Vector4();R.getViewport(vp);R.getScissor(sc);const st=R.getScissorTest(),au=S.autoUpdate,gv=q.g.visible;
 /* the desert's lights that the real frame will use (shown, on the camera's layers) come along, so the shaders made are the very same ones */
 const LL=L.slice();for(const l of WARM.lights){if(!l.parent||!l.layers.test(C.layers))continue;let ok=true;for(let p=l;p&&p!==S;p=p.parent)if(!p.visible){ok=false;break}if(ok)LL.push(l)}
 try{for(const o of LL){const p=o.parent;if(!p)continue;const i=p.children.indexOf(o);if(i<0)continue;p.children.splice(i,1);o.parent=prox;prox.children.push(o);saved.push([o,p,i,o.frustumCulled]);if(!o.isLight)o.frustumCulled=false}
  S.add(prox);q.g.visible=false;S.autoUpdate=false;R.setViewport(0,0,1,1);R.setScissor(0,0,1,1);R.setScissorTest(true);r0.call(R,S,WARM.cam)}
 finally{S.remove(prox);q.g.visible=gv;S.autoUpdate=au;R.setScissorTest(st);R.setScissor(sc);R.setViewport(vp);prox.children.length=0;
  for(let k=saved.length-1;k>=0;k--){const[o,p,i,fc]=saved[k];o.parent=p;p.children.splice(i,0,o);o.frustumCulled=fc}}}
function warmTick(q,r0){if(!WARM.on||!q||!q.g||q.ld||state!=='bus')return;if(WARM.q!==q){WARM.q=q;WARM.list=[];WARM.lights=[];WARM.litQ=null;WARM.hot=[];WARM.hotC=[];WARM.scan=null;WARM.scanT=0}
 const now=performance.now();
 if(WARM.roam!==q.roam){WARM.roam=q.roam;WARM.scanT=0;warmSort()}
 if(!WARM.scan&&(!WARM.list.length&&now-WARM.scanT>3000||now-WARM.scanT>12000)){WARM.scanT=now;WARM.scan={st:[[q.g,null,null]],out:[],lights:[],veh:new Set((q.vehs||[]).map(v=>v&&v.m).filter(Boolean))}}
 /* nothing new is warmed until the first scan has found the desert's lights (else its shaders would be made for an unlit scene) */
 if(WARM.litQ===q&&(WARM.hot.length||WARM.hotC.length))warmHot(q,r0);
 if(WARM.scan){warmScanStep(q,4000);if(WARM.scan&&!WARM.list.length)return}
 if(now-WARM.sortT>2000)warmSort();
 const L=WARM.list;if(!L.length)return;const budget=q.roam?WARM.PLAY:WARM.BUS,t0=performance.now(),[cx,cz]=warmCtr(q);
 while(L.length&&performance.now()-t0<budget){const b=[];while(L.length&&b.length<WARM.bs){const it=L[L.length-1];if(Math.hypot(it.x-cx,it.z-cz)>WARM.R)break;L.pop();const g=it.o.geometry;if(!g||WARM.done.has(g)||!it.o.parent)continue;WARM.done.add(g);b.push(it.o)}
  if(!b.length)break;const t1=performance.now();warmBatch(q,b,r0);const d=performance.now()-t1;WARM.stats.objects+=b.length;WARM.stats.batches++;WARM.stats.ms+=d;if(d>WARM.stats.maxMs)WARM.stats.maxMs=d;/* a slow batch (big shapes, a new shader) makes the next ones smaller */if(d>budget*2)WARM.bs=Math.max(2,WARM.bs>>1);else if(d<budget*.5)WARM.bs=Math.min(64,WARM.bs+4)}}
/* r633: NEW THINGS (a car that just spawned, a model swapped in, a freshly merged batch) are noticed the moment they are
   added to the desert and warmed first, a small batch per frame within the same time budget, so a car is usually ready
   long before it drives into view. One that appears right in front of you is simply uploaded when drawn, as before. */
function warmHotList(q,root){const out=WARM.hotC;const PF=typeof PL_FAR!='undefined'?(1<<PL_FAR):64;const st=[root];let n=0;
 while(st.length&&n++<6000){const o=st.pop();if(o!==root&&!o.visible)continue;if(o.isLight){if(!WARM.lights.includes(o))WARM.lights.push(o);continue}
  if((o.isMesh||o.isSprite||o.isPoints||o.isLine)&&o.geometry&&!o.children.length&&!WARM.done.has(o.geometry)){const m=o.layers.mask;if(((m&1)||m===PF)&&o.onBeforeRender===THREE.Object3D.prototype.onBeforeRender)out.push(o)}
  for(let i=o.children.length-1;i>=0;i--)st.push(o.children[i])}}
function warmHot(q,r0){const budget=q.roam?WARM.PLAY:WARM.BUS,t0=performance.now();
 while(WARM.hot.length&&WARM.hotC.length<400){const o=WARM.hot.shift();if(!o||!o.parent||!mwIn(o))continue;o.updateWorldMatrix(true,false);let x=o.matrixWorld.elements[12],z=o.matrixWorld.elements[14];
  /* a merged batch sits at its group's origin: measure from what it draws */if(o.userData&&o.userData.dpMerged&&o.geometry){const g=o.geometry;if(!g.boundingSphere)g.computeBoundingSphere();const c=g.boundingSphere.center.clone().applyMatrix4(o.matrixWorld);x=c.x;z=c.z}
  /* vehicles move, so they are warmed from further away (1.2 km); anything else new waits until it is as near as the rest (450 m) */
  const isVeh=(q.vehs||[]).some(v=>v&&v.m===o);if(Math.hypot(x-P.x,z-P.z)>(isVeh?WARM.HOTR:WARM.R)){if(!isVeh)WARM.scanT=Math.min(WARM.scanT,performance.now()-9000);continue}warmHotList(q,o)}
 const L=WARM.hotC;while(L.length&&performance.now()-t0<budget){const b=[];while(L.length&&b.length<WARM.bs){const o=L.shift();const g=o.geometry;if(!g||WARM.done.has(g)||!o.parent)continue;WARM.done.add(g);b.push(o)}
  if(!b.length)break;const t1=performance.now();warmBatch(q,b,r0);const d=performance.now()-t1;WARM.stats.hot=(WARM.stats.hot||0)+b.length;WARM.stats.batches++;WARM.stats.ms+=d;if(d>WARM.stats.maxMs)WARM.stats.maxMs=d;if(d>budget*2)WARM.bs=Math.max(2,WARM.bs>>1);else if(d<budget*.5)WARM.bs=Math.min(64,WARM.bs+4)}}
{const a0=THREE.Object3D.prototype.add;THREE.Object3D.prototype.add=function(){const r=a0.apply(this,arguments);try{const q=WARM.q;if(WARM.on&&q&&q===BUS.ride&&!q.ld){let inD=false;for(let p=this;p;p=p.parent)if(p.__mwx){inD=true;break}
  if(inD)for(const o of arguments)if(o&&o.isObject3D&&o.parent===this){if(WARM.hot.length<3000)WARM.hot.push(o);else WARM.scanT=0}}}catch(e){}return r}}
/* also mark what the normal frame draws, so it is never uploaded "again" by the warm-up */
{const rb=R.renderBufferDirect;R.renderBufferDirect=function(cam,sc,geo){if(geo)WARM.done.add(geo);return rb.apply(this,arguments)}}
{const r0=R.render;WARM.r0=r0;R.render=function(sc,cam){if(sc===S&&cam===C&&WARM.on){try{warmTick(BUS&&BUS.ride,r0)}catch(e){WARM.fail++;conLog('error','warm-up: '+e.message);if(WARM.fail>3){WARM.on=false;conLog('error','warm-up switched off (the game uploads things as they are drawn, as before)')}}}return r0.apply(this,arguments)}}
