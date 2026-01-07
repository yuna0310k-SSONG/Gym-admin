"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import AbilityHexagon from "@/components/health/AbilityHexagon";
import RiskMemberTable from "@/components/members/RiskMemberTable";
import {
  useHexagonInsights,
  useWeeklySummary,
  useRiskMembers,
} from "@/lib/hooks/useInsights";
import { memberApi } from "@/lib/api/members";
import { analyticsApi } from "@/lib/api/analytics";
import type { InsightHexagonResponse } from "@/types/api/responses";

export default function InsightsPage() {
  const [memberStats, setMemberStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    suspended: 0,
  });
  const [averageData, setAverageData] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const {
    data: hexagonData,
    isLoading: hexagonLoading,
    error: hexagonError,
  } = useHexagonInsights();
  const {
    data: weeklyData,
    isLoading: weeklyLoading,
    error: weeklyError,
  } = useWeeklySummary();
  const {
    data: riskData,
    isLoading: riskLoading,
    error: riskError,
  } = useRiskMembers();

  // 회원 통계 조회
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const data = await memberApi.getMembers(1, 1000);
        const members = data.members || [];

        setMemberStats({
          total: members.length,
          active: members.filter((m) => m.status === "ACTIVE").length,
          inactive: members.filter((m) => m.status === "INACTIVE").length,
          suspended: members.filter((m) => m.status === "SUSPENDED").length,
        });

        // 전체 평균 데이터 조회
        try {
          const avgData = await analyticsApi.getAverages();
          setAverageData(avgData);
        } catch (error) {
          console.warn("평균 데이터 조회 실패:", error);
        }
      } catch (error) {
        console.error("회원 통계 조회 실패:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  // 점수 포맷팅 유틸
  const formatScore = (value: number | null | undefined) =>
    (value ?? 0).toFixed(1);

  // 평균 점수 계산
  const calculateAverage = (data: InsightHexagonResponse | null) => {
    if (!data) return 0;
    const scores = [
      data.strength,
      data.cardio,
      data.endurance,
      data.flexibility,
      data.body,
      data.stability,
    ];
    return scores.reduce((sum, score) => sum + (score || 0), 0) / scores.length;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">인사이트</h1>
          <p className="text-[#9ca3af]">
            헬스장 전체 운영 현황 및 통계를 한눈에 확인하세요
          </p>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#9ca3af] text-sm">총 회원 수</span>
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-400"
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
              </div>
            </div>
            {loadingStats ? (
              <p className="text-[#9ca3af] text-sm">로딩 중...</p>
            ) : (
              <p className="text-3xl font-bold text-white">
                {memberStats.total}
              </p>
            )}
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#9ca3af] text-sm">활성 회원</span>
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-400"
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
            </div>
            {loadingStats ? (
              <p className="text-[#9ca3af] text-sm">로딩 중...</p>
            ) : (
              <p className="text-3xl font-bold text-white">
                {memberStats.active}
              </p>
            )}
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#9ca3af] text-sm">평균 능력치</span>
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>
            {hexagonLoading ? (
              <p className="text-[#9ca3af] text-sm">로딩 중...</p>
            ) : hexagonData ? (
              <p className="text-3xl font-bold text-white">
                {calculateAverage(hexagonData).toFixed(1)}
              </p>
            ) : (
              <p className="text-[#9ca3af] text-sm">-</p>
            )}
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#9ca3af] text-sm">위험 신호 회원</span>
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>
            {riskLoading ? (
              <p className="text-[#9ca3af] text-sm">로딩 중...</p>
            ) : riskData ? (
              <p className="text-3xl font-bold text-white">{riskData.total}</p>
            ) : (
              <p className="text-[#9ca3af] text-sm">-</p>
            )}
          </div>
        </Card>
      </div>

      {/* 운영 능력치 헥사곤 */}
      <div>
        {hexagonLoading ? (
          <Card className="bg-[#0f1115]">
            <div className="flex items-center justify-center h-[400px]">
              <p className="text-[#c9c7c7]">로딩 중...</p>
            </div>
          </Card>
        ) : hexagonError ? (
          <Card className="bg-[#0f1115]">
            <div className="flex items-center justify-center h-[400px]">
              <p className="text-red-400">
                데이터를 불러오는 중 오류가 발생했습니다.
              </p>
            </div>
          </Card>
        ) : hexagonData ? (
          <AbilityHexagon
            data={hexagonData}
            title="운영 능력치 헥사곤 (전체 회원 평균)"
            isAverage={true}
          />
        ) : null}
      </div>

      {/* 이번 주 vs 지난 주 비교 */}
      <div>
        {weeklyLoading ? (
          <Card className="bg-[#0f1115]">
            <div className="flex items-center justify-center h-64">
              <p className="text-[#c9c7c7]">로딩 중...</p>
            </div>
          </Card>
        ) : weeklyError ? (
          <Card className="bg-[#0f1115]">
            <div className="flex items-center justify-center h-64">
              <p className="text-red-400">
                데이터를 불러오는 중 오류가 발생했습니다.
              </p>
            </div>
          </Card>
        ) : weeklyData ? (
          <Card title="이번 주 vs 지난 주 비교" className="bg-[#0f1115]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="p-4 bg-[#1a1d24] rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                  이번 주
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[#c9c7c7] text-sm">하체 근력</span>
                    <span className="text-white font-semibold">
                      {formatScore(weeklyData.thisWeek?.strength)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#c9c7c7] text-sm">심폐 지구력</span>
                    <span className="text-white font-semibold">
                      {formatScore(weeklyData.thisWeek?.cardio)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#c9c7c7] text-sm">근지구력</span>
                    <span className="text-white font-semibold">
                      {formatScore(weeklyData.thisWeek?.endurance)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#c9c7c7] text-sm">유연성</span>
                    <span className="text-white font-semibold">
                      {formatScore(weeklyData.thisWeek?.flexibility)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#c9c7c7] text-sm">
                      체성분 밸런스
                    </span>
                    <span className="text-white font-semibold">
                      {formatScore(weeklyData.thisWeek?.body)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#c9c7c7] text-sm">부상 안정성</span>
                    <span className="text-white font-semibold">
                      {formatScore(weeklyData.thisWeek?.stability)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-[#1a1d24] rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <span className="w-3 h-3 bg-gray-500 rounded-full mr-2"></span>
                  지난 주
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[#c9c7c7] text-sm">하체 근력</span>
                    <span className="text-white font-semibold">
                      {formatScore(weeklyData.lastWeek?.strength)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#c9c7c7] text-sm">심폐 지구력</span>
                    <span className="text-white font-semibold">
                      {formatScore(weeklyData.lastWeek?.cardio)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#c9c7c7] text-sm">근지구력</span>
                    <span className="text-white font-semibold">
                      {formatScore(weeklyData.lastWeek?.endurance)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#c9c7c7] text-sm">유연성</span>
                    <span className="text-white font-semibold">
                      {formatScore(weeklyData.lastWeek?.flexibility)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#c9c7c7] text-sm">
                      체성분 밸런스
                    </span>
                    <span className="text-white font-semibold">
                      {formatScore(weeklyData.lastWeek?.body)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#c9c7c7] text-sm">부상 안정성</span>
                    <span className="text-white font-semibold">
                      {formatScore(weeklyData.lastWeek?.stability)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-[#374151]">
              <h3 className="text-lg font-semibold text-white mb-4">
                주간 변화 요약
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(weeklyData.changes || {}).map(
                  ([key, value]) => {
                    const labels: Record<string, string> = {
                      strength: "하체 근력",
                      cardio: "심폐 지구력",
                      endurance: "근지구력",
                      flexibility: "유연성",
                      body: "체성분 밸런스",
                      stability: "부상 안정성",
                    };
                    const numericValue =
                      typeof value === "number" ? value : Number(value ?? 0);
                    const isPositive = numericValue >= 0;
                    return (
                      <div
                        key={key}
                        className="p-3 bg-[#1a1d24] rounded-lg border border-[#374151]"
                      >
                        <div className="text-xs text-[#9ca3af] mb-1">
                          {labels[key]}
                        </div>
                        <div
                          className={`text-lg font-bold ${
                            isPositive ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {isPositive ? "+" : ""}
                          {numericValue.toFixed(1)}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </Card>
        ) : null}
      </div>

      {/* 위험 신호 회원 리스트 */}
      <div>
        {riskLoading ? (
          <Card className="bg-[#0f1115]">
            <div className="flex items-center justify-center h-64">
              <p className="text-[#c9c7c7]">로딩 중...</p>
            </div>
          </Card>
        ) : riskError ? (
          <Card className="bg-[#0f1115]">
            <div className="flex items-center justify-center h-64">
              <p className="text-red-400">
                데이터를 불러오는 중 오류가 발생했습니다.
              </p>
            </div>
          </Card>
        ) : riskData ? (
          <Card
            title={`위험 신호 회원 (${riskData.total}명)`}
            className="bg-[#0f1115]"
          >
            {riskData.total === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-green-400"
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
                <p className="text-[#c9c7c7] text-lg font-medium">
                  위험 신호가 있는 회원이 없습니다
                </p>
                <p className="text-[#6b7280] text-sm mt-2">
                  모든 회원이 안전한 상태입니다
                </p>
              </div>
            ) : (
              <RiskMemberTable members={riskData.members} />
            )}
          </Card>
        ) : null}
      </div>
    </div>
  );
}
