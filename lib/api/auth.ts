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
      isApproved?: boolean; // 트레이너의 경우 승인 여부
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

      // 디버깅: 응답 구조 확인
      if (process.env.NODE_ENV === "development") {
        console.log("[Auth API] Login response:", response);
      }

      if ("data" in response) {
        // 토큰이 data 안에 있는지, 또는 최상위에 있는지 확인 (accessToken도 확인)
        const token =
          (response.data as any).token ||
          (response.data as any).accessToken ||
          (response as any).token ||
          (response as any).accessToken;

        if (process.env.NODE_ENV === "development") {
          console.log("[Auth API] Token found:", !!token);
        }

        return {
          success: true,
          data: {
            ...response.data,
            token: token || response.data.token,
          },
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
      // 백엔드 스펙에 맞게 필요한 필드만 전송
      const registerData = {
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
      };

      const response = await apiClient.post<
        ApiResponse<RegisterResponse["data"]>
      >("/api/auth/register", registerData);

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
        if (
          error.message.includes("400") ||
          error.message.includes("이미 등록")
        ) {
          throw new Error("이미 등록된 이메일입니다.");
        }
        // 500 에러 처리 (서버 오류)
        if (
          error.message.includes("500") ||
          error.message.includes("서버 오류")
        ) {
          throw new Error(
            "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
          );
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
      console.warn(
        "Logout API error (continuing with client-side logout):",
        error
      );
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

  async updateProfile(data: { name?: string; email?: string }) {
    try {
      // 일반적인 패턴: 현재 인증된 사용자의 프로필 업데이트
      // 엔드포인트가 다를 수 있으므로 여러 옵션 시도
      let response;
      try {
        // 옵션 1: /api/auth/profile
        response = await apiClient.put<ApiResponse<LoginResponse["data"]["user"]>>(
          "/api/auth/profile",
          data
        );
      } catch (error: any) {
        // 옵션 2: /api/auth/me
        if (error?.message?.includes("404") || error?.message?.includes("Cannot")) {
          try {
            response = await apiClient.put<ApiResponse<LoginResponse["data"]["user"]>>(
              "/api/auth/me",
              data
            );
          } catch (error2: any) {
            // 옵션 3: /api/users/me
            if (error2?.message?.includes("404") || error2?.message?.includes("Cannot")) {
              response = await apiClient.put<ApiResponse<LoginResponse["data"]["user"]>>(
                "/api/users/me",
                data
              );
            } else {
              throw error2;
            }
          }
        } else {
          throw error;
        }
      }

      if (response && "data" in response) {
        return response.data;
      }
      throw new Error("프로필 업데이트에 실패했습니다.");
    } catch (error) {
      if (error instanceof Error) {
        // 404 에러인 경우 백엔드에 해당 엔드포인트가 없다는 의미
        if (error.message.includes("404") || error.message.includes("Cannot")) {
          throw new Error("프로필 업데이트 기능이 아직 구현되지 않았습니다. 백엔드 개발자에게 문의하세요.");
        }
        throw error;
      }
      throw new Error("프로필 업데이트에 실패했습니다.");
    }
  },
};
