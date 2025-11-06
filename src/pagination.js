
import { state } from './main.js'


export const createPagesNavigation = (galleryType) => {
    const pagesNavigationContainer = document.querySelector('.pages-navigation');
    let totalPages;

    switch (galleryType) {
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

    const numberedButtonsOnClick = (button) => {
        if (!button.classList.contains("active")) {
          // Remove active state from all buttons
          numberedButtons.forEach((button) => button.classList.remove("active"));
          // Set clicked button as active
          button.classList.add("active");
    
          const buttonNumber = [...button.classList]
            .find(className => className.startsWith('numbered_button_'))
            .replace('numbered_button_', '');
          state.currentPage = Number(buttonNumber);    
        }
    };

    const previousOnClick = () => {

    };

    const nextOnClick = () => {

    };

    const numberedButtons = document.querySelectorAll('[class^="numbered_button_"]');
    numberedButtons.forEach(button => {
        button.addEventListener('click', event => numberedButtonsOnClick(event.target));
    });
};