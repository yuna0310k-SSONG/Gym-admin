"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { workoutRecordApi } from "@/lib/api/workout-records";
import { useState, useMemo } from "react";

interface WorkoutCalendarProps {
  memberId: string;
}

export default function WorkoutCalendar({ memberId }: WorkoutCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showSessionTypeModal, setShowSessionTypeModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [exerciseName, setExerciseName] = useState("");
  const [bodyPart, setBodyPart] = useState("");
  const queryClient = useQueryClient();

  const startDate = useMemo(() => {
    const date = new Date(currentMonth);
    date.setDate(1);
    return date.toISOString().split("T")[0];
  }, [currentMonth]);

  const endDate = useMemo(() => {
    const date = new Date(currentMonth);
    date.setMonth(date.getMonth() + 1);
    date.setDate(0);
    return date.toISOString().split("T")[0];
  }, [currentMonth]);

  const {
    data: calendarData,
    isLoading,
    error: calendarError,
  } = useQuery({
    queryKey: ["workout-calendar", memberId, startDate, endDate],
    queryFn: () =>
      workoutRecordApi.getCalendar(memberId, {
        startDate,
        endDate,
      }),
    enabled: !!memberId,
    retry: 1, // 500 에러 시 재시도 1회만
  });

  const createWorkoutMutation = useMutation({
    mutationFn: (data: { 
      date: string; 
      workoutType: "PT" | "PERSONAL";
      exerciseName: string;
      bodyPart: string;
    }) =>
      workoutRecordApi.create(memberId, {
        workoutDate: data.date,
        exerciseName: data.exerciseName || "운동 기록",
        bodyPart: data.bodyPart || "전신",
        workoutType: data.workoutType,
        weight: 0,
        reps: 1,
        sets: 1,
      }),
    onSuccess: () => {
      // 캘린더 데이터를 즉시 새로고침하여 표시 업데이트
      queryClient.invalidateQueries({
        queryKey: ["workout-calendar", memberId],
      });
      // 현재 월의 캘린더 쿼리도 강제로 다시 가져오기
      queryClient.refetchQueries({
        queryKey: ["workout-calendar", memberId, startDate, endDate],
      });
      setShowSessionTypeModal(false);
      setShowRecordModal(false);
      setSelectedDate(null);
      setExerciseName("");
      setBodyPart("");
    },
  });

  // 운동 기록 삭제 mutation
  const deleteWorkoutMutation = useMutation({
    mutationFn: (recordId: string) =>
      workoutRecordApi.delete(memberId, recordId),
    onSuccess: () => {
      // 캘린더 데이터를 즉시 새로고침하여 표시 업데이트
      queryClient.invalidateQueries({
        queryKey: ["workout-calendar", memberId],
      });
      queryClient.invalidateQueries({
        queryKey: ["workout-records", memberId, selectedDate],
      });
      // 현재 월의 캘린더 쿼리도 강제로 다시 가져오기
      queryClient.refetchQueries({
        queryKey: ["workout-calendar", memberId, startDate, endDate],
      });
      // 모든 기록이 삭제되면 모달 닫기
      const remainingRecords = selectedDateRecords?.records?.filter(
        (r) => r.id !== deleteWorkoutMutation.variables
      );
      if (!remainingRecords || remainingRecords.length === 0) {
        setShowRecordModal(false);
        setSelectedDate(null);
      }
    },
  });

  const isDateSelectable = (dateString: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(dateString);
    targetDate.setHours(0, 0, 0, 0);
    return targetDate <= today;
  };

  // 선택한 날짜의 운동 기록 조회
  const { data: selectedDateRecords, isLoading: recordsLoading } = useQuery({
    queryKey: ["workout-records", memberId, selectedDate],
    queryFn: () =>
      workoutRecordApi.getList(memberId, 1, 100, selectedDate!, selectedDate!),
    enabled: !!selectedDate && showRecordModal,
  });

  const handleDateClick = (dateString: string) => {
    if (!isDateSelectable(dateString)) {
      return;
    }
    setSelectedDate(dateString);
    // 입력 필드 초기화
    setExerciseName("");
    setBodyPart("");
    
    // 해당 날짜에 운동 기록이 있는지 확인
    const event = calendarData?.events?.find((e) => e.date === dateString);
    const hasRecords = (event?.ptSessions ?? 0) > 0 || (event?.selfWorkouts ?? 0) > 0;
    
    if (hasRecords) {
      // 기록이 있으면 기록 보기 모달 표시
      setShowRecordModal(true);
      setShowSessionTypeModal(false);
    } else {
      // 기록이 없으면 운동 유형 선택 모달 표시
      setShowSessionTypeModal(true);
      setShowRecordModal(false);
    }
  };

  const handleWorkoutTypeSelect = (workoutType: "PT" | "PERSONAL") => {
    if (!selectedDate) return;
    createWorkoutMutation.mutate({ 
      date: selectedDate, 
      workoutType,
      exerciseName: exerciseName.trim() || "운동 기록",
      bodyPart: bodyPart.trim() || "전신",
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  const calendarDays = useMemo(() => {
    const days: Array<{
      date: number;
      ptSessions: number;
      selfWorkouts: number;
      dateString: string;
    }> = [];

    // 빈 칸 추가
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({
        date: 0,
        ptSessions: 0,
        selfWorkouts: 0,
        dateString: "",
      });
    }

    // 날짜 추가
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        i
      )
        .toISOString()
        .split("T")[0];

      // 캘린더 데이터에서 해당 날짜의 이벤트 찾기
      const event = calendarData?.events?.find((e) => e.date === dateStr);

      days.push({
        date: i,
        ptSessions: event?.ptSessions ?? 0,
        selfWorkouts: event?.selfWorkouts ?? 0,
        dateString: dateStr,
      });
    }

    return days;
  }, [daysInMonth, startingDayOfWeek, currentMonth, calendarData]);

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  if (isLoading) {
    return (
      <Card title="운동 캘린더" className="bg-[#0f1115]">
        <div className="flex items-center justify-center h-64">
          <p className="text-[#c9c7c7]">로딩 중...</p>
        </div>
      </Card>
    );
  }

  // 에러가 발생해도 빈 캘린더는 표시 (데이터가 없을 수 있음)
  const hasError = !!calendarError && !calendarData;

  return (
    <Card title="운동 캘린더" className="bg-[#0f1115]">
      {/* 에러 메시지 (데이터가 없을 때만 표시) */}
      {hasError && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm text-center">
            캘린더 데이터를 불러올 수 없습니다. ({calendarError instanceof Error ? calendarError.message : "서버 오류"})
          </p>
        </div>
      )}
      <div className="space-y-4">
        {/* 월 네비게이션 + 범례 */}
        <div className="flex justify-between items-center max-w-xl mx-auto">
          <button
            onClick={handlePrevMonth}
            className="px-3 py-1 text-sm text-[#c9c7c7] hover:text-white hover:bg-[#1a1d24] rounded transition-colors"
          >
            ←
          </button>
          <div className="flex items-center space-x-4">
            <h3 className="text-base font-bold text-white">
              {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
            </h3>
            <div className="flex space-x-3 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-[#9ca3af]">PT</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-[#9ca3af]">개인</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleNextMonth}
            className="px-3 py-1 text-sm text-[#c9c7c7] hover:text-white hover:bg-[#1a1d24] rounded transition-colors"
          >
            →
          </button>
        </div>

        {/* 캘린더 그리드 */}
        <div className="grid grid-cols-7 gap-1 max-w-xl mx-auto">
          {/* 요일 헤더 */}
          {["일", "월", "화", "수", "목", "금", "토"].map((day, index) => (
            <div
              key={day}
              className={`text-center text-xs font-medium py-2 ${
                index === 0 ? "text-red-400" : index === 6 ? "text-blue-400" : "text-[#9ca3af]"
              }`}
            >
              {day}
            </div>
          ))}

          {/* 날짜 셀 */}
          {calendarDays.map((day, index) => {
            if (day.date === 0) {
              return <div key={index} className="h-10"></div>;
            }

            const dayOfWeek = index % 7;
            const isToday =
              day.dateString === new Date().toISOString().split("T")[0];

            const isSelectable = isDateSelectable(day.dateString);
            const isPastDate = day.dateString < new Date().toISOString().split("T")[0];

            return (
              <div
                key={index}
                onClick={() => isSelectable && handleDateClick(day.dateString)}
                className={`h-10 p-1 border rounded flex flex-col transition-colors ${
                  isToday
                    ? "border-blue-500 bg-blue-500/10"
                    : isSelectable
                    ? "border-[#374151] hover:bg-[#1a1d24] cursor-pointer"
                    : "border-[#374151] opacity-50 cursor-not-allowed"
                }`}
              >
                <div
                  className={`text-xs font-medium ${
                    isToday
                      ? "text-blue-400"
                      : dayOfWeek === 0
                      ? "text-red-400"
                      : dayOfWeek === 6
                      ? "text-blue-400"
                      : isSelectable
                      ? "text-[#c9c7c7]"
                      : "text-[#6b7280]"
                  }`}
                >
                  {day.date}
                </div>
                <div className="flex-1 flex space-x-0.5 items-center justify-center">
                  {day.ptSessions > 0 && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full" title={`PT ${day.ptSessions}회`}></div>
                  )}
                  {day.selfWorkouts > 0 && (
                    <div className="w-2 h-2 bg-green-500 rounded-full" title={`개인 운동 ${day.selfWorkouts}회`}></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 세션 타입 선택 모달 */}
      {showSessionTypeModal && selectedDate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-[#1a1d24] rounded-lg p-6 max-w-sm w-full mx-4 border border-[#374151]">
            <h3 className="text-lg font-semibold text-white mb-4">
              운동 기록 추가
            </h3>
            <p className="text-sm text-[#c9c7c7] mb-4">
              {new Date(selectedDate).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-[#c9c7c7] mb-2">
                  운동 제목
                </label>
                <input
                  type="text"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  placeholder="운동 기록"
                  className="w-full px-3 py-2 bg-[#0f1115] border border-[#374151] rounded-md text-white placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={createWorkoutMutation.isPending}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#c9c7c7] mb-2">
                  부위
                </label>
                <input
                  type="text"
                  value={bodyPart}
                  onChange={(e) => setBodyPart(e.target.value)}
                  placeholder="전신"
                  className="w-full px-3 py-2 bg-[#0f1115] border border-[#374151] rounded-md text-white placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={createWorkoutMutation.isPending}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => handleWorkoutTypeSelect("PT")}
                disabled={createWorkoutMutation.isPending}
              >
                PT 세션 추가
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleWorkoutTypeSelect("PERSONAL")}
                disabled={createWorkoutMutation.isPending}
              >
                개인 운동 추가
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setShowSessionTypeModal(false);
                  setSelectedDate(null);
                  setExerciseName("");
                  setBodyPart("");
                }}
                disabled={createWorkoutMutation.isPending}
              >
                취소
              </Button>
            </div>
            {createWorkoutMutation.isPending && (
              <p className="text-sm text-[#c9c7c7] mt-4 text-center">
                저장 중...
              </p>
            )}
            {createWorkoutMutation.isError && (
              <p className="text-sm text-red-400 mt-4 text-center">
                저장에 실패했습니다. 다시 시도해주세요.
              </p>
            )}
          </div>
        </div>
      )}

      {/* 운동 기록 보기/삭제 모달 */}
      {showRecordModal && selectedDate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-[#1a1d24] rounded-lg p-6 max-w-md w-full mx-4 border border-[#374151] max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">
              운동 기록
            </h3>
            <p className="text-sm text-[#c9c7c7] mb-4">
              {new Date(selectedDate).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>

            {recordsLoading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-[#c9c7c7]">로딩 중...</p>
              </div>
            ) : selectedDateRecords?.records && selectedDateRecords.records.length > 0 ? (
              <div className="space-y-3 mb-4">
                {selectedDateRecords.records.map((record) => (
                  <div
                    key={record.id}
                    className="p-4 bg-[#0f1115] rounded-lg border border-[#374151]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${
                            record.workoutType === "PT"
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-green-500/20 text-green-400"
                          }`}
                        >
                          {record.workoutType === "PT" ? "PT" : "개인"}
                        </span>
                        <span className="text-white font-medium">
                          {record.exerciseName}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              "이 운동 기록을 삭제하시겠습니까?"
                            )
                          ) {
                            deleteWorkoutMutation.mutate(record.id);
                          }
                        }}
                        disabled={deleteWorkoutMutation.isPending}
                        className="text-red-400 hover:text-red-300 text-sm font-medium disabled:opacity-50"
                      >
                        삭제
                      </button>
                    </div>
                    <div className="text-sm text-[#c9c7c7] space-y-1">
                      <p>부위: {record.bodyPart}</p>
                      {record.weight > 0 && (
                        <p>
                          무게: {record.weight}kg × {record.reps}회 ×{" "}
                          {record.sets}세트
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-[#c9c7c7]">운동 기록이 없습니다.</p>
              </div>
            )}

            <div className="space-y-3">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  setShowRecordModal(false);
                  setShowSessionTypeModal(true);
                }}
              >
                운동 추가
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setShowRecordModal(false);
                  setSelectedDate(null);
                }}
              >
                닫기
              </Button>
            </div>

            {deleteWorkoutMutation.isPending && (
              <p className="text-sm text-[#c9c7c7] mt-4 text-center">
                삭제 중...
              </p>
            )}
            {deleteWorkoutMutation.isError && (
              <p className="text-sm text-red-400 mt-4 text-center">
                삭제에 실패했습니다. 다시 시도해주세요.
              </p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
