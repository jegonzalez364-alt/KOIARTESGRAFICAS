/* ============================================
   KOI DESIGN — Script
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Mobile Nav Toggle ---- */
  const hamburger = document.getElementById('hamburgerBtn');
  const mobileNav = document.getElementById('mobileNav');
  const closeNav = document.getElementById('closeNav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => mobileNav.classList.add('active'));
    closeNav.addEventListener('click', () => mobileNav.classList.remove('active'));
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => mobileNav.classList.remove('active'));
    });
  }

  /* ---- Scroll-triggered fade-in (Intersection Observer) ---- */
  const faders = document.querySelectorAll('.fade-in');
  const observerOpts = { threshold: 0.15, rootMargin: '0px 0px -40px 0px' };

  const fadeObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOpts);

  faders.forEach(el => fadeObserver.observe(el));

  /* ---- Smooth scroll for nav links ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const headerH = document.getElementById('header').offsetHeight;
        const top = target.getBoundingClientRect().top + window.scrollY - headerH;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ---- Active nav highlight on scroll ---- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a, .mobile-nav-overlay a');

  function highlightNav() {
    const scrollY = window.scrollY + 120;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id || (id === 'inicio' && link.getAttribute('href') === '#')) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', highlightNav);

  /* ---- Header shrink on scroll ---- */
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      header.style.boxShadow = '0 4px 20px rgba(233,30,158,0.3)';
    } else {
      header.style.boxShadow = 'none';
    }
  });

  /* ---- Comic-style hover tilt on cards ---- */
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const midX = rect.width / 2;
      const midY = rect.height / 2;
      const rotateY = ((x - midX) / midX) * 4;
      const rotateX = ((midY - y) / midY) * 4;
      card.style.transform = `translateY(-6px) perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* ---- Hero Gallery Carousel ---- */
  const galleryTrack = document.getElementById('galleryTrack');
  const galleryPrev = document.getElementById('galleryPrev');
  const galleryNext = document.getElementById('galleryNext');
  const galleryDotsContainer = document.getElementById('galleryDots');

  if (galleryTrack) {
    const slides = galleryTrack.querySelectorAll('.gallery-slide');
    let currentSlide = 0;
    let autoPlayInterval;

    // Create dots
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.classList.add('gallery-dot');
      if (i === 0) dot.classList.add('active');
      dot.setAttribute('aria-label', `Imagen ${i + 1}`);
      dot.addEventListener('click', () => goToSlide(i));
      galleryDotsContainer.appendChild(dot);
    });

    const dots = galleryDotsContainer.querySelectorAll('.gallery-dot');

    function goToSlide(index) {
      // Pause video on current slide
      const currentVideo = slides[currentSlide].querySelector('video');
      if (currentVideo) { currentVideo.pause(); }

      slides[currentSlide].classList.remove('active');
      dots[currentSlide].classList.remove('active');

      currentSlide = (index + slides.length) % slides.length;

      slides[currentSlide].classList.add('active');
      dots[currentSlide].classList.add('active');

      // Play video on new slide if it has a valid src
      const newVideo = slides[currentSlide].querySelector('video source');
      if (newVideo && newVideo.src && newVideo.src !== window.location.href) {
        const vid = slides[currentSlide].querySelector('video');
        const placeholder = slides[currentSlide].querySelector('.video-placeholder');
        vid.play().then(() => {
          if (placeholder) placeholder.style.display = 'none';
        }).catch(() => {});
      }
    }

    if (galleryPrev) {
      galleryPrev.addEventListener('click', () => goToSlide(currentSlide - 1));
    }
    if (galleryNext) {
      galleryNext.addEventListener('click', () => goToSlide(currentSlide + 1));
    }

    // Auto-advance every 5 seconds
    function startAutoPlay() {
      autoPlayInterval = setInterval(() => goToSlide(currentSlide + 1), 5000);
    }

    function stopAutoPlay() {
      clearInterval(autoPlayInterval);
    }

    startAutoPlay();

    // Pause auto-advance on hover
    const heroGallery = document.querySelector('.hero-gallery');
    if (heroGallery) {
      heroGallery.addEventListener('mouseenter', stopAutoPlay);
      heroGallery.addEventListener('mouseleave', startAutoPlay);
    }
  }

});
