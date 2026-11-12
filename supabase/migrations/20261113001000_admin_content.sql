create table if not exists public.admin_allowlist (
  email text primary key check (email = lower(email) and char_length(email) <= 254)
);

alter table public.admin_allowlist enable row level security;
revoke all on public.admin_allowlist from anon, authenticated;

create or replace function public.is_current_user_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_allowlist
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.is_current_user_admin() from public;
grant execute on function public.is_current_user_admin() to anon, authenticated;

create table if not exists public.holidays (
  id text primary key check (char_length(id) between 1 and 100),
  title text not null check (char_length(title) between 1 and 120),
  category text not null check (char_length(category) between 1 and 60),
  lunar text not null default '',
  lunar_day smallint check (lunar_day between 1 and 30),
  lunar_month smallint check (lunar_month between 1 and 12),
  every_lunar_month boolean not null default false,
  religion text check (religion in ('Phật giáo', 'Thiên Chúa giáo')),
  solar_month smallint check (solar_month between 1 and 12),
  solar_day smallint check (solar_day between 1 and 31),
  easter_offset_days smallint check (easter_offset_days between -60 and 60),
  solar text not null default '',
  tags text[] not null default '{}',
  description text not null default '' check (char_length(description) <= 2000),
  region text not null default 'Tất cả' check (region in ('Tất cả', 'Bắc', 'Trung', 'Nam')),
  countdown text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (every_lunar_month and lunar_day is not null and lunar_month is null)
    or (not every_lunar_month and lunar_day is not null and lunar_month is not null)
    or (lunar_day is null and lunar_month is null)
  ),
  check ((solar_month is null) = (solar_day is null)),
  check (num_nonnulls(lunar_day, solar_day, easter_offset_days) = 1),
  check (not (easter_offset_days is not null and (solar_day is not null or lunar_day is not null)))
);

create table if not exists public.catalog_products (
  id text primary key check (char_length(id) between 1 and 100),
  name text not null check (char_length(name) between 1 and 120),
  illustration text not null check (
    illustration in (
      'offering', 'incense', 'altar-set', 'fruit', 'lantern', 'tea',
      'paper-car', 'paper-clothes', 'paper-house', 'paper-horse',
      'incense-coil', 'incense-cone', 'colored-candle', 'lotus-candle', 'led-lamp'
    )
  ),
  price integer not null check (price >= 0),
  unit text not null check (char_length(unit) between 1 and 30),
  category text not null check (char_length(category) between 1 and 60),
  badge text not null default '',
  region text not null default 'Tất cả' check (region in ('Tất cả', 'Bắc', 'Trung', 'Nam')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.prayers (
  holiday_id text not null check (char_length(holiday_id) between 1 and 100),
  region text not null check (region in ('Bắc', 'Trung', 'Nam')),
  content text not null check (char_length(content) between 1 and 10000),
  updated_at timestamptz not null default now(),
  primary key (holiday_id, region)
);

alter table public.holidays enable row level security;
alter table public.catalog_products enable row level security;
alter table public.prayers enable row level security;

revoke all on public.holidays from anon, authenticated;
revoke all on public.catalog_products from anon, authenticated;
revoke all on public.prayers from anon, authenticated;
grant select on public.holidays to anon, authenticated;
grant select on public.catalog_products to anon, authenticated;
grant select on public.prayers to anon, authenticated;
grant insert, update, delete on public.holidays to authenticated;
grant insert, update, delete on public.catalog_products to authenticated;
grant insert, update, delete on public.prayers to authenticated;

drop policy if exists "Anyone can read holidays" on public.holidays;
create policy "Anyone can read holidays"
  on public.holidays for select to anon, authenticated
  using (true);

drop policy if exists "Admins can add holidays" on public.holidays;
create policy "Admins can add holidays"
  on public.holidays for insert to authenticated
  with check ((select public.is_current_user_admin()));

drop policy if exists "Admins can update holidays" on public.holidays;
create policy "Admins can update holidays"
  on public.holidays for update to authenticated
  using ((select public.is_current_user_admin()))
  with check ((select public.is_current_user_admin()));

drop policy if exists "Admins can delete holidays" on public.holidays;
create policy "Admins can delete holidays"
  on public.holidays for delete to authenticated
  using ((select public.is_current_user_admin()));

drop policy if exists "Anyone can read catalog products" on public.catalog_products;
create policy "Anyone can read catalog products"
  on public.catalog_products for select to anon, authenticated
  using (true);

drop policy if exists "Admins can add catalog products" on public.catalog_products;
create policy "Admins can add catalog products"
  on public.catalog_products for insert to authenticated
  with check ((select public.is_current_user_admin()));

drop policy if exists "Admins can update catalog products" on public.catalog_products;
create policy "Admins can update catalog products"
  on public.catalog_products for update to authenticated
  using ((select public.is_current_user_admin()))
  with check ((select public.is_current_user_admin()));

drop policy if exists "Admins can delete catalog products" on public.catalog_products;
create policy "Admins can delete catalog products"
  on public.catalog_products for delete to authenticated
  using ((select public.is_current_user_admin()));

drop policy if exists "Anyone can read prayers" on public.prayers;
create policy "Anyone can read prayers"
  on public.prayers for select to anon, authenticated
  using (true);

drop policy if exists "Admins can add prayers" on public.prayers;
create policy "Admins can add prayers"
  on public.prayers for insert to authenticated
  with check ((select public.is_current_user_admin()));

drop policy if exists "Admins can update prayers" on public.prayers;
create policy "Admins can update prayers"
  on public.prayers for update to authenticated
  using ((select public.is_current_user_admin()))
  with check ((select public.is_current_user_admin()));

drop policy if exists "Admins can delete prayers" on public.prayers;
create policy "Admins can delete prayers"
  on public.prayers for delete to authenticated
  using ((select public.is_current_user_admin()));
