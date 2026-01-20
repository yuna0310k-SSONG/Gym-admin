"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import QuickActionButton from "@/components/dashboard/QuickActionButton";
import RecentActivityFeed, {
  type ActivityItem,
} from "@/components/dashboard/RecentActivityFeed";
import QuickMemberList from "@/components/dashboard/QuickMemberList";
import DashboardKPICards from "@/components/dashboard/DashboardKPICards";
import MemberManagementTable from "@/components/dashboard/MemberManagementTable";
import { useAuth } from "@/lib/hooks/useAuth";
import { trainerApi } from "@/lib/api/trainers";
import { memberApi } from "@/lib/api/members";
import { goalApi } from "@/lib/api/goals";
import { insightApi } from "@/lib/api/insights";
import { assessmentApi } from "@/lib/api/assessments";
import type { Member } from "@/types/api/responses";
import type { MemberGoalResponse } from "@/types/api/responses";

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

interface MemberWithGoal extends Member {
  goal?: MemberGoalResponse | null;
}

export default function DashboardPage() {
  const { user } = useAuth();

  const [pendingTrainerCount, setPendingTrainerCount] = useState(0);
  const [members, setMembers] = useState<MemberWithGoal[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<MemberWithGoal[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);

  // KPI 데이터
  const [kpiData, setKpiData] = useState({
    averageAchievement: 0,
    riskMembers: 0,
    unenteredAssessments: 0,
  });

  const [todaySummary, setTodaySummary] = useState({
    newMembers: 0,
    assessments: 0,
    deletions: 0,
  });

  const [loading, setLoading] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");

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

      try {
        // 회원 목록 조회
        const membersData = await memberApi.getMembers(1, 100);
        const allMembers = membersData.members;

        // 각 회원의 목표 정보 조회
        const membersWithGoals = await Promise.all(
          allMembers.map(async (member) => {
            try {
              const goal = await goalApi.get(member.id);
              return { ...member, goal };
            } catch (error) {
              return { ...member, goal: null };
            }
          })
        );

        setMembers(membersWithGoals);
        setFilteredMembers(membersWithGoals);

        // KPI 데이터 계산
        // 1. 평균 달성률 계산
        const membersWithGoalsAndProgress = membersWithGoals.filter(
          (m) => m.goal?.goalProgress !== undefined
        );
        const averageAchievement =
          membersWithGoalsAndProgress.length > 0
            ? Math.round(
                membersWithGoalsAndProgress.reduce(
                  (sum, m) => sum + (m.goal?.goalProgress || 0),
                  0
                ) / membersWithGoalsAndProgress.length
              )
            : 0;

        // 2. 위험 회원 수 조회
        let riskMembersCount = 0;
        try {
          const riskData = await insightApi.getRiskMembers();
          riskMembersCount = riskData?.total || 0;
        } catch (error) {
          // 위험 회원이 없거나 API가 없을 경우 진행률 40% 미만 회원을 위험으로 간주
          riskMembersCount = membersWithGoals.filter(
            (m) => (m.goal?.goalProgress || 0) < 40
          ).length;
        }

        // 3. 미입력 측정 데이터 (초기 평가가 없는 회원 수)
        let unenteredAssessments = 0;
        for (const member of allMembers.slice(0, 50)) {
          // 최대 50명만 체크 (성능 최적화)
          try {
            const assessmentsData = await assessmentApi.getAssessments(member.id);
            const hasInitialAssessment = assessmentsData.assessments.some(
              (a) => a.assessmentType === "INITIAL" || a.isInitial
            );
            if (!hasInitialAssessment) {
              unenteredAssessments++;
            }
          } catch (error) {
            // 평가가 없으면 미입력으로 간주
            unenteredAssessments++;
          }
        }

        setKpiData({
          averageAchievement,
          riskMembers: riskMembersCount,
          unenteredAssessments,
        });

        // 오늘의 요약
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayNewMembers = allMembers.filter((m) => {
          const d = new Date(m.createdAt);
          d.setHours(0, 0, 0, 0);
          return d.getTime() === today.getTime();
        }).length;

        setTodaySummary({
          newMembers: todayNewMembers,
          assessments: 0,
          deletions: 0,
        });

        // 최근 활동
        const activities: ActivityItem[] = allMembers
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
      } catch (error) {
        console.error("대시보드 데이터 조회 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // 검색 필터링
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMembers(members);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = members.filter((member) =>
      member.name.toLowerCase().includes(query)
    );
    setFilteredMembers(filtered);
  }, [searchQuery, members]);

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 헤더 */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                센터 대시보드
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                관리자용 - 현재 운영 중인 타임박스 프로그램 현황
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {/* 빠른 액션 버튼들 */}
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard/members/new"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  회원 추가
                </Link>
                <Link
                  href="/dashboard/members"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
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
                  평가 등록
                </Link>
                <Link
                  href="/dashboard/insights"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  인사이트
                </Link>
              </div>
              {user?.role === "ADMIN" && pendingTrainerCount > 0 && (
                <Link href="/dashboard/trainers">
                  <div className="px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 hover:bg-yellow-100 transition-colors">
                    <span className="flex items-center gap-2 font-medium">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400"></span>
                      </span>
                      승인 대기 {pendingTrainerCount}명
                    </span>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* KPI 카드 */}
        <DashboardKPICards
          averageAchievement={kpiData.averageAchievement}
          riskMembers={kpiData.riskMembers}
          unenteredAssessments={kpiData.unenteredAssessments}
          isLoading={loading}
        />

        {/* 회원 관리 리스트 */}
        <MemberManagementTable
          members={filteredMembers}
          isLoading={loading}
          onSearch={setSearchQuery}
        />

        {/* 기존 기능들 (옵션) - 필요시 아래에 추가 */}
        {false && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
              <Card
                title="캘린더"
                className="bg-white border border-gray-200 shadow-sm"
              >
                <DashboardCalendar />
              </Card>

              <Card
                title="이번 주 요약"
                className="bg-white border border-gray-200 shadow-sm"
              >
                <WeeklyTrend newMembers={3} assessments={2} />
              </Card>
            </div>

            <Card
              title="최근 활동"
              className="bg-white border border-gray-200 shadow-sm mt-6"
            >
              <RecentActivityFeed
                activities={recentActivities}
                isLoading={loading}
              />
            </Card>
          </>
        )}

        <QuickActionButton />
      </div>
    </div>
  );
}
