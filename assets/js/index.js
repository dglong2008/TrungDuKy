// TrungDuKy — intro landing page
// No app logic here — just the two small motion touches the page needs.

document.addEventListener("DOMContentLoaded", () => {
    // Draw the route line in once, on load.
    const route = document.getElementById("routeLine");
    if (route) {
        requestAnimationFrame(() => {
            setTimeout(() => route.classList.add("is-drawn"), 150);
        });
    }

    // Reveal sections/cards as they scroll into view.
    const revealEls = document.querySelectorAll("[data-reveal]");

    if ("IntersectionObserver" in window && revealEls.length) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.2, rootMargin: "0px 0px -40px 0px" },
        );

        revealEls.forEach((el) => observer.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add("is-visible"));
    }
});

/**
 * destination-sections.js
 * Scroll-reveal + interactive behaviours for .dest-hub cards
 * No dependencies — vanilla JS, ES2017+
 */

(function destHubInit() {
    "use strict";

    // ── Scroll-reveal via IntersectionObserver ──────────────────────────────────
    function initDestReveal() {
        const cards = document.querySelectorAll("[data-dest-reveal]");
        if (!cards.length) return;

        // Respect prefers-reduced-motion
        const prefersReduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;
        if (prefersReduced) {
            cards.forEach(function (card) {
                card.classList.add("dest-hub__card--visible");
            });
            return;
        }

        var observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("dest-hub__card--visible");
                        observer.unobserve(entry.target); // fire once only
                    }
                });
            },
            {
                threshold: 0.12, // reveal when 12 % of the card is in view
                rootMargin: "0px 0px -48px 0px",
            },
        );

        cards.forEach(function (card) {
            observer.observe(card);
        });
    }

    // ── Parallax on images (subtle — disabled on mobile) ───────────────────────
    function initDestParallax() {
        var photos = document.querySelectorAll(".dest-hub__photo");
        if (!photos.length) return;

        var mq = window.matchMedia(
            "(min-width: 769px) and (prefers-reduced-motion: no-preference)",
        );
        if (!mq.matches) return;

        var ticking = false;

        function onScroll() {
            if (ticking) return;
            ticking = true;

            requestAnimationFrame(function () {
                photos.forEach(function (img) {
                    var frame = img.closest(".dest-hub__img-frame");
                    if (!frame) {
                        ticking = false;
                        return;
                    }

                    var rect = frame.getBoundingClientRect();
                    var viewH = window.innerHeight;

                    // Only animate when the frame is within the viewport
                    if (rect.bottom < 0 || rect.top > viewH) {
                        ticking = false;
                        return;
                    }

                    // Progress: 0 (just entered bottom) → 1 (just left top)
                    var progress = 1 - rect.bottom / (viewH + rect.height);
                    // Map to a small vertical shift: -8px … +8px
                    var shift = (progress - 0.5) * 16;

                    img.style.transform =
                        "translateY(" + shift.toFixed(2) + "px) scale(1)";
                });

                ticking = false;
            });
        }

        window.addEventListener("scroll", onScroll, { passive: true });
        // Initial call so images are positioned correctly on page load
        onScroll();
    }

    // ── CTA ripple effect ───────────────────────────────────────────────────────
    function initDestRipple() {
        var ctaLinks = document.querySelectorAll(".dest-hub__cta");
        if (!ctaLinks.length) return;

        ctaLinks.forEach(function (btn) {
            btn.addEventListener("click", function (e) {
                // Remove any existing ripple
                var old = btn.querySelector(".dest-hub__ripple");
                if (old) old.remove();

                var ripple = document.createElement("span");
                ripple.className = "dest-hub__ripple";

                var rect = btn.getBoundingClientRect();
                var size = Math.max(rect.width, rect.height) * 1.5;
                var x = e.clientX - rect.left - size / 2;
                var y = e.clientY - rect.top - size / 2;

                ripple.style.cssText = [
                    "position:absolute",
                    "width:" + size + "px",
                    "height:" + size + "px",
                    "top:" + y + "px",
                    "left:" + x + "px",
                    "border-radius:50%",
                    "background:rgba(255,255,255,0.28)",
                    "pointer-events:none",
                    "transform:scale(0)",
                    "animation:destHubRippleAnim 0.52s ease-out forwards",
                ].join(";");

                btn.style.position = "relative";
                btn.style.overflow = "hidden";
                btn.appendChild(ripple);

                ripple.addEventListener("animationend", function () {
                    ripple.remove();
                });
            });
        });

        // Inject keyframe once
        if (!document.getElementById("dest-hub-ripple-style")) {
            var style = document.createElement("style");
            style.id = "dest-hub-ripple-style";
            style.textContent = [
                "@keyframes destHubRippleAnim {",
                "  to { transform: scale(1); opacity: 0; }",
                "}",
            ].join("\n");
            document.head.appendChild(style);
        }
    }

    // ── Feature-item tilt on mouse move (desktop only) ─────────────────────────
    function initDestFeatureTilt() {
        var mq = window.matchMedia(
            "(min-width: 769px) and (prefers-reduced-motion: no-preference)",
        );
        if (!mq.matches) return;

        var items = document.querySelectorAll(".dest-hub__feature-item");
        items.forEach(function (item) {
            item.addEventListener("mousemove", function (e) {
                var rect = item.getBoundingClientRect();
                var cx = rect.left + rect.width / 2;
                var cy = rect.top + rect.height / 2;
                var rx = ((e.clientY - cy) / (rect.height / 2)) * -3; // ±3 deg
                var ry = ((e.clientX - cx) / (rect.width / 2)) * 3;
                item.style.transform =
                    "perspective(600px) rotateX(" +
                    rx.toFixed(2) +
                    "deg) rotateY(" +
                    ry.toFixed(2) +
                    "deg) translateZ(4px)";
                item.style.transition = "transform 0.08s ease";
            });

            item.addEventListener("mouseleave", function () {
                item.style.transform = "";
                item.style.transition =
                    "transform 0.3s ease, border-color 0.25s ease, background 0.25s ease";
            });
        });
    }

    // ── Lazy-load fallback for browsers without native lazy loading ─────────────
    function initDestLazyFallback() {
        if ("loading" in HTMLImageElement.prototype) return; // native lazy supported

        var lazyImgs = document.querySelectorAll(
            '.dest-hub__photo[loading="lazy"]',
        );
        if (!lazyImgs.length) return;

        var imgObserver = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        var img = entry.target;
                        img.src = img.dataset.src || img.src;
                        imgObserver.unobserve(img);
                    }
                });
            },
            { rootMargin: "200px 0px" },
        );

        lazyImgs.forEach(function (img) {
            imgObserver.observe(img);
        });
    }

    // ── Boot ────────────────────────────────────────────────────────────────────
    function boot() {
        initDestReveal();
        initDestParallax();
        initDestRipple();
        initDestFeatureTilt();
        initDestLazyFallback();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot(); // DOM already ready (script loaded with defer/async or at bottom)
    }
})();
