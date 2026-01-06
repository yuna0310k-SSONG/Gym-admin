"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import MemberTable from "@/components/members/MemberTable";
import Input from "@/components/ui/Input";
import type { Member } from "@/types/api/responses";

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // TODO: 실제 API 호출
    // 임시 데이터
    const mockMembers: Member[] = [
      {
        id: "1",
        name: "홍길동",
        email: "hong@example.com",
        phone: "010-1234-5678",
        joinDate: "2024-01-15",
        status: "ACTIVE",
        createdAt: "2024-01-15T00:00:00Z",
        updatedAt: "2024-01-15T00:00:00Z",
      },
      {
        id: "2",
        name: "김철수",
        email: "kim@example.com",
        phone: "010-2345-6789",
        joinDate: "2024-02-20",
        status: "ACTIVE",
        createdAt: "2024-02-20T00:00:00Z",
        updatedAt: "2024-02-20T00:00:00Z",
      },
    ];
    setMembers(mockMembers);
    setLoading(false);
  }, []);

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">회원 관리</h1>
        <Link href="/dashboard/members/new">
          <Button variant="primary">새 회원 등록</Button>
        </Link>
      </div>

      <Card className="mb-6">
        <Input
          label="검색"
          placeholder="이름, 이메일, 전화번호로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Card>

      <Card>
        {filteredMembers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">회원이 없습니다.</p>
          </div>
        ) : (
          <MemberTable members={filteredMembers} />
        )}
      </Card>
    </div>
  );
}

