-- ============================================================================
-- DENTPRO OS / SAMEEKSHA DENTAL SOFTWARE
-- Patient Status Check Constraint Migration
-- Supabase Project: sxfowiececnrqytbtpcb
--
-- PURPOSE:
-- Updates the patients_status_check constraint on public.patients table to
-- permit 'Archived' alongside 'Active' and 'Inactive'.
-- Preserves all existing records and maintains strict database-level validation.
-- ============================================================================

-- 1. Drop existing inline check constraint
ALTER TABLE public.patients DROP CONSTRAINT IF EXISTS patients_status_check;

-- 2. Re-create constraint permitting 'Active', 'Inactive', and 'Archived'
ALTER TABLE public.patients 
  ADD CONSTRAINT patients_status_check 
  CHECK (status IN ('Active', 'Inactive', 'Archived'));

-- 3. Ensure index exists for performance when filtering by status
CREATE INDEX IF NOT EXISTS idx_patients_status ON public.patients (status);
