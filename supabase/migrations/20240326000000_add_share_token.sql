-- Add shareToken column to compatibility_results table
ALTER TABLE "compatibility_results" ADD COLUMN "share_token" text;
CREATE UNIQUE INDEX "compatibility_results_share_token_idx" ON "compatibility_results" ("share_token"); 