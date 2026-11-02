/* =====================================================================================================
   r664: TWO TEST SWITCHES FOR THE "ZONES" PLAN (lag window F9 and the Benchmark). No change to the game itself.
   The architecture review found that the game walks through about 30,000 desert objects every frame, but about
   25,000 of them are pieces already drawn as part of a batch, and whole places far away or behind you are still
   walked through. Before building anything, these switches measure on your own PC what fixing that would give:
   - "batched pieces left out of the walk": for that frame the renderer and the position update are handed each
     group's children without its batched pieces (the batch itself is still drawn, so nothing looks different);
   - "far and off-screen areas left out": places whose box is behind the camera or beyond the fog (where the game's
     own culling already stops drawing) are left out of that frame. Places with lights, moving parts, vehicles or
     always-drawn pieces always stay in;
   - and both together.
   Nothing is moved, hidden or destroyed: only the list of children the renderer looks at is swapped for a shorter
   one while the frame is drawn, and put back straight after. The time the switches themselves take is left out of
   the "processor" number and reported on its own line.
   ===================================================================================================== */
const LAGSK={keys:{skb:'bat',skz:'zone',skbz:'both'},bat:null,zone:null,q:null,bt:-1e9,zt:-1e9,st:{},cur:null};
LAGHIDE.push(['skb','Batched pieces from the walk (test: they are still drawn)'],['skz','Far and off-screen areas from the walk (test: nothing visible changes)'],['skbz','Both of those from the walk (test)']);
{const ls=lagSet;lagSet=function(k){if(LAGSK.keys[k])return[];return ls.apply(this,arguments)}}
const lagSkLeaf=c=>c.isMesh&&!c.isSprite&&c.layers.mask===4&&!c.children.length;
/* every shown group that has batched pieces among its children, with the shorter list */
function lagSkBat(q){const L=[];const w=o=>{if(!o.visible)return;const ch=o.children;if(!ch.length)return;let n=0;for(const c of ch)if(lagSkLeaf(c))n++;
 if(n)L.push({p:o,orig:ch,len:ch.length,keep:ch.filter(c=>!lagSkLeaf(c)),n});for(const c of ch)if(c.children.length)w(c)};w(q.g);return L}
/* the places that can be left out: groups of at least 8 objects, at most 150 m across, with nothing in them that must stay */
function lagSkZone(q){const veh=new Set();for(const v of q.vehs||[])if(v&&v.m)veh.add(v.m);
 const skip=new Set([q.sky,q.sun,q.zsky,q.zstar,q.sand,q.bg,BUS._sky,BUS._sun,typeof SKN!='undefined'?SKN.g:null].filter(Boolean));
 const info=new Map(),v=new THREE.Vector3(),bs=new THREE.Sphere();
 const agg=o=>{const a={b:new THREE.Box3(),must:false,n:1};const u=o.userData||{};
  if(veh.has(o)||skip.has(o)||o.isLight||o.isSkinnedMesh||o.__mwKeep||u.dpKeep||u.dpDyn||u.mv||u.flv)a.must=true;
  if((o.isMesh||o.isSprite||o.isPoints||o.isLine)&&(o.layers.mask&1)){if(!o.frustumCulled||o.isInstancedMesh)a.must=true;
   else if(o.isSprite){o.getWorldPosition(v);const r=Math.max(o.scale.x,o.scale.y)*.75;a.b.expandByPoint(v.clone().addScalar(-r));a.b.expandByPoint(v.addScalar(r))}
   else{const g=o.geometry;if(g){if(!g.boundingSphere)g.computeBoundingSphere();bs.copy(g.boundingSphere).applyMatrix4(o.matrixWorld);if(isFinite(bs.radius)){a.b.expandByPoint(v.copy(bs.center).addScalar(-bs.radius));a.b.expandByPoint(v.copy(bs.center).addScalar(bs.radius))}else a.must=true}}}
  for(const c of o.children){const k=agg(c);if(k.must)a.must=true;a.b.union(k.b);a.n+=k.n}if(o.children.length)info.set(o,a);return a};
 for(const c of q.g.children)agg(c);
 const L=[];const pick=o=>{const a=info.get(o);if(!a)return;const sz=a.b.isEmpty()?0:Math.max(a.b.max.x-a.b.min.x,a.b.max.z-a.b.min.z);
  if(!a.must&&sz<=150&&a.n>=8){L.push({o,p:o.parent,b:a.b,n:a.n});return}if(!veh.has(o)&&!skip.has(o))for(const c of o.children)pick(c)};
 for(const c of q.g.children)pick(c);return L}
const _lzF=new THREE.Frustum(),_lzM=new THREE.Matrix4(),_lzP=[];let _lzFr=0;
{const r0=R.render;R.render=function(sc,cam){const q=BUS&&BUS.ride;const k=LAG.open&&sc===S&&cam===C&&q&&q.g&&q.roam?['skb','skz','skbz'].find(x=>LAG.hide[x]):null;
 if(!k)return r0.apply(this,arguments);
 const t0=performance.now();let bd=0;const mode=LAGSK.keys[k],B=mode!=='zone',Z=mode!=='bat',st=LAGSK.st[k]||(LAGSK.st[k]={fr:0,up:0,build:0,nb:0,skipped:0,areas:0,objs:0});
 if(LAGSK.q!==q){LAGSK.q=q;LAGSK.bat=LAGSK.zone=null}
 /* the lists are made once at the start of a Benchmark step (while it settles), and every 30 s when switched on by hand */
 const old=t=>!LAG.auto&&t0-t>30000;
 if(B&&(!LAGSK.bat||old(LAGSK.bt))){LAGSK.bat=lagSkBat(q);LAGSK.bt=t0;bd+=performance.now()-t0;st.nb++}
 if(Z&&(!LAGSK.zone||old(LAGSK.zt))){const b0=performance.now();LAGSK.zone=lagSkZone(q);LAGSK.zt=b0;bd+=performance.now()-b0;st.nb++}
 const fr=++_lzFr,sv=_lzP;sv.length=0;let skipped=0,areas=0,objs=0;
 if(B)for(const e of LAGSK.bat){const p=e.p;if(p.children!==e.orig||e.orig.length!==e.len){e.orig=p.children;e.len=e.orig.length;e.keep=e.orig.filter(c=>!lagSkLeaf(c));e.n=e.len-e.keep.length}
  if(e.n&&p.__lzO===undefined){p.__lzO=e.orig;p.children=e.keep;p.__lzN=e.keep.length;sv.push(p);skipped+=e.n}}
 if(Z){C.updateMatrixWorld();_lzM.multiplyMatrices(C.projectionMatrix,C.matrixWorldInverse);_lzF.setFromProjectionMatrix(_lzM);
  let far=1e9;try{if(S.fog&&S.fog.far)far=S.fog.far+30}catch(e){}const cx=C.position.x,cy=C.position.y,cz=C.position.z,far2=far*far,ps=[];
  for(const z of LAGSK.zone){const o=z.o;if(o.parent!==z.p||!o.visible)continue;const b=z.b;let hide=b.isEmpty();
   if(!hide){const dx=Math.max(b.min.x-cx,0,cx-b.max.x),dy=Math.max(b.min.y-cy,0,cy-b.max.y),dz=Math.max(b.min.z-cz,0,cz-b.max.z);hide=dx*dx+dy*dy+dz*dz>far2||!_lzF.intersectsBox(b)}
   if(hide){o.__lzX=fr;const p=z.p;if(p.__lzH!==fr){p.__lzH=fr;p.__lzK=0;p.__lzC=0;ps.push(p)}p.__lzK+=o.id;p.__lzC++;areas++;objs+=z.n;if(typeof MWX!='undefined')o.__mwSk=MWX.fr+1}}
  /* (the shorter list is kept while the same places are left out and the real list has not changed) */
  for(const p of ps){const src=p.__lzO!==undefined?p.children:p.children,real=p.__lzO!==undefined?p.__lzO:p.children,c=p.__lzM;let a;
   if(c&&c.k===p.__lzK&&c.n===p.__lzC&&c.src===src&&c.len===src.length&&c.rl===real.length)a=c.a;else{a=src.filter(x=>x.__lzX!==fr);p.__lzM={k:p.__lzK,n:p.__lzC,src,len:src.length,rl:real.length,a,al:a.length}}
   if(a.length!==p.__lzM.al){a=src.filter(x=>x.__lzX!==fr);p.__lzM.a=a;p.__lzM.al=a.length}
   if(p.__lzO===undefined){p.__lzO=p.children;sv.push(p)}p.children=a;p.__lzN=a.length}}
 const t1=performance.now();st.build+=bd;st.up+=t1-t0-bd;st.fr++;st.skipped+=skipped;st.areas+=areas;st.objs+=objs;
 try{return r0.apply(this,arguments)}
 finally{const t2=performance.now();
  /* put the real lists back; anything added to a shorter list while drawing goes into the real one too */
  for(const p of sv){const a=p.children,orig=p.__lzO;if(a!==orig&&a.length!==p.__lzN){for(const c of a)if(!orig.includes(c))orig.push(c)}p.children=orig;p.__lzO=undefined}sv.length=0;
  const t3=performance.now();st.up+=t3-t2;LAG.cpu-=(t1-t0)+(t3-t2)}}}
/* each Benchmark view: what the switches left out, and what they cost */
{const lr=lagRun;lagRun=async function(){LAGSK.st={};LAGSK.bat=LAGSK.zone=null;const A=await lr.apply(this,arguments);if(A)A.sk=LAGSK.st;return A}}
{const ll=lagLimit;lagLimit=function(A){let s=ll.apply(this,arguments);try{const S2=A&&A.sk;if(S2){const F=lagF,nm={skb:'batched pieces',skz:'far and off-screen areas',skbz:'both'},L=[];
  for(const k of['skb','skz','skbz']){const x=S2[k];if(!x||!x.fr)continue;L.push(nm[k]+': left out '+(k!=='skz'?F(x.skipped/x.fr,0)+' batched pieces':'')+(k==='skbz'?' and ':'')+(k!=='skb'?F(x.areas/x.fr,0)+' places ('+F(x.objs/x.fr,0)+' objects)':'')+' a frame; switch upkeep '+F(x.up/x.fr,2)+' ms a frame, making the lists '+F(x.build/Math.max(1,x.nb),0)+' ms each time')}
  if(L.length)s+='\n   Zone-plan test switches (their own time is left out of "processor"): '+L.join(' · ')}}catch(e){}return s}}
