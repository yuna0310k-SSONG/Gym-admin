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
    | "BODY"
    | "STABILITY";
}

// 평가 관련 요청
export interface CreateAssessmentRequest {
  assessmentType: "INITIAL" | "PERIODIC";
  assessedAt: string;
  trainerComment?: string;
  bodyWeight?: number;
  condition?: "EXCELLENT" | "GOOD" | "NORMAL" | "POOR";
  items: CreateAssessmentItemRequest[];
}

export interface CreateAssessmentItemRequest {
  category: "STRENGTH" | "CARDIO" | "ENDURANCE" | "BODY" | "STABILITY";
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
