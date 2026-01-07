"use client";

import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
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

  // 차트 데이터 구성
  const chartData = {
    labels: [
      "하체 근력",
      "심폐 지구력",
      "근지구력",
      "유연성",
      "체성분 밸런스",
      "부상 안정성",
    ],
    datasets: [
      {
        label: "능력치",
        data: [
          toNumber(data.strength),
          toNumber(data.cardio),
          toNumber(data.endurance),
          toNumber(data.flexibility),
          toNumber(data.body),
          toNumber(data.stability),
        ],
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(59, 130, 246, 1)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(59, 130, 246, 1)",
      },
    ],
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
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(15, 17, 21, 0.9)",
        titleColor: "#c9c7c7",
        bodyColor: "#fff",
        borderColor: "#374151",
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function (context: any) {
            return `${context.label}: ${context.parsed.r.toFixed(1)}`;
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
      <div className="w-full h-[400px]">
        <Radar data={chartData} options={chartOptions} />
      </div>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
        {indicatorData.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <span className="text-[#c9c7c7]">{item.label}:</span>
            <span className="text-white font-semibold">
              {item.value.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

