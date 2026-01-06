"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NewMemberForm from "@/components/members/NewMemberForm";
import { memberApi } from "@/lib/api/members";
import { assessmentApi } from "@/lib/api/assessments";
import { injuryApi } from "@/lib/api/injuries";
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
      category: "STRENGTH" | "CARDIO" | "ENDURANCE" | "BODY" | "STABILITY";
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

  const handleSubmit = async (data: NewMemberFormData) => {
    try {
      setIsSubmitting(true);

      // 1. 회원 등록
      setSubmitProgress("회원 정보 등록 중...");
      const { initialAssessment, injuries, ...memberData } = data;
      const memberResponse = await memberApi.createMember(memberData);
      const memberId = memberResponse.id;

      // 2. 초기 평가 생성 (있는 경우)
      if (
        initialAssessment &&
        initialAssessment.items &&
        initialAssessment.items.length > 0
      ) {
        setSubmitProgress("초기 평가 등록 중...");
        const assessmentData: CreateAssessmentRequest = {
          assessmentType: "INITIAL",
          assessedAt: initialAssessment.assessedAt,
          bodyWeight: initialAssessment.bodyWeight,
          condition: initialAssessment.condition,
          trainerComment: initialAssessment.trainerComment,
          items: initialAssessment.items,
        };
        await assessmentApi.createAssessment(memberId, assessmentData);
      }

      // 3. 부상 이력 생성 (있는 경우)
      if (injuries && injuries.length > 0) {
        setSubmitProgress("부상 이력 등록 중...");
        for (const injury of injuries) {
          await injuryApi.createInjury(memberId, injury);
        }
      }

      // 성공 시 회원 상세 페이지로 이동
      setSubmitProgress("완료!");
      router.push(`/dashboard/members/${memberId}`);
    } catch (error) {
      console.error("회원 등록 실패:", error);
      alert(
        error instanceof Error ? error.message : "회원 등록에 실패했습니다."
      );
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
