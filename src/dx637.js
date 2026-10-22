/* =====================================================================================================
   r651: DESERT PERFORMANCE: FAR VEHICLES ARE DRAWN AS ONE SIMPLE SHAPE (area level of detail, step 1).
   Looking east from the Fort you were drawing about 2,500 separate vehicle pieces, almost all of them from vehicles more
   than 250 m away (the motor pool's tanks and trucks), each tank in about a hundred pieces.
   Now every vehicle more than 160 m from the camera is drawn as one simple shape in at most three draws (plain colours,
   shiny metal, lights). It is made once from the vehicle itself: the same shape, each piece in its own colour (a
   picture becomes its average colour), with the tiniest bits (under about 12 cm) left out. The real vehicle is untouched
   and keeps doing everything it did (driving, physics, collisions, damage, the game's code all use it); only its pieces
   are hidden from the camera, the way the batcher already hides what it batched. Closer than 140 m the real vehicle is
   drawn again exactly as before (the 20 m between the two stops it switching back and forth).
   Wheels turning or steering cannot be seen from that far, so they are not followed. Anything else that changes on
   a far vehicle (a turret turning, a rotor, a blinking light, a piece shown, hidden, added or removed, a colour, damage)
   switches it back to the real vehicle at once; the part that keeps changing is then left out of the simple shape (drawn
   as it is), and the shape is made again a few seconds later. The squad camera monitors in the offices see the real
   vehicles near their own camera. ?noflv in the address turns it all off to compare.
   ===================================================================================================== */
const FLV={on:!/[?&]noflv/.test(location.search),q:null,ent:new Map(),job:null,D0:140,D1:160,PRE:130,BUDGET:2.5,CHECK:.2,MINR:.06,REB:3000,
 lively:new WeakMap(),cool:new WeakMap(),mats:null,lam:null,hook:0,rr:0,tex:new WeakMap(),stats:{built:0,shown:0,back:0,dropped:0,ms:0,maxStep:0,why:{}}};
const _flM=new THREE.Matrix4(),_flN=new THREE.Matrix3(),_flV=new THREE.Vector3(),_flS=new THREE.Sphere(),_flC=new THREE.Color();
/* the keys of a vehicle's moving parts that are not followed from far away (rolling and steering) */
const FLV_FREE=new Set(['wheels','sw']);
/* three shared materials for every far vehicle: plain, shiny metal, lights (unlit) */
function flvMats(){const lam=typeof DP!='undefined'&&DP.cfg?!!DP.cfg().lam:false;if(FLV.mats&&FLV.lam===lam)return FLV.mats;FLV.lam=lam;const D=THREE.FrontSide;/* (double-sided pieces bring their back faces as extra triangles) */
 FLV.mats=lam?[new THREE.MeshLambertMaterial({vertexColors:true,side:D}),new THREE.MeshLambertMaterial({vertexColors:true,side:D}),new THREE.MeshBasicMaterial({vertexColors:true,side:D})]
  :[new THREE.MeshStandardMaterial({vertexColors:true,roughness:.8,metalness:.1,side:D}),new THREE.MeshStandardMaterial({vertexColors:true,roughness:.45,metalness:.55,side:D}),new THREE.MeshBasicMaterial({vertexColors:true,side:D})];
 for(const m of FLV.mats)m.userData={flv:1};return FLV.mats}
/* the average colour of a picture, and how much of it is not see-through (worked out once per picture) */
function flvTexAvg(t){const img=t&&t.image;if(!img)return null;let c=FLV.tex.get(img);if(c!==undefined)return c;c=null;
 try{let r=0,g=0,b=0,n=0,all=0;if(img.data&&img.width){const d=img.data,st=Math.max(1,Math.floor(d.length/4/4096))*4;for(let i=0;i+2<d.length;i+=st){r+=d[i];g+=d[i+1];b+=d[i+2];n++;all++}}
  else{const cv=document.createElement('canvas');cv.width=cv.height=16;const x=cv.getContext('2d');x.drawImage(img,0,0,16,16);const d=x.getImageData(0,0,16,16).data;for(let i=0;i<d.length;i+=4){all++;if(d[i+3]<128)continue;r+=d[i];g+=d[i+1];b+=d[i+2];n++}}
  c={col:n?new THREE.Color(r/n/255,g/n/255,b/n/255):null,cov:all?n/all:1};if(c.col&&t.encoding===THREE.sRGBEncoding)c.col.convertSRGBToLinear()}catch(e){c=null}
 FLV.tex.set(img,c);return c}
/* has the batcher (and r635's part batching) finished with this vehicle? */
function flvReady(v){const o=v.m,ud=o.userData;if(!(ud.dpRecs||ud.dpLate))return false;if(typeof VB!='undefined'&&VB.on){for(const[x,k]of vbParts(o))if(!VB.skipKeys.has(k)&&!x.userData.vbTried&&!x.userData.dpRecs)return false}return true}
function flvSig(m){const t=m.map;return[m.visible,m.color?m.color.getHex():0,m.emissive?m.emissive.getHex():0,m.emissiveIntensity,m.opacity,t]}
function flvSame(a,b){for(let i=0;i<a.length;i++)if(a[i]!==b[i])return false;return true}
/* step 1 of making the simple shape: look at the vehicle and remember everything (cheap); the shape itself is filled in a little each frame */
function flvCollect(q,v){const root=v.m;root.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(root.matrixWorld).invert();const LV=FLV.lively.get(root),lv=LV?LV.set:null;
 const mems=[[],[],[]],hide=[],nodes=[],mats=new Set(),pcs=new Map(),mcache=new Map();let blocked=false,owner=null,nv=[0,0,0],ni=[0,0,0];
 const ownerOf=m=>{if(!owner){owner=new Map();const add=x=>{for(const r of(x.userData.dpRecs||[]))if(!r.dead&&r.mesh)for(const mm of r.mems)if(!mm.out)owner.set(mm.o,r.mesh)};add(root);for(const[x]of vbParts(root))add(x)}return owner.get(m)};
 const inside=(o,top)=>{for(let p=o;p;p=p.parent)if(p===top)return true;return false};
 /* a part left out (it keeps changing): everything in it stays as it is, unless one of the batches outside it hides a piece of it */
 const left=(o,top)=>{if(!o.visible)return;if(o.isMesh&&o.layers.mask===4){const b=ownerOf(o);if(!b||!inside(b,top))blocked=true}for(const c of o.children)left(c,top)};
 const walk=o=>{if(lv&&o!==root&&lv.has(o)){left(o,o);return}nodes.push(o);if(o!==root&&!o.visible)return;
  if(o.userData.dpMerged){if(o.layers.mask&1)hide.push(o);return}
  if(o.isMesh&&!o.isSprite&&!o.isPoints&&!o.isLine&&!o.isInstancedMesh&&!o.isSkinnedMesh){const mk=o.layers.mask;
   if(((mk&1)||mk===4)&&o.onBeforeRender===THREE.Object3D.prototype.onBeforeRender&&DP._geoOK(o.geometry)){const g=o.geometry;
    const ML=Array.isArray(o.material)?o.material:[o.material];let skip=false,decal=false;for(const mt of ML){if(!mt||(lv&&lv.has(mt))||mt.side===THREE.BackSide||(mk!==4&&mt.transparent&&mt.opacity<.2))skip=true;
     /* a mostly see-through picture (lettering, a stripe decal): left out of the shape, it cannot be read from that far */else if(mt.map&&(mt.transparent||mt.alphaTest>0)){const a=flvTexAvg(mt.map);if(a&&a.cov<.5)decal=true}}
    if(skip){if(mk===4)blocked=true}
    else{if(!g.boundingSphere)g.computeBoundingSphere();_flS.copy(g.boundingSphere).applyMatrix4(o.matrixWorld);_flM.multiplyMatrices(inv,o.matrixWorld);
     if(!decal&&_flS.radius>=FLV.MINR&&_flM.determinant()>0){const mm=Float32Array.from(_flM.elements);
      const add=(mt,s,ic,vc)=>{let cb=mcache.get(mt);if(cb){const ds=mt.side===THREE.DoubleSide;mems[cb[0]].push({o,s,ic,vc,m:mm,col:cb[1],ds});nv[cb[0]]+=ds?vc*2:vc;ni[cb[0]]+=ds?ic*2:ic;pcs.set(o,mk);return}let b=0,col;const em=mt.emissive?mt.emissive.getHex():0,ei=mt.emissiveIntensity==null?1:mt.emissiveIntensity;
        if(mt.type==='MeshBasicMaterial'){b=2;col=mt.color.clone();if(mt.map){const a=flvTexAvg(mt.map);if(a&&a.col)col.multiply(a.col)}}else if(em&&ei>0){_flC.setHex(em).multiplyScalar(ei);if(_flC.r+_flC.g+_flC.b>.9){b=2;col=_flC.clone()}}
        if(!col){col=mt.color?mt.color.clone():new THREE.Color(1,1,1);if(mt.map){const a=flvTexAvg(mt.map);if(a&&a.col)col.multiply(a.col)}if(mt.metalness!=null&&mt.metalness>=.45&&!mt.transparent)b=1;
         /* see-through glass shows the dark inside: mixed towards a dark tone by how see-through it is */if(mt.transparent&&mt.opacity<1)col.lerp(_flC.setRGB(.05,.055,.06),1-mt.opacity)}
        mcache.set(mt,[b,col]);const ds=mt.side===THREE.DoubleSide;mems[b].push({o,s,ic,vc,m:mm,col,ds});nv[b]+=ds?vc*2:vc;ni[b]+=ds?ic*2:ic;mats.add(mt);pcs.set(o,mk)};
      const n=g.index?g.index.count:g.attributes.position.count,pc=g.attributes.position.count;
      if(Array.isArray(o.material)){if(g.groups&&g.groups.length)for(const gr of g.groups){const mt=o.material[gr.materialIndex];const c=Math.min(gr.count,n-gr.start);if(mt&&c>0)add(mt,gr.start,c,g.index?pc:c)}}
      else add(o.material,0,n,pc)}
     /* (pieces under about 12 cm are not in the shape: from this far they are a pixel or less) */
     if(mk&1)hide.push(o)}}}
  for(const c of o.children)walk(c)};
 walk(root);if(blocked)return'blocked';if(!mems[0].length&&!mems[1].length&&!mems[2].length)return'nothing';
 const parts=[];for(const[x,k]of vbParts(root)){if(FLV_FREE.has(k))continue;let out=false;if(lv)for(let p=x;p&&p!==root;p=p.parent)if(lv.has(p)){out=true;break}if(out)continue;const p=x.position,r=x.quaternion,s=x.scale;parts.push([x,[p.x,p.y,p.z,r._x,r._y,r._z,r._w,s.x,s.y,s.z]])}
 const vis=new Uint8Array(nodes.length);for(let i=0;i<nodes.length;i++)vis[i]=nodes[i].visible?1:0;
 const e={v,root,meshes:[],hid:[],hide,on:false,ok:false,nodes,vis,parts,pcs:[...pcs],pi:0,mats:[...mats].map(m=>[m,flvSig(m)]),dmg:v.dmg,wreck:!!v.wreck,ri:0,t:performance.now()};
 const buf=[0,1,2].map(b=>{const n=nv[b];return n?{pos:new Float32Array(n*3),nor:new Float32Array(n*3),col:new Float32Array(n*3),idx:n>65535?new Uint32Array(ni[b]):new Uint16Array(ni[b]),vo:0,io:0,k:0}:null});
 root.__flv=e;return{e,mems,buf,b:0,ms:0}}
/* step 2: fill in the shape a little at a time (the clock is looked at every 256 corners; a big piece carries on next frame) */
function flvStep(J,budget){const t0=performance.now();
 while(J.b<3){const B=J.buf[J.b],L=J.mems[J.b];if(!B||B.k>=L.length){J.b++;continue}
  const m=L[B.k],g=m.o.geometry,pa=g.attributes.position.array,na=g.attributes.normal?g.attributes.normal.array:null;_flM.fromArray(m.m);_flN.getNormalMatrix(_flM);
  const v0=g.index?0:m.s,vo=B.vo,c=m.col;let i=B.vi|0;
  while(i<m.vc){const end=Math.min(m.vc,i+256);for(;i<end;i++){const s=v0+i,k=(vo+i)*3;_flV.fromArray(pa,s*3).applyMatrix4(_flM);B.pos[k]=_flV.x;B.pos[k+1]=_flV.y;B.pos[k+2]=_flV.z;
    if(na)_flV.fromArray(na,s*3).applyMatrix3(_flN).normalize();else _flV.set(0,1,0);B.nor[k]=_flV.x;B.nor[k+1]=_flV.y;B.nor[k+2]=_flV.z;B.col[k]=c.r;B.col[k+1]=c.g;B.col[k+2]=c.b}
   if(i<m.vc&&performance.now()-t0>budget){B.vi=i;J.ms+=performance.now()-t0;return false}}
  B.vi=0;B.k++;
  if(g.index){const ia=g.index.array;for(let i=0;i<m.ic;i++)B.idx[B.io+i]=ia[m.s+i]+vo}else for(let i=0;i<m.ic;i++)B.idx[B.io+i]=vo+i;B.io+=m.ic;B.vo+=m.vc;
  /* a double-sided piece: the same corners again facing the other way, its triangles wound the other way round */
  if(m.ds){const v2=B.vo;for(let i=0;i<m.vc;i++){const a=(vo+i)*3,k=(v2+i)*3;B.pos[k]=B.pos[a];B.pos[k+1]=B.pos[a+1];B.pos[k+2]=B.pos[a+2];B.nor[k]=-B.nor[a];B.nor[k+1]=-B.nor[a+1];B.nor[k+2]=-B.nor[a+2];B.col[k]=B.col[a];B.col[k+1]=B.col[a+1];B.col[k+2]=B.col[a+2]}
   const i0=B.io-m.ic;for(let i=0;i+2<m.ic;i+=3){B.idx[B.io+i]=B.idx[i0+i]-vo+v2;B.idx[B.io+i+1]=B.idx[i0+i+2]-vo+v2;B.idx[B.io+i+2]=B.idx[i0+i+1]-vo+v2}B.io+=m.ic;B.vo+=m.vc}
  if(performance.now()-t0>budget)break}
 J.ms+=performance.now()-t0;return J.b>=3}
/* step 3: anything changed meanwhile? then it is thrown away and tried again later; else the shape is ready (not shown yet) */
function flvFinish(q,J){const e=J.e,w=flvChanged(q,e,true);if(w){flvForget(e,w);return null}
 const M=flvMats();FLV.hook=1;try{for(let b=0;b<3;b++){const B=J.buf[b];if(!B)continue;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(B.pos,3));g.setAttribute('normal',new THREE.BufferAttribute(B.nor,3));g.setAttribute('color',new THREE.BufferAttribute(B.col,3));g.setIndex(new THREE.BufferAttribute(B.idx,1));g.computeBoundingSphere();
  const mesh=new THREE.Mesh(g,M[b]);mesh.visible=false;mesh.layers.mask=4;mesh.userData={dpMerged:1,noSeam:1,flv:1,dpKeep:1};e.root.add(mesh);e.meshes.push(mesh)}}finally{FLV.hook=0}
 e.ok=true;FLV.ent.set(e.root,e);FLV.stats.built++;FLV.stats.ms+=J.ms;return e}
/* anything different from when the shape was made? Every frame (quick): gone, damaged, a moving part moved, pieces added or
   removed. A few at a time (deep): pieces shown or hidden, their layers, colours. full: everything at once */
function flvQuick(e){const v=e.v;if(e.dirty)return'added or removed';if(v.gone||!e.root.parent)return'gone';if(!!v.wreck!==e.wreck||v.dmg!==e.dmg)return'damaged';
 for(const[x,s]of e.parts){const p=x.position,r=x.quaternion,c=x.scale;if(p.x!==s[0]||p.y!==s[1]||p.z!==s[2]||r._x!==s[3]||r._y!==s[4]||r._z!==s[5]||r._w!==s[6]||c.x!==s[7]||c.y!==s[8]||c.z!==s[9]){e.culprit=x;return'a part moved'}}return null}
function flvChanged(q,e,full){const w=flvQuick(e);if(w)return w;
 const N=e.nodes,n=full?N.length:Math.min(N.length,64);for(let k=0;k<n;k++){const i=full?k:(e.ri=(e.ri+1)%N.length);if(i===0)continue;const o=N[i];if((o.visible?1:0)!==e.vis[i]){e.culprit=o;return'shown or hidden'}if(!o.parent)return'added or removed'}
 /* the pieces' layers: one the batcher let go of (it changed) means the shape is out of date; one something else showed again is hidden again */
 const PC=e.pcs,pn=full?PC.length:Math.min(PC.length,64);for(let k=0;k<pn;k++){const i=full?k:(e.pi=(e.pi+1)%PC.length);const[o,m0]=PC[i],m=o.layers.mask;
  if(m0===4&&m!==4){e.culprit=o;return'a piece changed'}if(m0!==4&&e.on&&m!==4){if(m&1){e.hid.push([o,m]);o.layers.mask=4}}else if(m0!==4&&!e.on&&m!==m0){e.culprit=o;return'a piece changed'}}
 const mn=full?e.mats.length:Math.min(e.mats.length,16);for(let k=0;k<mn;k++){const i=full?k:(e.mi=((e.mi|0)+1)%e.mats.length);const[mt,s]=e.mats[i];if(!flvSame(flvSig(mt),s)){e.culprit=mt;return'colour changed'}}
 return null}
/* show the simple shape (hide the real pieces from the camera) or the real vehicle again */
function flvShow(e){if(e.on)return;for(const o of e.hide)if(o.layers.mask&1){e.hid.push([o,o.layers.mask]);o.layers.mask=4}for(const m of e.meshes){m.visible=true;m.layers.mask=1}e.on=true}
function flvBack(e){if(!e.on)return;for(const m of e.meshes){m.visible=false;m.layers.mask=4}for(const[o,mk]of e.hid)if(o.layers.mask===4)o.layers.mask=mk;e.hid.length=0;e.on=false}
/* throw a shape away (it is made again later; a part that keeps changing is left out next time) */
function flvForget(e,why){flvBack(e);FLV.hook=1;try{for(const m of e.meshes){if(m.parent)m.parent.remove(m);try{m.geometry.dispose()}catch(x){}}}finally{FLV.hook=0}
 e.meshes.length=0;e.ok=false;if(FLV.ent.get(e.root)===e)FLV.ent.delete(e.root);delete e.root.__flv;FLV.stats.dropped++;FLV.stats.why[why]=(FLV.stats.why[why]|0)+1;
 const c=e.culprit;e.culprit=null;let L=FLV.lively.get(e.root);if(c&&c!==e.root&&!(c.userData&&c.userData.dpMerged)){if(!L)FLV.lively.set(e.root,L={set:new Set(),n:0});L.set.add(c);L.n++}
 FLV.cool.set(e.root,performance.now()+(L&&L.n>=4?120000:FLV.REB))}
function flvTick(q){const C0=performance.now();if(FLV.q!==q){for(const e of[...FLV.ent.values()])flvForget(e,'left');if(FLV.job){flvDropJob();}FLV.q=q}
 const cx=C.position.x,cy=C.position.y,cz=C.position.z,now=performance.now(),want=[];
 for(const v of q.vehs||[]){const o=v&&v.m;if(!o)continue;const m=o.matrixWorld.elements,d=Math.hypot(m[12]-cx,m[13]-cy,m[14]-cz),e=FLV.ent.get(o);
  if(e){const w=flvQuick(e);if(w){flvForget(e,w);continue}if(e.on&&d<FLV.D0)flvBack(e);else if(!e.on&&d>FLV.D1)flvShow(e)}
  else if(d>FLV.PRE&&o.visible&&!v.gone&&o.parent&&!o.__flv&&!((FLV.cool.get(o)||0)>now)&&flvReady(v))want.push([d,v])}
 /* the shown shapes, a few pieces each frame: anything changed? back to the real vehicle at once */
 const L=[...FLV.ent.values()];if(L.length){let k=0;const t1=performance.now();while(k++<L.length&&performance.now()-t1<FLV.CHECK){FLV.rr=(FLV.rr+1)%L.length;const e=L[FLV.rr];const w=flvChanged(q,e,false);if(w)flvForget(e,w);
}}
 /* making shapes: the vehicles about to be far first (nearest first), within about 2.5 ms a frame */
 want.sort((a,b)=>a[0]-b[0]);let wi=0,looked=false;const t2=performance.now();
 for(let guard=0;guard<10;guard++){const left=FLV.BUDGET-(performance.now()-t2);if(left<=0)break;
  if(FLV.job){const J=FLV.job;let done=false;try{done=flvStep(J,left)}catch(x){flvDropJob();throw x}if(!done)break;FLV.job=null;flvFinish(q,J);break/* (the next look waits for the next frame) */}
  if(wi>=want.length||looked)break;looked=true;const v=want[wi++][1];if(v.m.__flv)continue;const r=flvCollect(q,v);if(r&&typeof r=='object')FLV.job=r;else{FLV.cool.set(v.m,now+120000);FLV.stats.why[r||'nothing']=(FLV.stats.why[r||'nothing']|0)+1}}
 const d=performance.now()-C0;if(d>FLV.stats.maxStep)FLV.stats.maxStep=+d.toFixed(2)}
function flvDropJob(){const J=FLV.job;FLV.job=null;if(J&&J.e)delete J.e.root.__flv}
/* pieces added to or taken out of a vehicle with a shape: the shape is made again */
{const P0=THREE.Object3D.prototype,a0=P0.add,r0=P0.remove;const mark=o=>{if(FLV.hook||(!FLV.ent.size&&!FLV.job))return;for(let p=o;p;p=p.parent)if(p.__flv){p.__flv.dirty=1;return}};
 P0.add=function(){mark(this);return a0.apply(this,arguments)};P0.remove=function(){mark(this);return r0.apply(this,arguments)}}
{const ru=busRoamUpd;busRoamUpd=function(q,dt){const r=ru.apply(this,arguments);try{if(FLV.on&&q&&q.vehs&&!q.ld&&q.dp&&q.dp.merged&&typeof DP!='undefined'&&DP._geoOK)flvTick(q);else if(FLV.ent.size||FLV.job){for(const e of[...FLV.ent.values()])flvForget(e,'off');flvDropJob()}}
 catch(e){conLog('error','far vehicles: '+e.message);FLV.on=false;try{for(const x of[...FLV.ent.values()])flvForget(x,'error');flvDropJob()}catch(y){}}return r}}
/* other cameras (the squad monitors) see the real vehicles near them */
{const r0=R.render;R.render=function(sc,cam){if(sc!==S||cam===C||!FLV.ent.size||(typeof WARM!='undefined'&&cam===WARM.cam))return r0.apply(this,arguments);
 const back=[];try{cam.updateMatrixWorld();const e0=cam.matrixWorld.elements;for(const e of FLV.ent.values()){if(!e.on)continue;const m=e.root.matrixWorld.elements;if(Math.hypot(m[12]-e0[12],m[13]-e0[13],m[14]-e0[14])<FLV.D1){flvBack(e);back.push(e)}}}catch(x){}
 try{return r0.apply(this,arguments)}finally{for(const e of back)flvShow(e)}}}
/* the lag window (F9) times this as its own part */
if(typeof LAGSYS!='undefined'){LAGSYS.push(['flvTick','Far vehicles (simple shapes)']);{const f0=flvTick;flvTick=function(){if(!LAG.open)return f0.apply(this,arguments);const t=performance.now();try{return f0.apply(this,arguments)}finally{const d=performance.now()-t;LAG.sys.flvTick=(LAG.sys.flvTick||0)+d;LAG.cur.flvTick=(LAG.cur.flvTick||0)+d}}}}
