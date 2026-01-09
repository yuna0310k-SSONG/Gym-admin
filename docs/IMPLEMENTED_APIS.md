# 구현된 API 클라이언트 목록

백엔드 API 문서 ([Swagger UI](https://gym-membership-backend-5zjj.onrender.com/api))를 참고하여 구현한 프론트엔드 API 클라이언트 목록입니다.

---

## ✅ 새로 구현된 API

### 1. 회원권 관리 (Membership)

**파일**: `lib/api/membership.ts`

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/members/{id}/membership` | 회원권 조회 |
| POST | `/api/members/{id}/membership` | 회원권 생성 |
| PUT | `/api/members/{id}/membership/{membershipId}` | 회원권 수정 |
| DELETE | `/api/members/{id}/membership/{membershipId}` | 회원권 삭제 |

**사용 예시**:
```typescript
import { membershipApi } from "@/lib/api/membership";

// 회원권 조회
const membership = await membershipApi.get(memberId);

// 회원권 생성
await membershipApi.create(memberId, {
  membershipType: "MONTHLY",
  purchaseDate: "2024-01-01",
  expiryDate: "2024-02-01",
  status: "ACTIVE",
  price: 100000
});
```

---

### 2. PT 횟수 관리 (PT Count)

**파일**: `lib/api/pt-count.ts`

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/members/{id}/pt-count` | PT 횟수 조회 |
| POST | `/api/members/{id}/pt-count` | PT 횟수 생성/수정 |
| PUT | `/api/members/{id}/pt-count` | PT 횟수 수정 |

**사용 예시**:
```typescript
import { ptCountApi } from "@/lib/api/pt-count";

// PT 횟수 조회
const ptUsage = await ptCountApi.get(memberId);

// PT 횟수 생성/수정
await ptCountApi.createOrUpdate(memberId, {
  totalCount: 20,
  remainingCount: 15,
  usedCount: 5
});
```

---

### 3. 대시보드 통합 데이터 (Dashboard)

**파일**: `lib/api/dashboard.ts`

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/members/{id}/dashboard` | 대시보드 통합 데이터 조회 |

**응답 데이터**:
- `goal`: 목표 정보
- `sessionProgress`: PT 세션 진행률
- `workoutCalendar`: 운동 캘린더
- `workoutAnalysis`: 운동 볼륨 분석 (주간/월간)

**사용 예시**:
```typescript
import { dashboardApi } from "@/lib/api/dashboard";

// 대시보드 통합 데이터 조회
const dashboard = await dashboardApi.get(memberId);
```

---

## ✅ 업데이트된 API

### 4. 운동 루틴 (Workout Routines)

**파일**: `lib/api/workout-routines.ts`

**새로 추가된 메서드**:

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| PUT | `/api/members/{id}/workout-routines/{routineId}/complete` | 운동 루틴 완료 처리 |

**사용 예시**:
```typescript
import { workoutRoutineApi } from "@/lib/api/workout-routines";

// 운동 루틴 완료 처리
await workoutRoutineApi.complete(routineId, memberId);
```

---

## 기존 구현된 API

### 목표 관리 (Goals)
- `lib/api/goals.ts`
- GET/POST/PUT/DELETE `/api/members/{id}/goals`

### PT 세션 (PT Sessions)
- `lib/api/pt-sessions.ts`
- GET/POST/PUT/DELETE `/api/members/{id}/pt-sessions`

### 운동 기록 (Workout Records)
- `lib/api/workout-records.ts`
- GET/POST/PUT/DELETE `/api/members/{id}/workout-records`
- GET `/api/members/{id}/workout-records/volume-analysis`
- GET `/api/members/{id}/workout-records/calendar`

### 회원 관리 (Members)
- `lib/api/members.ts`
- GET/POST/PUT/DELETE `/api/members`

### 평가 시스템 (Assessments)
- `lib/api/assessments.ts`
- GET/POST/PUT `/api/members/{id}/assessments`

### 능력치 (Abilities)
- `lib/api/abilities.ts`
- GET `/api/members/{id}/abilities/latest`
- GET `/api/members/{id}/abilities/hexagon`
- GET `/api/members/{id}/abilities/compare`

### 부상 관리 (Injuries)
- `lib/api/injuries.ts`
- GET/POST/PUT `/api/members/{id}/injuries`

### 분석 (Analytics)
- `lib/api/analytics.ts`
- GET `/api/members/{id}/analytics`
- GET `/api/analytics/averages`
- GET `/api/analytics/comparison/{id}`

### 인사이트 (Insights)
- `lib/api/insights.ts`
- GET `/api/insights/hexagon`
- GET `/api/insights/weekly-summary`
- GET `/api/insights/risk-members`

### 트레이너 (Trainers)
- `lib/api/trainers.ts`
- 승인 대기/승인/거부 등

### 인증 (Auth)
- `lib/api/auth.ts`
- 로그인/회원가입/세션 등

---

## 백엔드 API 문서

전체 API 문서: https://gym-membership-backend-5zjj.onrender.com/api

---

**작성일**: 2024-01-07




