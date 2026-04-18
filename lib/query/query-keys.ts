export const queryKeys = {
  auth: {
    session: ["auth", "session"] as const,
  },
  users: {
    me: ["users", "me"] as const,
    orders: ["users", "orders"] as const,
    payments: ["users", "payments"] as const,
  },
  dashboard: {
    user: ["dashboard", "user"] as const,
    vendor: ["dashboard", "vendor"] as const,
    admin: ["dashboard", "admin"] as const,
  },
} as const;
