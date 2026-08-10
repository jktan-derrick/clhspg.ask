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
    if(reduce||!("IntersectionObserver" in window)){ els.forEach(function(e){e.classList.add("is-in");}); return; }
    var io=new IntersectionObserver(function(en){ en.forEach(function(x){ if(x.isIntersecting){ x.target.classList.add("is-in"); io.unobserve(x.target);} }); },
      {threshold:0.12, rootMargin:"0px 0px -40px 0px"});
    els.forEach(function(e){ io.observe(e); });
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

  /* ---------- Typed search (search page) ---------- */
  function initSearch(){
    var input=document.getElementById("site-search"); if(!input)return;
    var msg=document.getElementById("search-msg");
    var chips=[].slice.call(document.querySelectorAll(".chips a"));
    input.addEventListener("input",function(){
      var q=norm(input.value);
      chips.forEach(function(c){ c.style.display = (!q || norm(c.textContent).indexOf(q)>-1) ? "" : "none"; });
      if(msg) msg.textContent="";
    });
    input.form && input.form.addEventListener("submit", go);
    input.addEventListener("keydown",function(e){ if(e.key==="Enter"){ e.preventDefault(); go(e); } });
    function go(e){ if(e)e.preventDefault(); var s=bestSite(input.value);
      if(s){ location.hash="#"+s.id; if(msg)msg.textContent=""; }
      else if(msg){ msg.textContent=t("Sorry, no site matches “","Maaf, tiada tapak sepadan dengan “")+input.value+"”."; } }
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
  function initQuiz(){
    var host=document.getElementById("js-quiz"); if(!host||!window.QUIZ)return;
    var stat=document.querySelector(".static-quiz"); if(stat)stat.style.display="none";
    var picked, idx, score, answered;
    function start(){ picked=shuffle(window.QUIZ.slice()).slice(0,10).map(function(it){ var opts=shuffle([{t:it.a,c:true}].concat(it.w.map(function(w){return{t:w,c:false};}))); return {q:it.q,opts:opts,why:it.why}; });
      idx=0; score=0; render(); }
    function render(){ answered=false; var it=picked[idx];
      host.innerHTML="";
      var bar=el("div","q-progress"); bar.innerHTML='<span>'+t("Question ","Soalan ")+(idx+1)+"/10</span><span>"+t("Score: ","Skor: ")+score+"</span>";
      host.appendChild(bar);
      var track=el("div","q-bar"); track.innerHTML='<div style="width:'+(idx/10*100)+'%"></div>'; host.appendChild(track);
      var card=el("div","cq is-in"); card.appendChild(el("p","q",it.q));
      var opts=el("div","opts");
      it.opts.forEach(function(o){ var lab=el("button","opt"+(o.c?" is-correct":"")); lab.type="button"; lab.innerHTML="<span>"+o.t+"</span>";
        lab.addEventListener("click",function(){ choose(o,lab,card); }); opts.appendChild(lab); });
      card.appendChild(opts);
      var ex=el("p","ex"); ex.textContent="✓ "+it.why; card.appendChild(ex);
      host.appendChild(card);
      var next=el("button","next", (idx===9?t("See Results →","Lihat Keputusan →"):t("Next →","Seterusnya →"))); next.type="button"; next.style.display="none";
      next.addEventListener("click",function(){ idx++; if(idx>=10)results(); else render(); });
      card._next=next; host.appendChild(next);
    }
    function choose(o,lab,card){ if(answered)return; answered=true;
      var all=card.querySelectorAll(".opt"); all.forEach(function(b){ b.disabled=true; if(b.classList.contains("is-correct"))b.classList.add("correct"); });
      if(o.c)score++; else lab.classList.add("wrong");
      card.querySelector(".ex").classList.add("show");
      card.parentNode.querySelector(".q-progress").children[1].textContent=t("Score: ","Skor: ")+score;
      card._next.style.display="inline-block";
    }
    function results(){ host.innerHTML="";
      var medal = score>=9?"🏆":score>=7?"🥇":score>=5?"🥈":"🥉";
      var r=el("div","q-result is-in");
      r.innerHTML='<div class="medal">'+medal+'</div><div class="score">'+score+'/10</div><p>'+
        (score>=9?t("Heritage Master!","Sifu Warisan!"):score>=7?t("Heritage Expert","Pakar Warisan"):score>=5?t("Heritage Enthusiast","Peminat Warisan"):t("Heritage Explorer","Penjelajah Warisan"))+'</p>';
      var again=el("button","again",t("Play Again (new questions)","Main Semula (soalan baharu)")); again.type="button";
      again.addEventListener("click",start); r.appendChild(again); host.appendChild(r);
    }
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

  /* ---------- Gallery lightbox ---------- */
  function initLightbox(){
    var imgs=[].slice.call(document.querySelectorAll(".gitem img")); if(!imgs.length)return;
    var ov=el("div","lightbox"); ov.innerHTML='<button class="lb-x" aria-label="Close">&#10005;</button><img alt="">';
    document.body.appendChild(ov); var big=ov.querySelector("img");
    imgs.forEach(function(im){ im.style.cursor="zoom-in"; im.addEventListener("click",function(){ big.src=im.src; ov.classList.add("open"); }); });
    function close(){ ov.classList.remove("open"); big.src=""; }
    ov.addEventListener("click",function(e){ if(e.target===ov||e.target.className==="lb-x")close(); });
    document.addEventListener("keydown",function(e){ if(e.key==="Escape")close(); });
  }

  /* ---------- Leaflet map (directions page) ---------- */
  function initMap(){
    var host=document.getElementById("leaflet-map"); if(!host||!window.SITES)return;
    function build(){ if(!window.L)return;
      var map=L.map(host,{scrollWheelZoom:false}).setView([5.4157,100.3385],15);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"&copy; OpenStreetMap"}).addTo(map);
      var grp=[];
      window.SITES.forEach(function(s){ var m=L.marker([s.lat,s.lng]).addTo(map);
        m.bindPopup('<b>'+s.name+'</b><br>'+s.area+'<br><a href="'+siteUrl(s)+'">'+t("Details","Butiran")+'</a>'); grp.push(m); });
      if(grp.length)map.fitBounds(L.featureGroup(grp).getBounds().pad(0.15));
    }
    if(window.L){ build(); return; }
    var css=el("link"); css.rel="stylesheet"; css.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"; document.head.appendChild(css);
    var js=document.createElement("script"); js.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"; js.onload=build; document.body.appendChild(js);
  }

  /* ---------- Service worker (offline / installable) ---------- */
  function initSW(){
    if(!("serviceWorker" in navigator))return;
    if(location.protocol==="file:")return;
    var base=location.pathname.replace(/[^/]*$/,"");
    if(base.indexOf("/sites/")>-1) base=base.replace(/sites\/$/,"");
    navigator.serviceWorker.register(base+"sw.js").catch(function(){});
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
  });
})();
