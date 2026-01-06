"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { authApi } from "@/lib/api/auth";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (searchParams?.get("registered") === "true") {
      setSuccessMessage("회원가입이 완료되었습니다. 로그인해주세요.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authApi.login({ email, password });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      localStorage.setItem("user", JSON.stringify(response.data.user));

      router.push("/dashboard/members");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1115] px-6">
      <div className="w-full max-w-sm text-[#e5e7eb]">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs tracking-[0.35em] text-[#6b7280] mb-3">
            ADMIN PLATFORM
          </p>
          <h2 className="text-3xl font-medium tracking-tight text-[#f9fafb]">
            로그인
          </h2>
        </div>

        {/* Form */}
        <Card className="bg-[#0f1115] border-none shadow-none p-0">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {successMessage && (
              <div className="text-sm text-[#9ca3af] leading-relaxed">
                {successMessage}
              </div>
            )}

            {error && (
              <div className="text-sm text-[#f87171] leading-relaxed">
                {error}
              </div>
            )}

            <Input
              label="이메일"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-[#111827] border-[#374151] text-[#f9fafb]"
            />

            <Input
              label="비밀번호"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-[#111827] border-[#374151] text-[#f9fafb]"
            />

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="
                w-full
                bg-[#e5e7eb]
                text-[#0f1115]
                py-2.5
                hover:bg-[#d1d5db]
                focus:ring-2 focus:ring-[#9ca3af]
                transition-colors
              "
            >
              {loading ? "로그인 중..." : "Login →"}
            </Button>
          </form>
        </Card>

        {/* Footer */}
        <div className="mt-12 flex justify-between text-sm text-[#9ca3af]">
          <Link href="/register" className="hover:text-white transition">
            회원가입
          </Link>
          <Link href="/" className="hover:text-white transition">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
