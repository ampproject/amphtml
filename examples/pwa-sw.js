'use strict';

console.log('!!!!!! IN SERVICE WORKER !!!!!!');

self.addEventListener('install', event => {
  console.log('SW: install callback');
});

self.addEventListener('fetch', event => {
  if (event.request.url.indexOf('amp.max.html') != -1) {
    const isDirectFetch = event.request.headers.get('AMP-Direct-Fetch') == '1';
    console.log('SW: respond with shell: ', !isDirectFetch);
    if (!isDirectFetch) {
      event.respondWith(fetch('/examples.build/pwa.html'));
    }
  }
});
