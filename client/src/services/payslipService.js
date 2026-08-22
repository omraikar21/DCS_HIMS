// ==========================================
// PAYSLIP SERVICE
// A9
// ==========================================

import {
  get,
  post,
  remove,
} from "./apiClient";

import {
  API_ENDPOINTS,
} from "./apiEndpoints";


// GET ALL

export const getPayslips = async () => {

  const response =
    await get(
      API_ENDPOINTS.payslips
    );

  return response.data || [];

};


// GET BY ID

export const getPayslip = async (
  id
) => {

  const response =
    await get(
      `${API_ENDPOINTS.payslips}/${id}`
    );

  return response.data;

};


// CREATE
// Existing backend expects payrollId

export const createPayslip = async (
  payrollId
) => {

  const response =
    await post(
      API_ENDPOINTS.payslips,
      {
        payrollId,
      }
    );

  return response.data;

};


// DELETE

export const deletePayslip = async (
  id
) => {

  const response =
    await remove(
      `${API_ENDPOINTS.payslips}/${id}`
    );

  return response.data;

};