

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
      descEl.textContent = description;
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
              <video class="hero-bg-media hero-bg-video" loop muted playsinline preload="auto">
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

  // 1. Hero Media Slider Controller (Supports HD Images & Videos, Next/Prev Controls)
  function initHeroMediaSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    const heroSection = document.getElementById('hero');
    const dots = document.querySelectorAll('.hero-dot');
    const prevBtn = document.getElementById('hero-prev-btn');
    const nextBtn = document.getElementById('hero-next-btn');
    if (!slides.length) return;

    let currentIndex = 0;
    let slideTimer = null;

    function showSlide(index) {
      // Pause video on previous slide if any
      const currentSlide = slides[currentIndex];
      const currentVideo = currentSlide ? currentSlide.querySelector('video') : null;
      if (currentVideo) {
        try {
          currentVideo.pause();
        } catch (e) {}
      }

      slides.forEach(s => s.classList.remove('active'));

      currentIndex = (index + slides.length) % slides.length;
      const nextSlide = slides[currentIndex];
      nextSlide.classList.add('active');

      // Update interactive dots
      dots.forEach((dot, dIdx) => {
        dot.classList.toggle('active', dIdx === currentIndex);
      });

      // Play video on next slide if any
      const nextVideo = nextSlide.querySelector('video');
      if (nextVideo) {
        nextVideo.currentTime = 0;
        nextVideo.play().catch(() => {});
      }
    }

    function nextSlide() {
      showSlide(currentIndex + 1);
      resetAutoSlide();
    }

    function prevSlide() {
      showSlide(currentIndex - 1);
      resetAutoSlide();
    }

    function resetAutoSlide() {
      if (slideTimer) clearInterval(slideTimer);
      slideTimer = setInterval(nextSlide, 30000);
    }

    // Dot click listeners
    dots.forEach((dot) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const idx = parseInt(dot.dataset.index, 10);
        if (!isNaN(idx)) {
          showSlide(idx);
          resetAutoSlide();
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
        if (slideTimer) clearInterval(slideTimer);
      });
      heroSection.addEventListener('mouseleave', () => {
        resetAutoSlide();
      });

      // Touch swipe support on mobile
      let touchStartX = 0;
      let touchEndX = 0;

      heroSection.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        if (slideTimer) clearInterval(slideTimer);
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
          resetAutoSlide();
        }
      }, { passive: true });
    }

    resetAutoSlide();
  }

  // Helper: Fetch JSON with graceful fallback
  async function loadJSON(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (err) {
      console.warn(`Could not load ${url}:`, err);
      return null;
    }
  }

  // Master Initializer
  async function initApp() {
    initHeroAnimations();

    // Parallel fetch with a graceful cross-fade delay so the user experiences the real skeleton shimmer
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
      gallery
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
      new Promise(resolve => setTimeout(resolve, 450)) // Smooth cross-fade interval
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

  // 3. GSAP ScrollTrigger Orchestration (Snappy 60fps, re-triggers on scroll up/down)
  function initScrollAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    // Refresh ScrollTrigger state after dynamic content injection
    ScrollTrigger.refresh();

    // Section Headers
    const headers = document.querySelectorAll('.section-header');
    if (headers.length) {
      headers.forEach(header => {
        gsap.fromTo(header,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            ease: 'power2.out',
            force3D: true,
            scrollTrigger: {
              trigger: header,
              start: 'top 88%',
              toggleActions: 'play reverse play reverse'
            }
          }
        );
      });
    }

    // Staggered Container Helper
    function animateGrid(containerId, itemSelector, startOffset = 'top 85%') {
      const container = document.getElementById(containerId);
      if (!container) return;
      const items = container.querySelectorAll(itemSelector);
      if (!items.length) return;

      gsap.fromTo(items,
        { opacity: 0, y: 36, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.75,
          stagger: 0.08,
          ease: 'power2.out',
          force3D: true,
          scrollTrigger: {
            trigger: container,
            start: startOffset,
            toggleActions: 'play reverse play reverse'
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
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: 'power2.out',
          force3D: true,
          scrollTrigger: {
            trigger: magStage,
            start: 'top 85%',
            toggleActions: 'play reverse play reverse'
          }
        }
      );
    }

    // Why Choose Us Section Animation
    const whyUsGrid = document.querySelector('.why-us-grid');
    if (whyUsGrid) {
      if (document.querySelector('.why-us-content')) {
        gsap.fromTo('.why-us-content',
          { opacity: 0, x: -25 },
          {
            opacity: 1,
            x: 0,
            duration: 0.75,
            ease: 'power2.out',
            force3D: true,
            scrollTrigger: {
              trigger: whyUsGrid,
              start: 'top 85%',
              toggleActions: 'play reverse play reverse'
            }
          }
        );
      }
      if (document.querySelectorAll('.why-gallery-card').length) {
        gsap.fromTo('.why-gallery-card',
          { opacity: 0, scale: 0.95, y: 20 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.75,
            stagger: 0.08,
            ease: 'power2.out',
            force3D: true,
            scrollTrigger: {
              trigger: whyUsGrid,
              start: 'top 85%',
              toggleActions: 'play reverse play reverse'
            }
          }
        );
      }
      if (document.querySelector('.why-center-badge')) {
        gsap.fromTo('.why-center-badge',
          { opacity: 0, scale: 0.7, rotate: -15 },
          {
            opacity: 1,
            scale: 1,
            rotate: 0,
            duration: 0.8,
            delay: 0.15,
            ease: 'back.out(1.5)',
            force3D: true,
            scrollTrigger: {
              trigger: whyUsGrid,
              start: 'top 85%',
              toggleActions: 'play reverse play reverse'
            }
          }
        );
      }
    }

    const contactGrid = document.querySelector('.contact-grid');
    if (contactGrid) {
      gsap.fromTo(contactGrid,
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          force3D: true,
          scrollTrigger: {
            trigger: contactGrid,
            start: 'top 85%',
            toggleActions: 'play reverse play reverse'
          }
        }
      );
    }

    const testSlider = document.querySelector('.testimonial-slider');
    if (testSlider) {
      gsap.fromTo(testSlider,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          force3D: true,
          scrollTrigger: {
            trigger: testSlider,
            start: 'top 88%',
            toggleActions: 'play reverse play reverse'
          }
        }
      );
    }
  }

  // 4. Render Gym Global Info
  function renderGymInfo() {
    if (!state.gymInfo) return;
    const { contact, location, timings } = state.gymInfo;

    const waUrl = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(contact.whatsappMessage)}`;
    document.querySelectorAll('.btn-whatsapp, .whatsapp-link').forEach(el => {
      el.setAttribute('href', waUrl);
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer');
    });

    document.querySelectorAll('.call-link').forEach(el => {
      el.setAttribute('href', `tel:${contact.phone.replace(/\s+/g, '')}`);
    });

    const phoneDisplayEl = document.getElementById('contact-phone-display');
    if (phoneDisplayEl) phoneDisplayEl.textContent = contact.phoneDisplay;

    const addressDisplayEl = document.getElementById('contact-address-display');
    if (addressDisplayEl) addressDisplayEl.textContent = location.fullAddress;

    const timingsWeekdayEl = document.getElementById('timings-weekday-display');
    if (timingsWeekdayEl) timingsWeekdayEl.textContent = timings.weekdays.slots;

    const timingsSundayEl = document.getElementById('timings-sunday-display');
    if (timingsSundayEl) timingsSundayEl.textContent = timings.sunday.slots;

    if (state.gymInfo.socials?.instagram) {
      const heroInsta = document.getElementById('hero-instagram-link');
      if (heroInsta) heroInsta.setAttribute('href', state.gymInfo.socials.instagram);
      const footerInsta = document.getElementById('footer-instagram-link');
      if (footerInsta) footerInsta.setAttribute('href', state.gymInfo.socials.instagram);
    }
  }

  // 5. Render Offers (Continuous Marquee Announcement Bar & Launch Offer Popup)
  function renderOffers() {
    const topBar = document.getElementById('top-announcement-bar');
    if (!state.offers || !state.offers.isActive) {
      if (topBar) topBar.style.display = 'none';
      return;
    }

    const { bannerText, popup } = state.offers;

    const marqueeTrack = document.getElementById('announcement-marquee-track');
    if (topBar && marqueeTrack && bannerText) {
      const singleItem = `
        <div class="announcement-marquee-item">
          <span class="announcement-badge">LIMITED OFFER</span>
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
    }

    const offerModal = document.getElementById('offer-modal');
    if (offerModal && popup) {
      const imgEl = document.getElementById('offer-popup-img');
      const sourceDesktop = document.getElementById('offer-popup-source-desktop');
      const linkEl = document.getElementById('offer-popup-link');

      const desktopImg = popup.imageDesktop || popup.desktopImage || popup.image || 'bannerPc.png';
      const mobileImg = popup.imageMobile || popup.mobileImage || popup.image || 'banner.png';

      if (sourceDesktop) {
        sourceDesktop.srcset = desktopImg;
      }
      if (imgEl) {
        imgEl.src = mobileImg;
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
  // UNIVERSAL SEAMLESS INFINITE MOBILE CAROUSEL ENGINE
  // =========================================================================
  function setupInfiniteMobileTrack(track, totalCount, options = {}) {
    if (!track || totalCount <= 0) return null;

    let isUserTouching = false;
    let autoScrollInterval = null;
    let isBoundaryAdjusting = false;
    let isSectionInView = true;
    let isSwiping = false;
    let touchStartX = 0;
    let touchStartY = 0;
    let scrollTimeout = null;

    const {
      onActiveChange,
      autoScroll = true,
      autoScrollDelay = 3500,
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
          track.style.scrollBehavior = 'smooth';
          if (onActiveChange) {
            onActiveChange(0);
          }
        }
      }
    }

    function checkBoundaryLoop() {
      if (window.innerWidth > 768 || isBoundaryAdjusting) return;
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
          track.style.scrollBehavior = 'smooth';
        }
        setTimeout(() => { isBoundaryAdjusting = false; }, 60);
      }
      // If user scrolled into set 3 (right copy)
      else if (closest >= totalCount * 2) {
        isBoundaryAdjusting = true;
        const targetCard = cards[closest - totalCount];
        if (targetCard) {
          const target = getCenterScroll(targetCard);
          track.style.scrollBehavior = 'auto';
          track.scrollLeft = target;
          track.style.scrollBehavior = 'smooth';
        }
        setTimeout(() => { isBoundaryAdjusting = false; }, 60);
      }
    }

    function stepForward() {
      if (window.innerWidth > 768 || isUserTouching || !isSectionInView || isBoundaryAdjusting) return;
      const cards = track.children;
      if (!cards.length) return;
      const current = getClosestIndex();
      const nextCard = cards[current + 1];
      if (nextCard) {
        track.scrollTo({ left: getCenterScroll(nextCard), behavior: 'smooth' });
      }
    }

    function startAutoScroll() {
      stopAutoScroll();
      if (!autoScroll || window.innerWidth > 768 || isUserTouching || !isSectionInView) return;
      autoScrollInterval = setInterval(stepForward, autoScrollDelay);
    }

    function stopAutoScroll() {
      if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
      }
    }

    function resetAutoScroll() {
      stopAutoScroll();
      if (!isUserTouching && isSectionInView) {
        startAutoScroll();
      }
    }

    track.addEventListener('touchstart', (e) => {
      isUserTouching = true;
      isSwiping = false;
      stopAutoScroll();
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
      }, 60);
      setTimeout(resetAutoScroll, 2000);
    }, { passive: true });

    track.addEventListener('scroll', () => {
      const closest = getClosestIndex();
      const realIdx = ((closest % totalCount) + totalCount) % totalCount;
      if (onActiveChange) {
        onActiveChange(realIdx);
      }
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(checkBoundaryLoop, 140);
      resetAutoScroll();
    }, { passive: true });

    track.addEventListener('mouseenter', () => {
      isUserTouching = true;
      stopAutoScroll();
    });

    track.addEventListener('mouseleave', () => {
      isUserTouching = false;
      resetAutoScroll();
    });

    if (sectionId) {
      const sec = document.getElementById(sectionId);
      if (sec && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            isSectionInView = entry.isIntersecting;
            if (isSectionInView) {
              resetAutoScroll();
            } else {
              stopAutoScroll();
            }
          });
        }, { threshold: 0.15 });
        observer.observe(sec);
      }
    }

    setTimeout(initPosition, 100);
    setTimeout(initPosition, 400);

    window.addEventListener('resize', () => {
      if (window.innerWidth <= 768) {
        setTimeout(initPosition, 100);
      }
    }, { passive: true });

    return {
      initPosition,
      stepForward,
      isSwiping: () => isSwiping,
      stopAutoScroll,
      startAutoScroll
    };
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
          <ul class="amenity-highlights">
            ${zone.highlights.map(h => `<li>${h}</li>`).join('')}
          </ul>
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

    function buildRightPageHTML(t, idx, total, isInteractive = true) {
      if (!t) return '';
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
        autoScroll: true,
        autoScrollDelay: 3500,
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
        autoScroll: true,
        autoScrollDelay: 4200,
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
      items = items.slice(0, 6);
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

    // Mobile Auto-Scroll Mechanism
    function stepMobileAutoScroll() {
      if (window.innerWidth > 768 || isUserInteracting || currentPreviewItemsCount <= 1) return;
      const firstCard = previewGrid.querySelector('.gallery-card');
      if (!firstCard) return;

      const cardWidth = firstCard.offsetWidth + 14;
      const maxScroll = previewGrid.scrollWidth - previewGrid.clientWidth;

      if (previewGrid.scrollLeft >= maxScroll - 10) {
        // Loop back to start smoothly
        previewGrid.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        previewGrid.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }
    }

    function startMobileAutoScroll() {
      stopMobileAutoScroll();
      if (window.innerWidth <= 768) {
        mobileAutoScrollTimer = setInterval(stepMobileAutoScroll, 3500);
      }
    }

    function stopMobileAutoScroll() {
      if (mobileAutoScrollTimer) {
        clearInterval(mobileAutoScrollTimer);
        mobileAutoScrollTimer = null;
      }
    }

    function resetMobileAutoScroll() {
      stopMobileAutoScroll();
      startMobileAutoScroll();
    }

    // User touch / interaction handlers (pauses on swipe, resumes after idle)
    previewGrid.addEventListener('touchstart', () => {
      isUserInteracting = true;
      stopMobileAutoScroll();
      if (resumeTimeout) clearTimeout(resumeTimeout);
    }, { passive: true });

    previewGrid.addEventListener('touchend', () => {
      if (resumeTimeout) clearTimeout(resumeTimeout);
      resumeTimeout = setTimeout(() => {
        isUserInteracting = false;
        startMobileAutoScroll();
      }, 4000);
    }, { passive: true });

    // IntersectionObserver to only auto-scroll when section is in viewport
    if ('IntersectionObserver' in window) {
      const gallerySection = document.getElementById('gallery');
      if (gallerySection) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              startMobileAutoScroll();
            } else {
              stopMobileAutoScroll();
            }
          });
        }, { threshold: 0.2 });
        observer.observe(gallerySection);
      }
    } else {
      startMobileAutoScroll();
    }

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        stopMobileAutoScroll();
      } else {
        startMobileAutoScroll();
      }
    }, { passive: true });

    populateFilterCounts();
    renderPreviewItems();
    startMobileAutoScroll();
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

  // 14c. App-Like Mobile Bottom Navigation (ScrollSpy & Interactive Tabs)
  function initMobileBottomNav() {
    const bottomNav = document.getElementById('mobile-bottom-nav');
    if (!bottomNav) return;

    const navItems = bottomNav.querySelectorAll('.bottom-nav-item');

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
        }
      });
    });

    // ScrollSpy to highlight active tab based on viewport scroll
    const sections = [
      { id: 'hero', target: document.getElementById('hero') },
      { id: 'why-us', target: document.getElementById('why-us') },
      { id: 'facilities', target: document.getElementById('facilities') },
      { id: 'memberships', target: document.getElementById('memberships') },
      { id: 'coaches', target: document.getElementById('coaches') },
      { id: 'gallery', target: document.getElementById('gallery') },
      { id: 'testimonials', target: document.getElementById('testimonials') },
      { id: 'contact', target: document.getElementById('contact') }
    ];

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollPos = window.scrollY + 220;
          let currentSection = 'hero';

          sections.forEach(({ id, target }) => {
            if (target) {
              const top = target.offsetTop;
              const height = target.offsetHeight;
              if (scrollPos >= top && scrollPos < top + height) {
                currentSection = id;
              }
            }
          });

          navItems.forEach(item => {
            if (item.dataset.section) {
              if (item.dataset.section === currentSection) {
                if (!item.classList.contains('active')) {
                  item.classList.add('active');
                }
              } else {
                item.classList.remove('active');
              }
            }
          });
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
        sectionId: 'amenities',
        autoScroll: true,
        autoScrollDelay: 3800
      });
    }

    const plansTrack = document.getElementById('plans-container');
    if (plansTrack && state.plans.length) {
      setupInfiniteMobileTrack(plansTrack, state.plans.length, {
        sectionId: 'membership',
        autoScroll: true,
        autoScrollDelay: 4200
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

  // Master Boot
  initApp();
});


