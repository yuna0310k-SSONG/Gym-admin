"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NewMemberForm from "@/components/members/NewMemberForm";
import { memberApi } from "@/lib/api/members";
import { assessmentApi } from "@/lib/api/assessments";
import { injuryApi } from "@/lib/api/injuries";
import { onlyDigits } from "@/lib/utils/phone";
import type {
  CreateMemberRequest,
  CreateAssessmentRequest,
  CreateInjuryRequest,
} from "@/types/api/requests";

interface NewMemberFormData extends CreateMemberRequest {
  initialAssessment?: {
    assessedAt: string;
    bodyWeight?: number;
    condition?: "EXCELLENT" | "GOOD" | "NORMAL" | "POOR";
    trainerComment?: string;
    items: Array<{
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
    }>;
  };
  injuries?: CreateInjuryRequest[];
}

export default function NewMemberPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (data: NewMemberFormData) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null); // 에러 메시지 초기화

      // 1. 회원 등록
      setSubmitProgress("회원 정보 등록 중...");
      const { initialAssessment, injuries, ...memberData } = data;

      // 데이터 정리: 전화번호는 숫자만, 이메일은 소문자로 변환
      const cleanedMemberData: CreateMemberRequest = {
        ...memberData,
        phone: onlyDigits(String(memberData.phone ?? "")),
        email: String(memberData.email ?? "")
          .toLowerCase()
          .trim(),
        name: String(memberData.name ?? "").trim(),
      };

      // 전화번호 유효성 검사
      if (
        cleanedMemberData.phone.length < 10 ||
        cleanedMemberData.phone.length > 11
      ) {
        throw new Error("전화번호는 10~11자리 숫자여야 합니다.");
      }

      // 이메일 유효성 검사
      if (!cleanedMemberData.email || !cleanedMemberData.email.includes("@")) {
        throw new Error("올바른 이메일 주소를 입력해주세요.");
      }

      // 디버깅: 전송되는 데이터 확인
      if (process.env.NODE_ENV === "development") {
        console.log("[New Member] 전송할 회원 데이터:", {
          ...cleanedMemberData,
          phone: cleanedMemberData.phone,
          email: cleanedMemberData.email,
        });
      }

      const memberResponse = await memberApi.createMember(cleanedMemberData);
      const memberId = memberResponse.id;

      // 2. 초기 평가 및 유연성 평가 생성 (있는 경우)
      // POST /api/members/{memberId}/assessments
      if (
        initialAssessment &&
        initialAssessment.items &&
        initialAssessment.items.length > 0
      ) {
        setSubmitProgress("평가 항목 등록 중...");
        const flexibilityItems = initialAssessment.items.filter(
          (item) => item.category === "FLEXIBILITY"
        );
        const otherItems = initialAssessment.items.filter(
          (item) => item.category !== "FLEXIBILITY"
        );

        // 2-1. FLEXIBILITY 항목 외 평가 등록 (INITIAL 타입)
        if (otherItems.length > 0) {
          try {
            const assessmentData: CreateAssessmentRequest = {
              assessmentType: "INITIAL",
              assessedAt: initialAssessment.assessedAt,
              bodyWeight: initialAssessment.bodyWeight,
              // condition이 빈 문자열이거나 유효하지 않으면 undefined로 설정
              condition:
                initialAssessment.condition &&
                initialAssessment.condition.trim() !== ""
                  ? (initialAssessment.condition as
                      | "EXCELLENT"
                      | "GOOD"
                      | "NORMAL"
                      | "POOR")
                  : undefined,
              trainerComment: initialAssessment.trainerComment,
              items: otherItems,
            };
            await assessmentApi.createAssessment(memberId, assessmentData);
            setSubmitProgress(
              `평가 항목 등록 완료 (${otherItems.length}개 항목)`
            );
          } catch (error) {
            console.error("평가 항목 등록 실패:", error);
            throw new Error(
              `평가 항목 등록에 실패했습니다: ${
                error instanceof Error ? error.message : "알 수 없는 오류"
              }`
            );
          }
        }

        // 2-2. 유연성(FLEXIBILITY) 평가 별도 등록 (FLEXIBILITY 타입)
        if (flexibilityItems.length > 0) {
          try {
            const flexibilityAssessmentData: CreateAssessmentRequest = {
              assessmentType: "FLEXIBILITY",
              assessedAt: initialAssessment.assessedAt,
              bodyWeight: initialAssessment.bodyWeight,
              // condition이 빈 문자열이거나 유효하지 않으면 undefined로 설정
              condition:
                initialAssessment.condition &&
                initialAssessment.condition.trim() !== ""
                  ? (initialAssessment.condition as
                      | "EXCELLENT"
                      | "GOOD"
                      | "NORMAL"
                      | "POOR")
                  : undefined,
              trainerComment: initialAssessment.trainerComment,
              items: flexibilityItems,
            };
            await assessmentApi.createAssessment(
              memberId,
              flexibilityAssessmentData
            );
            setSubmitProgress(
              `유연성 평가 등록 완료 (${flexibilityItems.length}개 항목)`
            );
          } catch (error) {
            console.error("유연성 평가 등록 실패:", error);
            throw new Error(
              `유연성 평가 등록에 실패했습니다: ${
                error instanceof Error ? error.message : "알 수 없는 오류"
              }`
            );
          }
        }
      }

      // 3. 부상 이력 생성 (있는 경우)
      // POST /api/members/{memberId}/injuries
      if (injuries && injuries.length > 0) {
        setSubmitProgress(`부상 이력 등록 중... (${injuries.length}개)`);
        try {
          for (let i = 0; i < injuries.length; i++) {
            const injury = injuries[i];
            setSubmitProgress(
              `부상 이력 등록 중... (${i + 1}/${injuries.length})`
            );
            await injuryApi.createInjury(memberId, injury);
          }
          setSubmitProgress(`부상 이력 등록 완료 (${injuries.length}개)`);
        } catch (error) {
          console.error("부상 이력 등록 실패:", error);
          throw new Error(
            `부상 이력 등록에 실패했습니다: ${
              error instanceof Error ? error.message : "알 수 없는 오류"
            }`
          );
        }
      }

      // 성공 시 회원 상세 페이지로 이동
      setSubmitProgress("완료!");
      router.push(`/dashboard/members/${memberId}`);
    } catch (error) {
      console.error("회원 등록 실패:", error);
      const errorMsg =
        error instanceof Error ? error.message : "회원 등록에 실패했습니다.";

      // 사용자 친화적인 에러 메시지
      let userMessage = errorMsg;

      // 에러 메시지나 에러 객체에서 메시지 추출
      const errorObj = error as any;
      const extractedMessage =
        errorObj?.error?.message || errorObj?.message || errorMsg;

      // 에러 코드 확인
      const errorCode = errorObj?.error?.code || errorObj?.errorCode;

      // 디버깅: 에러 상세 정보
      if (process.env.NODE_ENV === "development") {
        console.error("[New Member] 에러 상세:", {
          errorMessage: extractedMessage,
          errorCode,
          errorObj,
          errorData: errorObj?.errorData,
        });
      }

      if (
        extractedMessage.includes("이미 등록된 이메일") ||
        extractedMessage.includes("already registered") ||
        extractedMessage.includes("duplicate") ||
        extractedMessage.includes("MEMBER_ALREADY_EXISTS") ||
        errorCode === "MEMBER_ALREADY_EXISTS"
      ) {
        // 이메일 중복 에러인 경우, 전송된 데이터 확인 안내
        userMessage = "이미 등록된 이메일입니다. 다른 이메일을 사용해주세요.";

        // 개발 환경에서 전송된 데이터 확인 가능하도록 로그
        if (process.env.NODE_ENV === "development") {
          console.warn("[New Member] 이메일 중복 에러 - 전송된 데이터:", {
            email: data.email,
            phone: data.phone,
          });
        }
      } else if (
        extractedMessage.includes("이메일") ||
        extractedMessage.includes("email")
      ) {
        userMessage = "이메일 관련 오류가 발생했습니다. 이메일을 확인해주세요.";
      } else if (
        extractedMessage.includes("전화번호") ||
        extractedMessage.includes("phone")
      ) {
        userMessage =
          "전화번호 관련 오류가 발생했습니다. 전화번호를 확인해주세요.";
      } else if (
        extractedMessage.includes("400") ||
        extractedMessage.includes("Bad Request")
      ) {
        userMessage = extractedMessage || "입력한 정보를 확인해주세요.";
      } else {
        userMessage = extractedMessage || "회원 등록에 실패했습니다.";
      }

      setErrorMessage(userMessage);
    } finally {
      setIsSubmitting(false);
      setSubmitProgress("");
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/members");
  };

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/members"
          className="text-blue-400 hover:text-blue-300 text-sm mb-2 inline-block"
        >
          ← 목록으로 돌아가기
        </Link>
        <h1 className="text-3xl font-bold text-white">새 회원 등록</h1>
        <p className="text-[#c9c7c7] mt-2">
          회원 기본 정보와 함께 초기 평가(능력치) 및 부상 이력을 등록할 수
          있습니다.
        </p>
      </div>
      <div className="max-w-4xl">
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <p className="text-red-400 font-medium">등록 실패</p>
                <p className="text-red-300 text-sm mt-1">{errorMessage}</p>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-red-400 hover:text-red-300 ml-2"
                aria-label="에러 메시지 닫기"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
        <NewMemberForm onSubmit={handleSubmit} onCancel={handleCancel} />
        {isSubmitting && (
          <div className="mt-4 text-center">
            <p className="text-[#c9c7c7]">{submitProgress}</p>
          </div>
        )}
      </div>
    </div>
  );
}
