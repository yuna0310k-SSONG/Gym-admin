"use client";

import { useState, useRef, useEffect } from "react";
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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleProfileClick = () => {
    router.push("/dashboard/profile");
    setShowUserMenu(false);
  };

  // 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

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
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="hidden sm:flex items-center space-x-2 text-sm text-[#9ca3af] hover:text-[#e5e7eb] px-3 py-2 rounded-md hover:bg-[#1a1d24] transition-colors"
                  >
                    <span>{user.name}</span>
                    <span className="text-xs">({user.role})</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        showUserMenu ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* 드롭다운 메뉴 */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#1a1d24] border border-[#374151] rounded-lg shadow-lg z-50">
                      <div className="py-1">
                        <button
                          onClick={handleProfileClick}
                          className="w-full text-left px-4 py-2 text-sm text-[#e5e7eb] hover:bg-[#0f1115] transition-colors"
                        >
                          내 정보 수정
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#0f1115] transition-colors"
                        >
                          로그아웃
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 모바일: 로그아웃 버튼만 표시 */}
              {isAuthenticated && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="sm:hidden"
                >
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
