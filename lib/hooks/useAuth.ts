"use client";

import { useState, useEffect } from "react";
import { authApi } from "@/lib/api/auth";
import type { LoginResponse } from "@/lib/api/auth";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isApproved?: boolean; // 트레이너의 경우 승인 여부
}

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      // localStorage에서 사용자 정보 확인
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          loading: false,
          isAuthenticated: true,
        });
      } else {
        // localStorage에 없으면 서버에서 세션 확인
        const sessionData = await authApi.getSession();
        if (sessionData?.user) {
          localStorage.setItem("user", JSON.stringify(sessionData.user));
          setAuthState({
            user: sessionData.user,
            loading: false,
            isAuthenticated: true,
          });
        } else {
          setAuthState({
            user: null,
            loading: false,
            isAuthenticated: false,
          });
        }
      }
    } catch (error) {
      // 401 에러 또는 세션 없음
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("token");
      setAuthState({
        user: null,
        loading: false,
        isAuthenticated: false,
      });
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    if (response.data.token) {
      // accessToken과 token 둘 다 저장 (호환성을 위해)
      localStorage.setItem("accessToken", response.data.token);
      localStorage.setItem("token", response.data.token);
    }
    localStorage.setItem("user", JSON.stringify(response.data.user));
    setAuthState({
      user: response.data.user,
      loading: false,
      isAuthenticated: true,
    });
    return response;
  };

  const logout = async () => {
    // 서버에 로그아웃 요청 (실패해도 클라이언트 측 정리는 진행)
    await authApi.logout();

    // 클라이언트 측 토큰 및 사용자 정보 삭제 (항상 수행)
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("token");
    setAuthState({
      user: null,
      loading: false,
      isAuthenticated: false,
    });
  };

  const refreshUser = async () => {
    await checkSession();
  };

  return {
    ...authState,
    login,
    logout,
    checkSession,
    refreshUser,
  };
}
