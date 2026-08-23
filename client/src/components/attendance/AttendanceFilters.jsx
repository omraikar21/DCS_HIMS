import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { getDepartments } from "../../services/departmentService";

const attendanceStatuses = [
  "All Status",
  "Present",
  "Absent",
  "Late",
  "On Leave",
  "Half Day",
  "WFH",
];

function AttendanceFilters({
  search,
  setSearch,
  department,
  setDepartment,
  status,
  setStatus,
  date,
  setDate,
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
    <div className="attendance-filters">
      {/* DATE */}
      <div className="attendance-date">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {/* SEARCH */}
      <div className="attendance-search">
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
        className="attendance-dropdown"
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
        className="attendance-dropdown"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        {attendanceStatuses.map((item) => (
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

export default AttendanceFilters;