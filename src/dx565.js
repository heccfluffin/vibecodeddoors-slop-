/* =====================================================================================================
   r565: one look for the menus (the UI kit), a SETTINGS menu (sound, controls, graphics, accessibility, save data),
   a tabbed OWNER PANEL with player tools (go to, bring, freeze, heal, warn, kick, ban), a tabbed DEBUG menu with
   a teleport tab, and a tidier title screen.
   ===================================================================================================== */
try{dp.id='dp'}catch(e){}
const UIK=document.createElement('style');UIK.id='uikit';UIK.textContent=`
:root{--u-bg:#120b05;--u-card:#1c1209;--u-card2:#251810;--u-line:#4d3a1f;--u-gold:#d4a850;--u-gold2:#ffd98a;--u-text:#efe3c4;--u-mute:#b3a07a;--u-red:#c0453a;--u-green:#5fbf7a;--u-blue:#5fa0e0;--u-purple:#a07ae0}
.uik-ov{position:fixed;inset:0;z-index:70;background:rgba(6,3,1,.72);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:12px;box-sizing:border-box}
.uik-card,#staffDlg>div{background:linear-gradient(180deg,#22160b,#150d06)!important;border:1px solid var(--u-gold)!important;border-radius:16px!important;box-shadow:0 18px 60px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,220,150,.12);color:var(--u-text);font:15px Georgia,serif;box-sizing:border-box;max-height:92vh;overflow:hidden!important;display:flex;flex-direction:column;padding:0!important}
.uik-card{width:min(640px,96vw)}
.uik-hd{display:flex;align-items:center;gap:10px;padding:14px 18px 10px;border-bottom:1px solid var(--u-line)}
.uik-hd h2{margin:0;font-size:22px;letter-spacing:4px;flex:1;color:var(--u-gold2);font-weight:bold}
.uik-hd .uik-sub{display:block;font-size:12px;color:var(--u-mute);letter-spacing:0;font-weight:normal;margin-top:3px;line-height:1.35}
.uik-x{background:transparent!important;border:1px solid var(--u-line)!important;color:var(--u-mute)!important;width:34px;height:34px;border-radius:10px!important;font-size:18px!important;cursor:pointer;padding:0!important;margin:0!important}
.uik-x:hover{color:var(--u-text)!important;border-color:var(--u-gold)!important}
.uik-tabs{display:flex;gap:4px;padding:8px 12px 0;overflow-x:auto;border-bottom:1px solid var(--u-line);scrollbar-width:none}
.uik-tabs::-webkit-scrollbar{display:none}
.uik-tab{flex:0 0 auto;background:transparent;border:1px solid transparent;border-bottom:none;color:var(--u-mute);padding:8px 12px;border-radius:10px 10px 0 0;font:14px Georgia,serif;cursor:pointer;white-space:nowrap}
.uik-tab:hover{color:var(--u-text)}
.uik-tab.on{background:var(--u-card2);color:var(--u-gold2);border-color:var(--u-line);position:relative;top:1px}
.uik-body{padding:12px 18px 16px;overflow-y:auto;flex:1;-webkit-overflow-scrolling:touch}
.uik-ft{display:flex;gap:8px;justify-content:flex-end;padding:10px 16px;border-top:1px solid var(--u-line);background:rgba(0,0,0,.18)}
.uik-h{font-size:13px;letter-spacing:2px;text-transform:uppercase;color:var(--u-gold);margin:14px 0 6px;font-weight:bold}
.uik-h:first-child{margin-top:2px}
.uik-note{font-size:12px;color:var(--u-mute);line-height:1.45;margin:4px 0}
.uik-box{background:rgba(0,0,0,.22);border:1px solid var(--u-line);border-radius:12px;padding:4px 12px;margin:6px 0}
.uik-row{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid rgba(77,58,31,.55);min-height:28px}
.uik-row:last-child{border-bottom:none}
.uik-row .l{flex:1;min-width:0}
.uik-row .l small{display:block;color:var(--u-mute);font-size:12px;margin-top:1px}
.uik-btn,#staffDlg button:not(.uik-tab):not(.uik-x):not(.uik-btn),#dp .uik-card button:not(.uik-tab):not(.uik-x):not(.uik-btn){background:#2c1d10!important;color:var(--u-text)!important;border:1px solid #7a6034!important;border-radius:9px!important;padding:6px 12px!important;font:14px Georgia,serif!important;cursor:pointer;margin:2px!important;transition:background .12s,border-color .12s,transform .08s;line-height:1.25}
.uik-btn:hover,#staffDlg button:not(.uik-tab):not(.uik-x):not(.uik-btn):hover,#dp .uik-card button:not(.uik-tab):not(.uik-x):not(.uik-btn):hover{background:#3b2714!important;border-color:var(--u-gold)!important}
.uik-btn:active,#staffDlg button:active{transform:translateY(1px)}
.uik-btn.pri{background:linear-gradient(180deg,#3d6b45,#24482b)!important;border-color:#7fd08f!important;color:#eaffee!important}
.uik-btn.bad{background:#4a1712!important;border-color:#c0574a!important;color:#ffe2dc!important}
.uik-btn.warn{background:#4a3008!important;border-color:#d89a3a!important}
.uik-btn.cool{background:#14304a!important;border-color:#5fa0e0!important;color:#dcefff!important}
.uik-btn.vio{background:#2a1846!important;border-color:#a07ae0!important;color:#efe2ff!important}
.uik-btn.sm{padding:4px 9px!important;font-size:13px!important}
.uik-btn.on{border-color:#7fd08f!important;color:#b8ffc8!important}
.uik-in,#staffDlg input[type=text],#staffDlg input:not([type]),#dp .uik-card input[type=number],#dp .uik-card input[type=password]{background:#0f0904!important;color:var(--u-text)!important;border:1px solid #6a5230!important;border-radius:8px!important;padding:6px 9px!important;font:14px Georgia,serif!important;box-sizing:border-box}
.uik-in:focus,#staffDlg input:focus,#dp .uik-card input:focus{outline:none;border-color:var(--u-gold)!important;box-shadow:0 0 0 3px rgba(212,168,80,.18)}
.uik-sw{position:relative;width:46px;height:26px;flex:0 0 46px;cursor:pointer}
.uik-sw input{opacity:0;width:0;height:0;position:absolute}
.uik-sw span{position:absolute;inset:0;background:#3a2c1a;border:1px solid #6a5230;border-radius:26px;transition:.15s}
.uik-sw span:before{content:'';position:absolute;width:20px;height:20px;left:2px;top:2px;background:#cdb88e;border-radius:50%;transition:.15s}
.uik-sw input:checked+span{background:#2f6b3c;border-color:#7fd08f}
.uik-sw input:checked+span:before{transform:translateX(20px);background:#eaffee}
.uik-rng{display:flex;align-items:center;gap:8px;flex:0 0 min(46%,240px)}
.uik-rng input{flex:1;accent-color:var(--u-gold);height:22px;cursor:pointer}
.uik-rng b{width:40px;text-align:right;font-size:13px;color:var(--u-gold2);font-weight:normal}
.uik-seg{display:inline-flex;border:1px solid #6a5230;border-radius:9px;overflow:hidden;flex:0 0 auto}
.uik-seg button{background:transparent!important;border:none!important;border-radius:0!important;margin:0!important;padding:6px 11px!important;color:var(--u-mute)!important;font:13px Georgia,serif!important;cursor:pointer}
.uik-seg button.on{background:#3b2714!important;color:var(--u-gold2)!important}
.uik-pl{display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid var(--u-line);border-radius:12px;margin:6px 0;background:rgba(0,0,0,.2);flex-wrap:wrap}
.uik-pl .who{flex:1 1 180px;min-width:0}
.uik-pl .who b{color:var(--u-text)}
.uik-pl .who small{display:block;color:var(--u-mute);font-size:12px}
.uik-pl .acts{display:flex;flex-wrap:wrap;gap:2px;justify-content:flex-end}
.uik-chip{display:inline-flex;align-items:center;gap:5px;background:rgba(0,0,0,.28);border:1px solid var(--u-line);border-radius:999px;padding:4px 11px;font-size:13px;color:var(--u-text);white-space:nowrap}
.uik-chip b{color:var(--u-gold2)}
.uik-empty{color:var(--u-mute);font-size:13px;padding:10px;text-align:center;border:1px dashed var(--u-line);border-radius:12px;margin:6px 0}
.uik-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:6px}
.uik-grid .uik-btn{margin:0!important;text-align:left}
.uik-kbd{display:inline-block;border:1px solid #6a5230;border-bottom-width:2px;border-radius:5px;padding:0 6px;font:12px monospace;color:var(--u-gold2);background:#0f0904}
#staffDlg button[data-ae]:not(.uik-btn){background:#24163a!important;border-color:#8a64c8!important;color:#efe2ff!important}
#staffDlg h3{font-size:13px!important;letter-spacing:2px;text-transform:uppercase;color:var(--u-gold)!important;margin:14px 0 6px!important}
/* the debug menu */
#dp .uik-card{width:min(680px,96vw)}
#dp .uik-card details{border:none!important;margin:0!important;padding:0!important}
#dp .uik-card details>summary{display:none}
#dp .uik-card label{border-bottom:1px solid rgba(77,58,31,.45);padding:6px 4px!important}
#dp .uik-card input[type=number]{width:74px!important}
/* the title screen */
#m.uik-title{justify-content:flex-start;overflow-y:auto;padding:max(28px,6vh) 16px 30px}
#m.uik-title>h1{font-size:clamp(46px,9vw,84px)!important;letter-spacing:.32em!important;margin:0 0 4px!important;padding-left:.32em;color:#f3e2b4;text-shadow:0 0 30px rgba(212,168,80,.35),0 4px 0 #3a2410,0 8px 24px #000;font-weight:bold}
#m.uik-title>p:first-of-type{color:var(--u-mute);font-style:italic;margin:0 0 14px!important;font-size:16px}
#m.uik-title #how{display:none!important}
#m.uik-title #swn{font-size:12px!important;max-width:520px;opacity:.85;margin-top:12px}
#svb.uik-sv{margin:6px 0 4px!important;display:flex;flex-direction:column;align-items:center;gap:10px}
.uik-stats{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;max-width:760px}
.uik-nav{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;max-width:820px}
.uik-nav button{background:rgba(28,18,9,.85)!important;border:1px solid #7a6034!important;border-radius:999px!important;padding:7px 14px!important;margin:0!important;font:14px Georgia,serif!important;color:var(--u-text)!important}
.uik-nav button:hover{border-color:var(--u-gold)!important;background:#3b2714!important}
.uik-autosave{font-size:11px;color:var(--u-mute);opacity:.8}
#m .mnu{margin-top:6px}
#m .mnu-big{border-radius:16px!important;box-shadow:0 8px 28px rgba(0,0,0,.45)}
#m .mnu-sm{border-radius:12px!important;border-width:1px!important;box-shadow:0 4px 14px rgba(0,0,0,.35)}
#m .mnu-big:hover,#m .mnu-sm:hover{filter:brightness(1.18);transform:translateY(-1px)}
.uik-gear{position:fixed;top:10px;right:10px;z-index:25;background:rgba(28,18,9,.88);color:var(--u-text);border:1px solid #7a6034;border-radius:12px;padding:7px 12px;font:14px Georgia,serif;cursor:pointer;display:none}
.uik-gear:hover{border-color:var(--u-gold)}
.uik-gear-r{right:auto;left:10px}
@media (max-width:560px){.uik-hd h2{font-size:18px;letter-spacing:2px}.uik-body{padding:10px 12px 14px}.uik-rng{flex-basis:52%}.uik-pl .acts{justify-content:flex-start}}
`;document.head.appendChild(UIK);
const uE=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function uikOverlay(id,html,onClose){let d=document.getElementById(id);if(!d){d=document.createElement('div');d.id=id;d.className='uik-ov';for(const ev of['mousedown','keydown','keyup','touchstart','click','wheel'])d.addEventListener(ev,e=>e.stopPropagation());d.addEventListener('click',e=>{if(e.target===d){d.style.display='none';onClose&&onClose()}});document.body.appendChild(d)}
 d.innerHTML=html;d.style.display='flex';try{document.exitPointerLock()}catch(e){}return d}

/* ---------- SOUND: master / music / effects volume and mute, for every sound in the game ---------- */
const AUD={m:1,mu:1,fx:1,off:0};try{Object.assign(AUD,JSON.parse(localStorage.getItem('doorsAud')||'{}'))}catch(e){}
const MEDIA=new Set();let MSENS=1;try{MSENS=+localStorage.getItem('doorsSens')||1}catch(e){}if(!(MSENS>0))MSENS=1;
function audScale(el){if(el.__wa)return 1;return(AUD.off?0:AUD.m)*(el.tagName=='VIDEO'?AUD.fx:AUD.mu)}
(function(){try{const vd=Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype,'volume');if(!vd||vd.__doors)return;
 const nd={configurable:true,enumerable:true,get(){return this.__dv!=null?this.__dv:vd.get.call(this)},set(v){v=+v;if(!(v>=0))v=0;this.__dv=Math.min(1,v);MEDIA.add(this);vd.set.call(this,Math.max(0,Math.min(1,this.__dv*audScale(this))))}};nd.set.__doors=1;
 Object.defineProperty(HTMLMediaElement.prototype,'volume',nd);
 document.addEventListener('play',e=>{const el=e.target;if(el&&el.tagName&&(el.tagName=='AUDIO'||el.tagName=='VIDEO')&&el.__dv==null)el.volume=1},true)}catch(e){}})();
(function(){try{const B=window.AudioContext||window.webkitAudioContext;if(!B||B.__doors)return;
 const DD=Object.getOwnPropertyDescriptor(B.prototype,'destination')||Object.getOwnPropertyDescriptor(Object.getPrototypeOf(B.prototype),'destination');
 window.audWrap=c=>{try{if(!c||c.__mst)return;const real=DD.get.call(c);const mst=c.createGain(),fx=c.createGain(),mus=c.createGain();fx.connect(mst);mus.connect(mst);mst.connect(real);
   c.__mst=mst;c.__fx=fx;c.__mus=mus;c.__real=real;Object.defineProperty(c,'destination',{value:fx,configurable:true});audApplyCtx(c)}catch(e){}};
 class DAC extends B{constructor(...a){super(...a);audWrap(this)}}
 DAC.__doors=1;window.AudioContext=DAC;if(window.webkitAudioContext)window.webkitAudioContext=DAC;
 /* a context made before this ran (a sound during loading) gets the same volume controls for everything it plays from now on */try{if(typeof AC!='undefined'&&AC)audWrap(AC)}catch(e){}}catch(e){}})();
function audApplyCtx(c){try{if(!c||!c.__mst)return;const t=c.currentTime;c.__mst.gain.setTargetAtTime(AUD.off?0:AUD.m,t,.03);c.__fx.gain.setTargetAtTime(AUD.fx,t,.03);c.__mus.gain.setTargetAtTime(AUD.mu,t,.03)}catch(e){}}
function audApply(){try{localStorage.setItem('doorsAud',JSON.stringify(AUD))}catch(e){}try{if(typeof AC!='undefined')audApplyCtx(AC)}catch(e){}for(const el of MEDIA){try{if(!el.isConnected&&el.paused&&!el.src){MEDIA.delete(el);continue}el.volume=el.__dv==null?1:el.__dv}catch(e){}}}

/* ---------- SETTINGS ---------- */
let SETT='sound';
function setOpen(tab){if(tab)SETT=tab;const T=[['game','🕹️ Game'],['sound','🔊 Sound'],['controls','🎮 Controls'],['video','🖥️ Graphics'],['access','🦻 Accessibility'],['save','💾 Save data']];
 const sw=(id,on)=>'<label class="uik-sw"><input type="checkbox" data-sw="'+id+'"'+(on?' checked':'')+'><span></span></label>';
 const rng=(id,v,min,max,step,fmt)=>'<div class="uik-rng"><input type="range" data-rng="'+id+'" min="'+min+'" max="'+max+'" step="'+step+'" value="'+v+'"><b data-rv="'+id+'">'+fmt(v)+'</b></div>';
 const pc=v=>Math.round(v*100)+'%',mx=v=>(+v).toFixed(1)+'×';
 const seg=(id,opts,cur)=>'<div class="uik-seg">'+opts.map(o=>'<button data-seg="'+id+'" data-v="'+o[0]+'" class="'+(o[0]==cur?'on':'')+'">'+o[1]+'</button>').join('')+'</div>';
 const row=(l,sub,ctl)=>'<div class="uik-row"><div class="l">'+l+(sub?'<small>'+sub+'</small>':'')+'</div>'+ctl+'</div>';
 let b='';
 if(SETT=='sound')b='<div class="uik-box">'+row('🔇 Mute everything','All game sound off (chat videos too).',sw('off',AUD.off))+row('🔊 Master volume','',rng('m',AUD.m,0,1,.05,pc))+row('🎵 Music','Lobby music, chase music, the desert radio.',rng('mu',AUD.mu,0,1,.05,pc))+row('💥 Sound effects','Doors, entities, footsteps, cars, chat videos.',rng('fx',AUD.fx,0,1,.05,pc))+'</div><div class="uik-note">Saved on this device.</div>';
 else if(SETT=='game')b='<div class="uik-box">'+row('🚌 Skip the Desert Bus ride','Go straight to the desert: no bus ride, no cutscene.',sw('skipbus',BSKIP()))+row('🚨 Desert crime','Robberies, getaway cars and police chases out in the desert.',sw('g_crime',!!GSET.crime))+row('📍 Map waypoints','Pins and routes for your jobs on the map.',sw('g_wps',!!GSET.wps))+row('🏷️ Place-name banners','The big name that appears when you arrive somewhere in the desert.',sw('g_ban',!!GSET.ban))+row('📳 Camera shake','Explosions, landings, launches.',rng('g_shake',GSET.shake==null?1:GSET.shake,0,1,.05,pc))+'</div><div class="uik-note">Saved on this device.</div>';
 else if(SETT=='controls')b='<div class="uik-box">'+row('🖱️ Mouse look speed','How fast the camera turns with the mouse.',rng('sens',MSENS,.3,3,.1,mx))+row('📱 Touch controls','On-screen joystick and buttons.',seg('touch',[['auto','Auto'],['on','On'],['off','Off']],MOB.pref))+row('👆 Touch look speed','',rng('tsens',MOB.sens,.5,2.5,.1,mx))+'</div>'+
  '<div class="uik-h">Keys</div><div class="uik-note" style="line-height:2"><span class="uik-kbd">WASD</span> move · <span class="uik-kbd">E</span> interact · <span class="uik-kbd">C</span>/<span class="uik-kbd">Space</span> crouch · <span class="uik-kbd">F</span> flashlight · <span class="uik-kbd">L</span> lantern · <span class="uik-kbd">/</span> chat · <span class="uik-kbd">Tab</span> players · <span class="uik-kbd">B</span> badges · <span class="uik-kbd">J</span> journal · <span class="uik-kbd">Alt</span> free the mouse · <span class="uik-kbd">F8</span> console · <span class="uik-kbd">`</span> debug</div>'+
  '<div style="margin-top:6px"><button class="uik-btn" data-act="how">📖 Full how-to-play guide</button></div>';
 else if(SETT=='video')b='<div class="uik-box">'+row('🖥️ Graphics quality',(typeof SOFT!='undefined'&&SOFT?'Software rendering detected: Low is smoother. ':'')+'Auto picks for you.',seg('gq',[['auto','Auto'],['low','Low'],['high','High']],GQ))+row('⛶ Fullscreen','',' <button class="uik-btn sm" data-act="fs">Go fullscreen</button>')+'</div>';
 else if(SETT=='access')b='<div class="uik-box">'+row('🦻 Deaf mode','Sounds get captions at the top of the screen, and the screen edges flash red when something is coming.',sw('deaf',DEAF.on))+row('🌈 Rainbow entities','Entities glow in rainbow colours (easier to see).',sw('rbe',!!SV.rbe))+'</div>';
 else if(SETT=='save')b='<div class="uik-box">'+row('💾 Export save','A code with your gold, items, badges and stats. Keep it somewhere safe.','<button class="uik-btn sm" data-act="svx">Export</button>')+row('📥 Import save','Paste a code from Export, on any device.','<button class="uik-btn sm" data-act="svi">Import</button>')+row('🗑️ Reset save','Erase your gold, items and stats. Cannot be undone.','<button class="uik-btn sm bad" data-act="svr">Reset</button>')+'</div><div class="uik-note">'+(typeof svOK!='undefined'&&svOK?'✔ Autosaved in this browser.':'⚠️ Browser storage is unavailable here, so use Export to keep your save.')+'</div>'+
  '<div class="uik-h">More</div><button class="uik-btn" data-act="con">📋 Console (F8)</button><button class="uik-btn" data-act="dbg">🛠️ Debug menu</button>';
 const d=uikOverlay('setDlg','<div class="uik-card"><div class="uik-hd"><h2>⚙ SETTINGS</h2><button class="uik-x" data-act="x">✕</button></div><div class="uik-tabs">'+T.map(t=>'<button class="uik-tab'+(t[0]==SETT?' on':'')+'" data-tab="'+t[0]+'">'+t[1]+'</button>').join('')+'</div><div class="uik-body">'+b+'</div></div>',setClosed);
 d.onclick=e=>{e.stopPropagation();const t=e.target.closest('[data-tab],[data-act],[data-seg]');if(!t)return;
  if(t.dataset.tab){setOpen(t.dataset.tab);return}
  if(t.dataset.seg){const v=t.dataset.v,k=t.dataset.seg;if(k=='touch'){MOB.pref=v;try{localStorage.setItem('doorsTouch',v)}catch(x){}try{mobApply()}catch(x){}try{tcbLabel()}catch(x){}}if(k=='gq'){GQ=v;try{localStorage.setItem('doorsGQ',GQ)}catch(x){}QS=lowFx()?.6:1;try{applyQS();sync();gqLabel()}catch(x){}}setOpen();return}
  const a=t.dataset.act;if(a=='x'){setClose();return}if(a=='fs'){try{mobFS()}catch(x){}return}if(a=='how'){howOpen();return}
  if(a=='svx'){setClose();svPanel('x');return}if(a=='svi'){setClose();svPanel('i');return}if(a=='svr'){svReset();setOpen();return}if(a=='con'){setClose();try{conToggle(true)}catch(x){}return}if(a=='dbg'){setClose();try{dbgOpen()}catch(x){}return}};
 d.onchange=e=>{const t=e.target;if(t.dataset.sw){const k=t.dataset.sw,on=t.checked;if(k=='off'){AUD.off=on?1:0;audApply()}else if(k=='deaf'){deafSet(on)}else if(k=='rbe'){SV.rbe=on?1:0;saveGame()}}};
 d.oninput=e=>{const t=e.target;if(!t.dataset.rng)return;const k=t.dataset.rng,v=+t.value;const lab=d.querySelector('[data-rv="'+k+'"]');
  if(k=='m'||k=='mu'||k=='fx'){AUD[k]=v;if(AUD.off&&v>0&&k=='m'){AUD.off=0;const c=d.querySelector('[data-sw="off"]');if(c)c.checked=false}audApply();if(lab)lab.textContent=Math.round(v*100)+'%';if(k!='mu')try{snd(660,.05)}catch(x){}}
  else if(k=='sens'){MSENS=v;try{localStorage.setItem('doorsSens',v)}catch(x){}if(lab)lab.textContent=v.toFixed(1)+'×'}
  else if(k=='tsens'){MOB.sens=v;try{localStorage.setItem('doorsTouchSens',v)}catch(x){}if(lab)lab.textContent=v.toFixed(1)+'×'}}}
function setClose(){const d=document.getElementById('setDlg');if(d)d.style.display='none';setClosed()}
function setClosed(){try{if(state=='play'&&!MOB.on&&!(document.getElementById('staffDlg')||{}).style?.display?.includes('flex'))R.domElement.requestPointerLock()}catch(e){}}
function howOpen(){const h=document.getElementById('how');const d=uikOverlay('howDlg','<div class="uik-card" style="width:min(720px,96vw)"><div class="uik-hd"><h2>📖 HOW TO PLAY</h2><button class="uik-x" data-act="x">✕</button></div><div class="uik-body" style="line-height:1.55;font-size:14px">'+(h?h.innerHTML:'')+'</div></div>');
 d.querySelectorAll('h3').forEach(x=>{x.className='uik-h'});d.querySelectorAll('[style*="display:none"]').forEach(x=>{if(x.id=='howTouch'&&MOB.on)x.style.display='block'});d.onclick=e=>{e.stopPropagation();if(e.target.closest('[data-act="x"]'))d.style.display='none'}}
/* the gear button: replaces the four floating buttons (graphics, touch, deaf mode, debug) on menu screens */
const GEAR=document.createElement('button');GEAR.className='uik-gear';GEAR.textContent='⚙ Settings';GEAR.onclick=e=>{e.stopPropagation();setOpen()};document.body.appendChild(GEAR);
try{gqb.style.setProperty('visibility','hidden');tcb.style.setProperty('visibility','hidden');deafBtn.style.setProperty('visibility','hidden');dbb.style.setProperty('visibility','hidden')}catch(e){}
setInterval(()=>{try{const m=$('m'),show=!!m&&m.style.display!='none'&&state!='play'&&state!='spec';GEAR.style.display=show?'block':'none';for(const b of[gqb,tcb,deafBtn,dbb])b.style.pointerEvents='none'}catch(e){}},300);

/* ---------- the title screen: tidy stats, one row of rounded buttons, the guide behind a button ---------- */
function svStatsChips(){const kk=Object.entries(SV.k||{}).sort((a,b)=>b[1]-a[1])[0];const c=(i,l,v)=>'<span class="uik-chip">'+i+' '+l+' <b>'+v+'</b></span>';
 return '<div class="uik-stats">'+c('🏆','Best door',SV.best)+c('🔁','Runs',SV.runs)+c('💀','Deaths',SV.deaths)+c('🚪','Escapes',SV.wins)+c('🪙','Lifetime gold',SV.gold)+(SV.saved?c('🛡️','Saved by items',SV.saved):'')+(kk?c('☠️','Top killer',uE(kk[0])+' ×'+kk[1]):'')+'</div>'}
svHtml=function(shop){const B=(l,f)=>'<button onclick="event.stopPropagation();'+f+'">'+l+'</button>';
 return '<div id="svb" class="uik-sv">'+svStatsChips()+'<div class="uik-nav">'+(shop&&runLoad()?B('▶ Continue run (door '+runLoad().n+')','contRun()'):'')+(shop?B('🛒 Shop','menu(\'SHOP\',\'Spend your gold before a run.\')'):'')+
  bdBtn().replace(/ style="[^"]*"/,'')+B('📓 Journal ('+jnCount()+'/'+LORE.length+')','journalPanel()')+B('👥 Friends','friendsPanel()')+B('👤 Account','acctPanel()')+B('🌐 Co-op','mpPanel()')+(myRank()?B('<span class="rbt">👑 Owner panel</span>','admPanel()'):'')+B('📖 How to play','howOpen()')+'</div></div>'};
function uikTitle(){const m=$('m');if(!m)return;const isTitle=!!document.getElementById('how')&&m.style.display!='none';m.classList.toggle('uik-title',isTitle||!!m.querySelector('#svb'))}
setInterval(uikTitle,400);setTimeout(()=>{try{const b=$('svb');if(b)b.outerHTML=svHtml(1)}catch(e){}uikTitle()},120);

/* ---------- the pause screens get a Settings button ---------- */
{const gp0=goPause;goPause=function(){const r=gp0.apply(this,arguments);try{if(state=='paused'){const m=$('m');if(m&&!m.querySelector('[data-setp]'))m.insertAdjacentHTML('beforeend','<div style="margin-top:14px"><button data-setp class="uik-btn" onclick="event.stopPropagation();setOpen()">⚙ Settings</button></div>')}}catch(e){}return r}}
try{if(!hubPE.querySelector('#hpS')){const b=document.createElement('button');b.id='hpS';b.textContent='⚙ Settings';b.style.cssText='margin:4px;padding:8px 18px;font:16px Georgia;cursor:pointer;border-radius:8px;border:2px solid #7a6034;background:#2a1c10;color:#ffe9a8';b.onclick=e=>{e.stopPropagation();setOpen()};hubPE.insertBefore(b,hubPE.querySelector('#hpL').nextSibling)}}catch(e){}

/* ---------- STAFF PLAYER TOOLS ---------- */
function stCtx(){if(HUB.on)return'hub';const q=typeof BUS!='undefined'&&BUS.ride;if(state=='bus'&&q&&q.roam)return'desert';if(MP.on&&(state=='play'||state=='spec'||state=='paused'))return'run';return''}
function stPlayers(){const L=[],seen={};const add=(pid,nm,where,c)=>{if(!pid||pid===SV.pid||seen[pid])return;seen[pid]=1;const u=uidOfPid(pid)||'';L.push({pid,nm:String(nm||'Player'),where,c,u,rk:u?rankOfUid(u):''})};
 try{if(HUB.on)for(const id in HUB.ps)add(id,HUB.ps[id].nm,'🏨 In the lobby','hub')}catch(e){}
 try{const q=BUS.ride;if(q&&q.vnet&&q.roam)for(const id in q.vnet.rem){const r=q.vnet.rem[id];if(Date.now()-(r.t||0)<12000)add(id,r.nm,'🏜️ In the desert','desert')}}catch(e){}
 try{if(MP.on)for(const id in MP.remotes){const r=MP.remotes[id];add(id,r.name,r.n>=0?'🚪 Door '+r.n+(r.dd?' · down':''):'🌐 In your co-op game','run')}}catch(e){}
 return L}
function stWhere(pid){if(HUB.on){const q=HUB.ps[pid];if(q&&q.x!=null)return{c:'hub',x:q.x,z:q.z}}
 const B=BUS.ride;if(B&&B.roam&&B.vnet&&B.vnet.rem[pid]){const r=B.vnet.rem[pid];return{c:'desert',x:r.x,z:r.z,dy:r.dy||0}}
 const r=MP.on&&MP.remotes[pid];if(r&&r.n>=0)return{c:'run',x:r.x,z:r.z,dy:r.dy||0,n:r.n};return null}
function stMe(){const c=stCtx();if(c=='desert'){const q=BUS.ride;return{c,x:+P.x.toFixed(2),z:+(P.z-q.OZ).toFixed(2),dy:+(P.dy||0).toFixed(2)}}return{c,x:+P.x.toFixed(2),z:+P.z.toFixed(2),dy:+(P.dy||0).toFixed(2),n:typeof n=='number'?n:0}}
function stGo(w){const c=stCtx();if(!w)return'they are not here';if(w.c!==c)return'you are not in the same place ('+({hub:'the lobby',desert:'the desert',run:'a run'}[w.c]||'somewhere else')+')';const ox=.9*(Math.random()<.5?-1:1);
 if(c=='hub'){P.x=w.x+ox;P.z=w.z;P.dy=0}
 else if(c=='desert'){const q=BUS.ride;if(q.jail)return'you are in jail';if(q.seat)try{vehExit(q,true)}catch(e){}if(q.inBus||q.seat)return'you are in a vehicle';P.x=w.x+ox;P.z=w.z+q.OZ;P.dy=w.dy||0}
 else if(c=='run'){if(w.n!==n){if(w.n>n&&MP.host)try{mpWarpTo(w.n)}catch(e){return'could not get to door '+w.n}else return w.n>n?'they are ahead of you (door '+w.n+'): only the host can jump ahead':'they are behind you (door '+w.n+')'}P.hid=null;P.sit=null;P.vent=0;P.x=w.x+ox*.6;P.z=w.z;P.dy=w.dy||0}
 else return'teleporting works in the lobby, the desert and co-op runs';
 try{vfx('ring',P.x,(P.dy||0)+1,P.z,{c:0xd4a850,s:1.6})}catch(e){}try{snd(880,.06);setTimeout(()=>snd(1320,.08),70)}catch(e){}return''}
function stSend(k,o){if(!myRank()){hint('🛡️ Staff only.');return false}const a=JSON.stringify(Object.assign({by:SV.nm||''},o));const rg=(REG&&REG.v&&JSON.stringify(REG).length<20000)?REG:null;let sent=0;
 try{if(MP.on&&mpOpen().length){mpSend({t:'ae',id:SV.pid,k:'st:'+k,a,ix:ixOut(),r:rg});sent=1}}catch(e){}
 try{if(HUB.on&&PUB.cl&&PUB.cl.connected&&HUB.key){let m={i:SV.pid,k:'st:'+k,a,ix:ixOut(),r:rg};if(JSON.stringify(m).length>690)delete m.r;PUB.cl.publish(HUB.key+'ae',JSON.stringify(m));sent=1}}catch(e){}return sent}
const stName=pid=>{const p=stPlayers().find(x=>x.pid===pid);return p?p.nm:'that player'};
function stAct(act,pid,arg){const nm=stName(pid);
 if(act=='tp'){const why=stGo(stWhere(pid));if(why)hint('📍 Could not go to '+nm+': '+why+'.');else{hint('📍 You teleported to '+nm+'.');try{staffClose()}catch(e){}try{dbgClose()}catch(e){}}return}
 if(act=='bring'){if(stSend('bring',{to:pid,w:stMe()}))sysLine('🧲 Bringing '+nm+' to you…');else hint('🧲 '+nm+' is not connected to you.');return}
 if(act=='freeze'){if(stSend('freeze',{to:pid,s:5}))sysLine('🧊 Froze '+nm+' for 5 seconds.');return}
 if(act=='heal'){if(stSend('heal',{to:pid}))sysLine('💚 Healed '+nm+'.');return}
 if(act=='rank'){let r=arg;if(r==null){try{r=prompt('Army rank for '+nm+' (e.g. Sergeant), or "undo" to undo their last bust:')}catch(e){r=''}}r=String(r||'').trim();if(!r)return;if(r.toLowerCase()!='undo'&&rkFind(r)<0){hint('🎖️ Ranks: '+MILRANK.map(k=>k[0]).join(', '));return}if(stSend('rank',{to:pid,a:r}))sysLine('🎖️ Sent to '+nm+': '+(r.toLowerCase()=='undo'?'undo their last bust':milRankNm(rkFind(r))));return}
 if(act=='warn'){let m=arg;if(m==null){try{m=prompt('Warning for '+nm+' (they see it big on their screen):')}catch(e){m=''}}m=String(m||'').trim().slice(0,100);if(!m)return;if(stSend('warn',{to:pid,m}))sysLine('⚠️ Warned '+nm+': '+m);return}
 const u=uidOfPid(pid);
 if(act=='kick'){if(!u){hint('👢 '+nm+' has no user ID yet.');return}let w=arg;if(w==null){try{w=prompt('Reason (optional)')||''}catch(e){w=''}}srvKick(u,w,nm);return}
 if(act=='ban'){if(!u){hint('🚫 '+nm+' has no user ID yet.');return}let w=arg;if(w==null){try{w=prompt('Reason (optional)')||''}catch(e){w=''}}staffBan(u,w,nm);return}
 if(act=='admin'){if(!u)return;ownSetAdmin(u,nm,1);return}if(act=='unadmin'){if(!u)return;ownSetAdmin(u,'',0);return}
 if(act=='copy'){try{navigator.clipboard.writeText(u||'')}catch(e){}hint('📋 Copied '+(u||'(no ID)'));return}}
function stDo(k,a,nm,id){let o;try{o=JSON.parse(a)}catch(e){return}if(!o||o.to!==SV.pid)return;const who='🛡️ '+(nm||'Staff');const T=ABUSE.t,now=performance.now()/1000;
 if(k=='bring'){const why=stGo(o.w);if(why){sysLine(who+' tried to bring you to them, but '+why+'.');return}abuseBanner('🧲 BROUGHT',who+' brought you to them');return}
 if(k=='freeze'){T.freeze=now+Math.max(1,Math.min(10,+o.s||5));abuseBanner('🧊 FROZEN 🧊',who);try{snd(1500,.3)}catch(e){}return}
 if(k=='heal'){try{hp=mhp;updHud()}catch(e){}abuseBanner('💚 HEALED',who);try{snd(990,.12)}catch(e){}return}
 if(k=='warn'){abuseBanner('⚠️ '+String(o.m||'').slice(0,100),'— a warning from '+who);sysLine('⚠️ Warning from '+who+': '+String(o.m||'').slice(0,100));try{snd(300,.4);setTimeout(()=>snd(300,.4),350)}catch(e){}return}}
{const ai0=abuseIn;abuseIn=async function(id,k,a,nm,ix,rg){if(typeof k=='string'&&k.startsWith('st:')){let rk=rkOf(id);if(!rk){try{if(rg)await regIn(rg)}catch(e){}try{if(ix)await rkLearn(id,ix)}catch(e){}rk=rkOf(id)}if(!rk)return;try{const p=JSON.parse(a);if((!nm||nm=='An admin')&&p&&p.by)nm=fsName(String(p.by))||nm}catch(e){}stDo(k.slice(3),String(a||''),nm,id);return}return ai0.apply(this,arguments)}}
function stFind(q){q=String(q||'').trim().toLowerCase();if(!q)return[];const L=stPlayers();const ex=L.filter(p=>p.nm.toLowerCase()==q||(p.u&&p.u.toLowerCase()==q));if(ex.length)return ex;const pre=L.filter(p=>p.nm.toLowerCase().startsWith(q));return pre.length?pre:L.filter(p=>p.nm.toLowerCase().includes(q))}
/* chat commands: /tp /bring /freeze /heal /warn /kick /settings /cmds */
{const c0=mpChatCmd;mpChatCmd=function(t){const m=String(t).match(/^\/\s*(\S+)\s*(.*)$/);if(!m)return c0.apply(this,arguments);const cmd=m[1].toLowerCase(),arg=m[2].trim();
  if(cmd=='settings'||cmd=='options'){setOpen();return true}
  if(cmd=='cmds'||cmd=='commands'||cmd=='help'){sysLine('💬 Commands: /settings · /id · /friend'+(myRank()?' · STAFF: /door 50 (everyone) · /tp name · /bring name · /freeze name · /heal name · /warn name message · /kick name [reason] · /ban name [reason] · /rank Sergeant · /admin · /debug':''));return true}
  const ST={tp:'tp',goto:'tp',bring:'bring',summon:'bring',freeze:'freeze',heal:'heal',warn:'warn',kick:'kick'};if(!ST[cmd])return c0.apply(this,arguments);
  if(!myRank()){sysLine('🛡️ /'+cmd+' is for admins and the owner.');return true}
  let nm=arg,rest=null;if(cmd=='warn'||cmd=='kick'){const sp=arg.indexOf(' ');let f=stFind(arg);if(!f.length&&sp>0){nm=arg.slice(0,sp);rest=arg.slice(sp+1)}else rest=cmd=='kick'?'':null}
  const f=stFind(nm);if(!nm){sysLine('Who? /'+cmd+' <name>'+(cmd=='warn'?' <message>':''));return true}if(!f.length){sysLine('Nobody called "'+nm+'" is here. Here: '+(stPlayers().map(p=>p.nm).join(', ')||'nobody'));return true}if(f.length>1){sysLine('Which one? '+f.map(p=>p.nm).join(', '));return true}
  stAct(ST[cmd],f[0].pid,rest);return true}}

/* ---------- the OWNER PANEL, in tabs ---------- */
let ADMT='players',ADMTI=0;
admPanel=function(){const r=myRank();if(!r){acctPanel();return}admOpen=1;const own=r=='owner'&&!!ID.own;const T=[['players','👥 Players'],['events','🎪 Events'],['mod','🛡️ Moderation'],['tools','🧰 Tools']];
 let b='';
 if(ADMT=='players')b='<div class="uik-h">Here with you</div><div id="stPl">'+stPlHtml()+'</div><div class="uik-note">📍 Go to = teleport yourself to them · 🧲 Bring = teleport them to you · works in the lobby, the desert and co-op runs. Chat works too: /tp, /bring, /freeze, /heal, /warn, /kick (type /cmds).</div>'+
  '<div class="uik-h">Online anywhere (DOORS server)</div><div class="uik-note">Menus, lobby, co-op, the desert. KICK = out for 10 minutes · BAN = their device and their connection.</div><div id="srvWhoBox"></div>';
 else if(ADMT=='events')b='<div class="uik-h">Fun events</div>'+abuseSection()+'<div class="uik-h">Help</div><button class="uik-btn vio" onclick="event.stopPropagation();admReviveAll()">💜 Revive everyone (free)</button><div class="uik-note">Gets every downed player in your co-op game back up.</div>';
 else if(ADMT=='mod'){const bans=Object.keys(Object.assign({},REG.ban,ADM)).map(u=>({u,b:banInfo(u)})).filter(x=>x.b).sort((a,b)=>b.b.at-a.b.at);
  b='<div class="uik-h">Ban a user ID</div><div style="display:flex;gap:6px;flex-wrap:wrap"><input id="admU" class="uik-in" placeholder="U-XXXX-XXXX" style="width:150px"><input id="admW" class="uik-in" placeholder="reason (optional)" style="flex:1;min-width:140px"><button class="uik-btn bad" onclick="event.stopPropagation();staffBan(document.getElementById(\'admU\').value,document.getElementById(\'admW\').value,\'\')">🚫 Ban</button></div>'+
  '<div class="uik-h">Banned ('+bans.length+')</div>'+(bans.length?bans.slice(0,200).map(x=>'<div class="uik-pl"><div class="who">'+(x.b.n?'<b>'+uE(x.b.n)+'</b> ':'')+'<span style="font-family:monospace;font-size:12px">'+x.u+'</span><small>by '+uE(x.b.by)+' · '+new Date(x.b.at).toLocaleDateString()+(x.b.why?' · '+uE(x.b.why):'')+'</small></div><div class="acts"><button class="uik-btn sm" onclick="event.stopPropagation();staffBan(\''+x.u+'\',\'\',\'\',1)">Unban</button></div></div>').join(''):'<div class="uik-empty">Nobody is banned.</div>')+
  '<div class="uik-h">Staff</div>'+(Object.keys(REG.adm||{}).length?Object.keys(REG.adm).map(u=>'<div class="uik-pl"><div class="who">🛡️ '+(REG.adm[u].n?'<b>'+uE(REG.adm[u].n)+'</b> ':'')+'<span style="font-family:monospace;font-size:12px">'+u+'</span></div><div class="acts">'+(own?'<button class="uik-btn sm" onclick="event.stopPropagation();ownSetAdmin(\''+u+'\',\'\',0)">Remove admin</button>':'')+'</div></div>').join(''):'<div class="uik-empty">No admins yet.</div>')+
  (own?'<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px"><input id="admA" class="uik-in" placeholder="U-XXXX-XXXX" style="width:150px"><input id="admAN" class="uik-in" placeholder="name (optional)" style="flex:1;min-width:120px"><button class="uik-btn vio" onclick="event.stopPropagation();ownSetAdmin(document.getElementById(\'admA\').value,document.getElementById(\'admAN\').value,1)">🛡️ Make admin</button></div><div class="uik-note">👑 Owner devices: '+(REG.own||[]).join(', ')+'</div>':'<div class="uik-note">Making and removing admins needs the owner key.</div>')+
  '<div class="uik-note" style="margin-top:10px">Ban list: '+uE(ID.syncMsg)+(REG.v?' · version '+new Date(REG.v).toLocaleString():'')+' <button class="uik-btn sm" onclick="event.stopPropagation();regSync().then(()=>admPanel())">🔄 Sync now</button></div>'}
 else if(ADMT=='tools')b='<div class="uik-h">Chat & name style</div>'+chatStyleBox()+
  '<div class="uik-h">Desert Bus speed · now ×'+(+BUSSPD.toFixed(2))+'</div><div>'+[.5,1,2,3,5,10].map(m=>'<button class="uik-btn sm'+(BUSSPD==m?' on':'')+'" onclick="event.stopPropagation();busSpdSet('+m+');admPanel()">×'+m+'</button>').join('')+' <input id="admBS" class="uik-in" placeholder="×" style="width:64px"><button class="uik-btn sm" onclick="event.stopPropagation();busSpdCustom()">Set</button></div><div class="uik-note">For everyone on the Desert Bus (×0.1 to ×50).</div>'+
  '<div class="uik-h">Shortcuts</div><div class="uik-grid"><button class="uik-btn" onclick="event.stopPropagation();staffClose();dbgOpen()">🛠️ Debug menu</button><button class="uik-btn cool" onclick="event.stopPropagation();liveOpen()">🌐 Every game online</button><button class="uik-btn" onclick="event.stopPropagation();staffClose();conToggle(true)">📋 Console</button><button class="uik-btn" onclick="event.stopPropagation();setOpen()">⚙ Settings</button></div>'+
  '<div class="uik-h">Staff chat commands</div><div class="uik-note" style="line-height:1.9">/door 50 · /tp name · /bring name · /freeze name · /heal name · /warn name message · /kick name reason · /ban name reason · /rank Sergeant · /rank undo · /rank name Sergeant · /rank name undo · /admin · /debug · /id</div>';
 staffDlg('<div class="uik-hd"><h2>👑 OWNER PANEL<div class="uik-sub">'+ID.uid+' · '+(own?'owner key on this device':'Owner')+'</div></h2><button class="uik-x" onclick="event.stopPropagation();staffClose()">✕</button></div><div class="uik-tabs">'+T.map(t=>'<button class="uik-tab'+(t[0]==ADMT?' on':'')+'" onclick="event.stopPropagation();ADMT=\''+t[0]+'\';admPanel()">'+t[1]+'</button>').join('')+'</div><div class="uik-body">'+b+'</div>',1);
 const d=document.getElementById('staffDlg');try{d.firstChild.style.width='min(760px,96vw)'}catch(e){}
 if(!d.__st){d.__st=1;d.addEventListener('click',e=>{const t=e.target.closest('[data-st]');if(!t)return;e.stopPropagation();stAct(t.dataset.st,t.dataset.pid)})}
 setTimeout(()=>{try{abuseWire(d)}catch(e){}try{chatPrev()}catch(e){}},0);
 if(ADMT=='players'){try{srvWhoDraw();srvWho()}catch(e){}clearInterval(ADMTI);ADMTI=setInterval(()=>{const dd=document.getElementById('staffDlg');if(!dd||dd.style.display=='none'||ADMT!='players'||!admOpen){clearInterval(ADMTI);return}const p=document.getElementById('stPl');if(p&&!p.matches(':hover'))p.innerHTML=stPlHtml()},3000)}}
function stPlHtml(){const L=stPlayers(),own=myRank()=='owner'&&!!ID.own,c=stCtx();if(!L.length)return'<div class="uik-empty">Nobody else is in your lobby, co-op game or desert right now.</div>';
 const B=(a,p,l,cls,ttl)=>'<button class="uik-btn sm '+(cls||'')+'" data-st="'+a+'" data-pid="'+uE(p)+'" title="'+(ttl||'')+'">'+l+'</button>';
 return L.map(p=>{const staffT=p.rk=='owner'&&(REG.own||[]).includes(p.u);return '<div class="uik-pl"><div class="who"><b>'+uE(p.nm)+'</b> '+(p.rk?(RKI[p.rk]||''):'')+'<small>'+p.where+' · <span style="font-family:monospace">'+(p.u||'no ID yet')+'</span></small></div><div class="acts">'+
  B('tp',p.pid,'📍 Go to','cool','Teleport to them')+B('bring',p.pid,'🧲 Bring','cool','Teleport them to you')+B('freeze',p.pid,'🧊 Freeze','','5 seconds')+B('heal',p.pid,'💚 Heal')+B('warn',p.pid,'⚠️ Warn','warn')+B('rank',p.pid,'🎖️ Rank','','Set their army rank, or undo a bust')+B('badge',p.pid,'🏅 Badge','','Grant them a badge')+
  (staffT?'':(p.u?B('kick',p.pid,'👢 Kick','warn')+(isBanned(p.u)?'':B('ban',p.pid,'🚫 Ban','bad')):''))+(own&&p.u&&!staffT?(p.rk=='admin'?B('unadmin',p.pid,'Remove admin'):B('admin',p.pid,'🛡️ Make admin','vio')):'')+'</div></div>'}).join('')}

/* ---------- the DEBUG menu: tabs instead of a long scroll, a teleport tab, a footer that stays put ---------- */
let DBGT='';
function dbgTpHtml(){let h='';const c=stCtx();
 if(myRank()){const L=stPlayers();h+='<div class="uik-h">Players</div>'+(L.length?L.map(p=>'<div class="uik-pl"><div class="who"><b>'+uE(p.nm)+'</b><small>'+p.where+'</small></div><div class="acts"><button class="uik-btn sm cool" data-st="tp" data-pid="'+uE(p.pid)+'">📍 Go to</button><button class="uik-btn sm cool" data-st="bring" data-pid="'+uE(p.pid)+'">🧲 Bring</button></div></div>').join(''):'<div class="uik-empty">Nobody else is here.</div>')}
 if(c=='desert'){const q=BUS.ride,L=(q.locs||[]).slice().sort((a,b)=>String(a.nm).localeCompare(String(b.nm)));h+='<div class="uik-h">Desert places</div><div class="uik-grid">'+L.map((l,i)=>'<button class="uik-btn sm" data-loc="'+i+'">'+(l.ic||'📍')+' '+uE(l.nm)+'</button>').join('')+'</div>';DBGLOC=L}
 if(!h)h='<div class="uik-empty">Teleporting works in the desert'+(myRank()?', and to other players in the lobby or co-op':'')+'.</div>';return h}
let DBGLOC=[];
{const ds0=dbgShow;dbgShow=function(){const r=ds0.apply(this,arguments);try{if(!dbgOK)return r;const box=dp.firstElementChild;if(!box)return r;box.className='uik-card';box.removeAttribute('style');
  const h2=box.querySelector('h2'),p=h2&&h2.nextElementSibling;const hd=document.createElement('div');hd.className='uik-hd';hd.innerHTML='<h2>🛠️ DEBUG<div class="uik-sub"></div></h2><button class="uik-x" id="dclx">✕</button>';const sub=hd.querySelector('.uik-sub');if(p){sub.innerHTML=p.innerHTML}
  const bd=[...box.children].find(x=>/Badges/.test(x.textContent)&&x.tagName!='DETAILS'&&x!==h2&&x!==p);if(bd&&bd!==p)sub.innerHTML+=' · '+bd.innerHTML;
  const dets=[...box.querySelectorAll(':scope > details')];
  /* the teleport tab */const tp=document.createElement('details');tp.innerHTML='<summary>🧭 Teleport</summary><div id="dbgTp">'+dbgTpHtml()+'</div>';const tgl=dets.find(x=>/Toggles/.test(x.querySelector('summary').textContent));if(tgl)tgl.before(tp);else dets[dets.length-1].after(tp);
  const all=[...box.querySelectorAll(':scope > details')];const tabs=document.createElement('div');tabs.className='uik-tabs';const body=document.createElement('div');body.className='uik-body';
  const nm=x=>x.querySelector('summary').textContent.replace('ADMIN ONLY: events','Events').replace(/Desert Bus: force next passenger/,'Bus passenger').replace(/ \(0\/1\)/,'').trim();if(!DBGT||!all.some(x=>nm(x)==DBGT))DBGT=nm(all.find(x=>/Items/.test(nm(x)))||all[0]);
  for(const x of all){x.open=true;const t=document.createElement('button');t.className='uik-tab'+(nm(x)==DBGT?' on':'');t.textContent=nm(x);t.onclick=e=>{e.stopPropagation();DBGT=nm(x);for(const y of all)y.style.display=nm(y)==DBGT?'block':'none';tabs.querySelectorAll('.uik-tab').forEach(z=>z.classList.toggle('on',z===t))};tabs.appendChild(t);x.style.display=nm(x)==DBGT?'block':'none';body.appendChild(x)}
  const ftOld=box.querySelector('#dap')?box.querySelector('#dap').parentNode:null;const ft=document.createElement('div');ft.className='uik-ft';const msg=document.getElementById('dmsg');if(msg){msg.style.cssText='flex:1;margin:0;align-self:center;color:#80e080;font-size:13px;text-align:left';ft.appendChild(msg)}
  const ap=document.getElementById('dap'),cl=document.getElementById('dcl');if(cl){cl.className='uik-btn';ft.appendChild(cl)}if(ap){ap.className='uik-btn pri';ap.textContent='✔ Apply';ft.appendChild(ap)}
  box.innerHTML='';box.appendChild(hd);box.appendChild(tabs);box.appendChild(body);box.appendChild(ft);hd.querySelector('#dclx').onclick=e=>{e.stopPropagation();dbgClose()};
  if(ftOld&&ftOld.remove)try{ftOld.remove()}catch(e){}
  box.onclick=e=>{const t=e.target.closest('[data-st],[data-loc]');if(!t)return;e.stopPropagation();if(t.dataset.st){stAct(t.dataset.st,t.dataset.pid);return}const l=DBGLOC[+t.dataset.loc];if(!l)return;const why=stGo({c:'desert',x:l.x+4,z:l.z+4,dy:0});const m=document.getElementById('dmsg');if(m)m.textContent=why?'Could not: '+why:'Teleported to '+l.nm+'.';if(!why)dbgClose()}}catch(e){conLog('error','debug menu: '+e.message)}return r}}

/* ---------- r565: SAVE TRANSFER (owner panel): copy stats and/or badges from a friend entry (or a pasted friend code, or typed numbers)
   to a player who is here with you, e.g. a friend on a new device who never exported their save. They get to accept it first. ---------- */
const XFF=[['b','🏆 Best door','best',100],['w','🚪 Escapes','wins',1e6],['r','🔁 Runs','runs',1e6],['d','💀 Deaths','deaths',1e6],['g','🪙 Lifetime gold','gold',1e9],['s','🛡️ Saved by items','saved',1e6]];
const XF={src:'me',code:'',f:null,on:{b:1,w:1,r:1,d:1,g:1,s:1,bd:1,mr:0},bd:[],to:'',coins:0,msg:'',mr:0};
const bdMask=ids=>{const a=new Uint8Array(Math.ceil(BDI.length/8));for(const id of ids){const i=BDI.indexOf(id);if(i>=0)a[i>>3]|=1<<(i&7)}let s='';for(const c of a)s+=String.fromCharCode(c);return btoa(s)};
const bdUnmask=s=>{const r=[];try{const b=atob(String(s||''));for(let i=0;i<BDI.length;i++)if(b.charCodeAt(i>>3)&(1<<(i&7)))r.push(BDI[i])}catch(e){}return r};
function xfDecode(code){code=(code||'').trim().replace(/[‐-―−]/g,'-').replace(/\s+/g,'');const m=/^DOORSF1-([A-Za-z0-9+\/=]+)-([a-z0-9]+)$/.exec(code);if(!m)throw'That does not look like a friend code.';let j;try{j=decodeURIComponent(escape(atob(m[1])))}catch(e){throw'The friend code is damaged.'}if(svHash(j)!=m[2])throw'The friend code is damaged or was edited.';const f=fsOne(JSON.parse(j));if(!f)throw'The friend code has the wrong contents.';return f}
function xfLoad(){let f=null;XF.msg='';try{if(XF.src=='me')f=fsSnap();else if(XF.src.startsWith('f:'))f=(SV.fr||[]).find(x=>x.id===XF.src.slice(2))||null;else if(XF.src=='code'&&XF.code)f=xfDecode(XF.code)}catch(e){XF.msg=String(e)}
 if(f){XF.f={b:f.b|0,w:f.w|0,r:f.r|0,d:f.d|0,g:f.g|0,s:f.s|0};XF.bd=(f.bd||[]).slice();XF.nm=f.n||'Player';if(XF.src=='me')XF.mr=milRank()}else if(XF.src=='manual'){XF.f=XF.f||{b:1,w:0,r:0,d:0,g:0,s:0};XF.bd=[];XF.nm='typed in'}else{XF.f=null;XF.bd=[]}}
function xfHtml(){if(!XF.f&&XF.src!='code')xfLoad();const fr=SV.fr||[],L=stPlayers();if(XF.to&&!L.some(p=>p.pid===XF.to))XF.to='';if(!XF.to&&L.length)XF.to=L[0].pid;
 let h='<div class="uik-note">Copy stats and badges onto someone who is here with you (lobby or co-op), for example a friend on a new device who never exported their save. They have to accept it.</div>'+
  '<div class="uik-h">1 · Copy from</div><select data-xf="src" class="uik-in" style="width:100%"><option value="me"'+(XF.src=='me'?' selected':'')+'>You ('+uE(SV.nm||'Player')+')</option>'+fr.map(f=>'<option value="f:'+uE(f.id)+'"'+(XF.src=='f:'+f.id?' selected':'')+'>👥 '+uE(f.n)+' · best door '+f.b+' · '+f.bd.length+' badges</option>').join('')+'<option value="code"'+(XF.src=='code'?' selected':'')+'>📋 Paste a friend code…</option><option value="manual"'+(XF.src=='manual'?' selected':'')+'>✏️ Type the numbers in</option></select>'+
  (XF.src=='code'?'<textarea data-xf="code" class="uik-in" placeholder="DOORSF1-…" style="width:100%;height:58px;margin-top:6px;font:11px monospace!important">'+uE(XF.code)+'</textarea><button class="uik-btn sm" data-xfa="load">Load code</button>':'')+(XF.msg?'<div class="uik-note" style="color:#ff9a80">'+uE(XF.msg)+'</div>':'');
 if(XF.f){h+='<div class="uik-h">2 · What to copy</div><div class="uik-box">'+XFF.map(([k,l])=>'<div class="uik-row"><label class="uik-sw"><input type="checkbox" data-xfo="'+k+'"'+(XF.on[k]?' checked':'')+'><span></span></label><div class="l">'+l+'</div><input type="number" min="0" data-xfv="'+k+'" class="uik-in" value="'+(XF.f[k]|0)+'" style="width:110px;text-align:right"></div>').join('')+
  '<div class="uik-row"><label class="uik-sw"><input type="checkbox" data-xfo="bd"'+(XF.on.bd?' checked':'')+(XF.bd.length?'':' disabled')+'><span></span></label><div class="l">🏅 Badges<small>'+XF.bd.length+' of '+BD.length+' · adds the ones they do not have yet (never removes any)</small></div></div>'+
  '<div class="uik-row"><label class="uik-sw"><input type="checkbox" data-xfo="mr"'+(XF.on.mr?' checked':'')+'><span></span></label><div class="l">🎖️ Army rank<small>Fort Blackout rank (sets it, with that rank\'s XP)</small></div><select data-xf="mr" class="uik-in" style="width:130px">'+MILRANK.map((k,i)=>'<option value="'+i+'"'+(i==XF.mr?' selected':'')+'>'+k[0]+'</option>').join('')+'</select></div>'+
  '<div class="uik-row"><div class="l" style="padding-left:56px">🪙 Also give coins to spend<small>Added to what they have now.</small></div><input type="number" min="0" data-xfv="coins" class="uik-in" value="'+(XF.coins|0)+'" style="width:110px;text-align:right"></div></div>'+
  '<div class="uik-note">The numbers REPLACE theirs. Untick anything you do not want to change.</div>'+
  '<div class="uik-h">3 · Send to</div>'+(L.length?'<div style="display:flex;gap:6px;flex-wrap:wrap"><select data-xf="to" class="uik-in" style="flex:1;min-width:180px">'+L.map(p=>'<option value="'+uE(p.pid)+'"'+(p.pid===XF.to?' selected':'')+'>'+uE(p.nm)+' · '+p.where.replace(/^\S+ /,'')+'</option>').join('')+'</select><button class="uik-btn pri" data-xfa="send">📤 Send</button></div>':'<div class="uik-empty">Nobody is here to send to. They need to be in your lobby or co-op game.</div>')}
 return h}
function xfSend(){if(!XF.f||!XF.to)return;const f={};for(const[k]of XFF)if(XF.on[k])f[k]=Math.max(0,Math.floor(+XF.f[k]||0));const o={to:XF.to,f,nm:XF.nm||''};if(XF.on.bd&&XF.bd.length)o.bm=bdMask(XF.bd);if(XF.coins>0)o.c=Math.min(1e6,XF.coins|0);if(XF.on.mr)o.mr=Math.max(0,Math.min(MILRANK.length-1,XF.mr|0));
 if(!Object.keys(f).length&&!o.bm&&!o.c&&o.mr==null){hint('💾 Nothing ticked to send.');return}const nm=stName(XF.to);if(stSend('save',o)){sysLine('💾 Sent a save transfer to '+nm+'. They need to accept it.');hint('💾 Sent to '+nm+': waiting for them to accept.')}else hint('💾 '+nm+' is not connected to you.')}
function xfWire(d){if(d.__xf)return;d.__xf=1;
 d.addEventListener('change',e=>{const t=e.target;if(t.dataset.xf=='src'){XF.src=t.value;XF.f=null;XF.msg='';if(XF.src!='code')xfLoad();admPanel()}else if(t.dataset.xf=='to'){XF.to=t.value}else if(t.dataset.xf=='mr'){XF.mr=+t.value|0;XF.on.mr=1;const c=d.querySelector('[data-xfo="mr"]');if(c)c.checked=true}else if(t.dataset.xfo){XF.on[t.dataset.xfo]=t.checked?1:0}});
 d.addEventListener('input',e=>{const t=e.target;if(t.dataset.xf=='code')XF.code=t.value;else if(t.dataset.xfv){const v=Math.max(0,Math.floor(+t.value||0));if(t.dataset.xfv=='coins')XF.coins=v;else if(XF.f)XF.f[t.dataset.xfv]=v}});
 d.addEventListener('click',e=>{const t=e.target.closest('[data-xfa]');if(!t)return;e.stopPropagation();if(t.dataset.xfa=='load'){xfLoad();admPanel()}else if(t.dataset.xfa=='send')xfSend()})}
/* the player who receives it: a box to accept or turn it down */
function xfOffer(o,who){const F=o.f||{},bd=o.bm?bdUnmask(o.bm):[],have=SV.bd||{},nb=bd.filter(id=>!have[id]).length;const lines=XFF.filter(([k])=>F[k]!=null).map(([k,l,sv])=>'<div class="uik-row"><div class="l">'+l+'</div><span style="color:var(--u-mute)">'+(SV[sv]|0)+'</span> → <b style="color:var(--u-gold2)">'+(F[k]|0)+'</b></div>').join('')+
  (bd.length?'<div class="uik-row"><div class="l">🏅 Badges</div><b style="color:var(--u-gold2)">+'+nb+' new</b></div>':'')+(o.mr!=null?'<div class="uik-row"><div class="l">🎖️ Army rank</div><span style="color:var(--u-mute)">'+milRankNm(milRank())+'</span> → <b style="color:var(--u-gold2)">'+milRankNm(o.mr)+'</b></div>':'')+(o.c?'<div class="uik-row"><div class="l">🪙 Coins</div><b style="color:var(--u-gold2)">+'+(o.c|0)+'</b></div>':'');
 const d=uikOverlay('xfDlg','<div class="uik-card" style="width:min(460px,94vw)"><div class="uik-hd"><h2>💾 SAVE TRANSFER<div class="uik-sub">from '+uE(who)+(o.nm?' · copied from '+uE(o.nm):'')+'</div></h2></div><div class="uik-body"><div class="uik-note">Staff want to copy these onto your save:</div><div class="uik-box">'+lines+'</div></div><div class="uik-ft"><button class="uik-btn" data-x="no">No thanks</button><button class="uik-btn pri" data-x="yes">✔ Accept</button></div></div>');
 d.onclick=e=>{e.stopPropagation();const t=e.target.closest('[data-x]');if(!t)return;d.style.display='none';if(t.dataset.x!='yes'){sysLine('💾 You turned down the save transfer.');return}
  for(const[k,,sv,mx]of XFF)if(F[k]!=null)SV[sv]=Math.max(k=='b'?1:0,Math.min(mx,Math.floor(+F[k]||0)));SV.bd=SV.bd||{};let added=0;for(const id of bd)if(BDIDX[id]&&!SV.bd[id]){SV.bd[id]=Date.now();added++}if(o.c)gold+=Math.max(0,Math.min(1e6,o.c|0));if(o.mr!=null)try{rkApply(MILRANK[Math.max(0,Math.min(MILRANK.length-1,o.mr|0))][0])}catch(e){}
  try{saveGame()}catch(e){}try{updHud()}catch(e){}try{svRefresh()}catch(e){}abuseBanner('💾 SAVE RESTORED',(added?added+' badges added · ':'')+'by '+who);try{snd(880,.12);setTimeout(()=>snd(1320,.15),120)}catch(e){}conLog('event','Save transfer accepted from '+who)}}
{const sd0=stDo;stDo=function(k,a,nm,id){if(k=='rank'){let o;try{o=JSON.parse(a)}catch(e){return}if(!o||o.to!==SV.pid)return;const r=rkApply(String(o.a||''));const who='🛡️ '+(nm||'Staff');if(r.ok){abuseBanner('🎖️ '+milRankNm(milSV().r).toUpperCase(),who+': '+r.m);sysLine('🎖️ '+who+' changed your army rank: '+r.m)}else sysLine('🎖️ '+who+' tried to change your army rank: '+r.m);try{xmNet(BUS.ride,'milr',{r:milSV().r})}catch(e){}return}if(k=='save'){let o;try{o=JSON.parse(a)}catch(e){return}if(!o||o.to!==SV.pid)return;xfOffer(o,'🛡️ '+(nm||'Staff'));return}return sd0.apply(this,arguments)}}
{const ap1=admPanel;admPanel=function(){if(ADMT=='xfer'){const r=myRank();if(!r){acctPanel();return}ADMT='players';ap1.apply(this,arguments);ADMT='xfer';const d=document.getElementById('staffDlg');const body=d.querySelector('.uik-body');if(body)body.innerHTML=xfHtml();d.querySelectorAll('.uik-tab').forEach(t=>t.classList.remove('on'));clearInterval(ADMTI);xfWire(d);addXfTab(d,true);return}const r=ap1.apply(this,arguments);try{const d=document.getElementById('staffDlg');addXfTab(d,false)}catch(e){}return r}}
function addXfTab(d,on){const tabs=d&&d.querySelector('.uik-tabs');if(!tabs||tabs.querySelector('[data-xft]'))return;const b=document.createElement('button');b.className='uik-tab'+(on?' on':'');b.dataset.xft=1;b.textContent='💾 Transfer';b.onclick=e=>{e.stopPropagation();ADMT='xfer';admPanel()};const tools=[...tabs.children].find(x=>/Tools/.test(x.textContent));tabs.insertBefore(b,tools||null)}

/* ---------- r565: JUMP EVERYONE to a door (owner panel → Events, or /door 50). Forward only in co-op: rooms behind you are gone. ---------- */
function jumpAll(k){k=Math.floor(+k);if(!myRank()){hint('🛡️ Staff only.');return}if(!(k>=0&&k<=100)){hint('🚪 Pick a door from 0 to 100.');return}
 if(!(state=='play'||state=='spec'||state=='paused')||HUB.on||(typeof BUS!='undefined'&&state=='bus')){hint('🚪 Start a run first (solo or co-op), then jump.');return}
 if(!(MP.on&&mpOpen().length)){n=k;build();sysLine('🚪 Jumped to door '+k+'.');try{staffClose()}catch(e){}return}
 const top=Math.max(n,mpLatest());if(k<=top){hint('🚪 In co-op you can only jump forward: the group is already at door '+top+'.');return}
 stSend('door',{n:k});try{mpTpTo(k,0,-1,'🚪 You moved everyone to door '+k+'.')}catch(e){}sysLine('🚪 '+(SV.nm||'Staff')+' moved everyone to door '+k+'.');try{staffClose()}catch(e){}}
{const sd1=stDo;stDo=function(k,a,nm,id){if(k=='door'){let o;try{o=JSON.parse(a)}catch(e){return}const t=Math.floor(+o.n);if(!(t>0&&t<=100)||!MP.on||!(state=='play'||state=='spec'||state=='paused'))return;if(t>n){try{if(mpDead){mpDead=false;state='play'}}catch(e){}try{mpTpTo(t,0,-1,'🚪 🛡️ '+(nm||'Staff')+' moved everyone to door '+t+'.')}catch(e){conLog('error','door jump: '+e.message)}}return}return sd1.apply(this,arguments)}}
{const c1=mpChatCmd;mpChatCmd=function(t){const m=String(t).match(/^\/\s*(door|jump|jumpall)\s+(\d+)\s*$/i);if(!m)return c1.apply(this,arguments);jumpAll(+m[2]);return true}}
{const ap2=admPanel;admPanel=function(){const r=ap2.apply(this,arguments);try{if(ADMT=='events'){const d=document.getElementById('staffDlg'),body=d&&d.querySelector('.uik-body');if(body&&!body.querySelector('#jaN')){const w=document.createElement('div');w.innerHTML='<div class="uik-h">🚪 Jump everyone to a door</div><div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap"><input id="jaN" class="uik-in" type="number" min="0" max="100" placeholder="door" style="width:90px"><button class="uik-btn pri" onclick="event.stopPropagation();jumpAll(document.getElementById(\'jaN\').value)">Jump everyone</button>'+[10,25,50,75,90,100].map(k=>'<button class="uik-btn sm" onclick="event.stopPropagation();jumpAll('+k+')">'+k+'</button>').join('')+'</div><div class="uik-note">Works in a run. In co-op everyone in your game goes with you (forward only). Chat: /door 50</div>';body.insertBefore(w,body.firstChild)}}}catch(e){}return r}}

/* ---------- r567: Generals and the police. The Desert PD still looks the other way, but only up to FIVE STARS: push it that far
   and they come for you like anyone else. Getting caught as a General is a 50 gold fine and a warning, no court, no cell. ---------- */
{const ah1=addHeat;addHeat=function(q,n,why){try{if(q&&milRank()>=9&&why!='military'&&n>0){q.genHeat=Math.min(100,(q.genHeat||0)+n);q.genT=0;
   if(!q.gen5&&q.genHeat>80){q.gen5=1;hint('🚨 Even a General can go too far. FIVE STARS: the Desert PD is coming for you.');snd(300,.4);return ah1.call(this,q,Math.max(n,81-(q.heat||0)),why)}
   if(!q.gen5){if(q.genHeat>55&&!q.genWarn){q.genWarn=1;hint('🎖️ The Desert PD is pretending not to see you, General. Do not push it to five stars.')}return}}}catch(e){}return ah1.apply(this,arguments)}}
setInterval(()=>{try{const q=BUS.ride;if(!q||!q.roam||milRank()<9)return;if(q.gen5){if((q.heat||0)<=0&&!q.cop){q.gen5=0;q.genHeat=0;q.genWarn=0}return}q.genT=(q.genT||0)+1;if(q.genT>8&&q.genHeat>0){q.genHeat=Math.max(0,q.genHeat-3);if(q.genHeat<40)q.genWarn=0}}catch(e){}},1000);
{const cb0=copBust;copBust=function(q){try{if(q&&q.gen5&&milRank()>=9&&q.cop&&!q.court&&!q.jail&&!(q.copGrace>0)){q.heat=Math.min(q.heat||0,20);const fine=Math.min(gold,50);const r=cb0.apply(this,arguments);gold-=fine;try{saveGame();updHud()}catch(e){}q.gen5=0;q.genHeat=0;q.genWarn=0;q.copGrace=20;try{copSay(q,'General. With respect. That was a LOT of crime.')}catch(e){}hint('🎖️ Seek recognises the stars on your uniform: a '+fine+' gold fine and a stern warning, General. No court, no cell.');return r}}catch(e){}return cb0.apply(this,arguments)}}
