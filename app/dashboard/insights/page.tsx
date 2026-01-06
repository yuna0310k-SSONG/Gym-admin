import Card from "@/components/ui/Card";

export default function InsightsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-[#f9fafb] mb-6">인사이트</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="전체 평균 능력치" className="bg-[#0f1115]">
          <p className="text-[#9ca3af]">능력치 차트는 추후 구현 예정입니다.</p>
        </Card>
        <Card title="주간 비교" className="bg-[#0f1115]">
          <p className="text-[#9ca3af]">
            주간 비교 차트는 추후 구현 예정입니다.
          </p>
        </Card>
        <Card title="위험 신호 회원" className="bg-[#0f1115]">
          <p className="text-[#9ca3af]">
            위험 신호 회원 목록은 추후 구현 예정입니다.
          </p>
        </Card>
      </div>
    </div>
  );
}
