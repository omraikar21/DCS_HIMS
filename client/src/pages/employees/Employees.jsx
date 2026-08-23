import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Plus,
  Users,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { useNotification } from "../../hooks/useNotification";

import EmployeeFilters
  from "../../components/employees/EmployeeFilters";

import EmployeeTable
  from "../../components/employees/EmployeeTable";

import EmployeeModal
  from "../../components/employees/EmployeeModal";

import {
  required,
  validEmail,
  validPhone,
} from "../../utils/validation";

import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../../services/employeeService";


function Employees() {
  const { role } = useAuth();
  const notification = useNotification();
  const canManageEmployees = ["ADMIN", "HR"].includes((role || "").toUpperCase());

  /*
   * =========================================
   * EMPLOYEE DATA
   * =========================================
   */

  const [employees, setEmployees] =
    useState([]);


  const [loading, setLoading] =
    useState(true);


  const [error, setError] =
    useState("");


  /*
   * =========================================
   * FORM VALIDATION ERRORS
   * =========================================
   */

  const [errors, setErrors] =
    useState({});


  /*
   * =========================================
   * SEARCH & FILTERS
   * =========================================
   */

  const [search, setSearch] =
    useState("");


  const [department, setDepartment] =
    useState("All Departments");


  const [status, setStatus] =
    useState("All Status");


  /*
   * =========================================
   * MODAL
   * =========================================
   */

  const [modalOpen, setModalOpen] =
    useState(false);


  const [selectedEmployee, setSelectedEmployee] =
    useState(null);


  /*
   * =========================================
   * BACKEND → UI MAPPING
   * =========================================
   */

  const mapEmployeeToUI = (
    employee
  ) => ({

    id:
      employee.employee_code || `DCS-EMP-${String(employee.id).padStart(3, "0")}`,

    databaseId:
      employee.id,

    name:
      `${employee.first_name || ""} ${employee.last_name || ""}`.trim(),

    email:
      employee.email || "",

    phone:
      employee.phone || "",

    department:
      employee.department_name ||
      "Unassigned",

    designation:
      employee.designation || "",

    status:
      employee.employment_status ===
        "ACTIVE"

        ? "Active"

        : employee.employment_status ===
          "ON_LEAVE"

          ? "On Leave"

          : "Inactive",

    joiningDate:
      employee.joining_date
        ? String(
          employee.joining_date
        ).slice(0, 10)

        : "",

    location:
      employee.address || "",

  });


  /*
   * =========================================
   * LOAD EMPLOYEES
   * =========================================
   */

  const loadEmployees =
    async () => {

      try {

        setLoading(true);

        setError("");


        const data =
          await getEmployees();


        const mappedEmployees =
          (data || []).map(
            mapEmployeeToUI
          );


        setEmployees(
          mappedEmployees
        );


      } catch (err) {

        console.error(
          "Failed to load employees:",
          err
        );


        setError(
          err.message ||
          "Failed to load employees"
        );


      } finally {

        setLoading(false);

      }

    };


  /*
   * =========================================
   * INITIAL LOAD
   * =========================================
   */

  useEffect(() => {

    loadEmployees();

  }, []);


  /*
   * =========================================
   * FILTER EMPLOYEES
   * =========================================
   */

  const filteredEmployees =
    useMemo(() => {

      return employees.filter(
        (employee) => {

          const searchText =
            search.toLowerCase();


          const matchesSearch =
            employee.name
              .toLowerCase()
              .includes(searchText) ||

            employee.id
              .toLowerCase()
              .includes(searchText) ||

            employee.email
              .toLowerCase()
              .includes(searchText);


          const matchesDepartment =
            department ===
            "All Departments" ||

            employee.department ===
            department;


          const matchesStatus =
            status ===
            "All Status" ||

            employee.status ===
            status;


          return (
            matchesSearch &&
            matchesDepartment &&
            matchesStatus
          );

        }
      );

    }, [
      employees,
      search,
      department,
      status,
    ]);


  /*
   * =========================================
   * ADD EMPLOYEE
   * =========================================
   */

  const handleAdd = () => {

    setSelectedEmployee(null);

    setErrors({});

    setModalOpen(true);

  };


  /*
   * =========================================
   * EDIT EMPLOYEE
   * =========================================
   */

  const handleEdit = (
    employee
  ) => {

    setSelectedEmployee(
      employee
    );

    setErrors({});

    setModalOpen(true);

  };


  const handleView = (employee) => {
    setSelectedEmployee(employee);
    setErrors({});
    setModalOpen(true);
  };


  /*
   * =========================================
   * VALIDATE EMPLOYEE
   * =========================================
   */

  const validateEmployee = (
    formData
  ) => {

    const newErrors = {};


    /*
     * Employee name
     */

    const nameError =
      required(
        formData.name,
        "Employee name"
      );


    if (nameError) {

      newErrors.name =
        nameError;

    }


    /*
     * Email
     */

    const emailError =
      validEmail(
        formData.email
      );


    if (emailError) {

      newErrors.email =
        emailError;

    }


    /*
     * Phone
     */

    const phoneError =
      validPhone(
        formData.phone
      );


    if (phoneError) {
      newErrors.phone =
        phoneError;
    }

    /*
     * Department
     */
    const deptError = required(formData.department, "Department");
    if (deptError || formData.department === "Unassigned") {
      newErrors.department = "Department is required";
    }

    /*
     * Designation
     */
    const desigError = required(formData.designation, "Designation");
    if (desigError) {
      newErrors.designation = desigError;
    }

    setErrors(
      newErrors
    );


    return (
      Object.keys(
        newErrors
      ).length === 0
    );

  };


  /*
   * =========================================
   * UI → BACKEND MAPPING
   * =========================================
   */

  const mapFormToBackend = (
    formData
  ) => {

    const nameParts =
      formData.name
        .trim()
        .split(/\s+/);


    const firstName =
      nameParts.shift() || "";


    const lastName =
      nameParts.join(" ");


    let employmentStatus =
      "ACTIVE";


    if (
      formData.status ===
      "Inactive"
    ) {

      employmentStatus =
        "INACTIVE";

    }


    if (
      formData.status ===
      "On Leave"
    ) {

      employmentStatus =
        "ON_LEAVE";

    }


    return {

      firstName,

      lastName,

      email:
        formData.email.trim(),

      phone:
        formData.phone.trim(),

      department:
        formData.department,

      designation:
        formData.designation.trim(),

      joiningDate:
        formData.joiningDate ||
        null,

      employmentStatus,

      address:
        (formData.address || formData.officeLocation || formData.location || "").trim(),

    };

  };


  /*
   * =========================================
   * SAVE EMPLOYEE
   * =========================================
   */

  const handleSave =
    async (formData) => {

      const isValid =
        validateEmployee(
          formData
        );

      if (!isValid) {
        return false;
      }

      try {
        setLoading(true);
        setError("");

        const backendData =
          mapFormToBackend(
            formData
          );

        if (
          selectedEmployee
        ) {
          await updateEmployee(
            selectedEmployee.databaseId,
            backendData
          );
          if (notification?.success) {
            notification.success("Employee updated successfully!");
          }
        } else {
          await createEmployee(
            backendData
          );
          if (notification?.success) {
            notification.success("Employee added successfully!");
          }
        }

        // Reset search and filters so new employee appears immediately in the table
        setSearch("");
        setDepartment("All Departments");
        setStatus("All Status");

        await loadEmployees();

        setModalOpen(false);
        setSelectedEmployee(null);
        setErrors({});
        return true;

      } catch (err) {
        console.error(
          "Failed to save employee:",
          err
        );

        setError(
          err.message ||
          "Failed to save employee"
        );
        throw err;

      } finally {
        setLoading(false);
      }
    };


  /*
   * =========================================
   * DELETE / OFFBOARD EMPLOYEE
   * =========================================
   */

  const handleDelete = async (employee) => {
    if (!employee || !employee.databaseId) return;

    const confirmMsg = `Are you sure you want to offboard and delete ${employee.name} (${employee.id})?\n\nThis will remove their profile and system access.`;
    if (!window.confirm(confirmMsg)) {
      return;
    }

    try {
      setLoading(true);
      await deleteEmployee(employee.databaseId);
      if (notification?.success) {
        notification.success(`Employee ${employee.name} (${employee.id}) deleted successfully.`);
      }
      await loadEmployees();
    } catch (err) {
      console.error("Delete employee error:", err);
      if (notification?.error) {
        notification.error(err.message || "Failed to delete employee");
      } else {
        alert(err.message || "Failed to delete employee");
      }
    } finally {
      setLoading(false);
    }
  };



  /*
   * =========================================
   * CLOSE MODAL
   * =========================================
   */

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedEmployee(null);
    setErrors({});
  };


  /*
   * =========================================
   * LOADING STATE
   * =========================================
   */

  if (loading && employees.length === 0) {

    return (

      <div className="employees-page">

        <div className="module-heading">

          <div>

            <p className="section-label">
              PEOPLE MANAGEMENT
            </p>

            <h1>
              Employees
            </h1>

            <p>
              Manage DCS employees and
              their information.
            </p>

          </div>

        </div>


        <section className="dashboard-card">

          <p>
            Loading employees...
          </p>

        </section>

      </div>

    );

  }


  /*
   * =========================================
   * PAGE UI
   * =========================================
   */

  return (

    <div className="employees-page">

      {/* =====================================
          PAGE HEADER
      ====================================== */}

      <div className="module-heading">

        <div>

          <p className="section-label">
            PEOPLE MANAGEMENT
          </p>

          <h1>
            Employees
          </h1>

          <p>
            Manage DCS employees and
            their information.
          </p>

        </div>


        {canManageEmployees && (
          <button
            className="primary-button"
            onClick={handleAdd}
          >

            <Plus size={17} />

            Add Employee

          </button>
        )}

      </div>


      {/* =====================================
          ERROR
      ====================================== */}

      {error && (

        <div className="dashboard-card">

          <p style={{ color: "#e11d48" }}>
            {error}
          </p>

        </div>

      )}


      {/* =====================================
          SUMMARY
      ====================================== */}

      <div className="employee-summary">

        <div className="summary-icon">

          <Users size={20} />

        </div>


        <div>

          <strong>
            {filteredEmployees.length}
          </strong>

          <span>
            Employees displayed
          </span>

        </div>

      </div>


      {/* =====================================
          FILTERS + TABLE
      ====================================== */}

      <section className="dashboard-card">

        <EmployeeFilters

          search={search}

          setSearch={setSearch}

          department={department}

          setDepartment={
            setDepartment
          }

          status={status}

          setStatus={
            setStatus
          }

        />


        <EmployeeTable
          employees={
            filteredEmployees
          }
          onView={
            handleView
          }
          onEdit={
            handleEdit
          }
          onDelete={
            handleDelete
          }
          canEdit={
            canManageEmployees
          }
        />

      </section>


      {/* =====================================
          EMPLOYEE MODAL
      ====================================== */}

      <EmployeeModal
        isOpen={
          modalOpen
        }
        onClose={
          handleCloseModal
        }
        onSave={
          handleSave
        }
        onDelete={
          handleDelete
        }
        employee={
          selectedEmployee
        }
        errors={
          errors
        }
      />

    </div>

  );

}


export default Employees;