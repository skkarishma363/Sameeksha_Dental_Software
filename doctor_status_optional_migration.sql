-- ============================================================================
-- Migration: Make doctors.status optional
-- Module: Settings -> Doctors -> Add / Edit Doctor
-- Description: Permits NULL values in the doctors.status column so that
--              status is purely optional when creating or updating doctors.
-- ============================================================================

-- 1. Drop the NOT NULL constraint on doctors.status
ALTER TABLE public.doctors ALTER COLUMN status DROP NOT NULL;

-- 2. Drop the existing CHECK constraint on doctors.status
ALTER TABLE public.doctors DROP CONSTRAINT IF EXISTS doctors_status_check;

-- 3. Re-add the CHECK constraint allowing NULL or any of the valid status states
ALTER TABLE public.doctors ADD CONSTRAINT doctors_status_check 
    CHECK (status IS NULL OR status IN ('Available', 'In Consultation', 'On Break', 'Finished Today'));
