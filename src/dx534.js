/* =====================================================================================================
   r534: never stuck under the map. The Devil's Gorge (and the pyramid's underground) put you on a "deep" floor
   30 m down. Being sent somewhere else while still flagged deep (arrested, jailed, the penitentiary, let out,
   turning yourself in) left you walking 30 m under the surface. Now any of those clears it, and a watchdog
   lifts you back up if you are ever "deep" somewhere that has no deep floor.
   ===================================================================================================== */
function deepClear(q){if(!q||!q.deep)return;q.deep=0;q.deepY=0;try{P.dy=vehGround(q,P.x,P.z-q.OZ)}catch(e){P.dy=0}}
for(const nm of['jailStart','penStart','courtStart','penRelease']){try{const f0=eval(nm);if(typeof f0!=='function')continue;const w=function(q){const r=f0.apply(this,arguments);try{deepClear(q)}catch(e){}return r};eval(nm+'=w')}catch(e){}}
function deepWatch(){try{const q=BUS.ride;if(!q||!q.roam||!q.deep||q.lift||q.xr){if(q)q.dpBad=0;return}
 let ok=true;try{ok=deepOK(q,P.x,P.z-q.OZ)}catch(e){}if(ok){q.dpBad=0;return}
 if((q.dpBad=(q.dpBad||0)+1)>=3){q.dpBad=0;deepClear(q);hint('🏜️ You were somehow under the desert. Back up you come.')}}catch(e){}}
setInterval(deepWatch,250);
