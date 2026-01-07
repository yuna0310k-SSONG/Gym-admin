# 백엔드 목표 관리 API - 프론트엔드 연동 완료

## ✅ API 사양 확인 완료

백엔드 API 사양에 맞게 프론트엔드를 업데이트했습니다.

### 엔드포인트

| 메서드 | 엔드포인트                | 설명      |
| ------ | ------------------------- | --------- |
| GET    | `/api/members/{id}/goals` | 목표 조회 |
| POST   | `/api/members/{id}/goals` | 목표 생성 |
| PUT    | `/api/members/{id}/goals` | 목표 수정 |
| DELETE | `/api/members/{id}/goals` | 목표 삭제 |

### 요청 본문

**생성 (POST)**:

```json
{
  "goal": "체중 5kg 감량, 데드리프트 150kg 달성",
  "goalProgress": 0,
  "goalTrainerComment": "동기부여 코멘트"
}
```

**수정 (PUT)**:

```json
{
  "goal": "체중 5kg 감량 및 근력 향상",
  "goalProgress": 65,
  "goalTrainerComment": "꾸준히 운동하시는 모습이 인상적입니다!",
  "totalSessions": 20,
  "completedSessions": 10
}
```

### 응답 형식

```json
{
  "id": "bc1d82ac-a80c-4674-a308-5e792128a181",
  "memberId": "bc1d82ac-a80c-4674-a308-5e792128a181",
  "goal": "체중 5kg 감량, 데드리프트 150kg 달성",
  "goalProgress": 45,
  "goalTrainerComment": "꾸준히 노력하고 있습니다!",
  "totalSessions": 20,
  "completedSessions": 10,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T00:00:00.000Z"
}
```

### 에러 응답

- **404**: 목표를 찾을 수 없습니다

## 프론트엔드 파일

- `lib/api/goals.ts` - API 클라이언트
- `types/api/responses.ts` - MemberGoal 인터페이스
- `types/api/requests.ts` - CreateMemberGoalRequest, UpdateMemberGoalRequest
- `components/members/MemberGoalCard.tsx` - UI 컴포넌트
