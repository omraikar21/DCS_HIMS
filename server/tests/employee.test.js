const test = require("node:test");
const assert = require("node:assert/strict");
const { provisionEmployeeAccount } = require("../services/employeeService");

test("Employee Account Provisioning Service", async (t) => {
  await t.test("Returns null fields when autoCreateUser is false", async () => {
    const result = await provisionEmployeeAccount({
      firstName: "Test",
      lastName: "User",
      email: "test.manual@example.com",
      designation: "Software Engineer",
      autoCreateUser: false,
    });

    assert.equal(result.userId, null);
    assert.equal(result.generatedPassword, null);
  });

  await t.test("Determines correct roles from employee designations", async () => {
    // Admin designation
    const adminCheck = await provisionEmployeeAccount({
      firstName: "Admin",
      lastName: "Candidate",
      email: `admin.${Date.now()}@mocktest.local`,
      designation: "System Administrator",
      autoCreateUser: true,
    });
    assert.equal(adminCheck.userRole, "ADMIN");

    // HR designation
    const hrCheck = await provisionEmployeeAccount({
      firstName: "HR",
      lastName: "Candidate",
      email: `hr.${Date.now()}@mocktest.local`,
      designation: "Human Resource Specialist",
      autoCreateUser: true,
    });
    assert.equal(hrCheck.userRole, "HR");

    // Finance designation
    const finCheck = await provisionEmployeeAccount({
      firstName: "Fin",
      lastName: "Candidate",
      email: `finance.${Date.now()}@mocktest.local`,
      designation: "Chief Accounts Officer",
      autoCreateUser: true,
    });
    assert.equal(finCheck.userRole, "FINANCE");

    // Employee designation
    const empCheck = await provisionEmployeeAccount({
      firstName: "Dev",
      lastName: "Candidate",
      email: `developer.${Date.now()}@mocktest.local`,
      designation: "Frontend Engineer",
      autoCreateUser: true,
    });
    assert.equal(empCheck.userRole, "EMPLOYEE");
  });
});
