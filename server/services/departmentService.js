// ==========================================
// DEPARTMENT SERVICE
// B10
// ==========================================

const {
  getAllDepartments,
  getDepartmentById,
  getDepartmentByName,
  getOrCreateDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require("../models/departmentModel");


// ------------------------------------------
// GET ALL DEPARTMENTS
// ------------------------------------------

const getDepartments =
  async () => {

    return await getAllDepartments();

  };


// ------------------------------------------
// GET DEPARTMENT BY ID
// ------------------------------------------

const getDepartment =
  async (id) => {

    const department =
      await getDepartmentById(id);


    if (!department) {

      throw new Error(
        "Department not found"
      );

    }


    return department;

  };


// ------------------------------------------
// CREATE DEPARTMENT
// ------------------------------------------

const addDepartment =
  async (departmentData) => {

    return await createDepartment(
      departmentData
    );

  };


// ------------------------------------------
// UPDATE DEPARTMENT
// ------------------------------------------

const editDepartment =
  async (
    id,
    departmentData
  ) => {

    const existing =
      await getDepartmentById(id);


    if (!existing) {

      throw new Error(
        "Department not found"
      );

    }


    return await updateDepartment(
      id,
      departmentData
    );

  };


// ------------------------------------------
// DELETE / DEACTIVATE DEPARTMENT
// ------------------------------------------

const removeDepartment =
  async (id) => {

    const existing =
      await getDepartmentById(id);


    if (!existing) {

      throw new Error(
        "Department not found"
      );

    }


    return await deleteDepartment(id);

  };

// ------------------------------------------
// GET DEPARTMENT BY NAME
// ------------------------------------------

const getDepartmentByNameService =
  async (name) => {

    if (!name) {
      return null;
    }

    return await getDepartmentByName(
      name
    );

  };

// ------------------------------------------
// GET OR CREATE DEPARTMENT
// ------------------------------------------

const getOrCreateDepartmentService =
  async (name) => {

    if (!name) {
      return null;
    }

    return await getOrCreateDepartment(
      name
    );

  };


module.exports = {
  getDepartments,
  getDepartment,
  getDepartmentByNameService,
  getOrCreateDepartmentService,
  addDepartment,
  editDepartment,
  removeDepartment,
};