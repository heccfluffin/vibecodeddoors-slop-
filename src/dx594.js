/* r594: + crossroads in the Seek chase (hotel only). The hall ends in a crossing: left, right and straight ahead. Only one of the three is the
   way on and its door glows blue; the other two are fake doors. */
{const tp0=turnPlan;turnPlan=function(nn,prev,o){
 if(o&&o.sk&&o.CI>=2&&o.CI<=7&&!o.MINE&&!o.first&&prev&&!(prev.dd&&prev.dd.side)&&!HUB.on&&!(typeof DAILY!='undefined'&&DAILY.on)&&o.HX<=7&&o.L>=20){
  if(Math.random()<.6){const hd=prev.hd|0,lg=()=>5+(Math.random()*3|0);
   /* never send the run back the way it came: from a sideways stretch only straight on or back to forward */
   const ch=hd==0?[0,1,-1]:[0,-hd];const w=ch[Math.random()*ch.length|0];
   if(w==0)return{ex:0,cross:1,legs:[{s:1,leg:lg(),end:'fake'},{s:-1,leg:lg(),end:'fake'}]};
   return{ex:w,cross:w,legs:[{s:w,leg:lg(),end:'exit'},{s:-w,leg:lg(),end:'fake'}]}}
  return{ex:0,legs:[]}}
 return tp0.apply(this,arguments)}}
/* the blue light round the right door, and the fake door straight ahead when the way on is to one side */
function crossFinish(room,TT,HY){try{if(!TT||!TT.cross)return;const G=room.G,ez=-room.L-1,dd=room.dd||{};
  if(TT.ex){try{const keep=G;mkFakeDoor('z',0,ez+.1,1,room.n,room.fds)}catch(e){conLog('error','cross fake door: '+e.message)}}
  let x,z,ax;if(dd.side){x=dd.side*(dd.sx-.12);z=dd.cz;ax='x'}else{x=dd.cx||0;z=ez+.12;ax='z'}
  /* a real blue lamp over the right door: a bulb in a little cage, a strong blue light and a soft blue glow on the floor */
  const B=(px,py,pz,w,h,d,c,e)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color:c,emissive:e||0}));m.position.set(px,py,pz);G.add(m);return m};
  const nx=ax=='z'?0:-dd.side,nz=ax=='z'?1:0,lx=x+nx*.22,lz=z+nz*.22;B(x+nx*.06,3.45,z+nz*.06,ax=='z'?.3:.12,.22,ax=='z'?.12:.3,0x2a2a2e);
  const bl=new THREE.Mesh(new THREE.SphereGeometry(.13,12,10),new THREE.MeshBasicMaterial({color:0x7cc4ff}));bl.position.set(lx,3.42,lz);G.add(bl);
  const gl=glowSp(0x3a9cff,.9,2.4);gl.position.set(lx,3.42,lz);G.add(gl);
  for(const k of[1,2]){const l=mkLight(0x2f7dff,k==1?2.4:1.2,k==1?9:14);l.position.set(x+nx*(k==1?.6:2.2),k==1?3.1:2.4,z+nz*(k==1?.6:2.2));room.RL.push(l)}
  const fl=new THREE.Mesh(new THREE.CircleGeometry(1.5,28),new THREE.MeshBasicMaterial({color:0x2a7aff,transparent:true,opacity:.16,depthWrite:false}));fl.rotation.x=-Math.PI/2;fl.position.set(x+nx*1.1,.02,z+nz*1.1);G.add(fl);
  room.cross=1}catch(e){conLog('error','crossroads: '+e.message)}}
