// script.js

document.addEventListener("DOMContentLoaded", function () {
  // Sorting & random order on Services page
  initServicesPage();

  // Extra functionality: save services as bookmarks using localStorage
  initBookmarks();

  // Bookmark page: show only saved services
  initBookmarkPage();
});

/* ============================
   Services Page – Sorting Logic
   ============================ */

function initServicesPage() {
  const servicesContainer = document.querySelector(".services");
  const sortSelect = document.getElementById("sort");

  // If this page does not have services or sort dropdown, do nothing
  if (!servicesContainer || !sortSelect) return;

  // Collect all service cards and extract name & price
  const originalCards = Array.from(
    servicesContainer.querySelectorAll(".service-card")
  ).map((card) => {
    const nameEl = card.querySelector(".service-header h3");
    const priceEl = card.querySelector(".price");

    const name = nameEl ? nameEl.textContent.trim() : "";
    // Extract numeric value from price text like "300SR"
    const priceText = priceEl ? priceEl.textContent.replace(/[^\d.]/g, "") : "0";
    const price = parseFloat(priceText) || 0;

    return { element: card, name, price };
  });

  // When the page first loads: show services in a random order
  displayRandomServices(servicesContainer, originalCards);

  // When the user changes sort option
  sortSelect.addEventListener("change", function () {
    const value = sortSelect.value;
    let sortedCards = [...originalCards]; // copy original array

    switch (value) {
      case "price-asc":
        sortedCards.sort((a, b) => a.price - b.price);
        break;

      case "price-desc":
        sortedCards.sort((a, b) => b.price - a.price);
        break;

      case "name-asc":
        sortedCards.sort((a, b) =>
          a.name.toLowerCase().localeCompare(b.name.toLowerCase())
        );
        break;

      case "name-desc":
        sortedCards.sort((a, b) =>
          b.name.toLowerCase().localeCompare(a.name.toLowerCase())
        );
        break;

      case "random":
      default:
        // Show random order again
        displayRandomServices(servicesContainer, originalCards);
        return;
    }

    // Render services in the new order
    renderServices(servicesContainer, sortedCards);
  });

  // Note: we do NOT call initServiceBookmarks here,
  // because initBookmarks handles icon behavior + localStorage.
}

/* ===== Helper Functions for Services Sorting ===== */

// Show services in random order
function displayRandomServices(container, cardsData) {
  const shuffled = shuffleArray([...cardsData]); // copy then shuffle
  renderServices(container, shuffled);
}

// Render service cards based on given order
function renderServices(container, cardsData) {
  // Clear container
  container.innerHTML = "";

  // Append cards in the new order
  cardsData.forEach((item) => {
    container.appendChild(item.element);
  });
}

// Fisher–Yates Shuffle algorithm
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/* ============================
   Extra Functionality: Bookmarks
   - Save / remove bookmarked services
   - Uses localStorage with key "savedServices"
   ============================ */

function initBookmarks() {
  const serviceCards = document.querySelectorAll(".service-card");

  // If the page has no service cards, nothing to do
  if (serviceCards.length === 0) return;

  // Read previously saved services from localStorage
  let savedServices = JSON.parse(localStorage.getItem("savedServices") || "[]");

  // Update bookmark icon style based on saved state
  function updateIcon(icon, saved) {
    if (!icon) return;

    if (saved) {
      icon.classList.add("saved", "fa-solid");
      icon.classList.remove("fa-regular");
    } else {
      icon.classList.remove("saved", "fa-solid");
      icon.classList.add("fa-regular");
    }
  }

  // Attach bookmark behavior to each service card
  serviceCards.forEach((card) => {
    const titleEl = card.querySelector(".service-header h3");
    const icon = card.querySelector(".service-header i");

    if (!titleEl || !icon) return;

    const name = titleEl.textContent.trim();

    // If this service is already saved, reflect it in the icon
    if (savedServices.includes(name)) {
      updateIcon(icon, true);
    }

    // When user clicks the bookmark icon
    icon.addEventListener("click", function () {
      const isSaved = savedServices.includes(name);

      if (isSaved) {
        // Remove from saved list
        savedServices = savedServices.filter((n) => n !== name);
        updateIcon(icon, false);
      } else {
        // Add to saved list
        savedServices.push(name);
        updateIcon(icon, true);
      }

      // Save updated list to localStorage
      localStorage.setItem("savedServices", JSON.stringify(savedServices));
    });
  });

  // Note: We removed filtering behavior from the top "Bookmarks" button
  // because in this design, the bookmarks are shown on a separate page (Bookmmark.html).
}

/* ============================
   (Optional) Old simple bookmark icons (NOT used now)
   Left here as reference if needed.
   ============================ */

function initServiceBookmarks(servicesContainer) {
  const icons = servicesContainer.querySelectorAll(".service-header i");

  icons.forEach((icon) => {
    icon.addEventListener("click", function () {
      icon.classList.toggle("saved");

      if (icon.classList.contains("saved")) {
        icon.classList.remove("fa-regular");
        icon.classList.add("fa-solid");
      } else {
        icon.classList.remove("fa-solid");
        icon.classList.add("fa-regular");
      }
    });
  });
}

/* ============================
   Bookmark Page – Show Only Saved Services
   ============================ */

function initBookmarkPage() {
  const servicesContainer = document.querySelector(".services");
  const noBookmarksMsg = document.getElementById("no-bookmarks");

  // If this is not the bookmark page, exit
  if (!servicesContainer || !noBookmarksMsg) return;

  const serviceCards = servicesContainer.querySelectorAll(".service-card");

  // Read saved services from localStorage
  const savedServices = JSON.parse(localStorage.getItem("savedServices") || "[]");

  // If nothing is saved: show message and hide all cards
  if (savedServices.length === 0) {
    noBookmarksMsg.style.display = "block";
    serviceCards.forEach((card) => {
      card.style.display = "none";
    });
    return;
  }

  // There are saved services: hide "no bookmarks" message
  noBookmarksMsg.style.display = "none";

  // Show only cards whose names are in savedServices
  serviceCards.forEach((card) => {
    const titleEl = card.querySelector(".service-header h3");
    const name = titleEl ? titleEl.textContent.trim() : "";

    if (savedServices.includes(name)) {
      card.style.display = "";   // show this card
    } else {
      card.style.display = "none"; // hide this card
    }
  });
}
