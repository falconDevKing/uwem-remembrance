create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (length(btrim(full_name)) > 0),
  phone_number text,
  email text,
  attendance_confirmed boolean not null default true,
  invite_code text not null unique default ('INV-' || upper(replace(gen_random_uuid()::text, '-', ''))),
  is_primary_attendee boolean not null default true,
  linked_to_id uuid references public.registrations(id),
  checked_in boolean not null default false,
  checked_in_at timestamptz,
  admin_notes text,
  table_assignment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint registrations_relationship_check check (
    (
      is_primary_attendee
      and linked_to_id is null
      and phone_number is not null
      and length(btrim(phone_number)) > 0
    )
    or (
      not is_primary_attendee
      and linked_to_id is not null
    )
  ),
  constraint registrations_check_in_timestamp_check check (
    (checked_in and checked_in_at is not null)
    or (not checked_in and checked_in_at is null)
  )
);

create index registrations_created_at_idx
  on public.registrations (created_at desc, id desc);
create index registrations_linked_to_id_idx
  on public.registrations (linked_to_id);
create index registrations_phone_number_idx
  on public.registrations (phone_number);
create index registrations_checked_in_idx
  on public.registrations (checked_in);

create or replace function public.set_registration_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger registrations_set_updated_at
before update on public.registrations
for each row execute function public.set_registration_updated_at();


