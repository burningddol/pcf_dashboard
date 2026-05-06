# PCF Dashboard — 탄소 관리 플랫폼

제조사·물류사 등 기업 고객이 **원소재·전기·운송 활동 데이터를 입력하면 탄소 발자국(PCF)을 자동 계산**하는 인터랙티브 대시보드입니다.  
Mock 데이터 구조 상 **단일 제품 회사**라고 가정하고 1차 MVP로 제작했습니다. 
경영자(추세 파악)와 실무자(데이터 입력) 모두를 위한 단일 위계 레이아웃으로 설계되었습니다.

---

## 시연(데모)


https://github.com/user-attachments/assets/a95182a0-5fc7-4a86-b683-73df6dbfbaf9

---

## 시연(사진자료)
<img width="1899" height="951" alt="image" src="https://github.com/user-attachments/assets/ceb3a387-86d9-451c-b4da-85d452e37da3" />

첫 페이지 진입 시 Sankey 차트를 통해 종류 별, 카테고리 별, scope 별 흐름에 따른 **pcf 계산 흐름을** 한눈에 확인 가능합니다.

<img width="1904" height="947" alt="image" src="https://github.com/user-attachments/assets/8380c6d7-6e0a-4b70-af59-427936be93ce" />

차트 종류를 월별 배출량으로 변경 시 stacked bar 차트로 **scope단위 월별 배출량을** 한눈에 확인 가능합니다.

<img width="1894" height="946" alt="image" src="https://github.com/user-attachments/assets/b23cf9fe-5145-40cf-bf4c-49fc1fe11c6c" />

활동 데이터 탭에선 각 활동별 리스트와 활동 추가 폼을 사용 할 수 있습니다.

<img width="1658" height="268" alt="image" src="https://github.com/user-attachments/assets/2233b282-d1e7-43da-ab55-d11bcffb78ae" />

**버전 별 계수를 구분하고** 계수를 선택 할 수 있습니다.

<img width="1651" height="265" alt="image" src="https://github.com/user-attachments/assets/0fa9f1f4-9ecf-4315-8d80-648b0626e02a" />

**ZOD를 통한 입력값 검증으로** 잘못 된 값을 표시합니다.

<img width="1639" height="264" alt="image" src="https://github.com/user-attachments/assets/6663c204-7117-4c5b-8ffb-eb9d127b5175" />

리퀘스트 실패(15%확률)시 에러메세지를 표시합니다.

<img width="1700" height="348" alt="image" src="https://github.com/user-attachments/assets/af03ce9b-ca23-4e61-ab03-7f49d2f9a088" />

**엑셀 자료로 DB에 활동데이터를 등록**하고, 각 행마다 실패(15%확률)한 건에 대하여 다시 시도를 할 수 있습니다.

---

## 빠른 시작 (5단계)

**사전 요구사항:** Node.js 20+, Yarn, Docker

```bash
# 1. 저장소 클론
git clone https://github.com/burningddol/pcf_dashboard.git
cd pcf_dashboard/app

# 2. 의존성 설치
yarn install

# 3. 환경변수 설정 + PostgreSQL 시작 + 시드
cp .env.example .env
docker compose up -d
yarn db:migrate && yarn db:seed

# 4. 빌드
yarn build

# 5. 서버 시작
yarn start
```

브라우저에서 http://localhost:3000 접속

> `.env.example`에 들어 있는 `DATABASE_URL="postgresql://pcf:pcf@localhost:5432/pcf"` 값을 그대로 사용합니다. Docker Compose가 동일 설정으로 DB를 띄우므로 별도 수정 불필요. Windows PowerShell이라면 `cp` 대신 `copy .env.example .env`.

---

## 도메인 모델

### 핵심 공식 (단일 제품 회사 가정)

```
tCO₂e = 활동량(amount) × 배출계수(factor.value) ÷ 1000
```

### GHG Scope 분류

| Scope       | 정의                       | 본 시스템 활동                     |
| ----------- | -------------------------- | ---------------------------------- |
| **Scope 1** | 직접 배출 (사업장 내 연소) | (해당 없음)                        |
| **Scope 2** | 간접 배출 — 구매 전력      | **전기** (한국전력)                |
| **Scope 3** | 가치사슬 간접 배출         | **원소재** (플라스틱1·2), **운송** |

활동 유형별 매핑은 `src/lib/domain/scope.ts`에 단일 진실 공급원으로 관리됩니다.

---


## 시스템 설계

### 아키텍처

```
브라우저
  └─ Next.js App Router (RSC + Client Components)
       ├─ /app/page.tsx          → Overview 대시보드
       ├─ /app/activities/       → 활동 데이터 관리
       └─ /app/api/
            ├─ activities/       → GET (필터), POST (생성)
            └─ factors/          → GET (배출계수 목록)
                   │
                   ▼
             lib/api.ts          ← 유일한 DB 접근 레이어
                   │
                   ▼
           Prisma 7 + PostgreSQL
```

API Route는 `lib/api.ts`만 import합니다. DB·외부 시스템으로 교체할 때 이 파일 하나만 수정하면 됩니다.

### DB 스키마 (ERD)

```
┌─────────────────┐         ┌──────────────────┐
│ Company         │         │ EmissionFactor   │
│─────────────────│         │──────────────────│
│ id (PK)         │         │ id (PK)          │
│ name            │         │   ef-electricity-v1
│ country         │         │ activityType     │
└────────┬────────┘         │ value            │
         │ 1                │ unit             │
         │                  │ version          │
         │ N                │ validFrom        │
         ▼                  │ source (KEPCO 등)│
┌─────────────────┐         └────────┬─────────┘
│ Activity        │                  │ 1
│─────────────────│                  │
│ id (PK, UUID)   │                  │ N
│ companyId  ─────┘                  │
│ factorId   ─────────────────────── ┘
│ factorValue ← 입력 시점 계수 값 스냅샷 (계산 추적용)
│ activityType
│ description
│ yearMonth (YYYY-MM)
│ amount, unit
│ tCO2e       ← 입력 시 서버에서 계산·저장
│ scope       ← activityType으로부터 결정
│ createdAt
└─────────────────┘
```

### 도메인 레이어 (`src/lib/domain/`)

순수 함수만 두어 단위 테스트 가능. 100% 커버리지 유지.

| 파일           | 역할                                                               |
| -------------- | ------------------------------------------------------------------ |
| `pcf.ts`       | `computeTCO2e(amount, factorValue)` — PCF 계산                     |
| `scope.ts`     | `mapToScope(activityType)` — 활동 → Scope 매핑                     |
| `aggregate.ts` | 월별·유형별·Sankey용 집계                                          |
| `excel.ts`     | `.xlsx` 파싱 → 스키마 검증 통과 행만 `CreateActivityBody[]`로 반환 |
| `schemas.ts`   | Zod 스키마 — 폼·API·Excel 검증의 단일 진실 공급원                  |
| `constants.ts` | 회사 ID, 활동 유형 목록, Scope 목록, 색상 토큰                     |

### 클라이언트 상태 관리

| 상태                         | 도구              | 이유                               |
| ---------------------------- | ----------------- | ---------------------------------- |
| 서버 데이터 (활동, 배출계수) | TanStack Query v5 | 캐싱·재검증·invalidate로 일관된 UI |
| 기간 필터 (from/to)          | Zustand           | 여러 컴포넌트(차트·KPI) 간 공유    |
| 폼 입력                      | React Hook Form   | 유효성 검사·에러 표시 통합         |

### 확장성·재사용성·안정성

- **확장성** — `lib/api.ts` 단일 진입점 + Prisma adapter 패턴으로 PostgreSQL → 외부 API 교체 가능
- **재사용성** — 도메인 레이어가 UI와 완전히 분리되어 차후 모바일·CLI 등에서 재사용 가능
- **안정성** — 도메인 함수 100% 단위 테스트, 쓰기 실패 시뮬레이션(15%)으로 네트워크 불안정 상황 검증

---

## 설계 결정 이유

### 1. Stacked Bar + Sankey, 두 개의 차트를 같이 둔 이유

대시보드 사용자는 두 가지 질문에 답해야 합니다 — **"언제 많이 배출했나?"** 와 **"어디서 배출이 오나?"**. 한 종류의 차트로는 둘 다 답할 수 없습니다.

| 후보                      | 한계                                                            |
| ------------------------- | --------------------------------------------------------------- |
| Pie / Donut               | 비율은 보이지만 시간축 없음. 조각 4개 이상이면 가독성 급락      |
| Line Chart                | 총량 추이만 보임. Scope 구성 비교 불가                          |
| **Stacked Bar (선택)**    | 월별 × Scope 누적을 동시에 표현 → "언제"                        |
| **Sankey Diagram (선택)** | 활동 → 활동유형 → Scope → Total 흐름으로 핫스팟 추적 → "어디서" |

Stacked Bar는 경영자가 추세를 파악하고, Sankey는 실무자가 어느 활동이 가장 큰 비중을 차지하는지 한눈에 보게 합니다.

### 2. tCO₂e를 DB에 저장하는 이유 — 스냅샷 패턴

배출계수는 정부 고시(KEPCO·KEITI)에 따라 매년 개정됩니다. 조회 시점에 계산하면 작년 1월 데이터가 올해 개정된 계수로 다시 계산되어, 이미 발간된 작년 보고서와 수치가 달라집니다.

```
조회 시 계산 (X)        입력 시 계산·저장 (선택)
────────────────         ─────────────────────
amount * 현재계수         amount * 입력시점계수 = tCO2e (저장)
        ↓                         ↓
계수 개정 시 변동          과거 기록 불변
감사 대응 불가             감사 대응 가능
```

두 단계로 불변성을 보장합니다.

1. **결과값(tCO2e) 저장** — 결과 자체가 불변
2. **계수 값(factorValue) 컬럼 저장** — 계산에 사용된 `factor.value`를 Activity 행에 직접 박아둠. `EmissionFactor` 테이블의 값이 나중에 수정돼도 과거 활동의 계산 근거가 유지됨

`factorId`에는 버전을 포함(`ef-electricity-v1` → `ef-electricity-v2`)해 어떤 시점의 어느 버전 계수가 사용됐는지 외래키로 추적 가능합니다.

### 3. 설계 Trade-off — Excel 임포트: 행 단위 부분 성공 vs 전체 트랜잭션

100건 임포트 중 시뮬레이션 실패율 15%로 평균 15건이 실패합니다. 두 전략 비교:

|               | 전체 트랜잭션    | **행 단위 부분 성공 (선택)**     |
| ------------- | ---------------- | -------------------------------- |
| 1건 실패 시   | 100건 전부 롤백  | 99건 저장, 1건만 실패 표시       |
| 사용자 부담   | 파일 다시 업로드 | 실패 건만 재시도 버튼 클릭       |
| 데이터 일관성 | 강함             | 행 간 의존성 없으면 안전         |
| 구현          | DB Transaction   | `Promise.allSettled` + 실패 추적 |

활동 기록은 **행 간 의존성이 없는 독립 데이터**이므로 일부만 저장돼도 데이터 무결성이 깨지지 않습니다. 사용자가 100건을 다시 업로드하는 것보다 실패 15건만 재시도하는 게 압도적으로 나은 UX라 행 단위 처리를 선택했습니다.

---

## 쓰기 실패 시뮬레이션

`createActivity`는 기본 15% 확률로 실패합니다 (네트워크 불안정성 재현).

```bash
# 실패율 조정 (0 = 항상 성공, 1 = 항상 실패)
NEXT_PUBLIC_SIMULATE_FAILURE_RATE=0 yarn dev
```

환경 변수입력이 없을 시 기본값 0.15로 재현되어 있습니다.

---

## 테스트

```bash
yarn test           # 단위 테스트 실행
yarn test:coverage  # 커버리지 리포트 (src/lib/domain/ 100%)
```

도메인 함수(`pcf`, `scope`, `aggregate`, `excel`)만 단위 테스트하고, API Route·UI는 수동 QA합니다.

---

## AI 사용 내역

[`docs/AI_USAGE.md`](https://github.com/burningddol/pcf_dashboard/blob/main/docs/AI_USAGE.md) 참고 — 사용한 도구·프롬프트·검토 방식·생성된 코드를 직접 이해하고 수정한 부분을 기록.

---

## 기술 스택

| 분류            | 기술                                     |
| --------------- | ---------------------------------------- |
| 프레임워크      | Next.js 16 (App Router)                  |
| 언어            | TypeScript                               |
| 스타일          | Tailwind CSS v4 + CSS 변수 디자인 토큰   |
| 차트            | Recharts (Stacked Bar, Sankey)           |
| 서버 상태       | TanStack Query v5                        |
| 클라이언트 상태 | Zustand                                  |
| 폼              | React Hook Form + Zod (검증 스키마 공유) |
| ORM             | Prisma 7 + `@prisma/adapter-pg`          |
| DB              | PostgreSQL 16                            |
| 테스트          | Vitest + jest-dom                        |
| Excel 파싱      | xlsx (SheetJS)                           |
| 인프라          | Docker Compose (PostgreSQL)              |
