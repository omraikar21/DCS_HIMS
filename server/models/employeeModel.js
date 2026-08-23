// ==========================================
// EMPLOYEE MODEL
// ==========================================

const {
  pool,
} = require("../config/database");


// ------------------------------------------
// GET ALL EMPLOYEES
// ------------------------------------------

const getAllEmployees =
  async () => {

    const result =
      await pool.query(`
        SELECT
          e.*,
          d.name AS department_name
        FROM employees e
        LEFT JOIN departments d
          ON e.department_id = d.id
        ORDER BY e.id ASC
      `);

    return result.rows;
  };


// ------------------------------------------
// GET EMPLOYEE BY ID
// ------------------------------------------

const getEmployeeById =
  async (id) => {

    const result =
      await pool.query(
        `
        SELECT
          e.*,
          d.name AS department_name
        FROM employees e
        LEFT JOIN departments d
          ON e.department_id = d.id
        WHERE e.id = $1
        `,
        [id]
      );

    return result.rows[0];
  };


// ------------------------------------------
// GET EMPLOYEE BY USER ID
// ------------------------------------------

const getEmployeeByUserId =
  async (userId) => {

    const result =
      await pool.query(
        `
        SELECT
          e.*,
          d.name AS department_name
        FROM employees e
        LEFT JOIN departments d
          ON e.department_id = d.id
        WHERE e.user_id = $1
        `,
        [userId]
      );

    return result.rows[0];
  };


// ------------------------------------------
// GENERATE DEPARTMENT-SPECIFIC EMPLOYEE CODE
// e.g. Admin -> DCS-ADM-001, HR -> DCS-HR-001, Finance -> DCS-FIN-001, AI ML -> DCS-AIML-001
// ------------------------------------------
const generateDepartmentEmployeeCode = async (departmentId, designation = "", fallbackDeptName = "") => {
  let deptName = fallbackDeptName;
  if (departmentId && !deptName) {
    try {
      const deptRes = await pool.query("SELECT name FROM departments WHERE id = $1", [departmentId]);
      if (deptRes.rows[0]) {
        deptName = deptRes.rows[0].name;
      }
    } catch {
      deptName = "";
    }
  }

  const clean = `${deptName || ""} ${designation || ""}`.trim().toUpperCase();

  let prefix = "EMP";
  if (clean.includes("ADMIN")) prefix = "ADM";
  else if (clean.includes("HUMAN") || clean.includes("HR") || clean === "HR") prefix = "HR";
  else if (clean.includes("FINANCE") || clean.includes("ACCOUNT")) prefix = "FIN";
  else if (clean.includes("AI") && clean.includes("ML")) prefix = "AIML";
  else if (clean.includes("ARTIFICIAL") || clean === "AI") prefix = "AI";
  else if (clean.includes("DEV") || clean.includes("SOFTWARE") || clean.includes("ENGINEER")) prefix = "DEV";
  else if (clean.includes("TEST") || clean.includes("QA") || clean.includes("QUALITY")) prefix = "QA";
  else if (clean.includes("MARKET")) prefix = "MKT";
  else if (clean.includes("SALES")) prefix = "SLS";
  else if (clean.includes("OPERAT")) prefix = "OPS";
  else if (clean.includes("SUPPORT") || clean.includes("HELP")) prefix = "SUP";
  else if (clean.includes("DESIGN") || clean.includes("UI") || clean.includes("UX")) prefix = "DSG";
  else if (clean.includes("LEGAL")) prefix = "LGL";
  else if (clean.includes("SECURITY")) prefix = "SEC";
  else if (deptName) {
    const words = deptName.trim().toUpperCase().split(/\s+/).filter(Boolean);
    if (words.length > 1) {
      prefix = words.map((w) => w[0]).join("").slice(0, 4);
    } else {
      prefix = deptName.replace(/[^A-Z0-9]/gi, "").slice(0, 4).toUpperCase() || "EMP";
    }
  }

  // Count existing employees matching this prefix
  const codeResult = await pool.query(`
    SELECT COALESCE(
      MAX(
        CASE 
          WHEN employee_code ~ ('^DCS-' || $1 || '-[0-9]+$') 
          THEN CAST(SUBSTRING(employee_code FROM (LENGTH('DCS-' || $1 || '-') + 1)) AS INTEGER)
          WHEN employee_code ~ ('^' || $1 || '-[0-9]+$') 
          THEN CAST(SUBSTRING(employee_code FROM (LENGTH($1 || '-') + 1)) AS INTEGER)
          ELSE 0 
        END
      ), 
      0
    ) + 1 AS next_number
    FROM employees
  `, [prefix]);

  let nextNumber = parseInt(codeResult.rows[0]?.next_number, 10) || 1;
  let candidateCode = `DCS-${prefix}-${String(nextNumber).padStart(3, "0")}`;

  while (true) {
    const check = await pool.query(
      "SELECT id FROM employees WHERE employee_code = $1 LIMIT 1",
      [candidateCode]
    );
    if (check.rows.length === 0) {
      break;
    }
    nextNumber++;
    candidateCode = `DCS-${prefix}-${String(nextNumber).padStart(3, "0")}`;
  }

  return candidateCode;
};

// ------------------------------------------
// CREATE EMPLOYEE
// ------------------------------------------

const createEmployee =
  async ({
    userId = null,
    employeeCode,
    firstName,
    lastName = "",
    email,
    phone = "",
    departmentId = null,
    designation,
    joiningDate = null,
    salary = 0,
    hra = 0,
    allowances = 0,
    pfDeduction = 0,
    taxDeduction = 0,
    employmentStatus = "ACTIVE",
    bankName = null,
    bankAccount = null,
    ifscCode = null,
    address = "",
  }) => {

    if (!employeeCode) {
      employeeCode = await generateDepartmentEmployeeCode(departmentId, designation);
    }

    let cleanJoiningDate = null;
    if (joiningDate && String(joiningDate).trim() !== "") {
      const str = String(joiningDate).trim();
      if (/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(str)) {
        const parts = str.split(/[-/]/);
        cleanJoiningDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
      } else if (/^\d{4}[-/]\d{2}[-/]\d{2}/.test(str)) {
        cleanJoiningDate = str.slice(0, 10);
      } else {
        try {
          const parsed = new Date(str);
          if (!isNaN(parsed.getTime())) {
            cleanJoiningDate = parsed.toISOString().slice(0, 10);
          }
        } catch {
          cleanJoiningDate = null;
        }
      }
    }

    const cleanSalary = salary ? Number(salary) || 0 : 0;
    const cleanHra = hra ? Number(hra) || 0 : 0;
    const cleanAllowances = allowances ? Number(allowances) || 0 : 0;
    const cleanPf = pfDeduction ? Number(pfDeduction) || 0 : 0;
    const cleanTax = taxDeduction ? Number(taxDeduction) || 0 : 0;

    const result =
      await pool.query(
        `
        INSERT INTO employees
        (
          user_id,
          employee_code,
          first_name,
          last_name,
          email,
          phone,
          department_id,
          designation,
          joining_date,
          salary,
          hra,
          allowances,
          pf_deduction,
          tax_deduction,
          employment_status,
          bank_name,
          bank_account,
          ifsc_code,
          address
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10,
          $11,
          $12,
          $13,
          $14,
          $15,
          $16,
          $17,
          $18,
          $19
        )
        RETURNING *
        `,
        [
          userId,
          employeeCode,
          firstName.trim(),
          lastName ? lastName.trim() : "",
          email.trim(),
          phone ? phone.trim() : "",
          departmentId || null,
          designation.trim(),
          cleanJoiningDate,
          cleanSalary,
          cleanHra,
          cleanAllowances,
          cleanPf,
          cleanTax,
          employmentStatus || "ACTIVE",
          bankName ? bankName.trim() : null,
          bankAccount ? bankAccount.trim() : null,
          ifscCode ? ifscCode.trim() : null,
          address ? address.trim() : "",
        ]
      );

    return result.rows[0];
  };


// ------------------------------------------
// UPDATE EMPLOYEE
// ------------------------------------------

const updateEmployee =
  async (
    id,
    {
      firstName,
      lastName,
      phone,
      departmentId,
      designation,
      joiningDate,
      salary,
      hra,
      allowances,
      pfDeduction,
      taxDeduction,
      employmentStatus,
      bankName,
      bankAccount,
      ifscCode,
      address,
    }
  ) => {

    const cleanSalary = salary !== undefined ? Number(salary) || 0 : undefined;
    const cleanHra = hra !== undefined ? Number(hra) || 0 : undefined;
    const cleanAllowances = allowances !== undefined ? Number(allowances) || 0 : undefined;
    const cleanPf = pfDeduction !== undefined ? Number(pfDeduction) || 0 : undefined;
    const cleanTax = taxDeduction !== undefined ? Number(taxDeduction) || 0 : undefined;

    const result =
      await pool.query(
        `
        UPDATE employees
        SET
          first_name = COALESCE($1, first_name),
          last_name = COALESCE($2, last_name),
          phone = COALESCE($3, phone),
          department_id = COALESCE($4, department_id),
          designation = COALESCE($5, designation),
          joining_date = COALESCE($6, joining_date),
          salary = COALESCE($7, salary),
          hra = COALESCE($8, hra),
          allowances = COALESCE($9, allowances),
          pf_deduction = COALESCE($10, pf_deduction),
          tax_deduction = COALESCE($11, tax_deduction),
          employment_status = COALESCE($12, employment_status),
          bank_name = COALESCE($13, bank_name),
          bank_account = COALESCE($14, bank_account),
          ifsc_code = COALESCE($15, ifsc_code),
          address = COALESCE($16, address),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $17
        RETURNING *
        `,
        [
          firstName,
          lastName,
          phone,
          departmentId,
          designation,
          joiningDate,
          cleanSalary,
          cleanHra,
          cleanAllowances,
          cleanPf,
          cleanTax,
          employmentStatus,
          bankName,
          bankAccount,
          ifscCode,
          address,
          id,
        ]
      );

    return result.rows[0];
  };

// ------------------------------------------
// UPDATE EMPLOYEE COMPENSATION ONLY
// (FOR FINANCE / ADMIN)
// ------------------------------------------

const updateEmployeeCompensation =
  async (
    id,
    {
      salary = 0,
      hra = 0,
      allowances = 0,
      pfDeduction = 0,
      taxDeduction = 0,
      bankName = null,
      bankAccount = null,
      ifscCode = null,
    }
  ) => {
    const result = await pool.query(
      `
      UPDATE employees
      SET
        salary = $1,
        hra = $2,
        allowances = $3,
        pf_deduction = $4,
        tax_deduction = $5,
        bank_name = $6,
        bank_account = $7,
        ifsc_code = $8,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
      `,
      [
        Number(salary) || 0,
        Number(hra) || 0,
        Number(allowances) || 0,
        Number(pfDeduction) || 0,
        Number(taxDeduction) || 0,
        bankName ? String(bankName).trim() : null,
        bankAccount ? String(bankAccount).trim() : null,
        ifscCode ? String(ifscCode).trim() : null,
        id,
      ]
    );

    return result.rows[0];
  };


// ------------------------------------------
// DELETE EMPLOYEE
// ------------------------------------------

const deleteEmployee =
  async (id) => {

    const result =
      await pool.query(
        `
        DELETE FROM employees
        WHERE id = $1
        RETURNING *
        `,
        [id]
      );

    return result.rows[0];
  };


module.exports = {
  getAllEmployees,
  getEmployeeById,
  getEmployeeByUserId,
  createEmployee,
  generateDepartmentEmployeeCode,
  updateEmployee,
  updateEmployeeCompensation,
  deleteEmployee,
};