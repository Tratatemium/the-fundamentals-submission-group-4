/**
 * GOOGLE GEMINI AI SETUP
 * ======================
 *
 * This section handles integration with Google's Gemini AI API for generating
 * image metadata including categories, descriptions, and author names.
 *
 * Required dependencies:
 * - npm install @google/genai mime
 * - npm install -D @types/node
 */

// Import variables
import { imagesData } from './main.js'
// Import functions
import { updateImagesDOM, updateCategoriesDOM } from './main.js'
// Import DOM elements
import { textAI, dotsAI, timerAI } from './main.js'


import { GoogleGenAI, Type } from "@google/genai";

// API key for Google Gemini AI service loaded from environment file
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

/**
 * Interval ID for controlling the loading animation
 * @type {number|null}
 */
let intervalId = null;

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
 * Updates the global imagesData array with new metadata from AI
 * @param {Array<Object>} newMetadata - Array of metadata objects from Gemini AI
 * @description Finds images without metadata and assigns the AI-generated data
 * to them in sequence. Only updates images that don't already have category data.
 */
const updateImagesData = (newMetadata) => {
  let i = 0;
  for (const oneImageData of imagesData) {
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
  const imagesToFetch = imagesData.filter(
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
      console.log(imagesData);
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




