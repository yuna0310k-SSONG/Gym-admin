"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import MemberProfile from "@/components/members/MemberProfile";
import Card from "@/components/ui/Card";
import Tabs from "@/components/ui/Tabs";
import MemberAbilitiesTab from "@/components/members/MemberAbilitiesTab";
import MemberInjuriesTab from "@/components/members/MemberInjuriesTab";
import MemberAnalyticsTab from "@/components/members/MemberAnalyticsTab";
import MemberGoalCard from "@/components/members/MemberGoalCard";
import MemberPTSessionProgress from "@/components/members/MemberPTSessionProgress";
import WorkoutCalendar from "@/components/members/WorkoutCalendar";
import WorkoutVolumeAnalysis from "@/components/members/WorkoutVolumeAnalysis";
import type { Member } from "@/types/api/responses";
import { memberApi } from "@/lib/api/members";

export default function MemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("abilities");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
      <div className="flex items-center justify-center h-64">
        <p className="text-[#c9c7c7]">로딩 중...</p>
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
    <div className="max-w-[1200px] mx-auto px-6 py-6 space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link
            href="/dashboard/members"
            className="text-blue-400 hover:text-blue-300 text-sm mb-2 inline-block"
          >
            ← 목록으로 돌아가기
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {member.name} 회원 상세
          </h1>
        </div>
        <div className="flex space-x-3">
          <Link href={`/dashboard/members/${member.id}/edit`}>
            <Button variant="primary">수정</Button>
          </Link>
          <Button
            variant="danger"
            onClick={handleDeleteClick}
            disabled={isDeleting}
          >
            삭제
          </Button>
        </div>
      </div>

      {/* 목표 관리 (카드 없이) */}
      <section>
        <MemberGoalCard memberId={member.id} />
      </section>

      {/* 회원 정보 + 운동 캘린더 */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MemberProfile member={member} />
          <WorkoutCalendar memberId={member.id} />
        </div>
      </section>

      {/* PT 진행률 */}
      <section>
        <MemberPTSessionProgress memberId={member.id} />
      </section>

      {/* 탭 콘텐츠 */}
      <section>
        <Card className="bg-[#0f1115]">
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </Card>
      </section>

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={(e) => {
            // 배경 클릭 시 모달 닫기
            if (e.target === e.currentTarget) {
              setShowDeleteConfirm(false);
            }
          }}
        >
          <div
            className="bg-[#1a1d24] rounded-lg p-6 max-w-md w-full mx-4 border border-red-500/30"
            onClick={(e) => {
              // 모달 컨텐츠 클릭 시 이벤트 전파 방지
              e.stopPropagation();
            }}
          >
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-red-400 mb-2">
                회원 삭제 확인
              </h3>
              <p className="text-[#c9c7c7] text-sm">
                해당 회원 삭제하시겠습니까?
                <br />
                <span className="font-semibold text-white">
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
  );
}
