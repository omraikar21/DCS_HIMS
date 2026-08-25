import { Search } from "lucide-react";

function DepartmentFilters({
  search,
  setSearch,
}) {
  return (
    <div className="department-filters">
      <div className="department-search" style={{ width: "100%" }}>
        <Search size={17} />
        <input
          type="text"
          placeholder="Search department name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
    </div>
  );
}

export default DepartmentFilters;