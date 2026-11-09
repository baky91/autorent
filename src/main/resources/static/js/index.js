import {
  getVehicles,
  loginUser,
  registerUser,
  logoutUser,
  getMyReservations,
  getUnavailableDates,
  createReservation,
  cancelReservation,
  getVehicleById,
} from "./api.js";
import { TRANSLATIONS } from "./translations.js";

// const BASE_API_URL = "http://localhost:8080";
const BASE_API_URL = ""; // Si la page est servie par le serveur contenant l'API REST, on a pas besoin de spécifier le host et le port

const NavigationManager = {
  init() {
    const mobileBtn = document.getElementById("mobile-toggle");
    const navMenu = document.querySelector(".nav-menu");
    if (!mobileBtn || !navMenu) return;

    mobileBtn.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("open");
      mobileBtn.setAttribute("aria-expanded", isOpen);
    });

    // Fermer le menu lors d'un clic sur un lien ou sur le bouton d'authentification mobile
    navMenu.querySelectorAll(".nav-link, .mobile-auth-btn").forEach((item) => {
      item.addEventListener("click", () => {
        navMenu.classList.remove("open");
        mobileBtn.setAttribute("aria-expanded", "false");
      });
    });

    // Fermer le menu si on clique en dehors
    document.addEventListener("click", (e) => {
      if (
        navMenu.classList.contains("open") &&
        !navMenu.contains(e.target) &&
        !mobileBtn.contains(e.target)
      ) {
        navMenu.classList.remove("open");
        mobileBtn.setAttribute("aria-expanded", "false");
      }
    });
  },
};

const AuthenticationManager = {
  tokenKey: "jwt_token",
  userKey: "auth_username",

  init() {
    this.renderModal();

    this.closeBtn = document.getElementById("close-auth-modal-btn");
    this.tabLogin = document.getElementById("auth-tab-login");
    this.tabRegister = document.getElementById("auth-tab-register");
    this.loginForm = document.getElementById("login-form");
    this.registerForm = document.getElementById("register-form");
    this.alertBox = document.getElementById("auth-alert");

    // Boutons de connexion (desktop et tiroir mobile)
    this.loginBtns = document.querySelectorAll("#btn-login, .mobile-auth-btn");

    this.bindEvents();
    this.updateUI();
  },

  renderModal() {
    if (document.getElementById("auth-modal")) {
      this.modal = document.getElementById("auth-modal");
      return;
    }

    const modal = document.createElement("div");
    modal.id = "auth-modal";
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="modal-content auth-modal-content">
        <button class="modal-close" id="close-auth-modal-btn" data-i18n-aria-label="common.close" aria-label="${LanguageManager.t("common.close")}">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div class="auth-modal-body">
          <!-- En-tête : Choix Connexion ou Créer un compte -->
          <div class="auth-tabs" role="tablist">
            <button type="button" class="auth-tab-btn active" id="auth-tab-login" role="tab" aria-selected="true" data-i18n="auth.tab.login">${LanguageManager.t("auth.tab.login")}</button>
            <button type="button" class="auth-tab-btn" id="auth-tab-register" role="tab" aria-selected="false" data-i18n="auth.tab.register">${LanguageManager.t("auth.tab.register")}</button>
          </div>

          <!-- Zone de message d'alerte (erreur ou succès) -->
          <div id="auth-alert" class="auth-alert" style="display: none;"></div>

          <!-- Formulaire de Connexion -->
          <form id="login-form" class="auth-form">
            <div class="form-group">
              <label for="login-username" data-i18n="auth.username">${LanguageManager.t("auth.username")}</label>
              <input type="text" id="login-username" name="username" class="form-input" data-i18n-placeholder="auth.username-placeholder" placeholder="${LanguageManager.t("auth.username-placeholder")}" required autocomplete="username">
            </div>
            <div class="form-group">
              <label for="login-password" data-i18n="auth.password">${LanguageManager.t("auth.password")}</label>
              <input type="password" id="login-password" name="password" class="form-input" data-i18n-placeholder="auth.password-placeholder" placeholder="${LanguageManager.t("auth.password-placeholder")}" required autocomplete="current-password">
            </div>
            <button type="submit" class="btn btn-primary btn-block" id="btn-submit-login">
              <span data-i18n="auth.login-submit">${LanguageManager.t("auth.login-submit")}</span>
            </button>
          </form>

          <!-- Formulaire de Création de compte -->
          <form id="register-form" class="auth-form" style="display: none;">
            <div class="form-group">
              <label for="register-username" data-i18n="auth.username">${LanguageManager.t("auth.username")}</label>
              <input type="text" id="register-username" name="username" class="form-input" data-i18n-placeholder="auth.register-username-placeholder" placeholder="${LanguageManager.t("auth.register-username-placeholder")}" required autocomplete="username">
            </div>
            <div class="form-group">
              <label for="register-password" data-i18n="auth.password">${LanguageManager.t("auth.password")}</label>
              <input type="password" id="register-password" name="password" class="form-input" data-i18n-placeholder="auth.register-password-placeholder" placeholder="${LanguageManager.t("auth.register-password-placeholder")}" required autocomplete="new-password">
            </div>
            <div class="form-group">
              <label for="register-confirm-password" data-i18n="auth.confirm-password">${LanguageManager.t("auth.confirm-password")}</label>
              <input type="password" id="register-confirm-password" name="confirmPassword" class="form-input" data-i18n-placeholder="auth.confirm-password-placeholder" placeholder="${LanguageManager.t("auth.confirm-password-placeholder")}" required autocomplete="new-password">
            </div>
            <button type="submit" class="btn btn-primary btn-block" id="btn-submit-register">
              <span data-i18n="auth.register-submit">${LanguageManager.t("auth.register-submit")}</span>
            </button>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.modal = modal;
  },

  bindEvents() {
    this.loginBtns.forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (this.isAuthenticated()) {
          const username = this.getUsername();
          const confirmed = await ConfirmManager.ask({
            title: LanguageManager.t("auth.logout-title"),
            message: LanguageManager.t("auth.logout-confirm", username),
            confirmLabel: LanguageManager.t("auth.logout-submit"),
          });
          if (confirmed) {
            this.logout();
          }
        } else {
          this.openModal("login");
        }
      });
    });

    if (this.closeBtn) {
      this.closeBtn.addEventListener("click", () => this.closeModal());
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.modal.classList.contains("active")) {
        this.closeModal();
      }
    });

    if (this.tabLogin) {
      this.tabLogin.addEventListener("click", () => this.switchTab("login"));
    }
    if (this.tabRegister) {
      this.tabRegister.addEventListener("click", () =>
        this.switchTab("register"),
      );
    }

    if (this.loginForm) {
      this.loginForm.addEventListener("submit", (e) => this.handleLogin(e));
    }
    if (this.registerForm) {
      this.registerForm.addEventListener("submit", (e) =>
        this.handleRegister(e),
      );
    }
  },

  isAuthenticated() {
    return !!localStorage.getItem(this.tokenKey);
  },

  getToken() {
    return localStorage.getItem(this.tokenKey);
  },

  getUsername() {
    return localStorage.getItem(this.userKey) || LanguageManager.t("common.default-user");
  },

  openModal(mode = "login") {
    this.hideAlert();
    this.switchTab(mode);
    this.modal.classList.add("active");
  },

  closeModal() {
    this.modal.classList.remove("active");
    this.hideAlert();
    if (this.loginForm) this.loginForm.reset();
    if (this.registerForm) this.registerForm.reset();
  },

  switchTab(tab) {
    this.hideAlert();
    if (tab === "login") {
      this.tabLogin.classList.add("active");
      this.tabLogin.setAttribute("aria-selected", "true");
      this.tabRegister.classList.remove("active");
      this.tabRegister.setAttribute("aria-selected", "false");
      this.loginForm.style.display = "flex";
      this.registerForm.style.display = "none";
      const field = document.getElementById("login-username");
      if (field) field.focus();
    } else {
      this.tabRegister.classList.add("active");
      this.tabRegister.setAttribute("aria-selected", "true");
      this.tabLogin.classList.remove("active");
      this.tabLogin.setAttribute("aria-selected", "false");
      this.loginForm.style.display = "none";
      this.registerForm.style.display = "flex";
      const field = document.getElementById("register-username");
      if (field) field.focus();
    }
  },

  // `messageKey` : clé de traduction (le message suit les changements de langue)
  showAlert(messageKey, type = "error") {
    if (!this.alertBox) return;
    LanguageManager.setText(this.alertBox, messageKey);
    this.alertBox.className = `auth-alert ${type}`;
    this.alertBox.style.display = "block";
  },

  hideAlert() {
    if (!this.alertBox) return;
    this.alertBox.style.display = "none";
    this.alertBox.removeAttribute("data-i18n");
    this.alertBox.textContent = "";
  },

  // Texte d'un bouton de soumission (clé traduite, mémorisée pour le changement de langue)
  setSubmitLabel(button, key) {
    button.innerHTML = `<span data-i18n="${key}">${LanguageManager.t(key)}</span>`;
  },

  async handleLogin(e) {
    e.preventDefault();
    this.hideAlert();

    const usernameInput = document.getElementById("login-username");
    const passwordInput = document.getElementById("login-password");
    const submitBtn = document.getElementById("btn-submit-login");

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
      this.showAlert("auth.error.fill-all", "error");
      return;
    }

    try {
      submitBtn.disabled = true;
      this.setSubmitLabel(submitBtn, "auth.login-loading");

      const data = await loginUser(username, password);

      if (data && data.token) {
        // Stockage du token pour les requêtes authentifiées
        localStorage.setItem(this.tokenKey, data.token);
        localStorage.setItem(this.userKey, username);

        this.showAlert("auth.success.login", "success");
        onAuthStateChanged();

        setTimeout(() => {
          this.closeModal();
        }, 800);
      } else {
        this.showAlert("auth.error.bad-credentials", "error");
      }
    } catch (err) {
      console.error("Erreur de connexion :", err);
      this.showAlert("auth.error.login-failed", "error");
    } finally {
      submitBtn.disabled = false;
      this.setSubmitLabel(submitBtn, "auth.login-submit");
    }
  },

  async handleRegister(e) {
    e.preventDefault();
    this.hideAlert();

    const usernameInput = document.getElementById("register-username");
    const passwordInput = document.getElementById("register-password");
    const confirmInput = document.getElementById("register-confirm-password");
    const submitBtn = document.getElementById("btn-submit-register");

    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const confirm = confirmInput.value;

    if (!username || !password || !confirm) {
      this.showAlert("auth.error.fill-all-register", "error");
      return;
    }

    if (password !== confirm) {
      this.showAlert("auth.error.password-mismatch", "error");
      return;
    }

    if (password.length < 4) {
      this.showAlert("auth.error.password-short", "error");
      return;
    }

    try {
      submitBtn.disabled = true;
      this.setSubmitLabel(submitBtn, "auth.register-loading");

      const res = await registerUser(username, password);

      if (res && (res.id || res.username)) {
        console.log("Compte créé avec succès :", res);

        // Connexion automatique pour récupérer directement le token JWT
        const loginData = await loginUser(username, password);
        if (loginData && loginData.token) {
          const tokenWithBearer = loginData.token.startsWith("Bearer ")
            ? loginData.token
            : `Bearer ${loginData.token}`;
          localStorage.setItem(this.tokenKey, tokenWithBearer);
          localStorage.setItem("raw_jwt_token", loginData.token);
          localStorage.setItem(this.userKey, username);

          console.log("JWT récupéré après inscription :", loginData.token);

          this.showAlert("auth.success.register-logged", "success");
          onAuthStateChanged();

          setTimeout(() => {
            this.closeModal();
          }, 800);
        } else {
          this.showAlert("auth.success.register", "success");
          this.switchTab("login");
          const loginUserField = document.getElementById("login-username");
          if (loginUserField) loginUserField.value = username;
        }
      } else {
        this.showAlert("auth.error.username-taken", "error");
      }
    } catch (err) {
      console.error("Erreur lors de la création de compte :", err);
      this.showAlert("auth.error.register-failed", "error");
    } finally {
      submitBtn.disabled = false;
      this.setSubmitLabel(submitBtn, "auth.register-submit");
    }
  },

  logout() {
    const token = this.getToken();
    logoutUser(token);
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem("raw_jwt_token");
    localStorage.removeItem(this.userKey);
    console.log("Utilisateur déconnecté.");
    onAuthStateChanged();
  },

  updateUI() {
    const isAuth = this.isAuthenticated();
    const username = this.getUsername();

    // Connecté : on retire data-i18n pour que le changement de langue
    // n'écrase pas le nom d'utilisateur ; sinon on remet le libellé traduit.
    const labels = document.querySelectorAll(
      "#btn-login .btn-login-text, .mobile-auth-btn span",
    );
    labels.forEach((label) => {
      if (isAuth) {
        label.removeAttribute("data-i18n");
        label.textContent = username;
      } else {
        label.setAttribute("data-i18n", "nav.login-register");
        label.textContent = LanguageManager.t("nav.login-register");
      }
    });
  },
};

// Notifications non bloquantes affichées dans l'interface (remplace alert())
const ToastManager = {
  DURATION_MS: 5000,

  getContainer() {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = "toast-container";
      container.setAttribute("role", "status");
      container.setAttribute("aria-live", "polite");
      document.body.appendChild(container);
    }
    return container;
  },

  // type : "success" | "error" | "warning" | "info"
  show(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    const text = document.createElement("span");
    text.className = "toast-message";
    text.textContent = message;

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "toast-close";
    closeBtn.innerHTML = "&times;";
    closeBtn.setAttribute("aria-label", LanguageManager.t("common.close"));

    toast.append(text, closeBtn);
    this.getContainer().appendChild(toast);

    // Déclenche la transition d'entrée
    requestAnimationFrame(() => toast.classList.add("visible"));

    let timer = setTimeout(() => this.dismiss(toast), this.DURATION_MS);
    // Pause du compte à rebours tant que la souris survole le message
    toast.addEventListener("mouseenter", () => clearTimeout(timer));
    toast.addEventListener("mouseleave", () => {
      timer = setTimeout(() => this.dismiss(toast), this.DURATION_MS);
    });
    closeBtn.addEventListener("click", () => this.dismiss(toast));
  },

  dismiss(toast) {
    toast.classList.remove("visible");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
    // Filet de sécurité si la transition ne se déclenche pas
    setTimeout(() => toast.remove(), 400);
  },
};

// Boîte de dialogue de confirmation dans l'interface (remplace confirm())
// Usage : const ok = await ConfirmManager.ask({ title, message, confirmLabel, danger });
const ConfirmManager = {
  overlay: null,
  resolver: null,

  build() {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay confirm-overlay";
    overlay.innerHTML = `
      <div class="modal-content confirm-modal-content" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-message">
        <h3 id="confirm-title" class="confirm-title"></h3>
        <p id="confirm-message" class="confirm-message"></p>
        <div class="confirm-actions">
          <button type="button" class="btn btn-ghost" id="confirm-cancel-btn"></button>
          <button type="button" class="btn btn-primary" id="confirm-accept-btn"></button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    this.overlay = overlay;

    this.titleEl = overlay.querySelector("#confirm-title");
    this.messageEl = overlay.querySelector("#confirm-message");
    this.cancelBtn = overlay.querySelector("#confirm-cancel-btn");
    this.acceptBtn = overlay.querySelector("#confirm-accept-btn");

    this.cancelBtn.addEventListener("click", () => this.close(false));
    this.acceptBtn.addEventListener("click", () => this.close(true));
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) this.close(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && overlay.classList.contains("active")) {
        this.close(false);
      }
    });
  },

  // Renvoie une Promise résolue à true (confirmé) ou false (annulé / fermé)
  ask({ title = "", message = "", confirmLabel, danger = false } = {}) {
    if (!this.overlay) this.build();
    if (this.resolver) this.close(false); // une seule question à la fois

    this.titleEl.textContent = title;
    this.titleEl.style.display = title ? "" : "none";
    this.messageEl.textContent = message;
    this.cancelBtn.textContent = LanguageManager.t("confirm.back");
    this.acceptBtn.textContent = confirmLabel || LanguageManager.t("confirm.accept");
    this.acceptBtn.classList.toggle("btn-danger", danger);
    this.acceptBtn.classList.toggle("btn-primary", !danger);

    this.overlay.classList.add("active");
    // Focus sur "Retour" : une validation accidentelle avec Entrée n'a pas d'effet destructeur
    this.cancelBtn.focus();

    return new Promise((resolve) => {
      this.resolver = resolve;
    });
  },

  close(result) {
    this.overlay.classList.remove("active");
    const resolve = this.resolver;
    this.resolver = null;
    if (resolve) resolve(result);
  },
};

const ThemeManager = {
  STORAGE_KEY: "autorent_theme",

  init() {
    const savedTheme = localStorage.getItem(this.STORAGE_KEY) || "light";

    this.applyTheme(savedTheme);

    const toggleBtns = document.querySelectorAll(
      ".btn-theme-toggle, #btn-theme-toggle",
    );
    toggleBtns.forEach((btn) => {
      btn.addEventListener("click", () => this.toggle());
    });
  },

  applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(this.STORAGE_KEY, theme);
  },

  toggle() {
    const currentTheme =
      document.documentElement.getAttribute("data-theme") || "light";
    const newTheme = currentTheme === "light" ? "dark" : "light";
    this.applyTheme(newTheme);
  },
};

const LanguageManager = {
  STORAGE_KEY: "autorent_lang",

  init() {
    const savedLang = localStorage.getItem(this.STORAGE_KEY) || "fr";

    this.applyLanguage(savedLang);

    document.querySelectorAll(".lang-select").forEach((select) => {
      select.addEventListener("change", (e) => {
        this.applyLanguage(e.target.value);
      });
    });
  },

  // Attributs HTML traduisibles : data-i18n-<suffixe> -> attribut <suffixe>
  ATTRIBUTES: ["placeholder", "title", "aria-label"],

  applyLanguage(lang) {
    if (!TRANSLATIONS[lang]) lang = "fr";

    // Mémorisation avant de traduire (t() lit la langue courante)
    localStorage.setItem(this.STORAGE_KEY, lang);
    document.documentElement.lang = lang;

    this.translateTree(document);

    // Synchronise tous les sélecteurs (desktop + mobile)
    document.querySelectorAll(".lang-select").forEach((select) => {
      select.value = lang;
    });

    // Calendriers Flatpickr
    const pickerLocale = lang === "fr" ? "fr" : "default";
    [
      CatalogManager.filterStartPicker,
      CatalogManager.filterEndPicker,
      ReservationManager.startPicker,
      ReservationManager.endPicker,
    ].forEach((picker) => {
      if (picker) picker.set("locale", pickerLocale);
    });

    AuthenticationManager.updateUI();
  },

  // Traduit tous les éléments portant data-i18n (ou data-i18n-<attribut>) sous `root`
  translateTree(root) {
    root.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.getAttribute("data-i18n");
      const arg = element.getAttribute("data-i18n-arg");
      if (this.has(key)) element.textContent = this.t(key, arg);
    });

    this.ATTRIBUTES.forEach((attr) => {
      root.querySelectorAll(`[data-i18n-${attr}]`).forEach((element) => {
        const key = element.getAttribute(`data-i18n-${attr}`);
        if (!this.has(key)) return;
        element.setAttribute(attr, this.t(key));
        // Flatpickr (altInput) recopie le placeholder dans un champ séparé
        if (attr === "placeholder" && element._flatpickr?.altInput) {
          element._flatpickr.altInput.setAttribute(attr, this.t(key));
        }
      });
    });
  },

  currentLang() {
    return localStorage.getItem(this.STORAGE_KEY) || "fr";
  },

  has(key) {
    const dict = TRANSLATIONS[this.currentLang()];
    return !!dict && key in dict;
  },

  // `arg` : valeur remplaçant {0}, ou objet { nom: valeur } remplaçant {nom}
  t(key, arg) {
    const dict = TRANSLATIONS[this.currentLang()] || {};
    let text = key in dict ? dict[key] : key;

    if (arg !== undefined && arg !== null) {
      if (typeof arg === "object") {
        Object.entries(arg).forEach(([name, value]) => {
          text = text.replaceAll(`{${name}}`, value);
        });
      } else {
        text = text.replaceAll("{0}", arg);
      }
    }
    return text;
  },

  // Traduit une valeur d'énumération (ex: prefix "fuel", value "PETROL") ; renvoie la valeur brute sinon
  tEnum(prefix, value) {
    const key = `${prefix}.${value}`;
    return this.has(key) ? this.t(key) : value;
  },

  // Fixe le texte d'un élément ET le mémorise pour les futurs changements de langue
  setText(element, key, arg) {
    if (!element) return;
    element.setAttribute("data-i18n", key);
    if (arg !== undefined && arg !== null) {
      element.setAttribute("data-i18n-arg", arg);
    } else {
      element.removeAttribute("data-i18n-arg");
    }
    element.textContent = this.t(key, arg);
  },

  // Clé d'unité de durée selon le nombre de jours
  daysKey(n) {
    return Number(n) === 1 ? "unit.day" : "unit.days";
  },

  // Attributs HTML (à insérer dans un template) : data-i18n="clé" [data-i18n-arg="arg"]
  attrs(key, arg) {
    return `data-i18n="${key}"${arg !== undefined ? ` data-i18n-arg="${arg}"` : ""}`;
  },

};

const IconsManager = {
  iconsSvg: {
    fuelType: `<svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="3" y1="22" x2="15" y2="22"></line>
      <line x1="4" y1="9" x2="14" y2="9"></line>
      <path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"></path>
      <path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"></path>
    </svg>
    `,
    power: `<svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 14l4-4"></path>
      <path d="M3.34 19a10 10 0 1 1 17.32 0"></path>
    </svg>
    `,
    transmission: `<svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
    `,
    seats: `<svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
    `,
    info: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
    `,
    calendar: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
    `,
    cancel: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="15" y1="9" x2="9" y2="15"></line>
      <line x1="9" y1="9" x2="15" y2="15"></line>
    </svg>
    `,
    leftArrow: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
    `,
  },
  getIconSvg(type) {
    const icon = this.iconsSvg[type];

    if (!icon) return `<p>Icon type '${type}' not found.</p>`;

    return icon;
  },
};

const CatalogManager = {
  vehicles: [],
  filters: {
    category: null,
    fuelType: null,
    minPrice: null,
    maxPrice: null,
    transmission: null,
    seatsCount: null,
    sort: null,
  },

  async init() {
    this.catalogGrid = document.getElementById("vehicles-grid");
    // Si la grille du catalogue n'est pas présente sur la page, on ne fait rien (pas de requête vers /api/vehicles)
    if (!this.catalogGrid) return;

    // Si c'est la page d'accueil, on affiche trois véhicules actuellement disponibles
    if (window.location.pathname === "/" || window.location.pathname === "/index.html") {
      const today = new Date().toISOString().split("T")[0];
      const vehicles = await getVehicles(3, today, today);
      this.displayVehicles(vehicles);
      return;
    }

    this.vehiclesCount = document.getElementById("vehicles-count-value");

    // Trieur et filtres
    this.filtersForm = document.getElementById("filters-form");
    this.sortSelect = document.getElementById("vehicles-sort");

    if (this.sortSelect) {
      this.sortSelect.addEventListener("change", () => {
        this.onApplyFilters(this.filtersForm);
      });
    }

    if (this.filtersForm) {
      // Écouter "input" pour réagir immédiatement lors de la frappe (text, number)
      this.filtersForm.addEventListener("input", () => {
        this.onApplyFilters(this.filtersForm);
      });

      // Écouter "change" pour les listes déroulantes (<select>)
      this.filtersForm.addEventListener("change", () => {
        this.onApplyFilters(this.filtersForm);
      });

      // Réinitialisation propre du formulaire et des calendriers
      this.filtersForm.addEventListener("reset", () => {
        setTimeout(() => {
          // Passer false à clear() pour éviter d'émettre un événement change indésirable
          if (this.filterStartPicker) {
            this.filterStartPicker.clear(false);
          }
          if (this.filterEndPicker) {
            this.filterEndPicker.clear(false);
            this.filterEndPicker.set("minDate", "today");
          }
          if (this.sortSelect) {
            this.sortSelect.value = "none";
          }
          this.displayVehicles(this.vehicles);
        }, 0);
      });
    }

    // Gestion du bouton mobile pour afficher/masquer les filtres
    const toggleFiltersBtn = document.getElementById("btn-toggle-filters");
    const filtersAside = document.getElementById("vehicles-filters");
    if (toggleFiltersBtn && filtersAside) {
      toggleFiltersBtn.addEventListener("click", () => {
        const isOpen = filtersAside.classList.toggle("open");
        toggleFiltersBtn.setAttribute("aria-expanded", isOpen);
        LanguageManager.setText(
          toggleFiltersBtn.querySelector("span"),
          isOpen ? "filters.hide" : "filters.show",
        );
      });
    }

    // Initialisation Flatpickr pour les filtres de dates
    this.initDatePickers();

    this.vehicles = await getVehicles();
    this.displayVehicles(this.vehicles);
  },

  initDatePickers() {
    this.startDateInput = document.getElementById("filter-date-start");
    this.endDateInput = document.getElementById("filter-date-end");

    if (
      !this.startDateInput ||
      !this.endDateInput ||
      typeof flatpickr === "undefined"
    ) {
      return;
    }

    const flatpickrConfig = {
      locale: LanguageManager.currentLang() === "fr" ? "fr" : "default",
      minDate: "today",
      dateFormat: "Y-m-d", // Format YYYY-MM-DD standard pour FormData
      altInput: true, // Affiche un format lisible jj/mm/aaaa
      altFormat: "d/m/Y",
    };

    this.filterStartPicker = flatpickr(this.startDateInput, {
      ...flatpickrConfig,
      onChange: (selectedDates) => {
        // La date de retour ne peut pas être avant la date de début
        if (selectedDates.length > 0 && this.filterEndPicker) {
          this.filterEndPicker.set("minDate", selectedDates[0]);
        }
        this.onApplyFilters(this.filtersForm);
      },
    });

    this.filterEndPicker = flatpickr(this.endDateInput, {
      ...flatpickrConfig,
      onChange: () => {
        this.onApplyFilters(this.filtersForm);
      },
    });
  },

  displayVehicles(vehiclesList) {
    if (!this.catalogGrid) return;

    this.catalogGrid.innerHTML = "";
    if (this.vehiclesCount) this.vehiclesCount.innerText = "0";

    if (vehiclesList === null) {
      this.catalogGrid.innerHTML = `<p ${LanguageManager.attrs("vehicle.load-error")}>${LanguageManager.t("vehicle.load-error")}</p>`;
      return;
    }

    if (vehiclesList.length === 0) {
      this.catalogGrid.innerHTML = `<p ${LanguageManager.attrs("vehicle.none")}>${LanguageManager.t("vehicle.none")}</p>`;
    }

    vehiclesList.forEach((vehicle) => {
      this.createOrReplaceVehicleCard(vehicle);
    });

    // Mise à jour du compteur
    if (this.vehiclesCount) this.vehiclesCount.innerText = vehiclesList.length;

    ReservationManager.bindButtons();
  },

  // TODO: fonction qui permet également de remplacer le contenu d'une carte existante dans le cas où un véhicule a été réservé (éviter de refaire toute la liste)
  createOrReplaceVehicleCard(vehicle) {
    const existingCard = document.querySelector(`article[data-vehicle-id="${vehicle.id}"]`);
    let vehicleCard;

    if (existingCard) {
      vehicleCard = existingCard;
    } else {
      vehicleCard = document.createElement("article");
      vehicleCard.classList.add("vehicle-card");
      vehicleCard.dataset.vehicleId = vehicle.id;
    }

    const brand = vehicle.brand;
    const model = vehicle.model;
    const category = vehicle.category;
    const year = vehicle.year;
    const horsePower = vehicle.horsePower;
    const imagePath = vehicle.imagePath;
    const seatsCount = vehicle.seatsCount;
    const fuelType = vehicle.fuelType;
    const transmission = vehicle.transmission;
    const dailyPrice = vehicle.dailyPrice;
    const available = vehicle.available;
    const isCurrentlyAvailable = vehicle.isCurrentlyAvailable;
    const availableFrom = vehicle.availableFrom;

    const status = isCurrentlyAvailable
      ? `<p class="vehicle-status available"><span ${LanguageManager.attrs("vehicle.available-now")}>${LanguageManager.t("vehicle.available-now")}</span> <span class="vehicle-status-badge"></span></p>`
      : `<span class="vehicle-status rented">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor"
                fill="none" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span ${LanguageManager.attrs("vehicle.available-from", availableFrom)}>${LanguageManager.t("vehicle.available-from", availableFrom)}</span>
            <span class="vehicle-status-badge"></span>
          </span>`;

    const image = imagePath
      ? `<img src="${BASE_API_URL}${imagePath}" alt="${brand} ${model}" class="vehicle-card-img">`
      : `<div class="media-placeholder">
            <svg class="placeholder-icon" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="1.5">
                <path
                    d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 11.2 2 11.8 2 12.4V16c0 .6.4 1 1 1h2" />
                <circle cx="7" cy="17" r="2" />
                <circle cx="17" cy="17" r="2" />
            </svg>
            <span class="media-label">${brand} ${model}</span>
          </div>`;

    const powerUnit = LanguageManager.t("vehicle.power-unit");
    const seatsLabel = LanguageManager.t("vehicle.seats");
    const priceLabel = LanguageManager.t("vehicle.per-day");

    vehicleCard.innerHTML = `
        <div class="vehicle-card-media">
          <span class="category-badge" data-i18n="category.${category}">${LanguageManager.tEnum("category", category)}</span>
          ${status}
          ${image}
        </div>

        <div class="vehicle-card-content">
          <div class="card-header-info">
            <div>
              <h3 class="vehicle-brand">${brand}</h3>
              <h2 class="vehicle-model">${model}</h2>
            </div>
            <span class="vehicle-year">${year}</span>
          </div>

          <div class="specs-list">
            <div class="spec-item">
                ${IconsManager.getIconSvg("fuelType")}
                <span data-i18n="fuel.${fuelType}">${LanguageManager.tEnum("fuel", fuelType)}</span>
            </div>
            <div class="spec-item">
                ${IconsManager.getIconSvg("power")}
                <span>${horsePower} <span data-i18n="vehicle.power-unit">${powerUnit}</span></span>
            </div>
            <div class="spec-item">
                ${IconsManager.getIconSvg("transmission")}
                <span data-i18n="transmission.${transmission}">${LanguageManager.tEnum("transmission", transmission)}</span>
            </div>
            <div class="spec-item">
                ${IconsManager.getIconSvg("seats")}
                <span>${seatsCount} <span data-i18n="vehicle.seats">${seatsLabel}</span></span>
            </div>
          </div>
          <div class="card-footer">
            <div class="price-container">
              <span class="price-value">${dailyPrice}€</span>
              <span class="price-period" data-i18n="vehicle.per-day">${priceLabel}</span>
            </div>
            <div class="action-wrapper">
              ${
                isCurrentlyAvailable
                  ? ``
                  : `
                <div class="tooltip-container">
                  <span class="tooltip-icon">i</span>
                  <div class="tooltip-text" ${LanguageManager.attrs("vehicle.rented-tooltip")}>${LanguageManager.t("vehicle.rented-tooltip")}</div>
                </div>`
              }
              <button class="btn btn-primary btn-open-reservation" data-vehicle-id="${vehicle.id}" ${LanguageManager.attrs("vehicle.reserve")}>${LanguageManager.t("vehicle.reserve")}</button>
            </div>
          </div>
        </div>
      `;

    if (!existingCard) {
      this.catalogGrid.appendChild(vehicleCard);
    }

    ReservationManager.bindButtons()

  },

  onApplyFilters(formElement = this.filtersForm) {
    if (!formElement) return;

    const formData = new FormData(formElement);
    const values = Object.fromEntries(formData);

    const filteredVehicles = this.vehicles.filter((vehicle) => {
      // Date de début : le véhicule est disponible si sa date de disponibilité est antérieure ou égale
      const availableMatch =
        !values.startDate ||
        (vehicle.availableFrom && vehicle.availableFrom <= values.startDate);

      // Catégorie
      const categoryMatch =
        !values.category || values.category === vehicle.category;

      // Marque
      const brandMatch =
        !values.brand ||
        vehicle.brand.toLowerCase() === values.brand.toLowerCase();

      // Carburant
      const fuelTypeMatch =
        !values.fuelType || vehicle.fuelType === values.fuelType;

      // Transmission
      const transmissionMatch =
        !values.transmission || vehicle.transmission === values.transmission;

      // Puissance (conversion numérique)
      const powerMin =
        values.powerMin !== "" && values.powerMin !== undefined
          ? Number(values.powerMin)
          : null;
      const powerMax =
        values.powerMax !== "" && values.powerMax !== undefined
          ? Number(values.powerMax)
          : null;
      const powerMatch =
        (powerMin === null || vehicle.horsePower >= powerMin) &&
        (powerMax === null || vehicle.horsePower <= powerMax);

      // Nombre de sièges
      const selectedSeats = values.seats || values.seatsCount;
      const seatsMatch =
        !selectedSeats || vehicle.seatsCount === Number(selectedSeats);

      // Prix journalier (conversion numérique)
      const priceMin =
        values.priceMin !== "" && values.priceMin !== undefined
          ? Number(values.priceMin)
          : null;
      const priceMax =
        values.priceMax !== "" && values.priceMax !== undefined
          ? Number(values.priceMax)
          : null;
      const priceMatch =
        (priceMin === null || vehicle.dailyPrice >= priceMin) &&
        (priceMax === null || vehicle.dailyPrice <= priceMax);

      // Mot-clé
      const keyword = values.keyword ? values.keyword.trim().toLowerCase() : "";
      const keywordMatch =
        !keyword ||
        vehicle.brand.toLowerCase().includes(keyword) ||
        vehicle.model.toLowerCase().includes(keyword);

      return (
        availableMatch &&
        categoryMatch &&
        brandMatch &&
        fuelTypeMatch &&
        transmissionMatch &&
        powerMatch &&
        seatsMatch &&
        priceMatch &&
        keywordMatch
      );
    });

    // Tri dynamique
    const sortValue = this.sortSelect ? this.sortSelect.value : "none";
    if (sortValue === "price-asc") {
      filteredVehicles.sort((a, b) => a.dailyPrice - b.dailyPrice);
    } else if (sortValue === "price-desc") {
      filteredVehicles.sort((a, b) => b.dailyPrice - a.dailyPrice);
    } else if (sortValue === "year-asc") {
      filteredVehicles.sort((a, b) => a.year - b.year);
    } else if (sortValue === "year-desc") {
      filteredVehicles.sort((a, b) => b.year - a.year);
    }

    this.displayVehicles(filteredVehicles);
  },
};

const ReservationManager = {
  currentVehicle: null,
  unavailableDates: [],
  dailyPrice: 0,

  init() {
    // 1. Affichage de mes réservations (si la liste existe sur la page)
    this.myReservationsSection = document.getElementById("my-reservations");
    this.myReservationsList = document.getElementById("my-reservations-list");

    if (this.myReservationsList) {
      this.myReservationsList.addEventListener("click", (e) =>
        this.onReservationsListClick(e),
      );
      this.displayMyReservations();
    }

    // 2. Formulaire / modale de réservation (si la modale existe sur la page)
    this.modal = document.getElementById("reservation-modal");
    if (this.modal) {
      this.closeBtn = document.getElementById("close-modal-btn");
      this.startDateInput = document.getElementById("start-date");
      this.endDateInput = document.getElementById("end-date");
      this.form = document.getElementById("reservation-form");
      this.errorMsg = document.getElementById("date-error");
      this.confirmBtn = document.getElementById("confirm-reservation-btn");

      // Bind events
      if (this.closeBtn)
        this.closeBtn.addEventListener("click", () => this.closeModal());
      if (this.form)
        this.form.addEventListener("submit", (e) => this.handleSubmit(e));

      // Fermer si on clique en dehors du contenu
      this.modal.addEventListener("click", (e) => {
        if (e.target === this.modal) {
          this.closeModal();
        }
      });

      this.unavailableDates = [];

      // Initialisation de Flatpickr sur les champs de date
      if (
        this.startDateInput &&
        this.endDateInput &&
        typeof flatpickr !== "undefined"
      ) {
        const flatpickrConfig = {
          locale: LanguageManager.currentLang() === "fr" ? "fr" : "default",
          minDate: "today",
          dateFormat: "Y-m-d",
          altInput: true,
          altFormat: "d/m/Y",
          disable: [],
        };

        this.startPicker = flatpickr(this.startDateInput, {
          ...flatpickrConfig,
          onChange: (selectedDates) => {
            if (selectedDates.length > 0 && this.endPicker) {
              this.endPicker.set("minDate", selectedDates[0]);
            }
            this.validateDates();
          },
        });
        this.endPicker = flatpickr(this.endDateInput, {
          ...flatpickrConfig,
          onChange: () => this.validateDates(),
        });
      }

      // Bind "Réserver" buttons
      this.bindButtons();
    }
  },

  bindButtons() {
    const buttons = document.querySelectorAll(".btn-open-reservation");
    buttons.forEach((btn) => {
      if (btn.dataset.boundReservation) return;
      btn.dataset.boundReservation = "true";

      btn.addEventListener("click", (e) => {
        // Extraction des données de la carte sur laquelle on a cliqué
        const card = e.target.closest(".vehicle-card");
        const vehicleId = btn.dataset.vehicleId || card?.dataset.vehicleId;
        const brand =
          card?.querySelector(".vehicle-brand")?.textContent ||
          LanguageManager.t("vehicle.unknown-brand");
        const model =
          card?.querySelector(".vehicle-model")?.textContent ||
          LanguageManager.t("vehicle.unknown-model");
        const categoryElement = card?.querySelector(".category-badge");
        const category =
          categoryElement?.textContent || LanguageManager.t("modal.category-default");
        const categoryKey = categoryElement?.getAttribute("data-i18n") || null;
        const img = card?.querySelector(".vehicle-card-img")?.src || "";
        const priceText =
          card?.querySelector(".price-value")?.textContent || "0";
        const price = parseFloat(priceText.replace("€", ""));

        // On récupère le HTML des specs pour l'injecter dans la modale
        const specItems = card ? card.querySelectorAll(".spec-item") : [];
        const specs = Array.from(specItems)
          .map((item) => item.outerHTML)
          .join("");

        this.openModal({
          id: vehicleId,
          brand,
          model,
          category,
          categoryKey,
          imagePath: img,
          dailyPrice: price,
          specsHtml: specs,
        });
      });
    });
  },

  async openModal(vehicleData) {
    this.currentVehicle = vehicleData;
    this.dailyPrice = vehicleData.dailyPrice || 0;

    // Remplissage des infos à gauche
    document.getElementById("modal-vehicle-img").src = vehicleData.imagePath;
    document.getElementById("modal-vehicle-brand").textContent =
      vehicleData.brand;
    document.getElementById("modal-vehicle-model").textContent =
      vehicleData.model;
    const modalCategory = document.getElementById("modal-vehicle-category");
    modalCategory.textContent = vehicleData.category;
    if (vehicleData.categoryKey) {
      modalCategory.setAttribute("data-i18n", vehicleData.categoryKey);
    } else {
      modalCategory.removeAttribute("data-i18n");
    }
    document.getElementById("modal-vehicle-specs").innerHTML =
      vehicleData.specsHtml || "";
    document.getElementById("summary-daily-price").textContent =
      `${this.dailyPrice}€`;

    // Reset du formulaire à droite
    this.form.reset();
    this.errorMsg.style.display = "none";
    this.confirmBtn.disabled = true;
    this.setSummaryDays(0);
    document.getElementById("summary-price").textContent = "0€";

    // Récupération des dates indisponibles ce véhicule
    this.unavailableDates = [];
    if (vehicleData.id) {
      try {
        const dates = await getUnavailableDates(vehicleData.id);
        if (Array.isArray(dates)) {
          this.unavailableDates = dates;
        }
      } catch (err) {
        console.error("Erreur récupération dates indisponibles :", err);
      }
    }

    // Mise à jour de Flatpickr avec les dates
    if (this.startPicker) {
      this.startPicker.set("disable", this.unavailableDates);
      this.startPicker.clear();
    }
    if (this.endPicker) {
      this.endPicker.set("disable", this.unavailableDates);
      this.endPicker.set("minDate", "today");
      this.endPicker.clear();
    }

    this.modal.classList.add("active");
  },

  closeModal() {
    this.modal.classList.remove("active");
  },

  setSummaryDays(days) {
    LanguageManager.setText(
      document.getElementById("summary-days"),
      LanguageManager.daysKey(days),
      days,
    );
  },

  showError(key) {
    LanguageManager.setText(this.errorMsg, key);
    this.errorMsg.style.display = "block";
  },

  validateDates() {
    const startVal = this.startDateInput.value;
    const endVal = this.endDateInput.value;

    this.errorMsg.style.display = "none";
    this.confirmBtn.disabled = true;
    this.setSummaryDays(0);
    document.getElementById("summary-price").textContent = "0€";

    if (!startVal || !endVal) return;

    const start = new Date(startVal);
    const end = new Date(endVal);

    // On met tout à minuit pour comparer précisément
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (end < start) {
      this.showError("modal.error.end-before-start");
      return;
    }

    // Vérification s'il y a un conflit avec les dates indisponibles (boucle sur chaque jour)
    let hasOverlap = false;
    let currentDate = new Date(start);
    while (currentDate <= end) {
      // Extraction sécurisée de la date locale (YYYY-MM-DD) sans décalage UTC
      const y = currentDate.getFullYear();
      const m = String(currentDate.getMonth() + 1).padStart(2, "0");
      const d = String(currentDate.getDate()).padStart(2, "0");
      const localDateStr = `${y}-${m}-${d}`;

      if (this.unavailableDates.includes(localDateStr)) {
        console.log(localDateStr, "est indisponible");
        hasOverlap = true;
        break;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (hasOverlap) {
      this.showError("modal.error.overlap");
      return;
    }

    // Les dates sont valides, calcul du prix (différence en millisecondes convertie en jours)
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 pour inclure le jour de départ ET le jour de fin

    this.setSummaryDays(diffDays);
    document.getElementById("summary-price").textContent =
      `${diffDays * this.dailyPrice}€`;

    this.confirmBtn.disabled = false;
  },

  // TODO: Supprimer les alert, mettre à jour l'affichage
  async handleSubmit(e) {
    e.preventDefault();

    if (!AuthenticationManager.isAuthenticated()) {
      ToastManager.show(LanguageManager.t("modal.alert.login-required"), "warning");
      AuthenticationManager.openModal("login");
      return;
    }

    if (!this.currentVehicle || !this.currentVehicle.id) {
      ToastManager.show(LanguageManager.t("modal.alert.vehicle-not-found"), "error");
      return;
    }

    const startDate = this.startDateInput.value;
    const endDate = this.endDateInput.value;

    if (!startDate || !endDate) {
      this.showError("modal.error.missing-dates");
      return;
    }

    try {
      this.confirmBtn.disabled = true;
      LanguageManager.setText(this.confirmBtn, "modal.confirming");

      const token = AuthenticationManager.getToken();
      const tokenWithBearer = token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;

      const res = await createReservation(
        this.currentVehicle.id,
        startDate,
        endDate,
        tokenWithBearer,
      );

      if (res && res.id) {
        ToastManager.show(
          LanguageManager.t("modal.alert.success", {
            id: res.id,
            vehicle: `${this.currentVehicle.brand} ${this.currentVehicle.model}`,
            start: startDate,
            end: endDate,
          }),
          "success",
        );
        this.closeModal();

        // Si la liste des réservations est présente sur la page, la rafraîchir
        if (this.myReservationsList) {
          this.displayMyReservations();
        }

        // Mettre à jour l'affichage de la voiture présente dans le catalogue
        if (CatalogManager.catalogGrid) {
          // TODO: ? modifier le DTO de Reservation pour renvoyer le véhicule avec les changements
          const vehicle = await getVehicleById(res.vehicle.id)
          CatalogManager.createOrReplaceVehicleCard(vehicle);
        }
      } else {
        this.showError("modal.error.create-failed");
      }
    } catch (err) {
      console.error("Erreur lors de la réservation :", err);
      this.showError("modal.error.generic");
    } finally {
      this.confirmBtn.disabled = false;
      LanguageManager.setText(this.confirmBtn, "modal.confirm");
    }
  },

  async displayMyReservations() {
    this.myReservationsList.innerHTML = "";
    const jwt_token = localStorage.getItem(AuthenticationManager.tokenKey);
    const messageHtml = (key) =>
      `<p ${LanguageManager.attrs(key)}>${LanguageManager.t(key)}</p>`;

    if (!jwt_token) {
      this.myReservationsList.innerHTML = messageHtml("reservations.login-required");
      return;
    }

    const tokenWithBearer = jwt_token.startsWith("Bearer ")
      ? jwt_token
      : `Bearer ${jwt_token}`;
    const reservations = await getMyReservations(tokenWithBearer);

    if (reservations === null) {
      this.myReservationsList.innerHTML = messageHtml("reservations.load-error");
      return;
    }

    if (reservations.length === 0) {
      this.myReservationsList.innerHTML = messageHtml("reservations.none");
      return;
    }

    // Initialisation de la date du jour à minuit pour une comparaison juste
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Groupement des réservations par statut temporel
    const categories = {
      current: [],
      incomming: [],
      finished: [],
      cancelled: []
    }

    reservations.forEach((reservation) => {
      const startDate = new Date(reservation.startDate);
      const endDate = new Date(reservation.endDate);

      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(0, 0, 0, 0)

      if (reservation.status === "CANCELLED"){
        categories.cancelled.push(reservation)
      }
      else if (endDate < today) {
        categories.finished.push(reservation)
      } else if (startDate <= today && today <= endDate) {
        categories.current.push(reservation)
      } else {
        // Placement au début de la liste pour afficher d'abord les réservations les plus proches dans le temps
        categories.incomming.unshift(reservation)
      }
    })

    // Structure pour itérer proprement sur les catégories et ajouter les lignes démarcation
    const sections = [
      {key: "current", label: "reservations.section.current"},
      {key: "incomming", label: "reservations.section.incomming"},
      {key: "finished", label: "reservations.section.finished"},
      {key: "cancelled", label: "reservations.section.cancelled"}
    ]

    // Affichage des sections et des réservations
    sections.forEach(section => {
      const list = categories[section.key]
      if (list.length === 0) return

      const sectionHeader = document.createElement("div");
      sectionHeader.className = `reservation-section-title`;
      sectionHeader.innerHTML = `<h3><span ${LanguageManager.attrs(section.label)}>${LanguageManager.t(section.label)}</span> (${list.length})</h3><hr>`;
      this.myReservationsList.appendChild(sectionHeader);

      // Génération des lignes de réservations
      list.forEach(reservation => {
        const reservationElement = document.createElement("article");
        reservationElement.classList.add("reservation-card");
    
        const vehicle = reservation.vehicle;
        const startDate = new Date(reservation.startDate)
        const endDate = new Date(reservation.endDate)

        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        
        // Calcul du nombre de jours restant
        let daysLeftText = ""
        const diffTimeLeft = endDate - today
        const diffDaysLeft = Math.ceil(diffTimeLeft / (1000 * 60 * 60 * 24))

        if (section.key === "current") {
          daysLeftText = `<span class="days-left text-orange" ${LanguageManager.attrs("reservations.days-left", diffDaysLeft)}>${LanguageManager.t("reservations.days-left", diffDaysLeft)}</span>`;
        } else if (section.key === "incomming") {
          const diffTimeBeforeStart = startDate - today;
          const diffDaysBeforeStart = Math.ceil(diffTimeBeforeStart / (1000 * 60 * 60 * 24));
          daysLeftText = `<span class="days-left text-blue" ${LanguageManager.attrs("reservations.starts-in", diffDaysBeforeStart)}>${LanguageManager.t("reservations.starts-in", diffDaysBeforeStart)}</span>`;
        } else {
          daysLeftText = `<span class="days-left text-gray" ${LanguageManager.attrs("reservations.finished")}>${LanguageManager.t("reservations.finished")}</span>`;
        }

        const cancelButtonHtml = (section.key === "incomming")
          ? `<button type="button" class="btn-cancel-reservation" data-id="${reservation.id}">
              ${IconsManager.getIconSvg("cancel")} <span ${LanguageManager.attrs("reservations.cancel")}>${LanguageManager.t("reservations.cancel")}</span>
             </button>`
          : "";

        const statusKey = `reservations.status.${reservation.status}`;
        const statusLabel = LanguageManager.tEnum("reservations.status", reservation.status);

        reservationElement.innerHTML = `
          <div class="reservation-media">
            <img src="${vehicle.imagePath}" alt="${vehicle.brand} ${vehicle.model}" class="reservation-img">
          </div>
          <div class="reservation-content">
            <div class="reservation-header-info">
              <div class="reservation-title-group">
                <span class="reservation-id">#${reservation.id}</span>
                <h2 class="reservation-vehicle-name">${vehicle.brand} ${vehicle.model}</h2>
                <button type="button" class="btn-vehicle-details" data-i18n-title="reservations.details-title" title="${LanguageManager.t("reservations.details-title")}">
                  ${IconsManager.getIconSvg("info")} <span ${LanguageManager.attrs("reservations.details")}>${LanguageManager.t("reservations.details")}</span>
                </button>
              </div>
              <span class="reservation-status status-${reservation.status.toLowerCase()}">
                <span class="status-dot"></span>
                <span data-i18n="${statusKey}">${statusLabel}</span>
              </span>
            </div>
            <div class="reservation-body-info">
              <div class="reservation-dates-group">
                <div class="date-item">
                  ${IconsManager.getIconSvg("calendar")}
                  <div class="date-text">
                    <span class="date-label" ${LanguageManager.attrs("reservations.start")}>${LanguageManager.t("reservations.start")}</span>
                    <strong class="date-value">${reservation.startDate}</strong>
                  </div>
                </div>
                <div class="date-arrow">
                  ${IconsManager.getIconSvg("leftArrow")}
                </div>
                <div class="date-item">
                  ${IconsManager.getIconSvg("calendar")}
                  <div class="date-text">
                    <span class="date-label" ${LanguageManager.attrs("reservations.end")}>${LanguageManager.t("reservations.end")}</span>
                    <strong class="date-value">${reservation.endDate}</strong>
                  </div>
                </div>
                <span class="reservation-duration-badge"><span ${LanguageManager.attrs(LanguageManager.daysKey(diffDays), diffDays)}>${LanguageManager.t(LanguageManager.daysKey(diffDays), diffDays)}</span> &bull; ${reservation.totalPrice} €</span>
                ${daysLeftText}
              </div>
              <div class="reservation-actions">
                ${cancelButtonHtml}
              </div>
            </div>
          </div>
        `;
        this.myReservationsList.appendChild(reservationElement);

      })
    });
  },

  // Délégation d'événement : posée une seule fois dans init(), pas à chaque rendu de la liste
  async onReservationsListClick(e) {
    const cancelButton = e.target.closest(".btn-cancel-reservation");
    if (!cancelButton || !cancelButton.dataset.id) return;

    const resId = cancelButton.dataset.id;
    const confirmed = await ConfirmManager.ask({
      title: LanguageManager.t("reservations.cancel"),
      message: LanguageManager.t("reservations.cancel-confirm", resId),
      confirmLabel: LanguageManager.t("reservations.cancel-confirm-btn"),
      danger: true,
    });
    if (!confirmed) return;

    // Token lu au moment du clic (il peut avoir changé depuis le dernier rendu)
    const token = localStorage.getItem(AuthenticationManager.tokenKey);
    if (!token) return;
    const tokenWithBearer = token.startsWith("Bearer ") ? token : `Bearer ${token}`;

    await cancelReservation(resId, tokenWithBearer);
    console.log(`La réservation #${resId} a bien été annulée`);

    // TODO: logique de raffraichissement, éviter de scroll tout en haut
    this.displayMyReservations();
  },

};

function onAuthStateChanged() {
  AuthenticationManager.updateUI();

  // Si l'utilisateur est sur la page des réservations, recharger les réservations
  if (ReservationManager.myReservationsList) {
    ReservationManager.displayMyReservations();
  }
}

async function initAll() {
  ThemeManager.init();
  NavigationManager.init();
  AuthenticationManager.init();
  ReservationManager.init();
  // Après les autres managers : la modale d'auth et les calendriers existent déjà
  LanguageManager.init();
  await CatalogManager.init();
}

document.addEventListener("DOMContentLoaded", () => initAll());
