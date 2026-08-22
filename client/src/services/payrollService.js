// ==========================================
// PAYROLL SERVICE
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

export const getPayroll = async () => {

  const response =
    await get(
      API_ENDPOINTS.payroll
    );

  return response.data || [];

};


// GET BY ID

export const getPayrollById = async (
  id
) => {

  const response =
    await get(
      `${API_ENDPOINTS.payroll}/${id}`
    );

  return response.data;

};


// CREATE

export const createPayroll = async (
  payrollData
) => {

  const response =
    await post(
      API_ENDPOINTS.payroll,
      payrollData
    );

  return response.data;

};


// UPDATE

export const updatePayroll = async (
  id,
  payrollData
) => {

  const response =
    await put(
      `${API_ENDPOINTS.payroll}/${id}`,
      payrollData
    );

  return response.data;

};


// DELETE

export const deletePayroll = async (
  id
) => {

  const response =
    await remove(
      `${API_ENDPOINTS.payroll}/${id}`
    );

  return response.data;

};