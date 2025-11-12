/**
 * LIKES FUNCTIONALITY MODULE
 * ==========================
 * 
 * Handles like button interactions, local storage management, and API updates
 * Manages like count display and user preference persistence
 */

import { findImageDataByID } from "./main.js";
import { updateLikesAPI } from "./api.js"

/* ================================================================================================= */
/* #region LIKE FUNCTIONS                                                                           */
/* ================================================================================================= */

/**
 * Handle like button click and update like count
 * @param {HTMLElement} button - The like button element
 * @returns {void}
 */
export const likeButtonOnClick = (button) => {
  const likeNumber = button.children[1];
  const imageContainer = button.parentElement.parentElement.parentElement; //id is in the image container
  const ID = imageContainer.id;
  const imageData = findImageDataByID(ID); //find object in state.imagesData with matching id
  let likedImages = JSON.parse(localStorage.getItem("images_liked"));
  if (!button.classList.contains("active")) {
    //if button is not active - user has not clicked before
    button.classList.add("active");
    likeNumber.textContent = Number(likeNumber.textContent) + 1; //update like number in dom
    imageData.likes_count++; //updates the data
    //stores in data that user liked the picture
    likedImages.push(ID); // Add the id of liked image to array
    localStorage.setItem("images_liked", JSON.stringify(likedImages)); //save the updated array to local storage
    updateLikesAPI(ID, "POST");
  } else {
    button.classList.remove("active");
    likeNumber.textContent = Number(likeNumber.textContent) - 1;
    imageData.likes_count--;
    likedImages = likedImages.filter((item) => item !== ID); // remove the id of liked image to array
    localStorage.setItem("images_liked", JSON.stringify(likedImages)); //unlike, removes the previous data
    updateLikesAPI(ID, "DELETE");
  }
};

/* #endregion LIKE FUNCTIONS */
