import {
  Search,
  X,
} from "lucide-react";

import { useMemo } from "react";

const departmentStatuses = [
  "All Status",
  "Active",
  "Inactive",
];

function DepartmentFilters({
  search,
  setSearch,
  location,
  setLocation,
  status,
  setStatus,
  departments = [],
}) {
  const departmentLocations = useMemo(() => {
    const locSet = new Set(["All Locations"]);
    departments.forEach((d) => {
      if (d.location && d.location !== "-") locSet.add(d.location);
    });
    return Array.from(locSet);
  }, [departments]);
  const clearFilters = () => {
    setSearch("");
    setLocation("All Locations");
    setStatus("All Status");
  };

  const hasFilters =
    search ||
    location !== "All Locations" ||
    status !== "All Status";

  return (
    <div className="department-filters">

      <div className="department-search">

        <Search size={17} />

        <input
          type="text"
          placeholder="Search department..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

      </div>


      <select
        className="department-dropdown"
        value={location}
        onChange={(e) =>
          setLocation(e.target.value)
        }
      >
        {departmentLocations.map(
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
        className="department-dropdown"
        value={status}
        onChange={(e) =>
          setStatus(e.target.value)
        }
      >
        {departmentStatuses.map(
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

export default DepartmentFilters;