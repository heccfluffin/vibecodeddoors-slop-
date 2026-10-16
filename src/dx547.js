/* =====================================================================================================
   r547: SIGNS THAT FIT. Long sign text used to shrink to a minimum size and then simply run off the edge. Now it
   wraps onto more lines (and shrinks further if it must) so every word is on the sign. Desert / army base signs and
   plaques are also drawn at twice the resolution, so the small text stays readable.
   ===================================================================================================== */
function txtFit(k,txt,maxW,maxH,f0,fam){let best=null;for(let f=f0;f>=8;f-=2){k.font='bold '+f+'px '+fam;const out=[];
  for(const para of String(txt).split('\n')){const ws=para.split(' ');let l='';for(const w of ws){const t=l?l+' '+w:w;if(l&&k.measureText(t).width>maxW){out.push(l);l=w}else l=t}out.push(l)}
  const wide=out.some(l=>k.measureText(l).width>maxW),tall=out.length*f*1.15>maxH;best={f,ls:out};if(!wide&&!tall)return best}
 k.font='bold '+best.f+'px '+fam;return best}
