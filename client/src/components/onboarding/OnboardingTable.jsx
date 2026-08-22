import {
  Eye,
  Pencil,
} from "lucide-react";

function OnboardingTable({
  records,
  onView,
  onEdit,
}) {

  return (
    <div className="onboarding-table-wrapper">

      <table className="onboarding-table">

        <thead>

          <tr>

            <th>
              Employee
            </th>

            <th>
              Position
            </th>

            <th>
              Department
            </th>

            <th>
              Joining Date
            </th>

            <th>
              Documents
            </th>

            <th>
              Progress
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

          {records.length === 0 ? (

            <tr>

              <td
                colSpan="8"
                className="empty-table"
              >
                No onboarding records
                found.
              </td>

            </tr>

          ) : (

            records.map(
              (record) => {

                const initials =
                  record.employeeName
                    .split(" ")
                    .map(
                      (word) =>
                        word[0]
                    )
                    .join("")
                    .slice(0, 2);


                return (

                  <tr
                    key={record.id}
                  >

                    <td>

                      <div className="employee-cell">

                        <div className="employee-avatar">
                          {initials}
                        </div>

                        <div>

                          <strong>
                            {record.employeeName}
                          </strong>

                          <span>
                            {record.employeeId}
                          </span>

                        </div>

                      </div>

                    </td>


                    <td>
                      {record.position}
                    </td>


                    <td>
                      {record.department}
                    </td>


                    <td>
                      {record.joiningDate}
                    </td>


                    <td>
                      {record.documents}
                    </td>


                    <td>

                      <div className="onboarding-progress">

                        <div className="progress-track">

                          <div
                            className="progress-fill"
                            style={{
                              width: `${record.progress}%`,
                            }}
                          />

                        </div>

                        <span>
                          {record.progress}%
                        </span>

                      </div>

                    </td>


                    <td>

                      <span
                        className={`status-badge onboarding-status-${record.status
                          .toLowerCase()
                          .replaceAll(
                            " ",
                            "-"
                          )}`}
                      >
                        {record.status}
                      </span>

                    </td>


                    <td>

                      <div className="onboarding-actions">

                        <button
                          title="View"
                          onClick={() =>
                            onView(record)
                          }
                        >
                          <Eye size={15} />
                        </button>

                        <button
                          title="Edit"
                          onClick={() =>
                            onEdit(record)
                          }
                        >
                          <Pencil size={15} />
                        </button>

                      </div>

                    </td>

                  </tr>

                );

              }
            )

          )}

        </tbody>

      </table>

    </div>
  );
}

export default OnboardingTable;