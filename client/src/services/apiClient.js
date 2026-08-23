// ==========================================
// API CLIENT
// Frontend → Backend communication
// ==========================================

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";


// ------------------------------------------
// GET TOKEN
// ------------------------------------------

const getToken = () => {

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken")
  );

};


// ------------------------------------------
// COMMON REQUEST
// ------------------------------------------

const request = async (
  endpoint,
  options = {}
) => {

  const token = getToken();


  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };


  if (token) {

    headers.Authorization =
      `Bearer ${token}`;

  }


  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );


  let data = null;

  try {
    data = await response.json();
  } catch {
    // Keep data as null if body cannot be parsed as JSON
  }


  if (!response.ok) {

    throw new Error(
      data?.message ||
      "API request failed"
    );

  }


  return data;

};


// ------------------------------------------
// GET
// ------------------------------------------

export const get = (
  endpoint
) => {

  return request(
    endpoint,
    {
      method: "GET",
    }
  );

};


// ------------------------------------------
// POST
// ------------------------------------------

export const post = (
  endpoint,
  body
) => {

  return request(
    endpoint,
    {
      method: "POST",
      body:
        JSON.stringify(body),
    }
  );

};


// ------------------------------------------
// PUT
// ------------------------------------------

export const put = (
  endpoint,
  body
) => {

  return request(
    endpoint,
    {
      method: "PUT",
      body:
        JSON.stringify(body),
    }
  );

};


// ------------------------------------------
// DELETE
// ------------------------------------------

export const remove = (
  endpoint
) => {

  return request(
    endpoint,
    {
      method: "DELETE",
    }
  );

};

export const del = remove;