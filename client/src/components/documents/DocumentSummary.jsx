import {
  Files,
  CheckCircle2,
  FolderKanban,
} from "lucide-react";

import StatCard from "../dashboard/StatCard";

function DocumentSummary({ records = [] }) {
  const verified = records.filter(
    (item) => item.status === "Verified" || !item.status
  ).length;

  const uniqueCategories = new Set(
    records.map((item) => item.category).filter(Boolean)
  ).size;

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
        title="Verified & Approved"
        value={verified}
        note="Official verified records"
        icon={CheckCircle2}
        type="green"
      />

      <StatCard
        title="Document Categories"
        value={uniqueCategories || 1}
        note="Structured document types"
        icon={FolderKanban}
        type="blue"
      />
    </div>
  );
}

export default DocumentSummary;