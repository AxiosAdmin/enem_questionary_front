import axios from "axios";

export const fetchApi = async (endpoint, body = null, method = "GET") => {
  const baseUrl = process.env.REACT_APP_BASE_API_URL || "";
  const config = {
    method,
    url: `${baseUrl}${endpoint}`,
  };

  if (body !== null && ["POST", "PATCH", "PUT"].includes(method)) {
    config.data = body;
  }

  const response = await axios(config);
  return response.data;
};

// Convenience methods
export const get = (endpoint) => fetchApi(endpoint, null, "GET");
export const post = (endpoint, body) => fetchApi(endpoint, body, "POST");
export const patch = (endpoint, body) => fetchApi(endpoint, body, "PATCH");
export const put = (endpoint, body) => fetchApi(endpoint, body, "PUT");
export const del = (endpoint) => fetchApi(endpoint, null, "DELETE");
