/* ============================================
   SADAN AHMAD — PORTFOLIO JS
   ============================================ */

// ============================================
// LOADER — runs immediately, no waiting
// ============================================
(function () {
    const loader = document.getElementById('loader');
    const loaderFill = document.getElementById('loaderFill');
    if (!loader || !loaderFill) return;

    document.body.style.overflow = 'hidden';

    let progress = 0;

    function hideLoader() {
        loaderFill.style.width = '100%';
        setTimeout(() => {
            loader.classList.add('hidden');
            document.body.style.overflow = 'auto';
            // kick off scroll animations
            if (typeof initAnimations === 'function') initAnimations();
            else window._loaderDone = true;
        }, 350);
    }

    const loadInterval = setInterval(() => {
        progress += Math.random() * 15 + 8;
        if (progress >= 100) {
            clearInterval(loadInterval);
            hideLoader();
            return;
        }
        loaderFill.style.width = progress + '%';
    }, 60);

    // Hard failsafe — always hide after 3s no matter what
    setTimeout(hideLoader, 3000);
}());

document.addEventListener('DOMContentLoaded', () => {


    // ============================================
    // CUSTOM CURSOR
    // ============================================
    const cursor = document.getElementById('cursor');
    const cursorFollower = document.getElementById('cursorFollower');
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
    });

    // Smooth follower
    function animateFollower() {
        followerX += (mouseX - followerX) * 0.12;
        followerY += (mouseY - followerY) * 0.12;
        cursorFollower.style.left = followerX + 'px';
        cursorFollower.style.top = followerY + 'px';
        requestAnimationFrame(animateFollower);
    }
    animateFollower();

    // Cursor hover states
    const hoverEls = document.querySelectorAll(
        'a, button, .project-card, .skill-card, .testimonial-card, input, textarea, select'
    );

    hoverEls.forEach(el => {
        el.addEventListener('mouseenter', () => cursorFollower.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursorFollower.classList.remove('hover'));
    });


    // ============================================
    // NAVIGATION
    // ============================================
    const nav = document.getElementById('nav');
    const navBurger = document.getElementById('navBurger');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    // Scroll nav style
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }, { passive: true });

    // Mobile menu toggle
    navBurger.addEventListener('click', () => {
        navBurger.classList.toggle('active');
        mobileMenu.classList.toggle('open');
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            navBurger.classList.remove('active');
            mobileMenu.classList.remove('open');
        });
    });

    // Smooth scroll for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            const id = anchor.getAttribute('href');
            if (id === '#') return;
            const target = document.querySelector(id);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });


    // ============================================
    // INIT ANIMATIONS (after loader)
    // ============================================
    window.initAnimations = function initAnimations() {
        animateCounters();
        initScrollReveal();
        initSkillBars();
    };

    // If loader already finished before DOMContentLoaded (shouldn't happen but safety)
    if (window._loaderDone) window.initAnimations();


    // ============================================
    // COUNTER ANIMATION
    // ============================================
    function animateCounters() {
        const counters = document.querySelectorAll('.stat-num');
        counters.forEach(counter => {
            const target = parseFloat(counter.dataset.count);
            const isDecimal = target % 1 !== 0;
            let current = 0;
            const step = target / 60;
            const interval = setInterval(() => {
                current += step;
                if (current >= target) {
                    current = target;
                    clearInterval(interval);
                }
                counter.textContent = isDecimal ? current.toFixed(1) : Math.floor(current);
            }, 25);
        });
    }


    // ============================================
    // SCROLL REVEAL
    // ============================================
    function initScrollReveal() {
        const revealEls = document.querySelectorAll(
            '.service-row, .project-card, .skill-card, .testimonial-card, .process-step, .about-inner, .contact-inner, .section-header'
        );

        revealEls.forEach((el, i) => {
            el.classList.add('reveal');
            // Stagger children
            if (el.parentElement.children.length > 1) {
                const idx = Array.from(el.parentElement.children).indexOf(el);
                if (idx > 0 && idx < 12) {
                    el.classList.add(`reveal-delay-${idx}`);
                }
            }
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        revealEls.forEach(el => observer.observe(el));
    }

    // ============================================
    // SERVICES — CURSOR FOLLOWING POPOVER
    // ============================================
    const serviceRows = document.querySelectorAll('.service-row');

    serviceRows.forEach(row => {
        const popover = row.querySelector('.service-popover');
        if (!popover) return;

        // Move popover to body so it's never clipped
        document.body.appendChild(popover);

        let mouseX = 0, mouseY = 0;
        let popX = 0, popY = 0;
        let rafId = null;
        let isHovering = false;

        // Smooth follow with lerp
        function followCursor() {
            if (!isHovering) return;

            popX += (mouseX - popX) * 0.1;
            popY += (mouseY - popY) * 0.1;

            // Offset so popover doesn't sit under cursor
            const offsetX = 24;
            const offsetY = -120;

            // Keep within viewport
            const pw = popover.offsetWidth || 300;
            const ph = popover.offsetHeight || 220;
            const vw = window.innerWidth;
            const vh = window.innerHeight;

            let finalX = popX + offsetX;
            let finalY = popY + offsetY;

            // Flip to left if too close to right edge
            if (finalX + pw + 20 > vw) finalX = popX - pw - offsetX;
            // Flip down if too close to top
            if (finalY < 10) finalY = popY + 24;
            // Keep inside bottom
            if (finalY + ph > vh - 10) finalY = vh - ph - 10;

            popover.style.left = finalX + 'px';
            popover.style.top = finalY + 'px';

            rafId = requestAnimationFrame(followCursor);
        }

        row.addEventListener('mouseenter', () => {
            isHovering = true;
            popover.classList.add('visible');
            rafId = requestAnimationFrame(followCursor);
        });

        row.addEventListener('mousemove', e => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        row.addEventListener('mouseleave', () => {
            isHovering = false;
            popover.classList.remove('visible');
            cancelAnimationFrame(rafId);
        });
    });


    // ============================================
    // SKILL BARS
    // ============================================
    function initSkillBars() {
        const skillFills = document.querySelectorAll('.skill-fill');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const width = entry.target.dataset.width;
                    entry.target.style.width = width + '%';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        skillFills.forEach(fill => observer.observe(fill));
    }


    // ============================================
    // CONTACT FORM
    // ============================================
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', e => {
            e.preventDefault();

            const btn = contactForm.querySelector('.btn-primary');
            const span = btn.querySelector('span');

            span.textContent = 'Sending...';
            btn.disabled = true;
            btn.style.opacity = '0.7';

            setTimeout(() => {
                span.textContent = '✓ Message Sent!';
                btn.style.background = '#4ade80';
                btn.style.opacity = '1';
                contactForm.reset();

                setTimeout(() => {
                    span.textContent = 'Send Message';
                    btn.style.background = '';
                    btn.disabled = false;
                }, 3000);
            }, 1500);
        });
    }


    // ============================================
    // PARALLAX HERO ORBS (subtle)
    // ============================================
    // const orbs = document.querySelectorAll('.hero-orb');

    // document.addEventListener('mousemove', e => {
    //     const x = (e.clientX / window.innerWidth - 0.5) * 20;
    //     const y = (e.clientY / window.innerHeight - 0.5) * 20;

    //     orbs.forEach((orb, i) => {
    //         const factor = i === 0 ? 1 : -0.6;
    //         orb.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
    //     });
    // }, { passive: true });


    // ============================================
    // ACTIVE NAV LINK on scroll
    // ============================================
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            if (window.scrollY >= section.offsetTop - 100) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    }, { passive: true });


    // // ============================================
    // // MAGNETIC BUTTON EFFECT
    // // ============================================
    // const magnetBtns = document.querySelectorAll('.btn-primary, .nav-cta');

    // magnetBtns.forEach(btn => {
    //     btn.addEventListener('mousemove', e => {
    //         const rect = btn.getBoundingClientRect();
    //         const x = e.clientX - rect.left - rect.width / 2;
    //         const y = e.clientY - rect.top - rect.height / 2;
    //         btn.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
    //     });

    //     btn.addEventListener('mouseleave', () => {
    //         btn.style.transform = '';
    //     });
    // });

    // ============================================
    // DIRECTIONAL FILL BUTTON - DETECTS MOUSE ENTRY DIRECTION AND ANIMATES FILL FROM THAT DIRECTION
    // ============================================
    document.querySelectorAll('.btn-magnetic').forEach(btn => {
        const fill = btn.querySelector('.btn-magnetic-fill');
        if (!fill) return;

        // Get direction of mouse entry (top/bottom/left/right)
        function getDirection(e, el) {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;  // cursor X inside button
            const y = e.clientY - rect.top;   // cursor Y inside button
            const w = rect.width;
            const h = rect.height;

            // Distance from each edge
            const top = y;
            const bottom = h - y;
            const left = x;
            const right = w - x;

            // Find the closest edge
            const min = Math.min(top, bottom, left, right);

            // Return entry position — where blob should start
            if (min === top) return { x: x, y: -50 };  // from top
            if (min === bottom) return { x: x, y: h + 50 };  // from bottom
            if (min === left) return { x: -50, y: y };  // from left
            if (min === right) return { x: w + 50, y: y };  // from right
        }

        // On mouse ENTER — place blob at entry point then scale up
        btn.addEventListener('mouseenter', e => {
            const pos = getDirection(e, btn);

            // Instantly place blob at entry point (no transition)
            fill.style.transition = 'none';
            fill.style.left = pos.x + 'px';
            fill.style.top = pos.y + 'px';
            fill.style.transform = 'translate(-50%, -50%) scale(0)';
            fill.style.opacity = '1';

            // Force browser to register the instant position
            fill.getBoundingClientRect();

            // Now animate scale up with transition
            fill.style.transition = 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)';
            fill.style.transform = 'translate(-50%, -50%) scale(1)';
        });

        // On mouse LEAVE — shrink blob toward exit point
        btn.addEventListener('mouseleave', e => {
            const pos = getDirection(e, btn);

            // Move blob toward exit point while shrinking
            fill.style.transition = 'transform 1s cubic-bezier(0.16, 1, 0.3, 1), ' +
                'left 1s cubic-bezier(0.16, 1, 0.3, 1), ' +
                'top 1s cubic-bezier(0.16, 1, 0.3, 1)';
            fill.style.left = pos.x + 'px';
            fill.style.top = pos.y + 'px';
            fill.style.transform = 'translate(-50%, -50%) scale(0)';
        });
    });


    // ============================================
    // TICKER PAUSE ON HOVER
    // ============================================
    const tickerTrack = document.querySelector('.ticker-track');
    if (tickerTrack) {
        tickerTrack.closest('.ticker-strip').addEventListener('mouseenter', () => {
            tickerTrack.style.animationPlayState = 'paused';
        });
        tickerTrack.closest('.ticker-strip').addEventListener('mouseleave', () => {
            tickerTrack.style.animationPlayState = 'running';
        });
    }

    // ============================================
    // PRICING V2 — Vercel Style JS
    // Add inside DOMContentLoaded in main.js
    // (Remove or replace old pricing JS first)
    // ============================================

    // ── PRICING COLS SCROLL REVEAL ──
    const pricingCols = document.querySelectorAll('.pricing-col');

    if (pricingCols.length) {
        // Set initial hidden state
        pricingCols.forEach((col, i) => {
            col.style.opacity = '0';
            col.style.transform = 'translateY(28px)';
            col.style.transition = `opacity 0.6s cubic-bezier(0.16,1,0.3,1),
                             transform 0.6s cubic-bezier(0.16,1,0.3,1)`;
        });

        const colObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;

                const col = entry.target;
                const idx = Array.from(pricingCols).indexOf(col);

                // Stagger: left → center → right
                setTimeout(() => {
                    col.style.opacity = '1';
                    col.style.transform = 'translateY(0)';
                }, idx * 100);

                colObserver.unobserve(col);
            });
        }, { threshold: 0.1 });

        pricingCols.forEach(col => colObserver.observe(col));
    }

    // ── PRICING BUTTON ARROW ANIMATION ──
    document.querySelectorAll('.pricing-cta-btn').forEach(btn => {
        const svg = btn.querySelector('svg');
        if (!svg) return;

        // Set base transition directly on element
        svg.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
        svg.style.transform = 'translateX(0)';
        svg.style.display = 'block';

        btn.addEventListener('mouseenter', () => {
            svg.style.transform = 'translateX(5px)';
        });

        btn.addEventListener('mouseleave', () => {
            svg.style.transform = 'translateX(0)';
        });
    });

    // ============================================
    // PROCESS V4 — Scroll Reveal
    // Add inside DOMContentLoaded in main.js
    // Remove old process JS first
    // ============================================

    const pbCards = document.querySelectorAll('.pb-card');

    if (pbCards.length) {
        pbCards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(24px)';
            card.style.transition = 'opacity 0.65s cubic-bezier(0.16,1,0.3,1), transform 0.65s cubic-bezier(0.16,1,0.3,1)';
        });

        const pbObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const idx = Array.from(pbCards).indexOf(entry.target);

                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, idx * 80);

                pbObserver.unobserve(entry.target);
            });
        }, { threshold: 0.08 });

        pbCards.forEach(c => pbObserver.observe(c));
    }

});