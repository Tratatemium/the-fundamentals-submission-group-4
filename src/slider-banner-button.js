const slider = document.querySelector(".slider"); // Find the element with class 'slider' in HTML and store it in a variable. We use this variable to manipulate the carousel images later.
const banner = document.querySelector(".banner"); // Find the element with class 'banner' and store it. Used to show/hide the carousel banner.
const prevBtn = document.querySelector(".prev"); // Find the element with class 'prev' which is the previous button for carousel.
const nextBtn = document.querySelector(".next"); // Find the element with class 'next' which is the next button for carousel.

let rotation = 0; // Variable to track the rotation angle of the 3D carousel. Starts at 0 degrees.
let allImages = []; // Array to store all image URLs fetched from API.

