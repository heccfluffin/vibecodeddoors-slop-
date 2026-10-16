/* =====================================================================================================
   r586: WRAITH REFIT MISSIONS CAN BE REPLAYED. Every refit you have already passed stays on the OPS BOARD as a
   replay: the crew re-tune the part, you run the challenge again, and you get the full XP for it.
   ===================================================================================================== */
{const ol6=milOpsList;milOpsList=function(r){const L=ol6.apply(this,arguments);try{const S=milSV(),wk=S.wk|0;if(!garOwned('proto')||!wk)return L;const have=new Set(L.map(o=>o.id));
  const rp=MILOPS.filter(o=>o.ref&&o.ref<=wk&&!have.has(o.id)).map(o=>Object.assign(Object.create(o),{nm:o.nm+' (replay)',d:'🔁 REPLAY. Your Wraith already has this part. Drive onto the refit pad, then run the challenge again for '+o.xp+' XP.'}));L.push(...rp)}catch(e){}return L}}
