const CACHE="gt-heritage-v9";
const CORE=["./assets/styles.css","./assets/app.js","./assets/img/clhs-logo.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const url=e.request.url;
  // Never cache the live weather API — it must always be fresh.
  if(url.indexOf("open-meteo")>-1)return;
  const sameOrigin=url.indexOf(self.location.origin)===0;
  if(!sameOrigin){
    // Cross-origin assets (Wikimedia photos, Leaflet/markercluster, QR lib, Google Fonts):
    // cache-first so they keep working offline after the first visit.
    e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{
      try{const cp=res.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));}catch(_){}
      return res;
    }).catch(()=>hit)));
    return;
  }
  const isPage=e.request.mode==="navigate"||(e.request.headers.get("accept")||"").indexOf("text/html")>-1;
  const isCode=/\.(css|js)(\?|$)/.test(url);
  if(isPage||isCode){
    // Network-first for our own HTML/CSS/JS so content and styling are always fresh (offline: fall back to cache).
    e.respondWith(fetch(e.request).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));return res;}).catch(()=>caches.match(e.request)));
  } else {
    // Cache-first for our own images/fonts.
    e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));}return res;})));
  }
});
