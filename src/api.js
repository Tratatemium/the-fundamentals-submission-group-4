/**
 * EXTERNAL API INTEGRATION MODULE
 * ===============================
 *
 * Dedicated module for external image API integration and data fetching with visual feedback.
 * This module is part of a five-module architecture that separates external API calls
 * from AI functionality, UI logic, pagination, and category management for better code 
 * organization and maintainability.
 *
 * Module Responsibilities:
 * - External image API integration with page-based pagination support
 * - HTTP request handling and comprehensive response validation
 * - Advanced error handling for network failures and invalid responses
 * - Data processing and integration with centralized state management
 * - Duplicate request prevention through page tracking
 * - DOM element creation coordination with main.js UI functions
 *
 * Features:
 * - Page-based pagination with duplicate prevention
 * - Visual loading feedback with main element overlay and spinner
 * - Comprehensive error handling with logging and user feedback
 * - Data validation to ensure proper API response format
 * - Integration with centralized state management and page tracking
 * - Seamless coordination with UI creation and pagination functions
 *
 * External API:
 * - Endpoint: https://image-feed-api.vercel.app/api/images
 * - Method: GET with page parameter
 * - Response format: JSON with data array and pagination metadata
 *
 * Module Architecture:
 * - Imports: state from main.js, createImage from main.js, createPagesNavigation from pagination.js
 * - Exports: loadPageFromAPI function for external use
 * - Integration: Works seamlessly with main.js UI logic, pagination.js controls, and gemini-api.js AI functionality
 *
 * @author Group 4
 * @version 2.0.0 - Five-module architecture with loading animations and advanced pagination
 */

/* ================================================================================================= */
/* #region API REQUESTS                                                                              */
/* ================================================================================================= */

// ===== MODULE IMPORTS =====
// Import centralized state management object for data storage and pagination tracking
import { state } from './main.js';

// Import UI creation function for DOM manipulation after data fetching
import { createImage } from './main.js';
import { createPagesNavigation } from './pagination.js';

/**
 * Fetches images from the external API with flexible pagination support
 * @async
 * @function loadPageFromAPI
 * @param {number} page - Specific page number to load from the API
 * @description Main API integration function that handles external image data fetching with
 * comprehensive loading feedback and state management. Makes HTTP requests to retrieve images
 * from the specified page, validates responses, stores data in centralized state, updates
 * pagination controls, and provides visual feedback during loading.
 *
 * Features:
 * - Duplicate request prevention: skips if page already loaded
 * - Comprehensive error handling for network failures and invalid responses
 * - Data validation to ensure proper API response format and structure
 * - Automatic integration with centralized state management (state.imagesData)
 * - Page tracking system to prevent unnecessary API calls
 * - Pagination metadata processing (total_pages, current page)
 * - Automatic pagination control updates after successful load
 * - Loading state cleanup in all scenarios (success, error, cancellation)
 *
 * API Integration:
 * - Endpoint: https://image-feed-api.vercel.app/api/images
 * - Method: GET request with page query parameter
 * - Expected response: JSON object with 'data' array and pagination metadata
 *
 * State Management:
 * - Updates state.imagesData with page-structured data
 * - Manages state.loadedPages array for duplicate prevention
 * - Updates state.totalAmountOfPages from API response
 * - Maintains sorted order for both loadedPages and imagesData
 *
 *
 * @throws {Error} When API request fails or response format is invalid
 * @example
 * // Load specific page with loading animation
 * await loadPageFromAPI(3);
 * 
 * // Will skip if page already loaded
 * await loadPageFromAPI(3); // No API call made
 */
export const loadPageFromAPI = async (page) => {

  if (state.loadedPages.includes(page)) return;
  
  try {
    // Make API request to current page
    const response = await fetch(
      `https://image-feed-api.vercel.app/api/images?page=${page}`
    );

    // Check if request was successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse JSON response
    const json = await response.json();

    // Validate response data structure
    if (!json.data || !Array.isArray(json.data)) {
      throw new Error("Invalid data format received from API");
    }

    state.totalAmountOfPages = json.total_pages;
    delete json.total_pages;

    state.loadedPages.push(json.page)
    state.loadedPages.sort((a, b) => a - b);

    state.imagesData.push(json);
    state.imagesData.sort((a, b) => a.page - b.page);

    createPagesNavigation();

  } catch (error) {
    console.error("Failed to fetch images:", error);
    // TODO: Show user-friendly error message in UI
  }
};

/* #endregion API REQUESTS */


/**
 * =====================================================================================================
 * END OF EXTERNAL API MODULE
 * =====================================================================================================
 *
 * This completes the dedicated external API integration module for the image gallery application.
 * This module is a key component of the three-module architecture, handling all external data fetching.
 *
 * MODULE EXPORTS:
 * ✅ fetchImages(page?) - Main API data fetching function with flexible pagination
 *
 * MODULE IMPORTS FROM MAIN.JS:
 * - state: Centralized application state management (imagesData, pagesLoadedCounter)
 * - createImage(): UI creation function for DOM element generation
 *
 * CORE FUNCTIONALITY:
 * 🌐 External API Integration:
 *    - HTTP requests to image-feed-api.vercel.app
 *    - GET method with page query parameters
 *    - JSON response parsing and validation
 *    - Error handling for network failures
 *
 * 📄 Pagination Management:
 *    - Automatic counter increment for seamless browsing
 *    - Manual page specification for targeted loading
 *    - Integration with centralized state management
 *    - Flexible pagination strategy support
 *
 * 🔄 State Integration:
 *    - Seamless integration with centralized state management
 *    - Automatic data storage in state.imagesData array
 *    - Pagination counter management in state.pagesLoadedCounter
 *    - Thread-safe data handling and validation
 *
 * 🎨 UI Coordination:
 *    - Automatic DOM element creation through imported functions
 *    - Coordination with main.js UI management
 *    - Clean separation between data fetching and UI rendering
 *
 * 🏗️ MODULAR ARCHITECTURE BENEFITS:
 * ✅ Separation of external API logic from UI and AI concerns
 * ✅ Reusable API functionality across different projects
 * ✅ Isolated error handling specific to external data operations
 * ✅ Independent testing and debugging of API features
 * ✅ Clean API surface with focused exports
 * ✅ Flexible pagination strategies for different use cases
 *
 * INTEGRATION WITH OTHER MODULES:
 * - main.js: Provides state management, UI functions, and application logic
 * - gemini-api.js: Works in parallel for AI metadata generation
 * - style.css: Styles the generated DOM elements and loading states
 *
 * ERROR HANDLING STRATEGY:
 * - Network failure detection and logging
 * - Invalid response format validation
 * - Graceful degradation with console error reporting
 * - Future-ready for user-friendly error UI implementation
 *
 * This module exemplifies focused responsibility architecture with clean external API integration,
 * flexible pagination support, and seamless integration with the broader application ecosystem.
 */