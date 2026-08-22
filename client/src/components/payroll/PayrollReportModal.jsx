import {
  X,
  Printer,
  Building2,
  CreditCard,
  CheckCircle2,
  Clock,
  Download,
  Receipt,
  FileCheck,
} from "lucide-react";

function PayrollReportModal({
  isOpen,
  onClose,
  record,
  onMarkPaid,
}) {
  if (!isOpen || !record) return null;

  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN")}`;

  const isPaid = record.status === "Paid" || record.status === "Processed";

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payroll Report - ${record.employeeName} (${record.month})</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; margin: 0; padding: 20px; }
            .report-box { max-width: 800px; margin: 0 auto; border: 2px solid #cbd5e1; border-radius: 8px; padding: 30px; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #A1238E; padding-bottom: 16px; margin-bottom: 20px; }
            .brand h1 { margin: 0; color: #A1238E; font-size: 24px; }
            .brand p { margin: 2px 0 0 0; color: #64748b; font-size: 13px; }
            .title-box { text-align: right; }
            .title-box h2 { margin: 0; font-size: 18px; color: #0f172a; }
            .title-box p { margin: 2px 0 0 0; font-size: 12px; color: #64748b; }
            .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; background: #f8fafc; padding: 14px; border-radius: 6px; margin-bottom: 20px; font-size: 13px; }
            .tables-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; }
            th { text-align: left; background: #f1f5f9; padding: 8px 10px; border-bottom: 1px solid #cbd5e1; font-weight: 600; }
            td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
            .total-row { font-weight: 700; background: #faf5fa; color: #A1238E; }
            .net-pay-banner { background: linear-gradient(135deg, #f0dced, #ffffff); border: 2px solid #A1238E; border-radius: 8px; padding: 18px; text-align: center; margin-bottom: 20px; }
            .net-pay-banner h3 { margin: 0 0 4px 0; color: #64748b; font-size: 13px; text-transform: uppercase; }
            .net-pay-banner .amount { font-size: 26px; font-weight: 800; color: #A1238E; }
            .footer { text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 14px; }
          </style>
        </head>
        <body>
          <div class="report-box">
            <div class="header">
              <div class="brand">
                <h1>DCS CORPORATE</h1>
                <p>Digital Corporate System · Finance & Payroll Report</p>
              </div>
              <div class="title-box">
                <h2>PAYROLL DISBURSEMENT REPORT</h2>
                <p>Period: ${record.month} · Reference: ${record.id}</p>
              </div>
            </div>

            <div class="section-title">1. Payable Employee Information</div>
            <div class="info-grid">
              <div><strong>Employee Name:</strong> ${record.employeeName}</div>
              <div><strong>Employee ID:</strong> ${record.employeeId}</div>
              <div><strong>Department:</strong> ${record.department}</div>
              <div><strong>Designation:</strong> ${record.designation || "Staff"}</div>
            </div>

            <div class="section-title">2. Verified Bank Disbursement Details</div>
            <div class="info-grid" style="background: #f0fdf4; border: 1px solid #dcfce7;">
              <div><strong>Beneficiary Bank:</strong> ${record.bankName || "HDFC Bank"}</div>
              <div><strong>Account Number:</strong> ${record.bankAccount || "50100482910482"}</div>
              <div><strong>IFSC Code:</strong> ${record.ifscCode || "HDFC0001234"}</div>
              <div><strong>Transfer Mode:</strong> Direct Corporate Bank Transfer (NEFT/IMPS)</div>
              <div><strong>Payment Status:</strong> ${isPaid ? "DISBURSED / PAID" : "PENDING DISBURSEMENT"}</div>
              <div><strong>Txn Reference:</strong> ${record.transactionRef || `TXN-${record.id}-2026`}</div>
            </div>

            <div class="section-title">3. Compensation & Deductions Breakdown</div>
            <div class="tables-grid">
              <div>
                <table>
                  <thead>
                    <tr><th>EARNINGS ITEM</th><th style="text-align:right">AMOUNT</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>Basic Salary</td><td style="text-align:right">${formatCurrency(record.basicSalary)}</td></tr>
                    <tr><td>House Rent Allowance (HRA)</td><td style="text-align:right">${formatCurrency(record.hra || (Number(record.basicSalary) * 0.25))}</td></tr>
                    <tr><td>Special Allowance</td><td style="text-align:right">${formatCurrency(record.allowances || 0)}</td></tr>
                    <tr class="total-row"><td>GROSS EARNINGS</td><td style="text-align:right">${formatCurrency(record.grossSalary)}</td></tr>
                  </tbody>
                </table>
              </div>

              <div>
                <table>
                  <thead>
                    <tr><th>DEDUCTIONS ITEM</th><th style="text-align:right">AMOUNT</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>Provident Fund (PF)</td><td style="text-align:right">${formatCurrency(Number(record.deductions) * 0.6)}</td></tr>
                    <tr><td>Professional Tax & TDS</td><td style="text-align:right">${formatCurrency(Number(record.deductions) * 0.4)}</td></tr>
                    <tr class="total-row"><td>TOTAL DEDUCTIONS</td><td style="text-align:right">-${formatCurrency(record.deductions)}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="net-pay-banner">
              <h3>Net Payable Amount to Employee Account</h3>
              <div class="amount">${formatCurrency(record.netSalary)}</div>
            </div>

            <div class="footer">
              Finance Department Corporate Authorization · Confidential Payroll Document · DCS
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="modal-overlay">
      <div className="payroll-modal" style={{ maxWidth: "600px" }}>
        <div className="modal-header">
          <div>
            <p className="section-label">PAYROLL & BANK DISBURSEMENT</p>
            <h2>Payable Employee Report</h2>
          </div>

          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* EMPLOYEE & DEPT */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f8fafc", padding: "12px 16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <div>
              <strong style={{ fontSize: "16px", color: "#0f172a", display: "block" }}>
                {record.employeeName}
              </strong>
              <span style={{ fontSize: "12.5px", color: "#64748b" }}>
                {record.employeeId} · {record.department} ({record.designation || "Staff"})
              </span>
            </div>

            <span
              className={`status-badge ${isPaid ? "success" : "warning"}`}
              style={{ fontSize: "12px" }}
            >
              {isPaid ? "Disbursed / Paid" : "Pending Payment"}
            </span>
          </div>

          {/* BANK DETAILS CARD */}
          <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", padding: "14px 16px", borderRadius: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "700", color: "#166534", textTransform: "uppercase", marginBottom: "8px" }}>
              <CreditCard size={15} />
              <span>Verified Bank Disbursement Details</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "13px", color: "#1e293b" }}>
              <div>
                <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>Bank Name</span>
                <strong>{record.bankName || "HDFC Bank"}</strong>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>Account Number</span>
                <strong>{record.bankAccount || "50100482910482"}</strong>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>IFSC Code</span>
                <strong>{record.ifscCode || "HDFC0001234"}</strong>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>Transaction Mode</span>
                <strong>Direct Bank Transfer (NEFT)</strong>
              </div>
            </div>
          </div>

          {/* FINANCIAL BREAKDOWN */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
            <div style={{ padding: "10px 12px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>Gross Salary</span>
              <div style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b", marginTop: "2px" }}>
                {formatCurrency(record.grossSalary)}
              </div>
            </div>

            <div style={{ padding: "10px 12px", backgroundColor: "#fef2f2", borderRadius: "6px", border: "1px solid #fee2e2" }}>
              <span style={{ fontSize: "11px", color: "#dc2626", fontWeight: "600", textTransform: "uppercase" }}>Deductions</span>
              <div style={{ fontSize: "15px", fontWeight: "700", color: "#dc2626", marginTop: "2px" }}>
                -{formatCurrency(record.deductions)}
              </div>
            </div>

            <div style={{ padding: "10px 12px", backgroundColor: "#f0dced", borderRadius: "6px", border: "1px solid #e7c6e2" }}>
              <span style={{ fontSize: "11px", color: "#A1238E", fontWeight: "700", textTransform: "uppercase" }}>Net Payable</span>
              <div style={{ fontSize: "16px", fontWeight: "800", color: "#A1238E", marginTop: "2px" }}>
                {formatCurrency(record.netSalary)}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="secondary-button" onClick={onClose}>
            Close
          </button>

          {!isPaid && onMarkPaid && (
            <button
              type="button"
              className="secondary-button"
              style={{ backgroundColor: "#dcfce7", color: "#15803d", borderColor: "#86efac", fontWeight: "600" }}
              onClick={() => onMarkPaid(record)}
            >
              <CheckCircle2 size={15} />
              Mark as Paid in DB
            </button>
          )}

          <button className="primary-button" onClick={handlePrint}>
            <Printer size={15} />
            Print / Export Report
          </button>
        </div>
      </div>
    </div>
  );
}

export default PayrollReportModal;
