import axios from "axios";
import { getStoredToken, getStoredTokenType } from "./auth";

const getBaseUrl = () => {
  const runtimeBaseUrl =
    typeof window !== "undefined"
      ? window.__APP_CONFIG__?.REACT_APP_BASE_API_URL
      : "";
  const envBaseUrl = process.env.REACT_APP_BASE_API_URL || "";

  return (runtimeBaseUrl || envBaseUrl).replace(/\/+$/, "");
};

export const fetchApi = async (endpoint, body = null, method = "GET") => {
  const baseUrl = getBaseUrl();
  const token = getStoredToken();
  const tokenType = getStoredTokenType();
  const config = {
    method,
    url: `${baseUrl}/${String(endpoint).replace(/^\/+/, "")}`,
  };

  if (token) {
    config.headers = {
      Authorization: `${tokenType.charAt(0).toUpperCase()}${tokenType.slice(1)} ${token}`,
    };
  }

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
