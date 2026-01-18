// BestellServiceTest.mjs

import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { SESClient } from "@aws-sdk/client-ses";

import { handler } from "./BestellService.mjs";

// 🔹 AWS SDK Clients mocken
const dynamoMock = mockClient(DynamoDBClient);
const sesMock = mockClient(SESClient);

async function runTest() {
  // Mocks zurücksetzen (wichtig bei CI + Matrix)
  dynamoMock.reset();
  sesMock.reset();

  // 🔹 Standard-Erfolg simulieren
  dynamoMock.onAnyCommand().resolves({});
  sesMock.onAnyCommand().resolves({
    MessageId: "test-message-id",
  });

  // 🔹 Handler ausführen
  const result = await handler({ __test: true });

  // 🔹 Simple Assertions
  if (!result || result.statusCode >= 400) {
    throw new Error("BestellService Test fehlgeschlagen");
  }

  console.log("✅ Test OK", result);
}

runTest().catch((e) => {
  console.error("❌ Test FAIL", e);
  process.exit(1);
});
