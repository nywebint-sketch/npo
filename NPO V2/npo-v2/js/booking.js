import { safeHttpUrl } from "./utils.js";

const validateText = (value, { min = 2, max = 120, pattern = null } = {}) => {
  const normalized = String(value || "").trim();
  if (normalized.length < min || normalized.length > max) return false;
  if (normalized.includes("<") || normalized.includes(">")) return false;
  if (pattern && !pattern.test(normalized)) return false;
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

export const createBooking = ({ config }) => {
  const getCooldownLeft = () => {
    const lastSubmit = Number(localStorage.getItem(config.bookingStorageKey) || 0);
    if (!lastSubmit) return 0;
    return Math.max(0, config.bookingCooldownMs - (Date.now() - lastSubmit));
  };

  const submitBooking = async (form, statusNode, submitNode) => {
    const endpoint = safeHttpUrl(config.bookingEndpoint);
    if (!endpoint) {
      if (statusNode) statusNode.textContent = "Ошибка конфигурации endpoint";
      return;
    }

    if (form.dataset.artistBookable !== "1") {
      if (statusNode) statusNode.textContent = "Этот артист сейчас не на букинге";
      return;
    }

    const honeypotValue = form.elements.website?.value?.trim();
    if (honeypotValue) {
      if (statusNode) statusNode.textContent = "Заявка отклонена";
      return;
    }

    const renderedAt = Number(form.dataset.renderedAt || 0);
    if (Date.now() - renderedAt < config.bookingMinFillMs) {
      if (statusNode) statusNode.textContent = "Слишком быстро. Проверь форму и отправь снова.";
      return;
    }

    const cooldownLeft = getCooldownLeft();
    if (cooldownLeft > 0) {
      if (statusNode) statusNode.textContent = `Подожди ${Math.ceil(cooldownLeft / 1000)} сек перед повторной отправкой`;
      return;
    }

    const payload = {
      artistId: form.dataset.artistId || "",
      artistName: form.dataset.artistName || "",
      date: form.elements.date.value.trim(),
      city: form.elements.city.value.trim(),
      venue: form.elements.venue.value.trim(),
      format: form.elements.format.value.trim(),
      contacts: form.elements.contacts.value.trim(),
      note: form.elements.note.value.trim(),
      source: "npo-v2",
      createdAt: new Date().toISOString(),
      userAgent: navigator.userAgent
    };

    const validationError = validateBookingPayload(payload);
    if (validationError) {
      if (statusNode) statusNode.textContent = validationError;
      return;
    }

    if (statusNode) statusNode.textContent = "Отправка...";
    if (submitNode) submitNode.disabled = true;

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12_000);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      localStorage.setItem(config.bookingStorageKey, String(Date.now()));
      if (statusNode) statusNode.textContent = "Заявка отправлена в админку";

      form.reset();
      form.dataset.renderedAt = String(Date.now());
    } catch {
      if (statusNode) statusNode.textContent = "Ошибка отправки. Попробуй позже.";
    } finally {
      clearTimeout(timeout);
      if (submitNode) submitNode.disabled = false;
    }
  };

  const bind = () => {
    document.addEventListener("submit", async (event) => {
      const bookingForm = event.target.closest(".booking-form-modal");
      if (!bookingForm) return;

      event.preventDefault();
      const statusNode = bookingForm.querySelector(".booking-status");
      const submitNode = bookingForm.querySelector('button[type="submit"]');
      await submitBooking(bookingForm, statusNode, submitNode);
    });
  };

  return { bind };
};
