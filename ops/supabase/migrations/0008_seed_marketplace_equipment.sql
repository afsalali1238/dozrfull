-- Dozr Ops — mirror Marketplace's public equipment catalog into the real
-- equipment table, so whatever's shown on the client-facing site also
-- exists in ops (afzl's call: "whatever assets in the front end should be
-- there in back end"). Source: marketplace/data/equipment.js (15 units,
-- hardcoded there since Marketplace has no backend yet - see that file's
-- own header comment).
--
-- Vendor attribution problem: Marketplace deliberately never shows which
-- vendor owns a unit (afzl's rule: "we'll not be sharing vendor details to
-- client, we'll be managing them"), so there's no real per-unit vendor to
-- assign here. Rather than guess, every seeded row goes under one
-- placeholder vendor, "Dozr Verified Fleet" - reassign individual units to
-- their real vendor later as that mapping becomes known (Assets page ->
-- edit vendor per row, once an edit action exists - it doesn't yet, only
-- add/delete). Flagged here so it isn't mistaken for real vendor data.
--
-- Run once. Category mapping (marketplace -> ops):
--   excavators -> excavator | wheel -> wheel-loader | cranes -> crane
--   dump -> dump-truck or box-truck (by marketplace categoryLabel)
--   flatbed -> flatbed or low-bed (by marketplace categoryLabel)
--   generators -> generator

insert into vendors (name, plan, active)
values ('Dozr Verified Fleet', 'verified', true);

insert into equipment (vendor_id, category, name, availability_status, notes)
select id, x.category, x.name, 'available', x.notes
from vendors, (values
  ('excavator', 'CAT 305 CR', 'Mini excavator, 5.0 T. Marketplace id: cat-305-cr · Verified · GPS tracked'),
  ('excavator', 'CAT 320', '20.3 T, 4,182 hrs, dig depth 6.7m, 2021. Marketplace id: cat-320 · Verified · GPS tracked'),
  ('wheel-loader', 'Komatsu WA320', 'Marketplace id: komatsu-wa320 · Verified · GPS tracked'),
  ('excavator', 'Hitachi ZX130', '13 T. Marketplace id: hitachi-zx130 · Verified · GPS tracked'),
  ('excavator', 'Kubota KX080', '8 T. Marketplace id: kubota-kx080 · Not verified · No GPS'),
  ('excavator', 'Volvo EC220', '22 T. Marketplace id: volvo-ec220 · Verified · GPS tracked'),
  ('excavator', 'CAT 336', '36 T. Marketplace id: cat-336 · Not verified · No GPS'),
  ('crane', 'Liebherr LTM 1130', '130 T capacity, 60m max lift height. Marketplace id: liebherr-ltm-1130 · Verified · GPS tracked'),
  ('dump-truck', 'Mercedes-Benz Arocs 3345', '20 T payload, 6x4. Marketplace id: mercedes-arocs · Verified · GPS tracked'),
  ('flatbed', '12m Flatbed Trailer', '12m, 30 T capacity. Marketplace id: flatbed-12m · Verified · GPS tracked'),
  ('low-bed', 'Heavy-Duty Lowbed Trailer', '60 T capacity, low-loader deck. Marketplace id: lowbed-trailer · Verified · GPS tracked'),
  ('flatbed', 'Standard Flatbed Trailer', '12m, 30 T capacity. Marketplace id: flatbed-trailer · Verified · GPS tracked'),
  ('crane', 'Self-Loading Crane Truck', '10 T lift capacity, 8m deck. Marketplace id: crane-truck · Verified · GPS tracked'),
  ('box-truck', 'Enclosed Box Truck', '10 T payload, enclosed cargo. Marketplace id: box-truck · Verified · GPS tracked'),
  ('generator', 'Cummins 500kVA', '500 kVA, diesel. Marketplace id: cummins-500kva · Verified · No GPS')
) as x(category, name, notes)
where vendors.name = 'Dozr Verified Fleet';
