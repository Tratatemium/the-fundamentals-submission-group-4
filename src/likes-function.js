import { findImageDataByID, state } from "./main.js";

export const likeButtonOnClick = (button) => {
  button.classList.add("active");
  const imageContainer = button.parentElement.parentElement.parentElement;

  console.log(imageContainer);
};
