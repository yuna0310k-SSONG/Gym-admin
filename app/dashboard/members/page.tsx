"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import AlertModal from "@/components/ui/AlertModal";
import MemberTable from "@/components/members/MemberTable";
import Input from "@/components/ui/Input";
import type { Member } from "@/types/api/responses";
import { memberApi } from "@/lib/api/members";
import { onlyDigits } from "@/lib/utils/phone";

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title?: string;
    message: string;
    type?: "info" | "success" | "error" | "warning";
  }>({
    isOpen: false,
    message: "",
  });

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        // pageSize를 크게 주어 현재 존재하는 모든 회원을 한 번에 가져온다.
        const data = await memberApi.getMembers(1, 1000);
        setMembers(data.members);
      } catch (error) {
        console.error("회원 목록 조회 실패:", error);
        setAlertModal({
          isOpen: true,
          title: "회원 목록 조회 실패",
          message:
            error instanceof Error
              ? error.message
              : "회원 목록을 불러오지 못했습니다.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const filteredMembers = members.filter((member) => {
    const term = searchTerm.toLowerCase();
    const phoneTerm = onlyDigits(searchTerm);
    const memberPhoneDigits = onlyDigits(member.phone);

    return (
      member.name.toLowerCase().includes(term) ||
      member.email.toLowerCase().includes(term) ||
      (phoneTerm.length > 0 && memberPhoneDigits.includes(phoneTerm))
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[#9ca3af]">로딩 중...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#f9fafb]">회원 관리</h1>
        <Link href="/dashboard/members/new">
          <Button variant="primary">새 회원 등록</Button>
        </Link>
      </div>

      <Card className="mb-6 bg-[#0f1115]">
        <Input
          label="검색"
          placeholder="이름, 이메일, 전화번호로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Card>

      <Card className="bg-[#0f1115]">
        {filteredMembers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#9ca3af]">회원이 없습니다.</p>
          </div>
        ) : (
          <MemberTable members={filteredMembers} />
        )}
      </Card>

      {/* Alert 모달 */}
      <AlertModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal({ isOpen: false, message: "" })}
      />
    </div>
  );
}
