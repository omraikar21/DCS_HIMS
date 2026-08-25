import {
  Receipt,
  Wallet,
  TrendingUp,
  Calendar,
} from "lucide-react";

import StatCard from "../dashboard/StatCard";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function PayslipSummary({ records }) {
  // Use netSalaryNum (number) not netSalary (formatted string)
  const totalNet = records.reduce(
    (total, item) => total + (Number(item.netSalaryNum) || 0),
    0
  );

  const average = records.length
    ? Math.round(totalNet / records.length)
    : 0;

  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN")}`;

  // Derive current month label from the first record with a valid rawDate
  const latestRecord = records.find((r) => r.rawDate && r.rawDate.length >= 7);
  const currentMonthLabel = latestRecord
    ? (() => {
        const [, month] = latestRecord.rawDate.split("-");
        const mIdx = Number(month) - 1;
        return MONTH_NAMES[mIdx] || "August";
      })()
    : "August";
  const currentYear = latestRecord ? latestRecord.rawDate.split("-")[0] : "2026";

  return (
    <div className="stats-grid">
      <StatCard
        title="Total Payslips"
        value={records.length}
        note="Generated payslips"
        icon={Receipt}
        type="purple"
      />
      <StatCard
        title="Net Payroll"
        value={formatCurrency(totalNet)}
        note="Total net salary disbursed"
        icon={Wallet}
        type="green"
      />
      <StatCard
        title="Average Salary"
        value={formatCurrency(average)}
        note="Average net per employee"
        icon={TrendingUp}
        type="blue"
      />
      <StatCard
        title="Current Month"
        value={currentMonthLabel}
        note={currentYear}
        icon={Calendar}
        type="orange"
      />
    </div>
  );
}

export default PayslipSummary;