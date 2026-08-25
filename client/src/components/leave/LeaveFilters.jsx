import { Search } from "lucide-react";

function LeaveFilters({
  search,
  setSearch,
}) {
  return (
    <div className="leave-filters">
      <div className="leave-search" style={{ width: "100%" }}>
        <Search size={17} />
        <input
          type="text"
          placeholder="Search leave applications by employee name or reason..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
    </div>
  );
}

export default LeaveFilters;