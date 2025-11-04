/* ================================================================================================= */
/* #region API REQUESTS                                                                              */
/* ================================================================================================= */

// Import variables
import { state } from './main.js'
// Import functions
import { createImage } from './main.js'

/**
 * Fetches images from the external API with pagination support
 * @async
 * @function
 * @description Makes an API request to retrieve images from the current page,
 * validates the response, stores the data, creates DOM elements for each image,
 * and increments the page counter for the next load.
 *
 * Features:
 * - Error handling for network failures and invalid responses
 * - Data validation to ensure proper API response format
 * - Automatic page counter increment for pagination
 * - Integration with global state.imagesData array
 *
 * @throws {Error} When API request fails or response format is invalid
 */
export const fetchImages = async () => {
  try {
    // Make API request to current page
    const response = await fetch(
      `https://image-feed-api.vercel.app/api/images?page=${state.pagesLoadedCounter}`
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

    // Store data and create DOM elements
    state.imagesData.push(...json.data);
    json.data.forEach((item) => createImage(item));

    // Increment counter for next page load
    state.pagesLoadedCounter++;
  } catch (error) {
    console.error("Failed to fetch images:", error);
    // TODO: Show user-friendly error message in UI
  }
};

/* #endregion API REQUESTS */