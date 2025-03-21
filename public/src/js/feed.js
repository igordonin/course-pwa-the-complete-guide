var API_URL = 'https://pwa-course-90792-default-rtdb.firebaseio.com/posts.json';

var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector(
  '#close-create-post-modal-btn'
);
var sharedMomentsArea = document.querySelector('#shared-moments');

function openCreatePostModal() {
  createPostArea.style.display = 'block';
  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(function (choiceResult) {
      console.log(choiceResult.outcome);

      if (choiceResult.outcome === 'dismissed') {
        console.log('User cancelled installation');
      } else {
        console.log('User added to home screen');
      }
    });

    deferredPrompt = null;
  }
}

function closeCreatePostModal() {
  createPostArea.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

function clearCards() {
  while (sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function createCard(card) {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = `url("${card.image}")`;
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '180px';
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = card.title;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = card.location;
  cardSupportingText.style.textAlign = 'center';
  // this is a feature that would allow the user to save content
  // for access while in offline mode on demand: cache on demand
  // var cardSavedButton = document.createElement('button');
  // cardSavedButton.textContent = 'Save';
  // cardSavedButton.addEventListener('click', async (event) => {
  //   console.log('clicked');
  //   // check if we have caches available
  //   if ('caches' in window) {
  //     const cache = await caches.open('ui');
  //     cache.add(API_URL);
  //     cache.add('/src/images/sf-boat.jpg');
  //   }
  // });
  // cardSupportingText.appendChild(cardSavedButton);
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

function updateUi(data) {
  data.forEach((card) => {
    createCard(card);
  });
}

// This is a strategy to prevent Network data (preferred) from
// being overriden by Cache data, as they're in race condition
// with this implementation
var networkReceived = false;

// Cache then Network Strategy
// Makes parallel calls to both the caches and the Network
fetch(API_URL)
  .then(function (res) {
    return res.json();
  })
  .then(function (data) {
    console.log('From Web', data);
    networkReceived = true;
    clearCards();
    updateUi(Object.values(data));
  });

if ('indexedDb' in window) {
  readAllData('posts').then(function (data) {
    if (!networkReceived) {
      console.log('From Cache', data);
      clearCards();
      updateUi(data);
    }
  });
}
