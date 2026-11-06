/* r682: more desert songs. Out on the sand the game used to loop one song ("Desert").
   Now each time the desert music starts it picks one of five songs at random, and when a song
   ends it picks another (never the same one twice in a row). The new songs are inlined by
   build.py as desertMus3..desertMus6; on the website they load in the background, so a song
   that hasn't arrived yet is simply not picked. */
const DSONGS=['desertMus2','desertMus3','desertMus4','desertMus5','desertMus6'];
const DSNG={cache:{},last:null,on:!/[?&]nodsongs(?:[&=]|$)/.test(location.search)};
function dsngReady(id){try{const el=document.getElementById(id);return !!(el&&el.textContent.length>1000)}catch(e){return false}}
function dsngAudio(id){if(DSNG.cache[id])return DSNG.cache[id];try{const el=document.getElementById(id);if(!el)return null;const bin=atob(el.textContent.trim()),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);const a=new Audio(URL.createObjectURL(new Blob([u],{type:'audio/mpeg'})));a.loop=false;a.volume=0;a.addEventListener('ended',()=>{DSNG.ended=a});DSNG.cache[id]=a;try{el.textContent=''}catch(e){}return a}catch(e){return null}}
function dsngPick(){const ok=DSONGS.filter(id=>DSNG.cache[id]||dsngReady(id));if(!ok.length)return null;let c=ok.filter(id=>id!==DSNG.last);if(!c.length)c=ok;const id=c[Math.floor(Math.random()*c.length)];/* not the seeded room random: this runs in the desert, never during room generation */DSNG.last=id;return id}
function dsngSwap(o,keepVol){const id=dsngPick();if(!id)return;const a=dsngAudio(id);if(!a)return;if(o.a&&o.a!==a){try{o.a.pause()}catch(e){}}try{a.currentTime=0}catch(e){}a.loop=false;if(!keepVol)o.v=0;try{a.volume=Math.max(0,Math.min(1,o.v))}catch(e){}o.a=a;o.id=id}
{const dc0=dmusCh;dmusCh=function(o,id,want,dt){if(!DSNG.on||o!==DMUS2)return dc0.apply(this,arguments);try{
  /* a fresh start (first time, or after the music had fully faded out and paused): pick a random song */
  if(want&&(!o.a||(o.a.paused&&o.v<=0&&DSNG.ended!==o.a)))dsngSwap(o,false);
  /* the song finished: straight on to another one, at the same volume */
  else if(want&&o.a&&DSNG.ended===o.a){DSNG.ended=null;dsngSwap(o,true)}
}catch(e){}return dc0.apply(this,arguments)}}
