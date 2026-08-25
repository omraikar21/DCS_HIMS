import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

function DepartmentTable({
  departments,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div className="department-table-wrapper">

      <table className="department-table">

        <thead>

          <tr>

            <th>
              Department
            </th>

            <th>
              Allocated Admin
            </th>

            <th>
              Employees
            </th>

            <th>
              Status
            </th>

            <th>
              Actions
            </th>

          </tr>

        </thead>


        <tbody>

          {departments.length === 0 ? (

            <tr>

              <td
                colSpan="5"
                className="empty-table"
              >
                No departments found.
              </td>

            </tr>

          ) : (

            departments.map(
              (department) => (

                <tr
                  key={department.id}
                >

                  <td>

                    <div className="department-cell">

                      <div className="department-icon">
                        {department.code}
                      </div>

                      <div>

                        <strong>
                          {department.name}
                        </strong>

                        <span>
                          {department.id}
                        </span>

                      </div>

                    </div>

                  </td>


                  <td>
                    <span
                      style={{
                        fontSize: "12.5px",
                        fontWeight: "700",
                        color: department.allocatedAdmin !== "Unassigned" ? "#BE185D" : "#64748B",
                        backgroundColor: department.allocatedAdmin !== "Unassigned" ? "#FFF0F7" : "#F8FAFC",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        border: department.allocatedAdmin !== "Unassigned" ? "1px solid #F3D3E7" : "1px solid #E2E8F0",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {department.allocatedAdmin}
                    </span>
                  </td>


                  <td>

                    <span className="employee-count">

                      {department.employees}

                    </span>

                  </td>


                  <td>

                    <span
                      className={`status-badge ${
                        department.status ===
                        "Active"
                          ? "success"
                          : "danger"
                      }`}
                    >
                      {department.status}
                    </span>

                  </td>


                  <td>

                    <div className="employee-actions">
                      <button
                        title="View department"
                        onClick={() =>
                          onView(department)
                        }
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        title="Edit department"
                        onClick={() =>
                          onEdit(department)
                        }
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        title="Delete department"
                        onClick={() =>
                          onDelete && onDelete(department)
                        }
                        style={{ color: "#E11D48" }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                  </td>

                </tr>

              )
            )

          )}

        </tbody>

      </table>

    </div>
  );
}

export default DepartmentTable;