"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { workoutRecordApi } from "@/lib/api/workout-records";
import { ptSessionApi } from "@/lib/api/pt-sessions";
import { ptCountApi } from "@/lib/api/pt-count";
import type { WorkoutCalendarResponse } from "@/types/api/responses";
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // 로컬 시간대 기준으로 YYYY-MM-DD 형식의 날짜 문자열 생성
  const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // 날짜 문자열에서 날짜 부분만 추출 (ISO 형식에서 YYYY-MM-DD)
  const extractDateFromISO = (isoString: string): string => {
    return isoString.split("T")[0];
  };

  // 날짜를 한국어 형식으로 포맷팅
  const formatDateToKorean = (dateString: string): string => {
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // PT 횟수 업데이트 헬퍼 함수
  const updatePTCount = async (usedCount: number) => {
    const ptCount = await ptCountApi.get(memberId);
    if (ptCount) {
      await ptCountApi.createOrUpdate(memberId, {
        totalCount: ptCount.totalCount,
        usedCount,
        remainingCount: ptCount.totalCount - usedCount,
      });
      queryClient.invalidateQueries({
        queryKey: ["pt-count", memberId],
      });
    }
  };

  // 중복 세션 제거 헬퍼 함수
  const removeDuplicateSessions = async (sessionDate: string) => {
    const updatedSessionData = await ptSessionApi.getList(memberId);
    const sessionsForDate =
      updatedSessionData.sessions?.filter(
        (session) => extractDateFromISO(session.sessionDate) === sessionDate
      ) || [];

    if (sessionsForDate.length <= 1) {
      return updatedSessionData.completedSessions || 0;
    }

    if (process.env.NODE_ENV === "development") {
      console.log(
        `[WorkoutCalendar] 중복 세션 발견 (${sessionsForDate.length}개):`,
        sessionDate
      );
    }

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
        await ptSessionApi.delete(memberId, sessionsForDate[i].id);
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("[WorkoutCalendar] 중복 세션 삭제 실패:", error);
        }
      }
    }

    // 중복 삭제 후 세션 목록 다시 가져오기
    const finalSessionData = await ptSessionApi.getList(memberId);
    queryClient.invalidateQueries({
      queryKey: ["pt-sessions", memberId],
    });

    return finalSessionData.completedSessions || 0;
  };

  // 캘린더 이벤트 업데이트 헬퍼 함수
  const updateCalendarEvent = (
    dateString: string,
    ptDelta: number,
    selfDelta: number
  ) => {
    const isInCurrentRange = dateString >= startDate && dateString <= endDate;
    if (!isInCurrentRange) return;

    queryClient.setQueryData<WorkoutCalendarResponse | undefined>(
      ["workout-calendar", memberId, startDate, endDate],
      (old) => {
        if (!old) {
          if (ptDelta > 0 || selfDelta > 0) {
            return {
              events: [
                {
                  date: dateString,
                  ptSessions: Math.max(0, ptDelta),
                  selfWorkouts: Math.max(0, selfDelta),
                },
              ],
              startDate,
              endDate,
            };
          }
          return old;
        }

        const existingIndex = old.events.findIndex((event) => {
          const eventDate = extractDateFromISO(event.date);
          return eventDate === dateString;
        });

        if (existingIndex >= 0) {
          const existing = old.events[existingIndex];
          const newPtSessions = Math.max(
            0,
            (existing.ptSessions || 0) + ptDelta
          );
          const newSelfWorkouts = Math.max(
            0,
            (existing.selfWorkouts || 0) + selfDelta
          );

          if (newPtSessions === 0 && newSelfWorkouts === 0) {
            return {
              ...old,
              events: old.events.filter((_, i) => i !== existingIndex),
            };
          }

          const newEvents = [...old.events];
          newEvents[existingIndex] = {
            ...existing,
            ptSessions: newPtSessions,
            selfWorkouts: newSelfWorkouts,
          };
          return {
            ...old,
            events: newEvents,
          };
        } else {
          if (ptDelta > 0 || selfDelta > 0) {
            return {
              ...old,
              events: [
                ...old.events,
                {
                  date: dateString,
                  ptSessions: Math.max(0, ptDelta),
                  selfWorkouts: Math.max(0, selfDelta),
                },
              ],
            };
          }
        }

        return old;
      }
    );
  };

  const startDate = useMemo(() => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    return formatDateToString(date);
  }, [currentMonth]);

  const endDate = useMemo(() => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    );
    return formatDateToString(date);
  }, [currentMonth]);

  // 캘린더 데이터 조회
  const {
    data: calendarData,
    isLoading: calendarLoading,
    error: calendarError,
  } = useQuery({
    queryKey: ["workout-calendar", memberId, startDate, endDate],
    queryFn: () =>
      workoutRecordApi.getCalendar(memberId, {
        startDate,
        endDate,
      }),
    enabled: !!memberId,
  });

  // 선택한 날짜의 운동 기록 조회
  const { data: selectedDateRecords, isLoading: recordsLoading } = useQuery({
    queryKey: ["workout-records", memberId, selectedDate],
    queryFn: async () => {
      const result = await workoutRecordApi.getList(
        memberId,
        1,
        100,
        selectedDate!,
        selectedDate!
      );

      // 클라이언트 측에서도 날짜 필터링
      if (result?.records && selectedDate) {
        const filteredRecords = result.records.filter((record) => {
          if (!record.workoutDate) return false;
          return extractDateFromISO(record.workoutDate) === selectedDate;
        });

        return {
          ...result,
          records: filteredRecords,
        };
      }
      return result;
    },
    enabled: !!selectedDate && showRecordModal,
    refetchOnWindowFocus: false,
    staleTime: 0,
    gcTime: 0,
    refetchInterval: false,
  });

  // PT 횟수 조회 (남은 횟수 확인용)
  const { data: ptCount } = useQuery({
    queryKey: ["pt-count", memberId],
    queryFn: () => ptCountApi.get(memberId),
    enabled: !!memberId,
  });

  // 남은 횟수 계산 (PT 횟수가 등록되지 않은 경우 0으로 처리)
  const remainingCount = ptCount ? ptCount.totalCount - ptCount.usedCount : 0;

  // 선택한 날짜의 PT 세션 조회
  const { data: selectedDatePTSessions, isLoading: ptSessionsLoading } =
    useQuery({
      queryKey: ["pt-sessions", memberId, selectedDate],
      queryFn: async () => {
        const result = await ptSessionApi.getList(memberId);

        // 해당 날짜의 PT 세션만 필터링
        if (result?.sessions && selectedDate) {
          const filteredSessions = result.sessions.filter((session) => {
            if (!session.sessionDate) return false;
            return extractDateFromISO(session.sessionDate) === selectedDate;
          });

          return {
            ...result,
            sessions: filteredSessions,
          };
        }
        return result;
      },
      enabled: !!selectedDate && showRecordModal,
      refetchOnWindowFocus: false,
      staleTime: 0,
      gcTime: 0,
      refetchInterval: false,
    });

  // 캘린더 날짜 배열 생성
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay(); // 0 (일요일) ~ 6 (토요일)
    const daysInMonth = lastDay.getDate();

    const days: Array<{
      date: number;
      dateString: string;
      ptSessions: number;
      selfWorkouts: number;
      isCurrentMonth: boolean;
    }> = [];

    // 이전 달의 마지막 날짜들
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const date = prevMonthLastDay - i;
      const dateObj = new Date(year, month - 1, date);
      const dateString = formatDateToString(dateObj);

      const event = calendarData?.events?.find((e) => {
        return extractDateFromISO(e.date) === dateString;
      });

      days.push({
        date,
        dateString,
        ptSessions: event?.ptSessions || 0,
        selfWorkouts: event?.selfWorkouts || 0,
        isCurrentMonth: false,
      });
    }

    // 현재 달의 날짜들
    for (let date = 1; date <= daysInMonth; date++) {
      const dateObj = new Date(year, month, date);
      const dateString = formatDateToString(dateObj);

      const event = calendarData?.events?.find((e) => {
        return extractDateFromISO(e.date) === dateString;
      });

      days.push({
        date,
        dateString,
        ptSessions: event?.ptSessions || 0,
        selfWorkouts: event?.selfWorkouts || 0,
        isCurrentMonth: true,
      });
    }

    // 다음 달의 첫 날짜들 (캘린더를 42일로 채우기 위해)
    const remainingDays = 42 - days.length;
    for (let date = 1; date <= remainingDays; date++) {
      const dateObj = new Date(year, month + 1, date);
      const dateString = formatDateToString(dateObj);

      const event = calendarData?.events?.find((e) => {
        return extractDateFromISO(e.date) === dateString;
      });

      days.push({
        date,
        dateString,
        ptSessions: event?.ptSessions || 0,
        selfWorkouts: event?.selfWorkouts || 0,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentMonth, calendarData]);

  // 월별 통계 계산
  const monthlyStats = useMemo(() => {
    if (!calendarData?.events) {
      return { personalDays: 0, ptCount: 0 };
    }

    const dateMap = new Map<
      string,
      { ptSessions: number; selfWorkouts: number }
    >();

    calendarData.events.forEach((event) => {
      const eventDate = extractDateFromISO(event.date);
      if (eventDate >= startDate && eventDate <= endDate) {
        if (!dateMap.has(eventDate)) {
          dateMap.set(eventDate, {
            ptSessions: event.ptSessions || 0,
            selfWorkouts: event.selfWorkouts || 0,
          });
        }
      }
    });

    let personalDays = 0;
    let ptCount = 0;

    dateMap.forEach((counts) => {
      if (counts.selfWorkouts > 0) {
        personalDays++;
      }
      ptCount += counts.ptSessions;
    });

    return { personalDays, ptCount };
  }, [calendarData, startDate, endDate]);

  // 운동 기록 생성 mutation
  const createWorkoutMutation = useMutation({
    mutationFn: async (data: {
      date: string;
      workoutType: "PT" | "PERSONAL";
      exerciseName: string;
      bodyPart: string;
    }) => {
      if (data.workoutType === "PT") {
        // 남은 횟수 확인
        const currentPTCount = await ptCountApi.get(memberId);
        const remainingCount = currentPTCount
          ? currentPTCount.totalCount - currentPTCount.usedCount
          : 0;

        if (remainingCount <= 0) {
          throw new Error(
            "PT 남은 횟수가 없습니다. 횟수를 추가한 후 다시 시도해주세요."
          );
        }

        const sessionDate = extractDateFromISO(data.date);
        const existingSessions = await ptSessionApi.getList(memberId);
        const sessionsForDate =
          existingSessions.sessions?.filter(
            (session) => extractDateFromISO(session.sessionDate) === sessionDate
          ) || [];

        if (sessionsForDate.length > 0) {
          const latestSession = sessionsForDate.sort((a, b) => {
            const timeA = new Date(a.createdAt || a.sessionDate).getTime();
            const timeB = new Date(b.createdAt || b.sessionDate).getTime();
            if (timeB !== timeA) return timeB - timeA;
            return b.id.localeCompare(a.id);
          })[0];
          return { data: latestSession };
        }

        return ptSessionApi.create(memberId, {
          sessionDate: data.date,
          mainContent: data.exerciseName || "PT 수업",
          trainerComment: undefined,
        });
      } else {
        // 개인 운동인 경우, 운동 기록만 생성
        return workoutRecordApi.create(memberId, {
          workoutDate: data.date,
          exerciseName: data.exerciseName || "운동 기록",
          bodyPart: data.bodyPart || "전신",
          workoutType: data.workoutType,
          weight: 0,
          reps: 1,
          sets: 1,
        });
      }
    },
    onSuccess: async (_createdData, variables) => {
      const sessionDate = extractDateFromISO(variables.date);
      const isPT = variables.workoutType === "PT";

      if (isPT) {
        await new Promise((resolve) => setTimeout(resolve, 300));

        await queryClient.invalidateQueries({
          queryKey: ["pt-sessions", memberId],
        });

        const finalCompletedSessions = await removeDuplicateSessions(
          sessionDate
        );
        await updatePTCount(finalCompletedSessions);

        updateCalendarEvent(sessionDate, 1, 0);

        setSelectedDate(sessionDate);
        setShowSessionTypeModal(false);
        setShowRecordModal(true);

        setTimeout(async () => {
          await Promise.all([
            queryClient.refetchQueries({
              queryKey: ["workout-calendar", memberId, startDate, endDate],
            }),
            queryClient.refetchQueries({
              queryKey: ["workout-records", memberId, sessionDate],
            }),
          ]);
        }, 200);
      } else {
        const personalDate = sessionDate;
        updateCalendarEvent(personalDate, 0, 1);

        setSelectedDate(personalDate);
        setShowSessionTypeModal(false);
        setShowRecordModal(true);

        queryClient.invalidateQueries({
          queryKey: ["workout-records", memberId, personalDate],
        });
        await queryClient.refetchQueries({
          queryKey: ["workout-records", memberId, personalDate],
        });
      }

      setExerciseName("");
      setBodyPart("");
    },
    onError: (error: Error) => {
      console.error("운동 기록 생성 실패:", error);
      setErrorMessage(error.message || "운동 기록 추가에 실패했습니다.");
      setShowSessionTypeModal(false);
      // 에러 메시지를 3초 후 자동으로 제거
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
    },
  });

  // 운동 기록 삭제 mutation (양방향 동기화)
  const deleteWorkoutMutation = useMutation({
    mutationFn: (recordId: string) =>
      workoutRecordApi.delete(memberId, recordId),
    onSuccess: async (_data: unknown, recordId: string) => {
      const deletedRecord = selectedDateRecords?.records?.find(
        (r) => r.id === recordId
      );
      const deletedDate = deletedRecord?.workoutDate
        ? extractDateFromISO(deletedRecord.workoutDate)
        : selectedDate;
      const wasPT = deletedRecord?.workoutType === "PT";

      if (!deletedDate) {
        queryClient.invalidateQueries({
          queryKey: ["workout-calendar", memberId],
        });
        queryClient.invalidateQueries({
          queryKey: ["workout-records", memberId],
        });
        return;
      }

      if (wasPT) {
        try {
          const ptSessionsData = await ptSessionApi.getList(memberId);
          const sessionToDelete = ptSessionsData.sessions?.find((session) => {
            return extractDateFromISO(session.sessionDate) === deletedDate;
          });

          if (sessionToDelete) {
            await ptSessionApi.delete(memberId, sessionToDelete.id);
            await queryClient.invalidateQueries({
              queryKey: ["pt-sessions", memberId],
            });
            await queryClient.refetchQueries({
              queryKey: ["pt-sessions", memberId],
            });

            const updatedSessionData = await ptSessionApi.getList(memberId);
            const newCompletedSessions =
              updatedSessionData.completedSessions || 0;
            await updatePTCount(newCompletedSessions);
          }
        } catch (error) {
          if (process.env.NODE_ENV === "development") {
            console.error("[WorkoutCalendar] PT 세션 삭제 실패:", error);
          }
        }
      }

      updateCalendarEvent(deletedDate, wasPT ? -1 : 0, wasPT ? 0 : -1);

      await Promise.all([
        queryClient.refetchQueries({
          queryKey: ["workout-calendar", memberId, startDate, endDate],
        }),
        queryClient.refetchQueries({
          queryKey: ["workout-records", memberId, deletedDate],
        }),
      ]);

      const remainingRecords = selectedDateRecords?.records?.filter(
        (r) => r.id !== recordId
      );
      if (!remainingRecords || remainingRecords.length === 0) {
        setShowRecordModal(false);
        setSelectedDate(null);
      }
    },
  });

  // PT 세션 삭제 mutation (양방향 동기화)
  const deletePTSessionMutation = useMutation({
    mutationFn: (sessionId: string) => ptSessionApi.delete(memberId, sessionId),
    onSuccess: async (_data, sessionId) => {
      const sessionToDelete = selectedDatePTSessions?.sessions?.find(
        (s) => s.id === sessionId
      );
      const sessionDate = sessionToDelete?.sessionDate
        ? extractDateFromISO(sessionToDelete.sessionDate)
        : selectedDate;

      if (!sessionDate) {
        queryClient.invalidateQueries({
          queryKey: ["pt-sessions", memberId],
        });
        queryClient.invalidateQueries({
          queryKey: ["workout-calendar", memberId],
        });
        return;
      }

      try {
        const workoutRecords = await workoutRecordApi.getList(
          memberId,
          1,
          100,
          sessionDate,
          sessionDate
        );

        const ptRecordToDelete = workoutRecords.records?.find(
          (record) =>
            record.workoutType === "PT" &&
            record.workoutDate &&
            extractDateFromISO(record.workoutDate) === sessionDate
        );

        if (ptRecordToDelete) {
          await workoutRecordApi.delete(memberId, ptRecordToDelete.id);
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("[WorkoutCalendar] PT 운동 기록 삭제 실패:", error);
        }
      }

      await queryClient.invalidateQueries({
        queryKey: ["pt-sessions", memberId],
      });
      await queryClient.refetchQueries({
        queryKey: ["pt-sessions", memberId],
      });

      const updatedSessionData = await ptSessionApi.getList(memberId);
      const newCompletedSessions = updatedSessionData.completedSessions || 0;
      await updatePTCount(newCompletedSessions);

      updateCalendarEvent(sessionDate, -1, 0);

      await Promise.all([
        queryClient.refetchQueries({
          queryKey: ["workout-calendar", memberId, startDate, endDate],
        }),
        queryClient.refetchQueries({
          queryKey: ["workout-records", memberId, sessionDate],
        }),
      ]);

      const remainingSessions = selectedDatePTSessions?.sessions?.filter(
        (s) => s.id !== sessionId
      );
      const hasRemainingRecords =
        selectedDateRecords?.records && selectedDateRecords.records.length > 0;

      if (
        (!remainingSessions || remainingSessions.length === 0) &&
        !hasRemainingRecords
      ) {
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

  const handleDateClick = async (dateString: string) => {
    if (!isDateSelectable(dateString)) {
      return;
    }

    // 날짜 선택
    setSelectedDate(dateString);
    setExerciseName("");
    setBodyPart("");

    const event = calendarData?.events?.find((e) => {
      return extractDateFromISO(e.date) === dateString;
    });
    const hasRecordsInCalendar =
      (event?.ptSessions ?? 0) > 0 || (event?.selfWorkouts ?? 0) > 0;

    try {
      const records = await workoutRecordApi.getList(
        memberId,
        1,
        100,
        dateString,
        dateString
      );

      const filteredRecords =
        records?.records?.filter((record) => {
          if (!record.workoutDate) return false;
          return extractDateFromISO(record.workoutDate) === dateString;
        }) || [];

      const hasRecords = filteredRecords.length > 0;

      let hasPTSessions = false;
      try {
        const ptSessionsData = await ptSessionApi.getList(memberId);
        const ptSessionsForDate =
          ptSessionsData.sessions?.filter((session) => {
            if (!session.sessionDate) return false;
            return extractDateFromISO(session.sessionDate) === dateString;
          }) || [];
        hasPTSessions = ptSessionsForDate.length > 0;
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("PT 세션 조회 실패:", error);
        }
      }

      if (hasRecords || hasRecordsInCalendar || hasPTSessions) {
        setShowRecordModal(true);
      } else {
        setShowSessionTypeModal(true);
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("운동 기록 조회 실패:", error);
      }
      setShowSessionTypeModal(true);
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

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  if (calendarLoading) {
    return (
      <Card title="운동 캘린더" className="bg-[#0f1115]">
        <div className="flex items-center justify-center h-64">
          <p className="text-[#c9c7c7]">로딩 중...</p>
        </div>
      </Card>
    );
  }

  if (calendarError) {
    return (
      <Card title="운동 캘린더" className="bg-[#0f1115]">
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm text-center">
            캘린더 데이터를 불러올 수 없습니다. (
            {calendarError instanceof Error
              ? calendarError.message
              : "서버 오류"}
            )
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card title="운동 캘린더" className="bg-[#0f1115]">
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <p className="text-red-400 font-medium">오류</p>
                <p className="text-red-300 text-sm mt-1">{errorMessage}</p>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-red-400 hover:text-red-300 ml-2"
                aria-label="에러 메시지 닫기"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
        {/* 월 네비게이션 */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevMonth}
            className="px-3 py-1 text-[#e5e7eb]"
          >
            ←
          </Button>
          <h3 className="text-lg font-semibold text-white">
            {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextMonth}
            className="px-3 py-1 text-[#e5e7eb]"
          >
            →
          </Button>
        </div>

        {/* 캘린더 그리드 */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {/* 요일 헤더 */}
          {weekDays.map((day, index) => (
            <div
              key={day}
              className={`text-center text-xs font-medium py-2 ${
                index === 0
                  ? "text-red-400"
                  : index === 6
                  ? "text-blue-400"
                  : "text-[#9ca3af]"
              }`}
            >
              {day}
            </div>
          ))}

          {/* 날짜 셀 */}
          {calendarDays.map((day) => {
            const isToday = day.dateString === formatDateToString(new Date());
            const isSelectable = isDateSelectable(day.dateString);

            return (
              <div
                key={day.dateString}
                onClick={() => isSelectable && handleDateClick(day.dateString)}
                className={`
                  min-h-[60px] p-1 border border-[#374151] rounded
                  ${
                    day.isCurrentMonth
                      ? "bg-[#1a1d24]"
                      : "bg-[#0f1115] text-[#6b7280]"
                  }
                  ${isToday ? "ring-2 ring-blue-500" : ""}
                  ${
                    isSelectable
                      ? "cursor-pointer hover:bg-[#262b33]"
                      : "cursor-not-allowed opacity-50"
                  }
                `}
              >
                <div className="text-xs mb-1 text-[#9ca3af]">{day.date}</div>
                <div className="flex-1 flex items-center justify-center gap-1.5 mt-0.5 min-h-[12px]">
                  {/* PT 세션이 있을 때 파란색 점 표시 */}
                  {day.ptSessions > 0 && (
                    <div
                      className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0 shadow-sm"
                      title={`PT ${day.ptSessions}회`}
                      style={{
                        minWidth: "12px",
                        minHeight: "12px",
                        flexShrink: 0,
                      }}
                    ></div>
                  )}
                  {/* 개인 운동이 있을 때 초록색 점 표시 */}
                  {day.selfWorkouts > 0 && (
                    <div
                      className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0 shadow-sm"
                      title={`개인 운동 ${day.selfWorkouts}회`}
                      style={{
                        minWidth: "12px",
                        minHeight: "12px",
                        flexShrink: 0,
                      }}
                    ></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 월별 통계 */}
        <div className="mt-4 pt-4 border-t border-[#374151] flex items-center justify-center gap-4 text-sm text-[#9ca3af]">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>
              개인운동{" "}
              <span className="text-white font-medium">
                {monthlyStats.personalDays}일
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>
              PT{" "}
              <span className="text-white font-medium">
                {monthlyStats.ptCount}회
              </span>
            </span>
          </div>
        </div>
      </Card>

      {/* 운동 타입 선택 모달 */}
      {showSessionTypeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-[#1a1d24] rounded-lg p-6 max-w-md w-full mx-4 border border-[#374151]">
            <h3 className="text-lg font-semibold text-white mb-4">
              운동 타입 선택
            </h3>
            <p className="text-sm text-[#c9c7c7] mb-4">
              {selectedDate && formatDateToKorean(selectedDate)}
            </p>

            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-[#9ca3af] mb-2">
                  운동명
                </label>
                <input
                  type="text"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  placeholder="운동명을 입력하세요"
                  className="w-full px-3 py-2 bg-[#0f1115] border border-[#374151] rounded-md text-white placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#9ca3af] mb-2">
                  부위
                </label>
                <input
                  type="text"
                  value={bodyPart}
                  onChange={(e) => setBodyPart(e.target.value)}
                  placeholder="부위를 입력하세요"
                  className="w-full px-3 py-2 bg-[#0f1115] border border-[#374151] rounded-md text-white placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={() => handleWorkoutTypeSelect("PT")}
                disabled={
                  createWorkoutMutation.isPending || remainingCount <= 0
                }
                className="flex-1"
                title={
                  remainingCount <= 0
                    ? "PT 남은 횟수가 없습니다. 횟수를 추가한 후 다시 시도해주세요."
                    : undefined
                }
              >
                PT 세션
                {remainingCount <= 0 && (
                  <span className="ml-1 text-xs">(횟수 부족)</span>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleWorkoutTypeSelect("PERSONAL")}
                disabled={createWorkoutMutation.isPending}
                className="flex-1"
              >
                개인 운동
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setShowSessionTypeModal(false);
                setSelectedDate(null);
                setExerciseName("");
                setBodyPart("");
              }}
              className="w-full mt-3"
            >
              취소
            </Button>
          </div>
        </div>
      )}

      {/* 운동 기록 모달 */}
      {showRecordModal && selectedDate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-[#1a1d24] rounded-lg p-6 max-w-md w-full mx-4 border border-[#374151] max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">운동 기록</h3>
            <p className="text-sm text-[#c9c7c7] mb-4">
              {selectedDate && formatDateToKorean(selectedDate)}
            </p>

            {recordsLoading || ptSessionsLoading ? (
              <div className="text-center py-8">
                <p className="text-[#c9c7c7]">로딩 중...</p>
              </div>
            ) : (selectedDateRecords?.records &&
                selectedDateRecords.records.length > 0) ||
              (selectedDatePTSessions?.sessions &&
                selectedDatePTSessions.sessions.length > 0) ? (
              <>
                <div className="space-y-3 mb-4">
                  {/* PT 세션 내역 표시 */}
                  {selectedDatePTSessions?.sessions &&
                    selectedDatePTSessions.sessions.length > 0 &&
                    selectedDatePTSessions.sessions.map((session) => (
                      <div
                        key={session.id}
                        className="p-4 bg-[#0f1115] rounded-lg border border-[#374151]"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-500/20 text-blue-400">
                              PT {session.sessionNumber}회차
                            </span>
                            <span className="text-white font-medium">
                              {session.mainContent || "PT 수업"}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              if (confirm("이 PT 세션을 삭제하시겠습니까?")) {
                                deletePTSessionMutation.mutate(session.id);
                              }
                            }}
                            disabled={deletePTSessionMutation.isPending}
                            className="text-red-400 hover:text-red-300 text-sm font-medium disabled:opacity-50"
                          >
                            삭제
                          </button>
                        </div>
                        <div className="text-sm text-[#c9c7c7] space-y-1">
                          {session.trainerComment && (
                            <p>트레이너 코멘트: {session.trainerComment}</p>
                          )}
                          <p className="text-xs text-[#6b7280]">
                            {formatDateToKorean(
                              extractDateFromISO(session.sessionDate)
                            )}
                          </p>
                        </div>
                      </div>
                    ))}

                  {/* 운동 기록 내역 표시 */}
                  {selectedDateRecords?.records &&
                    selectedDateRecords.records.length > 0 &&
                    selectedDateRecords.records
                      .sort((a, b) => {
                        if (a.workoutType === "PT" && b.workoutType !== "PT")
                          return -1;
                        if (a.workoutType !== "PT" && b.workoutType === "PT")
                          return 1;
                        return 0;
                      })
                      .map((record) => (
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
                                {record.exerciseName ||
                                  (record.workoutType === "PT"
                                    ? "PT 세션"
                                    : "개인운동")}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                if (
                                  confirm("이 운동 기록을 삭제하시겠습니까?")
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
                            <p>부위: {record.bodyPart || "전신"}</p>
                            {record.weight != null && record.weight > 0 && (
                              <p>
                                무게: {record.weight}kg × {record.reps ?? 0}회 ×{" "}
                                {record.sets ?? 0}세트
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                </div>
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowRecordModal(false);
                    setShowSessionTypeModal(true);
                  }}
                  className="w-full"
                >
                  추가하기
                </Button>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-[#c9c7c7] mb-4">
                  {selectedDate && formatDateToKorean(selectedDate)} 운동 기록이
                  없습니다.
                </p>
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowRecordModal(false);
                    setShowSessionTypeModal(true);
                  }}
                  className="w-full"
                >
                  추가하기
                </Button>
              </div>
            )}

            <Button
              variant="outline"
              onClick={() => {
                setShowRecordModal(false);
                setSelectedDate(null);
              }}
              className="w-full mt-3"
            >
              닫기
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
