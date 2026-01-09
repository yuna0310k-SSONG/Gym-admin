# 헬스장 회원관리 시스템 (프론트엔드)

헬스 데이터 플랫폼 - Next.js 기반 프론트엔드 프로젝트

> **프론트엔드 전용 프로젝트**: 이 프로젝트는 프론트엔드 개발만 담당합니다. 백엔드 API와 통신하여 UI/UX를 제공합니다.

## 📋 프로젝트 개요

회원의 신체 능력을 수치화·평균화·시각화하고 시간에 따른 변화를 추적하는 데이터 기반 헬스 관리 시스템의 프론트엔드입니다.

**중요**: 모든 비즈니스 로직과 계산은 백엔드에서 수행되며, 프론트엔드는 표현 계층(View Layer)만 담당합니다.

## 🛠 기술 스택

### 핵심 프레임워크

- **Next.js** 14.2.0 (App Router)
- **React** 18.2.0
- **TypeScript** 5.3.0

### 스타일링

- **Tailwind CSS** 3.4.1
- **PostCSS** 8.4.33

### 상태 관리 & 데이터 페칭

- **React Query** (@tanstack/react-query) 5.0.0
- **React Hook Form** 7.49.0
- **Zod** 3.22.0 (스키마 검증)

### 차트 & 시각화

- **Recharts** 2.10.0
- **Chart.js** 4.5.1
- **react-chartjs-2** 5.3.1

## 🚀 시작하기

### 필수 요구사항

- Node.js 18.x 이상
- npm 또는 yarn

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 린트 실행
npm run lint
```

개발 서버는 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

## 📁 프로젝트 구조

```
gym-front/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # 인증 관련 페이지
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/               # 대시보드 페이지
│   │   ├── members/            # 회원 관리
│   │   ├── insights/           # 인사이트
│   │   ├── trainers/           # 트레이너 관리
│   │   ├── approval-pending/   # 승인 대기
│   │   └── rejected/           # 거부된 회원
│   ├── layout.tsx              # 루트 레이아웃
│   └── page.tsx                # 홈 페이지
├── components/                  # React 컴포넌트
│   ├── auth/                   # 인증 컴포넌트
│   ├── dashboard/              # 대시보드 컴포넌트
│   ├── members/                # 회원 관련 컴포넌트
│   ├── health/                 # 건강/능력 관련 컴포넌트
│   ├── layout/                 # 레이아웃 컴포넌트
│   └── ui/                     # 공통 UI 컴포넌트
├── lib/                         # 유틸리티 및 설정
│   ├── api/                    # API 클라이언트
│   │   ├── client.ts           # API 클라이언트 설정
│   │   ├── auth.ts             # 인증 API
│   │   ├── members.ts          # 회원 API
│   │   ├── assessments.ts      # 평가 API
│   │   └── ...                 # 기타 API
│   ├── hooks/                  # 커스텀 훅
│   └── utils/                  # 유틸리티 함수
├── types/                       # TypeScript 타입 정의
│   ├── api/                    # API 타입
│   └── domain/                 # 도메인 타입
├── providers/                   # React Context Providers
│   ├── QueryProvider.tsx       # React Query Provider
│   └── ToastProvider.tsx       # Toast Provider
├── styles/                      # 스타일 파일
│   └── globals.css             # 전역 스타일
├── docs/                        # 문서
│   ├── IMPLEMENTED_APIS.md     # 구현된 API 문서
│   ├── BACKEND_API_REQUESTS.md # 백엔드 API 요청 문서
│   └── VERCEL_DEPLOYMENT.md    # 배포 문서
├── PROJECT_PLAN.md             # 프로젝트 계획서
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 🔧 환경 변수 설정

`.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```env
# 백엔드 API URL
NEXT_PUBLIC_API_URL=http://localhost:3001

# NextAuth (필요시)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

## 📚 관련 문서

- [프로젝트 계획서](./PROJECT_PLAN.md)
- [구현된 API 문서](./docs/IMPLEMENTED_APIS.md)
- [백엔드 API 요청 문서](./docs/BACKEND_API_REQUESTS.md)
- [Vercel 배포 문서](./docs/VERCEL_DEPLOYMENT.md)

## 🎯 주요 기능

- 회원 관리 (CRUD)
- 회원 능력 평가 및 시각화
- 대시보드 통계 및 인사이트
- 트레이너 관리
- 회원 승인/거부 관리
- 운동 기록 및 루틴 관리
- PT 세션 관리

## 📝 개발 가이드

### API 클라이언트 사용

모든 API 호출은 `lib/api/` 디렉토리의 클라이언트를 통해 수행됩니다.

```typescript
import { getMembers } from "@/lib/api/members";

const members = await getMembers();
```

### 컴포넌트 구조

- `components/ui/`: 재사용 가능한 UI 컴포넌트
- `components/dashboard/`: 대시보드 전용 컴포넌트
- `components/members/`: 회원 관련 컴포넌트

### 스타일링

Tailwind CSS를 사용하며, 커스텀 스타일은 `styles/globals.css`에 정의합니다.

자세한 내용은 [PROJECT_PLAN.md](./PROJECT_PLAN.md)를 참고하세요.
