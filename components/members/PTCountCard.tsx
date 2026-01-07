"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { ptCountApi, type CreatePTUsageRequest } from "@/lib/api/pt-count";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

interface PTCountCardProps {
  memberId: string;
}

interface PTCountFormData {
  totalCount: number;
  remainingCount: number;
  usedCount: number;
}

export default function PTCountCard({ memberId }: PTCountCardProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: ptCount, isLoading } = useQuery({
    queryKey: ["pt-count", memberId],
    queryFn: () => ptCountApi.get(memberId),
    enabled: !!memberId,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PTCountFormData>({
    defaultValues: {
      totalCount: ptCount?.totalCount || 0,
      remainingCount: ptCount?.remainingCount || 0,
      usedCount: ptCount?.usedCount || 0,
    },
  });

  // ptCount가 변경되면 폼 값 업데이트
  useEffect(() => {
    if (ptCount) {
      reset({
        totalCount: ptCount.totalCount,
        remainingCount: ptCount.remainingCount,
        usedCount: ptCount.usedCount,
      });
    }
  }, [ptCount, reset]);

  const createOrUpdateMutation = useMutation({
    mutationFn: (data: CreatePTUsageRequest) =>
      ptCountApi.createOrUpdate(memberId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pt-count", memberId] });
      setShowEditModal(false);
    },
  });

  const handleSubmitForm = (data: PTCountFormData) => {
    createOrUpdateMutation.mutate({
      totalCount: data.totalCount,
      remainingCount: data.remainingCount,
      usedCount: data.usedCount,
    });
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    if (ptCount) {
      reset({
        totalCount: ptCount.totalCount,
        remainingCount: ptCount.remainingCount,
        usedCount: ptCount.usedCount,
      });
    }
  };

  if (isLoading) {
    return (
      <Card title="PT 횟수 관리" className="bg-[#0f1115]">
        <div className="flex items-center justify-center h-24">
          <p className="text-[#c9c7c7]">로딩 중...</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card title="PT 횟수 관리" className="bg-[#0f1115]">
        <div className="space-y-4">
          {ptCount ? (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-[#1a1d24] rounded-lg">
                  <p className="text-sm text-[#9ca3af] mb-2">총 횟수</p>
                  <p className="text-2xl font-bold text-white">
                    {ptCount.totalCount}
                  </p>
                </div>
                <div className="p-4 bg-[#1a1d24] rounded-lg">
                  <p className="text-sm text-[#9ca3af] mb-2">사용 횟수</p>
                  <p className="text-2xl font-bold text-red-400">
                    {ptCount.usedCount}
                  </p>
                </div>
                <div className="p-4 bg-[#1a1d24] rounded-lg">
                  <p className="text-sm text-[#9ca3af] mb-2">남은 횟수</p>
                  <p className="text-2xl font-bold text-green-400">
                    {ptCount.remainingCount}
                  </p>
                </div>
              </div>
              {ptCount.lastUsedDate && (
                <p className="text-xs text-[#9ca3af]">
                  마지막 사용일:{" "}
                  {new Date(ptCount.lastUsedDate).toLocaleDateString("ko-KR")}
                </p>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowEditModal(true)}
                className="w-full"
              >
                PT 횟수 수정
              </Button>
            </>
          ) : (
            <div className="text-center py-6">
              <p className="text-[#9ca3af] mb-4">PT 횟수가 설정되지 않았습니다.</p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowEditModal(true)}
              >
                PT 횟수 설정
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* PT 횟수 수정 모달 */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-[#1a1d24] rounded-lg p-6 max-w-md w-full mx-4 border border-[#374151]">
            <h3 className="text-lg font-semibold text-white mb-4">
              {ptCount ? "PT 횟수 수정" : "PT 횟수 설정"}
            </h3>
            <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-4">
              <Input
                label="총 횟수"
                type="number"
                min="0"
                {...register("totalCount", {
                  required: "총 횟수를 입력해주세요",
                  valueAsNumber: true,
                  min: { value: 0, message: "0 이상의 값을 입력해주세요" },
                })}
                error={errors.totalCount?.message}
              />
              <Input
                label="사용 횟수"
                type="number"
                min="0"
                {...register("usedCount", {
                  required: "사용 횟수를 입력해주세요",
                  valueAsNumber: true,
                  min: { value: 0, message: "0 이상의 값을 입력해주세요" },
                  validate: (value, formValues) => {
                    if (value > formValues.totalCount) {
                      return "사용 횟수는 총 횟수를 초과할 수 없습니다";
                    }
                    return true;
                  },
                })}
                error={errors.usedCount?.message}
              />
              <Input
                label="남은 횟수"
                type="number"
                min="0"
                {...register("remainingCount", {
                  required: "남은 횟수를 입력해주세요",
                  valueAsNumber: true,
                  min: { value: 0, message: "0 이상의 값을 입력해주세요" },
                  validate: (value, formValues) => {
                    const expectedRemaining =
                      formValues.totalCount - formValues.usedCount;
                    if (value !== expectedRemaining) {
                      return `남은 횟수는 총 횟수 - 사용 횟수(${expectedRemaining})와 일치해야 합니다`;
                    }
                    return true;
                  },
                })}
                error={errors.remainingCount?.message}
              />
              <div className="flex space-x-3 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={createOrUpdateMutation.isPending}
                >
                  {createOrUpdateMutation.isPending
                    ? "저장 중..."
                    : ptCount
                    ? "수정"
                    : "설정"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleCloseModal}
                  disabled={createOrUpdateMutation.isPending}
                >
                  취소
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

