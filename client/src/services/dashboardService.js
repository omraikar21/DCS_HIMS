import { get } from "./apiClient";
import { API_ENDPOINTS } from "./apiEndpoints";

/*
 * =========================================
 * DASHBOARD SERVICE
 * =========================================
 */

export const getDashboardData = async () => {
  const response = await get(API_ENDPOINTS.dashboard);
  return response.data;
};

export const getDashboard = async () => {
  const response = await get(API_ENDPOINTS.dashboard);
  return response.data;
};

export const getAdminDashboard = async () => {
  const response = await get(API_ENDPOINTS.dashboard);
  return response.data;
};

export const getHRDashboard = async () => {
  const response = await get(API_ENDPOINTS.dashboard);
  return response.data;
};

export const getFinanceDashboard = async () => {
  const response = await get(API_ENDPOINTS.dashboard);
  return response.data;
};

export const getEmployeeDashboard = async () => {
  const response = await get(API_ENDPOINTS.dashboard);
  return response.data;
};