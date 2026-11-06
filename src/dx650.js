/* r682/r683: more desert songs. Out on the sand (DMUS2) and down in the desert mines (DMUS) the game
   used to loop one song each. Now each time that music starts it picks a song from its list at
   random, and when a song ends it picks another (never the same one twice in a row). The new songs
   are inlined by build.py (desertMus3..6 for the sand, mineMus2..3 for the mines); on the website
   they load in the background, so a song that hasn't arrived yet is simply not picked.
   ?nodsongs = the old single looping songs. */
const DSONGS=['desertMus2','desertMus3','desertMus4','desertMus5','desertMus6'];
const MSONGS=['desertMus','mineMus2','mineMus3'];
const DSNG={cache:{},on:!/[?&]nodsongs(?:[&=]|$)/.test(location.search)};
function dsngReady(id){try{const el=document.getElementById(id);return !!(el&&el.textContent.length>1000)}catch(e){return false}}
function dsngAudio(id){if(DSNG.cache[id])return DSNG.cache[id];try{const el=document.getElementById(id);if(!el)return null;const bin=atob(el.textContent.trim()),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);const a=new Audio(URL.createObjectURL(new Blob([u],{type:'audio/mpeg'})));a.loop=false;a.volume=0;a.addEventListener('ended',()=>{a.__end=1});DSNG.cache[id]=a;try{el.textContent=''}catch(e){}return a}catch(e){return null}}
/* not the seeded room random: this only runs in the desert, never during room generation */
function dsngPick(o,list){const ok=list.filter(id=>DSNG.cache[id]||dsngReady(id));if(!ok.length)return null;let c=ok.filter(id=>id!==o.id);if(!c.length)c=ok;return c[Math.floor(Math.random()*c.length)]}
function dsngSwap(o,list,keepVol){const id=dsngPick(o,list);if(!id)return;const a=dsngAudio(id);if(!a)return;if(o.a&&o.a!==a){try{o.a.pause()}catch(e){}}try{a.currentTime=0}catch(e){}a.loop=false;a.__end=0;if(!keepVol)o.v=0;try{a.volume=Math.max(0,Math.min(1,o.v))}catch(e){}o.a=a;o.id=id}
{const dc0=dmusCh;dmusCh=function(o,id,want,dt){const list=!DSNG.on?null:o===DMUS2?DSONGS:o===DMUS?MSONGS:null;if(!list)return dc0.apply(this,arguments);try{
  /* the song finished: straight on to another one, at the same volume */
  if(want&&o.a&&o.a.__end)dsngSwap(o,list,true);
  /* a fresh start (first time, or after the music had fully faded out and paused): pick a random song */
  else if(want&&(!o.a||(o.a.paused&&o.v<=0)))dsngSwap(o,list,false);
}catch(e){}return dc0.apply(this,arguments)}}
