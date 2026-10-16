/* =====================================================================================================
   r532: COURT and JAIL can never run at the same time. If both were live, the court kept pulling you to the dock
   (outside your cell) every frame, so jail "caught" you every frame: a black screen and a stack of very loud alarms.
   ===================================================================================================== */
function courtKill(q){const C=q.court;if(!C)return;C.done=1;q.court=null;try{const d=document.getElementById('lawP');if(d)d.style.display='none'}catch(e){}try{if(C.lm&&C.lm.parent)C.lm.parent.remove(C.lm)}catch(e){}}
{const js0=jailStart;jailStart=function(q){if(q&&q.court)courtKill(q);return js0.apply(this,arguments)}}
{const cs1=courtStart;courtStart=function(q,fine){if(q&&(q.jail||(q.pen&&q.pen.on)||(q.court&&!q.court.done)))return;return cs1.apply(this,arguments)}}
{const ct1=courtTick;courtTick=function(q,dt){if(q&&q.court&&(q.jail||(q.pen&&q.pen.on))){courtKill(q);return}return ct1.apply(this,arguments)}}
{const jr0=jlRestore;jlRestore=function(q){if(q.court)return;/* wait for the trial to finish */if(q.jail||(q.pen&&q.pen.on)){q.jlDone=1;return}return jr0.apply(this,arguments)}}
/* and however it happens, one catch every 2 seconds at most: no alarm pile-ups */
{const jc0=jailCaught;jailCaught=function(q,why){const n=performance.now();if(q.jail&&q.jail.cT&&n-q.jail.cT<2000)return;if(q.jail)q.jail.cT=n;return jc0.apply(this,arguments)}}
