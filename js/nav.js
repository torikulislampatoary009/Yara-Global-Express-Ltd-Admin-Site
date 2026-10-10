/* Responsive navigation: the account/logout controls are inside the menu. */
(() => {
    const toggle = document.getElementById("navToggle");
    const nav = document.getElementById("adminNav");
    if (!toggle || !nav) return;

    const setOpen = (open) => {
        nav.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
        const icon = toggle.querySelector(".hamburger-lines");
        if (icon) icon.textContent = open ? "✕" : "☰";
    };

    toggle.addEventListener("click", (event) => {
        event.stopPropagation();
        setOpen(!nav.classList.contains("is-open"));
    });

    nav.addEventListener("click", (event) => {
        if (event.target.closest("a") && window.matchMedia("(max-width: 1050px)").matches) setOpen(false);
    });

    document.addEventListener("click", (event) => {
        if (window.matchMedia("(max-width: 1050px)").matches && nav.classList.contains("is-open") && !nav.contains(event.target) && !toggle.contains(event.target)) {
            setOpen(false);
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") setOpen(false);
    });

    window.addEventListener("resize", () => {
        if (window.matchMedia("(min-width: 1051px)").matches) setOpen(false);
    });
})();
