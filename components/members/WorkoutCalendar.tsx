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

  const { data: calendarData, isLoading } = useQuery({
    queryKey: ["workout-calendar", memberId, startDate, endDate],
    queryFn: () =>
      workoutRecordApi.getCalendar(memberId, {
        startDate,
        endDate,
      }),
    enabled: !!memberId,
  });

  const createWorkoutMutation = useMutation({
    mutationFn: (data: { date: string; sessionType: "PT" | "SELF" }) =>
      workoutRecordApi.create(memberId, {
        workoutDate: data.date,
        exerciseName: "운동 기록",
        bodyPart: "전신",
        workoutType: data.sessionType === "SELF" ? "PERSONAL" : "PT",
        weight: 0,
        reps: 1,
        sets: 1,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workout-calendar", memberId],
      });
      setShowSessionTypeModal(false);
      setSelectedDate(null);
    },
  });

  const isDateSelectable = (dateString: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(dateString);
    targetDate.setHours(0, 0, 0, 0);
    return targetDate <= today;
  };

  const handleDateClick = (dateString: string) => {
    if (!isDateSelectable(dateString)) {
      return;
    }
    setSelectedDate(dateString);
    setShowSessionTypeModal(true);
  };

  const handleSessionTypeSelect = (sessionType: "PT" | "SELF") => {
    if (!selectedDate) return;
    createWorkoutMutation.mutate({ date: selectedDate, sessionType });
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

      const event = calendarData?.events.find((e) => e.date === dateStr);

      days.push({
        date: i,
        ptSessions: event?.ptSessions || 0,
        selfWorkouts: event?.selfWorkouts || 0,
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

  return (
    <Card title="운동 캘린더" className="bg-[#0f1115]">
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
                <div className="flex-1 flex space-x-0.5 items-center">
                  {day.ptSessions > 0 && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                  {day.selfWorkouts > 0 && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
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
              운동 유형 선택
            </h3>
            <p className="text-sm text-[#c9c7c7] mb-4">
              {new Date(selectedDate).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <div className="space-y-3">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => handleSessionTypeSelect("PT")}
                disabled={createWorkoutMutation.isPending}
              >
                PT 세션
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSessionTypeSelect("SELF")}
                disabled={createWorkoutMutation.isPending}
              >
                개인 운동
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setShowSessionTypeModal(false);
                  setSelectedDate(null);
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
    </Card>
  );
}
