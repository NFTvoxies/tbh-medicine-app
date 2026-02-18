-- enable uuid generator
create extension if not exists "pgcrypto";

-- 1. therapeutic categories (self-referencing)
create table therapeutic_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  parent_id uuid references therapeutic_categories(id) on delete set null,
  icon text,
  level int default 1
);

-- 2. molecules (DCI)
create table molecules (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

-- 3. medications (brand + dosage + form)
create table medications (
  id uuid primary key default gen_random_uuid(),
  brand_name text not null,
  generic_name text not null, -- DCI, may also be foreign key to molecules
  molecule_id uuid references molecules(id) on delete set null,
  category_id uuid references therapeutic_categories(id) on delete set null,
  dosage text,
  form text,
  units_per_box int default 1,
  notes text,
  created_at timestamptz default now()
);

-- 4. locations (storage places)
create table locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  notes text
);

-- 5. donations (inbound)
create table donations (
  id uuid primary key default gen_random_uuid(),
  donor_name text,
  received_date timestamptz default now(),
  notes text,
  created_by uuid -- optional user id
);

-- 6. batches (inventory units aggregated by donation + product + expiry)
create table batches (
  id uuid primary key default gen_random_uuid(),
  medication_id uuid references medications(id) on delete cascade,
  donation_id uuid references donations(id) on delete set null,
  location_id uuid references locations(id) on delete set null,
  expiration_date date,
  quantity_units int not null default 0, -- track units only
  box_count int default 0, -- optional metadata
  created_at timestamptz default now()
);

create index idx_batches_medication_qty_exp ON batches(medication_id, quantity_units, expiration_date);

-- 7. caravan / events
create table events (
  id uuid primary key default gen_random_uuid(),
  name text,
  event_date date,
  location text,
  notes text,
  created_at timestamptz default now()
);

-- 8. dispenses (outbound)
create table dispenses (
  id uuid primary key default gen_random_uuid(),
  medication_id uuid references medications(id) on delete set null,
  batch_id uuid references batches(id) on delete set null,
  event_id uuid references events(id) on delete set null,
  dispense_date timestamptz default now(),
  quantity_units int not null, -- units dispensed
  dispensed_by text,
  patient_info jsonb, -- optional: name, age, id, notes
  notes text,
  created_at timestamptz default now()
);

-- 9. audit adjustments (returns, waste, manual adjustments)
create table adjustments (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid references batches(id) on delete set null,
  medication_id uuid references medications(id) on delete set null,
  adjustment_type text, -- 'return','waste','correction','donation_increase'
  quantity_units int not null,
  reason text,
  created_by text,
  created_at timestamptz default now()
);

-- VIEW: total units per medication (non-materialized)
create view medication_totals as
select
  m.id as medication_id,
  m.brand_name,
  m.generic_name,
  coalesce(sum(b.quantity_units), 0) as total_units
from medications m
left join batches b on b.medication_id = m.id
group by m.id, m.brand_name, m.generic_name;

-- FUNCTION: core RPC to process a dispense
-- If p_batch_id IS NOT NULL -> manual: reduce that batch
-- If p_batch_id IS NULL -> auto-FIFO: allocate across available batches ordered by expiration_date asc
create or replace function process_dispense(
  p_medication_id uuid,
  p_quantity_units int,
  p_batch_id uuid default null,
  p_event_id uuid default null,
  p_dispensed_by text default null,
  p_patient_info jsonb default null,
  p_notes text default null
) returns table(dispense_id uuid, used_batch_id uuid, used_quantity int) language plpgsql as
$$
declare
  remaining int := p_quantity_units;
  cur_batch record;
  new_dispense_id uuid;
begin
  if p_quantity_units <= 0 then
    raise exception 'quantity must be positive';
  end if;

  -- manual batch selection
  if p_batch_id is not null then
    select id, quantity_units into cur_batch from batches where id = p_batch_id for update;
    if not found then
      raise exception 'batch not found';
    end if;
    if cur_batch.quantity_units < remaining then
      raise exception 'not enough units in selected batch: have %, need %', cur_batch.quantity_units, remaining;
    end if;

    -- subtract from that batch
    update batches set quantity_units = quantity_units - remaining where id = p_batch_id;

    new_dispense_id := gen_random_uuid();
    insert into dispenses(id, medication_id, batch_id, event_id, dispense_date, quantity_units, dispensed_by, patient_info, notes)
    values(new_dispense_id, p_medication_id, p_batch_id, p_event_id, now(), remaining, p_dispensed_by, p_patient_info, p_notes);

    dispense_id := new_dispense_id;
    used_batch_id := p_batch_id;
    used_quantity := remaining;
    return next;
    return;
  end if;

  -- auto-FIFO allocation across batches ordered by expiry (soonest first), only batches with quantity > 0
  for cur_batch in
    select id, quantity_units from batches
    where medication_id = p_medication_id and quantity_units > 0
    order by coalesce(expiration_date, '2100-01-01') asc
    for update
  loop
    exit when remaining <= 0;
    if cur_batch.quantity_units <= 0 then
      continue;
    end if;

    if cur_batch.quantity_units >= remaining then
      -- reduce partially or fully
      update batches set quantity_units = quantity_units - remaining where id = cur_batch.id;
      new_dispense_id := gen_random_uuid();
      insert into dispenses(id, medication_id, batch_id, event_id, dispense_date, quantity_units, dispensed_by, patient_info, notes)
      values(new_dispense_id, p_medication_id, cur_batch.id, p_event_id, now(), remaining, p_dispensed_by, p_patient_info, p_notes);

      dispense_id := new_dispense_id;
      used_batch_id := cur_batch.id;
      used_quantity := remaining;
      remaining := 0;
      return next;
    else
      -- use entire batch and continue
      update batches set quantity_units = 0 where id = cur_batch.id;
      new_dispense_id := gen_random_uuid();
      insert into dispenses(id, medication_id, batch_id, event_id, dispense_date, quantity_units, dispensed_by, patient_info, notes)
      values(new_dispense_id, p_medication_id, cur_batch.id, p_event_id, now(), cur_batch.quantity_units, p_dispensed_by, p_patient_info, p_notes);

      dispense_id := new_dispense_id;
      used_batch_id := cur_batch.id;
      used_quantity := cur_batch.quantity_units;
      remaining := remaining - cur_batch.quantity_units;
      return next;
    end if;
  end loop;

  if remaining > 0 then
    raise exception 'not enough stock to fulfill dispense: remaining % units', remaining;
  end if;

  return;
end;
$$;

-- GRANT execute on function for authenticated role if needed
grant execute on function process_dispense(uuid, int, uuid, uuid, text, jsonb, text) to authenticated;

-- RLS - enable row level security for sensitive tables
alter table medications enable row level security;
alter table batches enable row level security;
alter table dispenses enable row level security;
alter table donations enable row level security;
alter table events enable row level security;

-- Simple RLS policies for authenticated users (adjust later for roles)
create policy "medications_all_authenticated" on medications
  for all
  using (auth.role() = 'authenticated');

create policy "batches_all_authenticated" on batches
  for all
  using (auth.role() = 'authenticated');

create policy "dispenses_all_authenticated" on dispenses
  for all
  using (auth.role() = 'authenticated');

create policy "donations_all_authenticated" on donations
  for all
  using (auth.role() = 'authenticated');

create policy "events_all_authenticated" on events
  for all
  using (auth.role() = 'authenticated');

-- Prevent negative quantities by trigger
create or replace function batches_no_negative_qty() returns trigger as $$
begin
  if new.quantity_units < 0 then
    raise exception 'quantity_units cannot be negative';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_batches_non_negative before insert or update on batches
for each row execute function batches_no_negative_qty();

-- Helpful view: categories with aggregated counts (badge)
create view category_totals as
select c.id, c.name,
  coalesce(sum(b.quantity_units),0) as total_units
from therapeutic_categories c
left join medications m on m.category_id = c.id
left join batches b on b.medication_id = m.id
group by c.id, c.name;

-- This guarantees smooth fuzzy search

create extension if not exists pg_trgm;

create index idx_brand_trgm on medications using gin (brand_name gin_trgm_ops);
create index idx_generic_trgm on medications using gin (generic_name gin_trgm_ops);
