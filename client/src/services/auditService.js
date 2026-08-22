// ==========================================
// AUDIT SERVICE
// Frontend API Client
// ==========================================

import { get, post } from "./apiClient";
import { API_ENDPOINTS } from "./apiEndpoints";

export const getAuditLogs = async () => {
  try {
    const response = await get(API_ENDPOINTS.auditLogs);
    return response.data || [];
  } catch (error) {
    console.error("Failed to load audit logs from API:", error);
    return [];
  }
};

export const recordAuditEvent = async (eventData) => {
  try {
    const response = await post(API_ENDPOINTS.auditLogs, eventData);
    return response.data;
  } catch (error) {
    console.error("Failed to record audit event:", error);
    return null;
  }
};
