import { apiClient } from "./client";
import type {
  ApiResponse,
  InsightHexagonResponse,
  WeeklySummaryResponse,
  RiskMembersResponse,
} from "@/types/api/responses";

export const insightApi = {
  async getHexagon(): Promise<InsightHexagonResponse> {
    const response = await apiClient.get<ApiResponse<InsightHexagonResponse>>(
      "/api/insights/hexagon"
    );
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to fetch hexagon data");
  },

  async getWeeklySummary(): Promise<WeeklySummaryResponse> {
    const response = await apiClient.get<ApiResponse<WeeklySummaryResponse>>(
      "/api/insights/weekly-summary"
    );
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to fetch weekly summary");
  },

  async getRiskMembers(): Promise<RiskMembersResponse> {
    const response = await apiClient.get<ApiResponse<RiskMembersResponse>>(
      "/api/insights/risk-members"
    );
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to fetch risk members");
  },
};
