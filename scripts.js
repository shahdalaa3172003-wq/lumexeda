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

  // Sync GSAP ScrollTrigger with Lenis
  gsap.registerPlugin(ScrollTrigger);
  
  // Custom Cursor
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
