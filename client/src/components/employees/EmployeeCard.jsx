import {
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

function EmployeeCard({ employee }) {
  const initials = employee.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="employee-card">

      <div className="employee-card-top">

        <div className="employee-avatar large">
          {initials}
        </div>

        <div>
          <h3>
            {employee.name}
          </h3>

          <span>
            {employee.id}
          </span>
        </div>

      </div>


      <div className="employee-card-info">

        <p>
          <Mail size={14} />
          {employee.email}
        </p>

        <p>
          <Phone size={14} />
          {employee.phone}
        </p>

        <p>
          <MapPin size={14} />
          {employee.location}
        </p>

      </div>


      <div className="employee-card-bottom">

        <span>
          {employee.department}
        </span>

        <span
          className={`status-badge ${
            employee.status === "Active"
              ? "success"
              : employee.status === "On Leave"
              ? "warning"
              : "danger"
          }`}
        >
          {employee.status}
        </span>

      </div>

    </div>
  );
}

export default EmployeeCard;