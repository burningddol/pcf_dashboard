# Research: HanaLoop PCF 대시보드

**Feature**: 001-pcf-dashboard
**Date**: 2026-05-02
**Phase**: 0 (research)

본 문서는 plan.md의 Technical Context에 등장한 결정의 **근거·대안·트레이드오프**를 결정 시점에 기록한다 (헌법 IX. 결정 추적성).

---

## D1. Next.js 16 Async Request APIs 적응

**결정**: 모든 Route Handler에서 `params`를 `Promise<...>`로 받고 `await` 후 사용한다. 동적 세그먼트가 있는 라우트에는 `RouteContext<'/path'>` 타입 헬퍼를 사용한다. 빌드 전 `next typegen`을 한 번 실행해 글로벌 헬퍼를 활성화한다.

**근거**:
- Next.js 16은 v15에서 도입된 Async Request APIs의 동기 호환을 **완전 제거**했다 (`node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`).
- `cookies()`, `headers()`, `params`, `searchParams` 모두 비동기. 본 기능은 인증 비대상이라 `cookies/headers`는 사용하지 않지만 `params`는 활동 PATCH/DELETE에 필수.
- `RouteContext<'/users/[id]'>`는 typegen으로 생성되며 `params: Promise<{ id: string }>` 타입을 자동 부여 → 휴먼 타입 정의 부담 0.

**대안 검토**:
- (a) v15 호환 모드 유지 — 16에서 제거되어 불가능.
- (b) 수동 타입 정의 — `next typegen` 자동 생성을 거부할 이유 없음. 휴먼 에러 위험만 늘어남.

**적용 위치**: `src/app/api/activities/[id]/route.ts` 의 PATCH/DELETE.

---

## D2. `next.config.ts` Turbopack 설정 위치

**결정**: `next.config.ts`에서 `turbopack`을 top-level 옵션으로 둔다. 본 기능에서는 추가 옵션이 필요 없으므로 빈 키로 두지 않고, 필요해질 때만 추가한다. `experimental.turbopack`은 사용하지 않는다.

**근거**:
- Next.js 16에서 `experimental.turbopack` → top-level `turbopack`으로 승격 (stable). dev/build 모두 Turbopack이 기본.
- 현재 `package.json` scripts는 `next dev` / `next build` (플래그 없음) — 정확함. Webpack 플래그(`--webpack`)는 사용하지 않는다.

**대안 검토**:
- (a) `--webpack` opt-out — 본 프로젝트는 webpack 커스텀 설정 없음. 굳이 느린 빌드를 선택할 이유 없음.
- (b) `experimental.turbopackFileSystemCacheForDev` 활성화 — beta. 채용과제에서 안정성 우선이라 보류.

---

## D3. ESLint Flat Config + 도메인 경계 가드 룰

**결정**: 기존 `eslint.config.mjs`(flat config) 위에 `no-restricted-imports` 규칙을 추가하여 클라이언트 코드(`src/components/**`, `src/app/(dashboard)/**`, `src/app/activities/**`, `src/app/import/**`, `src/app/factors/**`)에서 `src/lib/db/**` 직접 import를 차단한다. `src/app/api/**`는 예외(서버 측 진입점).

**근거**:
- 헌법 VII (HTTP Boundary)를 자동 검증할 유일한 방법은 정적 분석. 코드 리뷰 의존은 시간이 지나면 실패한다.
- `next lint` 명령은 v16에서 제거됨 → ESLint CLI 직접 사용. 이미 `package.json scripts.lint = "eslint"`로 설정됨.
- ESLint v10 호환을 위해 flat config 유지.

**대안 검토**:
- (a) Layered architecture lint(예: `eslint-plugin-boundaries`) — 표현력은 더 높지만 별도 의존성 추가. 본 기능 요구는 "디렉토리 경계 1개"라 `no-restricted-imports`로 충분.
- (b) 코드 리뷰 가이드만 — 인적 검증은 신뢰할 수 없음.

**구체 규칙(예시)**:
```js
{
  files: ['src/components/**', 'src/app/(dashboard)/**', 'src/app/activities/**', 'src/app/import/**', 'src/app/factors/**'],
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [
        { group: ['@/lib/db/*', '../**/lib/db/*'], message: 'HTTP Boundary 위반 — src/lib/api/client 만 사용하세요.' }
      ]
    }]
  }
}
```

---

## D4. 시각화 라이브러리: @visx/sankey vs Recharts

**결정**: Stacked Bar는 **Recharts** (`<BarChart>` + `<Bar stackId>`), Sankey는 **@visx/sankey + d3-sankey**를 사용한다. 두 라이브러리 혼용을 받아들인다.

**근거**:
- Recharts는 Stacked Bar·tooltip·responsive container를 짧은 코드로 제공. 시계열·breakdown 패턴에 fit.
- Recharts의 Sankey 컴포넌트는 노드 정렬·링크 가중치 시각 표현이 제한적. 평가 항목 "UI·UX 25"의 핵심 시각인 Sankey는 d3-sankey 알고리즘이 상위.
- @visx/sankey는 d3-sankey 결과를 React 친화적으로 렌더링 — 색·툴팁 커스터마이징 자유도 ↑.
- 이미 `package.json`에 두 라이브러리 모두 포함됨 → 추가 결정 없음.

**대안 검토**:
- (a) Recharts 단일 — Sankey 표현력이 결정적 시각의 가치를 떨어뜨림.
- (b) ECharts 단일 — 시각 풍성하지만 번들 크기 큼, React 친화도 낮음.
- (c) D3 직접 사용 — 렌더 사이클 React와 충돌 시 비용 ↑.

**트레이드오프**: 두 차트 라이브러리의 색·툴팁 스타일을 일관시키는 비용 발생. 해소책 — 디자인 토큰(`tokens.css`의 Scope/Lifecycle 색)을 양쪽에 동일하게 주입.

---

## D5. xlsx 클라이언트 사이드 파싱

**결정**: Excel 임포트는 **클라이언트 사이드**에서 `xlsx`(SheetJS)로 파싱한다. 파싱된 행은 임시 미리보기 객체로 메모리에 보관하며, 4단계 확정 시점에만 서버 API(`POST /api/imports`)로 전송한다.

**근거**:
- 가짜 백엔드 환경에서 큰 파일을 multipart 전송할 가치 없음. 클라이언트 파싱이 더 빠르고 UX(즉시 미리보기) 우월.
- 1만 행 가정에서 SheetJS 메모리 부담은 무시 가능 (수십 MB 이내).
- 사전 차단형 검증은 클라이언트에서 즉시 결과 표시. 서버 라운드트립 불필요.

**대안 검토**:
- (a) 서버 사이드 파싱 (Node.js) — 가짜 백엔드 라우트의 메모리/시간 비용만 늘어남. 보안 이점은 본 환경에서 무의미.
- (b) Web Worker 파싱 — 메인 스레드 차단을 막지만 1만 행 미만 규모에서 효익 미미. 복잡도 추가.

**트레이드오프**: 브라우저 메모리 한도 초과 가능성 → Assumptions에 "1만 행 이내" 명시(spec.md). 그 이상은 향후 청크 업로드로 확장 가능.

---

## D6. Postgres 마이그레이션 시나리오 (DB 미도입 정당화)

**결정**: 본 채용과제 범위에서는 메모리 store만 사용한다. 실제 DB는 도입하지 않으며, 향후 마이그레이션 경로만 본 문서에 기록한다.

**마이그레이션 경로**:

1. `src/lib/db/store.ts`만 교체 — Postgres 드라이버(예: `postgres-js`)로 같은 export 시그니처 유지.
2. `src/app/api/**/route.ts`는 변경 0줄. 이미 store API를 통해 접근하므로 store 내부만 SQL로 바뀐다.
3. `src/lib/api/client.ts`(클라이언트)는 변경 0줄. HTTP Boundary가 보장한다.
4. seed 데이터는 마이그레이션 스크립트로 변환.
5. `simulate.ts`의 latency·실패율은 dev 환경에서만 활성화.

**근거**:
- 헌법 VII (HTTP Boundary)의 진정한 가치는 이 마이그레이션 시나리오에서 드러난다 — 발표 트레이드오프 1번.
- 채용과제 평가에서 실제 DB 도입은 시간을 가짜 백엔드 시뮬레이션 정교화·UX·시각화에 쓰는 것보다 가치가 낮다.

**대안 검토**:
- (a) 처음부터 SQLite — 의존성·마이그레이션 비용 발생. 가짜 백엔드의 latency/실패율 시뮬레이션 가치(4상태 검증)가 사라짐.
- (b) IndexedDB — 클라이언트 측 스토리지는 HTTP Boundary 원칙과 충돌(클라이언트가 데이터 책임 가짐).

---

## D7. 단위 환산 알고리즘 (도메인)

**결정**: 활동 유형별 표준 단위 카탈로그(`src/lib/domain/unit.ts`)에 SI 차원과 표준 배수를 명시 테이블로 둔다. 환산 함수 `convertToStandard(value, from, activityType)`는:
1. `from`이 표준 단위와 같으면 그대로 반환
2. `from`이 동차원 표준 배수면 곱셈 후 반환
3. 그 외는 `{ ok: false, reason: 'dimension-mismatch' }` 반환

**근거**:
- spec FR-018a~c에 명시된 정책 그대로. 도메인 함수가 진실 공급원.
- 표준 배수만 다루므로 `unit.js` 같은 외부 라이브러리 불필요. 외부 의존성 최소화(헌법 미니멀리즘).

**테이블(초안)**:
```ts
const CATALOG = {
  electricity: { standard: 'kWh', conversions: { MWh: 1000, GWh: 1_000_000 } },
  raw_material: { standard: 'kg', conversions: { t: 1000, ton: 1000 } },
  transport: { standard: 'ton-km', conversions: { 'kg-km': 0.001 } },
};
```

**대안 검토**: `convert-units` npm 패키지 — 차원 처리 강력하지만 본 기능에 과한 표면적. 또한 `ton-km` 같은 합성 단위 지원이 약함.

---

## D8. 데이터 완전성 KPI 산출

**결정**: `src/lib/domain/completeness.ts`에 `computeCompleteness(activities, periodMonths) => { mapping, factor, period, total }` 형태. clarification 답변(매핑 0.4 + 계수 0.4 + 기간 0.2)을 고정 상수로 둔다.

**근거**:
- spec FR-001a 명세대로. 가중치를 매직 넘버가 아닌 named const로 노출하여 popover에서 그대로 인용 가능.
- 3축 분리 반환은 KPI 카드 popover의 "기여도" 표시(헌법 II. 추적성)에 직접 활용.

**대안 검토**: 단일 score만 반환 — popover 추적성 깨짐.

---

## D9. SWR 캐시 키 전략

**결정**: SWR 키는 `['activities', filter]`, `['companies']`, `['factors']`, `['aggregate', filter, lens]` 등 튜플 형태. 필터 객체는 stable serialization(`JSON.stringify(sorted keys)`) 후 키 일부로.

**근거**:
- 필터 변경 시 적절한 캐시 무효화. 토글 변경(lens) 시 `['aggregate', filter, lens]`만 새로 가져오고 raw `activities`는 재사용.
- SWR `mutate(key)`로 낙관적 업데이트 후 rollback도 명시적.

**대안**: 단일 string 키 — 디버깅·무효화 어려움.

---

## D10. 페르소나 토글 URL 동기화 정책

**결정**: 페르소나(`auto`/`exec`/`op`)와 렌즈(`scope`/`lifecycle`)는 URL searchParams(`?persona=...&lens=...`)에 보존. 변경 시 `router.replace` (history push 안 함) — 토글은 진짜 네비게이션이 아님.

**근거**:
- 새로고침 후 상태 유지 (UX).
- 공유 가능한 링크 생성(시연용).
- `router.push`는 뒤로가기 폭주 유발 → `replace`.

**대안**: localStorage — URL 공유 못 함. 두 사용자가 다른 화면 보는 상황 만들기 어려움.

---

## 참고: Next.js 16 핵심 적용 사항 요약 (구현 시 체크리스트)

| 항목 | v16에서의 변화 | 본 프로젝트 적용 |
|---|---|---|
| Async params | Route Handler `params: Promise<...>` | `await ctx.params` 사용 |
| Turbopack | dev/build 기본 | 별도 플래그 없음 |
| middleware → proxy | 파일명 변경 | 본 기능 미사용 |
| `next lint` 제거 | ESLint CLI 직접 | 이미 적용 |
| revalidateTag(tag, profile) | 2nd arg 의무 | 본 기능 미사용(클라이언트 SWR) |
| Async opengraph/sitemap params | id Promise | 본 기능 미사용 |
| Parallel Routes default.js | 모든 슬롯 의무 | 본 기능에서 parallel routes 미사용 |
| serverRuntimeConfig 제거 | env 변수 직접 | 영향 없음 |
| React Compiler | stable, opt-in | 채용과제 안정성 우선이라 비활성. 향후 enable 가능. |

본 표는 `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md` 1차 참조에서 도출.
