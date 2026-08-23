// ==========================================
// CUSTOM REPORT CLIENT SERVICE
// PostgreSQL API Integration
// ==========================================

import { get, post, del } from "./apiClient";
import { API_ENDPOINTS } from "./apiEndpoints";

export const getCustomReports = async () => {
  const response = await get(API_ENDPOINTS.reports);
  return response.data || [];
};

export const saveCustomReport = async (reportData) => {
  const response = await post(API_ENDPOINTS.reports, reportData);
  return response.data;
};

export const deleteCustomReport = async (id) => {
  const response = await del(`${API_ENDPOINTS.reports}/${id}`);
  return response.data;
};
