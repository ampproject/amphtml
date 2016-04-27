export function getMode() {
  return {
    isLocalDev: (location.hostname == 'localhost' ||
      (location.ancestorOrigins && location.ancestorOrigins[0] &&
          location.ancestorOrigins[0].indexOf('http://localhost:') == 0)) &&
      // Filter out localhost running against a prod script.
      // Because all allowed scripts are ours, we know that these can only
      // occur during local dev.
      !!document.querySelector('script[src*="/dist/"],script[src*="/base/"]');
  }
}
