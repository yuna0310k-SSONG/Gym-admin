# Vercel 배포 가이드

## 📋 배포 전 체크리스트

### 1. 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수를 설정해야 합니다:

#### 필수 환경 변수

```
NEXT_PUBLIC_API_URL=https://gym-membership-backend-5zjj.onrender.com
```

**설정 방법**:
1. Vercel 프로젝트 대시보드 접속
2. Settings → Environment Variables
3. 위 환경 변수 추가
4. Production, Preview, Development 모두에 적용

### 2. 빌드 설정 확인

현재 `package.json`의 빌드 스크립트:
```json
{
  "scripts": {
    "build": "next build",
    "start": "next start"
  }
}
```

Vercel은 자동으로 Next.js를 감지하므로 추가 설정 불필요합니다.

### 3. 프로젝트 루트 확인

프로젝트 루트가 `gym-front` 폴더인 경우:
- Vercel에서 "Root Directory"를 `gym-front`로 설정
- 또는 프로젝트 루트를 `gym-front`로 설정

---

## 🚀 배포 방법

### 방법 1: Vercel CLI 사용

```bash
# 1. Vercel CLI 설치
npm i -g vercel

# 2. 프로젝트 디렉토리로 이동
cd gym-front

# 3. Vercel 로그인
vercel login

# 4. 배포
vercel

# 5. 프로덕션 배포
vercel --prod
```

### 방법 2: GitHub 연동 (권장)

1. GitHub에 프로젝트 푸시
2. Vercel 대시보드에서 "Add New Project"
3. GitHub 저장소 선택
4. 프로젝트 설정:
   - **Framework Preset**: Next.js (자동 감지)
   - **Root Directory**: `gym-front` (필요한 경우)
   - **Build Command**: `npm run build` (기본값)
   - **Output Directory**: `.next` (기본값)
   - **Install Command**: `npm install` (기본값)
5. Environment Variables 설정
6. Deploy 클릭

---

## ⚙️ Vercel 설정 파일 (선택사항)

프로젝트 루트에 `vercel.json` 파일을 생성하여 추가 설정 가능:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["icn1"],
  "env": {
    "NEXT_PUBLIC_API_URL": "https://gym-membership-backend-5zjj.onrender.com"
  }
}
```

**참고**: `env`는 환경 변수 설정의 대체 방법이지만, Vercel 대시보드에서 설정하는 것을 권장합니다.

---

## 🔧 환경 변수 상세

### NEXT_PUBLIC_API_URL

백엔드 API 서버 URL입니다.

- **개발 환경**: `http://localhost:3001` (로컬 개발 시)
- **프로덕션**: `https://gym-membership-backend-5zjj.onrender.com` (현재 설정)

**중요**: `NEXT_PUBLIC_` 접두사가 붙은 환경 변수만 클라이언트에서 접근 가능합니다.

---

## 📝 배포 후 확인 사항

### 1. 빌드 성공 확인
- Vercel 대시보드에서 빌드 로그 확인
- 에러가 없으면 성공

### 2. 환경 변수 확인
- 브라우저 개발자 도구 → Console
- API 호출이 정상적으로 이루어지는지 확인

### 3. 기능 테스트
- [ ] 로그인/회원가입
- [ ] 회원 목록 조회
- [ ] 회원 상세 페이지
- [ ] 목표 관리 (백엔드 API 구현 후)
- [ ] PT 세션 (백엔드 API 구현 후)
- [ ] 운동 기록 (백엔드 API 구현 후)

---

## 🐛 문제 해결

### 빌드 실패

**문제**: TypeScript 에러
```bash
# 로컬에서 빌드 테스트
npm run build
```

**문제**: 환경 변수 누락
- Vercel 대시보드에서 환경 변수 확인
- `NEXT_PUBLIC_` 접두사 확인

### 런타임 에러

**문제**: API 호출 실패
- 브라우저 개발자 도구 → Network 탭 확인
- CORS 에러인지 확인
- 백엔드 서버 상태 확인

**문제**: 404 에러
- 라우팅 설정 확인
- `next.config.js` 확인

---

## 🔐 보안 주의사항

### 환경 변수
- ✅ `NEXT_PUBLIC_*` 변수는 클라이언트에 노출됨 (공개 가능한 값만 사용)
- ❌ 민감한 정보(비밀키, 토큰 등)는 서버 사이드에서만 사용

### API 토큰
- JWT 토큰은 `localStorage`에 저장 (현재 구현)
- `httpOnly` 쿠키 사용 고려 (향후 개선)

---

## 📊 배포 상태 확인

### Vercel 대시보드
- **Deployments**: 배포 히스토리
- **Analytics**: 트래픽 및 성능
- **Logs**: 실시간 로그 확인

### 도메인 설정
1. Vercel 대시보드 → Settings → Domains
2. 커스텀 도메인 추가 (선택사항)
3. DNS 설정 안내 따르기

---

## 🎯 배포 체크리스트

배포 전 확인:

- [ ] `package.json`의 빌드 스크립트 확인
- [ ] 환경 변수 설정 (`NEXT_PUBLIC_API_URL`)
- [ ] 로컬에서 `npm run build` 성공 확인
- [ ] TypeScript 에러 없음
- [ ] ESLint 경고 해결 (선택사항)
- [ ] `.gitignore`에 `.env.local` 포함 확인
- [ ] GitHub에 코드 푸시 완료

배포 후 확인:

- [ ] 빌드 성공
- [ ] 사이트 접속 가능
- [ ] 로그인/회원가입 동작
- [ ] API 호출 정상
- [ ] 콘솔 에러 없음

---

## 📞 추가 리소스

- [Vercel 공식 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [환경 변수 설정](https://vercel.com/docs/concepts/projects/environment-variables)

---

**작성일**: 2024-01-06  
**프로젝트**: 헬스 데이터 플랫폼 프론트엔드

