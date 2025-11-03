/* ================================================================================================= */
/* #region NEW REGION                                                                                */
/* ================================================================================================= */

/* #endregion NEW REGION */

import "./style.css";

/* ================================================================================================= */
/* #region DOM MANIPULATION                                                                          */
/* ================================================================================================= */

/**
 * Creates and appends an image element to the app container
 * @param {string} src - The source URL of the image to be created
 * @description This function dynamically creates an img element, applies styling class,
 * sets the source URL, and appends it to the main app container in the DOM
 */
const createImage = (imageData) => {
  // Ensure the app container exists before proceeding
  if (!appContainer) appContainer = document.getElementById("app");

  const imageContainer = document.createElement("div");
  imageContainer.classList.add("image-container");
  appContainer.appendChild(imageContainer);

  const appImg = document.createElement("img"); // Create new image element
  appImg.classList.add("app-img"); // Add CSS class for styling
  appImg.src = imageData.image_url; // Set the image source URL
  imageContainer.appendChild(appImg); // Append the image to the app container

  const hoverContainer = document.createElement("div");
  hoverContainer.classList.add("hover-container");
  imageContainer.appendChild(hoverContainer);

  // --- Adding Icons --- //
  /* Used DOMParser because direct 'innerHTML = svgContent`caused syntax error*/

  const svgIconHeart = `<?xml version="1.0" encoding="utf-8"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M12 6.00019C10.2006 3.90317 7.19377 3.2551 4.93923 5.17534C2.68468 7.09558 2.36727 10.3061 4.13778 12.5772C5.60984 14.4654 10.0648 18.4479 11.5249 19.7369C11.6882 19.8811 11.7699 19.9532 11.8652 19.9815C11.9483 20.0062 12.0393 20.0062 12.1225 19.9815C12.2178 19.9532 12.2994 19.8811 12.4628 19.7369C13.9229 18.4479 18.3778 14.4654 19.8499 12.5772C21.6204 10.3061 21.3417 7.07538 19.0484 5.17534C16.7551 3.2753 13.7994 3.90317 12 6.00019Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

  const parser = new DOMParser(); // Creates a new DOMParser
  const svgDoc = parser.parseFromString(svgIconHeart, "image/svg+xml"); //Parse the SVG string into an SVG Document object
  const heartIcon = svgDoc.documentElement; // Get the root SVG element from the parsed document
  hoverContainer.appendChild(heartIcon); // Append the actual SVG element to  'hoverContainer'
  heartIcon.classList.add("heart-icon");

  const likeNumber = document.createElement("p");
  likeNumber.classList.add("like-number"); // Add CSS class for styling in stylesheet (for Emma)
  likeNumber.textContent = imageData.likes_count;
  hoverContainer.appendChild(likeNumber);

  const svgIconComment = `<?xml version="1.0" encoding="utf-8"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg fill="currentColor" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M144 208c-17.7 0-32 14.3-32 32s14.3 32 32 32 32-14.3 32-32-14.3-32-32-32zm112 0c-17.7 0-32 14.3-32 32s14.3 32 32 32 32-14.3 32-32-14.3-32-32-32zm112 0c-17.7 0-32 14.3-32 32s14.3 32 32 32 32-14.3 32-32-14.3-32-32-32zM256 32C114.6 32 0 125.1 0 240c0 47.6 19.9 91.2 52.9 126.3C38 405.7 7 439.1 6.5 439.5c-6.6 7-8.4 17.2-4.6 26S14.4 480 24 480c61.5 0 110-25.7 139.1-46.3C192 442.8 223.2 448 256 448c141.4 0 256-93.1 256-208S397.4 32 256 32zm0 368c-26.7 0-53.1-4.1-78.4-12.1l-22.7-7.2-19.5 13.8c-14.3 10.1-33.9 21.4-57.5 29 7.3-12.1 14.4-25.7 19.9-40.2l10.6-28.1-20.6-21.8C69.7 314.1 48 282.2 48 240c0-88.2 93.3-160 208-160s208 71.8 208 160-93.3 160-208 160z"/></svg>`;

  const svgDoc2 = parser.parseFromString(svgIconComment, "image/svg+xml");
  const commentIcon = svgDoc2.documentElement;
  hoverContainer.appendChild(commentIcon);
  commentIcon.classList.add("comment-icon");

  const commentNumber = document.createElement("p");
  commentNumber.classList.add("comment-number");
  commentNumber.textContent = imageData.comments.length;
  hoverContainer.appendChild(commentNumber);
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
    .then((resp) => resp.json()) // Parse response as JSON
    .then((json) => createImage(json.image_url)); // Create image element with URL
};

/**
 * Fetches images from the image API with pagination support
 * @param {number} [page=1] - The page number to fetch (defaults to 1 for the first page)
 * @description Makes an API request to retrieve images from a specific page,
 * then iterates through the data array and creates image elements for each one.
 * Supports pagination to load different sets of images from the API.
 */
const fetchImages = (page = 1) => {
  // Fetches the first page by default
  fetch(`https://image-feed-api.vercel.app/api/images?page=${page}`)
    .then((resp) => resp.json()) // Parse response as JSON
    .then((json) => json.data.forEach((element) => createImage(element))); // Create images for each item
};

/* #endregion API REQUESTS */

// Get reference to the main app container element
const appContainer = document.getElementById("app");

// Fetch and display a specific image by ID
// fetchOneImage('e8cd3ffd-794c-4ec6-b375-7788dbb14275')

// Alternative: Fetch and display all available images (currently commented out)
fetchImages();

fetchImages(2); // Fetch and display images from page 2
