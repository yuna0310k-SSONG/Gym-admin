"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Button from "@/components/ui/Button";
import { goalApi } from "@/lib/api/goals";
import { useState } from "react";

interface MemberGoalCardProps {
  memberId: string;
}

export default function MemberGoalCard({ memberId }: MemberGoalCardProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [goal, setGoal] = useState("");
  const [progress, setProgress] = useState(0);
  const [comment, setComment] = useState("");

  const { data: goalData, isLoading } = useQuery({
    queryKey: ["goal", memberId],
    queryFn: () => goalApi.get(memberId),
    enabled: !!memberId,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      goalApi.create(memberId, {
        goal: goal.trim(),
        goalProgress: progress,
        goalTrainerComment: comment.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal", memberId] });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      console.error("목표 생성 실패:", error);
      const errorMessage =
        error.message.includes("404") ||
        error.message.includes("찾을 수 없습니다")
          ? "목표 관리 API가 아직 구현되지 않았습니다. 백엔드 개발자에게 문의해주세요."
          : `목표 저장에 실패했습니다: ${error.message}`;
      alert(errorMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      goalApi.update(memberId, {
        goal: goal.trim(),
        goalProgress: progress,
        goalTrainerComment: comment.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal", memberId] });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      console.error("목표 수정 실패:", error);
      const errorMessage =
        error.message.includes("404") ||
        error.message.includes("찾을 수 없습니다")
          ? "목표 관리 API가 아직 구현되지 않았습니다. 백엔드 개발자에게 문의해주세요."
          : `목표 저장에 실패했습니다: ${error.message}`;
      alert(errorMessage);
    },
  });

  const handleEdit = () => {
    if (goalData) {
      setGoal(goalData.goal);
      setProgress(goalData.goalProgress);
      setComment(goalData.goalTrainerComment || "");
    }
    setIsEditing(true);
  };

  const handleSave = () => {
    // 목표 필수 검증
    if (!goal.trim()) {
      alert("목표를 입력해주세요.");
      return;
    }

    if (goalData) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (goalData) {
      setGoal(goalData.goal);
      setProgress(goalData.goalProgress);
      setComment(goalData.goalTrainerComment || "");
    } else {
      setGoal("");
      setProgress(0);
      setComment("");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-16">
        <p className="text-[#c9c7c7]">로딩 중...</p>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="bg-[#1a1d24] rounded-lg p-6 space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">목표 관리</h3>
          <div className="flex space-x-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? "저장 중..."
                : "저장"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              취소
            </Button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#c9c7c7] mb-2">
            목표 한줄 요약
          </label>
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full px-4 py-3 bg-[#0f1115] border border-[#374151] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            placeholder="예: 체중 5kg 감량, 데드리프트 150kg 달성"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#c9c7c7] mb-2">
            진행률: {progress}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#c9c7c7] mb-2">
            트레이너 코멘트
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-4 py-3 bg-[#0f1115] border border-[#374151] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            placeholder="동기부여 코멘트를 작성하세요"
          />
        </div>
      </div>
    );
  }

  if (!goalData) {
    return (
      <div className="flex items-center justify-between py-4 px-6 bg-[#1a1d24] rounded-lg">
        <p className="text-[#9ca3af]">등록된 목표가 없습니다.</p>
        <Button variant="outline" size="sm" onClick={handleEdit}>
          목표 등록
        </Button>
      </div>
    );
  }

  return (
    <div className="py-4 px-6 bg-[#1a1d24] rounded-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          {/* 목표 */}
          <div>
            <span className="text-sm text-[#9ca3af]">목표: </span>
            <span className="text-white text-lg font-medium">
              {goalData.goal}
            </span>
          </div>

          {/* 진행률 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#9ca3af]">진행률</span>
              <span className="text-blue-400 font-bold text-lg">
                {goalData.goalProgress}%
              </span>
            </div>
            <div className="w-full bg-[#0f1115] rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${goalData.goalProgress}%` }}
              />
            </div>
          </div>

          {/* 트레이너 코멘트 */}
          {goalData.goalTrainerComment && (
            <div>
              <span className="text-sm text-[#9ca3af]">💬 </span>
              <span className="text-[#c9c7c7] italic">
                "{goalData.goalTrainerComment}"
              </span>
            </div>
          )}
        </div>

        {/* 수정 버튼 */}
        <Button variant="outline" size="sm" onClick={handleEdit}>
          수정
        </Button>
      </div>
    </div>
  );
}
