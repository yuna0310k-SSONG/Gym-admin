# 백엔드 수정 요청: 운동 캘린더 라우팅 문제

## 문제 상황

**에러 메시지**: `invalid input syntax for type uuid: "calendar"`

**발생 위치**: `GET /api/members/{id}/workout-records/calendar`

## 원인 분석

백엔드 라우터에서 `/api/members/:id/workout-records/calendar` 요청 시, `calendar`가 UUID 타입의 `:recordId` 파라미터로 잘못 파싱되고 있습니다.

이는 라우팅 순서 문제로 보입니다:
- `/api/members/:id/workout-records/:recordId` (일반 라우트)
- `/api/members/:id/workout-records/calendar` (특수 라우트)

위와 같이 정의되어 있다면, 더 구체적인 라우트(`/calendar`)가 먼저 정의되어야 합니다.

## 해결 방법

### 방법 1: 라우팅 순서 변경 (권장)

**NestJS 예시**:
```typescript
// ✅ 올바른 순서: 구체적인 라우트를 먼저 정의
@Get('calendar')  // /api/members/:id/workout-records/calendar
async getCalendar(@Param('id') id: string, @Query() query: CalendarQuery) {
  // ...
}

@Get(':recordId')  // /api/members/:id/workout-records/:recordId
async getRecord(@Param('id') id: string, @Param('recordId') recordId: string) {
  // ...
}
```

**중요**: `/calendar` 라우트가 `/:recordId` 라우트보다 **먼저** 정의되어야 합니다.

### 방법 2: 쿼리 파라미터로 변경 (대안)

만약 라우팅 순서를 변경하기 어렵다면:

**변경 전**: `GET /api/members/:id/workout-records/calendar?startDate=...&endDate=...`
**변경 후**: `GET /api/members/:id/workout-records?type=calendar&startDate=...&endDate=...`

이 경우 프론트엔드도 함께 수정해야 합니다.

## 현재 프론트엔드 동작

**임시 해결책**: 프론트엔드에서 백엔드 라우팅 문제를 감지하면, 운동 기록 목록 API(`GET /api/members/:id/workout-records`)를 사용하여 클라이언트에서 캘린더 데이터를 생성합니다.

하지만 성능과 정확성을 위해 백엔드 수정이 필요합니다.

### 프론트엔드 임시 해결책 동작 방식

1. `/api/members/:id/workout-records/calendar` 엔드포인트 시도
2. 라우팅 에러 감지 시:
   - 운동 기록 목록 API 호출 (startDate, endDate 필터 적용)
   - 클라이언트에서 날짜별로 그룹화
   - `workoutType`에 따라 PT/개인 운동 수 집계
   - 캘린더 이벤트 형식으로 변환

## 확인 사항

1. `WorkoutRecordsController` 또는 해당 라우터 파일 확인
2. `/calendar` 라우트와 `/:recordId` 라우트의 정의 순서 확인
3. 더 구체적인 라우트가 먼저 정의되어 있는지 확인

## 예상 수정 시간

- 라우팅 순서 변경: 약 5분
- 테스트 포함: 약 15분

