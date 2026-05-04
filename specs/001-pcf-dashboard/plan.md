# Plan: PCF Dashboard

**Feature**: 001-pcf-dashboard
**Timebox**: 2일(48시간) 집중, 5일 여유
**관련 문서**: `spec.md`, `data-model.md`, `tasks.md`, `../../.specify/memory/constitution.md`

---

## 1. 기술 스택과 선택 이유

| 영역 | 선택 | 선택 이유 |
|---|---|---|
| 프레임워크 | Next.js 14+ App Router | 서버 컴포넌트와 route handler를 한 저장소에서 다루기 위함 |
| 언어 | TypeScript strict | `any` 금지·도메인 타입 안전 확보 |
| 스타일 | Tailwind CSS + 디자인 토큰 | 채용과제 시간 제약 안에서 일관된 시각 언어 |
| 차트 | Recharts | Stacked Bar 한 종류로 충분, 학습 비용 낮음 |
| 클라이언트 상태 | Zustand | 필터 상태 1개 store로 충분, Redux 과설계 회피 |
| 서버 상태 | SWR | 낙관적 업데이트 + revalidate 패턴이 1급 시민 |
| 테스트 | Vitest + Testing Library | Next.js와 무난히 공존, 도메인 함수만 테스트 |

> Postgres·Docker·OpenAPI는 보너스 항목으로 분류하고, 시간 여유가 있을 때만
> 추가한다. 가짜 백엔드는 메모리 시드로 충분히 동작한다.

---

## 2. 핵심 설계 결정 (왜 이렇게 했는가)

### 2-1. 도메인 함수 분리

PCF 계산식, Scope 매핑, 집계는 모두 `src/lib/domain/*` 아래 순수 함수로 둔다.
이렇게 하면:
- UI 변경이 도메인 로직을 건드리지 않는다
- Vitest로 입력·출력만 검증해도 신뢰가 생긴다
- 추후 백엔드를 실제 DB로 바꿔도 도메인 모듈은 그대로 재사용된다

### 2-2. 배출계수 버전 관리

활동 데이터는 `factorId`만 보존하고 계산값(`tCO2e`)을 함께 저장한다. 배출계수
테이블은 별도로 유지하며 `version` · `validFrom` 필드를 둔다. 미래에 계수가
갱신돼도(예: KEPCO 고시 변경) 과거 활동의 계산값과 적용 버전이 그대로 남아 있어
재현성이 보장된다 — 이게 "왜 굳이 정규화했는가"의 답이다.

### 2-3. 낙관적 업데이트 + 롤백

가짜 백엔드는 의도적으로 15%의 쓰기 실패를 발생시킨다. SWR `mutate`의 옵션을
사용해 낙관적 업데이트 후 실패 시 자동 롤백하고 토스트로 사용자에게 알린다.
"실패도 정상 흐름"이라는 점을 시연한다.

### 2-4. 단일 위계 레이아웃

경영자/실무자 토글을 두지 않는다. Overview 페이지는 누구든 빠르게 보고,
활동 데이터 페이지는 실무자가 주로 쓰지만 경영자가 봐도 막히지 않는다.
화면을 단순하게 유지하는 편이 평가자 입장에서도 읽기 쉽다.

### 2-5. Trade-off 1 — 가짜 백엔드의 한계

메모리 시드는 새로고침 시 초기화된다. 실제 DB 도입 대신 가짜 백엔드를 택한
이유는 채용과제 시간 제약 안에서 도메인·UX 평가 비중이 더 높다고 판단했기
때문이다. README에서 명시적으로 한계로 적고, "Postgres 도입 시 `lib/api.ts`만
교체하면 된다"는 마이그레이션 시나리오를 함께 적는다.

---

## 3. 폴더 구조

```
src/
├─ app/
│  ├─ page.tsx                    # Overview 대시보드
│  ├─ activities/page.tsx         # 활동 데이터 입력·테이블
│  ├─ layout.tsx                  # NavDrawer + Toast 마운트
│  └─ api/
│     ├─ companies/route.ts       # GET
│     ├─ activities/route.ts      # GET, POST
│     └─ factors/route.ts         # GET
├─ components/
│  ├─ ui/                         # KpiCard, Button, Input, Toast,
│  │                              # Skeleton, EmptyState, ErrorState
│  ├─ charts/
│  │  └─ EmissionsStackedBar.tsx
│  ├─ dashboard/
│  │  ├─ FilterBar.tsx
│  │  └─ KpiSection.tsx
│  └─ activity/
│     ├─ ActivityTable.tsx
│     ├─ ActivityForm.tsx
│     └─ CalcDetailPanel.tsx
├─ lib/
│  ├─ domain/
│  │  ├─ pcf.ts                   # computeTCO2e(amount, factor)
│  │  ├─ scope.ts                 # mapToScope(activityType)
│  │  └─ aggregate.ts             # aggregateByMonth, aggregateBySource
│  ├─ api.ts                      # 가짜 백엔드 (지연 + 15% 실패)
│  └─ fetcher.ts                  # SWR fetcher
├─ stores/
│  └─ filter.ts                   # Zustand filterStore
└─ types/
   └─ index.ts                    # Company, Activity, EmissionFactor,
                                  # FilterState
```

---

## 4. Phase 계획

총 16시간 작업 + 버퍼. 일자별로 나눌 수 있도록 단위가 떨어진다.

### Phase 1 — Setup (1h)
- 타입 정의, 시드 데이터, 가짜 백엔드 골격, Vitest 설정, Tailwind 레이아웃

### Phase 2 — 도메인 + API (4h)
- `lib/domain/*` 순수 함수와 Vitest 테스트
- API route 4개(`companies`, `activities` GET/POST, `factors`)
- SWR 훅(`useCompanies`, `useActivities`, `useFactors`)

### Phase 3 — Overview UI (5h)
- KpiCard, FilterBar, EmissionsStackedBar
- 3상태 처리(Skeleton, ErrorState, EmptyState)
- KPI 계산 훅(`useDashboardKpis`)
- Overview 페이지 조립과 수동 QA

### Phase 4 — 활동 데이터 UI (4h)
- ActivityTable, ActivityForm, CalcDetailPanel
- 낙관적 업데이트 + 롤백 + Toast
- Activities 페이지 조립과 3상태 처리

### Phase 5 — 마무리 (2h)
- README(로컬 실행 5단계, AI 사용 내역, 트레이드오프), ERD(Mermaid), 전체 QA

### 버퍼
- Excel 임포트(보너스), Docker Compose(보너스), 추가 시각 다듬기

---

## 5. 도메인 흐름 한눈에 보기

```
[ ActivityForm 입력 ]
        │ POST /api/activities
        ▼
[ lib/api.ts ]
   ├─ validate (음수·빈 값)
   ├─ pick factor by activityType (현재 버전)
   ├─ computeTCO2e(amount, factor)
   ├─ mapToScope(activityType)
   └─ persist Activity { ..., factorId, tCO2e, scope }
        │
        ▼
[ SWR mutate → ActivityTable rerender ]

[ /api/activities GET ]
        │
        ▼
[ aggregateByMonth(...) → StackedBar 데이터 ]
[ aggregateBySource(...) → KPI 비중 계산 ]
[ MoM 변화율 = (이번 달 합계 − 지난 달 합계) / 지난 달 합계 ]
```

이 흐름이 `spec.md`의 FR-01~FR-12를 모두 충족하며, 도메인 함수 4개가
모든 계산을 담당하므로 평가자가 코드를 읽을 때 진입점이 명확하다.
