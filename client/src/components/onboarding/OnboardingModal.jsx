import {
  useEffect,
  useState,
} from "react";

import {
  X,
} from "lucide-react";

const initialForm = {
  employeeName: "",
  employeeId: "",
  department: "Development",
  position: "Software Developer",
  joiningDate: "",
  documents: "0/5",
  progress: 0,
  status: "Started",
};


function OnboardingModal({
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
        employeeName:
          record.employeeName,

        employeeId:
          record.employeeId,

        department:
          record.department,

        position:
          record.position,

        joiningDate:
          record.joiningDate,

        documents:
          record.documents,

        progress:
          record.progress,

        status:
          record.status,
      });

    } else {

      setForm(initialForm);

    }

  }, [
    record,
    isOpen,
  ]);


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

    onSave({
      ...form,
      progress:
        Number(form.progress),
    });

    onClose();

  };


  return (
    <div className="modal-overlay">

      <div className="onboarding-modal">

        <div className="modal-header">

          <div>

            <p className="section-label">
              ONBOARDING
            </p>

            <h2>
              {record
                ? "Onboarding Details"
                : "Add New Joiner"}
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
                required
              />

            </div>


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
                required
              />

            </div>


            <div className="form-field">

              <label>
                Position
              </label>

              <input
                name="position"
                value={
                  form.position
                }
                onChange={handleChange}
                required
              />

            </div>


            <div className="form-field">

              <label>
                Department
              </label>

              <select
                name="department"
                value={
                  form.department
                }
                onChange={handleChange}
              >

                <option>
                  Development
                </option>

                <option>
                  AI/ML
                </option>

                <option>
                  IoT
                </option>

                <option>
                  HR
                </option>

                <option>
                  Finance
                </option>

              </select>

            </div>


            <div className="form-field">

              <label>
                Joining Date
              </label>

              <input
                type="date"
                name="joiningDate"
                value={
                  form.joiningDate
                }
                onChange={handleChange}
                required
              />

            </div>


            <div className="form-field">

              <label>
                Documents
              </label>

              <input
                name="documents"
                value={
                  form.documents
                }
                onChange={handleChange}
                placeholder="3/5"
              />

            </div>


            <div className="form-field">

              <label>
                Progress %
              </label>

              <input
                type="number"
                name="progress"
                min="0"
                max="100"
                value={
                  form.progress
                }
                onChange={handleChange}
              />

            </div>


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
                  Started
                </option>

                <option>
                  In Progress
                </option>

                <option>
                  Almost Complete
                </option>

                <option>
                  Completed
                </option>

              </select>

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
              Save Onboarding
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default OnboardingModal;