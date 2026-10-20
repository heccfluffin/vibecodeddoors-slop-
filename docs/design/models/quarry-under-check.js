/* Checks every room and every version in quarry-under.js, in its own space (entry at 0,0, running to -z):
   - solid things (columns, cribs, puffballs, desks...) sit inside the floor and don't overlap each other or a hazard;
   - hazards (chasms, lava, pits, deep water) stay inside the room (a chasm or river may run 1.5 m into a wall);
   - the entry, every exit and every goal (islands, ledges, the far side of a sinkhole...) are joined by floor you can
     walk, wade, bridge, ledge, raft or jump (stepping stones up to 0.7 m apart);
   - nothing solid or hazardous within 1.5 m of a doorway.
   Run: node quarry-under-check.js   (prints a line per problem, then a summary) */
const U=require('./quarry-under.js');
const D2=(ax,az,bx,bz)=>Math.hypot(ax-bx,az-bz);
function segD(px,pz,a,b){const vx=b[0]-a[0],vz=b[1]-a[1],L=vx*vx+vz*vz||1,t=Math.max(0,Math.min(1,((px-a[0])*vx+(pz-a[1])*vz)/L));return D2(px,pz,a[0]+vx*t,a[1]+vz*t)}
const polyD=(px,pz,pts)=>{let d=1e9;for(let i=1;i<pts.length;i++)d=Math.min(d,segD(px,pz,pts[i-1],pts[i]));return d};
function inFloor(d,x,z,m){m=m||0;for(const s of d.shp){
 if(s.k=='path'&&polyD(x,z,s.pts)<s.w/2-m)return true;
 if(s.k=='blob'&&Math.hypot((x-s.cx)/(s.rx*.92-m),(z-s.cz)/(s.rz*.92-m))<1)return true;
 if(s.k=='rect'&&x>s.x0+m&&x<s.x1-m&&z>s.z0+m&&z<s.z1-m)return true}return false}
/* solid things as circles */
function solids(d){const o=[];for(const f of d.fx){
 if(f.k=='cols')for(const p of f.pts)o.push({x:p[0],z:p[1],r:f.r||1,n:'column'});
 if(f.k=='cribs')for(const p of f.pts)o.push({x:p[0],z:p[1],r:.8,n:'crib'});
 if(f.k=='puff')for(const p of f.pts)o.push({x:p[0],z:p[1],r:1.7,n:'puffball'});
 if(f.k=='racks')for(const p of f.pts)o.push({x:p[0],z:p[1],r:.5,n:'rack'});
 if(f.k=='blk')for(const p of f.pts)o.push({x:p[0],z:p[1],r:f.r||.6,n:f.n||'block'});
 if(f.k=='desk')o.push({x:f.x,z:f.z,r:.7,n:'desk'});
 if(f.k=='drum')o.push({x:f.x,z:f.z,r:1.5,n:'drum'});
 if(f.k=='gey')o.push({x:f.x,z:f.z,r:.9,n:'geyser'});
 if(f.k=='rubble')o.push({x:f.x,z:f.z,r:1,n:'rubble'});
 if(f.k=='muck')o.push({x:f.cx,z:f.cz,r:Math.min(f.rx,f.rz)*.9,n:'muck pile'});}
 return o}
/* hazards: a test function (true = you can't stand here) */
function hazards(d){const h=[];for(const f of d.fx){
 if(f.k=='chasm'||f.k=='lava')h.push({n:f.k,t:(x,z)=>polyD(x,z,f.pts)<f.w/2,pts:f.pts,poly:1});
 if(f.k=='lake')h.push({n:'lava lake',t:(x,z)=>Math.hypot((x-f.cx)/f.rx,(z-f.cz)/f.rz)<1&&(f.noisle||D2(x,z,f.cx,f.cz)>1.1)});
 if(f.k=='pit')h.push({n:'pit',t:(x,z)=>Math.hypot((x-f.cx)/f.rx,(z-f.cz)/f.rz)<1});
 if(f.k=='moat')h.push({n:'moat',t:(x,z)=>Math.abs(D2(x,z,f.cx,f.cz)-f.r)<f.w/2});
 if(f.k=='water'&&f.deep)h.push({n:'deep water',t:(x,z)=>Math.hypot((x-f.cx)/f.rx,(z-f.cz)/f.rz)<1});
 if(f.k=='stream'&&f.deep)h.push({n:'deep stream',t:(x,z)=>polyD(x,z,f.pts)<(f.w||1.2)/2});}
 return h}
/* ways across hazards */
function crossing(d,x,z){for(const f of d.fx){
 if(f.k=='bridge'&&segD(x,z,[f.x0,f.z0],[f.x1,f.z1])<.9)return true;
 if(f.k=='trestle'&&segD(x,z,[f.x0,f.z0],[f.x1,f.z1])<1.2)return true;
 if((f.k=='ledge2'||f.k=='walk')&&polyD(x,z,f.pts)<(f.k=='walk'?.6:.5))return true;
 if((f.k=='rope'||f.k=='zip')&&polyD(x,z,f.pts)<1)return true;
 if(f.k=='stones')for(const p of f.pts)if(D2(x,z,p[0],p[1])<.9)return true;   /* .55 stone + a short jump */
 if(f.k=='ledge'&&x>f.x0&&x<f.x1&&z>f.z0&&z<f.z1)return true;
 if(f.k=='isle2'&&D2(x,z,f.cx,f.cz)<f.r)return true;}
 return false}
function checkRoom(type,d,tag){
 const P=[],S=solids(d),H=hazards(d),bad=(m)=>P.push(tag+': '+m);
 for(const s of S){for(let a=0;a<8;a++){const x=s.x+Math.cos(a*Math.PI/4)*s.r,z=s.z+Math.sin(a*Math.PI/4)*s.r;if(!inFloor(d,x,z,.2)){bad(s.n+' at '+s.x+','+s.z+' goes into the wall');break}}
  for(const h of H)for(let a=0;a<9;a++){const x=s.x+(a<8?Math.cos(a*Math.PI/4)*s.r:0),z=s.z+(a<8?Math.sin(a*Math.PI/4)*s.r:0);if(h.t(x,z)){bad(s.n+' at '+s.x+','+s.z+' stands in the '+h.n);break}}}
 for(let i=0;i<S.length;i++)for(let j=i+1;j<S.length;j++)if(D2(S[i].x,S[i].z,S[j].x,S[j].z)<S[i].r+S[j].r+.15)bad(S[i].n+' at '+S[i].x+','+S[i].z+' overlaps '+S[j].n+' at '+S[j].x+','+S[j].z);
 for(const h of H)if(h.poly){const p=h.pts;for(let i=0;i<p.length;i++){const end=i==0||i==p.length-1;if(!inFloor(d,p[i][0],p[i][1],end?-1.5:0))bad(h.n+' point '+p[i]+' is outside the room')}}
 /* doorways: entry and exits */
 const doors=[[0,-.6]].concat(d.ex.map(e=>{const v=U.ugRot(0,-1,e[2]);return[e[0]-v[0]*.6,e[1]-v[1]*.6]}));
 for(const q of doors){for(const s of S)if(D2(q[0],q[1],s.x,s.z)<s.r+1.5)bad('doorway '+q+' blocked by '+s.n);
  for(const h of H){let hit=false;for(let a=0;a<12&&!hit;a++)for(const rr of[0,.6,1.2]){const x=q[0]+Math.cos(a/12*Math.PI*2)*rr,z=q[1]+Math.sin(a/12*Math.PI*2)*rr;if(inFloor(d,x,z)&&h.t(x,z)&&!crossing(d,x,z)){hit=true;break}}if(hit)bad('doorway '+q+' is within 1.2 m of the '+h.n)}}
 /* walk grid */
 let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const f of d.foot){x0=Math.min(x0,f[0]);x1=Math.max(x1,f[1]);z0=Math.min(z0,f[2]);z1=Math.max(z1,f[3])}
 const g=.25,W=Math.ceil((x1-x0)/g)+3,Hh=Math.ceil((z1-z0)/g)+3,ok=new Uint8Array(W*Hh);
 const cx=i=>x0-g+i*g,cz=j=>z0-g+j*g;
 for(let i=0;i<W;i++)for(let j=0;j<Hh;j++){const x=cx(i),z=cz(j);let w=inFloor(d,x,z,.3);if(w)for(const s of S)if(D2(x,z,s.x,s.z)<s.r+.25){w=false;break}
  if(w)for(const h of H)if(h.t(x,z)){w=crossing(d,x,z);break}
  ok[i*Hh+j]=w?1:0}
 const idx=(x,z)=>{const i=Math.round((x-cx(0))/g),j=Math.round((z-cz(0))/g);let best=-1,bd=1e9;for(let a=-3;a<=3;a++)for(let b=-3;b<=3;b++){const ii=i+a,jj=j+b;if(ii<0||jj<0||ii>=W||jj>=Hh||!ok[ii*Hh+jj])continue;const dd=a*a+b*b;if(dd<bd){bd=dd;best=ii*Hh+jj}}return best};
 const st=idx(0,-.8);if(st<0){bad('no floor at the entry');return P}
 const seen=new Uint8Array(W*Hh),q=[st];seen[st]=1;while(q.length){const c=q.pop(),i=Math.floor(c/Hh),j=c%Hh;for(const [a,b] of[[1,0],[-1,0],[0,1],[0,-1]]){const ii=i+a,jj=j+b;if(ii<0||jj<0||ii>=W||jj>=Hh)continue;const n=ii*Hh+jj;if(ok[n]&&!seen[n]){seen[n]=1;q.push(n)}}}
 const goals=d.ex.map(e=>{const v=U.ugRot(0,-1,e[2]);return{p:[e[0]-v[0]*.8,e[1]-v[1]*.8],n:'exit '+e[0]+','+e[1]}});
 for(const f of d.fx)if(f.k=='goal')goals.push({p:[f.x,f.z],n:f.n||'goal'});
 for(const f of d.fx)if(f.k=='lake'&&!f.noisle)goals.push({p:[f.cx,f.cz],n:'lava lake island'});
 for(const f of d.fx)if(f.k=='isle2')goals.push({p:[f.cx,f.cz],n:'obsidian island'});
 for(const f of d.fx)if(f.k=='ledge')goals.push({p:[(f.x0+f.x1)/2,(f.z0+f.z1)/2],n:'ledge'});
 for(const G of goals){const k=idx(G.p[0],G.p[1]);if(k<0||!seen[k])bad(G.n+' can\'t be reached from the entry')}
 return P;
}
let all=[],n=0;
const types=Object.keys(U.UGP).filter(k=>!['decline','ladder','old','drive','bend','tee','cross','cpass','cbend'].includes(k));
for(const t of types){const V=U.UGV[t]||[{nm:U.UGP[t].nm}];
 V.forEach((v,vi)=>{for(let s=1;s<=6;s++){const R=U.ugRng(s*977+vi);const d=U.UGP[t].mk(R);if(v.fx)d.fx=v.fx(d,R);d.fx=d.fx||[];n++;
  for(const m of checkRoom(t,d,t+' / '+v.nm+(s>1?' (roll '+s+')':'')))if(!all.includes(m.replace(/ \(roll \d\)/,'')))all.push(m.replace(/ \(roll \d\)/,''))}})}
/* stations */
for(let L=1;L<=3;L++){const V=U.UGV['station'+L];V.forEach((v,vi)=>{let d;for(let s=1;s<200;s++){d=U.ugStation(L,U.ugRng(s));if(d.v==vi)break}n++;
 for(const m of checkRoom('station',Object.assign({},d,{ex:d.ex.filter(e=>e[2]!=2)}),'station '+L+' / '+v.nm))if(!all.includes(m))all.push(m)})}
for(const m of all)console.log(m);
console.log(all.length?'\n'+all.length+' problems':'\nall clear','('+n+' rooms checked, '+Object.values(U.UGV).reduce((a,v)=>a+v.length,0)+' versions)');
