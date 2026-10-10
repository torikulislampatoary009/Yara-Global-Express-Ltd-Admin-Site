/* Shared page controller for the additional operational modules. */
(() => {
    const config = window.MODULE_CONFIG;
    const root = document.getElementById("moduleRoot");

    if (!config || !root) return;

    const fields = config.fields || [];
    const token = () => localStorage.getItem("yeara_token");
    const apiBase = String(window.API_URL || "https://yge-backend.onrender.com/api").replace(/\/+$/, "");
    let editingId = null;
    let records = [];

    if (!token()) {
        window.location.href = "index.html";
        return;
    }

    const escapeHTML = (value) => String(value ?? "—").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);

    const fieldControl = (field) => {
        const name = escapeHTML(field.name);
        const label = escapeHTML(field.label);
        const required = field.required ? "required" : "";
        const value = field.value || "";

        if (Array.isArray(field.options)) {
            const options = field.options.map((option) =>
                `<option value="${escapeHTML(option)}">${escapeHTML(option.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()))}</option>`
            ).join("");
            return `<label for="field-${name}">${label}<select id="field-${name}" name="${name}" ${required}><option value="">Select ${label.toLowerCase()}</option>${options}</select></label>`;
        }

        if (field.type === "textarea") {
            return `<label for="field-${name}">${label}<textarea id="field-${name}" name="${name}" ${required} placeholder="${escapeHTML(field.placeholder || "")}"></textarea></label>`;
        }

        const type = ["text", "number", "date", "datetime-local", "email", "tel", "url"].includes(field.type) ? field.type : "text";
        const step = type === "number" ? 'step="any"' : "";
        return `<label for="field-${name}">${label}<input id="field-${name}" name="${name}" type="${type}" ${required} ${step} placeholder="${escapeHTML(field.placeholder || "")}"></label>`;
    };

    root.innerHTML = `
        <section class="page-header module-page-header">
            <div>
                <span class="page-label">OPERATIONS</span>
                <h1>${escapeHTML(config.title)}</h1>
                <p class="module-intro">Create, review and maintain ${escapeHTML(config.title.toLowerCase())} records.</p>
            </div>
        </section>
        <section class="table-card module-card">
            <h2 id="formHeading">Create a record</h2>
            <form id="moduleForm" class="module-form">
                ${fields.map(fieldControl).join("\n                ")}
                <div class="form-actions">
                    <button class="primary-button" id="saveRecordButton" type="submit">Create record</button>
                    <button class="secondary-button" id="cancelEditButton" type="button" hidden>Cancel edit</button>
                </div>
                <p id="moduleMessage" class="module-message" role="status" aria-live="polite"></p>
            </form>
            <div class="module-toolbar">
                <h2>Records</h2>
                <div class="module-toolbar-actions">
                    <input id="moduleSearch" type="search" placeholder="Search loaded records…" aria-label="Search records">
                    <button class="secondary-button" id="refreshModule" type="button">Refresh records</button>
                </div>
            </div>
            <div class="module-table-wrap">
                <table class="module-table">
                    <thead><tr><th>ID</th>${fields.slice(0, 5).map((field) => `<th>${escapeHTML(field.label)}</th>`).join("")}<th>Actions</th></tr></thead>
                    <tbody id="moduleRows"><tr><td class="module-empty" colspan="${Math.min(fields.length, 5) + 2}">Loading records…</td></tr></tbody>
                </table>
            </div>
        </section>`;

    const form = document.getElementById("moduleForm");
    const message = document.getElementById("moduleMessage");
    const rows = document.getElementById("moduleRows");
    const saveButton = document.getElementById("saveRecordButton");
    const cancelButton = document.getElementById("cancelEditButton");
    const formHeading = document.getElementById("formHeading");
    const searchInput = document.getElementById("moduleSearch");
    const columnCount = Math.min(fields.length, 5) + 2;

    async function request(path = "", options = {}) {
        // API_URL already ends in /api. Do not append another /api segment.
        const cleanPath = String(path).replace(/^\/+/, "");
        const url = `${apiBase}/${config.endpoint}${cleanPath ? `/${cleanPath}` : ""}`;
        const headers = { ...(options.headers || {}), Authorization: `Bearer ${token()}` };
        if (options.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json";

        let response;
        try {
            response = await fetch(url, { ...options, headers });
        } catch (error) {
            throw new Error("Cannot reach the API. Check the backend deployment and CORS configuration.");
        }

        const payload = await response.json().catch(() => ({}));
        if (response.status === 401) {
            localStorage.removeItem("yeara_token");
            localStorage.removeItem("yeara_user");
            window.location.href = "index.html";
            throw new Error("Your session expired. Please sign in again.");
        }
        if (!response.ok) {
            const detail = payload.message || payload.error || `Request failed (${response.status})`;
            throw new Error(response.status === 404
                ? `API endpoint not found: ${url}. Confirm that the backend version is deployed.`
                : detail);
        }
        return payload;
    }

    function showMessage(text, isError = false) {
        message.textContent = text;
        message.style.color = isError ? "#b91c1c" : "var(--primary, #0b5ed7)";
    }

    function resetForm() {
        form.reset();
        editingId = null;
        formHeading.textContent = "Create a record";
        saveButton.textContent = "Create record";
        cancelButton.hidden = true;
    }

    function renderRows() {
        const query = searchInput.value.trim().toLowerCase();
        const visible = records.filter((record) =>
            !query || Object.values(record).some((value) => String(value ?? "").toLowerCase().includes(query))
        );

        if (!visible.length) {
            rows.innerHTML = `<tr><td class="module-empty" colspan="${columnCount}">${records.length ? "No matching records." : "No records found yet."}</td></tr>`;
            return;
        }

        rows.innerHTML = visible.map((record) => `
            <tr>
                <td>${escapeHTML(record.id)}</td>
                ${fields.slice(0, 5).map((field) => `<td>${escapeHTML(record[field.name])}</td>`).join("")}
                <td><div class="module-actions">
                    <button type="button" data-edit="${escapeHTML(record.id)}">Edit</button>
                    <button type="button" class="danger-button" data-delete="${escapeHTML(record.id)}">Delete</button>
                </div></td>
            </tr>`).join("");
    }

    async function loadRecords() {
        rows.innerHTML = `<tr><td class="module-empty" colspan="${columnCount}">Loading records…</td></tr>`;
        try {
            const result = await request("?limit=250");
            records = Array.isArray(result.data) ? result.data : [];
            renderRows();
            showMessage(`${records.length} record${records.length === 1 ? "" : "s"} loaded.`);
        } catch (error) {
            records = [];
            rows.innerHTML = `<tr><td class="module-empty" colspan="${columnCount}">${escapeHTML(error.message)}</td></tr>`;
            showMessage(error.message, true);
        }
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(form).entries());
        for (const field of fields) {
            if (field.type === "number" && data[field.name] !== "") data[field.name] = Number(data[field.name]);
            if (data[field.name] === "") delete data[field.name];
        }

        saveButton.disabled = true;
        saveButton.textContent = editingId ? "Saving changes…" : "Creating…";
        try {
            if (editingId) {
                await request(String(editingId), { method: "PATCH", body: JSON.stringify(data) });
                showMessage("Record updated successfully.");
            } else {
                await request("", { method: "POST", body: JSON.stringify(data) });
                showMessage("Record created successfully.");
            }
            resetForm();
            await loadRecords();
        } catch (error) {
            showMessage(error.message, true);
        } finally {
            saveButton.disabled = false;
            saveButton.textContent = editingId ? "Save changes" : "Create record";
        }
    });

    cancelButton.addEventListener("click", () => {
        resetForm();
        showMessage("Edit cancelled.");
    });
    document.getElementById("refreshModule").addEventListener("click", loadRecords);
    searchInput.addEventListener("input", renderRows);

    rows.addEventListener("click", async (event) => {
        const editButton = event.target.closest("[data-edit]");
        const deleteButton = event.target.closest("[data-delete]");

        if (editButton) {
            const record = records.find((item) => String(item.id) === editButton.dataset.edit);
            if (!record) return;
            editingId = record.id;
            for (const field of fields) {
                const control = form.elements.namedItem(field.name);
                if (control) control.value = record[field.name] == null ? "" : String(record[field.name]).replace(" ", "T").slice(0, field.type === "datetime-local" ? 16 : undefined);
            }
            formHeading.textContent = `Edit record #${record.id}`;
            saveButton.textContent = "Save changes";
            cancelButton.hidden = false;
            showMessage(`Editing record #${record.id}.`);
            form.scrollIntoView({ behavior: "smooth", block: "start" });
            return;
        }

        if (deleteButton) {
            const id = deleteButton.dataset.delete;
            if (!window.confirm(`Delete record #${id}? This action cannot be undone.`)) return;
            deleteButton.disabled = true;
            try {
                await request(id, { method: "DELETE" });
                if (String(editingId) === String(id)) resetForm();
                showMessage("Record deleted successfully.");
                await loadRecords();
            } catch (error) {
                showMessage(error.message, true);
                deleteButton.disabled = false;
            }
        }
    });

    loadRecords();
})();
