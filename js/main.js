/* ══════════════════════════════════════════════
   SKELETON DISMISS
══════════════════════════════════════════════ */
(function(){
  var sk = document.getElementById('page-skeleton');
  var dismissed = false;

  function markReady(){
    window.__pageReady = true;
    document.dispatchEvent(new Event('pageready'));
  }

  function dismiss(){
    if(dismissed) return;
    dismissed = true;
    if(!sk){ markReady(); return; }
    sk.classList.add('sk-hidden');
    markReady();
    setTimeout(function(){ if(sk.parentNode) sk.remove(); }, 650);
  }

  var fontsP = Promise.resolve();
  if(document.fonts && document.fonts.load){
    fontsP = Promise.all([
      document.fonts.load('700 1em "Rajdhani"'),
      document.fonts.load('400 1em "JetBrains Mono"')
    ]).catch(function(){});
  }

  var imgP = new Promise(function(resolve){
    var bgImg = document.getElementById('bgImg');
    if(!bgImg || bgImg.complete) return resolve();
    bgImg.addEventListener('load', resolve, { once: true });
    bgImg.addEventListener('error', resolve, { once: true });
  });

  Promise.all([fontsP, imgP]).then(function(){ setTimeout(dismiss, 60); });
  setTimeout(dismiss, 1400);
})();

/* ══════════════════════════════════════════════
   YEAR
══════════════════════════════════════════════ */
(function(){
  var yr = document.getElementById('yr');
  if(yr) yr.textContent = new Date().getFullYear();
})();

/* ══════════════════════════════════════════════
   COPY CODE
══════════════════════════════════════════════ */
function copyCode(id, btn){
  var src = document.getElementById(id);
  if(!src || !btn) return;
  var txt = src.innerText;
  if(!btn.dataset.orig) btn.dataset.orig = btn.innerHTML;
  var ok = '<svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><polyline points="20 6 9 17 4 12"/></svg> COPIED!';

  function done(){
    btn.innerHTML = ok;
    clearTimeout(btn._t);
    btn._t = setTimeout(function(){ btn.innerHTML = btn.dataset.orig; }, 1800);
  }

  function fallback(){
    var t = document.createElement('textarea');
    t.value = txt;
    t.setAttribute('readonly', '');
    t.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;font-size:16px;pointer-events:none';
    document.body.appendChild(t);
    t.focus({ preventScroll: true });
    t.select();
    t.setSelectionRange(0, txt.length);
    var success = false;
    try{ success = document.execCommand('copy'); }catch(_){}
    document.body.removeChild(t);
    if(success) done();
  }

  if(navigator.clipboard && window.isSecureContext){
    navigator.clipboard.writeText(txt).then(done, fallback);
  } else {
    fallback();
  }
}

/* ══════════════════════════════════════════════
   ZE UI CARD — swipe & controls
══════════════════════════════════════════════ */
(function(){
  var ZE_PAGES = 6;
  var zeCurrent = 0;
  var zeTrack   = document.getElementById('zeTrack');
  var zeWrapper = document.getElementById('zeWrapper');
  var zeDotEls  = document.querySelectorAll('.ze-dot');
  if(!zeTrack || !zeWrapper) return;

  function zeGo(idx){
    idx = Math.max(0, Math.min(ZE_PAGES - 1, idx));
    zeCurrent = idx;
    zeTrack.classList.remove('no-trans');
    zeTrack.style.transform = 'translate3d(-' + (idx * 100) + '%,0,0)';
    zeDotEls.forEach(function(d, i){ d.classList.toggle('ze-dot-active', i === idx); });
  }
  zeDotEls.forEach(function(d, i){ d.addEventListener('click', function(){ zeGo(i); }); });

  var startX = 0, startY = 0, dx = 0, pid = null;
  var dragging = false, horiz = null, suppressClick = false;

  zeWrapper.addEventListener('pointerdown', function(e){
    if(e.pointerType === 'mouse' && e.button !== 0) return;
    if(e.target.closest('input,textarea,select')) return;
    startX = e.clientX; startY = e.clientY; dx = 0;
    pid = e.pointerId; dragging = true; horiz = null;
  });

  zeWrapper.addEventListener('pointermove', function(e){
    if(!dragging || e.pointerId !== pid) return;
    var mx = e.clientX - startX, my = e.clientY - startY;
    if(horiz === null){
      if(Math.abs(mx) < 6 && Math.abs(my) < 6) return;
      horiz = Math.abs(mx) > Math.abs(my);
      if(!horiz){ dragging = false; return; }
      try{ zeWrapper.setPointerCapture(pid); }catch(_){}
      zeWrapper.classList.add('dragging');
      zeTrack.classList.add('no-trans');
    }
    dx = mx;
    var atEdge = (zeCurrent === 0 && dx > 0) || (zeCurrent === ZE_PAGES - 1 && dx < 0);
    var shown = atEdge ? dx * 0.35 : dx;
    zeTrack.style.transform = 'translate3d(calc(-' + (zeCurrent * 100) + '% + ' + shown + 'px),0,0)';
  });

  function endDrag(e){
    if(!dragging || (e && e.pointerId !== pid)) return;
    var wasHoriz = horiz === true;
    dragging = false;
    zeWrapper.classList.remove('dragging');
    if(!wasHoriz){ horiz = null; return; }
    try{ zeWrapper.releasePointerCapture(pid); }catch(_){}
    var threshold = Math.min(60, zeWrapper.clientWidth * 0.15);
    if(Math.abs(dx) > threshold) zeGo(dx < 0 ? zeCurrent + 1 : zeCurrent - 1);
    else zeGo(zeCurrent);
    suppressClick = true;
    setTimeout(function(){ suppressClick = false; }, 0);
    horiz = null; dx = 0;
  }
  zeWrapper.addEventListener('pointerup', endDrag);
  zeWrapper.addEventListener('pointercancel', endDrag);
  zeWrapper.addEventListener('click', function(e){
    if(suppressClick){ e.stopPropagation(); e.preventDefault(); }
  }, true);

  document.querySelectorAll('.ze-toggle').forEach(function(t){
    t.addEventListener('click', function(e){ e.stopPropagation(); t.classList.toggle('ze-toggle-on'); });
  });

  var zeWsS = document.getElementById('zeWsSlider'), zeWsV = document.getElementById('zeWsVal');
  var zeJpS = document.getElementById('zeJpSlider'), zeJpV = document.getElementById('zeJpVal');
  var zeVoS = document.getElementById('zeVolSlider'), zeVoV = document.getElementById('zeVolBadge');
  if(zeWsS && zeWsV) zeWsS.addEventListener('input', function(e){ zeWsV.textContent = e.target.value; });
  if(zeJpS && zeJpV) zeJpS.addEventListener('input', function(e){ zeJpV.textContent = e.target.value; });
  if(zeVoS && zeVoV) zeVoS.addEventListener('input', function(e){ zeVoV.textContent = e.target.value + '%'; });

  var zeFavBtn = document.getElementById('zeFavBtn'), zeFavPanel = document.getElementById('zeFavPanel');
  if(zeFavBtn && zeFavPanel) zeFavBtn.addEventListener('click', function(){
    var open = zeFavPanel.style.display === 'none';
    zeFavPanel.style.display = open ? 'block' : 'none';
    zeFavBtn.innerHTML = open ? '&#9650; Close' : '&#9660; Open';
  });

  var zePlay = document.getElementById('zePlayBtn'), zePrev = document.getElementById('zePrevBtn');
  var zeNext = document.getElementById('zeNextBtn'), zePFill = document.getElementById('zeProgressFill');
  var playing = false, prog = 45, timer = null;
  function setProg(v){ prog = v; if(zePFill) zePFill.style.width = prog + '%'; }
  function zeSetPlay(s){
    playing = s;
    clearInterval(timer);
    if(zePlay) zePlay.innerHTML = playing ? '&#9646;&#9646; Pause' : '&#9654; Play';
    if(playing){
      timer = setInterval(function(){
        setProg(Math.min(100, prog + 0.5));
        if(prog >= 100){ zeSetPlay(false); setProg(0); }
      }, 300);
    }
  }
  document.addEventListener('visibilitychange', function(){ if(document.hidden && playing) zeSetPlay(false); });
  if(zePlay) zePlay.addEventListener('click', function(){ zeSetPlay(!playing); });
  if(zePrev) zePrev.addEventListener('click', function(){ setProg(0); });
  if(zeNext) zeNext.addEventListener('click', function(){ setProg(0); zeSetPlay(false); });

  var zeScanBtn = document.getElementById('zeScanBtn'), zeFileInput = document.getElementById('zeFileInput');
  var zeScanned = document.getElementById('zeScannedFile');
  if(zeScanBtn && zeFileInput) zeScanBtn.addEventListener('click', function(){ zeFileInput.click(); });
  if(zeFileInput && zeScanned) zeFileInput.addEventListener('change', function(){
    var f = zeFileInput.files[0];
    if(f){ zeScanned.style.display = 'block'; zeScanned.textContent = 'Loaded: ' + f.name + ' (' + (f.size / 1024).toFixed(1) + ' KB)'; }
  });

  document.querySelectorAll('.ze-plus').forEach(function(btn){
    btn.addEventListener('click', function(){
      var inp = btn.previousElementSibling;
      if(inp && inp.tagName === 'INPUT') alert('Applied asset ID: ' + (inp.value || '(empty)'));
    });
  });

  zeGo(0);
})();
