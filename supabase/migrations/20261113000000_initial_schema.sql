create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) between 1 and 100),
  phone text not null default '' check (char_length(phone) <= 30),
  region text not null default 'Tất cả' check (region in ('Tất cả', 'Bắc', 'Trung', 'Nam')),
  reminders_enabled boolean not null default false,
  remind_days smallint not null default 1 check (remind_days in (1, 2, 3)),
  updated_at timestamptz not null default now()
);

create table if not exists public.anniversaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  person_name text not null check (char_length(person_name) between 1 and 100),
  relationship text not null check (char_length(relationship) between 1 and 60),
  lunar_day smallint not null check (lunar_day between 1 and 30),
  lunar_month smallint not null check (lunar_month between 1 and 12),
  note text not null default '' check (char_length(note) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists anniversaries_owner_date_idx
  on public.anniversaries (user_id, lunar_month, lunar_day);

alter table public.profiles enable row level security;
alter table public.anniversaries enable row level security;

revoke all on public.profiles from anon, authenticated;
revoke all on public.anniversaries from anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.anniversaries to authenticated;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Users can read their own anniversaries" on public.anniversaries;
create policy "Users can read their own anniversaries"
  on public.anniversaries for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can add their own anniversaries" on public.anniversaries;
create policy "Users can add their own anniversaries"
  on public.anniversaries for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own anniversaries" on public.anniversaries;
create policy "Users can update their own anniversaries"
  on public.anniversaries for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own anniversaries" on public.anniversaries;
create policy "Users can delete their own anniversaries"
  on public.anniversaries for delete to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 100),
    left(coalesce(new.raw_user_meta_data ->> 'phone', ''), 30)
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
