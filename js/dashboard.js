const API_URL =
    "https://yge-backend-production.up.railway.app:5000/api";

//uy
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


// ========================================
// AUTH
// ========================================

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


// ========================================
// LOGOUT
// ========================================

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
// LOAD STATS
// ========================================

async function loadDashboardStats() {

    try {

        const response =
            await fetch(
                `${API_URL}/dashboard/stats`,
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
                "Failed to load dashboard."
            );

        }


        const stats =
            data.stats;


        document.getElementById(
            "totalShipments"
        ).textContent =
            stats.totalShipments;


        document.getElementById(
            "inTransit"
        ).textContent =
            stats.inTransit;


        document.getElementById(
            "delivered"
        ).textContent =
            stats.delivered;


        document.getElementById(
            "newRequests"
        ).textContent =
            stats.newRequests;


    } catch (error) {

        console.error(error);

    }

}


loadDashboardStats();
