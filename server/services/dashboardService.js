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
          d.id,
          d.name AS department,
          COALESCE(u.name, d.department_head, d.allocated_admin, 'Assigned Team Lead') AS team_lead_name,
          COUNT(e.id)::INTEGER AS employee_count,
          COALESCE(
            json_agg(
              json_build_object(
                'id', e.id,
                'name', TRIM(CONCAT(e.first_name, ' ', COALESCE(e.last_name, ''))),
                'designation', e.designation,
                'code', e.employee_code
              )
            ) FILTER (WHERE e.id IS NOT NULL),
            '[]'
          ) AS employees
        FROM departments d
        LEFT JOIN users u
          ON d.team_lead_id = u.id
        LEFT JOIN employees e
          ON e.department_id = d.id AND LOWER(e.email) NOT IN ('omraikar2128@gmail.com', 'omraikar2128@gamil.com')
        WHERE d.is_active = TRUE
        GROUP BY
          d.id,
          d.name,
          u.name,
          d.department_head,
          d.allocated_admin
        ORDER BY
          employee_count DESC
      `);


    // --------------------------------------
    // WEEKLY ATTENDANCE BREAKDOWN FROM DB
    // --------------------------------------
    let weeklyAttendance = [];
    try {
      const weeklyRes = await pool.query(`
        SELECT 
          TO_CHAR(attendance_date, 'Dy') AS day,
          attendance_date,
          COUNT(*) FILTER (WHERE status = 'PRESENT')::INTEGER AS present,
          COUNT(*) FILTER (WHERE status = 'ABSENT')::INTEGER AS absent,
          COUNT(*) FILTER (WHERE status = 'LEAVE')::INTEGER AS leave
        FROM attendance
        WHERE attendance_date >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY attendance_date, TO_CHAR(attendance_date, 'Dy')
        ORDER BY attendance_date ASC
      `);
      weeklyAttendance = weeklyRes.rows;
    } catch (wErr) {
      console.warn("[DASHBOARD] Weekly attendance query notice:", wErr.message);
    }

    // --------------------------------------
    // MONTHLY PAYROLL TREND FROM DB
    // --------------------------------------
    let monthlyPayrollTrend = [];
    try {
      const payrollRes = await pool.query(`
        SELECT 
          payroll_month AS month,
          payroll_year AS year,
          COALESCE(SUM(net_salary), 0)::NUMERIC(12,2) AS total_amount,
          COUNT(*)::INTEGER AS record_count
        FROM payroll
        GROUP BY payroll_year, payroll_month
        ORDER BY payroll_year ASC, payroll_month ASC
        LIMIT 6
      `);
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      monthlyPayrollTrend = payrollRes.rows.map((row) => ({
        ...row,
        month_name: monthNames[((Number(row.month) || 1) - 1) % 12] || "Month",
      }));
    } catch (pErr) {
      console.warn("[DASHBOARD] Monthly payroll query notice:", pErr.message);
    }

    // --------------------------------------
    // LEAVE TYPE BREAKDOWN FROM DB
    // --------------------------------------
    let leaveTypeBreakdown = [];
    try {
      const leaveTypeRes = await pool.query(`
        SELECT 
          leave_type,
          COUNT(*)::INTEGER AS count,
          COUNT(*) FILTER (WHERE status = 'APPROVED')::INTEGER AS approved_count,
          COUNT(*) FILTER (WHERE status = 'PENDING')::INTEGER AS pending_count
        FROM leaves
        GROUP BY leave_type
        ORDER BY count DESC
      `);
      leaveTypeBreakdown = leaveTypeRes.rows;
    } catch (lErr) {
      console.warn("[DASHBOARD] Leave type query notice:", lErr.message);
    }

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
        totalEmployees: Number(employeeSummary.rows[0].total_employees),
        activeEmployees: Number(employeeSummary.rows[0].active_employees),
        inactiveEmployees: Number(employeeSummary.rows[0].inactive_employees),
        totalDepartments: Number(departmentCount.rows[0].total_departments),
      },

      attendance: {
        total: Number(attendanceSummary.rows[0].total_records),
        present: Number(attendanceSummary.rows[0].present),
        absent: Number(attendanceSummary.rows[0].absent),
        onLeave: Number(attendanceSummary.rows[0].on_leave),
      },

      leave: {
        total: Number(leaveSummary.rows[0].total),
        pending: Number(leaveSummary.rows[0].pending),
        approved: Number(leaveSummary.rows[0].approved),
        rejected: Number(leaveSummary.rows[0].rejected),
      },

      payroll: {
        totalPayroll: Number(payrollSummary.rows[0].total_payroll),
        payrollRecords: Number(payrollSummary.rows[0].payroll_records),
      },

      employeesByDepartment: employeesByDepartment.rows,
      weeklyAttendance: weeklyAttendance,
      monthlyPayrollTrend: monthlyPayrollTrend,
      leaveTypeBreakdown: leaveTypeBreakdown,
      recentEmployees: recentEmployees.rows,
      recentLeaves: recentLeaves.rows,
    };
  };


module.exports = {
  getDashboardData,
};