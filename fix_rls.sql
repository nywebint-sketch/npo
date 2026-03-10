-- fix_rls.sql
-- Избавляемся от бесконечной рекурсии в политиках Supabase
-- [ИСПРАВЛЕНАЯ ВЕРСИЯ: безопасно перезапускать]

-- 1. Удаляем рекурсивные политики с таблицы профилей
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Admins can update all profiles" on public.profiles;

-- Разрешаем чтение профилей только аутентифицированным юзерам для самих себя, 
-- а для других — мы будем использовать Security Definer функцию!
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" 
  on public.profiles for select using (true); -- Разрешаем читать профили всем (имена и роли не секрет)

-- Оставляем только эту политику для обновления своего профиля
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" 
  on public.profiles for update using (auth.uid() = id);

-- 2. Удаляем старые рекурсивные и случайно созданные политики с events и artists
drop policy if exists "Allow admins full access on events" on public.events;
drop policy if exists "Allow admins full access on artists" on public.artists;
drop policy if exists "Admins insert events" on public.events;
drop policy if exists "Admins update events" on public.events;
drop policy if exists "Admins delete events" on public.events;
drop policy if exists "Admins insert artists" on public.artists;
drop policy if exists "Admins update artists" on public.artists;
drop policy if exists "Admins delete artists" on public.artists;

-- И создаем их заново, но более точечно (только для INSERT, UPDATE, DELETE)
create policy "Admins insert events" on public.events for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins update events" on public.events for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins delete events" on public.events for delete using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

create policy "Admins insert artists" on public.artists for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins update artists" on public.artists for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins delete artists" on public.artists for delete using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
