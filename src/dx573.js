/* =====================================================================================================
   r573: MEMORY. Leaving the lobby or a run now lets the old rooms go:
   - the lobby's blinking tunnel lamps list was never emptied, so every lobby visit kept the whole old lobby alive;
   - the last room built stayed referenced after a run ended (G, wards, doors ...), keeping its meshes alive.
   ===================================================================================================== */
function memDrop(){try{G=new THREE.Group();wards=[];RL=[];drs=[];hands=[];cops=[];seek=fig=ev=keyM=null;obs=[];crs=[];wgs=[];picks=[];mzs=[];puz=null}catch(e){}}
{const ca0=clearAll;clearAll=function(){const r=ca0.apply(this,arguments);memDrop();return r}}
{const he0=hubEnter;hubEnter=function(){HUB.blink=[];return he0.apply(this,arguments)}}
{const hl0=hubLeave;hubLeave=function(){const on=HUB.on;const r=hl0.apply(this,arguments);if(on){HUB.blink=[];HUB.props=[];HUB.ducks=[];HUB.pud=[];HUB.mh=[]}return r}}
