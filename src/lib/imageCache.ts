// Image caching utility for preloading and caching result images
const imageCache = new Map<string, HTMLImageElement>();

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

export function preloadImages(urls: string[]): Promise<void[]> {
   return Promise.all(urls.map(url => preloadImage(url).catch(() => { })));
}

export function isImageCached(url: string): boolean {
   return imageCache.has(url) || url.startsWith('data:');
}

export function clearImageCache(): void {
   imageCache.clear();
}

export function getCacheSize(): number {
   return imageCache.size;
}
