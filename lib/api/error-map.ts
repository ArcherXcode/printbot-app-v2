export type ApiErrorCode =
  | "HTTP_400"
  | "HTTP_401"
  | "HTTP_403"
  | "HTTP_404"
  | "HTTP_409"
  | "HTTP_500"
  | "UNKNOWN";

export type ApiError = {
  code: ApiErrorCode;
  message: string;
  status?: number;
};

const fallbackMessage = "Something went wrong. Please try again.";

export function normalizeApiError(error: unknown): ApiError {
  if (error && typeof error === "object") {
    const candidate = error as Partial<ApiError>;

    if (typeof candidate.code === "string" && typeof candidate.message === "string") {
      return {
        code: candidate.code as ApiErrorCode,
        message: candidate.message,
        status: candidate.status,
      };
    }
  }

  return {
    code: "UNKNOWN",
    message: fallbackMessage,
  };
}

export function isAccessLimitedError(error: unknown): boolean {
  const mapped = normalizeApiError(error);
  return mapped.code === "HTTP_403" || mapped.code === "HTTP_404";
}
