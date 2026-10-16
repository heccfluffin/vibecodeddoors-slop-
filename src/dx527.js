/* =====================================================================================================
   r527: MILITARY SQUADS. In co-op, enlisted players can form a squad (up to 4) from the OPS BOARD. When the squad leader
   picks an operation, everyone in the squad gets it too; when ANY squad member finishes it, it is done for the whole
   squad and everyone gets the XP. A squad panel shows who is in it, their rank and what they are up to.
   ===================================================================================================== */
const SQ={lead:'',mem:[],inv:null,el:null,quiet:0};
const sqIn=()=>!!SQ.lead,sqLead=()=>SQ.lead===SV.pid;
function sqNet(q,o){try{vehNet(q,o)}catch(e){}}
function sqRem(q){return q&&q.vnet?q.vnet.rem:{}}
function sqName(q,id){if(id===SV.pid)return SV.nm||'You';const r=sqRem(q)[id];return r?(r.nm||'Player'):'Player'}
function sqSet(q,lead,mem){const was=SQ.lead;SQ.lead=lead||'';SQ.mem=(mem||[]).slice(0,4);if(!SQ.mem.some(m=>m[0]===SV.pid)){SQ.lead='';SQ.mem=[]}sqHud(q);if(was&&!SQ.lead)hint('🪖 You are no longer in a squad.')}
function sqBroadcast(q){sqNet(q,{k:'sqm',lead:SQ.lead,mem:SQ.mem})}
function sqDlg(q){const S=milSV();if((S.r|0)<2){hint('🪖 Boot camp first.');return}const rem=sqRem(q),now=Date.now();
 const cands=Object.keys(rem).filter(id=>now-rem[id].t<5000&&(rem[id].mr|0)>=2&&!SQ.mem.some(m=>m[0]===id));
 let body='<p>Do operations together: the squad leader picks the job at the OPS BOARD and the whole squad gets it. When anyone in the squad finishes it, it counts for everybody, and everybody gets the XP.</p>';
 body+=sqIn()?'<p><b>Your squad</b> (leader: '+esc(sqName(q,SQ.lead))+'):<br>'+SQ.mem.map(m=>{const r=m[0]===SV.pid?S.r:(rem[m[0]]?rem[m[0]].mr|0:0);return(MILRANK[r]?MILRANK[r][1]+' '+milRankNm(r):'')+' · '+esc(m[1]||'Player')+(m[0]===SQ.lead?' 👑':'')}).join('<br>')+'</p>':'<p>You are not in a squad yet.</p>';
 const btns=[];if((!sqIn()||sqLead())&&SQ.mem.length<4)for(const id of cands)btns.push(['i:'+id,'➕ Invite '+esc(rem[id].nm||'Player')+' · '+(MILRANK[rem[id].mr|0]||['',''])[1]+' '+milRankNm(rem[id].mr|0)]);
 if(!cands.length&&(!sqIn()||sqLead()))body+='<p style="opacity:.75;font-size:12.5px">No enlisted teammates nearby to invite. (They need to have passed boot camp and be in this desert with you.)</p>';
 if(sqIn())btns.push(['leave',sqLead()?'❌ Disband the squad':'🚪 Leave the squad']);
 milDlg(q,'🪖 SQUAD',body,btns,b=>{if(b=='leave'){sqLeave(q);return}if(b.startsWith('i:')){const id=b.slice(2);if(!sqIn()){SQ.lead=SV.pid;SQ.mem=[[SV.pid,SV.nm||'Player']];sqHud(q)}sqNet(q,{k:'sqi',to:id,lead:SV.pid,nm:SV.nm||'Player'});hint('🪖 Invite sent to '+(rem[id]?rem[id].nm:'them')+'.')}})}
function sqLeave(q){if(!sqIn())return;if(sqLead()){SQ.mem=[];sqBroadcast(q);sqSet(q,'',[])}else{sqNet(q,{k:'sql',lead:SQ.lead});sqSet(q,'',[])}}
function sqNetIn(q,o,id){const nm=fsName(String(o.nm||''))||sqName(q,id);
 if(o.k=='sqi'){if(o.to!==SV.pid||sqIn())return;SQ.inv={lead:id,nm,t:Date.now()};milDlg(q,'🪖 SQUAD INVITE','<p><b>'+esc(nm)+'</b> wants you in their squad. You will get the operations they pick, and share the XP when any of you finishes one.</p>',[['yes','✅ Join the squad'],['no','No thanks']],b=>{const iv=SQ.inv;SQ.inv=null;if(b=='yes'&&iv&&Date.now()-iv.t<60000)sqNet(q,{k:'sqj',lead:iv.lead,nm:SV.nm||'Player'})})}
 else if(o.k=='sqj'){if(!sqLead()||o.lead!==SV.pid)return;if(SQ.mem.length>=4){return}if(!SQ.mem.some(m=>m[0]===id))SQ.mem.push([id,nm]);sqBroadcast(q);sqHud(q);hint('🪖 '+nm+' joined your squad.');snd(700,.1);const op=q.mil&&q.mil.op;if(op)setTimeout(()=>sqNet(q,{k:'sqo',lead:SV.pid,op:op.id,to:id}),300)}
 else if(o.k=='sql'){if(!sqLead()||o.lead!==SV.pid)return;SQ.mem=SQ.mem.filter(m=>m[0]!==id);sqBroadcast(q);sqHud(q);hint('🪖 '+nm+' left your squad.')}
 else if(o.k=='sqm'){const mem=Array.isArray(o.mem)?o.mem.filter(m=>Array.isArray(m)).map(m=>[String(m[0]),fsName(String(m[1]||''))||'Player']):[];if(String(o.lead)!==id)return;const inIt=mem.some(m=>m[0]===SV.pid);if(inIt){const was=SQ.lead;sqSet(q,id,mem);if(was!==id)hint('🪖 You joined '+nm+'\'s squad. Their operations are your operations now.')}else if(SQ.lead===id)sqSet(q,'',[])}
 else if(o.k=='sqo'){if(SQ.lead!==id||sqLead())return;if(o.to&&o.to!==SV.pid)return;const D=MILOPS.find(x=>x.id==o.op);if(!D)return;if((milSV().r|0)<D.min){hint('🪖 '+nm+' picked '+D.nm+', but that needs '+milRankNm(D.min)+'. You can still help out.');return}if(q.mil.op&&q.mil.op.id===D.id)return;SQ.quiet=1;try{milOpStart(q,D.id)}finally{SQ.quiet=0}hint('🪖 SQUAD OPERATION from '+nm+': '+D.ic+' '+D.nm+'. '+D.d)}
 else if(o.k=='sqd'){if(!SQ.mem.some(m=>m[0]===id)||!sqIn())return;const op=q.mil&&q.mil.op;if(!op||op.id!==o.op)return;SQ.quiet=1;try{hint('🪖 '+nm+' finished it for the squad!');milOpDone(q,op)}finally{SQ.quiet=0}}
 else if(o.k=='sqx'){if(SQ.mem.some(m=>m[0]===id))(sqRem(q)[id]||{}).sqLine=String(o.l||'').slice(0,80)}}
/* the leader's choice goes to the squad; a finish goes to the squad */
{const os0=milOpStart;milOpStart=function(q,id){os0(q,id);if(!SQ.quiet&&sqLead()&&SQ.mem.length>1)sqNet(q,{k:'sqo',lead:SV.pid,op:id})}}
{const od0=milOpDone;milOpDone=function(q,o){const ok=q&&q.mil&&q.mil.op===o&&!o.fin;od0(q,o);if(ok&&!SQ.quiet&&sqIn()&&SQ.mem.length>1)sqNet(q,{k:'sqd',lead:SQ.lead,op:o.id})}}
/* a squad mate's share from r525 (near you) is not paid twice */
{const si0=milSqIn;milSqIn=function(q,o,id){if(o.k=='msq'&&sqIn()&&SQ.mem.some(m=>m[0]===id))return;return si0(q,o,id)}}
{const dn1=desertNet;desertNet=function(o){try{if(o&&o.t=='dz'&&typeof o.k=='string'&&o.k.startsWith('sq')){const q=BUS.ride,id=String(o.id||'');if(q&&q.vnet&&id&&id!==SV.pid)sqNetIn(q,o,id);return}}catch(e){}return dn1(o)}}
/* the squad button on the ops board */
{const od1=milOpsDlg;milOpsDlg=function(q){od1(q);try{const d=document.getElementById('milDlg');if(!d)return;const b=document.createElement('button');b.style.cssText='display:block;width:100%;margin-top:10px;background:#2a3a5a;color:#fff;border:2px solid #7a9ad0;border-radius:8px;padding:10px 12px;font:bold 15px Georgia;cursor:pointer;text-align:left';b.innerHTML='🪖 SQUAD'+(sqIn()?' ('+SQ.mem.length+' · leader: '+esc(sqName(q,SQ.lead))+')':' · do operations with your friends');b.onclick=e=>{e.stopPropagation();milDlgClose(q);sqDlg(q)};const first=d.querySelector('button[data-b]');if(first)first.parentNode.insertBefore(b,first);else d.appendChild(b)}catch(e){}}}
/* the squad panel */
function sqHud(q){if(!SQ.el){const d=document.createElement('div');d.style.cssText='position:fixed;right:10px;top:calc(104px + env(safe-area-inset-top,0px));z-index:20;background:rgba(14,22,12,.82);border:2px solid #7a9a4a;border-radius:10px;padding:6px 10px;font:13px Georgia,serif;color:#e8f0d8;pointer-events:none;max-width:250px;display:none';document.body.appendChild(d);SQ.el=d}
 const on=sqIn()&&q&&q.roam;SQ.el.style.display=on?'block':'none';if(!on)return;const rem=sqRem(q),S=milSV();
 SQ.el.innerHTML='<b style="color:#c8e890">🪖 SQUAD</b>'+SQ.mem.map(m=>{const me=m[0]===SV.pid,r=me?S.r|0:(rem[m[0]]?rem[m[0]].mr|0:0),xp=me?S.xp|0:(rem[m[0]]?rem[m[0]].mx|0:0),ln=me?(q.mil&&q.mil.op?q.mil.op.D.ic+' '+q.mil.op.D.nm:'no job'):(rem[m[0]]&&rem[m[0]].sqLine)||'';return'<div style="margin-top:3px">'+(m[0]===SQ.lead?'👑 ':'')+(MILRANK[r]?MILRANK[r][1]+' ':'')+'<b>'+esc(m[1]||'Player')+'</b> <span style="opacity:.75">'+(MILRANK[r]?milRankNm(r):'')+' · '+xp+' XP</span>'+(ln?'<div style="font-size:11.5px;opacity:.8">'+esc(ln)+'</div>':'')+'</div>'}).join('')}
setInterval(()=>{try{const q=BUS.ride;if(!q||!q.roam||!q.vnet){if(SQ.el)SQ.el.style.display='none';return}if(sqIn()){const rem=q.vnet.rem,now=Date.now();if(!sqLead()&&!(rem[SQ.lead]&&now-rem[SQ.lead].t<90000)){sqSet(q,'',[]);hint('🪖 Your squad leader is gone. Squad disbanded.')}else if(sqLead()){const keep=SQ.mem.filter(m=>m[0]===SV.pid||(rem[m[0]]&&now-rem[m[0]].t<90000));if(keep.length!==SQ.mem.length){SQ.mem=keep;sqBroadcast(q)}if(SQ.mem.length<2&&(q.sqT=(q.sqT||0)+1)%20==0)sqBroadcast(q)}
  const op=q.mil&&q.mil.op;let l='no job';try{l=op?op.D.line(q,op).replace(/<[^>]+>/g,''):'no job'}catch(e){}if((q.sqLT=(q.sqLT||0)+1)%3==0)sqNet(q,{k:'sqx',l})}sqHud(q)}catch(e){}},700);
