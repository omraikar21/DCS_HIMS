// ==========================================
// ATTENDANCE SERVICE
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

export const getAttendance = async () => {

  const response =
    await get(
      API_ENDPOINTS.attendance
    );

  return response.data || [];

};


// GET BY ID

export const getAttendanceById = async (
  id
) => {

  const response =
    await get(
      `${API_ENDPOINTS.attendance}/${id}`
    );

  return response.data;

};


// CREATE

export const createAttendance = async (
  attendanceData
) => {

  const response =
    await post(
      API_ENDPOINTS.attendance,
      attendanceData
    );

  return response.data;

};


// UPDATE

export const updateAttendance = async (
  id,
  attendanceData
) => {

  const response =
    await put(
      `${API_ENDPOINTS.attendance}/${id}`,
      attendanceData
    );

  return response.data;

};


// DELETE

export const deleteAttendance = async (
  id
) => {

  const response =
    await remove(
      `${API_ENDPOINTS.attendance}/${id}`
    );

  return response.data;

};