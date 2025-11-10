import { findImageDataByID } from "./main.js";

export const likeButtonOnClick = (button) => {
  const likeNumber = button.children[1];
  const imageContainer = button.parentElement.parentElement.parentElement; //id is in the image container
  const ID = imageContainer.id;
  const imageData = findImageDataByID(ID); //find object in state.imagesData with matching id

  if (!button.classList.contains("active")) {
    //if button is not active - user has not clicked before
    button.classList.add("active");
    likeNumber.textContent = Number(likeNumber.textContent) + 1; //update like number in dom
    imageData.likes_count++; //updates the data
    imageData.userLiked = true; //stores in data that user liked the picture
  } else {
    button.classList.remove("active");
    likeNumber.textContent = Number(likeNumber.textContent) - 1;
    imageData.likes_count--;
    imageData.userLiked = false; //unlike, removes the previous data
  }
};
