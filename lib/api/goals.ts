import { apiClient } from "./client";
import type {
  ApiResponse,
  MemberGoalResponse,
} from "@/types/api/responses";
import type {
  CreateMemberGoalRequest,
  UpdateMemberGoalRequest,
} from "@/types/api/requests";

export const goalApi = {
  async get(memberId: string): Promise<MemberGoalResponse | null> {
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
  },

  async create(
    memberId: string,
    data: CreateMemberGoalRequest
  ): Promise<MemberGoalResponse> {
    const response = await apiClient.post<ApiResponse<MemberGoalResponse>>(
      `/api/members/${memberId}/goals`,
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
      `/api/members/${memberId}/goals`,
      data
    );
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to update member goal");
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

