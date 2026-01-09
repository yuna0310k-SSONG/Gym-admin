"use client";

import { useState } from "react";
import React from "react";
import { useForm } from "react-hook-form";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Radio from "@/components/ui/Radio";
import RadioGroup from "@/components/ui/RadioGroup";
import Checkbox from "@/components/ui/Checkbox";
import type {
  CreateMemberRequest,
  CreateAssessmentRequest,
  CreateInjuryRequest,
} from "@/types/api/requests";
import { onlyDigits, formatPhoneNumberKR } from "@/lib/utils/phone";

interface AssessmentFormData {
  assessedAt: string;
  bodyWeight?: number;
  condition?: "EXCELLENT" | "GOOD" | "NORMAL" | "POOR";
  trainerComment?: string;

  // 하체 근력
  strengthGrade: "A" | "B" | "C" | "D" | "";
  strengthAlternative?: "D-1" | "D-2" | "";

  // 심폐 지구력
  cardioGrade: "A" | "B" | "C" | "";
  recoverySpeed: string[];

  // 근지구력
  enduranceGrade: "A" | "B" | "C" | "";

  // 유연성
  flexibilityItems: {
    sitAndReach?: "A" | "B" | "C" | "";
    shoulder?: "A" | "B" | "C" | "";
    hip?: "A" | "B" | "C" | "";
    hamstring?: "A" | "B" | "C" | "";
  };

  // 체성분
  bodyWeightInput?: number;
  muscleMass?: number;
  fatMass?: number;
  bodyFatPercentage?: number;

  // 안정성
  ohsa: "A" | "B" | "C" | "";
  pain: "none" | "present" | "";
}

interface NewMemberFormData extends CreateMemberRequest {
  initialAssessment?: AssessmentFormData & {
    items?: CreateAssessmentRequest["items"];
  };
  injuries?: CreateInjuryRequest[];
}

interface NewMemberFormProps {
  onSubmit: (data: NewMemberFormData) => void | Promise<void>;
  onCancel?: () => void;
}

export default function NewMemberForm({
  onSubmit,
  onCancel,
}: NewMemberFormProps) {

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm<NewMemberFormData>({
    defaultValues: {
      joinDate: new Date().toISOString().split("T")[0],
      status: "ACTIVE",
    },
  });

  const onFormSubmit = async (data: NewMemberFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* 기본 정보 */}
      <Card title="기본 정보" className="bg-[#0f1115]">
        <div className="space-y-4">
          <Input
            label="이름"
            {...register("name", { required: "이름을 입력해주세요" })}
            error={errors.name?.message}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="생년월일"
              type="date"
              {...register("birthDate")}
              error={errors.birthDate?.message}
            />
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
          </div>
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
                  placeholder="010-1234-5678"
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
                  하이픈(-) 없이 숫자만 입력해주세요!
                </p>
              </div>
            );
          })()}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="가입일"
              type="date"
              {...register("joinDate", { required: "가입일을 선택해주세요" })}
              error={errors.joinDate?.message}
            />
            <div>
              <label className="block text-sm font-medium text-[#c9c7c7] mb-2">
                상태
              </label>
              <select
                {...register("status")}
                className="w-full px-3 py-2 bg-[#1a1d24] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue="ACTIVE"
              >
                <option value="ACTIVE">활성</option>
                <option value="INACTIVE">비활성</option>
                <option value="SUSPENDED">정지</option>
              </select>
            </div>
          </div>
        </div>
      </Card>


      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            취소
          </Button>
        )}
        <Button type="submit" variant="primary">
          등록
        </Button>
      </div>
    </form>
  );
}
