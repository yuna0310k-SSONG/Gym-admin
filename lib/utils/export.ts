import type { Member } from "@/types/api/responses";

/**
 * 회원 목록을 CSV 형식으로 변환
 */
export function exportMembersToCSV(members: Member[]): string {
  const headers = ["이름", "이메일", "전화번호", "가입일", "상태", "키", "몸무게", "성별"];
  
  const rows = members.map((member) => [
    member.name,
    member.email,
    member.phone,
    new Date(member.joinDate).toLocaleDateString("ko-KR"),
    member.status === "ACTIVE" ? "활성" : member.status === "INACTIVE" ? "비활성" : "정지",
    member.height ? `${member.height}cm` : "",
    member.weight ? `${member.weight}kg` : "",
    member.gender === "MALE" ? "남성" : member.gender === "FEMALE" ? "여성" : "",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
  ].join("\n");

  // BOM 추가 (한글 깨짐 방지)
  return "\uFEFF" + csvContent;
}

/**
 * CSV 파일 다운로드
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 회원 목록을 Excel 형식(XLSX)으로 변환 (간단한 XML 형식)
 * 실제 XLSX는 복잡하므로, Excel이 읽을 수 있는 XML 형식으로 변환
 */
export function exportMembersToExcel(members: Member[]): string {
  const headers = ["이름", "이메일", "전화번호", "가입일", "상태", "키", "몸무게", "성별"];
  
  const rows = members.map((member) => [
    member.name,
    member.email,
    member.phone,
    new Date(member.joinDate).toLocaleDateString("ko-KR"),
    member.status === "ACTIVE" ? "활성" : member.status === "INACTIVE" ? "비활성" : "정지",
    member.height ? `${member.height}cm` : "",
    member.weight ? `${member.weight}kg` : "",
    member.gender === "MALE" ? "남성" : member.gender === "FEMALE" ? "여성" : "",
  ]);

  // Excel XML 형식
  const xmlContent = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Worksheet ss:Name="회원목록">
  <Table>
   <Row>
${headers.map((h) => `    <Cell><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`).join("\n")}
   </Row>
${rows.map((row) => `   <Row>
${row.map((cell) => `    <Cell><Data ss:Type="String">${escapeXml(String(cell))}</Data></Cell>`).join("\n")}
   </Row>`).join("\n")}
  </Table>
 </Worksheet>
</Workbook>`;

  return xmlContent;
}

/**
 * XML 특수 문자 이스케이프
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Excel 파일 다운로드
 */
export function downloadExcel(content: string, filename: string): void {
  const blob = new Blob([content], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".xls") ? filename : filename + ".xls";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * JSON 형식으로 내보내기
 */
export function exportMembersToJSON(members: Member[]): string {
  return JSON.stringify(members, null, 2);
}

/**
 * JSON 파일 다운로드
 */
export function downloadJSON(content: string, filename: string): void {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".json") ? filename : filename + ".json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}


