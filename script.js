/* ============================================================
   ELITE RAW FITNESS — SCRIPT.JS
   All interactive behaviour
   ============================================================ */

(function () {
  'use strict';

  /* ---------- HELPERS ---------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     LOADER
     ============================================================ */
  const loader = $('#loader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.classList.remove('loading');
    }, 1100);
  });

  setTimeout(() => {
    if (!loader.classList.contains('hidden')) {
      loader.classList.add('hidden');
      document.body.classList.remove('loading');
    }
  }, 3500);

  /* ============================================================
     STICKY NAVBAR
     ============================================================ */
  const navbar = $('#navbar');
  const onScrollNav = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  /* ============================================================
     MOBILE MENU
     ============================================================ */
  const hamburger = $('#hamburger');
  const navLinks = $('#navLinks');
  const closeMenu = () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  };

  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    hamburger.classList.toggle('active', open);
    hamburger.setAttribute('aria-expanded', String(open));
  });

  $$('.nav-link', navLinks).forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('open') &&
        !navLinks.contains(e.target) &&
        !hamburger.contains(e.target)) {
      closeMenu();
    }
  });

  /* ============================================================
     SMOOTH SCROLL & ACTIVE NAV LINK
     ============================================================ */
  const sections = $$('section[id]');

  const setActiveLink = () => {
    const scrollY = window.scrollY + 120;
    let current = 'home';
    sections.forEach(sec => {
      if (scrollY >= sec.offsetTop) current = sec.id;
    });
    $$('.nav-link').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  };

  window.addEventListener('scroll', setActiveLink, { passive: true });
  setActiveLink();

  /* ============================================================
     REVEAL ON SCROLL (IntersectionObserver)
     ============================================================ */
  const revealEls = $$('.reveal');

  if (prefersReducedMotion) {
    revealEls.forEach(el => el.classList.add('visible'));
  } else if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const parent = entry.target.parentElement;
          if (parent && (parent.classList.contains('facilities-grid') ||
                         parent.classList.contains('why-grid') ||
                         parent.classList.contains('gallery-grid'))) {
            const siblings = $$('.reveal', parent);
            const idx = siblings.indexOf(entry.target);
            entry.target.style.transitionDelay = (idx * 0.08) + 's';
          }
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  /* ============================================================
     GALLERY LIGHTBOX
     ============================================================ */
  const galleryImages = [
    'gym-1.jpeg',
    'gym-2.jpeg',
    'gym-3.jpeg',
    'gym-4.jpeg'
  ];

  const lightbox = $('#lightbox');
  const lightboxImg = $('.lightbox-img', lightbox);
  const lightboxClose = $('.lightbox-close', lightbox);
  const lightboxPrev = $('.prev', lightbox);
  const lightboxNext = $('.next', lightbox);

  let currentIndex = 0;

  const openLightbox = (index) => {
    currentIndex = index;
    lightboxImg.src = galleryImages[currentIndex];
    lightboxImg.alt = 'Elite Raw Fitness gallery image ' + (currentIndex + 1);
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const showImage = (dir) => {
    currentIndex = (currentIndex + dir + galleryImages.length) % galleryImages.length;
    lightboxImg.src = galleryImages[currentIndex];
    lightboxImg.alt = 'Elite Raw Fitness gallery image ' + (currentIndex + 1);
  };

  $$('.gallery-item').forEach((item) => {
    item.addEventListener('click', () => {
      const idx = parseInt(item.dataset.index, 10) || 0;
      openLightbox(idx);
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', () => showImage(-1));
  lightboxNext.addEventListener('click', () => showImage(1));

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showImage(-1);
    if (e.key === 'ArrowRight') showImage(1);
  });

  /* ============================================================
     MEMBERSHIP FORM VALIDATION + WHATSAPP INTEGRATION
     ============================================================ */
  // ⚠️ OWNER: REPLACE THE PLACEHOLDER NUMBER BELOW WITH THE ACTUAL GYM WHATSAPP NUMBER
  // Format: country code + number, no spaces, no "+" e.g. "919876543210"
  const GYM_WHATSAPP_NUMBER = '91XXXXXXXXXX'; // ← EDIT THIS

  const form = $('#membershipForm');
  const nameInput = $('#fullName');
  const phoneInput = $('#phone');
  const interestSelect = $('#interest');
  const messageInput = $('#message');

  const nameError = $('#nameError');
  const phoneError = $('#phoneError');
  const interestError = $('#interestError');

  const showError = (el, msg) => { el.textContent = msg; };
  const clearError = (el) => { el.textContent = ''; };

  const clearFieldError = (input, errorEl) => {
    input.classList.remove('invalid');
    clearError(errorEl);
  };

  nameInput.addEventListener('input', () => clearFieldError(nameInput, nameError));
  phoneInput.addEventListener('input', () => clearFieldError(phoneInput, phoneError));
  interestSelect.addEventListener('change', () => clearFieldError(interestSelect, interestError));

  const validateForm = () => {
    let valid = true;

    const name = nameInput.value.trim();
    if (name.length < 2) {
      nameInput.classList.add('invalid');
      showError(nameError, 'Please enter your full name (min 2 characters).');
      valid = false;
    } else {
      clearFieldError(nameInput, nameError);
    }

    const phone = phoneInput.value.trim().replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(phone)) {
      phoneInput.classList.add('invalid');
      showError(phoneError, 'Enter a valid 10-digit Indian mobile number.');
      valid = false;
    } else {
      clearFieldError(phoneInput, phoneError);
    }

    if (!interestSelect.value) {
      interestSelect.classList.add('invalid');
      showError(interestError, 'Please select a membership interest.');
      valid = false;
    } else {
      clearFieldError(interestSelect, interestError);
    }

    return valid;
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim().replace(/\D/g, '');
    const interest = interestSelect.value;
    const message = messageInput.value.trim();

    const text =
      `*ELITE RAW FITNESS – Membership Enquiry*%0A%0A` +
      `*Name:* ${encodeURIComponent(name)}%0A` +
      `*Phone:* ${encodeURIComponent(phone)}%0A` +
      `*Interest:* ${encodeURIComponent(interest)}%0A` +
      (message ? `*Message:* ${encodeURIComponent(message)}%0A` : '') +
      `%0A_Sent from the Elite Raw Fitness website._`;

    const waUrl = `https://wa.me/${GYM_WHATSAPP_NUMBER}?text=${text}`;
    window.open(waUrl, '_blank', 'noopener');

    form.reset();
    $$('.error', form).forEach(el => (el.textContent = ''));
    $$('.invalid', form).forEach(el => el.classList.remove('invalid'));
  });

  /* ============================================================
     BACK TO TOP
     ============================================================ */
  const backToTop = $('#backToTop');

  const onScrollBackToTop = () => {
    backToTop.classList.toggle('visible', window.scrollY > 500);
  };

  window.addEventListener('scroll', onScrollBackToTop, { passive: true });
  onScrollBackToTop();

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

  /* ============================================================
     FOOTER YEAR
     ============================================================ */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ============================================================
     SUBTLE PARALLAX (HERO & MOTIVATIONAL)
     ============================================================ */
  if (!prefersReducedMotion) {
    const heroBg = $('.hero-bg');
    const motivBg = $('.motivational-bg');

    let ticking = false;
    const applyParallax = () => {
      const y = window.scrollY;
      if (heroBg && y < window.innerHeight * 1.2) {
        heroBg.style.transform = `scale(1.08) translateY(${y * 0.18}px)`;
      }
      if (motivBg) {
        const rect = motivBg.parentElement.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          const offset = (window.innerHeight - rect.top) * 0.06;
          motivBg.style.backgroundPosition = `center calc(50% + ${offset}px)`;
        }
      }
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(applyParallax);
        ticking = true;
      }
    }, { passive: true });
  }

  /* ============================================================
     NAVBAR LINK SMOOTH SCROLL FALLBACK
     ============================================================ */
  if (!('scrollBehavior' in document.documentElement.style)) {
    $$('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          e.preventDefault();
          window.scrollTo({
            top: target.offsetTop - 70,
            behavior: 'smooth'
          });
        }
      });
    });
  }

})();
