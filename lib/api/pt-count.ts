import { apiClient } from "./client";
import type { ApiResponse } from "@/types/api/responses";

// PT 횟수 타입 정의
// 백엔드 DB 스키마: total_sessions, used_sessions, remaining_sessions
// NestJS가 자동으로 camelCase로 변환하여 API 응답: totalSessions, usedSessions, remainingSessions
// 프론트엔드에서는 totalCount, usedCount, remainingCount로 사용
export interface PTUsage {
  id: string;
  memberId: string;
  totalCount: number; // 백엔드 API: totalSessions (DB: total_sessions)
  remainingCount: number; // 백엔드 API: remainingSessions (DB: remaining_sessions)
  usedCount: number; // 백엔드 API: usedSessions (DB: used_sessions)
  lastUsedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePTUsageRequest {
  totalCount: number; // 백엔드 API 요청: totalSessions
  remainingCount?: number; // 백엔드 API 요청: remainingSessions
  usedCount?: number; // 백엔드 API 요청: usedSessions
}

export interface UpdatePTUsageRequest {
  totalCount?: number;
  remainingCount?: number;
  usedCount?: number;
}

export const ptCountApi = {
  async get(memberId: string): Promise<PTUsage | null> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(
        `/api/members/${memberId}/pt-count`
      );
      if ("data" in response) {
        const data = response.data;
        // 백엔드가 snake_case 또는 camelCase로 응답할 수 있으므로 모두 처리
        return {
          id: data.id,
          memberId: data.memberId || data.member_id,
          totalCount: data.totalCount ?? data.totalSessions ?? data.total_sessions ?? 0,
          remainingCount: data.remainingCount ?? data.remainingSessions ?? data.remaining_sessions ?? 0,
          usedCount: data.usedCount ?? data.usedSessions ?? data.used_sessions ?? 0,
          lastUsedDate: data.lastUsedDate ?? data.lastUsedDate ?? data.last_used_date,
          createdAt: data.createdAt ?? data.created_at,
          updatedAt: data.updatedAt ?? data.updated_at,
        };
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
    // 백엔드 Swagger 명세:
    // POST /api/members/{id}/pt-count
    // { "totalCount": 20, "remainingCount": 15, "usedCount": 5 }
    const requestData: any = {
      totalCount: data.totalCount,
    };
    if (data.usedCount !== undefined) {
      requestData.usedCount = data.usedCount;
    }
    if (data.remainingCount !== undefined) {
      requestData.remainingCount = data.remainingCount;
    }

    const response = await apiClient.post<ApiResponse<any>>(
      `/api/members/${memberId}/pt-count`,
      requestData
    );
    if ("data" in response) {
      const responseData = response.data;
      // 백엔드 응답을 프론트엔드 형식으로 변환
      return {
        id: responseData.id,
        memberId: responseData.memberId || responseData.member_id,
        totalCount: responseData.totalCount ?? responseData.totalSessions ?? responseData.total_sessions ?? 0,
        remainingCount: responseData.remainingCount ?? responseData.remainingSessions ?? responseData.remaining_sessions ?? 0,
        usedCount: responseData.usedCount ?? responseData.usedSessions ?? responseData.used_sessions ?? 0,
        lastUsedDate: responseData.lastUsedDate ?? responseData.lastUsedDate ?? responseData.last_used_date,
        createdAt: responseData.createdAt ?? responseData.created_at,
        updatedAt: responseData.updatedAt ?? responseData.updated_at,
      };
    }
    throw new Error("Failed to create/update PT usage");
  },

  async update(memberId: string, data: UpdatePTUsageRequest): Promise<PTUsage> {
    // PUT 요청도 동일한 필드명을 사용
    const requestData: any = {};
    if (data.totalCount !== undefined) {
      requestData.totalCount = data.totalCount;
    }
    if (data.usedCount !== undefined) {
      requestData.usedCount = data.usedCount;
    }
    if (data.remainingCount !== undefined) {
      requestData.remainingCount = data.remainingCount;
    }

    const response = await apiClient.put<ApiResponse<any>>(
      `/api/members/${memberId}/pt-count`,
      requestData
    );
    if ("data" in response) {
      const responseData = response.data;
      // 백엔드 응답을 프론트엔드 형식으로 변환
      return {
        id: responseData.id,
        memberId: responseData.memberId || responseData.member_id,
        totalCount: responseData.totalCount ?? responseData.totalSessions ?? responseData.total_sessions ?? 0,
        remainingCount: responseData.remainingCount ?? responseData.remainingSessions ?? responseData.remaining_sessions ?? 0,
        usedCount: responseData.usedCount ?? responseData.usedSessions ?? responseData.used_sessions ?? 0,
        lastUsedDate: responseData.lastUsedDate ?? responseData.lastUsedDate ?? responseData.last_used_date,
        createdAt: responseData.createdAt ?? responseData.created_at,
        updatedAt: responseData.updatedAt ?? responseData.updated_at,
      };
    }
    throw new Error("Failed to update PT usage");
  },
};

