-- schema_part2.sql
-- Скрипт создания таблиц для 2 этапа: Релизы, Подкасты, Стримы, Мерч

-- ==========================================
-- ТАБЛИЦА: releases (РЕЛИЗЫ)
-- ==========================================
create table if not exists public.releases (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date date not null,
  format text not null, -- digital, vinyl, cassette
  tracklist text[] default '{}',
  poster text,
  created_at timestamp with time zone default now()
);

alter table public.releases enable row level security;
create policy "Раньше всех видят релизы" on public.releases for select using (true);
create policy "Админ добавляет релиз" on public.releases for insert with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);
create policy "Админ меняет релиз" on public.releases for update using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);
create policy "Админ удаляет релиз" on public.releases for delete using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

-- ==========================================
-- ТАБЛИЦА: podcasts (ПОДКАСТЫ)
-- ==========================================
create table if not exists public.podcasts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date date not null,
  note text,
  url text,
  poster text,
  created_at timestamp with time zone default now()
);

alter table public.podcasts enable row level security;
create policy "Видят подкасты все" on public.podcasts for select using (true);
create policy "Админ добавляет подкаст" on public.podcasts for insert with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);
create policy "Админ меняет подкаст" on public.podcasts for update using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);
create policy "Админ удаляет подкаст" on public.podcasts for delete using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

-- ==========================================
-- ТАБЛИЦА: streams (СТРИМЫ)
-- ==========================================
create table if not exists public.streams (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date date not null,
  url text,
  poster text,
  created_at timestamp with time zone default now()
);

alter table public.streams enable row level security;
create policy "Видят стримы все" on public.streams for select using (true);
create policy "Админ добавляет стрим" on public.streams for insert with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);
create policy "Админ меняет стрим" on public.streams for update using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);
create policy "Админ удаляет стрим" on public.streams for delete using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

-- ==========================================
-- ТАБЛИЦА: merch (МЕРЧ)
-- ==========================================
create table if not exists public.merch (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  price text not null, -- например "3500 ₽"
  status text not null, -- in_stock, preorder, out_of_stock
  "desc" text,
  poster text,
  created_at timestamp with time zone default now()
);

alter table public.merch enable row level security;
create policy "Видят мерч все" on public.merch for select using (true);
create policy "Админ добавляет мерч" on public.merch for insert with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);
create policy "Админ меняет мерч" on public.merch for update using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);
create policy "Админ удаляет мерч" on public.merch for delete using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);
