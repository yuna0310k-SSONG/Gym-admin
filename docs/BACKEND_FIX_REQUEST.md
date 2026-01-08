# 백엔드 수정 요청: 운동 기록 API 필드명 불일치

## 문제 상황

프론트엔드에서 운동 기록 생성 시 400 에러 발생:
- `property sessionType should not exist` - sessionType 필드가 존재하면 안 됨
- `workoutType must be one of the following values: PT, PERSONAL` - workoutType이 PT 또는 PERSONAL이어야 함
- `weight must not be less than 0` - weight 최소값 제약
- `reps must not be less than 1` - reps 최소값 제약
- `sets must not be less than 1` - sets 최소값 제약

## 요청 사항

### 1. 필드명 통일
- 현재 프론트엔드: `sessionType: "PT" | "SELF"`
- 백엔드 기대값: `workoutType: "PT" | "PERSONAL"`
- **해결**: 백엔드에서 `sessionType` 필드도 허용하거나, 프론트엔드에서 `workoutType`으로 변경

### 2. 값 매핑
- 프론트엔드: `"SELF"` → 백엔드: `"PERSONAL"`로 변환 필요

### 3. 필수 필드 처리
- `weight`, `reps`, `sets`가 선택적(optional)이지만 최소값 제약이 있는 경우, 기본값 허용 또는 필수 필드로 변경

## 권장 해결 방법

**옵션 1 (권장)**: 백엔드에서 `sessionType` 필드도 허용하고 `"SELF"`를 `"PERSONAL"`로 자동 변환

**옵션 2**: 프론트엔드에서 `workoutType`으로 변경하고 `"SELF"` → `"PERSONAL"` 매핑

**옵션 3**: 백엔드 DTO에서 `sessionType`과 `workoutType` 모두 허용하고 내부적으로 통일

## 현재 프론트엔드 요청 형식

```json
{
  "workoutDate": "2024-01-07",
  "exerciseName": "운동 기록",
  "bodyPart": "전신",
  "sessionType": "PT" | "SELF",
  "weight": 0,
  "reps": 1,
  "sets": 1
}
```

## 백엔드 기대 형식

```json
{
  "workoutDate": "2024-01-07",
  "exerciseName": "운동 기록",
  "bodyPart": "전신",
  "workoutType": "PT" | "PERSONAL",
  "weight": 0,  // 최소값 0
  "reps": 1,    // 최소값 1
  "sets": 1     // 최소값 1
}
```



