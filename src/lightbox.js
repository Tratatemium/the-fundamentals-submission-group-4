
import { state } from "./main";

const lightbox = document.querySelector('.lightbox');
const lightboxImage = document.querySelector('.lightbox-image');
const overlay = document.querySelector('.overlay');
const lightboxComments = document.querySelector('.lightbox-comments');

export const showLightbox = (imageData) => {
    document.body.classList.add('lightbox-open'); // Prevent background scrolling
    lightbox.classList.remove('hidden'); // Show the lightbox

    lightboxImage.src = imageData.image_url; // Set the lightbox image source

    overlay.classList.remove('hidden');

    lightboxComments.textContent = ''; // Clear previous comments

    imageData.comments.reverse().forEach(commentItem => {
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
    document.body.classList.remove('lightbox-open');
    const lightbox = document.querySelector('.lightbox');
    lightbox.classList.add('hidden');

    const overlay = document.querySelector('.overlay');
    overlay.classList.add('hidden');
};

const lightboxCloseButton = document.querySelector('.lightbox-close-button');
lightboxCloseButton.addEventListener('click', () => closeLightbox());

const commentForm = document.querySelector('.lightbox-comment-form');
const userNameInput = document.querySelector('.lightbox-user-name-input');
const commentInput = document.querySelector('.lightbox-comment-input');

commentForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent reloading the page

    const userCommentParagraph = document.createElement('p');
    userCommentParagraph.classList.add('lightbox-user-comment');
    userCommentParagraph.textContent = commentInput.value;
    lightboxComments.prepend(userCommentParagraph);

    const userNameParagraph = document.createElement('p');
    userNameParagraph.classList.add('lightbox-user-name');
    userNameParagraph.textContent = userNameInput.value + ':';
    lightboxComments.prepend(userNameParagraph);



    commentInput.value = '';

});

// Possibility to close the lightbox by pressing "Esc"
document.addEventListener('keydown', (event) => {
    if (document.body.classList.contains('lightbox-open') && event.key === 'Escape') closeLightbox();
});