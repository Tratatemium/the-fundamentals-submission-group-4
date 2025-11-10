import { findImageDataByID, state } from "./main.js";

export const likeButtonOnClick = (button) => {
  button.classList.add("active");

  const likeNumber = button.children[1];
  likeNumber.textContent = Number(likeNumber.textContent) + 1;

  const imageContainer = button.parentElement.parentElement.parentElement;
  const ID = imageContainer.id;
  console.log(ID);

  const imageData = findImageDataByID(ID);
  imageData.likes_count++;

  imageData.userLiked = true;
  console.log(state.imagesData[0]);
};
