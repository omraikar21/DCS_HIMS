import {
  Files,
  CheckCircle2,
  Clock3,
  HardDrive,
} from "lucide-react";

import StatCard from "../dashboard/StatCard";

function DocumentSummary({ records }) {

  const verified =
    records.filter(
      (item) =>
        item.status === "Verified"
    ).length;

  const pending =
    records.filter(
      (item) =>
        item.status === "Pending"
    ).length;

  return (
    <div className="stats-grid">

      <StatCard
        title="Total Documents"
        value={records.length}
        note="Uploaded documents"
        icon={Files}
        type="purple"
      />

      <StatCard
        title="Verified"
        value={verified}
        note="Verified documents"
        icon={CheckCircle2}
        type="green"
      />

      <StatCard
        title="Pending"
        value={pending}
        note="Awaiting verification"
        icon={Clock3}
        type="orange"
      />

      <StatCard
        title="Storage"
        value="1.9 MB"
        note="Current document usage"
        icon={HardDrive}
        type="blue"
      />

    </div>
  );
}

export default DocumentSummary;