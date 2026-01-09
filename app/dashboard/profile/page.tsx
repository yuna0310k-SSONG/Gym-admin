"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useToast } from "@/providers/ToastProvider";
import { useAuth } from "@/lib/hooks/useAuth";
import { authApi } from "@/lib/api/auth";
import { useForm } from "react-hook-form";

interface ProfileFormData {
  name: string;
  email: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  // user가 변경되면 폼 값 업데이트
  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    try {
      setIsSaving(true);

      let updatedUser;
      
      try {
        // 사용자 정보 업데이트 API 호출
        updatedUser = await authApi.updateProfile({
          name: data.name,
          email: data.email,
        });
      } catch (apiError: any) {
        // 백엔드 API가 없는 경우 클라이언트 측에서만 업데이트
        if (
          apiError?.message?.includes("구현되지 않았습니다") ||
          apiError?.message?.includes("404") ||
          apiError?.message?.includes("Cannot")
        ) {
          // 클라이언트 측에서만 업데이트 (임시)
          updatedUser = {
            ...user,
            name: data.name,
            email: data.email,
          };
        } else {
          throw apiError;
        }
      }

      // localStorage 업데이트
      if (updatedUser) {
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } else {
        // API 응답이 없으면 클라이언트 측에서만 업데이트
        updatedUser = {
          ...user,
          name: data.name,
          email: data.email,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      // 사용자 정보 새로고침 (헤더에 즉시 반영)
      await refreshUser();

      showSuccess("사용자 정보가 업데이트되었습니다.");
    } catch (error) {
      console.error("프로필 업데이트 실패:", error);
      showError(
        error instanceof Error
          ? error.message
          : "사용자 정보 업데이트에 실패했습니다."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[#c9c7c7]">사용자 정보를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <div className="mb-4 sm:mb-6">
        <Link
          href="/dashboard"
          className="text-blue-400 hover:text-blue-300 text-sm mb-2 inline-block"
        >
          ← 대시보드로 돌아가기
        </Link>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
          내 정보 수정
        </h1>
      </div>

      <Card title="프로필 정보" className="bg-[#0f1115]">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="이름"
            {...register("name", { required: "이름을 입력해주세요" })}
            error={errors.name?.message}
          />
          <Input
            label="이메일"
            type="email"
            {...register("email", {
              required: "이메일을 입력해주세요",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "올바른 이메일 형식이 아닙니다",
              },
            })}
            error={errors.email?.message}
          />

          <div className="pt-4 border-t border-[#374151]">
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#9ca3af] mb-2">
                역할
              </label>
              <p className="text-[#e5e7eb]">{user.role}</p>
            </div>
            {user.isApproved !== undefined && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#9ca3af] mb-2">
                  승인 상태
                </label>
                <p className="text-[#e5e7eb]">
                  {user.isApproved ? "승인됨" : "승인 대기 중"}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Link href="/dashboard">
              <Button type="button" variant="outline">
                취소
              </Button>
            </Link>
            <Button type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? "저장 중..." : "저장"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

