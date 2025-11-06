
import { state } from './main.js'
import { loadPageFromAPI } from './api.js'


export const loadPages = async (pageClicked) => {
    if (state.loadedPages.length === 0) {
        await loadPageFromAPI(1);
        await loadPageFromAPI(2);
        return;
    }

    switch (state.galleryType) {
        case 'grid':
            const getPair = (n) => {
                return [n * 2 - 1, n * 2];
            };
            const pages = getPair(pageClicked);
            for (const page of pages) {
                await loadPageFromAPI(page);
            }
            break;
        case 'carousel':
            await loadPageFromAPI(pageClicked);
            break;
        default:
    }
}


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
        }
    };

    const numberedButtons = document.querySelectorAll('[class^="numbered_button_"]');
    numberedButtons.forEach(button => {
        button.addEventListener('click', event => numberedButtonsOnClick(event.target));
    });
    previous.addEventListener('click', () => previousOnClick());
    next.addEventListener('click', () => nextOnClick());
};






// state.imagesData = [
//     {
//         page: 1,
//         data: [
//             {
//                 "id": "uuid",
//                 "image_url": "https://picsum.photos/300?random=12",
//                 "likes_count": 5,
//                 "comments": [
//                     { "commenter_name": "Alice", "comment": "Beautiful photo!" }
//                 ]
//             },
//             {
//                 "id": "uuid",
//                 "image_url": "https://picsum.photos/300?random=12",
//                 "likes_count": 5,
//                 "comments": [
//                     { "commenter_name": "Alice", "comment": "Beautiful photo!" }
//                 ]
//             }
//         ]
//     },
//     {
//         page: 2,
//         data: [
//             {
//                 "id": "uuid",
//                 "image_url": "https://picsum.photos/300?random=12",
//                 "likes_count": 5,
//                 "comments": [
//                     { "commenter_name": "Alice", "comment": "Beautiful photo!" }
//                 ]
//             },
//             {
//                 "id": "uuid",
//                 "image_url": "https://picsum.photos/300?random=12",
//                 "likes_count": 5,
//                 "comments": [
//                     { "commenter_name": "Alice", "comment": "Beautiful photo!" }
//                 ]
//             }
//         ]
//     }
    
// ]

// state.imagesData[state.currentPage - 1].data[1].likes_count