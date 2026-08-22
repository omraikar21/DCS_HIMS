// ==========================================
// LEAVE SERVICE
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

export const getLeaves = async () => {

  const response =
    await get(
      API_ENDPOINTS.leaves
    );

  return response.data || [];

};


// GET BY ID

export const getLeave = async (
  id
) => {

  const response =
    await get(
      `${API_ENDPOINTS.leaves}/${id}`
    );

  return response.data;

};


// CREATE

export const createLeave = async (
  leaveData
) => {

  const response =
    await post(
      API_ENDPOINTS.leaves,
      leaveData
    );

  return response.data;

};


// UPDATE

export const updateLeave = async (
  id,
  leaveData
) => {

  const response =
    await put(
      `${API_ENDPOINTS.leaves}/${id}`,
      leaveData
    );

  return response.data;

};


// APPROVE

export const approveLeave = async (
  id
) => {

  const response =
    await put(
      `${API_ENDPOINTS.leaves}/${id}/approve`,
      {}
    );

  return response.data;

};


// REJECT

export const rejectLeave = async (
  id,
  rejectionReason = "Rejected by Admin/HR"
) => {

  const response =
    await put(
      `${API_ENDPOINTS.leaves}/${id}/reject`,
      {
        rejectionReason,
      }
    );

  return response.data;

};


// HOLD / PENDING

export const holdLeave = async (
  id
) => {

  const response =
    await put(
      `${API_ENDPOINTS.leaves}/${id}/hold`,
      {}
    );

  return response.data;

};


// DELETE

export const deleteLeave = async (
  id
) => {

  const response =
    await remove(
      `${API_ENDPOINTS.leaves}/${id}`
    );

  return response.data;

};