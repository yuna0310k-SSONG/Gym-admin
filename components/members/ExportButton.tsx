"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import type { Member } from "@/types/api/responses";
import {
  exportMembersToCSV,
  exportMembersToExcel,
  exportMembersToJSON,
  downloadCSV,
  downloadExcel,
  downloadJSON,
} from "@/lib/utils/export";

interface ExportButtonProps {
  members: Member[];
  filename?: string;
  disabled?: boolean;
}

export default function ExportButton({
  members,
  filename,
  disabled = false,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleExport = async (format: "csv" | "excel" | "json") => {
    if (members.length === 0) return;

    try {
      setIsExporting(true);
      const baseFilename =
        filename || `회원목록_${new Date().toISOString().split("T")[0]}`;

      switch (format) {
        case "csv":
          const csvContent = exportMembersToCSV(members);
          downloadCSV(csvContent, `${baseFilename}.csv`);
          break;
        case "excel":
          const excelContent = exportMembersToExcel(members);
          downloadExcel(excelContent, `${baseFilename}.xls`);
          break;
        case "json":
          const jsonContent = exportMembersToJSON(members);
          downloadJSON(jsonContent, `${baseFilename}.json`);
          break;
      }

      setShowMenu(false);
    } catch (error) {
      console.error("내보내기 실패:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="secondary"
        onClick={() => setShowMenu(!showMenu)}
        disabled={disabled || isExporting || members.length === 0}
        className="min-w-[140px] whitespace-nowrap flex items-center justify-center gap-2"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <span>{isExporting ? "내보내는 중..." : "내보내기"}</span>
        <svg
          className={`w-4 h-4 transition-transform ${
            showMenu ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </Button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-[#1a1d24] border border-[#374151] rounded-lg shadow-xl z-20 overflow-hidden">
            <div className="py-2">
              <button
                onClick={() => handleExport("csv")}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#e5e7eb] hover:bg-[#0f1115] transition-colors"
              >
                <div className="w-8 h-8 rounded bg-green-500/20 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">CSV</div>
                  <div className="text-xs text-[#9ca3af]">스프레드시트용</div>
                </div>
              </button>
              <button
                onClick={() => handleExport("excel")}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#e5e7eb] hover:bg-[#0f1115] transition-colors"
              >
                <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">Excel</div>
                  <div className="text-xs text-[#9ca3af]">엑셀 호환</div>
                </div>
              </button>
              <button
                onClick={() => handleExport("json")}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#e5e7eb] hover:bg-[#0f1115] transition-colors"
              >
                <div className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">JSON</div>
                  <div className="text-xs text-[#9ca3af]">원본 데이터</div>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
