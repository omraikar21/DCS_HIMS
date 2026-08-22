import {
  useEffect,
  useState,
} from "react";

import {
  X,
} from "lucide-react";

const initialForm = {
  status: "Present",
  checkIn: "",
  checkOut: "",
};

function AttendanceModal({
  isOpen,
  onClose,
  onSave,
  record,
}) {
  const [form, setForm] =
    useState(initialForm);


  useEffect(() => {

    if (record) {

      setForm({
        status: record.status,
        checkIn:
          record.checkIn === "—"
            ? ""
            : record.checkIn,
        checkOut:
          record.checkOut === "—"
            ? ""
            : record.checkOut,
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
      [e.target.name]: e.target.value,
    });

  };


  const handleSubmit = (e) => {

    e.preventDefault();

    onSave(form);

    onClose();

  };


  return (
    <div className="modal-overlay">

      <div className="attendance-modal">

        <div className="modal-header">

          <div>

            <p className="section-label">
              ATTENDANCE
            </p>

            <h2>
              Update Attendance
            </h2>

          </div>


          <button
            className="modal-close"
            onClick={onClose}
          >
            <X size={20} />
          </button>

        </div>


        <div className="attendance-employee-info">

          <strong>
            {record?.employeeName}
          </strong>

          <span>
            {record?.employeeId}
          </span>

        </div>


        <form
          onSubmit={handleSubmit}
        >

          <div className="form-grid">

            <div className="form-field">

              <label>
                Status
              </label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >

                <option>
                  Present
                </option>

                <option>
                  Absent
                </option>

                <option>
                  Late
                </option>

                <option>
                  On Leave
                </option>

              </select>

            </div>


            <div className="form-field">

              <label>
                Check In
              </label>

              <input
                name="checkIn"
                value={form.checkIn}
                onChange={handleChange}
                placeholder="09:00 AM"
              />

            </div>


            <div className="form-field">

              <label>
                Check Out
              </label>

              <input
                name="checkOut"
                value={form.checkOut}
                onChange={handleChange}
                placeholder="06:00 PM"
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
              Save Attendance
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default AttendanceModal;