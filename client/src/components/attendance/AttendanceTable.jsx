import {
  Pencil,
} from "lucide-react";

function AttendanceTable({
  records,
  onEdit,
  canEdit = true,
}) {
  return (
    <div className="attendance-table-wrapper">

      <table className="attendance-table">

        <thead>

          <tr>

            <th>
              Employee
            </th>

            <th>
              Department
            </th>

            <th>
              Check In
            </th>

            <th>
              Check Out
            </th>

            <th>
              Working Hours
            </th>

            <th>
              Status
            </th>

            {canEdit && (
              <th>
                Action
              </th>
            )}

          </tr>

        </thead>


        <tbody>

          {records.length === 0 ? (

            <tr>

              <td
                colSpan={canEdit ? 7 : 6}
                className="empty-table"
              >
                No attendance records
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
                      {record.department}
                    </td>


                    <td>
                      {record.checkIn}
                    </td>


                    <td>
                      {record.checkOut}
                    </td>


                    <td>
                      {record.workingHours}
                    </td>


                    <td>

                      <span
                        className={
                          `status-badge attendance-status-${record.status
                            .toLowerCase()
                            .replace(
                              " ",
                              "-"
                            )}`
                        }
                      >
                        {record.status}
                      </span>

                    </td>


                    {canEdit && (
                      <td>

                        <button
                          className="attendance-edit-button"
                          onClick={() =>
                            onEdit(record)
                          }
                        >
                          <Pencil
                            size={15}
                          />
                        </button>

                      </td>
                    )}

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

export default AttendanceTable;