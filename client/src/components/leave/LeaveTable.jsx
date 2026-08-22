import {
  Eye,
  Check,
  X,
  PauseCircle,
} from "lucide-react";

function LeaveTable({
  records,
  onView,
  onApprove,
  onReject,
  onHold,
  canApprove = true,
}) {

  return (
    <div className="leave-table-wrapper">

      <table className="leave-table">

        <thead>

          <tr>

            <th>
              Employee
            </th>

            <th>
              Leave Type
            </th>

            <th>
              Duration
            </th>

            <th>
              Days
            </th>

            <th>
              Reason
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
                colSpan="7"
                className="empty-table"
              >
                No leave requests
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

                    {/* EMPLOYEE */}

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


                    {/* TYPE */}

                    <td>
                      {record.leaveType}
                    </td>


                    {/* DURATION */}

                    <td>

                      <div className="leave-duration">

                        <span>
                          {record.fromDate}
                        </span>

                        <span>
                          to
                        </span>

                        <span>
                          {record.toDate}
                        </span>

                      </div>

                    </td>


                    {/* DAYS */}

                    <td>

                      <span className="leave-days">
                        {record.days}
                      </span>

                    </td>


                    {/* REASON */}

                    <td>
                      <span className="leave-reason">
                        {record.reason}
                      </span>
                    </td>


                    {/* STATUS */}

                    <td>

                      <span
                        className={`status-badge leave-status-${record.status.toLowerCase()}`}
                      >
                        {record.status}
                      </span>

                    </td>


                    {/* ACTIONS */}

                    <td>

                      <div className="leave-actions">

                        <button
                          title="View"
                          onClick={() =>
                            onView(record)
                          }
                        >
                          <Eye size={15} />
                        </button>


                        {canApprove && (
                          <>
                            {record.status !== "Approved" && (
                              <button
                                className="approve-button"
                                title="Approve"
                                onClick={() =>
                                  onApprove(
                                    record
                                  )
                                }
                              >
                                <Check
                                  size={15}
                                />
                              </button>
                            )}

                            {record.status !== "Rejected" && (
                              <button
                                className="reject-button"
                                title="Reject"
                                onClick={() =>
                                  onReject(
                                    record
                                  )
                                }
                              >
                                <X
                                  size={15}
                                />
                              </button>
                            )}

                            {record.status !== "Pending" && (
                              <button
                                style={{
                                  background: "#fef3c7",
                                  color: "#d97706",
                                  border: "none",
                                  borderRadius: "6px",
                                  padding: "6px",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                                title="Put on Hold"
                                onClick={() =>
                                  onHold && onHold(record)
                                }
                              >
                                <PauseCircle
                                  size={15}
                                />
                              </button>
                            )}
                          </>
                        )}

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

export default LeaveTable;