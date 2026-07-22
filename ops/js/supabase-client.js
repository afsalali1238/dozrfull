// Dozr Ops — Supabase client init.
// The anon/public key below is meant to be public and safe to ship in
// client-side code — but only when RLS policies are actually enforcing
// access control, which they are NOT right now. 0003_temp_open_access.sql
// opened every table to full anonymous read/write ("for all using (true)")
// to unblock building without auth. That migration's own comment flags it
// as temporary and unsafe for a real launch — repeating here so this file
// doesn't read as "this is already secure" when it isn't yet. Before any
// semi-public exposure of ops/: re-enable is_staff()-gated RLS (see
// 0001_init.sql for the original policies) or add a real auth check.

const SUPABASE_URL = "https://ojldfskttumqseyccsks.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_6fAMDV9znJAWxe72fdzx8g_CpFNT28Q";

// supabase-js is loaded via CDN script tag in each page's <head>, before
// this file: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
