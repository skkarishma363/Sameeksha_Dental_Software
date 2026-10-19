import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminClient = createClient(SUPABASE_URL, SERVICE_KEY);
const anonClient = createClient(SUPABASE_URL, ANON_KEY);

async function runTestSuite() {
  console.log('=== STARTING AUTOMATED DATABASE PERSISTENCE VERIFICATION ===');
  let failures = 0;

  // 1. Test Authenticated User Session
  console.log('\n[TEST 1] Authenticating Owner User Session...');
  const { data: linkData, error: linkErr } = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email: 'sameekshadentalhospital@gmail.com'
  });
  if (linkErr || !linkData?.properties?.hashed_token) {
    console.error('❌ Failed to generate magic link:', linkErr);
    process.exit(1);
  }

  const authClient = createClient(SUPABASE_URL, ANON_KEY);
  const { data: sessionData, error: sessionErr } = await authClient.auth.verifyOtp({
    token_hash: linkData.properties.hashed_token,
    type: 'magiclink'
  });
  if (sessionErr || !sessionData?.session) {
    console.error('❌ Failed to verify user session:', sessionErr);
    process.exit(1);
  }
  console.log('✅ Authenticated as Owner successfully.');

  // Get test patient
  const { data: pts } = await authClient.from('patients').select('id, patient_id, name, balance').limit(1);
  const testPatient = pts[0];
  console.log(`Using Patient: ${testPatient.name} (${testPatient.patient_id}) [UUID: ${testPatient.id}]`);

  // 2. Test Invoice Creation Lifecycle
  console.log('\n[TEST 2] Testing Invoice Header, Line Items, and Payments Persistence...');
  const testInvNumber = `INV-TEST-${Date.now().toString().slice(-4)}`;
  const subtotal = 1200;
  const discount = 10;
  const total = 1080;
  const paid = 500;

  // Insert Header
  const { data: invHeader, error: invHeaderErr } = await authClient
    .from('invoices')
    .insert({
      invoice_id: testInvNumber,
      patient_id: testPatient.id,
      subtotal: subtotal,
      discount: discount,
      discount_type: 'percentage',
      discount_value: discount,
      tax: 0,
      total: total,
      status: 'Partially Paid'
    })
    .select()
    .single();

  if (invHeaderErr || !invHeader) {
    console.error('❌ Failed to insert invoice header:', invHeaderErr);
    failures++;
  } else {
    console.log(`✅ Invoice header saved in 'invoices' table. ID: ${invHeader.id}, Number: ${invHeader.invoice_id}`);

    // Insert Line Items
    const { data: lineItems, error: lineItemsErr } = await authClient
      .from('invoice_items')
      .insert([
        {
          invoice_id: invHeader.id,
          description: 'Composite Restoration',
          quantity: 1,
          unit_price: 1200,
          amount: 1200
        }
      ])
      .select();

    if (lineItemsErr || !lineItems || lineItems.length === 0) {
      console.error('❌ Failed to insert invoice items:', lineItemsErr);
      failures++;
    } else {
      console.log(`✅ Invoice items saved in 'invoice_items' table referencing ${lineItems[0].invoice_id}`);
    }

    // Insert Payment
    const { data: paymentRow, error: payErr } = await authClient
      .from('payments')
      .insert({
        invoice_id: invHeader.id,
        patient_id: testPatient.id,
        amount: paid,
        payment_method: 'UPI',
        payment_date: new Date().toISOString().split('T')[0],
        notes: 'Test split payment'
      })
      .select()
      .single();

    if (payErr || !paymentRow) {
      console.error('❌ Failed to insert payment row:', payErr);
      failures++;
    } else {
      console.log(`✅ Payment record saved in 'payments' table. Amount: ₹${paymentRow.amount}, Method: ${paymentRow.payment_method}`);
    }

    // 3. Test Retrieval with Relational Join (Simulating Page Refresh)
    console.log('\n[TEST 3] Testing Relational Retrieval After Refresh...');
    const { data: fetchedInvoices, error: fetchErr } = await authClient
      .from('invoices')
      .select('*, invoice_items(*), payments(*), patients(id, patient_id, name)')
      .eq('id', invHeader.id)
      .single();

    if (fetchErr || !fetchedInvoices) {
      console.error('❌ Failed to retrieve invoice after refresh:', fetchErr);
      failures++;
    } else {
      const lineItemCount = fetchedInvoices.invoice_items?.length || 0;
      const paymentCount = fetchedInvoices.payments?.length || 0;
      const totalPaid = fetchedInvoices.payments?.reduce((acc, p) => acc + Number(p.amount), 0) || 0;
      console.log(`✅ Relational Invoice Retrieval Verified:`);
      console.log(`   - Invoice ID: ${fetchedInvoices.invoice_id}`);
      console.log(`   - Total: ₹${fetchedInvoices.total}`);
      console.log(`   - Line items attached: ${lineItemCount} (Item: ${fetchedInvoices.invoice_items[0]?.description})`);
      console.log(`   - Payments attached: ${paymentCount} (Total Paid: ₹${totalPaid})`);
      console.log(`   - Patient Linked: ${fetchedInvoices.patients?.name} (${fetchedInvoices.patients?.patient_id})`);
    }

    // 4. Test Update Payment Status to Paid
    console.log('\n[TEST 4] Testing Invoice Settlement (Mark Paid)...');
    const { error: markPaidErr } = await authClient
      .from('invoices')
      .update({ status: 'Paid', updated_at: new Date().toISOString() })
      .eq('id', invHeader.id);

    if (markPaidErr) {
      console.error('❌ Failed to update invoice status:', markPaidErr);
      failures++;
    } else {
      console.log(`✅ Invoice status updated to Paid.`);
    }

    // Clean up test invoice (cascades to invoice_items and payments)
    await adminClient.from('invoices').delete().eq('id', invHeader.id);
    console.log(`🧹 Cleaned up test invoice and related rows.`);
  }

  // 5. Test Unauthorized Requests Rejected
  console.log('\n[TEST 5] Testing Unauthorized (Anon) Request Rejection...');
  const { error: anonInvErr } = await anonClient
    .from('invoices')
    .insert({
      invoice_id: 'UNAUTHORIZED-TEST',
      subtotal: 500,
      total: 500
    });

  if (anonInvErr) {
    console.log(`✅ Unauthorized invoice insert correctly rejected by RLS: [${anonInvErr.code}] ${anonInvErr.message}`);
  } else {
    console.error('❌ Security Violation: Anon was able to insert an invoice!');
    failures++;
  }

  // 6. Test Clinic Settings Persistence
  console.log('\n[TEST 6] Testing Clinic Settings Persistence & Retrieval...');
  const { data: initialSettings } = await authClient.from('clinic_settings').select('*').single();
  const testName = 'Sameeksha Dental Hospital - Test';
  const { error: setUpdateErr } = await authClient
    .from('clinic_settings')
    .update({ clinic_name: testName, updated_at: new Date().toISOString() })
    .eq('id', initialSettings.id);

  if (setUpdateErr) {
    console.error('❌ Failed to update clinic settings:', setUpdateErr);
    failures++;
  } else {
    const { data: reloadedSettings } = await authClient.from('clinic_settings').select('*').single();
    if (reloadedSettings?.clinic_name === testName) {
      console.log(`✅ Clinic settings successfully persisted to DB and retrieved: "${reloadedSettings.clinic_name}"`);
    } else {
      console.error('❌ Clinic settings mismatch after refresh.');
      failures++;
    }
    // Restore
    await authClient.from('clinic_settings').update({ clinic_name: initialSettings.clinic_name }).eq('id', initialSettings.id);
    console.log(`🧹 Restored original clinic settings.`);
  }

  // 7. Test Clinical Notes Table Persistence
  console.log('\n[TEST 7] Testing Clinical Notes Table Relational Persistence...');
  const { data: insertedNote, error: noteErr } = await authClient
    .from('clinical_notes')
    .insert({
      patient_id: testPatient.id,
      author_name: 'Dr. Test',
      title: 'Routine Examination',
      category: 'General',
      content: 'Healthy gingiva, no calculus detected.'
    })
    .select()
    .single();

  if (noteErr || !insertedNote) {
    console.error('❌ Failed to insert into clinical_notes:', noteErr);
    failures++;
  } else {
    console.log(`✅ Clinical note saved to 'clinical_notes' table with ID: ${insertedNote.id}`);
    await adminClient.from('clinical_notes').delete().eq('id', insertedNote.id);
    console.log(`🧹 Cleaned up test clinical note.`);
  }

  // 8. Test Prescriptions Table Persistence
  console.log('\n[TEST 8] Testing Prescriptions Table Relational Persistence...');
  const { data: insertedPresc, error: prescErr } = await authClient
    .from('prescriptions')
    .insert({
      patient_id: testPatient.id,
      prescription_date: new Date().toISOString().split('T')[0],
      diagnosis: 'Gingivitis',
      advice: 'Warm saline rinse',
      medicines: [{ name: 'Amoxicillin 500mg', dosage: '1-0-1', duration: '5 days' }]
    })
    .select()
    .single();

  if (prescErr || !insertedPresc) {
    console.error('❌ Failed to insert into prescriptions:', prescErr);
    failures++;
  } else {
    console.log(`✅ Prescription saved to 'prescriptions' table with ID: ${insertedPresc.id}`);
    await adminClient.from('prescriptions').delete().eq('id', insertedPresc.id);
    console.log(`🧹 Cleaned up test prescription.`);
  }

  console.log('\n=============================================================');
  if (failures === 0) {
    console.log('🎉 ALL PERSISTENCE TESTS PASSED (8/8). DATABASE INTEGRITY VERIFIED.');
  } else {
    console.error(`⚠️ ${failures} TEST(S) FAILED.`);
    process.exit(1);
  }
}

runTestSuite();
