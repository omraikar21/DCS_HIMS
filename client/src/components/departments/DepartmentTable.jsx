import {
  Eye,
  Pencil,
} from "lucide-react";

function DepartmentTable({
  departments,
  onView,
  onEdit,
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
              Employees
            </th>

            <th>
              Location
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

                    <span className="employee-count">

                      {department.employees}

                    </span>

                  </td>



                  <td>
                    {department.location}
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