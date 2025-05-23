const DB_NAME = "virtual-tour-db"
const STORE_NAME = "zustand-store"
const DB_VERSION = 1

// Funktion zum Öffnen der Datenbank
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      console.error("Fehler beim Öffnen der IndexedDB")
      reject(new Error("Konnte IndexedDB nicht öffnen"))
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onupgradeneeded = (event) => {
      const db = request.result
      // Erstelle einen Object Store, wenn er noch nicht existiert
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
  })
}

// Funktion zum Lesen von Daten aus IndexedDB\
const getItem = async <T>(key: string)
: Promise<T | null> =>
{
  try {
    const db = await openDB()
    return new Promise<T | null>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onerror = () => {
        console.error("Fehler beim Lesen aus IndexedDB");
        reject(new Error("Konnte Daten nicht aus IndexedDB lesen"));
      };

      request.onsuccess = () => {
        resolve(request.result || null);
      };
    });
  } catch (error) {
    console.error("Fehler beim Zugriff auf IndexedDB:", error)
    return null;
  }
}

// Funktion zum Schreiben von Daten in IndexedDB
const setItem = async <T>(key: string, value: T)
: Promise<void> =>
{
  try {
    const db = await openDB()
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(value, key);

      request.onerror = () => {
        console.error("Fehler beim Schreiben in IndexedDB");
        reject(new Error("Konnte Daten nicht in IndexedDB speichern"));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  } catch (error) {
    console.error("Fehler beim Zugriff auf IndexedDB:", error)
    throw error
  }
}

// Funktion zum Löschen von Daten aus IndexedDB
const removeItem = async (key: string): Promise<void> => {
  try {
    const db = await openDB()
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite")
      const store = transaction.objectStore(STORE_NAME)
      const request = store.delete(key)

      request.onerror = () => {
        console.error("Fehler beim Löschen aus IndexedDB")
        reject(new Error("Konnte Daten nicht aus IndexedDB löschen"))
      }

      request.onsuccess = () => {
        resolve()
      }
    })
  } catch (error) {
    console.error("Fehler beim Zugriff auf IndexedDB:", error)
  }
}

// Exportiere den IndexedDB-Storage für Zustand
export const indexedDBStorage = {
  getItem,
  setItem,
  removeItem,
}