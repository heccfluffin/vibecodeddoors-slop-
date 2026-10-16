const {chromium}=require('playwright');const fs=require('fs');const FILE=process.argv[2]||require('path').resolve(__dirname,'../out/DOORS.html');const SPOT=process.argv[3]||'base';
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader']});const ctx=await b.newContext({viewport:{width:480,height:300}});const pg=await ctx.newPage();
 const T3=fs.readFileSync(__dirname+'/three/three.min.js','utf8');await pg.route(/three\.min\.js/,r=>r.fulfill({contentType:'text/javascript',body:T3}));await pg.route(/^https?:\/\/(?!localhost).*/,r=>{if(/three\.min/.test(r.request().url()))return r.fallback();r.abort()});
 await pg.goto('file://'+FILE);await pg.waitForTimeout(2000);
 await pg.evaluate(()=>{busBoard(true,0,[],4242,()=>{window.__done=1;BUS.ride.t=40})});for(let i=0;i<120;i++){await pg.waitForTimeout(500);if(await pg.evaluate('!!window.__done'))break}await pg.waitForTimeout(1500);
 const pos={base:[486,-850],busstop:[0,-1043],quarry:[-205,-1430]}[SPOT];
 await pg.evaluate(([x,z])=>{const q=BUS.ride;q.inBus=null;q.seat=null;q.roam=1;document.getElementById('m').style.display='none';P.x=x;P.z=z+q.OZ},pos);await pg.waitForTimeout(3000);
 const cdp=await ctx.newCDPSession(pg);await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:200});await cdp.send('Profiler.start');await pg.waitForTimeout(8000);const {profile}=await cdp.send('Profiler.stop');
 const self={},byId={};for(const n of profile.nodes)byId[n.id]=n;const dt={};for(let i=0;i<profile.samples.length;i++){dt[profile.samples[i]]=(dt[profile.samples[i]]||0)+(profile.timeDeltas[i]||0)}
 /* self time per function, and total (inclusive) via parents */const par={};for(const n of profile.nodes)for(const c of n.children||[])par[c]=n.id;const tot={};
 for(const id in dt){const n=byId[id],k=n.callFrame.functionName+'@'+n.callFrame.lineNumber;self[k]=(self[k]||0)+dt[id];let p=+id;const seen=new Set();while(p){const m=byId[p],kk=m.callFrame.functionName+'@'+m.callFrame.lineNumber;if(!seen.has(kk)){tot[kk]=(tot[kk]||0)+dt[id];seen.add(kk)}p=par[p]}}
 const all=Object.values(dt).reduce((a,b)=>a+b,0);const top=o=>Object.entries(o).sort((a,b)=>b[1]-a[1]).slice(0,28).map(([k,v])=>(v/all*100).toFixed(1).padStart(5)+'% '+k).join('\n');
 console.log('SELF\n'+top(self));console.log('TOTAL\n'+top(tot));await b.close()})();
