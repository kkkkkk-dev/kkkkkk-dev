/* ══════════════════════════════════════════════
   GLASSMORPHISM FIX — REMOVED
   The grey-box artifacts were caused by excessive
   will-change & isolation in CSS, not scroll direction.
   Toggling will-change on every scroll was actually
   making the GPU layer thrashing WORSE.
   Fix applied in style.css (removed bulk GPU promotion).
══════════════════════════════════════════════ */

/* ══════════════════════════════════════════════
   GLARE SWEEP
══════════════════════════════════════════════ */
var noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function addGlare(el){
  if(el.querySelector('.glare-layer')) return;
  var g = document.createElement('div');
  g.className = 'glare-layer';
  el.appendChild(g);
}

function fireGlare(el){
  if(noMotion) return;
  var g = el.querySelector('.glare-layer');
  if(!g) return;
  g.classList.remove('sweep');
  void g.offsetWidth;
  var rawDelay = getComputedStyle(el).transitionDelay || '0s';
  var delay = (parseFloat(rawDelay) || 0) * 1000;
  setTimeout(function(){
    if(document.contains(g)){
      g.classList.add('sweep');
      g.addEventListener('animationend', function(){ g.classList.remove('sweep'); }, { once: true });
    }
  }, delay + 60);
}

document.querySelectorAll('.glass, .stat').forEach(function(el){
  if(!el.closest('.reas')) addGlare(el);
});

/* ══════════════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════════════ */
var revealQueue = new Set();
var rafPending  = false;

function flushRevealQueue(){
  rafPending = false;
  revealQueue.forEach(function(el){
    el.classList.add('on');
    fireGlare(el);
  });
  revealQueue.clear();
}

var revealObs = new IntersectionObserver(function(entries){
  entries.forEach(function(e){
    if(e.isIntersecting){
      revealQueue.add(e.target);
      revealObs.unobserve(e.target);
      if(!rafPending){ rafPending = true; requestAnimationFrame(flushRevealQueue); }
    }
  });
}, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

var initialReveal = [];
document.querySelectorAll('.rv').forEach(function(el){
  var r = el.getBoundingClientRect();
  if(r.top < window.innerHeight && r.bottom > 0){ initialReveal.push(el); }
  else { revealObs.observe(el); }
});
requestAnimationFrame(function(){
  initialReveal.forEach(function(el){ el.classList.add('on'); fireGlare(el); });
});

/* ── ZE CARD REVEAL ── */
var zeWrapObs = new IntersectionObserver(function(entries){
  entries.forEach(function(e){
    if(e.isIntersecting){ e.target.classList.add('ze-on'); zeWrapObs.unobserve(e.target); }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.ze-reveal-wrap').forEach(function(el){
  var r = el.getBoundingClientRect();
  if(r.top < window.innerHeight && r.bottom > 0){
    requestAnimationFrame(function(){ el.classList.add('ze-on'); });
  } else { zeWrapObs.observe(el); }
});
