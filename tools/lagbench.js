/* DOORS desert benchmark (for comparable lag reports). Paste into the browser console (F12) while standing in the
   desert on foot, with the game unchanged. Firefox and Chrome ask you to type "allow pasting" the first time.
   It changes nothing in the game: it uses the lag window (F9) to measure, stands you still at three fixed views for
   about 35 s each, then puts you back where you were and shows a report with a Copy button. Don't touch anything
   while it runs. */
(async()=>{
 const q=BUS&&BUS.ride;
 if(!q||!q.roam||q.inBus)return alert('Get off the bus in the desert first.');
 if(q.seat||q.deep||q.xr)return alert('Get out of the vehicle (or come up from underground) first, then run it again.');
 const FAST=window.BENCH_FAST||1,sleep=ms=>new Promise(r=>setTimeout(r,ms/FAST));
 const VIEWS=[['A','Fort Blackout, facing east',210,-918,-Math.PI/2],['B','same spot, facing north',210,-918,0],['C','beside the Desert PD HQ, facing it (west)',129,-1028,Math.PI/2]];
 const f1=v=>(+v||0).toFixed(1),f0=v=>(+v||0).toFixed(0);
 const home={x:P.x,z:P.z,yaw:P.yaw,pitch:P.pitch};
 if(!LAG.open)lagToggle();LAG.hide={};LAG.mwxOff=0;LAG.spikes=[];
 /* hold the view still every frame (the mouse cannot turn you while it runs) */
 let pin=null;const hold=()=>{if(pin){P.x=pin.x;P.z=pin.z+q.OZ;P.yaw=pin.yaw;P.pitch=0}if(window.__benchOn)requestAnimationFrame(hold)};window.__benchOn=1;requestAnimationFrame(hold);
 /* frame times from the browser clock, for the typical and worst frame */
 let ft=[],lastT=0;const rec=t=>{if(lastT)ft.push(t-lastT);lastT=t;if(window.__benchOn)requestAnimationFrame(rec)};requestAnimationFrame(rec);
 const pct=(a,p)=>{if(!a.length)return 0;const b=a.slice().sort((x,y)=>x-y);return b[Math.min(b.length-1,Math.floor(b.length*p))]};
 /* draw calls of one frame, by what they belong to */
 const byCat=()=>new Promise(res=>{const veh=new Map();for(const v of q.vehs||[])if(v&&v.m)veh.set(v.m,v);const moving=new Set(window.__benchMoving||[]);const cnt={};
  const cat=o=>{let p=o;while(p&&p.parent&&p.parent!==q.g)p=p.parent;if(!p||p.parent!==q.g)return'sky, sun and other';
   if(p.userData.chunk){for(let x=o;x&&x!==p;x=x.parent)if(x===p.userData.smg)return'scenery: small details';return'scenery: desert chunks'}
   if(veh.has(p))return moving.has(veh.get(p))?'vehicles: moving':'vehicles: standing';
   if(o.isSprite||o.isPoints)return'glows and sprites';
   return o.userData.dpMerged?'areas built later: batched':(o.userData.dpDyn?'areas built later: moving pieces':'areas built later: single pieces')};
  const rb=R.renderBufferDirect;let done=false;R.renderBufferDirect=function(cam,sc,g,m,obj){if(sc===S&&cam===C){const k=cat(obj);cnt[k]=(cnt[k]||0)+1}return rb.apply(this,arguments)};
  const r0=R.render;R.render=function(sc,cam){const r=r0.apply(this,arguments);if(sc===S&&cam===C&&!done){done=true;R.renderBufferDirect=rb;R.render=r0;res(cnt)}return r}});
 const take=async ms=>{ft=[];lastT=0;lagTake();await sleep(ms);const a=lagTake();a.n=ft.length;a.p50=pct(ft,.5);a.p95=pct(ft,.95);a.worstRaf=ft.length?Math.max(...ft):0;return a};
 const line=a=>!a.n?'no frames measured (was the tab hidden or the game paused?)':f0(a.fps)+' FPS · frame '+f1(a.frame)+' ms (typical '+f1(a.p50)+', 95% under '+f1(a.p95)+', worst '+f0(a.worstRaf)+') · processor '+f1(a.cpu)+' ms (positions '+f1(a.pos)+', drawing '+f1(Math.max(0,a.rend-a.pos))+') · waiting '+f1(Math.max(0,a.frame-a.cpu))+' ms · '+f0(a.calls)+' draw calls · '+f0(a.tris/1000)+'k tris';
 const sc=lagScene();const out=[];
 out.push('DOORS desert benchmark · '+(typeof BUILD!='undefined'?BUILD:'?')+' · '+navigator.userAgent);
 out.push('Screen '+sc.res+' x'+sc.pr+' · render scale '+(sc.qs!=null?sc.qs+'%':'?')+(sc.gq!=null?' ('+sc.gq+')':'')+' · window '+innerWidth+'x'+innerHeight+(typeof MP!='undefined'&&MP.on?' · co-op players '+(Object.keys(MP.peers||{}).length+1):' · single player'));
 out.push('Mode: STANDING STILL at fixed views (benchmark), traffic and patrols still moving. Started from '+Math.round(home.x)+', '+Math.round(home.z-q.OZ));
 for(const[id,nm,x,z,yaw]of VIEWS){
  hint&&hint('📏 Benchmark: view '+id+' ('+nm+'). Please don\'t touch anything.');
  pin={x,z,yaw};P.dy=0;await sleep(10000);
  const vp0=new Map((q.vehs||[]).map(v=>[v,[v.x,v.z,v.h]]));const sp0=LAG.spikes.length;
  const base=await take(4000);
  window.__benchMoving=(q.vehs||[]).filter(v=>{const a=vp0.get(v);return a&&(Math.abs(v.x-a[0])+Math.abs(v.z-a[1])>.05||Math.abs((v.h||0)-a[2])>.01)});
  const cats=await byCat();
  const hides=[];for(const[k,hn]of LAGHIDE){LAG.hide={[k]:1};await sleep(600);lagTake();const r=await take(2400);hides.push([hn,r]);LAG.hide={}}
  await sleep(600);const base2=await take(3000);
  const bf=(base.frame+base2.frame)/2,noise=Math.max(1,Math.abs(base.frame-base2.frame)),bc=(base.calls+base2.calls)/2,bcpu=(base.cpu+base2.cpu)/2;
  out.push('');out.push('VIEW '+id+': '+nm+' (desert '+x+', '+z+')');
  out.push('  '+line(base));out.push('  again: '+line(base2)+' (the two differ by '+f1(noise)+' ms)');
  const tot=Object.values(cats).reduce((a,b)=>a+b,0);
  out.push('  Draw calls by category ('+tot+' in one frame): '+Object.entries(cats).sort((a,b)=>b[1]-a[1]).map(([k,v])=>k+' '+v).join(', '));
  out.push('  Vehicles moving during the test: '+window.__benchMoving.length+' of '+(q.vehs||[]).length);
  for(const[hn,r]of hides){if(!r.n){out.push('  Hide '+hn.toLowerCase()+': no frames measured');continue}const sv=bf-r.frame,real=Math.abs(sv)>noise;out.push('  Hide '+hn.toLowerCase()+': frame '+f1(r.frame)+' ms ('+(real?(sv>=0?'saves ':'costs ')+f1(Math.abs(sv))+' ms':'no clear change')+'), processor '+f1(r.cpu)+' ms ('+(bcpu-r.cpu>=0?'-':'+')+f1(Math.abs(bcpu-r.cpu))+'), drawing '+f1(Math.max(0,r.rend-r.pos))+' ms, '+f0(r.calls)+' draw calls ('+(bc-r.calls>=0?'-':'+')+f0(Math.abs(bc-r.calls))+')')}
  const parts=Object.entries(base.sys||{}).filter(([n,v])=>v>=.3).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([n,v])=>n+' '+f1(v));out.push('  Game code parts: '+(parts.join(', ')||'none over 0.3 ms'));
  const spk=LAG.spikes.slice(sp0);out.push('  Long frames during this view: '+(spk.length?'\n    '+spk.map(lagSpikeTxt).join('\n    '):'none'));
 }
 pin=null;LAG.hide={};window.__benchOn=0;P.x=home.x;P.z=home.z;P.yaw=home.yaw;P.pitch=home.pitch;
 const txt=out.join('\n');
 const d=document.createElement('div');d.style.cssText='position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(900px,92vw);z-index:100000;background:#111e;color:#eee;padding:12px;border:1px solid #666;border-radius:8px;font:13px DoorsSans,Arial,sans-serif';
 d.innerHTML='<b>Benchmark done</b> (you are back where you started)<br><textarea style="width:100%;height:50vh;font:12px monospace;background:#000;color:#ddd" readonly></textarea><br><button id="bcp">Copy</button> <button id="bcl">Close</button>';
 document.body.appendChild(d);const ta=d.querySelector('textarea');ta.value=txt;
 d.querySelector('#bcp').onclick=()=>{ta.select();try{navigator.clipboard.writeText(txt).then(()=>hint&&hint('📋 Benchmark copied. Paste it to Claude.'),()=>document.execCommand('copy'))}catch(e){document.execCommand('copy')}};
 d.querySelector('#bcl').onclick=()=>d.remove();
 window.__benchTxt=txt;
})();
