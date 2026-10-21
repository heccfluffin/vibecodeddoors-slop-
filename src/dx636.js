/* =====================================================================================================
   r651: DESERT PERFORMANCE: PARKED VEHICLES ARE DRAWN AS A FEW BATCHES.
   A vehicle's still parts were already batched (r500/r603), and since r635 each moving part (wheel, turret, barrel,
   steering wheel...) is batched on its own so it can still turn. That left a parked tank at about 106 separate draws:
   every road wheel is its own little batch plus a tyre with three materials (side and two caps), which the batcher never
   joined at all. The Fort's motor pool alone was over 1,000 draws a frame.
   Now a vehicle that has stood still for five seconds with nobody in it, near you, is drawn as one set of batches for the
   whole vehicle (wheels, turret, landing gear and the tyres' caps included). Its normal pieces and batches stay exactly
   where they are, only hidden, the same way the batcher hides what it batched. The moment anything happens to it
   (someone gets in, it moves, it is damaged or wrecked, a part turns or spins, a piece is shown, hidden, added, removed
   or changes colour) the batches are thrown away in the same frame and the vehicle is drawn as before.
   Things that cannot be batched (see-through glass, glows, sprites, instanced pieces) are left as they are.
   ?nopkv in the address turns it off to compare.
   ===================================================================================================== */
const PKV={on:!/[?&]nopkv/.test(location.search),q:null,list:new Map(),still:new WeakMap(),lively:new WeakMap(),mats:new Map(),R:350,FAR:450,STILL:5,COOL:30,BUDGET:.15,STEPMS:2,
 ri:0,ra:0,hook:0,job:null,F:0,mref:new Map(),stats:{parked:0,built:0,undone:0,why:{},draws0:0,draws1:0,ms:0,maxMs:0}};
const _pkM=new THREE.Matrix4(),_pkN=new THREE.Matrix3(),_pkV=new THREE.Vector3(),_pkT=new THREE.Matrix4();
/* is the vehicle being used (or about to be)? */
function pkvBusy(q,v){return !v.m||!v.m.parent||v.gone||v.wreck||v.crush||v.air||Math.abs(v.v||0)>.01||(v.occ&&v.occ.some(x=>x))||(q.seat&&q.seat.v===v)||(q.inBus&&q.inBus.v===v)}
function pkvPose(v){return[v.x,v.z,v.h,v.y,v.dmg]}
function pkvSame(a,b){for(let i=0;i<a.length;i++)if(a[i]!==b[i])return false;return true}
/* the merged shape of a list of pieces (or of one material's part of a multi-material piece), relative to the vehicle */
function pkvGeo(inv,mems,hasMap){let nv=0,ni=0;for(const m of mems){nv+=m.vc;ni+=m.ic}
 const pos=new Float32Array(nv*3),nor=new Float32Array(nv*3),col=new Float32Array(nv*3),uv=hasMap?new Float32Array(nv*2):null,idx=nv>65535?new Uint32Array(ni):new Uint16Array(ni);let vo=0,io=0;
 for(const m of mems){const o=m.o,g=o.geometry,pa=g.attributes.position.array,na=g.attributes.normal?g.attributes.normal.array:null,ua=g.attributes.uv?g.attributes.uv.array:null;
  _pkM.multiplyMatrices(inv,o.matrixWorld);_pkN.getNormalMatrix(_pkM);const c=m.mat.color,cr=c.r,cg=c.g,cb=c.b;let ue=null;if(uv&&m.mat.map){const t=m.mat.map;if(t.matrixAutoUpdate)t.updateMatrix();ue=t.matrix.elements}
  /* indexed shapes bring all their corners (a group only uses some of them), unindexed ones only the group's range */
  const v0=g.index?0:m.s,vn=m.vc;
  for(let i=0;i<vn;i++){const s=v0+i,k=(vo+i)*3;_pkV.fromArray(pa,s*3).applyMatrix4(_pkM);pos[k]=_pkV.x;pos[k+1]=_pkV.y;pos[k+2]=_pkV.z;if(na)_pkV.fromArray(na,s*3).applyMatrix3(_pkN).normalize();else _pkV.set(0,1,0);nor[k]=_pkV.x;nor[k+1]=_pkV.y;nor[k+2]=_pkV.z;col[k]=cr;col[k+1]=cg;col[k+2]=cb;
   if(uv){let u=ua?ua[s*2]:0,w=ua?ua[s*2+1]:0;if(ue){const u2=ue[0]*u+ue[3]*w+ue[6],w2=ue[1]*u+ue[4]*w+ue[7];u=u2;w=w2}uv[(vo+i)*2]=u;uv[(vo+i)*2+1]=w}}
  if(g.index){const ia=g.index.array;for(let i=0;i<m.ic;i++)idx[io+i]=ia[m.s+i]+vo}else for(let i=0;i<m.ic;i++)idx[io+i]=vo+i;io+=m.ic;vo+=vn}
 const out=new THREE.BufferGeometry();out.setAttribute('position',new THREE.BufferAttribute(pos,3));out.setAttribute('normal',new THREE.BufferAttribute(nor,3));out.setAttribute('color',new THREE.BufferAttribute(col,3));if(uv)out.setAttribute('uv',new THREE.BufferAttribute(uv,2));out.setIndex(new THREE.BufferAttribute(idx,1));out.computeBoundingSphere();return out}
/* one material per kind, shared by every parked vehicle (the colours are in the shape) */
function pkvMat(key,src,lam){let m=PKV.mats.get(key);if(!m){m=DP._mergedMat(src,lam&&src.type!=='MeshBasicMaterial');PKV.mats.set(key,m)}return m}
/* the batcher's key plus the exact finish (its key rounds roughness and metalness to one decimal) */
function pkvKey(k0,lk){return k0+'#'+lk.type+'|'+lk.roughness+'|'+lk.metalness+'|'+lk.emissiveIntensity+'|'+(lk.emissive?lk.emissive.getHex():'')+'|'+lk.opacity+'|'+lk.shininess+'|'+(lk.specular?lk.specular.getHex():'')+'|'+lk.flatShading}
/* has the batcher (and r635's part batching) finished with this vehicle? */
function pkvReady(v){const o=v.m,ud=o.userData;if(!(ud.dpRecs||ud.dpLate))return false;if(typeof VB!='undefined'&&VB.on){for(const[x,k]of vbParts(o))if(!VB.skipKeys.has(k)&&!x.userData.vbTried&&!x.userData.dpRecs)return false}return true}
/* parking takes three steps so no frame takes long: look at the vehicle and remember how everything is (pkvCollect), build the
   batches about 2 ms a frame (pkvStep), then, only if nothing changed meanwhile, show them and hide the pieces (pkvFinish) */
function pkvCollect(q,v){const root=v.m,lam=DP.cfg().lam,kc=new Map(),mkey=mt=>{let k=kc.get(mt);if(k===undefined){k=mt&&DP._matKey(mt,lam);kc.set(mt,k)}return k};/* (pieces share materials: each key is worked out once here) */root.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(root.matrixWorld).invert();
 const groups=new Map(),nodes=[],batches0=[],pieces=[];let drawn=0,taken=0;const draws=o=>Array.isArray(o.material)?Math.max(1,(o.geometry.groups||[]).length):1;const LV=PKV.lively.get(root),lv=LV?LV.set:null;
 let blocked=false,owner=null;
 /* which batch hides each batched piece (the vehicle's own, and each moving part's) */
 const ownerOf=m=>{if(!owner){owner=new Map();const add=x=>{for(const r of(x.userData.dpRecs||[]))if(!r.dead&&r.mesh)for(const mm of r.mems)if(!mm.out)owner.set(mm.o,r.mesh)};add(root);for(const[x]of vbParts(root))add(x)}return owner.get(m)};
 const inside=(o,top)=>{for(let p=o;p;p=p.parent)if(p===top)return true;return false};
 /* a part of the vehicle that is left out: everything in it stays as it is; a piece in it that one of the batches outside it
    hides would vanish with that batch, so then the vehicle is not parked */
 const count=(o,top)=>{if(!o.visible)return;if(o.isMesh&&o.layers.mask===4){const b=ownerOf(o);if(!b||!inside(b,top))blocked=true}if((o.isMesh||o.isSprite)&&(o.layers.mask&1))drawn+=draws(o);for(const c of o.children)count(c,top)};
 const piece=o=>{if(!o.isMesh||o.isSprite||o.isPoints||o.isLine||o.isInstancedMesh||o.isSkinnedMesh||o.userData.dpMerged)return null;const mk=o.layers.mask;if(!(mk&1)&&mk!==4)return null;
  if(o.onBeforeRender!==THREE.Object3D.prototype.onBeforeRender||!DP._geoOK(o.geometry))return null;if(lv)for(const mt of(Array.isArray(o.material)?o.material:[o.material]))if(lv.has(mt)){if(mk===4)blocked=true;return null}_pkM.multiplyMatrices(inv,o.matrixWorld);if(_pkM.determinant()<=0)return null;
  const g=o.geometry,mats=Array.isArray(o.material)?o.material:null,out=[];
  /* it must look exactly as it is drawn now: a piece already in one of the batcher's batches has that batch's finish
     (the batcher rounds roughness and metalness), anything else its own; only exactly equal finishes share a batch */
  const look=mk===4?(ownerOf(o)||{}).material:null;
  if(mats){/* a piece with several materials: each material's part on its own, all or nothing */if(!g.groups||!g.groups.length)return null;
   for(const gr of g.groups){const mt=mats[gr.materialIndex];const key=mt&&mkey(mt)&&pkvKey(mkey(mt),mt);if(!key)return null;const n=g.index?g.index.count:g.attributes.position.count,s=gr.start,c=Math.min(gr.count,n-s);if(c<=0)continue;out.push({o,mat:mt,look:mt,key,s,ic:c,vc:g.index?g.attributes.position.count:c})}}
  else{const k0=mkey(o.material);if(!k0)return null;const lk=look&&!Array.isArray(look)?look:o.material;out.push({o,mat:o.material,look:lk,key:pkvKey(k0,lk),s:0,ic:g.index?g.index.count:g.attributes.position.count,vc:g.attributes.position.count})}
  return out};
  const walk=o=>{if(lv&&lv.has(o)){count(o,o);return}/* (left out: drawn as it is, not checked) */nodes.push(o);if(o!==root&&!o.visible)return;const shown=(o.isMesh||o.isSprite)&&(o.layers.mask&1);if(shown)drawn+=draws(o);
  if(o.userData.dpMerged){if(shown){batches0.push(o);taken++}return}
  const p=o.isMesh?piece(o):null;if(p){pieces.push(o);if(shown)taken+=draws(o);for(const m of p){let L=groups.get(m.key);if(!L)groups.set(m.key,L=[]);L.push(m)}}
  for(const c of o.children)walk(c)};
 walk(root);if(!groups.size)return null;
 /* something left out is hidden inside one of the batcher's own batches: it would vanish with that batch, so this vehicle is not parked */if(blocked)return'not worth it';
 /* only worth it if it means clearly fewer draws (a vehicle with many different pictures may not gain anything) */
 let nb=0;for(const L of groups.values()){let nv=0;nb++;for(const m of L){if(nv+m.vc>60000){nb++;nv=0}nv+=m.vc}}
 if(drawn-taken+nb>drawn-5)return'not worth it';
 const e={v,root,batches:[],hid:[],nodes,vis:new Uint8Array(nodes.length),masks:new Int32Array(nodes.length),parts:[],mats:[],pieces:[],ri:0,pose:pkvPose(v),dirty:0,inv,draws:[drawn,drawn-taken+nb]};
 for(let i=0;i<nodes.length;i++){const o=nodes[i];e.vis[i]=o.visible?1:0;e.masks[i]=o.layers.mask}
 /* every frame only the groups and batches are looked at; the batched pieces go round with the deep check */const ps=new Set(pieces);e.anc=[];for(let i=1;i<nodes.length;i++)if(!ps.has(nodes[i]))e.anc.push(i);
 for(const[x]of vbParts(root)){if(lv&&pkvLeft(x,root,lv))continue;const p=x.position,r=x.quaternion,s=x.scale;e.parts.push([x,[p.x,p.y,p.z,r._x,r._y,r._z,r._w,s.x,s.y,s.z]])}
 const ms=new Set();for(const o of pieces){for(const mt of(Array.isArray(o.material)?o.material:[o.material]))ms.add(mt);_pkM.multiplyMatrices(inv,o.matrixWorld);e.pieces.push({o,mat:o.material,geo:o.geometry,pv:o.geometry.attributes.position.version,m:Float32Array.from(_pkM.elements)})}
 for(const mt of ms)e.mats.push([mt,pkvMatSig(mt)]);
 root.__pkv=e;/* (from now on pieces added or removed mark it, see the hook below) */
 return{e,lam,todo:[...groups],ki:0,built:[],hide:pieces.concat(batches0),ms:0}}
function pkvStep(job,budget){const t0=performance.now(),e=job.e;
 while(job.ki<job.todo.length&&performance.now()-t0<budget){const[key,L]=job.todo[job.ki++];let b=[],nv=0;
  const flush=()=>{if(!b.length)return;const src=b[0].mat,mesh=new THREE.Mesh(pkvGeo(e.inv,b,!!src.map),pkvMat(key,b[0].look,job.lam));mesh.userData={dpMerged:1,noSeam:1,pkv:1};if(src.transparent)mesh.renderOrder=b[0].o.renderOrder;job.built.push(mesh);b=[];nv=0};
  for(const m of L){if(nv+m.vc>60000)flush();b.push(m);nv+=m.vc}flush()}
 job.ms+=performance.now()-t0;return job.ki>=job.todo.length}
function pkvDrop(job){for(const m of job.built)try{m.geometry.dispose()}catch(x){}delete job.e.root.__pkv}
function pkvFinish(q,job){const e=job.e,root=e.root,t0=performance.now();
 /* anything changed while the batches were being built? then they are thrown away */
 let w=pkvChanged(q,e,true);if(!w){const n=e.ri;for(let k=0;k<e.pieces.length&&!w;k+=64)w=pkvDeep(e,64);e.ri=n}
 if(w){pkvDrop(job);const D=PKV.stats.dropped||(PKV.stats.dropped={});D[w]=(D[w]|0)+1;
  /* it changed while being built: it waits its turn again, so the others get theirs */const s=PKV.still.get(root);if(s){const now=performance.now(),n=pkvLively(e);s.t0=now;s.cool=now+(n>=3?120000:10000)}return null}
 PKV.hook=1;try{for(const m of job.built){root.add(m);e.batches.push(m)}}finally{PKV.hook=0}
 /* hide what the batches now draw: the pieces, and the old batches */
 for(const o of job.hide)if(o.layers.mask&1){e.hid.push([o,o.layers.mask]);o.layers.mask=4}
 for(let i=0;i<e.nodes.length;i++)e.masks[i]=e.nodes[i].layers.mask;
 e.mrefs=[];pkvMref(e,true);e.f0=PKV.F;PKV.list.set(root,e);const d=job.ms+performance.now()-t0;e.ms=+d.toFixed(1);PKV.stats.built++;PKV.stats.ms+=d;PKV.stats.draws0+=e.draws[0];PKV.stats.draws1+=e.draws[1];return e}
function pkvLeft(x,root,lv){for(let p=x;p&&p!==root;p=p.parent)if(lv.has(p))return true;return false}
function pkvMatSame(m,s){const t=m.map;return s[0]===m.visible&&s[1]===(m.color?m.color.getHex():0)&&s[2]===(m.emissive?m.emissive.getHex():0)&&s[3]===m.emissiveIntensity&&s[4]===m.opacity&&s[5]===t&&(!t||(s[6]===t.version&&s[7]===t.offset.x&&s[8]===t.offset.y&&s[9]===t.repeat.x&&s[10]===t.repeat.y&&s[11]===t.rotation))}
function pkvMatSig(m){const t=m.map;return[m.visible,m.color?m.color.getHex():0,m.emissive?m.emissive.getHex():0,m.emissiveIntensity,m.opacity,t,t?t.version:0,t?t.offset.x:0,t?t.offset.y:0,t?t.repeat.x:0,t?t.repeat.y:0,t?t.rotation:0]}
/* anything different from when it was parked? Every frame: in use, moved, shown or hidden, the moving parts, the colours
   (each material once a frame for all parked vehicles, see pkvMatsTick); the pieces themselves go round a few at a time (pkvDeep).
   (full=true: everything against the snapshot, before a new set of batches is shown) */
function pkvChanged(q,e,full){const v=e.v;if(e.dirty)return'added or removed';if(pkvBusy(q,v))return'in use';if(!pkvSame(pkvPose(v),e.pose))return'moved or damaged';
 /* (the vehicle itself shown or hidden, by the distance culling for example, changes nothing: the batches hide with it) */
 const N=e.nodes;if(full){for(let i=1;i<N.length;i++){const o=N[i];if((o.visible?1:0)!==e.vis[i]||o.layers.mask!==e.masks[i]){e.culprit=o;return'shown or hidden'}if(o.parent===null)return'removed'}}
 else for(const i of e.anc){const o=N[i];if((o.visible?1:0)!==e.vis[i]||o.layers.mask!==e.masks[i]){e.culprit=o;return'shown or hidden'}if(o.parent===null)return'removed'}
 for(const[x,s]of e.parts){const p=x.position,r=x.quaternion,c=x.scale;if(p.x!==s[0]||p.y!==s[1]||p.z!==s[2]||r._x!==s[3]||r._y!==s[4]||r._z!==s[5]||r._w!==s[6]||c.x!==s[7]||c.y!==s[8]||c.z!==s[9]){e.culprit=x;return'a part moved'}}
 if(full){for(const[mt,s]of e.mats)if(!pkvMatSame(mt,s)){e.culprit=mt;return'colour changed'}
  for(const p of e.pieces)if(p.o.material!==p.mat||p.o.geometry!==p.geo||p.geo.attributes.position.version!==p.pv){e.culprit=p.o;return'piece changed'}return null}
 for(const r of e.mrefs)if(r.chg>e.f0){e.culprit=r.mt;return'colour changed'}return null}
/* every material of the parked vehicles, once a frame: when did it last change? */
function pkvMatsTick(){PKV.F++;for(const r of PKV.mref.values())if(!pkvMatSame(r.mt,r.sig)){r.sig=pkvMatSig(r.mt);r.chg=PKV.F}}
function pkvMref(e,add){for(const[mt]of e.mats){let r=PKV.mref.get(mt);if(add){if(!r)PKV.mref.set(mt,r={mt,sig:pkvMatSig(mt),chg:0,n:0});r.n++;e.mrefs.push(r)}else if(r&&--r.n<=0)PKV.mref.delete(mt)}}
/* the pieces' places relative to the vehicle, a few each frame (a part the vehicle code does not name could still move) */
function pkvDeep(e,n){const P2=e.pieces;if(!P2.length)return null;/* (vehicles' matrices are brought up to date by every frame's render, hidden pieces too) */const inv=_pkM.copy(e.root.matrixWorld).invert(),t=_pkT;
 for(let k=0;k<n;k++){e.ri=(e.ri+1)%P2.length;const p=P2[e.ri];if(e.f0!==undefined&&(!p.o.visible||p.o.layers.mask!==4||!p.o.parent)){e.culprit=p.o;return'shown or hidden'}if(p.o.material!==p.mat||p.o.geometry!==p.geo||p.geo.attributes.position.version!==p.pv){e.culprit=p.o;return'piece changed'}t.multiplyMatrices(inv,p.o.matrixWorld);const a=t.elements,b=p.m;for(let i=0;i<16;i++)if(Math.abs(a[i]-b[i])>2.5e-3){e.culprit=p.o;return'a piece moved'}}return null}
/* a piece, part or material that changed while nobody used the vehicle (a blinking beacon, a turning radar...) is left out
   next time: drawn as it is and not checked, and the rest is parked around it. Three times and the vehicle is left alone for two minutes */
function pkvLively(e){const c=e.culprit;/* (the vehicle itself shown or hidden, by the distance culling for example, is not a piece to leave out) */if(!c||c===e.root||(c.userData&&c.userData.dpMerged)){e.culprit=null;return 0}e.culprit=null;let L=PKV.lively.get(e.root);if(!L)PKV.lively.set(e.root,L={set:new Set(),n:0});L.set.add(c);L.n++;return L.n}
function pkvUndo(e,why){PKV.hook=1;try{for(const b of e.batches){if(b.parent)b.parent.remove(b);try{b.geometry.dispose()}catch(x){}}}finally{PKV.hook=0}
 /* put back only what is still hidden the way it was hidden here (something else may have changed it since) */
 for(const[o,m]of e.hid)if(o.layers.mask===4)o.layers.mask=m;
 delete e.root.__pkv;if(PKV.list.get(e.root)===e&&e.mrefs)pkvMref(e,false);PKV.list.delete(e.root);PKV.stats.undone++;PKV.stats.why[why]=(PKV.stats.why[why]|0)+1;
 /* a vehicle that changed while nobody used it (a blinking light...) waits longer before it is parked again */
 const s=PKV.still.get(e.root);if(s){const now=performance.now(),n=pkvLively(e);s.t0=now;s.cool=n?(n>=3?now+120000:0):(why==='in use'||why==='moved or damaged'||why==='far away'?0:now+PKV.COOL*1000)}}
function pkvTick(q,dt){pkvMatsTick();if(PKV.q!==q){for(const e of[...PKV.list.values()])pkvUndo(e,'left');if(PKV.job){pkvDrop(PKV.job);PKV.job=null}PKV.q=q;PKV.still=new WeakMap()}
 const t0=performance.now();
 for(const e of[...PKV.list.values()]){const w=pkvChanged(q,e);if(w){pkvUndo(e,w);continue}const m=e.root.matrixWorld.elements;if(Math.hypot(m[12]-P.x,m[14]-P.z)>PKV.FAR)pkvUndo(e,'far away')}
 /* the deeper check, round and round, within a small budget */
 const L=[...PKV.list.values()];if(L.length){let k=0;while(k++<L.length&&performance.now()-t0<PKV.BUDGET){PKV.ra=(PKV.ra+1)%L.length;const e=L[PKV.ra];const w=pkvDeep(e,24);if(w)pkvUndo(e,w)}}
 /* a vehicle being parked: a little more of its batches each frame */
 if(PKV.job){const J=PKV.job;let done=false;try{done=pkvStep(J,PKV.STEPMS)}catch(x){pkvDrop(J);PKV.job=null;throw x}
  if(done){PKV.job=null;const st=performance.now();if(pkvFinish(q,J))PKV.stats.parked++;const d=performance.now()-st;if(J.ms+d>PKV.stats.maxMs)PKV.stats.maxMs=+(J.ms+d).toFixed(2);PKV.stats.maxFrame=Math.max(PKV.stats.maxFrame|0,+d.toFixed(2))}}
 /* vehicles that have stood still long enough (real time, five seconds) are picked one at a time */
 const now=performance.now();let did=!!PKV.job;for(const v of q.vehs||[]){const o=v&&v.m;if(!o||o.__pkv)continue;let s=PKV.still.get(o);if(!s)PKV.still.set(o,s={t0:now,pose:pkvPose(v),cool:0});
  if(pkvBusy(q,v)||!pkvSame(pkvPose(v),s.pose)){s.t0=now;s.pose=pkvPose(v);continue}
  if(did||now-s.t0<PKV.STILL*1000||now<s.cool||!o.visible)continue;const m=o.matrixWorld.elements;if(Math.hypot(m[12]-P.x,m[14]-P.z)>PKV.R||!pkvReady(v))continue;
  did=true;const c0=performance.now();try{const J=pkvCollect(q,v);if(J&&typeof J=='object')PKV.job=J;else{/* nothing to gain: not looked at again for two minutes */s.cool=now+120000;PKV.stats.skipped=(PKV.stats.skipped|0)+1}}catch(x){s.cool=now+120000;conLog('error','parked vehicle batching: '+x.message)}
  const d=performance.now()-c0;if(d>(PKV.stats.maxCollect|0))PKV.stats.maxCollect=+d.toFixed(2);const CK=PKV.stats.collect||(PKV.stats.collect={});CK[v.k]=Math.max(CK[v.k]|0,+d.toFixed(1))}}
/* pieces added to or taken out of a parked vehicle (a new batch, a swapped model part...) undo it */
{const P0=THREE.Object3D.prototype,a0=P0.add,r0=P0.remove;const mark=o=>{if(PKV.hook||(!PKV.list.size&&!PKV.job))return;for(let p=o;p;p=p.parent)if(p.__pkv){p.__pkv.dirty=1;return}};
 P0.add=function(){mark(this);return a0.apply(this,arguments)};P0.remove=function(){mark(this);return r0.apply(this,arguments)}}
{const ru=busRoamUpd;busRoamUpd=function(q,dt){const r=ru.apply(this,arguments);try{if(PKV.on&&q&&q.vehs&&!q.ld&&q.dp&&q.dp.merged&&typeof DP!='undefined'&&DP._mergedMat){const t=performance.now();pkvTick(q,dt);const d=performance.now()-t;const T=PKV.stats;T.tickN=(T.tickN|0)+1;T.tickMs=(T.tickMs||0)+d;if(d>(T.tickMax||0))T.tickMax=+d.toFixed(2)}else{if(PKV.job){pkvDrop(PKV.job);PKV.job=null}if(PKV.list.size)for(const e of[...PKV.list.values()])pkvUndo(e,'off')}}catch(e){conLog('error','parked vehicle batching: '+e.message);PKV.on=false;if(PKV.job){try{pkvDrop(PKV.job)}catch(y){}PKV.job=null}for(const x of[...PKV.list.values()])try{pkvUndo(x,'error')}catch(y){}}return r}}
/* the lag window (F9) times these checks as their own part, so a report shows what they cost on your computer */
if(typeof LAGSYS!='undefined'){LAGSYS.push(['pkvTick','Parked vehicles (checks and parking)']);{const f0=pkvTick;pkvTick=function(){if(!LAG.open)return f0.apply(this,arguments);const t=performance.now();try{return f0.apply(this,arguments)}finally{const d=performance.now()-t;LAG.sys.pkvTick=(LAG.sys.pkvTick||0)+d;LAG.cur.pkvTick=(LAG.cur.pkvTick||0)+d}}}}
