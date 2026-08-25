import { Search } from "lucide-react";

function AttendanceFilters({
  search,
  setSearch,
}) {
  return (
    <div className="attendance-filters">
      <div className="attendance-search" style={{ width: "100%" }}>
        <Search size={17} />
        <input
          type="text"
          placeholder="Search by employee name or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
    </div>
  );
}

export default AttendanceFilters;