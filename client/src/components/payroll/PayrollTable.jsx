import {
  FileText,
  Pencil,
} from "lucide-react";


function PayrollTable({
  records,
  onView,
  onEdit,
}) {
  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  };

  return (
    <div className="payroll-table-wrapper">
      <table className="payroll-table">
        <thead>
          <tr>
            <th>Payable Employee</th>
            <th>Department</th>
            <th>Basic Salary</th>
            <th>Gross Salary</th>
            <th>Deductions</th>
            <th>Net Payable</th>
            <th>Status</th>
            <th style={{ textAlign: "center" }}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {records.length === 0 ? (
            <tr>
              <td colSpan="8" className="empty-table" style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>
                No payable payroll records found.
              </td>
            </tr>
          ) : (
            records.map((record) => {
              const initials = (record.employeeName || "EP")
                .split(" ")
                .map((word) => word[0])
                .join("")
                .slice(0, 2);

              const isPaid = record.status === "Paid" || record.status === "Processed";

              return (
                <tr key={record.id}>
                  {/* EMPLOYEE */}
                  <td>
                    <div className="employee-cell" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        className="employee-avatar"
                        style={{
                          backgroundColor: "#f0dced",
                          color: "#9B2282",
                          fontWeight: "700",
                          width: "36px",
                          height: "36px",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {initials}
                      </div>
                      <div>
                        <strong style={{ fontSize: "14px", color: "#0f172a", display: "block" }}>
                          {record.employeeName}
                        </strong>
                        <span style={{ fontSize: "12px", color: "#64748b" }}>
                          {record.employeeId} · {record.designation}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* DEPARTMENT */}
                  <td>
                    <span style={{ fontSize: "13px", fontWeight: "500", color: "#334155" }}>
                      {record.department}
                    </span>
                  </td>

                  {/* BASIC SALARY */}
                  <td style={{ fontSize: "13.5px", color: "#334155" }}>
                    {formatCurrency(record.basicSalary)}
                  </td>

                  {/* GROSS */}
                  <td style={{ fontSize: "13.5px", color: "#334155" }}>
                    {formatCurrency(record.grossSalary)}
                  </td>

                  {/* DEDUCTIONS */}
                  <td className="deduction-value" style={{ fontSize: "13.5px", color: "#ef4444", fontWeight: "600" }}>
                    -{formatCurrency(record.deductions)}
                  </td>

                  {/* NET PAYABLE */}
                  <td>
                    <strong className="net-salary" style={{ fontSize: "14.5px", color: "#9B2282", fontWeight: "800" }}>
                      {formatCurrency(record.netSalary)}
                    </strong>
                  </td>

                  {/* STATUS */}
                  <td>
                    <span
                      className={`status-badge ${isPaid ? "success" : "warning"}`}
                      style={{ fontSize: "11.5px" }}
                    >
                      {isPaid ? "Disbursed / Paid" : "Pending"}
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td style={{ textAlign: "center", minWidth: "180px" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                      {/* REPORT BUTTON */}
                      <button
                        type="button"
                        title="View Official Payroll & Compensation Report"
                        onClick={() => onView(record)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "7px 13px",
                          borderRadius: "8px",
                          border: "1px solid #F3D3E7",
                          background: "#FFF0F7",
                          color: "#DB2777",
                          fontSize: "12.5px",
                          fontWeight: "700",
                          cursor: "pointer",
                          transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                          boxShadow: "0 2px 6px rgba(219, 39, 119, 0.08)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "linear-gradient(135deg, #DB2777 0%, #BE185D 100%)";
                          e.currentTarget.style.color = "#FFFFFF";
                          e.currentTarget.style.borderColor = "#DB2777";
                          e.currentTarget.style.boxShadow = "0 4px 12px rgba(219, 39, 119, 0.25)";
                          e.currentTarget.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#FFF0F7";
                          e.currentTarget.style.color = "#DB2777";
                          e.currentTarget.style.borderColor = "#F3D3E7";
                          e.currentTarget.style.boxShadow = "0 2px 6px rgba(219, 39, 119, 0.08)";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        <FileText size={14} />
                        <span>Report</span>
                      </button>

                      {/* EDIT BUTTON */}
                      <button
                        type="button"
                        title="Edit Salary, Allowances, Deductions & Bank Details"
                        onClick={() => onEdit(record)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "7px 13px",
                          borderRadius: "8px",
                          border: "1px solid #CBD5E1",
                          background: "#FFFFFF",
                          color: "#334155",
                          fontSize: "12.5px",
                          fontWeight: "700",
                          cursor: "pointer",
                          transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#F8FAFC";
                          e.currentTarget.style.borderColor = "#0F172A";
                          e.currentTarget.style.color = "#0F172A";
                          e.currentTarget.style.boxShadow = "0 3px 10px rgba(0, 0, 0, 0.08)";
                          e.currentTarget.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#FFFFFF";
                          e.currentTarget.style.borderColor = "#CBD5E1";
                          e.currentTarget.style.color = "#334155";
                          e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.04)";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        <Pencil size={13} />
                        <span>Edit</span>
                      </button>
                    </div>
                  </td>


                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default PayrollTable;