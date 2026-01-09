"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Member } from "@/types/api/responses";
import Badge from "@/components/ui/Badge";

interface QuickMemberListProps {
  members: Member[];
  isLoading?: boolean;
}

export default function QuickMemberList({
  members,
  isLoading = false,
}: QuickMemberListProps) {
  const router = useRouter();

  const getStatusBadge = (status: Member["status"]) => {
    const statusMap = {
      ACTIVE: { variant: "success" as const, label: "활성" },
      INACTIVE: { variant: "default" as const, label: "비활성" },
      SUSPENDED: { variant: "danger" as const, label: "정지" },
    };
    const { variant, label } = statusMap[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="p-2 bg-[#1a1d24] rounded-lg border border-[#374151] animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <div className="w-8 h-8 rounded-full bg-[#374151]"></div>
                <div className="flex-1">
                  <div className="h-4 bg-[#374151] rounded w-20 mb-1"></div>
                  <div className="h-3 bg-[#374151] rounded w-32"></div>
                </div>
              </div>
              <div className="w-12 h-5 bg-[#374151] rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-8">
        <svg
          className="w-12 h-12 mx-auto text-[#6b7280] mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <p className="text-sm text-[#9ca3af] mb-1">회원이 없습니다</p>
        <p className="text-xs text-[#6b7280]">새 회원을 등록해주세요</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {members.map((member) => (
        <div
          key={member.id}
          onClick={() => router.push(`/dashboard/members/${member.id}`)}
          className="p-2 bg-[#1a1d24] rounded-lg border border-[#374151] hover:bg-[#262b33] hover:border-[#4b5563] transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-medium text-white truncate">
                    {member.name}
                  </p>
                </div>
                <p className="text-xs text-[#9ca3af] truncate">
                  {member.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {getStatusBadge(member.status)}
              <svg
                className="w-4 h-4 text-[#6b7280]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </div>
      ))}
      <Link
        href="/dashboard/members"
        className="block text-center py-2 text-xs text-[#9ca3af] hover:text-white transition-colors"
      >
        전체 회원 보기 →
      </Link>
    </div>
  );
}

