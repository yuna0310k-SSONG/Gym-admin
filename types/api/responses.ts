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

// 능력치 관련 응답
export interface AbilitySnapshot {
  id: string;
  assessmentId: string;
  memberId: string;
  assessedAt: string;
  strengthScore: number;
  cardioScore: number;
  enduranceScore: number;
  bodyScore: number;
  stabilityScore: number;
  totalScore: number;
  createdAt: string;
}

export interface LatestAbilitySnapshotResponse extends AbilitySnapshot {}

export interface AbilitySnapshotListResponse {
  snapshots: AbilitySnapshot[];
  total: number;
}

export interface AbilityComparisonResponse {
  current: AbilitySnapshot;
  previous: AbilitySnapshot;
  delta: {
    totalScore: number;
    strengthScore: number;
    cardioScore: number;
    enduranceScore: number;
    bodyScore: number;
    stabilityScore: number;
  };
  percentageChange: {
    totalScore: number;
    strengthScore: number;
    cardioScore: number;
    enduranceScore: number;
    bodyScore: number;
    stabilityScore: number;
  };
}

export interface AbilityHexagonResponse {
  indicators: Array<{
    name: string;
    score: number;
  }>;
  assessedAt: string;
  version: string;
}

export interface AbilityHistoryResponse {
  history: Array<{
    assessedAt: string;
    indicators: Array<{ name: string; score: number }>;
    version: string;
  }>;
}

// 부상 관련 응답
export interface Injury {
  id: string;
  memberId: string;
  injuryType: string;
  bodyPart: string;
  date: string;
  severity: "MILD" | "MODERATE" | "SEVERE";
  description?: string;
  recoveryStatus: "RECOVERED" | "RECOVERING" | "CHRONIC";
  createdAt: string;
  updatedAt: string;
}

export interface InjuryListResponse {
  injuries: Injury[];
  total: number;
}

export interface InjuryResponse extends Injury {}

export interface InjuryRestriction {
  id: string;
  injuryId: string;
  restrictedCategory: "STRENGTH" | "CARDIO" | "ENDURANCE" | "BODY" | "STABILITY";
  createdAt: string;
}

// 분석 관련 응답
export interface MemberAnalyticsResponse {
  memberId: string;
  latestSnapshot: AbilitySnapshot;
  averageSnapshot: AbilitySnapshot;
  percentile: {
    strengthScore: number;
    cardioScore: number;
    enduranceScore: number;
    bodyScore: number;
    stabilityScore: number;
    totalScore: number;
  };
}

export interface AverageAnalyticsResponse {
  strengthScore: number;
  cardioScore: number;
  enduranceScore: number;
  bodyScore: number;
  stabilityScore: number;
  totalScore: number;
  totalMembers: number;
}

export interface MemberComparisonResponse {
  member: AbilitySnapshot;
  average: {
    strengthScore: number;
    cardioScore: number;
    enduranceScore: number;
    bodyScore: number;
    stabilityScore: number;
    totalScore: number;
  };
  percentile: {
    strengthScore: number;
    cardioScore: number;
    enduranceScore: number;
    bodyScore: number;
    stabilityScore: number;
    totalScore: number;
  };
}

// 평가 관련 응답
export interface AssessmentItem {
  id: string;
  assessmentId: string;
  category: "STRENGTH" | "CARDIO" | "ENDURANCE" | "BODY" | "STABILITY";
  name: string;
  value: number;
  unit: string;
  score: number;
  createdAt: string;
}

export interface Assessment {
  id: string;
  memberId: string;
  assessmentType: "INITIAL" | "PERIODIC";
  isInitial: boolean;
  assessedAt: string;
  trainerComment?: string;
  bodyWeight?: number;
  condition?: "EXCELLENT" | "GOOD" | "NORMAL" | "POOR";
  items: AssessmentItem[];
  snapshot?: AbilitySnapshot;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentListResponse {
  assessments: Assessment[];
  total: number;
}

export interface AssessmentResponse extends Assessment {}

