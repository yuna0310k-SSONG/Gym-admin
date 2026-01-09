"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function QuickActionButton() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercentage =
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      setIsVisible(scrollPercentage >= 30);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // 초기 체크

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        {/* 메뉴 (hover 시 표시) */}
        {isMenuOpen && (
          <div className="absolute bottom-16 right-0 mb-2 bg-[#1a1d24] border border-[#374151] rounded-lg shadow-lg min-w-[140px]">
            <Link
              href="/dashboard/members/new"
              className="block px-4 py-2 text-sm text-[#e5e7eb] hover:bg-[#0f1115] transition-colors rounded-t-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              회원 추가
            </Link>
            <div className="border-t border-[#374151]">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  // 평가 등록은 회원 선택이 필요하므로 회원 목록으로 이동
                  router.push("/dashboard/members");
                }}
                className="block w-full text-left px-4 py-2 text-sm text-[#e5e7eb] hover:bg-[#0f1115] transition-colors rounded-b-lg"
              >
                평가 등록
              </button>
            </div>
          </div>
        )}

        {/* FAB 버튼 */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          onMouseEnter={() => setIsMenuOpen(true)}
          onMouseLeave={() => setIsMenuOpen(false)}
          className="w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

