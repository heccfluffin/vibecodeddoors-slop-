/* =====================================================================================================
   r535: HUD layout and alt-tab.
   - In the desert the chat sits to the right of the minimap instead of on top of it (the squad panel moved to the right).
   - A hidden tab (alt-tab, minimised) still tells your co-op friends where you are once a second, so you do not
     vanish for them or get dropped from your squad.
   ===================================================================================================== */
setInterval(()=>{try{const dm=document.getElementById('dmapW'),on=dm&&dm.style.display!='none'&&getComputedStyle(dm).display!='none'&&dm.getBoundingClientRect().width>0;
 const L=on?Math.round(dm.getBoundingClientRect().right+10)+'px':'12px';if(mpc.style.left!==L){mpc.style.left=L;mpc.style.width=on?'min(400px,calc(100vw - '+L+' - 12px))':'min(400px,calc(48*var(--vw)))'}}catch(e){}},400);
setInterval(()=>{try{if(!document.hidden)return;const q=BUS.ride;if(q&&q.vnet&&q.roam){q.vnet.t=0;vehNetTick(q,0)}}catch(e){}},1000);
