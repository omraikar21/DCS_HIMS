import {
  Search,
  X,
} from "lucide-react";

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

const leaveDepartments = [
  "All Departments",
  "Development",
  "AI/ML",
  "IoT",
  "HR",
  "Finance",
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
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

      </div>


      {/* DEPARTMENT */}

      <select
        className="leave-dropdown"
        value={department}
        onChange={(e) =>
          setDepartment(e.target.value)
        }
      >
        {leaveDepartments.map(
          (item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          )
        )}
      </select>


      {/* LEAVE TYPE */}

      <select
        className="leave-dropdown"
        value={leaveType}
        onChange={(e) =>
          setLeaveType(e.target.value)
        }
      >
        {leaveTypes.map(
          (item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          )
        )}
      </select>


      {/* STATUS */}

      <select
        className="leave-dropdown"
        value={status}
        onChange={(e) =>
          setStatus(e.target.value)
        }
      >
        {leaveStatuses.map(
          (item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          )
        )}
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