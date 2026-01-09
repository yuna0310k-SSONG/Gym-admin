import { useQuery } from "@tanstack/react-query";
import { insightApi } from "@/lib/api/insights";
import type { InsightHexagonResponse, WeeklySummaryResponse, RiskMembersResponse } from "@/types/api/responses";

export function useHexagonInsights() {
  return useQuery<InsightHexagonResponse | null, Error>({
    queryKey: ["insights", "hexagon"],
    queryFn: () => insightApi.getHexagon(),
    staleTime: 5 * 60 * 1000, // 5분
    retry: false, // 404 에러는 재시도하지 않음
  });
}

export function useWeeklySummary() {
  return useQuery<WeeklySummaryResponse | null, Error>({
    queryKey: ["insights", "weekly-summary"],
    queryFn: () => insightApi.getWeeklySummary(),
    staleTime: 5 * 60 * 1000, // 5분
    retry: false, // 404 에러는 재시도하지 않음
  });
}

export function useRiskMembers() {
  return useQuery<RiskMembersResponse | null, Error>({
    queryKey: ["insights", "risk-members"],
    queryFn: () => insightApi.getRiskMembers(),
    staleTime: 5 * 60 * 1000, // 5분
    retry: false, // 404 에러는 재시도하지 않음
  });
}





