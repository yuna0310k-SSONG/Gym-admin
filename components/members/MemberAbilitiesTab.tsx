"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import AbilityHexagon from "@/components/health/AbilityHexagon";
import { useQuery } from "@tanstack/react-query";
import { abilityApi } from "@/lib/api/abilities";
import type { AbilityHexagonResponse } from "@/types/api/responses";

interface MemberAbilitiesTabProps {
  memberId: string;
}

export default function MemberAbilitiesTab({
  memberId,
}: MemberAbilitiesTabProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<
    "current" | "week" | "month"
  >("current");

  const {
    data: hexagonData,
    isLoading: hexagonLoading,
    error: hexagonError,
  } = useQuery({
    queryKey: ["abilities", "hexagon", memberId],
    queryFn: () => abilityApi.getHexagon(memberId),
    enabled: !!memberId,
    retry: false, // 404 에러는 재시도하지 않음
    // 404 에러는 정상적인 경우이므로 에러로 처리하지 않음
    throwOnError: false,
  });

  const { data: latestData, isLoading: latestLoading } = useQuery({
    queryKey: ["abilities", "latest", memberId],
    queryFn: () => abilityApi.getLatest(memberId),
    enabled: !!memberId,
  });

  const { data: compareData, isLoading: compareLoading } = useQuery({
    queryKey: ["abilities", "compare", memberId],
    queryFn: () => abilityApi.getCompare(memberId, 1),
    enabled: !!memberId,
    // compareData가 null일 수 있으므로 에러로 처리하지 않음
    retry: false,
  });

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ["abilities", "history", memberId],
    queryFn: () => abilityApi.getHistory(memberId),
    enabled: !!memberId,
  });

  if (hexagonLoading || latestLoading || compareLoading || historyLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[#c9c7c7]">로딩 중...</p>
      </div>
    );
  }

  // hexagonData가 없으면 latestData를 사용하여 fallback
  const displayData = hexagonData
    ? {
        strength:
          hexagonData.indicators.find((i) => i.name === "하체 근력")?.score ||
          0,
        cardio:
          hexagonData.indicators.find((i) => i.name === "심폐 지구력")?.score ||
          0,
        endurance:
          hexagonData.indicators.find((i) => i.name === "근지구력")?.score || 0,
        flexibility:
          hexagonData.indicators.find((i) => i.name === "유연성")?.score || 0,
        body:
          hexagonData.indicators.find((i) => i.name === "체성분 밸런스")
            ?.score || 0,
        stability:
          hexagonData.indicators.find((i) => i.name === "부상 안정성")?.score ||
          0,
      }
    : latestData
    ? {
        strength: latestData.strengthScore,
        cardio: latestData.cardioScore,
        endurance: latestData.enduranceScore,
        flexibility: latestData.flexibilityScore,
        body: latestData.bodyScore,
        stability: latestData.stabilityScore,
      }
    : null;

  return (
    <div className="space-y-6">
      {/* 능력치 헥사곤 */}
      {displayData && (
        <div>
          <div className="mb-4 flex space-x-2">
            <button
              onClick={() => setSelectedPeriod("current")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === "current"
                  ? "bg-blue-500 text-white"
                  : "bg-[#1a1d24] text-[#c9c7c7] hover:bg-[#252830]"
              }`}
            >
              현재
            </button>
            <button
              onClick={() => setSelectedPeriod("week")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === "week"
                  ? "bg-blue-500 text-white"
                  : "bg-[#1a1d24] text-[#c9c7c7] hover:bg-[#252830]"
              }`}
            >
              주간
            </button>
            <button
              onClick={() => setSelectedPeriod("month")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === "month"
                  ? "bg-blue-500 text-white"
                  : "bg-[#1a1d24] text-[#c9c7c7] hover:bg-[#252830]"
              }`}
            >
              월간
            </button>
          </div>
          <AbilityHexagon data={displayData} title="능력치 헥사곤" />
        </div>
      )}

      {/* 최신 능력치 스냅샷 */}
      {latestData && (
        <Card title="최신 능력치 스냅샷" className="bg-[#0f1115]">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <span className="text-[#c9c7c7] text-sm">종합 점수</span>
              <p className="text-white text-2xl font-bold">
                {latestData.totalScore.toFixed(1)}
              </p>
            </div>
            <div>
              <span className="text-[#c9c7c7] text-sm">근력 점수</span>
              <p className="text-white text-xl font-semibold">
                {latestData.strengthScore.toFixed(1)}
              </p>
            </div>
            <div>
              <span className="text-[#c9c7c7] text-sm">심폐 점수</span>
              <p className="text-white text-xl font-semibold">
                {latestData.cardioScore.toFixed(1)}
              </p>
            </div>
            <div>
              <span className="text-[#c9c7c7] text-sm">지구력 점수</span>
              <p className="text-white text-xl font-semibold">
                {latestData.enduranceScore.toFixed(1)}
              </p>
            </div>
            <div>
              <span className="text-[#c9c7c7] text-sm">유연성 점수</span>
              <p className="text-white text-xl font-semibold">
                {latestData.flexibilityScore.toFixed(1)}
              </p>
            </div>
            <div>
              <span className="text-[#c9c7c7] text-sm">신체 점수</span>
              <p className="text-white text-xl font-semibold">
                {latestData.bodyScore.toFixed(1)}
              </p>
            </div>
            <div>
              <span className="text-[#c9c7c7] text-sm">안정성 점수</span>
              <p className="text-white text-xl font-semibold">
                {latestData.stabilityScore.toFixed(1)}
              </p>
            </div>
          </div>
          <p className="text-[#c9c7c7] text-sm mt-4">
            평가 시점:{" "}
            {new Date(latestData.assessedAt).toLocaleDateString("ko-KR")}
          </p>
        </Card>
      )}

      {/* 능력치 비교 */}
      {compareData && (
        <Card title="이전 평가와 비교" className="bg-[#0f1115]">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(compareData.delta).map(([key, value]) => {
              const labels: Record<string, string> = {
                totalScore: "종합 점수",
                strengthScore: "근력 점수",
                cardioScore: "심폐 점수",
                enduranceScore: "지구력 점수",
                flexibilityScore: "유연성 점수",
                bodyScore: "신체 점수",
                stabilityScore: "안정성 점수",
              };
              const isPositive = value >= 0;
              const percentage =
                compareData.percentageChange[
                  key as keyof typeof compareData.percentageChange
                ];
              return (
                <div key={key} className="p-4 bg-[#1a1d24] rounded-lg">
                  <span className="text-[#c9c7c7] text-sm block mb-2">
                    {labels[key]}
                  </span>
                  <div className="flex items-baseline space-x-2">
                    <span
                      className={`text-xl font-bold ${
                        isPositive ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {isPositive ? "+" : ""}
                      {value.toFixed(1)}
                    </span>
                    <span
                      className={`text-sm ${
                        isPositive ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      ({isPositive ? "+" : ""}
                      {percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* 히스토리 */}
      {historyData && historyData.history.length > 0 && (
        <Card title="능력치 히스토리" className="bg-[#0f1115]">
          <div className="space-y-4">
            {historyData.history.map((item, index) => (
              <div key={index} className="p-4 bg-[#1a1d24] rounded-lg">
                <p className="text-white font-semibold mb-2">
                  {new Date(item.assessedAt).toLocaleDateString("ko-KR")}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  {item.indicators.map((indicator) => (
                    <div key={indicator.name} className="flex justify-between">
                      <span className="text-[#c9c7c7]">{indicator.name}:</span>
                      <span className="text-white font-semibold">
                        {indicator.score.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
