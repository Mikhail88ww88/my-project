// ===== KINETIC TYPOGRAPHY =====
const words = ['сайты', 'приложения', 'AI-агентов'];
let wordIndex = 0;
const el = document.getElementById('heroChanging');

function changeWord() {
  el.style.opacity = '0';
  el.style.transform = 'translateY(-10px)';
  setTimeout(() => {
    wordIndex = (wordIndex + 1) % words.length;
    el.textContent = words[wordIndex];
    el.style.transition = 'opacity 0.4s, transform 0.4s';
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  }, 300);
}

el.style.transition = 'opacity 0.4s, transform 0.4s';
setInterval(changeWord, 2500);

// ===== SCROLL ANIMATIONS =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.15 });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// ===== FAQ =====
document.querySelectorAll('.faq-q').forEach(q => {
  q.addEventListener('click', () => {
    const item = q.parentElement;
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// ===== BURGER MENU =====
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');

burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    burger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

document.addEventListener('click', (e) => {
  if (!burger.contains(e.target) && !navLinks.contains(e.target)) {
    burger.classList.remove('open');
    navLinks.classList.remove('open');
  }
});

// ===== FORM SUBMIT =====
function submitForm() {
  const name = document.getElementById('fieldName').value.trim();
  const phone = document.getElementById('fieldEmail').value.trim();

  if (!name) { shakeField('fieldName'); return; }
  if (!phone) { shakeField('fieldEmail'); return; }

  const btn = document.querySelector('.btn-submit');
  btn.textContent = 'Отправляем...';
  btn.disabled = true;

  setTimeout(() => {
    document.getElementById('formFields').classList.add('hide');
    document.getElementById('formSuccess').classList.add('show');
  }, 800);
}

function shakeField(id) {
  const el = document.getElementById(id);
  el.style.borderColor = '#ef4444';
  el.style.animation = 'shake 0.4s ease';
  el.addEventListener('animationend', () => el.style.animation = '', { once: true });
  el.focus();
}

// ===== NAV + PARALLAX + SCROLL TO TOP =====
const heroSection = document.getElementById('hero');

window.addEventListener('scroll', () => {
  const nav = document.getElementById('nav');
  const scrollY = window.scrollY;

  // Nav opacity
  nav.style.background = scrollY > 50 ? 'rgba(10,10,10,0.95)' : 'rgba(10,10,10,0.8)';

  // Parallax hero
  const heroContent = heroSection.querySelector('.hero-content');
  if (scrollY < window.innerHeight) {
    heroContent.style.transform = `translateY(${scrollY * 0.3}px)`;
    heroContent.style.opacity = 1 - scrollY / (window.innerHeight * 0.8);
  }

  // Scroll to top button
  const scrollBtn = document.getElementById('scrollTop');
  scrollBtn.classList.toggle('visible', scrollY > 400);
});

// ===== CURSOR GLOW =====
const cursorGlow = document.getElementById('cursor-glow');
let mouseX = 0, mouseY = 0, glowX = 0, glowY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animateGlow() {
  glowX += (mouseX - glowX) * 0.08;
  glowY += (mouseY - glowY) * 0.08;
  cursorGlow.style.left = glowX + 'px';
  cursorGlow.style.top = glowY + 'px';
  requestAnimationFrame(animateGlow);
}
animateGlow();

// ===== FLOATING PARTICLES =====
const particlesContainer = document.getElementById('particles');

function createParticle() {
  const p = document.createElement('div');
  p.className = 'particle';
  p.style.left = Math.random() * 100 + '%';
  p.style.bottom = '0';
  const size = Math.random() * 3 + 1;
  p.style.width = size + 'px';
  p.style.height = size + 'px';
  const duration = Math.random() * 8 + 6;
  p.style.animationDuration = duration + 's';
  p.style.animationDelay = Math.random() * 4 + 's';
  particlesContainer.appendChild(p);
  setTimeout(() => p.remove(), (duration + 4) * 1000);
}

setInterval(createParticle, 600);
for (let i = 0; i < 8; i++) createParticle();

// ===== COUNTER ANIMATION =====
function animateCounter(el, target) {
  const num = parseInt(target.replace(/[^0-9]/g, ''));
  if (isNaN(num)) return;
  let start = 0;
  const timer = setInterval(() => {
    start += Math.ceil(num / 40);
    if (start >= num) {
      el.textContent = target;
      clearInterval(timer);
    } else {
      el.textContent = start + (target.includes('+') ? '+' : '');
    }
  }, 1500 / num);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      document.querySelectorAll('.stat-num').forEach(el => animateCounter(el, el.textContent));
      statsObserver.disconnect();
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) statsObserver.observe(heroStats);

// ===== MAGNETIC BUTTONS =====
document.querySelectorAll('.btn-primary').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px) translateY(-2px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});
