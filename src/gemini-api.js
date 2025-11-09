/**
 * AI metadata generation using Google Gemini 2.5 Pro
 * Processes pages of images to generate categories, descriptions, and author names
 * Includes real-time loading animations and error handling
 */

// Import state and DOM update functions from main module
import { state } from './main.js'
import { updateImagesDOM } from './main.js'

// Import category management functions from specialized image-categories module
// Required for updating category filters and displays after AI metadata assignment
import { displayByCategoriesDOM, updateCategoriesDOM } from './image-categories.js';

// Import API functionality for additional image loading capability
// import { fetchImages } from './api.js';

// Dynamic imports for Google AI SDK (loaded when needed)
// import { GoogleGenAI, Type } from "@google/genai" - loaded dynamically




// Google Gemini AI API key from environment variables
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Loading animation interval control
let intervalId = null;

// Dynamically loaded Google AI SDK variables
let GoogleGenAI, Type;

// Starts loading animation with dots and timer
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

// Stops loading animation and clears indicators
export const stopEllipsisAnimation = () => {
  clearInterval(intervalId);
  intervalId = null;
  dotsAI.textContent = "";
  timerAI.textContent = "";
};

// Updates image data with AI-generated metadata using page-based matching
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

// Fetches and processes images for AI analysis with page-based organization
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


// Main AI processing function for generating image metadata with Google Gemini 2.5 Pro
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






