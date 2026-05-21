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

    // ============================================
    // TESTIMONIALS — Smooth Marquee
    // Add inside DOMContentLoaded in main.js
    // Remove old testimonials JS first
    // ============================================

    (function () {
        const rows = document.querySelectorAll('.testi-row');
        if (!rows.length) return;

        rows.forEach(row => {
            const track = row.querySelector('.testi-track');
            if (!track) return;

            const direction = row.dataset.direction; // "left" or "right"
            const speed = 0.7; // px per frame — increase for faster
            let pos = direction === 'right' ? -track.scrollWidth / 2 : 0;
            let paused = false;
            let rafId = null;

            // Remove CSS animation — we control it via JS
            track.style.animation = 'none';
            track.style.transform = `translateX(${pos}px)`;

            function animate() {
                if (!paused) {
                    if (direction === 'left') {
                        pos -= speed;
                        // Reset when first half scrolled out
                        if (Math.abs(pos) >= track.scrollWidth / 2) {
                            pos = 0;
                        }
                    } else {
                        pos += speed;
                        // Reset when back to 0
                        if (pos >= 0) {
                            pos = -track.scrollWidth / 2;
                        }
                    }
                    track.style.transform = `translateX(${pos}px)`;
                }
                rafId = requestAnimationFrame(animate);
            }

            // Start animation
            rafId = requestAnimationFrame(animate);

            // Smooth pause/resume on hover
            let targetSpeed = speed;
            let currentSpeed = speed;

            row.addEventListener('mouseenter', () => { paused = true; });
            row.addEventListener('mouseleave', () => { paused = false; });

        });

    }());

    // ============================================
    // CONTACT SECTION
    // Add inside DOMContentLoaded in main.js
    // Remove old contact JS first
    // ============================================

    // ── EMAIL COPY BUTTON ──
    const emailCopyBtn = document.getElementById('profileEmailCopy');
    const emailText = document.getElementById('profileEmail');

    if (emailCopyBtn && emailText) {
        emailCopyBtn.addEventListener('click', () => {
            const email = emailText.textContent.trim();

            navigator.clipboard.writeText(email).then(() => {
                // Show check icon
                const iconCopy = emailCopyBtn.querySelector('.icon-copy');
                const iconCheck = emailCopyBtn.querySelector('.icon-check');

                iconCopy.style.display = 'none';
                iconCheck.style.display = 'block';
                emailCopyBtn.classList.add('copied');

                // Reset after 2s
                setTimeout(() => {
                    iconCopy.style.display = 'block';
                    iconCheck.style.display = 'none';
                    emailCopyBtn.classList.remove('copied');
                }, 2000);
            }).catch(() => {
                // Fallback for older browsers
                const el = document.createElement('textarea');
                el.value = email;
                el.style.position = 'fixed';
                el.style.opacity = '0';
                document.body.appendChild(el);
                el.select();
                document.execCommand('copy');
                document.body.removeChild(el);
            });
        });
    }

    // ── FILE ATTACH LABEL UPDATE ──
    const fileInput = document.getElementById('cf-file');
    const attachLabel = document.getElementById('attachLabel');

    if (fileInput && attachLabel) {
        fileInput.addEventListener('change', () => {
            const count = fileInput.files.length;
            if (count === 0) {
                attachLabel.textContent = 'Attach Files';
            } else if (count === 1) {
                const name = fileInput.files[0].name;
                attachLabel.textContent = name.length > 16
                    ? name.substring(0, 16) + '…'
                    : name;
            } else {
                attachLabel.textContent = `${count} files attached`;
            }
        });
    }

    // Add remove button functionality to clear file input and reset label //
    const removeBtn = document.getElementById('attachRemoveBtn');

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            removeBtn.style.display = 'flex'; // show ×
        }
    });

    removeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();    // prevent label from opening file picker
        fileInput.value = '';   // clear file input
        attachLabel.textContent = 'Attach Files';
        removeBtn.style.display = 'none'; // hide ×
    });

    // ── CONTACT FORM SUBMIT ──
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', e => {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('.form-submit-btn');
            const submitLabel = contactForm.querySelector('.form-submit-label');
            const submitSvg = contactForm.querySelector('.form-submit-btn svg');

            // Loading state
            submitLabel.textContent = 'Sending…';
            submitBtn.disabled = true;
            if (submitSvg) submitSvg.style.display = 'none';

            // Simulate send (replace with your actual form handler)
            setTimeout(() => {
                submitBtn.classList.add('success');
                submitLabel.textContent = '✓ Message Sent!';
                submitBtn.disabled = false;

                // Reset after 3s
                setTimeout(() => {
                    submitBtn.classList.remove('success');
                    submitLabel.textContent = 'Send Message';
                    if (submitSvg) submitSvg.style.display = 'block';
                    contactForm.reset();
                    if (attachLabel) attachLabel.textContent = 'Attach Files';
                }, 3000);
            }, 1500);
        });
    }

    // ── CUSTOM SELECT — Budget (single select) ──
    initSingleSelect('budgetSelect', 'budgetPlaceholder', 'budgetValue');

    // ── CUSTOM SELECT — Service (multi select) ──
    initMultiSelect('serviceSelect', 'servicePlaceholder', 'serviceValue');


    function initSingleSelect(wrapId, placeholderId, inputId) {
        const wrap = document.getElementById(wrapId);
        const placeholder = document.getElementById(placeholderId);
        const hiddenInput = document.getElementById(inputId);
        if (!wrap) return;

        const trigger = wrap.querySelector('.cs-trigger');
        const dropdown = wrap.querySelector('.cs-dropdown');
        const options = wrap.querySelectorAll('.cs-option');

        trigger.addEventListener('click', () => wrap.classList.toggle('open'));

        options.forEach(opt => {
            opt.addEventListener('click', () => {
                options.forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
                placeholder.textContent = opt.dataset.value;
                placeholder.classList.add('has-value');
                hiddenInput.value = opt.dataset.value;
                wrap.classList.remove('open');
            });
        });

        // Close on outside click
        document.addEventListener('click', e => {
            if (!wrap.contains(e.target)) wrap.classList.remove('open');
        });
    }


    function initMultiSelect(wrapId, placeholderId, inputId) {
        const wrap = document.getElementById(wrapId);
        const placeholder = document.getElementById(placeholderId);
        const hiddenInput = document.getElementById(inputId);
        if (!wrap) return;

        const trigger = wrap.querySelector('.cs-trigger');
        const options = wrap.querySelectorAll('.cs-option');
        let selected = [];

        trigger.addEventListener('click', () => wrap.classList.toggle('open'));

        options.forEach(opt => {
            opt.addEventListener('click', () => {
                const val = opt.dataset.value;

                if (selected.includes(val)) {
                    // Deselect
                    selected = selected.filter(v => v !== val);
                    opt.classList.remove('selected');
                } else {
                    // Select
                    selected.push(val);
                    opt.classList.add('selected');
                }

                // Update placeholder text
                if (selected.length === 0) {
                    placeholder.textContent = 'Select a service';
                    placeholder.classList.remove('has-value');
                } else if (selected.length === 1) {
                    placeholder.textContent = selected[0];
                    placeholder.classList.add('has-value');
                } else {
                    // "WordPress Development + 2" format
                    placeholder.textContent = `${selected[0]} + ${selected.length - 1}`;
                    placeholder.classList.add('has-value');
                }

                hiddenInput.value = selected.join(', ');
                // Note: dropdown stays open for multi-select
            });
        });

        document.addEventListener('click', e => {
            if (!wrap.contains(e.target)) wrap.classList.remove('open');
        });
    }

    // ── PRIVACY POLICY POPUP ──
    const privacyTrigger = document.getElementById('privacyTrigger');
    const privacyPopup = document.getElementById('privacyPopup');
    const privacyOverlay = document.getElementById('privacyOverlay');
    const privacyClose = document.getElementById('privacyClose');

    function openPrivacyPopup() {
        if (!privacyPopup || !privacyOverlay) return;

        privacyPopup.classList.add('active');
        privacyOverlay.classList.add('active');
        document.body.classList.add('privacy-open');
    }

    function closePrivacyPopup() {
        if (!privacyPopup || !privacyOverlay) return;

        privacyPopup.classList.remove('active');
        privacyOverlay.classList.remove('active');
        document.body.classList.remove('privacy-open');
    }

    if (privacyTrigger) {
        privacyTrigger.addEventListener('click', openPrivacyPopup);
    }

    if (privacyClose) {
        privacyClose.addEventListener('click', closePrivacyPopup);
    }

    if (privacyOverlay) {
        privacyOverlay.addEventListener('click', closePrivacyPopup);
    }

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            closePrivacyPopup();
        }
    });

});