const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://gym-membership-backend-5zjj.onrender.com";

// localStorage에서 토큰 가져오기
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    // accessToken을 먼저 확인하고, 없으면 token 확인
    return localStorage.getItem("accessToken") || localStorage.getItem("token");
  }
  return null;
};

// 공통 헤더 생성
const getHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    // 디버깅용 로그 (개발 환경에서만)
    if (process.env.NODE_ENV === "development") {
      console.log("[API Client] Token found, adding Authorization header");
    }
  } else {
    // 디버깅용 로그
    if (process.env.NODE_ENV === "development") {
      console.warn("[API Client] No token found in localStorage");
    }
  }

  return headers;
};

export const apiClient = {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers: getHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // 401 에러 처리
      if (response.status === 401) {
        throw new Error("인증이 필요합니다.");
      }

      throw new Error(
        errorData?.error?.message || `API Error: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  },

  async post<T>(endpoint: string, body: unknown): Promise<T> {
    const headers = getHeaders();

    // 디버깅용 로그
    if (process.env.NODE_ENV === "development") {
      console.log(`[API Client] POST ${endpoint}`, {
        hasToken: !!getAuthToken(),
        headers: Object.keys(headers),
      });
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch (e) {
        // JSON 파싱 실패 시 빈 객체 사용
        errorData = {};
      }

      // 디버깅용 로그
      if (process.env.NODE_ENV === "development") {
        console.error(`[API Client] POST ${endpoint} failed:`, {
          status: response.status,
          statusText: response.statusText,
          errorData,
        });
      }

      // 401 에러 처리
      if (response.status === 401) {
        // 로그인 API인 경우에만 특별한 메시지 사용
        if (endpoint === "/api/auth/login") {
          throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
        }
        // 그 외의 경우 일반적인 인증 오류 메시지
        const errorMessage =
          errorData?.error?.message ||
          errorData?.message ||
          "인증이 필요합니다. 다시 로그인해주세요.";
        throw new Error(errorMessage);
      }

      // 400 에러 처리 (회원가입 시 이미 등록된 이메일 또는 유효성 검증 실패)
      if (response.status === 400) {
        const errorMessage =
          errorData?.error?.message ||
          errorData?.message ||
          "요청 데이터가 올바르지 않습니다.";
        console.error("400 Bad Request Error:", errorData);
        throw new Error(errorMessage);
      }

      // 500 에러 처리 (서버 내부 오류)
      if (response.status === 500) {
        const errorMessage =
          errorData?.error?.message ||
          "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
        console.error("Server Error:", errorData);
        throw new Error(errorMessage);
      }

      throw new Error(
        errorData?.error?.message ||
          errorData?.message ||
          `API Error: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  },

  async put<T>(endpoint: string, body: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData?.error?.message || `API Error: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  },

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: getHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData?.error?.message || `API Error: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  },
};
