// ==========================================
// DEPARTMENT SERVICE
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

export const getDepartments = async () => {

  const response =
    await get(
      API_ENDPOINTS.departments
    );

  return response.data || [];

};


// GET BY ID

export const getDepartment = async (
  id
) => {

  const response =
    await get(
      `${API_ENDPOINTS.departments}/${id}`
    );

  return response.data;

};


// CREATE

export const createDepartment = async (
  departmentData
) => {

  const response =
    await post(
      API_ENDPOINTS.departments,
      departmentData
    );

  return response.data;

};


// UPDATE

export const updateDepartment = async (
  id,
  departmentData
) => {

  const response =
    await put(
      `${API_ENDPOINTS.departments}/${id}`,
      departmentData
    );

  return response.data;

};


// DELETE

export const deleteDepartment = async (
  id
) => {

  const response =
    await remove(
      `${API_ENDPOINTS.departments}/${id}`
    );

  return response.data;

};

// ------------------------------------------
// GENERATE UNIQUE DEPARTMENT CODE & ID
// e.g. Administration -> DCS-ADM-1, HR -> DCS-HR-1, Finance -> DCS-FIN-1
// ------------------------------------------
export const getDepartmentCodeAndId = (name = "", id = 1) => {
  const clean = (name || "").trim().toUpperCase();

  let prefix;
  let badgeCode;

  if (clean.includes("ADMIN")) {
    prefix = "ADM";
    badgeCode = "ADM";
  } else if (clean.includes("HUMAN") || clean.includes("HR") || clean === "HR") {
    prefix = "HR";
    badgeCode = "HR";
  } else if (clean.includes("FINANCE") || clean.includes("ACCOUNT")) {
    prefix = "FIN";
    badgeCode = "FIN";
  } else if (clean.includes("AI") && clean.includes("ML")) {
    prefix = "AIML";
    badgeCode = "AIML";
  } else if (clean.includes("ARTIFICIAL") || clean === "AI") {
    prefix = "AI";
    badgeCode = "AI";
  } else if (clean.includes("DEV") || clean.includes("SOFTWARE") || clean.includes("ENGINEER")) {
    prefix = "DEV";
    badgeCode = "DEV";
  } else if (clean.includes("TEST") || clean.includes("QA") || clean.includes("QUALITY")) {
    prefix = "QA";
    badgeCode = "QA";
  } else if (clean.includes("MARKET")) {
    prefix = "MKT";
    badgeCode = "MKT";
  } else if (clean.includes("SALES")) {
    prefix = "SLS";
    badgeCode = "SLS";
  } else if (clean.includes("OPERAT")) {
    prefix = "OPS";
    badgeCode = "OPS";
  } else if (clean.includes("SUPPORT") || clean.includes("HELP")) {
    prefix = "SUP";
    badgeCode = "SUP";
  } else if (clean.includes("DESIGN") || clean.includes("UI") || clean.includes("UX")) {
    prefix = "DSG";
    badgeCode = "DSG";
  } else if (clean.includes("LEGAL")) {
    prefix = "LGL";
    badgeCode = "LGL";
  } else if (clean.includes("SECURITY")) {
    prefix = "SEC";
    badgeCode = "SEC";
  } else {
    const words = clean.split(/\s+/).filter(Boolean);
    if (words.length > 1) {
      prefix = words.map((w) => w[0]).join("").slice(0, 4);
      badgeCode = prefix;
    } else {
      prefix = clean.replace(/[^A-Z0-9]/g, "").slice(0, 4) || "DEPT";
      badgeCode = prefix;
    }
  }

  return {
    uniqueId: `DCS-${prefix}-${id}`,
    badgeCode: badgeCode,
  };
};