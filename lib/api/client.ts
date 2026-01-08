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
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch (e) {
        // JSON 파싱 실패 시 빈 객체 사용
        errorData = {};
      }

      // 401 에러 처리
      if (response.status === 401) {
        throw new Error("인증이 필요합니다.");
      }

      // 500 에러 처리
      if (response.status === 500) {
        console.error("[API Client] 500 Internal Server Error:", {
          endpoint,
          errorData,
        });
        throw new Error(
          errorData?.error?.message ||
            "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
        );
      }

      // 404 에러 처리
      if (response.status === 404) {
        const errorMessage =
          errorData?.error?.message ||
          errorData?.message ||
          "요청한 API 엔드포인트를 찾을 수 없습니다. 백엔드 API가 아직 구현되지 않았을 수 있습니다.";
        
        // 일부 엔드포인트는 404가 정상적인 경우임 (예: hexagon, compare, goals)
        // 이런 경우는 조용히 처리하고 null 반환 (에러 throw 하지 않음)
        const isOptionalEndpoint =
          endpoint.includes("/abilities/hexagon") ||
          endpoint.includes("/abilities/compare") ||
          endpoint.includes("/goals");
        
        if (isOptionalEndpoint) {
          // 개발 환경에서만 경고 표시
          if (process.env.NODE_ENV === "development") {
            console.warn(
              `[API Client] Optional endpoint not found (404): ${endpoint} - returning null`
            );
          }
          // 선택적 엔드포인트의 경우 에러를 throw하지 않고 null 반환
          return null as T;
        } else {
          // 필수 엔드포인트의 경우만 에러 로그 및 throw
          console.error("404 Not Found Error:", {
            endpoint,
            status: response.status,
            errorData,
          });
          throw new Error(errorMessage);
        }
      }

      throw new Error(
        errorData?.error?.message ||
          errorData?.message ||
          `API Error: ${response.statusText} (${response.status})`
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

    // 디버깅: 전송되는 body 확인
    if (process.env.NODE_ENV === "development" && endpoint.includes("/members")) {
      console.log(`[API Client] POST ${endpoint} body:`, body);
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
        
        // 에러 객체에 원본 에러 데이터 포함 (에러 코드 등)
        const error = new Error(errorMessage);
        (error as any).errorData = errorData;
        (error as any).error = errorData?.error;
        (error as any).errorCode = errorData?.error?.code;
        
        // 디버깅: 에러 상세 정보 로깅
        if (process.env.NODE_ENV === "development") {
          console.error("400 Bad Request Error:", {
            endpoint,
            errorMessage,
            errorCode: errorData?.error?.code,
            errorData,
            requestBody: endpoint.includes("/members") ? body : undefined,
          });
        }
        
        throw error;
      }

      // 404 에러 처리 (엔드포인트를 찾을 수 없음)
      if (response.status === 404) {
        const errorMessage =
          errorData?.error?.message ||
          errorData?.message ||
          "요청한 API 엔드포인트를 찾을 수 없습니다. 백엔드 API가 아직 구현되지 않았을 수 있습니다.";
        console.error("404 Not Found Error:", {
          endpoint,
          status: response.status,
          errorData,
        });
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
      
      // 404 에러 처리
      if (response.status === 404) {
        const errorMessage =
          errorData?.error?.message ||
          errorData?.message ||
          "요청한 API 엔드포인트를 찾을 수 없습니다. 백엔드 API가 아직 구현되지 않았을 수 있습니다.";
        console.error("404 Not Found Error:", {
          endpoint,
          status: response.status,
          errorData,
        });
        throw new Error(errorMessage);
      }
      
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
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch (e) {
        // JSON 파싱 실패 시 빈 객체 사용
        errorData = {};
      }

      // 401 에러 처리
      if (response.status === 401) {
        throw new Error("인증이 필요합니다.");
      }

      // 400 에러 처리
      if (response.status === 400) {
        const errorMessage =
          errorData?.error?.message ||
          errorData?.message ||
          "요청 데이터가 올바르지 않습니다.";
        const error = new Error(errorMessage);
        (error as any).errorData = errorData;
        (error as any).error = errorData?.error;
        throw error;
      }

      // 404 에러 처리
      if (response.status === 404) {
        const errorMessage =
          errorData?.error?.message ||
          errorData?.message ||
          "요청한 리소스를 찾을 수 없습니다.";
        console.error("404 Not Found Error:", {
          endpoint,
          status: response.status,
          errorData,
        });
        throw new Error(errorMessage);
      }

      // 500 에러 처리
      if (response.status === 500) {
        console.error("[API Client] 500 Internal Server Error:", {
          endpoint,
          errorData,
        });
        throw new Error(
          errorData?.error?.message ||
            "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
        );
      }

      throw new Error(
        errorData?.error?.message ||
          errorData?.message ||
          `API Error: ${response.statusText} (${response.status})`
      );
    }

    // DELETE 요청은 응답 본문이 없을 수 있음
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      try {
        const data = await response.json();
        return data;
      } catch (e) {
        // JSON 파싱 실패 시 빈 객체 반환 (void 타입의 경우)
        return {} as T;
      }
    }

    // 응답 본문이 없거나 JSON이 아닌 경우 빈 객체 반환
    return {} as T;
  },
};
