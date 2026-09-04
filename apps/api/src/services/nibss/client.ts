import axios, { AxiosInstance } from "axios";
import { env } from "../../config/env.js";
import { NibssLoginResponse } from "./types.js";

type CachedToken = { token: string; expiresAt: number };

let cached: CachedToken | null = null;
let loginInFlight: Promise<string> | null = null;

const REFRESH_BUFFER_MS = 60_000; // refresh if <1 min to expiry

const rawClient: AxiosInstance = axios.create({
  baseURL: env.NIBSS_BASE_URL,
  timeout: 15_000,
});

async function loginToNibss(): Promise<string> {
  const res = await rawClient.post<NibssLoginResponse>("/api/auth/token", {
    apiKey: env.NIBSS_API_KEY,
    apiSecret: env.NIBSS_API_SECRET,
  });
  const token = res.data.token;
  // NIBSS tokens are valid for 1 hour per the docs
  cached = { token, expiresAt: Date.now() + 60 * 60 * 1000 };
  return token;
}

export async function getNibssToken(): Promise<string> {
  const now = Date.now();
  if (cached && cached.expiresAt - now > REFRESH_BUFFER_MS) {
    return cached.token;
  }
  // Deduplicate concurrent logins
  if (!loginInFlight) {
    loginInFlight = loginToNibss().finally(() => {
      loginInFlight = null;
    });
  }
  return loginInFlight;
}

/**
 * Authenticated axios instance for NIBSS calls.
 * Attaches a fresh token to every request. Retries once on 401.
 */
export const nibssClient: AxiosInstance = axios.create({
  baseURL: env.NIBSS_BASE_URL,
  timeout: 15_000,
});

nibssClient.interceptors.request.use(async (config) => {
  const token = await getNibssToken();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

nibssClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retried) {
      original._retried = true;
      cached = null; // force refresh
      const token = await getNibssToken();
      original.headers.Authorization = `Bearer ${token}`;
      return nibssClient.request(original);
    }
    return Promise.reject(error);
  },
);
