const status = localStorage.getItem("orderStatus");
const text = document.getElementById("orderText");

if (status === "success") {
    text.innerHTML = `
        <span class="success">
            Kauf erfolgreich.<br>
            Bitte entnehmen Sie Ihr Produkt<br><br>
        </span>
    `;
} else {
    text.innerHTML = `
        <span class="error">
            Kauf fehlgeschlagen.<br>
            Der gewählte Produkttyp ist nicht mehr vorhanden<br><br>
        </span>
    `;
}

setTimeout(() => {
    window.location.href = "snackMaschine.html";
}, 10000);
