import {
  useEffect,
  useState,
} from "react";

import {
  X,
} from "lucide-react";
import { getDepartments } from "../../services/departmentService";

const initialForm = {
  employeeName: "",
  employeeId: "",
  department: "",
  leaveType: "Casual Leave",
  fromDate: "",
  toDate: "",
  days: 1,
  reason: "",
};


function LeaveModal({
  isOpen,
  onClose,
  onSave,
  record,
}) {

  const [form, setForm] =
    useState(initialForm);

  const [departments, setDepartments] =
    useState([]);

  useEffect(() => {
    if (isOpen) {
      getDepartments()
        .then((data) => setDepartments(data || []))
        .catch(() => setDepartments([]));
    }
  }, [isOpen]);


  useEffect(() => {

    if (record) {

      setForm({
        employeeName:
          record.employeeName,
        employeeId:
          record.employeeId,
        department:
          record.department,
        leaveType:
          record.leaveType,
        fromDate:
          record.fromDate,
        toDate:
          record.toDate,
        days:
          record.days,
        reason:
          record.reason,
      });

    } else {

      setForm(initialForm);

    }

  }, [record, isOpen]);


  if (!isOpen) {
    return null;
  }


  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });

  };


  const handleSubmit = (e) => {

    e.preventDefault();

    onSave(form);

    onClose();

  };


  return (
    <div className="modal-overlay">

      <div className="leave-modal">

        <div className="modal-header">

          <div>

            <p className="section-label">
              LEAVE MANAGEMENT
            </p>

            <h2>
              {record
                ? "Leave Details"
                : "Apply Leave"}
            </h2>

          </div>


          <button
            className="modal-close"
            onClick={onClose}
          >
            <X size={20} />
          </button>

        </div>


        <form
          onSubmit={handleSubmit}
        >

          <div className="form-grid">

            {/* NAME */}

            <div className="form-field">

              <label>
                Employee Name
              </label>

              <input
                name="employeeName"
                value={
                  form.employeeName
                }
                onChange={handleChange}
                placeholder="Employee name"
                required
              />

            </div>


            {/* ID */}

            <div className="form-field">

              <label>
                Employee ID
              </label>

              <input
                name="employeeId"
                value={
                  form.employeeId
                }
                onChange={handleChange}
                placeholder="DCS-EMP-001"
                required
              />

            </div>


            {/* DEPARTMENT */}

            <div className="form-field">

              <label>
                Department
              </label>

              <select
                name="department"
                value={form.department}
                onChange={handleChange}
              >
                <option value="">-- Select Department --</option>
                {departments.map((dept) => (
                  <option key={dept.id || dept.name} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>

            </div>


            {/* LEAVE TYPE */}

            <div className="form-field">

              <label>
                Leave Type
              </label>

              <select
                name="leaveType"
                value={
                  form.leaveType
                }
                onChange={handleChange}
              >

                <option>
                  Casual Leave
                </option>

                <option>
                  Sick Leave
                </option>

                <option>
                  Earned Leave
                </option>

              </select>

            </div>


            {/* FROM */}

            <div className="form-field">

              <label>
                From Date
              </label>

              <input
                type="date"
                name="fromDate"
                value={
                  form.fromDate
                }
                onChange={handleChange}
                required
              />

            </div>


            {/* TO */}

            <div className="form-field">

              <label>
                To Date
              </label>

              <input
                type="date"
                name="toDate"
                value={
                  form.toDate
                }
                onChange={handleChange}
                required
              />

            </div>


            {/* DAYS */}

            <div className="form-field">

              <label>
                Number of Days
              </label>

              <input
                type="number"
                name="days"
                value={form.days}
                min="1"
                onChange={handleChange}
                required
              />

            </div>


            {/* REASON */}

            <div className="form-field full-form-field">

              <label>
                Reason
              </label>

              <textarea
                name="reason"
                value={
                  form.reason
                }
                onChange={handleChange}
                placeholder="Reason for leave"
                rows="4"
                required
              />

            </div>

          </div>


          <div className="modal-footer">

            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
            >
              {record
                ? "Save Changes"
                : "Submit Leave"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default LeaveModal;