// Image caching utility for preloading and caching result images
// This ensures quick loading when switching between tabs

const imageCache = new Map<string, HTMLImageElement>();

/**
 * Preload and cache an image URL
 * Returns a promise that resolves when the image is loaded
 */
export function preloadImage(url: string): Promise<void> {
   return new Promise((resolve, reject) => {
      // Skip if already cached
      if (imageCache.has(url)) {
         resolve();
         return;
      }

      // Skip data URLs (already in memory)
      if (url.startsWith('data:')) {
         resolve();
         return;
      }

      const img = new Image();
      img.onload = () => {
         imageCache.set(url, img);
         resolve();
      };
      img.onerror = () => {
         reject(new Error(`Failed to preload image: ${url}`));
      };
      img.src = url;
   });
}

/**
 * Preload multiple images in parallel
 */
export function preloadImages(urls: string[]): Promise<void[]> {
   return Promise.all(urls.map(url => preloadImage(url).catch(() => { })));
}

/**
 * Check if an image is cached
 */
export function isImageCached(url: string): boolean {
   return imageCache.has(url) || url.startsWith('data:');
}

/**
 * Clear the image cache
 */
export function clearImageCache(): void {
   imageCache.clear();
}

/**
 * Get cache size
 */
export function getCacheSize(): number {
   return imageCache.size;
}
