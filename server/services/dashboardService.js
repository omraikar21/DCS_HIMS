// ==========================================
// DASHBOARD SERVICE
// B8
// ==========================================

const {
  pool,
} = require("../config/database");


// ------------------------------------------
// GET DASHBOARD DATA
// ------------------------------------------

const getDashboardData =
  async () => {

    // --------------------------------------
    // EMPLOYEE SUMMARY
    // --------------------------------------

    const employeeSummary =
      await pool.query(`
        SELECT

          COUNT(*) AS total_employees,

          COUNT(*) FILTER (
            WHERE employment_status = 'ACTIVE'
          ) AS active_employees,

          COUNT(*) FILTER (
            WHERE employment_status = 'INACTIVE'
          ) AS inactive_employees

        FROM employees
      `);


    // --------------------------------------
    // DEPARTMENT COUNT
    // --------------------------------------

    const departmentCount =
      await pool.query(`
        SELECT
          COUNT(*) AS total_departments
        FROM departments
        WHERE is_active = TRUE
      `);


    // --------------------------------------
    // TODAY ATTENDANCE
    // --------------------------------------

    const attendanceSummary =
      await pool.query(`
        SELECT

          COUNT(*) AS total_records,

          COUNT(*) FILTER (
            WHERE status = 'PRESENT'
          ) AS present,

          COUNT(*) FILTER (
            WHERE status = 'ABSENT'
          ) AS absent,

          COUNT(*) FILTER (
            WHERE status = 'LEAVE'
          ) AS on_leave

        FROM attendance

        WHERE attendance_date =
              CURRENT_DATE
      `);


    // --------------------------------------
    // LEAVE SUMMARY
    // --------------------------------------

    const leaveSummary =
      await pool.query(`
        SELECT

          COUNT(*) AS total,

          COUNT(*) FILTER (
            WHERE status = 'PENDING'
          ) AS pending,

          COUNT(*) FILTER (
            WHERE status = 'APPROVED'
          ) AS approved,

          COUNT(*) FILTER (
            WHERE status = 'REJECTED'
          ) AS rejected

        FROM leaves
      `);


    // --------------------------------------
    // PAYROLL SUMMARY
    // --------------------------------------

    const payrollSummary =
      await pool.query(`
        SELECT

          COALESCE(
            SUM(net_salary),
            0
          ) AS total_payroll,

          COUNT(*) AS payroll_records

        FROM payroll
      `);


    // --------------------------------------
    // EMPLOYEES BY DEPARTMENT
    // --------------------------------------

    const employeesByDepartment =
      await pool.query(`
        SELECT

          d.name AS department,

          COUNT(e.id)::INTEGER AS employee_count

        FROM departments d

        LEFT JOIN employees e
          ON e.department_id = d.id

        WHERE d.is_active = TRUE

        GROUP BY
          d.id,
          d.name

        ORDER BY
          employee_count DESC
      `);


    // --------------------------------------
    // RECENT EMPLOYEES
    // --------------------------------------

    const recentEmployees =
      await pool.query(`
        SELECT

          e.id,

          e.employee_code,

          e.first_name,

          e.last_name,

          e.designation,

          e.employment_status,

          d.name AS department_name

        FROM employees e

        LEFT JOIN departments d
          ON e.department_id = d.id

        ORDER BY
          e.created_at DESC

        LIMIT 5
      `);


    // --------------------------------------
    // RECENT LEAVES
    // --------------------------------------

    const recentLeaves =
      await pool.query(`
        SELECT

          l.id,

          l.leave_type,

          l.start_date,

          l.end_date,

          l.status,

          e.employee_code,

          e.first_name,

          e.last_name

        FROM leaves l

        JOIN employees e
          ON l.employee_id = e.id

        ORDER BY
          l.created_at DESC

        LIMIT 5
      `);


    // --------------------------------------
    // RETURN DASHBOARD DATA
    // --------------------------------------

    return {

      summary: {

        totalEmployees:
          Number(
            employeeSummary.rows[0]
              .total_employees
          ),

        activeEmployees:
          Number(
            employeeSummary.rows[0]
              .active_employees
          ),

        inactiveEmployees:
          Number(
            employeeSummary.rows[0]
              .inactive_employees
          ),

        totalDepartments:
          Number(
            departmentCount.rows[0]
              .total_departments
          ),

      },


      attendance: {

        total:
          Number(
            attendanceSummary.rows[0]
              .total_records
          ),

        present:
          Number(
            attendanceSummary.rows[0]
              .present
          ),

        absent:
          Number(
            attendanceSummary.rows[0]
              .absent
          ),

        onLeave:
          Number(
            attendanceSummary.rows[0]
              .on_leave
          ),

      },


      leave: {

        total:
          Number(
            leaveSummary.rows[0]
              .total
          ),

        pending:
          Number(
            leaveSummary.rows[0]
              .pending
          ),

        approved:
          Number(
            leaveSummary.rows[0]
              .approved
          ),

        rejected:
          Number(
            leaveSummary.rows[0]
              .rejected
          ),

      },


      payroll: {

        totalPayroll:
          Number(
            payrollSummary.rows[0]
              .total_payroll
          ),

        payrollRecords:
          Number(
            payrollSummary.rows[0]
              .payroll_records
          ),

      },


      employeesByDepartment:
        employeesByDepartment.rows,


      recentEmployees:
        recentEmployees.rows,


      recentLeaves:
        recentLeaves.rows,

    };

  };


module.exports = {
  getDashboardData,
};