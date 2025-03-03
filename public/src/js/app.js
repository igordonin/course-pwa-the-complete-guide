if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then((it) => {
    console.log('service work has been registered');
  });
}

var deferredPromptEvent;
window.addEventListener('beforeinstallprompt', (event) => {
  console.log('beforeinstallprompt fired');
  event.preventDefault();
  deferredPromptEvent = event;
  return false;
});
