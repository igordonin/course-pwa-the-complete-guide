var dbPromise = idb.open('posts-store', 4, function (instance) {
  ['posts', 'sync-posts'].forEach((storeName) => {
    if (!instance.objectStoreNames.contains(storeName)) {
      instance.createObjectStore(storeName, { keyPath: 'id' });
    }
  });
});

function writeData(storeName, data) {
  return dbPromise.then(function (db) {
    var tx = db.transaction(storeName, 'readwrite');
    var store = tx.objectStore(storeName);
    store.put(data);
    // after very write operation, it's required to return tx.complete
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

function clearAllData(storeName) {
  return dbPromise.then(function (db) {
    var tx = db.transaction(storeName, 'readwrite');
    var store = tx.objectStore(storeName);
    store.clear();
    return tx.complete;
  });
}

function deleteById(storeName, id) {
  console.log('Trying to delete: ', id);
  return dbPromise
    .then(function (db) {
      var tx = db.transaction(storeName, 'readwrite');
      var store = tx.objectStore(storeName);
      store.delete(id);
      return tx.complete;
    })
    .then(function () {
      console.log('Item deleted!');
    });
}
