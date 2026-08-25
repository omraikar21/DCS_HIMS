import { Search } from "lucide-react";

function DocumentFilters({
  search,
  setSearch,
}) {
  return (
    <div className="document-filters">
      <div className="document-search" style={{ width: "100%" }}>
        <Search size={17} />
        <input
          type="text"
          placeholder="Search document or employee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
    </div>
  );
}

export default DocumentFilters;