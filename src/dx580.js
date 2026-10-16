/* =====================================================================================================
   r580: CRIME IN THE DESERT. Every few minutes somebody robs a place out in the desert, jumps in a getaway car and
   runs for it. A Desert PD cruiser comes out of the station after them, and when it catches up: the crook is
   stopped, cuffed and driven back to the station.
   - Crimes show up RED on your map, on the missile guidance map and on the orbital strike / airstrike map.
   - You can help: ram the getaway car, blow it up, or drop something heavy on it from orbit. Helping the police
     catch a crook pays a reward (and none of it counts as a crime).
   ===================================================================================================== */
const CRM={list:[],next:240,seq:0};
const CRSPOTS=/^(Dusty Gulch|Motel 13|Rushy's Diner|Drive-in|Mirage Lake|Speedway|Goblino's Scrap|Observatory|Dino Dan|Sunny Acres|Lookout Mesa|Airfield|Old Quarry|Wind farm|Solar farm)/;
const CRKIND=[['robbery','💰','an armed robbery'],['carjack','🚗','a carjacking'],['heist','💎','a jewellery heist'],['smash','🔨','a smash and grab']];
function crBoss(q){try{return cwSlot(q)===0}catch(e){return true}}
function crSpawn(q){const L=(q.locs||[]).filter(l=>CRSPOTS.test(l.nm)&&!milArea(l.x,l.z,-40)&&Math.hypot(l.x-DPD.X,l.z-DPD.Z)>140);if(!L.length)return;const l=L[Math.random()*L.length|0],K=CRKIND[Math.random()*CRKIND.length|0];
 const id=++CRM.seq;let ox=l.x+8,oz=l.z+8;/* a clear spot near the place, big enough for a car */search:for(let r=6;r<60;r+=3)for(let k=0;k<12;k++){const a=k/12*6.283+r,x=l.x+Math.cos(a)*r,z=l.z+Math.sin(a)*r;let ok=vehGround(q,x,z)==0;if(ok)for(const o of q.obs){if(o.off)continue;if(x>o.x0-4&&x<o.x1+4&&z>o.z0-4&&z<o.z1+4){ok=false;break}}if(ok){ox=x;oz=z;break search}}const c={id,K,loc:l,x:ox,z:oz,st:'rob',t:0,help:0};
 /* the crook: a masked figure with a swag bag */try{const a=mkAvatar('Crook','crook'+id,0,[]);const g=new THREE.Group();g.add(a);const mk=new THREE.Mesh(new THREE.BoxGeometry(.5,.18,.12),VMAT(0x111111));mk.position.set(0,1.62,-.2);g.add(mk);const bag=new THREE.Mesh(new THREE.SphereGeometry(.28,10,8),VMAT(0x8a6a3a,{roughness:1}));bag.position.set(.35,.9,.15);bag.scale.y=1.2;g.add(bag);g.position.set(ox,0,oz);q.g.add(g);c.m=g}catch(e){}
 /* the getaway car, parked and waiting */const kinds=['sedan','truck','buggy'];const v=q.addVeh(kinds[Math.random()*3|0],ox+2.5,oz,Math.random()*6.28);v.npc=1;v.crim=id;v.nogar=1;v.owner='';for(const p of q.props)if(p.veh===v)p.txt=()=>'';c.v=v;c.u={v,stuck:0,bT:0};
 const far=(q.locs||[]).filter(k=>Math.hypot(k.x-l.x,k.z-l.z)>350&&!milArea(k.x,k.z,-40)&&!/Stunt|Phone/.test(k.nm));c.dest=far[Math.random()*far.length|0]||{x:-l.x,z:l.z,nm:'the edge of the map'};
 CRM.list.push(c);hint('📻 DESERT PD: "All units, '+K[2]+' in progress at '+l.nm+'!" 🚨 It is on your map.');try{snd(880,.1);setTimeout(()=>snd(660,.12),160)}catch(e){}}
function crCopOut(q,c){const v=q.addVeh('cop',DPD.X+(Math.random()-.5)*4,DPD.Z+12,0);v.npc=1;v.nogar=1;v.crimCop=c.id;v.owner='';for(const p of q.props)if(p.veh===v)p.txt=()=>'';try{pdLights(v)}catch(e){}c.cop={v,stuck:0,bT:0};hint('📻 DESERT PD: "Unit 13 responding. Lights and sirens."')}
function crDrive(q,u,x,z,dt,max){try{return cwDrive(q,u,x,z,dt,max,0)}catch(e){return 1e9}}
function crEnd(q,c,why){c.st='done';c.why=why;setTimeout(()=>{try{for(const v of[c.v,c.cop&&c.cop.v])if(v&&!v.gone)garRemove(q,v);for(const m of[c.m,c.cm])if(m&&m.parent)m.parent.remove(m)}catch(e){}},why=='escaped'?1000:45000)}
function crTick(q,dt){if(!q.roam||q.jail||(q.pen&&q.pen.on))return;
 CRM.next-=dt;if(CRM.next<=0){CRM.next=360+Math.random()*240;if(!CRM.list.some(c=>c.st!='done')&&crBoss(q)&&!q.deep)try{crSpawn(q)}catch(e){conLog('error','crime: '+e.message)}}
 for(let i=CRM.list.length-1;i>=0;i--){const c=CRM.list[i];c.t+=dt;if(c.st=='done'){if(c.t>60)CRM.list.splice(i,1);continue}const v=c.v;
  if(c.st=='rob'){if(c.m)c.m.rotation.y+=Math.sin(c.t*3)*dt;if(c.t>18){c.st='flee';c.t=0;if(c.m)c.m.visible=false;try{snd(300,.1)}catch(e){}hint('📻 DESERT PD: "Suspect fleeing '+c.loc.nm+' towards '+c.dest.nm+'!"')}if(c.t>6&&!c.cop)crCopOut(q,c);if(c.cop&&!c.cop.v.wreck){const d=crDrive(q,c.cop,c.loc.x+8,c.loc.z+8,dt,24);if(d<12)c.cop.v.v*=Math.max(0,1-dt*3)}continue}
  if(c.st=='flee'){c.x=v.x;c.z=v.z;if(!c.cop&&c.t>2)crCopOut(q,c);
   if(v.wreck||(v.dmg||0)>70){c.st='stop';c.t=0;c.help=1;hint('📻 "The getaway car is out of action! The suspect is crawling out. Hold him there!"')}
   else{const d=crDrive(q,c.u,c.dest.x,c.dest.z,dt,18);if(d<14||c.t>240){hint('📻 DESERT PD: "We lost him. Suspect escaped."');crEnd(q,c,'escaped');continue}}}
  if(v&&(c.st=='stop'||c.st=='ko')){v.v*=Math.max(0,1-dt*3);if(!c.cop&&c.t>1)crCopOut(q,c)}
  /* the police car chases */const cp=c.cop;if(cp&&v&&(c.st=='flee'||c.st=='stop'||c.st=='ko')){const pv=cp.v;const d=Math.hypot(pv.x-v.x,pv.z-v.z);if(d>9){/* aim at where the car is, re-planned every couple of seconds (not every frame) so the route search can finish */cp.tgT=(cp.tgT||0)-dt;if(!cp.tg||cp.tgT<=0||Math.hypot(cp.tg[0]-v.x,cp.tg[1]-v.z)>30){cp.tg=[v.x,v.z];cp.tgT=2.5}crDrive(q,cp,d<40?v.x:cp.tg[0],d<40?v.z:cp.tg[1],dt,24)}else{pv.v*=Math.max(0,1-dt*4);c.near=(c.near||0)+dt;if(c.near>1.4||c.st=='stop'||c.st=='ko'){if(c.st=='stop'||c.st=='ko'||Math.abs(v.v)<4||c.near>3){c.st='cuff';c.t=0;v.v=0;crCuff(q,c)}}}
   if(pv.wreck){hint('📻 "Unit 13 is down! Suspect still at large."');c.cop=null}}
  if(c.st=='cuff'){crCuffTick(q,c,dt)}
  if(c.st=='home'){const pv=cp&&cp.v;if(!pv){crEnd(q,c,'caught');continue}const d=crDrive(q,cp,DPD.X,DPD.Z+12,dt,16);if(d<10||c.t>60||Math.hypot(pv.x-DPD.X,pv.z-DPD.Z)<45){crEnd(q,c,'caught');try{garRemove(q,pv)}catch(e){}c.cop=null}}}}
/* the arrest: the crook gets out with his hands up, the officer walks over, cuffs him, and walks him to the car */
function crCuff(q,c){const v=c.v,pv=c.cop.v;try{const a=mkAvatar('Crook','crook'+c.id,0,[]);const g=new THREE.Group();g.add(a);g.position.set(v.x+Math.cos(v.h)*2.2,0,v.z-Math.sin(v.h)*2.2);q.g.add(g);c.cm=g;try{const rg=a.userData&&a.userData.rig;if(rg&&rg.arms)for(const A of rg.arms)A.p.rotation.x=-2.9}catch(e){}}catch(e){}
 try{const k=mkCopSeek(.8);k.position.set(pv.x,.9,pv.z);q.g.add(k);c.km=k}catch(e){}
  hint('📻 DESERT PD: "Hands where I can see them!"');try{snd(960,.2);setTimeout(()=>snd(740,.2),250)}catch(e){}}
function crCuffTick(q,c,dt){const pv=c.cop&&c.cop.v,k=c.km,g=c.cm;if(!pv||!k||!g){c.st='home';c.t=0;return}
 if(c.t<2.2){const dx=g.position.x-k.position.x,dz=g.position.z-k.position.z,d=Math.hypot(dx,dz);if(d>1)k.position.x+=dx/d*Math.min(d-1,dt*3),k.position.z+=dz/d*Math.min(d-1,dt*3);k.rotation.y=Math.atan2(-dx,-dz);try{seekRunOn(k,dt)}catch(e){}g.rotation.y=Math.atan2(k.position.x-g.position.x,k.position.z-g.position.z)+Math.PI}
 else if(c.t<3.2){if(!c.cuffed){c.cuffed=1;try{snd(1500,.05);setTimeout(()=>snd(1700,.05),120)}catch(e){}try{const rg=g.children[0].userData.rig;if(rg&&rg.arms)for(const A of rg.arms){A.p.rotation.x=.5;A.p.rotation.z=0}}catch(e){}}}
 else if(c.t<6){for(const m of[g,k]){const dx=pv.x-m.position.x,dz=pv.z-m.position.z,d=Math.hypot(dx,dz);if(d>1.4){m.position.x+=dx/d*dt*2.2;m.position.z+=dz/d*dt*2.2;m.rotation.y=Math.atan2(-dx,-dz)}}}
 else{g.visible=false;k.visible=false;c.st='home';c.t=0;const rw=c.tackled?60:(c.help&&!c.paidKO)?40:0;if(rw){gold+=rw;try{saveGame();updHud()}catch(e){}}hint('📻 DESERT PD: "Suspect in custody."'+(rw?' Thanks for the help: +'+rw+' gold.':''));try{if(c.help&&milRank()>=1)milXP(q,15,'Helping the Desert PD')}catch(e){}}}
{const ru3=busRoamUpd;busRoamUpd=function(q,dt){const r=ru3.apply(this,arguments);try{crTick(q,dt)}catch(e){conLog('error','crime: '+e.message)}return r}}
/* hitting the getaway car is not a crime: it is helping */
{const ah3=addHeat;addHeat=function(q,n,why){try{if(q&&q.crimOK>performance.now()&&/^(car|veh|crash|ram)$/.test(why||''))return}catch(e){}return ah3.apply(this,arguments)}}
{const vd2=vehDamage;vehDamage=function(q,v,n){try{const o=v&&v.hitO;if(v&&v.crim||(o&&typeof o=='object'&&o.crim)){q.crimOK=performance.now()+600;const c=CRM.list.find(c=>c.id==(v.crim||o.crim));if(c)c.help=1}}catch(e){}return vd2.apply(this,arguments)}}
{const vb3=vehBlow;vehBlow=function(q,v,mine){try{if(v&&v.crim){q.crimOK=performance.now()+600;const c=CRM.list.find(c=>c.id==v.crim);if(c)c.help=1}}catch(e){}return vb3.apply(this,arguments)}}
/* ---------- crimes on the maps ---------- */
function crMarks(){return CRM.list.filter(c=>c.st!='done'&&c.st!='home')}
{const dd1=dmapDraw;dmapDraw=function(q,cv,cx,cz,sc,full){const r=dd1.apply(this,arguments);try{const L=crMarks();if(!L.length)return r;const x=cv.getContext('2d'),W=cv.width,H=cv.height,X=wx=>W/2+(wx-cx)*sc,Y=wz=>H/2+(wz-cz)*sc,t=performance.now()/1000;x.save();
  for(const c of L){const px=X(c.x),py=Y(c.z),R=Math.max(full?12:8,(c.st=='rob'?35:16)*sc)*(1+Math.sin(t*5)*.15);x.fillStyle='rgba(255,30,30,.22)';x.strokeStyle='rgba(255,60,60,.95)';x.lineWidth=2;x.beginPath();x.arc(px,py,R,0,7);x.fill();x.stroke();x.font=(full?18:13)+'px serif';x.textAlign='center';x.textBaseline='middle';x.fillText('🚨',px,py);if(full){x.font='bold 12px Georgia';x.fillStyle='#ffd0d0';x.fillText(c.K[0].toUpperCase()+(c.st=='flee'?' · FLEEING':''),px,py-R-8)}
   if(c.cop&&c.cop.v){const cv2=c.cop.v;x.fillStyle=(t*6|0)%2?'#ff2020':'#2040ff';x.beginPath();x.arc(X(cv2.x),Y(cv2.z),full?6:4,0,7);x.fill()}}x.restore()}catch(e){}return r}}
{const np0=ngPaint;ngPaint=function(k,W,H,q,t,small){const r=np0.apply(this,arguments);try{const L=crMarks();const tt=performance.now()/1000;for(const c of L){const[a,b]=ngMapXY(c.x,c.z,W,H);const R=(c.st=='rob'?14:9)*(1+Math.sin(tt*5)*.15);k.fillStyle='rgba(255,30,30,.35)';k.strokeStyle='#ff4040';k.lineWidth=2;k.beginPath();k.arc(a,b,R,0,6.283);k.fill();k.stroke();k.fillStyle='#ffb0b0';k.font='bold 11px monospace';k.textAlign='left';k.fillText('CRIME: '+c.K[0].toUpperCase(),a+R+3,b+4)}}catch(e){}return r}}
/* =====================================================================================================
   PLAY DESERT: once you have been out to the desert, the main menu has a PLAY DESERT button. It drops you into a
   PUBLIC desert: if somebody is already out there in one, you join them (BUS 13 drops you at the mining shack);
   if not, you start one, and anybody else who presses PLAY DESERT joins you.
   ===================================================================================================== */
const PDZ={me:null,ads:{},sub:0,busy:0};const PDZT=()=>FRB+'pdz/';
async function pdzNet(){const cl=await pubConnect();if(!cl)return null;if(!PDZ.sub){PDZ.sub=1;cl.on('message',(t,m)=>{t=String(t);if(!t.startsWith(PDZT()))return;const id=t.slice(PDZT().length);let o=null;try{o=m&&String(m)?JSON.parse(String(m)):null}catch(e){}if(!o||!/^[A-Z0-9]{6}$/.test(String(o.code||''))){delete PDZ.ads[id];return}PDZ.ads[id]={code:String(o.code),sd:o.sd>>>0,nm:fsName(String(o.nm||''))||'Player',n:Math.max(1,Math.min(16,o.n|0)),t:+o.t||0}});cl.subscribe(PDZT()+'+')}return cl}
async function pdzPlay(){if(PDZ.busy)return;PDZ.busy=1;try{if(BUS.ride||HUB.on||state=='play'){hint('Leave what you are doing first.');return}if(ID.banned){banShow();return}
 let cl=null;try{cl=await pdzNet()}catch(e){}hint('🏜️ Looking for a public desert...');await new Promise(r=>setTimeout(r,1500));
 const now=Date.now(),L=Object.entries(PDZ.ads).filter(([id,a])=>id!==SV.pid&&now-a.t<35000&&a.n<8&&!isBanned(id)&&!(PDZ.bad&&PDZ.bad[a.code])).sort((a,b)=>b[1].n-a[1].n||b[1].t-a[1].t);
 for(const[id,a]of L.slice(0,3)){sysLine('🏜️ Joining '+a.nm+'\'s desert ('+a.n+' out there)...');MP.auto=1;try{await pjJoin(a.code);busBoard(true,1,[],a.sd,()=>{if(BUS.ride)BUS.ride.t=26.5});sysLine('🔗 Connected! BUS 13 drops you at the mining shack: the others are out there somewhere.');return}catch(e){(PDZ.bad=PDZ.bad||{})[a.code]=1;try{mpLeave(true)}catch(x){}sysLine('🏜️ Could not reach '+a.nm+'\'s desert (their network blocks direct connections). Trying the next one...')}}
 if(L.length)sysLine('🏜️ None of the public deserts would connect: starting your own, so others can join you.');
 const sd=(Math.random()*4294967295)>>>0;busBoard(true,0,[],sd);let code='';try{code=await pjHost()}catch(e){sysLine('Could not open your desert to other players: you are on your own this time.');return}
 PDZ.me={code,sd};pdzAd();sysLine('🏜️ You started a PUBLIC DESERT: anyone who presses PLAY DESERT will join you.')}finally{PDZ.busy=0}}
function pdzAd(clear){try{const cl=PUB.cl;if(!cl||!cl.connected||!PDZ.me)return;if(clear){cl.publish(PDZT()+SV.pid,'',{retain:true,qos:0});return}cl.publish(PDZT()+SV.pid,JSON.stringify({code:PDZ.me.code,sd:PDZ.me.sd,nm:String(SV.nm||'Player').slice(0,16),n:1+(MP.on?mpOpen().length:0),t:Date.now()}),{retain:true,qos:0})}catch(e){}}
setInterval(()=>{try{if(!PDZ.me)return;if(!BUS.ride||!MP.on||!MP.host){pdzAd(true);PDZ.me=null;return}pdzAd()}catch(e){}},15000);
addEventListener('beforeunload',()=>{try{if(PDZ.me)pdzAd(true)}catch(e){}});
/* the button (after your first trip out there) */
{const mb0=menuBtns;menuBtns=function(){let h=mb0.apply(this,arguments);try{if(SV.dsr||SV.dsv){const i=h.indexOf('</button>');if(i>0)h=h.slice(0,i+9)+'<button onclick="event.stopPropagation();pdzPlay()" class="mnu-big" style="background:#2a1a0a;color:#ffe2b0;border-color:#e0a050;line-height:1.15">🏜️ PLAY DESERT<span style="display:block;font-size:12px;font-weight:normal;letter-spacing:1px;color:#f0c890;margin-top:3px">a public desert: join whoever is out there</span></button>'+h.slice(i+9)}}catch(e){}return h}}
setInterval(()=>{try{const q=BUS.ride;if(q&&q.roam&&!SV.dsr){SV.dsr=1;saveGame()}}catch(e){}},5000);

/* ---------- a strike (orbital, airstrike, missile, a big explosion) on a crime knocks the crook out cold ---------- */
function crKO(q,c,why){if(!c||c.st=='done'||c.st=='home'||c.st=='cuff'||c.st=='ko')return;const wasRob=c.st=='rob';c.st='ko';c.t=0;c.help=1;
 try{if(c.v&&!c.v.wreck){q.crimOK=performance.now()+800;vehBlow(q,c.v,false)}}catch(e){}
 /* the crook, flat on his back next to the wreck (or where he was robbing) */try{const onFoot=wasRob||!c.v||c.rm,x=onFoot?c.x:c.v.x+2,z=onFoot?c.z:c.v.z+1.5;if(c.m)c.m.visible=false;if(c.rm){if(c.rm.parent)c.rm.parent.remove(c.rm);c.rm=null}const a=mkAvatar('Crook','crook'+c.id,0,[]);const g=new THREE.Group();g.add(a);g.position.set(x,.15,z);g.rotation.set(-Math.PI/2,Math.random()*6,0,'YXZ');q.g.add(g);c.ko=g}catch(e){}
 if(!c.paidKO){c.paidKO=1;gold+=40;try{saveGame();updHud()}catch(e){}try{if(milRank()>=1)milXP(q,15,'Stopping a crime')}catch(e){}}
 hint('📻 DESERT PD: "Suspect is DOWN at '+c.loc.nm+'. '+(why||'That was a direct hit')+'. Units moving in to make the arrest." +40 gold.')}
{const bm4=boom;boom=function(q,x,y,z,mine,pw){const r=bm4.apply(this,arguments);try{if(q&&CRM.list.length){const R=6+(pw||1)*6;for(const c of CRM.list){if(c.st=='done'||c.st=='home'||c.st=='cuff'||c.st=='ko')continue;const cx=c.x,cz=c.z;if(Math.hypot(cx-x,cz-z)<R)crKO(q,c)}}}catch(e){}return r}}
{const ni2=ngImpact;ngImpact=function(q,t){try{for(const c of CRM.list){if(c.st=='done'||c.st=='home'||c.st=='cuff')continue;const cx=c.x,cz=c.z;if(Math.hypot(cx-t.x,cz-t.z)<120)crKO(q,c,'The missile took care of it')}}catch(e){}return ni2.apply(this,arguments)}}
/* the knocked-out crook gets up when the officer arrives, then the usual cuffs */
{const cc0=crCuff;crCuff=function(q,c){try{if(c.ko){if(c.ko.parent)c.ko.parent.remove(c.ko);c.ko=null}}catch(e){}return cc0.apply(this,arguments)}}
