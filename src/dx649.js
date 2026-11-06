/* =====================================================================================================
   r674: DUST, SPARKS AND OTHER LITTLE PUFFS DRAWN TOGETHER.
   The game's particle effects (tyre dust, road dust, sparks, puffs, splashes...) are small glowing sprites added
   straight to the scene, and every single one was its own draw call: 30 to 150 a frame in the desert Benchmark
   ("sky, sun and other" in the lag window), more when lots of cars drive about.
   Now, while the main view is drawn, those sprites are left out of the scene's list and drawn by two shapes instead
   (one for normal puffs, one for glowing ones), one corner set per puff, with exactly the sprite's own maths:
   its place seen from the camera (worked out the same way the renderer does), its size, colour and see-through-ness,
   farthest first, the same fog. Nothing about the particles themselves changes: the game still moves, fades and
   removes them as before, and right after drawing the real list is put back.
   Only plain particles join (the shared glow picture, no turn, standard centre, normal or glowing blend); anything else
   is drawn as before. ?noptb in the address turns it off.
   ===================================================================================================== */
const PTB={on:!/[?&]noptb(?:[&=]|$)/.test(location.search),B:null,n:0,up:0,fr:0,ok:null,mv:new THREE.Matrix4(),sp:null,inR:0,att:0,pool:[],mats:null,L:[]};
const _ptbOBC=THREE.Material.prototype.onBeforeCompile,_ptbOBR=THREE.Object3D.prototype.onBeforeRender;
function ptbMat(add){return new THREE.ShaderMaterial({uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{map:{value:GLOW}}]),
 vertexShader:'attribute vec3 iMv;\nattribute vec2 iSc;\nattribute vec4 iCol;\nvarying vec2 vUv;\nvarying vec4 vCol;\n#include <common>\n#include <fog_pars_vertex>\nvoid main() {\n\tvUv = uv;\n\tvCol = iCol;\n\tvec4 mvPosition = vec4( iMv, 1.0 );\n\tvec2 alignedPosition = position.xy * iSc;\n\tmvPosition.xy += alignedPosition;\n\tgl_Position = projectionMatrix * mvPosition;\n\t#include <fog_vertex>\n}',
 fragmentShader:'uniform sampler2D map;\nvarying vec2 vUv;\nvarying vec4 vCol;\n#include <common>\n#include <fog_pars_fragment>\nvoid main() {\n\tvec3 outgoingLight = vec3( 0.0 );\n\tvec4 diffuseColor = vCol;\n\tvec4 texelColor = texture2D( map, vUv );\n\tdiffuseColor *= texelColor;\n\toutgoingLight = diffuseColor.rgb;\n\tgl_FragColor = vec4( outgoingLight, diffuseColor.a );\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n\t#include <fog_fragment>\n}',
 transparent:true,depthWrite:false,depthTest:true,fog:true,blending:add?THREE.AdditiveBlending:THREE.NormalBlending})}
/* one shape: the four corners of three's sprite, drawn once per puff */
function ptbBatch(){const g=new THREE.InstancedBufferGeometry();
 g.setIndex([0,1,2,0,2,3]);g.setAttribute('position',new THREE.Float32BufferAttribute([-.5,-.5,0,.5,-.5,0,.5,.5,0,-.5,.5,0],3));g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,1,1,0,1],2));
 const B={g,cap:0,mesh:new THREE.Mesh(g,PTB.mats[0])};B.mesh.frustumCulled=false;B.mesh.__ptb=1;B.mesh.raycast=()=>{};ptbGrow(B,64);return B}
function ptbGrow(B,n){let c=B.cap||64;while(c<n)c*=2;if(c===B.cap)return;B.cap=c;const g=B.g;
 for(const[k,s]of[['iMv',3],['iSc',2],['iCol',4]]){const a=new THREE.InstancedBufferAttribute(new Float32Array(c*s),s);a.setUsage(THREE.DynamicDrawUsage);g.setAttribute(k,a)}}
/* a sprite that can be drawn this way: exactly what the effects code makes (vfxMat), straight in the scene */
function ptbOK(o){if(!o.isSprite||!o.visible||o.parent!==S||o.renderOrder!==0||o.onBeforeRender!==_ptbOBR||!o.layers.test(C.layers))return false;
 const m=o.material;if(!m||!m.isSpriteMaterial||m.map!==GLOW||m.alphaMap||m.rotation!==0||!m.sizeAttenuation||!m.transparent||m.depthWrite||!m.depthTest||!m.fog||!m.toneMapped||m.alphaTest!==0||!m.visible||m.onBeforeCompile!==_ptbOBC||m.premultipliedAlpha||m.clippingPlanes&&m.clippingPlanes.length||m.colorWrite===false||m.polygonOffset)return false;
 if(m.blending!==THREE.NormalBlending&&m.blending!==THREE.AdditiveBlending)return false;if(o.center.x!==.5||o.center.y!==.5)return false;return true}
/* the picture must be drawn the way three would: linear, not turned or moved */
function ptbReady(){if(PTB.ok!==null)return PTB.ok;try{const t=GLOW;if(t.matrixAutoUpdate)t.updateMatrix();const e=t.matrix.elements,I=[1,0,0,0,1,0,0,0,1];PTB.ok=t.encoding===THREE.LinearEncoding&&I.every((v,k)=>e[k]===v)}catch(x){PTB.ok=false}return PTB.ok}
const _ptbSort=(a,b)=>a.z!==b.z?a.z-b.z:a.id-b.id;
/* inside the drawing, right after the positions are worked out: each puff seen from the camera, farthest first.
   Puffs are drawn in runs of the same blend in that order (a normal puff behind a glowing one stays behind it) */
function ptbFill(){const cam=C;if(cam.parent===null)cam.updateMatrixWorld();const mv=PTB.mv,ci=cam.matrixWorldInverse,L=PTB.L;L.length=0;
 for(const o of PTB.sp){if(o.matrixAutoUpdate)o.updateMatrix();o.matrixWorld.multiplyMatrices(S.matrixWorld,o.matrix);o.matrixWorldNeedsUpdate=false;
  mv.multiplyMatrices(ci,o.matrixWorld);const e=mv.elements,w=o.matrixWorld.elements;
  L.push({o,z:e[14],id:o.id,x:e[12],y:e[13],sx:Math.hypot(w[0],w[1],w[2]),sy:Math.hypot(w[4],w[5],w[6]),add:o.material.blending===THREE.AdditiveBlending?1:0})}
 L.sort(_ptbSort);let i=0,run=0;
 while(i<L.length){const add=L[i].add;let j=i;while(j<L.length&&L[j].add===add)j++;
  const B=PTB.pool[run]||(PTB.pool[run]=ptbBatch());run++;const n=j-i;ptbGrow(B,n);
  const A=B.g.attributes,p=A.iMv.array,s=A.iSc.array,c=A.iCol.array;
  for(let k=0;k<n;k++){const r=L[i+k],m=r.o.material,cl=m.color;p[k*3]=r.x;p[k*3+1]=r.y;p[k*3+2]=r.z;s[k*2]=r.sx;s[k*2+1]=r.sy;c[k*4]=cl.r;c[k*4+1]=cl.g;c[k*4+2]=cl.b;c[k*4+3]=m.opacity}
  for(const k of['iMv','iSc','iCol']){const a=A[k];a.updateRange.offset=0;a.updateRange.count=n*a.itemSize;a.needsUpdate=true}
  B.g.instanceCount=n;
  /* (placed at its farthest puff, so the runs keep their order, and sit among other see-through things about where they are) */
  const m=B.mesh;m.material=PTB.mats[add];const w=L[i].o.matrixWorld.elements;m.position.set(w[12],w[13],w[14]);m.updateMatrix();m.matrixWorld.multiplyMatrices(S.matrixWorld,m.matrix);m.parent=S;S.children.push(m);PTB.att++;
  i=j}}
{const u0=S.updateMatrixWorld;S.updateMatrixWorld=function(){const r=u0.apply(this,arguments);if(PTB.inR===1){PTB.inR=2;try{ptbFill()}catch(e){conLog('error','dust and sparks: '+e.message)}}return r}}
{const r0=R.render;R.render=function(sc,cam){
 if(!PTB.on||sc!==S||cam!==C||PTB.inR||S.autoUpdate===false||!ptbReady())return r0.apply(this,arguments);
 const t0=performance.now(),ch=S.children;let any=false;for(let i=0;i<ch.length;i++){const o=ch[i];if(o.isSprite&&ptbOK(o)){any=true;break}}
 if(!any){PTB.n=0;return r0.apply(this,arguments)}
 if(!PTB.mats)PTB.mats=[ptbMat(false),ptbMat(true)];
 /* the scene's list without the puffs (they are drawn by the two shapes instead) */
 const F=[],sp=PTB.sp=[];for(const o of ch)(o.isSprite&&ptbOK(o)?sp:F).push(o);
 const orig=ch,fl=F.length;S.children=F;PTB.n=sp.length;PTB.att=0;PTB.inR=1;const t1=performance.now();
 try{return r0.apply(this,arguments)}
 finally{const t2=performance.now(),a=S.children;PTB.inR=0;
  /* the real list back; anything added while drawing goes into it too */
  if(a!==F||a.length!==fl+PTB.att){for(const x of a)if(!x.__ptb&&!orig.includes(x))orig.push(x)}
  S.children=orig;for(const B of PTB.pool)B.mesh.parent=null;PTB.sp=null;
  const d=(t1-t0)+(performance.now()-t2);PTB.up+=d;PTB.fr++;if(typeof LAG!='undefined'&&LAG.open){LAG.sys.ptb=(LAG.sys.ptb||0)+d;LAG.cur.ptb=(LAG.cur.ptb||0)+d}}}}
/* the lag window: own time, and a draw-call kind */
LAGSYS.push(['ptb','Dust and sparks drawn together (upkeep)']);
{const lc=lagCats;lagCats=function(q){const r=lc.apply(this,arguments);if(r&&r.cat){const c0=r.cat;r.cat=o=>o&&o.__ptb?'dust and sparks (drawn together)':c0(o)}return r}}

/* =====================================================================================================
   r674 part 2: INSTANCED SCENERY CULLED PROPERLY.
   About 20 desert shapes are drawn many times over in one go (rows of barriers, posts, panels...). three r128 judges
   whether such a shape is in view from one copy only, so r606 made them always drawn, even far behind you.
   Now each is checked against the view with a ball around all its copies (worked out again when the copies change)
   and left out of that drawing when it is wholly behind you or past the fog. ?noimc turns it off.
   ===================================================================================================== */
const IMC={on:!/[?&]noimc(?:[&=]|$)/.test(location.search),L:null,q:null,sw:[],F:new THREE.Frustum(),M:new THREE.Matrix4(),S:new THREE.Sphere(),n:0};
function imcList(q){const L=[];q.g.traverse(o=>{if(o.isInstancedMesh&&!o.frustumCulled&&o.userData&&o.userData.noChunk)L.push({o,v:-1,c:-1,s:new THREE.Sphere()})});return L}
/* a ball (in the shape's own space) around every copy */
function imcBall(e){const o=e.o,g=o.geometry;if(!g.boundingSphere)g.computeBoundingSphere();const bs=g.boundingSphere,n=o.count,M=IMC.M,v=new THREE.Vector3(),C2=[],R2=[];const bx=new THREE.Box3();
 for(let i=0;i<n;i++){o.getMatrixAt(i,M);v.copy(bs.center).applyMatrix4(M);const r=bs.radius*M.getMaxScaleOnAxis();C2.push(v.clone());R2.push(r);bx.expandByPoint(v.clone().addScalar(-r));bx.expandByPoint(v.clone().addScalar(r))}
 if(!n||!isFinite(bs.radius)){e.s.radius=-1;return}bx.getCenter(e.s.center);let rr=0;for(let i=0;i<n;i++)rr=Math.max(rr,C2[i].distanceTo(e.s.center)+R2[i]);e.s.radius=rr;e.v=o.instanceMatrix.version;e.c=n}
{const r0=R.render;R.render=function(sc,cam){const q=BUS&&BUS.ride;
 if(!IMC.on||sc!==S||cam!==C||!q||!q.g||!q.g.visible||!q.imFix||cam.parent!==null)return r0.apply(this,arguments);
 if(IMC.q!==q){IMC.q=q;IMC.L=imcList(q)}
 const sw=IMC.sw;sw.length=0;
 try{cam.updateMatrixWorld();IMC.M.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse);IMC.F.setFromProjectionMatrix(IMC.M);
  let far=1e9;try{if(S.fog&&S.fog.far)far=S.fog.far+30}catch(e){}
  for(const e of IMC.L){const o=e.o;if(!o.visible||o.parent==null)continue;if(e.v!==o.instanceMatrix.version||e.c!==o.count)imcBall(e);if(e.s.radius<0)continue;
   const s=IMC.S.copy(e.s).applyMatrix4(o.matrixWorld);const d=s.center.distanceTo(cam.position)-s.radius;
   if(d>far||!IMC.F.intersectsSphere(s)){o.visible=false;sw.push(o)}}}catch(x){for(const o of sw)o.visible=true;sw.length=0}
 IMC.n=sw.length;
 try{return r0.apply(this,arguments)}finally{for(const o of sw)o.visible=true;sw.length=0}}}

/* =====================================================================================================
   r674 part 3: ONE-PIECE BATCHES (the build.py block 'r674 one-piece batches' asks this).
   A piece whose look is the only one of its kind in its place could not be batched, so it was drawn on its own
   (300 to 600 such draws in the Benchmark views). Such a piece now gets a batch of one when the scenery area batches can
   take it (plain or cut-out, one of the usual material kinds, a small canvas picture or none, not part of a vehicle).
   The batching watchdog then looks after it within its usual time budget, and the area batches join it with its
   neighbours. ?noone1 turns it off.
   ===================================================================================================== */
const ONE={on:!/[?&]noone1(?:[&=]|$)/.test(location.search),/* r675: vehicles' lone parts too; ?noone1v leaves vehicles out */v:!/[?&]noone1v(?:[&=]|$)/.test(location.search),n:0,veh:null,vq:null,cur:false};
/* a picture drawn as it is (not moved, repeated or turned) */
function dpTexId(t){if(!t)return false;if(t.matrixAutoUpdate)return t.offset.x===0&&t.offset.y===0&&t.repeat.x===1&&t.repeat.y===1&&t.rotation===0;const e=t.matrix.elements;return e[0]===1&&e[1]===0&&e[2]===0&&e[3]===0&&e[4]===1&&e[5]===0&&e[6]===0&&e[7]===0&&e[8]===1}
/* (a plain function: the r500 block that holds DP comes later in the page than this module) */
function dpOneOK(o,root,made){if(!ONE.on||typeof ABT=='undefined'||!ABT.on)return false;const q=BUS&&BUS.ride;if(!q||!q.g)return false;
 const m=o.material;if(!m||Array.isArray(m)||m.transparent||o.renderOrder!==0)return false;const t=m.type;if(t!=='MeshStandardMaterial'&&t!=='MeshLambertMaterial'&&t!=='MeshBasicMaterial')return false;
 if(m.map&&!abtTexKey(m.map,true))return false;if(m.userData&&m.userData.dpSand)return false;
 if(ONE.vq!==q||!ONE.veh||ONE.veh.size!==(q.vehs||[]).length){ONE.vq=q;ONE.veh=new Set((q.vehs||[]).map(v=>v&&v.m).filter(Boolean))}
 if(!ONE.v)for(let p=root;p&&p!==q.g;p=p.parent)if(p.__mwKeep||ONE.veh.has(p))return false;
 if(made){ONE.n++;ONE.cur=true}return true}

/* =====================================================================================================
   r674 part 4: LOOSE PIECES BATCHED LATE.
   The desert's batching (r500) looks at the pieces lying straight in the desert (not inside a place's group) once, while
   loading. Most later-built places put many of their pieces there too (signs, posts, rails, crates...), so those were
   never batched and were drawn one by one (about 250 draws in the Fort view).
   Now such a piece that has sat exactly the same for 6 s is batched like the rest (with others of its look, or alone
   when it is the only one: part 3), a few hundred at a time, and the batching watchdog looks after it from then on.
   ?nolate1 turns it off.
   ===================================================================================================== */
const LATE1={on:!/[?&]nolate1(?:[&=]|$)/.test(location.search),q:null,seen:new Map(),t:0,n:0,b:0,ms:0,MAX:40,more:false};
function late1FP(o){const e=o.matrixWorld.elements,m=o.material;return e[0]+'|'+e[1]+'|'+e[2]+'|'+e[5]+'|'+e[10]+'|'+e[12]+'|'+e[13]+'|'+e[14]+'|'+o.visible+'|'+o.layers.mask+'|'+(m&&m.id)+'|'+(o.geometry&&o.geometry.id)+'|'+(m&&m.color?m.color.getHex():'')+'|'+(m&&m.opacity)}
function late1Tick(q){const D=q.dp;if(!D||!D.merged||typeof DP=='undefined'||!DP._mergeRoot)return;const now=performance.now();if(now-LATE1.t<(LATE1.more?1500:3000))return;LATE1.t=now;LATE1.more=false;const t0=now;
 if(LATE1.q!==q){LATE1.q=q;LATE1.seen=new Map()}
 const veh=new Set((q.vehs||[]).map(v=>v&&v.m)),ok=[],seen=LATE1.seen;
 for(const o of q.g.children){if(!o.isMesh||o.isSprite||o.isInstancedMesh||o.isSkinnedMesh||o.children.length||veh.has(o)||!o.visible)continue;const u=o.userData||{};
  if(u.dpMerged||u.dpKeep||u.dpDyn||u.mv||u.chunk||u.fsc||u.skn||u.flv||u.late1)continue;const mk=o.layers.mask;if(mk!==1&&mk!==(1<<PL_FAR))continue;
  if(o.onBeforeRender!==_ptbOBR||o.updateMatrixWorld!==_mwP||o.__mwKeep)continue;
  const fp=late1FP(o),c=seen.get(o);if(!c||c.fp!==fp){seen.set(o,{fp,t:now});continue}if(now-c.t<6000)continue;ok.push(o);if(ok.length>=LATE1.MAX){LATE1.more=true;break}}
 if(!ok.length)return;
 /* one shallow pass over the desert's own pieces that sees only these (the others are flagged to be left alone just for it) */
 const want=new Set(ok),tmp=[];for(const o of q.g.children){if(o.isMesh&&!want.has(o)&&!(o.userData&&o.userData.dpKeep)){(o.userData||(o.userData={})).dpKeep=1;tmp.push(o)}}
 /* (the batcher starts by working out the positions of everything under the group it is given, here the whole desert:
    only these pieces and the desert group itself are brought up to date instead, then that step is skipped) */
 const g=q.g,own=Object.prototype.hasOwnProperty.call(g,'updateMatrixWorld'),u0=g.updateMatrixWorld;
 try{if(typeof mwFresh=='function'){mwFresh(g);for(const o of ok)mwFresh(o)}else{g.updateWorldMatrix(true,false);for(const o of ok)o.updateWorldMatrix(false,false)}}catch(e){}
 let k=[0,0];g.updateMatrixWorld=function(){};try{k=DP._mergeRoot(q,g,DP.cfg().lam,true)}catch(e){conLog('error','late loose batching: '+e.message)}finally{if(own)g.updateMatrixWorld=u0;else delete g.updateMatrixWorld;for(const o of tmp)delete o.userData.dpKeep}
 for(const o of ok){o.userData.late1=1;seen.delete(o)}if(q.g.userData.dpRecs&&q.g.userData.dpRecs.length&&D.roots&&!D.roots.includes(q.g))D.roots.push(q.g);
 LATE1.n+=ok.length;LATE1.b+=k[0];LATE1.ms+=performance.now()-t0}
{const ru=busRoamUpd;busRoamUpd=function(q,dt){const r=ru.apply(this,arguments);try{if(LATE1.on&&q&&q.g&&q.roam)late1Tick(q)}catch(e){conLog('error','late loose batching: '+e.message);LATE1.on=false}return r}}

/* =====================================================================================================
   r675: ANIMATIONS FAR AWAY.
   Most moving things in the desert already only move while you are near them. A few ran all the time wherever you were:
   - the motel TVs' static and the drive-in screen were redrawn and sent to the graphics card many times a second.
     They now stop while you are too far to see them (60 m for the little TVs, 300 m for the big screen);
   - the prison (searchlights, guards on their rounds, cameras, fans, doors) is game logic too, so it keeps running, but
     while you are far beyond the fog and no prison break is on, it is worked out every 6th frame with the time added up
     (guards still stop exactly at each corner of their rounds, lights still sweep in step).
   Everything that can be seen from a distance keeps moving as before. ?noanf turns this off.
   ===================================================================================================== */
const ANF={on:!/[?&]noanf(?:[&=]|$)/.test(location.search),pdt:0,pn:0};
function tvsNear(q){if(!ANF.on||!q||!q.tvs||!q.tvs.length)return true;const lz=P.z-q.OZ;for(const t of q.tvs)if(Math.abs(P.x-t.x)<60&&Math.abs(lz-t.z)<60)return true;return false}
{const pa=penAnim;penAnim=function(q,dt){
 if(!ANF.on||!q||!q.penW||(q.pen&&q.pen.on))return ANF.pdt?(dt+=ANF.pdt,ANF.pdt=0,pa(q,dt)):pa(q,dt);
 /* how far is the prison (its searchlights' rounds give its middle) */
 const W=q.penW;if(W.__c==null){let sx=0,sz=0,n=0;for(const L of W.lights||[])for(const p of L.path||[]){sx+=p[0];sz+=p[1];n++}W.__c=n&&isFinite(sx/n)&&isFinite(sz/n)?[sx/n,sz/n]:[-460,-768]}
 let far=1e9;try{if(S.fog&&S.fog.far)far=S.fog.far}catch(e){}
 const d=Math.hypot(P.x-W.__c[0],P.z-q.OZ-W.__c[1]);
 if(!(d>=far+250))return ANF.pdt?(dt+=ANF.pdt,ANF.pdt=0,pa(q,dt)):pa(q,dt);
 ANF.pdt+=dt;if(++ANF.pn<6)return;ANF.pn=0;const t=ANF.pdt;ANF.pdt=0;return pa(q,t)}}

/* =====================================================================================================
   r675: PIECES WITH SEVERAL MATERIALS, AND PIECES WITH PER-CORNER COLOURS, BATCHED.
   The batching (r500) could only take a piece with one material and no per-corner colours. Two kinds were left drawn
   one by one (crates and boxes with a different picture per side, signs, many vehicle parts...):
   - a piece with several materials is handed to the batching as one stand-in per material, each pointing at its part of
     the piece's shape and following the real piece in everything else (place, visibility, being moved). It only joins
     when every part can be batched (so nothing can go missing), and when one part changes the piece is drawn itself again;
   - a piece with per-corner colours has them multiplied into the batch's own colours, and the watchdog keeps an eye on them.
   ?nodpx turns both off (?nodpxm only the several-materials part, ?nodpxc only the colours).
   ===================================================================================================== */
const DPX={on:!/[?&]nodpx(?:[&=]|$)/.test(location.search),multi:!/[?&]nodpxm(?:[&=]|$)/.test(location.search),vc:!/[?&]nodpxc(?:[&=]|$)/.test(location.search),subs:new WeakMap(),nm:0,nv:0};
const _dpxM=new THREE.Matrix4();
/* the parts of a shape, one per material: the same corners, only that part's triangles */
function dpxSubs(g){let S2=DPX.subs.get(g);if(S2!==undefined)return S2;S2=null;try{const G=g.groups,A=g.attributes,n=A.position.count,L=[];
 for(const gr of G){const cnt=g.index?Math.min(gr.count,g.index.count-gr.start):Math.min(gr.count,n-gr.start);if(!(cnt>0)||!(gr.start>=0)){L.length=0;break}
  const s=new THREE.BufferGeometry();for(const k in A)s.setAttribute(k,A[k]);let ix;
  if(g.index){const src=g.index.array;ix=(n>65535?new Uint32Array(cnt):new Uint16Array(cnt));for(let i=0;i<cnt;i++)ix[i]=src[gr.start+i]}
  else{ix=(n>65535?new Uint32Array(cnt):new Uint16Array(cnt));for(let i=0;i<cnt;i++)ix[i]=gr.start+i}
  s.setIndex(new THREE.BufferAttribute(ix,1));L.push(s)}
 if(L.length===G.length)S2=L}catch(e){S2=null}DPX.subs.set(g,S2);return S2}
/* a stand-in for one material of a piece: everything else comes from the real piece */
function dpxProxy(real,i,mi,sub){const g0=real.geometry,p=Object.create(real);
 Object.defineProperty(p,'material',{configurable:true,get(){const a=real.material;return Array.isArray(a)?a[mi]:a}});
 Object.defineProperty(p,'geometry',{configurable:true,get(){return real.geometry===g0?sub:real.geometry}});
 p.__dpR=real;p.__dpG=i;return p}
/* called by the batching for each piece it looks at: true = dealt with here (taken, or left out) */
function dpxConsider(ch,lam,inv,groups,mk,root){const m=ch.material;
 if(Array.isArray(m)){if(!DPX.multi)return false;const g=ch.geometry,G=g.groups;if(!G||!G.length||G.length>16)return true;
  _dpxM.multiplyMatrices(inv,ch.matrixWorld);if(_dpxM.determinant()<=0)return true;
  const subs=dpxSubs(g);if(!subs)return true;const px=[];
  for(let i=0;i<G.length;i++){const mt=m[G[i].materialIndex];if(!mt||mt.vertexColors)return true;const k=mk(mt,lam);if(!k)return true;const p=dpxProxy(ch,i,G[i].materialIndex,subs[i]);if(!dpOneOK(p,root))return true;px.push([k,p])}
  for(const[k,p]of px){let L=groups.get(k);if(!L)groups.set(k,L=[]);L.push(p)}DPX.nm++;return true}
 if(m&&m.vertexColors){if(!DPX.vc)return false;const c=ch.geometry.attributes.color;if(!c||c.itemSize!==3||c.normalized||c.isInterleavedBufferAttribute||!(c.array instanceof Float32Array))return true;
  const v0=m.vertexColors;let k=null;m.vertexColors=false;try{k=mk(m,lam)}finally{m.vertexColors=v0}if(!k)return true;
  _dpxM.multiplyMatrices(inv,ch.matrixWorld);if(_dpxM.determinant()<=0)return true;let L=groups.get(k);if(!L)groups.set(k,L=[]);L.push(ch);DPX.nv++;return true}
 return false}

/* =====================================================================================================
   r681: PARKED VEHICLES' FIXED PARTS WORKED OUT EVERY 8TH FRAME.
   Every frame the position update visited every shown part of every vehicle (about 6,000 visits at the Fort, most of
   all visits), though most vehicles are parked and their parts do not move. Now, for a vehicle nobody is in, that is not
   moving and not wrecked: the vehicle itself and its moving parts (wheels, rotors, turrets, radar... the parts the
   vehicle code turns) every frame, its fixed parts every 8th frame. Whenever the vehicle itself moves, everything is
   worked out that frame. A parked vehicle whose fixed parts turn out to change anyway (an animation this does not know
   about) is always worked out in full from then on. Things that read a position (rays, the batching watchdog) still
   get it fresh. ?novpw turns it off.
   ===================================================================================================== */
const VPW={on:!/[?&]novpw(?:[&=]|$)/.test(location.search),map:new WeakMap(),n:-1,q:null,lively:new WeakSet(),skip:0,full:0,t:0};
function vpwVeh(o){const q=BUS&&BUS.ride;if(!q||!q.vehs)return null;if(VPW.q!==q||VPW.n!==q.vehs.length||(MWC.f-VPW.t)>120){VPW.q=q;VPW.n=q.vehs.length;VPW.t=MWC.f;VPW.map=new WeakMap();for(const v of q.vehs)if(v&&v.m)VPW.map.set(v.m,v)}return VPW.map.get(o)||null}
/* the moving parts, outermost first, each with the moving parts it sits inside (a barrel inside its turret) */
function vpwParts(o){if(o.__vpm&&o.__vpmN===o.children.length&&(MWC.f-o.__vpmT)<600)return o.__vpm;let L=[];try{L=typeof vbParts=='function'?[...vbParts(o).keys()]:[]}catch(e){L=[]}
 const S2=new Set(L),dep=p=>{let d=0;for(let a=p.parent;a&&a!==o;a=a.parent)d++;return d};L=L.filter(p=>{let a=p;while(a&&a!==o)a=a.parent;return a===o});
 for(const p of L){p.__vpu=[];for(let a=p.parent;a&&a!==o;a=a.parent)if(S2.has(a))p.__vpu.push(a)}L.sort((x,y)=>dep(x)-dep(y));
 o.__vpm=L;o.__vpmS=new Set(L.filter(p=>!p.__vpu.length));o.__vpmN=o.children.length;o.__vpmT=MWC.f;return L}
/* the same visit as the vehicle walk (r653), leaving the moving parts for later and noting whether a fixed part changed */
function vpwWalk(o,force,st,mv){const ch=o.children;for(let i=0,l=ch.length;i<l;i++){const c=ch[i];
  if(c.updateMatrixWorld!==_mwP){c.updateMatrixWorld(force);continue}
  if(mv&&mv.has(c)){st.later.push(c);continue}
  if(!c.visible){c.__mwSk=MWX.fr;MWV.skipped++;continue}
  if((c.layers.mask===4||(MWX.far&&c.layers.mask===64))&&c.isMesh&&!c.isSprite&&!c.children.length){MWV.skipped++;continue}
  const f=mwSelf(c,force);if(f&&!force)st.ch=true;vpwWalk(c,f,st,mv)}}
{const f0=mwFull;mwFull=function(o,force){if(!VPW.on||!o.__mwKeep||!MWC.on||!MWV.on||typeof abtParked!='function')return f0(o,force);
 const v=vpwVeh(o);if(!v||VPW.lively.has(o)||!abtParked(v))return f0(o,force);
 const rc=mwSelf(o,force),mv=vpwParts(o),MS=o.__vpmS;
 if(rc||!o.__vpw||((MWC.f+o.id)&7)===0){/* in full: the fixed parts branch by branch (noting which ones changed), then the moving ones */o.__vpw=1;VPW.full++;const st={ch:false,later:[]};
  const LV=o.__vpl||(o.__vpl=new Set());if(!rc)LV.clear();const och=o.children;
  for(let i=0,l=och.length;i<l;i++){const c=och[i];if(c.updateMatrixWorld!==_mwP){c.updateMatrixWorld(rc);continue}if(MS.has(c)){st.later.push(c);continue}if(!c.visible){c.__mwSk=MWX.fr;continue}
   if((c.layers.mask===4||(MWX.far&&c.layers.mask===64))&&c.isMesh&&!c.isSprite&&!c.children.length)continue;
   const s2={ch:false,later:st.later},f=mwSelf(c,rc);if(f&&!rc)s2.ch=true;vpwWalk(c,f,s2,MS);if(s2.ch&&!rc)LV.add(c)}
  /* (a vehicle with changes in many branches is simply always worked out in full) */if(LV.size>6)VPW.lively.add(o);for(const p of st.later){if(!p.visible){p.__mwSk=MWX.fr;continue}const f=mwSelf(p,rc);vpwWalk(p,f,{ch:false,later:[]},null)}return}
 /* in between: only the moving parts, outermost first: one that turned has everything inside it worked out; one that did
    not only has the moving parts inside it looked at (their fixed parents have not moved) */VPW.skip++;const fr=MWC.f;
 for(const p of mv){if(!p.parent||!p.visible)continue;let skip=false;for(const a of p.__vpu)if(a.__vpd===fr){skip=true;break}if(skip)continue;
  let ok=true;for(let a=p.parent;a&&a!==o;a=a.parent)if(!a.visible){ok=false;break}if(!ok)continue;
  const f=mwSelf(p,false);if(f){p.__vpd=fr;vpwWalk(p,true,{ch:false,later:[]},null)}}
 /* and the branches where something changed by itself last time */if(o.__vpl)for(const c of o.__vpl){if(!c.parent||!c.visible)continue;const f=mwSelf(c,false);vpwWalk(c,f,{ch:false,later:[]},MS)}}}
