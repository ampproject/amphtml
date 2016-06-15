'use strict';

console.log('!!!!!! IN SERVICE WORKER !!!!!!');

self.addEventListener('install', event => {
  console.log('SW: install callback');
});

self.addEventListener('fetch', event => {
  console.log('SW: fetch: ', event.request);
});
