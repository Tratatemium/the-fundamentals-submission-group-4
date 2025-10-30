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
    
    const imageContainer = document.createElement('div');
    imageContainer.classList.add('image-container'); 
    appContainer.appendChild(imageContainer);

    const appImg = document.createElement('img');  // Create new image element
    appImg.classList.add('app-img');               // Add CSS class for styling
    appImg.src = src;                              // Set the image source URL
    imageContainer.appendChild(appImg);              // Append the image to the app container
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



// Get reference to the main app container element
const appContainer = document.getElementById('app');

// Fetch and display a specific image by ID
// fetchOneImage('e8cd3ffd-794c-4ec6-b375-7788dbb14275')

// Alternative: Fetch and display all available images (currently commented out)
fetchImages();

fetchImages(2); // Fetch and display images from page 2
