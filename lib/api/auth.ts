import { apiClient } from "./client";
import type { ApiResponse } from "@/types/api/responses";
import type { LoginRequest, RegisterRequest } from "@/types/api/requests";

export interface LoginResponse {
  success: true;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
    token?: string;
  };
  message?: string;
}

export interface RegisterResponse {
  success: true;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  };
  message?: string;
}

export const authApi = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<ApiResponse<LoginResponse["data"]>>(
        "/api/auth/login",
        data
      );
      
      if ("data" in response) {
        return {
          success: true,
          data: response.data,
        };
      }
      throw new Error("로그인에 실패했습니다.");
    } catch (error) {
      // 401 에러 처리
      if (error instanceof Error) {
        if (error.message.includes("401") || error.message.includes("인증")) {
          throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
        }
        throw error;
      }
      throw new Error("로그인에 실패했습니다.");
    }
  },

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    try {
      // provider 필드가 없으면 기본값 "local" 설정
      const registerData = {
        ...data,
        provider: data.provider || "local",
      };
      
      const response = await apiClient.post<ApiResponse<RegisterResponse["data"]>>(
        "/api/auth/register",
        registerData
      );
      
      if ("data" in response) {
        return {
          success: true,
          data: response.data,
        };
      }
      throw new Error("회원가입에 실패했습니다.");
    } catch (error) {
      // 에러 처리
      if (error instanceof Error) {
        // 400 에러 처리 (이미 등록된 이메일)
        if (error.message.includes("400") || error.message.includes("이미 등록")) {
          throw new Error("이미 등록된 이메일입니다.");
        }
        // 500 에러 처리 (서버 오류)
        if (error.message.includes("500") || error.message.includes("서버 오류")) {
          throw new Error("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        }
        throw error;
      }
      throw new Error("회원가입에 실패했습니다.");
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post("/api/auth/logout", {});
    } catch (error) {
      // CORS 에러나 기타 에러가 발생해도 로그아웃은 진행
      // 클라이언트 측 토큰 삭제는 항상 수행
      console.warn("Logout API error (continuing with client-side logout):", error);
    }
  },

  async getSession() {
    try {
      const response = await apiClient.get<ApiResponse<LoginResponse["data"]>>(
        "/api/auth/session"
      );
      if ("data" in response) {
        return response.data;
      }
      throw new Error("세션 조회에 실패했습니다.");
    } catch (error) {
      // 401 에러 처리
      if (error instanceof Error) {
        if (error.message.includes("401") || error.message.includes("인증")) {
          throw new Error("인증이 필요합니다.");
        }
        throw error;
      }
      throw new Error("세션 조회에 실패했습니다.");
    }
  },
};

