import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { getDepartments } from "../../services/departmentService";

function PayslipFilters({
  search,
  setSearch,
  department,
  setDepartment,
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
  };

  const hasFilters =
    search ||
    department !== "All Departments";

  return (
    <div className="payslip-filters">
      <div className="payslip-month">
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
      </div>

      <div className="payslip-search">
        <Search size={17} />
        <input
          type="text"
          placeholder="Search employee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <select
        className="payslip-dropdown"
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
      >
        {departmentsList.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

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

export default PayslipFilters;