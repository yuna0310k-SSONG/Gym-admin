import { apiClient } from "./client";
import type { ApiResponse } from "@/types/api/responses";

// 대시보드 통합 데이터 타입 정의
export interface DashboardGoal {
  goal: string;
  goalProgress: number;
  goalTrainerComment?: string;
}

export interface DashboardSessionProgress {
  totalSessions: number;
  completedSessions: number;
  remainingSessions: number;
  progressPercent: number;
}

export interface DashboardPTSessionCalendarItem {
  date: string;
  sessionNumber: number;
  mainContent?: string;
}

export interface DashboardPersonalWorkoutCalendarItem {
  date: string;
  exerciseName: string;
  bodyPart: string;
}

export interface DashboardWorkoutCalendarItem {
  date: string;
  ptSessions: DashboardPTSessionCalendarItem[];
  personalWorkouts: DashboardPersonalWorkoutCalendarItem[];
}

export interface DashboardBodyPartVolume {
  bodyPart: string;
  totalVolume: number;
  totalSets: number;
  totalReps: number;
  recordCount: number;
}

export interface DashboardWorkoutAnalysis {
  period: "WEEKLY" | "MONTHLY";
  startDate: string;
  endDate: string;
  bodyPartVolumes: DashboardBodyPartVolume[];
}

export interface DashboardResponse {
  goal?: DashboardGoal;
  sessionProgress: DashboardSessionProgress;
  workoutCalendar: DashboardWorkoutCalendarItem[];
  workoutAnalysis: {
    weekly: DashboardWorkoutAnalysis;
    monthly: DashboardWorkoutAnalysis;
  };
}

export const dashboardApi = {
  async get(memberId: string): Promise<DashboardResponse | null> {
    try {
      const response = await apiClient.get<ApiResponse<DashboardResponse>>(
        `/api/members/${memberId}/dashboard`
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
};


