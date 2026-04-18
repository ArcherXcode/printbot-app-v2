import { useMemo } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";

import { PAGINATION } from "@/lib/constants/runtime";

export function usePaginationParams() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const page = Number(params.page ?? PAGINATION.defaultPage);
  const rawLimit = Number(params.limit ?? PAGINATION.defaultLimit);
  const limit = Math.min(Math.max(rawLimit, 1), PAGINATION.maxLimit);

  const setPage = (nextPage: number) => {
    const normalized = Math.max(nextPage, 1);

    router.setParams({
      ...params,
      page: String(normalized),
    });
  };

  const setLimit = (nextLimit: number) => {
    const normalized = Math.min(Math.max(nextLimit, 1), PAGINATION.maxLimit);

    router.setParams({
      ...params,
      limit: String(normalized),
      page: String(PAGINATION.defaultPage),
    });
  };

  return useMemo(
    () => ({
      page,
      limit,
      setPage,
      setLimit,
    }),
    [page, limit]
  );
}