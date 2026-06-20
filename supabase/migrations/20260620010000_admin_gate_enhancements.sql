alter table public.registrations
  add column if not exists invited_by text;

alter table public.registrations
  add constraint registrations_invited_by_check
  check (
    invited_by is null
    or invited_by in (
      'Daddy',
      'Mummy Esther',
      'Joy',
      'Peace',
      'Emmanuel',
      'Work', 
      'Church',
      'Family'
    )
  );

alter table public.registrations
  drop constraint if exists registrations_linked_to_id_fkey;

alter table public.registrations
  add constraint registrations_linked_to_id_fkey
  foreign key (linked_to_id)
  references public.registrations(id)
  on delete cascade;

do $$
begin
  if (select count(*) from public.registrations) > 1679616 then
    raise exception 'Too many registrations for four-character invite codes';
  end if;
end;
$$;

update public.registrations
set invite_code = 'TMP-' || replace(id::text, '-', '');

with numbered as (
  select
    id,
    row_number() over (order by created_at, id) - 1 as code_number
  from public.registrations
)
update public.registrations as registration
set invite_code =
  'INV-'
  || substr('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', ((numbered.code_number / 46656) % 36)::integer + 1, 1)
  || substr('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', ((numbered.code_number / 1296) % 36)::integer + 1, 1)
  || substr('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', ((numbered.code_number / 36) % 36)::integer + 1, 1)
  || substr('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', (numbered.code_number % 36)::integer + 1, 1)
from numbered
where registration.id = numbered.id;

alter table public.registrations
  alter column invite_code drop default;

alter table public.registrations
  add constraint registrations_invite_code_format_check
  check (invite_code ~ '^INV-[A-Z0-9]{4}$');