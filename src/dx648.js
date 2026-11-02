/* =====================================================================================================
   r667: DESERT PERFORMANCE: SCENERY AREA BATCHES (fewer draw calls).
   The scenery is already drawn in batches (r500), one per material kind in each place, so a typical view still has
   hundreds of batches, each its own draw call. Most differ only in glow, roughness or metal, or in which picture
   they use. Now, in each 144 m square, batches that differ only in those are drawn together as one "area batch":
   - glow, roughness and metal are stored with each corner (per vertex) instead of once per material;
   - pictures of the same size and settings sit in one texture array, copied pixel for pixel (no resizing);
   - each original batch still decides for itself whether it is drawn: a tiny table per area batch hides its part
     whenever the original would not be drawn (hidden place, culled cell, far details...), checked every frame;
   - if an original batch changes or moves, it draws itself again straight away and the area batch is made again
     a little later.
   Area batches only exist while the main view is drawn, so rays, other cameras and the game code never see them.
   Only batches within 450 m are joined; see-through, sand, very large pictures and special shaders stay as they are.
   Once an area batch has been drawn, the originals' copies on the graphics card are freed (they are sent again if
   an original ever has to draw itself), so memory stays about the same.
   ?noabt in the address turns it off.
   ===================================================================================================== */
const ABT={on:!/[?&]noabt(?:[&=]|$)/.test(location.search),AREA:144,MAXM:250,MAXV:120000,NEAR:450,FAR:700,TEXMB:170,free:true,
 q:null,B:[],mem:new Map(),arrs:new Map(),texMB:0,users:new Map(),scan:null,scanT:-1e9,job:null,queue:[],fr:0,ps:[],sw:[],att:[],
 st:{batches:0,drawn:0,members:0,fb:0,builds:0,built:0,drawnMembers:0},up:0,act:false,ok:null,force:false,why:{},lively:new WeakSet(),dirty:false,warmQ:[]};
function abtSame(a,b){for(let i=0;i<16;i++)if(a[i]!==b[i])return false;return true}
const _abM=new THREE.Matrix4(),_abN=new THREE.Matrix3(),_abV=new THREE.Vector3(),_abF=new THREE.Frustum(),_abP=new THREE.Matrix4(),_abS=new THREE.Sphere();
/* which merged batches can be joined, and with what (null = stays as it is) */
function abtTexKey(t){const im=t.image;if(!im||!(im.width>0)||!(im.height>0))return null;if(!(typeof HTMLCanvasElement!='undefined'&&im instanceof HTMLCanvasElement))return null;
 if(im.width*im.height>512*720||t.encoding!==THREE.LinearEncoding||t.format!==THREE.RGBAFormat||t.type!==THREE.UnsignedByteType||t.premultiplyAlpha)return null;
 if(t.matrixAutoUpdate||!t.matrix.equals(_abI3))return null;
 return im.width+'x'+im.height+'/'+t.wrapS+'/'+t.wrapT+'/'+t.magFilter+'/'+t.minFilter+'/'+t.anisotropy+'/'+(t.flipY?1:0)+'/'+(t.generateMipmaps?1:0)}
const _abI3=new THREE.Matrix3();
function abtKey(o){const m=o.material,g=o.geometry;if(!m||Array.isArray(m)||!g||!g.isBufferGeometry)return null;const t=m.type;
 if(t!=='MeshLambertMaterial'&&t!=='MeshStandardMaterial'&&t!=='MeshBasicMaterial')return null;
 if(m.transparent||m.onBeforeCompile!==THREE.Material.prototype.onBeforeCompile||(m.userData&&m.userData.dpSand)||!m.visible||m.wireframe||m.envMap||m.lightMap||m.aoMap||m.emissiveMap||m.alphaMap||m.normalMap||m.bumpMap||m.roughnessMap||m.metalnessMap||m.displacementMap||m.specularMap||!m.vertexColors)return null;
 if(m.color&&m.color.getHex()!==0xffffff)return null;
 const A=g.attributes;if(!A.position||!A.normal||!A.color||A.position.itemSize!==3||A.normal.itemSize!==3||(g.morphAttributes&&Object.keys(g.morphAttributes).length)||(g.groups&&g.groups.length>1))return null;
 if(A.position.isInterleavedBufferAttribute||A.normal.isInterleavedBufferAttribute||A.color.isInterleavedBufferAttribute)return null;
 let tk='';if(m.map){if(!A.uv||A.uv.itemSize!==2||A.uv.isInterleavedBufferAttribute)return null;tk=abtTexKey(m.map);if(!tk)return null}
 return t+'|'+tk+'|'+m.side+'|'+m.alphaTest+(m.alphaTest>0?'/'+m.opacity:'')+'|'+(m.depthWrite?1:0)+(m.depthTest?1:0)+(m.fog?1:0)+(m.flatShading?1:0)+(m.dithering?1:0)+(m.toneMapped?1:0)+(m.colorWrite?1:0)+(m.premultipliedAlpha?1:0)+'|'+m.blending+'|'+m.depthFunc+'|'+(m.polygonOffset?m.polygonOffsetFactor+'/'+m.polygonOffsetUnits:'')+'|'+A.color.itemSize}
/* ---------- looking through the desert (a little each frame) ---------- */
function abtScanStep(q,ms){const t0=performance.now();let J=ABT.scan;
 if(!J){const veh=new Set();for(const v of q.vehs||[])if(v&&v.m)veh.add(v.m);const skip=new Set([q.sky,q.sun,q.zsky,q.zstar,q.bg,BUS._sky,BUS._sun,typeof SKN!='undefined'?SKN.g:null].filter(Boolean));
  for(const o of (q.dp&&q.dp.movers)||[])if(o&&o.isObject3D)skip.add(o);
  J=ABT.scan={st:[q.g],veh,skip,G:new Map(),users:new Map(),tex:new Map(),lights:[],inv:new THREE.Matrix4().copy(q.g.matrixWorld).invert()}}
 while(J.st.length){const o=J.st.pop();
  for(const c of o.children){if(c.isLight){J.lights.push(c);continue}const u=c.userData||{};if(J.veh.has(c)||J.skip.has(c)||c.__mwKeep||u.dpKeep||u.dpDyn||u.mv||u.flv||u.fsc||u.skn||c.updateMatrixWorld!==_mwP)continue;
   if(c.isMesh&&u.dpMerged&&c.children.length===0){const m=c.material;if(m&&m.map)J.users.set(m.map,(J.users.get(m.map)||0)+1);
    if(c.isSkinnedMesh||c.isInstancedMesh||c.onBeforeRender!==_abOBR||ABT.lively.has(c))continue;const k=abtKey(c);if(!k)continue;
    const g=c.geometry;if(!g.boundingSphere)g.computeBoundingSphere();_abV.copy(g.boundingSphere.center).applyMatrix4(c.matrixWorld).applyMatrix4(J.inv);
    const ax=Math.floor(_abV.x/ABT.AREA),az=Math.floor(_abV.z/ABT.AREA),gk=ax+','+az+'#'+k;let e=J.G.get(gk);if(!e)J.G.set(gk,e={gk,k,ax,az,L:[]});e.L.push(c);
    if(m.map){const tk=k.split('|')[1];let s=J.tex.get(tk);if(!s)J.tex.set(tk,s=new Set());s.add(m.map)}}
   else if(c.children.length)J.st.push(c)}
  if(performance.now()-t0>ms)return false}
 return true}
const _abOBR=THREE.Object3D.prototype.onBeforeRender;
/* what to build or retire once a look is finished */
function abtPlan(q){const J=ABT.scan;ABT.scan=null;ABT.users=J.users;ABT.lights=J.lights;ABT.texSeen=J.tex;_abV.copy(C.position).applyMatrix4(J.inv);const cx=_abV.x,cz=_abV.z,A=ABT.AREA;
 const dist=(ax,az)=>{const x0=ax*A,z0=az*A,dx=Math.max(x0-cx,0,cx-x0-A),dz=Math.max(z0-cz,0,cz-z0-A);return Math.hypot(dx,dz)};
 const want=new Map();for(const e of J.G.values())if(e.L.length>=2&&dist(e.ax,e.az)<=ABT.NEAR){e.L.sort((a,b)=>a.id-b.id);want.set(e.gk,e)}
 /* batches already made: kept while their members are the same and nothing in them changed, else made again */
 const have=new Map();for(const b of ABT.B){let L=have.get(b.gk);if(!L)have.set(b.gk,L=[]);L.push(b)}
 for(const[gk,L]of have){const e=J.G.get(gk);const far=!e||dist(e.ax,e.az)>ABT.FAR;
  if(far){for(const b of L)abtRetire(b);continue}
  const same=L[0].sig===e.L.map(o=>o.id).join(',')&&!L.some(b=>b.dirty);
  if(same)want.delete(gk);else if(!want.has(gk)&&e.L.length<2){for(const b of L)abtRetire(b)}}
 for(const e of want.values())if(!ABT.queue.some(x=>x.gk===e.gk))ABT.queue.push(e);
 for(const b of ABT.B.slice())if(b.dirty&&!want.has(b.gk))abtRetire(b)}
/* ---------- texture arrays: pictures of one size and kind, copied pixel for pixel ---------- */
function abtArr(tk,need){let a=ABT.arrs.get(tk);if(a)return a;const all=ABT.texSeen&&ABT.texSeen.get(tk);const cap=Math.max(need,(all?all.size:0))+4;
 const [wh,ws,wt,mag,min,an,fy,gm]=tk.split('/');const [w,h]=wh.split('x').map(Number);const mb=w*h*4*cap*(+gm?1.34:1)/1048576;
 if(ABT.texMB+mb>ABT.TEXMB||cap>255)return null;
 const tex=new THREE.DataTexture2DArray(null,w,h,cap);tex.format=THREE.RGBAFormat;tex.type=THREE.UnsignedByteType;tex.wrapS=+ws;tex.wrapT=+wt;tex.magFilter=+mag;tex.minFilter=+min;tex.anisotropy=+an;tex.generateMipmaps=!!+gm;tex.flipY=false;tex.unpackAlignment=1;tex.needsUpdate=true;
 R.initTexture(tex);ABT.texMB+=mb;a={tk,tex,w,h,cap,flip:!!+fy,mip:!!+gm,L:new Map(),ver:new Map()};ABT.arrs.set(tk,a);return a}
const _abCv=document.createElement('canvas');
/* one picture into one layer (a new one, or the same one again when the picture was drawn again) */
function abtCopy(a,t,i){const im=t.image;let d;const cx=im.getContext&&im.getContext('2d');if(cx)d=cx.getImageData(0,0,a.w,a.h).data;else{_abCv.width=a.w;_abCv.height=a.h;const c2=_abCv.getContext('2d');c2.clearRect(0,0,a.w,a.h);c2.drawImage(im,0,0);d=c2.getImageData(0,0,a.w,a.h).data}
 let px=new Uint8Array(d.buffer,d.byteOffset,d.length);if(a.flip){const s=px,row=a.w*4;px=new Uint8Array(s.length);for(let y=0;y<a.h;y++)px.set(s.subarray((a.h-1-y)*row,(a.h-y)*row),y*row)}
 const gl=R.getContext(),pr=R.properties.get(a.tex);R.state.bindTexture(gl.TEXTURE_2D_ARRAY,pr.__webglTexture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.pixelStorei(gl.UNPACK_ALIGNMENT,1);
 gl.texSubImage3D(gl.TEXTURE_2D_ARRAY,0,0,0,i,a.w,a.h,1,gl.RGBA,gl.UNSIGNED_BYTE,px);a.ver.set(t,t.version);a.dirty=true}
function abtLayer(a,t){let i=a.L.get(t);if(i!=null)return i;if(a.L.size>=a.cap)return -1;i=a.L.size;abtCopy(a,t,i);a.L.set(t,i);return i}
function abtMips(a){if(!a.dirty)return;a.dirty=false;if(!a.mip)return;const gl=R.getContext(),pr=R.properties.get(a.tex);R.state.bindTexture(gl.TEXTURE_2D_ARRAY,pr.__webglTexture);gl.generateMipmap(gl.TEXTURE_2D_ARRAY)}
/* ---------- the area batch's material: the same kind of material, with glow, roughness, metal and picture per vertex ---------- */
function abtMat(src,arr,vt,n,E,RM){const T=src.type,X=!!arr;
 const base={vertexColors:true,side:src.side,alphaTest:src.alphaTest,opacity:src.opacity,transparent:false,depthWrite:src.depthWrite,depthTest:src.depthTest,fog:src.fog,blending:src.blending,depthFunc:src.depthFunc,polygonOffset:src.polygonOffset,polygonOffsetFactor:src.polygonOffsetFactor,polygonOffsetUnits:src.polygonOffsetUnits,dithering:src.dithering,toneMapped:src.toneMapped,colorWrite:src.colorWrite,premultipliedAlpha:src.premultipliedAlpha};
 let m;if(T==='MeshBasicMaterial')m=new THREE.MeshBasicMaterial(base);else if(T==='MeshLambertMaterial')m=new THREE.MeshLambertMaterial(base);else m=new THREE.MeshStandardMaterial(Object.assign(base,{flatShading:!!src.flatShading,roughness:src.roughness,metalness:src.metalness}));
 if(!E&&T!=='MeshBasicMaterial')m.emissive.setHex(0);
 if(X)m.defines={USE_UV:''};const U={abVis:{value:vt},abN:{value:n},abTex:{value:arr?arr.tex:null}};m.userData.abt=U;
 const rp=(s,a,b)=>{if(s.indexOf(a)<0)throw new Error('shader part missing: '+a);return s.replace(a,b)};
 m.onBeforeCompile=function(sh){sh.uniforms.abVis=U.abVis;sh.uniforms.abN=U.abN;if(X)sh.uniforms.abTex=U.abTex;
  sh.vertexShader=rp(sh.vertexShader,'#include <common>','#include <common>\nattribute float aM;uniform sampler2D abVis;uniform float abN;'+(E?'attribute vec3 aE;varying vec3 vAE;':'')+(RM?'attribute vec2 aRM;varying vec2 vRM;':'')+(X?'attribute float aL;varying float vAL;':''));
  sh.vertexShader=rp(sh.vertexShader,'#include <project_vertex>','#include <project_vertex>\nif(texture2D(abVis,vec2((aM+.5)/abN,.5)).r<.5)gl_Position=vec4(2.,2.,2.,1.);'+(E?'vAE=aE;':'')+(RM?'vRM=aRM;':'')+(X?'vAL=aL;':''));
  sh.fragmentShader=rp(sh.fragmentShader,'#include <common>','#include <common>\n'+(E?'varying vec3 vAE;':'')+(RM?'varying vec2 vRM;':'')+(X?'varying float vAL;uniform mediump sampler2DArray abTex;':''));
  if(X)sh.fragmentShader=rp(sh.fragmentShader,'#include <map_fragment>','diffuseColor*=texture(abTex,vec3(vUv,vAL));');
  if(E)sh.fragmentShader=rp(sh.fragmentShader,'vec3 totalEmissiveRadiance = emissive;','vec3 totalEmissiveRadiance = vAE;');/* (without: the material's own glow, black, and roughness and metal are the members' common ones) */
  if(RM){sh.fragmentShader=rp(sh.fragmentShader,'#include <roughnessmap_fragment>','float roughnessFactor = vRM.x;');sh.fragmentShader=rp(sh.fragmentShader,'#include <metalnessmap_fragment>','float metalnessFactor = vRM.y;')}};
 m.customProgramCacheKey=()=>'abt|'+T+'|'+(X?1:0)+(E?1:0)+(RM?1:0);return m}
/* ---------- making one area batch, a few members per frame ---------- */
function abtStart(q,e){const L=e.L.filter(o=>!ABT.mem.has(o)||ABT.mem.get(o).gk===e.gk);if(L.length<2)return null;
 const chunks=[];let cur=[],nv=0;for(const o of L){const n=o.geometry.attributes.position.count;if(cur.length&&(cur.length>=ABT.MAXM||nv+n>ABT.MAXV)){chunks.push(cur);cur=[];nv=0}cur.push(o);nv+=n}if(cur.length)chunks.push(cur);
 return{e,chunks:chunks.filter(c=>c.length>=2),ci:0,cur:null,done:[],q,sig:e.L.map(o=>o.id).join(',')}}
function abtChunkInit(J,L){const q=J.q;let nv=0,ni=0;for(const o of L){const g=o.geometry;nv+=g.attributes.position.count;ni+=g.index?g.index.count:g.attributes.position.count}
 const src=L[0].material,T=src.type,X=!!src.map,ci=L[0].geometry.attributes.color.itemSize;
 /* the batch's own place: the middle of its area, in the desert group's space */
 const A=ABT.AREA,ox=(J.e.ax+.5)*A,oz=(J.e.az+.5)*A;
 const inv=new THREE.Matrix4().copy(q.g.matrixWorld).invert();
 /* glow per vertex only if some member glows; roughness and metal per vertex only if they differ */
 const glow=T!=='MeshBasicMaterial'&&L.some(o=>{const m=o.material;return m.emissive&&m.emissive.getHex()!==0&&(m.emissiveIntensity==null?1:m.emissiveIntensity)>0});
 const rmv=T==='MeshStandardMaterial'&&L.some(o=>o.material.roughness!==src.roughness||o.material.metalness!==src.metalness);
 const c={L,i:0,nv,ni,vo:0,io:0,pos:new Float32Array(nv*3),nor:new Float32Array(nv*3),col:new Float32Array(nv*ci),ci,uv:X?new Float32Array(nv*2):null,aM:new Uint8Array(nv),aE:glow?new Float32Array(nv*3):null,aRM:rmv?new Float32Array(nv*2):null,aL:X?new Uint8Array(nv):null,
  idx:nv>65535?new Uint32Array(ni):new Uint16Array(ni),inv,ox,oz,recs:[],arr:null,src,bad:false};
 if(X){c.arr=abtArr(J.e.k.split('|')[1],L.length);if(!c.arr)c.bad=true}
 return c}
function abtChunkStep(c,ms,t0){while(c.i<c.L.length){const o=c.L[c.i],k=c.i++;const g=o.geometry,A=g.attributes,n=A.position.count,m=o.material;
  _abM.multiplyMatrices(c.inv,o.matrixWorld);if(_abM.determinant()<=0){c.bad=true;return true}
  const e=_abM.elements;e[12]-=c.ox;e[14]-=c.oz;
  _abN.getNormalMatrix(_abM);const ne=_abN.elements;const P=A.position.array,N=A.normal.array,Cc=A.color,vo=c.vo;
  for(let i=0;i<n;i++){const x=P[i*3],y=P[i*3+1],z=P[i*3+2],j=(vo+i)*3;c.pos[j]=e[0]*x+e[4]*y+e[8]*z+e[12];c.pos[j+1]=e[1]*x+e[5]*y+e[9]*z+e[13];c.pos[j+2]=e[2]*x+e[6]*y+e[10]*z+e[14];
   const a=N[i*3],b=N[i*3+1],d=N[i*3+2];let nx=ne[0]*a+ne[3]*b+ne[6]*d,ny=ne[1]*a+ne[4]*b+ne[7]*d,nz=ne[2]*a+ne[5]*b+ne[8]*d;const l=Math.hypot(nx,ny,nz)||1;c.nor[j]=nx/l;c.nor[j+1]=ny/l;c.nor[j+2]=nz/l}
  if(Cc.normalized||!(Cc.array instanceof Float32Array)){for(let i=0;i<n;i++){c.col[(vo+i)*c.ci]=Cc.getX(i);c.col[(vo+i)*c.ci+1]=Cc.getY(i);c.col[(vo+i)*c.ci+2]=Cc.getZ(i);if(c.ci===4)c.col[(vo+i)*4+3]=Cc.getW(i)}}else c.col.set(Cc.array.subarray(0,n*c.ci),vo*c.ci);
  if(c.uv)c.uv.set(A.uv.array.subarray(0,n*2),vo*2);
  c.aM.fill(k,vo,vo+n);if(!c.aE&&m.emissive&&m.emissive.getHex()!==0&&(m.emissiveIntensity==null?1:m.emissiveIntensity)>0){c.bad=true;return true}if(!c.aRM&&c.src.type==='MeshStandardMaterial'&&(m.roughness!==c.src.roughness||m.metalness!==c.src.metalness)){c.bad=true;return true}
  if(c.aE){const em=m.emissive?m.emissive:null,s=m.emissiveIntensity==null?1:m.emissiveIntensity;const r=em?em.r*s:0,gg=em?em.g*s:0,b=em?em.b*s:0;for(let i=0;i<n;i++){c.aE[(vo+i)*3]=r;c.aE[(vo+i)*3+1]=gg;c.aE[(vo+i)*3+2]=b}}
  if(c.aRM){for(let i=0;i<n;i++){c.aRM[(vo+i)*2]=m.roughness;c.aRM[(vo+i)*2+1]=m.metalness}}
  if(c.aL){const li=abtLayer(c.arr,m.map);if(li<0){c.bad=true;return true}c.aL.fill(li,vo,vo+n)}
  const I=g.index;if(I){const ia=I.array;for(let i=0,l=I.count;i<l;i++)c.idx[c.io+i]=ia[i]+vo;c.io+=I.count}else{for(let i=0;i<n;i++)c.idx[c.io+i]=vo+i;c.io+=n}
  c.vo+=n;c.recs.push({o,par:o.parent,geo:g,mat:m,pv:A.position.version,chg:o.__mwchg|0,mw:Float64Array.from(o.matrixWorld.elements),fb:false,i:k,tex:m.map||null,freed:false});
  if(performance.now()-t0>ms)return c.i>=c.L.length}
 return true}
function abtChunkMesh(c,gk){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(c.pos,3));g.setAttribute('normal',new THREE.BufferAttribute(c.nor,3));g.setAttribute('color',new THREE.BufferAttribute(c.col,c.ci));
 if(c.uv)g.setAttribute('uv',new THREE.BufferAttribute(c.uv,2));g.setAttribute('aM',new THREE.BufferAttribute(c.aM,1));if(c.aE)g.setAttribute('aE',new THREE.BufferAttribute(c.aE,3));if(c.aRM)g.setAttribute('aRM',new THREE.BufferAttribute(c.aRM,2));if(c.aL)g.setAttribute('aL',new THREE.BufferAttribute(c.aL,1));
 g.setIndex(new THREE.BufferAttribute(c.idx,1));g.computeBoundingSphere();
 const n=c.L.length,vis=new Uint8Array(n*4),vt=new THREE.DataTexture(vis,n,1,THREE.RGBAFormat);vt.magFilter=vt.minFilter=THREE.NearestFilter;vt.generateMipmaps=false;vt.needsUpdate=true;
 const mat=abtMat(c.src,c.arr,vt,n,!!c.aE,!!c.aRM);const mesh=new THREE.Mesh(g,mat);mesh.__abt=1;mesh.matrixAutoUpdate=false;mesh.matrix.makeTranslation(c.ox,0,c.oz);mesh.name='area batch';
 /* (the big arrays are not needed once they are on the graphics card) */for(const k in g.attributes)g.attributes[k].onUpload(function(){this.array=null});g.index.onUpload(function(){this.array=null});
 return{gk,mem:c.recs,mesh,mat,vis,vt,arr:c.arr,dirty:false,drawn:false,sw:new THREE.Sphere(),swq:-1}}
function abtRetire(b){const i=ABT.B.indexOf(b);if(i>=0)ABT.B.splice(i,1);for(const r of b.mem)if(ABT.mem.get(r.o)===b)ABT.mem.delete(r.o);try{b.mesh.geometry.dispose();b.mat.dispose();b.vt.dispose()}catch(e){}}
/* ---------- every frame, outside drawing: look, build ---------- */
function abtTick(q){if(ABT.q!==q){abtForget();ABT.q=q}
 const t0=performance.now();
 if(ABT.scan||t0-ABT.scanT>8000||ABT.dirty&&t0-ABT.scanT>1500){if(!ABT.scan){ABT.scanT=t0;ABT.dirty=false}if(abtScanStep(q,ABT.force?1e9:.5))abtPlan(q)}
 let J=ABT.job;const budget=ABT.force?1e9:2.5;
 while(performance.now()-t0<budget+(ABT.force?0:.8)){
  if(!J){const e=ABT.queue.shift();if(!e)break;J=ABT.job=abtStart(q,e);if(!J)continue}
  if(!J.cur){if(J.ci>=J.chunks.length){abtFinish(J);J=ABT.job=null;continue}J.cur=abtChunkInit(J,J.chunks[J.ci])}
  const c=J.cur;if(c.bad||abtChunkStep(c,budget,t0)){if(!c.bad&&c.i>=c.L.length)J.done.push(abtChunkMesh(c,J.e.gk));J.cur=null;J.ci++}}
 /* pictures that were drawn again since they were copied */
 if((ABT.fr&63)===0)for(const a of ABT.arrs.values())for(const[t,v]of a.ver)if(t.version!==v)abtCopy(a,t,a.L.get(t));
 for(const a of ABT.arrs.values())abtMips(a);
 /* a new area batch is sent to the graphics card ahead of time, one a frame, with the desert's own lights (r632's warm-up),
    so the first time it comes into view does not stall */
 if(ABT.warmQ.length&&!ABT.force&&typeof warmBatch=='function'&&typeof WARM!='undefined'&&WARM.on&&((WARM.lights&&WARM.lights.length)||(ABT.lights&&ABT.lights.length))){const b=ABT.warmQ.shift();
  if(ABT.B.includes(b)&&!b.drawn){const m=b.mesh;m.matrixWorld.multiplyMatrices(q.g.matrixWorld,m.matrix);m.parent=q.g;q.g.children.push(m);
   const wl=WARM.lights;if(!(wl&&wl.length))WARM.lights=ABT.lights;/* (the desert's lights, so the shader made is the real frame's) */
   try{warmBatch(q,[m],(sc,cam)=>R.render(sc,cam))}catch(e){}finally{WARM.lights=wl;const i=q.g.children.lastIndexOf(m);if(i>=0)q.g.children.splice(i,1);m.parent=null}}}
 ABT.up+=performance.now()-t0}
/* a finished area: the new batches replace the old ones of the same area and kind in one go */
function abtFinish(J){const gk=J.e.gk;for(const b of ABT.B.filter(b=>b.gk===gk))abtRetire(b);
 for(const b of J.done){if(b.arr)abtMips(b.arr);let ok=true;for(const r of b.mem){const o=r.o;if(o.parent!==r.par||o.geometry!==r.geo||o.material!==r.mat||!abtSame(o.matrixWorld.elements,r.mw))r.fb=true;else r.chg=o.__mwchg|0;if(ABT.mem.has(o)){ok=false;break}}
  if(!ok){try{b.mesh.geometry.dispose();b.mat.dispose();b.vt.dispose()}catch(e){}continue}
  b.sig=J.sig;b.byP=abtByParent(b.mem);for(const r of b.mem)ABT.mem.set(r.o,b);ABT.B.push(b);ABT.warmQ.push(b);ABT.st.built++}}
function abtByParent(M){const G=new Map();for(const r of M){let L=G.get(r.par);if(!L)G.set(r.par,L=[]);L.push(r)}return[...G]}
function abtForget(){for(const b of ABT.B.slice())abtRetire(b);ABT.B=[];ABT.mem.clear();ABT.queue=[];ABT.job=null;ABT.scan=null;ABT.scanT=-1e9;ABT.warmQ=[];
 for(const a of ABT.arrs.values())try{a.tex.dispose()}catch(e){}ABT.arrs.clear();ABT.texMB=0}
/* is this group shown, all the way up to the desert? (once per group per frame) */
function abtVis(p,q,fr){if(p.__abf===fr)return p.__abv;let v;if(!p.visible)v=false;else{const pp=p.parent;v=pp===q.g?true:pp?abtVis(pp,q,fr):false}p.__abf=fr;p.__abv=v;return v}
/* ---------- while the main view is drawn: right after the positions are worked out ---------- */
function abtMid(){if(!ABT.act)return;const t0=performance.now(),q=ABT.q,fr=++ABT.fr;
 C.updateMatrixWorld();_abP.multiplyMatrices(C.projectionMatrix,C.matrixWorldInverse);_abF.setFromProjectionMatrix(_abP);
 let far=1e9;try{if(S.fog&&S.fog.far)far=S.fog.far+30}catch(e){}const cx=C.position.x,cy=C.position.y,cz=C.position.z;const ps=ABT.ps;ps.length=0;let nb=0,nm=0;
 for(const b of ABT.B){const m=b.mesh;m.matrixWorld.multiplyMatrices(q.g.matrixWorld,m.matrix);if(b.swq!==(q.g.__mwchg|0)||!b.sw.radius){b.sw.copy(m.geometry.boundingSphere).applyMatrix4(m.matrixWorld);b.swq=q.g.__mwchg|0}
  const s=b.sw,d=Math.hypot(s.center.x-cx,s.center.y-cy,s.center.z-cz)-s.radius;if(d>far||!_abF.intersectsSphere(s))continue;
  let any=false,ch=false;const V=b.vis;
  for(const[gp,GL]of b.byP){if(!(gp.__abf===fr?gp.__abv:abtVis(gp,q,fr))){for(const r of GL)if(V[r.i*4]!==0){V[r.i*4]=0;ch=true}continue}
  for(const r of GL){const o=r.o;
   if(!r.fb&&(o.__mwchg|0)!==r.chg&&abtSame(o.matrixWorld.elements,r.mw))r.chg=o.__mwchg|0;/* (its place was worked out again, to the same numbers) */
   if(!r.fb&&(o.parent!==r.par||o.geometry!==r.geo||o.material!==r.mat||r.geo.attributes.position.version!==r.pv||(o.__mwchg|0)!==r.chg)){const w=o.parent!==r.par?'group':o.geometry!==r.geo?'shape replaced':o.material!==r.mat?'material':r.geo.attributes.position.version!==r.pv?'shape changed':'moved';ABT.why[w]=(ABT.why[w]||0)+1;if(w==='moved'||w==='group')ABT.lively.add(o);r.fb=true;b.dirty=true;ABT.dirty=true;ABT.st.fb++}
   let dr=!r.fb&&o.visible&&(o.layers.mask&1)!==0&&r.mat.visible;if(dr){const p=r.par;dr=p.__abf===fr?p.__abv:abtVis(p,q,fr)}
   const v=dr?255:0;if(V[r.i*4]!==v){V[r.i*4]=v;ch=true}
   if(dr){any=true;nm++;o.__abX=fr;const p=r.par;if(p.__abH!==fr){p.__abH=fr;p.__abK=0;p.__abC=0;ps.push(p)}p.__abK+=o.id;p.__abC++}}}
  if(ch)b.vt.needsUpdate=true;
  if(any){nb++;m.parent=S;S.children.push(m);ABT.att.push(m);if(!b.drawn){b.drawn=true;b.first=fr}else if(ABT.free&&b.first!==fr&&!b.freed)abtFree(b)}}
 /* the originals drawn by an area batch are left out of this drawing (the list kept while the same ones are left out) */
 for(const p of ps){const src=p.children,c=p.__abM;let a;
  if(c&&c.k===p.__abK&&c.n===p.__abC&&c.src===src&&c.len===src.length&&c.al===c.a.length)a=c.a;else{a=src.filter(x=>x.__abX!==fr);p.__abM={k:p.__abK,n:p.__abC,src,len:src.length,a,al:a.length}}
  p.__abO=src;p.children=a;ABT.sw.push(p)}
 ABT.st.drawn=nb;ABT.st.drawnMembers=nm;ABT.up+=performance.now()-t0}
function abtPost(){const t0=performance.now();
 /* (an original added to a shorter list while drawing goes into the real one too) */
 for(const p of ABT.sw){const a=p.children,o=p.__abO;if(a!==o&&p.__abM&&a.length!==p.__abM.al){for(const x of a)if(!o.includes(x))o.push(x)}p.children=o;p.__abO=undefined}ABT.sw.length=0;
 if(ABT.att.length){const ch=S.children;for(const m of ABT.att){const i=ch.lastIndexOf(m);if(i>=0)ch.splice(i,1);m.parent=null}ABT.att.length=0}
 ABT.act=false;ABT.up+=performance.now()-t0}
/* the originals' copies on the graphics card, once their area batch has been drawn: geometry always, a picture once
   every batch that uses it is drawn by area batches. Anything that is drawn again by itself is simply sent again */
function abtFree(b){b.freed=true;for(const r of b.mem){if(r.fb||r.freed)continue;r.freed=true;try{r.geo.dispose()}catch(e){}}
 const used=new Map();for(const x of ABT.B)if(x.freed)for(const r of x.mem)if(!r.fb&&r.tex)used.set(r.tex,(used.get(r.tex)||0)+1);
 for(const[t,n]of used)if(n>=(ABT.users.get(t)||1e9)&&!t.__abFreed){t.__abFreed=1;try{t.dispose()}catch(e){}}}
/* hooks */
if(typeof BAKE!='undefined'){BAKE.mids.push(()=>abtMid());BAKE.posts.push(()=>abtPost())}
{const r0=R.render;R.render=function(sc,cam){const q=BUS&&BUS.ride;
 ABT.act=!!(ABT.on&&ABT.ok&&sc===S&&cam===C&&q&&q===ABT.q&&BAKE.on&&!(LAG.open&&LAG.hide&&LAG.hide.noabt)&&ABT.B.length);return r0.apply(this,arguments)}}
{const ru=busRoamUpd;busRoamUpd=function(q,dt){const r=ru.apply(this,arguments);
 try{if(ABT.ok===null)ABT.ok=!!(R.capabilities.isWebGL2&&R.capabilities.maxVertexTextures>0&&typeof MWC!='undefined'&&typeof BAKE!='undefined');
  if(ABT.on&&ABT.ok&&q&&q.g&&!q.ld&&q.dp&&q.dp.merged&&MWC.on&&MWX.on&&BAKE.on)abtTick(q);else if(ABT.B.length)abtForget()}
 catch(e){conLog('error','area batches: '+e.message);ABT.on=false;try{abtForget()}catch(x){}}return r}}
/* for testing: look everywhere and make everything now */
function abtForce(){const q=BUS.ride;if(!q)return null;ABT.force=true;ABT.scanT=-1e9;ABT.scan=null;try{for(let i=0;i<50&&(ABT.scan||ABT.queue.length||ABT.job||i===0);i++)abtTick(q)}finally{ABT.force=false}return{batches:ABT.B.length,members:ABT.mem.size,textureMB:Math.round(ABT.texMB),arrays:ABT.arrs.size}}
/* the lag window: own time, a switch to compare, a draw-call kind, and a line per Benchmark view */
LAGSYS.push(['abt','Scenery area batches (upkeep)']);
{const t0=abtTick;abtTick=function(){if(!LAG.open)return t0.apply(this,arguments);const u=ABT.up;try{return t0.apply(this,arguments)}finally{const d=ABT.up-u;LAG.sys.abt=(LAG.sys.abt||0)+d;LAG.cur.abt=(LAG.cur.abt||0)+d}}}
{const m0=abtMid;abtMid=function(){if(!LAG.open)return m0.apply(this,arguments);const u=ABT.up;try{return m0.apply(this,arguments)}finally{const d=ABT.up-u;LAG.sys.abt=(LAG.sys.abt||0)+d;LAG.cur.abt=(LAG.cur.abt||0)+d}}}
if(ABT.on)LAGHIDE.push(['noabt','Nothing, but scenery area batches off (r667 off, to compare)']);
{const ls=lagSet;lagSet=function(k){if(k==='noabt')return[];return ls.apply(this,arguments)}}
{const lc=lagCats;lagCats=function(q){const r=lc.apply(this,arguments);if(r&&r.cat){const c0=r.cat;r.cat=o=>o&&o.__abt?'scenery area batches':c0(o)}return r}}
{const lr=lagRun;lagRun=async function(){const A=await lr.apply(this,arguments);if(A)A.abt={b:ABT.B.length,d:ABT.st.drawn,m:ABT.st.drawnMembers,mb:Math.round(ABT.texMB),fb:ABT.st.fb};return A}}
{const ll=lagLimit;lagLimit=function(A){let s=ll.apply(this,arguments);try{if(ABT.on&&A&&A.abt)s='Scenery area batches: '+A.abt.b+' made, '+A.abt.d+' drawn this frame for '+A.abt.m+' original batches (pictures '+A.abt.mb+' MB, '+A.abt.fb+' originals went back to drawing themselves)\n'+s;
  s=s.replace(/Hide nothing, but scenery area batches off \(r667 off, to compare\)/g,'Scenery area batches off (r667 switched off, to compare)')}catch(e){}return s}}
{const st=lagSpikeTxt;lagSpikeTxt=function(){const t=st.apply(this,arguments);return typeof t=='string'?t.replace(/Hide nothing, but scenery area batches off \(r667 off, to compare\)/g,'Scenery area batches off (r667 switched off, to compare)'):t}}
