'use strict';

self.addEventListener('install', () => {});

self.addEventListener('fetch', (event) => {
  // TODO(dvoytenko): use cache, implement one-behind.
  if (event.request.url.indexOf('amp.html') != -1) {
    // Override response with the shell unless the leaf document is explicitly
    // requested.
    if (event.request.mode === 'navigate') {
      event.respondWith(fetch('/pwa'));
      // Immediately start downloading the actual resource.
      fetch(event.request.url);
    }
  }
});
