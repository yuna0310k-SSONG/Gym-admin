import { apiClient } from "./client";
import type {
  ApiResponse,
  AssessmentResponse,
  AssessmentListResponse,
} from "@/types/api/responses";
import type {
  CreateAssessmentRequest,
  UpdateAssessmentRequest,
} from "@/types/api/requests";

export const assessmentApi = {
  async getAssessments(memberId: string): Promise<AssessmentListResponse> {
    const response = await apiClient.get<ApiResponse<AssessmentListResponse>>(
      `/api/members/${memberId}/assessments`
    );
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to fetch assessments");
  },

  async getAssessment(
    memberId: string,
    assessmentId: string
  ): Promise<AssessmentResponse> {
    const response = await apiClient.get<ApiResponse<AssessmentResponse>>(
      `/api/members/${memberId}/assessments/${assessmentId}`
    );
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to fetch assessment");
  },

  async createAssessment(
    memberId: string,
    data: CreateAssessmentRequest
  ): Promise<AssessmentResponse> {
    const response = await apiClient.post<ApiResponse<AssessmentResponse>>(
      `/api/members/${memberId}/assessments`,
      data
    );
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to create assessment");
  },

  async updateAssessment(
    memberId: string,
    assessmentId: string,
    data: UpdateAssessmentRequest
  ): Promise<AssessmentResponse> {
    const response = await apiClient.put<ApiResponse<AssessmentResponse>>(
      `/api/members/${memberId}/assessments/${assessmentId}`,
      data
    );
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to update assessment");
  },
};

