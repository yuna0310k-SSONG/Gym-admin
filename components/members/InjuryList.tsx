"use client";

import { useState } from "react";
import { Table, TableHeader, TableHeaderCell, TableRow, TableCell } from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import type { Injury } from "@/types/api/responses";

interface InjuryListProps {
  injuries: Injury[];
  onEdit?: (injury: Injury) => void;
  onDelete?: (injuryId: string) => void;
}

export default function InjuryList({ injuries, onEdit, onDelete }: InjuryListProps) {
  const getSeverityBadge = (severity: Injury["severity"]) => {
    const severityMap = {
      MILD: { variant: "info" as const, label: "경미" },
      MODERATE: { variant: "warning" as const, label: "보통" },
      SEVERE: { variant: "danger" as const, label: "심각" },
    };
    const { variant, label } = severityMap[severity];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getRecoveryBadge = (status: Injury["recoveryStatus"]) => {
    const statusMap = {
      RECOVERED: { variant: "success" as const, label: "회복됨" },
      RECOVERING: { variant: "warning" as const, label: "회복 중" },
      CHRONIC: { variant: "danger" as const, label: "만성" },
    };
    const { variant, label } = statusMap[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  if (injuries.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-[#c9c7c7]">등록된 부상 이력이 없습니다.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableHeaderCell>부상 유형</TableHeaderCell>
        <TableHeaderCell>부상 부위</TableHeaderCell>
        <TableHeaderCell>날짜</TableHeaderCell>
        <TableHeaderCell>심각도</TableHeaderCell>
        <TableHeaderCell>회복 상태</TableHeaderCell>
        <TableHeaderCell>설명</TableHeaderCell>
        {(onEdit || onDelete) && <TableHeaderCell>작업</TableHeaderCell>}
      </TableHeader>
      <tbody className="bg-[#0f1115] divide-y divide-gray-700">
        {injuries.map((injury) => (
          <TableRow key={injury.id}>
            <TableCell className="text-white">{injury.injuryType}</TableCell>
            <TableCell className="text-[#c9c7c7]">{injury.bodyPart}</TableCell>
            <TableCell className="text-[#c9c7c7]">
              {new Date(injury.date).toLocaleDateString("ko-KR")}
            </TableCell>
            <TableCell>{getSeverityBadge(injury.severity)}</TableCell>
            <TableCell>{getRecoveryBadge(injury.recoveryStatus)}</TableCell>
            <TableCell className="text-[#c9c7c7]">{injury.description || "-"}</TableCell>
            {(onEdit || onDelete) && (
              <TableCell>
                <div className="flex space-x-2">
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(injury)}
                    >
                      수정
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onDelete(injury.id)}
                    >
                      삭제
                    </Button>
                  )}
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </tbody>
    </Table>
  );
}





