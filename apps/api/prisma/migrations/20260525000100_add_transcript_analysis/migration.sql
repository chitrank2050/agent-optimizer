-- CreateEnum
CREATE TYPE "analysis_outcome" AS ENUM ('SUCCESS', 'FAILURE', 'MISSED_OPPORTUNITY');

-- CreateTable
CREATE TABLE "transcript_analyses" (
    "id" UUID NOT NULL,
    "transcript_id" UUID NOT NULL,
    "outcome" "analysis_outcome" NOT NULL,
    "score" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "passed_criteria" JSONB NOT NULL DEFAULT '[]',
    "missed_criteria" JSONB NOT NULL DEFAULT '[]',
    "analyzed_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transcript_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "transcript_analyses_transcript_id_key" ON "transcript_analyses"("transcript_id");

-- CreateIndex
CREATE INDEX "transcript_analyses_outcome_score_idx" ON "transcript_analyses"("outcome", "score");

-- AddForeignKey
ALTER TABLE "transcript_analyses" ADD CONSTRAINT "transcript_analyses_transcript_id_fkey" FOREIGN KEY ("transcript_id") REFERENCES "transcripts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
