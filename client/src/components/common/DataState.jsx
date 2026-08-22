import LoadingSpinner
  from "./LoadingSpinner";

import LoadingSkeleton
  from "./LoadingSkeleton";

import ErrorMessage
  from "./ErrorMessage";

import EmptyState
  from "./EmptyState";


function DataState({
  loading = false,

  error = null,

  isEmpty = false,

  onRetry,

  loadingType = "spinner",

  emptyTitle = "No data found",

  emptyMessage =
    "There is nothing to display here.",

  children,
}) {

  /*
   * ---------------------------------------
   * LOADING
   * ---------------------------------------
   */

  if (loading) {
  return (
    <div className="employees-page">
      <p>Loading employees...</p>
    </div>
  );
}


  /*
   * ---------------------------------------
   * ERROR
   * ---------------------------------------
   */

  if (error) {
  return (
    <div className="employees-page">
      <p>Failed to load employees.</p>
      <p>{error}</p>

      <button
        className="primary-button"
        onClick={loadEmployees}
      >
        Retry
      </button>
    </div>
  );
}


  /*
   * ---------------------------------------
   * EMPTY
   * ---------------------------------------
   */

  if (isEmpty) {

    return (
      <EmptyState
        title={emptyTitle}
        message={emptyMessage}
      />
    );

  }


  /*
   * ---------------------------------------
   * DATA
   * ---------------------------------------
   */

  return children;
}


export default DataState;