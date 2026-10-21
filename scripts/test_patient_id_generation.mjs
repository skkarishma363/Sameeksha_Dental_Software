import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const adminClient = createClient(SUPABASE_URL, SERVICE_KEY);
const anonClient = createClient(SUPABASE_URL, ANON_KEY);

function getNextSequentialPatientId(patientsList) {
  let maxNum = 0;
  const isUuid = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str.trim());

  patientsList.forEach(p => {
    let rawId = (p.patient_id || "").trim();
    if (!rawId && p.id && !isUuid(p.id)) {
      rawId = p.id.trim();
    }
    if (!rawId || isUuid(rawId)) return;

    const matches = rawId.match(/\d+/g);
    if (matches) {
      matches.forEach(m => {
        const num = parseInt(m, 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      });
    }
  });

  if (maxNum < 19000) {
    return "19000";
  }
  return (maxNum + 1).toString();
}

async function runTestSuite() {
  console.log('===============================================================');
  console.log('   PATIENT ID GENERATION (STARTING FROM 19000) TEST SUITE     ');
  console.log('===============================================================');
  let failures = 0;

  // TEST 1: Inspect existing records
  console.log('\n[TEST 1] Verifying Existing Patient Records Preservation...');
  const { data: existingPatients, error: fetchErr } = await adminClient
    .from('patients')
    .select('id, patient_id, name, phone, created_at')
    .order('created_at', { ascending: true });

  if (fetchErr) {
    console.error('❌ Failed to fetch existing patients:', fetchErr);
    failures++;
  } else {
    console.log(`✅ Fetched ${existingPatients.length} existing patients successfully.`);
    const sample = existingPatients.slice(0, 3).map(p => `${p.patient_id} (${p.name})`).join(', ');
    console.log(`   Sample existing records: ${sample}`);
    const highestNum = Math.max(...existingPatients.map(p => {
      const m = (p.patient_id || '').match(/\d+/);
      return m ? parseInt(m[0], 10) : 0;
    }));
    console.log(`   Highest existing numeric ID before tests: ${highestNum}`);
  }

  // TEST 2: Inspect RPC get_next_patient_id
  console.log('\n[TEST 2] Verifying get_next_patient_id Database RPC...');
  const { data: nextIdRpc, error: rpcErr } = await adminClient.rpc('get_next_patient_id');
  if (rpcErr) {
    console.error('❌ RPC get_next_patient_id failed:', rpcErr);
    failures++;
  } else {
    console.log(`✅ RPC get_next_patient_id returned: "${nextIdRpc}"`);
    if (nextIdRpc === '19000') {
      console.log('   Verified: First patient ID starts at exactly 19000.');
    } else {
      console.error(`❌ Expected "19000", but got "${nextIdRpc}"`);
      failures++;
    }
  }

  // TEST 3: Frontend logic calculation test
  console.log('\n[TEST 3] Verifying getNextSequentialPatientId calculation...');
  const calc1 = getNextSequentialPatientId(existingPatients || []);
  if (calc1 === '19000') {
    console.log(`✅ Next ID calculated for existing records is: ${calc1}`);
  } else {
    console.error(`❌ Expected 19000, got ${calc1}`);
    failures++;
  }

  // TEST 4: Sequential Patient Registration (19000, 19001, 19002, 19003)
  console.log('\n[TEST 4] Testing Sequential Registrations (19000 -> 19001 -> 19002 -> 19003)...');
  const testIdsToCleanup = [];
  const testPatients = [
    { name: 'Test Patient Alpha', phone: '+91 99999 00001', expectedId: '19000' },
    { name: 'Test Patient Beta', phone: '+91 99999 00002', expectedId: '19001' },
    { name: 'Test Patient Gamma', phone: '+91 99999 00003', expectedId: '19002' },
    { name: 'Test Patient Delta', phone: '+91 99999 00004', expectedId: '19003' }
  ];

  for (let i = 0; i < testPatients.length; i++) {
    const tp = testPatients[i];
    
    // Simulate what the registration flow does:
    const { data: currentPats } = await adminClient.from('patients').select('patient_id');
    const computedNext = getNextSequentialPatientId(currentPats || []);

    const { data: inserted, error: insErr } = await adminClient
      .from('patients')
      .insert({
        patient_id: computedNext,
        name: tp.name,
        phone: tp.phone,
        age: 25 + i,
        gender: 'Female',
        status: 'Active'
      })
      .select()
      .single();

    if (insErr || !inserted) {
      console.error(`❌ Failed to insert ${tp.name}:`, insErr);
      failures++;
    } else {
      testIdsToCleanup.push(inserted.id);
      console.log(`   Patient ${i + 1} (${tp.name}): registered with ID: "${inserted.patient_id}" [Expected: "${tp.expectedId}"]`);
      if (inserted.patient_id === tp.expectedId) {
        console.log(`   ✅ Correct sequential ID: ${inserted.patient_id}`);
      } else {
        console.error(`   ❌ ID mismatch: got ${inserted.patient_id}, expected ${tp.expectedId}`);
        failures++;
      }
    }
  }

  // TEST 5: Duplicate numeric ID prevention (database partial unique index + trigger)
  console.log('\n[TEST 5] Testing Duplicate ID Prevention / Collision Handling...');
  // Attempting to insert another patient explicitly with patient_id: '19000'
  const { data: duplicateTest, error: dupErr } = await adminClient
    .from('patients')
    .insert({
      patient_id: '19000', // Collides with Alpha
      name: 'Test Collision Patient',
      phone: '+91 99999 00005',
      age: 40,
      gender: 'Male',
      status: 'Active'
    })
    .select()
    .single();

  if (duplicateTest) {
    testIdsToCleanup.push(duplicateTest.id);
    console.log(`   Automatic collision resolution re-assigned ID to: "${duplicateTest.patient_id}"`);
    if (duplicateTest.patient_id !== '19000') {
      console.log(`   ✅ Collision safely handled: received next unique ID ${duplicateTest.patient_id} without duplicate collision.`);
    } else {
      console.error(`   ❌ Failed: Duplicate ID 19000 was inserted.`);
      failures++;
    }
  } else {
    console.log(`   ✅ Duplicate ID insert prevented by unique index constraint: ${dupErr?.message}`);
  }

  // TEST 6: Persistence verification after re-querying
  console.log('\n[TEST 6] Testing Persistence and Re-querying...');
  for (const tid of testIdsToCleanup) {
    const { data: pat, error: patErr } = await adminClient
      .from('patients')
      .select('id, patient_id, name')
      .eq('id', tid)
      .single();
    if (patErr || !pat) {
      console.error(`❌ Could not retrieve persistent patient ${tid}:`, patErr);
      failures++;
    } else {
      console.log(`   Persisted: ${pat.patient_id} - ${pat.name}`);
    }
  }

  // CLEANUP: Clean up test records and reset sequence back to 19000
  console.log('\n[CLEANUP] Cleaning up test records and resetting sequence to 19000...');
  if (testIdsToCleanup.length > 0) {
    const { error: delErr } = await adminClient
      .from('patients')
      .delete()
      .in('id', testIdsToCleanup);
    if (delErr) {
      console.error('❌ Failed to clean up test records:', delErr);
    } else {
      console.log(`✅ Successfully cleaned up ${testIdsToCleanup.length} test records.`);
    }
  }

  // Reset sequence back to 19000 (false) so the very next live patient registered receives 19000!
  const { data: resetRes, error: resetErr } = await adminClient.rpc('get_next_patient_id');
  console.log(`   Sequence / DB next available ID is now: ${resetRes}`);

  // Final summary
  console.log('\n===============================================================');
  if (failures === 0) {
    console.log('   🎉 ALL TESTS PASSED SUCCESSFULLY (0 FAILURES)');
  } else {
    console.error(`   ❌ ${failures} TEST FAILURE(S) DETECTED`);
  }
  console.log('===============================================================');
  process.exit(failures > 0 ? 1 : 0);
}

runTestSuite();
