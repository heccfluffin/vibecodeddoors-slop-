/* r592: room desync fix. three.js gives every new mesh/material/geometry a random id using Math.random, so while a room was being
   generated from the seeded random, each object three created ate a number from the room's sequence. Clients that had a texture or
   geometry cached already (different browser, different rooms seen before) made a different number of objects and the rest of the room
   came out differently. Now calls that come from three.js always use the browser's own random, and the seeded sequence is only used by the game. */
(function(){try{const NAT=Math.random;let cur=NAT,wrap=NAT;const fromThree=()=>{const L=Error.stackTraceLimit;try{Error.stackTraceLimit=4}catch(e){}const s=String(new Error().stack||'');try{Error.stackTraceLimit=L}catch(e){}
  const fr=s.split('\n').filter(x=>x&&!/^Error/.test(x));return !!(fr[2]&&fr[2].indexOf('three')>=0&&fr[2].indexOf('three.min')>=0)};
 Object.defineProperty(Math,'random',{configurable:true,get(){return wrap},set(f){if(f&&f.__raw)f=f.__raw;cur=f;if(f===NAT){wrap=NAT;return}const g=function(){return fromThree()?NAT():cur()};g.__raw=f;wrap=g}});
 window.RNGISO=1}catch(e){console.warn('rng isolation',e)}})();
{const tk0=turnOK;turnOK=function(nn,prev,o){if(o&&o.ofcI>0)return 0;return tk0.apply(this,arguments)}}
