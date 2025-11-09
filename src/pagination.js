
/**
 * Pagination and gallery management with dual-mode support
 * Handles grid mode (2 pages per view) and carousel mode (1 page per view)
 * Includes loading animations and page navigation controls
 */

// Import state management, image creation, and API functions
import { state } from './main.js'
import { createImage } from './main.js'
import { loadPageFromAPI } from './api.js'

// Calculates the pair of API pages needed for grid mode display
export const getPair = (n) => {
    return [n * 2 - 1, n * 2];
};

// Shows/hides loading skeleton animation during API requests
const showLoading = (show) => {
    switch (state.galleryType) {
        case 'grid':
            const galleryGrid = document.querySelector(".gallery-grid");
            if (show) {   
                // Clear existing content and show loading skeletons
                Array.from(galleryGrid.children).forEach(element => galleryGrid.removeChild(element));             
                for (let i = 0; i < 20; i++){
                    const loadingContainer = document.createElement("div");
                    loadingContainer.classList.add("loading-img");
                    galleryGrid.appendChild(loadingContainer);
                }                
            } else {
                // Clear all content including skeletons
                Array.from(galleryGrid.children).forEach(element => galleryGrid.removeChild(element));
            }
            break;
        case 'carousel':
            // TODO: Implement carousel loading animation
            break;
        default:
            break;
    }
}


// Loads pages from API based on gallery mode and user selection
export const loadPages = async (pageClicked) => {
    // Initial application load: always load first two pages
    if (state.loadedPages.length === 0) {
        showLoading(true);
        await loadPageFromAPI(1);
        await loadPageFromAPI(2);
        showLoading(false);
        return;
    }

    // Handle user navigation based on current gallery mode
    switch (state.galleryType) {
        case 'grid':
            // Grid mode: load pairs of consecutive pages
            const pages = getPair(pageClicked);
            showLoading(true);
            for (const page of pages) {
                await loadPageFromAPI(page);  // Sequential loading for better performance
            }
            showLoading(false);
            break;
        case 'carousel':
            // Carousel mode: load single page as requested
            showLoading(true);
            await loadPageFromAPI(pageClicked);
            showLoading(false);
            break;
        default:
            break;
    }
}

// Renders current page images to the appropriate gallery container
export const loadGallery = () => {
    let currentImages;
    let pageData;
    
    switch (state.galleryType) {
        case 'grid':
            // Grid mode: display page pairs in grid container
            const galleryGrid = document.querySelector('.gallery-grid');
            currentImages = Array.from(galleryGrid.children);
            currentImages.forEach(image => galleryGrid.removeChild(image));

            // Get page pair data and flatten for display
            const pages = getPair(state.currentPage);
            pageData = state.imagesData.filter(image => pages.includes(image.page)).map(page => page.data);
            pageData = pageData.flat();  // Flatten array of arrays for rendering
            pageData.forEach(imageData => createImage(imageData));  
            break;
            
        case 'carousel':
            // Carousel mode: display single page in carousel container
            const galleryCarousel = document.querySelector('.gallery-carousel');
            currentImages = Array.from(galleryCarousel.children);
            currentImages.forEach(image => galleryCarousel.removeChild(image));

            // Get single page data for carousel display
            pageData = state.imagesData.find(image => image.page === state.currentPage).data;
            pageData.forEach(imageData => createImage(imageData));
            break;
            
        default:
            break;
    }
};

/**
 * Creates and manages comprehensive pagination navigation controls
 * @description Generates interactive pagination interface with Previous/Next buttons and numbered
 * page buttons. Handles different pagination calculations for grid vs carousel modes and provides
 * complete navigation functionality with visual feedback and state management.
 * 
 * Navigation Components:
 * - Previous button: navigates to previous page with boundary checking
 * - Numbered buttons: direct page navigation with active state highlighting
 * - Next button: navigates to next page with boundary checking
 * - Dynamic generation: adapts to total page count and gallery mode
 * 
 * Pagination Logic:
 * - Grid mode: totalPages = Math.ceil(state.totalAmountOfPages / 2) (page pairs)
 * - Carousel mode: totalPages = state.totalAmountOfPages (individual pages)
 * - Active states: visual feedback for current page
 * - Boundary handling: prevents navigation beyond available pages
 * 
 * Event Handling Architecture:
 * - numberedButtonsOnClick(): handles direct page selection
 * - previousOnClick(): handles previous page navigation
 * - nextOnClick(): handles next page navigation
 * - State synchronization: updates state.currentPage and visual indicators
 * - Full workflow: each interaction triggers load → display → update cycle
 * 
 * Features:
 * - Complete navigation: Previous, numbered pages, Next buttons
 * - Mode-aware pagination: different calculations for grid vs carousel
 * - Visual feedback: active class highlighting for current page
 * - Boundary protection: prevents invalid page navigation
 * - State management: centralized state updates and synchronization
 * - Event delegation: efficient event handling for dynamic buttons
 * - DOM optimization: efficient button cleanup and recreation
 * 
 * Dependencies:
 * - state.galleryType: determines pagination calculation method
 * - state.totalAmountOfPages: total API pages available
 * - state.currentPage: current page for highlighting and navigation
 * - loadPages(): async function to load required API data
 * - loadGallery(): function to render images to DOM
 * - DOM: '.pages-navigation' container element
 * 
 * @example
 * createPagesNavigation();  // Creates full pagination interface based on current state
 */
export const createPagesNavigation = () => {
    const pagesNavigationContainer = document.querySelector('.pages-navigation');
    let totalPages;

    // Calculate total navigation pages based on gallery mode
    switch (state.galleryType) {
        case 'grid':
            // Grid mode: each navigation page represents 2 API pages
            totalPages = Math.ceil(state.totalAmountOfPages / 2);
            break;
        case 'carousel':
            // Carousel mode: each navigation page represents 1 API page
            totalPages = state.totalAmountOfPages;
            break;
        default:
            totalPages = state.totalAmountOfPages;
    }

    // Clear existing navigation buttons for fresh rendering
    let navigationButtons = Array.from(
        document.querySelectorAll('.pages-navigation button')
    );
    navigationButtons.forEach(button => pagesNavigationContainer.removeChild(button));

    // Create Previous navigation button
    const previous = document.createElement('button');
    previous.classList.add('button-previous')
    previous.textContent = '⮜ Previous'
    pagesNavigationContainer.appendChild(previous);

    // Generate numbered page buttons
    for (let i = 1; i <= totalPages; i++) {
        const pageNumber = document.createElement('button');
        pageNumber.classList.add(`numbered_button_${i}`)
        pageNumber.textContent = `${i}`;
        pagesNavigationContainer.appendChild(pageNumber);

        // Highlight current page button
        if (i === state.currentPage) pageNumber.classList.add(`active`)
    }

    // Create Next navigation button
    const next = document.createElement('button');
    next.classList.add('button-next')
    next.textContent = 'Next ⮞'
    pagesNavigationContainer.appendChild(next);    

    /**
     * Handles numbered page button clicks for direct navigation
     * @param {HTMLElement} button - The clicked numbered button element
     * @description Processes direct page navigation when user clicks numbered buttons.
     * Prevents redundant navigation, updates visual states, and triggers data loading.
     * 
     * Click Processing:
     * 1. Checks if button is already active (prevents redundant navigation)
     * 2. Removes active class from all numbered buttons
     * 3. Adds active class to clicked button
     * 4. Extracts page number from button class name
     * 5. Updates state.currentPage and triggers data loading workflow
     * 
     * Features:
     * - Redundancy prevention: ignores clicks on already active buttons
     * - State synchronization: updates both visual and application state
     * - Class name parsing: extracts page number from CSS class
     * - Full workflow: triggers loadPages() and loadGallery() for complete update
     */
    const numberedButtonsOnClick = async (button) => {
        if (!button.classList.contains("active")) {
          // Remove active state from all numbered buttons
          numberedButtons.forEach((button) => button.classList.remove("active"));
          // Set clicked button as active
          button.classList.add("active");
    
          // Extract page number from button class name
          const buttonNumber = [...button.classList]
            .find(className => className.startsWith('numbered_button_'))
            .replace('numbered_button_', '');
          
          // Update state and trigger data loading workflow
          state.currentPage = Number(buttonNumber);
          await loadPages(state.currentPage);
          loadGallery();
        }
    };

    /**
     * Handles Previous button click for backward navigation
     * @description Navigates to the previous page with boundary checking and state management.
     * Updates visual indicators and triggers data loading for seamless user experience.
     * 
     * Navigation Logic:
     * 1. Checks boundary condition (prevents going below page 1)
     * 2. Decrements state.currentPage
     * 3. Updates visual state by removing all active classes
     * 4. Finds and activates button for new current page
     * 5. Triggers data loading workflow
     * 
     * Features:
     * - Boundary protection: prevents navigation below page 1
     * - State management: updates centralized application state
     * - Visual synchronization: updates button active states
     * - Full workflow: triggers complete data loading and display update
     * - Error handling: gracefully handles missing button elements
     */
    const previousOnClick = async () => {
        if (state.currentPage > 1) {
            // Decrement current page
            state.currentPage--;
            
            // Update visual state of numbered buttons
            const numberedButtons = document.querySelectorAll('[class^="numbered_button_"]');
            numberedButtons.forEach((button) => button.classList.remove("active"));
            
            // Find and activate button for new current page
            const activeButton = Array.from(numberedButtons).find(
                button => button.classList.contains(`numbered_button_${state.currentPage}`)
            );
            if (activeButton) {
                activeButton.classList.add("active");
            }
            
            // Trigger data loading workflow
            await loadPages(state.currentPage);
            loadGallery();
        }
    };

    /**
     * Handles Next button click for forward navigation
     * @description Navigates to the next page with boundary checking and state management.
     * Updates visual indicators and triggers data loading for seamless user experience.
     * 
     * Navigation Logic:
     * 1. Checks boundary condition (prevents exceeding total pages)
     * 2. Increments state.currentPage
     * 3. Updates visual state by removing all active classes
     * 4. Finds and activates button for new current page
     * 5. Triggers data loading workflow
     * 
     * Features:
     * - Boundary protection: prevents navigation beyond available pages
     * - State management: updates centralized application state    
     * - Visual synchronization: updates button active states
     * - Full workflow: triggers complete data loading and display update
     * - Error handling: gracefully handles missing button elements
     */
    const nextOnClick = async () => {

        switch (state.galleryType) {
        case 'grid':
            if (state.currentPage >= Math.ceil(state.totalAmountOfPages / 2)) return;
            break;
        case 'carousel':
            if (state.currentPage >= state.totalAmountOfPages) return;
            break;
        default:
            break;
        }

        // Increment current page
        state.currentPage++;
        
        // Update visual state of numbered buttons
        const numberedButtons = document.querySelectorAll('[class^="numbered_button_"]');
        numberedButtons.forEach((button) => button.classList.remove("active"));
        
        // Find and activate button for new current page
        const activeButton = Array.from(numberedButtons).find(
            button => button.classList.contains(`numbered_button_${state.currentPage}`)
        );
        if (activeButton) {
            activeButton.classList.add("active");
        }
        
        // Trigger data loading workflow
        await loadPages(state.currentPage);
        loadGallery();

    };

    // Attach event listeners to all navigation elements
    const numberedButtons = document.querySelectorAll('[class^="numbered_button_"]');
    numberedButtons.forEach(button => {
        button.addEventListener('click', event => numberedButtonsOnClick(event.target));
    });
    previous.addEventListener('click', () => previousOnClick());
    next.addEventListener('click', () => nextOnClick());
};