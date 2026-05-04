@AGENTS.md

# HanaLoop PCF Dashboard — Project Rules

전역 `~/.claude/CLAUDE.md` 의 시니어 코드 규칙을 상속한다. 본 문서는 프로젝트 고유 규칙만 정의한다.

---

## 컨텍스트

하나루프 채용과제 (2026). 평가 비중:
- 도메인 이해 25% / 시스템 설계 30% / UX 20% / 논리적 설명 20%

**핵심 산출물** — 활동 데이터(전기·원소재·운송) → 배출계수 → tCO₂e PCF 시각화 대시보드.  
대상자: 경영자(추세 파악) + 실무자(데이터 입력). 페르소나 토글 없이 단일 위계 레이아웃으로 해결.

---

## 도메인 용어

- **PCF (Product Carbon Footprint)** — 활동량 × 배출계수 = tCO₂e
- **Scope 2** — 구매전력 (전기, 한국전력)
- **Scope 3** — 가치사슬 간접배출 (원소재·운송)
- **배출계수 (Emission Factor)** — 활동량 → CO₂e 변환 계수. 버전 관리 대상 (KEPCO·KEITI 고시)

---

## 활동 → Scope 매핑

| 활동 유형 | Scope |
|---|---|
| 전기 (electricity) | Scope 2 |
| 원소재 (plastic1, plastic2) | Scope 3 |
| 운송 (transport) | Scope 3 |

---

## 기술 스택

- **Next.js 14+** App Router · **React 18** · **TypeScript strict**
- **Tailwind CSS** + `.claude/skills/pcfboard/tokens.css` (디자인 토큰)
- **Recharts** — Stacked Bar (월별 source별 시계열)
- **Zustand** — 필터 상태
- **SWR** — 서버 상태 + 낙관적 업데이트
- **Vitest** + Testing Library — 핵심 도메인 함수만

---

## 폴더 구조

```
src/
├─ app/
│  ├─ page.tsx                    # Overview (KPI + 차트)
│  ├─ activities/page.tsx         # 활동 데이터 테이블 + 입력 폼
│  ├─ layout.tsx                  # NavDrawer 포함
│  └─ api/
│     ├─ companies/route.ts
│     ├─ activities/route.ts
│     └─ factors/route.ts
├─ components/
│  ├─ ui/                         # KpiCard, Button, Input, Toast, Skeleton, EmptyState, ErrorState
│  ├─ charts/EmissionsStackedBar.tsx
│  ├─ dashboard/                  # FilterBar, KpiSection
│  └─ activity/                   # ActivityTable, ActivityForm, CalcDetailPanel
├─ lib/
│  ├─ domain/
│  │  ├─ pcf.ts                   # computeTCO2e(amount, factor)
│  │  ├─ scope.ts                 # mapToScope(activityType)
│  │  └─ aggregate.ts             # aggregateByMonth, aggregateBySource
│  ├─ api.ts                      # 가짜 백엔드 (지연 200~800ms + 쓰기 15% 실패)
│  └─ fetcher.ts                  # SWR fetcher
├─ stores/
│  └─ filter.ts                   # Zustand filterStore
└─ types/
   └─ index.ts
```

---

## 테스트 정책

- **도메인 함수** (`src/lib/domain/*`) — Vitest 단위 테스트. 정상·빈 배열·경계값만 커버.
- **API Route / UI** — 수동 QA. 자동화 테스트 강제 안 함.
- TDD RED→GREEN 별도 커밋 의무 없음. 일반 커밋 컨벤션 따름.

---

## 가짜 백엔드

`src/lib/api.ts`에 모든 시뮬레이션 로직을 둔다.

- 지연: 200~800ms
- 쓰기 실패율: 15% (NEXT_PUBLIC_SIMULATE_FAILURE_RATE 환경변수로 조정 가능)
- 데이터는 메모리에만 존재. 새로고침 시 시드로 초기화.

Postgres 전환 시 `src/lib/api.ts`만 교체하면 되도록 API route가 이 모듈만 import한다.

---

## 커밋 규칙

- `feat:` 새 기능
- `fix:` 버그 수정
- `test:` 테스트 추가/수정
- `docs:` README, AI_USAGE 등 문서
- `chore:` 의존성, 설정

---

## AI 사용 투명성

발표 시 "AI로 무엇을, 어떤 prompt로, 왜 그렇게 결정했는지" 구분 설명 필요.  
진행 중 `docs/AI_USAGE.md`에 누적 기록.
