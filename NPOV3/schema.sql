-- schema.sql
-- Выполните этот скрипт в SQL Editor панели Supabase для инициализации проекта НПО Мелодия

-- Включаем UUID генерацию (обычно включено по умолчанию)
create extension if not exists "uuid-ossp";

-----------------------------------
-- 1. Таблица СОБЫТИЯ (EVENTS)
-----------------------------------
create table if not exists public.events (
    id uuid default uuid_generate_v4() primary key,
    title text not null,
    date timestamp with time zone not null,
    place text default 'НПО Мелодия',
    address text,
    tags text[] default array[]::text[],
    status text default 'tickets',
    poster text default 'smile.png',
    ticket_url text,
    about text,
    lineup text[] default array[]::text[],
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-----------------------------------
-- 2. Таблица АРТИСТЫ (ARTISTS)
-----------------------------------
create table if not exists public.artists (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    role text default 'DJ / live',
    bookable boolean default true,
    tags text[] default array[]::text[],
    bio text,
    poster text default 'smile.png',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-----------------------------------
-- 3. Таблица РОЛЕЙ ПОЛЬЗОВАТЕЛЕЙ (PROFILES)
-----------------------------------
-- Это расширение таблицы auth.users для хранения доп. информации (например, роли admin/user)
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    email text unique not null,
    name text,
    role text default 'user' check (role in ('user', 'admin')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-----------------------------------
-- 4. ТРИГГЕР: Авто-создание профиля при регистрации
-----------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'name', 'user');
  return new;
end;
$$ language plpgsql security definer;

-- Если триггер уже существует - сначала удаляем, потом вешаем заново
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-----------------------------------
-- 5. НАСТРОЙКИ БЕЗОПАСНОСТИ (Row Level Security - RLS)
-----------------------------------

-- Включаем RLS для всех таблиц
alter table public.events enable row level security;
alter table public.artists enable row level security;
alter table public.profiles enable row level security;

-- Политики для Events (Афиша)
-- Все видят афишу
create policy "Allow public read access on events" 
  on public.events for select using (true);
-- Только админы могут редактировать (проверяем роль в profiles)
create policy "Allow admins full access on events" 
  on public.events using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Политики для Artists (Артисты)
-- Все видят артистов
create policy "Allow public read access on artists" 
  on public.artists for select using (true);
-- Только админы могут редактировать
create policy "Allow admins full access on artists" 
  on public.artists using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Политики для Profiles (Профили)
-- Юзер может видеть и менять свой профиль
create policy "Users can view own profile" 
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" 
  on public.profiles for update using (auth.uid() = id);
-- Админы видят профили всех
create policy "Admins can view all profiles" 
  on public.profiles for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
-- Админы могут менять роли
create policy "Admins can update all profiles" 
  on public.profiles for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-----------------------------------
-- 6. ПЕРВИЧНЫЕ ДАННЫЕ (Seed Data - опционально)
-----------------------------------
-- Добавьте свои существующие данные из data локально
-- Выполняется только если таблицы пустые

insert into public.events (title, date, place, tags, status, poster, about, lineup)
select 'Maslaynitsa', '2026-02-19 22:00:00+03', 'НПО Мелодия', array['live', 'electronic'], 'archive', 'event-maslaynitsa.jpg', 'Ивент Maslaynitsa.', array['am1d', 'di-au', 'feel gainsbourg', 'egor popov', 'nyaono']
where not exists (select 1 from public.events limit 1);

insert into public.artists (name, role, bookable, tags, bio, poster)
select 'WEI', 'DJ / live', true, array['live', 'octatrack'], 'WEI', 'wei.jpg'
where not exists (select 1 from public.artists limit 1);

-- ДОБАВЛЕНИЕ ПЕРВОГО АДМИНИСТРАТОРА
-- ВНИМАНИЕ: Сначала зарегистрируйтесь через форму на сайте (или в админке), 
-- а затем выполните этот запрос в SQL, заменив 'ваш-email@gmail.com' на почту регистрации,
-- чтобы выдать себе права администратора руками в первый раз.

-- UPDATE public.profiles SET role = 'admin' WHERE email = 'ваш-email@gmail.com';
