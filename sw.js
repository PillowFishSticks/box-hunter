// Box Hunter offline support: always try the network first (so updates arrive straight away), fall back to the cache when offline.
const CACHE="box-hunter-v1";
const FILES=["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png","fonts/Silkscreen-Regular.ttf","fonts/Silkscreen-Bold.ttf","fonts/PixelifySans.ttf","fonts/Jersey10-Regular.ttf"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;
  e.respondWith(fetch(e.request).then(r=>{if(r.ok&&new URL(e.request.url).origin===location.origin){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}return r;}).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(m=>m||caches.match("index.html"))));});
