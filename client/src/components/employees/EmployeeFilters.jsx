import { Search } from "lucide-react";

function EmployeeFilters({
  search,
  setSearch,
}) {
  return (
    <div className="employee-filters">
      <div className="employee-search" style={{ width: "100%" }}>
        <Search size={17} />
        <input
          type="text"
          placeholder="Search by name, ID or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
    </div>
  );
}

export default EmployeeFilters;