/* =====================================================================================================
   r649: THE LAG WINDOW (F9) SAYS WHAT LIMITS YOUR FRAME RATE. Nothing in the game changes; this only adds to the
   lag test window (dx622), and only does anything while the window is open.
     - Graphics card time: where the browser allows it (most desktop Chrome does, Firefox usually does not), the
       graphics card's own time for each frame is measured with a timer query, so "processor or graphics card?" is
       answered directly instead of guessed.
     - "Find the lag" also tries the frame at HALF RESOLUTION (do the pixels matter?) and with NOTHING IN THE DESERT
       DRAWN (what does drawing cost in all?), measures everything twice to show the wobble, and ends with a plain
       verdict: what limits the frame rate here and the biggest parts in order. The resolution goes back afterwards
       (the automatic resolution governor waits while it runs).
     - Draw calls by kind (vehicles standing or moving, scenery, small details, later areas batched or single
       pieces, glows...), live in the window and in the copied report.
     - Whether you were standing still or moving while it measured.
     - "Benchmark": three fixed views (Fort Blackout facing east, the same spot facing north, the Desert PD HQ),
       10 s to settle and the full test at each, so reports from different PCs can be compared. It holds you still
       while it runs and puts you back where you were.
   ===================================================================================================== */
const LAGV={ext:null,gl:null,qs:[],gpu:0,gpuN:0,inQ:0,cats:null,catT:0,vpos:new Map(),p0:null,title:'',half:0,aq:null,pend:0,bench:0};
/* ---------- the graphics card's own time (EXT_disjoint_timer_query_webgl2) ---------- */
try{if(R.capabilities&&R.capabilities.isWebGL2){const gl=R.getContext(),e=gl.getExtension('EXT_disjoint_timer_query_webgl2');if(e){LAGV.ext=e;LAGV.gl=gl}}}catch(e){}
function lagGpuPoll(){const gl=LAGV.gl,e=LAGV.ext;if(!e)return;const Q=LAGV.qs;
 while(Q.length){const q=Q[0];if(!gl.getQueryParameter(q,gl.QUERY_RESULT_AVAILABLE))break;Q.shift();const dis=gl.getParameter(e.GPU_DISJOINT_EXT),ns=gl.getQueryParameter(q,gl.QUERY_RESULT);gl.deleteQuery(q);if(!dis){LAGV.gpu+=ns/1e6;LAGV.gpuN++}}}
/* ---------- draw calls by kind, one frame every 2 s ---------- */
function lagCats(q){const veh=new Map();for(const v of q.vehs||[])if(v&&v.m)veh.set(v.m,v);const moving=new Set();
 for(const v of q.vehs||[]){if(!v)continue;const a=LAGV.vpos.get(v);if(a&&(Math.abs(v.x-a[0])+Math.abs(v.z-a[1])>.05||Math.abs((v.h||0)-a[2])>.01))moving.add(v);LAGV.vpos.set(v,[v.x,v.z,v.h||0])}
 const cnt={};const cat=o=>{let p=o;while(p&&p.parent&&p.parent!==q.g)p=p.parent;if(!p||p.parent!==q.g)return'sky, sun and other';
  if(p.userData.chunk){for(let x=o;x&&x!==p;x=x.parent)if(x===p.userData.smg)return'scenery small details';return'scenery chunks'}
  if(veh.has(p))return moving.has(veh.get(p))?'vehicles moving':'vehicles standing';
  if(o.isSprite||o.isPoints)return'glows and sprites';
  return o.userData.dpMerged?'later areas batched':(o.userData.dpDyn?'later areas moving pieces':'later areas single pieces')};
 return{cnt,cat}}
function lagCatTxt(c){if(!c)return'';const e=Object.entries(c).sort((a,b)=>b[1]-a[1]);return e.map(([k,v])=>k+' '+v).join(', ')}
/* the outermost render wrapper: graphics card timing and the draw-call count by kind (only while the window is open) */
{const r0=R.render;R.render=function(sc,cam){if(!LAG.open||sc!==S||cam!==C||LAGV.inQ)return r0.apply(this,arguments);
  const q=BUS&&BUS.ride,now=performance.now();let rb=null,C2=null;
  if(q&&q.roam&&q.g&&now-LAGV.catT>2000){LAGV.catT=now;try{C2=lagCats(q);rb=R.renderBufferDirect;R.renderBufferDirect=function(c,s,g,m,obj){if(s===S&&c===C){const k=C2.cat(obj);C2.cnt[k]=(C2.cnt[k]||0)+1}return rb.apply(this,arguments)}}catch(e){rb=null}}
  const gl=LAGV.gl,e=LAGV.ext;let qq=null;if(e){try{lagGpuPoll();if(LAGV.qs.length<8){qq=gl.createQuery();gl.beginQuery(e.TIME_ELAPSED_EXT,qq);LAGV.inQ=1}}catch(x){qq=null;LAGV.inQ=0}}
  try{return r0.apply(this,arguments)}finally{if(qq){try{gl.endQuery(e.TIME_ELAPSED_EXT);LAGV.qs.push(qq)}catch(x){}LAGV.inQ=0}if(rb){R.renderBufferDirect=rb;LAGV.cats=C2.cnt}}}}
/* lagTake also gives the typical and 95% frame, the graphics card time, and how far you moved */
{const t0=lagTake;lagTake=function(){const n=LAG.frames,fr=LAG.fr.slice(-Math.max(1,n));const o=t0.apply(this,arguments);o.n=n;const s=fr.slice().sort((a,b)=>a-b);
 o.p50=s.length?s[s.length>>1]:0;o.p95=s.length?s[Math.min(s.length-1,Math.floor(s.length*.95))]:0;
 try{lagGpuPoll()}catch(e){}o.gpu=LAGV.gpuN?LAGV.gpu/LAGV.gpuN:null;LAGV.gpu=0;LAGV.gpuN=0;
 const pn=[P.x,P.z,P.yaw];if(LAGV.p0){o.moved=Math.hypot(pn[0]-LAGV.p0[0],pn[1]-LAGV.p0[1]);o.turned=Math.abs(pn[2]-LAGV.p0[2])}LAGV.p0=pn;return o}}
/* a hide switch for the whole desert (also a button in the window) */
LAGHIDE.push(['all','Everything in the desert']);
{const ls=lagSet;lagSet=function(k){if(k==='all'){const q=BUS&&BUS.ride;return q&&q.g&&q.roam?[q.g]:[]}return ls.apply(this,arguments)}}
/* half resolution for a test step; the automatic resolution governor waits meanwhile */
function lagHalf(on){if(on&&!LAGV.half){LAGV.half=1;LAGV.aq=applyQS;LAGV.pend=0;applyQS=function(){LAGV.pend=1};R.setSize(Math.max(2,innerWidth*QS*.5|0),Math.max(2,innerHeight*QS*.5|0),false)}
 else if(!on&&LAGV.half){LAGV.half=0;applyQS=LAGV.aq;applyQS()}}
/* ---------- the test steps ---------- */
const lagSleep=ms=>new Promise(r=>setTimeout(r,ms/(LAGV.fast||1)));/* (LAGV.fast: only the headless test speeds it up) */
async function lagRun(){const L=[['base','Nothing changed'],['half','Half resolution (a quarter of the pixels)'],['h:all','Nothing in the desert drawn']]
  .concat(LAGHIDE.filter(([k])=>k!=='all').map(([k,nm])=>['h:'+k,'Hide '+nm.toLowerCase()]),[['mwx','Position skip off'],['base2','Nothing changed (again)']]);
 const A={L,i:0,out:[]};LAG.auto=A;LAG.hide={};LAG.mwxOff=0;const alive=()=>LAG.open&&LAG.auto===A;
 try{for(const st of L){if(!alive())return null;A.i++;const id=st[0];
   if(id=='half')lagHalf(true);else if(id.startsWith('h:'))LAG.hide[id.slice(2)]=1;else if(id=='mwx')LAG.mwxOff=1;
   await lagSleep(600);if(!alive())return null;if(id=='base')LAGV.catT=0;lagTake();await lagSleep(id.startsWith('base')?3000:2400);if(!alive())return null;
   const r=lagTake();if(id=='base')A.cats=LAGV.cats;A.out.push([st,r]);
   lagHalf(false);LAG.hide={};LAG.mwxOff=0}
  return A}
 finally{lagHalf(false);LAG.hide={};LAG.mwxOff=0;if(LAG.auto===A)LAG.auto=null}}
/* ---------- the verdict ---------- */
function lagLimit(A){const g=id=>{const x=A.out.find(([s])=>s[0]===id);return x&&x[1]&&x[1].n?x[1]:null};const b0=g('base'),b1=g('base2');
 if(!b0||!b1)return'Not enough frames were measured (was the game paused or the tab hidden?).';
 const av=k=>((b0[k]||0)+(b1[k]||0))/2,F=lagF;const frame=av('frame'),cpu=av('cpu'),pos=av('pos'),rend=av('rend'),draw=Math.max(0,rend-pos),code=Math.max(0,cpu-rend),wait=Math.max(0,frame-cpu),noise=Math.max(1,Math.abs(b0.frame-b1.frame)),calls=av('calls');
 const gpu=b0.gpu!=null&&b1.gpu!=null?(b0.gpu+b1.gpu)/2:(b0.gpu!=null?b0.gpu:b1.gpu);
 const still=(b0.moved||0)<.3&&(b1.moved||0)<.3&&(b0.turned||0)<.05&&(b1.turned||0)<.05;
 const L=[];L.push((still?'Standing still':'MOVING ('+F((b0.moved||0)+(b1.moved||0),0)+' m, so the views differed)')+' · '+F(1000/frame,0)+' FPS · frame '+F(frame)+' ms (typical '+F((b0.p50+b1.p50)/2)+', 95% under '+F((b0.p95+b1.p95)/2)+') · the two "nothing changed" runs differ by '+F(noise)+' ms');
 L.push('Processor busy '+F(cpu)+' ms a frame (positions '+F(pos)+', drawing '+F(draw)+', game code '+F(code)+') · graphics card '+(gpu!=null?'busy '+F(gpu)+' ms a frame (measured)':'time cannot be measured in this browser')+' · waiting '+F(wait)+' ms · '+F(calls,0)+' draw calls');
 const half=g('half'),none=g('h:all'),mwx=g('mwx');const sv=r=>r?frame-r.frame:0,real=r=>r&&Math.abs(sv(r))>noise,chg=r=>!r?'could not be measured':!real(r)?'makes no clear difference':sv(r)>0?'saves '+F(sv(r))+' ms':'is '+F(-sv(r))+' ms slower (wobble)';
 if(noise>frame*.15)L.push('⚠ The two "nothing changed" runs differ a lot, so only big changes below mean anything. Stand still and close other programs, then try again.');
 /* which one limits it */
 let cap=0;for(const hz of[60,75,90,100,120,144,165,170,180,200,240])if(Math.abs(frame-1000/hz)<1000/hz*.04)cap=hz;
 let lim;if(cap&&cpu<frame*.75&&(gpu==null||gpu<frame*.75))lim='cap';else if(gpu!=null)lim=gpu>cpu?(real(half)&&sv(half)>frame*.15?'gpuPix':'gpu'):'cpu';else if(real(half)&&sv(half)>frame*.2)lim='gpuPix';else if(wait>cpu)lim='wait';else lim='cpu';
 if(lim=='cap')L.push('➜ NOTHING is holding it back: the game runs at your screen\'s refresh rate ('+cap+' Hz).');
 else if(lim=='cpu'){L.push('➜ What limits your frame rate here: the PROCESSOR (CPU). It is busy '+F(cpu)+' of every '+F(frame)+' ms'+(gpu!=null?', the graphics card only '+F(gpu):'')+'. The parts, biggest first:');
  const top=Object.entries(b0.sys||{}).filter(([n])=>n!=='busRideUpd'&&b0.sys[n]>=.5).sort((a,b)=>b[1]-a[1]).slice(0,4).map(([n,v])=>{const s=LAGSYS.find(x=>x[0]===n);return(s?s[1]:n)+' '+F(v)}).join(', ');
  const P2=[[draw,'Drawing (sending '+F(calls,0)+' draw calls to the graphics card)'+(A.cats?': '+lagCatTxt(A.cats):'')],[pos,'Working out positions'],[code,'Game code'+(top?' ('+top+')':'')]].sort((a,b)=>b[0]-a[0]);
  P2.forEach(([v,t],i)=>L.push('   '+(i+1)+'. '+F(v)+' ms · '+t))}
 else if(lim=='gpuPix')L.push('➜ What limits your frame rate here: the GRAPHICS CARD filling PIXELS. At half resolution the frame took '+F(half.frame)+' ms instead of '+F(frame)+'. A lower render scale (/gfx auto, or a smaller window) helps the most.');
 else if(lim=='gpu')L.push('➜ What limits your frame rate here: the GRAPHICS CARD (busy '+F(gpu)+' ms a frame, the processor '+F(cpu)+'). Half resolution '+chg(half)+', so it is the amount drawn (shapes and draw calls), not the pixels.');
 else L.push('➜ What limits your frame rate here: WAITING for the graphics card or the browser: the processor is busy only '+F(cpu)+' of '+F(frame)+' ms. Half resolution '+chg(half)+'. (This browser cannot time the graphics card directly; Chrome usually can.)');
 /* what each test changed */
 const ln=(nm,r)=>{if(!r)return'   '+nm+': no frames measured';const s=sv(r);return'   '+nm+': '+(Math.abs(s)>noise?(s>=0?'saves ':'costs ')+F(Math.abs(s))+' ms':'no clear change')+' (frame '+F(r.frame)+', processor '+F(r.cpu)+(r.gpu!=null?', graphics card '+F(r.gpu):'')+', '+F(r.calls,0)+' draw calls)'};
 L.push('What each test changed:');for(const[st,r]of A.out)if(!st[0].startsWith('base'))L.push(ln(st[1],r&&r.n?r:null));
 if(none&&real(none)&&sv(none)>0)L.push('   (Drawing the desert costs about '+F(sv(none))+' ms of each frame in all; the other '+F(frame-sv(none))+' ms is game code and the browser.)');
 return L.join('\n')}
/* ---------- "Find the lag", now with the verdict ---------- */
lagAuto=function(){if(LAG.auto||LAGV.bench)return;if(!(BUS&&BUS.ride&&BUS.ride.roam))return hint('🐢 "Find the lag" works out in the desert.');LAG.res='';LAGV.title='';
 (async()=>{const A=await lagRun();if(!A)return;LAGV.title='Find the lag:';LAG.res=lagLimit(A);lagDraw()})()};
/* ---------- the benchmark: three fixed views ---------- */
const LAGVIEWS=[['A','Fort Blackout, facing east',210,-918,-Math.PI/2],['B','same spot, facing north',210,-918,0],['C','beside the Desert PD HQ, facing it (west)',129,-1028,Math.PI/2]];
async function lagBench(){const q=BUS&&BUS.ride;if(LAG.auto||LAGV.bench)return;
 if(!q||!q.roam||q.inBus)return hint('📏 The benchmark works out in the desert, on foot.');if(q.seat||q.deep||q.xr)return hint('📏 Get out of the vehicle (or come up from underground) first.');
 LAGV.bench=1;const home={x:P.x,z:P.z,yaw:P.yaw,pitch:P.pitch};let pin=null;const hold=()=>{if(!LAGV.bench)return;if(pin){P.x=pin.x;P.z=pin.z+q.OZ;P.yaw=pin.yaw;P.pitch=0}requestAnimationFrame(hold)};requestAnimationFrame(hold);
 const sc=lagScene(),out=[];LAGV.title='Benchmark:';
 out.push('Screen '+sc.res+' x'+sc.pr+' · render scale '+sc.qs+'% ('+sc.gq+') · window '+innerWidth+'x'+innerHeight+' · '+(typeof MP!='undefined'&&MP.on?'co-op, '+(Object.keys(MP.peers||{}).length+1)+' players':'single player')+' · graphics card timing '+(LAGV.ext?'available':'not available in this browser'));
 out.push('Standing still at fixed views (traffic and patrols keep moving). Started from '+Math.round(home.x)+', '+Math.round(home.z-q.OZ)+'.');LAG.res=out.join('\n')+'\n(running...)';
 try{for(const[id,nm,x,z,yaw]of LAGVIEWS){if(!LAG.open)break;hint('📏 Benchmark view '+id+': '+nm+'. Please don\'t touch anything.');pin={x,z,yaw};P.dy=0;
   for(let t=0;t<10&&LAG.open;t++)await lagSleep(1000);if(!LAG.open)break;LAGV.vpos=new Map();const sp0=LAG.spikes.length;
   const A=await lagRun();if(!A)break;const spk=LAG.spikes.slice(sp0);
   out.push('','VIEW '+id+': '+nm+' (desert '+x+', '+z+')',lagLimit(A),'Long frames during this view: '+(spk.length?'\n   '+spk.map(lagSpikeTxt).join('\n   '):'none'));LAG.res=out.join('\n')+'\n(running...)';lagDraw()}}
 finally{pin=null;LAGV.bench=0;P.x=home.x;P.z=home.z;P.yaw=home.yaw;P.pitch=home.pitch}
 LAG.res=out.join('\n')+(out.length<5?'\n(stopped before the end)':'');lagDraw();hint('📏 Benchmark done. Press "Copy report" and paste it to Claude.')}
/* ---------- the window: a Benchmark button, graphics card time, draw calls by kind, moving or not ---------- */
{const d0=lagDraw;lagDraw=function(a){d0.apply(this,arguments);try{const d=document.getElementById('lagDlg');if(!d)return;
  const ab=d.querySelector('button[data-l="auto"]');if(ab){if(!LAG.auto)ab.textContent='▶ Find the lag (30 s)';if(!d.querySelector('button[data-l="bench"]')){const b=ab.cloneNode(true);b.dataset.l='bench';b.textContent=LAGV.bench?'Benchmark running...':'📏 Benchmark (2 min)';b.style.background=LAGV.bench?'#c33':'#333';ab.after(b)}}
  const A=LAG.acc||{},tb=d.querySelector('table');if(tb){const x=document.createElement('div');x.style.cssText='margin-top:4px;color:#9cf';
   x.textContent='Graphics card: '+(A.gpu!=null?lagF(A.gpu)+' ms a frame (measured)':LAGV.ext?'measuring...':'time cannot be measured in this browser')+(A.moved!=null?' · '+(A.moved<.3&&(A.turned||0)<.05?'standing still':'moving'):'');tb.after(x);
   if(LAGV.cats){const y=document.createElement('div');y.style.cssText='margin-top:2px;font-size:12px;opacity:.85';y.textContent='Draw calls by kind: '+lagCatTxt(LAGV.cats);x.after(y)}}}catch(e){}}}
{const c0=lagClick;lagClick=function(e){const b=e.target.closest&&e.target.closest('button[data-l]');if(b&&b.dataset.l==='bench'){lagBench();return lagDraw()}return c0.apply(this,arguments)}}
{const p0=lagReport;lagReport=function(){let t=p0.apply(this,arguments);const A=LAG.acc||{};
 t=t.replace('\nSwitches:','\nGraphics card: '+(A.gpu!=null?lagF(A.gpu)+' ms a frame (measured)':'not measurable in this browser')+' · '+(A.moved!=null?(A.moved<.3&&(A.turned||0)<.05?'standing still':'moving'):'')+(LAGV.cats?'\nDraw calls by kind: '+lagCatTxt(LAGV.cats):'')+'\nSwitches:');
 if(LAGV.title&&LAGV.title!=='Find the lag:')t=t.replace('\nFind the lag:\n','\n'+LAGV.title+'\n');return t}}
