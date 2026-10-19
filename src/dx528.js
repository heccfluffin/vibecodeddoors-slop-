/* =====================================================================================================
   r528: VISITING THE DARK PENITENTIARY, and BAIL. A visitation block stands outside the front gate. Walk in, pick a
   teammate who is locked up, and you are seated either side of the glass for a minute to talk (chat with /). Or pay their
   bail (it is NOT cheap) and they walk out free.
   ===================================================================================================== */
const PVB={x:-419,z:-872,x0:-424,x1:-414,z0:-876,z1:-868},PVIS={len:60};
function pvBail(t){return Math.max(1500,Math.round(1500+ (t||0)/60*150))}
function pvBuild(q){if(q.pvB)return;q.pvB=1;const g=q.g,M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.85},o||{})),BX=(w,h,d)=>new THREE.BoxGeometry(w,h,d);/* r627: the block itself is the design chat's model (penVisitation); the old meshes below are only built if it fails */let PVM=0;try{if(typeof penVisitation=='function'){penVisitation(g);PVM=1}}catch(e){conLog('error','visitation model: '+e.message)}const A=(geo,m,x,y,z)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);if(!PVM)g.add(o);return o};
 const B=PVB,CW2=M(0x8a8a84),FL=M(0x5a5c58),H=3.2,ob=(x0,x1,z0,z1)=>q.obs.push({x0,x1,z0,z1});
 A(BX(B.x1-B.x0,.06,B.z1-B.z0),FL,B.x,.03,B.z);A(BX(B.x1-B.x0+.4,.3,B.z1-B.z0+.4),M(0x4a4a46),B.x,H+.15,B.z);
 A(BX(B.x1-B.x0,H,.3),CW2,B.x,H/2,B.z0);ob(B.x0,B.x1,B.z0-.15,B.z0+.15);A(BX(B.x1-B.x0,H,.3),CW2,B.x,H/2,B.z1);ob(B.x0,B.x1,B.z1-.15,B.z1+.15);
 A(BX(.3,H,B.z1-B.z0),CW2,B.x1,H/2,B.z);ob(B.x1-.15,B.x1+.15,B.z0,B.z1);
 /* the west wall: a door into the visitors' side only */A(BX(.3,H,1.0),CW2,B.x0,H/2,B.z0+.5);ob(B.x0-.15,B.x0+.15,B.z0,B.z0+1);A(BX(.3,H,4.0),CW2,B.x0,H/2,B.z1-2);ob(B.x0-.15,B.x0+.15,B.z1-4,B.z1);A(BX(.3,.8,2),CW2,B.x0,H-.4,B.z0+2);
 /* the glass and the counter */A(BX(B.x1-B.x0-.3,1.0,.5),M(0x6a6a66),B.x+.15,.5,B.z);ob(B.x0+.15,B.x1,B.z-.3,B.z+.3);const gl=A(BX(B.x1-B.x0-.3,2.2,.06),new THREE.MeshStandardMaterial({color:0xa8c8e0,transparent:true,opacity:.28,metalness:.3,roughness:.05}),B.x+.15,2.1,B.z);
 for(let i=0;i<4;i++){const x=B.x0+1.6+i*2.2;A(BX(.06,2.2,.5),M(0x4a4a46),x+1.1,2.1,B.z);for(const sd of[-1,1]){A(new THREE.CylinderGeometry(.22,.22,.08,12),M(0x2a3a5a),x,.55,B.z+sd*1.0);A(new THREE.CylinderGeometry(.04,.04,.5,6),M(0x2a2a2a),x,.27,B.z+sd*1.0);const ph=A(BX(.12,.25,.08),M(0x1a1a1a),x+.5,1.5,B.z+sd*.3)}}
 const lab=(t,w,h,x,y,z,ry,bg,fg)=>{const c=document.createElement('canvas');c.width=512;c.height=Math.round(512*h/w);const k=c.getContext('2d');k.fillStyle=bg;k.fillRect(0,0,c.width,c.height);k.fillStyle=fg;k.font='bold '+Math.round(c.height*.32)+'px Georgia';k.textAlign='center';k.textBaseline='middle';t.split('\n').forEach((l,i,a)=>k.fillText(l,256,c.height/2+(i-(a.length-1)/2)*c.height*.38));const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c)}));m.position.set(x,y,z);m.rotation.y=ry;g.add(m);return m};
 lab('VISITATION\nTHE DARK PENITENTIARY',3.4,.9,B.x0-.17,H+.9,B.z0+2,-Math.PI/2,'#14181e','#ffd040');lab('VISITS · 60 SECONDS\nBAIL · ASK AT THE GLASS',2.4,.6,B.x0-.17,1.9,-870,-Math.PI/2,'#e8e0c8','#202020');
 q.props.push({x:B.x0+2.2,z:B.z-1.4,r:2,txt:()=>q.pvis?'':'[E] 📞 Visit an inmate / pay bail',act:()=>pvDlg(q)});q.obsDirty=1}
function pvInmates(q){const now=Date.now(),R=q.vnet?q.vnet.rem:{};return Object.keys(R).filter(id=>R[id].pst&&now-R[id].pstT<9000)}
function pvDlg(q){const ids=pvInmates(q),R=q.vnet.rem;if(q.pen&&q.pen.on)return;
 let body='<p>Teammates currently locked up in the Dark Penitentiary.</p>';if(!ids.length)body+='<p style="opacity:.8">Nobody you know is inside right now. (Lucky them.)</p>';
 const btns=[];for(const id of ids){const r=R[id],c=pvBail(r.pst);btns.push(['v:'+id,'📞 Visit <b>'+esc(r.nm||'Player')+'</b> · '+Math.ceil(r.pst/60)+' min left']);btns.push(['b:'+id,'💰 Pay '+esc(r.nm||'Player')+'\'s bail · 🪙 '+c+(gold<c?' (you have '+gold+')':''),gold<c])}
 milDlg(q,'⛓️ VISITATION',body,btns,b=>{const id=b.slice(2),r=R[id];if(!r)return;if(b[0]=='v'){vehNet(q,{k:'pvr',to:id,nm:SV.nm||'Player'});hint('📞 You ask to see '+(r.nm||'them')+'. The guard picks up a phone...')}else{const c=pvBail(r.pst);if(gold<c){hint('💰 Bail is '+c+' gold.');return}gold-=c;try{saveGame();updHud()}catch(e){}vehNet(q,{k:'pbl',to:id,nm:SV.nm||'Player',c});snd(900,.1);hint('💰 You paid '+c+' gold. '+(r.nm||'They')+' will be out in a moment.')}})}
function pvStart(q,role,other){const B=PVB;q.pvis={role,other,t:PVIS.len,px:P.x,pz:P.z};if(role=='in'){try{if(q.pen){q.pen.bunk=0;q.pen.hide=null}}catch(e){}}hint(role=='in'?'📞 VISIT: the guards walk you to the visitation block. 60 seconds. (Chat with /.)':'📞 VISIT: you sit down at the glass. 60 seconds. (Chat with /.)');snd(500,.08)}
function pvEnd(q,why){const v=q.pvis;if(!v)return;q.pvis=null;if(v.role=='in'){if(q.pen&&q.pen.on){try{penToCell(q)}catch(e){}}hint(why||'📞 Time is up. The guards walk you back to your cell.')}else{P.x=PVB.x0-1.5;P.z=PVB.z0+2+q.OZ;hint(why||'📞 Visiting time is over.')}}
function pvPin(q,dt){const v=q.pvis;if(!v)return;v.t-=dt;const B=PVB;if(v.role=='in'){P.x=B.x0+1.6+2.2;P.z=B.z+1.0+q.OZ;P.yaw=0;P.dy=0}else{P.x=B.x0+1.6+2.2;P.z=B.z-1.0+q.OZ;P.yaw=Math.PI;P.dy=0}
 if(v.t<=0||(v.role=='in'&&!(q.pen&&q.pen.on))||(v.role=='out'&&q.vnet&&!(q.vnet.rem[v.other]&&Date.now()-q.vnet.rem[v.other].t<6000)))pvEnd(q)}
function pvNetIn(q,o,id){const R=q.vnet.rem,r=R[id]||{};const nm=fsName(String(o.nm||''))||r.nm||'A teammate';
 if(o.k=='pst'){if(R[id]){R[id].pst=o.on?Math.max(1,+o.tl||1):0;R[id].pstT=Date.now()}return}
 if(o.to!==SV.pid)return;
 if(o.k=='pvr'){if(!(q.pen&&q.pen.on)||q.pvis)return;milDlg(q,'📞 YOU HAVE A VISITOR','<p><b>'+esc(nm)+'</b> is at the visitation block. Go and see them for 60 seconds? (Your sentence keeps counting down.)</p>',[['y','✅ See them'],['n','Not now']],b=>{if(b=='y'&&q.pen&&q.pen.on){vehNet(q,{k:'pva',to:id,nm:SV.nm||'Player'});pvStart(q,'in',id)}else vehNet(q,{k:'pvn',to:id,nm:SV.nm||'Player'})})}
 else if(o.k=='pva'){if(q.pen&&q.pen.on)return;pvStart(q,'out',id)}
 else if(o.k=='pvn'){hint('📞 '+nm+' does not want visitors right now.')}
 else if(o.k=='pbl'){if(!(q.pen&&q.pen.on))return;if(q.pvis)pvEnd(q,' ');try{penRelease(q)}catch(e){}setTimeout(()=>hint('💰 '+nm+' paid your BAIL ('+(o.c|0)+' gold)! You walk out of the Dark Penitentiary a free '+(SV.nm||'player')+'.'),900);snd(660,.15);setTimeout(()=>snd(880,.2),150);try{badge('bailed')}catch(e){}}}
{const dn2=desertNet;desertNet=function(o){try{if(o&&o.t=='dz'&&(o.k=='pst'||o.k=='pvr'||o.k=='pva'||o.k=='pvn'||o.k=='pbl')){const q=BUS.ride,id=String(o.id||'');if(q&&q.vnet&&id&&id!==SV.pid)pvNetIn(q,o,id);return}}catch(e){}return dn2(o)}}
/* while visiting, the prison day pauses for you (no escape, no cell checks), but the sentence still counts down */
{const pt0=penTick;penTick=function(q,dt){if(q&&q.pvis&&q.pen&&q.pen.on){q.pen.t-=dt;if(q.pen.t<=0){q.pvis=null;penRelease(q)}return}return pt0(q,dt)}}
setInterval(()=>{try{const q=BUS.ride;if(!q||!q.roam||!q.vnet)return;if(!q.pvB&&q.g)pvBuild(q);if(!q.pvA){q.pvA=1;q.anims.push(dt=>{try{pvPin(q,dt)}catch(e){}})}
 const on=!!(q.pen&&q.pen.on);if(on||q.pstWas){vehNet(q,{k:'pst',on:on?1:0,tl:on?Math.round(q.pen.t):0});q.pstWas=on}}catch(e){}},2500);
