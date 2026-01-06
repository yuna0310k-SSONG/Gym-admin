import { apiClient } from "./client";
import type {
  ApiResponse,
  Member,
  MemberListResponse,
  MemberResponse,
} from "@/types/api/responses";
import type { CreateMemberRequest, UpdateMemberRequest } from "@/types/api/requests";

export const memberApi = {
  async getMembers(page = 1, pageSize = 10): Promise<MemberListResponse> {
    const response = await apiClient.get<ApiResponse<MemberListResponse>>(
      `/api/members?page=${page}&pageSize=${pageSize}`
    );
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to fetch members");
  },

  async getMember(id: string): Promise<MemberResponse> {
    const response = await apiClient.get<ApiResponse<MemberResponse>>(
      `/api/members/${id}`
    );
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to fetch member");
  },

  async createMember(data: CreateMemberRequest): Promise<MemberResponse> {
    const response = await apiClient.post<ApiResponse<MemberResponse>>(
      "/api/members",
      data
    );
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to create member");
  },

  async updateMember(
    id: string,
    data: UpdateMemberRequest
  ): Promise<MemberResponse> {
    const response = await apiClient.put<ApiResponse<MemberResponse>>(
      `/api/members/${id}`,
      data
    );
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to update member");
  },

  async deleteMember(id: string): Promise<void> {
    await apiClient.delete(`/api/members/${id}`);
  },
};

