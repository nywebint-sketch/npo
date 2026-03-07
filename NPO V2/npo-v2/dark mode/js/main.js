import { data, defaults } from "./data.js";
import { getDom } from "./dom.js";
import { createAuth } from "./auth.js";
import { createBooking } from "./booking.js";
import { buildModalPayload, renderArtists, renderEvents, renderMerch, renderReleases, renderStreams } from "./render.js";
import { createUi } from "./ui.js";
import { setYear } from "./utils.js";

const getConfig = () => {
  const bookingMeta = document.querySelector('meta[name="booking-endpoint"]')?.content || "";
  const clubApiMeta = document.querySelector('meta[name="club-api-base"]')?.content || "";

  return {
    bookingEndpoint: bookingMeta || defaults.bookingEndpoint,
    bookingCooldownMs: defaults.bookingCooldownMs,
    bookingMinFillMs: defaults.bookingMinFillMs,
    bookingStorageKey: defaults.bookingStorageKey,
    clubTokenStorageKey: defaults.clubTokenStorageKey,
    clubApiBase: clubApiMeta
  };
};

export const initApp = async () => {
  const dom = getDom();
  const config = getConfig();

  const ui = createUi({ dom, data, buildModalPayload });
  const booking = createBooking({ config });
  const auth = createAuth({ dom, config });

  setYear(dom.year);

  renderEvents({ data, dom });
  renderArtists({ data, dom });
  renderReleases({ data, dom });
  renderStreams({ data, dom });
  renderMerch({ data, dom });

  ui.bind();
  booking.bind();
  await auth.init();
};

initApp();
