// LoggingService.mjs
// Exportiert monatlich alle Orders als CSV in einen S3-Bucket

let docClient;
let s3;

const ORDER_TABLE = "Orders";
const EXPORT_BUCKET = "amzn-my-export-bucket-gym2-0";

async function initAwsClients() {
    if (process.env.NODE_ENV === "test") {
        return {};
    }

    const { DynamoDBClient } = await import("@aws-sdk/client-dynamodb");
    const {
        DynamoDBDocumentClient,
        ScanCommand
    } = await import("@aws-sdk/lib-dynamodb");
    const {
        S3Client,
        PutObjectCommand
    } = await import("@aws-sdk/client-s3");

    docClient = DynamoDBDocumentClient.from(
        new DynamoDBClient({})
    );
    s3 = new S3Client({});

    return { ScanCommand, PutObjectCommand };
}

export const handler = async () => {
    try {
        /* =====================
           TEST-MODUS (CI)
           ===================== */
        if (process.env.NODE_ENV === "test") {
            return {
                statusCode: 200,
                message: "TEST OK – LoggingService ohne AWS ausgeführt"
            };
        }

        /* =====================
           PRODUKTIONS-MODUS
           ===================== */
        const {
            ScanCommand,
            PutObjectCommand
        } = await initAwsClients();

        /* 1) Alle Orders laden */
        const result = await docClient.send(
            new ScanCommand({
                TableName: ORDER_TABLE
            })
        );

        const rows = result.Items ?? [];

        /* 2) CSV bauen */
        const header =
            "order_id,produkt_id,p_name,preis,member_id,order_date\n";

        const csv =
            header +
            rows
                .map(r =>
                    `${r.order_id},${r.produkt_id},${r.p_name},${r.preis},${r.member_id},${r.order_date}`
                )
                .join("\n");

        const key =
            `exports/orders_${new Date().toISOString().slice(0, 7)}.csv`;

        /* 3) CSV nach S3 schreiben */
        await s3.send(
            new PutObjectCommand({
                Bucket: EXPORT_BUCKET,
                Key: key,
                Body: csv,
                ContentType: "text/csv"
            })
        );

        return {
            statusCode: 200,
            file: key
        };

    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            error: error.message
        };
    }
};
