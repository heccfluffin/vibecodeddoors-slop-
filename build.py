import subprocess,re
import os
ROOT=os.path.dirname(os.path.abspath(__file__))
S=ROOT+'/src/'
OUTF=ROOT+'/out/DOORS.html'
os.makedirs(ROOT+'/out',exist_ok=True)
s=open(S+'bak519.html').read()
def R(a,b):
    global s
    c=s.count(a);assert c==1,(a[:70],c);s=s.replace(a,b)
# Honcho's grudge: say why, only trigger up close, and it is spent once he has had his revenge
R("function hcEnterBoss(r){hcWatch=(SV.hg&&r.hn&&!r.hn.gone)?{t:0}:null}","function hcEnterBoss(r){hcWatch=(SV.hg&&r.hn&&!r.hn.gone)?{t:0}:null;if(hcWatch)setTimeout(()=>{if(hcWatch&&!HC)hint('😠 Honcho remembers YOU stole his Starlight Jug in an earlier run. He is eyeing his new jug... keep your distance! (The grudge ends once he has slammed you into the sewers.)')},600)}")
R("hcWatch.t+=dt;if(Math.hypot(hn.pt.x-P.x,hn.pt.z-P.z)<9||hcWatch.t>6)hcDrink()}","hcWatch.t+=dt;if(Math.hypot(hn.pt.x-P.x,hn.pt.z-P.z)<6)hcDrink()}")
R("sysLine('😡 '+nm+(o.hd?' made Honcho drink the jug!':' stole Honcho\\'s jug! He is after them.'))","sysLine('😡 '+nm+(o.hd?' walked up to Honcho, who still had a grudge from the last time they stole his jug. He drank a Starlight Jug and is after THEM.':' stole Honcho\\'s jug! He is after them.'))")
# the hole Honcho slams you through shows up for everyone, where it actually is
R("function holeAt(x,z){const r=RMS[ci];if(!r)return;const y=(P.dy||0),hg=new THREE.Group();","let HOLE_L=null;function holeAt(x,z){const r=RMS[ci];if(!r)return;const y=(P.dy||0),hg=new THREE.Group();HOLE_L={x,z,y,n:r.n,t:Date.now()};/* slammed through the floor: Honcho has had his revenge, the grudge is over */if(SV.hg&&!dbgCheat){SV.hg=0;try{saveGame()}catch(e){}setTimeout(()=>{try{sysLine('🕊️ Honcho got his revenge. His grudge about the jug is over.')}catch(e){}},2500)}")
R("mpSend({t:'sew',s:mpS(),key:B.mpKey,n,x:px,z:pz,y:P.dy||0,sd,nm:SV.nm||''})","{const HL=HOLE_L&&HOLE_L.n===n&&Date.now()-HOLE_L.t<4000?HOLE_L:null;mpSend(Object.assign({t:'sew',s:mpS(),key:B.mpKey,n,x:px,z:pz,y:P.dy||0,sd,nm:SV.nm||''},HL?{hx:+HL.x.toFixed(2),hz:+HL.z.toFixed(2),hy:+(HL.y||0).toFixed(2)}:{}))}")
R("MP.sew[nn]={key:String(o.key||''),x:+o.x||0,z:+o.z||0,y:+o.y||0,","MP.sew[nn]={key:String(o.key||''),x:+o.x||0,z:+o.z||0,y:+o.y||0,hx:o.hx!=null?+o.hx:null,hz:o.hz!=null?+o.hz:null,hy:o.hy!=null?+o.hy:null,")
R("function mpSewApply(r){const q=MP.sew&&MP.sew[r.n];if(!q||q.done||q.hz)return;q.hz=1;(r.holes=r.holes||[]).push({x:q.x,z:q.z,y:q.y,sew:q});const hg=new THREE.Group();hg.position.set(q.x,q.y+.07,q.z);",
 "function mpSewApply(r){const q=MP.sew&&MP.sew[r.n];if(!q||q.done||q.hzd)return;q.hzd=1;const HX=q.hx!=null?q.hx:q.x,HZ=q.hz!=null?q.hz:q.z,HY=q.hy!=null?q.hy:q.y;(r.holes=r.holes||[]).push({x:HX,z:HZ,y:HY,sew:q});const hg=new THREE.Group();hg.position.set(HX,HY+.07,HZ);")
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx522.js').read()+"\n"+s[k:]
# the debug / admin menu in multiplayer: the game keeps running underneath it
R("if(state=='debug'||dbgLocked)return;dbgPrev=state;state='debug';for(const k in keys)keys[k]=0;document.exitPointerLock();dp.style.display='flex';dbgShow()}","if(state=='debug'||DBGMP||dbgLocked)return;dbgPrev=state;if((MP.on&&mpOpen().length||HUB.on)&&(state=='play'||state=='spec')){DBGMP=1}else state='debug';for(const k in keys)keys[k]=0;document.exitPointerLock();dp.style.display='flex';dbgShow()}")
R("function dbgClose(){dp.style.display='none';state=dbgPrev;","function dbgClose(){dp.style.display='none';if(DBGMP){DBGMP=0;if(state=='play'&&!MOB.on)try{R.domElement.requestPointerLock()}catch(e){}return}state=dbgPrev;")
R("state=='debug'?dbgClose():dbgOpen();return}if(state=='debug')return;","(state=='debug'||DBGMP)?dbgClose():dbgOpen();return}if(state=='debug'||DBGMP)return;")
R("if(state=='debug'&&mpOpen().length&&!mpDbgOn&&!myRank()){dbgClose();","if((state=='debug'||DBGMP)&&mpOpen().length&&!mpDbgOn&&!myRank()){dbgClose();")
R("if(!mpDbgOn&&state=='debug')dbgClose();","if(!mpDbgOn&&(state=='debug'||DBGMP))dbgClose();")
R("{const sd=document.getElementById('staffDlg');if(sd&&sd.style.display=='flex'&&(HUB.on||MP.on))return}","{const sd=document.getElementById('staffDlg');if((sd&&sd.style.display=='flex'||DBGMP)&&(HUB.on||MP.on))return}")
R("'<h3 style=\"margin:12px 0 4px\">🚌 Desert Bus speed (now ×'","'<h3 style=\"margin:12px 0 4px\">💜 Events</h3>'+sBtn('💜 Revive everyone (free)','admReviveAll()','#5a1a3a')+'<div style=\"font-size:12px;opacity:.7\">Gets every downed player in your co-op game back up, for free.</div>'+'<h3 style=\"margin:12px 0 4px\">🚌 Desert Bus speed (now ×'")
R("function mpChaseEnd(o){if(!smOn()||mpDead)return;","function mpChaseEnd(o){if(!smOn())return;MP.ceN=Math.max(MP.ceN||0,o.n|0);MP.ceNm=fsName(o.nm)||'A teammate';if(mpDead)return;")
R("[523,659,784,1047,1319].forEach((f,i)=>setTimeout(()=>snd(f,.22),i*90));pFlash();try{R.domElement.requestPointerLock()}catch(e){}}\n/* chat commands","[523,659,784,1047,1319].forEach((f,i)=>setTimeout(()=>snd(f,.22),i*90));pFlash();try{R.domElement.requestPointerLock()}catch(e){}setTimeout(()=>{try{mpReviveChaseFix()}catch(e){}},500)}\n/* chat commands")
R("MP.sew={};noBackN=-1;","MP.sew={};MP.ceN=0;noBackN=-1;")
R("a.push({k:'fig',n,x:+fig.m.position.x.toFixed(2),y:+fig.m.position.y.toFixed(2),z:+fig.m.position.z.toFixed(2),r:+fig.m.rotation.y.toFixed(2),st:fig.stun>0?1:0,","a.push({k:'fig',n,x:+fig.m.position.x.toFixed(2),y:+fig.m.position.y.toFixed(2),z:+fig.m.position.z.toFixed(2),r:+fig.m.rotation.y.toFixed(2),st:fig.stun>0?1:0,dk:(fig.inv&&fig.inv.obj&&fig.inv.obj.k=='vend'&&fig.inv.dk>0)?+fig.inv.dk.toFixed(2):0,")
R("else if(key=='fig'){const md=g.children[0],lg=md&&md.userData.legs,ar=md&&md.userData.arms;gh.ph=(gh.ph||0)+mv*dt*2.4;const sw=Math.sin(gh.ph)*.75*Math.min(1,mv/1.5);if(lg){lg[0].rotation.x=sw;lg[1].rotation.x=-sw}if(ar)ar.forEach((a,i)=>a.rotation.set((i?sw:-sw)*.6,0,a.userData.s*.12))}","else if(key=='fig'&&m.dk>0){try{figGhostDrink(gh,g,m,room,dt)}catch(e){}}else if(key=='fig'){if(gh.can||gh.thx)figGhostDrinkEnd(gh);const md=g.children[0],lg=md&&md.userData.legs,ar=md&&md.userData.arms;gh.ph=(gh.ph||0)+mv*dt*2.4;const sw=Math.sin(gh.ph)*.75*Math.min(1,mv/1.5);if(lg){lg[0].rotation.x=sw;lg[1].rotation.x=-sw}if(ar)ar.forEach((a,i)=>a.rotation.set((i?sw:-sw)*.6,0,a.userData.s*.12))}")
R("const chase=!!cut&&!!cut.pud||!!(seek&&seek.on)||seekChase()||","const chase=!!cut&&!!cut.pud||!!(seek&&seek.on)||seekChase()||(MP.on&&(mpDead||state=='spec')&&((MP.sm&&MP.sm.seek&&smLive('seek'))||Object.values(MP.remotes||{}).some(r=>!r.dd&&Date.now()-r.t<3000&&typeof chIdx=='function'&&chIdx(r.n)>=0)))||")
R("if(state!='play'&&state!='paused'&&state!='keypad'&&state!='spec'&&state!='cart'&&state!='sewer'){SKM.quiet=9}","if(state!='play'&&state!='paused'&&state!='keypad'&&state!='spec'&&state!='cart'&&state!='sewer'&&!(MP.on&&mpDead&&state=='dead')){SKM.quiet=9}")
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx525.js').read()+"\n"+s[k:]
R("function vehDamage(q,v,n){if(!n||v.K.tank||v.K.bus||v.wreck)return;","function vehDamage(q,v,n){if(!n||v.K.tank||v.K.bus||v.wreck)return;/* r526: army vehicles never blow up inside Fort Blackout: they just get scuffed */if(v.mil&&milArea(v.x,v.z)&&!MILX){v.dmg=Math.min(55,(v.dmg||0)+n*.25);return}")
R("function vehBlow(q,v,mine){if(v.wreck)return;","function vehBlow(q,v,mine){if(v.wreck)return;if(v.mil&&milArea(v.x,v.z)&&!MILX){v.dmg=Math.min(55,v.dmg||0);return}")
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx527.js').read()+"\n"+s[k:]
R("const sh=A(CY(.4,.4,2.2,12),M(0x6a6a5a,{metalness:.5}),335,.5,-783);sh.rotation.z=Math.PI/2;A(new THREE.ConeGeometry(.4,.7,12),M(0x4a4a40),336.45,.5,-783).rotation.z=-Math.PI/2;ob(334,336.5,-783.5,-782.5);for(const[i,c,x]of[[0,0xc02020,333],[1,0x2040c0,335],[2,0xe8c020,337]]){const w=A(CY(.03,.03,.9,6),M(c),x,.7,-783.4);w.rotation.z=.4;w.rotation.x=.5;const nm=['RED','BLUE','YELLOW'][i];prop(x,-784.6,1.0,","ML.uxoW=[];{const Y=.66,ZC=-783,OL=M(0x5a5e3a,{metalness:.45,roughness:.55}),DKM=M(0x2a2a26,{metalness:.6,roughness:.4}),BR=M(0xb08a40,{metalness:.8,roughness:.3}),YB=M(0xe8c020),WD3=M(0x7a5a34,{roughness:.9});for(const cx of[334.2,335.8]){A(BX(.3,.3,.95),WD3,cx,.15,ZC);A(BX(.3,.12,.22),WD3,cx,.36,ZC-.36);A(BX(.3,.12,.22),WD3,cx,.36,ZC+.36)}const bd=A(CY(.38,.38,2.0,20),OL,335,Y,ZC);bd.rotation.z=Math.PI/2;const og=A(CY(.12,.38,.6,20),OL,336.3,Y,ZC);og.rotation.z=-Math.PI/2;const fz=A(CY(.07,.12,.22,14),BR,336.7,Y,ZC);fz.rotation.z=-Math.PI/2;const tip=A(new THREE.SphereGeometry(.07,10,8),BR,336.82,Y,ZC);const tc=A(CY(.34,.38,.14,20),DKM,333.94,Y,ZC);tc.rotation.z=Math.PI/2;for(let f=0;f<4;f++){const a=f*Math.PI/2+Math.PI/4,fin=A(BX(.36,.04,.32),DKM,333.78,Y+Math.sin(a)*.38,ZC+Math.cos(a)*.38);fin.rotation.x=-a}for(const bx of[334.45,335.55]){const b2=A(CY(.385,.385,.07,20),YB,bx,Y,ZC);b2.rotation.z=Math.PI/2}const rb=A(CY(.39,.39,.05,20),BR,336.02,Y,ZC);rb.rotation.z=Math.PI/2;{const c=document.createElement('canvas');c.width=256;c.height=64;const k=c.getContext('2d');k.fillStyle='#5a5e3a';k.fillRect(0,0,256,64);k.fillStyle='#e8e0c0';k.font='bold 26px Arial';k.textAlign='center';k.fillText('HE · 155MM · UXO',128,28);k.font='bold 18px Arial';k.fillText('LOT 13-DB · DO NOT DROP',128,54);const st=AP(new THREE.PlaneGeometry(1.0,.25),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true}),335,Y+.06,ZC-.381);st.rotation.y=Math.PI}const dx0=335,dyb=Y+.38+.11;A(BX(.46,.22,.32),DKM,dx0,dyb,ZC);A(BX(.48,.03,.34),M(0x4a4a44,{metalness:.5}),dx0,dyb+.12,ZC);A(BX(.5,.04,.05),DKM,dx0,Y+.4,ZC-.17);A(BX(.5,.04,.05),DKM,dx0,Y+.4,ZC+.17);const led=A(new THREE.SphereGeometry(.03,8,6),new THREE.MeshStandardMaterial({color:0xff2020,emissive:0xff2020}),dx0+.15,dyb+.15,ZC-.08);anim(335,-783,30,()=>{const o=ML.op;led.material.emissiveIntensity=o&&o.id=='uxo'?((Date.now()/300|0)%2?1:.1):.05});{const c=document.createElement('canvas');c.width=128;c.height=48;const k=c.getContext('2d');k.fillStyle='#1a1a18';k.fillRect(0,0,128,48);k.fillStyle='#ff4030';k.font='bold 26px monospace';k.textAlign='center';k.fillText('ARMED',64,34);const sc=AP(new THREE.PlaneGeometry(.2,.075),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c)}),dx0-.08,dyb+.02,ZC-.161);sc.rotation.y=Math.PI}const ends=[[333.98,Y+.2,ZC-.28],[335,Y-.05,ZC-.38],[336.42,Y+.2,ZC-.22]];[[0,0xc02020],[1,0x2040c0],[2,0xe8c020]].forEach(([i,c])=>{const a=new THREE.Vector3(dx0-.14+i*.14,dyb+.12,ZC-.1),e=new THREE.Vector3(...ends[i]),mid=a.clone().lerp(e,.5);mid.y=Math.max(a.y,e.y)+.28;mid.z=ZC-.42;const cv=new THREE.CatmullRomCurve3([a,new THREE.Vector3(a.x+(e.x-a.x)*.2,a.y+.15,ZC-.28),mid,new THREE.Vector3(e.x+(a.x-e.x)*.15,e.y+.12,ZC-.42),e]);const WM=M(c,{roughness:.5});const full=new THREE.Mesh(new THREE.TubeGeometry(cv,24,.018,6,false),WM);g.add(full);const pts=cv.getPoints(24),s1=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.slice(0,10)),10,.018,6,false),WM),s2=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.slice(15)),10,.018,6,false),WM);s1.visible=s2.visible=false;g.add(s1);g.add(s2);const tm=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.05,8),BR);tm.position.copy(e);g.add(tm);ML.uxoW[i]={full,s1,s2}})}ob(333.6,336.9,-783.5,-782.5);for(const[i,c,x]of[[0,0xc02020,333.9],[1,0x2040c0,335],[2,0xe8c020,336.4]]){const nm=['RED','BLUE','YELLOW'][i];prop(x,-784.3,.85,")
R("o.cut=o.cut||{};o.cut[i]=1;o.n++;snd(700,.05);","o.cut=o.cut||{};o.cut[i]=1;try{const W=ML.uxoW[i];W.full.visible=false;W.s1.visible=W.s2.visible=true}catch(e){}o.n++;snd(700,.05);")
R("o.ord=c;o.n=0;q.mil.uxoChart.txt=c.join(' → ')}","o.ord=c;o.n=0;q.mil.uxoChart.txt=c.join(' → ');try{for(const W of q.mil.uxoW||[]){W.full.visible=true;W.s1.visible=W.s2.visible=false}}catch(e){}}")
R("ring(PENF,1);ring({x0:PENF.x0-3,x1:PENF.x1+3,z0:PENF.z0-3,z1:PENF.z1+3},0);","ring(PENF,1);{const F2={x0:PENF.x0-3,x1:PENF.x1+3,z0:PENF.z0-3,z1:PENF.z1+3},S=10;for(let x=F2.x0;x<F2.x1-.01;x+=S){const xe=Math.min(F2.x1,x+S);if(xe<=-447||x>=-433)seg(x,F2.z0,xe,F2.z0,0);else{if(x<-447)seg(x,F2.z0,-447,F2.z0,0);if(xe>-433)seg(-433,F2.z0,xe,F2.z0,0)}seg(x,F2.z1,xe,F2.z1,0)}for(let z=F2.z0;z<F2.z1-.01;z+=S){seg(F2.x0,z,F2.x0,Math.min(F2.z1,z+S),0);seg(F2.x1,z,F2.x1,Math.min(F2.z1,z+S),0)}}")
R("const gx=-440;A(BX(10,7,.4),STEEL,gx,3.5,PENF.z0-.1);A(BX(4,4,4),CON2,gx-8,2,PENF.z0-2);A(BX(4.4,.3,4.4),DK,gx-8,4.15,PENF.z0-2);W(gx-10,gx-6,PENF.z0-4,PENF.z0,4,CON2);",open(S+'gate528.js').read().replace('\n','').replace("{const gl=lab0=dLabel(","{dLabel("))
R("'THE DARK PENITENTIARY\\nMAXIMUM SECURITY · NO VISITORS · NO ESCAPES',9,1.8,'#14181e','#ffd040',gx,8.3,PENF.z0-.35","'THE DARK PENITENTIARY\\nMAXIMUM SECURITY · VISITS: SEE THE VISITATION BLOCK →',9,1.8,'#14181e','#ffd040',gx,10.4,PENF.z0-.65")
R("v.wreck=1;v.wreckT=20;v.dmg=100;","v.wreck=1;v.wreckT=v.mil?10:20;v.dmg=100;")
R("else if(v.netT!=null){const far=Math.hypot(v.tx-v.x,v.tz-v.z)>40,k=far?1:Math.min(1,dt*10);","else if(v.netT!=null){if(Date.now()-v.netT>2000&&!v.K.plane){try{v.tgy=vehGround(q,v.x,v.z)}catch(e){}}const far=Math.hypot(v.tx-v.x,v.tz-v.z)>40,k=far?1:Math.min(1,dt*10);")
R("v.y+=(v.ty-v.y)*k;v.h+=wrapA(v.th-v.h)*k;","v.y+=((v.tgy!=null?v.tgy:v.y)-v.y)*k;v.h+=wrapA(v.th-v.h)*k;")
R("v.tx=+o.x;v.tz=+o.z;v.ty=+o.y||0;v.th=+o.h;","v.tx=+o.x;v.tz=+o.z;v.tgy=+o.y||0;v.th=+o.h;")
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx528.js').read()+"\n"+s[k:]
R("['afterparty','🕺','Afterparty','Escape and celebrate in the car park with everyone.'],","['afterparty','🕺','Afterparty','Escape and celebrate in the car park with everyone.'],['bailed','💰','Out On Bail','Have a teammate pay your bail at the Dark Penitentiary.'],")
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx529.js').read()+"\n"+s[k:]
R("['bailed','💰','Out On Bail',","['gatecrash','🚨','Front Door Policy','Pick the lock on GATE CONTROL and open the Dark Penitentiary gates.'],['bailed','💰','Out On Bail',")
R("if(!on||HUD.t>0)return;HUD.t=.1;const x=HUD.cv.getContext('2d')","if(!on)return;{const hd0=-P.yaw;if(HUD.t>0&&Math.abs(hd0-(HUD.lh||0))<.0015&&Math.abs(P.x-(HUD.lx||0))<.3&&Math.abs(P.z-(HUD.lz||0))<.3)return;HUD.t=.25;HUD.lh=hd0;HUD.lx=P.x;HUD.lz=P.z}const x=HUD.cv.getContext('2d')")
R("ABUSE.ey=(ABUSE.ey||0)+((T.tiny>now?-1.15:T.giant>now?2.6:0)-(ABUSE.ey||0))*Math.min(1,dt*3);","ABUSE.ey=(ABUSE.ey||0)+((T.tiny>now?-(EYE||1.7)*.72:T.giant>now?(EYE||1.7)*1.5:0)-(ABUSE.ey||0))*Math.min(1,dt*3);")
R("P.dt+=dt;const g=P.dav;if(!g)return;g.position.set(P.x,P.dy||0,P.z);","P.dt+=dt;const g=P.dav;if(!g)return;g.position.set(P.x,P.dy||0,P.z);try{g.scale.setScalar(abuseScale())}catch(e){}")
R("C.position.set(best.x,(P.dy||0)+1.75,best.z);C.rotation.set(-.12,Math.atan2(-(P.x-best.x),-(P.z-best.z)),0,'YXZ');","{let sc=1;try{sc=abuseScale()}catch(e){}if(sc!==1){best.x=P.x+(best.x-P.x)*sc;best.z=P.z+(best.z-P.z)*sc}C.position.set(best.x,(P.dy||0)+1.75*sc,best.z)}C.rotation.set(-.12,Math.atan2(-(P.x-best.x),-(P.z-best.z)),0,'YXZ');")
R("const o={t:'ae',id:SV.pid,k,a:a||''};try{if(MP.on&&mpOpen().length)mpSend(o)}catch(e){}try{if(HUB.on&&PUB.cl&&PUB.cl.connected&&HUB.key)PUB.cl.publish(HUB.key+'ae',JSON.stringify({i:SV.pid,k,a:a||''}))}catch(e){}","const rg=(REG&&REG.v&&JSON.stringify(REG).length<20000)?REG:null,o={t:'ae',id:SV.pid,k,a:a||'',ix:ixOut(),r:rg};try{if(MP.on&&mpOpen().length)mpSend(o)}catch(e){}try{if(HUB.on&&PUB.cl&&PUB.cl.connected&&HUB.key)PUB.cl.publish(HUB.key+'ae',JSON.stringify({i:SV.pid,k,a:a||'',ix:ixOut(),r:rg}))}catch(e){}")
R("function abuseIn(id,k,a,nm){const rk=rkOf(id);if(!rk||!AEV.some(e=>e[0]==k))return;abuseDo(k,String(a||'').slice(0,120),nm||'An admin',id)}","async function abuseIn(id,k,a,nm,ix,rg){if(!AEV.some(e=>e[0]==k))return;let rk=rkOf(id);if(!rk){/* r530: the event carries the admin's signed ID and the signed staff list, so players whose list is out of date still accept it */try{if(rg)await regIn(rg)}catch(e){}try{if(ix)await rkLearn(id,ix)}catch(e){}rk=rkOf(id)}if(!rk)return;abuseDo(k,String(a||'').slice(0,120),nm||'An admin',id)}")
R("abuseIn(aid,o.k,o.a,(MP.remotes[aid]&&MP.remotes[aid].name)||(p&&p.name)||'An admin');","abuseIn(aid,o.k,o.a,(MP.remotes[aid]&&MP.remotes[aid].name)||(p&&p.name)||'An admin',o.ix,o.r);")
R("else if(sub=='ae'){abuseIn(id,o.k,o.a,HUB.ps[id]?HUB.ps[id].nm:'An admin')}","else if(sub=='ae'){abuseIn(id,o.k,o.a,HUB.ps[id]?HUB.ps[id].nm:'An admin',o.ix,o.r)}")
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx531.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx532.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx533.js').read()+"\n"+s[k:]
R("['gatecrash','🚨',","['turnin','🙋','Honest Citizen','Turn yourself in to Seek.'],['gatecrash','🚨',")
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx534.js').read()+"\n"+s[k:]
R("let MUN=0;const munB=","const munSt=()=>state=='play'||state=='cart'||state=='sewer'||(state=='bus'&&!!BUS.ride);let MUN=0;const munB=")
R("if(e.repeat||state!='play'||mpi.style.display=='block')return;","if(e.repeat||!munSt()||mpi.style.display=='block')return;")
R("setInterval(()=>{if(MUN&&state!='play'){","setInterval(()=>{if(MUN&&!munSt()){")
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx535.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx536.js').read()+"\n"+s[k:]
R("box(0,HY-1.2,-L+.06,6,1.2,.06,sgn('MULTIPLAYER LOBBY'","box(0,HY-1.2,-L-.87,6,1.2,.06,sgn('MULTIPLAYER LOBBY'")
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx538.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx539.js').read()+"\n"+s[k:]
R("['turnin','🙋',","['retroescape','🕹️','Stage Clear','Escape the boiler hall in Retro Mode.'],['retroseek','👾','Don\\'t Look Back','Outrun the darkness in a Retro Mode Seek chase.'],['retrolib','📕','Quiet Please','Beat the Retro Mode library at door 50.'],['turnin','🙋',")
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx540.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx543.js').read()+"\n"+s[k:]
R("open:st.open?1:0}))}catch(x){}}","open:st.open?1:0,cn:st.cn|0}))}catch(x){}}")
R("cd:Date.now()+Math.max(0,Math.min(60000,+o.cd||0)),open:1,t:Date.now()};","cd:Date.now()+Math.max(0,Math.min(60000,+o.cd||0)),open:1,t:Date.now(),cn:Math.max(0,Math.min(EXN-1,o.cn|0))};")
R("🔒 Friends only</label>'+","🔒 Friends only</label>'+(typeof cContHtml=='function'?cContHtml():'')+")
R("d.querySelector('#hcr').onclick=()=>{SV.lastMods=[...md];","d.querySelector('#hcr').onclick=()=>{{const cc=d.querySelector('#hcont'),cs=cc&&cc.checked&&typeof cLoad=='function'?cLoad():null;if(cs){md.clear();(cs.mods||[]).filter(k=>MODL.some(m=>m[0]==k)).forEach(k=>md.add(k))}HUB.contN=cs?cs.n:0}SV.lastMods=[...md];")
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx545.js').read()+"\n"+s[k:]
R("if(!retConvTick()){RET.fkT","if(!r8RetSlave()&&!retConvTick()){RET.fkT")
R("if(T-RET.dyT>(RET.qa?14:7)){","if(!r8RetSlave()&&T-RET.dyT>(RET.qa?14:7)){")
R("if(RET.acT<=0){RET.acT=18+Math.random()*16;ac.innerHTML='🏆 <b>ACHIEVEMENT UNLOCKED!</b><br>'+RACH[Math.random()*RACH.length|0]+' (+0 G)';ac.style.display='block';snd(1319,.06);setTimeout(()=>snd(1760,.06),90);setTimeout(()=>{ac.style.display='none'},3500)}","if(RET.acT<=0&&!r8RetSlave()){RET.acT=18+Math.random()*16;const aT=RACH[Math.random()*RACH.length|0];r8RetSend({k:'ach',x:aT});retAch(aT)}")
R("const sx=Math.abs(m.scale.x),sz=Math.abs(m.scale.z);if(m.position.z>FZ+TH/2+.02&&m.position.z<1.5&&(sx<hx*1.6||m.position.y<3.5)&&","/* r546: judge by where the mesh really is in the room, not its position inside its own group (the door leaf and the key are children of groups, so they sat at local z 0 and were hidden) */r.G.updateMatrixWorld(true);const wp=r.G.worldToLocal(m.getWorldPosition(new THREE.Vector3())),sx=Math.abs(m.scale.x),sz=Math.abs(m.scale.z);if(wp.z>FZ+TH/2+.02&&wp.z<1.5&&(sx<hx*1.6||wp.y<3.5)&&")
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx547.js').read()+"\n"+s[k:]
R("function dLabel(g,txt,w,h,bg,fg,x,y,z,ry,fs){const c=document.createElement('canvas');c.width=512;c.height=Math.max(32,Math.round(512*h/w));const k=c.getContext('2d');k.fillStyle=bg;k.fillRect(0,0,c.width,c.height);k.fillStyle=fg;let f=fs||60;const ls=txt.split('\\n');k.font='bold '+f+'px Georgia';while(ls.some(l=>k.measureText(l).width>490)&&f>14){f-=2;k.font='bold '+f+'px Georgia'}k.textAlign='center';k.textBaseline='middle';ls.forEach((l,i)=>k.fillText(l,256,c.height/2+(i-(ls.length-1)/2)*f*1.15));","function dLabel(g,txt,w,h,bg,fg,x,y,z,ry,fs){const c=document.createElement('canvas');c.width=1024;c.height=Math.max(64,Math.round(1024*h/w));const k=c.getContext('2d');k.fillStyle=bg;k.fillRect(0,0,c.width,c.height);k.fillStyle=fg;const FT=txtFit(k,txt,980,c.height*.92,Math.min(Math.round(c.height*.8),(fs||60)*2),'Georgia'),f=FT.f,ls=FT.ls;k.textAlign='center';k.textBaseline='middle';ls.forEach((l,i)=>k.fillText(l,512,c.height/2+(i-(ls.length-1)/2)*f*1.15));")
R("const ls=txt.split('\\n');let f=ls.length==1?64:50;q.font='bold '+f+'px Arial';while(f>14&&(ls.some(l=>q.measureText(l).width>452)||ls.length*f*1.12>126)){f-=2;q.font='bold '+f+'px Arial'}ls.forEach((l,i)=>q.fillText(l,256,82+(i-(ls.length-1)/2)*f*1.12));","const FT=txtFit(q,txt,452,126,String(txt).includes('\\n')?50:64,'Arial'),f=FT.f,ls=FT.ls;ls.forEach((l,i)=>q.fillText(l,256,82+(i-(ls.length-1)/2)*f*1.12));")
R("sign('SUBSTATION · HANGAR 1 SUPPLY · DANGER 11kV','#e8c020',sx+1.5,sz-2.5,0,'#1a1a1a')","sign('SUBSTATION · HANGAR 1 SUPPLY · DANGER 11kV','#e8c020',sx+1.5,sz-2.5,Math.PI,'#1a1a1a')")
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx548.js').read()+"\n"+s[k:]
R("return'WRONG ('+o.tries+'/3)'});return true});const el=document.getElementById('mctC')","return'WRONG ('+o.tries+'/3)'});return false/* r548: the keypad has taken over this dialog: do not close it */});const el=document.getElementById('mctC')")
R("m.geometry.type!='SphereGeometry'||m.scale.x<8)return;","m.geometry.type!='SphereGeometry'||m.scale.x<2.5)return;")
R('A(BX(.3,.4,.02),WH,530.4,1.25,-700.4);','ML.kmClip=A(BX(.3,.4,.02),WH,530.4,1.25,-700.4);')
R('AP(new THREE.PlaneGeometry(x1-x0-.6,z1-z0-.6),o.floor,(x0+x1)/2,.06,(z0+z1)/2)','AP(new THREE.PlaneGeometry(x1-x0-.6,z1-z0-.6),o.floor,(x0+x1)/2,.11,(z0+z1)/2)')
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx549.js').read()+"\n"+s[k:]
R('if(!v.K.bus){v.air=1;v.vy=Math.max(v.vy,7*k*(v.K.tank?.4:1));v.v*=.3;v.spin=(Math.random()-.5)*5*k}','if(!v.K.bus&&!v.K.tank&&!v.K.plane){v.air=1;v.vy=Math.max(v.vy,7*k);v.v*=.3;v.spin=(Math.random()-.5)*5*k}')
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx550.js').read()+"\n"+s[k:]
R('ML.nuke.cloud={cap,stem,vis:0};const cl=glowSp(0xffe0a0,0,60);cl.position.set(-620,60,-660);g.add(cl);','ML.nuke.cloud={cap,stem,vis:0};const cl=glowSp(0xffe0a0,0,60);cl.position.set(-620,60,-660);g.add(cl);ML.nuke.cloud.gl=cl;')
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx551.js').read()+"\n"+s[k:]
R("let f=fs||60;x.font='bold '+f+'px Arial';while(x.measureText(s).width>490&&f>12){f-=2;x.font='bold '+f+'px Arial'}x.textAlign='center';x.textBaseline='middle';x.fillText(s,256,c.height/2);","const FT=txtFit(x,s,490,c.height*.92,fs||60,'Arial');x.textAlign='center';x.textBaseline='middle';FT.ls.forEach((l,i)=>x.fillText(l,256,c.height/2+(i-(FT.ls.length-1)/2)*FT.f*1.15));")
R("let f=fs||48;x.font='bold '+f+'px Arial';const ls=String(s).split('\\n');while(ls.some(l=>x.measureText(l).width>490)&&f>12){f-=2;x.font='bold '+f+'px Arial'}x.textAlign='center';x.textBaseline='middle';ls.forEach((l,i)=>x.fillText(l,256,c.height/2+(i-(ls.length-1)/2)*f*1.15));","const FT=txtFit(x,String(s),490,c.height*.92,fs||48,'Arial'),f=FT.f,ls=FT.ls;x.textAlign='center';x.textBaseline='middle';ls.forEach((l,i)=>x.fillText(l,256,c.height/2+(i-(ls.length-1)/2)*f*1.15));")
R("let f=fs||40;x.font='bold '+f+'px Arial';while(x.measureText(s).width>240&&f>10){f-=2;x.font='bold '+f+'px Arial'}x.textAlign='center';x.textBaseline='middle';x.fillText(s,128,c.height/2);","const FT=txtFit(x,s,240,c.height*.92,fs||40,'Arial');x.textAlign='center';x.textBaseline='middle';FT.ls.forEach((l,i)=>x.fillText(l,128,c.height/2+(i-(FT.ls.length-1)/2)*FT.f*1.15));")
R("let f=fs||52;const ls=t.split('\\n');k.font='bold '+f+'px Georgia';while(ls.some(l=>k.measureText(l).width>480)&&f>12){f-=2;k.font='bold '+f+'px Georgia'}k.textAlign='center';k.textBaseline='middle';","const FT=txtFit(k,t,480,c.height*.86,fs||52,'Georgia'),f=FT.f,ls=FT.ls;k.textAlign='center';k.textBaseline='middle';")
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx552.js').read()+"\n"+s[k:]
R('while(S.r<9&&S.r>=2&&S.xp>=MILRANK[S.r+1][2])','while(S.r<MILRANK.length-1&&S.r>=2&&S.xp>=MILRANK[S.r+1][2])')
R("(S.r<9?MILRANK[S.r+1][2]:'max')","(S.r<MILRANK.length-1?MILRANK[S.r+1][2]:'max')")
R('function milRankNm(r){return MILRANK[Math.max(0,Math.min(9,r|0))][0]}','function milRankNm(r){return MILRANK[Math.max(0,Math.min(MILRANK.length-1,r|0))][0]}')
R("(r<9?' · next rank at '+MILRANK[r+1][2]+' XP'","(r<MILRANK.length-1?' · next rank at '+MILRANK[r+1][2]+' XP'")
R('const list=MILOPS.filter(o=>o.min<=r&&o.min>=r-3);','const list=milOpsList(r);')
R("['retroescape','🕹️',","['supreme','👑','Supreme Commander','Reach the top of the Dark Army: Supreme Commander.'],['legend','🌟','Living Legend','The very top of the Dark Army: Living Legend.'],['wraith6','🛸','Perfection','Refit the X-13 Wraith all the way to the Mk VI.'],['figrocket','🚀','Rocket Science','Stun Figure with the OP ROCKET LAUNCHER.'],['retroescape','🕹️',")
R("if(me&&v!==q.cop?.v&&!v.npc)addHeat(q,Math.min(6,n*.11),n>12?'crash':null);","if(me&&v!==q.cop?.v&&!v.npc&&v.hitO&&typeof v.hitO=='object'&&v.hitO.K)addHeat(q,Math.min(6,n*.11),n>12?'crash':null);/* r552: crashing into a wall or nothing at all is not a crime */")
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx553.js').read()+"\n"+s[k:]
R("milBeacons(q,o,[[470,-700],[560,-735],[585,-880],[330,-905],[330,-740],[520,-760]])","milBeacons(q,o,[[520,-666],[560,-735],[585,-868],[455,-875],[350,-762],[520,-760]])")
R("milBeacons(q,o,[[330,-905],[330,-740],[480,-740],[580,-735],[585,-880],[520,-900]])","milBeacons(q,o,[[470,-892],[350,-762],[480,-748],[580,-740],[585,-868],[520,-880]])")
R("const g=new THREE.Group();g.position.set(x,0,z);q.g.add(g);const pl=new THREE.Mesh(new THREE.BoxGeometry(2.4,2.6,.15)","const g=new THREE.Group();g.position.set(x,0,z);g.rotation.order='YXZ';g.rotation.y=Math.PI/2;q.g.add(g);const pl=new THREE.Mesh(new THREE.BoxGeometry(2.4,2.6,.15)")
R("onHit(){g.rotation.x=-Math.PI/2*.95;","onHit(){g.rotation.x=Math.PI/2*.95;")
R("const paint0=paint,paint=(a,b,c,d,e,f,y)=>paint0(","const paint0=K.paint,paint=(a,b,c,d,e,f,y)=>paint0(")
R("const gx=-s*(HX-1.05);clr(gx-1.2,gx+1.2,z-2.6,z+2.6)}}","const gx=-s*(HX-1.05);clr(gx-1.2,gx+1.2,z-2.6,z+2.6);const sp=L/(k+1);clr(-HX,HX,z-sp/2-.2,z+sp/2+.2)}}")
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx554.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx555.js').read()+"\n"+s[k:]
R("if(Math.hypot(P.x-q.x,P.z-q.z)<.9&&Math.abs(P.dy||0)<1.5){q.got=1","if(Math.hypot(P.x-q.x,P.z-q.z)<1.35&&Math.abs(P.dy||0)<2.6){q.got=1")
R("hint('📅 You reached the glitch!');setTimeout(()=>{if(DAILY.on)dailyFinish(true)},2200)","if(DAILY.th&&DTH[DAILY.th]&&typeof holEnd=='function'){hint(DTH[DAILY.th].ic+' You made it!');setTimeout(()=>{if(DAILY.on)holEnd(DAILY.th)},900)}else{hint('📅 You reached the glitch!');setTimeout(()=>{if(DAILY.on)dailyFinish(true)},2200)}")
R("const dm=A(CY(1.6,1.6,.1,20),M(0xa0a8b0,{metalness:.6}),0,.6,0,dish);dm.rotation.x=Math.PI/2*.8;A(CY(.05,.05,1.4,6),ST2,0,.9,-.5,dish).rotation.x=.4;A(BX(.3,.3,.3),DK,0,.1,0,dish);anim(rx+12,rz+2,300,dt=>{dish.rotation.y+=dt*1.6});","{const DM=M(0xb8c0c8,{metalness:.5,side:THREE.DoubleSide});A(BX(.6,.3,.6),DK,0,.15,0,dish);for(const sx of[-.55,.55])A(BX(.1,1.0,.12),ST2,sx,.75,0,dish);const tg=new THREE.Group();tg.position.y=1.15;tg.rotation.x=-.35;dish.add(tg);A(CY(.07,.07,1.2,8),ST2,0,0,0,tg).rotation.z=Math.PI/2;const bowl=A(new THREE.SphereGeometry(1.7,22,10,0,Math.PI*2,0,.62),DM,0,0,1.55,tg);bowl.rotation.x=-Math.PI/2;const fs=A(CY(.035,.035,1.0,6),ST2,0,0,.35,tg);fs.rotation.x=Math.PI/2;for(const a of[.5,2.6,4.7]){const p0=new THREE.Vector3(Math.cos(a)*1.25,Math.sin(a)*1.25,.2),p1=new THREE.Vector3(0,0,.85),dv=p1.clone().sub(p0);const st=A(CY(.025,.025,dv.length(),5),ST2,(p0.x+p1.x)/2,(p0.y+p1.y)/2,(p0.z+p1.z)/2,tg);st.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dv.normalize())}A(BX(.22,.22,.3),DK,0,0,.9,tg);anim(rx+12,rz+2,300,dt=>{dish.rotation.y+=dt*.9})}")
R("for(let i=0;i<3;i++){const r=A(new THREE.TorusGeometry(.35,.03,6,14,Math.PI),MT,x+6.5+i*.6,.35,zf+1.3)}A(BX(1.6,.04,.1),MT,x+7.1,.02,zf+1.3);","for(let i=0;i<3;i++){const r=A(new THREE.TorusGeometry(.3,.03,6,14,Math.PI),MT,x+6.5+i*.6,.45,zf+1.3);r.rotation.y=Math.PI/2;for(const s2 of[-1,1])A(new THREE.CylinderGeometry(.03,.03,.45,6),MT,x+6.5+i*.6,.225,zf+1.3+s2*.3)}for(const s2 of[-1,1])A(BX(1.6,.04,.06),MT,x+7.1,.02,zf+1.3+s2*.3);")
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx556.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx557.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx558.js').read()+"\n"+s[k:]
R("const el=document.getElementById('lobbyMus');if(!el)return;","const el=document.getElementById('lobbyMus');if(!el||!el.textContent.trim())return;")
R("const el=document.getElementById('seekMus');if(!el)return;","const el=document.getElementById('seekMus');if(!el||!el.textContent.trim())return;")
R("const el=document.getElementById(id);if(el){const bin=atob(","const el=document.getElementById(id);if(el&&el.textContent.trim()){const bin=atob(")
R("const el=document.getElementById(V.id);if(!el)return;","const el=document.getElementById(V.id);if(!el)return;if(!el.textContent.trim()){try{hint('⏳ Still downloading that video... try again in a moment.')}catch(e){}return}")
R("cl=window.mqtt.connect(url,{clientId:'doorsreg_'","cl=mqConnect(url,{clientId:'doorsreg_'")
R("const c=window.mqtt.connect(url,opt);let done=0;","const c=mqConnect(url,opt);let done=0;")
R("function pubLib(){if(window.mqtt&&window.mqtt.connect)return Promise.resolve();","function pubLibCDN(){if(window.mqtt&&window.mqtt.connect)return Promise.resolve();")
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx559.js').read()+"\n"+s[k:]
R("try{runLoadShow()}catch(e){}hubLeave(false);clearAll();state='menu';MP.auto=1;HUBRUN=1;\n  pjJoin(code).then(()=>{sysLine('🔗 Connected: the run starts when the host is ready.')}).catch(e=>{MP.auto=0;sysLine('Could not join the group: '+(typeof e=='string'?e:(e&&e.message)||e));menu('DOORS','Could not join the group run.')})}}","try{runLoadShow()}catch(e){}grpStart(HUB.key,id,o);hubLeave(false);clearAll();state='menu';MP.auto=1;HUBRUN=1;\n  pjJoin(code).then(()=>{sysLine('🔗 Connected: the run starts when the host is ready.');if(GRP.g)GRP.g.done=1}).catch(grpFail)}}")
R("PUB.cl.publish(key+'go',JSON.stringify({i:SV.pid,code,ids:crew}))","PUB.cl.publish(key+'go',JSON.stringify({i:SV.pid,code,ids:crew,d:HUB.dailyGo?1:0,m:RUNMODS}))")
R("const S=milSV();if(S.r>=1){const r0=S.r;S.r=Math.max(0,S.r-2);","const S=milSV();if(S.r>=1){const r0=S.r;S.lost={r:r0,xp:S.xp|0,at:Date.now()};S.bl=(Array.isArray(S.bl)?S.bl:[]).concat([S.lost]).slice(-5);S.r=Math.max(milFloor(r0),S.r-2);")
R("/* the restricted zone */if(M.inB&&pz>MILRZ.z0&&S.r<5&&M.h<=0&&S.r>=1){milGoHostile(q,'Unauthorised entry to the RESTRICTED ZONE (Lieutenant and above only)')}","/* the restricted zone: a warning and 10 seconds to turn back, then trouble */if(M.inB&&pz>MILRZ.z0&&S.r<5&&M.h<=0&&S.r>=1){M.rzT=(M.rzT||0)+dt;if(!M.rzW){M.rzW=1;snd(300,.3);setTimeout(()=>snd(300,.3),400);hint('⚠️ RESTRICTED ZONE: Lieutenant and above only. \"'+milRankNm(S.r).toUpperCase()+', TURN AROUND. You have 10 seconds.\"')}if(M.rzT>10){M.rzT=0;M.rzW=0;milGoHostile(q,'Unauthorised entry to the RESTRICTED ZONE (Lieutenant and above only)')}}else if(!(M.inB&&pz>MILRZ.z0)){M.rzT=0;M.rzW=0}")
R("[[432,-890],[586,-890],[586,-737],[432,-737]]","[[421,-869.5],[586,-869.5],[586,-737],[421,-737]]")
R('/* the front wall of each office: a door in the middle and a window either side */const dA=oc-.7,dB=oc+.7;A(BX(dA-ox0,H,t),CON,(ox0+dA)/2,H/2,Z.z0);ob(ox0,dA,Z.z0-t/2,Z.z0+t/2);A(BX(ox1-dB,H,t),CON,(dB+ox1)/2,H/2,Z.z0);ob(dB,ox1,Z.z0-t/2,Z.z0+t/2);A(BX(1.4,H-2.4,t),CON,oc,2.4+(H-2.4)/2,Z.z0);','/* the front wall of each office: a door in the middle and a real glass window either side (r561) */const dA=oc-.7,dB=oc+.7;const seg=(a,b)=>A(BX(b-a,H,t),CON,(a+b)/2,H/2,Z.z0);seg(ox0,oc-4);seg(oc-2,dA);seg(dB,oc+2);seg(oc+4,ox1);ob(ox0,dA,Z.z0-t/2,Z.z0+t/2);ob(dB,ox1,Z.z0-t/2,Z.z0+t/2);A(BX(1.4,H-2.4,t),CON,oc,2.4+(H-2.4)/2,Z.z0);\n  for(const wx of[oc-3,oc+3]){A(BX(2,1.2,t),CON,wx,.6,Z.z0);A(BX(2,H-2.2,t),CON,wx,2.2+(H-2.2)/2,Z.z0);A(BX(2,1,.04),GLS,wx,1.7,Z.z0);for(const y of[1.2,2.2])A(BX(2.1,.08,t+.06),WFR,wx,y,Z.z0);for(const x of[-1,0,1])A(BX(.07,1,t+.06),WFR,wx+x,1.7,Z.z0)}\n  /* the door: swings open into the office as you walk up to it */{const dg=new THREE.Group();dg.position.set(dA,0,Z.z0);g.add(dg);const dp=new THREE.Mesh(BX(1.38,2.36,.07),WD);dp.position.set(.69,1.19,0);dg.add(dp);for(const sz of[-1,1]){const kn=new THREE.Mesh(new THREE.SphereGeometry(.045,8,6),GD);kn.position.set(1.22,1.05,sz*.06);dg.add(kn)}const dw=new THREE.Mesh(BX(.5,.6,.075),GLS);dw.position.set(.69,1.75,0);dg.add(dw);let da=0;q.anims.push({x:oc,z:Z.z0,r:60,f:dt=>{const near=Math.hypot(P.x-oc,(P.z-q.OZ)-Z.z0)<2.8;const tg=near?1:0;if(da===tg)return;const pa=da;da=Math.max(0,Math.min(1,da+(tg?dt*2.5:-dt*1.6)));if(pa===0&&da>0)snd(240,.04);dg.rotation.y=-da*1.45}})}')
R("  for(const sd of[-1,1])A(BX(2,1,.06),new THREE.MeshStandardMaterial({color:0x9ac0e0,transparent:true,opacity:.35}),oc+sd*3,1.7,Z.z0-.17);\n  const np=pdTxt('OFFICE '+(i+1),1.6,.32,'#d8b040','#20261c');np.position.set(oc+1.3,2.1,Z.z0-.17);np.rotation.y=Math.PI;g.add(np);","  const np=pdTxt('OFFICE '+(i+1),1.3,.3,'#d8b040','#20261c');np.position.set(oc,2.9,Z.z0-.17);np.rotation.y=Math.PI;g.add(np);")
R("OL=M(0x3a4a2a),GD=M(0xd8b040,{metalness:.8,roughness:.3});\n const cx=(Z.x0+Z.x1)/2,cz=(Z.z0+Z.z1)/2,W=Z.x1-Z.x0,D=Z.z1-Z.z0;A(BX(W,.08,D),FL","OL=M(0x3a4a2a),GD=M(0xd8b040,{metalness:.8,roughness:.3}),GLS=M(0xa8d0e8,{transparent:true,opacity:.28,metalness:.6,roughness:.05,depthWrite:false,side:THREE.DoubleSide}),WFR=M(0x3a3c36);\n const cx=(Z.x0+Z.x1)/2,cz=(Z.z0+Z.z1)/2,W=Z.x1-Z.x0,D=Z.z1-Z.z0;A(BX(W,.08,D),FL")
R("A(BX(W,.08,D),FL,cx,.04,cz);A(BX(W+.6,.3,D+.6)","FL.polygonOffset=true;FL.polygonOffsetFactor=-4;FL.polygonOffsetUnits=-4;A(BX(W,.08,D),FL,cx,.09,cz);A(BX(W+.6,.3,D+.6)")
R("A(BX(4,.05,4),M(0x6a1a1a,{roughness:.95}),oc,.09,cz)","A(BX(4,.05,4),M(0x6a1a1a,{roughness:.95,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-6}),oc,.15,cz)")
R("if(q.cop.tier==3)return;v.dmg+=n*.2;if(v.dmg>=100)copWreck(q,false);return}","if(q.cop.tier==3)return;v.dmg+=n*.2;if(v.dmg>=100){/* r561: bumping into scenery on their own never blows a cop car up: only you (or another car) can */const byYou=q.copRam!=null&&q.rt-q.copRam<2.5,byCar=v.hitO&&typeof v.hitO=='object'&&v.hitO.K;if(byYou||byCar)copWreck(q,byYou);else v.dmg=90}return}")
# r563: admins are owners in everything except appointing admins (that needs the owner key)
R("const RKI={owner:'👑',admin:'🛡️'},RKN={owner:'Owner',admin:'Admin'};","const RKI={owner:'👑',admin:'👑'},RKN={owner:'Owner',admin:'Owner'};")
R("const rkEarn=()=>{const r=myRank();return r=='owner'||(r=='admin'&&!!REG.earn)};","const rkEarn=()=>!!myRank();")
R("(own?'👑 OWNER PANEL':'🛡️ ADMIN PANEL')","'👑 OWNER PANEL'")
R("+RKN[r]+(own?'':' · you can ban and unban players (not admins or the owner)')+","+RKN[r]+(own?'':' · making and removing staff needs the owner key')+")
R("(myRank()=='owner'?'👑 owner':'🛡️ admin')","'👑 owner'")
R("hint((r=='owner'?'👑':'🛡️')+' Staff badge: \"I\\'m '+(r=='owner'?'the Owner':'an Admin')+'\"","hint((r=='owner'?'👑':'🛡️')+' Staff badge: \"'+(r=='owner'?'Owner':'Admin')+'\"")
R("if(i==-2)return rk?['admin','🛡️',\"I'm an Admin\",'',0,'rb']:null;","if(i==-2)return rk?['admin','🛡️','Admin','',0,'rb']:null;")
R("['admin','🛡️',\"I'm an Admin\",'You help run this game. Hidden staff badge.']","['admin','🛡️','Admin','You help run this game. Hidden staff badge.']")
R("const can=x.u&&!me&&rk!='owner'&&(own||rk!='admin');","const can=x.u&&!me&&rk!='owner';")
R("['owner','👑',\"I'm the Owner\",'You own this game. Hidden staff badge.']","['owner','👑','Owner','You own this game. Only the owner can ever have it.']")
R("rk=='owner'?['owner','👑',\"I'm the Owner\",'',0,'rb']","rk=='owner'?['owner','👑','Owner','',0,'rb']")
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx561.js').read()+"\n"+s[k:]
# r565: settings (sound routing, mouse speed), UI kit, owner panel tabs, debug tabs, title screen
R("P.yaw-=e.movementX*.0022;","P.yaw-=e.movementX*.0022*MSENS;")
R("P.pitch-e.movementY*.0022))","P.pitch-e.movementY*.0022*MSENS))")
R("RMU.m.connect(AC.destination)","RMU.m.connect(AC.__mus||AC.destination)")
R("MU.g.connect(AC.destination)","MU.g.connect(AC.__mus||AC.destination)")
R("g.connect(AC.destination);g.gain.setTargetAtTime(st==5?.07:.2","g.connect(AC.__mus||AC.destination);g.gain.setTargetAtTime(st==5?.07:.2")
R("SKX.src=a.createMediaElementSource(SKM.a);","SKM.a.__wa=1;SKX.src=a.createMediaElementSource(SKM.a);")
R("SKX.dry.connect(a.destination)","SKX.dry.connect(a.__mus||a.destination)")
R("SKX.wet.connect(a.destination)","SKX.wet.connect(a.__mus||a.destination)")
R("it.push(['👤 Account','acct']);","it.push(['👤 Account','acct'],['⚙ Settings','settings']);")
R("else if(code=='fs')mobFS();","else if(code=='settings'){d.style.display='none';setOpen();return}else if(code=='fs')mobFS();")
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx565.js').read()+"\n"+s[k:]
# r566: walking past a door whose next room is not built yet (noclip through a locked door) builds it, instead of counting as an escape
R("function enter(){\n if(n>=EXN||!RMS[ci+1])return win();","function enter(){\n /* r566: the lobby door is never an escape (noclip used to walk you out of the hotel) */if(typeof HUB!='undefined'&&HUB.on){P.z=Math.max(P.z,-RMS[ci].L+1.2);hint('🔒 The lobby door stays shut. Use the exit door or an elevator to start a run.');return}\n if(n>=EXN)return win();if(!RMS[ci+1]){try{const l=RMS[RMS.length-1];RMS.push(mkRoom(l.n+1,false,l.off-(l.L+2),l))}catch(e){conLog('error','enter: '+e.message)}if(!RMS[ci+1])return}")
R("uiOpen=()=>bdp.style.display=='flex'||frp.style.display=='flex'||mpp.style.display=='flex';","uiOpen=()=>bdp.style.display=='flex'||frp.style.display=='flex'||mpp.style.display=='flex'||['staffDlg','setDlg','howDlg','xfDlg','liveDlg'].some(i=>{const e=document.getElementById(i);return !!e&&e.style.display!='none'&&e.style.display!=''})||(typeof dp!='undefined'&&dp.style.display=='flex');")
# r567: the bust record survives a reload (it was dropped when the save was loaded)
R("dis:Math.max(0,q.mil.dis|0)}:null;","dis:Math.max(0,q.mil.dis|0),bl:(Array.isArray(q.mil.bl)?q.mil.bl:q.mil.lost?[q.mil.lost]:[]).filter(b=>b&&typeof b=='object').slice(-5).map(b=>({r:Math.max(0,Math.min(14,b.r|0)),xp:Math.max(0,Math.min(1e6,b.xp|0)),at:+b.at||0}))}:null;if(SV.mil)SV.mil.lost=SV.mil.bl.length?SV.mil.bl[SV.mil.bl.length-1]:null;")
R("addHeat=function(q,n,why){try{if(milRank()>=9&&!(why=='military')){return}}","addHeat=function(q,n,why){try{if(milRank()>=9&&!(why=='military')&&!(q&&q.gen5)){return}}")
R("if(milRank()>=9&&q.heat>0&&!(q.mil&&q.mil.h>0)){q.heat=0;","if(milRank()>=9&&q.heat>0&&!q.gen5&&!(q.mil&&q.mil.h>0)){q.heat=0;")
R("dish.position.y=9.6;mast.add(dish);","dish.position.y=9.08;mast.add(dish);A(BX(1.9,.16,1.9),ST2,0,9.0,0,mast);")
R("hint('🎖️ DISHONOURABLE CONDUCT. '+(S.r>0?'Busted from '+milRankNm(r0)+' down to '+milRankNm(S.r)+'.':'Drummed out of the service.'));","hint('🎖️ DISHONOURABLE CONDUCT. '+(S.r>0?'Busted from '+milRankNm(r0)+' down to '+milRankNm(S.r)+'.'+(milFloor(r0)==S.r&&r0-S.r<2?' (Milestone rank: you cannot be busted below '+milRankNm(S.r)+'.)':''):'Drummed out of the service.'));")
R("f.position.set(x+.06,Y+.5,2.8)","f.position.set(x+.06,ghost?Y+.26:Y+.5,2.8)")
R("if(ghost){mkFin(.85,-.4);mkFin(-.85,.4)}else mkFin(0,0);","const FINS=ghost?[mkFin(.85,-.4),mkFin(-.85,.4)]:[mkFin(0,0)];")
R("const tn=awDecal(ghost?'DARK ARMY':'BLACKOUT 09',1.3,.28,null,ghost?'#4a4e54':'#e8e4d0');tn.position.set(.07,Y+1.6,4.4);tn.rotation.y=Math.PI/2;b.add(tn);","if(ghost){FINS.forEach((f,i)=>{const d=awDecal('DARK ARMY',1.3,.28,null,'#4a4e54');d.position.set(i?-.135:.015,1.2,1.5);d.rotation.y=i?-Math.PI/2:Math.PI/2;f.add(d)})}else{const tn=awDecal('BLACKOUT 09',1.3,.28,null,'#e8e4d0');tn.position.set(.07,Y+1.6,4.4);tn.rotation.y=Math.PI/2;b.add(tn)}")
R("const fl=A(BX(.04,.6,.9),M(0x3a4a2a),ox0+1,2.1,Z.z1-1.5);","const fl=new THREE.Group();fl.position.set(ox0+1,2.1,Z.z1-1.03);g.add(fl);{const fm=new THREE.Mesh(BX(.04,.6,.9),M(0x3a4a2a));fm.position.z=-.47;fl.add(fm)}")
R("+' operations completed'+(S.dis?' · '+S.dis+' black mark'+(S.dis>1?'s':''):'')+'</p>'","+' operations completed'+(S.dis?' · '+S.dis+' black mark'+(S.dis>1?'s':''):'')+'</p><p style=\"font-size:12px;line-height:1.7;margin:4px 0\">'+MILRANK.slice(1).map((k,i)=>{const n=i+1;return '<span style=\"white-space:nowrap;'+(n==r?'color:#ffd860;font-weight:bold':n<r?'opacity:.55':'')+'\">'+k[1]+' '+k[0]+([2,4,6,8,9,12].includes(n)?' 🏅':'')+'</span>'}).join(' → ')+'<br><span style=\"opacity:.7\">Lowest to highest. 🏅 = milestone: a bust never drops you below it.</span></p>'")
# r567: ranks above General (General of the Army ... Living Legend) were cut back to General every time the game loaded
R("SV.mil=q.mil&&typeof q.mil=='object'?{r:Math.max(0,Math.min(9,q.mil.r|0)),","SV.mil=q.mil&&typeof q.mil=='object'?{r:Math.max(0,Math.min(14,q.mil.r|0)),")
# r568: friends by user ID with an inbox
R("bd,t:svInt(o.t,9e15)}};","bd,t:svInt(o.t,9e15),u:uidNorm(o.u)||''}};")
R("bd:Object.keys(SV.bd||{}),t:Date.now()}};","bd:Object.keys(SV.bd||{}),t:Date.now(),u:ID.uid||''}};")
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx568.js').read()+"\n"+s[k:]
# r569: prestige
R("function milRank(){try{return milSV().r|0}catch(e){return 0}}","function milRank(){try{const S=milSV();return(S.pr|0)>0?Math.max(S.r|0,MILRANK.length-1):S.r|0}catch(e){return 0}}")
R("if(M.inB&&pz>MILRZ.z0&&S.r<5&&M.h<=0&&S.r>=1)","if(M.inB&&pz>MILRZ.z0&&milRank()<5&&M.h<=0&&S.r>=1)")
R("if(!M||M.op||(S.r|0)<5)return null;","if(!M||M.op||milRank()<5)return null;")
R("(S.r|0)>=7&&S.kn)return[516","milRank()>=7&&S.kn)return[516")
R("if((S.r|0)>=7&&!S.kn)return[392","if(milRank()>=7&&!S.kn)return[392")
R("line=(S.r>0?MILRANK[S.r][1]+' '+milRankNm(S.r)+' · '+S.xp+' XP'","line=(S.r>0?MILRANK[S.r][1]+' '+milMyNm()+' · '+S.xp+' XP'")
R("const list=milOpsList(r);let body='<p>'+MILRANK[r][1]+' <b>'+milRankNm(r)+'</b>","const list=milOpsList(r);let body='<p>'+MILRANK[r][1]+' <b>'+milMyNm()+'</b>")
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx569.js').read()+"\n"+s[k:]
R("if(s.wt>28){cwWorkEnd(q,s);","if(s.wt>(s.sg?SG.T.pack+3:s.sg2?SJT.pack+3:28)){cwWorkEnd(q,s);")
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx570.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx571.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx572.js').read()+"\n"+s[k:]
R("function T(k,a,b){const ky=k+'|'+(+a).toFixed(3)+'|'+(+b).toFixed(3);let t=TCa.get(ky);if(t)return t;t=TX[k].clone();t.needsUpdate=true;t.repeat.set(a,b);if(TCa.size<900){TKEEP.add(t);TCa.set(ky,t)}return t}",
"function T(k,a,b){a=Math.round(a*8)/8||.125;b=Math.round(b*8)/8||.125;const ky=k+'|'+a+'|'+b;let t=TCa.get(ky);if(t){TCa.delete(ky);TCa.set(ky,t);return t}t=TX[k].clone();t.needsUpdate=true;t.repeat.set(a,b);TKEEP.add(t);TCa.set(ky,t);if(TCa.size>120){const[ok,ot]=TCa.entries().next().value;TCa.delete(ok);TKEEP.delete(ot);ot.dispose();const pre='t'+ot.uuid+'|';for(const[mk,mm]of MCa)if(mk.startsWith(pre)){MCa.delete(mk);KEEP.delete(mm)}}return t}")
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx573.js').read()+"\n"+s[k:]
R("if(Math.hypot(v.x-tx,v.z-tz)>320&&u.st!='home'){garRemove(q,v);u.gone=1;pk.m.visible=true;","if(Math.hypot(v.x-tx,v.z-tz)>320&&u.st!='home'&&u.t>45){garRemove(q,v);u.gone=1;pk.cd=30;pk.m.visible=true;")
R("if(inZ&&!q.jail&&!q.rsp){if(!q.dzIn)","if(inZ&&milRank()>=9&&!q.dzG){q.dzG=1;hint('🎖️ Dark Zone 51 waves a General straight through. Clearance granted.')}if(inZ&&!q.jail&&!q.rsp&&!(milRank()>=9)){if(!q.dzIn)")
R("cwDrive(q,u,bx,bz,dt,18,tp?1.5:3.5)","cwDrive(q,u,bx,bz,dt,cvMax(u,pv),tp?1.5:3.5)")
R("v.K=Object.assign({},VEHK[v.k],{max:Math.min(max,VEHK[v.k].max||14)});v.hitO=null;vehPhys(q,v,dt,fx,","v.K=Object.assign({},VEHK[v.k],{max:max,acc:Math.max(9,VEHK[v.k].acc||8)});v.hitO=null;vehPhys(q,v,dt,fx,")
R("[-210,-1440,'at the bottom of the quarry']","[-210,-1450,'at the bottom of the quarry']")
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx574.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx575.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx577.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx578.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx579.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx580.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx581.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx582.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx583.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx585.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx586.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx587.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx588.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx589.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx590.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx591.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx592.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx593.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx594.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx595.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx596.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx597.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx598.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx599.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx600.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx601.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx602.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx603.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx604.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx605.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx606.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx607.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx608.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx609.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx610.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx611.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx612.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx613.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx614.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx615.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx616.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx617.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx618.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx619.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx620.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx621.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx622.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx623.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx624.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx625.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx629.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx626.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx628.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx627.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx630.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx631.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx632.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx633.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx634.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx637.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx638.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx639.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx640.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx641.js').read()+"\n"+s[k:]
# quarry underground (docs/design/quarry-underground.md): dx642 = the design chat's models, dx642b = the wiring
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx642.js').read()+"\n"+s[k:]
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx642b.js').read()+"\n"+s[k:]
# the small sights round Route 13 (docs/design/small-sights.md): the models and the wiring
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx643.js').read()+"\n"+s[k:]
# r658 Lookout Mesa and Devil's Gorge (docs/design/mesa-gorge.md): the design chat's models plus the wiring
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx644.js').read()+"\n"+s[k:]
# r660 the desert map and minimap redo (docs/design/desert-map.md): areas, buildings drawn from their walls, labels, banner, smooth zoom
k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dx645.js').read()+"\n"+s[k:]
R("A(BX(.3,.4,.12),RD,BX0+.4,1.5,-690);A(BX(.1,.2,.14),WH,BX0+.4,1.5,-690);","A(BX(.12,.4,.3),RD,BX0+.4,1.5,-690);A(BX(.14,.2,.1),WH,BX0+.42,1.5,-690);")
R("if(!N.tgt&&!q.ngSeen)return","if(!N.tgt&&!q.ngSeen&&!milSV().ngSeen)return")
R("{const ng0=ngDlg;ngDlg=function(q){q.ngSeen=1;return","{const ng0=ngDlg;ngDlg=function(q){q.ngSeen=1;try{const S=milSV();if(!S.ngSeen){S.ngSeen=1;milSave()}}catch(e){}return")
R("else if(pl&&fig&&!(fig.intro>0)&&!(fig.stun>0))m=n>=100?'final':'stealth';","else if(pl&&fig&&!(fig.intro>0)&&!(fig.stun>0)&&!(typeof figMusOn=='function'&&figMusOn()))m=n>=100?'final':'stealth';")
R("const nx=P.x+f.vx*dt,nz=P.z+f.vz*dt;if(nx>-DXB+1&&nx<DXB-1)P.x=nx;else f.vx=0;if(nz-q.OZ<DZN-1&&nz-q.OZ>DZS+1)P.z=nz;else f.vz=0;","const nx=P.x+f.vx*dt,nz=P.z+f.vz*dt;if((nx>-DXB+1&&nx<DXB-1)||milArea(nx,P.z-q.OZ))P.x=nx;else f.vx=0;if((nz-q.OZ<DZN-1&&nz-q.OZ>DZS+1)||milArea(P.x,nz-q.OZ))P.z=nz;else f.vz=0;")
R("T('quarry pick',()=>{const{x0,x1,z0,z1,y:D}=QUARRY,cz=(z0+z1)/2;const px=x0+2.6,pz=cz-8;","T('quarry pick',()=>{const{x1,z0,z1,y:D}=QUARRY,x0=QUARRY.x0+8,cz=(z0+z1)/2;const px=x0+2.6,pz=cz-10;")
R("if(n>=7)try{badge('stunt')}","if(n>=5)try{badge('stunt')}")
R("if((grinForce||Math.random()<(MODS.grin?.05:.01))","if((grinForce||Math.random()<(MODS.grin?.05:.02))")
R("dbgPrev=state;if((MP.on&&mpOpen().length||HUB.on)&&(state=='play'||state=='spec')){DBGMP=1}else state='debug';","dbgPrev=state;if(((MP.on&&mpOpen().length||HUB.on)&&(state=='play'||state=='spec'))||(state=='bus'&&BUS.ride)){DBGMP=1}else state='debug';")
R("function dbgClose(){dp.style.display='none';if(DBGMP){DBGMP=0;if(state=='play'&&!MOB.on)","function dbgClose(){dp.style.display='none';if(DBGMP){DBGMP=0;if((state=='play'||state=='bus')&&!MOB.on)")
R("ob(422.5,426.2,-850,-830);soldier(424,-836,-Math.PI/2);soldier(424,-845,-Math.PI/2);","ob(539.5,543.2,-866,-846);{const SP=[];for(const[r,z]of[[0,-863],[1,-860.5],[2,-857],[0,-854],[1,-851.5],[2,-849],[1,-864.5],[0,-848.5]]){const x=540.25+r,s=soldier(x,z,0);s.position.y=.9+.49+r*.4;s.rotation.y=Math.atan2(-(486-x),-(-853-z));try{const i=MILIDLE.indexOf(s);if(i>=0)MILIDLE.splice(i,1)}catch(e){}SP.push(s)}anim(541,-856,90,dt=>{const t=q.rt||0;SP.forEach((s,i)=>{const rg=s.children[0]&&s.children[0].userData.rig;if(!rg)return;const cl=(Math.sin(t*.35+i)>.55);rg.arms.forEach((a,k)=>{a.p.rotation.x=cl?-1.25+Math.sin(t*14+k*Math.PI)*.12:-.15;a.p.rotation.z=cl?(k?-.35:.35):a.s*.12});rg.head.rotation.y=Math.sin(t*.4+i*1.7)*.35})})}")
R("LB('TANK PARK · 13TH ARMOURED · SERGEANTS AND UP',8,.9,'#20261c','#e8f0d0',470,3.2,-800.2,Math.PI);","LB('TANK PARK · 13TH ARMOURED · SERGEANTS AND UP',8,.9,'#20261c','#e8f0d0',470,3.2,-800.27,Math.PI);A(BX(8.3,1.15,.12),M(0x2a3020),470,3.2,-800.15);for(const sx of[465.6,474.4])A(CY(.08,.1,3.75,8),M(0x4a4e54,{metalness:.6}),sx,1.87,-800.12);")
R("LB('X-13 WRAITH PROGRAMME · HANGAR 1 · COLONELS ONLY · ALL OTHERS WILL BE SHOT',14,1.2,'#101418','#40c0ff',426.3,8.2,-694,Math.PI/2)","LB('X-13 WRAITH PROGRAMME · HANGAR 1 · COLONELS ONLY · ALL OTHERS WILL BE SHOT',14,1.2,'#101418','#40c0ff',425.05,8.05,-694,Math.PI/2)")
R("T('wind pump',()=>{const px=-55,pz=-1000;A(BX(.5,.6,.6),M(0x5a5a5a,{metalness:.5}),px,.9,pz+.45);const ax=A(CY(.04,.04,.5,6),MT,px-.45,1.05,pz+.45);ax.rotation.z=Math.PI/2;const crank=new THREE.Group();crank.position.set(px-.72,1.05,pz+.45);","T('wind pump',()=>{const px=-55,pz=-1000;A(BX(.56,1.25,.56),M(0x5a5a5a,{metalness:.5}),px,.625,pz);A(BX(.7,.08,.7),M(0x4a4a4a,{metalness:.5}),px,.04,pz);A(CY(.09,.09,.12,10),MT,px,1.31,pz);const ax=A(CY(.04,.04,.46,6),MT,px-.49,1.05,pz);ax.rotation.z=Math.PI/2;const crank=new THREE.Group();crank.position.set(px-.72,1.05,pz);")
R("const wf=A(CY(.06,.06,1.2,8),MT,px+1.8,.9,pz+.5);wf.rotation.z=Math.PI/2;const sp=A(CY(.05,.05,.5,6),MT,px+2.35,.75,pz+.5);sp.rotation.x=.4;","const wf=A(CY(.06,.06,2.08,8),MT,px+1.3,.9,pz);wf.rotation.z=Math.PI/2;A(CY(.085,.085,.08,8),MT,px+.3,.9,pz).rotation.z=Math.PI/2;A(new THREE.SphereGeometry(.075,8,6),MT,px+2.34,.9,pz);const sp=A(CY(.06,.07,.24,8),MT,px+2.34,.78,pz);for(const sx of[px+.9,px+1.9]){A(CY(.03,.03,.84,6),MT,sx,.42,pz);A(BX(.1,.04,.1),MT,sx,.85,pz)}")
R("stream.position.set(px+2.6,.55,pz+.5);g.add(stream);const trough=g.children.find(o=>o.isMesh&&o.geometry.type=='BoxGeometry'&&Math.abs(o.position.x-(px+3.2))<.01&&Math.abs(o.position.y-.56)<.01);","stream.position.set(px+2.34,.5,pz);g.add(stream);const trough=g.children.find(o=>o.isMesh&&o.geometry.type=='BoxGeometry'&&Math.abs(o.position.x-(px+3.2))<.01&&Math.abs(o.position.y-.4)<.01);")
R("if(trough)trough.position.y=.56+Math.min(.03,(20-t)*.003);if(Math.random()<dt*8)try{vfx('spark',px+2.6+(R()-.5)*.6,.9,pz+.5+q.OZ","if(trough)trough.position.y=.4+Math.min(.1,(20-t)*.008);if(Math.random()<dt*8)try{vfx('spark',px+2.34+(R()-.5)*.3,.5,pz+q.OZ")
R("A(BX(2.6,.6,1.0),M(0x6a6a70,{metalness:.5}),px+3.2,.3,pz+.5);A(BX(2.4,.05,.8),M(0x2a6a9a,{roughness:.1,metalness:.3}),px+3.2,.56,pz+.5);ob(px+1.9,px+4.5,pz,pz+1.0);","{const TM=M(0x6a6a70,{metalness:.5}),cx=px+3.2;A(BX(2.6,.06,1.0),TM,cx,.1,pz);for(const sz of[-1,1])A(BX(2.6,.6,.06),TM,cx,.33,pz+sz*.47);for(const sx of[-1,1])A(BX(.06,.6,.88),TM,cx+sx*1.27,.33,pz);for(const sx of[-1,1])for(const sz of[-1,1])A(BX(.08,.08,.08),M(0x3a3a3e),cx+sx*1.2,.04,pz+sz*.4);A(BX(2.48,.03,.88),M(0x2a6a9a,{roughness:.1,metalness:.3,transparent:true,opacity:.85}),cx,.4,pz);ob(px+1.9,px+4.5,pz-.5,pz+.5)}")
R("const px=x0+2.6,pz=cz-10;const pk=A(BX(.06,1.0,.06),M(0x6a4a2a),px+.4,D+.5,pz+.3);pk.rotation.z=.4;A(BX(.5,.1,.1),MT,px+.6,D+.95,pz+.3);for(let i=0;i<5;i++){const o=A(new THREE.DodecahedronGeometry(.18,0),M(0xc0a030,{metalness:.8,roughness:.3,emissive:0x302000}),x0+1.2+R()*.6,D+1+R()*3,pz+(R()-.5)*4);o.rotation.set(R(),R(),R())}","const D0=D,px=x0+1.6,pz=cz-10;{const D=QD.F;/* a proper pickaxe, leaning on the rock face: wooden haft, a curved steel head with a point and a chisel end */const pg=new THREE.Group();pg.position.set(x0+.75,D,pz+.6);pg.rotation.z=-.42;g.add(pg);window.QPK={pg,nug:[],fx:x0+.15,fy:D+1.5,fz:pz};const hf=new THREE.Mesh(CY(.035,.045,1.05,8),M(0x7a5232,{roughness:.8}));hf.position.y=.53;pg.add(hf);const gr=new THREE.Mesh(CY(.05,.05,.2,8),M(0x2a2a2a));gr.position.y=.12;pg.add(gr);const eye=new THREE.Mesh(BX(.1,.12,.1),M(0x5a5e64,{metalness:.8,roughness:.4}));eye.position.y=1.03;pg.add(eye);for(const sd of[-1,1]){const arm=new THREE.Mesh(new THREE.ConeGeometry(.045,.42,6),M(0x8a8e94,{metalness:.85,roughness:.35}));arm.position.set(sd*.22,.99,0);arm.rotation.z=sd*-(Math.PI/2+.22);if(sd>0)arm.scale.set(1.5,1,.45);pg.add(arm)}/* gold nuggets half-sunk in the face, a seam of quartz between them */for(let i=0;i<6;i++){const o=A(new THREE.DodecahedronGeometry(.13+R()*.07,0),M(0xd0a830,{metalness:.85,roughness:.3,emissive:0x302000}),x0+.03,D+.7+R()*2.2,pz+(R()-.5)*3.2);o.rotation.set(R()*3,R()*3,R()*3);o.scale.x=.55;QPK.nug.push(o)}}")
R("T('quarry pick',()=>{const{x1,z0,z1,y:D}=QUARRY,x0=QUARRY.x0+8,","T('quarry pick',()=>{const{x1,z0,z1}=QUARRY,D=QD.F,x0=QUARRY.x0+8,")
R("try{vfx('spark',x0+1.2,D+1.6,pz+q.OZ,{n:6,c:0xffd080})}catch(e){}if(R()<.45){n++;gold+=2;","try{qpkSwing(q)}catch(e){}if(R()<.45){n++;try{setTimeout(qpkNug,420)}catch(e){}gold+=2;")
R("crouchOn(q)&&vehGround(q,P.x,P.z-q.OZ)>-.01","crouchOn(q)")
# ---- r589: rooms that turn corners ----
R("box((-HE+DX-.8)/2,HY/2,ez,lw,HY,.2,W(lw/3.2,HY/2));box((HE+DX+.8)/2,HY/2,ez,rw,HY,.2,Wo(rw/3.2,HY/2,DX+.8,0,rw,HY));box(DX,(UP+3+HY)/2,ez,1.6,HY-UP-3,.2,Wo(.5,(HY-UP-3)/2,DX-.8,UP+3,1.6,HY-UP-3));if(UP)box(DX,UP/2,ez,1.6,UP,.2,Wo(.5,UP/2,DX-.8,0,1.6,UP));","if(TRN)box(0,HY/2,ez,HE*2,HY,.2,W(HE*2/3.2,HY/2));else{box((-HE+DX-.8)/2,HY/2,ez,lw,HY,.2,W(lw/3.2,HY/2));box((HE+DX+.8)/2,HY/2,ez,rw,HY,.2,Wo(rw/3.2,HY/2,DX+.8,0,rw,HY));box(DX,(UP+3+HY)/2,ez,1.6,HY-UP-3,.2,Wo(.5,(HY-UP-3)/2,DX-.8,UP+3,1.6,HY-UP-3));if(UP)box(DX,UP/2,ez,1.6,UP,.2,Wo(.5,UP/2,DX-.8,0,1.6,UP))}")
R("et(-HE+.09,DX-.93,ez+.1,1);et(DX+.93,HE-.09,ez+.1,1);box(DX,HY-.07,ez+.14,1.9,.14,.08,0xd8c8a8);","if(TRN)et(-HE+.09,HE-.09,ez+.1,1);else{et(-HE+.09,DX-.93,ez+.1,1);et(DX+.93,HE-.09,ez+.1,1);box(DX,HY-.07,ez+.14,1.9,.14,.08,0xd8c8a8)}")
R("const cw0=!f&&!hh&&!sk&&nn>2","const cw0=!(prev&&prev.dd&&prev.dd.side)&&!f&&!hh&&!sk&&nn>2")
R(" const mkp=mk?mineLayoutPlan(mk,L,HX,HY,occ,obs0):null;"," const TT=turnPlan(nn,prev,{first,f,hh,sk,CI,ofcI,arcI,stI,xcr,itx,gal,lob,ex,mlt,locked,cm,boss,wt0,mk,HX,L,MINE}),TRN=TT.ex,TZ=-L-1+HX,LEGS=TT.legs;for(const lg of LEGS){for(let i=wg.length-1;i>=0;i--){const w=wg[i];if(w.s==lg.s&&w.z-(w.hz||0)<TZ+HX+14)wg.splice(i,1)}wg.push({s:lg.s,z:TZ,hz:0,g:HX,mzd:1,tx:1,d:lg.leg+4});occ.push({s:lg.s,z:TZ,h:HX+.4})}if(L2W&&L2W.v2)for(let i=wg.length-1;i>=0;i--){const w=wg[i];if(w!==L2W&&w.s==L2W.s&&Math.abs(w.z-L2W.z)<8.5+(w.hz||0))wg.splice(i,1)}\n const mkp=mk?mineLayoutPlan(mk,L,HX,HY,occ,obs0):null;")
R("nn>=2&&Math.random()<.7){const r0=mkHallVar(","nn>=2&&!LEGS.length&&Math.random()<.7){const r0=mkHallVar(")
R(" else{const phx=prev?(prev.ew||prev.hx||4):4,phy=prev?(prev.hy||4):4;"," else if(prev&&prev.dd&&prev.dd.side){for(const sd of[-1,1])box(sd*(HX+.8)/2,HY/2,1,HX-.8,HY,.2,W((HX-.8)/3.2,HY/2));box(0,(3+HY)/2,1,1.6,HY-3,.2,W(.5,(HY-3)/2))}\n else{const phx=prev?(prev.ew||prev.hx||4):4,phy=prev?(prev.hy||4):4;")
R(" G.position.z=off;G.position.y=EB;({G,L,wards"," for(const lg of LEGS)try{if(lg.end=='exit')sideExit(room,lg.s,TZ,HY,UP,lg.leg);else legEnd(room,lg.s,TZ,HY,UP,lg.leg,lg.end)}catch(e){conLog('error','corner leg: '+e.message)}if(TT.cross)crossFinish(room,TT,HY);if(L2W&&L2W.v2)l2Finish(room,L2W,UP);G.position.z=off;G.position.y=EB;({G,L,wards")
R("const canHide=r=>!!r&&(r.wards.length>0||r.wg.length>0||","const canHide=r=>!!r&&(r.wards.length>0||r.wg.some(w=>!w.tx)||")
R(""" for(const r of RMS){r.off+=dz;r.G.position.z=r.off}
 for(const e of EV){e.m.position.z+=dz;e.hi+=dz;e.lo+=dz}
 for(const q of VFX)q.s.position.z+=dz;
 crkShift(dz);mpGhostShift(dz,0);if(REVA)REVA.g.position.z+=dz;if(HC){HC.m.position.z+=dz;HC.doors++;if(HC.doors>=HC.need&&!HC.gone)hcGiveUp()}
 P.z+=dz;""",""" const WT=worldTo(o);if(!WT.rot){for(const r of RMS){r.off+=dz;r.G.position.z=r.off}
 for(const e of EV){e.m.position.z+=dz;if(e.rooms)for(const r of e.rooms)if(!RMS.includes(r)){r.off+=dz;r.G.position.z=r.off}}
 for(const q of VFX)q.s.position.z+=dz;
 crkShift(dz);mpGhostShift(dz,0);if(REVA)REVA.g.position.z+=dz;if(HC){HC.m.position.z+=dz;HC.doors++;if(HC.doors>=HC.need&&!HC.gone)hcGiveUp()}
 P.z+=dz}else if(HC){HC.doors++;if(HC.doors>=HC.need&&!HC.gone)hcGiveUp()}""")
R("""try{ci--;n=prev.n;for(const r of RMS){r.off-=dz;r.G.position.z=r.off}
  for(const e of EV){e.m.position.z-=dz;e.hi-=dz;e.lo-=dz}
  mpGhostShift(-dz,0);crkShift(-dz);""","""try{ci--;n=prev.n;const WT=worldTo(prev);if(!WT.rot){for(const r of RMS){r.off-=dz;r.G.position.z=r.off}
  for(const e of EV){e.m.position.z-=dz;if(e.rooms)for(const r of e.rooms)if(!RMS.includes(r)){r.off-=dz;r.G.position.z=r.off}}
  mpGhostShift(-dz,0);crkShift(-dz)}""")
R("P.z=-prev.L-.1;setCur(prev)}finally{mpWarp=0}","if(prev.dd&&prev.dd.side){P.x=prev.dd.side*((prev.dd.sx||prev.hx)-.3);P.z=prev.dd.cz}else P.z=-prev.L-.1;setCur(prev)}finally{mpWarp=0}")
R("if(dor&&!dor.open&&P.z<-L+.9&&Math.abs(P.x-(dor.cx||0))<1.3)touch();","if(dor&&!dor.side&&!dor.open&&P.z<-L+.9&&Math.abs(P.x-(dor.cx||0))<1.3)touch();")
R("(op&&Math.abs(P.x-(dor.cx||0))<=.75)||dbgClip?-L-4:-L-.5","(op&&!dor.side&&Math.abs(P.x-(dor.cx||0))<=.75)||dbgClip?-L-4:-L-.5")
R("if(op&&P.z<-L-.6){const cx=dor.cx||0;P.x=Math.max(cx-.75,Math.min(cx+.75,P.x))}if((op||dbgClip)&&P.z<-L-1.4){if(!op&&dor){dor.open=1;dor.fast=1}enter()}}}","if(op&&!dor.side&&P.z<-L-.6){const cx=dor.cx||0;P.x=Math.max(cx-.75,Math.min(cx+.75,P.x))}if(((op&&!dor.side)||dbgClip)&&P.z<-L-1.4){if(!op&&dor){dor.open=1;dor.fast=1}enter()}sideDoorTick()}}")
R("const hi=RMS[a].off+8,lo=RMS[b].off-RMS[b].L-8,m=mdl(e.k);m.position.set(0,1.2,hi);S.add(m);EV.push({k:e.k,m,d:-1,pass:0,max:rs?1:3,hi,lo,id:(spawnEv.c=(spawnEv.c||0)+1)});","const m=mdl(e.k),ev={k:e.k,m,d:1,s:0,pass:0,max:rs?1:3,rooms:RMS.slice(a,b+1),id:(spawnEv.c=(spawnEv.c||0)+1)};ev.pth=evPath(ev);ev.ds=evDoorS(ev.pth);{const p0=pthAt(ev.pth,0);m.position.set(p0.x,1.2,p0.z)}S.add(m);EV.push(ev);const hi=0,lo=ev.pth.T;")
R("m.position.z+=e.d*sp;evBossSkip(e,m,pz);","const st=evStep(e,sp);evBossSkip(e,m,pz);")
R("{const dd=Math.abs(m.position.z-P.z);if(dd<14&&!BSM&&!ORG)camShake(.07*(1-dd/14),.12)}","{const dd=evDist(e);if(dd<14&&!BSM&&!ORG)camShake(.07*(1-dd/14),.12)}")
R("if(P.hid&&(pz-P.z)*(m.position.z-P.z)<=0&&t-(P.hideT||-99)<=.75)badge('reflex');if(P.hid&&Math.abs(m.position.z-P.z)<4)e.hid=1;else if(!P.hid&&(Math.abs(P.x)>CW-.6||(P.dy||0)<-1.5)&&Math.abs(m.position.z-P.z)<4)e.sd=1;m.rotation.y=e.d<0?0:Math.PI;if(rs)rushAu(e,Math.abs(m.position.z-P.z),dt);",
  "if(P.hid&&evDist(e)<3&&t-(P.hideT||-99)<=.75)badge('reflex');if(P.hid&&evDist(e)<5)e.hid=1;else if(!P.hid&&(Math.abs(P.x)>CW-.6||(P.dy||0)<-1.5)&&evDist(e)<5)e.sd=1;if(rs)rushAu(e,evDist(e),dt);else ambAu(e,evDist(e),dt);")
R("  if(e.d<0)for(const r of RMS){const q=m.position.z-(r.off-r.L-1);if(!r.dd.open&&!r.locked&&!(r.mb>0)&&!(r.cave&&!r.cave.done)&&!r.el&&!(r.pz&&!r.pz.open)&&!(r.dgt&&r.dgt.p<1)&&r.n<100&&q>0&&q<7){r.dd.open=1;r.dd.fast=1;snd(90,.35)}}\n","")
R("rayHit(pz,e.d,sp+1))hitEv(e,'Rush')}else if(!inBoss()&&Math.abs(m.position.z-P.z)<2.5&&!P.hid","st&&evHitTest(e,st,sp))hitEv(e,'Rush')}else if(!inBoss()&&st&&evHitTest(e,st,sp)&&!P.hid")
R("if(e.d<0&&m.position.z<e.lo||e.d>0&&m.position.z>e.hi){e.pass++;","if(e.d>0&&e.s>=e.pth.T||e.d<0&&e.s<=0){e.pass++;")
R("for(const l of r.RL){if(l.visible===false)continue;const z=l.position.z+r.off,yy=l.position.y+(r.eb||0),dx=l.position.x-cp.x,dy=yy-cp.y,dz=z-cp.z;cand.push([dx*dx+dy*dy+dz*dz,l,z,yy])}","for(const l of r.RL){if(l.visible===false)continue;const W2=rWorld(r,l.position.x,l.position.z),z=W2[1],yy=l.position.y+(r.eb||0),dx=W2[0]-cp.x,dy=yy-cp.y,dz=z-cp.z;cand.push([dx*dx+dy*dy+dz*dz,l,z,yy,W2[0]])}")
R("p.position.set(l.position.x,c[3],c[2])","p.position.set(c[4],c[3],c[2])")
R("Math.abs(rr.off+r.z-pos.z)<70","(W=>Math.hypot(W[0]-pos.x,W[1]-pos.z))(rWorld(rr,r.x,r.z))<70")
R("Math.abs(rr.off+r.z-pos.z)<60","(W=>Math.hypot(W[0]-pos.x,W[1]-pos.z))(rWorld(rr,r.x,r.z))<60")
R("d=Math.hypot(r.x-pos.x,rr.off+r.z-pos.z)","d=(W=>Math.hypot(W[0]-pos.x,W[1]-pos.z))(rWorld(rr,r.x,r.z))")
R("const wx=r.x,wz=room.off+r.z,wy=","const WG=rWorld(room,r.x,r.z),wx=WG[0],wz=WG[1],wy=")
R("g.rotation.y+=wrapA(r.yaw-g.rotation.y)*Math.min(1,dt*10);","g.rotation.y+=wrapA(r.yaw+(room.G.rotation.y||0)-g.rotation.y)*Math.min(1,dt*10);")
R("const key=m.k,wx=m.x,wz=room.off+m.z;","const key=m.k,WM=rWorld(room,m.x,m.z),wx=WM[0],wz=WM[1];")
# math bridge pages: a glow over each one, so they can be spotted over the maze walls
R("g.add(new THREE.Mesh(BG(.5,.32,.02),new THREE.MeshStandardMaterial({map:mathTex(pu.parts[idx]),emissive:0x332a10,roughness:.9})));","g.add(new THREE.Mesh(BG(.5,.32,.02),new THREE.MeshStandardMaterial({map:mathTex(pu.parts[idx]),emissive:0x332a10,roughness:.9})));{const gw=glowSp(0xffe08a,.6,1.8);gw.position.y=.9;g.add(gw);const gw2=glowSp(0xffe08a,.35,1.2);gw2.position.y=2.4;g.add(gw2)}")
# ---- r589: side rooms with doors ----
R("for(const s of[-1,1])wg.push({s,z:-5-i*5,hz:2,g:1.1,d:3.5,rm:1})}","for(const s of[-1,1])wg.push({s,z:-5.2-i*6.6,hz:2.7,g:.8,d:5,rm:1,sr:1})}")
R(" const mkp=mk?mineLayoutPlan(mk,L,HX,HY,occ,obs0):null;"," if(MINE&&nn>=3&&nn<99&&!mk&&!f&&!hh&&!sk&&CI<0&&L>=16&&HX==4&&Math.random()<.45){const s=Math.random()<.5?-1:1,z=-Math.round(L*(.3+Math.random()*.35));if(!wg.some(w=>w.s==s&&Math.abs(w.z-z)<8))wg.push({s,z,hz:2.6,g:.8,d:4.6,rm:1,sr:1,mine:1})}\n const mkp=mk?mineLayoutPlan(mk,L,HX,HY,occ,obs0):null;")
R("const chs=w.rm&&Math.random()<CHEST_P;","if(w.sr){try{mkSideRoom(w,obs0,MINE)}catch(e){conLog('error','side room: '+e.message)}continue}const chs=w.rm&&Math.random()<CHEST_P;")
R("if(!m.isMesh||!m.geometry||doorM.has(m)||","if(!m.isMesh||!m.geometry||doorM.has(m)||m.userData.keep||")
# desert roads: the pieces overlap a little (no hairline gaps between them), each at a hair's different height so the overlaps never flicker
R("const m=new THREE.Mesh(new THREE.PlaneGeometry(W,L),M(0xffffff,{map:t,roughness:1}));m.rotation.x=-Math.PI/2;if(r.along)m.rotation.z=Math.PI/2;m.position.set((x0+x1)/2,r.dirt?.045:.06,(z0+z1)/2);g.add(m)}}","const m=new THREE.Mesh(new THREE.PlaneGeometry(W+.12,L+.12),M(0xffffff,{map:t,roughness:1}));m.rotation.x=-Math.PI/2;if(r.along)m.rotation.z=Math.PI/2;m.position.set((x0+x1)/2,(r.dirt?.045:.06)+(done.length%6)*.0016,(z0+z1)/2);g.add(m)}}")
R("if(r.n>=3&&r.n%6==3&&!CH2&&!big&&!r.hh&&!r.seek&&L>=10){mineCave(r,PM,cx,DZ,h);return}","if(r.dd&&r.dd.side)return;if(r.n>=3&&r.n%6==3&&!CH2&&!big&&!r.hh&&!r.seek&&L>=10){mineCave(r,PM,cx,DZ,h);return}")
R("for(const k of[.3,.7]){occ.push({s:-1,z:-L*k,h:1.1});rainWin(-L*k);","for(const k of[.3,.7]){if((LEGS.some(l=>l.s==-1)&&Math.abs(-L*k-TZ)<HX+1.4)||(L2W&&L2W.v2&&L2W.s==-1&&Math.abs(-L*k-L2W.z)<7.6))continue;occ.push({s:-1,z:-L*k,h:1.1});rainWin(-L*k);")
R("q.prog+=dt;vmAct('mop');","q.prog+=dt*(boost.length?1+.6*Math.min(3,boost.length):1);vmAct('mop');")
R("d.position.set(x,0,z-1.2);G.add(d);\n  box(x,1.5,z-1.8,.6,.2,.04,sgn('HIGH-LOW','#ffe060','#1a0a2a'),0x200020);","d.position.set(x,0,z-1.2);d.rotation.y=Math.PI;G.add(d);\n  box(x,2.55,z-1.85,1.1,.34,.05,sgn('HIGH-LOW','#ffe060','#1a0a2a'),0x200020);box(x,2.55,z-1.89,1.18,.42,.03,0xd8a830,0x3a2a00);for(const o of[-.5,.5])box(x+o,1.2,z-1.9,.05,2.4,.05,0xd8a830,0x3a2a00);")
R("if(sk&&CI>0){const q=mkChaseObs(L,HX,","if(sk&&CI>0){const q=mkChaseObs(LEGS.length?L-5:L,HX,")
R("const chase=!!cut&&!!cut.pud||!!(seek&&seek.on)||seekChase()||","const chase=!!cut&&!!cut.pud||!!(seek&&seek.on)||seekChase()||(MP.on&&!HUB.on&&((typeof smLive=='function'&&smLive('seek'))||(chIdx(n)>=1&&chIdx(n)<=9)))||")
R("else if(wt=='L2')wg.push({s:Math.random()<.5?-1:1,z:-L*.5,hz:3.6,g:3.3,d:12,l2:1,q:Math.random()<.5?-1:1,e:3.4,n:2+(Math.random()<.5?1:0)});","else if(wt=='L2'){const s2=Math.random()<.5?-1:1;wg.push(L2W={s:s2,z:Math.max(-L+8.2,Math.min(-8.2,-L*.5)),hz:6.6,g:1.3,d:13.6,l2:1,v2:1,q:1,e:3.4,n:2});occ.push({s:s2,z:L2W.z,h:7.4})}")
R("if(w.l2){mkL2(w,hotelW,trim4,wOff,W);continue}","if(w.l2){mkL2(w,hotelW,trim4,wOff,W,obs0,nn);continue}")
R("function mkRoomRaw(nn,first,off,prev){mkHallVar.k='';","function mkRoomRaw(nn,first,off,prev){mkHallVar.k='';L2W=null;")
_o,_n=("if(vehGround(q,x,lz)-g0>.6)return false;if(vehHit(q,x,lz,.3))return false;return true};","if(vehGround(q,x,lz)-g0>.6)return false;/* the edge of a higher ledge is a wall too: keep the same body's width off it (a Sylveon's head reaches further) */{const rr=(typeof isSyl=='function'&&isSyl(SV.oc|0))?.75:.5;for(const[a,b]of[[rr,0],[-rr,0],[0,rr],[0,-rr],[rr*.7,rr*.7],[-rr*.7,rr*.7],[rr*.7,-rr*.7],[-rr*.7,-rr*.7]])if(vehGround(q,x+a,lz+b)-g0>.6)return false}if(vehHit(q,x,lz,.3))return false;return true};")
assert s.count(_o)==2;s=s.replace(_o,_n)
_o,_n=("dmapDraw(q,DMAP.fc,(DMAP.zm||1)>1.01?P.x:0,(DMAP.zm||1)>1.01?P.z-q.OZ:-1310,","dmapDraw(q,DMAP.fc,(DMAP.zm||1)>1.01?P.x+(DMAP.px||0):0,(DMAP.zm||1)>1.01?P.z-q.OZ+(DMAP.pz||0):-1310,")
assert s.count(_o)==2;s=s.replace(_o,_n)
R("props.push({x:wx,z:wz,r:2.1,txt:()=>'[E] Toss a coin in the well (1 🪙)',act:()=>{if(gold<1){hint('🪙 You have no coin to toss. The well does not care.');return}gold-=1;try{saveGame()}catch(e){}snd(900,.05);setTimeout(()=>snd(300,.15),600);const r=Math.random();\n   if(r<.2){","props.push({x:wx,z:wz,r:2.1,txt:()=>'[E] Toss a coin in the well (10 🪙)',act:()=>{if(gold<10){hint('🪙 The well wants 10 gold. It has expensive tastes.');return}if(q.wellT>q.rt){hint('🪙 Give the well a moment. It is still thinking about your last wish.');return}q.wellT=q.rt+4;gold-=10;try{saveGame()}catch(e){}snd(900,.05);setTimeout(()=>snd(300,.15),600);const td=new Date().toDateString();if(SV.wellD!==td){SV.wellD=td;SV.wellN=0}const r=(SV.wellN|0)>=3?1:Math.random();\n   if(r<.06){SV.wellN=(SV.wellN|0)+1;")
R("hint('🗝️ ...plink. Something glints and a LOCKPICK lands at your feet. Wish granted: +1 lockpick for the run.')}else if(r<.3){","hint('🗝️ ...plink. Something glints and a LOCKPICK lands at your feet. Wish granted: +1 lockpick for the run.')}else if(r<.12){SV.wellN=(SV.wellN|0)+1;")
R("setTimeout(()=>{busy=0;const r=R();if(r<.3){const n=1+(R()*3|0);","setTimeout(()=>{busy=0;q.bktT=q.rt+45;const r=R();if(r<.08){const n=1+(R()*2|0);")
R("prop(wx,wz-2.0,1.3,()=>busy?'🪣 ...winding...':'[E] Wind up the bucket',()=>{if(busy)return;","prop(wx,wz-2.0,1.3,()=>busy?'🪣 ...winding...':q.bktT>q.rt?'🪣 The rope is still wet. Give it '+Math.ceil(q.bktT-q.rt)+' s.':'[E] Wind up the bucket',()=>{if(busy||q.bktT>q.rt)return;")
R("/* bleachers on the west edge of the square, facing the podium */for(let r=0;r<3;r++){A(BX(.6,.08,20),M(0x8a8a90,{metalness:.4}),423+r*1,.45+r*.4,-840);A(BX(.6,.08,20),M(0x8a8a90,{metalness:.4}),423.5+r*1,.45+r*.4,-840);A(BX(.1,.45+r*.4,20),DK,423.3+r*1,.22+r*.2,-840)}","/* bleachers on the east edge of the square, looking across at the parade (the command wing and the bays took the west edge) */for(let r=0;r<3;r++){A(BX(.6,.08,20),M(0x8a8a90,{metalness:.4}),540+r*1,.45+r*.4,-856);A(BX(.6,.08,20),M(0x8a8a90,{metalness:.4}),540.5+r*1,.45+r*.4,-856);A(BX(.1,.45+r*.4,20),DK,540.3+r*1,.22+r*.2,-856)}")
R("lab('SPECTATORS · CLAP WHEN TOLD',3,.4,'#20261c','#e8f0d0',424.5,1.9,-829.5,0,44);","lab('SPECTATORS · CLAP WHEN TOLD',3,.4,'#20261c','#e8f0d0',541.5,1.9,-845.5,0,44);")
R("const free=(x,z)=>!inZone(x,z)&&!onRoad(x,z)&&","const free=(x,z)=>!inZone(x,z)&&!milArea(x,z,-14)&&!onRoad(x,z)&&")
# r605: the desert police (patrol and chase) drive with the shared AI driver in dx601.js
R("const dh=wrapA(best-v.h),top=mode=='road'?15:17,vt=Math.min(top,Math.sqrt(Math.max(0,(G.beat?dG+40:dG)-4)*2*7)+2)*(Math.abs(dh)>1?.55:1);let fx=v.v>vt+1?-1:v.v<vt?.85:0,sx=Math.max(-1,Math.min(1,-dh*2.4));if(wp[2]=='land'||wp[2]=='ramp'&&d<12)fx=1;if(Math.abs(dh)>2&&d<10){fx=-.6;sx=-sx}\n if(c.rev>0){c.rev-=dt;fx=-1;sx=c.rsx}else if(Math.abs(v.v)<1&&c.t>2){c.stuck=(c.stuck||0)+dt;if(c.stuck>1.2){c.rev=1.1;c.rsx=Math.random()<.5?-1:1;c.stuck=0;c.rpT=0}}else c.stuck=0;\n v.K=Object.assign({},VEHK.cop,{max:wp[2]=='land'||wp[2]=='ramp'?20:top,acc:wp[2]=='ramp'?11:8});v.hitO=null;vehPhys(q,v,dt,fx,sx,true,false);","/* r605: the shared AI driver (dx601) */const top=mode=='road'?15:17,rmp=wp[2]=='land'||(wp[2]=='ramp'&&d<12),atG=Math.hypot(wp[0]-G.x,wp[1]-G.z)<1;v.K=Object.assign({},VEHK.cop,{max:rmp?20:top,acc:wp[2]=='ramp'?11:8});\n let r=aiCtl(q,v,c,best,d,dt,{max:top,ramp:rmp,stop:atG&&!G.beat?5:null});if(c.rev>0){c.rev-=dt;r=[-1,Math.sign(wrapA(best-v.h))||1]}if(c.replan){c.replan=0;c.rpT=0}c.stuck=c.am==1&&c.amK==1?1:0;\n v.hitO=null;vehPhys(q,v,dt,r[0],r[1],true,false);")
R("let dh=wrapA(best-v.h),fx=1,sx=Math.max(-1,Math.min(1,-dh*2.4));if(c.nav&&c.nav[2]=='land'){fx=1;sx=Math.max(-1,Math.min(1,-dh*3))}if(Math.abs(dh)>1.9&&dist<14){fx=-.7;sx=-sx}if(!tv&&dist<6)fx=.45;if(tv&&dist<9&&Math.abs(tv.v)<3)fx=.5;\n if(c.rev>0){c.rev-=dt;fx=-1;sx=c.rsx}else if(Math.abs(v.v)<1&&c.t>2){c.stuck=(c.stuck||0)+dt;if(c.stuck>1.2){c.rev=1.1;c.rsx=Math.random()<.5?-1:1;c.stuck=.95}}else c.stuck=Math.max(0,(c.stuck||0)-dt);\n /* rubber band: far away he floors it */const top=dist>45?29:dist>25?25:q.heat>=70?24:21;{const K0=c.K0||VEHK.cop,f=K0.max/23;v.K=Object.assign({},K0,{max:top*f,acc:(dist>25?13:10)*K0.acc/10})}vehPhys(q,v,dt,fx,sx,true,false);","/* r605: the shared AI driver (dx601). Rubber band: far away he floors it */const top=dist>45?29:dist>25?25:q.heat>=70?24:21;{const K0=c.K0||VEHK.cop,f=K0.max/23;v.K=Object.assign({},K0,{max:top*f,acc:(dist>25?13:10)*K0.acc/10})}\n const dS=Math.hypot(tx-v.x,tz-v.z),rmp=!!(c.nav&&(c.nav[2]=='land'||(c.nav[2]=='ramp'&&dS<12)));let mx=v.K.max;if(!tv&&dist<6)mx=Math.min(mx,7);if(tv&&dist<9&&Math.abs(tv.v)<3)mx=Math.min(mx,8);\n let r=aiCtl(q,v,c,best,dS,dt,{max:mx,ramp:rmp,orbit:!(tv&&Math.abs(tv.v)>3)});if(c.rev>0){c.rev-=dt;r=[-1,Math.sign(wrapA(best-v.h))||1]}if(c.replan){c.replan=0;c.npT=0}c.stuck=c.am==1&&c.amK==1?1:0;\n vehPhys(q,v,dt,r[0],r[1],true,false);")
# r605: the route grid gets levels (mesa top, quarry floor) joined by their east-west roads (navXRamp in dx601)
R('for(const p of q.plates||[])if(Math.abs(p.y)>2)rng(p.x0,p.x1,p.z0,p.z1,k=>g[k]=1);','/* r605: raised and sunken areas are levels of their own (see navXRamp in dx601) */const PL=new Uint8Array(W*H);{let pli=0;for(const p of q.plates||[])if(Math.abs(p.y)>2){pli++;rng(p.x0,p.x1,p.z0,p.z1,k=>PL[k]=pli)}for(let j=1;j<H-1;j++)for(let i=1;i<W-1;i++){const k=j*W+i;if(PL[k]!==PL[k+1]||PL[k]!==PL[k-1]||PL[k]!==PL[k+W]||PL[k]!==PL[k-W])g[k]=1}}NAV.pl=PL;')
R('const links={};for(const r of q.ramps||[]){const zA=r.z0,',"const links={};for(const r of q.ramps||[]){if(r.ax=='x'){try{navXRamp(r,rng,g,links)}catch(e){}continue}const zA=r.z0,")
R('const n=nj*W+ni;if(g[n]||reach[n])continue;','const n=nj*W+ni;if(g[n]||reach[n]||PL[n]!==PL[k])continue;')
R('const n=nj*W+ni;if(g[n]||cl[n]===G)continue;','const n=nj*W+ni;if(g[n]||cl[n]===G||(NAV.pl&&NAV.pl[n]!==NAV.pl[k]))continue;')
R("out.push([L.ax,L.az,'ramp',L]);out.push([L.bx,L.bz,'land'])","out.push([L.ax,L.az,L.up?'up':'ramp',L]);out.push([L.bx,L.bz,'land'])")
R('function navLOS(x0,z0,x1,z1,gr){const g=gr||NAV.g,d=Math.hypot(x1-x0,z1-z0),n=Math.ceil(d/1.2);for(let i=1;i<=n;i++){const u=i/n,k=navCell(x0+(x1-x0)*u,z0+(z1-z0)*u);if(k<0||g[k])return false}return true}','function navLOS(x0,z0,x1,z1,gr){const g=gr||NAV.g,pl=NAV.pl,k0=navCell(x0,z0),l0=pl&&k0>=0?pl[k0]:0,d=Math.hypot(x1-x0,z1-z0),n=Math.ceil(d/1.2);for(let i=1;i<=n;i++){const u=i/n,k=navCell(x0+(x1-x0)*u,z0+(z1-z0)*u);if(k<0||g[k]||(pl&&pl[k]!==l0))return false}return true}')
# r606: speeds in km/h everywhere (docs/design/kmh.md). The Desert Bus trip keeps its miles.
R("Math.round(Math.abs(v.v)*2.237)+' mph'+(v.boostT","Math.round(Math.abs(v.v)*3.6)+' km/h'+(v.boostT")
R("Math.round(Math.abs(v.v)*2.237)+' mph'+(vehOnHwy(v)","Math.round(Math.abs(v.v)*3.6)+' km/h'+(vehOnHwy(v)")
R("Math.round(K.max*2.237)+' mph<br>","Math.round(K.max*3.6)+' km/h<br>")
R('mph=Math.round(Math.abs(v.v)*2.237);','mph=Math.round(Math.abs(v.v)*3.6);')
R("+mph+' mph · ⭐","+mph+' km/h · ⭐")
R("+mph+' mph · drive","+mph+' km/h · drive")
R('speed sign. 45 mph. It is a joke.','speed sign. 72 km/h. It is a joke.')
R('763 MPH · LAND SPEED RECORD','1228 KM/H · LAND SPEED RECORD')
R("(600+Math.random()*250|0)+' MPH!!","(970+Math.random()*400|0)+' KM/H!!")
R('DARK ARROW\\n763.0 MPH','DARK ARROW\\n1227.9 KM/H')
R('COMPOSITE ARMOUR · 85 MPH\\n','COMPOSITE ARMOUR · 137 KM/H\\n')
R('holds the lane at 45 mph all by itself','holds the lane at 72 km/h all by itself')
R('Top speed 45 mph.','Top speed 72 km/h.')
R('U-turns at 300 miles per hour.','U-turns at 480 km/h.')
R('Somebody went 763 miles per hour here.','Somebody went 1228 km/h here.')
R('the bus does 45 miles an hour?','the bus does 72 km/h?')
R('Speed limit is 45. I go 45. Ever.','Speed limit is 72. I go 72. Ever.')
_o,_n=('In a bus. In the desert. At 45 mph.','In a bus. In the desert. At 72 km/h.');assert s.count(_o)==2;s=s.replace(_o,_n)
# r606: the mining shack off the road (E to go in), Devil's Gorge real fall, one-way lift (dx602)
R("  {const SZ=-1062,pk=mineTexR('plank',3,2),","  {const gO=g,shG=new THREE.Group(),shI=new THREE.Group();shG.position.set(SHKP.cx,0,SHKP.sz);shG.rotation.y=SHKP.th;shI.position.z=-SHKP.sz;shG.add(shI);gO.add(shG);{const g=shI;const SZ=-1062,pk=mineTexR('plank',3,2),")
R('BUS.shack={SZ,HZ,cage,gate,lan,shL,D,eb}}','gO.add(eb);gO.add(ss);/* r606: a dirt path from the road to the door */{const d=shW(0,SZ+D/2+3.2),x0=-3.5,x1=d[0],pth=new THREE.Mesh(new THREE.PlaneGeometry(Math.abs(x1-x0),3),new THREE.MeshStandardMaterial({color:0x9a7a50,roughness:1}));pth.rotation.x=-Math.PI/2;pth.position.set((x0+x1)/2,.04,d[1]);gO.add(pth)}BUS.shack={SZ,HZ,cage,gate,lan,shL,D,eb}}}')
R('{const SZ=-1062,D=14,W=16;ob(-W/2-.3,-W/2+.3,SZ-D/2,SZ+D/2);ob(W/2-.3,W/2+.3,SZ-D/2,SZ+D/2);ob(-W/2,W/2,SZ-D/2-.3,SZ-D/2+.3);ob(-W/2,-1.5,SZ+D/2-.3,SZ+D/2+.3);ob(1.5,W/2,SZ+D/2-.3,SZ+D/2+.3);for(const x of[-W/2+.3,W/2-.3])ob(x-.25,x+.25,SZ+D/2+1.95,SZ+D/2+2.45);ob(4.0,4.6,-1043.8,-1043.2);ob(4.8,5.4,-1044.4,-1042.6)}','{const SZ=-1062,D=14,W=16,ob2=(x0,x1,z0,z1)=>{const r=shBox(x0,x1,z0,z1);ob(r[0],r[1],r[2],r[3])};ob2(-W/2-.3,-W/2+.3,SZ-D/2,SZ+D/2);ob2(W/2-.3,W/2+.3,SZ-D/2,SZ+D/2);ob2(-W/2,W/2,SZ-D/2-.3,SZ-D/2+.3);ob2(-W/2,-1.5,SZ+D/2-.3,SZ+D/2+.3);ob2(1.5,W/2,SZ+D/2-.3,SZ+D/2+.3);for(const x of[-W/2+.3,W/2-.3])ob2(x-.25,x+.25,SZ+D/2+1.95,SZ+D/2+2.45);ob(4.0,4.6,-1043.8,-1043.2);ob(4.8,5.4,-1044.4,-1042.6)}')
R("rect(-8,8,-1069,-1055,'#8a6a40')","rect(...shBox(-8,8,-1069,-1055),'#8a6a40');{const d=shW(0,-1062+7+3.2);rect(d[0],-3.5,d[1]-1.5,d[1]+1.5,'#9a7a50')}")
R("{nm:'Mining shack',x:0,z:-1062,ic:'⛏️'}","{nm:'Mining shack',x:SHKP.cx,z:-1062,ic:'⛏️'}")
R('if(W<3){const k=S2(W/3);P.x=q.wx0*(1-k);P.z=q.wz0+(zD-q.wz0)*k;P.yaw=q.wy0*(1-k);P.pitch=q.wp0*(1-k);','if(W<3){const k=S2(W/3),dp=shW(0,zD-OZ);P.x=q.wx0+(dp[0]-q.wx0)*k;P.z=q.wz0+(dp[1]+OZ-q.wz0)*k;P.yaw=q.wy0+wrapA(SHKP.th-q.wy0)*k;P.pitch=q.wp0*(1-k);')
R('else if(W<7){const k=S2((W-3)/4);P.x=0;P.z=zD+(zC-zD)*k;P.yaw=Math.sin(W*.6)*.3*(1-k);','else if(W<7){const k=S2((W-3)/4),wp=shW(0,zD+(zC-zD)*k-OZ);P.x=wp[0];P.z=wp[1]+OZ;P.yaw=SHKP.th+Math.sin(W*.6)*.3*(1-k);')
R('q.wt=7;P.x=0;P.z=zC;','q.wt=7;{const wp=shW(0,zC-OZ);P.x=wp[0];P.z=wp[1]+OZ}')
R('if(T3>=0&&T3<1.2){P.z=zC;','if(T3>=0&&T3<1.2){{const wp=shW(0,zC-OZ);P.x=wp[0];P.z=wp[1]+OZ}')
R('if(T3>=1.3){P.z=zC;','if(T3>=1.3){{const wp=shW(0,zC-OZ);P.x=wp[0];P.z=wp[1]+OZ}')
R('P.yaw=Math.sin(T3*.4)*.6;','P.yaw=SHKP.th+Math.sin(T3*.4)*.6;')
R('if(skip){P.x=0;P.z=zD;P.yaw=0;P.pitch=0;q.wt=3}','if(skip){const dp=shW(0,zD-OZ);P.x=dp[0];P.z=dp[1]+OZ;P.yaw=SHKP.th;P.pitch=0;q.wt=3}')
R('/* the shack doorway */const lz=P.z-OZ,zF=sh.SZ+sh.D/2;if(!q.seat&&!q.inBus&&!q.fling&&Math.abs(P.x)<1.4&&lz<zF+1.2&&lz>zF-2.5)busRoamEnd(q,false)}','/* the shack doorway: E to go in now (r606, dx602) */}')
R('const sh=q.sh;P.x=0;P.z=q.OZ+sh.SZ+sh.D/2+3.5;P.dy=0;P.yaw=0;','const sh=q.sh;{const wp=shW(0,sh.SZ+sh.D/2+3.5);P.x=wp[0];P.z=wp[1]+q.OZ}P.dy=0;P.yaw=SHKP.th-Math.PI;')
R('Walk into the shack again when you are ready.','Press E at the shack door when you are ready.')
R('Walk into the SHACK when you are ready.','Press E at the SHACK door when you are ready.')
R('P.roll=(P.roll||0)+dt*(f.soft?3:7)*(f.vx>0?1:-1);','if(!f.noRoll)P.roll=(P.roll||0)+dt*(f.soft?3:7)*(f.vx>0?1:-1);')
R("prop(lx+.4,lz+2.6,1.6,()=>q.lift?'':'[E] Ride the old lift DOWN (it goes a long way)',()=>liftGo(q,-1))","prop(lx+.4,lz+2.6,1.6,()=>q.lift?'':'⛔ LIFT GOES UP ONLY · NO RIDES DOWN',()=>{})")
# r607: gorge lift model, cave floor, Quarry Skip booster jump (dx603)
R("/* the cage lift: a shaft up to the surface, a cage that rides it, a headframe on top */const lx=GCV.lx,lz=GCV.lz;const TM=M(0x6a4a2a,{roughness:1}),IR=M(0x5a5a5a,{metalness:.6,roughness:.5});\n for(const[a,b]of[[-1.6,-1.6],[1.6,-1.6],[-1.6,1.6],[1.6,1.6]])A(BX(.25,D,.25),TM,lx+a,Y+D/2,lz+b);for(let y=Y+3;y<0;y+=4)for(const sd of[-1,1]){A(BX(3.4,.2,.2),TM,lx,y,lz+sd*1.6);A(BX(.2,.2,3.4),TM,lx+sd*1.6,y,lz)}\n const cage=new THREE.Group();cage.position.set(lx,Y,lz);g.add(cage);cage.userData.mv=1;{const fl=new THREE.Mesh(BX(2.6,.12,2.6),IR);fl.position.y=.06;cage.add(fl);const rf=new THREE.Mesh(BX(2.6,.1,2.6),IR);rf.position.y=2.5;cage.add(rf);for(const[a,b]of[[-1.25,-1.25],[1.25,-1.25],[-1.25,1.25],[1.25,1.25]]){const p=new THREE.Mesh(BX(.08,2.5,.08),IR);p.position.set(a,1.25,b);cage.add(p)}for(let i=0;i<7;i++){const bb=new THREE.Mesh(BX(.04,2.4,.04),IR);bb.position.set(-1.25+i*.4,1.2,-1.25);cage.add(bb);const bc=new THREE.Mesh(BX(.04,2.4,.04),IR);bc.position.set(-1.25,1.2,-1.25+i*.4);cage.add(bc);const bd=new THREE.Mesh(BX(.04,2.4,.04),IR);bd.position.set(1.25,1.2,-1.25+i*.4);cage.add(bd)}const lt=new THREE.Mesh(new THREE.SphereGeometry(.12,8,6),M(0xffe0a0,{emissive:0xffc060}));lt.position.y=2.35;cage.add(lt)}\n /* the headframe on the surface */for(const[a,b]of[[-1.8,-1.8],[1.8,-1.8],[-1.8,1.8],[1.8,1.8]]){A(BX(.3,6,.3),TM,lx+a,3,lz+b);X.ob(lx+a-.2,lx+a+.2,lz+b-.2,lz+b+.2)}A(BX(4,.3,.3),TM,lx,6,lz-1.8);A(BX(4,.3,.3),TM,lx,6,lz+1.8);A(BX(.3,.3,4),TM,lx-1.8,6,lz);A(BX(.3,.3,4),TM,lx+1.8,6,lz);const wh=A(new THREE.TorusGeometry(.9,.08,6,16),IR,lx,6.9,lz);wh.rotation.y=Math.PI/2;\n A(BX(3.4,.08,3.4),M(0x5a4a3a),lx,.04,lz);for(const sd of[-1,1])A(BX(3.6,.6,.12),TM,lx,.3,lz+sd*1.9);A(BX(.12,.6,3.6),TM,lx-1.9,.3,lz);\n const sg=lab('OLD GORGE MINE\\nLIFT · GOES DOWN',2.6,.9,'#4a2a12','#ffe0a0',60);sg.position.set(lx,4.2,lz+1.95);g.add(sg);loc('Old Gorge Mine',lx,lz,'⛏️');q.mapR.push({x0:lx-2,x1:lx+2,z0:lz-2,z1:lz+2,c:'#6a4a2a'});\n q.gcage={m:cage,x:lx,z:lz};\n prop(lx,lz,1.3,()=>q.lift?'':'[E] Ride the lift up to the surface',()=>liftGo(q,1)).deep=1;\n prop(lx+.4,lz+2.6,1.6,()=>q.lift?'':'⛔ LIFT GOES UP ONLY · NO RIDES DOWN',()=>{})","/* r607: the lift is the design chat's model (gorgeLiftBuild in dx603) */try{gorgeLiftBuild(X,GCV.lx,GCV.lz)}catch(e){conLog('error','gorge lift: '+e.message)}loc('Old Gorge Mine',GCV.lx,GCV.lz,'⛏️');q.mapR.push({x0:GCV.lx-2.2,x1:GCV.lx+2.2,z0:GCV.lz-2.2,z1:GCV.lz+2.2,c:'#6a4a2a'})")
R('A(BX(GCV.tx1-GCV.tx0,.2,GCV.cz1-z0+1),DRK,(GCV.tx0+GCV.tx1)/2,Y-.1,(z0+GCV.cz1)/2);A(BX(CW,.2,CD),DRK,cx,Y-.1,cz);','/* r607: floors run 0.3 m under the walls, the tunnel 1 m out into the riverbed (1 cm lower there), a rock slab under it all */A(BX(GCV.tx1-GCV.tx0+.6,.2,(z0+1)-(GCV.cz1-.3)),DRK,(GCV.tx0+GCV.tx1)/2,Y-.11,((z0+1)+(GCV.cz1-.3))/2);A(BX(CW+.6,.2,CD+.6),DRK,cx,Y-.1,cz);A(BX(CW+1.2+1.6,.6,(z0+1)-(GCV.cz0-1.4)),M(0x2a1e18,{roughness:1}),cx,Y-.32,((z0+1)+(GCV.cz0-1.4))/2);')
R('A(BX(CW+1.2,.6,CD+1.2),RKM,cx,Y+H+.3,cz);','{/* r607: the ceiling in four pieces round a 3.8 m hole for the lift shaft */const X0=GCV.cx0-.6,X1=GCV.cx1+.6,Z0=GCV.cz0-.6,Z1=GCV.cz1+.6,hx0=GCV.lx-1.9,hx1=GCV.lx+1.9,hz0=GCV.lz-1.9,hz1=GCV.lz+1.9,cb=(a,b,c,d)=>{if(b-a>.01&&d-c>.01)A(BX(b-a,.6,d-c),RKM,(a+b)/2,Y+H+.3,(c+d)/2)};cb(X0,X1,Z0,hz0);cb(X0,X1,hz1,Z1);cb(X0,hx0,hz0,hz1);cb(hx1,X1,hz0,hz1)}')
R('for(const o of obsNear(q,cx,cz))if(!o.off&&!o.ped&&cx>o.x0-v.r','for(const o of obsNear(q,cx,cz))if(!o.off&&!o.ped&&!(o.top!=null&&v.y>o.top-.3)&&!(v.qsFly&&v.air&&v.y>6)&&cx>o.x0-v.r')
R("ramp(-330,-1460,9,5,2.8,-1,'QUARRY SKIP');",'/* r607: QUARRY SKIP is the booster jump now (dx603) */')
R("if(r.ax=='x'){try{navXRamp(r,rng,g,links)}catch(e){}continue}","if(r.ax=='x'){try{navXRamp(r,rng,g,links)}catch(e){}continue}if(r.nolink){rng(r.x0-R,r.x1+R,Math.min(r.z0,r.z0+r.dir*r.len)-.5,Math.max(r.z0,r.z0+r.dir*r.len)+.5,k=>g[k]=1);continue}")
# r608: main menu and how to play (dx605)
# the old 2,000-word How to Play text goes: dx605 shows a short tabbed card instead (#how stays, empty, as the title-screen marker)
_a=s.index('<div id="how">');_b=s.index('<p id="swn"',_a);assert s.count('<div id="how">')==1 and _b-_a<20000;s=s[:_a]+'<div id="how"></div>\n'+s[_b:]
# r609: uplink and water delivery (dx606, dx607)
R("/* the uplink at Radar Station 13 */A(BX(1.2,1.1,.8),M(0x2a3038),447,.55,-694.5);const sc=A(BX(1.0,.6,.08),M(0x15181c),447,1.45,-694.85);const ul=glowSp(0x60a0ff,.8,.5);ul.position.set(447,1.45,-694.75);g.add(ul);A(new THREE.CylinderGeometry(.35,.35,.06,16),M(0xd8d8d8),447,1.2,-694.4).rotation.x=-.6;","/* the uplink at Radar Station 13: the r609 model (dx606) */try{upBuild(q)}catch(e){conLog('error','uplink: '+e.message)}")
R("q.props.push({x:447,z:-693.2,r:1.5,","q.props.push({x:447.5,z:-692.2,r:1.5,")
R(",{x0:446.4,x1:447.6,z0:-694.9,z1:-694.1});q.obsDirty=1}",");q.obsDirty=1}")
R("s.sg2?SJT.pack+3:28","s.sg2?(s.sg2.wEnd||SJT.pack+3):28")
# r611: new vehicle models (dx609)
# wheels roll by their own tyre size (userData.r), and the tank's tracks run while it moves near you
R("for(const w of m.userData.wheels||[]){if(w.tank)w.t.rotation.x-=v.v*dt/.34;else{w.t.rotation.x-=v.v*dt/(v.K.whr||.4);if(w.front)w.p.rotation.y=v.str*.45}}",
  "for(const w of m.userData.wheels||[]){if(w.tank)w.t.rotation.x-=v.v*dt/(w.t.userData.r||.34);else{w.t.rotation.x-=v.v*dt/(w.t.userData.r||v.K.whr||.4);if(w.front)w.p.rotation.y=v.str*(v.k=='bike'?.5:.45)}}if(m.userData.trkAdv&&Math.abs(v.v)>.05&&Math.hypot(P.x-v.x,P.z-(q.OZ||0)-v.z)<80)m.userData.trkAdv(v.v*dt);")
# the prison's vans: the new van model, turned round (it faces -z; the old one faced +z)
R("const v=mkVan(K,'INMATE TRANSPORT');v.position.set(cx0+8,0,cz0+5+i*7);v.rotation.y=Math.PI/2;",
  "const v=nvVan('INMATE TRANSPORT');v.position.set(cx0+8,0,cz0+5+i*7);v.rotation.y=Math.PI/2+Math.PI;")
# r613: jets' landing gear folds on hinges (gearSet) instead of shrinking (dx611)
R("if(u.gear){const up=v.air&&v.y-vehGround(q,v.x,v.z)>3;u.gear.scale.y+=((up?.02:1)-u.gear.scale.y)*Math.min(1,dt*3);u.gear.visible=u.gear.scale.y>.05}","if(u.gear){const up=v.air&&v.y-vehGround(q,v.x,v.z)>3;if(u.gearSet){v.gearF=v.gearF==null?(up?1:0):v.gearF;v.gearF+=((up?1:0)-v.gearF)*Math.min(1,dt*1.6);u.gearSet(v.gearF)}else{u.gear.scale.y+=((up?.02:1)-u.gear.scale.y)*Math.min(1,dt*3);u.gear.visible=u.gear.scale.y>.05}}")
# r615: the Desert Bus outside is busShell (dx613)
R('B(HW*2+.1,DBFH-.3,ZL+.1,0,(DBFH-.3)/2+.15,ZC,M(0x3a3a3a));\n for(const sd of[-1,1]){B(.36,.18,.05,sd*1.9,DBFH+.3,Z0-.14,hl);B(.36,.18,.05,sd*1.9,DBFH+.3,Z1+.14,tl)}B(HW*2+.2,.2,.15,0,.45,Z0-.16,M(0xc0c4c8,{metalness:.8}));B(HW*2+.2,.2,.15,0,.45,Z1+.16,M(0xc0c4c8,{metalness:.8}));','/* r615: body, lights, bumpers, wheels: busShell (dx613) */')
R('it.dsign={c:d,t:dp.material.map};const wheels=[];for(const z of[Z0+3,Z0+6.5,Z1-7,Z1-3.5])for(const sd of[-1,1]){/* a wheel arch over each tyre, outside the walls */B(.52,.08,1.36,sd*(HW+.33),1.07,z,M(0xd8701a));B(.06,.34,1.36,sd*(HW+.58),.92,z,M(0xd8701a));const pw=new THREE.Group();pw.position.set(sd*(HW+.33),.5,z);g.add(pw);const t=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,.4,16),dk);t.rotation.z=Math.PI/2;pw.add(t);const hb=new THREE.Mesh(new THREE.CylinderGeometry(.28,.28,.42,8),M(0xc0c4c8,{metalness:.8}));hb.rotation.z=Math.PI/2;pw.add(hb);wheels.push({p:pw,t,front:z<Z0+5})}','it.dsign={c:d,t:dp.material.map};const wheels=busShell(g,{HW,Z0,Z1,CH:it.CH,FH:DBFH});')
# r616: FORT BLACKOUT REWORK (dx614, docs/design/fort-blackout.md)
import os
if os.environ.get('DUMP'):open(os.environ['DUMP'],'w').write(s)
# r616 patches, part A: milBuild (the base itself)
# ground: the new parade square replaces the old painted plane and its lines (the firing line stays)
R(r'''const pg=AP(new THREE.PlaneGeometry(140,80),M(0x8a8478,{roughness:1}),490,.07,-840);pg.rotation.x=-Math.PI/2;for(const[w,d,x,z]of[[140,.3,490,-880],[140,.3,490,-800],[.3,80,420,-840],[.3,80,560,-840],[.3,72,520,-765]])A(BX(w,.012,d),WH,x,.08,z);''',
   r'''fbParade(g,480,553,-878,-812);A(BX(.3,.012,72),WH,520,.08,-765);''')
R(r'''rect(300,600,-725,-660,'#c2b092');rect(420,560,-880,-800,'#bfb39b');''',
   r'''rect(X0,600,-725,-660,'#c2b092');rect(480,553,-878,-812,'#bfb39b');''')
# the perimeter wall: same obstacles (plus the airside gap), the new wall runs drawn by fbWall
R(r'''const h=6,t=.8;W(X0,552,Z0-t/2,Z0+t/2,h);W(568,X1,Z0-t/2,Z0+t/2,h);W(X0,X1,Z1-t/2,Z1+t/2,h);W(X0-t/2,X0+t/2,Z0,Z1,h);W(X1-t/2,X1+t/2,Z0,Z1,h);''',
   r'''const h=6,t=.8;ob(X0,488,Z0-t/2,Z0+t/2);ob(495,552,Z0-t/2,Z0+t/2);ob(568,X1,Z0-t/2,Z0+t/2);ob(X0,X1,Z1-t/2,Z1+t/2);ob(X0-t/2,X0+t/2,Z0,Z1);ob(X1-t/2,X1+t/2,Z0,Z1);
  /* r616: the new wall runs; the long runs reach past the corners so the side runs can stop short (no doubled faces) */fbWall(g,'x',Z0,X0-.5,488,h);fbWall(g,'x',Z0,495,552,h);fbWall(g,'x',Z0,568,X1+.5,h);fbWall(g,'x',Z1,X0-.5,X1+.5,h);fbWall(g,'z',X0,Z0+.5,Z1-.5,h);fbWall(g,'z',X1,Z0+.5,Z1-.5,h);const FG=fbGate(g,560,Z0);''')
R(r'''const RZ=M(0xc0c4c8,{metalness:.9,roughness:.3});for(const[ax,c,a0,a1]of[['x',Z0,X0,552],['x',Z0,568,X1],['x',Z1,X0,X1],['z',X0,Z0,Z1],['z',X1,Z0,Z1]]){for(let u=a0;u<a1;u+=2.4){const r=A(new THREE.TorusGeometry(.35,.04,5,10),RZ,ax=='x'?u:c,h+.35,ax=='x'?c:u);r.rotation.y=ax=='x'?Math.PI/2:0}A(ax=='x'?BX(a1-a0-.1,.5,.9):BX(.9,.5,a1-a0-.1),M(0x3a3c40),ax=='x'?(a0+a1)/2:c,h-.2,ax=='x'?c:(a0+a1)/2)}''','')
R(r'''A(BX(18,1.2,1.2),CON2,560,6.6,Z0);LB('FORT BLACKOUT · HOME OF THE DARK ARMY · "WE DO NOT ASK TWICE"',16,1,'#20261c','#ffe0a0',560,6.6,Z0+.62,0);''','')
R(r'''W(gx-2,gx+2,Z0+1,Z0+5,3.4,CON2);A(BX(4.4,.25,4.4),DK,gx,3.55,Z0+3);A(BX(3.2,1,.05),M(0x203040,{emissive:0x081018}),gx,2.3,Z0+1.0-sd*0);A(BX(.05,1,3.2),M(0x203040,{emissive:0x081018}),gx-sd*2,2.3,Z0+3);''',
   r'''ob(gx-2,gx+2,Z0+1,Z0+5);''')
R(r'''A(CY(.12,.14,1.3,8),ST,552.5,.65,Z0+8);const arm=A(BX(15,.14,.14),M(0xf0f0f0),0,0,0);const ag=new THREE.Group();ag.position.set(552.5,1.25,Z0+8);g.add(ag);ag.add(arm);arm.position.x=7.5;for(let i=0;i<7;i++){const b=new THREE.Mesh(BX(1,.16,.16),RD);b.position.x=1+i*2;ag.add(b)}ML.arm=ag;''',
   r'''const ag=FG.arm;ag.userData.dpKeep=1;ML.arm=ag;''')
# flak towers: the new tower model, the one by Hut 3 moves east to 462
R(r'''for(const[x,z]of[[X0+6,Z0+6],[X1-6,Z0+6],[X0+6,Z1-6],[X1-6,Z1-6],[450,Z0+6],[450,Z1-6]]){for(const[a,b]of[[-2,-2],[2,-2],[-2,2],[2,2]])A(BX(.4,12,.4),CON2,x+a,6,z+b);for(const y of[4,8])for(const[a,b,c,d]of[[-2,-2,2,-2],[-2,2,2,2],[-2,-2,-2,2],[2,-2,2,2]])A(BX(Math.abs(c-a)||.15,.15,Math.abs(d-b)||.15),ST,(a+c)/2+x,y,(b+d)/2+z);A(BX(6,.4,6),CON,x,12.2,z);for(const sd of[-1,1]){A(BX(6,.9,.1),CON2,x,12.9,z+sd*2.95);A(BX(.1,.9,6),CON2,x+sd*2.95,12.9,z)}ob(x-2.2,x+2.2,z-2.2,z+2.2);''',
   r'''for(const[x,z]of[[X0+6,Z0+6],[X1-6,Z0+6],[X0+6,Z1-6],[X1-6,Z1-6],[462,Z0+6],[450,Z1-6]]){const FF=fbFlak(g,x,z);ob(x-2.2,x+2.2,z-2.2,z+2.2);''')
R(r'''const rl=A(new THREE.SphereGeometry(.2,8,6),M(0x400000,{emissive:0xff2020}),x,14.6,z);''',r'''const rl=FF.beacon;''')
# the west wall turrets follow the wall out to x 215
R(r'''[300,-700],[300,-780],[300,-860],[300,-910]''',r'''[X0,-700],[X0,-780],[X0,-860],[X0,-910]''')
# the recruiting office, the huts and the latrines get their new outsides (the name board replaces the old label)
R(r'''BLD(574,598,-918,-902,3.6,'w',-913,-911,CON,{lab:'RECRUITING OFFICE · ENLIST HERE'});''',
   r'''BLD(574,598,-918,-902,3.6,'w',-913,-911,CON,{});fbDress(g,{x0:574,x1:598,z0:-918,z1:-902,h:3.6,sd:'w',da:-913,db:-911,name:'RECRUITING OFFICE · ENLIST HERE'},'flat');''')
R(r'''BLD(a,b,-922,-902,3.4,'s',(a+b)/2-1,(a+b)/2+1,CON,{lab:'HUT '+(i+1)});''',
   r'''BLD(a,b,-922,-902,3.4,'s',(a+b)/2-1,(a+b)/2+1,CON,{});fbDress(g,{x0:a,x1:b,z0:-922,z1:-902,h:3.4,sd:'s',da:(a+b)/2-1,db:(a+b)/2+1,name:'HUT '+(i+1),num:i+1},'hut');''')
R(r'''BLD(466,482,-922,-910,3,'s',473,475,CON,{lab:'LATRINES'});''',
   r'''BLD(466,482,-922,-910,3,'s',473,475,CON,{});fbDress(g,{x0:466,x1:482,z0:-922,z1:-910,h:3,sd:'s',da:473,db:475,name:'LATRINES'},'flat');''')
# the old motor pool canopy moves east and becomes the new canopy; its vehicles move with it (same order: co-op ids)
R(r'''for(const[x,z]of[[492,-924],[538,-924],[492,-886],[538,-886]])A(BX(.4,4.6,.4),ST,x,2.3,z);A(BX(50,.2,40),M(0x3a4a3a),515,4.7,-905);LB('MOTOR POOL · CORPORALS AND UP · SIGN THE BOOK',10,.9,'#20261c','#e8f0d0',515,4.2,-885.1,0);''',
   r'''fbObs(q,fbCanopy(g,528,553,-925,-893).obs);''')
R(r'''for(let i=0;i<3;i++)mv('jeep',498+i*7,-900,Math.PI,2);mv('truck',524,-900,Math.PI,3);mv('truck',533,-900,Math.PI,3);mv('apc',530,-915,Math.PI/2,4);''',
   r'''for(let i=0;i<3;i++)mv('jeep',533+i*7.5,-919,Math.PI,2);mv('truck',535,-907,Math.PI,3);mv('truck',547,-907,Math.PI,3);mv('apc',541,-897,Math.PI,4);''')
# HQ: the dressing and the portico
R(r'''BLD(320,400,-880,-840,4.2,'e',-862,-858,CON,{lab:'HEADQUARTERS · DARK ARMY · 13TH ARMOURED',floor:M(0x5a5c58,{roughness:.9})});''',
   r'''BLD(320,400,-880,-840,4.2,'e',-862,-858,CON,{floor:M(0x5a5c58,{roughness:.9})});fbObs(q,fbHQ(g).obs);''')
# the parade ground: the flagpole and the podium move to the new square
R(r'''A(CY(.08,.1,12,8),ST2,490,6,-840);ob(489.8,490.2,-840.2,-839.8);const fg=new THREE.Group();fg.position.set(490,11.2,-840);g.add(fg);const fl=new THREE.Mesh(BX(2.4,1.5,.04),M(0x20242a));fl.position.set(1.2,0,0);fg.add(fl);const st=new THREE.Mesh(new THREE.CircleGeometry(.4,5),M(0xffd040));st.position.set(1.2,0,.03);fg.add(st);ML.flag=fg;anim(490,-840,300,dt=>{const o=ML.op;const want=o&&o.id=='flag'?2+o.n*1.15:11.2;fg.position.y+=(want-fg.position.y)*Math.min(1,dt*3);fl.rotation.y=Math.sin(q.rt*3)*.15;st.rotation.y=fl.rotation.y});''',
   r'''const FP=fbFlagpole(g,516,-872);ob(515.1,516.9,-872.9,-871.1);const fg=FP.flag;fg.userData.dpKeep=1;ML.flag=fg;anim(516,-872,300,dt=>{const o=ML.op;const want=o&&o.id=='flag'?2+o.n*1.15:11.2;fg.position.y+=(want-fg.position.y)*Math.min(1,dt*3);FP.wave(q.rt)});''')
R(r'''prop(490,-838.5,1.6,''',r'''prop(517.6,-870.4,1.6,''')
R(r'''A(BX(4,.6,2.4),CON2,490,.3,-862);A(BX(1.2,1,.3),M(0x4a3a2a),490,1.1,-861.2);ob(488,492,-863.2,-860.8);const s=mkSoldier(1);s.position.set(490,1.5,-862.4);s.rotation.y=Math.PI;g.add(s);''',
   r'''for(const o of fbPodium(g,516,-866,0).obs)ob(516+o.x0,516+o.x1,-866+o.z0,-866+o.z1);const s=mkSoldier(1);s.position.set(516,1.98,-866.4);s.rotation.y=Math.PI;g.add(s);''')
# inspection: the gate post was inside the new canopy
R(r'''for(const[x,z,i]of[[551,-911,0],[521,-890,1],''',r'''for(const[x,z,i]of[[556,-917,0],[521,-890,1],''')
R(r'''o.posts=[[556,-917,'the GATE'],[515,-905,'the MOTOR POOL'],''',r'''o.posts=[[556,-917,'the GATE'],[521,-890,'the MOTOR POOL'],''')
# X-13 trials: the first gate sat against the south wall in the restricted zone; it is on South Street now
R(r'''milBeacons(q,o,[[520,-666],[560,-735],''',r'''milBeacons(q,o,[[505,-735],[560,-735],''')
# r616 patches, part B: boot camp, depot, tank park, restricted zone, patrols, hangar inside
# boot camp: fbBootCamp draws the course; the plates, props, obstacles, the sign and the drill sergeant stay the game's
R(r'''T('boot camp',()=>{const z=-812;AP(new THREE.PlaneGeometry(94,26),M(0x8a7a60,{roughness:1}),364,.09,z).rotation.x=-Math.PI/2;sign(''',
   r'''T('boot camp',()=>{const z=-812;fbBootCamp(g);sign(''')
R(r'''A(CY(.08,.1,2.4,8),ST,322,1.2,-806);const sl=X.lab('START',1.2,.5,'#e8c020','#1a1a1a');sl.position.set(322,2.1,-806);g.add(sl);''','')
R(r'''{const WD=M(0x6a4a2a,{roughness:.9}),BW=M(0x6a6e74,{metalness:.8,roughness:.4}),zL=z-4,zR=z+4;for(let x=332;x<=346;x+=2){for(const zz of[zL,zR])A(BX(.16,1.5,.16),WD,x,.75,zz);A(BX(.1,.1,8.2),WD,x,1.2,z)}for(const zz of[zL,zR]){A(BX(14.2,.12,.1),WD,339,1.2,zz);A(BX(14.2,.1,.08),WD,339,.5,zz);ob(331.9,346.1,zz-.12,zz+.12)}''',
   r'''{const zL=z-4,zR=z+4;for(const zz of[zL,zR])ob(331.9,346.1,zz-.12,zz+.12)}''')
R(r'''for(let i=0;i<9;i++){const zz=zL+.5+i*.875;A(BX(14,.025,.025),BW,339,1.08,zz);for(let x=332.6;x<346;x+=.9){const b=A(BX(.12,.02,.02),BW,x,1.08,zz);b.rotation.y=.8}}for(let x=333;x<346;x+=2)A(BX(.025,.025,8),BW,x+1,1.08,z);for(let x=332.5;x<346;x+=1.6)for(const zz of[zL+.2,zR-.2]){const c=A(new THREE.TorusGeometry(.22,.025,4,10),BW,x,1.32,zz);c.rotation.y=Math.PI/2}''','')
R(r'''AP(new THREE.PlaneGeometry(14,8),M(0x4a3a28,{roughness:1}),339,.1,z).rotation.x=-Math.PI/2;''','')
R(r'''for(const zz of[zL-.6,zR+.6]){A(BX(.12,2.4,.12),WD,330.8,1.2,zz)}A(BX(.12,.5,9.4),WD,330.8,2.5,z);const ws=X.lab('↓ CRAWL UNDER THE WIRE · PRESS C TO CROUCH ↓',8.6,.5,'#5a2020','#ffe0a0');ws.position.set(330.72,2.5,z);ws.rotation.y=-Math.PI/2;g.add(ws);const we=X.lab('WIRE ENDS · ON TO THE TYRES →',3,.4,'#20302a','#e8f0d0');we.position.set(347.5,1.7,zR+.3);g.add(we)}''','')
R(r'''const t=A(new THREE.TorusGeometry(.5,.18,8,14),DK,x,.2,zz);t.rotation.x=Math.PI/2;q.plates.push({x0:x-.5''',r'''q.plates.push({x0:x-.5''')
R(r'''A(BX(1.2,2.9,12),M(0x7a6a4a),371.4,1.45,z);for(let i=0;i<5;i++)A(BX(.06,.06,11.5),ST2,370.75,.5+i*.52,z);''','')
R(r'''for(const[a,b,y]of st){q.plates.push({x0:a,x1:b,z0:z-6,z1:z+6,y});if(a>=374)A(BX(b-a,y,12),M(0x6a5a3a),(a+b)/2,y/2,z)}A(BX(2,.2,12),M(0x8a7a5a),373,2.85,z);const wl=X.lab('↑ THE WALL ↑',2,.4,'#5a2020','#ffe0a0');wl.position.set(371.4,3.4,z-6.1);g.add(wl);''',
   r'''for(const[a,b,y]of st){const nw=a<370.8;q.plates.push({x0:a,x1:b,z0:z-(nw?1.5:6),z1:z+(nw?1.5:6),y})}''')
R(r'''AP(new THREE.PlaneGeometry(22,8),M(0x4a3a28,{roughness:1}),389,.1,z).rotation.x=-Math.PI/2;q.plates.push({x0:378.8,x1:380,z0:z-1.5,z1:z+1.5,y:.5});A(BX(1.2,.5,3),M(0x6a5a3a),379.4,.25,z);A(BX(18.4,.12,.5),M(0x8a6a3a),389,.94,z);for(let x=381;x<398;x+=4)A(CY(.06,.06,.9,6),ST,x,.45,z);q.plates.push({x0:380,x1:398.4,z0:z-.25,z1:z+.25,y:1.0});A(BX(1.2,.5,3),M(0x6a5a3a),399,.25,z);q.plates.push({x0:398.4,x1:399.6,z0:z-1.5,z1:z+1.5,y:.5});const bl=X.lab('THE BEAM · DO NOT FALL IN','#5a2020'.length?2.6:2.6,.4,'#5a2020','#ffe0a0');bl.position.set(389,2.2,z-4.2);g.add(bl);''',
   r'''q.plates.push({x0:378.8,x1:380,z0:z-1.5,z1:z+1.5,y:.5});q.plates.push({x0:380,x1:398.4,z0:z-.25,z1:z+.25,y:1.0});q.plates.push({x0:398.4,x1:399.6,z0:z-1.5,z1:z+1.5,y:.5});''')
R(r'''A(CY(.06,.08,3,8),ST2,406,1.5,z-2);const ff=new THREE.Mesh(BX(1.2,.8,.03),M(0xc02020));ff.position.set(406.6,2.6,z-2);g.add(ff);const fl2=X.lab('FINISH · PUSH-UPS HERE',2.2,.4,'#e8c020','#1a1a1a');fl2.position.set(406,3.2,z-2.1);g.add(fl2);''','')
# the ammo bunker: dressed as a bunker, with obstacles for its earth mound (1.1 x its height out from three walls)
R(r'''BLD(320,350,-792,-772,3.2,'s',334,337,CON2,{lab:'AMMO BUNKER · NO SMOKING · NO RUNNING · NO DROPPING',roof:CON2});''',
   r'''BLD(320,350,-792,-772,3.2,'s',334,337,CON2,{roof:CON2});fbDress(g,{x0:320,x1:350,z0:-792,z1:-772,h:3.2,sd:'s',da:334,db:337,name:'AMMO BUNKER · NO SMOKING · NO RUNNING · NO DROPPING'},'bunker');{const e=3.2*1.1;ob(320-e,320,-792-e,-772);ob(350,350+e,-792-e,-772);ob(320,350,-792-e,-792)}''')
R(r'''for(let i=0;i<3;i++){const x=372+i*11;A(CY(4,4,5,20),M(0x8a8a80,{metalness:.4}),x,2.5,-782);A(CY(4.2,4.2,.3,20),DK,x,5.1,-782);A(BX(1.2,1.2,.08),M(0xe8c020),x,2.2,-777.9);ob(x-4,x+4,-786,-778)}''',
   r'''for(let i=0;i<3;i++){const x=372+i*11;ob(x-4,x+4,-786,-778)}fbObs(q,fbFuelDepot(g).obs);''')
# the gun pit moves 10 m north, off South Street
R(r'''for(let i=0;i<10;i++){const a=i/10*Math.PI*2;A(BX(1,.4,.6),SB,400+Math.cos(a)*3,.2,-740+Math.sin(a)*3).rotation.y=-a}for(let i=0;i<8;i++){const a=i/8*Math.PI*2+.2;A(BX(1,.4,.6),SB,400+Math.cos(a)*3,.6,-740+Math.sin(a)*3).rotation.y=-a}mkTurret(400,-740,0,'g');prop(400,-736,2.6,''',
   r'''for(let i=0;i<10;i++){const a=i/10*Math.PI*2;A(BX(1,.4,.6),SB,400+Math.cos(a)*3,.2,-750+Math.sin(a)*3).rotation.y=-a}for(let i=0;i<8;i++){const a=i/8*Math.PI*2+.2;A(BX(1,.4,.6),SB,400+Math.cos(a)*3,.6,-750+Math.sin(a)*3).rotation.y=-a}mkTurret(400,-750,0,'g');prop(400,-746,2.6,''')
# the tank park: canopies replace the label and the bollards; the berm is earth now
R(r'''LB('TANK PARK · 13TH ARMOURED · SERGEANTS AND UP',8,.9,'#20261c','#e8f0d0',470,3.2,-800.27,Math.PI);A(BX(8.3,1.15,.12),M(0x2a3020),470,3.2,-800.15);for(const sx of[465.6,474.4])A(CY(.08,.1,3.75,8),M(0x4a4e54,{metalness:.6}),sx,1.87,-800.12);''',
   r'''fbObs(q,fbTankPark(g).obs);''')
R(r'''for(let i=0;i<4;i++)A(BX(.6,.9,.6),CON2,432+i*20,.45,-780);''','')
R(r'''A(BX(6,3,70),M(0x9a8a60,{roughness:1}),595,1.2,-765).scale.y=1;ob(592,598,-800,-730);''',r'''fbRange(g);ob(592,598,-800,-730);''')
# patrol tanks: one round the parade ground on the roads, one up and down South Street (the restricted zone one stays)
R(r'''const loops=[[[421,-869.5],[586,-869.5],[586,-737],[421,-737]],[[312,-892],[412,-892],[412,-733],[312,-733]],''',
   r'''const loops=[[[475,-885],[556,-885],[556,-805],[475,-805]],[[335,-735],[552,-735]],''')
# Hangar 1: the cladding and barrel roof; the programme sign sits on the cladding now
R(r'''LB('X-13 WRAITH PROGRAMME · HANGAR 1 · COLONELS ONLY · ALL OTHERS WILL BE SHOT',14,1.2,'#101418','#40c0ff',425.05,8.05,-694,Math.PI/2);''',
   r'''fbHangarSkin(g);LB('X-13 WRAITH PROGRAMME · HANGAR 1 · COLONELS ONLY · ALL OTHERS WILL BE SHOT',14,1.2,'#101418','#40c0ff',425.12,8.25,-694,Math.PI/2);''')
# the simple tool carts were built twice (the interiors add better ones), and one stood in the spares rack
R(r'''for(const[x,z]of[[350,-712],[400,-712],[350,-676]]){A(BX(1.2,.9,.7),RD,x,.45,z);A(BX(1.3,.05,.8),ST2,x,.92,z);ob(x-.6,x+.6,z-.35,z+.35)}''','')
# launch control: a bunker with an earth mound; the guards stand either side of the door
R(r'''BLD(BX0,BX1,BZ0,BZ1,4,'n',540,543,CON2,{lab:'LAUNCH CONTROL · AUTHORISED PERSONNEL · TWO-MAN RULE IN FORCE',floor:M(0x4a4c50,{roughness:.8})});for(const sd of[-1,1]){const s=mkSoldier(0);s.position.set(541.5+sd*2.6,.9,-684.5);s.rotation.y=Math.PI;g.add(s)}''',
   r'''BLD(BX0,BX1,BZ0,BZ1,4,'n',540,543,CON2,{floor:M(0x4a4c50,{roughness:.8})});fbDress(g,{x0:BX0,x1:BX1,z0:BZ0,z1:BZ1,h:4,sd:'n',da:540,db:543,name:'LAUNCH CONTROL · TWO-MAN RULE'},'bunker');{const e=4*1.1;ob(BX0-e,BX0,BZ0,BZ1+e);ob(BX1,BX1+e,BZ0,BZ1+e);ob(BX0,BX1,BZ1,BZ1+e)}for(const sx of[537,546]){const s=mkSoldier(0);s.position.set(sx,.9,-719.5);s.rotation.y=0;g.add(s)}''')
# Silo 1: the new collar and the round hatch (the game still slides the stand-in hatch)
R(r'''const SX=578,SZ=-700;A(CY(6,6.4,1.2,24),CON2,SX,.6,SZ);A(CY(4.6,4.6,.3,24),DK,SX,1.25,SZ);const hatch=A(BX(9.4,.5,9.4),M(0x5a5e64,{metalness:.5}),SX,1.45,SZ);for(const sd of[-1,1])A(BX(9.4,.08,.3),YL,SX,1.72,SZ+sd*4.5);''',
   r'''const SX=578,SZ=-700;const FS=fbSilo(g),hatch=FS.hatch;''')
R(r'''ob(SX-6.5,SX+6.5,SZ-6.5,SZ+6.5);''',r'''ob(570.8,585.2,-707.2,-692.8);''')
R(r'''for(let i=0;i<4;i++){const a=i/4*Math.PI*2+.4;A(BX(.3,2.5,.3),ST,SX+Math.cos(a)*8,1.25,SZ+Math.sin(a)*8);A(BX(.5,.4,.5),M(0x400000,{emissive:0xff2020}),SX+Math.cos(a)*8,2.7,SZ+Math.sin(a)*8)}''','')
# foot patrols: round the parade ground, along North Street, inside the airfield fence
R(r'''const paths=[[[330,-895],[460,-895],[460,-870],[330,-870]],[[430,-740],[590,-740],[590,-810],[430,-810]],[[310,-830],[310,-740]]];''',
   r'''const paths=[[[478,-880],[555,-880],[555,-810],[478,-810]],[[230,-890],[550,-890]],[[220,-999],[595,-999],[595,-933],[220,-933]]];''')
# the maintenance tank was standing on the refit pad: it moves to the east end of the vehicle bay
R(r'''hull.position.set(342,.45,-692);''',r'''hull.position.set(395,.45,-700);''')
R(r'''A(BX(.5,.45,.5),M(0xe8c020),342+dx,.22+FL,-692+dz);ob(339,345,-694,-690);''',r'''A(BX(.5,.45,.5),M(0xe8c020),395+dx,.22+FL,-700+dz);ob(392,398,-702,-698);''')
R(r'''for(const[x,z,ry]of[[340,-689.2,0],[345.5,-692,Math.PI/2]]){const m=mkSoldier(0);''',r'''for(const[x,z,ry]of[[393,-697.2,0],[398.5,-700,Math.PI/2]]){const m=mkSoldier(0);''')
R(r'''A(BX(.5,.3,.3),RD,338.5,.15+FL,-689.5);A(CY(.04,.04,.9,6),ST2,338.5,.65+FL,-689.5).rotation.z=.5;''',r'''A(BX(.5,.3,.3),RD,391.5,.15+FL,-697.5);A(CY(.04,.04,.9,6),ST2,391.5,.65+FL,-697.5).rotation.z=.5;''')
# r616 patches, part C: the fort extras (dpMil)
# LZ Bravo: the new pad (fbLZ) replaces the old pad, ring, painted H and lights, and the mortar pits' sandbag rings
R(r'''const pad=A(new THREE.CircleGeometry(10,36),new THREE.MeshStandardMaterial({color:0x5a5c58,roughness:1,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}),hx,.09,hz);pad.rotation.x=-Math.PI/2;''',r'''fbLZ(g);''')
R(r'''const ring=A(new THREE.RingGeometry(8.6,9.3,36),new THREE.MeshStandardMaterial({color:0xf0ece0,roughness:1,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),hx,.1,hz);ring.rotation.x=-Math.PI/2;paint(1,5,hx-2,hz,0xf0ece0,0,.1);paint(1,5,hx+2,hz,0xf0ece0,0,.1);paint(3,1,hx,hz,0xf0ece0,0,.1);
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2;A(BX(.3,.2,.3),M(0x301000,{emissive:0xff8020}),hx+Math.cos(a)*9.8,.12,hz+Math.sin(a)*9.8)}''','')
R(r'''for(let k=0;k<12;k++){const a=k/12*Math.PI*2;A(BX(1,.4,.6),SB,mx+Math.cos(a)*2.6,.2,mz+Math.sin(a)*2.6).rotation.y=-a}for(let k=0;k<8;k++){const a=k/8*Math.PI*2+.3;A(BX(1,.4,.6),SB,mx+Math.cos(a)*2.6,.6,mz+Math.sin(a)*2.6).rotation.y=-a}''','')
# the mess hall's new outside
R(r'''bld(x0,x1,z0,z1,h,'w',-894.5,-891.5,CON,{lab:'MESS HALL · TODAY: STEW · TOMORROW: STEW · SUNDAY: BIG STEW',lfs:40,roof:CON2,''',
   r'''fbDress(g,{x0,x1,z0,z1,h,sd:'w',da:-894.5,db:-891.5,name:'MESS HALL · TODAY: STEW'},'flat');bld(x0,x1,z0,z1,h,'w',-894.5,-891.5,CON,{roof:CON2,''')
# the parade: the formation, the sergeant, the spectators and the bleachers move to the new square; new floodlight masts
R(r'''{const cx=486,cz=-856;const men=[];''',r'''{const cx=516,cz=-854;const men=[];''')
R(r'''paint(26,.15,cx,cz-1.5,0xf0ece0,0,.1);paint(26,.15,cx,cz+7.5,0xf0ece0,0,.1);''','')
R(r'''for(let r=0;r<3;r++){A(BX(.6,.08,20),M(0x8a8a90,{metalness:.4}),540+r*1,.45+r*.4,-856);A(BX(.6,.08,20),M(0x8a8a90,{metalness:.4}),540.5+r*1,.45+r*.4,-856);A(BX(.1,.45+r*.4,20),DK,540.3+r*1,.22+r*.2,-856)}ob(539.5,543.2,-866,-846);''',
   r'''fbBleachers(g,482,485.7,-862,-842,'e');ob(482,485.7,-862,-842);''')
R(r'''for(const[r,z]of[[0,-863],[1,-860.5],[2,-857],[0,-854],[1,-851.5],[2,-849],[1,-864.5],[0,-848.5]]){const x=540.25+r,s=soldier(x,z,0);s.position.y=.9+.49+r*.4;s.rotation.y=Math.atan2(-(486-x),-(-853-z));''',
   r'''for(const[r,z]of[[0,-859],[1,-856.5],[2,-853],[0,-850],[1,-847.5],[2,-845],[1,-860.5],[0,-844.5]]){const x=485.1-r*1.15,s=soldier(x,z,0);s.position.y=.9+.48+r*.45;s.rotation.y=Math.atan2(-(516-x),-(-852-z));''')
R(r'''anim(541,-856,90,dt=>{const t=q.rt||0;SP.forEach(''',r'''anim(484,-852,90,dt=>{const t=q.rt||0;SP.forEach(''')
R(r'''lab('SPECTATORS · CLAP WHEN TOLD',3,.4,'#20261c','#e8f0d0',541.5,1.9,-845.5,0,44);''',r'''lab('SPECTATORS · CLAP WHEN TOLD',3,.4,'#20261c','#e8f0d0',483.9,1.9,-841.4,0,44);''')
R(r'''for(const[x,z]of[[424,-878],[556,-878],[424,-802],[556,-802]]){A(CY(.12,.16,14,8),ST,x,7,z);for(let i=0;i<4;i++){const a=i*Math.PI/2;A(BX(.5,.3,.3),DK,x+Math.cos(a)*.5,13.6,z+Math.sin(a)*.5)}A(BX(.3,.3,.3),M(0xfff0c0,{emissive:0xfff0c0}),x,13.3,z);const lt=glowSp(0xfff4c0,.7,2.2);lt.position.set(x,13.3,z);g.add(lt);ob(x-.2,x+.2,z-.2,z+.2)}''',
   r'''for(const[x,z,ry]of[[482,-876,-.75*Math.PI],[551,-876,.75*Math.PI],[482,-814,-.25*Math.PI],[551,-814,.25*Math.PI]]){fbFloodMast(g,x,z,ry);ob(x-.5,x+.5,z-.5,z+.5)}''')
# tents
R(r'''const t=mkTent(K,6,4.4);t.position.set(x,0,z);g.add(t);ob(x-3,x+3,z-2.2,z+2.2);''',r'''fbTent(g,x,z);ob(x-3,x+3,z-2.2,z+2.2);''')
# the old motor pool workshop corner stood where the squad motor pool is now (the canopy has its own workshop)
R(r'''/* ---- the motor pool workshop corner ---- */{const wx=496,wz=-916;''',r'''/* ---- the motor pool workshop corner (r616: gone, the new canopy has the workshop) ---- */if(0){const wx=496,wz=-916;''')
# Radar Station 13: the new drum and radome; the plaque moves to the porch
R(r'''A(CY(4.2,4.4,3,24),CON2,rx,1.5,rz);A(new THREE.SphereGeometry(4.4,14,10),M(0xf0f0ec,{roughness:.9}),rx,6.2,rz);for(let i=0;i<3;i++)A(BX(.6,.5,.6),M(0x6a6a70,{metalness:.5}),rx-3.4+i*1.2,3.3,rz+3.2);A(BX(1.2,2.2,.1),DK,rx,1.1,rz+4.42);''',r'''fbRadome(g);''')
R(r'''lab('RADAR STATION 13 · WE CAN SEE YOU · WE CAN SEE YOU READING THIS',7,.6,'#20261c','#e8f0d0',rx,3.4,rz+4.45,0,40);prop(rx,rz+5.6,2,''',r'''prop(rx,rz+5.9,2,''')
# the dragon's teeth move out to the new outer checkpoint (built by dx614); the warning sign moves out too
R(r'''{for(const sd of[-1,1])for(let i=0;i<14;i++){const x=560+sd*(7+i*3.2),z=-939;for(const zz of[z,z+2.6]){const t=A(new THREE.ConeGeometry(.75,1.1,4),CON2,x+(zz==z?0:1.6),.55,zz);t.rotation.y=Math.PI/4}}
  sign('CHECKPOINT AHEAD · SLOW · HAVE ID READY\n(TANKS: ALSO HAVE ID READY)','#5a2020',569,-985,Math.PI+.2,'#ffe0a0');''',
   r'''{sign('CHECKPOINT AHEAD · SLOW · HAVE ID READY\n(TANKS: ALSO HAVE ID READY)','#5a2020',569,-1030,Math.PI+.2,'#ffe0a0');''')
# the firing line sign stood on the new Parade Road
R("sign('FIRING LINE · FIRE EAST ONLY · TARGETS ON THE BERM','#5a2020',520,-803,0,'#ffe0a0');","sign('FIRING LINE · FIRE EAST ONLY · TARGETS ON THE BERM','#5a2020',520,-799,0,'#ffe0a0');")
# r616 end
# r618: ground layers: the depth nudge is worked out from the material's ORIGINAL nudge, so materials shared by layers at
# different heights (cloned one after another) no longer pile nudges on top of each other (Fort Blackout roads had -18)
R("const f0=m.polygonOffset?m.polygonOffsetFactor:0,u0=m.polygonOffset?m.polygonOffsetUnits:0;m.polygonOffset=true;m.polygonOffsetFactor=f0-1;m.polygonOffsetUnits=u0+u;m.userData=Object.assign({},m.userData,{gl:u});","const b0=m.userData.gl0||[m.polygonOffset?m.polygonOffsetFactor:0,m.polygonOffset?m.polygonOffsetUnits:0],f0=b0[0],u0=b0[1];m.polygonOffset=true;m.polygonOffsetFactor=f0-1;m.polygonOffsetUnits=u0+u;m.userData=Object.assign({},m.userData,{gl:u,gl0:b0});")
R(" /* which bits of the town can a car actually get to (from the main road)? */const reach=new Uint8Array(W*H);"," /* r618: extra straight-line links (dx615) */if(typeof navExtraLinks=='function')try{navExtraLinks(g,links)}catch(e){}\n /* which bits of the town can a car actually get to (from the main road)? */const reach=new Uint8Array(W*H);")
# r618: the route grid gives plates at the same height one level (the Old Quarry's floor and its haul-road lane were walled apart)
R("let pli=0;for(const p of q.plates||[])if(Math.abs(p.y)>2){pli++;rng(p.x0,p.x1,p.z0,p.z1,k=>PL[k]=pli)}","const LVY=new Map();for(const p of q.plates||[])if(Math.abs(p.y)>2){const yk=Math.round(p.y);if(!LVY.has(yk))LVY.set(yk,LVY.size+1);const li=LVY.get(yk);rng(p.x0,p.x1,p.z0,p.z1,k=>PL[k]=li)}")

# r604: ONE FONT EVERYWHERE. Barlow Semi Condensed (SIL Open Font License, src/fonts/) replaces Georgia, Arial, Impact,
# serif and sans-serif in all CSS and canvas text. Kept on purpose: monospace terminals and readouts, the retro
# Windows windows (Tahoma) and the Comic Sans jokes. The font is built into the page (works offline) and registered
# before any game code runs, so signs drawn at load time already use it.
FONTF='DoorsSans,Arial,sans-serif'
_fre=re.compile(r'Tahoma,"MS Sans Serif",Arial,sans-serif|Tahoma,"MS Sans Serif",Arial|Tahoma,Arial,sans-serif|Tahoma,Arial'
 r'|"Arial Black",Impact,sans-serif|Impact, Arial Black, sans-serif|Impact, Arial|Georgia, ?serif|Georgia|Arial,sans-serif|Arial'
 r'|(?<=px )sans-serif|(?<=px )serif\b')
_fn=[0]
def _frep(m):
    t=m.group(0)
    if t.startswith('Tahoma'):return t
    _fn[0]+=1;return FONTF
_parts=re.split(r'(<script id="[A-Za-z0-9_]+" type="text/plain">[^<]*</script>)',s)
s=''.join(x if x.startswith('<script id=') else _fre.sub(_frep,x) for x in _parts)
# r620: Goblino's Scrap rework (dx616): the monster truck spawns on its pad, the rummage pile is in scrap bay 3
R("add('monster',150,-1312,Math.PI/2)","add('monster',165,-1312,0)")
R("T('scrap pile',()=>{const px=100,pz=-1312;for(let i=0;i<22;i++){const a=i*2.4,d=R()*3.2,geo=i%3==0?new THREE.DodecahedronGeometry(.4+R()*.5,0):BX(.5+R()*1.2,.2+R()*.5,.4+R()*.8),o=A(geo,M([0x6a6a6a,0x8a4a2a,0x4a4a50,0xa06030,0x3a3a3a][i%5],{metalness:.5,roughness:.7}),px+Math.cos(a)*d,.2+R()*1.2*(1-d/3.6),pz+Math.sin(a)*d);o.rotation.set(R()*3,R()*3,R()*3)}ob(px-3.2,px+3.2,pz-3.2,pz+3.2);const sl=lab('SCRAP · DIG IN\\n(NO REFUNDS)',1.6,.6,'#8a4a2a','#ffe0a0',50);sl.position.set(px,1.6,pz+3.4);g.add(sl);","T('scrap pile',()=>{const px=SYR.rummage[0],pz=SYR.rummage[1]-4;")
R("const hm=mkHeli()","const hm=mkPoliceHeli();hm.userData.mr.userData.dpKeep=1;hm.userData.tr.userData.dpKeep=1")
# r620: Fort Blackout's roads are drawn by fbRoad (dx614): xpRoadsBuild paints them on the map but lays no old strip or junction patch under them
R('for(const[x0,x1,z0,z1]of ps){if(x1-x0<.05||z1-z0<.05)continue;const t=(r.dirt?TD:TA)','for(const[x0,x1,z0,z1]of ps){if(x1-x0<.05||z1-z0<.05)continue;if(r.fb)continue;const t=(r.dirt?TD:TA)')
R('const R2=q.xroads.filter(r=>!r.dirt);','const R2=q.xroads.filter(r=>!r.dirt&&!r.fb);')
# r621: the Dark Zone 51 entrance sign faced away from the road
R("AUTHORISED DARK PERSONNEL ONLY','#1a1a2a',x1+5,-1864,-1.3)","AUTHORISED DARK PERSONNEL ONLY','#1a1a2a',x1+5,-1864,-1.3+Math.PI)")
# r623: the airfield and Dark Zone 51 (dx617): the plane on its stand, the new abduction
R("add('plane',300,-1250,-Math.PI/2)","add('plane',345,-1257,-Math.PI/2)")
R("/* the saucer */if(q.abd){const a=q.abd;a.t+=dt;if(a.t<2.4){P.dy=a.t*a.t*5;P.yaw+=dt*2.5;if(Math.random()<dt*8)snd(300+a.t*400,.05)}else{const L=(q.locs||[]).filter(l=>!/Dark Zone|Hangar|Gorge|Stunt|Railroad/.test(l.nm));const l=L[Math.random()*L.length|0]||{x:4,z:-1040,nm:'the bus stop'};P.x=l.x+4;P.z=q.OZ+l.z+4;q.fling={vx:0,vz:0,vy:0,y:26,t:0,soft:1};q.safe={x:P.x,z:l.z+4};q.abd=null;try{bsF.style.transition='none';bsF.style.background='#fff';bsF.style.opacity=1;setTimeout(()=>{bsF.style.transition='opacity 1.5s';bsF.style.opacity=0;setTimeout(()=>bsF.style.background='#000',1600)},150)}catch(e){}snd(1500,.3);hint('👽 ...and then they let go. Over '+l.nm+'. From quite high up.');try{badge('ufo')}catch(e){}}}","/* the saucer (r623: dx617) */if(q.abd){try{zfAbdTick(q,dt)}catch(e){conLog('error','abduction: '+e.message);q.abd=null}}")
# r626: the Desert PD rework (dx619): the cell block moved by (-2.7, -2.0), the court is in the courthouse
R("const x=pd.x,zb=pd.zb,zc=pd.zc,J=()=>q.jail","const x=pd.x-2.7,zb=pd.zb,zc=pd.zc,J=()=>q.jail")
R("lx>pd.x-1.5&&lx<pd.x-.5","lx>pd.cdx-.5&&lx<pd.cdx+.5")
R("inLobby=lz>pd.zp,skLobby=pt.z>pd.zp,skCourt=!skLobby&&pt.x>pd.x+1.7,plCourt=!inLobby&&lx>pd.x+1.7,los=(inLobby===skLobby&&skCourt===plCourt)||(Math.abs(lx-(pd.x-1))<.6&&Math.abs(pt.x-(pd.x-1))<4);","pdRg=(x,z)=>z>pd.zp?(x<78?'office':x>90?'break':'lobby'):(x>92?'records':'cells'),los=pdRg(lx,lz)===pdRg(pt.x,pt.z)||(Math.abs(lx-pd.cdx)<.6&&Math.abs(pt.x-pd.cdx)<4);")
R("if(C.out=='acq'){gold+=C.fine|0;try{saveGame()}catch(e){}P.x=DPD.X-2;P.z=DPD.Z+5.5+q.OZ;P.dy=0;P.roll=0;P.yaw=Math.PI;","if(C.out=='acq'){gold+=C.fine|0;try{saveGame()}catch(e){}P.x=50;P.z=-1014.5+q.OZ;P.dy=0;P.roll=0;P.yaw=Math.PI;")
R("P.x>pd.x-8&&P.x<pd.x+8","P.x>(pd.x0||pd.x-8)&&P.x<(pd.x1||pd.x+8)")
R("road(88,-1016.4,88,-993.5)","road(88,-1013.3,88,-993.5)")
R("[82,-1014],[83.2,-1014.5]","[60.5,-1029],[61.7,-1029.4]")
# r628: the prison yard extras (dpPen) are a local function of the r500 block: its batch 6 remodel replaces the base text in place
if not os.environ.get('PEN_BASE'):  # PEN_BASE=1 keeps the game's own dpPen, so tools/pen_gen.py can read it
    _i=s.index('function dpPen(q,g){');_j=s.index('\n/* ======================= FORT BLACKOUT: a helipad',_i);s=s[:_i]+open(S+'dx620dp.js').read()+s[_j:]
# r629: desert performance step 1 (dx621): the batching watchdog and the sprite culler get fresh positions for anything the per-frame update skipped
R("while(p&&p!==rec.root){if(!p.visible)return 1;p=p.parent}if(!p)return 1;","while(p&&p!==rec.root){if(!p.visible)return 1;p=p.parent}if(!p)return 1;if(typeof mwFresh==='function')mwFresh(o);")
R("const s=L[i];if(!s.parent){L.splice(i,1);continue}const e=s.matrixWorld.elements","const s=L[i];if(!s.parent){L.splice(i,1);continue}if(typeof mwFresh==='function')mwFresh(s);const e=s.matrixWorld.elements")
# r636: a shattered or blown-apart vehicle's debris is made from its original pieces only, not from its batches as
# well (a batch and its own pieces both flew off: the same part twice)
R("v.m.traverse(o=>{if(!o.isMesh||!o.geometry||!o.visible)return;const mt=o.material;if(!mt||mt.isSpriteMaterial","v.m.traverse(o=>{if(!o.isMesh||!o.geometry||!o.visible||o.userData.dpMerged)return;const mt=o.material;if(!mt||mt.isSpriteMaterial")
R("v.m.traverse(o=>{if(!o.isMesh||!o.geometry||!o.visible||o.isInstancedMesh)return;","v.m.traverse(o=>{if(!o.isMesh||!o.geometry||!o.visible||o.isInstancedMesh||o.userData.dpMerged)return;")
# r637: car-against-car checks skip a vehicle that is surely out of reach before measuring (dx625; same order, same results)
R("for(const w of vehAll(q)){if(w===v||vehOnHwy(w))continue;const dn=vehSegD(w,cx,cz);","for(const w of vehAll(q)){if(w===v||vehOnHwy(w))continue;if(VCG&&VCG.on&&!vcgNear(w,cx,cz,v.r))continue;const dn=vehSegD(w,cx,cz);")
R("function vehHit(q,x,lz,r){for(const w of vehAll(q))if(vehSegD(w,x,lz)<w.r+r)return true;return false}","function vehHit(q,x,lz,r){for(const w of vehAll(q))if((!(VCG&&VCG.on)||vcgNear(w,x,lz,r))&&vehSegD(w,x,lz)<w.r+r)return true;return false}")
# r638: the meteor crater (and its five fragments) moves 35 m north, off the Desert PD's impound lot (meteor-crater.md)
_o,_n='const kx=140,kz=-1005','const kx=140,kz=-970'; assert s.count(_o)==2,s.count(_o); s=s.replace(_o,_n)
_o,_n='X(140),Y(-1005)','X(140),Y(-970)'; assert s.count(_o)==2,s.count(_o); s=s.replace(_o,_n)
# crash-site.md: the plane crash site rebuilt from the design chat's model (csWreck, dx626). Same spot (-38, -1165).
# 1. desertLocs: the old fuselage, nose, windows, wing, tail, debris, their obstacles, map box and black box mesh
#    are replaced by the model; its obstacles and map rectangles are added at the site. The old debris used 50
#    numbers from the desert's seeded random; we still draw them so everything built after it stays where it was.
#    The black box prompt (same text, 25 gold) moves to the box beside the tail section.
_a=s.index('const fu=new THREE.Group();fu.position.set(px,1.3,pz)');_e='let got=0;const bb=A(BX(.4,.3,.5),M(0xff7a20),px+12,.15,pz-2);\n  q.props.push({x:px+12,z:pz-2,'
assert s.count('const fu=new THREE.Group();fu.position.set(px,1.3,pz)')==1 and s.count(_e)==1;_b=s.index(_e,_a)+len(_e);assert _b-_a<1100,_b-_a
s=s[:_a]+("const cg=new THREE.Group();cg.position.set(px,0,pz);g.add(cg);const W=csWreck(cg);for(let i=0;i<50;i++)R();"
 "for(const o of W.obs)ob(px+o.x0,px+o.x1,pz+o.z0,pz+o.z1);for(const r of W.map)rect(px+r[0],px+r[1],pz+r[2],pz+r[3],r[4]);"
 "let got=0;const bb=W.bb;\n  q.props.push({x:px+W.box[0],z:pz+W.box[1],")+s[_b:]
# 2. the 'crashed plane' step: the little flare gun and log meshes go (the model has both); the flare gun now lies
#    on the suitcase table at the camp under the wing, and the flare goes up from there for everyone
R("XM.net.flare=o=>{snd(900,.1);xmFlare(q,g,+o.x||px-6,+o.z||pz+.2)};const fg=A(BX(.3,.08,.14),M(0xd04020),px-6.2,.35,pz+.2);fg.rotation.y=.5;const lg=A(BX(.28,.04,.22),M(0x4a3a2a),px-5.4,.12,pz-1.2);",
 "XM.net.flare=o=>{snd(900,.1);xmFlare(q,g,+o.x||px-3.6,+o.z||pz-6.4)};")
R("prop(px-6,pz+.2,1.4,","prop(px-3.6,pz-6.4,1.4,")
R("xmFlare(q,g,px-6,pz+.2);xmNet(q,'flare',{x:px-6,z:pz+.2})","xmFlare(q,g,px-3.6,pz-6.4);xmNet(q,'flare',{x:px-3.6,z:pz-6.4})")
#    the pilot's log lies on the pedestal between the cockpit seats; a bigger radius so you can read it from the aisle
R("prop(px-5.4,pz-1.2,1.3,","prop(px+4.75,pz,1.6,")
# hangar-1.md: Hangar 1 rework (dx628). The new models replace these pieces of the base's hangar (restricted-zone step,# 'hangar' furniture step and 'more' step of milBuild). The refit station part is edited in dx556 (rfsBuild, rfsTick).
# the old floor plane, the six yellow dashes and the flat lamp grid go: hgShell lays the painted floor, lining, door pockets, columns, trusses and high-bay lights
R('const hf=AP(new THREE.PlaneGeometry(HX1-HX0-1,HZ1-HZ0-1),M(0x44484e,{roughness:.6,metalness:.2}),(HX0+HX1)/2,.08,(HZ0+HZ1)/2);hf.rotation.x=-Math.PI/2;for(let i=0;i<6;i++)A(BX(2,.012,.3),YL,345+i*14,.1,-694);for(let x=HX0+8;x<HX1;x+=12)for(const zz of[-708,-694,-680])LAMP(x,HH,zz,2.4);','/* hangar-1.md: the painted floor, wall lining, door pockets, steel columns, roof trusses and high-bay lights (dx628) */fbObs(q,hgShell(hgSub(q,g)).obs);')
# the blast door slabs: no more yellow stripe children; hgDoorSlab paints them and adds ribs, a seal and rollers. They move, so the batching leaves them alone
R('for(const d of[dA,dB]){const st=new THREE.Mesh(BX(.62,.5,9.6),YL);st.position.y=-3;d.add(st);const st2=new THREE.Mesh(BX(.62,.5,9.6),YL);st2.position.y=3;d.add(st2)}','hgDoorSlab(dA,-1);hgDoorSlab(dB,1);dA.userData.dpKeep=dB.userData.dpKeep=1;')
# the Wraith screen on the north wall moves up above the new pegboards
R('A(BX(6,2.2,.1),M(0x203040,{emissive:0x081018}),335,3,-717.4);','A(BX(6,2.2,.1),M(0x203040,{emissive:0x081018}),335,4.2,-717.4);')
# the Wraith's spec label moves 2 m west, so it no longer runs behind the new steel column at x 379
R(",8,1.2,'#101418','#40c0ff',375,5,-717.4,0);",",8,1.2,'#101418','#40c0ff',373,5,-717.4,0);")
# the old gantry crane (rails, posts, bridge, trolley, chain, hook) is replaced by the overhead crane over the tank bay
R('/* gantry crane: two rails under the roof, a bridge, a trolley and a hook on a chain */for(const z of[-712,-676]){A(BX(HX1-HX0-1,.25,.3),ST,(HX0+HX1)/2,HH-.4,z);for(let x=HX0+6;x<HX1;x+=12)A(BX(.3,HH-.6,.3),ST,x,HH/2-.1,z+(z<-694?-.3:.3))}const br=new THREE.Group();br.position.set(360,HH-.5,-694);g.add(br);const bb=new THREE.Mesh(BX(.5,.5,36.6),ST);br.add(bb);const tr=new THREE.Mesh(BX(.9,.6,.9),M(0xe8c020));tr.position.set(0,-.4,4);br.add(tr);const ch=new THREE.Mesh(CY(.03,.03,3,6),DK);ch.position.set(0,-2.2,4);br.add(ch);const hk=new THREE.Mesh(new THREE.TorusGeometry(.18,.04,6,12),ST2);hk.position.set(0,-3.8,4);br.add(hk);anim(375,-694,250,dt=>{br.position.x=360+Math.sin(q.rt*.12)*12;tr.position.z=4+Math.sin(q.rt*.2)*8;ch.position.z=tr.position.z;hk.position.z=tr.position.z});','/* hangar-1.md: the overhead crane on two runways over the tank bay (dx628); its bridge moves */const cr=hgCrane(hgSub(q,g));fbObs(q,cr.obs);anim(386,-710,250,()=>cr.tick(q.rt));')
# the four workbenches and the three red tool carts are replaced by the workshop (same bench spots and obstacles)
R('/* workbenches along the north wall with tools, tool chests, parts racks with spare pods and wheels, drums */for(let i=0;i<4;i++){const x=334+i*8;A(BX(4,.08,1.2),WD2,x,.9,-716.6);for(const dx of[-1.8,1.8])A(BX(.1,.84,1.1),ST,x+dx,.42+FL,-716.6);A(BX(3.8,.3,1.0),DK,x,.25+FL,-716.6);A(BX(.4,.06,.2),ST2,x-1,.97,-716.4);A(BX(.3,.12,.12),RD,x+.6,.99,-716.8);A(CY(.06,.06,.3,8),ST2,x+1.3,1.08,-716.5);ob(x-2,x+2,-717.2,-716)}for(let i=0;i<3;i++){A(BX(1.2,.9,.7),RD,350+i*25,.45+FL,-712);A(BX(1.3,.05,.8),ST2,350+i*25,.92+FL,-712);for(let d=0;d<3;d++)A(BX(1.1,.02,.02),ST2,350+i*25,.25+d*.25+FL,-711.645);ob(349.4+i*25,350.6+i*25,-712.4,-711.6)}','/* hangar-1.md: benches, tool chests, engine stand, tank stands, scissor lift, road wheels, compressor, fuel bowser (dx628) */fbObs(q,hgWorkshop(hgSub(q,g)).obs);')
# the old spares rack and the four drums by the door go: hgSouth has the spares racks and the drum cage
R("{const rx=346,rz=-676;for(let s2=0;s2<3;s2++)A(BX(6,.06,1.2),ST,rx+3,.5+s2*1.1+FL,rz);for(const dx of[0,3,6])A(BX(.1,3.2,1.2),ST,rx+dx,1.6+FL,rz);for(let i=0;i<4;i++){const pod=A(BX(.56,.56,1.3),M(0x15181c,{metalness:.5}),rx+.8+i*1.4,.84+FL,rz);for(let k=0;k<4;k++)A(CY(.09,.09,.06,8),M(0xa02020),rx+.8+i*1.4+(k%2?.15:-.15),.84+FL+(k<2?.15:-.15),rz-.66).rotation.x=Math.PI/2}for(let i=0;i<5;i++){const w=A(CY(.5,.5,.5,14),DK,rx+.8+i*1.1,2.16+FL,rz);w.rotation.z=Math.PI/2;A(CY(.2,.2,.52,10),M(0x40c0ff,{emissive:0x2090e0}),rx+.8+i*1.1,2.16+FL,rz).rotation.z=Math.PI/2}ob(rx-.1,rx+6.1,rz-.6,rz+.6);LB('X-13 SPARES · ROCKET PODS · WHEELS · DO NOT DROP',3,.35,'#101418','#40c0ff',rx+3,3.9,rz-.65,0,44)}\n  for(let i=0;i<4;i++){A(CY(.35,.35,.9,12),M([0x5a6a3a,0xe8c020,0x5a6a3a,0x8a2020][i]),418+(i%2)*.8,.45+FL,-676-(i>>1)*.8);A(CY(.36,.36,.04,12),DK,418+(i%2)*.8,.92+FL,-676-(i>>1)*.8)}ob(417.5,419.3,-677.2,-675.5);",'')
# the diagnostics desk, chair, screens, label and cable snake go: hgSouth builds the control room; the technician sits in it facing the window
R("desk(396,-676,3,1,0);chair(396,-677.6,Math.PI);const tech=mkSoldier(0);tech.position.set(396,.5,-677.5);tech.rotation.y=Math.PI;g.add(tech);for(let i=0;i<3;i++){A(BX(.9,.6,.05),SCR2,395-.0+i*1.0-1.0,1.2+FL,-675.6);A(BX(.1,.2,.1),DK,395+i*1.0-1.0,.86+FL,-675.6)}LB('X-13 DIAGNOSTICS · ARMOUR 100% · ROCKETS 8/8 · REACTOR: DO NOT ASK',2.6,.3,'#102820','#40ff80',396,2.1,-675.7,0,40);for(let i=0;i<14;i++)A(BX(1.2,.05,.1),DK,395-i*1.4,.11,-680-Math.sin(i*.8)*.4).rotation.y=.15*Math.sin(i);",'/* hangar-1.md: the control room, spares racks, drum cage, crew corner and fire point (dx628) */fbObs(q,hgSouth(hgSub(q,g)).obs);const tech=mkSoldier(0);tech.position.set(396,.5,-674.2);tech.rotation.y=0;g.add(tech);')
# the tank moves into the tank bay (its stands are drawn by hgWorkshop), its turret hangs from the new crane hook, the mechanics move to it; the red cart, wrench and tyre stack go
R("{const hull=mkVehModel('tank');hull.position.set(395,.45,-700);hull.rotation.y=Math.PI/2;if(hull.userData.tur)hull.userData.tur.visible=false;g.add(hull);for(const[dx,dz]of[[-2,-1.2],[2,-1.2],[-2,1.2],[2,1.2]])A(BX(.5,.45,.5),M(0xe8c020),395+dx,.22+FL,-700+dz);ob(392,398,-702,-698);const t2=mkVehModel('tank');const tur2=t2.userData.tur;if(tur2){t2.remove(tur2);tur2.position.set(0,-4.6,4);tur2.rotation.y=Math.PI/2;br.add(tur2);ch.scale.y=.4;ch.position.y=-1.1;hk.position.y=-1.7}for(const[x,z,ry]of[[393,-697.2,0],[398.5,-700,Math.PI/2]]){const m=mkSoldier(0);m.position.set(x,.9,z);m.rotation.y=ry;g.add(m)}A(BX(.5,.3,.3),RD,391.5,.15+FL,-697.5);A(CY(.04,.04,.9,6),ST2,391.5,.65+FL,-697.5).rotation.z=.5;for(let i=0;i<4;i++){const t=A(new THREE.TorusGeometry(.42,.14,8,14),DK,410,.14+i*.28+FL,-706+(i%2)*.1);t.rotation.x=Math.PI/2}}","{const hull=mkVehModel('tank');hull.position.set(386,.45,-710);hull.rotation.y=Math.PI/2;if(hull.userData.tur)hull.userData.tur.visible=false;g.add(hull);ob(383,389,-712,-708);const t2=mkVehModel('tank');const tur2=t2.userData.tur;if(tur2){t2.remove(tur2);cr.hk.add(tur2);tur2.position.set(0,-1.1,0);tur2.rotation.y=Math.PI/2}for(const[x,z,ry]of[[383.5,-707.4,0],[389.6,-710,Math.PI/2]]){const m=mkSoldier(0);m.position.set(x,.9,z);m.rotation.y=ry;g.add(m)}}")
# the hazard stripes round the old vehicle bay, the five lockers, the no-smoking sign and the floating BAY 1 sign go (the floor paint and hgSouth have them)
R("for(const z of[-702,-686])for(let x=355;x<400;x+=4)A(BX(2,.012,.3),M(0xe8c020),x+1,.1,z);for(const x of[355,399])for(let z=-702;z<-686;z+=4)A(BX(.3,.012,2),M(0xe8c020),x,.1,z+2);for(let k=0;k<5;k++)locker(414+k*.6,-671,Math.PI);LB('NO SMOKING · NO NAKED FLAMES · NO LEANING ON THE PROTOTYPE',3,.35,'#5a2020','#ffe0a0',414,3.2,-670.6,Math.PI,44);LB('BAY 1 · X-13 WRAITH · CLEAR THE BAY BEFORE START-UP',3,.35,'#e8c020','#1a1a1a',375,.6,-703.2,0,44)",'')
# 'more' step: the old fuel bowser and its label go (hgWorkshop has the new one)
R("{A(BX(3,1.4,1.6),M(0x6a6a30,{metalness:.4}),404,1.1,-712);A(CY(.75,.75,3,14),M(0x8a8a40,{metalness:.5}),404,1.8,-712).rotation.z=Math.PI/2;for(const dx of[-1,1])for(const dz of[-.7,.7]){const w=A(CY(.35,.35,.3,10),DK,404+dx,.35,-712+dz);w.rotation.z=Math.PI/2}A(CY(.04,.04,1.6,6),DK,405.6,.8,-711.2).rotation.x=.6;ob(402.4,405.6,-712.9,-711.1);LB('FUEL · 3,000 L · NO SPARKS',1.6,.3,'#e8c020','#1a1a1a',404,1.8,-711.1,0,46);",'{')
# 'more' step: the old scissor lift goes
R('A(BX(2,.12,1.2),ST,392,.06+FL,-706);for(let i=0;i<3;i++){A(BX(1.6,.04,.04),ST2,392,.4+i*.12+FL,-706.5+i*.1).rotation.z=.3+i*.05;A(BX(1.6,.04,.04),ST2,392,.4+i*.12+FL,-705.5-i*.1).rotation.z=-.3-i*.05}A(BX(2,.1,1.2),M(0xe8c020),392,.7+FL,-706);ob(391,393,-706.6,-705.4);','')
# 'more' step: the old compressor and its hose coils go
R('A(CY(.4,.4,1.0,12),M(0x2a4a8a,{metalness:.4}),410,.5+FL,-711);A(BX(.6,.4,.5),DK,410,1.2+FL,-711);for(let i=0;i<8;i++)A(new THREE.TorusGeometry(.3,.025,6,12),DK,410.9,.05+i*.04,-711+(i%2)*.08).rotation.x=Math.PI/2;ob(409.6,410.4,-711.4,-710.6);','')
# 'more' step: the two extinguishers on the west wall sit on the new lining (they floated half a metre off the wall); the one on the east wall stood where the door pocket is now, and goes
R('for(const[x,z,ry]of[[326.2,-700,Math.PI/2],[326.2,-688,Math.PI/2],[423.8,-712,-Math.PI/2]]){A(CY(.09,.09,.5,10),RD,x,1.1,z);A(BX(.3,.12,.05),WH,x,1.55,z);A(BX(.04,.3,.3),M(0x6a6a6a),x+(x<400?-.1:.1),1.1,z)}','for(const z of[-700,-688]){A(CY(.09,.09,.5,10),RD,325.72,1.1,z);A(BX(.06,.3,.3),M(0x6a6a6a),325.6,1.1,z);A(BX(.02,.12,.3),WH,325.58,1.55,z)}')
# 'more' step: the three loose oil-stain discs go (the painted floor has its own oil stains; the discs sat over the lane lines)
R('for(const[x,z,r]of[[368,-698,1.2],[382,-690,.8],[350,-696,1.5]])A(new THREE.CircleGeometry(r,14),M(0x2a2420,{roughness:.6}),x,.1,z).rotation.x=-Math.PI/2;','')
# weapons.md: Fort Blackout's sentry guns, AA guns, mortars and LZ Bravo's helicopter use the new models (dx627)
# mkTurret (local to the Fort Blackout builder): everything that built meshes goes; wpSentry / wpAA build into the
# same group gp. The radar and the alarm eye keep their anims. Signature, ry0, ML.tur entry and obstacle stay.
_h='function mkTurret(x,z,y0,k){const gp=new THREE.Group();gp.position.set(x,y0,z);g.add(gp);'
_e='const bar=head.userData.bar,fl=head.userData.fl;'
assert s.count(_h)==1 and s.count(_e)==1,(s.count(_h),s.count(_e))
_a=s.index(_h)+len(_h);_b=s.index(_e,_a);assert _b-_a<12000,_b-_a
s=s[:_a]+"const aa=k=='aa';const W=aa?wpAA(gp):wpSentry(gp);const head=W.head,bar=W.bar,fl=W.fl;if(aa)anim(x,z,300,dt=>{W.radar.rotation.y+=dt*2.5});else anim(x,z,200,()=>{W.eye.material.emissive.setHex(ML.alarm?((q.rt*6|0)%2?0xff3030:0x300000):0xff3030)});"+s[_b+len(_e):]
# the turret remembers its barrel cluster (sp) and the gun's rest position (bz: the AA gun's axle sits 15 cm forward)
R("head.rotation.y=ry0;const u={x,z,y:y0+(aa?1.6:1.28),k,g:gp,head,bar,fl,cd:0,","head.rotation.y=ry0;const u={x,z,y:y0+(aa?1.6:1.28),k,g:gp,head,bar,fl,sp:W.sp,bz:bar.position.z,cd:0,")
# only the six-barrel cluster spins (the shield, cradle and flash stay put)
R("u.spin+=dt*30;u.bar.rotation.z=u.spin}","u.spin+=dt*30;(u.sp||u.bar).rotation.z=u.spin}")
# the recoil kicks back from the gun's rest position instead of from 0
R("u.bar.position.z=.15*(u.rec/.12)}else u.bar.position.z=0}","u.bar.position.z=(u.bz||0)+.15*(u.rec/.12)}else u.bar.position.z=u.bz||0}")
# mortar pits: the new mortar, turned to fire north at the berm, and one crate of rounds instead of three ammo boxes
R("const m=mkMortar(K);m.position.set(mx,0,mz);m.rotation.y=Math.PI/2;g.add(m);ob(mx-.6,mx+.6,mz-.6,mz+.6);for(let k=0;k<3;k++)A(BX(.5,.3,.9),OD,mx-1.4+k*.55,.15,mz+1.3);",
  "const m=wpMortar();m.position.set(mx,0,mz);m.rotation.y=Math.PI;g.add(m);ob(mx-.6,mx+.6,mz-.6,mz+.6);{const cr=wpRounds();cr.position.set(mx-1.3,0,mz+1.3);cr.rotation.y=.3;g.add(cr)}")
# the firing dust comes out of the muzzle (the mortar is turned by PI, so local (x,y,z) is (mx-x, y, mz-z)), and the tube kicks
R("try{vfx('dust',mx,.8,mz+q.OZ,{n:8,w:.8})}catch(e){}","try{const mu=m.userData.muzzle;vfx('dust',mx-mu.x,mu.y,mz-mu.z+q.OZ,{n:8,w:.8});wpMortarKick(m)}catch(e){}")
# LZ Bravo: the UH-9 transport helicopter instead of the old military mkHeli(K) (the police pad's mkHeli() was swapped in r620)
R("const heli=mkHeli(K);heli.position.set(hx,0,hz);","const heli=wpHeli();heli.position.set(hx,0,hz);")
# dusty-gulch.md: Dusty Gulch rework (dx630 redefines xpGulch). The welcome arch over Main Street carries the town's name now,
# so the old "DUSTY GULCH / POP. 13" street sign by the arch goes
R("[456,-1432,'DUSTY GULCH\\nPOP. 13 · DRIVE DARKLY',.3,'#8a5a2a'],","")
# the parked stretch limo stood half inside the bank's front wall (freeSpot used to push it into the street; now the boardwalk is there,
# and it ended up in the alley): it parks on Main Street, in front of the bank
R("['limo',460,-1459,0]","['limo',453.6,-1464,0]")
# lake-rail (docs/design/lake-rail.md, src/dx631.js): exact-text patches of the base
# the old telegraph poles on the north side of the line are not built any more (the new ones from rrPoles stand on the south side): the loop never runs, so no poles and no boxes
R("for(let x=-DXB+8;x<=DXB-8;x+=32){if(Math.abs(x)<12||Math.abs(x+440)<12","for(let x=-DXB+8;x<-DXB;x+=32){if(Math.abs(x)<12||Math.abs(x+440)<12")
# the parked quad bike stood where the new bait shop's east wall is (262,-1494): it now waits 4 m further east, between the shop and the volleyball court
R("add('quad',262,-1494,.4)","add('quad',264.6,-1497.5,.4)")
# The Pyramid rework (docs/design/pyramid.md, dx629): the base's pyrBuild/pyrUnder build their meshes inline, so
# these patches swap each old mesh for the model from dx629 at the same spot. Rooms, traps, puzzles, prompts and
# obstacles stay as they are. Removed meshes that drew numbers from the desert's seeded random are replaced by
# pywBurn(n), so everything built after the pyramid stays exactly where it was.
# -- batch 1, outside: the faces, capstone, gateway, avenue, sphinxes, obelisks, dig camp and ruins (pywOut keeps the map rects and the capstone glow)
R(" /* the shell */const sh=[[new THREE.Vector3(X+B,0,Z),new THREE.Vector3(0,0,1),[3.6,5.3]],[new THREE.Vector3(X-B,0,Z),new THREE.Vector3(0,0,-1)],[new THREE.Vector3(X,0,Z-B),new THREE.Vector3(1,0,0)],[new THREE.Vector3(X,0,Z+B),new THREE.Vector3(-1,0,0)]];\n for(const[pm,e1,nt]of sh){const m=new THREE.Mesh(pyrFace(pm,e1,nt),SAND);g.add(m)}\n {const r=B*3.2/H*Math.SQRT2*1.03,cap=A(new THREE.ConeGeometry(r,3.3,4),GOLD,X,H-1.6,Z);cap.rotation.y=Math.PI/4;const gl=glowSp(0xffd060,.55,9);gl.position.set(X,H-1.2,Z);g.add(gl)}\n rect(X-B,X+B,Z-B,Z+B,'#c8a060');rect(X-6,X+6,Z-6,Z+6,'#e0c080');",
  " /* the outside: the pyramid rework (dx629) */pywOut(q,g,ob,rect);")
# -- batch 2: painted wall faces on the cell lines, ceiling tiles and the floor slab instead of the wall boxes, floor and ceiling slab (the collision loop above stays)
_a=s.index(" /* the walls you can see: solid cells that touch a floor cell");_b=s.index("A(pyrBox(B*2,.06,B*2),FLR,X,.02,Z);A(pyrBox(48.2,.25,48.2),SAND2,X,WH+.125,Z);",_a)
assert _b-_a<700;s=s[:_a]+" /* the walls, ceilings and floor: the pyramid rework (dx629) */pywNS(()=>pyFloorplan(g));"+s[_b+len("A(pyrBox(B*2,.06,B*2),FLR,X,.02,Z);A(pyrBox(48.2,.25,48.2),SAND2,X,WH+.125,Z);"):]
#    the portal's three boxes in the new stone (same sizes and places, same obstacles); the old glyph plane and bollards go (the gateway has its own bollards, same spots)
R("for(const sd of[-1,1]){A(pyrBox(px1-px0,5.5,2.2),SAND2,(px0+px1)/2,2.75,Z+sd*2.7);ob(px0,px1,sd<0?Z-3.8:Z+1.6,sd<0?Z-1.6:Z+3.8)}A(pyrBox(px1-px0,1.6,3.2),SAND2,(px0+px1)/2,WH+.8,Z);",
  "for(const sd of[-1,1])ob(px0,px1,sd<0?Z-3.8:Z+1.6,sd<0?Z-1.6:Z+3.8);pywNS(()=>pyPortal(g));")
R("{const lt=new THREE.Mesh(new THREE.PlaneGeometry(3.4,1.3),new THREE.MeshBasicMaterial({map:pyrGlyph(['𓂀','  ','#4a2a0a'],'',3.4,1.3,'#b8925a')}));lt.position.set(px1+.01,4.6,Z);lt.rotation.y=Math.PI/2;g.add(lt)}\n for(const bz of[-.95,.95]){A(new THREE.CylinderGeometry(.32,.36,.9,10),SAND2,px1+1.2,.45,Z+bz);ob(px1+.9,px1+1.5,Z+bz-.3,Z+bz+.3)}\n","")
#    the wall torches: bronze torches with a real flame, the same glow and lights
_a=s.index("/* torches: a stick and a flame, two real lights */const torch=(x,z,ry,lit)=>{");_b=s.index("if(lit){const L=new THREE.PointLight(0xff9a40,1.3,16);L.position.set(0,2.6,.6);t.add(L)}};",_a)
assert _b-_a<900;s=s[:_a]+"/* torches: bronze wall torches (dx629), the same glow and lights */const torch=(x,z,ry,lit)=>pywTorch(q,g,x,z,ry,lit);"+s[_b+len("if(lit){const L=new THREE.PointLight(0xff9a40,1.3,16);L.position.set(0,2.6,.6);t.add(L)}};"):]
#    the steles: the new carved stele under the game's clue picture (stele 0 is built by pyAntechamber, at the same spot)
R("const b=new THREE.Mesh(pyrBox(1.3,2.3,.35),SAND2);b.position.y=1.15;s.add(b);const top=new THREE.Mesh(new THREE.ConeGeometry(.92,.5,4),SAND2);top.rotation.y=Math.PI/4;top.position.y=2.55;top.scale.z=.27;s.add(top);",
  "if(k)s.add(pywNS(pyStele));")
#    the entrance hall, the antechamber (columns, guardians, door frames, its stele, table, jars and skeleton) and the clue rooms' things
R(" /* the antechamber: a scroll with a treasure map on it, an urn, a skeleton that did not make it */\n {const tb=A(pyrBox(1.4,.9,.8),SAND2,X+3.5,.45,Z+5.4);const sc=A(BX(.7,.04,.4),M(0xe8d8a8),X+3.5,.92,Z+5.4);sc.rotation.y=.3;",
  " /* the antechamber: a scroll with a treasure map on it, an urn, a skeleton that did not make it (models: dx629) */\n pywIn(q,g,ob);{")
R("for(const[ux,uz]of[[X-1.4,Z-7.4],[X-1.4,Z+7.4],[X+6.4,Z+7.4]]){A(new THREE.CylinderGeometry(.35,.25,.9,12),M(0x9a5a2a),ux,.45,uz);A(new THREE.CylinderGeometry(.2,.35,.25,12),M(0x9a5a2a),ux,1.0,uz);ob(ux-.4,ux+.4,uz-.4,uz+.4)}",
  "for(const[ux,uz]of[[X-1.4,Z-7.4],[X-1.4,Z+7.4],[X+6.4,Z+7.4]])ob(ux-.4,ux+.4,uz-.4,uz+.4);")
R("const bn=M(0xe8e0c8);for(let k=0;k<5;k++){const b=A(new THREE.CylinderGeometry(.05,.05,.55,6),bn,X+6+k*.25,.08,Z-7+(k%2)*.3);b.rotation.z=Math.PI/2;b.rotation.y=k}A(new THREE.SphereGeometry(.18,10,8),bn,X+5.6,.18,Z-7.2);\n","")
# -- batch 3: the dart stones' materials and the darts
R("const TS=M(0xc4a878),TC=M(0xffffff,{map:crack}),tiles=[];","const TS=pywNS(pyDartMats).safe,TC=pywNS(pyDartMats).cracked,tiles=[];")
R("dm=A(new THREE.CylinderGeometry(.015,.015,.35,5),DK,x+(Math.random()-.5)*1.2,.8+Math.random()*1.2,z-sd*1.5);dm.rotation.x=Math.PI/2;",
  "dm=pywAt(g,pyDart(),x+(Math.random()-.5)*1.2,.8+Math.random()*1.2,z-sd*1.5,1);if(sd<0)dm.rotation.y=Math.PI;")
#    the blades: rod, crescent and hub in the swinging pivot, a bronze mount and a slot in the ceiling
R("const arm=new THREE.Mesh(BX(.06,3.0,.06),M(0x5a5a5a,{metalness:.7}));arm.position.y=-1.5;pv.add(arm);",
  "pv.userData.dpKeep=1;pv.add(pywNS(pyBlade));pywNS(()=>pyBladeMount(g,bx,zc));")
_a=s.index("   /* the axe head: a half-moon blade, edge-on to the swing");_b=s.index("A(BX(.5,.12,.5),DK,bx,WH-.06,zc);",_a)
assert _b-_a<700;s=s[:_a]+s[_b+len("A(BX(.5,.12,.5),DK,bx,WH-.06,zc);"):]
#    the sealed door: the carved slab (still sinks), a frame in front of it, bronze dials
R("slab=A(pyrBox(.5,WH,C),SAND2,sx+.25,WH/2,Z),sOb=ob(sx,sx+.5,Z-C/2,Z+C/2);",
  "slab=pywAt(g,pywNS(pySealedSlab),sx+.25,WH/2,Z,1),sOb=ob(sx,sx+.5,Z-C/2,Z+C/2);pywNS(()=>pySealedFrame(g,sx));")
R("const ring=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,.06,16),M(0x8a6a3a));ring.rotation.z=Math.PI/2;dg.add(ring);",
  "dg.userData.dpKeep=1;dg.add(pywNS(pyDial));")
# -- batch 4: the treasure chamber
R("gp=(x,z,s)=>{const c=A(new THREE.ConeGeometry(.7*s,.6*s,10),GOLD,x,.3*s,z);for(let k=0;k<5;k++)A(new THREE.CylinderGeometry(.09,.09,.02,10),GOLD,x+(Math.random()-.5)*1.3*s,.02,z+(Math.random()-.5)*1.3*s)};",
  "gp=(x,z,s)=>{pywBurn(10);pywAt(g,pywNS(()=>pyGoldPile(s)),x,0,z)};pywTreasure(g,ob);")
R("const sar=A(pyrBox(1.2,.9,2.6),M(0xc8a040,{metalness:.5,roughness:.4}),tx,.45,Z+3.2);const lid=A(BX(1.3,.18,2.7),GOLD,tx,.99,Z+3.2);",
  "const sar=pywAt(g,pywNS(pySarcophagus),tx,0,Z+3.2);const lid=pywAt(g,pywNS(pySarcLid),tx,.99,Z+3.2,1);")
_a=s.index("const mum=new THREE.Group();mum.position.set(tx,.6,Z+2.95);mum.visible=false;g.add(mum);{const W=M(0xe8e0c8,{map:pyrTex('#e8e0c8','#b8a888')});");_b=s.index("mum.userData.tr=tr}",_a)
assert _b-_a<900;s=s[:_a]+"const mum=pywNS(pyMummy);pywBurn(2700);mum.position.set(tx,.6,Z+2.95);mum.visible=false;g.add(mum);"+s[_b+len("mum.userData.tr=tr}"):]
R("const ch=A(pyrBox(1.1,.7,.7),M(0x6a3a1a),cx(1)+.3,.35,Z-2.6);const chl=A(BX(1.14,.18,.74),GOLD,cx(1)+.3,.79,Z-2.6);",
  "const ch=pywAt(g,pywNS(pyChest),cx(1)+.3,0,Z-2.6);const chl=pywAt(g,pywNS(pyChestLid),cx(1)+.3,.79,Z-2.6,1);")
#    two fit fixes for the new models: the pushed-off lid leans against the sarcophagus's side (it used to stick into it), and the
#    chest lid swings back on a hinge at the chest's back edge (it used to float 14 cm over the chest)
R("lid.position.x=tx+.9;lid.position.y=.6;lid.rotation.z=.6;","lid.position.x=tx+.85;lid.position.y=.66;lid.rotation.z=-1.05;")
R("chl.rotation.z=1.1;chl.position.set(cx(1)+.3-.57+.26,.88+.51,Z-2.6);","chl.rotation.z=1.9;chl.position.set(cx(1)+.3-.57-.27,.70+.51,Z-2.6);")
R("const ped=A(pyrBox(.8,1.1,.8),SAND2,cx(1)-.6,.55,Z+.6);","const ped=pywAt(g,pywNS(pyPedestal),cx(1)-.6,0,Z+.6);")
_a=s.index("{const f=new THREE.Mesh(new THREE.SphereGeometry(.24,14,10,0,Math.PI*2,0,Math.PI*.6),GOLD);f.scale.set(1,1.2,.7);mask.add(f);");_b=s.index("const mg=glowSp(0xffd040,.5,1.4);mask.add(mg)}",_a)
assert _b-_a<700;s=s[:_a]+"{mask.userData.dpKeep=1;mask.add(pywNS(pyMask));"+s[_b:]
# -- batch 2 (the passage) and the old sphinxes, in pyrUnder: the painted passage, its four torches (the -z one at X+37.5 lit); the avenue has the new sphinxes
_a=s.index(" {for(const sd of[-1,1]){for(let k=0;k<3;k++){const p=new THREE.Mesh(new THREE.PlaneGeometry(3.6,1.6)");_b=s.index("ob(sx-3.4,sx+3.4,sz-1.8,sz+1.8)}}",_a)
assert _b-_a<2000;s=s[:_a]+" pywBurn(9000);pywPass(q,g);"+s[_b+len("ob(sx-3.4,sx+3.4,sz-1.8,sz+1.8)}}"):]
#    the undercroft's things go into their own group, shown only while you are down there (it is only reached by the stairs, behind a
#    fade, and nothing up top can see it); its torch lights stay outside the group so the number of lights never changes
R("function pyrUnder(q,g,K){const{M,A,BX,ob,SAND2,FLR,GOLD,DK}=K,","function pyrUnder(q,g,K){const{M,BX,ob,SAND2,FLR,GOLD,DK}=K,A=(geo,m,x,y,z,par)=>K.A(geo,m,x,y,z,par||g),")
R("const pi0=q.props.length;/* every prompt from here on is underground */","const pi0=q.props.length;/* every prompt from here on is underground */g=pywUGroup(q,g);")
#    the scarab trapdoor: the new slab (still slides) and its surround with the stairs picture; the old pit, frame strips and scarab plane go
R("const pit=A(new THREE.PlaneGeometry(2.1,2.1),new THREE.MeshBasicMaterial({color:0x040302}),hx,.035,hz);pit.rotation.x=-Math.PI/2;","")
_a=s.index("const slab=A(pyrBox(2.3,.12,2.3),SAND2,hx,.07,hz);const sg=");_b=s.index("A(BX(w,.08,d),M(0x6a5030),hx+ax,.04,hz+az);",_a)
assert _b-_a<600;s=s[:_a]+"const slab=pywAt(g,pywNS(pyTrapSlab),hx,.07,hz,1);pywNS(()=>pyTrapFrame(g,hx,hz));"+s[_b+len("A(BX(w,.08,d),M(0x6a5030),hx+ax,.04,hz+az);"):]
# -- batch 5, the undercroft: painted faces, ceiling tiles, beams and floor instead of the wall boxes, slabs and beam loop
_a=s.index(" for(let j=2;j<=21;j++){let s=-1;const vis=i=>!isF(i,j)");_b=s.index("A(BX(.35,.3,fz1-fz0),M(0x6a5030),bx(i),Y+HH-.15,(fz0+fz1)/2);",_a)
assert _b-_a<900;s=s[:_a]+" pywNS(()=>pyUnderplan(g));"+s[_b+len("A(BX(.35,.3,fz1-fz0),M(0x6a5030),bx(i),Y+HH-.15,(fz0+fz1)/2);"):]
#    the gates: carved slabs, same size and place, still sink
R("const gate=(k,x0,x1,z0,z1)=>{const m=A(pyrBox(x1-x0,HH,z1-z0),SAND2,(x0+x1)/2,y0,(z0+z1)/2),",
  "const gate=(k,x0,x1,z0,z1)=>{const m=pywAt(g,pywNS(()=>pyGateSlab(x1-x0,HH,z1-z0,k)),(x0+x1)/2,y0,(z0+z1)/2,1),")
#    the torches: bronze torches on the wall faces, the same glows and lights
R("pyrTorch(q,g,M,x+o[0]*.97,Y,z+o[1]*.97,o[2],lit)};","pywUTorch(q,g,x+o[0]*.97,Y,z+o[1]*.97,o[2],lit,.048)};")
#    the clue tablets: stone with drawn signs and clear letters (same planes, same words)
R("new THREE.MeshBasicMaterial({map:pyrArt(lines,icons,w||3,h||1.6)})","(pywBurn(1500),pywNS(()=>pyTablet(lines,w||3,h||1.6)))")
#    the stairs wall to wall with nosings and a lined opening; the bones become a skeleton
R("{for(let k=0;k<9;k++){const d=6.4/9,h=(k+1)*HH/9;A(pyrBox(2.9,h,d),SAND2,bx(4),Y+h/2,bz(15)+1.6-(k+.5)*d)}","{pywNS(()=>pyUnderStairs(g));")
R("const sh=A(BX(3,.05,2),new THREE.MeshBasicMaterial({color:0x000000}),bx(4),Y+HH-.02,bz(14)-.6);","")
R("const bn=M(0xe8e0c8);for(let k=0;k<4;k++){const b=A(new THREE.CylinderGeometry(.05,.05,.5,6),bn,bx(6)+k*.2,Y+.06,bz(17)+.6);b.rotation.z=Math.PI/2;b.rotation.y=k*.7}A(new THREE.SphereGeometry(.17,10,8),bn,bx(6)-.3,Y+.17,bz(17)+.8)}",
  "pywNS(()=>pyLandingDressing(g))}")
#    the Jackal: the altar with its fire bowl, the basalt jackals on round plinths (they turn), eye glows at the new eyes; the clue tablet 25 cm right (the closed gate covered its left edge)
R("A(pyrBox(1.8,1,1.8),SAND2,ax,Y+.5,az);A(BX(1.9,.1,1.9),GOLD,ax,Y+1.05,az);","pywFl(q,pywAt(g,pywNS(pyAltar),ax,Y,az).userData.flame);")
R("const j=pyrJackal(M,i==red,1.1);j.position.set(x,Y,z);g.add(j);","const j=pywNS(()=>pyJackal({red:i==red,scale:1.1,round:true}));j.userData.dpKeep=1;j.position.set(x,Y,z);g.add(j);")
R("eg.position.set(0,2.3,.45);j.add(eg);","eg.position.set(0,2.51,.36);j.add(eg);")
R("['🐺','🔥','🐺'],bx(12),bz(13)-1.58,0,3.6,1.7)","['🐺','🔥','🐺'],bx(12)+.25,bz(13)-1.58,0,3.6,1.7)")
#    the Sun: the bronze dish under the light shaft, the golden disc on its carved backing (its emissive still lights up), the mirrors' stands and heads
R("A(new THREE.CylinderGeometry(.5,.5,.15,16),GOLD,sx,by,sz).rotation.z=Math.PI/2;","pywAt(g,pywNS(pySunSource),sx,by,sz);")
R("const disc=A(new THREE.CylinderGeometry(.75,.75,.12,24),M(0xb08a20,{metalness:.8,roughness:.3,emissive:0x000000}),tx,by,tzz);disc.rotation.x=Math.PI/2;",
  "const disc=pywAt(g,pywNS(pySunTarget),tx,by,bz(3)-1.6).userData.disc;")
R("for(let k=0;k<12;k++){const r=A(BX(.06,.5,.04),GOLD,tx+Math.sin(k*.52)*1.05,by+Math.cos(k*.52)*1.05,tzz);r.rotation.z=-k*.52}","")
R("const ped=new THREE.Mesh(new THREE.CylinderGeometry(.32,.42,.8,10),SAND2);ped.position.y=.4;gr.add(ped);","gr.add(pywNS(pyMirrorStand));")
R("const fr=new THREE.Mesh(BX(1.32,1.42,.12),GOLD);piv.add(fr);for(const sd of[-1,1]){const mf=new THREE.Mesh(BX(1.16,1.26,.02),M(0xdce8f8,{metalness:.25,roughness:.15,emissive:0x506070}));mf.position.z=sd*.065;piv.add(mf)}",
  "piv.userData.dpKeep=1;piv.add(pywNS(pyMirrorHead));")
# -- batch 6, Song: gong stands, bronze gongs (still wobble and light up), drawn signs, the stone priest
R("for(const sd of[-.75,.75])A(BX(.12,2.5,.12),M(0x4a3020),x,Y+1.25,z+sd);A(BX(.12,.12,1.7),M(0x4a3020),x,Y+2.45,z);const d=A(new THREE.CylinderGeometry(.6,.6,.06,24),M(0xd8a030,{metalness:.35,roughness:.35,emissive:0x3a2400}),x,Y+1.55,z);d.rotation.z=Math.PI/2;",
  "pywNS(()=>pyGongFrame(g,x,z));const d=pywAt(g,pywNS(pyGongDisc),x,Y+1.55,z,1);")
R("new THREE.MeshBasicMaterial({map:pyrGlyph([SY[k],'','#3a1a04'],'',.5,.5,'#c8a46a')})","pywNS(()=>pyGongLabel(k))")
_a=s.index("const RB=M(0xe8e0c8),SK=M(0x8a5a30);const a=(geo,m,x,y,z)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);pr.add(o);return o};");_b=s.index("for(const sd of[-1,1])a(new THREE.SphereGeometry(.03,6,6),M(0x101010),sd*.07,2.64,.18);",_a)
assert _b-_a<600;s=s[:_a]+"pr.add(pywNS(pyPriest));"+s[_b+len("for(const sd of[-1,1])a(new THREE.SphereGeometry(.03,6,6),M(0x101010),sd*.07,2.64,.18);"):]
#    Sand: the sand and the falling streams get their own textures (the streams scroll), the ceiling cracks, proper throw levers whose angles
#    swap (they start up at 45 degrees and pull down to 24 below level; the old pulled handle went into the wall), the tablet moves onto the west wall
R("new THREE.MeshStandardMaterial({map:pyrTex('#d8b070','#b89050'),color:0xe0c080,roughness:1,side:THREE.DoubleSide})","(pywBurn(2700),pywNS(pySandMats).sand)")
R("new THREE.MeshBasicMaterial({color:0xd8b070,transparent:true,opacity:.75}),bx(18+(k%2))","pywNS(pySandMats).fall,bx(18+(k%2))")
R("f.visible=false;fall.push(f)}","f.visible=false;f.userData.dpKeep=1;fall.push(f)}sand.userData.dpKeep=1;pywNS(()=>pySandCracks(g));")
R("A(BX(.12,.8,.5),M(0x3a342c,{metalness:.6}),x,Y+1.4,z);const h=new THREE.Group();","pywNS(()=>pyLeverPlate(g,x,Y+1.4,z,sd));const h=new THREE.Group();h.userData.dpKeep=1;")
R("const hm=new THREE.Mesh(BX(.08,.8,.08),M(0x6a5a40,{metalness:.5}));hm.position.y=.35;h.add(hm);const kn=new THREE.Mesh(new THREE.SphereGeometry(.09,8,6),M(0xc01818));kn.position.y=.75;h.add(kn);h.rotation.z=sd*.6;",
  "h.add(pywNS(()=>pyLeverHandle(sd)));h.rotation.z=-sd*.6;")
R("L.on=1;h.rotation.z=-sd*.6;","L.on=1;h.rotation.z=sd*.6;")
R("LV.forEach(L=>{L.on=0;L.h.rotation.z=L.sd*.6})","LV.forEach(L=>{L.on=0;L.h.rotation.z=-L.sd*.6})")
R("sand.material.map.offset.y+=dt*.05;","sand.material.map.offset.y+=dt*.05;fall[0].material.map.offset.y-=dt*1.5;")
R("['⏳','🏜️','⏳'],bx(18),bz(10)-1.25,0,3,1.5)","['⏳','🏜️','⏳'],bx(18)-1.58,bz(10)+.2,Math.PI/2,3,1.5)")
#    the tomb: Khufu-Bob's coffin, the big jackals, gold heaps, canopic jars, the Heart's pedestal and heart-shaped gem, fire bowls on brackets
_a=s.index("A(pyrBox(4,1.1,2.2),M(0xc89a30,{metalness:.6,roughness:.35}),tx,Y+.55,tz);");_b=s.index("nm.rotation.y=Math.PI/4;U.blk.push({x0:tx-2.2,x1:tx+2.2,z0:tz-1.3,z1:tz+1.3});",_a)
assert _b-_a<600;s=s[:_a]+"pywAt(g,pywNS(pyKhufuCoffin),tx,Y,tz);"+s[_b+len("nm.rotation.y=Math.PI/4;"):]
R("a=pyrJackal(M,false,1.45);","a=pywNS(()=>pyJackal({scale:1.45}));")
R("const gp=(x,z,s)=>{A(new THREE.ConeGeometry(.75*s,.65*s,10),GOLD,x,Y+.32*s,z);for(let k=0;k<6;k++)A(new THREE.CylinderGeometry(.09,.09,.02,10),GOLD,x+(Math.random()-.5)*1.5*s,Y+.02,z+(Math.random()-.5)*1.5*s);",
  "const gp=(x,z,s)=>{pywBurn(12);pywAt(g,pywNS(()=>pyGoldPile(s)),x,Y,z);")
R("for(const[jx,jz]of[[bx(14)+.6,bz(18)-1.15],[bx(15)-.2,bz(18)-1.15],[bx(15)+.4,bz(18)-1.15],[bx(16)-.4,bz(18)-1.15]]){A(new THREE.CylinderGeometry(.2,.15,.6,10),M(0xd8c8a0),jx,Y+.3,jz);A(new THREE.SphereGeometry(.16,8,6),M(0x2a2a2a),jx,Y+.66,jz)}",
  "[[bx(14)+.6,bz(18)-1.15],[bx(15)-.2,bz(18)-1.15],[bx(15)+.4,bz(18)-1.15],[bx(16)-.4,bz(18)-1.15]].forEach(([jx,jz],i)=>pywAt(g,pywNS(()=>pyCanopic(i)),jx,Y,jz));")
R("hp=A(pyrBox(.8,1.1,.8),SAND2,hx2,Y+.55,hz2);const ht=new THREE.Mesh(new THREE.OctahedronGeometry(.28,0),","hp=pywAt(g,pywNS(pyHeartPedestal),hx2,Y,hz2);const ht=new THREE.Mesh(pyHeartGeo(),")
R("A(new THREE.CylinderGeometry(.18,.1,.3,10),M(0x6a5030,{metalness:.5}),hx2+sd*1.3,Y+1.6,bz(20)+1.45);","pywFl(q,pywNS(()=>pyWallBowl(g,hx2+sd*1.3,Y+1.6,bz(20)+1.45)));")
R("g.add(ht);const hg=glowSp(0xff3050,.7,2.4);","ht.userData.dpKeep=1;g.add(ht);const hg=glowSp(0xff3050,.7,2.4);")
# r646 (src/dx632.js): let later code check a batch for pieces that moved (the batch watchdog's own check)
R("DP._mergeRoot=(q,r,lam,sh)=>dpMergeRoot(q,r,lam,sh);","DP._mergeRoot=(q,r,lam,sh)=>dpMergeRoot(q,r,lam,sh);DP._check=(L,mv)=>dpCheckRecs(L,mv);")
# r654: the people batching (dx640) makes its materials the way the batcher does
R("DP._check=(L,mv)=>dpCheckRecs(L,mv);","DP._check=(L,mv)=>dpCheckRecs(L,mv);DP._mergedMat=mergedMat;")
# ---------------------------------------------------------------------------------------------------------------
# r657 Route 13 (docs/design/route-13.md, src/dx641.js): the old town round the bus stop
# ---------------------------------------------------------------------------------------------------------------
def RB(a,b,new):
    """replace the text from marker a up to (not including) marker b; a must occur exactly once"""
    global s
    c=s.count(a);assert c==1,(a[:70],c);i=s.index(a);j=s.index(b,i);s=s[:i]+new+s[j:]
# the bus stop: the old bench and skull go (the bench is inside the new shelter), and the bench's obstacle
R("const bench=new THREE.Mesh(new THREE.BoxGeometry(.5,.08,1.6),PM2);bench.position.set(.8,.45,0);ss.add(bench);for(const z of[-.7,.7]){const lg=new THREE.Mesh(new THREE.BoxGeometry(.08,.45,.08),PM2);lg.position.set(.8,.22,z);ss.add(lg)}","/* r657: the bench is in the new shelter (dx641) */")
R("const skl=new THREE.Mesh(new THREE.SphereGeometry(.14,8,6),new THREE.MeshStandardMaterial({color:0xf0ece0}));skl.position.set(1.4,.12,1.2);ss.add(skl);","")
R("ob(4.0,4.6,-1043.8,-1043.2);ob(4.8,5.4,-1044.4,-1042.6)}","ob(4.0,4.6,-1043.8,-1043.2)}")
# the ground hole of the old shaft at (0, -1066) (unused since the shack moved in r606)
R("[[-hx0,hx0,HZ0-hx0,HZ0+hx0],[-DXB-40,","[[-DXB-40,")
# no bus-ride cactus or rock inside the town (taken away after the scatter, so its random numbers are unchanged)
R("Q.obs.push(...ROB)}],","Q.obs.push(...rtScatter(ROB,g))}],")
# El Goblino Gas: the canopy, fascia, pumps, pole sign and the shop's west wall are the models now (rtGasB, rtShopB)
R("const can=A(BX(14,.4,10),M(0x5a9a2a),cx,4.6,cz);for(const[x,z]of[[cx-6,cz-4],[cx+6,cz-4],[cx-6,cz+4],[cx+6,cz+4]]){A(new THREE.CylinderGeometry(.18,.18,4.6,10),MT,x,2.3,z);ob(x-.3,x+.3,z-.3,z+.3)}","const RTGS=rtGasB(q,g,obs);")
R("A(BX(14.2,.9,.3),M(0xe8e0c8),cx,4.1,cz+5);const cs=txt('EL GOBLINO GAS',8,.8,'#e8e0c8','#c02020',56);cs.position.set(cx,4.1,cz+5.17);g.add(cs);","")
R("A(BX(1.2,.3,1.6),DK,cx,.15,pz);const pm=A(BX(.8,1.7,.6),RD,cx,1.0,pz);const pa=A(BX(.5,.3,.05),M(0x111111),cx,1.5,pz+.31),pb=A(BX(.1,.9,.1),DK,cx+.32,1.0,pz+.33);ob(cx-.6,cx+.6,pz-.8,pz+.8);obs[obs.length-1].m=pm;obs[obs.length-1].kd='pump';obs[obs.length-1].extra=[pa,pb];",
  "const pm=RTGS.pumps[pz<cz?0:1];ob(cx-1.2,cx+1.2,pz-.6,pz+.6);if(pm){obs[obs.length-1].m=pm;obs[obs.length-1].kd='pump'}")
R("const sp=dsSign('EL GOBLINO GAS\\nBREAD 12 GOLD','#5a9a2a');sp.position.set(cx-6,0,cz+9);sp.rotation.y=.3;g.add(sp);","")
R("for(const[a,b]of[[sz0,cz-1.3],[cz+1.3,sz1]]){A(BX(.3,H,b-a),WM,sx0,H/2,(a+b)/2);ob(sx0-.2,sx0+.2,a,b)}A(BX(.3,H-2.6,2.6),WM,sx0,H-(H-2.6)/2,cz);",
  "for(const[a,b]of[[sz0,cz-1.3],[cz+1.3,sz1]]){ob(sx0-.2,sx0+.2,a,b)}rtShopB(g);")
R("for(const sd of[-1,1]){const wz=cz+sd*3.5;A(BX(.06,1.1,1.6),new THREE.MeshStandardMaterial({color:0x9ac8e0,transparent:true,opacity:.35,roughness:.1}),sx0,2.2,wz)}","")
# the MINING Co. SHACK billboard pointed at nothing since r606
R("const bb=dsSign('MINING Co. SHACK →\\nMIND THE SHAFT','#c86a1a');bb.position.set(-7,0,-1048);bb.rotation.y=.5;g.add(bb);","")
# the main street, the bus stop shelter and the car wash
R("q.obs=obs;q.props=props;q.anims=anims;try{vehBuild(q,g)}","rtTownB(q,g,obs,props,anims);q.obs=obs;q.props=props;q.anims=anims;try{vehBuild(q,g)}")
# desertLocs: the water tower model (the ladder, perch and tag are in xpMoreTown)
RB("/* ---- the water tower: four legs","/* ---- the wind pump: a tapering","/* ---- the water tower: r657, the Route 13 model ---- */\n rtTowerB(q,g);\n ")
# desertLocs: Motel 13 turned round. The old block drew 1400 random numbers (its car park picture); they are still drawn
RB("{const mx=64,mz=-902,W=24,D=6,","/* ---- the radio mast: a lattice tower","{for(let i=0;i<1400;i++)R();/* r657: the Route 13 model, every prop kept (dx641) */rtMotelB(q,g,STT)}\n ")
# desertLocs: the drive-in's screen, posts and speakers are the models (the picture, the cars and the popcorn stay)
R("for(const sd of[-1,1])A(BX(.5,9,.5),DK,cx+sd*7.55,4.5,cz-8.05);for(const sd of[-1,1])A(BX(.32,.25,.25),DK,cx+sd*7.37,6,cz-8.05);const scr=A(BX(14.5,7,.3),M(0xe8e8e0),cx,6,cz-8);ob(cx-7.5,cx+7.5,cz-8.4,cz-7.6);rect(cx-7.5,cx+7.5,cz-8.4,cz-7.6,'#4a4a4a');","rtDriveB(q,g);")
R("for(let i=0;i<6;i++){const sx=cx-8+i*3.2,sz=cz+4;A(new THREE.CylinderGeometry(.05,.05,1.2,6),MT,sx,.6,sz);A(BX(.3,.25,.15),DK,sx,1.25,sz)}","")
# desertLocs: the depot (the shelter, timetable, arch posts and beam are the model; the portal and its glow stay)
RB("A(BX(4,.15,2),M(0x6a6a6a),x+5,2.6,z+2);","/* a square portal fills the frame","rtDepotB(q,g);")
# the two barrels at the gas station move out of the forecourt's north lane, beside the air post
R("[[44,-996],[45.2,-996.4],[30,-1013],","[[37.4,-1012.4],[38.4,-1012.5],[30,-1013.8],")
# (the one at the forecourt's edge steps off the new kerb; the one by the Desert Bus was on the new platform: it goes to the bus's other side)
R("[-34,-1172],[-80,-1000]]","[-34,-1172],[-89.5,-1000]]")
# the map: forecourt, car wash, shelter, then the shop and the new canopy
R("rect(36,48,-1011,-999,'#d8c8a8');rect(22,34,-1010,-1000,'#5a9a2a')}","rtMap(q);rect(36,48,-1011,-999,'#d8c8a8');rect(20.6,35.4,-1010.6,-999.4,'#3a8a2a')}")
# xpMoreTown: the spray tag goes on the tower's curved panel
R("tag.position.set(tx+3.03,top+2.4,tz);tag.rotation.y=Math.PI/2;g.add(tag);","rtTagUse(q,g,tag,tagT);")
# xpMoreTown: the snack bar and projector booth are the models (their props, the light and the beam stay); no cables
R("A(BX(4,2.6,3),M(0xf0e0c0),bx,1.3,bz);A(BX(4.4,.25,3.4),M(0xc03030),bx,2.7,bz);A(BX(2.6,1,.08),X.GL,bx,1.5,bz-1.52);A(BX(2.8,.12,.5),PK,bx,1.05,bz-1.7);const sl=lab('SNACKS · POPCORN 3 🪙 · GWEEN SODA',4,.6,'#c03030','#fff4d0',50);sl.position.set(bx,2.3,bz-1.55);g.add(sl);ob(bx-2.1,bx+2.1,bz-1.6,bz+1.6);","")
R("A(BX(2.4,2.4,2.4),M(0x6a6a6a),px,1.2,pz);A(BX(2.6,.2,2.6),DK,px,2.5,pz);A(BX(.5,.4,.5),DK,px,2.0,pz-1.3);const lens=A(CY(.18,.22,.3,10),M(0x1a1a2a),px,2.0,pz-1.65);lens.rotation.x=Math.PI/2;ob(px-1.3,px+1.3,pz-1.3,pz+1.3);","")
R("for(let i=0;i<5;i++){const x0=cx-8+i*3.2,x1=x0+3.2;const c=A(BX(3.2,.02,.02),DK,(x0+x1)/2,.95,cz+4);c.position.y=.95-.08;}","")
# xpMoreTown: the motel's back yard is in the model; the ice machine and the washing line keep working
RB("T('motel back',()=>{"," /* Jeff's Oasis: cool your feet */","T('motel back',()=>rtMotelBack(X));\n")
# xpRoadFix: the dead loop round the shack's old spot goes; Motel Rd, the drive-in's drive and Depot Rd come in
R("road(3.5,-1048.5,16.5,-1048.5);road(13,-1045,13,-1079.5);road(3.5,-1076,16.5,-1076);/* round the mining shack, which sits on the old road */",
  "road(56,-922,3.5,-922);road(-20,-912,-3.5,-912);road(-62,-1045,-3.5,-1045);/* r657: Motel Rd, the drive-in's drive and Depot Rd */")
R("const rs=[[-3.5,3.5,-1204,-1186],[3.5,16.5,-1052,-1045],[9.5,16.5,-1079.5,-1045],[3.5,16.5,-1079.5,-1072.5],[3.5,103.5,-1040.5,-1033.5],[96.5,103.5,-1040.5,-1026.5]];",
  "const rs=[[-3.5,3.5,-1204,-1186],[3.5,56,-925.5,-918.5],[-20,-3.5,-915.5,-908.5],[-62,-3.5,-1048.5,-1041.5],[3.5,103.5,-1040.5,-1033.5],[96.5,103.5,-1040.5,-1026.5]];")
# the Highway Patrol route stays on Route 13 instead of the loop
R("[0,-1120],[0,-1076],[13,-1076],[13,-1048.5],[0,-1048.5]];","[0,-1120],[0,-1048.5]];")
# ---------------------------------------------------------------------------------------------------------------
# r658 mesa and gorge (docs/design/mesa-gorge.md, src/dx644.js): xpMesa and xpGorge are redefined in dx644; these are
# the other places the old meshes were built
# ---------------------------------------------------------------------------------------------------------------
# xpGorgeCave: the 46 boulders, the ten sand drifts and the cave mouth's arch are the riverbed and wall models now.
# Their random numbers are still drawn, so everything built after them stays where it was.
R("const b=A(new THREE.DodecahedronGeometry(r,0),M(0x8a6248,{roughness:1}),x,Y+r*.5,z);b.rotation.set(Math.random()*3,Math.random()*3,0);q.deepB.push({x0:x-r*.7,x1:x+r*.7,z0:z-r*.7,z1:z+r*.7})","Math.random();Math.random()")
R("const dr=A(new THREE.SphereGeometry(4+Math.random()*3,10,6,0,Math.PI*2,0,Math.PI/2),M(0xd8b07a,{roughness:1}),x,Y,z);dr.scale.y=.35","Math.random()")
R("const ar=A(BX(GCV.tx1-GCV.tx0+1.6,1,1.4),RKM,(GCV.tx0+GCV.tx1)/2,Y+5.5,z0-.2);A(BX(.8,5,1.4),RKM,GCV.tx0-.4,Y+2.5,z0-.2);A(BX(.8,5,1.4),RKM,GCV.tx1+.4,Y+2.5,z0-.2);","")
# deepOK: the old bridges' two piers were checked here; the new bridges put their posts and piers in q.deepB
R("for(const[b0,b1]of G.bridges){const W=b1-b0,cx=(b0+b1)/2,mz=(G.z0+G.z1)/2;for(const sd of[-1,1]){const px=cx+sd*(W/2+.2);if(Math.abs(x-px)<.3+r&&Math.abs(lz-mz)<.3+r)return false}}","/* r658: the bridges' piers are in q.deepB */")
# T('mesa'): the coin binoculars are the lookout point's model; you stand north of them now, looking south through them.
# The summit book moves to the cairn (q.mgTop.spots.book); its old lectern and book go.
RB("/* the south rim, looking out over the gorge */A(CY(.08,.1,1.2,8),MT,bx,H+.6,bz);","prop(bx,bz-1.2,1.3,","/* r658: the binoculars are the lookout point's model (dx644) */\n  ")
R("prop(bx,bz-1.2,1.3,()=>q.xr?'':'[E] Look through the binoculars","prop(bx,bz+1.2,1.3,()=>q.xr?'':'[E] Look through the binoculars")
_o,_n="P.x=bx;P.z=bz-.6+q.OZ;","P.x=bx;P.z=bz+.6+q.OZ;";assert s.count(_o)==2;s=s.replace(_o,_n)
R("const hx=cx+20,hz=cz-10;prop(hx-4.6,hz,1.3,'[E] Sign the summit book'","const bk=(q.mgTop&&q.mgTop.spots&&q.mgTop.spots.book)||[cx-4.95,cz+6.25];prop(bk[0],bk[1],1.3,'[E] Sign the summit book'")
R("A(BX(.5,.06,.4),M(0xf0e8d0),hx-4.3,H+1.05,hz);A(BX(.6,1.0,.5),PK,hx-4.3,H+.5,hz)})","})")
# T('ziplines'): the two towers and the sign are the model (mgZipIn); the cables, trolleys, prompts and the ride stay
RB("const tower=(z,hiX,loX)=>{for(const[a,b]of[[-1,-1],[1,-1],[1,1],[-1,1]]){rodTo(g,PK,","rect(zx-1.6,zx+1.6,z-1.6,z+1.6,'#8a6a3a');","const tower=(z,hiX,loX)=>{")
R("rect(zx-1.6,zx+1.6,z-1.6,z+1.6,'#8a6a3a');ob(zx-1.6,zx+1.6,z-1.6,z+1.6)};","rect(zx-1.6,zx+1.6,z-1.6,z+1.6,'#8a6a3a')};")
R("tower(zN,.7,-.7);tower(zS,-.7,.7);","tower(zN,.7,-.7);tower(zS,-.7,.7);mgZipIn(q,g);")
R("sign('DEVIL\\'S GORGE ZIPLINE\\nCLIP ON · DON\\'T LOOK DOWN','#c02020',zx+8,zN+4,-.6);","")
# dpGroundMats (r500) swaps big standard materials to Lambert on the cheaper settings: it dropped vertex colours, so the
# vertex-coloured cliffs, canyon walls and riverbed came out white. Keep them.
R("alphaTest:m.alphaTest,depthWrite:m.depthWrite,fog:m.fog});mt.userData=Object.assign({},m.userData,{dpLam:1});","alphaTest:m.alphaTest,depthWrite:m.depthWrite,fog:m.fog,vertexColors:m.vertexColors});mt.userData=Object.assign({},m.userData,{dpLam:1});")
# r659 small sights (docs/design/small-sights.md, src/dx643.js): Jeff's Oasis, the wishing well, the campfire, the wind
# pump, the radio mast, Skull Rock and the meteor crater are the design chat's models; every prop, loc and save is kept
# ---------------------------------------------------------------------------------------------------------------
# the desert floor gets two square holes, filled by the oasis's and the crater's own ground (busBoard0)
R("[QUARRY.x0,QUARRY.x1,QUARRY.z0,QUARRY.z1]]))gp(a,b,c,d)}","[QUARRY.x0,QUARRY.x1,QUARRY.z0,QUARRY.z1]].concat(ssCuts())))gp(a,b,c,d)}")
# busRoamBuild: Jeff's Oasis (the old pool, its square wall, the palms, the sign, the crate and the jar); the tip prop stays
RB("{const ox=-38,oz=-1030;const pool=","props.push({x:ox+8.5,z:oz+4,r:1.8","{const ox=-38,oz=-1030;ssOasisB(q,g,obs,props,M,st);\n  ")
# busRoamBuild: the wishing well (drum, black disc, posts, roof slab, rod; the model has the obstacle); the toss prop stays
R("A(new THREE.CylinderGeometry(1.1,1.2,1.0,14),M(0x8a7a6a),wx,.5,wz);A(new THREE.CylinderGeometry(.85,.85,.2,14),M(0x101010),wx,.95,wz);for(const sx of[-1,1])A(BX(.14,2.4,.14),PK,wx+sx*.9,1.6,wz);A(BX(2.4,.14,1.6),PK,wx,2.9,wz);A(new THREE.CylinderGeometry(.08,.08,2.0,8),M(0x8a6a3a),wx,2.3,wz).rotation.z=Math.PI/2;ob(wx-1.2,wx+1.2,wz-1.2,wz+1.2);",
  "ssWellB(q,g,obs,anims);")
# busRoamBuild: the campfire's stones and logs, the tent and the first bench (the flame, its light, the sparks and the prop stay)
RB("{const fx=18,fz=-1105;for(let i=0;i<6;i++){const a=i/6*Math.PI*2;A(new THREE.DodecahedronGeometry(.3,0)","const fire=glowSp(0xff8020,.9,2.2);","{const fx=18,fz=-1105;ssCampB(q,g,obs,anims);\n  ")
RB("ob(fx-1,fx+1,fz-1,fz+1);const tt=new THREE.Group();tt.position.set(fx+4,0,fz-2);","props.push({x:fx,z:fz,r:2.2,txt:()=>'[E] Warm your hands'","ob(fx+2.4,fx+5.6,fz-3.8,fz-.2);/* r659: the tent's box; the fire ring, tent and benches are ssCampfire */")
# desertLocs: the wind pump (the trough, the wheel, the tower; the creak only near it)
RB("/* ---- the wind pump: a tapering four-leg tower","/* ---- MOTEL 13:","/* ---- the wind pump: r659, the small-sights model (ssWindPump) ---- */\n ssPumpB(q,g);\n ")
# desertLocs: the radio mast's legs, beacon, the hut's walls, roof, floor, glass and door (the furniture, props and map stay)
RB("{const rx=-62,rz=-905,H=28;for(let i=0;i<3;i++)","const bl=A(new THREE.SphereGeometry(.25,8,6)","{const rx=-62,rz=-905,H=28;const SR=ssMastB(q,g);")
R("const bl=A(new THREE.SphereGeometry(.25,8,6),M(0x401010,{emissive:0xff2020}),rx,H+.3,rz);","const bl=SR.parts.beacon,bm=SR.parts.mid;")
R("bl.material.emissive.setHex(on?0xff2020:0x200000)})","bl.material.emissive.setHex(on?0xff2020:0x200000);bm.material.emissive.setHex(on?0xff2020:0x200000)})")
R("A(BX(4.4,.2,3.8),M(0x6a6a6a),rx+5,2.7,rz+1);rect(x0,x1,z0,z1,'#9a9a90');A(BX(3.9,.03,3.3),M(0x7a6a5a),rx+5,.02,rz+1);","rect(x0,x1,z0,z1,'#9a9a90');")
R("WALL('x',x0,x1,z1,2.6,HM,[[rx+4.55,rx+5.45,2.05],[rx+5.9,rx+6.7,2.0,1.2]]);glass('x',rx+5.9,rx+6.7,z1,1.2,2.0);WALL('x',x0,x1,z0,2.6,HM);WALL('z',z0,z1,x0,2.6,HM);WALL('z',z0,z1,x1,2.6,HM);","/* r659: the hut's walls, roof, floor and door are ssRadioMast */")
R("const dr=A(BX(.9,1.95,.05),M(0x4a5a6a),rx+4.6,1.0,z1-.5);dr.rotation.y=Math.PI/2;dr.position.x=rx+4.58;","")
R("mp.position.set(x1-.12,1.5,rz+1);mp.rotation.y=-Math.PI/2;g.add(mp);","{const s=SR.spots.map;mp.position.set(s[0],s[1],s[2]);mp.rotation.y=Math.PI;g.add(mp)}")
# desertLocs: Skull Rock (the old skull, its square wall and map box); the shout prop moves into the mouth
RB("{const sx=76,sz=-960,BN=M(0xd8c8a4","q.props.push({x:sx,z:sz+6.6,r:2.2,txt:()=>'[E] Shout into the mouth'","{const sx=76,sz=-960,SK=ssSkullB(q,g);\n  ")
R("q.props.push({x:sx,z:sz+6.6,r:2.2,txt:()=>'[E] Shout into the mouth'","q.props.push(SSX.shout={x:SK.spots.shout[0],z:SK.spots.shout[1],r:2.2,txt:()=>'[E] Shout into the mouth'")
# pyrBuild: the meteor crater (rim, pit, the spinning rock); the glow stays, down in the bowl; the prop moves to the model's spot
RB("const rim=A(new THREE.TorusGeometry(6,1.1,6,24),M(0x9a7a50),kx,-.2,kz);","q.locs.push({nm:'Meteor crater'","const KC=ssCraterB(q,g);const gl=glowSp(0x40ff70,.5,3.5);gl.position.set(kx,ssCraterH(kx,kz)+.9,kz);g.add(gl);q.anims.push(dt=>{gl.scale.setScalar(3+Math.sin(q.rt*4)*.4);ssCraterPulse(KC,q)});\n  ")
R("q.props.push({x:kx+1.4,z:kz,r:1.6,txt:()=>'[E] Touch the glowing rock'","q.props.push(SSX.touch={x:kx+1.6,z:kz,r:1.6,txt:()=>'[E] Touch the glowing rock'")
R("vfx('sparkle',kx,1,kz+q.OZ,{n:30,c:0x40ff70,up:1})","vfx('sparkle',kx,-.3,kz+q.OZ,{n:30,c:0x40ff70,up:1})")
# xpMoreTown: the wind pump's crank, pipes and spout are the model's; the stream comes out of its spout into the stock tank
RB("T('wind pump',()=>{const px=-55,pz=-1000;A(BX(.56,1.25,.56)","const stream=glowSp(0x6ad0ff,0,1.2);","T('wind pump',()=>{const px=-55,pz=-1000,SP=SSX.res.pump,crank=SP?SP.parts.crank:new THREE.Group(),SPT=SP?SP.spots.spout:[px+2.34,.5,pz];")
R("stream.position.set(px+2.34,.5,pz);g.add(stream);const trough=g.children.find(o=>o.isMesh&&o.geometry.type=='BoxGeometry'&&Math.abs(o.position.x-(px+3.2))<.01&&Math.abs(o.position.y-.4)<.01);",
  "stream.position.set(SPT[0],SPT[1],SPT[2]);g.add(stream);const trough=SP?SP.parts.water:null;")
R("stream.scale.set(.5,1.4+Math.sin(q.rt*25)*.2,1);if(trough)trough.position.y=.4+Math.min(.1,(20-t)*.008);if(Math.random()<dt*8)try{vfx('spark',px+2.34+(R()-.5)*.3,.5,pz+q.OZ,{n:1,c:0x80d0ff})}catch(e){}",
  "stream.scale.set(.3,.55+Math.sin(q.rt*25)*.08,1);if(trough)trough.position.y=.42+Math.min(.1,(20-t)*.008);if(Math.random()<dt*8)try{vfx('spark',SPT[0]+(R()-.5)*.3,.5,SPT[2]+q.OZ,{n:1,c:0x80d0ff})}catch(e){}")
R("prop(px-.9,pz+1.4,1.4,()=>t>0?","prop(SP?SP.spots.crank[0]:px-.9,SP?SP.spots.crank[1]:pz+1.4,1.4,()=>t>0?")
# xpMoreTown: the campfire's guitar and second bench are in the model (the marshmallow stick and the three props stay)
RB("const gt=new THREE.Group();gt.position.set(fx-2.6,.62,fz+2.3);","const stick=A(CY(.012,.012,1.3,5)","")
R("prop(fx-2.6,fz+3.2,1.3,'[E] Strum the guitar'","prop(fx-2.6,fz+2.2,1.3,'[E] Strum the guitar'")
R("const bn2=new THREE.Group();bn2.position.set(fx+2.8,0,fz+2.4);bn2.rotation.y=-1.1;g.add(bn2);const pl=new THREE.Mesh(BX(2.2,.12,.45),PK);pl.position.y=.5;bn2.add(pl);for(const ex of[-.8,.8]){const st2=new THREE.Mesh(new THREE.CylinderGeometry(.18,.2,.44,10),M(0x6a4a2a));st2.position.set(ex,.22,0);bn2.add(st2)}ob(fx+1.8,fx+3.8,fz+1.6,fz+3.2)});","});")
# xpMoreTown: the bucket goes down the well and back up while you wind it
R("busy=1;for(let i=0;i<6;i++)setTimeout(()=>snd(200+i*30,.08),i*220);","busy=1;ssWellGo();for(let i=0;i<6;i++)setTimeout(()=>snd(200+i*30,.08),i*220);")
# xpMoreTown: the five fragments are the model's stones, sitting on the ground (the first is on the rim's outer slope); the crater's own badge
R("const fr=A(new THREE.DodecahedronGeometry(.28,0),M(0x1a3a1a,{emissive:0x30ff60,emissiveIntensity:.8}),px,.22,pz);const gl=glowSp(0x40ff70,.45,1.4);gl.position.set(px,.4,pz);g.add(gl);anim(px,pz,30,dt=>{fr.rotation.y+=dt;gl.scale.setScalar(1.3+Math.sin(q.rt*5+i)*.2)});",
  "const fy=ssCraterH(px,pz),fr=ssFragB(g,px,fy,pz);const gl=glowSp(0x40ff70,.45,1.4);gl.position.set(px,fy+.4,pz);g.add(gl);anim(px,pz,30,dt=>{gl.scale.setScalar(1.3+Math.sin(q.rt*5+i)*.2)});")
R("if(n>=5){gold+=40;try{saveGame();badge('stars')}","if(n>=5){gold+=40;try{saveGame();badge('meteor')}")
R("const kp=q.props.find(p=>Math.abs(p.x-(kx+1.4))<.01&&Math.abs(p.z-kz)<.01);","const kp=SSX.touch||q.props.find(p=>Math.abs(p.x-(kx+1.4))<.01&&Math.abs(p.z-kz)<.01);")
# xpMoreTown: Skull Rock's bats fly out of the mouth; the eye socket is reached from the ledge at the top of the steps
R("T('skull rock',()=>{const sx=76,sz=-960;const bats=[];","T('skull rock',()=>{const sx=76,sz=-960,SKR=SSX.res.skull,BT=SKR?SKR.spots.bats:[sx,5.7,sz+5.2];const bats=[];")
R("b.position.set(sx+(R()-.5)*3,5.7,sz+5.2);b.visible=false;","b.position.set(BT[0]+(R()-.5)*.6,BT[1],BT[2]);b.visible=false;")
R("b.position.set(sx+Math.cos(a)*(2+i*.7)*(1-t*.3),5.7+(6-bt)*1.4*(1+i*.1),sz+5.2+Math.sin(a*1.3)*3);",
  "{const k=6-bt,o=Math.min(1,Math.max(0,(k-1.2)/1.5));b.position.set(BT[0]+Math.cos(a)*(.25+(1.7+i*.7)*o)*(1-t*.3),BT[1]+Math.max(0,k-1)*1.5*(1+i*.1),BT[2]+Math.min(k,1.2)*2.6+Math.sin(a*1.3)*3*o)}")
R("const sp=q.props.find(p=>Math.abs(p.x-sx)<.01&&Math.abs(p.z-(sz+6.6))<.01);","const sp=SSX.shout||q.props.find(p=>Math.abs(p.x-sx)<.01&&Math.abs(p.z-(sz+6.6))<.01);")
R("prop(sx-2.3,sz+6.3,1.4,()=>SV.skEye?","prop(SKR?SKR.spots.eye[0]:sx-2.3,SKR?SKR.spots.eye[1]:sz+6.3,SKR?.95:1.4,()=>SV.skEye?")
# xpMoreTown: dip your feet from the oasis bank
R("T('oasis',()=>{const[ox,oz]=freeSpot(q,-33.5,-1030,.5);","T('oasis',()=>{const[ox,oz]=ssDipSpot(q);")
# xpMoreTown: the mast's platform and rings are the model's; climb at the ladder's foot, the perch on the platform
R("A(BX(2.2,.08,2.2),MT,rx,16,rz);for(let i=0;i<8;i++){const a=i/8*Math.PI*2;A(BX(.04,.9,.04),MT,rx+Math.cos(a)*1.1,16.5,rz+Math.sin(a)*1.1)}A(new THREE.TorusGeometry(1.1,.02,5,24),MT,rx,16.95,rz).rotation.x=Math.PI/2;",
  "const SM2=ssMast(),CL=SM2.spots.climb,PE=SM2.spots.perch;")
R("prop(rx+1.9,rz+1.9,1.3,'[E] Climb the mast (don\\'t look down)',()=>xmPerch(q,{x:rx+.6,z:rz,y:16.1,yaw:.7,pitch:.12,dx:rx+1.9,dz:rz+1.9,",
  "prop(CL[0],CL[1],1.3,'[E] Climb the mast (don\\'t look down)',()=>xmPerch(q,{x:PE[0],z:PE[2],y:PE[1],yaw:.7,pitch:.12,dx:CL[0],dz:CL[1],")
# r659: every floor piece starts its sand pattern from the same world origin (it started at each piece's own corner, so the
# big light/dark patches had seams wherever the floor is cut: the gorge, the quarry, and now the oasis and crater patches)
R("t2.repeat.set((x1-x0)/10,(z1-z0)/10);","t2.repeat.set((x1-x0)/10,(z1-z0)/10);t2.offset.set(x0/10,-z1/10);")
# r660 desert map (docs/design/desert-map.md, src/dx645.js)
# the base map hands over to the new one (dm2Draw); if that ever throws, the old one takes over for the rest of the ride
R("function dmapDraw(q,cv,cx,cz,sc,full){const x=cv.getContext('2d')","function dmapDraw(q,cv,cx,cz,sc,full){if(typeof DM2!='undefined'&&DM2.on)try{return dm2Draw(q,cv,cx,cz,sc,full)}catch(e){DM2.on=false;conLog('error','map: '+e.message)}const x=cv.getContext('2d')")
# the big map's view comes from one place (DMAPV / dmapView), in dmapFull and in dmapTick
_o,_n=("dmapDraw(q,DMAP.fc,(DMAP.zm||1)>1.01?P.x+(DMAP.px||0):0,(DMAP.zm||1)>1.01?P.z-q.OZ+(DMAP.pz||0):-1310,900/1380*(DMAP.zm||1),1)","dmapFullDraw(q)");assert s.count(_o)==2;s=s.replace(_o,_n)
# room under the map for the toggles and the key of colours
R("innerHeight/zm-(sh?62:130)","innerHeight/zm-(sh?62:172)")
# roads say what they are on the map (asphalt or dirt); the two colours stay as the fallback
R("rect(r.x0,r.x1,r.z0,r.z1,r.dirt?'#8a6a44':'#4a4440');","rect(r.x0,r.x1,r.z0,r.z1,r.dirt?'#8a6a44':'#4a4440');{const _m=q.mapR&&q.mapR[q.mapR.length-1];if(_m&&_m.x0===r.x0&&_m.z0===r.z0)_m.road=r.dirt?'dirt':'asphalt'}")
import base64 as _b64
_fw=','.join("%s:'%s'"%(w,_b64.b64encode(open(S+'fonts/w%s.woff2'%w,'rb').read()).decode()) for w in (400,600,700,800))
_fjs=("<script>/* r604: the game's font, Barlow Semi Condensed (SIL Open Font License), built in */(function(){const W={%s};"
 "for(const w in W){try{const b=atob(W[w]),a=new Uint8Array(b.length);for(let i=0;i<b.length;i++)a[i]=b.charCodeAt(i);"
 "const f=new FontFace('DoorsSans',a.buffer,{weight:w});document.fonts.add(f);f.load().catch(()=>{})}catch(e){}}})();</script>")%_fw
_fjs+='<style>/* r604: the default for anything that does not set its own font */body,button,input,select,textarea{font-family:'+FONTF+'}</style>'
k=s.index('<title>DOORS</title>')+len('<title>DOORS</title>');s=s[:k]+_fjs+s[k:]
print('font: replaced',_fn[0],'font settings')
import base64
_fb=base64.b64encode(open(S+'figmus.mp3','rb').read()).decode()
k=s.rfind('</body>');s=s[:k]+'<script id="figMus" type="text/plain">'+_fb+'</script>\n'+s[k:]
_lv=base64.b64encode(open(S+'likevid.mp4','rb').read()).decode()
k=s.rfind('</body>');s=s[:k]+'<script id="likeVid" type="text/plain">'+_lv+'</script>\n'+s[k:]
s=re.sub(r"const BUILD='[^']*';","const BUILD='2026-10-23 r659';",s,count=1)
open(OUTF,'w').write(s)
for i,m in enumerate(re.finditer(r'<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>',s,re.S)):
    js=m.group(1)
    if len(js)<20 or re.match(r'\s*[A-Za-z0-9+/=]{200}',js):continue
    open(ROOT+'/out/chk%d.js'%i,'w').write(js);print(len(js),subprocess.run(['node','--check',ROOT+'/out/chk%d.js'%i],capture_output=True,text=True).stderr[:400] or 'ok')
