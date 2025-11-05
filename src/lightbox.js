


export const showLightbox = () => {
    const lightbox = document.querySelector('.lightbox');
    lightbox.classList.remove('hidden');
};

export const closeLightbox = () => { 
    const lightbox = document.querySelector('.lightbox');
    lightbox.classList.add('hidden');
};

const lightboxCloseButton = document.querySelector('.lightbox-close-button'); 
lightboxCloseButton.addEventListener('click', () => closeLightbox());
// const images = Array.from(document.querySelectorAll('.image-container'));
// images.forEach(image => {
//     image.addEventListener('click', () => showLightbox())
// });

