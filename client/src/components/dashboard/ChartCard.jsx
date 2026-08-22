import { useNavigate } from "react-router-dom";

function ChartCard({
  title,
  children,
  action = "View report",
  onAction,
}) {
  const navigate = useNavigate();

  const handleActionClick = () => {
    if (typeof onAction === "function") {
      onAction();
    } else {
      navigate("/reports");
    }
  };

  return (
    <section className="chart-card">

      <div className="chart-card-header">

        <h3>
          {title}
        </h3>

        {action && (
          <button
            className="chart-action"
            onClick={handleActionClick}
            type="button"
            title={`View detailed report for ${title}`}
          >
            {action}
          </button>
        )}

      </div>

      <div className="chart-container">
        {children}
      </div>

    </section>
  );
}

export default ChartCard;