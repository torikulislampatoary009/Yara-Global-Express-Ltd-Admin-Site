const loginForm = document.getElementById("loginForm");

const loginError = document.getElementById("loginError");

const loginButton = document.getElementById("loginButton");
//kj

const API_URL = "https://yge-backend.onrender.com/api";


loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;


    loginError.textContent = "";

    loginButton.disabled = true;

    loginButton.textContent = "Signing in...";


    try {

        const response = await fetch(
            `${API_URL}/auth/login`,
            {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email,
                    password
                })

            }
        );


        const data = await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.message || "Login failed."
            );

        }


        // Store authentication

        localStorage.setItem(
            "yeara_token",
            data.token
        );


        localStorage.setItem(
            "yeara_user",
            JSON.stringify(data.user)
        );


        // Redirect

        window.location.href =
            "dashboard.html";


    } catch (error) {

        loginError.textContent =
            error.message;

    } finally {

        loginButton.disabled = false;

        loginButton.textContent = "Sign In";

    }

});
