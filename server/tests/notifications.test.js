const test = require("node:test");
const assert = require("node:assert/strict");
const { markRead, deleteAnnouncement } = require("../controllers/notificationController");

test("Notification & Announcement Controller Tests", async (t) => {
  const createMockReqRes = (params = {}, body = {}, user = null) => {
    const req = {
      params,
      body,
      user: user || { id: 1, email: "omraikar2128@gmail.com", role: "ADMIN" },
    };
    let statusCode = 200;
    let jsonResponse = null;
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
    return { req, res, getStatus: () => statusCode, getJson: () => jsonResponse };
  };

  await t.test("markRead returns 404/denied when notification not found or unowned", async () => {
    const mock = createMockReqRes({ id: 999999 }, {}, { id: 2, email: "other@dcs.com", role: "EMPLOYEE" });
    await markRead(mock.req, mock.res);
    // Since id 999999 does not exist, status should be 404 or 500
    assert.ok(mock.getStatus() === 404 || mock.getStatus() === 500);
  });

  await t.test("deleteAnnouncement returns 400 when announcement does not exist", async () => {
    const mock = createMockReqRes({ id: 999999 }, {}, { id: 1, email: "admin@dcs.com", role: "ADMIN" });
    await deleteAnnouncement(mock.req, mock.res);
    assert.equal(mock.getStatus(), 400);
    assert.equal(mock.getJson().success, false);
  });
});
