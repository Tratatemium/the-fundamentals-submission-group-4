// =======================
// THEME TOGGLE (Dark/Light mode)
// =======================
const themeToggleBtn = document.getElementById("theme-toggle");
if (themeToggleBtn) {
  // Check for saved theme preference or default to light mode
  const currentTheme = localStorage.getItem('theme') || 'light';
  if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
  }
  
  // Update toggle text based on current theme
  updateThemeToggleText();
  
  themeToggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    
    // Save theme preference
    const theme = document.body.classList.contains("dark-mode") ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    
    updateThemeToggleText();
  });
  
  function updateThemeToggleText() {
    const isDarkMode = document.body.classList.contains("dark-mode");
    themeToggleBtn.innerHTML = `
      <span class="theme-toggle-wrapper">
        <span class="theme-toggle-track">
          <span class="theme-toggle-thumb"></span>
          <span class="theme-icon theme-icon-light">☀️</span>
          <span class="theme-icon theme-icon-dark">🌙</span>
        </span>
        <span class="theme-toggle-label">${isDarkMode ? 'Dark' : 'Light'} Mode</span>
      </span>
    `;
    themeToggleBtn.setAttribute('aria-pressed', isDarkMode);
  }
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


const hamburgerButton = document.querySelector('.hamburger-menu-button');
const navigation = document.getElementById(hamburgerButton.getAttribute('aria-controls'));

hamburgerButton.addEventListener('click', () => {
  const expanded = hamburgerButton.getAttribute('aria-expanded') === 'true';
  hamburgerButton.setAttribute('aria-expanded', String(!expanded));

  if (navigation) navigation.hidden = expanded;
});