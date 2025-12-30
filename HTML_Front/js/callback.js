const params = new URLSearchParams(window.location.search);
const code = params.get("code");
const statusText = document.getElementById("statusText");

if (!code) {
    statusText.innerHTML = `
        <span class="error">
            Login fehlgeschlagen.<br>
            Ungültige oder fehlende Authentifizierung.<br><br>
            Du wirst in 10 Sekunden zurückgeleitet…
        </span>
    `;

    setTimeout(() => {
        window.location.href = "home.html";
    }, 10000);

} else {
    statusText.innerHTML = `
        <span class="success">
            Login erfolgreich.<br>
            Weiterleitung…
        </span>
    `;
    setTimeout(() => {
        window.location.href = "home.html";
    }, 1500);
}
