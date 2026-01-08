import { apiClient } from "./client";
import type {
  ApiResponse,
  InjuryListResponse,
  InjuryResponse,
} from "@/types/api/responses";
import type {
  CreateInjuryRequest,
  UpdateInjuryRequest,
  CreateInjuryRestrictionRequest,
} from "@/types/api/requests";

export const injuryApi = {
  async getInjuries(memberId: string): Promise<InjuryListResponse> {
    const response = await apiClient.get<ApiResponse<InjuryListResponse>>(
      `/api/members/${memberId}/injuries`
    );
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to fetch injuries");
  },

  async createInjury(memberId: string, data: CreateInjuryRequest): Promise<InjuryResponse> {
    const response = await apiClient.post<ApiResponse<InjuryResponse>>(
      `/api/members/${memberId}/injuries`,
      data
    );
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to create injury");
  },

  async getInjury(memberId: string, injuryId: string): Promise<InjuryResponse> {
    const response = await apiClient.get<ApiResponse<InjuryResponse>>(
      `/api/members/${memberId}/injuries/${injuryId}`
    );
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to fetch injury");
  },

  async updateInjury(
    memberId: string,
    injuryId: string,
    data: UpdateInjuryRequest
  ): Promise<InjuryResponse> {
    const response = await apiClient.put<ApiResponse<InjuryResponse>>(
      `/api/members/${memberId}/injuries/${injuryId}`,
      data
    );
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to update injury");
  },

  async createRestriction(
    memberId: string,
    injuryId: string,
    data: CreateInjuryRestrictionRequest
  ): Promise<void> {
    await apiClient.post(
      `/api/members/${memberId}/injuries/${injuryId}/restrictions`,
      data
    );
  },
};




