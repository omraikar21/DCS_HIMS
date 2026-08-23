const test = require("node:test");
const assert = require("node:assert/strict");
const { authorizeRoles } = require("../middleware/roleMiddleware");

test("Role-Based Access Control (RBAC) Middleware", async (t) => {
  const createMockReqRes = (userRole) => {
    const req = {
      user: userRole ? { id: 1, email: "user@dcs.com", role: userRole } : null,
    };
    let statusCode = null;
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
    let nextCalled = false;
    const next = () => {
      nextCalled = true;
    };
    return { req, res, next, getStatus: () => statusCode, getJson: () => jsonResponse, wasNextCalled: () => nextCalled };
  };

  await t.test("Unauthenticated user is denied with 401", () => {
    const middleware = authorizeRoles("ADMIN", "HR");
    const { req, res, next, getStatus, wasNextCalled } = createMockReqRes(null);

    middleware(req, res, next);
    assert.equal(wasNextCalled(), false);
    assert.equal(getStatus(), 401);
  });

  await t.test("SUPER_ADMIN and ADMIN bypass all role checks", () => {
    const middleware = authorizeRoles("FINANCE");
    
    // Admin
    const adminMock = createMockReqRes("ADMIN");
    middleware(adminMock.req, adminMock.res, adminMock.next);
    assert.equal(adminMock.wasNextCalled(), true);

    // Super Admin
    const superAdminMock = createMockReqRes("SUPER_ADMIN");
    middleware(superAdminMock.req, superAdminMock.res, superAdminMock.next);
    assert.equal(superAdminMock.wasNextCalled(), true);
  });

  await t.test("Allowed role is granted access", () => {
    const middleware = authorizeRoles("HR", "FINANCE");
    const hrMock = createMockReqRes("HR");
    middleware(hrMock.req, hrMock.res, hrMock.next);
    assert.equal(hrMock.wasNextCalled(), true);
  });

  await t.test("Unauthorized role is denied with 403", () => {
    const middleware = authorizeRoles("HR");
    const employeeMock = createMockReqRes("EMPLOYEE");
    middleware(employeeMock.req, employeeMock.res, employeeMock.next);
    assert.equal(employeeMock.wasNextCalled(), false);
    assert.equal(employeeMock.getStatus(), 403);
  });
});
