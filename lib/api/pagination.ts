export type PaginatedResponse<T> = {
  page: number;
  limit: number;
  total: number;
  items: T[];
};

function asNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

export function toPaginatedResponse<T>(data: T[] | PaginatedResponse<T>): PaginatedResponse<T> {
  if (Array.isArray(data)) {
    return {
      page: 1,
      limit: data.length,
      total: data.length,
      items: data,
    };
  }

  return {
    page: asNumber(data.page, 1),
    limit: asNumber(data.limit, Array.isArray(data.items) ? data.items.length : 0),
    total: asNumber(data.total, Array.isArray(data.items) ? data.items.length : 0),
    items: Array.isArray(data.items) ? data.items : [],
  };
}
