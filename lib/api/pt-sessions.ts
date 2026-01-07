import { apiClient } from "./client";
import type {
  ApiResponse,
  PTSessionResponse,
  PTSessionListResponse,
} from "@/types/api/responses";
import type {
  CreatePTSessionRequest,
  UpdatePTSessionRequest,
} from "@/types/api/requests";

export const ptSessionApi = {
  async getList(memberId: string): Promise<PTSessionListResponse> {
    const response = await apiClient.get<ApiResponse<PTSessionListResponse>>(
      `/api/members/${memberId}/pt-sessions`
    );
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to fetch PT sessions");
  },

  async get(memberId: string, sessionId: string): Promise<PTSessionResponse> {
    const response = await apiClient.get<ApiResponse<PTSessionResponse>>(
      `/api/members/${memberId}/pt-sessions/${sessionId}`
    );
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to fetch PT session");
  },

  async create(
    memberId: string,
    data: CreatePTSessionRequest
  ): Promise<PTSessionResponse> {
    const response = await apiClient.post<ApiResponse<PTSessionResponse>>(
      `/api/members/${memberId}/pt-sessions`,
      data
    );
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to create PT session");
  },

  async update(
    memberId: string,
    sessionId: string,
    data: UpdatePTSessionRequest
  ): Promise<PTSessionResponse> {
    const response = await apiClient.put<ApiResponse<PTSessionResponse>>(
      `/api/members/${memberId}/pt-sessions/${sessionId}`,
      data
    );
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to update PT session");
  },

  async delete(memberId: string, sessionId: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/api/members/${memberId}/pt-sessions/${sessionId}`
    );
    if ("error" in response) {
      throw new Error("Failed to delete PT session");
    }
  },
};

