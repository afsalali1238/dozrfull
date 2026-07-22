-- Dozr Ops — soft-delete flag for equipment/assets.
-- Supports the Assets page's "turn off" action (deactivate instead of
-- hard-delete, same pattern vendors already use with vendors.active).

alter table equipment add column if not exists active boolean not null default true;
