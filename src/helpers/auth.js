export const TOKEN_STORAGE_KEY = "token";
export const TOKEN_TYPE_STORAGE_KEY = "token_type";
export const AUTH_USER_STORAGE_KEY = "auth_user";

export const getStoredToken = () => {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || "";
  } catch {
    return "";
  }
};

export const getStoredTokenType = () => {
  try {
    return localStorage.getItem(TOKEN_TYPE_STORAGE_KEY) || "Bearer";
  } catch {
    return "Bearer";
  }
};

export const isAuthenticated = () => Boolean(getStoredToken());

export const saveAuthSession = (response) => {
  const accessToken = response?.access_token || "";
  const tokenType = response?.token_type || "bearer";
  const userData = response?.data || null;

  localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
  localStorage.setItem(TOKEN_TYPE_STORAGE_KEY, tokenType);

  if (userData) {
    localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(userData));
  } else {
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
  }
};

export const clearAuthSession = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(TOKEN_TYPE_STORAGE_KEY);
  localStorage.removeItem(AUTH_USER_STORAGE_KEY);
};

export const getStoredAuthUser = () => {
  try {
    const rawUser = localStorage.getItem(AUTH_USER_STORAGE_KEY);
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    return null;
  }
};

