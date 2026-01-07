import { apiClient } from "./client";
import type { ApiResponse, MemberGoalResponse } from "@/types/api/responses";
import type {
  CreateMemberGoalRequest,
  UpdateMemberGoalRequest,
} from "@/types/api/requests";

export const goalApi = {
  async get(memberId: string): Promise<MemberGoalResponse | null> {
    try {
      const response = await apiClient.get<ApiResponse<MemberGoalResponse>>(
        `/api/members/${memberId}/goals`
      );
      if ("data" in response) {
        return response.data;
      }
      if (response.error?.code === "GOAL_NOT_FOUND") {
        return null;
      }
      throw new Error("Failed to fetch member goal");
    } catch (error: any) {
      // 404 에러는 목표가 없는 것으로 처리
      if (
        error?.message?.includes("404") ||
        error?.message?.includes("Cannot GET")
      ) {
        return null;
      }
      throw error;
    }
  },

  async create(
    memberId: string,
    data: CreateMemberGoalRequest
  ): Promise<MemberGoalResponse> {
    // 백엔드 사양: POST /api/members/:id/goals
    try {
      const response = await apiClient.post<ApiResponse<MemberGoalResponse>>(
        `/api/members/${memberId}/goals`,
        data
      );
      if ("data" in response) {
        return response.data;
      }
      throw new Error("Failed to create member goal");
    } catch (error: any) {
      if (
        error?.message?.includes("404") ||
        error?.message?.includes("Cannot POST")
      ) {
        throw new Error(
          "목표 관리 API가 아직 구현되지 않았습니다. 백엔드 개발자에게 문의해주세요."
        );
      }
      throw error;
    }
  },

  async update(
    memberId: string,
    data: UpdateMemberGoalRequest
  ): Promise<MemberGoalResponse> {
    // 백엔드 사양: PUT /api/members/:id/goals
    try {
      const response = await apiClient.put<ApiResponse<MemberGoalResponse>>(
        `/api/members/${memberId}/goals`,
        data
      );
      if ("data" in response) {
        return response.data;
      }
      throw new Error("Failed to update member goal");
    } catch (error: any) {
      if (
        error?.message?.includes("404") ||
        error?.message?.includes("Cannot PUT")
      ) {
        throw new Error(
          "목표 관리 API가 아직 구현되지 않았습니다. 백엔드 개발자에게 문의해주세요."
        );
      }
      throw error;
    }
  },

  async delete(memberId: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/api/members/${memberId}/goals`
    );
    if ("error" in response) {
      throw new Error("Failed to delete member goal");
    }
  },
};
