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
<svg width="800px" height="800px" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
<path d="M8.96173 18.9109L9.42605 18.3219L8.96173 18.9109ZM12 5.50063L11.4596 6.02073C11.601 6.16763 11.7961 6.25063 12 6.25063C12.2039 6.25063 12.399 6.16763 12.5404 6.02073L12 5.50063ZM15.0383 18.9109L15.5026 19.4999L15.0383 18.9109ZM9.42605 18.3219C7.91039 17.1271 6.25307 15.9603 4.93829 14.4798C3.64922 13.0282 2.75 11.3345 2.75 9.1371H1.25C1.25 11.8026 2.3605 13.8361 3.81672 15.4758C5.24723 17.0866 7.07077 18.3752 8.49742 19.4999L9.42605 18.3219ZM2.75 9.1371C2.75 6.98623 3.96537 5.18252 5.62436 4.42419C7.23607 3.68748 9.40166 3.88258 11.4596 6.02073L12.5404 4.98053C10.0985 2.44352 7.26409 2.02539 5.00076 3.05996C2.78471 4.07292 1.25 6.42503 1.25 9.1371H2.75ZM8.49742 19.4999C9.00965 19.9037 9.55954 20.3343 10.1168 20.6599C10.6739 20.9854 11.3096 21.25 12 21.25V19.75C11.6904 19.75 11.3261 19.6293 10.8736 19.3648C10.4213 19.1005 9.95208 18.7366 9.42605 18.3219L8.49742 19.4999ZM15.5026 19.4999C16.9292 18.3752 18.7528 17.0866 20.1833 15.4758C21.6395 13.8361 22.75 11.8026 22.75 9.1371H21.25C21.25 11.3345 20.3508 13.0282 19.0617 14.4798C17.7469 15.9603 16.0896 17.1271 14.574 18.3219L15.5026 19.4999ZM22.75 9.1371C22.75 6.42503 21.2153 4.07292 18.9992 3.05996C16.7359 2.02539 13.9015 2.44352 11.4596 4.98053L12.5404 6.02073C14.5983 3.88258 16.7639 3.68748 18.3756 4.42419C20.0346 5.18252 21.25 6.98623 21.25 9.1371H22.75ZM14.574 18.3219C14.0479 18.7366 13.5787 19.1005 13.1264 19.3648C12.6739 19.6293 12.3096 19.75 12 19.75V21.25C12.6904 21.25 13.3261 20.9854 13.8832 20.6599C14.4405 20.3343 14.9903 19.9037 15.5026 19.4999L14.574 18.3219Z" />
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
