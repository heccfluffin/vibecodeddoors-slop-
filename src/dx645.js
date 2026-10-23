/* =====================================================================================================
   r660: THE DESERT MAP AND MINIMAP, REDONE (docs/design/desert-map.md; the tables come from models/desert-map.js)
   - Every named place is an AREA with a kind (town, military, prison, industry...). The kind gives the ground tint,
     the edge and the building colours; Dark Zone 51 gets a yellow-and-black hazard edge, the towns a dashed one.
   - Buildings draw themselves: inside each area the wall pieces that touch are one building (a roof with a small
     shadow, then the walls), so a reworked or newly built place shows on the map as soon as it is built. This
     replaces the base-only version (mapBaseDraw, dx602) and the hand-drawn prison boxes.
   - Labels in three classes: the area names always; other places from zoom 1.6, never on top of each other; the base's
     buildings from zoom 2. Phone booths and stunt jumps only when switched on (toggles under the map, remembered).
   - The minimap: a banner names the area you are in (and, in Fort Blackout, the building next to you); icons for every
     place in view and names for the three nearest.
   - Zoom glides to where you asked, and the point under the mouse (or between two fingers) stays put.
   - DMAPV is the one place that says where the big map is centred and how much it shows.
   - The static part (sand, areas, roads, buildings) is painted once into the background canvas (q.mapBg) and only again
     when something in an area is built or knocked down; zoomed in, the big map paints it sharp for the view it shows
     and keeps that until the view moves.
   ?nodm2 in the address gives the old map.
   ===================================================================================================== */
const DMKIND={
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
/* the named areas: name, icon, kind, footprint (world x0, x1, z0, z1), where the name goes. Rows checked against the game
   as it is in r659 (several footprints grew with the reworks: see docs/design/NOTES.md, r660). A new place only needs a row
   here: its buildings appear by themselves. */
const DMAREAS=[
 ['Route 13','🚏','town',-100,160,-1112,-888,30,-1120],
 ['Desert PD','🚓','civic',36,158,-1034,-996,97,-1041],
 ['Fort Blackout','🏰','military',215,600,-1004,-660,408,-1012],
 ['Dark Penitentiary','⛓️','prison',-566,-314,-880,-634,-440,-888],
 ['Old Quarry','⛏️','industry',-266,-120,-1510,-1408,-193,-1400],
 ["Goblino's Scrap",'🚗','industry',60,180,-1380,-1300,120,-1388],
 ['Airfield','✈️','aviation',265,545,-1335,-1195,405,-1343],
 ['Dark Zone 51','👽','restricted',-630,-470,-1960,-1780,-550,-1968],
 ['Speedway','🏁','sport',181,420,-1896,-1765,300,-1904],
 ['Wind farm','🌬️','energy',-625,-452,-1335,-1195,-540,-1343],
 ['Solar farm','☀️','energy',-205,-18,-1352,-1255,-112,-1360],
 ['Dusty Gulch','🤠','town',396,542,-1572,-1428,469,-1580],
 ['The Pyramid','🔺','heritage',-219,-118,-1100,-992,-168,-1108],
 ['Crash site','✈️','heritage',-90,-26,-1180,-1150,-58,-1188],
 ['Mirage Lake','🏖️','leisure',170,312,-1622,-1478,241,-1630],
 ['Observatory','🔭','leisure',566,640,-1500,-1460,603,-1506],
 ["Dino Dan's",'🦕','leisure',78,150,-1962,-1905,114,-1970]];
/* other big names (no area fill: their ground shapes already show them) */
const DMBIG=new Set(['Lookout Mesa',"Devil's Gorge",'Railroad']);
/* only for the minimap's banner: where these big places are */
const DMZONES=[['Lookout Mesa',-400,-280,-1600,-1500],["Devil's Gorge",-640,640,-1744,-1700]];
/* labels the new map leaves out because an area name or a base name covers them */
const DMDROP=new Set(['Heliport West','LZ Bravo','Fort Blackout Airstrip','Fort Blackout','Dark Zone 51','Old Quarry',"Goblino's Scrap",'Airfield','Speedway','Wind farm','Solar farm','Dusty Gulch','Dark Penitentiary','Desert PD','The Pyramid','Crashed plane','Mirage Lake','Observatory',"Dino Dan's"]);
const dmCls=n=>/^Phone booth/.test(n)?'phone':/^Stunt:/.test(n)?'stunt':DMBIG.has(n)?'big':'place';
/* clicking an area's name warps you to this place (else to the place with the area's own name, else to the name) */
const DMWARP={'Route 13':'Bus stop','Crash site':'Crashed plane'};
/* the big map: its centre and how many metres its canvas shows at zoom 1 */
const DMAPV={cx:0,cz:-1310,span:1400,W:900};
const DM2={on:!/[?&]nodm2\b/.test(location.search),show:{places:1,base:1,phones:0,stunts:0},gen:0,hits:[],st:null,stK:'',sand:null,data:null,tw:new Map()};
try{const s=JSON.parse(localStorage.getItem('doorsMapShow')||'null');if(s&&typeof s=='object')for(const k in DM2.show)if(k in s)DM2.show[k]=s[k]?1:0}catch(e){}
const DMBYSIZE=DMAREAS.slice().sort((a,b)=>(a[4]-a[3])*(a[6]-a[5])-(b[4]-b[3])*(b[6]-b[5]));
/* the (smallest) area a point is in */
function dmArea(x,z){for(const a of DMBYSIZE)if(x>=a[3]&&x<=a[4]&&z>=a[5]&&z<=a[6])return a;return null}
/* the area a wall piece belongs to: the smallest one it lies in completely */
function dmAreaOf(o){for(const a of DMBYSIZE)if(o.x0>=a[3]-1&&o.x1<=a[4]+1&&o.z0>=a[5]-1&&o.z1<=a[6]+1)return a;return null}
const dmIsRoad=m=>m.road?1:m.c=='#4a4440'||m.c=='#8a6a44';
const dmDirt=m=>m.road?m.road=='dirt':m.c=='#8a6a44';

/* ---------- what the static map is made of (worked out again whenever the background is) ---------- */
function dmScan(q){const per=new Map();for(const a of DMAREAS)per.set(a,[]);
 for(const o of q.obs){if(o.kd||o.veh||o.off||o.dest||o.dead)continue;if(o.x1-o.x0>=80||o.z1-o.z0>=80)continue;const a=dmAreaOf(o);if(a)per.get(a).push(o)}
 /* the shapes the builders push: exact duplicates once (the parade ground was there twice) */
 const seen=new Set(),gr=[],rd=[];for(const m of q.mapR||[]){const k=m.x0+','+m.x1+','+m.z0+','+m.z1+','+m.c+','+(m.circ?1:0);if(seen.has(k))continue;seen.add(k);(dmIsRoad(m)&&!m.circ?rd:gr).push(m)}
 const bigS=r=>(r.x1-r.x0)*(r.z1-r.z0)>2500;
 /* buildings: wall pieces that touch (0.6 m) are one building */
 const bld=[],wall=[];
 for(const[a,obs]of per){const n=obs.length;if(!n)continue;const par=new Int32Array(n);for(let i=0;i<n;i++)par[i]=i;const f=i=>{while(par[i]!==i){par[i]=par[par[i]];i=par[i]}return i},G=.6,post=o=>o.x1-o.x0<1.2&&o.z1-o.z0<1.2;
  /* (small posts on their own do not join buildings together: the boardwalk posts made one roof of a whole street) */
  for(let i=0;i<n;i++){const p=obs[i];if(post(p))continue;for(let j=i+1;j<n;j++){const o=obs[j];if(post(o))continue;if(p.x0-G<o.x1&&o.x0-G<p.x1&&p.z0-G<o.z1&&o.z0-G<p.z1){const ri=f(i),rj=f(j);if(ri!==rj)par[ri]=rj}}}
  const cl=new Map(),of=new Array(n);for(let i=0;i<n;i++){const o=obs[i],r=f(i);let c=cl.get(r);if(!c){c={x0:1e9,x1:-1e9,z0:1e9,z1:-1e9,n:0,k:a[2]};cl.set(r,c)}c.x0=Math.min(c.x0,o.x0);c.x1=Math.max(c.x1,o.x1);c.z0=Math.min(c.z0,o.z0);c.z1=Math.max(c.z1,o.z1);c.n++;of[i]=c}
  const circ=gr.filter(r=>r.circ);for(const c of cl.values()){const w=c.x1-c.x0,h=c.z1-c.z0,mx=(c.x0+c.x1)/2,mz=(c.z0+c.z1)/2;
   /* a round shape on the map already shows this (the oasis, Skull Rock, the well...): leave it to that */if(circ.some(r=>Math.hypot((r.x0+r.x1)/2-mx,(r.z0+r.z1)/2-mz)<(r.x1-r.x0)/2&&r.x1-r.x0>=Math.max(w,h)*.6)){c.circ=1;continue}if(c.n>=3&&w>=3&&h>=3&&w<=90&&h<=90){
    /* a shape the builder pushed already shows this building: keep that one (a second roof on top would hide it) */
    c.sh=gr.some(r=>!r.circ&&!bigS(r)&&(r.x1-r.x0)*(r.z1-r.z0)<2.5*w*h&&Math.min(r.x1,c.x1)-Math.max(r.x0,c.x0)>w*.5&&Math.min(r.z1,c.z1)-Math.max(r.z0,c.z0)>h*.5);c.b=1;bld.push(c)}}
  for(let i=0;i<n;i++){const o=obs[i];if(of[i].circ||!of[i].b&&Math.max(o.x1-o.x0,o.z1-o.z0)<2.4)continue;wall.push({x0:o.x0,x1:o.x1,z0:o.z0,z1:o.z1,k:a[2]})}}
 /* road centre dashes on asphalt, stopping where another road crosses */
 const AS=rd.filter(r=>!dmDirt(r)),dash=[];
 for(const r of AS){const hz=(r.x1-r.x0)>=(r.z1-r.z0),L=hz?(r.x1-r.x0):(r.z1-r.z0);if(L<12)continue;const c=hz?(r.z0+r.z1)/2:(r.x0+r.x1)/2,u0=hz?r.x0:r.z0,u1=hz?r.x1:r.z1;
  const cut=[];for(const o of AS){if(o===r)continue;const ox0=o.x0-.5,ox1=o.x1+.5,oz0=o.z0-.5,oz1=o.z1+.5;if(hz){if(c<oz0||c>oz1||ox1<u0||ox0>u1)continue;if((o.x1-o.x0)>=(o.z1-o.z0)&&Math.abs((o.z0+o.z1)/2-c)<.5)continue;cut.push([ox0-2,ox1+2])}else{if(c<ox0||c>ox1||oz1<u0||oz0>u1)continue;if((o.z1-o.z0)>(o.x1-o.x0)&&Math.abs((o.x0+o.x1)/2-c)<.5)continue;cut.push([oz0-2,oz1+2])}}cut.sort((p,p2)=>p[0]-p2[0]);
  let t=u0+1.5;const seg=(p0,p1)=>{if(p1-p0<2)return;dash.push(hz?[p0,c,p1,c]:[c,p0,c,p1])};for(const[c0,c1]of cut){if(c1<t)continue;seg(t,Math.min(c0,u1-1.5));t=Math.max(t,c1)}seg(t,u1-1.5)}
 DM2.data={gr,rd,bld,wall,dash,bigS}}
/* the area counts that, when they change, mean something was built or knocked down */
function dmCount(q){let n=0;for(const o of q.obs){if(o.kd||o.veh||o.off||o.dest||o.dead)continue;if(dmArea((o.x0+o.x1)/2,(o.z0+o.z1)/2))n++}return n+'/'+((q.mapR||[]).length)}
/* is this spot inside a building (used by the map warp, so it never puts you inside one) */
function dmInBld(x,z){const D=DM2.data;if(!D)return false;for(const b of D.bld)if(x>b.x0-.5&&x<b.x1+.5&&z>b.z0-.5&&z<b.z1+.5)return true;return false}

/* ---------- the sand under everything (world-sized, so it scales and pans with the map) ---------- */
function dmSand(){if(DM2.sand)return DM2.sand;const N=1024,c=document.createElement('canvas');c.width=c.height=N;const x=c.getContext('2d'),k=N/DMW.S,X=w=>(w-DMW.x0)*k,Y=w=>(w-DMW.z0)*k;let sd=12345;const rn=()=>(sd=(sd*16807)%2147483647)/2147483647;
 const g=x.createRadialGradient(N/2,N/2,N*.1,N/2,N/2,N*.75);g.addColorStop(0,'#e2bd88');g.addColorStop(1,'#cfa46c');x.fillStyle=g;x.fillRect(0,0,N,N);
 /* dune ripples and speckles */x.lineWidth=1.2;for(let i=0;i<70;i++){const y0=rn()*N,x0=rn()*N,L=30+rn()*80,a=rn()*.6-.3;x.strokeStyle=rn()<.5?'rgba(255,240,210,.25)':'rgba(140,100,50,.16)';x.beginPath();for(let u=0;u<=L;u+=4){const px=x0+u*Math.cos(a),py=y0+u*Math.sin(a)+Math.sin(u*.12)*2.5;u?x.lineTo(px,py):x.moveTo(px,py)}x.stroke()}
 for(let i=0;i<2200;i++){x.fillStyle=rn()<.5?'rgba(120,80,40,.18)':'rgba(255,250,230,.22)';x.fillRect(rn()*N,rn()*N,1.4,1.4)}
 /* outside the barrier: the sandstorm, with holes for the desert, the prison and the base (they are out there on purpose) */
 {const t=document.createElement('canvas');t.width=t.height=N;const y=t.getContext('2d');y.fillStyle='rgba(90,60,30,.42)';y.fillRect(0,0,N,N);y.strokeStyle='rgba(255,230,190,.12)';y.lineWidth=1.5;for(let i=-N;i<N*2;i+=11){y.beginPath();y.moveTo(i,0);y.lineTo(i-N,N);y.stroke()}
  y.globalCompositeOperation='destination-out';y.fillStyle='#000';const cut=(x0,x1,z0,z1)=>y.fillRect(X(x0),Y(z0),(x1-x0)*k,(z1-z0)*k);cut(-DXB,DXB,DZS,DZN);try{cut(PENA.x0,PENA.x1,PENA.z0,PENA.z1)}catch(e){}{const a=DMAREAS[2];cut(a[3],a[4],a[5],a[6])}x.drawImage(t,0,0)}
 DM2.sand=c;return c}

/* ---------- paint the static map with any projection (the background canvas, or the zoomed big map's view) ---------- */
function dmPaint(q,x,X,Y,k,vr){const D=DM2.data;if(!D)return;const vis=vr?(r=>r.x1>=vr.x0&&r.x0<=vr.x1&&r.z1>=vr.z0&&r.z0<=vr.z1):()=>true;
 const box=(r,e)=>[X(r.x0-e),Y(r.z0-e),(r.x1-r.x0+2*e)*k,(r.z1-r.z0+2*e)*k];x.save();
 /* the barrier round the desert (dashed blue, as before), under everything */
 x.setLineDash([16,10]);x.strokeStyle='rgba(60,190,255,.9)';x.lineWidth=Math.max(2,Math.min(6,k*4));x.strokeRect(X(-DXB),Y(DZS),DXB*2*k,(DZN-DZS)*k);x.setLineDash([]);
 /* area ground */for(const a of DMAREAS){const r={x0:a[3],x1:a[4],z0:a[5],z1:a[6]};if(!vis(r))continue;x.fillStyle=DMKIND[a[2]].fill;x.fillRect(...box(r,0))}
 /* the ground shapes the builders push (lake, gorge, mesa, track, solar panels, the base's grounds, pads...) */
 for(const m of D.gr){if(!vis(m))continue;x.fillStyle=m.c;if(m.circ){const cx=X((m.x0+m.x1)/2),cy=Y((m.z0+m.z1)/2),rx=Math.max(1,(m.x1-m.x0)/2*k),ry=Math.max(1,(m.z1-m.z0)/2*k);x.beginPath();x.ellipse(cx,cy,rx,ry,0,0,7);x.fill();
   const e=m.edge||(m.c=='#3a9ad8'||m.c=='#3a90b8'?'#e8f6ff':null);if(e){x.strokeStyle=e;x.lineWidth=Math.max(1,Math.min(3,k*.9));x.stroke()}continue}
  x.fillRect(...box(m,0));if(!D.bigS(m)&&k>.9){x.strokeStyle='rgba(40,25,10,.45)';x.lineWidth=1;x.strokeRect(...box(m,0))}}
 /* the roads, as one network: a dark kerb under everything, then the surface, then the centre dashes */
 const RD=D.rd.filter(vis),DT=RD.filter(dmDirt),AS=RD.filter(r=>!dmDirt(r)),kb=Math.max(.6,1/k);
 x.fillStyle='rgba(70,45,20,.55)';for(const r of DT)x.fillRect(...box(r,kb));x.fillStyle='#9a7a50';for(const r of DT)x.fillRect(...box(r,0));
 x.fillStyle='#2a2622';for(const r of AS)x.fillRect(...box(r,kb));x.fillStyle='#4a4642';for(const r of AS)x.fillRect(...box(r,0));
 if(k>.5){x.strokeStyle='#f0c020';x.lineWidth=Math.max(1,k*.4);x.setLineDash([5*k,4*k]);x.beginPath();for(const d of D.dash){if(vr&&(Math.max(d[0],d[2])<vr.x0||Math.min(d[0],d[2])>vr.x1||Math.max(d[1],d[3])<vr.z0||Math.min(d[1],d[3])>vr.z1))continue;x.moveTo(X(d[0]),Y(d[1]));x.lineTo(X(d[2]),Y(d[3]))}x.stroke();x.setLineDash([])}
 /* jump ramps */x.lineWidth=1;for(const r of q.ramps||[]){if(r.ax=='x')continue;const z0=Math.min(r.z0,r.z0+r.dir*r.len),b={x0:r.x0,x1:r.x1,z0,z1:z0+r.len};if(!vis(b))continue;x.fillStyle='#b08860';x.fillRect(...box(b,0));x.strokeStyle='#5a3a1a';x.strokeRect(...box(b,0))}
 /* buildings: a small shadow and the roof, then the walls on top in the kind's dark colour */
 const so=Math.max(1,k*.8);for(const b of D.bld){if(b.sh||!vis(b))continue;const r=box(b,0);x.fillStyle='rgba(30,20,10,.28)';x.fillRect(r[0]+so,r[1]+so,r[2],r[3]);x.fillStyle=DMKIND[b.k].roof;x.fillRect(...r)}
 let wk=null;for(const w of D.wall){if(!vis(w))continue;if(w.k!==wk){wk=w.k;x.fillStyle=DMKIND[wk].bld}const a=X(w.x0),b=Y(w.z0),ww=Math.max(1.2,(w.x1-w.x0)*k),hh=Math.max(1.2,(w.z1-w.z0)*k);x.fillRect(a,b,ww,hh)}
 /* area borders */for(const a of DMAREAS){const K=DMKIND[a[2]],r={x0:a[3],x1:a[4],z0:a[5],z1:a[6]};if(!vis(r))continue;const b=box(r,0);x.lineWidth=Math.max(1.5,Math.min(3,k*1.2));
  if(K.hazard){x.setLineDash([6,6]);x.strokeStyle='#1a1a1a';x.strokeRect(...b);x.lineDashOffset=6;x.strokeStyle=K.edge;x.strokeRect(...b);x.lineDashOffset=0;x.setLineDash([])}
  else{if(a[2]=='town')x.setLineDash([5,4]);x.strokeStyle=K.edge;x.strokeRect(...b);x.setLineDash([])}}
 x.restore()}

/* the background canvas: sand, then everything static, for the whole map (2048 px, as before) */
{const bg0=dmapBg;dmapBg=function(q){if(!DM2.on)return bg0.apply(this,arguments);if(q.mapBg)return q.mapBg;const t0=performance.now();
 const N=2048,c=(DM2.bgc&&DM2.bgq===q)?DM2.bgc:document.createElement('canvas');if(c.width!==N){c.width=c.height=N}const x=c.getContext('2d'),k=N/DMW.S,X=w=>(w-DMW.x0)*k,Y=w=>(w-DMW.z0)*k;
 x.clearRect(0,0,N,N);x.drawImage(dmSand(),0,0,N,N);dmScan(q);dmPaint(q,x,X,Y,k,null);
 DM2.bgc=c;DM2.bgq=q;q.mapBg=c;DM2.gen++;DM2.stK='';DM2.cnt=dmCount(q);DM2.bgMs=performance.now()-t0;return c}}
/* when more of a place is built (or knocked down), draw the background again */
{const ru=busRoamUpd;busRoamUpd=function(q,dt){const r=ru.apply(this,arguments);try{if(DM2.on&&q&&q.obs&&q.mapBg&&(DM2.ct=(DM2.ct||0)-dt)<=0){DM2.ct=3;if(dmCount(q)!==DM2.cnt)q.mapBg=null}}catch(e){}return r}}
/* the zoomed-in big map: the static part painted sharp for exactly this view, kept until the view changes */
function dmStatic(q,W,H,cx,cz,sc){const key=DM2.gen+'|'+W+'|'+H+'|'+cx.toFixed(2)+'|'+cz.toFixed(2)+'|'+sc.toFixed(4);if(DM2.stK===key&&DM2.st)return DM2.st;
 const c=DM2.st||(DM2.st=document.createElement('canvas'));if(c.width!==W)c.width=W;if(c.height!==H)c.height=H;const x=c.getContext('2d'),X=wx=>W/2+(wx-cx)*sc,Y=wz=>H/2+(wz-cz)*sc;
 x.fillStyle='#8a6a40';x.fillRect(0,0,W,H);x.drawImage(dmSand(),X(DMW.x0),Y(DMW.z0),DMW.S*sc,DMW.S*sc);dmPaint(q,x,X,Y,sc,{x0:cx-W/2/sc-2,x1:cx+W/2/sc+2,z0:cz-H/2/sc-2,z1:cz+H/2/sc+2});DM2.stK=key;return c}

/* ---------- the view of the big map ---------- */
/* zoomed in, the map is centred on you plus the drag (DMAP.px, pz); below zoom 1.35 it slides back to the whole map */
function dmapView(q){const D=DMAP,zm=D.zm||1,sc=DMAPV.W/DMAPV.span*zm,h=Math.max(0,Math.min(1,(1.35-zm)/.35)),ux=P.x+(D.px||0),uz=P.z-q.OZ+(D.pz||0);return{cx:ux+(DMAPV.cx-ux)*h,cz:uz+(DMAPV.cz-uz)*h,sc,h,zm}}
function dmapFullDraw(q){const v=dmapView(q);dmapDraw(q,DMAP.fc,v.cx,v.cz,v.sc,1)}
/* zoom by f, keeping the point at canvas pixel (sx, sy) where it is; the zoom glides there */
function dmapZoomTo(f,sx,sy){const D=DMAP,q=BUS.ride;if(!D||!D.fc||!q)return;const v=dmapView(q),W=D.fc.width,H=D.fc.height,cur=D.zr?D.zt:(D.zm||1);
 /* still gliding towards the same spot (more wheel notches): keep the point it started from, so it ends up back under the cursor */
 if(!(D.zr&&D.za&&Math.abs(D.za.sx-sx)<3&&Math.abs(D.za.sy-sy)<3))D.za={x:v.cx+(sx-W/2)/v.sc,z:v.cz+(sy-H/2)/v.sc,sx,sy};D.zt=Math.max(1,Math.min(6,cur*f));if(!D.zr){D.zl=performance.now();D.zr=requestAnimationFrame(dmapGlide)}}
function dmapGlide(now){const D=DMAP;D.zr=0;const q=BUS.ride;if(D.zt==null)return;if(!q||!D.open){D.zm=D.zt;return}
 const dt=Math.min(.05,Math.max(0,(now-D.zl)/1000));D.zl=now;let red=false;try{red=matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}
 let zm=D.zm||1;zm+=(D.zt-zm)*(red?1:1-Math.exp(-dt*14));if(Math.abs(D.zt-zm)<.002)zm=D.zt;D.zm=zm;
 const A=D.za;if(A){const W=D.fc.width,H=D.fc.height,sc=DMAPV.W/DMAPV.span*zm;D.px=A.x-(A.sx-W/2)/sc-P.x;D.pz=A.z-(A.sy-H/2)/sc-(P.z-q.OZ)}
 try{dmapFullDraw(q)}catch(e){conLog('error','map zoom: '+e.message)}if(zm!==D.zt)D.zr=requestAnimationFrame(dmapGlide)}
/* the mouse wheel: a notch is about x1.25, trackpads zoom smoothly */
xpMapZoom=function(e){const D=DMAP;if(!D||!D.open||!D.fc)return;e.preventDefault();const r=D.fc.getBoundingClientRect(),d=e.deltaMode==1?e.deltaY*33:e.deltaMode==2?e.deltaY*400:e.deltaY;
 dmapZoomTo(Math.exp(-Math.max(-300,Math.min(300,d))*.0022),(e.clientX-r.left)*D.fc.width/r.width,(e.clientY-r.top)*D.fc.height/r.height)};
/* pinch, the − / + buttons, and the toggles and key under the map */
dmapTouchWire=function(){const D=DMAP;if(!D||!D.fc||D.fc.dataset.wired)return;D.fc.dataset.wired=1;const fc=D.fc;const dist=t=>Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY);
 const cvp=(cx,cy)=>{const r=fc.getBoundingClientRect();return[(cx-r.left)*fc.width/r.width,(cy-r.top)*fc.height/r.height]};
 fc.addEventListener('touchstart',e=>{e.stopPropagation();e.preventDefault();if(e.touches.length==2)D.pinch={d:dist(e.touches),zm:D.zr?D.zt:(D.zm||1)}},{passive:false});
 fc.addEventListener('touchmove',e=>{e.stopPropagation();e.preventDefault();if(e.touches.length==2&&D.pinch){const t=e.touches,want=Math.max(1,Math.min(6,D.pinch.zm*dist(t)/Math.max(1,D.pinch.d))),cur=D.zr?D.zt:(D.zm||1);if(Math.abs(want-cur)>.001){const[sx,sy]=cvp((t[0].clientX+t[1].clientX)/2,(t[0].clientY+t[1].clientY)/2);dmapZoomTo(want/cur,sx,sy)}}},{passive:false});
 fc.addEventListener('touchend',e=>{e.stopPropagation();if(e.touches.length<2)D.pinch=null},{passive:false});fc.addEventListener('click',e=>e.stopPropagation());
 const hd=D.full.firstChild.firstChild;if(hd&&!hd.querySelector('.dmz')){const z=document.createElement('span');z.style.cssText='display:inline-flex;gap:6px;align-items:center';z.innerHTML='<span class="dmz" data-d="-" style="font-size:22px;cursor:pointer;padding:0 10px;border:1px solid #d4a850;border-radius:8px;line-height:30px">−</span><span class="dmz" data-d="+" style="font-size:22px;cursor:pointer;padding:0 10px;border:1px solid #d4a850;border-radius:8px;line-height:30px">+</span>';const x=hd.lastChild;hd.insertBefore(z,x);
  for(const b of z.querySelectorAll('.dmz')){const f=e=>{e.preventDefault();e.stopPropagation();dmapZoomTo(b.dataset.d=='+'?1.6:1/1.6,fc.width/2,fc.height/2);try{snd(600,.03)}catch(x2){}};b.addEventListener('click',f);b.addEventListener('touchstart',f,{passive:false})}}
 const lg=D.full.firstChild.lastChild;if(lg&&lg!==fc)dmLegend(lg)};
/* under the map: what to show (remembered), the colours of the kinds of place, and the old key */
function dmLegend(lg){const S=DM2.show,T=[['places','📍 Places'],['base','🏰 Base buildings'],['phones','☎️ Phone booths'],['stunts','🛹 Stunt jumps']];
 const pill=(k,t)=>'<span data-k="'+k+'" style="cursor:pointer;padding:1px 9px;border-radius:11px;border:1px solid #d4a850;white-space:nowrap;'+(S[k]?'background:#d4a850;color:#24180a':'color:#e8d8b0;opacity:.8')+'">'+t+'</span>';
 const sw=Object.values(DMKIND).map(K=>'<span style="white-space:nowrap"><span style="display:inline-block;width:10px;height:10px;border-radius:2px;vertical-align:-1px;background:'+K.roof+';border:2px solid '+K.edge+'"></span> '+K.name+'</span>').join(' ');
 lg.style.lineHeight='1.45';lg.style.maxWidth='min(92vw,900px)';
 lg.innerHTML='<div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-bottom:3px">'+T.map(([k,t])=>pill(k,t)).join('')+'</div>'+
  '<div style="font-size:12px;display:flex;flex-wrap:wrap;gap:3px 10px;justify-content:center">'+sw+'</div>'+
  '<div style="font-size:12px"><span style="color:#ffe040">➤</span> you &nbsp; <span style="color:#7ab8ff">●</span> friends &nbsp; <span style="color:#fff">▬</span> vehicles &nbsp; <span style="color:#ff5050">●</span> Seek &nbsp; <span style="color:#3a8a2a">●</span> cactus &nbsp; <span style="color:#d03030">●</span> barrel &nbsp;·&nbsp; click a name to warp · wheel, pinch or − / + to zoom · M to close</div>';
 if(!lg.dataset.dm2){lg.dataset.dm2=1;const tap=e=>{e.stopPropagation();const t=e.target.closest&&e.target.closest('[data-k]');if(!t)return;e.preventDefault();const k=t.dataset.k;S[k]=S[k]?0:1;try{localStorage.setItem('doorsMapShow',JSON.stringify(S))}catch(x){}dmLegend(lg);try{const q=BUS.ride;if(q&&DMAP.open)dmapFullDraw(q)}catch(x){}};lg.addEventListener('click',tap);lg.addEventListener('touchstart',tap,{passive:false})}}

/* ---------- the map itself (the base dmapDraw hands over to this; the wrappers of later modules still draw on top) ---------- */
function dmTw(x,t){const k=x.font+'|'+t;let w=DM2.tw.get(k);if(w==null){w=x.measureText(t).width;if(DM2.tw.size>600)DM2.tw.clear();DM2.tw.set(k,w)}return w}
/* wrecked things: the list of obstacles that have a kind (cactus, rock, barrel, pump), made again when q.obs changes */
function dmKd(q){if(DM2.kdQ!==q||DM2.kdN!==q.obs.length){DM2.kdQ=q;DM2.kdN=q.obs.length;DM2.kd=q.obs.filter(o=>o.kd=='cactus'||o.kd=='rock'||o.kd=='barrel'||o.kd=='pump')}return DM2.kd}
function dm2Draw(q,cv,cx,cz,sc,full){const x=cv.getContext('2d'),W=cv.width,H=cv.height,X=wx=>W/2+(wx-cx)*sc,Y=wz=>H/2+(wz-cz)*sc;x.save();x.fillStyle='#8a6a40';x.fillRect(0,0,W,H);
 /* zoomed in past the background's own detail, the static part is painted sharp for this view; while the zoom glides
    or the map is dragged the background is used (cheaper), and the sharp one comes back as soon as it stops */
 const bg=dmapBg(q),bk=bg.width/DMW.S,busy=full&&(DMAP.zr||performance.now()-(DMAP.dragT||0)<200);if(full&&!busy&&sc>bk*1.15)x.drawImage(dmStatic(q,W,H,cx,cz,sc),0,0);else x.drawImage(bg,X(DMW.x0),Y(DMW.z0),DMW.S*sc,DMW.S*sc);
 const zm=full?(DMAP.zm||1):0,F='Arial,sans-serif';
 /* things that can be wrecked: cacti, rocks, barrels (gone once they are); on the minimap only within 90 m */
 if(!full||zm>=2.2){const hw=full?W/2/sc+4:90,hh=full?H/2/sc+4:90;for(const o of dmKd(q)){if(o.dead)continue;const ox=(o.x0+o.x1)/2,oz=(o.z0+o.z1)/2;if(Math.abs(ox-cx)>hw||Math.abs(oz-cz)>hh)continue;x.fillStyle=o.kd=='cactus'?'#3a8a2a':o.kd=='rock'?'#8a8278':o.kd=='barrel'?'#d03030':'#c02020';x.beginPath();x.arc(X(ox),Y(oz),Math.max(full?3.5:2.5,(o.x1-o.x0)*sc*.45),0,7);x.fill()}}
 /* vehicles: rounded bodies, coloured by type */for(const v of q.vehs){if(vehOnHwy(v)||v.gone)continue;x.save();x.translate(X(v.x),Y(v.z));x.rotate(-v.h);const w=Math.max(5,v.K.w*sc),l=Math.max(9,v.K.len*sc);x.fillStyle=v.wreck?'#3a3a3a':v.K.tank?'#5a6a3a':v.K.bus?'#d8701a':'#'+v.K.col.toString(16).padStart(6,'0');x.strokeStyle='#111';x.lineWidth=full?2:1.5;x.beginPath();if(x.roundRect)x.roundRect(-w/2,-l/2,w,l,Math.min(w,l)*.3);else x.rect(-w/2,-l/2,w,l);x.fill();x.stroke();x.fillStyle='rgba(180,220,255,.85)';x.fillRect(-w*.35,-l*.32,w*.7,l*.14);x.restore()}
 x.textAlign='center';x.textBaseline='middle';
 /* labels: a list of boxes already used, so labels that would land on another are left out */
 const placed=[],fits=r=>r[0]>=-20&&r[2]<=W+20&&!placed.some(p=>r[0]<p[2]&&r[2]>p[0]&&r[1]<p[3]&&r[3]>p[1]),hits=full?[]:null;
 const late=[],badge=(px,py,ic,r,defer)=>{if(defer){late.push(()=>badge(px,py,ic,r));return[px-r,py-r,px+r,py+r]}x.fillStyle='#fbf3e2';x.strokeStyle='#5a4428';x.lineWidth=full?1.5:2;x.beginPath();x.arc(px,py,r,0,7);x.fill();x.stroke();x.font=Math.round(r*1.15)+'px '+F;x.fillStyle='#000';x.fillText(ic,px,py+1);return[px-r,py-r,px+r,py+r]};
 const tag=(px,py,t,sz,wt,force,dark,defer)=>{x.font=wt+' '+sz+'px '+F;const w=dmTw(x,t)+(sz>14?14:10),h=sz+(sz>14?8:6),r=[px-w/2,py,px+w/2,py+h];if(!force&&!fits(r))return null;placed.push(r);if(defer){late.push(()=>tag(px,py,t,sz,wt,1,dark));placed.pop();return r}
  x.fillStyle=dark?'rgba(30,32,26,.85)':'rgba(251,243,226,.93)';x.fillRect(r[0],r[1],w,h);x.strokeStyle=dark?'rgba(0,0,0,.6)':'rgba(60,40,20,.55)';x.lineWidth=1;x.strokeRect(r[0]+.5,r[1]+.5,w-1,h-1);x.fillStyle=dark?'#e8f0d0':'#2b2218';x.fillText(t,px,py+h/2+1);return r};
 const inV=(px,py,m)=>px>-m&&py>-m&&px<W+m&&py<H+m,locs=q.locs||[];
 if(full){const S=DM2.show,hit=(r,l)=>{if(r)hits.push([r[0],r[1],r[2],r[3],l])},byNm=n=>locs.find(l=>l.nm===n);
  /* 1. the area names, always */for(const a of DMAREAS){const px=X(a[7]),py=Y(a[8]);if(!inV(px,py,120))continue;const r=tag(px,py+(zm>1.5?2:-2),a[1]+' '+a[0].toUpperCase(),zm>2?17:14,700,1,0,1);placed.push(r);
   const l=byNm(DMWARP[a[0]]||a[0]);hit(r,l?{nm:a[0],ic:a[1],x:l.x,z:l.z}:{nm:a[0],ic:a[1],x:a[7],z:a[8]})}
  /* the other big names */for(const l of locs){if(dmCls(l.nm)!='big')continue;const px=X(l.x),py=Y(l.z);if(!inV(px,py,120))continue;const b=badge(px,py,l.ic,13,1);placed.push(b);hit(b,l);const r=tag(px,py+16,l.nm,14,700,1,0,1);placed.push(r);hit(r,l)}
  /* 2. places, from zoom 1.6 */if(S.places&&zm>=1.6){const L=[];for(const l of locs){if(dmCls(l.nm)!='place'||DMDROP.has(l.nm))continue;const px=X(l.x),py=Y(l.z);if(inV(px,py,40))L.push([px,py,l])}
   for(const[px,py,l]of L)placed.push([px-11,py-11,px+11,py+11]);for(const[px,py,l]of L){hit(badge(px,py,l.ic,11),l);hit(tag(px,py+13,l.nm,13,600,0),l)}}
  /* 3. the base's buildings, from zoom 2 */if(S.base&&zm>=2){const a=DMAREAS[2];for(const[n,bx,bz]of MAPBN){const px=X(bx),py=Y(bz);if(!inV(px,py,60))continue;hit(tag(px,py-9,n,13,700,0,1),{nm:n,ic:a[1],x:bx,z:bz,base:1})}}
  /* phone booths and stunt jumps, when switched on */for(const[on,c,ic]of[[S.phones,'phone','☎️'],[S.stunts,'stunt','🛹']]){if(!on)continue;for(const l of locs){if(dmCls(l.nm)!=c)continue;const px=X(l.x),py=Y(l.z);if(!inV(px,py,40))continue;hit(badge(px,py,ic,10),l);if(zm>=1.6)hit(tag(px,py+12,l.nm.replace(/^Phone booth \((.*)\)$/,'Phone: $1').replace(/^Stunt: /,''),12,600,0),l)}}
  for(const f of late)f();DM2.hits=hits}
 else{/* the minimap: icons for every place in view, names for the three nearest (within 80 m) */
  if(!(q.deep===5))placed.push([W/2-96,24,W/2+96,86]);/* (the banner's spot) */
  const near=[];for(const l of locs){if(DMDROP.has(l.nm))continue;const px=X(l.x),py=Y(l.z);if(!inV(px,py,12))continue;badge(px,py,l.ic,12);const c=dmCls(l.nm);if(c=='place'||c=='big'){const d=Math.hypot(l.x-cx,l.z-cz);if(d<80)near.push([d,px,py,l])}}
  near.sort((a,b)=>a[0]-b[0]);for(let i=0;i<near.length&&i<3;i++){const[d,px,py,l]=near[i];tag(px,py+15,l.nm,21,600,0)}
  /* in Fort Blackout: the base's buildings within 70 m */const ar=dmArea(cx,cz);if(ar&&ar===DMAREAS[2])for(const[n,bx,bz]of MAPBN){if(Math.hypot(bx-cx,bz-cz)>70)continue;tag(X(bx),Y(bz)-10,n,20,700,0,1)}}
 /* friends and Seek */for(const id in q.vnet.rem){const r=q.vnet.rem[id];if(Date.now()-r.t>3000)continue;x.fillStyle='#3a8aff';x.strokeStyle='#fff';x.lineWidth=2;x.beginPath();x.arc(X(r.x),Y(r.z),full?8:6,0,7);x.fill();x.stroke();if(full&&r.nm){x.font='bold 13px Arial,sans-serif';x.fillStyle='#e8f2ff';x.fillText(r.nm,X(r.x),Y(r.z)-15)}if(r.cop&&r.con){x.fillStyle=(q.rt*6|0)%2?'#ff2020':'#2040ff';x.beginPath();x.arc(X(r.cx),Y(r.cz),full?9:7,0,7);x.fill()}}
 if(q.heli&&q.heli.st!='park'){x.font=(full?22:16)+'px Arial,sans-serif';x.fillText('🚁',X(q.heli.x),Y(q.heli.z))}if(q.hwp&&!q.hwp.v.wreck&&!q.hwp.v.gone){const hv=q.hwp.v,pu=q.hwp.st=='pursue';x.fillStyle=pu?((q.rt*6|0)%2?'#ff2020':'#2040ff'):'#1a1a2a';x.beginPath();x.arc(X(hv.x),Y(hv.z),full?8:6,0,7);x.fill();x.strokeStyle='#d4a020';x.lineWidth=2;x.stroke();if(full){x.font='15px Arial,sans-serif';x.fillText('🚔',X(hv.x),Y(hv.z)-14)}}
 if(q.cop){const cv2=q.cop.fm?{x:q.cop.fx,z:q.cop.fz}:q.cop.v;x.fillStyle=(q.rt*6|0)%2?'#ff2020':'#2040ff';x.beginPath();x.arc(X(cv2.x),Y(cv2.z),full?11:9,0,7);x.fill();x.strokeStyle='#fff';x.lineWidth=2;x.stroke();x.font=(full?22:16)+'px Arial,sans-serif';x.fillText(q.cop.fm?'👁️':'🚓',X(cv2.x),Y(cv2.z)-(full?22:16))}
 /* you: an arrow with a soft view cone */const px=P.x,pz=P.z-q.OZ;x.save();x.translate(X(px),Y(pz));x.rotate(-P.yaw);const cg=x.createRadialGradient(0,0,2,0,0,full?70:46);cg.addColorStop(0,'rgba(255,240,120,.45)');cg.addColorStop(1,'rgba(255,240,120,0)');x.fillStyle=cg;x.beginPath();x.moveTo(0,0);x.arc(0,0,full?70:46,-Math.PI/2-.5,-Math.PI/2+.5);x.closePath();x.fill();
 x.fillStyle='#ffe040';x.strokeStyle='#000';x.lineWidth=2;const a=full?15:12;x.beginPath();x.moveTo(0,-a);x.lineTo(a*.65,a*.7);x.lineTo(0,a*.35);x.lineTo(-a*.65,a*.7);x.closePath();x.fill();x.stroke();x.restore();
 /* compass and scale */if(full){x.save();x.translate(W-46,46);x.fillStyle='rgba(36,24,10,.75)';x.beginPath();x.arc(0,0,30,0,7);x.fill();x.fillStyle='#ff5040';x.beginPath();x.moveTo(0,-24);x.lineTo(7,0);x.lineTo(-7,0);x.closePath();x.fill();x.fillStyle='#f0e0c0';x.beginPath();x.moveTo(0,24);x.lineTo(7,0);x.lineTo(-7,0);x.closePath();x.fill();x.font='bold 13px Arial,sans-serif';x.fillStyle='#fff';x.fillText('N',0,-34+48*0-0);x.restore();
  const sl=50*sc;x.fillStyle='rgba(36,24,10,.75)';x.fillRect(16,H-40,sl+20,28);x.fillStyle='#fff';x.fillRect(26,H-22,sl,4);x.fillRect(26,H-28,3,10);x.fillRect(26+sl-3,H-28,3,10);x.font='bold 12px Arial,sans-serif';x.fillText('50 m',26+sl/2,H-31)}
 else{x.font='bold 15px Arial,sans-serif';x.fillStyle='#fff';x.strokeStyle='#000';x.lineWidth=3;x.strokeText('N',W/2,14);x.fillText('N',W/2,14)}
 if(!full&&!(q.deep===5))dmBanner(q,x,W,cx,cz);
 x.restore()}
/* the minimap's banner: the area you are in, and in Fort Blackout the building next to you */
function dmBanner(q,x,W,px,pz){const a=dmArea(px,pz);let t1=a?a[0]:'',t2='';if(!a){for(const z of DMZONES)if(px>=z[1]&&px<=z[2]&&pz>=z[3]&&pz<=z[4]){t1=z[0];break}}if(!t1)t1=q.deep?'Underground':'Open desert';
 if(a&&a===DMAREAS[2]){let bd=40;for(const b of MAPBN){const d=Math.hypot(b[1]-px,b[2]-pz);if(d<bd){bd=d;t2=b[0]}}}
 t1=t1.toUpperCase();const F='Arial,sans-serif';x.save();x.font='700 24px '+F;const w1=dmTw(x,t1);x.font='600 20px '+F;const w2=t2?dmTw(x,t2):0,w=Math.min(t2?176:188,Math.max(w1,w2)+24),h=t2?54:34,y0=t2?28:30;
 x.fillStyle='rgba(43,34,24,.85)';x.beginPath();if(x.roundRect)x.roundRect(W/2-w/2,y0,w,h,8);else x.rect(W/2-w/2,y0,w,h);x.fill();x.strokeStyle='rgba(212,168,80,.8)';x.lineWidth=1.5;x.stroke();
 x.textAlign='center';x.textBaseline='middle';x.fillStyle='#f8f0e0';x.font='700 24px '+F;x.fillText(t1,W/2,y0+18,w-14);if(t2){x.font='600 20px '+F;x.fillStyle='#e8d8b0';x.fillText(t2,W/2,y0+40,w-14)}x.restore()}
