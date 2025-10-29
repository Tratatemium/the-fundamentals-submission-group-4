import './style.css';

const appContainer = document.getElementById('app');

const createImage = (src) => {
  const appImg = document.createElement('img');
  appImg.classList.add('app-img');
  appImg.src = src;
  appContainer.appendChild(appImg);
};

const createImages = () => {

};

const init = () => {
  fetch('https://image-feed-api.vercel.app/api/images/e8cd3ffd-794c-4ec6-b375-7788dbb14275')
  .then(resp => resp.json())
  .then(json => createImage(json.image_url));
}

// init();



const fetchImages = () => {
  fetch('https://image-feed-api.vercel.app/api/images', {page: '3'})
  .then(resp => resp.json())
  .then(json => json.data.forEach(element => createImage(element.image_url)));
};

fetchImages();
