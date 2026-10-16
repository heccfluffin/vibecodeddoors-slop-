/* =====================================================================================================
   r548: LAUNCH CONTROL, tidied up, and a guide round the RESTRICTED ZONE.
   - The LAUNCH button stood in mid-air at the end of the console: it now sits on its own armoured pedestal, with a
     hazard band, a riser for its LAUNCH plate and a flipped-up safety cover. The LAUNCH KEY plates get risers too.
   - The key man holds his clipboard (it moves with him); when the fire alarm sends him off he leaves it on a little
     side table, instead of it hanging in the air where he stood.
   - Every soldier on the base gets a soft contact shadow, so nobody looks like they are hovering.
   - Officers (Lieutenant and up) in the restricted zone get waypoints: a tour of what is there, and, once you have
     the rank and the codes, the launch sequence step by step.
   ===================================================================================================== */
function lrFix(q){const ML=q.mil;if(!ML||!ML.nuke||q.lrFix)return;q.lrFix=1;const g=q.g,N=ML.nuke;
 const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.6,metalness:.4},o||{})),A=(geo,m,x,y,z)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);g.add(o);return o},BX=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
 const DK=M(0x2a3038),YL=M(0xe8c020,{metalness:.2}),BK=M(0x151515,{metalness:.2});
 /* the launch pedestal under the button (button top sits at 1.2, its ring at 1.14) */
 A(BX(1.2,1.08,.9),DK,524,.54,-712);A(BX(1.3,.06,1),M(0x3a4048),524,1.11,-712);
 for(let i=0;i<8;i++)A(BX(.15,.12,.92),i%2?BK:YL,524-.525+i*.15,.9,-712);                        /* hazard band */
 A(BX(1.3,1.05,.1),DK,524,1.6,-712.5);                                                             /* riser behind the LAUNCH plate */
 const lid=A(BX(.8,.02,.8),new THREE.MeshStandardMaterial({color:0xc8e0ff,transparent:true,opacity:.35,roughness:.1,metalness:.1,depthWrite:false}),524,1.5,-712.32);lid.rotation.x=-1.35;   /* the safety cover, flipped up */
 A(BX(.82,.04,.04),M(0x8a8a8a),524,1.16,-712.42);                                                  /* its hinge */
 q.obs.push({x0:523.35,x1:524.65,z0:-712.5,z1:-711.5});
 /* risers for the LAUNCH KEY plates */for(const x of[508,538])A(BX(1.4,1.0,.08),DK,x,1.62,-712.47);
 /* a side table by the key man's spot, for the clipboard */const tb=M(0x5a4a3a,{metalness:.1,roughness:.8});A(BX(.7,.05,.5),tb,531.6,.92,-701.4);for(const[a,b]of[[-.3,-.2],[.3,-.2],[-.3,.2],[.3,.2]])A(BX(.05,.9,.05),M(0x3a3a3a),531.6+a,.45,-701.4+b);q.obs.push({x0:531.2,x1:532,z0:-701.7,z1:-701.1});
 q.obsDirty=1;
 /* the clipboard follows the key man */
 q.anims.push(dt=>{const c=ML.kmClip,km=N.keyman;if(!c||!km)return;if(N.fireAl>0&&N.clipOK!==undefined&&Math.hypot(km.position.x-530,km.position.z+700)>1){c.position.set(531.6,.96,-701.4);c.rotation.set(-Math.PI/2,0,.3)}
  else{const a=km.rotation.y,ox=.4,oz=-.38;c.position.set(km.position.x+ox*Math.cos(a)+oz*Math.sin(a),km.position.y+.35,km.position.z-ox*Math.sin(a)+oz*Math.cos(a));c.rotation.set(-.35,a,0)}})}
setInterval(()=>{try{const q=BUS.ride;if(q&&q.roam&&q.mil&&q.mil.nuke)lrFix(q)}catch(e){conLog('error','launch room: '+e.message)}},1000);
/* contact shadows under soldiers */
let SSHM=null;function sshMat(){if(SSHM)return SSHM;const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),gr=x.createRadialGradient(32,32,2,32,32,30);gr.addColorStop(0,'rgba(0,0,0,.55)');gr.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=gr;x.fillRect(0,0,64,64);SSHM=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false});return SSHM}
{const ms0=mkSoldier;mkSoldier=function(o){const s=ms0.apply(this,arguments);try{const sh=new THREE.Mesh(new THREE.PlaneGeometry(1.1,1.1),sshMat());sh.rotation.x=-Math.PI/2;sh.position.y=-1.04;sh.renderOrder=1;s.add(sh);/* sit it 7 cm above the ground once the soldier has been placed (they are scaled, and some sit on things) */setTimeout(()=>{try{const k=s.scale.y||1,py=s.position.y;sh.position.y=(py>.7&&py<1.2?.07-py:-.83*1.25)/k;if(py<.7||py>1.2)sh.visible=false}catch(e){}},0)}catch(e){}return s}}
/* ---- the restricted-zone guide ---- */
function milRZWay(q){const M=q.mil,S=milSV();if(!M||M.op||(S.r|0)<5)return null;const lz=P.z-q.OZ,Z=MILRZ;const inRZ=P.x>Z.x0&&P.x<Z.x1&&lz>Z.z0-12&&lz<Z.z1;if(!inRZ)return null;const N=M.nuke;
 if(N&&N.st=='idle'&&N.armed){if(!(N.keyA>0))return[508,-710.8,'LAUNCH KEY A'];if(!(N.keyB>0))return[538,-710.8,'LAUNCH KEY B (within 6 s!)'];return[524,-710.5,'the LAUNCH button']}
 if(N&&N.st=='idle'&&!(N.cool>0)&&(S.r|0)>=7&&S.kn)return[516,-710.5,'the LAUNCH CONSOLE (enter your codes)'];
 const V=S.rzv||(S.rzv={});const pv=M.proto&&!M.proto.gone?M.proto:null;
 const stops=[['h',pv?pv.x:375,pv?pv.z:-694,'HANGAR 1 · the X-13 WRAITH','✈️ Hangar 1: the X-13 WRAITH prototype. Flying it is a Colonel\'s job (X-13 trials). Take it without clearance and every alarm on the base goes off.'],
  ['l',516,-704,'LAUNCH CONTROL','☢️ Launch control. The two-man rule is in force: codes on the console, LAUNCH KEY A and B, then the button. A Major can take the LAUNCH CODE TEST (Ops board in HQ) to learn the codes.'],
  ['s',578,-691,'SILO 1','🚀 Silo 1. Keep clear during a launch... which will not happen. Probably.'],
  ['p',456.5,-680,'the SUBSTATION','⚡ The substation feeds Hangar 1. (Pulling its breakers counts as sabotage: do not.)']];
 for(const s of stops){if(V[s[0]])continue;if(Math.hypot(P.x-s[1],lz-s[2])<7){V[s[0]]=1;try{saveGame()}catch(e){}hint(s[4]);continue}return[s[1],s[2],s[3]]}
 if((S.r|0)>=7&&!S.kn)return[392,-850.5,'the OPS BOARD in HQ (Launch code test)'];return null}
{const w0=milWaypoint;milWaypoint=function(q){const r=w0.apply(this,arguments);if(r)return r;try{return milRZWay(q)}catch(e){return null}}}
