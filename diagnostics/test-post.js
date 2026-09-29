// Pakshi Expenses — temporary POST diagnostic
// Run this in Scriptable to test Apps Script write access directly.
// This bypasses the WebView/action bridge.
// It creates one clearly marked test expense, verifies it, then deletes it.

const WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycby6y7EupqeN98NgD63DQS8WXH-M5k6GT5dZJ5QrSgaYml9Jq90TgZr2yF_S83mqthre/exec";

function today() {
  return new Date().toISOString().slice(0, 10);
}

async function post(action, payload) {
  const request = new Request(WEB_APP_URL);
  request.method = "POST";
  request.headers = {
    "Content-Type": "application/json"
  };
  request.body = JSON.stringify({
    action,
    ...payload
  });

  const raw = await request.loadString();

  console.log("");
  console.log("ACTION:", action);
  console.log("RAW RESPONSE:");
  console.log(raw);

  try {
    const result = JSON.parse(raw);

    if (!result.ok) {
      throw new Error(result.error || "Backend returned ok=false");
    }

    return result;
  } catch (error) {
    throw new Error("Invalid backend response: " + error.message);
  }
}

async function run() {
  console.log("========================================");
  console.log("PAKSHI DIRECT POST DIAGNOSTIC");
  console.log("========================================");

  const testId =
    "PAKSHI-TEST-" + Date.now().toString(36);

  const expense = {
    id: testId,
    date: today(),
    amount: 1,
    categoryId: "food",
    description: "PAKSHI TEST - DELETE ME",
    paymentMethod: "card",
    paidBy: "member-1",
    notes: "Temporary diagnostic expense",
    createdAt: new Date().toISOString()
  };

  try {
    console.log("Creating temporary expense...");
    console.log(JSON.stringify(expense, null, 2));

    await post("saveExpense", { expense });

    console.log("");
    console.log("SAVE: SUCCESS");

    console.log("");
    console.log("Verifying with bootstrap...");

    const bootstrapRequest = new Request(
      WEB_APP_URL + "?action=bootstrap"
    );

    const bootstrapRaw = await bootstrapRequest.loadString();

    console.log("BOOTSTRAP RESPONSE:");
    console.log(bootstrapRaw);

    const bootstrap = JSON.parse(bootstrapRaw);

    const found = (bootstrap.expenses || []).find(
      x => String(x.id) === String(testId)
    );

    if (!found) {
      throw new Error(
        "Save returned success, but the test expense was not found in bootstrap."
      );
    }

    console.log("");
    console.log("VERIFY: SUCCESS");
    console.log("Test expense exists in backend.");

    console.log("");
    console.log("Deleting temporary expense...");

    await post("deleteExpense", {
      id: testId
    });

    console.log("");
    console.log("DELETE: SUCCESS");
    console.log("");
    console.log("========================================");
    console.log("DIRECT POST TEST: PASSED");
    console.log("========================================");

  } catch (error) {
    console.log("");
    console.log("========================================");
    console.log("DIRECT POST TEST: FAILED");
    console.log("========================================");
    console.log(String(error));

    // Best-effort cleanup if the save succeeded but a later step failed.
    try {
      console.log("");
      console.log("Attempting cleanup...");
      await post("deleteExpense", { id: testId });
      console.log("Cleanup succeeded.");
    } catch (cleanupError) {
      console.log("Cleanup failed:");
      console.log(String(cleanupError));
      console.log("If the test expense was created, delete it manually.");
    }
  }
}

await run();
