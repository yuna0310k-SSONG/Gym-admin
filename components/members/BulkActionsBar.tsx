"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";

interface BulkActionsBarProps {
  selectedCount: number;
  onBulkStatusChange: (status: "ACTIVE" | "INACTIVE" | "SUSPENDED") => void;
  onBulkExport: () => void;
  onClearSelection: () => void;
  isProcessing?: boolean;
}

export default function BulkActionsBar({
  selectedCount,
  onBulkStatusChange,
  onBulkExport,
  onClearSelection,
  isProcessing = false,
}: BulkActionsBarProps) {
  const [showStatusSelect, setShowStatusSelect] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  if (selectedCount === 0) return null;

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    if (status && status !== "") {
      onBulkStatusChange(status as "ACTIVE" | "INACTIVE" | "SUSPENDED");
      setSelectedStatus("");
      setShowStatusSelect(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 bg-[#1a1d24] border border-[#374151] rounded-lg shadow-lg px-4 py-3">
      <div className="flex items-center gap-4">
        <span className="text-sm text-[#e5e7eb] font-medium">
          {selectedCount}개 선택됨
        </span>
        <div className="flex items-center gap-2">
          <Select
            value={selectedStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            options={[
              { value: "", label: "상태 변경" },
              { value: "ACTIVE", label: "활성으로 변경" },
              { value: "INACTIVE", label: "비활성으로 변경" },
              { value: "SUSPENDED", label: "정지로 변경" },
            ]}
            className="w-40"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkExport}
            disabled={isProcessing}
          >
            내보내기
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearSelection}
            disabled={isProcessing}
          >
            선택 해제
          </Button>
        </div>
      </div>
    </div>
  );
}

