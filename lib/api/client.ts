import { normalizeApiError, type ApiError } from "@/lib/api/error-map";
import { deriveRoleFromToken } from "@/lib/assetHooksApis/publicPages/types";
import { authStore } from "@/lib/store/auth-store";

const DEFAULT_API_ORIGIN = process.env.API_URL || "http://192.168.1.124:3000";
const API_PREFIX = process.env.API_PREFIX || "/v1/api";

function resolveApiBaseUrl() {
  // In development always use the Vite proxy to keep auth cookies same-site.
  // This avoids browser rejection of SameSite=Lax refresh cookies on cross-site requests.
  if (process.env.DEV) {
    return API_PREFIX;
  }

  const rawOrigin = process.env.API_BASE_URL?.trim();
  const origin = (rawOrigin && rawOrigin.length > 0 ? rawOrigin : DEFAULT_API_ORIGIN).replace(/\/+$/, "");

  if (origin.endsWith(API_PREFIX)) {
    return origin;
  }

  return `${origin}${API_PREFIX}`;
}

const API_BASE_URL = resolveApiBaseUrl();

type SuccessEnvelope<T> = {
  success: true;
  data: T;
};

type ErrorEnvelope = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

type ApiEnvelope<T> = SuccessEnvelope<T> | ErrorEnvelope;

let refreshPromise: Promise<void> | null = null;

type ApiFetchOptions = {
  responseType?: "json" | "blob";
};

function hasJsonContentType(response: Response): boolean {
  const contentType = response.headers.get("content-type");
  return typeof contentType === "string" && contentType.toLowerCase().includes("application/json");
}

function readToken(data: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }

  return null;
}

async function refreshSession(): Promise<void> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include", // Pass HttpOnly cookie inherently
    });

    const rawText = await response.text();
    const hasJsonBody = rawText.trim().length > 0;
    const payload = hasJsonBody ? (JSON.parse(rawText) as ApiEnvelope<Record<string, unknown>>) : null;

    if (!response.ok || (payload !== null && payload.success === false)) {
      authStore.getState().clearSession();
      throw payload !== null && payload.success === false
        ? payload.error
        : { code: "HTTP_401", message: "Unable to refresh session." };
    }
    
    if (!payload || !payload.data) {
      authStore.getState().clearSession();
      throw { code: "HTTP_401", message: "Unable to refresh session." } satisfies ApiError;
    }

    const tokenData = payload.data;
    const accessToken = readToken(tokenData, ["access_token", "access-token", "accessToken"]);

    if (!accessToken) {
      authStore.getState().clearSession();
      throw {
        code: "HTTP_401",
        message: "Unable to refresh session.",
      } satisfies ApiError;
    }

    const currentSession = authStore.getState();

    currentSession.setSession({
      accessToken,
      role: deriveRoleFromToken(accessToken),
      user: currentSession.user ?? undefined,
    });
  })();

  try {
    await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

export async function restoreSessionWithRefreshToken(): Promise<void> {
  await refreshSession();
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  options?: ApiFetchOptions,
  retryOn401 = true,
): Promise<T> {
  const token = authStore.getState().accessToken;
  const isFormData = init?.body instanceof FormData;
  const hasBody = init?.body !== undefined && init?.body !== null;
  const responseType = options?.responseType ?? "json";
  const headers = new Headers(init?.headers ?? {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!isFormData && hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
    mode: "cors",
  });

  if (responseType === "blob") {
    if (!response.ok) {
      const mapped = normalizeApiError({
        code: `HTTP_${response.status}`,
        message: response.statusText,
        status: response.status,
      });

      if (mapped.code === "HTTP_401" && retryOn401) {
        await refreshSession();
        return apiFetch<T>(path, init, options, false);
      }

      throw mapped;
    }

    return (await response.blob()) as T;
  }

  const expectsJson = hasJsonContentType(response);
  const rawText = expectsJson ? await response.text() : "";
  const hasJsonBody = rawText.trim().length > 0;
  const payload = hasJsonBody ? (JSON.parse(rawText) as ApiEnvelope<T>) : null;

  if (!response.ok || (payload !== null && payload.success === false)) {
    const mapped = normalizeApiError(
      payload !== null && payload.success === false
        ? payload.error
        : {
            code: `HTTP_${response.status}`,
            message: response.statusText,
            status: response.status,
          },
    );

    if (mapped.code === "HTTP_401" && retryOn401) {
      await refreshSession();
      return apiFetch<T>(path, init, options, false);
    }

    throw mapped;
  }

  if (payload === null) {
    return {} as T;
  }

  return payload.data;
}
