export const data = {
  events: [
    {
      id: "e1",
      title: "Maslaynitsa",
      date: "2026-02-19T22:00:00",
      place: "НПО Мелодия",
      tags: ["live", "electronic"],
      status: "archive",
      poster: "event-maslaynitsa.jpg",
      about: "Ивент Maslaynitsa.",
      lineup: ["am1d", "di-au", "feel gainsbourg", "egor popov", "nyaono"]
    },
    {
      id: "e2",
      title: "Cliche",
      date: "2026-02-20T22:00:00",
      place: "НПО Мелодия",
      tags: ["club", "b2b"],
      status: "archive",
      poster: "event-cliche.jpg",
      about: "Ночной ивент Cliche.",
      lineup: ["ayokiddy", "fckshizy", "luxxomea", "manyice", "norman b2b void", "whysobored", "yardyard"]
    },
    {
      id: "e3",
      title: "Pirate Jet",
      date: "2026-02-28T20:00:00",
      place: "НПО Мелодия",
      tags: ["live", "concert"],
      status: "archive",
      poster: "event-pirate-jet.jpg",
      about: "Pirate Jet: концерты и live performance.",
      lineup: [
        "gummies (concert)",
        "черные бояре x света ефремова (live performance)",
        "m1lbeee (concert)",
        "ucuda (concert)",
        "фантом м-100 (live)",
        "valentin fufaev",
        "dj baby steps",
        "yze (concert)",
        "bogdamn"
      ]
    },
    {
      id: "e4",
      title: "8 Марта — Первый уикенд весны",
      date: "2026-03-08T21:30:00",
      place: "НПО Мелодия",
      tags: ["weekend", "live", "32h"],
      status: "tickets",
      poster: "event-8-marta.jpg",
      ticketUrl: "https://moscow.qtickets.events/219423-78",
      about: "Первый уикенд весны — 32 часа. День 1. Двери: 21:30.",
      lineup: ["Line-up скоро"]
    },
    {
      id: "e5",
      title: "9 Марта — Первый уикенд весны (день 2)",
      date: "2026-03-09T17:00:00",
      place: "НПО Мелодия",
      tags: ["weekend", "8march"],
      status: "tickets",
      poster: "event-8-marta.jpg",
      ticketUrl: "https://moscow.qtickets.events/219423-78",
      about: "Продолжение уикенда весны. День 2. Полный анонс по лайнапу — скоро.",
      lineup: ["Line-up скоро"]
    }
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

export const defaults = {
  bookingEndpoint: "https://httpbin.org/post",
  bookingCooldownMs: 60_000,
  bookingMinFillMs: 3_000,
  bookingStorageKey: "npo_booking_last_submit_ts",
  clubTokenStorageKey: "npo_club_token_v1"
};
