import { login, logout } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {

    const loginBtn = document.getElementById("btnLogin");

    if (loginBtn) {
        loginBtn.addEventListener("click", () => {
            login();
        });
    }

});
