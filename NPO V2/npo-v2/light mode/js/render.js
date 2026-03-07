import { createNode, createTag, formatDateTime, safeHttpUrl, sortByDateAsc } from "./utils.js";

const createMedia = (src, alt, className = "media") => {
  const media = createNode("div", { className });
  const image = createNode("img", { attrs: { src: src || "smile.png", alt: alt || "" } });
  media.appendChild(image);
  return media;
};

const setupOpenCard = (node, type, id) => {
  node.classList.add("open-card");
  node.dataset.open = type;
  node.dataset.id = id;
  node.tabIndex = 0;
  node.setAttribute("role", "button");
};

const createDivider = () => createNode("div", { className: "divider" });

export const renderEvents = ({ data, dom }) => {
  if (!dom.eventsGrid) return;
  dom.eventsGrid.replaceChildren();

  const now = new Date();
  const upcoming = [];
  const past = [];

  sortByDateAsc(data.events, "date").forEach((eventItem) => {
    if (new Date(eventItem.date) >= now) upcoming.push(eventItem);
    else past.unshift(eventItem);
  });

  [...upcoming, ...past].forEach((eventItem) => {
    const card = createNode("div", { className: "card" });
    card.appendChild(createMedia(eventItem.poster, eventItem.title, "media event-media"));

    const pad = createNode("div", { className: "pad" });
    pad.appendChild(createNode("div", { className: "muted event-card-date", text: formatDateTime(eventItem.date) }));
    pad.appendChild(createNode("b", { className: "event-card-title", text: eventItem.title }));

    card.appendChild(pad);
    setupOpenCard(card, "event", eventItem.id);
    dom.eventsGrid.appendChild(card);
  });

  if (dom.streamNext) {
    const nextEvent = upcoming[0] || null;
    dom.streamNext.textContent = nextEvent ? `Следующий эфир: ${nextEvent.title} · ${formatDateTime(nextEvent.date)}` : "Следующий эфир: —";
  }
};

export const renderArtists = ({ data, dom }) => {
  if (!dom.artistsGrid) return;
  dom.artistsGrid.replaceChildren();

  const list = [...data.artists].sort((a, b) => {
    if (a.name === "WEI" && b.name !== "WEI") return -1;
    if (b.name === "WEI" && a.name !== "WEI") return 1;
    return a.name.localeCompare(b.name);
  });

  list.slice(0, 6).forEach((artist) => {
    const card = createNode("div", { className: "card artist-card" });
    card.appendChild(createMedia(artist.poster, artist.name, "media square"));

    const body = createNode("div", { className: "pad artist-card-body" });
    body.appendChild(createNode("b", { className: "artist-card-name", text: artist.name }));
    card.appendChild(body);

    setupOpenCard(card, "artist", artist.id);
    dom.artistsGrid.appendChild(card);
  });
};

export const renderReleases = ({ data, dom }) => {
  if (!dom.releasesGrid) return;
  dom.releasesGrid.replaceChildren();

  [...data.releases].sort((a, b) => b.date.localeCompare(a.date)).forEach((release) => {
    const card = createNode("div", { className: "card" });
    card.appendChild(createMedia("smile.png", "", "media square"));

    const pad = createNode("div", { className: "pad" });
    const row = createNode("div", { className: "row sp" });
    row.appendChild(createNode("b", { className: "card-title-ellipsis", text: release.title }));
    row.appendChild(createTag(release.format));
    pad.appendChild(row);

    pad.appendChild(createNode("div", { className: "muted mt-6", text: release.date }));
    card.appendChild(pad);

    setupOpenCard(card, "release", release.id);
    dom.releasesGrid.appendChild(card);
  });
};

export const renderStreams = ({ data, dom }) => {
  if (!dom.streamsList) return;
  dom.streamsList.replaceChildren();

  data.streams.forEach((stream) => {
    const row = createNode("div", { className: "card pad" });
    const content = createNode("div", { className: "row sp" });
    content.appendChild(createNode("b", { className: "card-title-ellipsis-stream", text: stream.title }));
    content.appendChild(createTag(stream.date));
    row.appendChild(content);

    setupOpenCard(row, "stream", stream.id);
    dom.streamsList.appendChild(row);
  });
};

export const renderMerch = ({ data, dom }) => {
  if (!dom.merchGrid) return;
  dom.merchGrid.replaceChildren();

  data.merch.forEach((item) => {
    const card = createNode("div", { className: "card" });
    card.appendChild(createMedia("smile.png", "", "media square"));

    const pad = createNode("div", { className: "pad" });
    const row = createNode("div", { className: "row sp" });
    row.appendChild(createNode("b", { text: item.title }));
    row.appendChild(createTag(item.status));
    pad.appendChild(row);
    pad.appendChild(createNode("div", { className: "muted mt-6", text: item.price }));

    card.appendChild(pad);
    setupOpenCard(card, "merch", item.id);
    dom.merchGrid.appendChild(card);
  });
};

const buildEventModalBody = (eventItem, { notify }) => {
  const grid = createNode("div", { className: "grid g2" });

  const left = createNode("div", { className: "card" });
  left.appendChild(createMedia(eventItem.poster, eventItem.title, "media"));

  const leftPad = createNode("div", { className: "pad" });
  const tagsRow = createNode("div", { className: "row" });
  (eventItem.tags || []).forEach((tag) => tagsRow.appendChild(createTag(tag)));
  leftPad.appendChild(tagsRow);
  leftPad.appendChild(createDivider());
  leftPad.appendChild(createNode("b", { text: "Описание" }));
  leftPad.appendChild(createNode("div", { className: "muted mt-8", text: eventItem.about || "—" }));
  left.appendChild(leftPad);

  const right = createNode("div", { className: "card pad" });
  right.appendChild(createNode("b", { text: "Лайнап" }));
  right.appendChild(createDivider());

  const lineup = createNode("div", { className: "muted" });
  (eventItem.lineup || []).forEach((name, index) => {
    if (index) lineup.appendChild(createNode("br"));
    lineup.appendChild(document.createTextNode(name));
  });
  right.appendChild(lineup);
  right.appendChild(createDivider());

  const actionRow = createNode("div", { className: "row sp" });
  actionRow.appendChild(createTag(eventItem.status || "—"));

  const ticketUrl = safeHttpUrl(eventItem.ticketUrl);
  if (ticketUrl) {
    actionRow.appendChild(
      createNode("a", {
        className: "btn primary",
        text: "Билеты / регистрация",
        attrs: { href: ticketUrl, target: "_blank", rel: "noopener noreferrer" }
      })
    );
  } else {
    const button = createNode("button", { className: "btn primary", text: "Билеты / регистрация", attrs: { type: "button" } });
    button.addEventListener("click", () => notify("Тут будет ссылка на билеты/регистрацию"));
    actionRow.appendChild(button);
  }

  right.appendChild(actionRow);

  grid.appendChild(left);
  grid.appendChild(right);
  return grid;
};

const buildArtistModalBody = (artist) => {
  const grid = createNode("div", { className: "grid g2" });

  const left = createNode("div", { className: "card" });
  const mediaClass = artist.poster ? "media square cover" : "media square";
  left.appendChild(createMedia(artist.poster, artist.name, mediaClass));

  const leftPad = createNode("div", { className: "pad" });
  const tagsRow = createNode("div", { className: "row" });
  (artist.tags || []).forEach((tag) => tagsRow.appendChild(createTag(tag)));
  leftPad.appendChild(tagsRow);
  leftPad.appendChild(createDivider());
  leftPad.appendChild(createNode("b", { text: "Bio" }));
  leftPad.appendChild(createNode("div", { className: "muted mt-8", text: artist.bio || "—" }));
  left.appendChild(leftPad);

  const right = createNode("div", { className: "card pad" });
  right.appendChild(createNode("b", { text: "Букинг" }));
  right.appendChild(createDivider());
  right.appendChild(createNode("div", { className: "muted mb-10", text: "Заполни форму и отправь заявку." }));

  const form = createNode("form", { className: "grid booking-form-modal" });
  form.dataset.artistId = artist.id;
  form.dataset.artistName = artist.name;
  form.dataset.artistBookable = artist.bookable ? "1" : "0";
  form.dataset.renderedAt = String(Date.now());

  const appendInput = (name, placeholder, required = true) => {
    form.appendChild(createNode("input", { className: "input", attrs: { name, placeholder, required } }));
  };

  appendInput("date", "Дата (например 14.03.2026)");
  appendInput("city", "Город");
  appendInput("venue", "Площадка / клуб");
  appendInput("format", "Формат (DJ / live / hybrid)");
  appendInput("contacts", "Контакты (telegram/email)");

  form.appendChild(
    createNode("input", {
      className: "input honeypot-field",
      attrs: {
        name: "website",
        placeholder: "Ваш сайт",
        autocomplete: "off",
        tabindex: "-1",
        "aria-hidden": "true"
      }
    })
  );

  form.appendChild(createNode("textarea", { attrs: { name: "note", placeholder: "Комментарий (опционально)" } }));
  form.appendChild(createNode("button", { className: "btn primary", text: "Отправить заявку", attrs: { type: "submit" } }));
  form.appendChild(createNode("div", { className: "muted booking-status", text: "Ожидание отправки" }));

  right.appendChild(form);

  grid.appendChild(left);
  grid.appendChild(right);
  return grid;
};

const buildReleaseModalBody = (release, { notify }) => {
  const grid = createNode("div", { className: "grid g2" });

  const left = createNode("div", { className: "card" });
  left.appendChild(createMedia("smile.png", "", "media square"));
  const leftPad = createNode("div", { className: "pad" });
  leftPad.appendChild(createNode("b", { text: "Треклист" }));
  leftPad.appendChild(createDivider());

  const tracklist = createNode("div", { className: "muted" });
  (release.tracklist || []).forEach((track, index) => {
    if (index) tracklist.appendChild(createNode("br"));
    tracklist.appendChild(document.createTextNode(`• ${track}`));
  });
  leftPad.appendChild(tracklist);
  left.appendChild(leftPad);

  const right = createNode("div", { className: "card pad" });
  right.appendChild(createNode("b", { text: "Ссылки" }));
  right.appendChild(createDivider());

  const links = createNode("div", { className: "row" });
  ["Bandcamp", "SoundCloud"].forEach((label) => {
    const btn = createNode("button", { className: "btn", text: label, attrs: { type: "button" } });
    btn.addEventListener("click", () => notify(`${label} (поставишь ссылку)`));
    links.appendChild(btn);
  });

  right.appendChild(links);
  right.appendChild(createDivider());
  right.appendChild(createNode("div", { className: "muted", text: "Кредиты: мастеринг / арт / лейбл (тест)." }));

  grid.appendChild(left);
  grid.appendChild(right);
  return grid;
};

const buildStreamModalBody = (stream) => {
  const card = createNode("div", { className: "card pad" });
  card.appendChild(createNode("b", { text: "Воспроизведение" }));
  card.appendChild(createDivider());
  card.appendChild(createMedia("smile.png", "", "media wide"));
  card.appendChild(createNode("div", { className: "muted mt-10", text: "Тут будет YouTube/Vimeo embed." }));
  return card;
};

const buildMerchModalBody = (item, { notify }) => {
  const grid = createNode("div", { className: "grid g2" });

  const left = createNode("div", { className: "card" });
  left.appendChild(createMedia("smile.png", "", "media square"));
  const leftPad = createNode("div", { className: "pad" });
  leftPad.appendChild(createNode("b", { text: "Описание" }));
  leftPad.appendChild(createDivider());
  leftPad.appendChild(createNode("div", { className: "muted", text: item.desc || "—" }));
  left.appendChild(leftPad);

  const right = createNode("div", { className: "card pad" });
  right.appendChild(createNode("b", { text: "Оформление" }));
  right.appendChild(createDivider());
  right.appendChild(createNode("div", { className: "muted", text: "Пока предзаказ. Потом подключим оплату." }));
  right.appendChild(createNode("div", { className: "vspace-12" }));

  const button = createNode("button", { className: "btn primary", text: "Предзаказ", attrs: { type: "button" } });
  button.addEventListener("click", () => notify("Тут будет форма/бот"));
  right.appendChild(button);

  grid.appendChild(left);
  grid.appendChild(right);
  return grid;
};

export const buildModalPayload = (type, id, data, helpers) => {
  if (type === "event") {
    const eventItem = data.events.find((x) => x.id === id);
    if (!eventItem) return null;
    return {
      title: eventItem.title,
      sub: `${formatDateTime(eventItem.date)} · ${eventItem.place || "—"}`,
      body: buildEventModalBody(eventItem, helpers)
    };
  }

  if (type === "artist") {
    const artist = data.artists.find((x) => x.id === id);
    if (!artist) return null;
    return {
      title: artist.name,
      sub: `${artist.role} · ${artist.bookable ? "доступен для букинга" : "не на букинге"}`,
      body: buildArtistModalBody(artist)
    };
  }

  if (type === "release") {
    const release = data.releases.find((x) => x.id === id);
    if (!release) return null;
    return {
      title: release.title,
      sub: `${release.date} · ${release.format}`,
      body: buildReleaseModalBody(release, helpers)
    };
  }

  if (type === "stream") {
    const stream = data.streams.find((x) => x.id === id);
    if (!stream) return null;
    return {
      title: stream.title,
      sub: stream.date,
      body: buildStreamModalBody(stream)
    };
  }

  if (type === "merch") {
    const item = data.merch.find((x) => x.id === id);
    if (!item) return null;
    return {
      title: item.title,
      sub: `${item.price} · ${item.status}`,
      body: buildMerchModalBody(item, helpers)
    };
  }

  return null;
};
