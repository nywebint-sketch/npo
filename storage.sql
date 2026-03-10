-- storage.sql
-- Выполните этот скрипт в SQL Editor панели Supabase для настройки хранилища картинок

-- 1. Выдаем права на загрузку картинок аутентифицированным пользователям
-- Создаем корзину (Bucket) "images", если она еще не создана
insert into storage.buckets (id, name, public) 
values ('images', 'images', true)
on conflict (id) do nothing;

-- 2. Политики (RLS) для таблицы storage.objects (сами файлы)
-- Удаляем старые, если вдруг есть, чтобы не было конфликта
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Admin Insert" on storage.objects;
drop policy if exists "Admin Update" on storage.objects;
drop policy if exists "Admin Delete" on storage.objects;

-- Разрешаем чтение всем
create policy "Public Access" 
  on storage.objects for select 
  using ( bucket_id = 'images' );

-- Разрешаем загружать, изменять и удалять картинки только аутентифицированным пользователям
create policy "Admin Insert" 
  on storage.objects for insert 
  with check ( bucket_id = 'images' and auth.role() = 'authenticated' );

create policy "Admin Update" 
  on storage.objects for update 
  using ( bucket_id = 'images' and auth.role() = 'authenticated' );

create policy "Admin Delete" 
  on storage.objects for delete 
  using ( bucket_id = 'images' and auth.role() = 'authenticated' );
