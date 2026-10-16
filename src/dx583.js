/* =====================================================================================================
   r585: BOUNTIES, A GAME SETTINGS TAB, AND BASE FIXES.
   - Crimes are rarer (every 6 to 10 minutes). When a getaway car is stopped the crook BAILS OUT AND RUNS. Catch him
     on foot and TACKLE him (E), PICK HIM UP (E) and take him to the Desert PD yourself (on foot or in any vehicle)
     for a 100 gold bounty. A strike, an airstrike or the missile knocks him out cold: pick him up the same way.
     The police still go after him too: if they get there first, they make the arrest.
   - Settings > GAME: skip the Desert Bus ride, desert crime on/off, map waypoints, place-name banners, camera shake.
   - The key man in launch control holds his clipboard (and reads it) instead of it floating in the air.
   - "Mouse free" moved down so it no longer covers the top bar.
   ===================================================================================================== */
/* ---------- game settings ---------- */
const GSET=(()=>{let o={};try{o=JSON.parse(localStorage.getItem('doorsGame1')||'{}')||{}}catch(e){}return Object.assign({crime:1,wps:1,ban:1,shake:1},o)})();
function gsSave(){try{localStorage.setItem('doorsGame1',JSON.stringify(GSET))}catch(e){}}
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.dataset)return;const k=t.dataset.sw;if(k&&/^g_/.test(k)){GSET[k.slice(2)]=t.checked?1:0;gsSave();if(k=='g_crime'&&!t.checked){for(const c of CRM.list)if(c.st=='rob'||c.st=='flee')try{crEnd(BUS.ride,c,'escaped')}catch(x){}}}},true);
document.addEventListener('input',e=>{const t=e.target;if(!t||!t.dataset||t.dataset.rng!='g_shake')return;GSET.shake=+t.value;gsSave();const b=document.querySelector('[data-rv="g_shake"]');if(b)b.textContent=Math.round(GSET.shake*100)+'%'},true);
{const cs0=camShake;camShake=function(a,b){const k=GSET.shake==null?1:+GSET.shake;if(k<=0)return;return cs0.call(this,a*k,b)}}
{const wl0=wpList;wpList=function(q){if(!GSET.wps)return[];return wl0.apply(this,arguments)}}
setInterval(()=>{try{if(!GSET.ban&&typeof HUD!='undefined'&&HUD.ban&&HUD.ban.style.opacity!='0')HUD.ban.style.opacity=0}catch(e){}},200);
{const sp0=crSpawn;crSpawn=function(){if(!GSET.crime)return;return sp0.apply(this,arguments)}}
/* ---------- the mouse-free note goes to the bottom of the screen ---------- */
try{munB.style.top='auto';munB.style.bottom='92px'}catch(e){}
/* ---------- the key man: clipboard in hand, reading it, looking round now and then ---------- */
function kmFix(q){const N=q.mil&&q.mil.nuke,km=N&&N.keyman;if(!km||km.__fx)return;const rg=km.children[0]&&km.children[0].userData.rig;if(!rg||!rg.arms||!rg.arms[0])return;km.__fx=1;
 try{const i=MILIDLE.indexOf(km);if(i>=0)MILIDLE.splice(i,1)}catch(e){}try{if(q.mil.kmClip)q.mil.kmClip.visible=false}catch(e){}
 const host=rg.body;const cb=new THREE.Group();const board=new THREE.Mesh(new THREE.BoxGeometry(.3,.4,.02),new THREE.MeshStandardMaterial({color:0x8a6a3a}));cb.add(board);const pap=new THREE.Mesh(new THREE.BoxGeometry(.26,.32,.005),new THREE.MeshStandardMaterial({color:0xf4f0e4}));pap.position.z=.013;cb.add(pap);const clip=new THREE.Mesh(new THREE.BoxGeometry(.12,.04,.03),new THREE.MeshStandardMaterial({color:0x8a8e94,metalness:.8}));clip.position.set(0,.19,.02);cb.add(clip);
 cb.position.set(0,.34,-.36);cb.rotation.set(-.8,0,0);host.add(cb);km.userData.kmT=0}
function kmTick(q,dt){const N=q.mil&&q.mil.nuke,km=N&&N.keyman;if(!km||!km.__fx)return;const rg=km.children[0].userData.rig;const t=(km.userData.kmT+=dt);const moving=km.userData.lx!=null&&Math.hypot(km.position.x-km.userData.lx,km.position.z-km.userData.lz)>dt*.3;km.userData.lx=km.position.x;km.userData.lz=km.position.z;
 if(moving)return;/* standing: clipboard arm up, reading; the other arm relaxed; now and then he looks up and round */const look=Math.sin(t*.3)>.7;const a0=rg.arms[0],a1=rg.arms[1];for(const a of[a0,a1]){if(!a)continue;a.p.rotation.x=.75+Math.sin(t*1.1)*.03;a.p.rotation.z=-a.s*.3;if(a.e)a.e.rotation.x=.7}
 rg.head.rotation.x=look?0:.38;rg.head.rotation.y=look?Math.sin(t*.9)*.5:0;rg.body.position.y=.92+Math.sin(t*1.6)*.006}
{const ru7=busRoamUpd;busRoamUpd=function(q,dt){const r=ru7.apply(this,arguments);try{kmFix(q);kmTick(q,dt)}catch(e){}try{crTick2(q,dt)}catch(e){conLog('error','bounty: '+e.message)}return r}}
/* ---------- crooks on foot: run, get tackled, get carried to the station ---------- */
function crRunner(q,c,x,z){try{if(c.rm&&c.rm.parent)return c.rm;const a=mkAvatar('Crook','crook'+c.id,0,[]);const g=new THREE.Group();g.add(a);const mk=new THREE.Mesh(new THREE.BoxGeometry(.5,.18,.12),VMAT(0x111111));mk.position.set(0,1.62,-.2);g.add(mk);g.position.set(x,0,z);q.g.add(g);c.rm=g;return g}catch(e){return null}}
function crFree(q,x,z){if(Math.abs(vehGround(q,x,z))>.4)return false;try{for(const o of obsNear(q,x,z))if(!o.off&&!o.veh&&x>o.x0-.35&&x<o.x1+.35&&z>o.z0-.35&&z<o.z1+.35)return false}catch(e){}return true}
function crTick2(q,dt){if(!q.roam)return;const lz=P.z-q.OZ,me=q.seat?q.seat.v:null,px=me?me.x:P.x,pz=me?me.z:lz;
 for(const c of CRM.list){if(c.st=='done')continue;
  /* a stopped getaway car: he bails out and runs for it */if(c.st=='stop'&&!c.rm&&c.v){const g=crRunner(q,c,c.v.x+Math.cos(c.v.h)*2.2,c.v.z-Math.sin(c.v.h)*2.2);if(g){c.st='run';c.t=0;c.x=g.position.x;c.z=g.position.z;hint('📻 DESERT PD: "Suspect has bailed out ON FOOT near '+c.loc.nm+'!" Catch him and TACKLE him (E).')}}
  if(c.st=='rob'&&c.m){c.x=c.m.position.x;c.z=c.m.position.z}
  if(c.st=='run'&&c.rm){const g=c.rm;const d0=Math.hypot(px-g.position.x,pz-g.position.z);/* he runs away from you, roughly towards his hideout */let ax=c.dest.x-g.position.x,az=c.dest.z-g.position.z;if(d0<25){ax=g.position.x-px;az=g.position.z-pz}const L=Math.hypot(ax,az)||1;ax/=L;az/=L;const sp=5.3*dt;let moved=false;
    for(const da of[0,.6,-.6,1.2,-1.2,2.1,-2.1]){const ca=Math.cos(da),sa=Math.sin(da),dx=ax*ca-az*sa,dz=ax*sa+az*ca,nx=g.position.x+dx*sp,nz=g.position.z+dz*sp;if(crFree(q,nx,nz)){g.position.x=nx;g.position.z=nz;g.rotation.y=Math.atan2(-dx,-dz);moved=true;break}}
    try{seekRunOn(g,dt)}catch(e){}g.position.y=Math.abs(Math.sin((q.rt||0)*11))*.06;c.x=g.position.x;c.z=g.position.z;if(c.t>150){hint('📻 DESERT PD: "We lost him on foot."');try{crEnd(q,c,'escaped')}catch(e){}if(g.parent)g.parent.remove(g)}}
  if(c.st=='ko'&&c.ko){c.x=c.ko.position.x;c.z=c.ko.position.z}
  if(c.st=='held'&&c.rm){c.x=c.rm.position.x;c.z=c.rm.position.z}
  /* the police go for him on foot too */if((c.st=='held'||(c.st=='ko'&&!c.v))&&!c.cop&&c.t>1)try{crCopOut(q,c)}catch(e){}const cp=c.cop;if(cp&&cp.v&&!cp.v.wreck&&(c.st=='run'||c.st=='held'||(c.st=='ko'&&!c.v))){const v=cp.v,d=Math.hypot(v.x-c.x,v.z-c.z);if(d>7)crDrive(q,cp,c.x,c.z,dt,22);else{v.v*=Math.max(0,1-dt*4);c.st='cuff';c.t=0;crCuff(q,c)}}
  /* carried: on your shoulder (or in your car); the police stand down; deliver at the station */
  if(c.st=='carried'){const g=c.rm||c.ko;if(g){if(me){g.visible=false}else{g.visible=true;const fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw);g.position.set(P.x+fx*.55+fz*.38,(P.dy||0)+1.15,lz+fz*.55-fx*.38);g.rotation.set(0,P.yaw+Math.PI/2,Math.PI/2,'YXZ')}}c.x=px;c.z=pz;
   if(cp&&cp.v){const pv=cp.v,d=crDrive(q,cp,DPD.X,DPD.Z+12,dt,16);if(d<12||Math.hypot(pv.x-DPD.X,pv.z-DPD.Z)<45){try{garRemove(q,pv)}catch(e){}c.cop=null}}
   if(Math.hypot(px-DPD.X,pz-DPD.Z)<20){c.st='done';c.why='bounty';if(g&&g.parent)g.parent.remove(g);gold+=100;try{saveGame();updHud();vfx('gold',P.x,1.2,P.z,{n:24})}catch(e){}snd(880,.1);setTimeout(()=>snd(1320,.15),140);try{if(milRank()>=1)milXP(q,20,'Bringing in a crook')}catch(e){}hint('🚔 You hand the crook over at the Desert PD. "Well, I never." BOUNTY: +100 gold.');try{badge('bounty')}catch(e){}}}}
 crPropSync(q)}
/* the E prompt that follows whichever crook you are near */
function crPropSync(q){if(!q.crP){q.crP={x:1e6,z:1e6,r:1.9,txt:()=>crPTxt(q),act:()=>crPAct(q)};q.props.push(q.crP)}const P2=q.crP;let best=null,bd=1e9;const lz=P.z-q.OZ;
 for(const c of CRM.list){if(!/^(rob|run|ko|held)$/.test(c.st))continue;const g=c.st=='rob'?c.m:c.st=='ko'?c.ko:c.rm;if(!g||!g.parent)continue;const d=Math.hypot(P.x-g.position.x,lz-g.position.z);if(d<bd){bd=d;best=c}}
 q.crPc=best;if(best){const g=best.st=='rob'?best.m:best.st=='ko'?best.ko:best.rm;P2.x=g.position.x;P2.z=g.position.z}else{P2.x=P2.z=1e6}}
function crPTxt(q){const c=q.crPc;if(!c||q.seat)return'';if(CRM.list.some(k=>k.st=='carried'))return'🫴 Your hands are full. Take the one you have to the Desert PD first.';return c.st=='rob'||c.st=='run'?'[E] 🤼 TACKLE the crook!':'[E] 🫴 Pick up the crook (take him to the Desert PD for a bounty)'}
function crPAct(q){const c=q.crPc;if(!c||q.seat||CRM.list.some(k=>k.st=='carried'))return;
 if(c.st=='rob'||c.st=='run'){if(c.st=='rob'){const g=crRunner(q,c,c.m.position.x,c.m.position.z);if(c.m)c.m.visible=false;if(c.v&&!c.v.wreck)c.v.v=0}const g=c.rm;if(!g)return;g.rotation.set(-Math.PI/2,g.rotation.y,0,'YXZ');g.position.y=.15;c.st='held';c.t=0;snd(90,.35);snd(300,.1);try{camShake(.35,.25)}catch(e){}c.help=1;c.tackled=1;hint('🤼 TACKLED! He is pinned. Either PICK HIM UP (E) and carry him to the Desert PD (100 gold bounty), or just hold on: the police are on the way and will pay you a finder\'s fee.');return}
 if(c.st=='ko'||c.st=='held'){c.st='carried';c.t=0;if(c.ko&&!c.rm){c.rm=c.ko;c.ko=null}snd(200,.1);hint('🫴 Over your shoulder he goes. Take him to the DESERT PD (walk, or put him in a car): 100 gold bounty.');if(c.cop)hint('🫴 The police car turns back: "All yours, citizen."')}}
/* a cuffing by the police uses the crook who is already there (running or pinned) */
{const cc1=crCuff;crCuff=function(q,c){if((c.rm||c.ko)&&c.cop&&c.cop.v){const g=c.rm||c.ko;c.rm=null;c.ko=null;g.rotation.set(0,g.rotation.y,0);g.position.y=0;c.cm=g;try{const rg=g.children[0].userData.rig;if(rg&&rg.arms)for(const A of rg.arms)A.p.rotation.x=-2.9}catch(e){}try{const k=mkCopSeek(.8);k.position.set(c.cop.v.x,.9,c.cop.v.z);q.g.add(k);c.km=k}catch(e){}hint('📻 DESERT PD: "Hands where I can see them!"');return}return cc1.apply(this,arguments)}}
/* waypoint: carrying one? the station */{const wl1=wpList;wpList=function(q){const L=wl1.apply(this,arguments);try{if(GSET.wps&&CRM.list.some(c=>c.st=='carried'))L.unshift({x:DPD.X,z:DPD.Z,t:'the DESERT PD (bounty)',main:1})}catch(e){}return L}}
try{BD.push(['bounty','🚔','Bounty Hunter','Carry a crook to the Desert PD yourself.']);BDIDX.bounty=BD[BD.length-1];BDI.push('bounty')}catch(e){}
