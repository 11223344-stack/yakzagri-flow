import type { StreamStatus } from "@/lib/api/types";

export const STREAM_STATUS_TOKENS: Record<StreamStatus, string> = {
  ACTIVE: "border-emerald-300 bg-emerald-100 text-emerald-900",
  SUSPENDED: "border-amber-300 bg-amber-100 text-amber-900",
  TERMINATED: "border-red-300 bg-red-100 text-red-900",
  COMPLETED: "border-blue-300 bg-blue-100 text-blue-900",
};
