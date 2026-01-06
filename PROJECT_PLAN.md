---
name: 헬스장 회원관리 시스템
overview: Next.js와 NestJS, PostgreSQL을 사용한 헬스장 회원관리 시스템. 능력치 시각화와 초기 멤버 데이터 평균화 기능이 핵심 차별점입니다. 단일 레포지토리 협업 프로젝트입니다.
todos:
  - id: setup-github
    content: GitHub 단일 저장소 생성, 브랜치 전략, 협업 문서 작성
    status: pending
  - id: setup-backend
    content: 백엔드 프로젝트 초기화, TypeORM, PostgreSQL, NextAuth.js 설정
    status: pending
    dependencies:
      - setup-github
  - id: setup-frontend
    content: 프론트엔드 프로젝트 초기화, TypeScript, Tailwind CSS, Recharts 설정
    status: pending
    dependencies:
      - setup-github
  - id: setup-database
    content: PostgreSQL 스키마 작성 및 마이그레이션 (User, Member, InjuryHistory, BodySpec, StrengthTest, CardioTest)
    status: pending
    dependencies:
      - setup-backend
  - id: setup-auth
    content: NextAuth.js 설정 및 인증 API 구현
    status: pending
    dependencies:
      - setup-database
  - id: member-crud
    content: 회원 CRUD API 및 페이지 구현 (목록, 상세, 등록, 수정)
    status: pending
    dependencies:
      - setup-auth
      - setup-frontend
  - id: assessment-system
    content: 평가 시스템 구현 (초기/정기 평가, 점수 계산 로직, 스냅샷 저장)
    status: pending
    dependencies:
      - member-crud
  - id: injury-weight-system
    content: 부상-평가 제한 시스템 구현
    status: pending
    dependencies:
      - assessment-system
  - id: individual-charts
    content: 개별 회원 능력치 시각화 차트 구현 (Recharts 사용)
    status: pending
    dependencies:
      - status-forms
  - id: average-calculation
    content: 평균 계산 로직 및 API 구현
    status: pending
    dependencies:
      - individual-charts
  - id: comparison-charts
    content: 평균 비교 차트 및 전체 평균 대시보드 구현
    status: pending
    dependencies:
      - average-calculation
  - id: ui-polish
    content: 반응형 디자인, 로딩 상태, 에러 처리 등 UI/UX 개선
    status: pending
    dependencies:
      - comparison-charts
---

# 헬스장 회원관리 시스템 개발 계획

## 📋 프로젝트 개요

### 🎯 프로젝트 정체성

> **본 프로젝트는 단순 헬스장 회원 관리가 아닌, 회원의 신체 능력을 수치화·평균화·시각화하고 시간에 따른 변화를 추적하는 데이터 기반 헬스 관리 시스템이다.**

**핵심 가치**: CRUD 프로젝트가 아닌 **"헬스 데이터 플랫폼"**

### 기본 정보

| 항목           | 내용                                                                                                 |
| -------------- | ---------------------------------------------------------------------------------------------------- |
| **프로젝트명** | 헬스 데이터 플랫폼 (헬스장 회원관리 시스템)                                                          |
| **목적**       | 회원의 신체 능력을 수치화·평균화·시각화하고 시간에 따른 변화를 추적하는 데이터 기반 헬스 관리 시스템 |
| **개발 방식**  | 단일 레포지토리 (프론트엔드/백엔드 폴더 분리)                                                        |
| **협업 방식**  | GitHub 기반 협업 (단일 레포, 브랜치 전략)                                                            |

### 차별화 포인트

- ✅ **능력치 시각화**: 차트로 회원의 변화 추적 (Recharts 사용)
- ✅ **초기/정기 평가 시스템**: 초기 평가를 기준점(Baseline)으로 설정, 정기 평가로 변화 추적
- ✅ **능력치 점수 계산**: 서버에서 측정값을 표준화 점수로 변환하여 종합 점수 산출
- ✅ **능력치 스냅샷**: 평가 시점의 점수를 고정 저장하여 시간별 비교 가능
- ✅ **부상-평가 제한**: 부상 이력이 있는 영역은 평가에서 제외 (운동 수행 불가)
- ✅ **평균화 및 비교**: 전체 평균과 비교하여 백분위 표시, 지난주/이전 평가 비교

### 팀 구성

| 역할           | 담당자 | 주요 책임                                |
| -------------- | ------ | ---------------------------------------- |
| **백엔드**     | 본인   | API 개발, 데이터베이스 관리, 인증 시스템 |
| **프론트엔드** | 팀원   | UI/UX 개발, 페이지 구현, 차트 시각화     |

---

## 🏗 프로젝트 구조 (단일 레포지토리)

### 레포지토리 구성

```
GitHub Repository: gym-membership
│
├── 📂 frontend/       (프론트엔드 - Next.js)
│   └── 프론트엔드 개발자 작업
│
├── 📂 backend/        (백엔드 - NestJS)
│   └── 백엔드 개발자 작업
│
└── 📂 docs/           (공통 문서)
```

### 통신 방식

```mermaid
graph LR
    subgraph Repo["gym-membership (단일 레포)"]
        subgraph Front["frontend/ (Next.js)"]
            FE[프론트엔드<br/>Next.js App]
        end

        subgraph Back["backend/ (NestJS)"]
            BE[백엔드 API<br/>NestJS]
            DB[(PostgreSQL)]
        end
    end

    FE -->|HTTP/REST API<br/>같은 도메인| BE
    BE --> DB

    style Repo fill:#e1f5ff
    style Front fill:#e1f5ff
    style Back fill:#ffe1e1
```

---

## 📁 프로젝트 파일 구조

### 🔴 백엔드 (`backend/`)

```
backend/
│
├── 📂 src/
│   ├── 📂 modules/                  # NestJS 모듈
│   │   ├── auth/
│   │   │   └── auth.module.ts
│   │   ├── members/
│   │   │   └── members.module.ts
│   │   ├── assessments/
│   │   │   └── assessments.module.ts
│   │   └── analytics/
│   │       └── analytics.module.ts
│   │
│   ├── 📂 controllers/              # 컨트롤러
│   │   ├── auth.controller.ts
│   │   ├── members.controller.ts
│   │   ├── assessments.controller.ts
│   │   └── analytics.controller.ts
│   │
│   ├── 📂 services/                 # 서비스
│   │   ├── auth.service.ts
│   │   ├── members.service.ts
│   │   ├── assessments.service.ts
│   │   └── analytics.service.ts
│   │
│   └── 📂 common/                   # 공통 모듈
│       ├── utils/
│       │   ├── analytics.ts         # 평균 계산 로직
│       │   ├── validation.ts        # 데이터 검증 유틸
│       │   └── errors.ts            # 에러 처리 유틸
│       └── decorators/
│
├── 📂 entities/
│   ├── User.ts                      # User 엔티티
│   ├── Member.ts                    # Member 엔티티
│   ├── Membership.ts                # Membership 엔티티
│   ├── PTUsage.ts                   # PTUsage 엔티티
│   ├── Assessment.ts                # Assessment 엔티티
│   ├── AssessmentItem.ts            # AssessmentItem 엔티티
│   ├── AbilitySnapshot.ts            # AbilitySnapshot 엔티티
│   ├── InjuryHistory.ts             # InjuryHistory 엔티티
│   └── InjuryRestriction.ts         # InjuryRestriction 엔티티
│
├── 📂 migrations/                    # TypeORM 마이그레이션 파일
│
├── 📂 types/
│   ├── api/
│   │   ├── responses.ts            # API 응답 타입
│   │   ├── requests.ts              # API 요청 타입
│   │   └── errors.ts                # 에러 타입
│   └── domain/
│       ├── member.ts                # 회원 도메인 타입
│       ├── assessment.ts            # 평가 도메인 타입
│       └── ability.ts               # 능력치 도메인 타입
│
├── .env.example                     # 환경 변수 템플릿
├── .gitignore
├── README.md                        # 백엔드 프로젝트 README
├── package.json
├── tsconfig.json
└── nest-cli.json
```

**담당자**: 백엔드 개발자

**주요 특징**:

- API 엔드포인트만 포함
- TypeORM 엔티티 및 마이그레이션 관리
- 비즈니스 로직 및 평균 계산 로직
- API 명세서 제공

---

### 🔵 프론트엔드 (`frontend/`)

```
frontend/
│
├── 📂 app/
│   ├── 📂 (auth)/
│   │   └── login/
│   │       └── page.tsx            # 로그인 페이지
│   │
│   ├── 📂 (dashboard)/
│   │   ├── page.tsx                # 대시보드 홈
│   │   │                            # - 운영 능력치 헥사곤
│   │   │                            # - 이번 주 vs 지난 주 비교 카드
│   │   │                            # - 위험 신호 회원 리스트
│   │   │
│   │   ├── members/
│   │   │   ├── page.tsx            # 회원 목록
│   │   │   │                        # - 회원 테이블
│   │   │   │                        # - 검색 / 필터
│   │   │   │                        # - 상태 뱃지
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx        # 회원 상세
│   │   │   │                        # - 기본 회원 정보
│   │   │   │                        # - 능력치 헥사곤
│   │   │   │                        # - 능력치 변화 비교
│   │   │   │                        # - 체력 테스트 히스토리
│   │   │   │                        # - 부상 이력
│   │   │   │                        # - 회원권 정보
│   │   │   │                        # - PT 횟수 정보
│   │   │   └── new/
│   │   │       └── page.tsx        # 회원 등록
│   │
│   ├── layout.tsx                   # 루트 레이아웃
│   └── page.tsx                     # 루트 페이지 (리다이렉트)
│
├── 📂 components/
│   ├── members/
│   │   ├── MemberTable.tsx         # 회원 테이블
│   │   ├── MemberProfile.tsx       # 회원 프로필
│   │   └── MemberSummaryCard.tsx   # 회원 요약 카드
│   │
│   ├── health/
│   │   ├── AbilityHexagon.tsx      # 능력치 헥사곤 (Radar Chart)
│   │   ├── AbilityCompare.tsx      # 능력치 변화 비교
│   │   ├── PhysicalSpecForm.tsx   # 신체 스펙 입력 폼
│   │   ├── InjuryForm.tsx          # 부상이력 입력 폼
│   │   └── FitnessTestForm.tsx    # 체력 테스트 입력 폼
│   │
│   ├── charts/
│   │   ├── RadarChart.tsx          # 레이더 차트 (기본)
│   │   ├── LineChart.tsx           # 라인 차트 (기본)
│   │   └── BarChart.tsx            # 바 차트 (기본)
│   │
│   ├── ui/                          # 공통 UI 컴포넌트
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx                # 상태 뱃지
│   │   ├── Table.tsx                # 테이블 컴포넌트
│   │   └── Loading.tsx
│   │
│   └── layout/
│       ├── Header.tsx              # 헤더 컴포넌트
│       └── Sidebar.tsx             # 사이드바 컴포넌트
│
├── 📂 services/
│   ├── auth.service.ts              # 인증 서비스
│   ├── member.service.ts            # 회원 관리 서비스
│   ├── health.service.ts            # 건강/능력치 서비스
│   └── insight.service.ts           # 인사이트 서비스
│
├── 📂 lib/
│   ├── api/
│   │   ├── client.ts                # API 클라이언트 설정
│   │   ├── members.ts               # 회원 API 함수
│   │   ├── auth.ts                  # 인증 API 함수
│   │   └── analytics.ts             # 분석 API 함수
│   │
│   ├── hooks/
│   │   ├── useAuth.ts               # 인증 훅
│   │   ├── useMembers.ts            # 회원 데이터 훅
│   │   └── useAnalytics.ts          # 분석 데이터 훅
│   │
│   └── utils/
│       ├── format.ts                # 데이터 포맷팅
│       └── validation.ts             # 클라이언트 검증
│
├── 📂 providers/
│   └── QueryProvider.tsx            # React Query Provider
│
├── 📂 types/
│   ├── api/
│   │   ├── responses.ts            # API 응답 타입
│   │   ├── requests.ts              # API 요청 타입
│   │   └── errors.ts                # 에러 타입
│   └── domain/
│       ├── member.ts                # 회원 도메인 타입
│       ├── assessment.ts            # 평가 도메인 타입
│       └── ability.ts               # 능력치 도메인 타입
│
├── 📂 styles/
│   └── globals.css                  # 전역 스타일
│
├── 📂 public/                       # 정적 파일
│
├── .env.example                     # 환경 변수 템플릿
├── .gitignore
├── README.md                        # 프론트엔드 프로젝트 README
├── package.json
├── tsconfig.json
├── next.config.js
└── tailwind.config.ts
```

**담당자**: 프론트엔드 개발자

**주요 특징**:

- UI/UX 컴포넌트만 포함
- 서비스 레이어로 API 호출 추상화
- React Query를 통한 서버 상태 관리
- 차트 시각화 컴포넌트 (Radar, Line, Bar)
- 백엔드 API와 통신 (계산 로직 없음, 표현 계층만 담당)

**상태 관리**:

- **전역 상태**: 로그인 상태, 관리자 권한 (Context API 또는 Zustand)
- **서버 상태**: React Query 사용 (memberId, period 기준 캐싱)
- **계산 로직**: 프론트엔드에서 수행하지 않음 (백엔드에서만 처리)

**프론트엔드에서 하지 않는 것 (중요)**:

- ❌ 능력치 계산
- ❌ 점수 정규화
- ❌ 기준 비교 로직
- ❌ 위험 판단
- ❌ 증감 계산

> 프론트는 **표현 계층(View Layer)**만 담당한다.

---

## 🔌 API 통신 설정

### 환경 변수

#### 백엔드 (`backend/.env`)

```env
# 데이터베이스
DATABASE_URL="postgresql://user:password@localhost:5432/gym_membership"

# NestJS 서버
PORT=3001

# JWT (인증)
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
```

#### 프론트엔드 (`frontend/.env`)

```env
# 백엔드 API URL (같은 도메인 또는 별도 포트)
NEXT_PUBLIC_API_URL="http://localhost:3001"

# NextAuth (필요시)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

### API 클라이언트 설정

**프론트엔드** (`frontend/lib/api/client.ts`):

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const apiClient = {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // 쿠키 포함
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  },

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  },

  // PUT, DELETE 등 추가...
};
```

**참고**: 단일 레포지토리 구조이므로 CORS 설정이 필요 없습니다. 프론트엔드와 백엔드가 같은 도메인에서 실행되거나, 개발 환경에서 프록시를 사용할 수 있습니다.

---

## 🎯 시스템 아키텍처

### 전체 시스템 구조

```mermaid
graph TB
    subgraph User["사용자"]
        Browser[웹 브라우저]
    end

    subgraph Repo["gym-membership (단일 레포)"]
        subgraph Front["frontend/ (Next.js)"]
            Pages[페이지 컴포넌트]
            Components[UI 컴포넌트]
            Charts[차트 컴포넌트]
            APIClient[API 클라이언트]
        end

        subgraph Back["backend/ (NestJS)"]
            API[API Controllers]
            Auth[인증 미들웨어]
            BusinessLogic[비즈니스 로직]
            DataSource[TypeORM DataSource]
        end
    end

    subgraph Database["데이터베이스"]
        PostgreSQL[(PostgreSQL)]
    end

    Browser --> Pages
    Pages --> Components
    Pages --> Charts
    Components --> APIClient
    Charts --> APIClient

    APIClient -->|HTTP/REST<br/>같은 도메인| API
    API --> Auth
    API --> BusinessLogic
    BusinessLogic --> DataSource
    DataSource --> PostgreSQL

    style Repo fill:#e1f5ff
    style Front fill:#e1f5ff
    style Back fill:#ffe1e1
    style Database fill:#f0f0f0
```

### 데이터 흐름도

```mermaid
sequenceDiagram
    participant User as 사용자
    participant Frontend as 프론트엔드<br/>(frontend/)
    participant Backend as 백엔드 API<br/>(backend/)
    participant DB as PostgreSQL

    User->>Frontend: 페이지 접속
    Frontend->>Backend: GET /api/members
    Backend->>DB: TypeORM 쿼리
    DB-->>Backend: 데이터 반환
    Backend->>Backend: 데이터 가공
    Backend-->>Frontend: JSON 응답
    Frontend->>Frontend: 데이터 렌더링
    Frontend-->>User: 화면 표시

    User->>Frontend: 능력치 조회
    Frontend->>Backend: GET /api/members/[id]/analytics
    Backend->>DB: 데이터 조회
    Backend->>Backend: 평균 계산
    DB-->>Backend: 원본 데이터
    Backend-->>Frontend: 분석 데이터 + 평균
    Frontend->>Frontend: 차트 렌더링 (Recharts)
    Frontend-->>User: 시각화된 차트
```

---

## 🛠 기술 스택

### 공통 기술

| 기술             | 버전 | 용도                    |
| ---------------- | ---- | ----------------------- |
| **Next.js**      | 14.x | 프레임워크 (App Router) |
| **TypeScript**   | 5.x  | 타입 안정성             |
| **Tailwind CSS** | 3.x  | 스타일링                |

### 백엔드 전용

| 기술            | 버전  | 용도         |
| --------------- | ----- | ------------ |
| **PostgreSQL**  | 15+   | 데이터베이스 |
| **TypeORM**     | 0.3.x | ORM          |
| **NextAuth.js** | 5.x   | 인증 시스템  |

### 프론트엔드 전용

| 기술                | 버전 | 용도               |
| ------------------- | ---- | ------------------ |
| **Recharts**        | 2.x  | 차트 시각화        |
| **React Query**     | 5.x  | 서버 상태 관리     |
| **React Hook Form** | 7.x  | 폼 관리            |
| **Zod**             | 3.x  | 스키마 검증 (선택) |

---

## 🗄 데이터베이스 스키마 설계 (TypeORM)

### TypeORM 설정

**DataSource 설정** (`backend/src/common/data-source.ts`):

```typescript
import { DataSource } from "typeorm";
import { User } from "@/entities/User";
import { Member } from "@/entities/Member";
import { Membership } from "@/entities/Membership";
import { PTUsage } from "@/entities/PTUsage";
import { Assessment } from "@/entities/Assessment";
import { AssessmentItem } from "@/entities/AssessmentItem";
import { AbilitySnapshot } from "@/entities/AbilitySnapshot";
import { InjuryHistory } from "@/entities/InjuryHistory";
import { InjuryRestriction } from "@/entities/InjuryRestriction";

export const dataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities: [
    User,
    Member,
    Membership,
    PTUsage,
    Assessment,
    AssessmentItem,
    AbilitySnapshot,
    InjuryHistory,
    InjuryRestriction,
  ],
  synchronize: false, // 프로덕션에서는 false, 개발 시에만 true
  logging: process.env.NODE_ENV === "development",
  migrations: ["migrations/*.ts"],
});

// 싱글톤 패턴으로 DataSource 초기화
let initialized = false;

export async function initializeDataSource() {
  if (!initialized) {
    await dataSource.initialize();
    initialized = true;
  }
  return dataSource;
}
```

**엔티티 예시** (`backend/src/entities/Member.ts`):

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";

@Entity("members")
export class Member {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column()
  email: string;

  @Column({ type: "date" })
  joinDate: Date;

  @Column()
  status: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @DeleteDateColumn({ name: "deleted_at", nullable: true })
  deletedAt?: Date;
}
```

**마이그레이션 실행**:

```bash
# 마이그레이션 생성
npm run typeorm migration:generate -- -n MigrationName

# 마이그레이션 실행
npm run typeorm migration:run
```

### 핵심 개념: 평가(Assessment) 시스템

#### 평가 유형

1. **초기 평가 (Initial Assessment)**

   - 최초 등록 시 1회만 수행
   - 모든 비교의 기준점 (Baseline)
   - `isInitial: true`로 구분

2. **정기 평가 (Periodic Assessment)**
   - 주간/월간 주기로 수행
   - 변화 추적용
   - `isInitial: false`로 구분

### ER 다이어그램

```mermaid
erDiagram
    User ||--o{ Member : manages
    Member ||--o{ Assessment : has
    Member ||--o{ InjuryHistory : has
    Member ||--o| Membership : has
    Member ||--o{ PTUsage : has
    Assessment ||--o{ AssessmentItem : contains
    Assessment ||--o{ AbilitySnapshot : generates
    InjuryHistory ||--o{ InjuryRestriction : restricts

    User {
        string id PK
        string email UK
        string password
        string name
        string role "ADMIN|TRAINER|MEMBER"
        datetime createdAt
        datetime updatedAt
        datetime deletedAt "nullable"
    }

    Member {
        string id PK
        string name
        string phone
        string email
        date joinDate
        string status
        datetime createdAt
        datetime updatedAt
        datetime deletedAt "nullable"
    }

    Membership {
        string id PK
        string memberId FK
        string membershipType "MONTHLY|QUARTERLY|YEARLY|LIFETIME"
        date purchaseDate
        date expiryDate
        string status "ACTIVE|EXPIRED|SUSPENDED"
        decimal price
        datetime createdAt
        datetime updatedAt
    }

    PTUsage {
        string id PK
        string memberId FK
        int totalCount
        int remainingCount
        int usedCount
        date lastUsedDate
        datetime createdAt
        datetime updatedAt
    }

    Assessment {
        string id PK
        string memberId FK
        string assessmentType "INITIAL|PERIODIC"
        boolean isInitial
        date assessedAt
        text trainerComment
        float bodyWeight
        string condition "EXCELLENT|GOOD|NORMAL|POOR"
        datetime createdAt
        datetime updatedAt
        datetime deletedAt "nullable"
    }

    AssessmentItem {
        string id PK
        string assessmentId FK
        string category "STRENGTH|CARDIO|ENDURANCE|BODY|STABILITY"
        string name
        float value
        string unit
        float score
        datetime createdAt
    }

    AbilitySnapshot {
        string id PK
        string assessmentId FK
        string memberId FK
        datetime assessedAt
        string version "v1, v2, ..."
        float strengthScore
        float cardioScore
        float enduranceScore
        float bodyScore
        float stabilityScore
        float totalScore
        datetime createdAt
    }

    InjuryHistory {
        string id PK
        string memberId FK
        string injuryType
        string bodyPart
        date date
        string severity "MILD|MODERATE|SEVERE"
        text description
        string recoveryStatus "RECOVERED|RECOVERING|CHRONIC"
        datetime createdAt
        datetime updatedAt
        datetime deletedAt "nullable"
    }

    InjuryRestriction {
        string id PK
        string injuryId FK
        string restrictedCategory "STRENGTH|CARDIO|ENDURANCE|BODY|STABILITY"
        datetime createdAt
    }
```

### 테이블 상세 설명

| 테이블                | 설명                  | 주요 필드                                                                      | 담당    |
| --------------------- | --------------------- | ------------------------------------------------------------------------------ | ------- | ------------------ | ------ |
| **User**              | 관리자/트레이너       | id, email, password, role (ADMIN                                               | TRAINER | MEMBER), deletedAt | 백엔드 |
| **Member**            | 회원 기본 정보        | id, name, phone, email, joinDate                                               | 공통    |
| **Assessment**        | 평가 세션             | id, memberId, assessmentType, isInitial, assessedAt, trainerComment, deletedAt | 공통    |
| **AssessmentItem**    | 평가 항목 (확장 가능) | id, assessmentId, category, name, value, unit, score                           | 공통    |
| **AbilitySnapshot**   | 능력치 스냅샷         | id, assessmentId, memberId, assessedAt, version, strengthScore, totalScore     | 공통    |
| **InjuryHistory**     | 부상이력              | id, memberId, injuryType, bodyPart, date, severity, recoveryStatus, deletedAt  | 공통    |
| **InjuryRestriction** | 부상-평가 제한        | id, injuryId, restrictedCategory                                               | 공통    |

### 핵심 테이블 상세

#### Assessment (평가)

평가 세션을 나타내는 테이블. 초기 평가와 정기 평가를 구분한다.

```typescript
interface Assessment {
  id: string;
  memberId: string;
  assessmentType: "INITIAL" | "PERIODIC";
  isInitial: boolean; // 초기 평가 여부
  assessedAt: Date; // 평가 시점
  trainerComment?: string; // 트레이너 메모
  bodyWeight?: number; // 평가 당시 체중
  condition?: "EXCELLENT" | "GOOD" | "NORMAL" | "POOR"; // 컨디션
  createdAt: Date;
  updatedAt: Date;
}
```

#### AssessmentItem (평가 항목)

확장 가능한 평가 항목 구조. 하드코딩 없이 카테고리 기반으로 관리.

```typescript
interface AssessmentItem {
  id: string;
  assessmentId: string;
  category: "STRENGTH" | "CARDIO" | "ENDURANCE" | "BODY" | "STABILITY";
  name: string; // 예: "하체근력", "심폐지구력"
  value: number; // 측정값
  unit: string; // 단위: "kg", "ml/kg/min"
  score: number; // 계산된 점수 (0-100)
  createdAt: Date;
}
```

#### AbilitySnapshot (능력치 스냅샷)

평가 시점의 점수를 고정 저장. 시간별 비교를 위한 핵심 데이터.

```typescript
interface AbilitySnapshot {
  id: string;
  assessmentId: string;
  memberId: string;
  assessedAt: Date; // 평가 시점
  version: string; // 계산 기준 버전 (예: "v1", "v2", ...)
  strengthScore: number; // 근력 점수 (0-100)
  cardioScore: number; // 심폐 점수 (0-100)
  enduranceScore: number; // 지구력 점수 (0-100)
  bodyScore: number; // 신체 점수 (0-100)
  stabilityScore: number; // 안정성 점수 (0-100)
  totalScore: number; // 종합 점수 (0-100)
  createdAt: Date;
}
```

**중요**:

- "현재 점수"는 항상 가장 최신 스냅샷을 의미한다.
- `version` 필드는 계산 로직이 변경될 때를 대비한 버전 관리 필드다. 능력치 계산 로직 변경 시 기존 스냅샷은 유지하며, 새로운 계산 기준은 version으로 구분한다.

#### InjuryRestriction (부상-평가 제한)

부상으로 인해 평가가 불가능한 영역을 정의. 감점이 아닌 평가 제외 방식.

```typescript
interface InjuryRestriction {
  id: string;
  injuryId: string;
  restrictedCategory:
    | "STRENGTH"
    | "CARDIO"
    | "ENDURANCE"
    | "BODY"
    | "STABILITY";
  createdAt: Date;
}
```

**예시**:

- 무릎 부상 → 하체 근력 (STRENGTH) 평가 제외 (운동 수행 불가)
- 어깨 부상 → 상체 근력 (STRENGTH) 평가 제외 (운동 수행 불가)

---

## 🎨 핵심 기능 구현

### 기능별 역할 분담표

| 기능                 | 백엔드 담당                                     | 프론트엔드 담당                 |
| -------------------- | ----------------------------------------------- | ------------------------------- |
| **인증**             | NextAuth 설정, 세션 API                         | 로그인 페이지, 인증 상태 관리   |
| **회원 관리**        | CRUD API, 데이터 검증                           | 회원 목록/상세 페이지, 폼       |
| **평가 시스템**      | 평가 CRUD API, 초기/정기 평가 구분              | 평가 입력 폼, 평가 목록         |
| **능력치 점수 계산** | **서버에서 점수 계산** (측정값 → 표준화 → 점수) | 점수 표시 (계산 없음)           |
| **능력치 스냅샷**    | 스냅샷 저장, 조회 API                           | 스냅샷 데이터 시각화            |
| **부상-평가 제한**   | 부상 영역 평가 제외 로직                        | 평가 불가 영역 표시             |
| **능력치 시각화**    | 스냅샷 조회 API, 비교 데이터 제공               | 레이더 차트, 라인 차트, 카드 UI |
| **평균화 및 비교**   | 평균 계산, 지난주/이전 평가 비교 API            | 평균 비교 차트, 백분위 UI       |

### 핵심 비즈니스 로직: 능력치 점수 계산

#### 책임 분리 원칙

**✅ 서버에서 계산 (백엔드 담당)**:

- Raw Data 입력 (측정값)
- 서버에서 점수 계산
- 스냅샷 저장

**❌ 프론트엔드에서 계산 금지**:

- 기준 통일
- 리팩토링 용이
- 보안 (계산 로직 보호)

#### 점수 계산 프로세스

```mermaid
graph LR
    A[Raw Data<br/>측정값] --> B[표준화<br/>Normalization]
    B --> C[영역별 점수<br/>Category Score]
    C --> D[부상 영역 제외<br/>Injury Restriction]
    D --> E[영역 평균<br/>Category Average]
    E --> F[종합 점수<br/>Total Score]
    F --> G[스냅샷 저장<br/>Snapshot]
```

#### 계산 단계 상세

1. **Raw Data 입력** (프론트엔드 → 백엔드)

   ```typescript
   {
     assessmentId: "xxx",
     items: [
       { category: "STRENGTH", name: "스쿼트", value: 100, unit: "kg" },
       { category: "CARDIO", name: "VO2 Max", value: 45, unit: "ml/kg/min" }
     ]
   }
   ```

2. **표준화 (Normalization)** (백엔드)

   ```typescript
   // 측정값을 0-100 점수로 변환
   function normalizeValue(value: number, min: number, max: number): number {
     return ((value - min) / (max - min)) * 100;
   }
   ```

3. **영역별 점수 계산** (백엔드)

   ```typescript
   // 카테고리별 평균 점수
   const strengthScore = average(strengthItems.map((item) => item.score));
   const cardioScore = average(cardioItems.map((item) => item.score));
   ```

4. **부상 영역 평가 제외** (백엔드)

   ```typescript
   // 부상이 있는 경우 해당 영역 평가 제외 (감점이 아닌 평가 불가)
   function excludeRestrictedCategories(
     categoryScores: CategoryScores,
     restrictions: InjuryRestriction[]
   ): CategoryScores {
     const restrictedCategories = restrictions.map((r) => r.restrictedCategory);
     const adjustedScores = { ...categoryScores };

     // 제한된 영역은 null로 처리 (종합 점수 계산 시 제외)
     restrictedCategories.forEach((category) => {
       if (category === "STRENGTH") adjustedScores.strengthScore = null;
       if (category === "CARDIO") adjustedScores.cardioScore = null;
       // ... 기타 카테고리
     });

     return adjustedScores;
   }
   ```

5. **종합 점수 계산** (백엔드)

   ```typescript
   const totalScore =
     strengthScore * 0.3 +
     cardioScore * 0.25 +
     enduranceScore * 0.2 +
     bodyScore * 0.15 +
     stabilityScore * 0.1;
   ```

6. **스냅샷 저장** (백엔드)

   ```typescript
   const CURRENT_VERSION = "v1"; // 현재 계산 기준 버전

   const abilitySnapshotRepository = dataSource.getRepository(AbilitySnapshot);
   await abilitySnapshotRepository.save({
     assessmentId,
     memberId,
     assessedAt: new Date(),
     version: CURRENT_VERSION, // 계산 기준 버전
     strengthScore,
     cardioScore,
     enduranceScore,
     bodyScore,
     stabilityScore,
     totalScore,
   });
   ```

#### 능력치 계산 실패 시 정책 (Fallback)

**정책**: 일부 능력치 계산 실패 시 전체 계산은 중단되지 않는다.

**구현 원칙**:

- 입력값 누락: 해당 영역 `null` 처리, 종합 점수 계산 시 제외
- 기준 테이블 없음: 기본값 사용 또는 `null` 처리
- 부상 영역 평가 제외: 해당 영역은 null 처리, 종합 점수 계산 시 제외

**예시**:

```typescript
// 일부 영역 계산 실패 시
{
  strengthScore: 75,
  cardioScore: null, // 계산 실패
  enduranceScore: 80,
  bodyScore: 65,
  stabilityScore: 70,
  totalScore: 72.5 // null 제외하고 계산 (75+80+65+70)/4
}
```

**구현 위치**: `backend/src/common/utils/scoreCalculator.ts`의 `calculateCategoryScores` 메서드

#### 구현 위치

**백엔드**: `backend/src/common/utils/scoreCalculator.ts`

```typescript
// backend/src/common/utils/scoreCalculator.ts
const CURRENT_VERSION = "v1"; // 현재 계산 기준 버전

export class ScoreCalculator {
  static async calculateAssessmentScore(
    assessmentId: string,
    memberId: string
  ): Promise<AbilitySnapshot> {
    try {
      // 1. 평가 항목 조회
      const items = await getAssessmentItems(assessmentId);

      // 2. 표준화 및 점수 계산 (일부 실패 허용)
      const categoryScores = this.calculateCategoryScores(items);

      // 3. 부상 영역 평가 제외 (부상이 있는 영역은 평가 불가)
      const injuryRestrictions = await getInjuryRestrictions(memberId);
      const adjustedScores = this.excludeRestrictedCategories(
        categoryScores,
        injuryRestrictions
      );

      // 4. 종합 점수 계산 (null 제외)
      const totalScore = this.calculateTotalScore(adjustedScores);

      // 5. 스냅샷 저장 (버전 포함)
      return await this.saveSnapshot(
        assessmentId,
        memberId,
        adjustedScores,
        totalScore,
        CURRENT_VERSION
      );
    } catch (error) {
      // 계산 실패 로깅
      console.error(
        `Ability calculation failed for assessment ${assessmentId}:`,
        error
      );
      throw error;
    }
  }

  // ... 상세 구현
}
```

### 1. 인증 및 권한 시스템

#### 역할(Role) 기반 접근 제어

**Role Enum**:

```typescript
enum Role {
  ADMIN = "ADMIN", // 관리자
  TRAINER = "TRAINER", // 트레이너
  MEMBER = "MEMBER", // 회원
}
```

**권한 기준**:

| Role        | 권한                      | 설명                 |
| ----------- | ------------------------- | -------------------- |
| **MEMBER**  | 조회만                    | 자신의 데이터 조회   |
| **TRAINER** | 평가 입력, 회원 정보 조회 | 평가 입력, 회원 조회 |
| **ADMIN**   | 수정/삭제, 모든 기능 접근 | 전체 관리 권한       |

**정책**: 모든 민감 API는 Role 기반 접근 제어를 따른다.

**구현 위치**: `backend/src/common/guards/roles.guard.ts`

```typescript
export function requireRole(roles: Role[]) {
  return async (req: NextRequest) => {
    const session = await getServerSession();
    if (!session?.user?.role || !roles.includes(session.user.role)) {
      return errorResponse(ErrorCodes.FORBIDDEN, "접근 권한이 없습니다.", 403);
    }
  };
}

// 사용 예시
export async function GET(req: NextRequest) {
  const authCheck = requireRole([Role.ADMIN, Role.TRAINER]);
  const authResult = await authCheck(req);
  if (authResult) return authResult;
  // ... API 로직
}
```

#### 백엔드 구현

**파일**: `backend/src/modules/auth/auth.service.ts`, `backend/src/modules/auth/auth.controller.ts`

- JWT 인증 설정
- 세션 관리
- JWT 토큰 발급
- Role 기반 권한 검사

#### 프론트엔드 구현

**파일**: `frontend/app/(auth)/login/page.tsx`, `frontend/lib/hooks/useAuth.ts`

- 로그인 페이지 UI
- 인증 상태 관리 훅
- 라우트 보호 미들웨어
- Role 기반 UI 표시 제어

---

### 2. 회원 관리

#### 백엔드 API

**기본 회원 관리**:

| 엔드포인트          | 메서드 | 설명           |
| ------------------- | ------ | -------------- |
| `/api/members`      | GET    | 회원 목록 조회 |
| `/api/members`      | POST   | 회원 등록      |
| `/api/members/[id]` | GET    | 회원 상세 조회 |
| `/api/members/[id]` | PUT    | 회원 수정      |
| `/api/members/[id]` | DELETE | 회원 삭제      |

**회원권 관리**:

| 엔드포인트                     | 메서드 | 설명        |
| ------------------------------ | ------ | ----------- |
| `/api/members/[id]/membership` | GET    | 회원권 조회 |
| `/api/members/[id]/membership` | POST   | 회원권 등록 |
| `/api/members/[id]/membership` | PUT    | 회원권 수정 |
| `/api/members/[id]/membership` | DELETE | 회원권 삭제 |

**PT 횟수 관리**:

| 엔드포인트                   | 메서드 | 설명              |
| ---------------------------- | ------ | ----------------- |
| `/api/members/[id]/pt-count` | GET    | PT 횟수 조회      |
| `/api/members/[id]/pt-count` | POST   | PT 횟수 추가/차감 |
| `/api/members/[id]/pt-count` | PUT    | PT 횟수 수정      |

#### 프론트엔드 페이지

**페이지**:

- `app/(dashboard)/members/page.tsx` - 회원 목록 (검색/필터, 상태 뱃지)
- `app/(dashboard)/members/[id]/page.tsx` - 회원 상세 (기본 정보 + 능력치 시각화 통합)
- `app/(dashboard)/members/new/page.tsx` - 회원 등록

**컴포넌트**:

- `components/members/MemberTable.tsx` - 회원 테이블
- `components/members/MemberProfile.tsx` - 회원 프로필
- `components/members/MemberSummaryCard.tsx` - 회원 요약 카드
- `components/members/MembershipCard.tsx` - 회원권 카드 (회원 상세에 통합)
- `components/members/PTCountCard.tsx` - PT 횟수 카드 (회원 상세에 통합)

---

### 3. 능력치 데이터 입력

#### 백엔드 API

| 엔드포인트                         | 메서드    | 설명            |
| ---------------------------------- | --------- | --------------- |
| `/api/members/[id]/injuries`       | GET, POST | 부상이력        |
| `/api/members/[id]/body-specs`     | GET, POST | 신체스펙        |
| `/api/members/[id]/strength-tests` | GET, POST | 근력 능력치     |
| `/api/members/[id]/cardio-tests`   | GET, POST | 심폐지구 능력치 |

#### 프론트엔드 페이지

- `app/(dashboard)/status/strength/page.tsx` - 근력 능력치 입력
- `app/(dashboard)/status/cardio/page.tsx` - 심폐지구 능력치 입력
- `components/forms/*Form.tsx` - 각 입력 폼 컴포넌트

---

### 4. 능력치 시각화 (차별화 포인트 1)

#### AbilityHexagon (능력치 헥사곤) ⭐

**목적**: 회원의 종합 능력치를 6개 지표로 시각화

**6개 지표**:

1. **하체 근력** (Lower Body Strength)
2. **심폐 지구력** (Cardiovascular Endurance)
3. **근지구력** (Muscular Endurance)
4. **유연성** (Flexibility)
5. **체성분 밸런스** (Body Composition Balance)
6. **부상 안정성** (Injury Stability)

**구현 원칙**:

- Radar Chart 기반 (Recharts 사용)
- 백엔드에서 계산된 점수만 사용 (0-100)
- 프론트엔드는 값 렌더링, 기간 토글 UI, 툴팁/설명 표시만 담당
- 증감 계산은 프론트에서 하지 않음

**백엔드 API**:

**엔드포인트**: `GET /api/members/[id]/abilities/hexagon`

**응답 형식**:

```typescript
{
  indicators: [
    { name: "하체 근력", score: 75 },
    { name: "심폐 지구력", score: 60 },
    { name: "근지구력", score: 70 },
    { name: "유연성", score: 65 },
    { name: "체성분 밸런스", score: 80 },
    { name: "부상 안정성", score: 72 },
  ];
  assessedAt: "2024-03-15T10:00:00Z";
  version: "v1";
}
```

**프론트엔드 구현**:

**컴포넌트**: `components/health/AbilityHexagon.tsx`

```typescript
interface AbilityHexagonProps {
  memberId: string;
  period?: "current" | "week" | "month";
}
```

#### AbilityCompare (능력치 변화 비교)

**목적**: 초기 대비 / 이전 대비 변화 표시

**백엔드 API**:

**엔드포인트**: `GET /api/members/[id]/abilities/compare?prev=1`

**응답 형식**:

```typescript
{
  current: {
    indicators: [
      { name: "하체 근력", score: 75 },
      // ...
    ];
    assessedAt: "2024-03-15";
  }
  previous: {
    indicators: [
      { name: "하체 근력", score: 64 },
      // ...
    ];
    assessedAt: "2024-03-08";
  }
  changes: [
    { name: "하체 근력", delta: 11, percentageChange: 17.19 },
    // ...
  ];
}
```

**프론트엔드 구현**:

**컴포넌트**: `components/health/AbilityCompare.tsx`

- 증감률 표시 (+12%, -3% 등)
- 시각적 강조 (상승/하락 아이콘)
- **증감 계산은 백엔드에서 수행, 프론트는 표시만 담당**

#### 체력 테스트 히스토리

**백엔드 API**:

**엔드포인트**: `GET /api/members/[id]/abilities/history`

**응답 형식**:

```typescript
{
  history: Array<{
    assessedAt: string;
    indicators: Array<{ name: string; score: number }>;
    version: string;
  }>;
}
```

**프론트엔드 구현**:

**컴포넌트**: `components/health/FitnessTestHistory.tsx`

- 라인 차트로 시간별 변화 추이 표시
- 초기 평가(Baseline)와 비교

---

### 5. 대시보드 (Dashboard)

#### 목적

헬스장 전체 운영 현황 및 인사이트 요약

#### 주요 UI

- **운영 능력치 헥사곤**: 전체 회원 평균 능력치를 헥사곤으로 표시
- **이번 주 vs 지난 주 비교 카드**: 주간 변화 요약
- **위험 신호 회원 리스트**: 능력치가 급격히 하락하거나 부상 위험이 있는 회원 표시

#### 백엔드 API

| 엔드포인트                     | 메서드 | 설명                    | 인증 필요 |
| ------------------------------ | ------ | ----------------------- | --------- |
| `/api/insights/hexagon`        | GET    | 운영 능력치 헥사곤      | ✅        |
| `/api/insights/weekly-summary` | GET    | 이번 주 vs 지난 주 비교 | ✅        |
| `/api/insights/risk-members`   | GET    | 위험 신호 회원 리스트   | ✅        |

#### 프론트엔드 구현

**페이지**: `app/(dashboard)/page.tsx`

**컴포넌트**:

- `components/health/AbilityHexagon.tsx` (전체 평균용)
- `components/ui/Card.tsx` (비교 카드)
- `components/members/MemberTable.tsx` (위험 회원 리스트)

---

## 📋 로그 & 추적 포인트 (선택사항)

### 주요 로깅 포인트

**목적**: 나중에 디버깅 및 분석에 도움

**로그 대상**:

1. **Assessment 생성 로그**

   - 평가 생성 시점, 회원 ID, 평가 타입
   - 생성자 정보 (트레이너/관리자)

2. **Ability Snapshot 생성 로그**

   - 스냅샷 생성 시점, 계산된 점수
   - 계산 기준 버전 (version)
   - 계산 실패 시 에러 로그

3. **계산 기준 버전 변경 로그**
   - 버전 변경 이력
   - 변경 이유 및 영향 범위

**구현 위치**: `lib/utils/logger.ts` (선택사항)

**예시**:

```typescript
logger.info("Ability snapshot created", {
  assessmentId,
  memberId,
  version: "v1",
  scores: { strengthScore: 75, totalScore: 68 },
});
```

---

### 5. 평균화 기능 (차별화 포인트 2)

#### 백엔드 API

| 엔드포인트                           | 설명                   |
| ------------------------------------ | ---------------------- |
| `GET /api/analytics/averages`        | 전체 회원 평균 데이터  |
| `GET /api/analytics/comparison/[id]` | 개별 회원 vs 평균 비교 |

**응답 형식**:

```typescript
{
  member: {
    weight: number;
    bodyFat: number;
    squatMax: number;
    // ...
  }
  average: {
    weight: number;
    bodyFat: number;
    squatMax: number;
    // ...
  }
  percentile: {
    weight: number; // 백분위
    bodyFat: number;
    // ...
  }
}
```

#### 프론트엔드 구현

**컴포넌트**:

- `components/charts/ComparisonChart.tsx` - 평균 비교 컴포지트 차트

**페이지**: `app/(dashboard)/analytics/page.tsx` - 전체 평균 대시보드

---

## 📡 API Contract 및 Response 구조

### API Contract 원칙

**목적**: 프론트엔드와 백엔드 간 통일된 데이터 형식으로 통신하여 타입 안정성과 개발 효율성 향상

### 공통 API Response 구조

모든 API 응답은 다음 구조를 따릅니다:

```typescript
// 성공 응답
interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

// 에러 응답
interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// 통합 응답 타입
type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
```

### 응답 예시

#### 성공 응답

```typescript
// GET /api/members/[id]
{
	"success": true,
	"data": {
		"id": "member-123",
		"name": "홍길동",
		"email": "hong@example.com",
		"phone": "010-1234-5678",
		"joinDate": "2024-01-15",
		"status": "ACTIVE"
	},
	"message": "회원 정보 조회 성공"
}
```

#### 에러 응답

```typescript
// GET /api/members/invalid-id
{
	"success": false,
	"error": {
		"code": "MEMBER_NOT_FOUND",
		"message": "회원을 찾을 수 없습니다.",
		"details": {
			"memberId": "invalid-id"
		}
	}
}
```

### HTTP 상태 코드

| 상태 코드                   | 의미        | 사용 시점             |
| --------------------------- | ----------- | --------------------- |
| `200 OK`                    | 성공        | 정상 조회/수정 성공   |
| `201 Created`               | 생성 성공   | 리소스 생성 성공      |
| `400 Bad Request`           | 잘못된 요청 | 요청 데이터 검증 실패 |
| `401 Unauthorized`          | 인증 실패   | 로그인 필요           |
| `403 Forbidden`             | 권한 없음   | 접근 권한 없음        |
| `404 Not Found`             | 리소스 없음 | 요청한 리소스 없음    |
| `500 Internal Server Error` | 서버 오류   | 서버 내부 오류        |

### 네이밍 컨벤션 (API 응답)

**원칙**: 모든 API 응답 필드는 **camelCase** 사용

```typescript
// ✅ 올바른 예시
{
	"memberId": "123",
	"assessedAt": "2024-03-15T10:00:00Z",
	"totalScore": 68,
	"strengthScore": 75,
	"isInitial": true,
	"trainerComment": "좋은 컨디션"
}

// ❌ 잘못된 예시 (snake_case 사용)
{
	"member_id": "123",
	"assessed_at": "2024-03-15T10:00:00Z",
	"total_score": 68
}
```

### 타입 공유 방법

#### 방법 1: 공통 타입 패키지 (권장)

별도 레포지토리 또는 npm 패키지로 타입 정의 공유

```
shared-types/
├── package.json
├── src/
│   ├── api/
│   │   ├── responses.ts      # API 응답 타입
│   │   ├── requests.ts       # API 요청 타입
│   │   └── errors.ts         # 에러 타입
│   └── domain/
│       ├── member.ts
│       ├── assessment.ts
│       └── ability.ts
└── tsconfig.json
```

**사용 방법**:

```typescript
// 백엔드
import { ApiResponse, MemberResponse } from "@gym-membership/shared-types";

// 프론트엔드
import { ApiResponse, MemberResponse } from "@gym-membership/shared-types";
```

#### 방법 2: 타입 파일 동기화 (간단한 방법)

각 레포지토리에 동일한 타입 파일 유지 (수동 동기화)

**백엔드**: `types/api.ts`
**프론트엔드**: `types/api.ts`

### 주요 API Response 타입 정의

#### 회원 관련

```typescript
// GET /api/members
interface MemberListResponse {
  members: Member[];
  total: number;
  page: number;
  pageSize: number;
}

// GET /api/members/[id]
interface MemberResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdAt: string;
  updatedAt: string;
}

// POST /api/members
interface CreateMemberRequest {
  name: string;
  email: string;
  phone: string;
  joinDate: string;
}

// PUT /api/members/[id]
interface UpdateMemberRequest {
  name?: string;
  email?: string;
  phone?: string;
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
}
```

#### 평가 관련

```typescript
// GET /api/members/[id]/assessments
interface AssessmentListResponse {
  assessments: Assessment[];
  total: number;
}

// GET /api/members/[id]/assessments/[assessmentId]
interface AssessmentResponse {
  id: string;
  memberId: string;
  assessmentType: "INITIAL" | "PERIODIC";
  isInitial: boolean;
  assessedAt: string;
  trainerComment?: string;
  bodyWeight?: number;
  condition?: "EXCELLENT" | "GOOD" | "NORMAL" | "POOR";
  items: AssessmentItem[];
  snapshot?: AbilitySnapshot;
  createdAt: string;
  updatedAt: string;
}

// POST /api/members/[id]/assessments
interface CreateAssessmentRequest {
  assessmentType: "INITIAL" | "PERIODIC";
  assessedAt: string;
  trainerComment?: string;
  bodyWeight?: number;
  condition?: "EXCELLENT" | "GOOD" | "NORMAL" | "POOR";
  items: CreateAssessmentItemRequest[];
}

interface CreateAssessmentItemRequest {
  category: "STRENGTH" | "CARDIO" | "ENDURANCE" | "BODY" | "STABILITY";
  name: string;
  value: number;
  unit: string;
}

// PUT /api/members/[id]/assessments/[assessmentId]
interface UpdateAssessmentRequest {
  assessedAt?: string;
  trainerComment?: string;
  bodyWeight?: number;
  condition?: "EXCELLENT" | "GOOD" | "NORMAL" | "POOR";
  items?: UpdateAssessmentItemRequest[];
}
```

#### 능력치 스냅샷 관련

```typescript
// GET /api/members/[id]/abilities/latest
interface LatestAbilitySnapshotResponse {
  id: string;
  assessmentId: string;
  memberId: string;
  assessedAt: string;
  strengthScore: number;
  cardioScore: number;
  enduranceScore: number;
  bodyScore: number;
  stabilityScore: number;
  totalScore: number;
  createdAt: string;
}

// GET /api/members/[id]/abilities/snapshots
interface AbilitySnapshotListResponse {
  snapshots: AbilitySnapshot[];
  total: number;
}

// GET /api/members/[id]/abilities/compare?prev=1
interface AbilityComparisonResponse {
  current: AbilitySnapshot;
  previous: AbilitySnapshot;
  delta: {
    totalScore: number;
    strengthScore: number;
    cardioScore: number;
    enduranceScore: number;
    bodyScore: number;
    stabilityScore: number;
  };
  percentageChange: {
    totalScore: number;
    strengthScore: number;
    cardioScore: number;
    enduranceScore: number;
    bodyScore: number;
    stabilityScore: number;
  };
}
```

#### 부상 관련

```typescript
// GET /api/members/[id]/injuries
interface InjuryListResponse {
  injuries: Injury[];
  total: number;
}

// POST /api/members/[id]/injuries
interface CreateInjuryRequest {
  injuryType: string;
  bodyPart: string;
  date: string;
  severity: "MILD" | "MODERATE" | "SEVERE";
  description?: string;
  recoveryStatus: "RECOVERED" | "RECOVERING" | "CHRONIC";
}

// POST /api/members/[id]/injuries/[id]/restrictions
interface CreateInjuryRestrictionRequest {
  restrictedCategory:
    | "STRENGTH"
    | "CARDIO"
    | "ENDURANCE"
    | "BODY"
    | "STABILITY";
}
```

#### 분석 관련

```typescript
// GET /api/analytics/averages
interface AverageAnalyticsResponse {
  strengthScore: number;
  cardioScore: number;
  enduranceScore: number;
  bodyScore: number;
  stabilityScore: number;
  totalScore: number;
  totalMembers: number;
}

// GET /api/analytics/comparison/[id]
interface MemberComparisonResponse {
  member: AbilitySnapshot;
  average: {
    strengthScore: number;
    cardioScore: number;
    enduranceScore: number;
    bodyScore: number;
    stabilityScore: number;
    totalScore: number;
  };
  percentile: {
    strengthScore: number;
    cardioScore: number;
    enduranceScore: number;
    bodyScore: number;
    stabilityScore: number;
    totalScore: number;
  };
}
```

### 에러 코드 정의

```typescript
// lib/utils/errorCodes.ts
export const ErrorCodes = {
  // 인증 관련
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",

  // 회원 관련
  MEMBER_NOT_FOUND: "MEMBER_NOT_FOUND",
  MEMBER_ALREADY_EXISTS: "MEMBER_ALREADY_EXISTS",

  // 평가 관련
  ASSESSMENT_NOT_FOUND: "ASSESSMENT_NOT_FOUND",
  ASSESSMENT_DELETE_FORBIDDEN: "ASSESSMENT_DELETE_FORBIDDEN",
  INITIAL_ASSESSMENT_ALREADY_EXISTS: "INITIAL_ASSESSMENT_ALREADY_EXISTS",

  // 부상 관련
  INJURY_NOT_FOUND: "INJURY_NOT_FOUND",

  // 검증 관련
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_INPUT: "INVALID_INPUT",

  // 서버 관련
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
```

### 백엔드 구현 가이드

#### 응답 변환 유틸리티

```typescript
// lib/utils/apiResponse.ts
import { Response } from "next/server";

export function successResponse<T>(data: T, message?: string): Response {
  return Response.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status: 200 }
  );
}

export function createdResponse<T>(data: T, message?: string): Response {
  return Response.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status: 201 }
  );
}

export function errorResponse(
  code: string,
  message: string,
  statusCode: number = 400,
  details?: unknown
): Response {
  return Response.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
    },
    { status: statusCode }
  );
}
```

#### 데이터베이스 → API 응답 변환

```typescript
// backend/src/common/utils/transformers.ts
import { Assessment } from "@/entities/Assessment";
import { AssessmentItem } from "@/entities/AssessmentItem";
import { AbilitySnapshot } from "@/entities/AbilitySnapshot";

// TypeORM 엔티티를 API 응답 형식으로 변환
export function transformAssessment(
  assessment: Assessment & {
    items: AssessmentItem[];
    snapshot?: AbilitySnapshot | null;
  }
): AssessmentResponse {
  return {
    id: assessment.id,
    memberId: assessment.memberId, // TypeORM은 camelCase 사용
    assessmentType: assessment.assessmentType,
    isInitial: assessment.isInitial,
    assessedAt: assessment.assessedAt.toISOString(),
    trainerComment: assessment.trainerComment,
    bodyWeight: assessment.bodyWeight,
    condition: assessment.condition,
    items: assessment.items.map(transformAssessmentItem),
    snapshot: assessment.snapshot
      ? transformSnapshot(assessment.snapshot)
      : undefined,
    createdAt: assessment.createdAt.toISOString(),
    updatedAt: assessment.updatedAt.toISOString(),
  };
}

export function transformSnapshot(
  snapshot: AbilitySnapshot
): LatestAbilitySnapshotResponse {
  return {
    id: snapshot.id,
    assessmentId: snapshot.assessmentId,
    memberId: snapshot.memberId,
    assessedAt: snapshot.assessedAt.toISOString(),
    strengthScore: snapshot.strengthScore,
    cardioScore: snapshot.cardioScore,
    enduranceScore: snapshot.enduranceScore,
    bodyScore: snapshot.bodyScore,
    stabilityScore: snapshot.stabilityScore,
    totalScore: snapshot.totalScore,
    createdAt: snapshot.createdAt.toISOString(),
  };
}
```

#### API Route 예시

```typescript
// backend/src/modules/members/members.controller.ts
import { NextRequest } from "next/server";
import { dataSource } from "@/lib/data-source";
import { Member } from "@/entities/Member";
import { successResponse, errorResponse } from "@/lib/utils/apiResponse";
import { transformMember } from "@/lib/utils/transformers";
import { ErrorCodes } from "@/lib/utils/errorCodes";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const memberRepository = dataSource.getRepository(Member);
    const member = await memberRepository.findOne({
      where: { id: params.id },
    });

    if (!member) {
      return errorResponse(
        ErrorCodes.MEMBER_NOT_FOUND,
        "회원을 찾을 수 없습니다.",
        404,
        { memberId: params.id }
      );
    }

    return successResponse(transformMember(member), "회원 정보 조회 성공");
  } catch (error) {
    return errorResponse(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      "서버 오류가 발생했습니다.",
      500
    );
  }
}
```

### 프론트엔드 구현 가이드

#### API 클라이언트 타입 정의

```typescript
// lib/api/types.ts
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
```

#### API 클라이언트 개선

```typescript
// lib/api/client.ts
import { ApiResponse, ApiErrorResponse } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export class ApiClient {
  async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        credentials: "include",
      });

      const data: ApiResponse<T> = await response.json();

      if (!data.success) {
        throw new ApiError(
          data.error.code,
          data.error.message,
          data.error.details
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("NETWORK_ERROR", "네트워크 오류가 발생했습니다.");
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await this.request<T>(endpoint, { method: "GET" });
    return response.data;
  }

  async post<T>(endpoint: string, body: unknown): Promise<T> {
    const response = await this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return response.data;
  }

  async put<T>(endpoint: string, body: unknown): Promise<T> {
    const response = await this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    return response.data;
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await this.request<T>(endpoint, { method: "DELETE" });
    return response.data;
  }
}

export const apiClient = new ApiClient();
```

#### 사용 예시

```typescript
// frontend/lib/api/members.ts
import { apiClient } from "./client";
import { MemberResponse, CreateMemberRequest } from "./types";

export const memberApi = {
  async getById(id: string): Promise<MemberResponse> {
    return apiClient.get<MemberResponse>(`/api/members/${id}`);
  },

  async create(data: CreateMemberRequest): Promise<MemberResponse> {
    return apiClient.post<MemberResponse>("/api/members", data);
  },

  async update(
    id: string,
    data: Partial<CreateMemberRequest>
  ): Promise<MemberResponse> {
    return apiClient.put<MemberResponse>(`/api/members/${id}`, data);
  },
};
```

### 타입 검증

#### 백엔드: 요청 데이터 검증

```typescript
// backend/src/common/utils/validation.ts
import { z } from "zod";

export const createMemberSchema = z.object({
  name: z.string().min(1, "이름은 필수입니다."),
  email: z.string().email("올바른 이메일 형식이 아닙니다."),
  phone: z
    .string()
    .regex(/^010-\d{4}-\d{4}$/, "올바른 전화번호 형식이 아닙니다."),
  joinDate: z.string().datetime(),
});

export type CreateMemberRequest = z.infer<typeof createMemberSchema>;
```

#### 프론트엔드: 응답 데이터 검증 (선택)

```typescript
// frontend/lib/utils/validation.ts
import { z } from "zod";

export const memberResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  joinDate: z.string(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type MemberResponse = z.infer<typeof memberResponseSchema>;
```

### 체크리스트

#### 백엔드

- [ ] 모든 API 응답이 `ApiResponse<T>` 구조를 따르는가?
- [ ] 모든 필드명이 camelCase인가? (DB는 snake_case, 응답은 camelCase)
- [ ] 에러 응답이 표준 형식을 따르는가?
- [ ] HTTP 상태 코드가 적절한가?
- [ ] 타입 정의가 공유 가능한 위치에 있는가?

#### 프론트엔드

- [ ] API 클라이언트가 `ApiResponse<T>` 타입을 사용하는가?
- [ ] 모든 API 호출이 타입 안전한가?
- [ ] 에러 처리가 표준 형식을 따르는가?
- [ ] 타입 정의가 백엔드와 일치하는가?

---

## 📡 API 명세서 개요

### 인증 API

| 엔드포인트          | 메서드 | 설명      | 인증 필요 |
| ------------------- | ------ | --------- | --------- |
| `/api/auth/login`   | POST   | 로그인    | ❌        |
| `/api/auth/logout`  | POST   | 로그아웃  | ✅        |
| `/api/auth/session` | GET    | 세션 확인 | ✅        |

### 회원 관리 API

**기본 회원 관리**:

| 엔드포인트          | 메서드 | 설명           | 인증 필요 |
| ------------------- | ------ | -------------- | --------- |
| `/api/members`      | GET    | 회원 목록 조회 | ✅        |
| `/api/members`      | POST   | 회원 등록      | ✅        |
| `/api/members/[id]` | GET    | 회원 상세 조회 | ✅        |
| `/api/members/[id]` | PUT    | 회원 수정      | ✅        |
| `/api/members/[id]` | DELETE | 회원 삭제      | ✅        |

**회원권 관리**:

| 엔드포인트                     | 메서드 | 설명        | 인증 필요 |
| ------------------------------ | ------ | ----------- | --------- |
| `/api/members/[id]/membership` | GET    | 회원권 조회 | ✅        |
| `/api/members/[id]/membership` | POST   | 회원권 등록 | ✅        |
| `/api/members/[id]/membership` | PUT    | 회원권 수정 | ✅        |
| `/api/members/[id]/membership` | DELETE | 회원권 삭제 | ✅        |

**PT 횟수 관리**:

| 엔드포인트                   | 메서드 | 설명              | 인증 필요 |
| ---------------------------- | ------ | ----------------- | --------- |
| `/api/members/[id]/pt-count` | GET    | PT 횟수 조회      | ✅        |
| `/api/members/[id]/pt-count` | POST   | PT 횟수 추가/차감 | ✅        |
| `/api/members/[id]/pt-count` | PUT    | PT 횟수 수정      | ✅        |

### 평가 시스템 API ⭐ (핵심)

| 엔드포인트                                     | 메서드 | 설명                    | 인증 필요 |
| ---------------------------------------------- | ------ | ----------------------- | --------- |
| `/api/members/[id]/assessments`                | GET    | 평가 목록 조회          | ✅        |
| `/api/members/[id]/assessments`                | POST   | 평가 생성 (점수 계산)   | ✅        |
| `/api/members/[id]/assessments/[assessmentId]` | GET    | 평가 상세 조회          | ✅        |
| `/api/members/[id]/assessments/[assessmentId]` | PUT    | 평가 수정 (점수 재계산) | ✅        |
| `/api/members/[id]/assessments/[assessmentId]` | DELETE | 평가 삭제 (금지)        | ✅        |

**중요**: 평가 생성/수정 시 서버에서 자동으로 점수를 계산하고 스냅샷을 저장한다.

### 능력치 스냅샷 API ⭐ (핵심)

| 엔드포인트                                   | 메서드 | 설명                            | 인증 필요 |
| -------------------------------------------- | ------ | ------------------------------- | --------- |
| `/api/members/[id]/abilities/latest`         | GET    | 최신 능력치 스냅샷              | ✅        |
| `/api/members/[id]/abilities/snapshots`      | GET    | 스냅샷 목록 (시간순)            | ✅        |
| `/api/members/[id]/abilities/compare?prev=1` | GET    | 이전 평가와 비교                | ✅        |
| `/api/members/[id]/abilities/hexagon`        | GET    | 능력치 헥사곤 데이터 (6개 지표) | ✅        |
| `/api/members/[id]/abilities/history`        | GET    | 체력 테스트 히스토리            | ✅        |

**응답 예시** (`/api/members/[id]/abilities/compare?prev=1`):

```typescript
{
  current: {
    assessedAt: "2024-03-15",
    totalScore: 68,
    strengthScore: 75,
    cardioScore: 60,
    // ...
  },
  previous: {
    assessedAt: "2024-03-08",
    totalScore: 64,
    strengthScore: 72,
    cardioScore: 58,
    // ...
  },
  delta: {
    totalScore: 4,      // +4점 상승
    strengthScore: 3,   // +3점 상승
    cardioScore: 2,     // +2점 상승
    // ...
  },
  percentageChange: {
    totalScore: 6.25,   // 6.25% 상승
    // ...
  }
}
```

### 부상 관리 API

| 엔드포인트                                     | 메서드 | 설명                     | 인증 필요 |
| ---------------------------------------------- | ------ | ------------------------ | --------- |
| `/api/members/[id]/injuries`                   | GET    | 부상이력 조회            | ✅        |
| `/api/members/[id]/injuries`                   | POST   | 부상이력 등록            | ✅        |
| `/api/members/[id]/injuries/[id]`              | PUT    | 부상이력 수정            | ✅        |
| `/api/members/[id]/injuries/[id]/restrictions` | POST   | 부상 영역 평가 제한 설정 | ✅        |

### 분석 API

| 엔드포인트                       | 메서드 | 설명                             | 인증 필요 |
| -------------------------------- | ------ | -------------------------------- | --------- |
| `/api/members/[id]/analytics`    | GET    | 회원 능력치 데이터 (스냅샷 기반) | ✅        |
| `/api/analytics/averages`        | GET    | 전체 평균 데이터                 | ✅        |
| `/api/analytics/comparison/[id]` | GET    | 개별 vs 평균 비교                | ✅        |

### 인사이트 API (대시보드용)

| 엔드포인트                     | 메서드 | 설명                    | 인증 필요 |
| ------------------------------ | ------ | ----------------------- | --------- |
| `/api/insights/hexagon`        | GET    | 운영 능력치 헥사곤      | ✅        |
| `/api/insights/weekly-summary` | GET    | 이번 주 vs 지난 주 비교 | ✅        |
| `/api/insights/risk-members`   | GET    | 위험 신호 회원 리스트   | ✅        |

**상세한 API 명세서**: 백엔드 레포의 `docs/API.md` 참고

---

## 🔄 구현 단계 (Phase별)

### Phase 0: GitHub 협업 환경 설정 ⭐ (최우선)

#### 공통 작업

- [ ] GitHub에 단일 레포지토리 생성: `gym-membership`
- [ ] `main`, `develop` 브랜치 생성
- [ ] 루트 `.gitignore` 파일 작성
- [ ] 루트 `README.md` 작성
- [ ] `docs/` 폴더 생성 및 공통 문서 작성

#### 프로젝트 구조 설정

- [ ] `frontend/` 폴더에 Next.js 프로젝트 초기화
- [ ] `backend/` 폴더에 NestJS 프로젝트 초기화
- [ ] 각 폴더의 `.env.example` 파일 생성
- [ ] `docs/API.md` - API 명세서 작성
- [ ] `docs/SETUP.md` - 개발 환경 설정 가이드
- [ ] `docs/DATABASE.md` - 데이터베이스 스키마 설명

---

### Phase 1: 프로젝트 초기 설정

#### 백엔드 (`backend/`)

- [ ] NestJS 프로젝트 생성
- [ ] TypeScript 설정
- [ ] TypeORM 설치 및 초기화
- [ ] PostgreSQL 연결 설정 (TypeORM DataSource)
- [ ] 엔티티 파일 생성 (`src/entities/` 폴더)
- [ ] JWT 인증 모듈 설정
- [ ] 환경 변수 설정

#### 프론트엔드 (`frontend/`)

- [ ] Next.js 프로젝트 생성 (App Router)
- [ ] TypeScript 설정
- [ ] Tailwind CSS 설정
- [ ] Recharts 설치
- [ ] React Hook Form 설치
- [ ] API 클라이언트 설정 (`frontend/lib/api/client.ts`)
- [ ] 환경 변수 설정

---

### Phase 2: 데이터베이스 및 인증

#### 백엔드 (`backend/`)

- [ ] TypeORM 엔티티 작성 (모든 엔티티)
- [ ] DataSource 설정 (`src/common/data-source.ts`)
- [ ] 데이터베이스 마이그레이션 생성 및 실행
- [ ] JWT 인증 완전 설정
- [ ] 인증 API 테스트

#### 프론트엔드 (`frontend/`)

- [ ] 기본 레이아웃 구성
- [ ] 로그인 페이지 UI 구현
- [ ] 인증 훅 구현 (`lib/hooks/useAuth.ts`)
- [ ] 라우트 보호 미들웨어 구현

---

### Phase 3: 기본 회원 관리

#### 백엔드 (`backend/`)

- [ ] 회원 CRUD API 구현
- [ ] 데이터 검증 로직 (`src/common/utils/validation.ts`)
- [ ] 에러 처리 유틸 (`src/common/utils/errors.ts`)
- [ ] API 테스트

#### 프론트엔드 (`frontend/`)

- [ ] 회원 목록 페이지 구현
- [ ] 회원 상세 페이지 구현
- [ ] 회원 등록/수정 폼 구현
- [ ] 회원 API 함수 구현 (`lib/api/members.ts`)
- [ ] 회원 데이터 훅 구현 (`lib/hooks/useMembers.ts`)

---

### Phase 4: 평가 시스템 구현 ⭐ (핵심)

#### 백엔드 (`backend/`)

- [ ] 평가 테이블 스키마 작성 (Assessment, AssessmentItem, AbilitySnapshot)
- [ ] 평가 CRUD API 구현
- [ ] **능력치 점수 계산 로직 구현** (`src/common/utils/scoreCalculator.ts`)
- [ ] 측정값 → 표준화 점수 변환
- [ ] 영역별 점수 계산
- [ ] 부상 영역 평가 제외
- [ ] 종합 점수 계산
- [ ] 스냅샷 저장 로직 구현
- [ ] 초기 평가/정기 평가 구분 로직
- [ ] 평가 삭제 금지 로직 (수정만 가능)
- [ ] API 명세서 업데이트

#### 프론트엔드 (`frontend/`)

- [ ] 평가 입력 폼 컴포넌트 구현
- [ ] 초기 평가/정기 평가 선택 UI
- [ ] 평가 목록 페이지 구현
- [ ] 평가 상세 페이지 구현
- [ ] 트레이너 코멘트 입력 UI
- [ ] 평가 당시 체중/컨디션 기록 UI
- [ ] 클라이언트 사이드 검증
- [ ] 폼 에러 처리

### Phase 5: 부상-능력치 연동 시스템 ⭐ (핵심)

#### 백엔드 (`backend/`)

- [ ] 부상이력 API 구현
- [ ] 부상 영역 평가 제한 설정 API 구현
- [ ] 부상 부위별 평가 제한 영역 정의 로직
- [ ] 점수 계산 시 부상 영역 평가 제외 로직
- [ ] 부상 복구 상태에 따른 평가 제한 해제

#### 프론트엔드 (`frontend/`)

- [ ] 부상이력 입력 폼 구현
- [ ] 부상 영역 평가 제한 설정 UI
- [ ] 평가 불가 영역 표시 컴포넌트 구현 (`InjuryRestrictionBadge.tsx`)
- [ ] 평가 제외 영역 안내 UI

---

### Phase 6: 능력치 시각화

#### 백엔드 (`backend/`)

- [ ] 회원 능력치 데이터 조회 API 구현
- [ ] 시간별 데이터 집계 로직
- [ ] 데이터 포맷팅 (차트용)

#### 프론트엔드 (`frontend/`)

- [ ] Recharts 기본 설정
- [ ] 신체스펙 차트 컴포넌트 구현
- [ ] 근력 능력치 차트 컴포넌트 구현
- [ ] 심폐지구 능력치 차트 컴포넌트 구현
- [ ] 능력치 시각화 페이지 구현
- [ ] 차트 반응형 디자인

---

### Phase 7: 평균화 기능

#### 백엔드 (`backend/`)

- [ ] 평균 계산 로직 구현 (`src/common/utils/analytics.ts`)
- [ ] 전체 평균 데이터 API 구현
- [ ] 개별 vs 평균 비교 API 구현
- [ ] 백분위 계산 로직
- [ ] 카테고리별 필터링 로직

#### 프론트엔드 (`frontend/`)

- [ ] 평균 비교 차트 컴포넌트 구현
- [ ] 전체 평균 대시보드 구현
- [ ] 백분위 표시 UI
- [ ] 카테고리 필터 UI

---

### Phase 8: 통합 및 최적화

#### 공통 작업

- [ ] 프론트엔드-백엔드 통합 테스트
- [ ] 에러 처리 검증
- [ ] 성능 최적화

#### 프론트엔드 (`frontend/`)

- [ ] 반응형 디자인 완성
- [ ] 로딩 상태 개선
- [ ] 에러 바운더리 구현
- [ ] 접근성 개선

#### 백엔드 (`backend/`)

- [ ] API 응답 최적화
- [ ] 데이터베이스 쿼리 최적화
- [ ] 에러 응답 표준화

---

## 🎯 개발 원칙: 가독성과 유지보수 최우선

> **핵심 원칙**: 코드는 한 번 작성되지만 수백 번 읽힌다. 읽기 쉬운 코드가 최고의 코드다.

### 1. 가독성 원칙 (Readability First)

#### 1.1 명확한 네이밍

**✅ 좋은 예시**:

```typescript
// 명확하고 의미 있는 이름
const calculateAverageBodyWeight = (members: Member[]) => { ... }
const memberAnalyticsData = await fetchMemberAnalytics(memberId);
const isUserAuthenticated = session?.user !== null;
```

**❌ 나쁜 예시**:

```typescript
// 모호하고 의미 없는 이름
const calc = (arr) => { ... }
const data = await fetch(id);
const flag = session?.user;
```

**네이밍 규칙** (카멜케이스 통일):

- **변수/함수명**: camelCase (예: `memberId`, `calculateScore`, `getMemberList`)
- **타입/인터페이스**: PascalCase (예: `MemberData`, `ApiResponse`, `AbilitySnapshot`)
- **상수**: UPPER_SNAKE_CASE (예: `API_BASE_URL`, `MAX_SCORE`)
- **불린 값**: `is`, `has`, `should` 접두사 사용 (예: `isInitial`, `hasInjury`)
- **배열/리스트**: 복수형 사용 (예: `members`, `assessments`, `snapshots`)
- **데이터베이스**: snake_case (TypeORM 엔티티에서 `@Column({ name: 'snake_case' })`로 매핑, API 응답은 camelCase로 변환)

**중요**:

- DB를 제외한 모든 코드(프론트엔드, 백엔드 API, TypeScript 타입)는 **camelCase** 사용
- 데이터베이스 컬럼명은 `snake_case`이지만, API 응답 시 `camelCase`로 변환

#### 1.2 함수/컴포넌트 크기 제한

**원칙**: 하나의 함수/컴포넌트는 **하나의 책임**만 가진다.

| 항목             | 권장 크기 | 최대 크기 |
| ---------------- | --------- | --------- |
| 함수             | 20-30줄   | 50줄      |
| React 컴포넌트   | 50-100줄  | 150줄     |
| API Route 핸들러 | 30-50줄   | 100줄     |

**큰 함수 분리 예시**:

```typescript
// ❌ 나쁜 예시: 하나의 함수에 모든 로직
async function processMemberData(memberId: string) {
  // 100줄 이상의 복잡한 로직...
}

// ✅ 좋은 예시: 작은 함수로 분리
async function getMemberData(memberId: string) {
  const memberRepository = dataSource.getRepository(Member);
  return await memberRepository.findOne({ where: { id: memberId } });
}

async function calculateMemberStats(member: Member) {
  // 통계 계산 로직
}

async function formatMemberData(member: Member, stats: Stats) {
  // 데이터 포맷팅 로직
}

async function processMemberData(memberId: string) {
  const member = await getMemberData(memberId);
  const stats = await calculateMemberStats(member);
  return formatMemberData(member, stats);
}
```

#### 1.3 주석 작성 원칙

**원칙**: 코드로 설명할 수 있으면 주석을 쓰지 않는다. 주석은 **"왜"**를 설명한다.

**✅ 좋은 주석**:

```typescript
// 평균 계산 시 null 값을 제외하여 정확도 향상
// (null 값이 포함되면 평균이 왜곡됨)
const validWeights = weights.filter((w) => w !== null);
const average = validWeights.reduce((a, b) => a + b, 0) / validWeights.length;

// CORS 설정: 프론트엔드 레포와 통신을 위해 필요
// (레포 분리 구조이므로 명시적 CORS 설정 필수)
```

**❌ 나쁜 주석**:

```typescript
// 변수 선언
const member = await getMember();

// 회원 데이터 가져오기
const memberData = await fetchMemberData();
```

#### 1.4 코드 포맷팅 일관성

**규칙**:

- 들여쓰기: 2칸 또는 4칸 (프로젝트 전체 통일)
- 세미콜론: 사용 또는 미사용 (프로젝트 전체 통일)
- 따옴표: 작은따옴표 또는 큰따옴표 (프로젝트 전체 통일)
- 줄바꿈: 80-100자 기준 (가독성)

**도구 사용**:

- **Prettier**: 자동 포맷팅
- **ESLint**: 코드 스타일 검사

---

### 2. 유지보수성 원칙 (Maintainability First)

#### 2.1 모듈화 및 재사용성

**원칙**: DRY (Don't Repeat Yourself) - 중복 코드는 절대 금지

**구조화 예시**:

```typescript
// ❌ 나쁜 예시: 중복 코드
// components/members/MemberList.tsx
const fetchMembers = async () => {
  const response = await fetch("/api/members");
  return response.json();
};

// components/members/MemberDetail.tsx
const fetchMember = async (id: string) => {
  const response = await fetch(`/api/members/${id}`);
  return response.json();
};

// ✅ 좋은 예시: 재사용 가능한 API 함수
// lib/api/members.ts
export const memberApi = {
  async getList(): Promise<Member[]> {
    const response = await fetch("/api/members");
    return response.json();
  },

  async getById(id: string): Promise<Member> {
    const response = await fetch(`/api/members/${id}`);
    return response.json();
  },
};
```

#### 2.2 파일 구조 일관성

**디렉토리 구조 규칙**:

```
components/
├── [기능명]/              # 기능별 그룹화
│   ├── [Component].tsx   # 컴포넌트 파일
│   ├── [Component].types.ts  # 타입 정의 (선택)
│   └── index.ts          # export 모음
```

**파일명 규칙**:

- 컴포넌트: PascalCase (`MemberList.tsx`)
- 유틸리티: camelCase (`formatDate.ts`)
- 상수: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)

#### 2.3 타입 안정성

**원칙**: 모든 데이터에 타입 정의. `any` 사용 금지.

```typescript
// ✅ 좋은 예시: 명확한 타입 정의
interface Member {
  id: string;
  name: string;
  email: string;
  joinDate: Date;
}

interface ApiResponse<T> {
  data: T;
  error?: string;
}

// ❌ 나쁜 예시: any 사용
function processData(data: any) {
  // ...
}
```

#### 2.4 에러 처리 표준화

**백엔드 에러 응답 형식**:

```typescript
// lib/utils/errors.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
  }
}

// 일관된 에러 응답
export function createErrorResponse(error: ApiError) {
  return Response.json(
    {
      error: {
        code: error.code || "UNKNOWN_ERROR",
        message: error.message,
      },
    },
    { status: error.statusCode }
  );
}
```

**프론트엔드 에러 처리**:

```typescript
// frontend/lib/api/client.ts
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(endpoint, options);

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error.error.message, response.status);
    }

    return await response.json();
  } catch (error) {
    // 일관된 에러 처리
    handleApiError(error);
    throw error;
  }
}
```

---

### 3. 코드 리뷰 체크리스트 (가독성/유지보수성 중심)

#### 가독성 체크

- [ ] 변수/함수명이 명확하고 의미 있는가?
- [ ] 함수/컴포넌트가 적절한 크기인가? (50줄 이내 권장)
- [ ] 주석이 "왜"를 설명하는가? (불필요한 주석은 없는가?)
- [ ] 코드 포맷팅이 일관적인가?
- [ ] 매직 넘버/문자열이 상수로 추출되었는가?

#### 유지보수성 체크

- [ ] 중복 코드가 없는가?
- [ ] 함수/컴포넌트가 재사용 가능한가?
- [ ] 타입이 명확하게 정의되어 있는가? (`any` 사용 금지)
- [ ] 에러 처리가 일관된가?
- [ ] 파일 구조가 일관적인가?
- [ ] 복잡한 로직이 작은 함수로 분리되었는가?

#### 코드 예시 비교

**❌ 나쁜 코드 (가독성 낮음, 유지보수 어려움)**:

```typescript
// 함수가 너무 크고, 변수명이 모호함
async function process(m: string) {
  const d = await fetch(`/api/members/${m}`);
  const j = await d.json();
  const w = j.bodySpecs.map((x: any) => x.weight);
  const a = w.reduce((a: number, b: number) => a + b, 0) / w.length;
  const c = j.bodySpecs.map((x: any) => ({
    date: x.date,
    weight: x.weight,
    diff: x.weight - a,
  }));
  return c;
}
```

**✅ 좋은 코드 (가독성 높음, 유지보수 용이)**:

```typescript
// 작은 함수로 분리, 명확한 네이밍, 타입 정의
interface BodySpec {
  date: string;
  weight: number;
  bodyFat: number;
}

interface WeightComparison {
  date: string;
  weight: number;
  differenceFromAverage: number;
}

async function fetchMemberBodySpecs(memberId: string): Promise<BodySpec[]> {
  const response = await fetch(`/api/members/${memberId}/body-specs`);
  return response.json();
}

function calculateAverageWeight(bodySpecs: BodySpec[]): number {
  const weights = bodySpecs.map((spec) => spec.weight);
  const sum = weights.reduce((total, weight) => total + weight, 0);
  return sum / weights.length;
}

function compareWeightsWithAverage(
  bodySpecs: BodySpec[],
  averageWeight: number
): WeightComparison[] {
  return bodySpecs.map((spec) => ({
    date: spec.date,
    weight: spec.weight,
    differenceFromAverage: spec.weight - averageWeight,
  }));
}

async function processMemberWeightComparison(
  memberId: string
): Promise<WeightComparison[]> {
  const bodySpecs = await fetchMemberBodySpecs(memberId);
  const averageWeight = calculateAverageWeight(bodySpecs);
  return compareWeightsWithAverage(bodySpecs, averageWeight);
}
```

---

### 4. 개발 시 항상 고려할 사항

#### 코드 작성 전 질문

1. **이 코드를 6개월 후에 봐도 이해할 수 있는가?**
2. **다른 사람이 이 코드를 봐도 이해할 수 있는가?**
3. **이 함수/컴포넌트가 너무 많은 일을 하고 있지 않은가?**
4. **중복 코드가 있는가?**
5. **타입이 명확한가?**
6. **에러 처리가 되어 있는가?**

#### 코드 작성 후 체크

- [ ] 변수명이 명확한가?
- [ ] 함수가 하나의 일만 하는가?
- [ ] 주석이 필요한가? (코드로 설명할 수 있으면 주석 제거)
- [ ] 타입이 정의되어 있는가?
- [ ] 에러 처리가 되어 있는가?
- [ ] 테스트할 수 있는 구조인가?

---

### 5. 가독성/유지보수성 우선순위

| 우선순위  | 항목               | 이유                                       |
| --------- | ------------------ | ------------------------------------------ |
| **1순위** | 명확한 네이밍      | 코드를 읽는 시간이 작성 시간보다 훨씬 많음 |
| **2순위** | 작은 함수/컴포넌트 | 이해하기 쉽고 테스트하기 쉬움              |
| **3순위** | 타입 안정성        | 버그 예방 및 IDE 자동완성                  |
| **4순위** | 중복 제거          | 수정 시 한 곳만 수정하면 됨                |
| **5순위** | 일관된 구조        | 예측 가능한 코드 구조                      |

**성능 최적화는 가독성을 해치지 않는 선에서만 진행**

---

## 🔧 리팩토링 가이드라인

### 코드 구조 원칙

#### 1. 관심사 분리 (Separation of Concerns)

- **API 로직**: `backend/src/modules/`에만
- **UI 로직**: `frontend/app/`, `frontend/components/`에만
- **비즈니스 로직**: `backend/src/common/utils/`에만

#### 2. 재사용 가능한 컴포넌트

**프론트엔드**:

- 공통 UI 컴포넌트는 `components/ui/`에
- 비즈니스 로직이 있는 컴포넌트는 `components/`에 기능별로 분리
- 훅은 `lib/hooks/`에

**백엔드**:

- 공통 유틸리티는 `lib/utils/`에
- 타입 정의는 `types/`에

#### 3. 타입 안정성

- 모든 API 응답에 TypeScript 타입 정의
- 프론트엔드와 백엔드 간 타입 공유 (선택: 공통 타입 레포 또는 패키지)

#### 4. 에러 처리

**백엔드**:

- 일관된 에러 응답 형식
- HTTP 상태 코드 적절히 사용

**프론트엔드**:

- 에러 바운더리 구현
- 사용자 친화적인 에러 메시지

### 리팩토링 체크리스트 (가독성/유지보수 중심)

#### 가독성 체크 (최우선)

- [ ] 변수/함수명이 명확하고 의미 있는가?
- [ ] 함수/컴포넌트가 적절한 크기인가? (50줄 이내 권장)
- [ ] 주석이 "왜"를 설명하는가? (불필요한 주석은 없는가?)
- [ ] 코드 포맷팅이 일관적인가?
- [ ] 매직 넘버/문자열이 상수로 추출되었는가?
- [ ] 복잡한 조건문이 명확하게 표현되었는가?

#### 유지보수성 체크 (최우선)

- [ ] 중복 코드가 없는가?
- [ ] 함수/컴포넌트가 재사용 가능한가?
- [ ] 타입이 명확하게 정의되어 있는가? (`any` 사용 금지)
- [ ] 에러 처리가 일관된가?
- [ ] 파일 구조가 일관적인가?
- [ ] 복잡한 로직이 작은 함수로 분리되었는가?
- [ ] 의존성이 명확한가? (순환 참조 없음)

#### 성능 (가독성을 해치지 않는 선에서)

- [ ] 불필요한 리렌더링 방지 (React.memo, useMemo 등)
- [ ] 데이터베이스 쿼리 최적화 (인덱스, N+1 문제 해결)
- [ ] 이미지 최적화
- [ ] 번들 크기 최적화

**주의**: 성능 최적화는 가독성을 해치지 않는 선에서만 진행

---

## 📊 데이터 시각화

### 차트 라이브러리

**Recharts** 사용 (React 전용, TypeScript 지원, 레이더/라인/바 차트 지원)

### 프론트엔드 컴포넌트 구조

```
components/charts/
├── AbilityRadar.tsx        # 레이더 차트: 종합 능력치
├── AbilityTrend.tsx        # 라인 차트: 시간 변화 추이
├── AbilitySummaryCard.tsx # 카드 UI: 지난주 대비
├── ComparisonChart.tsx     # 컴포지트 차트: 개별 vs 평균
└── InjuryRestrictionBadge.tsx  # 평가 불가 영역 표시
```

**상세 가이드**: `docs/CHART_VISUALIZATION_EXAMPLES.md` 참고

### 시각화 데이터 책임 분리

**원칙**: 시각화에 필요한 데이터는 서버에서 정렬·가공된 상태로 제공한다. 프론트는 표시만 담당한다.

**이유**:

- 레이더 차트는 순서 + 누락에 매우 민감
- 차트 깨짐, 순서 버그 예방
- 프론트엔드 로직 단순화

**백엔드 책임**:

- 데이터 정렬 (시간순, 카테고리순)
- 데이터 가공 (집계, 계산)
- 차트에 바로 사용 가능한 형식 제공

**프론트엔드 책임**:

- 백엔드에서 제공한 데이터를 차트 컴포넌트에 전달
- UI 표시 및 스타일링
- 데이터 가공 금지

**예시**: 레이더 차트 데이터

```typescript
// 백엔드 API 응답 (정렬·가공 완료)
{
  categories: [
    { category: "근력", score: 75 }, // 이미 정렬됨
    { category: "심폐", score: 60 },
    { category: "지구력", score: 70 },
    { category: "신체", score: 65 },
    { category: "안정성", score: 80 },
  ];
}

// 프론트엔드 (가공 없이 바로 사용)
<RadarChart data={data.categories} />;
```

**상세 가이드**: `docs/CHART_VISUALIZATION_EXAMPLES.md` 참고

---

## 🔀 GitHub 협업 전략

### 레포지토리 구조

```
GitHub Repository: gym-membership (단일 레포)
│
├── main                 (프로덕션)
├── develop              (개발 통합)
└── feature/*            (기능 브랜치)
    ├── feature/frontend/기능명  (프론트엔드 기능)
    └── feature/backend/기능명   (백엔드 기능)
```

### 브랜치 전략

```mermaid
graph LR
    A[main] --> B[develop]
    B --> C[feature/기능명]
    B --> D[fix/버그명]
    C --> B
    D --> B
```

### 커밋 메시지 컨벤션

**형식**: `[타입]([범위]): [제목]`

**타입**:

- `feat:` 새로운 기능
- `fix:` 버그 수정
- `docs:` 문서 수정
- `style:` 코드 포맷팅
- `refactor:` 코드 리팩토링
- `test:` 테스트
- `chore:` 빌드 설정

**예시**:

- `feat(api): 회원 등록 API 구현`
- `feat(member): 회원 목록 페이지 구현`
- `fix(auth): 로그인 에러 수정`

**참고**: 단일 레포지토리이므로 브랜치 네이밍에 `frontend/` 또는 `backend/` 접두사를 사용하여 작업 영역을 구분합니다.

---

## 📚 필수 문서 목록

### 공통 문서 (루트 `docs/`)

| 문서                              | 위치                                   | 설명                     |
| --------------------------------- | -------------------------------------- | ------------------------ |
| `API.md`                          | `docs/API.md`                          | API 명세서               |
| `SETUP.md`                        | `docs/SETUP.md`                        | 개발 환경 설정 가이드    |
| `DATABASE.md`                     | `docs/DATABASE.md`                     | 데이터베이스 스키마 설명 |
| `CHART_VISUALIZATION_EXAMPLES.md` | `docs/CHART_VISUALIZATION_EXAMPLES.md` | 차트 시각화 예시         |
| `BUSINESS_OVERVIEW.md`            | `docs/BUSINESS_OVERVIEW.md`            | 비즈니스 개요 (운영자용) |

---

## ✅ 개발 체크리스트

### Phase 0: 초기 설정

#### 공통

- [ ] GitHub 단일 레포지토리 생성
- [ ] 브랜치 전략 설정 (main, develop, feature/\*)
- [ ] 협업 문서 작성

#### 백엔드 (`backend/`)

- [ ] NestJS 프로젝트 초기화
- [ ] TypeORM 설정
- [ ] 환경 변수 설정

#### 프론트엔드 (`frontend/`)

- [ ] Next.js 프로젝트 초기화
- [ ] Tailwind CSS 설정
- [ ] Recharts 설치
- [ ] API 클라이언트 설정
- [ ] 환경 변수 설정

### Phase 1-7: 기능 개발

각 Phase별 체크리스트는 위의 "구현 단계" 섹션 참고

---

## 🎯 차별화 포인트 구현 상세

### 1. 평가(Assessment) 시스템 ⭐ (핵심 차별화)

**구현 내용**:

- **초기 평가 (Initial Assessment)**: 최초 등록 시 1회, 모든 비교의 기준점(Baseline)
- **정기 평가 (Periodic Assessment)**: 주간/월간 주기, 변화 추적용
- **평가 삭제 불가**: 수정만 가능 (데이터 무결성 보장)
- **평가 코멘트**: 트레이너 메모 기능
- **평가 당시 컨디션**: 체중, 컨디션 상태 기록

**기술**: 백엔드 평가 관리 로직 + 프론트엔드 평가 UI

**데이터 구조**: `Assessment`, `AssessmentItem` 테이블

### 2. 능력치 점수 계산 시스템 ⭐ (핵심 차별화)

**구현 내용**:

- **서버에서 점수 계산**: 프론트엔드 계산 금지 (기준 통일, 리팩토링 용이)
- **계산 프로세스**: Raw Data → 표준화 → 영역별 점수 → 부상 영역 평가 제외 → 종합 점수
- **확장 가능한 평가 항목**: 카테고리 기반 구조 (하드코딩 없음)
- **부상 영역 평가 제외**: 부상 부위별 평가 제한 영역 정의 (감점이 아닌 평가 불가)

**기술**: 백엔드 `backend/src/common/utils/scoreCalculator.ts`

**데이터 구조**: `AssessmentItem` (category, name, value, unit, score)

### 3. 능력치 스냅샷 시스템 ⭐ (핵심 차별화)

**구현 내용**:

- **평가 시점 점수 고정 저장**: 시간별 비교를 위한 핵심 데이터
- **5개 영역 점수**: 근력, 심폐, 지구력, 신체, 안정성
- **종합 점수**: 가중 평균으로 계산
- **현재 점수**: 항상 가장 최신 스냅샷

**기술**: 백엔드 스냅샷 저장 로직

**데이터 구조**: `AbilitySnapshot` 테이블

**API**:

- `GET /api/members/[id]/abilities/latest` - 최신 스냅샷
- `GET /api/members/[id]/abilities/snapshots` - 스냅샷 목록
- `GET /api/members/[id]/abilities/compare?prev=1` - 이전 평가와 비교

### 4. 부상-평가 제한 시스템 ⭐ (핵심 차별화)

**구현 내용**:

- **부상 부위별 평가 제한 영역 정의**: 무릎 부상 → 하체 근력 평가 제외 (운동 수행 불가)
- **점수 계산 시 평가 제외**: 부상이 있는 영역은 평가 불가이므로 해당 영역 점수를 null로 처리하고 종합 점수 계산 시 제외
- **평가 불가 영역 표시**: 프론트엔드에서 해당 영역이 평가 불가임을 표시
- **부상 복구 상태에 따른 평가 제한 해제**: 완치 시 해당 영역 평가 재개

**기술**: 백엔드 평가 제외 로직 + 프론트엔드 표시 UI

**데이터 구조**: `InjuryRestriction` 테이블 (restrictedCategory)

**중요**: 부상은 감점 요인이 아닌 운동 수행 불가 상태이므로, 해당 영역은 평가에서 제외됩니다.

### 5. 능력치 시각화

**구현 내용**:

- **레이더 차트**: 종합 능력치 상태를 한눈에 파악 (5개 영역)
- **라인 차트**: 시간에 따른 변화 추적 (스냅샷 기반)
- **카드 UI**: 지난주/이전 평가 대비 요약 (delta, percentage)
- **컴포지트 차트**: 개별 회원 vs 평균 비교
- **평가 불가 영역 표시**: 부상으로 인한 평가 제외 영역 표시

**기술**: Recharts 라이브러리

**컴포넌트**:

- `AbilityRadar.tsx` - 레이더 차트
- `AbilityTrend.tsx` - 라인 차트
- `AbilitySummaryCard.tsx` - 카드 UI
- `InjuryRestrictionBadge.tsx` - 평가 불가 영역 표시

**상세 예시**: `docs/CHART_VISUALIZATION_EXAMPLES.md` 참고

### 6. 평균화 및 비교 기능

**구현 내용**:

- **실시간 평균 계산**: 전체 회원 기준
- **개별 회원 vs 평균 비교**: 차트 및 백분위 표시
- **지난주/이전 평가 비교**: API로 제공 (`/api/members/[id]/abilities/compare?prev=1`)
- **카테고리별 필터링**: 연령대, 성별, 가입 기간
- **평균 대비 개선도 추적**: 시간별 변화율 계산

**기술**: 백엔드 집계 쿼리 + 프론트엔드 컴포지트 차트

### 7. 운영 관점의 추가 기능 ⭐ (실제 서비스 느낌)

**구현 내용**:

- **평가 코멘트**: 트레이너가 평가 당시 메모 작성
- **평가 당시 체중/컨디션 기록**: 평가 맥락 보존
- **평가 삭제 불가**: 수정만 가능 (데이터 무결성)
- **부상 복구 상태 추적**: 회복 중/완치 상태 관리

**기술**: 백엔드 데이터 검증 + 프론트엔드 UI

**데이터 구조**: `Assessment` 테이블 (trainerComment, bodyWeight, condition)

---

## 📝 개발 원칙 요약 (가독성/유지보수 최우선)

### 핵심 원칙

> **"코드는 한 번 작성되지만 수백 번 읽힌다. 읽기 쉬운 코드가 최고의 코드다."**

### 우선순위

1. **가독성** > 성능
2. **유지보수성** > 빠른 개발
3. **명확함** > 간결함

### 1. 코드 품질 (가독성 중심)

- **명확한 네이밍**: 변수/함수명은 의도를 명확히 표현
- **작은 함수**: 하나의 함수는 하나의 일만 (50줄 이내)
- **타입 안정성**: TypeScript 엄격 모드, `any` 사용 금지
- **주석 원칙**: "왜"를 설명, "무엇"은 코드로
- **코드 포맷팅**: Prettier, ESLint로 일관성 유지

### 2. 유지보수성

- **중복 제거**: DRY 원칙 준수
- **모듈화**: 재사용 가능한 컴포넌트/함수로 분리
- **일관된 구조**: 파일 구조 및 네이밍 컨벤션 준수
- **에러 처리**: 일관된 에러 처리 패턴
- **타입 정의**: 모든 데이터에 타입 정의

### 3. 문서화

- **API 변경**: 즉시 `docs/API.md` 업데이트
- **주요 기능**: README에 설명 추가
- **복잡한 로직**: "왜"를 설명하는 주석 추가
- **타입 정의**: 복잡한 타입은 주석으로 설명

### 4. 커뮤니케이션

- **API 변경사항**: 백엔드가 변경 시 프론트엔드에 즉시 알림
- **이슈 발생**: GitHub Issues에 등록
- **진행 상황**: 주기적으로 공유 (주 1회 이상)
- **코드 리뷰**: 가독성/유지보수성 중심으로 리뷰

### 5. 리팩토링 (지속적 개선)

- **주기적 리뷰**: 각 Phase 완료 후 코드 리뷰
- **중복 제거**: 발견 즉시 리팩토링
- **가독성 개선**: 읽기 어려운 코드는 즉시 개선
- **성능 최적화**: 가독성을 해치지 않는 선에서만 진행

### 6. 코드 작성 철학

**항상 생각할 것**:

1. 이 코드를 6개월 후에 봐도 이해할 수 있는가?
2. 다른 사람이 이 코드를 봐도 이해할 수 있는가?
3. 이 함수가 너무 많은 일을 하고 있지 않은가?
4. 중복 코드가 있는가?
5. 타입이 명확한가?

**상세한 가이드**: 위의 "🎯 개발 원칙: 가독성과 유지보수 최우선" 섹션 참고

---

## 🔍 코드 리뷰 체크리스트 (가독성/유지보수 중심)

### 공통 체크리스트

#### 가독성 (최우선)

- [ ] 변수/함수명이 명확하고 의미 있는가?
- [ ] 함수/컴포넌트가 적절한 크기인가? (50줄 이내)
- [ ] 주석이 "왜"를 설명하는가?
- [ ] 코드 포맷팅이 일관적인가?
- [ ] 매직 넘버/문자열이 상수로 추출되었는가?
- [ ] 복잡한 로직이 작은 함수로 분리되었는가?

#### 유지보수성 (최우선)

- [ ] 중복 코드가 없는가?
- [ ] 타입이 명확하게 정의되어 있는가? (`any` 사용 금지)
- [ ] 에러 처리가 일관된가?
- [ ] 파일 구조가 일관적인가?
- [ ] 재사용 가능한 구조인가?

### 백엔드 코드 리뷰

#### 기능적 체크

- [ ] API 응답 형식이 명세서와 일치하는가?
- [ ] 데이터 검증이 충분한가?
- [ ] 데이터베이스 쿼리가 최적화되었는가?
- [ ] 보안 이슈는 없는가? (SQL Injection, XSS 등)

#### 가독성/유지보수성 체크

- [ ] 함수가 하나의 책임만 가지는가?
- [ ] 에러 처리가 표준화되어 있는가?
- [ ] 비즈니스 로직이 명확하게 분리되어 있는가?
- [ ] 타입 정의가 명확한가?

### 프론트엔드 코드 리뷰

#### 기능적 체크

- [ ] 컴포넌트가 재사용 가능한가?
- [ ] 반응형 디자인이 적용되었는가?
- [ ] 접근성이 고려되었는가?
- [ ] 에러 처리가 적절한가?

#### 가독성/유지보수성 체크

- [ ] 컴포넌트가 적절한 크기인가?
- [ ] props 타입이 명확하게 정의되어 있는가?
- [ ] 훅이 적절히 사용되었는가?
- [ ] API 호출이 재사용 가능한 함수로 분리되었는가?
- [ ] 상태 관리가 명확한가?

---

## 🚀 배포 전 체크리스트

### 백엔드 (`backend/`)

- [ ] 환경 변수 설정 완료
- [ ] 데이터베이스 마이그레이션 완료
- [ ] API 명세서 최신화
- [ ] 에러 로깅 설정

### 프론트엔드 (`frontend/`)

- [ ] 환경 변수 설정 완료 (API URL 등)
- [ ] 빌드 에러 없음
- [ ] 반응형 디자인 테스트
- [ ] 브라우저 호환성 테스트
- [ ] 성능 최적화 확인

### 통합

- [ ] 프론트엔드-백엔드 통신 테스트 (같은 레포 내)
- [ ] 인증 플로우 테스트
- [ ] 주요 기능 E2E 테스트
- [ ] 에러 시나리오 테스트

---

## 📞 협업 및 소통

### 일상적인 소통

- **일일 스탠드업**: 진행 상황 공유 (선택)
- **주간 회의**: 주간 진행 상황 및 이슈 논의
- **이슈 관리**: GitHub Issues 활용

### 이슈 발생 시

1. GitHub Issues에 등록
2. 레이블 추가 (bug, feature, question 등)
3. 담당자 지정
4. 해결 후 이슈 닫기

---

## 🎓 학습 자료

### Git & GitHub

- 단일 레포지토리 협업: 브랜치 전략 (main, develop, feature/\*)
- 브랜치 네이밍: `feature/frontend/기능명`, `feature/backend/기능명`

### 기술 스택

- **Next.js**: https://nextjs.org/docs
- **TypeORM**: https://typeorm.io/
- **Recharts**: https://recharts.org/
- **NextAuth.js**: https://next-auth.js.org/

---

## 📝 참고사항

1. **의사소통**: 중요한 변경사항은 반드시 팀원과 상의
2. **문서화**: API 변경 시 즉시 문서 업데이트
3. **테스트**: 각 기능 개발 후 충분한 테스트
4. **코드 리뷰**: PR 생성 후 서로 코드 리뷰
5. **일정 관리**: 각 Phase별 마일스톤 설정 및 체크
6. **리팩토링**: 주기적으로 코드 품질 개선 (가독성/유지보수 중심)
7. **가독성 최우선**: 코드는 읽기 쉬워야 한다
8. **유지보수성 최우선**: 수정하기 쉬운 코드가 좋은 코드다

---

**이 플랜은 프로젝트 진행에 따라 지속적으로 업데이트됩니다.**

**마지막 업데이트**: 2024년

**관련 문서**:

- `docs/CHART_VISUALIZATION_EXAMPLES.md` - 차트 시각화 예시
- `docs/API.md` - API 명세서
- `docs/SETUP.md` - 개발 환경 설정 가이드

**프론트엔드 개발자 참고사항**:

- 이 플랜은 "md 파일 기반으로 프론트엔드 프로젝트 만들어줘" 요청에 바로 대응할 수 있도록 작성되었습니다.
- 모든 컴포넌트 구조, 라우트 구조, API 엔드포인트가 명시되어 있습니다.
- 프론트엔드는 계산 로직 없이 표현 계층만 담당합니다.
