/* =====================================================================================================
   r540: PIXEL AVATARS and CO-OP for the Retro Mode stages.
   - Every outfit gets an 8-bit version built from its own colours and hair style (shirt, trousers, hair, skin), so the
     little runner in the retro stages and the 8-bit ending is YOU. Sylveon outfits are a pixel cat in that Sylveon's colours.
   - Co-op: everyone plays their own copy of each retro stage, on the SAME course (seeded from the co-op game), and sees
     their friends as see-through pixel ghosts with name tags, running alongside. Winning moves you on exactly like
     the normal game would (in co-op each player walks their own copy of the hotel forward); getting caught downs you
     the usual co-op way. In the 8-bit ending, your co-op friends walk out of the hotel with you.
   ===================================================================================================== */
const r8Hex=c=>'#'+(c>>>0).toString(16).padStart(6,'0').slice(-6);
function r8Pal(id,oc){oc=oc|0;if(typeof isSyl=='function'&&isSyl(oc)){const s=SYLP[oc];return{cat:1,l:r8Hex(s[0]),d:r8Hex(s[1]),k:r8Hex(s[3]||s[1])}}
 let h=0;for(const c of String(id||''))h=(h*31+c.charCodeAt(0))>>>0;const pr=OUTF[outfIdx(oc,h)]||OUTF[0];return{t:r8Hex(pr[0]),p:r8Hex(pr[1]),h:r8Hex(pr[2]),s:r8Hex(pr[3]),st:pr[4]|0}}
const r8Me=()=>r8Pal(SV.pid,SV.oc);
/* 8 x 12, two walking frames; h = hair, s = skin, e = eyes, t = shirt, p = trousers, b = shoes */
const R8AV=['..hhhh..','.hssssh.','.sesses.','.ssssss.','..ssss..','.tttttt.','tttttttt','s.tttt.s','..pppp..','..p..p..'];
/* a pixel cat in a Sylveon outfit's colours: 11 x 8, facing right, two walking frames (l = coat, d = darker, k = ear tips) */
function r8Cat(x,X,Y,f,pal,al){const rows=['.......k..k','d......llll','l......lele','.llllllllln','.llllllllll','..llllllll.',f?'..l.l..l.l.':'...l.l.l.l.',f?'..d.d..d.d.':'...d.d.d.d.'],C={l:pal.l,d:pal.d,k:pal.k,e:'#151515',n:'#ff8fb0'};
 x.save();if(al!=null)x.globalAlpha=al;X=Math.round(X)-1;Y=Math.round(Y)+4;for(let r=0;r<rows.length;r++)for(let k=0;k<11;k++){const ch=rows[r][k];if(ch=='.')continue;x.fillStyle=C[ch];x.fillRect(X+k,Y+r,1,1)}
 x.fillStyle=pal.d;x.fillRect(X+3,Y+3,2,1);x.fillRect(X+6,Y+3,1,1);x.restore()}   /* a couple of darker patches */
function r8Av(x,X,Y,f,pal,al){pal=pal||r8Me();if(pal.cat)return r8Cat(x,X,Y,f,pal,al);const rows=R8AV.concat([f?'.pp..p..':'..p..pp.',f?'.bb..bb.':'.bb..bb.']),C={h:pal.h,s:pal.s,e:'#151515',t:pal.t,p:pal.p,b:'#2a1a10'};
 x.save();if(al!=null)x.globalAlpha=al;X=Math.round(X);Y=Math.round(Y);
 for(let r=0;r<rows.length;r++)for(let k=0;k<8;k++){let ch=rows[r][k];if(ch=='.')continue;
  x.fillStyle=C[ch];x.fillRect(X+k,Y+r,1,1)}
 x.fillStyle=pal.h;if(pal.st==1){for(const k of[2,4,6])x.fillRect(X+k-1,Y-1,1,1)}                    /* spiky */
 else if(pal.st==2){for(let r=1;r<6;r++){x.fillRect(X,Y+r,1,1);x.fillRect(X+7,Y+r,1,1)}x.fillRect(X+1,Y+1,1,1);x.fillRect(X+6,Y+1,1,1)}   /* long */
 else if(pal.st==3){x.fillRect(X+3,Y-2,2,1);x.fillRect(X+2,Y-1,4,1)}                                /* bun */
 x.restore()}
r8Guy=function(x,X,Y,f){r8Av(x,X,Y,f,r8Me())};
/* ---- co-op: the same course for everyone, progress shared, friends drawn as ghosts ---- */
function r8Rand(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function r8Seeded(k,f){if(!r8Co())return f();const R0=Math.random;Math.random=r8Rand(((mpS()>>>0)^(n*7919)^(k*104729))>>>0);try{return f()}finally{Math.random=R0}}
{const s0=mg8Start;mg8Start=function(cfg){return r8Seeded(cfg&&cfg.k=='hall'?2:1,()=>s0.apply(this,[cfg]))}}
{const s0=lb8Start;lb8Start=function(){return r8Seeded(3,()=>s0.apply(this,arguments))}}
const R8NET={};
setInterval(()=>{try{if(!r8Co())return;let o=null;if(MG8.on)o={m:'run',x:+(MG8.cam+MG8.px).toFixed(1),y:+MG8.py.toFixed(1),d:MG8.duck?1:0,r:MG8.res||''};else if(LB8.on)o={m:'lib',x:+LB8.px.toFixed(2),y:+LB8.py.toFixed(2),r:LB8.res||''};if(!o)return;
 Object.assign(o,{t:'r8',s:mpS(),id:SV.pid,nm:String(SV.nm||'Player').slice(0,20),oc:SV.oc|0,n});mpSend(o)}catch(e){}},200);
{const mm0=mpMsg;mpMsg=function(key,o){if(o&&o.t=='r8'){try{if((o.s|0)!==(mpSeed|0))return;const id=String(o.id||'');if(!id||id===SV.pid)return;R8NET[id]={m:String(o.m),x:+o.x||0,y:+o.y||0,d:o.d?1:0,r:String(o.r||''),nm:fsName(String(o.nm||'Player')),oc:o.oc|0,n:o.n|0,t:Date.now()}}catch(e){}return}return mm0.apply(this,arguments)}}
function r8Ghosts(m){const now=Date.now(),L=[];for(const id in R8NET){const g=R8NET[id];if(g.m===m&&g.n===n&&now-g.t<1500)L.push([id,g])}return L}
function r8Tag(x,s,X,Y,col){x.font='bold 6px "Courier New",monospace';x.textAlign='center';x.textBaseline='bottom';const w=x.measureText(s).width+4;x.fillStyle='rgba(0,0,0,.6)';x.fillRect(X-w/2,Y-8,w,8);x.fillStyle=col;x.fillText(s,X,Y)}
{const d0=mg8Draw;mg8Draw=function(){d0.apply(this,arguments);try{const M=MG8,x=M.x;for(const[id,g]of r8Ghosts('run')){const sx=g.x-M.cam;if(sx<-10||sx>266)continue;const pal=r8Pal(id,g.oc),gy=MGY-12+g.y;
  if(g.d&&g.y>=0){x.save();x.globalAlpha=.55;x.translate(sx,MGY-6);x.scale(1,.5);r8Av(x,0,0,0,pal);x.restore()}else r8Av(x,sx,gy,Math.floor(M.t*10+id.length)%2,pal,.55);
  r8Tag(x,g.r=='win'?g.nm+' ✓':g.r=='lose'?g.nm+' ✗':g.nm,sx+4,gy-2,g.r=='lose'?'#ff8080':'#c0ffc0')}
  /* friends on the progress bar */for(const[id,g]of r8Ghosts('run')){x.fillStyle=r8Pal(id,g.oc).t;x.fillRect(50+150*Math.max(0,Math.min(1,g.x/M.end))-1,206,3,3)}}catch(e){}}}
{const d0=lb8Draw;lb8Draw=function(){d0.apply(this,arguments);try{const L=LB8,x=L.x;for(const[id,g]of r8Ghosts('lib')){const X=g.x*16-4,Y=16+g.y*16-9;r8Av(x,X,Y,Math.floor(L.t*6)%2,r8Pal(id,g.oc),.55);r8Tag(x,g.r=='win'?g.nm+' ✓':g.r=='lose'?g.nm+' ✗':g.nm,X+4,Y-1,'#c0ffc0')}}catch(e){}}}
/* the ending: your co-op friends walk out with you */
{const d0=r8EndDraw;r8EndDraw=function(dt){d0.apply(this,arguments);try{const E=END,x=E.r8.x,T=E.t;if(!(T<11||T>=27))return;const now=Date.now(),fr=Object.entries(MP.remotes||{}).filter(([id,r])=>r&&now-(r.t||0)<15000).slice(0,4);
  fr.forEach(([id,r],i)=>{const side=i%2?1:-1,off=(Math.floor(i/2)+1)*14*side,wk=Math.min(1,Math.max(0,(T-1.4-i*.3)/3.2)),gx=124+off*wk,gy=146+wk*48;r8Av(x,gx,gy,wk<1&&(Math.floor(T*8+i)%2),r8Pal(id,r.oc));if(wk>=1)r8Tag(x,fsName(r.name||'Player'),gx+4,gy-2,'#ffe9a8')})}catch(e){}}}
