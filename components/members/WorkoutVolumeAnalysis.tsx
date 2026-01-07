"use client";

import { useQuery } from "@tanstack/react-query";
import Card from "@/components/ui/Card";
import { workoutRecordApi } from "@/lib/api/workout-records";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface WorkoutVolumeAnalysisProps {
  memberId: string;
}

export default function WorkoutVolumeAnalysis({
  memberId,
}: WorkoutVolumeAnalysisProps) {
  const { data: analysisData, isLoading } = useQuery({
    queryKey: ["workout-volume-analysis", memberId],
    queryFn: () =>
      workoutRecordApi.getVolumeAnalysis(memberId, {
        period: undefined, // 주간, 월간 둘 다 조회
      }),
    enabled: !!memberId,
  });

  if (isLoading) {
    return (
      <Card title="운동 기록 분석" className="bg-[#0f1115]">
        <div className="flex items-center justify-center h-64">
          <p className="text-[#c9c7c7]">로딩 중...</p>
        </div>
      </Card>
    );
  }

  if (!analysisData) {
    return (
      <Card title="운동 기록 분석" className="bg-[#0f1115]">
        <div className="text-center py-8">
          <p className="text-[#9ca3af]">운동 기록 데이터가 없습니다.</p>
        </div>
      </Card>
    );
  }

  const weeklyChartData = analysisData.weekly
    ? {
        labels: analysisData.weekly.bodyPartVolumes.map((v) => v.bodyPart),
        datasets: [
          {
            label: "주간 볼륨 (kg)",
            data: analysisData.weekly.bodyPartVolumes.map((v) => v.totalVolume),
            backgroundColor: "rgba(59, 130, 246, 0.6)",
            borderColor: "rgba(59, 130, 246, 1)",
            borderWidth: 1,
          },
        ],
      }
    : null;

  const monthlyChartData = analysisData.monthly
    ? {
        labels: analysisData.monthly.bodyPartVolumes.map((v) => v.bodyPart),
        datasets: [
          {
            label: "월간 볼륨 (kg)",
            data: analysisData.monthly.bodyPartVolumes.map((v) => v.totalVolume),
            backgroundColor: "rgba(34, 197, 94, 0.6)",
            borderColor: "rgba(34, 197, 94, 1)",
            borderWidth: 1,
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
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
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: "#9ca3af",
        },
        grid: {
          color: "#374151",
        },
      },
      x: {
        ticks: {
          color: "#9ca3af",
        },
        grid: {
          color: "#374151",
        },
      },
    },
  };

  return (
    <Card title="운동 기록 분석" className="bg-[#0f1115]">
      <div className="space-y-6">
        {weeklyChartData && analysisData.weekly && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              주간 분석 ({analysisData.weekly.startDate} ~{" "}
              {analysisData.weekly.endDate})
            </h3>
            <div className="h-64">
              <Bar data={weeklyChartData} options={chartOptions} />
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {analysisData.weekly.bodyPartVolumes.map((volume) => (
                <div
                  key={volume.bodyPart}
                  className="p-3 bg-[#1a1d24] rounded-lg"
                >
                  <p className="text-sm text-[#c9c7c7]">{volume.bodyPart}</p>
                  <p className="text-xl font-semibold text-white">
                    {volume.totalVolume.toFixed(0)}kg
                  </p>
                  <p className="text-xs text-[#9ca3af]">
                    {volume.totalSets}세트, {volume.totalReps}회
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {monthlyChartData && analysisData.monthly && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              월간 분석 ({analysisData.monthly.startDate} ~{" "}
              {analysisData.monthly.endDate})
            </h3>
            <div className="h-64">
              <Bar data={monthlyChartData} options={chartOptions} />
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {analysisData.monthly.bodyPartVolumes.map((volume) => (
                <div
                  key={volume.bodyPart}
                  className="p-3 bg-[#1a1d24] rounded-lg"
                >
                  <p className="text-sm text-[#c9c7c7]">{volume.bodyPart}</p>
                  <p className="text-xl font-semibold text-white">
                    {volume.totalVolume.toFixed(0)}kg
                  </p>
                  <p className="text-xs text-[#9ca3af]">
                    {volume.totalSets}세트, {volume.totalReps}회
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

