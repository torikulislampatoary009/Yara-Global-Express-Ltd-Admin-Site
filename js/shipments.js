const API_URL =
    "https://yge-backend-production.up.railway.app:5000/api";


const token =
    localStorage.getItem("yeara_token");


const user =
    JSON.parse(
        localStorage.getItem("yeara_user") || "null"
    );


// ========================================
// AUTH CHECK
// ========================================

if (!token) {

    window.location.href =
        "login.html";

}


if (user) {

    document.getElementById(
        "adminName"
    ).textContent = user.name;

}


// ========================================
// LOGOUT
// ========================================

document
    .getElementById("logoutButton")
    .addEventListener("click", logout);


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
// MODAL
// ========================================

const modal =
    document.getElementById(
        "shipmentModal"
    );


document
    .getElementById("openCreateShipment")
    .addEventListener("click", () => {

        modal.classList.add("active");

    });


document
    .getElementById("closeShipmentModal")
    .addEventListener("click", closeModal);


document
    .getElementById("cancelShipment")
    .addEventListener("click", closeModal);


function closeModal() {

    modal.classList.remove("active");

}


// ========================================
// LOAD SHIPMENTS
// ========================================

let allShipments = [];


async function loadShipments() {

    try {

        const response =
            await fetch(
                `${API_URL}/shipments`,
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
                "Failed to load shipments."
            );

        }


        allShipments =
            data.shipments || [];


        renderShipments(
            allShipments
        );


    } catch (error) {

        console.error(error);

        alert(error.message);

    }

}


// ========================================
// RENDER
// ========================================

function renderShipments(
    shipments
) {

    const tbody =
        document.getElementById(
            "shipmentTableBody"
        );


    if (shipments.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="empty-state"
                >
                    No shipments found.
                </td>

            </tr>

        `;

        return;

    }


    tbody.innerHTML =
        shipments.map(
            shipment => `

            <tr>

                <td>

                    <strong>
                        ${escapeHTML(
                            shipment.tracking_number
                        )}
                    </strong>

                </td>


                <td>
                    ${escapeHTML(
                        shipment.customer_name ||
                        shipment.sender_name
                    )}
                </td>


                <td>
                    ${escapeHTML(
                        shipment.destination_country
                    )}
                </td>


                <td>
                    ${escapeHTML(
                        shipment.service_type ||
                        "-"
                    )}
                </td>


                <td>

                    <span
                        class="status-badge status-${shipment.status}"
                    >
                        ${formatStatus(
                            shipment.status
                        )}
                    </span>

                </td>


                <td>
                    ${formatDate(
                        shipment.created_at
                    )}
                </td>


                <td>

                    <button
                        class="table-button"
                        onclick="openStatusModal(
                            ${shipment.id},
                            '${shipment.tracking_number}',
                            '${shipment.status}'
                        )"
                    >
                        Update
                    </button>

                </td>

            </tr>

        `
        ).join("");

}


// ========================================
// CREATE SHIPMENT
// ========================================

document
    .getElementById("shipmentForm")
    .addEventListener(
        "submit",
        createShipment
    );


async function createShipment(event) {

    event.preventDefault();


    const button =
        document.getElementById(
            "createShipmentButton"
        );


    const message =
        document.getElementById(
            "shipmentFormMessage"
        );


    button.disabled = true;

    button.textContent =
        "Creating...";

    message.textContent = "";


    const shipment = {

        sender_name:
            value("sender_name"),

        sender_phone:
            value("sender_phone"),

        sender_address:
            value("sender_address"),

        receiver_name:
            value("receiver_name"),

        receiver_phone:
            value("receiver_phone"),

        receiver_address:
            value("receiver_address"),

        origin_country:
            value("origin_country"),

        destination_country:
            value("destination_country"),

        service_type:
            value("service_type"),

        package_type:
            value("package_type"),

        weight:
            value("weight"),

        shipping_charge:
            value("shipping_charge"),

        estimated_delivery:
            value("estimated_delivery"),

        description:
            value("description")

    };


    try {

        const response =
            await fetch(
                `${API_URL}/shipments`,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify(
                            shipment
                        )

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to create shipment."
            );

        }


        message.className =
            "form-message success";


        message.innerHTML = `

            Shipment created successfully.

            <br>

            Tracking Number:

            <strong>
                ${data.shipment.tracking_number}
            </strong>

        `;


        document
            .getElementById(
                "shipmentForm"
            )
            .reset();


        await loadShipments();


    } catch (error) {

        message.className =
            "form-message error";

        message.textContent =
            error.message;

    } finally {

        button.disabled = false;

        button.textContent =
            "Create Shipment";

    }

}


// ========================================
// STATUS UPDATE
// ========================================

async function updateStatus(
    shipmentId,
    status,
    location,
    description
) {

    try {

        const response =
            await fetch(

                `${API_URL}/shipments/${shipmentId}/status`,

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

                            status,

                            location,

                            description

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


        alert(
            "Shipment status updated."
        );


        await loadShipments();


    } catch (error) {

        alert(error.message);

    }

}


// ========================================
// TEMPORARY STATUS UPDATE UI
// ========================================

window.openStatusModal =
    function (
        id,
        tracking,
        currentStatus
    ) {

        const status =
            prompt(
                `Tracking: ${tracking}\n\n` +
                `Current status: ${formatStatus(currentStatus)}\n\n` +
                `Enter new status:\n` +
                `booked\n` +
                `picked_up\n` +
                `processing\n` +
                `departed\n` +
                `in_transit\n` +
                `arrived\n` +
                `customs\n` +
                `out_for_delivery\n` +
                `delivered\n` +
                `cancelled`
            );


        if (!status) {
            return;
        }


        const location =
            prompt(
                "Current location:"
            );


        const description =
            prompt(
                "Status description:"
            );


        updateStatus(
            id,
            status,
            location,
            description
        );

    };


// ========================================
// SEARCH
// ========================================

document
    .getElementById("searchShipment")
    .addEventListener(
        "input",
        filterShipments
    );


document
    .getElementById("statusFilter")
    .addEventListener(
        "change",
        filterShipments
    );


function filterShipments() {

    const search =
        document
            .getElementById(
                "searchShipment"
            )
            .value
            .toLowerCase();


    const status =
        document
            .getElementById(
                "statusFilter"
            )
            .value;


    const filtered =
        allShipments.filter(
            shipment => {

                const matchesSearch =

                    shipment.tracking_number
                        .toLowerCase()
                        .includes(search)

                    ||

                    (
                        shipment.customer_name ||
                        shipment.sender_name ||
                        ""
                    )
                        .toLowerCase()
                        .includes(search)

                    ||

                    shipment.destination_country
                        .toLowerCase()
                        .includes(search);


                const matchesStatus =
                    !status ||
                    shipment.status === status;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    renderShipments(
        filtered
    );

}


// ========================================
// HELPERS
// ========================================

function value(id) {

    return document
        .getElementById(id)
        .value
        .trim();

}


function formatStatus(status) {

    return status
        .replaceAll("_", " ")
        .replace(/\b\w/g, letter =>
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

    if (value === null ||
        value === undefined) {

        return "";

    }


    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}

/*let selectedShipmentId = null;


// ========================================
// OPEN SHIPMENT
// ========================================

window.openShipment =
    async function(id) {

        selectedShipmentId = id;


        try {

            const response =
                await fetch(
                    `${API_URL}/shipments/${id}`,
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
                    "Failed to load shipment."
                );

            }


            renderShipmentDetails(
                data
            );


            document
                .getElementById(
                    "shipmentModal"
                )
                .classList.add(
                    "active"
                );


        } catch (error) {

            console.error(error);

            alert(error.message);

        }

    };

    function renderShipmentDetails(data) {

    const shipment =
        data.shipment;

    const history =
        data.tracking_history || [];


    document.getElementById(
        "modalTrackingNumber"
    ).textContent =
        shipment.tracking_number;


    const details =
        document.getElementById(
            "shipmentDetails"
        );


    details.innerHTML = `

        <div class="shipment-detail-grid">

            <div class="detail-box">

                <span>
                    Sender
                </span>

                <strong>
                    ${escapeHTML(
                        shipment.sender_name || "-"
                    )}
                </strong>

            </div>


            <div class="detail-box">

                <span>
                    Receiver
                </span>

                <strong>
                    ${escapeHTML(
                        shipment.receiver_name || "-"
                    )}
                </strong>

            </div>


            <div class="detail-box">

                <span>
                    Origin
                </span>

                <strong>
                    ${escapeHTML(
                        shipment.origin_country || "-"
                    )}
                </strong>

            </div>


            <div class="detail-box">

                <span>
                    Destination
                </span>

                <strong>
                    ${escapeHTML(
                        shipment.destination_country || "-"
                    )}
                </strong>

            </div>


            <div class="detail-box">

                <span>
                    Weight
                </span>

                <strong>
                    ${
                        shipment.weight
                            ? `${shipment.weight} KG`
                            : "-"
                    }
                </strong>

            </div>


            <div class="detail-box">

                <span>
                    Current Status
                </span>

                <strong>
                    ${formatStatus(
                        shipment.status
                    )}
                </strong>

            </div>

        </div>


        <div class="admin-tracking-history">

            <h3>
                Tracking History
            </h3>


            ${
                history.length
                    ? history.map(
                        event => `

                            <div
                                class="admin-timeline-item"
                            >

                                <div>

                                    <strong>
                                        ${formatStatus(
                                            event.status
                                        )}
                                    </strong>

                                    <span>
                                        ${escapeHTML(
                                            event.location || "-"
                                        )}
                                    </span>

                                </div>


                                <time>
                                    ${formatDateTime(
                                        event.event_time
                                    )}
                                </time>


                                <p>
                                    ${escapeHTML(
                                        event.description || ""
                                    )}
                                </p>

                            </div>

                        `
                    ).join("")
                    : `
                        <p>
                            No tracking events yet.
                        </p>
                    `
            }

        </div>

    `;

}

document
    .getElementById(
        "addTrackingEventButton"
    )
    .addEventListener(
        "click",
        addTrackingEvent
    );


async function addTrackingEvent() {

    if (!selectedShipmentId) {

        return;

    }


    const button =
        document.getElementById(
            "addTrackingEventButton"
        );


    const status =
        document.getElementById(
            "eventStatus"
        ).value;


    const location =
        document.getElementById(
            "eventLocation"
        ).value.trim();


    const description =
        document.getElementById(
            "eventDescription"
        ).value.trim();


    if (!location) {

        alert(
            "Please enter the shipment location."
        );

        return;

    }


    button.disabled = true;

    button.textContent =
        "Adding...";


    try {

        const response =
            await fetch(

                `${API_URL}/shipments/${selectedShipmentId}/tracking-events`,

                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify({

                            status,

                            location,

                            description

                        })

                }

            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to add event."
            );

        }


        document.getElementById(
            "eventLocation"
        ).value = "";


        document.getElementById(
            "eventDescription"
        ).value = "";


        await openShipment(
            selectedShipmentId
        );


        // Refresh shipment table

        await loadShipments();


    } catch (error) {

        console.error(error);

        alert(error.message);

    } finally {

        button.disabled = false;

        button.textContent =
            "Add Tracking Event";

    }

}
function closeShipmentModal() {

    document
        .getElementById(
            "shipmentModal"
        )
        .classList.remove(
            "active"
        );

}


document
    .getElementById(
        "closeShipmentModal"
    )
    .addEventListener(
        "click",
        closeShipmentModal
    );*/

/*async function loadCustomerOptions() {

    try {

        const response =
            await fetch(
                `${API_URL}/customers`,
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
                "Failed to load customers."
            );

        }


        const select =
            document.getElementById(
                "shipmentCustomer"
            );


        if (!select) {

            return;

        }


        select.innerHTML = `

            <option value="">
                Select Customer
            </option>

            ${
                data.customers.map(
                    customer => `

                        <option
                            value="${customer.id}"
                        >
                            ${escapeHTML(
                                customer.name
                            )}
                            -
                            ${escapeHTML(
                                customer.phone
                            )}
                        </option>

                    `
                ).join("")
            }

        `;


    } catch (error) {

        console.error(error);

    }

}
const shipmentData = {

    customer_id:
        document
            .getElementById(
                "shipmentCustomer"
            )
            .value,

    tracking_number:
        document
            .getElementById(
                "trackingNumber"
            )
            .value
            .trim(),

    origin_country:
        document
            .getElementById(
                "originCountry"
            )
            .value
            .trim(),

    destination_country:
        document
            .getElementById(
                "destinationCountry"
            )
            .value
            .trim(),

    service_type:
        document
            .getElementById(
                "serviceType"
            )
            .value,

    weight:
        document
            .getElementById(
                "weight"
            )
            .value

};*/

// ========================================
// INITIAL LOAD
// ========================================

loadShipments();
//loadCustomerOptions();
