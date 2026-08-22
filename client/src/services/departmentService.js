// ==========================================
// DEPARTMENT SERVICE
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


// GET ALL

export const getDepartments = async () => {

  const response =
    await get(
      API_ENDPOINTS.departments
    );

  return response.data || [];

};


// GET BY ID

export const getDepartment = async (
  id
) => {

  const response =
    await get(
      `${API_ENDPOINTS.departments}/${id}`
    );

  return response.data;

};


// CREATE

export const createDepartment = async (
  departmentData
) => {

  const response =
    await post(
      API_ENDPOINTS.departments,
      departmentData
    );

  return response.data;

};


// UPDATE

export const updateDepartment = async (
  id,
  departmentData
) => {

  const response =
    await put(
      `${API_ENDPOINTS.departments}/${id}`,
      departmentData
    );

  return response.data;

};


// DELETE

export const deleteDepartment = async (
  id
) => {

  const response =
    await remove(
      `${API_ENDPOINTS.departments}/${id}`
    );

  return response.data;

};