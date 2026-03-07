import { qs, qsa } from "./utils.js";

export const getDom = () => ({
  body: document.body,
  year: qs("#year"),

  eventsGrid: qs("#eventsGrid"),
  artistsGrid: qs("#artistsGrid"),
  releasesGrid: qs("#releasesGrid"),
  streamsList: qs("#streamsList"),
  merchGrid: qs("#merchGrid"),
  streamNext: qs("#streamNext"),

  registerForm: qs("#registerForm"),
  loginForm: qs("#loginForm"),
  logoutBtn: qs("#logoutBtn"),
  authGuest: qs("#authGuest"),
  authMember: qs("#authMember"),
  memberName: qs("#memberName"),
  authStatus: qs("#authStatus"),
  exclusiveLocked: qs("#exclusiveLocked"),
  exclusiveContent: qs("#exclusiveContent"),
  exclusiveBadge: qs("#exclusiveBadge"),

  modal: qs("#modal"),
  modalPanel: qs("#modalPanel"),
  modalTitle: qs("#mTitle"),
  modalSub: qs("#mSub"),
  modalBody: qs("#mBody"),
  modalClose: qs("#mClose"),

  mobileMenuToggle: qs("#mobileMenuToggle"),
  mobileMenu: qs("#mobileMenu"),
  mobileMenuBackdrop: qs("#mobileMenuBackdrop"),
  mobileNavLinks: qsa("#mobileMenu a"),
  desktopNavLinks: qsa(".nav a"),

  placeholderLinks: qsa("[data-placeholder-link]")
});
