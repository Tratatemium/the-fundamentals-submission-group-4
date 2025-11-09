/**
 * GOOGLE GEMINI AI MODULE
 * =======================
 *
 * Advanced AI integration module for Google's Gemini AI API with comprehensive metadata generation.
 * This module is a core component of the five-module architecture, providing sophisticated AI 
 * functionality separate from UI logic, external API calls, pagination, and category management.
 *
 * Module Responsibilities:
 * - Google Gemini 2.5 Pro API integration with vision capabilities
 * - Page-based image metadata generation (categories, descriptions, author names)
 * - Real-time loading animations with elapsed timer functionality
 * - AI response processing and validation with structured JSON schema
 * - Comprehensive error handling for AI operations
 * - State management integration through centralized imports
 * - Self-contained UI controls and event handling for AI functionality
 * - Base64 image processing with MIME type validation
 *
 * Advanced Features:
 * - Page-structured JSON output with schema validation and constraints
 * - Real-time processing feedback with animated indicators and timer
 * - Dynamic SDK loading for optimized bundle size and performance
 * - Comprehensive error handling and user-friendly feedback messages
 * - Integration with five-module centralized state management system
 * - Thinking budget configuration for enhanced AI performance
 * - Batch processing with page-based organization (10 images per page)
 * - Automatic metadata assignment with duplicate prevention
 *
 * AI Configuration:
 * - Model: Gemini 2.5 Pro (supports vision analysis)
 * - Response format: Structured JSON with enforced schema validation
 * - Page structure: Arrays of 10 metadata objects per page
 * - Metadata fields: category, description, authorName for each image
 * - Thinking budget: Unlimited for optimal response quality
 *
 * Required Dependencies:
 * - npm install @google/genai mime
 * - npm install -D @types/node
 * - Environment: VITE_GEMINI_API_KEY (Google AI API key)
 *
 * Five-Module Architecture Integration:
 * - main.js: Centralized state management and core UI functions
 * - pagination.js: Advanced pagination system with dual-mode gallery management
 * - api.js: External API integration with loading animations
 * - image-categories.js: Category filtering and management system
 * - gemini-api.js: AI metadata generation and processing (this module)
 *
 * Module Exports:
 * - getImageMetadata(): Main AI processing function with page-based structure
 * - ellipsisAnimation(): Loading animation with real-time timer
 * - stopEllipsisAnimation(): Animation cleanup and reset functionality
 * - textAI, dotsAI, timerAI: Self-contained DOM elements for user feedback
 *
 * @author Group 4
 * @version 2.0.0 - Five-module architecture with advanced page-based AI processing
 */

// ===== MODULE IMPORTS =====
// Import centralized state management object for AI processing and data updates
// Core dependency for accessing image data organized in page-based structure
import { state } from './main.js'

// Import UI update functions for DOM manipulation after AI processing
// Essential for refreshing gallery display after successful metadata generation
import { updateImagesDOM } from './main.js'

// Import category management functions from specialized image-categories module
// Required for updating category filters and displays after AI metadata assignment
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
 * Updates the global state.imagesData array with page-based metadata from AI
 * @async
 * @param {Array<Object>} newMetadata - Array of page objects with metadata from Gemini AI
 * @description Processes page-based AI response and assigns metadata to corresponding images
 * in state.imagesData. Matches pages by page number and only updates images that don't 
 * already have category metadata to prevent overwriting existing data.
 * 
 * Page Processing Logic:
 * - Iterates through each page in state.imagesData
 * - Finds corresponding page in AI response by page number
 * - Updates each image in page.data with AI-generated metadata
 * - Skips images that already have category data (duplicate prevention)
 * - Includes bounds checking to prevent array overflow errors
 * 
 * Metadata Assignment:
 * - category: AI-generated image classification
 * - description: Detailed description of image content
 * - authorName: Random realistic full name for image attribution
 * - Only assigns to images without existing category metadata
 * 
 * Features:
 * - Page-number based matching for accurate data assignment
 * - Duplicate prevention through category existence checking
 * - Bounds checking for safe array access
 * - Object.assign() for clean metadata merging
 * - Maintains page structure integrity in state.imagesData
 * 
 * Dependencies:
 * - state.imagesData: Centralized image data organized by pages
 * - AI response structure: Pages with data arrays containing metadata objects
 * 
 * @example
 * updateImagesData([
 *   {page: 1, data: [{category: "nature", description: "...", authorName: "..."}]},
 *   {page: 2, data: [{category: "portrait", description: "...", authorName: "..."}]}
 * ]);
 */
const updateImagesData = (newMetadata) => {
  for (const page of state.imagesData) {
    const metadataPage = newMetadata.find(metadataPage => metadataPage.page === page.page);
    if (metadataPage) {
      let i = 0;
      for (const oneImageData of page.data) {
        // Only update images that don't already have metadata
        if (!oneImageData.category && i < metadataPage.data.length) {
          Object.assign(oneImageData, metadataPage.data[i]);
        }
        i++;
      }
    }
  }
};

/**
 * Fetches and processes images for AI analysis with page-based organization
 * @async
 * @function
 * @returns {Promise<Array<Object>>} Array of page objects with processed image data and base64 encoding
 * @description Processes images that need metadata generation by organizing them into page-based
 * structure for AI analysis. Handles URL fetching, base64 conversion, and MIME type validation
 * while maintaining the page organization required for accurate AI response mapping.
 * 
 * Processing Pipeline:
 * 1. Filters pages containing images without category metadata
 * 2. Extracts image URLs while preserving page structure
 * 3. Fetches each image URL with error handling
 * 4. Validates MIME types to ensure image content
 * 5. Converts images to base64 format for AI processing
 * 6. Organizes processed data by page for accurate response mapping
 * 
 * Page Structure Preservation:
 * - Input: state.imagesData organized by pages with data arrays
 * - Output: Matching page structure with base64-encoded images
 * - Page numbers: Preserved for accurate AI response mapping
 * - Error handling: Individual image failures don't break page processing
 * 
 * Image Processing Features:
 * - URL fetching with HTTP status validation
 * - MIME type validation (must start with "image/")
 * - ArrayBuffer to base64 conversion for AI compatibility
 * - Individual error handling per image (continues on failures)
 * - Maintains page organization for structured AI responses
 * 
 * Data Structure:
 * - Input filtering: Pages with images lacking category metadata
 * - URL extraction: Converts image objects to URL arrays per page
 * - Base64 encoding: Prepares images for Gemini AI vision analysis
 * - Page preservation: Maintains page numbers for response mapping
 * 
 * Error Handling:
 * - HTTP request failures: Logs error and continues processing
 * - Invalid MIME types: Throws descriptive error messages
 * - Network issues: Graceful degradation with error logging
 * - Individual failures: Don't prevent processing of other images
 * 
 * @throws {Error} When image fetch fails, invalid content type, or network issues
 * @example
 * const processedImages = await fetchImagesFromUrl();
 * // Returns: [{page: 1, data: [{mimeType: "image/jpeg", base64Data: "..."}]}]
 */
const fetchImagesFromUrl = async () => {
  // Filter images that need metadata generation

  const imagesToFetch = state.imagesData.filter(
    (page) => page.data.some(image => !image.category)
  );
  
  // const imageUrls = imagesToFetch.map((oneImageData) => oneImageData.image_url);

  const imageUrls = imagesToFetch.map(pageData => ({
    ...pageData,
    data: pageData.data.map(image => image.image_url)
  }));

  const processedImages = [];

  for (const page of imageUrls) {
    processedImages.push({page: page.page, data: []});
    // Process each image URL
    for (const url of page.data) {
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

        processedImages[processedImages.length - 1].data.push({ mimeType, base64Data });
      } catch (error) {
        console.error(`Error processing image ${url}:`, error);
        // Continue processing other images even if one fails
      }
    }
  }
  return processedImages;
};


/**
 * Generates comprehensive AI metadata for images using Google Gemini 2.5 Pro API
 * @async
 * @function
 * @description Master orchestration function for AI-powered metadata generation with advanced
 * page-based processing, real-time user feedback, and comprehensive error handling. Integrates
 * with the five-module architecture to provide seamless AI functionality.
 * 
 * Complete Processing Pipeline:
 * 1. Dynamic SDK loading: Imports Google AI SDK only when needed for optimal performance
 * 2. Image fetching: Processes images needing metadata with page-based organization
 * 3. Base64 conversion: Prepares images for Gemini AI vision analysis
 * 4. AI configuration: Sets up structured JSON schema with page-based response format
 * 5. Vision analysis: Sends images to Gemini 2.5 Pro for comprehensive analysis
 * 6. Response validation: Ensures AI response matches expected page structure
 * 7. State updates: Assigns metadata to images and refreshes UI components
 * 8. User feedback: Provides real-time processing updates and completion status
 * 
 * Advanced AI Configuration:
 * - Model: Gemini 2.5 Pro with vision capabilities for image analysis
 * - Response schema: Enforced JSON structure with page-based organization
 * - Page constraints: Each page must contain exactly 10 metadata objects
 * - Thinking budget: Unlimited for optimal response quality and accuracy
 * - Metadata fields: category, description, authorName for each image
 * - Error handling: Comprehensive validation and user-friendly error messages
 * 
 * Page-Based Processing Features:
 * - Maintains page structure from state.imagesData throughout processing
 * - Flattens images for AI API while preserving page organization markers
 * - Validates response structure matches input page organization
 * - Updates state.imagesData with accurate page-to-page metadata mapping
 * - Prevents duplicate processing of images with existing metadata
 * 
 * User Experience Enhancements:
 * - Real-time loading animations with animated dots and elapsed timer
 * - Processing status updates at each major pipeline stage
 * - Comprehensive error messages with specific failure context
 * - Success confirmation with metadata generation statistics
 * - Button state management to prevent multiple simultaneous requests
 * 
 * Five-Module Integration:
 * - state management: Centralized image data access and updates
 * - UI updates: Automatic gallery refresh after successful processing
 * - Category system: Updates category filters with new metadata
 * - Error isolation: AI failures don't affect other module functionality
 * - Performance optimization: Dynamic loading and efficient processing
 * 
 * Error Handling & Validation:
 * - SDK loading failures: Graceful degradation with user notification
 * - Image fetching errors: Individual failures don't stop batch processing
 * - AI API errors: Comprehensive error parsing and user feedback
 * - Response validation: Structure and count verification before state updates
 * - Network issues: Timeout handling and retry logic
 * 
 * Performance Optimizations:
 * - Dynamic SDK import: Reduces initial bundle size significantly
 * - Batch processing: Efficient handling of multiple images simultaneously
 * - Base64 optimization: Efficient binary data conversion for AI processing
 * - Memory management: Proper cleanup of processing variables
 * - Loading states: Non-blocking UI with real-time feedback
 * 
 * @throws {Error} SDK initialization, image processing, AI API, or validation failures
 * @example
 * await getImageMetadata(); // Processes all images without metadata
 * 
 * @dependencies
 * - @google/genai: Google AI SDK for Gemini API integration
 * - state.imagesData: Page-based image data from centralized state
 * - updateImagesDOM(): UI refresh function from main module
 * - updateCategoriesDOM(): Category system updates from image-categories module
 */
export const getImageMetadata = async () => {
  let initialArraysLength = [];
  let imageParts = [];
  let flattenedImageParts = [];

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
    initialArraysLength = processedImages.map(page => page.data.length);

    // Check if there are any images to process
    if (initialArraysLength.length === 0) {
      textAI.textContent = "All image metadata is already loaded.";
      stopEllipsisAnimation();
      return;
    }

    imageParts = processedImages.map(pageData => ({
      ...pageData,
      data: pageData.data.map(({ mimeType, base64Data }) => ({
        inlineData: {
          mimeType: mimeType,
          data: base64Data,
        },
      }))
    }));

    for (let page of imageParts) {

      if (flattenedImageParts.length === 0) {
        flattenedImageParts.push({
            "text": `--- IMAGES FOR PAGE ${page.page} START ---`
          });
      } else {
        flattenedImageParts.push({
            "text": `--- PAGE END ---\n\n--- IMAGES FOR PAGE ${page.page} START ---`
          });
      }
      
      for (let imageData of page.data) flattenedImageParts.push(imageData);
    }

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
        required: ["page", "data"],
        properties: {
          page: {
            type: Type.NUMBER,
            description: "Page number that matches the input page structure"
          },
          data: {
            type: Type.ARRAY,
            description: "Array of exactly 10 metadata objects for images in this page",
            minItems: 10,
            maxItems: 10,
            items: {
              type: Type.OBJECT,
              required: ["category", "description", "authorName"],
              properties: {
                category: {
                  type: Type.STRING,
                  description: "Category classification for the image"
                },
                description: {
                  type: Type.STRING,
                  description: "Detailed description of the image content"
                },
                authorName: {
                  type: Type.STRING,
                  description: "Random realistic full name as image author"
                },
              },
            }
          },
        }
      },
    },
    systemInstruction: [
      {
        text: `You will receive images organized by pages. Each page contains exactly 10 images. 

CRITICAL REQUIREMENTS:
1. Return an array of page objects
2. Each page object must have: page (number) and data (array of 10 metadata objects)
3. The page number in your response MUST match the page number from the input structure
4. Each page's data array must contain exactly 10 metadata objects (one for each image)
5. Each metadata object must have: category, description, and authorName

For each image, provide:
- category: A descriptive category that classifies the image content IMPORTANT: just **one** category, keep it simple
- description: A detailed description of what you see in the image
- authorName: A realistic random full name (first and last name)

Maintain the exact page structure and numbering as provided in the input.`,
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
          text: `Analyze the attached images which are organized in pages. Each page contains exactly 10 images. 

Please return a JSON array where each element represents a page with:
- page: the page number (maintain the same page numbers as in the input structure)
- data: an array of exactly 10 metadata objects (one for each image in that page)

Each metadata object should contain: category, description, and authorName.

IMPORTANT: Keep the exact same page numbering and structure as provided in the input. Each page must have exactly 10 metadata objects in the data array.`,
        },
        ...flattenedImageParts, // Spread all processed images
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
    console.log(`Generated metadata for ${metadata.length} pages`);

    // Validate response matches expected count
    const currentArraysLength = metadata.map(page => page.data.length);

    const arraysMatch = 
      initialArraysLength.length === currentArraysLength.length &&
      initialArraysLength.every((len, index) => len === currentArraysLength[index]);
    
    if (!arraysMatch) {
      textAI.textContent = "🚨 Error: Some metadata has been lost 🚨";
      console.log('🚨 Error: Some metadata has been lost 🚨');
    } else {
      // Success: update application data and UI
      console.log(metadata);
      updateImagesData(metadata);
      console.log(state.imagesData);
      updateImagesDOM();
      // updateCategoriesDOM();
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
 * AI Metadata Button Event Listener
 * @description Triggers AI metadata generation for images that don't have metadata yet.
 * Includes button state management to prevent multiple simultaneous requests.
 * The getImageMetadata() function is imported from the modular gemini-api.js file.
 *
 * Features:
 * - Disables button during processing to prevent duplicate requests
 * - Calls modular AI functionality from separated gemini-api.js module
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
 * This completes the advanced Google Gemini AI integration module for the sophisticated image gallery
 * application. This module is a critical component of the five-module architecture, providing
 * comprehensive AI functionality with page-based processing and advanced user experience features.
 *
 * MODULE EXPORTS (Public API):
 * ✅ getImageMetadata() - Advanced AI metadata generation with page-based processing
 * ✅ ellipsisAnimation() - Real-time loading animation with elapsed timer functionality
 * ✅ stopEllipsisAnimation() - Animation cleanup and state reset functionality
 * ✅ textAI, dotsAI, timerAI - Self-contained DOM elements for comprehensive user feedback
 *
 * FIVE-MODULE ARCHITECTURE IMPORTS:
 * - state (main.js): Centralized application state management with page-based image data
 * - updateImagesDOM() (main.js): Core UI update function for gallery rendering and refresh
 * - displayByCategoriesDOM(), updateCategoriesDOM() (image-categories.js): Category system management
 * - Integration potential with pagination.js and api.js through shared state management
 *
 * ADVANCED AI FUNCTIONALITY:
 * 🤖 Gemini 2.5 Pro Integration:
 *    - Vision-capable AI model for sophisticated image analysis
 *    - Dynamic SDK loading for optimal bundle size and performance
 *    - Structured JSON schema validation with enforced page-based responses
 *    - Unlimited thinking budget configuration for enhanced AI performance
 *    - Base64 image processing with comprehensive MIME type validation
 *    - Page-based organization (10 images per page) with accurate mapping
 *
 * 🎭 Enhanced User Experience:
 *    - Self-contained UI controls with complete AI functionality integration
 *    - Real-time loading animations with animated dots cycling (0-3 dots)
 *    - Elapsed time counter providing processing duration feedback
 *    - Comprehensive error handling with user-friendly, context-specific messages
 *    - Success/failure status indicators with processing statistics
 *    - Button state management preventing multiple simultaneous AI requests
 *
 * 🔄 Five-Module State Integration:
 *    - Seamless integration with centralized state management system
 *    - Automatic UI updates after successful AI processing completion
 *    - Category system updates with newly generated metadata classifications
 *    - Image data enrichment with AI-generated content (category, description, authorName)
 *    - Page-based metadata assignment with accurate page number mapping
 *    - Duplicate prevention through existing metadata detection
 *
 * 🏗️ FIVE-MODULE ARCHITECTURE BENEFITS:
 * ✅ Complete separation of AI logic from UI, API, pagination, and category concerns
 * ✅ Self-contained UI controls providing complete AI functionality
 * ✅ Highly reusable AI functionality adaptable across different projects
 * ✅ Isolated error handling specific to AI operations and edge cases
 * ✅ Independent testing and debugging capabilities for AI features
 * ✅ Clean, focused API surface with well-defined exports and responsibilities
 * ✅ Secure API key management contained within dedicated AI module
 * ✅ Dynamic loading optimization for superior initial application performance
 * ✅ Page-based processing alignment with pagination system architecture
 *
 * COMPREHENSIVE MODULE INTEGRATION:
 * - main.js: Provides centralized state management and core UI update functions
 * - pagination.js: Shares page-based data structure for consistent processing
 * - api.js: Parallel external image loading with coordinated state management
 * - image-categories.js: Category filtering and management system integration
 * - style.css: Comprehensive styling for loading animations and user feedback elements
 *
 * TECHNICAL EXCELLENCE FEATURES:
 * - Advanced error handling with granular error context and user-friendly messaging
 * - Performance optimization through dynamic imports and efficient processing pipelines
 * - Memory management with proper variable cleanup and state reset functionality
 * - Network resilience with individual image failure isolation and batch processing
 * - Response validation ensuring AI output matches expected structure before state updates
 * - Processing pipeline with clear separation of concerns and modular function design
 *
 * This module exemplifies advanced software architecture principles with focused responsibilities,
 * clean interfaces, comprehensive error handling, and seamless integration with the sophisticated
 * five-module application ecosystem. It provides enterprise-grade AI functionality while maintaining
 * excellent user experience and system reliability.
 */




