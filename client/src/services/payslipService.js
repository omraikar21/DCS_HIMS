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


// CREATE (single — from a payrollId)

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


// BULK GENERATE FOR A MONTH
// Called by the Finance "Generate Payslips" button
// month: number 1-12, year: number e.g. 2026

export const generatePayslipsForMonth = async (month, year) => {

  const response = await post(
    `${API_ENDPOINTS.payslips}/generate-month`,
    { month, year }
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