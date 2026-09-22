/* George Town Heritage — progressive-enhancement JavaScript.
   The site works without this file; JS adds persistence, animation and richer interaction. */
(function () {
  "use strict";
  var root = document.documentElement;
  var LANG = root.getAttribute("lang") === "ms" ? "ms" : "en";
  function t(en, ms) { return LANG === "ms" ? ms : en; }
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* Wait for DOMContentLoaded (fires AFTER all deferred scripts, e.g. quiz-*.js), not
     merely "interactive" — otherwise a later deferred data script isn't loaded yet. */
  function onReady(fn){ if(document.readyState==="complete") fn(); else document.addEventListener("DOMContentLoaded",fn); }
  function el(tag, cls, html){ var e=document.createElement(tag); if(cls)e.className=cls; if(html!=null)e.innerHTML=html; return e; }
  function norm(s){ return (s||"").toLowerCase().replace(/[^a-z0-9À-ɏ ]/g," ").replace(/\s+/g," ").trim(); }

  /* ---------- Theme persistence ---------- */
  function lsGet(k){ try{return localStorage.getItem(k);}catch(e){return null;} }
  function lsSet(k,v){ try{localStorage.setItem(k,v);}catch(e){} }
  function initTheme(){
    var s=lsGet("gt-theme"), rl=document.getElementById("gt-theme-light"), rd=document.getElementById("gt-theme-dark");
    if(s==="light"&&rl)rl.checked=true; if(s==="dark"&&rd)rd.checked=true;
    if(rl)rl.addEventListener("change",function(){ if(rl.checked){root.setAttribute("data-theme","light"); lsSet("gt-theme","light");} });
    if(rd)rd.addEventListener("change",function(){ if(rd.checked){root.setAttribute("data-theme","dark"); lsSet("gt-theme","dark");} });
  }

  /* ---------- Language memory ---------- */
  function initLangMemory(){
    var links=document.querySelectorAll(".set-opts a");
    links.forEach(function(a){
      a.addEventListener("click",function(){
        var txt=(a.textContent||"").toLowerCase();
        lsSet("gt-lang", txt.indexOf("melayu")>-1 ? "ms" : "en");
      });
    });
    // gentle: if the visitor previously chose BM and lands on an English page, offer once
    var pref=lsGet("gt-lang");
    if(pref==="ms" && LANG==="en" && !sessionStorage.getItem("gt-lang-asked")){
      try{sessionStorage.setItem("gt-lang-asked","1");}catch(e){}
      var other=document.querySelector('.set-opts a:not(.on)');
      if(other){
        var bar=el("div","lang-suggest",'&#127760; Baca dalam Bahasa Melayu? &nbsp;'
          +'<a href="'+other.getAttribute("href")+'">Ya</a> <button type="button" class="ls-x" aria-label="Close">&#10005;</button>');
        document.body.appendChild(bar);
        bar.querySelector(".ls-x").addEventListener("click",function(){ bar.remove(); });
        setTimeout(function(){ if(bar.parentNode) bar.remove(); }, 9000);
      }
    }
  }

  /* ---------- Scroll reveal ---------- */
  var REVEAL=".card,.site,.obj .o,.goal,.gitem,.tl,.cq,.dirrow,.route-list li,.band,.stats,.quickfacts,.site-main section";
  function initReveal(){
    var els=[].slice.call(document.querySelectorAll(REVEAL)); if(!els.length)return;
    // staggered delay within each parent group
    var groups={};
    els.forEach(function(e){ var p=e.parentNode; if(!p.__gk)p.__gk="g"+(Math.random()); var i=(groups[p.__gk]=(groups[p.__gk]||0)+1)-1; e.style.transitionDelay=Math.min(i*70,350)+"ms"; });
    if(reduce||!("IntersectionObserver" in window)){ els.forEach(function(e){e.style.transitionDelay="0ms";e.classList.add("is-in");}); return; }
    var io=new IntersectionObserver(function(en){ en.forEach(function(x){ if(x.isIntersecting){ x.target.classList.add("is-in"); io.unobserve(x.target);} }); },
      {threshold:0.12, rootMargin:"0px 0px -40px 0px"});
    els.forEach(function(e){ io.observe(e); });
  }

  /* ---------- Scroll progress bar ---------- */
  function initProgress(){
    if(reduce)return;
    var bar=el("div","scroll-progress"); document.body.appendChild(bar);
    var tick=false;
    function upd(){ var h=document.documentElement.scrollHeight-window.innerHeight; bar.style.width=(h>0?Math.min(window.scrollY/h*100,100):0)+"%"; tick=false; }
    window.addEventListener("scroll",function(){ if(!tick){requestAnimationFrame(upd);tick=true;} },{passive:true}); upd();
  }

  /* ---------- Header shrink + shadow on scroll ---------- */
  function initHeader(){
    var h=document.querySelector("header.nav"); if(!h)return; var tick=false;
    function upd(){ h.classList.toggle("scrolled",window.scrollY>28); tick=false; }
    window.addEventListener("scroll",function(){ if(!tick){requestAnimationFrame(upd);tick=true;} },{passive:true}); upd();
  }

  /* ---------- Button ripple ---------- */
  function initRipple(){
    if(reduce)return;
    document.addEventListener("click",function(e){
      var b=e.target.closest(".btn,.fact-button,.go,.food-cta,.set-opts a,.filters label,.round-tabs label");
      if(!b)return;
      var r=b.getBoundingClientRect(), d=Math.max(r.width,r.height);
      var sp=el("span","gt-ripple"); sp.style.width=sp.style.height=d+"px";
      sp.style.left=(e.clientX-r.left-d/2)+"px"; sp.style.top=(e.clientY-r.top-d/2)+"px";
      b.appendChild(sp); setTimeout(function(){ if(sp.parentNode)sp.remove(); },600);
    });
  }

  /* ---------- 3D tilt on cards (pointer devices only) ---------- */
  function initTilt(){
    if(reduce || (window.matchMedia && matchMedia("(hover: none)").matches))return;
    [].slice.call(document.querySelectorAll(".card,.food-card")).forEach(function(c){
      c.addEventListener("mousemove",function(e){
        var r=c.getBoundingClientRect();
        var x=(e.clientX-r.left)/r.width-0.5, y=(e.clientY-r.top)/r.height-0.5;
        c.style.transform="perspective(760px) rotateX("+(-y*5).toFixed(2)+"deg) rotateY("+(x*5).toFixed(2)+"deg) translateY(-6px)";
      });
      c.addEventListener("mouseleave",function(){ c.style.transform=""; });
    });
  }

  /* ---------- Count-up stats ---------- */
  function initCounters(){
    var nums=[].slice.call(document.querySelectorAll(".stat b"));
    if(!nums.length||reduce||!("IntersectionObserver" in window))return;
    var io=new IntersectionObserver(function(en){ en.forEach(function(x){ if(x.isIntersecting){ up(x.target); io.unobserve(x.target);} }); },{threshold:0.5});
    nums.forEach(function(n){ io.observe(n); });
    function up(e){ var target=parseInt((e.textContent||"").replace(/[^0-9]/g,""),10); if(isNaN(target))return; var d=1300,st=null;
      function step(ts){ if(!st)st=ts; var p=Math.min((ts-st)/d,1),ea=1-Math.pow(1-p,3); e.textContent=Math.round(ea*target); if(p<1)requestAnimationFrame(step); else e.textContent=String(target);} requestAnimationFrame(step); }
  }

  /* ---------- Back to top ---------- */
  function initTopBtn(){
    var b=el("button","to-top","&#8593;"); b.setAttribute("aria-label",t("Back to top","Kembali ke atas")); document.body.appendChild(b);
    b.addEventListener("click",function(){ window.scrollTo({top:0,behavior:reduce?"auto":"smooth"}); });
    var tick=false; window.addEventListener("scroll",function(){ if(!tick){ requestAnimationFrame(function(){ b.classList.toggle("show",window.scrollY>500); tick=false; }); tick=true; } },{passive:true});
  }

  /* ---------- Fuzzy match helper ---------- */
  function lev(a,b){ var m=a.length,n=b.length,d=[],i,j; if(!m)return n; if(!n)return m;
    for(i=0;i<=m;i++)d[i]=[i]; for(j=0;j<=n;j++)d[0][j]=j;
    for(i=1;i<=m;i++)for(j=1;j<=n;j++){ var c=a[i-1]===b[j-1]?0:1; d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+c); }
    return d[m][n]; }
  function bestSite(q){
    if(!window.SITES) return null;
    q=norm(q); if(!q) return null;
    var i, s, hit=null, hitScore=1e9;
    for(i=0;i<window.SITES.length;i++){ s=window.SITES[i]; var nm=norm(s.name);
      if(nm.indexOf(q)>-1 || q.indexOf(nm)>-1){ if(nm.length<hitScore){hit=s;hitScore=nm.length;} } }
    if(hit) return hit;
    // alias keywords
    var alias={"blue mansion":"cheong-fatt-tze-mansion","kuan yin":"goddess-of-mercy-temple","jetty":"chew-jetty",
      "jeti":"chew-jetty","peranakan":"pinang-peranakan-mansion","fort":"fort-cornwallis","kubu":"fort-cornwallis",
      "church":"st-georges-church","gereja":"st-georges-church","mural":"street-art-trail","mosque":"kapitan-keling-mosque",
      "masjid":"kapitan-keling-mosque","hindu":"sri-mahamariamman-temple","museum":"penang-state-museum","muzium":"penang-state-museum"};
    for(var a in alias){ if(q.indexOf(a)>-1){ var f=byId(alias[a]); if(f)return f; } }
    // fuzzy: token levenshtein
    var qt=q.split(" "); var best=null,bd=3;
    for(i=0;i<window.SITES.length;i++){ s=window.SITES[i]; var toks=norm(s.name).split(" ");
      for(var k=0;k<qt.length;k++){ if(qt[k].length<4)continue; for(var l=0;l<toks.length;l++){ if(toks[l].length<4)continue;
        var dd=lev(qt[k],toks[l]); if(dd<bd){bd=dd;best=s;} } } }
    return best;
  }
  function byId(id){ if(!window.SITES)return null; for(var i=0;i<window.SITES.length;i++) if(window.SITES[i].id===id) return window.SITES[i]; return null; }
  function siteUrl(s){ return "sites/"+s.id+(LANG==="ms"?"-bm":"")+".html"; }
  function pageUrl(base){ return LANG==="ms" ? base.replace(/\.html$/,"-bm.html") : base; }

  /* ---------- Global search (search page): sites + food + pages ---------- */
  function escHtml(s){ return String(s).replace(/[&<>]/g,function(c){ return c==="&"?"&amp;":c==="<"?"&lt;":"&gt;"; }); }
  function escRe(s){ return s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"); }
  function hl(text,tokens){ var out=escHtml(text); if(!tokens||!tokens.length)return out;
    try{ var re=new RegExp("("+tokens.map(escRe).join("|")+")","ig"); return out.replace(re,"<mark>$1</mark>"); }catch(e){ return out; } }
  function searchFoods(){ return [
    {icon:"🍜",title:"Char Kway Teow",tag:t("Penang hawker","Penjaja Pulau Pinang"),snip:t("Smoky stir-fried flat rice noodles with prawns, egg and bean sprouts — a Penang hawker icon.","Mi beras leper goreng dengan udang, telur dan taugeh — ikon penjaja Pulau Pinang.")},
    {icon:"🍲",title:"Asam Laksa",tag:t("Penang hawker","Penjaja Pulau Pinang"),snip:t("A sour-and-spicy tamarind fish noodle soup, one of Penang's best-known dishes.","Sup mi ikan masam pedas berasaskan asam jawa, antara hidangan paling terkenal Pulau Pinang.")},
    {icon:"🍛",title:"Nasi Kandar",tag:t("Indian-Muslim","India-Muslim"),snip:t("Steamed rice with a mix of rich curries — born of Penang's Indian-Muslim community.","Nasi kukus dengan pelbagai kari — lahir daripada masyarakat India-Muslim Pulau Pinang.")},
    {icon:"🍮",title:t("Nyonya Kuih","Kuih Nyonya"),tag:"Peranakan",snip:t("Colourful Peranakan sweets made with coconut, rice flour and pandan.","Kuih Peranakan berwarna-warni daripada kelapa, tepung beras dan pandan.")}
  ]; }
  function searchPages(){ return [
    {icon:"🌏",base:"about-unesco.html",title:t("UNESCO Objectives","Objektif UNESCO"),snip:t("Why George Town was inscribed as a World Heritage Site in 2008.","Mengapa George Town disenaraikan sebagai Tapak Warisan Dunia pada 2008."),kw:"unesco world heritage objectives 2008 outstanding universal value warisan dunia objektif nilai sejagat"},
    {icon:"📜",base:"history.html",title:t("History","Sejarah"),snip:t("Over 500 years of trade, migration and colonial rule.","Lebih 500 tahun perdagangan, migrasi dan pemerintahan kolonial."),kw:"history timeline francis light british colonial founding trading port sejarah masa lampau kolonial"},
    {icon:"🏛️",base:"attractions.html",title:t("All Heritage Sites","Semua Tapak Warisan"),snip:t("Browse all 17 temples, mosques, churches, clan houses and forts.","Layari kesemua 17 tokong, masjid, gereja, rumah kongsi dan kubu."),kw:"sites attractions list temples mosques churches clan houses forts tapak senarai tokong masjid"},
    {icon:"🍜",base:"food.html",title:t("Flavours of George Town","Rasa George Town"),snip:t("The hawker dishes that define Penang's food culture.","Hidangan penjaja yang mentakrifkan budaya makanan Pulau Pinang."),kw:"food hawker makanan penjaja cuisine dishes eat rasa hidangan char kway teow laksa nasi kandar nyonya cendol rojak"},
    {icon:"🎮",base:"games.html",title:t("Traditional Games","Permainan Tradisional"),snip:t("Congkak, Wau Bulan, Gasing and more Malaysian heritage games.","Congkak, Wau Bulan, Gasing dan lebih banyak permainan warisan Malaysia."),kw:"games traditional play congkak wau bulan gasing sepak takraw batu seremban permainan tradisional kanak main"},
    {icon:"💃",base:"dance.html",title:t("Traditional Dances","Tarian Tradisional"),snip:t("Joget, Zapin, Sumazau, Ngajat and more — feel each dance's rhythm.","Joget, Zapin, Sumazau, Ngajat dan lagi — rasai rentak setiap tarian."),kw:"dance dances boria dondang sayang joget zapin inang kuda kepang sumazau ngajat mak yong bharatanatyam bhangra lion dance rhythm tarian tradisional rentak menari peranakan penang"},
    {icon:"🗺️",base:"directions.html",title:t("Maps & Directions","Peta & Arah"),snip:t("An interactive map of all 17 sites, with category filters and Find-me.","Peta interaktif kesemua 17 tapak, dengan penapis kategori dan Cari-saya."),kw:"map directions walking google maps find me location peta arah laluan penapis lokasi"},
    {icon:"🚶",base:"route.html",title:t("Walking Route","Laluan Berjalan"),snip:t("A suggested self-guided walk through the old town.","Cadangan laluan berjalan sendiri menerusi bandar lama."),kw:"route walking trail city walk itinerary self guided laluan berjalan bandar lama"},
    {icon:"🛣️",base:"lanes.html",title:t("Lanes & Streets","Lorong & Jalan"),snip:t("Love Lane, Armenian Street, Chulia Street and more famous George Town lanes.","Lorong Love, Lebuh Armenian, Lebuh Chulia dan lebih banyak lorong terkenal George Town."),kw:"lanes streets love lane armenian chulia muntri cannon stewart beach acheen lorong jalan lebuh street"},
    {icon:"🧠",base:"trivia.html",title:t("Heritage Trivia","Kuiz Warisan"),snip:t("Test yourself with a 10-question heritage quiz.","Uji diri dengan kuiz warisan 10 soalan."),kw:"trivia quiz questions game test score kuiz soalan permainan uji"},
    {icon:"🧭",base:"guide.html",title:t("Visitor Guide","Panduan Pelawat"),snip:t("Practical tips for planning your visit.","Petua praktikal untuk merancang lawatan anda."),kw:"guide tips visit plan hours advice panduan pelawat petua lawatan"},
    {icon:"📷",base:"gallery.html",title:t("Photo Gallery","Galeri Foto"),snip:t("Photos of George Town — and submit your own scenery.","Foto George Town — dan hantar pemandangan anda sendiri."),kw:"gallery photos images pictures upload submit scenery galeri foto gambar hantar pemandangan"},
    {icon:"🎓",base:"about.html",title:t("About Us","Tentang Kami"),snip:t("A student heritage project by SMJK Chung Ling, Penang.","Projek warisan pelajar SMJK Chung Ling, Pulau Pinang."),kw:"about us school project students smjk chung ling penang tentang kami sekolah pelajar projek"},
    {icon:"✉️",base:"contact.html",title:t("Contact","Hubungi"),snip:t("Send us a message or feedback.","Hantar mesej atau maklum balas kepada kami."),kw:"contact email message feedback reach hubungi mesej maklum balas"}
  ]; }
  function buildSearchIndex(){
    var kl={site:t("Site","Tapak"),food:t("Food","Makanan"),page:t("Page","Halaman")}, idx=[];
    (window.SITES||[]).forEach(function(s){
      idx.push({kind:"site",icon:"🏛️",title:s.name,snip:s.short,tag:s.cat+" · "+t("built ","dibina ")+s.year+" · "+s.area,
        url:siteUrl(s),kindLabel:kl.site,hay:norm(s.name+" "+s.short+" "+s.area+" "+s.cat+" "+s.year)});
    });
    searchFoods().forEach(function(f){
      idx.push({kind:"food",icon:f.icon,title:f.title,snip:f.snip,tag:f.tag,url:pageUrl("food.html"),kindLabel:kl.food,
        hay:norm(f.title+" "+f.snip+" "+f.tag+" food makanan")});
    });
    searchPages().forEach(function(p){
      idx.push({kind:"page",icon:p.icon,title:p.title,snip:p.snip,tag:"",url:pageUrl(p.base),kindLabel:kl.page,
        hay:norm(p.title+" "+p.snip+" "+p.kw)});
    });
    return idx;
  }
  function scoreEntry(e,q,tokens){
    for(var i=0;i<tokens.length;i++){ if(e.hay.indexOf(tokens[i])<0) return 0; }
    var nt=norm(e.title), s=5;
    if(nt===q)s+=100; else if(nt.indexOf(q)===0)s+=60; else if(nt.indexOf(q)>-1)s+=40;
    if(norm(e.snip).indexOf(q)>-1)s+=8;
    s+= e.kind==="site"?3:e.kind==="food"?2:1;
    return s;
  }
  function initSearch(){
    var input=document.getElementById("site-search"); if(!input)return;
    var msg=document.getElementById("search-msg");
    var browse=[].slice.call(document.querySelectorAll(".chips,.chip-label,.chat"));
    input.setAttribute("placeholder", t("Search sites, food, history…","Cari tapak, makanan, sejarah…"));
    var results=el("div","search-results"); results.id="search-results";
    var anchor=msg||input; anchor.parentNode.insertBefore(results, anchor.nextSibling);
    var index=buildSearchIndex();
    input.addEventListener("input",run);
    input.addEventListener("keydown",function(e){ if(e.key==="Enter"){ e.preventDefault(); var f=results.querySelector(".sr-item"); if(f)location.href=f.getAttribute("href"); } });
    if(input.form) input.form.addEventListener("submit",function(e){ e.preventDefault(); var f=results.querySelector(".sr-item"); if(f)location.href=f.getAttribute("href"); });
    run();
    function run(){
      var raw=input.value.trim(), q=norm(raw);
      if(!q){ results.innerHTML=""; results.classList.remove("show"); browse.forEach(function(e){e.style.display="";}); if(msg)msg.textContent=""; return; }
      browse.forEach(function(e){e.style.display="none";});
      var tokens=q.split(" ").filter(function(x){return x.length>0;});
      var hits=[];
      index.forEach(function(en){ var sc=scoreEntry(en,q,tokens); if(sc>0) hits.push({e:en,s:sc}); });
      hits.sort(function(a,b){ return b.s-a.s; });
      results.classList.add("show");
      if(!hits.length){ results.innerHTML='<p class="sr-none">'+t("No results for","Tiada hasil untuk")+' “'+escHtml(raw)+'”. '+t("Try a site, a dish, or a topic.","Cuba tapak, hidangan, atau topik.")+'</p>'; if(msg)msg.textContent=""; return; }
      if(msg)msg.textContent=hits.length+" "+t(hits.length===1?"result":"results", hits.length===1?"hasil":"hasil");
      results.innerHTML=hits.slice(0,12).map(function(h){ var e=h.e;
        return '<a class="sr-item" href="'+e.url+'"><span class="sr-ic">'+e.icon+'</span>'
          +'<span class="sr-body"><span class="sr-title">'+hl(e.title,tokens)+'</span>'
          +(e.tag?'<span class="sr-tag">'+escHtml(e.tag)+'</span>':'')
          +'<span class="sr-snip">'+hl(e.snip,tokens)+'</span></span>'
          +'<span class="sr-kind">'+e.kindLabel+'</span></a>';
      }).join("");
    }
  }

  /* ---------- Typed chatbot ---------- */
  function chatReply(raw){
    var q=norm(raw);
    if(!q) return t("Ask me anything about George Town!","Tanya saya apa sahaja tentang George Town!");
    if(/^(hi|hello|hey|hai|helo|salam)/.test(q)) return t("Hello! Ask me about any heritage site, the history, UNESCO, or directions.","Hai! Tanya saya tentang mana-mana tapak warisan, sejarah, UNESCO, atau arah.");
    if(/(thank|terima kasih)/.test(q)) return t("You're welcome! Enjoy George Town.","Sama-sama! Selamat menjelajah George Town.");
    if(/unesco|world heritage|warisan dunia/.test(q)) return t("UNESCO named George Town a World Heritage Site in 2008. ","UNESCO menamakan George Town Tapak Warisan Dunia pada 2008. ")+lnk("about-unesco.html",t("Learn more","Ketahui lanjut"));
    if(/(oldest|tertua)/.test(q)){ var g=byId("goddess-of-mercy-temple"); return t("The oldest Chinese temple is the ","Tokong Cina tertua ialah ")+(g?bubbleLink(g):"")+" (1728)."; }
    if(/(food|makan|laksa|char)/.test(q)) return t("Try char kway teow, assam laksa and Nyonya food! ","Cuba char kuey teow, asam laksa dan makanan Nyonya! ")+lnk("sites/little-india"+(LANG==="ms"?"-bm":"")+".html","Little India");
    if(/(direction|arah|how.*get|map|peta|route|laluan)/.test(q)){ var s0=bestSite(q); if(s0) return t("To reach ","Untuk ke ")+"<b>"+s0.name+"</b> ("+s0.area+"), "+'<a target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination='+s0.lat+","+s0.lng+'&travelmode=walking">'+t("open Google Maps","buka Google Maps")+"</a>."; return t("Use the ","Guna halaman ")+lnk("directions.html",t("Directions page","Arah"))+"."; }
    if(/(trivia|quiz|kuiz)/.test(q)) return t("Try the ","Cuba ")+lnk("trivia.html",t("Heritage Trivia quiz","Kuiz Warisan"))+"!";
    var s=bestSite(q);
    if(s) return bubbleLink(s)+" ("+s.cat+", "+t("built ","dibina ")+s.year+"). "+s.short+"<br>"+lnk_s(s,t("Read the full story","Baca kisah penuh"));
    return t("Sorry, I don't know that one. Try a site name, UNESCO, history, food or directions.","Maaf, saya tidak tahu itu. Cuba nama tapak, UNESCO, sejarah, makanan atau arah.");
  }
  function lnk(base,label){ return '<a href="'+pageUrl(base)+'">'+label+"</a>"; }
  function lnk_s(s,label){ return '<a href="'+siteUrl(s)+'">'+label+"</a>"; }
  function bubbleLink(s){ return '<a href="'+siteUrl(s)+'"><b>'+s.name+"</b></a>"; }
  function initChatInput(){
    var box=document.getElementById("gt-typed"); var input=document.getElementById("gt-chat-input"); var send=document.getElementById("gt-chat-send");
    if(!box||!input)return;
    function submit(){ var v=input.value.trim(); if(!v)return;
      box.appendChild(el("div","gt-msg user", v.replace(/</g,"&lt;"))); input.value="";
      var reply=chatReply(v); setTimeout(function(){ box.appendChild(el("div","gt-msg bot", reply)); box.scrollIntoView&&0; var b=box.closest(".gt-body"); if(b)b.scrollTop=b.scrollHeight; },220);
      var b=box.closest(".gt-body"); if(b)b.scrollTop=b.scrollHeight;
    }
    if(send)send.addEventListener("click",submit);
    input.addEventListener("keydown",function(e){ if(e.key==="Enter"){ e.preventDefault(); submit(); } });
  }

  /* ---------- Trivia: random 10 of 50 with scoring ---------- */
  function shuffle(a){ for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var x=a[i];a[i]=a[j];a[j]=x; } return a; }
  function flashBtn(btn,msg){ var old=btn.innerHTML; btn.innerHTML=msg; btn.disabled=true; setTimeout(function(){ btn.innerHTML=old; btn.disabled=false; },1600); }
  function legacyCopy(str){ try{ var ta=document.createElement("textarea"); ta.value=str; ta.setAttribute("readonly","");
    ta.style.position="fixed"; ta.style.top="-1000px"; ta.style.opacity="0"; document.body.appendChild(ta);
    ta.focus(); ta.select(); var ok=document.execCommand("copy"); document.body.removeChild(ta); return ok; }catch(e){ return false; } }
  function shareScore(score,btn){
    var url=location.href.split("#")[0];
    var text=t("I rode "+score+"/10 stations on the George Town Heritage coaster quiz! Can you beat me?",
               "Saya lalui "+score+"/10 stesen dalam kuiz roller-coaster Warisan George Town! Boleh anda kalahkan saya?");
    if(navigator.share){ navigator.share({title:t("George Town Heritage Trivia","Kuiz Warisan George Town"),text:text,url:url}).catch(function(){}); return; }
    var full=text+" "+url;
    function ok(){ flashBtn(btn,t("✓ Copied!","✓ Disalin!")); }
    function fail(){ if(legacyCopy(full))ok(); else flashBtn(btn,t("Copy failed","Gagal menyalin")); }
    if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(full).then(ok,fail); }
    else fail();
  }
  function initQuiz(){
    var host=document.getElementById("js-quiz"); if(!host||!window.QUIZ)return;
    var stat=document.querySelector(".static-quiz"); if(stat)stat.style.display="none";
    var SVGNS="http://www.w3.org/2000/svg";
    var TOTAL=10, MAXLIVES=5, TIMER=20000, DPATH="M8,92 C 70,92 70,34 132,34 S 194,98 256,92 S 320,30 382,46 S 470,96 520,60 L 592,28";
    var picked, idx, correct, lives, streak, bestStreak, answered, curFrac;
    var stage, path, pathLen, cart, dots, livesEl, streakEl, distEl, timerBar, qWrap, cardRef, timerId;
    /* ---- sound (Web Audio, no files) ---- */
    var AC=window.AudioContext||window.webkitAudioContext, actx=null;
    var soundOn = lsGet("gt-sound")!=="off";
    function ctxOn(){ if(!AC)return null; if(!actx){ try{actx=new AC();}catch(e){actx=null;} } if(actx&&actx.state==="suspended")actx.resume(); return actx; }
    function beep(freq,dur,type,vol,when){ var c=ctxOn(); if(!c)return; var o=c.createOscillator(),g=c.createGain();
      o.type=type||"sine"; o.frequency.value=freq; o.connect(g); g.connect(c.destination);
      var s=c.currentTime+(when||0); g.gain.setValueAtTime(vol||0.12,s); g.gain.exponentialRampToValueAtTime(0.0001,s+(dur||0.15));
      o.start(s); o.stop(s+(dur||0.15)+0.02); }
    function sfx(k){ if(!soundOn)return;
      if(k==="correct"){ beep(660,0.12,"sine",0.14,0); beep(990,0.14,"sine",0.12,0.1); }
      else if(k==="wrong"){ beep(220,0.28,"sawtooth",0.15,0); beep(140,0.32,"sawtooth",0.12,0.06); }
      else if(k==="win"){ [523,659,784,1047].forEach(function(f,i){ beep(f,0.2,"triangle",0.13,i*0.13); }); }
      else if(k==="click"){ beep(760,0.05,"square",0.05,0); } }
    /* ---- track geometry ---- */
    function mk(tag,a){ var e=document.createElementNS(SVGNS,tag); for(var k in a)e.setAttribute(k,a[k]); return e; }
    function ptAt(f){ f=Math.max(0,Math.min(1,f)); return path.getPointAtLength(f*pathLen); }
    function placeCart(f,extraY,rot){ var p=ptAt(f); cart.setAttribute("transform","translate("+p.x.toFixed(1)+","+(p.y+(extraY||0)).toFixed(1)+")"+(rot?" rotate("+rot+")":"")); }
    function moveCart(to){ var done=false; function settle(){ if(done)return; done=true; curFrac=to; placeCart(to); }
      if(reduce){ settle(); return; } var from=curFrac,st=null;
      (function step(ts){ if(done)return; if(!st)st=ts; var pr=Math.min((ts-st)/650,1),e=1-Math.pow(1-pr,3); placeCart(from+(to-from)*e); if(pr<1)requestAnimationFrame(step); else settle(); })(performance.now());
      setTimeout(settle,750); }
    function launchCart(cb){ var done=false; function fin(){ if(done)return; done=true; cb(); }
      if(reduce){ fin(); return; } var st=null, end=ptAt(1);
      (function step(ts){ if(done)return; if(!st)st=ts; var pr=Math.min((ts-st)/750,1);
        var x=end.x+pr*90, y=end.y-Math.sin(pr*Math.PI)*95-pr*30; cart.setAttribute("transform","translate("+x.toFixed(1)+","+y.toFixed(1)+") rotate("+(pr*45).toFixed(0)+")");
        if(pr<1)requestAnimationFrame(step); else fin(); })(performance.now());
      setTimeout(fin,850); }
    /* ---- confetti ---- */
    function confetti(){ if(reduce)return; var c=document.createElement("canvas"); c.className="gt-confetti";
      document.body.appendChild(c); var g=c.getContext("2d"), W=c.width=innerWidth, H=c.height=innerHeight;
      var cols=["#1c34a0","#f5b400","#c0392b","#157f74","#8296f0"], P=[];
      for(var i=0;i<130;i++)P.push({x:Math.random()*W,y:-20-Math.random()*H*0.4,r:4+Math.random()*5,c:cols[i%cols.length],vy:2+Math.random()*3,vx:-1.5+Math.random()*3,rot:Math.random()*6,vr:-0.25+Math.random()*0.5});
      var t0=performance.now();
      (function frame(ts){ g.clearRect(0,0,W,H); P.forEach(function(p){ p.x+=p.vx; p.y+=p.vy; p.rot+=p.vr;
        g.save(); g.translate(p.x,p.y); g.rotate(p.rot); g.fillStyle=p.c; g.fillRect(-p.r,-p.r,p.r*2,p.r*1.4); g.restore(); });
        if(ts-t0<2300)requestAnimationFrame(frame); else c.remove(); })(t0); }
    /* ---- timer ---- */
    function startTimer(){ if(!timerBar)return; timerBar.classList.remove("low");
      timerBar.style.transition="none"; timerBar.style.width="100%"; void timerBar.offsetWidth;
      timerBar.style.transition="width "+TIMER+"ms linear"; timerBar.style.width="0%";
      clearTimeout(timerId); timerId=setTimeout(function(){ timerBar&&timerBar.classList.add("low"); }, TIMER*0.55);
      timerId=setTimeout(function(){ if(!answered)timeUp(); }, TIMER); }
    function stopTimer(){ clearTimeout(timerId); if(timerBar){ var w=getComputedStyle(timerBar).width; timerBar.style.transition="none"; timerBar.style.width=w; } }
    /* ---- HUD ---- */
    function heartsHTML(){ var s=""; for(var i=0;i<MAXLIVES;i++) s+='<span class="life'+(i<lives?"":" lost")+'">'+(i<lives?"❤️":"🖤")+'</span>'; return s; }
    function updateHUD(){ livesEl.innerHTML=heartsHTML(); distEl.textContent="🎢 "+t("Station ","Stesen ")+Math.min(idx+1,TOTAL)+"/"+TOTAL;
      if(streak>=2){ streakEl.textContent="🔥 "+t("Streak ","Rentetan ")+streak; streakEl.classList.add("show","bump"); setTimeout(function(){ streakEl.classList.remove("bump"); },220); }
      else { streakEl.classList.remove("show"); streakEl.textContent=""; } }
    /* ---- flow ---- */
    function start(){
      picked=shuffle(window.QUIZ.slice()).slice(0,TOTAL).map(function(it){ var opts=shuffle([{t:it.a,c:true}].concat(it.w.map(function(w){return{t:w,c:false};}))); return {q:it.q,opts:opts,why:it.why}; });
      idx=0; correct=0; lives=MAXLIVES; streak=0; bestStreak=0; curFrac=0;
      var svg='<svg class="c2-track" viewBox="0 0 600 120" preserveAspectRatio="xMidYMid meet" aria-hidden="true">'
        +'<defs><linearGradient id="railgrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1c34a0"/><stop offset="1" stop-color="#f5b400"/></linearGradient></defs>'
        +'<path class="c2-rail" d="'+DPATH+'"/><g class="c2-dots"></g>'
        +'<g class="cart2"><text text-anchor="middle" dy="-6">🎢</text></g></svg>';
      host.innerHTML='<div class="coaster2"><div class="c2-hud">'
        +'<div class="lives" title="'+t("Lives","Nyawa")+'">'+heartsHTML()+'</div>'
        +'<div class="c2-mid"><span class="streak"></span></div>'
        +'<div class="c2-right"><span class="dist">🎢 '+t("Station ","Stesen ")+'1/'+TOTAL+'</span>'
        +'<button class="c2-mute" type="button" aria-label="'+t("Toggle sound","Togol bunyi")+'"></button></div>'
        +'</div><div class="c2-stage">'+svg+'</div>'
        +'<div class="c2-timer" aria-hidden="true"><i></i></div></div><div id="quiz-q"></div>';
      stage=host.querySelector(".c2-stage"); path=host.querySelector(".c2-rail"); pathLen=path.getTotalLength();
      cart=host.querySelector(".cart2"); livesEl=host.querySelector(".c2-hud .lives");
      streakEl=host.querySelector(".streak"); distEl=host.querySelector(".dist"); timerBar=host.querySelector(".c2-timer i");
      var mute=host.querySelector(".c2-mute"); mute.textContent=soundOn?"🔊":"🔇";
      mute.addEventListener("click",function(){ soundOn=!soundOn; lsSet("gt-sound",soundOn?"on":"off"); mute.textContent=soundOn?"🔊":"🔇"; if(soundOn)sfx("click"); });
      var dg=host.querySelector(".c2-dots"); dots={};
      for(var k=1;k<=TOTAL;k++){ var p=ptAt(k/TOTAL); dots[k]=mk("circle",{cx:p.x,cy:p.y,r:5,"class":"c2-dot"}); dg.appendChild(dots[k]); }
      placeCart(0); qWrap=host.querySelector("#quiz-q"); renderQuestion();
    }
    function renderQuestion(){ answered=false; var it=picked[idx]; updateHUD(); qWrap.innerHTML="";
      var card=el("div","cq is-in"); card.appendChild(el("p","q",it.q));
      var opts=el("div","opts");
      it.opts.forEach(function(o){ var lab=el("button","opt"+(o.c?" is-correct":"")); lab.type="button"; lab.innerHTML="<span>"+o.t+"</span>";
        lab.addEventListener("click",function(){ choose(o,lab,card); }); opts.appendChild(lab); });
      card.appendChild(opts);
      var ex=el("p","ex"); ex.textContent="✓ "+it.why; card.appendChild(ex); qWrap.appendChild(card);
      var next=el("button","next",t("Next →","Seterusnya →")); next.type="button"; next.style.display="none";
      next.addEventListener("click",goNext); card._next=next; qWrap.appendChild(next);
      cardRef=card; startTimer(); }
    function reveal(card){ var all=card.querySelectorAll(".opt"); all.forEach(function(b){ b.disabled=true; if(b.classList.contains("is-correct"))b.classList.add("correct"); });
      card.querySelector(".ex").classList.add("show"); }
    function derail(){ var d=dots[correct+1]; if(d)d.classList.add("broken"); if(stage){ stage.classList.add("shake"); setTimeout(function(){ stage.classList.remove("shake"); },520); } }
    function finalize(card){ var last=(idx===TOTAL-1)||(lives<=0);
      card._next.textContent = lives<=0 ? t("The track collapsed →","Landasan runtuh →") : (last?t("Finish the ride →","Tamat perjalanan →"):t("Next →","Seterusnya →"));
      card._next.style.display="inline-block"; }
    function choose(o,lab,card){ if(answered)return; answered=true; stopTimer(); reveal(card);
      if(o.c){ correct++; streak++; if(streak>bestStreak)bestStreak=streak; sfx("correct"); if(dots[correct])dots[correct].classList.add("done"); moveCart(correct/TOTAL); }
      else { lab.classList.add("wrong"); lives--; streak=0; sfx("wrong"); derail(); }
      updateHUD(); finalize(card); }
    function timeUp(){ if(answered)return; answered=true; stopTimer(); reveal(cardRef);
      lives--; streak=0; sfx("wrong"); derail(); updateHUD(); finalize(cardRef); }
    function goNext(){ stopTimer(); if(lives<=0){ results(); return; } idx++; if(idx>=TOTAL) finish(); else renderQuestion(); }
    function finish(){ if(lives>0){ sfx("win"); launchCart(function(){ confetti(); results(); }); } else results(); }
    function results(){ host.innerHTML="";
      var dist=correct, survived=lives>0;
      var medal = survived&&dist>=9?"🏆": dist>=7?"🥇": dist>=5?"🥈":"🎢";
      var prev=parseInt(lsGet("gt-quiz-best")||"0",10); if(isNaN(prev))prev=0;
      var isBest=dist>prev, best=Math.max(dist,prev); if(isBest)lsSet("gt-quiz-best",String(best));
      var head = !survived ? t("Out of lives — the track collapsed!","Kehabisan nyawa — landasan runtuh!")
        : dist>=9?t("Heritage Master! A perfect ride!","Sifu Warisan! Perjalanan sempurna!")
        : dist>=7?t("Heritage Expert","Pakar Warisan")
        : dist>=5?t("Heritage Enthusiast","Peminat Warisan"):t("Heritage Explorer","Penjelajah Warisan");
      var r=el("div","q-result is-in");
      r.innerHTML='<div class="medal">'+medal+'</div><div class="score">'+dist+'/'+TOTAL+'</div><p>'+head+'</p>'
        +'<div class="q-best">'+(isBest?'<span class="q-newbest">🎉 '+t("New personal best!","Rekod peribadi baharu!")+'</span>':'')
        +'<span class="q-bestline">'+t("Furthest: ","Terjauh: ")+best+'/'+TOTAL+' · '+t("Best streak: ","Rentetan terbaik: ")+'🔥'+bestStreak+' · '+t("Lives left: ","Nyawa: ")+Math.max(lives,0)+'</span></div>';
      var row=el("div","q-actions");
      var again=el("button","again",t("Ride Again (new track)","Naik Semula (landasan baharu)")); again.type="button"; again.addEventListener("click",start);
      var share=el("button","share-btn","🔗 "+t("Share score","Kongsi skor")); share.type="button"; share.addEventListener("click",function(){ shareScore(dist,share); });
      row.appendChild(again); row.appendChild(share); r.appendChild(row); host.appendChild(r); }
    window.addEventListener("pagehide",function(){ clearTimeout(timerId); });
    start();
  }

  /* ---------- AJAX forms (Formspree) ---------- */
  function initForms(){
    var forms=[].slice.call(document.querySelectorAll('form[action*="formspree.io"]'));
    forms.forEach(function(f){
      var msg=el("p","form-msg"); f.appendChild(msg);
      f.addEventListener("submit",function(e){
        e.preventDefault(); msg.className="form-msg"; msg.textContent=t("Sending…","Menghantar…");
        fetch(f.action,{method:"POST",body:new FormData(f),headers:{Accept:"application/json"}})
          .then(function(r){ if(r.ok){ f.reset(); msg.className="form-msg ok"; msg.textContent=t("Thank you! Your message has been sent.","Terima kasih! Mesej anda telah dihantar."); }
            else return r.json().then(function(d){ throw new Error((d&&d.errors&&d.errors[0]&&d.errors[0].message)||"error"); }); })
          .catch(function(){ msg.className="form-msg err"; msg.textContent=t("Sorry, something went wrong. Please try again.","Maaf, ada masalah. Sila cuba lagi."); });
      });
    });
  }

  /* ---------- Shared lightbox (gallery + site photo) with prev/next ---------- */
  var LB=null;
  function ensureLightbox(){
    if(LB)return LB;
    var ov=el("div","lightbox");
    ov.innerHTML='<button class="lb-x" aria-label="'+t("Close","Tutup")+'">&#10005;</button>'
      +'<button class="lb-nav lb-prev" aria-label="'+t("Previous","Sebelumnya")+'">&#8249;</button>'
      +'<figure class="lb-fig"><img alt=""><figcaption class="lb-cap"></figcaption></figure>'
      +'<button class="lb-nav lb-next" aria-label="'+t("Next","Seterusnya")+'">&#8250;</button>';
    document.body.appendChild(ov);
    var big=ov.querySelector("img"), cap=ov.querySelector(".lb-cap");
    var prev=ov.querySelector(".lb-prev"), next=ov.querySelector(".lb-next");
    var list=[], i=0;
    function show(){ var it=list[i]; big.src=it.src; big.alt=it.alt||""; cap.textContent=it.cap||"";
      var multi=list.length>1; prev.style.display=next.style.display=multi?"":"none"; cap.style.display=cap.textContent?"":"none"; }
    function close(){ ov.classList.remove("open"); big.src=""; }
    function nav(d){ if(list.length<2)return; i=(i+d+list.length)%list.length; show(); }
    ov.querySelector(".lb-x").addEventListener("click",close);
    prev.addEventListener("click",function(e){ e.stopPropagation(); nav(-1); });
    next.addEventListener("click",function(e){ e.stopPropagation(); nav(1); });
    ov.addEventListener("click",function(e){ if(e.target===ov)close(); });
    document.addEventListener("keydown",function(e){ if(!ov.classList.contains("open"))return;
      if(e.key==="Escape")close(); else if(e.key==="ArrowLeft")nav(-1); else if(e.key==="ArrowRight")nav(1); });
    LB={ open:function(items,start){ list=items; i=start||0; show(); ov.classList.add("open"); } };
    return LB;
  }
  function initLightbox(){
    var imgs=[].slice.call(document.querySelectorAll(".gitem img")); if(!imgs.length)return;
    var items=imgs.map(function(im){ return {src:im.src, alt:im.alt, cap:im.getAttribute("data-cap")||im.alt||""}; });
    var lb=ensureLightbox();
    imgs.forEach(function(im,k){ im.style.cursor="zoom-in"; im.addEventListener("click",function(){ lb.open(items,k); }); });
  }

  /* ---------- Site page: view photo (carousel-ready) ---------- */
  function initSitePhoto(){
    var hero=document.querySelector(".site-hero"); if(!hero)return;
    var acts=hero.querySelector(".site-actions"); if(!acts)return;
    var name=((hero.querySelector("h1")||{}).textContent||"").trim();
    var id=(location.pathname.split("/").pop()||"").replace(/(-bm)?\.html$/,"");
    var photos=[];
    // future: drop extra photos in window.SITE_PHOTOS[id] to turn this into a real carousel
    if(window.SITE_PHOTOS && window.SITE_PHOTOS[id]) photos=window.SITE_PHOTOS[id].slice();
    if(!photos.length){ var m=/url\((['"]?)(.*?)\1\)/.exec(hero.getAttribute("style")||""); if(m&&m[2])photos=[m[2]]; }
    if(!photos.length)return;
    var items=photos.map(function(src){ return {src:src, alt:name, cap:name}; });
    var lb=ensureLightbox();
    var label=photos.length>1 ? t("Photos ("+photos.length+")","Foto ("+photos.length+")") : t("View photo","Lihat foto");
    var btn=el("button","btn-photo","&#128247; "+label); btn.type="button";
    btn.addEventListener("click",function(){ lb.open(items,0); });
    acts.appendChild(btn);
  }

  /* ---------- Site page: audio guide (text-to-speech) ---------- */
  function initAudioGuide(){
    var hero=document.querySelector(".site-hero"), main=document.querySelector(".site-main");
    if(!hero||!main||!("speechSynthesis" in window))return;
    var acts=hero.querySelector(".site-actions"); if(!acts)return;
    var name=((hero.querySelector("h1")||{}).textContent||"").trim();
    var parts=name?[name+"."]:[];
    [].slice.call(main.querySelectorAll("section")).forEach(function(sec){
      var h=sec.querySelector("h2"); if(h)parts.push(h.textContent.trim()+".");
      [].slice.call(sec.querySelectorAll("p")).forEach(function(p){ var x=p.textContent.trim(); if(x)parts.push(x); });
    });
    var text=parts.join(" "); if(!text)return;
    // split into sentence chunks to dodge the long-utterance cutoff in some browsers
    var chunks=text.match(/[^.!?]+[.!?]*/g)||[text];
    var lang=LANG==="ms"?"ms-MY":"en-GB";
    var btn=el("button","btn-listen","&#128266; "+t("Listen","Dengar")); btn.type="button"; acts.appendChild(btn);
    var playing=false, qi=0;
    function idle(){ playing=false; btn.classList.remove("playing"); btn.innerHTML="&#128266; "+t("Listen","Dengar"); }
    function stop(){ window.speechSynthesis.cancel(); idle(); }
    function speakNext(){ if(!playing)return; if(qi>=chunks.length){ idle(); return; }
      var u=new SpeechSynthesisUtterance(chunks[qi++].trim()); u.lang=lang; u.rate=0.98;
      u.onend=speakNext; u.onerror=idle; window.speechSynthesis.speak(u); }
    btn.addEventListener("click",function(){
      if(playing){ stop(); return; }
      window.speechSynthesis.cancel(); playing=true; qi=0;
      btn.classList.add("playing"); btn.innerHTML="&#9632; "+t("Stop","Berhenti"); speakNext();
    });
    window.addEventListener("pagehide",function(){ window.speechSynthesis.cancel(); });
    window.addEventListener("beforeunload",function(){ window.speechSynthesis.cancel(); });
  }

  /* ---------- Leaflet map: category filters + clustering + find-me ---------- */
  var CATS=[
    {en:"Chinese",ms:"Cina",c:"#1c34a0"},
    {en:"Colonial",ms:"Kolonial",c:"#0f1f66"},
    {en:"Indian",ms:"India",c:"#c0392b"},
    {en:"Malay-Muslim",ms:"Melayu-Islam",c:"#157f74"},
    {en:"Street Art",ms:"Seni Jalanan",c:"#f5b400"}
  ];
  function catInfo(cat){ for(var i=0;i<CATS.length;i++) if(CATS[i].en===cat||CATS[i].ms===cat) return CATS[i]; return {en:cat,ms:cat,c:"#1c34a0"}; }
  var LANE_C="#8a1e5a";
  var LANES=[
    {name:"Love Lane",lat:5.4200,lng:100.3372},{name:"Armenian Street",lat:5.4148,lng:100.3383},
    {name:"Chulia Street",lat:5.4157,lng:100.3363},{name:"Muntri Street",lat:5.4187,lng:100.3363},
    {name:"Cannon Street",lat:5.4152,lng:100.3379},{name:"Stewart Lane",lat:5.4165,lng:100.3376},
    {name:"Beach Street",lat:5.4176,lng:100.3402},{name:"Acheen Street",lat:5.4151,lng:100.3361}
  ];
  function haversine(la1,ln1,la2,ln2){ var R=6371000,r=Math.PI/180,
    dLa=(la2-la1)*r, dLn=(ln2-ln1)*r,
    a=Math.sin(dLa/2)*Math.sin(dLa/2)+Math.cos(la1*r)*Math.cos(la2*r)*Math.sin(dLn/2)*Math.sin(dLn/2);
    return 2*R*Math.asin(Math.sqrt(a)); }
  function initMap(){
    var host=document.getElementById("leaflet-map"); if(!host||!window.SITES)return;
    function build(){ if(!window.L)return;
      var tools=el("div","map-tools");
      var active={}; CATS.forEach(function(ci){ active[ci.en]=true; }); active["Lanes"]=true;
      CATS.forEach(function(ci){
        var b=el("button","map-chip"); b.type="button"; b.style.setProperty("--c",ci.c);
        b.innerHTML='<i></i>'+(LANG==="ms"?ci.ms:ci.en);
        b.addEventListener("click",function(){ active[ci.en]=!active[ci.en]; b.classList.toggle("off",!active[ci.en]); refresh(); });
        tools.appendChild(b);
      });
      var lb=el("button","map-chip"); lb.type="button"; lb.style.setProperty("--c",LANE_C);
      lb.innerHTML='<i></i>'+t("Lanes","Lorong");
      lb.addEventListener("click",function(){ active["Lanes"]=!active["Lanes"]; lb.classList.toggle("off",!active["Lanes"]); refresh(); });
      tools.appendChild(lb);
      var findBtn=el("button","map-find","&#128205; "+t("Find me","Cari saya")); findBtn.type="button"; tools.appendChild(findBtn);
      host.parentNode.insertBefore(tools,host);

      var map=L.map(host,{scrollWheelZoom:false}).setView([5.4157,100.3385],15);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"&copy; OpenStreetMap"}).addTo(map);
      var layer = L.markerClusterGroup ? L.markerClusterGroup({maxClusterRadius:36,showCoverageOnHover:false}) : L.layerGroup();
      map.addLayer(layer);

      var markers=window.SITES.map(function(s){
        var ci=catInfo(s.cat);
        var icon=L.divIcon({className:"gt-pin",html:'<span style="background:'+ci.c+'"></span>',iconSize:[20,20],iconAnchor:[10,10],popupAnchor:[0,-11]});
        var m=L.marker([s.lat,s.lng],{icon:icon});
        m.bindPopup('<b>'+s.name+'</b><br>'+s.area+'<br><a href="'+siteUrl(s)+'">'+t("Details","Butiran")+'</a>');
        m.__cat=ci.en; return m;
      });
      markers=markers.concat(LANES.map(function(l){
        var icon=L.divIcon({className:"gt-pin",html:'<span style="background:'+LANE_C+'"></span>',iconSize:[20,20],iconAnchor:[10,10],popupAnchor:[0,-11]});
        var m=L.marker([l.lat,l.lng],{icon:icon});
        m.bindPopup('<b>'+l.name+'</b><br>'+t("Heritage lane","Lorong warisan")+'<br><a href="'+pageUrl("lanes.html")+'">'+t("See lanes","Lihat lorong")+'</a>');
        m.__cat="Lanes"; return m;
      }));
      function refresh(){ layer.clearLayers(); markers.forEach(function(m){ if(active[m.__cat]) layer.addLayer(m); }); }
      refresh();
      map.fitBounds(L.latLngBounds(window.SITES.map(function(s){ return [s.lat,s.lng]; })).pad(0.12));

      var you=null, ring=null;
      findBtn.addEventListener("click",function(){
        if(!navigator.geolocation){ alert(t("Location is not available on this device.","Lokasi tidak tersedia pada peranti ini.")); return; }
        findBtn.disabled=true; findBtn.innerHTML="&#8987; "+t("Locating…","Mencari…");
        navigator.geolocation.getCurrentPosition(function(pos){
          findBtn.disabled=false; findBtn.innerHTML="&#128205; "+t("Find me","Cari saya");
          var la=pos.coords.latitude, ln=pos.coords.longitude;
          if(you)map.removeLayer(you); if(ring)map.removeLayer(ring);
          ring=L.circle([la,ln],{radius:Math.max(pos.coords.accuracy||40,25),color:"#2b6cff",weight:1,fillColor:"#2b6cff",fillOpacity:.12}).addTo(map);
          you=L.marker([la,ln],{icon:L.divIcon({className:"gt-you",html:"<span></span>",iconSize:[18,18],iconAnchor:[9,9]})}).addTo(map);
          var near=null,nd=1e15; window.SITES.forEach(function(s){ var d=haversine(la,ln,s.lat,s.lng); if(d<nd){nd=d;near=s;} });
          var dtxt = nd<1000 ? Math.round(nd)+" m" : (nd/1000).toFixed(1)+" km";
          you.bindPopup('<b>'+t("You are here","Anda di sini")+'</b><br>'+t("Nearest: ","Terdekat: ")+near.name+' ('+dtxt+')<br>'
            +'<a target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&origin='+la+','+ln
            +'&destination='+near.lat+','+near.lng+'&travelmode=walking">'+t("Walk there","Jalan ke sana")+'</a>').openPopup();
          map.setView([la,ln],16);
        },function(){ findBtn.disabled=false; findBtn.innerHTML="&#128205; "+t("Find me","Cari saya");
          alert(t("Could not get your location. Please allow location access.","Tidak dapat lokasi anda. Sila benarkan akses lokasi.")); },
          {enableHighAccuracy:true,timeout:10000});
      });
    }
    function boot(){
      if(L.markerClusterGroup||window.__gtNoCluster){ build(); return; }
      var c1=el("link");c1.rel="stylesheet";c1.href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css";document.head.appendChild(c1);
      var c2=el("link");c2.rel="stylesheet";c2.href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css";document.head.appendChild(c2);
      var s=document.createElement("script"); s.src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js";
      s.onload=build; s.onerror=function(){ window.__gtNoCluster=1; build(); }; document.body.appendChild(s);
    }
    if(window.L){ boot(); return; }
    var css=el("link"); css.rel="stylesheet"; css.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"; document.head.appendChild(css);
    var js=document.createElement("script"); js.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"; js.onload=boot; document.body.appendChild(js);
  }

  /* ---------- Service worker (offline / installable) ---------- */
  function initSW(){
    if(!("serviceWorker" in navigator))return;
    if(location.protocol==="file:")return;
    var base=location.pathname.replace(/[^/]*$/,"");
    if(base.indexOf("/sites/")>-1) base=base.replace(/sites\/$/,"");
    navigator.serviceWorker.register(base+"sw.js").catch(function(){});
  }

  /* ---------- Live Penang weather (Open-Meteo, no API key) ---------- */
  function wxInfo(code){
    var m={0:["☀️","Clear sky","Langit cerah"],1:["🌤️","Mainly clear","Kebanyakannya cerah"],
      2:["⛅","Partly cloudy","Berawan sebahagian"],3:["☁️","Overcast","Mendung"],
      45:["🌫️","Fog","Berkabus"],48:["🌫️","Rime fog","Kabus beku"],
      51:["🌦️","Light drizzle","Gerimis ringan"],53:["🌦️","Drizzle","Gerimis"],55:["🌦️","Heavy drizzle","Gerimis lebat"],
      61:["🌧️","Light rain","Hujan ringan"],63:["🌧️","Rain","Hujan"],65:["🌧️","Heavy rain","Hujan lebat"],
      66:["🌧️","Freezing rain","Hujan beku"],67:["🌧️","Freezing rain","Hujan beku"],
      71:["🌨️","Snow","Salji"],73:["🌨️","Snow","Salji"],75:["🌨️","Heavy snow","Salji lebat"],
      80:["🌦️","Rain showers","Hujan renyai"],81:["🌧️","Showers","Hujan renyai"],82:["⛈️","Violent showers","Hujan sangat lebat"],
      95:["⛈️","Thunderstorm","Ribut petir"],96:["⛈️","Thunderstorm & hail","Ribut petir, hujan batu"],99:["⛈️","Thunderstorm & hail","Ribut petir, hujan batu"]};
    return m[code]||["🌡️","—","—"];
  }
  function initWeather(){
    var map=document.getElementById("leaflet-map"), hero=document.querySelector(".hero");
    if(!map&&!hero)return;
    var host=el("div","weather");
    host.innerHTML='<div class="wx-load">'+t("Loading Penang weather…","Memuatkan cuaca Pulau Pinang…")+'</div>';
    if(map) map.parentNode.insertBefore(host,map);
    else hero.parentNode.insertBefore(host,hero.nextSibling);
    var url="https://api.open-meteo.com/v1/forecast?latitude=5.4149&longitude=100.3327"
      +"&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=Asia%2FKuala_Lumpur";
    fetch(url).then(function(r){ if(!r.ok)throw 0; return r.json(); }).then(function(d){
      var c=d&&d.current; if(!c)throw 0; var w=wxInfo(c.weather_code);
      host.classList.add("ready");
      host.innerHTML='<div class="wx-emoji">'+w[0]+'</div>'
        +'<div class="wx-main"><div class="wx-temp">'+Math.round(c.temperature_2m)+'°C</div>'
        +'<div class="wx-cond">'+(LANG==="ms"?w[2]:w[1])+'</div>'
        +'<div class="wx-place">📍 George Town, '+t("Penang","Pulau Pinang")+'</div></div>'
        +'<div class="wx-meta">'
          +'<span>'+t("Feels","Terasa")+' '+Math.round(c.apparent_temperature)+'°</span>'
          +'<span>💧 '+Math.round(c.relative_humidity_2m)+'%</span>'
          +'<span>🌬️ '+Math.round(c.wind_speed_10m)+' km/h</span></div>';
      // 3. Rainy-day suggestions — reuse the weather to point at indoor sites
      var rainy=[51,53,55,56,57,61,63,65,66,67,80,81,82,95,96,99].indexOf(c.weather_code)>-1;
      if(rainy && window.SITES){
        var indoor=["penang-state-museum","cheong-fatt-tze-mansion","pinang-peranakan-mansion","sun-yat-sen-museum","khoo-kongsi"];
        var links=indoor.map(function(id){ var s=byId(id); return s?'<a href="'+pfx()+siteUrl(s)+'">'+s.name+'</a>':''; }).filter(Boolean).slice(0,3).join(" · ");
        if(links){ var tip=el("div","wx-tip"); tip.innerHTML="☔ "+t("Rainy now — great indoor picks: ","Hujan sekarang — pilihan dalam: ")+links; host.appendChild(tip); }
      }
    }).catch(function(){ host.remove(); });
  }

  /* Longer descriptions shown when a food card is opened (card keeps the short text) */
  var FOOD_LONG={
    "Char Kway Teow":["Char Kway Teow is Penang's most iconic hawker dish — flat rice noodles seared over a roaring flame to capture 'wok hei', the prized smoky aroma. It's tossed with prawns, cockles, bean sprouts, chives and egg, and traditionally cooked one plate at a time so each portion gets the cook's full attention.","Char Kway Teow ialah hidangan penjaja paling ikonik di Pulau Pinang — mi beras leper digoreng atas api membara untuk menangkap 'wok hei', aroma berbara yang dihargai. Ia digaul bersama udang, kerang, taugeh, kucai dan telur, dan dimasak sepinggan demi sepinggan."],
    "Asam Laksa":["A bold, tangy noodle soup built on flaked mackerel and tamarind, brightened with lemongrass, ginger flower, mint, pineapple and cucumber. A spoonful of thick prawn paste (hae ko) is stirred in at the end for a sweet-savoury finish that makes it one of the world's most talked-about soups.","Sup mi yang berani dan masam berasaskan ikan kembung dan asam jawa, disegarkan dengan serai, bunga kantan, pudina, nanas dan timun. Sesudu hae ko dikacau di akhir untuk rasa manis-masin yang menjadikannya antara sup paling terkenal di dunia."],
    "Nasi Kandar":["Nasi kandar began with Indian-Muslim porters who carried pots of rice and curry on a 'kandar' pole. Today it's a feast of steamed rice topped with a mix of curries poured together ('banjir'), fried chicken, squid, okra and more — every stall guarding its own recipe.","Nasi kandar bermula dengan penjaja India-Muslim yang memikul periuk nasi dan kari pada pengandar. Kini ia jamuan nasi kukus dengan campuran kari yang dicurah bersama ('banjir'), ayam goreng, sotong, bendi dan banyak lagi — setiap gerai menyimpan resipinya sendiri."],
    "Nyonya Kuih":["Nyonya kuih are the colourful bite-sized sweets of the Peranakan community, made by hand from rice flour, coconut and pandan. Their jewel-like colours often come from nature — blue from butterfly-pea flowers, green from pandan — and each has its own texture, from soft and chewy to layered and steamed.","Kuih Nyonya ialah kuih berwarna-warni bersaiz kecil masyarakat Peranakan, dibuat dengan tangan daripada tepung beras, kelapa dan pandan. Warnanya datang daripada alam — biru daripada bunga telang, hijau daripada pandan — dan setiap satu punya teksturnya sendiri."],
    "Penang Hokkien Mee":["Known locally as 'prawn noodles', Penang Hokkien Mee is a deep, spicy soup simmered for hours from prawn shells and pork bones. It's served with yellow noodles and rice vermicelli, topped with prawns, pork slices, egg and a dollop of fiery sambal.","Dikenali sebagai 'mi udang', Hokkien Mee Pulau Pinang ialah sup pekat dan pedas yang direneh berjam-jam daripada kepala udang dan tulang. Ia dihidang dengan mi kuning dan bihun, ditambah udang, hirisan daging, telur dan sesudu sambal."],
    "Cendol":["Cendol is Penang's favourite way to beat the tropical heat: finely shaved ice drenched in creamy coconut milk and dark palm-sugar syrup. Green pandan-flavoured rice-flour 'worms' and sweet red beans hide beneath, making every spoonful cool, sweet and fragrant.","Cendol ialah cara kegemaran Pulau Pinang melawan cuaca panas: ais serut halus dituang santan pekat dan sirap gula melaka. Cendol hijau berperisa pandan dan kacang merah manis tersembunyi di bawah, menjadikan setiap suapan sejuk, manis dan wangi."],
    "Pasembur":["Pasembur turns a plate of odds and ends into something special: crispy fritters, prawn cakes, boiled potato, cucumber, tofu and sometimes cuttlefish, all cut up and drowned in a thick, sweet-and-spicy nutty sauce.","Pasembur mengubah pinggan pelbagai bahan menjadi sesuatu istimewa: cucur rangup, kek udang, kentang rebus, timun, tauhu dan kadang sotong, dihiris dan disiram sos kacang yang pekat, manis dan pedas."],
    "Roti Canai":["Roti canai is a flaky, pan-fried flatbread of Indian-Muslim origin, its dough stretched paper-thin, folded and griddled until crisp outside and soft within. Eaten any time of day, it's usually torn by hand and dipped into dhal or curry.","Roti canai ialah roti leper goreng berlapis berasal India-Muslim, doughnya ditarik nipis, dilipat dan digoreng sehingga rangup di luar dan lembut di dalam. Ia biasanya dikoyak dengan tangan dan dicicah dhal atau kari."],
    "Chee Cheong Fun":["Chee cheong fun are silky steamed rice-noodle rolls. In Penang they're served the local way — smothered in a sweet, dark prawn-paste sauce (hae ko) with chilli, sesame seeds and fried shallots — quite different from the dim-sum version.","Chee cheong fun ialah gulung mi beras kukus yang lembut. Di Pulau Pinang ia dihidang cara tempatan — disiram sos hae ko manis dan gelap dengan cili, bijan dan bawang goreng — berbeza daripada versi dim sum."],
    "Apam Balik":["Apam balik is a folded griddle pancake sold from roadside carts. It comes two ways — thin and lacy-crisp, or thick and fluffy — both filled with crushed peanuts, sugar and buttery sweetcorn before being folded over.","Apam balik ialah lempeng lipat yang dijual dari gerai tepi jalan. Ia hadir dua cara — nipis dan rangup, atau tebal dan gebu — kedua-duanya diisi kacang tumbuk, gula dan jagung manis sebelum dilipat."],
    "Loh Bak":["Loh bak is a Penang Hokkien snack of pork seasoned with five-spice powder, wrapped in beancurd skin and deep-fried into crisp rolls. It's served as a platter with prawn fritters, century egg and other bites, plus a starchy dipping sauce and chilli.","Loh bak ialah snek Hokkien Pulau Pinang; daging berperisa lima rempah dibalut kulit tauhu dan digoreng menjadi gulung rangup. Ia dihidang sebagai sepinggan dengan cucur udang, telur pindang dan lain-lain, serta sos cicah dan cili."],
    "Popiah":["Popiah is a fresh, un-fried spring roll — a soft wheat skin wrapped around slow-cooked shredded turnip, with egg, lettuce, bean sprouts, ground peanuts and a smear of sweet sauce. Making the paper-thin skins is a craft in itself.","Popiah ialah popia basah yang tidak digoreng — kulit gandum lembut membalut sengkuang masak perlahan, dengan telur, salad, taugeh, kacang tumbuk dan sapuan sos manis. Membuat kulit nipis itu satu seni tersendiri."],
    "Oyster Omelette":["Oyster omelette (or 'oh chien') fries plump oysters into a batter of egg and sweet-potato starch until the edges turn crisp and lacy while the centre stays soft. A squeeze of chilli-garlic sauce cuts through the richness.","Oyster omelette ('oh chien') menggoreng tiram gemuk dalam adunan telur dan tepung keledek sehingga tepinya rangup manakala tengahnya lembut. Sos cili-bawang putih memberi keseimbangan rasa."],
    "Mee Goreng":["Penang-style mee goreng is an Indian-Muslim stir-fry of yellow noodles tossed with potato, tofu, egg and bean sprouts in a tangy tomato-chilli sauce. It's sweet, spicy and a little smoky — a hawker-stall staple.","Mee goreng gaya Pulau Pinang ialah gorengan India-Muslim; mi kuning digaul dengan kentang, tauhu, telur dan taugeh dalam sos tomato-cili. Rasanya manis, pedas dan sedikit berbara."],
    "Kuih Talam":["Kuih talam is a traditional two-layer steamed cake: a sweet green pandan base topped with a smooth, faintly salty coconut-cream layer. The contrast of sweet and salty, and the gentle wobble of the set custard, are half the pleasure.","Kuih talam ialah kuih kukus dua lapisan tradisional: dasar pandan hijau manis dengan lapisan santan yang licin dan sedikit masin. Kontras manis-masin dan teksturnya menjadi separuh keseronokan."],
    "Nasi Lemak":["Often called Malaysia's national dish, nasi lemak is fragrant rice steamed with coconut milk and pandan, served with fiery sambal, crispy anchovies, roasted peanuts, boiled egg and cucumber — a humble breakfast people happily eat any time of day.","Sering digelar hidangan kebangsaan Malaysia, nasi lemak ialah nasi wangi yang dikukus dengan santan dan pandan, dihidang dengan sambal pedas, ikan bilis rangup, kacang, telur rebus dan timun."],
    "Pandan Cake":["Pandan cake is a light, airy chiffon sponge coloured a soft green and perfumed by pandan leaves, the 'vanilla of Southeast Asia'. Its cloud-like texture and gentle fragrance make it a favourite teatime treat.","Kek pandan ialah kek span chiffon yang ringan dan gebu, berwarna hijau lembut dan wangi daun pandan, 'vanila Asia Tenggara'. Teksturnya seperti awan dan wanginya menjadikannya kegemaran waktu petang."],
    "Hainan Chicken Rice":["Hainanese chicken rice features chicken gently poached until silky, served with rice cooked in the same fragrant chicken stock with ginger and garlic. It comes with chilli, ginger and dark-soy sauces and a bowl of clear soup — simple, comforting and deeply satisfying.","Nasi ayam Hainan menampilkan ayam yang direbus lembut, dihidang dengan nasi yang dimasak dalam sup ayam wangi bersama halia dan bawang putih. Ia disertai sos cili, halia dan kicap serta semangkuk sup jernih."],
    "Tau Sar Piah":["Tau sar piah are small, flaky pastries traditionally filled with sweet or savoury mung-bean paste. A speciality of Penang bakeries, they're a classic edible souvenir, sold in neat paper-wrapped stacks.","Tau sar piah ialah pastri kecil berlapis yang diisi inti kacang hijau manis atau masin. Istimewa dari kedai roti Pulau Pinang, ia cenderahati klasik yang boleh dimakan."],
    "Rojak":["Penang rojak is a bold fruit-and-vegetable salad — pineapple, guava, cucumber and turnip — tossed in a thick, funky dressing of dark prawn paste, tamarind, sugar and chilli, then showered with crushed peanuts. Sweet, sour, salty and spicy all at once.","Rojak Pulau Pinang ialah salad buah dan sayur yang berani — nanas, jambu, timun dan sengkuang — digaul dengan sos belacan pekat, asam jawa, gula dan cili, kemudian ditaburi kacang tumbuk."]
  };
  var WPBASE="https://en.wikipedia.org/wiki/";
  var FOOD_WIKI={
    "Char Kway Teow":"Char_kway_teow","Asam Laksa":"Asam_laksa","Nasi Kandar":"Nasi_kandar",
    "Nyonya Kuih":"Kuih","Penang Hokkien Mee":"Hokkien_mee","Cendol":"Cendol","Pasembur":"Pasembur",
    "Roti Canai":"Roti_canai","Chee Cheong Fun":"Chee_cheong_fun","Apam Balik":"Apam_balik",
    "Loh Bak":"Ngo_hiang","Popiah":"Popiah","Oyster Omelette":"Oyster_omelette","Mee Goreng":"Mee_goreng",
    "Kuih Talam":"Kuih","Nasi Lemak":"Nasi_lemak","Pandan Cake":"Pandan_cake",
    "Hainan Chicken Rice":"Hainanese_chicken_rice","Tau Sar Piah":"Tau_sar_pia","Rojak":"Rojak"
  };

  /* ---------- Info modal (food dishes, locations, games) ---------- */
  function initInfoModal(){
    var triggers=[].slice.call(document.querySelectorAll('[data-modal="info"]')); if(!triggers.length)return;
    var ov=el("div","info-modal");
    ov.innerHTML='<div class="im-card"><button class="im-x" aria-label="'+t("Close","Tutup")+'">&#10005;</button>'
      +'<div class="im-visual"></div><div class="im-body"><h2 class="im-title"></h2>'
      +'<div class="im-fact"><span class="im-fact-label">'+t("Cultural Note","Nota Budaya")+'</span><p class="im-fact-text"></p></div>'
      +'<p class="im-text"></p><a class="im-wiki" target="_blank" rel="noopener"></a></div></div>';
    document.body.appendChild(ov);
    var vis=ov.querySelector(".im-visual"), ttl=ov.querySelector(".im-title"), txt=ov.querySelector(".im-text"),
        factBox=ov.querySelector(".im-fact"), factTxt=ov.querySelector(".im-fact-text"), wiki=ov.querySelector(".im-wiki");
    function open(tr){
      ttl.textContent=tr.getAttribute("data-title")||"";
      var _fl=FOOD_LONG[tr.getAttribute("data-title")];
      txt.textContent=(_fl ? _fl[LANG==="ms"?1:0] : tr.getAttribute("data-text")) || "";
      var _art=FOOD_WIKI[tr.getAttribute("data-title")];
      if(_art){ wiki.href=WPBASE+_art; wiki.innerHTML="&#128214; "+t("Read the full story on Wikipedia","Baca kisah penuh di Wikipedia")+" &rarr;"; wiki.style.display=""; } else wiki.style.display="none";
      var fact=tr.getAttribute("data-fact");
      if(fact){ factTxt.textContent=fact; factBox.style.display=""; } else factBox.style.display="none";
      vis.innerHTML=""; vis.classList.remove("icon-only");
      var img=tr.getAttribute("data-img"), icon=tr.getAttribute("data-icon"), svg=tr.querySelector(".card-visual");
      if(img){ var im=el("img"); im.src=img; im.alt=ttl.textContent; im.onerror=function(){ this.remove(); vis.classList.add("icon-only"); }; vis.appendChild(im); }
      else if(svg){ vis.appendChild(svg.cloneNode(true)); }
      else if(icon){ vis.innerHTML='<span class="im-icon">'+icon+'</span>'; vis.classList.add("icon-only"); }
      else vis.classList.add("icon-only");
      ov.classList.add("open"); document.body.style.overflow="hidden";
    }
    function close(){ ov.classList.remove("open"); document.body.style.overflow=""; }
    triggers.forEach(function(tr){
      tr.addEventListener("click",function(){ open(tr); });
      tr.addEventListener("keydown",function(e){ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); open(tr); } });
    });
    ov.addEventListener("click",function(e){ if(e.target===ov||e.target.classList.contains("im-x"))close(); });
    document.addEventListener("keydown",function(e){ if(e.key==="Escape"&&ov.classList.contains("open"))close(); });
  }

  /* ---------- Food page: category filters ---------- */
  var FOOD_MODERN={"Hainan Chicken Rice":1,"Pandan Cake":1,"Mee Goreng":1};
  function initFoodFilters(){
    var btns=[].slice.call(document.querySelectorAll(".food-filter")); if(!btns.length)return;
    var cards=[].slice.call(document.querySelectorAll(".food-card"));
    // inject a "Traditional" filter (heritage dishes only — excludes the more modern ones)
    var allBtn=btns.filter(function(b){return b.getAttribute("data-filter")==="all";})[0];
    if(allBtn){ var trad=el("button","food-filter"); trad.type="button"; trad.setAttribute("data-filter","traditional");
      trad.textContent=t("Traditional","Tradisional");
      allBtn.parentNode.insertBefore(trad, allBtn.nextSibling); btns.splice(1,0,trad); }
    btns.forEach(function(b){ b.addEventListener("click",function(){
      btns.forEach(function(x){ x.classList.remove("active"); }); b.classList.add("active");
      var f=b.getAttribute("data-filter");
      cards.forEach(function(c){
        var show = f==="all" ? true : f==="traditional" ? !FOOD_MODERN[c.getAttribute("data-title")] : c.getAttribute("data-cat")===f;
        c.style.display = show ? "" : "none";
      });
    }); });
  }

  /* ---------- Dance page: "Feel the rhythm" beat player (Web Audio, no files) ---------- */
  /* ---------- Dance page: "Watch on YouTube" link per dance ---------- */
  function initDanceWatch(){
    var cards=[].slice.call(document.querySelectorAll(".dance-card")); if(!cards.length)return;
    cards.forEach(function(card){
      var h=card.querySelector("h3"); if(!h||card.querySelector(".dance-watch"))return;
      var name=(h.textContent||"").trim();
      var a=el("a","dance-watch"); a.href="https://www.youtube.com/results?search_query="+encodeURIComponent(name+" traditional dance Malaysia");
      a.target="_blank"; a.rel="noopener"; a.innerHTML="&#9654;&#65039; "+t("Watch on YouTube","Tonton di YouTube");
      card.appendChild(a);
    });
  }
  function initDanceRhythm(){
    var cards=[].slice.call(document.querySelectorAll(".dance-card")); if(!cards.length)return;
    var AC=window.AudioContext||window.webkitAudioContext; if(!AC)return;
    var ctx=null, current=null;
    function tick(freq,vol){ if(!ctx)return; var o=ctx.createOscillator(), g=ctx.createGain();
      o.type="sine"; o.frequency.value=freq; o.connect(g); g.connect(ctx.destination);
      var t=ctx.currentTime; g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(0.0001,t+0.13);
      o.start(t); o.stop(t+0.14); }
    function stop(){ if(!current)return; clearInterval(current.timer);
      current.btn.classList.remove("playing"); current.btn.querySelector(".rb-ic").innerHTML="&#9654;";
      current.dots.forEach(function(d){ d.classList.remove("on"); }); current=null; }
    cards.forEach(function(card){
      var btn=card.querySelector(".rhythm-btn"); if(!btn)return;
      var dots=[].slice.call(card.querySelectorAll(".beat-dots i"));
      var bpm=parseInt(btn.getAttribute("data-bpm"),10)||100;
      btn.addEventListener("click",function(){
        if(current&&current.btn===btn){ stop(); return; }
        stop();
        try{ if(!ctx)ctx=new AC(); if(ctx.state==="suspended")ctx.resume(); }catch(e){ return; }
        var beat=0;
        btn.classList.add("playing"); btn.querySelector(".rb-ic").innerHTML="&#10074;&#10074;";
        function step(){ var i=beat%dots.length, down=(i===0);
          dots.forEach(function(d,k){ d.classList.toggle("on", k===i); });
          tick(down?880:560, down?0.16:0.08); beat++; }
        step(); var timer=setInterval(step, 60000/bpm);
        current={btn:btn,timer:timer,dots:dots};
      });
    });
    window.addEventListener("pagehide",stop);
  }

  /* ============================================================
     Visitor UX feature pack
     ============================================================ */
  function pfx(){ return location.pathname.indexOf("/sites/")>-1 ? "../" : ""; }
  function currentSiteId(){ var m=location.pathname.match(/\/sites\/([^\/]+?)(?:-bm)?\.html$/); return m?m[1]:null; }

  /* ---- 1. Favourites + "My Visit" walking route ---- */
  var visitBtn=null, visitPanel=null;
  function favGet(){ try{ return JSON.parse(lsGet("gt-favs")||"[]"); }catch(e){ return []; } }
  function favSet(a){ lsSet("gt-favs", JSON.stringify(a)); updateVisitBtn(); }
  function favHas(id){ return favGet().indexOf(id)>-1; }
  function favToggle(id){ var a=favGet(), i=a.indexOf(id); if(i>-1)a.splice(i,1); else a.push(id); favSet(a); return i<0; }
  function updateVisitBtn(){ if(!visitBtn)return; var n=favGet().length; visitBtn.innerHTML="🗺️ "+t("My Visit","Lawatan")+(n?' <span class="vp-count">'+n+"</span>":""); }
  function syncStars(){ [].slice.call(document.querySelectorAll(".fav-star,.btn-fav")).forEach(function(b){ var id=b.getAttribute("data-id"); if(!id)return; var on=favHas(id); b.classList.toggle("on",on);
    if(b.classList.contains("fav-star")) b.innerHTML=on?"★":"☆"; else b.innerHTML=(on?"★ ":"☆ ")+t("Save to My Visit","Simpan ke Lawatan"); }); }
  function initFavourites(){
    if(!window.SITES)return;
    visitBtn=el("button","visit-fab"); visitBtn.type="button"; document.body.appendChild(visitBtn);
    visitPanel=el("div","visit-panel");
    visitPanel.innerHTML='<div class="vp-head"><b>🗺️ '+t("My Visit","Lawatan Saya")+'</b><button class="vp-x" type="button" aria-label="'+t("Close","Tutup")+'">✕</button></div><div class="vp-list"></div><div class="vp-foot"></div>';
    document.body.appendChild(visitPanel);
    visitBtn.addEventListener("click",function(){ renderVisit(); visitPanel.classList.toggle("open"); });
    visitPanel.querySelector(".vp-x").addEventListener("click",function(){ visitPanel.classList.remove("open"); });
    updateVisitBtn();
    [].slice.call(document.querySelectorAll("a.site[href*='sites/']")).forEach(function(a){
      var m=a.getAttribute("href").match(/sites\/([^\/]+?)(?:-bm)?\.html/); if(!m)return; var id=m[1];
      var top=a.querySelector(".top")||a; top.style.position="relative";
      var b=el("button","fav-star"+(favHas(id)?" on":""),favHas(id)?"★":"☆"); b.type="button"; b.setAttribute("data-id",id); b.title=t("Save to My Visit","Simpan ke Lawatan Saya");
      b.addEventListener("click",function(e){ e.preventDefault(); e.stopPropagation(); var on=favToggle(id); b.classList.toggle("on",on); b.innerHTML=on?"★":"☆"; }); top.appendChild(b);
    });
    var acts=document.querySelector(".site-hero .site-actions"), sid=currentSiteId();
    if(acts&&sid&&byId(sid)){ var fb=el("button","btn-fav"+(favHas(sid)?" on":""),(favHas(sid)?"★ ":"☆ ")+t("Save to My Visit","Simpan ke Lawatan")); fb.type="button"; fb.setAttribute("data-id",sid);
      fb.addEventListener("click",function(){ var on=favToggle(sid); fb.classList.toggle("on",on); fb.innerHTML=(on?"★ ":"☆ ")+t("Save to My Visit","Simpan ke Lawatan"); }); acts.appendChild(fb); }
  }
  function renderVisit(){
    var favs=favGet(), list=visitPanel.querySelector(".vp-list"), foot=visitPanel.querySelector(".vp-foot");
    if(!favs.length){ list.innerHTML='<p class="vp-empty">'+t("No sites saved yet. Tap ☆ on any heritage site to add it to your visit.","Belum ada tapak. Ketik ☆ pada mana-mana tapak untuk menambahnya ke lawatan anda.")+"</p>"; foot.innerHTML=""; return; }
    list.innerHTML=favs.map(function(id){ var s=byId(id); if(!s)return ""; return '<div class="vp-item"><a href="'+pfx()+siteUrl(s)+'">'+s.name+'</a><button class="vp-rm" type="button" data-id="'+id+'" aria-label="'+t("Remove","Buang")+'">✕</button></div>'; }).join("");
    var pts=favs.map(function(id){ var s=byId(id); return s?s.lat+","+s.lng:null; }).filter(Boolean);
    var dest=pts[pts.length-1], way=pts.slice(0,-1).join("|");
    var url="https://www.google.com/maps/dir/?api=1&travelmode=walking&destination="+dest+(way?"&waypoints="+way:"");
    foot.innerHTML='<a class="vp-route" target="_blank" rel="noopener" href="'+url+'">🧭 '+t("Walking route in Google Maps","Laluan berjalan di Google Maps")+'</a><button class="vp-clear" type="button">'+t("Clear all","Kosongkan")+"</button>";
    list.querySelectorAll(".vp-rm").forEach(function(b){ b.addEventListener("click",function(){ favToggle(b.getAttribute("data-id")); renderVisit(); syncStars(); }); });
    foot.querySelector(".vp-clear").addEventListener("click",function(){ favSet([]); renderVisit(); syncStars(); });
  }

  /* ---- 2. Visitor info + Open-now (site pages) ---- */
  var VISIT={
    "cheong-fatt-tze-mansion":{o:9.5,c:17,fe:"RM25 (guided tour)",fm:"RM25 (lawatan berpandu)"},
    "khoo-kongsi":{o:9,c:17,fe:"RM15",fm:"RM15"},"cheah-kongsi":{o:9,c:17,fe:"RM10",fm:"RM10"},
    "goddess-of-mercy-temple":{o:6,c:19,fe:"Free",fm:"Percuma"},"han-jiang-ancestral-temple":{o:9,c:17,fe:"Free",fm:"Percuma"},
    "chew-jetty":{o:8,c:19,fe:"Free",fm:"Percuma"},"pinang-peranakan-mansion":{o:9.5,c:17,fe:"RM25",fm:"RM25"},
    "sun-yat-sen-museum":{o:9,c:17,fe:"RM5",fm:"RM5"},"sri-mahamariamman-temple":{o:6,c:21,fe:"Free",fm:"Percuma"},
    "little-india":{o:0,c:24,fe:"Free",fm:"Percuma"},"nagore-dargha-sheriff":{o:9,c:18,fe:"Free",fm:"Percuma"},
    "kapitan-keling-mosque":{o:9,c:17,fe:"Free (outside prayer times)",fm:"Percuma (luar waktu solat)"},
    "acheen-street-malay-mosque":{o:9,c:17,fe:"Free",fm:"Percuma"},"fort-cornwallis":{o:9,c:19,fe:"RM20",fm:"RM20"},
    "st-georges-church":{o:9,c:17,fe:"Free",fm:"Percuma"},"penang-state-museum":{o:9,c:17,fe:"RM1",fm:"RM1"},
    "street-art-trail":{o:0,c:24,fe:"Free",fm:"Percuma"}
  };
  function fmtH(h){ var hh=Math.floor(h), mm=Math.round((h-hh)*60), ap=hh<12?"am":"pm", d=hh%12; if(d===0)d=12; return d+(mm?":"+(mm<10?"0"+mm:mm):"")+" "+ap; }
  function initVisitInfo(){
    var sid=currentSiteId(); if(!sid)return; var v=VISIT[sid], s=byId(sid), main=document.querySelector(".site-main"); if(!v||!s||!main)return;
    var now=new Date(), h=now.getHours()+now.getMinutes()/60, always=(v.o===0&&v.c===24), open=always||(h>=v.o&&h<v.c);
    var hrs=always?t("Open area — always accessible","Kawasan terbuka — sentiasa boleh dilawati"):fmtH(v.o)+" – "+fmtH(v.c);
    var badge=open?'<span class="vi-badge open">● '+t("Open now","Buka sekarang")+"</span>":'<span class="vi-badge closed">● '+t("Closed now","Tutup sekarang")+"</span>";
    var box=el("section","visit-info");
    box.innerHTML='<h2>'+t("Plan your visit","Rancang lawatan anda")+" "+badge+"</h2><div class=\"vi-grid\">"
      +"<div><b>"+t("Hours","Waktu")+"</b><span>"+hrs+"</span></div>"
      +"<div><b>"+t("Entry","Masuk")+"</b><span>"+t(v.fe,v.fm)+"</span></div>"
      +'<div><b>'+t("Getting there","Cara ke sana")+'</b><span><a target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination='+s.lat+","+s.lng+'&travelmode=walking">'+t("Walking directions","Arah berjalan")+"</a></span></div></div>"
      +'<p class="vi-note">'+t("Hours and fees are a guide only (based on your device time) — please check official sources before you go.","Waktu dan bayaran sebagai panduan sahaja (mengikut masa peranti anda) — sila semak sumber rasmi sebelum pergi.")+"</p>";
    var qf=main.querySelector(".quickfacts"); if(qf)qf.parentNode.insertBefore(box,qf.nextSibling); else main.insertBefore(box,main.firstChild);
  }

  /* ---- 4. Sort sites by nearest ---- */
  function initNearMe(){
    var cards=[].slice.call(document.querySelectorAll("a.site[href*='sites/']")); if(cards.length<3||!window.SITES)return;
    var grid=cards[0].parentNode;
    var bar=el("div","nearme-bar"), btn=el("button","nearme-btn","📍 "+t("Sort by nearest","Susun ikut terdekat")); btn.type="button"; bar.appendChild(btn);
    grid.parentNode.insertBefore(bar,grid);
    btn.addEventListener("click",function(){
      if(!navigator.geolocation){ alert(t("Location is not available on this device.","Lokasi tidak tersedia.")); return; }
      btn.disabled=true; btn.textContent="⏳ "+t("Locating…","Mencari…");
      navigator.geolocation.getCurrentPosition(function(pos){
        var la=pos.coords.latitude, ln=pos.coords.longitude;
        cards.map(function(a){ var m=a.getAttribute("href").match(/sites\/([^\/]+?)(?:-bm)?\.html/), s=m?byId(m[1]):null; return {a:a,d:s?haversine(la,ln,s.lat,s.lng):1e12}; })
          .sort(function(x,y){return x.d-y.d;})
          .forEach(function(o){ grid.appendChild(o.a);
            var dtxt=o.d<1000?Math.round(o.d)+" m":(o.d/1000).toFixed(1)+" km", mins=Math.max(1,Math.round(o.d/80));
            var badge=o.a.querySelector(".dist-badge"); if(!badge){ badge=el("span","dist-badge"); (o.a.querySelector(".top-inner")||o.a).appendChild(badge); }
            badge.textContent="📍 "+dtxt+" · "+mins+" "+t("min walk","min jalan"); });
        btn.disabled=false; btn.textContent="✓ "+t("Nearest first","Terdekat dahulu");
      },function(){ btn.disabled=false; btn.textContent="📍 "+t("Sort by nearest","Susun ikut terdekat"); alert(t("Could not get your location. Please allow location access.","Tidak dapat lokasi anda.")); },{enableHighAccuracy:true,timeout:10000});
    });
  }

  /* ---- 5. Accessibility toolbar (text size + contrast) ---- */
  function getScale(){ var v=parseFloat(lsGet("gt-fontscale")||"1"); return isNaN(v)?1:v; }
  function applyFont(v){ document.documentElement.style.fontSize=(v*100)+"%"; }
  function setScale(v){ v=Math.max(0.9,Math.min(1.4,Math.round(v*10)/10)); lsSet("gt-fontscale",String(v)); applyFont(v); }
  function initA11y(){
    applyFont(getScale()); if(lsGet("gt-contrast")==="1")root.classList.add("hc");
    var body=document.querySelector(".set-body"); if(!body)return;
    var box=el("div","set-a11y");
    box.innerHTML="<h4>"+t("Accessibility","Kebolehcapaian")+"</h4><div class=\"set-opts a11y-size\"><button type=\"button\" class=\"a11y-dec\">A−</button><span class=\"a11y-val\"></span><button type=\"button\" class=\"a11y-inc\">A+</button></div><div class=\"set-opts\"><label class=\"a11y-hc\"><input type=\"checkbox\" class=\"hc-check\"> "+t("High contrast","Kontras tinggi")+"</label></div>";
    body.appendChild(box);
    var val=box.querySelector(".a11y-val"); function show(){ val.textContent=Math.round(getScale()*100)+"%"; } show();
    box.querySelector(".a11y-dec").addEventListener("click",function(){ setScale(getScale()-0.1); show(); });
    box.querySelector(".a11y-inc").addEventListener("click",function(){ setScale(getScale()+0.1); show(); });
    var hc=box.querySelector(".hc-check"); hc.checked=lsGet("gt-contrast")==="1";
    hc.addEventListener("change",function(){ root.classList.toggle("hc",hc.checked); lsSet("gt-contrast",hc.checked?"1":"0"); });
  }

  /* ---- 6. Share + QR (site pages) ---- */
  var qrLoading=false;
  function loadQR(cb){ if(window.QRCode){ cb(true); return; } if(qrLoading){ setTimeout(function(){cb(!!window.QRCode);},500); return; } qrLoading=true;
    var s=document.createElement("script"); s.src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"; s.onload=function(){cb(true);}; s.onerror=function(){cb(false);}; document.body.appendChild(s); }
  function initShareQR(){
    var acts=document.querySelector(".site-hero .site-actions"); if(!acts)return; var url=location.href.split("#")[0];
    var sb=el("button","btn-share","🔗 "+t("Share","Kongsi")); sb.type="button";
    sb.addEventListener("click",function(){ if(navigator.share){ navigator.share({title:document.title,url:url}).catch(function(){}); }
      else if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(url).then(function(){ flashBtn(sb,"✓ "+t("Link copied","Pautan disalin")); },function(){}); } });
    acts.appendChild(sb);
    var qb=el("button","btn-qr","🔳 "+t("QR code","Kod QR")); qb.type="button";
    var pop=el("div","qr-pop"); pop.innerHTML='<div class="qr-inner"><div class="qr-box"></div><small>'+t("Scan to open this page","Imbas untuk buka halaman ini")+"</small></div>"; document.body.appendChild(pop);
    qb.addEventListener("click",function(){ if(pop.classList.contains("open")){ pop.classList.remove("open"); return; } pop.classList.add("open");
      var box=pop.querySelector(".qr-box"); if(box.getAttribute("data-done"))return;
      loadQR(function(ok){ if(ok&&window.QRCode){ box.innerHTML=""; new window.QRCode(box,{text:url,width:190,height:190,colorDark:"#0f1f66",colorLight:"#ffffff"}); box.setAttribute("data-done","1"); }
        else box.innerHTML='<span class="qr-fail">'+t("QR code needs an internet connection.","Kod QR memerlukan sambungan internet.")+"</span>"; }); });
    acts.appendChild(qb);
    pop.addEventListener("click",function(e){ if(e.target===pop)pop.classList.remove("open"); });
    document.addEventListener("keydown",function(e){ if(e.key==="Escape")pop.classList.remove("open"); });
  }

  /* ---- 7. On-this-page table of contents (site story pages) ---- */
  function initTOC(){
    var main=document.querySelector(".site-main"); if(!main)return;
    var hs=[].slice.call(main.querySelectorAll("h2")); if(hs.length<3)return;
    hs.forEach(function(h,i){ if(!h.id)h.id="sec-"+i; });
    var toc=el("nav","page-toc"); toc.setAttribute("aria-label",t("On this page","Di halaman ini"));
    toc.innerHTML='<b class="toc-title">'+t("On this page","Di halaman ini")+"</b>"+hs.map(function(h){ return '<a href="#'+h.id+'">'+(h.textContent||"").replace(/[&<>]/g,"")+"</a>"; }).join("");
    document.body.appendChild(toc);
    var links=[].slice.call(toc.querySelectorAll("a"));
    if("IntersectionObserver" in window){ var io=new IntersectionObserver(function(en){ en.forEach(function(x){ if(x.isIntersecting){ links.forEach(function(a){ a.classList.toggle("cur",a.getAttribute("href")==="#"+x.target.id); }); } }); },{rootMargin:"0px 0px -72% 0px"}); hs.forEach(function(h){io.observe(h);}); }
  }

  /* ---- 8. Voice search ---- */
  function initVoiceSearch(){
    var input=document.getElementById("site-search"); if(!input)return;
    var SR=window.SpeechRecognition||window.webkitSpeechRecognition; if(!SR)return;
    var mic=el("button","voice-btn","🎤"); mic.type="button"; mic.title=t("Search by voice","Cari dengan suara");
    input.parentNode.appendChild(mic);
    var rec=new SR(); rec.lang=LANG==="ms"?"ms-MY":"en-US"; rec.interimResults=false; rec.maxAlternatives=1;
    mic.addEventListener("click",function(){ try{ mic.classList.add("listening"); rec.start(); }catch(e){} });
    rec.onresult=function(e){ input.value=e.results[0][0].transcript; input.dispatchEvent(new Event("input",{bubbles:true})); };
    rec.onend=function(){ mic.classList.remove("listening"); };
    rec.onerror=function(){ mic.classList.remove("listening"); };
  }

  /* ---- 9. Recently viewed ---- */
  function recentGet(){ try{ return JSON.parse(lsGet("gt-recent")||"[]"); }catch(e){ return []; } }
  function initRecent(){
    var sid=currentSiteId();
    if(sid&&byId(sid)){ var a=recentGet().filter(function(x){return x!==sid;}); a.unshift(sid); lsSet("gt-recent",JSON.stringify(a.slice(0,6))); }
    if(!window.SITES)return;
    var recent=recentGet().filter(function(id){ return byId(id)&&id!==sid; }); if(recent.length<2)return;
    var strip=el("section","recent-strip");
    strip.innerHTML="<h2>"+t("Recently viewed","Baru dilihat")+'</h2><div class="recent-row">'
      +recent.slice(0,6).map(function(id){ var s=byId(id); return '<a href="'+pfx()+siteUrl(s)+'"><img src="'+pfx()+"assets/img/"+id+'.jpg" alt="" loading="lazy"><span>'+s.name+"</span></a>"; }).join("")+"</div>";
    var firstCard=document.querySelector("a.site[href*='sites/']");
    if(firstCard){ var g=firstCard.parentNode; g.parentNode.insertBefore(strip,g); }
    else { var pn=document.querySelector(".site-main .prevnext"); if(pn)pn.parentNode.insertBefore(strip,pn); }
  }

  /* ---- 10. Print / Save-as-PDF route ---- */
  function initPrint(){
    var rl=document.querySelector(".route-list"); if(!rl)return;
    var b=el("button","print-btn","🖨️ "+t("Print / Save as PDF","Cetak / Simpan PDF")); b.type="button";
    b.addEventListener("click",function(){ window.print(); });
    var head=document.querySelector(".page-head"); if(head)head.appendChild(b); else rl.parentNode.insertBefore(b,rl);
  }

  /* ---------- Food page: random fact reveal ---------- */
  function initFacts(){
    var btn=document.getElementById("fact-btn"), out=document.getElementById("fact");
    if(!btn||!out||!window.FOOD_FACTS)return;
    btn.addEventListener("click",function(){
      out.classList.remove("fade-in");
      setTimeout(function(){
        out.textContent=window.FOOD_FACTS[Math.floor(Math.random()*window.FOOD_FACTS.length)];
        out.classList.add("fade-in");
      },160);
    });
  }

  onReady(function(){
    initTheme(); initLangMemory(); initReveal(); initCounters(); initTopBtn();
    initSearch(); initChatInput(); initQuiz(); initForms(); initLightbox(); initMap(); initSW(); initFacts();
    initSitePhoto(); initAudioGuide(); initWeather();
    initInfoModal(); initFoodFilters(); initDanceRhythm(); initDanceWatch();
    initFavourites(); initVisitInfo(); initNearMe(); initA11y(); initShareQR(); initTOC(); initVoiceSearch(); initRecent(); initPrint();
    initProgress(); initHeader(); initRipple(); initTilt();
  });
})();
