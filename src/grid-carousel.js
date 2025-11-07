// For RAHEEL: I implemented view toggle in main.js - event listeners


// =======================
// GRID / CAROUSEL VIEW TOGGLE
// =======================
const gallery = document.getElementById("gallery"); // Find the element with id 'gallery' and store it. This is used for grid view display.

const viewToggleBtn = document.getElementById("view-toggle"); // Button to switch between Grid and Carousel view.
if (viewToggleBtn && slider && gallery && banner) { // Make sure all required elements exist.
  viewToggleBtn.addEventListener("click", () => { // Add click event listener for toggle button.
    if (gallery.style.display === "none" || gallery.style.display === "") { // Check if gallery is hidden or empty.
      gallery.style.display = "grid"; // Show gallery in grid layout.
      banner.style.display = "none"; // Hide carousel banner.
      viewToggleBtn.textContent = "Switch to 3D Carousel"; // Update button text.
    } else {
      gallery.style.display = "none"; // Hide gallery.
      banner.style.display = "flex"; // Show carousel banner.
      viewToggleBtn.textContent = "Switch to Grid"; // Update button text.
    }
  });
}
let currentPage = 1; // Variable to track the current page number.
const pageSize = 10; // Number of images to show per page.

// =======================
// CAROUSEL ROTATION
// =======================
if (nextBtn && prevBtn && slider) { // Only if buttons exist.
  nextBtn.addEventListener("click", () => { // On next button click.
    rotation += 360 / slider.childElementCount; // Increase rotation angle by slice amount. 360 degrees divided by number of images.
    slider.style.setProperty("--rotation", `${rotation}deg`); // Update CSS variable with new rotation. `${}` is template literal to insert variable.
  });

  prevBtn.addEventListener("click", () => { // On previous button click.
    rotation -= 360 / slider.childElementCount; // Decrease rotation angle.
    slider.style.setProperty("--rotation", `${rotation}deg`); // Update CSS variable.
  });
}