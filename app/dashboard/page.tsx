"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import QuickActionButton from "@/components/dashboard/QuickActionButton";
import RecentActivityFeed, {
  type ActivityItem,
} from "@/components/dashboard/RecentActivityFeed";
import QuickMemberList from "@/components/dashboard/QuickMemberList";
import { useAuth } from "@/lib/hooks/useAuth";
import { trainerApi } from "@/lib/api/trainers";
import { memberApi } from "@/lib/api/members";
import type { Member } from "@/types/api/responses";

/* =========================
   서브 컴포넌트
========================= */

function DashboardCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthNames = [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ];

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const today = new Date();
  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const calendarDays = [];
  // 이전 달의 마지막 날짜들
  const prevMonthDays = getDaysInMonth(
    new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
  );
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({
      day: prevMonthDays - i,
      isCurrentMonth: false,
    });
  }
  // 현재 달의 날짜들
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: true,
    });
  }
  // 다음 달의 첫 날짜들 (5주로 채우기)
  const remainingDays = 35 - calendarDays.length;
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: false,
    });
  }

  return (
    <div className="space-y-4">
      {/* 월 네비게이션 */}
      <div className="flex items-center justify-between">
        <button
          onClick={goToPreviousMonth}
          className="p-2 rounded-lg hover:bg-[#1a1d24] transition-colors text-[#e5e7eb]"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h3 className="text-lg font-semibold text-white">
          {currentMonth.getFullYear()}년 {monthNames[currentMonth.getMonth()]}
        </h3>
        <button
          onClick={goToNextMonth}
          className="p-2 rounded-lg hover:bg-[#1a1d24] transition-colors text-[#e5e7eb]"
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
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-[#9ca3af] py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* 캘린더 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map(({ day, isCurrentMonth }, index) => (
          <div
            key={index}
            className={`
              aspect-square flex items-center justify-center text-sm rounded-lg transition-colors
              ${
                isCurrentMonth
                  ? isToday(day)
                    ? "bg-blue-500/20 text-blue-300 font-bold border border-blue-500/50"
                    : "text-[#e5e7eb] hover:bg-[#1a1d24]"
                  : "text-[#6b7280]"
              }
            `}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
}

function WeeklyTrend({
  newMembers,
  assessments,
}: {
  newMembers: number;
  assessments: number;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-500/20 hover:border-green-500/30 transition-all">
        <div className="flex items-center gap-2">
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
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <span className="text-sm text-gray-300">이번 주 신규 회원</span>
        </div>
        <span className="text-lg font-bold text-green-400">+{newMembers}</span>
      </div>
      <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/5 border border-blue-500/20 hover:border-blue-500/30 transition-all">
        <div className="flex items-center gap-2">
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <span className="text-sm text-gray-300">평가 등록</span>
        </div>
        <span className="text-lg font-bold text-blue-400">+{assessments}</span>
      </div>
    </div>
  );
}

/* =========================
   메인 페이지
========================= */

export default function DashboardPage() {
  const { user } = useAuth();

  const [pendingTrainerCount, setPendingTrainerCount] = useState(0);
  const [members, setMembers] = useState<Member[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);

  const [todaySummary, setTodaySummary] = useState({
    newMembers: 0,
    assessments: 0,
    deletions: 0,
  });

  const [loading, setLoading] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  /* =========================
     데이터 로딩
  ========================= */

  // 현재 날짜/시간 업데이트 (1초마다)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      trainerApi
        .getPendingTrainers()
        .then((res) =>
          setPendingTrainerCount(res?.total ?? res?.trainers?.length ?? 0)
        )
        .catch(() => setPendingTrainerCount(0));
    }
  }, [user]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);

      const membersData = await memberApi.getMembers(1, 100);
      setMembers(membersData.members);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayNewMembers = membersData.members.filter((m) => {
        const d = new Date(m.createdAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
      }).length;

      setTodaySummary({
        newMembers: todayNewMembers,
        assessments: 0,
        deletions: 0,
      });

      const activities: ActivityItem[] = membersData.members
        .slice(0, 10)
        .map((m) => ({
          id: `member-${m.id}`,
          type: "MEMBER_REGISTERED",
          memberId: m.id,
          memberName: m.name,
          description: `${m.name}님이 회원으로 등록되었습니다`,
          timestamp: m.createdAt,
          link: `/dashboard/members/${m.id}`,
        }));

      setRecentActivities(
        activities.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
      );

      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  /* =========================
     UI
  ========================= */

  // 날짜/시간 포맷팅
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className="relative px-4 sm:px-6 py-3 min-h-screen overflow-hidden">
      {/* 애니메이션 배경 그라데이션 */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f1115] via-[#0a0d12] to-[#0f1115]"></div>
        <div className="absolute top-0 -left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 -right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* 헤더 */}
      <div className="relative mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative group">
            {/* 애니메이션 그라데이션 바 */}
            <div className="absolute -left-3 top-0 w-1.5 h-full bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full animate-pulse shadow-lg shadow-blue-500/50"></div>
            <div className="absolute -left-3 top-0 w-1.5 h-full bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-50 blur-sm"></div>

            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-3 pl-4 drop-shadow-lg">
              대시보드
            </h1>
            <div className="flex items-center gap-4 pl-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
                  <svg
                    className="relative w-5 h-5 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <span className="text-[#c9c7c7] text-sm font-medium">
                  {formatDate(currentDateTime)}
                </span>
              </div>
              <div className="w-px h-4 bg-[#374151]"></div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full"></div>
                  <svg
                    className="relative w-5 h-5 text-green-400"
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
                </div>
                <span className="font-mono text-green-400 font-semibold text-sm tracking-tight">
                  {formatTime(currentDateTime)}
                </span>
              </div>
            </div>
          </div>
          {user?.role === "ADMIN" && pendingTrainerCount > 0 && (
            <Link href="/dashboard/trainers">
              <div className="px-5 py-3 rounded-xl border border-yellow-500/40 bg-gradient-to-r from-yellow-500/20 via-orange-500/15 to-yellow-500/20 text-sm text-yellow-300 hover:from-yellow-500/30 hover:via-orange-500/25 hover:to-yellow-500/30 transition-all duration-300 shadow-xl shadow-yellow-500/20 hover:shadow-yellow-500/30 hover:scale-105 backdrop-blur-sm">
                <span className="flex items-center gap-2 font-semibold">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-400"></span>
                  </span>
                  승인 대기 {pendingTrainerCount}명
                </span>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* 캘린더 + 오른쪽 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* 왼쪽: 캘린더 */}
        <Card
          title="캘린더"
          className="bg-gradient-to-br from-[#0f1115] via-[#1a1d24] to-[#0f1115] border-[#374151]/50 shadow-2xl shadow-black/30 backdrop-blur-sm hover:shadow-black/40 transition-shadow duration-300"
        >
          <DashboardCalendar />
        </Card>

        {/* 오른쪽: 이번 주 요약 + 회원 관리 */}
        <div className="space-y-4">
          <Card
            title="이번 주 요약"
            className="bg-gradient-to-br from-[#0f1115] via-[#1a1d24] to-[#0f1115] border-[#374151]/50 shadow-2xl shadow-black/30 backdrop-blur-sm hover:shadow-black/40 transition-shadow duration-300"
          >
            <WeeklyTrend newMembers={3} assessments={2} />
          </Card>

          <Card
            title="회원 관리"
            className="bg-gradient-to-br from-[#0f1115] via-[#0f151a] to-[#0f1115] border-blue-500/30 shadow-2xl shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-300 hover:border-blue-500/40 backdrop-blur-sm"
          >
            <div className="flex flex-col h-full">
              <QuickMemberList
                members={members.slice(0, 10)}
                isLoading={loading}
              />
            </div>
          </Card>
        </div>
      </div>

      <Card
        title="최근 활동"
        className="bg-gradient-to-br from-[#0f1115] via-[#1a1d24] to-[#0f1115] border-[#374151]/50 shadow-2xl shadow-black/30 backdrop-blur-sm hover:shadow-black/40 transition-shadow duration-300"
      >
        <RecentActivityFeed activities={recentActivities} isLoading={loading} />
      </Card>

      <QuickActionButton />
    </div>
  );
}
