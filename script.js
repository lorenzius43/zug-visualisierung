document.addEventListener("DOMContentLoaded", () => {
  const screens = document.querySelectorAll(".screen");
  const tooltip = document.getElementById("tooltip");
  const tooltipImg = document.getElementById("tooltip-img");
  const tooltipText = document.getElementById("tooltip-text");
  const tooltipLink = document.getElementById("tooltip-link");
  const infoHotspots = document.querySelectorAll(".info-hotspot");
  const navHotspots = document.querySelectorAll(".nav-hotspot");

  const filterButtons = document.querySelectorAll(".filter-btn");

  function hideTooltip() {
    tooltip.classList.remove("visible");
  }

  const validScreenIds = new Set(Array.from(screens).map((s) => s.id));

  // updateHash: false beim initialen Laden (sonst würde jeder Deep-Link
  // sofort einen zusätzlichen, identischen History-Eintrag erzeugen)
  function showScreen(id, updateHash = true) {
    if (!validScreenIds.has(id)) return;
    screens.forEach((screen) => {
      screen.classList.toggle("active", screen.id === id);
    });
    hideTooltip();
    if (updateHash && location.hash.slice(1) !== id) {
      history.pushState({ screen: id }, "", "#" + id);
    }
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

  // Deep-Link beim Laden: #screen-module3 in der URL öffnet direkt den Screen
  const initialHash = location.hash.slice(1);
  if (validScreenIds.has(initialHash)) {
    showScreen(initialHash, false);
  }

  // Vor/Zurück-Buttons des Browsers respektieren
  window.addEventListener("popstate", () => {
    const hash = location.hash.slice(1);
    showScreen(validScreenIds.has(hash) ? hash : "screen-intro", false);
  });

  // Info-Hotspots auf Detail-Seiten
  const TOOLTIP_MARGIN = 12;

  function positionTooltip(hotspot) {
    const screen = hotspot.closest(".screen");
    const screenRect = screen.getBoundingClientRect();
    const hotspotRect = hotspot.getBoundingClientRect();

    // Zuerst sichtbar machen, damit die tatsächliche Größe gemessen werden kann
    tooltip.classList.add("visible");
    const tooltipRect = tooltip.getBoundingClientRect();

    const hotspotCenterX = hotspotRect.left - screenRect.left + hotspotRect.width / 2;
    const hotspotTop = hotspotRect.top - screenRect.top;
    const hotspotBottom = hotspotRect.bottom - screenRect.top;

    // Horizontal: am Hotspot zentrieren, aber innerhalb des Bildschirms halten
    let left = hotspotCenterX - tooltipRect.width / 2;
    const maxLeft = screenRect.width - tooltipRect.width - TOOLTIP_MARGIN;
    left = Math.max(TOOLTIP_MARGIN, Math.min(left, maxLeft));

    // Vertikal: bevorzugt oberhalb des Hotspots, sonst darunter, sonst geklemmt
    let top = hotspotTop - tooltipRect.height - TOOLTIP_MARGIN;
    if (top < TOOLTIP_MARGIN) {
      top = hotspotBottom + TOOLTIP_MARGIN;
    }
    const maxTop = screenRect.height - tooltipRect.height - TOOLTIP_MARGIN;
    top = Math.max(TOOLTIP_MARGIN, Math.min(top, maxTop));

    tooltip.style.left = left + "px";
    tooltip.style.top = top + "px";
  }

  let activeHotspot = null;

  infoHotspots.forEach((hotspot) => {
    hotspot.addEventListener("click", (e) => {
      e.stopPropagation();

      tooltipText.textContent = hotspot.dataset.text || "Keine Beschreibung hinterlegt.";

      if (hotspot.dataset.img) {
        tooltipImg.src = hotspot.dataset.img;
        tooltipImg.style.display = "block";
      } else {
        tooltipImg.removeAttribute("src");
        tooltipImg.style.display = "none";
      }

      if (hotspot.dataset.detail) {
        tooltipLink.href = hotspot.dataset.detail;
        tooltipLink.style.display = "inline-block";
      } else {
        tooltipLink.removeAttribute("href");
        tooltipLink.style.display = "none";
      }

      activeHotspot = hotspot;
      positionTooltip(hotspot);
    });
  });

  // Bei Größenänderung (z. B. Fenster verkleinert) sichtbaren Tooltip neu positionieren,
  // damit er nicht außerhalb des Bildschirms landet
  window.addEventListener("resize", () => {
    if (activeHotspot && tooltip.classList.contains("visible")) {
      positionTooltip(activeHotspot);
    }
  });

  // Klick auf den Tooltip selbst soll ihn nicht schließen (z. B. um Text zu markieren)
  tooltip.addEventListener("click", (e) => {
    e.stopPropagation();
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
