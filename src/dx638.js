/* =====================================================================================================
   r652: DESERT PERFORMANCE: FAR SCENERY IS DRAWN AS SIMPLE SHAPES (area level of detail, step 3).
   The desert's scenery is kept in 48 m cells. Every shown cell was drawn piece by piece (several batches plus its small
   details), and every object in it was looked at every frame to see whether it had moved: about 7,000 to 10,000 objects
   a frame in cells more than 150 m away.
   Now a cell whose nearest edge is more than 160 m from the camera is drawn as one simple shape (at most three draws, the
   same plain / shiny metal / lights materials as the far vehicles, each piece in its own colour, a picture as its average
   colour, the tiniest bits and see-through lettering left out), and its small details as a second one where they are
   drawn today. Closer than 140 m the real cell is drawn again, exactly as before.
   A cell with nothing in it that changes is hidden as a whole while its shape is shown, the same way the game already
   hides cells further than about 300 m, so nothing in it is looked at either. Anything in a cell that changes on its own
   (a turning sign, a blinking light) is found by watching the cell for a few seconds first: those things, and things
   that cannot be drawn as a plain shape (glows, big see-through glass, lights), stay real and are drawn as they are, and
   only the rest of the cell is swapped. A cell that starts changing later goes back to real at once and is made again
   without the changing part. Nothing the game does with the cells is changed (collisions use their own boxes).
   ?nofsc in the address turns it all off to compare.
   r653: cheaper upkeep (it cost about 1 ms a frame on the user's computer): the changes check looks at smaller slices
   with a cheaper fingerprint, at most one new cell starts being watched each frame, and cells that cannot be made into
   shapes are not tried again every two minutes.
   ===================================================================================================== */
const FSC={on:!/[?&]nofsc/.test(location.search),q:null,g:null,ent:new Map(),watch:new Map(),job:null,D0:140,D1:160,PRE:130,BUDGET:2.5,CHECK:.12,MINR:.08,WATCH:4000,
 lively:new WeakMap(),cool:new WeakMap(),rr:0,wr:0,stats:{built:0,hideMode:0,layerMode:0,dropped:0,ms:0,why:{}}};
/* one number per object for what can change on its own: where it is, shown or not, its colour, glow, see-through and picture offset */
function fscSig(o){const p=o.position,r=o.quaternion,s=o.scale;let h=p.x*1.13+p.y*2.31+p.z*3.73+r._x*5.39+r._y*7.11+r._z*11.3+r._w*13.7+s.x*17.9+s.y*19.3+s.z*23.1+(o.visible?0:29.5);
 const m=o.material;if(m&&!Array.isArray(m)){const c=m.color,e=m.emissive;if(c)h+=c.r*59.1+c.g*61.7+c.b*67.3;if(e)h+=e.r*71.9+e.g*73.1+e.b*79.7+(m.emissiveIntensity||0)*31.7;h+=(m.opacity||0)*37.1+(m.visible?0:41.3);const t=m.map;if(t)h+=t.offset.x*43.7+t.offset.y*47.9+t.rotation*53.3}return h}
function fscObjs(c){const L=[],sg=c.userData.smg;c.traverse(o=>{if(o!==c&&o!==sg)L.push(o)});return L}/* (the cell itself and its small-details group are shown and hidden by the game and by this, so they are not compared) */
/* cell distance as the game's own culling measures it, from the camera */
function fscDist(q,c){const u=c.userData;return Math.hypot(u.cx-C.position.x,u.cz-(C.position.z-q.OZ))-u.ext}
/* step 1: look at one part of a cell (its main pieces, or its small details) */
function fscCollect(q,c,sm,st){const root=sm?c.userData.smg:c;if(!root)return null;const inv=st.inv,lv=st.lv;
 const mems=[[],[],[]];let nv=[0,0,0],ni=[0,0,0];const mcache=new Map();
 const walk=o=>{if(!sm&&o===c.userData.smg)return;if(o!==root&&!o.visible)return;st.nodes.push(o);
  if(lv&&lv.has(o)){st.keep.push(o);return}/* (it changes on its own: stays real) */
  if(o.isLight){st.keep.push(o);return}
  if(o.userData.dpMerged){if(o.layers.mask&1)st.batches.push(o);return}
  if(o.isSprite||o.isPoints||o.isLine||o.isInstancedMesh||o.isSkinnedMesh){st.keep.push(o);return}
  if(o.isMesh){const mk=o.layers.mask;if((mk&1)||mk===4){const g=o.geometry,ML=Array.isArray(o.material)?o.material:[o.material];let keep=!DP._geoOK(g)||o.onBeforeRender!==THREE.Object3D.prototype.onBeforeRender,decal=false;
    if(!g.boundingSphere)g.computeBoundingSphere();_flS.copy(g.boundingSphere).applyMatrix4(o.matrixWorld);
    for(const mt of ML){if(!mt||mt.side===THREE.BackSide||(mt.transparent&&mt.opacity<.2)||(mt.transparent&&mt.opacity<.9&&_flS.radius>2))keep=true;else if(mt.map&&(mt.transparent||mt.alphaTest>0)){const a=flvTexAvg(mt.map);if(a&&a.cov<.5)decal=true}}
    _flM.multiplyMatrices(inv,o.matrixWorld);if(_flM.determinant()<=0)keep=true;
    if(keep)st.keep.push(o);
    else{if(!decal&&_flS.radius>=FSC.MINR){const mm=Float32Array.from(_flM.elements);
      const add=(mt,s,ic,vc)=>{let cb=mcache.get(mt);if(!cb){let b=0,col;const em=mt.emissive?mt.emissive.getHex():0,ei=mt.emissiveIntensity==null?1:mt.emissiveIntensity;
         if(mt.type==='MeshBasicMaterial'){b=2;col=mt.color.clone();if(mt.map){const a=flvTexAvg(mt.map);if(a&&a.col)col.multiply(a.col)}}else if(em&&ei>0){_flC.setHex(em).multiplyScalar(ei);if(_flC.r+_flC.g+_flC.b>.9){b=2;col=_flC.clone()}}
         if(!col){col=mt.color?mt.color.clone():new THREE.Color(1,1,1);if(mt.map){const a=flvTexAvg(mt.map);if(a&&a.col)col.multiply(a.col)}if(mt.metalness!=null&&mt.metalness>=.45&&!mt.transparent)b=1;if(mt.transparent&&mt.opacity<1)col.lerp(_flC.setRGB(.05,.055,.06),1-mt.opacity)}
         cb=[b,col];mcache.set(mt,cb)}
        const ds=mt.side===THREE.DoubleSide;mems[cb[0]].push({o,s,ic,vc,m:mm,col:cb[1],ds});nv[cb[0]]+=ds?vc*2:vc;ni[cb[0]]+=ds?ic*2:ic;st.mats.add(mt)};
      const n=g.index?g.index.count:g.attributes.position.count,pc=g.attributes.position.count;
      if(Array.isArray(o.material)){if(g.groups&&g.groups.length)for(const gr of g.groups){const mt=o.material[gr.materialIndex];const k=Math.min(gr.count,n-gr.start);if(mt&&k>0)add(mt,gr.start,k,g.index?pc:k)}}else add(o.material,0,n,pc)}
     /* (merged, or too small or see-through lettering: hidden either way) */st.pcs.push([o,mk]);if(mk&1)st.hide.push(o)}}}
  for(const ch of o.children)walk(ch)};
 walk(root);if(!mems[0].length&&!mems[1].length&&!mems[2].length)return null;
 const buf=[0,1,2].map(b=>{const n=nv[b];return n?{pos:new Float32Array(n*3),nor:new Float32Array(n*3),col:new Float32Array(n*3),idx:n>65535?new Uint32Array(ni[b]):new Uint16Array(ni[b]),vo:0,io:0,k:0}:null});
 return{mems,buf,b:0,ms:0}}
function fscStart(q,c){const LV=FSC.lively.get(c);const st={inv:new THREE.Matrix4().copy(q.g.matrixWorld).invert(),lv:LV||null,nodes:[],keep:[],batches:[],hide:[],pcs:[],mats:new Set()};
 const main=fscCollect(q,c,false,st),sm=fscCollect(q,c,true,st);if(!main&&!sm)return'nothing';
 /* something that stays real but is hidden inside a batch that would be hidden: it would vanish, so the cell stays as it is */
 if(st.keep.length){const own=new Map();for(const r of[c,c.userData.smg])if(r)for(const rec of(r.userData.dpRecs||[]))if(!rec.dead&&rec.mesh)for(const mm of rec.mems)if(!mm.out)own.set(mm.o,rec.mesh);
  for(const k of st.keep)if(k.isMesh&&k.layers.mask===4)return'blocked';
  const kept=new Set();for(const k of st.keep)k.traverse(x=>kept.add(x));for(const b of st.batches){const rec=[c,c.userData.smg].map(r=>r&&(r.userData.dpRecs||[]).find(x=>x.mesh===b)).find(Boolean);if(rec&&rec.mems.some(mm=>!mm.out&&kept.has(mm.o)))return'blocked'}}
 const objs=fscObjs(c),sig=new Float64Array(objs.length);for(let i=0;i<objs.length;i++)sig[i]=fscSig(objs[i]);
 const e={c,mode:st.keep.length?'layers':'hide',main:[],sm:[],on:false,ok:false,xv:true,st,objs,sig,hid:[],ri:0,pi:0,mats:[...st.mats].map(m=>[m,flvSig(m)]),t:performance.now()};
 return{e,parts:[main,sm],pi:0,ms:0}}
function fscStep(J,budget){const t0=performance.now();while(J.pi<2){const P2=J.parts[J.pi];if(!P2){J.pi++;continue}const left=budget-(performance.now()-t0);if(left<=0)break;if(flvStep(P2,left))J.pi++;else break}J.ms+=performance.now()-t0;return J.pi>=2}
/* step 3: nothing changed meanwhile? then the shapes are ready (not shown yet) */
function fscFinish(q,J){const e=J.e;const w=fscChanged(q,e,true);if(w){fscForget(e,w);return null}
 const M=flvMats();for(let k=0;k<2;k++){const P2=J.parts[k];if(!P2)continue;for(let b=0;b<3;b++){const B=P2.buf[b];if(!B)continue;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(B.pos,3));g.setAttribute('normal',new THREE.BufferAttribute(B.nor,3));g.setAttribute('color',new THREE.BufferAttribute(B.col,3));g.setIndex(new THREE.BufferAttribute(B.idx,1));g.computeBoundingSphere();
   const mesh=new THREE.Mesh(g,M[b]);mesh.matrixAutoUpdate=false;mesh.visible=false;mesh.layers.mask=4;mesh.userData={fsc:1,dpKeep:1,noSeam:1};FSC.g.add(mesh);(k?e.sm:e.main).push(mesh)}}
 e.ok=true;FSC.ent.set(e.c,e);FSC.stats.built++;FSC.stats[e.mode==='hide'?'hideMode':'layerMode']++;FSC.stats.ms+=J.ms;return e}
/* anything different from when the shapes were made? (full: everything; else a slice) */
function fscChanged(q,e,full){if(e.dirty)return'added or removed';const O=e.objs,n=full?O.length:Math.min(O.length,32);for(let k=0;k<n;k++){const i=full?k:(e.ri=(e.ri+1)%O.length);const o=O[i];if(!o.parent)return'removed';
  if(e.st.keep.includes&&e.mode==='layers'&&e.keepSet&&e.keepSet.has(o))continue;if(fscSig(o)!==e.sig[i]){e.culprit=o;return'something changed'}}
 if(e.c.children.length!==e.nc&&e.nc!=null)return'added or removed';
 const PC=e.st.pcs,pn=full?PC.length:Math.min(PC.length,24);for(let k=0;k<pn;k++){const i=full?k:(e.pi=(e.pi+1)%PC.length);const[o,m0]=PC[i],m=o.layers.mask;
  if(m0===4&&m!==4){e.culprit=o;return'a piece changed'}if(m0!==4&&e.on&&e.mode==='layers'&&m!==4){if(m&1){e.hid.push([o,m]);o.layers.mask=4}}else if(m0!==4&&!(e.on&&e.mode==='layers')&&m!==m0){e.culprit=o;return'a piece changed'}}
 return null}
function fscShow(q,e){if(e.on)return;if(e.mode==='hide'){e.xv=e.c.visible;e.c.visible=false}else{for(const o of e.st.hide)if(o.layers.mask&1){e.hid.push([o,o.layers.mask]);o.layers.mask=4}for(const b of e.st.batches)if(b.layers.mask&1){e.hid.push([b,b.layers.mask]);b.layers.mask=4}}
 for(const m of e.main){m.visible=true;m.layers.mask=1}e.on=true;fscSmSync(e)}
function fscBack(q,e){if(!e.on)return;for(const m of e.main){m.visible=false;m.layers.mask=4}for(const m of e.sm){m.visible=false;m.layers.mask=4}
 if(e.mode==='hide')e.c.visible=e.xv;else{for(const[o,mk]of e.hid)if(o.layers.mask===4)o.layers.mask=mk;e.hid.length=0}e.on=false}
/* the small details' shape is shown only where the game draws the small details (it decides that for the cell) */
function fscSmSync(e){const smg=e.c.userData.smg,on=e.on&&!!smg&&smg.visible;for(const m of e.sm){m.visible=on;m.layers.mask=on?1:4}}
function fscForget(e,why){if(FSC.q)fscBack(FSC.q,e);for(const m of e.main.concat(e.sm)){if(m.parent)m.parent.remove(m);try{m.geometry.dispose()}catch(x){}}e.main.length=e.sm.length=0;e.ok=false;
 if(FSC.ent.get(e.c)===e)FSC.ent.delete(e.c);FSC.stats.dropped++;FSC.stats.why[why]=(FSC.stats.why[why]|0)+1;
 const c=e.culprit;e.culprit=null;let L=FSC.lively.get(e.c);if(c&&c!==e.c&&!(c.userData&&c.userData.dpMerged)){if(!L)FSC.lively.set(e.c,L=new Set());L.add(c)}
 FSC.cool.set(e.c,performance.now()+(L&&L.size>=8?120000:3000))}
/* watch a cell for a few seconds before making its shapes: what changes on its own stays real */
function fscWatch(c,now,may){let w=FSC.watch.get(c);if(!w){if(!may)return false;const objs=fscObjs(c),sig=new Float64Array(objs.length);for(let i=0;i<objs.length;i++)sig[i]=fscSig(objs[i]);FSC.watch.set(c,{objs,sig,t0:now,n:objs.length});return false}
 if(now-w.t0<FSC.WATCH)return false;let L=FSC.lively.get(c);for(let i=0;i<w.objs.length;i++){const o=w.objs[i];if(fscSig(o)!==w.sig[i]){if(!L)FSC.lively.set(c,L=new Set());L.add(o)}}FSC.watch.delete(c);return true}
function fscTick(q){fscWrapCull();if(FSC.q!==q||!FSC.g||FSC.g.parent!==q.g){for(const e of[...FSC.ent.values()])fscForget(e,'left');FSC.job=null;FSC.watch=new Map();FSC.q=q;FSC.g=new THREE.Group();FSC.g.userData={noChunk:1,dpKeep:1,fsc:1};q.g.add(FSC.g)}
 const now=performance.now(),want=[];
 for(const c of q.chunks||[]){const e=FSC.ent.get(c);const shown=e&&e.on&&e.mode==='hide'?e.xv:c.visible;if(!shown){if(e&&e.on)fscBack(q,e);continue}const d=fscDist(q,c);
  if(e){if(e.on&&d<FSC.D0)fscBack(q,e);else if(!e.on&&d>FSC.D1)fscShow(q,e);if(e.on)fscSmSync(e)}
  else if(d>FSC.PRE&&!c.__fscJob&&!((FSC.cool.get(c)||0)>now))want.push([d,c])}
 /* the cells with shapes: a slice of each looked at again, round and round */
 const L=[...FSC.ent.values()];if(L.length){const t1=performance.now();let k=0;while(k++<L.length&&performance.now()-t1<FSC.CHECK){FSC.rr=(FSC.rr+1)%L.length;const e=L[FSC.rr];const w=fscChanged(q,e,false);if(w)fscForget(e,w)}}
 /* new cells: watched first (a few seconds), then their shapes made, nearest first, within about 2.5 ms a frame */
 want.sort((a,b)=>a[0]-b[0]);const t2=performance.now();let looked=false;
 for(let guard=0;guard<12;guard++){const left=FSC.BUDGET-(performance.now()-t2);if(left<=0)break;
  if(FSC.job){const J=FSC.job;let done=false;try{done=fscStep(J,left)}catch(x){delete J.e.c.__fscJob;FSC.job=null;throw x}if(!done)break;FSC.job=null;delete J.e.c.__fscJob;fscFinish(q,J);break}
  /* (at most one cell starts being watched each frame) */let next=null,may=true;for(const[,c]of want){const had=FSC.watch.has(c);if(fscWatch(c,now,may)){next=c;break}if(!had&&FSC.watch.has(c))may=false;if(performance.now()-t2>FSC.BUDGET*.5)break}if(!next||looked)break;looked=true;
  const r=fscStart(q,next);if(r&&typeof r=='object'){r.e.nc=next.children.length;r.e.keepSet=new Set();for(const k of r.e.st.keep)k.traverse(x=>r.e.keepSet.add(x));next.__fscJob=1;FSC.job=r}else{/* (nothing to merge never changes; one that is blocked is tried again in ten minutes) */FSC.cool.set(next,now+(r==='blocked'?600000:1800000));FSC.stats.why[r||'nothing']=(FSC.stats.why[r||'nothing']|0)+1}}}
/* the game's own distance culling turns cells on and off: it sees each cell as if it were shown, and its decision is kept.
   (Put in place on the first frame: the r500 code that defines xpCull comes later in the page than this module.) */
function fscWrapCull(){if(xpCull.__fsc)return;const c0=xpCull;const w=function(q,force){const H=[];if(FSC.ent.size)for(const e of FSC.ent.values())if(e.on&&e.mode==='hide'){e.c.visible=e.xv;H.push(e)}
 try{return c0.apply(this,arguments)}finally{for(const e of H){e.xv=e.c.visible;if(e.on)e.c.visible=false}}};w.__fsc=1;xpCull=w}
{const ru=busRoamUpd;busRoamUpd=function(q,dt){const r=ru.apply(this,arguments);try{if(FSC.on&&q&&q.chunks&&!q.ld&&q.dp&&q.dp.merged&&typeof DP!='undefined'&&DP._geoOK&&typeof flvStep=='function')fscTick(q);else if(FSC.ent.size){for(const e of[...FSC.ent.values()])fscForget(e,'off');FSC.job=null}}
 catch(e){conLog('error','far scenery: '+e.message);FSC.on=false;try{for(const x of[...FSC.ent.values()])fscForget(x,'error');FSC.job=null}catch(y){}}return r}}
/* other cameras (the squad monitors) see the real cells near them */
{const r0=R.render;R.render=function(sc,cam){if(sc!==S||cam===C||!FSC.ent.size||(typeof WARM!='undefined'&&cam===WARM.cam))return r0.apply(this,arguments);
 const back=[];try{cam.updateMatrixWorld();const p=cam.matrixWorld.elements,q=FSC.q;for(const e of FSC.ent.values()){if(!e.on)continue;const u=e.c.userData;if(Math.hypot(u.cx-p[12],u.cz-(p[14]-q.OZ))-u.ext<FSC.D1){fscBack(q,e);back.push(e)}}}catch(x){}
 try{return r0.apply(this,arguments)}finally{for(const e of back)fscShow(FSC.q,e)}}}
if(typeof LAGSYS!='undefined'){LAGSYS.push(['fscTick','Far scenery (simple shapes)']);{const f0=fscTick;fscTick=function(){if(!LAG.open)return f0.apply(this,arguments);const t=performance.now();try{return f0.apply(this,arguments)}finally{const d=performance.now()-t;LAG.sys.fscTick=(LAG.sys.fscTick||0)+d;LAG.cur.fscTick=(LAG.cur.fscTick||0)+d}}}}
/* something added to or taken out of a cell with shapes (anywhere inside it): back to the real cell, the shapes are made again */
{const P0=THREE.Object3D.prototype,a0=P0.add,r0=P0.remove;const mark=o=>{if(!FSC.ent.size&&!FSC.job)return;for(let p=o;p;p=p.parent)if(p.userData&&p.userData.chunk){const e=FSC.ent.get(p);if(e)e.dirty=1;else if(FSC.job&&FSC.job.e.c===p)FSC.job.e.dirty=1;return}};
 P0.add=function(){mark(this);return a0.apply(this,arguments)};P0.remove=function(){mark(this);return r0.apply(this,arguments)}}
