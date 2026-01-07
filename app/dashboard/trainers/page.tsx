"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import AlertModal from "@/components/ui/AlertModal";
import { trainerApi } from "@/lib/api/trainers";
import type { TrainerApprovalRequest } from "@/lib/api/trainers";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function TrainersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [pendingTrainers, setPendingTrainers] =
    useState<TrainerApprovalRequest[]>([]);
  const [approvedTrainers, setApprovedTrainers] =
    useState<TrainerApprovalRequest[]>([]);
  const [rejectedTrainers, setRejectedTrainers] =
    useState<TrainerApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title?: string;
    message: string;
    type?: "info" | "success" | "error" | "warning";
  }>({
    isOpen: false,
    message: "",
  });
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

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

      // 승인 대기 트레이너: pending-trainers API에서 받은 목록 중
      // 한 번도 거부되지 않은 계정만 (isApproved가 설정되지 않은 경우)
      const pending = (pendingData?.trainers || []).filter(
        (t) => t.isApproved === undefined || t.isApproved === null
      );

      const all = allData?.trainers || [];

      // 승인된 트레이너: 전체 목록에서 isApproved === true인 트레이너만 필터링
      const approved = all.filter((t) => t.isApproved === true);

      // 거부된 트레이너: 전체 목록에서 isApproved === false인 트레이너
      const rejected = all.filter((t) => t.isApproved === false);

      setPendingTrainers(pending);
      setApprovedTrainers(approved);
      setRejectedTrainers(rejected);
    } catch (error) {
      console.error("트레이너 목록 조회 실패:", error);
      setPendingTrainers([]);
      setApprovedTrainers([]);
      setRejectedTrainers([]);
      setAlertModal({
        isOpen: true,
        title: "트레이너 목록 조회 실패",
        message:
          error instanceof Error
            ? error.message
            : "트레이너 목록을 불러오지 못했습니다.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (trainerId: string) => {
    setConfirmModal({
      isOpen: true,
      title: "트레이너 승인 확인",
      message: "이 트레이너를 승인하시겠습니까?",
      onConfirm: async () => {
        setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: () => {} });
        try {
          await trainerApi.approveTrainer(trainerId);
          setAlertModal({
            isOpen: true,
            title: "승인 완료",
            message: "트레이너가 승인되었습니다.",
            type: "success",
          });
          fetchTrainers(); // 목록 새로고침
        } catch (error) {
          console.error("트레이너 승인 실패:", error);
          setAlertModal({
            isOpen: true,
            title: "트레이너 승인 실패",
            message:
              error instanceof Error
                ? error.message
                : "트레이너 승인에 실패했습니다.",
            type: "error",
          });
        }
      },
    });
  };

  const handleReject = async (trainerId: string) => {
    setConfirmModal({
      isOpen: true,
      title: "트레이너 거부 확인",
      message: "이 트레이너를 거부하시겠습니까?",
      onConfirm: async () => {
        setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: () => {} });
        try {
          await trainerApi.rejectTrainer(trainerId);
          setAlertModal({
            isOpen: true,
            title: "거부 완료",
            message: "트레이너가 거부되었습니다.",
            type: "success",
          });
          fetchTrainers(); // 목록 새로고침
        } catch (error) {
          console.error("트레이너 거부 실패:", error);
          setAlertModal({
            isOpen: true,
            title: "트레이너 거부 실패",
            message:
              error instanceof Error
                ? error.message
                : "트레이너 거부에 실패했습니다.",
            type: "error",
          });
        }
      },
    });
  };

  const handleDisapprove = async (trainerId: string) => {
    setConfirmModal({
      isOpen: true,
      title: "승인 취소 확인",
      message: "이 트레이너의 승인을 취소하시겠습니까?",
      onConfirm: async () => {
        setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: () => {} });
        try {
          await trainerApi.disapproveTrainer(trainerId);
          setAlertModal({
            isOpen: true,
            title: "승인 취소 완료",
            message: "트레이너 승인이 취소되었습니다.",
            type: "success",
          });
          fetchTrainers(); // 목록 새로고침
        } catch (error) {
          console.error("트레이너 승인 취소 실패:", error);
          setAlertModal({
            isOpen: true,
            title: "승인 취소 실패",
            message:
              error instanceof Error
                ? error.message
                : "트레이너 승인 취소에 실패했습니다.",
            type: "error",
          });
        }
      },
    });
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
          승인 대기 / 승인된 / 거부된 트레이너를 한 곳에서 관리할 수 있습니다.
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
        <h2 className="text-xl font-semibold text-white mb-4">
          승인된 트레이너
        </h2>
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

      {/* 거부된 트레이너 목록 */}
      <Card className="bg-[#0f1115] mt-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          거부된 트레이너
        </h2>
        {rejectedTrainers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[#9ca3af]">거부된 트레이너가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rejectedTrainers.map((trainer) => (
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
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                        거부됨
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="text-[#9ca3af]">
                        <span className="text-[#c9c7c7]">이메일:</span>{" "}
                        {trainer.email}
                      </p>
                      <p className="text-[#9ca3af]">
                        <span className="text-[#c9c7c7]">가입일:</span>{" "}
                        {new Date(trainer.createdAt).toLocaleDateString(
                          "ko-KR"
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleApprove(trainer.id)}
                    >
                      다시 승인
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Alert 모달 */}
      <AlertModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal({ isOpen: false, message: "" })}
      />

      {/* Confirm 모달 */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-[#1a1d24] rounded-lg p-6 max-w-md w-full mx-4 border border-[#374151]">
            <h3 className="text-lg font-semibold text-white mb-3">
              {confirmModal.title}
            </h3>
            <p className="text-[#c9c7c7] text-sm mb-6">{confirmModal.message}</p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setConfirmModal({
                    isOpen: false,
                    title: "",
                    message: "",
                    onConfirm: () => {},
                  })
                }
              >
                취소
              </Button>
              <Button variant="primary" size="sm" onClick={confirmModal.onConfirm}>
                확인
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

