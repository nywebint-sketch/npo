import { debounce } from "./utils.js";

const FOCUSABLE_SELECTOR = 'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';

export const createUi = ({ dom, data, buildModalPayload }) => {
  let lastFocused = null;

  const notify = (message) => {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;

    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("is-visible"));

    window.setTimeout(() => {
      toast.classList.remove("is-visible");
      window.setTimeout(() => toast.remove(), 180);
    }, 1600);
  };

  const openModal = ({ title, sub, body }) => {
    if (!dom.modal) return;

    lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    if (dom.modalTitle) dom.modalTitle.textContent = title || "—";
    if (dom.modalSub) dom.modalSub.textContent = sub || "";
    if (dom.modalBody) dom.modalBody.replaceChildren(body || document.createTextNode(""));

    dom.modal.hidden = false;
    dom.body.classList.add("modal-open");

    window.setTimeout(() => {
      const focusTarget = dom.modalClose || dom.modalPanel;
      focusTarget?.focus();
    }, 0);
  };

  const closeModal = () => {
    if (!dom.modal) return;
    dom.modal.hidden = true;
    dom.body.classList.remove("modal-open");
    if (dom.modalBody) dom.modalBody.replaceChildren();
    lastFocused?.focus();
  };

  const trapModalFocus = (event) => {
    if (event.key !== "Tab" || !dom.modal || dom.modal.hidden) return;

    const focusable = Array.from(dom.modal.querySelectorAll(FOCUSABLE_SELECTOR));
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const activateCardFromKeyboard = (event) => {
    const card = event.target.closest("[data-open]");
    if (!card || (event.key !== "Enter" && event.key !== " ")) return;

    event.preventDefault();
    card.click();
  };

  const onCardClick = (event) => {
    const card = event.target.closest("[data-open]");
    if (!card) return;

    const payload = buildModalPayload(card.dataset.open, card.dataset.id, data, { notify });
    if (payload) openModal(payload);
  };

  const closeMobileMenu = () => {
    dom.body.classList.remove("menu-open");
    dom.mobileMenuToggle?.setAttribute("aria-expanded", "false");
    if (dom.mobileMenu) dom.mobileMenu.hidden = true;
    if (dom.mobileMenuBackdrop) dom.mobileMenuBackdrop.hidden = true;
  };

  const openMobileMenu = () => {
    if (dom.mobileMenu) dom.mobileMenu.hidden = false;
    if (dom.mobileMenuBackdrop) dom.mobileMenuBackdrop.hidden = false;
    dom.body.classList.add("menu-open");
    dom.mobileMenuToggle?.setAttribute("aria-expanded", "true");
  };

  const bindNavigation = () => {
    const sections = dom.desktopNavLinks.map((node) => document.querySelector(node.getAttribute("href"))).filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          dom.desktopNavLinks.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
          });
        });
      },
      { rootMargin: "-50% 0px -45% 0px", threshold: 0.01 }
    );

    sections.forEach((section) => observer.observe(section));
  };

  const bindMobileMenu = () => {
    const mobileBp = window.matchMedia("(max-width: 980px)");

    dom.mobileMenuToggle?.addEventListener("click", (event) => {
      event.preventDefault();

      if (!mobileBp.matches) {
        window.location.hash = "home";
        return;
      }

      if (dom.body.classList.contains("menu-open")) closeMobileMenu();
      else openMobileMenu();
    });

    dom.mobileMenuBackdrop?.addEventListener("click", closeMobileMenu);
    dom.mobileNavLinks.forEach((link) => link.addEventListener("click", closeMobileMenu));

    window.addEventListener(
      "resize",
      debounce(() => {
        if (!mobileBp.matches) closeMobileMenu();
      }, 100),
      { passive: true }
    );
  };

  const bindPlaceholderLinks = () => {
    dom.placeholderLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        notify("Поставь ссылку");
      });
    });
  };

  const bindModal = () => {
    dom.modalClose?.addEventListener("click", closeModal);

    dom.modal?.addEventListener("click", (event) => {
      if (event.target === dom.modal) closeModal();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeModal();
        closeMobileMenu();
      }
      trapModalFocus(event);
    });
  };

  const bindCards = () => {
    document.addEventListener("click", onCardClick);
    document.addEventListener("keydown", activateCardFromKeyboard);
  };

  return {
    notify,
    bind: () => {
      bindNavigation();
      bindMobileMenu();
      bindPlaceholderLinks();
      bindModal();
      bindCards();
    }
  };
};
