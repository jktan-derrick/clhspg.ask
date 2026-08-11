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
  function haversine(la1,ln1,la2,ln2){ var R=6371000,r=Math.PI/180,
    dLa=(la2-la1)*r, dLn=(ln2-ln1)*r,
    a=Math.sin(dLa/2)*Math.sin(dLa/2)+Math.cos(la1*r)*Math.cos(la2*r)*Math.sin(dLn/2)*Math.sin(dLn/2);
    return 2*R*Math.asin(Math.sqrt(a)); }
  function initMap(){
    var host=document.getElementById("leaflet-map"); if(!host||!window.SITES)return;
    function build(){ if(!window.L)return;
      var tools=el("div","map-tools");
      var active={}; CATS.forEach(function(ci){ active[ci.en]=true; });
      CATS.forEach(function(ci){
        var b=el("button","map-chip"); b.type="button"; b.style.setProperty("--c",ci.c);
        b.innerHTML='<i></i>'+(LANG==="ms"?ci.ms:ci.en);
        b.addEventListener("click",function(){ active[ci.en]=!active[ci.en]; b.classList.toggle("off",!active[ci.en]); refresh(); });
        tools.appendChild(b);
      });
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
    }).catch(function(){ host.remove(); });
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
    initProgress(); initHeader(); initRipple(); initTilt();
  });
})();
