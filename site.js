(function(){
  window.FJ_AR=document.documentElement.lang==='ar';
  window.fjT=function(en,ar){return window.FJ_AR?ar:en;};
})();
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
    if(a==='accept'||(a==='hide'&&(b.textContent.indexOf('Accept')>-1||b.textContent.indexOf('قبول')>-1))){store({analytics:true,prefs:true});hideBanner();}
    else if(a==='reject'||a==='hide'){store({analytics:false,prefs:false});hideBanner();}
    else if(a==='toggle'){setSwitch(b,b.getAttribute('aria-checked')!=='true');}
    else if(a==='acceptAll'){document.querySelectorAll('[role=switch]').forEach(function(s){setSwitch(s,true);});saveSwitches();}
    else if(a==='rejectAll'){document.querySelectorAll('[role=switch]').forEach(function(s){setSwitch(s,false);});saveSwitches();}
  });
  function setSwitch(s,on){s.setAttribute('aria-checked',on?'true':'false');s.style.background=on?'#197E83':'#8A8D93';s.style.justifyContent=on?'flex-end':'flex-start';}
  function saveSwitches(){
    var sw=document.querySelectorAll('[role=switch]');
    store({prefs:sw[0]&&sw[0].getAttribute('aria-checked')==='true',analytics:sw[1]&&sw[1].getAttribute('aria-checked')==='true'});
    var st=document.getElementById('ck-status'); if(st){st.textContent=fjT('Your cookie choices are saved.','تم حفظ اختياراتك لملفات تعريف الارتباط.');}
  }
  if(document.body.dataset.page==='Cookies'){
    var saved=read(); var sw=document.querySelectorAll('[role=switch]');
    if(saved&&sw.length>1){setSwitch(sw[0],!!saved.prefs);setSwitch(sw[1],!!saved.analytics);}
    document.querySelectorAll('button').forEach(function(b){ if((b.textContent.trim()==='Save my choices'||b.textContent.trim()==='حفظ اختياراتي')) b.addEventListener('click',saveSwitches); });
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
  document.querySelectorAll('button[aria-pressed][data-al^="Save"]').forEach(function(b){
    b.addEventListener('click',function(){var on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',on?'true':'false');var p=b.querySelector('path');if(p){p.setAttribute('fill',on?'#D84B33':'none');p.setAttribute('stroke',on?'#D84B33':'#1B2B2C');}});
  });

  /* Forms without a backend in this preview */
  document.querySelectorAll('form:not([action])').forEach(function(f){f.addEventListener('submit',function(e){e.preventDefault();});});
})();

/* ===== Verification flow + verify-to-chat (prototype) ===== */
(function(){
  var VKEY='freej-verified';
  function isVerified(){try{return localStorage.getItem(VKEY)==='1';}catch(e){return false;}}
  var params=new URLSearchParams(location.search);

  /* Message buttons: unverified buyers go through verification first */
  document.querySelectorAll('[data-needs-verify]').forEach(function(a){
    if(isVerified()){ a.setAttribute('href',window.FJ_AR?'messages.html':'messages-en.html'); var n=document.querySelector('[data-verify-note]'); if(n) n.hidden=true; }
    else { a.setAttribute('href',(window.FJ_AR?'verify.html':'verify-en.html')+'?for=buyer'); }
  });

  if(document.body.dataset.page!=='Verify') return;
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mode=params.get('for')==='buyer'?'buyer':(params.get('type')||'neighbour');
  if(['buyer','neighbour','maker','business'].indexOf(mode)<0) mode='neighbour';
  /* Keep only the wording and steps for this account type */
  document.querySelectorAll('[data-for]').forEach(function(el){
    if(el.getAttribute('data-for').split(' ').indexOf(mode)<0) el.remove();
    else if(!el.matches('section[data-step]')) el.hidden=false;
  });
  var steps=[].slice.call(document.querySelectorAll('section[data-step]'));
  var back=document.querySelector('[data-vf-back]'), count=document.querySelector('[data-vf-count]');
  var prog=document.querySelector('[data-vf-progress]'), bar=prog&&prog.querySelector('.vf-bar');
  var intro=document.querySelector('.vf-intro');
  var total=steps.length-1; /* the last card is the "You're verified" result, not a step */
  var i=0;

  function setChrome(){
    var done=i>=total;
    if(count) count.textContent=done?fjT('All done','اكتمل التوثيق'):fjT('Step '+(i+1)+' of '+total,'الخطوة '+(i+1)+' من '+total);
    if(prog){ prog.setAttribute('aria-valuemax',total); prog.setAttribute('aria-valuenow',Math.min(i+1,total)); }
    if(bar) bar.style.transform='scaleX('+(done?1:(i+1)/total)+')';
    if(back) back.hidden=(i===0||done);
    if(intro) intro.hidden=i>0;
  }
  function animateIn(el,dir){
    if(!el.animate) return;
    if(reduce){ el.animate([{opacity:0},{opacity:1}],{duration:180,easing:'ease-out'}); return; }
    el.animate([{opacity:0,transform:'translateX('+(dir*(window.FJ_AR?-28:28))+'px)'},{opacity:1,transform:'none'}],{duration:340,easing:'cubic-bezier(.2,.8,.2,1)'});
  }
  function go(n,dir,push){
    n=Math.max(0,Math.min(n,steps.length-1)); if(n===i&&push!==false&&dir) return;
    var from=steps[i], to=steps[n]; i=n;
    function swap(){
      steps.forEach(function(s){ s.hidden=s!==to; });
      setChrome();
      animateIn(to,dir||1);
      var h=to.querySelector('h2'); if(h){ h.setAttribute('tabindex','-1'); h.focus({preventScroll:true}); }
      var top=document.querySelector('.vf-top'); if(top&&top.getBoundingClientRect().top<0) top.scrollIntoView({block:'start',behavior:reduce?'auto':'smooth'});
      if(to.getAttribute('data-step')==='5'){ try{localStorage.setItem(VKEY,'1');}catch(e){} to.classList.add('vf-celebrate'); }
    }
    if(from&&from!==to&&!from.hidden&&from.animate&&!reduce){
      var a=from.animate([{opacity:1,transform:'none'},{opacity:0,transform:'translateX('+(-(dir||1)*(window.FJ_AR?-20:20))+'px)'}],{duration:160,easing:'cubic-bezier(.4,0,1,1)'});
      a.onfinish=swap;
    } else swap();
    if(push!==false){ try{ history.pushState({vf:i},'', '#step-'+(i+1)); }catch(e){} }
  }
  window.addEventListener('popstate',function(e){ var n=(e.state&&typeof e.state.vf==='number')?e.state.vf:0; if(n!==i) go(n,n<i?-1:1,false); });
  try{ history.replaceState({vf:0},'',location.pathname+location.search); }catch(e){}

  function next(btn){ if(btn&&btn.disabled) return; go(i+1,1); }
  if(back) back.addEventListener('click',function(){ history.length>1&&history.state&&history.state.vf>0?history.back():go(i-1,-1); });
  document.addEventListener('click',function(e){
    var b=e.target.closest('[data-action]'); if(!b) return;
    var a=b.getAttribute('data-action');
    if(a==='next'){ e.preventDefault(); next(b); }
  });
  function nextBtn(step){ return step.querySelector('.vf-next'); }
  function enable(step,on){ var b=nextBtn(step); if(b) b.disabled=!on; }

  /* Email and mobile: send code -> code boxes appear -> six digits -> continue on its own */
  steps.forEach(function(step){
    var send=step.querySelector('[data-send-code]'), field=step.querySelector('input[type=email],input[type=tel]'), otp=step.querySelector('.vf-otp');
    if(!send||!field) return;
    function valid(){ var v=field.value.trim(); return field.type==='email'?/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v):v.replace(/\D/g,'').length>=9; }
    function sync(){ send.disabled=!valid(); }
    field.addEventListener('input',sync); sync();
    field.addEventListener('keydown',function(e){ if(e.key==='Enter'&&valid()){ e.preventDefault(); send.click(); } });
    send.addEventListener('click',function(){
      if(!valid()) return;
      send.textContent=fjT('Code sent','تم إرسال الرمز'); send.disabled=true;
      if(otp&&otp.hidden){ otp.hidden=false; if(otp.animate&&!reduce) otp.animate([{opacity:0,transform:'translateY(-6px)'},{opacity:1,transform:'none'}],{duration:260,easing:'cubic-bezier(.2,.8,.2,1)'}); }
      var first=otp&&otp.querySelector('input'); if(first) first.focus();
      setTimeout(function(){ send.textContent=fjT('Resend code','إعادة إرسال الرمز'); send.disabled=!valid(); },4000);
    });
  });
  document.querySelectorAll('[data-otp]').forEach(function(g){
    var ins=[].slice.call(g.querySelectorAll('input')), step=g.closest('section');
    function check(){
      var full=ins.every(function(x){return /\d/.test(x.value);});
      enable(step,full);
      if(full&&!g.dataset.ok){ g.dataset.ok='1'; g.classList.add('vf-ok'); setTimeout(function(){ if(!step.hidden) next(nextBtn(step)); },450); }
      if(!full){ delete g.dataset.ok; g.classList.remove('vf-ok'); }
    }
    ins.forEach(function(inp,k){
      inp.addEventListener('input',function(){ inp.value=inp.value.replace(/\D/g,'').slice(-1); if(inp.value&&ins[k+1]) ins[k+1].focus(); check(); });
      inp.addEventListener('keydown',function(e){ if(e.key==='Backspace'&&!inp.value&&ins[k-1]) ins[k-1].focus(); });
      inp.addEventListener('paste',function(e){ var t=(e.clipboardData||window.clipboardData).getData('text').replace(/\D/g,'').slice(0,6); if(!t) return; e.preventDefault(); ins.forEach(function(x,j){x.value=t[j]||'';}); (ins[t.length]||ins[5]).focus(); check(); });
    });
  });

  /* Emirates ID: UAE PASS, or scan + selfie */
  document.querySelectorAll('[data-id-method]').forEach(function(b){
    b.addEventListener('click',function(){
      var step=b.closest('section');
      step.querySelectorAll('[data-id-method]').forEach(function(x){ x.setAttribute('aria-pressed','false'); x.classList.remove('vf-chosen'); x.textContent=x.getAttribute('data-id-method')==='uaepass'?fjT('Continue with UAE PASS','المتابعة عبر UAE PASS'):fjT('Take a selfie','التقط صورة ذاتية'); });
      b.setAttribute('aria-pressed','true'); b.classList.add('vf-chosen');
      b.textContent=b.getAttribute('data-id-method')==='uaepass'?fjT('UAE PASS approved','تمت الموافقة عبر UAE PASS'):fjT('Selfie taken','تم التقاط الصورة');
      enable(step,true);
    });
  });

  /* Licence: trade name, licence number and the confirmation tick */
  var lic=document.querySelector('section[data-step="4"]');
  if(lic){
    var req=[lic.querySelector('#v-tn'),lic.querySelector('#v-ln'),lic.querySelector('[data-vf-confirm]')].filter(Boolean);
    function lcheck(){ enable(lic,req.every(function(x){return x.type==='checkbox'?x.checked:x.value.trim().length>1;})); }
    req.forEach(function(x){ x.addEventListener('input',lcheck); x.addEventListener('change',lcheck); }); lcheck();
  }
  steps.forEach(function(s,k){ s.hidden=k!==0; });
  setChrome();
})();

/* Language switch: remember the visitor's choice */
document.addEventListener('click',function(e){var a=e.target.closest('[data-lang]');if(!a)return;try{localStorage.setItem('freej-lang',a.getAttribute('data-lang'));}catch(err){}});
