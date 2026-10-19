# builds src/dx620.js: the design chat's pen.js + the game's pen* builders redefined with the new models swapped in
import re,sys
ROOT='/home/user/vibecodeddoors-slop-/'
OUT=open(ROOT+'out/DOORS.html').read()
def fn(name):
    # the function's own text: from its name to its matching closing brace (strings and comments skipped)
    # the game's own copy: skip any copy this script made earlier (they mention PENOFF)
    i=-1
    while True:
        i=OUT.index('function '+name+'(',i+1);e=OUT.find('\nfunction ',i+10);e=len(OUT) if e<0 else e
        if 'PENOFF' not in OUT[i:e] and 'PG_(' not in OUT[i:e]:break
    k=OUT.index('{',OUT.index(')',i));d=0;n=len(OUT);q=None
    while k<n:
        c=OUT[k]
        if q:
            if c=='\\':k+=2;continue
            if c==q:q=None
        elif c in '\'"`':q=c
        elif OUT.startswith('/*',k):k=OUT.index('*/',k)+2;continue
        elif c=='{':d+=1
        elif c=='}':
            d-=1
            if d==0:return OUT[i:k+1]
        k+=1
    sys.exit('no end for '+name)
def rep(t,a,b,n=1):
    c=t.count(a)
    if c!=n: sys.exit('EDIT FAILED (%d found): %r'%(c,a[:90]))
    return t.replace(a,b)
def tame(t):
    # every mesh the old code adds goes nowhere while PENOFF is set (obstacles, props and anims still run)
    t=re.sub(r'(?<![\w.$])g\.add\(','PG_(g).add(',t)
    t=re.sub(r'(?<![\w.$])dLabel\(g,','dLabel(PG_(g),',t)
    t=re.sub(r'(?<![\w.$])lantern\(g,','lantern(PG_(g),',t)
    return t
PARTS=[]
model=open(ROOT+'docs/design/models/pen.js').read()
# the model's penBasket(g,x,z,i) would replace the game's penBasket(q,b) (the laundry basket rummage): renamed
model=re.sub(r'\bpenBasket\(','penBasketM(',model)

# ======================= penBuild =======================
t=tame(fn('penBuild'))
# ground: the yard's gravel uses the new material (UVs in 4 m tiles); the courtyard plane and the old road go (penGround, penFrontGate)
t=rep(t,"const yd=new THREE.Mesh(new THREE.PlaneGeometry(PENF.x1-PENF.x0,PENF.z1-PENF.z0),new THREE.MeshStandardMaterial({map:yt,roughness:1}));",
 "const ydG=new THREE.PlaneGeometry(PENF.x1-PENF.x0,PENF.z1-PENF.z0);{const uv=ydG.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*(PENF.x1-PENF.x0)/4,uv.getY(i)*(PENF.z1-PENF.z0)/4)}const yd=new THREE.Mesh(ydG,penYardMats().gravel);yd.userData.noSeam=true;")
t=rep(t,"const cy=new THREE.Mesh(","PENOFF=1;const cy=new THREE.Mesh(")
t=rep(t,"A(BX(.25,.05,2),M(0xe8d070),-440,.05,z)}","A(BX(.25,.05,2),M(0xe8d070),-440,.05,z);PENOFF=0;try{penGround(g)}catch(e){conLog('error','pen ground: '+e.message)}}")
# fences: the chain link of each section from the model (null in the gate gaps: keep a stand-in so cutting still works); the posts and razor tori go
t=rep(t,"const t=ft.clone();t.needsUpdate=true;t.repeat.set(L/1.6,6/1.6);const m=new THREE.Mesh(new THREE.PlaneGeometry(L,6),new THREE.MeshStandardMaterial({map:t,color:0x8a9098,transparent:true,opacity:.45,depthWrite:false,side:THREE.DoubleSide,metalness:.5,roughness:.6}));m.position.set(cx,3,cz);m.rotation.y=-ang;PG_(g).add(m);",
 "const m=penFenceMesh(g,x0,z0,x1,z1)||{visible:true};")
t=rep(t,"const p=A(new THREE.CylinderGeometry(.08,.08,6.6,6),POST,x0,3.3,z0);const rz=A(new THREE.TorusGeometry(.32,.05,4,10),RZ,cx,6.4,cz);rz.rotation.y=-ang+Math.PI/2;rz.scale.set(1,1,L*1.6);for(let i=0;i<Math.floor(L/2);i++){const r2=A(new THREE.TorusGeometry(.32,.03,4,10),RZ,x0+(x1-x0)*(i+.5)/Math.floor(L/2),6.4,z0+(z1-z0)*(i+.5)/Math.floor(L/2));r2.rotation.y=-ang}","")
# the front gate: the old pillars, gantry, lamps, outer posts, stop line and gatehouse go; the leaves get the model's leaves on new tracks
t=rep(t,"/* the front gate (locked) and the gatehouse */","try{penFenceTop(g)}catch(e){conLog('error','pen fence top: '+e.message)}\n  /* the front gate (locked) and the gatehouse */PENOFF=1;")
t=rep(t,"{const sl=A(new THREE.PlaneGeometry(10,.25),YLW,gx,.03,OZ2+1.6);sl.rotation.x=-Math.PI/2;const sp=","PENOFF=0;{const sp=")
t=rep(t,"{dLabel(PG_(g),'SALLY PORT · STOP · WAIT FOR THE SECOND GATE'","{dLabel(g,'SALLY PORT · STOP · WAIT FOR THE SECOND GATE'")
t=rep(t,"A(BX(4,4,4),CON2,gx-8,2,GZ-2);A(BX(4.4,.3,4.4),DK,gx-8,4.15,GZ-2);W(gx-10,gx-6,GZ-4,GZ,4,CON2);","/* r627: the gatehouse moved out of the outer track */W(-452,-448,-868.4,-864.4,4,null);PENOFF=1;")
t=rep(t,"q.pctl={dg,dob,open:0,dx,dz:rz1,px:-426,pz:rz0+1.2,btnG}}",
 "q.pctl={dg,dob,open:0,dx,dz:rz1,px:-426,pz:rz0+1.2,btnG};PENOFF=0;\n   /* r627: the gate control room from the model: its door leaf in the game's swinging dg group, its green button */try{const GC=penGateControl(g);g.add(dg);while(dg.children.length)dg.remove(dg.children[0]);dg.add(GC.leaf);q.pctl.btnG=GC.btnG;dLabel(g,'GATE CONTROL\\nAUTHORISED STAFF ONLY',1.6,.5,'#8a1010','#ffe0a0',dx,2.55,rz1+.17,0,40)}catch(e){conLog('error','pen gate control: '+e.message)}}\n  try{const FG=penFrontGate(g);PG.main.forEach((L,i)=>{g.add(L.g);while(L.g.children.length)L.g.remove(L.g.children[0]);L.g.add(FG.main[i]);L.g.position.z=PENF.z0+.45});PG.outer.forEach((L,i)=>{g.add(L.g);while(L.g.children.length)L.g.remove(L.g.children[0]);L.g.add(FG.outer[i]);L.g.position.z=PENF.z0-3-.45})}catch(e){conLog('error','pen front gate: '+e.message)}")
# towers: the model's tower; the 4 x 4 obstacle stays (no mesh); the glow sits in the searchlight drum
t=rep(t,"for(const[a,b]of[[-1.6,-1.6],[1.6,-1.6],[-1.6,1.6],[1.6,1.6]])A(BX(.35,13,.35),CON2,x+a,6.5,z+b);A(BX(5,3,5),CON,x,14.5,z);A(BX(5.6,.4,5.6),DK,x,16.2,z);for(const s of[-1,1]){A(BX(4.2,1.2,.05),M(0x203040,{emissive:0x081018}),x,14.8,z+s*2.52);A(BX(.05,1.2,4.2),M(0x203040,{emissive:0x081018}),x+s*2.52,14.8,z)}W(x-2,x+2,z-2,z+2,1,CON2,1);const lg=glowSp(0xfff4c0,.9,2.5);lg.position.set(x,16.8,z);PG_(g).add(lg)}",
 "W(x-2,x+2,z-2,z+2,1,null,1);try{const TW=penTower(g,x,z);TW.x=x;TW.z=z;(P0.towers=P0.towers||[]).push(TW);const lg=glowSp(0xfff4c0,.9,2.5);lg.position.set(0,0,.45);TW.head.add(lg)}catch(e){conLog('error','pen tower: '+e.message)}}")
# the inner wall: the model's wall (obstacles and sight lines stay); the gate slab becomes the model's gate, its lamp the wall's lamp
t=rep(t,"WL('x',PENI.z0,PENI.x0,PENI.x1,7,CON,[[-446,-434]],.8);","let IWL=null;try{IWL=penInnerWall(g)}catch(e){conLog('error','pen inner wall: '+e.message)}PENOFF=1;WL('x',PENI.z0,PENI.x0,PENI.x1,7,CON,[[-446,-434]],.8);")
t=rep(t,"DOOR('igate','x',PENI.z0,-446,-434,0x3a4048);P0.doors.igate.m.scale.y=2.6;P0.doors.igate.m.position.y=3.4;",
 "PENOFF=0;dLabel(g,'⚠ RESTRICTED · USE OF FORCE AUTHORISED',6,.7,'#d8b020','#1a1a1a',-470,3.4,PENI.z0-.45,Math.PI,52);dLabel(g,'⚠ NO PRISONER BEYOND THIS POINT',5,.7,'#d8b020','#1a1a1a',-410,3.4,PENI.z0-.45,Math.PI,52);\n DOOR('igate','x',PENI.z0,-446,-434,0x3a4048);try{const D=P0.doors.igate,ig=penInnerGate();g.remove(D.m);ig.position.set(D.m.position.x,3.4,D.m.position.z);ig.userData.dpKeep=1;g.add(ig);D.m=ig;D.x0=ig.position.x;D.z0=ig.position.z;if(IWL&&IWL.lampMat){g.remove(D.lt);D.lt={material:IWL.lampMat}}}catch(e){conLog('error','pen inner gate: '+e.message)}")
# the exit door: the model's steel door
t=rep(t,"DOOR('exit','x',B.z1,-416,-414,0x5a3030);","DOOR('exit','x',B.z1,-416,-414,0x5a3030);penDoorSwap(g,P0.doors.exit,0);")
# the cells: walls, fronts, doors, fittings and the grate from the model (every obstacle stays); each cell's glow under its new light
t=rep(t,"WL('x',-787,-468,-424,H,IW,[[-450.6,-449.4,'grate']],.3);","PENOFF=1;WL('x',-787,-468,-424,H,IW,[[-450.6,-449.4,'grate']],.3);")
t=rep(t,"if(!mine){const sh=glowSp(0xfff0c0,.25,1.5);sh.position.set(x+2,3.6,-784);PG_(g).add(sh)}}","if(!mine){const sh=glowSp(0xfff0c0,.25,1.5);sh.position.set(x+2,4.35,-784);g.add(sh)}}PENOFF=0;")
t=rep(t,"P0.trayM=tray;const sp=A(BX(.04,.02,.25),M(0xd0d0d8,{metalness:.9}),x+2.1,.93,-781.45);sp.visible=false;P0.spoonM=sp}",
 "P0.trayM=tray;const sp=A(BX(.04,.02,.25),M(0xd0d0d8,{metalness:.9}),x+2.1,.93,-781.45);sp.visible=false;P0.spoonM=sp;\n  try{const CL=penCells(g);if(gr.parent)gr.parent.remove(gr);P0.grateM=CL.grate;P0.grate2M=CL.grate2;P0.flap=CL.flap;P0.cellDoors=CL.doors}catch(e){conLog('error','pen cells: '+e.message)}}")
# the vent maze: the model's ducts (lanes, plates and obstacles stay), its bulbs get the glows; the model's fans
t=rep(t,"const f=A(BX(CW,.05,CH),DF,cx(c),.04,cz(r));A(BX(CW,.06,CH),DM,cx(c),.9,cz(r));for(const[dc,dr,ax]of[[1,0,'z'],[-1,0,'z'],[0,1,'x'],[0,-1,'x']]){if(lane.has((c+dc)+','+(r+dr)))continue;if(ax=='z')A(BX(.05,.9,CH),DM,cx(c)+dc*CW/2,.45,cz(r));else A(BX(CW,.9,.05),DM,cx(c),.45,cz(r)+dr*CH/2)}if(Math.random()<.25){const lt=glowSp(0xffe0a0,.25,.6);lt.position.set(cx(c),.8,cz(r));PG_(g).add(lt)}}","}")
t=rep(t,"P0.duct={x0:X0,x1:X0+cols*CW,z0:Z0,z1:Z0+rows*CH,cx,cz,lane};","P0.duct={x0:X0,x1:X0+cols*CW,z0:Z0,z1:Z0+rows*CH,cx,cz,lane};try{for(const p of penVentDucts(g,lane)){const lt=glowSp(0xffe0a0,.25,.6);lt.position.set(p[0],p[1],p[2]);g.add(lt)}}catch(e){conLog('error','pen ducts: '+e.message)}")
t=rep(t,"const fg=new THREE.Group();fg.position.set(cx(c),.45,cz(r));PG_(g).add(fg);const hub=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,.2,10),DK);hub.rotation.z=Math.PI/2;fg.add(hub);const bl=new THREE.Group();fg.add(bl);for(let i=0;i<4;i++){const b=new THREE.Mesh(BX(.08,.85,.22),M(0x9aa0a8,{metalness:.7}));b.position.y=.4;const p=new THREE.Group();p.rotation.x=i*Math.PI/2;p.add(b);bl.add(p)}",
 "const VF=penVentFan(),fg=VF.fan;fg.position.set(cx(c),.45,cz(r));fg.userData.dpKeep=1;g.add(fg);const bl=VF.bl;")
# the laundry: washers and baskets come from penLaundry (their obstacles stay)
t=rep(t,"for(let i=0;i<4;i++){A(BX(1,1.1,1),M(0xe8e8ec),-412,.55,-799+i*1.4);","PENOFF=1;for(let i=0;i<4;i++){A(BX(1,1.1,1),M(0xe8e8ec),-412,.55,-799+i*1.4);")
t=rep(t,"W(x-.45,x+.45,z-.45,z+.45,.8,null,1);P0.baskets.push({x,z,i})}","W(x-.45,x+.45,z-.45,z+.45,.8,null,1);P0.baskets.push({x,z,i})}PENOFF=0;")
# the break room's TV, table and doughnuts go (penBreakRoom)
t=rep(t,"A(BX(1.2,.8,.6),M(0x1a1a1a),-467,1.2,-768);","PENOFF=1;A(BX(1.2,.8,.6),M(0x1a1a1a),-467,1.2,-768);")
t=rep(t,"for(let i=0;i<3;i++)A(new THREE.CylinderGeometry(.05,.05,.12,8),M(0xd8a040),-459.2+i*.15,.96,-768);","for(let i=0;i<3;i++)A(new THREE.CylinderGeometry(.05,.05,.12,8),M(0xd8a040),-459.2+i*.15,.96,-768);PENOFF=0;")
# the control room: steel door; the console and the desk go (penControlRoom), the switches stay
t=rep(t,"DOOR('ctrl','z',-426,-762,-760,0x3a4a6a);","DOOR('ctrl','z',-426,-762,-760,0x3a4a6a);penDoorSwap(g,P0.doors.ctrl,1);")
t=rep(t,"A(BX(1,1,8),M(0x2a2e34),-447.2,.5,-761);for(let i=0;i<6;i++){","PENOFF=1;A(BX(1,1,8),M(0x2a2e34),-447.2,.5,-761);for(let i=0;i<6;i++){")
t=rep(t,"const sw1=A(","PENOFF=0;const sw1=A(")
t=rep(t,"A(BX(2,.8,1),M(0x6a4a2a),-436,.4,-752);","")
# the ceiling lamps: the model's caged lamp (the one in the control room's wall moves into the passage)
t=rep(t,"for(const z of[-778.5,-760,-746]){A(BX(1.2,.08,.3),M(0xfff8e0,{emissive:0xfff0c0}),x,H-.05,z)}","for(const z of[-760,-746]){try{penCeilLamp(g,x==-448&&z==-760?-450:x,z)}catch(e){}}")
# the workshop: the model's shed (the walls' obstacles stay), the corner piers' obstacles, the sign up to 2.75
t=rep(t,"W(-366,-358,-765,-764.7,3,CON2);W(-366,-358,-755.3,-755,3,CON2);W(-358.3,-358,-765,-755,3,CON2);A(BX(8.4,.2,10.4),M(0x5a3a22),-362,3.1,-760);A(BX(1,.6,.5),M(0xc02020),-359.5,.9,-760);A(BX(1.4,.9,.8),M(0x6a4a2a),-359.6,.45,-760);",
 "W(-366,-358,-765,-764.7,3,null);W(-366,-358,-755.3,-755,3,null);W(-358.3,-358,-765,-755,3,null);W(-366.2,-365.85,-765,-763.8,3,null);W(-366.2,-365.85,-756.2,-755,3,null);try{penWorkshop(g)}catch(e){conLog('error','pen workshop: '+e.message)}")
t=rep(t,"-366.1,2.6,-760,-Math.PI/2,60);","-366.1,2.75,-760,-Math.PI/2,60);")
# the yard: the basketball court and the floodlight masts from the model (with the glows on their lamps)
t=rep(t,"A(BX(14,.03,9),M(0x7a5a4a),-470,.04,-845);for(const s of[-1,1]){A(new THREE.CylinderGeometry(.08,.08,3.4,6),POSTC(),-470+s*6.5,1.7,-845);}for(let i=0;i<6;i++){const x=PENF.x0+20+i*32;A(new THREE.CylinderGeometry(.12,.15,9,6),M(0x7a7e84,{metalness:.6}),x,4.5,PENF.z0+12);A(BX(1.4,.5,.5),M(0x2a2a2a),x,9,PENF.z0+12)}",
 "try{penCourt(g)}catch(e){conLog('error','pen court: '+e.message)}for(let i=0;i<6;i++){const x=PENF.x0+20+i*32,z=PENF.z0+12;try{penFloodMast(g,x,z)}catch(e){}for(const s of[-1,1]){const gl=glowSp(0xfff4c8,.7,2);gl.position.set(x+s*.6,9.25,z+.49);g.add(gl)}}")
# the new yard and courtyard things (static), each with its footprint as an obstacle
t=rep(t,"function POSTC(){","penNewYard(q,g);\n function POSTC(){")
PARTS.append(t)

# ======================= penPolish: your cell, the laundry, the cameras, the fans =======================
t=tame(fn('penPolish'))
t=rep(t,"A(BX(1.2,1.55,.3),IWc,-450,1.05+1.55/2,-787);","PENOFF=1;A(BX(1.2,1.55,.3),IWc,-450,1.05+1.55/2,-787);")
t=rep(t,"const g2=A(BX(1.2,.06,.9),ST,-451.2,.05,-786.2);g2.rotation.y=.4;g2.visible=false;W.grate2=g2}","PENOFF=0;W.grate2=W.grate2M||null}")
t=rep(t,"{const gm=W.grateM;if(gm){","{const gm=null;if(gm){")
t=rep(t,"A(BX(.45,.12,.35),M(0xe8e8ec,{metalness:.3}),-448.35,.85,-785.3);","PENOFF=1;A(BX(.45,.12,.35),M(0xe8e8ec,{metalness:.3}),-448.35,.85,-785.3);")
t=rep(t,"dLabel(PG_(g),'D-4',.5,.22,'#20242a','#e8e0c8',-450,2.95,-780.88,0,60);","")
# the laundry: penLaundry builds it all; the game's drums, LEDs and jumpsuits become the model's
t=rep(t,"A(BX(.3,1.55,1.3),IWc,-424,1.05+1.55/2,-798.05);","A(BX(.3,1.55,1.3),IWc,-424,1.05+1.55/2,-798.05);let LAU=null;PENOFF=0;try{LAU=penLaundry(g)}catch(e){conLog('error','pen laundry: '+e.message)}PENOFF=1;")
t=rep(t,"drums.push({dr,sp:i%3==1?0:2.5+i})","drums.push({dr:LAU&&LAU.drums[i]?LAU.drums[i]:dr,sp:i%3==1?0:2.5+i})")
t=rep(t,"const led=glowSp(i%3==1?0xff3030:0x40ff60,.8,.18);led.position.set(-412.17,1.26,z-.25);PG_(g).add(led)}","}")
t=rep(t,"q.anims.push({x:-417,z:-793,r:30,f:dt=>{for(const d of drums)d.dr.rotation.x+=dt*d.sp}});","PENOFF=0;q.anims.push({x:-417,z:-793,r:30,f:dt=>{for(const d of drums)d.dr.rotation.x+=dt*d.sp}});PENOFF=1;")
t=rep(t,"const js=[];for(let k=0;k<5;k++){","const js=LAU&&LAU.suits?LAU.suits:[];if(!LAU)for(let k=0;k<5;k++){")
t=rep(t,"q.anims.push({x:-417,z:-793,r:30,f:dt=>{js.forEach((j,i)=>j.rotation.x=Math.sin(q.rt*1.3+i)*.08)}})}","PENOFF=0;q.anims.push({x:-417,z:-793,r:30,f:dt=>{js.forEach((j,i)=>j.rotation.x=Math.sin(q.rt*1.3+i)*.08)}});PENOFF=1}")
t=rep(t,"for(const z of[-797,-792,-789])A(new THREE.CylinderGeometry(.08,.08,13.4,10)","PENOFF=0;for(const z of[-797,-792,-789])A(new THREE.CylinderGeometry(.08,.08,13.72,10)")
t=rep(t,"'#e8e0c8','#a04010',-419.5,2.2,-799.84,0,54);","'#e8e0c8','#a04010',-419.5,2.2,-799.82,0,54);")
# the cameras: the model's camera at the game's spot (its plate on the ceiling)
t=rep(t,"const cm=new THREE.Group();cm.position.set(x,y,z);cm.rotation.copy(old.rotation);PG_(g).add(cm);","const PC=penCamera();PC.cam.position.set(x,y,z);PC.cam.rotation.copy(old.rotation);PC.cam.userData.dpKeep=1;g.add(PC.cam);const cm=new THREE.Group();PENOFF=1;")
t=rep(t,"C2.led=ld;C2.m=cm;","C2.led=PC.led;C2.m=PC.cam;")
t=rep(t,"A(new THREE.CylinderGeometry(.12,.12,.03,12),M(0x5a5a60,{metalness:.6}),x,y+.57,z);","A(new THREE.CylinderGeometry(.12,.12,.03,12),M(0x5a5a60,{metalness:.6}),x,y+.57,z);PENOFF=0;")
t=rep(t,"for(const F of W.fans){const r=new THREE.Mesh(","for(const F of[]){const r=new THREE.Mesh(")
PARTS.append(t)

# ======================= penPolish2: the control room, the hiding spots, outside the fence =======================
t=tame(fn('penPolish2'))
t=rep(t,"{const DX=-447.2;A(BX(1,.88,8)","let CR=null,OUT=null;try{CR=penControlRoom(g)}catch(e){conLog('error','pen control room: '+e.message)}try{OUT=penOutside(g)}catch(e){conLog('error','pen outside: '+e.message)}\n {const DX=-447.2;PENOFF=1;A(BX(1,.88,8)")
t=rep(t,"PG_(g).add(sp);scr.push(sp)}","PG_(g).add(sp);scr.push(sp);if(CR&&CR.screens&&CR.screens[i]){CR.screens[i].material=new THREE.MeshBasicMaterial({map:sp.material.map});sp.visible=false;scr[i]=CR.screens[i]}}")
t=rep(t,"A(BX(.05,.7,.7),M(0x3a3e44,{metalness:.5}),-446.69,1.1,z);","")
t=rep(t,"for(const[sw,z,lb,c]of[","PENOFF=0;for(const[sw,z,lb,c]of[")
t=rep(t,"Math.PI/2,64)}","Math.PI/2,64)}PENOFF=1;")
t=rep(t,"mp.position.set(-447.86,2.2,-753);","mp.position.set(-447.80,2.2,-753);")
t=rep(t,"PG_(g).add(mp);","PENOFF=0;g.add(mp);PENOFF=1;")
t=rep(t,"A(BX(.1,.55,.5),M(0x1a1a1a),-445.6,.8,-761)}","A(BX(.1,.55,.5),M(0x1a1a1a),-445.6,.8,-761);PENOFF=0}")
# the hiding spots' furniture from the model (same spots, same obstacles)
t=rep(t,"for(let k=-1;k<=1;k++){A(BX(.55,2,.6),M(k?0x4a6a5a:0x3a5a4a,{metalness:.5,roughness:.5}),-452.45,1,-762+k*.62);for(let s=0;s<4;s++)A(BX(.02,.03,.36),M(0x1a1a1a),-452.73,1.6+s*.06,-762+k*.62)}","try{penStaffLockers(g)}catch(e){}")
t=rep(t,"A(BX(.7,2.2,1.1),M(0x6a5a48),-410.5,1.1,-752);A(BX(.02,2,.9),M(0x5a4a38),-410.86,1.05,-752);A(new THREE.SphereGeometry(.04,6,6),ST,-410.88,1.1,-751.7);","try{penBroomCupboard(g)}catch(e){}")
t=rep(t,"A(BX(w,1.3,d),M(0x2a5a3a,{metalness:.4,roughness:.6}),x,.68,z);A(BX(w+.1,.08,d+.1),M(0x1a3a24),x,1.37,z);for(const s of[-1,1])A(new THREE.CylinderGeometry(.08,.08,.05,8),M(0x1a1a1a),x+(along=='x'?s*.9:0),.08,z+(along=='x'?0:s*.9));",
 "{const dm=penDumpster(along);dm.position.set(x,0,z);if(along=='z')dm.rotation.y=Math.PI/2;g.add(dm)}")
t=rep(t,"for(const[a,b,s]of[[0,0,1.2],[1.25,.1,1.1],[.6,0,1.0]]){A(BX(s,s,s),M(0x8a6a40),x+a-.6,s/2+(a==.6?1.2:0),z+b)}A(BX(1.3,.02,1.3),M(0x5a4a30),x,1.21,z);",
 "{const cs=penCrateStack();cs.position.set(x,0,z);g.add(cs)}")
# outside: penOutside builds the bus, car park (moved east), barriers, spikes, flagpole, kennels, water tower, generator, bunker, jeep, lamps
t=rep(t,"{const BUS=new THREE.Group();","PENOFF=1;{const BUS=new THREE.Group();")
t=rep(t,"car(-421.4,0x2a3a6a);car(-415,0xa02020);car(-402.2,0x5a5a5a);","car(-407.4,0x2a3a6a);car(-401,0xa02020);car(-388.2,0x5a5a5a);")
t=rep(t,"dLabel(PG_(g),'STAFF PARKING ONLY',3,.5,'#203050','#ffffff',-410,1.3,-865.9,Math.PI,60);A(new THREE.CylinderGeometry(.05,.05,1.3,6),ST,-410,.65,-866)}","PENOFF=0;dLabel(g,'STAFF PARKING ONLY',3,.5,'#203050','#ffffff',-396,1.3,-865.9,Math.PI,60);try{penSignPost(g,-396,-865.9,Math.PI,3)}catch(e){}PENOFF=1}")
t=rep(t,"const fl=new THREE.Mesh(new THREE.PlaneGeometry(2.2,1.4,8,1),","PENOFF=0;const fl=new THREE.Mesh(new THREE.PlaneGeometry(2.2,1.4,8,1),")
t=rep(t,"fp.needsUpdate=true}})}","fp.needsUpdate=true}})}PENOFF=1;")
t=rep(t,"dLabel(PG_(g),'STOP · ALL VEHICLES ARE SEARCHED',3.4,.7,'#a01818','#ffffff',-447,1.8,-878,Math.PI,56);","dLabel(g,'STOP · ALL VEHICLES ARE SEARCHED',3.4,.7,'#a01818','#ffffff',-447,1.8,-878,Math.PI,56);")
t=rep(t,"const dogs=[];for(const[dx,dz]of[[1,-2],[1.6,2]]){","const dogs=OUT&&OUT.dogs&&OUT.dogs.length?OUT.dogs:[];if(!dogs.length)for(const[dx,dz]of[[1,-2],[1.6,2]]){")
t=rep(t,"dLabel(PG_(g),'K-9 UNIT · DO NOT FEED'","PENOFF=0;dLabel(g,'K-9 UNIT · DO NOT FEED'")
t=rep(t,"setTimeout(()=>snd(280,.1),120)}}})}","setTimeout(()=>snd(280,.1),120)}}})}PENOFF=1;")
t=rep(t,"q.anims.push({x:sx,z:sz,r:14,f:dt=>{if(Math.random()<dt*2)snd(55,.25)}})}","PENOFF=0;q.anims.push({x:sx,z:sz,r:14,f:dt=>{if(Math.random()<dt*2)snd(55,.25)}});PENOFF=1}")
t=rep(t,"for(const[x,z,ry]of signs)dLabel(PG_(g),'⚡ DANGER\\nKEEP OUT',.9,.6,'#e8c020','#1a1a1a',x,1.7,z,ry,64);","PENOFF=0;for(const[x,z,ry]of signs){dLabel(g,'⚡ DANGER\\nKEEP OUT',.9,.6,'#e8c020','#1a1a1a',x,1.7,z,ry,64);try{penSignPost(g,x,z,ry)}catch(e){}}")
t=rep(t,"for(let x=PENF.x0-4;x<=PENF.x1+4;x+=33)for(const z of[PENF.z0-5,PENF.z1+5]){if(Math.abs(x+440)<8&&z<PENF.z0)continue;A(new THREE.CylinderGeometry(.08,.1,5,6),M(0x6a6e74,{metalness:.5}),x,2.5,z);const l=glowSp(0xfff0c0,.7,1.6);l.position.set(x,5.1,z);PG_(g).add(l)}",
 "for(const p of(OUT&&OUT.lamps)||[]){const l=glowSp(0xfff0c0,.7,1.6);l.position.set(p[0],p[1],p[2]);g.add(l)}")
t=rep(t,"p.position.set(-366.12,1.6,-762);","p.scale.set(.5,.625,1);p.position.set(-366.012,1.6,-764.25);")
t=rep(t,"hide('supply crates',-515,-770,-513.3,-770,()=>crates(-515,-770));","hide('supply crates',-511.5,-768,-509.8,-768,()=>crates(-511.5,-768));")
PARTS.append(t)

# ======================= penPolish3: the meal hatch, corridor A, the hall =======================
t=tame(fn('penPolish3'))
t=rep(t,"{const hx=-450,hz=-781;A(BX(.78,.42,.12),ST,hx,.98,hz);A(BX(.56,.14,.14),DK,hx,.98,hz);A(BX(.6,.04,.32),ST,hx,.84,hz-.2);","{const hx=-450,hz=-781;")
t=rep(t,"const fl=new THREE.Group();fl.position.set(hx,.91,hz+.08);PG_(g).add(fl);const fp=new THREE.Mesh(BX(.58,.16,.03),M(0x8a9098,{metalness:.7}));fp.position.y=.08;fl.add(fp);const hd=new THREE.Mesh(BX(.12,.03,.04),DK);hd.position.set(0,.13,.025);fl.add(hd);",
 "const fl=W.flap||new THREE.Group();")
t=rep(t,"for(let x=-468,n=1;x<-424;x+=4,n++){dLabel(PG_(g),'D-'+n,.55,.24,n==5?'#5a2020':'#20242a','#e8e0c8',x+2,3.05,-780.86,0,60);A(new THREE.CylinderGeometry(.06,.06,.04,8),new THREE.MeshBasicMaterial({color:0x40ff60}),x+3.3,2.6,-780.92).rotation.x=Math.PI/2}","")
t=rep(t,"for(let x=-464;x<-412;x+=8){for(let k=-2;k<=2;k++)A(BX(.02,.2,.4),ST,x+k*.28,4.38,-778.5);A(BX(1.3,.02,.42),ST,x,4.28,-778.5)}","try{const CA=penCorridorA(g);W.deskScreen=CA.screen}catch(e){conLog('error','pen corridor: '+e.message)}")
t=rep(t,"[[-468,-778.5,1,0],","[[-470,-778.5,1,0],")
t=rep(t,"{const x=-411.1,z=-776.9;A(BX(1.6,.85,.9)","{const x=-411.1,z=-776.9;PENOFF=1;A(BX(1.6,.85,.9)")
t=rep(t,"A(BX(.06,.06,.7),ST,-410.15,1.82,-775.4)}","A(BX(.06,.06,.7),ST,-410.15,1.82,-775.4);PENOFF=0}")
t=rep(t,"-447.88,2.2,-768,Math.PI/2,52);","-448.18,2.2,-768,-Math.PI/2,52);")
t=rep(t,"for(let k=0;k<5;k++){A(BX(.55,2,.5),M(k%2?0x4a5a6a:0x3e4e5e,{metalness:.5}),-424.6-k*.6,1,-741.3);for(let s=0;s<4;s++)A(BX(.36,.02,.02),DK,-424.6-k*.6,1.6+s*.06,-741.56)}ob(-427.4,-424.3,-741.6,-741);",
 "try{penHall(g)}catch(e){conLog('error','pen hall: '+e.message)}ob(-427.35,-424.25,-740.7,-740.15);")
t=rep(t,"A(BX(2.4,.08,.45),M(0x7a5a3a),-433,.48,-741.4);for(const s of[-1,1])A(BX(.08,.45,.4),ST,-433+s*1.1,.23,-741.4);ob(-434.2,-431.8,-741.65,-741.15);","ob(-434.2,-431.8,-740.61,-740.15);")
PARTS.append(t)

# ======================= penPolish4: the duct's laundry end is open in the model =======================
t=tame(fn('penPolish4'))
t=rep(t,"if(D){const ex=D.x1","if(D&&0){const ex=D.x1")
PARTS.append(t)

# ======================= penBreak: the break room comes from the model (penBreakRoom); the vending machine prop moves to the new machine =======================
t=tame(fn('penBreak'))
t=rep(t,"ob=(x0,x1,z0,z1)=>q.obs.push({x0,x1,z0,z1,pen:1});","ob=(x0,x1,z0,z1)=>PENOFF?0:q.obs.push({x0,x1,z0,z1,pen:1});PENOFF=1;")
t=rep(t,"const vx=-469.35,vz=-760;","const vx=-452.55-1.1,vz=-756.6-.0;")
t=rep(t,"ob(vx-.45,vx+.45,vz-.5,vz+.5);","")
t=rep(t,"q.props.push({x:vx+1,z:vz,","q.props.push({x:vx,z:vz,")
PARTS.append(t[:-1]+";PENOFF=0;try{const BR=penBreakRoom(g);q.penW.tvScreen=BR.screen}catch(e){conLog('error','pen break room: '+e.message)}\n for(const b of[[-469.85,-464.55,-756.8,-756.15],[-464.2,-463.5,-756.85,-756.15],[-452.95,-452.15,-757.05,-756.15],[-456.3,-454.7,-771.5,-769.5],[-467.3,-466.7,-768.5,-767.5],[-460.4,-459.5,-768.5,-767.5]])ob(...b)}")

# ======================= penYard: the courtyard's things remodelled in place (penYardGame) =======================
t=tame(fn('penYard'))
t=rep(t,"const paint=(w,d,x,z,c,ry)=>{","let YG={};try{YG=penYardGame(g)||{};if(q.penW)q.penW.YG=YG}catch(e){conLog('error','pen yard game: '+e.message)}const paint=(w,d,x,z,c,ry)=>{")
t=rep(t,"if(free(x0,x1,z0,z1)){const fc=","if(free(x0,x1,z0,z1)){PENOFF=1;const fc=")
t=rep(t,"const bag=A(new THREE.CylinderGeometry(.28,.28,1.1,12),M(0x8a2a1a),-486,2.05,-788);","const bag=YG.bag||A(new THREE.CylinderGeometry(.28,.28,1.1,12),M(0x8a2a1a),-486,2.05,-788);PENOFF=0;")
t=rep(t,"dLabel(PG_(g),'EXERCISE YARD\\n1 HOUR PER DAY'","dLabel(g,'EXERCISE YARD\\n1 HOUR PER DAY'")
t=rep(t,"if(free(cx-9,cx+9,cz-7,cz+7)){paint(16,12,cx,cz,0x7a5a4a);","if(free(cx-9,cx+9,cz-7,cz+7)){PENOFF=1;paint(16,12,cx,cz,0x7a5a4a);")
t=rep(t,"const ball=A(new THREE.SphereGeometry(.12,12,10)","PENOFF=0;const ball=A(new THREE.SphereGeometry(.12,12,10)")
t=rep(t,"for(const[x,z]of[[-490,-722],[-482,-713],[-490,-708],[-470,-724]]){if(!free(x-1.5,x+1.5,z-1.2,z+1.2))continue;A(BX(2.6,.08,.9),M(0x8a8a90,{metalness:.4}),x,.78,z);for(const s of[-1,1]){A(BX(2.6,.06,.32),M(0x8a8a90),x,.45,z+s*.75);A(BX(.08,.78,1.9),ST,x+s*1.1,.39,z)}ob(x-1.3,x+1.3,z-.95,z+.95)}",
 "for(const[x,z]of[[-490,-722],[-480,-722],[-490,-713],[-480,-713]])ob(x-1.3,x+1.3,z-.95,z+.95);")
t=rep(t,"A(BX(2,.6,1),M(0x9a9a92),x,.3,z);A(BX(1.8,.05,.8),M(0x5a4030),x,.58,z);for(let k=0;k<3;k++){const b=A(new THREE.IcosahedronGeometry(.32,0),M(0x6a7a48,{roughness:1,flatShading:true}),x-.6+k*.6,.78,z);b.scale.y=.8}","")
t=rep(t,"A(BX(2.4,2.6,2.4),M(0xc8c4bc),bx,1.3,bz);A(BX(2.7,.2,2.7),DK,bx,2.7,bz);for(const s of[-1,1])A(BX(1.6,.9,.03),new THREE.MeshStandardMaterial({color:0x203040,emissive:0x081018}),bx,1.7,bz+s*1.21);A(BX(.03,.9,1.6),new THREE.MeshStandardMaterial({color:0x203040,emissive:0x081018}),bx+1.21,1.7,bz);const lt=glowSp(0xffe0a0,.6,1.2);lt.position.set(bx,2.4,bz);PG_(g).add(lt);dLabel(PG_(g),'GATE CONTROL',1.6,.3,'#20242a','#e8e0c8',bx+1.22,2.35,bz,Math.PI/2,56);",
 "const lt=glowSp(0xffe0a0,.6,1.2);lt.position.set(bx,2.0,bz);g.add(lt);")
t=rep(t,"A(BX(2,1.4,2),M(0xb8bcc0,{metalness:.4}),x,.7,z);const f=A(new THREE.CylinderGeometry(.7,.7,.05,16),DK,x,1.43,z);const bl=A(BX(1.3,.03,.18),M(0x5a5a60),x,1.47,z);",
 "const bl=(YG.fans&&YG.fans[[-790,-782,-774].indexOf(z)])||new THREE.Object3D();")
t=rep(t,"A(new THREE.CylinderGeometry(1.2,1.2,3,16),M(0x7a8a6a,{metalness:.3}),x,1.5,z);A(new THREE.CylinderGeometry(1.25,1.25,.15,16),DK,x,3.05,z);","")
t=rep(t,"A(new THREE.CylinderGeometry(.1,.12,6,8),ST,x,3,z);A(BX(.8,.3,.4),DK,x,6,z);const l=glowSp(0xfff4d0,.6,2);l.position.set(x,5.8,z);","const l=glowSp(0xfff4d0,.6,2);l.position.set(x,5.75,z);")
t=rep(t,"A(BX(2.4,.08,.5),M(0x7a5a3a),x,.48,z);for(const s of[-1,1])A(BX(.1,.48,.45),ST,x+s*1.05,.24,z);","")
t=rep(t,"-440,2.4,-700.75,Math.PI,52);","-440,2.4,-700.38,Math.PI,52);")
PARTS.append(t)

# ======================= penSecure: the catwalk, the sally port, the cage wire from the model =======================
t=tame(fn('penSecure'))
t=rep(t,"const z=-701.6,y=4.6,x0=-492,x1=-388;A(BX(x1-x0,.15,1.6),ST,(x0+x1)/2,y,z);for(let x=x0;x<=x1;x+=1.6)A(BX(.05,1,.05),ST,x,y+.55,z-.78);A(BX(x1-x0,.05,.05),ST,(x0+x1)/2,y+1.05,z-.78);A(BX(x1-x0,.05,.05),ST,(x0+x1)/2,y+.55,z-.78);for(let x=x0+2;x<x1;x+=8){A(BX(.15,y,.15),ST,x,y/2,z-.7)}",
 "const z=-701.6,y=4.6,x0=-492,x1=-388;q.obs.push({x0:-388,x1:-381.5,z0:-702.5,z1:-701.3,pen:1});")
t=rep(t,"T('sally port',()=>{const x=-415","T('sally port',()=>{const YGS=q.penW&&q.penW.YG&&q.penW.YG.sally;const x=-415")
t=rep(t,"const x=-415,z=-738.6;for(const s of[-1,1])A(BX(.25,2.4,.4),M(0xd8d8d0),x+s*.85,1.2,z);A(BX(1.95,.3,.4),M(0xd8d8d0),x,2.55,z);const lt=A(BX(.6,.08,.08),M(0x203020,{emissive:0x20c040}),x,2.45,z+.21);",
 "const x=-415,z=-738.6;const lt=(YGS&&YGS.light)?{material:YGS.light.material||YGS.light}:A(BX(.6,.08,.08),M(0x203020,{emissive:0x20c040}),x,2.45,z+.21);")
t=rep(t,"for(const s of[-1,1])A(BX(.05,2.6,3.2),M(0x8a9098,{metalness:.6,transparent:true,opacity:.55}),x+s*1.6,1.3,z+1.8);A(BX(3.25,.06,3.2),ST,x,2.65,z+1.8);dLabel(PG_(g),'SALLY PORT · ONE AT A TIME · ARMS OUT',2.6,.35,'#2a2a2e','#e8c020',x,2.95,z+.22,0,44);q.obs.push({x0:x-1.65,x1:x-1.55,z0:z+.2,z1:z+3.4,pen:1});q.obs.push({x0:x+1.55,x1:x+1.65,z0:z+.2,z1:z+3.4,pen:1})",
 "q.obs.push({x0:x-1.65,x1:x-1.55,z0:-739.85,z1:z+3.4,pen:1});q.obs.push({x0:x+1.55,x1:x+1.65,z0:-739.85,z1:z+3.4,pen:1})")
t=rep(t,"T('cage wire',()=>{for(const[ax,c,a0,a1]of","T('cage wire',()=>{for(const[ax,c,a0,a1]of[]||")
t=rep(t,"-440,5.9,-700.9,Math.PI,40)","-440,5.9,-700.38,Math.PI,40)")
PARTS.append(t)

# ======================= penMess: its strip lights are the model's caged lamps; the outside from the model =======================
t=tame(fn('penMess'))
t=rep(t,"const x=X0+4+i*6.6;A(BX(1.5,.1,.35),M(0xfff8e0,{emissive:0xfff0c0}),x,H-.07,z);for(let k=-3;k<=3;k++)A(BX(.02,.14,.4),DK,x+k*.22,H-.12,z);A(BX(1.56,.02,.02),DK,x,H-.19,z-.2);A(BX(1.56,.02,.02),DK,x,H-.19,z+.2)}",
 "const x=X0+4+i*6.6;try{penCeilLamp(g,x,z)}catch(e){}}try{penMessOutside(g)}catch(e){conLog('error','pen mess outside: '+e.message)}")
t=rep(t,"dLabel(PG_(g),'INMATE PHONE · ALL CALLS MONITORED · 5 MIN',1.4,.4,'#e8e0c8','#202020',-444,2.0,","dLabel(PG_(g),'INMATE PHONE · ALL CALLS MONITORED · 5 MIN',1.4,.4,'#e8e0c8','#202020',-444,2.35,")
PARTS.append(t)

# ======================= penActBuild: the folding table is the model's (the sheet pile stays) =======================
t=tame(fn('penActBuild'))
t=rep(t,"const top=new THREE.Mesh(new THREE.BoxGeometry(1.8,.06,.8),T);top.position.set(tx,.86,tz);PG_(g).add(top);for(const[a,b]of[[-.8,-.3],[.8,-.3],[-.8,.3],[.8,.3]]){const l=new THREE.Mesh(new THREE.BoxGeometry(.05,.84,.05),T);l.position.set(tx+a,.42,tz+b);PG_(g).add(l)}","")
PARTS.append(t)

# ======================= dpPen (batch 6): the game's yard extras remodelled in place, its four duplicates removed =======================
t=tame(fn('dpPen'))
t=rep(t,"const K=kit(q,g),","const K=kit(q,{add:(...a)=>PG_(g).add(...a)}),")
t=rep(t,"const rnd=mul32(1301);","const rnd=mul32(1301);let YD={};try{YD=penYardDp(g)||{}}catch(e){conLog('error','pen yard dp: '+e.message)}PENOFF=1;")
t=rep(t,"const lap=[[x0+w/2,z0+w/2+2],[x1-w/2,z0+w/2+2],[x1-w/2,z1-w/2-2],[x0+w/2,z1-w/2-2]];","const lap=YD.lap||[[x0+w/2,z0+w/2+2],[x1-w/2,z0+w/2+2],[x1-w/2,z1-w/2-2],[x0+w/2,z1-w/2-2]];")
t=rep(t,"for(const[x,z,ry]of[[x0-2.5,z0+w+14,Math.PI/2],[x1+2.5,z1-w-14,-Math.PI/2]]){","for(const[x,z,ry]of[[-502.2,-820,Math.PI/2],[-377.8,-710,-Math.PI/2]]){")
# the duplicates: no obstacles; their props move to batch 1's bus and kennels; the visitor parking sign goes on batch 1's car park
t=rep(t,"ob(-500.6+i*3.2,-498.2+i*3.2,-874.5,-869.5,{pen:1,kd:'car'})","")
t=rep(t,"ob(-425.4,-422.6,-877.2,-866.8,{pen:1});","")
t=rep(t,"PR(-422,-866,2,","PR(-472,-868.3,2,")
t=rep(t,"sign('VISITOR PARKING · 2 HOURS MAX\\nWE ARE WATCHING · WE ARE ALWAYS WATCHING','#1a2a6a',-504,-864,.4,'#ffffff');","PENOFF=0;sign('VISITOR PARKING · 2 HOURS MAX\\nWE ARE WATCHING · WE ARE ALWAYS WATCHING','#1a2a6a',-384,-864.5,.4,'#ffffff');PENOFF=1;")
t=rep(t,"ob(-456.3,-455.7,-856.3,-855.7,{pen:1});","")
t=rep(t,"sign('VISITORS: NONE · DELIVERIES: REAR","PENOFF=0;sign('VISITORS: NONE · DELIVERIES: REAR")
t=rep(t,"-432,-856,-.3,'#ffd040');","-432,-856,-.3,'#ffd040');PENOFF=1;")
t=rep(t,"ob(kx0-.1,kx1+.1,kz0-.1,kz0+.1,{pen:1});ob(kx0-.1,kx1+.1,kz1-.1,kz1+.1,{pen:1});ob(kx0-.1,kx0+.1,kz0,kz1,{pen:1});ob(kx1-.1,kx1+.1,kz0,kz1,{pen:1});","")
t=rep(t,"ob(x-.8,x+.8,z-.65,z+.65,{pen:1});lab('K-9 '+(i+1)","lab('K-9 '+(i+1)")
t=rep(t,"anim((kx0+kx1)/2,(kz0+kz1)/2,110,dt=>{","anim(1e6,1e6,1,dt=>{")
t=rep(t,"PR((kx0+kx1)/2,kz1+1.5,5,","PR(-550.5,-760,3,")
# kept things that must stay visible
t=rep(t,"gs.rotation.y=Math.PI;PG_(g).add(gs);","gs.rotation.y=Math.PI;g.add(gs);")
t=rep(t,"s.userData.ph=i*1.5;PG_(g).add(s);","s.userData.ph=i*1.5;g.add(s);")
t=rep(t,"light(0xffb060,1.1,9,","PENOFF=0;light(0xffb060,1.1,9,")
t=rep(t,"const win=A(BX(3,2,.06)","PENOFF=1;const win=A(BX(3,2,.06)")
t=rep(t,"ch.position.set((x0+x1)/2,.75,z0+2.8);PG_(g).add(ch);","ch.position.set((x0+x1)/2,.75,z0+2.8);g.add(ch);")
t=rep(t,"c.position.set(cx0+20,0,cz0+6);c.rotation.y=Math.PI/2;PG_(g).add(c);","c.position.set(cx0+20,0,cz0+6);c.rotation.y=Math.PI/2;g.add(c);")
t=rep(t,"light(0xffc080,.9,7,","PENOFF=0;light(0xffc080,.9,7,")
t=rep(t,"for(const[dx,dz]of[[2.2,-3.2],[3.6,-2.6]]){","PENOFF=1;for(const[dx,dz]of[[2.2,-3.2],[3.6,-2.6]]){")
t=rep(t,"off.rotation.y=-Math.PI/4;PG_(g).add(off);","off.rotation.y=-Math.PI/4;g.add(off);")
t=rep(t,"const ball=A(new THREE.SphereGeometry(.09,8,6),M(0x2060e0),hx,1.2,hz+2);","PENOFF=0;const ball=A(new THREE.SphereGeometry(.09,8,6),M(0x2060e0),hx,1.2,hz+2);PENOFF=1;")
t=rep(t,"const pb=A(new THREE.SphereGeometry(.03,6,5),M(0xffffff),px,1,pz);","PENOFF=0;const pb=A(new THREE.SphereGeometry(.03,6,5),M(0xffffff),px,1,pz);PENOFF=1;")
# moves: the generator shed, the garden, the mural, the phone bank
t=rep(t,"const x0=-372.5,x1=-364,z0=-804,z1=-797;const w=bld(x0,x1,z0,z1,2.8,'s',-369.3,-367.3,","const x0=-369,x1=-360.5,z0=-804,z1=-797;const w=bld(x0,x1,z0,z1,2.8,'s',-365.8,-363.8,")
t=rep(t,"anim(x1,z0+3.5,70,dt=>{bl.rotation.x+=dt*9});","anim(x1,z0+3.5,70,dt=>{(YD.genFan||bl).rotation.x+=dt*9});")
t=rep(t,"const gx=-520,gz=-696;","const gx=-533,gz=-696;")
t=rep(t,"const m=A(new THREE.PlaneGeometry(10,3.1),new THREE.MeshBasicMaterial({map:t}),PENI.x1-.42,3.2,-790);","PENOFF=0;const m=A(new THREE.PlaneGeometry(10,3.1),new THREE.MeshBasicMaterial({map:t}),-380.44,3.2,-794);PENOFF=1;")
t=rep(t,"const bx=-460,bz=PENI.z0+.5;","const bx=-467,bz=PENI.z0+.5;")
t=rep(t,"q.locs.push({nm:'Prison Chapel'","PENOFF=0;q.locs.push({nm:'Prison Chapel'")
# dpPen is a local function inside the r500 block, so it can't be replaced from outside: build.py swaps this text in for it
open(ROOT+'src/dx620dp.js','w').write('/* r628: the game\'s dpPen with the batch 6 models (generated by tools/pen_gen.py; build.py puts it in place of the base dpPen) */\n'+t+'\n')

# ======================= penAnim: the towers' searchlights follow the nearest outer light circle =======================
t=fn('penAnim')
t=rep(t,"for(const C of W.cams){","for(const T of W.towers||[]){let best=null,bd=1e9;for(const L of W.lights){if(L.inner)continue;const d=Math.hypot(L.x-T.x,L.z-T.z);if(d<bd){bd=d;best=L}}if(best)try{T.aim(best.x,0,best.z)}catch(e){}}\n for(const C of W.cams){")
PARTS.append(t)

HEAD='''/* =====================================================================================================
   r627: THE DARK PENITENTIARY REWORK (docs/design/penitentiary.md, batches 1-5). The design chat's pen.js is copied
   below (its penBasket is renamed penBasketM: the game already has a penBasket, the laundry basket rummage), then the
   game's own builders (penBuild, penPolish 1-4, penBreak, penYard, penSecure, penMess, penActBuild, penAnim) are
   redefined with the old meshes switched off and the models put in their place.
   How: while PENOFF is set, PG_(g) hands the old code an empty group that is never shown, so it still makes every
   obstacle, prompt, animation and position exactly as before (every escape spot stays where it is), but none of its
   meshes reach the scene. This file is generated by tools/pen_gen.py from the built game's text.
   ===================================================================================================== */
let PENOFF=0;const PENNULL=new THREE.Group();const PG_=g=>PENOFF?PENNULL:g;
/* a sliding steel door from the model in place of the game's slab (same middle, slides the same way) */
function penDoorSwap(g,D,turn){try{const m=penSteelDoor();m.position.copy(D.m.position);if(turn)m.rotation.y=Math.PI/2;m.userData.dpKeep=1;if(D.m.parent)D.m.parent.remove(D.m);g.add(m);D.m=m;D.x0=m.position.x;D.z0=m.position.z}catch(e){conLog('error','pen door: '+e.message)}}
/* the block's outside skin and its inside paint, and two obstacles the models need. (Batch 6: the re-planned new things, penRecreation dropped; the game's dpPen is remodelled in place in its own redefinition.) */
function penNewYard(q,g){const T=(n,f)=>{try{f()}catch(e){conLog('error','pen '+n+': '+e.message)}},ob=(x0,x1,z0,z1)=>q.obs.push({x0,x1,z0,z1,pen:1});
 T('block outside',()=>penBlockOutside(g));T('block skins',()=>penBlockSkins(g));
 /* batch 6: the re-planned yard (penRecreation is dropped) */T('gardens',()=>penGardens(g));T('services',()=>penServices(g));T('deliveries',()=>penDeliveries(g));T('courtyard',()=>penCourtyard(g));
 for(const b of[[-481,-471,-694,-686],[-368,-356,-732,-722],[-368,-356,-788,-782],[-368,-356,-779,-771],[-526,-514,-844,-838],[-460,-452,-844,-838],[-400,-388,-844,-838],
  [-429,-419,-822,-816],[-417,-410.3,-821,-817],[-409,-405,-821,-817],[-400,-388,-790,-772],[-390.3,-387.7,-719.3,-716.7],[-435,-409,-713.5,-711.5],[-484,-468,-815.3,-810.7]])ob(...b);
 for(const b of[/* the corridor's west nook is closed off from the vent space */[-470,-468,-787.15,-786.85],
  /* the control room: filing cabinets, server racks, the water cooler */[-432.25,-430.65,-750.77,-750.15],[-444.35,-442.25,-771.85,-770.83],[-427.2,-426.8,-771.1,-770.7]])ob(...b);
 q.obsDirty=1}
'''
src=HEAD+'\n'+model+'\n\n/* ======================= the game\'s builders, with the models in ======================= */\n'+'\n'.join(PARTS)+'\n'
open(ROOT+'src/dx620.js','w').write(src)
print('dx620 written',len(src))
