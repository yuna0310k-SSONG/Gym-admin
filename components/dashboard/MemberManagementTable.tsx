"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Member } from "@/types/api/responses";
import type { MemberGoalResponse } from "@/types/api/responses";

interface MemberWithGoal extends Member {
  goal?: MemberGoalResponse | null;
  statusColor?: "GREEN" | "YELLOW" | "RED";
}

interface MemberManagementTableProps {
  members: MemberWithGoal[];
  isLoading?: boolean;
  onSearch?: (query: string) => void;
}

export default function MemberManagementTable({
  members,
  isLoading = false,
  onSearch,
}: MemberManagementTableProps) {
  const router = useRouter();

  // 상태 색상 결정 (목표 진행률 기준)
  const getStatusColor = (goalProgress?: number): "GREEN" | "YELLOW" | "RED" => {
    if (!goalProgress) return "YELLOW";
    if (goalProgress >= 70) return "GREEN";
    if (goalProgress >= 40) return "YELLOW";
    return "RED";
  };

  // 진행도 계산 (D-X 형식)
  const getProgress = (totalSessions?: number, completedSessions?: number): string => {
    if (!totalSessions || !completedSessions) return "-";
    const remaining = totalSessions - completedSessions;
    return `D-${remaining}`;
  };

  // 프로그램 기간 계산 (총 세션 수를 주 단위로 변환, 예: 24세션 = 12주)
  const getProgramWeeks = (totalSessions?: number): string => {
    if (!totalSessions) return "-";
    const weeks = Math.ceil(totalSessions / 2); // 주당 2세션 가정
    return `${weeks}주`;
  };

  // 목표 아이콘
  const getGoalIcon = (goal?: string) => {
    if (!goal) return null;
    const goalLower = goal.toLowerCase();
    if (goalLower.includes("체중") || goalLower.includes("감량")) {
      return (
        <svg
          className="w-5 h-5 text-purple-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      );
    }
    if (goalLower.includes("근력") || goalLower.includes("증가")) {
      return (
        <svg
          className="w-5 h-5 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      );
    }
    if (goalLower.includes("체력") || goalLower.includes("증진")) {
      return (
        <svg
          className="w-5 h-5 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      );
    }
    return (
      <svg
        className="w-5 h-5 text-gray-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* 헤더 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            회원 관리 리스트
          </h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Q 회원명 검색..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={(e) => onSearch?.(e.target.value)}
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                회원명
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                핵심 목표
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                프로그램
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                진행도
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                성과 달성도
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {members.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  회원이 없습니다
                </td>
              </tr>
            ) : (
              members.map((member) => {
                const goalProgress = member.goal?.goalProgress ?? 0;
                const statusColor = getStatusColor(goalProgress);
                const progress = getProgress(
                  member.goal?.totalSessions,
                  member.goal?.completedSessions
                );
                const programWeeks = getProgramWeeks(member.goal?.totalSessions);

                return (
                  <tr
                    key={member.id}
                    onClick={() => router.push(`/dashboard/members/${member.id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {member.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getGoalIcon(member.goal?.goal)}
                        <span className="text-sm text-gray-900">
                          {member.goal?.goal || "목표 미설정"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{programWeeks}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{progress}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            statusColor === "GREEN"
                              ? "bg-green-500"
                              : statusColor === "YELLOW"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                        ></div>
                        <span
                          className={`text-sm font-medium ${
                            statusColor === "GREEN"
                              ? "text-green-600"
                              : statusColor === "YELLOW"
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {statusColor}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 max-w-[120px]">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                statusColor === "GREEN"
                                  ? "bg-blue-600"
                                  : statusColor === "YELLOW"
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${goalProgress}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 min-w-[40px]">
                          {goalProgress}%
                        </span>
                        <Link
                          href={`/dashboard/members/${member.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-gray-400 hover:text-gray-600"
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
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
