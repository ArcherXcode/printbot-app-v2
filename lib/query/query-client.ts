import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

import { CACHE } from "@/lib/constants/runtime";
import { normalizeApiError } from "@/lib/api/error-map";
import { useUiStore } from "@/lib/store/ui-store";

function notifyError(error: unknown) {
  const mapped = normalizeApiError(error);
  useUiStore.getState().pushToast({
    kind: "error",
    title: mapped.code,
    description: mapped.message,
  });
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      notifyError(error);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      notifyError(error);
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: CACHE.defaultStaleMs,
      retry: (failureCount, error) => {
        const mapped = normalizeApiError(error);

        if (mapped.code === "HTTP_400" || mapped.code === "HTTP_403" || mapped.code === "HTTP_404" || mapped.code === "HTTP_409") {
          return false;
        }

        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});
