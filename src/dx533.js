/* =====================================================================================================
   r533: TURN YOURSELF IN, and a police cruiser that cannot stay stuck.
   - At the Desert PD front door (and at the Dark Penitentiary visitation block) you can hand yourself in. It goes
     through the court as "cooperated" (half the fine, a shorter sentence). At the penitentiary it is a max-security trial.
   - Seek's cruiser: if it makes no headway towards you for 10 seconds in a chase (wedged on a fence, a rail, a wall),
     it takes a "dark shortcut": it reappears on clear ground a little way behind you and carries on.
   ===================================================================================================== */
function turnInOk(q){return !(q.court||q.jail||(q.pen&&q.pen.on)||q.inBus||q.seat)}
function turnIn(q,pen){if(!turnInOk(q))return;const h=q.heat|0,lab=pen?'the Dark Penitentiary':'the Desert PD';
 milDlg(q,'🙋 TURN YOURSELF IN?','<p>Walk up to the desk at '+lab+' and confess.</p><p>'+(h>0?'You are wanted ('+'⭐'.repeat(Math.max(1,Math.min(5,Math.ceil(h/20))))+'). ':'You are not even wanted. Seek will be thrilled. ')+'The court counts it as <b>cooperating</b>: half the fine and a shorter sentence.'+(pen?'<br><b>This is the Dark Penitentiary: the trial is for MAXIMUM SECURITY.</b>':'')+'</p>',[['y','🙋 Turn myself in'],['n','Never mind']],b=>{
  if(b!='y'||!turnInOk(q))return;try{if(q.cop&&q.cop.st!='wreck')copDrop(q)}catch(e){}
  q.penNext=pen?!!q.penW:((q.heat||0)>80&&!!q.penW);q.coop=1;const fine=Math.min(gold,20);gold-=fine;try{saveGame()}catch(e){}q.heat=0;
  hint('🙋 You hold out your wrists. "I would like to report a crime. It was me."');try{say('Seek',h>0?'...You came to ME? Well. That is very dark of you.':'You did WHAT? Nobody turns themselves in. ...Fine. COURT.')}catch(e){}try{badge('turnin')}catch(e){}
  setTimeout(()=>{try{courtStart(q,fine)}catch(e){conLog('error','turn in: '+e.message)}},600)})}
function turnInSetup(q){if(!q||!q.roam||!q.props)return;
 if(!q.tiPD&&q.pd&&typeof DPD!=='undefined'){q.tiPD=1;q.props.push({x:DPD.X-2,z:DPD.Z+4.4,r:1.5,txt:()=>turnInOk(q)?'[E] 🙋 Turn yourself in':'',act:()=>turnIn(q,0)})}
 if(!q.tiPen&&q.pvB&&q.penW&&typeof PVB!=='undefined'){q.tiPen=1;q.props.push({x:PVB.x0-1.3,z:PVB.z0+2,r:1.4,txt:()=>turnInOk(q)?'[E] 🙋 Turn yourself in (max security)':'',act:()=>turnIn(q,1)})}}
setInterval(()=>{try{turnInSetup(BUS.ride)}catch(e){}},1000);
/* the unsticker */
function copUnstick(q,dt){const c=q.cop;if(!c||c.st!='chase'||!c.v||c.v.wreck)return;const v=c.v,tv=q.seat?q.seat.v:q.inBus?q.inBus.v:null,tx=tv?tv.x:P.x,tz=tv?tv.z:P.z-q.OZ,d=Math.hypot(tx-v.x,tz-v.z);
 if(c.usX==null||Math.hypot(v.x-c.usX,v.z-c.usZ)>8||d<c.usD-6){c.usX=v.x;c.usZ=v.z;c.usD=d;c.usT=0;return}
 if(d<3){c.usT=0;return}c.usT+=dt;if(c.usT<10)return;c.usT=0;
 const hd=tv?tv.h:P.yaw;for(const R of[40,30,55,22,70])for(let k=0;k<12;k++){const a=hd+Math.PI*(k%2?1:-1)*(Math.floor(k/2)/6),x=tx-Math.sin(a)*-R,z=tz-Math.cos(a)*-R;/* behind first, then fanning round */
  const h=Math.atan2(-(tx-x),-(tz-z));try{if(typeof inDest==='function'&&inDest(x,z))continue}catch(e){}const sv=v.hitO;const ok=vehOK(q,v,x,z,h);v.hitO=sv;if(!ok)continue;
  if(navLOS&&!navLOS(x,z,tx,tz)&&R<55)continue;
  v.x=x;v.z=z;v.h=h;v.v=0;v.vy=0;v.air=0;try{v.y=vehGround(q,x,z)}catch(e){v.y=0}v.m.position.set(x,v.y||0,z);v.m.rotation.y=h;c.path=null;c.nav=null;c.stuck=0;c.rev=0;c.blk=0;c.left=1;c.usX=x;c.usZ=z;c.usD=R;
  try{copSay(q,['Dark shortcut!','You thought a fence could stop the dark law?','I know a dark back road.'][Math.random()*3|0])}catch(e){}return}}
{const ct2=copTick;copTick=function(q,dt){const r=ct2.apply(this,arguments);try{copUnstick(q,dt)}catch(e){}return r}}
