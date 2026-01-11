const LAMBDA_URL = "https://h6a15phvcf.execute-api.eu-north-1.amazonaws.com/buy";

export async function orderSnack(product_id) {
    if (!product_id) {
        alert("Ungültiges Produkt");
        return;
    }

    try {
        const response = await fetch(LAMBDA_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ produkt_id: product_id })
        });

        if (!response.ok) {
            localStorage.setItem("orderStatus", "error");
            window.location.href = "order.html";
            return;
        }

        localStorage.setItem("orderStatus", "success");
        window.location.href = "order.html";

    } catch (error) {
        console.error("Fehler:", error);
        localStorage.setItem("orderStatus", "error");
        window.location.href = "order.html";
    }
}

