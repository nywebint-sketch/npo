const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rvswpgsxutfcpgvmzonr.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2c3dwZ3N4dXRmY3Bndm16b25yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzA4NDUxMSwiZXhwIjoyMDg4NjYwNTExfQ.vxZtV2j3_5O0qFZjIWeMgUARUhkxFO8vyKMLYhb-GmY';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  const email = 'deliacorona@gmail.com';
  const password = 'admin'; // Пароль должен быть минимум 6 символов, но мы можем его задать. Сделаем admin123.
  const passwordSafe = 'admin123';

  console.log('Создание пользователя...');
  
  // 1. Создание пользователя через Admin API (с авто-подтверждением email по умолчанию)
  const { data: user, error: createError } = await supabase.auth.admin.createUser({
    email: email,
    password: passwordSafe,
    email_confirm: true,
    user_metadata: { name: 'Admin NPO' }
  });

  if (createError) {
      if (createError.message.includes('already exists')) {
          console.log('Пользователь уже существует, пытаемся обновить его статус и выдать права.');
          
          // Получим ID юзера, чтобы дать ему права.
          const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
          const existingUser = usersData?.users?.find(u => u.email === email);
          
          if (existingUser) {
             console.log('Обновляем подтверждение email...');
             await supabase.auth.admin.updateUserById(existingUser.id, { email_confirm: true });
             
             console.log('Выдаем права администратора...');
             const { error: roleError } = await supabase.from('profiles').update({ role: 'admin' }).eq('id', existingUser.id);
             if (roleError) console.error('Ошибка выдачи прав:', roleError);
             else console.log('✅ Права администратора успешно выданы существующему аккаунту! Пароль используется тот, который вы придумали при первой регистрации.');
          }
          return;
      } else {
         console.error('Ошибка создания:', createError);
         return;
      }
  }

  console.log('✅ Пользователь успешно создан и подтвержден:', user.user.email);

  // 2. Выдача роли 'admin'
  console.log('Выдача прав администратора...');
  
  // Подождем 1 секунду, пока сработает триггер создания профиля (handle_new_user)
  await new Promise(r => setTimeout(r, 1000));

  const { data: updateData, error: updateError } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', user.user.id)
    .select();

  if (updateError) {
    console.error('Ошибка изменения роли в profiles:', updateError);
  } else {
    console.log('✅ Роль администратора успешно назначена!');
    console.log('====================================');
    console.log('Вы можете войти в панель: http://localhost:8080/admin.html');
    console.log('Логин:', email);
    console.log('Пароль:', passwordSafe);
    console.log('====================================');
  }
}

createAdminUser();
