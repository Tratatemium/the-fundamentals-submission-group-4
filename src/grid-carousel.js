// // ======================================
// // GRID–CAROUSEL MODULE (FINAL CLEAN VERSION)
// // ======================================
// import { showLightbox } from "./lightbox.js";
// // ======================
// // DOM ELEMENTS
// // ======================
// const carouselContainer = document.getElementById("gallery-carousel");
// const slider = document.getElementById("slider");
// const nextBtn = document.getElementById("carousel-next");
// const prevBtn = document.getElementById("carousel-prev");

// // Internal rotation
// let rotation = 0;

// // ✅ Check carousel exists before adding event listeners
// const carouselReady = carouselContainer && slider && nextBtn && prevBtn;

// // ======================================
// // A. RESET CAROUSEL (Clear + Reset Rotation)
// // ======================================
// function resetCarousel() {
//   rotation = 0;
//   if (slider) {
//     slider.style.setProperty("--rotation", "0deg");
//     slider.innerHTML = ""; // remove old 3D items
//   }
// }

// // ======================================
// // B. CSS VARIABLE SETUP (Quantity)
// // ======================================
// function configureCarouselVariables(count) {
//   if (slider) slider.style.setProperty("--quantity", count);
// }

// // ======================================
// // C. BUILD THE 3D ITEMS
// // ======================================
// // ======================================
// // C. BUILD THE 3D ITEMS (with likes/comments overlay)
// // ======================================


// function createCarouselItems(images) {
//   if (!slider) return;

//   images.forEach((img, index) => {
//     const item = document.createElement("div");
//     item.classList.add("item");
//     item.style.setProperty("--position", index + 1);

//     // === main image ===
//     const appImg = document.createElement("img");
//     appImg.classList.add("app-img");
//     appImg.src = img.image_url || img.url || "";
//     appImg.alt = img.authorName || "Image";

//     // === overlay ===
//     const hoverContainer = document.createElement("div");
//     hoverContainer.classList.add("hover-container");

//     const iconContainer = document.createElement("div");
//     iconContainer.classList.add("icon-container");
//     hoverContainer.appendChild(iconContainer);

//     // Heart
//     const heartGroup = document.createElement("div");
//     heartGroup.classList.add("icon-group");
//     heartGroup.innerHTML = `
//       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
//            stroke-linecap="round" stroke-linejoin="round" width="24" height="24">
//         <path d="M12 6C10 3.9 7.2 3.25 5 5.17C2.8 7.09 2.37 10.31 4.14 12.58C5.6 14.46 10.06 18.45 11.52 19.74C11.68 19.88 11.77 19.95 11.86 19.98C11.95 20.01 12.04 20.01 12.13 19.98C12.22 19.95 12.3 19.88 12.46 19.74C13.92 18.45 18.38 14.46 19.85 12.58C21.62 10.31 21.34 7.08 19.05 5.17C16.75 3.27 13.8 3.9 12 6Z"/>
//       </svg>
//       <p class="like-number">${img.likes_count || 0}</p>
//     `;
//     iconContainer.appendChild(heartGroup);

//     // Comments
//     const commentGroup = document.createElement("div");
//     commentGroup.classList.add("icon-group");
//     commentGroup.innerHTML = `
//       <svg fill="currentColor" viewBox="0 0 512 512" width="24" height="24">
//         <path d="M144 208c-17.7 0-32 14.3-32 32s14.3 32 32 32
//                  32-14.3 32-32-14.3-32-32-32zm112 0c-17.7 0-32
//                  14.3-32 32s14.3 32 32 32 32-14.3 32-32-14.3-32-32-32zm112
//                  0c-17.7 0-32 14.3-32 32s14.3 32 32 32
//                  32-14.3 32-32-14.3-32-32-32zM256 32C114.6 32
//                  0 125.1 0 240c0 47.6 19.9 91.2 52.9 126.3C38
//                  405.7 7 439.1 6.5 439.5c-6.6 7-8.4 17.2-4.6
//                  26S14.4 480 24 480c61.5 0 110-25.7 139.1-46.3C192
//                  442.8 223.2 448 256 448c141.4 0 256-93.1
//                  256-208S397.4 32 256 32z"/>
//       </svg>
//       <p class="comment-number">${(img.comments && img.comments.length) || 0}</p>
//     `;
//     iconContainer.appendChild(commentGroup);

//     // === attach ===
//     item.appendChild(appImg);
//     item.appendChild(hoverContainer);
//     slider.appendChild(item);

//     // === lightbox ===
//     appImg.addEventListener("click", () => showLightbox(appImg.src));
//   });
// }


// // ======================================
// // D. MAIN EXPORT — CALLED BY pagination.js
// // ======================================
// export function renderCarousel(images) {  // ✅ Dark Yellow: previously was not exported
//   if (!slider || !images || !images.length) return;
//   resetCarousel();                           // Reset old items
//   configureCarouselVariables(images.length); // Set CSS variable --quantity
//   createCarouselItems(images);               // Build new carousel items
// }


// // ========== lightbox integration ==========



// // Add lightbox click to carousel images
// document.addEventListener("DOMContentLoaded", () => {   // ✅ Dark Yellow: ensures DOM loaded
//   if (!carouselReady) return;
//   slider.addEventListener("click", (event) => {
//     const target = event.target;
//     if (target.tagName === "IMG") {
//       showLightbox(target.src);
//     }
//   });
// });



// // ======================================
// // ROTATION CONTROLS (Next / Prev)
// // ======================================
// document.addEventListener("DOMContentLoaded", () => {   // ✅ Dark Yellow: ensures DOM loaded
//   if (!carouselReady) return;

//   nextBtn.addEventListener("click", () => {
//     const count = slider.childElementCount || 1;
//     rotation += 360 / count;
//     slider.style.setProperty("--rotation", `${rotation}deg`);
//   });

//   prevBtn.addEventListener("click", () => {
//     const count = slider.childElementCount || 1;
//     rotation -= 360 / count;
//     slider.style.setProperty("--rotation", `${rotation}deg`);
//   });
// });






// ======================================
// GRID–CAROUSEL MODULE (FINAL STABLE VERSION)
// ======================================

import { showLightbox } from "./lightbox.js"; // Import lightbox function to show full-screen images

// ======================
// DOM ELEMENTS
// ======================
const carouselContainer = document.getElementById("gallery-carousel"); // Select the main carousel container
const slider = document.getElementById("slider"); // Select the slider element inside carousel
const nextBtn = document.getElementById("carousel-next"); // Select the "Next" button
const prevBtn = document.getElementById("carousel-prev"); // Select the "Prev" button

// Internal rotation
let rotation = 0; // Store current rotation angle of the 3D carousel

// ======================================
// A. RESET CAROUSEL (Clear + Reset Rotation)
// ======================================
function resetCarousel() { // Function to reset carousel rotation and clear items
  rotation = 0; // Reset rotation to 0 degrees
  if (slider) { // If slider exists
    slider.style.setProperty("--rotation", "0deg"); // Reset CSS variable controlling rotation
    slider.innerHTML = ""; // Remove all old carousel items
  }
}

// ======================================
// B. CSS VARIABLE SETUP (Quantity)
// ======================================
function configureCarouselVariables(count) { // Function to set number of items for CSS
  if (slider) slider.style.setProperty("--quantity", count); // Update CSS variable --quantity with total items
}

// ======================================
// C. BUILD THE 3D ITEMS (with likes/comments overlay)
// ======================================
function createCarouselItems(images) { // Function to create carousel items
  if (!slider) return; // Exit if slider is null

  images.forEach((img, index) => { // Loop through all images
    const item = document.createElement("div"); // Create container div for single item
    item.classList.add("item"); // Add "item" class
    item.style.setProperty("--position", index + 1); // CSS variable for item position

    // === main image ===
    const appImg = document.createElement("img"); // Create image element
    appImg.classList.add("app-img"); // Add class for styling
    appImg.src = img.image_url || img.url || ""; // Set source: use first non-falsy value; '' if both null/undefined
    appImg.alt = img.authorName || "Image"; // Set alt text, default to "Image"

    // === overlay ===
    const hoverContainer = document.createElement("div"); // Container for overlay icons
    hoverContainer.classList.add("hover-container"); // Add class

    const iconContainer = document.createElement("div"); // Inner container for icons
    iconContainer.classList.add("icon-container"); // Add class
    hoverContainer.appendChild(iconContainer); // Append icon container to hover overlay

    // Heart icon
    const heartGroup = document.createElement("div"); // Create div for heart icon
    heartGroup.classList.add("icon-group"); // Add class for group styling
    heartGroup.innerHTML = ` 
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round" width="24" height="24">
        <path d="M12 6C10 3.9 7.2 3.25 5 5.17C2.8 7.09 2.37 10.31 4.14 12.58
                 C5.6 14.46 10.06 18.45 11.52 19.74C11.68 19.88 11.77 19.95 11.86 19.98
                 C11.95 20.01 12.04 20.01 12.13 19.98C12.22 19.95 12.3 19.88 12.46 19.74
                 C13.92 18.45 18.38 14.46 19.85 12.58C21.62 10.31 21.34 7.08 19.05 5.17
                 C16.75 3.27 13.8 3.9 12 6Z"/>
      </svg>
      <p class="like-number">${img.likes_count || 0}</p> 
    `; // Add SVG and likes count, default 0 if img.likes_count falsy
    iconContainer.appendChild(heartGroup); // Append heart icon to icon container

    // Comment icon
    const commentGroup = document.createElement("div"); // Create div for comment icon
    commentGroup.classList.add("icon-group"); // Add group class
    commentGroup.innerHTML = `
      <svg fill="currentColor" viewBox="0 0 512 512" width="24" height="24">
        <path d="M144 208c-17.7 0-32 14.3-32 32s14.3 32 32 32
                 32-14.3 32-32-14.3-32-32-32zm112 0c-17.7 0-32
                 14.3-32 32s14.3 32 32 32 32-14.3 32-32
                 -14.3-32-32-32zm112 0c-17.7 0-32 14.3
                 -32 32s14.3 32 32 32 32-14.3 32-32
                 -14.3-32-32-32zM256 32C114.6 32 0 125.1
                 0 240c0 47.6 19.9 91.2 52.9 126.3C38
                 405.7 7 439.1 6.5 439.5c-6.6 7-8.4 17.2
                 -4.6 26S14.4 480 24 480c61.5 0 110-25.7
                 139.1-46.3C192 442.8 223.2 448 256 448
                 c141.4 0 256-93.1 256-208S397.4 32 256 32z"/>
      </svg>
      <p class="comment-number">${(img.comments && img.comments.length) || 0}</p> 
    `; // Comment SVG and number; if img.comments exists, use length, else 0
    iconContainer.appendChild(commentGroup); // Append comment group

    // === attach ===
    item.appendChild(appImg); // Append main image

    // --- inside createCarouselItems(images) when building `item` ---

// create hover text container (category + author) — mirror grid structure
const textContainer = document.createElement('div');
textContainer.classList.add('text-container');

const imageCategory = document.createElement('p');
imageCategory.classList.add('image-category');
imageCategory.textContent = img.category || 'Uncategorised';
textContainer.appendChild(imageCategory);

const imageAuthor = document.createElement('p');
imageAuthor.classList.add('image-author');
imageAuthor.textContent = img.authorName || 'Unknown';
textContainer.appendChild(imageAuthor);

// append textContainer to hoverContainer (or wherever your overlay sits)
hoverContainer.appendChild(textContainer);

    item.appendChild(hoverContainer); // Append overlay
    slider.appendChild(item); // Append complete item to slider

    // === lightbox click ===
    appImg.addEventListener("click", () => showLightbox(appImg.src)); // Open lightbox on click
  });
}

// ======================================
// D. MAIN EXPORT — CALLED BY pagination.js
// ======================================
export function renderCarousel(images) { // Exported function to render carousel
  if (!slider || !images || !images.length) return; // Exit if no slider or no images
  resetCarousel();                           // Clear old items
  configureCarouselVariables(images.length); // Set CSS variable --quantity
  createCarouselItems(images);               // Build carousel items with overlay
}

// ======================================
// ROTATION CONTROLS (Next / Prev)
// ======================================
document.addEventListener("DOMContentLoaded", () => { // Wait for DOM to fully load
  const slider = document.getElementById("slider"); // Re-select slider
  const nextBtn = document.getElementById("carousel-next"); // Re-select Next button
  const prevBtn = document.getElementById("carousel-prev"); // Re-select Prev button

  if (!slider || !nextBtn || !prevBtn) return; // Exit if any element missing to avoid errors

  let rotation = 0; // Local rotation for event listeners

  nextBtn.addEventListener("click", () => { // Next button click handler
    const count = slider.childElementCount || 1; // Number of items; default 1 if 0 (|| operator)
    rotation += 360 / count; // Increment rotation angle per item
    slider.style.setProperty("--rotation", `${rotation}deg`); // Update CSS rotation
  });

  prevBtn.addEventListener("click", () => { // Prev button click handler
    const count = slider.childElementCount || 1; // Number of items; default 1
    rotation -= 360 / count; // Decrement rotation angle
    slider.style.setProperty("--rotation", `${rotation}deg`); // Update CSS rotation
  });
});
