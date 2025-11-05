// =======================
// POPULATE DROPDOWN MENU
// =======================
function populatePagesDropdown(totalPages) { // Function to create dropdown page links.
  const dropdown = document.querySelector(".dropdown-content"); // Find the dropdown container.
  if (!dropdown) return; // If no dropdown, stop.

  dropdown.innerHTML = ""; // Clear previous items.

  // Create Home link
  const homeLi = document.createElement("li"); // Create <li> element.
  const homeA = document.createElement("a"); // Create <a> element inside <li>.
  homeA.textContent = "Home"; // Set visible text.
  homeA.href = "index.html#home"; // Set destination URL.
  homeLi.appendChild(homeA); // Nest <a> inside <li>.
  dropdown.appendChild(homeLi); // Add <li> to dropdown.

  // Create page links
  for (let i = 1; i <= totalPages; i++) { // Loop from 1 to totalPages.
    const li = document.createElement("li"); // Create <li> for each page.
    const a = document.createElement("a"); // Create <a> for link.
    a.textContent = `Page ${i}`; // Set visible text with page number.
    a.href = `index.html#page${i}`; // Set link destination.
    li.appendChild(a); // Nest <a> inside <li>.
    dropdown.appendChild(li); // Add <li> to dropdown.
  }
}

// =======================
// FETCH PAGE COUNT
// =======================
async function fetchPageCount(apiUrl) { // Async function to get number of images and pages from API.
  try {
    const response = await fetch(apiUrl); // Fetch data from API.
    const data = await response.json(); // Convert response to JSON.
    const totalImages = data.collection.items.length; // Count number of images.
    const totalPages = Math.ceil(totalImages / pageSize); // Calculate total pages needed.
    populatePagesDropdown(totalPages); // Call function to create dropdown links.
    return totalPages; // Return total pages.
  } catch (err) {
    console.error("Error fetching page count:", err); // Log error if fetch fails.
  }
}
// =======================
// RENDER PAGE
// =======================
function renderPage(pageNumber) { // Function to display images for a given page number.
  if (!slider || !gallery) return; // Skip if slider/gallery missing.

  slider.innerHTML = ""; // Clear slider content.
  gallery.innerHTML = ""; // Clear gallery content.
  currentPage = pageNumber; // Set current page.

  const start = (currentPage - 1) * pageSize; // Calculate start index.
  const end = currentPage * pageSize; // Calculate end index.
  const images = allImages.slice(start, end); // Slice array for current page.

  slider.style.setProperty("--quantity", images.length); // Pass number of items to CSS.

  images.forEach((url, index) => { // Loop over images.
    const item = document.createElement("div"); // Create slider item.
    item.classList.add("item"); // Add class for CSS.
    item.style.setProperty("--position", index + 1); // Set position for 3D rotation.

    const img = document.createElement("img"); // Create image element.
    img.src = url; // Set image source.
    img.addEventListener("click", () => showFullscreen(url)); // Open fullscreen on click.

    item.appendChild(img); // Add image to slider item.
    slider.appendChild(item); // Add item to slider.

    const gImg = document.createElement("img"); // Create image for gallery grid.
    gImg.src = url; // Set source.
    gImg.addEventListener("click", () => showFullscreen(url)); // Open fullscreen on click.
    gallery.appendChild(gImg); // Add to gallery.
  });
}
// =======================
// HASH HANDLER
// =======================
function applyHashPage() { // Function to render page based on URL hash.
  const hash = window.location.hash; // Get current hash from URL.

  if (hash === "#home" || hash === "") { // If home or empty hash.
    renderPage(1); // Show first page.
    return;
  }

  if (hash.startsWith("#page")) { // If hash is like #page2
    const num = parseInt(hash.replace("#page", "")); // Extract page number.
    if (!isNaN(num)) renderPage(num); // Render if valid number.
  }
}

window.addEventListener("hashchange", applyHashPage); // Re-render page if hash changes.
