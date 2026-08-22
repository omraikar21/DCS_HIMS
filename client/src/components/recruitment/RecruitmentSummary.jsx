import {
  Users,
  UserCheck,
  Clock3,
  BriefcaseBusiness,
} from "lucide-react";

import StatCard from "../dashboard/StatCard";

function RecruitmentSummary({
  records,
}) {

  const totalCandidates =
    records.length;

  const shortlisted =
    records.filter(
      (item) =>
        item.status === "Shortlisted"
    ).length;

  const inProgress =
    records.filter(
      (item) =>
        item.status === "In Progress"
    ).length;

  const selected =
    records.filter(
      (item) =>
        item.status === "Selected"
    ).length;


  return (
    <div className="stats-grid">

      <StatCard
        title="Candidates"
        value={totalCandidates}
        note="Total applications"
        icon={Users}
        type="purple"
      />

      <StatCard
        title="Shortlisted"
        value={shortlisted}
        note="Shortlisted candidates"
        icon={UserCheck}
        type="green"
      />

      <StatCard
        title="In Progress"
        value={inProgress}
        note="Interview process"
        icon={Clock3}
        type="orange"
      />

      <StatCard
        title="Selected"
        value={selected}
        note="Selected candidates"
        icon={BriefcaseBusiness}
        type="blue"
      />

    </div>
  );
}

export default RecruitmentSummary;