"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import InjuryForm from "@/components/health/InjuryForm";
import InjuryList from "@/components/members/InjuryList";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { injuryApi } from "@/lib/api/injuries";
import type { CreateInjuryRequest, UpdateInjuryRequest } from "@/types/api/requests";
import type { Injury } from "@/types/api/responses";

interface MemberInjuriesTabProps {
  memberId: string;
}

export default function MemberInjuriesTab({ memberId }: MemberInjuriesTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingInjury, setEditingInjury] = useState<Injury | null>(null);
  const queryClient = useQueryClient();

  const { data: injuriesData, isLoading, error } = useQuery({
    queryKey: ["injuries", memberId],
    queryFn: () => injuryApi.getInjuries(memberId),
    enabled: !!memberId,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateInjuryRequest) => injuryApi.createInjury(memberId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["injuries", memberId] });
      setShowForm(false);
      setEditingInjury(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ injuryId, data }: { injuryId: string; data: UpdateInjuryRequest }) =>
      injuryApi.updateInjury(memberId, injuryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["injuries", memberId] });
      setShowForm(false);
      setEditingInjury(null);
    },
  });

  const handleSubmit = async (data: CreateInjuryRequest) => {
    if (editingInjury) {
      // 수정 모드
      const updateData: UpdateInjuryRequest = {
        injuryType: data.injuryType,
        bodyPart: data.bodyPart,
        date: data.date,
        severity: data.severity,
        description: data.description,
        recoveryStatus: data.recoveryStatus,
      };
      await updateMutation.mutateAsync({ injuryId: editingInjury.id, data: updateData });
    } else {
      // 생성 모드
      await createMutation.mutateAsync(data);
    }
  };

  const handleEdit = (injury: Injury) => {
    setEditingInjury(injury);
    setShowForm(true);
  };

  const handleDelete = async (injuryId: string) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      // TODO: 삭제 API 호출
      queryClient.invalidateQueries({ queryKey: ["injuries", memberId] });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[#c9c7c7]">로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-[#0f1115]">
        <div className="flex items-center justify-center h-64">
          <p className="text-red-400">데이터를 불러오는 중 오류가 발생했습니다.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">부상 이력</h2>
        {!showForm && (
          <Button variant="primary" onClick={() => setShowForm(true)}>
            부상 이력 추가
          </Button>
        )}
      </div>

      {showForm && (
        <InjuryForm
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingInjury(null);
          }}
          initialData={
            editingInjury
              ? {
                  injuryType: editingInjury.injuryType,
                  bodyPart: editingInjury.bodyPart,
                  date: editingInjury.date.split("T")[0],
                  severity: editingInjury.severity,
                  description: editingInjury.description,
                  recoveryStatus: editingInjury.recoveryStatus,
                }
              : undefined
          }
          isEditMode={!!editingInjury}
        />
      )}

      {injuriesData && (
        <Card title={`부상 이력 (${injuriesData.total}건)`} className="bg-[#0f1115]">
          <InjuryList
            injuries={injuriesData.injuries}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Card>
      )}
    </div>
  );
}




