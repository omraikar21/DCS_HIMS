function StatCard({
  title,
  value,
  note,
  icon: Icon,
  type = "purple",
}) {
  return (
    <div className="stat-card">

      <div
        className={`stat-icon ${type}`}
      >
        <Icon size={20} />
      </div>

      <div className="stat-content">

        <p className="stat-title">
          {title}
        </p>

        <h3 className="stat-value">
          {value}
        </h3>

        <span className="stat-note">
          {note}
        </span>

      </div>

    </div>
  );
}

export default StatCard;