const CACHE_NAME = 'araise-v2'
const urlsToCache = [
  '/',
  '/dashboard',
  '/workout',
  '/water',
  '/diet',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json'
]

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache')
        return cache.addAll(urlsToCache)
      })
      .then(() => {
        console.log('Service worker installed')
        return self.skipWaiting()
      })
      .catch(error => {
        console.error('Service worker installation failed:', error)
      })
  )
})

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          return response
        }
        
        // Important: Clone the request because it's a stream
        const fetchRequest = event.request.clone()
        
        return fetch(fetchRequest).then(response => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response
          }
          
          // Important: Clone the response because it's a stream
          const responseToCache = response.clone()
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache)
            })
            .catch(error => {
              console.warn('Failed to cache response:', error)
            })
          
          return response
        }).catch(error => {
          console.warn('Fetch failed:', error)
          // Return a fallback page for navigation requests when offline
          if (event.request.destination === 'document') {
            return caches.match('/')
          }
          // Return a generic error response for other requests
          return new Response('Network error', { status: 408, statusText: 'Request Timeout' })
        })
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      console.log('Service worker activated')
      return self.clients.claim()
    })
  )
})

// Handle messages from the main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Background sync for offline data
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered')
    event.waitUntil(doBackgroundSync())
  }
})

function doBackgroundSync() {
  // Sync offline data when connection is restored
  return new Promise(resolve => {
    console.log('Performing background sync...')
    
    // Here you could sync any offline data stored in IndexedDB
    // For now, we'll just resolve
    setTimeout(() => {
      console.log('Background sync completed')
      resolve()
    }, 1000)
  })
}

// Push notification handling
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json()
    
    const options = {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey || 1
      },
      actions: [
        {
          action: 'explore',
          title: 'Open App',
          icon: '/icon-192.png'
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/icon-192.png'
        }
      ]
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Araise', options)
    )
  }
})

// Notification click handling
self.addEventListener('notificationclick', event => {
  console.log('Notification click received.')
  
  event.notification.close()
  
  if (event.action === 'explore') {
    event.waitUntil(clients.openWindow('/'))
  } else if (event.action === 'close') {
    // Just close the notification
  } else {
    // Default action - open the app
    event.waitUntil(clients.openWindow('/'))
  }
})
