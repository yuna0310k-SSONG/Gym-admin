"use client";

import { useRouter } from "next/navigation";
import { Table, TableHeader, TableHeaderCell, TableRow, TableCell } from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import type { RiskMember } from "@/types/api/responses";

interface RiskMemberTableProps {
  members?: RiskMember[];
}

export default function RiskMemberTable({ members }: RiskMemberTableProps) {
  const router = useRouter();
  const safeMembers = members ?? [];

  const getRiskBadge = (riskLevel: RiskMember["riskLevel"]) => {
    const riskMap = {
      HIGH: { variant: "danger" as const, label: "높음" },
      MEDIUM: { variant: "warning" as const, label: "보통" },
      LOW: { variant: "default" as const, label: "낮음" },
    };
    const { variant, label } = riskMap[riskLevel];
    return <Badge variant={variant}>{label}</Badge>;
  };

  if (safeMembers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-[#c9c7c7]">위험 신호가 있는 회원이 없습니다.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableHeaderCell>이름</TableHeaderCell>
        <TableHeaderCell>위험도</TableHeaderCell>
        <TableHeaderCell>위험 사유</TableHeaderCell>
      </TableHeader>
      <tbody className="bg-[#0f1115] divide-y divide-gray-700">
        {safeMembers.map((member) => (
          <TableRow
            key={member.id}
            onClick={() => router.push(`/dashboard/members/${member.id}`)}
            className="cursor-pointer hover:bg-[#1a1d24] transition-colors"
          >
            <TableCell className="text-white">{member.name}</TableCell>
            <TableCell>{getRiskBadge(member.riskLevel)}</TableCell>
            <TableCell className="text-[#c9c7c7]">{member.riskReason}</TableCell>
          </TableRow>
        ))}
      </tbody>
    </Table>
  );
}

