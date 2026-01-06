"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function ApprovalPendingPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1115] px-6">
      <Card className="bg-[#0f1115] max-w-md w-full">
        <div className="text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-yellow-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              승인 대기 중입니다
            </h1>
            <p className="text-[#9ca3af] mb-4">
              관리자의 승인을 기다리고 있습니다.
            </p>
          </div>

          <div className="bg-[#1a1d24] rounded-lg p-4 mb-6">
            <div className="text-left space-y-2">
              <div>
                <span className="text-[#9ca3af] text-sm">이름:</span>
                <p className="text-white font-semibold">{user?.name}</p>
              </div>
              <div>
                <span className="text-[#9ca3af] text-sm">이메일:</span>
                <p className="text-white font-semibold">{user?.email}</p>
              </div>
              <div>
                <span className="text-[#9ca3af] text-sm">역할:</span>
                <p className="text-white font-semibold">트레이너</p>
              </div>
            </div>
          </div>

          <p className="text-[#9ca3af] text-sm mb-6">
            트레이너 승인 심사 중입니다. 현재는 대시보드 이용이 제한됩니다.
            <br />
            자세한 사항은 관리자에게 문의해주세요.
          </p>

          <Button variant="outline" onClick={handleLogout} className="w-full">
            로그아웃
          </Button>
        </div>
      </Card>
    </div>
  );
}
