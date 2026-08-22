import {
  useEffect,
  useState,
} from "react";

import {
  X,
} from "lucide-react";

const initialForm = {
  candidateName: "",
  email: "",
  phone: "",
  position: "Software Developer",
  department: "Development",
  experience: "",
  interviewDate: "",
  stage: "Screening",
  status: "Applied",
};


function RecruitmentModal({
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
        candidateName:
          record.candidateName,

        email:
          record.email,

        phone:
          record.phone,

        position:
          record.position,

        department:
          record.department,

        experience:
          record.experience,

        interviewDate:
          record.interviewDate,

        stage:
          record.stage,

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

    onSave(form);

    onClose();

  };


  return (
    <div className="modal-overlay">

      <div className="recruitment-modal">

        <div className="modal-header">

          <div>

            <p className="section-label">
              RECRUITMENT
            </p>

            <h2>
              {record
                ? "Candidate Details"
                : "Add Candidate"}
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
                Candidate Name
              </label>

              <input
                name="candidateName"
                value={
                  form.candidateName
                }
                onChange={handleChange}
                placeholder="Candidate name"
                required
              />

            </div>


            <div className="form-field">

              <label>
                Email
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="candidate@example.com"
                required
              />

            </div>


            <div className="form-field">

              <label>
                Phone
              </label>

              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="9876543210"
                required
              />

            </div>


            <div className="form-field">

              <label>
                Position
              </label>

              <select
                name="position"
                value={
                  form.position
                }
                onChange={handleChange}
              >

                <option>
                  Software Developer
                </option>

                <option>
                  ML Engineer
                </option>

                <option>
                  IoT Developer
                </option>

                <option>
                  HR Executive
                </option>

                <option>
                  Finance Analyst
                </option>

              </select>

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
                Experience
              </label>

              <input
                name="experience"
                value={
                  form.experience
                }
                onChange={handleChange}
                placeholder="2 Years"
                required
              />

            </div>


            <div className="form-field">

              <label>
                Interview Date
              </label>

              <input
                type="date"
                name="interviewDate"
                value={
                  form.interviewDate
                }
                onChange={handleChange}
              />

            </div>


            <div className="form-field">

              <label>
                Interview Stage
              </label>

              <select
                name="stage"
                value={form.stage}
                onChange={handleChange}
              >

                <option>
                  Screening
                </option>

                <option>
                  Technical Interview
                </option>

                <option>
                  HR Interview
                </option>

                <option>
                  Final Interview
                </option>

              </select>

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
                  Applied
                </option>

                <option>
                  Shortlisted
                </option>

                <option>
                  In Progress
                </option>

                <option>
                  Selected
                </option>

                <option>
                  Rejected
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
              {record
                ? "Save Changes"
                : "Add Candidate"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default RecruitmentModal;