"use client";

import Link from "next/link";
import clsx from "clsx";

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  pendingInitialAssessments: number;
  riskMembers: number;
}

interface Props {
  stats: DashboardStats;
  isLoading?: boolean;
}

const cards = [
  {
    key: "totalMembers",
    label: "총 회원 수",
    href: "/dashboard/members",
    icon: "👥",
    color: "border-blue-500/30 bg-blue-500/5 text-blue-400",
  },
  {
    key: "activeMembers",
    label: "활성 회원 수",
    href: "/dashboard/members?status=active",
    icon: "🟢",
    color: "border-green-500/30 bg-green-500/5 text-green-400",
  },
  {
    key: "pendingInitialAssessments",
    label: "초기 평가 미등록",
    href: "/dashboard/members",
    icon: "⚠️",
    color: "border-yellow-500/30 bg-yellow-500/5 text-yellow-400",
  },
  {
    key: "riskMembers",
    label: "위험 회원 수",
    href: "/dashboard/insights",
    icon: "🔺",
    color: "border-red-500/30 bg-red-500/5 text-red-400",
  },
];

export default function StatisticsCards({ stats, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 w-full">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[60px] rounded-md bg-white/5 animate-pulse"
          />
        ))}
      </div>
    );
  }

  const colorGradients = {
    totalMembers: "from-blue-500/20 via-cyan-500/10 to-blue-500/20",
    activeMembers: "from-green-500/20 via-emerald-500/10 to-green-500/20",
    pendingInitialAssessments:
      "from-yellow-500/20 via-amber-500/10 to-yellow-500/20",
    riskMembers: "from-red-500/20 via-rose-500/10 to-red-500/20",
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full">
      {cards.map((card, index) => {
        const value = stats[card.key as keyof DashboardStats];
        const gradient =
          colorGradients[card.key as keyof typeof colorGradients];

        return (
          <Link key={card.key} href={card.href}>
            <div
              className={clsx(
                "group cursor-pointer rounded-xl border px-4 py-3.5 relative overflow-hidden",
                "transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1",
                "backdrop-blur-md",
                card.color
              )}
              style={{
                animationDelay: `${index * 100}ms`,
                boxShadow:
                  "0 8px 16px -4px rgba(0, 0, 0, 0.3), 0 4px 8px -2px rgba(0, 0, 0, 0.2)",
              }}
            >
              {/* 그라데이션 배경 */}
              <div
                className={clsx(
                  "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                  gradient
                )}
              ></div>

              {/* 빛나는 효과 */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-base group-hover:scale-110 transition-transform duration-300">
                    {card.icon}
                  </span>
                  <span className="text-[11px] text-white/80 leading-tight font-medium">
                    {card.label}
                  </span>
                </div>
                <div
                  className="text-2xl font-extrabold text-white leading-none bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent group-hover:from-white group-hover:to-white transition-all duration-300"
                  style={{ letterSpacing: "-0.03em" }}
                >
                  {value.toLocaleString()}
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
