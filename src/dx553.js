/* =====================================================================================================
   r553: the X-13 WRAITH gets serious armour (hits do a quarter of what they did) that REGENERATES once it has been
   out of fire for three seconds; and the approach to the old airfield's runway is cleared of cacti and rocks so
   autoland never flies a plane into one.
   ===================================================================================================== */
{const md0=milVehDmg;milVehDmg=function(q,v,n){if(v&&v.K&&v.K.proto){n*=.25;v.hitAt=performance.now()}return md0.call(this,q,v,n)}}
setInterval(()=>{try{const q=BUS.ride;if(!q||!q.vehs)return;const now=performance.now();for(const v of q.vehs){if(!v.K||!v.K.proto||v.wreck||!(v.adm>0))continue;if(now-(v.hitAt||0)>3000){const was=v.adm;v.adm=Math.max(0,v.adm-6);if(q.seat&&q.seat.v===v&&Math.floor(was/25)!==Math.floor(v.adm/25))hint('🛡️ Wraith armour regenerating: '+Math.round(100-v.adm)+'%')}}}catch(e){}},500);
function rwClear(q){if(q.rwC)return;q.rwC=1;const box=(x,z)=>x>-480&&x<330&&z>-1255&&z<-1205;for(let i=q.obs.length-1;i>=0;i--){const o=q.obs[i];if(!o.m||!(o.kd=='cactus'||o.kd=='rock'||o.kd=='boulder'))continue;const x=(o.x0+o.x1)/2,z=(o.z0+o.z1)/2;if(box(x,z)){o.m.visible=false;q.obs.splice(i,1)}}
 q.g.traverse(o=>{if(!o.visible)return;const x=o.position.x,z=o.position.z;if(!box(x,z))return;if(o.isGroup&&o.children[0]&&o.children[0].material&&o.children[0].material.color&&o.children[0].material.color.getHex()===0x3a7a3a&&o.children[0].geometry&&o.children[0].geometry.type=='CylinderGeometry')o.visible=false});q.obsDirty=1}
setInterval(()=>{try{const q=BUS.ride;if(q&&q.roam&&q.obs&&q.g)rwClear(q)}catch(e){}},1500);
