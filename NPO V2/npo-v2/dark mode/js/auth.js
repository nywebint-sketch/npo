import { isValidEmail, normalizeEmail } from "./utils.js";

const parseJsonSafe = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

export const createAuth = ({ dom, config }) => {
  let session = null;

  const readToken = () => localStorage.getItem(config.clubTokenStorageKey) || "";
  const saveToken = (token) => {
    if (!token) {
      localStorage.removeItem(config.clubTokenStorageKey);
      return;
    }
    localStorage.setItem(config.clubTokenStorageKey, token);
  };

  const setStatus = (message) => {
    if (dom.authStatus && message) dom.authStatus.textContent = message;
  };

  const renderExclusiveItems = (items = []) => {
    if (!dom.exclusiveContent) return;

    dom.exclusiveContent.replaceChildren();
    items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "card pad";

      const title = document.createElement("b");
      title.textContent = item.title || "Эксклюзив";
      card.appendChild(title);

      const desc = document.createElement("div");
      desc.className = "muted mt-6";
      desc.textContent = item.description || "";
      card.appendChild(desc);

      dom.exclusiveContent.appendChild(card);
    });
  };

  const renderAccess = () => {
    const isAuthorized = Boolean(session?.email);

    if (dom.authGuest) dom.authGuest.hidden = isAuthorized;
    if (dom.authMember) dom.authMember.hidden = !isAuthorized;
    if (dom.memberName) dom.memberName.textContent = session?.name || session?.email || "участник";
    if (dom.exclusiveLocked) dom.exclusiveLocked.hidden = isAuthorized;
    if (dom.exclusiveContent) dom.exclusiveContent.hidden = !isAuthorized;
    if (dom.exclusiveBadge) dom.exclusiveBadge.textContent = isAuthorized ? "открыт" : "закрыт";

    if (dom.authStatus) {
      dom.authStatus.textContent = isAuthorized ? "Доступ к эксклюзиву активен." : "Доступ к эксклюзиву закрыт.";
    }
  };

  const request = async (path, { method = "GET", body = null, auth = true } = {}) => {
    const headers = { "Content-Type": "application/json" };
    const token = readToken();
    if (auth && token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${config.clubApiBase}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    const payload = await parseJsonSafe(response);
    if (!response.ok) {
      throw new Error(payload?.error || payload?.message || "Ошибка запроса");
    }
    return payload || {};
  };

  const refreshSession = async () => {
    const token = readToken();
    if (!token) {
      session = null;
      renderAccess();
      return;
    }

    try {
      const me = await request("/api/auth/me");
      session = me.user || null;

      const exclusive = await request("/api/exclusive");
      renderExclusiveItems(exclusive.items || []);
      renderAccess();
    } catch {
      saveToken("");
      session = null;
      renderAccess();
    }
  };

  const bind = () => {
    dom.registerForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;

      const name = String(form.elements.name?.value || "").trim();
      const email = normalizeEmail(form.elements.email?.value);
      const password = String(form.elements.password?.value || "");
      const password2 = String(form.elements.password2?.value || "");

      if (!name || name.length < 2) return setStatus("Имя должно быть не короче 2 символов.");
      if (!isValidEmail(email)) return setStatus("Укажи корректный email.");
      if (password.length < 6) return setStatus("Пароль должен быть не короче 6 символов.");
      if (password !== password2) return setStatus("Пароли не совпадают.");

      try {
        const result = await request("/api/auth/register", {
          method: "POST",
          body: { name, email, password },
          auth: false
        });

        saveToken(result.token || "");
        session = result.user || null;
        form.reset();
        renderExclusiveItems(result.items || []);
        renderAccess();
        setStatus("Регистрация успешна. Эксклюзив открыт.");
      } catch (error) {
        setStatus(error.message || "Ошибка регистрации.");
      }
    });

    dom.loginForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;

      const email = normalizeEmail(form.elements.email?.value);
      const password = String(form.elements.password?.value || "");

      if (!isValidEmail(email) || !password) return setStatus("Укажи email и пароль.");

      try {
        const result = await request("/api/auth/login", {
          method: "POST",
          body: { email, password },
          auth: false
        });

        saveToken(result.token || "");
        session = result.user || null;
        form.reset();
        renderExclusiveItems(result.items || []);
        renderAccess();
        setStatus("Вход выполнен. Эксклюзив открыт.");
      } catch (error) {
        setStatus(error.message || "Неверный email или пароль.");
      }
    });

    dom.logoutBtn?.addEventListener("click", async () => {
      try {
        await request("/api/auth/logout", { method: "POST" });
      } catch {
        // noop: локальную сессию очищаем в любом случае
      }

      saveToken("");
      session = null;
      renderAccess();
      setStatus("Ты вышел из аккаунта.");
    });
  };

  return {
    init: async () => {
      bind();
      await refreshSession();
    }
  };
};
