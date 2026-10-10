/* Shared responsive menu for every admin page (legacy and new modules). */
(() => {
    const header = document.querySelector(".admin-header");
    if (!header) return;

    const toggle = header.querySelector("#navToggle") || document.getElementById("navToggle");
    const nav = header.querySelector("#adminNav") || document.getElementById("adminNav");
    if (!toggle || !nav) return;

    // Older pages placed the navigation after </header>; normalize it into the header.
    if (nav.parentElement !== header) header.appendChild(nav);

    // Put account/logout controls inside the dropdown on every page, including legacy pages.
    const externalAccount = header.querySelector(":scope > .admin-user");
    if (externalAccount && !nav.querySelector("#logoutButton")) {
        externalAccount.classList.add("nav-account");
        nav.appendChild(externalAccount);
    }

    const setOpen = (open) => {
        nav.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
        const icon = toggle.querySelector(".hamburger-lines");
        if (icon) icon.textContent = open ? "✕" : "☰";
        else toggle.textContent = open ? "✕" : "☰";
    };

    toggle.setAttribute("aria-controls", "adminNav");
    toggle.addEventListener("click", (event) => {
        event.stopPropagation();
        setOpen(!nav.classList.contains("is-open"));
    });
    nav.addEventListener("click", (event) => {
        if (event.target.closest("a")) setOpen(false);
    });
    document.addEventListener("click", (event) => {
        if (nav.classList.contains("is-open") && !nav.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") setOpen(false);
    });
})();
