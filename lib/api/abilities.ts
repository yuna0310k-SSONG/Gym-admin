import { apiClient } from "./client";
import type {
  ApiResponse,
  LatestAbilitySnapshotResponse,
  AbilitySnapshotListResponse,
  AbilityComparisonResponse,
  AbilityHexagonResponse,
  AbilityHistoryResponse,
} from "@/types/api/responses";

export const abilityApi = {
  async getLatest(memberId: string): Promise<LatestAbilitySnapshotResponse> {
    const response = await apiClient.get<ApiResponse<LatestAbilitySnapshotResponse>>(
      `/api/members/${memberId}/abilities/latest`
    );
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to fetch latest ability snapshot");
  },

  async getSnapshots(memberId: string): Promise<AbilitySnapshotListResponse> {
    const response = await apiClient.get<ApiResponse<AbilitySnapshotListResponse>>(
      `/api/members/${memberId}/abilities/snapshots`
    );
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to fetch ability snapshots");
  },

  async getCompare(
    memberId: string,
    prev: number = 1
  ): Promise<AbilityComparisonResponse | null> {
    try {
      const response = await apiClient.get<ApiResponse<AbilityComparisonResponse> | null>(
        `/api/members/${memberId}/abilities/compare?prev=${prev}`
      );
      
      // 선택적 엔드포인트의 경우 null이 반환될 수 있음
      if (!response) {
        return null;
      }
      
      if ("data" in response) {
        return response.data;
      }
      return null;
    } catch (error: any) {
      // 404 에러는 능력치 스냅샷이 없을 수 있으므로 null 반환
      if (
        error?.message?.includes("404") ||
        error?.message?.includes("ASSESSMENT_NOT_FOUND") ||
        error?.message?.includes("능력치 스냅샷이 없습니다") ||
        error?.message?.includes("Cannot GET")
      ) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            "[Ability API] Compare endpoint: 능력치 스냅샷이 없습니다.",
            memberId
          );
        }
        return null;
      }
      throw error;
    }
  },

  async getHexagon(memberId: string): Promise<AbilityHexagonResponse | null> {
    try {
      const response = await apiClient.get<ApiResponse<AbilityHexagonResponse> | null>(
        `/api/members/${memberId}/abilities/hexagon`
      );
      
      // 선택적 엔드포인트의 경우 null이 반환될 수 있음
      if (!response) {
        return null;
      }
      
      if ("data" in response) {
        return response.data;
      }
      return null;
    } catch (error: any) {
      // 404 에러는 백엔드가 아직 구현하지 않았을 수 있으므로 null 반환
      if (error?.message?.includes("404") || error?.message?.includes("Cannot GET")) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            "[Ability API] Hexagon endpoint not found, falling back to latest snapshot"
          );
        }
        return null;
      }
      throw error;
    }
  },

  async getHistory(memberId: string): Promise<AbilityHistoryResponse> {
    const response = await apiClient.get<ApiResponse<AbilityHistoryResponse>>(
      `/api/members/${memberId}/abilities/history`
    );
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to fetch ability history");
  },
};


