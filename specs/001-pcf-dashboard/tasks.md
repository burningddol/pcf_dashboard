# Tasks: PCF Dashboard

**Feature**: 001-pcf-dashboard
**관련 문서**: `spec.md`, `plan.md`, `data-model.md`

`[P]` 표시는 다른 태스크와 의존성이 없어 병렬로 진행할 수 있다는 뜻이다.

---

## Phase 1 — Setup (1h)

| # | 태스크 | 산출물 |
|---|---|---|
| T01 | 타입 정의 — `Company`, `Activity`, `EmissionFactor`, `GhgEmission`, `FilterState`. PCF 계산값(`tCO2e`)과 `factorId`를 `Activity`에 포함 | `src/types/index.ts` |
| T02 | 시드 데이터 — 회사 2개(Acme Corp KR, Globex DE) × 8개월(2025-01~08) × 4유형(전기·플라스틱1·플라스틱2·운송) = 64행. 배출계수 v1 4개 + 플라스틱1 v0(과거) | `src/lib/seed.ts` |
| T03 | 가짜 백엔드 — 200~800ms 지연, POST 15% 실패, 메모리 store | `src/lib/api.ts` |
| T04 [P] | Vitest 설정 — `vitest.config.ts`, 첫 sample 테스트 | `vitest.config.ts` |
| T05 [P] | Tailwind + 기본 레이아웃 — NavDrawer(Overview / Activities) + main slot | `src/app/layout.tsx`, `tailwind.config.ts` |

---

## Phase 2 — 도메인 + API (4h)

| # | 태스크 | 산출물 |
|---|---|---|
| T06 | `computeTCO2e(amount: number, factor: EmissionFactor): number` 순수 함수 — `kgCO₂e`로 계산 후 `÷1000`으로 tCO₂e 반환 | `src/lib/domain/pcf.ts` |
| T07 | `mapToScope(activityType): 'scope1'|'scope2'|'scope3'` 상수 매핑 함수. 미매핑 시 throw | `src/lib/domain/scope.ts` |
| T08 | `aggregateByMonth(activities)` — `{ yearMonth, total }[]` 반환, 월 오름차순 | `src/lib/domain/aggregate.ts` |
| T09 | `aggregateBySource(activities)` — `{ source, total }[]` 반환 | `src/lib/domain/aggregate.ts` |
| T10 | T06~T09 Vitest 테스트 — 정상 케이스 + 빈 배열 + 단일 월 | `src/lib/domain/*.test.ts` |
| T11 [P] | `GET /api/companies` route handler | `src/app/api/companies/route.ts` |
| T12 [P] | `GET /api/activities` — `companyId`, `from`, `to` 쿼리 필터 | `src/app/api/activities/route.ts` |
| T13 [P] | `POST /api/activities` — 검증 + PCF 계산 + 15% 실패 시뮬레이션 | `src/app/api/activities/route.ts` |
| T14 [P] | `GET /api/factors` — 현재 적용 버전만 반환 | `src/app/api/factors/route.ts` |
| T15 | SWR 훅 — `useCompanies`, `useActivities(filter)`, `useFactors` | `src/lib/hooks/*.ts` |

---

## Phase 3 — Overview UI (5h)

| # | 태스크 | 산출물 |
|---|---|---|
| T16 [P] | `KpiCard` 컴포넌트 — 라벨, 큰 숫자, 단위, 보조 텍스트(증감) | `src/components/ui/KpiCard.tsx` |
| T17 [P] | `FilterBar` 컴포넌트 — 회사 셀렉트 + 기간(YYYY-MM) | `src/components/dashboard/FilterBar.tsx` |
| T18 | `EmissionsStackedBar` (Recharts) — source별 색상 토큰 적용 | `src/components/charts/EmissionsStackedBar.tsx` |
| T19 [P] | `Skeleton`, `EmptyState`, `ErrorState` UI 프리미티브 | `src/components/ui/*.tsx` |
| T20 [P] | Zustand `filterStore` — `companyId`, `from`, `to` | `src/stores/filter.ts` |
| T21 | `useDashboardKpis` 훅 — 총 tCO₂e, Scope2/Scope3 비중, 전월 대비 변화율 | `src/lib/hooks/useDashboardKpis.ts` |
| T22 | Overview 페이지 조립 — FilterBar + KpiSection + StackedBar | `src/app/page.tsx` |
| T23 | 3상태 처리 — Loading 스켈레톤, Error + 재시도, Empty 안내 | `src/app/page.tsx` |
| T24 | 수동 QA — 필터 3조합, 빈 데이터 케이스, 강제 에러(임시 throw) 확인 | (체크리스트 통과) |

---

## Phase 4 — 활동 데이터 UI (4h)

| # | 태스크 | 산출물 |
|---|---|---|
| T25 [P] | `ActivityTable` — source / 기간 / 활동량 / 단위 / `tCO₂e` / Scope 컬럼 | `src/components/activity/ActivityTable.tsx` |
| T26 [P] | `ActivityForm` — 활동유형·기간·활동량·단위 입력 + PCF 프리뷰 + 인라인 검증 | `src/components/activity/ActivityForm.tsx` |
| T27 | `CalcDetailPanel` — 행 클릭 시 계산식과 적용 계수 버전 표시 | `src/components/activity/CalcDetailPanel.tsx` |
| T28 | 낙관적 업데이트 + 실패 시 rollback + Toast 연동 | `src/lib/hooks/useActivities.ts` |
| T29 | Activities 페이지 조립 — 폼 + 테이블 + 사이드 패널 | `src/app/activities/page.tsx` |
| T30 | Activities 3상태 처리 | `src/app/activities/page.tsx` |
| T31 | `Toast` 컴포넌트 + 루트 레이아웃 마운트 | `src/components/ui/Toast.tsx`, `src/app/layout.tsx` |
| T32 | 수동 QA — 추가 → 성공 토스트 / 추가 → rollback 확인 / 검증 에러 메시지 | (체크리스트 통과) |

---

## Phase 5 — 마무리 (2h)

| # | 태스크 | 산출물 |
|---|---|---|
| T33 | README 작성 — 로컬 실행 5단계, 시스템 설명, AI 사용 내역, 트레이드오프 | `README.md` |
| T34 [P] | ERD 다이어그램(Mermaid) — README에 포함 | `README.md` |
| T35 | 전체 QA 체크리스트 검토 — 단위 표기, 3상태, 검증, 토스트 흐름 | (체크리스트 통과) |
| T36 (보너스) | Excel 직접 임포트 — 시간 여유가 있을 때만 (xlsx 사용) | `src/app/import/page.tsx` |
