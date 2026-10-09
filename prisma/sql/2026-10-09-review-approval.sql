-- Reviews need an admin's approval before they're public.
-- Additive and safe to run while the old code is live: existing reviews keep
-- their status (PUBLISHED); only new rows default to PENDING.
ALTER TABLE "Review" ADD COLUMN IF NOT EXISTS "moderatedAt" TIMESTAMP(3);
ALTER TABLE "Review" ALTER COLUMN "status" SET DEFAULT 'PENDING';
CREATE INDEX IF NOT EXISTS "Review_status_createdAt_idx" ON "Review"("status", "createdAt");
