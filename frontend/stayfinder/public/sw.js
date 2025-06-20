// Enhanced service worker with image caching + static asset caching
const IMAGE_CACHE_NAME = 'image-cache-v4';
const FALLBACK_AVATAR = '/images/pf.jpg';
const FALLBACK_IMAGE = '/images/pan.jpg';

// List of static assets to cache (update with your actual files)
const STATIC_ASSETS = [
  '/offline.html',
  // Add other JS/CSS/static files your app uses
];

// ===== INSTALL ===== //
self.addEventListener('install', (event) => {
  console.log('[SW] Install event triggered');
  event.waitUntil(
    Promise.all([
      // Cache images
      caches.open(IMAGE_CACHE_NAME).then(cache => {
        console.log('[SW] Pre-caching fallback images');
        return cache.addAll([FALLBACK_AVATAR, FALLBACK_IMAGE]);
      }),
      // Cache static assets
    ]).then(() => {
      console.log('[SW] All resources pre-cached');
      return self.skipWaiting(); // Force active state
    })
  );
});

// ===== ACTIVATE ===== //
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event triggered');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== IMAGE_CACHE_NAME && cache !== STATIC_CACHE_NAME) {
            console.log('[SW] Removing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Claiming clients');
      return clients.claim(); // Control all clients
    })
  );
});

// ===== FETCH ===== //
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and chrome-extension requests
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  const url = new URL(event.request.url);
  const isImage = event.request.destination === 'image' || 
                 /\.(jpg|jpeg|png|gif|webp|avif)(\?.*)?$/i.test(url.pathname);

  // Handle image requests
  if (isImage) {
    console.log(`[SW] Intercepting image request: ${url.href}`);
    event.respondWith(
      handleImageFetch(event)
    );
    return;
  }


  // For API/data requests, you might want to add network-first strategy here
});

// Image fetch handler with cache fallback
async function handleImageFetch(event) {
  const url = new URL(event.request.url);
  
  try {
    const cache = await caches.open(IMAGE_CACHE_NAME);
    const cachedResponse = await cache.match(event.request);
    
    // Return cached image if available
    if (cachedResponse) {
      console.log(`[SW] Serving image from cache: ${url.href}`);
      return cachedResponse;
    }

    // Otherwise fetch from network
    console.log(`[SW] Fetching image from network: ${url.href}`);
    const networkResponse = await fetch(event.request.clone());
    
    // Only cache valid responses
    if (networkResponse && networkResponse.status === 200) {
      console.log(`[SW] Caching new image: ${url.href}`);
      cache.put(event.request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log(`[SW] Network failed (${url.href}), using fallback`);
    return (url.href.includes('avatar') || url.href.includes('profile'))
      ? await caches.match(FALLBACK_AVATAR)
      : await caches.match(FALLBACK_IMAGE);
  }
}

