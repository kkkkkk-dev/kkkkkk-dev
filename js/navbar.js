/* ══════════════════════════════════════════════
   SMOOTH ANCHOR SCROLL
══════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(function(a){
  a.addEventListener('click', function(e){
    var el = document.getElementById(this.getAttribute('href').slice(1));
    if(el){
      e.preventDefault();
      el.scrollIntoView({behavior:'smooth'});
      var mob = document.getElementById('mob');
      if(mob) mob.classList.remove('open');
    }
  });
});

/* ══════════════════════════════════════════════
   HAMBURGER MENU
══════════════════════════════════════════════ */
var ham = document.getElementById('ham');
var mob = document.getElementById('mob');
if(ham && mob){
  ham.addEventListener('click', function(){ mob.classList.toggle('open'); });
  mob.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){ mob.classList.remove('open'); });
  });
}

/* ══════════════════════════════════════════════
   STICKY NAVBAR
══════════════════════════════════════════════ */
var navbar = document.querySelector('.navbar');
window.addEventListener('scroll', function(){
  navbar.classList.toggle('stuck', window.scrollY > 8);
}, { passive: true });
