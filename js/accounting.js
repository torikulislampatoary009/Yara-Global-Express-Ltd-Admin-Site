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


let transactions = [];


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
// LOAD SUMMARY
// ========================================

async function loadSummary() {

    const response =
        await fetch(
            `${API_URL}/accounting/summary`,
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
            data.message
        );

    }


    const summary =
        data.summary;


    document.getElementById(
        "totalIncome"
    ).textContent =
        formatMoney(
            summary.total_income
        );


    document.getElementById(
        "totalExpense"
    ).textContent =
        formatMoney(
            summary.total_expense
        );


    document.getElementById(
        "totalProfit"
    ).textContent =
        formatMoney(
            summary.total_profit
        );


    document.getElementById(
        "totalDue"
    ).textContent =
        formatMoney(
            summary.total_due
        );

}


// ========================================
// LOAD TRANSACTIONS
// ========================================

async function loadTransactions() {

    const response =
        await fetch(
            `${API_URL}/accounting/transactions`,
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
            data.message
        );

    }


    transactions =
        data.transactions || [];


    renderTransactions(
        transactions
    );

}


// ========================================
// RENDER
// ========================================

function renderTransactions(
    list
) {

    const tbody =
        document.getElementById(
            "transactionTableBody"
        );


    if (!list.length) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="empty-state"
                >
                    No transactions found.
                </td>

            </tr>

        `;

        return;

    }


    tbody.innerHTML =
        list.map(
            transaction => `

                <tr>

                    <td>
                        ${formatDate(
                            transaction.transaction_date
                        )}
                    </td>


                    <td>

                        <span
                            class="
                                transaction-type
                                ${transaction.transaction_type}
                            "
                        >
                            ${formatStatus(
                                transaction.transaction_type
                            )}
                        </span>

                    </td>


                    <td>
                        ${escapeHTML(
                            transaction.category
                        )}
                    </td>


                    <td>
                        ${escapeHTML(
                            transaction.customer_name ||
                            "-"
                        )}
                    </td>


                    <td>
                        ${escapeHTML(
                            transaction.tracking_number ||
                            "-"
                        )}
                    </td>


                    <td>

                        <strong>

                            ${
                                transaction.transaction_type ===
                                "income"
                                    ? "+"
                                    : "-"
                            }

                            ${formatMoney(
                                transaction.amount
                            )}

                        </strong>

                    </td>


                    <td>

                        <span
                            class="
                                status-badge
                                status-${transaction.payment_status}
                            "
                        >
                            ${formatStatus(
                                transaction.payment_status
                            )}
                        </span>

                    </td>

                </tr>

            `
        ).join("");

}


// ========================================
// OPEN MODAL
// ========================================

document
    .getElementById(
        "addTransactionButton"
    )
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "transactionModal"
                )
                .classList.add(
                    "active"
                );


            document.getElementById(
                "transactionDate"
            ).value =
                new Date()
                    .toISOString()
                    .split("T")[0];

        }
    );


// ========================================
// CLOSE MODAL
// ========================================

function closeTransactionModal() {

    document
        .getElementById(
            "transactionModal"
        )
        .classList.remove(
            "active"
        );

}


document
    .getElementById(
        "closeTransactionModal"
    )
    .addEventListener(
        "click",
        closeTransactionModal
    );


document
    .getElementById(
        "cancelTransactionButton"
    )
    .addEventListener(
        "click",
        closeTransactionModal
    );


// ========================================
// CREATE TRANSACTION
// ========================================

document
    .getElementById(
        "transactionForm"
    )
    .addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const payload = {

                transaction_type:
                    document.getElementById(
                        "transactionType"
                    ).value,

                category:
                    document.getElementById(
                        "transactionCategory"
                    ).value,

                amount:
                    document.getElementById(
                        "transactionAmount"
                    ).value,

                payment_status:
                    document.getElementById(
                        "paymentStatus"
                    ).value,

                payment_method:
                    document.getElementById(
                        "paymentMethod"
                    ).value,

                description:
                    document.getElementById(
                        "transactionDescription"
                    ).value.trim(),

                transaction_date:
                    document.getElementById(
                        "transactionDate"
                    ).value

            };


            try {

                const response =
                    await fetch(
                        `${API_URL}/accounting/transactions`,
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
                                    payload
                                )

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message
                    );

                }


                document
                    .getElementById(
                        "transactionForm"
                    )
                    .reset();


                closeTransactionModal();


                await loadSummary();

                await loadTransactions();


            } catch (error) {

                alert(
                    error.message
                );

            }

        }
    );


// ========================================
// SEARCH
// ========================================

document
    .getElementById(
        "transactionSearch"
    )
    .addEventListener(
        "input",
        event => {

            const search =
                event.target.value
                    .toLowerCase();


            const filtered =
                transactions.filter(
                    transaction => {

                        const text = [

                            transaction.category,

                            transaction.description,

                            transaction.customer_name,

                            transaction.tracking_number,

                            transaction.transaction_type

                        ]
                            .filter(Boolean)
                            .join(" ")
                            .toLowerCase();


                        return text.includes(
                            search
                        );

                    }
                );


            renderTransactions(
                filtered
            );

        }
    );


// ========================================
// HELPERS
// ========================================

function formatMoney(amount) {

    return new Intl.NumberFormat(
        "en-US",
        {

            style: "currency",

            currency: "USD"

        }
    ).format(
        Number(amount || 0)
    );

}


function formatDate(value) {

    if (!value) {

        return "-";

    }


    return new Date(
        value
    ).toLocaleDateString();

}


function formatStatus(value) {

    if (!value) {

        return "-";

    }


    return value
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

(async function init() {

    try {

        await loadSummary();

        await loadTransactions();

    } catch (error) {

        console.error(error);

        alert(error.message);

    }

})();
