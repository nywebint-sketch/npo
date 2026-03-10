import * as db from './db.js';

// ---- УПРАВЛЕНИЕ АВТОРИЗАЦИЕЙ ----

const loginScreen = document.getElementById('adminLoginScreen');
const loginForm = document.getElementById('adminLoginForm');
const loginError = document.getElementById('loginError');
const adminPanel = document.getElementById('adminPanel');
const logoutBtn = document.getElementById('adminLogoutBtn');
const currentUserEmail = document.getElementById('adminCurrentEmail');

async function checkAuth() {
  try {
    const session = await db.getSession();
    if (session) {
      // Проверяем, что это именно админ
      const isAdmin = await db.checkIsAdmin();
      if (isAdmin) {
        loginScreen.classList.add('hidden');
        adminPanel.style.display = 'flex';
        currentUserEmail.textContent = session.user.email;
        loadDashboard();
      } else {
        // Юзер авторизован, но не админ
        await db.logout();
        loginError.textContent = 'У вас нет прав администратора';
        loginError.style.display = 'block';
        loginScreen.classList.remove('hidden');
        adminPanel.style.display = 'none';
      }
    } else {
      loginScreen.classList.remove('hidden');
      adminPanel.style.display = 'none';
    }
  } catch (err) {
    console.error(err);
    loginScreen.classList.remove('hidden');
    adminPanel.style.display = 'none';
  }
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = loginForm.email.value;
  const pass = loginForm.password.value;
  loginError.style.display = 'none';
  
  try {
    const res = await db.login(email, pass);
    if(res) {
       await checkAuth();
    }
  } catch(err) {
    loginError.textContent = 'Неверный логин или пароль';
    loginError.style.display = 'block';
  }
});

logoutBtn.addEventListener('click', async () => {
  await db.logout();
  checkAuth();
});

// ---- НАВИГАЦИЯ И ВЬЮШКИ ----

const navItems = document.querySelectorAll('.nav-item');
const viewContainer = document.getElementById('viewContainer');
const pageTitle = document.getElementById('pageTitle');
const addBtn = document.getElementById('addBtn');
let currentView = 'dashboard';

navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    navItems.forEach(nav => nav.classList.remove('active'));
    item.classList.add('active');
    
    currentView = item.dataset.view;
    pageTitle.textContent = item.textContent.replace(/[^\а-яА-Яa-zA-Z\s\(\)]/g, '').trim(); // Убираем эмодзи
    
    if (currentView === 'dashboard') loadDashboard();
    if (currentView === 'users') loadUsersView();
    if (currentView === 'events') loadEventsView();
    if (currentView === 'artists') loadArtistsView();
    if (currentView === 'releases') loadReleasesView();
    if (currentView === 'podcasts') loadPodcastsView();
    if (currentView === 'streams') loadStreamsView();
    if (currentView === 'merch') loadMerchView();
  });
});

// ---- ДАШБОРД ----
async function loadDashboard() {
  addBtn.style.display = 'none';
  const users = await db.getUsers();
  const events = await db.getEvents();
  const artists = await db.getArtists();
  const merch = await db.getMerch();

  viewContainer.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
      <div class="card pad" style="background: rgba(255,255,255,0.05)">
        <h3>Пользователей</h3>
        <p style="font-size: 32px; font-weight: bold; margin: 10px 0;">${users.length}</p>
      </div>
      <div class="card pad" style="background: rgba(255,255,255,0.05)">
        <h3>Афиша</h3>
        <p style="font-size: 32px; font-weight: bold; margin: 10px 0;">${events.length}</p>
      </div>
      <div class="card pad" style="background: rgba(255,255,255,0.05)">
        <h3>Артистов</h3>
        <p style="font-size: 32px; font-weight: bold; margin: 10px 0;">${artists.length}</p>
      </div>
      <div class="card pad" style="background: rgba(255,255,255,0.05)">
        <h3>Товаров (Мерч)</h3>
        <p style="font-size: 32px; font-weight: bold; margin: 10px 0;">${merch.length}</p>
      </div>
    </div>
  `;
}

// ---- ПОЛЬЗОВАТЕЛИ ----
async function loadUsersView() {
  addBtn.style.display = 'none'; // Пользователей администратор не добавляет вручную
  const rawUsers = await db.getUsers();
  const users = (rawUsers || []).filter(Boolean);

  const rows = users.map(u => {
    const email = u.email || '—';
    const name = u.name || '—';
    const role = u.role || 'member';
    const createdRaw = (u.created_at || u.createdAt || '');
    const created = (typeof createdRaw === 'string' && createdRaw.includes('T'))
      ? createdRaw.split('T')[0]
      : (createdRaw || '—');

    return `
    <tr>
      <td>${email}</td>
      <td>${name}</td>
      <td><span class="tag" style="background: ${role === 'admin' ? '#fff' : 'rgba(255,255,255,0.1)'}; color: ${role === 'admin' ? '#000' : '#fff'}">${role}</span></td>
      <td>${created}</td>
      <td>
        <div class="actions">
          <button class="btn-sm" onclick="app.makeAdmin('${u.id}')" ${role === 'admin' ? 'disabled style="opacity:0.3"' : ''}>Сделать админом</button>
        </div>
      </td>
    </tr>
    `;
  }).join('');

  viewContainer.innerHTML = `
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr><th>Email</th><th>Имя</th><th>Роль</th><th>Дата рег.</th><th>Действия</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

// ---- СОБЫТИЯ (АФИША) ----
async function loadEventsView() {
  addBtn.style.display = 'block';
  addBtn.textContent = '+ Добавить событие';
  addBtn.onclick = () => openEventEditor();

  const events = await db.getEvents();
  const rows = events.map(e => `
    <tr>
      <td><b>${e.title}</b></td>
      <td>${e.date.replace('T', ' ')}</td>
      <td>${e.place || '—'}</td>
      <td>${e.status}</td>
      <td>
        <div class="actions">
          <button class="btn-sm" onclick="app.editEvent('${e.id}')">Изменить</button>
          <button class="btn-sm danger" onclick="app.deleteEvent('${e.id}')">Удалить</button>
        </div>
      </td>
    </tr>
  `).join('');

  viewContainer.innerHTML = `
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr><th>Название</th><th>Дата</th><th>Площадка</th><th>Статус</th><th>Действия</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

// ---- АРТИСТЫ ----
async function loadArtistsView() {
  addBtn.style.display = 'block';
  addBtn.textContent = '+ Добавить артиста';
  addBtn.onclick = () => openArtistEditor();

  const artists = await db.getArtists();
  const rows = artists.map(a => `
    <tr>
      <td><b>${a.name}</b></td>
      <td>${a.role || '—'}</td>
      <td>${a.bookable ? 'Да' : 'Нет'}</td>
      <td>
        <div class="actions">
          <button class="btn-sm" onclick="app.editArtist('${a.id}')">Изменить</button>
          <button class="btn-sm danger" onclick="app.deleteArtist('${a.id}')">Удалить</button>
        </div>
      </td>
    </tr>
  `).join('');

  viewContainer.innerHTML = `
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr><th>Имя</th><th>Роль</th><th>Букинг</th><th>Действия</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

// ---- МОДАЛЬНЫЕ ОКНА И РЕДАКТОРЫ ----

const adminModal = document.getElementById('adminModal');
const editorTitle = document.getElementById('editorTitle');
const editorBody = document.getElementById('editorBody');
const editorClose = document.getElementById('editorClose');

editorClose.addEventListener('click', () => { adminModal.style.display = 'none'; });

// Редактор события
async function openEventEditor(id = null) {
  let event = { title: '', date: '', place: 'НПО Мелодия', status: 'tickets', about: '', lineup: [], tags: [] };
  let isEdit = false;

  if (id) {
    const events = await db.getEvents();
    event = events.find(e => e.id === id) || event;
    isEdit = true;
  }

  editorTitle.textContent = isEdit ? 'Редактировать событие' : 'Новое событие';
  
  editorBody.innerHTML = `
    <form id="editorForm" class="editor-form">
      <div class="form-group">
        <label>Название</label>
        <input type="text" name="title" value="${event.title}" required>
      </div>
      <div class="form-group">
        <label>Дата и время (YYYY-MM-DDTHH:MM)</label>
        <input type="datetime-local" name="date" value="${event.date}" required>
      </div>
      <div class="form-group">
        <label>Статус</label>
        <select name="status">
          <option value="tickets" ${event.status==='tickets'?'selected':''}>Билеты в продаже</option>
          <option value="archive" ${event.status==='archive'?'selected':''}>Архив</option>
          <option value="announce" ${event.status==='announce'?'selected':''}>Анонс (скоро)</option>
        </select>
      </div>
      <div class="form-group">
        <label>Описание</label>
        <textarea name="about">${event.about || ''}</textarea>
      </div>
      <div class="form-group">
        <label>Лайнап (через запятую)</label>
        <textarea name="lineup">${(event.lineup||[]).join(', ')}</textarea>
      </div>
      <div class="form-group">
        <label>Обложка / Фото</label>
        <div style="display:flex; gap: 10px; align-items:center; margin-bottom: 8px;">
           ${event.poster && !event.poster.startsWith('event') && !event.poster.startsWith('smile') ? `<img src="${event.poster}" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;">` : `<div style="width: 40px; height: 40px; background: rgba(255,255,255,0.1); border-radius: 4px;"></div>`}
           <input type="file" name="posterFile" accept="image/*" style="font-size: 14px;">
        </div>
        <div class="muted" style="font-size: 12px;">Оставьте пустым, чтобы не менять текущую картинку.</div>
      </div>
      
      <div class="editor-actions">
        <button type="button" class="btn ghost" onclick="document.getElementById('adminModal').style.display='none'">Отмена</button>
        <button type="submit" class="btn primary" id="saveEventBtn">Сохранить</button>
      </div>
    </form>
  `;

  adminModal.style.display = 'flex';

  document.getElementById('editorForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('saveEventBtn');
    btn.textContent = 'Сохранение...';
    btn.disabled = true;

    const fd = new FormData(e.target);
    
    // Загружаем картинку
    const file = fd.get('posterFile');
    let posterUrl = event.poster || 'smile.png';
    if (file && file.size > 0) {
       try {
         posterUrl = await db.uploadImage(file);
       } catch (err) {
         alert('Ошибка при загрузке картинки!');
         btn.textContent = 'Сохранить';
         btn.disabled = false;
         return;
       }
    }

    const data = {
      title: fd.get('title'),
      date: fd.get('date'),
      status: fd.get('status'),
      about: fd.get('about'),
      lineup: fd.get('lineup').split(',').map(s=>s.trim()).filter(s=>s), 
      place: event.place, 
      poster: posterUrl
    };

    if (isEdit) {
      await db.updateEvent(id, data);
    } else {
      await db.addEvent(data);
    }
    
    adminModal.style.display = 'none';
    loadEventsView();
  });
}

window.app.editEvent = openEventEditor;
window.app.deleteEvent = async (id) => {
  if(confirm('Точно удалить событие?')) {
    await db.deleteEvent(id);
    loadEventsView();
  }
};

// Редактор артиста
async function openArtistEditor(id = null) {
  let artist = { name: '', role: 'DJ', bookable: true, bio: '', tags: [] };
  let isEdit = false;

  if (id) {
    const artists = await db.getArtists();
    artist = artists.find(a => a.id === id) || artist;
    isEdit = true;
  }

  editorTitle.textContent = isEdit ? 'Редактировать артиста' : 'Новый артист';
  
  editorBody.innerHTML = `
    <form id="editorForm" class="editor-form">
      <div class="form-group">
        <label>Имя артиста</label>
        <input type="text" name="name" value="${artist.name}" required>
      </div>
      <div class="form-group">
        <label>Роль</label>
        <input type="text" name="role" value="${artist.role || ''}">
      </div>
      <div class="form-group">
        <label>Описание (Bio)</label>
        <textarea name="bio">${artist.bio || ''}</textarea>
      </div>
      <div class="form-group">
        <label>Доступен для букинга</label>
        <select name="bookable">
          <option value="true" ${artist.bookable?'selected':''}>Да</option>
          <option value="false" ${!artist.bookable?'selected':''}>Нет</option>
        </select>
      </div>
      <div class="form-group">
        <label>Обложка / Фото</label>
        <div style="display:flex; gap: 10px; align-items:center; margin-bottom: 8px;">
           ${artist.poster && !artist.poster.startsWith('smile') ? `<img src="${artist.poster}" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;">` : `<div style="width: 40px; height: 40px; background: rgba(255,255,255,0.1); border-radius: 4px;"></div>`}
           <input type="file" name="posterFile" accept="image/*" style="font-size: 14px;">
        </div>
        <div class="muted" style="font-size: 12px;">Оставьте пустым, чтобы не менять текущую картинку.</div>
      </div>
      
      <div class="editor-actions">
        <button type="button" class="btn ghost" onclick="document.getElementById('adminModal').style.display='none'">Отмена</button>
        <button type="submit" class="btn primary" id="saveArtistBtn">Сохранить</button>
      </div>
    </form>
  `;

  adminModal.style.display = 'flex';

  document.getElementById('editorForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('saveArtistBtn');
    btn.textContent = 'Сохранение...';
    btn.disabled = true;

    const fd = new FormData(e.target);

    // Загружаем картинку
    const file = fd.get('posterFile');
    let posterUrl = artist.poster || 'smile.png';
    if (file && file.size > 0) {
       try {
         posterUrl = await db.uploadImage(file);
       } catch (err) {
         alert('Ошибка при загрузке картинки!');
         btn.textContent = 'Сохранить';
         btn.disabled = false;
         return;
       }
    }

    const data = {
      name: fd.get('name'),
      role: fd.get('role'),
      bio: fd.get('bio'),
      bookable: fd.get('bookable') === 'true',
      tags: artist.tags,
      poster: posterUrl
    };

    if (isEdit) {
      await db.updateArtist(id, data);
    } else {
      await db.addArtist(data);
    }
    
    adminModal.style.display = 'none';
    loadArtistsView();
  });
}

window.app.editArtist = openArtistEditor;
window.app.deleteArtist = async (id) => {
  if(confirm('Точно удалить артиста?')) {
    await db.deleteArtist(id);
    loadArtistsView();
  }
};

// --- NEW VIEWS FOR PHASE 2 ---

// ---- РЕЛИЗЫ (RELEASES) ----
async function loadReleasesView() {
  addBtn.style.display = 'block';
  addBtn.onclick = () => alert("Открытие редактора релизов (в разработке)");

  const releases = await db.getReleases();

  const rows = releases.map(r => `
    <tr>
      <td>${r.title}</td>
      <td>${r.date}</td>
      <td>${r.format}</td>
      <td>
        <div class="actions">
          <button class="btn-sm" onclick="alert('Редактор релиза')">Ред.</button>
          <button class="btn-sm" style="color:red; background:rgba(255,0,0,0.1)" onclick="deleteReleaseHandler('${r.id}')">Удалить</button>
        </div>
      </td>
    </tr>
  `).join('');

  viewContainer.innerHTML = `
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr><th>Название</th><th>Дата</th><th>Формат</th><th>Действия</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}
window.deleteReleaseHandler = async (id) => {
  if (confirm('Точно удалить релиз?')) {
    await db.deleteRelease(id);
    loadReleasesView();
  }
};

// ---- ПОДКАСТЫ (PODCASTS) ----
async function loadPodcastsView() {
  addBtn.style.display = 'block';
  addBtn.onclick = () => alert("Открытие редактора подкастов (в разработке)");

  const podcasts = await db.getPodcasts();

  const rows = podcasts.map(r => `
    <tr>
      <td>${r.title}</td>
      <td>${r.date}</td>
      <td>
        <div class="actions">
          <button class="btn-sm" onclick="alert('Редактор подкаста')">Ред.</button>
          <button class="btn-sm" style="color:red; background:rgba(255,0,0,0.1)" onclick="deletePodcastHandler('${r.id}')">Удалить</button>
        </div>
      </td>
    </tr>
  `).join('');

  viewContainer.innerHTML = `
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr><th>Название</th><th>Дата</th><th>Действия</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}
window.deletePodcastHandler = async (id) => {
  if (confirm('Удалить подкаст?')) {
    await db.deletePodcast(id);
    loadPodcastsView();
  }
};

// ---- СТРИМЫ (STREAMS) ----
async function loadStreamsView() {
  addBtn.style.display = 'block';
  addBtn.onclick = () => alert("Открытие редактора стримов (в разработке)");

  const streams = await db.getStreams();

  const rows = streams.map(r => `
    <tr>
      <td>${r.title}</td>
      <td>${r.date}</td>
      <td>
        <div class="actions">
          <button class="btn-sm" onclick="alert('Редактор стрима')">Ред.</button>
          <button class="btn-sm" style="color:red; background:rgba(255,0,0,0.1)" onclick="deleteStreamHandler('${r.id}')">Удалить</button>
        </div>
      </td>
    </tr>
  `).join('');

  viewContainer.innerHTML = `
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr><th>Название</th><th>Дата</th><th>Действия</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}
window.deleteStreamHandler = async (id) => {
  if (confirm('Удалить запись трансляции?')) {
    await db.deleteStream(id);
    loadStreamsView();
  }
};

// ---- МЕРЧ (MERCH) ----
async function loadMerchView() {
  addBtn.style.display = 'block';
  addBtn.onclick = () => alert("Открытие редактора мерча (в разработке)");

  const merch = await db.getMerch();

  const rows = merch.map(r => `
    <tr>
      <td>${r.title}</td>
      <td>${r.price}</td>
      <td>${r.status}</td>
      <td>
        <div class="actions">
          <button class="btn-sm" onclick="alert('Редактор товара')">Ред.</button>
          <button class="btn-sm" style="color:red; background:rgba(255,0,0,0.1)" onclick="deleteMerchHandler('${r.id}')">Удалить</button>
        </div>
      </td>
    </tr>
  `).join('');

  viewContainer.innerHTML = `
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr><th>Название товара</th><th>Цена</th><th>Статус</th><th>Действия</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}
window.deleteMerchHandler = async (id) => {
  if (confirm('Точно удалить этот товар?')) {
    await db.deleteMerch(id);
    loadMerchView();
  }
};


// ---- ИНИЦИАЛИЗАЦИЯ ----
checkAuth();

