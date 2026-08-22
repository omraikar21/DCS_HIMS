import {
  WalletCards,
  CheckCircle2,
  Clock3,
  TrendingUp,
} from "lucide-react";

import StatCard from "../dashboard/StatCard";

function PayrollSummary({ records }) {

  const totalPayroll =
    records.reduce(
      (total, item) =>
        total + item.netSalary,
      0
    );

  const processed =
    records.filter(
      (item) =>
        item.status === "Processed"
    ).length;

  const pending =
    records.filter(
      (item) =>
        item.status === "Pending"
    ).length;

  const averageSalary =
    records.length
      ? Math.round(
          totalPayroll /
            records.length
        )
      : 0;


  const formatCurrency = (value) => {
    return `₹${value.toLocaleString(
      "en-IN"
    )}`;
  };


  return (
    <div className="stats-grid">

      <StatCard
        title="Total Payroll"
        value={formatCurrency(
          totalPayroll
        )}
        note="August 2026"
        icon={WalletCards}
        type="purple"
      />

      <StatCard
        title="Processed"
        value={processed}
        note="Payroll processed"
        icon={CheckCircle2}
        type="green"
      />

      <StatCard
        title="Pending"
        value={pending}
        note="Awaiting processing"
        icon={Clock3}
        type="orange"
      />

      <StatCard
        title="Average Salary"
        value={formatCurrency(
          averageSalary
        )}
        note="Per employee"
        icon={TrendingUp}
        type="blue"
      />

    </div>
  );
}

export default PayrollSummary;