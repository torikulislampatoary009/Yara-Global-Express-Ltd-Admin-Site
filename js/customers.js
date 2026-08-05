const API_URL =
    "http://localhost:5000/api";


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


let customers = [];

let editingCustomerId = null;


// ========================================
// LOGOUT
// ========================================

document
    .getElementById("logoutButton")
    .addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                "yeara_token"
            );

            localStorage.removeItem(
                "yeara_user"
            );

            window.location.href =
                "login.html";

        }
    );


// ========================================
// LOAD CUSTOMERS
// ========================================

async function loadCustomers() {

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


        customers =
            data.customers || [];


        renderCustomers(
            customers
        );


    } catch (error) {

        console.error(error);

        alert(error.message);

    }

}


// ========================================
// RENDER
// ========================================

function renderCustomers(
    list
) {

    const tbody =
        document.getElementById(
            "customerTableBody"
        );


    if (!list.length) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="empty-state"
                >
                    No customers found.
                </td>

            </tr>

        `;

        return;

    }


    tbody.innerHTML =
        list.map(
            customer => `

                <tr>

                    <td>

                        <strong>
                            ${escapeHTML(
                                customer.name
                            )}
                        </strong>

                        ${
                            customer.email
                                ? `
                                    <br>

                                    <small>
                                        ${escapeHTML(
                                            customer.email
                                        )}
                                    </small>
                                `
                                : ""
                        }

                    </td>


                    <td>
                        ${escapeHTML(
                            customer.phone
                        )}
                    </td>


                    <td>
                        ${escapeHTML(
                            customer.company ||
                            "-"
                        )}
                    </td>


                    <td>

                        ${escapeHTML(
                            customer.city ||
                            "-"
                        )}

                        ${
                            customer.country
                                ? `
                                    , ${escapeHTML(
                                        customer.country
                                    )}
                                  `
                                : ""
                        }

                    </td>


                    <td>

                        <strong>
                            ${customer.shipment_count || 0}
                        </strong>

                    </td>


                    <td>

                        <button
                            class="table-button"
                            onclick="viewCustomer(${customer.id})"
                        >
                            View
                        </button>


                        <button
                            class="table-button"
                            onclick="editCustomer(${customer.id})"
                        >
                            Edit
                        </button>

                    </td>

                </tr>

            `
        ).join("");

}


// ========================================
// ADD CUSTOMER
// ========================================

document
    .getElementById(
        "addCustomerButton"
    )
    .addEventListener(
        "click",
        openAddCustomer
    );


function openAddCustomer() {

    editingCustomerId = null;


    document.getElementById(
        "customerModalTitle"
    ).textContent =
        "Add Customer";


    document.getElementById(
        "customerForm"
    ).reset();


    document.getElementById(
        "customerCountry"
    ).value =
        "Bangladesh";


    document.getElementById(
        "customerModal"
    ).classList.add(
        "active"
    );

}


// ========================================
// EDIT CUSTOMER
// ========================================

window.editCustomer =
    async function(id) {

        const customer =
            customers.find(
                item =>
                    item.id === id
            );


        if (!customer) {

            return;

        }


        editingCustomerId = id;


        document.getElementById(
            "customerModalTitle"
        ).textContent =
            "Edit Customer";


        document.getElementById(
            "customerName"
        ).value =
            customer.name || "";


        document.getElementById(
            "customerPhone"
        ).value =
            customer.phone || "";


        document.getElementById(
            "customerEmail"
        ).value =
            customer.email || "";


        document.getElementById(
            "customerCompany"
        ).value =
            customer.company || "";


        document.getElementById(
            "customerCity"
        ).value =
            customer.city || "";


        document.getElementById(
            "customerCountry"
        ).value =
            customer.country || "";


        document.getElementById(
            "customerAddress"
        ).value =
            customer.address || "";


        document.getElementById(
            "customerModal"
        ).classList.add(
            "active"
        );

    };


// ========================================
// SAVE CUSTOMER
// ========================================

document
    .getElementById(
        "customerForm"
    )
    .addEventListener(
        "submit",
        saveCustomer
    );


async function saveCustomer(event) {

    event.preventDefault();


    const button =
        document.getElementById(
            "saveCustomerButton"
        );


    const customerData = {

        name:
            document.getElementById(
                "customerName"
            ).value.trim(),

        phone:
            document.getElementById(
                "customerPhone"
            ).value.trim(),

        email:
            document.getElementById(
                "customerEmail"
            ).value.trim(),

        company:
            document.getElementById(
                "customerCompany"
            ).value.trim(),

        city:
            document.getElementById(
                "customerCity"
            ).value.trim(),

        country:
            document.getElementById(
                "customerCountry"
            ).value.trim(),

        address:
            document.getElementById(
                "customerAddress"
            ).value.trim()

    };


    button.disabled = true;

    button.textContent =
        "Saving...";


    try {

        const url =
            editingCustomerId

                ? `${API_URL}/customers/${editingCustomerId}`

                : `${API_URL}/customers`;


        const method =
            editingCustomerId
                ? "PUT"
                : "POST";


        const response =
            await fetch(
                url,
                {

                    method,

                    headers: {

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify(
                            customerData
                        )

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to save customer."
            );

        }

        /*  message.className =
            "quote-form-message success";


        message.textContent =
            "Thank you! Your request has been submitted successfully. Our team will contact you shortly.";
        */
       
        customerForm.reset();

        //closeCustomerModal();

        await loadCustomers();


    } catch (error) {

        console.error(error);

        alert(error.message);

    } finally {

        button.disabled = false;

        button.textContent =
            "Save Customer";

    }

}


// ========================================
// VIEW CUSTOMER
// ========================================

window.viewCustomer =
    async function(id) {

        try {

            const response =
                await fetch(
                    `${API_URL}/customers/${id}`,
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
                    "Failed to load customer."
                );

            }


            renderCustomerDetails(
                data
            );


            document
                .getElementById(
                    "customerDetailsModal"
                )
                .classList.add(
                    "active"
                );


        } catch (error) {

            alert(error.message);

        }

    };


// ========================================
// CUSTOMER DETAILS
// ========================================

function renderCustomerDetails(
    data
) {

    const customer =
        data.customer;

    const shipments =
        data.shipments || [];


    document.getElementById(
        "detailsCustomerName"
    ).textContent =
        customer.name;


    document.getElementById(
        "customerDetails"
    ).innerHTML = `

        <div class="customer-profile-grid">

            <div>

                <span>
                    Phone
                </span>

                <strong>
                    ${escapeHTML(
                        customer.phone
                    )}
                </strong>

            </div>


            <div>

                <span>
                    Email
                </span>

                <strong>
                    ${escapeHTML(
                        customer.email || "-"
                    )}
                </strong>

            </div>


            <div>

                <span>
                    Company
                </span>

                <strong>
                    ${escapeHTML(
                        customer.company || "-"
                    )}
                </strong>

            </div>


            <div>

                <span>
                    City
                </span>

                <strong>
                    ${escapeHTML(
                        customer.city || "-"
                    )}
                </strong>

            </div>


            <div class="full-width">

                <span>
                    Address
                </span>

                <strong>
                    ${escapeHTML(
                        customer.address || "-"
                    )}
                </strong>

            </div>

        </div>


        <div class="customer-shipment-section">

            <h3>
                Shipment History
            </h3>


            ${
                shipments.length

                    ? `

                        <div class="table-wrapper">

                            <table>

                                <thead>

                                    <tr>

                                        <th>
                                            Tracking
                                        </th>

                                        <th>
                                            Route
                                        </th>

                                        <th>
                                            Service
                                        </th>

                                        <th>
                                            Weight
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    ${shipments.map(
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
                                                        shipment.origin_country ||
                                                        "-"
                                                    )}

                                                    →

                                                    ${escapeHTML(
                                                        shipment.destination_country ||
                                                        "-"
                                                    )}

                                                </td>


                                                <td>
                                                    ${escapeHTML(
                                                        shipment.service_type ||
                                                        "-"
                                                    )}
                                                </td>


                                                <td>
                                                    ${
                                                        shipment.weight
                                                            ? `${shipment.weight} KG`
                                                            : "-"
                                                    }
                                                </td>


                                                <td>

                                                    <span
                                                        class="
                                                            status-badge
                                                            status-${shipment.status}
                                                        "
                                                    >
                                                        ${formatStatus(
                                                            shipment.status
                                                        )}
                                                    </span>

                                                </td>

                                            </tr>

                                        `
                                    ).join("")}

                                </tbody>

                            </table>

                        </div>

                    `

                    : `

                        <p class="empty-state">
                            This customer has no shipments yet.
                        </p>

                    `
            }

        </div>

    `;

}


// ========================================
// CLOSE MODALS
// ========================================

function closeCustomerModal() {

    document
        .getElementById(
            "customerModal"
        )
        .classList.remove(
            "active"
        );

}


document
    .getElementById(
        "closeCustomerModal"
    )
    .addEventListener(
        "click",
        closeCustomerModal
    );


document
    .getElementById(
        "cancelCustomerButton"
    )
    .addEventListener(
        "click",
        closeCustomerModal
    );


document
    .getElementById(
        "closeDetailsModal"
    )
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "customerDetailsModal"
                )
                .classList.remove(
                    "active"
                );

        }
    );


// ========================================
// SEARCH
// ========================================

document
    .getElementById(
        "customerSearch"
    )
    .addEventListener(
        "input",
        filterCustomers
    );


function filterCustomers() {

    const search =
        document
            .getElementById(
                "customerSearch"
            )
            .value
            .toLowerCase();


    const filtered =
        customers.filter(
            customer => {

                const text = [

                    customer.name,

                    customer.phone,

                    customer.email,

                    customer.company,

                    customer.city,

                    customer.country

                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                return text.includes(
                    search
                );

            }
        );


    renderCustomers(
        filtered
    );

}


// ========================================
// HELPERS
// ========================================

function formatStatus(status) {

    if (!status) {

        return "-";

    }


    return status
        .replaceAll("_", " ")
        .replace(
            /\b\w/g,
            letter =>
                letter.toUpperCase()
        );

}


function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


// ========================================
// INITIALIZE
// ========================================

loadCustomers();