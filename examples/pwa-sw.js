'use strict';

self.addEventListener('install', event => {
});

self.addEventListener('fetch', event => {
  if (event.request.url.indexOf('amp.max.html') != -1) {
    // Override response with the shell unless the leaf document is explicitly
    // requested.
    const isDirectFetch = event.request.headers.get('AMP-Direct-Fetch') == '1';
    if (!isDirectFetch) {
      event.respondWith(fetch('/pwa'));
    }
  }
});
