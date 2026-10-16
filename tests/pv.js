const {chromium}=require('playwright');const fs=require('fs');const FILE=process.argv[2];const TAG=process.argv[3];
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader']});const pg=await (await b.newContext({viewport:{width:640,height:400}})).newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 const T3=fs.readFileSync(__dirname+'/three/three.min.js','utf8');await pg.route(/three\.min\.js/,r=>r.fulfill({contentType:'text/javascript',body:T3}));await pg.route(/^https?:\/\/(?!localhost).*/,r=>{if(/three\.min/.test(r.request().url()))return r.fallback();r.abort()});
 await pg.goto('file://'+FILE);await pg.waitForTimeout(2000);
 await pg.evaluate(()=>{busBoard(true,0,[],4242,()=>{window.__done=1;BUS.ride.t=40})});for(let i=0;i<120;i++){await pg.waitForTimeout(500);if(await pg.evaluate('!!window.__done'))break}await pg.waitForTimeout(1500);
 await pg.evaluate(()=>{const q=BUS.ride;q.inBus=null;q.seat=null;q.roam=1;document.getElementById('m').style.display='none';P.x=0;P.z=-1043+q.OZ;P.yaw=0;P.pitch=0});await pg.waitForTimeout(3000);
 if(!/noperf/.test(FILE))await pg.evaluate(()=>perfForce());
 for(const[nm,x,z,yaw]of[['stop',0,-1043,0],['town',8,-1180,Math.PI],['base',470,-866,Math.PI*0.75]]){await pg.evaluate(([x,z,yaw])=>{const q=BUS.ride;P.x=x;P.z=z+q.OZ;P.yaw=yaw;P.pitch=-.05},[x,z,yaw]);await pg.waitForTimeout(2500);if(!/noperf/.test(FILE))await pg.evaluate(()=>{for(let i=0;i<120;i++)perfCull(BUS.ride)});await pg.waitForTimeout(1500);await pg.screenshot({path:'../out/out/pv_'+TAG+'_'+nm+'.png'})}
 console.log(TAG,errs.slice(0,3));await b.close()})();
