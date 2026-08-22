import {
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

const departments = [
  "All Departments",
  "Development",
  "AI/ML",
  "IoT",
  "HR",
  "Finance",
];

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
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

      </div>


      <div className="filter-select">

        <SlidersHorizontal size={16} />

        <select
          value={department}
          onChange={(e) =>
            setDepartment(e.target.value)
          }
        >
          {departments.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>

      </div>


      <select
        className="filter-dropdown"
        value={status}
        onChange={(e) =>
          setStatus(e.target.value)
        }
      >
        {employeeStatuses.map((item) => (
          <option
            key={item}
            value={item}
          >
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

export default EmployeeFilters;