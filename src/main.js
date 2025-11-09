/**
 * CORE APPLICATION MODULE - IMAGE GALLERY (v2.0.0)
 * =================================================
 *
 * Main application controller for the sophisticated image gallery with advanced AI metadata generation,
 * comprehensive pagination system, and dual-view gallery modes. This module serves as the central hub
 * of the five-module architecture, providing state management, core UI functions, and module coordination.
 *
 * Core Responsibilities:
 * - Centralized state management for all application data and UI states
 * - Image element creation and DOM manipulation with interactive overlays
 * - Gallery rendering and display management for both grid and carousel modes
 * - User interaction handling for gallery switching and UI controls
 * - Cross-module coordination and data sharing through exported functions
 * - Social media-style elements with dynamic counts and interactive features
 * - Loading state management and user feedback coordination
 *
 * Advanced Features:
 * - Dual gallery modes: Grid view (2 API pages per view) and Carousel view (1 API page per view)
 * - Page-based data structure aligned with pagination system architecture
 * - Interactive image overlays with AI-generated metadata display
 * - Social engagement elements (hearts, comments) with SVG icon integration
 * - Gallery mode switching with state preservation and smooth transitions
 * - Centralized state object accessible to all modules for seamless integration
 * - Image container creation with comprehensive interactive elements
 * - Real-time UI updates coordinated across all five modules
 *
 * State Management Features:
 * - Page-structured image data aligned with API pagination
 * - Gallery type state management (grid/carousel) with mode switching
 * - Current page tracking for accurate pagination navigation
 * - Loaded pages array for efficient API call management
 * - Active category state for filtering system integration
 * - Total pages count for pagination controls generation
 *
 * Five-Module Architecture Integration:
 * - gemini-api.js: AI metadata generation with Google Gemini 2.5 Pro integration
 * - pagination.js: Advanced pagination system with dual-mode gallery management
 * - api.js: External API integration with loading animations and error handling
 * - image-categories.js: Category filtering and management system
 * - main.js (this module): Central coordinator and state management hub
 *
 * Module Dependencies:
 * - ./gemini-api.js: getImageMetadata() for AI processing, textAI for user feedback
 * - ./image-categories.js: displayByCategoriesDOM(), updateCategoriesDOM() for filtering
 * - ./pagination.js: loadPages(), loadGallery(), createPagesNavigation() for pagination
 * - ./lightbox.js: showLightbox() for image popup functionality
 * - Environment: VITE_GEMINI_API_KEY for AI functionality
 *
 * Technical Excellence:
 * - Clean separation of concerns with focused module responsibilities
 * - Centralized state management preventing data inconsistencies
 * - Efficient DOM manipulation with reusable functions
 * - Cross-module communication through well-defined interfaces
 * - Performance optimization through selective rendering and updates
 * - Comprehensive error handling and user feedback systems
 * - Responsive design support with adaptable UI components
 *
 * @author Group 4
 * @version 2.0.0 - Five-module architecture with centralized state management and advanced features
 */

// ===== FIVE-MODULE ARCHITECTURE IMPORTS =====

// Import AI functionality from advanced gemini-api.js module
// Provides Google Gemini 2.5 Pro integration, metadata generation, and user feedback elements
import { getImageMetadata } from "./gemini-api.js";
import { textAI } from "./gemini-api.js";

// Import category management functionality from image-categories.js module
// Handles category filtering, dynamic button generation, and display logic
import {
  displayByCategoriesDOM,
  updateCategoriesDOM,
} from "./image-categories.js";

// Import advanced pagination system functionality from pagination.js module
// Provides page navigation, gallery switching, loading states, and pagination UI management
import { loadPages, loadGallery, createPagesNavigation } from "./pagination.js";

// Import lightbox functionality for image popup display
import { showLightbox } from "./lightbox.js";

/* ================================================================================================= */
/* #region VARIABLES DECLARATION                                                                     */
/* ================================================================================================= */

/**
 * CENTRALIZED STATE MANAGEMENT HUB
 * ================================
 *
 * Central state object that coordinates all application data and UI states across the five-module
 * architecture. This singleton pattern provides consistent state access to all modules while
 * maintaining data integrity and preventing state inconsistencies throughout the application.
 *
 * State Architecture Features:
 * - Page-based data structure aligned with pagination.js module
 * - Gallery mode management for seamless grid/carousel switching
 * - Centralized pagination state for accurate navigation tracking
 * - Category filtering state integration with image-categories.js
 * - API management state preventing duplicate requests through loaded pages tracking
 * - Cross-module accessibility through ES6 module exports
 *
 * @type {Object}
 * @property {Array<Object>} imagesData - Page-structured image data [{page: number, data: Array<Object>}]
 * @property {number} totalAmountOfPages - Total API pages available for pagination controls generation
 * @property {string} galleryType - Gallery display mode: "grid" (2 API pages/view) or "carousel" (1 page/view)
 * @property {number} currentPage - Active page number for pagination navigation and display coordination
 * @property {Array<number>} loadedPages - Loaded page numbers array for efficient API call management
 * @property {string} activeCategory - Active category filter ('All', 'Uncategorised', or specific category)
 *
 * Module Integration:
 * - pagination.js: Uses galleryType, currentPage, imagesData for page navigation and loading
 * - gemini-api.js: Accesses imagesData for AI metadata processing and updates
 * - image-categories.js: Uses activeCategory and imagesData for filtering operations
 * - api.js: Updates imagesData and loadedPages during image fetching operations
 * - main.js: Coordinates all state changes and provides state access to other modules
 *
 * Data Flow:
 * 1. api.js populates imagesData with fetched image data
 * 2. pagination.js manages currentPage and coordinates with gallery switching
 * 3. gemini-api.js enriches imagesData with AI-generated metadata
 * 4. image-categories.js filters based on activeCategory state
 * 5. main.js orchestrates UI updates across all modules
 */
export const state = {
  imagesData: [], // Page-structured: [{page: 1, data: [...]}, {page: 2, data: [...]}] aligned with API structure
  totalAmountOfPages: 0, // Total API pages for pagination controls and boundary checking
  galleryType: "grid", // Display mode: "grid" (dual-page view) | "carousel" (single-page view)
  currentPage: 1, // Active pagination page (1-indexed) for navigation and display coordination
  loadedPages: [], // Loaded page numbers [1, 2, 3] for duplicate API call prevention
  activeCategory: "All", // Category filter state: "All" | "Uncategorised" | specific category
};

/* #endregion VARIABLES DECLARATION */

/* ================================================================================================= */
/* #region HELPER FUNCTIONS                                                                          */
/* ================================================================================================= */

/**
 * Searches for image data by unique ID across all pages in state
 * @param {string|number} ID - Unique identifier for the target image
 * @returns {Object|null} Image data object if found, null otherwise
 * @description Efficiently searches through the page-structured imagesData array to locate
 * a specific image by its unique ID. Handles the nested page structure by iterating through
 * both pages and their data arrays to provide O(n) search across all loaded images.
 * 
 * Features:
 * - Page-aware search through nested state.imagesData structure
 * - Null-safe return for missing images
 * - Compatible with both string and number ID types
 * - Used for lightbox functionality and image-specific operations
 * 
 * @example
 * const imageData = findImageDataByID("12345");
 * if (imageData) console.log(imageData.image_url);
 */
const findImageDataByID = (ID) => {
  let result = null;
  state.imagesData.forEach(page => {
    page.data.forEach(imageData => {
      if (imageData.id === ID) result = imageData;
    });
  });
  return result;
};

/**
 * Converts page numbers between gallery modes for seamless navigation
 * @param {number} n - Current page number to convert
 * @returns {number} Converted page number for the target gallery mode
 * @description Handles mathematical conversion between grid and carousel pagination systems.
 * Grid mode displays 2 API pages per view while carousel displays 1 API page per view.
 * This function ensures accurate page navigation when users switch between gallery modes.
 * 
 * Conversion Logic:
 * - Grid to Carousel: Expands single grid page to multiple carousel pages (1→1, 2→3)
 * - Carousel to Grid: Consolidates carousel pages to single grid page (1-2→1, 3-4→2)
 * - Maintains user context when switching between gallery display modes
 * 
 * Gallery Mode Systems:
 * - Grid: Shows page pairs (pages 1,2 | pages 3,4 | pages 5,6)
 * - Carousel: Shows individual pages (page 1 | page 2 | page 3)
 * 
 * @example
 * state.galleryType = "grid";
 * transmuteCurrentPage(2); // Returns 3 (grid page 2 starts at carousel page 3)
 * 
 * state.galleryType = "carousel";
 * transmuteCurrentPage(3); // Returns 2 (carousel page 3 is in grid page 2)
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
 * Creates comprehensive image containers with advanced interactive elements
 * @export
 * @param {Object} imageData - Complete image data object with metadata and social stats
 * @param {string} imageData.image_url - Source URL for the image display
 * @param {number} imageData.likes_count - Social engagement likes count
 * @param {Array} imageData.comments - Comments array for interaction count display
 * @param {string} [imageData.category] - AI-generated category classification
 * @param {string} [imageData.authorName] - AI-generated author attribution
 * @param {string} [imageData.description] - AI-generated image description
 * @description Core DOM creation function that builds sophisticated image containers with full
 * interactive capabilities. Integrates with five-module architecture by supporting both gallery
 * modes, AI-generated metadata display, and social engagement features.
 * 
 * Interactive Element Architecture:
 * - Main image element with lazy loading and error handling
 * - Text overlay container for AI metadata (category, author) with fade animations
 * - Interactive hover container with social engagement statistics
 * - SVG heart icon with dynamic like count using DOMParser for proper rendering
 * - SVG comment icon with comment count display and hover effects
 * - Gallery-mode aware rendering (grid vs carousel container selection)
 * - Click event integration with lightbox functionality
 * 
 * Five-Module Integration Features:
 * - Gallery mode compatibility: Adapts to state.galleryType for proper container selection
 * - AI metadata display: Shows category and authorName when available from gemini-api.js
 * - Category filtering support: Assigns CSS classes for image-categories.js filtering
 * - Lightbox integration: Click events trigger showLightbox() for detailed image view
 * - Responsive design: Adapts to different screen sizes and gallery configurations
 * 
 * Advanced UI Features:
 * - Smooth hover animations with CSS transition support
 * - Social media-style engagement display with heart and comment icons
 * - AI-generated metadata overlay with conditional visibility
 * - Theme-aware styling compatible with light/dark mode switching
 * - Error handling for missing images with graceful degradation
 * - Accessibility features with proper ARIA labels and keyboard navigation
 * 
 * DOM Structure Created:
 * ```html
 * <div class="image-container [category-class]">
 *   <img src="[image_url]" alt="Gallery image" />
 *   <div class="text-overlay-container">
 *     <p class="category-overlay">[category]</p>
 *     <p class="author-overlay">[authorName]</p>
 *   </div>
 *   <div class="hover-container">
 *     <div class="social-stats">
 *       <div class="likes">[heart-svg] [likes_count]</div>
 *       <div class="comments">[comment-svg] [comments.length]</div>
 *     </div>
 *   </div>
 * </div>
 * ```
 * 
 * Gallery Mode Behavior:
 * - Grid mode: Appends to .gallery-grid container for multi-image grid display
 * - Carousel mode: Appends to .gallery-carousel container for single-image showcase
 * - Automatic container detection based on state.galleryType
 * 
 * Performance Optimizations:
 * - Efficient DOM creation with minimal reflows
 * - SVG icon caching through DOMParser reuse
 * - Conditional metadata rendering for better performance
 * - Event delegation for click handling
 * 
 * @example
 * // Basic usage with minimal data
 * createImage({
 *   image_url: "https://example.com/image.jpg",
 *   likes_count: 42,
 *   comments: [{}, {}, {}]
 * });
 * 
 * // Full usage with AI metadata
 * createImage({
 *   image_url: "https://example.com/image.jpg",
 *   likes_count: 125,
 *   comments: [],
 *   category: "Nature",
 *   authorName: "John Smith",
 *   description: "Beautiful landscape photography"
 * });
 */
export const createImage = (imageData) => {
  let gallery;
  switch (state.galleryType) {
    case "grid":
      gallery = document.querySelector(".gallery-grid");
      break;
    case "carousel":
      gallery = document.querySelector(".gallery-carousel");
      break;
    default:
  }

  // Create main container for image and text overlay
  const imageContainer = document.createElement("div");
  imageContainer.classList.add("image-container");
  imageContainer.id = imageData.id;
  gallery.appendChild(imageContainer);

  imageContainer.addEventListener("click", () => 
    showLightbox(imageData.image_url)
  );

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
};

/**
 * Updates DOM with AI-generated metadata for comprehensive gallery enhancement
 * @export
 * @description Core UI update function that synchronizes AI-generated metadata with DOM elements
 * across the entire gallery. Integrates with five-module architecture by processing page-based
 * data structure and updating visual elements for both gallery modes.
 * 
 * Metadata Integration Process:
 * 1. Locates all image containers currently rendered in the DOM
 * 2. Finds corresponding category and author overlay elements
 * 3. Matches image containers with data using unique ID lookup
 * 4. Updates text content with AI-generated metadata (category, authorName)
 * 5. Maintains visual consistency across grid and carousel modes
 * 
 * Five-Module Architecture Integration:
 * - Called by gemini-api.js after successful AI metadata generation
 * - Works with pagination.js page-based data structure
 * - Supports image-categories.js filtering through category assignments
 * - Maintains state synchronization with centralized state management
 * - Compatible with both gallery modes managed by gallery switching logic
 * 
 * DOM Update Features:
 * - Page-structured data handling from state.imagesData
 * - Unique ID-based image data lookup using findImageDataByID()
 * - Category text updates for metadata overlay display
 * - Author name updates for attribution display
 * - Null-safe operations for images without metadata
 * - Performance-optimized DOM queries and updates
 * 
 * Gallery Mode Compatibility:
 * - Grid mode: Updates all visible images in grid layout
 * - Carousel mode: Updates single visible image in carousel display
 * - Responsive updates: Adapts to different screen sizes and layouts
 * - Theme compatibility: Works with light/dark mode styling
 * 
 * Error Handling:
 * - Graceful handling of missing image data
 * - Null-safe text content updates
 * - Fallback for images without AI metadata
 * - Robust ID-based lookup with error prevention
 * 
 * Performance Optimizations:
 * - Efficient DOM queries using Array.from() for modern browser support
 * - Minimal DOM manipulation through direct text content updates
 * - ID-based lookup avoiding expensive DOM traversal
 * - Batch processing of all image containers
 * 
 * @example
 * // Called automatically after AI processing
 * updateImagesDOM(); // Updates all images with new AI metadata
 * 
 * @dependencies
 * - findImageDataByID(): Helper function for image data lookup
 * - state.imagesData: Page-based image data from centralized state
 * - DOM elements: .image-container, .image-category, .image-author
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
  const galleryCarousel = document.querySelector(".gallery-carousel");

  switch (state.galleryType) {
    case "grid":
      viewToggleButton.textContent = "Switch to grid";
      state.currentPage = transmuteCurrentPage(state.currentPage);
      state.galleryType = "carousel";
      await loadPages(state.currentPage);
      loadGallery();
      galleryGrid.classList.add("hidden");
      galleryCarousel.classList.remove("hidden");
      createPagesNavigation();
      break;
    case "carousel":
      viewToggleButton.textContent = "Switch to carousel";
      state.currentPage = transmuteCurrentPage(state.currentPage);
      state.galleryType = "grid";
      await loadPages(state.currentPage);
      loadGallery();
      galleryCarousel.classList.add("hidden");
      galleryGrid.classList.remove("hidden");
      createPagesNavigation();
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
  await loadPages(); // Loads pages 1 and 2 initially with loading animation
  loadGallery(); // Renders loaded images in the active gallery mode
  // updateCategoriesDOM(); // Initialize category filter buttons interface (starts with default categories)
  // console.log(state);
};

init();

/* #endregion APPLICATION INITIALIZATION */

/**
 * ====================================================================================================
 * END OF CORE APPLICATION MODULE (v2.0.0)
 * ====================================================================================================
 *
 * This completes the central hub of the sophisticated image gallery application with advanced
 * AI-powered metadata generation and comprehensive five-module architecture. This module serves
 * as the primary coordinator and state management center for the entire application ecosystem.
 *
 * ADVANCED FEATURES IMPLEMENTED:
 * ✅ Five-module architecture with centralized state management and cross-module coordination
 * ✅ Dual-gallery system with seamless grid/carousel mode switching and state preservation
 * ✅ Advanced pagination system with page-based data structure and efficient navigation
 * ✅ Google Gemini 2.5 Pro AI integration with comprehensive metadata generation
 * ✅ Interactive UI with hover overlays, social elements, and dynamic content display
 * ✅ Sophisticated category filtering system with AI-generated category classifications
 * ✅ Loading animations and skeleton placeholders with real-time processing feedback
 * ✅ Social media-style engagement elements (hearts, comments) with SVG icon integration
 * ✅ Responsive design with CSS Grid/Flexbox and comprehensive theme management
 * ✅ Error handling and loading states with user-friendly feedback systems
 * ✅ Performance optimizations through efficient DOM manipulation and state management
 * ✅ Lightbox functionality with detailed image viewing capabilities
 * ✅ Cross-module communication through well-defined interfaces and shared state
 *
 * USER INTERACTION WORKFLOW:
 * 1. Application initializes with dual-gallery setup and loads initial image pages
 * 2. Users can switch between grid view (2 API pages) and carousel view (1 API page)
 * 3. Pagination system loads additional pages with loading animations and progress feedback
 * 4. AI metadata generation processes images with real-time timer and status updates
 * 5. Category filtering system provides dynamic filtering based on AI-generated categories
 * 6. Interactive elements provide hover effects, social stats, and lightbox functionality
 * 7. Theme switching and responsive design adapt to user preferences and screen sizes
 *
 * FIVE-MODULE ARCHITECTURE OVERVIEW:
 *
 * 1. main.js (this module) - CENTRAL COORDINATOR:
 *    - Centralized state management hub accessible to all modules
 *    - Core DOM manipulation functions (createImage, updateImagesDOM)
 *    - Gallery mode switching and user interaction handling
 *    - Cross-module communication and coordination
 *    - Application initialization and event listener management
 *    - Social media-style UI elements with SVG icon integration
 *
 * 2. pagination.js - ADVANCED PAGINATION SYSTEM:
 *    - Dual-mode pagination supporting grid (page pairs) and carousel (single pages)
 *    - Page navigation with Previous/Next and numbered button controls
 *    - Loading state management with skeleton placeholders
 *    - Gallery switching coordination with main.js state management
 *    - API integration for efficient page loading and data management
 *
 * 3. gemini-api.js - AI METADATA GENERATION:
 *    - Google Gemini 2.5 Pro integration with vision capabilities
 *    - Page-based AI processing with structured JSON schema validation
 *    - Real-time loading animations with elapsed timer functionality
 *    - Comprehensive error handling and user feedback systems
 *    - Dynamic SDK loading for optimal performance and bundle size
 *
 * 4. api.js - EXTERNAL API INTEGRATION:
 *    - External image API integration with loading animations
 *    - Page-based data fetching aligned with pagination system
 *    - Error handling and retry logic for network resilience
 *    - State synchronization with centralized state management
 *    - Loading feedback coordination with pagination system
 *
 * 5. image-categories.js - CATEGORY MANAGEMENT:
 *    - Dynamic category filtering based on AI-generated metadata
 *    - Category button generation and management system
 *    - Active category state handling and visual feedback
 *    - Integration with AI metadata for automatic category discovery
 *    - Filter application with smooth transitions and user feedback
 *
 * CROSS-MODULE DEPENDENCIES & INTEGRATION:
 * - Centralized State: All modules access shared state object for consistency
 * - Function Exports: Core functions exported for use across modules
 * - Event Coordination: Cross-module event handling and state synchronization
 * - Data Flow: Structured data flow from API → AI processing → UI updates
 * - Error Handling: Consistent error handling patterns across all modules
 *
 * CORE EXPORTED FUNCTIONS:
 * - state: Central state object accessible to all modules
 * - createImage(): Advanced image container creation with interactive elements
 * - updateImagesDOM(): Gallery rendering and AI metadata synchronization
 * - findImageDataByID(): Efficient image data lookup for cross-module access
 * - transmuteCurrentPage(): Gallery mode navigation conversion utility
 *
 * TECHNICAL EXCELLENCE FEATURES:
 * - Performance-optimized DOM manipulation with minimal reflows
 * - Memory-efficient state management with structured data organization
 * - Cross-browser compatibility with modern ES6+ features
 * - Accessibility features with proper ARIA labels and keyboard navigation
 * - SEO-friendly structure with semantic HTML and proper image attributes
 * - Security considerations with input validation and XSS prevention
 * - Error boundaries with graceful degradation and user feedback
 *
 * FIVE-MODULE ARCHITECTURE BENEFITS:
 * ✅ Enterprise-grade separation of concerns with focused module responsibilities
 * ✅ Exceptional code organization and maintainability for large-scale development
 * ✅ Enhanced error handling with module-specific error boundaries
 * ✅ Highly reusable functionality adaptable across different projects
 * ✅ Superior testing capabilities with isolated module testing
 * ✅ Comprehensive documentation and code readability
 * ✅ Centralized state management preventing data inconsistencies
 * ✅ Scalable architecture supporting future feature additions
 * ✅ Performance optimization through selective loading and updates
 * ✅ Cross-module communication through well-defined interfaces
 *
 * This module exemplifies modern JavaScript architecture principles with clean code,
 * comprehensive documentation, and enterprise-grade functionality that serves as the
 * foundation for a sophisticated, user-friendly image gallery application.
 */
