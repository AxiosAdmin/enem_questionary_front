import axios from "axios";
import {
  clearAuthSession,
  getStoredToken,
  getStoredTokenType,
  notifySessionExpired,
} from "./auth";

const getBaseUrl = () => {
  const runtimeBaseUrl =
    typeof window !== "undefined"
      ? window.__APP_CONFIG__?.REACT_APP_BASE_API_URL
      : "";
  const envBaseUrl = process.env.REACT_APP_BASE_API_URL || "";

  return (runtimeBaseUrl || envBaseUrl).replace(/\/+$/, "");
};

const isUnauthorizedError = (error) => {
  const candidateStatusCodes = [
    error?.response?.status,
    error?.request?.status,
    error?.status,
    error?.response?.data?.status,
    error?.response?.data?.statusCode,
  ]
    .map((value) => Number(value))
    .filter((value) => !Number.isNaN(value));

  if (candidateStatusCodes.includes(401)) {
    return true;
  }

  const message = String(
    error?.message ||
      error?.response?.data?.message ||
      error?.response?.data?.detail ||
      "",
  ).toLowerCase();

  return message.includes("401") || message.includes("unauthorized");
};

export const fetchApi = async (endpoint, body = null, method = "GET") => {
  const baseUrl = getBaseUrl();
  const normalizedEndpoint = String(endpoint).replace(/^\/+/, "");
  const token = getStoredToken();
  const tokenType = getStoredTokenType();
  const config = {
    method,
    url: `${baseUrl}/${normalizedEndpoint}`,
  };

  if (token) {
    config.headers = {
      Authorization: `${tokenType.charAt(0).toUpperCase()}${tokenType.slice(1)} ${token}`,
    };
  }

  if (body !== null && ["POST", "PATCH", "PUT"].includes(method)) {
    config.data = body;
  }

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    const shouldExpireSession =
      normalizedEndpoint !== "login" &&
      Boolean(token) &&
      isUnauthorizedError(error);

    if (shouldExpireSession) {
      clearAuthSession();
      notifySessionExpired();
    }

    throw error;
  }
};

// Convenience methods
export const get = (endpoint) => fetchApi(endpoint, null, "GET");
export const post = (endpoint, body) => fetchApi(endpoint, body, "POST");
export const patch = (endpoint, body) => fetchApi(endpoint, body, "PATCH");
export const put = (endpoint, body) => fetchApi(endpoint, body, "PUT");
export const del = (endpoint) => fetchApi(endpoint, null, "DELETE");
