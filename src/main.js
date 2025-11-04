/**
 * IMAGE GALLERY WITH AI METADATA GENERATION
 * =========================================
 *
 * This application creates an interactive image gallery that fetches images from an API
 * and uses Google's Gemini AI to generate metadata (category, description, author) for each image.
 * The AI functionality has been modularized into a separate gemeni-api.js file for better code organization.
 *
 * Features:
 * - Dynamic image loading with pagination
 * - AI-powered metadata generation using modular Gemini API integration
 * - Interactive UI with hover overlays showing metadata
 * - Real-time processing timer with animated loading indicators
 * - Social media-style elements (hearts, comments)
 * - Category-based filtering system
 * - Error handling and loading states
 * - Responsive grid layout with CSS animations
 * - Modular architecture with separated AI functionality
 *
 * Dependencies:
 * - ./gemeni-api.js - Modular Gemini AI integration for metadata generation
 * - Custom CSS for styling and animations
 
 * Architecture:
 * - main.js (this file): Core application logic, UI management, and user interactions
 * - gemeni-api.js: Separated Gemini AI functionality, API calls, and utilities
 * - style.css: Comprehensive styling, animations, and responsive design
 *
 
 */

import "./style.css";
// Import AI functionality from modular gemeni-api.js file
// This module handles all Gemini AI integration, API calls, timer functionality, and utilities
import { getImageMetadata } from './gemeni-api.js';

import { fetchImages } from './api.js';

/* ================================================================================================= */
/* #region VARIABLES DECLARATION                                                                     */
/* ================================================================================================= */

export const state = {
  pagesLoadedCounter: 1,
  imagesData: [],
  activeCategory: "All",
}


/* #endregion VARIABLES DECLARATION */

/* ================================================================================================= */
/* #region DOM MANIPULATION                                                                          */
/* ================================================================================================= */

/**
 * Creates and appends a complete image container with interactive elements to the app
 * @param {Object} imageData - The image data object containing all image information
 * @param {string} imageData.image_url - The source URL of the image
 * @param {number} imageData.likes_count - Number of likes for the image
 * @param {Array} imageData.comments - Array of comments for the image
 * @description This function dynamically creates a comprehensive image container with:
 * - Main image element with proper styling and URL
 * - Text overlay container for AI-generated metadata display (category, author)
 * - Interactive hover container with social engagement elements
 * - Heart icon with like count display
 * - Comment icon with comment count display
 * - SVG icons parsed and inserted using DOMParser for proper rendering
 *
 * The structure supports:
 * - Hover effects for metadata and social stats
 * - Category-based filtering through CSS classes
 * - Social interaction display (likes and comments)
 * - Responsive design with overlay positioning
 *
 * @example
 * createImage({
 *   image_url: "https://example.com/image.jpg",
 *   likes_count: 42,
 *   comments: [{}, {}, {}] // 3 comments
 * });
 */
export const createImage = (imageData) => {
  // Ensure the app container exists before proceeding
  if (!appContainer) appContainer = document.getElementById("app");

  // Create main container for image and text overlay
  const imageContainer = document.createElement("div");
  imageContainer.classList.add("image-container");
  appContainer.appendChild(imageContainer);

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

  const svgIconHeart = `<?xml version="1.0" encoding="utf-8"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
    <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M12 6.00019C10.2006 3.90317 7.19377 3.2551 4.93923 5.17534C2.68468 7.09558 2.36727 10.3061 4.13778 12.5772C5.60984 14.4654 10.0648 18.4479 11.5249 19.7369C11.6882 19.8811 11.7699 19.9532 11.8652 19.9815C11.9483 20.0062 12.0393 20.0062 12.1225 19.9815C12.2178 19.9532 12.2994 19.8811 12.4628 19.7369C13.9229 18.4479 18.3778 14.4654 19.8499 12.5772C21.6204 10.3061 21.3417 7.07538 19.0484 5.17534C16.7551 3.2753 13.7994 3.90317 12 6.00019Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

  const svgDocHeart = parser.parseFromString(svgIconHeart, "image/svg+xml"); //Parse the SVG string into an SVG Document object
  const heartIcon = svgDocHeart.documentElement; // Get the root SVG element from the parsed document
  heartIcon.classList.add("heart-icon");
  iconContainer.appendChild(heartIcon); // Append the actual SVG element to  'hoverContainer'

  const likeNumber = document.createElement("p");
  likeNumber.classList.add("like-number"); // Add CSS class for styling in stylesheet (for Emma)
  likeNumber.textContent = imageData.likes_count;
  iconContainer.appendChild(likeNumber);

  const svgIconComment = `<?xml version="1.0" encoding="utf-8"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
    <svg fill="currentColor" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M144 208c-17.7 0-32 14.3-32 32s14.3 32 32 32 32-14.3 32-32-14.3-32-32-32zm112 0c-17.7 0-32 14.3-32 32s14.3 32 32 32 32-14.3 32-32-14.3-32-32-32zm112 0c-17.7 0-32 14.3-32 32s14.3 32 32 32 32-14.3 32-32-14.3-32-32-32zM256 32C114.6 32 0 125.1 0 240c0 47.6 19.9 91.2 52.9 126.3C38 405.7 7 439.1 6.5 439.5c-6.6 7-8.4 17.2-4.6 26S14.4 480 24 480c61.5 0 110-25.7 139.1-46.3C192 442.8 223.2 448 256 448c141.4 0 256-93.1 256-208S397.4 32 256 32zm0 368c-26.7 0-53.1-4.1-78.4-12.1l-22.7-7.2-19.5 13.8c-14.3 10.1-33.9 21.4-57.5 29 7.3-12.1 14.4-25.7 19.9-40.2l10.6-28.1-20.6-21.8C69.7 314.1 48 282.2 48 240c0-88.2 93.3-160 208-160s208 71.8 208 160-93.3 160-208 160z"/></svg>`;

  const svgDocComment = parser.parseFromString(svgIconComment, "image/svg+xml");
  const commentIcon = svgDocComment.documentElement;
  commentIcon.classList.add("comment-icon");
  iconContainer.appendChild(commentIcon);

  const commentNumber = document.createElement("p");
  commentNumber.classList.add("comment-number");
  commentNumber.textContent = imageData.comments.length;
  iconContainer.appendChild(commentNumber);

  // Update category filtering after adding new image
  displayByCategoriesDOM();
};

/**
 * Updates the DOM with metadata for all loaded images
 * @description Finds all category and author containers and populates them
 * with data from the state.imagesData array. Also adds category CSS classes for filtering.
 * This is called after AI metadata generation.
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

/**
 * Filters and displays images based on the currently active category
 * @function
 * @description Controls visibility of image containers based on category selection:
 * - 'All': Shows all images
 * - 'Uncategorised': Shows only images without AI-generated categories
 * - Specific category: Shows only images matching that category
 *
 * Uses CSS classes to hide/show images with smooth transitions.
 */
const displayByCategoriesDOM = () => {
  const images = Array.from(document.querySelectorAll(".image-container"));
  images.forEach((image) => {
    switch (state.activeCategory) {
      case "All":
        // Show all images
        image.classList.remove("hidden");
        break;
      case "Uncategorised":
        // Show only images without category classes
        if (
          Array.from(image.classList).some((el) => el.startsWith("category-"))
        ) {
          image.classList.add("hidden");
        } else {
          image.classList.remove("hidden");
        }
        break;
      default:
        // Show only images matching the selected category
        let imageCategory = Array.from(image.classList).find((el) =>
          el.startsWith("category-")
        );
        if (imageCategory)
          imageCategory = imageCategory.slice("category-".length);
        if (imageCategory === state.activeCategory) {
          image.classList.remove("hidden");
        } else {
          image.classList.add("hidden");
        }
    }
  });
};

/**
 * Creates and updates category filter buttons in the UI
 * @function
 * @description Dynamically generates filter buttons based on available categories:
 * 1. Removes existing category buttons
 * 2. Creates a list of unique categories from loaded images
 * 3. Generates buttons for 'All', 'Uncategorised', and each unique category
 * 4. Adds click event listeners for category switching
 * 5. Highlights the currently active category
 *
 * Features:
 * - Dynamic button generation based on available data
 * - Active state management for visual feedback
 * - Automatic category name normalization for CSS classes
 */
export const updateCategoriesDOM = () => {
  let categoryButtons = Array.from(
    document.querySelectorAll(".button-category")
  );
  const categoriesContainer = document.querySelector(".categories-container");

  // Remove existing category buttons
  categoryButtons.forEach((button) => categoriesContainer.removeChild(button));

  // Create list of all available categories
  const categoriesList = [
    "All",
    "Uncategorised",
    ...new Set(state.imagesData.map((element) => element.category)),
  ];

  // Generate button for each category
  for (const category of categoriesList) {
    const button = document.createElement("button");
    button.classList.add("button-category");
    button.classList.add(category.replaceAll(" ", "-"));
    button.textContent = category;
    // Mark active category button
    if (category.replaceAll(" ", "-") === state.activeCategory)
      button.classList.add("active");
    categoriesContainer.appendChild(button);
  }

  // Get updated button list and add event listeners
  categoryButtons = Array.from(document.querySelectorAll(".button-category"));

  /**
   * Handles category button click events
   * @param {HTMLButtonElement} button - The clicked category button
   * @description Updates active category and refreshes the display when a different
   * category button is clicked. Prevents unnecessary updates for already active buttons.
   */
  const categoryButtonsOnClick = (button) => {
    if (!button.classList.contains("active")) {
      // Remove active state from all buttons
      categoryButtons.forEach((button) => button.classList.remove("active"));
      // Set clicked button as active
      button.classList.add("active");

      // Extract category name from button classes
      const buttonCategory = Array.from(button.classList).find(
        (el) => el !== "button-category" && el !== "active"
      );
      state.activeCategory = buttonCategory;

      // Update image display based on new category
      displayByCategoriesDOM();
    }
  };

  // Add click listeners to all category buttons
  categoryButtons.forEach((button) =>
    button.addEventListener("click", (event) =>
      categoryButtonsOnClick(event.target)
    )
  );

  // Apply current category filter
  displayByCategoriesDOM();
};

/* #endregion DOM MANIPULATION */


/* ================================================================================================= */
/* #region DOM ELEMENT CREATION & REFERENCES                                                        */
/* ================================================================================================= */

/**
 * DOM ELEMENT SETUP
 * =================
 *
 * This section creates and configures all the UI elements needed for the application:
 * - Main app container reference
 * - Header container reference
 * - Load images button
 * - AI metadata generation button
 * - Status text display
 * - Loading animation dots
 * - Elapsed time timer display
 * - Interval ID for animation control
 */

/**
 * Main container for the image gallery
 * @type {HTMLElement}
 */
const appContainer = document.getElementById("app");

/**
 * Header container for UI controls
 * @type {HTMLElement}
 */
const headerContainer = document.querySelector("header");

const AIContainer = document.querySelector('.AI-container');

/**
 * Button to load more images from the API
 * @type {HTMLButtonElement}
 */
const buttonLoadImages = document.createElement("button");
buttonLoadImages.classList.add("button-load-images");
buttonLoadImages.textContent = "Load images";
AIContainer.appendChild(buttonLoadImages);

/**
 * Button to generate AI metadata for loaded images
 * @type {HTMLButtonElement}
 */
const buttonAI = document.createElement("button");
buttonAI.classList.add("button-AI");
buttonAI.textContent = "Get metadata";
AIContainer.appendChild(buttonAI);

/**
 * Text element for displaying status messages to the user
 * @type {HTMLParagraphElement}
 */
export const textAI = document.createElement("p");
textAI.classList.add("text-AI");
textAI.textContent = "";
AIContainer.appendChild(textAI);

/**
 * Element for animated loading dots
 * @type {HTMLParagraphElement}
 */
export const dotsAI = document.createElement("p");
dotsAI.classList.add("dots-AI");
dotsAI.textContent = "";
AIContainer.appendChild(dotsAI);

/**
 * Element for displaying elapsed processing time
 * @type {HTMLParagraphElement}
 * @description Shows real-time elapsed time during AI metadata generation
 * to provide users with feedback on processing duration
 */
export const timerAI = document.createElement("p");
timerAI.classList.add("timer-AI");
timerAI.textContent = "";
AIContainer.appendChild(timerAI);



/* ================================================================================================= */
/* #region EVENT LISTENERS                                                                           */
/* ================================================================================================= */

/**
 * EVENT LISTENER SETUP
 * ====================
 *
 * This section configures all user interaction event handlers for the application.
 * Each button has specific functionality and proper state management.
 */

/**
 * Load Images Button Event Listener
 * @description Triggers the fetchImages function to load the next page of images
 * from the API. Supports pagination through the global pagesLoadedCounter.
 * Also provides user feedback when new images are loaded.
 */
buttonLoadImages.addEventListener("click", () => {
  fetchImages();
  textAI.textContent = "More images loaded 🖼️";
});

/**
 * AI Metadata Button Event Listener
 * @description Triggers AI metadata generation for images that don't have metadata yet.
 * Includes button state management to prevent multiple simultaneous requests.
 * The getImageMetadata() function is imported from the modular gemeni-api.js file.
 *
 * Features:
 * - Disables button during processing to prevent duplicate requests
 * - Calls modular AI functionality from separated gemeni-api.js module
 * - Async handling with proper error management
 * - Re-enables button after completion (success or failure)
 * - Integrates with timer and loading animation systems
 */
buttonAI.addEventListener("click", async () => {
  buttonAI.disabled = true; // Disable button during processing
  await getImageMetadata(); // Generate metadata with AI
  buttonAI.disabled = false; // Re-enable button when complete
});

/* #endregion EVENT LISTENERS  */


/* ================================================================================================= */
/* #region APPLICATION INITIALIZATION                                                                */
/* ================================================================================================= */

/**
 * APPLICATION STARTUP
 * ===================
 *
 * Initialize the application by loading the first set of images and setting up
 * the category filtering system. This provides immediate content for users when
 * the page loads and establishes the filtering interface.
 */

// Load initial set of images on application start
fetchImages();
// Initialize category filter buttons (starts with just 'All' and 'Uncategorised')
updateCategoriesDOM();

/* #endregion APPLICATION INITIALIZATION */

/**
 * =====================================================================================================
 * END OF FILE
 * =====================================================================================================
 *
 * This completes the main application file for the image gallery with AI-powered metadata generation.
 * The application now features a fully modular architecture with separated concerns.
 *
 * Key Features Implemented:
 * ✅ Dynamic image loading with pagination
 * ✅ Modular Google Gemini AI integration (via gemeni-api.js)
 * ✅ Interactive UI with hover overlays and social elements
 * ✅ Category-based filtering system with dynamic button generation
 * ✅ Error handling and loading states
 * ✅ Responsive design with CSS Grid
 * ✅ State management for images and metadata
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
 * Module Dependencies:
 * - ./gemeni-api.js: Handles all Gemini AI functionality, API calls, and utilities
 * - ./style.css: Comprehensive styling for gallery, animations, and responsive design
 * - Environment: VITE_GEMINI_API_KEY for AI functionality
 * - External API: https://image-feed-api.vercel.app/ for image data
 *
 * Core Functions in this file:
 * - createImage(): DOM creation for image containers with social elements
 * - updateImagesDOM(): Gallery rendering and category filtering
 * - updateCategoriesDOM(): Dynamic category button management
 * - fetchImages(): API integration for image loading
 * - Event listeners: User interaction handling
 *
 * AI Functionality (in gemeni-api.js):
 * - getImageMetadata(): AI metadata generation using Gemini 2.5 Pro
 * - ellipsisAnimation(): Loading animation management
 * - stopEllipsisAnimation(): Animation cleanup
 * - Timer functionality: Real-time processing feedback
 * - Error handling: Comprehensive AI API error management
 *
 * Modular Architecture Benefits:
 * ✅ Clear separation of concerns (UI logic vs AI logic)
 * ✅ Improved code organization and maintainability
 * ✅ Enhanced error handling and user feedback
 * ✅ Reusable AI functionality across projects
 * ✅ Easier testing and debugging
 * ✅ Better code readability and documentation
 */
