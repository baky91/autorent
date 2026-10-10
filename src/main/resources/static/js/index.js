import { getAllVehicles, getVehicleById } from "./api.js";

const ThemeManager = {
  STORAGE_KEY: "autorent_theme",

  init() {
    const savedTheme = localStorage.getItem(this.STORAGE_KEY);

    this.applyTheme(savedTheme);

    const toggleBtn = document.getElementById("btn-theme-toggle");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => this.toggle());
    }
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
    
    // Simulation de dates réservées (ex: de demain à dans 4 jours)
    const today = new Date();
    for (let i = 1; i <= 4; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      // On extrait la date locale sans le décalage UTC
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      this.unavailableDates.push(`${y}-${m}-${day}`);
    }

    // Initialisation de Flatpickr sur les champs de date
    const flatpickrConfig = {
      locale: "fr",
      minDate: "today",
      dateFormat: "Y-m-d", // Format envoyé au backend
      altInput: true,      // Affiche un format lisible à l'utilisateur
      altFormat: "d/m/Y",  // Format affiché (jj/mm/aaaa)
      disable: this.unavailableDates, // Désactive les dates visuellement
      onChange: () => this.validateDates()
    };

    this.startPicker = flatpickr(this.startDateInput, flatpickrConfig);
    this.endPicker = flatpickr(this.endDateInput, flatpickrConfig);
    
    // Bind "Réserver" buttons
    this.bindButtons();
  },
  
  bindButtons() {
    const buttons = document.querySelectorAll(".btn-open-reservation");
    buttons.forEach(btn => {
      btn.addEventListener("click", (e) => {
        // Extraction des données de la carte sur laquelle on a cliqué
        const card = e.target.closest('.vehicle-card');
        const brand = card.querySelector('.vehicle-brand')?.textContent || "Marque inconnue";
        const model = card.querySelector('.vehicle-model')?.textContent || "Modèle inconnu";
        const img = card.querySelector('.vehicle-card-img')?.src || "";
        const priceText = card.querySelector('.price-value')?.textContent || "0";
        const price = parseFloat(priceText.replace('€', ''));
        
        // On récupère le HTML des specs pour l'injecter dans la modale
        const specItems = card.querySelectorAll('.spec-item');
        const specs = Array.from(specItems).map(item => item.outerHTML).join('');
        
        this.openModal({
          brand,
          model,
          imagePath: img,
          dailyPrice: price,
          specsHtml: specs
        });
      });
    });
  },
  
  openModal(vehicleData) {
    this.currentVehicle = vehicleData;
    this.dailyPrice = vehicleData.dailyPrice || 0;
    
    // Remplissage des infos à gauche
    document.getElementById("modal-vehicle-img").src = vehicleData.imagePath;
    document.getElementById("modal-vehicle-brand").textContent = vehicleData.brand;
    document.getElementById("modal-vehicle-model").textContent = vehicleData.model;
    document.getElementById("modal-vehicle-specs").innerHTML = vehicleData.specsHtml || "";
    document.getElementById("summary-daily-price").textContent = `${this.dailyPrice}€`;
    
    // Reset du formulaire à droite
    this.form.reset();
    if(this.startPicker) this.startPicker.clear();
    if(this.endPicker) this.endPicker.clear();
    
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
    start.setHours(0,0,0,0);
    end.setHours(0,0,0,0);
    
    if (end < start) {
      this.errorMsg.textContent = "La date de retour doit être après la date de départ.";
      this.errorMsg.style.display = "block";
      return;
    }
    
    // Vérification s'il y a un conflit avec les dates indisponibles (boucle sur chaque jour)
    let hasOverlap = false;
    let currentDate = new Date(start);
    while (currentDate <= end) {
      // Extraction sécurisée de la date locale (YYYY-MM-DD) sans décalage UTC
      const y = currentDate.getFullYear();
      const m = String(currentDate.getMonth() + 1).padStart(2, '0');
      const d = String(currentDate.getDate()).padStart(2, '0');
      const localDateStr = `${y}-${m}-${d}`;

      if (this.unavailableDates.includes(localDateStr)) {
        console.log(localDateStr, "est indisponible");
        hasOverlap = true;
        break;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    if (hasOverlap) {
      this.errorMsg.textContent = "Certaines dates sélectionnées ne sont pas disponibles.";
      this.errorMsg.style.display = "block";
      return;
    }
    
    // Les dates sont valides, calcul du prix (différence en millisecondes convertie en jours)
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 pour inclure le jour de départ ET le jour de fin
    
    document.getElementById("summary-days").textContent = `${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    document.getElementById("summary-price").textContent = `${diffDays * this.dailyPrice}€`;
    
    this.confirmBtn.disabled = false;
  },
  
  handleSubmit(e) {
    e.preventDefault();
    alert(`Réservation confirmée pour le véhicule ${this.currentVehicle.brand} ${this.currentVehicle.model} du ${this.startDateInput.value} au ${this.endDateInput.value} !`);
    this.closeModal();
  }
};

const iconsSvg = {
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
};

function getIconSvg(type) {
  const icon = iconsSvg[type];

  if (!icon) return `<p>Icon type '${type}' not found.</p>`;

  return icon;
}

document.addEventListener("DOMContentLoaded", async () => {
  ThemeManager.init();
  ReservationManager.init();

  const allVehicles = await getAllVehicles();
  console.log(allVehicles);

  const oneVehicle = await getVehicleById(2);
  console.log(oneVehicle);
});
