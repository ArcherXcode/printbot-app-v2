export const CACHE = {
  stableStaleMs: 5 * 60 * 1000,
  defaultStaleMs: 60 * 1000,
} as const;

export const POLLING = {
  operationalMs: 5 * 1000,
} as const;

export const PAGINATION = {
  defaultPage: 1,
  defaultLimit: 20,
  maxLimit: 100,
} as const;
