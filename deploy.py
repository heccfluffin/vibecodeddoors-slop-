# DOORS.html (one file, everything inside) -> the website: index.html + media/<id>.<hash>.b64 (each well under 25 MB)
import re,hashlib,os,sys,glob
ROOT=os.path.dirname(os.path.abspath(__file__))
SRC=ROOT+'/out/DOORS.html'
OUT=sys.argv[1] if len(sys.argv)>1 else ROOT+'/../vibecodeddoors-site'  # a checkout of the main branch
s=open(SRC,encoding='utf8').read();os.makedirs(OUT+'/media',exist_ok=True)
for f in glob.glob(OUT+'/media/*.b64'):os.remove(f)
ids=[]
def rep(m):
    i,body=m.group(1),m.group(2);h=hashlib.sha1(body.encode()).hexdigest()[:10];fn='media/%s.%s.b64'%(i,h)
    open(OUT+'/'+fn,'w').write(body.strip());ids.append((i,fn));return '<script id="%s" type="text/plain" data-src="%s"></script>'%(i,fn)
s=re.sub(r'<script id="([A-Za-z0-9_]+)" type="text/plain">([^<]*)</script>',rep,s)
order=['lobbyMus','seekMus','desertMus','desertMus2','damMus']
ids.sort(key=lambda x:order.index(x[0]) if x[0] in order else 99)
loader='<script>/* the music and videos live in media/ next to this page; fetch them in the background, a couple at a time */(function(){const L=%s;let i=0;const next=()=>{if(i>=L.length)return;const[id,src]=L[i++];fetch(src).then(r=>r.ok?r.text():"").then(t=>{const el=document.getElementById(id);if(el&&t)el.textContent=t}).catch(()=>{}).finally(next)};const go=()=>{next();next()};if(document.readyState=="loading")document.addEventListener("DOMContentLoaded",go);else go()})();</script>'%str([list(x) for x in ids]).replace("'",'"')
k=s.find('</body>');s=s[:k]+loader+s[k:] if k>=0 else s+loader
open(OUT+'/index.html','w',encoding='utf8').write(s)
print('index.html %.2f MB'%(len(s.encode())/1048576),'media',len(ids),'largest %.2f MB'%(max(os.path.getsize(OUT+'/'+f) for _,f in ids)/1048576))
