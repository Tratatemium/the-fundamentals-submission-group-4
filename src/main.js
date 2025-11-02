
/**
 * IMAGE GALLERY WITH AI METADATA GENERATION
 * =========================================
 * 
 * This application creates an interactive image gallery that fetches images from an API
 * and uses Google's Gemini AI to generate metadata (category, description, author) for each image.
 * 
 * Features:
 * - Dynamic image loading with pagination
 * - AI-powered metadata generation using Gemini API
 * - Interactive UI with hover overlays showing metadata
 * - Error handling and loading states
 * - Responsive grid layout
 * 
 * Dependencies:
 * - @google/genai - Google Generative AI SDK
 * - Custom CSS for styling and animations
 * 
 * @author Group 4
 * @version 1.0
 */

import './style.css';

/* ================================================================================================= */
/* #region VARIABLES DECLARATION                                                                     */
/* ================================================================================================= */

/**
 * API key for Google Gemini AI service
 * @constant {string}
 */
const GEMINI_API_KEY = 'AIzaSyDu4TSQ7WaK_QCP8rUus6eN6-sAEpJ1qbs';

/**
 * Counter to track which page of images to load next
 * @type {number}
 */
let imagesLoadedCounter = 1;

/**
 * Array to store all loaded image data including metadata
 * @type {Array<Object>}
 */
let imagesData = [];

/**
 * Currently active category filter for displaying images
 * @type {string} Can be 'All', 'Uncategorised', or any specific category name
 */
let activeCategory = 'All';

/* #endregion VARIABLES DECLARATION */ 


/* ================================================================================================= */
/* #region DOM MANIPULATION                                                                          */
/* ================================================================================================= */

  /**
   * Creates and appends an image element with overlay container to the app
   * @param {string} src - The source URL of the image to be created
   * @description This function dynamically creates a complete image container with:
   * - Image element with proper styling
   * - Text overlay container for metadata display
   * - Category and author text elements (initially empty)
   * The structure allows for hover effects and metadata display
   */
  const createImage = (src) => {
    // Ensure the app container exists before proceeding
    if (!appContainer) appContainer = document.getElementById('app');
    
    // Create main container for image and text overlay
    const imageContainer = document.createElement('div');
    imageContainer.classList.add('image-container'); 
    appContainer.appendChild(imageContainer);

    // Create and configure the image element
    const appImg = document.createElement('img');  
    appImg.classList.add('app-img');               
    appImg.src = src;                              
    imageContainer.appendChild(appImg);            

    // Create text overlay container (hidden by default, shown on hover)
    const textContainer = document.createElement('div');
    textContainer.classList.add('text-container'); 
    imageContainer.appendChild(textContainer);

    // Create category display element
    const imageCategory = document.createElement('p');
    imageCategory.classList.add('image-category'); 
    textContainer.appendChild(imageCategory);

    // Create author display element
    const imageAuthor = document.createElement('p');
    imageAuthor.classList.add('image-author'); 
    textContainer.appendChild(imageAuthor);

    // Update category filtering after adding new image
    displayByCategoriesDOM();
  };

  /**
   * Updates the DOM with metadata for all loaded images
   * @description Finds all category and author containers and populates them
   * with data from the imagesData array. Also adds category CSS classes for filtering.
   * This is called after AI metadata generation.
   */
  const updateImagesDOM = () => {
    const imageContainers = Array.from(document.querySelectorAll('.image-container'));
    const imageCategoryContainers = Array.from(document.querySelectorAll('.image-category'));
    const imageAuthorContainers = Array.from(document.querySelectorAll('.image-author'));

    // Update each container with corresponding metadata
    for (let i = 0; i < imageCategoryContainers.length; i++) {
      imageCategoryContainers[i].textContent = imagesData[i].category;
      imageAuthorContainers[i].textContent = imagesData[i].authorName;
      // Add category class for filtering functionality
      if (imagesData[i].category) {
        imageContainers[i].classList.add(`category-${imagesData[i].category.replaceAll(" ", "-")}`)
      }
    }
  }

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
  const displayByCategoriesDOM = () => {
    const images = Array.from(document.querySelectorAll('.image-container'));
    images.forEach(image => {
      switch (activeCategory) {
        case 'All':
          // Show all images
          image.classList.remove('hidden');
          break;
        case 'Uncategorised':
          // Show only images without category classes
          if (Array.from(image.classList).some(el => el.startsWith('category-'))) {
            image.classList.add('hidden');
          } else {
            image.classList.remove('hidden');
          }
          break;
        default:
          // Show only images matching the selected category
          let imageCategory = Array.from(image.classList).find(el => el.startsWith('category-'));
          if (imageCategory) imageCategory = imageCategory.slice('category-'.length);
          if (imageCategory === activeCategory) {
            image.classList.remove('hidden');
          } else {
            image.classList.add('hidden');
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
  const updateCategoriesDOM = () => {
    let categoryButtons = Array.from(document.querySelectorAll('.button-category'));
    const categoriesContainer = document.querySelector('.categories-container');
    
    // Remove existing category buttons
    categoryButtons.forEach(button => categoriesContainer.removeChild(button));

    // Create list of all available categories
    const categoriesList = ['All', 'Uncategorised', ...new Set(imagesData.map(element => element.category))];

    // Generate button for each category
    for (const category of categoriesList) {
      const button = document.createElement('button');
      button.classList.add('button-category');
      button.classList.add(category.replaceAll(" ", "-"));
      button.textContent = category;
      // Mark active category button
      if (category.replaceAll(" ", "-") === activeCategory) button.classList.add('active');
      categoriesContainer.appendChild(button);
    }

    // Get updated button list and add event listeners
    categoryButtons = Array.from(document.querySelectorAll('.button-category'));

    /**
     * Handles category button click events
     * @param {HTMLButtonElement} button - The clicked category button
     * @description Updates active category and refreshes the display when a different
     * category button is clicked. Prevents unnecessary updates for already active buttons.
     */
    const categoryButtonsOnClick = (button) => {
      if (!button.classList.contains('active')){
        // Remove active state from all buttons
        categoryButtons.forEach(button => button.classList.remove('active'));
        // Set clicked button as active
        button.classList.add('active');

        // Extract category name from button classes
        const buttonCategory = Array.from(button.classList).find(el => (el !== 'button-category' && el !== 'active'))
        activeCategory = buttonCategory;

        // Update image display based on new category
        displayByCategoriesDOM();
      }
    };

    // Add click listeners to all category buttons
    categoryButtons.forEach(button => button.addEventListener('click', (event) => categoryButtonsOnClick(event.target)));

    // Apply current category filter
    displayByCategoriesDOM();
  };

/* #endregion DOM MANIPULATION */ 


/* ================================================================================================= */
/* #region API REQUESTS                                                                              */
/* ================================================================================================= */

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
   * - Integration with global imagesData array
   * 
   * @throws {Error} When API request fails or response format is invalid
   */
  const fetchImages = async () => {
    try {
      // Make API request to current page
      const response = await fetch(`https://image-feed-api.vercel.app/api/images?page=${imagesLoadedCounter}`);
      
      // Check if request was successful
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Parse JSON response
      const json = await response.json();
      
      // Validate response data structure
      if (!json.data || !Array.isArray(json.data)) {
        throw new Error('Invalid data format received from API');
      }
      
      // Store data and create DOM elements
      imagesData.push(...json.data);
      json.data.forEach(item => createImage(item.image_url));
      
      // Increment counter for next page load
      imagesLoadedCounter++; 
      
    } catch (error) {
      console.error('Failed to fetch images:', error);
      // TODO: Show user-friendly error message in UI
    }
  }

/* #endregion API REQUESTS */ 

/* ================================================================================================= */
/* #region GEMINI AI INTEGRATION                                                                     */
/* ================================================================================================= */

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

import { GoogleGenAI, Type,} from '@google/genai';

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
const ellipsisAnimation = () => {
  let count = 0;
  const timerStart = Date.now();
  let timerNow;
  intervalId = setInterval(() => {
    count = (count + 1) % 4;
    dotsAI.textContent = ".".repeat(count);
    timerNow = Math.floor( (Date.now() - timerStart) / 1000 );
    timerAI.textContent = `${timerNow}s elapsed`
  }, 500);
};

/**
 * Stops the ellipsis animation and clears all loading indicators
 * @function
 * @description Clears the interval timer and resets both the dots display
 * and elapsed timer. Called when AI processing completes or fails.
 */
const stopEllipsisAnimation = () => {
  clearInterval(intervalId);
  intervalId = null;
  dotsAI.textContent = '';
  timerAI.textContent = '';
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
  const imagesToFetch = imagesData.filter(oneImageData => !oneImageData.category);
  const imageUrls = imagesToFetch.map(oneImageData => oneImageData.image_url);  
  const processedImages = [];
  
  // Process each image URL
  for (const url of imageUrls) {
    try {
      // Fetch the image from URL
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch image: Status ${response.status} ${response.statusText}`);
      }

      // Validate MIME type to ensure it's an image
      const mimeType = response.headers.get('content-type');
      if (!mimeType || !mimeType.startsWith('image/')) {
        throw new Error(`Invalid content type: ${mimeType || 'none'}. URL must point to an image.`);
      }

      // Convert image to ArrayBuffer
      const arrayBuffer = await response.arrayBuffer();

      // Convert ArrayBuffer to Base64 string for AI processing
      const uint8Array = new Uint8Array(arrayBuffer);
      let byteString = '';
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
}



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
const getImageMetadata = async () => {

  let initialArrayLength;
  let imageParts = [];

  try {
    // Start loading animation and user feedback
    textAI.textContent = 'Fetching multiple images from API';
    ellipsisAnimation();
    
    // Process images that don't have metadata yet
    const processedImages = await fetchImagesFromUrl();
    initialArrayLength = processedImages.length;
    
    // Check if there are any images to process
    if (initialArrayLength === 0) {
      textAI.textContent = 'All image metadata is already loaded.';
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
      throw new Error('No images were successfully processed');
    }
    
  } catch (err) {
    console.error("Error fetching images:", err.message);
    textAI.textContent = '🚨 Error fetching images 🚨';
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
    responseMimeType: 'application/json',
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
        }
    ],
  };
  
  // Use Gemini 2.5 Pro model (supports vision)
  const model = 'gemini-2.5-pro';

  // Prepare the content for AI analysis
  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: `Analyze the attached images and provide the requested JSON fields for each image in an array format.`,
        },
        ...imageParts // Spread all processed images
      ],
    },
  ];

  try {
    // Update user on AI processing status
    textAI.textContent = 'Generating metadata with Gemini for multiple images';
    
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
      textAI.textContent = '🚨 Error: Some metadata has been lost 🚨';
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
    textAI.textContent = '🚨 Error generating content 🚨';
    stopEllipsisAnimation();
    return;
  }
  
  // Success message and cleanup
  textAI.textContent = '🎉 Metadata generation: success! 🎉';
  stopEllipsisAnimation();
}
/* #endregion GEMINI AI INTEGRATION  */ 

/* ================================================================================================= */
/* #region DOM ELEMENT CREATION & REFERENCES                                                        */
/* ================================================================================================= */

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

/**
 * Main container for the image gallery
 * @type {HTMLElement}
 */
const appContainer = document.getElementById('app');

/**
 * Header container for UI controls
 * @type {HTMLElement}
 */
const headerContainer = document.querySelector('header');

/**
 * Button to load more images from the API
 * @type {HTMLButtonElement}
 */
const buttonLoadImages = document.createElement('button');
buttonLoadImages.classList.add('button-load-images');
buttonLoadImages.textContent = 'Load images';
headerContainer.appendChild(buttonLoadImages);

/**
 * Button to generate AI metadata for loaded images
 * @type {HTMLButtonElement}
 */
const buttonAI = document.createElement('button');
buttonAI.classList.add('button-AI');
buttonAI.textContent = 'Get metadata';
headerContainer.appendChild(buttonAI);

/**
 * Text element for displaying status messages to the user
 * @type {HTMLParagraphElement}
 */
const textAI = document.createElement('p');
textAI.classList.add('text-AI');
textAI.textContent = '';
headerContainer.appendChild(textAI);

/**
 * Element for animated loading dots
 * @type {HTMLParagraphElement}
 */
const dotsAI = document.createElement('p');
dotsAI.classList.add('dots-AI');
dotsAI.textContent = '';
headerContainer.appendChild(dotsAI);

/**
 * Element for displaying elapsed processing time
 * @type {HTMLParagraphElement}
 * @description Shows real-time elapsed time during AI metadata generation
 * to provide users with feedback on processing duration
 */
const timerAI = document.createElement('p');
timerAI.classList.add('timer-AI');
timerAI.textContent = '';
headerContainer.appendChild(timerAI);

/**
 * Interval ID for controlling the loading animation
 * @type {number|null}
 */
let intervalId = null;

/* #endregion DOM ELEMENT CREATION & REFERENCES  */ 

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
 * from the API. Supports pagination through the global imagesLoadedCounter.
 * Also provides user feedback when new images are loaded.
 */
buttonLoadImages.addEventListener('click', () => {
  fetchImages();
  textAI.textContent = 'More images loaded 🖼️';
});

/**
 * AI Metadata Button Event Listener  
 * @description Triggers AI metadata generation for images that don't have metadata yet.
 * Includes button state management to prevent multiple simultaneous requests.
 * 
 * Features:
 * - Disables button during processing to prevent duplicate requests
 * - Async handling with proper error management
 * - Re-enables button after completion (success or failure)
 */
buttonAI.addEventListener('click', async () => {
  buttonAI.disabled = true;          // Disable button during processing
  await getImageMetadata();          // Generate metadata with AI
  buttonAI.disabled = false;         // Re-enable button when complete
});

/* #endregion EVENT LISTENERS  */ 

/* ================================================================================================= */
/* #region APPLICATION INITIALIZATION                                                                */
/* ================================================================================================= */

/**
 * APPLICATION STARTUP
 * ===================
 * 
 * Initialize the application by loading the first set of images and setting up
 * the category filtering system. This provides immediate content for users when 
 * the page loads and establishes the filtering interface.
 */

// Load initial set of images on application start
fetchImages();
// Initialize category filter buttons (starts with just 'All' and 'Uncategorised')
updateCategoriesDOM();

/* #endregion APPLICATION INITIALIZATION */

/**
 * =====================================================================================================
 * END OF FILE
 * =====================================================================================================
 * 
 * This completes the image gallery application with AI-powered metadata generation.
 * 
 * Key Features Implemented:
 * ✅ Dynamic image loading with pagination
 * ✅ Google Gemini AI integration for metadata generation  
 * ✅ Interactive UI with hover overlays
 * ✅ Category-based filtering system
 * ✅ Error handling and loading states
 * ✅ Responsive design with CSS Grid
 * ✅ State management for images and metadata
 * ✅ Button state management during async operations
 * ✅ Animated loading indicators with elapsed time display
 * ✅ Dynamic category button generation
 * ✅ Real-time processing timer for user feedback
 * 
 * Usage:
 * 1. Page loads with initial set of images
 * 2. Click "Load images" to fetch more images 
 * 3. Click "Get metadata" to generate AI descriptions
 * 4. Use category buttons to filter images by type
 * 5. Hover over images to see generated metadata
 * 
 * Dependencies:
 * - @google/genai for AI functionality
 * - Custom CSS for styling and animations
 * - Image API at https://image-feed-api.vercel.app/
 */


