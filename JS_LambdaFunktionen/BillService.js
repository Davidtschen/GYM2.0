const { DynamoDBClient } = import("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand, PutCommand } = import("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = import("uuid");

const client = new DynamoDBClient();
const doc = DynamoDBDocumentClient.from(client);

const INVENTORY_TABLE = process.env.INVENTORY_TABLE;
const ORDER_TABLE = process.env.ORDER_TABLE;

exports.handler = async (event) => {
    const { produkt_id, p_name, preis, member_id } = JSON.parse(event.body);

    // 1) Lagerbestand atomar reduzieren
    try {
        await doc.send(
            new UpdateCommand({
                TableName: INVENTORY_TABLE,
                Key: { produkt_id },
                UpdateExpression: "SET aktuelle_anzahl = aktuelle_anzahl - :one",
                ConditionExpression: "aktuelle_anzahl > :zero",
                ExpressionAttributeValues: {
                    ":one": 1,
                    ":zero": 0
                },
                ReturnValues: "UPDATED_NEW"
            })
        );
    } catch (err) {
        if (err.name === "ConditionalCheckFailedException") {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Nicht genug Bestand" })
            };
        }
        throw err;
    }

    // 2) Order / Log schreiben
    const order = {
        order_id: uuidv4(),
        produkt_id,
        p_name,
        preis,
        member_id,
        order_date: new Date().toISOString()
    };

    await doc.send(
        new PutCommand({
            TableName: ORDER_TABLE,
            Item: order
        })
    );

    return {
        statusCode: 200,
        body: JSON.stringify(order)
    };
};
