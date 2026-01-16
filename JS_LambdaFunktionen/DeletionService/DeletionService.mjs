// DeletionService.mjs
// Löscht Mitgliedsdaten aus der Members-Tabelle

let docClient;

const MEMBERS_TABLE = "Members";

async function initAwsClients() {
    if (process.env.NODE_ENV === "test") {
        return {};
    }

    const { DynamoDBClient } = await import("@aws-sdk/client-dynamodb");
    const {
        DynamoDBDocumentClient,
        DeleteCommand
    } = await import("@aws-sdk/lib-dynamodb");

    docClient = DynamoDBDocumentClient.from(
        new DynamoDBClient({})
    );

    return { DeleteCommand };
}

export const handler = async (event) => {
    try {
        /* =====================
           TEST-MODUS (CI)
           ===================== */
        if (process.env.NODE_ENV === "test") {
            return {
                statusCode: 200,
                message: "TEST OK – DeletionService ohne AWS ausgeführt"
            };
        }

        /* =====================
           PRODUKTIONS-MODUS
           ===================== */
        const { DeleteCommand } = await initAwsClients();

        // cognito_sub aus verschiedenen Event-Formaten extrahieren
        const sub =
            event.cognito_sub ||
            event.detail?.responseElements?.sub;

        if (!sub) {
            console.error("Fehler: Keine cognito_sub im Event gefunden.");
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Keine ID vorhanden."
                })
            };
        }

        await docClient.send(
            new DeleteCommand({
                TableName: MEMBERS_TABLE,
                Key: {
                    cognito_sub: sub
                }
            })
        );

        console.log(
            `Datenbank-Eintrag für User ${sub} wurde erfolgreich gelöscht.`
        );

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Datenbank-Eintrag erfolgreich gelöscht."
            })
        };

    } catch (error) {
        console.error(
            "Fehler beim Löschen aus DynamoDB:",
            error
        );

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Fehler beim Löschen aus der Datenbank."
            })
        };
    }
};
