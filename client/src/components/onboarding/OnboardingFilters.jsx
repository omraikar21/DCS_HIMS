import {
  Search,
  X,
} from "lucide-react";

const onboardingDepartments = [
  "All Departments",
  "Development",
  "AI/ML",
  "IoT",
  "HR",
  "Finance",
];

const onboardingStatuses = [
  "All Status",
  "Started",
  "In Progress",
  "Completed",
];

function OnboardingFilters({
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
    <div className="onboarding-filters">

      <div className="onboarding-search">

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


      <select
        className="onboarding-dropdown"
        value={department}
        onChange={(e) =>
          setDepartment(e.target.value)
        }
      >

        {onboardingDepartments.map(
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


      <select
        className="onboarding-dropdown"
        value={status}
        onChange={(e) =>
          setStatus(e.target.value)
        }
      >

        {onboardingStatuses.map(
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

export default OnboardingFilters;