const API_BASE_URL = 
  process.env.NEXT_PUBLIC_API_URL || 
  "https://gym-membership-backend-5zjj.onrender.com";

export const apiClient = {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
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
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
      
      // 401 에러 처리
      if (response.status === 401) {
        throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
      }
      
      // 400 에러 처리 (회원가입 시 이미 등록된 이메일)
      if (response.status === 400) {
        throw new Error(errorData?.error?.message || "이미 등록된 이메일입니다.");
      }
      
      // 500 에러 처리 (서버 내부 오류)
      if (response.status === 500) {
        const errorMessage = errorData?.error?.message || "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
        console.error("Server Error:", errorData);
        throw new Error(errorMessage);
      }
      
      throw new Error(
        errorData?.error?.message || `API Error: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  },

  async put<T>(endpoint: string, body: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
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
      headers: {
        "Content-Type": "application/json",
      },
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

