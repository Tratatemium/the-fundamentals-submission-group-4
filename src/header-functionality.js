// =======================
// THEME TOGGLE (Dark/Light mode)
// =======================
const themeToggleBtn = document.getElementById("theme-toggle"); // Find the button for toggling dark/light mode.
if (themeToggleBtn) { // Check if the button exists to avoid errors on pages without it.
  themeToggleBtn.addEventListener("click", () => { // Add click listener. When clicked, execute the following function.
    document.body.classList.toggle("dark-mode"); // Toggle the 'dark-mode' class on the <body>. Adds it if missing, removes it if present.
    themeToggleBtn.textContent = document.body.classList.contains("dark-mode") ? "☀️" : "🌙"; // Change the button text based on current mode. '${...}' is template literal syntax to insert variables into strings.
  });
}

// =======================
// SUBSCRIBE POPUP
// =======================
const subscribeBtn = document.getElementById("subscribe-btn"); // Button to open popup.
const subscribePopup = document.getElementById("subscribe-popup"); // Popup element.
const subscribeClose = document.getElementById("subscribe-close"); // Close button.
const subscribeSubmit = document.getElementById("subscribe-submit"); // Submit button.
const subscribeEmail = document.getElementById("subscribe-email"); // Input field for email.

if (subscribeBtn) {
  subscribeBtn.addEventListener("click", () => {
    subscribePopup.style.display = "flex"; // Show popup on button click.
  });
}

if (subscribeClose) {
  subscribeClose.addEventListener("click", () => {
    subscribePopup.style.display = "none"; // Hide popup on close.
  });
}

if (subscribeSubmit) {
  subscribeSubmit.addEventListener("click", () => {
    const email = subscribeEmail.value.trim(); // Get email and remove spaces.
    if (!email || !email.includes("@")) { // Validate basic email.
      alert("Please enter a valid email."); // Show alert if invalid.
      return; // Stop execution.
    }
    alert("✅ Thank you for subscribing!"); // Show success message.
    subscribeEmail.value = ""; // Clear input.
    subscribePopup.style.display = "none"; // Close popup.
  });
}

if (subscribePopup) {
  subscribePopup.addEventListener("click", (e) => {
    if (e.target === subscribePopup) { // Click outside content.
      subscribePopup.style.display = "none"; // Close popup.
    }
  });
}
