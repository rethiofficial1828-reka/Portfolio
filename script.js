document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector(".site-header");
    const navToggle = document.querySelector(".nav-toggle");
    const headerControls = document.querySelector(".header-controls");
    const revealItems = document.querySelectorAll(".reveal");
    const navLinks = document.querySelectorAll(".site-nav a");
    const sections = document.querySelectorAll("main section[id]");
    const parallaxFrame = document.querySelector("[data-parallax]");
    const yearNode = document.querySelector("#current-year");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasIntersectionObserver = "IntersectionObserver" in window;

    if (yearNode) {
        yearNode.textContent = new Date().getFullYear();
    }

    const updateHeaderState = () => {
        if (!header) {
            return;
        }

        header.classList.toggle("is-scrolled", window.scrollY > 24);
    };

    const updateActiveLink = currentId => {
        navLinks.forEach(link => {
            const target = link.getAttribute("href");
            link.classList.toggle("is-active", target === `#${currentId}`);
        });
    };

    const closeMenu = () => {
        if (!navToggle || !headerControls) {
            return;
        }

        navToggle.setAttribute("aria-expanded", "false");
        headerControls.classList.remove("is-open");
    };

    if (navToggle && headerControls) {
        navToggle.addEventListener("click", () => {
            const isOpen = navToggle.getAttribute("aria-expanded") === "true";
            navToggle.setAttribute("aria-expanded", String(!isOpen));
            headerControls.classList.toggle("is-open", !isOpen);
        });

        navLinks.forEach(link => {
            link.addEventListener("click", closeMenu);
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 760) {
                closeMenu();
            }
        });
    }

    if (!prefersReducedMotion && parallaxFrame) {
        const handleParallax = () => {
            const offset = Math.min(window.scrollY * 0.08, 18);
            parallaxFrame.style.transform = `translateY(${offset}px)`;
        };

        handleParallax();
        window.addEventListener("scroll", handleParallax, { passive: true });
    }

    if (revealItems.length && hasIntersectionObserver) {
        const revealObserver = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        revealObserver.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.18,
                rootMargin: "0px 0px -50px 0px"
            }
        );

        revealItems.forEach(item => revealObserver.observe(item));
    } else {
        revealItems.forEach(item => item.classList.add("is-visible"));
    }

    if (sections.length && hasIntersectionObserver) {
        const sectionObserver = new IntersectionObserver(
            entries => {
                const visibleSection = entries
                    .filter(entry => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

                if (visibleSection) {
                    updateActiveLink(visibleSection.target.id);
                }
            },
            {
                threshold: [0.2, 0.45, 0.7],
                rootMargin: "-20% 0px -55% 0px"
            }
        );

        sections.forEach(section => sectionObserver.observe(section));
    }

    updateHeaderState();
    updateActiveLink("home");
    window.addEventListener("scroll", updateHeaderState, { passive: true });
});
