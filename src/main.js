/**
 * CORE APPLICATION MODULE
 * =======================
 *
 * Central coordinator for the image gallery application with AI metadata generation.
 * Handles state management, DOM manipulation, and module coordination.
 *
 * Features:
 * - Centralized state management for all modules
 * - Image container creation with interactive overlays
 * - Gallery mode switching (grid/carousel)
 * - Social media-style elements with SVG icons
 * - Cross-module communication and data sharing
 */

// Module imports
import { loadPages, loadGallery, createPagesNavigation } from "./pagination.js";
import { showLightbox } from "./lightbox.js";
import { likeButtonOnClick } from "./likes-function.js";

/* ================================================================================================= */
/* #region VARIABLES DECLARATION                                                                     */
/* ================================================================================================= */

/**
 * Centralized application state
 * Shared across all modules for consistent data management
 */
export const state = {
  imagesData: [], // Page-structured image data from API
  totalAmountOfPages: 0, // Total pages available for pagination
  galleryType: "grid", // Current view mode: "grid" or "carousel"
  currentPage: 1, // Active page number
  loadedPages: [], // Cached pages to prevent duplicate API calls
  activeCategory: "All", // Current category filter
  imagesByCategory: [],
};

//set up the local storage for the liked images if there is not one
if (!localStorage.getItem("images_liked")) {
  localStorage.setItem("images_liked", JSON.stringify([]));
}

/* #endregion VARIABLES DECLARATION */

/* ================================================================================================= */
/* #region HELPER FUNCTIONS                                                                          */
/* ================================================================================================= */

/**
 * Find image data by unique ID across all loaded pages
 */
export const findImageDataByID = (ID) => {
  let result = null;
  state.imagesData.forEach((page) => {
    page.data.forEach((imageData) => {
      if (imageData.id === ID) result = imageData;
    });
  });
  return result;
};

/**
 * Convert page numbers between gallery modes
 * Grid mode shows 2 API pages per view, carousel shows 1 page per view
 */
const transmuteCurrentPage = (n) => {
  switch (state.galleryType) {
    case "grid":
      return 2 * n - 1; // Convert grid page to carousel: grid page 1→carousel page 1, grid page 2→carousel page 3
    case "carousel":
      return Math.ceil(n / 2); // Convert carousel page to grid: carousel pages 1-2→grid page 1, pages 3-4→grid page 2
    default:
      return n; // Fallback for unknown gallery types
  }
};

/* #end region HELPER FUNCTIONS */

/* ================================================================================================= */
/* #region DOM MANIPULATION                                                                          */
/* ================================================================================================= */

/**
 * Creates image containers with interactive overlays and social elements
 * Adapts to current gallery mode and includes AI metadata display
 */
export const createImage = (imageData) => {
  let gallery;
  switch (state.galleryType) {
    case "grid":
      gallery = document.querySelector(".gallery-grid");
      break;
    case "carousel":
      gallery = document.querySelector("#gallery-carousel");
      break;
    default:
  }

  // Create main container for image and text overlay
  const imageContainer = document.createElement("div");
  imageContainer.classList.add("image-container");
  imageContainer.id = imageData.id;
  gallery.appendChild(imageContainer);

  // Create and configure the image element
  const appImg = document.createElement("img"); // Create new image element
  appImg.classList.add("app-img"); // Add CSS class for styling
  appImg.src = imageData.image_url; // Set the image source URL
  imageContainer.appendChild(appImg); // Append the image to the app container

  appImg.addEventListener("click", () => showLightbox(imageData)); // send all imageData as an argument to showLightbox

  const hoverContainer = document.createElement("div");
  hoverContainer.classList.add("hover-container");
  imageContainer.appendChild(hoverContainer);

  // Create text overlay container (hidden by default, shown on hover)
  const textContainer = document.createElement("div");
  textContainer.classList.add("text-container");
  hoverContainer.appendChild(textContainer);

  // Create category display element
  const imageCategory = document.createElement("p");
  imageCategory.classList.add("image-category");
  imageCategory.textContent = imageData.category;
  textContainer.appendChild(imageCategory);

  // Create author display element
  const imageAuthor = document.createElement("p");
  imageAuthor.classList.add("image-author");
  imageAuthor.textContent = imageData.authorName;
  textContainer.appendChild(imageAuthor);

  const iconContainer = document.createElement("div");
  iconContainer.classList.add("icon-container");
  hoverContainer.appendChild(iconContainer);

  // --Creating like button-- //
  const heartGroup = document.createElement("button");
  heartGroup.classList.add("icon-group");
  heartGroup.classList.add("button-like");
  const likedImages = JSON.parse(localStorage.getItem("images_liked"));
  if (likedImages.includes(imageData.id)) {
    //if the user already liked it before, adds "active" class
    heartGroup.classList.add("active");
  }

  heartGroup.addEventListener("click", () => {
    likeButtonOnClick(heartGroup); //giving the button as an argument
  });

  // --- Adding Icons --- //
  /* Used DOMParser because direct 'innerHTML = svgContent`caused syntax error*/
  const parser = new DOMParser(); // Creates a new DOMParser
  //Heart icon and like number group
  const svgIconHeart = `<?xml version="1.0" encoding="utf-8"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
    <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M12 6.00019C10.2006 3.90317 7.19377 3.2551 4.93923 5.17534C2.68468 7.09558 2.36727 10.3061 4.13778 12.5772C5.60984 14.4654 10.0648 18.4479 11.5249 19.7369C11.6882 19.8811 11.7699 19.9532 11.8652 19.9815C11.9483 20.0062 12.0393 20.0062 12.1225 19.9815C12.2178 19.9532 12.2994 19.8811 12.4628 19.7369C13.9229 18.4479 18.3778 14.4654 19.8499 12.5772C21.6204 10.3061 21.3417 7.07538 19.0484 5.17534C16.7551 3.2753 13.7994 3.90317 12 6.00019Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

  const svgDocHeart = parser.parseFromString(svgIconHeart, "image/svg+xml"); //Parse the SVG string into an SVG Document object
  const heartIcon = svgDocHeart.documentElement; // Get the root SVG element from the parsed document
  heartIcon.classList.add("heart-icon");
  heartGroup.appendChild(heartIcon); // Append the actual SVG element to  'hoverContainer'

  const likeNumber = document.createElement("p");
  likeNumber.classList.add("like-number"); // Add CSS class for styling in stylesheet (for Emma)
  likeNumber.textContent = imageData.likes_count;
  heartGroup.appendChild(likeNumber);

  //Comment icon and comment number group

  const commentGroup = document.createElement("div");
  commentGroup.classList.add("icon-group");

  const svgIconComment = `<?xml version="1.0" encoding="utf-8"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
    <svg fill="currentColor" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M144 208c-17.7 0-32 14.3-32 32s14.3 32 32 32 32-14.3 32-32-14.3-32-32-32zm112 0c-17.7 0-32 14.3-32 32s14.3 32 32 32 32-14.3 32-32-14.3-32-32-32zm112 0c-17.7 0-32 14.3-32 32s14.3 32 32 32 32-14.3 32-32-14.3-32-32-32zM256 32C114.6 32 0 125.1 0 240c0 47.6 19.9 91.2 52.9 126.3C38 405.7 7 439.1 6.5 439.5c-6.6 7-8.4 17.2-4.6 26S14.4 480 24 480c61.5 0 110-25.7 139.1-46.3C192 442.8 223.2 448 256 448c141.4 0 256-93.1 256-208S397.4 32 256 32zm0 368c-26.7 0-53.1-4.1-78.4-12.1l-22.7-7.2-19.5 13.8c-14.3 10.1-33.9 21.4-57.5 29 7.3-12.1 14.4-25.7 19.9-40.2l10.6-28.1-20.6-21.8C69.7 314.1 48 282.2 48 240c0-88.2 93.3-160 208-160s208 71.8 208 160-93.3 160-208 160z"/></svg>`;

  const svgDocComment = parser.parseFromString(svgIconComment, "image/svg+xml");
  const commentIcon = svgDocComment.documentElement;
  commentIcon.classList.add("comment-icon");
  commentGroup.appendChild(commentIcon);

  const commentNumber = document.createElement("p");
  commentNumber.classList.add("comment-number");
  commentNumber.textContent = imageData.comments.length;
  commentGroup.appendChild(commentNumber);

  iconContainer.appendChild(heartGroup);
  iconContainer.appendChild(commentGroup);
};

/**
 * Updates DOM with AI-generated metadata
 * Syncs category and author text content with state data
 */
export const updateImagesDOM = () => {
  const imageContainers = Array.from(
    document.querySelectorAll(".image-container")
  );
  const imageCategoryContainers = Array.from(
    document.querySelectorAll(".image-category")
  );
  const imageAuthorContainers = Array.from(
    document.querySelectorAll(".image-author")
  );

  // Update each container with corresponding metadata
  for (let i = 0; i < imageContainers.length; i++) {
    const imageData = findImageDataByID(imageContainers[i].id);
    if (imageData) {
      imageCategoryContainers[i].textContent = imageData.category;
      imageAuthorContainers[i].textContent = imageData.authorName;
    }
  }
};

/* #endregion DOM MANIPULATION */

/* ================================================================================================= */
/* #region DOM ELEMENT CREATION & REFERENCES                                                        */
/* ================================================================================================= */

/**
 * DOM ELEMENT SETUP & GALLERY REFERENCES
 * =======================================
 *
 * This section manages DOM element references for the dual-gallery system:
 * - Gallery containers for both grid and carousel modes
 * - View toggle functionality for switching between gallery types
 * - State management for gallery type transitions
 * - UI element references for pagination and navigation controls
 */

/**
 * Main container for the grid-based image gallery
 * @type {HTMLElement}
 */
const galleryGrid = document.querySelector(".gallery-grid");

/* ================================================================================================= */
/* #region EVENT LISTENERS                                                                           */
/* ================================================================================================= */

/**
 * EVENT LISTENER SETUP & GALLERY SWITCHING
 * =========================================
 *
 * This section configures user interaction event handlers for gallery mode switching.
 * Handles the complex logic for transitioning between grid and carousel views while
 * maintaining proper pagination state and loading appropriate content.
 */

const viewToggleButton = document.getElementById("view-toggle");

viewToggleButton.addEventListener("click", async () => {
  const galleryGrid = document.querySelector(".gallery-grid");
  const galleryCarousel = document.querySelector("#gallery-carousel"); // Select the carousel gallery container

  switch (state.galleryType) {
    case "grid":
      state.currentPage = transmuteCurrentPage(state.currentPage); // Adjust page number for carousel (using helper function)
      state.galleryType = "carousel"; // Switch global gallery mode to carousel
      viewToggleButton.textContent = "Switch to grid"; // Update toggle button text
      galleryGrid.classList.add("hidden"); // Hide the grid container
      galleryCarousel.classList.remove("hidden"); // Show the carousel container

      document.body.classList.toggle(
        "carousel-active",
        state.galleryType === "carousel"
      ); // Toggle body class for CSS styling

      await loadPages(state.currentPage); // Load the current page images from API for carousel
      loadGallery(); // Render loaded images in the carousel

      createPagesNavigation();
      break;
    case "carousel":
      state.currentPage = transmuteCurrentPage(state.currentPage);
      state.galleryType = "grid";
      viewToggleButton.textContent = "Switch to carousel";
      galleryCarousel.classList.add("hidden");
      galleryGrid.classList.remove("hidden");

      document.body.classList.toggle(
        "carousel-active",
        state.galleryType === "carousel"
      );

      await loadPages(state.currentPage);
      loadGallery();

      createPagesNavigation();
      break;
    default:
  }
});

const aboutDialog = document.querySelector(".about-dialog");

const showAboutButton = document.querySelector(".button-show-about");

showAboutButton?.addEventListener("click", () => {
  if (!aboutDialog.open) {
    aboutDialog.showModal();
    document.body.classList.add("lightbox-open");
  }
});

const closeAboutButton = document.querySelector(".close-about-button");
closeAboutButton?.addEventListener("click", () => {
  if (aboutDialog.open) {
    aboutDialog.close();
    document.body.classList.remove("lightbox-open");
  }
});
document.addEventListener("keydown", (event) => {
  if (aboutDialog.open && event.key === "Escape") {
    aboutDialog.close();
    document.body.classList.remove("lightbox-open");
  }
});

/* ================================================================================================= */
/* #region FINAL HOME BUTTON RESET FIX — ALWAYS SWITCH TO GRID                                       */
/* ================================================================================================= */

document.addEventListener("DOMContentLoaded", () => {
  // Wait for full DOM to load before running the code
  const homeLink = Array.from(document.querySelectorAll("nav a")).find(
    (
      a // Select all <a> links in <nav>, convert NodeList to array, then find the one matching "home"
    ) => a.textContent.trim().toLowerCase() === "home" // Check text content of each link, trim whitespace, convert to lowercase, match "home"
  );

  if (homeLink) {
    // If a "Home" link was found
    homeLink.addEventListener("click", async (e) => {
      // Attach click event listener; async because we will use await inside
      e.preventDefault(); // Prevent default link navigation

      //  Reset view to GRID mode
      state.galleryType = "grid"; // Set global gallery mode to "grid"
      state.currentPage = 1; // Reset current page to 1

      // Hide carousel and show grid
      document.body.classList.remove("carousel-active"); // Remove body class for carousel mode
      document.querySelector("#gallery-carousel")?.classList.add("hidden"); // Hide carousel container; ?. ensures this only runs if the element exists, preventing runtime errors if null
      document.querySelector(".gallery-grid")?.classList.remove("hidden"); // Show grid container; ?. safely calls classList.remove only if the element exists

      // Reload first grid view
      await loadPages(1); // Load first page via API (await ensures it completes before continuing)
      loadGallery(); // Render images for current page in grid
      createPagesNavigation(); // Rebuild pagination controls

      // Reset toggle button text
      const viewToggleButton = document.getElementById("view-toggle"); // Select the toggle button
      if (viewToggleButton) viewToggleButton.textContent = "Switch to carousel"; // Change button text if it exists
    });
  }
});

/* #endregion EVENT LISTENERS  */

/* ================================================================================================= */
/* #region APPLICATION INITIALIZATION                                                                */
/* ================================================================================================= */

/**
 * APPLICATION STARTUP & INITIALIZATION
 * ====================================
 *
 * Initialize the application by loading the first set of pages using the pagination system
 * and setting up the category filtering interface. This provides immediate content for users
 * when the page loads and establishes both the gallery display and filtering controls.
 *
 * The initialization process:
 * 1. Loads initial pages (1 and 2) through the pagination system
 * 2. Renders the loaded images in the default grid gallery
 * 3. Sets up category filter buttons (starts with 'All' and 'Uncategorised')
 * 4. Establishes pagination controls and navigation
 */

// Load initial set of pages and render gallery on application start
const init = async () => {
  await loadPages(); // Loads pages 1 and 2 initially with loading animation
  loadGallery(); // Renders loaded images in the active gallery mode
  // updateCategoriesDOM(); // Initialize category filter buttons interface (starts with default categories)
  // console.log(state);
};

init();

/* #endregion APPLICATION INITIALIZATION */
