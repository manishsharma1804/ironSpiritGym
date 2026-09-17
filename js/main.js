

document.addEventListener('DOMContentLoaded', () => {
  // Global State Cache
  const state = {
    hero: null,
    gymInfo: null,
    offers: null,
    amenities: [],
    plans: [],
    trainers: [],
    whyUs: null,
    faqs: [],
    testimonials: [],
    quotes: [],
    activeDay: 'Monday'
  };

  // 0. Render Hero Content & Media Slides from data/hero.json
  function renderHero() {
    if (!state.hero) return;
    const { title, titleHighlight, description, cta, secondaryCta, slides } = state.hero;

    const titleEl = document.querySelector('.hero-title');
    const descEl = document.querySelector('.hero-description');
    const ctaBtn = document.querySelector('.hero-cta-group .btn-primary');
    const secCtaBtn = document.querySelector('.hero-cta-group .hero-btn-whatsapp');
    const sliderEl = document.getElementById('hero-media-slider');
    const dotsEl = document.getElementById('hero-slider-dots');

    if (titleEl && title) {
      titleEl.innerHTML = `${title} <span class="gold-gradient">${titleHighlight || ''}</span>`;
    }
    if (descEl && description) {
      descEl.textContent = description.trim();
    }
    if (ctaBtn && cta) {
      if (cta.text) {
        ctaBtn.innerHTML = `<span>${cta.text}</span> <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`;
      }
      if (cta.link) ctaBtn.setAttribute('href', cta.link);
    }
    if (secCtaBtn && secondaryCta) {
      const secText = secCtaBtn.querySelector('span');
      if (secText && secondaryCta.text) secText.textContent = secondaryCta.text;
      if (secondaryCta.link) secCtaBtn.setAttribute('href', secondaryCta.link);
    }

    if (sliderEl && slides && slides.length) {
      sliderEl.innerHTML = slides.map((slide, idx) => {
        const isActive = idx === 0 ? 'active' : '';
        if (slide.type === 'logo') {
          return `
            <div class="hero-slide ${isActive}" data-slide="${idx}">
              <div class="hero-slide-bg-canvas"></div>
              <div class="hero-slide-halo" aria-hidden="true"></div>
              <div class="hero-slide-logo-container">
                <img src="${slide.src}" alt="${slide.alt || 'Iron Spirit Gym Official Emblem'}" class="hero-seamless-logo" />
              </div>
            </div>
          `;
        } else if (slide.type === 'video') {
          return `
            <div class="hero-slide ${isActive}" data-slide="${idx}">
              <video class="hero-bg-media hero-bg-video" muted playsinline preload="auto">
                <source src="${slide.src}" type="video/mp4" />
              </video>
            </div>
          `;
        } else {
          // image slide
          return `
            <div class="hero-slide ${isActive}" data-slide="${idx}">
              <img src="${slide.src}" alt="${slide.alt || 'Iron Spirit Gym'}" class="hero-bg-media" loading="${idx === 0 ? 'eager' : 'lazy'}" />
            </div>
          `;
        }
      }).join('');

      if (dotsEl) {
        dotsEl.innerHTML = slides.map((_, idx) => `
          <button class="hero-dot ${idx === 0 ? 'active' : ''}" data-index="${idx}" aria-label="Slide ${idx + 1}"></button>
        `).join('');
      }
    }
  }

  // 1. Hero Media Slider Controller (Supports HD Images & Dynamic Video Duration)
  function initHeroMediaSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    const heroSection = document.getElementById('hero');
    const dots = document.querySelectorAll('.hero-dot');
    const prevBtn = document.getElementById('hero-prev-btn');
    const nextBtn = document.getElementById('hero-next-btn');
    if (!slides.length) return;

    let currentIndex = 0;
    let slideTimer = null;
    let activeVideo = null;
    let videoEndHandler = null;

    function cleanupCurrent() {
      if (slideTimer) {
        clearTimeout(slideTimer);
        slideTimer = null;
      }
      if (activeVideo) {
        if (videoEndHandler) {
          activeVideo.removeEventListener('ended', videoEndHandler);
          videoEndHandler = null;
        }
        try {
          activeVideo.pause();
        } catch (e) {}
        activeVideo = null;
      }
    }

    function scheduleSlide() {
      cleanupCurrent();
      const currentSlide = slides[currentIndex];
      if (!currentSlide) return;

      const video = currentSlide.querySelector('video');
      if (video) {
        activeVideo = video;
        videoEndHandler = () => {
          nextSlide();
        };
        video.addEventListener('ended', videoEndHandler, { once: true });
        video.currentTime = 0;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Fallback if autoplay was blocked: transition after standard duration
            if (!slideTimer) {
              slideTimer = setTimeout(nextSlide, 7000);
            }
          });
        }
      } else {
        // Image or logo slide - 7 seconds display
        slideTimer = setTimeout(nextSlide, 7000);
      }
    }

    function showSlide(index) {
      cleanupCurrent();

      slides.forEach(s => s.classList.remove('active'));

      currentIndex = (index + slides.length) % slides.length;
      const targetSlide = slides[currentIndex];
      if (targetSlide) targetSlide.classList.add('active');

      // Update interactive dots
      dots.forEach((dot, dIdx) => {
        dot.classList.toggle('active', dIdx === currentIndex);
      });

      scheduleSlide();
    }

    function nextSlide() {
      showSlide(currentIndex + 1);
    }

    function prevSlide() {
      showSlide(currentIndex - 1);
    }

    // Dot click listeners
    dots.forEach((dot) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const idx = parseInt(dot.dataset.index, 10);
        if (!isNaN(idx)) {
          showSlide(idx);
        }
      });
    });

    // Prev / Next button listeners
    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        prevSlide();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        nextSlide();
      });
    }

    // Pause auto-slide on hover, resume on mouse leave
    if (heroSection) {
      heroSection.addEventListener('mouseenter', () => {
        if (slideTimer) {
          clearTimeout(slideTimer);
          slideTimer = null;
        }
        if (activeVideo) {
          try { activeVideo.pause(); } catch (e) {}
        }
      });

      heroSection.addEventListener('mouseleave', () => {
        if (activeVideo) {
          activeVideo.play().catch(() => {});
        } else if (!slideTimer) {
          slideTimer = setTimeout(nextSlide, 7000);
        }
      });

      // Touch swipe support on mobile
      let touchStartX = 0;
      let touchEndX = 0;

      heroSection.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        cleanupCurrent();
      }, { passive: true });

      heroSection.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchEndX - touchStartX;
        if (Math.abs(diff) > 45) {
          if (diff < 0) {
            nextSlide();
          } else {
            prevSlide();
          }
        } else {
          scheduleSlide();
        }
      }, { passive: true });
    }

    // Start with the initial slide
    scheduleSlide();
  }

  // Helper: Fetch JSON with graceful fallback
  async function loadJSON(url) {
    try {
      const response = await fetch(url, { cache: 'no-cache' });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (err) {
      console.warn(`Could not load ${url}:`, err);
      return null;
    }
  }

  // Helper: Dynamically preloads any initial slide media (image, video, logo) from JSON
  async function preloadSlideMedia(slide) {
    if (!slide || !slide.src) return;
    try {
      if (slide.type === 'video') {
        await new Promise((resolve) => {
          const video = document.createElement('video');
          video.preload = 'auto';
          video.muted = true;
          video.playsInline = true;
          let resolved = false;
          const finish = () => {
            if (!resolved) {
              resolved = true;
              resolve();
            }
          };
          video.onloadeddata = finish;
          video.oncanplay = finish;
          video.onerror = finish;
          video.src = slide.src;
          // Safe fallback for video metadata/frame
          setTimeout(finish, 1200);
        });
      } else {
        // Image or logo slide
        await new Promise((resolve) => {
          const img = new Image();
          img.src = slide.src;
          if (img.complete) {
            resolve();
          } else if (img.decode) {
            img.decode().then(resolve).catch(resolve);
          } else {
            img.onload = resolve;
            img.onerror = resolve;
          }
          // Safe fallback for image decoding
          setTimeout(resolve, 1500);
        });
      }
    } catch (e) {}
  }

  // Master Initializer
  async function initApp() {
    initHeroAnimations();

    // Parallel fetch (instant JSON resolution without artificial delay)
    const [
      hero,
      gymInfo,
      offers,
      amenities,
      plans,
      trainers,
      whyUs,
      faqs,
      testimonials,
      gallery,
      quotes
    ] = await Promise.all([
      loadJSON('data/hero.json'),
      loadJSON('data/gym-info.json'),
      loadJSON('data/offers.json'),
      loadJSON('data/amenities.json'),
      loadJSON('data/plans.json'),
      loadJSON('data/trainers.json'),
      loadJSON('data/why-us.json'),
      loadJSON('data/faqs.json'),
      loadJSON('data/testimonials.json'),
      loadJSON('data/gallery.json'),
      loadJSON('data/quotes.json')
    ]);

    state.hero = hero;
    state.gymInfo = gymInfo;
    state.offers = offers;
    state.amenities = amenities || [];
    state.plans = plans || [];
    state.trainers = trainers || [];
    state.whyUs = whyUs;
    state.faqs = faqs || [];
    state.testimonials = (testimonials && testimonials.length) ? testimonials : [
      {
        quote: "The trainers make you feel comfortable from day one. As a beginner in Kokar, I lost 8kg and finally enjoy consistent workouts.",
        name: "Ananya Verma",
        role: "Member • Functional Fitness",
        avatar: "https://i.pravatar.cc/100?img=47",
        stars: 5
      },
      {
        quote: "The unisex community is motivating, Olympic equipment is unmatched in Ranchi, and every single lifting session feels purposeful.",
        name: "Rahul Kumar",
        role: "Strength Athlete • 2 Yrs Member",
        avatar: "https://i.pravatar.cc/100?img=12",
        stars: 5
      },
      {
        quote: "Started with zero lifting experience. Certified coaches helped me correct anterior pelvic tilt and build real strength safely.",
        name: "Sneha Gupta",
        role: "Transformation Member",
        avatar: "https://i.pravatar.cc/100?img=44",
        stars: 5
      },
      {
        quote: "Hit a 210kg deadlift PR under coach guidance! Clean hygienic space, power racks, and zero bro-science atmosphere.",
        name: "Vikram Singh",
        role: "Powerlifter • Kokar",
        avatar: "https://i.pravatar.cc/100?img=60",
        stars: 5
      },
      {
        quote: "Safe, empowering, and respectful environment for women. The steam room and private lockers make daily workouts a breeze.",
        name: "Pooja Mishra",
        role: "Morning Batch Member",
        avatar: "https://i.pravatar.cc/100?img=32",
        stars: 5
      },
      {
        quote: "Desk job was killing my lower back. 4 months of mobility and functional rehab here and I am completely pain-free today.",
        name: "Amit Sharma",
        role: "IT Consultant • Kokar",
        avatar: "https://i.pravatar.cc/100?img=53",
        stars: 5
      }
    ];
    state.gallery = (gallery && gallery.length) ? gallery : [];
    state.quotes = (quotes && quotes.length) ? quotes : [];

    // Dynamically preload the first hero media defined in data/hero.json (any image/video/logo)
    const firstSlide = hero && hero.slides && hero.slides[0];
    if (firstSlide) {
      await preloadSlideMedia(firstSlide);
    }

    // Smoothly render and cross-fade content into containers
    renderHero();
    initHeroMediaSlider();
    renderGymInfo();
    renderOffers();
    renderWhyUs();
    renderAmenities();
    renderPlans();
    renderTrainers();
    renderGallery();
    initGalleryModal();
    renderTestimonials();
    initReviewLeftAnimation();
    initTestimonialsSlider();
    renderFAQs();
    initMobileNav();
    initMobileBottomNav();
    initHeaderScrollState();
    initModals();
    initHorizontalCarousels();
    initDesktopMap();
    initFloatingFeedbackTab();
    initFooterQuotes();

    // Dismiss preloader now that first hero slide is decoded & fully ready in browser memory
    if (typeof window.dismissPreloader === 'function') {
      window.dismissPreloader();
    }

    // Trigger GSAP ScrollTrigger animations on all sections and cards
    setTimeout(initScrollAnimations, 100);
  }

  // 2. Hero Section Cinematic Sequence
  function initHeroAnimations() {
    if (typeof gsap === 'undefined') return;

    if (document.querySelector('.hero-content')) {
      gsap.from('.hero-content > *', {
        opacity: 0,
        y: 18,
        stagger: 0.08,
        duration: 0.6,
        ease: 'power2.out'
      });
    }

    if (document.querySelector('.hero-bottom-bar')) {
      gsap.from('.hero-bottom-bar', {
        opacity: 0,
        y: 15,
        duration: 0.6,
        delay: 0.3,
        ease: 'power2.out'
      });
    }
  }

  // 3. GSAP ScrollTrigger Orchestration (Ultra-Smooth 60fps Mobile Optimized)
  function initScrollAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    // Optimize ScrollTrigger for mobile URL bar collapse & prevent jitter
    ScrollTrigger.config({
      ignoreMobileResize: true,
      autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load'
    });

    // Refresh ScrollTrigger state after dynamic content injection
    ScrollTrigger.refresh();

    // Section Headers
    const headers = document.querySelectorAll('.section-header');
    if (headers.length) {
      headers.forEach(header => {
        gsap.fromTo(header,
          { opacity: 0, y: 12 },
          {
            opacity: 1,
            y: 0,
            duration: 0.35,
            ease: 'power2.out',
            force3D: true,
            scrollTrigger: {
              trigger: header,
              start: 'top 92%',
              toggleActions: 'play none none none',
              once: true
            }
          }
        );
      });
    }

    // Staggered Container Helper
    function animateGrid(containerId, itemSelector, startOffset = 'top 92%') {
      const container = document.getElementById(containerId);
      if (!container) return;
      const items = container.querySelectorAll(itemSelector);
      if (!items.length) return;

      gsap.fromTo(items,
        { opacity: 0, y: 14, scale: 0.99 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.35,
          stagger: 0.04,
          ease: 'power2.out',
          force3D: true,
          scrollTrigger: {
            trigger: container,
            start: startOffset,
            toggleActions: 'play none none none',
            once: true
          }
        }
      );
    }

    animateGrid('amenities-container', '.amenity-card');
    animateGrid('plans-container', '.pricing-card');

    // Magazine Dossier Section Animation
    const magStage = document.querySelector('.magazine-stage');
    if (magStage && typeof gsap !== 'undefined') {
      gsap.fromTo(magStage,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.35,
          ease: 'power2.out',
          force3D: true,
          scrollTrigger: {
            trigger: magStage,
            start: 'top 92%',
            toggleActions: 'play none none none',
            once: true
          }
        }
      );
    }

    // Why Choose Us Section Animation
    const whyUsGrid = document.querySelector('.why-us-grid');
    if (whyUsGrid) {
      if (document.querySelector('.why-us-content')) {
        gsap.fromTo('.why-us-content',
          { opacity: 0, x: -10 },
          {
            opacity: 1,
            x: 0,
            duration: 0.35,
            ease: 'power2.out',
            force3D: true,
            scrollTrigger: {
              trigger: whyUsGrid,
              start: 'top 92%',
              toggleActions: 'play none none none',
              once: true
            }
          }
        );
      }
      if (document.querySelectorAll('.why-gallery-card').length) {
        gsap.fromTo('.why-gallery-card',
          { opacity: 0, scale: 0.98, y: 10 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.35,
            stagger: 0.04,
            ease: 'power2.out',
            force3D: true,
            scrollTrigger: {
              trigger: whyUsGrid,
              start: 'top 92%',
              toggleActions: 'play none none none',
              once: true
            }
          }
        );
      }
      if (document.querySelector('.why-center-badge')) {
        gsap.fromTo('.why-center-badge',
          { opacity: 0, scale: 0.85 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.4,
            ease: 'power2.out',
            force3D: true,
            scrollTrigger: {
              trigger: whyUsGrid,
              start: 'top 92%',
              toggleActions: 'play none none none',
              once: true
            }
          }
        );
      }
    }

    const contactGrid = document.querySelector('.contact-grid');
    if (contactGrid) {
      gsap.fromTo(contactGrid,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.35,
          ease: 'power2.out',
          force3D: true,
          scrollTrigger: {
            trigger: contactGrid,
            start: 'top 92%',
            toggleActions: 'play none none none',
            once: true
          }
        }
      );
    }

    const testSlider = document.querySelector('.testimonial-slider');
    if (testSlider) {
      gsap.fromTo(testSlider,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.35,
          ease: 'power2.out',
          force3D: true,
          scrollTrigger: {
            trigger: testSlider,
            start: 'top 92%',
            toggleActions: 'play none none none',
            once: true
          }
        }
      );
    }
  }

  // Helper: Copy to Clipboard with Toast Notification
  function copyToClipboard(text, label = 'Copied to clipboard!') {
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showCopyToast(label);
      }).catch(() => {
        fallbackCopy(text, label);
      });
    } else {
      fallbackCopy(text, label);
    }
  }

  function fallbackCopy(text, label) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showCopyToast(label);
    } catch (e) {
      showCopyToast('Copy failed, please copy manually');
    }
    document.body.removeChild(textarea);
  }

  let toastTimeout = null;
  function showCopyToast(message = 'Copied to clipboard!') {
    const toast = document.getElementById('copy-toast-notification');
    const toastText = document.getElementById('copy-toast-text');
    if (!toast) return;
    if (toastText) toastText.textContent = message;
    toast.classList.add('show');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  }

  // Contact Bottom Sheet Drawer Handlers (Mobile & PC)
  const contactModalBackdrop = document.getElementById('contact-modal-backdrop');
  const contactModalSheet = document.getElementById('contact-modal-sheet');
  const contactModalTitle = document.getElementById('contact-modal-title');
  const contactModalContent = document.getElementById('contact-modal-content');
  const contactModalClose = document.getElementById('contact-modal-close');

  function openContactModal(title, cardsHtml) {
    if (!contactModalBackdrop || !contactModalSheet || !contactModalContent) return;
    if (contactModalTitle) contactModalTitle.textContent = title;
    contactModalContent.innerHTML = cardsHtml;

    // Wire copy buttons inside modal
    contactModalContent.querySelectorAll('.contact-modal-btn-copy').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const copyVal = btn.getAttribute('data-copy');
        const copyMsg = btn.getAttribute('data-msg') || 'Copied to clipboard!';
        copyToClipboard(copyVal, copyMsg);
      });
    });

    contactModalBackdrop.classList.add('active');
    contactModalBackdrop.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => {
      contactModalSheet.classList.add('active');
    });
    document.body.classList.add('modal-open');
  }

  function closeContactModal() {
    if (!contactModalBackdrop || !contactModalSheet) return;
    contactModalSheet.classList.remove('active');
    setTimeout(() => {
      contactModalBackdrop.classList.remove('active');
      contactModalBackdrop.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
    }, 280);
  }

  if (contactModalClose) {
    contactModalClose.addEventListener('click', closeContactModal);
  }
  if (contactModalBackdrop) {
    contactModalBackdrop.addEventListener('click', (e) => {
      if (e.target === contactModalBackdrop) closeContactModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && contactModalBackdrop && contactModalBackdrop.classList.contains('active')) {
      closeContactModal();
    }
  });

  // Desktop-Only Dynamic Google Map Embed (Zero Mobile Network/Render Overhead)
  function initDesktopMap() {
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) return;
    const mapSrc = mapContainer.getAttribute('data-map-src');
    if (!mapSrc) return;

    function checkAndMountMap() {
      const isDesktop = window.innerWidth > 768;
      const existingIframe = mapContainer.querySelector('iframe');
      if (isDesktop && !existingIframe) {
        const iframe = document.createElement('iframe');
        iframe.src = mapSrc;
        iframe.title = 'Iron Spirit Gym Location Kokar Ranchi';
        iframe.loading = 'lazy';
        iframe.referrerPolicy = 'no-referrer-when-downgrade';
        iframe.setAttribute('aria-label', 'Map view of Iron Spirit Gym in Kokar Ranchi');
        mapContainer.insertBefore(iframe, mapContainer.firstChild);
      } else if (!isDesktop && existingIframe) {
        existingIframe.remove();
      }
    }

    checkAndMountMap();
    window.addEventListener('resize', () => {
      clearTimeout(window._mapResizeTimer);
      window._mapResizeTimer = setTimeout(checkAndMountMap, 200);
    }, { passive: true });
  }

  // 4. Render Gym Global Info (Supports Multiple Phones & WhatsApps + Bottom Sheet Drawer)
  function renderGymInfo() {
    if (!state.gymInfo) return;
    const { contact, location, timings } = state.gymInfo;

    // Normalize phone numbers (handles array of objects, array of strings, or single string)
    let phones = [];
    if (Array.isArray(contact.phones) && contact.phones.length > 0) {
      phones = contact.phones.map(p => typeof p === 'string' ? { number: p, label: 'Front Desk' } : p);
    } else if (contact.phone) {
      phones = [{ number: contact.phone, label: 'Front Desk & Enquiries' }];
    }

    // Normalize WhatsApp numbers (handles array of objects, array of strings, or single string)
    let whatsapps = [];
    if (Array.isArray(contact.whatsapps) && contact.whatsapps.length > 0) {
      whatsapps = contact.whatsapps.map(w => typeof w === 'string' ? { number: w, label: 'WhatsApp Desk', message: contact.whatsappMessage || '' } : w);
    } else if (contact.whatsapp) {
      whatsapps = [{ number: contact.whatsapp, label: 'WhatsApp Desk', message: contact.whatsappMessage || 'Hi Iron Spirit Gym! I am interested in joining.' }];
    }

    // 1. Social Channels & Email Binding in Contact Section & Hero
    if (state.gymInfo.socials) {
      const { instagram, facebook, youtube } = state.gymInfo.socials;

      const heroInsta = document.getElementById('hero-instagram-link');
      if (heroInsta) {
        if (instagram) {
          heroInsta.setAttribute('href', instagram);
          heroInsta.setAttribute('target', '_blank');
          heroInsta.setAttribute('rel', 'noopener noreferrer');
          heroInsta.style.display = 'inline-flex';
        } else {
          heroInsta.style.display = 'none';
        }
      }

      const contactInsta = document.getElementById('contact-instagram-link');
      if (contactInsta) {
        if (instagram) {
          contactInsta.setAttribute('href', instagram);
          contactInsta.style.display = 'inline-flex';
        } else {
          contactInsta.style.display = 'none';
        }
      }

      const contactFb = document.getElementById('contact-facebook-link');
      if (contactFb) {
        if (facebook) {
          contactFb.setAttribute('href', facebook);
          contactFb.style.display = 'inline-flex';
        } else {
          contactFb.style.display = 'none';
        }
      }

      const contactYt = document.getElementById('contact-youtube-link');
      if (contactYt) {
        if (youtube) {
          contactYt.setAttribute('href', youtube);
          contactYt.style.display = 'inline-flex';
        } else {
          contactYt.style.display = 'none';
        }
      }
    }

    // 2. Email Link in Contact Section
    const emailLink = document.getElementById('contact-email-link');
    const emailDisplay = document.getElementById('contact-email-display');
    if (contact.email) {
      if (emailLink) {
        emailLink.setAttribute('href', `mailto:${contact.email}`);
        emailLink.setAttribute('title', contact.email);
        emailLink.style.display = 'inline-flex';
      }
      if (emailDisplay) emailDisplay.textContent = 'Email';
    } else if (emailLink) {
      emailLink.style.display = 'none';
    }
    // 3. WhatsApp & Phone Line Selection Handlers (Modal Drawer)
    function triggerWhatsAppModal(e) {
      if (e) e.preventDefault();
      const cardsHtml = whatsapps.map(w => {
        const link = `https://wa.me/${w.number}?text=${encodeURIComponent(w.message || contact.whatsappMessage || '')}`;
        return `
          <div class="contact-modal-card">
            <div class="contact-modal-card-info">
              <span class="contact-modal-card-label">${w.label || 'WhatsApp Desk'}</span>
              <span class="contact-modal-card-num">+${w.number}</span>
            </div>
            <div class="contact-modal-actions">
              <a href="${link}" target="_blank" rel="noopener noreferrer" class="contact-modal-btn-act whatsapp-bg">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                <span>Chat on WhatsApp</span>
              </a>
              <button type="button" class="contact-modal-btn-copy" data-copy="+${w.number}" data-msg="WhatsApp number copied!">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>
                <span>Copy</span>
              </button>
            </div>
          </div>
        `;
      }).join('');
      openContactModal('Choose WhatsApp Line', cardsHtml);
    }

    function triggerPhoneModal(e) {
      if (e) e.preventDefault();
      const cardsHtml = phones.map(p => {
        const telLink = `tel:${p.number.replace(/\s+/g, '')}`;
        return `
          <div class="contact-modal-card">
            <div class="contact-modal-card-info">
              <span class="contact-modal-card-label">${p.label || 'Front Desk'}</span>
              <span class="contact-modal-card-num">${p.number}</span>
            </div>
            <div class="contact-modal-actions">
              <a href="${telLink}" class="contact-modal-btn-act">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                <span>Call Now</span>
              </a>
              <button type="button" class="contact-modal-btn-copy" data-copy="${p.number}" data-msg="Phone number copied!">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>
                <span>Copy</span>
              </button>
            </div>
          </div>
        `;
      }).join('');
      openContactModal('Choose Phone Line', cardsHtml);
    }

    // Attach click listeners to all WhatsApp buttons across the site
    // (Top Nav Talk to Us, Mobile Bottom Nav Talk to Us, Sidebar CTA, Contact Section WhatsApp)
    document.querySelectorAll('.whatsapp-link, .nav-whatsapp-cta, .bottom-nav-fixed-wa, .sidebar-wa-btn, #contact-main-whatsapp-btn').forEach(el => {
      el.addEventListener('click', triggerWhatsAppModal);
    });

    // Attach click listeners to all Call buttons across the site
    // (Sidebar Call button, Contact Section Call Front Desk)
    document.querySelectorAll('.call-link, .sidebar-call-btn, #contact-main-call-btn').forEach(el => {
      el.addEventListener('click', triggerPhoneModal);
    });

    // 5. Address & Timings
    const addressDisplayEl = document.getElementById('contact-address-display');
    if (addressDisplayEl) addressDisplayEl.textContent = location.fullAddress;

    const timingsWeekdayEl = document.getElementById('timings-weekday-display');
    if (timingsWeekdayEl) timingsWeekdayEl.textContent = timings.weekdays.slots;

    // 6. Floating Feedback / Google Review Tab Link Binding
    const feedbackTab = document.getElementById('floating-feedback-tab');
    const googleReviewUrl = state.gymInfo?.socials?.googleReview || state.gymInfo?.googleReview || state.gymInfo?.feedbackUrl || 'https://maps.google.com/?q=Iron+Spirit+Gym+Kokar+Chowk+Ranchi';
    if (feedbackTab) {
      feedbackTab.setAttribute('href', googleReviewUrl);
    }
  }

  // 5. Render Offers (Continuous Marquee Announcement Bar & Launch Offer Popup)
  function renderOffers() {
    const topBar = document.getElementById('top-announcement-bar');
    if (!state.offers || state.offers.isActive === false) {
      if (topBar) topBar.style.display = 'none';
      return;
    }

    const { bannerText, badge, popup, showBanner } = state.offers;
    const badgeLabel = badge || 'COMING SOON';

    // Strictly check showBanner: if showBanner is false, hide the announcement marquee bar
    const isBannerVisible = showBanner !== false;

    const marqueeTrack = document.getElementById('announcement-marquee-track');
    if (topBar && marqueeTrack && bannerText && isBannerVisible) {
      const singleItem = `
        <div class="announcement-marquee-item">
          <span class="announcement-badge">${badgeLabel}</span>
          <span class="announcement-text">${bannerText}</span>
          <span class="announcement-dot" aria-hidden="true"></span>
        </div>
      `;
      // Create duplicate items for a buttery seamless infinite marquee loop
      marqueeTrack.innerHTML = singleItem.repeat(6);
      topBar.style.display = 'block';

      // Toggle pause/play on click or tap
      topBar.addEventListener('click', () => {
        topBar.classList.toggle('is-paused');
      });
    } else if (topBar) {
      topBar.style.display = 'none';
    }

    const offerModal = document.getElementById('offer-modal');
    const desktopImg = (popup?.imageDesktop || popup?.desktopImage || popup?.image || '').trim();
    const mobileImg = (popup?.imageMobile || popup?.mobileImage || popup?.image || '').trim();
    const hasPopupImg = Boolean(desktopImg || mobileImg);

    if (offerModal && popup && hasPopupImg && popup.isActive !== false) {
      const imgEl = document.getElementById('offer-popup-img');
      const sourceDesktop = document.getElementById('offer-popup-source-desktop');
      const linkEl = document.getElementById('offer-popup-link');

      if (sourceDesktop && desktopImg) {
        sourceDesktop.srcset = desktopImg;
      }
      if (imgEl) {
        imgEl.src = mobileImg || desktopImg;
        imgEl.alt = popup.alt || 'Special Gym Launch Offer';
      }

      if (linkEl) {
        const fallbackWa = `https://wa.me/${state.gymInfo?.contact?.whatsapp || '919835124789'}?text=${encodeURIComponent('Hi Iron Spirit Gym! I am interested in the special offer.')}`;
        linkEl.href = popup.link || fallbackWa;
      }

      // Show offer poster popup on every visit / reload (skip if vault is directly requested)
      if (!window.location.hash.includes('#gallery-vault')) {
        setTimeout(() => {
          openModal('offer-modal');
        }, 2500);
      }
    } else if (offerModal) {
      const imgEl = document.getElementById('offer-popup-img');
      const sourceDesktop = document.getElementById('offer-popup-source-desktop');
      if (imgEl) imgEl.removeAttribute('src');
      if (sourceDesktop) sourceDesktop.removeAttribute('srcset');
    }
  }

  // =========================================================================
  // CENTRALIZED MODAL & DRAWER MANAGER (SCROLL LOCK + MOBILE BACK GESTURE)
  // =========================================================================
  const ModalManager = (() => {
    let savedScrollY = 0;
    let openCount = 0;
    const activeModals = [];

    function lockScroll() {
      if (openCount === 0) {
        savedScrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${savedScrollY}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.body.style.width = '100%';
        document.body.style.overflow = 'hidden';
        document.body.classList.add('modal-open');
      }
      openCount++;
    }

    function unlockScroll() {
      openCount = Math.max(0, openCount - 1);
      if (openCount === 0) {
        const y = savedScrollY;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        document.body.classList.remove('modal-open');
        window.scrollTo(0, y);
      }
    }

    function open(modalId, closeCallback) {
      lockScroll();
      try {
        history.pushState({ modalId, timestamp: Date.now() }, '');
      } catch (err) {}
      activeModals.push({ modalId, closeCallback });
    }

    function close(modalId, options = {}) {
      const idx = activeModals.findIndex(m => m.modalId === modalId);
      if (idx !== -1) {
        activeModals.splice(idx, 1);
      }
      unlockScroll();

      // If user clicked close button/backdrop (not popstate), pop history state cleanly
      if (!options.fromPopstate && history.state && history.state.modalId === modalId) {
        try {
          history.back();
        } catch (err) {}
      }
    }

    // Intercept hardware/browser/mobile back gesture
    window.addEventListener('popstate', (e) => {
      if (activeModals.length > 0) {
        const topModal = activeModals.pop();
        if (topModal && typeof topModal.closeCallback === 'function') {
          topModal.closeCallback({ fromPopstate: true });
        }
        unlockScroll();
      }
    });

    return {
      open,
      close,
      lockScroll,
      unlockScroll
    };
  })();

  // =========================================================================
  // UNIVERSAL SEAMLESS INFINITE MOBILE CAROUSEL ENGINE (MANUAL SWIPE + ACTIVE SPY)
  // =========================================================================
  const registeredCarousels = [];

  function setupInfiniteMobileTrack(track, totalCount, options = {}) {
    if (!track || totalCount <= 0) return null;

    let isUserTouching = false;
    let isBoundaryAdjusting = false;
    let isSwiping = false;
    let touchStartX = 0;
    let touchStartY = 0;
    let scrollTimeout = null;

    const {
      onActiveChange,
      sectionId
    } = options;

    function getCenterScroll(card) {
      if (!card) return 0;
      return card.offsetLeft - (track.clientWidth - card.clientWidth) / 2;
    }

    function getClosestIndex() {
      const cards = Array.from(track.children);
      if (!cards.length) return 0;
      const trackCenter = track.scrollLeft + track.clientWidth / 2;
      let closestIdx = 0;
      let minDiff = Infinity;
      cards.forEach((card, i) => {
        const cardCenter = card.offsetLeft + card.clientWidth / 2;
        const diff = Math.abs(cardCenter - trackCenter);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = i;
        }
      });
      return closestIdx;
    }

    function initPosition() {
      if (window.innerWidth > 768) return;
      const cards = track.children;
      if (cards.length >= totalCount * 2) {
        const middleFirstCard = cards[totalCount];
        if (middleFirstCard) {
          const target = getCenterScroll(middleFirstCard);
          track.style.scrollBehavior = 'auto';
          track.scrollLeft = Math.max(0, target);
          if (onActiveChange) {
            onActiveChange(0);
          }
        }
      }
    }

    function checkBoundaryLoop() {
      if (window.innerWidth > 768 || isBoundaryAdjusting || isUserTouching) return;
      const cards = track.children;
      if (cards.length < totalCount * 3) return;

      const closest = getClosestIndex();
      const realIdx = ((closest % totalCount) + totalCount) % totalCount;
      if (onActiveChange) {
        onActiveChange(realIdx);
      }

      // If user scrolled into set 1 (left copy)
      if (closest < totalCount) {
        isBoundaryAdjusting = true;
        const targetCard = cards[closest + totalCount];
        if (targetCard) {
          const target = getCenterScroll(targetCard);
          track.style.scrollBehavior = 'auto';
          track.scrollLeft = target;
        }
        setTimeout(() => { isBoundaryAdjusting = false; }, 80);
      }
      // If user scrolled into set 3 (right copy)
      else if (closest >= totalCount * 2) {
        isBoundaryAdjusting = true;
        const targetCard = cards[closest - totalCount];
        if (targetCard) {
          const target = getCenterScroll(targetCard);
          track.style.scrollBehavior = 'auto';
          track.scrollLeft = target;
        }
        setTimeout(() => { isBoundaryAdjusting = false; }, 80);
      }
    }

    track.addEventListener('touchstart', (e) => {
      isUserTouching = true;
      isSwiping = false;
      if (e.touches && e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    track.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches.length === 1) {
        const dx = Math.abs(e.touches[0].clientX - touchStartX);
        const dy = Math.abs(e.touches[0].clientY - touchStartY);
        if (dx > 8 || dy > 8) {
          isSwiping = true;
        }
      }
    }, { passive: true });

    track.addEventListener('touchend', () => {
      isUserTouching = false;
      setTimeout(() => {
        isSwiping = false;
      }, 100);
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(checkBoundaryLoop, 200);
    }, { passive: true });

    track.addEventListener('scroll', () => {
      const closest = getClosestIndex();
      const realIdx = ((closest % totalCount) + totalCount) % totalCount;
      if (onActiveChange) {
        onActiveChange(realIdx);
      }
      if (!isUserTouching) {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(checkBoundaryLoop, 200);
      }
    }, { passive: true });

    setTimeout(initPosition, 100);
    setTimeout(initPosition, 400);

    window.addEventListener('resize', () => {
      if (window.innerWidth <= 768) {
        setTimeout(initPosition, 100);
      }
    }, { passive: true });

    const handler = {
      initPosition,
      isSwiping: () => isSwiping
    };

    registeredCarousels.push(handler);
    return handler;
  }

  // 6. Render Amenities (Integrated Training Zones)
  function renderAmenities() {
    const container = document.getElementById('amenities-container');
    if (!container || !state.amenities.length) return;

    const createAmenityHTML = (zone, isClone = false) => `
      <article class="amenity-card ${isClone ? 'carousel-clone' : ''}" data-id="${zone.id}">
        <div class="amenity-img-wrapper">
          <img src="${zone.image}" alt="${zone.title}" class="amenity-img" loading="lazy" />
          <span class="amenity-badge">${zone.category}</span>
        </div>
        <div class="amenity-body">
          <h3 class="amenity-title">${zone.title}</h3>
          <div class="amenity-tagline">${zone.tagline}</div>
          <p class="amenity-desc">${zone.description}</p>
        </div>
      </article>
    `;

    // Render 3 sets for infinite seamless mobile looping [clone, main, clone]
    const set1 = state.amenities.map(z => createAmenityHTML(z, true)).join('');
    const set2 = state.amenities.map(z => createAmenityHTML(z, false)).join('');
    const set3 = state.amenities.map(z => createAmenityHTML(z, true)).join('');
    container.innerHTML = set1 + set2 + set3;
  }

  // 7. Render Membership Pricing Plans
  function renderPlans() {
    const container = document.getElementById('plans-container');
    if (!container || !state.plans.length) return;

    const createPlanHTML = (plan, isClone = false) => {
      const waUrl = `https://wa.me/${state.gymInfo?.contact?.whatsapp || '919835124789'}?text=${encodeURIComponent(plan.whatsappPrefill)}`;

      return `
        <div class="pricing-card ${plan.popular ? 'featured' : ''} ${isClone ? 'carousel-clone' : ''}">
          ${plan.popular ? `<div class="popular-ribbon">${plan.badge}</div>` : ''}
          <div class="plan-header">
            <h3 class="plan-name">${plan.name}</h3>
            <p class="plan-desc">${plan.description}</p>
          </div>
          <div class="plan-price-wrap">
            <div class="price-flex">
              <span class="price-currency">${plan.currency}</span>
              <span class="price-figure">${plan.price}</span>
              <span class="price-original">${plan.currency}${plan.originalPrice}</span>
            </div>
            <div class="price-cycle">${plan.billingCycle}</div>
          </div>
          <ul class="plan-features">
            ${plan.features.map(f => `
              <li class="${f.included ? 'included' : 'excluded'}">
                <span class="${f.included ? 'check-icon' : 'cross-icon'}">
                  ${f.included
          ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#e82b35" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`
          : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`
        }
                </span>
                <span>${f.text}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    };

    // Render 3 sets for infinite seamless mobile looping [clone, main, clone]
    const set1 = state.plans.map(p => createPlanHTML(p, true)).join('');
    const set2 = state.plans.map(p => createPlanHTML(p, false)).join('');
    const set3 = state.plans.map(p => createPlanHTML(p, true)).join('');
    container.innerHTML = set1 + set2 + set3;
  }

  // 8. Render Why Choose Us Section (From User Reference)
  function renderWhyUs() {
    if (!state.whyUs) return;
    const { eyebrow, title, titleHighlight, description, features } = state.whyUs;

    const eyebrowText = document.getElementById('why-eyebrow-text');
    const titleText = document.getElementById('why-title-text');
    const descText = document.getElementById('why-desc-text');
    const featuresContainer = document.getElementById('why-features-container');

    if (eyebrowText && eyebrow) eyebrowText.textContent = eyebrow;
    if (titleText && title) {
      titleText.innerHTML = `${title}<br><span>${titleHighlight}</span>`;
    }
    if (descText && description) descText.textContent = description;

    if (featuresContainer && features && features.length) {
      featuresContainer.innerHTML = features.map((f, i) => `
        <div class="why-feature-item">
          <div class="why-step-col">
            <div class="why-step-circle">${f.step}</div>
            ${i < features.length - 1 ? '<div class="why-step-line"></div>' : ''}
          </div>
          <div class="why-step-content">
            <h4>${f.title}</h4>
            <p>${f.description}</p>
          </div>
        </div>
      `).join('');
    }
  }

  // 9. Render Certified Coaches (Pure CSS 3D Modern Magazine Spread)
  function renderTrainers() {
    const spread = document.getElementById('magazine-spread');
    const leftPage = document.getElementById('mag-left-page');
    const rightPage = document.getElementById('mag-right-page');
    const flipper = document.getElementById('mag-flipper');
    const flipperFront = document.getElementById('flipper-front');
    const flipperBack = document.getElementById('flipper-back');

    if (!spread || !leftPage || !rightPage || !state.trainers.length) return;

    const totalCoaches = state.trainers.length;
    let currentIdx = 0;
    let isFlipping = false;

    function buildLeftPageHTML(t, idx) {
      if (!t) return '';
      return `
        <div class="mag-left-content">
          <img src="${t.image}" alt="${t.name}" class="mag-full-photo" loading="eager" />
          <div class="mag-photo-overlay"></div>
          <div class="mag-photo-top-badge">
            <span class="mag-badge-exp">${t.experience}</span>
          </div>
          <div class="mag-photo-bottom-info">
            <h3 class="mag-coach-name">${t.name}</h3>
            <div class="mag-coach-role-wrap">
              <span class="mag-coach-role">${t.role}</span>
              <span class="mag-inline-info-icon" title="View Credentials & Bio" aria-label="View Info">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              </span>
            </div>
            <div class="mag-coach-branch">📍 Kokar, Ranchi</div>
          </div>
        </div>
      `;
    }

    function renderVerifiedStamp(uniqueKey = '') {
      const topArcId = `stamp-top-${uniqueKey}`;
      const botArcId = `stamp-bot-${uniqueKey}`;
      const clipId = `stamp-clip-${uniqueKey}`;
      return `
        <div class="mag-verified-stamp" aria-label="Officially Verified Coach Seal">
          <svg viewBox="0 0 120 120" class="mag-stamp-svg">
            <defs>
              <!-- Top Arc tightly calibrated to r=29 for minimal top/bottom padding -->
              <path id="${topArcId}" d="M 31,60 A 29,29 0 1,1 89,60" fill="none" />
              <!-- Bottom Arc tightly calibrated to r=29 for minimal top/bottom padding -->
              <path id="${botArcId}" d="M 89,60 A 29,29 0 0,1 31,60" fill="none" />
              <!-- Clip path for center logo circle -->
              <clipPath id="${clipId}">
                <circle cx="60" cy="60" r="24" />
              </clipPath>
            </defs>

            <!-- Outer Concentric Borders (Ultra-Tight & Compact) -->
            <circle cx="60" cy="60" r="38" fill="none" stroke="currentColor" stroke-width="1.8" stroke-dasharray="3 1.5" />
            <circle cx="60" cy="60" r="34.5" fill="none" stroke="currentColor" stroke-width="1.0" />

            <!-- Circular Top Text (IRON SPIRIT RANCHI) -->
            <text font-size="4.3" font-weight="900" letter-spacing="0.7" fill="currentColor">
              <textPath href="#${topArcId}" startOffset="50%" text-anchor="middle">★ IRON SPIRIT RANCHI ★</textPath>
            </text>

            <!-- Circular Bottom Text (VERIFIED COACH) -->
            <text font-size="4.5" font-weight="900" letter-spacing="1.1" fill="currentColor">
              <textPath href="#${botArcId}" startOffset="50%" text-anchor="middle">★ VERIFIED COACH ★</textPath>
            </text>

            <!-- Inner Concentric Border Ring -->
            <circle cx="60" cy="60" r="26.5" fill="none" stroke="currentColor" stroke-width="1.0" />

            <!-- Center Core Medallion with top_logo.png -->
            <circle cx="60" cy="60" r="24" fill="#181c24" />
            <image href="top_logo.png" xlink:href="top_logo.png" x="36" y="36" width="48" height="48" clip-path="url(#${clipId})" preserveAspectRatio="xMidYMid meet" class="mag-stamp-logo-img" />
          </svg>
        </div>
      `;
    }

    function buildRightPageHTML(t, idx, total, isInteractive = true) {
      if (!t) return '';
      const stampKey = `${idx}-${isInteractive ? 'main' : 'flip'}`;
      return `
        <div class="mag-right-content">
          <div class="mag-watermark-logo" aria-hidden="true"></div>
          <div class="mag-meta-top">
            <span class="mag-tag-accent">CREDENTIALS & SPECIALTIES</span>
            ${t.socials?.instagram ? `
              <a href="${t.socials.instagram}" class="mag-insta-icon" target="_blank" rel="noopener" title="${t.name} on Instagram" aria-label="Instagram">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
            ` : ''}
          </div>
          
          <p class="mag-coach-bio">${t.bio}</p>

          <div class="mag-block-title">
            <span>🎯</span> Core Specialties
          </div>
          <ul class="mag-list">
            ${(t.specialties || []).map(s => `<li>${s}</li>`).join('')}
          </ul>

          <div class="mag-block-title">
            <span>📜</span> Accredited Certifications
          </div>
          <ul class="mag-list">
            ${(t.certifications || []).map(c => `<li><span class="check-mark">✓</span> ${c}</li>`).join('')}
          </ul>

          ${renderVerifiedStamp(stampKey)}

          <div class="mag-action-row">
            <div class="mag-pagination-controls">
              <button class="mag-page-arrow-btn prev" data-dir="prev" aria-label="Previous Coach" ${idx === 0 ? 'disabled' : ''} title="Previous Coach" ${!isInteractive ? 'tabindex="-1"' : ''}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <span class="mag-coach-counter">${idx + 1}/${total}</span>
              <button class="mag-page-arrow-btn next" data-dir="next" aria-label="Next Coach" ${idx === total - 1 ? 'disabled' : ''} title="Next Coach" ${!isInteractive ? 'tabindex="-1"' : ''}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
          </div>
        </div>
      `;
    }

    // External Mobile Nav Elements
    const mobilePrevBtn = document.getElementById('mag-mobile-prev');
    const mobileNextBtn = document.getElementById('mag-mobile-next');
    const mobileCounterText = document.getElementById('mag-mobile-counter');

    function updateMobileNavState() {
      if (mobileCounterText) mobileCounterText.textContent = `${currentIdx + 1} / ${totalCoaches}`;
      if (mobilePrevBtn) mobilePrevBtn.disabled = (currentIdx === 0);
      if (mobileNextBtn) mobileNextBtn.disabled = (currentIdx === totalCoaches - 1);
    }

    // Initial render
    leftPage.innerHTML = buildLeftPageHTML(state.trainers[0], 0);
    rightPage.innerHTML = buildRightPageHTML(state.trainers[0], 0, totalCoaches, true);
    updateMobileNavState();

    // Coach Drawer Modal Logic
    const backdrop = document.getElementById('coach-modal-backdrop');
    const sheet = document.getElementById('coach-modal-sheet');
    const titleEl = document.getElementById('coach-modal-title');
    const contentEl = document.getElementById('coach-modal-content');
    const closeBtn = document.getElementById('coach-modal-close');

    let isModalActive = false;

    function openCoachModal(coach) {
      if (!backdrop || !sheet || !coach) return;
      isModalActive = true;
      if (coachInfiniteHandler) coachInfiniteHandler.stopAutoScroll();
      if (titleEl) titleEl.textContent = `${coach.name}`;
      if (contentEl) {
        contentEl.innerHTML = `
          <div class="mag-drawer-meta-top">
            <div>
              <span class="mag-tag-accent">${coach.role}</span>
              <div class="mag-drawer-exp">${coach.experience}</div>
            </div>
            ${coach.socials?.instagram ? `
              <a href="${coach.socials.instagram}" class="mag-insta-icon" target="_blank" rel="noopener" title="${coach.name} on Instagram" aria-label="Instagram">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
            ` : ''}
          </div>
          
          <p class="mag-coach-bio">${coach.bio}</p>

          <div class="mag-block-title">
            <span>🎯</span> Core Specialties
          </div>
          <ul class="mag-list">
            ${(coach.specialties || []).map(s => `<li>${s}</li>`).join('')}
          </ul>

          <div class="mag-block-title">
            <span>📜</span> Accredited Certifications
          </div>
          <ul class="mag-list">
            ${(coach.certifications || []).map(c => `<li><span class="check-mark">✓</span> ${c}</li>`).join('')}
          </ul>
          <div style="display: flex; justify-content: center; margin-top: 14px;">
            ${renderVerifiedStamp('drawer')}
          </div>
        `;
      }
      backdrop.classList.add('active');
      sheet.classList.add('active');
      ModalManager.open('coach-modal', (opts) => closeCoachModal(opts));
    }

    function closeCoachModal(opts = {}) {
      if (backdrop && sheet) {
        backdrop.classList.remove('active');
        sheet.classList.remove('active');
        isModalActive = false;
        ModalManager.close('coach-modal', opts);
        if (coachInfiniteHandler) {
          setTimeout(() => coachInfiniteHandler.startAutoScroll(), 1000);
        }
      }
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => closeCoachModal());
    }
    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) closeCoachModal();
      });
      backdrop.addEventListener('touchmove', (e) => {
        if (e.target === backdrop) {
          e.preventDefault();
        }
      }, { passive: false });
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isModalActive) closeCoachModal();
    });

    // =========================================================================
    // MOBILE HORIZONTAL CAROUSEL RENDERING & INFINITE SEAMLESS LOOP (PEEK PREVIEW)
    // =========================================================================
    const mobileTrack = document.getElementById('coaches-track');
    const mobileCounterBadge = document.getElementById('coaches-counter-badge');

    let coachInfiniteHandler = null;

    if (mobileTrack && state.trainers.length) {
      const createCoachCard = (t, idx, isClone = false) => `
        <div class="coach-card-mobile ${isClone ? 'carousel-clone' : ''}" data-idx="${idx}">
          <img src="${t.image}" alt="${t.name}" class="coach-mobile-img" loading="lazy" />
          <div class="coach-mobile-overlay"></div>
          <div class="coach-mobile-top-badge">
            <span class="coach-mobile-exp-badge">${t.experience}</span>
          </div>
          <div class="coach-mobile-bottom-info">
            <h3 class="coach-mobile-name">${t.name}</h3>
            <div class="coach-mobile-role-wrap">
              <span class="coach-mobile-role">${t.role}</span>
              <span class="coach-mobile-info-icon" title="View Credentials & Bio" aria-label="View Info">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              </span>
            </div>
          </div>
        </div>
      `;

      // Render 3 sets for seamless infinite forward looping [clone, main, clone]
      const set1 = state.trainers.map((t, idx) => createCoachCard(t, idx, true)).join('');
      const set2 = state.trainers.map((t, idx) => createCoachCard(t, idx, false)).join('');
      const set3 = state.trainers.map((t, idx) => createCoachCard(t, idx, true)).join('');
      mobileTrack.innerHTML = set1 + set2 + set3;

      coachInfiniteHandler = setupInfiniteMobileTrack(mobileTrack, totalCoaches, {
        sectionId: 'coaches',
        onActiveChange: (realIdx) => {
          if (mobileCounterBadge) {
            mobileCounterBadge.textContent = `${realIdx + 1} / ${totalCoaches}`;
          }
        }
      });

      mobileTrack.addEventListener('click', (e) => {
        if (coachInfiniteHandler && coachInfiniteHandler.isSwiping()) return;
        const card = e.target.closest('.coach-card-mobile');
        if (!card) return;
        const idx = parseInt(card.dataset.idx, 10);
        if (!isNaN(idx) && state.trainers[idx]) {
          openCoachModal(state.trainers[idx]);
        }
      });
    }

    // =========================================================================
    // DESKTOP 3D MAGAZINE SPREAD FLIP LOGIC
    // =========================================================================
    function flipTo(targetIdx, direction) {
      if (isFlipping || targetIdx === currentIdx || targetIdx < 0 || targetIdx >= totalCoaches) return;
      isFlipping = true;

      const currentCoach = state.trainers[currentIdx];
      const targetCoach = state.trainers[targetIdx];

      // Desktop 3D Page Flip
      if (direction === 'next') {
        flipperFront.innerHTML = buildRightPageHTML(currentCoach, currentIdx, totalCoaches, false);
        flipperBack.innerHTML = buildLeftPageHTML(targetCoach, targetIdx);
        rightPage.innerHTML = buildRightPageHTML(targetCoach, targetIdx, totalCoaches, true);

        flipper.style.transition = 'none';
        flipper.style.transform = 'rotateY(0deg)';
        flipper.classList.add('flipping');
        void flipper.offsetHeight;

        flipper.style.transition = 'transform 0.52s cubic-bezier(0.4, 0.0, 0.2, 1)';
        flipper.style.transform = 'rotateY(-180deg)';

        setTimeout(() => {
          leftPage.innerHTML = buildLeftPageHTML(targetCoach, targetIdx);
          flipper.classList.remove('flipping');
          flipper.style.transform = 'rotateY(0deg)';
          currentIdx = targetIdx;
          isFlipping = false;
        }, 530);
      } else {
        flipperFront.innerHTML = buildRightPageHTML(targetCoach, targetIdx, totalCoaches, false);
        flipperBack.innerHTML = buildLeftPageHTML(currentCoach, currentIdx);
        leftPage.innerHTML = buildLeftPageHTML(targetCoach, targetIdx);

        flipper.style.transition = 'none';
        flipper.style.transform = 'rotateY(-180deg)';
        flipper.classList.add('flipping');
        void flipper.offsetHeight;

        flipper.style.transition = 'transform 0.52s cubic-bezier(0.4, 0.0, 0.2, 1)';
        flipper.style.transform = 'rotateY(0deg)';

        setTimeout(() => {
          rightPage.innerHTML = buildRightPageHTML(targetCoach, targetIdx, totalCoaches, true);
          flipper.classList.remove('flipping');
          flipper.style.transform = 'rotateY(0deg)';
          currentIdx = targetIdx;
          isFlipping = false;
        }, 530);
      }
    }

    // Desktop Event Delegation
    spread.addEventListener('click', (e) => {
      const arrowBtn = e.target.closest('.mag-page-arrow-btn');
      if (arrowBtn) {
        e.preventDefault();
        e.stopPropagation();
        if (arrowBtn.disabled || isFlipping) return;
        const dir = arrowBtn.dataset.dir;
        if (dir === 'next' && currentIdx < totalCoaches - 1) {
          flipTo(currentIdx + 1, 'next');
        } else if (dir === 'prev' && currentIdx > 0) {
          flipTo(currentIdx - 1, 'prev');
        }
        return;
      }
    });

    // Mouse Wheel page turning on Desktop
    let wheelDebounce = false;
    spread.addEventListener('wheel', (e) => {
      if (isFlipping || wheelDebounce || window.innerWidth <= 768) return;
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(delta) < 25) return;

      if (delta > 0 && currentIdx < totalCoaches - 1) {
        e.preventDefault();
        wheelDebounce = true;
        flipTo(currentIdx + 1, 'next');
        setTimeout(() => { wheelDebounce = false; }, 600);
      } else if (delta < 0 && currentIdx > 0) {
        e.preventDefault();
        wheelDebounce = true;
        flipTo(currentIdx - 1, 'prev');
        setTimeout(() => { wheelDebounce = false; }, 600);
      }
    }, { passive: false });

    // Keyboard Arrow Keys
    spread.addEventListener('keydown', (e) => {
      if (isFlipping) return;
      if (e.key === 'ArrowRight' && currentIdx < totalCoaches - 1) {
        e.preventDefault();
        flipTo(currentIdx + 1, 'next');
      } else if (e.key === 'ArrowLeft' && currentIdx > 0) {
        e.preventDefault();
        flipTo(currentIdx - 1, 'prev');
      } else if (e.key === 'Escape') {
        closeCoachModal();
      }
    });
  }

  // 10. Render Member Testimonials (The Void Orbital Carousel)
  function renderTestimonials() {
    const cardList = document.getElementById('card-list');
    const voidEl = document.getElementById('void');
    const ratingEl = document.getElementById('void-center-rating');
    const countEl = document.getElementById('void-center-count');

    if (!state.testimonials || !state.testimonials.length) return;

    const totalCount = state.testimonials.length;
    const totalStars = state.testimonials.reduce((sum, item) => sum + (item.stars || 5), 0);
    const avgRating = (totalStars / totalCount).toFixed(1);

    const formattedCount = totalCount < 10 ? `0${totalCount}+` : `${totalCount}+`;
    if (countEl) countEl.textContent = formattedCount;
    if (ratingEl) ratingEl.textContent = `⭐ ${avgRating} / 5.0`;

    if (!cardList) return;

    cardList.style.setProperty('--void-count', totalCount);

    // If 1 review, keep static without rotation. If > 1, enable orbit rotation.
    if (totalCount <= 1) {
      voidEl?.classList.add('is-static');
      cardList.classList.add('is-static');
    } else {
      voidEl?.classList.remove('is-static');
      cardList.classList.remove('is-static');
    }

    cardList.innerHTML = state.testimonials.map((t, index) => {
      const starIcons = '★'.repeat(t.stars || 5);
      return `
        <li>
          <div class="card" data-idx="${index}">
            <div class="card-inner">
              <div class="card-header">
                <img class="card-avatar" src="${t.avatar || 'https://i.pravatar.cc/100?img=' + (index + 20)}" alt="${t.name}" loading="lazy" />
                <div class="card-user-info">
                  <strong class="model-name">${t.name}</strong>
                  <span class="card-role">${t.role}</span>
                </div>
              </div>
              <div class="card-stars">${starIcons}</div>
              <p class="card-quote">"${t.quote}"</p>
            </div>
          </div>
        </li>
      `;
    }).join('');

    // Review Drawer Modal Logic
    const reviewBackdrop = document.getElementById('review-modal-backdrop');
    const reviewSheet = document.getElementById('review-modal-sheet');
    const reviewContent = document.getElementById('review-modal-content');
    const reviewCloseBtn = document.getElementById('review-modal-close');
    const reviewCounter = document.getElementById('review-modal-counter');
    const reviewPrevBtn = document.getElementById('review-modal-prev');
    const reviewNextBtn = document.getElementById('review-modal-next');

    let currentReviewIdx = 0;

    function renderReviewContent(idx) {
      if (!state.testimonials || !state.testimonials.length) return;
      const total = state.testimonials.length;
      currentReviewIdx = ((idx % total) + total) % total;
      const item = state.testimonials[currentReviewIdx];

      if (reviewCounter) {
        reviewCounter.textContent = `${currentReviewIdx + 1}/${total}`;
      }

      if (reviewContent) {
        const starIcons = '★'.repeat(item.stars || 5);
        reviewContent.innerHTML = `
          <div class="review-modal-hero">
            <img class="review-modal-avatar" src="${item.avatar || 'https://i.pravatar.cc/100?img=47'}" alt="${item.name}" />
            <div class="review-modal-info">
              <h3 class="review-modal-name">${item.name}</h3>
              <span class="review-modal-role">${item.role || 'Member'}</span>
              <div class="review-modal-stars-inline">${starIcons}</div>
            </div>
          </div>
          <div class="review-modal-quote">"${item.quote}"</div>
        `;
      }
    }

    function openReviewModal(idx) {
      if (!reviewBackdrop || !reviewSheet) return;
      renderReviewContent(idx);
      reviewBackdrop.classList.add('active');
      reviewSheet.classList.add('active');
      ModalManager.open('review-modal', (opts) => closeReviewModal(opts));
    }

    function closeReviewModal(opts = {}) {
      if (!reviewBackdrop || !reviewSheet) return;
      reviewSheet.classList.remove('active');
      reviewBackdrop.classList.remove('active');
      ModalManager.close('review-modal', opts);
    }

    if (reviewCloseBtn) reviewCloseBtn.addEventListener('click', () => closeReviewModal());
    if (reviewPrevBtn) reviewPrevBtn.addEventListener('click', () => renderReviewContent(currentReviewIdx - 1));
    if (reviewNextBtn) reviewNextBtn.addEventListener('click', () => renderReviewContent(currentReviewIdx + 1));

    if (reviewBackdrop) {
      reviewBackdrop.addEventListener('click', (e) => {
        if (e.target === reviewBackdrop) closeReviewModal();
      });
      reviewBackdrop.addEventListener('touchmove', (e) => {
        if (e.target === reviewBackdrop) {
          e.preventDefault();
        }
      }, { passive: false });
    }

    document.addEventListener('keydown', (e) => {
      if (!reviewBackdrop?.classList.contains('active')) return;
      if (e.key === 'Escape') closeReviewModal();
      if (e.key === 'ArrowLeft') renderReviewContent(currentReviewIdx - 1);
      if (e.key === 'ArrowRight') renderReviewContent(currentReviewIdx + 1);
    });

    // Clicking any card opens full Review Modal Drawer (Mobile & Desktop)
    cardList.addEventListener('click', (e) => {
      const card = e.target.closest('.card');
      if (!card) return;
      const idx = parseInt(card.dataset.idx, 10);
      if (!isNaN(idx) && state.testimonials[idx]) {
        openReviewModal(idx);
      }
    });
  }

  // 11. Random Athletic Animation Videos (Distinct & Unique on Why Us & Testimonials, Changes on Every Refresh)
  function initReviewLeftAnimation() {
    const whyUsVideo = document.getElementById('why-us-video');
    const reviewVideo = document.getElementById('void-left-video');
    if (!whyUsVideo && !reviewVideo) return;

    const animations = [
      'animations/Girl running on treadmill.mp4',
      'animations/Man Showing Muscles.mp4',
      'animations/Man doing Barbell Lunges.mp4',
      'animations/Man doing Crunches.mp4',
      'animations/Man doing Inclined Press.mp4',
      'animations/Man doing barbell curl.mp4'
    ];

    let lastWhyUs = null;
    let lastReview = null;
    try {
      lastWhyUs = sessionStorage.getItem('ironspirit_last_whyus_anim');
      lastReview = sessionStorage.getItem('ironspirit_last_review_anim');
    } catch (e) {}

    // 1. Pick Video A for Why Us (avoiding last played in Why Us)
    const whyUsCandidates = (lastWhyUs && animations.length > 1)
      ? animations.filter(v => v !== lastWhyUs)
      : animations;
    const whyUsIndex = Math.floor(Math.random() * whyUsCandidates.length);
    const whyUsSelected = whyUsCandidates[whyUsIndex] || animations[0];

    // 2. Pick Video B for Testimonials (Guaranteed DIFFERENT from Why Us Video A)
    const reviewCandidates = animations.filter(v => v !== whyUsSelected && (lastReview ? v !== lastReview : true));
    const finalReviewList = reviewCandidates.length ? reviewCandidates : animations.filter(v => v !== whyUsSelected);
    const reviewIndex = Math.floor(Math.random() * finalReviewList.length);
    const reviewSelected = finalReviewList[reviewIndex] || animations[1];

    try {
      sessionStorage.setItem('ironspirit_last_whyus_anim', whyUsSelected);
      sessionStorage.setItem('ironspirit_last_review_anim', reviewSelected);
    } catch (e) {}

    // Play Why Us Video
    if (whyUsVideo && whyUsSelected) {
      whyUsVideo.src = encodeURI(whyUsSelected);
      whyUsVideo.load();
      const p1 = whyUsVideo.play();
      if (p1 !== undefined) p1.catch(() => {});
    }

    // Play Testimonials Video
    if (reviewVideo && reviewSelected) {
      reviewVideo.src = encodeURI(reviewSelected);
      reviewVideo.load();
      const p2 = reviewVideo.play();
      if (p2 !== undefined) p2.catch(() => {});
    }

    // Performance Optimization: Pause video playback when offscreen (avoids mobile GPU & CPU throttling)
    if ('IntersectionObserver' in window) {
      if (whyUsVideo) {
        const whyUsObs = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const p = whyUsVideo.play();
              if (p !== undefined) p.catch(() => {});
            } else {
              whyUsVideo.pause();
            }
          });
        }, { threshold: 0.1 });
        whyUsObs.observe(whyUsVideo);
      }
      if (reviewVideo) {
        const revObs = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const p = reviewVideo.play();
              if (p !== undefined) p.catch(() => {});
            } else {
              reviewVideo.pause();
            }
          });
        }, { threshold: 0.1 });
        revObs.observe(reviewVideo);
      }
    }
  }

  function initTestimonialsSlider() {
    // Replaced by self-contained CSS orbital Void carousel
  }

  // 12. Render FAQ Accordion (Desktop) + Horizontal Carousel (Mobile)
  function renderFAQs() {
    const desktopContainer = document.getElementById('faqs-container');
    const mobileTrack = document.getElementById('faqs-track');
    const mobileCounter = document.getElementById('faqs-counter-badge');
    if (!state.faqs.length) return;

    // Desktop Accordion Render
    if (desktopContainer) {
      desktopContainer.innerHTML = state.faqs.map((faq, index) => `
        <div class="faq-item ${index === 0 ? 'active' : ''}">
          <button class="faq-question-btn" type="button">
            <span>${faq.question}</span>
            <span class="faq-icon-toggle">+</span>
          </button>
          <div class="faq-answer">
            <p>${faq.answer}</p>
          </div>
        </div>
      `).join('');

      desktopContainer.querySelectorAll('.faq-question-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const item = btn.closest('.faq-item');
          const isActive = item.classList.contains('active');

          desktopContainer.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));

          if (!isActive) {
            item.classList.add('active');
          }
        });
      });
    }

    // FAQ Answer Drawer Modal Logic
    const faqBackdrop = document.getElementById('faq-modal-backdrop');
    const faqSheet = document.getElementById('faq-modal-sheet');
    const faqContent = document.getElementById('faq-modal-content');
    const faqCloseBtn = document.getElementById('faq-modal-close');
    const faqCounter = document.getElementById('faq-modal-counter');
    const faqPrevBtn = document.getElementById('faq-modal-prev');
    const faqNextBtn = document.getElementById('faq-modal-next');

    let currentFaqIdx = 0;

    function renderFaqContent(idx) {
      if (!state.faqs || !state.faqs.length) return;
      const total = state.faqs.length;
      currentFaqIdx = ((idx % total) + total) % total;
      const item = state.faqs[currentFaqIdx];

      if (faqCounter) {
        faqCounter.textContent = `${currentFaqIdx + 1}/${total}`;
      }

      if (faqContent) {
        faqContent.innerHTML = `
          <div class="faq-modal-q-badge">QUESTION ${String(currentFaqIdx + 1).padStart(2, '0')}</div>
          <h3 class="faq-modal-q-title">${item.question}</h3>
          <div class="faq-modal-answer-box">
            <p class="faq-modal-answer-text">${item.answer}</p>
          </div>
        `;
      }
    }

    function openFaqModal(idx) {
      if (!faqBackdrop || !faqSheet) return;
      renderFaqContent(idx);
      faqBackdrop.classList.add('active');
      faqSheet.classList.add('active');
      ModalManager.open('faq-modal', (opts) => closeFaqModal(opts));
    }

    function closeFaqModal(opts = {}) {
      if (!faqBackdrop || !faqSheet) return;
      faqSheet.classList.remove('active');
      faqBackdrop.classList.remove('active');
      ModalManager.close('faq-modal', opts);
    }

    if (faqCloseBtn) faqCloseBtn.addEventListener('click', () => closeFaqModal());
    if (faqPrevBtn) faqPrevBtn.addEventListener('click', () => renderFaqContent(currentFaqIdx - 1));
    if (faqNextBtn) faqNextBtn.addEventListener('click', () => renderFaqContent(currentFaqIdx + 1));

    if (faqBackdrop) {
      faqBackdrop.addEventListener('click', (e) => {
        if (e.target === faqBackdrop) closeFaqModal();
      });
      faqBackdrop.addEventListener('touchmove', (e) => {
        if (e.target === faqBackdrop) {
          e.preventDefault();
        }
      }, { passive: false });
    }

    document.addEventListener('keydown', (e) => {
      if (!faqBackdrop?.classList.contains('active')) return;
      if (e.key === 'Escape') closeFaqModal();
      if (e.key === 'ArrowLeft') renderFaqContent(currentFaqIdx - 1);
      if (e.key === 'ArrowRight') renderFaqContent(currentFaqIdx + 1);
    });

    // Mobile Horizontal Carousel Render (Question Cards Only + Tap to Open Answer Drawer)
    if (mobileTrack) {
      const createFaqCard = (faq, idx, isClone = false) => `
        <div class="faq-card-mobile ${isClone ? 'carousel-clone' : ''}" data-idx="${idx}">
          <div class="faq-mobile-badge-row">
            <span class="faq-mobile-badge">Q${String(idx + 1).padStart(2, '0')}</span>
            <span class="faq-mobile-tap-tag">
              <span>Answer</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </span>
          </div>
          <h3 class="faq-mobile-question">${faq.question}</h3>
          <div class="faq-mobile-action-hint">
            <span>Tap to read full answer</span>
            <span>→</span>
          </div>
        </div>
      `;

      const set1 = state.faqs.map((f, idx) => createFaqCard(f, idx, true)).join('');
      const set2 = state.faqs.map((f, idx) => createFaqCard(f, idx, false)).join('');
      const set3 = state.faqs.map((f, idx) => createFaqCard(f, idx, true)).join('');
      mobileTrack.innerHTML = set1 + set2 + set3;

      const faqInfiniteHandler = setupInfiniteMobileTrack(mobileTrack, state.faqs.length, {
        sectionId: 'faqs',
        onActiveChange: (realIdx) => {
          if (mobileCounter) {
            mobileCounter.textContent = `${realIdx + 1} / ${state.faqs.length}`;
          }
        }
      });

      mobileTrack.addEventListener('click', (e) => {
        if (faqInfiniteHandler && faqInfiniteHandler.isSwiping()) return;
        const card = e.target.closest('.faq-card-mobile');
        if (!card) return;
        const idx = parseInt(card.dataset.idx, 10);
        if (!isNaN(idx) && state.faqs[idx]) {
          openFaqModal(idx);
        }
      });
    }
  }

  // 12. Modals Management
  function initModals() {
    document.querySelectorAll('.modal-close-btn, .modal-backdrop').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target === el || el.classList.contains('modal-close-btn')) {
          const modal = el.closest('.modal-backdrop');
          if (modal) closeModal(modal.id);
        }
      });
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop.open').forEach(modal => {
          closeModal(modal.id);
        });
      }
    });

    const copyBtn = document.getElementById('copy-coupon-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const code = document.getElementById('offer-coupon-code')?.textContent || 'KOKAR35';
        navigator.clipboard.writeText(code).then(() => {
          copyBtn.textContent = 'COPIED!';
          setTimeout(() => {
            copyBtn.textContent = 'COPY CODE';
          }, 2000);
        });
      });
    }

    const closeTopBannerBtn = document.getElementById('close-announcement-btn');
    if (closeTopBannerBtn) {
      closeTopBannerBtn.addEventListener('click', () => {
        const topBar = document.getElementById('top-announcement-bar');
        if (topBar) topBar.style.display = 'none';
      });
    }
  }

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('open');
      ModalManager.open(modalId, (opts) => closeModal(modalId, opts));
    }
  }

  function closeModal(modalId, opts = {}) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('open');
      ModalManager.close(modalId, opts);
    }
  }

  // 10b. Professional Gallery & Media Vault
  let activeGalleryCategory = 'all';
  let activeModalGalleryCategory = 'all';
  let currentLightboxIndex = 0;
  let currentLightboxList = [];
  let shuffledAllMedia = [];

  function getMediaThumbnailHTML(item, className = 'gallery-card-img') {
    const thumbSrc = item.thumbnail || item.image;
    if (thumbSrc && typeof thumbSrc === 'string' && thumbSrc.trim() !== '') {
      return `<img class="${className} skeleton-img-fade" src="${thumbSrc}" alt="${item.title}" loading="lazy" onload="this.classList.add('is-loaded'); if(this.parentElement) this.parentElement.classList.add('media-loaded');" onerror="this.classList.add('is-loaded');" />`;
    }
    if (item.type === 'video' && item.videoUrl) {
      // Fallback: If thumbnail is empty, use video frame as thumbnail
      return `<video class="${className} skeleton-img-fade" src="${item.videoUrl}#t=0.5" preload="metadata" muted playsinline style="width: 100%; height: 100%; object-fit: cover; pointer-events: none;" onloadeddata="this.classList.add('is-loaded'); if(this.parentElement) this.parentElement.classList.add('media-loaded');"></video>`;
    }
    return `<div class="${className}" style="background: #e2e8f0; width: 100%; height: 100%;"></div>`;
  }

  function renderGallery() {
    const previewGrid = document.getElementById('gallery-preview-grid');
    const filterBar = document.getElementById('gallery-filter-bar');
    const filterPrevBtn = document.getElementById('gallery-filter-prev');
    const filterNextBtn = document.getElementById('gallery-filter-next');
    const filterButtons = document.querySelectorAll('#gallery-filter-bar .gallery-filter-btn');
    if (!previewGrid || !state.gallery || !state.gallery.length) return;

    // Fisher-Yates Random Shuffle on Page Load across all categories
    shuffledAllMedia = [...state.gallery].sort(() => Math.random() - 0.5);

    // Filter Buttons logic
    filterButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        filterButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        activeGalleryCategory = this.dataset.filter || 'all';
        // Center the active pill in filterBar
        if (filterBar) {
          const pillOffset = this.offsetLeft - (filterBar.offsetWidth / 2) + (this.offsetWidth / 2);
          filterBar.scrollTo({ left: Math.max(0, pillOffset), behavior: 'smooth' });
        }
        renderPreviewItems();
        resetMobileAutoScroll();
      });
    });

    // Filter scroll chevrons logic
    function updateFilterArrowState() {
      if (!filterBar || !filterPrevBtn || !filterNextBtn) return;
      const scrollLeft = Math.ceil(filterBar.scrollLeft);
      const maxScroll = filterBar.scrollWidth - filterBar.clientWidth;
      const isScrollable = maxScroll > 4;

      if (!isScrollable) {
        filterBar.style.justifyContent = 'center';
        filterPrevBtn.style.opacity = '0';
        filterPrevBtn.style.pointerEvents = 'none';
        filterNextBtn.style.opacity = '0';
        filterNextBtn.style.pointerEvents = 'none';
      } else {
        filterBar.style.justifyContent = 'flex-start';
        const isAtStart = scrollLeft <= 4;
        const isAtEnd = scrollLeft >= maxScroll - 4;
        filterPrevBtn.style.opacity = isAtStart ? '0.2' : '1';
        filterPrevBtn.style.pointerEvents = isAtStart ? 'none' : 'auto';
        filterNextBtn.style.opacity = isAtEnd ? '0.2' : '1';
        filterNextBtn.style.pointerEvents = isAtEnd ? 'none' : 'auto';
      }
    }

    if (filterPrevBtn && filterBar) {
      filterPrevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        filterBar.scrollBy({ left: -140, behavior: 'smooth' });
      });
    }

    if (filterNextBtn && filterBar) {
      filterNextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        filterBar.scrollBy({ left: 140, behavior: 'smooth' });
      });
    }

    if (filterBar) {
      filterBar.addEventListener('scroll', updateFilterArrowState, { passive: true });
      window.addEventListener('resize', updateFilterArrowState, { passive: true });
      setTimeout(updateFilterArrowState, 100);
      setTimeout(updateFilterArrowState, 400);
    }

    function populateFilterCounts() {
      if (!state.gallery) return;
      const totalCount = state.gallery.length;
      const counts = {
        'all': totalCount,
        'gym': state.gallery.filter(g => g.category === 'gym').length,
        'videos': state.gallery.filter(g => g.category === 'videos').length,
        'achievements': state.gallery.filter(g => g.category === 'achievements').length,
        'events': state.gallery.filter(g => g.category === 'events').length
      };

      const categoryLabels = {
        'all': 'All Media',
        'gym': 'Gym & Equipment',
        'videos': 'Workout Videos',
        'achievements': 'Trophies & Wins',
        'events': 'Events & Meets'
      };

      // Update Homepage Filter Buttons (Auto-hide if 0 items)
      const homeFilterBtns = document.querySelectorAll('#gallery-filter-bar .gallery-filter-btn');
      homeFilterBtns.forEach(btn => {
        const cat = btn.dataset.filter || 'all';
        const count = counts[cat] !== undefined ? counts[cat] : 0;
        if (cat !== 'all' && count === 0) {
          btn.style.display = 'none';
        } else {
          btn.style.display = '';
          const label = categoryLabels[cat] || btn.textContent.split('(')[0].trim();
          btn.textContent = `${label} (${count})`;
        }
      });

      // Update Full-Screen Vault Filter Chips (Auto-hide if 0 items)
      const modalFilterChips = document.querySelectorAll('#gallery-modal-filter-bar .vault-filter-chip');
      modalFilterChips.forEach(chip => {
        const cat = chip.dataset.filter || 'all';
        const count = counts[cat] !== undefined ? counts[cat] : 0;
        if (cat !== 'all' && count === 0) {
          chip.style.display = 'none';
        } else {
          chip.style.display = '';
          const label = categoryLabels[cat] || chip.textContent.split('(')[0].trim();
          chip.textContent = `${label} (${count})`;
        }
      });

      // If active category was hidden due to 0 count, fallback to 'all'
      if (activeGalleryCategory !== 'all' && (counts[activeGalleryCategory] === 0 || counts[activeGalleryCategory] === undefined)) {
        activeGalleryCategory = 'all';
        homeFilterBtns.forEach(b => {
          if (b.dataset.filter === 'all') b.classList.add('active');
          else b.classList.remove('active');
        });
      }

      if (activeModalGalleryCategory !== 'all' && (counts[activeModalGalleryCategory] === 0 || counts[activeModalGalleryCategory] === undefined)) {
        activeModalGalleryCategory = 'all';
        modalFilterChips.forEach(b => {
          if (b.dataset.filter === 'all') b.classList.add('active');
          else b.classList.remove('active');
        });
      }

      // Update CTA button with live count
      const ctaDesktop = document.querySelector('#open-full-gallery-btn .btn-text-desktop');
      const ctaMobile = document.querySelector('#open-full-gallery-btn .btn-text-mobile');
      if (ctaDesktop) ctaDesktop.textContent = `Explore Full Media Vault (${totalCount}+)`;
      if (ctaMobile) ctaMobile.textContent = `View Full Gallery (${totalCount}+)`;

      // Recalculate filter scroll arrows
      updateFilterArrowState();
    }

    function getFilteredItems(category) {
      if (category === 'all') {
        // Return diverse random shuffled mix of all media items on page load
        return shuffledAllMedia;
      }
      return state.gallery.filter(item => item.category === category);
    }

    function createCardHTML(item, globalIndex) {
      const isVideo = item.type === 'video';
      const thumbHTML = getMediaThumbnailHTML(item, 'gallery-card-img');
      return `
        <div class="gallery-card" data-gallery-id="${item.id}" data-global-idx="${globalIndex}">
          <div class="gallery-card-media">
            ${thumbHTML}
            <div class="gallery-card-overlay"></div>
            ${isVideo ? `
              <div class="gallery-play-icon-wrap" aria-label="Play Video">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              </div>
            ` : ''}
          </div>
          <div class="gallery-card-info">
            <h3 class="gallery-card-title">${item.title}</h3>
            <p class="gallery-card-desc">${item.description}</p>
          </div>
        </div>
      `;
    }

    let currentPreviewItemsCount = 0;
    let mobileAutoScrollTimer = null;
    let isUserInteracting = false;
    let resumeTimeout = null;

    function renderPreviewItems() {
      let items = getFilteredItems(activeGalleryCategory);
      items = items.slice(0, 8);
      currentPreviewItemsCount = items.length;

      previewGrid.innerHTML = items.map(item => {
        const globalIdx = state.gallery.findIndex(g => g.id === item.id);
        return createCardHTML(item, globalIdx);
      }).join('');

      previewGrid.scrollLeft = 0;

      // Add click listeners to open Lightbox
      previewGrid.querySelectorAll('.gallery-card').forEach(card => {
        card.addEventListener('click', function() {
          const globalIdx = parseInt(this.dataset.globalIdx, 10);
          openLightbox(globalIdx, state.gallery);
        });
      });
    }

    populateFilterCounts();
    renderPreviewItems();
  }

  function initGalleryModal() {
    const openBtn = document.getElementById('open-full-gallery-btn');
    const closeBtn = document.getElementById('close-full-gallery-btn');
    const modal = document.getElementById('full-gallery-modal');
    const modalScrollContent = document.getElementById('vault-scroll-content');
    const modalGrid = document.getElementById('gallery-full-grid');
    const modalFilterBtns = document.querySelectorAll('#gallery-modal-filter-bar .vault-filter-chip, #gallery-modal-filter-bar .gallery-modal-filter-btn');
    const paginationWrap = document.getElementById('vault-pagination-wrap');
    const prevPageBtn = document.getElementById('vault-prev-page-btn');
    const nextPageBtn = document.getElementById('vault-next-page-btn');
    const pageNumbersEl = document.getElementById('vault-page-numbers');

    if (!modal) return;

    const VAULT_PAGE_SIZE = 8;
    let vaultCurrentPage = 1;
    let isTransitioning = false;

    function renderModalItems(withTransition = false) {
      if (!modalGrid || !state.gallery) return;
      let items = state.gallery;
      if (activeModalGalleryCategory !== 'all') {
        items = state.gallery.filter(g => g.category === activeModalGalleryCategory);
      }

      const totalItems = items.length;
      const totalPages = Math.ceil(totalItems / VAULT_PAGE_SIZE) || 1;
      if (vaultCurrentPage > totalPages) vaultCurrentPage = totalPages;
      if (vaultCurrentPage < 1) vaultCurrentPage = 1;

      const startIndex = (vaultCurrentPage - 1) * VAULT_PAGE_SIZE;
      const paginatedItems = items.slice(startIndex, startIndex + VAULT_PAGE_SIZE);

      const renderCards = () => {
        modalGrid.innerHTML = paginatedItems.map(item => {
          const isVideo = item.type === 'video';
          const globalIdx = state.gallery.findIndex(g => g.id === item.id);
          const thumbHTML = getMediaThumbnailHTML(item, 'vault-tile-img');
          return `
            <div class="vault-photo-tile" data-gallery-id="${item.id}" data-global-idx="${globalIdx}" role="button" tabindex="0" aria-label="${item.title}">
              ${thumbHTML}
              <div class="vault-tile-overlay"></div>
              ${isVideo ? `
                <div class="vault-tile-play" aria-label="Play Video">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                </div>
              ` : ''}
              <div class="vault-tile-info">
                <h4 class="vault-tile-title">${item.title}</h4>
                <p class="vault-tile-subtitle">${item.description}</p>
              </div>
            </div>
          `;
        }).join('');

        modalGrid.querySelectorAll('.vault-photo-tile').forEach(tile => {
          tile.addEventListener('click', function() {
            const globalIdx = parseInt(this.dataset.globalIdx, 10);
            openLightbox(globalIdx, state.gallery);
          });
        });

        // Update Pagination Controls
        if (paginationWrap && pageNumbersEl) {
          if (totalPages <= 1) {
            paginationWrap.style.display = 'none';
          } else {
            paginationWrap.style.display = 'flex';
            if (prevPageBtn) prevPageBtn.disabled = (vaultCurrentPage === 1);
            if (nextPageBtn) nextPageBtn.disabled = (vaultCurrentPage === totalPages);

            let pageHtml = '';
            for (let p = 1; p <= totalPages; p++) {
              pageHtml += `<button class="vault-page-num-btn ${p === vaultCurrentPage ? 'active' : ''}" data-page="${p}" aria-label="Page ${p}">${p}</button>`;
            }
            pageNumbersEl.innerHTML = pageHtml;

            pageNumbersEl.querySelectorAll('.vault-page-num-btn').forEach(btn => {
              btn.addEventListener('click', function() {
                const targetPage = parseInt(this.dataset.page, 10);
                if (targetPage !== vaultCurrentPage) {
                  vaultCurrentPage = targetPage;
                  if (modalScrollContent) modalScrollContent.scrollTo({ top: 0, behavior: 'smooth' });
                  renderModalItems(true);
                }
              });
            });
          }
        }
      };

      if (withTransition) {
        modalGrid.classList.add('is-switching');
        setTimeout(() => {
          renderCards();
          requestAnimationFrame(() => {
            modalGrid.classList.remove('is-switching');
          });
        }, 180);
      } else {
        renderCards();
      }
    }

    if (prevPageBtn) {
      prevPageBtn.addEventListener('click', () => {
        if (vaultCurrentPage > 1) {
          vaultCurrentPage--;
          if (modalScrollContent) modalScrollContent.scrollTo({ top: 0, behavior: 'smooth' });
          renderModalItems(true);
        }
      });
    }

    if (nextPageBtn) {
      nextPageBtn.addEventListener('click', () => {
        let items = state.gallery;
        if (activeModalGalleryCategory !== 'all') {
          items = state.gallery.filter(g => g.category === activeModalGalleryCategory);
        }
        const totalPages = Math.ceil(items.length / VAULT_PAGE_SIZE) || 1;
        if (vaultCurrentPage < totalPages) {
          vaultCurrentPage++;
          if (modalScrollContent) modalScrollContent.scrollTo({ top: 0, behavior: 'smooth' });
          renderModalItems(true);
        }
      });
    }

    function openVaultView(fromHash = false) {
      if (document.documentElement.classList.contains('init-vault-open')) {
        document.documentElement.classList.remove('init-vault-open');
      }
      renderModalItems(false);
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';

      if (!fromHash && window.location.hash !== '#gallery-vault') {
        history.pushState({ modal: 'full-gallery-modal' }, '', '#gallery-vault');
      }
    }

    function closeVaultView() {
      if (isTransitioning) return;
      isTransitioning = true;

      modal.classList.remove('open');
      document.body.style.overflow = '';
      if (document.documentElement.classList.contains('init-vault-open')) {
        document.documentElement.classList.remove('init-vault-open');
      }

      if (window.location.hash === '#gallery-vault') {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }

      const ctaBtn = document.getElementById('open-full-gallery-btn') || document.getElementById('gallery');
      if (ctaBtn) {
        ctaBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      setTimeout(() => {
        isTransitioning = false;
      }, 300);
    }

    if (openBtn) {
      openBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openVaultView(false);
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeVaultView();
      });
    }

    // Auto-open on page load/refresh if URL contains #gallery-vault
    if (window.location.hash === '#gallery-vault') {
      openVaultView(true);
    }

    // Hash change / popstate listener
    window.addEventListener('popstate', () => {
      if (isTransitioning) return;
      if (window.location.hash === '#gallery-vault') {
        if (!modal.classList.contains('open')) {
          openVaultView(true);
        }
      } else {
        if (modal.classList.contains('open')) {
          closeVaultView();
        }
      }
    });

    // Keyboard ESC key handler
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        const lightbox = document.getElementById('gallery-lightbox');
        if (lightbox && lightbox.classList.contains('is-active')) return;
        closeVaultView();
      }
    });

    modalFilterBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        modalFilterBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        activeModalGalleryCategory = this.dataset.filter || 'all';
        vaultCurrentPage = 1;
        if (modalScrollContent) modalScrollContent.scrollTo({ top: 0, behavior: 'smooth' });
        renderModalItems(true);
      });
    });

    initLightbox();
  }

  function initLightbox() {
    const lightbox = document.getElementById('gallery-lightbox');
    const mediaContainer = document.getElementById('lightbox-media-container');
    const titleEl = document.getElementById('lightbox-title');
    const descEl = document.getElementById('lightbox-desc');
    const counterEl = document.getElementById('lightbox-counter');
    const closeBtn = document.getElementById('lightbox-close-btn');
    const prevBtn = document.getElementById('lightbox-prev-btn');
    const nextBtn = document.getElementById('lightbox-next-btn');

    if (!lightbox) return;

    window.openLightbox = function(index, list = state.gallery) {
      if (!list || !list.length) return;
      currentLightboxList = list;
      currentLightboxIndex = ((index % list.length) + list.length) % list.length;
      updateLightboxContent();
      lightbox.classList.add('is-active');
      ModalManager.open('gallery-lightbox', () => closeLightbox());
    };

    function closeLightbox(opts = {}) {
      if (!lightbox) return;
      lightbox.classList.remove('is-active');
      if (mediaContainer) {
        mediaContainer.innerHTML = '';
      }
      ModalManager.close('gallery-lightbox', opts);
    }

    function updateLightboxContent() {
      const item = currentLightboxList[currentLightboxIndex];
      if (!item) return;

      if (titleEl) titleEl.textContent = item.title;
      if (descEl) descEl.textContent = item.description;
      if (counterEl) counterEl.textContent = `${currentLightboxIndex + 1} / ${currentLightboxList.length}`;

      if (mediaContainer) {
        if (item.type === 'video') {
          const videoSrc = item.videoUrl || 'hero.mp4';
          const thumbSrc = item.thumbnail || item.image;
          const posterAttr = (thumbSrc && thumbSrc.trim() !== '') ? `poster="${thumbSrc}"` : '';
          mediaContainer.innerHTML = `
            <video src="${videoSrc}" ${posterAttr} controls autoplay playsinline style="max-width: 100%; max-height: 75vh; border-radius: 14px; outline: none;"></video>
          `;
        } else {
          const imgSrc = item.image || item.thumbnail;
          mediaContainer.innerHTML = `
            <img src="${imgSrc}" alt="${item.title}" style="max-width: 100%; max-height: 75vh; border-radius: 14px; object-fit: contain;" />
          `;
        }
      }
    }

    function showNext() {
      if (currentLightboxList.length) {
        currentLightboxIndex = (currentLightboxIndex + 1) % currentLightboxList.length;
        updateLightboxContent();
      }
    }

    function showPrev() {
      if (currentLightboxList.length) {
        currentLightboxIndex = ((currentLightboxIndex - 1 + currentLightboxList.length) % currentLightboxList.length);
        updateLightboxContent();
      }
    }

    if (closeBtn) closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeLightbox();
    });

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showPrev();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showNext();
      });
    }

    // Touch Swipe Navigation for Native Gallery App Experience
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    lightbox.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;
      const threshold = 45;

      // Horizontal Swipe
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > threshold) {
        if (diffX < 0) {
          // Swiped Left -> Next Photo
          showNext();
        } else {
          // Swiped Right -> Previous Photo
          showPrev();
        }
      } else if (Math.abs(diffY) > 80 && Math.abs(diffY) > Math.abs(diffX)) {
        // Swiped down -> Close gallery preview
        closeLightbox();
      }
    }

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target === mediaContainer) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('is-active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    });
  }

  // 14. Mobile Navigation Slide-out Drawer
  function initMobileNav() {
    const hamburger = document.getElementById('hamburger-btn');
    const sidebar = document.getElementById('mobile-sidebar');
    const backdrop = document.getElementById('mobile-sidebar-backdrop');
    const closeBtn = document.getElementById('sidebar-close-btn');

    function openSidebar() {
      if (sidebar && backdrop) {
        sidebar.classList.add('open');
        backdrop.classList.add('active');
        ModalManager.open('mobile-sidebar', (opts) => closeSidebar(opts));
      }
    }

    function closeSidebar(opts = {}) {
      if (sidebar && backdrop) {
        sidebar.classList.remove('open');
        backdrop.classList.remove('active');
        ModalManager.close('mobile-sidebar', opts);
      }
    }

    if (hamburger) {
      hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        if (sidebar && sidebar.classList.contains('open')) {
          closeSidebar();
        } else {
          openSidebar();
        }
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => closeSidebar());
    }

    if (backdrop) {
      backdrop.addEventListener('click', () => closeSidebar());
    }

    // Close on navigation link clicks inside sidebar
    if (sidebar) {
      sidebar.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          closeSidebar();
        });
      });
    }

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sidebar && sidebar.classList.contains('open')) {
        closeSidebar();
      }
    });

    // Smooth scroll for in-page anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href && href.length > 1 && href.startsWith('#')) {
          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });
  }

  // 14c. App-Like Mobile Bottom Navigation (Zero-Lag ScrollSpy & Auto-Centering Tabs)
  function initMobileBottomNav() {
    const bottomNav = document.getElementById('mobile-bottom-nav');
    if (!bottomNav) return;

    const navItems = bottomNav.querySelectorAll('.bottom-nav-item');
    const scrollTrack = bottomNav.querySelector('.bottom-nav-scroll-track');

    function scrollTabIntoView(activeItem) {
      if (!scrollTrack || !activeItem) return;
      const itemLeft = activeItem.offsetLeft;
      const itemWidth = activeItem.offsetWidth;
      const trackWidth = scrollTrack.clientWidth;
      const targetScroll = itemLeft - (trackWidth / 2) + (itemWidth / 2);
      scrollTrack.scrollTo({ left: Math.max(0, targetScroll), behavior: 'smooth' });
    }

    // Click behavior
    navItems.forEach(item => {
      item.addEventListener('click', function(e) {
        const sectionId = this.dataset.section;
        if (sectionId === 'offers') {
          e.preventDefault();
          // Open Offer Modal
          if (typeof openModal === 'function') {
            openModal('offer-modal');
          } else {
            const membershipsEl = document.getElementById('memberships');
            if (membershipsEl) membershipsEl.scrollIntoView({ behavior: 'smooth' });
          }
          return;
        }

        if (this.getAttribute('href')?.startsWith('#')) {
          navItems.forEach(nav => nav.classList.remove('active'));
          this.classList.add('active');
          scrollTabIntoView(this);
        }
      });
    });

    // Efficient ScrollSpy with cached section boundaries (Zero forced synchronous reflow)
    const sectionIds = ['hero', 'why-us', 'facilities', 'memberships', 'coaches', 'gallery', 'testimonials', 'contact'];
    let cachedSections = [];

    function updateSectionCache() {
      cachedSections = sectionIds.map(id => {
        const target = document.getElementById(id);
        if (!target) return null;
        const rect = target.getBoundingClientRect();
        const top = rect.top + window.scrollY;
        return { id, top, height: target.offsetHeight };
      }).filter(Boolean);
    }

    updateSectionCache();
    window.addEventListener('resize', updateSectionCache, { passive: true });

    let activeSectionId = 'hero';
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollPos = window.scrollY + 200;
          let currentSection = 'hero';

          for (let i = 0; i < cachedSections.length; i++) {
            const sec = cachedSections[i];
            if (scrollPos >= sec.top - 60 && scrollPos < sec.top + sec.height) {
              currentSection = sec.id;
              break;
            }
          }

          if (currentSection !== activeSectionId) {
            activeSectionId = currentSection;
            let activeItem = null;
            navItems.forEach(item => {
              if (item.dataset.section === currentSection) {
                item.classList.add('active');
                activeItem = item;
              } else {
                item.classList.remove('active');
              }
            });
            if (activeItem) {
              scrollTabIntoView(activeItem);
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // 14b. Header & Mobile Bottom Nav Scroll State (Transparent/Dark on Hero, Frosted Glass on Scroll)
  function initHeaderScrollState() {
    const siteHeader = document.querySelector('.site-header');
    const headerGroup = document.querySelector('.fixed-top-header-group');
    const bottomNav = document.getElementById('mobile-bottom-nav');
    if (!siteHeader && !bottomNav) return;

    function handleScroll() {
      const isScrolled = window.scrollY > 40;
      if (siteHeader) siteHeader.classList.toggle('scrolled', isScrolled);
      if (headerGroup) headerGroup.classList.toggle('scrolled', isScrolled);
      if (bottomNav) bottomNav.classList.toggle('scrolled', isScrolled);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  // 15. Clean Next & Previous Carousel Navigation + Mobile Infinite Loop Setup
  function initHorizontalCarousels() {
    // Setup Mobile Infinite Looping for Amenities & Membership Plans
    const amenitiesTrack = document.getElementById('amenities-container');
    if (amenitiesTrack && state.amenities.length) {
      setupInfiniteMobileTrack(amenitiesTrack, state.amenities.length, {
        sectionId: 'facilities'
      });
    }

    const plansTrack = document.getElementById('plans-container');
    if (plansTrack && state.plans.length) {
      setupInfiniteMobileTrack(plansTrack, state.plans.length, {
        sectionId: 'memberships'
      });
    }

    // Desktop Carousel Controls & State Updating
    const wrappers = document.querySelectorAll('.carousel-wrapper');
    wrappers.forEach(wrapper => {
      const track = wrapper.querySelector('.carousel-track');
      const prevBtn = wrapper.querySelector('.carousel-nav-btn.prev');
      const nextBtn = wrapper.querySelector('.carousel-nav-btn.next');
      if (!track) return;

      function updateBtnState() {
        if (window.innerWidth <= 768) return;
        const scrollLeft = Math.ceil(track.scrollLeft);
        const maxScroll = track.scrollWidth - track.clientWidth;
        const isScrollable = maxScroll > 8;

        // Auto-center cards when they fit comfortably without scroll
        if (!isScrollable) {
          track.style.justifyContent = 'center';
          if (prevBtn) prevBtn.style.display = 'none';
          if (nextBtn) nextBtn.style.display = 'none';
          return;
        }

        track.style.justifyContent = 'flex-start';
        if (prevBtn) prevBtn.style.display = 'flex';
        if (nextBtn) nextBtn.style.display = 'flex';

        // Prev button active state (completely hide if at start)
        if (prevBtn) {
          const isAtStart = scrollLeft <= 6;
          prevBtn.disabled = isAtStart;
          if (isAtStart) {
            prevBtn.style.display = 'none';
            prevBtn.classList.add('is-hidden');
          } else {
            prevBtn.style.display = 'flex';
            prevBtn.classList.remove('is-hidden');
          }
        }

        // Next button active state (completely hide if at end)
        if (nextBtn) {
          const isAtEnd = scrollLeft >= maxScroll - 6;
          nextBtn.disabled = isAtEnd;
          if (isAtEnd) {
            nextBtn.style.display = 'none';
            nextBtn.classList.add('is-hidden');
          } else {
            nextBtn.style.display = 'flex';
            nextBtn.classList.remove('is-hidden');
          }
        }
      }

      function getScrollStep() {
        const firstCard = track.querySelector(':scope > *:not(.carousel-clone)');
        if (firstCard) {
          return firstCard.offsetWidth + 24;
        }
        return 340;
      }

      if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
          e.preventDefault();
          const step = getScrollStep();
          track.scrollBy({ left: -step, behavior: 'smooth' });
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
          e.preventDefault();
          const step = getScrollStep();
          track.scrollBy({ left: step, behavior: 'smooth' });
        });
      }

      track.addEventListener('scroll', updateBtnState, { passive: true });
      window.addEventListener('resize', updateBtnState, { passive: true });

      // Multi-stage trigger after cards render from JSON
      setTimeout(updateBtnState, 50);
      setTimeout(updateBtnState, 300);
      setTimeout(updateBtnState, 800);
      setTimeout(updateBtnState, 1500);
    });
  }

  // 17. Floating Feedback / Google Review Tab (Visible after scrolling past hero)
  function initFloatingFeedbackTab() {
    const tab = document.getElementById('floating-feedback-tab');
    const heroSection = document.getElementById('hero');
    if (!tab) return;

    if (heroSection && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) {
            tab.classList.add('is-visible');
          } else {
            tab.classList.remove('is-visible');
          }
        });
      }, { threshold: 0.15 });
      observer.observe(heroSection);
    } else {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 350) {
          tab.classList.add('is-visible');
        } else {
          tab.classList.remove('is-visible');
        }
      }, { passive: true });
    }
  }

  // 18. Dynamic Motivational Gym Quotes (Random Pick & Smooth Cross-Fade Rotation)
  function initFooterQuotes() {
    const wrap = document.getElementById('footer-quote-wrap');
    const textEl = document.getElementById('footer-quote-text');
    const authorEl = document.getElementById('footer-quote-author');
    if (!wrap || !textEl) return;

    const quotes = (state.quotes && state.quotes.length) ? state.quotes : [
      { quote: "The body achieves what the mind believes.", author: "Napoleon Hill" },
      { quote: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
      { quote: "We don't stop when we're tired, we stop when we're done.", author: "David Goggins" },
      { quote: "Small daily improvements over time lead to stunning long-term results.", author: "Robin Sharma" },
      { quote: "Strength does not come from physical capacity. It comes from an indomitable will.", author: "Mahatma Gandhi" },
      { quote: "Your only real limit is the one you set in your mind.", author: "Iron Spirit" },
      { quote: "Pain is temporary. Quitting lasts forever.", author: "Lance Armstrong" },
      { quote: "The only bad workout is the one that didn't happen.", author: "Fitness Proverb" },
      { quote: "Success starts with unwavering self-discipline.", author: "Dwayne Johnson" }
    ];

    let lastIndex = -1;

    function getRandomIndex() {
      if (quotes.length <= 1) return 0;
      let newIdx;
      do {
        newIdx = Math.floor(Math.random() * quotes.length);
      } while (newIdx === lastIndex);
      lastIndex = newIdx;
      return newIdx;
    }

    function displayQuote(index, isInitial = false) {
      const item = quotes[index];
      if (!item) return;

      if (isInitial) {
        textEl.textContent = `“${item.quote}”`;
        if (authorEl) {
          authorEl.textContent = item.author ? `— ${item.author}` : '';
        }
        wrap.style.opacity = '1';
        return;
      }

      // Smooth Crossfade Transition
      wrap.style.opacity = '0';
      wrap.style.transform = 'translateY(3px)';

      setTimeout(() => {
        textEl.textContent = `“${item.quote}”`;
        if (authorEl) {
          authorEl.textContent = item.author ? `— ${item.author}` : '';
        }
        wrap.style.opacity = '1';
        wrap.style.transform = 'translateY(0)';
      }, 400);
    }

    // Pick a random quote immediately on start
    const initialIdx = getRandomIndex();
    displayQuote(initialIdx, true);

    // Auto-rotate smoothly every 30 seconds
    setInterval(() => {
      displayQuote(getRandomIndex());
    }, 30000);
  }

  // Master Boot
  initApp();
});


