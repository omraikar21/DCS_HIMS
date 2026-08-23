import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { getDepartments } from "../../services/departmentService";

const leaveTypes = [
  "All Leave Types",
  "Casual Leave",
  "Sick Leave",
  "Earned Leave",
  "Maternity Leave",
  "Paternity Leave",
  "Unpaid Leave",
];

const leaveStatuses = [
  "All Status",
  "Pending",
  "Approved",
  "Rejected",
];

function LeaveFilters({
  search,
  setSearch,
  department,
  setDepartment,
  leaveType,
  setLeaveType,
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
    setLeaveType("All Leave Types");
    setStatus("All Status");
  };

  const hasFilters =
    search ||
    department !== "All Departments" ||
    leaveType !== "All Leave Types" ||
    status !== "All Status";

  return (
    <div className="leave-filters">
      {/* SEARCH */}
      <div className="leave-search">
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
        className="leave-dropdown"
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
      >
        {departmentsList.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      {/* LEAVE TYPE */}
      <select
        className="leave-dropdown"
        value={leaveType}
        onChange={(e) => setLeaveType(e.target.value)}
      >
        {leaveTypes.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      {/* STATUS */}
      <select
        className="leave-dropdown"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        {leaveStatuses.map((item) => (
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

export default LeaveFilters;