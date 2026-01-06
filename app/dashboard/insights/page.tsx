import Card from "@/components/ui/Card";

export default function InsightsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">인사이트</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="전체 평균 능력치">
          <p className="text-gray-500">능력치 차트는 추후 구현 예정입니다.</p>
        </Card>
        <Card title="주간 비교">
          <p className="text-gray-500">
            주간 비교 차트는 추후 구현 예정입니다.
          </p>
        </Card>
        <Card title="위험 신호 회원">
          <p className="text-gray-500">
            위험 신호 회원 목록은 추후 구현 예정입니다.
          </p>
        </Card>
      </div>
    </div>
  );
}
