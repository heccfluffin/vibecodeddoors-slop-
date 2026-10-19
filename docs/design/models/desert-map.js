/* Desert map redo (desert-map.md): the tables and a reference renderer.
   The tables are the part to copy as they are: KIND (the palette per kind of place), AREAS (the named areas),
   BIG/DROP (which labels show where), cls (label classes).
   The renderer below is the one the approved preview uses (plain canvas 2D, the game's own data: q.mapR, q.obs,
   q.locs, MAPBN). Adapt it into dmapBg/dmapDraw as the spec says; it is reference code, not a drop-in module:
   in the preview DATA.obs is an array of [x0,x1,z0,z1,kd,off] and DATA.mapR of [x0,x1,z0,z1,c,circ]. */
/* The new desert map, drawn from the game's real data (q.mapR, q.obs, q.locs, MAPBN dumped from r631).
   Everything the map shows comes from three tables: AREAS (named zones with a kind), the roads/ground shapes the
   builders already push (mapR), and the buildings, which are found automatically from the obstacles in each area
   (wall pieces that touch are one building), so reworked places draw themselves. */
const KIND={
 town:{fill:'rgba(196,150,96,.35)',edge:'#8a5a32',bld:'#7a4a2e',roof:'#9a6a46',name:'Towns'},
 civic:{fill:'rgba(120,140,170,.30)',edge:'#3a4a6a',bld:'#3a4a6a',roof:'#56688a',name:'Police and courts'},
 military:{fill:'rgba(120,124,88,.42)',edge:'#4a4e34',bld:'#4d5240',roof:'#666b52',name:'Military'},
 prison:{fill:'rgba(130,128,122,.55)',edge:'#3a3a3c',bld:'#48484c',roof:'#62626a',name:'Prison'},
 industry:{fill:'rgba(150,104,64,.38)',edge:'#6a4228',bld:'#5a4232',roof:'#7a5a42',name:'Industry'},
 aviation:{fill:'rgba(176,172,160,.45)',edge:'#5a5a56',bld:'#56585c',roof:'#72747a',name:'Airfield'},
 restricted:{fill:'rgba(70,72,66,.55)',edge:'#e0c020',bld:'#24262a',roof:'#3a3c42',name:'Restricted',hazard:1},
 energy:{fill:'rgba(196,186,140,.40)',edge:'#7a7040',bld:'#2a3a5a',roof:'#3a5078',name:'Power'},
 sport:{fill:'rgba(200,120,90,.22)',edge:'#8a3a2a',bld:'#5a3a32',roof:'#7a4a40',name:'Racing'},
 leisure:{fill:'rgba(110,170,170,.22)',edge:'#2a6a6a',bld:'#2a5a5a',roof:'#4a7a78',name:'Days out'},
 heritage:{fill:'rgba(200,170,110,.30)',edge:'#7a5a2a',bld:'#6a5030',roof:'#8a6a40',name:'Sites'}};
/* the named areas: name, icon, kind, footprint (world x0,x1,z0,z1), where the name goes */
const AREAS=[
 ['Route 13','🚏','town',-95,105,-1112,-890,0,-1118],
 ['Desert PD','🚓','civic',40,136,-1032,-998,88,-1040],
 ['Fort Blackout','🏰','military',215,600,-1004,-660,408,-1012],
 ['Dark Penitentiary','⛓️','prison',-566,-314,-880,-634,-440,-888],
 ['Old Quarry','⛏️','industry',-266,-120,-1510,-1408,-193,-1400],
 ["Goblino's Scrap",'🚗','industry',60,180,-1380,-1300,120,-1388],
 ['Airfield','✈️','aviation',265,545,-1335,-1195,405,-1343],
 ['Dark Zone 51','👽','restricted',-630,-470,-1960,-1780,-550,-1968],
 ['Speedway','🏁','sport',181,418,-1878,-1765,300,-1886],
 ['Wind farm','🌬️','energy',-625,-475,-1335,-1195,-550,-1343],
 ['Solar farm','☀️','energy',-205,-35,-1345,-1255,-120,-1353],
 ['Dusty Gulch','🤠','town',396,528,-1570,-1436,462,-1578],
 ['The Pyramid','🔺','heritage',-215,-135,-1100,-1000,-175,-1106],
 ['Crash site','✈️','heritage',-72,-8,-1190,-1140,-40,-1196],
 ['Mirage Lake','🏖️','leisure',170,312,-1622,-1478,241,-1630],
 ['Observatory','🔭','leisure',566,640,-1500,-1460,603,-1506],
 ["Dino Dan's",'🦕','leisure',85,150,-1962,-1905,118,-1968]];
/* other big names (no area fill: the ground shapes already show them) */
const BIG=new Set(['Lookout Mesa',"Devil's Gorge",'Railroad']);
/* labels that the new map leaves out because a better one covers them */
const DROP=new Set(['Heliport West','LZ Bravo','Fort Blackout Airstrip','Fort Blackout','Dark Zone 51','Old Quarry',"Goblino's Scrap",'Airfield','Speedway','Wind farm','Solar farm','Dusty Gulch','Dark Penitentiary','Desert PD','The Pyramid','Crashed plane','Mirage Lake','Observatory',"Dino Dan's"]);
const cls=l=>/^Phone booth/.test(l[0])?'phone':/^Stunt:/.test(l[0])?'stunt':BIG.has(l[0])?'big':'place';

/* ----- reference renderer (from the preview) ----- */
const DMW={x0:-730,z0:-2040,S:1460},BAR={x:640,zn:-880,zs:-1980};
const cv=document.getElementById('cv'),cx2=cv.getContext('2d'),mm=document.getElementById('mm'),mx=mm.getContext('2d');
const V={cx:0,cz:-1310,s:900/1460,z:1};let me={x:20,z:-1080};
const show={places:1,base:1,phones:0,stunts:0};
/* ---------- buildings: obstacles in each area that touch are one building ---------- */
const OB=DATA.obs.map(o=>({x0:o[0],x1:o[1],z0:o[2],z1:o[3],kd:o[4],off:o[5]})).filter(o=>!o.off);
const inA=(o,a)=>o.x0>=a[3]-1&&o.x1<=a[4]+1&&o.z0>=a[5]-1&&o.z1<=a[6]+1;
const BLD=[],WALL=[];
for(const a of AREAS){const obs=OB.filter(o=>!o.kd&&inA(o,a)&&(o.x1-o.x0)<80&&(o.z1-o.z0)<80),n=obs.length,par=obs.map((_,i)=>i),f=i=>par[i]===i?i:(par[i]=f(par[i])),G=.6;
 for(let i=0;i<n;i++){const p=obs[i];for(let j=i+1;j<n;j++){const q=obs[j];if(p.x0-G<q.x1&&q.x0-G<p.x1&&p.z0-G<q.z1&&q.z0-G<p.z1)par[f(i)]=f(j)}}
 const cl={};obs.forEach((o,i)=>{const r=f(i),c=cl[r]||(cl[r]={x0:1e9,x1:-1e9,z0:1e9,z1:-1e9,n:0,k:a[2]});c.x0=Math.min(c.x0,o.x0);c.x1=Math.max(c.x1,o.x1);c.z0=Math.min(c.z0,o.z0);c.z1=Math.max(c.z1,o.z1);c.n++;o.c=c});
 for(const c of Object.values(cl))if(c.n>=3&&c.x1-c.x0>=3&&c.z1-c.z0>=3&&c.x1-c.x0<=90&&c.z1-c.z0<=90)BLD.push(c);
 for(const o of obs){const lone=!(o.c&&BLD.includes(o.c));if(lone&&o.x1-o.x0<1.2&&o.z1-o.z0<1.2)continue;WALL.push(Object.assign({k:a[2]},o))}}
/* ---------- drawing ---------- */
const R0=DATA.mapR.map(m=>({x0:m[0],x1:m[1],z0:m[2],z1:m[3],c:m[4],circ:m[5]}));
const seen=new Set(),MR=R0.filter(m=>{const k=[m.x0,m.x1,m.z0,m.z1,m.c].join();if(seen.has(k))return false;seen.add(k);return true});
const isRoad=m=>m.c=='#4a4440'||m.c=='#8a6a44';
function proj(V,W,H){const X=x=>(x-V.cx)*V.s+W/2,Y=z=>(z-V.cz)*V.s+H/2;return{X,Y}}
const bgc=document.createElement('canvas');bgc.width=bgc.height=1024;{const b=bgc.getContext('2d');b.fillStyle='#d6bb8c';b.fillRect(0,0,1024,1024);let s=7;const r=()=>(s=(s*16807)%2147483647)/2147483647;
 for(let i=0;i<9000;i++){b.fillStyle='rgba('+(r()<.5?'120,90,50':'255,240,210')+','+(r()*.08)+')';b.fillRect(r()*1024,r()*1024,2,2)}
 b.strokeStyle='rgba(150,115,70,.18)';b.lineWidth=2;for(let i=0;i<70;i++){const x=r()*1024,y=r()*1024;b.beginPath();b.moveTo(x,y);b.quadraticCurveTo(x+30,y-8,x+70,y+2);b.stroke()}}
function draw(c,V,o){const x=c.getContext('2d'),W=c.width,H=c.height,{X,Y}=proj(V,W,H),k=V.s;x.save();x.clearRect(0,0,W,H);
 if(o.round){x.beginPath();x.arc(W/2,H/2,W/2,0,7);x.clip()}
 /* sand, then the storm beyond the barrier (not over the base and the prison) */
 /* the sand tile is 240 m of ground: anchored to the world, so it scales and pans with the map */const pat=x.createPattern(bgc,'repeat');pat.setTransform(new DOMMatrix().translate(X(0),Y(0)).scale(240*k/1024));x.fillStyle=pat;x.fillRect(0,0,W,H);
 x.fillStyle='rgba(90,60,30,.28)';const sx0=X(-BAR.x),sx1=X(BAR.x),sz0=Y(BAR.zs),sz1=Y(BAR.zn);x.fillRect(0,0,sx0,H);x.fillRect(sx1,0,W-sx1,H);x.fillRect(sx0,0,sx1-sx0,sz0);x.fillRect(sx0,sz1,sx1-sx0,H-sz1);
 x.setLineDash([8,6]);x.strokeStyle='rgba(60,40,20,.45)';x.lineWidth=1.5;x.strokeRect(sx0,sz0,sx1-sx0,sz1-sz0);x.setLineDash([]);
 /* area ground */
 for(const a of AREAS){const K=KIND[a[2]],rx=X(a[3]),ry=Y(a[5]),w=(a[4]-a[3])*k,h=(a[6]-a[5])*k;x.fillStyle=K.fill;x.fillRect(rx,ry,w,h)}
 /* ground shapes and roads from the builders */
 for(const m of MR){if(isRoad(m))continue;const a=X(m.x0),b=Y(m.z0),w=(m.x1-m.x0)*k,h=(m.z1-m.z0)*k;x.fillStyle=m.c;if(m.circ){x.beginPath();x.ellipse(a+w/2,b+h/2,w/2,h/2,0,0,7);x.fill()}else x.fillRect(a,b,w,h)}
 const roads=MR.filter(isRoad);for(const m of roads){x.fillStyle='rgba(40,30,20,.35)';x.fillRect(X(m.x0)-1.5,Y(m.z0)-1.5,(m.x1-m.x0)*k+3,(m.z1-m.z0)*k+3)}
 for(const m of roads){x.fillStyle=m.c;x.fillRect(X(m.x0),Y(m.z0),(m.x1-m.x0)*k,(m.z1-m.z0)*k)}
 if(k>.5){x.strokeStyle='rgba(240,200,60,.85)';x.lineWidth=Math.max(1,k*.35);x.setLineDash([4*k,4*k]);for(const m of roads){if(m.c!='#4a4440')continue;const w=m.x1-m.x0,h=m.z1-m.z0;x.beginPath();if(w>h){const yy=Y((m.z0+m.z1)/2);x.moveTo(X(m.x0),yy);x.lineTo(X(m.x1),yy)}else{const xx=X((m.x0+m.x1)/2);x.moveTo(xx,Y(m.z0));x.lineTo(xx,Y(m.z1))}x.stroke()}x.setLineDash([])}
 /* buildings: a shadow, the roof, a lighter edge; then the wall pieces */
 for(const b of BLD){const K=KIND[b.k],a=X(b.x0),y=Y(b.z0),w=(b.x1-b.x0)*k,h=(b.z1-b.z0)*k;x.fillStyle='rgba(30,20,10,.28)';x.fillRect(a+Math.max(1,k*.8),y+Math.max(1,k*.8),w,h);x.fillStyle=K.roof;x.fillRect(a,y,w,h)}
 for(const wl of WALL){const K=KIND[wl.k];x.fillStyle=K.bld;x.fillRect(X(wl.x0),Y(wl.z0),Math.max(1.2,(wl.x1-wl.x0)*k),Math.max(1.2,(wl.z1-wl.z0)*k))}
 /* small props the player can wreck (cactus, rocks, barrels) only when close up */
 if(k>1.6){for(const p of OB){if(!p.kd||p.kd=='door'||p.kd=='gate')continue;x.fillStyle=p.kd=='cactus'?'#4a7a3a':p.kd=='rock'?'#7a6a5a':'#8a3a2a';x.beginPath();x.arc(X((p.x0+p.x1)/2),Y((p.z0+p.z1)/2),Math.max(1.5,k*.5),0,7);x.fill()}}
 /* area borders */
 for(const a of AREAS){const K=KIND[a[2]],rx=X(a[3]),ry=Y(a[5]),w=(a[4]-a[3])*k,h=(a[6]-a[5])*k;x.lineWidth=Math.max(1.5,Math.min(3,k*1.2));
  if(K.hazard){x.setLineDash([6,6]);x.strokeStyle='#1a1a1a';x.strokeRect(rx,ry,w,h);x.lineDashOffset=6;x.strokeStyle=K.edge;x.strokeRect(rx,ry,w,h);x.lineDashOffset=0;x.setLineDash([])}
  else{if(a[2]=='town')x.setLineDash([5,4]);x.strokeStyle=K.edge;x.strokeRect(rx,ry,w,h);x.setLineDash([])}}
 /* labels */
 const placed=[],fits=r=>!placed.some(p=>r.x<p.x+p.w&&p.x<r.x+r.w&&r.y<p.y+p.h&&p.y<r.y+r.h);
 const badge=(px,py,ic,r)=>{x.fillStyle='#fbf3e2';x.strokeStyle='#5a4428';x.lineWidth=1.5;x.beginPath();x.arc(px,py,r,0,7);x.fill();x.stroke();x.font=Math.round(r*1.15)+'px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(ic,px,py+1)};
 const tag=(px,py,t,sz,wt,force)=>{x.font=wt+' '+sz+'px '+getComputedStyle(document.body).getPropertyValue('--disp');const w=x.measureText(t).width+10,h=sz+6,r={x:px-w/2,y:py,w,h};if(!force&&!fits(r))return false;placed.push(r);
  x.fillStyle='rgba(251,243,226,.92)';x.fillRect(r.x,r.y,w,h);x.strokeStyle='rgba(60,40,20,.5)';x.lineWidth=1;x.strokeRect(r.x+.5,r.y+.5,w-1,h-1);x.fillStyle='#2b2218';x.textAlign='center';x.textBaseline='middle';x.fillText(t,px,py+h/2+.5);return true};
 const zs=V.z,mini=o.mini;
 if(!mini){for(const a of AREAS){const px=X(a[7]),py=Y(a[8]);tag(px,py+(zs>1.5?2:-2),a[0].toUpperCase(),zs>2?15:13,700,1)}
  for(const l of DATA.locs){if(cls(l)!='big')continue;const px=X(l[2]),py=Y(l[3]);badge(px,py,l[1],11);tag(px,py+14,l[0],12,600,1)}
  if(show.places&&zs>=1.6)for(const l of DATA.locs){if(cls(l)!='place'||DROP.has(l[0]))continue;const px=X(l[2]),py=Y(l[3]);if(px<-40||py<-40||px>W+40||py>H+40)continue;if(tag(px,py+12,l[0],11,600,0))badge(px,py,l[1],9)}
  if(show.base&&zs>=2)for(const[n,bx,bz]of MAPBN){const px=X(bx),py=Y(bz);tag(px,py-8,n,11,600,0)}
  for(const[on,c]of[[show.phones,'phone'],[show.stunts,'stunt']])if(on)for(const l of DATA.locs){if(cls(l)!=c)continue;const px=X(l[2]),py=Y(l[3]);badge(px,py,c=='phone'?'☎️':'🛹',8);if(zs>=1.6)tag(px,py+10,l[0].replace(/^Phone booth \((.*)\)$/,'Phone: $1').replace(/^Stunt: /,''),10,600,0)}}
 else{/* the minimap: icons of every place in view, names for the three nearest */
  const near=DATA.locs.filter(l=>(cls(l)=='place'||cls(l)=='big')&&!DROP.has(l[0])).map(l=>[Math.hypot(l[2]-o.me.x,l[3]-o.me.z),l]).filter(p=>p[0]<80).sort((a,b)=>a[0]-b[0]);
  near.forEach(([d,l],i)=>{const px=X(l[2]),py=Y(l[3]);badge(px,py,l[1],12);if(i<3)tag(px,py+14,l[0],12,600,0)});
  const inBase=o.me.x>215&&o.me.x<600&&o.me.z>-1004&&o.me.z<-660;if(inBase)for(const[n,bx,bz]of MAPBN){if(Math.hypot(bx-o.me.x,bz-o.me.z)>70)continue;tag(X(bx),Y(bz)-8,n,12,600,0)}}
 /* you */
 if(o.me){const px=X(o.me.x),py=Y(o.me.z);x.fillStyle='rgba(255,230,120,.25)';x.beginPath();x.moveTo(px,py);x.arc(px,py,mini?60:28,-Math.PI/2-.45,-Math.PI/2+.45);x.fill();x.fillStyle='#ffd23a';x.strokeStyle='#2b2218';x.lineWidth=2;x.beginPath();x.moveTo(px,py-10);x.lineTo(px+7,py+8);x.lineTo(px,py+4);x.lineTo(px-7,py+8);x.closePath();x.fill();x.stroke()}
 if(!mini){/* scale bar */const m50=50*k;x.fillStyle='rgba(43,34,24,.85)';x.fillRect(14,H-34,m50+16,22);x.fillStyle='#f8f0e0';x.fillRect(22,H-20,m50,3);x.font='600 12px sans-serif';x.textAlign='left';x.fillText('50 m',22,H-26)}
 x.restore()}
/* ---------- the minimap and its banner ---------- */
const areaAt=(px,pz)=>AREAS.find(a=>px>=a[3]&&px<=a[4]&&pz>=a[5]&&pz<=a[6]);
function drawMini(){draw(mm,{cx:me.x,cz:me.z,s:2,z:9},{round:1,mini:1,me});const a=areaAt(me.x,me.z);let t=a?a[0]:'Open desert';
 if(a&&a[0]=='Fort Blackout'){let best=null,bd=40;for(const b of MAPBN){const d=Math.hypot(b[1]-me.x,b[2]-me.z);if(d<bd){bd=d;best=b}}if(best)t+=' · '+best[0]}
 document.getElementById('where').textContent=t;const[t1,t2]=t.split(' · ');mx.save();const F=getComputedStyle(document.body).getPropertyValue('--disp');mx.font='700 20px '+F;const w1=mx.measureText(t1.toUpperCase()).width;mx.font='600 16px '+F;const w2=t2?mx.measureText(t2).width:0,w=Math.min(220,Math.max(w1,w2)+20),h=t2?50:30;
 mx.fillStyle='rgba(43,34,24,.85)';mx.beginPath();mx.roundRect?mx.roundRect(150-w/2,30,w,h,6):mx.rect(150-w/2,30,w,h);mx.fill();mx.fillStyle='#f8f0e0';mx.textAlign='center';mx.textBaseline='middle';mx.font='700 20px '+F;mx.fillText(t1.toUpperCase(),150,46,w-12);if(t2){mx.font='600 16px '+F;mx.fillStyle='#e8d8b0';mx.fillText(t2,150,68,w-12)}mx.restore()}
function redraw(){V.s=900/1460*V.z;draw(cv,V,{me});drawMini()}

/* ----- the zoom glide (from the preview; cv is the 900 px map canvas, V the view, redraw() draws) ----- */
/* ---------- zoom, pan, click: zoom glides to its target and keeps the point under the cursor still ---------- */
const HOME={cx:0,cz:-1310},ZM={t:1,ax:0,az:0,px:450,py:450,raf:0,last:0};
const scaleOf=z=>900/1460*z;
function zoomTo(f,px,py){const r=cv.getBoundingClientRect(),sx=900/r.width;ZM.px=px*sx;ZM.py=py*sx;ZM.ax=(ZM.px-450)/V.s+V.cx;ZM.az=(ZM.py-450)/V.s+V.cz;
 ZM.t=Math.max(1,Math.min(6,ZM.t*f));if(!ZM.raf){ZM.last=performance.now();ZM.raf=requestAnimationFrame(glide)}}
function glide(now){const dt=Math.min(.05,(now-ZM.last)/1000);ZM.last=now;const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,k=reduce?1:1-Math.exp(-dt*14);
 V.z+=(ZM.t-V.z)*k;if(Math.abs(ZM.t-V.z)<.002)V.z=ZM.t;V.s=scaleOf(V.z);
 /* keep the anchor under the cursor; as the zoom comes back to 1, slide home */
 const cx=ZM.ax-(ZM.px-450)/V.s,cz=ZM.az-(ZM.py-450)/V.s,h=Math.max(0,Math.min(1,(1.35-V.z)/.35));V.cx=cx+(HOME.cx-cx)*h;V.cz=cz+(HOME.cz-cz)*h;
 redraw();if(V.z!==ZM.t||h>0&&h<1){ZM.raf=requestAnimationFrame(glide)}else ZM.raf=0}
cv.addEventListener('wheel',e=>{e.preventDefault();const r=cv.getBoundingClientRect(),d=e.deltaMode==1?e.deltaY*33:e.deltaY;zoomTo(Math.exp(-Math.max(-300,Math.min(300,d))*.0022),e.clientX-r.left,e.clientY-r.top)},{passive:false});
document.getElementById('zin').onclick=()=>zoomTo(1.6,cv.clientWidth/2,cv.clientHeight/2);document.getElementById('zout').onclick=()=>zoomTo(1/1.6,cv.clientWidth/2,cv.clientHeight/2);
