import {
  CheckCircle2,
  XCircle,
  Clock3,
  CalendarOff,
} from "lucide-react";

import StatCard from "../dashboard/StatCard";

function AttendanceSummary({
  records,
  isSelfView = false,
}) {
  const present =
    records.filter(
      (item) =>
        item.status === "Present"
    ).length;

  const absent =
    records.filter(
      (item) =>
        item.status === "Absent"
    ).length;

  const late =
    records.filter(
      (item) =>
        item.status === "Late"
    ).length;

  const leave =
    records.filter(
      (item) =>
        item.status === "On Leave"
    ).length;

  return (
    <div className="stats-grid">

      <StatCard
        title="Present"
        value={present}
        note={isSelfView ? "Days present" : "Employees present"}
        icon={CheckCircle2}
        type="green"
      />

      <StatCard
        title="Absent"
        value={absent}
        note={isSelfView ? "Days absent" : "Employees absent"}
        icon={XCircle}
        type="orange"
      />

      <StatCard
        title="Late"
        value={late}
        note={isSelfView ? "Late check-ins" : "Late check-ins"}
        icon={Clock3}
        type="purple"
      />

      <StatCard
        title="On Leave"
        value={leave}
        note={isSelfView ? "Approved leaves" : "Approved leave"}
        icon={CalendarOff}
        type="blue"
      />

    </div>
  );
}

export default AttendanceSummary;