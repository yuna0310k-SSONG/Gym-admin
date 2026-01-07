import { apiClient } from "./client";
import type { ApiResponse } from "@/types/api/responses";

// 회원권 타입 정의
export interface Membership {
  id: string;
  memberId: string;
  membershipType: "MONTHLY" | "QUARTERLY" | "YEARLY" | "LIFETIME";
  purchaseDate: string;
  expiryDate: string;
  status: "ACTIVE" | "EXPIRED" | "SUSPENDED";
  price?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMembershipRequest {
  membershipType: "MONTHLY" | "QUARTERLY" | "YEARLY" | "LIFETIME";
  purchaseDate: string;
  expiryDate: string;
  status?: "ACTIVE" | "EXPIRED" | "SUSPENDED";
  price?: number;
}

export interface UpdateMembershipRequest {
  membershipType?: "MONTHLY" | "QUARTERLY" | "YEARLY" | "LIFETIME";
  purchaseDate?: string;
  expiryDate?: string;
  status?: "ACTIVE" | "EXPIRED" | "SUSPENDED";
  price?: number;
}

export const membershipApi = {
  async get(memberId: string): Promise<Membership | null> {
    try {
      const response = await apiClient.get<ApiResponse<Membership>>(
        `/api/members/${memberId}/membership`
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

  async create(
    memberId: string,
    data: CreateMembershipRequest
  ): Promise<Membership> {
    const response = await apiClient.post<ApiResponse<Membership>>(
      `/api/members/${memberId}/membership`,
      data
    );
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to create membership");
  },

  async update(
    memberId: string,
    membershipId: string,
    data: UpdateMembershipRequest
  ): Promise<Membership> {
    const response = await apiClient.put<ApiResponse<Membership>>(
      `/api/members/${memberId}/membership/${membershipId}`,
      data
    );
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to update membership");
  },

  async delete(memberId: string, membershipId: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/api/members/${memberId}/membership/${membershipId}`
    );
    if ("error" in response) {
      throw new Error("Failed to delete membership");
    }
  },
};

