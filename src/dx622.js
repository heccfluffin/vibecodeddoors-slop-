/* =====================================================================================================
   r630: LAG TEST window. Press F9 (or type /lag in chat). It shows, live:
     - frames per second, average and worst frame time, and a frame-time graph (spikes show up as red bars);
     - where the time goes: the game code (split into its biggest parts: vehicles, police, squads, animations,
       the map, culling, batching...), working out object positions, drawing, and the rest (time the browser spends
       waiting, mostly on the graphics card);
     - how much is drawn: draw calls, triangles, objects, resolution, memory.
   Test switches (they only change what is DRAWN for a moment, never the game itself, and they all switch back off
   when the window is closed): hide vehicles / scenery / small details / later-built areas / glows, and turn the
   r629 position skip off. "Find the lag" runs through them by itself (about 20 s) and says which one costs most.
   "Copy report" puts everything on the clipboard to paste to Claude.
   SPIKE CATCHER: every frame that takes much longer than usual is written down with what it was doing (its biggest
   parts, new shaders, new textures and meshes sent to the graphics card), or marked as the browser's own pause.
   Nothing here runs or changes anything while the window is closed, apart from a few timers.
   ===================================================================================================== */
const LAG={cur:{},spikes:[],gaps:[],lt:0,prev:null,t0:0,open:0,hide:{},mwxOff:0,fr:[],sys:{},cpu:0,logic:0,pos:0,rend:0,calls:0,tris:0,frames:0,last:0,acc:null,auto:null,res:null};
const LAGSYS=[['busRideUpd','Desert game code (all of it)',1],['vehTick','Vehicles: driving and physics'],['pcrTick','Police patrols'],['copTick','Police chase'],['pdUnitsTick','Police backup cars'],['cwTick','Squads'],['hwpTick','Highway traffic'],['milIdleTick','Soldiers on the base'],['xpAnimTick','Animations'],['xpTick','Places (shops, races, jobs...)'],['dmapTick','Map and minimap'],['sqmTick','Squad camera monitors'],['mnTick','The mine'],['xpCull','Culling and batch watchdog'],['perfLate','Late batching'],['perfCull','Distance culling'],['mpTick','Co-op networking']];
const LAGHIDE=[['veh','Vehicles'],['chunk','Scenery (desert chunks)'],['small','Small details'],['late','Areas built later (Fort, quarry, prison...)'],['spr','Glows and sprites']];
/* timing wrappers: they add up time only while the window is open */
for(const[n]of LAGSYS){try{const f0=window[n];if(typeof f0!=='function')continue;window[n]=function(){if(!LAG.open)return f0.apply(this,arguments);const t=performance.now();try{return f0.apply(this,arguments)}finally{const d=performance.now()-t;LAG.sys[n]=(LAG.sys[n]||0)+d;LAG.cur[n]=(LAG.cur[n]||0)+d}}}catch(e){}}
{const L0=loop;loop=function(){if(!LAG.open)return L0.apply(this,arguments);const t=performance.now();if(LAG.lt)lagGap(t-LAG.lt);LAG.lt=t;LAG.cur={};try{return L0.apply(this,arguments)}finally{const d=performance.now()-t;LAG.cpu+=d;LAG.frames++;LAG.cur.cpu=d;LAG.prev=LAG.cur}}}
/* SPIKE CATCHER: the time between two frames is the last frame's work plus any waiting. When it is much longer than usual,
   write down what that last frame did (its biggest parts, and anything new it had to send to the graphics card) */
function lagGap(gap){const G=LAG.gaps;G.push(gap);if(G.length>120)G.shift();if(G.length<20)return;const med=G.slice().sort((a,b)=>a-b)[G.length>>1];if(gap<Math.max(45,med*2.5))return;
 const f=LAG.prev||{},parts=LAGSYS.filter(([n,,tot])=>!tot&&f[n]>=Math.max(2,(f.cpu||0)*.15)).map(([n,nm])=>[f[n],nm]).sort((a,b)=>b[0]-a[0]).slice(0,3);
 const sp={t:(performance.now()-LAG.t0)/1000,gap,usual:med,cpu:f.cpu||0,pos:f.pos||0,rend:f.rend||0,parts,sh:f.sh||0,tex:f.tex||0,geo:f.geo||0,where:lagWhere()};LAG.spikes.push(sp);if(LAG.spikes.length>40)LAG.spikes.shift()}
function lagWhere(){try{const q=BUS&&BUS.ride;if(q&&q.roam)return'desert '+Math.round(P.x)+','+Math.round(P.z-q.OZ);return String(state)}catch(e){return''}}
function lagSpikeTxt(sp){const up=[];if(sp.sh)up.push(sp.sh+' new shader'+(sp.sh>1?'s':'')+' compiled');if(sp.tex)up.push(sp.tex+' new textures');if(sp.geo>20)up.push(sp.geo+' new meshes sent to the graphics card');
 const L=sp.parts.map(([v,nm])=>nm+' '+lagF(v,0));if(sp.rend-sp.pos>Math.max(3,sp.cpu*.3))L.push('drawing '+lagF(sp.rend-sp.pos,0));if(sp.pos>Math.max(3,sp.cpu*.3))L.push('positions '+lagF(sp.pos,0));
 const wait=Math.max(0,sp.gap-sp.cpu);let w='game code '+lagF(sp.cpu,0)+' ms'+(L.length?' ('+L.join(', ')+')':'');if(wait>sp.usual)w+=', waiting '+lagF(wait,0)+' ms ('+(up.length?'the graphics card taking in the new things':'the browser or graphics card: memory clean-up, another program...')+')';
 return lagF(sp.t,1)+' s: '+lagF(sp.gap,0)+' ms frame (usually '+lagF(sp.usual,0)+'): '+w+(up.length?' · '+up.join(', '):'')+' · '+sp.where}
{const u0=S.updateMatrixWorld;S.updateMatrixWorld=function(){if(!LAG.open)return u0.apply(this,arguments);const t=performance.now();try{return u0.apply(this,arguments)}finally{const d=performance.now()-t;LAG.pos+=d;LAG.cur.pos=(LAG.cur.pos||0)+d}}}
/* the things a hide switch covers, in the desert */
function lagSet(k){const q=BUS&&BUS.ride;if(!q||!q.g||!q.roam)return[];const L=[];
 if(k=='veh'){for(const v of q.vehs||[])if(v&&v.m)L.push(v.m)}
 else if(k=='chunk'){for(const c of q.chunks||[])L.push(c)}
 else if(k=='small'){for(const c of q.chunks||[])if(c.userData.smg)L.push(c.userData.smg)}
 else if(k=='late'){const veh=new Set((q.vehs||[]).map(v=>v.m)),skip=new Set([q.sky,q.sun,q.zsky,q.zstar,q.sand,q.bg,BUS._sky,BUS._sun].filter(Boolean));for(const o of q.g.children)if(!o.userData.chunk&&!veh.has(o)&&!skip.has(o)&&(o.isGroup||o.type==='Object3D'))L.push(o)}
 else if(k=='spr'){if(q.dp&&q.dp.sprites)for(const s of q.dp.sprites)L.push(s)}
 return L}
{const r0=R.render;R.render=function(sc,cam){if(!LAG.open)return r0.apply(this,arguments);const main=sc===S&&cam===C;let saved=null;
  if(main){for(const[k]of LAGHIDE)if(LAG.hide[k]){saved=saved||[];for(const o of lagSet(k)){saved.push([o,o.visible]);o.visible=false}}if(LAG.mwxOff&&typeof MWX!='undefined'){LAG._mw=MWX.on;MWX.on=false}}
  const p0=R.info.programs?R.info.programs.length:0,x0=R.info.memory.textures,g0=R.info.memory.geometries,t=performance.now();try{return r0.apply(this,arguments)}finally{const d=performance.now()-t,C2=LAG.cur;LAG.rend+=d;C2.rend=(C2.rend||0)+d;C2.sh=(C2.sh||0)+Math.max(0,(R.info.programs?R.info.programs.length:0)-p0);C2.tex=(C2.tex||0)+Math.max(0,R.info.memory.textures-x0);C2.geo=(C2.geo||0)+Math.max(0,R.info.memory.geometries-g0);if(main){LAG.calls+=R.info.render.calls;LAG.tris+=R.info.render.triangles;LAG.mainN=(LAG.mainN||0)+1}
   if(saved)for(let i=saved.length-1;i>=0;i--)saved[i][0].visible=saved[i][1];if(main&&LAG.mwxOff&&typeof MWX!='undefined')MWX.on=LAG._mw}}}
/* frame times from the browser's own clock */
function lagRaf(t){if(!LAG.open)return;if(LAG.last)LAG.fr.push(t-LAG.last);if(LAG.fr.length>240)LAG.fr.shift();LAG.last=t;requestAnimationFrame(lagRaf)}
function lagTake(){/* averages since the last call */const n=Math.max(1,LAG.frames),m=Math.max(1,LAG.mainN||0),fr=LAG.fr.slice(-Math.max(1,LAG.frames));const avg=fr.length?fr.reduce((a,b)=>a+b,0)/fr.length:0;
 const o={fps:avg?1000/avg:0,frame:avg,worst:fr.length?Math.max(...fr):0,cpu:LAG.cpu/n,pos:LAG.pos/n,rend:LAG.rend/n,calls:LAG.calls/m,tris:LAG.tris/m,sys:{}};for(const k in LAG.sys)o.sys[k]=LAG.sys[k]/n;
 LAG.cpu=LAG.pos=LAG.rend=LAG.calls=LAG.tris=0;LAG.frames=0;LAG.mainN=0;LAG.sys={};return o}
function lagScene(){const q=BUS&&BUS.ride,o={};try{let n=0,d=0;S.traverse(x=>{n++});o.objects=n;o.geoms=R.info.memory.geometries;o.tex=R.info.memory.textures;const c=R.domElement;o.res=c.width+'x'+c.height;o.pr=+R.getPixelRatio().toFixed(2);if(performance.memory)o.heap=Math.round(performance.memory.usedJSHeapSize/1e6);if(q&&q.roam){o.vehs=(q.vehs||[]).length;o.anims=(q.anims||[]).length;o.obs=(q.obs||[]).length;o.chunks=(q.chunks||[]).filter(c=>c.visible).length+'/'+(q.chunks||[]).length;o.pos=Math.round(P.x)+', '+Math.round(P.z-q.OZ)}if(typeof MWX!='undefined')o.skipped=MWX.skipped}catch(e){}return o}
function lagVerdict(a){if(!a.frame)return'';const busy=a.cpu,wait=Math.max(0,a.frame-busy);if(a.fps>55&&a.worst<40)return'Running smoothly.';
 if(wait>busy*1.2)return'Mostly waiting on the GRAPHICS CARD (or the browser): try the hide switches to see what is heavy to draw.';return'Mostly the PROCESSOR (game code and positions): see the biggest parts below.'}
const lagF=(v,d=1)=>(+v||0).toFixed(d);
function lagDraw(a){const d=document.getElementById('lagDlg');if(!d)return;const sc=lagScene(),A=a||LAG.acc||{};LAG.acc=A;
 const rows=LAGSYS.filter(([n])=>A.sys&&A.sys[n]!=null).map(([n,nm,tot])=>[A.sys[n],nm,tot]).sort((x,y)=>(y[2]?1e9:y[0])-(x[2]?1e9:x[0]));
 const other=Math.max(0,(A.frame||0)-(A.cpu||0));
 let h='<div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:16px">LAG TEST</b><span style="opacity:.7">F9 or /lag to close</span></div>';
 h+='<div style="font-size:26px;font-weight:bold;color:'+(A.fps>50?'#6f6':A.fps>28?'#fd4':'#f66')+'">'+lagF(A.fps,0)+' FPS</div><div>frame '+lagF(A.frame)+' ms · worst '+lagF(A.worst,0)+' ms</div>';
 h+='<canvas id="lagG" width="300" height="46" style="width:100%;height:46px;background:#0006;margin:4px 0"></canvas>';
 h+='<div style="color:#fd8;margin:2px 0 6px">'+lagVerdict(A)+'</div>';
 h+='<table style="width:100%;border-collapse:collapse">';const tr=(k,v,c)=>'<tr'+(c?' style="color:'+c+'"':'')+'><td>'+k+'</td><td style="text-align:right">'+v+'</td></tr>';
 h+=tr('<b>Whole frame</b>','<b>'+lagF(A.frame)+' ms</b>');h+=tr('Game code + drawing (processor)',lagF(A.cpu)+' ms');h+=tr('&nbsp; working out positions',lagF(A.pos)+' ms');h+=tr('&nbsp; drawing (sending to the graphics card)',lagF(Math.max(0,(A.rend||0)-(A.pos||0)))+' ms');
 for(const[v,nm,tot]of rows)if(tot||v>=.05)h+=tr('&nbsp; '+(tot?'':'&nbsp; ')+nm,lagF(v,2)+' ms',tot?null:'#bbb');
 h+=tr('Waiting (graphics card / browser)',lagF(other)+' ms','#9cf');h+='</table>';
 h+='<div style="margin-top:6px">'+lagF(A.calls,0)+' draw calls · '+Math.round((A.tris||0)/1000)+'k triangles · '+(sc.objects||0)+' objects'+(sc.skipped!=null?' ('+sc.skipped+' skipped)':'')+'</div>';
 h+='<div style="opacity:.8">'+(sc.res||'')+' px (×'+sc.pr+')'+(sc.heap!=null?' · '+sc.heap+' MB memory':'')+' · '+sc.geoms+' meshes data · '+sc.tex+' textures'+(sc.vehs!=null?'<br>'+sc.vehs+' vehicles · '+sc.anims+' animations · '+sc.obs+' obstacles · chunks shown '+sc.chunks+' · at '+sc.pos:'')+'</div>';
 h+='<div style="margin-top:8px"><b>Test switches</b> <span style="opacity:.7">(press Esc for the mouse; drawing only, all reset on close)</span></div><div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px">';
 const bt=(id,txt,on)=>'<button data-l="'+id+'" style="font:inherit;font-size:12px;padding:3px 6px;border-radius:4px;border:1px solid #888;cursor:pointer;background:'+(on?'#c33':'#333')+';color:#fff">'+txt+'</button>';
 for(const[k,nm]of LAGHIDE)h+=bt('h:'+k,(LAG.hide[k]?'✔ ':'')+'Hide '+nm.toLowerCase(),LAG.hide[k]);h+=bt('mwx',(LAG.mwxOff?'✔ ':'')+'Position skip OFF',LAG.mwxOff);h+='</div>';
 h+='<div style="display:flex;gap:6px;margin-top:8px">'+bt('auto',LAG.auto?'Testing... '+LAG.auto.i+'/'+LAG.auto.L.length:'▶ Find the lag (20 s)',!!LAG.auto)+bt('copy','📋 Copy report')+bt('close','Close')+'</div>';
 if(LAG.res)h+='<div style="margin-top:8px;border-top:1px solid #555;padding-top:6px;white-space:pre-wrap">'+LAG.res+'</div>';
 h+='<div style="margin-top:8px;border-top:1px solid #555;padding-top:6px"><b>Lag spikes</b> <span style="opacity:.7">('+LAG.spikes.length+' since the window opened; tip: open it before you go to the desert)</span>'+(LAG.spikes.length?'<div style="font-size:12px;opacity:.9">'+LAG.spikes.slice(-6).reverse().map(lagSpikeTxt).join('<br>')+'</div>':'<div style="opacity:.7">none yet</div>')+'</div>';
 d.innerHTML=h;
 const g=document.getElementById('lagG');if(g){const k=g.getContext('2d'),F=LAG.fr.slice(-150),w=g.width/150;for(let i=0;i<F.length;i++){const v=F[i],hh=Math.min(46,v/100*46);k.fillStyle=v>50?'#f55':v>25?'#fd4':'#5d5';k.fillRect(i*w,46-hh,Math.max(1,w-.5),hh)}k.fillStyle='#fff6';k.fillRect(0,46-16.7/100*46,300,1)}}
function lagClick(e){const b=e.target.closest&&e.target.closest('button[data-l]');if(!b)return;const id=b.dataset.l;
 if(id.startsWith('h:')){const k=id.slice(2);LAG.hide[k]=!LAG.hide[k]}else if(id=='mwx')LAG.mwxOff=!LAG.mwxOff;else if(id=='close')return lagToggle();else if(id=='copy')return lagCopy();else if(id=='auto')return lagAuto();lagDraw()}
function lagReport(){const A=LAG.acc||{},sc=lagScene();const L=['DOORS lag report · '+(typeof BUILD!='undefined'?BUILD:'')+' · '+navigator.userAgent,'Where: '+(BUS&&BUS.ride&&BUS.ride.roam?'desert at '+sc.pos:state),
 lagF(A.fps,0)+' FPS · frame '+lagF(A.frame)+' ms · worst '+lagF(A.worst,0)+' ms · processor '+lagF(A.cpu)+' ms (positions '+lagF(A.pos)+', drawing '+lagF(Math.max(0,(A.rend||0)-(A.pos||0)))+') · waiting '+lagF(Math.max(0,(A.frame||0)-(A.cpu||0)))+' ms',
 'Parts: '+LAGSYS.filter(([n])=>A.sys&&A.sys[n]!=null).map(([n,nm])=>n+' '+lagF(A.sys[n],2)).join(', '),
 lagF(A.calls,0)+' draw calls · '+Math.round((A.tris||0)/1000)+'k tris · '+sc.objects+' objects · skipped '+sc.skipped+' · '+sc.res+' x'+sc.pr+(sc.heap!=null?' · heap '+sc.heap+' MB':'')+' · geoms '+sc.geoms+' · tex '+sc.tex+' · vehicles '+sc.vehs+' · anims '+sc.anims+' · chunks '+sc.chunks,
 'Switches: '+(Object.keys(LAG.hide).filter(k=>LAG.hide[k]).join(',')||'none')+(LAG.mwxOff?' +position skip off':'')];if(LAG.res)L.push('Find the lag:\n'+LAG.res);L.push('Lag spikes ('+LAG.spikes.length+'):'+(LAG.spikes.length?'\n'+LAG.spikes.map(lagSpikeTxt).join('\n'):' none'));return L.join('\n')}
function lagCopy(){const t=lagReport();try{navigator.clipboard.writeText(t).then(()=>hint('📋 Lag report copied. Paste it to Claude.'),()=>prompt('Copy this:',t))}catch(e){prompt('Copy this:',t)}}
/* "Find the lag": a few seconds with each switch on, one at a time, compared with none */
function lagAuto(){if(LAG.auto)return;if(!(BUS&&BUS.ride&&BUS.ride.roam))return hint('🐢 "Find the lag" works out in the desert.');LAG.hide={};LAG.mwxOff=0;
 const L=[['none','Nothing hidden']].concat(LAGHIDE.map(([k,nm])=>['h:'+k,'Hide '+nm.toLowerCase()]),[['mwx','Position skip off'],['none2','Nothing hidden (again, to see how much the numbers wobble)']]);LAG.auto={L,i:0,out:[]};LAG.res='';
 const step=()=>{const A=LAG.auto;if(!A||!LAG.open)return;if(A.i>0){const r=lagTake();A.out.push([A.L[A.i-1],r])}LAG.hide={};LAG.mwxOff=0;if(A.i>=A.L.length)return lagAutoEnd();const id=A.L[A.i][0];if(id.startsWith('h:'))LAG.hide[id.slice(2)]=1;else if(id=='mwx')LAG.mwxOff=1;A.i++;setTimeout(()=>{lagTake();setTimeout(step,2400)},600)};lagTake();step()}
function lagAutoEnd(){const A=LAG.auto;LAG.auto=null;const b0=A.out[0][1],b1=A.out[A.out.length-1][1],base=(b0.frame+b1.frame)/2,noise=Math.max(1,Math.abs(b0.frame-b1.frame)),cb=(b0.calls+b1.calls)/2;
 const lines=['Nothing hidden: '+lagF((b0.fps+b1.fps)/2,0)+' FPS, frame '+lagF(base)+' ms, processor '+lagF((b0.cpu+b1.cpu)/2)+' ms, '+lagF(cb,0)+' draw calls (the two runs differ by '+lagF(noise)+' ms, so smaller changes are just wobble)'];let best=null;
 for(const[[id,nm],r]of A.out.slice(1,-1)){const save=base-r.frame,real=Math.abs(save)>noise;lines.push(nm+': '+lagF(r.fps,0)+' FPS, '+(real?(save>=0?'saves ':'costs ')+lagF(Math.abs(save))+' ms a frame':'no clear change')+', '+(cb-r.calls>=0?lagF(cb-r.calls,0)+' fewer':lagF(r.calls-cb,0)+' more')+' draw calls');if(id!='mwx'&&real&&save>0&&(!best||save>best[1]))best=[nm,save]}
 if(best)lines.push('➜ The heaviest to draw here: '+best[0].replace(/^Hide /,'').toUpperCase()+' (about '+lagF(best[1])+' ms of each frame).');else lines.push('➜ Hiding things makes no clear difference here: the time goes on game code or the browser itself (see the parts above).');
 LAG.res=lines.join('\n');lagDraw()}
function lagToggle(){let d=document.getElementById('lagDlg');if(LAG.open){LAG.open=0;LAG.hide={};LAG.mwxOff=0;LAG.auto=null;if(d)d.style.display='none';return}
 if(!d){d=document.createElement('div');d.id='lagDlg';d.style.cssText='position:fixed;top:10px;right:10px;width:340px;max-height:92vh;overflow:auto;z-index:99999;background:rgba(12,14,18,.9);color:#eee;font:13px DoorsSans,Arial,sans-serif;padding:10px 12px;border:1px solid #555;border-radius:8px;box-shadow:0 4px 20px #000a';d.addEventListener('click',lagClick);document.body.appendChild(d)}
 d.style.display='block';LAG.open=1;LAG.fr=[];LAG.last=0;LAG.res='';LAG.spikes=[];LAG.gaps=[];LAG.lt=0;LAG.prev=null;LAG.t0=performance.now();lagTake();requestAnimationFrame(lagRaf);const tick=()=>{if(!LAG.open)return;if(!LAG.auto)lagDraw(lagTake());else lagDraw();setTimeout(tick,700)};setTimeout(tick,700);lagDraw({})}
addEventListener('keydown',e=>{if(e.code=='F9'&&!e.repeat){e.preventDefault();lagToggle()}},true);
{const cc0=mpChatCmd;mpChatCmd=function(t){if(/^\/(lag|perf|fps)\b/i.test(String(t).trim())){lagToggle();return true}return cc0.apply(this,arguments)}}
