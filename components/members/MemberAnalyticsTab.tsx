"use client";

import Card from "@/components/ui/Card";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api/analytics";
import ComparisonChart from "@/components/charts/ComparisonChart";

interface MemberAnalyticsTabProps {
  memberId: string;
}

export default function MemberAnalyticsTab({
  memberId,
}: MemberAnalyticsTabProps) {
  const { data: memberAnalytics, isLoading: memberLoading } = useQuery({
    queryKey: ["analytics", "member", memberId],
    queryFn: () => analyticsApi.getMemberAnalytics(memberId),
    enabled: !!memberId,
  });

  const { data: comparisonData, isLoading: comparisonLoading } = useQuery({
    queryKey: ["analytics", "comparison", memberId],
    queryFn: () => analyticsApi.getComparison(memberId),
    enabled: !!memberId,
  });

  const { data: averagesData, isLoading: averagesLoading } = useQuery({
    queryKey: ["analytics", "averages"],
    queryFn: () => analyticsApi.getAverages(),
  });

  if (memberLoading || comparisonLoading || averagesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[#c9c7c7]">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 회원 분석 */}
      {memberAnalytics && (
        <Card title="회원 분석" className="bg-[#0f1115]">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div>
              <span className="text-[#c9c7c7] text-sm">종합 점수</span>
              <p className="text-white text-2xl font-bold">
                {memberAnalytics.latestSnapshot.totalScore.toFixed(1)}
              </p>
            </div>
            <div>
              <span className="text-[#c9c7c7] text-sm">평균 대비</span>
              <p className="text-white text-xl font-semibold">
                {memberAnalytics.percentile.totalScore.toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(memberAnalytics.percentile).map(([key, value]) => {
              if (key === "totalScore") return null;
              const labels: Record<string, string> = {
                strengthScore: "근력",
                cardioScore: "심폐",
                enduranceScore: "지구력",
                flexibilityScore: "유연성",
                bodyScore: "신체",
                stabilityScore: "안정성",
              };
              return (
                <div key={key} className="p-4 bg-[#1a1d24] rounded-lg">
                  <span className="text-[#c9c7c7] text-sm block mb-2">
                    {labels[key]}
                  </span>
                  <p className="text-white text-xl font-semibold">
                    {value.toFixed(1)}%
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* 평균 비교 차트 */}
      {comparisonData && (
        <Card title="전체 평균과 비교" className="bg-[#0f1115]">
          <ComparisonChart
            data={[
              {
                label: "근력",
                member: comparisonData.member.strengthScore,
                average: comparisonData.average.strengthScore,
                percentile: comparisonData.percentile.strengthScore,
              },
              {
                label: "심폐",
                member: comparisonData.member.cardioScore,
                average: comparisonData.average.cardioScore,
                percentile: comparisonData.percentile.cardioScore,
              },
              {
                label: "지구력",
                member: comparisonData.member.enduranceScore,
                average: comparisonData.average.enduranceScore,
                percentile: comparisonData.percentile.enduranceScore,
              },
              {
                label: "유연성",
                member: comparisonData.member.flexibilityScore,
                average: comparisonData.average.flexibilityScore,
                percentile: comparisonData.percentile.flexibilityScore,
              },
              {
                label: "신체",
                member: comparisonData.member.bodyScore,
                average: comparisonData.average.bodyScore,
                percentile: comparisonData.percentile.bodyScore,
              },
              {
                label: "안정성",
                member: comparisonData.member.stabilityScore,
                average: comparisonData.average.stabilityScore,
                percentile: comparisonData.percentile.stabilityScore,
              },
            ]}
            title="회원 vs 전체 평균"
          />
        </Card>
      )}

      {/* 전체 평균 */}
      {averagesData && (
        <Card title="전체 평균 능력치" className="bg-[#0f1115]">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <span className="text-[#c9c7c7] text-sm">종합 점수</span>
              <p className="text-white text-2xl font-bold">
                {averagesData.totalScore.toFixed(1)}
              </p>
            </div>
            <div>
              <span className="text-[#c9c7c7] text-sm">근력 점수</span>
              <p className="text-white text-xl font-semibold">
                {averagesData.strengthScore.toFixed(1)}
              </p>
            </div>
            <div>
              <span className="text-[#c9c7c7] text-sm">심폐 점수</span>
              <p className="text-white text-xl font-semibold">
                {averagesData.cardioScore.toFixed(1)}
              </p>
            </div>
            <div>
              <span className="text-[#c9c7c7] text-sm">지구력 점수</span>
              <p className="text-white text-xl font-semibold">
                {averagesData.enduranceScore.toFixed(1)}
              </p>
            </div>
            <div>
              <span className="text-[#c9c7c7] text-sm">유연성 점수</span>
              <p className="text-white text-xl font-semibold">
                {averagesData.flexibilityScore.toFixed(1)}
              </p>
            </div>
            <div>
              <span className="text-[#c9c7c7] text-sm">신체 점수</span>
              <p className="text-white text-xl font-semibold">
                {averagesData.bodyScore.toFixed(1)}
              </p>
            </div>
            <div>
              <span className="text-[#c9c7c7] text-sm">안정성 점수</span>
              <p className="text-white text-xl font-semibold">
                {averagesData.stabilityScore.toFixed(1)}
              </p>
            </div>
          </div>
          <p className="text-[#c9c7c7] text-sm mt-4">
            전체 회원 수: {averagesData.totalMembers}명
          </p>
        </Card>
      )}
    </div>
  );
}
