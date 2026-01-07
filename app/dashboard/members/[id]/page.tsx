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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    setShowDeleteConfirm(true);
  };

  const handleFirstConfirm = () => {
    setShowDeleteConfirm(false);
    setShowFinalConfirm(true);
  };

  const handleFinalConfirm = async () => {
    if (!member) return;

    try {
      setIsDeleting(true);
      await memberApi.deleteMember(member.id);
      // 삭제 성공 시 회원 목록으로 이동
      router.push("/dashboard/members");
    } catch (error) {
      console.error("회원 삭제 실패:", error);
      alert(
        error instanceof Error ? error.message : "회원 삭제에 실패했습니다."
      );
      setIsDeleting(false);
      setShowFinalConfirm(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setShowFinalConfirm(false);
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
      label: "운동 분석",
      content: <WorkoutVolumeAnalysis memberId={member.id} />,
    },
    {
      id: "injuries",
      label: "부상 관리",
      content: <MemberInjuriesTab memberId={member.id} />,
    },
    {
      id: "analytics",
      label: "분석",
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
            {isDeleting ? "삭제 중..." : "탈퇴"}
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

      {/* 첫 번째 확인 다이얼로그 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-[#1a1d24] rounded-lg p-6 max-w-md w-full mx-4 border border-[#374151]">
            <h3 className="text-lg font-semibold text-white mb-4">
              회원 탈퇴 확인
            </h3>
            <p className="text-[#c9c7c7] mb-6">
              정말 탈퇴하시겠습니까?
              <br />
              <span className="text-red-400 text-sm mt-2 block">
                이 작업은 되돌릴 수 없습니다.
              </span>
            </p>
            <div className="flex space-x-3">
              <Button
                variant="danger"
                className="flex-1"
                onClick={handleFirstConfirm}
              >
                탈퇴하기
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCancelDelete}
              >
                취소
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 두 번째 최종 확인 다이얼로그 */}
      {showFinalConfirm && member && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-[#1a1d24] rounded-lg p-6 max-w-md w-full mx-4 border border-[#374151]">
            <h3 className="text-lg font-semibold text-white mb-4">최종 확인</h3>
            <p className="text-[#c9c7c7] mb-6">
              <span className="text-white font-semibold">{member.name}</span>
              님 탈퇴하시는게 맞나요?
              <br />
              <span className="text-red-400 text-sm mt-2 block">
                회원 정보와 모든 데이터가 영구적으로 삭제됩니다.
              </span>
            </p>
            <div className="flex space-x-3">
              <Button
                variant="danger"
                className="flex-1"
                onClick={handleFinalConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? "삭제 중..." : "네, 탈퇴합니다"}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCancelDelete}
                disabled={isDeleting}
              >
                취소
              </Button>
            </div>
            {isDeleting && (
              <p className="text-sm text-[#c9c7c7] mt-4 text-center">
                회원 정보를 삭제하는 중입니다...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
