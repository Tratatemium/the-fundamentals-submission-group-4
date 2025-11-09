/**
 * External image API integration with loading animations
 * Handles page-based data fetching and state management
 */

// Import state management, UI functions, and pagination
import { state } from './main.js';
import { createImage } from './main.js';
import { createPagesNavigation } from './pagination.js';

// Fetches images from external API with duplicate prevention and loading feedback
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


