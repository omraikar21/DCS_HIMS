import {
  Eye,
  Check,
  X,
  PauseCircle,
  Trash2,
} from "lucide-react";

function LeaveTable({
  records,
  onView,
  onApprove,
  onReject,
  onHold,
  onDelete,
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

                    {/* STATUS & APPROVER ROUTING BADGE */}
                    <td>
                      <div>
                        <span
                          className={`status-badge leave-status-${record.status.toLowerCase()}`}
                        >
                          {record.status}
                        </span>

                        <small
                          style={{
                            display: "block",
                            marginTop: "4px",
                            fontSize: "10.5px",
                            fontWeight: "700",
                            color:
                              record.applicantRole === "ADMIN"
                                ? "#7C3AED"
                                : (record.applicantRole === "HR" || record.applicantRole === "FINANCE")
                                ? "#2563EB"
                                : record.applicantRole === "TEAM_LEAD"
                                ? "#DB2777"
                                : "#059669",
                          }}
                        >
                          {record.applicantRole === "ADMIN"
                            ? "→ Super Admin Approval"
                            : (record.applicantRole === "HR" || record.applicantRole === "FINANCE")
                            ? "→ Admin Approval"
                            : record.applicantRole === "TEAM_LEAD"
                            ? "→ HR Approval"
                            : "→ Team Lead / HR Approval"}
                        </small>
                      </div>
                    </td>

                    {/* ACTIONS */}
                    <td>
                      <div className="leave-actions">
                        <button
                          title="View Details"
                          onClick={() => onView(record)}
                        >
                          <Eye size={15} />
                        </button>

                        {Boolean(record.canApproveThisRecord) && (
                          <>
                            {record.status !== "Approved" && (
                              <button
                                className="approve-button"
                                title="Approve Leave"
                                onClick={() => onApprove(record)}
                              >
                                <Check size={15} />
                              </button>
                            )}

                            {record.status !== "Rejected" && (
                              <button
                                className="reject-button"
                                title="Reject Leave"
                                onClick={() => onReject(record)}
                              >
                                <X size={15} />
                              </button>
                            )}

                            {record.status !== "Pending" && (
                              <button
                                style={{
                                  background: "#FEF3C7",
                                  color: "#D97706",
                                  border: "none",
                                  borderRadius: "6px",
                                  padding: "6px",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                                title="Put on Hold"
                                onClick={() => onHold && onHold(record)}
                              >
                                <PauseCircle size={15} />
                              </button>
                            )}
                          </>
                        )}

                        {onDelete && Boolean(record.canDeleteThisRecord) && (
                          <button
                            style={{
                              background: "#FFF1F2",
                              color: "#E11D48",
                              border: "1px solid #FECDD3",
                              borderRadius: "6px",
                              padding: "6px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            title="Delete My Leave Request"
                            onClick={() => onDelete(record)}
                          >
                            <Trash2 size={15} />
                          </button>
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