import {
  UserPlus,
  Clock3,
  CheckCircle2,
  FileCheck2,
} from "lucide-react";

import StatCard from "../dashboard/StatCard";

function OnboardingSummary({
  records,
}) {

  const started =
    records.filter(
      (item) =>
        item.status === "Started"
    ).length;

  const inProgress =
    records.filter(
      (item) =>
        item.status === "In Progress"
    ).length;

  const completed =
    records.filter(
      (item) =>
        item.status === "Completed"
    ).length;

  const documents =
    records.reduce(
      (total, item) =>
        total +
        Number(
          item.documents.split("/")[0]
        ),
      0
    );


  return (
    <div className="stats-grid">

      <StatCard
        title="New Joiners"
        value={records.length}
        note="Current onboarding"
        icon={UserPlus}
        type="purple"
      />

      <StatCard
        title="Started"
        value={started}
        note="Recently started"
        icon={Clock3}
        type="orange"
      />

      <StatCard
        title="Completed"
        value={completed}
        note="Onboarding completed"
        icon={CheckCircle2}
        type="green"
      />

      <StatCard
        title="Documents"
        value={documents}
        note="Documents submitted"
        icon={FileCheck2}
        type="blue"
      />

    </div>
  );
}

export default OnboardingSummary;