// Quick one-shot script to insert a few demo records into Supabase.
// Run with: node ops/supabase/seed_demo.js
// Uses the same anon key / temp-open RLS as the live dashboard.

const SUPABASE_URL = "https://ojldfskttumqseyccsks.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_6fAMDV9znJAWxe72fdzx8g_CpFNT28Q";

async function post(table, rows) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation"
    },
    body: JSON.stringify(rows)
  });
  const body = await res.text();
  if (!res.ok) {
    console.error(`FAIL ${table}: ${res.status} ${body}`);
  } else {
    const data = JSON.parse(body);
    console.log(`OK ${table}: inserted ${data.length} row(s)`);
    data.forEach(r => console.log(`  - ${r.code || r.name || r.id}`));
  }
}

async function main() {
  // --- 2 new enquiries (stage 0 = Quote Requested) ---
  await post("jobs", [
    {
      code: "DZR-J-1043",
      client_name: "Emaar Properties",
      client_contact: "Rashed Al Maktoum",
      vendor_name: "— unassigned",
      driver: "— unassigned",
      route: "Dubai Creek Harbour",
      type: "Crane, 100t",
      stage: 0,
      price: "—",
      flagged: false,
      vertical: "equipment"
    },
    {
      code: "DZR-J-1044",
      client_name: "DP World",
      client_contact: "Fatima Hussain",
      vendor_name: "— unassigned",
      driver: "— unassigned",
      route: "Jebel Ali → Abu Dhabi ICAD",
      type: "Low-bed trailer",
      stage: 0,
      price: "—",
      flagged: false,
      vertical: "logistics"
    }
  ]);

  // --- 1 job at Quote Sent (stage 1) ---
  await post("jobs", [
    {
      code: "DZR-J-1045",
      client_name: "ADNOC Logistics",
      client_contact: "Omar Khalifa",
      vendor_name: "Gulf Flatbed Co.",
      driver: "— unassigned",
      route: "Ruwais → Musaffah",
      type: "Flatbed, 40ft",
      stage: 1,
      price: "AED 3,800",
      flagged: false,
      vertical: "logistics"
    }
  ]);

  // --- 1 job at Approved (stage 2) ---
  await post("jobs", [
    {
      code: "DZR-J-1046",
      client_name: "Nakheel",
      client_contact: "Sara Al Suwaidi",
      vendor_name: "Emirates Crane Services",
      driver: "Khalid Raza",
      route: "Palm Jumeirah site",
      type: "Boom lift, 60ft",
      stage: 2,
      price: "AED 2,400",
      flagged: false,
      vertical: "equipment"
    }
  ]);

  // --- 1 vendor ---
  await post("vendors", [
    {
      name: "Sharjah Heavy Transport LLC",
      contact_name: "Mohammed Al Qasimi",
      phone: "+971 6 555 1234",
      email: "ops@sharjahheavy.ae",
      plan: "standard",
      trade_license_no: "SHJ-TL-2024-0891",
      trade_license_expiry: "2026-12-15",
      insurance_expiry: "2026-11-30",
      active: true
    }
  ]);

  console.log("\nDone. Refresh the ops dashboard to see the new data.");
}

main().catch(console.error);
