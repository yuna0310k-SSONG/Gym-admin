// API 공통 응답 타입
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// 회원 관련 응답
export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdAt: string;
  updatedAt: string;
}

export interface MemberListResponse {
  members: Member[];
  total: number;
  page: number;
  pageSize: number;
}

export interface MemberResponse extends Member {}

// 인사이트 관련 응답
export interface InsightHexagonResponse {
  strength: number;
  cardio: number;
  endurance: number;
  body: number;
  stability: number;
  flexibility: number;
}

export interface WeeklySummaryResponse {
  thisWeek: InsightHexagonResponse;
  lastWeek: InsightHexagonResponse;
  changes: {
    strength: number;
    cardio: number;
    endurance: number;
    body: number;
    stability: number;
    flexibility: number;
  };
}

export interface RiskMember {
  id: string;
  name: string;
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
  riskReason: string;
}

export interface RiskMembersResponse {
  members: RiskMember[];
  total: number;
}

