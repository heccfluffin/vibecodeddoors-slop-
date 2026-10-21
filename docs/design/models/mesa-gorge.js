/* =====================================================================================================
   LOOKOUT MESA and DEVIL'S GORGE (spec: docs/design/mesa-gorge.md). Needs fort-kit.js and route13.js.
   Desert-local x/z (+z north), ground y 0. New globals start with mg.

   Batch 1: the mesa cliffs, rim, scree and the ramp road.
     mgMesa(g)       the cliffs all round the mesa (one mesh), the cap-rock lip and rim boulders along the top edge,
                     shrubs and dry grass on top, and the skirt of fallen rock round the foot.
                     Returns {obs, parts:{cliff}}. obs: boxes along the foot of the cliffs (so you can't walk into
                     the rock), the big fallen rocks, and the rim boulders where they stand on the top.
     mgMesaRoad(g)   the ramp road up the east side: a gravel road surface with ruts, a dressed-stone retaining wall
                     with a timber guard rail on the south (drop) side, a rock shoulder on the north side, and the two
                     signs (MESA ROAD at the bottom, LOOKOUT MESA ELEV. 14 m at the top). Returns {obs}.
   ===================================================================================================== */
const MG={x0:-400,x1:-280,z0:-1600,z1:-1500,H:14,
 road:{s:-220,e:-280,z0:-1554,z1:-1546},      /* the ramp road (its q.ramps entry is kept) */
 lane:[-341,-319],                            /* the Quarry Skip flight line, kept clear north and south */
 keep:[[-320,-1560,8],[-380,-1550,3],[-310,-1520,2.5],[-340,-1525,5],[-330,-1596,5],[-345,-1545,3]]};/* cabin, telescope, flagpole, campfire, binoculars, summit cairn */
function mgKit(){const k=rtKit();if(k._mg)return k._mg;const M=k.M,o={};let sd=8080;const r=()=>((sd=Math.imul(sd^sd>>>15,sd|1)+0x6d2b79f5|0)>>>0)/4294967296;o.r=r;
 o.sm=(a,b,v)=>{const t=Math.min(1,Math.max(0,(v-a)/(b-a)));return t*t*(3-2*t)};
 /* rock: pale grey-white so the vertex colours give the bands; thin strata lines, darker weathering streaks running down */
 o.ROCKT=k.tex(256,256,(c,w,h)=>{c.fillStyle='#e6e0d8';c.fillRect(0,0,w,h);for(let y=0;y<h;y+=3+(r()*6|0)){c.fillStyle='rgba(90,70,55,'+(.04+r()*.1)+')';c.fillRect(0,y,w,1+(r()*2|0))}
  for(let i=0;i<70;i++){const x=r()*w,l=20+r()*120,y=r()*h;const gr=c.createLinearGradient(0,y,0,y+l);gr.addColorStop(0,'rgba(70,50,40,.16)');gr.addColorStop(1,'rgba(70,50,40,0)');c.fillStyle=gr;c.fillRect(x,y,2+r()*5,l)}
  for(let i=0;i<2600;i++){c.fillStyle=r()<.5?'rgba(80,60,45,.14)':'rgba(255,250,240,.16)';c.fillRect(r()*w,r()*h,1+r()*2,1+r()*2)}});
 o.ROCK=M(0xffffff,{vertexColors:true,roughness:.97,map:o.ROCKT});
 o.STONE=M(0xffffff,{roughness:.95,map:k.tex(256,256,(c,w,h)=>{/* dressed sandstone blocks, 0.5 m courses, 2 m a tile */c.fillStyle='#6e5a48';c.fillRect(0,0,w,h);for(let row=0;row<4;row++){let x=-(row%2)*40;while(x<w){const bw=56+r()*40;const v=150+r()*30|0;c.fillStyle='rgb('+(v+40)+','+(v+10)+','+(v-25)+')';c.fillRect(x+2,row*64+2,bw-4,60);for(let i=0;i<40;i++){c.fillStyle='rgba(90,60,40,.15)';c.fillRect(x+2+r()*(bw-6),row*64+2+r()*58,2,2)}x+=bw}}})});o.STONE.map.repeat.set(.5,.5);
 o.ROAD=M(0xffffff,{roughness:1,map:k.tex(256,256,(c,w,h)=>{/* packed gravel; u across the road, v along it: two tyre ruts and a grassy hump in the middle */c.fillStyle='#a8916e';c.fillRect(0,0,w,h);
  for(const x of[.27,.73]){const gr=c.createLinearGradient(w*(x-.09),0,w*(x+.09),0);gr.addColorStop(0,'rgba(80,60,40,0)');gr.addColorStop(.5,'rgba(80,60,40,.35)');gr.addColorStop(1,'rgba(80,60,40,0)');c.fillStyle=gr;c.fillRect(w*(x-.09),0,w*.18,h)}
  for(let i=0;i<4200;i++){const v=r();c.fillStyle=v<.45?'rgba(70,55,40,'+(.1+r()*.2)+')':v<.85?'rgba(225,210,185,'+(.1+r()*.2)+')':'rgba(140,110,80,.3)';const s=1+r()*2.5;c.fillRect(r()*w,r()*h,s,s)}
  for(let i=0;i<60;i++){c.fillStyle='rgba(120,110,60,.35)';c.fillRect(w*.5+(r()-.5)*24,r()*h,1,3+r()*4)}
  for(const x of[.03,.97])for(let i=0;i<300;i++){c.fillStyle='rgba(120,90,60,.25)';c.fillRect(w*x+(r()-.5)*14,r()*h,2,2)}})});o.ROAD.map.repeat.set(1,4);
 o.TIMBER=M(0x8a6844,{roughness:.9,map:k.tex(64,256,(c,w,h)=>{c.fillStyle='#8a6844';c.fillRect(0,0,w,h);for(let i=0;i<70;i++){c.fillStyle='rgba(50,32,18,'+(.12+r()*.2)+')';c.fillRect(r()*w,r()*h,1,10+r()*60)}for(let i=0;i<30;i++){c.fillStyle='rgba(220,200,170,.15)';c.fillRect(r()*w,r()*h,1,8+r()*30)}})});
 o.PLANT=M(0xffffff,{vertexColors:true,roughness:.9,side:THREE.DoubleSide});
 k._mg=o;return o}
/* a rock: a lumpy, smooth-shaded stone r across, its foot just under the ground. sq squashes it (fallen slabs: .45) */
function mgRockGeo(rad,seed,sq,stretch){const ge=new THREE.SphereGeometry(1,10,7),P=ge.attributes.position;const s1=seed*1.37,s2=seed*.71+2;
 for(let i=0;i<P.count;i++){let x=P.getX(i),y=P.getY(i),z=P.getZ(i);const j=1+.22*Math.sin(x*2.1+y*1.7+s1)+.14*Math.sin(z*2.9-x*1.3+s2)+.08*Math.sin(y*4.3+z*3.1+s1*2);
  x*=j*(stretch||1);z*=j;y*=j*(sq||.75);if(y<-.15)y=-.15-(y+.15)*.2;P.setXYZ(i,x*rad,(y+.15*(sq||.75))*rad,z*rad)}ge.computeVertexNormals();return ge}
/* add a geometry to a merge list, placed, with one colour (multiplied by a little noise per vertex) */
function mgPut(list,ge,x,y,z,ry,col,rx,rz){ge.rotateY(ry||0);if(rx)ge.rotateX(rx);if(rz)ge.rotateZ(rz);ge.translate(x,y,z);const g2=ge.index?ge.toNonIndexed():ge;const n=g2.attributes.position.count,c=new Float32Array(n*3),P=g2.attributes.position;
 for(let i=0;i<n;i++){const v=1+.07*Math.sin(P.getX(i)*3.1+P.getY(i)*5.3)+.05*Math.sin(P.getZ(i)*4.7);c[i*3]=col[0]*v;c[i*3+1]=col[1]*v;c[i*3+2]=col[2]*v}g2.setAttribute('color',new THREE.BufferAttribute(c,3));list.push(g2)}
function mgMerge(list,mat){let n=0;list.forEach(g=>n+=g.attributes.position.count);const P=new Float32Array(n*3),N=new Float32Array(n*3),C=new Float32Array(n*3),U=new Float32Array(n*2);let o=0;
 list.forEach(g=>{P.set(g.attributes.position.array,o*3);N.set(g.attributes.normal.array,o*3);C.set(g.attributes.color.array,o*3);if(g.attributes.uv)U.set(g.attributes.uv.array,o*2);o+=g.attributes.position.count});
 const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.BufferAttribute(P,3));ge.setAttribute('normal',new THREE.BufferAttribute(N,3));ge.setAttribute('color',new THREE.BufferAttribute(C,3));ge.setAttribute('uv',new THREE.BufferAttribute(U,2));ge.computeBoundingSphere();
 const m=new THREE.Mesh(ge,mat);m.userData.noSeam=true;return m}

/* ---------- the cliffs ----------
   The cliff face is measured out from the old box's sides: off(s, y) is how far out the rock is at perimeter
   distance s and height y. Always 0.15 … 1.5 m (outside the box, never more than 1.5 m out).
   Bands, bottom to top: a darker base with a flared foot (0 … 3.8 m), the red middle in three layers with small
   ledges (3.8 … 11.6), a shadowed undercut (11.6 … 12.4), the pale cap rock jutting out over it (12.4 … 14). */
function mgOff(s,y){/* the outline closes at s 440 = s 0: blend the last 20 m into the start */if(s>420){const w=mgKit().sm(420,440,s);return mgOff0(s,y)*(1-w)+mgOff0(s-440,y)*w}return mgOff0(s,y)}
function mgFeat(s){/* what the cliff does at perimeter distance s: buttress (bt 0…1), gully (gl 0…1), and the cap rock's
   jointed blocks (hr: this block's random 0…1, a few broken off; edge: 0 at a joint) */
 const bt=Math.pow(Math.max(0,Math.sin(s*2*Math.PI/12.1+.9*Math.sin(s*.047)+1.3)),1.5)*(.6+.4*Math.sin(s*.13+.5));
 const gq=s/17.3+.35*Math.sin(s*.05),gp=gq-Math.floor(gq),gw=.05+.025*Math.sin(s*.11),gl=Math.exp(-Math.pow((gp-.5)/gw,2));
 const bq=s/4.3+.4*Math.sin(s*.21),bi=Math.floor(bq),bf=bq-bi,h1=Math.sin(bi*12.9898+3.1)*43758.5453,hr=h1-Math.floor(h1),edge=Math.min(1,Math.min(bf,1-bf)/.06);
 return{bt,gl,hr,edge}}
function mgOff0(s,y){const sm=mgKit().sm,{bt,gl,hr,edge}=mgFeat(s);
 const n=.06*Math.sin(s*.9+y*1.3)+.04*Math.sin(s*2.3-y*.7)+.03*Math.sin(y*3.1+s*.4);
 const LY=[0,3.8,6.4,9.2,11.6];let li=0;while(li<4&&y>=LY[li+1])li++;const lt=li<4?(y-LY[li])/(LY[li+1]-LY[li]):0;
 const ledge=li>0?.32*Math.pow(1-lt,3):0;/* each layer juts out a little at its foot: a ledge */
 const mid=.25+.85*bt+ledge+n+1.1*Math.pow(Math.max(0,1-y/3),2),midG=mid*(1-gl)+(.15+.1*Math.max(0,1-y/2))*gl;/* gullies cut right back */
 const und=.18+.25*bt+n*.4,capO=(hr<.12?.35:.6+.6*hr)*(.75+.25*edge)+n*.5,cap=capO*(1-gl*.7)+.15*gl*.7;
 const wc=sm(12.25,12.6,y),wu=sm(11.3,11.85,y)*(1-wc);return Math.max(.15,Math.min(1.5,midG*(1-wu-wc)+und*wu+cap*wc))}
function mgBandCol(y,s){/* rock colour by height: dark base, red layers with a shadow line under each ledge, the pale cap;
   gullies and dark streaks of desert varnish running down from the cap */const sm=mgKit().sm,{gl,edge}=mgFeat(s),j=.04*Math.sin(s*.31+y*.9)+.03*Math.sin(s*1.7);
 const base=[.56,.39,.29],red=[.76,.48,.33],red2=[.66,.41,.29],und=[.48,.34,.27],cap=[.89,.79,.63];
 let c;if(y<3.8){const t=sm(3.0,3.8,y);c=base.map((v,i)=>v+(red2[i]-v)*t)}else if(y<11.6){const li=y<6.4?0:y<9.2?1:2;c=[red,red2,red][li].slice()}
 else if(y<12.4){const t=sm(11.6,12.0,y);c=red.map((v,i)=>v+(und[i]-v)*t)}else{const t=sm(12.4,12.6,y);c=und.map((v,i)=>v+(cap[i]-v)*t);if(y>12.6)c=c.map(v=>v*(.88+.12*edge))}
 for(const ly of[3.8,6.4,9.2])if(y<ly&&y>ly-.35)c=c.map(v=>v*(.8+.2*(ly-y)/.35));
 const st=Math.pow(Math.max(0,Math.sin(s*1.37+2.1*Math.sin(s*.31))),14)*Math.min(1,y/5)*(y<12.4?1:.4);
 return c.map(v=>v*(1+j)*(1-.22*gl)*(1-.3*st))}
function mgMesa(g){const k=rtKit(),o=mgKit(),r=o.r,sm=o.sm,{x0,x1,z0,z1,H}=MG,obs=[];
 /* walk the outline anticlockwise from the south-west corner: south side (+x), east (+z), north (-x), west (-z).
    Each column: a point on the box edge b, its outward normal n, the perimeter distance s. Corners get a fan. */
 const sides=[[[x0,z0],[x1,z0],[0,-1]],[[x1,z0],[x1,z1],[1,0]],[[x1,z1],[x0,z1],[0,1]],[[x0,z1],[x0,z0],[-1,0]]];const cols=[];let S=0;
 const RD=MG.road,inNotch=(b,n)=>n[0]==1&&b[1]>RD.z0-.3&&b[1]<RD.z1+.5;
 sides.forEach(([a,b,n],si)=>{const L=Math.hypot(b[0]-a[0],b[1]-a[1]),N=Math.ceil(L/.7);for(let i=0;i<N;i++){const t=i/N,p=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];cols.push({b:p,n,s:S+t*L,cut:inNotch(p,n)})}S+=L;
  const nn=sides[(si+1)%4][2];for(let f=0;f<=6;f++){const an=Math.atan2(n[1],n[0]),bn=Math.atan2(nn[1],nn[0]);let d=bn-an;if(d<-Math.PI)d+=2*Math.PI;if(d>Math.PI)d-=2*Math.PI;const aa=an+d*f/6;cols.push({b:b.slice(),n:[Math.cos(aa),Math.sin(aa)],s:S,corner:[n,nn]})}});
 /* rows: heights up the cliff, then the lip over the top edge */
 const YS=[];for(let y=-.3;y<13.85;y+=.3)YS.push(y);YS.push(13.85);const NR=YS.length+4,NC=cols.length;
 const pos=new Float32Array(NC*NR*3),col=new Float32Array(NC*NR*3),uv=new Float32Array(NC*NR*2);const idx=[];
 cols.forEach((c,i)=>{const s=c.s,F=mgFeat(s),br=F.hr<.12||F.gl>.5,lh=br?-.18:(.06+.3*F.hr)*(.6+.4*F.edge);let rows=YS.map(y=>[mgOff(s,y),y]);const cp=mgOff(s,13.85);
  rows.push([cp-.04,14.0+lh],[Math.max(.3,cp*.5),14.07+Math.max(0,lh)*.6],[-.6,14.08],[-1.3,13.9]);
  /* near the road the rock steps back so the road's walls hide the cut edge */const nd=c.n[0]==1?Math.min(Math.abs(c.b[1]-(RD.z0-.3)),Math.abs(c.b[1]-(RD.z1+.5))):99,tp=c.n[0]==1&&nd<3?.35+.65*nd/3:1;
  rows.forEach(([of,y],j)=>{let px,pz;if(of<0&&c.corner){const[na,nb]=c.corner;px=c.b[0]+of*(na[0]+nb[0]);pz=c.b[1]+of*(na[1]+nb[1])}else{const f=of>0?of*tp:of;px=c.b[0]+c.n[0]*f;pz=c.b[1]+c.n[1]*f}
   const q=(i*NR+j);pos[q*3]=px;pos[q*3+1]=y;pos[q*3+2]=pz;const cc=y>13.8?[.88,.79,.64]:mgBandCol(y,s);const dk=y<0?.8:1;col[q*3]=cc[0]*dk;col[q*3+1]=cc[1]*dk;col[q*3+2]=cc[2]*dk;uv[q*2]=s/6;uv[q*2+1]=(y>13.9?14+(of<0?-of:0):y)/6})});
 for(let i=0;i<NC;i++){const i2=(i+1)%NC;if(cols[i].cut||cols[i2].cut)continue;for(let j=0;j<NR-1;j++){const a=i*NR+j,b=i2*NR+j,c=i2*NR+j+1,d=i*NR+j+1;idx.push(a,d,b,b,d,c)}}
 const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.BufferAttribute(pos,3));ge.setAttribute('color',new THREE.BufferAttribute(col,3));ge.setAttribute('uv',new THREE.BufferAttribute(uv,2));ge.setIndex(idx);ge.computeVertexNormals();
 const cliff=new THREE.Mesh(ge,o.ROCK);cliff.userData.noSeam=true;g.add(cliff);
 /* obstacles along the foot: 2 m pieces, out to the rock's furthest point under 2.5 m */
 sides.forEach(([a,b,n],si)=>{const L=Math.hypot(b[0]-a[0],b[1]-a[1]),s0=[0,120,220,340][si];for(let t=0;t<L;t+=2){let mo=0;for(let u=t;u<=Math.min(L,t+2);u+=.5)for(let y=0;y<2.5;y+=.5)mo=Math.max(mo,mgOff(s0+u,y));const e=mo-.1,p=[a[0]+(b[0]-a[0])*t/L,a[1]+(b[1]-a[1])*t/L],p2=[a[0]+(b[0]-a[0])*Math.min(L,t+2)/L,a[1]+(b[1]-a[1])*Math.min(L,t+2)/L];
  if(n[0]==1&&Math.max(p[1],p2[1])>RD.z0-1&&Math.min(p[1],p2[1])<RD.z1+1)continue;
  const xa=Math.min(p[0],p2[0]),xb=Math.max(p[0],p2[0]),za=Math.min(p[1],p2[1]),zb=Math.max(p[1],p2[1]);
  if(n[0])obs.push({x0:n[0]>0?x1:x0-e,x1:n[0]>0?x1+e:x0,z0:za,z1:zb});else obs.push({x0:xa,x1:xb,z0:n[1]>0?z1:z0-e,z1:n[1]>0?z1+e:z0})}});
 const clear=(x,z,m)=>{if(x>MG.lane[0]-m&&x<MG.lane[1]+m&&(z<z0+3||z>z1-3))return false;if(x>x1-4&&z>RD.z0-6-m&&z<RD.z1+8+m)return false;for(const[a,b,rr]of MG.keep)if(Math.hypot(x-a,z-b)<rr+m)return false;return true};
 const at=(s)=>{/* point on the box edge and its normal at perimeter distance s */s=((s%440)+440)%440;if(s<120)return[[x0+s,z0],[0,-1]];if(s<220)return[[x1,z0+s-120],[1,0]];if(s<340)return[[x1-(s-220),z1],[0,1]];return[[x0,z1-(s-340)],[-1,0]]};
 /* the rim: cap-rock boulders along the top edge, in clusters with gaps; solid where they stand on the top */
 const RL=[];for(let s=0;s<440;){const run=4+r()*9;for(let u=0;u<run;u+=.9+r()*1.4){const ss=s+u,[b,n]=at(ss);if(Math.abs(b[0]-x0)<1.5&&Math.abs(b[1]-z0)<1.5)continue;const of=-.7+r()*.9,x=b[0]+n[0]*of,z=b[1]+n[1]*of;if(!clear(x,z,1.5))continue;
   const rad=.3+r()*.55;mgPut(RL,mgRockGeo(rad,ss,.55+r()*.25,1+r()*.4),x,14.0,z,r()*6,[.86+r()*.06,.76+r()*.05,.6]);if(of<-.1&&rad>.35){const e=rad*.75;obs.push({x0:x-e,x1:x+e,z0:z-e,z1:z+e})}}s+=run+5+r()*14}
 g.add(mgMerge(RL,o.ROCK));
 /* talus: heaps of broken rock leaning on the cliff, where the face has crumbled (solid) */
 const TL=[];const TP=[];const heap=(b,n,W,D,Ht,s)=>{const tt=[-n[1],n[0]];
  const NU=16,NW=10,pos=[],col=[],uv=[],idx=[],sd=s*3.7;for(let iu=0;iu<=NU;iu++)for(let iw=0;iw<=NW;iw++){const u=(iu/NU*2-1)*W,w=-.8+(iw/NW)*(D+.8),q=Math.hypot(u/W,Math.max(0,w)/D);
   let h=Ht*Math.pow(Math.max(0,1-q),1.25)+.18*Math.sin(u*2.1+sd)*Math.sin(w*1.7+sd)+.12*Math.sin(u*4.3-w*3.1+sd);if(q>=1)h=-.1;h=Math.max(-.1,h-.05);
   const x=b[0]+tt[0]*u+n[0]*w,z=b[1]+tt[1]*u+n[1]*w;pos.push(x,h,z);const v=.92+.08*Math.sin(u*3.3+w*2.9+sd),pl=Math.max(0,Math.min(1,(Math.sin(u*.8+w*.6+sd)+Math.sin(u*1.9-w*1.3+sd*2)-.9)*1.5)),c=[.6+.26*pl,.41+.35*pl,.3+.3*pl];col.push(c[0]*v,c[1]*v,c[2]*v);uv.push(u/3,w/3)}
  for(let iu=0;iu<NU;iu++)for(let iw=0;iw<NW;iw++){const A=iu*(NW+1)+iw,B=(iu+1)*(NW+1)+iw,Cc=B+1,Dd=A+1;idx.push(A,Dd,B,B,Dd,Cc)}
  const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));ge.setAttribute('color',new THREE.Float32BufferAttribute(col,3));ge.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));ge.setIndex(idx);ge.computeVertexNormals();
  const tg=ge.toNonIndexed();/* check the winding faces up */{const P=tg.attributes.position,N=tg.attributes.normal;let up=0;for(let v=0;v<N.count;v++)up+=N.getY(v);if(up<0){ge.setIndex(idx.map((_,m)=>idx[m-m%3+[0,2,1][m%3]]));ge.computeVertexNormals()}}
  TL.push(ge.toNonIndexed());
  for(let m=0;m<10;m++){const u=(r()*2-1)*W*.8,w=r()*D*.9,q=Math.hypot(u/W,w/D);if(q>.95)continue;const h=Ht*Math.pow(1-q,1.25),rad=.25+r()*.5;mgPut(TL,mgRockGeo(rad,s+m,.6,1.2),b[0]+tt[0]*u+n[0]*w,h-.15,b[1]+tt[1]*u+n[1]*w,r()*6,r()<.4?[.86,.76,.6]:[.62,.42,.31])}
  const e1=[b[0]+tt[0]*W*.65,b[1]+tt[1]*W*.65],e2=[b[0]-tt[0]*W*.65+n[0]*D*.6,b[1]-tt[1]*W*.65+n[1]*D*.6];obs.push({x0:Math.min(e1[0],e2[0]),x1:Math.max(e1[0],e2[0]),z0:Math.min(e1[1],e2[1]),z1:Math.max(e1[1],e2[1])})};
 for(let tries=0;tries<200&&TP.length<18;tries++){const s=r()*440,[b,n]=at(s);const W=4+r()*5,D=5+r()*4,Ht=2.2+r()*2.8,tt=[-n[1],n[0]];
  if(Math.abs(b[0]-x0)+Math.abs(b[1]-z0)<W+3||Math.abs(b[0]-x1)+Math.abs(b[1]-z1)<W+3||Math.abs(b[0]-x0)+Math.abs(b[1]-z1)<W+3||Math.abs(b[0]-x1)+Math.abs(b[1]-z0)<W+3)continue;
  let ok=1;for(const u of[-W,0,W])for(const w of[1,D]){if(!clear(b[0]+tt[0]*u+n[0]*w,b[1]+tt[1]*u+n[1]*w,1))ok=0}if(!ok)continue;if(TP.some(p=>Math.abs(p-s)<W+8||Math.abs(p-s)>440-W-8))continue;TP.push(s);heap(b,n,W,D,Ht,s)}
 /* a bigger heap at each corner, so they don't stand sharp */for(const[cx,cz,nx,nz,si]of[[x0,z0,-1,-1,1],[x1,z0,1,-1,2],[x1,z1,1,1,3],[x0,z1,-1,1,4]]){const l=Math.SQRT2;heap([cx,cz],[nx/l,nz/l],7+r()*2,6+r()*2,3.6+r()*1.4,si*97)}
 g.add(mgMerge(TL,o.ROCK));
 /* the skirt round the foot: fallen cap-rock slabs and boulders (solid), smaller stones and scree (not solid) */
 const SC=[];for(let i=0;i<800;i++){const s=r()*440,[b,n]=at(s),big=i<44,med=!big&&i<150,d=big?2.2+r()*6:med?1.4+r()*5.5:1.0+Math.pow(r(),1.6)*4.5;const tt=[-n[1],n[0]],sl=(r()-.5)*.6;
  const x=b[0]+n[0]*d+tt[0]*sl,z=b[1]+n[1]*d+tt[1]*sl;if(!clear(x,z,big?2:1))continue;const rad=big?.9+r()*.9:med?.4+r()*.45:.1+r()*.25;const pale=big&&r()<.5;
  const cc=pale?[.86,.76,.6]:r()<.5?[.66,.42,.3]:[.56,.4,.3];mgPut(SC,mgRockGeo(rad,i,pale?.45:.6+r()*.3,1+r()*.5),x,-.02,z,r()*6,cc,pale?(r()-.5)*.4:0,pale?(r()-.5)*.4:0);if(big){const e=rad*.8;obs.push({x0:x-e,x1:x+e,z0:z-e,z1:z+e})}}
 g.add(mgMerge(SC,o.ROCK));
 /* shrubs and dry grass on the top (near the rim, away from the props), and a few round the foot */
 const PL=[];const tuft=(x,y,z,h,seed)=>{for(let b=0;b<7;b++){const a=b/7*6.28+seed,l=h*(.7+.5*Math.sin(seed*3+b)),ge2=new THREE.BufferGeometry(),w=.035,lx=Math.cos(a)*.18*h,lz=Math.sin(a)*.18*h;
   ge2.setAttribute('position',new THREE.BufferAttribute(new Float32Array([-w*Math.sin(a),0,w*Math.cos(a),w*Math.sin(a),0,-w*Math.cos(a),lx,l,lz]),3));ge2.computeVertexNormals();ge2.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(6),2));
   const c=new Float32Array(9);[[.62,.56,.36],[.62,.56,.36],[.86,.8,.56]].forEach((v,j)=>c.set(v,j*3));ge2.setAttribute('color',new THREE.BufferAttribute(c,3));ge2.translate(x,y,z);PL.push(ge2)}};
 const shrub=(x,y,z,sz,seed)=>{for(let b=0;b<4;b++){const a=b*1.7+seed,rr=sz*(.45+.2*Math.sin(seed+b));mgPut(PL,mgRockGeo(rr,seed*7+b,.8,1),x+Math.cos(a)*sz*.35,y+sz*.05,z+Math.sin(a)*sz*.35,a,b%2?[.42,.46,.28]:[.5,.52,.32])}};
 for(let i=0;i<70;i++){const s=r()*440,[b,n]=at(s),d=1.5+r()*14,x=b[0]-n[0]*d,z=b[1]-n[1]*d;if(!clear(x,z,1.2)||x<x0+1||x>x1-1||z<z0+1||z>z1-1)continue;if(i%5==0)shrub(x,H,z,.5+r()*.4,i);else tuft(x,H,z,.35+r()*.3,i)}
 for(let i=0;i<40;i++){const s=r()*440,[b,n]=at(s),d=3+r()*10,x=b[0]+n[0]*d,z=b[1]+n[1]*d;if(!clear(x,z,1.5))continue;if(i%4==0)shrub(x,0,z,.45+r()*.4,i+100);else tuft(x,0,z,.3+r()*.3,i+100)}
 g.add(mgMerge(PL,o.PLANT));
 return{obs,parts:{cliff}}}

/* ---------- the ramp road ----------
   road(x): the deck height of the kept q.ramps entry: 0 at x -220, 14 at x -280. The road is 8 m wide (z -1554 … -1546). */
function mgMesaRoad(g){const k=rtKit(),o=mgKit(),r=o.r,sm=o.sm,{s,e,z0,z1}=MG.road,H=MG.H,obs=[],road=x=>H*Math.min(1,Math.max(0,(s-x)/(s-e))),ang=Math.atan2(H,s-e),hyp=Math.hypot(s-e,H);
 /* the road surface: 3 cm above the deck height, running 0.6 m out onto the flat at the bottom */
 {const ge=new THREE.PlaneGeometry(z1-z0,hyp+.6,1,24),P=ge.attributes.position;for(let i=0;i<P.count;i++){const u=P.getX(i),v=P.getY(i)/(hyp+.6)+.5;const x=s+.6-v*(s+.6-e),y=road(x)+.03;P.setXYZ(i,x,y,(z0+z1)/2-u)}ge.computeVertexNormals();
  const m=new THREE.Mesh(ge,o.ROAD);m.material.polygonOffset=true;m.material.polygonOffsetUnits=-2;m.userData.noSeam=true;g.add(m);o.ROAD.map.repeat.set(1,hyp/8)}
 /* the retaining wall on the south (drop) side: dressed stone from the ground to 35 cm above the road, and its cap */
 const WZ0=z0-.65,WZ1=z0-.05;{const sh=new THREE.Shape();sh.moveTo(e-1,-.2);sh.lineTo(s+.4,-.2);sh.lineTo(s+.4,.35);sh.lineTo(e,H+.35);sh.lineTo(e-1,H+.35);sh.lineTo(e-1,-.2);
  const ge=new THREE.ExtrudeGeometry(sh,{depth:WZ1-WZ0,bevelEnabled:false});ge.translate(0,0,WZ0);const m=new THREE.Mesh(ge,o.STONE);m.userData.noSeam=true;g.add(m);
  const cap=new THREE.Mesh(new THREE.BoxGeometry(hyp+.5,.1,WZ1-WZ0+.1),k.M(0x9a8a76,{roughness:.9}));cap.position.set((s+e)/2+.2,H/2+.35+.05/Math.cos(ang),(WZ0+WZ1)/2);cap.rotation.z=-ang;g.add(cap);
  obs.push({x0:e,x1:s+.4,z0:WZ0,z1:WZ1+.02})}
 /* the timber guard rail on the wall: posts every 3 m, two rails on their outer face */
 {const pz=(WZ0+WZ1)/2;for(let x=s-1;x>e+.5;x-=3){const y=road(x)+.35,p=new THREE.Mesh(new THREE.BoxGeometry(.18,1.05,.18),o.TIMBER);p.position.set(x,y+.43,pz);g.add(p)}
  {const x=e+.6,y=road(x)+.35,p=new THREE.Mesh(new THREE.BoxGeometry(.18,1.05,.18),o.TIMBER);p.position.set(x,y+.43,pz);g.add(p)}
  for(const hy of[.42,.82]){const L=Math.hypot(s-1-(e+.6),road(e+.6)-road(s-1)),rl=new THREE.Mesh(new THREE.BoxGeometry(L+.2,.18,.06),o.TIMBER);rl.position.set((s-1+e+.6)/2,(road(s-1)+road(e+.6))/2+.35+hy,pz-.12);rl.rotation.z=-ang;g.add(rl)}}
 /* the rock shoulder on the north side: rises beside the middle of the road, falls away at both ends */
 {const XS=[];for(let x=s+.3;x>e-.7;x-=.8)XS.push(x);XS.push(e-.7);const NP=12,pos=[],col=[],uv=[],idx=[];
  XS.forEach((x,i)=>{const t=Math.min(1,Math.max(0,(s-x)/(s-e))),hc=3.0*sm(.05,.55,t)*(1-sm(.82,.99,t))+.25*sm(.02,.2,t),ry=Math.min(road(x),H-.1)-.06*(1-sm(0,.1,t)),yt=Math.min(ry+hc,x<e+.5?H-.1:99),n1=.18*Math.sin(x*.7)+.12*Math.sin(x*1.9+1),n2=.3*Math.sin(x*.37+2)+.2*Math.sin(x*1.3);
   const prof=[[z1-.05,ry-.2]];for(let j=1;j<=4;j++){const u=j/4;prof.push([z1+.15+.35*u+n1*u*(1-u)*2,ry+(yt-ry)*u])}prof.push([z1+1.2+n1*.5,yt+.12*(hc>.5?1:0)]);const zt=z1+2.3+n2*.4;
   for(let j=1;j<=6;j++){const u=j/6,nj=(.45*Math.sin(x*.53+j*2.1)+.25*Math.sin(x*1.7-j*.9))*Math.sin(Math.PI*u),zz=zt+(4.2+n2)*Math.pow(u,1.3)+nj,yy=yt*(1-u)+(-.15)*u-(hc>.5?.4*Math.sin(Math.PI*u):0)+(j%2?.25:-.1)*Math.min(1,yt/3)*Math.sin(Math.PI*u);prof.push([zz,yy])}
   prof.forEach(([zz,yy],j)=>{pos.push(x,yy,zz);const cc=mgBandCol(yy<0?0:Math.min(13.9,yy+(H-yt)*.0),x*3.1);col.push(...cc);uv.push(x/6,yy/6+zz/6)})});
  for(let i=0;i<XS.length-1;i++)for(let j=0;j<NP-1;j++){const a=i*NP+j,b=(i+1)*NP+j,c=(i+1)*NP+j+1,d=i*NP+j+1;idx.push(a,b,d,b,c,d)}
  const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));ge.setAttribute('color',new THREE.Float32BufferAttribute(col,3));ge.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));ge.setIndex(idx);ge.computeVertexNormals();
  const m=new THREE.Mesh(ge,o.ROCK);m.userData.noSeam=true;g.add(m);for(let x=s-6;x>e;x-=4){obs.push({x0:x-4,x1:x,z0:z1+.1,z1:z1+5.5})}
  /* loose rocks on the shoulder and at its foot */const RL=[];for(let i=0;i<46;i++){const x=s-3-r()*(s-e-4),t=(s-x)/(s-e),hc=3.0*sm(.05,.55,t)*(1-sm(.82,.99,t)),ry=road(x),side=r();let z,y;if(side<.5){z=z1+2.6+r()*2.2;y=Math.max(0,(ry+hc)*(1-Math.pow((z-z1-2.3)/4.4,1.3)))}else{z=z1+6.2+r()*3;y=0}
   const rad=y>0?.25+r()*.45:.3+r()*.6;mgPut(RL,mgRockGeo(rad,i*5.3,.6,1.2),x,y-.12,z,r()*6,r()<.3?[.86,.76,.6]:[.62,.42,.31])}g.add(mgMerge(RL,o.ROCK))}
 /* signs */
 const board=(w,h,draw)=>{const c=document.createElement('canvas');c.width=Math.round(256*w/h);c.height=256;draw(c.getContext('2d'),c.width,c.height);const t=new THREE.CanvasTexture(c);t.anisotropy=4;return new THREE.MeshStandardMaterial({map:t,roughness:.8})};
 const F=k.FONT||'"Barlow Semi Condensed",DoorsSans,Arial,sans-serif';
 /* MESA ROAD at the bottom: a yellow warning board and a steep-grade plate on a steel post, facing the way in (east) */
 {const sx=-214,sz=-1557,G=new THREE.Group();G.position.set(sx,0,sz);G.rotation.y=Math.PI/2;g.add(G);const post=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,3.1,8),k.M(0x8a8a8a,{metalness:.6,roughness:.4}));post.position.set(0,1.55,-.06);G.add(post);
  const m1=board(1.6,.9,(c,w,h)=>{c.fillStyle='#f0c020';c.fillRect(0,0,w,h);c.strokeStyle='#1a1a1a';c.lineWidth=12;c.strokeRect(10,10,w-20,h-20);c.fillStyle='#1a1a1a';c.textAlign='center';c.font='700 92px '+F;c.fillText('MESA ROAD',w/2,108,w-60);c.font='600 60px '+F;c.fillText('STEEP · USE LOW GEAR',w/2,200,w-60)});
  const b1=new THREE.Mesh(new THREE.BoxGeometry(1.6,.9,.03),[k.M(0xd0a818),k.M(0xd0a818),k.M(0xd0a818),k.M(0xd0a818),m1,k.M(0x8a8a8a)]);b1.position.set(0,2.55,0);G.add(b1);
  const m2=board(.9,.9,(c,w,h)=>{c.fillStyle='#f0c020';c.fillRect(0,0,w,h);c.strokeStyle='#1a1a1a';c.lineWidth=12;c.strokeRect(10,10,w-20,h-20);c.fillStyle='#1a1a1a';c.beginPath();c.moveTo(40,190);c.lineTo(216,190);c.lineTo(216,100);c.closePath();c.fill();c.textAlign='center';c.font='700 66px '+F;c.fillText('23%',96,90)});
  const b2=new THREE.Mesh(new THREE.BoxGeometry(.9,.9,.03),[k.M(0xd0a818),k.M(0xd0a818),k.M(0xd0a818),k.M(0xd0a818),m2,k.M(0x8a8a8a)]);b2.position.set(0,1.55,0);G.add(b2);obs.push({x0:sx-.15,x1:sx+.15,z0:sz-.15,z1:sz+.15})}
 /* LOOKOUT MESA at the top: a routed plank board on two log posts, facing the road as you arrive */
 {const sx=-284.5,sz=-1559,G=new THREE.Group();G.position.set(sx,H,sz);G.rotation.y=Math.PI/2;g.add(G);for(const px of[-1.15,1.15]){const p=new THREE.Mesh(new THREE.CylinderGeometry(.11,.13,2.3,9),o.TIMBER);p.position.set(px,1.15,0);G.add(p)}
  const m=board(2.6,1.1,(c,w,h)=>{c.fillStyle='#6a4a2c';c.fillRect(0,0,w,h);for(let i=0;i<40;i++){c.fillStyle='rgba(40,25,12,.25)';c.fillRect(0,Math.random()*h,w,1)}c.fillStyle='#3a2414';c.fillRect(0,h/2-2,w,4);c.fillStyle='#f2e2c0';c.textAlign='center';c.font='700 100px '+F;c.fillText('LOOKOUT MESA',w/2,108,w-50);c.font='600 62px '+F;c.fillText('ELEV. 14 m · NO LITTERING',w/2,206,w-50)});
  const b=new THREE.Mesh(new THREE.BoxGeometry(2.6,1.1,.08),[o.TIMBER,o.TIMBER,o.TIMBER,o.TIMBER,m,o.TIMBER]);b.position.set(0,1.55,.13);G.add(b);
  const rf=new THREE.Mesh(new THREE.BoxGeometry(2.9,.06,.4),o.TIMBER);rf.position.set(0,2.18,.1);rf.rotation.x=.25;G.add(rf);for(const px of[-1.15,1.15])obs.push({x0:sx-.15,x1:sx+.15,z0:sz+px-.15,z1:sz+px+.15})}
 return{obs}}
