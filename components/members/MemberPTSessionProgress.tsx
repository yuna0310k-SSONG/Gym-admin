"use client";

import { useQuery } from "@tanstack/react-query";
import Card from "@/components/ui/Card";
import { ptSessionApi } from "@/lib/api/pt-sessions";
import { useState } from "react";

interface MemberPTSessionProgressProps {
  memberId: string;
}

export default function MemberPTSessionProgress({
  memberId,
}: MemberPTSessionProgressProps) {
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  const { data: sessionData, isLoading } = useQuery({
    queryKey: ["pt-sessions", memberId],
    queryFn: () => ptSessionApi.getList(memberId),
    enabled: !!memberId,
  });

  if (isLoading) {
    return (
      <Card title="PT 세션 진행률" className="bg-[#0f1115]">
        <div className="flex items-center justify-center h-24">
          <p className="text-[#c9c7c7]">로딩 중...</p>
        </div>
      </Card>
    );
  }

  if (!sessionData) {
    return (
      <Card title="PT 세션 진행률" className="bg-[#0f1115]">
        <div className="text-center py-6">
          <p className="text-[#9ca3af]">PT 세션 데이터가 없습니다.</p>
        </div>
      </Card>
    );
  }

  const progress = sessionData.totalSessions
    ? (sessionData.completedSessions / sessionData.totalSessions) * 100
    : 0;

  return (
    <Card title="PT 세션 진행률" className="bg-[#0f1115]">
      <div className="space-y-4">
        {/* 진행률 바 */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-[#c9c7c7]">
              {sessionData.completedSessions}회 / {sessionData.totalSessions}회
            </span>
            <span className="text-white font-bold text-lg">
              {progress.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-[#1a1d24] rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 최근 세션 목록 */}
        {sessionData.sessions.length > 0 && (
          <div className="pt-3 border-t border-[#374151]">
            <p className="text-sm text-[#9ca3af] mb-3">최근 세션</p>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {sessionData.sessions.slice(0, 3).map((session) => (
                <div
                  key={session.id}
                  className="p-3 bg-[#1a1d24] rounded-lg cursor-pointer hover:bg-[#252830] transition-colors"
                  onClick={() =>
                    setSelectedSession(
                      selectedSession === session.id ? null : session.id
                    )
                  }
                >
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">
                      {session.sessionNumber}회차
                    </span>
                    <span className="text-[#9ca3af] text-sm">
                      {new Date(session.sessionDate).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                  {selectedSession === session.id && session.mainContent && (
                    <p className="mt-2 text-[#c9c7c7] text-sm pt-2 border-t border-[#374151]">
                      {session.mainContent}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
