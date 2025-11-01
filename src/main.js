/* ================================================================================================= */
/* #region NEW REGION                                                                                */
/* ================================================================================================= */


/* #endregion NEW REGION */ 


import './style.css';

let imagesLoadedCounter = 1;
let imagesData = [];


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
    
    const imageContainer = document.createElement('div');
    imageContainer.classList.add('image-container'); 
    appContainer.appendChild(imageContainer);

    const appImg = document.createElement('img');  // Create new image element
    appImg.classList.add('app-img');               // Add CSS class for styling
    appImg.src = src;                              // Set the image source URL
    imageContainer.appendChild(appImg);              // Append the image to the app container

    const textContainer = document.createElement('div');
    textContainer.classList.add('text-container'); 
    imageContainer.appendChild(textContainer);

    const imageCategory = document.createElement('p');
    imageCategory.classList.add('image-category'); 
    textContainer.appendChild(imageCategory);

    const imageAuthor = document.createElement('p');
    imageAuthor.classList.add('image-author'); 
    textContainer.appendChild(imageAuthor);
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
   * @description Makes an API request to retrieve images from a specific page,
   * then iterates through the data array and creates image elements for each one.
   * Supports pagination to load different sets of images from the API.
   */
  // Improved fetchImages with async/await, error handling, and validation
  async function fetchImages() {
    try {
      const response = await fetch(`https://image-feed-api.vercel.app/api/images?page=${imagesLoadedCounter}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json = await response.json();
      if (!json.data || !Array.isArray(json.data)) {
        throw new Error('Invalid data format received from API');
      }
      imagesData.push(...json.data);
      json.data.forEach(item => createImage(item.image_url));
      imagesLoadedCounter++ 
    } catch (error) {
      console.error('Failed to fetch images:', error);
      // Optionally, show user-friendly error message in UI
    }
  }

/* #endregion API REQUESTS */ 

/* ================================================================================================= */
/* #region GEMENI API                                                                                */
/* ================================================================================================= */

// To run this code you need to install the following dependencies:
// npm install @google/genai mime
// npm install -D @types/node

import { GoogleGenAI, Type,} from '@google/genai';



const ellipsisAnimation = () => {
  let count = 0;

  intervalId = setInterval(() => {
    count = (count + 1) % 4;
    dots.textContent = ".".repeat(count);
  }, 500);
};

const stopEllipsisAnimation = () => {
  clearInterval(intervalId);
  intervalId = null;
  dots.textContent = "";
};



const updateImagesData = (newMetadata) => {
  let i = 0;
  for (const oneImageData of imagesData) {
    if (oneImageData.category) {
      continue;
    } else {
      Object.assign(oneImageData, newMetadata[i]);
      i++;
    }
  }
};

const updateImagesDOM = () => {
  const imageCategoryContainers = Array.from(document.querySelectorAll('.image-category'));
  const imageAuthorContainers = Array.from(document.querySelectorAll('.image-author'));

  for (let i = 0; i < imageCategoryContainers.length; i++) {
    imageCategoryContainers[i].textContent = imagesData[i].category;
    imageAuthorContainers[i].textContent = imagesData[i].authorName;
  }
}



const fetchData = (page = 1) => { // Fetches the first page by default
    return fetch(`https://image-feed-api.vercel.app/api/images?page=${page}`)
      .then(resp => resp.json())                                                       // Parse response as JSON
      .then(json => json.data);     // Return the data array
};



async function fetchOneImageFromUrl(url) {
  
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


async function fetchImagesFromUrl() {

  const imagesToFetch = imagesData.filter(oneImageData => !oneImageData.category);
  const imageUrls = imagesToFetch.map(oneImageData => oneImageData.image_url);  
  const processedImages = [];
  
  for (const url of imageUrls) {
    try {
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

      processedImages.push({ mimeType, base64Data });
    } catch (error) {
      console.error(`Error processing image ${url}:`, error);
    }
  }
  
  return processedImages;
}



async function getImageMetadata() {

  let initialArrayLength;
  let imageParts = [];

  try {
    textAI.textContent = 'Fetching multiple images from API';
    ellipsisAnimation();
    
    // 1. Fetch all images from the first page and convert them
    const processedImages = await fetchImagesFromUrl();
    initialArrayLength = processedImages.length;
    if (initialArrayLength === 0) {
      textAI.textContent = 'All image metadata is already loaded.';
      stopEllipsisAnimation();
      return;
    }
    // 2. Create image parts for the API request
    imageParts = processedImages.map(({ mimeType, base64Data }) => ({
      inlineData: {
        mimeType: mimeType,
        data: base64Data,
      },
    }));
    
    if (imageParts.length === 0) {
      throw new Error('No images were successfully processed');
    }
    
  } catch (err) {
    console.error("Error fetching images:", err.message);
    textAI.textContent = '🚨 Error fetching images 🚨';
    stopEllipsisAnimation();
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
  const model = 'gemini-2.5-pro'; // This model supports vision

  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: `Analyze the attached images and provide the requested JSON fields for each image in an array format.`,
        },
        ...imageParts // Add all image parts here
      ],
    },
  ];

  try {
    textAI.textContent = 'Generating metadata with Gemini for multiple images';
    const response = await ai.models.generateContent({
      model,
      config,
      contents,
    });
      
    // Parse and display the results
    const metadata = JSON.parse(response.text);
    console.log(`Generated metadata for ${metadata.length} images`);
    if (metadata.length !== initialArrayLength) {
      textAI.textContent = '🚨 Error: Some metadata has been lost 🚨';
    } else {
      console.log(metadata);
      updateImagesData(metadata);
      console.log(imagesData);
      updateImagesDOM();
    }
    
    
  } catch (err) {
    console.error("Error generating content:", err);
    textAI.textContent = '🚨 Error generating content 🚨';
    stopEllipsisAnimation();
    return;
  }
  
  textAI.textContent = '🎉 Metadata generation: success! 🎉';
  stopEllipsisAnimation();
}

const GEMINI_API_KEY = 'AIzaSyDu4TSQ7WaK_QCP8rUus6eN6-sAEpJ1qbs';

const headerContainer = document.querySelector('header');

const buttonLoadImages = document.createElement('button');
buttonLoadImages.classList.add('button-load-images');
buttonLoadImages.textContent = 'Load images';
headerContainer.appendChild(buttonLoadImages);

const buttonAI = document.createElement('button');
buttonAI.classList.add('button-AI');
buttonAI.textContent = 'Get metadata';
headerContainer.appendChild(buttonAI);

const textAI = document.createElement('p');
textAI.classList.add('text-AI');
textAI.textContent = '';
headerContainer.appendChild(textAI);

const dots = document.createElement('p');
dots.classList.add('dots-AI');
dots.textContent = '';
headerContainer.appendChild(dots);
let intervalId = null;


buttonLoadImages.addEventListener('click', () => {
  fetchImages();
});

buttonAI.addEventListener('click', async () => {
  buttonAI.disabled = true;
  await getImageMetadata();
  buttonAI.disabled = false;
});


/* #endregion GEMENI API  */ 




// Get reference to the main app container element
const appContainer = document.getElementById('app');

// Fetch and display a specific image by ID
// fetchOneImage('e8cd3ffd-794c-4ec6-b375-7788dbb14275')

// Alternative: Fetch and display all available images (currently commented out)
fetchImages();
// fetchImages(2); // Fetch and display images from page 2
