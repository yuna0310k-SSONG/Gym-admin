import { apiClient } from "./client";
import type { ApiResponse } from "@/types/api/responses";

// PT 횟수 타입 정의
export interface PTUsage {
  id: string;
  memberId: string;
  totalCount: number;
  remainingCount: number;
  usedCount: number;
  lastUsedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePTUsageRequest {
  totalCount: number;
  remainingCount?: number;
  usedCount?: number;
}

export interface UpdatePTUsageRequest {
  totalCount?: number;
  remainingCount?: number;
  usedCount?: number;
}

export const ptCountApi = {
  async get(memberId: string): Promise<PTUsage | null> {
    try {
      const response = await apiClient.get<ApiResponse<PTUsage>>(
        `/api/members/${memberId}/pt-count`
      );
      if ("data" in response) {
        return response.data;
      }
      return null;
    } catch (error: any) {
      if (error?.message?.includes("404")) {
        return null;
      }
      throw error;
    }
  },

  async createOrUpdate(
    memberId: string,
    data: CreatePTUsageRequest
  ): Promise<PTUsage> {
    const response = await apiClient.post<ApiResponse<PTUsage>>(
      `/api/members/${memberId}/pt-count`,
      data
    );
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to create/update PT usage");
  },

  async update(memberId: string, data: UpdatePTUsageRequest): Promise<PTUsage> {
    const response = await apiClient.put<ApiResponse<PTUsage>>(
      `/api/members/${memberId}/pt-count`,
      data
    );
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to update PT usage");
  },
};

