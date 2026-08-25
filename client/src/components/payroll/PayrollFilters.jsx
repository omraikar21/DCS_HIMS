import { Search } from "lucide-react";

function PayrollFilters({
  search,
  setSearch,
}) {
  return (
    <div className="payroll-filters">
      <div className="payroll-search" style={{ width: "100%" }}>
        <Search size={17} />
        <input
          type="text"
          placeholder="Search employee by name, ID or account..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
    </div>
  );
}

export default PayrollFilters;