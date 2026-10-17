/* =====================================================================================================
   r618: THE OLD QUARRY, REWORKED (docs/design/old-quarry.md).
   The quarry's models were "lazily made". The design chat's new ones replace them, and the layout is tidied:
   - the smelting yard (furnace, molds, grinder, assay office) now faces the pit, on concrete foundations;
   - the winch house, the skip hoist and its miners, the refinery and the blower are moved out of each other's way;
   - new crusher and conveyor, a walk-in site office, four floodlight towers, an entrance board;
   - the eight processing machines in two tidy rows facing a walkway, with ore riding the belts between them;
   - the casting robot, arc furnace, die press, launder, ore feed and refinery remodelled;
   - a crucible rail where the pot tips in its bail, the drill rig on the pit floor, a proper haul truck that backs
     up to the crusher, and the daily blast with its charge in front of the rock pile.
   The models below are the design chat's files (docs/design/models/quarry-yard.js, quarry-rim.js, quarry-proc.js,
   quarry-works.js, quarry-pit.js), copied unchanged. The wiring is in dx581, dx587, dx589 and dx591.
   ===================================================================================================== */

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
 C(.17,.17,.06,x+1.45,F+2.72,zf+.03,k.STL2,'z',null,16);{/* a round dial: ticks, a red zone, a needle, °C */const dt=k.tex(128,128,(c,w,h)=>{c.fillStyle='#f0ece0';c.beginPath();c.arc(64,64,63,0,7);c.fill();c.strokeStyle='#1a1a1a';c.lineWidth=3;for(let i=0;i<=10;i++){const a=Math.PI*.75+i/10*Math.PI*1.5;c.beginPath();c.moveTo(64+Math.cos(a)*46,64+Math.sin(a)*46);c.lineTo(64+Math.cos(a)*56,64+Math.sin(a)*56);c.stroke()}c.strokeStyle='#c02020';c.lineWidth=7;c.beginPath();c.arc(64,64,51,Math.PI*1.95,Math.PI*2.25);c.stroke();c.fillStyle='#c02020';c.font='bold 22px Arial';c.textAlign='center';c.fillText('°C',64,98);const a=Math.PI*.75+.7*Math.PI*1.5;c.strokeStyle='#1a1a1a';c.lineWidth=4;c.beginPath();c.moveTo(64,64);c.lineTo(64+Math.cos(a)*44,64+Math.sin(a)*44);c.stroke();c.fillStyle='#1a1a1a';c.beginPath();c.arc(64,64,6,0,7);c.fill()});const gf=new THREE.Mesh(new THREE.CircleGeometry(.14,24),new THREE.MeshBasicMaterial({map:dt}));gf.position.set(x+1.45,F+2.72,zf+.062);g.add(gf);const bz=new THREE.Mesh(new THREE.TorusGeometry(.15,.02,6,24),k.STEEL);bz.position.set(x+1.45,F+2.72,zf+.062);g.add(bz)}
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

/* =====================================================================================================
   OLD QUARRY batch 2: the rim. Needs fort-kit.js and quarry-yard.js (qmKit, qmPad). Desert-local x/z, ground y 0.

     qmCrusher(g, cx, cz)   the primary crusher at CR (cx, cz) and its conveyor to the stockpile, same spots as now:
                            a steel crusher house on a concrete plinth with a dump hopper on top (the truck tips into it),
                            the jaw, two flywheels, a motor and V-belt guard, a walkway with a rail and a ladder; the
                            conveyor (P0 → P1 as now) on lattice trestles with a walkway, skirting and a head pulley
                            hood; the gravel stockpile. Returns {btx, fws, jaw, cv, L, rocks, obs, tick}: the same hooks
                            as dx581 (belt texture scrolls, flywheels turn on x, jaw moves on y, rocks ride along cv's z),
                            plus tick(dt): call it every frame to drop rocks out of the spout and roll them down the pile.
     qmOffice(g)            the walk-in site office, x -134..-122, z -1496..-1485, door in the north wall: a prefab
                            cabin on piers with a porch and steps, windows, a sign; inside a floor, a desk run along the
                            west wall for the tycoon computer (which stays where the game puts it, -130.4,-1487.6), a
                            filing cabinet, a site map, a hard-hat rack, a water cooler, a ceiling light.
                            Returns {obs, plate} (the walls with a 1.4 m door gap; the floor plate at y 0.6).
     qmFlood(g, x, z, aimX, aimZ)   a 14 m lattice floodlight tower with a caged ladder and four lamps aimed at a point.
     qmEntrance(g, x, z, ry)  the OLD QUARRY entrance board on two posts with the company name and a haul-road arrow.
   ===================================================================================================== */
function qmCrusher(g,cx,cz){const k=qmKit(),{B,C,rod,slab,L,tube}=k.H(g),M=k.M;const GR=M(0x5a6a5a,{metalness:.45,roughness:.5}),obs=[];
 /* plinth and the crusher house: 6 x 5, 4 m high, ribbed panels, a dump hopper on top (rim at 6.9 as now) */
 B(7.4,.4,6.4,cx,.2,cz,k.PLINTH);B(6,3.6,5,cx,2.2,cz,GR);for(let i=-2;i<=2;i++){B(.12,3.6,.08,cx+i*1.4,2.2,cz+2.54,k.STEEL);B(.12,3.6,.08,cx+i*1.4,2.2,cz-2.54,k.STEEL)}B(6.2,.2,5.2,cx,4.08,cz,k.CAST);
 const hp=new THREE.Mesh(new THREE.CylinderGeometry(3.3,1.5,2.7,4,1,true),M(0x6a7078,{metalness:.5,roughness:.45,side:THREE.DoubleSide}));hp.rotation.y=Math.PI/4;hp.position.set(cx,5.55,cz);g.add(hp);
 {const rim=new THREE.Mesh(new THREE.CylinderGeometry(3.36,3.36,.2,4,1,true),k.YEL);rim.rotation.y=Math.PI/4;rim.position.set(cx,6.9,cz);g.add(rim)}for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])rod([cx+a*2.2,4.2,cz+b*1.8],[cx+a*2.2,6.8,cz+b*1.8],.08,k.YEL);
 /* the jaw (moves), two flywheels on a shaft (turn), a motor and a belt guard */
 const jaw=new THREE.Mesh(new THREE.BoxGeometry(5.6,.5,.4),k.CAST);jaw.position.set(cx,4.2,cz+1.6);g.add(jaw);
 const fws=[];C(.16,.16,7,cx,2.2,cz+.8,k.STL2,'x',null,10);for(const sd of[-1,1]){const fw=new THREE.Group();fw.position.set(cx+sd*3.25,2.2,cz+.8);g.add(fw);const h=k.H(fw);const tr=new THREE.Mesh(new THREE.TorusGeometry(1.1,.16,10,28),k.CAST);tr.rotation.y=Math.PI/2;fw.add(tr);
  for(let i=0;i<6;i++){const sp=new THREE.Mesh(new THREE.BoxGeometry(.1,2.1,.14),k.CAST);sp.rotation.x=i*Math.PI/6;fw.add(sp)}h.C(.25,.25,.4,0,0,0,k.STL2,'x',null,14);fws.push(fw);B(.5,1.4,.6,cx+sd*3.25,.75,cz+.8,k.CAST)}
 B(1.6,1.1,1.2,cx-3.9,.95,cz-1.6,M(0x2a5a8a,{metalness:.5}));C(.32,.32,.6,cx-3.9,1.1,cz-2.5,k.STL2,'z',null,12);B(.25,1.8,.9,cx-3.4,1.6,cz-1.6,k.YEL);
 /* walkway round three sides at 4.2 m with a rail, a ladder up the east side */
 for(const[w,d,x,z]of[[7,.9,cx,cz-2.95],[7,.9,cx,cz+2.95],[.9,6.8,cx+3.45,cz]])B(w,.08,d,x,4.15,z,M(0x8a8e94,{metalness:.6}));
 for(const[x0,z0,x1,z1]of[[cx-3.5,cz-3.4,cx+3.9,cz-3.4],[cx-3.5,cz+3.4,cx+3.9,cz+3.4],[cx+3.9,cz-3.4,cx+3.9,cz+3.4]]){rod([x0,5.2,z0],[x1,5.2,z1],.03,k.YEL);rod([x0,4.7,z0],[x1,4.7,z1],.025,k.YEL);const n=Math.round(Math.hypot(x1-x0,z1-z0)/1.4);for(let i=0;i<=n;i++){const t=i/n;rod([x0+(x1-x0)*t,4.2,z0+(z1-z0)*t],[x0+(x1-x0)*t,5.2,z0+(z1-z0)*t],.03,k.YEL)}}
 for(const s of[-.22,.22])rod([cx+3.95,0,cz+1.5+s],[cx+3.95,4.2,cz+1.5+s],.03,k.STEEL);for(let y=.3;y<4.2;y+=.3)rod([cx+3.95,y,cz+1.28],[cx+3.95,y,cz+1.72],.016,k.STEEL);
 L('PRIMARY CRUSHER',3.2,.5,'#e8c020','#1a1a1a',60,cx,3.2,cz+2.6,0);obs.push({x0:cx-3.7,x1:cx+3.7,z0:cz-3.2,z1:cz+3.2});
 /* the conveyor: P0 at the crusher's discharge, P1 over the stockpile (as dx581). Belt, rollers, frame, skirting,
    a walkway alongside, lattice trestles, a hood over the head pulley */
 const P0=[cx+4.2,.9,cz-1.5],P1=[cx+18,9,cz-14];
 /* the discharge: an opening in the crusher's east wall, a sloped chute with side plates that drops onto the belt's tail,
    and a skirted feed box over the belt so the rocks land on it */B(.1,.8,1.4,cx+3.02,2.0,cz-1.5,k.SOOT);


 const Lc=Math.hypot(P1[0]-P0[0],P1[1]-P0[1],P1[2]-P0[2]);const cv=new THREE.Group();cv.position.set((P0[0]+P1[0])/2,(P0[1]+P1[1])/2,(P0[2]+P1[2])/2);g.add(cv);{const dx=P1[0]-P0[0],dy=P1[1]-P0[1],dz=P1[2]-P0[2];cv.rotation.set(-Math.atan2(dy,Math.hypot(dx,dz)),Math.atan2(dx,dz),0,'YXZ')}
 const V=k.H(cv);const btx=(typeof qtBeltTex=='function'?qtBeltTex():k.tex(32,64,(c)=>{c.fillStyle='#1c1c1c';c.fillRect(0,0,32,64);c.fillStyle='#2c2c2c';for(let y=0;y<64;y+=8)c.fillRect(0,y,32,3)}));btx.repeat.set(1,Lc/2);
 const bg=new THREE.BoxGeometry(1.2,.12,Lc);{const uv=bg.attributes.uv;for(let i=0;i<uv.count;i++)uv.setY(i,1-uv.getY(i))}/* flipped so the game's scroll (offset.y going down) runs the belt uphill, the way the rocks go */const belt=new THREE.Mesh(bg,new THREE.MeshStandardMaterial({map:btx,roughness:.8}));cv.add(belt);
 V.C(.3,.3,1.5,0,-.05,-Lc/2,k.CAST,'x',null,14);/* tail pulley */
 /* the feed box: a closed steel box over the first 2 m of the belt, the chute lands in its top, the rocks come out under
    a rubber curtain at its far end (the game's rocks start inside it, so you never see them appear) */
 {const FB=M(0x4a5458,{metalness:.5,roughness:.45}),z0=-Lc/2-.25,z1=-Lc/2+2.1,zc=(z0+z1)/2,zl=z1-z0;for(const s2 of[-1,1])V.B(.06,.75,zl,s2*.74,.4,zc,FB);V.B(1.54,.06,zl,0,.8,zc,FB);V.B(1.54,.75,.06,0,.4,z0,FB);V.B(1.0,.04,.9,0,.84,z0+.75,k.SOOT);
  for(let i=0;i<6;i++)V.B(.22,.55,.02,-.58+i*.232,.5,z1+.02,M(0x1a1a1a,{roughness:.9}));V.B(1.54,.12,.08,0,.82,z1,k.STEEL)}
 /* the chute: a closed steel duct from the crusher's discharge opening down to a collar that sits in the feed box's top hole */
 {g.updateMatrixWorld(true);cv.updateMatrixWorld(true);const T=new THREE.Vector3(0,.84,-Lc/2+.5);cv.localToWorld(T);g.worldToLocal(T);
  const A=new THREE.Vector3(cx+3.05,2.4,cz-1.5),Bt=new THREE.Vector3(T.x,T.y+.75,T.z),d=Bt.clone().sub(A),len=d.length(),DM=M(0x4a5458,{metalness:.5,roughness:.45});
  const du=new THREE.Group();du.position.copy(A).add(Bt).multiplyScalar(.5);du.lookAt(du.position.clone().add(d));du.userData.fix=1;g.add(du);const D=k.H(du);
  D.B(.9,.06,len+.1,0,-.25,0,DM);D.B(.9,.06,len+.1,0,.25,0,DM);for(const s2 of[-1,1])D.B(.06,.56,len+.1,s2*.45,0,0,DM);for(const zz of[-len/2+.05,len/2-.05])D.B(1.02,.68,.08,0,0,zz,k.STEEL);
  B(1.0,.85,.9,Bt.x,T.y+.42,Bt.z,DM);B(1.1,.08,1.0,Bt.x,T.y+.1,Bt.z,k.STEEL);/* the collar: a box from the duct's end down into the hole */
  B(1.06,.7,1.06,cx+3.1,2.4,cz-1.5,k.STEEL)/* a flange where the duct leaves the crusher */}
 for(let z=-Lc/2+.5;z<Lc/2;z+=.9){const ro=V.C(.07,.07,1.3,0,-.1,z,k.STL2,'x',null,8)}for(const s of[-1,1]){V.B(.08,.35,Lc,s*.72,0,0,k.YEL);V.B(.04,.25,Lc,s*.62,.16,0,M(0x2a2a2a))}
 V.B(.8,.05,Lc,1.25,-.18,0,M(0x8a8e94,{metalness:.6}));for(let z=-Lc/2+1;z<Lc/2;z+=1.6)V.B(.04,.9,.04,1.62,.25,z,k.YEL);V.B(.04,.04,Lc,1.62,.7,0,k.YEL);
 V.C(.35,.35,1.5,0,0,Lc/2,k.CAST,'x',null,14);/* the head: a boxed hood over the head pulley, open underneath, with a spout pointing down onto the pile */
 {const HG2=M(0x5a6a5a,{metalness:.45,roughness:.5});for(const s2 of[-1,1])V.B(.06,.9,1.3,s2*.78,.15,Lc/2-.05,HG2);V.B(1.62,.06,1.3,0,.62,Lc/2-.05,HG2);V.B(1.62,.9,.06,0,.15,Lc/2+.62,HG2);
  const sp=new THREE.Group();sp.position.set(0,-.3,Lc/2+.62);cv.add(sp);sp.rotation.x=.9;const S2=k.H(sp);S2.B(1.0,.06,.9,0,-.05,.0,HG2);for(const s2 of[-1,1])S2.B(.06,.4,.9,s2*.5,.15,0,HG2);S2.B(1.0,.4,.06,0,.15,.42,HG2);
  for(const s2 of[-1,1])V.B(.1,.1,1.4,s2*.82,-.35,Lc/2-.05,k.STEEL)}
 {const hx=P1[0]-P0[0],hz=P1[2]-P0[2],h=Math.hypot(hx,hz),qx=hz/h,qz=-hx/h;/* the belt's local +x on the ground */
  for(let i=0;i<4;i++){const t=(i+.5)/4,px=P0[0]+(P1[0]-P0[0])*t,py=P0[1]+(P1[1]-P0[1])*t,pz=P0[2]+(P1[2]-P0[2])*t,top=py-.32;
   const A=[px-qx*.95,pz-qz*.95],Bp=[px+qx*1.85,pz+qz*1.85];for(const[lx,lz]of[A,Bp]){rod([lx,0,lz],[lx,top,lz],.07,k.YEL);B(.45,.1,.45,lx,.05,lz,k.PLINTH)}
   rod([A[0],top,A[1]],[Bp[0],top,Bp[1]],.08,k.YEL);for(let y=.6;y+1.3<top-.2;y+=1.5){rod([A[0],y,A[1]],[Bp[0],y+1.3,Bp[1]],.035,k.STEEL);rod([Bp[0],y,Bp[1]],[A[0],y+1.3,A[1]],.035,k.STEEL)}
   for(const[lx,lz]of[A,Bp])obs.push({x0:lx-.25,x1:lx+.25,z0:lz-.25,z1:lz+.25})}}
 const rocks=[];for(let i=0;i<10;i++){const r=new THREE.Mesh(new THREE.DodecahedronGeometry(.22,0),M(0x9a8466,{roughness:1}));cv.add(r);rocks.push(r)}
 /* the stockpile: a gravel cone with a rough edge, a few spilled rocks */const pile=new THREE.Mesh(new THREE.ConeGeometry(8,8.3,20,3),M(0xffffff,{map:(typeof qTex=='function'?qTex('grav'):k.SAND.map),roughness:1}));{const p=pile.geometry.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i);if(y<4.1&&y>-4.1){const a=Math.atan2(p.getZ(i),p.getX(i));const f=1+.06*Math.sin(a*5)+.04*Math.sin(a*11);p.setX(i,p.getX(i)*f);p.setZ(i,p.getZ(i)*f)}}pile.geometry.computeVertexNormals()}pile.position.set(P1[0]+1.2,4.15,P1[2]-1.2);g.add(pile);
 /* rocks that leave the spout, drop onto the pile and roll down its side. tick(dt) moves them (call it every frame,
    beside the game's belt animation) */
 const PX=P1[0]+1.2,PZ=P1[2]-1.2,PR=8,PH=8.3;g.updateMatrixWorld(true);cv.updateMatrixWorld(true);const ex=new THREE.Vector3(0,-.55,Lc/2+.95);cv.localToWorld(ex);g.worldToLocal(ex);
 const fall=[];for(let i=0;i<8;i++){const m=new THREE.Mesh(new THREE.DodecahedronGeometry(.2+(i%3)*.04,0),M(0x9a8466,{roughness:1}));g.add(m);fall.push({m,t:i*.55,a:i*2.39})}
 const surf=(x,z)=>PH*Math.max(0,1-Math.hypot(x-PX,z-PZ)/PR)+.15;
 const tick=dt=>{for(const f of fall){f.t+=dt;const T=4.4,u=f.t%T;if(u<.35){/* the drop out of the spout */const v=u/.35,x=ex.x+(PX-ex.x)*v*.6,z=ex.z+(PZ-ex.z)*v*.6;f.m.position.set(x,ex.y-(ex.y-surf(x,z))*v*v,z)}
   else{/* rolling down the slope, slowing as it goes */const v=Math.min(1,(u-.35)/3.6),r=1+v*(PR-1.6)*(1-(1-v)*(1-v))/(1)*.9,a=f.a+Math.floor(f.t/T)*1.7;const x=PX+Math.cos(a)*r,z=PZ+Math.sin(a)*r;f.m.position.set(x,surf(x,z),z);f.m.rotation.x+=dt*(6-v*5);f.m.rotation.z+=dt*3}
   f.m.visible=u<3.9}};
 return{btx,fws,jaw,cv,L:Lc,rocks,obs,P0,P1,tick}}

function qmOffice(g){const k=qmKit(),{B,C,rod,slab,L}=k.H(g),M=k.M;const x0=-134,x1=-122,z0=-1496,z1=-1485,FY=.6,H=2.8,t=.15,cx=(x0+x1)/2,cz=(z0+z1)/2,obs=[];
 const CL=M(0xe6dfcc,{roughness:.7}),TR=M(0x3a5a7a,{roughness:.6,metalness:.2}),FL=M(0x6a6a62,{roughness:.8}),GL=M(0x4a6a80,{metalness:.5,roughness:.1,emissive:0x1a2a34});
 /* piers, a floor deck, skirting */for(let x=x0+.5;x<=x1-.4;x+=2.75)for(const z of[z0+.4,z1-.4])B(.4,FY,.4,x,FY/2,z,k.PLINTH);B(x1-x0,.12,z1-z0,cx,FY-.06,cz,FL);B(x1-x0+.06,.4,.06,cx,FY-.25,z1+.03,TR);B(x1-x0+.06,.4,.06,cx,FY-.25,z0-.03,TR);B(.06,.4,z1-z0,x0-.03,FY-.25,cz,TR);B(.06,.4,z1-z0,x1+.03,FY-.25,cz,TR);
 /* walls: cladding panels with trim strips, a door gap (1.4 m) in the north wall at x -128 */const dA=-128.7,dB=-127.3;
 const wall=(ax,c,a,b,win)=>{const len=b-a,m=(a+b)/2;if(len<.05)return;ax=='x'?B(len,H,t,m,FY+H/2,c,CL):B(t,H,len,c,FY+H/2,m,CL)};
 wall('x',z1-t/2,x0,dA);wall('x',z1-t/2,dB,x1);wall('x',z0+t/2,x0,x1);wall('z',x0+t/2,z0,z1);wall('z',x1-t/2,z0,z1);B(dB-dA,H-2.1,t,(dA+dB)/2,FY+2.1+(H-2.1)/2,z1-t/2,CL);
 obs.push({x0,x1:dA,z0:z1-t,z1},{x0:dB,x1,z0:z1-t,z1},{x0,x1,z0,z1:z0+t},{x0,x1:x0+t,z0,z1},{x0:x1-t,x1,z0,z1});
 for(let x=x0+1.5;x<x1;x+=1.5){if(x>dA-.2&&x<dB+.2)continue;B(.06,H,.04,x,FY+H/2,z1+.02,TR);B(.06,H,.04,x,FY+H/2,z0-.02,TR)}for(let z=z0+1.5;z<z1;z+=1.5){B(.04,H,.06,x0-.02,FY+H/2,z,TR);B(.04,H,.06,x1+.02,FY+H/2,z,TR)}
 for(const[x,z]of[[x0,z0],[x1,z0],[x0,z1],[x1,z1]])B(.12,H,.12,x,FY+H/2,z,TR);
 /* windows: two in the north wall, two east, one south (glass set in the wall, frames both sides) */
 const win=(ax,c,u,w,out)=>{const y=FY+1.6,h=1.0;if(ax=='x'){B(w,h,.02,u,y,c,GL);for(const s of[-1,1]){B(w+.12,.08,.1,u,y+s*(h/2+.04),c,TR);B(.08,h,.1,u+s*(w/2+.04),y,c,TR)}B(w+.2,.06,.22,u,y-h/2-.07,c+out*.06,TR)}else{B(.02,h,w,c,y,u,GL);for(const s of[-1,1]){B(.1,.08,w+.12,c,y+s*(h/2+.04),u,TR);B(.1,h,.08,c,y,u+s*(w/2+.04),TR)}B(.22,.06,w+.2,c+out*.06,y-h/2-.07,u,TR)}};
 /* cut the wall where windows go is too fussy for a cabin: the glass sits flush in a recess painted dark */
 for(const u of[-131.6,-124.6])win('x',z1+.005,u,1.6,1);for(const u of[-1493,-1488.5])win('z',x1+.005,u,1.4,1);win('x',z0-.005,-128,1.6,-1);
 /* roof: a shallow pitch with an overhang, a gutter */const RW=x1-x0+.8,RD=z1-z0+.8;{const r=B(RW,.1,RD/2+.05,cx,FY+H+.25,cz+RD/4,TR);r.rotation.x=.12;const r2=B(RW,.1,RD/2+.05,cx,FY+H+.25,cz-RD/4,TR);r2.rotation.x=-.12}B(RW,.2,.12,cx,FY+H+.02,z1+.42,k.STEEL);
 /* the porch: a deck, steps down to the ground, a rail, a canopy and a lamp over the door */B(4,.12,1.8,-128,FY-.06,z1+.9,FL);for(let i=0;i<3;i++)B(1.8,.15,.35,-128,.075+i*.15,z1+1.98+(2-i)*.35,k.CAP);for(const s of[-1,1]){rod([-128+s*2,FY,z1+1.75],[-128+s*2,FY+1,z1+1.75],.03,k.STEEL);rod([-128+s*2,FY+1,z1+.1],[-128+s*2,FY+1,z1+1.75],.03,k.STEEL);rod([-128+s*2,FY+1,z1+1.75],[-128+s*1,FY+1,z1+1.75],.03,k.STEEL)}
 B(2.6,.1,1.4,-128,FY+2.45,z1+.7,TR);for(const s of[-1,1])rod([-128+s*1.2,FY+2.4,z1+1.35],[-128+s*1.2,FY+1.7,z1+.08],.025,k.STEEL);B(.4,.06,.15,-128,FY+2.35,z1+.6,k.LIT);
 /* the door, swung open into the room */{const dg=new THREE.Group();dg.position.set(dA+.02,FY,z1-t);dg.rotation.y=1.4;g.add(dg);k.H(dg).B(1.36,2.05,.05,.68,1.03,0,TR);k.H(dg).C(.03,.03,.1,1.2,1.0,-.05,k.STL2,'z',null,8)}
 B(2.62,.36,.05,-128,FY+2.3,z1+1.42,TR);L('QUARRY OFFICE · MINE JOBS',2.5,.3,'#1a2a3a','#ffe9a8',60,-128,FY+2.3,z1+1.45,0);/* on the porch canopy's front edge */
 /* inside: a desk run along the west wall (the tycoon computer stands at its north end), a filing cabinet, a site map,
    hard hats on pegs, a water cooler, a ceiling light, a rug */const IN=M(0x6a4a2a,{roughness:.6});
 B(.8,.06,4.6,x0+.55,FY+.75,-1491.5,IN);for(const z of[-1493.6,-1489.4])B(.7,.72,.06,x0+.55,FY+.38,z,IN);B(.55,.7,.55,x0+.5,FY+.35,-1494.7,M(0x6a7078,{metalness:.5}));for(let i=0;i<3;i++)B(.4,.02,.02,x0+.78,FY+.15+i*.22,-1494.7,k.STL2);
 {const mp=k.tex(256,160,(c)=>{c.fillStyle='#e8e0c8';c.fillRect(0,0,256,160);c.strokeStyle='#8a6a3a';c.lineWidth=2;for(let i=0;i<6;i++){c.beginPath();c.ellipse(128,80,30+i*16,18+i*10,0,0,7);c.stroke()}c.fillStyle='#c02020';c.beginPath();c.arc(150,70,6,0,7);c.fill();c.fillStyle='#1a1a1a';c.font='bold 16px '+k.FONT;c.fillText('OLD QUARRY · SITE PLAN',8,152)});const m=new THREE.Mesh(new THREE.PlaneGeometry(2,1.25),new THREE.MeshStandardMaterial(Object.assign({map:mp,roughness:.9},k.PO2)));m.position.set(-128,FY+1.7,z0+t+.01);g.add(m);B(2.08,1.33,.03,-128,FY+1.7,z0+t+.005,k.CAST)}
 for(let i=0;i<4;i++){C(.02,.02,.12,x1-t-.06,FY+1.9,-1493.5+i*.45,k.STL2,'x',null,6);const hh=new THREE.Mesh(new THREE.SphereGeometry(.16,12,8,0,Math.PI*2,0,Math.PI/2),M([0xf0c020,0xf0c020,0xffffff,0xf06020][i]));hh.rotation.z=Math.PI/2;hh.position.set(x1-t-.16,FY+1.82,-1493.5+i*.45);g.add(hh)}
 B(.35,1.0,.35,x1-.4,FY+.5,z0+.45,M(0xe8e8e0));C(.13,.13,.4,x1-.4,FY+1.2,z0+.45,M(0x9ad0e8,{roughness:.2}),null,null,12);
 B(x1-x0-.3,.04,z1-z0-.3,cx,FY+H-.02,cz,M(0xe8e4d8,{roughness:.9}));B(1.2,.06,.3,cx,FY+H-.07,cz,k.LIT);/* a ceiling */B(3,.012,2,cx+1,FY+.007,cz-.5,k.tier(M(0x7a2a22,{roughness:1}),2));
 return{obs,plate:{x0,x1,z0,z1,y:FY}}}

function qmFlood(g,x,z,ax,az){const k=qmKit(),{B,C,rod}=k.H(g),M=k.M;const H=14,ry=Math.atan2(ax-x,az-z);
 B(1.6,.4,1.6,x,.2,z,k.PLINTH);const s=.55;for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])rod([x+a*s,.4,z+b*s],[x+a*s*.5,H,z+b*s*.5],.06,k.YEL);
 for(let y=1.6;y<H;y+=1.6){const f=1-(y/H)*.5;for(const[a0,b0,a1,b1]of[[-1,-1,1,-1],[-1,1,1,1],[-1,-1,-1,1],[1,-1,1,1]])rod([x+a0*s*f,y,z+b0*s*f],[x+a1*s*f,y,z+b1*s*f],.03,k.STEEL)}
 B(1.4,.12,1.4,x,H,z,k.STEEL);const hd=new THREE.Group();hd.position.set(x,H+.6,z);hd.rotation.y=ry;g.add(hd);const h=k.H(hd);h.C(.08,.08,.6,0,-.3,0,k.STEEL,null,null,8);h.B(2.6,.12,.12,0,0,0,k.STEEL);h.B(2.6,.12,.12,0,.8,0,k.STEEL);for(const sx of[-1.3,1.3])h.B(.1,.92,.1,sx,.4,0,k.STEEL);for(const[sx,sy]of[[-.65,0],[.65,0],[-.65,.8],[.65,.8]]){const lb=new THREE.Group();lb.position.set(sx,sy+.06,.18);lb.rotation.x=.5;hd.add(lb);const lh=k.H(lb);lh.B(.62,.5,.32,0,0,0,k.CAST);lh.B(.54,.42,.02,0,0,.17,k.LIT);for(const s2 of[-1,1])lh.B(.04,.3,.2,s2*.33,0,-.2,k.STEEL)}
 for(const sd of[-.18,.18])rod([x+s+.15,.4,z+sd],[x+s*.5+.15,H,z+sd],.02,k.STEEL);return{obs:[{x0:x-.8,x1:x+.8,z0:z-.8,z1:z+.8}]}}

function qmEntrance(g,x,z,ry){const k=qmKit(),gr=new THREE.Group();gr.position.set(x,0,z);gr.rotation.y=ry||0;gr.userData.fix=1;g.add(gr);const{B,C,L}=k.H(gr),M=k.M;
 for(const s of[-1,1]){C(.12,.12,3.6,s*1.9,1.8,0,M(0x5a3a22,{roughness:.8}),null,null,8);C(.25,.3,.2,s*1.9,.1,0,k.PLINTH,null,null,10)}B(4.4,1.6,.1,0,2.6,0,M(0x5a3a22,{roughness:.8}));B(4.5,.1,.2,0,3.45,0,M(0x4a2a12));
 for(const r of[0,Math.PI]){const o=r?-.056:.056;L('OLD QUARRY',4,.6,'#e8c020','#1a1a1a',110,0,3.0,o,r,gr);L('DOORS BUT DESERT MINING CO.',4,.32,'#1a1a1a','#e8c020',70,0,2.45,o,r,gr);L('HAUL ROAD → · TRUCKS TURNING',4,.3,'#1a1a1a','#f0ece0',60,0,2.05,o,r,gr)}
 return{obs:[]}}

/* =====================================================================================================
   Old Quarry, batch 3: the eight processing machines (dx591's qtBuild2). Needs fort-kit.js and quarry-yard.js (qmKit).
   qmMachine(id, g, x, z, F, l, face) builds one machine on its own concrete plinth, with its name sign, inside g (the
   machine's section group from qtSec, so the build animation still works). face: -1 = its front looks -z (row 1,
   z -1459), +1 = +z (row 2, z -1466); the fronts face the walkway between the rows.
   Returns the hooks qtTick2 already uses, with any positions in the same space as g's parent (q.g):
     wash  {wash: [drum groups, spin on x], washP: [x, z]}       sortr {sortD: drum mesh, spins on its y}
     mill  {mill: [mill groups, spin on x]}                       heat  {heatF: firebox mesh (emissiveIntensity), out: [x, y, z]}
     pol   {pol: [wheel meshes, spin on their y]}                 gen   {gen: [[x, y, z] exhaust tips]}
     silo  {}                                                     lab   {labD: dish group (spins on y), labL: lamp mesh (color)}
   plus obs (the plinth, 3 x 3 as before) and ins/outs: where the belts in and out should end [x, y, z], on the machine's
   west (-x) and east (+x) sides. Each machine's outlet is lower than its inlet, so ore drops through it and the belts climb.
   ===================================================================================================== */
function qmMachine(id,g,x,z,F,l,face){const k=qmKit(),M=k.M;const lg=new THREE.Group();lg.position.set(x,F,z);lg.scale.z=face<0?-1:1;g.add(lg);/* mirrored (not turned) for row 1, so ore still comes in on the west side and leaves on the east */const P=k.H(lg);
 const W=(px,py,pz)=>[x+px,F+py,z+pz*(face<0?-1:1)];/* local -> q.g space */
 const ST=M(0x8a8e94,{metalness:.75,roughness:.3}),DK=M(0x2a2c30,{metalness:.5,roughness:.5}),YL=M(0xe0a820,{metalness:.25,roughness:.5}),BL=M(0x2a5a8a,{metalness:.45,roughness:.45}),RD=M(0xb02a1a,{metalness:.3,roughness:.5}),GN=M(0x3a6a3a,{metalness:.3,roughness:.5}),WH=M(0xe4e4dc,{roughness:.7}),RB=M(0x1a1a1a,{roughness:.9});
 /* the plinth: 3.8 x 3.8 x .16 concrete with a chamfered kerb, a yellow edge line, anchor bolts; the name sign on two posts at the front */
 P.B(3.8,.16,3.8,0,.08,0,k.PRE);P.B(3.9,.04,3.9,0,.02,0,k.PRE);for(const[a,b]of[[3.8,.08],[.08,3.8]])for(const s of[-1,1])P.B(a==3.8?3.66:.08,.012,a==3.8?.08:3.66,a==3.8?0:s*1.79,.166,a==3.8?s*1.79:0,YL);
 for(const sx of[-1.5,1.5])for(const sz of[-1.5,1.5])P.C(.04,.04,.05,sx,.185,sz,ST,null,null,6);
 const nm=typeof QTD!='undefined'&&QTD[id]?QTD[id].lv[l].toUpperCase():id.toUpperCase();for(const sx of[-.8,.8])P.B(.05,.7,.05,sx,.5,2.02,DK);{/* the sign goes straight into g, so the mirror doesn't flip its text */const fs=face<0?-1:1;const lb=k.lab(nm,1.8,.3,'#1a1a1a','#e8c020',60);lb.position.set(x,F+.72,z+2.05*fs);lb.rotation.y=fs<0?Math.PI:0;g.add(lb);const bk=k.lab(nm,1.8,.3,'#1a1a1a','#e8c020',60);bk.position.set(x,F+.72,z+1.995*fs);bk.rotation.y=fs<0?0:Math.PI;g.add(bk)}
 const leg=(lx,lz,h,m)=>P.B(.14,h,.14,lx,.16+h/2,lz,m||DK),foot=(lx,lz)=>P.B(.26,.03,.26,lx,.175,lz,ST);
 const H={obs:[{x0:x-1.5,x1:x+1.5,z0:z-1.5,z1:z+1.5}],ins:W(-1.6,1.05,0),outs:W(1.6,1.05,0)};
 const B2=(id=='wash')?()=>{/* trommels: perforated drums on trunnion rollers over a settling tank, a spray bar, a chain drive and motor, a discharge chute */
   const pt=k.tex(256,128,(c,w,h)=>{c.fillStyle='#6a7078';c.fillRect(0,0,w,h);c.fillStyle='#1a1c1e';for(let y=6;y<h;y+=12)for(let x2=(y/12%2)*6+3;x2<w;x2+=12){c.beginPath();c.arc(x2,y,3.2,0,7);c.fill()}});pt.repeat.set(3,1);
   const PM=M(0xffffff,{map:pt,metalness:.6,roughness:.4,side:THREE.DoubleSide});const zs=l>1?[-.8,.8]:[0];const wash=[];
   P.B(3.1,.5,zs.length>1?3.1:1.8,0,.41,0,M(0x3a4a52,{metalness:.5}));{const wt=new THREE.Mesh(new THREE.PlaneGeometry(2.9,zs.length>1?2.9:1.6),M(0x2a6a8a,{metalness:.2,roughness:.08,transparent:true,opacity:.85}));wt.rotation.x=-Math.PI/2;wt.position.y=.62;lg.add(wt)}
   const DY=1.55,two=zs.length>1;/* the drums sit high enough that their outlets drop onto the outgoing belt; ore comes in at the top end */
   for(const dz of zs){const tr=new THREE.Group();tr.position.set(0,DY,dz);lg.add(tr);const d=new THREE.Mesh(new THREE.CylinderGeometry(.52,.52,2.4,22,1,true),PM);d.rotation.z=Math.PI/2;tr.add(d);
    for(const e of[-1.15,1.15]){const rg=new THREE.Mesh(new THREE.TorusGeometry(.56,.07,8,24),ST);rg.rotation.y=Math.PI/2;rg.position.x=e*.85;tr.add(rg)}{const gr=new THREE.Mesh(new THREE.TorusGeometry(.58,.05,6,28),YL);gr.rotation.y=Math.PI/2;gr.position.x=-.2;tr.add(gr)}
    for(const e of[-1.2,1.2]){const lip=new THREE.Mesh(new THREE.TorusGeometry(.5,.035,6,22),DK);lip.rotation.y=Math.PI/2;lip.position.x=e;tr.add(lip)}wash.push(tr);
    /* trunnion rollers on two cross frames standing on the tank */for(const ex of[-.98,.98]){P.B(.16,DY-.45-.66,1.3,ex,(.66+DY-.45)/2,dz,DK);for(const sz of[-.42,.42])P.C(.1,.1,.18,ex,DY-.36,dz+sz,ST,'x',null,12)}
    /* spray bar along the top with nozzles, fed from the water main at the west end */P.C(.04,.04,2.5,0,DY+.68,dz,BL,'x',null,8);for(let n=-2;n<=2;n++)P.C(.03,.05,.08,n*.5,DY+.61,dz,ST,null,null,6);P.C(.04,.04,DY+.68-.66,-1.25,(DY+.68+.66)/2,dz+.12,BL)}
   /* the drive: a motor on the tank rim and a chain guard up to the girth gear */{const mz=two?1.32:.78;P.B(.5,.42,.36,-.2,.87,mz,BL);P.B(.3,DY-.85,.05,-.2,(DY+.85)/2,mz-.2,YL)}
   /* a trough from a to b, open on top, in local space */const trough=(a,b,w)=>{const d=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]),Ln=d.length();const tg=new THREE.Group();tg.position.set((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);tg.quaternion.setFromUnitVectors(new THREE.Vector3(1,0,0),d.clone().normalize());lg.add(tg);const T=k.H(tg);T.B(Ln,.04,w,0,0,0,ST);for(const s of[-1,1])T.B(Ln,.16,.04,0,.08,s*w/2,ST);return tg};
   /* outlets: a trough from under each drum's mouth down onto the belt (towards the middle when there are two), on a prop */
   for(const dz of zs){trough([1.1,DY-.6,dz],[1.66,.8,dz*.25],.5);P.rod([1.3,DY-.72,dz*.8],[1.3,.66,dz*.8],.03,DK)}
   /* the inlet: the belt drops into a feed box (with a divider for two drums) whose spouts run into the drum mouths */
   P.B(.4,.46,two?2.1:.6,-1.5,DY+.03,0,M(0x6a7078,{metalness:.5}));P.B(.44,.04,two?2.14:.64,-1.5,DY+.27,0,DK);P.B(.1,DY-.2-.66,.1,-1.5,(DY-.2+.66)/2,0,DK);
   for(const dz of zs)trough([-1.32,DY+.05,dz*.7],[-1.0,DY-.18,dz],.36);if(two){const dv=new THREE.Mesh(new THREE.ConeGeometry(.2,.3,4),DK);dv.rotation.x=Math.PI/2;dv.scale.set(1,1,.3);dv.position.set(-1.5,DY+.2,0);lg.add(dv)}
   H.ins=W(-1.6,DY+.38,0);H.outs=W(1.62,.64,0);
   H.wash=wash;H.washP=[x,z]}
 :(id=='sortr')?()=>{/* a feed hopper onto a short belt, a big red magnet drum at the head pulley, a splitter and three bins for the sorted ore */
   /* its own belt starts right under the end of the incoming one (x -1.6) */P.B(2.9,.14,1.1,-.25,.86,0,DK);for(const sx of[-1.5,1.0])for(const sz of[-.45,.45]){leg(sx,sz,.64);foot(sx,sz)}P.B(2.4,.06,.84,-.4,.96,0,RB);for(const sx of[-1.62,.82])P.C(.12,.12,.9,sx,.94,0,ST,'z',null,12);
   /* skirt boards where the ore lands on it */for(const sz of[-.36,.36])P.B(.8,.22,.04,-1.25,1.1,sz,M(0x6a7078,{metalness:.5}));P.B(.04,.22,.76,-1.65,1.1,0,M(0x6a7078,{metalness:.5}));
   const dr=P.C(.44,.44,1.0,.95,1.42,0,M(0xc02020,{metalness:.5,roughness:.35}),'z',null,22);for(const sz of[-.55,.55]){P.B(.2,.95,.1,.95,1.03,sz,DK);P.C(.14,.14,.08,.95,1.42,sz*1.04,ST,'z',null,14)}
   P.B(.45,.35,.35,.95,1.2,-.85,BL);P.B(.06,.3,.3,.95,1.2,-.66,ST);
   {const sp=P.B(.06,.5,.9,1.45,.9,0,ST);sp.rotation.z=.4}for(const[px,c]of[[.2,0xd07a40],[1.0,0x8a8a90],[1.8,0xe0e4ea]]){const bx=px-.6;P.B(.72,.5,.7,bx,.43,1.05,M(0x4a4e54,{metalness:.5}));P.B(.76,.04,.74,bx,.69,1.05,DK);for(let i=0;i<3;i++){const r=new THREE.Mesh(new THREE.DodecahedronGeometry(.11+i*.03,0),M(c,{metalness:.6,roughness:.4}));r.position.set(bx+(i-1)*.18,.72+i%2*.05,1.0+(i%2)*.1);lg.add(r)}}
   if(l>1){P.B(.6,1.1,.45,-1.35,.71,-1.2,BL);P.B(.5,.7,.02,-1.35,.8,-.97,M(0x1a2a3a));const lt=new THREE.Mesh(new THREE.SphereGeometry(.06,8,6),new THREE.MeshBasicMaterial({color:0x60c0ff}));lt.position.set(-1.35,1.32,-1.2);lg.add(lt)}
   H.sortD=dr;H.ins=W(-1.6,1.05,0);H.outs=W(1.62,.62,0)}
 :(id=='mill')?()=>{/* ball mills: a bolted shell with a yellow girth gear, end heads and trunnions on bearing pedestals, a pinion and motor, a feed chute and a discharge screen */
   const zs=l>1?[-.85,.85]:[0];const mill=[];for(const dz of zs){const m=new THREE.Group();m.position.set(0,1.5,dz);lg.add(m);const Mm=k.H(m);
    Mm.C(.62,.62,2,0,0,0,M(0x5a6a7a,{metalness:.6,roughness:.35}),'x',null,24);for(const e of[-1,1])Mm.C(.62,.3,.18,e*1.09,0,0,M(0x4a5a6a,{metalness:.6}),'x',null,24).rotation.z=e>0?-Math.PI/2:Math.PI/2;
    {const gr=new THREE.Mesh(new THREE.TorusGeometry(.67,.08,6,32),YL);gr.rotation.y=Math.PI/2;gr.position.x=.45;m.add(gr)}for(const bx of[-.6,0])for(let b2=0;b2<10;b2++){const a=b2/10*Math.PI*2;Mm.B(.06,.05,.05,bx,Math.cos(a)*.625,Math.sin(a)*.625,ST)}
    /* the discharge screen turns with the mill, on its outlet trunnion */Mm.C(.28,.28,.36,1.66,0,0,M(0x6a7078,{metalness:.6}),'x',null,16);Mm.C(.3,.3,.04,1.84,0,0,DK,'x',null,16);Mm.C(.14,.14,.2,1.42,0,0,ST,'x',null,12);mill.push(m);for(const sx of[-1.32,1.32]){P.B(.42,1.0,.56,sx,.66,dz,DK);P.C(.24,.24,.36,sx,1.22,dz,ST,'x',null,14);foot(sx,dz)}
    const pz=dz+(l>1?Math.sign(dz)*.62:.8);P.B(.55,.42,.44,.45,.47,pz,BL);P.C(.16,.16,.2,.45,.82,pz,YL,'z',null,12);P.B(.62,.18,.5,.45,.25,pz,DK);/* the outlet: a chute under the discharge screen, sloping down onto the belt (towards the middle when there are two mills) */{const ch=P.B(.4,.04,.5,1.72,1.18,dz*.55,ST);ch.rotation.x=dz?Math.sign(dz)*.25:0;for(const s of[-1,1])P.B(.04,.16,.55,1.72+s*.2,1.24,dz*.55,ST).rotation.x=dz?Math.sign(dz)*.25:0;P.rod([1.72,1.14,dz*.55+(dz?Math.sign(dz)*.2:0)],[1.72,.18,dz*.55+(dz?Math.sign(dz)*.2:0)],.03,DK)}}
   /* the feed: the belt drops ore into a hopper; a screw feeder tube lifts it into each mill's feed trunnion */{const hw=zs.length>1?2.3:.58;/* one hopper under the incoming belt, as wide as the mills it feeds */P.B(.5,.42,hw,-1.78,.82,0,M(0x6a7078,{metalness:.5}));P.B(.56,.04,hw+.06,-1.78,1.04,0,DK);for(const sx of[-.2,.2])for(const sz of[-hw/2+.05,hw/2-.05])P.B(.06,.5,.06,-1.78+sx,.4,sz,DK)}for(const dz of zs){/* a screw feeder up into each mill's feed trunnion */P.rod([-1.62,.9,dz],[-1.22,1.5,dz],.11,M(0x5a6a7a,{metalness:.5}),null,12);P.C(.13,.13,.08,-1.24,1.49,dz,DK,'x',null,12);P.B(.22,.2,.2,-1.95,.95,dz+(zs.length>1?Math.sign(dz)*.75:.38),BL)}
   H.mill=mill;H.ins=W(-1.6,1.12,0);H.outs=W(1.62,1.0,0)}
 :(id=='heat')?()=>{/* a riveted preheater drum on a frame, a coal firebox with a glowing door and grate, a stack, a gauge, a coal bunker; the hot-ore pipe leaves from the top (out) */
   for(const[sx,sz]of[[-.95,-.6],[.15,-.6],[-.95,.6],[.15,.6]]){leg(sx,sz,.62);foot(sx,sz)}P.B(1.3,.1,1.4,-.4,.82,0,DK);
   P.C(.85,.85,2.2,-.4,1.97,0,M(0x3a3a3a,{metalness:.6}),null,null,24);for(const y of[1.15,1.95,2.75])P.C(.87,.87,.06,-.4,y,0,DK,null,null,24);P.C(.25,.86,.55,-.4,3.33,0,M(0x3a3a3a,{metalness:.6}),null,null,24);P.C(.12,.12,.3,-.4,3.7,0,DK,null,null,12);
   /* the feed chute on the drum's west side, right under the end of the incoming belt */P.B(.4,.34,.6,-1.42,1.02,0,M(0x6a7078,{metalness:.5}));P.B(.44,.04,.64,-1.42,1.2,0,DK);P.rod([-1.42,.85,0],[-1.42,.16,0],.04,DK);P.B(.2,.03,.2,-1.42,.175,0,ST);const fire=new THREE.MeshStandardMaterial({color:0x200800,emissive:0xff5010,emissiveIntensity:1});const fb=P.B(.6,.42,.04,-.4,1.3,.87,fire);P.B(.74,.56,.03,-.4,1.3,.855,DK);for(let i=0;i<5;i++)P.B(.02,.42,.02,-.62+i*.11,1.3,.895,DK);
   P.C(.13,.15,3.4,.95,1.86,-.3,DK,null,null,12);P.C(.2,.2,.1,.95,3.6,-.3,DK,null,null,12);P.C(.26,.26,.04,.95,3.7,-.3,DK,null,null,12);
   {const gg=new THREE.Mesh(new THREE.CircleGeometry(.11,16),new THREE.MeshBasicMaterial({color:0xf0f0e8}));gg.position.set(-.4,2.2,.875);lg.add(gg);P.C(.13,.13,.04,-.4,2.2,.86,DK,'z',null,16);P.B(.01,.08,.005,-.4,2.22,.882,RD)}
   P.B(1.0,.6,.8,.9,.46,.95,M(0x4a3a2a,{roughness:.9}));for(let i=0;i<7;i++){const r=new THREE.Mesh(new THREE.DodecahedronGeometry(.13,0),M(0x111111,{roughness:1}));r.position.set(.55+(i%4)*.22,.8+(i>3?.08:0),.8+(i%3)*.15);lg.add(r)}
   H.heatF=fb;H.ins=W(-1.6,1.3,0);H.out=W(-.4,3.85,0)}
 :(id=='pol')?()=>{/* a steel bench with guarded polishing wheels on one shaft, a motor at the end, a dust hood and duct, a tray of shining bars */
   P.B(2.5,.1,1.1,0,.9,0,M(0x4a4e54,{metalness:.5}));for(const sx of[-1.15,1.15])for(const sz of[-.45,.45]){leg(sx,sz,.72);foot(sx,sz)}P.B(2.3,.04,.9,0,.4,0,DK);
   P.C(.04,.04,2.3,0,1.3,-.1,ST,'x',null,8);for(const sx of[-1,0,1])P.B(.08,.4,.1,sx*.95,1.1,-.1,DK);const pol=[];for(let i=0;i<l+1;i++){const px=-.7+i*.7;const w=P.C(.3,.3,.1,px,1.3,-.1,M(0xe8e8f0,{metalness:.9,roughness:.1}),'x',null,22);pol.push(w);const gd=new THREE.Mesh(new THREE.CylinderGeometry(.36,.36,.18,22,1,true,0,Math.PI),M(0x3a6a2a,{metalness:.4,side:THREE.DoubleSide}));gd.rotation.z=Math.PI/2;gd.rotation.x=Math.PI;gd.position.set(px,1.3,-.1);lg.add(gd)}
   P.C(.2,.2,.45,1.3,1.3,-.1,BL,'x',null,14);P.B(.3,.06,.3,1.3,1.0,-.1,DK);
   P.B(2.0,.3,.5,0,1.95,-.3,M(0x7a7e84,{metalness:.5}));P.C(.12,.12,.9,0,2.55,-.4,M(0x7a7e84,{metalness:.5}),null,null,10);for(const s of[-1,1])P.B(.04,.6,.04,s*.9,1.6,-.5,DK);
   P.B(.9,.06,.42,-.2,.96,.33,M(0x6a4a2a));for(let i=0;i<4;i++)P.B(.18,.08,.34,-.5+i*.21,1.03,.33,M(0xf0d050,{metalness:.95,roughness:.08}));
   H.pol=pol}
 :(id=='gen')?()=>{/* diesel gensets on skids: louvred housing, exhaust with a rain cap, a day tank, a control panel with lamps, a cable gland box */
   const zs=l>1?[-.85,.85]:[0];const ex=[];for(const dz of zs){P.B(2.8,.14,1.04,0,.23,dz,DK);P.B(2.55,1.1,.92,0,.85,dz,GN);P.B(2.62,.06,.98,0,1.43,dz,DK);
    for(const s of[-1,1])for(let kk=0;kk<8;kk++){const lv=P.B(.05,.5,.02,-1.0+kk*.12,.88,dz+s*.47,DK);lv.rotation.y=.5}P.B(.04,.62,.66,1.29,.88,dz,WH);for(const[ly,c]of[[1.05,0x30ff60],[.95,0xffb020]]){const lp=new THREE.Mesh(new THREE.SphereGeometry(.035,8,6),new THREE.MeshBasicMaterial({color:c}));lp.position.set(1.32,ly,dz+.18);lg.add(lp)}
    P.C(.08,.08,.7,.8,1.8,dz-.2,DK,null,null,10);P.C(.13,.13,.05,.8,2.17,dz-.2,DK,null,null,10);{const cap=P.B(.24,.02,.24,.8,2.22,dz-.2,ST);cap.rotation.z=.4}ex.push(W(.8,2.25,dz-.2))}
   {const tz=zs.length>1?0:-1.05,tx=zs.length>1?-1.65:-.4,tw=zs.length>1?.42:1.4,td=zs.length>1?1.6:.5;/* the fuel day tank: a red box tank lying along the genset, a filler cap, a gauge and a fuel line */P.B(tw,.6,td,tx,.5,tz,RD);P.B(tw+.04,.04,td+.04,tx,.2,tz,DK);P.C(.06,.06,.08,tx+(zs.length>1?0:.4),.84,tz,DK,null,null,10);P.B(.1,.14,.02,tx,.55,tz+(zs.length>1?.81:.26)*(zs.length>1?1:-1),M(0xf0f0e8));P.rod([tx+(zs.length>1?.21:0),.3,tz+(zs.length>1?0:.25)],[zs.length>1?-1.2:-.4,.3,zs.length>1?0:-.5],.025,RB)}{const bz=zs.length>1?1.5:1.2;/* the cable box, standing on the plinth, with its cable going into the genset skid */P.B(.5,.42,.3,-1.5,.37,bz,DK);P.B(.06,.08,.08,-1.5,.62,bz,ST);P.rod([-1.25,.3,bz],[-1.3,.2,zs.length>1?1.37:.52],.03,RB)}H.gen=ex}
 :(id=='silo')?()=>{/* an ore silo on a braced stand, a discharge gate and spout, a caged ladder, a roof railing, a level gauge */
   for(const[sx,sz]of[[-.85,-.85],[.85,-.85],[-.85,.85],[.85,.85]]){P.B(.18,2.2,.18,sx,1.26,sz,DK);foot(sx,sz)}for(const[a,b,c,d]of[[-.85,-.85,.85,-.85],[-.85,.85,.85,.85],[-.85,-.85,-.85,.85],[.85,-.85,.85,.85]]){P.rod([a,.4,b],[c,1.95,d],.035,DK);P.rod([c,.4,d],[a,1.95,b],.035,DK)}
   const SL=M(0xc4c8cc,{metalness:.35,roughness:.45});P.C(1.15,.2,1.05,0,1.88,0,SL,null,null,24);P.B(.42,.32,.42,0,1.25,0,DK);P.B(.5,.06,.08,0,1.25,.26,YL);P.C(.12,.16,.4,0,.9,0,DK,null,null,10);
   P.C(1.2,1.2,3,0,3.9,0,SL,null,null,28);P.C(.85,1.2,.5,0,5.65,0,SL,null,null,28);P.C(.86,.86,.06,0,5.93,0,M(0x6a6e72,{metalness:.5}),null,null,28);P.C(.18,.22,.3,0,6.1,0,SL,null,null,12);for(const y of[2.45,3.9,5.35])P.C(1.22,1.22,.06,0,y,0,DK,null,null,28);
   /* the ladder goes up to the roof deck and over the edge onto it */for(const sd of[-.2,.2]){P.B(.05,5.75,.05,1.3,3.07,sd,YL);P.B(.5,.05,.05,1.05,5.95,sd,YL)}for(let y=.5;y<5.9;y+=.32)P.B(.04,.04,.4,1.3,y,0,YL);for(let y=2.2;y<5.6;y+=.6){const rg=new THREE.Mesh(new THREE.TorusGeometry(.32,.018,4,12,Math.PI),YL);rg.rotation.set(Math.PI/2,0,-Math.PI/2);rg.position.set(1.3,y,0);rg.position.x+=.0;lg.add(rg)}
   {/* the railing stands on the flat roof deck */const rr=new THREE.Mesh(new THREE.TorusGeometry(.8,.03,6,24),YL);rr.rotation.x=Math.PI/2;rr.position.y=6.98;lg.add(rr);const r2=rr.clone();r2.position.y=6.5;lg.add(r2);for(let kk=0;kk<8;kk++){const a=kk/8*6.283;if(kk==0)continue;P.B(.04,1.02,.04,Math.cos(a)*.8,6.47,Math.sin(a)*.8,YL)}}
   P.B(.08,2.4,.03,-.9,3.9,.9,WH).rotation.y=-.78;P.B(.07,1.3,.035,-.9,3.4,.9,M(0x7a5a3a)).rotation.y=-.78}
 :(id=='lab')?()=>{/* a site lab cabin: a window with a sill, the door beside it with steps, an air conditioner, a dish and an aerial with a lamp */
   P.B(3,2.3,2.6,0,1.33,0,WH);P.B(3.2,.12,2.8,0,2.54,0,M(0x3a6a8a));P.B(3.04,.1,2.64,0,.25,0,DK);
   P.B(1.2,.75,.04,-.6,1.6,1.31,M(0x335070,{metalness:.4,roughness:.2,emissive:0x102030}));P.B(1.32,.06,.12,-.6,1.2,1.34,M(0x8a8a8a));for(const s of[-1,1])P.B(.06,.82,.06,-.6+s*.63,1.6,1.32,M(0x8a8a8a));P.B(1.32,.06,.06,-.6,2.0,1.32,M(0x8a8a8a));
   P.B(.8,1.95,.04,.85,1.16,1.31,M(0x6a8aa0));P.C(.035,.035,.08,.6,1.16,1.36,ST,'z',null,8);for(let i=0;i<2;i++)P.B(.9,.12,.32-i*.0,.85,.22+i*.0,1.48+i*.0,k.PRE);
   P.B(.7,.5,.4,-1.1,.6,-1.5,M(0xd0d0c8));for(let kk=0;kk<4;kk++)P.B(.6,.03,.02,-1.1,.45+kk*.1,-1.71,DK);
   /* a satellite dish: a shallow bowl with a rim, tilted up, on a yoke; a feed arm with the receiver at its focus */const dsh=new THREE.Group();dsh.position.set(-.9,2.6,-.6);lg.add(dsh);{const D=k.H(dsh);D.B(.3,.03,.3,0,.015,0,DK);D.C(.04,.05,.38,0,.2,0,DK,null,null,10);const tilt=new THREE.Group();tilt.position.y=.42;tilt.rotation.x=-.75;dsh.add(tilt);const T=k.H(tilt);const prof=[];for(let i=0;i<=10;i++){const r=.45*i/10;prof.push(new THREE.Vector2(r,r*r*.9))}const bowl=new THREE.Mesh(new THREE.LatheGeometry(prof,28),M(0xe8e8e4,{roughness:.55,metalness:.15,side:THREE.DoubleSide}));bowl.position.y=.06;tilt.add(bowl);{const rim=new THREE.Mesh(new THREE.TorusGeometry(.45,.015,6,28),M(0xd0d0cc,{roughness:.5}));rim.rotation.x=Math.PI/2;rim.position.y=.06+.18;tilt.add(rim)}T.C(.07,.09,.08,0,.02,0,DK,null,null,12);T.rod([0,.08,-.42],[0,.42,-.02],.012,DK);T.rod([0,.08,.42],[0,.42,.02],.012,DK);T.C(.03,.035,.1,0,.47,0,DK,null,null,10);T.C(.045,.045,.03,0,.41,0,M(0x3a3a3a),null,null,10);for(const s2 of[-1,1])D.B(.03,.14,.06,s2*.09,.42,0,DK)}
   P.C(.015,.015,1.2,1.2,3.2,-1,DK,null,null,5);const bk=new THREE.Mesh(new THREE.SphereGeometry(.07,8,6),new THREE.MeshBasicMaterial({color:0x30ff60}));bk.position.set(1.2,3.82,-1);lg.add(bk);H.labD=dsh;H.labL=bk}:null;
 if(B2)B2();lg.traverse(o=>{if(o.isMesh)o.userData.noSeam=true});return H}

/* =====================================================================================================
   Old Quarry, batch 4: the automation and smelter upgrades (dx589's qtBuild). Needs fort-kit.js and quarry-yard.js.
   Each builder takes the section group (from qtSec) and returns the same hooks qtTick already animates.
     qmSkip(g, x, z, F, bx, bz, px, pz)  the crew's skip hoist at (x, z), crew ore bin at (bx, bz), rock pile at (px, pz)
                                         -> {sk, skb, so, shv, cab2, x, z, TOP, bx, bz, bo, px, pz, obs}
     qmOreFeed(g, x, z, F, rx, rz)       vibrating feed hopper at (x, z); a charging chute on the furnace hood at (rx, rz)
                                         -> {hp, fl2, from, to, obs}: run the belt from `from` to `to`
     qmCastRobot(g, rx, rz, F)           -> {tw, a1, a2, a3, fg, bc, rx, rz, obs}   (see the pose note in old-quarry.md)
     qmBlower(g, bx, bz, F, fx, fz)      blower at (bx, bz), duct to the furnace's west wall at (fx, fz) -> {fan, obs}
     qmArc(g, x, z, F)                   electrode gantry over the furnace centred at (x, z) -> {arc: [{el, rod, gl, b}], obs}
     qmPress(g, px, pz, F)               die press over the molds -> {press, obs}
     qmLaunder(g, a, b)                  a tap hole on the furnace wall at a=[x,y,z], a lined trough down to b -> {laun}
     qmRefinery(g, x, z, F, hx, hz)      refinery tank, its pipe over to the furnace hood at (hx, hz) -> {vw, gc, gt, top, obs}
   ===================================================================================================== */
function qmGlow(c,o,s){if(typeof glowSp=='function')return glowSp(c,o,s);const k=fbKit();const t=k.tex(64,64,(x)=>{const gr=x.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,64,64)});const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,color:c,transparent:true,opacity:o,blending:THREE.AdditiveBlending,depthWrite:false}));sp.scale.setScalar(s);return sp}
function qmMat(){const k=qmKit(),M=k.M;return{k,M,ST:M(0x8a8e94,{metalness:.7,roughness:.32}),DK:M(0x2a2c30,{metalness:.5,roughness:.5}),YL:M(0xe0a820,{metalness:.25,roughness:.5}),BL:M(0x2a5a8a,{metalness:.45,roughness:.45}),RD:M(0xb02a1a,{metalness:.3,roughness:.5}),OR:M(0xe86a10,{metalness:.35,roughness:.4}),CU:M(0xb87333,{metalness:.8,roughness:.3}),GM:M(0x6a7078,{metalness:.5,roughness:.45}),ROCK:M(0x8a7458,{roughness:1}),RB:M(0x1a1a1a,{roughness:.9})}}
const qmNS=g=>{g.traverse(o=>{if(o.isMesh)o.userData.noSeam=true});return g};

/* ---- the skip hoist: a lattice tower with guide rails, a head frame with the sheave and a tipping scroll, a hoist house at
   the foot, a chute down to a concrete ore bunker, and the rock pile the miners work at ---- */
function qmSkip(g,x,z,F,bx,bz,px,pz){const{k,M,ST,DK,YL,GM,ROCK,RB}=qmMat(),{B,C,rod,L}=k.H(g);const TOP=11,obs=[];
 /* footing */B(2.0,.3,2.2,x,F+.15,z,k.PLINTH);
 /* four angle legs, braced on every face */for(const sx of[-.5,.5])for(const sz of[-.72,.72]){B(.14,TOP,.03,x+sx,F+TOP/2+.3,z+sz-.055*Math.sign(sz),DK);B(.03,TOP,.14,x+sx-.055*Math.sign(sx),F+TOP/2+.3,z+sz,DK)}
 for(let y=.3;y<TOP-.5;y+=1.8){for(const sz of[-.72,.72]){rod([x-.5,F+y,z+sz],[x+.5,F+y+1.8,z+sz],.025,DK);B(1.0,.06,.06,x,F+y,z+sz,DK)}for(const sx of[-.5,.5]){rod([x+sx,F+y,z-.72],[x+sx,F+y+1.8,z+.72],.025,DK);B(.06,.06,1.44,x+sx,F+y,z,DK)}}
 /* the skip's guide rails, inside the tower */for(const sz of[-.5,.5])B(.06,TOP-.8,.08,x,F+.3+(TOP-.8)/2,z+sz,M(0x5a5e64,{metalness:.7}));
 /* head frame: a deck, the sheave on its shaft, a tipping scroll that turns the skip over the chute */B(1.4,.12,1.8,x,F+TOP+.3,z,DK);for(const sx of[-.6,.6])for(const sz of[-.8,.8])B(.06,.5,.06,x+sx,F+TOP+.61,z+sz,YL);for(const sz of[-.8,.8])B(1.26,.05,.05,x,F+TOP+.85,z+sz,YL);
 for(const sz of[-.3,.3])B(.3,.5,.12,x,F+TOP+.6,z+sz,DK);C(.05,.05,.7,x,F+TOP+.9,z,ST,'z',null,8);
 const shv=new THREE.Group();shv.position.set(x,F+TOP+.9,z);g.add(shv);{const S=k.H(shv);const rim=new THREE.Mesh(new THREE.TorusGeometry(.5,.06,8,24),M(0x3a3a3a,{metalness:.8}));shv.add(rim);S.C(.1,.1,.16,0,0,0,ST,'z',null,10);for(let i=0;i<6;i++){const sp=S.B(.04,.96,.04,0,0,0,ST);sp.rotation.z=i*Math.PI/3}}
 /* the tipping scroll: two curved guides that turn the skip over at the top */for(const sz of[-.45,.45]){rod([x+.3,F+TOP-1.5,z+sz],[x+.62,F+TOP-.9,z+sz],.05,YL);rod([x+.62,F+TOP-.9,z+sz],[x+.62,F+TOP-.2,z+sz],.05,YL)}
 /* the skip: a steel box with a tipping lip, ore inside */const sk=new THREE.Group();sk.position.set(x,F+1,z);g.add(sk);sk.userData.dpKeep=1;const skb=new THREE.Group();sk.add(skb);const K=k.H(skb);
 K.B(.7,.06,.86,0,-.35,0,YL);for(const dz of[-.43,.43])K.B(.7,.7,.05,0,0,dz,YL);K.B(.05,.7,.86,-.35,0,0,YL);{const lip=K.B(.05,.4,.86,.42,-.12,0,YL);lip.rotation.z=-.5}for(const dz of[-.4,.4])K.C(.06,.06,.08,-.2,.2,dz+(dz<0?-.06:.06),DK,'z',null,8);K.B(.08,.1,.5,-.2,.4,0,DK);
 const so=new THREE.Mesh(new THREE.DodecahedronGeometry(.32,0),M(0x8a7a6a,{roughness:1}));so.scale.y=.6;so.position.y=.15;skb.add(so);
 const cab2=C(.015,.015,1,x,F+5,z,M(0x2a2a2a),null,null,4);
 /* the hoist house at the foot, its rope up to the sheave */{const hx=x-.1,hz=z-1.9;B(1.3,1.1,1.1,hx,F+.85,hz,M(0x5a6a58,{roughness:.6}));B(1.4,.08,1.2,hx,F+1.44,hz,DK);C(.25,.25,.9,hx,F+.75,hz+.2,DK,'x',null,14);rod([hx,F+1.48,hz+.4],[x,F+TOP+.4,z-.5],.012,M(0x2a2a2a));obs.push({x0:hx-.7,x1:hx+.7,z0:hz-.6,z1:hz+.6})}
 /* the ore pass: the skip tips into a head bin on the tower, a round downpipe on brackets carries the ore down the tower,   and a short spout drops it into the bunker */{const hx=x+1.0,DM=M(0x6a7078,{metalness:.55,roughness:.4});/* open-topped head bin */for(const s2 of[-1,1]){B(.05,.6,1.0,hx+s2*.4,F+TOP-1.5,z,DM);B(.8,.6,.05,hx,F+TOP-1.5,z+s2*.5,DM)}for(const s2 of[-1,1]){B(.09,.05,1.06,hx+s2*.4,F+TOP-1.18,z,DK);B(.86,.05,.09,hx,F+TOP-1.18,z+s2*.5,DK)}{const ore=new THREE.Mesh(new THREE.DodecahedronGeometry(.35,0),M(0x8a7a6a,{roughness:1}));ore.scale.y=.35;ore.position.set(hx,F+TOP-1.55,z);g.add(ore)}rod([x+.5,F+TOP-1.4,z-.4],[hx-.4,F+TOP-1.4,z-.4],.04,DK);rod([x+.5,F+TOP-1.4,z+.4],[hx-.4,F+TOP-1.4,z+.4],.04,DK);{const hb=new THREE.Mesh(new THREE.CylinderGeometry(.42,.2,.5,4,1,true),M(0x6a7078,{metalness:.55,side:THREE.DoubleSide}));hb.rotation.y=Math.PI/4;hb.position.set(hx,F+TOP-2.05,z);g.add(hb)}const y1=F+TOP-2.3,y0=F+2.6;C(.2,.2,y1-y0,hx,(y0+y1)/2,z,DM,null,null,14);for(let y=y0+.2;y<y1;y+=1.6){C(.26,.26,.06,hx,y,z,DK,null,null,14);B(.5,.06,.06,hx-.25,y+.1,z,DK)}const sp=[bx,F+1.7,bz];rod([hx,y0,z],sp,.2,DM,null,14);C(.26,.26,.06,hx,y0,z,DK,null,null,14);rod([hx+(sp[0]-hx)*.5,(y0+sp[1])*.5,z+(sp[2]-z)*.5],[hx+(sp[0]-hx)*.5,F+.15,z+(sp[2]-z)*.5],.05,DK);B(.4,.06,.4,hx+(sp[0]-hx)*.5,F+.18,z+(sp[2]-z)*.5,DK)}
 /* the bunker: concrete walls, a steel rim, the heap inside (bo) */{B(1.9,1.1,1.9,bx,F+.55,bz,k.PRE);B(2.0,.08,2.0,bx,F+1.12,bz,DK);B(1.6,.04,1.6,bx,F+1.0,bz,M(0x3a3632,{roughness:1}));L('CREW ORE',1.4,.3,'#1a1a1a','#e8c020',60,bx,F+.7,bz+.96,0);obs.push({x0:bx-1,x1:bx+1,z0:bz-1,z1:bz+1})}
 const bo=new THREE.Mesh(new THREE.DodecahedronGeometry(.62,0),M(0x8a7a6a,{roughness:1}));bo.scale.y=.4;bo.position.set(bx,F+1.05,bz);g.add(bo);
 /* the rock pile, a wheelbarrow, a rack of picks */{let sd=777;const r=()=>((sd=Math.imul(sd^sd>>>15,sd|1)+0x6d2b79f5|0)>>>0)/4294967296;for(let i=0;i<11;i++){const s=.3+r()*.6,m=new THREE.Mesh(new THREE.DodecahedronGeometry(s,0),ROCK);m.position.set(px+(r()-.5)*2.4,F+s*.45,pz+(r()-.5)*1.6);m.rotation.set(r()*3,r()*3,r()*3);g.add(m)}
  const wb=new THREE.Group();wb.position.set(px+2.2,F,pz+1.6);wb.rotation.y=.6;g.add(wb);const W=k.H(wb);W.C(.16,.16,.08,0,.16,-.55,RB,'x',null,12);const tray=new THREE.Mesh(new THREE.CylinderGeometry(.42,.3,.32,4,1,true),M(0x2a6a3a,{side:THREE.DoubleSide,metalness:.4}));tray.rotation.y=Math.PI/4;tray.scale.z=1.4;tray.position.set(0,.55,0);wb.add(tray);W.B(.5,.03,.66,0,.4,0,M(0x2a6a3a,{metalness:.4}));for(const s of[-1,1]){W.rod([s*.22,.42,-.5],[s*.28,.62,.75],.025,DK);W.rod([s*.22,.4,.3],[s*.22,0,.35],.02,DK)}
  for(let i=0;i<3;i++){const pk=new THREE.Group();pk.position.set(px-1.9+i*.3,F+.02,pz+1.3);pk.rotation.set(.25,0,(i-1)*.1);g.add(pk);const Q=k.H(pk);Q.C(.025,.03,.85,0,.42,0,M(0x7a5232),null,null,6);const hd=Q.C(.03,.02,.45,0,.85,0,ST,'x',null,6)}}
 obs.push({x0:x-1,x1:x+1,z0:z-1.1,z1:z+1.1});qmNS(g);return{sk,skb,so,shv,cab2,x,z,TOP,bx,bz,bo,px,pz,obs}}

/* ---- the ore feed: a square hopper on a braced stand, a vibrating pan feeder under it (hp shakes), a motor; and a
   charging chute on the furnace hood where the belt ends ---- */
function qmOreFeed(g,x,z,F,rx,rz){const{k,M,ST,DK,YL,BL,GM}=qmMat(),{B,C,rod,L}=k.H(g);
 for(const[a,b]of[[-.7,-.7],[.7,-.7],[-.7,.7],[.7,.7]]){B(.14,2.0,.14,x+a,F+1.0,z+b,DK);B(.3,.04,.3,x+a,F+.02,z+b,ST)}for(const[a,b,c,d]of[[-.7,-.7,.7,-.7],[-.7,.7,.7,.7],[-.7,-.7,-.7,.7],[.7,-.7,.7,.7]]){rod([x+a,F+.3,z+b],[x+c,F+1.5,z+d],.03,DK);B(Math.abs(c-a)+.14,.1,Math.abs(d-b)+.14,x+(a+c)/2,F+2.0,z+(b+d)/2,DK)}
 {const fun=new THREE.Mesh(new THREE.CylinderGeometry(1.15,.35,1.2,4,1,true),M(0x6a7078,{metalness:.55,side:THREE.DoubleSide}));fun.rotation.y=Math.PI/4;fun.position.set(x,F+2.6,z);g.add(fun);const rim=B(1.66,.08,1.66,x,F+3.22,z,DK);rim.material=DK;const fill=new THREE.Mesh(new THREE.BoxGeometry(1.5,.02,1.5),DK);fill.visible=false}
 const hp=new THREE.Group();hp.position.set(x,F+1.75,z);hp.userData.dpKeep=1;g.add(hp);/* the pan's open end faces the furnace (-z), right over the belt's tail */{const H=k.H(hp);H.B(.6,.06,1.0,0,0,-.2,GM);for(const s of[-1,1])H.B(.04,.16,1.0,s*.3,.08,-.2,GM);H.B(.6,.16,.04,0,.08,.3,GM);for(const[a,b]of[[-.25,.2],[.25,.2],[-.25,-.55],[.25,-.55]])H.C(.04,.04,.12,a,-.08,b,M(0x1a1a1a),null,null,8);H.B(.3,.24,.26,.48,.0,.1,BL)}
 const fl2=new THREE.Mesh(new THREE.DodecahedronGeometry(.6,0),M(0x8a7a6a,{roughness:1}));fl2.scale.y=.45;fl2.position.set(0,1.0,0);hp.add(fl2);
 L('ORE FEED',1.2,.28,'#1a1a1a','#e8c020',60,x,F+1.15,z+.79,0);
 /* the charging chute on the hood: an open-topped steel hopper; the belt's head drum hangs just over it */{for(const s2 of[-1,1]){B(.05,.5,.9,rx+s2*.43,F+4.15,rz,GM);B(.9,.5,.05,rx,F+4.15,rz+s2*.43,GM)}for(const s2 of[-1,1]){B(.09,.05,1.0,rx+s2*.45,F+4.42,rz,DK);B(1.0,.05,.09,rx,F+4.42,rz+s2*.45,DK)}B(.9,.08,.9,rx,F+3.94,rz,DK);B(.8,.02,.8,rx,F+4.0,rz,M(0x1a1a1a))}
 qmNS(g);return{hp,fl2,from:[x,F+1.58,z-.6],to:[rx,F+4.98,rz],obs:[{x0:x-.8,x1:x+.8,z0:z-.8,z1:z+.8}]}}

/* ---- the casting robot: a six-axis arm on a pedestal, cable loom along the arm, a gripper; a beacon; a safety rail ---- */
function qmCastRobot(g,rx,rz,F){const{k,M,ST,DK,YL,OR}=qmMat(),{B,C,rod,L}=k.H(g);const WH=M(0xe4e4e0,{roughness:.5,metalness:.2});
 C(.6,.7,.3,rx,F+.15,rz,DK,null,null,20);C(.52,.52,.06,rx,F+.33,rz,YL,null,null,20);
 const tw=new THREE.Group();tw.position.set(rx,F+.36,rz);tw.userData.dpKeep=1;g.add(tw);const T=k.H(tw);T.C(.44,.47,.3,0,.15,0,OR,null,null,18);T.B(.5,.45,.55,0,.5,0,OR);T.C(.22,.22,.66,0,.65,0,DK,'x',null,16);T.C(.24,.24,.06,.34,.65,0,WH,'x',null,16);T.C(.24,.24,.06,-.34,.65,0,WH,'x',null,16);
 const a1=new THREE.Group();a1.position.y=.65;tw.add(a1);const A1=k.H(a1);A1.B(.28,1.15,.32,0,.62,0,OR);A1.B(.3,.12,.34,0,.12,0,DK);A1.rod([.18,.2,.1],[.18,1.1,.1],.025,DK);A1.C(.17,.17,.44,0,1.25,0,DK,'x',null,14);A1.C(.19,.19,.05,.22,1.25,0,WH,'x',null,14);A1.C(.19,.19,.05,-.22,1.25,0,WH,'x',null,14);
 const a2=new THREE.Group();a2.position.y=1.25;a1.add(a2);const A2=k.H(a2);A2.B(.22,.92,.24,0,.5,0,OR);A2.rod([.14,.1,.08],[.14,.9,.08],.02,DK);A2.C(.11,.11,.3,0,1.0,0,DK,'x',null,12);
 const a3=new THREE.Group();a3.position.y=1.0;a2.add(a3);const A3=k.H(a3);A3.C(.09,.1,.2,0,.1,0,WH,null,null,12);A3.B(.24,.06,.14,0,.22,0,DK);const fg=[];for(const sd of[-1,1]){const f=A3.B(.04,.22,.1,sd*.07,.34,0,ST);fg.push(f)}
 const bc=C(.07,.07,.12,rx+.48,F+.42,rz+.25,new THREE.MeshStandardMaterial({color:0x30ff60,emissive:0x20c040,emissiveIntensity:1}),null,null,10);C(.05,.05,.06,rx+.48,F+.33,rz+.25,DK,null,null,10);
 /* a waist-high safety rail round the back half, yellow */for(let i=0;i<=6;i++){const a=Math.PI*(1+i/6);B(.05,.95,.05,rx+Math.cos(a)*1.25,F+.48,rz+Math.sin(a)*1.25,YL)}{const rr=new THREE.Mesh(new THREE.TorusGeometry(1.25,.025,6,24,Math.PI),YL);rr.rotation.x=Math.PI/2;rr.rotation.z=Math.PI;rr.position.set(rx,F+.95,rz);g.add(rr)}
 qmNS(g);return{tw,a1,a2,a3,fg,bc,rx,rz,obs:[{x0:rx-.7,x1:rx+.7,z0:rz-.7,z1:rz+.7}]}}

/* ---- the blower: a centrifugal fan in a scroll housing on a base, a guarded inlet (the fan turns behind it), a motor,
   and the hot-blast duct along the ground to a tuyere in the furnace's west wall ---- */
function qmBlower(g,bx,bz,F,fx,fz){const{k,M,ST,DK,BL,GM}=qmMat(),{B,C,rod,L}=k.H(g);
 B(1.4,.24,1.3,bx,F+.12,bz,DK);C(.72,.72,.55,bx,F+1.0,bz,BL,'z',null,24);B(.6,.72,.55,bx+.3,F+.62,bz,BL);C(.76,.76,.06,bx,F+1.0,bz-.3,DK,'z',null,24);
 const fan=new THREE.Group();fan.position.set(bx,F+1.0,bz-.36);fan.userData.dpKeep=1;g.add(fan);{const Fn=k.H(fan);for(let i=0;i<6;i++){const h=new THREE.Group();h.rotation.z=i*Math.PI/3;fan.add(h);const bl=new THREE.Mesh(new THREE.BoxGeometry(.14,.5,.02),ST);bl.position.y=.28;bl.rotation.y=.45;h.add(bl)}Fn.C(.1,.1,.06,0,0,0,DK,'z',null,12)}
 /* inlet guard: a ring and bars */{const r=new THREE.Mesh(new THREE.TorusGeometry(.64,.025,6,24),DK);r.position.set(bx,F+1.0,bz-.42);g.add(r);for(let i=0;i<4;i++){const b=B(1.26,.03,.03,bx,F+1.0,bz-.42,DK);b.rotation.z=i*Math.PI/4}}
 C(.24,.24,.5,bx+.95,F+.55,bz,BL,'x',null,14);B(.4,.3,.4,bx+.95,F+.35,bz,DK);
 /* the duct: up out of the scroll, along +z, round the corner and into the furnace wall, on stands */const y=F+1.9,DM=M(0x8a8e94,{metalness:.6,roughness:.35});
 rod([bx+.4,F+1.5,bz+.1],[bx+.4,y,bz+.1],.22,DM,null,14);rod([bx+.4,y,bz+.1],[bx+.4,y,fz],.22,DM,null,14);/* rounded elbows, so no pipe end shows at the corners */for(const[ex,ez]of[[bx+.4,bz+.1],[bx+.4,fz]]){const el=new THREE.Mesh(new THREE.SphereGeometry(.22,16,12),DM);el.position.set(ex,y,ez);g.add(el)}{const el=new THREE.Mesh(new THREE.SphereGeometry(.22,16,12),DM);el.position.set(bx+.4,F+1.5,bz+.1);g.add(el)}rod([bx+.4,y,fz],[fx,y,fz],.22,DM,null,14);C(.32,.32,.08,fx-.05,y,fz,DK,'x',null,14);
 for(const t of[.35,.75]){const zz=bz+.1+(fz-bz-.1)*t;B(.08,y-F-.2,.08,bx+.4,F+(y-F-.2)/2,zz,DK);B(.5,.06,.08,bx+.4,y-.22,zz,DK)}for(const zz of[bz+.1+.6,fz-.3])C(.28,.28,.05,bx+.4,y,zz,DK,'z',null,14);
 qmNS(g);return{fan,obs:[{x0:bx-.75,x1:bx+1.25,z0:bz-.7,z1:bz+.7}]}}

/* ---- the arc furnace: a portal gantry over the furnace, three electrode columns through roof ports, copper bus and
   cables; each column's el moves, rod glows, gl is the arc glow at the roof ---- */
function qmArc(g,x,z,F){const{k,M,ST,DK,YL,CU}=qmMat(),{B,C,rod,L}=k.H(g);const GY=F+6.6;
 for(const sx of[-2.45,2.45]){B(.28,GY-F,.4,x+sx,F+(GY-F)/2,z,DK);B(.6,.1,.7,x+sx,F+.05,z,ST)}B(5.2,.36,.5,x,GY,z,DK);B(5.2,.06,.52,x,GY+.21,z,YL);
 const arc=[];for(const dx of[-.8,0,.8]){C(.24,.28,.14,x+dx,F+3.97,z,ST,null,null,14);/* roof port */
  const el=new THREE.Group();el.position.set(x+dx,F+3.2,z);el.userData.dpKeep=1;g.add(el);const E=k.H(el);const rd=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,2.6,12),new THREE.MeshStandardMaterial({color:0x303030,emissive:0x5080ff,emissiveIntensity:.1}));rd.position.y=1.1;el.add(rd);
  E.B(.42,.24,.42,0,2.1,0,CU);E.B(.1,.1,.9,0,2.1,-.45,DK);rod([x+dx,GY-.18,z-.0],[x+dx,F+5.4,z],.04,CU);rod([x+dx,F+5.4,z],[x+dx+.3,GY-.2,z-.25],.03,M(0x1a1a1a));
  const gl=qmGlow(0x80b0ff,0,1.6);gl.position.set(x+dx,F+4.0,z);g.add(gl);arc.push({el,rod:rd,gl,b:dx})}
 L('ARC FURNACE · 3 × 40 kA',3,.32,'#1a1a1a','#80b0ff',60,x,GY,z-.26,Math.PI);
 qmNS(g);return{arc,obs:[{x0:x-2.6,x1:x-2.3,z0:z-.25,z1:z+.25},{x0:x+2.3,x1:x+2.6,z0:z-.25,z1:z+.25}]}}

/* ---- the die press over the mold table: two hydraulic columns, a crown with cylinders, the moving platen (press) ---- */
function qmPress(g,px,pz,F){const{k,M,ST,DK,BL,YL}=qmMat(),{B,C,rod,L}=k.H(g);
 for(const sx of[-1.8,1.8]){B(.5,.2,.6,px+sx,F+.1,pz,DK);C(.13,.13,3.0,px+sx,F+1.7,pz,M(0xc8ccd0,{metalness:.85,roughness:.2}),null,null,14);C(.2,.2,.2,px+sx,F+.3,pz,DK,null,null,14)}
 B(4.1,.5,.8,px,F+3.35,pz,BL);B(4.15,.06,.82,px,F+3.62,pz,YL);for(const sx of[-.9,.9]){C(.2,.2,.75,px+sx,F+2.78,pz,BL,null,null,14);rod([px+sx+.2,F+3.2,pz+.2],[px+sx+.6,F+3.6,pz+.45],.03,M(0x1a1a1a))}
 const press=new THREE.Group();press.position.set(px,F+2.2,pz);press.userData.dpKeep=1;g.add(press);{const P=k.H(press);P.B(3.4,.2,.95,0,0,0,DK);P.B(3.4,.06,.97,0,-.12,0,M(0x9a9ea4,{metalness:.7}));for(const sx of[-1.8,1.8])P.B(.4,.26,.36,sx,0,0,DK);/* rams long enough to stay in their cylinders at full stroke */for(const sx of[-.9,.9])P.C(.08,.08,1.2,sx,.7,0,M(0xc8ccd0,{metalness:.85,roughness:.2}),null,null,10)}
 L('DIE PRESS',1.4,.3,'#1a1a1a','#e8c020',60,px,F+3.35,pz-.41,Math.PI);
 qmNS(g);return{press,obs:[{x0:px-2.05,x1:px-1.55,z0:pz-.3,z1:pz+.3},{x0:px+1.55,x1:px+2.05,z0:pz-.3,z1:pz+.3}]}}
function qmLaunder(g,a,b){const{k,M,DK}=qmMat(),{B,C,rod}=k.H(g);const d=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]),Ln=d.length();const tg=new THREE.Group();tg.position.set((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);tg.rotation.set(-Math.atan2(d.y,Math.hypot(d.x,d.z)),Math.atan2(d.x,d.z),0,'YXZ');/* keeps the trough upright (open side up) */g.add(tg);const T=k.H(tg);
 T.B(.36,.06,Ln,0,0,0,DK);for(const s of[-1,1])T.B(.06,.18,Ln,s*.18,.08,0,DK);T.B(.24,.02,Ln-.1,0,.04,0,M(0x6a4a3a,{roughness:1}));
 const laun=new THREE.Mesh(new THREE.BoxGeometry(.18,.03,Ln-.2),new THREE.MeshBasicMaterial({color:0xff7020}));laun.position.y=.065;laun.visible=false;tg.add(laun);
 /* the tap hole it starts from: a cast block on the furnace wall with a glowing plug */B(.3,.42,.5,a[0]+.08,a[1]+.1,a[2],M(0x2e3034,{metalness:.6,roughness:.45}));{const tp=new THREE.Mesh(new THREE.CircleGeometry(.08,12),new THREE.MeshStandardMaterial({color:0x200800,emissive:0xff5010,emissiveIntensity:.8}));tp.rotation.y=Math.PI/2;tp.position.set(a[0]+.235,a[1]+.14,a[2]);g.add(tp)}for(const t of[.25,.75]){const x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t,z=a[2]+(b[2]-a[2])*t;B(.08,y-(a[1]>b[1]?b[1]-1.3:a[1]-1.3),.08,x,(y+(a[1]>b[1]?b[1]-1.3:a[1]-1.3))/2,z,DK)}
 qmNS(g);return{laun}}

/* ---- the refinery: a tall stainless tank with a dome, bands, a caged ladder, a railing on top, a gauge on the front,
   a valve wheel; its pipe climbs and runs over to the furnace hood ---- */
function qmRefinery(g,x,z,F,hx,hz){const{k,M,ST,DK,YL,RD,CU}=qmMat(),{B,C,rod,L}=k.H(g);const SV=M(0xc8ccd0,{metalness:.65,roughness:.3});
 C(1.5,1.5,.25,x,F+.12,z,k.PLINTH,null,null,28);for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4;B(.2,.6,.2,x+Math.cos(a)*1.15,F+.5,z+Math.sin(a)*1.15,DK)}
 C(1.3,1.3,3.6,x,F+2.6,z,SV,null,null,28);{const d=new THREE.Mesh(new THREE.SphereGeometry(1.3,28,10,0,Math.PI*2,0,Math.PI/2),SV);d.scale.y=.5;d.position.set(x,F+4.4,z);g.add(d)}C(1.3,.9,.4,x,F+.6,z,SV,null,null,28);
 for(const y of[1.3,2.6,3.9])C(1.33,1.33,.08,x,F+y,z,DK,null,null,28);
 /* ladder on the west side with a cage, a railing ring round the top */for(const sd of[-.22,.22])B(.05,4.6,.05,x-1.42,F+2.6,z+sd,YL);for(let y=.6;y<4.9;y+=.35)B(.05,.04,.44,x-1.42,F+y,z,YL);for(let y=2.6;y<5;y+=.6){const h=new THREE.Mesh(new THREE.TorusGeometry(.34,.018,4,12,Math.PI),YL);h.rotation.set(Math.PI/2,0,Math.PI/2);h.position.set(x-1.42,F+y,z);g.add(h)}
 {const rr=new THREE.Mesh(new THREE.TorusGeometry(.75,.03,6,24),YL);rr.rotation.x=Math.PI/2;rr.position.set(x,F+5.4,z);g.add(rr);for(let i=0;i<8;i++){const a=i/8*Math.PI*2;B(.04,.6,.04,x+Math.cos(a)*.75,F+5.1,z+Math.sin(a)*.75,YL)}C(.78,.78,.06,x,F+4.83,z,M(0x6a6e72,{metalness:.5}),null,null,24)}
 C(.12,.12,.5,x-.4,F+5.1,z+.3,SV,null,null,10);/* vent stack (steam puffs from top) */
 /* the gauge on the front (-z, facing the pit) */const gc=document.createElement('canvas');gc.width=gc.height=64;const gt=new THREE.CanvasTexture(gc);{const gg=new THREE.Mesh(new THREE.CircleGeometry(.24,24),new THREE.MeshBasicMaterial({map:gt}));gg.position.set(x,F+2.0,z-1.335);gg.rotation.y=Math.PI;g.add(gg);const rim=new THREE.Mesh(new THREE.TorusGeometry(.25,.035,6,24),DK);rim.position.set(x,F+2.0,z-1.33);g.add(rim)}
 L('REFINERY',2,.4,'#e0e4e8','#1a2a4a',60,x,F+3.25,z-1.335,Math.PI);
 /* the outlet pipe at the front with a valve wheel (vw turns on y: its wheel lies flat on top of the valve body) */rod([x+.6,F+1.0,z-1.15],[x+.6,F+1.0,z-1.9],.09,CU,null,10);C(.14,.14,.24,x+.6,F+1.0,z-1.9,DK,null,null,10);C(.03,.03,.3,x+.6,F+1.25,z-1.9,DK,null,null,8);
 const vw=new THREE.Group();vw.position.set(x+.6,F+1.4,z-1.9);vw.userData.dpKeep=1;g.add(vw);{const w=new THREE.Mesh(new THREE.TorusGeometry(.2,.025,6,16),RD);w.rotation.x=Math.PI/2;vw.add(w);for(let i=0;i<3;i++){const sp=new THREE.Mesh(new THREE.BoxGeometry(.4,.02,.02),RD);sp.rotation.y=i*Math.PI/3;vw.add(sp)}}
 rod([x+.6,F+1.0,z-1.9],[x+.6,F+.25,z-1.9],.09,CU,null,10);B(.3,.2,.3,x+.6,F+.1,z-1.9,DK);
 /* the feed pipe from the furnace: up the tank's east side (clear of the firebox door), across above the arc gantry, down onto the hood */const PY=F+7.1;/* (above the arc furnace's gantry beam) */rod([x+1.4,F+3.0,z],[x+1.4,PY,z],.11,CU,null,10);rod([x+1.4,PY,z],[x+1.4,PY,hz],.11,CU,null,10);rod([x+1.4,PY,hz],[hx,PY,hz],.11,CU,null,10);rod([hx,PY,hz],[hx,F+3.88,hz],.11,CU,null,10);/* lands on the hood (top at 3.9) with a flange */C(.2,.22,.08,hx,F+3.94,hz,DK,null,null,12);
 for(const[px2,pz2]of[[x+1.4,z],[x+1.4,hz],[hx,hz]])C(.15,.15,.24,px2,PY,pz2,DK,null,null,10);C(.18,.18,.06,x+1.32,F+3.0,z,DK,'x',null,10);rod([x+1.4,F+3.0,z],[x+1.25,F+3.0,z],.11,CU,null,10);
 for(const t of[.5]){const zz=z+(hz-z)*t;B(.1,PY-F,.1,x+1.4,F+(PY-F)/2,zz,DK);B(.6,.08,.2,x+1.4,F+.04,zz,DK)}
 qmNS(g);return{vw,gc,gt,top:[x-.4,F+5.4,z+.3],obs:[{x0:x-1.5,x1:x+1.5,z0:z-1.5,z1:z+1.5}]}}

/* =====================================================================================================
   Old Quarry, batch 5: the pit floor and the crucible rail. Needs fort-kit.js, quarry-yard.js and quarry-works.js (qmMat).
     qmCraneRail(g, x0, x1, rz, F, roofY)  the crucible runway from the furnace hood (post on the roof at x0) to an A-frame at x1
     qmCrucible()                           -> {tro, cr, pot, molt}: the trolley (game moves tro.position.x) with a hoist, chain,
                                              hook and the crucible (cr: y -3.0 under the trolley; pot tips on z inside the
                                              bail; lip on +x)
     qmDrillRig(g, bx, bz, by)              -> {hd, rod, mg, obs}: same moving parts as dx581 (hd y 6.8 .. 1.2 in mg, rod spins y)
     qmHaulTruck()                          -> Group with userData {bed, load, wh}: same as dx581's dump truck (front -z,
                                              bed pivots on x at the rear, wheels spin on x, wheel radius .75)
     qmBlast(g, px, pz, fx, fz, F)          -> {hg, ch, rk, obs}: the plunger box (hg drops), the charge (ch, now at fx - 2.5), the rocks (rk)
   ===================================================================================================== */

function qmCraneRail(g,x0,x1,rz,F,roofY){const{k,M,ST,DK,YL}=qmMat(),{B,C,rod,L}=k.H(g);const RY=F+5.2,STL=M(0x5a5e64,{metalness:.6,roughness:.4});
 /* the runway: an I-beam (top flange, web, bottom flange the trolley wheels run on), yellow end stops */
 const Lr=x1-x0,cx=(x0+x1)/2;B(Lr,.04,.26,cx,RY+.1,rz,STL);B(Lr,.2,.04,cx,RY,rz,STL);B(Lr,.04,.32,cx,RY-.1,rz,STL);for(const ex of[x0+.08,x1-.08]){B(.08,.26,.36,ex,RY-.06,rz,YL)}
 /* on the furnace roof: a stub column on a base plate, a knee brace */B(.6,.06,.6,x0+.25,roofY+.03,rz,DK);for(const c of[[.2,.03],[.03,.2]])B(c[0],RY-.12-roofY,c[1],x0+.25,(RY-.12+roofY)/2,rz,STL);rod([x0+.25,roofY+.9,rz],[x0+1.1,RY-.12,rz],.04,STL);
 /* the far end: an A-frame to the ground with a cross tie, base plates */for(const sz of[-.7,.7]){rod([x1-.15,RY-.12,rz],[x1-.15,F+.05,rz+sz],.07,STL);B(.4,.05,.4,x1-.15,F+.025,rz+sz,DK)}B(.08,.08,1.2,x1-.15,F+2.0,rz,STL);rod([x1-.15,F+3.4,rz],[x1-1.3,RY-.12,rz],.05,STL);
 L('CRUCIBLE RAIL · SWL 2 t',2.2,.26,'#e0a820','#1a1a1a',60,cx+1,RY,rz-.025,Math.PI);
 qmNS(g);return{obs:[{x0:x1-.4,x1:x1+.1,z0:rz-.9,z1:rz+.9}]}}

function qmCrucible(){const{k,M,ST,DK,YL}=qmMat();const tro=new THREE.Group();tro.userData.dpKeep=1;const T=k.H(tro);
 /* the trolley: two side plates with wheels on the bottom flange, a hoist motor and drum hanging under it */for(const sz of[-.22,.22]){T.B(.8,.32,.04,0,-.1,sz,YL);for(const sx of[-.25,.25])T.C(.07,.07,.06,sx,-.06,sz*.72,ST,'z',null,10)}T.B(.8,.08,.5,0,-.28,0,YL);
 T.B(.5,.32,.44,0,-.47,0,DK);T.C(.15,.15,.5,.32,-.47,0,M(0x2a5a8a,{metalness:.45}),'x',null,12);T.C(.12,.12,.4,0,-.72,0,ST,'z',null,12);
 T.C(.025,.025,.86,0,-1.2,0,M(0x2a2a2a,{metalness:.8}),null,null,6);/* chain */
 {const blk=new THREE.Group();blk.position.y=-1.79;/* its hook holds the crucible's bail */tro.add(blk);const Bk=k.H(blk);Bk.B(.3,.34,.2,0,0,0,YL);Bk.C(.06,.06,.22,0,-.2,0,DK,null,null,8);const hk=new THREE.Mesh(new THREE.TorusGeometry(.13,.035,6,12,Math.PI*1.4),DK);hk.position.y=-.37;hk.rotation.z=1.73;/* the bail rests in the bottom of the hook, the opening faces up and out */blk.add(hk)}
 /* the crucible: a tapered steel pot with a lip on +x, trunnions, a bail up to the hook; molten metal inside (molt) */
/* cr hangs from the hook; the pot inside it tips on the trunnions while the bail stays hanging */
 const cr=new THREE.Group();cr.position.y=-3.0;tro.add(cr);const pot=new THREE.Group();pot.position.y=.12;cr.add(pot);const Cc=k.H(pot);const PM=M(0x3a3a3a,{metalness:.6,roughness:.45,side:THREE.DoubleSide});
 const pm=new THREE.Mesh(new THREE.CylinderGeometry(.55,.4,.8,18,1,true),PM);pm.position.y=-.12;pot.add(pm);Cc.C(.4,.4,.04,0,-.52,0,PM,null,null,18);
 for(const y of[-.37,.13])Cc.C(.56-(.13-y)*.19,.56-(.13-y)*.19+.01,.06,0,y,0,DK,null,null,18);{const rim=new THREE.Mesh(new THREE.TorusGeometry(.55,.04,6,20),DK);rim.rotation.x=Math.PI/2;rim.position.y=.28;pot.add(rim)}
 {const lip=new THREE.Mesh(new THREE.ConeGeometry(.13,.3,4,1,true),PM);lip.position.set(.6,.24,0);lip.rotation.z=-Math.PI/2;lip.scale.z=.6;pot.add(lip)}
 for(const sz of[-1,1])Cc.C(.07,.07,.14,0,0,sz*.6,DK,'z',null,10);
 const molt=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,.05,18),new THREE.MeshBasicMaterial({color:0xff7020}));molt.position.y=.18;molt.visible=false;pot.add(molt);
 {const bail=new THREE.Mesh(new THREE.TorusGeometry(.62,.035,6,20,Math.PI),M(0x4a4a4a,{metalness:.7}));bail.rotation.y=Math.PI/2;bail.position.y=.12;cr.add(bail)}
 qmNS(tro);return{tro,cr,pot,molt}}

/* ---- the drill rig: a crawler with a deck, engine hood, cab, a boom to a feed mast; the rotary head runs down the mast ---- */
function qmDrillRig(g,bx,bz,by){const{k,M,ST,DK,YL,RB}=qmMat(),{B,C,rod,L}=k.H(g);const Y=M(0xe0a818,{metalness:.25,roughness:.5}),GL=new THREE.MeshStandardMaterial({color:0x1a2a38,metalness:.5,roughness:.15,transparent:true,opacity:.7});
 /* crawler tracks: side frames, sprocket and idler, rollers, a track band with lugs */for(const sd of[-1,1]){const tx=bx+sd*1.2;B(.5,.42,3.0,tx,by+.42,bz+.25,DK);for(const zz of[-1.25,1.75])C(.34,.34,.6,tx,by+.36,bz+zz,RB,'x',null,16);for(let i=0;i<4;i++)C(.12,.12,.56,tx,by+.14,bz-.75+i*.7,ST,'x',null,10);
  B(.62,.06,3.0,tx,by+.72,bz+.25,RB);B(.62,.06,3.0,tx,by+.03,bz+.25,RB);for(let i=0;i<14;i++)B(.64,.04,.08,tx,by+.76,bz-1.25+i*.23,RB)}
 /* deck, engine hood with louvres, radiator, exhaust, a handrail */B(2.3,.2,3.4,bx,by+.86,bz+.3,DK);B(1.8,.95,1.5,bx-.15,by+1.43,bz+1.15,Y);for(let i=0;i<6;i++)B(.02,.5,1.3,bx+.76,by+1.45,bz+.6+i*.0,DK).position.z=bz+.55+i*.22;B(1.6,.6,.04,bx-.15,by+1.45,bz+1.91,DK);C(.06,.07,.8,bx-.7,by+2.25,bz+1.4,DK,null,null,8);C(.09,.09,.06,bx-.7,by+2.66,bz+1.4,DK,null,null,8);
 for(const sz of[-.9,1.85]){B(.04,.6,.04,bx+1.05,by+1.26,bz+sz,YL)}B(.04,.04,2.8,bx+1.05,by+1.56,bz+.5,YL);
 /* the cab: a frame, glass, roof, a door handle, a step */const cx=bx+.45,cz=bz-.4;B(1.05,.1,1.1,cx,by+1.01,cz,Y);B(1.1,.08,1.15,cx,by+2.36,cz,Y);for(const[a,b]of[[-.48,-.5],[.48,-.5],[-.48,.5],[.48,.5]])B(.07,1.3,.07,cx+a,by+1.7,cz+b,Y);B(.98,1.24,1.02,cx,by+1.7,cz,GL);B(.4,.06,.2,cx+.62,by+.7,cz,DK);C(.06,.06,.08,cx,by+2.44,cz,M(0xff8000,{emissive:0xff6000,emissiveIntensity:.3}),null,null,10);
 /* the boom out front to the mast cradle */B(.42,.42,1.2,bx,by+1.25,bz-1.75,Y);rod([bx-.15,by+1.0,bz-1.2],[bx-.15,by+1.45,bz-2.3],.07,DK);B(.8,.6,.32,bx,by+1.3,bz-2.45,DK);
 /* the mast: a lattice of two channels and rungs, a crown with a sheave, the centraliser at the foot */const mg=new THREE.Group();mg.position.set(bx,by,bz-2.75);g.add(mg);const Mg=k.H(mg);
 for(const sd of[-1,1])Mg.B(.08,7.2,.3,sd*.2,3.75,0,Y);for(let y=.5;y<7.3;y+=.6)Mg.B(.4,.05,.05,0,y,.14,Y);for(const sd of[-1,1])Mg.B(.04,7,.05,sd*.15,3.75,-.17,ST);
 Mg.B(.54,.35,.5,0,7.45,-.08,DK);Mg.C(.2,.2,.12,0,7.62,-.1,ST,'x',null,14);Mg.B(.56,.3,.56,0,.45,-.3,DK);Mg.C(.13,.13,.34,0,.45,-.3,ST,null,null,12);for(const sd of[-1,1])Mg.C(.025,.025,6.6,sd*.26,3.9,.06,RB,null,null,6);
 const hd=new THREE.Group();mg.add(hd);hd.userData.dpKeep=1;{const H=k.H(hd);H.B(.6,.72,.48,0,0,-.32,DK);H.B(.64,.1,.52,0,.42,-.32,Y);H.C(.16,.16,.22,0,-.48,-.32,ST,null,null,12);H.C(.1,.1,.3,0,.3,-.05,M(0x2a5a8a,{metalness:.45}),'x',null,10)}
 const rd=new THREE.Mesh(new THREE.CylinderGeometry(.065,.065,7.4,10),ST);rd.position.set(0,-4.3,-.32);hd.add(rd);{const bit=new THREE.Mesh(new THREE.ConeGeometry(.12,.24,8),ST);bit.rotation.x=Math.PI;bit.position.y=-3.75;rd.add(bit)}
 /* the blast hole and its ring of cuttings */{const hole=new THREE.Mesh(new THREE.CircleGeometry(.24,18),RB);hole.rotation.x=-Math.PI/2;hole.position.set(bx,by+.02,bz-3.05);g.add(hole);const ring=new THREE.Mesh(new THREE.RingGeometry(.24,.65,18),M(0x8a7a62,{roughness:1}));ring.rotation.x=-Math.PI/2;ring.position.set(bx,by+.015,bz-3.05);g.add(ring)}
 L('DRILL 2',.8,.26,'#1a1a1a','#e0a818',60,bx-.15,by+1.45,bz+1.93,0);
 qmNS(g);return{hd,rod:rd,mg,obs:[{x0:bx-1.6,x1:bx+1.6,z0:bz-3.1,z1:bz+2.1}]}}

/* ---- the haul truck: a rigid dump truck, front -z. The bed pivots at the rear (bed group at (0, 1.6, 2.8), mesh forward of it). ---- */
function qmHaulTruck(){const{k,M,ST,DK,RB}=qmMat();const tk=new THREE.Group();const T=k.H(tk);const Y=M(0xf0b818,{roughness:.5,metalness:.25}),GL=new THREE.MeshStandardMaterial({color:0x223040,metalness:.5,roughness:.15});
 /* the chassis rails, the front axle housing, the engine bay with a grille, the deck the cab sits on */T.B(1.4,.5,5.8,0,1.05,0,DK);T.B(2.5,.5,.6,0,1.0,-2.0,DK);T.B(2.5,.5,.8,0,1.0,2.0,DK);
 T.B(1.9,1.2,1.6,0,1.7,-2.5,Y);T.B(1.7,.9,.06,0,1.65,-3.31,DK);for(let i=0;i<8;i++)T.B(1.6,.03,.07,0,1.28+i*.1,-3.34,M(0x6a6e72,{metalness:.6}));for(const sd of[-1,1])T.B(.3,.16,.06,sd*.7,2.1,-3.33,M(0xfff0c0,{emissive:0xffe0a0,emissiveIntensity:.8}));
 T.B(2.9,.12,1.9,0,2.36,-2.25,Y);/* the deck, full width, with a rail */for(const sx of[-1.4,1.4])T.B(.04,.5,1.8,sx,2.67,-2.25,DK);
 /* the cab on the left of the deck, glass, a ladder up the front */const cx=-.75;T.B(1.1,1.2,1.3,cx,3.02,-2.3,Y);T.B(1.0,.65,.04,cx,3.25,-2.96,GL);T.B(.04,.65,1.0,cx-.56,3.25,-2.35,GL);T.B(.04,.65,1.0,cx+.56,3.25,-2.35,GL);T.B(1.16,.06,1.36,cx,3.64,-2.3,DK);
 for(let i=0;i<5;i++)T.B(.5,.04,.06,1.0,.55+i*.36,-3.25,DK);for(const sx of[.76,1.24])T.B(.04,1.9,.04,sx,1.3,-3.25,DK);
 T.C(.08,.09,1.0,.75,3.1,-1.6,DK,null,null,8);/* exhaust stack */
 /* wheels: two fronts, dual rears; spinning parts in wh */const wh=[];const wheel=(x,z,w)=>{const gw=new THREE.Group();gw.position.set(x,.75,z);gw.rotation.order='YXZ';gw.rotation.y=Math.PI;/* turned round, so the game's rotation.x += rolls it forward (the old truck's wheels rolled backwards) */tk.add(gw);const W=k.H(gw);W.C(.75,.75,w,0,0,0,RB,'x',null,20);for(let i=0;i<10;i++){const a=i/10*Math.PI*2;W.B(w+.02,.12,.18,0,Math.cos(a)*.72,Math.sin(a)*.72,RB).rotation.x=-a}W.C(.42,.42,w+.04,0,0,0,Y,'x',null,16);W.C(.14,.14,w+.08,0,0,0,DK,'x',null,10);wh.push(gw)};
 for(const sd of[-1,1]){wheel(sd*1.3,-2,.6);wheel(sd*1.12,2,.42);wheel(sd*1.62,2,.42)}
 /* mudguards over the wheels */for(const sd of[-1,1]){T.B(.75,.08,1.8,sd*1.35,1.62,-2,Y);T.B(1.0,.08,1.8,sd*1.37,1.62,2,Y)}
 /* the bed: a body with ribbed sides, a sloped floor, a canopy that reaches over the cab; two hoist rams */const bed=new THREE.Group();bed.position.set(0,1.6,2.8);tk.add(bed);const Bd=k.H(bed);
 Bd.B(2.8,.12,4.4,0,.06,-2.1,Y);for(const sd of[-1,1]){Bd.B(.1,1.3,4.4,sd*1.4,.7,-2.1,Y);for(let i=0;i<5;i++)Bd.B(.08,1.3,.1,sd*1.46,.7,-3.9+i*.9,DK)}Bd.B(2.8,1.4,.12,0,.76,-4.28,Y);Bd.B(3.0,.1,1.6,0,1.55,-4.95,Y);for(let i=0;i<4;i++)Bd.B(2.84,.08,.08,0,.3+i*.32,-4.36,DK);Bd.B(2.86,.1,.12,0,1.38,-.0,DK);
 const load=new THREE.Mesh(new THREE.DodecahedronGeometry(1.3,0),M(0x9a8466,{roughness:1}));load.scale.set(1,.5,1.4);load.position.set(0,1.3,-2.1);bed.add(load);
 for(const sx of[-.5,.5])T.rod([sx,1.15,.6],[sx,1.75,.1],.09,ST,null,10);
 qmNS(tk);tk.userData={bed,load,wh};return tk}

/* ---- the daily blast: a detonator box with a T-handle, a wire reel, the wire to the charge, the charge on a rock pile, a sign ---- */
function qmBlast(g,px,pz,fx,fz,F){const{k,M,ST,DK,RD,RB}=qmMat(),{B,C,rod,L}=k.H(g);const WD=M(0x7a4a22,{roughness:.8});
 /* the box: wood with brass corners and terminals, a stencil */B(.56,.44,.42,px,F+.22,pz,WD);B(.62,.06,.48,px,F+.47,pz,M(0x5a3418));for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])B(.06,.44,.06,px+a*.28,F+.22,pz+b*.21,M(0xc0a040,{metalness:.8}));L('DANGER · TNT',.42,.12,'#7a4a22','#ffe0a0',60,px,F+.26,pz+.215,0);
 const hg=new THREE.Group();hg.position.set(px,F+.5,pz);g.add(hg);hg.userData.dpKeep=1;{const H=k.H(hg);H.C(.025,.025,.5,0,.25,0,ST,null,null,8);H.C(.035,.035,.5,0,.5,0,RB,'x',null,8);for(const sd of[-1,1])H.C(.045,.045,.12,sd*.22,.5,0,RD,'x',null,8)}
 for(const sd of[-1,1])C(.03,.03,.06,px+sd*.16,F+.52,pz-.12,M(0xc0a040,{metalness:.8}),null,null,8);
 /* a wire reel on a stand beside it */{const rx=px-.75;for(const sd of[-1,1])B(.04,.5,.04,rx,F+.25,pz+sd*.2,DK);C(.2,.2,.3,rx,F+.45,pz,M(0xb02a1a),'z',null,14);C(.08,.08,.32,rx,F+.45,pz,RB,'z',null,10)}
 /* the wire: two strands on the floor in a lazy curve to the charge */const WM=M(0x1a1a1a);for(const off of[-.03,.03]){let lx=px,lz=pz-.12+off;for(let i=1;i<=14;i++){const u=i/14,x=px+(fx-2.5-px)*u,z=pz-.12+off+(fz-pz+.12)*u+Math.sin(u*Math.PI)*2.4;rod([lx,F+.03,lz],[x,F+.03,z],.016,WM,null,5);lx=x;lz=z}}
 /* the rock pile on the face, the charge against it: sticks taped in a bundle, a cap, a little flag */let sd=4321;const r=()=>((sd=Math.imul(sd^sd>>>15,sd|1)+0x6d2b79f5|0)>>>0)/4294967296;const rk=[];for(let i=0;i<8;i++){const s=.5+r()*.5,b=new THREE.Mesh(new THREE.DodecahedronGeometry(s,0),M(0x8a6a4a,{roughness:1}));b.position.set(fx-.2-r()*1.5,F+s*.5,fz+(r()-.5)*3);b.rotation.set(r()*3,r()*3,r()*3);g.add(b);rk.push(b)}
 const ch=new THREE.Group();ch.position.set(fx-2.5,F,fz);/* in front of the pile, facing the plunger */g.add(ch);{const Ch=k.H(ch);for(let i=0;i<6;i++)Ch.C(.06,.06,.5,Math.cos(i*1.05)*.12,.25,Math.sin(i*1.05)*.12,M(0xc02020,{roughness:.6}),null,null,8);for(const y of[.12,.38])Ch.C(.19,.19,.06,0,y,0,M(0xc8c8c0),null,null,12);Ch.B(.1,.1,.1,0,.55,0,M(0xc0c0c0,{metalness:.8}));Ch.C(.012,.012,.9,.3,.45,0,DK,null,null,4);Ch.B(.02,.14,.22,.31,.83,.11,M(0xff8020))}
 /* the sign on a post, both sides */C(.04,.04,1.45,px+.55,F+.72,pz,DK,null,null,6);B(1.6,.7,.05,px+.55,F+1.75,pz,M(0x3a2a1a));for(const s2 of[1,-1]){const sg=k.lab('DAILY BLAST · 100 GOLD\nONCE A DAY',1.5,.6,'#c02020','#ffffff',48);sg.position.set(px+.55,F+1.75,pz+s2*.03);if(s2<0)sg.rotation.y=Math.PI;g.add(sg)}
 qmNS(g);return{hg,ch,rk,obs:[{x0:px-.32,x1:px+.32,z0:pz-.25,z1:pz+.25}]}}


/* r618: the game's seam smoothing would stack depth nudges on these models' touching faces (see r616); they carry their own */
for(const nm of["qmFurnace","qmMoldTable","qmGrinder","qmWinch","qmAssay","qmOreHopper","qmPad","qmTurn","qmCrusher","qmOffice","qmFlood","qmEntrance","qmMachine","qmSkip","qmOreFeed","qmCastRobot","qmBlower","qmArc","qmPress","qmLaunder","qmRefinery","qmCraneRail","qmDrillRig","qmBlast"]){const f=window[nm];if(typeof f!='function')continue;window[nm]=function(){const g=[...arguments].find(a=>a&&a.isObject3D);const n0=g?g.children.length:0;const r=f.apply(this,arguments);try{if(g)for(let i=n0;i<g.children.length;i++)g.children[i].traverse(o=>{if(o.isMesh)o.userData.noSeam=true})}catch(e){}return r}}
for(const nm of["qmCrucible","qmHaulTruck"]){const f=window[nm];if(typeof f!='function')continue;window[nm]=function(){const r=f.apply(this,arguments);try{const o3=r&&(r.isObject3D?r:r.tro);if(o3)o3.traverse(o=>{if(o.isMesh)o.userData.noSeam=true})}catch(e){}return r}}

/* r618: the route grid pads every obstacle by 2.2 m on a 3 m grid, so the 4.6 m gap between the bottom of the haul road and
   the second row of machines reads as shut, and AI drivers could not get onto the pit floor. A straight link joins the two
   sides of that gap (the driver goes from one end to the other in a straight line, well clear of both). */
function navExtraLinks(g,links){const L=(A,B)=>{const a=navCell(A[0],A[1]),b=navCell(B[0],B[1]);if(a<0||b<0||g[a]||g[b]||links[a]||links[b])return;links[a]={to:b,ax:A[0],az:A[1],bx:B[0],bz:B[1],up:1};links[b]={to:a,ax:B[0],az:B[1],bx:A[0],bz:A[1],up:1}};
 L([-225,-1471.5],[-200,-1466])}

/* r618: the road up Lookout Mesa was a thin slab with nothing under it, so from the side it looked like a plank floating in
   the air. A rock embankment now fills the space under it, from the ground up to the road. */
{const xm18=xpMesa;xpMesa=function(X){const r=xm18.apply(this,arguments);try{const{g,M}=X,H=MESA.y,s=-220,e=MESA.x1,len=s-e;
  const sh=new THREE.Shape();sh.moveTo(s-.6,0);sh.lineTo(e,0);sh.lineTo(e,H-.38);sh.lineTo(s-.6,.6*H/len-.38<0?0:.6*H/len-.38);sh.lineTo(s-.6,0);
  const ge=new THREE.ExtrudeGeometry(sh,{depth:7.7,bevelEnabled:false});ge.translate(0,0,-1554+.15);
  const mat=M(0x8f6c48,{roughness:1});const m=new THREE.Mesh(ge,mat);m.userData.noSeam=true;g.add(m)}catch(e){conLog('error','mesa ramp fill: '+e.message)}return r}}
