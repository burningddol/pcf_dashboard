# Quickstart: HanaLoop PCF 대시보드

**Feature**: 001-pcf-dashboard
**Date**: 2026-05-02

본 문서는 본 기능이 구현된 후 **시연·수동 검증**을 위한 빠른 시작 가이드다. 평가 발표 시 시연 흐름의 베이스라인이기도 하다.

---

## 환경 준비

```bash
# Node.js 20.9+ 필요 (Next.js 16 minimum)
node --version  # v20.9.0 이상

# 의존성 설치 (이미 설치됨)
npm install

# 개발 서버 (Turbopack 기본, 별도 플래그 불필요)
npm run dev
# → http://localhost:3000
```

브라우저 요건: Chrome / Edge / Firefox 111+, Safari 16.4+.

---

## 시연 흐름 1 — 경영자 Overview (User Story 1, P1)

**목표**: Overview 진입 후 3초 안에 5개 KPI를 인지하고, 이중 렌즈 토글로 합계 일치를 보인다.

1. `http://localhost:3000/` 접속.
2. **상단 KPI 5장** 확인:
   - 총 배출량 (`tCO₂e`, 천 단위 구분)
   - 전년 동기 대비 변화율 (`−` U+2212 또는 `+`)
   - 최다 Scope (예: `구매전력(Scope 2)`)
   - 최다 Lifecycle 단계 (예: `제조(Manufacturing)`)
   - 데이터 완전성 % (3축 가중 평균)
3. KPI 카드 한 장 클릭 → popover에 정의·집계 범위·기여도 표시.
4. **이중 렌즈 카드** 토글을 `Scope` ↔ `Lifecycle`로 전환:
   - Scope 뷰: Stacked Bar + 우측 12개월 합계 breakdown
   - Lifecycle 뷰: Sankey (활동 → 단계 → 총합)
   - URL `?lens=scope` ↔ `?lens=lifecycle`로 동기화
5. **합계 일치 검증**: 두 뷰의 12개월 합계 표시가 같음을 확인 (Sankey 우측 또는 카드 하단).
6. **페르소나 토글** 우측 상단 → `경영자` 선택 → KPI + 요약 차트만 남고 테이블 영역이 "활동 데이터로 이동" 버튼으로 대체됨.

**검증 통과 기준**:
- KPI 5장 모두 단위·자릿수 규칙 준수
- 토글 전환 시 합계 동일 (오차 `< 1e-6 tCO₂e`)
- URL 새로고침 후 토글 상태 유지

---

## 시연 흐름 2 — 실무자 활동 입력 + 사이드패널 (User Story 2, P1)

**목표**: 낙관적 업데이트와 자동 rollback을 시연하고 사이드패널 4섹션을 보인다.

1. `http://localhost:3000/activities` 접속 (또는 페르소나 토글 `실무자` 후 KPI 아래 테이블로 스크롤).
2. **신규 활동 추가**:
   - 페이지 우측 상단 `+ 새 활동` 버튼 → 폼 열림
   - 입력: 회사 = `에이씨엠이코리아`, 활동 유형 = `electricity(전기)`, 기간 = `2026-04`, 활동량 = `1.5`, 단위 = `MWh`
   - **저장**: 즉시 테이블 상단에 행 추가됨(낙관적). 사이드패널의 환산 흔적: `1.5 MWh → 1,500 kWh` 표시.
3. **자동 rollback 시연** (반복 저장):
   - 시뮬레이션 실패율 10~20%이므로 5~7회 추가 시 1회 정도 실패
   - 실패 시: 추가된 행 자동 제거 + 화면 우측 하단 토스트 ("저장에 실패했어요. 다시 시도하시겠습니까?" + `[다시 시도]` 액션)
   - 폼 입력값은 보존됨
4. **사이드패널 4섹션 확인** (테이블 임의 행 클릭):
   1. **활동 데이터** — 활동명·회사·기간·Scope/Lifecycle 매핑
   2. **계산식** — mono 블록: `1,500 kWh × 0.4781 kgCO₂e/kWh = 717.15 kgCO₂e = 0.717 tCO₂e`
   3. **적용 계수** — 이름·값·단위·`validFrom`·출처·버전
   4. **감사 추적** — 최소 3개 이벤트 (`created`, `updated 1`, `updated 2`)
5. **`미매칭` 시연**: 시드에 의도된 `waste` 또는 `business_travel` 활동의 행 클릭 → Scope/Lifecycle 셀에 `미매칭` warn pill, 사이드패널에 "수동 매핑" 액션 노출.
6. **이상치 시연**: 시드에 의도된 P99×10 초과 행 → `outlier` warn pill + 사이드패널 "이상치 의심(Outlier Suspected)" 라벨 (저장은 차단되지 않음).
7. **검증 오류 시연**: 폼에 음수 활동량 `-10` 입력 → 인라인 오류 메시지 + 제출 차단.

**검증 통과 기준**:
- 낙관적 추가 ≤ 100ms (체감 즉시)
- 실패 시 100% rollback + 폼 입력값 보존
- 사이드패널 ≤ 300ms 오픈

---

## 시연 흐름 3 — Excel 임포트 사전 차단 (User Story 3, P2)

**목표**: 4단 스테퍼와 사전 차단형 검증, 인라인 수정·계수 빠른 등록을 보인다.

1. `http://localhost:3000/import` 접속.
2. **시연용 Excel 파일** 준비 (`docs/sample-import-with-errors.xlsx`):
   - 정상 행 5건
   - 단위 불일치 1건 (전기 활동에 `kg` 단위)
   - 계수 미매칭 1건 (활동 유형 `unknown_type`)
   - 음수 활동량 1건 (`-100 kWh`)
3. **1단계** 파일 업로드 → 자동으로 2단계로 전환.
4. **2단계** 컬럼 매핑:
   - 시스템 컬럼(회사, 활동 유형, 기간, 활동량, 단위)에 사용자 컬럼 매핑
   - `[다음]` → 3단계로
5. **3단계** 검증·계수 매칭:
   - 페이지 상단 빨강 배너: "**3건의 검증 오류로 임포트가 차단되었습니다**" + 무엇/왜/어떻게 3단 설명
   - 미리보기 테이블의 오류 3행: `neg-soft` 배경, 오류 셀 강조
   - 페이지 하단 `[8건 임포트 (오류 3건 차단됨)]` 버튼 disabled
6. **인라인 수정 + 빠른 등록**:
   - 단위 불일치 행: 단위 셀 인라인 클릭 → `kWh`로 수정 → 자동 재검증, 해당 오류 사라짐
   - 음수 행: 활동량 `100`으로 수정 → 자동 재검증
   - 계수 미매칭 행: `+ 계수 등록` 버튼 → 빠른 등록 폼 → 임시 계수 등록 → 자동 재검증
7. **4단계** 모든 오류 해결 후:
   - 빨강 배너 사라짐
   - `[8건 임포트]` 활성화 → 클릭
   - 부분 실패 시뮬레이션: 8건 중 6건 성공, 2건 실패 → 결과 화면에 분리 표기 + `[실패 행 다운로드 (.xlsx)]` 버튼

**검증 통과 기준**:
- 오류 1건 이상이면 4단계 진입 100% 차단
- 인라인 수정 후 재검증 자동
- 실패 행 다운로드 파일 유효(다시 업로드해서 재시도 가능)

---

## 시연 흐름 4 — 두 뷰 합계 일치 (User Story 4, P2 / 헌법 III)

**목표**: 헌법 III (이중 렌즈 NON-NEGOTIABLE)의 합계 일치 invariant를 보인다.

1. Overview에서 회사 필터 변경 (예: 단일 회사) + 기간 필터 변경 (예: 최근 6개월).
2. Scope 뷰의 우측 합계 패널의 총합 메모.
3. Lifecycle 뷰로 토글 → Sankey 우측 또는 하단의 Total PCF 메모.
4. 두 값이 같음을 확인. (자동화 검증은 `tests/domain/aggregate.spec.ts` property test에서 100건 무작위 필터로 보장.)

**검증 통과 기준**: 모든 필터 조합에서 오차 `< 1e-6 tCO₂e`.

---

## 자동화 검증

```bash
# 도메인 테스트 (100% 라인 커버리지)
npm run test -- tests/domain
npm run test:coverage -- tests/domain  # 100% 라인 확인

# Route Handler contract 테스트
npm run test -- tests/api

# UI 핵심 인터랙션
npm run test -- tests/ui

# 전체
npm run test
```

**커버리지 게이트** (헌법 VI 위임):
- `src/lib/domain/**` — 라인 100% (CI 필수)
- 그 외 — 임계 미설정 (헌법은 도메인만 강제)

---

## 4상태 검증 (헌법 V)

각 데이터 의존 영역에서 다음을 확인:

| 영역 | Empty | Loading | Error | Partial |
|---|---|---|---|---|
| Overview KPI | 시드 비움 | 첫 진입 시 200~800ms | 강제 실패 mode | 일부 매핑 누락 |
| Stacked Bar / Sankey | 데이터 0건 | SWR isLoading | 필터 조합 + 강제 실패 | 부분 데이터 warn pill |
| Activity Table | 시드 비움 | SWR isLoading | 강제 실패 | 일부 행만 매칭 |
| Calculation Sidepanel | activityId null | row 클릭 직후 짧게 | 행 fetch 실패 | 계수 누락 시 |

**강제 실패 모드**: `src/lib/api/simulate.ts`에 환경 변수 `NEXT_PUBLIC_SIMULATE_FAILURE_RATE=1` (개발용) 추가 시 100% 실패.

---

## 페르소나·렌즈 URL 공유

다음 URL은 새 창에서 열어도 같은 상태로 시작:

```
http://localhost:3000/?persona=exec&lens=scope&companyId=acme-kr&from=2025-05&to=2026-04
http://localhost:3000/?persona=op&lens=lifecycle
```

---

## 문제 해결

- **타입 에러 (`params is Promise`)**: `npx next typegen` 실행 후 `RouteContext<'/api/activities/[id]'>` 타입 헬퍼 사용.
- **차트가 빈 화면**: 시드 로드 확인 — `GET /api/companies` 가 비어있다면 메모리 store 초기화 필요(서버 재시작).
- **Tailwind v4 클래스가 안 먹힘**: `globals.css` 상단의 `@import "tailwindcss"` 와 토큰 import 순서 확인.
- **Next.js 16 빌드 실패 (`webpack` 충돌)**: 본 프로젝트는 webpack 커스텀 설정 없음. 만약 플러그인이 `webpack` 키를 추가하면 `next build --turbopack` 명시.

---

## 다음 단계

- 시연 후 `docs/AI_USAGE.md`에 본 시연에서 활용한 prompt·결정 누적
- 발표 자료에 본 quickstart의 흐름 1~4를 그대로 사용
