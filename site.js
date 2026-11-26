(function(){
  var KEY='freej-consent';
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  function store(v){try{localStorage.setItem(KEY,JSON.stringify(v));}catch(e){}}
  function read(){try{return JSON.parse(localStorage.getItem(KEY));}catch(e){return null;}}

  /* Cookie banner: slide up as a sheet, slide down on choice */
  var banner=document.getElementById('cookie-banner');
  if(banner && !read()){
    banner.setAttribute('data-state','closed'); banner.hidden=false;
    setTimeout(function(){ banner.offsetHeight; banner.setAttribute('data-state','open'); }, reduce?0:450);
  }
  function hideBanner(){
    if(!banner) return;
    banner.setAttribute('data-state','closed');
    setTimeout(function(){ banner.hidden=true; }, reduce?200:280);
  }

  document.addEventListener('click',function(e){
    var b=e.target.closest('[data-action]'); if(!b) return;
    var a=b.getAttribute('data-action');
    if(a==='accept'||(a==='hide'&&b.textContent.indexOf('Accept')>-1)){store({analytics:true,prefs:true});hideBanner();}
    else if(a==='reject'||a==='hide'){store({analytics:false,prefs:false});hideBanner();}
    else if(a==='toggle'){setSwitch(b,b.getAttribute('aria-checked')!=='true');}
    else if(a==='acceptAll'){document.querySelectorAll('[role=switch]').forEach(function(s){setSwitch(s,true);});saveSwitches();}
    else if(a==='rejectAll'){document.querySelectorAll('[role=switch]').forEach(function(s){setSwitch(s,false);});saveSwitches();}
  });
  function setSwitch(s,on){s.setAttribute('aria-checked',on?'true':'false');s.style.background=on?'#197E83':'#8A8D93';s.style.justifyContent=on?'flex-end':'flex-start';}
  function saveSwitches(){
    var sw=document.querySelectorAll('[role=switch]');
    store({prefs:sw[0]&&sw[0].getAttribute('aria-checked')==='true',analytics:sw[1]&&sw[1].getAttribute('aria-checked')==='true'});
    var st=document.getElementById('ck-status'); if(st){st.textContent='Your cookie choices are saved.';}
  }
  if(document.body.dataset.page==='Cookies'){
    var saved=read(); var sw=document.querySelectorAll('[role=switch]');
    if(saved&&sw.length>1){setSwitch(sw[0],!!saved.prefs);setSwitch(sw[1],!!saved.analytics);}
    document.querySelectorAll('button').forEach(function(b){ if(b.textContent.trim()==='Save my choices') b.addEventListener('click',saveSwitches); });
  }

  /* Filters: bottom sheet on tablets and phones */
  var fb=document.querySelector('.filter-btn'), fl=document.getElementById('filters'), bd=document.querySelector('.sheet-backdrop');
  function sheetMode(){return window.matchMedia('(max-width: 860px)').matches;}
  function openSheet(){ if(!fl) return; fl.classList.add('open'); if(bd) bd.classList.add('open'); document.documentElement.classList.add('locked'); fb&&fb.setAttribute('aria-expanded','true'); if(sheetMode()){fl.setAttribute('role','dialog');fl.setAttribute('aria-modal','true');var d=fl.querySelector('.sheet-done');d&&setTimeout(function(){d.focus();},50);} }
  function closeSheet(){ if(!fl) return; fl.classList.remove('open'); if(bd) bd.classList.remove('open'); document.documentElement.classList.remove('locked'); fb&&fb.setAttribute('aria-expanded','false'); fl.removeAttribute('role'); fl.removeAttribute('aria-modal'); fb&&fb.focus(); }
  if(fb&&fl){
    fb.addEventListener('click',function(){ fl.classList.contains('open')?closeSheet():openSheet(); });
    document.querySelectorAll('[data-sheet-close]').forEach(function(el){el.addEventListener('click',closeSheet);});
    document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&fl.classList.contains('open')) closeSheet(); });
  }

  /* Save (heart) buttons */
  document.querySelectorAll('button[aria-pressed][aria-label^="Save"]').forEach(function(b){
    b.addEventListener('click',function(){var on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',on?'true':'false');var p=b.querySelector('path');if(p){p.setAttribute('fill',on?'#D84B33':'none');p.setAttribute('stroke',on?'#D84B33':'#1B2B2C');}});
  });

  /* Forms without a backend in this preview */
  document.querySelectorAll('form:not([action])').forEach(function(f){f.addEventListener('submit',function(e){e.preventDefault();});});
})();
