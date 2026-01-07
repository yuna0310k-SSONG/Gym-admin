// 회원 관련 요청
export interface CreateMemberRequest {
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
}

export interface UpdateMemberRequest {
  name?: string;
  email?: string;
  phone?: string;
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
}

// 로그인 요청
export interface LoginRequest {
  email: string;
  password: string;
}

// 회원가입 요청
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: "MEMBER" | "TRAINER" | "ADMIN";
  provider?: string; // OAuth 제공자 (기본값: "local")
}

// 부상 관련 요청
export interface CreateInjuryRequest {
  injuryType: string;
  bodyPart: string;
  date: string;
  severity: "MILD" | "MODERATE" | "SEVERE";
  description?: string;
  recoveryStatus: "RECOVERED" | "RECOVERING" | "CHRONIC";
}

export interface UpdateInjuryRequest {
  injuryType?: string;
  bodyPart?: string;
  date?: string;
  severity?: "MILD" | "MODERATE" | "SEVERE";
  description?: string;
  recoveryStatus?: "RECOVERED" | "RECOVERING" | "CHRONIC";
}

export interface CreateInjuryRestrictionRequest {
  restrictedCategory:
    | "STRENGTH"
    | "CARDIO"
    | "ENDURANCE"
    | "FLEXIBILITY"
    | "BODY"
    | "STABILITY";
}

// 평가 관련 요청
export interface CreateAssessmentRequest {
  assessmentType: "INITIAL" | "PERIODIC" | "FLEXIBILITY";
  assessedAt: string;
  trainerComment?: string;
  bodyWeight?: number;
  condition?: "EXCELLENT" | "GOOD" | "NORMAL" | "POOR";
  items: CreateAssessmentItemRequest[];
}

export interface CreateAssessmentItemRequest {
  category: "STRENGTH" | "CARDIO" | "ENDURANCE" | "FLEXIBILITY" | "BODY" | "STABILITY";
  name: string;
  value: number;
  unit: string;
}

export interface UpdateAssessmentRequest {
  assessedAt?: string;
  trainerComment?: string;
  bodyWeight?: number;
  condition?: "EXCELLENT" | "GOOD" | "NORMAL" | "POOR";
  items?: CreateAssessmentItemRequest[];
}

// 목표 관리 관련 요청
export interface CreateMemberGoalRequest {
  goal: string;
  goalProgress?: number; // 0-100, 기본값 0
  goalTrainerComment?: string;
}

export interface UpdateMemberGoalRequest {
  goal?: string;
  goalProgress?: number; // 0-100
  goalTrainerComment?: string;
  totalSessions?: number; // 총 세션 수
  completedSessions?: number; // 완료된 세션 수
}

// PT 세션 관련 요청
export interface CreatePTSessionRequest {
  sessionDate: string;
  mainContent?: string;
  trainerComment?: string;
}

export interface UpdatePTSessionRequest {
  sessionDate?: string;
  mainContent?: string;
  trainerComment?: string;
}

// 운동 기록 관련 요청
export interface CreateWorkoutRecordRequest {
  workoutDate: string;
  exerciseName: string;
  bodyPart: string;
  weight?: number;
  reps?: number;
  sets?: number;
  duration?: number;
  workoutType: "PT" | "PERSONAL";
  ptSessionId?: string;
  trainerComment?: string;
}

export interface UpdateWorkoutRecordRequest {
  workoutDate?: string;
  exerciseName?: string;
  bodyPart?: string;
  weight?: number;
  reps?: number;
  sets?: number;
  duration?: number;
  workoutType?: "PT" | "PERSONAL";
  ptSessionId?: string;
  trainerComment?: string;
}

// 운동 기록 분석 요청
export interface WorkoutVolumeAnalysisRequest {
  period?: "WEEKLY" | "MONTHLY"; // 둘 다 조회 시 생략
  startDate?: string; // 기본값: 현재 주/월 시작
  endDate?: string; // 기본값: 현재 주/월 끝
}

// 운동 캘린더 요청
export interface WorkoutCalendarRequest {
  startDate: string;
  endDate: string;
}

// 추천 운동 루틴 관련 요청
export interface CreateWorkoutRoutineRequest {
  routineName: string;
  exercises: Array<{
    exerciseName: string;
    bodyPart: string;
    sets?: number;
    reps?: number;
    weight?: number;
    duration?: number;
    restTime?: number;
    notes?: string;
  }>;
  estimatedDuration: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
}

export interface UpdateWorkoutRoutineRequest {
  routineName?: string;
  exercises?: Array<{
    exerciseName: string;
    bodyPart: string;
    sets?: number;
    reps?: number;
    weight?: number;
    duration?: number;
    restTime?: number;
    notes?: string;
  }>;
  estimatedDuration?: number;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
}
