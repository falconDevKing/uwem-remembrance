alter table public.registrations
  add column if not exists deleted boolean not null default false;

alter table public.registrations disable row level security;

grant select, insert, update, delete on table public.registrations
  to anon, authenticated;

alter table public.registrations
  drop constraint if exists registrations_invited_by_check;

update public.registrations
set invited_by = null
where invited_by = 'Work Church';

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
  drop constraint if exists registrations_invite_code_format_check;

do $$
begin
  if (select count(*) from public.registrations) > 1679616 then
    raise exception 'Too many registrations for four-character invite codes';
  end if;
end;
$$;

update public.registrations
set invite_code = 'TMP-' || replace(id::text, '-', '');

do $$
declare
  attendee record;
  candidate text;
  alphabet constant text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  character_index integer;
begin
  for attendee in select id from public.registrations order by random()
  loop
    loop
      candidate := 'INV-';
      for character_index in 1..4
      loop
        candidate := candidate || substr(
          alphabet,
          floor(random() * length(alphabet))::integer + 1,
          1
        );
      end loop;

      exit when not exists (
        select 1
        from public.registrations
        where invite_code = candidate
      );
    end loop;

    update public.registrations
    set invite_code = candidate
    where id = attendee.id;
  end loop;
end;
$$;

alter table public.registrations
  add constraint registrations_invite_code_format_check
  check (invite_code ~ '^INV-[A-Z0-9]{4}$');

create index if not exists registrations_deleted_idx
  on public.registrations (deleted);

notify pgrst, 'reload schema';
