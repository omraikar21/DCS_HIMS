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
  const isEmployee = (role || "").toUpperCase() === "EMPLOYEE";

  const [records, setRecords] =
    useState([]);

  const [loading, setLoading] =
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
      department: rec.department_name || "General",
      month: monthStr,
      basicSalary: basic,
      grossSalary: gross,
      deductions: deductions,
      netSalary: net,
      status: "Generated",
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

  const filteredRecords =
    useMemo(() => {

      return records.filter(
        (record) => {
          // If logged in as employee, only show matching employee records
          if (isEmployee && user) {
            const userNameLower = (user.name || "").toLowerCase();
            const userEmailLower = (user.email || "").toLowerCase();
            const recordNameLower = record.employeeName.toLowerCase();

            const isMatch = recordNameLower.includes(userNameLower) ||
                            userNameLower.includes(recordNameLower) ||
                            record.employeeName.includes("Om Raikar") || // default employee demo
                            record.employeeId === "DCS-EMP-001";
            if (!isMatch) return false;
          }

          const searchText =
            search.toLowerCase();


          const matchesSearch =
            record.employeeName
              .toLowerCase()
              .includes(searchText) ||

            record.employeeId
              .toLowerCase()
              .includes(searchText);


          const matchesDepartment =
            department ===
              "All Departments" ||
            record.department ===
              department;


          return (
            matchesSearch &&
            matchesDepartment
          );

        }
      );

    }, [
      records,
      search,
      department,
      month,
      isEmployee,
      user,
    ]);


  const handleView = (
    record
  ) => {

    setSelectedRecord(record);

    setModalOpen(true);

  };


  const handleDownload = (record) => {
    setSelectedRecord(record);
    setModalOpen(true);
  };

  const handleGeneratePayslips = async () => {
    try {
      setGenerating(true);

      // Parse month filter  e.g. "2026-08" → month=8, year=2026
      const [yearStr, monthStr] = month.split("-");
      const yearNum  = Number(yearStr);
      const monthNum = Number(monthStr);

      if (!yearNum || !monthNum) {
        notification?.error?.("Please select a valid month first.");
        return;
      }

      const result = await generatePayslipsForMonth(monthNum, yearNum);

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
            {isEmployee
              ? "Access and download your verified monthly salary statements."
              : "Generate, review, and distribute structured employee salary slips."}
          </p>

        </div>

        {!isEmployee && (
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