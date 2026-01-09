"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import AbilityHexagon from "@/components/health/AbilityHexagon";
import RiskMemberTable from "@/components/members/RiskMemberTable";
import Button from "@/components/ui/Button";
import {
  useHexagonInsights,
  useWeeklySummary,
  useRiskMembers,
} from "@/lib/hooks/useInsights";
import { useAuth } from "@/lib/hooks/useAuth";
import { trainerApi } from "@/lib/api/trainers";

export default function DashboardPage() {
  const { user } = useAuth();
  const [pendingTrainerCount, setPendingTrainerCount] = useState(0);
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

  // 점수 포맷팅 유틸 (값이 없으면 0.0으로 표시)
  const formatScore = (value: number | null | undefined) =>
    (value ?? 0).toFixed(1);

  // Admin인 경우 승인 대기 트레이너 수 조회
  useEffect(() => {
    if (user?.role === "ADMIN") {
      const fetchPendingCount = async () => {
        try {
          const data = await trainerApi.getPendingTrainers();

          // 디버깅용 로그
          if (process.env.NODE_ENV === "development") {
            console.log("[Dashboard Page] Pending trainers data:", data);
          }

          // 안전하게 처리: total이 없으면 trainers 배열 길이 사용, 그것도 없으면 0
          const count = data?.total ?? data?.trainers?.length ?? 0;
          setPendingTrainerCount(count);
        } catch (error) {
          console.error("승인 대기 트레이너 수 조회 실패:", error);
          setPendingTrainerCount(0); // 에러 발생 시 0으로 설정
        }
      };
      fetchPendingCount();
    }
  }, [user]);

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">대시보드</h1>
        {user?.role === "ADMIN" && (
          <Link href="/dashboard/trainers" className="w-full sm:w-auto">
            <Button variant="primary" className="w-full sm:w-auto">
              트레이너 관리
              {pendingTrainerCount > 0 && ` (${pendingTrainerCount}명 대기)`}
            </Button>
          </Link>
        )}
      </div>

      {/* Admin 전용: 트레이너 관리 알림 */}
      {user?.role === "ADMIN" && pendingTrainerCount > 0 && (
        <Card className="bg-yellow-500/10 border-yellow-500/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-yellow-400 mb-1">
                승인 대기 중인 트레이너가 있습니다
              </h3>
              <p className="text-[#9ca3af] text-sm">
                {pendingTrainerCount}명의 트레이너가 승인을 기다리고 있습니다.
              </p>
            </div>
            <Link href="/dashboard/trainers" className="w-full sm:w-auto">
              <Button variant="primary" className="w-full sm:w-auto">트레이너 관리하러 가기</Button>
            </Link>
          </div>
        </Card>
      )}

      {/* 운영 능력치 헥사곤 */}
      <div className="mb-6">
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

      {/* 이번 주 vs 지난 주 비교 카드 */}
      <div className="mb-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  이번 주
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#c9c7c7]">하체 근력:</span>
                    <span className="text-white font-semibold">
                      {formatScore(weeklyData.thisWeek?.strength)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#c9c7c7]">심폐 지구력:</span>
                    <span className="text-white font-semibold">
                      {formatScore(weeklyData.thisWeek?.cardio)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#c9c7c7]">근지구력:</span>
                    <span className="text-white font-semibold">
                      {formatScore(weeklyData.thisWeek?.endurance)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#c9c7c7]">유연성:</span>
                    <span className="text-white font-semibold">
                      {formatScore(weeklyData.thisWeek?.flexibility)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#c9c7c7]">체성분 밸런스:</span>
                    <span className="text-white font-semibold">
                      {formatScore(weeklyData.thisWeek?.body)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#c9c7c7]">부상 안정성:</span>
                    <span className="text-white font-semibold">
                      {formatScore(weeklyData.thisWeek?.stability)}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  지난 주
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#c9c7c7]">하체 근력:</span>
                    <span className="text-white font-semibold">
                      {formatScore(weeklyData.lastWeek?.strength)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#c9c7c7]">심폐 지구력:</span>
                    <span className="text-white font-semibold">
                      {formatScore(weeklyData.lastWeek?.cardio)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#c9c7c7]">근지구력:</span>
                    <span className="text-white font-semibold">
                      {formatScore(weeklyData.lastWeek?.endurance)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#c9c7c7]">유연성:</span>
                    <span className="text-white font-semibold">
                      {formatScore(weeklyData.lastWeek?.flexibility)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#c9c7c7]">체성분 밸런스:</span>
                    <span className="text-white font-semibold">
                      {formatScore(weeklyData.lastWeek?.body)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#c9c7c7]">부상 안정성:</span>
                    <span className="text-white font-semibold">
                      {formatScore(weeklyData.lastWeek?.stability)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-4">
                주간 변화
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
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
                        className="flex items-center justify-between"
                      >
                        <span className="text-[#c9c7c7] text-sm">
                          {labels[key]}:
                        </span>
                        <span
                          className={`font-semibold text-sm ${
                            isPositive ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {isPositive ? "+" : ""}
                          {numericValue.toFixed(1)}
                        </span>
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
            <RiskMemberTable members={riskData.members} />
          </Card>
        ) : null}
      </div>
    </div>
  );
}
