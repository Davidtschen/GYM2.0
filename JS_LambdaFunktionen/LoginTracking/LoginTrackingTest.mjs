// LoginTrackingTest.mjs
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const docMock = mockClient(DynamoDBDocumentClient);

/* -------------------------
   Base Events
-------------------------- */
const cognitoEvent = {
  request: {
    userAttributes: {
      sub: "cognito-sub-1",
    },
  },
};

const apiEvent = {
  cognitoId: "api-sub-1",
};

const bodyEvent = {
  body: JSON.stringify({ cognitoId: "body-sub-1" }),
};

async function runTest() {
  /* 1) Keine User-ID */
  {
    docMock.reset();
    docMock.on(UpdateCommand).callsFake(() => {
      throw new Error("UpdateCommand darf hier nicht aufgerufen werden");
    });

    //  Dateiname in import: vermutlich loginTracking.mjs (case-sensitive!)
    const { handler } = await import("./LoginTracking.mjs");

    //  Kein Crash: request/userAttributes existieren, aber ohne sub
    const res = await handler({ request: { userAttributes: {} } });

    void res;
  }

  /* 2) Cognito Post-Auth */
  {
    docMock.reset();
    docMock.on(UpdateCommand).resolves({});

    const { handler } = await import("./LoginTracking.mjs");
    const res = await handler(cognitoEvent);

    if (docMock.commandCalls(UpdateCommand).length < 1) {
      throw new Error("Test 2 fehlgeschlagen: UpdateCommand nicht aufgerufen");
    }
    if (res !== cognitoEvent) {
      throw new Error("Test 2 fehlgeschlagen: Event nicht zurückgegeben");
    }
  }

  /* 3) API Event */
  {
    docMock.reset();
    docMock.on(UpdateCommand).resolves({});

    const { handler } = await import("./LoginTracking.mjs");
    const res = await handler(apiEvent);

    if (docMock.commandCalls(UpdateCommand).length < 1) {
      throw new Error("Test 3 fehlgeschlagen: UpdateCommand nicht aufgerufen");
    }
    if (res !== apiEvent) {
      throw new Error("Test 3 fehlgeschlagen: Event nicht zurückgegeben");
    }
  }

  /* 4) body Event */
  {
    docMock.reset();
    docMock.on(UpdateCommand).resolves({});

    const { handler } = await import("./LoginTracking.mjs");
    const res = await handler(bodyEvent);

    if (docMock.commandCalls(UpdateCommand).length < 1) {
      throw new Error("Test 4 fehlgeschlagen: UpdateCommand nicht aufgerufen");
    }
    if (res !== bodyEvent) {
      throw new Error("Test 4 fehlgeschlagen: Event nicht zurückgegeben");
    }
  }

  /* 5) DynamoDB-Fehler */
  {
    docMock.reset();
    docMock.on(UpdateCommand).rejects(new Error("DynamoDB down"));

    const { handler } = await import("./LoginTracking.mjs");
    const res = await handler(cognitoEvent);

    if (res !== cognitoEvent) {
      throw new Error("Test 5 fehlgeschlagen: Event muss trotz Fehler zurückgegeben werden");
    }
  }

  console.log(" Test OK");
}

runTest().catch((e) => {
  console.error(" Test FAIL", e);
  process.exit(1);
});
