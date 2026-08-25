import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Receipt,
} from "lucide-react";

import {
  getPayslips,
  generatePayslipsForMonth,
} from "../../services/payslipService";

import PayslipSummary
  from "../../components/payslips/PayslipSummary";

import PayslipFilters
  from "../../components/payslips/PayslipFilters";

import PayslipTable
  from "../../components/payslips/PayslipTable";

import PayslipModal
  from "../../components/payslips/PayslipModal";

import { useAuth } from "../../hooks/useAuth";
import { useNotification } from "../../hooks/useNotification";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function Payslips() {
  const { user, role } = useAuth();
  const notification = useNotification();
  const isFinance = (role || "").toUpperCase() === "FINANCE";
  const isEmployee = (role || "").toUpperCase() === "EMPLOYEE";

  const [records, setRecords] =
    useState([]);

  const [_loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [department, setDepartment] =
    useState("All Departments");

  const [month, setMonth] =
    useState("2026-08");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [selectedRecord, setSelectedRecord] =
    useState(null);

  const [generating, setGenerating] =
    useState(false);

  const mapPayslipToUI = (rec) => {
    const name = `${rec.first_name || ""} ${rec.last_name || ""}`.trim() || "Employee";
    const monthStr = rec.payroll_month && rec.payroll_year
      ? `${monthNames[Number(rec.payroll_month) - 1] || ""} ${rec.payroll_year}`.trim()
      : "-";
    const basic = Number(rec.basic_salary || 0);
    const allowances = Number(rec.allowances || 0);
    const deductions = Number(rec.deductions || 0);
    const gross = Number(rec.gross_salary || (basic + allowances));
    const net = Number(rec.net_salary || (gross - deductions));

    return {
      id: rec.payslip_number || `PS-${String(rec.id).padStart(3, "0")}`,
      databaseId: rec.id,
      payrollId: rec.payroll_id,
      employeeId: rec.employee_code || `EMP-${rec.employee_id}`,
      employeeName: name,
      name,
      department: rec.department_name || "General",
      month: monthStr,
      basicSalary: basic,
      grossSalary: `₹${gross.toLocaleString("en-IN")}`,
      deductions: `₹${deductions.toLocaleString("en-IN")}`,
      netSalary: `₹${net.toLocaleString("en-IN")}`,
      status: "Generated",
      rawDate: rec.payroll_month && rec.payroll_year
        ? `${rec.payroll_year}-${String(rec.payroll_month).padStart(2, "0")}`
        : "",
      allowances,
      totalDeductions: deductions,
      netSalaryNum: net,
      grossSalaryNum: gross,
      bankName: rec.bank_name || "-",
      bankAccount: rec.bank_account || "-",
      ifscCode: rec.ifsc_code || "-",
      designation: rec.designation || "Staff",
      email: rec.email || "",
    };
  };

  const loadPayslipsData = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getPayslips();
      const mapped = (data || []).map(mapPayslipToUI);
      setRecords(mapped);
    } catch (err) {
      console.error("Failed to load payslips:", err);
      setError(err.message || "Failed to load payslips");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayslipsData();
  }, []);

  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      // If regular employee, only show their own payslips
      if (isEmployee) {
        const userEmail = (user?.email || "").toLowerCase().trim();
        const userName = (user?.name || "").toLowerCase().trim();
        const matchesMyEmail = rec.email && rec.email.toLowerCase().trim() === userEmail;
        const matchesMyName = rec.name && rec.name.toLowerCase().trim() === userName;
        if (!matchesMyEmail && !matchesMyName) return false;
      }

      const matchesSearch =
        !search ||
        rec.name.toLowerCase().includes(search.toLowerCase()) ||
        rec.id.toLowerCase().includes(search.toLowerCase());

      const matchesDepartment =
        department === "All Departments" || rec.department === department;

      const matchesMonth =
        !month || rec.rawDate === month;

      return matchesSearch && matchesDepartment && matchesMonth;
    });
  }, [records, search, department, month, isEmployee, user]);


  const handleView = (
    record
  ) => {

    setSelectedRecord(record);

    setModalOpen(true);

  };


  const handleDownload = (record) => {
    setSelectedRecord(record);
    setModalOpen(true);
    notification.info(`Opening payslip for ${record.name} - you can print or save as PDF.`);
  };

  const handleGeneratePayslips = async () => {
    if (!isFinance) {
      notification?.error?.("Only Finance Executives are authorized to generate monthly payslips.");
      return;
    }

    try {
      setGenerating(true);

      const [year, monthNum] = month.split("-").map(Number);
      const result = await generatePayslipsForMonth(monthNum, year);

      if (result.generated.length === 0 && result.skipped.length === 0) {
        notification?.warning
          ? notification.warning("No payroll records found for this month. Add payroll entries first.")
          : notification?.error?.("No payroll records found for this month.");
      } else if (result.generated.length > 0) {
        notification?.success?.(
          `✅ ${result.generated.length} payslip${result.generated.length > 1 ? "s" : ""} generated!` +
          (result.skipped.length > 0 ? ` (${result.skipped.length} already existed, skipped)` : "")
        );
      } else {
        notification?.success?.(`All ${result.skipped.length} payslips already exist for this month.`);
      }

      // Reload payslip list so new entries appear immediately
      await loadPayslipsData();

    } catch (err) {
      console.error("Generate payslips error:", err);
      notification?.error?.(err.message || "Failed to generate payslips. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="payslips-page">

      {/* HEADER */}

      <div className="module-heading">

        <div>

          <p className="section-label">
            FINANCE & COMPENSATION
          </p>

          <h1>
            Employee Payslips
          </h1>

          <p>
            {isFinance
              ? "Generate, review, and distribute structured employee salary slips."
              : "Access and review generated monthly salary statements."}
          </p>

        </div>

        {isFinance && (
          <button
            className="primary-button"
            onClick={handleGeneratePayslips}
            disabled={generating}
            style={{ opacity: generating ? 0.7 : 1, cursor: generating ? "not-allowed" : "pointer" }}
          >
            <Receipt size={16} />
            {generating ? "Generating..." : "Generate Monthly Payslips"}
          </button>
        )}

      </div>

      {error && (
        <div className="dashboard-card">
          <p style={{ color: "#e11d48" }}>{error}</p>
        </div>
      )}


      {/* SUMMARY */}

      <PayslipSummary
        records={filteredRecords}
      />


      {/* TABLE */}

      <section className="dashboard-card">

        <div className="payslip-section-header">

          <div>

            <h3>
              Employee Payslips
            </h3>

            <p>
              Access generated monthly
              salary slips.
            </p>

          </div>


          <div className="payslip-total-label">

            <Receipt size={16} />

            {filteredRecords.length}
            {" "}
            Payslips

          </div>

        </div>


        <PayslipFilters
          search={search}
          setSearch={setSearch}
          department={department}
          setDepartment={setDepartment}
          month={month}
          setMonth={setMonth}
        />


        <PayslipTable
          records={filteredRecords}
          onView={handleView}
          onDownload={handleDownload}
        />

      </section>


      {/* MODAL */}

      <PayslipModal
        isOpen={modalOpen}
        onClose={() => {

          setModalOpen(false);

          setSelectedRecord(null);

        }}
        record={selectedRecord}
      />

    </div>
  );
}

export default Payslips;
