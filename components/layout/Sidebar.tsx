"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";

interface NavItem {
  name: string;
  href: string;
  icon?: string;
  adminOnly?: boolean;
}

const navigation: NavItem[] = [
  { name: "대시보드", href: "/dashboard" },
  { name: "회원 관리", href: "/dashboard/members" },
  { name: "인사이트", href: "/dashboard/insights" },
  { name: "트레이너 관리", href: "/dashboard/trainers", adminOnly: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <div className="w-64 bg-[#0f1115] border-r border-[#374151] min-h-screen">
      <div className="p-6">
        <h2 className="text-[#f9fafb] text-xl font-bold">메뉴</h2>
      </div>
      <nav className="mt-6">
        {navigation
          .filter((item) => {
            // Admin 전용 메뉴는 Admin만 볼 수 있음
            if (item.adminOnly && user?.role !== "ADMIN") {
              return false;
            }
            return true;
          })
          .map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-6 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#1a1d24] text-[#f9fafb] border-l-2 border-[#e5e7eb]"
                    : "text-[#9ca3af] hover:bg-[#1a1d24] hover:text-[#e5e7eb]"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
      </nav>
    </div>
  );
}

