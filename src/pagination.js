
import { state } from './main.js'


export const createPagesNavigation = (galleryType) => {
    const pagesNavigation = document.querySelector('.pages-navigation');
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

    const previous = document.createElement('button');
    previous.classList.add('button-previous')
    previous.textContent = 'Previous'
    pagesNavigation.appendChild(previous);

    for (let i = 1; i <= totalPages; i++) {
        const pageNumber = document.createElement('button');
        pageNumber.classList.add(`numbered_button_${i}`)
        pageNumber.textContent = `${i}`;
        pagesNavigation.appendChild(pageNumber);
    }

    const next = document.createElement('button');
    next.classList.add('button-next')
    next.textContent = 'Next'
    pagesNavigation.appendChild(next);
};