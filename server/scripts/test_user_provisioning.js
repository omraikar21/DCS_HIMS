const { createNewUser } = require("../services/userService");
const { pool } = require("../config/database");

async function testProvisioning() {
  console.log("--- Testing Provisioning Hierarchy ---");
  try {
    const secondaryAdminRequester = {
      id: 2,
      email: "raikarom9@gmail.com",
      role: "ADMIN",
      is_super_admin: false,
    };

    const superAdminRequester = {
      id: 1,
      email: "omraikar2128@gmail.com",
      role: "ADMIN",
      is_super_admin: true,
    };

    // 1. Secondary Admin provisions Finance user
    console.log("1. Testing Secondary Admin provisioning Finance user...");
    const finUser = await createNewUser(
      {
        name: "Ramesh Finance",
        email: "ramesh.fin@dcshims.internal",
        role: "FINANCE",
        password: "Finance@123",
      },
      secondaryAdminRequester
    );
    console.log("  Success! Created Finance user:", finUser.name, `(${finUser.email})`);

    // Clean up test user
    await pool.query("DELETE FROM users WHERE email = $1", ["ramesh.fin@dcshims.internal"]);
    await pool.query("DELETE FROM employees WHERE email = $1", ["ramesh.fin@dcshims.internal"]);
    console.log("  Cleaned up test finance user.");

    // 2. Super Admin attempting to provision Finance user (Should be rejected)
    console.log("2. Testing Super Admin provisioning Finance user (Should throw)...");
    let rejected = false;
    try {
      await createNewUser(
        {
          name: "Invalid SuperAdmin Action",
          email: "invalid.fin@dcshims.internal",
          role: "FINANCE",
        },
        superAdminRequester
      );
    } catch (err) {
      rejected = true;
      console.log("  Expected error correctly caught:", err.message);
    }

    if (!rejected) {
      throw new Error("Super Admin was incorrectly allowed to provision Finance user!");
    }

    console.log("=== All Provisioning Hierarchy Tests Passed! ===");
    process.exit(0);
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  }
}

testProvisioning();
