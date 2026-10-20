-- ============================================================================
-- DENTPRO OS: STAFF-WISE MEDICINE DISTRIBUTION & DAILY RECONCILIATION MIGRATION
-- Module: Settings -> Stock / Medicine & Reports -> Medicine Stock
-- ============================================================================

-- 1. Performance Indexes for Medicine Stock & Movement Queries
CREATE INDEX IF NOT EXISTS idx_stock_transactions_created_at ON public.stock_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_type ON public.stock_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_med ON public.stock_transactions(medicine_id);

-- 2. Enhanced RLS Policies for Staff Medicine Operations
-- Permits authorized clinic personnel (Owner, Receptionist, Clinical Staff)
-- to log stock distributions, sales, and daily reconciliations
DROP POLICY IF EXISTS "allow_read_stock_transactions" ON public.stock_transactions;
CREATE POLICY "allow_read_stock_transactions" ON public.stock_transactions
    FOR SELECT TO authenticated
    USING (public.get_user_role() IN ('owner', 'receptionist'));

DROP POLICY IF EXISTS "allow_write_stock_transactions" ON public.stock_transactions;
CREATE POLICY "allow_write_stock_transactions" ON public.stock_transactions
    FOR ALL TO authenticated
    USING (public.get_user_role() IN ('owner', 'receptionist'))
    WITH CHECK (public.get_user_role() IN ('owner', 'receptionist'));

-- 3. Documented JSON Metadata Structure for stock_transactions.notes:
-- {
--   "staff_id": "UUID / string",
--   "staff_name": "string",
--   "action_type": "issued_to_staff" | "sold" | "used_in_treatment" | "returned_from_staff" | "damaged_expired" | "adjustment" | "received",
--   "supplier_name": "string",
--   "batch_number": "string",
--   "expiry_date": "YYYY-MM-DD",
--   "unit_price": number,
--   "total_amount": number,
--   "patient_name": "string",
--   "patient_id": "string",
--   "invoice_ref": "string",
--   "payment_status": "Paid" | "Unpaid" | "Included in Procedure" | "N/A",
--   "actual_closing_stock": number,
--   "reason": "string",
--   "recorded_by": "string",
--   "timestamp": "TIMESTAMPTZ ISO string"
-- }
