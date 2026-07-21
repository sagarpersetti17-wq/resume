/* ==========================================================
   STATE MANAGEMENT & DOM QUERIES
========================================================== */
document.addEventListener("DOMContentLoaded", () => {
    // DOM Cache
    const themeToggle = document.getElementById("themeToggle");
    const menuToggle = document.getElementById("menuToggle");
    const navbar = document.querySelector(".navbar");
    const header = document.getElementById("header");
    const backToTop = document.getElementById("backToTop");
    const hero = document.querySelector(".hero");
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-links a");
    const cursor = document.querySelector(".cursor-glow");
    const contactForm = document.querySelector(".contact-form");
    const skillCards = document.querySelectorAll(".skill-card");

    /* ==========================================================
       THEME MANAGEMENT (INSTANT LOAD & TOGGLE)
    ========================================================== */
    const applyTheme = (isDark) => {
        document.body.classList.toggle("dark", isDark);
        if (themeToggle) {
            themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
            themeToggle.setAttribute("aria-pressed", isDark);
        }
    };

    // Check saved preference or system default
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isInitialDark = savedTheme ? savedTheme === "dark" : prefersDark;
    
    applyTheme(isInitialDark);

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const isDark = !document.body.classList.contains("dark");
            applyTheme(isDark);
            localStorage.setItem("theme", isDark ? "dark" : "light");
        });
    }

    /* ==========================================================
       NAVIGATION & MOBILE MENU
    ========================================================== */
    if (menuToggle && navbar) {
        const toggleMenu = (open) => {
            const isOpen = open !== undefined ? open : !navbar.classList.contains("active");
            navbar.classList.toggle("active", isOpen);
            menuToggle.setAttribute("aria-expanded", isOpen);
        };

        menuToggle.addEventListener("click", () => toggleMenu());

        // Close menu on link click
        navLinks.forEach(link => {
            link.addEventListener("click", () => toggleMenu(false));
        });

        // Close menu on ESC key press
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && navbar.classList.contains("active")) {
                toggleMenu(false);
            }
        });
    }

    /* ==========================================================
       THROTTLED UNIFIED SCROLL LISTENER (60 FPS)
    ========================================================== */
    let isScrolling = false;

    const handleScroll = () => {
        const scrollY = window.scrollY;

        // 1. Header State Toggle
        if (header) {
            header.classList.toggle("scrolled", scrollY > 60);
        }

        // 2. Back To Top Button Visibility
        if (backToTop) {
            backToTop.classList.toggle("show", scrollY > 500);
        }

        // 3. Hero Parallax (Reduced Motion Respect)
        if (hero && scrollY < window.innerHeight && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            hero.style.transform = `translate3d(0, ${scrollY * 0.12}px, 0)`;
        }

        // 4. Active Section Highlighting
        let currentSectionId = "";
        const scrollThreshold = scrollY + 180;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollThreshold >= sectionTop && scrollThreshold < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute("id");
            }
        });

        navLinks.forEach(link => {
            const href = link.getAttribute("href");
            const isActive = currentSectionId && href === `#${currentSectionId}`;
            link.classList.toggle("active", isActive);
            if (isActive) {
                link.setAttribute("aria-current", "page");
            } else {
                link.removeAttribute("aria-current");
            }
        });

        isScrolling = false;
    };

    window.addEventListener("scroll", () => {
        if (!isScrolling) {
            window.requestAnimationFrame(handleScroll);
            isScrolling = true;
        }
    }, { passive: true });

    // Back to Top Trigger
    if (backToTop) {
        backToTop.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    /* ==========================================================
       INTERSECTION OBSERVER (SCROLL REVEAL)
    ========================================================== */
    const revealElements = document.querySelectorAll(
        ".section-title, .about-image, .about-content, .skill-card, .timeline-item, .performance-card, .contact-card, .contact-form"
    );

    if ("IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Uses 'reveal-active' to prevent conflict with '.show' on backToTop
                    entry.target.classList.add("reveal-active");
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            threshold: 0.12,
            rootMargin: "0px 0px -40px 0px"
        });

        revealElements.forEach(el => {
            el.classList.add("hidden");
            revealObserver.observe(el);
        });
    } else {
        // Fallback for older browsers without IntersectionObserver
        revealElements.forEach(el => el.classList.remove("hidden"));
    }

    /* ==========================================================
       GPU-ACCELERATED CURSOR GLOW TRACKING
    ========================================================== */
    if (cursor && !window.matchMedia('(pointer: coarse)').matches) {
        let mouseX = 0;
        let mouseY = 0;
        let cursorTicking = false;

        window.addEventListener("mousemove", (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            if (!cursorTicking) {
                window.requestAnimationFrame(() => {
                    cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
                    cursorTicking = false;
                });
                cursorTicking = true;
            }
        }, { passive: true });
    }

    /* ==========================================================
       HARDWARE-ACCELERATED SKILL CARD LIGHTING
    ========================================================== */
    if (skillCards.length > 0 && !window.matchMedia('(pointer: coarse)').matches) {
        skillCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            }, { passive: true });
        });
    }

    /* ==========================================================
       CONTACT FORM HANDLER
    ========================================================== */
    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            // Basic UI Feedback
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn ? submitBtn.textContent : "Send";
            
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "Sending...";
            }

            setTimeout(() => {
                alert("Thank you! Your message has been received.");
                contactForm.reset();
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            }, 600);
        });
    }
});