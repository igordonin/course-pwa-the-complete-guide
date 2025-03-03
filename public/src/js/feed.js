var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector(
  '#close-create-post-modal-btn'
);

function openCreatePostModal() {
  createPostArea.style.display = 'block';
  if (deferredPromptEvent) {
    deferredPromptEvent.prompt();
    deferredPromptEvent.userChoice.then((result) => {
      console.log('user choice outcome: ', result.outcome);

      if (result.outcome === 'dismissed') {
        console.log('User dismissed installation');
      } else {
        console.log('User added to home screen');
      }
    });

    deferredPromptEvent = null;
  }
}

function closeCreatePostModal() {
  createPostArea.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);
