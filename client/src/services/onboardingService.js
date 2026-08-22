// ==========================================
// ONBOARDING SERVICE
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

export const getOnboarding = async () => {

  const response =
    await get(
      API_ENDPOINTS.onboarding
    );

  return response.data || [];

};


// GET BY ID

export const getOnboardingById = async (
  id
) => {

  const response =
    await get(
      `${API_ENDPOINTS.onboarding}/${id}`
    );

  return response.data;

};


// GET BY EMPLOYEE

export const getEmployeeOnboarding = async (
  employeeId
) => {

  const response =
    await get(
      `${API_ENDPOINTS.onboarding}/employee/${employeeId}`
    );

  return response.data || [];

};


// CREATE

export const createOnboarding = async (
  onboardingData
) => {

  const response =
    await post(
      API_ENDPOINTS.onboarding,
      onboardingData
    );

  return response.data;

};


// UPDATE

export const updateOnboarding = async (
  id,
  onboardingData
) => {

  const response =
    await put(
      `${API_ENDPOINTS.onboarding}/${id}`,
      onboardingData
    );

  return response.data;

};


// DELETE

export const deleteOnboarding = async (
  id
) => {

  const response =
    await remove(
      `${API_ENDPOINTS.onboarding}/${id}`
    );

  return response.data;

};