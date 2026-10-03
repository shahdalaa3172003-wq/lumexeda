document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lenis for Smooth Scrolling
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

    const mainNav = document.querySelector('.main-nav');
  lenis.on('scroll', (e) => {
    let currentScroll = e.scroll;
    if (currentScroll <= 50) { 
      mainNav.classList.remove('nav-hidden'); 
    }
    else if (e.direction === 1) { 
      mainNav.classList.add('nav-hidden'); 
    }
    else if (e.direction === -1) { 
      mainNav.classList.remove('nav-hidden'); 
    }
  });

  // Sync GSAP ScrollTrigger with Lenis
  gsap.registerPlugin(ScrollTrigger);
  
  // Custom Cursor
    // Distribute Ambient Stickers across sections
  const sections = document.querySelectorAll('section');
  const stickerHTMLs = [
    `<svg class="ambient-icon float-1" style="top: 15%; left: 8%;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>`,
    `<svg class="ambient-icon float-2" style="top: 35%; right: 10%;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>`,
    `<svg class="ambient-icon float-3" style="top: 60%; left: 12%;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
    `<svg class="ambient-icon float-4" style="top: 80%; right: 15%;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`
  ];
  
  sections.forEach((section, i) => {
    // Only add to large sections
    if (section.classList.contains('marquee-section') || section.classList.contains('final-cta')) return;
    
    // Add position relative to section if not already
    const computed = window.getComputedStyle(section);
    if (computed.position === 'static') {
      section.style.position = 'relative';
    }
    
    const wrapper = document.createElement('div');
    wrapper.className = 'ambient-stickers';
    // Shuffle and pick 2 stickers per section
    const shuffled = stickerHTMLs.sort(() => 0.5 - Math.random());
    wrapper.innerHTML = shuffled[0] + shuffled[1];
    
    // Randomize their positions slightly differently per section
    const icons = wrapper.querySelectorAll('.ambient-icon');
    icons[0].style.top = (10 + Math.random() * 20) + '%';
    icons[0].style.left = (5 + Math.random() * 15) + '%';
    icons[1].style.top = (60 + Math.random() * 20) + '%';
    icons[1].style.right = (5 + Math.random() * 15) + '%';
    icons[1].style.left = 'auto';
    
    section.insertBefore(wrapper, section.firstChild);
  });

    const cursor = document.querySelector('.custom-cursor');
  const cursorText = document.querySelector('.cursor-text');
  
  if (cursor && window.innerWidth > 768) {
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    gsap.ticker.add(() => {
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      gsap.set(cursor, { x: cursorX, y: cursorY });
    });

    // Handle cursor states
    const interactiveElements = document.querySelectorAll('[data-cursor]');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('active');
        cursorText.textContent = el.getAttribute('data-cursor');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('active');
        cursorText.textContent = '';
      });
    });

    // Magnetic buttons
    const magneticBtns = document.querySelectorAll('[data-magnetic]');
    magneticBtns.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const h = rect.width / 2;
        const x = e.clientX - rect.left - h;
        const y = e.clientY - rect.top - rect.height / 2;
        
        gsap.to(btn, {
          x: x * 0.3,
          y: y * 0.3,
          duration: 0.4,
          ease: "power2.out"
        });
      });
      
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.7,
          ease: "elastic.out(1, 0.3)"
        });
      });
    });
  }

  // Hero Cinematic Animation
  const tlHero = gsap.timeline();
  
  tlHero.fromTo("#hero-img", 
    { scale: 1.2 },
    { scale: 1.05, duration: 2.5, ease: "power3.out" }
  )
  .fromTo(".hero-eyebrow",
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 1 },
    "-=1.5"
  )
  .fromTo(".title-inner",
    { y: "100%" },
    { y: "0%", duration: 1.2, stagger: 0.2, ease: "power4.out" },
    "-=1"
  )
  .fromTo(".hero-bottom",
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 1 },
    "-=0.5"
  );

  // Hero Parallax & Scroll Transform
  if (window.innerWidth > 768) {
    const heroSection = document.querySelector('.hero');
    const heroImg = document.querySelector('#hero-img');
    const heroContent = document.querySelector('.hero-content');

    // Mouse Parallax on Hero
    heroSection.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      
      gsap.to(heroImg, { x: x, y: y, duration: 1, ease: "power2.out" });
      gsap.to(heroContent, { x: -x * 0.5, y: -y * 0.5, duration: 1, ease: "power2.out" });
    });

    // Scroll Transform
    gsap.to(heroImg, {
      scale: 1.2,
      y: 100,
      opacity: 0.3,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });

    gsap.to(heroContent, {
      y: 150,
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });
  }

  // Showreel Reveal
  gsap.fromTo(".showreel-wrapper",
    { clipPath: "inset(20% 10% 20% 10%)", scale: 0.9 },
    { 
      clipPath: "inset(0% 0% 0% 0%)", 
      scale: 1,
      ease: "none",
      scrollTrigger: {
        trigger: ".showreel",
        start: "top 80%",
        end: "center center",
        scrub: true
      }
    }
  );

  // Horizontal Scroll (Selected Work)
  if (window.innerWidth > 768) {
    const horizontalSection = document.querySelector('.horizontal-scroll-wrapper');
    const horizontalContainer = document.querySelector('.horizontal-container');
    
    // Calculate how far to translate
    const scrollWidth = horizontalContainer.scrollWidth - window.innerWidth;
    
    gsap.to(horizontalContainer, {
      x: -scrollWidth,
      ease: "none",
      scrollTrigger: {
        trigger: horizontalSection,
        start: "center center",
        end: () => "+=" + scrollWidth,
        pin: true,
        scrub: 1
      }
    });
  }

  // Marquee
  const marquees = document.querySelectorAll('.marquee');
  marquees.forEach(marquee => {
    const inner = marquee.querySelector('.marquee-inner');
    const speed = parseFloat(marquee.getAttribute('data-speed')) || 1;
    
    gsap.to(inner, {
      xPercent: -50,
      ease: "none",
      duration: 20 / Math.abs(speed),
      repeat: -1
    });
  });

  // Studio Film Strip
  const filmStrip = document.querySelector('.film-strip');
  if (filmStrip) {
    gsap.to(filmStrip, {
      x: "-50%",
      ease: "none",
      scrollTrigger: {
        trigger: ".studio",
        start: "top bottom",
        end: "bottom top",
        scrub: 1
      }
    });
  }

  // Text Reveals
  const revealElements = document.querySelectorAll('[data-reveal]');
  revealElements.forEach(el => {
    gsap.from(el, {
      y: 50,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%"
      }
    });
  });
});




document.addEventListener("DOMContentLoaded", async () => {
  const showcaseGrid = document.getElementById("liveShowcaseGrid");
  if (!showcaseGrid) return;

  const reelIds = [
    "1p7hinhRi32lkLywwOIq_7SViyTMnj6Mj",
    "1Y0VMwQ5dRZpd60CN9WgrQGEk61La1BJC",
    "1Wn38jk8pbjtwhMVBq_fWugufoKQvo8Fl",
    "1sSLuiH9NgAz4PI5FRkDhAIvc7DPk36Fd",
    "1ke11SYjIhAxbLUsFfi7HZL8QW8HRJNkq"
  ];
  
  const reels = reelIds.map(id => {
    const el = document.createElement("div");
    el.className = "showcase-item";
    el.innerHTML = `<iframe src="https://drive.google.com/file/d/${id}/preview" allow="autoplay" loading="lazy"></iframe>`;
    return el;
  });

  const techCards = Array.from(document.querySelectorAll("#digital .tech-card")).map(card => {
    const clone = card.cloneNode(true);
    clone.classList.add("showcase-item");
    clone.style.background = "transparent";
    return clone;
  });

  let images = [];
  try {
    const res = await fetch("/api/showcase-images.json");
    if (res.ok) {
      const data = await res.json();
      images = data.images.map(img => {
        const el = document.createElement("div");
        el.className = "showcase-item";
        el.innerHTML = `<img src="${encodeURI(img)}" alt="Creative Work" loading="lazy">`;
        return el;
      });
    }
  } catch (e) {
    console.error("Failed to load showcase images", e);
  }

  const items = [];
  const maxLen = Math.max(images.length, reels.length, techCards.length);
  for (let i = 0; i < maxLen; i++) {
    if (images[i]) items.push(images[i]);
    if (reels.length > 0) items.push(reels[i % reels.length].cloneNode(true));
    if (techCards.length > 0) items.push(techCards[i % techCards.length].cloneNode(true));
  }

  if (items.length === 0) return;

  const VISIBLE_COUNT = 3;
  let currentIndex = 0;

  for (let i = 0; i < VISIBLE_COUNT; i++) {
    const slot = document.createElement("div");
    slot.className = "showcase-slot";
    slot.style.width = "100%";
    slot.style.height = "100%";
    slot.style.aspectRatio = "4 / 5";
    showcaseGrid.appendChild(slot);
  }

  const slots = showcaseGrid.children;

  function cycleItems() {
    for (let i = 0; i < VISIBLE_COUNT; i++) {
      const nextItem = items[currentIndex].cloneNode(true);
      currentIndex = (currentIndex + 1) % items.length;

      if (slots[i].firstChild) {
        slots[i].firstChild.classList.remove("active");
        setTimeout(() => {
          slots[i].innerHTML = "";
          slots[i].appendChild(nextItem);
          setTimeout(() => nextItem.classList.add("active"), 50);
        }, 800);
      } else {
        slots[i].appendChild(nextItem);
        setTimeout(() => nextItem.classList.add("active"), 50);
      }
    }
  }

  cycleItems();
  setInterval(cycleItems, 6000);

  async function initGridRotator(gridId, apiRoute, columns) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    
    let images = [];
    try {
      const res = await fetch(apiRoute);
      if (res.ok) {
        const data = await res.json();
        images = data.images.map(img => {
          const el = document.createElement("div");
          el.className = "showcase-item";
          el.innerHTML = `<img src="${encodeURI(img)}" alt="Gallery Image" loading="lazy">`;
          return el;
        });
      }
    } catch (e) {
      console.error("Failed to load images from " + apiRoute, e);
    }
    
    if (images.length === 0) return;
    
    for (let i = 0; i < columns; i++) {
      const slot = document.createElement("div");
      slot.className = "showcase-slot";
      slot.style.width = "100%";
      slot.style.height = "100%";
      slot.style.aspectRatio = "4 / 5";
      grid.appendChild(slot);
    }
    
    const slots = grid.children;
    let currentIndex = 0;
    
    function cycleItems() {
      for (let i = 0; i < columns; i++) {
        const nextItem = images[currentIndex].cloneNode(true);
        currentIndex = (currentIndex + 1) % images.length;
        
        if (slots[i].firstChild) {
          slots[i].firstChild.classList.remove("active");
          setTimeout(() => {
            slots[i].innerHTML = "";
            slots[i].appendChild(nextItem);
            setTimeout(() => nextItem.classList.add("active"), 50);
          }, 800);
        } else {
          slots[i].appendChild(nextItem);
          setTimeout(() => nextItem.classList.add("active"), 50);
        }
      }
    }
    
    cycleItems();
    setInterval(cycleItems, 6000);
  }

  initGridRotator("liveStudioGrid", "/api/studio-images.json", 4);
  initGridRotator("liveSocialGrid", "/api/social-images.json", 4);

  // Scroll Reveal Observer
  const revealElements = document.querySelectorAll(".section-title, .kicker, .project-card, .strategy-item, .tech-card, .about-statement, [data-reveal]");
  revealElements.forEach(el => el.classList.add("reveal-element"));
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  });

  document.querySelectorAll(".reveal-element").forEach(el => {
    revealObserver.observe(el);
  });
});
