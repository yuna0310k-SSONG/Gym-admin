// 회원 관련 요청
export interface CreateMemberRequest {
  name: string;
  email: string;
  phone: string;
  joinDate: string;
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
