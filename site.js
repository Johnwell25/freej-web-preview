(function(){
  var KEY='freej-consent';
  function store(v){try{localStorage.setItem(KEY,JSON.stringify(v));}catch(e){}}
  function read(){try{return JSON.parse(localStorage.getItem(KEY));}catch(e){return null;}}
  var banner=document.getElementById('cookie-banner');
  if(banner && !read()) banner.hidden=false;
  function hideBanner(){ if(banner){ banner.hidden=true; var m=document.getElementById('main'); if(m) m.setAttribute('tabindex','-1'); } }
  document.addEventListener('click',function(e){
    var b=e.target.closest('[data-action]'); if(!b) return;
    var a=b.getAttribute('data-action');
    if(a==='accept'||a==='hide'&&b.textContent.indexOf('Accept')>-1){store({analytics:true,prefs:true});hideBanner();}
    else if(a==='reject'||a==='hide'){store({analytics:false,prefs:false});hideBanner();}
    else if(a==='toggle'){setSwitch(b,b.getAttribute('aria-checked')!=='true');}
    else if(a==='acceptAll'){document.querySelectorAll('[role=switch]').forEach(function(s){setSwitch(s,true);});saveSwitches();}
    else if(a==='rejectAll'){document.querySelectorAll('[role=switch]').forEach(function(s){setSwitch(s,false);});saveSwitches();}
  });
  function setSwitch(s,on){s.setAttribute('aria-checked',on?'true':'false');s.style.background=on?'#2440E6':'#8A8D93';s.style.justifyContent=on?'flex-end':'flex-start';}
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
  // mobile filters
  var fb=document.querySelector('.filter-btn'), fl=document.getElementById('filters');
  if(fb&&fl){fb.addEventListener('click',function(){var o=fl.classList.toggle('open');fb.setAttribute('aria-expanded',o?'true':'false');});}
  // save (heart) buttons
  document.querySelectorAll('button[aria-pressed][aria-label^="Save"]').forEach(function(b){
    b.addEventListener('click',function(){var on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',on?'true':'false');var p=b.querySelector('path');if(p)p.setAttribute('fill',on?'#E5484D':'none');if(p)p.setAttribute('stroke',on?'#E5484D':'#14161A');});
  });
  // forms without a real backend in this preview
  document.querySelectorAll('form:not([action])').forEach(function(f){f.addEventListener('submit',function(e){e.preventDefault();});});
})();
