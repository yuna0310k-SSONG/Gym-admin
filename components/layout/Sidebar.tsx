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

const navigation: NavItem[] = [];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <>
      {/* Sidebar - 기본적으로 숨김, 메뉴 버튼 클릭 시에만 표시 */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${!isOpen ? "pointer-events-none" : ""}`}
      >
        <div className="p-6 flex justify-between items-center border-b border-gray-200">
          <h2 className="text-gray-900 text-xl font-bold">메뉴</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 p-2 rounded-md hover:bg-gray-100 transition-colors"
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
        {navigation.length > 0 && (
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
                        ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
          </nav>
        )}
      </div>
    </>
  );
}
