# AI 사용 내역

이 프로젝트에서 AI를 어떻게 썼고, 어디서 직접 판단했는지 정리한 문서입니다.

## 사용한 도구

- Claude Code (Sonnet 4.6 / Opus 4.7) — 메인 페어 프로그래머로 사용했습니다. 파일 수정과 명령 실행, 디버깅까지 모두 위임했습니다.
- Spec-Kit — `/speckit-specify`, `/plan`, `/tasks`, `/implement`로 코드 작성 전에 스펙·계획·태스크를 먼저 만들었습니다. 산출물은 `specs/001-pcf-dashboard/`에 1,023줄로 남아 있습니다.
- Claude Design — 한국 탄소회계 SaaS 톤의 디자인 토큰을 직접 만들어 `.claude/skills/pcfboard/`에 두었습니다.
- `/simplify` — 변경 코드를 재사용·품질·효율성 세 측면으로 셀프 리뷰하는 데 사용했습니다.


## AI를 활용한 부분

- SDD 산출물(spec, plan, tasks, data-model, OpenAPI 스펙) 초안
- Prisma 스키마, Route Handler, Recharts 컴포넌트 골격
- 인라인 스타일 → Tailwind, `useState` 다중 → `react-hook-form` 같은 반복 리팩토링
- 도메인 함수 단위 테스트(`pcf`, `scope`, `aggregate`, `excel`)


## 직접 결정한 것

- 차트 조합은 Stacked Bar(언제) + Sankey(어디서)로 결정했습니다. AI 첫 제안은 Pie + Line이었습니다.
- tCO₂e 스냅샷 저장을 도입했습니다. 배출계수가 매년 개정되는 한국 맥락(KEPCO·KEITI)을 반영해 입력 시점에 계산·저장하도록 했습니다.
- API Route는 `lib/api.ts`만 import하도록 구성했습니다. 가짜 백엔드에서 실제 DB로 교체할 때 한 파일만 수정하면 되도록 한 의도입니다.
- Excel 임포트는 트랜잭션 대신 행 단위 부분 성공으로 구현했습니다.
- 테스트는 도메인 함수만 100% 커버하고 API/UI는 수동 QA로 남겼습니다.



