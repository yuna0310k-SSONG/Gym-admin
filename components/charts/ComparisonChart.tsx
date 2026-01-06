import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ComparisonMetric = {
  label: string;
  member: number;
  average: number;
  percentile?: number;
};

interface ComparisonChartProps {
  data: ComparisonMetric[];
  height?: number;
  title?: string;
}

export default function ComparisonChart({
  data,
  height = 320,
  title = "평균 비교",
}: ComparisonChartProps) {
  const formatted = data.map((item) => ({
    name: item.label,
    회원: item.member,
    평균: item.average,
    백분위: item.percentile ?? null,
  }));

  return (
    <div className="w-full rounded-xl bg-[#0f1115] border border-[#1f2937] p-4 text-[#e5e7eb]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[#e5e7eb]">{title}</h3>
        <span className="text-xs text-[#9ca3af]">
          회원 vs 전체 평균 (Recharts)
        </span>
      </div>
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer>
          <BarChart data={formatted} stackOffset="none">
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 12 }} />
            <YAxis
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              axisLine={{ stroke: "#1f2937" }}
              tickLine={{ stroke: "#1f2937" }}
            />
            <Tooltip
              contentStyle={{
                background: "#111827",
                border: "1px solid #1f2937",
                color: "#e5e7eb",
              }}
              labelStyle={{ color: "#e5e7eb" }}
            />
            <Legend wrapperStyle={{ color: "#e5e7eb" }} />
            <Bar dataKey="회원" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="평균" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 text-xs text-[#9ca3af]">
        * 백분위는 툴팁에서 확인하세요 (필드가 제공된 경우).
      </div>
    </div>
  );
}
