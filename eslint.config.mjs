import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  {
    files: ["src/components/**/*.{ts,tsx}", "src/app/**/*.{ts,tsx}"],
    ignores: ["src/app/api/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/lib/db/*", "../lib/db/*", "../../lib/db/*"],
              message:
                "클라이언트에서 store 직접 접근 금지. src/lib/api/client.ts 의 fetch wrapper 를 사용하세요 (헌법 VII).",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
