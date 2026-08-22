// ==========================================
// AUTH SERVICE
// PostgreSQL Backend Authentication
// A10
// ==========================================

import {
  post,
  put,
} from "./apiClient";

import {
  API_ENDPOINTS,
} from "./apiEndpoints";


// ==========================================
// LOGIN
// ==========================================

export const loginUser = async (
  email,
  password
) => {

  const response =
    await post(
      API_ENDPOINTS.auth.login,
      {
        email,
        password,
      }
    );


  /*
   * Backend may return:
   *
   * {
   *   success: true,
   *   token: "...",
   *   user: {...}
   * }
   *
   * or:
   *
   * {
   *   success: true,
   *   data: {
   *      token: "...",
   *      user: {...}
   *   }
   * }
   */


  const mustChangePassword =
    response?.mustChangePassword ||
    response?.data?.mustChangePassword;

  if (mustChangePassword) {
    return {
      mustChangePassword: true,
      user: response?.user || response?.data?.user,
    };
  }

  const token =
    response?.token ||
    response?.data?.token;

  const user =
    response?.user ||
    response?.data?.user;

  if (!token) {
    throw new Error(
      "Login successful but authentication token was not received."
    );
  }


  /*
   * Store the PostgreSQL backend JWT.
   */

  localStorage.setItem(
    "token",
    token
  );


  /*
   * Store user information if
   * backend provides it.
   */

  if (user) {

    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );

  }


  return {

    ...response,

    token,

    user,

  };

};


// ==========================================
// GET STORED USER
// ==========================================

export const getStoredUser = () => {

  const storedUser =
    localStorage.getItem("user");


  if (!storedUser) {

    return null;

  }


  try {

    return JSON.parse(
      storedUser
    );

  } catch (error) {

    console.error(
      "Invalid stored user. Clearing old user data.",
      error
    );


    localStorage.removeItem(
      "user"
    );


    return null;

  }

};


// ==========================================
// GET TOKEN
// ==========================================

export const getToken = () => {

  return localStorage.getItem(
    "token"
  );

};


// ==========================================
// SEND OTP (GMAIL SERVICE)
// ==========================================

export const sendOtp = async (email) => {
  const response = await post(API_ENDPOINTS.auth.sendOtp, {
    email,
  });
  return response;
};


// ==========================================
// FIRST-LOGIN PASSWORD CHANGE
// ==========================================

export const changeFirstLoginPassword = async (
  email,
  currentPassword,
  newPassword
) => {

  const response =
    await post(
      API_ENDPOINTS.auth.changeFirstLoginPassword,
      {
        email,
        currentPassword,
        newPassword,
      }
    );

  const token =
    response?.token ||
    response?.data?.token;

  const user =
    response?.user ||
    response?.data?.user;

  if (token) {
    localStorage.setItem("token", token);
  }

  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  }

  return {
    ...response,
    token,
    user,
  };

};


// ==========================================
// RESET / FORGOT PASSWORD
// ==========================================

export const resetPassword = async (
  email,
  newPassword,
  otp = null
) => {

  const response =
    await post(
      API_ENDPOINTS.auth.resetPassword,
      {
        email,
        newPassword,
        otp,
      }
    );

  return response;

};


// ==========================================
// UPDATE USER PROFILE (NAME & AVATAR)
// ==========================================

export const updateUserProfile = async (name, avatar) => {
  const response = await put(API_ENDPOINTS.auth.profile, { name, avatar });
  if (response?.data) {
    updateStoredUser(response.data);
  }
  return response;
};


// ==========================================
// UPDATE STORED USER
// ==========================================

export const updateStoredUser = (updatedFields) => {
  const current = getStoredUser() || {};
  const merged = { ...current, ...updatedFields };
  localStorage.setItem("user", JSON.stringify(merged));
  // Dispatch custom event to notify all components
  window.dispatchEvent(new Event("userProfileUpdated"));
  return merged;
};


// ==========================================
// LOGOUT
// ==========================================

export const logoutUser = () => {

  localStorage.removeItem(
    "token"
  );

  localStorage.removeItem(
    "authToken"
  );

  localStorage.removeItem(
    "user"
  );

};