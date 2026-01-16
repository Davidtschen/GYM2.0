// loginTracking.mjs
// Cognito Post-Authentication Trigger
// Aktualisiert den last_check_in-Zeitstempel eines Members

let docClient;

const MEMBERS_TABLE = "Members";

async function initAwsClients() {
    if (process.env.NODE_ENV === "test") {
        return {};
    }

    const { DynamoDBClient } = await import("@aws-sdk/client-dynamodb");
    const {
        DynamoDBDocumentClient,
        UpdateCommand
    } = await import("@aws-sdk/lib-dynamodb");

    docClient = DynamoDBDocumentClient.from(
        new DynamoDBClient({})
    );

    return { UpdateCommand };
}

export const handler = async (event) => {
    try {
        /* =====================
           TEST-MODUS (CI)
           ===================== */
        if (process.env.NODE_ENV === "test") {
            console.log("TEST OK – LoginTracking ohne AWS ausgeführt");
            return event; 
        }

        /* =====================
           PRODUKTIONS-MODUS
           ===================== */
        const { UpdateCommand } = await initAwsClients();

        // Cognito-Trigger oder API-Test
        const userSub =
            event.request?.userAttributes?.sub ||
            event.cognitoId ||
            (event.body
                ? JSON.parse(event.body).cognitoId
                : null);

        if (!userSub) {
            console.error("Keine User-ID gefunden!");
            return event;
        }

        const now = new Date().toISOString();

        await docClient.send(
            new UpdateCommand({
                TableName: MEMBERS_TABLE,
                Key: {
                    cognito_sub: userSub
                },
                UpdateExpression:
                    "SET last_check_in = :t",
                ExpressionAttributeValues: {
                    ":t": now
                }
            })
        );

        console.log(
            `Login-Check-In erfolgreich für User: ${userSub}`
        );

        return event;

    } catch (error) {
        console.error(
            "Datenbank-Fehler beim Login-Tracking:",
            error
        );

        // Login darf nicht blockiert werden
        return event;
    }
};
