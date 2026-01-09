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
  birthDate?: string; // 생년월일 (YYYY-MM-DD 형식)
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  height?: number; // 키 (cm)
  weight?: number; // 몸무게 (kg)
  gender?: "MALE" | "FEMALE"; // 성별
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
  strengthScore: number; // 하체 근력
  cardioScore: number; // 심폐 지구력
  enduranceScore: number; // 근지구력
  flexibilityScore: number; // 유연성
  bodyScore: number; // 체성분 밸런스
  stabilityScore: number; // 부상 안정성
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
    flexibilityScore: number;
    bodyScore: number;
    stabilityScore: number;
  };
  percentageChange: {
    totalScore: number;
    strengthScore: number;
    cardioScore: number;
    enduranceScore: number;
    flexibilityScore: number;
    bodyScore: number;
    stabilityScore: number;
  };
}

// 레이더 차트 지표 데이터 (헥사곤)
export interface AbilityIndicator {
  name: string;
  score: number;
}

// 헥사곤 단일 데이터셋 (백엔드 HexagonData와 동일)
export interface AbilityHexagonDataset {
  indicators: AbilityIndicator[];
  assessedAt: string;
  version: string;
}

// 헥사곤 응답의 data 필드 (현재 + 선택적 초기 평가)
// 백엔드 HexagonData | HexagonDataWithComparison 와 대응
export interface AbilityHexagonResponse extends AbilityHexagonDataset {
  /**
   * 초기 평가 데이터
   * - 초기 평가가 없으면 null 또는 undefined
   */
  initial?: AbilityHexagonDataset | null;
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
  restrictedCategory:
    | "STRENGTH"
    | "CARDIO"
    | "ENDURANCE"
    | "FLEXIBILITY"
    | "BODY"
    | "STABILITY";
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
    flexibilityScore: number;
    bodyScore: number;
    stabilityScore: number;
    totalScore: number;
  };
}

export interface AverageAnalyticsResponse {
  strengthScore: number;
  cardioScore: number;
  enduranceScore: number;
  flexibilityScore: number;
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
    flexibilityScore: number;
    bodyScore: number;
    stabilityScore: number;
    totalScore: number;
  };
  percentile: {
    strengthScore: number;
    cardioScore: number;
    enduranceScore: number;
    flexibilityScore: number;
    bodyScore: number;
    stabilityScore: number;
    totalScore: number;
  };
}

// 평가 관련 응답
export interface AssessmentItem {
  id: string;
  assessmentId: string;
  category:
    | "STRENGTH"
    | "CARDIO"
    | "ENDURANCE"
    | "FLEXIBILITY"
    | "BODY"
    | "STABILITY";
  name: string;
  value: number;
  unit: string;
  score: number;
  createdAt: string;
}

export interface Assessment {
  id: string;
  memberId: string;
  assessmentType: "INITIAL" | "PERIODIC" | "FLEXIBILITY";
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

// 목표 관리 관련 응답
export interface MemberGoal {
  id: string;
  memberId: string;
  goal: string; // 목표 한줄 요약
  goalProgress: number; // 달성률/진행률 (0-100)
  goalTrainerComment?: string; // 트레이너 코멘트
  totalSessions?: number; // 총 세션 수
  completedSessions?: number; // 완료된 세션 수
  createdAt: string;
  updatedAt: string;
}

export interface MemberGoalResponse extends MemberGoal {}

// PT 세션 관련 응답
export interface PTSession {
  id: string;
  memberId: string;
  sessionDate: string;
  sessionNumber: number; // 회차 번호
  mainContent?: string; // 주요 수업 내용
  trainerComment?: string; // 트레이너 코멘트
  createdAt: string;
  updatedAt: string;
}

export interface PTSessionListResponse {
  sessions: PTSession[];
  total: number;
  totalSessions: number; // 총 세션 수
  completedSessions: number; // 완료된 세션 수
}

export interface PTSessionResponse extends PTSession {}

// 운동 기록 관련 응답
export interface WorkoutRecord {
  id: string;
  memberId: string;
  workoutDate: string;
  exerciseName: string; // 운동명
  bodyPart: string; // 부위 (상체, 하체, 전신 등)
  weight?: number; // 무게 (kg)
  reps?: number; // 횟수
  sets?: number; // 세트 수
  volume?: number; // 볼륨 (weight * reps * sets)
  duration?: number; // 운동 시간 (분)
  workoutType: "PT" | "PERSONAL"; // PT 세션 또는 개인 운동
  ptSessionId?: string; // PT 세션 ID (PT인 경우)
  trainerComment?: string; // 트레이너 코멘트
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutRecordListResponse {
  records: WorkoutRecord[];
  total: number;
  page?: number;
  pageSize?: number;
}

export interface WorkoutRecordResponse extends WorkoutRecord {}

// 운동 기록 분석 관련 응답
export interface WorkoutVolumeAnalysis {
  period: "WEEKLY" | "MONTHLY";
  startDate: string;
  endDate: string;
  bodyPartVolumes: Array<{
    bodyPart: string;
    totalVolume: number;
    totalSets: number;
    totalReps: number;
    recordCount: number;
  }>;
}

export interface WorkoutVolumeAnalysisResponse {
  weekly?: WorkoutVolumeAnalysis;
  monthly?: WorkoutVolumeAnalysis;
}

// 운동 캘린더 관련 응답
export interface WorkoutCalendarEvent {
  date: string;
  ptSessions: number; // PT 세션 수
  selfWorkouts: number; // 개인 운동 수
}

export interface WorkoutCalendarResponse {
  events: WorkoutCalendarEvent[];
  startDate: string;
  endDate: string;
}

// 추천 운동 루틴 관련 응답
export interface WorkoutRoutine {
  id: string;
  memberId?: string; // null이면 전체 공통 루틴
  routineName: string; // 루틴명
  exercises: Array<{
    exerciseName: string;
    bodyPart: string;
    sets?: number;
    reps?: number;
    weight?: number;
    duration?: number;
    restTime?: number; // 휴식 시간 (초)
    notes?: string;
  }>;
  estimatedDuration: number; // 예상 소요 시간 (분)
  difficulty: "EASY" | "MEDIUM" | "HARD";
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutRoutineResponse extends WorkoutRoutine {}

export interface WorkoutRoutineListResponse {
  routines: WorkoutRoutine[];
  total: number;
}
