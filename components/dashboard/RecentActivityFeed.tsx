"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Member, AssessmentResponse } from "@/types/api/responses";

export interface ActivityItem {
  id: string;
  type: "MEMBER_REGISTERED" | "ASSESSMENT_CREATED";
  memberId: string;
  memberName: string;
  description: string;
  timestamp: string;
  link: string;
}

interface RecentActivityFeedProps {
  activities: ActivityItem[];
  isLoading?: boolean;
}

export default function RecentActivityFeed({
  activities,
  isLoading = false,
}: RecentActivityFeedProps) {
  const router = useRouter();

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "MEMBER_REGISTERED":
        return (
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
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
        );
      case "ASSESSMENT_CREATED":
        return (
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </div>
        );
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return "방금 전";
    } else if (diffMins < 60) {
      return `${diffMins}분 전`;
    } else if (diffHours < 24) {
      return `${diffHours}시간 전`;
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else {
      return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 bg-[#1a1d24] rounded-lg animate-pulse"
          >
            <div className="w-8 h-8 rounded-full bg-[#374151]"></div>
            <div className="flex-1">
              <div className="h-4 bg-[#374151] rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-[#374151] rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
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
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-sm text-[#9ca3af] mb-1">최근 활동이 없습니다</p>
        <p className="text-xs text-[#6b7280]">새로운 활동이 발생하면 여기에 표시됩니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {activities.map((activity) => (
        <div
          key={activity.id}
          onClick={() => router.push(activity.link)}
          className="flex items-center gap-3 p-3 bg-[#1a1d24] rounded-lg hover:bg-[#262b33] transition-colors cursor-pointer border border-[#374151] hover:border-[#4b5563]"
        >
          {getActivityIcon(activity.type)}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-medium truncate">
              {activity.description}
            </p>
            <p className="text-xs text-[#9ca3af] mt-0.5">
              {formatTimestamp(activity.timestamp)}
            </p>
          </div>
          <svg
            className="w-4 h-4 text-[#6b7280] flex-shrink-0"
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
      ))}
    </div>
  );
}

