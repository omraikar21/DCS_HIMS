// ==========================================
// RECRUITMENT SERVICE
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

export const getRecruitment = async () => {

  const response =
    await get(
      API_ENDPOINTS.recruitment
    );

  return response.data || [];

};


// GET BY ID

export const getRecruitmentById = async (
  id
) => {

  const response =
    await get(
      `${API_ENDPOINTS.recruitment}/${id}`
    );

  return response.data;

};


// CREATE

export const createRecruitment = async (
  recruitmentData
) => {

  const response =
    await post(
      API_ENDPOINTS.recruitment,
      recruitmentData
    );

  return response.data;

};


// UPDATE

export const updateRecruitment = async (
  id,
  recruitmentData
) => {

  const response =
    await put(
      `${API_ENDPOINTS.recruitment}/${id}`,
      recruitmentData
    );

  return response.data;

};


// DELETE

export const deleteRecruitment = async (
  id
) => {

  const response =
    await remove(
      `${API_ENDPOINTS.recruitment}/${id}`
    );

  return response.data;

};