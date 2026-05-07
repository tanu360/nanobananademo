// Image History using IndexedDB for large storage (~50MB+)

export interface HistoryItem {
   id: string;
   type: "generate" | "edit" | "upscale";
   prompt?: string;
   imageUrl: string;
   thumbnailUrl?: string;
   timestamp: number;
   params?: Record<string, unknown>;
}

const DB_NAME = "nanoBananaHistory";
const DB_VERSION = 1;
const STORE_NAME = "images";
const MAX_HISTORY_ITEMS = 50; // Keep last 50 images to manage storage

let db: IDBDatabase | null = null;

// Initialize IndexedDB
function openDB(): Promise<IDBDatabase> {
   return new Promise((resolve, reject) => {
      if (db) {
         resolve(db);
         return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
         db = request.result;
         resolve(db);
      };

      request.onupgradeneeded = (event) => {
         const database = (event.target as IDBOpenDBRequest).result;
         if (!database.objectStoreNames.contains(STORE_NAME)) {
            const store = database.createObjectStore(STORE_NAME, { keyPath: "id" });
            store.createIndex("timestamp", "timestamp", { unique: false });
            store.createIndex("type", "type", { unique: false });
         }
      };
   });
}

// Convert image URL to base64 for storage
async function urlToBase64(url: string): Promise<string> {
   // If already base64, return as is
   if (url.startsWith("data:")) return url;

   try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
         const reader = new FileReader();
         reader.onloadend = () => resolve(reader.result as string);
         reader.onerror = reject;
         reader.readAsDataURL(blob);
      });
   } catch {
      return url; // Return original if conversion fails
   }
}

// Save image to history
export async function saveToHistory(
   type: HistoryItem["type"],
   imageUrl: string,
   prompt?: string,
   params?: Record<string, unknown>
): Promise<void> {
   try {
      const database = await openDB();

      // Convert to base64 for persistent storage
      const base64 = await urlToBase64(imageUrl);

      const item: HistoryItem = {
         id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
         type,
         prompt,
         imageUrl: base64,
         thumbnailUrl: base64, // Use same image, no quality reduction
         timestamp: Date.now(),
         params,
      };

      const transaction = database.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      store.add(item);

      // Cleanup old items if exceeding limit
      await cleanupOldItems();
   } catch (error) {
      console.error("Failed to save to history:", error);
   }
}

// Get all history items (sorted by newest first)
export async function getHistory(): Promise<HistoryItem[]> {
   try {
      const database = await openDB();

      return new Promise((resolve, reject) => {
         const transaction = database.transaction(STORE_NAME, "readonly");
         const store = transaction.objectStore(STORE_NAME);
         const index = store.index("timestamp");
         const request = index.openCursor(null, "prev"); // Descending order

         const items: HistoryItem[] = [];

         request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest).result;
            if (cursor) {
               items.push(cursor.value);
               cursor.continue();
            } else {
               resolve(items);
            }
         };

         request.onerror = () => reject(request.error);
      });
   } catch {
      return [];
   }
}

// Get single history item by ID
export async function getHistoryItem(id: string): Promise<HistoryItem | null> {
   try {
      const database = await openDB();

      return new Promise((resolve, reject) => {
         const transaction = database.transaction(STORE_NAME, "readonly");
         const store = transaction.objectStore(STORE_NAME);
         const request = store.get(id);

         request.onsuccess = () => resolve(request.result || null);
         request.onerror = () => reject(request.error);
      });
   } catch {
      return null;
   }
}

// Delete history item
export async function deleteHistoryItem(id: string): Promise<void> {
   try {
      const database = await openDB();

      return new Promise((resolve, reject) => {
         const transaction = database.transaction(STORE_NAME, "readwrite");
         const store = transaction.objectStore(STORE_NAME);
         const request = store.delete(id);

         request.onsuccess = () => resolve();
         request.onerror = () => reject(request.error);
      });
   } catch (error) {
      console.error("Failed to delete history item:", error);
   }
}

// Clear all history
export async function clearHistory(): Promise<void> {
   try {
      const database = await openDB();

      return new Promise((resolve, reject) => {
         const transaction = database.transaction(STORE_NAME, "readwrite");
         const store = transaction.objectStore(STORE_NAME);
         const request = store.clear();

         request.onsuccess = () => resolve();
         request.onerror = () => reject(request.error);
      });
   } catch (error) {
      console.error("Failed to clear history:", error);
   }
}

// Cleanup old items to manage storage
async function cleanupOldItems(): Promise<void> {
   try {
      const items = await getHistory();

      if (items.length > MAX_HISTORY_ITEMS) {
         const itemsToDelete = items.slice(MAX_HISTORY_ITEMS);
         for (const item of itemsToDelete) {
            await deleteHistoryItem(item.id);
         }
      }
   } catch (error) {
      console.error("Failed to cleanup old items:", error);
   }
}

// Get history count
export async function getHistoryCount(): Promise<number> {
   try {
      const database = await openDB();

      return new Promise((resolve, reject) => {
         const transaction = database.transaction(STORE_NAME, "readonly");
         const store = transaction.objectStore(STORE_NAME);
         const request = store.count();

         request.onsuccess = () => resolve(request.result);
         request.onerror = () => reject(request.error);
      });
   } catch {
      return 0;
   }
}
