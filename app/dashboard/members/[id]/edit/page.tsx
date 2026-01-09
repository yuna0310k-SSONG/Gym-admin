"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import MemberForm from "@/components/members/MemberForm";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import AlertModal from "@/components/ui/AlertModal";
import Skeleton, { CardSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/providers/ToastProvider";
import { memberApi } from "@/lib/api/members";
import type { Member } from "@/types/api/responses";
import type { CreateMemberRequest } from "@/types/api/requests";

export default function EditMemberPage() {
  const params = useParams();
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const memberId = params.id as string;

  useEffect(() => {
    const fetchMember = async () => {
      try {
        setLoading(true);
        const data = await memberApi.getMember(memberId);
        setMember(data);
      } catch (err) {
        console.error("회원 정보 조회 실패:", err);
        setError(
          err instanceof Error
            ? err.message
            : "회원 정보를 불러오는 중 오류가 발생했습니다."
        );
      } finally {
        setLoading(false);
      }
    };

    if (memberId) {
      fetchMember();
    }
  }, [memberId]);

  const handleSubmit = async (data: CreateMemberRequest) => {
    try {
      setSaving(true);
      await memberApi.updateMember(memberId, {
        name: data.name,
        email: data.email,
        phone: data.phone,
        status: data.status,
        height: data.height,
        weight: data.weight,
        gender: data.gender,
      });
      showSuccess("회원 정보가 수정되었습니다.");
      router.push(`/dashboard/members/${memberId}`);
    } catch (err) {
      console.error("회원 수정 실패:", err);

      // 에러 메시지 추출
      const errorObj = err as any;
      const errorMessage =
        errorObj?.error?.message ||
        errorObj?.message ||
        (err instanceof Error ? err.message : "회원 정보 수정에 실패했습니다.");

      // 사용자 친화적인 에러 메시지로 변환
      let userMessage = errorMessage;

      if (
        errorMessage.includes("성별") ||
        errorMessage.includes("gender") ||
        errorMessage.includes("MALE 또는 FEMALE")
      ) {
        userMessage = "성별을 올바르게 선택해주세요. (남성 또는 여성)";
      } else if (
        errorMessage.includes("이미 등록된 이메일") ||
        errorMessage.includes("already registered") ||
        errorMessage.includes("duplicate")
      ) {
        userMessage = "이미 등록된 이메일입니다. 다른 이메일을 사용해주세요.";
      } else if (
        errorMessage.includes("이메일") ||
        errorMessage.includes("email")
      ) {
        userMessage = "이메일 관련 오류가 발생했습니다. 이메일을 확인해주세요.";
      } else if (
        errorMessage.includes("전화번호") ||
        errorMessage.includes("phone")
      ) {
        userMessage =
          "전화번호 관련 오류가 발생했습니다. 전화번호를 확인해주세요.";
      }

      showError(userMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/dashboard/members/${memberId}`);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="mb-4 sm:mb-6">
          <Skeleton height={24} width={200} className="mb-2" />
          <Skeleton height={36} width={400} />
        </div>
        <CardSkeleton />
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <Card className="bg-[#0f1115]">
          <p className="text-[#f87171] mb-4">
            {error || "회원을 찾을 수 없습니다."}
          </p>
          <Link href="/dashboard/members">
            <Button variant="outline">목록으로 돌아가기</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative px-4 sm:px-6 py-3 sm:py-4 min-h-screen overflow-hidden">
      {/* 애니메이션 배경 그라데이션 */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f1115] via-[#0a0d12] to-[#0f1115]"></div>
        <div className="absolute top-0 -left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 -right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="relative mb-4 sm:mb-6">
        <div className="relative group">
          {/* 애니메이션 그라데이션 바 */}
          <div className="absolute -left-3 top-0 w-1.5 h-full bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full animate-pulse shadow-lg shadow-blue-500/50"></div>
          <div className="absolute -left-3 top-0 w-1.5 h-full bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-50 blur-sm"></div>

          <Link
            href={`/dashboard/members/${member.id}`}
            className="text-blue-400 hover:text-blue-300 text-sm mb-2 inline-block pl-4 transition-colors"
          >
            ← 상세로 돌아가기
          </Link>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent pl-4 drop-shadow-lg">
            {member.name} 회원 정보 수정
          </h1>
        </div>
      </div>
      <div className="max-w-2xl">
        <MemberForm
          member={member}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
        {saving && (
          <div className="mt-4 text-center">
            <p className="text-[#9ca3af]">회원 정보를 저장 중...</p>
          </div>
        )}
      </div>
    </div>
  );
}
