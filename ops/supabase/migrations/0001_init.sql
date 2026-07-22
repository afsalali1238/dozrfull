-- Dozr Ops — initial schema
-- Run this in the Supabase SQL Editor (Project → SQL Editor → New query)
-- after the project exists. Safe to run once on a fresh project.

-- ============================================================
-- STAFF (auth)
-- ============================================================
-- Supabase Auth already provides auth.users. This table adds the staff-only
-- profile info (name, role) and is what RLS policies check against — only
-- rows in staff_profiles count as "staff" for every other table below.
create table if not exists staff_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  role text not null default 'ops_agent' check (role in ('ops_agent', 'ops_manager', 'admin')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- VENDORS
-- ============================================================
create table if not exists vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_name text,
  phone text,
  email text,
  plan text default 'standard' check (plan in ('standard', 'verified', 'premium')),
  trade_license_no text,
  trade_license_expiry date,
  insurance_expiry date,
  active boolean not null default true,
  joined_at date not null default current_date,
  created_by uuid references staff_profiles(id),
  created_at timestamptz not null default now()
);

-- ============================================================
-- EQUIPMENT / VEHICLES (replaces vendors.fleet summary string)
-- ============================================================
create table if not exists equipment (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendors(id) on delete cascade,
  category text not null, -- crane / flatbed / excavator / boom-lift / low-bed / box-truck / other
  name text not null,     -- e.g. "Crane, 60t" or "40ft Flatbed"
  plate_or_asset_id text,
  images text[] default '{}', -- Supabase Storage object paths, bucket: equipment-images
  availability_status text not null default 'available' check (availability_status in ('available', 'on_job', 'maintenance')),
  day_rate numeric(10,2), -- internal only — never expose to Marketplace/client
  notes text,
  created_by uuid references staff_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- RFQs
-- ============================================================
create table if not exists rfqs (
  id uuid primary key default gen_random_uuid(),
  code text not null unique, -- ref no, e.g. RFQ-2201
  client_name text not null,
  client_contact text,
  client_email text,
  route text,
  type text, -- e.g. "Crane, 80t, 2 days"
  deadline timestamptz,
  status text not null default 'open' check (status in ('open', 'quoted', 'closed')),
  created_by uuid references staff_profiles(id),
  created_at timestamptz not null default now()
);

-- Which vendors an RFQ was sent to, and their quote (if any).
-- One row per vendor per RFQ — supports multiple vendors quoting the same RFQ.
create table if not exists rfq_vendor_quotes (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid not null references rfqs(id) on delete cascade,
  vendor_id uuid not null references vendors(id) on delete cascade,
  quoted_price numeric(10,2),
  quoted_at timestamptz,
  notes text,
  unique (rfq_id, vendor_id)
);

-- ============================================================
-- JOBS
-- ============================================================
create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  code text not null unique, -- e.g. DZR-J-1042
  rfq_id uuid references rfqs(id),
  client_name text not null,
  client_contact text,
  vendor_id uuid references vendors(id),
  equipment_id uuid references equipment(id),
  driver text,
  route text,
  stage smallint not null default 0 check (stage between 0 and 12), -- 13-stage pipeline, 0-indexed
  price text, -- kept as display text ("AED 4,200" / "Quote pending") to match existing UI; numeric price lives on rfq_vendor_quotes
  flagged boolean not null default false,
  documents jsonb default '[]', -- [{label, ref}]
  timeline jsonb default '[]',  -- [{stage, at, note}]
  created_by uuid references staff_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- INVOICES
-- ============================================================
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  ref text not null unique, -- e.g. INV-DZR-J-1037
  job_id uuid references jobs(id),
  client_name text not null,
  amount numeric(10,2) not null,
  issued date not null default current_date,
  due date,
  status text not null default 'pending' check (status in ('pending', 'paid', 'overdue')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- ESCALATIONS (data kept even though the tab is hidden from v1 nav)
-- ============================================================
create table if not exists escalations (
  id uuid primary key default gen_random_uuid(),
  level text not null check (level in ('L1', 'L2', 'L3')),
  job_id uuid references jobs(id),
  issue text not null,
  owner text,
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- updated_at triggers
-- ============================================================
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_equipment_updated_at on equipment;
create trigger trg_equipment_updated_at before update on equipment
  for each row execute function set_updated_at();

drop trigger if exists trg_jobs_updated_at on jobs;
create trigger trg_jobs_updated_at before update on jobs
  for each row execute function set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY — staff-only access
-- ============================================================
-- Every table below is readable/writable only by rows that exist in
-- staff_profiles (i.e. signed-in staff). No client or vendor auth exists
-- yet — that's Vendor OS's job, separately, per ROADMAP.md.

alter table staff_profiles enable row level security;
alter table vendors enable row level security;
alter table equipment enable row level security;
alter table rfqs enable row level security;
alter table rfq_vendor_quotes enable row level security;
alter table jobs enable row level security;
alter table invoices enable row level security;
alter table escalations enable row level security;

create or replace function is_staff() returns boolean as $$
  select exists (select 1 from staff_profiles where id = auth.uid());
$$ language sql security definer stable;

create policy "staff can read own profile" on staff_profiles
  for select using (id = auth.uid());

create policy "staff full access - vendors" on vendors
  for all using (is_staff()) with check (is_staff());

create policy "staff full access - equipment" on equipment
  for all using (is_staff()) with check (is_staff());

create policy "staff full access - rfqs" on rfqs
  for all using (is_staff()) with check (is_staff());

create policy "staff full access - rfq_vendor_quotes" on rfq_vendor_quotes
  for all using (is_staff()) with check (is_staff());

create policy "staff full access - jobs" on jobs
  for all using (is_staff()) with check (is_staff());

create policy "staff full access - invoices" on invoices
  for all using (is_staff()) with check (is_staff());

create policy "staff full access - escalations" on escalations
  for all using (is_staff()) with check (is_staff());

-- ============================================================
-- STORAGE — equipment images
-- ============================================================
-- Run once: create a bucket named "equipment-images" via
-- Storage → New bucket → Public (so Marketplace/ops can render images by
-- URL) or Private + signed URLs if images should stay internal-only.
-- Policies for the bucket are set in the Storage UI, not here.
