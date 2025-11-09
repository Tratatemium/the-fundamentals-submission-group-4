
import { state } from "./main";

export const showLightbox = (imageData) => {
    const lightbox = document.querySelector('.lightbox');
    lightbox.classList.remove('hidden');

    const lightboxImage = document.querySelector('.lightbox-image'); 
    lightboxImage.src = imageData.image_url;

    const overlay = document.querySelector('.overlay');
    overlay.classList.remove('hidden');

    const lightboxComments = document.querySelector('.lightbox-comments');
    lightboxComments.textContent = ''; // Clear previous comments
    
    imageData.comments.forEach(commentItem => {
        const userNameParagraph = document.createElement('p');
        userNameParagraph.classList.add('lightbox-user-name');
        userNameParagraph.textContent = commentItem.commenter_name + ':';
        lightboxComments.appendChild(userNameParagraph);

        const userCommentParagraph = document.createElement('p');
        userCommentParagraph.classList.add('lightbox-user-comment');
        userCommentParagraph.textContent = commentItem.comment;
        lightboxComments.appendChild(userCommentParagraph);

    });
 
};

const closeLightbox = () => { 
    const lightbox = document.querySelector('.lightbox');
    lightbox.classList.add('hidden');

    const overlay = document.querySelector('.overlay');
    overlay.classList.add('hidden');
};

const lightboxCloseButton = document.querySelector('.lightbox-close-button'); 
lightboxCloseButton.addEventListener('click', () => closeLightbox());



