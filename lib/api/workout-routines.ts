import { apiClient } from "./client";
import type {
  ApiResponse,
  WorkoutRoutineResponse,
  WorkoutRoutineListResponse,
} from "@/types/api/responses";
import type {
  CreateWorkoutRoutineRequest,
  UpdateWorkoutRoutineRequest,
} from "@/types/api/requests";

export const workoutRoutineApi = {
  async getList(memberId?: string): Promise<WorkoutRoutineListResponse> {
    const endpoint = memberId
      ? `/api/members/${memberId}/workout-routines`
      : `/api/workout-routines`;
    const response = await apiClient.get<ApiResponse<WorkoutRoutineListResponse>>(
      endpoint
    );
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to fetch workout routines");
  },

  async get(routineId: string, memberId?: string): Promise<WorkoutRoutineResponse> {
    const endpoint = memberId
      ? `/api/members/${memberId}/workout-routines/${routineId}`
      : `/api/workout-routines/${routineId}`;
    const response = await apiClient.get<ApiResponse<WorkoutRoutineResponse>>(
      endpoint
    );
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to fetch workout routine");
  },

  async getToday(memberId?: string): Promise<WorkoutRoutineResponse | null> {
    const endpoint = memberId
      ? `/api/members/${memberId}/workout-routines/today`
      : `/api/workout-routines/today`;
    const response = await apiClient.get<ApiResponse<WorkoutRoutineResponse>>(
      endpoint
    );
    if ("data" in response) {
      return response.data;
    }
    if (response.error?.code === "ROUTINE_NOT_FOUND") {
      return null;
    }
    throw new Error("Failed to fetch today's workout routine");
  },

  async create(
    data: CreateWorkoutRoutineRequest,
    memberId?: string
  ): Promise<WorkoutRoutineResponse> {
    const endpoint = memberId
      ? `/api/members/${memberId}/workout-routines`
      : `/api/workout-routines`;
    const response = await apiClient.post<ApiResponse<WorkoutRoutineResponse>>(
      endpoint,
      data
    );
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to create workout routine");
  },

  async update(
    routineId: string,
    data: UpdateWorkoutRoutineRequest,
    memberId?: string
  ): Promise<WorkoutRoutineResponse> {
    const endpoint = memberId
      ? `/api/members/${memberId}/workout-routines/${routineId}`
      : `/api/workout-routines/${routineId}`;
    const response = await apiClient.put<ApiResponse<WorkoutRoutineResponse>>(
      endpoint,
      data
    );
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to update workout routine");
  },

  async delete(routineId: string, memberId?: string): Promise<void> {
    const endpoint = memberId
      ? `/api/members/${memberId}/workout-routines/${routineId}`
      : `/api/workout-routines/${routineId}`;
    const response = await apiClient.delete<ApiResponse<void>>(endpoint);
    if ("error" in response) {
      throw new Error("Failed to delete workout routine");
    }
  },

  async complete(
    routineId: string,
    memberId: string
  ): Promise<WorkoutRoutineResponse> {
    const response = await apiClient.put<ApiResponse<WorkoutRoutineResponse>>(
      `/api/members/${memberId}/workout-routines/${routineId}/complete`,
      {}
    );
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to complete workout routine");
  },
};

