import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">대시보드</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-2">회원 관리</h3>
          <p className="text-gray-600 mb-4">회원 목록 조회 및 관리</p>
          <Link href="/dashboard/members">
            <Button variant="primary" size="sm">
              이동하기
            </Button>
          </Link>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold mb-2">인사이트</h3>
          <p className="text-gray-600 mb-4">전체 회원 통계 및 분석</p>
          <Link href="/dashboard/insights">
            <Button variant="primary" size="sm">
              이동하기
            </Button>
          </Link>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold mb-2">평가 관리</h3>
          <p className="text-gray-600 mb-4">회원 평가 및 능력치 추적</p>
          <Button variant="outline" size="sm" disabled>
            준비 중
          </Button>
        </Card>
      </div>
    </div>
  );
}

