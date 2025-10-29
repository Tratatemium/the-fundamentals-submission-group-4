/* ================================================================================================= */
/* #region NEW REGION                                                                                */
/* ================================================================================================= */


/* #endregion NEW REGION */ 


import './style.css';




/* ================================================================================================= */
/* #region DOM MANIPULATION                                                                          */
/* ================================================================================================= */

  /**
   * Creates and appends an image element to the app container
   * @param {string} src - The source URL of the image to be created
   * @description This function dynamically creates an img element, applies styling class,
   * sets the source URL, and appends it to the main app container in the DOM
   */
  const createImage = (src) => {
    // Ensure the app container exists before proceeding
    if (!appContainer) appContainer = document.getElementById('app');
    
    const appImg = document.createElement('img');  // Create new image element
    appImg.classList.add('app-img');               // Add CSS class for styling
    appImg.src = src;                              // Set the image source URL
    appContainer.appendChild(appImg);              // Append the image to the app container
  };

/* #endregion DOM MANIPULATION */ 


/* ================================================================================================= */
/* #region API REQUESTS                                                                              */
/* ================================================================================================= */

  /**
   * Fetches a single image by its ID from the image API
   * @param {string} imageID - The unique identifier for the image to fetch
   * @description Makes an API request to retrieve a specific image by ID,
   * then creates and displays the image in the DOM using createImage function
   */
  const fetchOneImage = (imageID) => {
    fetch(`https://image-feed-api.vercel.app/api/images/${imageID}`)
      .then(resp => resp.json()) // Parse response as JSON
      .then(json => createImage(json.image_url)); // Create image element with URL
  }

  /**
   * Fetches images from the image API with pagination support
   * @param {number} [page=1] - The page number to fetch (defaults to 1 for the first page)
   * @description Makes an API request to retrieve images from a specific page,
   * then iterates through the data array and creates image elements for each one.
   * Supports pagination to load different sets of images from the API.
   */
  const fetchImages = (page = 1) => { // Fetches the first page by default
    fetch(`https://image-feed-api.vercel.app/api/images?page=${page}`)
      .then(resp => resp.json())                                                       // Parse response as JSON
      .then(json => json.data.forEach(element => createImage(element.image_url)));     // Create images for each item
  };

/* #endregion API REQUESTS */ 

/* ================================================================================================= */
/* #region GEMENI API                                                                                */
/* ================================================================================================= */

// To run this code you need to install the following dependencies:
// npm install @google/genai mime
// npm install -D @types/node

import { GoogleGenAI, Type,} from '@google/genai';

async function fetchImageFromUrl(url) {
  // 1. Fetch the image
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch image: Status ${response.status} ${response.statusText}`);
  }

  // 2. Get the MIME type
  const mimeType = response.headers.get('content-type');
  if (!mimeType || !mimeType.startsWith('image/')) {
    throw new Error(`Invalid content type: ${mimeType || 'none'}. URL must point to an image.`);
  }

  // 3. Get the image data as an ArrayBuffer
  const arrayBuffer = await response.arrayBuffer();

  // 4. Convert ArrayBuffer to Base64 string
  // First, convert to a string of raw bytes
  const uint8Array = new Uint8Array(arrayBuffer);
  let byteString = '';
  uint8Array.forEach((byte) => {
    byteString += String.fromCharCode(byte);
  });

  // Second, encode the byte string to Base64
  const base64Data = btoa(byteString);

  return { mimeType, base64Data };
};

async function main() {

  // --- Define your image URL here ---
  const IMAGE_URL = 'https://image-feed-api.vercel.app/api/images/proxy?url=https%3A%2F%2Fpicsum.photos%2Fseed%2F197%2F300%2F300';

  let imagePart;
  try {
    // 1. Fetch the image and convert it
    const { mimeType, base64Data } = await fetchImageFromUrl(IMAGE_URL);

    // 2. Create the image part for the API request
    imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Data,
      },
    };
  } catch (err) {
    console.error("Error fetching image:", err.message);
    return; // Stop execution if image fetching fails
  }

  const ai = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
  });

  const config = {
    thinkingConfig: {
      thinkingBudget: -1,
    },
    responseMimeType: 'application/json',
    responseSchema: {
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
    systemInstruction: [
        {
          text: `generate structured output based on an image: category, description of an image and a random full name (as 'authorName')`,
        }
    ],
  };
  const model = 'gemini-2.5-pro'; // This model supports vision

  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: `Analyze the attached image and provide the requested JSON fields.`,
        },
        imagePart // Add the image part here
      ],
    },
  ];

  try {
    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });

    // Note: The stream will likely come in one big chunk for JSON output
    console.log("Model Response (stream):");
    for await (const chunk of response) {
      console.log(chunk.text);
    }
  } catch (err) {
    console.error("Error generating content:", err);
  }
}

const GEMINI_API_KEY = 'AIzaSyDu4TSQ7WaK_QCP8rUus6eN6-sAEpJ1qbs';

main();


/* #endregion GEMENI API  */ 




// Get reference to the main app container element
const appContainer = document.getElementById('app');

// Fetch and display a specific image by ID
// fetchOneImage('e8cd3ffd-794c-4ec6-b375-7788dbb14275')

// Alternative: Fetch and display all available images (currently commented out)
fetchImages();
