/* =====================================================================================================
   OLD QUARRY batch 1: the smelting yard and the mine head buildings. Needs fort-kit.js (fbKit: materials, helpers).
   Desert-local x/z; F is the pit floor height (QD.F = -12). Each function builds the LOOK; the moving parts the game
   drives are returned so the game keeps driving them exactly as now.

     qmFurnace(g, x, z, F)     the smelter (footprint 4 x 3.6 as now, mouth facing +z): a firebrick furnace in a steel
                               frame, an arched firebox, a hood and flue up to a banded chimney with a ladder, an ash
                               door, a gauge. Returns {mouth} (its emissive material is what SM.mouth drove).
     qmMoldTable(g, x, z, F)   the ingot mold table (3.2 x 1.4): a cast table on legs, six molds in a cradle, a drip
                               tray. Returns {molds:[6 fill meshes]} at the same spots as SM.molds.
     qmGrinder(g, x, z, F)     the selling grinder (2 x 2): a housing with an open front showing the two wheels, a
                               feed hopper, a motor and belt guard, a coin chute and a tray. Returns {gw:[2 wheels]}
                               (same axis and spots as SM.gw).
     qmWinch(g, x, z, F, el)   the winch house (2.6 x 2.2), open on the side facing the headframe: a corrugated shed on
                               a slab, the drum on bearings, a diesel engine or (el) an electric motor and a control
                               cabinet. Returns {drum, wl, exh, ropeFrom:[x,y,z], obs}.
     qmAssay(g, x, z, F)       the assay office (2.6 x 2.4): a stone hut with a shop window, an awning, a counter with
                               the balance. Returns {bal} (the beam the game rocks on z), obs.
     qmOreHopper(g, x, z, F)   the ore hopper for excavator buckets: a braced steel frame, a riveted funnel with a
                               grizzly grate, a chute down into a concrete basin on the pit side. Returns {hop} (the
                               heap the game scales), pour() (call when ore goes in: rocks slide down the chute into
                               the basin), tick(dt) (call every frame; returns true while rocks are moving), heap, setFill.
   ===================================================================================================== */
function qmKit(){if(qmKit.k)return qmKit.k;const f=fbKit(),k=Object.create(f);const M=f.M;
 let sd=24681;const rnd=()=>((sd=Math.imul(sd^sd>>>15,sd|1)+0x6d2b79f5|0)>>>0)/4294967296;
 k.FB=(()=>{const m=M(0xffffff,{roughness:.95});m.map=f.tex(256,256,(c)=>{c.fillStyle='#4a2c20';c.fillRect(0,0,256,256);for(let y=0;y<16;y++)for(let x=-1;x<9;x++){const v=150+rnd()*45|0;c.fillStyle='rgb('+v+','+(v*.52|0)+','+(v*.36|0)+')';c.fillRect(x*32+(y%2)*16+1.5,y*16+1.5,29,13)}for(let i=0;i<40;i++){c.fillStyle='rgba(20,10,5,'+(rnd()*.25)+')';c.beginPath();c.arc(rnd()*256,rnd()*256,4+rnd()*14,0,7);c.fill()}});m.userData.s=.5;return m})();
 k.SOOT=M(0x2a2624,{roughness:1});k.RUST=M(0x7a4a2a,{roughness:.7,metalness:.4});k.STEEL=M(0x5a5e64,{metalness:.6,roughness:.4});k.YEL=M(0xd8a820,{roughness:.6,metalness:.2});
 k.CAST=M(0x2e3034,{metalness:.6,roughness:.45});k.STONE=(()=>{const m=M(0xffffff,{roughness:.95});m.map=f.tex(128,128,(c)=>{c.fillStyle='#b8ac90';c.fillRect(0,0,128,128);for(let y=0;y<6;y++)for(let x=-1;x<4;x++){const v=180+rnd()*40|0;c.fillStyle='rgb('+v+','+(v-8|0)+','+(v-30|0)+')';const w=30+rnd()*10;c.beginPath();c.roundRect?c.roundRect(x*36+(y%2)*18+2,y*21.3+2,w,18,4):c.rect(x*36+(y%2)*18+2,y*21.3+2,w,18);c.fill()}});m.userData.s=.6;return m})();
 return qmKit.k=k}

function qmFurnace(g,x,z,F){const k=qmKit(),{B,C,rod,slab,L}=k.H(g),M=k.M;const W=4,D=3.6,H=3.2,zf=z+D/2;
 /* plinth, firebrick body, a steel frame (corner angles and two bands), a cast hood over the top */
 B(W+.4,.3,D+.4,x,F+.15,z,k.PLINTH);B(W,H-.3,D,x,F+.3+(H-.3)/2,z,k.FB);
 for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])B(.16,H+.2,.16,x+a*(W/2+.02),F+(H+.2)/2+.1,z+b*(D/2+.02),k.CAST);
 for(const y of[1.1,2.4])for(const[w,d,ox,oz]of[[W+.08,.08,0,-D/2-.03],[W+.08,.08,0,D/2+.03],[.08,D+.08,-W/2-.03,0],[.08,D+.08,W/2+.03,0]]){if(oz>0&&y<2)continue;B(w,.12,d,x+ox,F+y,z+oz,k.CAST)}/* no low band across the firebox */
 slab([[-W/2-.15,0],[W/2+.15,0],[W/2-.5,.7],[-W/2+.5,.7]],D+.3,k.CAST,x,F+H,z,0).rotation.y=0;
 /* the firebox: an arched opening with a cast frame, the glowing mouth set back in it, a door swung open */
 const ar=[[-.75,0],[.75,0],[.75,.8]];for(let i=0;i<=10;i++){const a=i/10*Math.PI;ar.push([Math.cos(a)*.75,.8+Math.sin(a)*.45])}ar.push([-.75,.8]);
 const mouth=new THREE.Mesh(new THREE.ShapeGeometry(k.H(g).poly(ar.slice(0,1).concat(ar.slice(1)))),new THREE.MeshStandardMaterial({color:0x200800,emissive:0xff6010,emissiveIntensity:.4}));mouth.position.set(x,F+.75,zf+.02);g.add(mouth);
 const fr=[];for(let i=0;i<=12;i++){const a=i/12*Math.PI;fr.push([Math.cos(a)*.95,.8+Math.sin(a)*.62])}const frame=[[-.95,0],[-.75,0],[-.75,.8]];for(let i=10;i>=0;i--){const a=i/10*Math.PI;frame.push([Math.cos(a)*-.75*-1,.8+Math.sin(a)*.45])}
 {const outer=[[-.95,0],[-.75,0]];for(let i=0;i<=10;i++){const a=Math.PI-i/10*Math.PI;outer.push([Math.cos(a)*.75,.8+Math.sin(a)*.45])}outer.push([.75,0],[.95,0]);for(let i=0;i<=12;i++){const a=i/12*Math.PI;outer.push([Math.cos(a)*.95,.8+Math.sin(a)*.62])}slab(outer,.16,k.CAST,x,F+.75,zf+.08,0)}
 {const dg=new THREE.Group();dg.position.set(x+.95,F+.75,zf+.17);dg.rotation.y=-.35;g.add(dg);const dh=k.H(dg);/* an arched leaf, the same shape as the opening */const lp=[[0,0],[1.6,0],[1.6,.8]];for(let i=0;i<=12;i++){const a2=i/12*Math.PI;lp.push([.8+Math.cos(a2)*.8,.8+Math.sin(a2)*.5])}lp.push([0,.8]);dh.slab(lp,.08,k.CAST,0,0,0,0);for(const y of[.25,.75])dh.B(1.5,.08,.06,.8,y,.07,k.STEEL);{const ab=[];for(let i=0;i<=12;i++){const a2=i/12*Math.PI;ab.push([.8+Math.cos(a2)*.72,.8+Math.sin(a2)*.42])}for(let i=0;i<12;i++){const p0=ab[i],p1=ab[i+1];const sg=dh.B(Math.hypot(p1[0]-p0[0],p1[1]-p0[1])+.01,.06,.06,(p0[0]+p1[0])/2,(p0[1]+p1[1])/2,.07,k.STEEL);sg.rotation.z=Math.atan2(p1[1]-p0[1],p1[0]-p0[0])}}for(const y of[.25,1.0])dh.C(.06,.06,.16,.0,y,0,k.STEEL,null,null,8);dh.C(.05,.05,.25,1.35,.62,.1,k.STEEL,'z',null,8)}
 /* ash door and a sill, a temperature gauge, a hearth step */B(.7,.4,.06,x,F+.48,zf+.03,k.CAST);B(1.8,.15,.5,x,F+.38,zf+.25,k.CAST);
 C(.17,.17,.06,x+1.45,F+2.6,zf+.03,k.STL2,'z',null,16);{const gf=k.lab('°C',.25,.25,'#f0ece0','#c02020',90);gf.position.set(x+1.45,F+2.6,zf+.065);g.add(gf)}
 /* the flue: a stack rising from the hood, banded, with a ladder and a rain cap */const cx=x-1,cz=z-1,ch=18;C(.95,1.0,.8,cx,F+H+.6,cz,k.CAST,null,null,16);{const cm=k.FB.clone();cm.map=k.FB.map.clone();cm.map.needsUpdate=true;cm.map.repeat.set(2.5,ch/2);cm.userData={};C(.72,.86,ch,cx,F+H+.6+ch/2,cz,cm,null,null,16)}for(let y=2;y<ch;y+=3)C(.82,.82,.15,cx,F+H+.6+y,cz,k.CAST,null,null,16);
 C(.9,.75,.25,cx,F+H+.6+ch+.1,cz,k.CAST,null,null,16);{const sp=C(.6,.6,.5,cx,F+H+.6+ch+.6,cz,k.SOOT,null,null,16,true)}
 for(const s of[-.2,.2])rod([cx-.85,F+H+.8,cz+s],[cx-.85,F+H+.6+ch,cz+s],.025,k.STL);for(let y=F+H+1;y<F+H+ch;y+=.4)rod([cx-.85,y,cz-.2],[cx-.85,y,cz+.2],.015,k.STL);
 /* a coal bunker against the west side, a poker and a shovel leaning on it */B(1,1.1,1.6,x-W/2-.6,F+.55,z,k.RUST);B(.9,.15,1.5,x-W/2-.6,F+1.05,z,k.SOOT);rod([x-W/2-.15,F+.1,z+.6],[x-W/2-.05,F+1.6,z+.4],.025,k.STEEL);rod([x-W/2-.15,F+.1,z-.5],[x-W/2-.05,F+1.3,z-.6],.03,M(0x6a4a2a));
 L('SMELTERY',2.4,.45,'#2a1a10','#ffb060',60,x,F+2.85,zf+.04,0);
 return{mouth,obs:[{x0:x-W/2-1.1,x1:x+W/2+.2,z0:z-D/2-.2,z1:z+D/2+.2}]}}

function qmMoldTable(g,x,z,F){const k=qmKit(),{B,C,rod,L}=k.H(g),M=k.M;
 /* a cast iron table on four splayed legs, a cradle with six molds, a drip tray with spilled metal, a bar rack */
 B(3.2,.14,1.4,x,F+.83,z,k.CAST);B(3.3,.06,1.5,x,F+.9,z,k.STEEL);for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])rod([x+a*1.45,F,z+b*.58],[x+a*1.38,F+.76,z+b*.52],.06,k.CAST,null,8);
 B(3.0,.06,1.2,x,F+.3,z,k.STEEL);for(let i=0;i<4;i++)B(.12+i*.04,.02,.08,x-1+i*.6,F+.34,z+.2-i*.12,M(0xb88a40,{metalness:.8,roughness:.3}));
 const molds=[];for(let i=0;i<6;i++){const mx=x-1.25+i*.5;B(.42,.08,.9,mx,F+.94,z,k.CAST);for(const s of[-1,1])B(.04,.1,.9,mx+s*.19,F+1.0,z,k.CAST);for(const s of[-1,1])B(.42,.1,.04,mx,F+1.0,z+s*.43,k.CAST);
  const fill=new THREE.Mesh(new THREE.BoxGeometry(.32,.06,.78),new THREE.MeshBasicMaterial({color:0xff8030}));fill.position.set(mx,F+1.0,z);fill.visible=false;g.add(fill);molds.push(fill)}
 B(1.9,.36,.04,x,F+.58,z+.6,k.STEEL);L('INGOT MOLDS',1.8,.3,'#1a1a1a','#e0e0e0',60,x,F+.58,z+.622,0);
 /* a rack of finished bars at the end */B(.9,.7,.6,x+2.2,F+.35,z,k.STEEL);for(let i=0;i<4;i++)B(.16,.08,.5,x+1.95+i*.17,F+.74,z,M(0xd8b048,{metalness:.85,roughness:.25}));
 return{molds,obs:[{x0:x-1.7,x1:x+2.7,z0:z-.8,z1:z+.8}]}}

function qmGrinder(g,x,z,F){const k=qmKit(),{B,C,rod,L}=k.H(g),M=k.M;const BL=M(0x3a5a7a,{metalness:.5,roughness:.45});
 /* a housing with an open front (the wheels show), a riveted hopper, a motor and belt guard on the side */
 B(2,.2,2,x,F+.1,z,k.PLINTH);for(const s of[-1,1])B(.2,1.8,2,x+s*.9,F+1.1,z,BL);B(2,1.8,.2,x,F+1.1,z-.9,BL);B(2,.9,.2,x,F+.65,z+.9,BL);B(2,.12,2,x,F+2.0,z,BL);
 for(const s of[-1,1])for(const yy of[.6,1.6])C(.04,.04,.03,x+s*1.01,F+yy,z+.9,k.STL2,'x',null,6);
 const gw=[];for(const s of[-1,1]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.4,.4,1.4,16),M(0x8a8e94,{metalness:.8}));w.rotation.x=Math.PI/2;w.position.set(x+s*.42,F+1.95-.4,z);g.add(w);gw.push(w);for(let i=0;i<8;i++){const t=new THREE.Mesh(new THREE.BoxGeometry(.06,.06,1.38),M(0x5a5e64,{metalness:.8}));const a=i/8*Math.PI*2;t.position.set(Math.cos(a)*.4,Math.sin(a)*.4,0);t.rotation.z=a;w.add(t);t.rotation.x=0;t.position.set(Math.cos(a)*.4,0,Math.sin(a)*.4);t.rotation.set(0,-a,0);t.geometry=new THREE.BoxGeometry(.06,1.38,.06)}}
 {const hp=new THREE.Mesh(new THREE.CylinderGeometry(1.15,.55,1.0,4,1,true),M(0x6a7a8a,{metalness:.5,side:THREE.DoubleSide}));hp.rotation.y=Math.PI/4;hp.position.set(x,F+2.55,z);g.add(hp);B(1.65,.08,1.65,x,F+3.06,z,k.STEEL)}
 B(.6,.6,.8,x+1.3,F+.5,z-.4,k.CAST);C(.25,.25,.5,x+1.3,F+.95,z-.4,k.STEEL,'x',null,12);B(.12,1.1,1.6,x+1.04,F+1.2,z,k.YEL);
 /* the coin chute and a tray of coins */const ch=B(.45,.06,1.0,x+.7,F+.55,z+1.3,M(0xd8b020,{metalness:.7}));ch.rotation.x=.4;B(.7,.15,.5,x+.7,F+.18,z+1.85,k.STEEL);for(let i=0;i<6;i++)C(.05,.05,.02,x+.55+(i%3)*.12,F+.27,z+1.75+(i>2?.15:0),M(0xe8c040,{metalness:.9,roughness:.2}),null,null,10);
 L('SELL · GRINDER',1.6,.3,'#1a2a3a','#ffe9a8',60,x-.2,F+.95,z+1.012,0);
 return{gw,obs:[{x0:x-1.1,x1:x+1.6,z0:z-1.1,z1:z+2.1}]}}

function qmWinch(g,x,z,F,el){const k=qmKit(),{B,C,rod,slab,L}=k.H(g),M=k.M;const W=2.6,D=2.2,H=2.2,CL=M(el?0x3a5a7a:0x7a6a3a,{roughness:.6,metalness:.3});CL.map=k.CORR.map;CL.userData.s=.5;
 /* slab, three corrugated walls (the side facing the headframe, -z, is open), a mono-pitch roof */
 B(W+.4,.2,D+.4,x,F+.1,z,k.PLINTH);B(W,H,.06,x,F+.2+H/2,z+D/2,CL);for(const s of[-1,1])B(.06,H,D,x+s*W/2,F+.2+H/2,z,CL);for(const[a,b]of[[-1,-1],[1,-1]])B(.1,H,.1,x+a*W/2,F+.2+H/2,z+b*D/2,k.STEEL);
 B(W+.4,.08,D+.5,x,F+.2+H+.04,z,CL);B(W+.06,.12,.12,x,F+.2+H-.06,z-D/2,k.STEEL);/* a flat roof resting on the walls, a lintel over the open side */
 /* the drum: on two bearing pedestals, flanges, wound rope */const drum=new THREE.Group();drum.position.set(x,F+.95,z-.3);g.add(drum);const dh=k.H(drum);
 const dm=dh.C(.42,.42,1.1,0,0,0,M(0x3a3a3a,{metalness:.8}),'x',null,18);for(const e of[-1,1])dh.C(.58,.58,.06,e*.55,0,0,k.RD,'x',null,18);for(let i=0;i<10;i++){const t=new THREE.Mesh(new THREE.TorusGeometry(.44,.025,4,18),k.M(0x2a2a2a));t.rotation.y=Math.PI/2;t.position.x=-.45+i*.1;drum.add(t)}
 C(.08,.08,1.6,x,F+.95,z-.3,k.STL2,'x',null,10);for(const s of[-1,1]){B(.25,.75,.4,x+s*.8,F+.55,z-.3,k.CAST)}
 /* engine or motor, a control box, an exhaust */let exh=null,wl=null;if(!el){B(1,.7,.8,x+.4,F+.55,z+.55,k.RUST);B(.7,.25,.6,x+.4,F+1.0,z+.55,k.CAST);exh=C(.06,.06,1.6,x+.8,F+1.6,z+.8,k.SOOT,null,null,8);C(.09,.07,.12,x+.8,F+2.45,z+.8,k.SOOT,null,null,8)}
 else{C(.32,.32,.7,x+.5,F+.8,z+.5,M(0x4a6a8a,{metalness:.5}),'x',null,14);const cb=B(.6,1.1,.35,x-.8,F+.75,z+.75,M(0x5a6a7a,{metalness:.5}));wl=[0,1,2].map(i=>{const l=new THREE.Mesh(new THREE.SphereGeometry(.04,8,6),new THREE.MeshBasicMaterial({color:0x30ff60}));l.position.set(x-.98+i*.18,F+1.05,z+.56);g.add(l);return l})}
 L(el?'ELECTRIC HOIST':'WINCH HOUSE',1.8,.3,'#1a1a1a','#e8c020',60,x,F+.2+H-.3,z+D/2+.035,0);
 return{drum,wl,exh,ropeFrom:[x,F+1.37,z-.3],obs:[{x0:x-W/2-.1,x1:x+W/2+.1,z0:z-D/2,z1:z+D/2+.1}]}}

function qmAssay(g,x,z,F){const k=qmKit(),{B,C,rod,slab,L}=k.H(g),M=k.M;const W=2.6,D=2.4,H=2.4,zf=z+D/2;
 B(W+.3,.2,D+.3,x,F+.1,z,k.PLINTH);B(W,H,D-.2,x,F+.2+H/2,z-.1,k.STONE);
 /* front wall with a shop window, a door, quoins, a cornice and a flat roof with a parapet */
 for(const s of[-1,1])for(let i=0;i<5;i++)B(.18,.36,.18,x+s*(W/2-.02),F+.42+i*.48,zf-.18,M(0xd0c4a8));
 B(1.1,.85,.05,x-.55,F+1.45,zf-.17,M(0x335070,{metalness:.4,roughness:.2}));B(1.24,.08,.12,x-.55,F+1.02,zf-.15,M(0xd0c4a8));for(const dx of[-.6,0,.6])B(.05,.85,.06,x-.55+dx*.95,F+1.45,zf-.15,M(0x5a3a22));
 B(.75,1.8,.05,x+.75,F+1.1,zf-.17,M(0x5a3a22));C(.04,.04,.06,x+.95,F+1.1,zf-.13,k.BRASS,'z',null,8);
 B(W+.2,.18,D+.1,x,F+.2+H+.09,z-.1,k.CAP);for(const[w,d,ox,oz]of[[W+.2,.15,0,-D/2-.03],[W+.2,.15,0,D/2-.18],[.15,D,-W/2-.03,-.1],[.15,D,W/2+.03,-.1]])B(w,.3,d,x+ox,F+.2+H+.32,z+oz,k.CAP);
 /* the striped awning on two brackets, a counter under it, the balance */
 const st=k.tex(64,8,(c)=>{for(let i=0;i<8;i++){c.fillStyle=i%2?'#e8e0d0':'#2a6a3a';c.fillRect(i*8,0,8,8)}});const aw=new THREE.Mesh(new THREE.BoxGeometry(W+.1,.05,1.0),M(0xffffff,{map:st}));aw.position.set(x,F+1.98,zf+.28);aw.rotation.x=.3;g.add(aw);for(const s of[-1,1])rod([x+s*(W/2-.08),F+1.5,zf-.2],[x+s*(W/2-.08),F+1.8,zf+.7],.025,k.STEEL);/* brackets from the wall up under the awning's front edge */
 B(2.1,.1,.6,x,F+1.0,zf+.2,M(0x6a4a2a));B(2.1,.82,.06,x,F+.59,zf+.47,M(0x5a3a22));for(const s of[-1,1])B(.06,.82,.5,x+s*1.02,F+.59,zf+.2,M(0x5a3a22));
 const CU=M(0xc88a40,{metalness:.85,roughness:.25});const bal=new THREE.Group();bal.position.set(x,F+1.05,zf+.2);g.add(bal);const bh=k.H(bal);bh.C(.12,.14,.04,0,.02,0,CU,null,null,12);bh.C(.03,.04,.5,0,.27,0,CU,null,null,8);const bm=new THREE.Group();bm.position.y=.52;bal.add(bm);const mh=k.H(bm);mh.B(.7,.03,.03,0,0,0,CU);
 for(const s of[-1,1]){mh.rod([s*.33,0,0],[s*.33,-.17,0],.004,CU);mh.C(.12,.1,.03,s*.33,-.18,0,CU,null,null,12)}
 L('ASSAY OFFICE',2.4,.28,'#1a2a3a','#ffe9a8',60,x,F+.2+H+.32,zf-.105+.008,0);/* on the parapet, above the awning */
 return{bal:bm,obs:[{x0:x-W/2-.15,x1:x+W/2+.15,z0:z-D/2-.15,z1:zf+.55}]}}

function qmOreHopper(g,x,z,F){const k=qmKit(),{B,C,rod,L}=k.H(g),M=k.M;const S=1.1,H=3.0;
 /* four legs on pads, cross braces, a platform round the top with a rail and a ladder */
 for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]]){B(.5,.18,.5,x+a*S,F+.09,z+b*S,k.PLINTH);B(.2,H,.2,x+a*S,F+H/2+.1,z+b*S,k.YEL)}
 for(const[a0,b0,a1,b1]of[[-1,-1,1,-1],[-1,1,1,1],[-1,-1,-1,1],[1,-1,1,1]]){rod([x+a0*S,F+.3,z+b0*S],[x+a1*S,F+H-.3,z+b1*S],.04,k.STEEL);rod([x+a1*S,F+.3,z+b1*S],[x+a0*S,F+H-.3,z+b0*S],.04,k.STEEL);B(Math.abs(a1-a0)*S+.2||.12,.12,Math.abs(b1-b0)*S+.2||.12,x+(a0+a1)/2*S,F+H,z+(b0+b1)/2*S,k.YEL)}
 /* the funnel: riveted, a grizzly grate over the top, a chute with a gate out the bottom */
 const fn=new THREE.Mesh(new THREE.CylinderGeometry(2.1,.55,1.6,4,1,true),M(0x6a6e72,{metalness:.55,roughness:.5,side:THREE.DoubleSide}));fn.rotation.y=Math.PI/4;fn.position.set(x,F+H+.9,z);g.add(fn);
 {const rim=new THREE.Mesh(new THREE.CylinderGeometry(2.14,2.14,.12,4,1,true),k.CAST);rim.rotation.y=Math.PI/4;rim.position.set(x,F+H+1.7,z);g.add(rim)}for(let i=-3;i<=3;i++)B(.06,.06,2.9,x+i*.42,F+H+1.72,z,k.CAST);
 B(.7,.6,.7,x,F+H-.2,z,k.CAST);
 /* the chute: an open steel trough from the hopper's outlet down into a concrete basin on the pit side (-z) */const c0=[x,F+H-.55,z-.3],c1=[x,F+1.15,z-3.4],cl=Math.hypot(c1[1]-c0[1],c1[2]-c0[2]),ca=Math.atan2(c0[1]-c1[1],c0[2]-c1[2]);
 const tr=new THREE.Group();tr.position.set(x,(c0[1]+c1[1])/2,(c0[2]+c1[2])/2);tr.rotation.x=-ca;tr.userData.fix=1;g.add(tr);const T=k.H(tr);T.B(.7,.05,cl,0,0,0,k.STEEL);for(const s2 of[-1,1])T.B(.05,.3,cl,s2*.36,.13,0,k.STEEL);
 for(const s2 of[-1,1])rod([x+s2*.36,F+.1,z-2.6],[x+s2*.36,F+1.55,z-2.6],.04,k.STEEL);
 /* the basin: low concrete walls round a sunken floor, an ore heap that grows as it fills */const bz=z-4.6,BW2=3.2,BD=2.4,BH=.9;B(BW2,.12,BD,x,F+.06,bz,k.PLINTH);for(const[w,d,ox,oz]of[[BW2,.25,0,-BD/2+.125],[BW2,.25,0,BD/2-.125],[.25,BD,-BW2/2+.125,0],[.25,BD,BW2/2-.125,0]])B(w,BH,d,x+ox,F+BH/2,bz+oz,k.PRE);for(const[w,d,ox,oz]of[[BW2+.06,.31,0,-BD/2+.125],[BW2+.06,.31,0,BD/2-.125],[.31,BD+.06,-BW2/2+.125,0],[.31,BD+.06,BW2/2-.125,0]])B(w,.06,d,x+ox,F+BH+.03,bz+oz,k.CAP);
 const heap=new THREE.Mesh(new THREE.DodecahedronGeometry(1,1),M(0x8a7a6a,{roughness:1}));heap.scale.set(1.2,.3,.9);heap.position.set(x,F+.15,bz);g.add(heap);
 /* rocks that slide down the chute and bounce into the basin when the game calls pour() */const RK=M(0x9a8a70,{roughness:1}),rk=[];for(let i=0;i<10;i++){const m=new THREE.Mesh(new THREE.DodecahedronGeometry(.11+((i*7)%4)*.03,0),RK);m.visible=false;g.add(m);rk.push({m,t:-1,d:i*.12,o:((i*5)%7-3)*.07})}
 let fill=.3;const pour=()=>{for(const r of rk)r.t=-r.d};const tick=dt=>{let busy=false;for(const r of rk){if(r.t<-5)continue;r.t+=dt;if(r.t<0){busy=true;continue}const u=r.t/0.9;if(u<1){busy=true;r.m.visible=true;r.m.position.set(c0[0]+r.o,c0[1]+(c1[1]-c0[1])*u+.12,c0[2]+(c1[2]-c0[2])*u);r.m.rotation.x+=dt*9}else{const v=(r.t-.9)/.4;if(v<1){busy=true;r.m.position.set(c1[0]+r.o,c1[1]-v*.9+Math.sin(v*Math.PI)*.25,c1[2]-v*1.1)}else{r.m.visible=false;r.t=-9;fill=Math.min(1,fill+.04)}}}heap.scale.y=.15+fill*.45;return busy};

 const hop=new THREE.Mesh(new THREE.DodecahedronGeometry(1,0),M(0x8a7a6a,{roughness:1}));hop.scale.set(1,.35,1);hop.position.set(x,F+H+1.5,z);g.add(hop);
 L('ORE HOPPER',1.6,.32,'#1a1a1a','#e8c020',60,x,F+1.6,z+S+.12,0);B(1.7,.4,.04,x,F+1.6,z+S+.1,k.STEEL);
 return{hop,pour,tick,heap,setFill:f=>{fill=f},obs:[[-1,-1],[1,-1],[-1,1],[1,1]].map(([a,b])=>({x0:x+a*S-.15,x1:x+a*S+.15,z0:z+b*S-.15,z1:z+b*S+.15})).concat([{x0:x-BW2/2,x1:x+BW2/2,z0:bz-BD/2,z1:bz+BD/2}])}}

/* qmPad(g, x0, x1, z0, z1, F, o): a concrete foundation the buildings stand on, 10 cm thick: a bevelled edge band,
   saw-cut joints every 3 m, a drain channel along one side (o.drain 'n'|'s'|'e'|'w'), yellow walkway lines (o.walk:
   [[x0,z0,x1,z1],..]). Players walk on it: add a plate at F + 0.1 over its footprint. */
function qmPad(g,x0,x1,z0,z1,F,o){o=o||{};const k=qmKit(),{B,rod}=k.H(g),M=k.M,T=.1,cx=(x0+x1)/2,cz=(z0+z1)/2;
 const CO=(()=>{const m=M(0xffffff,{roughness:.9});m.map=k.tex(128,128,(c)=>{c.fillStyle='#8f897e';c.fillRect(0,0,128,128);let s=5;const r=()=>((s=s*16807%2147483647)/2147483647);for(let i=0;i<900;i++){c.fillStyle=r()<.5?'rgba(80,74,64,.14)':'rgba(230,225,215,.1)';c.fillRect(r()*128,r()*128,1,1)}for(let i=0;i<6;i++){c.fillStyle='rgba(60,50,40,.035)';c.beginPath();c.ellipse(r()*128,r()*128,10+r()*20,6+r()*12,r()*3,0,7);c.fill()}});m.userData.s=1/2;return m})();
 B(x1-x0,T,z1-z0,cx,F+T/2,cz,CO);
 const ED=M(0x8a857a,{roughness:.95});for(const[w,d,x,z]of[[x1-x0+.2,.2,cx,z0-.05],[x1-x0+.2,.2,cx,z1+.05],[.2,z1-z0,x0-.05,cz],[.2,z1-z0,x1+.05,cz]])B(w,T-.03,d,x,F+(T-.03)/2,z,ED);
 const JT=M(0x5a564e,Object.assign({roughness:1},k.POL));for(let x=x0+3;x<x1-.5;x+=3)B(.03,.01,z1-z0-.2,x,F+T+.004,cz,JT);for(let z=z0+3;z<z1-.5;z+=3)B(x1-x0-.2,.01,.03,cx,F+T+.004,z,JT);
 if(o.drain){const X=o.drain=='n'||o.drain=='s',pos=o.drain=='n'?z0+.35:o.drain=='s'?z1-.35:o.drain=='w'?x0+.35:x1-.35;const L=X?x1-x0-.4:z1-z0-.4;
  X?B(L,.012,.3,cx,F+T+.003,pos,k.tier(M(0x2a2826,{roughness:.9}),2)):B(.3,.012,L,pos,F+T+.003,cz,k.tier(M(0x2a2826,{roughness:.9}),2));
  for(let u=-L/2+.3;u<L/2;u+=.15)X?B(.04,.016,.3,cx+u,F+T+.008,pos,k.STEEL):B(.3,.016,.04,pos,F+T+.008,cz+u,k.STEEL)}
 for(const[a,b,c,d]of o.walk||[]){const len=Math.hypot(c-a,d-b),X=Math.abs(c-a)>Math.abs(d-b);X?B(len,.01,.1,(a+c)/2,F+T+.005,b,k.LINEY):B(.1,.01,len,a,F+T+.005,(b+d)/2,k.LINEY)}
 return{plate:{x0,x1,z0,z1,y:F+T}}}

/* qmTurn(fn, g, x, z, F, ...more): builds any of the above turned round (facing -z, out into the pit) about its own
   centre (x, z). Returns the same hooks; obs boxes are mirrored to match. */
function qmTurn(fn,g,x,z,F,...more){const gg=new THREE.Group();gg.position.set(x,0,z);gg.rotation.y=Math.PI;gg.userData.fix=1;g.add(gg);const r=fn(gg,0,0,F,...more)||{};
 if(r.obs)r.obs=r.obs.map(o=>({x0:x-o.x1,x1:x-o.x0,z0:z-o.z1,z1:z-o.z0}));if(r.ropeFrom)r.ropeFrom=[x-r.ropeFrom[0],r.ropeFrom[1],z-r.ropeFrom[2]];r.group=gg;return r}
