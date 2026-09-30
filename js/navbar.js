(function(){
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ham = document.getElementById('ham');
  var mob = document.getElementById('mob');
  var navbar = document.querySelector('.navbar');

  function setMenu(open){
    if(!mob) return;
    mob.classList.toggle('open', open);
    if(ham) ham.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var id = this.getAttribute('href').slice(1);
      var el = id ? document.getElementById(id) : null;
      if(!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      setMenu(false);
    });
  });

  if(ham && mob){
    ham.addEventListener('click', function(e){
      e.stopPropagation();
      setMenu(!mob.classList.contains('open'));
    });
    mob.addEventListener('click', function(e){ e.stopPropagation(); });
    document.addEventListener('click', function(){ setMenu(false); });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape') setMenu(false); });
    window.addEventListener('resize', function(){ if(window.innerWidth > 700) setMenu(false); }, { passive: true });
  }

  if(navbar){
    var stuck = false, ticking = false;
    function update(){
      ticking = false;
      var next = window.scrollY > 8;
      if(next !== stuck){
        stuck = next;
        navbar.classList.toggle('stuck', stuck);
      }
    }
    window.addEventListener('scroll', function(){
      if(!ticking){ ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }
})();
