import { apiClient } from "./client";
import type {
  ApiResponse,
  MemberAnalyticsResponse,
  AverageAnalyticsResponse,
  MemberComparisonResponse,
} from "@/types/api/responses";

export const analyticsApi = {
  async getMemberAnalytics(memberId: string): Promise<MemberAnalyticsResponse> {
    const response = await apiClient.get<ApiResponse<MemberAnalyticsResponse>>(
      `/api/members/${memberId}/analytics`
    );
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to fetch member analytics");
  },

  async getAverages(): Promise<AverageAnalyticsResponse> {
    const response = await apiClient.get<ApiResponse<AverageAnalyticsResponse>>(
      "/api/analytics/averages"
    );
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to fetch averages");
  },

  async getComparison(memberId: string): Promise<MemberComparisonResponse> {
    const response = await apiClient.get<ApiResponse<MemberComparisonResponse>>(
      `/api/analytics/comparison/${memberId}`
    );
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to fetch comparison");
  },
};





