import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { getDepartments } from "../../services/departmentService";

const recruitmentStages = [
  "All Stages",
  "Applied",
  "Shortlisted",
  "Technical Round",
  "HR Round",
  "Manager Round",
  "Selected",
  "Rejected",
];

const recruitmentStatuses = [
  "All Status",
  "Active",
  "Selected",
  "Rejected",
];

function RecruitmentFilters({
  search,
  setSearch,
  department,
  setDepartment,
  status,
  setStatus,
  stage,
  setStage,
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
    setStage("All Stages");
  };

  const hasFilters =
    search ||
    department !== "All Departments" ||
    status !== "All Status" ||
    stage !== "All Stages";

  return (
    <div className="recruitment-filters">
      <div className="recruitment-search">
        <Search size={17} />
        <input
          type="text"
          placeholder="Search candidate or position..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <select
        className="recruitment-dropdown"
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
        className="recruitment-dropdown"
        value={stage}
        onChange={(e) => setStage(e.target.value)}
      >
        {recruitmentStages.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <select
        className="recruitment-dropdown"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        {recruitmentStatuses.map((item) => (
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

export default RecruitmentFilters;