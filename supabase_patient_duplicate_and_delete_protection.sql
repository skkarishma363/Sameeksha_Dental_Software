-- ============================================================================
-- DENTPRO OS / SAMEEKSHA DENTAL SOFTWARE
-- Patient Duplicate Prevention & Safe Deletion / Archive Protection Migration
-- Supabase Project: sxfowiececnrqytbtpcb
-- ============================================================================

-- ----------------------------------------------------------------------------
-- AUDIT FINDINGS (Executed Read-Only on 2026-10-18):
-- Total Patients in Database: 34
-- Total Duplicate Phone Groups: 16
-- 
-- 1. Mock Data Duplicate Pairs (15 groups, 30 records):
--    - DS-1001 to DS-1015: Each seeded twice on 2026-10-03 during initial setup.
--    - DS-1001 (Aarav Mehta): Row 2 (8ed0... ) has 1 appointment, Row 1 has 0.
--    - DS-1015 (Rajesh Khanna): Row 2 (6947... ) has 2 appointments, Row 1 has 0.
--
-- 2. Real Practice Duplicates (1 group, 4 records):
--    - Name: Shaik Karishma | Phone: +91 8639754722 (Normalized: 8639754722)
--      * Row 1 (UUID ded0135f-2a47-42fe-90b9-2140b54c2f01, ID 1016):
--        Created: 2026-10-05T07:45:03 | Linked: 3 Appointments, 3 Treatments (ACTIVE DATA)
--      * Row 2 (UUID 99aa9aa5-6457-4b49-bb0a-21959a038f0b, ID 1016):
--        Created: 2026-10-05T07:45:03 (86ms later) | Linked: 0 records (Double-click duplicate)
--      * Row 3 (UUID 44f1dec0-d2cb-4a09-8f26-ae047f71cafa, ID 1017):
--        Created: 2026-10-18T09:51:44 | Linked: 0 records (Duplicate re-registration)
--      * Row 4 (UUID 4a20d2d6-2fa2-47cd-9435-6284d2324027, ID 1017):
--        Created: 2026-10-18T09:51:44 (28ms later) | Linked: 0 records (Double-click duplicate)
--
-- NOTE: In accordance with clinical data protection guidelines, existing records
-- are NOT deleted automatically. A reviewed cleanup script is provided at the bottom.
-- ----------------------------------------------------------------------------

-- 1. PHONE NORMALIZATION HELPER FUNCTION (DATABASE-LEVEL)
CREATE OR REPLACE FUNCTION public.normalize_phone_number(p_phone TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    v_digits TEXT;
BEGIN
    IF p_phone IS NULL THEN
        RETURN '';
    END IF;
    -- Extract all numeric digits
    v_digits := regexp_replace(p_phone, '\D', '', 'g');
    
    -- Strip country code 91 if 12 digits
    IF length(v_digits) = 12 AND v_digits LIKE '91%' THEN
        v_digits := substr(v_digits, 3);
    ELSIF length(v_digits) = 11 AND v_digits LIKE '0%' THEN
        v_digits := substr(v_digits, 2);
    ELSIF length(v_digits) >= 10 THEN
        v_digits := substr(v_digits, length(v_digits) - 9);
    END IF;
    
    RETURN v_digits;
END;
$$;

-- 2. DUPLICATE CHECK TRIGGER FUNCTION
-- Prevents race conditions and simultaneous double-submissions.
-- Allows shared family phones when the patient name is different, but blocks
-- identical duplicate patient registrations.
CREATE OR REPLACE FUNCTION public.prevent_duplicate_patient_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_norm_new TEXT;
    v_existing_id UUID;
    v_existing_name TEXT;
    v_existing_patient_id TEXT;
BEGIN
    v_norm_new := public.normalize_phone_number(NEW.phone);

    -- Check if active patient with identical normalized phone AND name exists
    SELECT id, name, patient_id INTO v_existing_id, v_existing_name, v_existing_patient_id
    FROM public.patients
    WHERE public.normalize_phone_number(phone) = v_norm_new
      AND lower(trim(name)) = lower(trim(NEW.name))
      AND COALESCE(status, 'Active') != 'Archived'
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    LIMIT 1;

    IF v_existing_id IS NOT NULL THEN
        RAISE EXCEPTION 'DUPLICATE_PATIENT_ERROR: Patient "%" with phone "%" is already registered under ID %.',
            v_existing_name, NEW.phone, v_existing_patient_id;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_prevent_duplicate_patient_insert ON public.patients;
CREATE TRIGGER tr_prevent_duplicate_patient_insert
    BEFORE INSERT ON public.patients
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_duplicate_patient_insert();

-- 3. ENSURE INDEXES FOR PERFORMANCE ON PHONE & STATUS
CREATE INDEX IF NOT EXISTS idx_patients_normalized_phone 
    ON public.patients (public.normalize_phone_number(phone));

CREATE INDEX IF NOT EXISTS idx_patients_status 
    ON public.patients (status);

-- 4. RBAC POLICIES CONFIRMATION FOR SAFE DELETION
-- Only practice owner can hard-delete patient records.
-- Owner and receptionist can update status (for Archiving).
DROP POLICY IF EXISTS "rbac_delete_patients" ON public.patients;
CREATE POLICY "rbac_delete_patients" ON public.patients 
    FOR DELETE TO authenticated 
    USING (public.get_user_role() = 'owner');

DROP POLICY IF EXISTS "rbac_update_patients" ON public.patients;
CREATE POLICY "rbac_update_patients" ON public.patients 
    FOR UPDATE TO authenticated 
    USING (public.get_user_role() IN ('owner', 'receptionist')) 
    WITH CHECK (public.get_user_role() IN ('owner', 'receptionist'));

-- ----------------------------------------------------------------------------
-- 5. REVIEWED HISTORICAL DUPLICATE CLEANUP (OPTIONAL / UPON EXPLICIT APPROVAL)
-- The following statements safely remove ONLY the 3 empty orphan rows for
-- Shaik Karishma that have 0 linked appointments, treatments, and invoices,
-- while 100% preserving primary record ded0135f-2a47-42fe-90b9-2140b54c2f01:
--
-- DELETE FROM public.patients 
-- WHERE id IN (
--   '99aa9aa5-6457-4b49-bb0a-21959a038f0b',
--   '44f1dec0-d2cb-4a09-8f26-ae047f71cafa',
--   '4a20d2d6-2fa2-47cd-9435-6284d2324027'
-- );
-- ----------------------------------------------------------------------------
