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
const SHW={on:!/[?&]noshw(?:[&=]|$)/.test(location.search),keep:[],q:null,st:{dummies:0,progs:0,ms:0}};
/* the material settings that decide which shader three.js makes (r128's program parameters that come from a material) */
function shwSig(m,extra){const t=k=>m[k]?1:0,mp=m.map;
 return [m.type,mp?(mp.encoding|0):'-',t('matcap'),t('envMap'),t('lightMap'),t('aoMap'),t('emissiveMap'),t('bumpMap'),t('normalMap'),m.normalMapType|0,t('displacementMap'),t('specularMap'),t('roughnessMap'),t('metalnessMap'),t('alphaMap'),t('gradientMap'),m.combine|0,m.vertexColors?1:0,m.fog?1:0,m.flatShading?1:0,m.premultipliedAlpha?1:0,m.alphaTest||0,m.side|0,m.dithering?1:0,m.toneMapped===false?0:1,m.skinning?1:0,m.morphTargets?1:0,(m.clippingPlanes&&m.clippingPlanes.length)|0,m.transparent?1:0,JSON.stringify(m.defines||null),(m.userData&&m.userData.dpSand)?1:0,m.customProgramCacheKey?String(m.customProgramCacheKey()).length+':'+String(m.customProgramCacheKey()).slice(0,60):'',extra||''].join('|')}
/* a tiny stand-in shape with the attributes the real batches have */
function shwGeo(ci,uv,skin){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,0,0,0,0,0,0],3));g.setAttribute('normal',new THREE.Float32BufferAttribute([0,1,0,0,1,0,0,1,0],3));
 if(ci)g.setAttribute('color',new THREE.Float32BufferAttribute(new Array(3*ci).fill(1),ci));if(uv)g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,0,0,0,0],2));
 if(skin){g.setAttribute('skinIndex',new THREE.Uint16BufferAttribute([0,0,0,0,0,0,0,0,0,0,0,0],4));g.setAttribute('skinWeight',new THREE.Float32BufferAttribute([1,0,0,0,1,0,0,0,1,0,0,0],4))}return g}
function shwStandIns(q){const out=[],seen=new Set(),G={};const geo=(ci,uv,sk)=>{const k=ci+'|'+uv+'|'+sk;return G[k]||(G[k]=shwGeo(ci,uv,sk))};
 const add=(m,ci,uv,skin,tag)=>{const k=shwSig(m,tag+'|'+ci+'|'+(uv?1:0));if(seen.has(k))return false;seen.add(k);let o;
  if(skin){o=new THREE.SkinnedMesh(geo(ci,uv,1),m);const b=new THREE.Bone();o.add(b);o.bind(new THREE.Skeleton([b]))}else o=new THREE.Mesh(geo(ci,uv,0),m);
  o.frustumCulled=false;o.raycast=()=>{};out.push(o);SHW.keep.push(m);return true};
 const lam=(typeof DP!='undefined'&&DP.cfg)?!!DP.cfg().lam:false,mm=DP._mergedMat,src=new Map();
 /* every material in the desert (hidden things too: places, cells and details switch on later) */
 q.g.traverse(o=>{if(!o.isMesh||o.isSkinnedMesh||!o.geometry||o.userData.skn)return;const ms=Array.isArray(o.material)?o.material:[o.material];
  const ci=o.geometry.attributes.color?o.geometry.attributes.color.itemSize:0;
  for(const m of ms){if(!m||m.isShaderMaterial||!/^Mesh(Basic|Lambert|Standard|Phong)Material$/.test(m.type))continue;const k=shwSig(m,'c'+ci);if(!src.has(k))src.set(k,[m,ci])}});
 /* 1) late batches of places (the batcher's own merged material, as made from this piece) */
 const merged=new Map();for(const[,[m,ci]]of src){let x;try{x=mm(m,lam)}catch(e){continue}const k=shwSig(x,'m');if(merged.has(k))continue;merged.set(k,x);add(x,3,!!x.map,false,'m');if(ci===4)add(x,4,!!x.map,false,'m4')}
 /* 2) scenery area batches made from those (r667; same rules as abtKey for the material) */
 if(typeof abtMat=='function'&&typeof ABT!='undefined')for(const[,x]of merged){const t=x.type;if(t!=='MeshLambertMaterial'&&t!=='MeshStandardMaterial'&&t!=='MeshBasicMaterial')continue;
  if(x.transparent||x.onBeforeCompile!==THREE.Material.prototype.onBeforeCompile||(x.userData&&x.userData.dpSand)||!x.vertexColors)continue;
  for(const X of(x.map?[true,false]:[false])){let a;try{a=abtMat(x,X?{tex:null}:null,null,1,false,false)}catch(e){continue}add(a,3,X,false,'a')}}
 /* 3) people batching (r654): the merged material (never the cheap Lambert swap) with bones */
 if(typeof sknWhy=='function'&&typeof sknRoots=='function'&&typeof SKN!='undefined'&&SKN.on!==false){const sk=new Set();
  for(const r of sknRoots(q))r.traverse(o=>{if(!o.isMesh||sk.has(o.material))return;let w;try{w=sknWhy(q,o,lam)}catch(e){return}if(w)return;sk.add(o.material);let x;try{x=mm(o.material,false)}catch(e){return}x.skinning=true;x.userData.skn=1;add(x,3,!!x.map,true,'s')})}
 /* 4) far vehicles and far scenery shapes (r651/r652): their three shared materials */
 try{if(typeof flvMats=='function')for(const m of flvMats())add(m,3,false,false,'f')}catch(e){}
 /* 5) particle quads (r674) */
 try{if(typeof PTB!='undefined'&&PTB.mats)for(const m of PTB.mats)if(m)add(m,0,true,false,'p')}catch(e){}
 return out}
{const c0=R.compile;R.compile=function(sc,cam){const q=typeof BUS!='undefined'&&BUS.ride;if(!SHW.on||sc!==S||!q||!q.g||!q.ld||SHW.q===q)return c0.apply(this,arguments);SHW.q=q;
 const t0=performance.now(),p0=(R.info.programs||[]).length;let g=null;
 try{const L=shwStandIns(q);g=new THREE.Group();g.name='shw';for(const o of L)g.add(o);S.add(g);SHW.st.dummies=L.length}catch(e){try{conLog('error','shader stand-ins: '+e.message)}catch(_){}}
 try{return c0.apply(this,arguments)}finally{if(g)S.remove(g);SHW.st.progs=(R.info.programs||[]).length-p0;SHW.st.ms=performance.now()-t0;
  try{conLog('info','shaders made behind the loading screen: '+SHW.st.progs+' ('+SHW.st.dummies+' stand-ins for things built later), '+SHW.st.ms.toFixed(0)+' ms')}catch(e){}}}}
