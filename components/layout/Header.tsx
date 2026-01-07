"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { useAuth } from "@/lib/hooks/useAuth";

export default function Header() {
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
            <Link
              href="/dashboard/members"
              className="text-xl font-bold text-[#f9fafb]"
            >
              헬스장 회원관리
            </Link>

            <nav className="flex items-center space-x-4">
              <Link
                href="/dashboard/members"
                className="text-[#9ca3af] hover:text-[#e5e7eb] px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                회원 관리
              </Link>

              {isAuthenticated && user && (
                <span className="text-sm text-[#9ca3af]">
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
