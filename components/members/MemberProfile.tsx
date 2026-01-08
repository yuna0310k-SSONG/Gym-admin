import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import type { Member } from "@/types/api/responses";
import { formatPhoneNumberKR } from "@/lib/utils/phone";

interface MemberProfileProps {
  member: Member;
}

export default function MemberProfile({ member }: MemberProfileProps) {
  const getStatusBadge = (status: Member["status"]) => {
    const statusMap = {
      ACTIVE: { variant: "success" as const, label: "활성" },
      INACTIVE: { variant: "default" as const, label: "비활성" },
      SUSPENDED: { variant: "danger" as const, label: "정지" },
    };
    const { variant, label } = statusMap[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <Card title="회원 정보" className="bg-[#0f1115]">
      <div className="space-y-6">
        {/* 이름 및 상태 */}
        <div className="flex items-center justify-between pb-4 border-b border-[#374151]">
          <div>
            <p className="text-2xl font-bold text-white">{member.name}</p>
            <p className="text-sm text-[#9ca3af] mt-1">{member.email}</p>
          </div>
          {getStatusBadge(member.status)}
        </div>

        {/* 상세 정보 */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-[#9ca3af]">전화번호</label>
            <p className="mt-1 text-[#e5e7eb]">{formatPhoneNumberKR(member.phone)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-[#9ca3af]">가입일</label>
            <p className="mt-1 text-[#e5e7eb]">
              {new Date(member.joinDate).toLocaleDateString("ko-KR")}
            </p>
          </div>
          {member.height && (
            <div>
              <label className="text-sm font-medium text-[#9ca3af]">키</label>
              <p className="mt-1 text-[#e5e7eb]">{member.height} cm</p>
            </div>
          )}
          {member.weight && (
            <div>
              <label className="text-sm font-medium text-[#9ca3af]">몸무게</label>
              <p className="mt-1 text-[#e5e7eb]">{member.weight} kg</p>
            </div>
          )}
          {member.gender && (
            <div>
              <label className="text-sm font-medium text-[#9ca3af]">성별</label>
              <p className="mt-1 text-[#e5e7eb]">
                {member.gender === "MALE" ? "남성" : "여성"}
              </p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-[#9ca3af]">등록일</label>
            <p className="mt-1 text-[#e5e7eb]">
              {new Date(member.createdAt).toLocaleDateString("ko-KR")}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-[#9ca3af]">최근 수정</label>
            <p className="mt-1 text-[#e5e7eb]">
              {new Date(member.updatedAt).toLocaleDateString("ko-KR")}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
