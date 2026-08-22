// ==========================================
// USER & ROLE MANAGEMENT SERVICE
// Frontend API Client
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
// GET ALL USERS & ROLE TELEMETRY
// ------------------------------------------
export const getUsersList = async () => {
  const response = await get(API_ENDPOINTS.users);
  return response.data || { users: [], telemetry: {}, permissions: {} };
};

// ------------------------------------------
// CREATE USER (ADMIN: Mini-Admin/HR/Finance | HR: Finance)
// ------------------------------------------
export const createUserAccount = async (userData) => {
  const response = await post(
    API_ENDPOINTS.users,
    userData
  );
  return response.data;
};

// ------------------------------------------
// UPDATE USER
// ------------------------------------------
export const updateUserAccount = async (id, userData) => {
  const response = await put(
    `${API_ENDPOINTS.users}/${id}`,
    userData
  );
  return response.data;
};

// ------------------------------------------
// DELETE USER
// ------------------------------------------
export const deleteUserAccount = async (id) => {
  const response = await remove(
    `${API_ENDPOINTS.users}/${id}`
  );
  return response.data;
};
