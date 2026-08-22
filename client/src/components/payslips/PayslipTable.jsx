import {
  Eye,
  Download,
} from "lucide-react";

function PayslipTable({
  records,
  onView,
  onDownload,
}) {

  const formatCurrency = (
    value
  ) =>
    `₹${value.toLocaleString(
      "en-IN"
    )}`;


  return (
    <div className="payslip-table-wrapper">

      <table className="payslip-table">

        <thead>

          <tr>

            <th>
              Employee
            </th>

            <th>
              Department
            </th>

            <th>
              Gross Salary
            </th>

            <th>
              Deductions
            </th>

            <th>
              Net Salary
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
                No payslips found.
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
                      {formatCurrency(
                        record.grossSalary
                      )}
                    </td>


                    <td className="deduction-value">
                      -
                      {formatCurrency(
                        record.deductions
                      )}
                    </td>


                    <td>

                      <strong className="net-salary">
                        {formatCurrency(
                          record.netSalary
                        )}
                      </strong>

                    </td>


                    <td>

                      <span className="status-badge payslip-generated">
                        {record.status}
                      </span>

                    </td>


                    <td>

                      <div className="payslip-actions">

                        <button
                          title="View"
                          onClick={() =>
                            onView(record)
                          }
                        >
                          <Eye size={15} />
                        </button>

                        <button
                          title="Download"
                          onClick={() =>
                            onDownload(record)
                          }
                        >
                          <Download
                            size={15}
                          />
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

export default PayslipTable;