/* =====================================================================================================
   r684: SHADERS MADE BEHIND THE LOADING SCREEN, also for the things the game builds later.
   Every new kind of look needs a "shader" (a small program for the graphics card). Firefox takes about a quarter of a
   second to make one, and the game freezes meanwhile. The loading screen already made the shaders of everything in the
   desert (the 'Warming up the shaders' step), but several speed-ups build NEW things while you play, each with its own
   new kind of material: the scenery area batches (r667), people batching (r654), far vehicle/scenery shapes (r651/r652),
   late batches of places (r646/r674), the particle quads (r674). Their first appearance froze the game (drive reports:
   about a dozen freezes of 250-300 ms in the first minute).
   Now, in that same loading step, the game makes a stand-in for every kind those systems can produce from what is in the
   desert, with the very same settings, and lets the graphics card make their shaders too. Shaders are shared by every
   material with the same settings, so the real ones later find theirs ready. The stand-ins are never drawn and stay in
   memory (a shader is thrown away when its last material is). ?noshw turns this off to compare.
   ===================================================================================================== */
const SHW={UPR:300,UPMS:6000,on:!/[?&]noshw(?:[&=]|$)/.test(location.search),up:!/[?&]noshwup(?:[&=]|$)/.test(location.search),keep:[],q:null,st:{dummies:0,progs:0,ms:0,upMs:0,upGeo:0,upTex:0}};
/* r685: the arrival. With "skip the bus ride" the warm-up (r632) gets no time before you step off, so the first frames
   sent ~4,000 shapes and ~130 pictures to the graphics card at once (about 1.7 s of hitches in the drive report). Now,
   right after the shaders, the view from the bus stop is drawn in all six directions into a single hidden pixel while the
   loading screen is still up, which sends all of it ahead. ?noshwup leaves this out. */
function shwPreUpload(q){const t0=performance.now(),g0=R.info.memory.geometries,x0=R.info.memory.textures;
 /* first the warm-up's own list (r632): everything near the stop that is shown or only hidden for being far away
    (details, cells, vehicles), each drawn alone into the hidden pixel, whatever its group's state; nearest first */
 if(typeof WARM!='undefined'&&WARM.on&&typeof warmScanStep=='function'&&typeof warmBatch=='function'){try{
  WARM.q=q;WARM.list=[];WARM.lights=[];WARM.litQ=null;WARM.hot=[];WARM.hotC=[];WARM.roam=q.roam;WARM.scanT=performance.now();
  WARM.scan={so:[q.g],sx:[null],sz:[null],out:[],lights:[],veh:new Set((q.vehs||[]).map(v=>v&&v.m).filter(Boolean))};
  let k=0;while(!warmScanStep(q,20000)&&k++<200){}
  const L=WARM.list,[cx,cz]=warmCtr(q),r0=WARM.r0||R.render;let n=0;
  while(L.length&&performance.now()-t0<SHW.UPMS){const b=[];while(L.length&&b.length<64){const it=L[L.length-1];if(Math.hypot(it.x-cx,it.z-cz)>SHW.UPR)break;L.pop();const o=it.o;if(!o.geometry||!o.parent||!warmNeed(o))continue;warmMark(o);b.push(o)}
   if(!b.length)break;warmBatch(q,b,r0);n+=b.length}SHW.st.upWarm=n}catch(e){try{conLog('error','send-ahead (warm list): '+e.message)}catch(_){}}}
 const cam=new THREE.PerspectiveCamera(90,1,C.near,C.far);cam.layers.mask=C.layers.mask;cam.position.set(0,1.7,-1043+q.OZ);
 const vp=new THREE.Vector4(),sc=new THREE.Vector4();R.getViewport(vp);R.getScissor(sc);const st=R.getScissorTest();
 const D=[[1,0,0],[-1,0,0],[0,0,1],[0,0,-1],[0,1,0],[0,-1,0]];
 try{R.setViewport(0,0,1,1);R.setScissor(0,0,1,1);R.setScissorTest(true);
  for(const d of D){cam.up.set(0,d[1]?0:1,d[1]?1:0);cam.lookAt(cam.position.x+d[0],cam.position.y+d[1],cam.position.z+d[2]);cam.updateMatrixWorld(true);R.render(S,cam)}}
 finally{R.setScissorTest(st);R.setScissor(sc);R.setViewport(vp)}
 SHW.st.upMs=performance.now()-t0;SHW.st.upGeo=R.info.memory.geometries-g0;SHW.st.upTex=R.info.memory.textures-x0;
 try{conLog('info','sent ahead behind the loading screen: '+SHW.st.upGeo+' shapes, '+SHW.st.upTex+' pictures, '+SHW.st.upMs.toFixed(0)+' ms')}catch(e){}}
/* the material settings that decide which shader three.js makes (r128's program parameters that come from a material) */
function shwSig(m,extra){const t=k=>m[k]?1:0,mp=m.map;
 return [m.type,mp?(mp.encoding|0):'-',t('matcap'),t('envMap'),t('lightMap'),t('aoMap'),t('emissiveMap'),t('bumpMap'),t('normalMap'),m.normalMapType|0,t('displacementMap'),t('specularMap'),t('roughnessMap'),t('metalnessMap'),t('alphaMap'),t('gradientMap'),m.combine|0,m.vertexColors?1:0,m.fog?1:0,m.flatShading?1:0,m.premultipliedAlpha?1:0,m.alphaTest||0,m.side|0,m.dithering?1:0,m.toneMapped===false?0:1,m.skinning?1:0,m.morphTargets?1:0,(m.clippingPlanes&&m.clippingPlanes.length)|0,m.transparent?1:0,JSON.stringify(m.defines||null),(m.userData&&m.userData.dpSand)?1:0,m.customProgramCacheKey?String(m.customProgramCacheKey()).length+':'+String(m.customProgramCacheKey()).slice(0,60):'',extra||''].join('|')}
/* the material part of sknWhy (dx640): can a piece with this material be drawn by a bone? */
function shwSknOK(q,o){if(o.children.length||o.isSprite||o.isPoints||o.isLine||o.isInstancedMesh||o.isSkinnedMesh)return false;const u=o.userData;if(u.dpMerged||u.flv||u.fsc||u.skn)return false;
 /* (already batched pieces sit on layer 2; render hooks, odd shapes and anything inside a vehicle-like group are never taken) */
 const mk=o.layers.mask;if(mk!==1&&mk!==(1<<PL_FAR))return false;if(o.onBeforeRender!==THREE.Object3D.prototype.onBeforeRender)return false;try{if(!DP._geoOK(o.geometry))return false}catch(e){return false}
 if(SKN.lively&&SKN.lively.has(o.material))return false;
 /* in scenery cells only the moving things are taken (r662) */let mv=false,cell=false;for(let p=o.parent;p&&p!==q.g;p=p.parent){if(p.updateMatrixWorld!==_mwP||p.__mwKeep||p.userData.flv||p.userData.fsc)return false;const pu=p.userData;if(pu.dpDyn||pu.dpKeep||pu.mv)mv=true;if(pu.chunk)cell=true}if(cell&&!mv)return false;
 const m=o.material;if(!m||Array.isArray(m)||(m.userData&&m.userData.dpSand)||m.transparent||!sknKey(m))return false;
 if(m.map){const im=m.map.image;if(!(im&&((typeof HTMLImageElement!='undefined'&&im instanceof HTMLImageElement)||(typeof ImageBitmap!='undefined'&&im instanceof ImageBitmap)||(typeof HTMLCanvasElement!='undefined'&&im instanceof HTMLCanvasElement))))return false}return true}
/* a tiny stand-in shape with the attributes the real batches have */
function shwGeo(ci,uv,skin){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,0,0,0,0,0,0],3));g.setAttribute('normal',new THREE.Float32BufferAttribute([0,1,0,0,1,0,0,1,0],3));
 if(ci)g.setAttribute('color',new THREE.Float32BufferAttribute(new Array(3*ci).fill(1),ci));if(uv)g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,0,0,0,0],2));
 if(skin){g.setAttribute('skinIndex',new THREE.Uint16BufferAttribute([0,0,0,0,0,0,0,0,0,0,0,0],4));g.setAttribute('skinWeight',new THREE.Float32BufferAttribute([1,0,0,0,1,0,0,0,1,0,0,0],4))}return g}
function shwStandIns(q){const out=[],seen=new Set(),G={};const geo=(ci,uv,sk)=>{const k=ci+'|'+uv+'|'+sk;return G[k]||(G[k]=shwGeo(ci,uv,sk))};
 const add=(m,ci,uv,skin,tag)=>{const k=shwSig(m,tag+'|'+ci+'|'+(uv?1:0));if(seen.has(k))return false;seen.add(k);let o;
  if(skin){o=new THREE.SkinnedMesh(geo(ci,uv,1),m);const b=new THREE.Bone();o.add(b);o.bind(new THREE.Skeleton([b]))}else o=new THREE.Mesh(geo(ci,uv,0),m);
  o.frustumCulled=false;o.raycast=()=>{};out.push(o);SHW.keep.push({m,c:tag});return true};
 const lam=(typeof DP!='undefined'&&DP.cfg)?!!DP.cfg().lam:false,mm=DP._mergedMat,src=new Map();
 /* every material in the desert (hidden things too: places, cells and details switch on later) */
 q.g.traverse(o=>{if(!o.isMesh||o.isSkinnedMesh||!o.geometry||o.userData.skn)return;const ms=Array.isArray(o.material)?o.material:[o.material];
  const ci=o.geometry.attributes.color?o.geometry.attributes.color.itemSize:0;
  for(const m of ms){if(!m||m.isShaderMaterial||!/^Mesh(Basic|Lambert|Standard|Phong)Material$/.test(m.type))continue;const k=shwSig(m,'c'+ci);if(!src.has(k))src.set(k,[m,ci])}});
 /* 1) late batches of places (the batcher's own merged material, as made from this piece) */
 const merged=new Map();for(const[,[m,ci]]of src){let x;try{x=mm(m,lam)}catch(e){continue}const k=shwSig(x,'m');if(merged.has(k))continue;merged.set(k,x);add(x,3,!!x.map,false,'m')}
 /* 2) scenery area batches made from those (r667; same rules as abtKey for the material) */
 if(typeof abtMat=='function'&&typeof ABT!='undefined')for(const[,x]of merged){const t=x.type;if(t!=='MeshLambertMaterial'&&t!=='MeshStandardMaterial'&&t!=='MeshBasicMaterial')continue;
  if(x.transparent||x.onBeforeCompile!==THREE.Material.prototype.onBeforeCompile||(x.userData&&x.userData.dpSand)||!x.vertexColors)continue;
  /* (a piece with a picture only joins when its picture goes into a texture array, so X = has a picture) */const X=!!x.map;let a;try{a=abtMat(x,X?{tex:null}:null,null,1,false,false)}catch(e){continue}add(a,3,X,false,'a')}
 /* 3) people batching (r654): the merged material (never the cheap Lambert swap) with bones */
 if(typeof sknWhy=='function'&&typeof sknRoots=='function'&&typeof SKN!='undefined'&&SKN.on!==false){const sk=new Set();
  for(const r of sknRoots(q))r.traverse(o=>{if(!o.isMesh||sk.has(o.material))return;if(!shwSknOK(q,o))return;sk.add(o.material);let x;try{x=mm(o.material,false)}catch(e){return}x.skinning=true;x.userData.skn=1;add(x,3,!!x.map,true,'s')})}
 /* 4) far vehicles and far scenery shapes (r651/r652): their three shared materials */
 try{if(typeof flvMats=='function')for(const m of flvMats())add(m,3,false,false,'f')}catch(e){}
 /* (r686: the blowing sand made on the first roaming frame, and the two kinds of night stars) */
 try{add(new THREE.PointsMaterial({color:0xe0b880,size:.12,transparent:true,opacity:.5,depthWrite:false}),0,false,false,'pt');
  add(new THREE.PointsMaterial({size:1.7,sizeAttenuation:false,vertexColors:true,transparent:true,opacity:0,depthWrite:false,fog:false}),3,false,false,'pt');
  add(new THREE.PointsMaterial({color:0xfff4e0,size:1.6,sizeAttenuation:false,transparent:true,opacity:0,depthWrite:false,fog:false}),0,false,false,'pt')}catch(e){}
 /* (r686: the area batches' upload helper, a tiny shader) */
 try{if(typeof abtUpMat=='function')add(abtUpMat(),0,false,false,'u')}catch(e){}
 /* 5) particle quads (r674) */
 try{if(typeof PTB!='undefined'&&typeof ptbMat=='function'){if(!PTB.mats)PTB.mats=[ptbMat(false),ptbMat(true)];for(const m of PTB.mats)if(m)add(m,0,true,false,'p')}}catch(e){}
 return out}
/* r685: the places that were built only once you stepped off the bus (each by its own once-a-second check: the air wing,
   guidance and launch rooms, hangar and strike consoles, the PD HQ, the refit station, the command wing, the silo, the
   water-delivery spots, the runway clean-up) are built here instead, at the end of loading, in the same order and with
   the same conditions. They mark themselves built, so those checks then find nothing to do. In the drive report they
   were most of the 900-1,260 new pieces drawn at once in the first seconds (and their shaders/pictures).
   ?noshwearly = as before. */
SHW.early=!/[?&]noshwearly(?:[&=]|$)/.test(location.search);
function shwEarly(q){const t0=performance.now(),ld=q.ld,done=[];const F=(n,ok,f)=>{if(typeof window[n]!=='function')return;try{if(ok()){f();done.push(n)}}catch(e){try{conLog('error','early build '+n+': '+e.message)}catch(_){}}};
 q.ld=0;try{
  F('pgSetup',()=>true,()=>pgSetup(q));
  F('lrFix',()=>q.mil&&q.mil.nuke,()=>lrFix(q));
  F('awBase',()=>q.mil&&q.addVeh,()=>{awBase(q);awPad(q)});
  F('ngBuild',()=>q.mil&&q.mil.nuke,()=>{ngBuild(q);lkBuild(q)});
  F('hdBuild',()=>q.mil&&q.mil.door,()=>hdBuild(q));
  F('xsBuild',()=>q.mil,()=>xsBuild(q));
  F('rwClear',()=>q.obs&&q.g,()=>rwClear(q));
  F('rwTrees',()=>q.obs&&q.g,()=>rwTrees(q));
  F('pdHQ',()=>q.g&&q.obs&&q.props&&q.anims,()=>pdHQ(q));
  F('rfsBuild',()=>q.mil&&q.g,()=>rfsBuild(q));
  F('cwBuild',()=>q.g&&q.obs&&q.mil&&q.props&&q.anims,()=>cwBuild(q));
  F('siloBuild',()=>q.mil&&q.mil.nuke,()=>siloBuild(q));
  /* (r686: the oasis/crater ground patches take the floor's sand look on the first frame you roam: new shaders) */
  F('ssGroundMatch',()=>q.ssG&&!q.ssGM,()=>ssGroundMatch(q));
  F('wdBuild',()=>q.g&&q.locs&&q.locs.length&&typeof WDEL!='undefined'&&WDEL.q!==q,()=>wdBuild(q));
 }finally{q.ld=ld}
 SHW.st.early=done.length;SHW.st.earlyMs=performance.now()-t0;try{conLog('info','built behind the loading screen: '+done.join(', ')+' ('+SHW.st.earlyMs.toFixed(0)+' ms)')}catch(e){}}
{const c0=R.compile;R.compile=function(sc,cam){const q=typeof BUS!='undefined'&&BUS.ride;if(!SHW.on||sc!==S||!q||!q.g||!q.ld||SHW.q===q)return c0.apply(this,arguments);SHW.q=q;
 if(SHW.early)try{shwEarly(q)}catch(e){}
 const t0=performance.now(),p0=(R.info.programs||[]).length;let g=null;
 try{const L=shwStandIns(q);g=new THREE.Group();g.name='shw';for(const o of L)g.add(o);S.add(g);SHW.st.dummies=L.length}catch(e){try{conLog('error','shader stand-ins: '+e.message)}catch(_){}}
 try{const r=c0.apply(this,arguments);if(g){S.remove(g);g=null}if(SHW.up)try{shwPreUpload(q)}catch(e){try{conLog('error','send-ahead: '+e.message)}catch(_){}}return r}finally{if(g)S.remove(g);SHW.st.progs=(R.info.programs||[]).length-p0;SHW.st.ms=performance.now()-t0;
  try{conLog('info','shaders made behind the loading screen: '+SHW.st.progs+' ('+SHW.st.dummies+' stand-ins for things built later), '+SHW.st.ms.toFixed(0)+' ms')}catch(e){}}}}
/* r685: THE MAP'S BACKGROUND. When four or more obstacles came or went (speed-check cones, parked backup cars, a place
   finishing building), the whole 2048 px map background was painted again: 37-64 ms in one frame. Most of those changes
   do not change what the map shows (it draws buildings found from walls, not single cones). Now the buildings are found
   again first (quick) and the background is painted again only if the result is different. ?noshwmap = as before. */
SHW.map=!/[?&]noshwmap(?:[&=]|$)/.test(location.search);
function shwMapSig(D){if(!D)return'';const r=v=>Math.round(v*10);const L=a=>(a||[]).map(o=>o&&o.x0!=null?r(o.x0)+','+r(o.x1)+','+r(o.z0)+','+r(o.z1)+(o.k||'')+(o.c||''):JSON.stringify(o)).join(';');
 return [L(D.bld),L(D.wall),L(D.dash),L(D.gr),L(D.rd)].join('|')}
if(typeof dmapBg=='function'&&typeof dmChanged=='function'&&typeof dmScan=='function'){
 {const bg0=dmapBg;dmapBg=function(q){const had=!!q.mapBg;const c=bg0.apply(this,arguments);if(!had&&SHW.map)try{DM2.sg=shwMapSig(DM2.data);DM2.mrN=(q.mapR||[]).length}catch(e){}return c}}
 {const dc0=dmChanged;dmChanged=function(q){const r=dc0.apply(this,arguments);if(!r||!SHW.map)return r;
  try{if(typeof DMAP!='undefined'&&DMAP.open)return r;if((q.mapR||[]).length!==DM2.mrN||DM2.sg==null)return r;
   const t0=performance.now();dmScan(q);const same=shwMapSig(DM2.data)===DM2.sg;SHW.st.mapMs=performance.now()-t0;
   if(same){DM2.cnt=dmCount(q);SHW.st.mapSkip=(SHW.st.mapSkip|0)+1;return false}}catch(e){}return r}}}
