"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import MemberForm from "@/components/members/MemberForm";
import type { CreateMemberRequest } from "@/types/api/requests";

export default function NewMemberPage() {
  const router = useRouter();

  const handleSubmit = async (data: CreateMemberRequest) => {
    try {
      // TODO: 실제 API 호출
      console.log("회원 등록:", data);
      // 성공 시 회원 목록으로 이동
      router.push("/dashboard/members");
    } catch (error) {
      console.error("회원 등록 실패:", error);
      alert("회원 등록에 실패했습니다.");
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
          className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block"
        >
          ← 목록으로 돌아가기
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">새 회원 등록</h1>
      </div>
      <div className="max-w-2xl">
        <MemberForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </div>
  );
}
