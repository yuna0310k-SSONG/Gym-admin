"use client";

interface TodaySummaryProps {
  newMembers: number;
  assessments: number;
  deletions: number;
  isLoading?: boolean;
}

export default function TodaySummary({
  newMembers,
  assessments,
  deletions,
  isLoading = false,
}: TodaySummaryProps) {
  if (isLoading) {
    return (
      <div className="py-2 px-4 bg-[#1a1d24] rounded-lg border border-[#374151] animate-pulse">
        <div className="h-4 bg-[#374151] rounded w-48"></div>
      </div>
    );
  }

  return (
    <div className="py-2 px-4 bg-[#1a1d24] rounded-lg border border-[#374151]">
      <p className="text-sm text-[#e5e7eb]">
        <span className="text-[#9ca3af]">오늘:</span>{" "}
        <span className="font-medium text-white">신규 회원 {newMembers}명</span>
        {" · "}
        <span className="font-medium text-white">평가 등록 {assessments}건</span>
        {" · "}
        <span className="font-medium text-white">삭제 {deletions}건</span>
      </p>
    </div>
  );
}

