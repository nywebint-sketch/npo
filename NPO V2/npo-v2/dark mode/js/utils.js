export const qs = (selector, root = document) => root.querySelector(selector);
export const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

export const pad2 = (value) => String(value).padStart(2, "0");

export const formatDateTime = (iso) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return `${pad2(date.getDate())}.${pad2(date.getMonth() + 1)}.${date.getFullYear()} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
};

export const sortByDateAsc = (items, key) => [...items].sort((a, b) => new Date(a[key]) - new Date(b[key]));

export const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const safeHttpUrl = (value) => {
  if (!value) return "";
  try {
    const url = new URL(value, window.location.origin);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
};

export const debounce = (fn, delay = 100) => {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), delay);
  };
};

export const createNode = (tag, { className = "", text = "", attrs = {} } = {}) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;

  Object.entries(attrs).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      node.setAttribute(key, String(value));
    }
  });

  return node;
};

export const createTag = (text) => createNode("span", { className: "tag", text: String(text || "").trim() || "—" });

export const setYear = (node) => {
  if (node) node.textContent = String(new Date().getFullYear());
};
