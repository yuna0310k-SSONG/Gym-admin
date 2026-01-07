import { apiClient } from "./client";
import type { ApiResponse, MemberGoalResponse } from "@/types/api/responses";
import type {
  CreateMemberGoalRequest,
  UpdateMemberGoalRequest,
} from "@/types/api/requests";

export const goalApi = {
  async get(memberId: string): Promise<MemberGoalResponse | null> {
    const response = await apiClient.get<ApiResponse<MemberGoalResponse>>(
      `/api/members/${memberId}/goal`
    );
    if ("data" in response) {
      return response.data;
    }
    if (response.error?.code === "GOAL_NOT_FOUND") {
      return null;
    }
    throw new Error("Failed to fetch member goal");
  },

  async create(
    memberId: string,
    data: CreateMemberGoalRequest
  ): Promise<MemberGoalResponse> {
    // 백엔드 사양: 생성/수정은 PUT /api/members/:id/goal (upsert)
    const response = await apiClient.put<ApiResponse<MemberGoalResponse>>(
      `/api/members/${memberId}/goal`,
      data
    );
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to create member goal");
  },

  async update(
    memberId: string,
    data: UpdateMemberGoalRequest
  ): Promise<MemberGoalResponse> {
    const response = await apiClient.put<ApiResponse<MemberGoalResponse>>(
      `/api/members/${memberId}/goal`,
      data
    );
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to update member goal");
  },

  async delete(memberId: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/api/members/${memberId}/goal`
    );
    if ("error" in response) {
      throw new Error("Failed to delete member goal");
    }
  },
};
