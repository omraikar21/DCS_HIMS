// ==========================================
// DOCUMENT SERVICE
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

export const getDocuments = async () => {

  const response =
    await get(
      API_ENDPOINTS.documents
    );

  return response.data || [];

};


// GET BY ID

export const getDocument = async (
  id
) => {

  const response =
    await get(
      `${API_ENDPOINTS.documents}/${id}`
    );

  return response.data;

};


// GET BY EMPLOYEE

export const getEmployeeDocuments = async (
  employeeId
) => {

  const response =
    await get(
      `${API_ENDPOINTS.documents}/employee/${employeeId}`
    );

  return response.data || [];

};


// CREATE

export const createDocument = async (
  documentData
) => {

  const response =
    await post(
      API_ENDPOINTS.documents,
      documentData
    );

  return response.data;

};


// UPDATE

export const updateDocument = async (
  id,
  documentData
) => {

  const response =
    await put(
      `${API_ENDPOINTS.documents}/${id}`,
      documentData
    );

  return response.data;

};


// DELETE

export const deleteDocument = async (
  id
) => {

  const response =
    await remove(
      `${API_ENDPOINTS.documents}/${id}`
    );

  return response.data;

};