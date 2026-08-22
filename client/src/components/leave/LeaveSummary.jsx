import {
  Clock3,
  CheckCircle2,
  XCircle,
  CalendarDays,
} from "lucide-react";

import StatCard from "../dashboard/StatCard";

function LeaveSummary({ records }) {

  const pending =
    records.filter(
      (item) =>
        item.status === "Pending"
    ).length;

  const approved =
    records.filter(
      (item) =>
        item.status === "Approved"
    ).length;

  const rejected =
    records.filter(
      (item) =>
        item.status === "Rejected"
    ).length;

  const totalDays =
    records.reduce(
      (total, item) =>
        total + item.days,
      0
    );

  return (
    <div className="stats-grid">

      <StatCard
        title="Pending"
        value={pending}
        note="Awaiting approval"
        icon={Clock3}
        type="orange"
      />

      <StatCard
        title="Approved"
        value={approved}
        note="Approved requests"
        icon={CheckCircle2}
        type="green"
      />

      <StatCard
        title="Rejected"
        value={rejected}
        note="Rejected requests"
        icon={XCircle}
      />

      <StatCard
        title="Leave Days"
        value={totalDays}
        note="Total requested days"
        icon={CalendarDays}
        type="blue"
      />

    </div>
  );
}

export default LeaveSummary;