/* =====================================================================================================
   r608: a SIMPLER MAIN MENU and a SHORT HOW TO PLAY (design specs docs/design/main-menu.md and how-to-play.md).

   The title screen used to have seventeen things to click. Now it has:
     - a slim "Continue run · door N" bar above PLAY (only when your saved run is at door 1 or further);
     - the big three: PLAY, PLAY DESERT (once unlocked), DAILY RUN (same colours and daily themes as before);
     - four small buttons in one row (2 × 2 on phones): 📖 How to play · 🎒 Locker · 📊 Stats · ☰ More;
     - your profile chip in the top-left corner (name and army rank, click it for your Account);
     - the ⚙ Settings gear in the top-right corner, as before.
   Where the old buttons went:
     🎒 Locker  = Shop (inside the card) · Customize · Skins (those two open their own full-screen editors)
     📊 Stats   = the stats that used to sit in a row at the top · Badges · Journal (those two open their own panels)
     ☰ More    = Quick solo run · Friends (with the mail count) · Co-op · Changelog · Secrets (the old ⓘ) · Owner panel
     💾 SAVE    = ⚙ Settings → Save data → "💾 Save now" (still copies a backup save code)
     💘 Dating mode is gone from the menu. Old saves still load, and the three dating badges are only hidden from
        your badge list if you never earned them (earned ones stay).
   The same four buttons also replace the old row of buttons on the shop / "you died" screens.

   HOW TO PLAY is now one card with four short tabs (Basics, Monsters, Items, Desert & co-op), about 250 words in
   all, instead of the old 2,000-word scroll. The old text in #how is removed by build.py.
   ===================================================================================================== */
{const st=document.createElement('style');st.id='mmCSS';st.textContent=`
#m .mm{gap:10px;margin:10px 0 6px}
#m .mm .mnu-main{gap:10px}
.mm-cont{display:block;width:min(420px,calc(86*var(--vw,1vw)));box-sizing:border-box;margin:2px auto 0;padding:8px 16px;text-align:left;cursor:pointer;
 background:rgba(28,18,9,.9);color:var(--u-gold2,#ffd98a);border:1px solid var(--u-gold,#d4a850);border-radius:12px;font:bold 15px Arial,sans-serif;letter-spacing:1px;box-shadow:0 4px 14px rgba(0,0,0,.35);transition:filter .12s,transform .12s}
.mm-cont span{color:var(--u-mute,#b3a07a);font-weight:normal;letter-spacing:0}
.mm-cont:hover{filter:brightness(1.2);transform:translateY(-1px)}
.mm-row{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;width:min(580px,calc(94*var(--vw,1vw)));margin-top:4px}
.mm-row button{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:46px;box-sizing:border-box;margin:0;padding:8px 6px;cursor:pointer;
 background:rgba(28,18,9,.88);color:var(--u-text,#efe3c4);border:1px solid #7a6034;border-radius:12px;font:bold 15px Arial,sans-serif;letter-spacing:1px;white-space:nowrap;box-shadow:0 4px 14px rgba(0,0,0,.35);transition:filter .12s,transform .12s,border-color .12s}
.mm-row button:hover{border-color:var(--u-gold,#d4a850);background:#3b2714;transform:translateY(-1px)}
.mm-row button small{display:block;font:12px Arial,sans-serif;letter-spacing:0;color:var(--u-mute,#b3a07a);margin-top:2px}
.mm-dot{position:absolute;top:-6px;right:-6px;min-width:18px;height:18px;padding:0 4px;box-sizing:border-box;border-radius:9px;background:#e02020;color:#fff;font:bold 12px/18px Arial,sans-serif;text-align:center;border:2px solid #fff;box-shadow:0 0 6px #f00a}
@media (max-width:520px){.mm-row{grid-template-columns:repeat(2,minmax(0,1fr))}}
.mm-chip{position:fixed;top:10px;left:10px;z-index:25;display:none;align-items:center;gap:7px;max-width:calc(100vw - 150px);box-sizing:border-box;padding:6px 12px;cursor:pointer;
 background:rgba(28,18,9,.88);color:var(--u-text,#efe3c4);border:1px solid #7a6034;border-radius:12px;font:14px Arial,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mm-chip:hover{border-color:var(--u-gold,#d4a850)}
.mm-chip b{color:var(--u-gold2,#ffd98a);overflow:hidden;text-overflow:ellipsis}
.mm-chip span{color:var(--u-mute,#b3a07a)}
body.mm-title>button[title="Info"]{display:none!important}
.mm-list{display:flex;flex-direction:column;gap:6px}
.mm-list button{display:flex;align-items:center;gap:10px;width:100%;text-align:left;margin:0!important;padding:10px 14px!important;font-size:15px!important}
.mm-list button small{margin-left:auto;color:var(--u-mute);font-size:12px}
.mm-list .own{color:#ffd24a!important;border-color:#c9a227!important}
.mm-stats{display:grid;grid-template-columns:1fr 1fr;gap:0 18px}
.mm-stats div{display:flex;justify-content:space-between;gap:10px;padding:8px 2px;border-bottom:1px solid rgba(77,58,31,.55)}
.mm-stats b{color:var(--u-gold2);text-align:right}
@media (max-width:520px){.mm-stats{grid-template-columns:1fr}}
.mm-shop{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;margin:8px 0}
.mm-shop button{margin:0!important;padding:10px!important;text-align:left;line-height:1.35}
.mm-shop button small{display:block;color:var(--u-mute);font-size:12px}
.mm-shop button[disabled]{opacity:.45;cursor:default}
.uik-tab .ext{font-size:11px;opacity:.6;margin-left:3px}
/* how to play */
#howDlg .uik-card{width:min(640px,96vw)}
#howDlg .uik-body{font-size:15px;line-height:1.5}
#howDlg .uik-body p{margin:0 0 10px}
#howDlg .uik-body b{color:var(--u-gold2)}
#howDlg .htp-keys{line-height:2.1;margin:0 0 10px}
#howDlg .htp-mon p{margin:0 0 8px}
#howDlg .uik-ft{justify-content:flex-start;font-size:12px;color:var(--u-mute)}
#howDlg .uik-ft b{color:var(--u-text)}
@media (max-width:520px){#howDlg .uik-tab,#mmDlg .uik-tab{padding:7px 7px;font-size:13px}#howDlg .uik-tabs,#mmDlg .uik-tabs{padding:8px 6px 0;gap:2px}#howDlg .uik-body{font-size:14px}}
`;document.head.appendChild(st)}

/* ---------- the title screen: Continue bar (in #svb) and the new button rows (from menuBtns) ---------- */
function mmRunDoor(){try{const r=runLoad();return r&&(r.n|0)>=1?r.n|0:0}catch(e){return 0}}
svHtml=function(shop){const d=shop?mmRunDoor():0;
 return '<div id="svb" class="uik-sv">'+(d?'<button class="mm-cont" onclick="event.stopPropagation();contRun()">▶ Continue run <span>· door '+d+'</span></button>':'')+'</div>'};
function mmMoreDot(){let n=0;try{n+=frCount()|0}catch(e){}let ch=0;try{ch=chlNew()?1:0}catch(e){}return n?'<span class="mm-dot">'+n+'</span>':ch?'<span class="mm-dot">!</span>':''}
function mmRow(){const B=(l,sub,f,extra)=>'<button onclick="event.stopPropagation();'+f+'">'+l+(sub?'<small>'+sub+'</small>':'')+(extra||'')+'</button>';
 return '<div class="mm-row">'+B('📖 How to play','','howOpen()')+B('🎒 Locker','','mmLocker()')+B('📊 Stats','<span data-mm="best">Best door '+(SV.best|0)+'</span>','mmStats()')+B('☰ More','','mmMore()','<span data-mm="dot">'+mmMoreDot()+'</span>')+'</div>'}
{const mb=menuBtns;menuBtns=function(){let h=mb.apply(this,arguments),main='';
 try{const t=document.createElement('template');t.innerHTML=h;const m=t.content.querySelector('.mnu-main');main=m?m.outerHTML:''}catch(e){}
 return '<div class="mnu mm">'+main+mmRow()+'</div>'}}

/* ---------- the panels behind the four buttons ---------- */
function mmPanel(title,tabs,cur,body,wire){const d=uikOverlay('mmDlg','<div class="uik-card"><div class="uik-hd"><h2>'+title+'</h2><button class="uik-x" data-act="x">✕</button></div>'+
  (tabs?'<div class="uik-tabs">'+tabs.map(t=>'<button class="uik-tab'+(t[0]==cur?' on':'')+'" data-tab="'+t[0]+'">'+t[1]+(t[2]?'<span class="ext">↗</span>':'')+'</button>').join('')+'</div>':'')+'<div class="uik-body">'+body+'</div></div>');
 d.onclick=e=>{e.stopPropagation();const t=e.target.closest('[data-tab],[data-act]');if(!t)return;if(t.dataset.act=='x'){mmClose();return}wire(t)};return d}
function mmClose(){const d=document.getElementById('mmDlg');if(d)d.style.display='none'}
/* run something that opens its own screen, after closing our card */
function mmGo(f){mmClose();try{f()}catch(e){try{conLog('error','menu: '+e.message)}catch(x){}}}

/* 🎒 LOCKER: Shop · Customize · Skins */
function mmLocker(tab){if(!tab)tab='shop';
 if(tab=='cust'){mmGo(()=>custOpen());return}if(tab=='skins'){mmGo(()=>skinsOpen());return}
 const cap=k=>(k=='f'||k=='n')&&pre[k]>0||(k=='l'&&pre.l>=LPMAX);
 const b='<div class="uik-note" style="font-size:14px;color:var(--u-text)">🪙 <b style="color:var(--u-gold2)">'+(gold|0)+'</b> gold · items carry into your next run.</div><div class="mm-shop">'+
  SH.map(a=>{const no=gold<a[3]||cap(a[2]);return '<button class="uik-btn" data-act="buy" data-k="'+a[2]+'"'+(no?' disabled':'')+'>'+a[0]+' '+a[1]+'<small>'+a[3]+' 🪙 · owned '+(pre[a[2]]|0)+(cap(a[2])?' (max)':'')+'</small></button>'}).join('')+'</div>'+
  (gold<Math.min(...SH.map(a=>a[3]))?'<div class="uik-note">No gold to spend yet: you find it in drawers during a run.</div>':'');
 mmPanel('🎒 LOCKER',[['shop','🛒 Shop'],['cust','👕 Customize',1],['skins','🎨 Skins',1]],tab,b,t=>{if(t.dataset.tab){mmLocker(t.dataset.tab);return}
  if(t.dataset.act=='buy'&&!t.disabled){const m0=menu;menu=function(){};try{buy(t.dataset.k)}catch(e){}finally{menu=m0}try{updHud()}catch(e){}mmLocker('shop')}})}

/* 📊 STATS: Stats · Badges · Journal */
function mmStats(tab){if(!tab)tab='stats';
 if(tab=='bd'){mmGo(()=>badgePanel());return}if(tab=='jn'){mmGo(()=>journalPanel());return}
 const kk=Object.entries(SV.k||{}).sort((a,b)=>b[1]-a[1])[0],r=(i,l,v)=>'<div><span>'+i+' '+l+'</span><b>'+v+'</b></div>';
 let rk='',pr=0;try{const S=milSV();if((S.r|0)>0)rk=(MILRANK[S.r]&&MILRANK[S.r][1]?MILRANK[S.r][1]+' ':'')+milRankNm(S.r);pr=S.pr|0}catch(e){}
 const b='<div class="mm-stats">'+r('🏆','Best door',SV.best|0)+r('🔁','Runs',SV.runs|0)+r('💀','Deaths',SV.deaths|0)+r('🚪','Escapes',SV.wins|0)+r('🪙','Lifetime gold',SV.gold|0)+r('🛡️','Saved by items',SV.saved|0)+r('☠️','Top killer',kk?uE(kk[0])+' ×'+kk[1]:'nobody yet')+
  (rk?r('🎖️','Army rank',uE(rk)):'')+(pr?r('✪','Prestige',pr):'')+'</div>';
 let nb='',nj='';try{nb=' ('+bdCount()+'/'+BD.length+')'}catch(e){}try{nj=' ('+jnCount()+'/'+LORE.length+')'}catch(e){}
 mmPanel('📊 STATS',[['stats','📊 Stats'],['bd','🏅 Badges'+nb,1],['jn','📓 Journal'+nj,1]],tab,b,t=>{if(t.dataset.tab)mmStats(t.dataset.tab)})}

/* ☰ MORE: a short list */
function mmMore(){let fc=0;try{fc=frCount()|0}catch(e){}let ch=0;try{ch=chlNew()}catch(e){}let rk='';try{rk=myRank()}catch(e){}
 const L=(a,l,sub,cls)=>'<button class="uik-btn'+(cls?' '+cls:'')+'" data-act="'+a+'">'+l+(sub?'<small>'+sub+'</small>':'')+'</button>';
 const b='<div class="mm-list">'+L('solo','🚪 Quick solo run','straight into the hotel')+L('fr','👥 Friends'+(fc?' · '+fc:''),fc?'📬 new mail':'')+L('mp','🌐 Co-op','play with friends')+L('chl','📋 Changelog',ch?'🆕 new':'')+L('sec','🤫 Secrets','')+
  (rk?L('adm',rk=='owner'?'👑 Owner panel':'🛡️ Staff panel','','own'):'')+'</div>';
 const d=mmPanel('☰ MORE',null,'',b,t=>{const a=t.dataset.act;
  if(a=='solo')mmGo(()=>playNow());else if(a=='fr')mmGo(()=>friendsPanel());else if(a=='mp')mmGo(()=>mpPanel());else if(a=='chl')mmGo(()=>chlOpen());else if(a=='sec')mmGo(()=>secretBox());else if(a=='adm')mmGo(()=>admPanel())});
 try{d.querySelector('.uik-card').style.width='min(400px,96vw)'}catch(e){}}

/* ---------- the profile chip (top-left): your name and army rank, click for Account ---------- */
const mmChip=document.createElement('button');mmChip.className='mm-chip';mmChip.title='Your account';mmChip.onclick=e=>{e.stopPropagation();try{acctPanel()}catch(x){}};document.body.appendChild(mmChip);
function mmChipText(){let rk='';try{const S=milSV();if((S.r|0)>0)rk=((S.pr|0)?'✪'+(S.pr|0)+' ':'')+milRankNm(S.r)}catch(e){}return '👤 <b>'+uE(SV.nm||'Player')+'</b>'+(rk?'<span>· '+uE(rk)+'</span>':'')}
setInterval(()=>{try{const m=$('m'),on=!!m&&m.style.display!='none'&&(state=='menu'||state=='dead')&&!!m.querySelector('.mm');
  mmChip.style.display=on?'flex':'none';document.body.classList.toggle('mm-title',on);if(!on)return;
  const t=mmChipText();if(mmChip.innerHTML!==t)mmChip.innerHTML=t;
  const bs=m.querySelector('[data-mm="best"]');if(bs){const v='Best door '+(SV.best|0);if(bs.textContent!==v)bs.textContent=v}
  const dt=m.querySelector('[data-mm="dot"]');if(dt){const v=mmMoreDot();if(dt.innerHTML!==v)dt.innerHTML=v}}catch(e){}},500);

/* ---------- ⚙ Settings → Save data gets "💾 Save now"; the Controls tab's guide button gets the new name ---------- */
{const so=setOpen;setOpen=function(){const r=so.apply(this,arguments);try{const d=document.getElementById('setDlg');if(!d)return r;
  if(SETT=='save'){const bx=d.querySelector('.uik-box');if(bx&&!bx.querySelector('[data-mmsave]'))bx.insertAdjacentHTML('afterbegin','<div class="uik-row"><div class="l">💾 Save now<small>The game saves by itself. This also copies a backup save code to your clipboard.</small></div><button class="uik-btn sm pri" data-mmsave onclick="event.stopPropagation();mmSaveNow(this)">Save now</button></div>')}
  const hb=d.querySelector('[data-act="how"]');if(hb)hb.textContent='📖 How to play'}catch(e){}return r}}
function mmSaveNow(btn){try{menuSave(null)}catch(e){}if(btn){btn.textContent='✔ Saved';setTimeout(()=>{btn.textContent='Save now'},2200)}}

/* ---------- Dating mode is gone: hide its badges unless you already earned them ---------- */
try{for(const id of['firstdate','soulmate','monsterlove']){const i=BD.findIndex(b=>b[0]==id);if(i>=0&&!(SV.bd&&SV.bd[id]))BD.splice(i,1)}}catch(e){}

/* ---------- HOW TO PLAY: one card, four short tabs ---------- */
let HTP='basics';
function howOpen(tab){if(typeof tab=='string')HTP=tab;const K=k=>'<span class="uik-kbd">'+k+'</span>';
 const touch=(()=>{try{return !!(MOB.on||matchMedia('(pointer:coarse)').matches)}catch(e){return false}})();
 const T=[['basics','🚪 Basics'],['mon','👁️ Monsters'],['items','🎒 Items'],['desert','🌵 Desert & co-op']];
 const B={
  basics:'<p><b>Get to door 100 and out.</b> Every door is a new room. Take the key at reception, open the door, keep going.</p>'+
   '<p class="htp-keys">'+K('WASD')+' move · '+K('Mouse')+' look · '+K('E')+' use, open, hide, talk · '+K('C')+' crouch · '+K('1–9')+' pick an item, '+K('click')+' to use it · '+K('F')+' flashlight · '+K('M')+' map (desert) · '+K('Esc')+' pause</p>'+
   '<p>Gold comes from drawers. Spend it in the Shop between runs. Everything saves by itself.</p>'+
   (touch?'<p>📱 Left side: walk. Drag the right side: look. Tap the right side: use your item. <b>E</b> button: interact.</p>':''),
  mon:'<div class="htp-mon"><p>🏃 <b>Rush &amp; Ambush</b>: lights flicker, then they charge. <b>Hide in a locker.</b></p>'+
   '<p>👁️ <b>Seek</b>: runs after you for a while. <b>Don\'t stop running.</b></p>'+
   '<p>🦻 <b>Figure</b> (doors 50 and 100): blind, hears everything. <b>Crouch</b> near him.</p>'+
   '<p>👀 <b>Screech</b>: in dark rooms, if you hear "psst", <b>turn and look at him.</b></p>'+
   '<p>🚪 <b>Fake doors</b>: only the door whose plaque shows the next number is real.</p></div>',
  items:'<p>✝️ <b>Crucifix</b> stops a monster once. 👼 <b>Guardian Angel</b> saves you once.</p>'+
   '<p>🔦 Lights run down: find 🔋 batteries. 🗝️ Lockpicks open locked doors. 🧪 Vitamins: speed and a little healing.</p>',
  desert:'<p>🌵 <b>The desert</b> is a big open world: drive anything you find ('+K('E')+' to get in), take jobs, join the army, mine the quarry. '+K('M')+' opens the map; click a place on it to warp there.</p>'+
   '<p>🌐 <b>Co-op</b>: play with friends from the lobby (PLAY). '+K('/')+' chat · '+K('Tab')+' players · '+K('X')+' drop an item for a friend.</p>'+
   '<p>If you go down, a friend can revive you.</p>'};
 const d=uikOverlay('howDlg','<div class="uik-card"><div class="uik-hd"><h2>📖 HOW TO PLAY</h2><button class="uik-x" data-act="x">✕</button></div><div class="uik-tabs">'+
  T.map(t=>'<button class="uik-tab'+(t[0]==HTP?' on':'')+'" data-tab="'+t[0]+'">'+t[1]+'</button>').join('')+'</div><div class="uik-body">'+B[HTP]+'</div>'+
  '<div class="uik-ft"><span>Stuck or found a bug? '+K('F8')+' opens the console. <i>Copy report</i> puts it on your clipboard.</span></div></div>');
 d.onclick=e=>{e.stopPropagation();const t=e.target.closest('[data-tab],[data-act]');if(!t)return;if(t.dataset.tab){howOpen(t.dataset.tab);return}if(t.dataset.act=='x')d.style.display='none'}}

/* rebuild the title screen now that the pieces above exist */
setTimeout(()=>{try{const ms=document.getElementById('mnslot');if(ms&&!ms.querySelector('.mm'))ms.innerHTML=menuBtns();const b=$('svb');if(b)b.outerHTML=svHtml(1)}catch(e){}},200);
