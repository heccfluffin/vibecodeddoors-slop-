/* =====================================================================================================
   r654: DESERT PERFORMANCE: PEOPLE AND OTHER MOVING PIECES ARE DRAWN TOGETHER ("skinning").
   Every walking person in the desert (the officers in the PD HQ, the groundskeepers, the soldiers...) is made of a dozen
   or more separate pieces (head, arms, legs, belt...), and each piece was its own draw call because it moves every frame,
   so the batcher could not merge it. Beside the PD HQ that was 500 to 600 of the 1,700 draw calls.
   Now those pieces are drawn the way games draw animated characters: all pieces of the same kind of material (across all
   people) go into one shape, and the graphics card moves each piece to where the game put it this frame (a "bone" per
   piece). The real pieces are untouched: the game still moves, hides and shows them exactly as before; they are only
   hidden from the camera (layer 2, like the batcher does), and their places in the world are still worked out every
   frame. Each frame every piece's bone is set from the piece itself: hidden pieces (or pieces in something hidden) are
   not drawn, and the small far pieces the distance culling (r603) would hide are hidden the same way.
   A piece whose look changes (colour, glow, see-through, picture, a different material or shape) goes back to being
   drawn on its own at once, and that material is not batched again. Pieces with their own render code, pictures that
   are not plain images, mirrored pieces and pieces stretched unevenly are left alone.
   ?noskn in the address turns it off to compare.
   r662: the people and other moving things standing inside the scenery cells (soldiers at the Fort, workers...) are
   batched too (they were left out because far scenery looks after the cells; far scenery now leaves these pieces to
   this, see dx638). Still scenery stays with the batcher and far scenery. Pieces in cells are not hidden by the
   distance culling of loose pieces (it never applied to the cells; the cells hide as a whole). ?nosknc turns this
   part off.
   ===================================================================================================== */
/* two sets of bones: pieces that move (sent to the graphics card every frame) and still pieces (sent only when one changes) */
function sknPools(){return[{id:'m',recs:[],free:[],sk:null,cap:0,ch:false,dq:[]},{id:'s',recs:[],free:[],sk:null,cap:0,ch:false,dq:[]}]}
const SKN={/* r679: groups outside the view skipped; ?nosknfc = the old way */fc:!/[?&]nosknfc(?:[&=]|$)/.test(location.search),ocam:0,fcg:0,on:!/[?&]noskn(?:[&=]|$)/.test(location.search),quick:!/[?&]nosknq(?:[&=]|$)/.test(location.search),qn:0,qh:0,qg:0,gv:0,sub:!/[?&]nosknsub(?:[&=]|$)/.test(location.search),ds:[],up:{full:0,part:0,rows:0,bytes:0},cells:!/[?&]nosknc(?:[&=]|$)/.test(location.search),q:null,g:null,P:sknPools(),bat:new Map(),
 scan:null,scanT:-1e9,pend:new Map(),lively:new WeakSet(),mats:new Map(),drop:[],rb:new Set(),af:0,gm:new Float64Array(16),
 SCAN:30000,BUD:.25,fr:0,stats:{pieces:0,batches:0,dropped:0,builds:0,ms:0,why:{}}};
const _skM=new THREE.Matrix4(),_skG=new THREE.Matrix4(),_skN=new THREE.Matrix3(),_skV=new THREE.Vector3(),_skI=new THREE.Matrix4();
/* a 3x3 that turns and scales the same in every direction (then the graphics card turns the normals the same way three.js does) */
function sknEven(e){const a=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],b=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],c=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];if(!(a>1e-12))return false;
 if(Math.abs(a-b)>1e-5*a||Math.abs(a-c)>1e-5*a)return false;const d1=e[0]*e[4]+e[1]*e[5]+e[2]*e[6],d2=e[0]*e[8]+e[1]*e[9]+e[2]*e[10],d3=e[4]*e[8]+e[5]*e[9]+e[6]*e[10];return Math.abs(d1)<1e-5*a&&Math.abs(d2)<1e-5*a&&Math.abs(d3)<1e-5*a}
/* the look of a material, as numbers (anything that can change on its own) */
function sknMatSig(m){const c=m.color,e=m.emissive,t=m.map;return[c.r,c.g,c.b,e?e.r:0,e?e.g:0,e?e.b:0,m.emissiveIntensity,m.opacity,m.roughness,m.metalness,m.side,m.transparent,m.alphaTest,m.depthWrite,m.depthTest,m.blending,m.fog,
 m.polygonOffset,m.polygonOffsetFactor,m.polygonOffsetUnits,t||null,t?t.version:0,t?t.offset.x:0,t?t.offset.y:0,t?t.repeat.x:0,t?t.repeat.y:0,t?t.rotation:0,m.type]}
function sknMatSame(m,a){const c=m.color,e=m.emissive,t=m.map||null;return a[0]===c.r&&a[1]===c.g&&a[2]===c.b&&a[3]===(e?e.r:0)&&a[4]===(e?e.g:0)&&a[5]===(e?e.b:0)&&a[6]===m.emissiveIntensity&&a[7]===m.opacity&&a[8]===m.roughness&&a[9]===m.metalness&&a[10]===m.side&&a[11]===m.transparent&&a[12]===m.alphaTest&&a[13]===m.depthWrite&&a[14]===m.depthTest&&a[15]===m.blending&&a[16]===m.fog
 &&a[17]===m.polygonOffset&&a[18]===m.polygonOffsetFactor&&a[19]===m.polygonOffsetUnits&&a[20]===t&&(!t||(a[21]===t.version&&a[22]===t.offset.x&&a[23]===t.offset.y&&a[24]===t.repeat.x&&a[25]===t.repeat.y&&a[26]===t.rotation))&&a[27]===m.type}
/* the kind of material: the batcher's key plus the exact numbers it rounds (these pieces were drawn with their own
   material, so the shape must look exactly like it; never the batcher's cheaper lighting) */
function sknKey(m){const k=DP._matKey(m,false);return k&&k+'|'+m.roughness+'/'+m.metalness+'/'+m.emissiveIntensity+'/'+m.shininess}
/* can this piece be drawn by a bone? (null = yes, else why not) */
function sknWhy(q,o,lam){if(!o.isMesh||o.children.length||o.isSprite||o.isPoints||o.isLine||o.isInstancedMesh||o.isSkinnedMesh)return'kind';const u=o.userData;if(u.dpMerged||u.flv||u.fsc||u.skn)return'batch';
 const mk=o.layers.mask;if(mk!==1&&mk!==(1<<PL_FAR))return'layer';if(o.onBeforeRender!==THREE.Object3D.prototype.onBeforeRender)return'render hook';if(!DP._geoOK(o.geometry))return'geometry';
 const m=o.material;if(!m||Array.isArray(m))return'multi-material';if(SKN.lively.has(m))return'material changes';if(m.userData&&m.userData.dpSand)return'sand';if(m.transparent)return'see-through';if(!sknKey(m))return'material';
 if(m.map){const im=m.map.image;if(!(im&&((typeof HTMLImageElement!='undefined'&&im instanceof HTMLImageElement)||(typeof ImageBitmap!='undefined'&&im instanceof ImageBitmap)||(typeof HTMLCanvasElement!='undefined'&&im instanceof HTMLCanvasElement))))return'picture'}
 for(let p=o.parent;p&&p!==q.g;p=p.parent){if(p.updateMatrixWorld!==_mwP||p.__mwKeep||p.userData.flv||p.userData.fsc)return'inside'}
 if(o.matrixWorld.determinant()<=0)return'mirrored';
 if(sknEven(o.matrixWorld.elements))return null;if(o.parent&&sknEven(o.parent.matrixWorld.elements))return null;return'stretched'}
/* the places to look in: everything in the desert that is not scenery cells, vehicles or the far shapes */
function sknRoots(q){const veh=new Set((q.vehs||[]).map(v=>v&&v.m));if(q.heli&&q.heli.m)veh.add(q.heli.m);const skip=new Set([q.sky,q.sun,q.zsky,q.zstar,q.sand,q.bg,BUS._sky,BUS._sun,SKN.g].filter(Boolean));
 if(typeof FSC!='undefined'&&FSC.g)skip.add(FSC.g);if(typeof WARM!='undefined'&&WARM.prox)skip.add(WARM.prox);
 /* (r662: the scenery cells too, for their moving things only) */const cells=SKN.cells?(q.chunks||[]).filter(c=>c.parent===q.g):[];
 return cells.concat(q.g.children.filter(o=>!o.userData.chunk&&!veh.has(o)&&!skip.has(o)&&!o.__mwKeep&&!o.userData.fsc&&!o.userData.flv&&(o.isGroup||o.type==='Object3D')&&o.updateMatrixWorld===_mwP))}
/* look for new pieces, a little each frame */
function sknScan(q,budget){const t0=performance.now(),now=t0;let S2=SKN.scan;if(!S2){if(now-SKN.scanT<SKN.SCAN)return;SKN.scanT=now;S2=SKN.scan={st:sknRoots(q).map(r=>[r,0]),n:0}}
 const lam=DP.cfg().lam;let k=0;
 while(S2.st.length){if((++k&15)===0&&performance.now()-t0>budget)return;const top=S2.st[S2.st.length-1],o=top[0];
  if(top[1]>=o.children.length){S2.st.pop();continue}const c=o.children[top[1]++];if(!c.visible&&!c.isMesh)continue;
  if(c.children.length){if(c.updateMatrixWorld===_mwP&&!c.__mwKeep)S2.st.push([c,0]);continue}
  if(c.__skn||!c.isMesh)continue;const w=sknWhy(q,c,lam);if(w){SKN.stats.why[w]=(SKN.stats.why[w]|0)+1;continue}
  if(SKN.P[0].recs.length+SKN.P[1].recs.length+S2.n>60000)break;let mv=false,cell=false;for(let p=c;p&&p!==q.g;p=p.parent){const u=p.userData;if(u.dpDyn||u.dpKeep||u.mv)mv=true;if(u.chunk)cell=true}if(cell&&!mv){SKN.stats.why['scenery, still']=(SKN.stats.why['scenery, still']|0)+1;continue}const key=(mv?'m':'s')+'|'+sknKey(c.material);let L=SKN.pend.get(key);if(!L)SKN.pend.set(key,L=[]);L.push(c);c.__skn=1;S2.n++}
 SKN.scan=null;for(const key of SKN.pend.keys())SKN.rb.add(key)}
/* the shared skeleton (one bone per piece); it grows when needed */
function sknSkel(P,n){if(P.sk&&n<=P.cap)return false;let cap=Math.max(256,P.cap||0);while(cap<n)cap*=2;const b=new THREE.Bone(),I=new THREE.Matrix4();
 const sk=new THREE.Skeleton(new Array(cap).fill(b),new Array(cap).fill(I));sk.update=function(){};const old=P.sk;P.sk=sk;P.cap=cap;SKN.af++;
 for(const B of SKN.bat.values())if(B.mesh&&B.P===P){B.mesh.skeleton=sk}for(const r of P.recs)if(r)r.on=false;if(old){try{old.dispose()}catch(e){}}return true}
/* a piece's own record */
function sknRec(q,o,P){const slot=P.free.length?P.free.pop():P.recs.length;const self=sknEven(o.matrixWorld.elements);
 const g=o.geometry;if(!g.boundingSphere)g.computeBoundingSphere();const bs=g.boundingSphere;
 const r={o,slot,mat:o.material,geo:o.geometry,pv:g.attributes.position.version,mask:o.layers.mask,self,pm:self?null:Float64Array.from(o.matrix.elements),bm:new Float64Array(16),f:-1,af:-1,on:false,vis:false,dead:false,
  c:bs.center.clone(),rad:bs.radius,wx:0,wy:0,wz:0,wr:0,key:null,P,ch:false};for(let p=o.parent;p;p=p.parent)if(p.userData&&p.userData.chunk){r.ch=true;break}P.recs[slot]=r;SKN.gv++;o.layers.mask=1<<DP.HID;o.userData.dpDyn=1;
 let ms=SKN.mats.get(r.mat);if(!ms){ms={sig:sknMatSig(r.mat),n:0,f:-1,bad:false};SKN.mats.set(r.mat,ms)}ms.n++;r.ms=ms;return r}
/* (re)make the shape for one kind of material: every live piece of that kind, each vertex tied to its piece's bone */
function sknBuild(q,key){const t0=performance.now(),P=SKN.P[key[0]==='m'?0:1];let B=SKN.bat.get(key);if(!B){B={key,P,recs:[],mesh:null,dead:0,later:[]};SKN.bat.set(key,B)}
 const live=B.recs.filter(r=>!r.dead);for(const sl of B.later)P.free.push(sl);B.later=[];for(const o of SKN.pend.get(key)||[])if(o.parent&&!sknWhy(q,o,DP.cfg().lam)&&o.__skn){const r=sknRec(q,o,P);r.key=key;live.push(r)}else if(o)delete o.__skn;SKN.pend.delete(key);
 if(B.mesh){if(B.mesh.parent)B.mesh.parent.remove(B.mesh);try{B.mesh.geometry.dispose()}catch(e){}B.mesh=null}B.recs=live;B.dead=0;SKN.force=true;if(!live.length){SKN.bat.delete(key);return}
 sknSkel(P,P.recs.length);
 /* (at most about 60,000 corners per shape, like the batcher) */let nv=0,ni=0;const src=live[0].mat,hasMap=!!src.map;for(const r of live){const g=r.geo;nv+=g.attributes.position.count;ni+=g.index?g.index.count:g.attributes.position.count}
 const pos=new Float32Array(nv*3),nor=new Float32Array(nv*3),col=new Float32Array(nv*3),uv=hasMap?new Float32Array(nv*2):null,si=new Uint16Array(nv*4),sw=new Float32Array(nv*4),idx=nv>65535?new Uint32Array(ni):new Uint16Array(ni);let vo=0,io=0;
 for(const r of live){const o=r.o,g=r.geo,pa=g.attributes.position.array,na=g.attributes.normal?g.attributes.normal.array:null,ua=g.attributes.uv?g.attributes.uv.array:null,n=g.attributes.position.count;
  if(r.self)_skM.identity();else _skM.fromArray(r.pm);_skN.getNormalMatrix(_skM);const c=r.mat.color;let ue=null;if(uv&&r.mat.map){const t=r.mat.map;if(t.matrixAutoUpdate)t.updateMatrix();ue=t.matrix.elements}
  for(let i=0;i<n;i++){const k=(vo+i)*3;_skV.fromArray(pa,i*3);if(!r.self)_skV.applyMatrix4(_skM);pos[k]=_skV.x;pos[k+1]=_skV.y;pos[k+2]=_skV.z;
   if(na){_skV.fromArray(na,i*3);if(!r.self)_skV.applyMatrix3(_skN).normalize()}else _skV.set(0,1,0);nor[k]=_skV.x;nor[k+1]=_skV.y;nor[k+2]=_skV.z;col[k]=c.r;col[k+1]=c.g;col[k+2]=c.b;
   si[(vo+i)*4]=r.slot;sw[(vo+i)*4]=1;
   if(uv){let u=ua?ua[i*2]:0,v=ua?ua[i*2+1]:0;if(ue){const u2=ue[0]*u+ue[3]*v+ue[6],v2=ue[1]*u+ue[4]*v+ue[7];u=u2;v=v2}uv[(vo+i)*2]=u;uv[(vo+i)*2+1]=v}}
  if(g.index){const ia=g.index.array,kk=g.index.count;for(let i=0;i<kk;i++)idx[io+i]=ia[i]+vo;io+=kk}else{for(let i=0;i<n;i++)idx[io+i]=vo+i;io+=n}vo+=n}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('normal',new THREE.BufferAttribute(nor,3));geo.setAttribute('color',new THREE.BufferAttribute(col,3));
 if(uv)geo.setAttribute('uv',new THREE.BufferAttribute(uv,2));geo.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(si,4));geo.setAttribute('skinWeight',new THREE.BufferAttribute(sw,4));geo.setIndex(new THREE.BufferAttribute(idx,1));
 const mat=DP._mergedMat(src,false);mat.skinning=true;mat.userData.skn=1;
 const mesh=new THREE.SkinnedMesh(geo,mat);mesh.bindMode='detached';mesh.bind(P.sk,_skI);mesh.visible=false;mesh.raycast=()=>{};mesh.userData={skn:1,dpKeep:1,noSeam:1};
 mesh.renderOrder=live[0].o.renderOrder;SKN.g.add(mesh);B.mesh=mesh;SKN.stats.builds++;SKN.stats.ms+=performance.now()-t0;
 for(const r of live){r.f=-1;r.B=B}}
/* every frame, before drawing: each piece's bone from the piece itself (called by three.js for the skeleton, once per drawing) */
/* is this group shown, all the way up? (worked out once per group per frame; null = no longer in the desert) */
function sknVis(p,q,fr){if(p.__skf===fr)return p.__skv;let v;if(!p.visible)v=false;else{const pp=p.parent;v=pp===q.g?true:pp?sknVis(pp,q,fr):null}p.__skf=fr;p.__skv=v;return v}
/* r663: sending the bones to the graphics card. three.js keeps a batch's bones in one square picture and sends ALL of it
   whenever anything changed (1 MB a frame once the moving list grew past 4,096 pieces in r662). Now only the rows that
   changed are sent, in a few strips; the whole picture is still sent the first time, after a rebuild, or when most of it
   changed. ?nosknsub in the address sends the whole picture every time, like r662 */
function sknUp(P,ds){const sk=P.sk,t=sk&&sk.boneTexture;if(!t){P.dq.length=0;return}const pr=R.properties.get(t),sz=sk.boneTextureSize,U=SKN.up;
 const full=()=>{t.needsUpdate=true;P.dq.length=0;U.full++;U.bytes+=sz*sz*16};
 if(!SKN.sub||!pr.__webglTexture||pr.__version!==t.version||!sz)return full();
 const rows=SKN.rows&&SKN.rows.length===sz?SKN.rows:(SKN.rows=new Uint8Array(sz));rows.fill(0);const per=sz/4;let n=0;
 for(const s of ds){const y=(s/per)|0;if(!rows[y]){rows[y]=1;n++}}for(const s of P.dq){const y=(s/per)|0;if(y<sz&&!rows[y]){rows[y]=1;n++}}P.dq.length=0;
 if(n>sz/2)return full();
 /* strips: rows next to each other (or 4 apart) go together */
 const runs=[];for(let y=0;y<sz;y++){if(!rows[y])continue;const L=runs[runs.length-1];if(L&&y-L[1]<=4)L[1]=y+1;else runs.push([y,y+1])}
 if(runs.length>24)return full();
 const gl=R.getContext();R.state.bindTexture(gl.TEXTURE_2D,pr.__webglTexture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.pixelStorei(gl.UNPACK_ALIGNMENT,4);
 const B=sk.boneMatrices;for(const[a,b]of runs){gl.texSubImage2D(gl.TEXTURE_2D,0,0,a,sz,b-a,gl.RGBA,gl.FLOAT,B.subarray(a*sz*4,b*sz*4));U.rows+=b-a;U.bytes+=(b-a)*sz*16}U.part++}
/* every frame, right after the frame's own position update and before anything is drawn: each piece's bone from the piece itself */
/* r666: each pool's pieces sorted by the group they sit in */
function sknGroups(P){const M=new Map();for(let s=0;s<P.recs.length;s++){const r=P.recs[s];if(!r||r.dead)continue;const p=r.o.parent;let g=M.get(p);if(!g){g={p,sl:[],skip:0,cl:-1};M.set(p,g)}g.sl.push(s)}P.G=[...M.values()];P.gv=SKN.gv}
/* after a group's full look: can it be passed over next time? 1 = every piece culled, 2 = every piece hidden (checked again each frame) */
function sknGroupEnd(g,R2){let c=true,h=true,n=0;for(const s of g.sl){const r=R2[s];if(!r||r.dead)continue;n++;if(r.on){c=h=false;break}if(!(r.cull&&r.vis))c=false;if(!(r.vis===false&&r.par===g.p))h=false;if(!c&&!h)break}
 g.skip=!n||!g.p?0:c?1:h?2:0;g.cl=g.p?(g.p.__bkO!==undefined?g.p.__bkO:g.p.children).length:-1}
/* r679: a ball around a group's pieces, in its parent's space (generous: pieces swing and walk inside their group) */
const _skFS=new THREE.Sphere(),_skFF=new THREE.Frustum(),_skFM=new THREE.Matrix4();
function sknGroupBall(g,R2){const SL=g.sl;let sx=0,sy=0,sz=0,n=0;const pts=[];for(let si=0;si<SL.length;si++){const r=R2[SL[si]];if(!r||r.dead||!r.o)continue;const o=r.o;if(o.parent!==g.p){g.lr=-1;return}
  const gg=o.geometry;if(!gg.boundingSphere)gg.computeBoundingSphere();const b=gg.boundingSphere,ms=Math.max(Math.abs(o.scale.x),Math.abs(o.scale.y),Math.abs(o.scale.z));
  const m=o.matrix.elements,c=b.center,x=m[0]*c.x+m[4]*c.y+m[8]*c.z+m[12],y=m[1]*c.x+m[5]*c.y+m[9]*c.z+m[13],z=m[2]*c.x+m[6]*c.y+m[10]*c.z+m[14],rad=b.radius*ms;if(!isFinite(x+y+z+rad)){g.lr=-1;return}pts.push(x,y,z,rad);sx+=x;sy+=y;sz+=z;n++}
 if(!n){g.lr=-1;return}const cx=sx/n,cy=sy/n,cz=sz/n;let R=0;for(let i=0;i<pts.length;i+=4)R=Math.max(R,Math.hypot(pts[i]-cx,pts[i+1]-cy,pts[i+2]-cz)+pts[i+3]);
 g.lc=[cx,cy,cz];g.lr=R*1.3+1.5}
function sknBones(){const q=SKN.q;if(!q||!SKN.g)return;const cp=C.position;if(SKN.bt===SKN.tn&&SKN.bx===cp.x&&SKN.by===cp.y&&SKN.bz===cp.z&&!SKN.force)return;SKN.bt=SKN.tn;SKN.bx=cp.x;SKN.by=cp.y;SKN.bz=cp.z;SKN.force=false;const fr=++SKN.fr;for(const B of SKN.bat.values()){B.n=0;B.x0=B.y0=B.z0=1e30;B.x1=B.y1=B.z1=-1e30}const G=SKN.g.matrixWorld.elements,gm=SKN.gm;
 let gch=false;for(let i=0;i<16;i++)if(G[i]!==gm[i]){gch=true;gm[i]=G[i]}if(gch){SKN.af++;_skG.fromArray(gm).invert()}
 const stamp=typeof MWC!='undefined'&&MWC.on&&MWX.on&&MWX.used,f=stamp?MWC.f:-2;
 /* the distance culling of small far pieces (r603, perfCull) applies to them as before (it looks at each piece in turn; so
    does this: still pieces and pieces already culled are looked at again every 8th frame, moving shown pieces every frame) */
 const pc=typeof PERF!='undefined'&&PERF.on;let far=1e9;try{if(S.fog&&S.fog.far)far=S.fog.far+30}catch(e){}const cx=C.position.x,cy=C.position.y,cz=C.position.z,D0=PERF_D[0],D1=PERF_D[1];
 /* r679: the view, for leaving out groups outside it (not while another camera draws the scene, like the office monitors) */
 const fcOn=SKN.fc&&!(SKN.ocam>performance.now());if(fcOn){C.updateWorldMatrix(true,false);_skFM.multiplyMatrices(C.projectionMatrix,C.matrixWorldInverse);_skFF.setFromProjectionMatrix(_skFM)}
 for(const P of SKN.P){const sk=P.sk;if(!sk)continue;const B=sk.boneMatrices,R2=P.recs,mov=P.id==='m';let wr=false;const ds=SKN.ds;ds.length=0;
 /* r666: piece by piece within each group; a group whose pieces were all culled, or which is hidden as a whole, is passed
    over with one look (every group gets the full look every 8th frame, like each piece did before) */
 if(P.gv!==SKN.gv)sknGroups(P);const GG=P.G;
 for(let gi=0,gn=GG.length;gi<gn;gi++){const g=GG[gi],gp=g.p;const turn=SKN.allTurn||((gi+fr)&7)===0;
 /* r679: a group wholly behind you or past the fog: its pieces are put away once (as when hidden) and skipped until it is in view */
 if(fcOn&&mov&&gp){/* (r680: only moving pieces' groups: still pieces cost little and must never need redoing when you turn) */if(turn||g.lr===undefined)sknGroupBall(g,R2);else if(g.lr>0){const e=gp.matrixWorld.elements,lc=g.lc,x=e[0]*lc[0]+e[4]*lc[1]+e[8]*lc[2]+e[12],y=e[1]*lc[0]+e[5]*lc[1]+e[9]*lc[2]+e[13],z=e[2]*lc[0]+e[6]*lc[1]+e[10]*lc[2]+e[14];
  const sc=Math.sqrt(Math.max(e[0]*e[0]+e[1]*e[1]+e[2]*e[2],e[4]*e[4]+e[5]*e[5]+e[6]*e[6],e[8]*e[8]+e[9]*e[9]+e[10]*e[10])),rr=g.lr*sc;_skFS.center.set(x,y,z);_skFS.radius=rr;
  const dx=x-cx,dy=y-cy,dz=z-cz;if((dx*dx+dy*dy+dz*dz>(far+rr)*(far+rr))||!_skFF.intersectsSphere(_skFS)){/* r680: still pieces keep their bones (nothing to redo when you turn round: r679 made a 63 ms hitch); moving ones are put away */if(mov){const SL=g.sl;for(let si=0,sn=SL.length;si<sn;si++){const s=SL[si],r=R2[s];if(!r||r.dead)continue;if(r.on){B.fill(0,s*16,s*16+16);r.on=false;wr=true;ds.push(s)}r.vis=false}}SKN.fcg++;continue}}}
 if(SKN.quick&&!turn&&g.skip&&gp&&(gp.__bkO!==undefined?gp.__bkO:gp.children).length===g.cl){if(g.skip===1){SKN.qg++;continue}if((gp.__skf===fr?gp.__skv:sknVis(gp,q,fr))===false){SKN.qg++;continue}}
 const SL=g.sl;for(let si=0,sn=SL.length;si<sn;si++){const s=SL[si],r=R2[s];if(!r||r.dead)continue;const o=r.o,j=s*16;if(o.parent!==gp)SKN.gv++;
  if(r.cull&&r.vis&&!turn)continue;
  /* r666: the quick way for a shown piece where nothing changed since last frame (same group, still shown, same look and
     shape, not moved, its group not moved): it only joins its batch's box. Anything else, and every 8th frame, goes the full way */
  /* r666: a hidden piece whose group is already known to be hidden this frame (another of its pieces asked): nothing to do */
  if(SKN.quick&&!turn&&!r.on&&r.vis===false&&r.par!==undefined){const p=o.parent;if(p===r.par&&p.__skf===fr&&p.__skv===false){SKN.qh++;continue}}
  if(SKN.quick&&!turn&&stamp&&r.on&&!r.dirty&&r.vis&&!r.cull&&r.af===SKN.af&&r.f>=0&&r.par!==undefined){const p=o.parent;
   if(p===r.par&&o.visible&&o.material===r.mat&&o.geometry===r.geo&&o.matrixAutoUpdate&&o.__mwpar===p&&(p.__mwchg|0)<=(o.__mwf|0)&&r.mat.visible&&(p.__skf===fr?p.__skv:sknVis(p,q,fr))===true&&o.layers.mask===4&&r.geo.attributes.position.version===r.pv){
    const ms=r.ms;if(ms.f!==fr){ms.f=fr;if(!ms.bad&&!sknMatSame(r.mat,ms.sig)){ms.bad=true;SKN.lively.add(r.mat)}}
    const P3=o.position,Q=o.quaternion,Sc=o.scale,c=o.__mwc;
    if(!ms.bad&&c&&c[0]===P3.x&&c[1]===P3.y&&c[2]===P3.z&&c[3]===Q._x&&c[4]===Q._y&&c[5]===Q._z&&c[6]===Q._w&&c[7]===Sc.x&&c[8]===Sc.y&&c[9]===Sc.z){o.__mwf=MWC.f;SKN.qn++;
     const b=r.B;if(b){b.n++;const w=r.wr;if(r.wx-w<b.x0)b.x0=r.wx-w;if(r.wx+w>b.x1)b.x1=r.wx+w;if(r.wy-w<b.y0)b.y0=r.wy-w;if(r.wy+w>b.y1)b.y1=r.wy+w;if(r.wz-w<b.z0)b.z0=r.wz-w;if(r.wz+w>b.z1)b.z1=r.wz+w}continue}}}
  if(o.material!==r.mat||o.geometry!==r.geo||o.layers.mask!==4||!o.parent){sknDrop(r,!o.parent?'removed':o.layers.mask!==4?'layer changed':'material or shape changed');if(r.on){B.fill(0,j,j+16);r.on=false;wr=true;ds.push(s)}continue}
  let vis=o.visible&&r.mat.visible;if(vis){const pv=sknVis(o.parent,q,fr);if(pv===null){sknDrop(r,'removed');if(r.on){B.fill(0,j,j+16);r.on=false;wr=true;ds.push(s)}continue}vis=pv}
  if(!vis){if(r.on){B.fill(0,j,j+16);r.on=false;wr=true;ds.push(s)}r.vis=false;r.par=o.parent;continue}
  /* its place in the world, exactly as the frame's own update would work it out */
  let ch;if(stamp)ch=mwSelf(o,false);else{if(o.matrixAutoUpdate)o.updateMatrix();o.matrixWorld.multiplyMatrices(o.parent.matrixWorld,o.matrix);o.matrixWorldNeedsUpdate=false;ch=true}
  const need=ch||!r.vis||r.af!==SKN.af||r.f<0;
  if(need){const ow=o.matrixWorld.elements,e=r.self?ow:o.parent.matrixWorld.elements;
   if(!r.self){const m=o.matrix.elements,pm=r.pm;let same=true;for(let i=0;i<16;i++)if(m[i]!==pm[i]){same=false;break}if(!same){sknDrop(r,'piece moved inside');if(r.on){B.fill(0,j,j+16);r.on=false;wr=true;ds.push(s)}continue}}
   if(!sknEven(e)){sknDrop(r,'stretched');if(r.on){B.fill(0,j,j+16);r.on=false;wr=true;ds.push(s)}continue}
   _skM.fromArray(e);_skM.premultiply(_skG);const bm=r.bm,me=_skM.elements;for(let i=0;i<16;i++)bm[i]=me[i];
   const c=r.c,x=c.x,y=c.y,z=c.z;r.wx=ow[0]*x+ow[4]*y+ow[8]*z+ow[12];r.wy=ow[1]*x+ow[5]*y+ow[9]*z+ow[13];r.wz=ow[2]*x+ow[6]*y+ow[10]*z+ow[14];
   r.wr=r.rad*(r.self?Math.sqrt(ow[0]*ow[0]+ow[1]*ow[1]+ow[2]*ow[2]):o.matrixWorld.getMaxScaleOnAxis());r.f=f;r.af=SKN.af;r.dirty=true}
  r.vis=true;r.par=o.parent;
  if(r.ch)r.cull=false;else if(pc&&(need||turn||mov)){const dx=r.wx-cx,dy=r.wy-cy,dz=r.wz-cz,w=r.wr,lim=(w<1.2?D0:w<4?D1:1e9);const L=(lim<far?lim:far)+w;r.cull=dx*dx+dy*dy+dz*dz>L*L}else if(!pc)r.cull=false;
  if(!r.cull){const ms=r.ms;if(ms.f!==fr){ms.f=fr;if(!ms.bad&&!sknMatSame(r.mat,ms.sig)){ms.bad=true;SKN.lively.add(r.mat)}}
   if(ms.bad||r.geo.attributes.position.version!==r.pv){sknDrop(r,ms.bad?'look changed':'shape changed');if(r.on){B.fill(0,j,j+16);r.on=false;wr=true;ds.push(s)}continue}
   if(!r.on||r.dirty){const bm=r.bm;for(let i=0;i<16;i++)B[j+i]=bm[i];r.on=true;r.dirty=false;wr=true;ds.push(s)}const b=r.B;if(b){b.n++;const w=r.wr;if(r.wx-w<b.x0)b.x0=r.wx-w;if(r.wx+w>b.x1)b.x1=r.wx+w;if(r.wy-w<b.y0)b.y0=r.wy-w;if(r.wy+w>b.y1)b.y1=r.wy+w;if(r.wz-w<b.z0)b.z0=r.wz-w;if(r.wz+w>b.z1)b.z1=r.wz+w}}
  else if(r.on){B.fill(0,j,j+16);r.on=false;wr=true;ds.push(s)}}
 sknGroupEnd(g,R2)}
 if(wr||P.ch)sknUp(P,ds);P.ch=false}
 const gs=Math.sqrt(_skG.elements[0]**2+_skG.elements[1]**2+_skG.elements[2]**2);
 for(const b of SKN.bat.values()){const m=b.mesh;if(!m)continue;m.visible=b.n>0;if(!b.n)continue;const bs=m.geometry.boundingSphere||(m.geometry.boundingSphere=new THREE.Sphere());
  bs.center.set((b.x0+b.x1)/2,(b.y0+b.y1)/2,(b.z0+b.z1)/2).applyMatrix4(_skG);bs.radius=Math.hypot(b.x1-b.x0,b.y1-b.y0,b.z1-b.z0)/2*gs+.01}}
/* a piece that goes back to being drawn on its own */
function sknDrop(r,why){if(r.dead)return;r.dead=true;const o=r.o;/* (back on the normal layer: the distance culling decides again from there) */if(o.layers.mask===4)o.layers.mask=1;delete o.__skn;const P=r.P;P.recs[r.slot]=null;SKN.gv++;
 if(P.sk){P.sk.boneMatrices.fill(0,r.slot*16,r.slot*16+16);P.dq.push(r.slot);P.ch=true}const ms=SKN.mats.get(r.mat);if(ms&&--ms.n<=0)SKN.mats.delete(r.mat);
 const B=SKN.bat.get(r.key);if(B){B.dead++;B.later.push(r.slot);if(B.dead*3>B.recs.length)SKN.rb.add(r.key)}else P.free.push(r.slot);SKN.stats.dropped++;SKN.stats.why[why]=(SKN.stats.why[why]|0)+1}
function sknForgetAll(why){for(const P of SKN.P)for(const r of P.recs)if(r)sknDrop(r,why);for(const B of SKN.bat.values())if(B.mesh){if(B.mesh.parent)B.mesh.parent.remove(B.mesh);try{B.mesh.geometry.dispose()}catch(e){}}
 for(const L of SKN.pend.values())for(const o of L)if(o)delete o.__skn;for(const P of SKN.P)if(P.sk)try{P.sk.dispose()}catch(e){}SKN.P=sknPools();SKN.bat=new Map();SKN.pend=new Map();SKN.mats=new Map();SKN.drop=[];SKN.rb=new Set();SKN.scan=null;
 if(SKN.g&&SKN.g.parent)SKN.g.parent.remove(SKN.g);SKN.g=null}
function sknTick(q){const t0=performance.now();SKN.tn=(SKN.tn|0)+1;
 if(SKN.q!==q||!SKN.g||SKN.g.parent!==q.g){if(SKN.g||SKN.bat.size)sknForgetAll('left');SKN.q=q;SKN.g=new THREE.Group();SKN.g.userData={skn:1,dpKeep:1,noChunk:1};q.g.add(SKN.g);SKN.scanT=performance.now()-SKN.SCAN+3000}
 /* the shapes' own origin follows the camera (within 40 m), so the bones stay small numbers and nothing shakes far from the middle of the map */
 const cw=C.position;SKN.g.updateWorldMatrix(true,false);const ge=SKN.g.matrixWorld.elements;if(Math.hypot(ge[12]-cw.x,ge[13]-cw.y,ge[14]-cw.z)>40){_skV.set(Math.round(cw.x),Math.round(cw.y),Math.round(cw.z));q.g.worldToLocal(_skV);SKN.g.position.copy(_skV)}
 sknScan(q,SKN.BUD);
 /* one kind of material made (again) per frame */if(SKN.rb.size){const key=SKN.rb.values().next().value;SKN.rb.delete(key);sknBuild(q,key)}
 if((SKN.fr&31)===0){let n=0,nm=0;for(const P of SKN.P)for(const r of P.recs)if(r&&!r.dead){n++;if(P.id==='m')nm++}SKN.stats.pieces=n;SKN.stats.moving=nm}SKN.stats.batches=SKN.bat.size;SKN.stats.tick=performance.now()-t0}
{const ru=busRoamUpd;busRoamUpd=function(q,dt){const r=ru.apply(this,arguments);
 try{if(SKN.on&&q&&q.g&&q.chunks&&!q.ld&&q.dp&&q.dp.merged&&DP._mergedMat&&R.capabilities.floatVertexTextures&&typeof mwSelf=='function')sknTick(q);else if(SKN.g||SKN.bat.size)sknForgetAll('off')}
 catch(e){conLog('error','people batching: '+e.message);SKN.on=false;try{sknForgetAll('error')}catch(x){}}return r}}
{const u0=S.updateMatrixWorld;S.updateMatrixWorld=function(){const r=u0.apply(this,arguments);if(SKN.on&&SKN.g&&SKN.q&&SKN.g.parent===SKN.q.g)try{sknBones()}catch(e){conLog('error','people batching: '+e.message);SKN.on=false}return r}}
if(typeof LAGSYS!='undefined'){LAGSYS.push(['sknTick','People and moving pieces (batched)']);LAGSYS.push(['sknBones','People batching: bones (inside drawing)']);{const f0=sknBones;sknBones=function(){if(!LAG.open)return f0.apply(this,arguments);const t=performance.now();try{return f0.apply(this,arguments)}finally{const d=performance.now()-t;LAG.sys.sknBones=(LAG.sys.sknBones||0)+d;LAG.cur.sknBones=(LAG.cur.sknBones||0)+d}}}{const f0=sknTick;sknTick=function(){if(!LAG.open)return f0.apply(this,arguments);const t=performance.now();try{return f0.apply(this,arguments)}finally{const d=performance.now()-t;LAG.sys.sknTick=(LAG.sys.sknTick||0)+d;LAG.cur.sknTick=(LAG.cur.sknTick||0)+d}}}}
/* for testing: look everywhere and make every shape now */
function sknForce(){const q=BUS.ride;if(!q||!SKN.g)return null;SKN.scan=null;SKN.scanT=-1e9;sknScan(q,1e9);while(SKN.rb.size){const k=SKN.rb.values().next().value;SKN.rb.delete(k);sknBuild(q,k)}return SKN.stats}

/* r679: another camera drawing the desert (the office squad monitors...) sees everything: no leaving out for a second */
{const r0=R.render;R.render=function(sc,cam){if(sc===S&&cam!==C&&cam&&!(typeof WARM!='undefined'&&cam===WARM.cam))SKN.ocam=performance.now()+1000;return r0.apply(this,arguments)}}
