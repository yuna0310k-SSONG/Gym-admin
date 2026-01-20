"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import MemberProfile from "@/components/members/MemberProfile";
import Card from "@/components/ui/Card";
import Tabs from "@/components/ui/Tabs";
import Skeleton, { CardSkeleton } from "@/components/ui/Skeleton";
import MemberAbilitiesTab from "@/components/members/MemberAbilitiesTab";
import MemberInjuriesTab from "@/components/members/MemberInjuriesTab";
import MemberAnalyticsTab from "@/components/members/MemberAnalyticsTab";
import MemberGoalCard from "@/components/members/MemberGoalCard";
import MemberPTSessionProgress from "@/components/members/MemberPTSessionProgress";
import WorkoutCalendar from "@/components/members/WorkoutCalendar";
import WorkoutVolumeAnalysis from "@/components/members/WorkoutVolumeAnalysis";
import type { Member } from "@/types/api/responses";
import { memberApi } from "@/lib/api/members";
import { assessmentApi } from "@/lib/api/assessments";
import { goalApi } from "@/lib/api/goals";
import type { MemberGoalResponse } from "@/types/api/responses";

export default function MemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("abilities");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showInitialAssessmentAlert, setShowInitialAssessmentAlert] = useState(false);
  const [hasInitialAssessment, setHasInitialAssessment] = useState<boolean | null>(null);
  const [memberGoal, setMemberGoal] = useState<MemberGoalResponse | null>(null);

  useEffect(() => {
    const fetchMember = async () => {
      if (!params.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await memberApi.getMember(params.id as string);

        // 디버깅용 로그
        if (process.env.NODE_ENV === "development") {
          console.log("[Member Detail] Fetched member data:", data);
        }

        setMember(data);

        // 초기 평가 확인
        try {
          const assessments = await assessmentApi.getAssessments(params.id as string);
          const initialAssessment = assessments.assessments.find(
            (assessment) => assessment.assessmentType === "INITIAL" || assessment.isInitial
          );
          const hasInitial = !!initialAssessment;
          setHasInitialAssessment(hasInitial);
          
          if (!hasInitial) {
            setShowInitialAssessmentAlert(true);
          }
        } catch (error) {
          console.error("평가 목록 조회 실패:", error);
          setHasInitialAssessment(false);
          setShowInitialAssessmentAlert(true);
        }

        try {
          const goal = await goalApi.get(params.id as string);
          setMemberGoal(goal);
        } catch (goalError) {
          setMemberGoal(null);
        }
      } catch (error) {
        console.error("회원 조회 실패:", error);
        setMember(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [params.id]);

  const handleDeleteClick = () => {
    if (process.env.NODE_ENV === "development") {
      console.log("[Member Detail] 삭제 버튼 클릭, 모달 표시");
    }
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!member) {
      console.error("[Member Detail] 회원 정보가 없습니다.");
      return;
    }

    if (process.env.NODE_ENV === "development") {
      console.log("[Member Detail] 삭제 확인, 회원 ID:", member.id);
    }

    try {
      setIsDeleting(true);
      await memberApi.deleteMember(member.id);

      if (process.env.NODE_ENV === "development") {
        console.log("[Member Detail] 회원 삭제 성공, 목록으로 이동");
      }

      router.push("/dashboard/members");
    } catch (error) {
      console.error("회원 삭제 실패:", error);
      alert(
        error instanceof Error ? error.message : "회원 삭제에 실패했습니다."
      );
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton height={36} width={300} />
          <div className="flex gap-3">
            <Skeleton height={40} width={80} />
            <Skeleton height={40} width={80} />
          </div>
        </div>
        <CardSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center py-12">
        <p className="text-[#c9c7c7] mb-4">회원을 찾을 수 없습니다.</p>
        <Link href="/dashboard/members">
          <Button variant="outline">목록으로 돌아가기</Button>
        </Link>
      </div>
    );
  }

  const tabs = [
    {
      id: "abilities",
      label: "능력치",
      content: <MemberAbilitiesTab memberId={member.id} />,
    },
    {
      id: "workout-analysis",
      label: "운동량 분석",
      content: <WorkoutVolumeAnalysis memberId={member.id} />,
    },
    {
      id: "injuries",
      label: "부상 관리",
      content: <MemberInjuriesTab memberId={member.id} />,
    },
    {
      id: "analytics",
      label: "능력치 분석",
      content: <MemberAnalyticsTab memberId={member.id} />,
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] py-10">
      <div className="max-w-[1200px] mx-auto space-y-8 px-4 sm:px-6">
        <div className="space-y-2">
          <Link
            href="/dashboard/members"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← 전체 대시보드로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{member.name} 회원 상세</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-5">
          <div className="flex-1 rounded-3xl overflow-hidden shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] bg-gradient-to-r from-orange-500 to-orange-400 text-white">
              <div className="px-6 py-8">
                <p className="text-xs uppercase tracking-[0.3em]">main goal</p>
                <h2 className="text-2xl sm:text-3xl font-bold mt-2">
                  {memberGoal?.goal || "목표 미설정"}
                </h2>
                <p className="text-sm mt-3">
                  {memberGoal?.goalTrainerComment || "최대 10kg 감량 목표"}
                </p>
                <div className="mt-8 text-5xl font-bold">{memberGoal?.goalProgress ?? 0}%</div>
                <p className="text-sm text-orange-100 mt-1">달성</p>
              </div>
              <div className="bg-white text-gray-800 py-8 px-6">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">
                  Progress Roadmap
                </p>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Start</span>
                    <span className="text-xs text-gray-500">Goal</span>
                  </div>
                  <div className="rounded-full bg-gray-200 h-3 overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${memberGoal?.goalProgress ?? 0}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Current phase</span>
                    <span>{memberGoal?.goalProgress ?? 0}%</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full border border-green-200 text-green-600 text-xs">
                      상태: GREEN
                    </span>
                    <span className="px-3 py-1 rounded-full border border-gray-200 text-gray-600 text-xs">
                      12주 프로그램
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-1 gap-6">
            <div className="rounded-3xl bg-[var(--ivory-bright)] p-6 shadow-lg border border-[var(--ivory-border)] space-y-3">
              <p className="text-sm text-gray-500 uppercase tracking-[0.3em]">status</p>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-sm text-gray-500">회원님</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                  GREEN
                </span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
                  Current phase
                </p>
                <p className="text-sm text-gray-600">
                  {memberGoal?.goalProgress ?? 0}% 진행 ({memberGoal?.goalProgress ?? 0}%)
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--ivory-bright)] border border-[var(--ivory-border)] rounded-3xl p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            {hasInitialAssessment === false && (
              <Link
                href={`/dashboard/members/${member.id}/assessment/new`}
                className="text-xs sm:text-sm text-gray-700 hover:text-gray-900 bg-[var(--ivory)] border border-[var(--ivory-border)] px-3 py-1.5 rounded-lg shadow-sm transition-colors"
              >
                초기 평가
              </Link>
            )}
            <Link
              href={`/dashboard/members/${member.id}/edit`}
              className="text-xs sm:text-sm text-gray-700 hover:text-gray-900 bg-[var(--ivory)] border border-[var(--ivory-border)] px-3 py-1.5 rounded-lg shadow-sm transition-colors"
            >
              수정
            </Link>
          </div>
          <button
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="text-xs sm:text-sm text-red-500 hover:text-red-700 bg-white border border-red-200 px-3 py-1.5 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            삭제
          </button>
        </div>

        <section className="space-y-6">
          <MemberGoalCard memberId={member.id} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MemberProfile member={member} />
            <WorkoutCalendar memberId={member.id} />
          </div>

          <MemberPTSessionProgress memberId={member.id} />

          <Card className="bg-[var(--ivory-bright)] border border-[var(--ivory-border)] shadow-xs">
            <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
          </Card>
        </section>

        {showInitialAssessmentAlert && (
          <div
            className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowInitialAssessmentAlert(false);
              }
            }}
          >
            <div
              className="bg-[var(--ivory-bright)] rounded-lg p-4 sm:p-6 max-w-md w-full mx-4 border border-yellow-200 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-yellow-600 mb-2">
                  초기 평가 등록 필요
                </h3>
                <p className="text-gray-600 text-sm">
                  해당 회원의 초기 평가가 등록되지 않았습니다.
                  <br />
                  초기 평가를 등록해주세요!
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowInitialAssessmentAlert(false);
                  }}
                  type="button"
                >
                  다음에
                </Button>
                <Button
                  variant="ivory"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowInitialAssessmentAlert(false);
                    router.push(`/dashboard/members/${member.id}/assessment/new`);
                  }}
                  type="button"
                >
                  확인
                </Button>
              </div>
            </div>
          </div>
        )}

      {/* 삭제 확인 모달 */}
        {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDeleteConfirm(false);
            }
          }}
        >
          <div
            className="bg-[var(--ivory-bright)] rounded-lg p-6 max-w-md w-full mx-4 border border-red-200 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-red-500 mb-2">
                회원 삭제 확인
              </h3>
              <p className="text-gray-600 text-sm">
                해당 회원 삭제하시겠습니까?
                <br />
                <span className="font-semibold text-gray-900">
                  {member.name}
                </span>{" "}
                회원의 모든 데이터가 삭제되며 이 작업은 되돌릴 수 없습니다.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!isDeleting) {
                    setShowDeleteConfirm(false);
                  }
                }}
                disabled={isDeleting}
                type="button"
              >
                아니오
              </Button>
              <Button
                variant="danger"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  if (process.env.NODE_ENV === "development") {
                    console.log("[Member Detail] 삭제 확인 버튼 클릭됨", {
                      isDeleting,
                      hasMember: !!member,
                    });
                  }

                  if (!isDeleting && member) {
                    handleDelete();
                  } else {
                    if (process.env.NODE_ENV === "development") {
                      console.warn("[Member Detail] 삭제 실행 불가", {
                        isDeleting,
                        hasMember: !!member,
                      });
                    }
                  }
                }}
                disabled={isDeleting}
                type="button"
                style={{ cursor: isDeleting ? "not-allowed" : "pointer" }}
              >
                {isDeleting ? "삭제 중..." : "네"}
              </Button>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
