let db;
const DB_NAME = 'Pogeflex';
const DB_VERSION = 1;
const STORE_NAME = 'cards';

export function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error('Database error:', event.target.error);
            reject(event.target.error);
        };

        request.onupgradeneeded = (event) => {
            const dbInstance = event.target.result;
            if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
                dbInstance.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };
    });
}

export function saveCard(card) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(card);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export function getAllCards() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}


// --- IndexedDB: Fetch Random Card ---
export async function getRandomCardFromIndexedDB() {
  if (!db) {
    // This case might happen if called before initDB is complete, though unlikely with current flow.
    // Return null to avoid breaking AI logic.
    return null;
  }
  return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const countRequest = store.count();

      countRequest.onerror = () => reject(countRequest.error);

      countRequest.onsuccess = () => {
        const count = countRequest.result;
        if (count === 0) {
          resolve(null);
          return;
        }

        const randomIndex = Math.floor(Math.random() * count);
        const getAllRequest = store.getAll();

        getAllRequest.onerror = () => reject(getAllRequest.error);
        getAllRequest.onsuccess = () => {
          const randomCard = getAllRequest.result[randomIndex];
          resolve(randomCard);
        };
      };
  });
}

