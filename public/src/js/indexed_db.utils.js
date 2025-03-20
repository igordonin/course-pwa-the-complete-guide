function databaseExists(storeNames, query) {
  return storeNames.some(function (name) {
    return name === query;
  });
}

var dbPromise = idb.open('posts-store', 1, function (instance) {
  if (!databaseExists(instance.objectStoreNames, 'posts')) {
    instance.createObjectStore('posts', { keyPath: 'id' });
  }
  if (!databaseExists(instance.storeNames, 'sync-posts')) {
    instance.createObjectStore('sync-posts', { keyPath: 'id' });
  }
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

function deleteData(storeName, id) {
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
