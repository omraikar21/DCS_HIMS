import {
    useEffect,
    useState,
} from "react";

import {
    X,
} from "lucide-react";

const initialForm = {
    name: "",
    code: "",
    employees: 0,
    location: "",
    description: "",
    status: "Active",
};


function DepartmentModal({
    isOpen,
    onClose,
    onSave,
    department,
}) {
    const [form, setForm] =
        useState(initialForm);

    useEffect(() => {

        if (department) {
            setForm(department);
        } else {
            setForm(initialForm);
        }

    }, [department, isOpen]);


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

            <div className="department-modal">

                <div className="modal-header">

                    <div>

                        <p className="section-label">
                            DEPARTMENT MANAGEMENT
                        </p>

                        <h2>
                            {department
                                ? "Edit Department"
                                : "Add Department"}
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
                                Department Name
                            </label>

                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Development"
                                required
                            />

                        </div>


                        <div className="form-field">

                            <label>
                                Department Code
                            </label>

                            <input
                                name="code"
                                value={form.code}
                                onChange={handleChange}
                                placeholder="DEV"
                                required
                            />

                        </div>





                        <div className="form-field">

                            <label>
                                Employees
                            </label>

                            <input
                                type="number"
                                name="employees"
                                value={form.employees}
                                onChange={handleChange}
                                min="0"
                            />

                        </div>


                        <div className="form-field">

                            <label>
                                Location
                            </label>

                            <input
                                name="location"
                                value={form.location || ""}
                                onChange={handleChange}
                                placeholder="e.g. Main Office / Bangalore"
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
                                    Active
                                </option>

                                <option>
                                    Inactive
                                </option>
                            </select>

                        </div>


                        <div className="form-field full-form-field">

                            <label>
                                Description
                            </label>

                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Department description"
                                rows="4"
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
                            {department
                                ? "Update Department"
                                : "Add Department"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default DepartmentModal;