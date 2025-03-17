var dbPromise = idb.open('posts-store', 1, function (instance) {
  if (!instance.objectStoreNames.contains('posts')) {
    instance.createObjectStore('posts', { keyPath: 'id' });
  }
});

function writeData(storeName, data) {
  return dbPromise.then(function (db) {
    var tx = db.transaction(storeName, 'readwrite');
    var store = tx.objectStore(storeName);
    store.put(data);
    return tx.complete;
  });
}

function readAllData(storeName) {
  return dbPromise.then(function (db) {
    var tx = db.transaction(storeName, 'readonly');
    var store = tx.objectStore(storeName);
    return store.getAll();
  });
}
