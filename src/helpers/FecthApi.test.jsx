import axios from "axios";
import { fetchApi } from "./FecthApi";
import {
  AUTH_USER_STORAGE_KEY,
  SESSION_EXPIRED_EVENT,
  TOKEN_STORAGE_KEY,
  TOKEN_TYPE_STORAGE_KEY,
} from "./auth";

jest.mock("axios");

describe("fetchApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
  });

  test("clears auth data when axios returns 401 in response.status", async () => {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, "expired-token");
    window.localStorage.setItem(TOKEN_TYPE_STORAGE_KEY, "bearer");
    window.localStorage.setItem(
      AUTH_USER_STORAGE_KEY,
      JSON.stringify({ nickname: "Pedro" }),
    );

    const sessionExpiredListener = jest.fn();
    window.addEventListener(SESSION_EXPIRED_EVENT, sessionExpiredListener);

    axios.mockRejectedValueOnce({
      response: {
        status: 401,
      },
    });

    await expect(fetchApi("ai/math/topics")).rejects.toEqual({
      response: {
        status: 401,
      },
    });

    expect(window.localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
    expect(window.localStorage.getItem(TOKEN_TYPE_STORAGE_KEY)).toBeNull();
    expect(window.localStorage.getItem(AUTH_USER_STORAGE_KEY)).toBeNull();
    expect(sessionExpiredListener).toHaveBeenCalledTimes(1);

    window.removeEventListener(SESSION_EXPIRED_EVENT, sessionExpiredListener);
  });

  test("clears auth data when axios exposes 401 only in request.status", async () => {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, "expired-token");
    window.localStorage.setItem(TOKEN_TYPE_STORAGE_KEY, "bearer");

    axios.mockRejectedValueOnce({
      request: {
        status: 401,
      },
      message: "Request failed",
    });

    await expect(fetchApi("ai/natural-sciences")).rejects.toMatchObject({
      request: {
        status: 401,
      },
    });

    expect(window.localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
    expect(window.localStorage.getItem(TOKEN_TYPE_STORAGE_KEY)).toBeNull();
  });
});
