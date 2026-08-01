/**
 * about-section.js
 * Scroll-reveal + interactive behaviours for .abt-wrap section
 * No dependencies — vanilla JS, ES2017+
 */

(function abtSectionInit() {
    "use strict";

    var EASE_CLASS = "abt-wrap--visible";
    var CARD_CLASS = "abt-wrap--card-visible";
    var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ── 1. Section-level reveals ([data-abt-reveal]) ───────────────────────────
    function initAbtReveal() {
        var blocks = document.querySelectorAll("[data-abt-reveal]");
        if (!blocks.length) return;

        if (REDUCED) {
            blocks.forEach(function (el) {
                el.classList.add(EASE_CLASS);
            });
            return;
        }

        var obs = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add(EASE_CLASS);
                        obs.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
        );

        blocks.forEach(function (el) {
            obs.observe(el);
        });
    }

    // ── 2. Individual card staggered reveals ([data-abt-card]) ────────────────
    function initAbtCardReveal() {
        var cards = document.querySelectorAll("[data-abt-card]");
        if (!cards.length) return;

        if (REDUCED) {
            cards.forEach(function (item) {
                var card = item.querySelector(".abt-wrap__member-card");
                if (card) card.classList.add(CARD_CLASS);
            });
            return;
        }

        var cardObs = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        var card = entry.target.querySelector(
                            ".abt-wrap__member-card",
                        );
                        if (card) card.classList.add(CARD_CLASS);
                        cardObs.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15, rootMargin: "0px 0px -24px 0px" },
        );

        cards.forEach(function (item) {
            cardObs.observe(item);
        });
    }

    // ── 3. Avatar spotlight on hover ──────────────────────────────────────────
    // Adds a soft glow behind the avatar when the card is hovered
    function initAbtAvatarGlow() {
        var cards = document.querySelectorAll(".abt-wrap__member-card");
        cards.forEach(function (card) {
            var ring = card.querySelector(".abt-wrap__avatar-ring");
            if (!ring) return;

            card.addEventListener("mouseenter", function () {
                ring.style.boxShadow =
                    "0 0 0 6px rgba(74, 93, 58, 0.12), 0 0 20px rgba(74, 93, 58, 0.08)";
            });

            // Assistants use their own colour
            if (card.classList.contains("abt-wrap__member-card--asst-1")) {
                card.addEventListener("mouseenter", function () {
                    ring.style.boxShadow =
                        "0 0 0 6px rgba(224, 90, 43, 0.18), 0 0 24px rgba(224, 90, 43, 0.12)";
                });
            } else if (
                card.classList.contains("abt-wrap__member-card--asst-2")
            ) {
                card.addEventListener("mouseenter", function () {
                    ring.style.boxShadow =
                        "0 0 0 6px rgba(192, 57, 43, 0.18), 0 0 24px rgba(192, 57, 43, 0.12)";
                });
            } else if (
                card.classList.contains("abt-wrap__member-card--asst-3")
            ) {
                card.addEventListener("mouseenter", function () {
                    ring.style.boxShadow =
                        "0 0 0 6px rgba(142, 68, 173, 0.18), 0 0 24px rgba(142, 68, 173, 0.12)";
                });
            }

            card.addEventListener("mouseleave", function () {
                ring.style.boxShadow = "";
            });
        });
    }

    // ── 4. Subtle card tilt on mouse move (desktop only) ──────────────────────
    function initAbtCardTilt() {
        var mq = window.matchMedia(
            "(min-width: 641px) and (prefers-reduced-motion: no-preference)",
        );
        if (!mq.matches) return;

        var cards = document.querySelectorAll(".abt-wrap__member-card");
        cards.forEach(function (card) {
            card.addEventListener("mousemove", function (e) {
                var rect = card.getBoundingClientRect();
                var cx = rect.left + rect.width / 2;
                var cy = rect.top + rect.height / 2;
                var rx = ((e.clientY - cy) / (rect.height / 2)) * -5;
                var ry = ((e.clientX - cx) / (rect.width / 2)) * 5;
                card.style.transform = [
                    "perspective(700px)",
                    "rotateX(" + rx.toFixed(2) + "deg)",
                    "rotateY(" + ry.toFixed(2) + "deg)",
                    "translateZ(6px)",
                    "scale(1.01)",
                ].join(" ");
                card.style.transition =
                    "transform 0.08s ease, box-shadow 0.28s ease, border-color 0.28s ease";
            });

            card.addEventListener("mouseleave", function () {
                card.style.transform = "";
                card.style.transition =
                    "transform 0.4s ease, box-shadow 0.28s ease, border-color 0.28s ease, opacity 0.6s cubic-bezier(0.22,0.61,0.36,1)";
            });
        });
    }

    // ── 5. SEAS banner shimmer on scroll into view ────────────────────────────
    function initAbtSeasShimmer() {
        var banner = document.querySelector(".abt-wrap__seas-banner");
        if (!banner || REDUCED) return;

        // Inject shimmer keyframe once
        if (!document.getElementById("abt-shimmer-style")) {
            var style = document.createElement("style");
            style.id = "abt-shimmer-style";
            style.textContent = [
                "@keyframes abtShimmerSlide {",
                "  0%   { background-position: -200% center; }",
                "  100% { background-position:  200% center; }",
                "}",
                ".abt-wrap__seas-banner.abt-shimmer-active {",
                "  background-image: linear-gradient(",
                "    110deg,",
                "    #4a5d3a 0%,",
                "    #4a5d3a 38%,",
                "    #5a7048 50%,",
                "    #4a5d3a 62%,",
                "    #4a5d3a 100%",
                "  );",
                "  background-size: 200% 100%;",
                "  animation: abtShimmerSlide 2.4s ease-in-out 1;",
                "}",
            ].join("\n");
            document.head.appendChild(style);
        }

        var shimmerObs = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        banner.classList.add("abt-shimmer-active");
                        shimmerObs.unobserve(banner);
                    }
                });
            },
            { threshold: 0.5 },
        );

        shimmerObs.observe(banner);
    }

    // ── 6. Count-up role labels for a playful touch ───────────────────────────
    // Animates the role text appearing letter by letter when card is first revealed
    function initAbtRoleTypewriter() {
        if (REDUCED) return;

        var roles = document.querySelectorAll(".abt-wrap__member-role");
        roles.forEach(function (el) {
            var original = el.textContent.trim();
            el.dataset.abtRoleText = original;
            el.textContent = "";
            el.style.minHeight = "1.2em";

            var typed = false;

            var obs = new IntersectionObserver(
                function (entries) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting && !typed) {
                            typed = true;
                            obs.unobserve(el);

                            var i = 0;
                            var delay = 480; // ms after card reveal before typing starts
                            setTimeout(function typeNext() {
                                if (i <= original.length) {
                                    el.textContent = original.slice(0, i);
                                    i++;
                                    setTimeout(typeNext, 28);
                                }
                            }, delay);
                        }
                    });
                },
                { threshold: 0.8 },
            );

            obs.observe(el);
        });
    }

    // ── Boot ──────────────────────────────────────────────────────────────────
    function boot() {
        initAbtReveal();
        initAbtCardReveal();
        initAbtAvatarGlow();
        initAbtCardTilt();
        initAbtSeasShimmer();
        initAbtRoleTypewriter();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }
})();
