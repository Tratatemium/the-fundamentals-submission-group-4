/**
 * IMAGE CATEGORY MANAGEMENT MODULE
 * ===============================
 *
 * Dedicated module for category filtering and UI management functionality.
 * This module is part of a four-module architecture that separates category logic
 * from core UI, AI functionality, and external API calls for better code organization.
 *
 * Module Responsibilities:
 * - Category-based image filtering and visibility management
 * - Dynamic category button generation and updates
 * - Active category state handling and synchronization
 * - Category-specific CSS class management
 * - User interaction handling for category switching
 *
 * Features:
 * - Dynamic category detection from loaded image data
 * - Smooth transitions for image show/hide operations
 * - Automatic button generation based on available categories
 * - Active state management with visual feedback
 * - Integration with centralized state management
 * - CSS class normalization for filtering functionality
 *
 * Category Types:
 * - 'All': Shows all loaded images regardless of category
 * - 'Uncategorised': Shows only images without AI-generated categories
 * - Dynamic categories: Shows images matching specific AI-generated categories
 *
 * Module Architecture:
 * - Imports: state object from main.js for centralized state management
 * - Exports: displayByCategoriesDOM, updateCategoriesDOM functions
 * - Integration: Works seamlessly with main.js UI logic and gemeni-api.js AI processing
 *
 * @author Group 4
 * @version 1.6.0 - Specialized category management in four-module architecture
 */

// ===== MODULE IMPORTS =====
// Import centralized state management object for category state and image data access
import { state } from './main.js'


/**
 * Filters and displays images based on the currently active category
 * @function displayByCategoriesDOM
 * @description Controls visibility of image containers based on category selection using CSS classes.
 * This function implements the core filtering logic that determines which images are visible
 * based on the current category state. It uses efficient DOM manipulation to show/hide images
 * with smooth CSS transitions.
 *
 * Category Filtering Logic:
 * - 'All': Shows all images by removing 'hidden' class from all containers
 * - 'Uncategorised': Shows only images without AI-generated category classes
 * - Specific category: Shows only images with matching category CSS classes
 *
 * Technical Implementation:
 * - Queries all image containers using .image-container selector
 * - Uses switch statement for efficient category matching
 * - Leverages CSS classes for category identification (category-*)
 * - Applies/removes 'hidden' CSS class for smooth show/hide transitions
 *
 * Integration:
 * - Reads from state.activeCategory for current filter state
 * - Works with CSS classes added by updateImagesDOM() in main.js
 * - Supports dynamic updates when category buttons are clicked
 *
 * @example
 * // Called automatically when category buttons are clicked
 * // or when new images are added to maintain current filter
 * displayByCategoriesDOM();
 */
export const displayByCategoriesDOM = () => {
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
 * @function updateCategoriesDOM
 * @description Dynamically generates and manages category filter buttons based on available image data.
 * This function implements the complete category button lifecycle including creation, event handling,
 * and state synchronization. It automatically adapts to new categories as AI metadata is generated.
 *
 * Button Generation Process:
 * 1. Removes existing category buttons to prevent duplicates
 * 2. Extracts unique categories from state.imagesData array
 * 3. Creates standardized button list with 'All' and 'Uncategorised' defaults
 * 4. Generates DOM buttons with proper CSS classes and text content
 * 5. Applies active state to currently selected category
 * 6. Attaches click event listeners for user interaction
 * 7. Triggers initial category filtering display
 *
 * Features:
 * - Dynamic button generation based on available data
 * - Automatic category extraction from AI-generated metadata
 * - CSS class normalization (spaces to hyphens) for styling consistency
 * - Active state management with visual feedback
 * - Event delegation for efficient click handling
 * - Integration with centralized state management
 *
 * UI Integration:
 * - Requires .categories-container element in DOM
 * - Generates buttons with .button-category CSS class
 * - Applies category-specific CSS classes for styling
 * - Manages 'active' class for visual state indication
 *
 * State Management:
 * - Reads from state.imagesData for category detection
 * - Updates state.activeCategory when buttons are clicked
 * - Maintains synchronization between UI and application state
 *
 * @example
 * // Called after AI metadata generation or initial app load
 * updateCategoriesDOM();
 * 
 * // Automatically creates buttons for categories like:
 * // ['All', 'Uncategorised', 'Nature', 'Architecture', 'People']
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

/**
 * =====================================================================================================
 * END OF IMAGE CATEGORY MANAGEMENT MODULE
 * =====================================================================================================
 *
 * This completes the dedicated category management module for the image gallery application.
 * This module is a key component of the four-module architecture, handling all category-related functionality.
 *
 * MODULE EXPORTS:
 * ✅ displayByCategoriesDOM() - Core category filtering and image visibility management
 * ✅ updateCategoriesDOM() - Dynamic category button generation and event handling
 *
 * MODULE IMPORTS FROM MAIN.JS:
 * - state: Centralized application state management (imagesData, activeCategory)
 *
 * CORE FUNCTIONALITY:
 * 🏷️ Category Detection:
 *    - Automatic extraction of unique categories from AI-generated metadata
 *    - Support for dynamic category lists that grow with new AI data
 *    - Handling of default categories ('All', 'Uncategorised')
 *    - Category name normalization for CSS class compatibility
 *
 * 🎛️ UI Management:
 *    - Dynamic button generation based on available data
 *    - CSS class-based image filtering with smooth transitions
 *    - Active state management with visual feedback
 *    - Event handling for user category selection
 *
 * 🔄 State Integration:
 *    - Seamless integration with centralized state management
 *    - Real-time synchronization between UI and application state
 *    - Automatic updates when new images or categories are added
 *    - Persistent category selection across application operations
 *
 * 🎨 Visual Features:
 *    - Smooth show/hide transitions using CSS classes
 *    - Active button highlighting for clear user feedback
 *    - Responsive category button layout
 *    - Consistent styling integration with main application
 *
 * 🏗️ MODULAR ARCHITECTURE BENEFITS:
 * ✅ Separation of category logic from core UI and business logic
 * ✅ Reusable filtering functionality across different projects
 * ✅ Isolated event handling specific to category operations
 * ✅ Independent testing and debugging of category features
 * ✅ Clean API surface with focused, single-purpose exports
 * ✅ Scalable architecture for additional filtering features
 *
 * INTEGRATION WITH OTHER MODULES:
 * - main.js: Provides state management and calls updateCategoriesDOM()
 * - gemeni-api.js: Triggers category updates after AI metadata generation
 * - api.js: Works in parallel for image loading, categories update automatically
 * - style.css: Provides styling for category buttons and image transitions
 *
 * CSS DEPENDENCIES:
 * - .categories-container: Container element for category buttons
 * - .button-category: Base styling for category filter buttons
 * - .active: Styling for currently selected category button
 * - .hidden: CSS class for hiding filtered images
 * - .image-container: Target containers for filtering operations
 *
 * EVENT HANDLING STRATEGY:
 * - Click event delegation for efficient button management
 * - State synchronization on every category change
 * - Automatic display refresh after category selection
 * - Prevention of unnecessary updates for already active categories
 *
 * PERFORMANCE CONSIDERATIONS:
 * - Efficient DOM querying using modern selectors
 * - Minimal DOM manipulation during filtering operations
 * - CSS-based transitions for smooth visual effects
 * - Event listener cleanup and re-attachment during updates
 *
 * This module exemplifies focused responsibility architecture with specialized category management,
 * providing a clean, efficient, and user-friendly filtering system that integrates seamlessly
 * with the broader four-module application ecosystem.
 */