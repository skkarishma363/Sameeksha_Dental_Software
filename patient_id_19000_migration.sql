-- ============================================================================
-- DENTPRO OS / SAMEEKSHA DENTAL SOFTWARE
-- Patient ID Sequence & Generation Migration: Start from 19000
-- Supabase Project: sxfowiececnrqytbtpcb
-- ============================================================================

-- 1. Ensure public.patient_id_seq starts at 19000 (or MAX(numeric ID >= 19000) + 1)
DO $$
DECLARE
    v_max_id BIGINT;
    v_start_id BIGINT := 19000;
BEGIN
    -- Find highest existing numeric ID in patients table
    SELECT COALESCE(MAX(substring(patient_id FROM '[0-9]+')::BIGINT), 0)
    INTO v_max_id
    FROM public.patients
    WHERE patient_id ~ '[0-9]+';

    -- If any IDs >= 19000 already exist, continue after the highest one
    IF v_max_id >= 19000 THEN
        v_start_id := v_max_id + 1;
    END IF;

    -- Create sequence if not exists, starting at 19000
    IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'patient_id_seq') THEN
        CREATE SEQUENCE public.patient_id_seq START WITH 19000;
    END IF;

    -- Set the sequence to v_start_id with is_called = false
    -- This guarantees that the very next nextval('public.patient_id_seq') will return exactly v_start_id
    PERFORM setval('public.patient_id_seq', v_start_id, false);
END $$;

-- 2. Update trigger function to atomically generate sequential Patient IDs
-- Ensures concurrency safety, prevents duplicate IDs, and supports automatic assignment
CREATE OR REPLACE FUNCTION public.generate_patient_id()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_assigned_id TEXT;
BEGIN
    -- If patient_id is not provided, is blank, or is 'AUTO', assign next sequence value
    IF NEW.patient_id IS NULL OR TRIM(NEW.patient_id) = '' OR UPPER(TRIM(NEW.patient_id)) = 'AUTO' THEN
        NEW.patient_id := nextval('public.patient_id_seq')::text;
    ELSE
        -- If a patient_id was supplied (e.g., from frontend preview), check if it collides with an existing patient
        IF EXISTS (
            SELECT 1 FROM public.patients 
            WHERE patient_id = NEW.patient_id 
              AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
        ) THEN
            -- Reassign next unique ID from sequence to prevent concurrency duplicate
            LOOP
                v_assigned_id := nextval('public.patient_id_seq')::text;
                EXIT WHEN NOT EXISTS (
                    SELECT 1 FROM public.patients 
                    WHERE patient_id = v_assigned_id 
                      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
                );
            END LOOP;
            NEW.patient_id := v_assigned_id;
        ELSE
            -- If valid numeric ID >= 19000 was inserted, advance sequence so future IDs don't collide
            IF NEW.patient_id ~ '^[0-9]+$' AND NEW.patient_id::BIGINT >= 19000 THEN
                PERFORM setval(
                    'public.patient_id_seq', 
                    GREATEST(NEW.patient_id::BIGINT + 1, (SELECT last_value FROM public.patient_id_seq)), 
                    false
                );
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- 3. Re-create trigger on patients table
DROP TRIGGER IF EXISTS tr_generate_patient_id ON public.patients;
CREATE TRIGGER tr_generate_patient_id
    BEFORE INSERT ON public.patients
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_patient_id();

-- 4. Create RPC function to safely inspect the next available Patient ID without burning sequence numbers
CREATE OR REPLACE FUNCTION public.get_next_patient_id()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_max_id BIGINT;
BEGIN
    SELECT COALESCE(MAX(substring(patient_id FROM '[0-9]+')::BIGINT), 0)
    INTO v_max_id
    FROM public.patients
    WHERE patient_id ~ '[0-9]+';

    IF v_max_id < 19000 THEN
        RETURN '19000';
    ELSE
        RETURN (v_max_id + 1)::TEXT;
    END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_next_patient_id() TO anon, authenticated, service_role;

-- 5. Add partial unique index on numeric patient IDs >= 19000
-- Preserves all existing historical records (including duplicates DS-1001..1015, 1016, 1017)
-- while guaranteeing 100% database-level uniqueness for all new IDs starting from 19000
CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_unique_numeric_id
    ON public.patients (patient_id)
    WHERE (patient_id ~ '^[0-9]+$' AND (patient_id)::numeric >= 19000);
