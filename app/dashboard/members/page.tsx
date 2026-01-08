"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import AlertModal from "@/components/ui/AlertModal";
import MemberTable from "@/components/members/MemberTable";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Skeleton, { TableRowSkeleton } from "@/components/ui/Skeleton";
import BulkActionsBar from "@/components/members/BulkActionsBar";
import ExportButton from "@/components/members/ExportButton";
import { useToast } from "@/providers/ToastProvider";
import { exportMembersToCSV, downloadCSV } from "@/lib/utils/export";
import type { Member } from "@/types/api/responses";
import { memberApi } from "@/lib/api/members";
import { onlyDigits } from "@/lib/utils/phone";

type SortField = "name" | "joinDate" | "status" | null;
type SortOrder = "asc" | "desc";
type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE" | "SUSPENDED";

export default function MembersPage() {
  const { showError, showSuccess } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [sortBy, setSortBy] = useState<SortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        // pageSize를 크게 주어 현재 존재하는 모든 회원을 한 번에 가져온다.
        const data = await memberApi.getMembers(1, 1000);
        setMembers(data.members);
      } catch (error) {
        console.error("회원 목록 조회 실패:", error);
        showError(
          error instanceof Error
            ? error.message
            : "회원 목록을 불러오지 못했습니다."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // 필터링 및 정렬된 회원 목록
  const filteredAndSortedMembers = useMemo(() => {
    let result = [...members];

    // 검색 필터
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const phoneTerm = onlyDigits(searchTerm);
      result = result.filter((member) => {
        const memberPhoneDigits = onlyDigits(member.phone);
        return (
          member.name.toLowerCase().includes(term) ||
          member.email.toLowerCase().includes(term) ||
          (phoneTerm.length > 0 && memberPhoneDigits.includes(phoneTerm))
        );
      });
    }

    // 상태 필터
    if (statusFilter !== "ALL") {
      result = result.filter((member) => member.status === statusFilter);
    }

    // 정렬
    if (sortBy) {
      result.sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
          case "name":
            comparison = a.name.localeCompare(b.name, "ko");
            break;
          case "joinDate":
            comparison =
              new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime();
            break;
          case "status":
            comparison = a.status.localeCompare(b.status);
            break;
        }
        return sortOrder === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [members, searchTerm, statusFilter, sortBy, sortOrder]);

  // 페이지네이션
  const totalPages = Math.ceil(filteredAndSortedMembers.length / pageSize);
  const paginatedMembers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredAndSortedMembers.slice(startIndex, endIndex);
  }, [filteredAndSortedMembers, currentPage, pageSize]);

  const handleSort = (field: "name" | "joinDate" | "status") => {
    if (sortBy === field) {
      // 같은 필드를 클릭하면 정렬 순서 토글
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // 다른 필드를 클릭하면 해당 필드로 정렬 (기본 오름차순)
      setSortBy(field);
      setSortOrder("asc");
    }
    setCurrentPage(1); // 정렬 시 첫 페이지로
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleBulkStatusChange = async (
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED"
  ) => {
    if (selectedMemberIds.length === 0) return;

    try {
      setIsBulkProcessing(true);
      const statusLabel = {
        ACTIVE: "활성",
        INACTIVE: "비활성",
        SUSPENDED: "정지",
      }[status];

      // 각 회원의 상태를 일괄 변경
      const updatePromises = selectedMemberIds.map((id) =>
        memberApi.updateMember(id, { status })
      );

      await Promise.all(updatePromises);

      // 회원 목록 새로고침
      const data = await memberApi.getMembers(1, 1000);
      setMembers(data.members);
      setSelectedMemberIds([]);

      showSuccess(
        `${selectedMemberIds.length}명의 회원 상태가 ${statusLabel}으로 변경되었습니다.`
      );
    } catch (error) {
      console.error("대량 상태 변경 실패:", error);
      showError(
        error instanceof Error
          ? error.message
          : "대량 상태 변경에 실패했습니다."
      );
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkExport = () => {
    if (selectedMemberIds.length === 0) return;

    const selectedMembers = filteredAndSortedMembers.filter((m) =>
      selectedMemberIds.includes(m.id)
    );

    // CSV 형식으로 변환
    const csvContent = exportMembersToCSV(selectedMembers);
    downloadCSV(
      csvContent,
      `회원목록_${new Date().toISOString().split("T")[0]}.csv`
    );
    showSuccess(`${selectedMemberIds.length}명의 회원 정보를 내보냈습니다.`);
  };

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <Skeleton height={36} width={200} />
          <Skeleton height={40} width={150} />
        </div>
        <div className="mb-6 p-6 bg-[#0f1115] rounded-lg space-y-4">
          <Skeleton height={20} width="30%" />
          <Skeleton height={40} width="100%" />
        </div>
        <div className="p-6 bg-[#0f1115] rounded-lg">
          <table className="min-w-full divide-y divide-[#374151]">
            <thead className="bg-[#1a1d24]">
              <tr>
                {Array.from({ length: 5 }).map((_, index) => (
                  <th key={index} className="px-6 py-3">
                    <Skeleton height={16} width={80} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-[#0f1115] divide-y divide-[#374151]">
              {Array.from({ length: 10 }).map((_, index) => (
                <TableRowSkeleton key={index} columns={5} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#f9fafb]">회원 관리</h1>
        <div className="flex gap-3 whitespace-nowrap">
          <ExportButton members={filteredAndSortedMembers} />
          <Link href="/dashboard/members/new">
            <Button variant="primary">새 회원 등록</Button>
          </Link>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <Card className="mb-6 bg-[#0f1115]">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="flex-1 max-w-md">
            <Input
              label="검색"
              placeholder="이름, 이메일, 전화번호로 검색..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // 검색 시 첫 페이지로
              }}
            />
          </div>
          <div className="w-full md:w-auto md:min-w-[200px]">
            <Select
              label="상태 필터"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as StatusFilter);
                setCurrentPage(1); // 필터 변경 시 첫 페이지로
              }}
              options={[
                { value: "ALL", label: "전체" },
                { value: "ACTIVE", label: "활성" },
                { value: "INACTIVE", label: "비활성" },
                { value: "SUSPENDED", label: "정지" },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* 회원 수 및 페이지 크기 선택 */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-[#9ca3af]">
          총 {filteredAndSortedMembers.length}명의 회원
        </p>
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-sm text-[#9ca3af]">페이지당:</span>
          <Select
            value={pageSize.toString()}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            options={[
              { value: "10", label: "10개" },
              { value: "20", label: "20개" },
              { value: "50", label: "50개" },
            ]}
            className="w-32"
          />
        </div>
      </div>

      <Card className="bg-[#0f1115]">
        {paginatedMembers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#9ca3af]">
              {searchTerm || statusFilter !== "ALL"
                ? "검색 결과가 없습니다."
                : "회원이 없습니다."}
            </p>
          </div>
        ) : (
          <>
            <MemberTable
              members={paginatedMembers}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              selectedIds={selectedMemberIds}
              onSelectionChange={setSelectedMemberIds}
            />
            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6 pb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  이전
                </Button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      // 현재 페이지 주변 2페이지씩만 표시
                      return (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 2 && page <= currentPage + 2)
                      );
                    })
                    .map((page, index, array) => {
                      // 생략 표시
                      if (index > 0 && array[index - 1] < page - 1) {
                        return (
                          <span
                            key={`ellipsis-${page}`}
                            className="px-2 text-[#9ca3af]"
                          >
                            ...
                          </span>
                        );
                      }
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "primary" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className="min-w-[40px]"
                        >
                          {page}
                        </Button>
                      );
                    })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  다음
                </Button>
              </div>
            )}
          </>
        )}
      </Card>

      {/* 대량 작업 바 */}
      <BulkActionsBar
        selectedCount={selectedMemberIds.length}
        onBulkStatusChange={handleBulkStatusChange}
        onBulkExport={handleBulkExport}
        onClearSelection={() => setSelectedMemberIds([])}
        isProcessing={isBulkProcessing}
      />
    </div>
  );
}
