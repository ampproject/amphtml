self.addEventListener('fetch', (e) => {
  return fetch(e.request);
});
