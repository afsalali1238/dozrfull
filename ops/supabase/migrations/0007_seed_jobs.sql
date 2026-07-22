-- Dozr Ops — seed the jobs table from the trimmed mock data in
-- ops/data/ops.js (5 sample jobs, 2026-07-22 - afzl asked to cut dummy
-- data down from ~20 rows to just enough to demo). Codes match the mock
-- array exactly so job-detail.html (still mock-only for now) keeps
-- resolving correctly.
--
-- Safe to run once (codes are unique - re-running will error on the
-- duplicate `code`, not silently double up). If you already ran the old
-- 20-row version of this file, truncate the table first:
--   truncate table jobs;
-- then run this version.

insert into jobs (code, client_name, client_contact, vendor_name, driver, route, type, stage, price, flagged, vertical) values
('DZR-J-1034', 'Aldar', 'Mariam Khoury', '— unassigned', '— unassigned', 'Abu Dhabi KIZAD', 'Excavator', 0, '—', false, 'equipment'),
('DZR-J-1033', 'RAK Ceramics', 'Bilal Farooq', 'Ras Al Khaimah Crane Co.', 'Anwar Sadiq', 'RAK Industrial Zone', 'Crane, 50t', 4, 'AED 5,600', false, 'equipment'),
('DZR-J-1039', 'Petrofac', 'Layla Nasser', 'Gulf Flatbed Co.', 'Hassan Ali', 'Abu Dhabi → Ruwais', 'Low-bed', 6, 'AED 6,750', true, 'logistics'),
('DZR-J-1032', 'Fujairah Port Authority', 'Salim Al Kaabi', 'Fujairah Marine Logistics', 'Imran Sheikh', 'Fujairah Port site', 'Flatbed, port cargo', 9, 'AED 7,100', false, 'logistics'),
('DZR-J-1020', 'Meraas', 'Yousef Al Ali', 'Emirates Crane Services', 'Sunil Perera', 'Bluewaters Island', 'Crane, 60t', 12, 'AED 6,200', false, 'equipment');
