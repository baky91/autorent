import {getAllVehicles, getVehicleById} from "./api.js";

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

document.addEventListener("DOMContentLoaded", async () => {
  ThemeManager.init();

  const allVehicles = await getAllVehicles();
  console.log(allVehicles);

  const oneVehicle = await getVehicleById(2);
  console.log(oneVehicle);

});
