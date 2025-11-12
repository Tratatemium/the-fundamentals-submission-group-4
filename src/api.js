/**
 * API INTEGRATION MODULE
 * ======================
 * 
 * External image API integration with loading animations
 * Handles page-based data fetching and state management
 */

import { state } from './main.js';
import { createPagesNavigation } from './pagination.js';

/* ================================================================================================= */
/* #region API FUNCTIONS                                                                            */
/* ================================================================================================= */

/**
 * Fetches images from external API with duplicate prevention and loading feedback
 * @param {number} page - The page number to fetch from the API
 * @returns {Promise<void>} Promise that resolves when page data is loaded and processed
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
    alert(`🚨 Failed to fetch images: ${error}`);
  }
};

/**
 * Updates like count for an image via API
 * @param {string} ID - The image ID to update likes for
 * @param {string} method - The HTTP method ('POST' or 'DELETE')
 * @returns {Promise<void>} Promise that resolves when like update is complete
 */
export const updateLikesAPI = async (ID, method) => {
  if (method !== 'DELETE' && method !== 'POST') {
    console.log("🚨 Error in updateLikesAPI() - bad argument.");
    return;
  }

  try {
    const response = await fetch(`https://image-feed-api.vercel.app/api/images/${ID}/like`, {
      method: method,
    });

    // Check if request was successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    console.log(json);

  } catch (error) {
    console.error("Failed to update likes on server:", error);
    alert(`🚨 Failed to update likes on server: ${error}`);
  }
};

/* #endregion API FUNCTIONS */


