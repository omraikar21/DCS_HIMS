const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  updateEmployeeCompensation,
  deleteEmployee,
} = require("../models/employeeModel");


// ------------------------------------------
// GET ALL EMPLOYEES
// ------------------------------------------

const getEmployees =
  async () => {

    return await getAllEmployees();

  };


// ------------------------------------------
// GET EMPLOYEE BY ID
// ------------------------------------------

const getEmployee =
  async (id) => {

    const employee =
      await getEmployeeById(id);


    if (!employee) {

      throw new Error(
        "Employee not found"
      );

    }


    return employee;

  };


// ------------------------------------------
// CREATE EMPLOYEE
// ------------------------------------------

const addEmployee =
  async (employeeData) => {

    const employee =
      await createEmployee(
        employeeData
      );


    return employee;

  };


// ------------------------------------------
// UPDATE EMPLOYEE
// ------------------------------------------

const editEmployee =
  async (
    id,
    employeeData
  ) => {

    const existing =
      await getEmployeeById(id);


    if (!existing) {

      throw new Error(
        "Employee not found"
      );

    }


    const employee =
      await updateEmployee(
        id,
        employeeData
      );


    return employee;

  };

// ------------------------------------------
// UPDATE EMPLOYEE COMPENSATION (FINANCE & ADMIN)
// ------------------------------------------

const editEmployeeCompensation =
  async (
    id,
    compensationData
  ) => {

    const existing =
      await getEmployeeById(id);

    if (!existing) {
      throw new Error(
        "Employee not found"
      );
    }

    const employee =
      await updateEmployeeCompensation(
        id,
        compensationData
      );

    return employee;
  };


// ------------------------------------------
// DELETE EMPLOYEE
// ------------------------------------------

const removeEmployee =
  async (id) => {

    const existing =
      await getEmployeeById(id);


    if (!existing) {

      throw new Error(
        "Employee not found"
      );

    }


    const employee =
      await deleteEmployee(id);


    return employee;

  };


module.exports = {
  getEmployees,
  getEmployee,
  addEmployee,
  editEmployee,
  editEmployeeCompensation,
  removeEmployee,
};