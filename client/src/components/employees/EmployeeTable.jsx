import {
  Eye,
  Pencil,
} from "lucide-react";

function EmployeeTable({
  employees,
  onView,
  onEdit,
  canEdit = true,
}) {
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2);
  };

  return (
    <div className="employee-table-wrapper">

      <table className="employee-table">

        <thead>
          <tr>
            <th>Employee</th>
            <th>Department</th>
            <th>Designation</th>
            <th>Location</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>


        <tbody>

          {employees.length === 0 ? (
            <tr>
              <td
                colSpan="6"
                className="empty-table"
              >
                No employees found.
              </td>
            </tr>
          ) : (
            employees.map((employee) => (

              <tr key={employee.id}>

                <td>

                  <div className="employee-cell">

                    <div className="employee-avatar">
                      {getInitials(employee.name)}
                    </div>

                    <div>
                      <strong>
                        {employee.name}
                      </strong>

                      <span>
                        {employee.id}
                      </span>
                    </div>

                  </div>

                </td>


                <td>
                  {employee.department}
                </td>


                <td>
                  {employee.designation}
                </td>


                <td>
                  {employee.location}
                </td>


                <td>

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

                </td>


                <td>

                  <div className="employee-actions">

                    <button
                      title="View employee"
                      onClick={() =>
                        onView(employee)
                      }
                    >
                      <Eye size={16} />
                    </button>

                    {canEdit && (
                      <button
                        title="Edit employee"
                        onClick={() =>
                          onEdit(employee)
                        }
                      >
                        <Pencil size={16} />
                      </button>
                    )}

                  </div>

                </td>

              </tr>

            ))
          )}

        </tbody>

      </table>

    </div>
  );
}

export default EmployeeTable;