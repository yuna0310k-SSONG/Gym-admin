import { apiClient } from "./client";
import type {
  ApiResponse,
  InsightHexagonResponse,
  WeeklySummaryResponse,
  RiskMembersResponse,
} from "@/types/api/responses";

export const insightApi = {
  async getHexagon(): Promise<InsightHexagonResponse | null> {
    const response = await apiClient.get<ApiResponse<InsightHexagonResponse> | null>(
      "/api/insights/hexagon"
    );
    if (!response) {
      return null;
    }
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to fetch hexagon data");
  },

  async getWeeklySummary(): Promise<WeeklySummaryResponse | null> {
    const response = await apiClient.get<ApiResponse<WeeklySummaryResponse> | null>(
      "/api/insights/weekly-summary"
    );
    if (!response) {
      return null;
    }
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to fetch weekly summary");
  },

  async getRiskMembers(): Promise<RiskMembersResponse | null> {
    const response = await apiClient.get<ApiResponse<RiskMembersResponse> | null>(
      "/api/insights/risk-members"
    );
    if (!response) {
      return null;
    }
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to fetch risk members");
  },
};
