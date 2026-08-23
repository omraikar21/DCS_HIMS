import {
  Pencil,
} from "lucide-react";

function AttendanceTable({
  records,
  onEdit,
  canEdit = true,
  isSelfView = false,
}) {
  if (isSelfView) {
    return (
      <div className="attendance-table-wrapper">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Working Hours</th>
              <th>Status</th>
              <th>Remarks</th>
            </tr>
          </thead>

          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-table">
                  No personal attendance records found.
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record.id}>
                  <td>
                    <strong style={{ color: "#0F172A", fontWeight: "600" }}>
                      {record.date}
                    </strong>
                  </td>
                  <td>{record.checkIn}</td>
                  <td>{record.checkOut}</td>
                  <td>{record.workHours || record.workingHours}</td>
                  <td>
                    <span
                      className={`status-badge attendance-status-${record.status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td style={{ color: "#64748B", fontSize: "13px" }}>
                    {record.remarks || "--"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="attendance-table-wrapper">
      <table className="attendance-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Department</th>
            <th>Check In</th>
            <th>Check Out</th>
            <th>Working Hours</th>
            <th>Status</th>
            {canEdit && <th>Action</th>}
          </tr>
        </thead>

        <tbody>
          {records.length === 0 ? (
            <tr>
              <td colSpan={canEdit ? 7 : 6} className="empty-table">
                No attendance records found.
              </td>
            </tr>
          ) : (
            records.map((record) => {
              const initials = (record.employeeName || "User")
                .split(" ")
                .map((word) => word[0])
                .join("")
                .slice(0, 2);

              return (
                <tr key={record.id}>
                  <td>
                    <div className="employee-cell">
                      <div className="employee-avatar">{initials}</div>
                      <div>
                        <strong>{record.employeeName}</strong>
                        <span>{record.employeeId}</span>
                      </div>
                    </div>
                  </td>

                  <td>{record.department}</td>
                  <td>{record.checkIn}</td>
                  <td>{record.checkOut}</td>
                  <td>{record.workHours || record.workingHours}</td>
                  <td>
                    <span
                      className={`status-badge attendance-status-${record.status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {record.status}
                    </span>
                  </td>

                  {canEdit && (
                    <td>
                      <button
                        className="attendance-edit-button"
                        onClick={() => onEdit(record)}
                        title="Edit Attendance"
                      >
                        <Pencil size={15} />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AttendanceTable;