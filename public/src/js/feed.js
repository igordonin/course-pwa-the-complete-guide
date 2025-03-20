var API_URL = 'https://pwa-course-90792-default-rtdb.firebaseio.com/posts.json';

var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector(
  '#close-create-post-modal-btn'
);
var sharedMomentsArea = document.querySelector('#shared-moments');

var form = document.querySelector('form');

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

var titleInput = document.querySelector('#title');
var locationInput = document.querySelector('#location');

// Fallback sendData
function sendData() {
  fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      id: new Date().toISOString(),
      title: titleInput.value,
      location: locationInput.value,
      image:
        'https://imagedelivery.net/0ObHXyjKhN5YJrtuYFSvjQ/i-018c7670-9018-4a7e-841d-c5b0c42bc531-Apple-Painting-Original-Artwork-Red-Apple-Decor-Fruit-Still-Life-Impasto-Farmhouse-Kitchen-Wall-Art-Small-Oil-Painting-Gift-6x6-by-LimArt4U-Felting-Painting/display',
    }),
  }).then(function (res) {
    console.log('Sent data', res);
    updateUi();
  });
}

form.addEventListener('submit', function (event) {
  event.preventDefault();

  if (titleInput.value.trim() === '' || locationInput.value.trim() === '') {
    alert('Please enter valid data!');
    return;
  }

  closeCreatePostModal();

  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    // the reason we reach out to the service worker like this is because
    // the event happens in the web page, so the service worker here does
    // not have access to the that event.
    navigator.serviceWorker.ready.then(function (sw) {
      var post = {
        id: new Date().toISOString(),
        title: titleInput.value,
        location: locationInput.value,
      };

      // so, first we write the data to the indexedDb
      writeData('sync-posts', post)
        .then(function () {
          return sw.sync.register('sync-new-posts');
        })
        .then(function () {
          var snackbarContainer = document.querySelector('#confirmation-toast');
          var data = { message: 'Your post was saved for syncing!' };
          snackbarContainer.MaterialSnackbar.showSnackbar(data);
        })
        .catch(function (error) {
          console.log(error);
        });
    });
  } else {
    // use fallback here
    sendData();
  }
});
