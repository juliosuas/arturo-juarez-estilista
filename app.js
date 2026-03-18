/* ═══════════════════════════════════════════════════════════════
   Arturo Juárez — Estilista | Main Application Script
   Premium barbershop experience in Acapulco & CDMX
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─── Utility Functions ────────────────────────────────────── */

/**
 * Debounce function for performance-critical events
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in ms
 * @returns {Function}
 */
function debounce(fn, delay = 100) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Throttle function for scroll events
 * @param {Function} fn - Function to throttle
 * @param {number} limit - Minimum time between calls in ms
 * @returns {Function}
 */
function throttle(fn, limit = 16) {
  let inThrottle = false;
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
}

/**
 * Select a single DOM element
 * @param {string} selector
 * @param {Element} parent
 * @returns {Element|null}
 */
function $(selector, parent = document) {
  return parent.querySelector(selector);
}

/**
 * Select multiple DOM elements
 * @param {string} selector
 * @param {Element} parent
 * @returns {NodeList}
 */
function $$(selector, parent = document) {
  return parent.querySelectorAll(selector);
}

/* ═══════════════════════════════════════════════════════════════
   PRELOADER
   ═══════════════════════════════════════════════════════════════ */
const Preloader = {
  el: null,

  init() {
    this.el = $('#preloader');
    if (!this.el) return;

    // Hide preloader after page load
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.el.classList.add('is-hidden');
        document.body.classList.remove('no-scroll');
        // Remove from DOM after animation
        setTimeout(() => {
          this.el.remove();
        }, 600);
      }, 800);
    });

    // Fallback: hide after 3 seconds regardless
    setTimeout(() => {
      if (this.el && !this.el.classList.contains('is-hidden')) {
        this.el.classList.add('is-hidden');
        document.body.classList.remove('no-scroll');
      }
    }, 3000);
  }
};

/* ═══════════════════════════════════════════════════════════════
   NAVIGATION
   ═══════════════════════════════════════════════════════════════ */
const Navigation = {
  nav: null,
  hamburger: null,
  mobileMenu: null,
  links: [],
  sections: [],
  isMenuOpen: false,
  lastScrollY: 0,
  navHeight: 72,

  init() {
    this.nav = $('#nav');
    this.hamburger = $('#navHamburger');
    this.mobileMenu = $('#mobileMenu');
    this.links = $$('.nav__link');
    this.sections = $$('section[id]');
    this.navHeight = this.nav ? this.nav.offsetHeight : 72;

    if (!this.nav) return;

    this.bindEvents();
    this.handleScroll();
  },

  bindEvents() {
    // Hamburger toggle
    if (this.hamburger) {
      this.hamburger.addEventListener('click', () => this.toggleMenu());
    }

    // Mobile links close menu
    $$('.nav__mobile-link').forEach(link => {
      link.addEventListener('click', () => this.closeMenu());
    });

    // Scroll handling
    window.addEventListener('scroll', throttle(() => this.handleScroll(), 50), { passive: true });

    // Smooth scroll for all anchor links
    $$('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => this.smoothScroll(e));
    });

    // Close menu on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isMenuOpen) {
        this.closeMenu();
      }
    });

    // Close menu on resize if open
    window.addEventListener('resize', debounce(() => {
      if (window.innerWidth >= 1024 && this.isMenuOpen) {
        this.closeMenu();
      }
    }, 200));
  },

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;

    this.hamburger.classList.toggle('is-active', this.isMenuOpen);
    this.hamburger.setAttribute('aria-expanded', this.isMenuOpen);
    this.mobileMenu.classList.toggle('is-open', this.isMenuOpen);
    this.mobileMenu.setAttribute('aria-hidden', !this.isMenuOpen);
    document.body.classList.toggle('no-scroll', this.isMenuOpen);

    // Force scrolled state when menu is open
    if (this.isMenuOpen) {
      this.hamburger.querySelectorAll('.nav__hamburger-line').forEach(line => {
        line.style.backgroundColor = 'var(--color-cream)';
      });
    } else {
      this.hamburger.querySelectorAll('.nav__hamburger-line').forEach(line => {
        line.style.backgroundColor = '';
      });
    }
  },

  closeMenu() {
    if (!this.isMenuOpen) return;
    this.isMenuOpen = false;

    this.hamburger.classList.remove('is-active');
    this.hamburger.setAttribute('aria-expanded', false);
    this.mobileMenu.classList.remove('is-open');
    this.mobileMenu.setAttribute('aria-hidden', true);
    document.body.classList.remove('no-scroll');
    this.hamburger.querySelectorAll('.nav__hamburger-line').forEach(line => {
      line.style.backgroundColor = '';
    });
  },

  handleScroll() {
    const scrollY = window.scrollY;

    // Toggle scrolled state
    if (scrollY > 50) {
      this.nav.classList.add('is-scrolled');
    } else {
      this.nav.classList.remove('is-scrolled');
    }

    // Update active nav link based on scroll position
    this.updateActiveLink(scrollY);

    this.lastScrollY = scrollY;
  },

  updateActiveLink(scrollY) {
    let currentSection = '';

    this.sections.forEach(section => {
      const sectionTop = section.offsetTop - this.navHeight - 100;
      const sectionHeight = section.offsetHeight;

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });

    this.links.forEach(link => {
      link.classList.toggle(
        'is-active',
        link.getAttribute('href') === `#${currentSection}`
      );
    });
  },

  smoothScroll(e) {
    const href = e.currentTarget.getAttribute('href');
    if (!href || !href.startsWith('#')) return;

    e.preventDefault();

    const target = $(href);
    if (!target) return;

    const offsetTop = target.offsetTop - this.navHeight;

    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    });
  }
};

/* ═══════════════════════════════════════════════════════════════
   THEME TOGGLE (Dark Mode)
   ═══════════════════════════════════════════════════════════════ */
const ThemeToggle = {
  toggle: null,
  currentTheme: 'light',

  init() {
    this.toggle = $('#themeToggle');
    if (!this.toggle) return;

    // Check saved preference or system preference
    const savedTheme = localStorage.getItem('aj-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    this.currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    this.applyTheme(this.currentTheme);

    this.toggle.addEventListener('click', () => this.toggleTheme());

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('aj-theme')) {
        this.applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  },

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(this.currentTheme);
    localStorage.setItem('aj-theme', this.currentTheme);
  },

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.currentTheme = theme;
  }
};

/* ═══════════════════════════════════════════════════════════════
   SCROLL REVEAL ANIMATIONS (Intersection Observer)
   ═══════════════════════════════════════════════════════════════ */
const ScrollReveal = {
  observer: null,

  init() {
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      $$('.reveal, .reveal-left').forEach(el => {
        el.classList.add('is-visible');
      });
      return;
    }

    const options = {
      root: null,
      rootMargin: '0px 0px -80px 0px',
      threshold: 0.1
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.delay || 0);
          setTimeout(() => {
            entry.target.classList.add('is-visible');
          }, delay);
          this.observer.unobserve(entry.target);
        }
      });
    }, options);

    $$('.reveal, .reveal-left').forEach(el => {
      this.observer.observe(el);
    });
  }
};

/* ═══════════════════════════════════════════════════════════════
   COUNTER ANIMATION (About Section Stats)
   ═══════════════════════════════════════════════════════════════ */
const CounterAnimation = {
  observer: null,

  init() {
    const counters = $$('[data-count]');
    if (!counters.length) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      counters.forEach(counter => {
        counter.textContent = this.formatNumber(parseInt(counter.dataset.count));
      });
      return;
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateCounter(entry.target);
          this.observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => this.observer.observe(counter));
  },

  animateCounter(el) {
    const target = parseInt(el.dataset.count);
    const duration = 2000;
    const startTime = performance.now();

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out quart
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = Math.round(eased * target);

      el.textContent = this.formatNumber(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  },

  formatNumber(num) {
    if (num >= 1000) {
      return num.toLocaleString('es-MX');
    }
    return num.toString();
  }
};

/* ═══════════════════════════════════════════════════════════════
   TESTIMONIALS SLIDER
   ═══════════════════════════════════════════════════════════════ */
const TestimonialsSlider = {
  track: null,
  slides: [],
  dots: null,
  prevBtn: null,
  nextBtn: null,
  currentIndex: 0,
  autoplayTimer: null,
  touchStartX: 0,
  touchEndX: 0,

  init() {
    this.track = $('.testimonials__track');
    this.slides = $$('.testimonial');
    this.dots = $('#testimonialDots');
    this.prevBtn = $('#testimonialPrev');
    this.nextBtn = $('#testimonialNext');

    if (!this.track || this.slides.length < 2) return;

    this.createDots();
    this.bindEvents();
    this.goTo(0);
    this.startAutoplay();
  },

  createDots() {
    if (!this.dots) return;

    this.slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = `testimonials__dot${i === 0 ? ' is-active' : ''}`;
      dot.setAttribute('aria-label', `Testimonial ${i + 1}`);
      dot.addEventListener('click', () => this.goTo(i));
      this.dots.appendChild(dot);
    });
  },

  bindEvents() {
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.prev());
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.next());
    }

    // Touch/swipe support
    this.track.addEventListener('touchstart', (e) => {
      this.touchStartX = e.changedTouches[0].screenX;
      this.stopAutoplay();
    }, { passive: true });

    this.track.addEventListener('touchend', (e) => {
      this.touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
      this.startAutoplay();
    }, { passive: true });

    // Pause autoplay on hover
    this.track.addEventListener('mouseenter', () => this.stopAutoplay());
    this.track.addEventListener('mouseleave', () => this.startAutoplay());
  },

  goTo(index) {
    if (index < 0) index = this.slides.length - 1;
    if (index >= this.slides.length) index = 0;

    this.currentIndex = index;

    // Move track
    this.slides.forEach((slide, i) => {
      slide.style.transform = `translateX(${(i - index) * 100}%)`;
    });

    // Update dots
    $$('.testimonials__dot', this.dots).forEach((dot, i) => {
      dot.classList.toggle('is-active', i === index);
    });
  },

  prev() {
    this.goTo(this.currentIndex - 1);
  },

  next() {
    this.goTo(this.currentIndex + 1);
  },

  handleSwipe() {
    const diff = this.touchStartX - this.touchEndX;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        this.next();
      } else {
        this.prev();
      }
    }
  },

  startAutoplay() {
    this.stopAutoplay();
    this.autoplayTimer = setInterval(() => this.next(), 6000);
  },

  stopAutoplay() {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }
};

/* ═══════════════════════════════════════════════════════════════
   MARQUEE ANIMATION (Duplicate Content for Seamless Loop)
   ═══════════════════════════════════════════════════════════════ */
const Marquee = {
  init() {
    const track = $('.marquee__track');
    const content = $('.marquee__content');

    if (!track || !content) return;

    // Clone content for seamless loop
    const clone = content.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  }
};

/* ═══════════════════════════════════════════════════════════════
   BACK TO TOP BUTTON
   ═══════════════════════════════════════════════════════════════ */
const BackToTop = {
  btn: null,

  init() {
    this.btn = $('#backToTop');
    if (!this.btn) return;

    window.addEventListener('scroll', throttle(() => {
      if (window.scrollY > 600) {
        this.btn.classList.add('is-visible');
      } else {
        this.btn.classList.remove('is-visible');
      }
    }, 100), { passive: true });

    this.btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
};

/* ═══════════════════════════════════════════════════════════════
   NEWSLETTER FORM
   ═══════════════════════════════════════════════════════════════ */
const Newsletter = {
  init() {
    const form = $('#newsletterForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const input = $('input[type="email"]', form);
      const email = input.value.trim();

      if (!email) return;

      // Simulate submission
      const btn = $('button', form);
      const originalText = btn.textContent;
      btn.textContent = '¡Gracias!';
      btn.disabled = true;
      input.value = '';

      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
      }, 3000);
    });
  }
};

/* ═══════════════════════════════════════════════════════════════
   PARALLAX EFFECT (Subtle on Hero)
   ═══════════════════════════════════════════════════════════════ */
const Parallax = {
  hero: null,
  heroContent: null,

  init() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this.hero = $('.hero');
    this.heroContent = $('.hero__content');

    if (!this.hero || !this.heroContent) return;

    window.addEventListener('scroll', throttle(() => this.onScroll(), 16), { passive: true });
  },

  onScroll() {
    const scrollY = window.scrollY;
    const heroHeight = this.hero.offsetHeight;

    if (scrollY > heroHeight) return;

    const progress = scrollY / heroHeight;

    // Parallax on hero content
    this.heroContent.style.transform = `translateY(${scrollY * 0.3}px)`;
    this.heroContent.style.opacity = 1 - progress * 1.5;
  }
};

/* ═══════════════════════════════════════════════════════════════
   LAZY LOADING FOR IFRAMES
   ═══════════════════════════════════════════════════════════════ */
const LazyIframes = {
  init() {
    const iframes = $$('iframe[loading="lazy"]');
    if (!iframes.length) return;

    // For browsers that don't support loading="lazy" on iframes
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const iframe = entry.target;
            if (iframe.dataset.src) {
              iframe.src = iframe.dataset.src;
            }
            observer.unobserve(iframe);
          }
        });
      }, { rootMargin: '200px' });

      iframes.forEach(iframe => observer.observe(iframe));
    }
  }
};

/* ═══════════════════════════════════════════════════════════════
   CURSOR TRAIL EFFECT (Desktop only, subtle)
   ═══════════════════════════════════════════════════════════════ */
const CursorEffect = {
  cursor: null,
  dot: null,
  mouseX: 0,
  mouseY: 0,
  cursorX: 0,
  cursorY: 0,
  dotX: 0,
  dotY: 0,

  init() {
    // Only on desktop, with no reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if ('ontouchstart' in window) return;
    if (window.innerWidth < 1024) return;

    this.createCursor();
    this.bindEvents();
    this.animate();
  },

  createCursor() {
    this.cursor = document.createElement('div');
    this.cursor.className = 'custom-cursor';
    this.cursor.style.cssText = `
      position: fixed;
      width: 32px;
      height: 32px;
      border: 1px solid var(--color-gold);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.3s, width 0.3s, height 0.3s, border-color 0.3s;
      transform: translate(-50%, -50%);
      mix-blend-mode: difference;
    `;

    this.dot = document.createElement('div');
    this.dot.className = 'custom-cursor-dot';
    this.dot.style.cssText = `
      position: fixed;
      width: 4px;
      height: 4px;
      background-color: var(--color-gold);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.3s;
      transform: translate(-50%, -50%);
    `;

    document.body.appendChild(this.cursor);
    document.body.appendChild(this.dot);
  },

  bindEvents() {
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      this.cursor.style.opacity = '1';
      this.dot.style.opacity = '1';
    });

    document.addEventListener('mouseleave', () => {
      this.cursor.style.opacity = '0';
      this.dot.style.opacity = '0';
    });

    // Hover effect on interactive elements
    $$('a, button, .gallery__item, .service-card, .product-card, .team-card__image').forEach(el => {
      el.addEventListener('mouseenter', () => {
        this.cursor.style.width = '48px';
        this.cursor.style.height = '48px';
        this.cursor.style.borderColor = 'var(--color-gold-light)';
      });
      el.addEventListener('mouseleave', () => {
        this.cursor.style.width = '32px';
        this.cursor.style.height = '32px';
        this.cursor.style.borderColor = 'var(--color-gold)';
      });
    });
  },

  animate() {
    // Smooth follow with lerp
    const lerp = (start, end, factor) => start + (end - start) * factor;

    this.cursorX = lerp(this.cursorX, this.mouseX, 0.12);
    this.cursorY = lerp(this.cursorY, this.mouseY, 0.12);
    this.dotX = lerp(this.dotX, this.mouseX, 0.8);
    this.dotY = lerp(this.dotY, this.mouseY, 0.8);

    this.cursor.style.left = `${this.cursorX}px`;
    this.cursor.style.top = `${this.cursorY}px`;
    this.dot.style.left = `${this.dotX}px`;
    this.dot.style.top = `${this.dotY}px`;

    requestAnimationFrame(() => this.animate());
  }
};

/* ═══════════════════════════════════════════════════════════════
   GALLERY LIGHTBOX (Simple Modal)
   ═══════════════════════════════════════════════════════════════ */
const Lightbox = {
  modal: null,
  isOpen: false,

  init() {
    this.createModal();

    $$('.gallery__item').forEach(item => {
      item.addEventListener('click', () => {
        const title = $('.gallery__overlay-title', item)?.textContent || '';
        const category = $('.gallery__overlay-cat', item)?.textContent || '';
        this.open(title, category);
      });
    });
  },

  createModal() {
    this.modal = document.createElement('div');
    this.modal.className = 'lightbox';
    this.modal.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 10000;
      background-color: rgba(15, 26, 43, 0.95);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    `;

    this.modal.innerHTML = `
      <div style="
        text-align: center;
        color: var(--color-cream);
        transform: translateY(20px);
        transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.1s;
        padding: 2rem;
      " class="lightbox__content">
        <div style="
          width: 100%;
          max-width: 800px;
          aspect-ratio: 16/10;
          background: linear-gradient(145deg, var(--color-navy), var(--color-navy-dark));
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 2rem;
          font-family: var(--font-heading);
          font-size: 1.5rem;
          color: rgba(248, 245, 240, 0.3);
          font-style: italic;
        " class="lightbox__image">Vista previa no disponible</div>
        <span style="
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--color-gold);
        " class="lightbox__cat"></span>
        <h3 style="
          font-family: var(--font-heading);
          font-size: 1.75rem;
          font-weight: 400;
          margin-top: 0.5rem;
        " class="lightbox__title"></h3>
        <p style="
          font-size: 0.8rem;
          color: rgba(248, 245, 240, 0.4);
          margin-top: 1.5rem;
        ">Click para cerrar</p>
      </div>
    `;

    document.body.appendChild(this.modal);

    this.modal.addEventListener('click', () => this.close());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    });
  },

  open(title, category) {
    this.isOpen = true;
    const cat = $('.lightbox__cat', this.modal);
    const titleEl = $('.lightbox__title', this.modal);
    const content = $('.lightbox__content', this.modal);

    if (cat) cat.textContent = category;
    if (titleEl) titleEl.textContent = title;

    this.modal.style.opacity = '1';
    this.modal.style.visibility = 'visible';
    if (content) content.style.transform = 'translateY(0)';
    document.body.classList.add('no-scroll');
  },

  close() {
    this.isOpen = false;
    const content = $('.lightbox__content', this.modal);

    this.modal.style.opacity = '0';
    this.modal.style.visibility = 'hidden';
    if (content) content.style.transform = 'translateY(20px)';
    document.body.classList.remove('no-scroll');
  }
};

/* ═══════════════════════════════════════════════════════════════
   MAGNETIC HOVER EFFECT (for CTA buttons)
   ═══════════════════════════════════════════════════════════════ */
const MagneticHover = {
  init() {
    if ('ontouchstart' in window) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    $$('.btn--primary, .nav__cta').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }
};

/* ═══════════════════════════════════════════════════════════════
   SMOOTH SECTION TRANSITIONS (Gradient bleed between sections)
   ═══════════════════════════════════════════════════════════════ */
const SectionTransitions = {
  init() {
    // Add data attributes for section-aware styling
    const sections = $$('section');
    sections.forEach((section, i) => {
      section.dataset.sectionIndex = i;
    });
  }
};

/* ═══════════════════════════════════════════════════════════════
   VIDEO HERO FALLBACK
   ═══════════════════════════════════════════════════════════════ */
const VideoHero = {
  init() {
    const video = $('.hero__video');
    if (!video) return;

    // Handle video load errors gracefully
    video.addEventListener('error', () => {
      // Video failed to load, the poster/background still looks great
      video.style.display = 'none';
    });

    // Pause video when not visible (performance)
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          video.play().catch(() => {
            // Autoplay was prevented, that's fine
          });
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.1 });

    observer.observe(video);
  }
};

/* ═══════════════════════════════════════════════════════════════
   KEYBOARD NAVIGATION ENHANCEMENTS
   ═══════════════════════════════════════════════════════════════ */
const KeyboardNav = {
  init() {
    // Show focus styles only when using keyboard
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-nav');
      }
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-nav');
    });
  }
};

/* ═══════════════════════════════════════════════════════════════
   PERFORMANCE MONITORING
   ═══════════════════════════════════════════════════════════════ */
const Performance = {
  init() {
    // Log performance metrics in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0];
          if (perfData) {
            console.log(`
┌─────────────────────────────────────────┐
│  Arturo Juárez — Performance Report     │
├─────────────────────────────────────────┤
│  DOM Ready:    ${Math.round(perfData.domContentLoadedEventEnd)}ms
│  Load:         ${Math.round(perfData.loadEventEnd)}ms
│  DOM Elements: ${document.querySelectorAll('*').length}
│  JS Heap:      ${Math.round((performance.memory?.usedJSHeapSize || 0) / 1048576)}MB
└─────────────────────────────────────────┘
            `);
          }
        }, 100);
      });
    }
  }
};

/* ═══════════════════════════════════════════════════════════════
   SCROLL PROGRESS BAR
   ═══════════════════════════════════════════════════════════════ */
const ScrollProgress = {
  bar: null,

  init() {
    this.createBar();

    window.addEventListener('scroll', throttle(() => this.updateProgress(), 16), { passive: true });
  },

  createBar() {
    this.bar = document.createElement('div');
    this.bar.className = 'scroll-progress';
    this.bar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      height: 2px;
      background: linear-gradient(to right, var(--color-gold), var(--color-gold-light));
      z-index: 10001;
      transition: width 0.1s linear;
      width: 0%;
    `;
    document.body.appendChild(this.bar);
  },

  updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;

    this.bar.style.width = `${Math.min(progress, 100)}%`;
  }
};

/* ═══════════════════════════════════════════════════════════════
   SERVICE CARD HOVER SOUND (Optional, subtle click)
   ═══════════════════════════════════════════════════════════════ */
const HoverFeedback = {
  init() {
    // Subtle haptic-like visual feedback on service cards
    $$('.service-card').forEach(card => {
      card.addEventListener('mouseenter', function () {
        this.style.transition = 'all 0.1s ease';
        setTimeout(() => {
          this.style.transition = '';
        }, 100);
      });
    });
  }
};

/* ═══════════════════════════════════════════════════════════════
   INITIALIZE ALL MODULES
   ═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Core modules
  Preloader.init();
  Navigation.init();
  ThemeToggle.init();
  ScrollReveal.init();

  // Interactive features
  CounterAnimation.init();
  TestimonialsSlider.init();
  Marquee.init();
  BackToTop.init();
  Newsletter.init();

  // Visual enhancements
  Parallax.init();
  VideoHero.init();
  CursorEffect.init();
  Lightbox.init();
  MagneticHover.init();
  ScrollProgress.init();

  // Utility
  SectionTransitions.init();
  LazyIframes.init();
  KeyboardNav.init();
  HoverFeedback.init();
  Performance.init();

  console.log(
    '%c✂ Arturo Juárez — Estilista %c El Arte del Estilo ',
    'background: #1a2a42; color: #c4a265; padding: 8px 12px; font-family: Georgia, serif; font-size: 14px;',
    'background: #c4a265; color: #1a2a42; padding: 8px 12px; font-family: Georgia, serif; font-size: 14px; font-style: italic;'
  );
});
