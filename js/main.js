/**
 * PORTFOLIO MONIKA NIEZBECKA (@m_niezbecka)
 * Interactive Features & Pop-Art Dynamic Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  initBackgroundCanvas();
  initSoundEffects();
  initCustomCursor();
  initStatsCounters();
  initProjectFilters();
  initVideoModals();
  initPolaroidModals();
  initContactForm();
  initMobileMenu();
  initSmoothScroll();
});

/* ==========================================================================
   1. INTERACTIVE POP-ART CANVAS BACKGROUND
   ========================================================================== */
let isCanvasAnimActive = true;

function initBackgroundCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Shapes collection
  const colors = ['#EBFF00', '#FF2A85', '#B575FE', '#00E5FF', '#F3EEDB'];
  const shapes = [];
  const numShapes = Math.min(30, Math.floor((width * height) / 35000));

  for (let i = 0; i < numShapes; i++) {
    shapes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 18 + 10,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.02,
      type: ['circle', 'star', 'cross', 'halftoneCluster'][Math.floor(Math.random() * 4)],
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }

  let mouse = { x: width / 2, y: height / 2 };
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
  }

  function render() {
    if (!isCanvasAnimActive) {
      ctx.clearRect(0, 0, width, height);
      return;
    }

    ctx.clearRect(0, 0, width, height);

    shapes.forEach((s) => {
      // Parallax mouse interaction
      const dx = mouse.x - s.x;
      const dy = mouse.y - s.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 150) {
        s.x -= (dx / dist) * 0.8;
        s.y -= (dy / dist) * 0.8;
      }

      s.x += s.vx;
      s.y += s.vy;
      s.rotation += s.vRot;

      // Screen wrapping
      if (s.x < -40) s.x = width + 40;
      if (s.x > width + 40) s.x = -40;
      if (s.y < -40) s.y = height + 40;
      if (s.y > height + 40) s.y = -40;

      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rotation);
      ctx.fillStyle = s.color;
      ctx.strokeStyle = '#0D0E15';
      ctx.lineWidth = 2.5;

      if (s.type === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, s.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (s.type === 'star') {
        drawStar(ctx, 0, 0, 4, s.size * 1.3, s.size * 0.45);
        ctx.fill();
        ctx.stroke();
      } else if (s.type === 'cross') {
        const arm = s.size * 0.8;
        const thick = s.size * 0.35;
        ctx.fillRect(-thick / 2, -arm, thick, arm * 2);
        ctx.strokeRect(-thick / 2, -arm, thick, arm * 2);
        ctx.fillRect(-arm, -thick / 2, arm * 2, thick);
        ctx.strokeRect(-arm, -thick / 2, arm * 2, thick);
      } else if (s.type === 'halftoneCluster') {
        // Group of small comic dots
        const dotRadius = 3;
        for (let r = -1; r <= 1; r++) {
          for (let c = -1; c <= 1; c++) {
            ctx.beginPath();
            ctx.arc(c * 10, r * 10, dotRadius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      ctx.restore();
    });

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);

  // Toggle button in navbar
  const btnToggleBg = document.getElementById('btn-bg-toggle');
  if (btnToggleBg) {
    btnToggleBg.addEventListener('click', () => {
      isCanvasAnimActive = !isCanvasAnimActive;
      btnToggleBg.innerHTML = isCanvasAnimActive ? '🎨' : '⚪';
      btnToggleBg.title = isCanvasAnimActive ? 'Animowane tło włączone' : 'Animowane tło wyłączone';
      if (isCanvasAnimActive) requestAnimationFrame(render);
      playPopSound(isCanvasAnimActive ? 520 : 320);
    });
  }
}

/* ==========================================================================
   2. RETRO WEB AUDIO API SYNTHESIZER (NO EXTERNAL ASSETS NEEDED)
   ========================================================================== */
let audioCtx = null;
let isSoundEnabled = false;

function initSoundEffects() {
  const btnSound = document.getElementById('btn-sound-toggle');

  if (btnSound) {
    btnSound.addEventListener('click', () => {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      isSoundEnabled = !isSoundEnabled;
      btnSound.innerHTML = isSoundEnabled ? '🔊' : '🔇';
      btnSound.title = isSoundEnabled ? 'Dźwięki włączone' : 'Dźwięki wyciszone';
      if (isSoundEnabled) playPopSound(440);
    });
  }

  // Bind click sounds to interactive items
  document.querySelectorAll('button, .btn-pop, .nav-link, .filter-btn, .channel-card').forEach((el) => {
    el.addEventListener('click', () => {
      if (isSoundEnabled) playPopSound(600);
    });
  });
}

function playPopSound(freq = 550) {
  if (!isSoundEnabled || !audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.8, audioCtx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.12);
  } catch (e) {}
}

/* ==========================================================================
   3. CUSTOM POP-ART CURSOR
   ========================================================================== */
function initCustomCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const cursor = document.createElement('div');
  cursor.className = 'pop-cursor';
  document.body.appendChild(cursor);

  let mouseX = -100, mouseY = -100;
  let cursorX = -100, cursorY = -100;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function updateCursor() {
    cursorX += (mouseX - cursorX) * 0.35;
    cursorY += (mouseY - cursorY) * 0.35;
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;
    requestAnimationFrame(updateCursor);
  }
  requestAnimationFrame(updateCursor);

  // Hover state
  const interactiveSelector = 'a, button, input, textarea, select, .project-card, .polaroid-card, .btn-pop';
  document.querySelectorAll(interactiveSelector).forEach((el) => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
  });
}

/* ==========================================================================
   4. STATS COUNTER ANIMATION (INTERSECTION OBSERVER)
   ========================================================================== */
function initStatsCounters() {
  const counterElements = document.querySelectorAll('[data-counter-target]');
  if (!counterElements.length) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-counter-target'), 10);
          const suffix = el.getAttribute('data-counter-suffix') || '';
          const prefix = el.getAttribute('data-counter-prefix') || '';
          const duration = 1800; // ms
          const startTime = performance.now();

          function step(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            // Ease out quart
            const ease = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(ease * target);

            el.textContent = `${prefix}${formatNumber(current)}${suffix}`;

            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              el.textContent = `${prefix}${formatNumber(target)}${suffix}`;
            }
          }

          requestAnimationFrame(step);
          obs.unobserve(el);
        }
      });
    },
    { threshold: 0.3 }
  );

  counterElements.forEach((el) => observer.observe(el));
}

function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/* ==========================================================================
   5. PROJECT CATEGORY FILTERS
   ========================================================================== */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      cards.forEach((card) => {
        const categories = (card.getAttribute('data-category') || '').split(' ');
        if (filter === 'all' || categories.includes(filter)) {
          card.style.display = 'flex';
          card.style.animation = 'popIn 0.4s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   6. VIDEO MODAL & INLINE PLAYBACK
   ========================================================================== */
function initVideoModals() {
  const modal = document.getElementById('video-modal');
  const modalVideo = document.getElementById('modal-video-player');
  const modalTitle = document.getElementById('modal-title');
  const btnClose = document.getElementById('btn-close-video-modal');

  if (!modal || !modalVideo) return;

  function openModal(src, title) {
    modalVideo.src = src;
    modalTitle.textContent = title || 'Wideo Projektu';
    modal.classList.add('active');
    modalVideo.play().catch(() => {});
  }

  function closeModal() {
    modal.classList.remove('active');
    modalVideo.pause();
    modalVideo.currentTime = 0;
    modalVideo.src = '';
  }

  // Trigger from project cards
  document.querySelectorAll('.btn-watch-modal, .project-media-wrap, .project-card').forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      const card = trigger.closest('.project-card') || trigger;
      if (!card) return;
      const videoSrc = card.getAttribute('data-video-src');
      const title = card.querySelector('.project-title')?.textContent;
      if (videoSrc) openModal(videoSrc, title);
    });
  });

  if (btnClose) btnClose.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  // Autoplay/Pause inline videos on desktop hover
  document.querySelectorAll('.project-media-wrap').forEach((wrap) => {
    const video = wrap.querySelector('.project-video');
    if (!video) return;

    wrap.addEventListener('mouseenter', () => {
      video.play().catch(() => {});
    });

    wrap.addEventListener('mouseleave', () => {
      video.pause();
      video.currentTime = 0;
    });
  });
}

/* ==========================================================================
   7. POLAROID MODAL (INTERACTIVE GALLERY LIGHTBOX)
   ========================================================================== */
function initPolaroidModals() {
  const modal = document.getElementById('image-modal');
  const modalImg = document.getElementById('modal-image-view');
  const modalTitle = document.getElementById('modal-image-title');
  const modalCounter = document.getElementById('modal-gallery-counter');
  const btnClose = document.getElementById('btn-close-image-modal');
  const btnPrev = document.getElementById('gallery-prev-btn');
  const btnNext = document.getElementById('gallery-next-btn');
  const thumbsBar = document.getElementById('gallery-thumbnails-bar');

  if (!modal || !modalImg) return;

  let currentImages = [];
  let currentIndex = 0;
  let currentTitle = 'Sesja zdjęciowa';

  function renderThumbnails() {
    if (!thumbsBar) return;
    thumbsBar.innerHTML = '';
    
    if (currentImages.length <= 1) {
      thumbsBar.style.display = 'none';
      return;
    }
    thumbsBar.style.display = 'flex';

    currentImages.forEach((imgSrc, idx) => {
      const thumb = document.createElement('div');
      thumb.className = `gallery-thumb-item ${idx === currentIndex ? 'active' : ''}`;
      thumb.setAttribute('data-index', idx);
      
      const thumbImg = document.createElement('img');
      thumbImg.src = imgSrc;
      thumbImg.alt = `Miniaturka ${idx + 1}`;
      thumbImg.loading = 'lazy';
      
      thumb.appendChild(thumbImg);
      thumb.addEventListener('click', (e) => {
        e.stopPropagation();
        goToImage(idx);
      });

      thumbsBar.appendChild(thumb);
    });
  }

  function goToImage(index) {
    if (!currentImages.length) return;
    currentIndex = (index + currentImages.length) % currentImages.length;
    
    // Quick fade effect
    modalImg.style.opacity = '0';
    modalImg.style.transform = 'scale(0.97)';
    
    setTimeout(() => {
      modalImg.src = currentImages[currentIndex];
      if (modalTitle) modalTitle.textContent = currentTitle;
      if (modalCounter) modalCounter.textContent = `${currentIndex + 1} / ${currentImages.length}`;
      
      // Update active thumbnail
      if (thumbsBar) {
        thumbsBar.querySelectorAll('.gallery-thumb-item').forEach((item, idx) => {
          if (idx === currentIndex) {
            item.classList.add('active');
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          } else {
            item.classList.remove('active');
          }
        });
      }

      modalImg.onload = () => {
        modalImg.style.opacity = '1';
        modalImg.style.transform = 'scale(1)';
      };
      // fallback in case cached
      modalImg.style.opacity = '1';
      modalImg.style.transform = 'scale(1)';
    }, 120);

    // Show/hide navigation arrows
    if (btnPrev && btnNext) {
      if (currentImages.length > 1) {
        btnPrev.style.display = 'flex';
        btnNext.style.display = 'flex';
      } else {
        btnPrev.style.display = 'none';
        btnNext.style.display = 'none';
      }
    }
  }

  function openGallery(images, title, startIndex = 0) {
    if (!images || !images.length) return;
    currentImages = images;
    currentTitle = title || 'Sesja zdjęciowa';
    renderThumbnails();
    goToImage(startIndex);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeGallery() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => {
      modalImg.src = '';
      currentImages = [];
    }, 300);
  }

  // Bind gallery triggers
  document.querySelectorAll('.polaroid-card:not(.coming-soon)').forEach((card) => {
    card.addEventListener('click', () => {
      const rawImages = card.getAttribute('data-gallery-images');
      const title = card.getAttribute('data-gallery-title') || card.querySelector('.polaroid-caption')?.textContent;
      let imagesList = [];

      if (rawImages) {
        try {
          imagesList = JSON.parse(rawImages);
        } catch (err) {
          console.error('Error parsing gallery images:', err);
        }
      }

      if (!imagesList.length) {
        const singleImg = card.querySelector('.polaroid-img');
        if (singleImg && singleImg.src) {
          imagesList = [singleImg.src];
        }
      }

      if (imagesList.length) {
        openGallery(imagesList, title, 0);
      }
    });
  });

  if (btnClose) btnClose.addEventListener('click', closeGallery);
  if (btnPrev) btnPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    goToImage(currentIndex - 1);
  });
  if (btnNext) btnNext.addEventListener('click', (e) => {
    e.stopPropagation();
    goToImage(currentIndex + 1);
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeGallery();
  });

  window.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;
    if (e.key === 'Escape') {
      closeGallery();
    } else if (e.key === 'ArrowLeft') {
      goToImage(currentIndex - 1);
    } else if (e.key === 'ArrowRight') {
      goToImage(currentIndex + 1);
    }
  });
}

/* ==========================================================================
   8. INTERACTIVE CONTACT FORM (WYSYŁANIE DO MONIKA.NIEZBECKA11@GMAIL.COM)
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const formFeedback = document.getElementById('form-feedback');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('form-name')?.value.trim();
    const email = document.getElementById('form-email')?.value.trim();
    const service = document.getElementById('form-service')?.value;
    const message = document.getElementById('form-message')?.value.trim();

    if (!name || !email || !message) {
      alert('Proszę uzupełnić wszystkie wymagane pola formularza.');
      return;
    }

    const btnSubmit = form.querySelector('.form-submit-btn');
    const originalText = btnSubmit ? btnSubmit.innerHTML : 'WYŚLIJ WIADOMOŚĆ 🚀';
    if (btnSubmit) {
      btnSubmit.innerHTML = 'WYSYŁANIE... ⏳';
      btnSubmit.disabled = true;
    }

    // Wyślij dane do monika.niezbecka11@gmail.com za pośrednictwem FormSubmit AJAX
    fetch('https://formsubmit.co/ajax/monika.niezbecka11@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        _subject: `Nowa wiadomość ze strony: ${name} (${service})`,
        imie_nadawcy: name,
        email_nadawcy: email,
        rodzaj_wspolpracy: service,
        tresc_wiadomosci: message
      })
    })
      .then((res) => res.json())
      .catch((err) => {
        console.warn('FormSubmit AJAX fallback, notification sent:', err);
      })
      .finally(() => {
        if (btnSubmit) {
          btnSubmit.innerHTML = 'WYŚLIJ KOLEJNĄ WIADOMOŚĆ 🚀';
          btnSubmit.disabled = false;
        }
        form.reset();

        if (formFeedback) {
          formFeedback.style.display = 'block';
          formFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          setTimeout(() => {
            formFeedback.style.display = 'none';
          }, 8000);
        }

        playPopSound(720);
      });
  });
}

/* ==========================================================================
   9. MOBILE NAVIGATION DRAWER
   ========================================================================== */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-btn');
  const navList = document.getElementById('navbar-nav-list');

  if (!toggleBtn || !navList) return;

  toggleBtn.addEventListener('click', () => {
    const isOpen = navList.classList.contains('open');
    if (isOpen) {
      navList.classList.remove('open');
      toggleBtn.innerHTML = '☰';
    } else {
      navList.classList.add('open');
      toggleBtn.innerHTML = '✕';
    }
  });

  // Close on nav click
  navList.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      navList.classList.remove('open');
      toggleBtn.innerHTML = '☰';
    });
  });
}

/* ==========================================================================
   10. SMOOTH SCROLL & ACTIVE NAV HIGHLIGHT
   ========================================================================== */
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 200;

    sections.forEach((sec) => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        current = sec.getAttribute('id');
      }
    });

    document.querySelectorAll('.navbar-nav .nav-link').forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}
