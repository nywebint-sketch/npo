// IMPORTANT:
// 1) Сохрани твою картинку рядом с index.html
// 2) Назови файл smile.png (или поменяй все src="smile.png" на свое имя)

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const pad2 = (n) => String(n).padStart(2, "0");

const fmtDT = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

const sortAsc = (arr, key) => [...arr].sort((a, b) => new Date(a[key]) - new Date(b[key]));

const data = {
  events: [
    { id: "e1", title: "Maslaynitsa", date: "2026-02-19T22:00:00", place: "НПО Мелодия", tags: ["live", "electronic"], status: "archive", poster: "event-maslaynitsa.jpg", about: "Ивент Maslaynitsa.", lineup: ["am1d", "di-au", "feel gainsbourg", "egor popov", "nyaono"] },
    { id: "e2", title: "Cliche", date: "2026-02-20T22:00:00", place: "НПО Мелодия", tags: ["club", "b2b"], status: "archive", poster: "event-cliche.jpg", about: "Ночной ивент Cliche.", lineup: ["ayokiddy", "fckshizy", "luxxomea", "manyice", "norman b2b void", "whysobored", "yardyard"] },
    { id: "e3", title: "Pirate Jet", date: "2026-02-28T20:00:00", place: "НПО Мелодия", tags: ["live", "concert"], status: "archive", poster: "event-pirate-jet.jpg", about: "Pirate Jet: концерты и live performance.", lineup: ["gummies (concert)", "черные бояре x света ефремова (live performance)", "m1lbeee (concert)", "ucuda (concert)", "фантом м-100 (live)", "valentin fufaev", "dj baby steps", "yze (concert)", "bogdamn"] },
    { id: "e4", title: "8 Марта — Первый уикенд весны", date: "2026-03-08T21:30:00", place: "НПО Мелодия", tags: ["weekend", "live", "32h"], status: "tickets", poster: "event-8-marta.jpg", ticketUrl: "https://moscow.qtickets.events/219423-78", about: "Первый уикенд весны — 32 часа. День 1. Двери: 21:30.", lineup: ["Line-up скоро"] },
    { id: "e5", title: "9 Марта — Первый уикенд весны (день 2)", date: "2026-03-09T17:00:00", place: "НПО Мелодия", tags: ["weekend", "8march"], status: "tickets", poster: "event-8-marta.jpg", ticketUrl: "https://moscow.qtickets.events/219423-78", about: "Продолжение уикенда весны. День 2. Полный анонс по лайнапу — скоро.", lineup: ["Line-up скоро"] }
  ],
  artists: [
    { id: "a2", name: "AND", role: "Live act", bookable: true, tags: ["live", "hardware"], bio: "Живой сет с железом." },
    { id: "a3", name: "WEI", role: "DJ / live", bookable: true, tags: ["live", "octatrack"], bio: "WEI", poster: "wei.jpg" },
    { id: "a4", name: "ZED", role: "DJ / guest", bookable: true, tags: ["industrial", "fast"], bio: "Индастриал/фаст." },
    { id: "a5", name: "LATY", role: "Selector", bookable: true, tags: ["breaks", "leftfield"], bio: "Лефтфилд селекция." },
    { id: "a6", name: "RHA", role: "Podcast host", bookable: true, tags: ["talk", "curation"], bio: "Ведущий подкаста." }
  ],
  releases: [
    { id: "r1", title: "NPO VA 001", date: "2026-02-28", format: "digital", tracklist: ["Track 1", "Track 2", "Track 3"] },
    { id: "r2", title: "KIRA - Night Tools EP", date: "2026-03-15", format: "vinyl", tracklist: ["A1", "A2", "B1", "B2"] },
    { id: "r3", title: "NPO LIVE - Session Cuts", date: "2026-03-22", format: "digital", tracklist: ["Cut 1", "Cut 2"] }
  ],
  podcasts: [
    { id: "p1", title: "NPO Podcast 01: GUEST A", date: "2026-02-18", note: "Разговор + сет." },
    { id: "p2", title: "NPO Podcast 02: KIRA", date: "2026-03-05", note: "Сет + треклист." }
  ],
  streams: [
    { id: "s1", title: "Replay: Warehouse Night", date: "2026-02-10" },
    { id: "s2", title: "Replay: Guest Session", date: "2026-02-03" },
    { id: "s3", title: "Replay: Community Night", date: "2026-01-27" }
  ],
  merch: [
    { id: "m1", title: "T-shirt NPO", price: "3500 ₽", status: "preorder", desc: "Плотный хлопок, белый принт." },
    { id: "m2", title: "Cap NPO", price: "1900 ₽", status: "in_stock", desc: "Вышивка." },
    { id: "m3", title: "Sticker pack", price: "450 ₽", status: "in_stock", desc: "Набор наклеек." },
    { id: "m4", title: "Totebag", price: "2400 ₽", status: "preorder", desc: "Хлопок, трафарет." }
  ]
};

const BOOKING_ADMIN_ENDPOINT = "https://httpbin.org/post";
const BOOKING_COOLDOWN_MS = 60 * 1000;
const BOOKING_MIN_FILL_MS = 3000;
const BOOKING_KEY = "npo_booking_last_submit_ts";
const CLUB_TOKEN_KEY = "npo_club_token_v1";
const CLUB_API_BASE = window.location.protocol === "file:" ? "http://localhost:8000" : "";

let showUpcoming = false;

const el = (tag, { className, text } = {}) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

const safeHttpUrl = (value) => {
  if (!value) return "";
  try {
    const url = new URL(value, window.location.origin);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
};

const createTag = (text) => el("span", { className: "tag", text: String(text || "").trim() || "—" });

const readClubToken = () => localStorage.getItem(CLUB_TOKEN_KEY) || "";
const saveClubToken = (token) => {
  if (!token) {
    localStorage.removeItem(CLUB_TOKEN_KEY);
    return;
  }
  localStorage.setItem(CLUB_TOKEN_KEY, token);
};

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const clubApiUrl = (path) => `${CLUB_API_BASE}${path}`;

const parseJsonSafe = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const clubRequest = async (path, { method = "GET", body = null, auth = true } = {}) => {
  const headers = { "Content-Type": "application/json" };
  const token = readClubToken();
  if (auth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(clubApiUrl(path), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const payload = await parseJsonSafe(response);
  if (!response.ok) {
    const message = payload?.error || payload?.message || "Ошибка запроса";
    throw new Error(message);
  }
  return payload || {};
};

let clubSession = null;

function renderExclusiveItems(items = []) {
  const exclusiveContent = $("#exclusiveContent");
  if (!exclusiveContent) return;
  exclusiveContent.replaceChildren();

  items.forEach((item) => {
    const card = el("div", { className: "card pad" });
    card.appendChild(el("b", { text: item.title || "Эксклюзив" }));
    const desc = el("div", { className: "muted", text: item.description || "" });
    desc.style.marginTop = "6px";
    card.appendChild(desc);
    exclusiveContent.appendChild(card);
  });
}

function renderClubAccess() {
  const authGuest = $("#authGuest");
  const authMember = $("#authMember");
  const memberName = $("#memberName");
  const authStatus = $("#authStatus");
  const exclusiveLocked = $("#exclusiveLocked");
  const exclusiveContent = $("#exclusiveContent");
  const exclusiveBadge = $("#exclusiveBadge");

  const isAuthorized = Boolean(clubSession?.email);

  if (authGuest) authGuest.hidden = isAuthorized;
  if (authMember) authMember.hidden = !isAuthorized;
  if (memberName) memberName.textContent = clubSession?.name || clubSession?.email || "участник";

  if (exclusiveLocked) exclusiveLocked.hidden = isAuthorized;
  if (exclusiveContent) exclusiveContent.hidden = !isAuthorized;
  if (exclusiveBadge) exclusiveBadge.textContent = isAuthorized ? "открыт" : "закрыт";

  if (authStatus) {
    authStatus.textContent = isAuthorized
      ? "Доступ к эксклюзиву активен."
      : "Доступ к эксклюзиву закрыт.";
  }
}

function setClubStatus(message) {
  const authStatus = $("#authStatus");
  if (authStatus && message) authStatus.textContent = message;
}

async function refreshClubSession() {
  const token = readClubToken();
  if (!token) {
    clubSession = null;
    renderClubAccess();
    return;
  }

  try {
    const me = await clubRequest("/api/auth/me");
    clubSession = me.user || null;

    const exclusive = await clubRequest("/api/exclusive");
    renderExclusiveItems(exclusive.items || []);
    renderClubAccess();
  } catch {
    saveClubToken("");
    clubSession = null;
    renderClubAccess();
  }
}

function initClubAuth() {
  const registerForm = $("#registerForm");
  const loginForm = $("#loginForm");
  const logoutBtn = $("#logoutBtn");

  registerForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = String(form.elements.name?.value || "").trim();
    const email = normalizeEmail(form.elements.email?.value);
    const password = String(form.elements.password?.value || "");
    const password2 = String(form.elements.password2?.value || "");

    if (!name || name.length < 2) {
      setClubStatus("Имя должно быть не короче 2 символов.");
      return;
    }
    if (!isValidEmail(email)) {
      setClubStatus("Укажи корректный email.");
      return;
    }
    if (password.length < 6) {
      setClubStatus("Пароль должен быть не короче 6 символов.");
      return;
    }
    if (password !== password2) {
      setClubStatus("Пароли не совпадают.");
      return;
    }

    try {
      const result = await clubRequest("/api/auth/register", {
        method: "POST",
        body: { name, email, password },
        auth: false
      });

      saveClubToken(result.token || "");
      clubSession = result.user || null;
      form.reset();
      renderExclusiveItems(result.items || []);
      renderClubAccess();
      setClubStatus("Регистрация успешна. Эксклюзив открыт.");
    } catch (err) {
      setClubStatus(err.message || "Ошибка регистрации.");
    }
  });

  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = normalizeEmail(form.elements.email?.value);
    const password = String(form.elements.password?.value || "");

    if (!isValidEmail(email) || !password) {
      setClubStatus("Укажи email и пароль.");
      return;
    }

    try {
      const result = await clubRequest("/api/auth/login", {
        method: "POST",
        body: { email, password },
        auth: false
      });
      saveClubToken(result.token || "");
      clubSession = result.user || null;
      form.reset();
      renderExclusiveItems(result.items || []);
      renderClubAccess();
      setClubStatus("Вход выполнен. Эксклюзив открыт.");
    } catch (err) {
      setClubStatus(err.message || "Неверный email или пароль.");
    }
  });

  logoutBtn?.addEventListener("click", async () => {
    try {
      await clubRequest("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore network/logout errors on client, local session is still cleared
    }
    saveClubToken("");
    clubSession = null;
    renderClubAccess();
    setClubStatus("Ты вышел из аккаунта.");
  });

  refreshClubSession();
}

function setupOpenCard(node, type, id) {
  if (!node) return;
  node.classList.add("open-card");
  node.dataset.open = type;
  node.dataset.id = id;
  node.tabIndex = 0;
  node.setAttribute("role", "button");
  node.addEventListener("pointerdown", () => node.classList.add("is-pressed"));
  ["pointerup", "pointerleave", "pointercancel", "blur"].forEach((evt) => {
    node.addEventListener(evt, () => node.classList.remove("is-pressed"));
  });
  node.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter" || ev.key === " ") {
      ev.preventDefault();
      node.click();
    }
  });
}

function createMedia(imgSrc, imgAlt, className = "media") {
  const media = el("div", { className });
  const img = document.createElement("img");
  img.src = imgSrc || "smile.png";
  img.alt = imgAlt || "";
  media.appendChild(img);
  return media;
}

function renderEvents() {
  const wrap = $("#eventsGrid");
  if (!wrap) return;
  wrap.replaceChildren();

  const now = new Date();
  let list = sortAsc(data.events, "date");

  if (showUpcoming) {
    list = list.filter((e) => new Date(e.date) >= now);
  } else {
    const upcoming = list.filter((e) => new Date(e.date) >= now);
    const past = list.filter((e) => new Date(e.date) < now).reverse();
    list = [...upcoming, ...past];
  }

  list.forEach((eventItem) => {
    const titleTokens = String(eventItem.title || "").trim().split(/\s+/).filter(Boolean);
    const firstWord = titleTokens.find((token) => /[A-Za-zА-Яа-яЁё]/.test(token)) || titleTokens[0] || "—";
    const shortTitle = firstWord.replace(/[.,:;!?]+$/g, "");

    const card = el("div", { className: "card" });
    card.appendChild(createMedia(eventItem.poster || "smile.png", eventItem.title, "media event-media"));

    const pad = el("div", { className: "pad" });
    pad.appendChild(el("div", { className: "muted event-card-date", text: fmtDT(eventItem.date) }));
    pad.appendChild(el("b", { className: "event-card-title", text: shortTitle }));

    card.appendChild(pad);
    setupOpenCard(card, "event", eventItem.id);
    wrap.appendChild(card);
  });

  const next = sortAsc(data.events, "date").filter((e) => new Date(e.date) >= now)[0];
  const nextEventPill = $("#nextEventPill");
  if (nextEventPill) {
    nextEventPill.textContent = next ? `Следующий ивент: ${next.title} · ${fmtDT(next.date)}` : "Следующий ивент: —";
  }
}

const toggleUpcomingBtn = $("#toggleUpcoming");
if (toggleUpcomingBtn) {
  toggleUpcomingBtn.addEventListener("click", () => {
    showUpcoming = !showUpcoming;
    toggleUpcomingBtn.textContent = `Показать: ${showUpcoming ? "ближайшие" : "все"}`;
    renderEvents();
  });
}

function renderArtists() {
  const searchEl = $("#artistSearch");
  const q = ((searchEl && searchEl.value) || "").trim().toLowerCase();
  const wrap = $("#artistsGrid");
  if (!wrap) return;
  wrap.replaceChildren();

  let list = [...data.artists].sort((a, b) => {
    if (a.name === "WEI" && b.name !== "WEI") return -1;
    if (b.name === "WEI" && a.name !== "WEI") return 1;
    return a.name.localeCompare(b.name);
  });

  if (q) {
    list = list.filter((a) =>
      a.name.toLowerCase().includes(q) ||
      a.role.toLowerCase().includes(q) ||
      (a.tags || []).join(" ").toLowerCase().includes(q)
    );
  }

  list.slice(0, 6).forEach((artist) => {
    const card = el("div", { className: "card artist-card" });
    card.appendChild(createMedia(artist.poster || "smile.png", artist.name, "media square"));

    const pad = el("div", { className: "pad artist-card-body" });
    pad.appendChild(el("b", { className: "artist-card-name", text: artist.name }));
    card.appendChild(pad);

    setupOpenCard(card, "artist", artist.id);
    wrap.appendChild(card);
  });
}

function renderReleases() {
  const wrap = $("#releasesGrid");
  if (!wrap) return;
  wrap.replaceChildren();

  [...data.releases].sort((a, b) => b.date.localeCompare(a.date)).forEach((release) => {
    const card = el("div", { className: "card" });
    card.appendChild(createMedia("smile.png", "", "media square"));

    const pad = el("div", { className: "pad" });
    const row = el("div", { className: "row sp" });

    const title = el("b", { text: release.title });
    title.style.maxWidth = "70%";
    title.style.overflow = "hidden";
    title.style.textOverflow = "ellipsis";
    title.style.whiteSpace = "nowrap";

    row.appendChild(title);
    row.appendChild(createTag(release.format));
    pad.appendChild(row);

    const date = el("div", { className: "muted", text: release.date });
    date.style.marginTop = "6px";
    pad.appendChild(date);

    card.appendChild(pad);
    setupOpenCard(card, "release", release.id);
    wrap.appendChild(card);
  });
}

function renderStreams() {
  const wrap = $("#streamsList");
  if (!wrap) return;
  wrap.replaceChildren();

  data.streams.forEach((stream) => {
    const row = el("div", { className: "card pad" });
    const content = el("div", { className: "row sp" });

    const title = el("b", { text: stream.title });
    title.style.maxWidth = "72%";
    title.style.overflow = "hidden";
    title.style.textOverflow = "ellipsis";
    title.style.whiteSpace = "nowrap";

    content.appendChild(title);
    content.appendChild(createTag(stream.date));
    row.appendChild(content);

    setupOpenCard(row, "stream", stream.id);
    wrap.appendChild(row);
  });

  const now = new Date();
  const next = sortAsc(data.events, "date").filter((e) => new Date(e.date) >= now)[0];
  const streamNext = $("#streamNext");
  if (streamNext) {
    streamNext.textContent = next ? `Следующий эфир: ${next.title} · ${fmtDT(next.date)}` : "Следующий эфир: —";
  }
}

function renderMerch() {
  const wrap = $("#merchGrid");
  if (!wrap) return;
  wrap.replaceChildren();

  data.merch.forEach((item) => {
    const card = el("div", { className: "card" });
    card.appendChild(createMedia("smile.png", "", "media square"));

    const pad = el("div", { className: "pad" });
    const row = el("div", { className: "row sp" });
    row.appendChild(el("b", { text: item.title }));
    row.appendChild(createTag(item.status));
    pad.appendChild(row);

    const price = el("div", { className: "muted", text: item.price });
    price.style.marginTop = "6px";
    pad.appendChild(price);

    card.appendChild(pad);
    setupOpenCard(card, "merch", item.id);
    wrap.appendChild(card);
  });
}

const modal = $("#modal");
const mTitle = $("#mTitle");
const mSub = $("#mSub");
const mBody = $("#mBody");

const openModal = ({ title, sub, body }) => {
  if (mTitle) mTitle.textContent = title || "—";
  if (mSub) mSub.textContent = sub || "";
  if (mBody) mBody.replaceChildren(body || document.createTextNode(""));
  if (modal) modal.style.display = "flex";
};

const closeModal = () => {
  if (modal) modal.style.display = "none";
};

const appendDivider = (parent) => parent.appendChild(el("div", { className: "divider" }));

function buildEventModalBody(eventItem) {
  const grid = el("div", { className: "grid g2" });

  const left = el("div", { className: "card" });
  left.appendChild(createMedia(eventItem.poster || "smile.png", eventItem.title, "media"));
  const leftPad = el("div", { className: "pad" });

  const tagsRow = el("div", { className: "row" });
  (eventItem.tags || []).forEach((tag) => tagsRow.appendChild(createTag(tag)));
  leftPad.appendChild(tagsRow);
  appendDivider(leftPad);
  leftPad.appendChild(el("b", { text: "Описание" }));
  const about = el("div", { className: "muted", text: eventItem.about || "—" });
  about.style.marginTop = "8px";
  leftPad.appendChild(about);

  left.appendChild(leftPad);

  const right = el("div", { className: "card pad" });
  right.appendChild(el("b", { text: "Лайнап" }));
  appendDivider(right);

  const lineup = el("div", { className: "muted" });
  (eventItem.lineup || []).forEach((name, idx) => {
    if (idx > 0) lineup.appendChild(document.createElement("br"));
    lineup.appendChild(document.createTextNode(name));
  });
  right.appendChild(lineup);

  appendDivider(right);

  const actionRow = el("div", { className: "row sp" });
  actionRow.appendChild(createTag(eventItem.status || "—"));

  const ticketUrl = safeHttpUrl(eventItem.ticketUrl);
  if (ticketUrl) {
    const link = el("a", { className: "btn primary", text: "Билеты / регистрация" });
    link.href = ticketUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    actionRow.appendChild(link);
  } else {
    const button = el("button", { className: "btn primary", text: "Билеты / регистрация" });
    button.type = "button";
    button.addEventListener("click", () => alert("Тут будет ссылка на билеты/регистрацию"));
    actionRow.appendChild(button);
  }

  right.appendChild(actionRow);

  grid.appendChild(left);
  grid.appendChild(right);
  return grid;
}

function buildArtistModalBody(artist) {
  const grid = el("div", { className: "grid g2" });

  const left = el("div", { className: "card" });
  const mediaClass = artist.poster ? "media square cover" : "media square";
  left.appendChild(createMedia(artist.poster || "smile.png", artist.name, mediaClass));
  const leftPad = el("div", { className: "pad" });

  const tagsRow = el("div", { className: "row" });
  (artist.tags || []).forEach((tag) => tagsRow.appendChild(createTag(tag)));
  leftPad.appendChild(tagsRow);

  appendDivider(leftPad);
  leftPad.appendChild(el("b", { text: "Bio" }));
  const bio = el("div", { className: "muted", text: artist.bio || "—" });
  bio.style.marginTop = "8px";
  leftPad.appendChild(bio);

  left.appendChild(leftPad);

  const right = el("div", { className: "card pad" });
  right.appendChild(el("b", { text: "Букинг" }));
  appendDivider(right);

  const info = el("div", { className: "muted", text: "Заполни форму и отправь заявку." });
  info.style.marginBottom = "10px";
  right.appendChild(info);

  const form = el("form", { className: "grid booking-form-modal" });
  form.dataset.artistId = artist.id;
  form.dataset.artistName = artist.name;
  form.dataset.artistBookable = artist.bookable ? "1" : "0";
  form.dataset.renderedAt = String(Date.now());
  form.style.gap = "10px";

  const addInput = (name, placeholder, required = true) => {
    const input = el("input", { className: "input" });
    input.name = name;
    input.placeholder = placeholder;
    input.required = required;
    return input;
  };

  form.appendChild(addInput("date", "Дата (например 14.03.2026)"));
  form.appendChild(addInput("city", "Город"));
  form.appendChild(addInput("venue", "Площадка / клуб"));
  form.appendChild(addInput("format", "Формат (DJ / live / hybrid)"));
  form.appendChild(addInput("contacts", "Контакты (telegram/email)"));

  const honeypot = addInput("website", "Ваш сайт", false);
  honeypot.tabIndex = -1;
  honeypot.autocomplete = "off";
  honeypot.style.position = "absolute";
  honeypot.style.left = "-9999px";
  honeypot.setAttribute("aria-hidden", "true");
  form.appendChild(honeypot);

  const note = document.createElement("textarea");
  note.name = "note";
  note.placeholder = "Комментарий (опционально)";
  form.appendChild(note);

  const submit = el("button", { className: "btn primary", text: "Отправить заявку" });
  submit.type = "submit";
  form.appendChild(submit);

  const status = el("div", { className: "muted booking-status", text: "Ожидание отправки" });
  status.style.fontSize = "13px";
  form.appendChild(status);

  right.appendChild(form);

  grid.appendChild(left);
  grid.appendChild(right);
  return grid;
}

function buildReleaseModalBody(release) {
  const grid = el("div", { className: "grid g2" });

  const left = el("div", { className: "card" });
  left.appendChild(createMedia("smile.png", "", "media square"));
  const leftPad = el("div", { className: "pad" });
  leftPad.appendChild(el("b", { text: "Треклист" }));
  appendDivider(leftPad);

  const tracklist = el("div", { className: "muted" });
  (release.tracklist || []).forEach((track, idx) => {
    if (idx > 0) tracklist.appendChild(document.createElement("br"));
    tracklist.appendChild(document.createTextNode(`• ${track}`));
  });
  leftPad.appendChild(tracklist);

  left.appendChild(leftPad);

  const right = el("div", { className: "card pad" });
  right.appendChild(el("b", { text: "Ссылки" }));
  appendDivider(right);

  const links = el("div", { className: "row" });
  const bandcamp = el("button", { className: "btn", text: "Bandcamp" });
  bandcamp.type = "button";
  bandcamp.addEventListener("click", () => alert("Bandcamp (поставишь ссылку)"));
  links.appendChild(bandcamp);

  const soundcloud = el("button", { className: "btn", text: "SoundCloud" });
  soundcloud.type = "button";
  soundcloud.addEventListener("click", () => alert("SoundCloud (поставишь ссылку)"));
  links.appendChild(soundcloud);

  right.appendChild(links);
  appendDivider(right);
  right.appendChild(el("div", { className: "muted", text: "Кредиты: мастеринг / арт / лейбл (тест)." }));

  grid.appendChild(left);
  grid.appendChild(right);
  return grid;
}

function buildStreamModalBody(stream) {
  const card = el("div", { className: "card pad" });
  card.appendChild(el("b", { text: "Воспроизведение" }));
  appendDivider(card);
  card.appendChild(createMedia("smile.png", "", "media wide"));

  const hint = el("div", { className: "muted", text: "Тут будет YouTube/Vimeo embed." });
  hint.style.marginTop = "10px";
  card.appendChild(hint);
  return card;
}

function buildMerchModalBody(item) {
  const grid = el("div", { className: "grid g2" });

  const left = el("div", { className: "card" });
  left.appendChild(createMedia("smile.png", "", "media square"));
  const leftPad = el("div", { className: "pad" });
  leftPad.appendChild(el("b", { text: "Описание" }));
  appendDivider(leftPad);
  leftPad.appendChild(el("div", { className: "muted", text: item.desc || "—" }));
  left.appendChild(leftPad);

  const right = el("div", { className: "card pad" });
  right.appendChild(el("b", { text: "Оформление" }));
  appendDivider(right);
  right.appendChild(el("div", { className: "muted", text: "Пока предзаказ. Потом подключим оплату." }));

  const spacer = el("div");
  spacer.style.height = "12px";
  right.appendChild(spacer);

  const button = el("button", { className: "btn primary", text: "Предзаказ" });
  button.type = "button";
  button.addEventListener("click", () => alert("Тут будет форма/бот"));
  right.appendChild(button);

  grid.appendChild(left);
  grid.appendChild(right);
  return grid;
}

const openEventModal = (eventItem) => {
  if (!eventItem) return;
  openModal({
    title: eventItem.title,
    sub: `${fmtDT(eventItem.date)} · ${eventItem.place || "—"}`,
    body: buildEventModalBody(eventItem)
  });
};

$("#mClose")?.addEventListener("click", closeModal);
modal?.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

document.addEventListener("click", (e) => {
  const card = e.target.closest("[data-open]");
  if (!card) return;

  const type = card.dataset.open;
  const id = card.dataset.id;

  if (type === "event") {
    openEventModal(data.events.find((x) => x.id === id));
    return;
  }

  if (type === "artist") {
    const artist = data.artists.find((x) => x.id === id);
    if (!artist) return;
    openModal({
      title: artist.name,
      sub: `${artist.role} · ${artist.bookable ? "доступен для букинга" : "не на букинге"}`,
      body: buildArtistModalBody(artist)
    });
    return;
  }

  if (type === "release") {
    const release = data.releases.find((x) => x.id === id);
    if (!release) return;
    openModal({
      title: release.title,
      sub: `${release.date} · ${release.format}`,
      body: buildReleaseModalBody(release)
    });
    return;
  }

  if (type === "podcast") {
    const podcast = data.podcasts.find((x) => x.id === id);
    if (!podcast) return;
    const body = el("div", { className: "grid g2" });
    const left = el("div", { className: "card pad" });
    left.appendChild(el("b", { text: "Плеер" }));
    appendDivider(left);
    left.appendChild(createMedia("smile.png", "", "media wide"));
    const embedHint = el("div", { className: "muted", text: "Здесь будет SoundCloud embed." });
    embedHint.style.marginTop = "10px";
    left.appendChild(embedHint);

    const right = el("div", { className: "card pad" });
    right.appendChild(el("b", { text: "Описание" }));
    appendDivider(right);
    right.appendChild(el("div", { className: "muted", text: podcast.note || "—" }));
    appendDivider(right);
    right.appendChild(el("b", { text: "Треклист" }));
    const tracks = el("div", { className: "muted", text: "Тест: • Track A • Track B • Track C" });
    tracks.style.marginTop = "8px";
    right.appendChild(tracks);

    body.appendChild(left);
    body.appendChild(right);

    openModal({ title: podcast.title, sub: podcast.date, body });
    return;
  }

  if (type === "stream") {
    const stream = data.streams.find((x) => x.id === id);
    if (!stream) return;
    openModal({ title: stream.title, sub: stream.date, body: buildStreamModalBody(stream) });
    return;
  }

  if (type === "merch") {
    const item = data.merch.find((x) => x.id === id);
    if (!item) return;
    openModal({ title: item.title, sub: `${item.price} · ${item.status}`, body: buildMerchModalBody(item) });
  }
});

const validateText = (value, { min = 2, max = 120, pattern = null } = {}) => {
  const str = String(value || "").trim();
  if (str.length < min || str.length > max) return false;
  if (str.includes("<") || str.includes(">")) return false;
  if (pattern && !pattern.test(str)) return false;
  return true;
};

const validateBookingPayload = (payload) => {
  if (!validateText(payload.date, { min: 4, max: 40 })) return "Укажи корректную дату";
  if (!validateText(payload.city, { min: 2, max: 80 })) return "Укажи корректный город";
  if (!validateText(payload.venue, { min: 2, max: 120 })) return "Укажи корректную площадку";
  if (!validateText(payload.format, { min: 2, max: 40 })) return "Укажи корректный формат";
  if (!validateText(payload.contacts, { min: 4, max: 120 })) return "Укажи корректные контакты";
  if (!validateText(payload.artistName, { min: 1, max: 80 })) return "Некорректный артист";
  if (payload.note && !validateText(payload.note, { min: 0, max: 500 })) return "Комментарий слишком длинный";
  return "";
};

const getBookingCooldownLeft = () => {
  const last = Number(localStorage.getItem(BOOKING_KEY) || 0);
  if (!last) return 0;
  return Math.max(0, BOOKING_COOLDOWN_MS - (Date.now() - last));
};

document.addEventListener("submit", async (e) => {
  const bookingForm = e.target.closest(".booking-form-modal");
  if (!bookingForm) return;
  e.preventDefault();

  const bookingStatus = $(".booking-status", bookingForm);
  const bookingSubmit = bookingForm.querySelector('button[type="submit"]');

  const endpoint = safeHttpUrl(BOOKING_ADMIN_ENDPOINT);
  if (!endpoint) {
    if (bookingStatus) bookingStatus.textContent = "Ошибка конфигурации endpoint";
    return;
  }

  if (bookingForm.dataset.artistBookable !== "1") {
    if (bookingStatus) bookingStatus.textContent = "Этот артист сейчас не на букинге";
    return;
  }

  const honeypotValue = bookingForm.elements.website?.value?.trim();
  if (honeypotValue) {
    if (bookingStatus) bookingStatus.textContent = "Заявка отклонена";
    return;
  }

  const renderedAt = Number(bookingForm.dataset.renderedAt || 0);
  if (Date.now() - renderedAt < BOOKING_MIN_FILL_MS) {
    if (bookingStatus) bookingStatus.textContent = "Слишком быстро. Проверь форму и отправь снова.";
    return;
  }

  const cooldownLeft = getBookingCooldownLeft();
  if (cooldownLeft > 0) {
    if (bookingStatus) bookingStatus.textContent = `Подожди ${Math.ceil(cooldownLeft / 1000)} сек перед повторной отправкой`;
    return;
  }

  const payload = {
    artistId: bookingForm.dataset.artistId || "",
    artistName: bookingForm.dataset.artistName || "",
    date: bookingForm.elements.date.value.trim(),
    city: bookingForm.elements.city.value.trim(),
    venue: bookingForm.elements.venue.value.trim(),
    format: bookingForm.elements.format.value.trim(),
    contacts: bookingForm.elements.contacts.value.trim(),
    note: bookingForm.elements.note.value.trim(),
    source: "npo-melodiya-site",
    createdAt: new Date().toISOString(),
    userAgent: navigator.userAgent
  };

  const validationError = validateBookingPayload(payload);
  if (validationError) {
    if (bookingStatus) bookingStatus.textContent = validationError;
    return;
  }

  if (bookingStatus) bookingStatus.textContent = "Отправка...";
  if (bookingSubmit) bookingSubmit.disabled = true;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    localStorage.setItem(BOOKING_KEY, String(Date.now()));
    if (bookingStatus) bookingStatus.textContent = "Заявка отправлена в админку";
    bookingForm.reset();
    bookingForm.dataset.renderedAt = String(Date.now());
  } catch (err) {
    if (bookingStatus) bookingStatus.textContent = "Ошибка отправки. Попробуй позже.";
    console.error(err);
  } finally {
    clearTimeout(timeout);
    if (bookingSubmit) bookingSubmit.disabled = false;
  }
});

const navLinks = $$(".nav a");
const sections = navLinks.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);

const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      }
    });
  },
  { rootMargin: "-50% 0px -45% 0px", threshold: 0.01 }
);
sections.forEach((section) => io.observe(section));

const mobileMenuToggle = $("#mobileMenuToggle");
const mobileMenu = $("#mobileMenu");
const mobileMenuBackdrop = $("#mobileMenuBackdrop");
const mobileLinks = $$("#mobileMenu a");
const mobileBp = window.matchMedia("(max-width: 980px)");

const closeMobileMenu = () => {
  document.body.classList.remove("menu-open");
  mobileMenuToggle?.setAttribute("aria-expanded", "false");
  if (mobileMenu) mobileMenu.hidden = true;
  if (mobileMenuBackdrop) mobileMenuBackdrop.hidden = true;
};

const openMobileMenu = () => {
  if (mobileMenu) mobileMenu.hidden = false;
  if (mobileMenuBackdrop) mobileMenuBackdrop.hidden = false;
  document.body.classList.add("menu-open");
  mobileMenuToggle?.setAttribute("aria-expanded", "true");
};

mobileMenuToggle?.addEventListener("click", (e) => {
  e.preventDefault();
  if (!mobileBp.matches) {
    window.location.hash = "home";
    return;
  }
  if (document.body.classList.contains("menu-open")) closeMobileMenu();
  else openMobileMenu();
});

mobileMenuBackdrop?.addEventListener("click", closeMobileMenu);
mobileLinks.forEach((link) => link.addEventListener("click", closeMobileMenu));

window.addEventListener("resize", () => {
  if (!mobileBp.matches) closeMobileMenu();
  renderArtists();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeMobileMenu();
    closeModal();
  }
});

const yearNode = $("#year");
if (yearNode) yearNode.textContent = new Date().getFullYear();
renderEvents();
renderArtists();
renderReleases();
renderStreams();
renderMerch();
initClubAuth();
