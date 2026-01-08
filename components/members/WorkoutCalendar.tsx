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
  const queryClient = useQueryClient();

  // 로컬 시간대 기준으로 YYYY-MM-DD 형식의 날짜 문자열 생성
  const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
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
          const recordDate = record.workoutDate.split("T")[0];
          return recordDate === selectedDate;
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
            const sessionDate = session.sessionDate.split("T")[0];
            return sessionDate === selectedDate;
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
        const eventDate = e.date.split("T")[0];
        return eventDate === dateString;
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
        const eventDate = e.date.split("T")[0];
        return eventDate === dateString;
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
        const eventDate = e.date.split("T")[0];
        return eventDate === dateString;
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
      const eventDate = event.date.split("T")[0];
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
      // PT 타입인 경우, PT 세션만 생성 (중복 방지)
      if (data.workoutType === "PT") {
        // 중복 방지를 위해 생성 전에 해당 날짜의 세션 확인
        const sessionDate = data.date.split("T")[0];

        // 해당 날짜에 이미 세션이 있는지 확인
        const existingSessions = await ptSessionApi.getList(memberId);
        const sessionsForDate =
          existingSessions.sessions?.filter(
            (session) => session.sessionDate.split("T")[0] === sessionDate
          ) || [];

        // 이미 해당 날짜에 세션이 있으면 생성하지 않고 기존 세션 반환
        if (sessionsForDate.length > 0) {
          // 가장 최근 세션 반환
          const latestSession = sessionsForDate.sort((a, b) => {
            const timeA = new Date(a.sessionDate).getTime();
            const timeB = new Date(b.sessionDate).getTime();
            return timeB - timeA || b.id.localeCompare(a.id);
          })[0];

          console.log(
            "[WorkoutCalendar] 해당 날짜에 이미 PT 세션이 존재하여 생성하지 않음:",
            sessionDate
          );
          return { data: latestSession };
        }

        // 해당 날짜에 세션이 없으면 새로 생성
        console.log("[WorkoutCalendar] PT 세션 생성:", sessionDate);
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
    onSuccess: async (createdData, variables) => {
      const date = variables.date;
      const isPT = variables.workoutType === "PT";
      const sessionDate = date.split("T")[0];

      // 추가한 날짜가 현재 캘린더 범위 안에 있는지 확인
      const isInCurrentRange =
        sessionDate >= startDate && sessionDate <= endDate;

      if (isPT) {
        // ========== 핵심 원칙: 단일 소스, 단일 업데이트 ==========
        // PT 세션 생성은 이미 mutationFn에서 완료됨
        // 최근 세션은 백엔드에서 자동으로 추가되므로, 여기서는 쿼리만 한 번 새로고침

        // 백엔드 처리 시간을 고려하여 잠시 대기
        await new Promise((resolve) => setTimeout(resolve, 300));

        // 1. PT 세션 목록 새로고침 (최근 세션에 반영) - 단 한 번만 수행
        await queryClient.invalidateQueries({
          queryKey: ["pt-sessions", memberId],
        });

        // 세션 목록을 직접 가져와서 중복 확인 및 PT 횟수 업데이트
        const updatedSessionData = await ptSessionApi.getList(memberId);
        const newCompletedSessions = updatedSessionData.completedSessions || 0;

        // 중복 확인: 같은 날짜의 세션이 1개인지 확인
        const sessionsForDate =
          updatedSessionData.sessions?.filter(
            (session) => session.sessionDate.split("T")[0] === sessionDate
          ) || [];

        // 같은 날짜에 여러 세션이 있으면 가장 최근 것만 남기고 나머지 삭제
        if (sessionsForDate.length > 1) {
          console.log(
            `[WorkoutCalendar] 중복 세션 발견 (${sessionsForDate.length}개):`,
            sessionDate
          );

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
              console.log(
                `[WorkoutCalendar] 중복 세션 삭제:`,
                sessionsForDate[i].id
              );
              await ptSessionApi.delete(memberId, sessionsForDate[i].id);
            } catch (error) {
              console.error("[WorkoutCalendar] 중복 세션 삭제 실패:", error);
            }
          }

          // 중복 삭제 후 세션 목록 다시 가져오기
          const finalSessionData = await ptSessionApi.getList(memberId);
          const finalCompletedSessions =
            finalSessionData.completedSessions || 0;

          // PT 횟수 업데이트
          const ptCount = await ptCountApi.get(memberId);
          if (ptCount) {
            await ptCountApi.createOrUpdate(memberId, {
              totalCount: ptCount.totalCount,
              usedCount: finalCompletedSessions,
              remainingCount: ptCount.totalCount - finalCompletedSessions,
            });
            queryClient.invalidateQueries({
              queryKey: ["pt-count", memberId],
            });
          }

          // 세션 목록 다시 무효화하여 최신 데이터 반영
          queryClient.invalidateQueries({
            queryKey: ["pt-sessions", memberId],
          });
        } else {
          // 중복이 없으면 정상적으로 PT 횟수 업데이트
          const ptCount = await ptCountApi.get(memberId);
          if (ptCount) {
            await ptCountApi.createOrUpdate(memberId, {
              totalCount: ptCount.totalCount,
              usedCount: newCompletedSessions,
              remainingCount: ptCount.totalCount - newCompletedSessions,
            });
            queryClient.invalidateQueries({
              queryKey: ["pt-count", memberId],
            });
          }
        }

        // 2. PT 세션 목록 쿼리 새로고침 (단 한 번만) - invalidate 후 refetch
        // 주의: refetchQueries는 invalidateQueries 후 자동으로 실행되므로,
        // 여기서는 invalidate만 하고 MemberPTSessionProgress 컴포넌트가 자동으로 refetch하도록 함
        // 따라서 추가 refetchQueries 호출은 하지 않음

        // 3. 낙관적 업데이트: 캘린더 UI 업데이트 (덮어쓰기 방지)
        if (isInCurrentRange) {
          queryClient.setQueryData<WorkoutCalendarResponse | undefined>(
            ["workout-calendar", memberId, startDate, endDate],
            (old) => {
              if (!old) {
                return {
                  events: [
                    {
                      date: sessionDate,
                      ptSessions: 1,
                      selfWorkouts: 0,
                    },
                  ],
                  startDate,
                  endDate,
                };
              }

              const existingIndex = old.events.findIndex((event) => {
                const eventDate = event.date.split("T")[0];
                return eventDate === sessionDate;
              });

              let newEvents = [...old.events];

              if (existingIndex >= 0) {
                // 기존 이벤트가 있으면 덮어쓰지 않고 누적
                const existing = newEvents[existingIndex];
                newEvents[existingIndex] = {
                  ...existing,
                  ptSessions: (existing.ptSessions || 0) + 1,
                  selfWorkouts: existing.selfWorkouts || 0, // 개인운동은 유지
                };
              } else {
                // 새 이벤트 추가
                newEvents.push({
                  date: sessionDate,
                  ptSessions: 1,
                  selfWorkouts: 0,
                });
              }

              return {
                ...old,
                events: newEvents,
              };
            }
          );
        }

        // 5. 모달 열기 및 최종 동기화
        setSelectedDate(sessionDate);
        setShowSessionTypeModal(false);
        setShowRecordModal(true);

        // 최종 동기화: 캘린더와 운동 기록만 새로고침
        // 주의: PT 세션은 이미 invalidateQueries로 처리되었으므로
        // MemberPTSessionProgress 컴포넌트가 자동으로 refetch함
        // 여기서는 추가로 refetchQueries를 호출하지 않음
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
        // 개인 운동인 경우 낙관적 업데이트 (PT 세션 유지)
        const personalDate = date.split("T")[0];
        if (isInCurrentRange) {
          queryClient.setQueryData<WorkoutCalendarResponse | undefined>(
            ["workout-calendar", memberId, startDate, endDate],
            (old) => {
              if (!old) {
                return {
                  events: [
                    {
                      date: personalDate,
                      ptSessions: 0,
                      selfWorkouts: 1,
                    },
                  ],
                  startDate,
                  endDate,
                };
              }

              const existingIndex = old.events.findIndex((event) => {
                const eventDate = event.date.split("T")[0];
                return eventDate === personalDate;
              });

              let newEvents = [...old.events];

              if (existingIndex >= 0) {
                // 기존 이벤트가 있으면 덮어쓰지 않고 누적
                const existing = newEvents[existingIndex];
                newEvents[existingIndex] = {
                  ...existing,
                  ptSessions: existing.ptSessions || 0, // PT 세션은 유지
                  selfWorkouts: (existing.selfWorkouts || 0) + 1,
                };
              } else {
                // 새 이벤트 추가
                newEvents.push({
                  date: personalDate,
                  ptSessions: 0,
                  selfWorkouts: 1,
                });
              }

              return {
                ...old,
                events: newEvents,
              };
            }
          );
        }

        // 방금 추가한 날짜를 선택 상태로 유지하고, 해당 날짜의 운동 기록 모달을 열기
        setSelectedDate(personalDate);
        setShowSessionTypeModal(false);
        setShowRecordModal(true);

        // 해당 날짜의 운동 기록 목록 쿼리 새로고침
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
  });

  // 운동 기록 삭제 mutation (양방향 동기화)
  const deleteWorkoutMutation = useMutation({
    mutationFn: (recordId: string) =>
      workoutRecordApi.delete(memberId, recordId),
    onSuccess: async (_data, recordId) => {
      // 삭제된 기록의 정보 찾기
      const deletedRecord = selectedDateRecords?.records?.find(
        (r) => r.id === recordId
      );
      const deletedDate = deletedRecord?.workoutDate
        ? deletedRecord.workoutDate.split("T")[0]
        : selectedDate;
      const wasPT = deletedRecord?.workoutType === "PT";

      if (!deletedDate) {
        // 날짜를 찾을 수 없으면 기본 동기화만 수행
        queryClient.invalidateQueries({
          queryKey: ["workout-calendar", memberId],
        });
        queryClient.invalidateQueries({
          queryKey: ["workout-records", memberId],
        });
        return;
      }

      // ========== 양방향 삭제 동기화 ==========
      // PT 타입 운동 기록 삭제 시 해당 날짜의 PT 세션도 삭제 (최근 세션에서도 제거)
      if (wasPT) {
        try {
          const ptSessionsData = await ptSessionApi.getList(memberId);
          const sessionToDelete = ptSessionsData.sessions?.find((session) => {
            const sessionDate = session.sessionDate.split("T")[0];
            return sessionDate === deletedDate;
          });

          if (sessionToDelete) {
            // PT 세션 삭제 (최근 세션에서도 제거됨)
            await ptSessionApi.delete(memberId, sessionToDelete.id);

            // PT 세션 목록 새로고침 (최근 세션 동기화)
            await queryClient.invalidateQueries({
              queryKey: ["pt-sessions", memberId],
            });
            await queryClient.refetchQueries({
              queryKey: ["pt-sessions", memberId],
            });

            // PT 횟수 업데이트
            const updatedSessionData = await ptSessionApi.getList(memberId);
            const newCompletedSessions =
              updatedSessionData.completedSessions || 0;

            const ptCount = await ptCountApi.get(memberId);
            if (ptCount) {
              await ptCountApi.createOrUpdate(memberId, {
                totalCount: ptCount.totalCount,
                usedCount: newCompletedSessions,
                remainingCount: ptCount.totalCount - newCompletedSessions,
              });
              queryClient.invalidateQueries({
                queryKey: ["pt-count", memberId],
              });
            }
          }
        } catch (error) {
          console.error("[WorkoutCalendar] PT 세션 삭제 실패:", error);
        }
      }

      // 캘린더 낙관적 업데이트 (UI 즉시 반영)
      const isInCurrentRange =
        deletedDate >= startDate && deletedDate <= endDate;

      if (isInCurrentRange) {
        queryClient.setQueryData<WorkoutCalendarResponse | undefined>(
          ["workout-calendar", memberId, startDate, endDate],
          (old) => {
            if (!old) return old;

            const existingIndex = old.events.findIndex((event) => {
              const eventDate = event.date.split("T")[0];
              return eventDate === deletedDate;
            });

            if (existingIndex >= 0) {
              const existing = old.events[existingIndex];
              const newPtSessions = Math.max(
                0,
                existing.ptSessions - (wasPT ? 1 : 0)
              );
              const newSelfWorkouts = Math.max(
                0,
                existing.selfWorkouts - (wasPT ? 0 : 1)
              );

              if (newPtSessions === 0 && newSelfWorkouts === 0) {
                // 모든 기록이 삭제되면 이벤트 제거
                return {
                  ...old,
                  events: old.events.filter((_, i) => i !== existingIndex),
                };
              } else {
                // 일부 기록만 삭제되면 카운트 감소
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
              }
            }

            return old;
          }
        );
      }

      // 서버 데이터와 동기화
      await Promise.all([
        queryClient.refetchQueries({
          queryKey: ["workout-calendar", memberId, startDate, endDate],
        }),
        queryClient.refetchQueries({
          queryKey: ["workout-records", memberId, deletedDate],
        }),
      ]);

      // 모든 기록이 삭제되면 모달 닫기
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
      // 삭제될 세션의 날짜 찾기
      const sessionToDelete = selectedDatePTSessions?.sessions?.find(
        (s) => s.id === sessionId
      );
      const sessionDate = sessionToDelete?.sessionDate
        ? sessionToDelete.sessionDate.split("T")[0]
        : selectedDate;

      if (!sessionDate) {
        // 날짜를 찾을 수 없으면 기본 동기화만 수행
        queryClient.invalidateQueries({
          queryKey: ["pt-sessions", memberId],
        });
        queryClient.invalidateQueries({
          queryKey: ["workout-calendar", memberId],
        });
        return;
      }

      // ========== 양방향 삭제 동기화 ==========
      // PT 세션 삭제 시 해당 날짜의 PT 타입 운동 기록도 삭제
      try {
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
        }
      } catch (error) {
        console.error("[WorkoutCalendar] PT 운동 기록 삭제 실패:", error);
      }

      // PT 세션 목록 새로고침 (최근 세션 동기화)
      await queryClient.invalidateQueries({
        queryKey: ["pt-sessions", memberId],
      });
      await queryClient.refetchQueries({
        queryKey: ["pt-sessions", memberId],
      });

      // PT 횟수 업데이트
      const ptCount = await ptCountApi.get(memberId);
      if (ptCount) {
        const updatedSessionData = await ptSessionApi.getList(memberId);
        const newCompletedSessions = updatedSessionData.completedSessions || 0;

        await ptCountApi.createOrUpdate(memberId, {
          totalCount: ptCount.totalCount,
          usedCount: newCompletedSessions,
          remainingCount: ptCount.totalCount - newCompletedSessions,
        });
        queryClient.invalidateQueries({
          queryKey: ["pt-count", memberId],
        });
      }

      // 캘린더 낙관적 업데이트 (UI 즉시 반영)
      const isInCurrentRange =
        sessionDate >= startDate && sessionDate <= endDate;

      if (isInCurrentRange) {
        queryClient.setQueryData<WorkoutCalendarResponse | undefined>(
          ["workout-calendar", memberId, startDate, endDate],
          (old) => {
            if (!old) return old;

            const existingIndex = old.events.findIndex((event) => {
              const eventDate = event.date.split("T")[0];
              return eventDate === sessionDate;
            });

            if (existingIndex === -1) return old;

            const existing = old.events[existingIndex];
            const newPtSessions = Math.max(0, existing.ptSessions - 1);

            if (newPtSessions === 0 && existing.selfWorkouts === 0) {
              // 모든 기록이 삭제되면 이벤트 제거
              return {
                ...old,
                events: old.events.filter((_, i) => i !== existingIndex),
              };
            } else {
              // PT 기록만 삭제되면 카운트 감소
              const newEvents = [...old.events];
              newEvents[existingIndex] = {
                ...existing,
                ptSessions: newPtSessions,
              };
              return {
                ...old,
                events: newEvents,
              };
            }
          }
        );
      }

      // 서버 데이터와 동기화
      await Promise.all([
        queryClient.refetchQueries({
          queryKey: ["workout-calendar", memberId, startDate, endDate],
        }),
        queryClient.refetchQueries({
          queryKey: ["workout-records", memberId, sessionDate],
        }),
      ]);

      // 모든 기록이 삭제되면 모달 닫기
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

    // 해당 날짜에 운동 기록이 있는지 확인
    const event = calendarData?.events?.find((e) => {
      const eventDate = e.date.split("T")[0];
      return eventDate === dateString;
    });
    const hasRecordsInCalendar =
      (event?.ptSessions ?? 0) > 0 || (event?.selfWorkouts ?? 0) > 0;

    // 실제 API에서도 확인
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
          const recordDate = record.workoutDate.split("T")[0];
          return recordDate === dateString;
        }) || [];

      const hasRecords = filteredRecords.length > 0;

      // PT 세션도 확인
      let hasPTSessions = false;
      try {
        const ptSessionsData = await ptSessionApi.getList(memberId);
        const ptSessionsForDate =
          ptSessionsData.sessions?.filter((session) => {
            if (!session.sessionDate) return false;
            const sessionDate = session.sessionDate.split("T")[0];
            return sessionDate === dateString;
          }) || [];
        hasPTSessions = ptSessionsForDate.length > 0;
      } catch (error) {
        console.error("PT 세션 조회 실패:", error);
      }

      if (hasRecords || hasRecordsInCalendar || hasPTSessions) {
        setShowRecordModal(true);
      } else {
        setShowSessionTypeModal(true);
      }
    } catch (error) {
      console.error("운동 기록 조회 실패:", error);
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
        {/* 월 네비게이션 */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevMonth}
            className="px-3 py-1"
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
            className="px-3 py-1"
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
              {selectedDate &&
                (() => {
                  const [year, month, day] = selectedDate
                    .split("-")
                    .map(Number);
                  const date = new Date(year, month - 1, day);
                  return date.toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  });
                })()}
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
                disabled={createWorkoutMutation.isPending}
                className="flex-1"
              >
                PT 세션
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
              {selectedDate &&
                (() => {
                  const [year, month, day] = selectedDate
                    .split("-")
                    .map(Number);
                  const date = new Date(year, month - 1, day);
                  return date.toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  });
                })()}
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
                            {new Date(session.sessionDate).toLocaleDateString(
                              "ko-KR",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
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
                  {selectedDate &&
                    (() => {
                      const [year, month, day] = selectedDate
                        .split("-")
                        .map(Number);
                      const date = new Date(year, month - 1, day);
                      return date.toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      });
                    })()}{" "}
                  운동 기록이 없습니다.
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
