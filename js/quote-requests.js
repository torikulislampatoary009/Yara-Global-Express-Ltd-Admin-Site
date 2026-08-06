const API_URL =
    "https://yge-backend-production.up.railway.app:5000/api";


const token =
    localStorage.getItem(
        "yeara_token"
    );


const user =
    JSON.parse(
        localStorage.getItem(
            "yeara_user"
        ) || "null"
    );


if (!token) {

    window.location.href =
        "login.html";

}


if (user) {

    document.getElementById(
        "adminName"
    ).textContent =
        user.name;

}


document
    .getElementById("logoutButton")
    .addEventListener(
        "click",
        logout
    );


function logout() {

    localStorage.removeItem(
        "yeara_token"
    );

    localStorage.removeItem(
        "yeara_user"
    );

    window.location.href =
        "login.html";

}


// ========================================
// DATA
// ========================================

let allRequests = [];

let selectedRequestId = null;


// ========================================
// LOAD
// ========================================

async function loadRequests() {

    try {

        const response =
            await fetch(
                `${API_URL}/quotes`,
                {

                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load requests."
            );

        }


        allRequests =
            data.requests || [];


        renderRequests(
            allRequests
        );


    } catch (error) {

        console.error(error);

        alert(error.message);

    }

}


// ========================================
// RENDER
// ========================================

function renderRequests(
    requests
) {

    const tbody =
        document.getElementById(
            "requestTableBody"
        );


    if (!requests.length) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="empty-state"
                >
                    No quote requests found.
                </td>

            </tr>

        `;

        return;

    }


    tbody.innerHTML =
        requests.map(
            request => `

                <tr>

                    <td>

                        <strong>
                            ${escapeHTML(
                                request.name
                            )}
                        </strong>

                        ${
                            request.email
                                ? `
                                    <br>
                                    <small>
                                        ${escapeHTML(
                                            request.email
                                        )}
                                    </small>
                                  `
                                : ""
                        }

                    </td>


                    <td>
                        ${escapeHTML(
                            request.phone
                        )}
                    </td>


                    <td>

                        ${escapeHTML(
                            request.origin_country
                        )}

                        →

                        ${escapeHTML(
                            request.destination_country
                        )}

                    </td>


                    <td>
                        ${escapeHTML(
                            request.service_type ||
                            "-"
                        )}
                    </td>


                    <td>
                        ${
                            request.weight
                                ? `${request.weight} KG`
                                : "-"
                        }
                    </td>


                    <td>

                        <span
                            class="
                                status-badge
                                status-${request.status}
                            "
                        >
                            ${formatStatus(
                                request.status
                            )}
                        </span>

                    </td>


                    <td>
                        ${formatDate(
                            request.created_at
                        )}
                    </td>


                    <td>

                        <button
                            class="table-button"
                            onclick="openRequest(${request.id})"
                        >
                            View
                        </button>

                    </td>

                </tr>

            `
        ).join("");

}


// ========================================
// OPEN DETAILS
// ========================================

window.openRequest =
    async function(id) {

        const request =
            allRequests.find(
                item =>
                    item.id === id
            );


        if (!request) {

            return;

        }


        selectedRequestId =
            id;


        document.getElementById(
            "requestDetails"
        ).innerHTML = `

            <div class="detail-grid">

                <div>
                    <span>Name</span>
                    <strong>
                        ${escapeHTML(
                            request.name
                        )}
                    </strong>
                </div>

                <div>
                    <span>Phone</span>
                    <strong>
                        ${escapeHTML(
                            request.phone
                        )}
                    </strong>
                </div>

                <div>
                    <span>Email</span>
                    <strong>
                        ${escapeHTML(
                            request.email ||
                            "-"
                        )}
                    </strong>
                </div>

                <div>
                    <span>Company</span>
                    <strong>
                        ${escapeHTML(
                            request.company ||
                            "-"
                        )}
                    </strong>
                </div>

                <div>
                    <span>Origin</span>
                    <strong>
                        ${escapeHTML(
                            request.origin_country
                        )}
                    </strong>
                </div>

                <div>
                    <span>Destination</span>
                    <strong>
                        ${escapeHTML(
                            request.destination_country
                        )}
                    </strong>
                </div>

                <div>
                    <span>Service</span>
                    <strong>
                        ${escapeHTML(
                            request.service_type ||
                            "-"
                        )}
                    </strong>
                </div>

                <div>
                    <span>Package</span>
                    <strong>
                        ${escapeHTML(
                            request.package_type ||
                            "-"
                        )}
                    </strong>
                </div>

                <div>
                    <span>Weight</span>
                    <strong>
                        ${
                            request.weight
                                ? `${request.weight} KG`
                                : "-"
                        }
                    </strong>
                </div>

            </div>


            <div class="request-message">

                <span>
                    Message
                </span>

                <p>
                    ${escapeHTML(
                        request.message ||
                        "No message provided."
                    )}
                </p>

            </div>

        `;


        document.getElementById(
            "updateRequestStatus"
        ).value =
            request.status;


        document.getElementById(
            "requestModal"
        ).classList.add(
            "active"
        );

    };


// ========================================
// CLOSE MODAL
// ========================================

function closeModal() {

    document.getElementById(
        "requestModal"
    ).classList.remove(
        "active"
    );

}


document
    .getElementById(
        "closeRequestModal"
    )
    .addEventListener(
        "click",
        closeModal
    );


document
    .getElementById(
        "closeRequestButton"
    )
    .addEventListener(
        "click",
        closeModal
    );


// ========================================
// UPDATE STATUS
// ========================================

document
    .getElementById(
        "saveRequestStatus"
    )
    .addEventListener(
        "click",
        updateRequestStatus
    );


async function updateRequestStatus() {

    if (!selectedRequestId) {

        return;

    }


    const status =
        document.getElementById(
            "updateRequestStatus"
        ).value;


    try {

        const response =
            await fetch(

                `${API_URL}/quotes/${selectedRequestId}/status`,

                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify({
                            status
                        })

                }

            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to update status."
            );

        }


        closeModal();

        await loadRequests();


    } catch (error) {

        alert(
            error.message
        );

    }

}


// ========================================
// SEARCH
// ========================================

document
    .getElementById(
        "searchRequest"
    )
    .addEventListener(
        "input",
        filterRequests
    );


document
    .getElementById(
        "requestStatusFilter"
    )
    .addEventListener(
        "change",
        filterRequests
    );


function filterRequests() {

    const search =
        document
            .getElementById(
                "searchRequest"
            )
            .value
            .toLowerCase();


    const status =
        document
            .getElementById(
                "requestStatusFilter"
            )
            .value;


    const filtered =
        allRequests.filter(
            request => {

                const text = [

                    request.name,

                    request.phone,

                    request.email,

                    request.destination_country,

                    request.origin_country

                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                return (

                    text.includes(
                        search
                    )

                    &&

                    (
                        !status ||
                        request.status === status
                    )

                );

            }
        );


    renderRequests(
        filtered
    );

}


// ========================================
// HELPERS
// ========================================

function formatStatus(status) {

    return status
        .replaceAll(
            "_",
            " "
        )
        .replace(
            /\b\w/g,
            letter =>
                letter.toUpperCase()
        );

}


function formatDate(date) {

    if (!date) {

        return "-";

    }


    return new Date(date)
        .toLocaleDateString();

}


function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}


// ========================================
// INITIALIZE
// ========================================

loadRequests();
