/**
 * GOOGLE GEMINI AI MODULE
 * =======================
 *
 * Dedicated module for Google's Gemini AI API integration and metadata generation.
 * This module is part of a four-module architecture that separates AI functionality
 * from UI logic, external API calls, and category management for better code organization.
 *
 * Module Responsibilities:
 * - Google Gemini AI API integration and configuration
 * - Image metadata generation (categories, descriptions, author names)
 * - Loading animations and real-time timer functionality
 * - AI response processing and validation
 * - Error handling for AI operations
 * - State management integration through imports
 * - UI element creation and event handling for AI controls
 *
 * Features:
 * - Structured JSON output with schema validation
 * - Real-time processing feedback with animated indicators
 * - Comprehensive error handling and user feedback
 * - Integration with centralized state management
 * - Base64 image processing for AI analysis
 * - Thinking budget configuration for enhanced AI performance
 * - Dynamic import loading for Google AI SDK
 * - Self-contained UI controls and event listeners
 *
 * Required dependencies:
 * - npm install @google/genai mime
 * - npm install -D @types/node
 * - Environment: VITE_GEMINI_API_KEY
 *
 * Module Architecture:
 * - Imports: state from main.js, category functions, and API functions
 * - Exports: getImageMetadata, ellipsisAnimation, stopEllipsisAnimation, textAI, dotsAI, timerAI
 * - Integration: Works seamlessly with four-module system
 *
 * @author Group 4
 * @version 1.6.0 - Four-module architecture with self-contained AI controls
 */

// ===== MODULE IMPORTS =====
// Import centralized state management object for AI processing and data updates
import { state } from './main.js'

// Import UI update functions for DOM manipulation after AI processing
import { updateImagesDOM } from './main.js'

// Import category management functions from specialized image-categories module
import { displayByCategoriesDOM, updateCategoriesDOM } from './image-categories.js';

// Import API functionality for additional image loading capability
// import { fetchImages } from './api.js';

// Dynamic imports for Google AI SDK (loaded when needed)
// import { GoogleGenAI, Type } from "@google/genai" - loaded dynamically




/**
 * Google Gemini AI API Key
 * @constant {string}
 * @description API key for Google Gemini AI service loaded from environment variables.
 * This is properly isolated in this AI module, separate from UI and external API logic.
 * Ensures secure handling of API credentials within the dedicated AI functionality module.
 */
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

/**
 * Interval ID for controlling the loading animation
 * @type {number|null}
 */
let intervalId = null;

/**
 * Dynamic Google AI SDK variables
 * @description These are loaded dynamically when needed to optimize initial bundle size.
 * The SDK is imported only when getImageMetadata() is first called.
 * @type {Object|undefined} GoogleGenAI - Main Google AI SDK class
 * @type {Object|undefined} Type - Schema type definitions for structured output
 */
let GoogleGenAI, Type;

/**
 * Starts the animated ellipsis loading indicator with timer
 * @function
 * @description Creates a visual loading animation by cycling through
 * different numbers of dots (0-3) every 500ms. Also displays an elapsed
 * time counter to show users how long the AI processing has been running.
 *
 * Features:
 * - Animated dots cycling every 500ms
 * - Real-time elapsed time display in seconds
 * - Provides user feedback during long AI operations
 */
export const ellipsisAnimation = () => {
  let count = 0;
  const timerStart = Date.now();
  let timerNow;
  intervalId = setInterval(() => {
    count = (count + 1) % 4;
    dotsAI.textContent = ".".repeat(count);
    timerNow = Math.floor((Date.now() - timerStart) / 1000);
    timerAI.textContent = `${timerNow}s elapsed`;
  }, 500);
};

/**
 * Stops the ellipsis animation and clears all loading indicators
 * @function
 * @description Clears the interval timer and resets both the dots display
 * and elapsed timer. Called when AI processing completes or fails.
 */
export const stopEllipsisAnimation = () => {
  clearInterval(intervalId);
  intervalId = null;
  dotsAI.textContent = "";
  timerAI.textContent = "";
};

/**
 * Updates the global state.imagesData array with new metadata from AI
 * @param {Array<Object>} newMetadata - Array of metadata objects from Gemini AI
 * @description Finds images without metadata and assigns the AI-generated data
 * to them in sequence. Only updates images that don't already have category data.
 */
const updateImagesData = (newMetadata) => {
  let i = 0;
  for (const oneImageData of state.imagesData) {
    // Skip images that already have metadata
    if (oneImageData.category) {
      continue;
    } else {
      // Assign new metadata to image without category
      Object.assign(oneImageData, newMetadata[i]);
      i++;
    }
  }
};

/**
 * Fetches and processes images for AI analysis
 * @async
 * @function
 * @returns {Promise<Array<Object>>} Array of processed image objects with base64 data
 * @description Processes images that don't have metadata yet by:
 * 1. Filtering images without categories
 * 2. Fetching each image URL
 * 3. Converting to base64 format for AI processing
 * 4. Validating MIME types
 * 5. Error handling for failed conversions
 *
 * @throws {Error} When image fetch fails or invalid content type
 */
const fetchImagesFromUrl = async () => {
  // Filter images that need metadata generation
  const imagesToFetch = state.imagesData.filter(
    (oneImageData) => !oneImageData.category
  );
  const imageUrls = imagesToFetch.map((oneImageData) => oneImageData.image_url);
  const processedImages = [];

  // Process each image URL
  for (const url of imageUrls) {
    try {
      // Fetch the image from URL
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch image: Status ${response.status} ${response.statusText}`
        );
      }

      // Validate MIME type to ensure it's an image
      const mimeType = response.headers.get("content-type");
      if (!mimeType || !mimeType.startsWith("image/")) {
        throw new Error(
          `Invalid content type: ${
            mimeType || "none"
          }. URL must point to an image.`
        );
      }

      // Convert image to ArrayBuffer
      const arrayBuffer = await response.arrayBuffer();

      // Convert ArrayBuffer to Base64 string for AI processing
      const uint8Array = new Uint8Array(arrayBuffer);
      let byteString = "";
      uint8Array.forEach((byte) => {
        byteString += String.fromCharCode(byte);
      });

      // Encode to Base64
      const base64Data = btoa(byteString);

      processedImages.push({ mimeType, base64Data });
    } catch (error) {
      console.error(`Error processing image ${url}:`, error);
      // Continue processing other images even if one fails
    }
  }

  return processedImages;
};


/**
 * Generates AI metadata for images using Google Gemini API
 * @async
 * @function
 * @description Main function that orchestrates the AI metadata generation process:
 * 1. Fetches and processes images that need metadata
 * 2. Configures Gemini AI with proper schema and instructions
 * 3. Sends processed images to AI for analysis
 * 4. Parses and validates the AI response
 * 5. Updates the application data and DOM with new metadata
 *
 * Features:
 * - Loading animations and user feedback
 * - Error handling and validation
 * - Prevents duplicate processing of images
 * - Structured JSON output with category, description, and author
 *
 * @throws {Error} When image processing or AI generation fails
 */
export const getImageMetadata = async () => {
  let initialArrayLength;
  let imageParts = [];

  try {
    if (!GoogleGenAI || !Type) {
      // Import Google Gemini AI SDK for API integration
      const module = await import("@google/genai");
      GoogleGenAI = module.GoogleGenAI;
      Type = module.Type;
    }   
  } catch (err) {
    console.error("Error initialising google AI libraries:", err.message);
    textAI.textContent = "🚨 Error initialising google AI libraries 🚨";
  }

  try {
    // Start loading animation and user feedback
    textAI.textContent = "Fetching multiple images from API";
    ellipsisAnimation();

    // Process images that don't have metadata yet
    const processedImages = await fetchImagesFromUrl();
    initialArrayLength = processedImages.length;

    // Check if there are any images to process
    if (initialArrayLength === 0) {
      textAI.textContent = "All image metadata is already loaded.";
      stopEllipsisAnimation();
      return;
    }

    // Prepare image data for AI processing
    imageParts = processedImages.map(({ mimeType, base64Data }) => ({
      inlineData: {
        mimeType: mimeType,
        data: base64Data,
      },
    }));

    // Final validation before AI request
    if (imageParts.length === 0) {
      throw new Error("No images were successfully processed");
    }
  } catch (err) {
    console.error("Error fetching images:", err.message);
    textAI.textContent = "🚨 Error fetching images 🚨";
    stopEllipsisAnimation();
    return;
  }

  stopEllipsisAnimation();
  ellipsisAnimation();

  // Initialize Google Gemini AI
  const ai = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
  });

  // Configure AI generation parameters
  const config = {
    thinkingConfig: {
      thinkingBudget: -1, // No limit on thinking time
    },
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: ["category", "description", "authorName"],
        properties: {
          category: {
            type: Type.STRING,
          },
          description: {
            type: Type.STRING,
          },
          authorName: {
            type: Type.STRING,
          },
        },
      },
    },
    systemInstruction: [
      {
        text: `generate structured output based on images: for each image provide category, description of the image and a random full name (as 'authorName')`,
      },
    ],
  };

  // Use Gemini 2.5 Pro model (supports vision)
  const model = "gemini-2.5-pro";

  // Prepare the content for AI analysis
  const contents = [
    {
      role: "user",
      parts: [
        {
          text: `Analyze the attached images and provide the requested JSON fields for each image in an array format.`,
        },
        ...imageParts, // Spread all processed images
      ],
    },
  ];

  try {
    // Update user on AI processing status
    textAI.textContent = "Generating metadata with Gemini for multiple images";

    // Send request to Gemini AI
    const response = await ai.models.generateContent({
      model,
      config,
      contents,
    });

    // Parse and validate AI response
    const metadata = JSON.parse(response.text);
    console.log(`Generated metadata for ${metadata.length} images`);

    // Validate response matches expected count
    if (metadata.length !== initialArrayLength) {
      textAI.textContent = "🚨 Error: Some metadata has been lost 🚨";
    } else {
      // Success: update application data and UI
      console.log(metadata);
      updateImagesData(metadata);
      console.log(state.imagesData);
      updateImagesDOM();
      updateCategoriesDOM();
    }
  } catch (err) {
    console.error("Error generating content:", err);
    textAI.textContent = "🚨 Error generating content 🚨";
    stopEllipsisAnimation();
    return;
  }

  // Success message and cleanup
  textAI.textContent = "🎉 Metadata generation: success! 🎉";
  stopEllipsisAnimation();
};

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


const AIContainer = document.querySelector('.AI-container');

/**
 * Button to load more images from the API
 * @type {HTMLButtonElement}
 */
const buttonLoadImages = document.querySelector(".button-load-images");

/**
 * Button to generate AI metadata for loaded images
 * @type {HTMLButtonElement}
 */
const buttonAI = document.querySelector(".button-AI");

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

/**
 * =====================================================================================================
 * END OF GEMINI AI MODULE
 * =====================================================================================================
 *
 * This completes the dedicated Google Gemini AI integration module for the image gallery application.
 * This module is a key component of the four-module architecture, handling all AI-related functionality.
 *
 * MODULE EXPORTS:
 * ✅ getImageMetadata() - Main AI metadata generation function
 * ✅ ellipsisAnimation() - Loading animation starter with timer
 * ✅ stopEllipsisAnimation() - Animation cleanup and reset
 * ✅ textAI, dotsAI, timerAI - DOM elements for user feedback (self-contained)
 *
 * MODULE IMPORTS:
 * - state (main.js): Centralized application state management
 * - updateImagesDOM() (main.js): UI update function for gallery rendering
 * - displayByCategoriesDOM(), updateCategoriesDOM() (image-categories.js): Category management
 * - fetchImages() (api.js): External API functionality for additional image loading
 *
 * CORE FUNCTIONALITY:
 * 🤖 AI Integration:
 *    - Google Gemini 2.5 Pro model with vision capabilities
 *    - Dynamic SDK loading for optimized performance
 *    - Structured JSON output with schema validation
 *    - Thinking budget configuration for enhanced performance
 *    - Base64 image processing and MIME type validation
 *
 * 🎭 User Experience:
 *    - Self-contained UI controls and event listeners
 *    - Real-time loading animations with dot cycling
 *    - Elapsed time counter for processing feedback
 *    - Comprehensive error handling with user-friendly messages
 *    - Success/failure status indicators
 *
 * 🔄 State Integration:
 *    - Seamless integration with centralized state management
 *    - Automatic UI updates after successful AI processing
 *    - Category system updates with new metadata
 *    - Image data enrichment with AI-generated content
 *
 * 🏗️ MODULAR ARCHITECTURE BENEFITS:
 * ✅ Separation of AI logic from UI, API, and category concerns
 * ✅ Self-contained UI controls for complete AI functionality
 * ✅ Reusable AI functionality across different projects
 * ✅ Isolated error handling specific to AI operations
 * ✅ Independent testing and debugging of AI features
 * ✅ Clean API surface with focused exports
 * ✅ Secure API key management within dedicated module
 * ✅ Dynamic loading for optimal performance
 *
 * INTEGRATION WITH OTHER MODULES:
 * - main.js: Provides state management and core UI update functions
 * - image-categories.js: Handles category filtering and button management
 * - api.js: Works in parallel for external image data fetching
 * - style.css: Styles the loading animations and feedback elements
 *
 * This module exemplifies clean architecture principles with focused responsibilities,
 * clear interfaces, and seamless integration with the broader four-module application ecosystem.
 */




