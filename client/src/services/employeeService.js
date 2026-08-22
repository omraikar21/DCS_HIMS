// ==========================================
// EMPLOYEE SERVICE
// A9
// ==========================================

import {
  get,
  post,
  put,
  remove,
} from "./apiClient";

import {
  API_ENDPOINTS,
} from "./apiEndpoints";


// ------------------------------------------
// GET ALL
// ------------------------------------------

export const getEmployees = async () => {

  const response =
    await get(
      API_ENDPOINTS.employees
    );

  return response.data || [];

};


// ------------------------------------------
// GET BY ID
// ------------------------------------------

export const getEmployee = async (
  id
) => {

  const response =
    await get(
      `${API_ENDPOINTS.employees}/${id}`
    );

  return response.data;

};


// ------------------------------------------
// CREATE
// ------------------------------------------

export const createEmployee = async (
  employeeData
) => {

  const response =
    await post(
      API_ENDPOINTS.employees,
      employeeData
    );

  return response.data;

};



// ------------------------------------------
// UPDATE
// ------------------------------------------

export const updateEmployee = async (
  id,
  employeeData
) => {

  const response =
    await put(
      `${API_ENDPOINTS.employees}/${id}`,
      employeeData
    );

  return response.data;

};


// ------------------------------------------
// DELETE
// ------------------------------------------

export const deleteEmployee = async (
  id
) => {

  const response =
    await remove(
      `${API_ENDPOINTS.employees}/${id}`
    );

  return response.data;

};