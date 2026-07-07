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

    // Render certifications and achievements from data.js
    const renderDynamicData = () => {
        try {
            if (typeof portfolioData === 'undefined') {
                throw new Error("portfolioData is not defined. Ensure data.js is loaded.");
            }
            const data = portfolioData;

            const createCardHTML = (item) => `
                <article class="credential-card reveal">
                    <span class="credential-badge">${item.year}</span>
                    <h3>${item.title}</h3>
                    <p>Issued by: ${item.issuer}</p>
                    <small>${item.description}</small>
                    ${item.image ? `<a href="${item.image}" target="_blank" class="cert-link" style="display:inline-block; margin-top:10px; color:var(--accent); font-size:0.85rem; font-weight:700;"><i class="fas fa-external-link-alt"></i> View Certificate</a>` : ''}
                </article>
            `;

            const certContainer = document.getElementById("certifications-container");
            if (certContainer && data.certifications) {
                certContainer.innerHTML = data.certifications.map(createCardHTML).join("");
            }

            const achContainer = document.getElementById("achievements-container");
            if (achContainer && data.achievements) {
                achContainer.innerHTML = data.achievements.map(createCardHTML).join("");
            }

            // Re-apply reveal animation observer to new items
            if (hasIntersectionObserver) {
                const newRevealItems = document.querySelectorAll("#certifications-container .reveal, #achievements-container .reveal");
                newRevealItems.forEach(item => {
                    // Create a new observer for these specific items just like the main one
                    const revealObserver = new IntersectionObserver(
                        entries => {
                            entries.forEach(entry => {
                                if (entry.isIntersecting) {
                                    entry.target.classList.add("is-visible");
                                    revealObserver.unobserve(entry.target);
                                }
                            });
                        },
                        { threshold: 0.18, rootMargin: "0px 0px -50px 0px" }
                    );
                    revealObserver.observe(item);
                });
            } else {
                const newRevealItems = document.querySelectorAll("#certifications-container .reveal, #achievements-container .reveal");
                newRevealItems.forEach(item => item.classList.add("is-visible"));
            }
        } catch (error) {
            console.error("Error loading dynamic data:", error);
        }
    };

    renderDynamicData();

    updateHeaderState();
    updateActiveLink("home");
    window.addEventListener("scroll", updateHeaderState, { passive: true });
});
