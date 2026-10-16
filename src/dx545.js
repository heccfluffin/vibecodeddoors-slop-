/* =====================================================================================================
   r545: RETRO MODE's side messages are the same for everyone in co-op. The host's game makes up the fake messenger
   chatter, the "ACHIEVEMENT UNLOCKED" pop-ups and the tip of the day, and sends them to everyone; the other players'
   games stop inventing their own and show the host's instead.
   ===================================================================================================== */
const r8RetSlave=()=>{try{return !!(MODS&&MODS.retro&&r8Co()&&!MP.host)}catch(e){return false}};
let R8RX=0;
function r8RetSend(o){try{if(!(MODS&&MODS.retro&&r8Co()&&MP.host))return;mpSend(Object.assign({t:'rtm',s:mpS()},o))}catch(e){}}
{const rm0=retMsg;retMsg=function(name,col,text,mine,fake){if(fake&&!R8RX){if(r8RetSlave())return;r8RetSend({k:'msg',nm:String(name).slice(0,40),c:String(col||'').slice(0,12),x:String(text).slice(0,200),m:mine?1:0})}return rm0.apply(this,arguments)}}
function retAch(tx){try{const ac=document.querySelector('#retA');if(!ac)return;ac.innerHTML='🏆 <b>ACHIEVEMENT UNLOCKED!</b><br>'+esc(String(tx))+' (+0 G)';ac.style.display='block';snd(1319,.06);setTimeout(()=>snd(1760,.06),90);setTimeout(()=>{ac.style.display='none'},3500)}catch(e){}}
setInterval(()=>{try{if(MODS&&MODS.retro&&r8Co()&&MP.host&&RET.on)r8RetSend({k:'dy',i:RET.dyI|0})}catch(e){}},2000);
{const mm2=mpMsg;mpMsg=function(key,o){if(o&&o.t=='rtm'){try{if((o.s|0)!==(mpSeed|0)||MP.host||!(MODS&&MODS.retro))return;
  if(o.k=='msg'){R8RX=1;try{retMsg(fsName(String(o.nm||''))||String(o.nm||'').slice(0,20)||'?',/^#[0-9a-f]{3,6}$/i.test(o.c)?o.c:'#2a5ab0',String(o.x||'').slice(0,200),o.m?1:0,1);snd(1568,.04)}finally{R8RX=0}}
  else if(o.k=='ach')retAch(String(o.x||'').slice(0,60));
  else if(o.k=='dy'){const i=Math.max(0,Math.min(RDOOR.length-1,o.i|0));if(i!==RET.dyI){RET.dyI=i;const y=document.querySelector('#retY');if(y)y.textContent=RDOOR[i]}}}catch(e){}return}return mm2.apply(this,arguments)}}
