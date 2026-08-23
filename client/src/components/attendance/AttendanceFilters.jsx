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
  defaultDate = "",
  isSelfView = false,
}) {
  const [departmentsList, setDepartmentsList] = useState(["All Departments"]);

  useEffect(() => {
    if (!isSelfView) {
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
    }
  }, [isSelfView]);

  const clearFilters = () => {
    setSearch("");
    setDepartment("All Departments");
    setStatus("All Status");
    setDate(defaultDate || "");
  };

  const hasFilters = Boolean(
    (search && search.trim().length > 0) ||
    (department && department !== "All Departments") ||
    (status && status !== "All Status") ||
    (date !== defaultDate)
  );

  return (
    <div className="attendance-filters">
      {/* DATE */}
      <div className="attendance-date">
        <input
          type="date"
          value={date}
          title="Filter by Date"
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {/* SEARCH (ONLY FOR ADMIN / HR) */}
      {!isSelfView && (
        <div className="attendance-search">
          <Search size={17} />
          <input
            type="text"
            placeholder="Search employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* DEPARTMENT (ONLY FOR ADMIN / HR) */}
      {!isSelfView && (
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
      )}

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

      {/* ALL DATES / CLEAR */}
      {hasFilters && (
        <button
          className="clear-filter-button"
          onClick={clearFilters}
          title="Clear all filters & show all history"
        >
          <X size={14} />
          {isSelfView ? "Show All History" : "Clear"}
        </button>
      )}
    </div>
  );
}

export default AttendanceFilters;