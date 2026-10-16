const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader']});const pg=await (await b.newContext({viewport:{width:900,height:600}})).newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 const T3=fs.readFileSync(__dirname+'/three/three.min.js','utf8');await pg.route(/three\.min\.js/,r=>r.fulfill({contentType:'text/javascript',body:T3}));await pg.route(/^https?:\/\/(?!localhost).*/,r=>{if(/three\.min/.test(r.request().url()))return r.fallback();r.abort()});
 await pg.goto('file://'+require('path').resolve(__dirname,'../out/DOORS.html'));await pg.waitForTimeout(3000);
 console.log(await pg.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/CHANGELOG/.test(x.textContent));return b?('found badge='+!!b.querySelector('.chl-badge')):'none'}));
 await pg.screenshot({path:'../out/chl0.png'});
 await pg.evaluate(()=>{[...document.querySelectorAll('button')].find(x=>/CHANGELOG/.test(x.textContent)).click()});await pg.waitForTimeout(500);await pg.screenshot({path:'../out/chl1.png'});
 console.log(await pg.evaluate(()=>!!document.getElementById('chlDlg')+' badge after='+document.querySelectorAll('.chl-badge').length));
 console.log('errs',errs.slice(0,4));await b.close()})();
