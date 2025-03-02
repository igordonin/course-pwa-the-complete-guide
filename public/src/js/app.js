if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then((it) => {
    console.log('service work has been registered');
  });
}
