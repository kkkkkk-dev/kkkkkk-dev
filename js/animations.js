var noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function addGlare(el){
  if(el.querySelector(':scope > .glare-layer')) return;
  var g = document.createElement('div');
  g.className = 'glare-layer';
  el.appendChild(g);
}

function fireGlareBatch(list){
  if(noMotion || !list.length) return;
  var jobs = [];
  list.forEach(function(el){
    var g = el.querySelector(':scope > .glare-layer');
    if(!g) return;
    var delay = (parseFloat(getComputedStyle(el).transitionDelay) || 0) * 1000;
    jobs.push({ g: g, delay: delay });
  });
  jobs.forEach(function(j){ j.g.classList.remove('sweep'); });
  void document.documentElement.offsetWidth;
  jobs.forEach(function(j){
    setTimeout(function(){
      if(!document.contains(j.g)) return;
      j.g.classList.add('sweep');
      j.g.addEventListener('animationend', function(){ j.g.classList.remove('sweep'); }, { once: true });
    }, j.delay + 60);
  });
}

function initReveal(){
  document.querySelectorAll('.glass, .stat').forEach(function(el){
    if(!el.closest('.reas')) addGlare(el);
  });

  var rvEls = Array.prototype.slice.call(document.querySelectorAll('.rv'));
  var zeEls = Array.prototype.slice.call(document.querySelectorAll('.ze-reveal-wrap'));

  if(!('IntersectionObserver' in window)){
    rvEls.forEach(function(el){ el.classList.add('on'); });
    zeEls.forEach(function(el){ el.classList.add('ze-on'); });
    return;
  }

  var pendingRv = new Set(), pendingZe = new Set();
  var queue = new Set(), rafPending = false;

  function flush(){
    rafPending = false;
    var els = Array.from(queue); queue.clear();
    els.forEach(function(el){ el.classList.add('on'); });
    fireGlareBatch(els);
  }
  function enqueue(el){
    pendingRv.delete(el); revealObs.unobserve(el);
    queue.add(el);
    if(!rafPending){ rafPending = true; requestAnimationFrame(flush); }
  }

  var revealObs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){

      if(e.isIntersecting || e.boundingClientRect.top < 0) enqueue(e.target);
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

  var zeObs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting || e.boundingClientRect.top < 0){
        e.target.classList.add('ze-on');
        pendingZe.delete(e.target); zeObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  var vh = window.innerHeight;
  var rvTop = rvEls.map(function(el){ return el.getBoundingClientRect().top; });
  var zeTop = zeEls.map(function(el){ return el.getBoundingClientRect().top; });

  var initialRv = [], initialZe = [];
  rvEls.forEach(function(el, i){

    if(rvTop[i] < vh) initialRv.push(el);
    else { pendingRv.add(el); revealObs.observe(el); }
  });
  zeEls.forEach(function(el, i){
    if(zeTop[i] < vh) initialZe.push(el);
    else { pendingZe.add(el); zeObs.observe(el); }
  });

  requestAnimationFrame(function(){ requestAnimationFrame(function(){
    initialRv.forEach(function(el){ el.classList.add('on'); });
    initialZe.forEach(function(el){ el.classList.add('ze-on'); });
    fireGlareBatch(initialRv);
  }); });

  function sweep(){
    var h = window.innerHeight;
    Array.from(pendingRv).forEach(function(el){ if(el.getBoundingClientRect().top < h) enqueue(el); });
    Array.from(pendingZe).forEach(function(el){
      if(el.getBoundingClientRect().top < h){ el.classList.add('ze-on'); pendingZe.delete(el); zeObs.unobserve(el); }
    });
  }
  window.addEventListener('load', function(){ sweep(); setTimeout(sweep, 400); });
  window.addEventListener('pageshow', function(e){ if(e.persisted) sweep(); });
}

if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initReveal);
else initReveal();
