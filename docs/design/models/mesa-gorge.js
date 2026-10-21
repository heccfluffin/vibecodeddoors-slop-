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
 /* loose rocks: speckle only (strata lines on a round stone look like wood grain) */o.ROCKS=M(0xffffff,{vertexColors:true,roughness:.97,map:k.tex(128,128,(c,w,h)=>{c.fillStyle='#e2dcd2';c.fillRect(0,0,w,h);for(let i=0;i<1600;i++){c.fillStyle=r()<.5?'rgba(80,60,45,.16)':'rgba(255,250,240,.18)';c.fillRect(r()*w,r()*h,1+r()*2,1+r()*2)}for(let i=0;i<10;i++){c.fillStyle='rgba(70,50,40,.1)';c.beginPath();c.arc(r()*w,r()*h,4+r()*12,0,7);c.fill()}})});
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
 g.add(mgMerge(RL,o.ROCKS));
 /* talus: heaps of broken rock leaning on the cliff, where the face has crumbled (solid) */
 const TL=[],TR=[];const TP=[];const heap=(b,n,W,D,Ht,s)=>{const tt=[-n[1],n[0]];
  const NU=16,NW=10,pos=[],col=[],uv=[],idx=[],sd=s*3.7;for(let iu=0;iu<=NU;iu++)for(let iw=0;iw<=NW;iw++){const u=(iu/NU*2-1)*W,w=-.8+(iw/NW)*(D+.8),q=Math.hypot(u/W,Math.max(0,w)/D);
   let h=Ht*Math.pow(Math.max(0,1-q),1.25)+.18*Math.sin(u*2.1+sd)*Math.sin(w*1.7+sd)+.12*Math.sin(u*4.3-w*3.1+sd);if(q>=1)h=-.1;h=Math.max(-.1,h-.05);
   const x=b[0]+tt[0]*u+n[0]*w,z=b[1]+tt[1]*u+n[1]*w;pos.push(x,h,z);const v=.92+.08*Math.sin(u*3.3+w*2.9+sd),pl=Math.max(0,Math.min(1,(Math.sin(u*.8+w*.6+sd)+Math.sin(u*1.9-w*1.3+sd*2)-.9)*1.5)),c=[.6+.26*pl,.41+.35*pl,.3+.3*pl];col.push(c[0]*v,c[1]*v,c[2]*v);uv.push(u/3,w/3)}
  for(let iu=0;iu<NU;iu++)for(let iw=0;iw<NW;iw++){const A=iu*(NW+1)+iw,B=(iu+1)*(NW+1)+iw,Cc=B+1,Dd=A+1;idx.push(A,Dd,B,B,Dd,Cc)}
  const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));ge.setAttribute('color',new THREE.Float32BufferAttribute(col,3));ge.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));ge.setIndex(idx);ge.computeVertexNormals();
  const tg=ge.toNonIndexed();/* check the winding faces up */{const P=tg.attributes.position,N=tg.attributes.normal;let up=0;for(let v=0;v<N.count;v++)up+=N.getY(v);if(up<0){ge.setIndex(idx.map((_,m)=>idx[m-m%3+[0,2,1][m%3]]));ge.computeVertexNormals()}}
  TL.push(ge.toNonIndexed());
  for(let m=0;m<10;m++){const u=(r()*2-1)*W*.8,w=r()*D*.9,q=Math.hypot(u/W,w/D);if(q>.95)continue;const h=Ht*Math.pow(1-q,1.25),rad=.25+r()*.5;mgPut(TR,mgRockGeo(rad,s+m,.6,1.2),b[0]+tt[0]*u+n[0]*w,h-.15,b[1]+tt[1]*u+n[1]*w,r()*6,r()<.4?[.86,.76,.6]:[.62,.42,.31])}
  const e1=[b[0]+tt[0]*W*.65,b[1]+tt[1]*W*.65],e2=[b[0]-tt[0]*W*.65+n[0]*D*.6,b[1]-tt[1]*W*.65+n[1]*D*.6];obs.push({x0:Math.min(e1[0],e2[0]),x1:Math.max(e1[0],e2[0]),z0:Math.min(e1[1],e2[1]),z1:Math.max(e1[1],e2[1])})};
 for(let tries=0;tries<200&&TP.length<18;tries++){const s=r()*440,[b,n]=at(s);const W=4+r()*5,D=5+r()*4,Ht=2.2+r()*2.8,tt=[-n[1],n[0]];
  if(Math.abs(b[0]-x0)+Math.abs(b[1]-z0)<W+3||Math.abs(b[0]-x1)+Math.abs(b[1]-z1)<W+3||Math.abs(b[0]-x0)+Math.abs(b[1]-z1)<W+3||Math.abs(b[0]-x1)+Math.abs(b[1]-z0)<W+3)continue;
  let ok=1;for(const u of[-W,0,W])for(const w of[1,D]){if(!clear(b[0]+tt[0]*u+n[0]*w,b[1]+tt[1]*u+n[1]*w,1))ok=0}if(!ok)continue;if(TP.some(p=>Math.abs(p-s)<W+8||Math.abs(p-s)>440-W-8))continue;TP.push(s);heap(b,n,W,D,Ht,s)}
 /* a bigger heap at each corner, so they don't stand sharp */for(const[cx,cz,nx,nz,si]of[[x0,z0,-1,-1,1],[x1,z0,1,-1,2],[x1,z1,1,1,3],[x0,z1,-1,1,4]]){const l=Math.SQRT2;heap([cx,cz],[nx/l,nz/l],7+r()*2,6+r()*2,3.6+r()*1.4,si*97)}
 g.add(mgMerge(TL,o.ROCK));g.add(mgMerge(TR,o.ROCKS));
 /* the skirt round the foot: fallen cap-rock slabs and boulders (solid), smaller stones and scree (not solid) */
 const SC=[];for(let i=0;i<800;i++){const s=r()*440,[b,n]=at(s),big=i<44,med=!big&&i<150,d=big?2.2+r()*6:med?1.4+r()*5.5:1.0+Math.pow(r(),1.6)*4.5;const tt=[-n[1],n[0]],sl=(r()-.5)*.6;
  const x=b[0]+n[0]*d+tt[0]*sl,z=b[1]+n[1]*d+tt[1]*sl;if(!clear(x,z,big?2:1))continue;const rad=big?.9+r()*.9:med?.4+r()*.45:.1+r()*.25;const pale=big&&r()<.5;
  const cc=pale?[.86,.76,.6]:r()<.5?[.66,.42,.3]:[.56,.4,.3];mgPut(SC,mgRockGeo(rad,i,pale?.45:.6+r()*.3,1+r()*.5),x,-.02,z,r()*6,cc,pale?(r()-.5)*.4:0,pale?(r()-.5)*.4:0);if(big){const e=rad*.8;obs.push({x0:x-e,x1:x+e,z0:z-e,z1:z+e})}}
 g.add(mgMerge(SC,o.ROCKS));
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
   const rad=y>0?.25+r()*.45:.3+r()*.6;mgPut(RL,mgRockGeo(rad,i*5.3,.6,1.2),x,y-.12,z,r()*6,r()<.3?[.86,.76,.6]:[.62,.42,.31])} g.add(mgMerge(RL,o.ROCKS))}
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

/* ---------- Batch 2: on top of the mesa ----------
   mgMesaTop(g)  the Hermit's cabin, the summit cairn, the lookout point, the telescope, the flagpole and the campfire,
                 in the same places as now (the summit book moves to the cairn). Returns
                 {obs, plates, spots, parts:{flag, bino}, tick(t), lights}:
                   spots.hermit [x,y,z]   the Hermit stands on the porch (y = porch floor)
                   spots.book   [x,z]     "Sign the summit book" (south side of the cairn)
                   spots.smoke  [x,y,z]   the stove pipe's top, for the smoke sprite
                   spots.binoUse [x,z]    where you stand to use the binoculars (north of them, looking south)
                   spots.binoProp [x,z]   the binoculars' E prompt
                   spots.fire  [x,y,z]    the campfire's flame (as now)
                 tick(t): call every frame (t in seconds) to wave the flag. lights: [x,y,z] of the porch lamp (night).
                 parts.win: the cabin windows' glass; at night set parts.win.emissiveIntensity = .5 (a lamp inside). */
function mgMesaTop(g){const k=rtKit(),o=mgKit(),r=o.r,M=k.M,H=MG.H,obs=[],plates=[],spots={};
 const bx=(w,h,d,x,y,z,m,ry,rx,rz,par)=>{const e=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);e.position.set(x,y,z);e.rotation.set(rx||0,ry||0,rz||0);(par||g).add(e);return e};
 const cy=(r1,r2,h,x,y,z,m,seg,par)=>{const e=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,seg||12),m);e.position.set(x,y,z);(par||g).add(e);return e};
 const tm=(t,rx,ry,op)=>{const m=M(0xffffff,Object.assign({roughness:.9},op||{}));m.map=t.clone();m.map.needsUpdate=true;m.map.repeat.set(rx,ry);return m};
 const F=k.FONT||'"Barlow Semi Condensed",DoorsSans,Arial,sans-serif';
 /* textures: weathered board-and-batten (2 m square a tile), corrugated tin (ribs every 7.6 cm), deck planks */
 const BB=k.tex(256,256,(c,w,h)=>{c.fillStyle='#8a7a66';c.fillRect(0,0,w,h);for(let i=0;i<8;i++){const v=118+r()*24|0;c.fillStyle='rgb('+(v+8)+','+(v-2)+','+(v-18)+')';c.fillRect(i*32+1,0,30,h);for(let j=0;j<10;j++){c.fillStyle='rgba(50,40,30,.18)';c.fillRect(i*32+2+r()*26,r()*h,1,10+r()*40)}}
  for(let i=0;i<8;i++){c.fillStyle='rgba(30,22,15,.45)';c.fillRect(i*32+26,0,3,h);c.fillStyle='#9a8a74';c.fillRect(i*32+29,0,6,h);c.fillStyle='rgba(255,245,225,.18)';c.fillRect(i*32+29,0,2,h)}
  for(let i=0;i<6;i++){c.fillStyle='rgba(60,40,25,.12)';c.fillRect(0,r()*h,w,2+r()*6)}});
 const TIN=k.tex(128,128,(c,w,h)=>{for(let x=0;x<w;x++){const v=150+60*Math.sin(x/w*Math.PI*2*8);c.fillStyle='rgb('+(v*.95|0)+','+(v*.92|0)+','+(v*.88|0)+')';c.fillRect(x,0,1,h)}for(let i=0;i<26;i++){c.fillStyle='rgba(150,80,40,'+(.12+r()*.2)+')';c.fillRect(r()*w,r()*h,2+r()*14,2+r()*30)}});
 const DECK=k.tex(128,128,(c,w,h)=>{c.fillStyle='#6a5440';c.fillRect(0,0,w,h);for(let i=0;i<8;i++){const v=120+r()*30|0;c.fillStyle='rgb('+v+','+(v-14)+','+(v-34)+')';c.fillRect(0,i*16+1,w,14);c.fillStyle='rgba(30,20,10,.4)';c.fillRect(0,i*16+15,w,1)}});
 const BARK=M(0x5a4430,{roughness:1,map:k.tex(64,64,(c,w,h)=>{c.fillStyle='#6a5038';c.fillRect(0,0,w,h);for(let i=0;i<50;i++){c.fillStyle='rgba(30,20,12,'+(.2+r()*.3)+')';c.fillRect(r()*w,0,1+r()*2,h)}})});
 const ENDW=M(0xc8a878,{roughness:.9}),TRIM=M(0xd8ccb4,{roughness:.8}),DARK=M(0x2a2420,{roughness:.9}),IRON=M(0x26282a,{roughness:.5,metalness:.6}),BRASS=M(0xc8a040,{roughness:.3,metalness:.8}),STONE=M(0x9a8a76,{roughness:.95}),GLASS=M(0x1c2630,{roughness:.15,metalness:.3}),WGL=M(0x1c2630,{roughness:.15,metalness:.3,emissive:0xffb060,emissiveIntensity:0});
 const lab=(w,h,draw,ppm)=>{const c=document.createElement('canvas');c.width=Math.round(w*(ppm||256));c.height=Math.round(h*(ppm||256));draw(c.getContext('2d'),c.width,c.height);const t=new THREE.CanvasTexture(c);t.anisotropy=4;return M(0xffffff,{map:t,roughness:.6})};
 const plane=(w,h,m,x,y,z,ry,par)=>{const e=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m);e.position.set(x,y,z);e.rotation.y=ry||0;(par||g).add(e);return e};

 /* ===== the Hermit's cabin, (-320, -1560): 7 x 5 m, door and porch on the west, tin roof ridged along x ===== */
 {const hx=-320,hz=-1560,X0=hx-3.5,X1=hx+3.5,Z0=hz-2.5,Z1=hz+2.5,E=H+3.2,RISE=1.2,th=Math.atan2(RISE,2.5),SL=Math.hypot(2.5,RISE),OV=.4,RG=E+RISE;
  /* stone footing all round, then the walls (board and batten), the gables */
  const FT=M(0x8a7a66,{roughness:1,map:o.STONE.map.clone()});FT.map.needsUpdate=true;FT.map.repeat.set(3,.3);bx(7.1,.35,5.1,hx,H+.17,hz,FT);
  const WL=t=>tm(BB,t/2,1.45);bx(7,2.85,.15,hx,H+1.77,Z0+.075,WL(7));bx(7,2.85,.15,hx,H+1.77,Z1-.075,WL(7));bx(.15,2.85,4.7,X0+.075,H+1.77,hz,WL(4.7));bx(.15,2.85,4.7,X1-.075,H+1.77,hz,WL(4.7));
  for(const x of[X0+.075,X1-.075]){const sh=new THREE.Shape();sh.moveTo(-2.5,0);sh.lineTo(2.5,0);sh.lineTo(0,RISE);sh.lineTo(-2.5,0);const ge=new THREE.ExtrudeGeometry(sh,{depth:.15,bevelEnabled:false});ge.translate(0,0,-.075);const m=new THREE.Mesh(ge,tm(BB,.5,.5));m.rotation.y=Math.PI/2;m.position.set(x,E,hz);g.add(m)}
  /* corner boards and the eave boards */for(const x of[X0-.02,X1+.02])for(const z of[Z0-.02,Z1+.02])bx(.16,2.9,.16,x,H+1.8,z,TRIM);for(const z of[Z0-.03,Z1+.03])bx(7.1,.18,.06,hx,E-.1,z,TRIM);
  /* the roof: two tin sheets on the slopes, a ridge cap, fascia under the eaves */
  for(const sd of[-1,1]){const L=SL+OV,cz=hz+sd*(L/2)*Math.cos(th),cy2=RG-(L/2)*Math.sin(th)+.035*Math.cos(th);bx(7.9,.07,L,hx,cy2,cz+sd*.035*Math.sin(th),tm(TIN,7.9/2,1,{metalness:.5,roughness:.55}),0,sd*th);
   const ez=hz+sd*L*Math.cos(th),ey=RG-L*Math.sin(th);bx(7.9,.16,.05,hx,ey-.07,ez+sd*.02,TRIM)}
  {const rc=bx(7.95,.08,.36,hx,RG+.1,hz,M(0x9a9690,{metalness:.5,roughness:.5}));}
  /* the barge boards along the gable ends */for(const x of[X0-.42,X1+.42])for(const sd of[-1,1]){const L=SL+OV;bx(.05,.18,L,x,RG-(L/2)*Math.sin(th)+.03,hz+sd*(L/2)*Math.cos(th),TRIM,0,sd*th)}
  /* the door (west) */{const dz=hz;bx(.08,2.15,1.25,X0-.04,H+.35+1.07,dz,TRIM);const d=bx(.06,2.0,1.0,X0-.09,H+.35+1.0,dz,M(0x6a5038,{roughness:.9,map:DECK.clone()}));d.material.map.needsUpdate=true;d.material.map.rotation=Math.PI/2;cy(.035,.035,.08,X0-.15,H+1.35,dz+.38,BRASS,8).rotation.z=Math.PI/2;
   for(const y of[.5,1.6])bx(.07,.12,.9,X0-.12,H+.35+y,dz,M(0x5a4430))}
  /* windows: south x2, north x1, east x1: frame, dark glass, a sill, a curtain behind */
  const win=(x,z,ry)=>{const G=new THREE.Group();G.position.set(x,H+1.9,z);G.rotation.y=ry;g.add(G);bx(1.1,1.0,.06,0,0,.03,TRIM,0,0,0,G);bx(.94,.84,.03,0,0,.065,WGL,0,0,0,G);bx(.04,.82,.035,0,0,.075,TRIM,0,0,0,G);bx(.92,.04,.035,0,0,.086,TRIM,0,0,0,G);bx(1.2,.06,.14,0,-.53,.08,TRIM,0,0,0,G);};
  win(hx-1.6,Z0,Math.PI);win(hx+1.7,Z0,Math.PI);win(hx-.6,Z1,0);win(X1,hz+.6,Math.PI/2);
  /* the stove pipe through the north slope, with flashing and a rain cap; smoke comes out at spots.smoke */
  {const px=hx+2,pz=hz+1,ry=RG-1*Math.tan(th);cy(.12,.12,1.6,px,ry+.6,pz,M(0x3a3634,{metalness:.6,roughness:.5}),12);cy(.24,.3,.1,px,ry+.08,pz,M(0x8a8680,{metalness:.5,roughness:.6}),14).rotation.x=th;cy(.0,.26,.18,px,ry+1.55,pz,M(0x3a3634,{metalness:.6,roughness:.5}),12);for(let i=0;i<3;i++)rodp(g,[px+Math.cos(i*2.1)*.12,ry+1.4,pz+Math.sin(i*2.1)*.12],[px+Math.cos(i*2.1)*.2,ry+1.47,pz+Math.sin(i*2.1)*.2],.012,IRON);spots.smoke=[px,ry+1.95,pz]}
  /* a solar panel on the south slope */{const sz=hz-1.3*Math.cos(th),sy=RG-1.3*Math.sin(th);const P=new THREE.Group();P.position.set(hx-1.6,sy,sz);P.rotation.x=-th;g.add(P);bx(1.7,.05,1.0,0,.16,0,M(0x1a2a4a,{roughness:.25,metalness:.4,map:k.tex(128,64,(c,w,h)=>{c.fillStyle='#1a2a4a';c.fillRect(0,0,w,h);c.strokeStyle='#8a9ab0';c.lineWidth=1;for(let i=0;i<=8;i++){c.beginPath();c.moveTo(i*16,0);c.lineTo(i*16,h);c.stroke()}for(let j=0;j<=4;j++){c.beginPath();c.moveTo(0,j*16);c.lineTo(w,j*16);c.stroke()}})}),0,0,0,P);bx(1.74,.06,1.04,0,.12,0,M(0xb0b4b8,{metalness:.6,roughness:.4}),0,0,0,P);for(const a of[-.7,.7])for(const b of[-.35,.35])bx(.05,.12,.05,a,.05,b,M(0xb0b4b8,{metalness:.6}),0,0,0,P)}
  /* the porch: a plank deck 30 cm up, one step, a lean-to tin roof on two posts, a rocking chair, a lamp */
  {const PX0=X0-2.5;const dk=bx(2.5,.12,5.4,(PX0+X0)/2,H+.24,hz,tm(DECK,1.2,2.6));for(const z of[hz-2.55,hz+2.55])bx(2.3,.28,.08,(PX0+X0)/2+.03,H+.14,z,M(0x5a4430));bx(.08,.28,5.2,PX0+.1,H+.14,hz,M(0x5a4430));
   bx(.36,.15,1.4,PX0-.18,H+.075,hz,tm(DECK,.3,.7));plates.push({x0:PX0,x1:X0,z0:hz-2.7,z1:hz+2.7,y:H+.3},{x0:PX0-.36,x1:PX0,z0:hz-.7,z1:hz+.7,y:H+.15});
   const ry0=E-.25,ry1=E-.65,pa=Math.atan2(ry0-ry1,2.75);for(const z of[hz-2.4,hz+2.4]){bx(.14,ry1-.16-(H+.3),.14,PX0+.2,(ry1-.16+H+.3)/2,z,o.TIMBER);obs.push({x0:PX0+.1,x1:PX0+.3,z0:z-.1,z1:z+.1})}bx(.12,.16,5.0,PX0+.2,ry1-.08,hz,o.TIMBER);bx(2.75,.12,.1,X0-1.375,(ry0+ry1)/2-.1,hz-2.4,o.TIMBER,0,0,pa);bx(2.75,.12,.1,X0-1.375,(ry0+ry1)/2-.1,hz+2.4,o.TIMBER,0,0,pa);bx(.1,.16,5.0,X0-.08,ry0-.12,hz,o.TIMBER);
   const pr=bx(3.0,.06,5.8,X0-1.45,(ry0+ry1)/2+.02,hz,tm(TIN,5.8/2,1,{metalness:.5,roughness:.55}),0,0,pa);pr.material.map.rotation=Math.PI/2;
   /* rocking chair, facing west at the north end */{const C2=new THREE.Group();C2.position.set(PX0+1.1,H+.3,hz+1.7);C2.rotation.y=-Math.PI/2;g.add(C2);const W=o.TIMBER;
    for(const sx of[-.24,.24]){const pts=[];for(let i=0;i<=10;i++){const a=-.5+i*.1;pts.push(new THREE.Vector3(sx,.42-.42*Math.cos(a*1.1),Math.sin(a*1.1)*.55))}const t=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),12,.025,6,false),W);C2.add(t);
     for(const z of[-.22,.2])bx(.04,.38,.04,sx,.25,z,W,0,0,0,C2);bx(.04,.55,.04,sx,.7,-.24,W,0,-.15,0,C2);bx(.05,.04,.45,sx,.66,0,W,0,0,0,C2)}
    bx(.52,.05,.46,0,.45,0,W,0,0,0,C2);for(let i=0;i<4;i++)bx(.07,.55,.025,-.18+i*.12,.76,-.26,W,0,-.15,0,C2);bx(.52,.06,.04,0,1.04,-.3,W,0,-.15,0,C2)}
   /* the porch lamp by the door */{cy(.07,.09,.22,X0-.18,H+2.3,hz-.85,M(0xfff0c0,{emissive:0xffc070,emissiveIntensity:.6}),10);cy(.1,.1,.04,X0-.18,H+2.43,hz-.85,IRON,10);bx(.2,.03,.03,X0-.08,H+2.43,hz-.85,IRON);}
   spots.hermit=[PX0+1.3,H+.3,hz];}
  /* the rain barrel at the north-east corner, fed by a gutter and a downpipe */{const gz=hz+(SL+OV)*Math.cos(th)-.04,gy=RG-(SL+OV)*Math.sin(th)-.1;bx(7.6,.1,.12,hx,gy-.05,gz+.1,M(0x8a8680,{metalness:.5,roughness:.5}));cy(.045,.045,gy-.05-(H+1.1),X1+.5,(gy-.05+H+1.1)/2,gz+.1,M(0x8a8680,{metalness:.5,roughness:.5}),8);bx(.62,.06,.06,X1+.21,gy-.05,gz+.1,M(0x8a8680,{metalness:.5}));
   const bxx=X1+.5,bzz=gz+.04;cy(.38,.36,1.0,bxx,H+.5,bzz,M(0x4a5a6a,{roughness:.6,metalness:.3}),16);for(const y of[.15,.85])cy(.395,.395,.05,bxx,H+y,bzz,M(0x2a2a2a,{metalness:.6}),16);cy(.36,.36,.02,bxx,H+1.0,bzz,M(0x203040,{roughness:.1}),16);obs.push({x0:bxx-.4,x1:bxx+.4,z0:bzz-.4,z1:bzz+.4})}
  /* the woodpile along the east wall, a chopping block and an axe */{const WP=[];for(let row=0;row<6;row++)for(let i=0;i<19;i++){const z=hz-1.6+i*.17+(row%2)*.08;if(z>hz+1.7)continue;const ge=new THREE.CylinderGeometry(.08,.08,.62,7);ge.rotateZ(Math.PI/2);mgPut(WP,ge,X1+.42+(r()-.5)*.06,H+.09+row*.155,z,0,[.56+r()*.08,.48+r()*.05,.38])}
   g.add(mgMerge(WP,M(0xffffff,{vertexColors:true,roughness:.95})));obs.push({x0:X1,x1:X1+.8,z0:hz-1.8,z1:hz+1.85});
   cy(.28,.3,.5,X1+1.6,H+.25,hz-2.6,BARK,12);cy(.27,.27,.01,X1+1.6,H+.505,hz-2.6,ENDW,12);{const ax=bx(.04,.7,.04,X1+1.6,H+.8,hz-2.6,o.TIMBER,0,0,.35);bx(.16,.1,.03,X1+1.48,H+.55,hz-2.6,IRON,0,0,.35)}}
  obs.push({x0:X0-.1,x1:X1+.1,z0:Z0-.1,z1:Z1+.1})}

 /* ===== the summit cairn, (-345, -1545): stacked flat stones with a steel register box on top ===== */
 {const cx=-345,cz=-1545,CL=[];let y=H;const lv=[.8,.68,.56,.46,.36];lv.forEach((rad,i)=>{let lt=y;const n=i<2?5:i<4?3:1;for(let j=0;j<n;j++){const a=j/n*6.28+i,dd=n>1?rad*.42:0,ge=mgRockGeo(rad*.6,i*9+j,.5,1.3);ge.computeBoundingBox();lt=Math.max(lt,y-.05+ge.boundingBox.max.y);mgPut(CL,ge,cx+Math.cos(a)*dd,y-.05,cz+Math.sin(a)*dd,a,[.8+r()*.08,.72+r()*.05,.6])}y=lt-.04});
  g.add(mgMerge(CL,o.ROCKS));const top=y-.02;const bxg=new THREE.Group();bxg.position.set(cx,top,cz);bxg.rotation.y=.1;g.add(bxg);const OD=M(0x4a5a3a,{roughness:.6,metalness:.4});
  bx(.46,.02,.3,0,.01,0,OD,0,0,0,bxg);for(const sx of[-1,1]){bx(.02,.22,.3,sx*.22,.13,0,OD,0,0,0,bxg);bx(.42,.22,.02,0,.13,sx*.14,OD,0,0,0,bxg)}const lid=new THREE.Group();lid.position.set(0,.252,-.15);lid.rotation.x=-1.1;bxg.add(lid);bx(.48,.03,.32,0,.015,.16,OD,0,0,0,lid);bx(.08,.04,.04,0,.03,.3,M(0x8a8a8a,{metalness:.7}),0,0,0,lid);
  bx(.3,.05,.22,0,.045,-.01,M(0x8a2a20,{roughness:.8}),0,0,0,bxg);bx(.28,.012,.2,0,.076,-.01,M(0xf0e8d0,{roughness:.9}),0,0,0,bxg);bx(.012,.012,.14,.09,.088,-.01,M(0x2a4a8a),0,1.2,0,bxg);
  const pl=lab(.44,.14,(c,w,h)=>{c.fillStyle='#d8c890';c.fillRect(0,0,w,h);c.fillStyle='#2a2414';c.textAlign='center';c.font='700 '+(h*.55|0)+'px '+F;c.fillText('SUMMIT REGISTER',w/2,h*.7,w-8)},400);plane(.44,.14,pl,0,.12,.157,0,bxg);
  obs.push({x0:cx-.75,x1:cx+.75,z0:cz-.75,z1:cz+.75});spots.book=[cx+.05,cz+1.25]}

 /* ===== the lookout point on the south rim: paving, an iron railing, coin binoculars, a bench and a direction dial ===== */
 {const bxx=-330,bzz=-1596,PX0=-335.5,PX1=-324.5,PZ0=-1599.4,PZ1=-1592.4;
  const PV=M(0xffffff,{roughness:.95,map:k.tex(256,256,(c,w,h)=>{c.fillStyle='#7a6a58';c.fillRect(0,0,w,h);for(let row=0;row<5;row++){let x=-(row%2)*26;while(x<w){const bw=40+r()*36;const v=170+r()*30|0;c.fillStyle='rgb('+(v+10)+','+(v-4)+','+(v-30)+')';c.fillRect(x+2,row*51+2,bw-4,47);x+=bw}}})});PV.map.repeat.set((PX1-PX0)/3,(PZ1-PZ0)/3);PV.polygonOffset=true;PV.polygonOffsetUnits=-2;
  {const p=new THREE.Mesh(new THREE.PlaneGeometry(PX1-PX0,PZ1-PZ0),PV);p.rotation.x=-Math.PI/2;p.position.set((PX0+PX1)/2,H+.05,(PZ0+PZ1)/2);g.add(p)}
  for(const[a,b,c2,d]of[[PX0-.15,PX0,PZ0,PZ1+.15],[PX1,PX1+.15,PZ0,PZ1+.15],[PX0,PX1,PZ1,PZ1+.15]])bx(b-a,.12,d-c2,(a+b)/2,H+.06,(c2+d)/2,STONE);
  /* railing: iron posts with ball tops, two rails, along the south edge and back along both sides (open to the north) */
  const RZ=PZ0+.15,rp=(x,z)=>{cy(.03,.03,1.0,x,H+.6,z,IRON,8);const b=new THREE.Mesh(new THREE.SphereGeometry(.045,10,8),IRON);b.position.set(x,H+1.12,z);g.add(b)};
  const RX0=PX0+.08,RX1=PX1-.08,RZ1=PZ1-1.6;for(let i=0;i<=10;i++)rp(RX0+(RX1-RX0)*i/10,RZ);for(const x of[RX0,RX1])for(let i=1;i<=5;i++)rp(x,RZ+(RZ1-RZ)*i/5);
  for(const y of[.55,1.0]){bx(RX1-RX0,.04,.04,(RX0+RX1)/2,H+y+.05,RZ,IRON);for(const x of[RX0,RX1])bx(.04,.04,RZ1-RZ,x,H+y+.05,(RZ+RZ1)/2,IRON)}
  obs.push({x0:RX0-.1,x1:RX1+.1,z0:RZ-.1,z1:RZ+.1},{x0:RX0-.1,x1:RX0+.1,z0:RZ,z1:RZ1+.05},{x0:RX1-.1,x1:RX1+.1,z0:RZ,z1:RZ1+.05});
  /* the coin binoculars: a pedestal on a round foot, a coin box, a yoke and the twin-barrelled head looking south */
  {const B2=new THREE.Group();B2.position.set(bxx,H,bzz);g.add(B2);const BL=M(0x2a4a6a,{roughness:.45,metalness:.5});cy(.28,.32,.1,0,.1,0,STONE,16,B2);cy(.07,.09,.95,0,.6,0,BL,12,B2);cy(.12,.12,.06,0,1.08,0,BL,12,B2);
   bx(.18,.22,.14,0,.78,.1,BL,0,0,0,B2);bx(.02,.06,.005,0,.83,.182,M(0x101010),0,0,0,B2);
   const hd=new THREE.Group();hd.position.set(0,1.22,0);B2.add(hd);for(const sx of[-1,1])bx(.04,.2,.06,sx*.2,0,0,BL,0,0,0,hd);
   const head=new THREE.Group();hd.add(head);head.rotation.x=.08;bx(.38,.24,.3,0,0,0,BL,0,0,0,head);for(const sx of[-1,1]){const b=cy(.08,.085,.3,sx*.1,0,-.28,BL,14,head);b.rotation.x=Math.PI/2;const l=cy(.07,.07,.01,sx*.1,0,-.433,GLASS,14,head);l.rotation.x=Math.PI/2;const ep=cy(.04,.04,.08,sx*.07,.03,.19,DARK,10,head);ep.rotation.x=Math.PI/2}
   bx(.36,.05,.08,0,.06,.2,DARK,0,0,0,head);
   const pl=lab(.34,.2,(c,w,h)=>{c.fillStyle='#e8d8a8';c.fillRect(0,0,w,h);c.fillStyle='#1a2a4a';c.textAlign='center';c.font='700 '+(h*.32|0)+'px '+F;c.fillText('LOOKOUT · 1 GOLD',w/2,h*.42,w-10);c.font='600 '+(h*.22|0)+'px '+F;c.fillText('SEE THE WHOLE DESERT',w/2,h*.8,w-10)},400);plane(.17,.1,pl,0,.74,.177,0,B2);
   spots.bino=[bxx,bzz];obs.push({x0:bxx-.3,x1:bxx+.3,z0:bzz-.3,z1:bzz+.3})}
  spots.binoUse=[bxx,bzz+.6];spots.binoProp=[bxx,bzz+1.2];
  /* a bench facing the view */{const bz2=-1594.2,bx2=-333.4;for(const sx of[-.75,.75]){bx(.1,.42,.42,bx2+sx,H+.26,bz2,STONE)}bx(1.8,.07,.45,bx2,H+.5,bz2,o.TIMBER);bx(1.8,.3,.05,bx2,H+.82,bz2+.25,o.TIMBER,0,-.15);for(const sx of[-.75,.75])bx(.06,.45,.06,bx2+sx,H+.72,bz2+.24,IRON,0,-.15);obs.push({x0:bx2-.95,x1:bx2+.95,z0:bz2-.25,z1:bz2+.3})}
  /* a direction dial on a stone plinth: arrows to the places you can see */{const dx2=-326.6,dz2=-1594.4;bx(.5,.85,.5,dx2,H+.48,dz2,STONE);const dm=lab(.6,.6,(c,w,h)=>{c.fillStyle='#8a6a30';c.fillRect(0,0,w,h);const g2=c.createRadialGradient(w/2,h/2,10,w/2,h/2,w/2);g2.addColorStop(0,'#d8b058');g2.addColorStop(1,'#9a7434');c.fillStyle=g2;c.beginPath();c.arc(w/2,h/2,w/2-4,0,7);c.fill();
    c.translate(w/2,h/2);const pts=[['GORGE',-Math.PI/2],['ZONE 51',Math.atan2(-274,-220)],['ROUTE 13',Math.atan2(596,330)],['LAKE',Math.atan2(36,580)]];c.strokeStyle='#3a2810';c.fillStyle='#3a2810';c.lineWidth=4;
    for(const[t,a]of pts){c.save();c.rotate(a);c.beginPath();c.moveTo(14,0);c.lineTo(w*.22,0);c.stroke();c.beginPath();c.moveTo(w*.22+10,0);c.lineTo(w*.22-4,-7);c.lineTo(w*.22-4,7);c.fill();c.restore();const tx=Math.cos(a)*w*.37,ty=Math.sin(a)*w*.37;c.save();c.translate(tx,ty);c.font='700 '+(w*.05|0)+'px '+F;c.textAlign='center';c.textBaseline='middle';c.fillText(t,0,0);c.restore()}
    c.beginPath();c.arc(0,0,10,0,7);c.fill()},300);const dial=new THREE.Mesh(new THREE.CircleGeometry(.24,28),dm);dial.rotation.x=-Math.PI/2;dial.position.set(dx2,H+.936,dz2);g.add(dial);cy(.25,.25,.02,dx2,H+.915,dz2,BRASS,28);obs.push({x0:dx2-.3,x1:dx2+.3,z0:dz2-.3,z1:dz2+.3})}}

 /* ===== the telescope on a little rise (-380, -1550): a flat stone top 30 cm up, brass on a wooden tripod ===== */
 {const tx=-380,tz=-1550,RS=[];for(let i=0;i<16;i++){const a=i/16*6.28+r()*.2,rr=1.55+r()*.35;mgPut(RS,mgRockGeo(.45+r()*.25,i*3.3,.55,1.4),tx+Math.cos(a)*rr,H-.06,tz+Math.sin(a)*rr,a+1.57,[.82,.72,.58])}g.add(mgMerge(RS,o.ROCKS));
  const st=cy(1.75,1.85,.3,tx,H+.15,tz,M(0xffffff,{roughness:.95,map:o.STONE.map.clone()}),20);st.material.map.needsUpdate=true;st.material.map.repeat.set(2,.3);
  plates.push({x0:tx-1.2,x1:tx+1.2,z0:tz-1.2,z1:tz+1.2,y:H+.3});const T=new THREE.Group();T.position.set(tx,H+.3,tz);g.add(T);
  for(let i=0;i<3;i++){const a=i*2.094+.5,fx=Math.cos(a)*.55,fz=Math.sin(a)*.55;rodp(T,[fx,0,fz],[0,1.2,0],.03,o.TIMBER);cy(.035,.04,.06,fx,.03,fz,BRASS,8,T)}
  cy(.07,.07,.12,0,1.24,0,BRASS,12,T);const tb=new THREE.Group();tb.position.set(0,1.36,0);tb.rotation.set(0,-.785,0);T.add(tb);const tube=new THREE.Group();tube.rotation.x=.12;tb.add(tube);
  {const a=cy(.09,.12,1.3,0,0,-.2,BRASS,16,tube);a.rotation.x=Math.PI/2;for(const z of[-.8,.1,.4]){const b=cy(.125,.125,.04,0,0,z,M(0x8a6a30,{metalness:.8,roughness:.35}),16,tube);b.rotation.x=Math.PI/2}const ep=cy(.03,.035,.18,0,0,.53,DARK,10,tube);ep.rotation.x=Math.PI/2;const ln=cy(.11,.11,.01,0,0,-.856,GLASS,16,tube);ln.rotation.x=Math.PI/2}
  obs.push({x0:tx-.4,x1:tx+.4,z0:tz-.4,z1:tz+.4})}

 /* ===== the flagpole (-310, -1520): concrete base, an 8 m white pole, ball top, halyard; the DOORS flag waves ===== */
 let flag=null,fgP=null;{const fx=-310,fz=-1520;cy(.45,.5,.3,fx,H+.15,fz,M(0xb0aaa0,{roughness:.9}),16);cy(.07,.05,8,fx,H+4.3,fz,M(0xf0f0ec,{roughness:.4,metalness:.3}),12);const bl=new THREE.Mesh(new THREE.SphereGeometry(.1,14,10),BRASS);bl.position.set(fx,H+8.38,fz);g.add(bl);cy(.09,.09,.06,fx,H+8.28,fz,M(0xd0d0d0,{metalness:.6}),12);
  rodp(g,[fx+.07,H+8.25,fz],[fx+.07,H+1.2,fz],.008,M(0xe8e4d8));bx(.04,.18,.04,fx+.09,H+1.15,fz,M(0x9a9a9a,{metalness:.6}));obs.push({x0:fx-.5,x1:fx+.5,z0:fz-.5,z1:fz+.5});
  const fm=lab(2.0,1.2,(c,w,h)=>{c.fillStyle='#c02020';c.fillRect(0,0,w,h);c.fillStyle='#fff';c.fillRect(0,h*.08,w,h*.05);c.fillRect(0,h*.87,w,h*.05);c.textAlign='center';c.textBaseline='middle';c.font='800 '+(h*.5|0)+'px '+F;c.fillText('DOORS',w/2,h*.52,w*.86)},200);fm.side=THREE.DoubleSide;fm.roughness=.85;
  const fg=new THREE.PlaneGeometry(2.0,1.2,16,6);fg.translate(1.0,0,0);flag=new THREE.Mesh(fg,fm);flag.position.set(fx+.07,H+7.6,fz);g.add(flag);fgP=fg.attributes.position.array.slice()}
 const tick=t=>{if(!flag)return;const P=flag.geometry.attributes.position;for(let i=0;i<P.count;i++){const x=fgP[i*3],y=fgP[i*3+1],w=x/2;P.setZ(i,(Math.sin(x*2.6-t*5.2+y*.6)*.16+Math.sin(x*4.1-t*7.3)*.05)*w);P.setY(i,y-w*w*.1)}P.needsUpdate=true;flag.geometry.computeVertexNormals()};tick(0);

 /* ===== the campfire (-340, -1525): a ring of stones, charred logs, three log seats, a crate with the soda can stack ===== */
 {const fx=-340,fz=-1525,FR=[];for(let i=0;i<13;i++){const a=i/13*6.28;mgPut(FR,mgRockGeo(.2+r()*.06,i*2.7,.75,1.2),fx+Math.cos(a)*.85,H-.02,fz+Math.sin(a)*.85,a,[.6,.58,.55])}g.add(mgMerge(FR,M(0xffffff,{vertexColors:true,roughness:.95})));
  {const ash=new THREE.Mesh(new THREE.CircleGeometry(.72,24),M(0x3a3634,{roughness:1,polygonOffset:true,polygonOffsetUnits:-2}));ash.rotation.x=-Math.PI/2;ash.position.set(fx,H+.035,fz);g.add(ash)}
  const CH=M(0x1e1a18,{roughness:1,emissive:0x501800,emissiveIntensity:.5});for(let i=0;i<5;i++){const a=i*1.257+.4;rodp(g,[fx+Math.cos(a)*.42,H+.03,fz+Math.sin(a)*.42],[fx+Math.cos(a)*.05,H+.62,fz+Math.sin(a)*.05],.055,CH)}
  for(const a of[Math.PI/2,Math.PI*1.17,Math.PI*1.83]){const d=2.4,x=fx+Math.cos(a)*d,z=fz+Math.sin(a)*d,lg=cy(.21,.21,1.7,x,H+.17,z,BARK,12);lg.rotation.set(0,Math.PI/2-a,Math.PI/2);for(const s of[-1,1]){const e=cy(.195,.195,.012,x+Math.sin(a)*s*.855,H+.17,z-Math.cos(a)*s*.855,ENDW,12);e.rotation.set(0,Math.PI/2-a,Math.PI/2)}}
  /* the crate and the can stack (4, 3, 2, 1), plus a few crushed ones */{const cx2=fx+3.3,cz2=fz-.7;bx(.66,.42,.46,cx2,H+.21,cz2,tm(DECK,.6,.4));const CN=M(0x40c060,{roughness:.35,metalness:.5,emissive:0x0a3010,emissiveIntensity:.4,map:k.tex(64,32,(c,w,h)=>{c.fillStyle='#3ab858';c.fillRect(0,0,w,h);c.fillStyle='#fff';c.fillRect(0,h*.42,w,h*.16);c.fillStyle='#106020';c.fillRect(0,0,w,3);c.fillRect(0,h-3,w,3)})});
   for(let row=0;row<4;row++)for(let i=0;i<4-row;i++)cy(.05,.05,.14,cx2-.18+row*.06+i*.12,H+.49+row*.142,cz2,CN,12);for(let i=0;i<3;i++){const c3=cy(.05,.05,.06,cx2-.5+i*.3,H+.03,cz2+.5-i*.2,CN,10);c3.rotation.set(Math.PI/2,r()*3,0)}obs.push({x0:cx2-.35,x1:cx2+.35,z0:cz2-.25,z1:cz2+.25})}
  spots.fire=[fx,H+.6,fz]}
 return{obs,plates,spots,parts:{flag,win:WGL},tick,lights:[[-323.68,H+2.3,-1560.85]]}}
/* a round rod from a to b */
function rodp(par,a,b,rad,m){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),L=A.distanceTo(B),e=new THREE.Mesh(new THREE.CylinderGeometry(rad,rad,L,6),m);e.position.copy(A).add(B).multiplyScalar(.5);e.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),B.clone().sub(A).normalize());par.add(e);return e}
