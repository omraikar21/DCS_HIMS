import {
  Eye,
  Pencil,
} from "lucide-react";

function RecruitmentTable({
  records,
  onView,
  onEdit,
}) {

  return (
    <div className="recruitment-table-wrapper">

      <table className="recruitment-table">

        <thead>

          <tr>

            <th>
              Candidate
            </th>

            <th>
              Position
            </th>

            <th>
              Department
            </th>

            <th>
              Experience
            </th>

            <th>
              Interview
            </th>

            <th>
              Stage
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
                No candidates found.
              </td>

            </tr>

          ) : (

            records.map(
              (record) => {

                const initials =
                  record.candidateName
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
                            {record.candidateName}
                          </strong>

                          <span>
                            {record.id}
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
                      {record.experience}
                    </td>


                    <td>
                      {record.interviewDate}
                    </td>


                    <td>
                      <span className="stage-badge">
                        {record.stage}
                      </span>
                    </td>


                    <td>

                      <span
                        className={`status-badge recruitment-status-${record.status
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

                      <div className="recruitment-actions">

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

export default RecruitmentTable;