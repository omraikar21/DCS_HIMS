// ==========================================
// API TEST PAGE
// A10
// Temporary frontend-backend verification
// ==========================================

import {
  useEffect,
  useState,
} from "react";

import {
  getEmployees,
} from "../services/employeeService";


const ApiTestPage = () => {

  const [employees, setEmployees] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // ----------------------------------------
  // FETCH EMPLOYEES
  // ----------------------------------------

  const loadEmployees = async () => {

    try {

      setLoading(true);
      setError("");

      const data =
        await getEmployees();

      setEmployees(data);

    } catch (err) {

      console.error(
        "Employee API error:",
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


  // ----------------------------------------
  // LOAD ON PAGE OPEN
  // ----------------------------------------

  useEffect(() => {

    loadEmployees();

  }, []);


  // ----------------------------------------
  // LOADING
  // ----------------------------------------

  if (loading) {

    return (
      <div style={{ padding: "24px" }}>

        <h2>
          Employee API Test
        </h2>

        <p>
          Loading employee data...
        </p>

      </div>
    );

  }


  // ----------------------------------------
  // ERROR
  // ----------------------------------------

  if (error) {

    return (
      <div style={{ padding: "24px" }}>

        <h2>
          Employee API Test
        </h2>

        <p>
          Failed to load employee data.
        </p>

        <p>
          {error}
        </p>

        <button
          onClick={loadEmployees}
        >
          Retry
        </button>

      </div>
    );

  }


  // ----------------------------------------
  // EMPTY
  // ----------------------------------------

  if (employees.length === 0) {

    return (
      <div style={{ padding: "24px" }}>

        <h2>
          Employee API Test
        </h2>

        <p>
          No employees found.
        </p>

        <button
          onClick={loadEmployees}
        >
          Refresh
        </button>

      </div>
    );

  }


  // ----------------------------------------
  // DATA
  // ----------------------------------------

  return (
    <div style={{ padding: "24px" }}>

      <h2>
        Employee API Test
      </h2>

      <p>
        Total active employees registered:
        {" "}
        {employees.length}
      </p>


      <button
        onClick={loadEmployees}
      >
        Refresh
      </button>


      <div
        style={{
          marginTop: "20px",
          overflowX: "auto",
        }}
      >

        <table>

          <thead>

            <tr>

              <th>ID</th>

              <th>Employee Code</th>

              <th>First Name</th>

              <th>Last Name</th>

            </tr>

          </thead>


          <tbody>

            {employees.map(
              (employee) => (

                <tr
                  key={employee.id}
                >

                  <td>
                    {employee.id}
                  </td>

                  <td>
                    {employee.employee_code}
                  </td>

                  <td>
                    {employee.first_name}
                  </td>

                  <td>
                    {employee.last_name}
                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
};


export default ApiTestPage;