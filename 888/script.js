// ===========================
// REGION NAME (мультилендинг) — отключено
// ===========================
/* (function() {
  var match = new RegExp('[?&]region_name=([^&]*)').exec(window.location.search);
  if (match) {
    var region = decodeURIComponent(match[1].replace(/\+/g, ' '));
    var el = document.getElementById('js-region');
    if (el && region) {
      el.textContent = 'В ' + region;
      el.style.display = '';
    }
  }
})(); */

// ===========================
// UTM + YANDEX CLIENT ID
// ===========================
(function() {
  function getParam(name) {
    var match = new RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match ? decodeURIComponent(match[1].replace(/\+/g, ' ')) : '';
  }

  var utmFields = {
    'utm_source':   getParam('utm_source'),
    'utm_campaign': getParam('utm_campaign'),
    'utm_medium':   getParam('utm_medium'),
    'utm_keyword':  getParam('utm_keyword') || getParam('utm_term'),
    'utm_content':  getParam('utm_content'),
    'page_url':     window.location.href,
    'referer':      document.referrer || '',
  };

  // Сохраняем UTM в sessionStorage чтобы не потерять при переходах
  Object.keys(utmFields).forEach(function(key) {
    if (utmFields[key]) sessionStorage.setItem(key, utmFields[key]);
    else if (sessionStorage.getItem(key)) utmFields[key] = sessionStorage.getItem(key);
  });

  function fillForms() {
    // UTM поля
    Object.keys(utmFields).forEach(function(key) {
      document.querySelectorAll('.js-' + key.replace(/_/g, '-')).forEach(function(el) {
        el.value = utmFields[key] || '';
      });
    });

    // Yandex ClientID
    if (typeof ym !== 'undefined') {
      ym(99820099, 'getClientID', function(id) {
        document.querySelectorAll('.js-ym-client-id').forEach(function(el) {
          el.value = id || '';
        });
      });
    }
  }

  // Заполняем сразу и при открытии модалки
  document.addEventListener('DOMContentLoaded', fillForms);
  document.addEventListener('modalOpen', fillForms);
})();

// ===========================
// MODAL
// ===========================
var overlay   = document.querySelector('.js-modal-overlay');
var openBtns  = document.querySelectorAll('.js-open-modal');
var closeBtn  = document.querySelector('.js-close-modal');

function openModal() {
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  document.dispatchEvent(new Event('modalOpen'));
}

function closeModal() {
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

openBtns.forEach(function(btn) {
  btn.addEventListener('click', openModal);
});

if (closeBtn) {
  closeBtn.addEventListener('click', closeModal);
}

overlay.addEventListener('click', function(e) {
  if (e.target === overlay) closeModal();
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeModal();
});

// ===========================
// FORMS — phone mask + YM goal
// ===========================
var forms = document.querySelectorAll('.js-form');

forms.forEach(function(form) {
  var submitBtn = form.querySelector('[data-ym_goal]');

  // Phone mask
  var phoneInput = form.querySelector('input[type="tel"]');
  if (phoneInput) {
    phoneInput.addEventListener('input', function() {
      var val = this.value.replace(/\D/g, '');
      if (val.length > 11) val = val.slice(0, 11);
      if (val.length === 0) {
        this.value = '';
      } else if (val[0] === '7' || val[0] === '8') {
        val = '7' + val.slice(1);
        var formatted = '+7';
        if (val.length > 1) formatted += ' (' + val.slice(1, 4);
        if (val.length >= 4) formatted += ') ' + val.slice(4, 7);
        if (val.length >= 7) formatted += '-' + val.slice(7, 9);
        if (val.length >= 9) formatted += '-' + val.slice(9, 11);
        this.value = formatted;
      } else {
        this.value = '+' + val;
      }
    });

    phoneInput.addEventListener('keydown', function(e) {
      if (e.key === 'Backspace' && this.value.length <= 2) {
        this.value = '';
      }
    });
  }

  // Submit — мгновенный редирект, отправка в фоне
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var phoneInput = form.querySelector('input[type="tel"]');
    var digits = phoneInput ? phoneInput.value.replace(/\D/g, '') : '';
    if (digits.length < 10) {
      phoneInput.focus();
      return;
    }
    var goal = submitBtn ? submitBtn.getAttribute('data-ym_goal') : 'zayavka';
    if (typeof ym !== 'undefined') {
      ym(99820099, 'reachGoal', goal);
    }
    fetch('send.php', { method: 'POST', body: new FormData(form) });
    window.location.href = window.__thankYouUrl || 'spasibomum.html';
  });
});

// ===========================
// VIDEO PLAY BUTTONS
// ===========================
document.querySelectorAll('.video-wrap').forEach(function(wrap) {
  var video = wrap.querySelector('video');
  var btn   = wrap.querySelector('.video-play-btn');

  wrap.addEventListener('click', function() {
    btn.classList.add('hidden');
    video.controls = true;
    video.play();
  });

  video.addEventListener('pause', function() {
    btn.classList.remove('hidden');
  });

  video.addEventListener('play', function() {
    btn.classList.add('hidden');
  });
});

// ===========================
// SLIDERS (gallery + reviews)
// ===========================
function initSlider(wrap, interval) {
  var track    = wrap.querySelector('.slider__track');
  var slides   = wrap.querySelectorAll('.slider__slide');
  var prevBtn  = wrap.querySelector('.slider__arrow--prev');
  var nextBtn  = wrap.querySelector('.slider__arrow--next');
  var dotsWrap = wrap.querySelector('.slider__dots');
  var current  = 0;
  var total    = slides.length;
  var autoTimer;

  slides.forEach(function(_, i) {
    var dot = document.createElement('button');
    dot.className = 'slider__dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', function() { goTo(i); });
    dotsWrap.appendChild(dot);
  });

  function goTo(index) {
    current = (index + total) % total;
    track.style.transform = 'translateX(-' + current * 100 + '%)';
    wrap.querySelectorAll('.slider__dot').forEach(function(d, i) {
      d.classList.toggle('active', i === current);
    });
    resetAuto();
  }

  prevBtn.addEventListener('click', function() { goTo(current - 1); });
  nextBtn.addEventListener('click', function() { goTo(current + 1); });

  var startX = 0;
  track.addEventListener('touchstart', function(e) { startX = e.touches[0].clientX; }, {passive: true});
  track.addEventListener('touchend', function(e) {
    var diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(current + (diff > 0 ? 1 : -1));
  });

  function resetAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(function() { goTo(current + 1); }, interval || 4000);
  }
  resetAuto();
}

var galleryWrap = document.querySelector('.gallery .slider');
if (galleryWrap) initSlider(galleryWrap, 4000);

var reviewsWrap = document.querySelector('.reviews .slider');
if (reviewsWrap) initSlider(reviewsWrap, 5000);

// ===========================
// FAQ ACCORDION
// ===========================
var faqItems = document.querySelectorAll('.faq__question');

faqItems.forEach(function(btn) {
  btn.addEventListener('click', function() {
    var answer  = this.parentElement.querySelector('.faq__answer');
    var isOpen  = this.classList.contains('active');

    // Close all
    faqItems.forEach(function(b) {
      b.classList.remove('active');
      b.parentElement.querySelector('.faq__answer').classList.remove('open');
    });

    // Open clicked (if it was closed)
    if (!isOpen) {
      this.classList.add('active');
      answer.classList.add('open');
    }
  });
});

// ===========================
// HEADER — hide on scroll down, show on scroll up
// ===========================
var header    = document.querySelector('.header');
var lastScroll = 0;

window.addEventListener('scroll', function() {
  var current = window.pageYOffset;
  if (current <= 80) {
    header.style.transform = 'translateY(0)';
  } else if (current > lastScroll) {
    header.style.transform = 'translateY(-100%)';
    header.style.transition = 'transform 0.3s ease';
  } else {
    header.style.transform = 'translateY(0)';
    header.style.transition = 'transform 0.3s ease';
  }
  lastScroll = current;
});

