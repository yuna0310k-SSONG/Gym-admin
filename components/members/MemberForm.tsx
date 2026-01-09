"use client";

import { useForm } from "react-hook-form";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import type { CreateMemberRequest } from "@/types/api/requests";
import type { Member } from "@/types/api/responses";
import { onlyDigits, formatPhoneNumberKR } from "@/lib/utils/phone";

interface MemberFormProps {
  member?: Member;
  onSubmit: (data: CreateMemberRequest) => void | Promise<void>;
  onCancel?: () => void;
}

export default function MemberForm({
  member,
  onSubmit,
  onCancel,
}: MemberFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateMemberRequest>({
    defaultValues: member
      ? {
          name: member.name,
          email: member.email,
          phone: formatPhoneNumberKR(member.phone), // 기존 값도 하이픈 형식으로 표시
          joinDate: member.joinDate.split("T")[0],
          birthDate: member.birthDate
            ? member.birthDate.split("T")[0]
            : undefined,
          height: member.height,
          weight: member.weight,
          gender: member.gender,
          status: member.status, // 상태도 기본값에 포함
        }
      : {
          joinDate: new Date().toISOString().split("T")[0],
          status: "ACTIVE", // 새 회원 등록 시 기본값
        },
  });

  return (
    <Card
      title={member ? "회원 정보 수정" : "회원 등록"}
      className="bg-[#0f1115]"
    >
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
        {(() => {
          const phoneField = register("phone", {
            required: "전화번호를 입력해주세요",
            validate: (value) => {
              const digits = onlyDigits(String(value ?? ""));
              if (digits.length === 0) return "전화번호를 입력해주세요";
              if (digits.length !== 10 && digits.length !== 11) {
                return "전화번호는 10~11자리로 입력해주세요";
              }
              return true;
            },
            setValueAs: (value) => {
              // 저장 시 숫자만 저장
              return onlyDigits(String(value ?? ""));
            },
          });

          return (
            <div className="space-y-1">
              <Input
                label="전화번호"
                type="tel"
                inputMode="numeric"
                placeholder="010-2222-2222"
                maxLength={13}
                {...phoneField}
                onChange={(e) => {
                  const digits = onlyDigits(e.target.value).slice(0, 11);
                  // 입력 중에는 하이픈이 포함된 형식으로 표시
                  const formatted = formatPhoneNumberKR(digits);
                  e.target.value = formatted;
                  // react-hook-form에는 숫자만 전달
                  phoneField.onChange({
                    ...e,
                    target: { ...e.target, value: digits },
                  });
                }}
                error={errors.phone?.message}
              />
              <p className="text-xs text-[#9ca3af]">
                전화번호를 입력하면 자동으로 하이픈이 추가됩니다
              </p>
            </div>
          );
        })()}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="생년월일"
            type="date"
            {...register("birthDate")}
            error={errors.birthDate?.message}
          />
          <Input
            label="가입일"
            type="date"
            {...register("joinDate", { required: "가입일을 선택해주세요" })}
            error={errors.joinDate?.message}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="키 (cm)"
            type="number"
            step="0.1"
            placeholder="예: 175.5"
            {...register("height", {
              valueAsNumber: true,
              min: { value: 50, message: "키는 50cm 이상이어야 합니다." },
              max: { value: 250, message: "키는 250cm 이하여야 합니다." },
            })}
            error={errors.height?.message}
          />
          <Input
            label="몸무게 (kg)"
            type="number"
            step="0.1"
            placeholder="예: 70.5"
            {...register("weight", {
              valueAsNumber: true,
              min: { value: 20, message: "몸무게는 20kg 이상이어야 합니다." },
              max: { value: 300, message: "몸무게는 300kg 이하여야 합니다." },
            })}
            error={errors.weight?.message}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#c9c7c7] mb-2">
            성별
          </label>
          <select
            {...register("gender")}
            className="w-full px-3 py-2 bg-[#1a1d24] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">선택 안함</option>
            <option value="MALE">남성</option>
            <option value="FEMALE">여성</option>
          </select>
          {errors.gender && (
            <p className="mt-1 text-sm text-red-400">{errors.gender.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-[#c9c7c7] mb-2">
            상태
          </label>
          <select
            {...register("status")}
            className="w-full px-3 py-2 bg-[#1a1d24] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue={member?.status || "ACTIVE"}
          >
            <option value="ACTIVE">활성</option>
            <option value="INACTIVE">비활성</option>
            <option value="SUSPENDED">정지</option>
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-400">
              {errors.status.message}
            </p>
          )}
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              취소
            </Button>
          )}
          <Button type="submit" variant="primary">
            {member ? "수정" : "등록"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
