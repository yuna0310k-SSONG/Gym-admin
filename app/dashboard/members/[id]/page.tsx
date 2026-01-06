"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import MemberProfile from "@/components/members/MemberProfile";
import Card from "@/components/ui/Card";
import type { Member } from "@/types/api/responses";

export default function MemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: 실제 API 호출
    // 임시 데이터
    const mockMember: Member = {
      id: params.id as string,
      name: "홍길동",
      email: "hong@example.com",
      phone: "010-1234-5678",
      joinDate: "2024-01-15",
      status: "ACTIVE",
      createdAt: "2024-01-15T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
    };
    setMember(mockMember);
    setLoading(false);
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">회원을 찾을 수 없습니다.</p>
        <Link href="/dashboard/members">
          <Button variant="outline">목록으로 돌아가기</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link
            href="/dashboard/members"
            className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block"
          >
            ← 목록으로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{member.name} 회원 상세</h1>
        </div>
        <div className="space-x-3">
          <Link href={`/dashboard/members/${member.id}/edit`}>
            <Button variant="primary">수정</Button>
          </Link>
          <Button variant="danger">삭제</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MemberProfile member={member} />
        <Card title="능력치 차트">
          <p className="text-gray-500">능력치 차트는 추후 구현 예정입니다.</p>
        </Card>
      </div>
    </div>
  );
}

