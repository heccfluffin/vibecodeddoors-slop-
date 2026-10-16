/* =====================================================================================================
   r538: RETRO MODE gets its own BOILER HALL and its own ENDING.
   - Door 100 in Retro Mode is an arcade boss stage: a STAGE 100 title card, chunky pixel textures, a chiptune that
     speeds up when the power comes back, a blocky breaker meter, and a flashing WARNING when the door opens.
   - Escaping in Retro Mode plays an 8-bit ending instead of the car park party: a pixel hotel at night, you walking
     out, fireworks, a stats screen, a credits roll and PRESS START, all on a 256x224 screen with a chiptune.
   ===================================================================================================== */
const R8={ac:null};
function r8Ctx(){try{AC=AC||new AudioContext();return AC}catch(e){return null}}
/* one chip voice: square for the tune, triangle for the bass, noise-ish for drums */
function r8Tone(f,d,vol,type,at){const ac=r8Ctx();if(!ac||!f)return;try{const o=ac.createOscillator(),g=ac.createGain(),t0=(at!=null?at:ac.currentTime);o.type=type||'square';o.frequency.value=f;g.gain.setValueAtTime(vol||.04,t0);g.gain.exponentialRampToValueAtTime(.0005,t0+d);o.connect(g);g.connect(ac.destination);o.start(t0);o.stop(t0+d+.02)}catch(e){}}
const r8N=s=>{const m={C:0,D:2,E:4,F:5,G:7,A:9,B:11}[s[0]];const sh=s[1]=='#'?1:0,o=+s.slice(sh?2:1);return 440*Math.pow(2,(m+sh+(o-4)*12-9)/12)};
/* a tiny sequencer: call r8Seq(obj,dt,tempo) every frame */
function r8Seq(S,dt,bpm){S.acc=(S.acc||0)+dt;const st=60/bpm/2;while(S.acc>=st){S.acc-=st;const i=(S.i=(S.i||0)+1)-1;const L=S.lead[i%S.lead.length],B=S.bass[i%S.bass.length];if(L&&L!='-')r8Tone(r8N(L),st*.9,S.v||.035,'square');if(B&&B!='-')r8Tone(r8N(B),st*1.6,(S.v||.035)*1.4,'triangle');if(S.drum&&i%2==0)r8Tone(i%4==0?90:180,.05,(S.v||.035)*.8,'square')}}

/* ---------------------------------- the 8-bit ending ---------------------------------- */
const R8END={lead:'E5 - G5 - C6 - G5 E5 D5 - F5 - A5 - F5 D5 C5 - E5 - G5 - E5 C5 D5 E5 F5 G5 - - - -'.split(' '),bass:'C3 - C3 - C3 - C3 - D3 - D3 - D3 - D3 - C3 - C3 - C3 - C3 - G2 - G2 - G2 - G2 -'.split(' '),v:.03,drum:1};
function r8EndStart(){const E=END;if(!E)return;E.retro=1;const d=document.createElement('div');d.style.cssText='position:fixed;inset:0;z-index:56;background:#000;display:flex;align-items:center;justify-content:center;cursor:pointer';
 const c=document.createElement('canvas');c.width=256;c.height=224;c.style.cssText='height:100%;max-width:100%;aspect-ratio:256/224;image-rendering:pixelated;image-rendering:crisp-edges';d.appendChild(c);document.body.appendChild(d);
 const st=[];for(let i=0;i<70;i++)st.push([Math.random()*256|0,Math.random()*120|0,Math.random()*6]);
 E.r8={d,c,x:c.getContext('2d'),st,fw:[],fwT:0,seq:Object.assign({},R8END,{i:0,acc:0}),mods:Object.keys(MODS||{}).length,gold:(typeof gm=='function'?gm(100):100)};
 try{if(E.ov)E.ov.style.display='none'}catch(e){}}
function r8Txt(x,s,X,Y,col,sz,al){x.font='bold '+(sz||8)+'px "Courier New",monospace';x.textAlign=al||'center';x.textBaseline='top';x.fillStyle='#000';x.fillText(s,X+1,Y+1);x.fillStyle=col;x.fillText(s,X,Y)}
function r8Guy(x,X,Y,f){/* an original little hero: 8x12, two walking frames */const P2=['..0000..','.011110.','.012120.','.011110.','..0110..','.333333.','33333333','3.3333.3','..4444..','..4..4..',f?'.44..4..':'..4..44.',f?'.55..55.':'.55..55.'],C={0:'#3a2210',1:'#f0c090',2:'#202020',3:'#2a6ad0',4:'#303848',5:'#5a3010'};
 for(let r=0;r<P2.length;r++)for(let k=0;k<8;k++){const ch=P2[r][k];if(ch=='.')continue;x.fillStyle=C[ch];x.fillRect(X+k,Y+r,1,1)}}
function r8EndDraw(dt){const E=END,Z=E.r8,x=Z.x,T=E.t;x.imageSmoothingEnabled=false;
 /* sky, stars, moon */const gr=x.createLinearGradient(0,0,0,150);gr.addColorStop(0,'#000820');gr.addColorStop(1,'#20186a');x.fillStyle=gr;x.fillRect(0,0,256,224);
 for(const s of Z.st){x.fillStyle=(Math.sin(T*3+s[2])>.3)?'#ffffff':'#6a6aa0';x.fillRect(s[0],s[1],1,1)}
 x.fillStyle='#fff8c0';x.beginPath();x.arc(213,25,8,0,6.283);x.fill();x.fillStyle='#000a26';x.beginPath();x.arc(218,21,7,0,6.283);x.fill();
 /* the hotel: brick block, lit windows, a sign, the door */x.fillStyle='#6a3a28';x.fillRect(64,62,128,96);x.fillStyle='#4a2418';for(let r=0;r<96;r+=6)x.fillRect(64,62+r,128,1);
 for(let r=0;r<5;r++)for(let k=0;k<8;k++){if(r==4&&k>2&&k<5)continue;const on=((k*7+r*3+Math.floor(T*.7))%9)>1;x.fillStyle=on?'#ffd860':'#2a2a48';x.fillRect(72+k*15,70+r*17,9,10)}
 x.fillStyle='#200c06';x.fillRect(116,134,24,24);x.fillStyle=T<4?'#ffe9a0':'#3a1a0c';x.fillRect(118,136,20,22);
 x.fillStyle='#3a1a08';x.fillRect(96,50,64,12);r8Txt(x,'HOTEL',128,52,(Math.floor(T*2)%2)?'#ffd860':'#ff8040');
 /* ground and a path */x.fillStyle='#1a5a2a';x.fillRect(0,158,256,66);x.fillStyle='#5a5a66';x.fillRect(110,158,36,66);x.fillStyle='#246a34';for(let i=0;i<256;i+=8)x.fillRect(i+((i/8)%2)*3,158,3,2);
 /* you walk out, down the path, and wave */const wk=Math.min(1,Math.max(0,(T-1)/3.2)),gx=124,gy=146+wk*48;r8Guy(x,gx,gy,wk<1&&(Math.floor(T*8)%2));if(wk>=1&&Math.floor(T*3)%2){x.fillStyle='#f0c090';x.fillRect(gx+8,gy+4,2,2)}
 /* fireworks */if(T>4.5){if((Z.fwT-=dt)<=0){Z.fwT=.45+Math.random()*.5;const cx=30+Math.random()*196,cy=20+Math.random()*60,col=['#ff4080','#40c0ff','#ffe040','#80ff60','#ff8020','#c080ff'][Math.random()*6|0];for(let i=0;i<22;i++){const a=i/22*6.283;Z.fw.push({x:cx,y:cy,vx:Math.cos(a)*(18+Math.random()*10),vy:Math.sin(a)*(18+Math.random()*10),t:0,col})}r8Tone(70+Math.random()*40,.25,.05,'sawtooth')}
  for(let i=Z.fw.length-1;i>=0;i--){const p=Z.fw[i];p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=20*dt;if(p.t>1.3){Z.fw.splice(i,1);continue}x.fillStyle=p.t>1?'#806040':p.col;x.fillRect(p.x|0,p.y|0,2,2)}}
 /* the words */
 if(T>4.5&&T<11){if(Math.floor(T*4)%2)r8Txt(x,'CONGRATULATIONS!',128,96,'#ffffff',14);r8Txt(x,'YOU ESCAPED THE HOTEL',128,116,'#ffd860',9)}
 if(T>=11&&T<18){x.fillStyle='#0018a8';x.fillRect(40,40,176,104);x.strokeStyle='#ffffff';x.lineWidth=2;x.strokeRect(41,41,174,102);x.strokeStyle='#a8a8ff';x.lineWidth=1;x.strokeRect(45,45,166,94);
  const rk=Z.mods>=4?'S':Z.mods>=2?'A':Z.mods>=1?'B':'C';const L=[['DOORS','100'],['GOLD','+'+Z.gold],['MODIFIERS',String(Z.mods)],['RANK',rk]];r8Txt(x,'- RESULTS -',128,52,'#ffd860',10);L.forEach((l,i)=>{if(T<11.6+i*.6)return;r8Txt(x,l[0],60,74+i*15,'#ffffff',9,'left');r8Txt(x,'.'.repeat(10),136,74+i*15,'#6a6ad0',9);r8Txt(x,l[1],196,74+i*15,i==3?'#ff6060':'#80ff80',9,'right')})}
 if(T>=18&&T<27){const C=['THE END','','STARRING','YOU','','AND THE HOTEL STAFF','RUSH  AMBUSH  SEEK','FIGURE  SCREECH','CREAK  HONCHO','OHIEN  FLOOF','','THANK YOU','FOR PLAYING!'];const y0=224-(T-18)*34;x.fillStyle='rgba(0,0,0,.55)';x.fillRect(0,0,256,224);C.forEach((s,i)=>{const yy=y0+i*16;if(yy>-12&&yy<224)r8Txt(x,s,128,yy,i==0?'#ffd860':i==3?'#80c0ff':'#ffffff',i==0?14:9)})}
 if(T>=27){x.fillStyle='rgba(0,0,0,.6)';x.fillRect(0,0,256,224);r8Txt(x,'THE END',128,70,'#ffd860',16);if(Math.floor(T*2)%2)r8Txt(x,'PRESS START',128,130,'#ffffff',10);r8Txt(x,'(click, E, space or enter)',128,148,'#8a8ab0',7)}
 /* scanlines and the obligatory watermark */x.fillStyle='rgba(0,0,0,.18)';for(let r=0;r<224;r+=2)x.fillRect(0,r,256,1);x.fillStyle='#fff';x.fillRect(0,0,98,9);r8Txt(x,'Unregistered HyperCam 2',2,1,'#000',7,'left');
 r8Seq(Z.seq,dt,T>27?120:150)}
{const es0=endStart;endStart=function(){const was=!!END;es0.apply(this,arguments);try{if(!was&&END&&MODS&&MODS.retro)r8EndStart()}catch(e){conLog('error','retro ending: '+e.message)}}}
{const eu0=endUpd;endUpd=function(dt){const E=END;if(E&&E.retro&&E.r8){E.t+=dt;try{r8EndDraw(dt)}catch(e){conLog('error','retro ending: '+e.message)}if(E.t>40)endFinish();return}return eu0.apply(this,arguments)}}
{const ef0=endFinish;endFinish=function(){const E=END;try{if(E&&E.r8&&E.r8.d)E.r8.d.remove()}catch(e){}return ef0.apply(this,arguments)}}

/* ---------------------------------- the 8-bit boiler hall ---------------------------------- */
const R8BH={lead:'A4 - C5 - E5 - A4 - G4 - B4 - D5 - G4 - F4 - A4 - C5 - F4 - E4 - G#4 - B4 - E5 -'.split(' '),bass:'A2 - - - A2 - - - G2 - - - G2 - - - F2 - - - F2 - - - E2 - - - E2 - - -'.split(' '),v:.022,drum:0};
const R8RUN={lead:'A5 G5 A5 E5 A5 G5 A5 C6 B5 A5 G5 E5 F5 E5 D5 E5'.split(' '),bass:'A2 A2 A3 A2 A2 A2 A3 A2 F2 F2 F3 F2 E2 E2 E3 E2'.split(' '),v:.024,drum:1};
const BH8={on:0,el:null,seq:null,run:0,card:0,pix:0};
function bh8Here(){try{return state=='play'&&MODS&&MODS.retro&&n==100&&puz&&puz.sl&&puz.sl.length>=10}catch(e){return false}}
function bh8El(){if(BH8.el)return BH8.el;const d=document.createElement('div');d.style.cssText='position:fixed;inset:0;z-index:41;pointer-events:none;font:bold 16px "Courier New",monospace;color:#fff;text-shadow:3px 3px 0 #000';
 d.innerHTML='<div class="cd" style="position:absolute;left:50%;top:30%;transform:translateX(-50%);text-align:center;background:#000;border:4px solid #fff;outline:4px solid #000;padding:14px 26px;display:none"><div style="font-size:30px;color:#ffd860;letter-spacing:4px">STAGE 100</div><div style="margin-top:8px;color:#ff6060">BOSS: FIGURE</div><div style="margin-top:6px;font-size:13px">FIND 10 BREAKERS · DON\'T MAKE A SOUND</div><div class="rd" style="margin-top:12px;font-size:22px;color:#80ff80">READY?</div></div>'+
  '<div class="bm" style="position:absolute;left:50%;bottom:120px;transform:translateX(-50%);background:#000;border:3px solid #fff;padding:6px 10px;display:flex;gap:8px;align-items:center"><span style="color:#ffd860">BREAKERS</span><span class="bx" style="display:flex;gap:3px"></span><span class="bn"></span></div>'+
  '<div class="wn" style="position:absolute;left:0;right:0;top:40%;text-align:center;font-size:44px;color:#ff2020;letter-spacing:6px;display:none">!! WARNING !!<div style="font-size:20px;color:#fff;letter-spacing:2px">THE DOOR IS OPEN · RUN!</div></div>';
 document.body.appendChild(d);BH8.el=d;return d}
function bh8Pixel(){/* chunky textures in the hall */try{G.traverse(o=>{const m=o.material;if(!m)return;for(const mm of(Array.isArray(m)?m:[m])){const t=mm.map;if(t&&t.magFilter!==THREE.NearestFilter){t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.needsUpdate=true}}})}catch(e){}}
function bh8Tick(dt){const here=bh8Here();
 if(!here){if(BH8.on){BH8.on=0;BH8.run=0;if(BH8.el)BH8.el.style.display='none'}return}
 const el=bh8El();if(!BH8.on){BH8.on=1;BH8.card=3.2;BH8.run=0;BH8.wn=0;BH8.seq=Object.assign({},R8BH,{i:0,acc:0});el.style.display='block';bh8Pixel();
  [['C5',0],['E5',.12],['G5',.24],['C6',.36],['G5',.6],['C6',.72]].forEach(([nn,w])=>r8Tone(r8N(nn),.16,.05,'square',(r8Ctx()||{currentTime:0}).currentTime+w));try{hint('🎮 STAGE 100: the boiler hall, arcade edition. Find 10 breakers. Figure is the boss.')}catch(e){}}
 const cd=el.querySelector('.cd');if(BH8.card>0){BH8.card-=dt;cd.style.display='block';cd.querySelector('.rd').style.visibility=(Math.floor(BH8.card*3)%2)?'visible':'hidden';if(BH8.card<=0)cd.style.display='none'}
 /* breaker meter */const ins=puz.ins|0,hv=puz.have|0,key=ins+'/'+hv;if(BH8.k!==key){BH8.k=key;let h='';for(let i=0;i<10;i++)h+='<span style="width:12px;height:16px;display:inline-block;background:'+(i<ins?'#20ff60':i<ins+hv?'#ffd040':'#333')+';border:2px solid #fff"></span>';el.querySelector('.bx').innerHTML=h;el.querySelector('.bn').textContent=ins+'/10'+(hv?' (+'+hv+')':'')}
 el.querySelector('.bm').style.display=puz.open?'none':'flex';
 /* the music: slow and creepy, then a fast chase once the power is on */
 if(puz.open&&!BH8.run){BH8.run=1;BH8.wn=3;BH8.seq=Object.assign({},R8RUN,{i:0,acc:0})}
 const wn=el.querySelector('.wn');if(BH8.wn>0){BH8.wn-=dt;wn.style.display=(Math.floor(BH8.wn*4)%2)?'block':'none';if(Math.random()<dt*6)r8Tone(880,.08,.04,'square')}else wn.style.display='none';
 if(BH8.card<=0||BH8.run)r8Seq(BH8.seq,dt,BH8.run?190:96)}
{let last=performance.now();setInterval(()=>{const now=performance.now(),dt=Math.min(.5,(now-last)/1000);last=now;try{bh8Tick(dt)}catch(e){}},50)}
