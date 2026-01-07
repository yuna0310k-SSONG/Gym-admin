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
  async getList(
    memberId: string,
    page: number = 1,
    pageSize: number = 10,
    startDate?: string,
    endDate?: string
  ): Promise<WorkoutRecordListResponse> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    if (startDate) {
      queryParams.append("startDate", startDate);
    }
    if (endDate) {
      queryParams.append("endDate", endDate);
    }
    const queryString = queryParams.toString();
    const endpoint = `/api/members/${memberId}/workout-records${
      queryString ? `?${queryString}` : ""
    }`;
    const response = await apiClient.get<
      ApiResponse<WorkoutRecordListResponse>
    >(endpoint);
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
    const response = await apiClient.get<
      ApiResponse<WorkoutVolumeAnalysisResponse>
    >(endpoint);
    if ("data" in response) {
      return response.data;
    }
    throw new Error("Failed to fetch workout volume analysis");
  },

  async getCalendar(
    memberId: string,
    params: WorkoutCalendarRequest
  ): Promise<WorkoutCalendarResponse> {
    try {
      // 먼저 캘린더 전용 엔드포인트 시도
      const queryParams = new URLSearchParams({
        startDate: params.startDate,
        endDate: params.endDate,
      });
      const response = await apiClient.get<
        ApiResponse<WorkoutCalendarResponse>
      >(
        `/api/members/${memberId}/workout-records/calendar?${queryParams.toString()}`
      );
      if ("data" in response) {
        return response.data;
      }
      // 응답에 데이터가 없으면 빈 캘린더 반환
      return {
        events: [],
        startDate: params.startDate,
        endDate: params.endDate,
      };
    } catch (error: any) {
      // UUID 파싱 에러 또는 라우팅 문제 감지
      const errorMessage = error?.message || "";
      const errorData = error?.errorData || {};
      const statusCode = error?.status || errorData?.status;

      // 500 에러 또는 UUID 파싱 에러 감지
      const isRoutingError =
        statusCode === 500 ||
        errorMessage.includes("invalid input syntax for type uuid") ||
        errorMessage.includes("calendar") ||
        errorMessage.includes("500") ||
        errorMessage.includes("Internal Server Error") ||
        errorMessage.includes("404") ||
        errorMessage.includes("Cannot GET");

      if (isRoutingError) {
        // 개발 환경에서만 경고 표시
        if (process.env.NODE_ENV === "development") {
          console.warn(
            "[Workout Calendar API] Calendar endpoint error (500/routing). 운동 기록 목록 API로 대체합니다:",
            errorMessage
          );
        }

        // 백엔드 라우팅 문제가 있을 때 대체 방법: 운동 기록 목록에서 캘린더 데이터 생성
        try {
          const workoutRecords = await this.getList(
            memberId,
            1,
            1000, // 충분히 큰 페이지 사이즈
            params.startDate,
            params.endDate
          );

          // 날짜별로 그룹화하여 캘린더 이벤트 생성
          const eventsMap = new Map<
            string,
            { ptSessions: number; selfWorkouts: number }
          >();

          workoutRecords.records?.forEach((record) => {
            if (record.workoutDate) {
              const date = record.workoutDate.split("T")[0]; // YYYY-MM-DD 형식으로 변환
              if (!eventsMap.has(date)) {
                eventsMap.set(date, { ptSessions: 0, selfWorkouts: 0 });
              }
              const event = eventsMap.get(date)!;
              if (record.workoutType === "PT") {
                event.ptSessions += 1;
              } else if (record.workoutType === "PERSONAL") {
                event.selfWorkouts += 1;
              }
            }
          });

          // 이벤트 배열로 변환
          const events = Array.from(eventsMap.entries()).map(
            ([date, counts]) => ({
              date,
              ptSessions: counts.ptSessions,
              selfWorkouts: counts.selfWorkouts,
            })
          );

          return {
            events,
            startDate: params.startDate,
            endDate: params.endDate,
          };
        } catch (fallbackError: any) {
          console.error(
            "[Workout Calendar API] Fallback method also failed:",
            fallbackError
          );
          // 대체 방법도 실패하면 빈 캘린더 반환
          return {
            events: [],
            startDate: params.startDate,
            endDate: params.endDate,
          };
        }
      }
      throw error;
    }
  },
};
