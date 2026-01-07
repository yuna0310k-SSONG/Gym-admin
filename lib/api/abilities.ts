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

  async getCompare(memberId: string, prev: number = 1): Promise<AbilityComparisonResponse> {
    const response = await apiClient.get<ApiResponse<AbilityComparisonResponse>>(
      `/api/members/${memberId}/abilities/compare?prev=${prev}`
    );
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to fetch ability comparison");
  },

  async getHexagon(memberId: string): Promise<AbilityHexagonResponse> {
    const response = await apiClient.get<ApiResponse<AbilityHexagonResponse>>(
      `/api/members/${memberId}/abilities/hexagon`
    );
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to fetch ability hexagon");
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


