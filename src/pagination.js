
import { state } from './main.js'
import { createImage } from './main.js'
import { loadPageFromAPI } from './api.js'


export const getPair = (n) => {
    return [n * 2 - 1, n * 2];
};

const showLoading = (show) => {
    switch (state.galleryType) {
        case 'grid':
            const galleryGrid = document.querySelector(".gallery-grid");
            if (show) {   
                Array.from(galleryGrid.children).forEach(element => galleryGrid.removeChild(element));             
                for (let i = 0; i < 20; i++){
                    const loadingContainer = document.createElement("div");
                    loadingContainer.classList.add("loading-img");
                    galleryGrid.appendChild(loadingContainer);
                }                
            } else {
                Array.from(galleryGrid.children).forEach(element => galleryGrid.removeChild(element));
            }
            break;
        case 'carousel':
            break;
        default:
    }
}


export const loadPages = async (pageClicked) => {
    if (state.loadedPages.length === 0) {
        showLoading(true);
        await loadPageFromAPI(1);
        await loadPageFromAPI(2);
        showLoading(false);
        return;
    }

    switch (state.galleryType) {
        case 'grid':
            const pages = getPair(pageClicked);
            showLoading(true);
            for (const page of pages) {
                await loadPageFromAPI(page);
            }
            showLoading(false);
            break;
        case 'carousel':
            showLoading(true);
            await loadPageFromAPI(pageClicked);
            showLoading(false);
            break;
        default:
    }
}

export const loadGallery = () => {
    let currentImages;
    let pageData;
    switch (state.galleryType) {
        case 'grid':
            const galleryGrid = document.querySelector('.gallery-grid');
            currentImages = Array.from(galleryGrid.children);
            currentImages.forEach(image => galleryGrid.removeChild(image));

            const pages = getPair(state.currentPage);
            pageData = state.imagesData.filter(image => pages.includes(image.page)).map(page => page.data);
            pageData = pageData.flat();
            pageData.forEach(imageData => createImage(imageData));  
            break;
        case 'carousel':
            const galleryCarousel = document.querySelector('.gallery-carousel');
            currentImages = Array.from(galleryCarousel.children);
            currentImages.forEach(image => galleryCarousel.removeChild(image));

            pageData = state.imagesData.find(image => image.page === state.currentPage).data;
            pageData.forEach(imageData => createImage(imageData));
            break;
        default:
    }
};

export const createPagesNavigation = () => {
    const pagesNavigationContainer = document.querySelector('.pages-navigation');
    let totalPages;

    switch (state.galleryType) {
        case 'grid':
            totalPages = Math.ceil(state.totalAmountOfPages / 2);
            break;
        case 'carousel':
            totalPages = state.totalAmountOfPages;
            break;
        default:
    }

    // Remove existing pages navigation buttons
    let navigationButtons = Array.from(
        document.querySelectorAll('.pages-navigation button')
    );
    navigationButtons.forEach(button => pagesNavigationContainer.removeChild(button));

    const previous = document.createElement('button');
    previous.classList.add('button-previous')
    previous.textContent = '⮜ Previous'
    pagesNavigationContainer.appendChild(previous);

    for (let i = 1; i <= totalPages; i++) {
        const pageNumber = document.createElement('button');
        pageNumber.classList.add(`numbered_button_${i}`)
        pageNumber.textContent = `${i}`;
        pagesNavigationContainer.appendChild(pageNumber);

        if (i === state.currentPage) pageNumber.classList.add(`active`)
    }

    const next = document.createElement('button');
    next.classList.add('button-next')
    next.textContent = 'Next ⮞'
    pagesNavigationContainer.appendChild(next);    

    const numberedButtonsOnClick = async (button) => {
        if (!button.classList.contains("active")) {
          // Remove active state from all buttons
          numberedButtons.forEach((button) => button.classList.remove("active"));
          // Set clicked button as active
          button.classList.add("active");
    
          const buttonNumber = [...button.classList]
            .find(className => className.startsWith('numbered_button_'))
            .replace('numbered_button_', '');
          state.currentPage = Number(buttonNumber);
          await loadPages(state.currentPage);
          loadGallery();
        }
    };

    const previousOnClick = async () => {
        if (state.currentPage > 1) {
            state.currentPage--;
            const numberedButtons = document.querySelectorAll('[class^="numbered_button_"]');
            numberedButtons.forEach((button) => button.classList.remove("active"));
            const activeButton = Array.from(numberedButtons).find(
                button => button.classList.contains(`numbered_button_${state.currentPage}`)
            );
            if (activeButton) {
                activeButton.classList.add("active");
            }
            await loadPages(state.currentPage);
            loadGallery();
        }
        
    };

    const nextOnClick = async () => {
        if (state.currentPage < state.totalAmountOfPages) {
            state.currentPage++;
            const numberedButtons = document.querySelectorAll('[class^="numbered_button_"]');
            numberedButtons.forEach((button) => button.classList.remove("active"));
            const activeButton = Array.from(numberedButtons).find(
                button => button.classList.contains(`numbered_button_${state.currentPage}`)
            );
            if (activeButton) {
                activeButton.classList.add("active");
            }
            await loadPages(state.currentPage);
            loadGallery();
        }
    };

    const numberedButtons = document.querySelectorAll('[class^="numbered_button_"]');
    numberedButtons.forEach(button => {
        button.addEventListener('click', event => numberedButtonsOnClick(event.target));
    });
    previous.addEventListener('click', () => previousOnClick());
    next.addEventListener('click', () => nextOnClick());
};