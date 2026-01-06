// 인사이트 서비스
import { insightApi } from "@/lib/api/insights";
import type {
  InsightHexagonResponse,
  WeeklySummaryResponse,
  RiskMembersResponse,
} from "@/types/api/responses";

export const insightService = {
  // 운영 능력치 헥사곤
  async getHexagon(): Promise<InsightHexagonResponse> {
    return insightApi.getHexagon();
  },

  // 이번 주 vs 지난 주 비교
  async getWeeklySummary(): Promise<WeeklySummaryResponse> {
    return insightApi.getWeeklySummary();
  },

  // 위험 신호 회원 리스트
  async getRiskMembers(): Promise<RiskMembersResponse> {
    return insightApi.getRiskMembers();
  },
};
