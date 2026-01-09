"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import QuickActionButton from "@/components/dashboard/QuickActionButton";
import RecentActivityFeed, {
  type ActivityItem,
} from "@/components/dashboard/RecentActivityFeed";
import StatisticsCards, {
  type DashboardStats,
} from "@/components/dashboard/StatisticsCards";
import QuickMemberList from "@/components/dashboard/QuickMemberList";
import { useAuth } from "@/lib/hooks/useAuth";
import { trainerApi } from "@/lib/api/trainers";
import { memberApi } from "@/lib/api/members";
import { assessmentApi } from "@/lib/api/assessments";
import { insightApi } from "@/lib/api/insights";
import type { Member } from "@/types/api/responses";

/* =========================
   서브 컴포넌트
========================= */

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

function ActionRequiredMembers({ members }: { members: Member[] }) {
  if (members.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-gray-500">
          현재 조치가 필요한 회원이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {members.map((m) => (
        <li
          key={m.id}
          className="flex items-center justify-between px-3 py-2 rounded-md bg-red-500/10 border border-red-500/20"
        >
          <span className="text-sm text-white">{m.name}</span>
          <Link
            href={`/dashboard/members/${m.id}`}
            className="text-xs text-red-400 hover:underline"
          >
            확인
          </Link>
        </li>
      ))}
    </ul>
  );
}

function PendingAssessments({ count }: { count: number }) {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-2">
      <p className="text-3xl font-bold text-yellow-400">{count}</p>
      <p className="text-sm text-gray-400">초기 평가 미완료 회원</p>
      <Link
        href="/dashboard/members"
        className="text-xs text-blue-400 hover:underline"
      >
        바로가기 →
      </Link>
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
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeMembers: 0,
    pendingInitialAssessments: 0,
    riskMembers: 0,
  });

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

      const activeMembers = membersData.members.filter(
        (m) => m.status === "ACTIVE"
      ).length;

      const assessmentFlags = await Promise.all(
        membersData.members.map(async (m) => {
          try {
            const res = await assessmentApi.getAssessments(m.id);
            return res.assessments.some((a) => a.isInitial);
          } catch {
            return false;
          }
        })
      );

      const pendingInitialAssessments = assessmentFlags.filter(
        (v) => !v
      ).length;

      const riskMembers =
        (await insightApi.getRiskMembers().catch(() => ({ total: 0 })))
          ?.total ?? 0;

      setStats({
        totalMembers: membersData.total,
        activeMembers,
        pendingInitialAssessments,
        riskMembers,
      });

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

  const actionRequiredMembers =
    stats.pendingInitialAssessments > 0 ? members.slice(0, 5) : [];

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

      {/* KPI + 트렌드 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2">
          <StatisticsCards stats={stats} isLoading={loading} />
        </div>
        <Card
          title="이번 주 요약"
          className="bg-gradient-to-br from-[#0f1115] via-[#1a1d24] to-[#0f1115] border-[#374151]/50 shadow-2xl shadow-black/30 backdrop-blur-sm hover:shadow-black/40 transition-shadow duration-300"
        >
          <WeeklyTrend newMembers={3} assessments={2} />
        </Card>
      </div>

      {/* 액션 / 회원 / 평가 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch mb-4">
        <Card
          title="⚠️ 액션 필요 회원"
          className="bg-gradient-to-br from-[#0f1115] via-[#1a0f15] to-[#0f1115] border-red-500/30 h-full shadow-2xl shadow-red-500/10 hover:shadow-red-500/20 transition-all duration-300 hover:border-red-500/40 backdrop-blur-sm"
        >
          <div className="flex flex-col h-full">
            <ActionRequiredMembers members={actionRequiredMembers} />
          </div>
        </Card>

        <Card
          title="회원 관리"
          className="bg-gradient-to-br from-[#0f1115] via-[#0f151a] to-[#0f1115] border-blue-500/30 h-full shadow-2xl shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-300 hover:border-blue-500/40 backdrop-blur-sm"
        >
          <div className="flex flex-col h-full">
            <QuickMemberList
              members={members.slice(0, 10)}
              isLoading={loading}
            />
          </div>
        </Card>

        <Card
          title="📋 평가 미완료"
          className="bg-gradient-to-br from-[#0f1115] via-[#15150f] to-[#0f1115] border-yellow-500/30 h-full shadow-2xl shadow-yellow-500/10 hover:shadow-yellow-500/20 transition-all duration-300 hover:border-yellow-500/40 backdrop-blur-sm"
        >
          <PendingAssessments count={stats.pendingInitialAssessments} />
        </Card>
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
