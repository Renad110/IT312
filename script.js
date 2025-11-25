// script.js


/* ===== 2. Website themes CSS/JavaScript ===== */

/* ====================
   Light Theme Toggle
   ==================== */

const themeBtn = document.getElementById("theme-toggle");

if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");

    if (document.body.classList.contains("light-theme")) {
      themeBtn.textContent = "☀️";
      localStorage.setItem("theme", "light");
    } else {
      themeBtn.textContent = "🌙";
      localStorage.setItem("theme", "dark");
    }
  });

  // Load saved theme
  if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light-theme");
    themeBtn.textContent = "☀️";
  }
}


/* ============================
   Home Page – TESTIMONIALS SLIDER
   ============================ */

  document.addEventListener("DOMContentLoaded", function () {

  const testiList = document.getElementById("testi-list");
  const nextBtn = document.getElementById("testi-next");
  const prevBtn = document.getElementById("testi-prev");
  const dots = document.querySelectorAll(".dot");

  if (!testiList) return;

  const cardWidth = 290; 

  nextBtn?.addEventListener("click", () => {
    testiList.scrollBy({ left: cardWidth, behavior: "smooth" });
    updateDots();
  });

  prevBtn?.addEventListener("click", () => {
    testiList.scrollBy({ left: -cardWidth, behavior: "smooth" });
    updateDots();
  });

  function updateDots() {
    const scrollLeft = testiList.scrollLeft;
    const maxScroll = testiList.scrollWidth - testiList.clientWidth;
    const index = Math.round((scrollLeft / maxScroll) * (dots.length - 1));
    dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
  }

  // DRAG TO SCROLL
  let isDown = false;
  let startX;
  let scrollLeftStart;

  testiList.addEventListener("mousedown", (e) => {
    isDown = true;
    startX = e.pageX - testiList.offsetLeft;
    scrollLeftStart = testiList.scrollLeft;
  });

  testiList.addEventListener("mouseleave", () => (isDown = false));
  testiList.addEventListener("mouseup", () => (isDown = false));

  testiList.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - testiList.offsetLeft;
    const walk = (x - startX) * 1.5;
    testiList.scrollLeft = scrollLeftStart - walk;
    updateDots();
  });
});
/* ============================*/

/* =============================
   Back to Top Button
   ============================= */

const backToTopBtn = document.getElementById("backToTop");

window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    backToTopBtn.style.display = "block";
  } else {
    backToTopBtn.style.display = "none";
  }
});

backToTopBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});

/* =============================
   Real-Time Clock in Footer
   ============================= */

function updateClock() {
  const clock = document.getElementById("footer-clock");
  const now = new Date();

  const timeString = now.toLocaleString("en-SA", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  clock.textContent = timeString;
}

setInterval(updateClock, 1000);
updateClock();
/* ============================*/


/* ============================
   Renad – Services & Bookmarks Module
   ============================ */

(function () {
  // Run this module only on Services and Bookmark pages
  const path = window.location.pathname;
  const isServicesOrBookmarkPage =
    path.includes("PageServices.html") || path.includes("Bookmmark.html");

  document.addEventListener("DOMContentLoaded", function () {
    if (!isServicesOrBookmarkPage) return;

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
      const priceText = priceEl
        ? priceEl.textContent.replace(/[^\d.]/g, "")
        : "0";
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
    let savedServices = JSON.parse(
      localStorage.getItem("savedServices") || "[]"
    );

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
     Bookmark Page – Show Only Saved Services
     ============================ */

  function initBookmarkPage() {
    const servicesContainer = document.querySelector(".services");
    const noBookmarksMsg = document.getElementById("no-bookmarks");

    // If this is not the bookmark page, exit
    if (!servicesContainer || !noBookmarksMsg) return;

    const serviceCards = servicesContainer.querySelectorAll(".service-card");

    // Read saved services from localStorage
    const savedServices = JSON.parse(
      localStorage.getItem("savedServices") || "[]"
    );

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
        card.style.display = ""; // show this card
      } else {
        card.style.display = "none"; // hide this card
      }
    });
  }
})(); // End of Renad's module


//Provider Page Script
if (window.location.pathname.includes("sp-dp.html")) {

    window.onload = function () {
        loadProviderServices();
    };

    function loadProviderServices() {
        var services = JSON.parse(localStorage.getItem("services"));
        var container = document.getElementById("provider-services");

        if (!services || services.length === 0) {
            container.innerHTML = "<p style='text-align:center; color:#ccc; margin-top:40px;'>No services added yet.</p>";
            return;
        }

        container.innerHTML = "";

        for (var i = 0; i < services.length; i++) {
            var s = services[i];

            var card =
                '<div class="service-card">' +
                    '<table class="service-table">' +
                        '<tbody>' +
                            '<tr>' +
                                '<td class="col-name">' +
                                    '<strong>' + s.name + '</strong><br><br>' +
                                    '<img src="' + s.image + '" alt="' + s.name + '">' +
                                '</td>' +
                                '<td class="col-price"><strong>' + s.price + 'SR</strong></td>' +
                                '<td class="col-desc">' + s.description + '</td>' +
                            '</tr>' +
                        '</tbody>' +
                    '</table>' +
                '</div>';

            container.innerHTML += card;
        }
    }
}

// End of Provider Page Script

//Add Service Page Form Script

// Run when the page finishes loading
if (window.location.pathname.includes("AddServices.html")) {

    window.onload = function () {
        var form = document.querySelector(".service-form");
        form.onsubmit = handleAddService;
    };

    function handleAddService(event) {
        event.preventDefault();

        // Read input values
        var name = document.getElementById("serviceName").value.trim();
        var price = document.getElementById("servicePrice").value.trim();
        var desc = document.getElementById("serviceDescription").value.trim();
        var photoInput = document.getElementById("servicePhoto");

        // Validation

        if (name === "" || price === "" || desc === "" || photoInput.files.length === 0) {
            alert("Please fill all fields.");
            return;
        }

        if (!isNaN(name.charAt(0))) {
            alert("Service name cannot start with a number.");
            return;
        }

        if (isNaN(price)) {
            alert("Price must be a number.");
            return;
        }

        var photo = photoInput.files[0];
        var reader = new FileReader();

        reader.onload = function(e) {
            var base64Image = e.target.result;

            // Retrieve old services
            var services = JSON.parse(localStorage.getItem("services"));
            if (!services) {
                services = [];
            }

            // Build service object
            var newService = {
                name: name,
                price: price,
                description: desc,
                image: base64Image
            };

            // Save service
            services.push(newService);
            localStorage.setItem("services", JSON.stringify(services));

            alert(name + " has been added successfully!");

            // Reset form
            document.querySelector(".service-form").reset();
        };

        reader.readAsDataURL(photo); // Convert to Base64
    }
}

// End of Add Services Form Page Script

//Manage Staff Page Script

if (window.location.pathname.includes("ManageStaff.html")) {

    window.onload = function () {
        loadMembers();

        document.querySelector(".delete-form").onsubmit = handleDelete;
        document.querySelector(".add-form").onsubmit = handleAdd;
    };


    // Load members into the page
    function loadMembers() {
        var members = JSON.parse(localStorage.getItem("members"));

        // Default members if empty
        if (members === null) {
            members = [
                { name: "Ahmed Salem", image: "images/Staff1.PNG" },
                { name: "Fahad Nasser", image: "images/Staff2.PNG" },
                { name: "Sarah Omar", image: "images/Staff3.PNG" }
            ];
            localStorage.setItem("members", JSON.stringify(members));
        }

        var container = document.querySelector(".staff-container");

        // Clear only the cards, NOT the delete button
        var buttonHTML = container.querySelector(".delete-btn-Man").outerHTML;
        container.innerHTML = "";

        // Rebuild the cards
        for (var i = 0; i < members.length; i++) {
            container.innerHTML +=
                '<div class="staff-card-Man">' +
                '<input type="checkbox" class="staff-checkbox" data-index="' + i + '">' +
                '<img src="' + members[i].image + '" class="staff-photo">' +
                '<p class="staff-name">' + members[i].name + '</p>' +
                '</div>';
        }

        // Add the button back
        container.innerHTML += buttonHTML;
    }



    // Delete selected staff
    function handleDelete(event) {
        event.preventDefault();

        var checkboxes = document.querySelectorAll(".staff-checkbox");
        var members = JSON.parse(localStorage.getItem("members"));
        var selected = [];

        for (var i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].checked) {
                selected.push(parseInt(checkboxes[i].getAttribute("data-index")));
            }
        }

        if (selected.length === 0) {
            alert("Please select at least one member.");
            return;
        }

        if (!confirm("Are you sure you want to delete selected members?")) {
            return;
        }

        var newList = [];

        for (var j = 0; j < members.length; j++) {
            if (!selected.includes(j)) {
                newList.push(members[j]);
            }
        }

        localStorage.setItem("members", JSON.stringify(newList));
        loadMembers();
    }



  // Add a new staff member
function handleAdd(event) {
    event.preventDefault();

    var name = document.getElementById("staffName").value.trim();
    var photoFile = document.getElementById("staffPhoto").files[0];
    var dob = document.getElementById("staffDOB").value;
    var email = document.getElementById("staffEmail").value.trim();
    var expert = document.getElementById("staffExpert").value.trim();
    var skills = document.getElementById("staffSkills").value.trim();
    var edu = document.getElementById("staffEdu").value.trim();

    // Validation check
    if (!name || !dob || !email || !expert || !skills || !edu || !photoFile) {
        alert("Please fill all fields.");
        return;
    }

    // Name must not start with number
    if (!isNaN(name.charAt(0))) {
        alert("Name cannot start with a number.");
        return;
    }

    // Expert must be text (not start with number)
    if (!isNaN(expert.charAt(0))) {
        alert("Expertise cannot start with a number.");
        return;
    }

    // Skills must be text (not start with number)
    if (!isNaN(skills.charAt(0))) {
        alert("Skills cannot start with a number.");
        return;
    }

    // Education must be text (not start with number)
    if (!isNaN(edu.charAt(0))) {
        alert("Education cannot start with a number.");
        return;
    }

    // Email check
    if (!email.includes("@") || !email.includes(".")) {
        alert("Please enter a valid email address.");
        return;
    }

    var photoURL = URL.createObjectURL(photoFile);

    var members = JSON.parse(localStorage.getItem("members"));
    if (members === null) members = [];

    var newMember = {
        name: name,
        image: photoURL,
        dob: dob,
        email: email,
        expert: expert,
        skills: skills,
        education: edu
    };

    members.push(newMember);
    localStorage.setItem("members", JSON.stringify(members));

    alert(name + " has been added!");

    document.querySelector(".add-form").reset();
    loadMembers();
}

}
// End of Manage Staff Page Script

//start of join form script 
if (window.location.pathname.includes("JoinOurTeam.html")) {
document.addEventListener('DOMContentLoaded', () => {
    
    // Get references to the form and submit button
    const form = document.querySelector('.join-form'); 
    const submitButton = form.querySelector('button[type="submit"]'); 

    // Get references to input fields
    const fullNameInput = document.getElementById('joinName');
    const dobInput = document.getElementById('joinDob');
    const photoInput = document.getElementById('joinPhoto');

    // Attach an event listener to the form's submit event
    form.addEventListener('submit', (event) => {
        
        // Prevent default form submission and page refresh
        event.preventDefault(); 
        
        if (validateForm()) {
            // Show success alert and sender's name if validation passes
            const senderName = fullNameInput.value.trim();
            alert(`Submission Successful!\n\nThank you, ${senderName}, for your interest in joining our team. We will be in touch shortly.`);
        }
    });

   
    function validateForm() {
        let isValid = true;

        // Check for basic HTML 'required' fields
        if (!form.checkValidity()) {
            form.reportValidity(); 
            return false;
        }
        
        // Requirement: Name cannot start with numbers
        const nameValue = fullNameInput.value.trim();
        if (/^\d/.test(nameValue)) {
            alert("Error: Full Name cannot start with a number.");
            fullNameInput.focus();
            isValid = false;
            return isValid;
        }

        // Requirement: DOB should not be after 2008
        const dobValue = dobInput.value; 
        if (dobValue) {
            const dobDate = new Date(dobValue);
            // Use Jan 1st, 2009 as the cutoff date
            const cutoffDate = new Date('2009-01-01'); 

            if (dobDate >= cutoffDate) {
                alert("Error: Date of Birth must be on or before 2008.");
                dobInput.focus();
                isValid = false;
                return isValid;
            }
        }
        
        // Requirement: Photo field accepts only images
        const photoFile = photoInput.files[0];
        if (photoFile) {
            if (!photoFile.type.startsWith('image/')) {
                alert("Error: Photo field must contain an image file (e.g., JPEG, PNG).");
                photoInput.value = ''; 
                isValid = false;
                return isValid;
            }
        }

        // Return true if all checks pass
        return isValid;
    }
});
}
//end join form script 