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

  async getComparison(memberId: string): Promise<MemberComparisonResponse | null> {
    const response = await apiClient.get<ApiResponse<MemberComparisonResponse> | null>(
      `/api/analytics/comparison/${memberId}`
    );
    
    // 404 에러 발생 시 null 반환 (선택적 엔드포인트)
    if (response === null) {
      return null;
    }
    
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to fetch comparison");
  },
};





