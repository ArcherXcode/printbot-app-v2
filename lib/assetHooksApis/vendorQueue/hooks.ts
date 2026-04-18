import { useQuery } from "@tanstack/react-query";

// import { POLLING } from "@/lib/constants/runtime";
import { getVendorQueue, getVendorQueueMetrics, type VendorQueueFilters, type VendorQueueResponse } from "./api";

export function useVendorQueue(filters: VendorQueueFilters = {}) {
  return useQuery<VendorQueueResponse>({
    queryKey: ["queue", "vendor", "list", filters],
    queryFn: () => getVendorQueue(filters),
    // refetchInterval: POLLING.operationalMs,
    // refetchIntervalInBackground: false,
  });
}

export function useVendorQueueMetrics() {
  return useQuery({
    queryKey: ["queue", "vendor", "metrics"],
    queryFn: getVendorQueueMetrics,
    // refetchInterval: POLLING.operationalMs,
    // refetchIntervalInBackground: false,
  });
}
