"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { trainerApi } from "@/lib/api/trainers";
import type { TrainerApprovalRequest } from "@/lib/api/trainers";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function TrainersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [pendingTrainers, setPendingTrainers] = useState<TrainerApprovalRequest[]>([]);
  const [approvedTrainers, setApprovedTrainers] = useState<TrainerApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Admin만 접근 가능
    if (!user) {
      return; // user가 로딩 중이면 대기
    }

    if (user.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }

    fetchTrainers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role, router]);

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      
      // 승인 대기 트레이너 목록 조회 (처음 회원가입한 계정들)
      const pendingData = await trainerApi.getPendingTrainers();
      
      // 전체 트레이너 목록 조회 (승인됨/대기중 모두)
      const allData = await trainerApi.getAllTrainers();
      
      // 디버깅용 로그
      if (process.env.NODE_ENV === "development") {
        console.log("[Trainers Page] Pending trainers:", pendingData);
        console.log("[Trainers Page] All trainers:", allData);
      }

      // 승인 대기 트레이너: pending-trainers API에서 받은 목록
      const pending = pendingData?.trainers || [];
      
      // 승인된 트레이너: 전체 목록에서 isApproved === true인 트레이너만 필터링
      const approved = (allData?.trainers || []).filter(
        (t) => t.isApproved === true
      );

      setPendingTrainers(pending);
      setApprovedTrainers(approved);
    } catch (error) {
      console.error("트레이너 목록 조회 실패:", error);
      setPendingTrainers([]);
      setApprovedTrainers([]);
      alert(
        error instanceof Error
          ? error.message
          : "트레이너 목록을 불러오지 못했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (trainerId: string) => {
    if (!confirm("이 트레이너를 승인하시겠습니까?")) {
      return;
    }

    try {
      await trainerApi.approveTrainer(trainerId);
      alert("트레이너가 승인되었습니다.");
      fetchTrainers(); // 목록 새로고침
    } catch (error) {
      console.error("트레이너 승인 실패:", error);
      alert(
        error instanceof Error
          ? error.message
          : "트레이너 승인에 실패했습니다."
      );
    }
  };

  const handleReject = async (trainerId: string) => {
    if (!confirm("이 트레이너를 거부하시겠습니까?")) {
      return;
    }

    try {
      await trainerApi.rejectTrainer(trainerId);
      alert("트레이너가 거부되었습니다.");
      fetchTrainers(); // 목록 새로고침
    } catch (error) {
      console.error("트레이너 거부 실패:", error);
      alert(
        error instanceof Error
          ? error.message
          : "트레이너 거부에 실패했습니다."
      );
    }
  };

  const handleDisapprove = async (trainerId: string) => {
    if (!confirm("이 트레이너의 승인을 취소하시겠습니까?")) {
      return;
    }

    try {
      await trainerApi.disapproveTrainer(trainerId);
      alert("트레이너 승인이 취소되었습니다.");
      fetchTrainers(); // 목록 새로고침
    } catch (error) {
      console.error("트레이너 승인 취소 실패:", error);
      alert(
        error instanceof Error
          ? error.message
          : "트레이너 승인 취소에 실패했습니다."
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[#9ca3af]">로딩 중...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">트레이너 관리</h1>
        <p className="text-[#9ca3af] mt-2">
          승인 대기 중인 트레이너를 승인하거나, 이미 승인된 트레이너를 제한할 수 있습니다.
        </p>
      </div>

      {/* 승인 대기 트레이너 목록 */}
      <Card className="bg-[#0f1115] mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">승인 대기 트레이너</h2>
        {pendingTrainers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[#9ca3af]">승인 대기 중인 트레이너가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingTrainers.map((trainer) => (
              <div
                key={trainer.id}
                className="p-4 bg-[#1a1d24] rounded-lg border border-[#374151]"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {trainer.name}
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p className="text-[#9ca3af]">
                        <span className="text-[#c9c7c7]">이메일:</span>{" "}
                        {trainer.email}
                      </p>
                      <p className="text-[#9ca3af]">
                        <span className="text-[#c9c7c7]">가입일:</span>{" "}
                        {new Date(trainer.createdAt).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleApprove(trainer.id)}
                    >
                      승인
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleReject(trainer.id)}
                    >
                      거부
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 승인된 트레이너 목록 */}
      <Card className="bg-[#0f1115]">
        <h2 className="text-xl font-semibold text-white mb-4">전체 트레이너 상태</h2>
        {approvedTrainers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[#9ca3af]">승인된 트레이너가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {approvedTrainers.map((trainer) => (
              <div
                key={trainer.id}
                className="p-4 bg-[#1a1d24] rounded-lg border border-[#374151]"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {trainer.name}
                      </h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                        승인됨
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="text-[#9ca3af]">
                        <span className="text-[#c9c7c7]">이메일:</span>{" "}
                        {trainer.email}
                      </p>
                      <p className="text-[#9ca3af]">
                        <span className="text-[#c9c7c7]">가입일:</span>{" "}
                        {new Date(trainer.createdAt).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDisapprove(trainer.id)}
                    >
                      승인 취소
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

