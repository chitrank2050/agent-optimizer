-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "recommendation_target" AS ENUM ('PROMPT', 'TEMPERATURE', 'MODEL', 'TOOL', 'ACTION', 'KNOWLEDGE_BASE', 'GUARDRAIL');

-- CreateEnum
CREATE TYPE "recommendation_status" AS ENUM ('PROPOSED', 'APPROVED', 'REJECTED', 'APPLIED');

-- CreateEnum
CREATE TYPE "test_path_type" AS ENUM ('HAPPY_PATH', 'EDGE_CASE');

-- CreateEnum
CREATE TYPE "finding_severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "tenants" (
    "id" UUID NOT NULL,
    "ghl_company_id" VARCHAR(128) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "ghl_location_id" VARCHAR(128),
    "name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agents" (
    "id" UUID NOT NULL,
    "location_id" UUID NOT NULL,
    "ghl_agent_id" VARCHAR(128) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "model" VARCHAR(128) NOT NULL,
    "temperature" DECIMAL(3,2) NOT NULL DEFAULT 0.40,
    "prompt" TEXT NOT NULL,
    "tools" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transcripts" (
    "id" UUID NOT NULL,
    "agent_id" UUID NOT NULL,
    "ghl_call_id" VARCHAR(128) NOT NULL,
    "contact_id" VARCHAR(128),
    "call_started_at" TIMESTAMP(3) NOT NULL,
    "summary" TEXT,
    "turns" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transcripts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transcript_findings" (
    "id" UUID NOT NULL,
    "transcript_id" UUID NOT NULL,
    "category" VARCHAR(64) NOT NULL,
    "severity" "finding_severity" NOT NULL,
    "evidence" TEXT NOT NULL,
    "recommendation_hint" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transcript_findings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generated_test_cases" (
    "id" UUID NOT NULL,
    "agent_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "scenario" TEXT NOT NULL,
    "path_type" "test_path_type" NOT NULL,
    "success_criteria" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "generated_test_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendations" (
    "id" UUID NOT NULL,
    "agent_id" UUID NOT NULL,
    "target" "recommendation_target" NOT NULL,
    "status" "recommendation_status" NOT NULL DEFAULT 'PROPOSED',
    "title" VARCHAR(255) NOT NULL,
    "before_value" TEXT NOT NULL,
    "after_value" TEXT NOT NULL,
    "reasoning" TEXT NOT NULL,
    "evidence_ids" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_ghl_company_id_key" ON "tenants"("ghl_company_id");

-- CreateIndex
CREATE UNIQUE INDEX "locations_ghl_location_id_key" ON "locations"("ghl_location_id");

-- CreateIndex
CREATE INDEX "locations_tenant_id_idx" ON "locations"("tenant_id");

-- CreateIndex
CREATE INDEX "agents_location_id_idx" ON "agents"("location_id");

-- CreateIndex
CREATE UNIQUE INDEX "agents_location_id_ghl_agent_id_key" ON "agents"("location_id", "ghl_agent_id");

-- CreateIndex
CREATE UNIQUE INDEX "transcripts_ghl_call_id_key" ON "transcripts"("ghl_call_id");

-- CreateIndex
CREATE INDEX "transcripts_agent_id_call_started_at_idx" ON "transcripts"("agent_id", "call_started_at" DESC);

-- CreateIndex
CREATE INDEX "transcript_findings_transcript_id_idx" ON "transcript_findings"("transcript_id");

-- CreateIndex
CREATE INDEX "transcript_findings_category_severity_idx" ON "transcript_findings"("category", "severity");

-- CreateIndex
CREATE INDEX "generated_test_cases_agent_id_path_type_idx" ON "generated_test_cases"("agent_id", "path_type");

-- CreateIndex
CREATE INDEX "recommendations_agent_id_status_idx" ON "recommendations"("agent_id", "status");

-- CreateIndex
CREATE INDEX "recommendations_target_idx" ON "recommendations"("target");

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agents" ADD CONSTRAINT "agents_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transcripts" ADD CONSTRAINT "transcripts_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transcript_findings" ADD CONSTRAINT "transcript_findings_transcript_id_fkey" FOREIGN KEY ("transcript_id") REFERENCES "transcripts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_test_cases" ADD CONSTRAINT "generated_test_cases_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
