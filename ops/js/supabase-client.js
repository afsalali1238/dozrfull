// Dozr Ops — Supabase client init.
// Fill in SUPABASE_URL and SUPABASE_ANON_KEY below once the project exists
// (Project Settings → API in the Supabase dashboard). The anon/public key
// is safe to ship in client-side code — it's meant to be public, access is
// controlled by the RLS policies in ops/supabase/migrations/0001_init.sql,
// not by keeping this key secret.

const SUPABASE_URL = "https://ojldfskttumqseyccsks.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_6fAMDV9znJAWxe72fdzx8g_CpFNT28Q";

// supabase-js is loaded via CDN script tag in each page's <head>, before
// this file: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
