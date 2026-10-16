/* r599: a CHANGELOG button on the main menu. It wears a red ! until you have opened it since the last update (or when a newer build is out). */
function chlSeen(){try{return localStorage.getItem('doorsChSeen')||''}catch(e){return SV.chSeen||''}}
function chlNew(){const top=CHLOG&&CHLOG[0]?CHLOG[0][0]:'';return(top&&chlSeen()!==top)||!!(typeof CHB!='undefined'&&CHB.nw)}
function chlOpen(){const top=CHLOG[0][0];try{localStorage.setItem('doorsChSeen',top)}catch(e){}try{SV.chSeen=top}catch(e){}
 document.querySelectorAll('.chl-badge').forEach(b=>{if(!(typeof CHB!='undefined'&&CHB.nw))b.remove()});
 let d=document.getElementById('chlDlg');if(d)d.remove();d=document.createElement('div');d.id='chlDlg';
 d.style.cssText='position:fixed;inset:0;z-index:400;background:#000a;display:flex;align-items:center;justify-content:center';
 d.innerHTML='<div style="width:min(520px,92vw);max-height:82vh;overflow:auto;background:#1f3a2c;border:3px solid #5a3418;border-radius:12px;padding:14px 18px;font:15px Georgia,serif;color:#eef4ee;box-shadow:0 6px 30px #000c;line-height:1.38;position:relative">'+
  '<button id="chlX" style="position:sticky;top:0;float:right;font:bold 18px Georgia;background:#5a3418;color:#ffe9a8;border:2px solid #d4a850;border-radius:8px;padding:2px 10px;cursor:pointer">✕</button>'+chbHtml()+'</div>';
 for(const ev of['mousedown','mouseup','click','touchstart','keydown'])d.addEventListener(ev,e=>e.stopPropagation());d.addEventListener('click',e=>{if(e.target===d)d.remove()});document.body.appendChild(d);d.querySelector('#chlX').onclick=()=>d.remove()}
{const mb9=menuBtns;menuBtns=function(){let h=mb9.apply(this,arguments);try{
  const btn='<button onclick="event.stopPropagation();chlOpen()" class="mnu-sm" style="position:relative;background:#1f3a2c;color:#e8f4e0;border-color:#8ac07a">📋 CHANGELOG'+(chlNew()?'<span class="chl-badge" style="position:absolute;top:-8px;right:-8px;width:22px;height:22px;border-radius:50%;background:#e02020;color:#fff;font:bold 15px/22px Arial;text-align:center;box-shadow:0 0 6px #f00a;border:2px solid #fff">!</span>':'')+'</button>';
  const k='💾 SAVE</button>',i=h.indexOf(k);h=i>=0?h.slice(0,i+k.length)+btn+h.slice(i+k.length):h+btn}catch(e){}return h}}
/* a newer build turning up while the menu is open lights the badge too */
setInterval(()=>{try{if(typeof CHB!='undefined'&&CHB.nw)document.querySelectorAll('button').forEach(b=>{if(/CHANGELOG/.test(b.textContent)&&!b.querySelector('.chl-badge'))b.insertAdjacentHTML('beforeend','<span class="chl-badge" style="position:absolute;top:-8px;right:-8px;width:22px;height:22px;border-radius:50%;background:#e02020;color:#fff;font:bold 15px/22px Arial;text-align:center;box-shadow:0 0 6px #f00a;border:2px solid #fff">!</span>')})}catch(e){}},5000);
setTimeout(()=>{try{chbNet()}catch(e){}},2500);setInterval(()=>{try{chbNet()}catch(e){}},300000);
/* ---------- the desert map: click (or tap) a place's icon to WARP there ---------- */
function dmapWarpWire(){const D=DMAP;if(!D||!D.fc||D.fc.dataset.warp)return;D.fc.dataset.warp=1;D.fc.style.cursor='pointer';
 D.fc.addEventListener('click',e=>{try{e.stopPropagation();if(D.dragMoved){D.dragMoved=0;return}const q=BUS.ride;if(!q||!q.roam||!DMAP.open)return;const fc=D.fc,r=fc.getBoundingClientRect(),px=(e.clientX-r.left)*fc.width/r.width,py=(e.clientY-r.top)*fc.height/r.height;
  const zm=D.zm||1,cx=zm>1.01?P.x+(D.px||0):0,cz=zm>1.01?P.z-q.OZ+(D.pz||0):-1310,sc=900/1380*zm,W=fc.width,H=fc.height,R2=zm>=1.6?17:14;
  const MAJ=/^(Desert PD|Dusty Gulch|Airfield|Lookout Mesa|Old Quarry|Dark Zone 51|Mirage Lake|Speedway|Observatory|Dino Dan|Wind farm|Solar farm|Goblino's Scrap|The Pyramid|Motel 13|Devil's Gorge|Desert Bus depot|Jump ramps|X marks|Dark Penitentiary)/;
  let best=null,bd=1e9;for(const l of q.locs||[]){if(!(MAJ.test(l.nm)||zm>=1.6))continue;const d=Math.hypot(W/2+(l.x-cx)*sc-px,H/2+(l.z-cz)*sc-py);if(d<R2+6&&d<bd){bd=d;best=l}}if(!best)return;dmapWarp(q,best)}catch(err){conLog('error','map warp: '+err.message)}})}
function dmapWarp(q,l){const no=m=>{hint(m);try{snd(180,.08)}catch(e){}};
 if(q.jail||(q.pen&&q.pen.on)||penArea(P.x,P.z-q.OZ))return no('⛓️ No warping out of prison.');if(q.seat||q.inBus)return no('🚗 Get out of the vehicle first, then warp.');if(q.deep)return no('⛏️ Not from down the mine. Ride the cage up first.');
 if((q.heat|0)>=20)return no('🚨 Lose the cops first: you cannot warp while you are wanted.');if(q.xr||q.kp||q.court||q.lift||q.icut||q.bcut||q.fling)return no('Finish what you are doing first.');
 /* somewhere to stand near the place: clear of walls and things, on open ground */const free=(x,z)=>{for(const o of obsNear(q,x,z))if(!o.off&&!o.veh&&x>o.x0-.6&&x<o.x1+.6&&z>o.z0-.6&&z<o.z1+.6)return false;try{if(vehHit(q,x,z,.6))return false}catch(e){}return Math.abs(vehGround(q,x,z))<30};
 let tx=l.x,tz=l.z+6;outer:for(const rr of[6,9,13,18,24,32])for(let a=0;a<16;a++){const x=l.x+Math.sin(a/16*Math.PI*2)*rr,z=l.z+Math.cos(a/16*Math.PI*2)*rr;if(free(x,z)){tx=x;tz=z;break outer}}
 try{bsF.style.transition='opacity .25s';bsF.style.background='#000';bsF.style.opacity=1}catch(e){}try{snd(520,.1);setTimeout(()=>snd(780,.1),90)}catch(e){}
 setTimeout(()=>{try{P.x=tx;P.z=tz+q.OZ;P.dy=vehGround(q,tx,tz);P.yaw=Math.atan2(-(l.x-tx),-(l.z-tz));if(DMAP.open)dmapFull(q);hint('✨ Warped to '+l.ic+' '+l.nm+'.');bsF.style.transition='opacity .6s';bsF.style.opacity=0}catch(e){}},280)}
{const df0=dmapFull;dmapFull=function(q){const r=df0.apply(this,arguments);try{dmapWarpWire()}catch(e){}return r}}

/* ---------- drag the zoomed-in map around ---------- */
function dmapDragWire(){const D=DMAP;if(!D||!D.fc||D.fc.dataset.drag)return;D.fc.dataset.drag=1;const fc=D.fc;let st=null;
 const down=(x,y)=>{if((D.zm||1)<=1.01)return;st={x,y,px:D.px||0,pz:D.pz||0,m:0}};
 const move=(x,y)=>{if(!st)return;const r=fc.getBoundingClientRect(),k=fc.width/r.width,sc=900/1380*(D.zm||1),dx=(x-st.x)*k,dy=(y-st.y)*k;if(Math.hypot(dx,dy)>5)st.m=1;D.px=st.px-dx/sc;D.pz=st.pz-dy/sc;fc.style.cursor='grabbing';/* redraw at once, every animation frame, instead of waiting for the next map tick */if(!D.raf)D.raf=requestAnimationFrame(()=>{D.raf=0;try{const q=BUS.ride;if(q&&D.open)dmapDraw(q,D.fc,P.x+(D.px||0),P.z-q.OZ+(D.pz||0),900/1380*(D.zm||1),1)}catch(e){}})};
 const up=()=>{if(st&&st.m)D.dragMoved=1;st=null;fc.style.cursor='pointer'};
 fc.addEventListener('mousedown',e=>{e.stopPropagation();down(e.clientX,e.clientY)});addEventListener('mousemove',e=>move(e.clientX,e.clientY));addEventListener('mouseup',up);
 fc.addEventListener('touchstart',e=>{if(e.touches.length==1)down(e.touches[0].clientX,e.touches[0].clientY);else st=null},{passive:true});fc.addEventListener('touchmove',e=>{if(e.touches.length==1)move(e.touches[0].clientX,e.touches[0].clientY)},{passive:true});fc.addEventListener('touchend',up)}
{const df1=dmapFull;dmapFull=function(q){const r=df1.apply(this,arguments);try{dmapDragWire();if(DMAP.open){DMAP.px=0;DMAP.pz=0}}catch(e){}return r}}
/* zoomed all the way out, the map recentres */setInterval(()=>{try{if(typeof DMAP!='undefined'&&(DMAP.zm||1)<=1.01){DMAP.px=0;DMAP.pz=0}}catch(e){}},500);
/* ---------- a 1-in-100 find deep in the quarry mine: an old shaft down to the DESERT MINES, straight to door 60 ---------- */
const DME={pend:0,at:null};
{const mg9=mnGen;mnGen=function(q,sd){const r=mg9.apply(this,arguments);try{MN.dme=null;const R=mnRnd(((MN.seed|0)^0x5eed)>>>0);if(R()<.01||window.DME_FORCE)dmeBuild(q,R)}catch(e){conLog('error','desert mines entry: '+e.message)}return r}}
function dmeBuild(q,R){const N=MN.N,C=MN.cells,CS=MN.C,Y=MN.Y,g=MN.g;if(!C||!g)return;let best=null,bd=-1;
 for(let k=0;k<N*N;k++){if(!C[k])continue;const i=k%N,j=k/N|0;const[x,z]=mnXZ(k),d=Math.hypot(x-MN.ox,z-MN.oz);if(d<=bd||mnPit(x,z))continue;for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){const ni=i+a,nj=j+b;if(ni<0||nj<0||ni>=N||nj>=N||!C[nj*N+ni]){best={x,z,a,b};bd=d;break}}}
 if(!best)return;const{x,z,a,b}=best,wx=x+a*(CS/2-.32),wz=z+b*(CS/2-.32),ry=Math.atan2(-a,-b);const G=new THREE.Group();G.position.set(wx,Y,wz);G.rotation.y=ry;g.add(G);
 const TM=new THREE.MeshStandardMaterial({color:0x5a3a1e,roughness:.9}),add=(geo,m,px,py,pz)=>{const o=new THREE.Mesh(geo,m);o.position.set(px,py,pz);G.add(o);return o};
 /* a timbered portal, a black passage going down, rails into it, a lamp, and a painted board */for(const s of[-1,1])add(new THREE.BoxGeometry(.3,3,.3),TM,s*1.1,1.5,0);add(new THREE.BoxGeometry(2.6,.32,.36),TM,0,3.05,0);
 add(new THREE.BoxGeometry(1.95,2.85,.05),new THREE.MeshBasicMaterial({color:0x000000}),0,1.43,-.12);for(const s of[-.45,.45])add(new THREE.BoxGeometry(.07,.07,2.2),new THREE.MeshStandardMaterial({color:0x6a6e74,metalness:.8}),s,.05,1);for(let t=0;t<4;t++)add(new THREE.BoxGeometry(1.3,.06,.18),TM,0,.03,.2+t*.55);
 const lmp=add(new THREE.SphereGeometry(.12,8,6),new THREE.MeshBasicMaterial({color:0xffc060}),.85,2.6,.3);{const gl=glowSp(0xffb040,.7,1.6);gl.position.set(.85,2.6,.3);G.add(gl)}
 {const c=document.createElement('canvas');c.width=512;c.height=160;const k=c.getContext('2d');k.fillStyle='#3a2a14';k.fillRect(0,0,512,160);k.strokeStyle='#e0b050';k.lineWidth=6;k.strokeRect(6,6,500,148);k.fillStyle='#ffd860';k.font='bold 54px Georgia';k.textAlign='center';k.fillText('⬇ DESERT MINES',256,72);k.font='bold 40px Georgia';k.fillStyle='#ffe9b0';k.fillText('DOOR 60',256,128);
  const m=add(new THREE.PlaneGeometry(2.2,.7),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c)}),0,3.6,.2)}
 const px=wx-a*1.3,pz=wz-b*1.3;MN.dme={x:px,z:pz};
 q.props.push({x:px,z:pz,r:1.8,deep:1,mn:1,txt:()=>{if(q.deep!==5)return'';if(MP.on&&mpOpen().length){const n=dmeHere(q),need=mpOpen().length;if(!MP.host)return'⛏️ An old shaft down to the DESERT MINES (door 60). The host leads the way down. ('+n+'/'+need+' others here)';return n<need?'⛏️ The DESERT MINES shaft (door 60). Waiting for everyone: '+n+'/'+need+' here':'[E] ⬇️ Everyone is here: go down to the DESERT MINES, door 60'}return'[E] ⬇️ Climb down the old shaft to the DESERT MINES (door 60)'},act:()=>dmeGo(q)});
 setTimeout(()=>{try{if(q.deep===5)hint('⛏️ You hear wind whistling up from somewhere deep in this mine... an old shaft?')}catch(e){}},4000)}
function dmeHere(q){let n=0;const E=MN.dme;if(!E)return 0;for(const id in (q.vnet&&q.vnet.rem)||{}){const r=q.vnet.rem[id];if(Date.now()-r.t<3500&&Math.hypot(r.x-E.x,r.z-E.z)<7)n++}return n}
function dmeGo(q){if(q.deep!==5||!MN.dme)return;if(MP.on&&mpOpen().length){if(!MP.host){hint('⛏️ The host leads the way down. Wait here for them.');return}if(dmeHere(q)<mpOpen().length){hint('⛏️ Wait for everyone to get to the shaft first.');snd(180,.06);return}try{mpSend({t:'dmeGo'})}catch(e){}}
 DME.pend=60;snd(90,.6);hint('⬇️ Down the old shaft... to the DESERT MINES.');setTimeout(()=>{try{busRideEnd()}catch(e){conLog('error','desert mines shaft: '+e.message)}},MP.on&&MP.host?1400:300)}
{const mm9=mpMsg;mpMsg=function(key,o){if(o&&o.t=='dmeGo'){try{if(BUS.ride&&!BUS.ride.done){DME.pend=60;hint('⬇️ The host is taking everyone down the old shaft to the DESERT MINES...');busRideEnd()}}catch(e){}return}
 if(o&&o.t=='dme60'){try{if(DSRT.on&&n<(o.n|0)){const g=gsClean(o.gs);if(g)for(const kk in g)if(+kk>0)MP.gs[kk]=g[kk];mpWarpTo(o.n|0);DME.pend=0}}catch(e){}return}return mm9.apply(this,arguments)}}
/* once the run is under way, jump to door 60 */setInterval(()=>{try{if(!DME.pend||state!='play'||!DSRT.on||!RMS.length)return;const k=DME.pend;DME.pend=0;if(n<k){mpWarpTo(k);hint('⛏️ The old shaft comes out at DOOR '+k+' of the Desert Mines!');if(MP.on&&mpOpen().length)mpSend({t:'dme60',s:mpS(),n:k,gs:gsPackAll(MP.gs||{})})}}catch(e){conLog('error','desert mines door 60: '+e.message)}},700);
/* ---------- a HIGH-SECURITY door in the back of each general's office, through to the back of their Wraith bay ---------- */
{const cb9=cwBuild;cwBuild=function(q){const r=cb9.apply(this,arguments);try{cwBayDoors(q)}catch(e){conLog('error','office-bay doors: '+e.message)}return r}}
function cwBayDoors(q){const C=q.cw,B=q.wbay;if(!C||!B||C.bd)return;C.bd=[];const Z=CWB,H=3.4,BH=5.2,t=.3,dw=1.3;const xs=[0,1,2,3].map(i=>Z.x0+i*10+8.0);
 const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.7,metalness:.2},o||{}));const CON=M(0x8a8c80),BCON=M(0x7c7e74),ST=M(0x6a7076,{metalness:.7,roughness:.35}),YB=M(0xd8b020),BK=M(0x1a1a1a);
 const add=(g,w,h,d,m,x,y,z)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);g.add(o);return o},ob=(x0,x1,z0,z1)=>{const o={x0:Math.min(x0,x1),x1:Math.max(x0,x1),z0:Math.min(z0,z1),z1:Math.max(z0,z1)};q.obs.push(o);return o};
 /* cut the two long walls (the offices' back wall and the bays' front wall) into pieces with a gap at each door */const cut=(g,zw,h,mat,x0,x1)=>{for(const c of g.children.slice()){const p=c.position;if(c.isMesh&&Math.abs(p.z-zw)<.05&&Math.abs(p.y-h/2)<.05&&c.geometry.parameters&&Math.abs(c.geometry.parameters.width-(x1-x0))<.05)g.remove(c)}
  for(let i=q.obs.length-1;i>=0;i--){const o=q.obs[i];if(Math.abs(o.x0-x0)<.05&&Math.abs(o.x1-x1)<.05&&Math.abs((o.z0+o.z1)/2-zw)<.05)q.obs.splice(i,1)}
  let a=x0;for(const x of xs){const b=x-dw/2;add(g,b-a,h,t,mat,(a+b)/2,h/2,zw);ob(a,b,zw-t/2,zw+t/2);add(g,dw,h-2.6,t,mat,x,2.6+(h-2.6)/2,zw);a=x+dw/2}add(g,x1-a,h,t,mat,(a+x1)/2,h/2,zw);ob(a,x1,zw-t/2,zw+t/2)};
 cut(C.g,Z.z1,H,CON,Z.x0,Z.x1);cut(B.g,WBAY.z0,BH,BCON,WBAY.x0,WBAY.x0+WBAY.w*WBAY.n);
 for(let i=0;i<4;i++){const x=xs[i],z0=Z.z1,z1=WBAY.z0;/* the little airlock between the buildings *//* the airlock walls sit between the two buildings' walls and just outside the doorway, so no faces overlap */const zi0=z0+.16,zi1=z1-.16,L2=zi1-zi0;for(const sd of[-1,1]){add(C.g,.12,2.6,L2,ST,x+sd*(dw/2+.07),1.3,(zi0+zi1)/2);ob(x+sd*(dw/2)-.04,x+sd*(dw/2)+.13*sd,z0,z1)}add(C.g,dw+.26,.1,L2,ST,x,2.66,(zi0+zi1)/2);add(C.g,dw,.04,L2,M(0x3a3c3e),x,.03,(zi0+zi1)/2);
  /* the door itself: a thick steel slab with yellow and black edges that slides into the wall, a keypad, a light */const dg=new THREE.Group();dg.position.set(x,0,z0-.02);C.g.add(dg);add(dg,dw,2.55,.14,ST,0,1.28,0);for(let k=0;k<6;k++)add(dg,dw,.08,.16,k%2?YB:BK,0,.12+k*.09,0);add(dg,.06,1.6,.16,M(0x2a2e32,{metalness:.8}),.45,1.4,0);for(const y of[.6,1.3,2.0])add(dg,dw*.9,.04,.17,M(0x8a9096,{metalness:.8}),0,y,0);
  const kp=add(C.g,.22,.3,.06,M(0x1a1a1a),x+dw/2+.35,1.35,z0-.2);const lt=add(C.g,.08,.08,.04,M(0x200000,{emissive:0xc00000}),x+dw/2+.35,1.58,z0-.24);
  const sg=pdTxt('HIGH SECURITY · BAY '+(i+1),1.7,.24,'#d8b040','#20261c');sg.position.set(x,2.95,z0-.17);sg.rotation.y=Math.PI;C.g.add(sg);
  const dob=ob(x-dw/2,x+dw/2,z0-.12,z0+.12);C.bd.push({i,x,dg,lt,ob:dob,u:0,on:1})}
 q.anims.push({x:Z.x0+20,z:Z.z1,r:60,f:dt=>{const lz=P.z-q.OZ,mine=bayMine(q);for(const d of C.bd){const ok=d.i===mine,near=Math.hypot(P.x-d.x,lz-Z.z1)<2.6&&!q.seat;const want=ok&&near?1:0;
   if(near&&!ok&&!d.warned){d.warned=1;hint(mine<0?'🔒 HIGH SECURITY: X-13 owners only.':'🔒 HIGH SECURITY: that is BAY '+(d.i+1)+'. Yours is BAY '+(mine+1)+'.');try{snd(180,.15)}catch(e){}}if(!near)d.warned=0;
   const pu=d.u;d.u+=(want-d.u)*Math.min(1,dt*(want?2.2:3));d.dg.position.x=d.x-d.u*(dw+.05);if((pu<.05)!==(d.u<.05))try{snd(d.u>pu?260:200,.12)}catch(e){}
   const open=d.u>.85;if(open===!!d.on){d.on=!open;if(open){const k=q.obs.indexOf(d.ob);if(k>=0)q.obs.splice(k,1)}else q.obs.push(d.ob);q.obsDirty=1}d.lt.material.emissive.setHex(d.u>.5?0x20c040:0xc00000)}}});q.obsDirty=1}
