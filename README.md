# 헬스장 회원관리 시스템 (프론트엔드)

헬스 데이터 플랫폼 - Next.js 기반 프론트엔드 프로젝트

> **프론트엔드 전용 프로젝트**: 이 프로젝트는 프론트엔드 개발만 담당합니다. 백엔드 API와 통신하여 UI/UX를 제공합니다.

## 📋 프로젝트 개요

회원의 신체 능력을 수치화·평균화·시각화하고 시간에 따른 변화를 추적하는 데이터 기반 헬스 관리 시스템의 프론트엔드입니다.

**중요**: 모든 비즈니스 로직과 계산은 백엔드에서 수행되며, 프론트엔드는 표현 계층(View Layer)만 담당합니다.

## 🛠 기술 스택

- **Next.js** 14.x (App Router)
- **TypeScript** 5.x
- **Tailwind CSS** 3.x
- **Recharts** 2.x (차트 시각화)
- **React Query** 5.x (서버 상태 관리)
- **React Hook Form** 7.x (폼 관리)
- **Zod** 3.x (스키마 검증)

## 🚀 시작하기

### 필수 요구사항

- Node.js 18.x 이상
- npm 또는 yarn

### 설치 및 실행

```bash
# 의존성 설치 (이미 완료됨)
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

개발 서버는 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

## 📁 프로젝트 구조

```
gym-front/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 루트 레이아웃
│   ├── page.tsx          # 홈 페이지
│   └── globals.css        # 전역 스타일
├── components/            # React 컴포넌트
├── lib/                   # 유틸리티 및 설정
│   ├── api/              # API 클라이언트
│   ├── hooks/            # 커스텀 훅
│   └── utils/            # 유틸리티 함수
├── types/                 # TypeScript 타입 정의
├── docs/                  # 문서
│   ├── BUSINESS_OVERVIEW.md
│   └── CHART_VISUALIZATION_EXAMPLES.md
├── PROJECT_PLAN.md       # 프로젝트 계획서
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 📚 관련 문서

- [프로젝트 계획서](./PROJECT_PLAN.md)
- [비즈니스 개요](./docs/BUSINESS_OVERVIEW.md)
- [차트 시각화 예시](./docs/CHART_VISUALIZATION_EXAMPLES.md)

## 🔧 환경 변수 설정

`.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```env
# 백엔드 API URL
NEXT_PUBLIC_API_URL=http://localhost:3001

# NextAuth (필요시)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

## 📝 다음 단계

1. 환경 변수 설정 (`.env.local` 파일 생성)
2. API 클라이언트 설정 (`lib/api/client.ts`)
3. 컴포넌트 및 페이지 구현
4. 백엔드 API와 연동

자세한 내용은 [PROJECT_PLAN.md](./PROJECT_PLAN.md)를 참고하세요.
