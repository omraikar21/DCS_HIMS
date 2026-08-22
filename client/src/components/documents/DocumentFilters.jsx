import {
  Search,
  X,
} from "lucide-react";

const documentCategories = [
  "All Categories",
  "Identity",
  "Education",
  "Employment",
  "Financial",
  "Policy",
];

const documentDepartments = [
  "All Departments",
  "Development",
  "AI/ML",
  "IoT",
  "HR",
  "Finance",
];

const documentStatuses = [
  "All Status",
  "Verified",
  "Pending",
  "Rejected",
];

function DocumentFilters({
  search,
  setSearch,
  category,
  setCategory,
  department,
  setDepartment,
  status,
  setStatus,
}) {

  const clearFilters = () => {
    setSearch("");
    setCategory("All Categories");
    setDepartment("All Departments");
    setStatus("All Status");
  };


  const hasFilters =
    search ||
    category !== "All Categories" ||
    department !== "All Departments" ||
    status !== "All Status";


  return (
    <div className="document-filters">

      <div className="document-search">

        <Search size={17} />

        <input
          type="text"
          placeholder="Search document or employee..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

      </div>


      <select
        className="document-dropdown"
        value={category}
        onChange={(e) =>
          setCategory(e.target.value)
        }
      >

        {documentCategories.map(
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
        className="document-dropdown"
        value={department}
        onChange={(e) =>
          setDepartment(e.target.value)
        }
      >

        {documentDepartments.map(
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
        className="document-dropdown"
        value={status}
        onChange={(e) =>
          setStatus(e.target.value)
        }
      >

        {documentStatuses.map(
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

export default DocumentFilters;