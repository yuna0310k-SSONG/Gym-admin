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
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/dashboard/members" className="text-xl font-bold text-gray-900">
            헬스장 회원관리
          </Link>
          <nav className="flex items-center space-x-4">
            <Link
              href="/dashboard/members"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              회원 관리
            </Link>
            {isAuthenticated && user && (
              <span className="text-sm text-gray-600">
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
    </header>
  );
}

