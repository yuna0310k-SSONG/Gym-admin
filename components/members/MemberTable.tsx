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
  sortBy?: "name" | "joinDate" | "status" | null;
  sortOrder?: "asc" | "desc";
  onSort?: (field: "name" | "joinDate" | "status") => void;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  startIndex?: number; // 페이지네이션을 위한 시작 번호
}

export default function MemberTable({
  members,
  sortBy,
  sortOrder,
  onSort,
  selectedIds = [],
  onSelectionChange,
  startIndex = 0,
}: MemberTableProps) {
  const router = useRouter();

  const handleRowClick = (memberId: string, event: React.MouseEvent) => {
    // 체크박스 클릭 시에는 행 클릭 이벤트 무시
    const target = event.target as HTMLElement;
    if (target.closest('input[type="checkbox"]')) {
      return;
    }
    router.push(`/dashboard/members/${memberId}`);
  };

  const handleSelectAll = (checked: boolean) => {
    if (onSelectionChange) {
      onSelectionChange(checked ? members.map((m) => m.id) : []);
    }
  };

  const handleSelectOne = (memberId: string, checked: boolean) => {
    if (onSelectionChange) {
      if (checked) {
        onSelectionChange([...selectedIds, memberId]);
      } else {
        onSelectionChange(selectedIds.filter((id) => id !== memberId));
      }
    }
  };

  const allSelected =
    members.length > 0 && selectedIds.length === members.length;
  const someSelected =
    selectedIds.length > 0 && selectedIds.length < members.length;

  const getStatusBadge = (status: Member["status"]) => {
    const statusMap = {
      ACTIVE: { variant: "success" as const, label: "활성" },
      INACTIVE: { variant: "default" as const, label: "비활성" },
      SUSPENDED: { variant: "danger" as const, label: "정지" },
    };
    const { variant, label } = statusMap[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const handleSort = (field: "name" | "joinDate" | "status") => {
    if (onSort) {
      onSort(field);
    }
  };

  const getSortIcon = (field: "name" | "joinDate" | "status") => {
    if (sortBy !== field) {
      return (
        <span className="ml-1 text-[#6b7280] text-xs">
          <svg
            className="w-4 h-4 inline"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
            />
          </svg>
        </span>
      );
    }
    return (
      <span className="ml-1 text-[#e5e7eb] text-xs">
        {sortOrder === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  return (
    <Table>
      <TableHeader>
        {onSelectionChange && (
          <TableHeaderCell className="w-12">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(input) => {
                if (input) input.indeterminate = someSelected;
              }}
              onChange={(e) => handleSelectAll(e.target.checked)}
              onClick={(e) => e.stopPropagation()}
              className="w-4 h-4 rounded border-[#374151] bg-[#0f1115] text-blue-500 focus:ring-2 focus:ring-blue-500 checked:bg-blue-500 checked:border-blue-500"
            />
          </TableHeaderCell>
        )}
        <TableHeaderCell className="w-16 text-center">No.</TableHeaderCell>
        <TableHeaderCell
          className="cursor-pointer select-none hover:text-white"
          onClick={() => handleSort("name")}
        >
          이름 {getSortIcon("name")}
        </TableHeaderCell>
        <TableHeaderCell>이메일</TableHeaderCell>
        <TableHeaderCell>전화번호</TableHeaderCell>
        <TableHeaderCell
          className="cursor-pointer select-none hover:text-white"
          onClick={() => handleSort("joinDate")}
        >
          가입일 {getSortIcon("joinDate")}
        </TableHeaderCell>
        <TableHeaderCell
          className="cursor-pointer select-none hover:text-white"
          onClick={() => handleSort("status")}
        >
          상태 {getSortIcon("status")}
        </TableHeaderCell>
      </TableHeader>
      <tbody className="bg-[#0f1115] divide-y divide-[#374151]">
        {members.map((member, index) => {
          const isSelected = selectedIds.includes(member.id);
          const rowNumber = startIndex + index + 1;
          return (
            <TableRow
              key={member.id}
              onClick={(e) => handleRowClick(member.id, e)}
              className={`hover:bg-[#1a1d24] transition-colors cursor-pointer ${
                isSelected ? "bg-[#1a1d24]/50" : ""
              }`}
            >
              {onSelectionChange && (
                <TableCell
                  onClick={(e) => e.stopPropagation()}
                  className="w-12"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) =>
                      handleSelectOne(member.id, e.target.checked)
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 rounded border-[#374151] bg-[#0f1115] text-blue-500 focus:ring-2 focus:ring-blue-500 checked:bg-blue-500 checked:border-blue-500"
                  />
                </TableCell>
              )}
              <TableCell className="text-center text-[#9ca3af]">
                {rowNumber}
              </TableCell>
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
          );
        })}
      </tbody>
    </Table>
  );
}
