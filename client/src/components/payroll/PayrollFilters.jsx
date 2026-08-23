import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { getDepartments } from "../../services/departmentService";

const payrollStatuses = [
  "All Status",
  "Processed",
  "Pending",
];

function PayrollFilters({
  search,
  setSearch,
  department,
  setDepartment,
  status,
  setStatus,
  month,
  setMonth,
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
    <div className="payroll-filters">
      {/* MONTH */}
      <div className="payroll-month">
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
      </div>

      {/* SEARCH */}
      <div className="payroll-search">
        <Search size={17} />
        <input
          type="text"
          placeholder="Search employee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* DEPARTMENT */}
      <select
        className="payroll-dropdown"
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
      >
        {departmentsList.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      {/* STATUS */}
      <select
        className="payroll-dropdown"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        {payrollStatuses.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      {/* CLEAR */}
      {hasFilters && (
        <button
          className="clear-filter-button"
          onClick={clearFilters}
        >
          <X size={14} />
          Clear
        </button>
      )}
    </div>
  );
}

export default PayrollFilters;