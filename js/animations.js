(function(){
  var noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LOOKAHEAD = 1.18;
  var CLEANUP_MS = 900;
  var REVEAL_CLASSES = ['rv', 'rl', 'rr', 'rs', 'on'];

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
        if(!j.g.isConnected) return;
        j.g.classList.add('sweep');
        j.g.addEventListener('animationend', function(){ j.g.classList.remove('sweep'); }, { once: true });
      }, j.delay + 60);
    });
  }

  function scheduleCleanup(list){
    if(!list.length) return;
    setTimeout(function(){
      list.forEach(function(el){
        REVEAL_CLASSES.forEach(function(c){ el.classList.remove(c); });
      });
    }, CLEANUP_MS);
  }

  function whenPageReady(cb){
    var done = false;
    function go(){ if(done) return; done = true; cb(); }
    if(window.__pageReady) return go();
    document.addEventListener('pageready', go, { once: true });
    setTimeout(go, 2500);
  }

  function init(){
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
    var queue = new Set(), flushScheduled = false;
    var revealObs, zeObs;

    function reveal(els){
      if(!els.length) return;
      els.forEach(function(el){ el.classList.add('on'); });
      fireGlareBatch(els);
      scheduleCleanup(els);
    }

    function flush(){
      flushScheduled = false;
      var els = Array.from(queue);
      queue.clear();
      reveal(els);
    }

    function enqueue(el){
      pendingRv.delete(el);
      revealObs.unobserve(el);
      queue.add(el);
      if(!flushScheduled){ flushScheduled = true; Promise.resolve().then(flush); }
    }

    function revealZe(el){
      el.classList.add('ze-on');
      pendingZe.delete(el);
      zeObs.unobserve(el);
    }

    revealObs = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting || e.boundingClientRect.top < 0) enqueue(e.target);
      });
    }, { threshold: 0, rootMargin: '0px 0px 18% 0px' });

    zeObs = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting || e.boundingClientRect.top < 0) revealZe(e.target);
      });
    }, { threshold: 0, rootMargin: '0px 0px 18% 0px' });

    var vh = window.innerHeight;
    var rvTop = rvEls.map(function(el){ return el.getBoundingClientRect().top; });
    var zeTop = zeEls.map(function(el){ return el.getBoundingClientRect().top; });

    var initialRv = [], initialZe = [];
    rvEls.forEach(function(el, i){
      if(rvTop[i] < vh * LOOKAHEAD) initialRv.push(el);
      else { pendingRv.add(el); revealObs.observe(el); }
    });
    zeEls.forEach(function(el, i){
      if(zeTop[i] < vh * LOOKAHEAD) initialZe.push(el);
      else { pendingZe.add(el); zeObs.observe(el); }
    });

    whenPageReady(function(){
      requestAnimationFrame(function(){ requestAnimationFrame(function(){
        reveal(initialRv);
        initialZe.forEach(function(el){ el.classList.add('ze-on'); });
      }); });
    });

    function sweep(){
      var h = window.innerHeight * LOOKAHEAD;
      Array.from(pendingRv).forEach(function(el){
        if(el.getBoundingClientRect().top < h) enqueue(el);
      });
      Array.from(pendingZe).forEach(function(el){
        if(el.getBoundingClientRect().top < h) revealZe(el);
      });
    }
    window.addEventListener('load', function(){ sweep(); setTimeout(sweep, 400); });
    window.addEventListener('pageshow', function(e){ if(e.persisted) sweep(); });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
