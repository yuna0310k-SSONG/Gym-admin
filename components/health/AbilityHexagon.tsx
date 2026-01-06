"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import Card from "@/components/ui/Card";

interface AbilityHexagonData {
  strength?: number; // 하체 근력
  cardio?: number; // 심폐 지구력
  endurance?: number; // 근지구력
  flexibility?: number; // 유연성
  body?: number; // 체성분 밸런스
  stability?: number; // 부상 안정성
}

interface AbilityHexagonProps {
  data: AbilityHexagonData;
  title?: string;
  isAverage?: boolean;
}

export default function AbilityHexagon({
  data,
  title = "능력치 헥사곤",
  isAverage = false,
}: AbilityHexagonProps) {
  const toNumber = (value: number | null | undefined) =>
    typeof value === "number" && !Number.isNaN(value) ? value : 0;

  // 데이터를 차트 형식으로 변환 (undefined 안전 처리)
  const chartData = [
    { indicator: "하체 근력", value: toNumber(data.strength), fullMark: 100 },
    { indicator: "심폐 지구력", value: toNumber(data.cardio), fullMark: 100 },
    { indicator: "근지구력", value: toNumber(data.endurance), fullMark: 100 },
    { indicator: "유연성", value: toNumber(data.flexibility), fullMark: 100 },
    { indicator: "체성분 밸런스", value: toNumber(data.body), fullMark: 100 },
    { indicator: "부상 안정성", value: toNumber(data.stability), fullMark: 100 },
  ];

  return (
    <Card title={title} className="bg-[#0f1115]">
      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData}>
            <PolarGrid stroke="#374151" />
            <PolarAngleAxis
              dataKey="indicator"
              tick={{ fill: "#c9c7c7", fontSize: 12 }}
              className="text-[#c9c7c7]"
            />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#9ca3af", fontSize: 10 }} />
            <Radar
              name="능력치"
              dataKey="value"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.6}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
        {chartData.map((item) => {
          const safeValue = toNumber(item.value);
          return (
            <div key={item.indicator} className="flex items-center justify-between">
              <span className="text-[#c9c7c7]">{item.indicator}:</span>
              <span className="text-white font-semibold">
                {safeValue.toFixed(1)}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

