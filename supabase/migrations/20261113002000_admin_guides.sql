create table if not exists public.guide_articles (
  id text primary key check (char_length(id) between 1 and 100),
  title text not null check (char_length(title) between 1 and 160),
  summary text not null check (char_length(summary) between 1 and 500),
  tag text not null default '' check (char_length(tag) <= 60),
  category text not null check (char_length(category) between 1 and 60),
  steps text[] not null check (
    cardinality(steps) between 1 and 20
    and cardinality(array_remove(steps, '')) = cardinality(steps)
  ),
  note text not null default '' check (char_length(note) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists guide_articles_category_title_idx
  on public.guide_articles (category, title);

alter table public.guide_articles enable row level security;
revoke all on public.guide_articles from anon, authenticated;
grant select on public.guide_articles to anon, authenticated;
grant insert, update, delete on public.guide_articles to authenticated;

drop policy if exists "Anyone can read guide articles" on public.guide_articles;
create policy "Anyone can read guide articles"
  on public.guide_articles for select to anon, authenticated
  using (true);

drop policy if exists "Admins can add guide articles" on public.guide_articles;
create policy "Admins can add guide articles"
  on public.guide_articles for insert to authenticated
  with check ((select public.is_current_user_admin()));

drop policy if exists "Admins can update guide articles" on public.guide_articles;
create policy "Admins can update guide articles"
  on public.guide_articles for update to authenticated
  using ((select public.is_current_user_admin()))
  with check ((select public.is_current_user_admin()));

drop policy if exists "Admins can delete guide articles" on public.guide_articles;
create policy "Admins can delete guide articles"
  on public.guide_articles for delete to authenticated
  using ((select public.is_current_user_admin()));

notify pgrst, 'reload schema';
