# 백엔드 API 구현 요청 사항

프론트엔드에서 구현 완료된 기능들에 대한 백엔드 API 구현 요청서입니다.

---

## 📋 목차

1. [목표 관리 API](#1-목표-관리-api)
2. [PT 세션 관리 API](#2-pt-세션-관리-api)
3. [운동 기록 API](#3-운동-기록-api)
4. [추천 운동 루틴 API](#4-추천-운동-루틴-api)

---

## 1. 목표 관리 API

### 1-1. 목표 조회

**엔드포인트**: `GET /api/members/:memberId/goals`

**인증**: ✅ 필요 (ADMIN, TRAINER)

**응답**:
- 목표가 있는 경우: `200 OK` + `MemberGoalResponse`
- 목표가 없는 경우: `404 Not Found` + 에러 코드 `GOAL_NOT_FOUND`

```typescript
// 성공 응답
{
  "success": true,
  "data": {
    "id": "uuid",
    "memberId": "uuid",
    "goal": "체중 5kg 감량, 데드리프트 150kg 달성",
    "goalProgress": 45, // 0-100
    "goalTrainerComment": "꾸준히 노력하고 있습니다!",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z"
  }
}

// 목표 없음 응답
{
  "success": false,
  "error": {
    "code": "GOAL_NOT_FOUND",
    "message": "목표를 찾을 수 없습니다."
  }
}
```

### 1-2. 목표 생성

**엔드포인트**: `POST /api/members/:memberId/goals`

**인증**: ✅ 필요 (ADMIN, TRAINER)

**요청 본문**:
```typescript
{
  "goal": "체중 5kg 감량, 데드리프트 150kg 달성", // 필수
  "goalProgress": 0, // 선택, 기본값 0 (0-100)
  "goalTrainerComment": "동기부여 코멘트" // 선택
}
```

**응답**: `201 Created` + `MemberGoalResponse`

**비즈니스 로직**:
- 회원당 목표는 1개만 존재 (기존 목표가 있으면 업데이트 또는 에러)
- `goalProgress`는 0-100 범위로 제한

### 1-3. 목표 수정

**엔드포인트**: `PUT /api/members/:memberId/goals`

**인증**: ✅ 필요 (ADMIN, TRAINER)

**요청 본문** (모든 필드 선택):
```typescript
{
  "goal": "수정된 목표", // 선택
  "goalProgress": 50, // 선택 (0-100)
  "goalTrainerComment": "수정된 코멘트" // 선택
}
```

**응답**: `200 OK` + `MemberGoalResponse`

### 1-4. 목표 삭제

**엔드포인트**: `DELETE /api/members/:memberId/goals`

**인증**: ✅ 필요 (ADMIN, TRAINER)

**응답**: `200 OK`

---

## 2. PT 세션 관리 API

### 2-1. PT 세션 목록 조회

**엔드포인트**: `GET /api/members/:memberId/pt-sessions`

**인증**: ✅ 필요

**응답**: `200 OK` + `PTSessionListResponse`

```typescript
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "uuid",
        "memberId": "uuid",
        "sessionDate": "2024-01-15",
        "sessionNumber": 1, // 자동 증가 (1부터 시작)
        "mainContent": "하체 근력 운동, 스쿼트 중심",
        "trainerComment": "좋은 자세로 진행했습니다.",
        "createdAt": "2024-01-15T10:00:00.000Z",
        "updatedAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "total": 10, // 전체 세션 수
    "totalSessions": 20, // 총 계획된 세션 수 (회원권 등에서 설정)
    "completedSessions": 10 // 완료된 세션 수
  }
}
```

**비즈니스 로직**:
- `sessionNumber`는 자동으로 증가 (1, 2, 3, ...)
- `totalSessions`는 회원권 또는 별도 설정에서 가져옴
- `completedSessions`는 실제 완료된 세션 수

### 2-2. PT 세션 상세 조회

**엔드포인트**: `GET /api/members/:memberId/pt-sessions/:sessionId`

**인증**: ✅ 필요

**응답**: `200 OK` + `PTSessionResponse`

### 2-3. PT 세션 생성

**엔드포인트**: `POST /api/members/:memberId/pt-sessions`

**인증**: ✅ 필요 (ADMIN, TRAINER)

**요청 본문**:
```typescript
{
  "sessionDate": "2024-01-15", // 필수 (YYYY-MM-DD)
  "mainContent": "하체 근력 운동, 스쿼트 중심", // 선택
  "trainerComment": "좋은 자세로 진행했습니다." // 선택
}
```

**응답**: `201 Created` + `PTSessionResponse`

**비즈니스 로직**:
- `sessionNumber`는 자동으로 다음 번호 할당
- `completedSessions` 자동 증가

### 2-4. PT 세션 수정

**엔드포인트**: `PUT /api/members/:memberId/pt-sessions/:sessionId`

**인증**: ✅ 필요 (ADMIN, TRAINER)

**요청 본문** (모든 필드 선택):
```typescript
{
  "sessionDate": "2024-01-16", // 선택
  "mainContent": "수정된 내용", // 선택
  "trainerComment": "수정된 코멘트" // 선택
}
```

**응답**: `200 OK` + `PTSessionResponse`

### 2-5. PT 세션 삭제

**엔드포인트**: `DELETE /api/members/:memberId/pt-sessions/:sessionId`

**인증**: ✅ 필요 (ADMIN, TRAINER)

**응답**: `200 OK`

---

## 3. 운동 기록 API

### 3-1. 운동 기록 목록 조회

**엔드포인트**: `GET /api/members/:memberId/workout-records`

**인증**: ✅ 필요

**쿼리 파라미터** (선택):
- `page`: 페이지 번호 (기본값: 1)
- `pageSize`: 페이지 크기 (기본값: 10)
- `startDate`: 시작 날짜 (YYYY-MM-DD)
- `endDate`: 종료 날짜 (YYYY-MM-DD)

**응답**: `200 OK` + `WorkoutRecordListResponse`

```typescript
{
  "success": true,
  "data": {
    "records": [
      {
        "id": "uuid",
        "memberId": "uuid",
        "workoutDate": "2024-01-15",
        "exerciseName": "스쿼트",
        "bodyPart": "하체",
        "weight": 100, // kg
        "reps": 10,
        "sets": 3,
        "volume": 3000, // weight * reps * sets (자동 계산)
        "duration": 30, // 분
        "sessionType": "PT", // "PT" | "SELF"
        "ptSessionId": "uuid", // sessionType이 "PT"인 경우
        "trainerComment": "좋은 자세",
        "createdAt": "2024-01-15T10:00:00.000Z",
        "updatedAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "total": 50
  }
}
```

**비즈니스 로직**:
- `volume`은 `weight * reps * sets`로 자동 계산
- `sessionType`이 "PT"인 경우 `ptSessionId` 필수

### 3-2. 운동 기록 상세 조회

**엔드포인트**: `GET /api/members/:memberId/workout-records/:recordId`

**인증**: ✅ 필요

**응답**: `200 OK` + `WorkoutRecordResponse`

### 3-3. 운동 기록 생성

**엔드포인트**: `POST /api/members/:memberId/workout-records`

**인증**: ✅ 필요 (ADMIN, TRAINER)

**요청 본문**:
```typescript
{
  "workoutDate": "2024-01-15", // 필수 (YYYY-MM-DD)
  "exerciseName": "스쿼트", // 필수
  "bodyPart": "하체", // 필수 (상체, 하체, 전신, 코어 등)
  "weight": 100, // 선택 (kg)
  "reps": 10, // 선택
  "sets": 3, // 선택
  "duration": 30, // 선택 (분)
  "sessionType": "PT", // 필수 ("PT" | "SELF")
  "ptSessionId": "uuid", // 선택 (sessionType이 "PT"인 경우)
  "trainerComment": "좋은 자세" // 선택
}
```

**응답**: `201 Created` + `WorkoutRecordResponse`

**비즈니스 로직**:
- `volume`은 `weight * reps * sets`로 자동 계산
- `sessionType`이 "PT"인 경우 `ptSessionId` 권장

### 3-4. 운동 기록 수정

**엔드포인트**: `PUT /api/members/:memberId/workout-records/:recordId`

**인증**: ✅ 필요 (ADMIN, TRAINER)

**요청 본문** (모든 필드 선택):
```typescript
{
  "workoutDate": "2024-01-16", // 선택
  "exerciseName": "데드리프트", // 선택
  "bodyPart": "하체", // 선택
  "weight": 120, // 선택
  "reps": 8, // 선택
  "sets": 3, // 선택
  "duration": 35, // 선택
  "sessionType": "SELF", // 선택
  "ptSessionId": null, // 선택
  "trainerComment": "수정된 코멘트" // 선택
}
```

**응답**: `200 OK` + `WorkoutRecordResponse`

### 3-5. 운동 기록 삭제

**엔드포인트**: `DELETE /api/members/:memberId/workout-records/:recordId`

**인증**: ✅ 필요 (ADMIN, TRAINER)

**응답**: `200 OK`

### 3-6. 운동 기록 볼륨 분석

**엔드포인트**: `GET /api/members/:memberId/workout-records/volume-analysis`

**인증**: ✅ 필요

**쿼리 파라미터** (선택):
- `period`: "WEEKLY" | "MONTHLY" (둘 다 조회 시 생략)
- `startDate`: 시작 날짜 (YYYY-MM-DD, 기본값: 현재 주/월 시작)
- `endDate`: 종료 날짜 (YYYY-MM-DD, 기본값: 현재 주/월 끝)

**응답**: `200 OK` + `WorkoutVolumeAnalysisResponse`

```typescript
{
  "success": true,
  "data": {
    "weekly": {
      "period": "WEEKLY",
      "startDate": "2024-01-08",
      "endDate": "2024-01-14",
      "bodyPartVolumes": [
        {
          "bodyPart": "하체",
          "totalVolume": 5000, // kg
          "totalSets": 15,
          "totalReps": 150,
          "recordCount": 5
        },
        {
          "bodyPart": "상체",
          "totalVolume": 3000,
          "totalSets": 12,
          "totalReps": 120,
          "recordCount": 4
        }
      ]
    },
    "monthly": {
      "period": "MONTHLY",
      "startDate": "2024-01-01",
      "endDate": "2024-01-31",
      "bodyPartVolumes": [
        {
          "bodyPart": "하체",
          "totalVolume": 20000,
          "totalSets": 60,
          "totalReps": 600,
          "recordCount": 20
        }
      ]
    }
  }
}
```

**비즈니스 로직**:
- `period`가 없으면 주간과 월간 둘 다 반환
- 부위별로 그룹화하여 볼륨, 세트, 횟수 집계
- `totalVolume` = 해당 부위의 모든 기록의 `volume` 합계

### 3-7. 운동 캘린더 조회

**엔드포인트**: `GET /api/members/:memberId/workout-records/calendar`

**인증**: ✅ 필요

**쿼리 파라미터** (필수):
- `startDate`: 시작 날짜 (YYYY-MM-DD)
- `endDate`: 종료 날짜 (YYYY-MM-DD)

**응답**: `200 OK` + `WorkoutCalendarResponse`

```typescript
{
  "success": true,
  "data": {
    "events": [
      {
        "date": "2024-01-15",
        "ptSessions": 1, // 해당 날짜의 PT 세션 수
        "selfWorkouts": 0 // 해당 날짜의 개인 운동 수
      },
      {
        "date": "2024-01-16",
        "ptSessions": 0,
        "selfWorkouts": 1
      }
    ],
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  }
}
```

**비즈니스 로직**:
- `startDate`와 `endDate` 사이의 모든 날짜에 대해 운동 기록 집계
- 날짜별로 PT 세션 수와 개인 운동 수를 카운트
- 운동 기록이 없는 날짜는 포함하지 않거나 `ptSessions: 0, selfWorkouts: 0`으로 반환

---

## 4. 추천 운동 루틴 API

### 4-1. 운동 루틴 목록 조회

**엔드포인트**: 
- `GET /api/workout-routines` (전체 공통 루틴)
- `GET /api/members/:memberId/workout-routines` (회원별 루틴)

**인증**: ✅ 필요

**응답**: `200 OK` + `WorkoutRoutineListResponse`

```typescript
{
  "success": true,
  "data": {
    "routines": [
      {
        "id": "uuid",
        "memberId": null, // null이면 전체 공통 루틴
        "routineName": "초보자 상체 루틴",
        "exercises": [
          {
            "exerciseName": "벤치프레스",
            "bodyPart": "상체",
            "sets": 3,
            "reps": 10,
            "weight": 50,
            "duration": null,
            "restTime": 60, // 초
            "notes": "가슴 근육에 집중"
          },
          {
            "exerciseName": "덤벨 플라이",
            "bodyPart": "상체",
            "sets": 3,
            "reps": 12,
            "weight": 15,
            "restTime": 45,
            "notes": null
          }
        ],
        "estimatedDuration": 60, // 분
        "difficulty": "EASY", // "EASY" | "MEDIUM" | "HARD"
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 10
  }
}
```

### 4-2. 운동 루틴 상세 조회

**엔드포인트**: 
- `GET /api/workout-routines/:routineId` (전체 공통 루틴)
- `GET /api/members/:memberId/workout-routines/:routineId` (회원별 루틴)

**인증**: ✅ 필요

**응답**: `200 OK` + `WorkoutRoutineResponse`

### 4-3. 오늘의 운동 루틴 조회

**엔드포인트**: 
- `GET /api/workout-routines/today` (전체 공통 루틴)
- `GET /api/members/:memberId/workout-routines/today` (회원별 루틴)

**인증**: ✅ 필요

**응답**: 
- 루틴이 있는 경우: `200 OK` + `WorkoutRoutineResponse`
- 루틴이 없는 경우: `404 Not Found` + 에러 코드 `ROUTINE_NOT_FOUND`

**비즈니스 로직**:
- 회원별 루틴이 있으면 우선 반환
- 없으면 전체 공통 루틴 반환
- 둘 다 없으면 404

### 4-4. 운동 루틴 생성

**엔드포인트**: 
- `POST /api/workout-routines` (전체 공통 루틴)
- `POST /api/members/:memberId/workout-routines` (회원별 루틴)

**인증**: ✅ 필요 (ADMIN, TRAINER)

**요청 본문**:
```typescript
{
  "routineName": "초보자 상체 루틴", // 필수
  "exercises": [ // 필수 (최소 1개)
    {
      "exerciseName": "벤치프레스", // 필수
      "bodyPart": "상체", // 필수
      "sets": 3, // 선택
      "reps": 10, // 선택
      "weight": 50, // 선택 (kg)
      "duration": null, // 선택 (분, 유산소 운동인 경우)
      "restTime": 60, // 선택 (초)
      "notes": "가슴 근육에 집중" // 선택
    }
  ],
  "estimatedDuration": 60, // 필수 (분)
  "difficulty": "EASY" // 필수 ("EASY" | "MEDIUM" | "HARD")
}
```

**응답**: `201 Created` + `WorkoutRoutineResponse`

### 4-5. 운동 루틴 수정

**엔드포인트**: 
- `PUT /api/workout-routines/:routineId` (전체 공통 루틴)
- `PUT /api/members/:memberId/workout-routines/:routineId` (회원별 루틴)

**인증**: ✅ 필요 (ADMIN, TRAINER)

**요청 본문** (모든 필드 선택):
```typescript
{
  "routineName": "수정된 루틴명", // 선택
  "exercises": [...], // 선택
  "estimatedDuration": 70, // 선택
  "difficulty": "MEDIUM" // 선택
}
```

**응답**: `200 OK` + `WorkoutRoutineResponse`

### 4-6. 운동 루틴 삭제

**엔드포인트**: 
- `DELETE /api/workout-routines/:routineId` (전체 공통 루틴)
- `DELETE /api/members/:memberId/workout-routines/:routineId` (회원별 루틴)

**인증**: ✅ 필요 (ADMIN, TRAINER)

**응답**: `200 OK`

---

## 📌 공통 사항

### 인증
- 모든 API는 JWT 토큰 인증 필요
- `Authorization: Bearer {token}` 헤더 필수
- 일부 API는 ADMIN 또는 TRAINER 권한 필요

### 응답 형식
- 성공: `{ success: true, data: T, message?: string }`
- 실패: `{ success: false, error: { code: string, message: string, details?: unknown } }`

### 에러 코드
- `GOAL_NOT_FOUND`: 목표를 찾을 수 없음
- `ROUTINE_NOT_FOUND`: 운동 루틴을 찾을 수 없음
- `MEMBER_NOT_FOUND`: 회원을 찾을 수 없음
- `UNAUTHORIZED`: 인증 실패
- `FORBIDDEN`: 권한 없음
- `VALIDATION_ERROR`: 입력 데이터 검증 실패

### 날짜 형식
- 모든 날짜는 ISO 8601 형식 사용 (`YYYY-MM-DD` 또는 `YYYY-MM-DDTHH:mm:ssZ`)

---

## 🎯 우선순위

1. **최우선**: 목표 관리 API (회원 상세 페이지에서 즉시 사용)
2. **2순위**: PT 세션 관리 API (회원 상세 페이지에서 사용)
3. **3순위**: 운동 기록 API (운동 분석 기능)
4. **4순위**: 추천 운동 루틴 API (추가 기능)

---

**작성일**: 2024-01-06  
**작성자**: 프론트엔드 팀  
**상태**: 백엔드 구현 대기 중






