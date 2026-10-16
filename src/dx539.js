/* =====================================================================================================
   r539: RETRO MODE BOILER HALL ESCAPE. Playing solo with Retro Mode on, the moment the power comes back the game
   cuts to an 8-bit side-scrolling chase: run right through the boiler hall, JUMP the pipes, DUCK the steam, and keep
   ahead of the darkness creeping in from the left. Reach the EXIT door and you escape; get swallowed and it is a death
   by Figure, as usual. (In co-op the normal 3D escape plays, so everyone stays together.)
   Controls: Space / W / Up = jump, S / Down / C / Ctrl = duck. On a phone: tap the top half to jump, the bottom to duck.
   ===================================================================================================== */
const MG8={on:0};
function mg8Can(){try{return MODS&&MODS.retro&&!(HUB&&HUB.on)}catch(e){return false}}
const r8Co=()=>{try{return MP.on&&mpOpen().length>0}catch(e){return false}};
/* go to door k: in co-op every client walks its own copy of the hotel forward (same seed), solo just rebuilds */
function r8Go(k){if(r8Co()){mpWarpTo(k)}else{n=k;build()}}
function mg8Start(cfg){cfg=cfg||MG8BOIL;if(MG8.on)return;MG8.on=1;state='r8run';try{document.exitPointerLock()}catch(e){}for(const k in keys)keys[k]=0;
 const d=document.createElement('div');d.style.cssText='position:fixed;inset:0;z-index:56;background:#000;display:flex;align-items:center;justify-content:center;touch-action:none';
 const c=document.createElement('canvas');c.width=256;c.height=224;c.style.cssText='height:100%;max-width:100%;aspect-ratio:256/224;image-rendering:pixelated;image-rendering:crisp-edges';d.appendChild(c);document.body.appendChild(d);
 /* the course: pipes to jump (j), steam to duck (d), and a few double pipes (J); the exit at the end */
 const ob=[];let x=260;for(let i=0;i<(cfg.n||26);i++){const r=Math.random(),k=i<3?'j':r<.45?'j':r<.8?'d':'J';ob.push({x,k});x+=(k=='J'?135:95)+Math.random()*55}
 Object.assign(MG8,{cfg,d,c,x:c.getContext('2d'),ob,end:x+120,cam:0,px:70,py:0,vy:0,duck:0,sp:62,dark:-40,t:0,hitT:0,res:null,resT:0,seq:Object.assign({},R8RUN,{i:0,acc:0}),last:performance.now(),jq:0});
 MG8.kd=e=>{if(!MG8.on)return;const k=e.code;if(k=='Space'||k=='KeyW'||k=='ArrowUp'){MG8.jq=.15;e.preventDefault()}if(k=='KeyS'||k=='ArrowDown'||k=='KeyC'||k=='ControlLeft'){MG8.duck=1;e.preventDefault()}};
 MG8.ku=e=>{const k=e.code;if(k=='KeyS'||k=='ArrowDown'||k=='KeyC'||k=='ControlLeft')MG8.duck=0};
 MG8.td=e=>{const r=c.getBoundingClientRect(),t0=(e.touches?e.touches[0]:e),y=(t0.clientY-r.top)/r.height;if(y<.55)MG8.jq=.15;else MG8.duck=1;e.preventDefault();e.stopPropagation()};
 MG8.tu=e=>{MG8.duck=0;e.preventDefault&&e.preventDefault()};
 addEventListener('keydown',MG8.kd,true);addEventListener('keyup',MG8.ku,true);d.addEventListener('touchstart',MG8.td,{passive:false});d.addEventListener('touchend',MG8.tu);d.addEventListener('mousedown',MG8.td);d.addEventListener('mouseup',MG8.tu);
 conLog('event','Retro escape: '+cfg.k);requestAnimationFrame(mg8Frame)}
function mg8Stop(){MG8.on=0;removeEventListener('keydown',MG8.kd,true);removeEventListener('keyup',MG8.ku,true);try{MG8.d.remove()}catch(e){}}
function mg8Frame(now){if(!MG8.on)return;const dt=Math.min(.1,(now-MG8.last)/1000);MG8.last=now;try{mg8Upd(dt);mg8Draw()}catch(e){conLog('error','retro escape: '+e.message);mg8Stop();state='play'}if(MG8.on)requestAnimationFrame(mg8Frame)}
const MGY=176;   /* the floor line */
function mg8Upd(dt){const M=MG8;M.t+=dt;
 if(M.res){M.resT+=dt;if(M.resT>2.4){const r=M.res,C=M.cfg;mg8Stop();state='play';try{if(r=='win')C.win();else C.lose()}catch(e){conLog('error','retro escape end: '+e.message)}}return}
 const wx=M.cam+M.px;
 /* running, jumping, ducking */M.cam+=M.sp*dt*(M.hitT>0?.45:1);M.hitT=Math.max(0,M.hitT-dt);
 if(M.jq>0){M.jq-=dt;if(M.py>=0&&!M.duck){M.vy=-168;M.py=-.01;M.jq=0;r8Tone(r8N('C5'),.06,.04,'square');setTimeout(()=>r8Tone(r8N('G5'),.06,.04,'square'),50)}}
 if(M.py<0||M.vy<0){M.vy+=420*dt;M.py+=M.vy*dt;if(M.py>=0){M.py=0;M.vy=0}}
 /* the darkness: slowly speeds up, and lunges when you stumble *//* r542: it is a little slower than you, so a clean run pulls away; every stumble lets it lunge (about 3 quick stumbles and it has you), and it never falls more than ~130 px behind */M.dark+=(M.hitT>0?M.sp*1.25:M.sp*.9)*dt;if(wx-M.dark>130)M.dark=wx-130;
 /* obstacles */const h=M.duck&&M.py>=0?8:16;for(const o of M.ob){if(o.done)continue;const ox=o.x,w=o.k=='J'?22:10;if(wx+6<ox||wx>ox+w)continue;
  let hit=false;if(o.k=='d'){hit=!(M.duck&&M.py>=0)}else{const top=o.k=='J'?14:10;hit=-M.py<top}
  if(hit){o.done=1;M.hitT=.9;r8Tone(110,.18,.06,'sawtooth');r8Tone(70,.25,.05,'square');try{camShake(.1,.1)}catch(e){}}else if(wx>ox+w-2)o.done=1}
 /* caught? escaped? */if(M.dark>=wx-4){M.res='lose';M.resT=0;[['E4',0],['D#4',.18],['D4',.36],['C#4',.54]].forEach(([n0,w])=>r8Tone(r8N(n0),.22,.05,'square',(r8Ctx()||{currentTime:0}).currentTime+w));return}
 if(wx>=M.end){M.res='win';M.resT=0;[['C5',0],['E5',.1],['G5',.2],['C6',.3],['E6',.45],['G6',.6],['C7',.8]].forEach(([n0,w])=>r8Tone(r8N(n0),.14,.05,'square',(r8Ctx()||{currentTime:0}).currentTime+w));return}
 r8Seq(M.seq,dt,190+Math.min(60,M.t*3))}
function mg8Draw(){const M=MG8,x=M.x,cam=M.cam;x.imageSmoothingEnabled=false;
 if(M.cfg.k=='hall'){mg8Hall(x,cam,M)}else{/* the boiler hall: dark red walls, pipes and gauges scrolling at two speeds */x.fillStyle='#1a0806';x.fillRect(0,0,256,224);
 for(let i=-1;i<10;i++){const bx=i*40-((cam*.4)%40);x.fillStyle='#2a0e0a';x.fillRect(bx,20,30,140);x.fillStyle='#3a1610';x.fillRect(bx+2,22,26,4)}
 x.fillStyle='#6a5040';for(let i=-1;i<6;i++){const bx=i*64-((cam*.7)%64);x.fillRect(bx,36,64,5);x.fillRect(bx+40,36,5,60);x.fillStyle='#c0a060';x.fillRect(bx+12,30,9,9);x.fillStyle='#202020';x.fillRect(bx+15,33,3,3);x.fillStyle='#6a5040'}
 /* warning lights blink red now the power is on */if(Math.floor(M.t*4)%2){x.fillStyle='#ff2010';for(let i=-1;i<6;i++)x.fillRect(i*80-((cam*.7)%80)+30,10,8,5)}}
 /* floor */x.fillStyle='#3a3a40';x.fillRect(0,MGY,256,48);x.fillStyle='#5a5a62';for(let i=-1;i<20;i++)x.fillRect(i*16-(cam%16),MGY,14,2);x.fillStyle='#202024';x.fillRect(0,MGY+2,256,1);
 /* obstacles */for(const o of M.ob){const sx=o.x-cam;if(sx<-30||sx>270)continue;
  if(M.cfg.k=='hall'){mg8HallOb(x,o,sx,M)}else if(o.k=='d'){/* steam from a pipe above */x.fillStyle='#6a5040';x.fillRect(sx-2,0,14,MGY-22);x.fillStyle='#8a7060';x.fillRect(sx-4,MGY-24,18,4);for(let k=0;k<6;k++){x.fillStyle=k%2?'#e8e8f0':'#b0b0c0';const wob=Math.sin(M.t*20+k)*2;x.fillRect(sx-3+wob,MGY-20+k*2,16,2)}}
  else{const w=o.k=='J'?22:10,hh=o.k=='J'?14:10;x.fillStyle='#8a6a3a';x.fillRect(sx,MGY-hh,w,hh);x.fillStyle='#b08a50';x.fillRect(sx,MGY-hh,w,2);x.fillStyle='#5a4020';x.fillRect(sx+2,MGY-hh+4,w-4,1)}}
 /* r542: a JUMP / DUCK sign over the next obstacle as it comes up */{const nx=M.ob.find(o=>!o.done&&o.x-cam>M.px+4);if(nx){const sx=nx.x-cam;if(sx<M.px+110){const dk=nx.k=='d';r8Txt(x,dk?'DUCK ▼':'JUMP ▲',sx+5,dk?MGY-40:MGY-30,(Math.floor(M.t*8)%2)?(dk?'#ff6060':'#60ff80'):'#ffffff',8)}}}
 /* the exit */const ex=M.end-cam;if(ex<280){x.fillStyle='#103010';x.fillRect(ex,MGY-40,22,40);x.fillStyle='#40ff60';x.fillRect(ex+2,MGY-38,18,36);x.fillStyle='#000';r8Txt(x,'EXIT',ex+11,MGY-52,'#40ff60',8)}
 /* you */const gy=MGY-12+M.py,flick=M.hitT>0&&Math.floor(M.t*16)%2;if(!flick){if(M.duck&&M.py>=0){x.save();x.translate(M.px,MGY-6);x.scale(1,.5);r8Guy(x,0,0,0);x.restore()}else r8Guy(x,M.px,gy,M.py<0?1:Math.floor(M.t*10)%2)}
 /* the darkness: a creeping black wall with a ragged edge and two red eyes */const dx=M.dark-cam;if(dx>-20){x.fillStyle='#000';x.fillRect(0,0,Math.max(0,dx),224);for(let r=0;r<224;r+=6)x.fillRect(dx,r,4+((r*7+Math.floor(M.t*10))%5)*2,6);
  const ey=96+Math.sin(M.t*2)*6;x.fillStyle='#ff1010';x.fillRect(dx-16,ey,5,3);x.fillRect(dx-6,ey,5,3)}
 /* HUD */const prog=Math.min(1,(cam+M.px)/M.end);x.fillStyle='#000';x.fillRect(0,200,256,24);r8Txt(x,'RUN!',8,206,(Math.floor(M.t*4)%2)?'#ff4040':'#ffffff',9,'left');x.fillStyle='#333';x.fillRect(50,209,150,6);x.fillStyle='#40ff60';x.fillRect(50,209,150*prog,6);x.fillStyle='#ff2020';x.fillRect(50+150*Math.max(0,Math.min(1,M.dark/M.end)),207,2,10);r8Txt(x,'EXIT',206,206,'#40ff60',9,'left');
 if(M.t<2.2){r8Txt(x,M.cfg.title,128,60,'#ffd860',10);r8Txt(x,MOB.on?'TAP TOP: JUMP · TAP BOTTOM: DUCK':'SPACE: JUMP · S: DUCK',128,78,'#ffffff',8)}
 if(M.res=='win'){x.fillStyle='rgba(0,0,0,.5)';x.fillRect(0,70,256,50);r8Txt(x,'STAGE CLEAR!',128,80,'#40ff60',16)}
 if(M.res=='lose'){x.fillStyle='rgba(0,0,0,.6)';x.fillRect(0,0,256,224);r8Txt(x,'GAME OVER',128,90,'#ff2020',18)}
 x.fillStyle='rgba(0,0,0,.18)';for(let r=0;r<224;r+=2)x.fillRect(0,r,256,1);x.fillStyle='#fff';x.fillRect(0,0,98,9);r8Txt(x,'Unregistered HyperCam 2',2,1,'#000',7,'left')}
const MG8BOIL={k:'boil',title:'ESCAPE THE BOILER HALL!',n:20,win:()=>{try{badge('retroescape')}catch(e){}win()},lose:()=>die('Figure')};
/* the hotel corridor for the Seek chase: green wallpaper, doors, lamps; jump knocked-over chairs and tables, duck the swinging chandeliers */
function mg8Hall(x,cam,M){x.fillStyle='#14281c';x.fillRect(0,0,256,224);x.fillStyle='#1c3626';for(let i=-1;i<30;i++)x.fillRect(i*10-((cam*.6)%10),16,4,150);
 x.fillStyle='#3a2414';x.fillRect(0,130,256,46);x.fillStyle='#5a3820';x.fillRect(0,128,256,3);
 for(let i=-1;i<5;i++){const bx=i*72-((cam*.6)%72)+20;x.fillStyle='#4a2a14';x.fillRect(bx,70,26,106);x.fillStyle='#6a4024';x.fillRect(bx+3,74,20,98);x.fillStyle='#d8b040';x.fillRect(bx+18,122,3,3);x.fillStyle='#e8d8a0';x.fillRect(bx+6,60,14,7);r8Txt(x,String(((Math.floor((cam*.6+i*72)/72))%90)+10).padStart(3,'0'),bx+13,60,'#3a2010',6)}
 for(let i=-1;i<5;i++){const bx=i*72-((cam*.6)%72)+56;const on=Math.random()>.08;x.fillStyle=on?'#ffe0a0':'#5a4a30';x.fillRect(bx,50,6,8);if(on){x.fillStyle='rgba(255,220,150,.08)';x.fillRect(bx-10,58,26,40)}}}
function mg8HallOb(x,o,sx,M){if(o.k=='d'){/* a chandelier that has slipped right down its chain to head height */const sw=Math.sin(M.t*3+o.x)*1.5;x.fillStyle='#8a7040';x.fillRect(sx+4+sw,0,2,MGY-17);x.fillStyle='#d8b040';x.fillRect(sx-4+sw,MGY-17,18,4);x.fillStyle='#ffe8a0';for(let k=0;k<4;k++)x.fillRect(sx-3+k*5+sw,MGY-21,2,4);x.fillStyle='#ffffff';for(const ox of[-2,3,8,13])x.fillRect(sx+ox+sw,MGY-13,2,4)}
 else if(o.k=='J'){/* a knocked-over table */x.fillStyle='#6a4024';x.fillRect(sx,MGY-14,22,4);x.fillRect(sx+2,MGY-10,3,10);x.fillRect(sx+17,MGY-10,3,10);x.fillStyle='#8a5a30';x.fillRect(sx,MGY-14,22,1)}
 else{/* a fallen chair */x.fillStyle='#5a2a14';x.fillRect(sx,MGY-6,10,3);x.fillRect(sx,MGY-10,2,10);x.fillRect(sx+8,MGY-3,2,3);x.fillStyle='#8a2a2a';x.fillRect(sx+1,MGY-8,8,2)}}
/* the Seek chase: when Seek starts chasing in the first chase room, cut to the 8-bit corridor run. Win and you skip ahead
   to the room after the chase; get caught and it is Seek, as usual */
function mg8SeekA(){for(const a of CH)if(n>=a&&n<a+10)return a;return -1}
const MG8HALL={k:'hall',title:'RUN! DON\'T LOOK BACK!',n:22,win:()=>{const a=mg8SeekA()>=0?mg8SeekA():MG8.sa;try{if(seek){seek.on=false;seek.visible=false;seek.pend=0}endSeek=null}catch(e){}try{badge('retroseek')}catch(e){}if(a>=0){r8Go(a+10);hint('🎮 You outran it! On to door '+n+'.')}},lose:()=>die('Seek')};
setInterval(()=>{try{if(MG8.on||state!='play'||!mg8Can())return;const a=mg8SeekA();if(a<0)return;const ci2=n-a,on=(seek&&seek.on&&!seek.pend)||(r8Co()&&ci2>=1&&ci2<9);if(!on)return;if((MG8.sw=(MG8.sw||0)+1)<4)return;MG8.sw=0;MG8.sa=a;mg8Start(MG8HALL)}catch(e){}},250);
/* kick it off a moment after the power comes back (the WARNING flashes first) */
{const po0=powerOn;powerOn=function(){const r=po0.apply(this,arguments);try{if(bh8Here()&&mg8Can())setTimeout(()=>{try{if(state=='play'&&n==100&&!MG8.on)mg8Start(MG8BOIL)}catch(e){}},1700)}catch(e){}return r}}
/* hide the boiler-hall overlay while an escape plays */
{const bh0=bh8Here;bh8Here=function(){if(MG8.on)return false;return bh0()}}

/* =====================================================================================================
   r539: RETRO MODE DOOR 50. Solo with Retro Mode on, the library becomes a top-down 8-bit stealth stage: find the 4
   glowing red books for the code and reach the lock at the top, while the blind thing in the dark hunts by SOUND.
   Walking makes noise rings; hold SHIFT or C (or the SNEAK button) to creep silently. Caught = Figure, as usual.
   Move with WASD / arrow keys; on a phone, hold your finger where you want to go.
   ===================================================================================================== */
const LB8={on:0};
function lb8Map(){const W=16,H=12,g=[];for(let r=0;r<H;r++){g.push([]);for(let c=0;c<W;c++)g[r].push(r==0||r==H-1||c==0||c==W-1?1:0)}
 for(const r of[3,6,9]){const gap1=2+(Math.random()*4|0),gap2=9+(Math.random()*4|0);for(let c=2;c<W-2;c++)if(Math.abs(c-gap1)>0&&Math.abs(c-gap2)>0&&!(c==gap1+1||c==gap2+1))g[r][c]=1}
 for(let k=0;k<4;k++){const r=1+(Math.random()*9|0),c=2+(Math.random()*12|0);if(g[r][c]==0&&r!=10&&!(r<=2&&c>=6&&c<=9))g[r][c]=2}   /* a few lone shelves */
 g[0][7]=3;g[0][8]=3;return g}
function lb8Free(g,c,r){return r>=0&&r<g.length&&c>=0&&c<g[0].length&&(g[r][c]==0)}
function lb8Path(g,sc,sr,tc,tr){const H=g.length,W=g[0].length,prev=new Map(),q=[[sc,sr]],key=(c,r)=>r*W+c;prev.set(key(sc,sr),null);
 while(q.length){const[c,r]=q.shift();if(c==tc&&r==tr)break;for(const[dc,dr]of[[1,0],[-1,0],[0,1],[0,-1]]){const nc=c+dc,nr=r+dr;if(!lb8Free(g,nc,nr)||prev.has(key(nc,nr)))continue;prev.set(key(nc,nr),[c,r]);q.push([nc,nr])}}
 if(!prev.has(key(tc,tr)))return null;const p=[];let cur=[tc,tr];while(cur){p.unshift(cur);cur=prev.get(key(cur[0],cur[1]))}return p}
function lb8Start(){if(LB8.on||MG8.on)return;LB8.on=1;state='r8lib';try{document.exitPointerLock()}catch(e){}for(const k in keys)keys[k]=0;
 const d=document.createElement('div');d.style.cssText='position:fixed;inset:0;z-index:56;background:#000;display:flex;align-items:center;justify-content:center;touch-action:none';
 const c=document.createElement('canvas');c.width=256;c.height=224;c.style.cssText='height:100%;max-width:100%;aspect-ratio:256/224;image-rendering:pixelated;image-rendering:crisp-edges';d.appendChild(c);document.body.appendChild(d);
 const g=lb8Map(),free=[];for(let r=1;r<11;r++)for(let cc=1;cc<15;cc++)if(g[r][cc]==0&&r<10)free.push([cc,r]);for(let i=free.length-1;i>=0;i--)if(!lb8Path(g,7,10,free[i][0],free[i][1]))free.splice(i,1);free.sort(()=>Math.random()-.5);
 const books=free.slice(0,4).map(([bc,br],i)=>({c:bc,r:br,d:String(Math.random()*10|0),got:0}));const hs=free.find(([hc,hr])=>hr<=4)||free[5];
 Object.assign(LB8,{d,c,x:c.getContext('2d'),g,books,px:7.5,py:10.5,hx:hs[0]+.5,hy:hs[1]+.5,ht:null,hpath:null,hpT:0,hsp:1.5,alert:0,noise:[],nT:0,t:0,res:null,resT:0,sneak:0,tsn:0,touch:null,mv:{},seq:Object.assign({},R8BH,{i:0,acc:0}),last:performance.now(),step:0});
 LB8.kd=e=>{if(!LB8.on)return;LB8.mv[e.code]=1;if(e.code=='ShiftLeft'||e.code=='ShiftRight'||e.code=='KeyC')LB8.sneak=1;if(/Arrow|Key[WASD]|Space/.test(e.code))e.preventDefault()};
 LB8.ku=e=>{LB8.mv[e.code]=0;if(e.code=='ShiftLeft'||e.code=='ShiftRight'||e.code=='KeyC')LB8.sneak=0};
 const tp=e=>{const r=c.getBoundingClientRect(),t0=e.touches?e.touches[0]:e;return[(t0.clientX-r.left)/r.width*256,(t0.clientY-r.top)/r.height*224]};
 LB8.td=e=>{const[x0,y0]=tp(e);if(x0>196&&y0>196){LB8.tsn=!LB8.tsn}else LB8.touch=[x0,y0];e.preventDefault();e.stopPropagation()};
 LB8.tm=e=>{if(LB8.touch)LB8.touch=tp(e);e.preventDefault()};LB8.tu=()=>{LB8.touch=null};
 addEventListener('keydown',LB8.kd,true);addEventListener('keyup',LB8.ku,true);d.addEventListener('touchstart',LB8.td,{passive:false});d.addEventListener('touchmove',LB8.tm,{passive:false});d.addEventListener('touchend',LB8.tu);d.addEventListener('mousedown',LB8.td);d.addEventListener('mousemove',e=>{if(e.buttons)LB8.tm(e)});d.addEventListener('mouseup',LB8.tu);
 [['C5',0],['E5',.12],['G5',.24],['C6',.36]].forEach(([nn,w])=>r8Tone(r8N(nn),.16,.05,'square',(r8Ctx()||{currentTime:0}).currentTime+w));conLog('event','Retro library');requestAnimationFrame(lb8Frame)}
function lb8Stop(){LB8.on=0;removeEventListener('keydown',LB8.kd,true);removeEventListener('keyup',LB8.ku,true);try{LB8.d.remove()}catch(e){}}
function lb8Frame(now){if(!LB8.on)return;const dt=Math.min(.1,(now-LB8.last)/1000);LB8.last=now;try{lb8Upd(dt);lb8Draw()}catch(e){conLog('error','retro library: '+e.message);lb8Stop();state='play'}if(LB8.on)requestAnimationFrame(lb8Frame)}
function lb8Upd(dt){const L=LB8,g=L.g;L.t+=dt;
 if(L.res){L.resT+=dt;if(L.resT>2.4){const r=L.res;lb8Stop();state='play';if(r=='win'){try{badge('retrolib')}catch(e){}r8Go(51);hint('🎮 Door 50 cleared, retro style. On to door 51.')}else die('Figure')}return}
 if(L.t<2.5)return;   /* the title card */
 /* you */let mx=0,my=0;const K=L.mv;if(K.KeyA||K.ArrowLeft)mx--;if(K.KeyD||K.ArrowRight)mx++;if(K.KeyW||K.ArrowUp)my--;if(K.KeyS||K.ArrowDown)my++;
 if(L.touch){const tx=L.touch[0]/16,ty=(L.touch[1]-16)/16,dx=tx-L.px,dy=ty-L.py,dd=Math.hypot(dx,dy);if(dd>.3){mx=dx/dd;my=dy/dd}}
 const sn=L.sneak||L.tsn,ml=Math.hypot(mx,my);if(ml>0){mx/=ml;my/=ml;const sp=sn?1.6:3.3,R=.28;
  const ok=(x,y)=>{for(const[ox,oy]of[[-R,-R],[R,-R],[-R,R],[R,R]]){const c=Math.floor(x+ox),r=Math.floor(y+oy);if(!lb8Free(g,c,r)&&!(g[r]&&g[r][c]==3))return false}return true};
  const nx=L.px+mx*sp*dt,ny=L.py+my*sp*dt;if(ok(nx,L.py))L.px=nx;if(ok(L.px,ny))L.py=ny;
  if(!sn&&(L.nT-=dt)<=0){L.nT=.45;L.noise.push({x:L.px,y:L.py,t:0});r8Tone(140,.04,.025,'square');if(Math.hypot(L.hx-L.px,L.hy-L.py)<6.5){L.ht=[Math.floor(L.px),Math.floor(L.py)];L.hpT=0;L.alert=2.5}}
  if((L.step+=dt*(sn?3:7))>1){L.step=0}}
 for(let i=L.noise.length-1;i>=0;i--){L.noise[i].t+=dt;if(L.noise[i].t>.8)L.noise.splice(i,1)}
 /* books */for(const b of L.books)if(!b.got&&Math.hypot(b.c+.5-L.px,b.r+.5-L.py)<.6){b.got=1;r8Tone(r8N('E6'),.08,.05,'square');setTimeout(()=>r8Tone(r8N('A6'),.1,.05,'square'),70)}
 const all=L.books.every(b=>b.got);if(all&&L.py<1.2&&L.px>7&&L.px<9){L.res='win';L.resT=0;[['C5',0],['E5',.1],['G5',.2],['C6',.3],['E6',.45],['G6',.6],['C7',.8]].forEach(([n0,w])=>r8Tone(r8N(n0),.14,.05,'square',(r8Ctx()||{currentTime:0}).currentTime+w));return}
 /* the hunter: wanders, and homes in on the last sound it heard */L.alert=Math.max(0,L.alert-dt);
 if(!L.ht||(Math.floor(L.hx)==L.ht[0]&&Math.floor(L.hy)==L.ht[1])){if(!L.alert){const fr=[];for(let r=1;r<11;r++)for(let c=1;c<15;c++)if(g[r][c]==0)fr.push([c,r]);L.ht=fr[Math.random()*fr.length|0];L.hpT=0}}
 if((L.hpT-=dt)<=0){L.hpT=.4;L.hpath=lb8Path(g,Math.floor(L.hx),Math.floor(L.hy),L.ht[0],L.ht[1])}
 if(L.hpath&&L.hpath.length>1){const[nc,nr]=L.hpath[1],tx=nc+.5,ty=nr+.5,dx=tx-L.hx,dy=ty-L.hy,dd=Math.hypot(dx,dy),sp=L.alert>0?3.0:1.4;if(dd<.08)L.hpath.shift();else{L.hx+=dx/dd*Math.min(dd,sp*dt);L.hy+=dy/dd*Math.min(dd,sp*dt)}}
 if(Math.hypot(L.hx-L.px,L.hy-L.py)<.65){L.res='lose';L.resT=0;[['E4',0],['D#4',.18],['D4',.36],['C#4',.54]].forEach(([n0,w])=>r8Tone(r8N(n0),.22,.05,'square',(r8Ctx()||{currentTime:0}).currentTime+w));return}
 r8Seq(L.seq,dt,L.alert>0?150:96)}
function lb8Draw(){const L=LB8,x=L.x,g=L.g,O=16;x.imageSmoothingEnabled=false;x.fillStyle='#000';x.fillRect(0,0,256,224);
 for(let r=0;r<g.length;r++)for(let c=0;c<g[0].length;c++){const X=c*16,Y=O+r*16,v=g[r][c];
  if(v==0){x.fillStyle=(r+c)%2?'#3a1418':'#341216';x.fillRect(X,Y,16,16)}
  else if(v==3){x.fillStyle='#4a2a14';x.fillRect(X,Y,16,16);x.fillStyle=L.books.every(b=>b.got)?'#40ff60':'#c0a040';x.fillRect(X+(c==7?12:0),Y+6,4,6)}
  else{x.fillStyle='#4a2a14';x.fillRect(X,Y,16,16);if(r>0&&r<g.length-1&&c>0&&c<g[0].length-1){const cols=['#2a5a8a','#8a2a2a','#2a7a3a','#8a7a2a','#5a2a7a'];for(let k=0;k<5;k++){x.fillStyle=cols[(r*3+c*5+k)%5];x.fillRect(X+1+k*3,Y+3,2,10)}}else{x.fillStyle='#2a1408';x.fillRect(X,Y+15,16,1)}}}
 /* the books glow */for(const b of L.books)if(!b.got){const p=.5+.5*Math.sin(L.t*6);x.fillStyle='rgba(255,40,40,'+(.25+p*.35)+')';x.fillRect(b.c*16+2,O+b.r*16+2,12,12);x.fillStyle='#ff3030';x.fillRect(b.c*16+5,O+b.r*16+4,6,8);x.fillStyle='#ffd0d0';x.fillRect(b.c*16+6,O+b.r*16+5,1,6)}
 /* noise rings */for(const nz of L.noise){const rr=nz.t*40;x.strokeStyle='rgba(255,255,255,'+(1-nz.t/.8)*.6+')';x.lineWidth=1;x.strokeRect(nz.x*16-rr/2,O+nz.y*16-rr/2,rr,rr)}
 /* the hunter: a shapeless dark mass with two red eyes */{const hx=L.hx*16,hy=O+L.hy*16;x.fillStyle='rgba(0,0,0,.85)';for(let k=0;k<6;k++){const a=k/6*6.283+L.t*2;x.fillRect(hx-7+Math.cos(a)*3,hy-7+Math.sin(a)*3,14,14)}x.fillStyle=L.alert>0?'#ff2020':'#a01010';x.fillRect(hx-5,hy-3,3,2);x.fillRect(hx+2,hy-3,3,2)}
 /* you */r8Guy(x,L.px*16-4,O+L.py*16-9,L.step>.5?1:0);
 /* HUD */x.fillStyle='#000';x.fillRect(0,0,256,16);x.fillRect(0,208,256,16);r8Txt(x,'CODE',6,4,'#ffd860',8,'left');L.books.forEach((b,i)=>r8Txt(x,b.got?b.d:'?',46+i*12,4,b.got?'#ff6060':'#666',9,'left'));
 r8Txt(x,(L.sneak||L.tsn)?'SNEAKING':'WALKING (LOUD)',250,4,(L.sneak||L.tsn)?'#80ff80':'#ffb040',8,'right');
 r8Txt(x,MOB.on?'HOLD TO MOVE':'WASD · SHIFT=SNEAK',104,212,'#8a8ab0',7,'left');x.fillStyle=L.tsn?'#2a6a2a':'#333';x.fillRect(198,208,58,16);r8Txt(x,'SNEAK',227,212,'#fff',8);
 if(L.t<2.5){x.fillStyle='rgba(0,0,0,.8)';x.fillRect(20,60,216,90);x.strokeStyle='#fff';x.lineWidth=2;x.strokeRect(21,61,214,88);r8Txt(x,'STAGE 50',128,70,'#ffd860',16);r8Txt(x,'THE LIBRARY',128,92,'#ffffff',10);r8Txt(x,'FIND 4 RED BOOKS · OPEN THE LOCK',128,110,'#ff8080',8);r8Txt(x,'IT HUNTS BY SOUND. SNEAK.',128,124,'#a0a0ff',8);if(Math.floor(L.t*3)%2)r8Txt(x,'READY?',128,136,'#80ff80',9)}
 if(L.res=='win'){x.fillStyle='rgba(0,0,0,.6)';x.fillRect(0,80,256,50);r8Txt(x,'STAGE CLEAR!',128,90,'#40ff60',16)}
 if(L.res=='lose'){x.fillStyle='rgba(0,0,0,.6)';x.fillRect(0,0,256,224);r8Txt(x,'GAME OVER',128,90,'#ff2020',18)}
 x.fillStyle='rgba(0,0,0,.15)';for(let r=0;r<224;r+=2)x.fillRect(0,r,256,1);x.fillStyle='#fff';x.fillRect(0,214,98,9);r8Txt(x,'Unregistered HyperCam 2',2,215,'#000',7,'left')}
setInterval(()=>{try{if(LB8.on||MG8.on||state!='play'||!mg8Can()||n!=50||!fig||!fig.cl||(typeof MINE!='undefined'&&MINE)){LB8.w=0;return}if((LB8.w=(LB8.w||0)+1)<6)return;LB8.w=0;lb8Start()}catch(e){}},250);
