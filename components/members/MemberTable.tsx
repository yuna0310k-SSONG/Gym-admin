"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import type { Member } from "@/types/api/responses";
import { formatPhoneNumberKR } from "@/lib/utils/phone";

interface MemberTableProps {
  members: Member[];
}

export default function MemberTable({ members }: MemberTableProps) {
  const router = useRouter();

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
    <Table>
      <TableHeader>
        <TableHeaderCell>이름</TableHeaderCell>
        <TableHeaderCell>이메일</TableHeaderCell>
        <TableHeaderCell>전화번호</TableHeaderCell>
        <TableHeaderCell>가입일</TableHeaderCell>
        <TableHeaderCell>상태</TableHeaderCell>
      </TableHeader>
      <tbody className="bg-[#0f1115] divide-y divide-[#374151]">
        {members.map((member) => (
          <TableRow
            key={member.id}
            onClick={() => router.push(`/dashboard/members/${member.id}`)}
            className="hover:bg-[#1a1d24] transition-colors"
          >
            <TableCell className="text-[#e5e7eb]">{member.name}</TableCell>
            <TableCell className="text-[#9ca3af]">{member.email}</TableCell>
            <TableCell className="text-[#9ca3af]">
              {formatPhoneNumberKR(member.phone)}
            </TableCell>
            <TableCell className="text-[#9ca3af]">
              {new Date(member.joinDate).toLocaleDateString("ko-KR")}
            </TableCell>
            <TableCell>{getStatusBadge(member.status)}</TableCell>
          </TableRow>
        ))}
      </tbody>
    </Table>
  );
}
