"use client";

import { useForm } from "react-hook-form";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import type { CreateInjuryRequest } from "@/types/api/requests";

interface InjuryFormProps {
  onSubmit: (data: CreateInjuryRequest) => void | Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<CreateInjuryRequest>;
}

export default function InjuryForm({ onSubmit, onCancel, initialData }: InjuryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateInjuryRequest>({
    defaultValues: initialData || {
      date: new Date().toISOString().split("T")[0],
      severity: "MILD",
      recoveryStatus: "RECOVERING",
    },
  });

  return (
    <Card title="부상 이력 등록" className="bg-[#0f1115]">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="부상 유형"
          {...register("injuryType", { required: "부상 유형을 입력해주세요" })}
          error={errors.injuryType?.message}
        />
        <Input
          label="부상 부위"
          {...register("bodyPart", { required: "부상 부위를 입력해주세요" })}
          error={errors.bodyPart?.message}
        />
        <Input
          label="부상 날짜"
          type="date"
          {...register("date", { required: "부상 날짜를 선택해주세요" })}
          error={errors.date?.message}
        />
        <div>
          <label className="block text-sm font-medium text-[#c9c7c7] mb-2">
            심각도
          </label>
          <select
            {...register("severity", { required: "심각도를 선택해주세요" })}
            className="w-full px-3 py-2 bg-[#1a1d24] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="MILD">경미</option>
            <option value="MODERATE">보통</option>
            <option value="SEVERE">심각</option>
          </select>
          {errors.severity && (
            <p className="mt-1 text-sm text-red-400">{errors.severity.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-[#c9c7c7] mb-2">
            회복 상태
          </label>
          <select
            {...register("recoveryStatus", { required: "회복 상태를 선택해주세요" })}
            className="w-full px-3 py-2 bg-[#1a1d24] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="RECOVERED">회복됨</option>
            <option value="RECOVERING">회복 중</option>
            <option value="CHRONIC">만성</option>
          </select>
          {errors.recoveryStatus && (
            <p className="mt-1 text-sm text-red-400">{errors.recoveryStatus.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-[#c9c7c7] mb-2">
            설명 (선택)
          </label>
          <textarea
            {...register("description")}
            rows={4}
            className="w-full px-3 py-2 bg-[#1a1d24] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="부상에 대한 상세 설명을 입력해주세요"
          />
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              취소
            </Button>
          )}
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "등록 중..." : "등록"}
          </Button>
        </div>
      </form>
    </Card>
  );
}



