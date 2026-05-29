/* ══════════════════════════════════════════════
   SKELETON DISMISS
══════════════════════════════════════════════ */
(function(){
  const sk = document.getElementById('page-skeleton');
  let fontsDone = false, imgDone = false;

  function tryDismiss(){
    if(!fontsDone || !imgDone) return;
    setTimeout(function(){
      sk.classList.add('sk-hidden');
      sk.addEventListener('transitionend', function(){
        sk.remove();
      }, { once: true });
    }, 120);
  }

  if(document.fonts && document.fonts.ready){
    document.fonts.ready.then(function(){ fontsDone=true; tryDismiss(); });
  } else { fontsDone=true; }

  const bgImg = document.getElementById('bgImg');
  if(bgImg.complete){ imgDone=true; tryDismiss(); }
  else {
    bgImg.addEventListener('load',  function(){ imgDone=true; tryDismiss(); }, {once:true});
    bgImg.addEventListener('error', function(){ imgDone=true; tryDismiss(); }, {once:true});
  }

  setTimeout(function(){ fontsDone=true; imgDone=true; tryDismiss(); }, 2500);
})();

/* ══════════════════════════════════════════════
   YEAR
══════════════════════════════════════════════ */
document.getElementById('yr').textContent = new Date().getFullYear();

/* ══════════════════════════════════════════════
   COPY CODE
══════════════════════════════════════════════ */
function copyCode(id, btn){
  var txt = document.getElementById(id).innerText;
  var orig = btn.innerHTML;
  var ok = '<svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><polyline points="20 6 9 17 4 12"/></svg> COPIED!';
  if(navigator.clipboard){
    navigator.clipboard.writeText(txt).then(function(){
      btn.innerHTML = ok;
      setTimeout(function(){ btn.innerHTML = orig; }, 1800);
    });
  } else {
    var t = document.createElement('textarea');
    t.value = txt; document.body.appendChild(t); t.select();
    document.execCommand('copy'); document.body.removeChild(t);
    btn.innerHTML = ok;
    setTimeout(function(){ btn.innerHTML = orig; }, 1800);
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

  function zeGo(idx, animated){
    if(animated === undefined) animated = true;
    idx = Math.max(0, Math.min(ZE_PAGES - 1, idx));
    zeCurrent = idx;
    if(!animated) zeTrack.classList.add('no-trans');
    zeTrack.style.transform = 'translateX(-' + (idx * 100) + '%)';
    if(!animated) requestAnimationFrame(function(){ requestAnimationFrame(function(){ zeTrack.classList.remove('no-trans'); }); });
    zeDotEls.forEach(function(d, i){ d.classList.toggle('ze-dot-active', i === idx); });
  }
  zeDotEls.forEach(function(d, i){ d.addEventListener('click', function(){ zeGo(i); }); });

  // Mouse drag
  var msx=0, msy=0, mdrag=false, mdelta=0, mHoriz=null;
  zeWrapper.addEventListener('mousedown', function(e){ msx=e.clientX; msy=e.clientY; mdrag=true; mHoriz=null; mdelta=0; zeWrapper.classList.add('dragging'); });
  window.addEventListener('mousemove', function(e){
    if(!mdrag) return;
    var dx=e.clientX-msx, dy=e.clientY-msy;
    if(mHoriz===null && (Math.abs(dx)>5 || Math.abs(dy)>5)) mHoriz=Math.abs(dx)>=Math.abs(dy);
    if(!mHoriz) return;
    mdelta=dx; zeTrack.classList.add('no-trans');
    zeTrack.style.transform='translateX(calc(-'+(zeCurrent*100)+'% + '+dx+'px))';
  });
  window.addEventListener('mouseup', function(){
    if(!mdrag) return; mdrag=false; zeWrapper.classList.remove('dragging'); zeTrack.classList.remove('no-trans');
    if(mHoriz && Math.abs(mdelta)>50) zeGo(mdelta<0 ? zeCurrent+1 : zeCurrent-1);
    else zeGo(zeCurrent);
    mdelta=0; mHoriz=null;
  });

  // Touch drag
  var tsx=0, tsy=0, tHoriz=null;
  zeWrapper.addEventListener('touchstart', function(e){ tsx=e.touches[0].clientX; tsy=e.touches[0].clientY; tHoriz=null; }, { passive:true });
  zeWrapper.addEventListener('touchmove', function(e){
    var dx=e.touches[0].clientX-tsx, dy=e.touches[0].clientY-tsy;
    if(tHoriz===null && (Math.abs(dx)>5 || Math.abs(dy)>5)) tHoriz=Math.abs(dx)>=Math.abs(dy);
    if(!tHoriz) return; e.preventDefault();
    zeTrack.classList.add('no-trans');
    zeTrack.style.transform='translateX(calc(-'+(zeCurrent*100)+'% + '+dx+'px))';
  }, { passive:false });
  zeWrapper.addEventListener('touchend', function(e){
    var dx=e.changedTouches[0].clientX-tsx;
    zeTrack.classList.remove('no-trans');
    if(tHoriz && Math.abs(dx)>50) zeGo(dx<0 ? zeCurrent+1 : zeCurrent-1);
    else zeGo(zeCurrent);
    tHoriz=null;
  });

  // Toggles
  document.querySelectorAll('.ze-toggle').forEach(function(t){
    t.addEventListener('click', function(e){ e.stopPropagation(); t.classList.toggle('ze-toggle-on'); });
  });

  // Sliders
  var zeWsS=document.getElementById('zeWsSlider'), zeWsV=document.getElementById('zeWsVal');
  var zeJpS=document.getElementById('zeJpSlider'), zeJpV=document.getElementById('zeJpVal');
  var zeVoS=document.getElementById('zeVolSlider'), zeVoV=document.getElementById('zeVolBadge');
  if(zeWsS) zeWsS.addEventListener('input', function(e){ zeWsV.textContent=e.target.value; });
  if(zeJpS) zeJpS.addEventListener('input', function(e){ zeJpV.textContent=e.target.value; });
  if(zeVoS) zeVoS.addEventListener('input', function(e){ zeVoV.textContent=e.target.value+'%'; });

  // Favorites panel
  var zeFavBtn=document.getElementById('zeFavBtn'), zeFavPanel=document.getElementById('zeFavPanel');
  if(zeFavBtn) zeFavBtn.addEventListener('click', function(){
    var open = zeFavPanel.style.display==='none';
    zeFavPanel.style.display = open ? 'block' : 'none';
    zeFavBtn.innerHTML = open ? '&#9650; Close' : '&#9660; Open';
  });

  // Music player
  var zePlay=document.getElementById('zePlayBtn'), zePrev=document.getElementById('zePrevBtn');
  var zeNext=document.getElementById('zeNextBtn'), zePFill=document.getElementById('zeProgressFill');
  var playing=false, prog=45, timer=null;
  function zeSetPlay(s){
    playing=s;
    if(zePlay) zePlay.innerHTML=playing?'&#9646;&#9646; Pause':'&#9654; Play';
    if(playing){
      timer=setInterval(function(){
        prog=Math.min(100,prog+0.5);
        if(zePFill) zePFill.style.width=prog+'%';
        if(prog>=100){ zeSetPlay(false); prog=0; if(zePFill) zePFill.style.width='0%'; }
      },300);
    } else { clearInterval(timer); }
  }
  if(zePlay) zePlay.addEventListener('click', function(){ zeSetPlay(!playing); });
  if(zePrev) zePrev.addEventListener('click', function(){ prog=0; if(zePFill) zePFill.style.width='0%'; });
  if(zeNext) zeNext.addEventListener('click', function(){ prog=0; if(zePFill) zePFill.style.width='0%'; zeSetPlay(false); });

  // File scan
  var zeScanBtn=document.getElementById('zeScanBtn'), zeFileInput=document.getElementById('zeFileInput');
  var zeScanned=document.getElementById('zeScannedFile');
  if(zeScanBtn) zeScanBtn.addEventListener('click', function(){ zeFileInput.click(); });
  if(zeFileInput) zeFileInput.addEventListener('change', function(){
    var f=zeFileInput.files[0];
    if(f){ zeScanned.style.display='block'; zeScanned.textContent='Loaded: '+f.name+' ('+(f.size/1024).toFixed(1)+' KB)'; }
  });

  // Plus buttons
  document.querySelectorAll('.ze-plus').forEach(function(btn){
    btn.addEventListener('click', function(){
      var inp=btn.previousElementSibling;
      if(inp && inp.tagName==='INPUT') alert('Applied asset ID: '+(inp.value||'(empty)'));
    });
  });
})();
