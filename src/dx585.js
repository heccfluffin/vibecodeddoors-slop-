/* =====================================================================================================
   r585: DIFFERENT CRIMES IN DIFFERENT PLACES. What happens depends on where it happens: a bank job in Dusty Gulch,
   cattle rustlers at Sunny Acres, copper thieves at the wind and solar farms, a purse snatcher at Mirage Lake ...
   Some crooks have a getaway car (the right one for the job), some run for it on foot.
   ===================================================================================================== */
const CRLOC=[
 [/^Dusty Gulch/,'bank job','🏦','a bank job','sedan'],
 [/^Rushy's Diner/,'diner holdup','🍔','an armed holdup at the diner','sedan'],
 [/^Motel 13/,'break-in','🚪','a motel room break-in',0],
 [/^Drive-in/,'projector theft','🎞️','somebody stealing the projector','truck'],
 [/^Mirage Lake/,'purse snatching','👜','a purse snatching',0],
 [/^Speedway/,'car theft','🏎️','a race car being stolen','buggy'],
 [/^Goblino's Scrap/,'scrap theft','🔩','scrap metal theft','truck'],
 [/^Observatory/,'lens theft','🔭','a telescope lens theft',0],
 [/^Dino Dan/,'shoplifting','🦖','shoplifting at the gift shop',0],
 [/^Sunny Acres/,'cattle rustling','🐄','cattle rustling','truck'],
 [/^Lookout Mesa/,'mugging','👊','a mugging',0],
 [/^Airfield/,'fuel theft','⛽','fuel theft','truck'],
 [/^Old Quarry/,'dynamite theft','🧨','dynamite being stolen','buggy'],
 [/^(Wind farm|Solar farm)/,'copper theft','🔌','copper cable theft','truck']];
{const cs0=crSpawn;crSpawn=function(q){const n0=CRM.list.length,h0=hint;let said=null;hint=function(t){if(said==null&&/All units/.test(String(t))){said=t;return}return h0.apply(this,arguments)};
 let r;try{r=cs0.apply(this,arguments)}finally{hint=h0}
 const c=CRM.list.length>n0?CRM.list[CRM.list.length-1]:null;if(!c){if(said)hint(said);return r}
 try{const E=CRLOC.find(e=>e[0].test(c.loc.nm));if(E){c.K=[E[1],E[2],E[3]];
   if(!E[4]){/* on foot: no getaway car */c.foot=1;try{if(c.v)garRemove(q,c.v)}catch(e){}c.v=null;c.u=null;if(c.m&&c.m.children[2])c.m.children[2].visible=/purse|lens|shoplift/.test(E[1])}
   else if(c.v&&c.v.k!=E[4]&&c.v.kind!=E[4]){/* the right car for the job */const o=c.v;try{const v=q.addVeh(E[4],o.x,o.z,o.h);v.npc=1;v.crim=c.id;v.nogar=1;v.owner='';for(const p of q.props)if(p.veh===v)p.txt=()=>'';garRemove(q,o);c.v=v;c.u={v,stuck:0,bT:0}}catch(e){}}}
  hint('📻 DESERT PD: "All units, '+c.K[2]+' in progress at '+c.loc.nm+'!" 🚨 '+(c.foot?'The suspect is on FOOT.':'It is on your map.'))}catch(e){if(said)hint(said)}return r}}
/* a crook on foot does not get in a car when the job is done: he runs */
{const ct0=crTick;crTick=function(q,dt){try{for(const c of CRM.list){if(c.foot&&c.st=='rob'&&c.t+dt>18){const g=crRunner(q,c,c.x,c.z);if(c.m)c.m.visible=false;if(g){c.st='run';c.t=0;hint('📻 DESERT PD: "Suspect running from '+c.loc.nm+' on foot!" Catch him and TACKLE him (E).')}}}}catch(e){}return ct0.apply(this,arguments)}}
