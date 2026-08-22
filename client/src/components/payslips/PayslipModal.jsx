import {
  X,
  Download,
  Printer,
  FileCheck,
} from "lucide-react";

function PayslipModal({
  isOpen,
  onClose,
  record,
}) {
  if (!isOpen || !record) {
    return null;
  }

  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN")}`;

  const handlePrintDownload = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payslip - ${record.employeeName} (${record.month})</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; margin: 0; padding: 20px; }
            .payslip-container { max-width: 800px; margin: 0 auto; border: 2px solid #e2e8f0; border-radius: 8px; padding: 30px; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #A1238E; padding-bottom: 16px; margin-bottom: 20px; }
            .brand h1 { margin: 0; color: #A1238E; font-size: 24px; letter-spacing: 0.5px; }
            .brand p { margin: 2px 0 0 0; color: #64748b; font-size: 13px; }
            .slip-title { text-align: right; }
            .slip-title h2 { margin: 0; font-size: 18px; color: #0f172a; }
            .slip-title p { margin: 2px 0 0 0; font-size: 12px; color: #64748b; }
            .emp-details { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #f8fafc; padding: 16px; border-radius: 6px; margin-bottom: 24px; font-size: 13.5px; }
            .table-container { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
            th { text-align: left; background: #f1f5f9; padding: 8px 12px; border-bottom: 1px solid #cbd5e1; }
            td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
            .total-row { font-weight: 700; background: #faf5fa; color: #A1238E; }
            .net-pay-box { background: linear-gradient(135deg, #f0dced, #ffffff); border: 2px solid #A1238E; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px; }
            .net-pay-box h3 { margin: 0 0 6px 0; color: #64748b; font-size: 14px; text-transform: uppercase; }
            .net-pay-box .amount { font-size: 28px; font-weight: 800; color: #A1238E; }
            .footer { text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; }
          </style>
        </head>
        <body>
          <div class="payslip-container">
            <div class="header">
              <div class="brand">
                <h1>DCS CORPORATE</h1>
                <p>Digital Corporate System · Enterprise Payroll</p>
              </div>
              <div class="slip-title">
                <h2>SALARY STATEMENT</h2>
                <p>Payslip ID: ${record.id} · Period: ${record.month}</p>
              </div>
            </div>

            <div class="emp-details">
              <div><strong>Employee Name:</strong> ${record.employeeName}</div>
              <div><strong>Employee Code:</strong> ${record.employeeId}</div>
              <div><strong>Department:</strong> ${record.department}</div>
              <div><strong>Payment Mode:</strong> Direct Bank Transfer</div>
            </div>

            <div class="table-container">
              <div>
                <table>
                  <thead>
                    <tr><th>EARNINGS</th><th style="text-align:right">AMOUNT</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>Basic Salary</td><td style="text-align:right">${formatCurrency(record.basicSalary)}</td></tr>
                    <tr><td>House Rent Allowance (HRA)</td><td style="text-align:right">${formatCurrency(Number(record.basicSalary) * 0.2)}</td></tr>
                    <tr><td>Special Allowance</td><td style="text-align:right">${formatCurrency(Math.max(0, Number(record.grossSalary) - (Number(record.basicSalary) * 1.2)))}</td></tr>
                    <tr class="total-row"><td>GROSS EARNINGS</td><td style="text-align:right">${formatCurrency(record.grossSalary)}</td></tr>
                  </tbody>
                </table>
              </div>

              <div>
                <table>
                  <thead>
                    <tr><th>DEDUCTIONS</th><th style="text-align:right">AMOUNT</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>Provident Fund (PF)</td><td style="text-align:right">${formatCurrency(Number(record.deductions) * 0.6)}</td></tr>
                    <tr><td>Professional Tax & TDS</td><td style="text-align:right">${formatCurrency(Number(record.deductions) * 0.4)}</td></tr>
                    <tr class="total-row"><td>TOTAL DEDUCTIONS</td><td style="text-align:right">-${formatCurrency(record.deductions)}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="net-pay-box">
              <h3>Take Home Net Salary</h3>
              <div class="amount">${formatCurrency(record.netSalary)}</div>
            </div>

            <div class="footer">
              This is a computer-generated salary statement processed by Finance Department and does not require a physical signature.
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
      <div className="payslip-modal" style={{ maxWidth: "560px" }}>
        <div className="modal-header">
          <div>
            <p className="section-label">PAYROLL RECEIPT</p>
            <h2>Salary Slip Breakdown</h2>
          </div>

          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="payslip-header">
          <div>
            <strong>DCS CORPORATE</strong>
            <span>Enterprise Payroll</span>
          </div>

          <div>
            <strong>{record.month}</strong>
            <span>Payslip ID: {record.id}</span>
          </div>
        </div>

        <div className="payslip-employee">
          <strong>{record.employeeName}</strong>
          <span>
            {record.employeeId}
            {" · "}
            {record.department}
          </span>
        </div>

        <div className="payslip-breakdown">
          <div>
            <span>Basic Salary</span>
            <strong>{formatCurrency(record.basicSalary)}</strong>
          </div>

          <div>
            <span>Gross Salary</span>
            <strong>{formatCurrency(record.grossSalary)}</strong>
          </div>

          <div>
            <span>Deductions</span>
            <strong className="deduction-value">
              -{formatCurrency(record.deductions)}
            </strong>
          </div>

          <div className="payslip-net">
            <span>Net Take-Home Pay</span>
            <strong>{formatCurrency(record.netSalary)}</strong>
          </div>
        </div>

        <div className="modal-footer">
          <button className="secondary-button" onClick={onClose}>
            Close
          </button>

          <button
            className="primary-button"
            onClick={handlePrintDownload}
          >
            <Printer size={15} />
            Print / Save PDF
          </button>
        </div>
      </div>
    </div>
  );
}

export default PayslipModal;