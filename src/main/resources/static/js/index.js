import { getAllVehicles, getVehicleById } from "./api.js";

const BASE_API_URL = "http://localhost:8080";

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
    this.vehiclesCount = document.getElementById("vehicles-count-value");

    this.vehicles = await getAllVehicles();
    this.displayVehicles(this.vehicles);
    this.applyFilters();
  },

  displayVehicles() {
    this.catalogGrid.innerHTML = "";
    this.vehiclesCount.innerText = "0";

    this.vehicles.forEach((vehicle) => {
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

      const vehicleCard = document.createElement("article");
      vehicleCard.classList.add("vehicle-card");

      const status = isCurrentlyAvailable
        ? `<p class="vehicle-status available">Actuellement disponible <span class="vehicle-status-badge"></span></p>`
        : `<span class="vehicle-status rented">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor"
                fill="none" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Disponible dès le ${availableFrom}
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

      const powerUnit = LanguageManager.currentLang.toLowerCase() === "fr" ? "ch" : "hp";
      const seatsLabel = LanguageManager.currentLang.toLowerCase() === "fr" ? "places" : "seats";
      const priceLabel = LanguageManager.currentLang.toLowerCase() === "fr" ? "/ jour" : "/ day";

      vehicleCard.innerHTML = `
        <div class="vehicle-card-media">
          <span class="category-badge">${category}</span>
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
                <span>${fuelType}</span>
            </div>
            <div class="spec-item">
                ${IconsManager.getIconSvg("power")}
                <span>${horsePower} ${powerUnit.toUpperCase()}</span>
            </div>
            <div class="spec-item">
                ${IconsManager.getIconSvg("transmission")}
                <span>${transmission}</span>
            </div>
            <div class="spec-item">
                ${IconsManager.getIconSvg("seats")}
                <span>${seatsCount} ${seatsLabel}</span>
            </div>
          </div>
          <div class="card-footer">
            <div class="price-container">
              <span class="price-value">${dailyPrice}€</span>
              <span class="price-period">${priceLabel}</span>
            </div>
            <button class="btn btn-primary btn-open-reservation">Réserver</button>
          </div>
        </div>
      `;

      this.catalogGrid.appendChild(vehicleCard);
    });
    
    // Mise à jour du compteur
    this.vehiclesCount.innerText = this.vehicles.length;

    ReservationManager.bindButtons();

  },

  applyFilters() {
    // TODO : Implémenter l'application des filtres
  },
};

const ReservationManager = {
  currentVehicle: null,
  unavailableDates: [],
  dailyPrice: 0,

  init() {
    this.modal = document.getElementById("reservation-modal");
    if (!this.modal) return;

    this.closeBtn = document.getElementById("close-modal-btn");
    this.startDateInput = document.getElementById("start-date");
    this.endDateInput = document.getElementById("end-date");
    this.form = document.getElementById("reservation-form");
    this.errorMsg = document.getElementById("date-error");
    this.confirmBtn = document.getElementById("confirm-reservation-btn");

    // Bind events
    this.closeBtn.addEventListener("click", () => this.closeModal());
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));

    // Fermer si on clique en dehors du contenu
    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) {
        this.closeModal();
      }
    });

    // Simulation de dates réservées (ex: de demain à dans 4 jours)
    const today = new Date();
    for (let i = 1; i <= 4; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      // On extrait la date locale sans le décalage UTC
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      this.unavailableDates.push(`${y}-${m}-${day}`);
    }

    // Initialisation de Flatpickr sur les champs de date
    const flatpickrConfig = {
      locale: "fr",
      minDate: "today",
      dateFormat: "Y-m-d", // Format envoyé au backend
      altInput: true, // Affiche un format lisible à l'utilisateur
      altFormat: "d/m/Y", // Format affiché (jj/mm/aaaa)
      disable: this.unavailableDates, // Désactive les dates visuellement
      onChange: () => this.validateDates(),
    };

    this.startPicker = flatpickr(this.startDateInput, flatpickrConfig);
    this.endPicker = flatpickr(this.endDateInput, flatpickrConfig);

    // Bind "Réserver" buttons
    this.bindButtons();
  },

  bindButtons() {
    const buttons = document.querySelectorAll(".btn-open-reservation");
    buttons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        // Extraction des données de la carte sur laquelle on a cliqué
        const card = e.target.closest(".vehicle-card");
        const brand =
          card.querySelector(".vehicle-brand")?.textContent ||
          "Marque inconnue";
        const model =
          card.querySelector(".vehicle-model")?.textContent || "Modèle inconnu";
        const category =
          card.querySelector(".category-badge")?.textContent || "Catégorie";
        const img = card.querySelector(".vehicle-card-img")?.src || "";
        const priceText =
          card.querySelector(".price-value")?.textContent || "0";
        const price = parseFloat(priceText.replace("€", ""));

        // On récupère le HTML des specs pour l'injecter dans la modale
        const specItems = card.querySelectorAll(".spec-item");
        const specs = Array.from(specItems)
          .map((item) => item.outerHTML)
          .join("");

        this.openModal({
          brand,
          model,
          category,
          imagePath: img,
          dailyPrice: price,
          specsHtml: specs,
        });
      });
    });
  },

  openModal(vehicleData) {
    this.currentVehicle = vehicleData;
    this.dailyPrice = vehicleData.dailyPrice || 0;

    // Remplissage des infos à gauche
    document.getElementById("modal-vehicle-img").src = vehicleData.imagePath;
    document.getElementById("modal-vehicle-brand").textContent =
      vehicleData.brand;
    document.getElementById("modal-vehicle-model").textContent =
      vehicleData.model;
    document.getElementById("modal-vehicle-category").textContent =
      vehicleData.category;
    document.getElementById("modal-vehicle-specs").innerHTML =
      vehicleData.specsHtml || "";
    document.getElementById("summary-daily-price").textContent =
      `${this.dailyPrice}€`;

    // Reset du formulaire à droite
    this.form.reset();
    if (this.startPicker) this.startPicker.clear();
    if (this.endPicker) this.endPicker.clear();

    this.errorMsg.style.display = "none";
    this.confirmBtn.disabled = true;
    document.getElementById("summary-days").textContent = "0 jour";
    document.getElementById("summary-price").textContent = "0€";

    this.modal.classList.add("active");
  },

  closeModal() {
    this.modal.classList.remove("active");
  },

  validateDates() {
    const startVal = this.startDateInput.value;
    const endVal = this.endDateInput.value;

    this.errorMsg.style.display = "none";
    this.confirmBtn.disabled = true;
    document.getElementById("summary-days").textContent = "0 jour";
    document.getElementById("summary-price").textContent = "0€";

    if (!startVal || !endVal) return;

    const start = new Date(startVal);
    const end = new Date(endVal);

    // On met tout à minuit pour comparer précisément
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (end < start) {
      this.errorMsg.textContent =
        "La date de retour doit être après la date de départ.";
      this.errorMsg.style.display = "block";
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
      this.errorMsg.textContent =
        "Certaines dates sélectionnées ne sont pas disponibles.";
      this.errorMsg.style.display = "block";
      return;
    }

    // Les dates sont valides, calcul du prix (différence en millisecondes convertie en jours)
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 pour inclure le jour de départ ET le jour de fin

    document.getElementById("summary-days").textContent =
      `${diffDays} jour${diffDays > 1 ? "s" : ""}`;
    document.getElementById("summary-price").textContent =
      `${diffDays * this.dailyPrice}€`;

    this.confirmBtn.disabled = false;
  },

  handleSubmit(e) {
    e.preventDefault();
    alert(
      `Réservation confirmée pour le véhicule ${this.currentVehicle.brand} ${this.currentVehicle.model} du ${this.startDateInput.value} au ${this.endDateInput.value} !`,
    );
    this.closeModal();
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
  },
  getIconSvg(type) {
    const icon = this.iconsSvg[type];

    if (!icon) return `<p>Icon type '${type}' not found.</p>`;

    return icon;
  },
};

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

const LanguageManager = {
  currentLang: "FR",
  init() {
    const langBtns = document.querySelectorAll(".btn-lang-toggle");
    langBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.currentLang = this.currentLang === "FR" ? "EN" : "FR";
        const langText = document.getElementById("current-lang");
        if (langText) langText.textContent = this.currentLang;
        const mobileLabels = document.querySelectorAll(
          ".mobile-tool-btn.btn-lang-toggle .tool-label",
        );
        mobileLabels.forEach(
          (lbl) => (lbl.textContent = `Langue (${this.currentLang})`),
        );
      });
    });
  },
};

document.addEventListener("DOMContentLoaded", async () => {
  ThemeManager.init();
  LanguageManager.init();
  NavigationManager.init();
  ReservationManager.init();
  CatalogManager.init();
});
