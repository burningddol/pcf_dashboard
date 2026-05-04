# PCF Dashboard Constitution

본 문서는 하나루프 PCF 대시보드 채용과제 구현 시 따르는 4가지 핵심 원칙과
개발 워크플로우를 정의한다. 모든 코드·설계 결정은 이 원칙에 부합해야 한다.

---

## 핵심 원칙

### 1. 도메인 정확성 (Domain Correctness)

PCF(Product Carbon Footprint)와 GHG Scope는 이 과제의 본질이다.

- 모든 배출량 숫자는 단위와 함께 표기한다 — `tCO₂e`, `kgCO₂e/kWh` 등
- PCF 계산식은 단일 함수 `computeTCO2e(amount, factor)` 한 곳에만 존재한다
  → `kgCO₂e = amount × factor`, 표시 단위로 환산 시 `÷ 1000` (tCO₂e)
- 활동 유형은 코드 레벨 상수로 Scope에 매핑한다 — UI 추론 금지
  - `electricity` → Scope 2
  - `plastic1`, `plastic2`, `transport` → Scope 3
- 배출계수는 버전이 있는 데이터로 다룬다. 활동 데이터는 적용 시점의 `factorId`를
  보존하여 계수가 갱신되어도 과거 계산이 흔들리지 않게 한다.

### 2. 상태 처리 (Loading / Error / Empty)

데이터에 의존하는 모든 화면은 3가지 상태를 명시적으로 처리한다.

- **Loading** — 스켈레톤 또는 명확한 진행 표시
- **Error** — 오류 메시지 + 재시도 액션 (가짜 백엔드는 15% 실패)
- **Empty** — 아직 데이터가 없거나 필터 결과가 비었을 때의 안내

상태 분기는 컴포넌트 상단의 guard clause로 처리하고, "데이터가 있다고 가정한"
렌더 경로를 따로 분리한다.

### 3. 레이어 분리 (Separation of Concerns)

세 레이어가 서로의 책임을 침범하지 않는다.

- **도메인 순수 함수** (`src/lib/domain/*`) — 입력 → 출력. 사이드 이펙트 없음.
  PCF 계산, Scope 매핑, 월별/소스별 집계가 여기에 산다.
- **가짜 백엔드** (`src/lib/api.ts`) — 메모리 시드 데이터, 200~800ms 지연,
  쓰기 15% 실패. 도메인 함수를 호출해 응답을 만든다.
- **UI 컴포넌트** (`src/components/*`, `src/app/*`) — 렌더링과 인터랙션.
  비즈니스 계산을 직접 하지 않는다. 도메인 함수와 SWR 훅을 통해 데이터를 받는다.

### 4. 읽기 쉬운 코드 (Readability)

- 최상위 함수에는 명시적 반환 타입을 선언한다
- `any` 금지. 모르겠으면 `unknown` 후 좁힌다
- 함수는 단일 책임만 진다. 복잡해지면 헬퍼로 추출한다
- 중첩 깊이 2단계 이내. early return으로 평탄화한다
- "무엇"이 아니라 "왜"를 설명하는 주석만 허용한다 — 단, 주석은 최후 수단이다

---

## 개발 워크플로우

### 커밋 규칙

작은 단위로 자주 커밋하되, prefix를 통해 의도를 드러낸다.

- `feat:` 새 기능 (사용자가 보는 변화)
- `fix:` 버그 수정
- `test:` 테스트 추가·수정
- `docs:` README, 주석, 본 SDD 문서 변경
- `refactor:` 동작 변경 없는 코드 개선
- `chore:` 의존성·설정

기능 단위로 완성된 시점에 커밋한다 — 빌드가 깨지거나 타입이 안 맞는 중간 상태를
원격에 올리지 않는다.

### 작업 흐름

1. `spec.md`의 Acceptance Scenario 한 개를 잡는다
2. 도메인 함수가 필요하면 `lib/domain/*`부터 작성하고 Vitest로 검증한다
3. API → SWR 훅 → UI 순으로 위에서 아래로 연결한다
4. 3상태(Loading/Error/Empty)를 마지막에 끼워넣지 말고 같이 만든다
5. 수동 QA 시나리오를 한 번 돌리고 커밋한다

### 테스트 범위

핵심 도메인 함수 — `computeTCO2e`, `mapToScope`, `aggregateByMonth`,
`aggregateBySource` — 만 Vitest로 단위 테스트한다. UI 시각 회귀나 통합 테스트는
이번 과제 범위가 아니다.
