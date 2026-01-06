import type { Metadata } from "next";
import "../styles/globals.css";
import QueryProvider from "@/providers/QueryProvider";

export const metadata: Metadata = {
  title: "헬스장 회원관리 시스템",
  description: "헬스 데이터 플랫폼 - Next.js 기반 프론트엔드",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-[#0f1115] text-[#e5e7eb]">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
