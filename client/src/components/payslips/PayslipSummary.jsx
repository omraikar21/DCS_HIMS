import {
  Receipt,
  Wallet,
  TrendingUp,
} from "lucide-react";

import StatCard from "../dashboard/StatCard";

function PayslipSummary({
  records,
}) {

  const totalNet =
    records.reduce(
      (total, item) =>
        total + item.netSalary,
      0
    );


  const average =
    records.length
      ? Math.round(
          totalNet /
            records.length
        )
      : 0;


  const formatCurrency = (
    value
  ) =>
    `₹${value.toLocaleString(
      "en-IN"
    )}`;


  return (
    <div className="stats-grid">

      <StatCard
        title="Payslips"
        value={records.length}
        note="Generated payslips"
        icon={Receipt}
        type="purple"
      />

      <StatCard
        title="Net Payroll"
        value={formatCurrency(
          totalNet
        )}
        note="Total net salary"
        icon={Wallet}
        type="green"
      />

      <StatCard
        title="Average"
        value={formatCurrency(
          average
        )}
        note="Average net salary"
        icon={TrendingUp}
        type="blue"
      />

      <StatCard
        title="Month"
        value="August"
        note="2026"
        icon={Receipt}
        type="orange"
      />

    </div>
  );
}

export default PayslipSummary;