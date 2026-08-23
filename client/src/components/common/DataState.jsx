import EmptyState
  from "./EmptyState";

function DataState({
  loading = false,
  error = null,
  isEmpty = false,
  onRetry,
  emptyTitle = "No data found",
  emptyMessage = "There is nothing to display here.",
  children,
}) {
  if (loading) {
    return (
      <div className="employees-page">
        <p>Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="employees-page">
        <p>Failed to load data.</p>
        <p>{error}</p>

        {onRetry && (
          <button
            className="primary-button"
            onClick={onRetry}
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <EmptyState
        title={emptyTitle}
        message={emptyMessage}
      />
    );
  }

  return children;
}

export default DataState;