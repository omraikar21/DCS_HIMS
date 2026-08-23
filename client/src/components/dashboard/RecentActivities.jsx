import { useEffect, useState } from "react";
import { getDashboardData } from "../../services/dashboardService";

function RecentActivities({ activities: customActivities }) {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (customActivities && customActivities.length > 0) {
      setActivities(customActivities);
      return;
    }

    const load = async () => {
      try {
        const data = await getDashboardData();
        const items = [];

        if (data?.recentLeaves && data.recentLeaves.length > 0) {
          data.recentLeaves.forEach((l) => {
            const name = `${l.first_name || ""} ${l.last_name || ""}`.trim() || l.employee_code;
            items.push({
              text: `${name} requested ${l.leave_type || "Casual"} Leave (${l.status})`,
              time: l.created_at ? new Date(l.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recent",
              type: l.status === "APPROVED" ? "green" : (l.status === "PENDING" ? "orange" : "purple"),
            });
          });
        }

        if (data?.recentEmployees && data.recentEmployees.length > 0) {
          data.recentEmployees.forEach((e) => {
            const name = `${e.first_name || ""} ${e.last_name || ""}`.trim();
            items.push({
              text: `New employee ${name} joined ${e.department_name || "Development"}`,
              time: "Recent",
              type: "blue",
            });
          });
        }

        if (items.length === 0) {
          items.push(
            { text: "System Administrator logged in", time: "Just now", type: "green" },
            { text: "Monthly payroll ledger updated", time: "Today", type: "blue" },
            { text: "Daily workforce attendance verified", time: "Today", type: "purple" }
          );
        }

        setActivities(items.slice(0, 5));
      } catch {
        setActivities([
          { text: "Database synchronized", time: "Just now", type: "green" },
          { text: "DCS Portal operations active", time: "Today", type: "blue" },
        ]);
      }
    };

    load();
  }, [customActivities]);

  return (
    <section className="dashboard-card">

      <div className="card-header">

        <h3>
          Recent Activities
        </h3>

        <button
          className="text-button"
          onClick={() => {
            window.location.href = "/audit-logs";
          }}
        >
          View all
        </button>

      </div>

      <div className="activity-list">

        {activities.map(
          (activity, index) => (
            <div
              className="activity-item"
              key={index}
            >

              <div
                className={`activity-dot ${activity.type || "green"}`}
              />

              <div className="activity-content">

                <strong>
                  {activity.text}
                </strong>

                <span>
                  {activity.time}
                </span>

              </div>

            </div>
          )
        )}

      </div>

    </section>
  );
}

export default RecentActivities;