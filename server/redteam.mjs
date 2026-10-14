import { start } from './harness.mjs';import { createRequire } from 'module';const require=createRequire(import.meta.url);const WS=require('/opt/npm-tools/node_modules/ws');
const TE=s=>new TextEncoder().encode(s);const b64u=a=>Buffer.from(a).toString('base64url');
const canon=o=>o===null||typeof o!='object'?JSON.stringify(o):Array.isArray(o)?'['+o.map(canon).join(',')+']':'{'+Object.keys(o).sort().map(k=>JSON.stringify(k)+':'+canon(o[k])).join(',')+'}';
const B32='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';async function uidOf(x,y){const h=new Uint8Array(await crypto.subtle.digest('SHA-256',TE('doorsid:'+x+'.'+y)));let o='',v=0,bits=0;for(const b of h){v=((v<<8)|b)&0xffff;bits+=8;while(bits>=5&&o.length<8){o+=B32[(v>>(bits-5))&31];bits-=5}if(o.length>=8)break}return 'U-'+o.slice(0,4)+'-'+o.slice(4,8)}
async function dev(){const kp=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);const j=await crypto.subtle.exportKey('jwk',kp.publicKey);return{x:j.x,y:j.y,uid:await uidOf(j.x,j.y),sign:async s=>b64u(new Uint8Array(await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},kp.privateKey,TE(s))))}}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let fails=0;const ok=(c,m)=>{process.stdout.write((c?'BLOCKED ':'VULN!!! ')+m+'\n');if(!c)fails++};
const wd=setTimeout(()=>{console.log('WATCHDOG: hung');process.exit(2)},90000);wd.unref&&wd.unref();
async function board(d,ip,extra){const ws=new WS('ws://localhost:8797/ws?ip='+ip);const inbox=[];let closed=null;ws.on('message',m=>{const o=JSON.parse(String(m));inbox.push(o);if(o.o=='nonce'&&d)(async()=>ws.send(JSON.stringify(Object.assign({o:'hi',x:d.x,y:d.y,s:await d.sign('doorssrv|'+o.n),p:'pid-'+d.uid,nm:'T'},extra||{}))))();if(o.o=='nonce'&&!d)ws.send(JSON.stringify({o:'hi'}))});ws.on('close',c=>closed=c);await new Promise((r,x)=>{ws.on('open',r);ws.on('error',x)}).catch(()=>{});await sleep(120);return{ws,inbox,get closed(){return closed}}}
const owner=await dev();globalThis.__DOORS_TEST_OWNER={x:owner.x,y:owner.y};
const S=await start(8797);const A=await dev();const a=await board(A,'9.9.9.1');
console.log('--- attacks a griefer could try, all against a local copy ---');

/* 1. forge a ban on another player without the owner key */
const victim=await dev();const vb=await board(victim,'9.9.9.2');
const fake={v:Date.now(),own:[],adm:{},exa:{},ban:{[victim.uid]:{n:'',at:Date.now(),why:'x'}},unb:{},earn:0,sig:'AAAA'};
a.ws.send(JSON.stringify({o:'pub',t:'doorsfan-q7k2/v1/reg/core',m:JSON.stringify(fake),r:1}));await sleep(200);
ok(vb.closed==null,'forge a ban with no owner key');
/* 1b. forge an admin-signed ban signed by the wrong key */
const adminBody=t=>'doorsadm|'+canon(t);const ab={t:'ban',u:victim.uid,by:A.uid,at:Date.now(),why:'x',n:''};const absig=await A.sign(adminBody(ab));/* A is not an admin */
a.ws.send(JSON.stringify({o:'pub',t:'doorsfan-q7k2/v1/reg/a/'+victim.uid,m:JSON.stringify(Object.assign({},ab,{x:A.x,y:A.y,sig:absig})),r:1}));await sleep(150);ok(vb.closed==null,'ban a player by signing as a non-admin');

/* 2. kick someone without being staff */
const k={u:victim.uid,by:A.uid,at:Date.now(),why:''};a.ws.send(JSON.stringify(Object.assign({o:'kick',x:A.x,y:A.y,s:await A.sign('doorskick|'+canon(k))},k)));await sleep(150);ok(vb.closed==null&&a.inbox.some(o=>o.o=='kickr'&&!o.ok),'kick another player without being staff');

/* 3. use the server as a free relay for an unrelated app (topic outside the game) */
a.ws.send(JSON.stringify({o:'sub',t:'myapp/chat'}));await sleep(50);const b2=await board(A,'9.9.9.1');b2.ws.send(JSON.stringify({o:'pub',t:'myapp/chat',m:'free backend!'}));await sleep(150);ok(!a.inbox.some(o=>o.o=='msg'&&o.t=='myapp/chat'),'use the board as a free relay for another app');
a.ws.send(JSON.stringify({o:'sub',t:'#'}));await sleep(50);ok(!a.inbox.some(o=>o.o=='msg'&&o.t=='myapp/chat'),'subscribe to # to read everything cross-namespace');

/* 4. fill the server's storage with retained notes (cost / DoS) */
const big='x'.repeat(60000);const fl=await board(await dev(),'9.9.9.3');for(let i=0;i<300;i++){fl.ws.send(JSON.stringify({o:'pub',t:'doorsfan-q7k2/v1/junk/'+i,m:big,r:1}));if(i%40==0)await sleep(60)}await sleep(1200);
ok(S.hub.retBytes<=8*1024*1024&&S.hub.ret.size<=20000,'flood retained notes to fill storage (held at '+(S.hub.retBytes/1048576).toFixed(1)+' MB / '+S.hub.ret.size+' notes)');
/* and the registry note must survive eviction */
const reg={v:Date.now(),own:[owner.uid],adm:{},exa:{},ban:{},unb:{},earn:0};reg.sig=await owner.sign('doorsreg|'+canon({v:reg.v,own:reg.own,adm:reg.adm,exa:reg.exa,ban:reg.ban,unb:reg.unb,earn:0}));
a.ws.send(JSON.stringify({o:'pub',t:'doorsfan-q7k2/v1/reg/core',m:JSON.stringify(reg),r:1}));await sleep(150);
for(let i=400;i<480;i++){fl.ws.send(JSON.stringify({o:'pub',t:'doorsfan-q7k2/v1/junk/'+i,m:big,r:1}));if(i%40==0)await sleep(60)}await sleep(800);
ok(S.hub.ret.has('doorsfan-q7k2/v1/reg/core'),'the ban registry is never evicted by a junk flood');

/* 5. flood the device->IP memory with endless fresh keys */
const before=Object.keys(S.hub.ips).length;const conns=[];for(let i=0;i<60;i++){const d=await dev();const c=new WS('ws://localhost:8797/ws?ip=9.9.5.'+(i%20));c.on('message',async m=>{const o=JSON.parse(String(m));if(o.o=='nonce')c.send(JSON.stringify({o:'hi',x:d.x,y:d.y,s:await d.sign('doorssrv|'+o.n),p:'p',nm:'x'}))});conns.push(c)}await sleep(1500);ok(Object.keys(S.hub.ips).length<=4000,'flood the IP memory (held at '+Object.keys(S.hub.ips).length+' entries)');for(const c of conns)try{c.close()}catch(e){}

/* 6. open a huge number of sockets from one connection to burn the request quota */
const many=[];for(let i=0;i<20;i++){const c=new WS('ws://localhost:8797/ws?ip=9.9.6.6');let dead=0;c.on('close',()=>{dead=1});c.on('error',()=>{dead=1});c._dead=()=>dead;many.push(c);await sleep(40)}await sleep(400);
const open=many.filter(c=>c.readyState===1).length;ok(open<=10&&open<20,'open 20 sockets from one connection (only '+open+' stayed open)');for(const c of many)try{c.close()}catch(e){}

/* 7. oversized single message */
const huge='z'.repeat(70000);a.ws.send(JSON.stringify({o:'pub',t:'doorsfan-q7k2/v1/x/y',m:huge}));await sleep(100);ok(!S.hub.ret.has('doorsfan-q7k2/v1/x/y')&&a.closed==null,'send an oversized message');

/* 8. impersonate another device ID in the hello (claim a uid you do not own) */
const imp=await board(null,'9.9.9.7');/* no key */const bad=await dev();const impws=new WS('ws://localhost:8797/ws?ip=9.9.9.8');let impu=null;impws.on('message',async m=>{const o=JSON.parse(String(m));if(o.o=='nonce')impws.send(JSON.stringify({o:'hi',x:victim.x,y:victim.y,s:await bad.sign('doorssrv|'+o.n),p:'p',nm:'x'}));if(o.o=='ok')impu=o.u});await sleep(300);ok(impu!==victim.uid,'claim another player\'s user ID with the wrong key (got '+(impu||'none')+')');

clearTimeout(wd);console.log(fails?(fails+" VULNERABILITY(IES) FOUND"):"ALL ATTACKS BLOCKED");process.exit(fails?1:0);
