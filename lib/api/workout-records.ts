import { apiClient } from "./client";
import type {
  ApiResponse,
  WorkoutRecordResponse,
  WorkoutRecordListResponse,
  WorkoutVolumeAnalysisResponse,
  WorkoutCalendarResponse,
} from "@/types/api/responses";
import type {
  CreateWorkoutRecordRequest,
  UpdateWorkoutRecordRequest,
  WorkoutVolumeAnalysisRequest,
  WorkoutCalendarRequest,
} from "@/types/api/requests";

export const workoutRecordApi = {
  async getList(memberId: string): Promise<WorkoutRecordListResponse> {
    const response = await apiClient.get<ApiResponse<WorkoutRecordListResponse>>(
      `/api/members/${memberId}/workout-records`
    );
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to fetch workout records");
  },

  async get(
    memberId: string,
    recordId: string
  ): Promise<WorkoutRecordResponse> {
    const response = await apiClient.get<ApiResponse<WorkoutRecordResponse>>(
      `/api/members/${memberId}/workout-records/${recordId}`
    );
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to fetch workout record");
  },

  async create(
    memberId: string,
    data: CreateWorkoutRecordRequest
  ): Promise<WorkoutRecordResponse> {
    const response = await apiClient.post<ApiResponse<WorkoutRecordResponse>>(
      `/api/members/${memberId}/workout-records`,
      data
    );
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to create workout record");
  },

  async update(
    memberId: string,
    recordId: string,
    data: UpdateWorkoutRecordRequest
  ): Promise<WorkoutRecordResponse> {
    const response = await apiClient.put<ApiResponse<WorkoutRecordResponse>>(
      `/api/members/${memberId}/workout-records/${recordId}`,
      data
    );
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to update workout record");
  },

  async delete(memberId: string, recordId: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/api/members/${memberId}/workout-records/${recordId}`
    );
    if ("error" in response) {
      throw new Error("Failed to delete workout record");
    }
  },

  async getVolumeAnalysis(
    memberId: string,
    params?: WorkoutVolumeAnalysisRequest
  ): Promise<WorkoutVolumeAnalysisResponse> {
    const queryParams = new URLSearchParams();
    if (params?.period) {
      queryParams.append("period", params.period);
    }
    if (params?.startDate) {
      queryParams.append("startDate", params.startDate);
    }
    if (params?.endDate) {
      queryParams.append("endDate", params.endDate);
    }
    const queryString = queryParams.toString();
    const endpoint = `/api/members/${memberId}/workout-records/volume-analysis${
      queryString ? `?${queryString}` : ""
    }`;
    const response = await apiClient.get<ApiResponse<WorkoutVolumeAnalysisResponse>>(
      endpoint
    );
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to fetch workout volume analysis");
  },

  async getCalendar(
    memberId: string,
    params: WorkoutCalendarRequest
  ): Promise<WorkoutCalendarResponse> {
    const queryParams = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
    });
    const response = await apiClient.get<ApiResponse<WorkoutCalendarResponse>>(
      `/api/members/${memberId}/workout-records/calendar?${queryParams.toString()}`
    );
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to fetch workout calendar");
  },
};

