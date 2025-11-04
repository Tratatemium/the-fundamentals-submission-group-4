// ===== MODULE IMPORTS =====
// Import centralized state management object for data storage and pagination tracking
import { state } from './main.js'


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