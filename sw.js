const CACHE="gt-heritage-v8";
const CORE=["./assets/styles.css","./assets/app.js","./assets/img/clhs-logo.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET"||e.request.url.indexOf(self.location.origin)!==0)return;
  const isPage=e.request.mode==="navigate"||(e.request.headers.get("accept")||"").indexOf("text/html")>-1;
  const isCode=/\.(css|js)(\?|$)/.test(e.request.url);
  if(isPage||isCode){
    // Network-first for HTML/CSS/JS so page content and styling are always fresh (offline: fall back to cache).
    e.respondWith(fetch(e.request).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));return res;}).catch(()=>caches.match(e.request)));
  } else {
    // Cache-first for images/fonts (rarely change; fast repeat loads).
    e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));}return res;})));
  }
});
