


export const showLightbox = (imageUrl) => {
    const lightbox = document.querySelector('.lightbox');
    lightbox.classList.remove('hidden');
    const lightboxImage = document.querySelector('.lightbox-image'); 
    lightboxImage.src = imageUrl;
    const overlay = document.querySelector('.overlay');
    overlay.classList.remove('hidden');

};

const closeLightbox = () => { 
    const lightbox = document.querySelector('.lightbox');
    lightbox.classList.add('hidden');
    const overlay = document.querySelector('.overlay');
    overlay.classList.add('hidden');
};

const lightboxCloseButton = document.querySelector('.lightbox-close-button'); 
lightboxCloseButton.addEventListener('click', () => closeLightbox());



