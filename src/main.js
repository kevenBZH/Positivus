import "./scss/main.scss";

// Menu
const burger = document.querySelector(".menu__burger");
const menu = document.querySelector(".menu");
const firstMenuLink = menu.querySelector(".menu__link");

function openMenu() {
    menu.classList.add("active");
    burger.setAttribute("aria-expanded", "true");
    firstMenuLink?.focus();
}

function closeMenu() {
    menu.classList.remove("active");
    burger.setAttribute("aria-expanded", "false");
    burger.focus();
}

burger.addEventListener("click", () => {
    const isOpen = burger.getAttribute("aria-expanded") === "true";

    if (isOpen) {
        closeMenu();
    } else {
        openMenu();
    }
});

document.addEventListener("keydown", (event) => {
    const isOpen = burger.getAttribute("aria-expanded") === "true";

    if (event.key === "Escape" && isOpen) {
        closeMenu();
    }
});

// Accordion
const accordions = document.querySelectorAll(".process");

function toggleccordion(accordion) {
    const trigger = accordion.querySelector(".process__trigger");
    const content = accordion.querySelector(".process__content");

    const isOpen = trigger.getAttribute("aria-expanded") === "true";

    if (isOpen) {
        trigger.setAttribute("aria-expanded", "false");
        content.hidden = true;
    } else {
        trigger.setAttribute("aria-expanded", "true");
        content.hidden = false;
    }
}

function closeAccordion(accordion) {
    const trigger = accordion.querySelector(".process__trigger");
    const content = accordion.querySelector(".process__content");

    trigger.setAttribute("aria-expanded", "false");
    content.hidden = true;
}

accordions.forEach((accordion) => {
    const trigger = accordion.querySelector(".process__trigger");

    trigger.addEventListener("click", () => {
        const isOpen = trigger.getAttribute("aria-expanded") === "true";

        toggleccordion(accordion);
    });
});

// Testimonials
const testimonials = document.querySelector(".testimonials");

if (testimonials) {
    const slider = testimonials.querySelector("#testimonials-slider");
    const slides = [...slider.querySelectorAll(".testimony")];
    const paginationItems = [
        ...testimonials.querySelectorAll(".pagination__item"),
    ];

    const previousButton = testimonials.querySelector(
        '[data-slider-control="previous"]',
    );
    const nextButton = testimonials.querySelector(
        '[data-slider-control="next"]',
    );

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let currentIndex = 0;
    let scrollTimeout;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartScrollLeft = 0;
    let hasDragged = false;

    function startDragging(event) {
        // Le tactile conserve son défilement natif.
        if (event.pointerType === "touch" || event.button !== 0) {
            return;
        }

        isDragging = true;
        hasDragged = false;
        dragStartX = event.clientX;
        dragStartScrollLeft = slider.scrollLeft;

        clearTimeout(scrollTimeout);

        slider.classList.add("is-dragging");
        slider.setPointerCapture(event.pointerId);
    }

    function dragSlider(event) {
        if (!isDragging) {
            return;
        }

        const distance = event.clientX - dragStartX;

        if (Math.abs(distance) > 5) {
            hasDragged = true;
        }

        slider.scrollLeft = dragStartScrollLeft - distance;

        event.preventDefault();
    }

    function stopDragging(event) {
        if (!isDragging) {
            return;
        }

        isDragging = false;
        slider.classList.remove("is-dragging");

        if (slider.hasPointerCapture(event.pointerId)) {
            slider.releasePointerCapture(event.pointerId);
        }

        // Recherche la carte la plus proche, puis la recentre.
        synchronizeAfterScroll();
        goToSlide(currentIndex);
    }

    slider.addEventListener("pointerdown", startDragging);
    slider.addEventListener("pointermove", dragSlider);
    slider.addEventListener("pointerup", stopDragging);
    slider.addEventListener("pointercancel", stopDragging);
    slider.addEventListener("lostpointercapture", stopDragging);

    // Évite d'activer un futur lien après un véritable drag.
    slider.addEventListener(
        "click",
        (event) => {
            if (!hasDragged) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            hasDragged = false;
        },
        true,
    );

    function updateControls() {
        previousButton.disabled = currentIndex === 0;
        nextButton.disabled = currentIndex === slides.length - 1;

        paginationItems.forEach((item, index) => {
            if (index === currentIndex) {
                item.setAttribute("aria-current", "true");
            } else {
                item.removeAttribute("aria-current");
            }
        });
    }

    function getSlidePosition(slide) {
        return slide.offsetLeft - (slider.clientWidth - slide.clientWidth) / 2;
    }

    function goToSlide(index, smooth = true) {
        currentIndex = Math.max(0, Math.min(index, slides.length - 1));

        slider.scrollTo({
            left: getSlidePosition(slides[currentIndex]),
            behavior: smooth && !reducedMotion.matches ? "smooth" : "auto",
        });

        updateControls();
    }

    function synchronizeAfterScroll() {
        const sliderCenter = slider.scrollLeft + slider.clientWidth / 2;

        const nearestSlide = slides.reduce(
            (nearest, slide, index) => {
                const slideCenter = slide.offsetLeft + slide.clientWidth / 2;

                const distance = Math.abs(sliderCenter - slideCenter);

                return distance < nearest.distance
                    ? { index, distance }
                    : nearest;
            },
            { index: 0, distance: Infinity },
        );

        currentIndex = nearestSlide.index;
        updateControls();
    }

    previousButton.addEventListener("click", () => {
        goToSlide(currentIndex - 1);
    });

    nextButton.addEventListener("click", () => {
        goToSlide(currentIndex + 1);
    });

    paginationItems.forEach((item, index) => {
        item.addEventListener("click", () => {
            goToSlide(index);
        });
    });

    slider.addEventListener(
        "scroll",
        () => {
            clearTimeout(scrollTimeout);

            if (isDragging) {
                return;
            }

            scrollTimeout = setTimeout(synchronizeAfterScroll, 100);
        },
        { passive: true },
    );

    slider.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") {
            event.preventDefault();
            goToSlide(currentIndex - 1);
        }

        if (event.key === "ArrowRight") {
            event.preventDefault();
            goToSlide(currentIndex + 1);
        }
    });

    new ResizeObserver(() => {
        goToSlide(currentIndex, false);
    }).observe(slider);

    goToSlide(0, false);
}
