document.addEventListener("DOMContentLoaded", () => {
  const screens = document.querySelectorAll(".screen");
  const tooltip = document.getElementById("tooltip");
  const infoHotspots = document.querySelectorAll(".info-hotspot");
  const navHotspots = document.querySelectorAll(".nav-hotspot");

  const filterButtons = document.querySelectorAll(".filter-btn");

  function hideTooltip() {
    tooltip.classList.remove("visible");
  }

  function showScreen(id) {
    screens.forEach((screen) => {
      screen.classList.toggle("active", screen.id === id);
    });
    hideTooltip();
  }

  // Navigation: Start-Screen-Knöpfe + Zurück-Buttons
  document.querySelectorAll("[data-target]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      const target = el.dataset.target;
      if (target) {
        showScreen(target);
      }
    });
  });

  // Info-Hotspots auf Detail-Seiten
  infoHotspots.forEach((hotspot) => {
    hotspot.addEventListener("click", (e) => {
      e.stopPropagation();

      const text = hotspot.dataset.text || "Keine Beschreibung hinterlegt.";
      const screen = hotspot.closest(".screen");

      tooltip.textContent = text;

      const hotspotRect = hotspot.getBoundingClientRect();
      const screenRect = screen.getBoundingClientRect();

      tooltip.style.left = hotspotRect.left - screenRect.left + "px";
      tooltip.style.top = hotspotRect.top - screenRect.top - 10 + "px";

      tooltip.classList.add("visible");
    });
  });

  // Klick irgendwo anders schließt den Tooltip
  document.addEventListener("click", () => {
    hideTooltip();
  });

  // Escape schließt Tooltip
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      hideTooltip();
    }
  });

  /* ==== Filter-Logik für Gruppen ==== */
  let currentFilter = "all";

  function applyFilter(group) {
    // INFO-HOTSPOTS filtern
    infoHotspots.forEach((h) => {
      const groups = (h.dataset.group || "").split(",").map((g) => g.trim());

      h.style.display =
        group === "all" || groups.includes(group) ? "block" : "none";
    });

    // NAV-HOTSPOTS filtern  ← NEUER BLOCK
    navHotspots.forEach((h) => {
      const groups = (h.dataset.group || "").split(",").map((g) => g.trim());

      h.style.display =
        group === "all" || groups.includes(group)
          ? h.classList.contains("nav-hotspot")
            ? "flex"
            : "block"
          : "none";
    });

    hideTooltip();
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation(); // verhindert, dass der globale Klick-Listener auslöst
      const filter = btn.dataset.filter;

      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      applyFilter(filter);
    });
  });

  // Initial: alle anzeigen
  applyFilter("all");
});
