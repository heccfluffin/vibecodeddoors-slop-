/* =====================================================================================================
   r536: army vehicles are still indestructible inside Fort Blackout... unless the base has turned on YOU.
   If you sounded the alarm (stole the prototype, sabotage, shooting as a civilian...), the base's sentry guns,
   flak and guard tanks can wreck the military vehicle you are in.
   ===================================================================================================== */
var MILX=0;
{const f=milVehDmg;milVehDmg=function(q,v,n){MILX=(q&&milHostile(q))?1:0;try{return f.apply(this,arguments)}finally{MILX=0}}}
