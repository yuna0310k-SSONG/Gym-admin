"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import AbilityHexagon from "@/components/health/AbilityHexagon";
import { useQuery } from "@tanstack/react-query";
import { abilityApi } from "@/lib/api/abilities";
import { assessmentApi } from "@/lib/api/assessments";
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
  const [showPeriodicModal, setShowPeriodicModal] = useState(false);

  const {
    data: hexagonData,
    isLoading: hexagonLoading,
    error: hexagonError,
  } = useQuery({
    queryKey: ["abilities", "hexagon", memberId],
    // 초기 평가 비교를 위해 compare=true 포함
    queryFn: () => abilityApi.getHexagon(memberId, true),
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
    throwOnError: false, // 404 에러는 정상적인 경우이므로 에러로 처리하지 않음
  });

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ["abilities", "history", memberId],
    queryFn: () => abilityApi.getHistory(memberId),
    enabled: !!memberId,
  });

  // 초기 평가 데이터 조회
  const { data: assessmentsData } = useQuery({
    queryKey: ["assessments", memberId],
    queryFn: () => assessmentApi.getAssessments(memberId),
    enabled: !!memberId,
    retry: false,
    throwOnError: false,
  });

  // 초기 평가의 스냅샷 찾기
  const initialSnapshot = assessmentsData?.assessments?.find(
    (assessment) =>
      assessment.assessmentType === "INITIAL" && assessment.snapshot
  )?.snapshot;

  if (hexagonLoading || latestLoading || compareLoading || historyLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[#c9c7c7]">로딩 중...</p>
      </div>
    );
  }

  // 디버깅: API 응답 확인
  if (process.env.NODE_ENV === "development") {
    console.log("[MemberAbilitiesTab] hexagonData:", hexagonData);
    console.log("[MemberAbilitiesTab] latestData:", latestData);
  }

  // 1) 헥사곤 API 응답을 우선 사용 (indicator 배열 기반)
  const displayData =
    hexagonData && hexagonData.indicators && hexagonData.indicators.length > 0
      ? (() => {
          // 디버깅: indicators 확인
          if (process.env.NODE_ENV === "development") {
            console.log(
              "[MemberAbilitiesTab] hexagonData.indicators:",
              hexagonData.indicators
            );
          }

          // 유연성 데이터 찾기 (여러 가능한 이름 시도)
          const flexibilityIndicator = hexagonData.indicators.find(
            (i) =>
              i.name === "유연성" ||
              i.name === "Flexibility" ||
              i.name === "flexibility" ||
              i.name.toLowerCase().includes("유연")
          );

          // 유연성 데이터가 없거나 0인 경우 latestData에서 fallback
          const flexibilityScore =
            flexibilityIndicator?.score && flexibilityIndicator.score > 0
              ? flexibilityIndicator.score
              : latestData?.flexibilityScore || 0;

          return {
            strength:
              hexagonData.indicators.find((i) => i.name === "하체 근력")
                ?.score ||
              latestData?.strengthScore ||
              0,
            cardio:
              hexagonData.indicators.find((i) => i.name === "심폐 지구력")
                ?.score ||
              latestData?.cardioScore ||
              0,
            endurance:
              hexagonData.indicators.find((i) => i.name === "근지구력")
                ?.score ||
              latestData?.enduranceScore ||
              0,
            flexibility: flexibilityScore,
            body:
              hexagonData.indicators.find((i) => i.name === "체성분 밸런스")
                ?.score ||
              latestData?.bodyScore ||
              0,
            stability:
              hexagonData.indicators.find((i) => i.name === "부상 안정성")
                ?.score ||
              latestData?.stabilityScore ||
              0,
          };
        })()
      : latestData
      ? {
          strength: latestData.strengthScore || 0,
          cardio: latestData.cardioScore || 0,
          endurance: latestData.enduranceScore || 0,
          flexibility: latestData.flexibilityScore || 0,
          body: latestData.bodyScore || 0,
          stability: latestData.stabilityScore || 0,
        }
      : null;

  // 디버깅: 최종 displayData 확인
  if (process.env.NODE_ENV === "development") {
    console.log("[MemberAbilitiesTab] displayData:", displayData);
  }

  // 2) 초기 평가 데이터: 우선 헥사곤 응답의 initial을 사용, 없으면 기존 스냅샷 fallback
  const hexagonInitial = (hexagonData as AbilityHexagonResponse | null)
    ?.initial;

  const initialData =
    hexagonInitial && "indicators" in hexagonInitial
      ? (() => {
          // 유연성 데이터 찾기 (여러 가능한 이름 시도)
          const flexibilityIndicator = hexagonInitial.indicators.find(
            (i) =>
              i.name === "유연성" ||
              i.name === "Flexibility" ||
              i.name === "flexibility" ||
              i.name.toLowerCase().includes("유연")
          );

          // 유연성 데이터가 없거나 0인 경우 initialSnapshot에서 fallback
          const flexibilityScore =
            flexibilityIndicator?.score && flexibilityIndicator.score > 0
              ? flexibilityIndicator.score
              : initialSnapshot?.flexibilityScore || 0;

          return {
            strength:
              hexagonInitial.indicators.find((i) => i.name === "하체 근력")
                ?.score ||
              initialSnapshot?.strengthScore ||
              0,
            cardio:
              hexagonInitial.indicators.find((i) => i.name === "심폐 지구력")
                ?.score ||
              initialSnapshot?.cardioScore ||
              0,
            endurance:
              hexagonInitial.indicators.find((i) => i.name === "근지구력")
                ?.score ||
              initialSnapshot?.enduranceScore ||
              0,
            flexibility: flexibilityScore,
            body:
              hexagonInitial.indicators.find((i) => i.name === "체성분 밸런스")
                ?.score ||
              initialSnapshot?.bodyScore ||
              0,
            stability:
              hexagonInitial.indicators.find((i) => i.name === "부상 안정성")
                ?.score ||
              initialSnapshot?.stabilityScore ||
              0,
          };
        })()
      : initialSnapshot
      ? {
          strength: initialSnapshot.strengthScore,
          cardio: initialSnapshot.cardioScore,
          endurance: initialSnapshot.enduranceScore,
          flexibility: initialSnapshot.flexibilityScore,
          body: initialSnapshot.bodyScore,
          stability: initialSnapshot.stabilityScore,
        }
      : undefined;

  // 데이터가 없을 때 안내 메시지
  if (!displayData && !hexagonLoading && !latestLoading) {
    return (
      <div className="space-y-6">
        <Card title="능력치 헥사곤" className="bg-[#0f1115]">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-[#c9c7c7] mb-2">능력치 데이터가 없습니다.</p>
              <p className="text-sm text-[#9ca3af]">
                초기 평가를 등록하면 능력치를 확인할 수 있습니다.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 능력치 헥사곤 + 정기 평가 추가 버튼 */}
      {displayData && (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <div className="flex space-x-2">
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPeriodicModal(true)}
            >
              정기 평가 추가
            </Button>
          </div>
          <AbilityHexagon
            data={displayData}
            initialData={initialData}
            title="능력치 헥사곤"
            showScores={true}
            showComparison={!!initialData}
          />
        </div>
      )}

      {/* 정기 평가 안내 모달 */}
      {showPeriodicModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-[#1a1d24] rounded-lg p-6 max-w-md w-full mx-4 border border-[#374151]">
            <h3 className="text-lg font-semibold text-white mb-3">
              정기 평가 입력 준비 중
            </h3>
            <p className="text-sm text-[#c9c7c7] mb-4 leading-relaxed">
              정기 평가(주간/월간) 입력 화면은 아직 준비 중입니다.
              <br />
              평가 항목과 폼 구조가 확정되면 이 버튼에서 바로 정기 평가를 추가할
              수 있도록 연동할 예정입니다.
            </p>
            <div className="flex justify-end space-x-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPeriodicModal(false)}
              >
                닫기
              </Button>
            </div>
          </div>
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
