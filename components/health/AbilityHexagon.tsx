"use client";

import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  Plugin,
} from "chart.js";
import { Radar } from "react-chartjs-2";
import Card from "@/components/ui/Card";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface AbilityHexagonData {
  strength?: number; // 하체 근력
  cardio?: number; // 심폐 지구력
  endurance?: number; // 근지구력
  flexibility?: number; // 유연성
  body?: number; // 체성분 밸런스
  stability?: number; // 부상 안정성
}

interface AbilityHexagonInitialData {
  strength?: number;
  cardio?: number;
  endurance?: number;
  flexibility?: number;
  body?: number;
  stability?: number;
}

interface AbilityHexagonProps {
  data: AbilityHexagonData;
  initialData?: AbilityHexagonInitialData; // 초기 평가 데이터 (선택적)
  title?: string;
  isAverage?: boolean;
  showScores?: boolean; // 점수 표시 여부 (기본값: true)
  showComparison?: boolean; // 초기 vs 현재 비교 표시 여부 (기본값: true)
}

export default function AbilityHexagon({
  data,
  initialData,
  title = "능력치 헥사곤",
  isAverage = false,
  showScores = true,
  showComparison = true,
}: AbilityHexagonProps) {
  const toNumber = (value: number | null | undefined) =>
    typeof value === "number" && !Number.isNaN(value) ? value : 0;

  const labels = [
    "하체 근력",
    "심폐 지구력",
    "근지구력",
    "유연성",
    "체성분 밸런스",
    "부상 안정성",
  ];

  const currentData = [
    toNumber(data.strength),
    toNumber(data.cardio),
    toNumber(data.endurance),
    toNumber(data.flexibility),
    toNumber(data.body),
    toNumber(data.stability),
  ];

  // 초기 평가 데이터가 있으면 비교 표시
  const hasInitialData = initialData && showComparison;
  const initialDataArray = hasInitialData
    ? [
        toNumber(initialData.strength),
        toNumber(initialData.cardio),
        toNumber(initialData.endurance),
        toNumber(initialData.flexibility),
        toNumber(initialData.body),
        toNumber(initialData.stability),
      ]
    : null;

  // 차트 데이터 구성
  const datasets: any[] = [
    {
      label: "현재 평가",
      data: currentData,
      backgroundColor: "rgba(59, 130, 246, 0.2)",
      borderColor: "rgba(59, 130, 246, 1)",
      borderWidth: 2,
      pointBackgroundColor: "rgba(59, 130, 246, 1)",
      pointBorderColor: "#fff",
      pointHoverBackgroundColor: "#fff",
      pointHoverBorderColor: "rgba(59, 130, 246, 1)",
      pointRadius: showScores ? 4 : 3,
    },
  ];

  // 초기 평가 데이터 추가
  if (hasInitialData && initialDataArray) {
    datasets.push({
      label: "초기 평가",
      data: initialDataArray,
      backgroundColor: "rgba(156, 163, 175, 0.1)",
      borderColor: "rgba(156, 163, 175, 0.6)",
      borderWidth: 2,
      borderDash: [5, 5], // 점선 스타일
      pointBackgroundColor: "rgba(156, 163, 175, 0.6)",
      pointBorderColor: "#fff",
      pointHoverBackgroundColor: "#fff",
      pointHoverBorderColor: "rgba(156, 163, 175, 0.6)",
      pointRadius: showScores ? 4 : 3,
    });
  }

  const chartData = {
    labels,
    datasets,
  };

  // 점수 표시를 위한 커스텀 플러그인
  const scoreLabelPlugin: Plugin<"radar"> = {
    id: "scoreLabel",
    afterDatasetsDraw: (chart) => {
      if (!showScores) return;

      const ctx = chart.ctx;
      const meta = chart.getDatasetMeta(0);
      const scale = chart.scales.r;

      ctx.save();
      ctx.font = "bold 12px sans-serif";
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      meta.data.forEach((point, index) => {
        const value = currentData[index];
        if (value > 0) {
          // 점수 표시 위치 계산 (점에서 약간 바깥쪽)
          const angle = (Math.PI * 2 * index) / labels.length - Math.PI / 2;
          // RadialScale 타입으로 캐스팅
          const radialScale = scale as any;
          const radius =
            (radialScale.getDistanceFromCenterForValue?.(value) ||
              (value / 100) *
                (Math.min(chart.chartArea.width, chart.chartArea.height) / 2)) +
            15;
          const x =
            chart.chartArea.left +
            chart.chartArea.width / 2 +
            Math.cos(angle) * radius;
          const y =
            chart.chartArea.top +
            chart.chartArea.height / 2 +
            Math.sin(angle) * radius;

          // 배경 원 그리기
          ctx.beginPath();
          ctx.arc(x, y, 12, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(15, 17, 21, 0.9)";
          ctx.fill();
          ctx.strokeStyle = "rgba(59, 130, 246, 1)";
          ctx.lineWidth = 1;
          ctx.stroke();

          // 점수 텍스트 그리기
          ctx.fillStyle = "#fff";
          ctx.fillText(value.toFixed(0), x, y);
        }
      });

      ctx.restore();
    },
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        min: 0,
        ticks: {
          stepSize: 20,
          color: "#9ca3af",
          font: {
            size: 10,
          },
          backdropColor: "transparent",
        },
        grid: {
          color: "#374151",
        },
        pointLabels: {
          color: "#c9c7c7",
          font: {
            size: 12,
            weight: "bold" as const,
          },
        },
      },
    },
    plugins: {
      legend: {
        display: hasInitialData && showComparison,
        position: "bottom" as const,
        labels: {
          color: "#c9c7c7",
          font: {
            size: 12,
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: "circle" as const,
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 17, 21, 0.95)",
        titleColor: "#c9c7c7",
        bodyColor: "#fff",
        borderColor: "#374151",
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          title: function (context: any) {
            return context[0].label;
          },
          label: function (context: any) {
            const datasetLabel = context.dataset.label || "능력치";
            const value = context.parsed.r.toFixed(1);
            let label = `${datasetLabel}: ${value}점`;

            // 초기 평가와 비교 정보 추가
            if (
              hasInitialData &&
              context.datasetIndex === 0 &&
              initialDataArray
            ) {
              const initialValue = initialDataArray[context.dataIndex];
              const diff = currentData[context.dataIndex] - initialValue;
              const diffPercent =
                initialValue > 0
                  ? ((diff / initialValue) * 100).toFixed(1)
                  : "0.0";
              const diffSign = diff >= 0 ? "+" : "";
              label += ` (초기 대비 ${diffSign}${diff.toFixed(
                1
              )}점, ${diffSign}${diffPercent}%)`;
            }

            return label;
          },
        },
      },
    },
  };

  const indicatorData = [
    { label: "하체 근력", value: toNumber(data.strength) },
    { label: "심폐 지구력", value: toNumber(data.cardio) },
    { label: "근지구력", value: toNumber(data.endurance) },
    { label: "유연성", value: toNumber(data.flexibility) },
    { label: "체성분 밸런스", value: toNumber(data.body) },
    { label: "부상 안정성", value: toNumber(data.stability) },
  ];

  return (
    <Card title={title} className="bg-[#0f1115]">
      <div className="w-full h-[400px] relative">
        <Radar
          data={chartData}
          options={chartOptions}
          plugins={[scoreLabelPlugin]}
        />
      </div>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
        {indicatorData.map((item, index) => {
          const initialValue =
            hasInitialData && initialDataArray ? initialDataArray[index] : null;
          const diff = initialValue !== null ? item.value - initialValue : null;

          return (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-[#c9c7c7]">{item.label}:</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold">
                  {item.value.toFixed(1)}
                </span>
                {diff !== null && diff !== 0 && (
                  <span
                    className={`text-xs font-medium ${
                      diff > 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    ({diff > 0 ? "+" : ""}
                    {diff.toFixed(1)})
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {hasInitialData && (
        <div className="mt-3 pt-3 border-t border-[#374151]">
          <p className="text-xs text-[#9ca3af] text-center">
            초기 평가와 비교하여 변화를 확인할 수 있습니다. (점선: 초기 평가)
          </p>
        </div>
      )}
    </Card>
  );
}
