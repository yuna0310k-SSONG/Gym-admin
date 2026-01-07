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

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation: NavItem[] = [
  { name: "대시보드", href: "/dashboard" },
  { name: "회원 관리", href: "/dashboard/members" },
  { name: "인사이트", href: "/dashboard/insights" },
  { name: "트레이너 관리", href: "/dashboard/trainers", adminOnly: true },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <>
      {/* Sidebar - 기본적으로 숨김, 메뉴 버튼 클릭 시에만 표시 */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#0f1115] border-r border-[#374151] z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${!isOpen ? "pointer-events-none" : ""}`}
      >
        <div className="p-6 flex justify-between items-center border-b border-[#374151]">
          <h2 className="text-[#f9fafb] text-xl font-bold">메뉴</h2>
          <button
            onClick={onClose}
            className="text-[#9ca3af] hover:text-[#e5e7eb] p-2 rounded-md hover:bg-[#1a1d24] transition-colors"
            aria-label="메뉴 닫기"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <nav className="mt-6">
          {navigation
            .filter((item) => {
              if (item.adminOnly && user?.role !== "ADMIN") {
                return false;
              }
              return true;
            })
            .map((item) => {
              let isActive = false;
              if (item.href === "/dashboard") {
                isActive = pathname === "/dashboard";
              } else {
                isActive =
                  pathname === item.href ||
                  pathname?.startsWith(item.href + "/");
              }
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
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
    </>
  );
}
