import {
  Search,
  X,
} from "lucide-react";

const payslipDepartments = [
  "All Departments",
  "Development",
  "AI/ML",
  "IoT",
  "HR",
  "Finance",
];

function PayslipFilters({
  search,
  setSearch,
  department,
  setDepartment,
  month,
  setMonth,
}) {

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
          onChange={(e) =>
            setMonth(e.target.value)
          }
        />

      </div>


      <div className="payslip-search">

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
        className="payslip-dropdown"
        value={department}
        onChange={(e) =>
          setDepartment(e.target.value)
        }
      >

        {payslipDepartments.map(
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

export default PayslipFilters;