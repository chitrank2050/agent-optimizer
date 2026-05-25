-- Phase 4 optimization loop persistence.
-- Generated test cases and recommendations use deterministic external keys so
-- rerunning the optimizer updates the current proposal set instead of creating
-- duplicate rows for the same agent.

CREATE TYPE "test_evaluation_status" AS ENUM ('PASS', 'FAIL', 'RISK');

ALTER TABLE "generated_test_cases"
  ADD COLUMN "external_key" VARCHAR(255),
  ADD COLUMN "source_pattern" VARCHAR(64);

UPDATE "generated_test_cases"
SET "external_key" = "id"::text
WHERE "external_key" IS NULL;

ALTER TABLE "generated_test_cases"
  ALTER COLUMN "external_key" SET NOT NULL;

CREATE TABLE "test_case_evaluations" (
  "id" UUID NOT NULL,
  "test_case_id" UUID NOT NULL,
  "status" "test_evaluation_status" NOT NULL,
  "score" INTEGER NOT NULL,
  "failed_criteria" JSONB NOT NULL DEFAULT '[]',
  "reasoning" TEXT NOT NULL,
  "evaluated_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "test_case_evaluations_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "recommendations"
  ADD COLUMN "external_key" VARCHAR(255);

UPDATE "recommendations"
SET "external_key" = "id"::text
WHERE "external_key" IS NULL;

ALTER TABLE "recommendations"
  ALTER COLUMN "external_key" SET NOT NULL;

CREATE UNIQUE INDEX "generated_test_cases_agent_id_external_key_key"
  ON "generated_test_cases"("agent_id", "external_key");

CREATE UNIQUE INDEX "test_case_evaluations_test_case_id_key"
  ON "test_case_evaluations"("test_case_id");

CREATE INDEX "test_case_evaluations_status_score_idx"
  ON "test_case_evaluations"("status", "score");

CREATE UNIQUE INDEX "recommendations_agent_id_external_key_key"
  ON "recommendations"("agent_id", "external_key");

ALTER TABLE "test_case_evaluations"
  ADD CONSTRAINT "test_case_evaluations_test_case_id_fkey"
  FOREIGN KEY ("test_case_id") REFERENCES "generated_test_cases"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
