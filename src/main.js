/**
 * IMAGE GALLERY WITH AI METADATA GENERATION & PAGINATION
 * ========================================================
 *
 * This application creates an interactive image gallery with dual-view modes (grid/carousel)
 * that fetches images from an API using sophisticated pagination system and uses Google's Gemini AI 
 * to generate metadata (category, description, author) for each image.
 * The application features a fully modular architecture with separated concerns across multiple specialized modules.
 *
 * Features:
 * - Advanced pagination system with page-based loading and navigation
 * - Dual gallery modes: Grid view and Carousel view with seamless switching
 * - Loading animations and skeleton placeholders during API requests
 * - AI-powered metadata generation using modular Gemini API integration  
 * - Interactive UI with hover overlays showing metadata and social stats
 * - Real-time processing timer with animated loading indicators
 * - Social media-style elements (hearts, comments) with dynamic counts
 * - Advanced category-based filtering system with dynamic button generation
 * - Comprehensive error handling and loading states with user feedback
 * - Responsive layouts with CSS animations and theme switching
 * - Fully modular architecture with separated concerns across five specialized modules
 * - Centralized state management with cross-module data sharing
 *
 * Dependencies:
 * - ./gemeni-api.js - Modular Gemini AI integration for metadata generation
 * - ./api.js - External API integration for image fetching with loading animations
 * - ./image-categories.js - Category filtering and UI management
 * - ./pagination.js - Pagination logic, page navigation, and gallery management
 * - Custom CSS for styling, animations, and responsive design
 * - Environment Variables: VITE_GEMINI_API_KEY for AI functionality
 *
 * Five-Module Architecture:
 * - main.js (this file): Core application logic, UI management, state, and user interactions
 * - gemeni-api.js: Separated Gemini AI functionality, API calls, and utilities
 * - api.js: External image API integration with loading animations and error handling
 * - image-categories.js: Category filtering logic and button management
 * - pagination.js: Pagination system, page navigation, gallery switching, and loading states
 * - style.css: Comprehensive styling, animations, responsive design, and theme management
 *
 * @author Group 4
 * @version 2.0.0 - Five-module architecture with advanced pagination and dual gallery modes
 */

// Import AI functionality from modular gemeni-api.js file
// This module handles all Gemini AI integration, API calls, timer functionality, and utilities
import { getImageMetadata } from "./gemeni-api.js";

// Import DOM elements for user feedback and loading animations
import { textAI } from "./gemeni-api.js";

// Import category management functionality from modular image-categories.js file
// This module handles category filtering, button generation, and display logic
import {
  displayByCategoriesDOM,
  updateCategoriesDOM,
} from "./image-categories.js";

// Import pagination system functionality from modular pagination.js file
// This module handles page navigation, gallery switching, loading states, and pagination UI
import { loadPages, loadGallery, createPagesNavigation } from "./pagination.js";

/* ================================================================================================= */
/* #region VARIABLES DECLARATION                                                                     */
/* ================================================================================================= */

/**
 * CENTRALIZED STATE MANAGEMENT
 * ============================
 *
 * Global application state object that manages all core data and UI state.
 * This centralized approach provides better organization and makes state
 * accessible to other modules through exports. The state handles pagination,
 * gallery modes, and category filtering across the entire application.
 *
 * @type {Object}
 * @property {Array<Object>} imagesData - Array storing all loaded image data with pagination structure
 * @property {number} totalAmountOfPages - Total number of pages available from the API
 * @property {string} galleryType - Current gallery display mode: "grid" (default) or "carousel"
 * @property {number} currentPage - Currently active page number for pagination navigation
 * @property {Array<number>} loadedPages - Array of page numbers that have been loaded from API
 * @property {string} activeCategory - Currently active category filter ('All', 'Uncategorised', or specific category)
 */
export const state = {
  imagesData: [],                 // Page-structured image data: [{page: 1, data: [...]}, {page: 2, data: [...]}]
  totalAmountOfPages: 0,          // Total pages available from API for pagination controls
  galleryType: "grid",            // Gallery display mode: "grid" (2 pages per view) or "carousel" (1 page per view)
  currentPage: 1,                 // Current page in pagination system
  loadedPages: [],                // Tracks which pages have been fetched to avoid duplicate API calls
  activeCategory: "All",          // Category filter state for image display filtering
};

/* #endregion VARIABLES DECLARATION */

/* ================================================================================================= */
/* #region DOM MANIPULATION                                                                          */
/* ================================================================================================= */

/**
 * Creates and appends a complete image container with interactive elements to the appropriate gallery
 * @param {Object} imageData - The image data object containing all image information
 * @param {string} imageData.image_url - The source URL of the image
 * @param {number} imageData.likes_count - Number of likes for the image
 * @param {Array} imageData.comments - Array of comments for the image
 * @description This function dynamically creates a comprehensive image container with:
 * - Main image element with proper styling and URL
 * - Text overlay container for AI-generated metadata display (category, author)
 * - Interactive hover container with social engagement elements
 * - Heart icon with like count display using SVG parsing
 * - Comment icon with comment count display using SVG parsing
 * - SVG icons parsed and inserted using DOMParser for proper rendering
 * - Gallery-aware rendering (appends to grid or carousel based on current galleryType)
 *
 * The structure supports:
 * - Dual gallery modes: grid layout and carousel display
 * - Hover effects for metadata and social stats with smooth animations
 * - Category-based filtering through CSS classes for dynamic visibility
 * - Social interaction display (likes and comments) with proper counts
 * - Responsive design with overlay positioning and proper z-indexing
 * - Theme-aware styling that adapts to light and dark modes
 *
 * @example
 * createImage({
 *   image_url: "https://example.com/image.jpg", 
 *   likes_count: 42,
 *   comments: [{}, {}, {}] // 3 comments
 * });
 */
export const createImage = (imageData) => {

  let gallery;
  switch (state.galleryType) {
    case 'grid':
      gallery = document.querySelector(".gallery-grid")
      break;
    case 'carousel':
      gallery = document.querySelector(".gallery-carousel")
      break;
    default:
  }

  // Create main container for image and text overlay
  const imageContainer = document.createElement("div");
  imageContainer.classList.add("image-container");
  gallery.appendChild(imageContainer);

  // Create and configure the image element
  const appImg = document.createElement("img"); // Create new image element
  appImg.classList.add("app-img"); // Add CSS class for styling
  appImg.src = imageData.image_url; // Set the image source URL
  imageContainer.appendChild(appImg); // Append the image to the app container

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
  textContainer.appendChild(imageCategory);

  // Create author display element
  const imageAuthor = document.createElement("p");
  imageAuthor.classList.add("image-author");
  textContainer.appendChild(imageAuthor);

  const iconContainer = document.createElement("div");
  iconContainer.classList.add("icon-container");
  hoverContainer.appendChild(iconContainer);

  // --- Adding Icons --- //
  /* Used DOMParser because direct 'innerHTML = svgContent`caused syntax error*/
  const parser = new DOMParser(); // Creates a new DOMParser

  //Heart icon and like number group

  const heartGroup = document.createElement("div");
  heartGroup.classList.add("icon-group");

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
  // Update category filtering after adding new image
  displayByCategoriesDOM();

  // Show/hide hoverContainer dynamically on hover

  hoverContainer.style.opacity = "0";
  hoverContainer.style.transition = "opacity 0.3s";
  hoverContainer.style.pointerEvents = "none";

  imageContainer.addEventListener("mouseenter", () => {
    hoverContainer.style.opacity = "1";
    hoverContainer.style.pointerEvents = "auto";
  });

  imageContainer.addEventListener("mouseleave", () => {
    hoverContainer.style.opacity = "0";
    hoverContainer.style.pointerEvents = "none";
  });
};

/**
 * Updates the DOM with AI-generated metadata for all loaded images
 * @description Finds all category and author containers and populates them
 * with data from the state.imagesData array structure. Also adds category CSS classes 
 * for filtering functionality. This function handles the page-based data structure
 * and flattens it for DOM manipulation. Called after AI metadata generation completes.
 * 
 * Features:
 * - Handles page-structured data from pagination system
 * - Adds category-based CSS classes for filtering functionality
 * - Updates both category and author text content
 * - Processes space-separated categories for CSS class names
 * - Works with both grid and carousel gallery modes
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
  for (let i = 0; i < imageCategoryContainers.length; i++) {
    imageCategoryContainers[i].textContent = state.imagesData[i].category;
    imageAuthorContainers[i].textContent = state.imagesData[i].authorName;
    // Add category class for filtering functionality
    if (state.imagesData[i].category) {
      imageContainers[i].classList.add(
        `category-${state.imagesData[i].category.replaceAll(" ", "-")}`
      );
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

const viewToggleButton = document.getElementById('view-toggle');

/**
 * Converts page numbers between gallery modes due to different pagination systems
 * @param {number} n - Current page number
 * @returns {number} - Converted page number for the target gallery mode
 * @description Grid mode shows 2 API pages per view, carousel shows 1 API page per view.
 * This function handles the mathematical conversion between the two systems.
 */
const transmuteCurrentPage = (n) => {
  switch (state.galleryType) {
    case 'grid':
      return 2 * n - 1;  // Convert grid page to carousel: grid page 1 becomes carousel page 1
    case 'carousel':
      return Math.ceil(n / 2);  // Convert carousel page to grid: carousel pages 1-2 become grid page 1
    default:
      return n;
  }
}

viewToggleButton.addEventListener('click', async () => {

  const galleryGrid = document.querySelector('.gallery-grid');
  const galleryCarousel = document.querySelector('.gallery-carousel');

  switch (state.galleryType) {
    case 'grid':
      viewToggleButton.textContent = 'Switch to grid';
      state.currentPage = transmuteCurrentPage(state.currentPage);
      state.galleryType = 'carousel';
      await loadPages(state.currentPage);
      loadGallery();
      galleryGrid.classList.add('hidden');
      galleryCarousel.classList.remove('hidden');
      createPagesNavigation()
      break;
    case 'carousel':
      viewToggleButton.textContent = 'Switch to carousel';
      state.currentPage = transmuteCurrentPage(state.currentPage);
      state.galleryType = 'grid';
      await loadPages(state.currentPage);
      loadGallery();
      galleryCarousel.classList.add('hidden');
      galleryGrid.classList.remove('hidden');
      createPagesNavigation()
      break;
    default:
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
  await loadPages();  // Loads pages 1 and 2 initially with loading animation
  loadGallery();      // Renders loaded images in the active gallery mode
};

init();

// Initialize category filter buttons interface (starts with default categories)
updateCategoriesDOM();

/* #endregion APPLICATION INITIALIZATION */

/**
 * =====================================================================================================
 * END OF FILE
 * =====================================================================================================
 *
 * This completes the main application file for the image gallery with AI-powered metadata generation.
 * The application now features a fully modular architecture with three-module separation of concerns.
 *
 * Key Features Implemented:
 * ✅ Dynamic image loading with pagination
 * ✅ Modular Google Gemini AI integration (via gemeni-api.js)
 * ✅ Modular external API integration (via api.js)
 * ✅ Modular category management system (via image-categories.js)
 * ✅ Interactive UI with hover overlays and social elements
 * ✅ Category-based filtering system with dynamic button generation
 * ✅ Error handling and loading states
 * ✅ Responsive design with CSS Grid
 * ✅ Centralized state management with exports
 * ✅ Button state management during async operations
 * ✅ Animated loading indicators with elapsed time display
 * ✅ Real-time processing timer for user feedback
 * ✅ Social media-style interaction elements (hearts, comments)
 * ✅ Fully modular architecture with clear separation of concerns
 *
 * Usage:
 * 1. Page loads with initial set of images
 * 2. Click "Load images" to fetch more images
 * 3. Click "Get metadata" to generate AI descriptions
 * 4. Use category buttons to filter images by type
 * 5. Hover over images to see generated metadata and social stats
 *
 * Four-Module Architecture:
 *
 * 1. main.js (this file):
 *    - Core application logic and UI management
 *    - Centralized state management and exports
 *    - DOM manipulation and user interactions
 *    - Event listeners and application initialization
 *
 * 2. gemeni-api.js:
 *    - Dedicated Gemini AI functionality and API calls
 *    - Loading animations and timer management
 *    - AI response processing and error handling
 *    - Metadata generation and validation
 *
 * 3. api.js:
 *    - External image API integration
 *    - Pagination and data fetching logic
 *    - Response validation and error handling
 *    - Integration with centralized state management
 *
 * 4. image-categories.js:
 *    - Category filtering and display logic
 *    - Dynamic category button generation
 *    - Category-based image visibility management
 *    - Active category state handling
 *
 * Module Dependencies:
 * - ./gemeni-api.js: Handles all Gemini AI functionality, animations, and utilities
 * - ./api.js: Handles external image API calls and pagination
 * - ./image-categories.js: Handles category filtering and button management
 * - ./style.css: Comprehensive styling for gallery, animations, and responsive design
 * - Environment: VITE_GEMINI_API_KEY for AI functionality
 * - External API: https://image-feed-api.vercel.app/ for image data
 *
 * Core Functions in this file:
 * - createImage(): DOM creation for image containers with social elements
 * - updateImagesDOM(): Gallery rendering and image display
 * - state: Centralized state management object (exported)
 * - DOM elements: UI component exports for other modules
 * - Event listeners: User interaction handling
 *
 * External Module Functions:
 * - getImageMetadata() (gemeni-api.js): AI metadata generation using Gemini 2.5 Pro
 * - fetchImages() (api.js): External API integration for image loading
 * - displayByCategoriesDOM() (image-categories.js): Category-based image filtering
 * - updateCategoriesDOM() (image-categories.js): Dynamic category button management
 * - Animation utilities (gemeni-api.js): Timer and loading feedback systems
 *
 * Modular Architecture Benefits:
 * ✅ Clear separation of concerns (UI, AI, API, Category logic)
 * ✅ Improved code organization and maintainability
 * ✅ Enhanced error handling and user feedback
 * ✅ Reusable functionality across projects
 * ✅ Easier testing and debugging
 * ✅ Better code readability and documentation
 * ✅ Centralized state management
 * ✅ Scalable architecture for future features
 * ✅ Specialized modules for focused functionality
 */
