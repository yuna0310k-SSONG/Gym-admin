import { apiClient } from "./client";
import type { ApiResponse } from "@/types/api/responses";

export interface TrainerApprovalRequest {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  isApproved?: boolean;
}

export interface TrainerApprovalListResponse {
  trainers: TrainerApprovalRequest[];
  total: number;
}

export const trainerApi = {
  // 승인 대기 트레이너 목록 조회 (Admin만)
  async getPendingTrainers(): Promise<TrainerApprovalListResponse> {
    const response = await apiClient.get<
      ApiResponse<TrainerApprovalListResponse>
    >("/api/auth/pending-trainers");
    
    // 디버깅용 로그
    if (process.env.NODE_ENV === "development") {
      console.log("[Trainer API] getPendingTrainers response:", response);
    }
    
    if ("data" in response) {
      const data = response.data;
      // 응답 구조가 다를 수 있으므로 안전하게 처리
      return {
        trainers: data?.trainers || data || [],
        total: data?.total ?? (Array.isArray(data?.trainers) ? data.trainers.length : Array.isArray(data) ? data.length : 0),
      };
    }
    throw new Error("Failed to fetch pending trainers");
  },

  // 전체 트레이너 목록 조회 (승인됨/대기중 모두) (Admin만)
  async getAllTrainers(): Promise<TrainerApprovalListResponse> {
    const response = await apiClient.get<
      ApiResponse<TrainerApprovalListResponse>
    >("/api/auth/trainers");
    
    // 디버깅용 로그
    if (process.env.NODE_ENV === "development") {
      console.log("[Trainer API] getAllTrainers response:", response);
    }
    
    if ("data" in response) {
      const data = response.data;
      // 응답 구조가 다를 수 있으므로 안전하게 처리
      return {
        trainers: data?.trainers || data || [],
        total: data?.total ?? (Array.isArray(data?.trainers) ? data.trainers.length : Array.isArray(data) ? data.length : 0),
      };
    }
    throw new Error("Failed to fetch all trainers");
  },

  // 트레이너 승인 (Admin만)
  async approveTrainer(trainerId: string): Promise<void> {
    await apiClient.post<ApiResponse<void>>(`/api/auth/approve-trainer/${trainerId}`, {});
  },

  // 트레이너 승인 취소 (Admin만)
  async disapproveTrainer(trainerId: string): Promise<void> {
    await apiClient.post<ApiResponse<void>>(`/api/auth/disapprove-trainer/${trainerId}`, {});
  },

  // 트레이너 거부 (Admin만)
  // 이제는 계정을 삭제하지 않고 isApproved = false로 변경합니다.
  async rejectTrainer(trainerId: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/api/auth/reject-trainer/${trainerId}`);
  },
};

