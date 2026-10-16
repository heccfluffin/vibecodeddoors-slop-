/* =====================================================================================================
   r577: THE APC GETS A DRIVER'S COMPARTMENT. Sit in the front left like a real driver: armoured walls, a wide
   armoured-glass viewport, a dashboard with gauges and a screen, the steering wheel, radios, an extinguisher.
   Only you see it, and only while you are driving it.
   ===================================================================================================== */
function apcCockpit(g){const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.75,metalness:.2},o||{})),ck=new THREE.Group();ck.visible=false;g.add(ck);
 const B=(w,h,d,x,y,z,m,rx)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);if(rx)o.rotation.x=rx;ck.add(o);return o};
 const IN=M(0x7c8672,{emissive:0x1c2018}),IN2=M(0x5c6454,{emissive:0x14170f}),DK=M(0x1b1d1c),ST=M(0x7a7e84,{metalness:.7,roughness:.35}),RB=M(0x2a2a2a,{roughness:.9});
 const X0=-1.38,X1=1.38,Z0=-2.95,Z1=-.9,Y0=.85,Y1=2.4,W=X1-X0,D=Z1-Z0,cz=(Z0+Z1)/2,cy=(Y0+Y1)/2,H=Y1-Y0;
 B(W,.06,D,0,Y0,cz,M(0x3a3f38,{roughness:.95}));for(let i=0;i<5;i++)B(W-.1,.012,.05,0,Y0+.035,Z0+.3+i*.4,ST);/* tread plate strips */
 B(W,.06,D,0,Y1,cz,IN2);B(.06,H,D,X0,cy,cz,IN);B(.06,H,D,X1,cy,cz,IN);B(W,H,.06,0,cy,Z1,IN);
 /* the front plate, with the viewport cut in it */const oy0=1.64,oy1=2.22,ox0=-1.3,ox1=.5;B(W,oy0-Y0,.08,0,(Y0+oy0)/2,Z0,IN);B(W,Y1-oy1,.08,0,(oy1+Y1)/2,Z0,IN);B(ox0-X0,oy1-oy0,.08,(X0+ox0)/2,(oy0+oy1)/2,Z0,IN);B(X1-ox1,oy1-oy0,.08,(ox1+X1)/2,(oy0+oy1)/2,Z0,IN);
 const gl=new THREE.Mesh(new THREE.PlaneGeometry(ox1-ox0,oy1-oy0),new THREE.MeshStandardMaterial({color:0x8fb4b0,transparent:true,opacity:.16,roughness:.05,metalness:.4,depthWrite:false}));gl.position.set((ox0+ox1)/2,(oy0+oy1)/2,Z0-.02);ck.add(gl);
 for(const x of[-.7,-.15])B(.05,oy1-oy0,.1,x,(oy0+oy1)/2,Z0,DK);B(ox1-ox0+.08,.05,.12,(ox0+ox1)/2,oy0,Z0+.02,DK);B(ox1-ox0+.08,.05,.12,(ox0+ox1)/2,oy1,Z0+.02,DK);
 /* periscope blocks over the right seat */for(let i=0;i<2;i++){B(.32,.16,.22,.95+i*.3,2.3,Z0+.14,DK);B(.26,.08,.02,.95+i*.3,2.3,Z0+.26,M(0x203028,{emissive:0x0a2018}))}
 /* the dashboard */const dash=B(1.75,.2,.42,-.4,1.52,Z0+.3,M(0x3a403a,{emissive:0x0c0e0c}),-.25);B(1.75,.42,.08,-.4,1.28,Z0+.47,M(0x3a403a,{emissive:0x0c0e0c}));
 const gauge=(x,y,c)=>{const r=new THREE.Mesh(new THREE.CircleGeometry(.065,18),M(0x111111,{emissive:c,emissiveIntensity:.35}));r.position.set(x,y,Z0+.52);ck.add(r);const nd=new THREE.Mesh(new THREE.BoxGeometry(.008,.05,.004),M(0xffffff,{emissive:0xffffff}));nd.position.set(x,y+.015,Z0+.525);nd.rotation.z=(x*7)%1.2-.6;ck.add(nd);const rim=new THREE.Mesh(new THREE.TorusGeometry(.068,.008,6,18),ST);rim.position.set(x,y,Z0+.52);ck.add(rim)};
 gauge(-.95,1.36,0x40ff60);gauge(-.78,1.36,0xffb020);gauge(-.52,1.36,0x40c0ff);gauge(-.35,1.36,0xff4030);
 const scr=new THREE.Mesh(new THREE.PlaneGeometry(.34,.2),new THREE.MeshBasicMaterial({color:0x30ff70}));scr.position.set(.05,1.35,Z0+.52);ck.add(scr);B(.38,.24,.02,.05,1.35,Z0+.512,DK);
 for(let i=0;i<6;i++)B(.04,.03,.02,.3+(i%3)*.06,1.26+(i>>1&1)*.05,Z0+.52,M(0x111111,{emissive:[0xff3030,0x30ff30,0xffc030][i%3]}));
 /* the steering wheel on its column */const col=new THREE.Mesh(new THREE.CylinderGeometry(.035,.045,.5,10),DK);col.position.set(-.65,1.46,Z0+.6);col.rotation.x=-1.0;ck.add(col);
 const wh=new THREE.Group();wh.position.set(-.65,1.58,Z0+.76);wh.rotation.x=-.95;ck.add(wh);const rim=new THREE.Mesh(new THREE.TorusGeometry(.19,.026,8,26),RB);wh.add(rim);for(let k=0;k<3;k++){const sp=new THREE.Mesh(new THREE.BoxGeometry(.19,.03,.02),DK);sp.rotation.z=k*2.094;sp.position.set(Math.cos(k*2.094)*.095,Math.sin(k*2.094)*.095,0);wh.add(sp)}const hub=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.04,12),DK);hub.rotation.x=Math.PI/2;wh.add(hub);
 /* the radio rack, the map, the extinguisher, ammo cans */B(.5,.55,.3,1.05,1.5,Z1-.2,M(0x3a4136));for(let i=0;i<4;i++)B(.06,.04,.01,.88+i*.1,1.62,Z1-.36,M(0x111111,{emissive:i%2?0x30ff40:0xffb020}));B(.4,.08,.01,1.05,1.42,Z1-.36,DK);
 const ex=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,.45,12),M(0xc01818,{roughness:.4}));ex.position.set(-1.15,1.15,Z1-.12);ck.add(ex);B(.06,.06,.06,-1.15,1.42,Z1-.12,DK);
 for(let i=0;i<2;i++)B(.3,.22,.18,.95,Y0+.14+i*.23,Z1-.5,M(0x4a5a2a));
 const mp=new THREE.Mesh(new THREE.PlaneGeometry(.5,.35),M(0xc8b888,{roughness:1}));mp.position.set(X1-.04,1.55,-1.6);mp.rotation.y=-Math.PI/2;ck.add(mp);
 /* a dome light */B(.22,.03,.12,0,Y1-.04,cz,M(0xfff0c0,{emissive:0xfff0c0,emissiveIntensity:.7}));
 return ck}
{const ap0=mkApcModel;mkApcModel=function(){const g=ap0.apply(this,arguments);try{const sl=[];g.children.forEach(o=>{if(o.isMesh&&o.geometry&&o.geometry.parameters&&Math.abs(o.position.y-1.85)<.01&&Math.abs(o.position.z+2.6)<.01)sl.push(o)});g.children.forEach(o=>{const pa=o.isMesh&&o.geometry&&o.geometry.parameters;if(pa&&((pa.width==2.9&&pa.depth==6.8)||(pa.width==2.6&&pa.depth==5.6)))sl.push(o)});g.userData.ck=apcCockpit(g);g.userData.slits=sl}catch(e){conLog('error','APC cockpit: '+e.message)}return g}}
try{VEHK.apc.seats=[[-.65,-1.72,.27]]}catch(e){}
function apcCkTick(q){const me=q&&q.seat&&q.seat.v;for(const v of q.vehs||[]){if(v.k!='apc'||!v.m)continue;const u=v.m.userData;if(!u||!u.ck)continue;const on=me===v;if(u.ck.visible!==on){u.ck.visible=on;for(const s of u.slits||[])s.visible=!on}}}
{const ru1=busRoamUpd;busRoamUpd=function(q,dt){const r=ru1.apply(this,arguments);try{apcCkTick(q)}catch(e){}return r}}
