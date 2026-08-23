// ==========================================
// AUDIT SERVICE
// Frontend API Client
// ==========================================

import { get, post } from "./apiClient";
import { API_ENDPOINTS } from "./apiEndpoints";

export const getAuditLogs = async () => {
  const response = await get(API_ENDPOINTS.auditLogs);
  return response.data || [];
};

export const recordAuditEvent = async (eventData) => {
  const response = await post(API_ENDPOINTS.auditLogs, eventData);
  return response.data;
};
