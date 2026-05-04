# Components

핵심 컴포넌트의 시각·인터랙션 사양. 각 항목은 (1) 무엇 (2) 언제 쓰는가 (3) 사양 (4) 절대 하지 말 것 순으로 작성.

---

## KPI Card
**무엇** — 한 줄 요약 + 큰 숫자 + 추세 + (선택) 미니 시각화.

**언제** — 대시보드 최상단. 5개 카드로 1줄 구성. 경영자가 3초 안에 답을 얻는 영역.

**사양**
- 높이: 116px (편안), 92px (컴팩트)
- 패딩: `16px 18px 14px`
- 구조: `[micro 라벨 / 보조 라벨] · [큰 숫자 + 단위] · [delta pill] · [추세 설명] · [breakdown 또는 sparkline]`
- 큰 숫자: `28px / 600 / -0.02em`, IBM Plex Mono tabular
- 단위는 별도 span (`12px / fg-3`), 숫자와 baseline 정렬
- Delta pill — **emissions down = 녹색(pos), up = 빨강(neg)**. 금융 상식과 반대.
- Breakdown bar — 3색 스택 (Scope 비중 등), 6px 높이, 1px 갭
- Sparkline — 28px 높이, 마지막 점에 2px dot

**절대 하지 말 것**
- 단위 없는 숫자
- 큰 숫자에 색을 입히는 것 (변동은 pill에만)
- 의미 없는 추세선 (배출량이 의미 있는 추세를 가질 때만)

---

## Pill (Badge)
**무엇** — 짧은 분류·상태·추세 표시.

**바리에이션**
- `s1` `s2` `s3` — Scope 분류. 좌측 6px 컬러 dot. 차트 색과 1:1 일치.
- `pos` `neg` — 추세. 화살표 아이콘 + 부호 있는 % (예: `−3.6%`)
- `warn` — 검토중·주의
- `info` — 현행 버전 등 중립 정보
- `ghost` — 카운트, 메타 (`1,284건`)

**사양**
- 높이: 자동, 패딩 `2px 8px`
- 폰트: 11px / 500
- 라운드: 999px

**절대 하지 말 것**
- 한 화면에 4가지 이상 상태색을 동시에 (정보 노이즈)
- pill 안에 또 다른 pill

---

## Button
**계층**
1. `primary` — 페이지당 1개. 진행/확정 액션. `accent` 배경.
2. `default` — 보조 액션, 필터, export. `bg / line-2`.
3. `ghost` — 아이콘 버튼, 텍스트 링크. 투명 배경.
4. `dashed` — 비어있는 필터 추가 ("필터 +").

**사양**
- 기본 높이 30px, sm 26px
- 라운드 6px
- 호버: `bg-1`, 보더 `line-strong`. 트랜지션 120ms.
- 포커스: `focus-ring` (3px accent 글로우)
- Disabled: opacity 0.5, cursor not-allowed

---

## Input
**사양**
- 높이 30px, 라운드 6px
- 보더 `line-2`, 호버 `line-strong`, 포커스 `accent` + `focus-ring`
- Invalid: 보더 `neg` + 빨강 글로우 + 인라인 에러 텍스트 (아이콘 + "무엇이 / 왜 / 어떻게" 3단)
- Read-only: 배경 `bg-1`, 텍스트 `fg-2`

**라벨 패턴**
- 라벨: `11.5px / 500 / fg-2`
- 단위는 라벨 아래 또는 input 우측 끝에 `fg-3`로

---

## Data Table Row
**무엇** — 활동 데이터·계수 등 도메인 객체 한 행.

**사양**
- 행 높이: 약 40px (`padding 10px 12px`)
- 행 보더: `line-soft` (헤어라인)
- 헤더: `bg-1`, 11px / 500 / uppercase / `fg-3`
- 호버: `bg-1` 전체 행
- Active (선택됨): `accent-soft` 배경
- 숫자 컬럼은 `text-align: right` + IBM Plex Mono
- ID 컬럼은 mono 11.5px / `fg-3`

**행 콘텐츠 우선순위 (활동 데이터)**
1. ID (mono, 약함)
2. 날짜 (num, 약함)
3. 사업장 (일반)
4. 활동 유형 (강조 — 500)
5. Scope pill
6. 활동량 + 단위 (num, 강조 — 600)
7. 적용 계수 + 버전 (서브텍스트로 버전 표기)
8. 계수값 (num, fg-2)
9. 배출량 결과 (num, fg, 600 — 가장 강조)
10. 상태 pill

**상태별 셀 렌더링**
- 정상: 일반 텍스트
- 미매칭: "—" 또는 "미매칭"을 `neg` 색 + 600
- 음수: 숫자를 `neg` 색 + 600
- 검토중: 행 자체는 정상, 상태 pill만 warn

---

## Calculation Sidepanel
**무엇** — 행 클릭 시 우측에서 슬라이드인. "이 숫자가 어디서 나왔나"를 풀어서 보여주는 패널.

**사양**
- 너비 380px, 우측 고정
- 보더: 좌측 1px `line`
- 박스섀도: `sh-3`

**섹션 (위→아래)**
1. **헤더** — `계산 추적` + 활동 ID (mono)
2. **활동 데이터** — `bg-1` 카드. 활동명 + 사업장·날짜 + Scope/Lifecycle/제품 매핑 pill 3개
3. **계산식** — mono 블록. 주석(`#`)으로 공식 + 활동량 × 계수 = 결과 + 단위 환산
4. **적용 계수** — 카드. 값/단위/유효시작/출처 grid + 이전 버전 대비 변화 설명
5. **감사 추적** — 타임라인. 누가·언제·무엇을 했는지 (이벤트 도트 + 시간)

**규칙**
- 모든 숫자는 단위 표기 의무
- 출처는 외부 링크 아이콘과 함께 클릭 가능
- 감사 추적은 최소 3개 이벤트 (자동 매칭, 임포트, 시스템 이벤트)

---

## Filter Bar
**무엇** — 페이지 상단의 가로 필터 묶음.

**구조 (좌→우)**
1. **기간 segmented control** — 주/월/분기/연
2. **날짜 범위 버튼** — `2025-05 → 2026-04` + 드롭다운
3. **세로 구분선** (1px / `line`)
4. **필터 dashed-border 버튼들** — `Scope: 전체`, `활동 유형: 전체 (12)`, `사업장: 평택 1공장`...
5. (우측) 동기화 시각 + Export

**규칙**
- 필터 라벨과 값은 한 버튼 안에서 색으로 분리: 라벨은 `fg-3`, 값은 `fg / 500`
- 선택된 필터가 없으면 `전체` 표시 (절대 비워두지 않음)

---

## Stacked Bar Chart (Scope)
- 12개월 stacked bar
- 색: scope-1 (하단) → scope-2 → scope-3 (상단)
- 막대 최대 너비 38px, 갭 8px
- Y축: 4단계 그리드 (니스 max), 점선 `line-soft`
- Y축 라벨: `10px / fg-4`, IBM Plex Mono
- 항상 우측에 12개월 합계 + Scope별 breakdown 사이드 (240px)

## Sankey (Lifecycle)
- 3컬럼: 활동 데이터 → 생애주기 단계 → Total PCF
- 좌측 활동명 textAnchor=end, 우측 단계 라벨 + 비중 %
- Link gradient: 단계 색의 0.45 → 0.7 opacity
- 활동 노드: 6px 너비 막대, fg-2
- 단계 노드: 24px 너비 막대, lifecycle 컬러
- Total 노드: 10px 너비, fg

## Status Pill (활동 데이터 상태)
- `검증완료` — pos
- `검토중` — warn
- `미매칭` — neg
- 모두 좌측에 4px dot

---

## Skeleton
- `linear-gradient` shimmer, 1.4s 애니메이션
- KPI 카드 스켈레톤: 라벨(90×10) / 값(130×24) / 추세(100% × 28)
- 차트 스켈레톤: 12개 막대를 random heights로 배치
- 테이블 스켈레톤: 5행, 컬럼별 너비 prop
- 절대 콘텐츠를 가짜로 채우지 않음 — shimmer만

## Empty State
- 48×48 라운드 아이콘 박스 (`bg-2 / fg-3`)
- 제목 14px / 600
- 설명 12px / `fg-3`, max 320px 가운데 정렬
- 액션 2개 (primary + default), 가운데 정렬

## Error State
- 좌측 36×36 라운드 아이콘 박스 (`neg-soft / neg`)
- "**무엇이 / 왜 / 어떻게 고치나**" 3단 구성 의무
- 요청 ID는 mono로 표기 (`req_8c2af`)
- 액션: 재시도(primary) + 상태 페이지(default) + 오류 ID 복사(ghost, 우측 정렬)

## Partial Failure State
- 헤더에 warn pill `부분 데이터` + `±x.x% 추정` ghost pill
- warn-soft 배경 박스에 누락 설명
- 액션: `누락 N건 보기` (primary sm) + `추정 방법론` (default sm)
