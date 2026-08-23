import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { getDepartments } from "../../services/departmentService";

const employeeStatuses = [
  "All Status",
  "Active",
  "Inactive",
  "On Leave",
];

function EmployeeFilters({
  search,
  setSearch,
  department,
  setDepartment,
  status,
  setStatus,
}) {
  const [departmentsList, setDepartmentsList] = useState(["All Departments"]);

  useEffect(() => {
    getDepartments()
      .then((data) => {
        if (data && data.length > 0) {
          const names = data.map((d) => d.name).filter(Boolean);
          setDepartmentsList(["All Departments", ...names]);
        } else {
          setDepartmentsList(["All Departments"]);
        }
      })
      .catch(() => setDepartmentsList(["All Departments"]));
  }, []);

  const clearFilters = () => {
    setSearch("");
    setDepartment("All Departments");
    setStatus("All Status");
  };

  const hasFilters =
    search ||
    department !== "All Departments" ||
    status !== "All Status";

  return (
    <div className="employee-filters">
      <div className="employee-search">
        <Search size={17} />
        <input
          type="text"
          placeholder="Search by name, ID or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <select
        className="filter-dropdown"
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
      >
        {departmentsList.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <select
        className="filter-dropdown"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        {employeeStatuses.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      {hasFilters && (
        <button className="clear-filter-button" onClick={clearFilters}>
          <X size={14} />
          Clear
        </button>
      )}
    </div>
  );
}

export default EmployeeFilters;