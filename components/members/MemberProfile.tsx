import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import type { Member } from "@/types/api/responses";

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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-[#9ca3af]">이름</label>
          <p className="mt-1 text-lg text-[#f9fafb]">{member.name}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-[#9ca3af]">상태</label>
          <div className="mt-1">{getStatusBadge(member.status)}</div>
        </div>
        <div>
          <label className="text-sm font-medium text-[#9ca3af]">이메일</label>
          <p className="mt-1 text-[#e5e7eb]">{member.email}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-[#9ca3af]">전화번호</label>
          <p className="mt-1 text-[#e5e7eb]">{member.phone}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-[#9ca3af]">가입일</label>
          <p className="mt-1 text-[#e5e7eb]">
            {new Date(member.joinDate).toLocaleDateString("ko-KR")}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-[#9ca3af]">등록일</label>
          <p className="mt-1 text-[#e5e7eb]">
            {new Date(member.createdAt).toLocaleDateString("ko-KR")}
          </p>
        </div>
      </div>
    </Card>
  );
}

