// utils/db.js
const DB_NAME = 'MiotyDB';
const DB_VERSION = 6; // Version erhöht wegen neuem Favorites Store

export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Bestehende Stores
      if (!db.objectStoreNames.contains('sensors')) {
        db.createObjectStore('sensors', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('rooms')) {
        db.createObjectStore('rooms', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('assets')) {
        const assetStore = db.createObjectStore('assets', { keyPath: 'id' });
        assetStore.createIndex('categoryId', 'categoryId', { unique: false });
      }
      if (!db.objectStoreNames.contains('categories')) {
        db.createObjectStore('categories', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('useCases')) {
        db.createObjectStore('useCases', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('templates')) {
        const templatesStore = db.createObjectStore('templates', { keyPath: 'id' });
        templatesStore.createIndex('type_useCase', ['sensorType', 'useCase'], { unique: false });
      }
      if (!db.objectStoreNames.contains('favorites')) {
        const favoriteStore = db.createObjectStore('favorites', { keyPath: 'id' });
        favoriteStore.createIndex('sensorId', 'sensorId', { unique: true });
      }
    };
  });
};

// Generische CRUD Funktionen
const getAll = async (storeName) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

const add = async (storeName, item) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(item);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

const update = async (storeName, item) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(item);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

const remove = async (storeName, id) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

// Spezifische Funktionen für jeden Store
export const dbOperations = {
  sensors: {
    getAll: () => getAll('sensors'),
    add: (sensor) => add('sensors', sensor),
    update: (sensor) => update('sensors', sensor),
    remove: (id) => remove('sensors', id)
  },
  rooms: {
    getAll: () => getAll('rooms'),
    add: (room) => add('rooms', room),
    update: (room) => update('rooms', room),
    remove: (id) => remove('rooms', id)
  },
  assets: {
    getAll: () => getAll('assets'),
    add: (asset) => add('assets', asset),
    update: (asset) => update('assets', asset),
    remove: (id) => remove('assets', id)
  },
  useCases: {
    getAll: () => getAll('useCases'),
    add: (useCase) => add('useCases', useCase),
    update: (useCase) => update('useCases', useCase),
    remove: (id) => remove('useCases', id)
  },
  templates: {
    getAll: () => getAll('templates'),
    getByType: async (sensorType, useCase) => {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction('templates', 'readonly');
        const store = transaction.objectStore('templates');
        const request = store.index('type_useCase').getAll([sensorType, useCase]);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });
    },
    add: (template) => add('templates', template),
    update: (template) => update('templates', template),
    remove: (id) => remove('templates', id),
    hide: async (id) => {
      const template = await dbOperations.templates.getById(id);
      if (template) {
        template.hidden = true;
        return dbOperations.templates.update(template);
      }
    }
  },
  categories: {
    getAll: () => getAll('categories'),
    add: (category) => add('categories', category),
    update: (category) => update('categories', category),
    remove: (id) => remove('categories', id)
  },
  favorites: {
    getAll: () => getAll('favorites'),
    add: (favorite) => add('favorites', favorite),
    update: (favorite) => update('favorites', favorite),
    remove: (id) => remove('favorites', id),
    getBySensorId: async (sensorId) => {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction('favorites', 'readonly');
        const store = transaction.objectStore('favorites');
        const index = store.index('sensorId');
        const request = index.get(sensorId);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });
    }
  }
};