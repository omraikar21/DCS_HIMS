const test = require("node:test");
const assert = require("node:assert/strict");
const { getAuditLogs, recordAuditEvent } = require("../controllers/auditController");

test("Audit Route & Controller Security", async (t) => {
  await t.test("recordAuditEvent rejects requests missing eventAction", async () => {
    let statusCode = null;
    let jsonResponse = null;
    const req = {
      user: { id: 1, name: "Admin", email: "admin@dcs.com", role: "ADMIN" },
      body: {},
    };
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        jsonResponse = data;
        return this;
      },
    };

    await recordAuditEvent(req, res);
    assert.equal(statusCode, 400);
    assert.equal(jsonResponse.success, false);
    assert.equal(jsonResponse.message, "eventAction is required");
  });
});
