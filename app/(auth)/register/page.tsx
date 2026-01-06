"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { authApi } from "@/lib/api/auth";
import type { RegisterRequest } from "@/types/api/requests";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterRequest & { confirmPassword: string }>({
    defaultValues: {
      role: "MEMBER",
    },
  });

  const password = watch("password");

  const onSubmit = async (
    data: RegisterRequest & { confirmPassword: string }
  ) => {
    setError("");
    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = data;
      await authApi.register(registerData);
      router.push("/login?registered=true");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "회원가입에 실패했습니다. 다시 시도해주세요."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-[#e5e7eb] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs tracking-[0.35em] text-[#6b7280] mb-3">
            ADMIN PLATFORM
          </p>
          <h2 className="text-3xl font-medium tracking-tight">회원가입</h2>
        </div>

        {/* Form */}
        <Card className="bg-transparent border-none shadow-none p-0">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="text-sm text-[#f87171] leading-relaxed">
                {error}
              </div>
            )}

            {/* 이름 */}
            <div className="[&>label]:text-[#9ca3af]">
              <Input
                label="이름"
                {...register("name", {
                  required: "이름을 입력해주세요",
                  minLength: {
                    value: 2,
                    message: "이름은 최소 2자 이상이어야 합니다",
                  },
                })}
                error={errors.name?.message}
                className="bg-[#111827] border-[#374151] text-[#f9fafb]"
              />
            </div>

            {/* 이메일 */}
            <div className="[&>label]:text-[#9ca3af]">
              <Input
                label="이메일"
                type="email"
                autoComplete="email"
                {...register("email", {
                  required: "이메일을 입력해주세요",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "올바른 이메일 형식이 아닙니다",
                  },
                })}
                error={errors.email?.message}
                className="bg-[#111827] border-[#374151] text-[#f9fafb]"
              />
            </div>

            {/* 비밀번호 */}
            <div className="[&>label]:text-[#9ca3af]">
              <Input
                label="비밀번호"
                type="password"
                autoComplete="new-password"
                {...register("password", {
                  required: "비밀번호를 입력해주세요",
                  minLength: {
                    value: 6,
                    message: "비밀번호는 최소 6자 이상이어야 합니다",
                  },
                })}
                error={errors.password?.message}
                className="bg-[#111827] border-[#374151] text-[#f9fafb]"
              />
            </div>

            {/* 비밀번호 확인 */}
            <div className="[&>label]:text-[#9ca3af]">
              <Input
                label="비밀번호 확인"
                type="password"
                autoComplete="new-password"
                {...register("confirmPassword", {
                  required: "비밀번호 확인을 입력해주세요",
                  validate: (value) =>
                    value === password || "비밀번호가 일치하지 않습니다",
                })}
                error={errors.confirmPassword?.message}
                className="bg-[#111827] border-[#374151] text-[#f9fafb]"
              />
            </div>

            {/* 역할 */}
            <div>
              <label className="block text-sm text-[#9ca3af] mb-1">역할</label>
              <select
                {...register("role", { required: true })}
                className="
                  w-full px-3 py-2
                  bg-[#0f1115]
                  border border-[#374151]
                  rounded-lg
                  text-[#e5e7eb]
                  focus:outline-none
                  focus:ring-1 focus:ring-[#6b7280]
                "
              >
                <option value="MEMBER">회원</option>
                <option value="TRAINER">트레이너</option>
                <option value="ADMIN">관리자</option>
              </select>
            </div>

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
              {loading ? "가입 중..." : "Register →"}
            </Button>
          </form>
        </Card>

        {/* Footer */}
        <div className="mt-12 flex justify-between text-sm text-[#9ca3af]">
          <Link href="/login" className="hover:text-white transition">
            로그인
          </Link>
          <Link href="/" className="hover:text-white transition">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
