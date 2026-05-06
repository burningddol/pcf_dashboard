-- 1. factorValue 컬럼 추가 (nullable로 시작)
ALTER TABLE "Activity" ADD COLUMN "factorValue" DOUBLE PRECISION;

-- 2. 기존 활동의 factorValue를 EmissionFactor.value로 백필
UPDATE "Activity" a
SET "factorValue" = f."value"
FROM "EmissionFactor" f
WHERE a."factorId" = f."id";

-- 3. NOT NULL 제약 추가 (백필 후)
ALTER TABLE "Activity" ALTER COLUMN "factorValue" SET NOT NULL;
