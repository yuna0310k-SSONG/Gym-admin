"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { ptSessionApi } from "@/lib/api/pt-sessions";
import { ptCountApi, type CreatePTUsageRequest } from "@/lib/api/pt-count";
import { workoutRecordApi } from "@/lib/api/workout-records";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import type { CreatePTSessionRequest, UpdatePTSessionRequest } from "@/types/api/requests";
import type { PTSession } from "@/types/api/responses";

interface MemberPTSessionProgressProps {
  memberId: string;
}

interface PTSessionFormData {
  sessionDate: string;
  mainContent: string;
  trainerComment?: string;
}

interface PTCountFormData {
  totalCount: number;
  remainingCount: number;
  usedCount: number;
}

interface AddPaymentFormData {
  additionalCount: number;
}

export default function MemberPTSessionProgress({
  memberId,
}: MemberPTSessionProgressProps) {
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSession, setEditingSession] = useState<PTSession | null>(null);
  const [showPTCountModal, setShowPTCountModal] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const queryClient = useQueryClient();

  const { data: sessionData, isLoading: sessionLoading } = useQuery({
    queryKey: ["pt-sessions", memberId],
    queryFn: () => ptSessionApi.getList(memberId),
    enabled: !!memberId,
  });

  const { data: ptCount, isLoading: ptCountLoading } = useQuery({
    queryKey: ["pt-count", memberId],
    queryFn: () => ptCountApi.get(memberId),
    enabled: !!memberId,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<PTSessionFormData>({
    defaultValues: {
      sessionDate: new Date().toISOString().split("T")[0],
      mainContent: "",
      trainerComment: "",
    },
  });

  const {
    register: registerPTCount,
    handleSubmit: handleSubmitPTCount,
    formState: { errors: ptCountErrors },
    reset: resetPTCount,
    watch: watchPTCount,
    setValue: setPTCountValue,
  } = useForm<PTCountFormData>({
    defaultValues: {
      totalCount: ptCount?.totalCount || 0,
      remainingCount: ptCount?.remainingCount || 0,
      usedCount: ptCount?.usedCount || 0,
    },
  });

  // 총 횟수와 사용 횟수를 watch하여 남은 횟수 자동 계산
  const totalCountValue = watchPTCount("totalCount");
  const usedCountValue = watchPTCount("usedCount");

  useEffect(() => {
    if (totalCountValue !== undefined && usedCountValue !== undefined) {
      const calculatedRemaining = totalCountValue - usedCountValue;
      setPTCountValue("remainingCount", calculatedRemaining);
    }
  }, [totalCountValue, usedCountValue, setPTCountValue]);

  const {
    register: registerAddPayment,
    handleSubmit: handleSubmitAddPayment,
    formState: { errors: addPaymentErrors },
    reset: resetAddPayment,
  } = useForm<AddPaymentFormData>({
    defaultValues: {
      additionalCount: 0,
    },
  });

  // ptCount가 변경되면 폼 값 업데이트
  useEffect(() => {
    if (ptCount) {
      // 남은 횟수는 항상 총 횟수 - 사용 횟수로 계산
      const calculatedRemaining = ptCount.totalCount - ptCount.usedCount;
      resetPTCount({
        totalCount: ptCount.totalCount,
        remainingCount: calculatedRemaining,
        usedCount: ptCount.usedCount,
      });
    }
  }, [ptCount, resetPTCount]);

  // 세션 수와 사용 횟수 동기화
  useEffect(() => {
    if (sessionData && ptCount) {
      const completedSessions = sessionData.completedSessions || 0;
      const currentUsedCount = ptCount.usedCount || 0;
      
      // 세션 수와 사용 횟수가 다르면 동기화
      if (completedSessions !== currentUsedCount) {
        const newUsedCount = completedSessions;
        const newRemainingCount = ptCount.totalCount - newUsedCount;
        
        // 사용 횟수만 업데이트 (총 횟수는 유지)
        ptCountApi.createOrUpdate(memberId, {
          totalCount: ptCount.totalCount,
          usedCount: newUsedCount,
          remainingCount: newRemainingCount,
        }).then(() => {
          queryClient.invalidateQueries({ queryKey: ["pt-count", memberId] });
        }).catch((error) => {
          console.error("PT 횟수 동기화 실패:", error);
        });
      }
    }
  }, [sessionData, ptCount, memberId, queryClient]);

  const createMutation = useMutation({
    mutationFn: async (data: CreatePTSessionRequest) => {
      // 중복 방지: 해당 날짜에 이미 세션이 있는지 확인
      const sessionDate = data.sessionDate.split("T")[0];
      const existingSessions = await ptSessionApi.getList(memberId);
      const sessionsForDate = existingSessions.sessions?.filter(
        (session) => session.sessionDate.split("T")[0] === sessionDate
      ) || [];

      // 이미 해당 날짜에 세션이 있으면 생성하지 않고 기존 세션 반환
      if (sessionsForDate.length > 0) {
        const latestSession = sessionsForDate.sort((a, b) => {
          const timeA = new Date(a.createdAt || a.sessionDate).getTime();
          const timeB = new Date(b.createdAt || b.sessionDate).getTime();
          if (timeB !== timeA) return timeB - timeA;
          return b.id.localeCompare(a.id);
        })[0];
        
        console.log("[PT Session] 해당 날짜에 이미 PT 세션이 존재하여 생성하지 않음:", sessionDate);
        return latestSession;
      }

      // 해당 날짜에 세션이 없으면 새로 생성
      console.log("[PT Session] PT 세션 생성:", sessionDate);
      return ptSessionApi.create(memberId, data);
    },
    onSuccess: async (createdSession, variables) => {
      const sessionDate = variables.sessionDate.split("T")[0];
      
      // 세션 목록을 먼저 새로고침하여 최신 세션 수를 가져옴
      await queryClient.invalidateQueries({ queryKey: ["pt-sessions", memberId] });
      
      // 백엔드 처리 시간을 고려하여 잠시 대기
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      // 세션 데이터를 다시 가져와서 최신 completedSessions 확인
      const updatedSessionData = await ptSessionApi.getList(memberId);
      const newCompletedSessions = updatedSessionData.completedSessions || 0;

      // 중복 확인: 같은 날짜의 세션이 1개인지 확인
      const sessionsForDate = updatedSessionData.sessions?.filter(
        (session) => session.sessionDate.split("T")[0] === sessionDate
      ) || [];

      // 같은 날짜에 여러 세션이 있으면 가장 최근 것만 남기고 나머지 삭제
      if (sessionsForDate.length > 1) {
        console.log(`[PT Session] 중복 세션 발견 (${sessionsForDate.length}개):`, sessionDate);
        
        // 날짜와 생성 시간 기준으로 정렬 (가장 최근 것 우선)
        sessionsForDate.sort((a, b) => {
          const timeA = new Date(a.createdAt || a.sessionDate).getTime();
          const timeB = new Date(b.createdAt || b.sessionDate).getTime();
          if (timeB !== timeA) return timeB - timeA;
          return b.id.localeCompare(a.id);
        });

        // 가장 최근 세션만 남기고 나머지 삭제
        for (let i = 1; i < sessionsForDate.length; i++) {
          try {
            console.log(`[PT Session] 중복 세션 삭제:`, sessionsForDate[i].id);
            await ptSessionApi.delete(memberId, sessionsForDate[i].id);
          } catch (error) {
            console.error("[PT Session] 중복 세션 삭제 실패:", error);
          }
        }

        // 중복 삭제 후 세션 목록 다시 가져오기
        const finalSessionData = await ptSessionApi.getList(memberId);
        const finalCompletedSessions = finalSessionData.completedSessions || 0;

        // PT 횟수 업데이트
        if (ptCount) {
          await ptCountApi.createOrUpdate(memberId, {
            totalCount: ptCount.totalCount,
            usedCount: finalCompletedSessions,
            remainingCount: ptCount.totalCount - finalCompletedSessions,
          });
          queryClient.invalidateQueries({ queryKey: ["pt-count", memberId] });
        }

        // 세션 목록 다시 무효화하여 최신 데이터 반영
        queryClient.invalidateQueries({ queryKey: ["pt-sessions", memberId] });
      } else {
        // 중복이 없으면 정상적으로 PT 횟수 업데이트
        if (ptCount) {
          const newTotalCount = ptCount.totalCount;
          const newUsedCount = newCompletedSessions;
          const newRemainingCount = newTotalCount - newUsedCount;
          
          try {
            await ptCountApi.createOrUpdate(memberId, {
              totalCount: newTotalCount,
              usedCount: newUsedCount,
              remainingCount: newRemainingCount,
            });
            queryClient.invalidateQueries({ queryKey: ["pt-count", memberId] });
          } catch (error) {
            console.error("PT 횟수 업데이트 실패:", error);
          }
        }
      }

      // PT 세션이 생성된 날짜를 운동 캘린더에도 표시하기 위해
      // 해당 날짜에 PT 타입의 운동 기록을 자동으로 생성 (중복 방지)
      try {
        if (variables?.sessionDate) {
          // 날짜 형식 확인 및 변환 (YYYY-MM-DD 형식으로 보장)
          const sessionDate = variables.sessionDate.split("T")[0];
          
          // 중복 확인: 해당 날짜에 PT 타입 운동 기록이 이미 있는지 확인
          const existingRecords = await workoutRecordApi.getList(
            memberId,
            1,
            100,
            sessionDate,
            sessionDate
          );

          const ptRecords =
            existingRecords.records?.filter(
              (record) =>
                record.workoutType === "PT" &&
                record.workoutDate?.split("T")[0] === sessionDate
            ) || [];

          // PT 타입 운동 기록이 없으면 생성 (중복 방지)
          if (ptRecords.length === 0) {
            await workoutRecordApi.create(memberId, {
              workoutDate: sessionDate,
              workoutType: "PT",
              exerciseName: variables.mainContent || "PT 수업",
              bodyPart: "전신",
              weight: 0,
              reps: 1,
              sets: 1,
            });
            
            console.log("[PT Session] 운동 캘린더에 PT 기록 추가 완료:", sessionDate);
          } else {
            console.log("[PT Session] 이미 PT 운동 기록이 존재하여 생성하지 않음:", sessionDate);
          }
          
          // 운동 캘린더 관련 쿼리 무효화 및 새로고침
          queryClient.invalidateQueries({
            queryKey: ["workout-calendar", memberId],
          });
          queryClient.invalidateQueries({
            queryKey: ["workout-records", memberId],
          });
          
          // 모든 캘린더 쿼리를 강제로 다시 가져오기
          await queryClient.refetchQueries({
            queryKey: ["workout-calendar", memberId],
          });
        }
      } catch (error: any) {
        console.error("[PT Session] 캘린더에 PT 기록 추가 실패:", error);
        // 에러가 발생해도 세션 생성은 성공했으므로 계속 진행
      }

      setShowCreateModal(false);
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: string; data: UpdatePTSessionRequest }) =>
      ptSessionApi.update(memberId, sessionId, data),
    onSuccess: (_session, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pt-sessions", memberId] });
      // 세션 날짜가 변경될 수 있으므로 캘린더도 새로고침
      queryClient.invalidateQueries({
        queryKey: ["workout-calendar", memberId],
      });
      queryClient.invalidateQueries({
        queryKey: ["workout-records", memberId],
      });
      setEditingSession(null);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (sessionId: string) => ptSessionApi.delete(memberId, sessionId),
    onSuccess: async (_data, sessionId) => {
      // 삭제될 세션의 날짜 찾기
      const sessionToDelete = sessionData?.sessions?.find(
        (s) => s.id === sessionId
      );
      const sessionDate = sessionToDelete?.sessionDate
        ? sessionToDelete.sessionDate.split("T")[0]
        : null;

      // PT 세션 삭제 시 해당 날짜의 PT 타입 운동 기록도 삭제
      if (sessionDate) {
        try {
          // 해당 날짜의 운동 기록 목록 가져오기
          const workoutRecords = await workoutRecordApi.getList(
            memberId,
            1,
            100,
            sessionDate,
            sessionDate
          );

          // 해당 날짜의 PT 타입 운동 기록 찾아서 삭제
          const ptRecordToDelete = workoutRecords.records?.find(
            (record) =>
              record.workoutType === "PT" &&
              record.workoutDate?.split("T")[0] === sessionDate
          );

          if (ptRecordToDelete) {
            await workoutRecordApi.delete(memberId, ptRecordToDelete.id);
            console.log("[PT Session] PT 운동 기록 삭제 완료:", ptRecordToDelete.id);
          }
        } catch (error) {
          console.error("[PT Session] 운동 기록 삭제 실패:", error);
          // 에러가 발생해도 PT 세션 삭제는 계속 진행
        }
      }

      // 세션 삭제 후 세션 목록 새로고침
      await queryClient.invalidateQueries({ queryKey: ["pt-sessions", memberId] });
      
      // 세션 데이터를 다시 가져와서 최신 completedSessions 확인
      const updatedSessionData = await ptSessionApi.getList(memberId);
      const newCompletedSessions = updatedSessionData.completedSessions || 0;
      
      // PT 횟수도 새로고침하여 최신 데이터 가져오기
      await queryClient.invalidateQueries({ queryKey: ["pt-count", memberId] });
      const updatedPtCount = await ptCountApi.get(memberId);
      
      // 세션 삭제 시: 총 횟수는 그대로 유지, 사용 횟수만 -1 감소
      if (updatedPtCount) {
        const newTotalCount = updatedPtCount.totalCount; // 총 횟수는 변경하지 않음
        const newUsedCount = newCompletedSessions; // 삭제 후 세션 수 (자동으로 -1 적용됨)
        // 남은 횟수 = 총 횟수 - 사용 횟수
        const newRemainingCount = newTotalCount - newUsedCount;
        
        try {
          await ptCountApi.createOrUpdate(memberId, {
            totalCount: newTotalCount,
            usedCount: newUsedCount,
            remainingCount: newRemainingCount,
          });
          queryClient.invalidateQueries({ queryKey: ["pt-count", memberId] });
        } catch (error) {
          console.error("PT 횟수 업데이트 실패:", error);
        }
      }
      
      // 세션 삭제 시 캘린더도 새로고침
      queryClient.invalidateQueries({
        queryKey: ["workout-calendar", memberId],
      });
      queryClient.invalidateQueries({
        queryKey: ["workout-records", memberId],
      });
      // 모든 캘린더 쿼리를 강제로 다시 가져오기
      await queryClient.refetchQueries({
        queryKey: ["workout-calendar", memberId],
      });
      
      setEditingSession(null);
      setShowDeleteConfirm(false);
      reset();
    },
  });

  const createOrUpdatePTCountMutation = useMutation({
    mutationFn: (data: CreatePTUsageRequest) =>
      ptCountApi.createOrUpdate(memberId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pt-count", memberId] });
      setShowPTCountModal(false);
    },
  });

  const addPaymentMutation = useMutation({
    mutationFn: async (additionalCount: number) => {
      if (!ptCount) {
        // PT 횟수가 없으면 새로 생성
        return ptCountApi.createOrUpdate(memberId, {
          totalCount: additionalCount,
          usedCount: 0,
          remainingCount: additionalCount,
        });
      } else {
        // 기존 PT 횟수에 추가
        const newTotalCount = ptCount.totalCount + additionalCount;
        // 변경된 총횟수 - 사용된 횟수 = 남은횟수
        const newRemainingCount = newTotalCount - ptCount.usedCount;
        return ptCountApi.createOrUpdate(memberId, {
          totalCount: newTotalCount,
          usedCount: ptCount.usedCount,
          remainingCount: newRemainingCount,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pt-count", memberId] });
      queryClient.invalidateQueries({ queryKey: ["pt-sessions", memberId] });
      setShowAddPaymentModal(false);
      resetAddPayment();
    },
  });

  const handleCreateSubmit = (data: PTSessionFormData) => {
    createMutation.mutate({
      sessionDate: data.sessionDate,
      mainContent: data.mainContent,
      trainerComment: data.trainerComment || undefined,
    });
  };

  const handleEditSubmit = (data: PTSessionFormData) => {
    if (!editingSession) return;
    updateMutation.mutate({
      sessionId: editingSession.id,
      data: {
        sessionDate: data.sessionDate,
        mainContent: data.mainContent,
        trainerComment: data.trainerComment || undefined,
      },
    });
  };

  const handleEditClick = (session: PTSession) => {
    setEditingSession(session);
    reset({
      sessionDate: session.sessionDate.split("T")[0],
      mainContent: session.mainContent || "",
      trainerComment: session.trainerComment || "",
    });
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingSession(null);
    setShowDeleteConfirm(false);
    reset();
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (editingSession) {
      deleteMutation.mutate(editingSession.id);
    }
  };

  const handlePTCountSubmit = (data: PTCountFormData) => {
    // 남은 횟수는 항상 총 횟수 - 사용 횟수로 계산
    const calculatedRemainingCount = data.totalCount - data.usedCount;
    
    createOrUpdatePTCountMutation.mutate({
      totalCount: data.totalCount,
      usedCount: data.usedCount,
      remainingCount: calculatedRemainingCount,
    });
  };

  const handleClosePTCountModal = () => {
    setShowPTCountModal(false);
    if (ptCount) {
      // 남은 횟수는 항상 총 횟수 - 사용 횟수로 계산
      const calculatedRemaining = ptCount.totalCount - ptCount.usedCount;
      resetPTCount({
        totalCount: ptCount.totalCount,
        remainingCount: calculatedRemaining,
        usedCount: ptCount.usedCount,
      });
    }
  };

  const handleAddPaymentSubmit = (data: AddPaymentFormData) => {
    if (data.additionalCount <= 0) {
      return;
    }
    addPaymentMutation.mutate(data.additionalCount);
  };

  const handleCloseAddPaymentModal = () => {
    setShowAddPaymentModal(false);
    resetAddPayment();
  };

  const isLoading = sessionLoading || ptCountLoading;

  if (isLoading) {
    return (
      <Card title="PT 세션 및 횟수 관리" className="bg-[#0f1115]">
        <div className="flex items-center justify-center h-24">
          <p className="text-[#c9c7c7]">로딩 중...</p>
        </div>
      </Card>
    );
  }

  // PT 횟수가 있으면 PT 횟수의 총 횟수를 세션 진행률의 총 세션 수로 사용
  const totalSessions = ptCount?.totalCount ?? sessionData?.totalSessions ?? 0;
  const completedSessions = sessionData?.completedSessions ?? 0;
  const progress = totalSessions > 0
    ? (completedSessions / totalSessions) * 100
    : 0;

  return (
    <>
      <Card title="PT 세션 및 횟수 관리" className="bg-[#0f1115]">
        <div className="space-y-4">
          {/* PT 횟수 관리 섹션 */}
          <div className="p-4 bg-[#1a1d24] rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-[#c9c7c7]">PT 횟수</h3>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowAddPaymentModal(true)}
                >
                  추가 결제
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPTCountModal(true)}
                >
                  {ptCount ? "수정" : "설정"}
                </Button>
              </div>
            </div>
            {ptCount ? (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-[#9ca3af] mb-1">총 횟수</p>
                  <p className="text-xl font-bold text-white">
                    {ptCount.totalCount}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#9ca3af] mb-1">사용 횟수</p>
                  <p className="text-xl font-bold text-red-400">
                    {ptCount.usedCount}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#9ca3af] mb-1">남은 횟수</p>
                  <p className="text-xl font-bold text-green-400">
                    {ptCount.totalCount - ptCount.usedCount}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#9ca3af]">PT 횟수가 설정되지 않았습니다.</p>
            )}
          </div>

          {/* PT 수업 진행률 섹션 */}
          <div className="pt-3 border-t border-[#374151]">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-[#c9c7c7] mb-2">
                  수업 진행률
                </h3>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-[#c9c7c7]">
                    {completedSessions}회 / {totalSessions}회
                  </span>
                  <span className="text-white font-bold text-lg">
                    {progress.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-[#1a1d24] rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowCreateModal(true)}
                className="ml-4"
              >
                수업 추가
              </Button>
            </div>
          </div>

          {/* 최근 세션 목록 */}
          {sessionData && sessionData.sessions.length > 0 && (
            <div className="pt-3 border-t border-[#374151]">
              <p className="text-sm text-[#9ca3af] mb-3">최근 세션</p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {sessionData.sessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-3 bg-[#1a1d24] rounded-lg"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-white font-medium">
                            {session.sessionNumber}회차
                          </span>
                          <span className="text-[#9ca3af] text-sm">
                            {new Date(session.sessionDate).toLocaleDateString("ko-KR")}
                          </span>
                        </div>
                        {session.mainContent && (
                          <p className="text-[#c9c7c7] text-sm mt-1">
                            {session.mainContent}
                          </p>
                        )}
                        {session.trainerComment && (
                          <p className="text-[#9ca3af] text-xs mt-1 italic">
                            코멘트: {session.trainerComment}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(session)}
                        className="ml-3"
                      >
                        수정
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* PT 세션 생성 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-[#1a1d24] rounded-lg p-6 max-w-md w-full mx-4 border border-[#374151]">
            <h3 className="text-lg font-semibold text-white mb-4">
              PT 세션 생성
            </h3>
            <form onSubmit={handleSubmit(handleCreateSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#c9c7c7] mb-2">
                  세션 날짜
                </label>
                <p className="text-sm text-[#c9c7c7] mb-3">
                  {(() => {
                    const dateValue = watch("sessionDate") || new Date().toISOString().split("T")[0];
                    const [year, month, day] = dateValue.split("-").map(Number);
                    const date = new Date(year, month - 1, day);
                    return date.toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    });
                  })()}
                </p>
                <input
                  type="date"
                  {...register("sessionDate", {
                    required: "세션 날짜를 선택해주세요",
                  })}
                  className="w-full px-3 py-2 bg-[#0f1115] border border-[#374151] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.sessionDate && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.sessionDate.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#c9c7c7] mb-2">
                  주요 수업 내용 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  {...register("mainContent", {
                    required: "주요 수업 내용을 입력해주세요",
                  })}
                  placeholder="오늘 진행한 운동 내용을 입력해주세요"
                  className="w-full px-3 py-2 bg-[#0f1115] border border-[#374151] rounded-md text-white placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.mainContent && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.mainContent.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#c9c7c7] mb-2">
                  트레이너 코멘트
                </label>
                <textarea
                  {...register("trainerComment")}
                  rows={3}
                  className="w-full px-3 py-2 bg-[#0f1115] border border-[#374151] rounded-md text-white placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="추가 코멘트를 입력해주세요 (선택사항)"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "생성 중..." : "생성"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleCloseModal}
                  disabled={createMutation.isPending}
                >
                  취소
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PT 세션 수정 모달 */}
      {editingSession && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-[#1a1d24] rounded-lg p-6 max-w-md w-full mx-4 border border-[#374151]">
            <h3 className="text-lg font-semibold text-white mb-4">
              PT 세션 수정 ({editingSession.sessionNumber}회차)
            </h3>
            <form onSubmit={handleSubmit(handleEditSubmit)} className="space-y-4">
              <Input
                label="세션 날짜"
                type="date"
                {...register("sessionDate", {
                  required: "세션 날짜를 선택해주세요",
                })}
                error={errors.sessionDate?.message}
              />
              <div>
                <label className="block text-sm font-medium text-[#c9c7c7] mb-1">
                  주요 수업 내용 <span className="text-red-400">*</span>
                </label>
                <textarea
                  {...register("mainContent", {
                    required: "주요 수업 내용을 입력해주세요",
                  })}
                  rows={4}
                  className="w-full px-3 py-2 bg-[#111827] border border-[#374151] rounded-lg text-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="오늘 진행한 운동 내용을 입력해주세요"
                />
                {errors.mainContent && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.mainContent.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#c9c7c7] mb-1">
                  트레이너 코멘트
                </label>
                <textarea
                  {...register("trainerComment")}
                  rows={3}
                  className="w-full px-3 py-2 bg-[#111827] border border-[#374151] rounded-lg text-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="추가 코멘트를 입력해주세요 (선택사항)"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={updateMutation.isPending || deleteMutation.isPending}
                >
                  {updateMutation.isPending ? "수정 중..." : "수정"}
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  className="flex-1"
                  onClick={handleDeleteClick}
                  disabled={updateMutation.isPending || deleteMutation.isPending}
                >
                  삭제
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleCloseModal}
                  disabled={updateMutation.isPending || deleteMutation.isPending}
                >
                  취소
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 세션 삭제 확인 모달 */}
      {showDeleteConfirm && editingSession && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-[#1a1d24] rounded-lg p-6 max-w-md w-full mx-4 border border-[#374151]">
            <h3 className="text-lg font-semibold text-white mb-4">
              세션 삭제 확인
            </h3>
            <p className="text-[#c9c7c7] mb-6">
              {editingSession.sessionNumber}회차 세션을 삭제하시겠습니까?
              <br />
              <span className="text-red-400 text-sm mt-2 block">
                삭제 시 PT 횟수가 복구됩니다. 이 작업은 되돌릴 수 없습니다.
              </span>
            </p>
            <div className="flex space-x-3">
              <Button
                variant="danger"
                className="flex-1"
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "삭제 중..." : "삭제"}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteMutation.isPending}
              >
                취소
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* PT 횟수 수정 모달 */}
      {showPTCountModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-[#1a1d24] rounded-lg p-6 max-w-md w-full mx-4 border border-[#374151]">
            <h3 className="text-lg font-semibold text-white mb-4">
              {ptCount ? "PT 횟수 수정" : "PT 횟수 설정"}
            </h3>
            <form onSubmit={handleSubmitPTCount(handlePTCountSubmit)} className="space-y-4">
              <Input
                label="총 횟수"
                type="number"
                min="0"
                {...registerPTCount("totalCount", {
                  required: "총 횟수를 입력해주세요",
                  valueAsNumber: true,
                  min: { value: 0, message: "0 이상의 값을 입력해주세요" },
                })}
                error={ptCountErrors.totalCount?.message}
              />
              <Input
                label="사용 횟수"
                type="number"
                min="0"
                {...registerPTCount("usedCount", {
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
                error={ptCountErrors.usedCount?.message}
              />
              <Input
                label="남은 횟수 (자동 계산)"
                type="number"
                min="0"
                disabled
                {...registerPTCount("remainingCount", {
                  required: "남은 횟수를 입력해주세요",
                  valueAsNumber: true,
                  min: { value: 0, message: "0 이상의 값을 입력해주세요" },
                })}
                error={ptCountErrors.remainingCount?.message}
              />
              <div className="flex space-x-3 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={createOrUpdatePTCountMutation.isPending}
                >
                  {createOrUpdatePTCountMutation.isPending
                    ? "저장 중..."
                    : ptCount
                    ? "수정"
                    : "설정"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleClosePTCountModal}
                  disabled={createOrUpdatePTCountMutation.isPending}
                >
                  취소
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PT 추가 결제 모달 */}
      {showAddPaymentModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-[#1a1d24] rounded-lg p-6 max-w-md w-full mx-4 border border-[#374151]">
            <h3 className="text-lg font-semibold text-white mb-4">
              PT 추가 결제
            </h3>
            <form onSubmit={handleSubmitAddPayment(handleAddPaymentSubmit)} className="space-y-4">
              <Input
                label="추가할 횟수"
                type="number"
                min="1"
                {...registerAddPayment("additionalCount", {
                  required: "추가할 횟수를 입력해주세요",
                  valueAsNumber: true,
                  min: { value: 1, message: "1 이상의 값을 입력해주세요" },
                })}
                error={addPaymentErrors.additionalCount?.message}
              />
              {ptCount && (
                <div className="p-3 bg-[#0f1115] rounded-lg">
                  <p className="text-sm text-[#9ca3af] mb-2">현재 상태</p>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-[#9ca3af]">총 횟수: </span>
                      <span className="text-white font-semibold">{ptCount.totalCount}</span>
                    </div>
                    <div>
                      <span className="text-[#9ca3af]">사용: </span>
                      <span className="text-red-400 font-semibold">{ptCount.usedCount}</span>
                    </div>
                    <div>
                      <span className="text-[#9ca3af]">남은: </span>
                      <span className="text-green-400 font-semibold">{ptCount.totalCount - ptCount.usedCount}</span>
                    </div>
                  </div>
                </div>
              )}
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-sm text-blue-300">
                  {ptCount
                    ? `추가 후 총 횟수: ${ptCount.totalCount} + 입력한 횟수, 남은 횟수도 함께 증가합니다`
                    : "새로운 PT 횟수가 설정됩니다"}
                </p>
              </div>
              <div className="flex space-x-3 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={addPaymentMutation.isPending}
                >
                  {addPaymentMutation.isPending ? "처리 중..." : "추가"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleCloseAddPaymentModal}
                  disabled={addPaymentMutation.isPending}
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
