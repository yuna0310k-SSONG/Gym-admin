"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { useAuth } from "@/lib/hooks/useAuth";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="bg-[#0f1115] border-b border-[#374151]">
      <div className="px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              {/* 메뉴 버튼 (모든 화면 크기) */}
              <button
                onClick={onMenuClick}
                className="text-[#9ca3af] hover:text-[#e5e7eb] p-2 rounded-md hover:bg-[#1a1d24] transition-colors"
                aria-label="메뉴 열기"
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
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              <Link
                href="/dashboard/members"
                className="text-xl font-bold text-[#f9fafb]"
              >
                헬스장 회원관리
              </Link>
            </div>

            <nav className="flex items-center space-x-4">
              {isAuthenticated && user && (
                <span className="hidden sm:block text-sm text-[#9ca3af]">
                  {user.name} ({user.role})
                </span>
              )}

              {isAuthenticated && (
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  로그아웃
                </Button>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
