"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function AuthGuard({
  children,
  requireAuth = true,
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, loading, user } = useAuth();
  const [isApprovalPendingPage, setIsApprovalPendingPage] = useState(false);

  useEffect(() => {
    setIsApprovalPendingPage(pathname === "/dashboard/approval-pending");
  }, [pathname]);

  useEffect(() => {
    if (!loading && requireAuth && !isAuthenticated) {
      router.push("/login");
      return;
    }

    // 승인 대기 페이지에서는 리다이렉트하지 않음
    if (isApprovalPendingPage) {
      return;
    }

    // 트레이너인 경우 승인 여부가 false(혹은 undefined/null)이면 모두 "승인 대기"로 처리
    if (!loading && isAuthenticated && user && user.role === "TRAINER") {
      if (
        user.isApproved === false ||
        user.isApproved === undefined ||
        user.isApproved === null
      ) {
        router.push("/dashboard/approval-pending");
        return;
      }
    }
  }, [isAuthenticated, loading, requireAuth, router, user, isApprovalPendingPage]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1115]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e5e7eb] mx-auto"></div>
          <p className="mt-4 text-[#9ca3af]">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // 승인 대기 페이지에서는 항상 렌더링 허용
  if (isApprovalPendingPage) {
    return <>{children}</>;
  }

  // 트레이너인데 승인 대기 상태인 경우 아무것도 렌더링하지 않음 (리다이렉트 중)
  if (isAuthenticated && user && user.role === "TRAINER") {
    if (
      user.isApproved === false ||
      user.isApproved === undefined ||
      user.isApproved === null
    ) {
      return null;
    }
  }

  return <>{children}</>;
}

